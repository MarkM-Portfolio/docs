/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadBase.IOFileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import sun.misc.BASE64Decoder;

import com.ibm.concord.document.services.AttachmentsUtil;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.section.DraftSection;
import com.ibm.concord.draft.section.SectionDescriptor;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.LimitsUtil;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.PutHandler;
import com.ibm.concord.services.rest.util.CsrfHelper;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DraftAttachmentsHandler implements GetHandler, PostHandler, PutHandler
{
  private static final Logger LOG = Logger.getLogger(DraftAttachmentsHandler.class.getName());

  private static final String EDIT_REGEX = "(https?)://([^/]+)/[^/]+/app/(doc)/([^/]+)/([^/]+)/([^/]+)/(.+)";

  private static final Pattern EDIT_PATTERN = Pattern.compile(EDIT_REGEX);

  private static final String ALLOWED_ATTACH_MIME_REGEX = "^(image/.+)$";

  private static final Pattern ALLOWED_ATTACH_MIME_PATTERN = Pattern.compile(ALLOWED_ATTACH_MIME_REGEX);

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    // get document bean
    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while getting attachments.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in getting attachments.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in getting attachments.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOG.log(Level.WARNING, "{0} did not have edit permission on document {1} while getting attachments.", new Object[] { user.getId(),
          uri });
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    JSONObject json = new JSONObject();
    json.put("attachments", AttachmentsUtil.getDraftAttachmentList(user, docEntry));
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    json.serialize(response.getWriter(), true);
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while posting attachments.", uri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + uri + " in posting attachments.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + " in posting attachments.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOG.log(Level.WARNING, "{0} did not have edit permission on document {1} while posting attachments.", new Object[] { user.getId(),
          uri });
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    String method = request.getParameter("method");
    DraftDescriptor dd = DocumentServiceUtil.getDraftDescriptor(user, docEntry);
    JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(dd);
    String draftMime = (String) draftMeta.get(DraftMetaEnum.MIME.getMetaKey());
    IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID)
        .getService(IDocumentServiceProvider.class);
    String docType = serviceProvider.getDocumentType(draftMime);
    if (method == null)
    {
      if (ServletFileUpload.isMultipartContent(request))
      {
        uploadAttachment(request, response, user, docEntry, docType);
        return;
      }
      else
      {
        cleanDraftAttachments(request, response, user, docEntry);
        return;
      }
    }
    else if (method.equalsIgnoreCase("dataUrl"))
    {
      updateDataUrlAttachment(request, response, user, docEntry);
      return;
    }
    else if (method.equalsIgnoreCase("paste"))
    {
      copyDraftAttachment(request, response, user, docEntry);
      return;
    }
    else if (method.equalsIgnoreCase("gallery"))
    {
      copyGalleryAttachment(request, response, user, docEntry, docType);
      return;
    }

    LOG.log(Level.WARNING, "Did not support this method {0}.", method);
    response.sendError(HttpServletResponse.SC_BAD_REQUEST);
  }

  private void updateDataUrlAttachment(HttpServletRequest request, HttpServletResponse response, UserBean user, IDocumentEntry docEntry)
      throws IOException, FileNotFoundException, Exception
  {
    InputStream is = request.getInputStream();
    byte[] data = new byte[44];
    BufferedInputStream bis = new BufferedInputStream(is);
    if (bis.read(data, 0, 11) != -1)
    {
      String header = new String(data, 0, 11);
      if (header.equalsIgnoreCase("data:image/"))
      {
        byte[] b = new byte[1];
        String sb = new String();
        while (bis.read(b, 0, 1) != -1)
        {
          if (b[0] == ',')
            break;
          sb += new String(b, 0, 1);
        }
        String imageType = sb.toString();
        String[] strings = imageType.split(";");
        if (strings.length == 2 && strings[1].equals("base64"))
        {
          String type = strings[0];

          BASE64Decoder decoder = new BASE64Decoder();
          String fileName = generateNewFileName("." + type);
          // put to temporary file
          File f = File.createTempFile("att-upload", "data");
          FileOutputStream os = new FileOutputStream(f);
          decoder.decodeBuffer(bis, os);
          os.close();

          if (!f.exists())
          {
            // virus detected
            LOG.log(Level.WARNING,
                "File " + fileName + " was not uploaded because it is infected with a virus or is empty: " + user.getId());
            response.sendError(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
            return;
          }
          FileInputStream fis = new FileInputStream(f);
          if (AttachmentsUtil.isPreservedFileName(docEntry, fileName))
          {
            response.sendError(HttpServletResponse.SC_NOT_MODIFIED);
            return;
          }

          fileName = "Pictures/" + fileName;
          String attURL = AttachmentsUtil.uploadAttachment(user, docEntry, fileName, fis);
          fis.close();
          if (f.exists())
          {
            f.delete();
          }
          JSONObject json = new JSONObject();
          json.put("name", fileName);
          json.put("uri", attURL);

          response.setContentType("text/html");
          response.setCharacterEncoding("UTF-8");
          json.serialize(response.getWriter(), true);
          response.setStatus(HttpServletResponse.SC_CREATED);

        }
      }
      else
      {
        response.sendError(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
        return;
      }
    }
    else
    {
      LOG.log(Level.WARNING, "Invalid request while uploading dataurl attachment.");
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
    }
  }

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    doPost(request, response);
  }

  private boolean validateUploadContentType(String mimeType)
  {
    if (ALLOWED_ATTACH_MIME_PATTERN.matcher(mimeType.trim()).matches())
      return true;

    return false;
  }

  private void uploadAttachment(HttpServletRequest request, HttpServletResponse response, UserBean caller, IDocumentEntry docEntry,
      String type) throws Exception
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
        LOG.logp(Level.SEVERE, DraftAttachmentsHandler.class.getName(), "uploadAttachment",
            "IOFileUploadException throwed when parseRequest");
        JSONObject json = new JSONObject();
        json.put("msg", "insert_image_server_error");
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

      IDocumentService docSrv = DocumentServiceUtil.getDocumentServiceByType(type);
      for (Object item : items)
      {
        FileItem fileItem = (FileItem) item;

        String mimeType = fileItem.getContentType();
        if (!validateUploadContentType(mimeType))
        {
          LOG.logp(Level.SEVERE, DraftAttachmentsHandler.class.getName(), "uploadAttachment", mimeType + " is not allowed to be uploaded");
          throw new RuntimeException(mimeType + " is not allowed to be uploaded");
        }

        try
        {
          String name = fileItem.getName();
          String ext = name.substring(name.lastIndexOf("."));
          if (!(ext.equalsIgnoreCase(".bmp") || ext.equalsIgnoreCase(".jpg") || ext.equalsIgnoreCase(".jpeg")
              || ext.equalsIgnoreCase(".gif") || ext.equalsIgnoreCase(".png")))
          {
            LOG.logp(Level.SEVERE, DraftAttachmentsHandler.class.getName(), "uploadAttachment", name + " is not allowed to be uploaded");
            throw new RuntimeException(mimeType + " is not allowed to be uploaded");
          }
        }
        catch (Exception e)
        {
          LOG.logp(Level.SEVERE, DraftAttachmentsHandler.class.getName(), "uploadAttachment", "Getting file extension error");
          throw e;
        }

        if (!fileItem.isFormField())
        {
          JSONObject json = new JSONObject();
          JSONObject limits = (JSONObject) docSrv.getConfig().get("limits");
          if (LimitsUtil.exceedImageSizeLimit(fileItem.getSize(), limits))
          {
            // upload image is too large
            LOG.log(Level.WARNING, "image file is too large to upload: " + caller.getId());
            json.put("msg", limits.get("max-image-size"));
            jArray.add(json);
            continue;
          }
          InputStream is = fileItem.getInputStream();
          String fileName = fileItem.getName();
          int index = fileName.lastIndexOf("\\");
          if (index == -1)
          {
            index = fileName.lastIndexOf("/");
          }
          if (index > -1)
          {
            fileName = fileName.substring(index + 1);
          }
          fileName = generateNewFileName(fileName);
          // put to temporary file
          File f = File.createTempFile("att-upload", "data");
          FileUtil.copyInputStreamToFile(is, f);
          if (!f.exists())
          {
            // virus detected
            LOG.log(Level.WARNING,
                "File " + fileName + " was not uploaded because it is infected with a virus or is empty: " + caller.getId());
            response.sendError(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
            return;
          }

          if (!AttachmentsUtil.validateImage(f))
          {
            LOG.log(Level.WARNING, "File " + fileName + " was not uploaded because it is not a valid image: " + caller.getId());
            response.sendError(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
            return;
          }

          FileInputStream fis = new FileInputStream(f);
          if (AttachmentsUtil.isPreservedFileName(docSrv, fileName))
          {
            response.sendError(HttpServletResponse.SC_NOT_MODIFIED);
            return;
          }

          fileName = "Pictures/" + fileName;
          String attURL = AttachmentsUtil.uploadAttachment(caller, docEntry, fileName, fis);
          fis.close();
          if (f.exists())
          {
            f.delete();
          }

          json.put("name", fileName);
          json.put("url", attURL);
          jArray.add(json);
        }
      }

      attchListJson.put("attachments", jArray);
      String s = attchListJson.toString();
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

  private String generateNewFileName(String fileName)
  {
    String randomId = ConcordUtil.generateTaskId();
    int index = fileName.lastIndexOf('.');
    if (index != -1)
    {
      String ext = fileName.substring(index + 1, fileName.length());
      return randomId + "." + ext;
    }
    else
    {
      return randomId;
    }
  }

  private void copyGalleryAttachment(HttpServletRequest request, HttpServletResponse response, UserBean caller, IDocumentEntry docEntry,
      String type) throws Exception
  {
    JSONArray jArray = new JSONArray();
    BufferedReader reader = request.getReader();
    JSONArray jBody = JSONArray.parse(reader);

    for (int i = 0; i < jBody.size(); i++)
    {
      JSONObject jdata = (JSONObject) jBody.get(i);
      String source = (String) jdata.get("data");
      String filename = source.substring(source.lastIndexOf("/") + 1);
      ServletContext sc = Platform.getServletContext();
      source = sc.getRealPath("/") + File.separator + source;

      String attURL = null;

      FileInputStream fis = null;
      try
      {
        fis = new FileInputStream(source);
        DraftDescriptor draftDesp = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
        SectionDescriptor sectionDesp = new SectionDescriptor(draftDesp, DraftSection.getPictureSection(filename));

        DraftStorageManager.getDraftStorageManager().storeSection(sectionDesp, fis);

        if (type.equals("pres"))
          attURL = ("Pictures/" + filename);
        else
          attURL = filename;
      }
      catch (ConcordException e)
      {
        LOG.log(Level.SEVERE, "failed to access draft", e);
        response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      }
      finally
      {
        if (fis != null)
        {
          fis.close();
        }
      }
      JSONObject json = new JSONObject();
      json.put("url", attURL);
      jArray.add(json);
    }

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_CREATED);
    response.getWriter().write(jArray.toString());
  }

  private void cleanDraftAttachments(HttpServletRequest request, HttpServletResponse response, UserBean caller, IDocumentEntry docEntry)
      throws Exception
  {
    JSONObject json = JSONObject.parse(request.getReader());
    JSONArray attchments = (JSONArray) json.get("attachemnts");
    int attSize = attchments.size();
    List<String> keptList = new ArrayList<String>(attSize);
    for (int i = 0; i < attSize; i++)
    {
      JSONObject obj = (JSONObject) attchments.get(i);
      keptList.add((String) obj.get("name"));
    }

    AttachmentsUtil.cleanDraftAttachments(caller, docEntry, keptList);
    response.setStatus(HttpServletResponse.SC_OK);
  }

  private void copyDraftAttachment(HttpServletRequest request, HttpServletResponse response, UserBean caller, IDocumentEntry toDoc)
      throws Exception
  {
    JSONObject json = JSONObject.parse(request.getReader());
    String mediaUri = (String) json.get("uri");
    Matcher matcher = EDIT_PATTERN.matcher(mediaUri);
    Matcher result = matcher.matches() ? matcher : null;
    if (result == null)
    {
      LOG.log(Level.WARNING, "Invalid media uri {0}.", mediaUri);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    String srcRepoId = result.group(4);
    String srcUri = result.group(5);

    String attName = result.group(7);

    // check authorization of source document
    IDocumentEntry fromDoc = null;
    try
    {
      fromDoc = DocumentEntryUtil.getEntry(caller, srcRepoId, srcUri, true);
      if (fromDoc == null)
      {
        LOG.log(Level.WARNING, "Did not find the entry of document {0} while copying attachment.", srcUri);
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Access exception happens while getting the entry of document " + srcUri + " in copying attachment.", e);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Exception happens while getting the entry of document " + srcUri + " in copying attachment.", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!Permission.EDIT.hasPermission(fromDoc.getPermission()))
    {
      LOG.log(Level.WARNING, "{0} did not have edit permission on document {1} while copying attachment.", new Object[] { caller.getId(),
          srcUri });
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    String newUri = attName;
    if (!toDoc.getDocUri().equalsIgnoreCase(fromDoc.getDocUri()))
    {
      newUri = AttachmentsUtil.copyDraftAttachment(caller, toDoc, fromDoc, attName);
      if (newUri == null)
      {
        LOG.log(Level.WARNING, "Failed to copy draft attachment {0} from doc {1} to doc {2}.", new Object[] { attName, fromDoc.getDocUri(),
            toDoc.getDocUri() });
        response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        return;
      }
    }

    json.put("uri", newUri);
    response.setStatus(HttpServletResponse.SC_OK);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    json.serialize(response.getWriter(), true);
  }
}
