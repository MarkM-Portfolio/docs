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
import com.ibm.concord.spreadsheet.document.message.Message.OPType;
import com.ibm.concord.spreadsheet.document.message.Message.Token;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class RangeMsgConflictCheck implements ISemanticConflictCheck 
{
	private static final String ACTION_TYPE = "set";
	private static final String REF_TYPE = "unnamerange";
	private static final String ACTION_TYPE_INSERT = "insert";
	private static final String REF_TYPE_ROW = "row";
	private static final String REF_TYPE_COLUMN = "column";
	
	public boolean preCondition(JSONObject jsonMsg, JSONArray baseJSONMsgList) 
	{
		if(!MessageUtil.isMsgContainAction(jsonMsg, ACTION_TYPE))
			return false;
		if(!MessageUtil.isMsgContainRefType(jsonMsg, REF_TYPE) && !MessageUtil.isMsgContainRefType(jsonMsg, REF_TYPE_COLUMN))
			return false;
		boolean ret = false;
		for(int i = 0 ; i < baseJSONMsgList.size(); i++)
		{
			JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
			if (!Transformer.isContentMessage(msg)) continue;
			if(MessageUtil.isMsgContainAction(msg,ACTION_TYPE_INSERT) &&
			   (MessageUtil.isMsgContainRefType(msg, REF_TYPE_ROW) || (MessageUtil.isMsgContainRefType(msg, REF_TYPE_COLUMN))))
			{
				ret = true;
				break;
			}	
		}
		return ret;
	}
	public TransformResult conflictCheck(JSONObject jsonMsg, JSONArray baseJSONMsgList)
	{
		ArrayList<String> mergeRefList1 = MessageUtil.getRef4Msg(jsonMsg,ACTION_TYPE, REF_TYPE);
		ArrayList<String> colRefList = MessageUtil.getRef4Msg(jsonMsg,ACTION_TYPE, REF_TYPE_COLUMN);
		mergeRefList1.addAll(colRefList);
		
		ArrayList<String> mergeRefList2 = new ArrayList<String>();
	    for(int i = 0 ; i < baseJSONMsgList.size(); i++)
		{
			JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
			if (!Transformer.isContentMessage(msg)) continue;
			ArrayList<String> tmp = MessageUtil.getRef4Msg(msg,ACTION_TYPE_INSERT,REF_TYPE_ROW);
			mergeRefList2.addAll(tmp);
			tmp = MessageUtil.getRef4Msg(msg,ACTION_TYPE_INSERT,REF_TYPE_COLUMN);
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
			Token t1 = mergeTokenList1.get(i);
			String sheetName = t1.getSheetName();
			int startRowIndex1 = t1.getStartRowIndex();
			int endRowIndex1 = t1.getEndRowIndex();
			endRowIndex1 = (endRowIndex1 < startRowIndex1) ? startRowIndex1 : endRowIndex1;
			int startColIndex1 = t1.getStartColIndex();
			int endColIndex1 = t1.getEndColIndex();
			endColIndex1 = (endColIndex1 < startColIndex1) ? startColIndex1 : endColIndex1;
			for(int j = 0; j < mergeTokenList2.size(); j++)
			{
				Token t2 = mergeTokenList2.get(j);
				if(sheetName.equals(t2.getSheetName()))
				{
					if(t2.getType() == OPType.Row)
					{
					    if(t1.getType() == OPType.UnnameRange)
					    {
		                   int startRowIndex2 = t2.getStartRowIndex();
		                   int endRowIndex2 = t2.getEndRowIndex();
		                   endRowIndex2 = (endRowIndex2 < startRowIndex2) ? startRowIndex2 : endRowIndex2;
		                   if(Math.abs(endRowIndex2+startRowIndex2-endRowIndex1-startRowIndex1)<=(endRowIndex1-startRowIndex1+endRowIndex2-startRowIndex2))
		                      return TransformResult.SPLIT;   
					    }  
					}
					else if(t2.getType() == OPType.Column)
					{
					  if(t1.getType() == OPType.UnnameRange || t1.getType() == OPType.Column)
					  {
	                       int startColIndex2 = t2.getStartColIndex();
	                       int endColIndex2 = t2.getEndColIndex();
	                       endColIndex2 = (endColIndex2 < startColIndex2) ? startColIndex2 : endColIndex2;
	                       if(Math.abs(endColIndex2+startColIndex2-endColIndex1-startColIndex1)<=(endColIndex1-startColIndex1+endColIndex2-startColIndex2))
	                          return TransformResult.SPLIT;
					  }  
					}
				}
			}
		}
		return TransformResult.ACCEPT;
	}	
}