/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.viewer.services.rest.thumbnails;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.spi.impl.ThumbnailDescriptor;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.RepositoryComponent;
import com.ibm.concord.viewer.platform.repository.RepositoryProviderRegistry;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.services.fileUtil.LockUtil;
import com.ibm.concord.viewer.services.rest.GetHandler;
import com.ibm.concord.viewer.services.rest.PostHandler;
import com.ibm.concord.viewer.services.rest.handlers.job.PostThumbnailJob;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.docs.viewer.ecm.repository.ECMDocumentEntry;
import com.ibm.docs.viewer.ecm.repository.ECMRepository;
import com.ibm.json.java.JSONObject;
import com.ibm.xml.enc.dom.Base64;

public class ThumbnailsHandler implements GetHandler, PostHandler
{

  public static final String THUMBNAILS_SIZEJSON_FILENAME = "size.json";

  public static final String FULLIMAGE = "pictures";

  public static final String PREVIEW = "preview";

  private static final Logger LOGGER = Logger.getLogger(ThumbnailsHandler.class.toString());

  private static final String JSON_KEY_FORMAT = "format";

  private static final String BASE64_IMAGE_DESCRIPTOR = "data:image/{0};base64";

  private static final String REPONSE_CONTENT_TYPE = "image/{0}";

  private static final String DEFAULT_IMAGE_FORMAT = ".png";

  private static final String THUMBNAIL_SERVICE_DIR = "thumbnailService";

  private static final String CCM_PREVIEW = "ccm_preview";

  private static final String VERSION_TYPE_VALUE_DRAFT = "Draft";

  private static final String VERSION_TYPE_KEY = "Version_Type";

  private static final String VERSION_TYPE_VALUE_MAJOR = "Major";

  private static final String DOCUMENT = "docId";

  private LockUtil lock = new LockUtil();

  private static ECMRepository ecmAdapter;

