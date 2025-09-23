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

import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.migration.IMigrationService;
import com.ibm.concord.migration.MigrationComponent;
import com.ibm.concord.migration.MigrationTool;
import com.ibm.concord.migration.context.MigrationContext;
import com.ibm.concord.migration.context.MigrationStatus;
import com.ibm.concord.platform.Platform;
import com.ibm.websphere.asynchbeans.WorkException;

public class MigrationJob extends Job
{
  public static final Logger LOGGER = Logger.getLogger(MigrationJob.class.getName());

  private MigrationContext upgradeContext;

  private IMigrationService migrationService = (IMigrationService) Platform.getComponent(MigrationComponent.COMPONENT_ID).getService(
      IMigrationService.class);

  public MigrationJob(JobContext jobContext)
  {
    super(jobContext);
    this.upgradeContext = (MigrationContext) jobContext;
    this.workManager = migrationService.getWorkManager();
    this.addListener(new MigrationListener());
  }
  
  public String schedule()
  {
    try
    {
      LOGGER.log(Level.FINE, jobContext.getJobId() + " started.");

      for (int i = 0; i < jobListeners.size(); i++)
      {
        jobListeners.get(i).aboutToSchedule(jobContext);
      }

      boolean shouldSchedule = true;
      for (int i = 0; i < jobListeners.size(); i++)
      {
        shouldSchedule = shouldSchedule && jobListeners.get(i).shouldSchedule(jobContext);
      }

      if (shouldSchedule)
      {
        if (workManager == null)
          workManager = Platform.getWorkManager();

        workManager.startWork(this);
      }
      else
      {
        return null;
      }

      for (int i = 0; i < jobListeners.size(); i++)
      {
        jobListeners.get(i).scheduled(jobContext);
      }
    
      return jobContext.getJobId();
    }
    catch(WorkException e)
    {
      LOGGER.log(Level.SEVERE, jobContext.getJobId() + " Failed to start work", e);
      throw new IllegalStateException("Failed to start work", e);
    }
  }

  @Override
  public Object exec() throws JobExecutionException
  {
    File resultFile = getResultFile();
    if (resultFile != null && resultFile.exists())
    {
      resultFile.delete();
    }

    MigrationTool tool = new MigrationTool(upgradeContext.getStatus());
    boolean succ = tool.process();
    return succ;
  }

  @Override
  public void putResult(Object result)
  {
    try
    {
      getResultFile().createNewFile();
    }
    catch (IOException e)
    {
      new File(upgradeContext.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX).delete();
      putError(e);
    }
  }

  @Override
  public File getResultFile()
  {
    return new File(upgradeContext.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
  }

  public void release()
  {
    super.release();
    if (upgradeContext.getStatus().getStatus() != MigrationStatus.COMPLETE)
    {
      LOGGER.info("Migration work is terminated before complete, restart it");
      migrationService.process(true);
    }
  }

}
