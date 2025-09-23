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

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.document.message.Message.FormulaTokenId;
import com.ibm.concord.spreadsheet.document.message.Message.OPType;
import com.ibm.concord.spreadsheet.document.message.Message.Token;
import com.ibm.concord.spreadsheet.document.message.Message.TokenId;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.json.java.OrderedJSONObject;

public class InsertRowMsg extends Message {
	
	private ArrayList<Map<String, Object>> rowsDataByID = null;
	private OrderedJSONObject transformedRowData, transformedMeta;
	private JSONObject meta;
	
	private int rowCount = -1;
	private int oldStartRowIndex = -1;
	private int newStartRowIndex = -1;
	private ArrayList<Integer> rowIndexList;

	public InsertRowMsg(JSONObject jsonEvent, IDManager idm) {
		super(jsonEvent, idm);
	  
		rowCount = refTokenId.getToken().getCount(OPType.Row);
		oldStartRowIndex = refTokenId.getToken().getStartRowIndex();
		newStartRowIndex = oldStartRowIndex;
	}
	
	/*
	 * Disable the mechanism of transforming between ID and index,
	 * (non-Javadoc)
	 * @see com.ibm.concord.spreadsheet.document.message.Message#transformRefById(com.ibm.concord.spreadsheet.document.message.IDManager)
	 */
	public boolean transformRefById(IDManager idm) {
		refTokenId.updateToken(idm);
		int index = idm.getSheetIndexById(refTokenId.getSheetId());
		if(index==-1)
			return false;
		return true;
	}
	
	/*
	 * The implementation of traditional OT algorithm that compare
	 * (non-Javadoc)
	 * @see com.ibm.concord.spreadsheet.document.message.Message#updateIndex(com.ibm.concord.spreadsheet.document.message.Message)
	 */
	public void updateIndex(Message msg) 
	{
		if(msg.type != OPType.Row) 
			return;
		
		if(!this.refTokenId.getSheetId().equals(msg.refTokenId.getSheetId()))
		  return;
		
		Token token = msg.refTokenId.getToken();
		int stIndex = token.getStartRowIndex();

		if(msg.action == Action.Insert)
		{
			if(stIndex<=newStartRowIndex)
			{
				int cnt = token.getCount(OPType.Row);
				newStartRowIndex = newStartRowIndex + cnt;
			}
		}
		else if(msg.action == Action.Delete)
		{
			if(stIndex<=newStartRowIndex)
			{
				int delta = newStartRowIndex - stIndex;
				int cnt = token.getCount(OPType.Row);
				if(delta<cnt)
					newStartRowIndex = stIndex;
				else
					newStartRowIndex = newStartRowIndex - cnt;
			}
		}
	}
	
