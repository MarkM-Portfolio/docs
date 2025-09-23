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

public class SortMsg extends Message {
	private String[] sortRowId = null;
	private String[] invisibleRowsId = null;
	
	public SortMsg (JSONObject jsonEvent, IDManager idm) {
		super(jsonEvent, idm);
	}

	/*
	 * (non-Javadoc)
	 * @see com.ibm.concord.spreadsheet.document.message.Message#transformDataByIndex(com.ibm.concord.spreadsheet.document.message.IDManager)
	 */
	public void transformDataByIndex(IDManager idm) {
	    JSONObject sortData = (JSONObject) data.get(ConversionConstant.DATA);
	    JSONArray sortResults = (JSONArray) sortData.get(ConversionConstant.SORT_RESULTS);
	    JSONArray invisibleRows = (JSONArray) sortData.get("invisibleRows");
	    String sheetId = refTokenId.getSheetId();
	    Token token = refTokenId.getToken();	   
	    int startRow = token.getIndex(OPType.Row);
	    
	    sortRowId = new String[sortResults.size()];
	    for (int i = 0; i < sortResults.size(); ++i) 
	    {
	    	int index = startRow + Integer.parseInt(sortResults.get(i).toString());
	    	sortRowId[i] = idm.getRowIdByIndex(sheetId, index, true);
	    }
	    
	    if(invisibleRows!=null)
	    {
          invisibleRowsId = new String[invisibleRows.size()];
          for (int i = 0; i < invisibleRows.size(); ++i) 
          {
              int index = startRow + ((Number)invisibleRows.get(i)).intValue();
              invisibleRowsId[i] = idm.getRowIdByIndex(sheetId, index, true);
          }
	    }
	}
	
	/*
	 * (non-Javadoc)
	 * @see com.ibm.concord.spreadsheet.document.message.Message#transformDataById(com.ibm.concord.spreadsheet.document.message.IDManager)
	 */
	public boolean transformDataById(IDManager idm) {
		boolean success = true;
		
		String sheetId = refTokenId.getSheetId();
		if (sheetId == null) 
		  return false;
		Token token = refTokenId.getToken();	   
	    int startRow = token.getIndex(OPType.Row)+1;
		
	    JSONObject sortData = (JSONObject) data.get(ConversionConstant.DATA);
	    JSONArray sortResults = new JSONArray();
	    int size = token.getCount(OPType.Row);
	    for(int i=0;i<size;i++)
	    {
	    	String id = idm.getRowIdByIndex(sheetId, startRow+i-1, false);
	    	if(id==null || id.equals(""))
	    		sortResults.add(i);
	    	else
	    		sortResults.add(null);
	    }
	      
	    sortData.put(ConversionConstant.SORT_RESULTS, sortResults);
	    
	    if(invisibleRowsId!=null)
	    {
	      for (int i = 0; i < invisibleRowsId.length; ++i) 
          {
              int index = idm.getRowIndexById(sheetId, invisibleRowsId[i])+1;
              if(index>0 && index-startRow<size)
              {
                sortResults.set(index-startRow, index-startRow);
              }
          }
	    }
	    int n = 0;
	    for(int i = 0; i < sortRowId.length; ++i)
	    {
	        String rowId = sortRowId[i];
	        boolean isHideRow = false;
	        if(invisibleRowsId!=null)
	        {
	            for(int j=0;j<invisibleRowsId.length;j++)
	            {
	              if(rowId.equals(invisibleRowsId[j]))
	              {
	                isHideRow = true;
	                break;
	              }
	            }
	        }
	        if(isHideRow)
	        {
	          continue;
	        }
	        
	    	int index = idm.getRowIndexById(sheetId, rowId)+1;
	    	if (index == 0)
	    		continue;
	    	int delta = index - startRow;
	    	while(n<size && sortResults.get(n)!=null)
	    	  n++;
	    	if(n<size)
	    		sortResults.set(n, delta);
	    }
		return success;
	}
}
