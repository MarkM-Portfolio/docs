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

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.json.java.JSONObject;

public class SetRowMsg extends Message {
	private Map<TokenId, Object> rowDataByID = null;
	private JSONObject tranformedRowData = null;
	
	public SetRowMsg(JSONObject jsonEvent, IDManager idm) {
		super(jsonEvent, idm);
	}
	
	/***
	 * Transform the range data from index to id using the given id manager
	 */
	public void transformDataByIndex(IDManager idm) {
		JSONObject o = (JSONObject) data.get(ConversionConstant.DATA);
		Object orows = o.get("rows");
		JSONObject rangeData = (JSONObject) orows;

		if (rangeData == null || rangeData.size() == 0)
			return;

		rowDataByID = new HashMap<TokenId, Object>();
		Iterator rowItor = rangeData.entrySet().iterator();
		while (rowItor.hasNext()) {
			java.util.Map.Entry entry = (java.util.Map.Entry) rowItor.next();
			int rowIndex = Integer.valueOf((String) entry.getKey());
			JSONObject rowJson = (JSONObject) entry.getValue();

			// fillRowUseId(rangeDataUseID,entry,idm);
			String sheetName = refTokenId.getToken().getSheetName();
			RangeDataUtil.fillRowsUseId(rowDataByID, sheetName, rowIndex,
					rowJson, idm);
		}
	}
	
    public boolean transformDataById(IDManager idm)
    {
      if (rowDataByID == null || rowDataByID.isEmpty())
      {
        return true;
      }
  
      tranformedRowData = new JSONObject();
      Iterator rowItor = rowDataByID.entrySet().iterator();
      while (rowItor.hasNext())
      {
        java.util.Map.Entry entry = (java.util.Map.Entry) rowItor.next();
        TokenId tokenid = (TokenId) entry.getKey();
        Map<String, Object> rowDataUseId = (Map<String, Object>) entry.getValue();
  
        RangeDataUtil.fillRowsUseIndex(tranformedRowData, tokenid, rowDataUseId, idm);
      }
  
      return true;
    }
	
    public void setData() {
		JSONObject jsonEvent = data;
		if (tranformedRowData != null && tranformedRowData.size() > 0) {
			JSONObject o = (JSONObject) jsonEvent.get(ConversionConstant.DATA);
			o.put("rows", tranformedRowData);
		}
	}
}