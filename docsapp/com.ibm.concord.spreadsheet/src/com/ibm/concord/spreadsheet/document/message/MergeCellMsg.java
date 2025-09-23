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

public class MergeCellMsg implements ISemanticConflictCheck 
{
	private static final String ACTION_TYPE = "merge";
	 
	public boolean preCondition(JSONObject jsonMsg, JSONArray baseJSONMsgList) 
	{
		if(!MessageUtil.isMsgContainAction(jsonMsg, ACTION_TYPE))
			return false;
		boolean ret = false;
		for(int i = 0 ; i < baseJSONMsgList.size(); i++)
		{
			JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
			if (!Transformer.isContentMessage(msg)) continue;
			if(MessageUtil.isMsgContainAction(msg,ACTION_TYPE))
			{
				ret = true;
				break;
			}	
		}
		return ret;
	}

	public TransformResult conflictCheck(JSONObject jsonMsg, JSONArray baseJSONMsgList)
	{
		// check if there are merge actions
		ArrayList<String> mergeRefList1 = MessageUtil.getRef4Msg(jsonMsg,ACTION_TYPE);

		ArrayList<String> mergeRefList2 = new ArrayList<String>();
	    for(int i = 0 ; i < baseJSONMsgList.size(); i++)
		{
			JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
			if (!Transformer.isContentMessage(msg)) continue;
			ArrayList<String> tmp = MessageUtil.getRef4Msg(msg,ACTION_TYPE);
			mergeRefList2.addAll(tmp);
		}

		// translate the refvalue string to token
		ArrayList<Token> mergeTokenList1 = new ArrayList<Token>();
		for(int i = 0; i < mergeRefList1.size(); i++)
		{
			Token tk = new Message.Token(mergeRefList1.get(i), null, null);
			mergeTokenList1.add(tk);
		}
		ArrayList<Token> mergeTokenList2 = new ArrayList<Token>();
		for(int i = 0; i < mergeRefList2.size(); i++)
		{
			Token tk = new Message.Token(mergeRefList2.get(i), null, null);
			mergeTokenList2.add(tk);
		}
		for(int i = 0; i < mergeTokenList1.size(); i++)
		{
			for(int j = 0; j < mergeTokenList2.size(); j++)
			{
				if(MessageUtil.isIntersection(mergeTokenList1.get(i),mergeTokenList2.get(j)))
					return TransformResult.CONFLICT;
			}
		}
		return TransformResult.ACCEPT;
	}
}