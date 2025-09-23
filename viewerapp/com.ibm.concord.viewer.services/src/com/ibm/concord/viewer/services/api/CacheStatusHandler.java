package com.ibm.concord.viewer.services.api;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.exception.CacheStorageAccessException;
import com.ibm.concord.viewer.cache.spi.impl.CacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.ThumbnailDescriptor;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.lc3.repository.DocumentEntry;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.ViewRule;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.services.rest.GetHandler;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.json.java.JSONObject;

public class CacheStatusHandler implements GetHandler
{

  public static final String CACHESTATUS_KEY_EXISTS = "exists";

  public static final String CACHESTATUS_KEY_UPLOADCONVERTING = "uploadConverted";

  public static final String CACHESTATUS_KEY_VALID = "valid";

  public static final String CACHESTATUS_KEY_LOCATION = "location";

  public static final String CACHESTATUS_KEY_THUMBNAILSCACHE = "thumbnailsCache";

  public static final String CACHESTATUS_KEY_DOCCACHE = "docCache";

  public static final String CACHESTATUS_KEY_SNAPSHOTCACHE = "snapshotCache";

  public static final String CACHESTATUS_KEY_THUMBNAILSCONVERSION = "thumbnailsConversion";

  // private static final String CACHESTATUS_KEY_RELATIVEPATH = "relativePath";

  private static final String CACHESTATUS_KEY_TITLE = "title";

  private static final Object CACHESTATUS_KEY_LASTMODIFY = "lastModified";

  private static final Object CACHESTATUS_KEY_MIMETYPE = "mimetype";

  private static final Object CACHESTATUS_KEY_MEDIASIZE = "mediaSize";

  private static final Object CACHESTATUS_KEY_DOCINFO = "docInfo";

  private static Logger LOG = Logger.getLogger(CacheStatusHandler.class.getName());

  @SuppressWarnings("serial")
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    JSONObject json = new JSONObject();

    try
    {
      final UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
      Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
      String repoId = pathMatcher.group(1);
      String docUri = pathMatcher.group(2);

      final IDocumentEntry docEntry = RepositoryServiceUtil.getEntry(user, repoId, docUri);

      ICacheDescriptor cache = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry,
          request.getHeader("User-Agent"));
      ThumbnailDescriptor thumbSrvCache = new ThumbnailDescriptor(docEntry);

      // Display docEntry status
      if (repoId.equals(ViewerConfig.RepositoryType.VERSE_ATTACHMENT.getId()))
      {
        JSONObject doc = new JSONObject();
        doc.put(CACHESTATUS_KEY_TITLE, docEntry.getTitle());
        doc.put(CACHESTATUS_KEY_LASTMODIFY, docEntry.getModified().getTimeInMillis());
        doc.put(CACHESTATUS_KEY_MIMETYPE, docEntry.getMimeType());
        doc.put(CACHESTATUS_KEY_MEDIASIZE, docEntry.getMediaSize());
        json.put(CACHESTATUS_KEY_DOCINFO, doc);
      }
      else
      {
        JSONObject doc = new JSONObject();
        // doc.put(CACHESTATUS_KEY_RELATIVEPATH, ((DocumentEntry) docEntry).getRelativePath());
        doc.put(CACHESTATUS_KEY_LASTMODIFY, docEntry.getModified().getTimeInMillis());
        doc.put(CACHESTATUS_KEY_MIMETYPE, docEntry.getMimeType());
        doc.put(CACHESTATUS_KEY_MEDIASIZE, docEntry.getMediaSize());
        json.put(CACHESTATUS_KEY_DOCINFO, doc);
      }

      // Display cache status
      final String agent = request.getHeader("User-Agent");
      ViewContext context = ViewRule.getViewContext(new HashMap<String, Object>()
      {
        {
          put(ViewRule.PARAM_DOCENTRY, docEntry);
          put(ViewRule.PARAM_USER_AGENT, agent);
          put(ViewRule.PARAM_USER, user);
        }
      });

      LOG.log(Level.FINER, "Using {0} mode, {1} repository.", new Object[] { context.name(), docEntry.getRepository() });

      switch (context)
        {
          case VIEW_HTML_SS :
            addSnapshotDraftStatus(json, cache);
            break;
          case VIEW_HTML_NON_SS :
          case VIEW_IMAGE :
            addViewerCacheStatus(json, docEntry, cache);
            break;
        }

      // Display thumbnails status
      if (!RepositoryServiceUtil.MAIL_REPO_ID.equals(docEntry.getRepository())
          && !RepositoryServiceUtil.VSFILES_REPO_ID.equals(docEntry.getRepository()))
      {
        addThumbnailStatus(json, docEntry, cache, thumbSrvCache);
      }

