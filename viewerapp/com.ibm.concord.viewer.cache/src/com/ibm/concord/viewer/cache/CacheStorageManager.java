/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.cache;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;
import org.apache.commons.io.input.AutoCloseInputStream;

import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.exception.CacheStorageAccessException;
import com.ibm.concord.viewer.cache.section.CacheSection;
import com.ibm.concord.viewer.cache.spi.impl.CacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.HTMLCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.HashRule;
import com.ibm.concord.viewer.cache.spi.impl.ImageCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.PdfCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.SnapshotDescriptor;
import com.ibm.concord.viewer.config.HTMLViewConfig;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.cache.CacheComponent;
import com.ibm.concord.viewer.platform.component.IComponent;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.platform.util.ViewRule;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.CacheStorageAdapterFactory;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.cache.ICacheStorageAdapter;
import com.ibm.concord.viewer.spi.util.ZipUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * 
 * @author Li Wang, wliwang@cn.ibm.com
 * 
 */
public class CacheStorageManager
{
  public static final Logger LOGGER = Logger.getLogger(CacheStorageManager.class.getName());

  private static CacheStorageManager cacheStorageManager = null;

  public static final String CACHE_META_FILE_LABEL = "meta.json";

  private static final String RENDITION_META_FILE_LABEL = "images.json";

  public static final String ACL_META_FILE_LABEL = "ACL.json";

  public static final String TEMP_META_FILE_LABEL = "tempMeta.json";

  public static final String MEDIA_INFO_FILE_LABEL = "media";

  // private static boolean isSpreadsheetCache=false;

  /**
   * Get the CacheStorageManager instance, which will ensure access to cache storage in thread safe manner.
   * 
   * @return, the thread safe storage manager.
   */
  public static CacheStorageManager getCacheStorageManager()
  {
    if (cacheStorageManager == null)
    {
      cacheStorageManager = new CacheStorageManager();
    }
    return cacheStorageManager;
  }

  public ICacheDescriptor getCacheDescriptor(UserBean user, IDocumentEntry docEntry)
  {
    return getCacheDescriptor(user, docEntry, null);
  }

  public ICacheDescriptor getCacheDescriptor(UserBean user, IDocumentEntry docEntry, String userAgent)
  {
    return getCacheDescriptor(user, docEntry, userAgent, "");
  }

  @SuppressWarnings("serial")
  public ICacheDescriptor getCacheDescriptor(final UserBean user, final IDocumentEntry docEntry, final String userAgent, final String mode)
  {
    LOGGER.entering(CacheStorageManager.class.getName(), "getCacheDescriptor",
        new Object[] { docEntry.getDocUri(), docEntry.getMimeType() });
    try
    {
      HashMap<String, Object> params = new HashMap<String, Object>()
      {
        {
          put(ViewRule.PARAM_DOCENTRY, docEntry);
          put(ViewRule.PARAM_USER_AGENT, userAgent);
          put(ViewRule.PARAM_USER, user);
          put(ViewRule.PARAM_MODE_COMPACT, (mode != null && ViewRule.PARAM_MODE_COMPACT.equals(mode)) ? Boolean.TRUE : Boolean.FALSE);
        }
      };

      ViewContext context = ViewRule.getViewContext(params);
      switch (context)
        {
          case VIEW_IMAGE :
            LOGGER.exiting(CacheStorageManager.class.getName(), "getCacheDescriptor", "ImageCacheDescriptor");
            return new ImageCacheDescriptor(user, docEntry);
          case VIEW_HTML_NON_SS :
            LOGGER.exiting(CacheStorageManager.class.getName(), "getCacheDescriptor", "HTMLCacheDescriptor");
            return new HTMLCacheDescriptor(user, docEntry);
          case VIEW_HTML_SS :
            LOGGER.exiting(CacheStorageManager.class.getName(), "getCacheDescriptor", "SnapshotDescriptor");
            return new SnapshotDescriptor(user, docEntry);
          case VIEW_PDF :
            LOGGER.exiting(CacheStorageManager.class.getName(), "getCacheDescriptor", "PdfCacheDescriptor");
            return new PdfCacheDescriptor(user, docEntry);
          default:
            LOGGER.exiting(CacheStorageManager.class.getName(), "getCacheDescriptor", "null");
            return null;
        }
    }
    catch (Exception e)
    {
      LOGGER.log(Level.WARNING, "Failed to get cache descriptor.", e);
      LOGGER.exiting(CacheStorageManager.class.getName(), "getCacheDescriptor", "null");
      return null;
    }
  }

