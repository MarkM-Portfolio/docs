/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.session;

import java.util.Date;

import com.ibm.docs.directory.beans.UserBean;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class Participant
{
  private UserBean user;

  private String clientId;

  private Date reportTime;

  // Add data segment for join time of this participant...
  private Date joinTime;

  private long currentSeq;

  private long clientSeq;

  public Participant(UserBean user, String clientId, Date time, long serverSeq)
  {
    this.user = user;
    this.clientId = clientId;
    this.reportTime = time;
    // Add data segment for join time of this participant...
    this.joinTime = time;
    this.currentSeq = serverSeq;
    this.clientSeq = 0;
  }

  public Date getReportTime()
  {
    return reportTime;
  }

  // Add data segment for join time of this participant...
  public Date getJoinTime()
  {
    return joinTime;
  }

  public void updateReportTime(Date time)
  {
    this.reportTime = time;
  }

  public UserBean getUserBean()
  {
    return user;
  }

  public String getClientId()
  {
    return clientId;
  }

  public long getCurrentSeq()
  {
    return currentSeq;
  }

  public void updateCurrentSeq(long seq)
  {
    currentSeq = seq;
  }

  public long getClientSeq()
  {
    return clientSeq;
  }

  public void updateClientSeq(long seq)
  {
    clientSeq = seq;
  }
}
