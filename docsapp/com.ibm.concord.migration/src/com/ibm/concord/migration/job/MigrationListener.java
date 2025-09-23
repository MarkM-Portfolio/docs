/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration.job;

import java.util.logging.Logger;

import com.ibm.concord.job.JobContext;
import com.ibm.concord.job.JobListener;
import com.ibm.concord.migration.IMigrationService;
import com.ibm.concord.migration.MigrationComponent;
import com.ibm.concord.migration.context.MigrationContext;
import com.ibm.concord.migration.context.MigrationStatus;
import com.ibm.concord.platform.Platform;

public class MigrationListener implements JobListener
{
  public static final Logger LOGGER = Logger.getLogger(MigrationListener.class.getName());
  @Override
  public void aboutToSchedule(JobContext jobContext)
  {

  }

  @Override
  public boolean shouldSchedule(JobContext jobContext)
  {
    MigrationContext upgradeContext = (MigrationContext) jobContext;
    if (upgradeContext.getStatus().getStatus() != MigrationStatus.COMPLETE)
      return true;
      
    return false;
  }

  @Override
  public void scheduled(JobContext jobContext)
  {

  }

  @Override
  public void joined(JobContext jobContext, boolean locally)
  {

  }

  @Override
  public void done(JobContext jobContext, boolean success)
  {
    if (!success)
    {
      MigrationContext upgradeContext = (MigrationContext) jobContext;
      if (upgradeContext.getStatus().getStatus() != MigrationStatus.COMPLETE)
      {
        LOGGER.info("Migration work is not completed successfully, restart it");
        IMigrationService migrationService = (IMigrationService) Platform.getComponent(MigrationComponent.COMPONENT_ID).getService(IMigrationService.class);
        migrationService.process(true);
      }
    }

  }

}
