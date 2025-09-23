/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.api;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.cache.CacheMetaEnum;
import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.document.services.DocumentServiceUtil;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.FormatUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.services.fileUtil.LockUtil;
import com.ibm.concord.viewer.services.rest.DeleteHandler;
import com.ibm.concord.viewer.services.rest.GetHandler;
import com.ibm.concord.viewer.services.rest.PostHandler;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.SimpleLocalEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.concord.viewer.tempstorage.repository.DocInfo;
import com.ibm.concord.viewer.tempstorage.repository.DocumentEntry;
import com.ibm.concord.viewer.tempstorage.repository.TempStorageRepository;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

/**
 * @author yindali@cn.ibm.com
 * 
 */
public class ViewDocumentHandler implements GetHandler, PostHandler, DeleteHandler
{

  private static final Logger log = Logger.getLogger(ViewDocumentHandler.class.getName());

  private static int MAX_TIME = 1000;

  private static int LOCK_INTERVAL = 10;

  private LockUtil lock = new LockUtil();

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);

    // Get upload data information here
    try
    {
      // File f = new File("C:\\iNotes\\test.ods");
      // InputStream ins = new FileInputStream(f);
      InputStream ins = request.getInputStream();
      DocInfo docInfo = getDocumentEntryInfo(request, user);
      String mime = docInfo.getMimeType();
      String docExtension = docInfo.getExtension();
      String filename = docInfo.getTitle();
      String uri = docInfo.getUri();

      // boolean isHTML = DocumentTypeUtils.isHTML(user, mime);
      // Put docentry info into meta file in cache
      final ICacheDescriptor draftDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user,
          new SimpleLocalEntry(uri, mime, RepositoryServiceUtil.TEMP_STORAGE_REPO_ID));
      // getLCFilesCacheDescriptor(user.getCustomerId(), uri,
      // TempStorageRepository.VERSION_LABEL, DocumentTypeUtils.isHTML(mime));

      if (ins != null && ins.available() > 0)
      {
        String cacheDir = draftDesc.getInternalURI();
        log.log(Level.FINER, ">>> Got inputstream. path={0} ", cacheDir);
        createCacheDir(cacheDir);

        String printParam = request.getHeader("print");
        if (printParam == null)
        {
          printParam = ViewerUtil.getiNotesPrint();
        }
        String cacheControlParam = request.getHeader("cache-control-value");
        if (cacheControlParam == null)
        {
          cacheControlParam = ViewerUtil.getiNotesCache();
        }
        JSONObject meta = new JSONObject();
        meta.put(CacheMetaEnum.DOC_ID.getMetaKey(), uri);
        meta.put(CacheMetaEnum.MIME.getMetaKey(), mime);
        meta.put(CacheMetaEnum.EXT.getMetaKey(), docExtension);
        meta.put(CacheMetaEnum.TITLE.getMetaKey(), filename);
        meta.put(CacheMetaEnum.PRINT.getMetaKey(), printParam);
        meta.put(CacheMetaEnum.CACHE_CONTROL.getMetaKey(), cacheControlParam);
        meta.put(CacheMetaEnum.CACHE_VERSION.getMetaKey(), ViewerUtil.getBuildVersion());

        lock.lock(cacheDir + File.separator + "lck");
        if (lock.isLocked())
        {
          storeEntry(request, response, ins, cacheDir, filename, meta, draftDesc, user, uri, docInfo);
          lock.unlock();
          return;
        }
        else
        {
          for (int i = 0; i < MAX_TIME; i++)
          {
            Thread.sleep(LOCK_INTERVAL);
            lock.lock(cacheDir + File.separator + "lck");
            if (lock.isLocked())
              break;
          }
          if (lock.isLocked())
          {
            if (isExists(request, response))
            {
              returnURL(request, response, uri, mime, HttpServletResponse.SC_CREATED);
              lock.unlock();
              return;
            }
            else
            {
              storeEntry(request, response, ins, cacheDir, filename, meta, draftDesc, user, uri, docInfo);
              returnURL(request, response, uri, mime, HttpServletResponse.SC_CREATED);
              lock.unlock();
              return;
            }
          }
        }
      } else {
        String cacheDir = draftDesc.getInternalURI();
        String userId = getUserId(request, user);
        if (isExists(request, response)) {
          log.log(Level.INFO, "Found attachment && ACL is verified. path={0}, user={1} ", new String[] { cacheDir,
              userId });
          returnURL(request, response, uri, mime, HttpServletResponse.SC_CONFLICT);
          return;
        } else {
          log.log(Level.INFO, "Not found attachment or ACL not verified. path={0}, user={1} ", new String[] { cacheDir,
              userId });
          returnURL(request, response, uri, mime, HttpServletResponse.SC_CREATED);
          return;
        }
      }
    }
    finally
    {
    }
  }

  public void storeEntry(HttpServletRequest request, HttpServletResponse response, InputStream ins, String folder, String fileName,
      JSONObject meta, ICacheDescriptor cacheDesc, UserBean user, String uri, DocInfo docInfo) throws Exception
  {
    StringBuffer msg = new StringBuffer();
    CacheStorageManager.getCacheStorageManager().setCachedTempStorageMeta(cacheDesc, meta);

    // Cache document to cache dir
    try
    {
      cacheDocumentFromHttpStream(folder, ins, fileName);
    }
    catch (IOException e)
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_SEVERE_GET_DOCUMENT_FILE_ERROR);
      msg.append(" The doc is ");
      msg.append(docInfo.getTitle());
      msg.append(" The doc id is ");
      msg.append(docInfo.getUri());
      log.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.SEVERE_GET_DOCUMENT_FILE_ERROR, msg.toString()));
    }
    JSONObject ACLMeta = new JSONObject();
    ACLMeta.put("name", getUserId(request, user));
    CacheStorageManager.getCacheStorageManager().setCachedACLMeta(cacheDesc, ACLMeta);

    String mime = (String) meta.get(CacheMetaEnum.MIME.getMetaKey());
    IDocumentService docSrv = DocumentServiceUtil.getDocumentService(mime);
    if (docSrv == null)
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_UNSUPPORTTED_MIME);
      msg.append("The MIME type of ");
      msg.append(uri);
      msg.append(" is " + mime);
      log.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_UNSUPPORTTED_MIME, msg.toString()));
      log.warning("Unable to get DocumentService....");
      response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
      return;
    }

    returnURL(request, response, uri, mime, HttpServletResponse.SC_CREATED);
  }

  private void cacheDocumentFromHttpStream(String cacheDir, InputStream ins, String title) throws IOException
  {
    if (ins != null)
    {
      File f = new File(cacheDir, TempStorageRepository.TEMP_FILE_NAME);
      FileOutputStream o = new FileOutputStream(f);
      byte b[] = new byte[8196];
      int n;
      while ((n = ins.read(b)) != -1)
      {
        o.write(b, 0, n);
      }
      o.close();
      ins.close();
    }
  }

  private void createCacheDir(String path)
  {
    File curFile;
    int idx = -1;
    while (idx != path.length() - 1 && (idx = path.indexOf(File.separatorChar, idx + 1)) != -1)
    {
      String curDir = path.substring(0, idx);
      if (idx == 0)
      { // if unix-like path
        curDir = String.valueOf(File.separatorChar);
      }
      curFile = new File(curDir);
      if (!curFile.exists())
      {
        curFile.mkdir();
      }
    }

    if (path.charAt(path.length() - 1) != File.separatorChar)
    {
      curFile = new File(path);
      curFile.mkdir();
    }
  }

  private String getMimeTypeFromExt(String ext)
  {
    String extension = ext.toLowerCase();
    return FormatUtil.EXT2MIMETYPE.get(extension);
  }

  private String extractExt(String title)
  {
    String result;
    int index = title.lastIndexOf('.');
    if (index == -1)
    {
      result = "";
    }
    else
    {
      result = title.substring(index + 1);
    }

    return result;
  }

  public boolean isExists(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    DocInfo docInfo = getDocumentEntryInfo(request, user);
    IDocumentEntry docEntry = null;
    docEntry = (DocumentEntry) RepositoryServiceUtil.getEntry(user, TempStorageRepository.REPO_ID_TEMP_STORAGE, docInfo.getUri(),
        docInfo.getMimeType());
    if (docEntry == null)
    {
      return false;
    }
    else
    {
      return true;
    }
  }

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    String userId = getUserId(request, user);
    DocInfo docInfo = getDocumentEntryInfo(request, user);

    StringBuffer msg = new StringBuffer(ServiceCode.S_INFO_VIEW_FROM_INOTES);
    msg.append(" " + userId);
    msg.append(" views ");
    msg.append(docInfo.getTitle());
    // Serviceability log here
    log.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_VIEW_FROM_INOTES, msg.toString()));

    IDocumentEntry docEntry = (DocumentEntry) RepositoryServiceUtil.getEntry(user, TempStorageRepository.REPO_ID_TEMP_STORAGE,
        docInfo.getUri(), docInfo.getExtension());
    if (docEntry == null)
    {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    final ICacheDescriptor draftDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry);
    if (draftDesc.exists())
    {
      // if user-id matched
      JSONObject creator = CacheStorageManager.getCacheStorageManager().getCachedACLMeta(draftDesc);
      if (creator == null)
      {
        JSONObject ACLMeta = new JSONObject();
        ACLMeta.put("name", userId);
        CacheStorageManager.getCacheStorageManager().setCachedACLMeta(draftDesc, ACLMeta);
        creator = ACLMeta;
      }
      if (!TempStorageRepository.isUserInACL(userId, creator))
      {
        // user not match
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        return;
      }

      returnURL(request, response, docEntry.getDocUri(), docEntry.getMimeType(), HttpServletResponse.SC_OK);
    }
    else
    {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
    }
  }

  private String getUserId(HttpServletRequest request, UserBean user)
  {
    String user_id = request.getHeader("X-user-id");
    if (user_id == null)
    {
      user_id = user.getEmail();
    }
    return user_id;
  }

  private String getViewDocURL(HttpServletRequest request, String uri, String mime)
  {
    // Get host name
    String host = request.getScheme() + "://" + request.getServerName();
    int port = request.getServerPort();
    URL hosturl;
    try
    {
      hosturl = new URL(host);
      if (port != -1 && port != hosturl.getDefaultPort())
      {
        host += ":" + request.getServerPort();
      }
    }
    catch (MalformedURLException e)
    {
      return null;
    }

    // Get relative path
    String id = uri;
    int index = id.lastIndexOf(IDocumentEntry.DOC_URI_SEP);
    if (index != -1)
    {
      id = id.substring(index + 1);
    }

    StringBuilder path = new StringBuilder(URLConfig.getContextPath());
    path.append("/app/").append(RepositoryServiceUtil.TEMP_STORAGE_REPO_ID).append("/").append(id).append("/content");
    try
    {
      if (mime != null)
      {
        String encodedMime = URLEncoder.encode(mime, "UTF-8");
        if (encodedMime != null)
        {
          path.append("?").append("mime").append("=").append(encodedMime);
        }
      }
    }
    catch (UnsupportedEncodingException e)
    {
      log.log(Level.WARNING, "Failed to encode document mimetype. {0}.", mime);
    }
    String retVal = host + path;
    log.info("return URL to iNotes: " + retVal);
    return retVal;
  }

  private String getDocId(HttpServletRequest request)
  {
    String path = request.getPathInfo();
    int index = path.lastIndexOf("/");
    return path.substring(index + 1);
  }

  private DocInfo getDocumentEntryInfo(HttpServletRequest request, UserBean user)
  {
    DocInfo docInfo = new DocInfo();

    String uri = getDocId(request);// "be5db69b-52aa-4a51-ab38-b4e83dbf94d9";
    uri = TempStorageRepository.getUri(getUserId(request, user), uri);
    String filename = request.getHeader("Title");

    if (filename == null)
    {
      filename = "untitled.doc";
    }
    String docExtension = extractExt(filename);
    String mime = getMimeTypeFromExt(docExtension);
    try
    {
      filename = URLDecoder.decode(filename, "UTF-8");
    }
    catch (UnsupportedEncodingException e)
    {
      filename = "Untitled." + docExtension;
    }

    docInfo.setExtension(docExtension);
    docInfo.setMimeType(mime);
    docInfo.setTitle(filename);
    docInfo.setUri(uri);

    return docInfo;
  }

  private void returnURL(HttpServletRequest request, HttpServletResponse response, String uri, String mime, int statusCode)
      throws IOException
  {
    String viewDocURL = getViewDocURL(request, uri, mime);
    // write the url to return
    JSONObject url = new JSONObject();
    url.put("url", viewDocURL);
    response.setStatus(statusCode);
    response.setContentType("application/json");
    response.getWriter().print(url.toString());
  }

  public void doDelete(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    String userId = getUserId(request, user);
    DocInfo docInfo = getDocumentEntryInfo(request, user);
    ICacheDescriptor draftDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user,
        new SimpleLocalEntry(docInfo.getUri(), docInfo.getMimeType(), RepositoryServiceUtil.TEMP_STORAGE_REPO_ID));
    if (draftDesc.exists())
    {
      // if user-id matched
      JSONObject creator = CacheStorageManager.getCacheStorageManager().getCachedACLMeta(draftDesc);
      if (TempStorageRepository.isUserInACL(userId, creator))
      {
        // delete it
        JSONObject userObj = new JSONObject();
        userObj.put("name", userId);
        CacheStorageManager.getCacheStorageManager().deleteCachedACLMeta(draftDesc, userObj);
      }
      response.setStatus(HttpServletResponse.SC_OK);
    }
    else
    {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
    }
  }
}
