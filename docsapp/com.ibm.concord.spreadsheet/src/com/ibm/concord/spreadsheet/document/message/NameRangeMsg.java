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


import java.util.Iterator;
import java.util.Map;

import com.ibm.concord.spi.document.services.IDocumentService.TransformResult;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class NameRangeMsg implements ISemanticConflictCheck 
{
	private static final String USAGE_TYPE = "NAMES";
	private boolean isInsert = false;
	
	private boolean hasNames(JSONObject jsonMsg,JSONArray baseJSONMsgList)
	{
		isInsert = false;
		if(!MessageUtil.isMsgContainUsage(jsonMsg, USAGE_TYPE) && !isMsgContainSetRange(jsonMsg))
			return false;
		for(int i = 0 ; i < baseJSONMsgList.size(); i++)
		{
			JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
			if(MessageUtil.isMsgContainUsage(msg, USAGE_TYPE) && MessageUtil.isMsgContainAction(msg,ConversionConstant.ACTION_INSERT))
				return true;
			if(isInsert && MessageUtil.isMsgContainUsage(msg, USAGE_TYPE) && MessageUtil.isMsgContainAction(msg,ConversionConstant.ACTION_SET))
				return true;
		}		
		return false;
	}
	
	private boolean isMsgContainSetRange(JSONObject jsonMsg){
		JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
		for (int i = 0; i < events.size(); i++) {
			JSONObject event = (JSONObject) events.get(i);
			String action = (String) event.get(ConversionConstant.ACTION);
			if (action != null) {		
				JSONObject data = (JSONObject) event.get(ConversionConstant.DATA);
				if(data!=null) {
					JSONObject undoRanges = (JSONObject) data.get("undoRanges");
					if(undoRanges != null && !(undoRanges.isEmpty())){
						isInsert = true;
						return true;
					}
				}
			}
		}
		return false;
	}
	
	public boolean preCondition(JSONObject jsonMsg, JSONArray baseJSONMsgList) 
	{
		if(hasNames(jsonMsg,baseJSONMsgList))		
			return true;
		return false;
	}

	
	private boolean isBaseContainConflict(JSONArray baseJSONMsgList, String rangeid)
	{
		for(int i = 0 ; i < baseJSONMsgList.size(); i++)
		{
			JSONObject msg = (JSONObject)baseJSONMsgList.get(i);
			JSONArray events = (JSONArray) msg.get(ConversionConstant.UPDATES);
			for (int j = 0; j < events.size(); j++) {
				JSONObject event = (JSONObject) events.get(j);
				String action = (String) event.get(ConversionConstant.ACTION);
				if (action != null) {		
					JSONObject data = (JSONObject) event.get(ConversionConstant.DATA);
					if(data!=null) {
						String usage = (String) data.get(ConversionConstant.RANGE_USAGE);
						if(usage!=null) {
							if ((action.equalsIgnoreCase(ConversionConstant.ACTION_INSERT) ||
							    (isInsert && action.equalsIgnoreCase(ConversionConstant.ACTION_SET))) && usage.equalsIgnoreCase(ConversionConstant.USAGE_NAMES)){
								String rangeIdBase = (String) data.get("rangeid");
								if(rangeid.equalsIgnoreCase(rangeIdBase))
									return true;
							}
						}
					}
				}
			}
		}
		
		return false;
	}

	private TransformResult insertConflictCheck(JSONObject jsonMsg, JSONArray baseJSONMsgList)
	{
		JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
		for (int i = 0; i < events.size(); i++)
		{
			JSONObject event = (JSONObject) events.get(i);
			String action = (String) event.get(ConversionConstant.ACTION);
			if (action != null) {		
				JSONObject data = (JSONObject) event.get(ConversionConstant.DATA);
				if(data!=null) {
					JSONObject undoRanges = (JSONObject) data.get("undoRanges");
					if(null !=undoRanges){
						 Iterator<Map.Entry> iter = undoRanges.entrySet().iterator();
						  while (iter.hasNext())
							{
							  Map.Entry entry = iter.next();
							  String rangeId = entry.getKey().toString();
							  if(isBaseContainConflict(baseJSONMsgList,rangeId))
								  undoRanges.remove(rangeId);
							}
					}
				}
			}
		}		
		return TransformResult.ACCEPT;
	}
	
	private TransformResult namesConflictCheck(JSONObject jsonMsg, JSONArray baseJSONMsgList)
	{
		String rangeid = "";
		JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
		for (int i = 0; i < events.size(); i++)
		{
			JSONObject event = (JSONObject) events.get(i);
			String action = (String) event.get(ConversionConstant.ACTION);
			if (action != null) {		
				JSONObject data = (JSONObject) event.get(ConversionConstant.DATA);
				if(data!=null) {
					String usage = (String) data.get(ConversionConstant.RANGE_USAGE);
					if(usage!=null)
						rangeid = (String) data.get("rangeid");
				}
			}
		}
		if(isBaseContainConflict(baseJSONMsgList,rangeid))
			 return TransformResult.IGNORE;	
		return TransformResult.ACCEPT;
	}
	
	public TransformResult conflictCheck(JSONObject jsonMsg, JSONArray baseJSONMsgList)
	{
		if(isInsert)
			return insertConflictCheck(jsonMsg,baseJSONMsgList);
		else
			return namesConflictCheck(jsonMsg,baseJSONMsgList);
	}
}