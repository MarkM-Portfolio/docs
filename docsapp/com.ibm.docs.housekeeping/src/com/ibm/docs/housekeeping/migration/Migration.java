/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2018. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.housekeeping.migration;

import java.util.List;

import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.housekeeping.bean.HouseKeepingType;
import com.ibm.docs.housekeeping.dao.DAOProxy;
import com.ibm.docs.housekeeping.dao.DraftDao;

public class Migration
{
  private static final int COUNT_THRESHOLD = 100;

  private DraftDao draftDao;

  public Migration()
  {
    draftDao = new DraftDao();
  }

  public boolean isMigrationEnabled() throws ConcordException
  {
    int count = draftDao.getMigrationCount();
    return (count > COUNT_THRESHOLD);
  }

  public void process(List<String> orgNameList, String policyOrg, boolean isBigOrgPolicyApplied, boolean isFirstLevelHashApplied)
      throws ConcordException
  {
    DAOProxy proxy = new DAOProxy(DraftDao.QUERY_MIGRATION_BY_ORG, HouseKeepingType.MIGRATION);
    if (isBigOrgPolicyApplied)
    {
      // The current Docs server needs to handle specific org with assigned first level hash values
      if (isFirstLevelHashApplied)
      {
        proxy.getData4Migration(policyOrg, orgNameList);
        return;
      }
    }
    // The current Docs server needs to handle common org case
    proxy.getData4Migration(orgNameList, null);
  }
}
