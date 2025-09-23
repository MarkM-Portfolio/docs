/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.tempstorage.repository;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Calendar;
import java.util.Iterator;
import java.util.Set;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.exception.CacheStorageAccessException;
import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.config.ConfigConstants.CacheType;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.MD5;
import com.ibm.concord.viewer.spi.beans.ACE;
import com.ibm.concord.viewer.spi.beans.ActionEnum;
import com.ibm.concord.viewer.spi.beans.SimpleLocalEntry;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author yindali@cn.ibm.com
 * 
 */

public class TempStorageRepository implements IRepositoryAdapter
{
  public static final String REPO_ID_TEMP_STORAGE = "tempstorage";

  public static final String VERSION_LABEL = "1";

  public static final String TEMP_FILE_NAME = "tempstorage";

  private static final Logger logger = Logger.getLogger(TempStorageRepository.class.getName());

  private String cacheHome;

  private String sharedDataName;

  @Override
  public void init(JSONObject config)
  {
    CacheType type = CacheType.NFS;
    try
    {
      type = CacheType.valueOf(((String) config.get(ConfigConstants.CACHE_TYPE)).toUpperCase());
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Cache_type is not configured or the value is not accepted. The default value of nfs is used.");
    }
    cacheHome = ViewerConfig.getInstance().getDataRoot(type);

    sharedDataName = ViewerConfig.getInstance().getSharedDataName(type);
  }

  @Override
  public boolean impersonationAllowed()
  {
    return false;
  }

  @Override
  public IDocumentEntry getDocument(UserBean requester, String docUri, String mime) throws RepositoryAccessException
  {
    DocInfo docInfo = getDocInfoFromMeta(requester, docUri, mime);
    if (docInfo == null)
      return null;

    String mimeType = docInfo.getMimeType();
    String version = VERSION_LABEL;
    String title = docInfo.getTitle();
    String ext = docInfo.getExtension();
    Set<Permission> permission = Permission.VIEW_SET;
    String creator[] = { requester.getId() };
    Calendar ca = Calendar.getInstance();
    ca.setTimeInMillis(0);

    // check the permission
    ICacheDescriptor draftDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(requester,
        new SimpleLocalEntry(docUri, mimeType, RepositoryServiceUtil.TEMP_STORAGE_REPO_ID));
    // getLCFilesCacheDescriptor(requester.getCustomerId(), docUri,
    // TempStorageRepository.VERSION_LABEL, DocumentTypeUtils.isHTML(/* requester, */mimeType));
    try
    {
      JSONObject author = CacheStorageManager.getCacheStorageManager().getCachedACLMeta(draftDesc);
      if (!isUserInACL(requester.getEmail(), author))
      {
        permission = Permission.EMPTY_SET;
      }
    }
    catch (CacheStorageAccessException e)
    {
      throw new RepositoryAccessException(e);
    }
    catch (CacheDataAccessException e)
    {
      throw new RepositoryAccessException(e);
    }

    IDocumentEntry docEntry = new DocumentEntry(docUri, mimeType, version, title, ext, permission, ca, creator);
    return docEntry;
  }

  @Override
  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    String docUri = docEntry.getDocUri();
    DocInfo docInfo = getDocInfoFromMeta(requester, docUri, docEntry.getMimeType());// getDocInfoFromMeta(requester, docUri);
    if (docInfo == null)
    {
      return null;
    }

