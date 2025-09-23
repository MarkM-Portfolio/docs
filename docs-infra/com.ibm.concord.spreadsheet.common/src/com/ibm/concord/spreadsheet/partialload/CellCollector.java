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

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

public class CellCollector
{
  // marker indicates loading all sheet content
  private static final Logger LOG = Logger.getLogger(CellCollector.class.getName());

  private static final Object ALL = new Object();

  private Map<String, Object> sheetMap;

  private Set<String> lookingRow;

  private Map<String, Set<String>> lookingSheet, collectingSheet;

  public CellCollector()
  {
    sheetMap = new HashMap<String, Object>();
  }

  public void collectSheet(String sheetId)
  {
    Object o = sheetMap.get(sheetId);
    if (o != null && o instanceof Map)
    {
      // TODO may need to deep clean the map
      ((Map) o).clear();
    }
    sheetMap.put(sheetId, ALL);
  }

  public void collectingSheet(String sheetId)
  {
    collectingSheet = (Map<String, Set<String>>) sheetMap.get(sheetId);
    if (collectingSheet == null)
    {
      collectingSheet = new HashMap<String, Set<String>>();
      sheetMap.put(sheetId, collectingSheet);
    }
  }

  public void collectCell(String sheetId, String rowId, String columnId)
  {
    Object o = sheetMap.get(sheetId);
    if (o == ALL)
    {
      // no need to add
      LOG.finer("cell no need to collect since the sheet is collected.");
      return;
    }

    Map<String, Set<String>> rowMap = (Map<String, Set<String>>) o;
    if (rowMap == null)
    {
      rowMap = new HashMap<String, Set<String>>();
      sheetMap.put(sheetId, rowMap);
    }
    Set<String> columnSet = rowMap.get(rowId);
    if (columnSet == null)
    {
      columnSet = new HashSet<String>();
      rowMap.put(rowId, columnSet);
    }
    columnSet.add(columnId);
  }

  public void collectCell(String rowId, String columnId)
  {
    if (collectingSheet != null)
    {
      Set<String> columnSet = collectingSheet.get(rowId);
      if (columnSet == null)
      {
        columnSet = new HashSet<String>();
        collectingSheet.put(rowId, columnSet);
      }
      columnSet.add(columnId);
    }
    else
    {
      LOG.warning("collectCell without call collectingSheet, do nothing.");
    }
  }

  public boolean isSheetAllCollected(String sheetId)
  {
    return sheetMap.get(sheetId) == ALL;
  }

  public boolean lookingSheet(String sheetId)
  {
    lookingSheet = (Map<String, Set<String>>) sheetMap.get(sheetId);
    return lookingSheet != null;
  }

  public boolean lookingRow(String rowId)
  {
    if (lookingSheet == null)
    {
      lookingRow = null;
      return false;
    }
    else
    {
      lookingRow = lookingSheet.get(rowId);
      return lookingRow != null;
    }
  }

  public boolean lookingCell(String columnId)
  {
    if (lookingRow == null)
    {
      return false;
    }
    else
    {
      return lookingRow.contains(columnId);
    }
  }
}
