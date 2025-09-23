/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping.service;

import java.io.File;
import java.util.Calendar;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.draft.DraftComponent;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.housekeeping.bean.HouseKeepingData;
import com.ibm.docs.housekeeping.bean.HouseKeepingResult;
import com.ibm.docs.housekeeping.dao.DraftDao;
import com.ibm.docs.housekeeping.strategy.CacheStrategy;
import com.ibm.docs.housekeeping.strategy.DraftStrategy;
import com.ibm.docs.housekeeping.strategy.SnapshotStrategy;
import com.ibm.docs.housekeeping.strategy.UploadStrategy;
import com.ibm.docs.housekeeping.util.HouseKeepingUtil;

public class MigrationService implements IHouseKeepingService
{
  private static final Logger LOG = Logger.getLogger(MigrationService.class.getName());

  private static final int timeInterval = 2000;

  private List<HouseKeepingData> data;

  private String serviceId;

  public MigrationService(List<HouseKeepingData> data)
  {
    super();
    this.data = data;
    this.serviceId = HouseKeepingUtil.getHKTaskId(HouseKeepingUtil.MIGRATION);
  }

  @Override
  public HouseKeepingResult call() throws Exception
  {
    DraftComponent draftComp = (DraftComponent) Platform.getComponent(DraftComponent.COMPONENT_ID);
    File draftHome = new File(draftComp.getDraftHome());
    DraftDescriptor dd = null;
    // For migration case, age_threshold is 365 days
    SnapshotStrategy snapshotStrategy = new SnapshotStrategy(true);
    UploadStrategy uploadStrategy = new UploadStrategy();
    CacheStrategy cacheStrategy = new CacheStrategy();
    DraftStrategy draftStrategy = new DraftStrategy();
    DraftDao dao = new DraftDao();
    Iterator<HouseKeepingData> itm = data.iterator();
    int cleanedUCount = 0;
    int cleanedScount = 0;
    int migratedCount = 0;
    int failedMigrations = 0;
    final long start = System.currentTimeMillis();
    int index = 0;
    while (itm.hasNext())
    {
      index++;
      if (index == data.size() / 2)
      {
        try
        {
          Thread.sleep(timeInterval);
        }
        catch (InterruptedException e)
        {
          LOG.log(Level.WARNING, "Thread is interrupted abnormaly.", e);
        }
      }
      HouseKeepingData migrationBean = itm.next();
      // Check whether the draft still exists on NFS server now
      boolean isValid = HouseKeepingUtil.isMigrationDraftExisted(draftHome, migrationBean);
      if (!isValid)
      {
        dao.delete(migrationBean.getRepoId(), migrationBean.getDocId());
        migratedCount++;
        continue;
      }
      dd = DraftStorageManager.getDraftStorageManager(false).getDraftDescriptor(migrationBean.getOrgId(), migrationBean.getRepoId(),
          migrationBean.getDocId());
      try
      {
        // firstly handle draft
        boolean hasDraft = false;
        File draftMedia = new File(dd.getURI());
        String[] mediaFiles = draftMedia.list();
        if (mediaFiles != null && mediaFiles.length > 0)
        {
          hasDraft = true;
        }
        // secondly handle snapshot
        boolean hasSnapshot = false;
        File snapshotDir = new File(dd.getSnapshotMediaURI());
        Calendar lastVisit = AtomDate.valueOf(snapshotDir.lastModified()).getCalendar();
        String snapshotFiles[] = snapshotDir.list();
        if (snapshotFiles != null && snapshotFiles.length > 0)
        {
          boolean cleaned = snapshotStrategy.cleanSpecificDir(dd, lastVisit, snapshotDir.getAbsolutePath());
          if (cleaned)
          {
            deleteReadableTag(dd);
            cleanedScount++;
          }
          else
          {
            hasSnapshot = true;
          }
        }
        // thirdly handle upload
        boolean hasUploadDraft = false;
        File uploadConvertDir = new File(dd.getTempURI(null), "upload");
        lastVisit = AtomDate.valueOf(uploadConvertDir.lastModified()).getCalendar();
        String uploadConvertFiles[] = uploadConvertDir.list();
        if (uploadConvertFiles != null && uploadConvertFiles.length > 0)
        {
          boolean cleaned = uploadStrategy.cleanSpecificDir(dd, lastVisit, uploadConvertDir.getAbsolutePath());
          if (cleaned)
          {
            cleanedUCount++;
          }
          else
          {
            hasUploadDraft = true;
          }
        }
        // fourthly handle temp folder due to upload strategy
        if (!hasUploadDraft)
        {
          File tempFolder = new File(dd.getTempURI(null));
          File[] uuidFiles = tempFolder.listFiles();
          if (uuidFiles != null && uuidFiles.length > 0)
          {
            for (int i = 0; i < uuidFiles.length; i++)
            {
              lastVisit = AtomDate.valueOf(uuidFiles[i].lastModified()).getCalendar();
              uploadStrategy.cleanSpecificDir(dd, lastVisit, uuidFiles[i].getAbsolutePath());
            }
          }
        }
        // fifth handle its job cache
        HouseKeepingUtil.cleanCache(migrationBean, cacheStrategy);

        // finally handle the whole draft
        if (!hasDraft && !hasSnapshot && !hasUploadDraft)
        {
          File docFile = new File(dd.getInternalURI());
          draftStrategy.cleanSpecificDir(docFile.getAbsolutePath());
          dao.delete(migrationBean.getRepoId(), migrationBean.getDocId());
          migratedCount++;
        }
        else
        {
          long sLastVisit = hasSnapshot ? Calendar.getInstance().getTime().getTime() : -1;
          long uploadCreated = hasUploadDraft ? AtomDate.valueOf(uploadConvertDir.lastModified()).getCalendar().getTime().getTime() : -1;
          dao.updateMigrationStatus(migrationBean.getRepoId(), migrationBean.getDocId(), sLastVisit, uploadCreated);
          migratedCount++;
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Failed to perform house keeping for draft " + dd + " because of the exception: ", e);
        failedMigrations++;
      }
    }
    final long end = System.currentTimeMillis();
    LOG.log(Level.INFO, "The total time cost for migration task {0} is {1} s", new Object[] { serviceId, (end - start) / 1000 });
    LOG.log(Level.INFO, "The average time cost for migration task {0} is {1} ms", new Object[] { serviceId, (end - start) / data.size() });
    data = null;
    HouseKeepingResult result = new HouseKeepingResult();
    result.setCleanedUploads(cleanedUCount);
    result.setCleanedSnapshots(cleanedScount);
    result.setMigratedCount(migratedCount);
    result.setFailedMigrations(failedMigrations);
    return result;
  }

  private void deleteReadableTag(DraftDescriptor dd)
  {
    // Delete readable.tag as well
    File readableTag = new File(dd.getSnapshotURI(), SNAPSHOT_READABLE_TAG);
    if (readableTag.exists())
    {
      FileUtil.nfs_delete(readableTag, FileUtil.NFS_RETRY_SECONDS);
    }
  }

  @Override
  public String getServiceId()
  {
    return serviceId;
  }

}
