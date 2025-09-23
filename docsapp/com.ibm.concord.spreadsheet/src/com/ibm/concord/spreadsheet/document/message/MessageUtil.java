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
import java.util.List;
import java.util.regex.Pattern;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.message.Message.OPType;
import com.ibm.concord.spreadsheet.document.message.Message.Token;
import com.ibm.concord.spreadsheet.document.message.Message.TokenId;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class MessageUtil {
	
	private static final String FORMULAREGEX = "(^=.+)|(^\\{=.+\\}$)";
	private static final Pattern pattern = Pattern.compile(FORMULAREGEX);
	
	public static boolean isIntersection(Token t1, Token t2) {
		String shtName1 = t1.getSheetName();
		String shtName2 = t2.getSheetName();
		if(!shtName1.equals(shtName2))
			return false;
		
		int startRowIndex1 = t1.getStartRowIndex();
		int endRowIndex1 = t1.getEndRowIndex();
		if(t1.getType() == OPType.Column)
		{
			startRowIndex1 = 1;
			endRowIndex1 = ConversionConstant.MAX_ROW_NUM;
		}else
			endRowIndex1 = (endRowIndex1 < startRowIndex1) ? startRowIndex1 : endRowIndex1;
		int startColIndex1 = t1.getStartColIndex();
		int endColIndex1 = t1.getEndColIndex();
		if(t1.getType() == OPType.Row)
		{
			startColIndex1 = 1;
			endColIndex1 = ConversionConstant.MAX_COL_NUM;
		}else
			endColIndex1 = (endColIndex1 < startColIndex1) ? startColIndex1 : endColIndex1;		

		int startRowIndex2 = t2.getStartRowIndex();
		int endRowIndex2 = t2.getEndRowIndex();
		if(t2.getType() == OPType.Column)
		{
			startRowIndex2 = 1;
			endRowIndex2 = ConversionConstant.MAX_ROW_NUM;
		}else
			endRowIndex2 = (endRowIndex2 < startRowIndex2) ? startRowIndex2 : endRowIndex2;
		int startColIndex2 = t2.getStartColIndex();
		int endColIndex2 = t2.getEndColIndex();
		if(t2.getType() == OPType.Row)
		{
			startColIndex2 = 1;
			endColIndex2 = ConversionConstant.MAX_COL_NUM;
		}else
			endColIndex2 = (endColIndex2 < startColIndex2) ? startColIndex2 : endColIndex2;
        
        /**
         * Get the center point of rectangle and depend the distance of the two
         * points to judge the overlap.
         * | Col2end+Col2start-Col1end-Col1start | <= Col1end-Col1start + Col2end-Col2start
           | Row2end+Row2start-Row1end-Row1start | <=Row1end-Row1start + Row2end-Row2start
           
         */
	    if(Math.abs(endColIndex2+startColIndex2-endColIndex1-startColIndex1)<=(endColIndex1-startColIndex1+endColIndex2-startColIndex2)
	        &&Math.abs(endRowIndex2+startRowIndex2-endRowIndex1-startRowIndex1)<=(endRowIndex1-startRowIndex1+endRowIndex2-startRowIndex2))
	      return true;
	    return false;
	}

	public static boolean isMsgContainAction(JSONObject jsonMsg, String actionType) {
		JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
		for (int i = 0; i < events.size(); i++) {
			JSONObject event = (JSONObject) events.get(i);
			String action = (String) event.get(ConversionConstant.ACTION);
			if (action != null && action.compareToIgnoreCase(actionType) == 0)
				return true;
		}
		return false;
	}
	
	public static boolean isMsgContainRefType(JSONObject jsonMsg, String refType)
	{
		JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
		for (int i = 0; i < events.size(); i++) 
		{
			JSONObject event = (JSONObject) events.get(i);
			JSONObject reference = (JSONObject) event.get(ConversionConstant.REFERENCE);
			String type = (String) reference.get(ConversionConstant.REF_TYPE);
			if(type != null && type.compareToIgnoreCase(refType) == 0)
				return true;			
		}
		return false;
	}
	
	public static boolean isMsgContainUsage(JSONObject jsonMsg, String usageType)
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
						if (usage.equalsIgnoreCase(usageType)){
							return true;
						}
					}
				}
			}
		}
		return false;
	}
	
	public static ArrayList<String> getRef4Msg(JSONObject jsonMsg, String actionType, String refType, String usageType) {
		ArrayList<String> list = new ArrayList<String>();
		JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
		for (int i = 0; i < events.size(); i++) {
			JSONObject event = (JSONObject) events.get(i);
			String action = (String) event.get(ConversionConstant.ACTION);
			if (action != null && action.compareToIgnoreCase(actionType) == 0) {
				JSONObject reference = (JSONObject) event.get(ConversionConstant.REFERENCE);
				String type = reference.get(ConversionConstant.REF_TYPE).toString();
				if(type != null && type.compareToIgnoreCase(refType) == 0){
					JSONObject data = (JSONObject) event.get(ConversionConstant.DATA);
					if(data!=null) {
						String usage = (String) data.get(ConversionConstant.RANGE_USAGE);
						if(usage != null && usage.compareToIgnoreCase(usageType) == 0)
							list.add(reference.get(ConversionConstant.REF_VALUE).toString());
					}
				}
			}
		}
		return list;
	}

	public static ArrayList<String> getRef4Msg(JSONObject jsonMsg, String actionType) {
		ArrayList<String> list = new ArrayList<String>();
		JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
		for (int i = 0; i < events.size(); i++) {
			JSONObject event = (JSONObject) events.get(i);
			String action = (String) event.get(ConversionConstant.ACTION);
			if (action != null && action.compareToIgnoreCase(actionType) == 0) {
				JSONObject reference = (JSONObject) event.get(ConversionConstant.REFERENCE);
				list.add(reference.get(ConversionConstant.REF_VALUE).toString());
			}
		}
		return list;
	}
	
	public static ArrayList<String> getRef4Msg(JSONObject jsonMsg, String actionType, String refType) {
		ArrayList<String> list = new ArrayList<String>();
		JSONArray events = (JSONArray) jsonMsg.get(ConversionConstant.UPDATES);
		for (int i = 0; i < events.size(); i++) {
			JSONObject event = (JSONObject) events.get(i);
			String action = (String) event.get(ConversionConstant.ACTION);
			if (action != null && action.compareToIgnoreCase(actionType) == 0) {				
				JSONObject reference = (JSONObject) event.get(ConversionConstant.REFERENCE);
				String type = reference.get(ConversionConstant.REF_TYPE).toString();
				if(type != null && type.compareToIgnoreCase(refType) == 0)
					list.add(reference.get(ConversionConstant.REF_VALUE).toString());
			}
		}
		return list;
	}
	
	public static boolean isFormulaString(String v) {
	    if(null == v) return false;
		return pattern.matcher(v).matches();
	}
	
	public static String getAddr(List<String> addrs, List<TokenId> tokenIds, IDManager idm)
	{
		StringBuffer addr = new StringBuffer();
		int len = addrs.size();
		if(len > 1)
			addr.append("(");
		for(int k = 0; k < len; k++){
			TokenId tokenId = tokenIds.get(k);
			if(tokenId != null){
				tokenId.updateToken(idm);
				addr.append(tokenId.getToken().toString());				
			}else
				addr.append(addrs.get(k));
			if(k < len - 1)
				addr.append(",");
		}
		if(len > 1)
			addr.append(")");
		return addr.toString();
	}
}