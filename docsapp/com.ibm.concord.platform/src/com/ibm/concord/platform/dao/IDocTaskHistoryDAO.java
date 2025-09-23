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

import com.ibm.concord.platform.bean.DocTaskHistoryBean;
import com.ibm.concord.spi.exception.AccessException;

public interface IDocTaskHistoryDAO
{
  public boolean addTaskHistory(DocTaskHistoryBean bean) throws AccessException;

  public boolean deleteTaskHistories(String taskid) throws AccessException;

  public List<DocTaskHistoryBean> getTaskHistories(String taskid)throws AccessException;
}
