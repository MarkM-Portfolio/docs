package com.ibm.concord.viewer.job;

import java.io.File;
import java.io.IOException;
import java.util.Calendar;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.spi.impl.ThumbnailDescriptor;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.members.UserProperty;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.json.java.JSONObject;
import com.ibm.websphere.asynchbeans.Work;

public class HousekeepingJob implements Work
{
  private IDocumentEntry docEntry;

  private String customId;

  private File cacheHome;

  private static final Logger LOGGER = Logger.getLogger(HousekeepingJob.class.getName());

  private static final String CLAZZ = HousekeepingJob.class.getName();

  private static final String PREVIEW = "preview";

  private boolean released = false;

  private HouseKeepingType type;

  public static enum HouseKeepingType {
    PURGEALL, PURGEOUTDATED, PURGESANITY
  }

  public HousekeepingJob(String customId, IDocumentEntry docEntry, HouseKeepingType type)
  {
    this.docEntry = docEntry;
    this.customId = customId;
    this.cacheHome = new File(ViewerConfig.getInstance().getSharedDataRoot());
    this.type = type;
  }

  private void cleanOutdatedThumbnails(long start)
  {
    //In Verse, we will not mount files nas share, so do not need to clean it.
    if(ViewerConfig.getInstance().getIsVerseEnv())
      return;
    String[] md5 = ViewerUtil.hash(docEntry.getDocUri());
    StringBuffer path = new StringBuffer().append(RepositoryServiceUtil.getRepositoryFilesPath(docEntry.getRepository()))
        .append(File.separator).append(PREVIEW).append(File.separator).append(md5[0]).append(File.separator).append(md5[1])
        .append(File.separator).append(docEntry.getDocUri());
    File cacheRoot = new File(path.toString());
    if (cacheRoot.exists())
    {
      File[] caches = cacheRoot.listFiles();
      for (File cache : caches)
      {
        if (released)
        {
          LOGGER.info(new StringBuffer(ServiceCode.HOUSEKEEPING_INFO).append(": Housekeeping job released.  DocId: ")
              .append(docEntry.getDocUri()).append(".  Total running time: ").append(System.currentTimeMillis() - start).append("ms.")
              .toString());
          LOGGER.exiting(CLAZZ, "run", new Object[] { customId, docEntry.getDocId(), docEntry.getVersion() });

          return;
        }

        Calendar history = Calendar.getInstance();
        history.setTimeInMillis(Long.parseLong(cache.getName()));
        Calendar current = docEntry.getModified();
        if (history.before(current))
        {
          try
          {
            FileUtil.removeDirectory(cache);
            LOGGER.info(new StringBuffer(ServiceCode.HOUSEKEEPING_INFO).append(": LastModified ").append(cache.getName())
                .append(" cache purged.  Location: ").append(cache.getAbsolutePath()).toString());
          }
          catch (Exception e)
          {
            StringBuffer sbf = new StringBuffer(ServiceCode.HOUSEKEEPING_WARNING).append(": Purging cache error.  location: ");
            sbf.append(cache.getAbsolutePath());
            sbf.append(". ").append(e.getMessage());
            LOGGER.log(Level.WARNING, sbf.toString(), e);
          }
        }
      }
    }
  }

  private void cleanOutdatedDocCache(long start)
  {
    String docId = docEntry.getDocId();
    try
    {
      int curVer = Integer.valueOf(docEntry.getVersion());
      for (int i = 1; i < curVer; i++)
      {
        if (released)
        {
          LOGGER.info(new StringBuffer(ServiceCode.HOUSEKEEPING_INFO).append(": Housekeeping job released.  DocId: ").append(docId)
              .append(".  Total running time: ").append(System.currentTimeMillis() - start).append("ms.").toString());
          LOGGER.exiting(CLAZZ, "run", new Object[] { customId, docEntry.getDocId(), docEntry.getVersion() });

          return;
        }

        File[] cacheRoots = new File[2];
        String[] hash = ViewerUtil.hash(docId + "@" + String.valueOf(i));
        cacheRoots[0] = new File(new File(new File(new File(cacheHome, customId), hash[0]), hash[1]), docId);

        hash = ViewerUtil.hash(docId + "@" + String.valueOf(i) + "@" + "HTML");
        cacheRoots[1] = new File(new File(new File(new File(cacheHome, customId), hash[0]), hash[1]), docId);

        for (File cacheRoot : cacheRoots)
        {
          LOGGER.fine(new StringBuffer(ServiceCode.HOUSEKEEPING_INFO).append(" Version: ").append(i).append(". Cache root: ").append(cacheRoot.getAbsolutePath())
              .toString());

          if (cacheRoot.exists())
          {
            purge(cacheRoot, 0, String.valueOf(i));
          }
          else
          {
            LOGGER.fine(new StringBuffer(ServiceCode.HOUSEKEEPING_INFO).append(" Cache root: ").append(cacheRoot.getAbsolutePath())
                .append(" does not exist.").toString());
          }
        }
      }
    }
    catch (NumberFormatException e)
    {
      LOGGER.warning(new StringBuffer("Invalid version number, ").append(docEntry.getVersion()).append(".  DocId: ").append(docId)
          .toString());
    }
  }

