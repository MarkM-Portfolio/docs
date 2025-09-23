/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Viewer Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.job;

import java.io.File;
import java.util.Calendar;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.spi.impl.HTMLCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.ImageCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.ThumbnailDescriptor;
import com.ibm.concord.viewer.job.ECMHouseKeepingJob.ECMHouseKeepingType;
import com.ibm.concord.viewer.platform.conversion.ThumbnailServiceConversionTask;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.websphere.asynchbeans.Work;

public class ECMHouseKeepingJob implements Work
{

  private static final String CLAZZ = ECMHouseKeepingJob.class.getName();

  private static final Logger logger = Logger.getLogger(CLAZZ);

  private boolean released = false;

  public enum ECMHouseKeepingType {
    PURGE_ALL, PURGE_OUTDATED_DRAFTS, PURGE_OUTDATED_VERSIONS, PURGE_OUTDATED, PURGE_VERSION;
  }

  private IDocumentEntry[] versions;

  private UserBean user;

  private ECMHouseKeepingType type;

  private long start;

  private IDocumentEntry docEntry;

  public ECMHouseKeepingJob(UserBean user, IDocumentEntry[] versions, ECMHouseKeepingType type)
  {
    this.versions = versions;
    this.user = user;
    this.type = type;
    this.docEntry = versions[0];
  }

  public ECMHouseKeepingJob(UserBean user, IDocumentEntry docEntry, ECMHouseKeepingType type)
  {
    this.user = user;
    this.type = type;
    this.docEntry = docEntry;
  }

  @Override
  public void run()
  {
    logger.entering(CLAZZ, "run", new Object[] { type, user, docEntry.getDocUri() });
    start = System.currentTimeMillis();
    switch (type)
      {
        case PURGE_VERSION :
          removeVersionDocuments();
          removeVersionThumbnails();
        case PURGE_ALL :
          removeDocuments(0);
          removeThumbnails(0);
          break;
        case PURGE_OUTDATED :
          removeOldDraftDocuments();
          removeOldDraftThumbnails();
          removeDocuments(1);
          removeThumbnails(1);
          break;
        case PURGE_OUTDATED_DRAFTS :
          removeOldDraftDocuments();
          removeOldDraftThumbnails();
          break;
        case PURGE_OUTDATED_VERSIONS :
          removeDocuments(1);
          removeThumbnails(1);
          break;
      }

    logger.info(new StringBuffer(ServiceCode.HOUSEKEEPING_INFO).append(": ECMHousekeeping job done.  DocId: ")
        .append(versions[0].getDocUri()).append(".  Total running time: ").append(System.currentTimeMillis() - start).append("ms.")
        .toString());
    logger.exiting(CLAZZ, "run", new Object[] { user, versions[0].getDocUri() });

  }

  private void removeVersionDocuments()
  {
    if (docEntry == null)
    {
      return;
    }
    checkReleased(docEntry);
    purgeCache(docEntry);
  }

  private void removeVersionThumbnails()
  {
    if (docEntry == null)
    {
      return;
    }
    checkReleased(docEntry);
    ICacheDescriptor thumbSrvCache = new ThumbnailDescriptor(docEntry);
    File cacheHome = new File(thumbSrvCache.getInternalURI()).getParentFile();
    purgeDirectory(cacheHome);

  }

  /**
   * Purge the document cache while traverse the version-history, starting from the index value of 'start'.
   * 
   * @param start
   */
  private void removeDocuments(int start)
  {

    for (int i = start; i < versions.length; i++)
    {
      IDocumentEntry docEntry = versions[i];
      checkReleased(docEntry);
      purgeCache(docEntry);
    }
  }

  private void purgeCache(IDocumentEntry docEntry)
  {
    // image view
    ICacheDescriptor imgCache = new ImageCacheDescriptor(user, docEntry);
    File imgCacheDir = new File(imgCache.getInternalURI()).getParentFile();
    purgeDirectory(imgCacheDir);

    // html view
    ICacheDescriptor htmlCache = new HTMLCacheDescriptor(user, docEntry);
    File htmlCacheDir = new File(htmlCache.getInternalURI()).getParentFile();
    purgeDirectory(htmlCacheDir);
  }

