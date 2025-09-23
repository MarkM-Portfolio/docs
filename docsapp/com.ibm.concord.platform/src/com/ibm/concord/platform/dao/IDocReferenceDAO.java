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

import com.ibm.concord.platform.bean.DocReferenceBean;
import com.ibm.docs.directory.beans.UserBean;

public interface IDocReferenceDAO
{
  public boolean add(UserBean user, DocReferenceBean docRefBean);
  
  public boolean deleteByParentDocument(String parentRepo, String parentUri);
  
  public boolean deleteByChildDocument(String childRepo, String childUri);
  
  public boolean delete(String parentRepo, String parentUri, String childRepo, String childUri);
  
  public boolean update(DocReferenceBean bean);
  
  public List<DocReferenceBean> getByChild(String childRepo, String childUri);
  
  public List<DocReferenceBean> getByParent(String parentRepo, String parentUri);
  
  public DocReferenceBean getBy(String parentRepo, String parentUri, String childRepo, String childUri);
}
