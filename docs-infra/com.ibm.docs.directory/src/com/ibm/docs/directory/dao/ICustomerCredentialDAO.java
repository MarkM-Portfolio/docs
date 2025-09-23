/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.dao;

public interface ICustomerCredentialDAO
{
  public boolean add(String customerId, String key, String value);

  public boolean update(String customerId, String key, String value);

  public String get(String customerId, String key);

  public boolean deleteByCustomer(String customerId);

  public boolean deleteByCustomerByKey(String customerId, String key);
}
