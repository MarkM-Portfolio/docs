/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload;

import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * Maintains partial meta.sheetsarray part. Records row ids and column ids
 */
public class PartialSheetsArray
{
  private static final Logger LOG = Logger.getLogger(PartialSheetsArray.class.getName());

  /*
   * if start index of rowsIdArray and columnsIdArray larger then THRESHOLD_INDEX,
   * then trim the array 
   */
  private static final int THRESHOLD_INDEX = 100;

  private JSONObject sheetsArrayObject;

  private JSONObject settingSheet;

  private JSONArray settingRowsIdArray, settingColumnsIdArray;

  private int settingStartRow, settingStartColumn;

  public PartialSheetsArray(JSONObject o)
  {
    sheetsArrayObject = o;
  }

  public JSONObject getSheetsArrayObject()
  {
    return sheetsArrayObject;
  }

  public JSONObject settingSheet(String sheetId)
  {
    settingSheet = (JSONObject) sheetsArrayObject.get(sheetId);
    if (settingSheet == null)
    {
      settingSheet = new JSONObject();
      sheetsArrayObject.put(sheetId, settingSheet);
    }

    settingRowsIdArray = null;
    settingColumnsIdArray = null;
    Object o = settingSheet.get(ConversionConstant.STARTROW);
    if (o != null)
    {
      settingStartRow = ((Number) o).intValue();
    }
    else
    {
      settingStartRow = 0;
    }
    o = settingSheet.get(ConversionConstant.STARTCOL);
    if (o != null)
    {
      settingStartColumn = ((Number) o).intValue();
    }
    else
    {
      settingStartColumn = 0;
    }

    return settingSheet;
  }

  /**
   * 
   * @param sheetId
   * @param index
   *          1-based
   * @return
   */
  public void setColumnId(int index, String id)
  {
    if (settingColumnsIdArray == null)
    {
      settingColumnsIdArray = (JSONArray) settingSheet.get(ConversionConstant.COLUMNSIDARRAY);
      if (settingColumnsIdArray == null)
      {
        settingColumnsIdArray = new JSONArray();
        settingSheet.put(ConversionConstant.COLUMNSIDARRAY, settingColumnsIdArray);
        settingSheet.put(ConversionConstant.STARTCOL, 1);
        settingStartColumn = 0;
      }
    }

    if (settingStartColumn == 0)
    {
      settingStartColumn = index;
      settingSheet.put(ConversionConstant.STARTCOL, settingStartColumn);
      ;
    }
    else
    {
      if (index < settingStartColumn)
      {
        settingStartColumn = index;
        settingSheet.put(ConversionConstant.STARTCOL, settingStartColumn);
      }
    }

    setIdToList(settingColumnsIdArray, index - 1, id);
  }

  /**
   * Set row id and update settingSheet.startrow. Make sure the first element in rowsIdArray is not "".
   * 
   * @param sheetId
   * @param index
   *          1-based
   * @return
   */
  public void setRowId(int index, String id)
  {
    if (settingRowsIdArray == null)
    {
      settingRowsIdArray = (JSONArray) settingSheet.get(ConversionConstant.ROWSIDARRAY);
      if (settingRowsIdArray == null)
      {
        settingRowsIdArray = new JSONArray();
        settingSheet.put(ConversionConstant.ROWSIDARRAY, settingRowsIdArray);
        settingSheet.put(ConversionConstant.STARTROW, 1);
        settingStartRow = 0;
      }
    }

    if (settingStartRow == 0)
    {
      settingStartRow = index;
      settingSheet.put(ConversionConstant.STARTROW, settingStartRow);
    }
    else
    {
      if (index < settingStartRow)
      {
        settingStartRow = index;
        settingSheet.put(ConversionConstant.STARTROW, settingStartRow);
      }
    }

    setIdToList(settingRowsIdArray, index - 1, id);
  }

  /**
   * called after everything in deseriaizer is done. optimizes rows id array.
   */
  public void flush()
  {
    // TODO this may harm performance. 1) updating STARTROW may need to lookup map many times. 2) optimize need to re-org whole row id array
    Set<Entry<String, JSONObject>> entrySet = sheetsArrayObject.entrySet();
    for (Iterator iterator = entrySet.iterator(); iterator.hasNext();)
    {
      Entry<String, JSONObject> entry = (Entry<String, JSONObject>) iterator.next();
      JSONObject sheetObject = entry.getValue();
      Object o = sheetObject.get(ConversionConstant.STARTROW);
      if (o != null)
      {
        int startRow = ((Number) o).intValue();
        if (startRow > THRESHOLD_INDEX)
        {
          JSONArray rowIdArray = (JSONArray) sheetObject.get(ConversionConstant.ROWSIDARRAY);
          // elements in id array before (startRow - 1) are all EMPTY STRING, remove them
          JSONArray newArray = new JSONArray();
          newArray.addAll(rowIdArray.subList(startRow - 1, rowIdArray.size()));
          sheetObject.put(ConversionConstant.ROWSIDARRAY, newArray);
        }
        else
        {
          // fix startRow to 1
          sheetObject.put(ConversionConstant.STARTROW, 1);
        }
      }
      o = sheetObject.get(ConversionConstant.STARTCOL);
      if (o != null)
      {
        int startColumn = ((Number) o).intValue();
        if (startColumn > THRESHOLD_INDEX)
        {
          JSONArray colIdArray = (JSONArray) sheetObject.get(ConversionConstant.COLUMNSIDARRAY);
          // elements in id array before (startCol - 1) are all EMPTY STRING, remove them
          JSONArray newArray = new JSONArray();
          newArray.addAll(colIdArray.subList(startColumn - 1, colIdArray.size()));
          sheetObject.put(ConversionConstant.COLUMNSIDARRAY, newArray);
        }
        else
        {
          // fix startRow to 1
          sheetObject.put(ConversionConstant.STARTCOL, 1);
        }
      }
    }
  }

  private static void setIdToList(List l, int i, String v)
  {
    if (i < 0)
    {
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.log(Level.FINER, "ignore id \"{0}\" since the index [{1}] <0.", new Object[] { v, i });
      }
      return;
    }

    if (i < l.size())
    {
      l.set(i, v);
    }
    else
    {
      // make size() to i + 1
      String[] fill = new String[i - l.size() + 1];
      Arrays.fill(fill, "");
      l.addAll(Arrays.asList(fill));
      l.set(i, v);
    }
  }
}
