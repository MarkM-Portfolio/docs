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

public class SetFilterConflictMsg implements ISemanticConflictCheck 
{
	private static final String ACTION_TYPE_INSERT = "insert";
	private static final String ACTION_TYPE_FILTER = "filter";
	
	private static boolean hasInsertFilter(JSONObject jsonMsg)
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
						if (usage.equalsIgnoreCase(ConversionConstant.USAGE_FILTER))
							return true;
					}
				}
			}
		}
		
		return false;
	}

	private boolean hasFilter(JSONObject jsonMsg) {
		// TODO Auto-generated method stub
		JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
		for (int i = 0; i < events.size(); i++) {
			JSONObject event = (JSONObject) events.get(i);
			String action = (String) event.get(ConversionConstant.ACTION);
			if (action != null && action.compareToIgnoreCase(ACTION_TYPE_FILTER) == 0) {
				return true;
			}
		}
		
		return false;
	}
	
	private boolean _preCondition(JSONObject jsonMsg){
		JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
		for (int i = 0; i < events.size(); i++) {
			JSONObject event = (JSONObject) events.get(i);
			String action = (String) event.get(ConversionConstant.ACTION);
			if (action != null) {
				if(action.compareToIgnoreCase(ACTION_TYPE_FILTER) == 0)
					return true;
				JSONObject data = (JSONObject) event.get(ConversionConstant.DATA);
				if(data!=null) {
					String usage = (String) data.get(ConversionConstant.RANGE_USAGE);
					if(usage!=null) {
						if (usage.equalsIgnoreCase(ConversionConstant.USAGE_FILTER))
							return true;
					}
				}
			}
		}
		
		return false;
	}
	
	public boolean preCondition(JSONObject jsonMsg, JSONArray baseJSONMsgList) 
	{
		if(!_preCondition(jsonMsg))
			return false;
		
		for(int i = 0 ; i < baseJSONMsgList.size(); i++)
		{
			JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
			if (!Transformer.isContentMessage(msg)) 
				continue;
			
			if(_preCondition(msg))// || hasDeleteRow(msg)) //set filter or delete row
				return true;
		}
		
		return false;
	}

	public TransformResult conflictCheck(JSONObject jsonMsg, JSONArray baseJSONMsgList)
	{
		ArrayList<String> refList1;
		if(hasInsertFilter(jsonMsg))
			refList1 = MessageUtil.getRef4Msg(jsonMsg,ACTION_TYPE_INSERT);
		else
			refList1 = MessageUtil.getRef4Msg(jsonMsg,ACTION_TYPE_FILTER);
		ArrayList<Token> tokenList1 = new ArrayList<Token>();
		for(int i = 0; i < refList1.size(); i++)
		{
			Token tk = new Message.Token(refList1.get(i), null, null);
			tokenList1.add(tk);
		}
		
		ArrayList<String> actions = new ArrayList<String>();
		actions.add(ACTION_TYPE_INSERT);
		actions.add(ACTION_TYPE_FILTER);
		
		for (int count = 0; count<actions.size(); count++){
			String action = actions.get(count);

			for(int i = 0; i < tokenList1.size(); i++)
			{
				for(int j = 0; j < baseJSONMsgList.size(); j++)
				{
					JSONObject msg = (JSONObject)baseJSONMsgList.get(j);
					if (!Transformer.isContentMessage(msg)) continue;				
					ArrayList<String> tmp = MessageUtil.getRef4Msg(msg, action);
					if (tmp.size() == 0) continue;
					
					if (action.equals(ACTION_TYPE_INSERT)){ //just for set filter
						if (!hasInsertFilter(msg)) continue;
					}else if(action.equals(ACTION_TYPE_FILTER)){//just for filter action
						if(!hasFilter(msg))
							continue;
					}
//					else if (action.equals(ACTION_TYPE_DELETE)){  //delete row
//						if (!hasDeleteRow(msg)) continue;
//					}
					
					Token tk = new Message.Token(tmp.get(0), null, null);
										
					Token t1 = (Token)tokenList1.get(i);
					Token t2 = tk;
					String sh1 = t1.getSheetName();
					String sh2 = t2.getSheetName();
					
					if(sh1.equals(sh2)){
						//if (action.equals(ACTION_TYPE_INSERT)){ // two filters insertion, ignore latter
							return TransformResult.IGNORE;
						//}
//						else if (action.equals(ACTION_TYPE_DELETE)){
//							/*prior is delete row, latter is set Instant filter
//							 * check if row range cover the row of instant filter, 
//							 * ignore latter if yes. 
//							 */
//							
//							int t1_startRow = t1.getStartRowIndex();
//							int t2_startRow = t2.getStartRowIndex();
//							int t2_endRow = t2.getEndRowIndex();
//							if ((t1_startRow >= t2_startRow) && (t1_startRow <= t2_endRow)){   
//								return TransformResult.IGNORE;
//							}
//						}
					}
				}
			}			
		}

		return TransformResult.ACCEPT;
	}
}