      json.serialize(response.getOutputStream());
    }
    catch (Exception e)
    {
      json.put("error", e.getMessage());
    }
  }

  private void addThumbnailStatus(JSONObject json, IDocumentEntry docEntry, ICacheDescriptor cache, ThumbnailDescriptor thumbSrvCache)
  {
    LOG.entering(CacheStatusHandler.class.getName(), "addThumbnailStatus", json.toString());

    String thumbnailSrvCacheDir = getThumbnailSrvCacheDir(docEntry, thumbSrvCache);
    LOG.log(Level.FINER, "thumbSrvCacheDir is {0}", thumbnailSrvCacheDir);

    File cacheDir = new File(thumbnailSrvCacheDir);
    cacheDir.list();
    File sizeJson = new File(cacheDir, "size.json");
    File resultHtml = new File(cacheDir, "result");//check the result file.
    String viewerSharedRoot = ViewerConfig.getInstance().getSharedDataRoot();

    String relativeDir;
    String rootDir = "";
    boolean IS_LCFILES = false;
    if (RepositoryServiceUtil.CONNECTIONS_FILES_REPO_ID.equals(docEntry.getRepository()))
    {
      IS_LCFILES = true;
    }
    else
    {
      rootDir = viewerSharedRoot + File.separator + "fake_filer";
    }
    JSONObject thumbnailCache = new JSONObject();
    if(IS_LCFILES)//to check the result file.
    {
      LOG.log(Level.FINER, "Result return from files is {0}", resultHtml);
      thumbnailCache.put(CACHESTATUS_KEY_LOCATION, thumbnailSrvCacheDir);
      thumbnailCache.put(CACHESTATUS_KEY_EXISTS, Boolean.toString(resultHtml.exists()));
    }
    else
    {
      LOG.log(Level.FINER, "rootDir is {0}", rootDir);
      relativeDir = getRelativeURI(thumbnailSrvCacheDir, rootDir);
      thumbnailCache.put(CACHESTATUS_KEY_LOCATION, relativeDir);
      thumbnailCache.put(CACHESTATUS_KEY_EXISTS, Boolean.toString(sizeJson.exists()));
    }
    json.put(CACHESTATUS_KEY_THUMBNAILSCACHE, thumbnailCache);

    // only if viewer receive thumbnail request and there's no image cache existed.
    File tsCache = new File(thumbSrvCache.getInternalURI());
    String tsLocation = getRelativeURI(tsCache.getAbsolutePath(), viewerSharedRoot);

    JSONObject tempCache = new JSONObject();
    tempCache.put(CACHESTATUS_KEY_LOCATION, tsLocation);
    tempCache.put(CACHESTATUS_KEY_EXISTS, Boolean.toString(hasThumbnailConversion(docEntry, cache)));
    json.put(CACHESTATUS_KEY_THUMBNAILSCONVERSION, tempCache);

    LOG.exiting(CacheStatusHandler.class.getName(), "addThumbnailStatus");
  }

  private String getThumbnailSrvCacheDir(IDocumentEntry docEntry, ThumbnailDescriptor thumbSrvCache)
  {
    if (RepositoryServiceUtil.ECM_FILES_REPO_ID.equals(docEntry.getRepository()))
    {
      return thumbSrvCache.getThumbnailServiceURI();
    }
    else if (RepositoryServiceUtil.CONNECTIONS_FILES_REPO_ID.equals(docEntry.getRepository()))
    {
      return thumbSrvCache.getInternalURI();
    }
    else
    {
      String[] md5 = ViewerUtil.hash(docEntry.getDocUri());
      String connectionSharedRoot = RepositoryServiceUtil.getRepositoryFilesPath(docEntry.getRepository());
      StringBuffer path = new StringBuffer(connectionSharedRoot).append(File.separator).append("preview").append(File.separator)
          .append(md5[0]).append(File.separator).append(md5[1]).append(File.separator).append(docEntry.getDocUri()).append(File.separator)
          .append(docEntry.getModified().getTimeInMillis());
      return path.toString();
    }
  }

  private void addViewerCacheStatus(JSONObject json, IDocumentEntry docEntry, ICacheDescriptor cache) throws CacheDataAccessException,
      CacheStorageAccessException
  {
    LOG.entering(CacheStatusHandler.class.getName(), "addViewerCacheStatus", json.toString());

    File fCache = new File(cache.getInternalURI());
    File sharedDateRoot = new File(ViewerConfig.getInstance().getSharedDataRoot());
    String location = fCache.getAbsolutePath().substring(sharedDateRoot.getAbsolutePath().length());
    boolean uploadConversion = hasUploadConversion(docEntry, cache);

    JSONObject docCache = new JSONObject();
    docCache.put(CACHESTATUS_KEY_LOCATION, location);
    docCache.put(CACHESTATUS_KEY_UPLOADCONVERTING, Boolean.toString(uploadConversion));
    docCache.put(CACHESTATUS_KEY_EXISTS, Boolean.toString(cache.exists()));
    docCache.put(CACHESTATUS_KEY_VALID, Boolean.toString(cache.isValid()));
    json.put(CACHESTATUS_KEY_DOCCACHE, docCache);

    LOG.exiting(CacheStatusHandler.class.getName(), "addViewerCacheStatus", json);
  }

  private void addSnapshotDraftStatus(JSONObject json, ICacheDescriptor cache) throws CacheDataAccessException, CacheStorageAccessException
  {
    LOG.entering(CacheStatusHandler.class.getName(), "addSnapshotDraftStatus", json.toString());

    // File fCache = new File(cache.getInternalURI());
    // SnapshotStorageManager manager = (SnapshotStorageManager) CacheStorageManager.getCacheStorageManager();
    // File sharedDataRoot = new File(manager.getDraftHome());
    // String location = fCache.getAbsolutePath().substring(sharedDataRoot.getAbsolutePath().length());

    JSONObject draftCache = new JSONObject();
    draftCache.put(CACHESTATUS_KEY_LOCATION, cache.getRelativeURI());
    draftCache.put(CACHESTATUS_KEY_EXISTS, Boolean.toString(cache.accessible()));
    draftCache.put(CACHESTATUS_KEY_VALID, Boolean.toString(cache.isValid()));
    json.put(CACHESTATUS_KEY_SNAPSHOTCACHE, draftCache);

    LOG.exiting(CacheStatusHandler.class.getName(), "addSnapshotDraftStatus", json);
  }

  private boolean hasThumbnailConversion(IDocumentEntry docEntry, ICacheDescriptor thumbSrvCache)
  {
    LOG.entering(CacheStatusHandler.class.getName(), "hasThumbnailConversion");

    File f = new File(thumbSrvCache.getInternalURI() + File.separator + docEntry.getDocId() + File.separator + "pictures");
    try
    {
      if (f.exists())
      {
        File result = new File(f, "result.json");
        if (!result.exists())
        {
          LOG.exiting(CacheStatusHandler.class.getName(), "hasThumbnailConversion", false);
          return false;
        }
        JSONObject res;

        res = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(result)));
        Object obj = res.get("isSuccess");
        if (obj != null)
        {
          LOG.exiting(CacheStatusHandler.class.getName(), "hasThumbnailConversion", (Boolean) obj);
          return (Boolean) obj;
        }
      }
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.WARNING, "Failed to get result.json for upload conversion." + e.getMessage());
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "Failed to get result.json for upload conversion." + e.getMessage());
    }

    LOG.exiting(CacheStatusHandler.class.getName(), "hasThumbnailConversion", false);
    return false;
  }

  private boolean hasUploadConversion(IDocumentEntry docEntry, ICacheDescriptor cache)
  {
    LOG.entering(CacheStatusHandler.class.getName(), "hasUploadConversion");

    File f = new File(cache.getInternalURI() + File.separator + docEntry.getDocId() + File.separator + "pictures");
    LOG.log(Level.FINER, "Upload conversion path = {0}", f);
    try
    {
      if (cache.getViewContext() != ViewContext.VIEW_IMAGE)
      {
        f = f.getParentFile();
        LOG.log(Level.FINER, "Image view is used. path = {0}", f);
      }
      if (f.exists())
      {
        File result = new File(f, "result.json");
        if (!result.exists())
        {
          LOG.exiting(CacheStatusHandler.class.getName(), "result.json not found.");
          return false;
        }
        JSONObject res;

        res = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(result)));
        Object obj = res.get("isSuccess");
        if (obj != null)
        {
          LOG.exiting(CacheStatusHandler.class.getName(), "isSuccess =" + obj);
          return (Boolean) obj;
        }
      }
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.WARNING, "Failed to get result.json for upload conversion." + e.getMessage());
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "Failed to parse result.json for upload conversion." + e.getMessage());
    }
    LOG.exiting(CacheStatusHandler.class.getName(), "return false");
    return false;
  }

  public String getRelativeURI(String path, String root)
  {
    if (File.separator.equals("/"))
    {
      String s1 = path.replace("\\", "/");
      String s2 = root.replace("\\", "/");
      String s = s1.substring(s2.length());
      return s;
    }
    else
    {
      String s1 = path.replace("/", "\\");
      String s2 = root.replace("/", "\\");
      String s = s1.substring(s2.length());
      return s;
    }

  }

}
