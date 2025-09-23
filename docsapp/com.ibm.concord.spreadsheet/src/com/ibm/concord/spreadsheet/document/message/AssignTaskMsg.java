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
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.message.Message.Token;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class AssignTaskMsg implements ISemanticConflictCheck 
{
	private static final String ACTION_TYPE = "insert";
	
	private boolean hasAssignTask(JSONObject jsonMsg)
	{
		JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
		for (int i = 0; i < events.size(); i++) {
			JSONObject event = (JSONObject) events.get(i);
			String action = (String) event.get(ConversionConstant.ACTION);
			if (action != null) {		
				JSONObject data = (JSONObject) event.get(ConversionConstant.DATA);
				if(data!=null) {
					String usage = (String) data.get(ConversionConstant.RANGE_USAGE);
					if(usage!=null) {
						if (action.equalsIgnoreCase(ConversionConstant.ACTION_INSERT) && usage.equalsIgnoreCase(ConversionConstant.USAGE_TASK))
							return true;
					}
				}
			}
		}
		
		return false;
	}
	
	public boolean preCondition(JSONObject jsonMsg, JSONArray baseJSONMsgList) 
	{
		if(!hasAssignTask(jsonMsg))
			return false;
		
		for(int i = 0 ; i < baseJSONMsgList.size(); i++)
		{
			JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
			if (!Transformer.isContentMessage(msg)) 
				continue;
			
			if(hasAssignTask(msg))
				return true;
		}
		return false;
	}

	public TransformResult conflictCheck(JSONObject jsonMsg, JSONArray baseJSONMsgList)
	{
		ArrayList<String> refList1 = MessageUtil.getRef4Msg(jsonMsg,ACTION_TYPE);

		ArrayList<String> refList2 = new ArrayList<String>();
	    for(int i = 0 ; i < baseJSONMsgList.size(); i++)
		{
			JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
			if (!Transformer.isContentMessage(msg)) continue;
			ArrayList<String> tmp = MessageUtil.getRef4Msg(msg,ACTION_TYPE);
			refList2.addAll(tmp);
		}

		// translate the refvalue string to token
		ArrayList<Token> tokenList1 = new ArrayList<Token>();
		for(int i = 0; i < refList1.size(); i++)
		{
			Token tk = new Message.Token(refList1.get(i), null, null);
			tokenList1.add(tk);
		}
		ArrayList<Token> tokenList2 = new ArrayList<Token>();
		for(int i = 0; i < refList2.size(); i++)
		{
			Token tk = new Message.Token(refList2.get(i), null, null);
			tokenList2.add(tk);
		}
		for(int i = 0; i < tokenList1.size(); i++)
		{
			for(int j = 0; j < tokenList2.size(); j++)
			{
				if(MessageUtil.isIntersection(tokenList1.get(i),tokenList2.get(j)))
					return TransformResult.IGNORE;
			}
		}
		return TransformResult.ACCEPT;
	}
}