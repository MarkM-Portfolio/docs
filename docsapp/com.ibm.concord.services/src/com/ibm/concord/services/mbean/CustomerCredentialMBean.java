/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.mbean;

public interface CustomerCredentialMBean
{
  public boolean addCredential(String customerId, String key, String value);

  public boolean updateCredential(String customerId, String key, String value);

  public boolean removeCredential(String customerId, String key);
  
  public boolean deleteCredential(String customerId);
}
