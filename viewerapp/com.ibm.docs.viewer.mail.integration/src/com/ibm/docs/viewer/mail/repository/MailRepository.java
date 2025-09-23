package com.ibm.docs.viewer.mail.repository;

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
import com.ibm.concord.viewer.spi.beans.ACE;
import com.ibm.concord.viewer.spi.beans.ActionEnum;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.Permission;
import com.ibm.concord.viewer.spi.beans.SimpleLocalEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class MailRepository implements IRepositoryAdapter
{

  public static final Logger logger = Logger.getLogger(MailRepository.class.getName());

  public static final String TEMP_ATTACHEMENT_NAME = "mailAttachment";

  private String repoType;

  private String cacheHome;

  private String sharedDataName;
  
  private boolean isCacheEncrypted = false;

  @Override
  public void init(JSONObject config)
  {
    if (config.get("id") == null)
    {
      throw new IllegalStateException("<id> setting is missing from repository adapter config.");
    }

    repoType = (String) config.get("id");
    
    try {
      isCacheEncrypted = Boolean.valueOf(((String)config.get(ConfigConstants.IS_ENCRYPTED)).toLowerCase());
    } catch(Exception e) {
      // do nothing
    }
    
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
    
    sharedDataName=ViewerConfig.getInstance().getSharedDataName(type);

  }

  @Override
  public boolean impersonationAllowed()
  {
    return false;
  }

  @Override
  public IDocumentEntry getDocument(UserBean requester, String docUri, String mime) throws RepositoryAccessException
  {
    DocInfo docInfo = getDocInfo(requester, docUri, mime);
    if (docInfo == null)
      return null;

    String mimeType = docInfo.getMimeType();
    String title = docInfo.getTitle();
    String ext = docInfo.getExtension();
    int size = docInfo.getSize();
    Set<Permission> permission = Permission.VIEW_SET;
    String creator[] = { requester.getId() };
    Calendar ca = Calendar.getInstance();
    ca.setTimeInMillis(0);

    // check the permission
    ICacheDescriptor draftDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(requester,
        new SimpleLocalEntry(docUri, mimeType, null, RepositoryServiceUtil.MAIL_REPO_ID));
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

    IDocumentEntry docEntry = new MailDocumentEntry(repoType, docUri, mimeType, title, ext, permission, ca, creator, size);
    return docEntry;
  }

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

  private DocInfo getDocInfo(UserBean requester, String docUri, String mime) throws RepositoryAccessException
  {
    DocInfo docInfo = getDocInfoFromMeta(requester, docUri, mime);
    // if (docInfo == null)
    // {
    // return null;
    // }
    // if (DocumentTypeUtils.isPDF(docInfo.getMimeType()))
    // {
    // // it CAN not be PDF
    // logger.warning("Error! Not supported mimetype by HTML view.  Doc id: " + docUri);
    // return null;
    // }
    return docInfo;
  }

  private DocInfo getDocInfoFromMeta(UserBean requester, String docUri, String mime) throws RepositoryAccessException
  {
    try
    {
      ICacheDescriptor draftDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(requester,
          new SimpleLocalEntry(docUri, mime, null, RepositoryServiceUtil.MAIL_REPO_ID));
      if (draftDesc.exists())
      {
        return getDocInfoFromCacheMeta(draftDesc);
      }
    }
    catch (Exception e)
    {
      return null;
    }
    return null;
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
        Object szObj = cachedMeta.get("SIZE");
        if (szObj != null)
          docInfo.setSize(((Long) szObj).intValue());

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

  private DocInfo getDocInfoFromMeta(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    try
    {
      ICacheDescriptor draftDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(requester, docEntry);
      if (draftDesc.exists())
      {
        return getDocInfoFromCacheMeta(draftDesc);
      }
    }
    catch (Exception e)
    {
      return null;
    }
    return null;
  }

  @Override
  public InputStream getContentStream(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    String docUri = docEntry.getDocUri();
    DocInfo docInfo = getDocInfoFromMeta(requester, docEntry);
    if (docInfo == null)
    {
      return null;
    }

    try
    {
      ICacheDescriptor draftDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(requester,
          new SimpleLocalEntry(docUri, docInfo.getMimeType(), null, RepositoryServiceUtil.MAIL_REPO_ID));
      return new FileInputStream(new File(draftDesc.getInternalURI(), MailRepository.TEMP_ATTACHEMENT_NAME));
    }
    catch (IOException e)
    {
      return null;
    }

  }

  @Override
  public IDocumentEntry[] getVersions(UserBean requester, String docUri) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public void addACE(UserBean requester, String docUri, ACE anACE) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
  }

  @Override
  public Vector<ACE> getAllACE(UserBean requester, IDocumentEntry docEntry) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public Iterator<IDocumentEntry> find(String timestamp, int pageSize, ActionEnum actionEnum) throws RepositoryAccessException
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
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
    return isCacheEncrypted;
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
    throw new UnsupportedOperationException("Mail repository doesn't support log event.");
  }

  @Override
  public void setThumbnail(UserBean requester, String docUri, String lastMod) throws RepositoryAccessException      
  {
    throw new UnsupportedOperationException("repository doesn't support setThumbnail.");      
  }
  
  @Override
  public String getRepositoryType()
  {
    return RepositoryServiceUtil.MAIL_REPO_ID;
  }    
}
