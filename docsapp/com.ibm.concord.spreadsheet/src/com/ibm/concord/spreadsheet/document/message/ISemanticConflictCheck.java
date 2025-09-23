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

import com.ibm.concord.spi.document.services.IDocumentService.TransformResult;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public interface ISemanticConflictCheck {

	/*
	 * check if jsonMsg and baseJSONMsgList contain message need check Semantic Conflict
	 * return true : need check
	 * 		  false: does not need
	 */
	public boolean preCondition(JSONObject jsonMsg, JSONArray baseJSONMsgList);
	
	/*
	 * check if jsonMsg and baseJSONMsgList contain message has check Semantic Conflict
	 */
	public TransformResult conflictCheck(JSONObject jsonMsg, JSONArray baseJSONMsgList);
}
