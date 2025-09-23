/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.beans;

import java.util.Date;
import java.util.UUID;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class ParticipantBean
{
  private UUID docId;

  private String clientId;

  private Date joinTime;

  private String userId;

  public UUID getDocId()
  {
    return docId;
  }

  public Date getJoinTime()
  {
    return joinTime;
  }

  public String getClientId()
  {
    return clientId;
  }

  public String getUserId()
  {
    return userId;
  }

  public void setDocId(UUID docId)
  {
    this.docId = docId;
  }

  public void setJoinTime(Date joinTime)
  {
    this.joinTime = joinTime;
  }

  public void setClientId(String clientId)
  {
    this.clientId = clientId;
  }

  public void setUserId(String userId)
  {
    this.userId = userId;
  }
  
  public String toString()
  {
    return "ParticipantBean:" + docId + ";" + clientId + ";" + joinTime + ";" + userId; 
  }
}
