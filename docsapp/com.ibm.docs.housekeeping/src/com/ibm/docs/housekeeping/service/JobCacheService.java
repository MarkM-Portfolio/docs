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

import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.housekeeping.bean.HouseKeepingData;
import com.ibm.docs.housekeeping.bean.HouseKeepingResult;
import com.ibm.docs.housekeeping.dao.DraftDao;
import com.ibm.docs.housekeeping.strategy.CacheStrategy;
import com.ibm.docs.housekeeping.util.ErrorCode;
import com.ibm.docs.housekeeping.util.HouseKeepingUtil;

public class JobCacheService implements IHouseKeepingService
{
  private static final Logger LOG = Logger.getLogger(JobCacheService.class.getName());

  private String serviceId;

  private List<HouseKeepingData> data;

  public JobCacheService(List<HouseKeepingData> data)
  {
    this.data = data;
    this.serviceId = HouseKeepingUtil.getHKTaskId(HouseKeepingUtil.CACHE);
  }

  @Override
  public HouseKeepingResult call() throws Exception
  {
    // The job cache path is like this: job_cache/126/job_cache/816/418/e1e828ad-4c37-4a7b-92c9-ddbc50ed30e1/...
    CacheStrategy strategy = new CacheStrategy();
    DraftDao dao = new DraftDao();
    Iterator<HouseKeepingData> itm = data.iterator();
    final long start = System.currentTimeMillis();
    while (itm.hasNext())
    {
      HouseKeepingData hk = itm.next();
      HouseKeepingUtil.cleanCache(hk, strategy);
      try
      {
        dao.updateCacheStatus(hk.getRepoId(), hk.getDocId());
      }
      catch (ConcordException e)
      {
        if (e.getErrCode() == ErrorCode.CONN_NOT_AVAILABLE)
        {
          throw e;
        }
      }
    }
    final long end = System.currentTimeMillis();
    LOG.log(Level.INFO, "The total time cost for clean job cache task {0} is {1} s", new Object[] { serviceId, (end - start) / 1000 });
    LOG.log(Level.INFO, "The average time cost for clean job cache task task {0} is {1} ms",
        new Object[] { serviceId, (end - start) / data.size() });
    data = null;
    HouseKeepingResult result = new HouseKeepingResult();
    result.setCleanedCaches(strategy.getCleanedCache());
    return result;
  }

  @Override
  public String getServiceId()
  {
    return this.serviceId;
  }

}
