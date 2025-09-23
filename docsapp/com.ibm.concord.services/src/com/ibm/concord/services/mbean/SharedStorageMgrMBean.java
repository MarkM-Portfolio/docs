/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.mbean;

public interface SharedStorageMgrMBean
{
  public String[] showmount();

  public boolean mount(String serverHost, String sharedFrom, String sharedTo, Integer retry, Integer timeo);

  public boolean umount(String sharedTo);
}