  protected CacheStorageManager()
  {
  }

  public void prepareCache(final ICacheDescriptor cacheDescriptor) throws CacheStorageAccessException, CacheDataAccessException
  {
    LOGGER.entering(CacheStorageManager.class.getName(), "prepareCache", cacheDescriptor);

    new CriticalSection()
    {
      protected Object perform() throws CacheStorageAccessException, CacheDataAccessException
      {
        // do nothing
        return null;
      }
    }.execute(cacheDescriptor);

    LOGGER.exiting(CacheStorageManager.class.getName(), "prepareCache");
  }

  /**
   * @Description: TODO create a cache
   * @param cacheDescriptor
   * @param mediaStream
   * @param meta
   * @throws CacheStorageAccessException
   * @throws CacheDataAccessException
   */
  public void newCache(final ICacheDescriptor cacheDescriptor, final InputStream mediaStream, final Map<CacheMetaEnum, Object> meta,
      final JSONObject rendtionMeta) throws CacheStorageAccessException, CacheDataAccessException
  {
    LOGGER.entering(CacheStorageManager.class.getName(), "newCache", new Object[] { cacheDescriptor, meta });

    new CriticalSection()
    {
      protected Object perform() throws CacheStorageAccessException, CacheDataAccessException
      {
        /**
         * ignore if mediaStream is null
         */
        if (/* mediaStream != null && */meta != null)
        {
          // getCacheStorageManager().discardCache(cacheDescriptor);
        }

        OutputStream metaFileStream = null;
        OutputStream renditionMetaStream = null;
        try
        {
          IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
          Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);

          {
            JSONObject cacheMeta = new JSONObject();
            cacheMeta.put(CacheMetaEnum.CUSTOMER_ID.getMetaKey(), cacheDescriptor.getCustomId());
            cacheMeta.put(CacheMetaEnum.DOC_ID.getMetaKey(), cacheDescriptor.getDocId());
            {
              cacheMeta.put(CacheMetaEnum.MIME.getMetaKey(), meta.get(CacheMetaEnum.MIME));
              cacheMeta.put(CacheMetaEnum.TITLE.getMetaKey(), meta.get(CacheMetaEnum.TITLE));
              cacheMeta.put(CacheMetaEnum.EXT.getMetaKey(), meta.get(CacheMetaEnum.EXT));
              cacheMeta.put(CacheMetaEnum.CACHE_LAST_BUILD.getMetaKey(),
                  AtomDate.valueOf((Calendar) meta.get(CacheMetaEnum.CACHE_LAST_BUILD)).getValue());
              cacheMeta.put(CacheMetaEnum.CACHE_BASE_VERSION.getMetaKey(), meta.get(CacheMetaEnum.CACHE_BASE_VERSION));
            }
            metaFileStream = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getInternalURI(), CACHE_META_FILE_LABEL,
                storageAdapter).getOutputStream();
            cacheMeta.serialize(metaFileStream, true);
            // TODO: avoid image.json generated for HTML viewer.

            if (rendtionMeta != null)
            {
              renditionMetaStream = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getInternalURI(), RENDITION_META_FILE_LABEL,
                  storageAdapter).getOutputStream();
              rendtionMeta.serialize(renditionMetaStream);
            }
            else
            {
              LOGGER.log(Level.WARNING, "Rendtion meta is null, so image.json is not created");
            }

          }

          if (mediaStream != null)
          {
            ZipUtil.unzip(new AutoCloseInputStream(mediaStream), cacheDescriptor.getMediaURI());
          }

        }
        catch (IOException e)
        {
          LOGGER.log(Level.SEVERE, "New Cache Failed due to meta file initialization or media files population failed.  {0} {1}",
              new Object[] { cacheDescriptor, e });
          throw new CacheStorageAccessException(cacheDescriptor, e);
        }
        finally
        {
          if (metaFileStream != null)
          {
            try
            {
              metaFileStream.close();
            }
            catch (IOException e)
            {
              LOGGER.log(Level.WARNING, "New Cache with WARNING from closing meta file OutputStream. {0} {1}", new Object[] {
                  cacheDescriptor, e });
              throw new CacheStorageAccessException(cacheDescriptor, e);
            }
          }
          if (renditionMetaStream != null)
          {
            try
            {
              renditionMetaStream.close();
            }
            catch (IOException e)
            {
              LOGGER.log(Level.WARNING, "New Cache with WARNING from closing meta file OutputStream. {0} {1}", new Object[] {
                  cacheDescriptor, e });
              throw new CacheStorageAccessException(cacheDescriptor, e);
            }
          }
        }

