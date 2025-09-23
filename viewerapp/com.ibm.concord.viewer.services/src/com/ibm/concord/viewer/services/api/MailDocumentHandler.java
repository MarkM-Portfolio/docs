package com.ibm.concord.viewer.services.api;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.cache.CacheMetaEnum;
import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.exception.CacheStorageAccessException;
import com.ibm.concord.viewer.document.services.DocumentServiceUtil;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.FormatUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.services.fileUtil.LockUtil;
import com.ibm.concord.viewer.services.rest.PostHandler;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.SimpleLocalEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.concord.viewer.tempstorage.repository.DocInfo;
import com.ibm.concord.viewer.tempstorage.repository.DocumentEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.viewer.mail.repository.MailRepository;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class MailDocumentHandler implements PostHandler
{

  private static final Logger logger = Logger.getLogger(MailDocumentHandler.class.getName());

  /**
   * ACL file is locked by another object, cannot execute the request temporarily. Re-send this request may resolve this issue.
   */
  private static final int HTTP_STATUSCODE_LOCKED = 423;

  private static final int BLOCK_SZIE = 8192;

  private static int MAX_TIME = 1000;

  private static int LOCK_INTERVAL = 10;

  private LockUtil attachmentLock = new LockUtil();

  private LockUtil aclLock = new LockUtil();

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);

    DocInfo docInfo = getDocumentEntryInfo(request, user);

    IDocumentEntry docEntry = new SimpleLocalEntry(docInfo.getUri(), docInfo.getMimeType(), null, RepositoryServiceUtil.MAIL_REPO_ID);
    final ICacheDescriptor cacheDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry);

    File cacheHome = new File(cacheDesc.getInternalURI());

    InputStream ins = request.getInputStream();

    // 1. Post attachment request, try to save attachment
    if (ins != null && ins.available() > 0)
    {
      logger.log(Level.FINER, ">>> Got inputstream. path={0} ", cacheHome);

      long startTime = System.currentTimeMillis();

      if (!cacheHome.exists())
      {
        cacheHome.mkdirs();
      }
      File attachement = new File(cacheHome, MailRepository.TEMP_ATTACHEMENT_NAME);
      if (cacheDesc.isValid() || attachement.exists())
      {
        // try to check the uploaded attachment and grant acl
        if (checkAndStoreACL(user, cacheDesc, request, response, ins))
        {
          // response.setStatus(HttpServletResponse.SC_CONFLICT);
        }
        else
        {
          // or return SC_INTERNAL_SERVER_ERROR
          long endTime = System.currentTimeMillis();
          logger.log(Level.WARNING, "upload for check, failed checkAndStoreACL for docId " + docEntry.getDocId()
              + ", returns SC_INTERNAL_SERVER_ERROR " + (endTime - startTime) + "ms.");
          response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        return;
      }

      JSONObject meta = new JSONObject();
      meta.put(CacheMetaEnum.DOC_ID.getMetaKey(), docInfo.getUri());
      meta.put(CacheMetaEnum.MIME.getMetaKey(), docInfo.getMimeType());
      meta.put(CacheMetaEnum.EXT.getMetaKey(), docInfo.getExtension());
      meta.put(CacheMetaEnum.TITLE.getMetaKey(), docInfo.getTitle());

      attachmentLock.lock(cacheHome + File.separator + "lck");
      if (attachmentLock.isLocked())
      {
        storeEntry(request, response, ins, cacheDesc.getInternalURI(), docInfo.getTitle(), meta, cacheDesc, docEntry, docInfo);
        attachmentLock.unlock();
        long size = -1;
        Object szObj = meta.get(CacheMetaEnum.SIZE.getMetaKey());
        if (szObj != null)
        {
          size = ((Integer) szObj).intValue();
        }
        long endTime = System.currentTimeMillis();
        logger.log(Level.INFO, "upload for store for docId " + docEntry.getDocId() + " and size " + size + ", " + (endTime - startTime)
            + "ms.");
        return;
      }
      else
      {
        for (int i = 0; i < MAX_TIME; i++)
        {
          Thread.sleep(LOCK_INTERVAL);
          attachmentLock.lock(cacheHome + File.separator + "lck");
          if (attachmentLock.isLocked())
            break;
        }
        if (attachmentLock.isLocked())
        {
          if (isExists(request, response))
          {
            response.setStatus(HttpServletResponse.SC_CONFLICT);
          }
          else
          {
            storeEntry(request, response, ins, cacheDesc.getInternalURI(), docInfo.getTitle(), meta, cacheDesc, docEntry, docInfo);
          }
          attachmentLock.unlock();
          long size = -1;
          Object szObj = meta.get(CacheMetaEnum.SIZE.getMetaKey());
          if (szObj != null)
          {
            size = ((Integer) szObj).intValue();
          }
          long endTime = System.currentTimeMillis();
          logger.log(Level.INFO, "upload for store for docId " + docEntry.getDocId() + " and size " + size + ", " + (endTime - startTime)
              + "ms.");
          return;
        }
        else
        {
          response.setStatus(HTTP_STATUSCODE_LOCKED);
          long endTime = System.currentTimeMillis();
          logger.log(Level.WARNING, "upload for store for docId " + docEntry.getDocId() + " with HTTP_STATUSCODE_LOCKED return code, "
              + (endTime - startTime) + "ms.");
          return;
        }
      }
    }
    // 2. Query request without content stream, try to save ACL
    else
    {
      // logger.log(Level.FINER, ">>> Query cache status. path={0} ", cacheHome);

      if (!cacheHome.exists())
      {
        if (!cacheHome.mkdirs())
          logger.log(Level.SEVERE, "Failed to create cache directory. path={0}", cacheHome);
      }
      /*
       * aclLock.lock(cacheHome + File.separator + "aclLck"); if (aclLock.isLocked()) { storeACL(user, cacheDesc, request);
       * aclLock.unlock(); } else { for (int i = 0; i < MAX_TIME; i++) { Thread.sleep(LOCK_INTERVAL); attachmentLock.lock(cacheHome +
       * File.separator + "aclLck"); if (aclLock.isLocked()) break; } if (aclLock.isLocked()) { storeACL(user, cacheDesc, request);
       * aclLock.unlock(); } else { response.setStatus(HTTP_STATUSCODE_LOCKED); return; } }
       */

      File attachement = new File(cacheHome, MailRepository.TEMP_ATTACHEMENT_NAME);
      if (cacheDesc.isValid() || attachement.exists())
      {
        // check acl at first
        if (checkACL(user, cacheDesc, request))
        {
          logger.log(Level.INFO, "Found attachment && ACL is verified. path={0}, user={1} ", new String[] { cacheHome.getAbsolutePath(),
              user.getId() });
          returnURL(request, response, new SimpleLocalEntry(docInfo.getUri(), docInfo.getMimeType(), null,
              RepositoryServiceUtil.MAIL_REPO_ID), HttpServletResponse.SC_CONFLICT);
          return;
        }
      }
      logger.log(Level.INFO, "Not found attachment or ACL not verified. path={0} ", cacheHome);
      returnURL(request, response, new SimpleLocalEntry(docInfo.getUri(), docInfo.getMimeType(), null, RepositoryServiceUtil.MAIL_REPO_ID),
          HttpServletResponse.SC_CREATED);
      return;
    }
  }

  private void storeACL(UserBean user, ICacheDescriptor cacheDesc, HttpServletRequest request) throws CacheDataAccessException
  {
    logger.entering(MailDocumentHandler.class.getName(), "storeACL", new String[] { cacheDesc.getInternalURI(), user.getId() });
    JSONObject aclMeta = new JSONObject();
    aclMeta.put("name", getUserId(request, user));
    CacheStorageManager.getCacheStorageManager().setCachedACLMeta(cacheDesc, aclMeta);
    logger.exiting(MailDocumentHandler.class.getName(), "storeACL");
  }

  private boolean storeACLWithLock(String cacheHome, UserBean user, ICacheDescriptor cacheDesc, HttpServletRequest request,
      HttpServletResponse response) throws CacheDataAccessException
  {
    logger.entering(MailDocumentHandler.class.getName(), "storeACLWithLock", new String[] { cacheHome, user.getId() });

    aclLock.lock(cacheHome + File.separator + "aclLck");
    if (aclLock.isLocked())
    {
      storeACL(user, cacheDesc, request);
      aclLock.unlock();
    }
    else
    {
      for (int i = 0; i < MAX_TIME; i++)
      {
        try
        {
          Thread.sleep(LOCK_INTERVAL);
        }
        catch (InterruptedException e)
        {
          logger.log(Level.WARNING, "Failed to execute next acl lock due to thread interruption. " + e.getLocalizedMessage());
        }
        aclLock.lock(cacheHome + File.separator + "aclLck");
        if (aclLock.isLocked())
        {
          break;
        }
      }
      if (aclLock.isLocked())
      {
        storeACL(user, cacheDesc, request);
        aclLock.unlock();
      }
      else
      {
        response.setStatus(HTTP_STATUSCODE_LOCKED);
        logger.exiting(MailDocumentHandler.class.getName(), "storeACLWithLock", "false 423 " + cacheDesc.getInternalURI());
        return false;
      }
    }
    logger.exiting(MailDocumentHandler.class.getName(), "storeACLWithLock", "true " + user.getId() + " " + cacheDesc.getInternalURI());
    return true;
  }

  private boolean checkAndStoreACL(UserBean user, ICacheDescriptor cacheDesc, HttpServletRequest request, HttpServletResponse response,
      InputStream ins) throws CacheDataAccessException
  {
    logger.entering(MailDocumentHandler.class.getName(), "checkAndStoreACL", new Object[] { user.getId(), cacheDesc.getInternalURI() });

    long startTime = System.currentTimeMillis();
    long size = -1;

    String uploadsha = null;
    try
    {
      if (ins != null)
      {
        byte b[] = new byte[BLOCK_SZIE];
        int readbytes = 0;
        byte[] header = new byte[BLOCK_SZIE];
        int n = -1;
        while ((n = ins.read(b)) != -1)
        {
          System.arraycopy(b, 0, header, readbytes, n > (BLOCK_SZIE - readbytes) ? (BLOCK_SZIE - readbytes) : n);
          readbytes += n;
          logger.log(Level.FINEST, ">>> Read {0} bytes, total bytes= {1} ", new Object[] { n, readbytes });
          if (readbytes >= BLOCK_SZIE)
          {
            break;
          }
        }
        uploadsha = this.generateSHA256(header, readbytes > BLOCK_SZIE ? BLOCK_SZIE : readbytes);
      }
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, "Failed to read input stream of upload attachment, error={0}", e.getLocalizedMessage());
    }
    finally
    {
      if (ins != null)
      {
        try
        {
          ins.close();
        }
        catch (IOException e)
        {
          logger.log(Level.WARNING, "Failed to close input stream of upload attachment, path={0}", cacheDesc.getInternalURI());
        }
      }
    }

    String sha = null;
    logger.log(Level.FINE, "Successfully calculate uplaodSHA. uplaodSHA={0} ", uploadsha);

    try
    {
      JSONObject cachedMeta = CacheStorageManager.getCacheStorageManager().getCachedTempstorageMeta(cacheDesc);
      sha = (String) cachedMeta.get(CacheMetaEnum.SHA_DIGEST.getMetaKey());
      logger.log(Level.FINE, "Successfully retrieve previous SHA. SHA={0} ", sha);
      Object szObj = cachedMeta.get(CacheMetaEnum.SIZE.getMetaKey());
      if (szObj != null)
      {
        size = ((Long) szObj).intValue();
      }
    }
    catch (CacheStorageAccessException e)
    {
      logger.exiting(MailDocumentHandler.class.getName(), "checkAndStoreACL", Boolean.FALSE);
      return false;
    }

    if (sha == null || !sha.equals(uploadsha))
    {
      logger.log(Level.WARNING, "Uploaded attachment file SHA256 digest does not match existing file. oldSHA={0}, uploadSHA={1}, path={2}",
          new String[] { sha, uploadsha, cacheDesc.getInternalURI() });
      logger.exiting(MailDocumentHandler.class.getName(), "checkAndStoreACL", Boolean.FALSE);
      return false;
    }

    // SC_CREATED means upload successfully
    response.setStatus(HttpServletResponse.SC_CREATED);
    String cacheHome = cacheDesc.getInternalURI();
    boolean result = storeACLWithLock(cacheHome, user, cacheDesc, request, response);

    long endTime = System.currentTimeMillis();
    logger.log(Level.INFO, "upload for check for docID " + cacheDesc.getDocId() + " and size " + size + ", " + (endTime - startTime)
        + "ms.");

    logger.exiting(MailDocumentHandler.class.getName(), "checkAndStoreACL", result);
    return result;
  }

  private boolean checkACL(UserBean user, ICacheDescriptor cacheDesc, HttpServletRequest request) throws CacheStorageAccessException,
      CacheDataAccessException
  {
    logger.entering(MailDocumentHandler.class.getName(), "checkACL", new Object[] { user.getId(), cacheDesc.getInternalURI() });
    JSONObject ACL = null;

    ACL = CacheStorageManager.getCacheStorageManager().getCachedACLMeta(cacheDesc);

    if (ACL == null)
    {
      logger.exiting(MailDocumentHandler.class.getName(), "checkACL - ACL is null", Boolean.FALSE);
      return false;
    }

    JSONArray creators = (JSONArray) ACL.get("creator");
    if (creators == null)
    {
      logger.exiting(MailDocumentHandler.class.getName(), "checkACL - creators is null", Boolean.FALSE);
      return false;
    }

    Object user_id = getUserId(request, user);
    logger.log(Level.FINE, ">>>> Current user is {0} ", user_id);

    for (int i = 0; i < creators.size(); i++)
    {
      JSONObject obj = (JSONObject) creators.get(i);
      logger.log(Level.FINE, ">>>> Found user {0} in ACL.", obj.get("name"));

      if (obj.get("name").equals(user_id))
      {
        logger.exiting(MailDocumentHandler.class.getName(), "checkACL - user exists", Boolean.TRUE);
        return true;
      }
    }
    logger.exiting(MailDocumentHandler.class.getName(), "checkACL - user NOT exists", Boolean.FALSE);
    return false;
  }

  public boolean isExists(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    DocInfo docInfo = getDocumentEntryInfo(request, user);
    IDocumentEntry docEntry = null;
    docEntry = (DocumentEntry) RepositoryServiceUtil.getEntry(user, RepositoryServiceUtil.MAIL_REPO_ID, docInfo.getUri());
    if (docEntry == null)
    {
      return false;
    }
    else
    {
      return true;
    }
  }

  private void storeEntry(HttpServletRequest request, HttpServletResponse response, InputStream ins, String cacheHome, String title,
      JSONObject meta, ICacheDescriptor cacheDesc, IDocumentEntry docEntry, DocInfo docInfo)
  {
    logger.entering(MailDocumentHandler.class.getName(), "storeEntry", new String[] { cacheHome, title });

    StringBuffer msg = new StringBuffer();
    String sha = "";

    try
    {
      sha = cacheDocumentFromHttpStream(cacheHome, ins, title, meta);
    }
    catch (IOException e)
    {
      // clear the incomplete attachment at first
      File fAtt = new File(cacheHome, MailRepository.TEMP_ATTACHEMENT_NAME);
      if (fAtt.exists())
      {
        fAtt.delete();
      }
      File fMeta = new File(cacheHome, CacheStorageManager.CACHE_META_FILE_LABEL);
      if (fMeta.exists())
      {
        fMeta.delete();
      }
      File fTempMeta = new File(cacheHome, CacheStorageManager.TEMP_META_FILE_LABEL);
      if (fTempMeta.exists())
      {
        fTempMeta.delete();
      }
      msg = new StringBuffer();
      msg.append(ServiceCode.S_SEVERE_GET_DOCUMENT_FILE_ERROR);
      msg.append(" " + e);
      msg.append(" The doc is ");
      msg.append(docInfo.getTitle());
      msg.append(" The doc id is ");
      msg.append(docInfo.getUri());
      logger.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.SEVERE_GET_DOCUMENT_FILE_ERROR, msg.toString()));
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }

    // also store SHA-256 into meta
    meta.put(CacheMetaEnum.SHA_DIGEST.getMetaKey(), sha);
    try
    {
      CacheStorageManager.getCacheStorageManager().setCachedTempStorageMeta(cacheDesc, meta);
    }
    catch (CacheDataAccessException e)
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_ACESS_CACHE_DATA);
      msg.append(" The doc is ");
      msg.append(docInfo.getTitle());
      msg.append(" The doc id is ");
      msg.append(docInfo.getUri());
      logger.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_ACESS_CACHE_DATA, msg.toString()));
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }

    // If the document service for such Mime Type cannot be accessed then return;
    IDocumentService docSrv = DocumentServiceUtil.getDocumentService((String) meta.get(CacheMetaEnum.MIME.getMetaKey()));
    if (docSrv == null)
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_UNSUPPORTTED_MIME);
      msg.append("The MIME type of ");
      msg.append(docEntry.getDocUri());
      msg.append(" is " + docEntry.getMimeType());
      logger.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_UNSUPPORTTED_MIME, msg.toString()));
      logger.warning("Unable to get DocumentService....");
      response.setStatus(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
      return;
    }

    response.setStatus(HttpServletResponse.SC_CREATED);

    // setup ACL
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);

    try
    {
      storeACLWithLock(cacheHome, user, cacheDesc, request, response);
    }
    catch (CacheDataAccessException e)
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_ACESS_CACHE_DATA);
      msg.append(" The doc is ");
      msg.append(docInfo.getTitle());
      msg.append(" The doc id is ");
      msg.append(docInfo.getUri());
      logger.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_ACESS_CACHE_DATA, msg.toString()));
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }

    logger.exiting(MailDocumentHandler.class.getName(), "storeEntry");
  }

  private void returnURL(HttpServletRequest request, HttpServletResponse response, IDocumentEntry docEntry, int statusCode)
      throws IOException
  {
    logger.entering(MailDocumentHandler.class.getName(), "returnURL", new Object[] { docEntry.getDocUri(), statusCode });

    String viewDocURL = getViewDocURL(request, docEntry);
    // write the url to return
    JSONObject url = new JSONObject();
    url.put("url", viewDocURL);
    response.setStatus(statusCode);
    response.setContentType("application/json");
    response.getWriter().print(url.toString());

    logger.entering(MailDocumentHandler.class.getName(), "returnURL");
  }

  private String getViewDocURL(HttpServletRequest request, IDocumentEntry docEntry)
  {
    logger.entering(MailDocumentHandler.class.getName(), "getViewDocURL", docEntry.getDocUri());

    // Get host name
    String host = "https://" + request.getServerName();

    // Get relative path
    String id = docEntry.getDocUri();
    /*
     * which case needs this code? it causes problem in viewernext now, comment it out before knowing it's purpose. int index =
     * id.lastIndexOf(IDocumentEntry.DOC_URI_SEP); if (index != -1) { id = id.substring(index + 1); }
     */
    StringBuilder path = new StringBuilder(URLConfig.getContextPath());
    path.append("/app/").append(docEntry.getRepository()).append("/").append(id).append("/content");
    String mime = docEntry.getMimeType();
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
      logger.log(Level.WARNING, "Failed to encode document mimetype. {0}.", mime);
    }
    String retVal = host + path;

    logger.exiting(MailDocumentHandler.class.getName(), "getViewDocURL", retVal);
    return retVal;
  }

  /*
   * returns the SHA-256 for the first
   */
  private String cacheDocumentFromHttpStream(String cacheHome, InputStream ins, String title, JSONObject meta) throws IOException
  {
    logger.entering(MailDocumentHandler.class.getName(), "cacheDocumentFromHttpStream", new String[] { cacheHome, title });

    String sha = "";
    byte[] header = new byte[BLOCK_SZIE];
    int readbytes = 0;
    if (ins != null)
    {
      File f = new File(cacheHome, MailRepository.TEMP_ATTACHEMENT_NAME);
      FileOutputStream o = new FileOutputStream(f);
      byte b[] = new byte[BLOCK_SZIE];
      int n;
      try
      {
        while ((n = ins.read(b)) != -1)
        {
          if (readbytes < BLOCK_SZIE)
            System.arraycopy(b, 0, header, readbytes, n > (BLOCK_SZIE - readbytes) ? (BLOCK_SZIE - readbytes) : n);
          readbytes += n;
          o.write(b, 0, n);
        }
      }
      finally
      {
        o.close();
        ins.close();
      }
    }

    if (readbytes > 0)
      sha = generateSHA256(header, readbytes > BLOCK_SZIE ? BLOCK_SZIE : readbytes);

    meta.put(CacheMetaEnum.SIZE.getMetaKey(), readbytes);

    logger.exiting(MailDocumentHandler.class.getName(), "cacheDocumentFromHttpStream", sha);
    return sha;
  }

  private Object getUserId(HttpServletRequest request, UserBean user)
  {
    String user_id = request.getHeader("X-user-id");
    if (user_id == null)
    {
      user_id = user.getEmail();
    }
    return user_id;
  }

  private DocInfo getDocumentEntryInfo(HttpServletRequest request, UserBean user)
  {
    DocInfo docInfo = new DocInfo();

    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String DAOSKey = pathMatcher.group(1);
    // String uri = generateFileID(DAOSKey);
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
    // docInfo.setUri(uri);
    docInfo.setUri(DAOSKey); // use hashed DAOSkey directly

    logger.log(Level.FINER, "Doc Info: title={0} mimetype={1}, ext={2}, uri={3}", new Object[] { filename, mime, docExtension, DAOSKey });

    return docInfo;
  }

  private String generateSHA256(byte[] b, int n)
  {
    logger.entering(MailDocumentHandler.class.getName(), "generateSHA256", new Object[] { b.length, n });
    String sha = "";
    MessageDigest shadigest;
    try
    {
      shadigest = MessageDigest.getInstance("SHA-256");
      shadigest.update(b, 0, n);
      byte[] rawsha = shadigest.digest();
      BigInteger bigint = new BigInteger(rawsha);
      sha = bigint.toString(16);
    }
    catch (NoSuchAlgorithmException e)
    {
      logger.log(Level.WARNING, "Failed to initiate SHA-256 message digest. " + e.getLocalizedMessage());
    }
    logger.exiting(MailDocumentHandler.class.getName(), "generateSHA256", sha);
    return sha;
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

}
