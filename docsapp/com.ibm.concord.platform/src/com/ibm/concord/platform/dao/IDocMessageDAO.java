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

import java.sql.Timestamp;
import java.util.List;

import com.ibm.concord.platform.bean.DocMessageBean;
import com.ibm.concord.spi.exception.AccessException;

public interface IDocMessageDAO
{
  public boolean addMessage(DocMessageBean bean) throws AccessException;

  public boolean updateMessage(DocMessageBean bean) throws AccessException;

  public DocMessageBean getMessage(String docUri, String docRepo, String userid, String type) throws AccessException;

  public List<DocMessageBean> getMessageByUser(String userid) throws AccessException;
  
  public List<DocMessageBean> getMessageByDuedate(String userid ,Timestamp duedate) throws AccessException;
  
  public List<DocMessageBean> getMessageByDate(String userid ,Timestamp date) throws AccessException;

  public boolean deleteMessage(String docUri, String docRepo, String userid, String type) throws AccessException;
  
}
