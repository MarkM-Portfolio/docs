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
import java.util.Map.Entry;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.json.java.JSONObject;

public class InsertColumnMsg extends Message
{
  private Map<TokenId, Object> rowsDataById;

  private JSONObject rowsDataByIndex = null;

  private JSONObject meta = null;
  
  private JSONObject colsMeta = null;
  
  private JSONObject transformedColsMeta = null;
  
  private JSONObject transformedMeta = null;

  String sheetName;

  private int colCount = -1;

  private int oldStartColIndex = -1;

  private int newStartColIndex = -1;

  public InsertColumnMsg(JSONObject jsonEvent, IDManager idm)
  {
    super(jsonEvent, idm);

    colCount = refTokenId.getToken().getCount(OPType.Column);
    oldStartColIndex = refTokenId.getToken().getStartColIndex();
    newStartColIndex = oldStartColIndex;
    sheetName = refTokenId.getToken().getSheetName();
  }

  /*
   * Disable the mechanism of transforming between ID and index, because 'insert column' message is always valid (non-Javadoc)
   * 
   * @see com.ibm.concord.spreadsheet.document.message.Message#transformRefById(com.ibm.concord.spreadsheet.document.message.IDManager)
   */
  public boolean transformRefById(IDManager idm)
  {
    if(refTokenId.updateToken(idm)){
	    int index = idm.getSheetIndexById(refTokenId.getSheetId());
	    if (index == -1)
	      return false;
	
	    return true;
    }
    return false;
  }

  /*
   * The implementation of traditional OT algorithm that compare (non-Javadoc)
   * 
   * @see com.ibm.concord.spreadsheet.document.message.Message#updateIndex(com.ibm.concord.spreadsheet.document.message.Message)
   */
  public void updateIndex(Message msg)
  {
    if (msg.type != OPType.Column)
      return;

    if(!this.refTokenId.getSheetId().equals(msg.refTokenId.getSheetId()))
      return;
    
    Token token = msg.refTokenId.getToken();
    int stIndex = token.getStartColIndex();

    if (msg.action == Action.Insert)
    {
      if (stIndex <= newStartColIndex)
      {
        int cnt = token.getCount(OPType.Column);
        newStartColIndex = newStartColIndex + cnt;
      }
    }
    else if (msg.action == Action.Delete)
    {
      if (stIndex <= newStartColIndex)
      {
        int delta = newStartColIndex - stIndex;
        int cnt = token.getCount(OPType.Column);
        if (delta < cnt)
          newStartColIndex = stIndex;
        else
          newStartColIndex = newStartColIndex - cnt;
      }
    }
  }

  public String setRefValue(IDManager idm)
  {
    Token token = refTokenId.getToken();
    String sheetName = token.getSheetName();
    sheetName = ReferenceParser.formatSheetName(sheetName);
    String refValue = sheetName + "!" + ReferenceParser.translateCol(newStartColIndex + 1);
//    if (colCount > 1)
      refValue += ":" + ReferenceParser.translateCol(newStartColIndex + colCount);

    return refValue;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.spreadsheet.document.message.Message#updateIDManager( com.ibm.concord.spreadsheet.document.message.IDManager,
   * boolean)
   */
  public boolean updateIDManager(IDManager idm, boolean reverse)
  {
    boolean success = true;

    String sheetId = refTokenId.getSheetId();
    Token token = refTokenId.getToken();
    int index = token.getIndex(this.type);
    int count = token.getCount(type);

    if (!reverse)
      idm.insertColAtIndex(sheetId, index, count);
    else
      idm.deleteColAtIndex(sheetId, index, count);

    return success;
  }

  public void transformDataByIndex(IDManager idm)
  {
    JSONObject o = (JSONObject) data.get(ConversionConstant.DATA);
    meta = (JSONObject) o.get(ConversionConstant.META);
    HashMap colIndex2IdMap = new HashMap();
    if(null != meta)
    {
      Iterator<Map.Entry<String, Object>> metaIter = meta.entrySet().iterator();
      while(metaIter.hasNext())
      {
        Map.Entry<String, Object> entry = metaIter.next();
        Integer value = Integer.parseInt( entry.getValue().toString());
        String colIndex = ReferenceParser.translateCol(value);
        colIndex2IdMap.put(colIndex, entry.getKey());
        entry.setValue(value - this.newStartColIndex);
      }  
    }  
    JSONObject cols = (JSONObject) o.get(ConversionConstant.COLUMNS);
    if(null != cols)
    {
      colsMeta = new JSONObject();
      Iterator<Map.Entry<String, JSONObject>> colIter = cols.entrySet().iterator();
      while(colIter.hasNext())
      {
        Map.Entry<String, JSONObject> colEntry = colIter.next();
        String colIndex = colEntry.getKey();
        String colId = (String)colIndex2IdMap.get(colIndex);
        if(null != colId)
          colsMeta.put(colId, colEntry.getValue());
      }
    }
    JSONObject rangeData = (JSONObject) o.get(ConversionConstant.ROWS);
    if (rangeData == null || rangeData.size() == 0)
      return;

    Iterator<Map.Entry<String, JSONObject>> rowsIter = rangeData.entrySet().iterator();
    rowsDataById = new HashMap<Message.TokenId, Object>();

    while (rowsIter.hasNext())
    {
      Map.Entry<String, JSONObject> rowEntry = rowsIter.next();
      int rowIndex = Integer.parseInt(rowEntry.getKey());
      JSONObject rowData = rowEntry.getValue();
      Object rowrepeat = rowData.get(ConversionConstant.REPEATEDNUM_A);
      int repeatedNum = (rowrepeat == null) ? 0 : Integer.valueOf(rowrepeat.toString());
      int endRowIndex = rowIndex + repeatedNum;
      String refvalue = sheetName + "!" + rowIndex + ":" + endRowIndex;
      // create a token to track the change of the row range
      Token token = new Token(refvalue, null, OPType.Row);
      TokenId tokenId = new TokenId(token, idm);
      JSONObject row = new JSONObject();
      JSONObject cellsData = (JSONObject) rowData.get(ConversionConstant.CELLS);
      if(null != cellsData)
      {
        Iterator cellsItor = cellsData.entrySet().iterator();
        JSONObject cells = new JSONObject();
        while(cellsItor.hasNext())
        {
          Map.Entry<String, JSONObject> cellEntry = ( Map.Entry<String, JSONObject>)cellsItor.next();
          String colIdnex = cellEntry.getKey();
          String colId = (String)colIndex2IdMap.get(colIdnex);
          if(null != colId)
          {
            cells.put(colId, cellEntry.getValue());
          }
        }  
        row.put(ConversionConstant.CELLS, cells);
      }  
      rowsDataById.put(tokenId, row);
    }
  }

