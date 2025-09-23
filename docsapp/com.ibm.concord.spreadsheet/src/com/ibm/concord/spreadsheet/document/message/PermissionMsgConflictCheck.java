/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.document.message;

import java.util.ArrayList;

import com.ibm.concord.spi.document.services.IDocumentService.TransformResult;
import com.ibm.concord.spreadsheet.document.message.Message.Token;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class PermissionMsgConflictCheck implements ISemanticConflictCheck
{
	private static final String ACTION_TYPE_SET = "set";
	private static final String ACTION_TYPE_INSERT = "insert";
	private static final String REF_TYPE = "unnamerange";
	
	private static final String USAGE_TYPE = "ACCESS_PERMISSION";
	
	public boolean preCondition(JSONObject jsonMsg, JSONArray baseJSONMsgList)
	{
		if(!MessageUtil.isMsgContainUsage(jsonMsg, USAGE_TYPE))
			return false;
		if(!MessageUtil.isMsgContainAction(jsonMsg, ACTION_TYPE_SET) && !MessageUtil.isMsgContainAction(jsonMsg, ACTION_TYPE_INSERT))
			return false;
		if(!MessageUtil.isMsgContainRefType(jsonMsg, REF_TYPE))
			return false;
		
		boolean ret = false;
		for(int i = 0 ; i < baseJSONMsgList.size(); i++)
		{
			JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
			if (!Transformer.isContentMessage(msg)) continue;
			if((MessageUtil.isMsgContainAction(msg,ACTION_TYPE_INSERT) || MessageUtil.isMsgContainAction(msg,ACTION_TYPE_SET))&&
					MessageUtil.isMsgContainUsage(jsonMsg, USAGE_TYPE) && MessageUtil.isMsgContainRefType(msg, REF_TYPE))
			{
				ret = true;
				break;
			}
		}
		return ret;
	}
	
	public TransformResult conflictCheck(JSONObject jsonMsg, JSONArray baseJSONMsgList)
	{
		ArrayList<String> refList = MessageUtil.getRef4Msg(jsonMsg, ACTION_TYPE_SET, REF_TYPE, USAGE_TYPE);
		ArrayList<String> refList2 = MessageUtil.getRef4Msg(jsonMsg, ACTION_TYPE_INSERT, REF_TYPE, USAGE_TYPE);
		refList.addAll(refList2);
		
		 ArrayList<String> baseRefList = new ArrayList<String>();
		 for(int i = 0 ; i < baseJSONMsgList.size(); i++)
	    {
			JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
	        if (!Transformer.isContentMessage(msg)) 
	          continue;
	        
	        ArrayList<String> tmp = MessageUtil.getRef4Msg(msg, ACTION_TYPE_SET, REF_TYPE, USAGE_TYPE);
	        baseRefList.addAll(tmp);
	        tmp = MessageUtil.getRef4Msg(msg, ACTION_TYPE_INSERT, REF_TYPE, USAGE_TYPE);
	        baseRefList.addAll(tmp);
	    }
		 
		 // translate the refvalue string to token
	    ArrayList<Token> refTokenList = new ArrayList<Token>();
	    for(int i = 0; i < refList.size(); i++)
	    {
	        Token tk = new Message.Token(refList.get(i), null, null);
	        refTokenList.add(tk);
	    }
	    ArrayList<Token> baseTokenList = new ArrayList<Token>();
	    for(int i = 0; i < baseRefList.size(); i++)
	    {
	        Token tk = new Message.Token(baseRefList.get(i), null, null);
	        baseTokenList.add(tk);
	    }
	    for(int i = 0; i < refTokenList.size(); i++)
	    {
	        for(int j = 0; j < baseTokenList.size(); j++)
	        {
	            if(MessageUtil.isIntersection(refTokenList.get(i),baseTokenList.get(j)))
	                return TransformResult.CONFLICT;
	        }
	    }
	    return TransformResult.ACCEPT;
	}
}