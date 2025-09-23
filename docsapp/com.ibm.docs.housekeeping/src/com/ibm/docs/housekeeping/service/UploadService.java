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
import com.ibm.docs.housekeeping.bean.HouseKeepingData;
import com.ibm.docs.housekeeping.bean.HouseKeepingResult;
import com.ibm.docs.housekeeping.dao.UploadDao;
import com.ibm.docs.housekeeping.strategy.UploadStrategy;
import com.ibm.docs.housekeeping.util.HouseKeepingUtil;

public class UploadService implements IHouseKeepingService
{
  private static final Logger LOG = Logger.getLogger(UploadService.class.getName());

  private List<HouseKeepingData> records;

  private String serviceId;

  public UploadService(List<HouseKeepingData> dataList)
  {
    this.records = dataList;
    this.serviceId = HouseKeepingUtil.getHKTaskId(HouseKeepingUtil.UPLOAD);
  }

  @Override
  public HouseKeepingResult call() throws Exception
  {
    DraftDescriptor dd = null;
    Iterator<HouseKeepingData> itm = records.iterator();
    UploadStrategy strategy = new UploadStrategy();
    UploadDao dao = new UploadDao();
    long count = 0L;
    final long start = System.currentTimeMillis();
    while (itm.hasNext())
    {
      HouseKeepingData uploadBean = itm.next();
      dd = DraftStorageManager.getDraftStorageManager(false).getDraftDescriptor(uploadBean.getOrgId(), uploadBean.getRepoId(),
          uploadBean.getDocId());
      try
      {
        LOG.entering(UploadService.class.getName(), "upload::cleanInstance", new Object[] { dd, strategy.getAgeThreshold() });
        Calendar lastVisit = AtomDate.valueOf(uploadBean.getUploadCreated()).getCalendar();
        File uploadConvertDir = new File(dd.getTempURI(null), "upload");
        String uploadConvertFiles[] = uploadConvertDir.list();
        if (uploadConvertFiles != null && uploadConvertFiles.length > 0)
        {
          boolean success = strategy.cleanSpecificDir(dd, lastVisit, uploadConvertDir.getAbsolutePath());
          if (success)
          {
            try
            {
              dao.updateUploadCreated(uploadBean.getRepoId(), uploadBean.getDocId());
              count++;
            }
            catch (ConcordException e)
            {
              LOG.log(Level.WARNING, "After house keeping, Failed to update DOC_HISTORY - " + new Object[] { uploadBean.getDocId() });
            }
          }
        }
        else
        {
          // No upload drafts, update doc_history to set UPLOAD_CREATED null
          dao.updateUploadCreated(uploadBean.getRepoId(), uploadBean.getDocId());
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Failed to perform house keeping for draft " + dd + " because of the exception: ", e);
      }
    }
    final long end = System.currentTimeMillis();
    LOG.log(Level.INFO, "The total time cost for clean upload drafts task {0} is {1} s", new Object[] { serviceId, (end - start) / 1000 });
    LOG.log(Level.INFO, "The average time cost for clean upload drafts task {0} is {1} ms", new Object[] { serviceId,
        (end - start) / records.size() });
    // Hope GC will trigger garbage collection
    records = null;
    HouseKeepingResult result = new HouseKeepingResult();
    result.setCleanedUploads(count);
    return result;
  }

  @Override
  public String getServiceId()
  {
    return this.serviceId;
  }

}
