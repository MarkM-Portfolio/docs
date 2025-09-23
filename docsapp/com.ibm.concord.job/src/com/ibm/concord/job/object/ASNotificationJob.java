/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.job.object;

import java.io.File;
import java.io.IOException;
import java.util.logging.Logger;

import com.ibm.concord.job.Job;
import com.ibm.concord.job.context.ASNotificationContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.notification.EmailNoticeComponentImpl;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.notification.IEmailNoticeAdapter;

public class ASNotificationJob extends Job
{
  private static final Logger LOG = Logger.getLogger(ASNotificationJob.class.getName());

  private ASNotificationContext context;

  public ASNotificationJob(ASNotificationContext jobContext)
  {
    super(jobContext);
    this.context = jobContext;
  }

  public Object exec() throws JobExecutionException
  {
    LOG.entering(ASNotificationJob.class.getName(), "Job exec()");
    try
    {
      getEmailNoticeAdapter().entriesNotified(context.getCaller(), context.getActivityEntries());
    }
    catch (AccessException e)
    {
      LOG.warning("Notification Failed -> " + e.getMessage());
    }
    LOG.exiting(ASNotificationJob.class.getName(), "Job exec()");
    return null;
  }

  private IEmailNoticeAdapter getEmailNoticeAdapter()
  {
    return (IEmailNoticeAdapter) Platform.getComponent(EmailNoticeComponentImpl.COMPONENT_ID).getService(IEmailNoticeAdapter.class, context.getDocEntry().getRepository());
  }

  public void putResult(Object result)
  {
    try
    {
      getResultFile().createNewFile();
    }
    catch (IOException e)
    {
      new File(context.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX).delete();
      putError(e);
    }
  }

  public File getResultFile()
  {
    return new File(context.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
  }

}