  public void run()
  {
    LOGGER.entering(CLAZZ, "run", new Object[] { type, customId, docEntry.getDocId(), docEntry.getVersion() });
    long start = System.currentTimeMillis();
    switch (type)
      {
        case PURGEALL :
          cleanAllThumbnails(start);
          break;
        case PURGEOUTDATED :
          cleanOutdatedDocCache(start);
          cleanOutdatedThumbnails(start);
          break;
        case PURGESANITY :
          cleanSanityCache(start, this.customId);
          break;
      }
    LOGGER.info(new StringBuffer(ServiceCode.HOUSEKEEPING_INFO).append(": Housekeeping job done.  DocId: ").append(docEntry.getDocId())
        .append(".  Total running time: ").append(System.currentTimeMillis() - start).append("ms.").toString());
    LOGGER
        .exiting(
            CLAZZ,
            "run",
            String.format("CustomId : %s , DocId : %s , Version : %s .",
                new Object[] { customId, docEntry.getDocId(), docEntry.getVersion() }));
  }

  private void cleanAllThumbnails(long start)
  {
    //In Verse, we will not mount files nas share, so do not need to clean it.
    if(ViewerConfig.getInstance().getIsVerseEnv())
      return;
    String[] md5 = ViewerUtil.hash(docEntry.getDocUri());
    StringBuffer path = new StringBuffer().append(RepositoryServiceUtil.getRepositoryFilesPath(docEntry.getRepository()))
        .append(File.separator).append(PREVIEW).append(File.separator).append(md5[0]).append(File.separator).append(md5[1])
        .append(File.separator).append(docEntry.getDocUri());
    File cacheRoot = new File(path.toString());
    if (cacheRoot.exists())
    {
      File[] caches = cacheRoot.listFiles();
      for (File cache : caches)
      {
        if (released)
        {
          LOGGER.info(new StringBuffer(ServiceCode.HOUSEKEEPING_INFO).append(": Housekeeping job released. DocId: ")
              .append(docEntry.getDocUri()).append(".  Total running time: ").append(System.currentTimeMillis() - start).append("ms.")
              .toString());
          LOGGER.exiting(CLAZZ, "run", new Object[] { customId, docEntry.getDocId(), docEntry.getVersion() });

          return;
        }
        purge(cache);
      }
      purge(cacheRoot);
      File primaryCache = cacheRoot.getParentFile();
      if (primaryCache.exists() && primaryCache.listFiles().length == 0)
      {
        purge(primaryCache);
      }
      File secondaryCache = primaryCache.getParentFile();
      if (secondaryCache.exists() && secondaryCache.listFiles().length == 0)
      {
        purge(secondaryCache);
      }
    }

  }

  private void purge(File dir, String version)
  {
    try
    {
      FileUtil.removeDirectory(dir);
      StringBuffer sbf = new StringBuffer(ServiceCode.HOUSEKEEPING_INFO);
      if (version != null)
      {
        sbf.append(": Version ").append(version);
      }
      sbf.append(" cache purged.  Location: ").append(dir.getAbsolutePath());
      LOGGER.info(sbf.toString());
    }
    catch (Exception e)
    {
      StringBuffer sbf = new StringBuffer(ServiceCode.HOUSEKEEPING_WARNING).append(": Purging cache error.  location: ");
      sbf.append(dir.getAbsolutePath());
      sbf.append(". ").append(e.getMessage());
      LOGGER.log(Level.WARNING, sbf.toString(), e);
    }
  }

  private void purge(File dir)
  {
    purge(dir, null);
  }

