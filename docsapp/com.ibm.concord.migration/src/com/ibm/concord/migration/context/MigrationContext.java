/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration.context;

import java.util.Map;
import java.util.Map.Entry;

import com.ibm.concord.job.JobContext;

public class MigrationContext extends JobContext
{

  private MigrationStatus status;

  public MigrationContext(MigrationStatus status)
  {
    this.status = status;
  }

  protected String getJobIdString()
  {
    StringBuffer engine = new StringBuffer();
    Map<String, String> versions = status.getVersions();

    for (Entry<String, String> entry : versions.entrySet())
    {
      String name = entry.getKey();
      String version = entry.getValue();
      engine.append(name + "_" + version + "_");
    }
    
    return engine.toString();
  }
  
  public MigrationStatus getStatus()
  {
    return this.status;
  }

}
