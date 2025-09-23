package com.ibm.concord.document.common.util;

/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */


import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
/**
 * 
 * This file is used for log the recent 10 messages when exception.
 * will be disabled before production release
 *
 */
public class MsgListLog {
	public static final boolean LOGMSG_ENABLED = false;
	private static final int MAX_MSGS = 10;
	private static ThreadLocal<JSONArray> msgList = new ThreadLocal<JSONArray>();
	public static void cleanMsgList(){
		if (!LOGMSG_ENABLED) return;
		JSONArray msgs = MsgListLog.msgList.get();
		if (msgs != null){
			msgs.clear();
			MsgListLog.msgList.remove();
		}
	}
	
	public static void pushMsg(JSONObject msg){
		if (!LOGMSG_ENABLED) return;
		JSONArray msgs = MsgListLog.msgList.get();
		if (msgs == null){
			msgs = new JSONArray();
			MsgListLog.msgList.set(msgs);
		}
		if (msgs.size()>= MsgListLog.MAX_MSGS){
			msgs.remove(0);
		}
		msgs.add(msg);
	}
	private static final Logger LOG = Logger.getLogger(MsgListLog.class.getName());
	public static void printMsgList(Level logLevel){
		if (!LOGMSG_ENABLED) return;
		LOG.log(logLevel,"== MSGlist for this process:");
		JSONArray msgs = MsgListLog.msgList.get();
		if (msgs == null){
			return;
		}
		int msgLen = msgs.size();
		int count = 0;
	    while (count < msgLen)
	    {
	        JSONObject msg = (JSONObject) msgs.get(count);
	        count++;
	        LOG.log(logLevel, msg.toString());
	    }
	    msgs.clear();
	    MsgListLog.msgList.remove();
	}
}
