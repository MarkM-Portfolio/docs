/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping;

import java.util.List;

import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.housekeeping.bean.HouseKeepingType;
import com.ibm.docs.housekeeping.dao.DAOProxy;
import com.ibm.docs.housekeeping.dao.DraftDao;
import com.ibm.docs.housekeeping.dao.SnapshotDao;
import com.ibm.docs.housekeeping.dao.UploadDao;
import com.ibm.docs.housekeeping.strategy.AbstractStrategy;
import com.ibm.docs.housekeeping.strategy.CacheStrategy;
import com.ibm.docs.housekeeping.strategy.SnapshotStrategy;
import com.ibm.docs.housekeeping.strategy.UploadStrategy;

public class HouseKeeping
{

  public void process(List<String> orgNameList, String policyOrg, boolean isBigOrgPolicyApplied, boolean isFirstLevelHashApplied)
      throws ConcordException
  {
    // Trigger cache housekeeping
    AbstractStrategy strategy = new CacheStrategy();
    DAOProxy proxy = new DAOProxy(DraftDao.DRAFT_CACHE_HK, HouseKeepingType.CACHE);
    this.doProcess(proxy, strategy, orgNameList, policyOrg, isBigOrgPolicyApplied, isFirstLevelHashApplied);
    // Trigger upload drafts housekeeping
    strategy = new UploadStrategy();
    proxy = new DAOProxy(UploadDao.UPLOAD_HK, HouseKeepingType.UPLOAD);
    this.doProcess(proxy, strategy, orgNameList, policyOrg, isBigOrgPolicyApplied, isFirstLevelHashApplied);
    // Trigger snapshot drafts housekeeping
    strategy = new SnapshotStrategy();
    proxy = new DAOProxy(SnapshotDao.SNAPSHOT_HK, HouseKeepingType.SNAPSHOT);
    this.doProcess(proxy, strategy, orgNameList, policyOrg, isBigOrgPolicyApplied, isFirstLevelHashApplied);
  }

  private void doProcess(DAOProxy proxy, AbstractStrategy strategy, List<String> orgNameList, String policyOrg,
      boolean isBigOrgPolicyApplied, boolean isFirstLevelHashApplied) throws ConcordException
  {
    if (isBigOrgPolicyApplied)
    {
      // The current Docs server needs to handle specific org with assigned first level hash values
      if (isFirstLevelHashApplied)
      {
        proxy.getData4HouseKeeping(policyOrg, orgNameList, strategy.getComparedCalendar());
        return;
      }
    }
    // The current Docs server needs to handle common org case
    proxy.getData4HouseKeeping(orgNameList, null, strategy.getComparedCalendar());
  }
}