  /**
   * Purge the thumbnails cache while traverse the version-history, starting from the index value of 'start'.
   * 
   * @param start
   */
  private void removeThumbnails(int start)
  {
    for (int i = start; i < versions.length; i++)
    {
      IDocumentEntry docEntry = versions[i];
      checkReleased(docEntry);
      ICacheDescriptor thumbSrvCache = new ThumbnailDescriptor(docEntry);
      File cacheHome = new File(thumbSrvCache.getInternalURI()).getParentFile();
      purgeDirectory(cacheHome);
    }
  }

  /**
   * Purge the document cache which has the same version id but outdated lastModified value as the latest version. For example, update a
   * draft will not change the version id, but may update the cache content.
   */
  private void removeOldDraftDocuments()
  {
    checkReleased(docEntry);

    // image view
    ICacheDescriptor imgCache = new ImageCacheDescriptor(user, docEntry);
    File imgCacheDir = new File(imgCache.getInternalURI()).getParentFile();
    if (imgCacheDir.exists())
    {
      purgeOutdatedCaches(imgCacheDir, docEntry.getModified());
    }
    ICacheDescriptor htmlCache = new HTMLCacheDescriptor(user, docEntry);

    // html view
    File htmlCacheDir = new File(htmlCache.getInternalURI()).getParentFile();
    if (htmlCacheDir.exists())
    {
      purgeOutdatedCaches(htmlCacheDir, docEntry.getModified());
    }
  }

  /**
   * Purge the thumbnails cache which has the same version id but outdated lastModified value as the latest version. For example, update a
   * draft will not change the version id, but may update the cache content.
   */
  private void removeOldDraftThumbnails()
  {
    checkReleased(docEntry);
    ICacheDescriptor thumbSrvCache = new ThumbnailDescriptor(docEntry);
    File cacheHome = new File(thumbSrvCache.getInternalURI()).getParentFile();
    if (cacheHome.exists())
    {
      purgeOutdatedCaches(cacheHome, docEntry.getModified());
    }
  }

  private void purgeOutdatedCaches(File docHome, Calendar docCal)
  {
    File[] lastModifiedDirs = docHome.listFiles();
    for (File deleteRoot : lastModifiedDirs)
    {
      try
      {
        Calendar oldCal = Calendar.getInstance();
        oldCal.setTimeInMillis(Long.valueOf(deleteRoot.getName()));
        if (oldCal.before(docCal))
        {
          purgeDirectory(deleteRoot);
        }
      }
      catch (Exception e)
      {
        StringBuffer sbf = new StringBuffer(ServiceCode.HOUSEKEEPING_WARNING).append(": ECM purging cache error.  location: ");
        sbf.append(docHome.getAbsolutePath());
        sbf.append(". ").append(e.getMessage());
        logger.log(Level.WARNING, sbf.toString(), e);
      }
    }

    File secondaryCache = docHome.getParentFile();
    if (docHome.exists() && docHome.listFiles().length == 0)
    {
      FileUtil.cleanDirectory(docHome);
    }
    File primaryCache = secondaryCache.getParentFile();
    if (secondaryCache.exists() && secondaryCache.listFiles().length == 0)
    {
      FileUtil.cleanDirectory(secondaryCache);
    }
    if (primaryCache.exists() && primaryCache.listFiles().length == 0)
    {
      FileUtil.cleanDirectory(primaryCache);
    }
  }

  private void purgeDirectory(File dir)
  {
    if (dir.exists())
    {
      FileUtil.cleanDirectory(dir);

      if (dir.list().length == 0)
      {
        dir.delete();
      }

      StringBuffer sbf = new StringBuffer(ServiceCode.HOUSEKEEPING_INFO).append(": ECM cache purged.  Location: ");
      sbf.append(dir.getAbsolutePath());
      logger.log(Level.INFO, sbf.toString());
    }
  }

  private void checkReleased(IDocumentEntry docEntry)
  {
    if (released)
    {
      logger.info(new StringBuffer(ServiceCode.HOUSEKEEPING_INFO).append(": ECMHousekeeping job released. DocId: ")
          .append(docEntry.getDocUri()).append(".  Total running time: ").append(System.currentTimeMillis() - start).append("ms.")
          .toString());
      logger.exiting(CLAZZ, "run", new Object[] { user, docEntry.getDocUri() });

      return;
    }
  }

  @Override
  public void release()
  {
    released = true;
  }

}