    try
    {
      ICacheDescriptor draftDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(requester,
          new SimpleLocalEntry(docUri, docInfo.getMimeType(), RepositoryServiceUtil.TEMP_STORAGE_REPO_ID));
      // getLCFilesCacheDescriptor(requester.getCustomerId(), docUri,
      // TempStorageRepository.VERSION_LABEL, DocumentTypeUtils.isHTML(/* requester, */docInfo.getMimeType()));
      return new FileInputStream(new File(draftDesc.getInternalURI(), TempStorageRepository.TEMP_FILE_NAME));
    }
    catch (IOException e)
    {
      return null;
    }

  }

  @Override
  public IDocumentEntry[] getVersions(UserBean requester, String docUri) throws RepositoryAccessException
  {
    return null;
  }

  @Override
  public void addACE(UserBean requester, String docUri, ACE anACE) throws RepositoryAccessException
  {

  }

  @Override
  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    return null;
  }

  @Override
  public Iterator<IDocumentEntry> find(String timestamp, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException
  {
    return null;
  }

  private static String getDocId(String docUri)
  {
    String id = docUri;
    int index = docUri.lastIndexOf(IDocumentEntry.DOC_URI_SEP);
    if (index != -1)
    {
      id = id.substring(index + 1);
    }
    return id;
  }

  private DocInfo getDocInfoFromCacheMeta(ICacheDescriptor draftDesc)
  {
    try
    {
      JSONObject cachedMeta = CacheStorageManager.getCacheStorageManager().getCachedTempstorageMeta(draftDesc);
      if (cachedMeta != null)
      {
        DocInfo docInfo = new DocInfo();
        String mime = (String) cachedMeta.get("MIME");
        String ext = (String) cachedMeta.get("EXT");
        String title = (String) cachedMeta.get("TITLE");
        docInfo.setExtension(ext);
        docInfo.setMimeType(mime);
        docInfo.setTitle(title);
        docInfo.setInputStream(null);
        return docInfo;
      }
      else
      {
        return null;
      }
    }
    catch (Exception e)
    {
      return null;
    }
  }

  private DocInfo getDocInfoFromMeta(UserBean requester, String docUri, String mime) throws RepositoryAccessException
  {
    logger.entering(TempStorageRepository.class.getName(), "getDocInfoFromMeta", new Object[] { requester.getId(), docUri });

    DocInfo res = null;
    try
    {
      ICacheDescriptor draftDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(requester,
          new SimpleLocalEntry(docUri, mime, RepositoryServiceUtil.TEMP_STORAGE_REPO_ID));
      if (draftDesc.exists())
      {
        res = getDocInfoFromCacheMeta(draftDesc);
      }
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "Failed to get meta info due to unexpected error. ", e);
    }

    logger.exiting(TempStorageRepository.class.getName(), "getDocInfoFromMeta", res);

    return res;
  }

  // iNotes has a 56byte docid. That's too long for Symphony saving. So here is a workaround for the Symphony's saving issue
  public static String getUri(String userid, String docUri)
  {
    String id = getDocId(docUri);
    id = MD5.getMD5(userid + IDocumentEntry.DOC_URI_SEP + id);
    return id;
  }

  // public static boolean isHTML(UserBean user,String type)
  // {
  // boolean isSpreadsheet = ODS.equalsIgnoreCase(type)||XLS.equalsIgnoreCase(type)||XLSX.equalsIgnoreCase(type);
  // return HTMLViewConfig.isEnable() && isSpreadsheet ;
  // }

  public static boolean isUserInACL(String user, JSONObject ACL)
  {

    if (ACL == null)
    {
      return false;
    }

    JSONArray creators = (JSONArray) ACL.get("creator");
    if (creators == null)
    {
      return false;
    }

    for (int i = 0; i < creators.size(); i++)
    {
      JSONObject obj = (JSONObject) creators.get(i);
      if (obj.get("name").equals(user))
      {
        return true;
      }
    }
    return false;
  }

  public String getFilesPath()
  {
    throw new UnsupportedOperationException();
  }

  @Override
  public JSONObject getRepositoryConfig()
  {
    throw new UnsupportedOperationException();
  }
  
  public boolean isCacheEncrypt()
  {
    return false;
  }

  @Override
  public String getCacheHome()
  {
    return cacheHome;
  }

  @Override
  public String getSharedDataName()
  {
    return sharedDataName;
  }

  @Override
  public void logEvent(UserBean requester, String docUri, String type, String versionId) throws RepositoryAccessException,
      UnsupportedOperationException
  {
    throw new UnsupportedOperationException("iNotes repository doesn't support log event.");
  }

  @Override
  public void setThumbnail(UserBean requester, String docUri, String lastMod) throws RepositoryAccessException      
  {
    throw new UnsupportedOperationException("repository doesn't support setThumbnail.");      
  }
  
  @Override
  public String getRepositoryType()
  {
    return RepositoryServiceUtil.TEMP_STORAGE_REPO_ID;
  }     
}
