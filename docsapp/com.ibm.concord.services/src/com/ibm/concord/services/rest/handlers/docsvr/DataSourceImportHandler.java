package com.ibm.concord.services.rest.handlers.docsvr;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadBase.IOFileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import com.ibm.concord.document.services.AttachmentsUtil;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.LimitsUtil;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.util.CsrfHelper;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.draft.IDraftStorageAdapter;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DataSourceImportHandler implements PostHandler
{

  private static final Logger LOG = Logger.getLogger(DataSourceImportHandler.class.getName());
  
  private static String StreamMIME = "application/octet-stream";
  private static String CSVMIME = "text/csv";
  // for defect 20380, it happens that such mimetype uploads to server
  private static String APPLICATIONCSVMIME = "application/csv";
  private static String TEXTMIME = "text/plain";
  
  private static String EXCELTMIME = "application/vnd.ms-excel";
  
  
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, false);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while posting attachments.", uri);
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        sendErrorMessage(response);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in posting attachments.", e);
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      sendErrorMessage(response);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in posting attachments.", e);
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
      sendErrorMessage(response);
      return;
    }

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOG.log(Level.WARNING, "{0} did not have edit permission on document {1} while posting attachments.", new Object[]{user.getId(), uri});
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      sendErrorMessage(response);
      return;
    }

    String repo = request.getParameter("repo");
    boolean isFromRepositry = false;
    if( null != repo)
      isFromRepositry = Boolean.parseBoolean(repo);

    if(isFromRepositry)
      parseFileFromRepositry(request, response, user, docEntry);
    else
      parseFileFromUpload(request, response, user, docEntry, DocumentServiceUtil.getDocumentType(docEntry));
  }

  private void parseFileFromRepositry(HttpServletRequest request, HttpServletResponse response,UserBean caller, IDocumentEntry docEntry) throws RepositoryAccessException, IOException
  {
    File f = null;
    File tmp = null;
    JSONObject attchListJson = new JSONObject();
    JSONArray jArray = new JSONArray();
    FileInputStream fis = null;
    boolean isFinished = false;
    try
    {
      MediaDescriptor media = RepositoryServiceUtil.download(caller, docEntry);
      InputStream is = media.getStream();
      String fileName = docEntry.getDocUri();
      int index = fileName.lastIndexOf("\\");
      if(index == -1){
        index = fileName.lastIndexOf("/");
      }
      if(index>-1){
        fileName = fileName.substring(index+1);
      }
      fileName = generateNewFileName(fileName);
      // put to temporary file
      f = File.createTempFile("att-upload", "data");
      FileUtil.copyInputStreamToFile(is, f);
      if (!f.exists())
      {
        // virus detected
        LOG.log(Level.WARNING, "File " + fileName + " was not uploaded because it is infected with a virus or is empty: " + caller.getId());
        response.sendError(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
        return;
      }
      fis = new FileInputStream(f);
      String attURL = uploadAttachment(response, caller,docEntry, fileName, fis);
      tmp = new File(attURL);
      CSVParser parser = new CSVParser();
      String param = request.getParameter("separator");
      JSONObject content = parser.parse(tmp, param);

      String s = content.toString();
      s = "<html><body><textarea>" + s + "</textarea></body></html>";
      response.setContentType("text/html");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_CREATED);
      response.getWriter().write(s);
      isFinished = true;
    }
    catch(IOException e)
    {
      LOG.logp(Level.SEVERE, DataSourceImportHandler.class.getName(), "copyFileFromRepositry", "IOException throwed when parseRequest");
      JSONObject json = new JSONObject();
      json.put("msg", "insert_file_server_error");
      jArray.add(json);
      attchListJson.put("attachments", jArray);
      String s = attchListJson.toString();
      s = "<html><body><textarea>" + s + "</textarea></body></html>";
      response.setContentType("text/html");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      response.getWriter().write(s);
      isFinished = false;
      throw e;
    }
    finally
    {
      if(fis != null)
      {
        fis.close();
      }
      if(tmp != null && tmp.exists())
      {
        FileUtil.cleanDirectory(tmp);
      }
      FileInputStream mis = null;
      FileOutputStream mos = null;
      
      try
      {
        DraftDescriptor draftDesp = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
        File metaFilePath = new File(draftDesp.getURI(), "meta.js");
        mis = new FileInputStream(metaFilePath);
        JSONObject meta = JSONObject.parse(mis);
        meta.put("csv", isFinished);
        mos = new FileOutputStream(metaFilePath);
        meta.serialize(mos);
      }
      catch(Exception e)
      {
        LOG.logp(Level.SEVERE, DataSourceImportHandler.class.getName(), "copyFileFromRepositry", "output csv flag to meta.js error", e);
      }
      finally
      {
        if( null != mis)
          mis.close();
        if( null != mos )
          mos.close();
      }
    }
    
  }
  
  private void parseFileFromUpload(HttpServletRequest request, HttpServletResponse response, UserBean caller, IDocumentEntry docEntry, String type) throws Exception
  {
    if (ServletFileUpload.isMultipartContent(request))
    {
      JSONObject attchListJson = new JSONObject();
      JSONArray jArray = new JSONArray();
      ServletFileUpload upload = new ServletFileUpload(new DiskFileItemFactory());
      List<?> items = null;
      try
      {
        items = upload.parseRequest(request);
      }
      catch (IOFileUploadException e)
      {
        LOG.logp(Level.SEVERE, DataSourceImportHandler.class.getName(), "parseFileFromUpload", "IOFileUploadException throwed when parseRequest");
        JSONObject json = new JSONObject();
        json.put("msg", "insert_file_server_error");
        jArray.add(json);
        attchListJson.put("attachments", jArray);
        String s = attchListJson.toString();
        s = "<html><body><textarea>" + s + "</textarea></body></html>";
        response.setContentType("text/html");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        response.getWriter().write(s);
        return;
      }

      CsrfHelper.handleCsrfFormToken(caller, items, request, response);
      
      IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
      JSONObject content = null;
      for (Object item : items)
      {
        FileItem fileItem = (FileItem) item;
        
        String mimeType = fileItem.getContentType();
        
        if( null == mimeType )
          continue;
        
        if (!validateUploadContentType(mimeType))
        {
          LOG.logp(Level.SEVERE, DataSourceImportHandler.class.getName(), "uploadAttachment", mimeType + " is not allowed to be uploaded");
          throw new RuntimeException(mimeType + " is not allowed to be uploaded");
        }
        
        try
        {
          String name = fileItem.getName();
          if(!"".equals(name))
          {
            String ext = name.substring(name.lastIndexOf("."));
            if (!(ext.equalsIgnoreCase(".csv") || ext.equalsIgnoreCase(".txt")))
            {
              LOG.logp(Level.SEVERE, DataSourceImportHandler.class.getName(), "uploadAttachment", name + " is not allowed to be uploaded");
              throw new RuntimeException(mimeType + " is not allowed to be uploaded");
            }
          }
        }
        catch (Exception e)
        {
          LOG.logp(Level.SEVERE, DataSourceImportHandler.class.getName(), "uploadAttachment", "Getting file extension error", e);
          throw e;
        }
        
        
        if (!fileItem.isFormField())
        {
          JSONObject limits = (JSONObject) docSrv.getConfig().get("limits");
          if(LimitsUtil.exceedTextFileSizeLimit(fileItem.getSize(), limits))
          {
            // upload Text File is too large
            LOG.log(Level.WARNING, "text file is too large to upload: " + caller.getId());
            // This should be a error 4xx response. But set such response will make IE fail with "access denied" for iframe.send
            // so use a successful response.
            response.setStatus(HttpServletResponse.SC_CREATED);
            sendErrorMessage(response, "size_exceeded");
            return;
          }  
          File f = null;
          File tmp = null;
          FileInputStream fis = null;
          try
          {
            InputStream is = fileItem.getInputStream();
            String fileName = fileItem.getName();
            int index=fileName.lastIndexOf("\\");
            if(index==-1){
              index=fileName.lastIndexOf("/");
            }
            if(index>-1){
              fileName=fileName.substring(index+1);
            }
            fileName = generateNewFileName(fileName);
            // put to temporary file
            f = File.createTempFile("att-upload", "data");
            FileUtil.copyInputStreamToFile(is, f);
            if (!f.exists())
            {
              // virus detected
              LOG.log(Level.WARNING, "File " + fileName + " was not uploaded because it is infected with a virus or is empty: " + caller.getId());
              response.sendError(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
              return;
            }
            
            fis = new FileInputStream(f);
            
            if (AttachmentsUtil.isPreservedFileName(docEntry, fileName))
            {
              response.sendError(HttpServletResponse.SC_NOT_MODIFIED);
              return;
            }
            String attURL = uploadAttachment(response, caller,docEntry, fileName, fis);
            tmp = new File(attURL);
            CSVParser parser = new CSVParser();
            String param = request.getParameter("separator");
            content = parser.parse(tmp, param);
          }
          catch(IOException e)
          {
            throw e;
          }
          finally
          {
            if(fis != null)
              fis.close();
            if(tmp != null && tmp.exists())
            {
              FileUtil.cleanDirectory(tmp);   
            }
          }
        }
      }
      String s = content.toString();
      s = "<html><body><textarea>" + s + "</textarea></body></html>";
      response.setContentType("text/html");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_CREATED);
      response.getWriter().write(s);
    }
    else
    {
      LOG.log(Level.WARNING, "Invalid request while uploading attachment.");
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
    }    
  }
  
  
  private String uploadAttachment(HttpServletResponse response,UserBean caller, IDocumentEntry docEntry,String fileName, FileInputStream fis )
  {
    String id = UUID.randomUUID().toString();
    DraftDescriptor draftDesp = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
    String uid =  id + IDraftStorageAdapter.separator + fileName ;
    String path = draftDesp.getTempURI(null) + IDraftStorageAdapter.separator + uid;
    File tempCSV = new File(path);
    FileUtil.nfs_mkdirs(tempCSV.getParentFile(), FileUtil.NFS_RETRY_SECONDS);
    try
    {
      if(!tempCSV.exists())
        tempCSV.createNewFile();
      FileOutputStream output = new FileOutputStream(tempCSV);
      FileUtil.copyInputStreamToOutputStream(fis, output);
    }
    catch (FileNotFoundException e)
    {
      LOG.logp(Level.SEVERE, DataSourceImportHandler.class.getName(), "uploadAttachment", "FileNotFoundException throwed when parseRequest");
    }
    catch (IOException e)
    {
      LOG.logp(Level.SEVERE, DataSourceImportHandler.class.getName(), "uploadAttachment", "IOException throwed when parseRequest");
    }
    return tempCSV.getPath();
  }
  
  private boolean validateUploadContentType(String mimeType)
  {
    if(CSVMIME.equals(mimeType) || TEXTMIME.equals(mimeType) || EXCELTMIME.equals(mimeType) || StreamMIME.equals(mimeType) || APPLICATIONCSVMIME.equals(mimeType))
      return true;
    
    return false;  
  }
  
  private String generateNewFileName(String fileName)
  {
    String randomId = ConcordUtil.generateTaskId();
    int index = fileName.lastIndexOf('.');
    if(index != -1)
    {
      String ext = fileName.substring(index + 1, fileName.length());
      return randomId + "." + ext;
    }
    else
    {
      return randomId; 
    }
  }
  
  private void sendErrorMessage(HttpServletResponse response) throws IOException
  {
    sendErrorMessage(response, "insert_file_server_error");
  }

  private void sendErrorMessage(HttpServletResponse response, String msg) throws IOException
  {
    String s = "<html><body><textarea>{\"msg\":\"" + msg + "\"}</textarea></body></html>";
    response.setContentType("text/html");
    response.setCharacterEncoding("UTF-8");
    response.getWriter().write(s);
  }
}

