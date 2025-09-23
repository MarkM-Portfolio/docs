/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job;

import java.io.File;
import java.util.UUID;

import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.docs.directory.beans.UserBean;

public abstract class JobContext
{
  public UserBean requester;

  private String workingDir;

  private Object result;

  private boolean headless;

  private String jobId;

  public JobContext()
  {
    this.workingDir = null;
  }

  public JobContext(String workingDir)
  {
    if (!new File(workingDir).exists() || !new File(workingDir).isDirectory())
    {
      throw new IllegalArgumentException();
    }

    this.workingDir = workingDir;
  }

  public String getJobId()
  {
    if (jobId == null)
    {
      String jobIdString = getJobIdString();
      if (getHeadless())
      {
        jobIdString += UUID.randomUUID().toString();
      }
      jobId = ConcordUtil.generateMD5Id(jobIdString);
    }
    return jobId;
  }

  protected abstract String getJobIdString();

  public boolean getHeadless()
  {
    return headless;
  }

  public void setHeadless(boolean headless)
  {
    this.headless = headless;
  }

  public Object getResult()
  {
    return result;
  }

  public void setResult(Object result)
  {
    this.result = result;
  }

  public File getWorkingDir()
  {
    if (workingDir == null)
    {
      throw new NullPointerException("The working dir is not set for Job");
    }

    return new File(workingDir);
  }

  public void setWorkingDir(File workingDir)
  {
    if (!workingDir.exists() || !workingDir.isDirectory())
    {
      throw new IllegalArgumentException();
    }

    this.workingDir = workingDir.getPath();
  }
}
