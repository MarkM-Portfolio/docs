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

public interface JobListener
{
  public void aboutToSchedule(JobContext jobContext);

  public boolean shouldSchedule(JobContext jobContext);

  public void scheduled(JobContext jobContext);

  public void joined(JobContext jobContext, boolean locally);

  public void done(JobContext jobContext, boolean success);
}
