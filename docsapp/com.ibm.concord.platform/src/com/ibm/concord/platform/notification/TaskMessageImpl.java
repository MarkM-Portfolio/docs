/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.platform.notification;

import java.util.logging.Logger;

import com.ibm.concord.platform.bean.DocMessageBean;
import com.ibm.concord.platform.dao.IDocMessageDAO;
import com.ibm.concord.platform.task.AdapterUtil;
import com.ibm.concord.spi.beans.TaskBean;

public class TaskMessageImpl extends AbstactMessage
{
  private static final String logName = TaskMessageImpl.class.getName();

  private static final Logger LOG = Logger.getLogger(logName);

  public boolean createMessage(Object msgSource)
  {
    if (!(msgSource instanceof TaskBean))
      throw new IllegalArgumentException("Message is not from a task bean");

    TaskBean taskBean = (TaskBean) msgSource;
    String elements[] = taskBean.getDocid().split("/");
    String repo = elements[0];
    String uri = elements[1];
    try
    {
      IDocMessageDAO messageDAO = this.getDocMessageDAO();
      DocMessageBean msgBean = messageDAO.getMessage(uri, repo, taskBean.getOwner(), AdapterUtil.TASK_MSG);
      if (msgBean == null)
      {
        msgBean = AdapterUtil.convertMessageBean(taskBean);
        messageDAO.addMessage(msgBean);
      }
      else
      {
        AdapterUtil.updateMessageBean(msgBean, taskBean);
        messageDAO.updateMessage(msgBean);
      }
      // This is a reassign case
      if (taskBean.getMsgOwner() != null)
      {
        msgBean = messageDAO.getMessage(uri, repo, taskBean.getMsgOwner(), AdapterUtil.TASK_MSG);
        if (msgBean != null)
        {
          boolean remove = AdapterUtil.removeMessageBean(msgBean, taskBean);
          if (remove)
          {
            messageDAO.deleteMessage(uri, repo, taskBean.getMsgOwner(), AdapterUtil.TASK_MSG);
          }
          else
          {
            messageDAO.updateMessage(msgBean);
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.warning("failed to notify a message" + taskBean.toString());
      return false;
    }
    return true;
  }

  public boolean deleteMessage(Object msgSource)
  {
    if (!(msgSource instanceof TaskBean))
      throw new IllegalArgumentException("Message is not from a task bean");

    TaskBean taskBean = (TaskBean) msgSource;
    String elements[] = taskBean.getDocid().split("/");
    String repo = elements[0];
    String uri = elements[1];
    try
    {
      IDocMessageDAO messageDAO = this.getDocMessageDAO();
      DocMessageBean msgBean = messageDAO.getMessage(uri, repo, taskBean.getOwner(), AdapterUtil.TASK_MSG);
      if (msgBean != null)
      {
        boolean remove = AdapterUtil.removeMessageBean(msgBean, taskBean);
        if (remove)
        {
          messageDAO.deleteMessage(uri, repo, taskBean.getOwner(), AdapterUtil.TASK_MSG);
        }
        else
        {
          messageDAO.updateMessage(msgBean);
        }
      }
    }
    catch (Exception e)
    {
      LOG.warning("failed to delete a message" + taskBean.toString());
      return false;
    }
    return true;
  }
}
