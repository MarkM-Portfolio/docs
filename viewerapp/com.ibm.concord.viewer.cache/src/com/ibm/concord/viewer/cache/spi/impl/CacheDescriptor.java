/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.cache.spi.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.repository.RepositoryComponent;
import com.ibm.concord.viewer.platform.repository.RepositoryProviderRegistry;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.json.java.JSONObject;

/**
 * @author niebomin
 * 
 */
public abstract class CacheDescriptor implements ICacheDescriptor
{
  private static final Logger logger = Logger.getLogger(CacheDescriptor.class.getName());

  protected String userId;

  protected String customId;

  protected String docUri;

  protected String cacheURI = ""; // URI of cache media. Typical forms in "file:///", "nsf://", etc.

  protected String primaryHash;

  protected String secondaryHash;

  protected String repositoryId;

  protected String cacheHome;

  protected String sharedDataName;

  protected List<String> moreToHash;

  public CacheDescriptor()
  {

  }

  protected void initLocalCache(IDocumentEntry docEntry)
  {
    // DO NOT ADD customer id init here
    repositoryId = docEntry.getRepository();
    cacheHome = getCacheHomeByRepoId(repositoryId);
    sharedDataName = getSharedDataNameByRepoId(repositoryId);

    Map<String, String> params = getLocalCacheParams(getViewContext(), docEntry, cacheHome, this.customId, this.userId);

    primaryHash = params.get(ICacheDescriptor.PRMIARY_HASH);
    secondaryHash = params.get(ICacheDescriptor.SECONDARY_HASH);
    cacheURI = params.get(ICacheDescriptor.LOCAL_PATH);
    docUri = docEntry.getDocUri();

    if (logger.isLoggable(Level.FINE))
    {
      StringBuffer msg = new StringBuffer();
      msg.append("Init cache: cacheUri=").append(cacheURI).append("\t- repository=").append(repositoryId).append("\t- userId=")
          .append(userId).append("\t- customId=").append(customId);
      logger.log(Level.FINE, msg.toString());
    }

  }

  public String getSharedDataName()
  {
    return sharedDataName;
  }

