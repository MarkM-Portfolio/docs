/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration.tasks;

import java.io.File;

public interface IMigrationTask
{
  /**
   * @param orgHome the organization home
   * @param directory check if the specified folder need to upgraded
   * @return if it needs to upgrade, return the task context
   *         else return null
   */
  public MigrationTaskContext check(File orgHome, File docDraftHome);
  
  /**
   * @param context the upgrade context
   * @return if this file is upgraded successfully
   * @throws Exception 
   */
  public boolean migrate(MigrationTaskContext context) throws Exception;
}
