/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration.mbean;

public interface MigrationMBean
{

  /**
   * Start the migration process
   */
  public abstract void start();

  /**
   * Enable or disable migration service in IBM Docs configuration file. The change will be applied after restarting IBM Docs application.
   * 
   * @param enable
   *          if true, enable migration service, otherwise disable it.
   */
  public abstract void enableAfterRestart(boolean enable);

}