  @SuppressWarnings("unchecked")
  public boolean transformDataById(IDManager idm)
  {
    HashMap colId2IndexMap = new HashMap();
    if (meta != null && !meta.isEmpty()) 
    {
      transformedMeta = new JSONObject();
      Iterator<Map.Entry<String, Number>> metaIter = meta.entrySet().iterator();
      while (metaIter.hasNext())
      {
        Map.Entry<String, Number> metaEntry = metaIter.next();
        int value = metaEntry.getValue().intValue();
        int newValue = newStartColIndex + value;
        transformedMeta.put(metaEntry.getKey(), newValue);
        String strCol = ReferenceParser.translateCol(newValue);
        colId2IndexMap.put(metaEntry.getKey(),strCol);
      }    
    }
    if(colsMeta != null && !colsMeta.isEmpty())
    {
      transformedColsMeta = new JSONObject();
      Iterator<Map.Entry<String, JSONObject>> colIter = colsMeta.entrySet().iterator();
      while(colIter.hasNext())
      {
        Map.Entry<String, JSONObject> colEntry = colIter.next();
        String colId = colEntry.getKey();
        String colIndex = (String) colId2IndexMap.get(colId);
        if(null != colIndex)
          transformedColsMeta.put(colIndex, colEntry.getValue());
      }
    }
    if (rowsDataById == null || rowsDataById.isEmpty())
    {
      return true;
    }
    rowsDataByIndex = new JSONObject();
    Iterator<Entry<TokenId, Object>> rowsIter = rowsDataById.entrySet().iterator();
    while (rowsIter.hasNext())
    {
      Map.Entry<TokenId, Object> rowEntry = rowsIter.next();
      TokenId tokenid = rowEntry.getKey();
      Map<String, Object> rowDataUseId = (Map<String, Object>) rowEntry.getValue();

      tokenid.updateToken(idm);
      Token token = tokenid.getToken();
      int rowIndex = token.getStartRowIndex();
      int endRowIndex = token.getEndRowIndex();
      if (rowIndex == -1) {
        // row is deleted
        continue;
      }

      JSONObject rowJson = new JSONObject();
      rowsDataByIndex.put(String.valueOf(rowIndex + 1), rowJson);
      int repeatedNum = endRowIndex - rowIndex;
      if (repeatedNum > 0)
      {
        rowJson.put(ConversionConstant.REPEATEDNUM_A, repeatedNum);
      }

      Map<String, Object> cellsUseId = (Map<String, Object>) rowDataUseId.get(ConversionConstant.CELLS);
      if (cellsUseId == null) {
        continue;
      }

      JSONObject cellsJson = new JSONObject();
      rowJson.put(ConversionConstant.CELLS, cellsJson);

      Iterator cellsItor = cellsUseId.entrySet().iterator();
      while (cellsItor.hasNext())
      {
        Map.Entry<String, JSONObject> cellEntry = (Map.Entry<String, JSONObject>) cellsItor.next();
        String colId =  cellEntry.getKey();
        String colIndex = (String)colId2IndexMap.get(colId);
        cellsJson.put(colIndex, cellEntry.getValue());
      }
    }

    return true;
  }

  public void setData() {
    JSONObject jsonEvent = data;
    JSONObject o = (JSONObject) jsonEvent.get(ConversionConstant.DATA);
    if (rowsDataByIndex != null && rowsDataByIndex.size() > 0)
    {
      o.put(ConversionConstant.ROWS, rowsDataByIndex);
    }
    if (transformedMeta != null && transformedMeta.size() > 0) {
      o.put(ConversionConstant.META, transformedMeta);
    }
    if( transformedColsMeta != null && transformedColsMeta.size() > 0)
    {
      o.put(ConversionConstant.COLUMNS, transformedColsMeta);
    }
  }
}