  private void purge(File dir, int level, String version)
  {
    if (level > 2)
    {
      return;
    }
    else if (dir.getName().equals(docEntry.getDocId()))
    {
      purge(dir, version);
      purge(dir.getParentFile(), level + 1, version);
    }
    else
    {
      try
      {
        Long.parseLong(dir.getName()); // MD5 value
        File[] left = dir.listFiles();
        if (left.length > 0)
        {
          for (File f : left)
          {
            try
            {
              if (!f.isDirectory())
              {
                // should not have a file in this dir
                LOGGER.warning(new StringBuffer(ServiceCode.HOUSEKEEPING_WARNING).append(": Purging illegal file, ")
                    .append(f.getAbsolutePath()).toString());
                f.delete();
              }
              else
              {
                // see if it's a number-dir, otherwise, remove it
                try
                {
                  Long.parseLong(f.getName());
                }
                catch (Exception e)
                {
                  LOGGER.warning(new StringBuffer(ServiceCode.HOUSEKEEPING_WARNING).append(": Purging illegal directory, ")
                      .append(f.getAbsolutePath()).toString());
                  FileUtil.removeDirectory(f);
                }

              }
            }
            catch (Exception e)
            {
              LOGGER.warning(new StringBuffer(ServiceCode.HOUSEKEEPING_WARNING).append(": Error occurred when purging ")
                  .append(f.getAbsolutePath()).toString());
            }
          }
        }
        else
        {
          dir.delete();
        }

        purge(dir.getParentFile(), level + 1, version);
      }
      catch (NumberFormatException e)
      {
        LOGGER.warning(new StringBuffer(ServiceCode.HOUSEKEEPING_WARNING).append(": Illegal directory found, ")
            .append(dir.getAbsolutePath()).toString());
      }
    }
  }

  public void release()
  {
    released = true;
  }
  
  private void cleanSanityCache(long start, final String jsonStr)
  {
    LOGGER.entering(CLAZZ, "checkViewerDraft");
    try
    {
      final JSONObject userJsonObject = JSONObject.parse(jsonStr);
      /**
       * purge thumbnails folder
       */
      ThumbnailDescriptor desp = new ThumbnailDescriptor(docEntry.getDocUri(), (String) userJsonObject.get("modified"), docEntry.getRepository());
      File thumbnailCacheFile = new File(desp.getInternalURI()).getParentFile();
      if (thumbnailCacheFile.exists())
      {
        purge(thumbnailCacheFile);
      }

      IUser user = new IUser()
      {
        @Override
        public String getProperty(String key)
        {
          if (key.equals(UserProperty.PROP_CUSTOMERID.toString()))
          {
            return (String) userJsonObject.get(UserBean.CUSTOMER_ID.toString());
          }
          else if (key.equals(UserProperty.PROP_ORGID.toString()))
          {
            return (String) userJsonObject.get(UserBean.ORG_ID.toString());
          }
          return null;
        }

        @Override
        public String getId()
        {
          return (String) userJsonObject.get(UserBean.ID);
        }

        @Override
        public IOrg getOrg()
        {
          return null;
        }

        @Override
        public void setProperty(String key, String value)
        {
        }

        @Override
        public Set<String> listProperties()
        {
          return null;
        }
      };

      /**
       * purge draft folder
       */
      UserBean userBean = new UserBean(user);
      ICacheDescriptor draftDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(userBean, docEntry);
      if (draftDesc.exists())
      {
        File draftCacheFile = new File(draftDesc.getInternalURI());
        purge(draftCacheFile);
      }
    }
    catch (IOException e)
    {
      LOGGER.warning(new StringBuffer(ServiceCode.HOUSEKEEPING_WARNING).append(
          String.format(": IOException occured : %s ", new Object[] { e })).toString());
    }
    LOGGER.exiting(CLAZZ, "checkViewerDraft");
  }

  /**
   * @param start
   * @param userInfo
   * @param path
   */
  @SuppressWarnings("unused")
  private void purgeFolder(long start, final String userInfo, String path)
  {
    LOGGER.entering(CLAZZ, String.format("Purge Path : %s , Json String : %s .", new Object[] { path, userInfo }));
    File cacheRoot = new File(path.toString());
    if (cacheRoot.exists())
    {
      File[] caches = cacheRoot.listFiles();
      for (File cache : caches)
      {
        if (released)
        {
          LOGGER.info(new StringBuffer(ServiceCode.HOUSEKEEPING_INFO).append(": Housekeeping job released. DocId: ")
              .append(docEntry.getDocUri()).append(".  Total running time: ").append(System.currentTimeMillis() - start).append("ms.")
              .toString());
          LOGGER.exiting(CLAZZ, "run", new Object[] { userInfo, docEntry.getDocId(), docEntry.getVersion() });
          return;
        }
        if (cache.exists())
          purge(cache);

      }
      purge(cacheRoot);
      File primaryCache = cacheRoot.getParentFile();
      if (primaryCache.exists() && primaryCache.listFiles().length == 0)
      {
        purge(primaryCache);
      }
      File secondaryCache = primaryCache.getParentFile();
      if (secondaryCache.exists() && secondaryCache.listFiles().length == 0)
      {
        purge(secondaryCache);
      }
    }
    LOGGER.exiting(CLAZZ, "purgeFolder");
  }

}