  static
  {
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
        RepositoryServiceUtil.ECM_FILES_REPO_ID);
    ecmAdapter = (ECMRepository) service.getRepository(RepositoryServiceUtil.ECM_FILES_REPO_ID);
  }

  private enum ResponseFormat {
    PLAIN_TEXT("text/plain"), JSON("application/json");

    String contentType;

    ResponseFormat(String type)
    {
      this.contentType = type;
    }

    String getValue()
    {
      return this.contentType;
    }
  }

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");    
    String repoType = pathMatcher.group(1);
    String docUri = pathMatcher.group(2);
    String g3 = pathMatcher.group(3);
    String imgSize = "large";
    if( g3 != null )
    {
      imgSize = g3;
    }
    String vSeriesIds = request.getParameter("vids");
    String format = request.getParameter("format");

    // currently only support ccm and toscana integration
    if (!repoType.equalsIgnoreCase(RepositoryServiceUtil.ECM_FILES_REPO_ID) &&
        !repoType.equalsIgnoreCase(RepositoryServiceUtil.TOSCANA_REPO_ID))
      return;

    String preName = "";
    if (imgSize.equalsIgnoreCase("small"))
    {
      preName = "ts_image";
    }
    else if (imgSize.equalsIgnoreCase("medium"))
    {
      preName = "tm_image";
    }
    else if (imgSize.equalsIgnoreCase("large"))
    {
      preName = "tl_image";
    }

    ResponseFormat respFormat = ResponseFormat.PLAIN_TEXT;
    if (format != null && format.equalsIgnoreCase(ResponseFormat.JSON.name()))
    {
      respFormat = ResponseFormat.JSON;
    }

    if (vSeriesIds != null)
    {
      processBatchRequests(response, user, docUri, imgSize, vSeriesIds, preName, respFormat);
    }
    else
    {
      if(repoType.equalsIgnoreCase(RepositoryServiceUtil.TOSCANA_REPO_ID))
      {
        processToscanaSingleRequest(request, response, user, docUri, imgSize, preName);        
      }
      else
      {
        processSingleRequest(request, response, user, docUri, imgSize, preName);
      }
    }
  }
  
  private void processToscanaSingleRequest(HttpServletRequest request, HttpServletResponse response, UserBean user, String docUri, String imgSize,
      String preName)
  {

    IDocumentEntry docEntry = null;

    try
    {
      docEntry = RepositoryServiceUtil.getEntry(user, RepositoryServiceUtil.TOSCANA_REPO_ID, docUri, "", true);           
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Access exception happens while getting the entry of document " + docUri + " in toscana get thumbnail process.", e);
      response.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);
      return;
    }    
    
    ThumbnailService thums = new ThumbnailService4Doc(user, docEntry);
    if (!thums.isThumbnailsExisted())
    {
      thums.exec();
    }        
    else
    {
      ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();
      jContext.modified = docEntry.getModified().getTimeInMillis();
      jContext.mediaURI = docEntry.getDocUri();
      jContext.draftDescriptor = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry);      
      jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(jContext.draftDescriptor, jContext.getJobId())));
      PostThumbnailJob postThumbnailJob = new PostThumbnailJob(jContext);     
      postThumbnailJob.schedule();
    }
    response.setStatus(HttpServletResponse.SC_OK);
  }

  private void processSingleRequest(HttpServletRequest request, HttpServletResponse response, UserBean user, String docUri, String imgSize,
      String preName)
  {
    IDocumentEntry docEntry;
    BufferedInputStream is = null;
    OutputStream os = null;

    String[] tokens = docUri.split("@"); // version series id
    if (tokens != null && tokens.length == 2)
    {
      try
      {
        boolean anonymousMode = user.getId().equals(IUser.ANONYMOUS_USER_ID);
        if (anonymousMode)
        {
          docEntry = ecmAdapter.getDocumentBySONATA(docUri);
        }
        else
        {
          docEntry = ecmAdapter.getDocument(user, docUri);
        }
        String uri = docEntry.getDocUri(); // publish version id
        String verId = uri.split("@")[0];
        String pwcId = ((ECMDocumentEntry) docEntry).getPrivateWorkCopyId(); // draft
        String[] ids = null;
        String[] inputs = null;
        if (pwcId != null && verId != null) // v1.0 & v1.1 exist
        {
          inputs = new String[] { pwcId, verId };
        }
        else if (verId != null) // only v1.0 exist
        {
          inputs = new String[] { verId };
        }
        else if (pwcId != null) // only v0.1 exist
        {
          inputs = new String[] { pwcId };
        }

        // verify permissions
        try
        {
          ids = ecmAdapter.verifyACL(inputs, anonymousMode);
        }
        catch (RepositoryAccessException e)
        {
          StringBuffer buf = new StringBuffer();
          if (pwcId != null)
          {
            buf.append(" pwcId=").append(pwcId);
          }
          if (verId != null)
          {
            buf.append(" verId=").append(verId);
          }
          LOGGER.log(Level.WARNING, "Falied to verify ecm ACL - {0}:{1} Requester:{2}. Ids:{3} ",
              new Object[] { e.getStatusCode(), e.getErrorMsg(), user.getId(), buf });
        }
        if (ids == null)
        {
          LOGGER.log(Level.WARNING, "No validate document id. Requester: " + user.getId() + " Ids:");
          response.setStatus(HttpServletResponse.SC_FORBIDDEN);
          return;
        }

        // set version type
        if (ids.length == 2) // pwc is allowed
        {
          uri = ids[0] + "@" + tokens[1];
          response.setHeader(VERSION_TYPE_KEY, VERSION_TYPE_VALUE_DRAFT);
        }
        else if (ids.length == 1)
        {
          if (ids[0].equals(pwcId))
          {
            uri = ids[0] + "@" + tokens[1];
            response.setHeader(VERSION_TYPE_KEY, VERSION_TYPE_VALUE_DRAFT);
          }
          else
          {
            response.setHeader(VERSION_TYPE_KEY, VERSION_TYPE_VALUE_MAJOR);
          }
        }

        String cacheHomeStr = getCacheHome(uri);
        File cacheHomeDir = new File(cacheHomeStr);
        File[] modifyDirs = cacheHomeDir.listFiles();
        String modifyPath = getLatestModifiedPath(modifyDirs);
        if (modifyPath == null)
        {
          LOGGER.log(Level.WARNING, " No thumbnails were found. Requester: " + user.getId() + " path:" + cacheHomeDir.getPath());
          response.setStatus(HttpServletResponse.SC_NOT_FOUND);
          return;
        }
        else
        {
          File thumbSrvDir = new File(new File(cacheHomeDir, modifyPath), THUMBNAIL_SERVICE_DIR);
          File sizeJson = new File(thumbSrvDir, THUMBNAILS_SIZEJSON_FILENAME);
          thumbSrvDir.list();
          if (sizeJson.exists())
          {
            String ext = getThumbnailExtension(sizeJson);
            File file = new File(thumbSrvDir, preName + ext);
            if (file.exists())
            {
              String eTag = "\"" + file.lastModified() + "\"";
              String reqETag = request.getHeader("If-None-Match");
              String reqModified = request.getHeader("If-Modified-Since");
              String modifiedParam = request.getParameter("preventCache");
              if (modifiedParam == null)
              {
                if (reqETag != null)
                {
                  if (reqETag.equals(eTag))
                  {
                    response.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
                    return;
                  }
                }
                else if (reqModified != null)
                {
                  if (Long.valueOf(reqModified).equals(file.lastModified()))
                  {
                    response.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
                    return;
                  }
                }
              }
              else
              {
                response.setHeader("Cache-Control", "private, max-age=31536000");
              }

              is = new BufferedInputStream(new FileInputStream(file));
              os = response.getOutputStream();
              int numRead = -1;
              byte[] data = new byte[8192];
              while ((numRead = is.read(data)) > 0)
              {
                os.write(data, 0, numRead);
              }
              String contentType = replaceByImageFormat(REPONSE_CONTENT_TYPE, ext);
              response.setContentType(contentType);
              if (modifiedParam == null)
              {
                response.setHeader("Cache-Control", "private, max-age=31536000, must-revalidate");
                response.setHeader("Etag", eTag);
                response.setHeader("Last-Modified", String.valueOf(file.lastModified()));
              }
              String browser_cache = (String) Platform.getViewerConfig().getSubConfig("browserCache").get("enabled");
              if (!browser_cache.equals("true"))
                setNoCache(response);
            }
          }
          else
          {
            LOGGER.log(Level.WARNING, " No thumbnails were found. Requester: " + user.getId() + " path:" + cacheHomeDir.getPath());
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return;
          }
        }
      }
      catch (RepositoryAccessException e)
      {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        LOGGER.log(Level.WARNING, "Failed to get the document object. Requester: " + user.getId() + " DocUri:" + docUri);
      }
      catch (IOException e)
      {
        response.setStatus(HttpServletResponse.SC_EXPECTATION_FAILED);
        LOGGER.log(Level.WARNING, "Failed to write the response. Requester: " + user.getId() + " DocUri:" + docUri);
      }
      finally
      {
        if (is != null)
        {
          try
          {
            is.close();
          }
          catch (IOException e)
          {
            LOGGER.log(Level.WARNING, "Failed to close the output stream. Requester: " + user.getId() + " DocUri:" + docUri);
          }
          finally
          {
            if (os != null)
            {
              try
              {
                os.close();
              }
              catch (IOException e1)
              {
                LOGGER.log(Level.WARNING, "Failed to close the output stream. Requester: " + user.getId() + " DocUri:" + docUri);
              }
            }
          }
        }
      }
    }
    else
    {
      response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }

  }

  private String getCacheHome(String uri)
  {
    String[] md5 = ViewerUtil.hash(uri);
    StringBuffer cacheHome = new StringBuffer(ViewerConfig.getInstance().getSharedDataRoot()).append(File.separator).append(CCM_PREVIEW)
        .append(File.separator).append(md5[0]).append(File.separator).append(md5[1]).append(File.separator).append(uri);
    return cacheHome.toString();
  }

  private void processBatchRequests(HttpServletResponse response, UserBean user, String repoId, String imgSize, String vSeriesIds,
      String preName, ResponseFormat respFormat)
  {
    String[] ids = null;
    if (vSeriesIds != null && !vSeriesIds.isEmpty())
    {
      ids = vSeriesIds.split(",");
    }
    boolean anonymousMode = user.getId().equals(IUser.ANONYMOUS_USER_ID);
    if (ids != null && ids.length > 0)
    {
      String[] validIds = null;
      try
      {
        validIds = ecmAdapter.verifyACL(ids, anonymousMode);
      }
      catch (RepositoryAccessException e)
      {
        LOGGER.log(Level.WARNING, "Falied to verify ecm ACL - {0}:{1} Requester:{2}. Ids:{3} ", new Object[] { e.getStatusCode(), e.getErrorMsg(), user.getId(),
            vSeriesIds });
      }
      if (validIds == null)
      {
        LOGGER.log(Level.WARNING, "No validate document id. Requester: " + user.getId() + " Ids:" + vSeriesIds);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        return;
      }

      String browser_cache = (String) Platform.getViewerConfig().getSubConfig("browserCache").get("enabled");
      response.setStatus(HttpServletResponse.SC_OK);
      response.setContentType(respFormat.getValue());
      if (!browser_cache.equals("true"))
        setNoCache(response);
      else
        response.setHeader("Cache-Control", "private, max-age=31536000, must-revalidate");

      JSONObject resJson = null;
      StringBuffer resStr = null;

      for (String id : validIds)
      {
        String docUri = id + "@" + repoId;
        String cacheHomeStr = getCacheHome(docUri);
        File cacheHomeDir = new File(cacheHomeStr);
        File[] modifyDirs = cacheHomeDir.listFiles();
        String modifyPath = getLatestModifiedPath(modifyDirs);
        if (modifyPath == null)
        {
          LOGGER.log(Level.WARNING, " No thumbnails were found. Requester: " + user.getId() + " path:" + cacheHomeDir.getPath());
          continue;
        }

        File thumbSrvDir = new File(new File(cacheHomeDir, modifyPath), THUMBNAIL_SERVICE_DIR);
        File sizeJson = new File(thumbSrvDir, THUMBNAILS_SIZEJSON_FILENAME);
        thumbSrvDir.list();

        try
        {
          if (sizeJson.exists())
          {
            String ext = getThumbnailExtension(sizeJson);
            File file = new File(thumbSrvDir, preName + ext);
            if (file.exists())
            {
              FileInputStream in = new FileInputStream(file);
              byte[] imageInBytes = IOUtils.toByteArray(in);
              String imgStr = Base64.encode(imageInBytes);
              String contentType = replaceByImageFormat(BASE64_IMAGE_DESCRIPTOR, ext);

              if (respFormat == ResponseFormat.JSON)
              {
                if (resJson == null)
                {
                  resJson = new JSONObject();
                }
                // json
                JSONObject fj = new JSONObject();
                fj.put("format", ext.substring(1));
                fj.put("stream", imgStr);
                resJson.put(id, fj);
              }
              else
              {
                if (resStr == null)
                {
                  resStr = new StringBuffer();
                }
                // text
                resStr.append("{").append(id).append("}").append(",").append(contentType).append(",").append(imgStr);
              }
              if (in != null)
              {
                in.close();
              }
            }
          }
        }
        catch (IOException e)
        {
          LOGGER
              .log(Level.WARNING, "Failed to write the response. Requester: " + user.getId() + " path:" + cacheHomeDir.getPath());
          continue;
        }
      }
      if (respFormat == ResponseFormat.JSON && resJson != null)
      {
        ViewerUtil.gzipJson2Response(resJson, response);
      }
      else if (resStr != null)
      {
        ViewerUtil.gzipTxtResponse(resStr.toString(), response);
      }
    }

  }

  private String getThumbnailExtension(File sizeJson) throws FileNotFoundException, IOException
  {
    JSONObject sizeJF = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(sizeJson)));
    Object value = sizeJF.get(JSON_KEY_FORMAT);
    if (value != null)
    {
      return (String) value;
    }
    else
    {
      return DEFAULT_IMAGE_FORMAT; // use ".png" as default
    }
  }

  private String replaceByImageFormat(String strTemplate, String ext) throws FileNotFoundException, IOException
  {
    if (ext != null)
    {
      return strTemplate.replace("{0}", ext.substring(1));
    }
    else
    {
      return strTemplate.replace("{0}", DEFAULT_IMAGE_FORMAT.substring(1)); // use "png" as default
    }
  }

  private String getLatestModifiedPath(File[] folders)
  {
    if (folders == null || folders.length == 0)
      return null;

    long latestModifed = 0;
    Calendar latestCal = Calendar.getInstance();
    latestCal.setTimeInMillis(0);

    for (File f : folders)
    {
      try
      {
        long curModified = Long.parseLong(f.getName());
        Calendar present = Calendar.getInstance();
        present.setTimeInMillis(curModified);
        if (latestCal.before(present))
        {
          latestModifed = curModified;
          latestCal = present;
        }
      }
      catch (NumberFormatException e)
      {
        // nothing
      }
    }

    return String.valueOf(latestModifed);
  }

  private void setNoCache(HttpServletResponse response)
  {
    response.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate, max-age=3600");
    response.setHeader("Pragma", "no-cache");
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);

    // Get upload data information here
    try
    {
      String docID = (String) request.getParameter(DOCUMENT);

      RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
          RepositoryServiceUtil.ECM_FILES_REPO_ID);
      ECMRepository ecmAdapter = (ECMRepository) service.getRepository(RepositoryServiceUtil.ECM_FILES_REPO_ID);

      ECMDocumentEntry docEntry = (ECMDocumentEntry) ecmAdapter.getDocumentBySONATA(docID);

      if (docEntry != null)
      {
        ThumbnailDescriptor thumbSrvDraftDesc = new ThumbnailDescriptor(docEntry);
        String thumbnailServiceCachedDir = thumbSrvDraftDesc.getThumbnailServiceURI();

        File destDir = new File(thumbnailServiceCachedDir);
        destDir.mkdirs();
        File imgSrc = new File(destDir, "image.jpg");

        InputStream ins = request.getInputStream();

        lock.lock(imgSrc.getAbsolutePath());

        if (lock.isLocked())
        {
          if (imgSrc.exists())
          {
            response.setStatus(HttpServletResponse.SC_CREATED);
          }
          else
          {
            FileUtil.copyInputStreamToFile(ins, imgSrc);
            response.setStatus(HttpServletResponse.SC_CREATED);
            ThumbnailServiceJob4Img thumsJob = new ThumbnailServiceJob4Img(user, docEntry);
            thumsJob.schedule();
            LOGGER.log(Level.FINE, "The thumbnail service scheduled for video:" + docEntry.getDocId());
          }
        }
        else
        {
          JSONObject info = new JSONObject();
          info.put("infoType", "conflict");
          info.put("infoMsg", "another thread is uploading the video");
          response.setContentType("application/json");
          response.setCharacterEncoding("UTF-8");
          response.getWriter().write(info.toString());
          response.setStatus(HttpServletResponse.SC_OK);
        }
      }
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.SEVERE, "RepositoryAccessException:" + e.getMessage());
    }
    catch (IllegalArgumentException e)
    {
      LOGGER.log(Level.SEVERE, "IllegalArgumentException:" + e.getMessage());
    }
    finally
    {
      lock.unlock();
    }
  }
}