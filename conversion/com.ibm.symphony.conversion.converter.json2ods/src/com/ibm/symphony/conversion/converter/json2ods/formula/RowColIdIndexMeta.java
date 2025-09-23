/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.formula;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.Set;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

/**
 * Class taken from server side.
 * 
 * 
 */
public class RowColIdIndexMeta
{
  private JSONObject sheetsArray = null;

  private HashMap<String, JSONArray> rowsIdArrayMap = null;

  private HashMap<String, JSONArray> colsIdArrayMap = null;

  public RowColIdIndexMeta(JSONObject sheetsArray)
  {
    this.sheetsArray = sheetsArray;
    rowsIdArrayMap = new HashMap<String, JSONArray>();
    colsIdArrayMap = new HashMap<String, JSONArray>();
    constractIdIndexMap();
  }

  private void constractIdIndexMap()
  {
    if (null == sheetsArray || sheetsArray.isEmpty())
      return;
    Set<Entry<String, JSONObject>> entries = sheetsArray.entrySet();
    Iterator<Entry<String, JSONObject>> iter = entries.iterator();
    while (iter.hasNext())
    {
      Entry<String, JSONObject> entry = iter.next();
      String sheetId = entry.getKey();
      JSONObject sheetArray = entry.getValue();
      JSONArray rowsIdArray = (JSONArray) sheetArray.get(ConversionConstant.ROWSIDARRAY);
      JSONArray colsIdArray = (JSONArray) sheetArray.get(ConversionConstant.COLUMNSIDARRAY);
      if (null != colsIdArray && !colsIdArray.isEmpty())
      {
        colsIdArrayMap.put(sheetId, colsIdArray);
      }
      if (null != rowsIdArray && !rowsIdArray.isEmpty())
      {
        rowsIdArrayMap.put(sheetId, rowsIdArray);
      }
    }

  }

  /*
   * rowIndex start from 1
   */
  public int getRowIndexById(String sheetId, String rowId)
  {
    int rowIndex = -1;
    if (null == sheetId || null == rowId || 0 == sheetId.length() || 0 == rowId.length())
    {
      return -1;
    }
    JSONArray rowsIdArray = rowsIdArrayMap.get(sheetId);
    if (null == rowsIdArray)
    {
      return -1;
    }
    rowIndex = rowsIdArray.indexOf(rowId);
    if (-1 == rowIndex)
    {
      return -1;
    }
    return rowIndex + 1;
  }

  /*
   * colIndex start from 1
   */
  public int getColIndexById(String sheetId, String colId)
  {
    int colInex = -1;
    if (null == sheetId || null == colId || 0 == sheetId.length() || 0 == colId.length())
    {
      return -1;
    }
    JSONArray colsIdArray = colsIdArrayMap.get(sheetId);
    if (null == colsIdArray)
    {
      return -1;
    }
    colInex = colsIdArray.indexOf(colId);
    if (-1 == colInex)
    {
      return -1;
    }
    return colInex + 1;
  }
}
