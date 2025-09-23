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

import java.util.Iterator;
import java.util.NoSuchElementException;

import com.ibm.concord.spreadsheet.common.utils.CommonUtils;
import com.ibm.concord.spreadsheet.common.utils.FormulaPrioritizer;
import com.ibm.json.java.JSONArray;

/**
 * Iterates a range in a sheet, flats and returns all address in the form of String[]{ rowId, colId }.
 */
public class RowColumnIdIterator implements Iterator<String[]>
{
  private int endRowIndex, startColIndex, endColIndex;

  private int rowIndex, colIndex;

  private JSONArray rowIdArray, colIdArray;

  public RowColumnIdIterator(RowColIdIndexMeta rowColIdIndexMeta, String sheetId, int startRowIndex, int endRowIndex, int startColIndex,
      int endColIndex)
  {
    this.endRowIndex = endRowIndex;
    this.startColIndex = startColIndex;
    this.endColIndex = endColIndex;

    rowIdArray = rowColIdIndexMeta.rowsIdArrayMap.get(sheetId);
    colIdArray = rowColIdIndexMeta.colsIdArrayMap.get(sheetId);
    if (rowIdArray == null) rowIdArray = new JSONArray();
    if (colIdArray == null) colIdArray = new JSONArray();
    if (endRowIndex >= rowIdArray.size())
    {
      this.endRowIndex = rowIdArray.size();
    }
    if (endColIndex >= colIdArray.size())
    {
      this.endColIndex = colIdArray.size();
    }

    rowIndex = startRowIndex;
    colIndex = startColIndex - 1;

    locateNextId();
  }
  public int getColIndex() 
  {
    return this.colIndex;
  }
  public int getRowIndex() 
  {
    return this.rowIndex;
  }
  public boolean hasNext()
  {
    return rowIndex <= endRowIndex && colIndex <= endColIndex;
  }

  public String[] next()
  {
    if (rowIndex > endRowIndex || colIndex > endColIndex)
    {
      throw new NoSuchElementException();
    }

    String _rowId = (String) rowIdArray.get(rowIndex - 1);
    String _colId = (String) colIdArray.get(colIndex - 1);
    String[] result = new String[] { _rowId, _colId };
    locateNextId();
    return result;
  }

  /*
   * after calling this method, (rowIndex, colIndex) points to a non-null id in meta.
   */
  private void locateNextId()
  {
    String _rowId = null, _colId = null;
    colIndex++;
    if (colIndex > endColIndex)
    {
      rowIndex++;
      colIndex = startColIndex;
    }

    // loop until find rowId and colId, or search exceeds boundary
    while (!(CommonUtils.hasValue(_rowId) && CommonUtils.hasValue(_colId)) && hasNext())
    {
      
      _rowId = (String) rowIdArray.get(rowIndex - 1);
      if (!CommonUtils.hasValue(_rowId))
      {
        // row id null, step row
        rowIndex++;
        colIndex = startColIndex;
        continue;
      }
      _colId = (String) colIdArray.get(colIndex - 1);
      if (!CommonUtils.hasValue(_colId))
      {
        colIndex++;
        if (colIndex > endColIndex)
        {
          rowIndex++;
          colIndex = startColIndex;
        }
      }
    }
  }

  public void remove()
  {
    throw new UnsupportedOperationException();
  }
}
