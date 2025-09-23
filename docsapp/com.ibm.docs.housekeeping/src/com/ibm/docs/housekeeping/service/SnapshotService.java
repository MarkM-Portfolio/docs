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
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.common.io.FileUtil;
import com.ibm.docs.housekeeping.bean.HouseKeepingData;
import com.ibm.docs.housekeeping.bean.HouseKeepingResult;
import com.ibm.docs.housekeeping.dao.SnapshotDao;
import com.ibm.docs.housekeeping.strategy.AbstractStrategy;
import com.ibm.docs.housekeeping.strategy.SnapshotStrategy;
import com.ibm.docs.housekeeping.util.HouseKeepingUtil;

public class SnapshotService implements IHouseKeepingService
{
  private static final Logger LOG = Logger.getLogger(SnapshotService.class.getName());

  private List<HouseKeepingData> data;

  private String serviceId;

  public SnapshotService(List<HouseKeepingData> data)
  {
    super();
    this.data = data;
    this.serviceId = HouseKeepingUtil.getHKTaskId(HouseKeepingUtil.SNAPSHOT);
  }

  @Override
  public HouseKeepingResult call() throws Exception
  {
    DraftDescriptor dd = null;
    long count = 0L;
    SnapshotStrategy strategy = new SnapshotStrategy();
    SnapshotDao dao = new SnapshotDao();
    final long start = System.currentTimeMillis();
    Iterator<HouseKeepingData> itm = data.iterator();
    while (itm.hasNext())
    {
      HouseKeepingData snapshot = itm.next();
      dd = DraftStorageManager.getDraftStorageManager(false).getDraftDescriptor(snapshot.getOrgId(), snapshot.getRepoId(),
          snapshot.getDocId());
      try
      {
        Calendar lastVisit = AtomDate.valueOf(snapshot.getSnapshotLastVisit()).getCalendar();
        File snapshotDir = new File(dd.getSnapshotMediaURI());
        String snapshotFiles[] = snapshotDir.list();
        if (snapshotFiles != null && snapshotFiles.length > 0)
        {
          boolean success = strategy.cleanSpecificDir(dd, lastVisit, snapshotDir.getAbsolutePath());
          if (success)
          {
            try
            {
              deleteReadableTag(dd);
              dao.updateSnapshotLastVisit(snapshot.getRepoId(), snapshot.getDocId());
              count++;
            }
            catch (ConcordException e)
            {
              LOG.log(Level.WARNING,
                  "After house keeping, Failed to update DOC_HISTORY snapshot last visit- " + new Object[] { snapshot.getDocId() });
            }
          }
        }
        else
        {
          // Check whether the snapshot media folder has been renamed. Seldom does the case happen!
          File snapshotRoot = new File(dd.getSnapshotURI());
          File[] sfiles = snapshotRoot.listFiles();
          if (sfiles != null && sfiles.length > 0)
          {
            for (int i = 0; i < sfiles.length; i++)
            {
              if (sfiles[i].getName().indexOf(AbstractStrategy.getRenameTag()) > -1)
              {
                FileUtil.cleanDirectory(sfiles[i]);
                sfiles[i].delete();
                deleteReadableTag(dd);
                dao.updateSnapshotLastVisit(snapshot.getRepoId(), snapshot.getDocId());
                count++;
                break;
              }
            }
          }
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Failed to perform house keeping for draft " + dd + " because of the exception: ", e);
      }
    }
    final long end = System.currentTimeMillis();
    LOG.log(Level.INFO, "The total time cost for clean snapshot drafts task {0} is {1} s", new Object[] { serviceId, (end - start) / 1000 });
    LOG.log(Level.INFO, "The average time cost for clean snapshot drafts task {0} is {1} ms", new Object[] { serviceId,
        (end - start) / data.size() });
    data = null;
    HouseKeepingResult result = new HouseKeepingResult();
    result.setCleanedSnapshots(count);
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
    return this.serviceId;
  }
}
