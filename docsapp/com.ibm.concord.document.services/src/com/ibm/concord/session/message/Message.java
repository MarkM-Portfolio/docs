/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.session.message;

import java.util.ArrayList;
import java.util.List;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class Message
{
  private String clientId;
  private long clientSeq;
  private long serverSeq;
  private JSONObject data;
  private boolean conflictResolvedMsg;
  private boolean isServerMsg;
  private boolean isControlMsg;
  private boolean isAsControlMsg; // it is control message, but it needs to be transformed
  private boolean isClientLogMsg;
  private String logCnt;  
  private long size;
  
  public final static JSONObject SAVED_AS_CTRL_MSG = new JSONObject();
  static
  {
    SAVED_AS_CTRL_MSG.put("asCtrl", true);
  }
  
  public Message(JSONObject jsonMsg)
  {
    isServerMsg = false;
    Object ob = jsonMsg.get(MessageConstants.IS_SERVER_MSG);
    if (ob != null)
    {
      isServerMsg = Boolean.parseBoolean(ob.toString());
      if (isServerMsg)
      {
    	  clientId = "server";
    	  jsonMsg.put(MessageConstants.CLIENT_ID, clientId);
          jsonMsg.put(MessageConstants.SERVER_SEQ, 0);
          jsonMsg.put(MessageConstants.CLIENT_SEQ, 0);          
      }
    }
    
    isControlMsg = false;
    ob = jsonMsg.get(MessageConstants.IS_CONTROL_MSG);
    if (ob != null)
    {
      isControlMsg = Boolean.parseBoolean(ob.toString());
    }
    
    isAsControlMsg = false;
    ob = jsonMsg.get(MessageConstants.IS_ASCONTROL_MSG);
    if (ob != null)
    {
      isAsControlMsg = Boolean.parseBoolean(ob.toString());
    }
    
    isClientLogMsg = false;
    logCnt = null;
    ob = jsonMsg.get(MessageConstants.CLIENT_LOG);
    if(ob != null)
    {
    	isClientLogMsg = true;
    	logCnt = (String) ob;
    }
    
    clientId = (String)jsonMsg.get(MessageConstants.CLIENT_ID);
    serverSeq = Long.parseLong(jsonMsg.get(MessageConstants.SERVER_SEQ).toString());
    clientSeq = Long.parseLong(jsonMsg.get(MessageConstants.CLIENT_SEQ).toString());
    
    conflictResolvedMsg = false;
    ob = jsonMsg.get(MessageConstants.RESOLVE_CONFLICT);
    if (ob != null)
    {
      conflictResolvedMsg = Boolean.parseBoolean(ob.toString());
    }
    
    data = jsonMsg;
    
    size = 2 * data.toString().length();
  }
  
  public boolean isResolveConflictMessage()
  {
    return conflictResolvedMsg;
  }
  
  public boolean isServerMessage()
  {
    return isServerMsg;
  }
  
  public boolean isControlMsg()
  {
    return isControlMsg;
  }

  public boolean isAsControlMsg()
  {
    return isAsControlMsg;
  }

  public boolean isClientLogMsg()
  {
    return isClientLogMsg;
  }

  public String getLogContent()
  {
	  return logCnt;
  }
  
  public String getClientId()
  {
    return clientId;
  }
  
  public long getClientSeq()
  {
    return clientSeq;
  }
  
  public long getServerSeq()
  {
    return serverSeq;
  }
  
  public void setServerSeq(long seq)
  {
    serverSeq = seq;
    data.put(MessageConstants.SERVER_SEQ, seq);
  }
  
  public void setControlType(String type)
  {
    data.put(MessageConstants.CONTROL_TYPE, type);
  }
  
  public JSONObject toJSON()
  {
    return data;
  }
  
  public long getSize()
  {
    return size;
  }
  
  public static List<Message> fromJSONArray(JSONArray jsonList)
  {
    List<Message> msgList = new ArrayList<Message>();
    for (int i = 0; i < jsonList.size(); i++)
    {
      Message msg = new Message((JSONObject)jsonList.get(i));
      msgList.add(msg);
    }
    return msgList;
  }
  
  public static JSONArray toJSONArray(List<Message> msgList)
  {
    JSONArray jsonList = new JSONArray();
    for (int i = 0; i < msgList.size(); i++)
    {
      jsonList.add(msgList.get(i).toJSON());
    }
    return jsonList;
  }
}
