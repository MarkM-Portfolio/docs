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

import java.util.List;

import com.ibm.concord.spi.exception.AccessException;
import com.ibm.docs.entitlement.bean.DocEBean;

public interface IDocEntitlementDAO
{
  public DocEBean getByUser(String userid, String orgid) throws AccessException;

  public DocEBean getByOrg(String orgid) throws AccessException;

  public DocEBean getByLevelId(String levelid) throws AccessException;

  public List<DocEBean> getByUniqueName(String levelName) throws AccessException;

  public boolean add(DocEBean bean) throws AccessException;

  public boolean update(DocEBean bean) throws AccessException;

  public boolean deleteByLevelId(String levelid) throws AccessException;
}
