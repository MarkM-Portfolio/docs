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
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.housekeeping.HouseKeeping;
import com.ibm.docs.housekeeping.HouseKeepingPolicy;
import com.ibm.docs.housekeeping.bean.HouseKeepingResult;
import com.ibm.docs.housekeeping.migration.Migration;
import com.ibm.docs.housekeeping.policy.BigOrgPolicy;
import com.ibm.docs.housekeeping.policy.DefaultPolicy;
import com.ibm.docs.housekeeping.policy.SafeModePolicy;
import com.ibm.docs.housekeeping.util.HouseKeepingUtil;

public class HouseKeepingServiceImpl implements IHouseKeepingService
{
  private static final Logger LOG = Logger.getLogger(HouseKeepingServiceImpl.class.getName());

  private String serviceId;

  private File[] orgHomes;

  private Migration migration;

  private boolean isMigrationEnabled;

  public HouseKeepingServiceImpl(File[] orgHomes, Migration migration, boolean isMigrationEnabled)
  {
    this.serviceId = HouseKeepingUtil.getHKTaskId(HouseKeepingUtil.MAIN);
    this.orgHomes = orgHomes;
    this.migration = migration;
    this.isMigrationEnabled = isMigrationEnabled;
  }

  @Override
  public HouseKeepingResult call()
  {
    HouseKeepingResult result = new HouseKeepingResult();
    try
    {
      List<String> orgNameList = new ArrayList<String>();
      String dataCenter = HouseKeepingPolicy.getDataCenter();
      String policyOrg = HouseKeepingUtil.getPolicyOrganization(dataCenter);
      boolean isSafeMode = HouseKeepingUtil.isSafeMode();
      File policyOrgFile = this.getPolicyOrgFile(orgHomes, policyOrg);
      // No such a policy org file on NFS server, policy org will be null
      if (policyOrgFile == null)
      {
        policyOrg = null;
      }
      boolean isBigOrgPolicyApplied = false;
      boolean isFirstLevelHashApplied = false;
      List<String> strOrgNames = getOrgHomesAsList(orgHomes);
      if (isSafeMode)
      {
        orgNameList = new SafeModePolicy(policyOrg).applyPolicy(strOrgNames);
      }
      else
      {
        // No policy org defined in concord-config.json or the org can not be found from NFS server
        if (policyOrg == null)
        {
          orgNameList = new DefaultPolicy().applyPolicy(strOrgNames);
        }
        else
        {
          BigOrgPolicy policy = new BigOrgPolicy(policyOrg);
          orgNameList = policy.applyPolicy(policyOrgFile, strOrgNames);
          isBigOrgPolicyApplied = true;
          isFirstLevelHashApplied = policy.isFirstLevelHashEnabled();
        }
      }
      if (orgNameList.size() == 0)
      {
        LOG.log(Level.SEVERE, "House Keeping stopped!");
        return result;
      }
      // Create migration instance
      if (isMigrationEnabled)
      {
        migration.process(orgNameList, policyOrg, isBigOrgPolicyApplied, isFirstLevelHashApplied);
      }
      else
      {
        new HouseKeeping().process(orgNameList, policyOrg, isBigOrgPolicyApplied, isFirstLevelHashApplied);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "House Keeping stopped abnormally!", e);
    }
    return result;
  }

  private File getPolicyOrgFile(File[] orgHomes, String policyOrg)
  {
    for (int i = 0; i < orgHomes.length; i++)
    {
      if (orgHomes[i].getName().equals(policyOrg))
      {
        return orgHomes[i];
      }
    }
    LOG.log(Level.WARNING, "The policy org defined in concord-config.json can not be found on NFS server!");
    return null;
  }

  private List<String> getOrgHomesAsList(File[] orgHomes)
  {
    List<String> orgList = new ArrayList<String>();
    for (int i = 0; i < orgHomes.length; i++)
    {
      orgList.add(orgHomes[i].getName());
    }
    return orgList;
  }

  @Override
  public String getServiceId()
  {
    return serviceId;
  }

}
