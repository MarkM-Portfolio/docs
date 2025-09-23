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

import com.ibm.concord.platform.bean.DocTaskBean;
import com.ibm.concord.spi.exception.AccessException;

public interface IDocTaskDAO
{
  public boolean add(DocTaskBean task) throws AccessException;

  public DocTaskBean getTask(String taskid) throws AccessException;

  public List<DocTaskBean> getTasks(String docRepo, String docUri) throws AccessException;
  
  public List<DocTaskBean> getTasksByOwner(String owner) throws AccessException;

  public boolean deleteByTaskID(String taskid) throws AccessException;

  public boolean deleteByAssociationID(String associationid) throws AccessException;

  public boolean deleteByDocID(String docRepo, String docUri);

  public boolean update(DocTaskBean task) throws AccessException;
}
