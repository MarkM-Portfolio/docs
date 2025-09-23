/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.reposvr;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import sun.misc.BASE64Decoder;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.document.services.DocumentURLBuilder;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.ConvertRepositoryMediaContext;
import com.ibm.concord.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.job.object.ConvertRepositoryMediaJob;
import com.ibm.concord.job.object.ImportDraftFromRepositoryJob;
import com.ibm.concord.log.ConcordErrorCode;
import com.ibm.concord.log.ConcordLogger;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONObject;

public class UploadAction
{
  private static final Logger LOG = Logger.getLogger(UploadAction.class.getName());
  
  private static final String CLASS_NAME = UploadAction.class.getName();
  
  private static final String CONTENT_TYPE = "Content-Type";

  private static final String SLUG = "Slug";

  private boolean async;

  private UserBean user;

  private String action ="";
  
  private Map<String, Object> options;
  
  public UploadAction(UserBean user, String action, boolean async, Map<String, Object> options)
  {
    this.user = user;
    this.action = action;
    this.async = async;
    this.options = options;
  }

  public void exec(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    if (!ServletFileUpload.isMultipartContent(request))
    {
      doSingleFileUpload(request, response);
    }
    else
    {
      doMultiFileUpload(request, response);
    }
  }
  
  private void doMultiFileUpload(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    LOG.entering(CLASS_NAME, "doMultiFileUpload");
    ServletFileUpload upload = new ServletFileUpload(new DiskFileItemFactory());
    List<FileItem> fileItems = new ArrayList<FileItem>();
    try
    {
      fileItems = upload.parseRequest(request);
    }
    catch (FileUploadException e)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.MULTIFILE_UPLOAD_ERROR, "fail to upload file!", e);
      JSONObject result = new JSONObject();
      result.put("status", HttpServletResponse.SC_EXPECTATION_FAILED);
      result.put("error_msg", e.getMessage());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      result.serialize(response.getOutputStream());
      return;
    }
    String asFormat = request.getParameter("asFormat");
    Iterator<FileItem> iter = fileItems.iterator();
    for (; iter.hasNext();)
    {
      FileItem fileItem = (FileItem) iter.next();
      if (fileItem.isFormField())
      {
        if (LOG.isLoggable(Level.FINER))
          LOG.finer("form field : " + fileItem.getFieldName() + ", " + fileItem.getString());
      }
      else
      {
        String fileName = fileItem.getName();
        if (!fileName.equals(""))
        {
          File tmp = null;
          MediaDescriptor media = null;
          try
          {
            tmp = File.createTempFile("fileupload", "tmp");
            FileUtil.copyInputStreamToFile(fileItem.getInputStream(), tmp);
            media = new TempfileDescriptor(fileName, fileItem.getContentType(), new FileInputStream(tmp), tmp.getPath());
            JSONObject result = upload(media, asFormat);
            media.dispose();
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            result.serialize(response.getOutputStream());
          }
          catch(Exception e)
          {
            ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.MULTIFILE_UPLOAD_ERROR, "unknown exception", e);
            JSONObject result = new JSONObject();
            result.put("status", HttpServletResponse.SC_EXPECTATION_FAILED);
            result.put("error_msg", e.getMessage());
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            result.serialize(response.getOutputStream());
            return;
          }
          finally
          {
            if(media != null)
            {
              media.dispose();  
            }
            if(tmp != null)
            {
              tmp.delete();  
            }
          }
        }
        else
        {
          response.setStatus(HttpServletResponse.SC_NO_CONTENT);
          if (LOG.isLoggable(Level.FINER))
            LOG.finer("file name is empty!");
        }
      }
    }
    LOG.exiting(CLASS_NAME, "doMultiFileUpload");
  }

  private void doSingleFileUpload(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    LOG.entering(CLASS_NAME, "doSingleFileUpload");
    // maybe be added charset= utf8,so remove it
    String contentType = request.getHeader(CONTENT_TYPE);
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer(" not multipart content! ");
      LOG.finer(" Url = " + request.getRequestURL());
      LOG.finer(" Slug =" + request.getHeader(SLUG));
      LOG.finer("orignal mime type = " + contentType);
    }
    int index;
    if ((index = contentType.indexOf(";")) != -1 && contentType.indexOf("charset=") != -1)
    {
      contentType = contentType.substring(0, index);
      if (LOG.isLoggable(Level.FINER))
        LOG.finer("contentType = " + contentType);
    }
    // create temp file to store input data
    File tmp = null;
    MediaDescriptor media = null;
    try
    {
      tmp = File.createTempFile("fileupload", "tmp");
      FileUtil.copyInputStreamToFile(request.getInputStream(), tmp);
      media = new TempfileDescriptor(request.getHeader(SLUG), request.getHeader(CONTENT_TYPE), new FileInputStream(tmp), tmp
          .getPath());
      String asFormat = request.getParameter("asFormat");
      JSONObject result = upload(media, asFormat);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      result.serialize(response.getOutputStream());      
    }
    catch(IOException e)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.SINGLE_FILE_UPLOAD_ERROR, "io error when do single file upload", e);
      JSONObject result = new JSONObject();
      result.put("status", HttpServletResponse.SC_EXPECTATION_FAILED);
      result.put("error_msg", e.getMessage());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      result.serialize(response.getOutputStream());
      return;
    }
    finally
    {
      if(media != null)
      {
        media.dispose();  
      }
      if(tmp != null)
      {
        tmp.delete();  
      }
    }
    LOG.exiting(CLASS_NAME, "doSingleFileUpload");
  }
  
  private JSONObject upload(MediaDescriptor media, String asFormat)
  {
    JSONObject result = new JSONObject();
    
    URLConfig config = URLConfig.toInstance();
    // to decode the rfc format
    String filename = media.getTitle();

    String prefix = "=?UTF-8?B?";
    String suffix = "?=";
    if (filename.toUpperCase().startsWith(prefix) && filename.endsWith(suffix))
    {
      // RFC 2045, base64 format
      String content = filename.substring(prefix.length(), filename.length() - suffix.length());
      BASE64Decoder decoder = new BASE64Decoder();
      try
      {
        byte[] b = decoder.decodeBuffer(content);
        media.setTitle(new String(b));
      }
      catch (IOException e)
      {
        ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.UPLOAD_ERROR, "io error when decoding content from header", e);
      }
      if (LOG.isLoggable(Level.FINER))
        LOG.finer("parse base64 format filename =" + media.getTitle());
    }
    
    try
    {
      String repository = RepositoryServiceUtil.getDefaultRepositoryId();
      IDocumentEntry docEntry = RepositoryServiceUtil.upload(user, repository, media);
      /**
       * Fix empty permission problem. We can not use IDocumentEntry from upload action but to 
       * retrieve them from server again to get correct permission set
       */
      docEntry = DocumentEntryUtil.getEntry(user, repository, docEntry.getDocUri(), true);
      if (docEntry == null)
      {
        result.put("status", "error");
        result.put("statusCode", HttpServletResponse.SC_NOT_FOUND);
        result.put("error_msg", "file not found");
        media.dispose();
        return result;
      }
      IDocumentService service = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
      if(service == null)
      {
        result.put("status", "error");
        result.put("statusCode", HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
        result.put("error_msg", "unsupported document type for " + docEntry.getDocUri());
        media.dispose();
        return result;
      }
      String asFormatMime = null;
      if (asFormat == null)
      {
        asFormatMime = Platform.getMimeType(".html");
      }
      else {
        asFormatMime = Platform.getMimeType("." + asFormat);
      }
      if(action.equals("edit"))
      {
        if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
        {
          result.put("status", "error");
          result.put("statusCode", HttpServletResponse.SC_FORBIDDEN);
          result.put("error_msg", "edit permission is not allowed for " + docEntry.getDocUri());
          return result;
        }
        
        IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
            DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);
        ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();
        jContext.mediaURI = docEntry.getDocUri();
        jContext.sourceMime = docEntry.getMimeType();
        jContext.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
        jContext.modified = docEntry.getModified().getTimeInMillis();
        jContext.requester = user;
        jContext.docEntry = docEntry;
        jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), jContext.getJobId())));

        Job importMediaJob = new ImportDraftFromRepositoryJob(jContext);
        importMediaJob.config = config;
        if (async)
        {
          String jobId = importMediaJob.schedule();
          result.put("status", "pending");
          result.put("jobId", jobId);
          result.put("docUri", docEntry.getDocUri());
          result.put("repository", docEntry.getRepository());  
        }
        else
        {
          importMediaJob.run();
          restoreURLConfig(config);
          result.put("status", "complete");
          result.put("statusCode", HttpServletResponse.SC_CREATED);
          result.put("url", DocumentURLBuilder.getEditDocumentURI(docEntry));
          result.put("docUri", docEntry.getDocUri());
          result.put("repository", docEntry.getRepository());
          result.put("mode", "edit");
        }
      }
      else if(action.equals("view"))
      {
        if (!Permission.VIEW.hasPermission(docEntry.getPermission()))
        {
          result.put("status", "error");
          result.put("statusCode", HttpServletResponse.SC_FORBIDDEN);
          result.put("error_msg", "view permission is not allowed for " + docEntry.getDocUri());
          return result;
        }
        ConvertRepositoryMediaContext jContext = new ConvertRepositoryMediaContext();
        jContext.mediaURI = docEntry.getDocUri();
        jContext.sourceMime = docEntry.getMimeType();
        jContext.targetMime = asFormatMime;
        jContext.modified = docEntry.getModified().getTimeInMillis();
        jContext.options = options;

        jContext.requester = user;
        jContext.docEntry = docEntry;

        File workingDir = new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), jContext.getJobId()));
        jContext.setWorkingDir(workingDir);
        Job convertRepoMediaJob = new ConvertRepositoryMediaJob(jContext);
        convertRepoMediaJob.config = config;
        if(async)
        {
          String jobId = convertRepoMediaJob.schedule();
          result.put("status", "pending");
          result.put("jobId", jobId);
          result.put("docUri", docEntry.getDocUri());
          result.put("repository", docEntry.getRepository());
          result.put("mode", "view");
        }
        else
        {
          convertRepoMediaJob.run();
          restoreURLConfig(config);
          result.put("status", "complete");
          result.put("statusCode", HttpServletResponse.SC_CREATED);
          result.put("url", DocumentURLBuilder.getViewDocumentURI(docEntry));
          result.put("docUri", docEntry.getDocUri());
          result.put("repository", docEntry.getRepository());   
        }
      }
    }
    catch (RepositoryAccessException e)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.UPLOAD_ERROR, "can not access repository files", e);
      result.put("status", "error");
      result.put("statusCode", e.getErrCode());
      result.put("error_msg", e.getMessage());
    }
    catch (Exception e)
    {
      ConcordLogger.log(LOG, Level.SEVERE, ConcordErrorCode.UPLOAD_ERROR, "unknown exception when upload document", e);
      result.put("status", "error");
      result.put("statusCode", HttpServletResponse.SC_EXPECTATION_FAILED);
      result.put("error_msg", e.getMessage());
    }
    return result;
  }
  
  private void restoreURLConfig(URLConfig config)
  {
    URLConfig.fromInstance(config);
  }
}
