/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.platform.bean;

import java.sql.Timestamp;

public class DocMessageBean
{
  private String uri;

  private String repoid;

  private String userid;

  private String messageType;

  private String bytesMessage;

  private Timestamp msgTimestamp;

  private Timestamp expiration;

  private Timestamp duedate;

  private String changeset;
  
  public DocMessageBean(){
    
  }

  public String getUri()
  {
    return uri;
  }

  public void setUri(String uri)
  {
    this.uri = uri;
  }

  public String getRepoid()
  {
    return repoid;
  }

  public void setRepoid(String repoid)
  {
    this.repoid = repoid;
  }

  public String getUserid()
  {
    return userid;
  }

  public void setUserid(String userid)
  {
    this.userid = userid;
  }

  public String getMessageType()
  {
    return messageType;
  }

  public void setMessageType(String messageType)
  {
    this.messageType = messageType;
  }

  public String getBytesMessage()
  {
    return bytesMessage;
  }

  public void setBytesMessage(String bytesMessage)
  {
    this.bytesMessage = bytesMessage;
  }

  public Timestamp getMsgTimestamp()
  {
    return msgTimestamp;
  }

  public void setMsgTimestamp(Timestamp msgTimestamp)
  {
    this.msgTimestamp = msgTimestamp;
  }

  public Timestamp getExpiration()
  {
    return expiration;
  }

  public void setExpiration(Timestamp expiration)
  {
    this.expiration = expiration;
  }

  public Timestamp getDuedate()
  {
    return duedate;
  }

  public void setDuedate(Timestamp duedate)
  {
    this.duedate = duedate;
  }

  public String getChangeset()
  {
    return changeset;
  }

  public void setChangeset(String changeset)
  {
    this.changeset = changeset;
  }

  public String toString()
  {
    return "DocMessageBean [uri=" + uri + ", repo_id=" + repoid + ", user_id=" + userid + ", message_type=" + messageType
        + ", bytesMessage=" + bytesMessage + ", msgTimestamp=" + msgTimestamp + ", expiration=" + expiration + ", duedate=" + duedate
        + ", changeset=" + changeset + "]";
  }

}