  protected String getSharedDataNameByRepoId(String repoId)
  {

    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
        repoId);
    IRepositoryAdapter adapter = service.getRepository(repoId);
    return adapter.getSharedDataName();
  }

  protected String getCacheHomeByRepoId(String repoId)
  {
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
        repoId);
    IRepositoryAdapter adapter = service.getRepository(repoId);
    return adapter.getCacheHome();
  }

  public Map<String, String> getLocalCacheParams(ViewContext context, IDocumentEntry entry, String cacheHome, String customerId,
      String userId)
  {
    final String[] hash = HashRule.getLocalHash(context, entry);
    String repoId = entry.getRepository();
    String repoType = entry.getRepositoryType();
    String lastModifed = String.valueOf(entry.getModified().getTimeInMillis());
    String docUri = entry.getDocUri();
    String path;
    if (context == ViewContext.VIEW_THUMBNAIL)
    {
      path = ViewerUtil.pathConnect(Arrays.asList(new String[] {
          cacheHome,
          RepositoryServiceUtil.ECM_FILES_REPO_ID.equals(repoId) ? ICacheDescriptor.CACHE_DIR_CCMPREVIEW
              : ICacheDescriptor.CACHE_DIR_TEMPPREVIEW, hash[0], hash[1], docUri, lastModifed }));
    }
    else if (RepositoryServiceUtil.ECM_FILES_REPO_ID.equals(repoId))
    {
      path = ViewerUtil.pathConnect(Arrays.asList(new String[] { cacheHome, customerId, hash[0], hash[1], docUri, lastModifed }));
    }
    else if (RepositoryServiceUtil.MAIL_REPO_ID.equals(repoId))
    {
      path = ViewerUtil.pathConnect(Arrays.asList(new String[] { cacheHome, customerId, hash[0], hash[1], docUri }));
    }
    else if( RepositoryServiceUtil.EXTERNAL_REST_REPO_TYPE.equals(repoType) )
    {
      path = ViewerUtil.pathConnect(Arrays.asList(new String[] { cacheHome, repoId, customerId, hash[0], hash[1], docUri }));
    }
    else
    {
      path = ViewerUtil.pathConnect(Arrays.asList(new String[] { cacheHome, customerId, hash[0], hash[1], docUri }));
    }

    final String s = path;
    return new HashMap<String, String>()
    {
      private static final long serialVersionUID = 1L;

      {
        put(ICacheDescriptor.PRMIARY_HASH, hash[0]);
        put(ICacheDescriptor.SECONDARY_HASH, hash[1]);
        put(ICacheDescriptor.LOCAL_PATH, s);
      }
    };
  }

  public String getCacheHome()
  {
    return cacheHome;
  }

  public String getWorkingDir()
  {
    return cacheURI;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getRelativeURI()
   */
  @Override
  public String getRelativeURI()
  {
    String s1 = cacheURI.replace("\\", "/");
    String s2 = getCacheHome().replace("\\", "/");
    String s = s1.substring(s1.indexOf(s2) + 1);
    return "/" + s;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getMediaURI()
   */
  @Override
  public String getMediaURI()
  {
    return cacheURI + File.separator + "media";
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getTempURI(java.lang.String)
   */
  @Override
  public String getTempURI(String eigenvalue)
  {
    if (eigenvalue == null || eigenvalue.length() == 0)
    {
      return cacheURI + File.separator + "temp";
    }
    else
    {
      return cacheURI + File.separator + "temp" + File.separator + eigenvalue;
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getCacheURI(java.lang.String)
   */
  @Override
  public String getCacheURI(String eigenvalue)
  {
    if (eigenvalue == null || eigenvalue.length() == 0)
    {
      return cacheURI + File.separator + "cache";
    }
    else
    {
      return cacheURI + File.separator + "cache" + File.separator + eigenvalue;
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getInternalURI()
   */
  @Override
  public String getInternalURI()
  {
    return cacheURI;
  }

  @Override
  public String getId()
  {
    return docUri;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getThumbnailURI()
   */
  @Override
  public String getThumbnailURI()
  {
    return getMediaURI() + File.separator + "thumbnails";
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getFullImageURI()
   */
  @Override
  public String getFullImageURI()
  {
    return getMediaURI() + File.separator + "pictures";
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getHtmlURI()
   */
  @Override
  public String getHtmlURI()
  {
    return getMediaURI() + File.separator + "html";
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getHtmlURI()
   */
  @Override
  public String getPdfURI()
  {
    return getMediaURI();
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getTempThumbnailURI()
   */
  @Override
  public String getTempThumbnailURI()
  {
    return getTempURI(null) + File.separator + "thumbnails";
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getTempFullImageURI()
   */
  @Override
  public String getTempFullImageURI()
  {
    return getTempURI(null) + File.separator + "pictures";
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getDocId()
   */
  @Override
  public String getDocId()
  {
    return docUri;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getCustomId()
   */
  @Override
  public String getCustomId()
  {
    return customId;
  }

  public String toString()
  {
    return customId + " " + docUri + " " + cacheURI;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getPrimaryHash()
   */
  @Override
  public String getPrimaryHash()
  {
    return primaryHash;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.viewer.spi.beans.ICacheDescriptor#getSecondaryHash()
   */
  @Override
  public String getSecondaryHash()
  {
    return secondaryHash;
  }

  public abstract boolean accessible();

  public abstract boolean isValid();

  @Override
  public boolean exists()
  {
    File f = new File(getInternalURI());
    boolean b = f.exists();

    logger.log(Level.FINE, "Cache exists: {0}.  File {1} exists: {2}.", new Object[] { b, f.getAbsoluteFile(), f.exists() });
    return b;
  }

  public static boolean metaFileValid(File metaFile)
  {
    logger.entering(CacheDescriptor.class.getName(), "metaFileValid", metaFile.getAbsolutePath());

    boolean ret = true;
    // File metaFile = new File(getInternalURI(), ICacheDescriptor.CACHE_META_FILE_LABEL);
    metaFile.getParentFile().list();
    if (!metaFile.exists() || !metaFile.isFile())
    {
      logger.log(Level.FINE, "Not a valid meta file.  {0} is missing.", metaFile.getAbsolutePath());
      ret = false;
    }

    // JSONObject cacheMeta = null;
    if (ret)
    {
      try
      {
        JSONObject metaJson = JSONObject.parse(new AutoCloseInputStream(new FileInputStream(metaFile)));
        if (metaJson.isEmpty())
        {
          logger.log(Level.FINE, "Not a valid meta file.  {0} is empty.", metaFile.getAbsolutePath());
          ret = false;
        }
      }
      catch (IOException e)
      {
        logger.log(Level.SEVERE, "Read Cache Meta File {0} Error.", metaFile.getAbsolutePath());
        ret = false;
      }
    }
    // ignore MD5 compare
    logger.exiting(CacheDescriptor.class.getName(), "metaFileValid", ret);
    return ret;
  }
  
  @Override
  public boolean checkPasswordHash(String password)
  {
    return true;
  }
  
  @Override
  public boolean isPasswordHashExist()
  {
    return false;
  }

}
