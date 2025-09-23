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

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class FilterMsg extends Message {

	private String[] showRowIds = null;
	private String[] hideRowIds = null;
	private String colId = null;
	
	public FilterMsg(JSONObject jsonEvent, IDManager idm) {
		super(jsonEvent, idm);
	}
	
	/***
	 * Transform the range data from index to id using the given id manager
	 */
	public void transformDataByIndex(IDManager idm) {
		JSONObject o = (JSONObject) data.get(ConversionConstant.DATA);
	    String sheetId = refTokenId.getSheetId();
	    JSONArray showIndexes = (JSONArray) o.get(ConversionConstant.ROWS_SHOW);
        if(showIndexes!=null)
        {
          showRowIds = new String[showIndexes.size()];
          for (int i = 0; i < showRowIds.length; i++) 
          {
            int index = ((Number)showIndexes.get(i)).intValue();
            showRowIds[i] = idm.getRowIdByIndex(sheetId, index-1, true);
          }
        }
        JSONArray hideIndexes = (JSONArray) o.get(ConversionConstant.ROWS_HIDDEN);
        if(hideIndexes!=null)
        {
          hideRowIds = new String[hideIndexes.size()];
          for (int i = 0; i < hideRowIds.length; i++) 
          {
            int index = ((Number)hideIndexes.get(i)).intValue();
            hideRowIds[i] = idm.getRowIdByIndex(sheetId, index-1, true);
          }
        }
        Long colindex = (Long)o.get(ConversionConstant.COLINDEX);
	    if (colindex != null && colindex>0)
	      colId = idm.getColIdByIndex(sheetId, colindex.intValue()-1, true);
	}

	public boolean transformDataById(IDManager idm) {
		boolean success = true;
		
		String sheetId = refTokenId.getSheetId();
        if (sheetId == null) 
          return false;
        
        JSONObject o = (JSONObject) data.get(ConversionConstant.DATA);
        if(colId!=null)
        {
          int colindex = idm.getColIndexById(sheetId, colId);
          if(colindex<0)
            return false;
          o.put(ConversionConstant.COLINDEX, colindex+1);
        }
        
        if(showRowIds!=null)
        {
          o.remove(ConversionConstant.ROWS_SHOW);
          JSONArray rows = new JSONArray();
          for (int i = 0; i < showRowIds.length; i++) 
          {
            int index = idm.getRowIndexById(sheetId, showRowIds[i]);
            if (index == -1)
              continue;
            rows.add(index+1);
          }
          if(rows.size()>0)
            o.put(ConversionConstant.ROWS_SHOW, rows);
        }
        
        if(hideRowIds!=null)
        {
          o.remove(ConversionConstant.ROWS_HIDDEN);
          JSONArray rows = new JSONArray();
          for (int i = 0; i < hideRowIds.length; i++) 
          {
            int index = idm.getRowIndexById(sheetId, hideRowIds[i]);
            if (index == -1)
              continue;
            rows.add(index+1);
          }
          if(rows.size()>0)
            o.put(ConversionConstant.ROWS_HIDDEN, rows);
        }
	   
		return success;
	}
}