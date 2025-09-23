/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.entitlement.dao;

import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.entitlement.bean.UserEBean;


public interface IUserEntitlementDAO
{
  public int getUserReferenceCount(String levelId) throws AccessException;
  
  public UserEBean get(String userid, String orgid) throws AccessException;
  
  public String[] getUsers(String orgid) throws AccessException;

  public boolean add(UserEBean ueb) throws AccessException;

  public boolean update(UserEBean ueb) throws AccessException;

  public boolean deleteByUserIdOrgId(String userid, String orgid) throws AccessException;
  
}