        return null;
      }
    }.execute(cacheDescriptor);

    LOGGER.exiting(CacheStorageManager.class.getName(), "newCache");
  }

  public void setCachedTempStorageMeta(final ICacheDescriptor cacheDescriptor, final JSONObject tempstorageMeta)
      throws CacheDataAccessException
  {

    LOGGER.entering(CacheStorageManager.class.getName(), "setCachedTempStorageMeta", new Object[] { cacheDescriptor, tempstorageMeta });

    try
    {
      new CriticalSection()
      {
        protected Object perform() throws CacheStorageAccessException, CacheDataAccessException
        {
          setTempstorageMeta(cacheDescriptor, tempstorageMeta);
          return null;
        }
      }.execute(cacheDescriptor);
    }
    catch (CacheStorageAccessException e)
    {
      LOGGER.log(Level.SEVERE, "CacheStorageManager Internal Error. {0} {1}", new Object[] { cacheDescriptor, e });
      throw new IllegalStateException();
    }

    LOGGER.exiting(CacheStorageManager.class.getName(), "setCachedImagesMeta");
  }

  protected void setTempstorageMeta(ICacheDescriptor cacheDescriptor, JSONObject tempstorageMeta) throws CacheStorageAccessException,
      CacheDataAccessException
  {

    IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
    Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);

    ICacheStorageAdapter infoFile = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getInternalURI(), TEMP_META_FILE_LABEL,
        storageAdapter);

    OutputStream os = null;
    try
    {
      os = infoFile.getOutputStream();
      tempstorageMeta.serialize(os, true);
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, "Store ACL Information File Failed. {0} {1} {2}", new Object[] { cacheDescriptor, tempstorageMeta, e });
      throw new CacheStorageAccessException(cacheDescriptor, e);
    }
    finally
    {
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (IOException e)
        {
          LOGGER.log(Level.WARNING, "Close ACL Information File. {0} {1} {2}", new Object[] { cacheDescriptor, tempstorageMeta, e });
          throw new CacheStorageAccessException(cacheDescriptor, e);
        }
      }
    }
  }

  public JSONObject getCachedTempstorageMeta(final ICacheDescriptor cacheDescriptor) throws CacheStorageAccessException,
      CacheDataAccessException
  {
    LOGGER.entering(CacheStorageManager.class.getName(), "getCachedTempstorageMeta", cacheDescriptor);

    JSONObject result = (JSONObject) new CriticalSection()
    {
      protected Object perform() throws CacheStorageAccessException, CacheDataAccessException
      {
        JSONObject meta = getTempstorageMeta(cacheDescriptor);

        LOGGER.log(Level.FINE, "Cache Bufferred Messages Out {0}", cacheDescriptor);
        return meta;
      }
    }.execute(cacheDescriptor);

    LOGGER.exiting(CacheStorageManager.class.getName(), "getCachedImagesMeta", result);

    return result;
  }

  protected JSONObject getTempstorageMeta(ICacheDescriptor cacheDescriptor) throws CacheStorageAccessException, CacheDataAccessException
  {
    JSONObject json = null;
    try
    {
      IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
      Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);

      ICacheStorageAdapter infoFile = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getInternalURI(), TEMP_META_FILE_LABEL,
          storageAdapter);

      json = JSONObject.parse(new AutoCloseInputStream(infoFile.getInputStream()));
    }
    catch (IOException e)
    {
      // if it's a JSONObject, this might be generated by old code base
      // reset the file to new format
      LOGGER.log(Level.SEVERE, "Reading ACL Information File Failed. {0} {1}", new Object[] { cacheDescriptor, e });
    }

    return json;
  }

  public void setCachedACLMeta(final ICacheDescriptor cacheDescriptor, final JSONObject ACLMeta) throws CacheDataAccessException
  {

    LOGGER.entering(CacheStorageManager.class.getName(), "setCachedACLMeta", new Object[] { cacheDescriptor, ACLMeta });

    try
    {
      new CriticalSection()
      {
        protected Object perform() throws CacheStorageAccessException, CacheDataAccessException
        {
          setACLMeta(cacheDescriptor, ACLMeta);
          return null;
        }
      }.execute(cacheDescriptor);
    }
    catch (CacheStorageAccessException e)
    {
      LOGGER.log(Level.SEVERE, "CacheStorageManager Internal Error. {0} {1}", new Object[] { cacheDescriptor, e });
      throw new IllegalStateException();
    }

    LOGGER.exiting(CacheStorageManager.class.getName(), "setCachedImagesMeta");
  }

  public JSONObject getCachedACLMeta(final ICacheDescriptor cacheDescriptor) throws CacheStorageAccessException, CacheDataAccessException
  {
    LOGGER.entering(CacheStorageManager.class.getName(), "getCachedACLMeta", cacheDescriptor);

    JSONObject result = (JSONObject) new CriticalSection()
    {
      protected Object perform() throws CacheStorageAccessException, CacheDataAccessException
      {
        JSONObject meta = getACLMeta(cacheDescriptor);

        LOGGER.log(Level.FINE, "Cache Bufferred Messages Out {0}", cacheDescriptor);
        return meta;
      }
    }.execute(cacheDescriptor);

    LOGGER.exiting(CacheStorageManager.class.getName(), "getCachedImagesMeta", result);

    return result;
  }

  protected void setACLMeta(ICacheDescriptor cacheDescriptor, JSONObject ACLMeta) throws CacheStorageAccessException,
      CacheDataAccessException
  {
    IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
    Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);

    ICacheStorageAdapter infoFile = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getInternalURI(), ACL_META_FILE_LABEL,
        storageAdapter);

    OutputStream os = null;
    InputStream ins = null;
    try
    {
      JSONArray creatorList = null;
      // Get user list
      if (infoFile.exists())
      {
        ins = infoFile.getInputStream();
        JSONObject creator = JSONObject.parse(ins);
        creatorList = (JSONArray) creator.get("creator");
      }

      if (creatorList == null)
      {
        creatorList = new JSONArray();
      }

      // put the meta info into the list
      // check if exist first
      boolean bUserExist = false;
      for (int i = 0; i < creatorList.size(); i++)
      {
        JSONObject creator = (JSONObject) creatorList.get(i);
        if (creator.get("name").equals(ACLMeta.get("name")))
        {
          bUserExist = true;
          break;
        }
      }

      // write to json file
      if (!bUserExist)
      {
        creatorList.add(ACLMeta);
        JSONObject acl = new JSONObject();
        acl.put("creator", creatorList);

        os = infoFile.getOutputStream();
        acl.serialize(os, true);
      }
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, "Store ACL Information File Failed. {0} {1} {2}", new Object[] { cacheDescriptor, ACLMeta, e });
      throw new CacheStorageAccessException(cacheDescriptor, e);
    }
    finally
    {
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (IOException e)
        {
          LOGGER.log(Level.WARNING, "Close ACL Information File. {0} {1} {2}", new Object[] { cacheDescriptor, ACLMeta, e });
          throw new CacheStorageAccessException(cacheDescriptor, e);
        }
      }

      if (ins != null)
      {
        try
        {
          ins.close();
        }
        catch (IOException e)
        {
          LOGGER.log(Level.WARNING, "Close ACL Information File. {0} {1} {2}", new Object[] { cacheDescriptor, ACLMeta, e });
          throw new CacheStorageAccessException(cacheDescriptor, e);
        }
      }
    }
  }

  protected JSONObject getACLMeta(ICacheDescriptor cacheDescriptor) throws CacheStorageAccessException, CacheDataAccessException
  {
    JSONObject json = null;
    try
    {
      IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
      Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);

      ICacheStorageAdapter infoFile = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getInternalURI(), ACL_META_FILE_LABEL,
          storageAdapter);

      json = JSONObject.parse(new AutoCloseInputStream(infoFile.getInputStream()));
    }
    catch (IOException e)
    {
      // if it's a JSONObject, this might be generated by old code base
      // reset the file to new format
      LOGGER.log(Level.SEVERE, "Reading ACL Information File Failed. {0} {1}", new Object[] { cacheDescriptor, e });
    }

    return json;
  }

  public void deleteCachedACLMeta(final ICacheDescriptor cacheDescriptor, final JSONObject ACLMeta) throws CacheDataAccessException
  {

    LOGGER.entering(CacheStorageManager.class.getName(), "deleteCachedACLMeta", new Object[] { cacheDescriptor, ACLMeta });

    try
    {
      new CriticalSection()
      {
        protected Object perform() throws CacheStorageAccessException, CacheDataAccessException
        {
          deleteACLMeta(cacheDescriptor, ACLMeta);
          return null;
        }
      }.execute(cacheDescriptor);
    }
    catch (CacheStorageAccessException e)
    {
      LOGGER.log(Level.SEVERE, "CacheStorageManager Internal Error. {0} {1}", new Object[] { cacheDescriptor, e });
      throw new IllegalStateException();
    }

    LOGGER.exiting(CacheStorageManager.class.getName(), "deleteCachedImagesMeta");
  }

  protected void deleteACLMeta(ICacheDescriptor cacheDescriptor, final JSONObject ACLMeta) throws CacheStorageAccessException,
      CacheDataAccessException
  {
    IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
    Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);

    ICacheStorageAdapter infoFile = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getInternalURI(), ACL_META_FILE_LABEL,
        storageAdapter);

    OutputStream os = null;
    InputStream ins = null;
    try
    {
      JSONArray creatorList = null;
      // Get user list
      if (infoFile.exists())
      {
        ins = infoFile.getInputStream();
        JSONObject creator = JSONObject.parse(ins);
        creatorList = (JSONArray) creator.get("creator");
      }

      if (creatorList == null)
      {
        creatorList = new JSONArray();
      }

      // delete the meta info into the list
      for (int i = 0; i < creatorList.size(); i++)
      {
        JSONObject creator = (JSONObject) creatorList.get(i);
        if (creator.get("name").equals(ACLMeta.get("name")))
        {
          creatorList.remove(i);
          JSONObject acl = new JSONObject();
          acl.put("creator", creatorList);
          os = infoFile.getOutputStream();
          acl.serialize(os, true);
          break;
        }
      }
    }
    catch (IOException e)
    {
      LOGGER.log(Level.SEVERE, "Store ACL Information File Failed. {0} {1} {2}", new Object[] { cacheDescriptor, ACLMeta, e });
      throw new CacheStorageAccessException(cacheDescriptor, e);
    }
    finally
    {
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (IOException e)
        {
          LOGGER.log(Level.WARNING, "Close ACL Information File. {0} {1} {2}", new Object[] { cacheDescriptor, ACLMeta, e });
          throw new CacheStorageAccessException(cacheDescriptor, e);
        }
      }

      if (ins != null)
      {
        try
        {
          ins.close();
        }
        catch (IOException e)
        {
          LOGGER.log(Level.WARNING, "Close ACL Information File. {0} {1} {2}", new Object[] { cacheDescriptor, ACLMeta, e });
          throw new CacheStorageAccessException(cacheDescriptor, e);
        }
      }
    }
  }

  protected byte[] MD5(Map<CacheMetaEnum, Object> meta)
  {

    String customId = (String) meta.get(CacheMetaEnum.CUSTOMER_ID);
    String docId = (String) meta.get(CacheMetaEnum.DOC_ID);
    String version = (String) meta.get(CacheMetaEnum.CACHE_BASE_VERSION);
    String docMime = (String) meta.get(CacheMetaEnum.MIME);
    String docTitle = (String) meta.get(CacheMetaEnum.TITLE);
    String docExt = (String) meta.get(CacheMetaEnum.EXT);

    StringBuffer sb = new StringBuffer();
    sb.append(customId);
    sb.append(docId);
    sb.append(version);
    sb.append(docMime);
    sb.append(docTitle);
    sb.append(docExt);

    try
    {
      return MessageDigest.getInstance("MD5").digest(sb.toString().getBytes());
    }
    catch (NoSuchAlgorithmException e)
    {
      LOGGER.log(Level.SEVERE, "Can not find Java MD5 algorithm, cache storage damaged. {0}", e);
      throw new IllegalArgumentException(e);
    }
  }

  abstract class CriticalSection
  {
    public Object execute(ICacheDescriptor cacheDescriptor) throws CacheStorageAccessException, CacheDataAccessException
    {
      prepareCacheInternal(cacheDescriptor);
      prepareCacheMeta(cacheDescriptor);
      prepareCacheTempFolder(cacheDescriptor);

      return perform();

    }

    /**
     * @Description: TODO set images meta
     * @param cacheDescriptor
     * @param imagesMeta
     * @throws CacheStorageAccessException
     * @throws CacheDataAccessException
     */
    protected void setImagesMeta(ICacheDescriptor cacheDescriptor, JSONObject imagesMeta) throws CacheStorageAccessException,
        CacheDataAccessException
    {
      IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
      Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);

      ICacheStorageAdapter infoFile = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getInternalURI(),
          RENDITION_META_FILE_LABEL, storageAdapter);
      OutputStream os = null;
      try
      {
        os = infoFile.getOutputStream();
        imagesMeta.serialize(os, true);
      }
      catch (IOException e)
      {
        LOGGER.log(Level.SEVERE, "Store Image Information File Failed. {0} {1} {2}", new Object[] { cacheDescriptor, imagesMeta, e });
        throw new CacheStorageAccessException(cacheDescriptor, e);
      }
      finally
      {
        if (os != null)
        {
          try
          {
            os.close();
          }
          catch (IOException e)
          {
            LOGGER.log(Level.WARNING, "Close Image Information File. {0} {1} {2}", new Object[] { cacheDescriptor, imagesMeta, e });
            throw new CacheStorageAccessException(cacheDescriptor, e);
          }
        }
      }
    }

    /**
     * @Description: TODO get images meta
     * @param cacheDescriptor
     * @return
     * @throws CacheStorageAccessException
     * @throws CacheDataAccessException
     */
    protected JSONObject getImagesMeta(ICacheDescriptor cacheDescriptor) throws CacheStorageAccessException, CacheDataAccessException
    {
      JSONObject json = null;
      try
      {
        IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
        Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);

        ICacheStorageAdapter infoFile = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getInternalURI(),
            RENDITION_META_FILE_LABEL, storageAdapter);

        json = JSONObject.parse(new AutoCloseInputStream(infoFile.getInputStream()));
      }
      catch (IOException e)
      {
        // if it's a JSONObject, this might be generated by old code base
        // reset the file to new format
        // resetMsg(cacheDescriptor);
        LOGGER.log(Level.SEVERE, "Reading Image Information File Failed. {0} {1}", new Object[] { cacheDescriptor, e });
      }

      return json;
    }

    /**
     * @Description: TODO check if the file is Media File
     * @param cacheDescriptor
     * @param aFile
     * @return
     */
    protected boolean isContentMediaFile(ICacheDescriptor cacheDescriptor, ICacheStorageAdapter aFile)
    {
      return aFile.getName().equals(MEDIA_INFO_FILE_LABEL) && aFile.isFolder();
    }

    /**
     * @Description: TODO get media file list
     * @param cacheDescriptor
     * @return
     */
    protected String[] getMediaFileList(ICacheDescriptor cacheDescriptor)
    {
      IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
      Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);

      ICacheStorageAdapter cacheHome = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getMediaURI(), storageAdapter);
      ICacheStorageAdapter[] allFiles = cacheHome.listFiles();
      Vector<String> mediaFiles = new Vector<String>();

      for (int i = 0; i < allFiles.length; i++)
      {
        if (isContentMediaFile(cacheDescriptor, allFiles[i]))
        {
          mediaFiles.add(allFiles[i].getPath());
        }
      }

      return (String[]) mediaFiles.toArray(new String[mediaFiles.size()]);
    }

    protected void collectCacheSections(ICacheStorageAdapter cacheHome, CacheSection filterSection, Vector<String> result)
    {
      ICacheStorageAdapter[] allFiles = cacheHome.listFiles();
      for (int i = 0; i < allFiles.length; i++)
      {
        if (allFiles[i].isFile())
        {
          if (filterSection == null)
          {
            result.add(allFiles[i].getPath());
          }
          else
          {
            if (allFiles[i].getPath().startsWith(filterSection.getSectionPath()))
            {
              result.add(allFiles[i].getPath());
            }
          }
        }
        else
        {
          collectCacheSections(allFiles[i], filterSection, result);
        }
      }
    }

    private void sleep(ICacheDescriptor cacheDescriptor, ICacheStorageAdapter dir)
    {
      /*
       * try { Thread.sleep(2000); } catch (InterruptedException e) { // TODO Auto-generated catch block LOGGER.log(Level.SEVERE,
       * "Sleep is interuppted when Mkdirs Failed during media Dir Preparation. {0} {1}", new Object[] { cacheDescriptor, dir.getPath() });
       * }
       */
    }

    private void prepareCacheInternal(ICacheDescriptor cacheDescriptor) throws CacheStorageAccessException
    {
      IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
      Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);

      ICacheStorageAdapter mediaDir = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getMediaURI(), storageAdapter);
      if (!mediaDir.exists() || !mediaDir.isFolder())
      {
        if (!mediaDir.mkdirs())
        {
          this.sleep(cacheDescriptor, mediaDir);
          if (!mediaDir.exists())
          {
            LOGGER.log(Level.SEVERE, "Mkdirs Failed during media Dir Preparation. {0} {1}",
                new Object[] { cacheDescriptor, mediaDir.getPath() });
            throw new CacheStorageAccessException(cacheDescriptor, new IOException());
          }
        }
        else
        {
          LOGGER.log(Level.FINEST, "Mkdirs successfully for media Dir Preparation. {0} {1}",
              new Object[] { cacheDescriptor, mediaDir.getPath() });
        }
      }

      ICacheStorageAdapter thumbnailsDir = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getThumbnailURI(), storageAdapter);
      if (!thumbnailsDir.exists() || !thumbnailsDir.isFolder())
      {
        if (!thumbnailsDir.mkdirs())
        {
          this.sleep(cacheDescriptor, thumbnailsDir);
          if (!thumbnailsDir.exists())
          {
            LOGGER.log(Level.SEVERE, "Mkdirs Failed during Thumbnail Dir Preparation. {0} {1}", new Object[] { cacheDescriptor,
                thumbnailsDir.getPath() });
            throw new CacheStorageAccessException(cacheDescriptor, new IOException());
          }
        }
        else
        {
          LOGGER.log(Level.FINEST, "Mkdirs successfully for Thumbnail Dir Preparation. {0} {1}", new Object[] { cacheDescriptor,
              thumbnailsDir.getPath() });
        }
      }

      ICacheStorageAdapter fullImagesDir = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getFullImageURI(), storageAdapter);
      if (!fullImagesDir.exists() || !fullImagesDir.isFolder())
      {
        if (!fullImagesDir.mkdirs())
        {
          this.sleep(cacheDescriptor, fullImagesDir);
          if (!fullImagesDir.exists())
          {
            LOGGER.log(Level.SEVERE, "Mkdirs Failed during Full Image Dir Preparation. {0} {1}", new Object[] { cacheDescriptor,
                fullImagesDir.getPath() });
            throw new CacheStorageAccessException(cacheDescriptor, new IOException());
          }
        }
        else
        {
          LOGGER.log(Level.FINEST, "Mkdirs successfully for Full Image Dir Preparation. {0} {1}", new Object[] { cacheDescriptor,
              fullImagesDir.getPath() });
        }

      }
      ICacheStorageAdapter htmlDir = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getHtmlURI(), storageAdapter);
      if (!htmlDir.exists() || !htmlDir.isFolder())
      {
        if (!htmlDir.mkdirs())
        {
          this.sleep(cacheDescriptor, htmlDir);
          if (!htmlDir.exists())
          {
            LOGGER.log(Level.SEVERE, "Mkdirs Failed during Full Image Dir Preparation. {0} {1}",
                new Object[] { cacheDescriptor, htmlDir.getPath() });
            throw new CacheStorageAccessException(cacheDescriptor, new IOException());
          }
        }
        else
        {
          LOGGER.log(Level.FINEST, "Mkdirs successfully for Full Image Dir Preparation. {0} {1}",
              new Object[] { cacheDescriptor, htmlDir.getPath() });
        }

      }
    }

    private void prepareCacheMeta(ICacheDescriptor cacheDescriptor) throws CacheDataAccessException
    {
      IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
      Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);

      ICacheStorageAdapter metaFile = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getInternalURI(), CACHE_META_FILE_LABEL,
          storageAdapter);

      if (!metaFile.exists() || !metaFile.isFile())
      {
        OutputStream metaFileOutputStream = null;
        try
        {
          metaFileOutputStream = metaFile.getOutputStream();
          new JSONObject().serialize(metaFileOutputStream, true);
        }
        catch (IOException e)
        {
          LOGGER.log(Level.SEVERE, "Error when create meta file for cache at {0} {1}"
              + new Object[] { cacheDescriptor.getInternalURI(), e });
          throw new CacheDataAccessException(cacheDescriptor, e);
        }
        finally
        {
          if (metaFileOutputStream != null)
          {
            try
            {
              metaFileOutputStream.close();
            }
            catch (IOException e)
            {
              LOGGER.log(Level.WARNING, "Close Cache Meta File Faile during Preparation. {0} {1}", new Object[] { cacheDescriptor, e });
              throw new CacheDataAccessException(cacheDescriptor, e);
            }
          }
        }
      }
    }

    private void prepareCacheTempFolder(ICacheDescriptor cacheDescriptor) throws CacheStorageAccessException, CacheDataAccessException
    {
      IComponent cacheComp = Platform.getComponent(CacheComponent.COMPONENT_ID);
      Class<?> storageAdapter = (Class<?>) cacheComp.getService(Class.class);

      ICacheStorageAdapter tempFolder = CacheStorageAdapterFactory.newCacheAdapter(cacheDescriptor.getTempURI(null), storageAdapter);

      if (!tempFolder.exists() || !tempFolder.isFolder())
      {
        if (!tempFolder.mkdirs())
        {
          this.sleep(cacheDescriptor, tempFolder);
          if (!tempFolder.exists())
          {
            LOGGER.log(Level.SEVERE, "Mkdirs Failed during temp Dir Preparation. {0} {1}",
                new Object[] { cacheDescriptor, tempFolder.getPath() });
            throw new CacheStorageAccessException(cacheDescriptor, new IOException());
          }
        }
        else
        {
          LOGGER.log(Level.FINEST, "Mkdirs successfully for temp Dir Preparation. {0} {1}",
              new Object[] { cacheDescriptor, tempFolder.getPath() });
        }
      }
    }

    protected abstract Object perform() throws CacheStorageAccessException, CacheDataAccessException;
  }

}