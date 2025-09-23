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

import com.ibm.websphere.asynchbeans.WorkManager;

public interface IMigrationService
{
  public void process();

  public void process(boolean retry);

  public WorkManager getWorkManager();
}
