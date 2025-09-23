/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.mbean;

public interface SharedStorageMgrMBean
{
  public String[] showmount();

  public boolean mount(String serverHost, String sharedFrom, String sharedTo, Integer retry, Integer timeo);
  
  public boolean mount(String serverHost, String sharedFrom, String sharedTo, Integer retry, Integer timeo, StorageType type);
  
  public boolean umount(String sharedTo);
  
  public boolean umount(String sharedTo, StorageType type);
  
}
