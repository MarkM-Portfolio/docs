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
import com.ibm.docs.entitlement.bean.OrgEBean;

public interface IOrgEntitlementDAO
{
  public int getOrgReferenceCount(String levelId) throws AccessException;

  public OrgEBean get(String orgid) throws AccessException;

  public boolean add(OrgEBean oeb) throws AccessException;

  public boolean update(OrgEBean oeb) throws AccessException;

  public boolean deleteByOrgId(String orgid) throws AccessException;
}