	public String setRefValue(IDManager idm) {
		Token token = refTokenId.getToken();
		String sheetName = token.getSheetName();
		sheetName = ReferenceParser.formatSheetName(sheetName);
		String refValue = sheetName + "!" + (newStartRowIndex+1);
//		if(rowCount>1)
		refValue += ":" + (newStartRowIndex + rowCount);

		return refValue;
	}
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.ibm.concord.spreadsheet.document.message.Message#updateIDManager(
	 * com.ibm.concord.spreadsheet.document.message.IDManager, boolean)
	 */
	public boolean updateIDManager(IDManager idm, boolean reverse) {
		boolean success = true;

		String sheetId = refTokenId.getSheetId();
		Token token = refTokenId.getToken();
		int index = token.getIndex(this.type);
		int count = token.getCount(type);

		if (!reverse)
			idm.insertRowAtIndex(sheetId, index, count);
		else
			idm.deleteRowAtIndex(sheetId, index, count);

		return success;
	}
	
	/***
	 * Transform the range data from index to id using the given id manager
	 * only transform the first row index in both refValue and "data" and keep row count intact during transform.
	 * for any following rows in "data", their transformed row index is the first transformed rowIndex + delta.
	 * the known limitation is that the transformed formula string would be incorrect in some cases when co-edit
	 * insert or delete rows that has overlap with this insert rows operation
	 */
	public void transformDataByIndex(IDManager idm) {
		JSONObject o = (JSONObject) data.get(ConversionConstant.DATA);
		JSONObject rangeData = (JSONObject) o.get(ConversionConstant.ROWS);
		meta = (JSONObject) o.get(ConversionConstant.META);
		
		if (rangeData == null || rangeData.size()==0)
			return;
		
		rowsDataByID = new ArrayList<Map<String, Object>>();
		rowIndexList = new ArrayList<Integer>();
		
		Iterator<Map.Entry<String, JSONObject>> iter = rangeData.entrySet().iterator();
		while (iter.hasNext())
        {
          Map.Entry<String, JSONObject> entry = iter.next();
          Integer rowIndex = Integer.valueOf(entry.getKey());
          // find a place in rowIndexList to keep the list ordered (increasing)
          boolean added = false;
          // later we add rowjson to the same position in rowsDataByID
          int position = rowIndexList.size() - 1;
          for (; position >= 0; position--)
          {
            int ri = rowIndexList.get(position);
            if (ri < rowIndex)
            {
              // add rowIndex right after position
              rowIndexList.add(position + 1, rowIndex);
              added = true;
              break;
            }
          }
          if (!added)
          {
            position = -1;
            rowIndexList.add(0, rowIndex);
          }
          JSONObject rowJson = (JSONObject) entry.getValue();
          JSONObject cellsJson = (JSONObject) rowJson.get(ConversionConstant.CELLS);
          // if cellsJson is null, no data need be transformed
          if (cellsJson == null)
            cellsJson = new JSONObject();
          String sheetName = refTokenId.getToken().getSheetName();
          Map<TokenId, Object> cellsById = new HashMap<TokenId, Object>();
    
          Iterator cellsItor = cellsJson.entrySet().iterator();
          while (cellsItor.hasNext())
          {
            java.util.Map.Entry cellsEntry = (java.util.Map.Entry) cellsItor.next();
            String colIndex = (String) cellsEntry.getKey();
            JSONObject cellJson = (JSONObject) cellsEntry.getValue();
    
            Object cellrepeat = cellJson.get(ConversionConstant.REPEATEDNUM_A);
            int cellRepeateNum = 0;
            if (cellrepeat != null)
              cellRepeateNum = Integer.valueOf(cellrepeat.toString());
    
            // get column index
            int startColIndex = ReferenceParser.translateCol(colIndex);
            int endColIndex = startColIndex + cellRepeateNum;
            String cellrefvalue = sheetName + "!" + colIndex + ":" + ReferenceParser.translateCol(endColIndex);
    
            // create a token to track the change of the column range
            Token celltoken = new Token(cellrefvalue, null, OPType.Column);
            TokenId celltokenId = new TokenId(celltoken, idm);
    
            Map<String, Object> cellDataUseId = new HashMap<String, Object>();
            Object value = cellJson.get(ConversionConstant.VALUE_A);
            if (value != null)
            {
              cellDataUseId.put(ConversionConstant.VALUE_A, value);
            }
    
            // keep all the properties into the map except repeatednum
            // and value
            Iterator cellItor = cellJson.entrySet().iterator();
            while (cellItor.hasNext())
            {
              java.util.Map.Entry cellEntry = (java.util.Map.Entry) cellItor.next();
              String key = (String) cellEntry.getKey();
              if (key.equals(ConversionConstant.REPEATEDNUM_A) || key.equals(ConversionConstant.VALUE_A))
                continue;
              cellDataUseId.put(key, cellEntry.getValue());
            }
    
            cellsById.put(celltokenId, cellDataUseId);
          }
          Map<String, Object> rowDataById = new HashMap<String, Object>();
          rowDataById.put(ConversionConstant.CELLS, cellsById);
    
          // if there still are the properties, such as style, width, keep them.
          Iterator rowJsonItor = rowJson.entrySet().iterator();
          while (rowJsonItor.hasNext())
          {
            java.util.Map.Entry colEntry = (java.util.Map.Entry) rowJsonItor.next();
            String key = (String) colEntry.getKey();
            if (key.equals(ConversionConstant.CELLS))
              continue;
            rowDataById.put(key, colEntry.getValue());
          }
          
          rowsDataByID.add(position + 1, rowDataById);
        }
	}

	public boolean transformDataById(IDManager idm) {
		if (rowsDataByID == null || rowsDataByID.size()==0)
			return true;
		
		transformedRowData = new OrderedJSONObject();
		//int newStartRowIndex = refTokenId.getToken().getStartRowIndex();
		int indexDelta = newStartRowIndex - oldStartRowIndex;
		
		for(int i= 0;i<rowsDataByID.size(); i++){
			Map<String, Object> rowmap = rowsDataByID.get(i);
			
			Map<TokenId, Object> cellsById = (Map<TokenId, Object>)rowmap.get(ConversionConstant.CELLS);
			Iterator cellsItor = cellsById.entrySet().iterator();
			
			JSONObject cellsJson = new JSONObject();
			while(cellsItor.hasNext()){
				java.util.Map.Entry entry = (java.util.Map.Entry) cellsItor.next();
				TokenId tokenid = (TokenId) entry.getKey();
				
				Map<String, Object> cellDataUseId = (Map<String, Object>) entry.getValue();
				
				JSONObject cellJson = new JSONObject();
				
				tokenid.updateToken(idm);
				Token token = tokenid.getToken();
				int colIndex = token.getStartColIndex();
				
				if (colIndex == -1)
					continue;
				
				int endColIndex = token.getEndColIndex();		
				
				int repeatedNum = endColIndex - colIndex;
				if (repeatedNum >= 0) {
					cellJson.put(ConversionConstant.REPEATEDNUM_A, repeatedNum);
				}
				
				Iterator cellItor = cellDataUseId.entrySet().iterator();
				while (cellItor.hasNext()) {
					java.util.Map.Entry cellEntry = (java.util.Map.Entry) cellItor.next();
					String key = (String) cellEntry.getKey();
					Object cellPro = cellEntry.getValue();
//					if (cellPro instanceof FormulaTokenId) {
//						FormulaTokenId formulaTokenId = (FormulaTokenId) cellPro;
//						formulaTokenId.updateToken(idm);
//						String cellvalue = formulaTokenId.getValue();
//						cellJson.put(ConversionConstant.VALUE, cellvalue);
//					} 
//					else 
					{
						cellJson.put(key, cellPro);
					}
				}
				
				String sColIndex = ReferenceParser.translateCol(colIndex + 1);
				cellsJson.put(sColIndex, cellJson);
			}
			JSONObject rowJson = new JSONObject();
			rowJson.put(ConversionConstant.CELLS, cellsJson);
			
			//if there still are the properties, such as style, width, keep them.
			Iterator rowItor = rowmap.entrySet().iterator();
			while (rowItor.hasNext()) {
				java.util.Map.Entry colEntry = (java.util.Map.Entry) rowItor.next();
				String key = (String) colEntry.getKey();
				if (key.equals(ConversionConstant.CELLS))
					continue;
				rowJson.put(key, colEntry.getValue());
			}			
			
			transformedRowData.put(String.valueOf(rowIndexList.get(i)+indexDelta), rowJson);
		}
		
		// write meta
		transformedMeta = new OrderedJSONObject();
		Iterator<Map.Entry<String, Number>> metaIter = meta.entrySet().iterator();
		while (metaIter.hasNext())
		{
		  Map.Entry<String, Number> metaEntry = metaIter.next();
		  int oldRowIndex = metaEntry.getValue().intValue();
		  transformedMeta.put(metaEntry.getKey(), oldRowIndex + indexDelta);
		}
			
		return true;
	}
	
	public void setData() {
		JSONObject jsonEvent = data;
		JSONObject o = (JSONObject) jsonEvent.get(ConversionConstant.DATA);
		if (transformedRowData != null && transformedRowData.size() > 0)
		{
			o.put(ConversionConstant.ROWS, transformedRowData);
		}
		if (transformedMeta != null && transformedMeta.size() > 0)
		{
		  o.put(ConversionConstant.META, transformedMeta);
		}
	}
}