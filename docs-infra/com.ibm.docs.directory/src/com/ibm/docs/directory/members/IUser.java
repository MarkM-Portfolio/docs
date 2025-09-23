/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.members;

public interface IUser extends IMemberBase
{
  /**
   * @return an instance of IOrg for the organization the user belong to.
   */
  public IOrg getOrg();
}
