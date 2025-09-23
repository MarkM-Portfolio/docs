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
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class SetColumnsMsg extends RangeMsg
{

  private static final Logger LOG = Logger.getLogger(RangeMsg.class.getName());


  private String[] rowIds = null;

  public SetColumnsMsg(JSONObject jsonEvent, IDManager idm)
  {
    super(jsonEvent, idm);
    this._bColumn = true;
    JSONObject jsonData = (JSONObject) jsonEvent.get(ConversionConstant.DATA);
    if(null == jsonData.get(ConversionConstant.ROWS) && null == jsonData.get(ConversionConstant.COLUMNS) )
    {
    	this._type = "style";
    }	
//    if (jsonData.get(ConversionConstant.STYLE_A) != null)
//    {
//      this._type = "style";
//    }
//    else
//    {
//      JSONObject rows = (JSONObject)jsonData.get(ConversionConstant.ROWS);
//      if(null != rows)
//        this.initRowsId(rows, idm);
//    }  
  }
  

  public void transformRefByIndex(IDManager idm,boolean bCreate) 
  {
    refTokenId.updateId(idm);
    JSONObject jsonData = (JSONObject) data.get(ConversionConstant.DATA);
    if(null != jsonData)
    {
      JSONObject rows = (JSONObject)jsonData.get(ConversionConstant.ROWS);
      if(null != rows)
        this.initRowsId(rows, idm);
    }  
  }
  
  public boolean transformDataById(IDManager idm)
  {
    super.transformDataById(idm);
    if(null != tranformedRangeData)
      tranformedRangeData = this.getRowsMap(idm);
    return true;
  }
  
  private void initRowsId(JSONObject rowsData,IDManager idm)
  {
    int maxRowIndex = 0;
    Iterator iter = rowsData.entrySet().iterator();
    while(iter.hasNext())
    {
      Map.Entry entry = (Map.Entry)iter.next();
      int srIndex = Integer.parseInt(entry.getKey().toString());
      JSONObject row = (JSONObject)entry.getValue();
      int repNum = 0;
      Object o = row.get(ConversionConstant.REPEATEDNUM_A);
      if(null != o)
        repNum = Integer.parseInt(o.toString());
      int erIndex = srIndex + repNum;
      if(erIndex > maxRowIndex)
        maxRowIndex = erIndex;
    }  
    String sheetId = refTokenId.getSheetId();
    this.rowIds = new String[maxRowIndex];
    for(int i = 1; i <= maxRowIndex; i++)
    {
      this.rowIds[i-1] = idm.getRowIdByIndex(sheetId, i-1, true);
    }  
  }
  
  public JSONArray getEvents(IDManager idm)
  {
    //transform message from id to index with the latest version of temporary IDManager 
    splitedCols(idm);
    return events;
  }
  
  private JSONObject getRowsMap(IDManager idm)
  {
    JSONArray rowRanges = _getRangesIndex(this.rowIds,"row",idm);
    JSONObject rowsMap = new JSONObject();
    
    for(int i = 0; i < rowRanges.size(); i++)
    {
        JSONObject rowRange = (JSONObject)rowRanges.get(i);
        int srIndex = (Integer)rowRange.get("startRow");
        int erIndex = (Integer)rowRange.get("endRow");

        //if type is style, does not need to get row json
        if(_type == null || !(_type.equals("style")))
        {
            int rIndex = srIndex;
            while(rIndex <= erIndex)
            {
                JSONObject row = getRowJsonByIndex(rIndex,tranformedRangeData,idm);
                if(row != null)
                {
                    int rowRepNum = 0;
                    Object rowrepeat = row.get(ConversionConstant.REPEATEDNUM_A);
                    if(rowrepeat != null)
                        rowRepNum = Integer.valueOf(rowrepeat.toString());
                    int rowERIndex = rIndex + rowRepNum;
                    int curERIndex = (rowERIndex <= erIndex)?rowERIndex:erIndex;
                    int curRpeNum = curERIndex - rIndex;
                    row.put(ConversionConstant.REPEATEDNUM_A, curRpeNum);
                    rowsMap.put(Integer.toString(rIndex), row);
                    rIndex = curERIndex + 1;
                }else
                    rIndex++;
            }
        }
    }
    return rowsMap;
  }
  private void splitedCols(IDManager idm)
  {
    String sheetId = refTokenId.getSheetId();
    String sheetName = idm.getSheetNameById(sheetId);

    Map rowsMap = tranformedRangeData;
    JSONArray colRanges = _getRangesIndex("col", idm);

    JSONArray colsMetaArray = this.getColsMetaArray(colRanges, colsMetaData, idm);
    for (int j = 0; j < colRanges.size(); j++)
    {
      JSONObject colRange = (JSONObject) colRanges.get(j);
      int scIndex = (Integer) colRange.get("startCol");
      int ecIndex = (Integer) colRange.get("endCol");

      JSONObject event;
      try
      {
        event = JSONObject.parse(data.toString());

        String sc = ReferenceParser.translateCol(scIndex);
        String ec = sc;
        if (ecIndex > scIndex)
          ec = ReferenceParser.translateCol(ecIndex);

        JSONObject reference = (JSONObject) event.get(ConversionConstant.REFERENCE);
        String value = ReferenceParser.getAddressByIndex(sheetName, -1, sc, null, -1, ec, ConversionConstant.COL_REFERENCE);
        reference.put(ConversionConstant.REF_VALUE, value);

        // construct event that only contains the cell from start col to end col, start row to end row
        if (_type == null || !(_type.equals("style")))
        {
          JSONObject cells = getCellsJsonByIndex(scIndex, ecIndex, rowsMap);
          JSONObject o = (JSONObject) event.get(ConversionConstant.DATA);
          if (_bColumn)
          {
            o.put(ConversionConstant.COLUMNS, (JSONObject) colsMetaArray.get(j));
          }
          if(null != cells)
        	  o.put(ConversionConstant.ROWS, cells);
        }
        // else if type == STYLE, set the style for split range
        events.add(event);
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "error when set columns to json", e);
      }
    }
  }
}