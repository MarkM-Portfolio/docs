/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.platform.dao;

import java.util.List;

import com.ibm.concord.platform.bean.DocAssociationBean;
import com.ibm.concord.spi.exception.AccessException;

public interface IDocAssociationDAO
{
  public boolean addAssociation(DocAssociationBean bean) throws AccessException;

  public boolean deleteAssociation(String associationid) throws AccessException;
  
  public boolean updateAssociation(DocAssociationBean bean) throws AccessException;

  public DocAssociationBean getAssociation(String associationid) throws AccessException;
  
  public List<DocAssociationBean> getAssociations() throws AccessException;
}
