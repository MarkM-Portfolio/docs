/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration;

import java.io.File;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.naming.InitialContext;
import javax.naming.NamingException;

import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.migration.context.MigrationContext;
import com.ibm.concord.migration.context.MigrationStatus;
import com.ibm.concord.migration.job.MigrationJob;
import com.ibm.concord.platform.Platform;
import com.ibm.websphere.asynchbeans.WorkManager;

public class MigrationService implements IMigrationService
{
  public static final Logger LOGGER = Logger.getLogger(MigrationService.class.getName());

  private static final String MIGRATION_WORKMANAGER = "java:comp/env/com/ibm/docs/migration/workmanager";

  private static final int MAX_RETRY_NUM = 5;

  private Map<String, String> versions;

  private WorkManager wm;

  private int retryNum = 0;

  public MigrationService()
  {
    this.versions = DocumentServiceUtil.getDocumentServiceVersions();
    initWorkManager();
  }

  public void process(boolean retry)
  {
    if (getWorkManager() != null)
    {
      if (retry)
      {
        if (retryNum >= MAX_RETRY_NUM)
        {
          LOGGER.log(Level.INFO, "Migration Tool has retried " + retryNum + " times, stop retry");
          return;
        }
        else
        {
          retryNum++;
        }
      }
      else
      {
        retryNum = 0;
      }
      MigrationComponent component = (MigrationComponent) Platform.getComponent(MigrationComponent.COMPONENT_ID);
      boolean forceScan = component.isForceScan();
      MigrationStatus status = new MigrationStatus(versions, forceScan);
      if (status.getStatus() == MigrationStatus.COMPLETE)
      {
        LOGGER.log(Level.INFO, "The upgrade for version: " + status.getVersionString() + " has completed");
      }
      else
      {
        MigrationContext context = new MigrationContext(status);
        context.setWorkingDir(new File(JobUtil.getDefaultWorkingDir("admin", "migration", context.getJobId())));
        MigrationJob job = new MigrationJob(context);
        job.schedule();
      }
    }
    else
    {
      LOGGER
          .log(
              Level.WARNING,
              "Migration process cancelled, caused by no migration work manager setting on this HCL Docs server. Maybe this server is not migration tool host server or has configuration error.");
    }
  }

  public void process()
  {
    process(false);
  }

  private void initWorkManager()
  {
    InitialContext context = null;
    try
    {
      context = new InitialContext();
      wm = (WorkManager) context.lookup(MIGRATION_WORKMANAGER);
    }
    catch (NamingException e)
    {
      wm = null;
      LOGGER.log(Level.WARNING, "didn't find migration work manager setting on this server, so no need to run migration on this server.");
    }
  }

  public WorkManager getWorkManager()
  {
    if (wm == null)
    {
      // try to init work manager again, in case server setting changed.
      initWorkManager();
    }
    return wm;
  }
}
