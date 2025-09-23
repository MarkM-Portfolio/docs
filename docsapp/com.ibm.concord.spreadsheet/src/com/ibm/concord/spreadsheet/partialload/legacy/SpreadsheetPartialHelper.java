/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload.legacy;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.utils.CommonUtils;
import com.ibm.concord.spreadsheet.common.utils.FormulaPrioritizer;
import com.ibm.concord.spreadsheet.document.message.MessageUtil;
import com.ibm.concord.spreadsheet.document.message.Transformer;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.json.java.OrderedJSONObject;

public class SpreadsheetPartialHelper
{
  private static final Logger LOG = Logger.getLogger(SpreadsheetPartialHelper.class.getName());
  
//if only enable sheet partial level, and current row size > partial_max_row, then return the first 100 row
//  private static final int PARTIAL_MAX_ROW = 300;
//  
//  private static final int PARTIAL_ROW_CNT = 100;

  private JSONObject wholeContent;
  
  private JSONObject names;

  private JSONObject wholeMeta;

  private JSONObject wholeRef;
  
  private JSONObject wholeUnsupport;
  
  private HashMap<String, Boolean> refMap;//record the if the cells in the reference have been collected or not 

  private int maxRowCnt;

  private int maxColCnt;
  
  private HashMap<String, JSONObject> rowColIdMap;//the key is the sheet id
  
//  private int partialLevel;
  
//  private int nextStartRow = -1;

  // bWholeMeta means return all the sheet meta or not,
  // if it is fragment document or not the first time to do partial load, set bWholeMeta to false
  // bHasReferenced means put the referenced cell by the specified range(sheetName, start/end col/row index) or not
  // for fragment document, set bHasReferenced to false
  // bFragDoc means if this is used by getFragDocBySectionId or not
  // if true, then the repeat number of row/col might be changed due to the size is bigger than the specified one
  public SpreadsheetPartialHelper(JSONObject doc, int rowCnt, int colCnt)
  {
    wholeMeta = (JSONObject) doc.get(ConversionConstant.META);
    
    wholeContent = (JSONObject) doc.get(ConversionConstant.CONTENT);
    
    names = (JSONObject) wholeContent.get(ConversionConstant.NAME_RANGE);
    
    wholeRef = (JSONObject) doc.get(ConversionConstant.REFERENCE);
    if(wholeRef == null)
      wholeRef = new JSONObject();
    
    wholeUnsupport = (JSONObject)doc.get("unsupport_feature");
    maxRowCnt = rowCnt;
    maxColCnt = colCnt;
    refMap = new HashMap<String, Boolean>();
    rowColIdMap = new HashMap<String, JSONObject>();
    
    if (wholeMeta.containsKey(ConversionConstant.SHEETSIDARRAY)){
       JSONArray sheetsIdArrayJSON = (JSONArray) wholeMeta.get(ConversionConstant.SHEETSIDARRAY);
       JSONObject sheetsArray = new JSONObject();
       if (wholeMeta.containsKey(ConversionConstant.SHEETSARRAY))
         sheetsArray = (JSONObject) wholeMeta.get(ConversionConstant.SHEETSARRAY);
       int sheetCnt = sheetsIdArrayJSON.size();
       for (int i = 0; i < sheetCnt; i++)
       {
    	   String sId = (String) sheetsIdArrayJSON.get(i);
    	  JSONObject rowColArray = new JSONObject();
    	  if(sheetsArray != null)
    		  rowColArray = (JSONObject) sheetsArray.get(sId);
    	  rowColIdMap.put(sId, rowColArray);
       }
    }
//    partialLevel = SpreadsheetConfig.getPartialLevel();
  }

  /**
   * Get the current partial document with the specified content, and referenced style/cell
   * The partial document is decided by sheetId, start/end row index.
   * If the partial document want to contain the whole sheet, and does not know the end row index,
   * then set it to -1
   * @param criteria, which contains "sheet","startrow" and "endrow" info
   * sheet  specified sheet or the first sheet if it is "first"
   * startrow  specified start row index, 1-based
   * endrow specified end row index, 1-based
   * @return    JSONObject which have the same format as draft and with some flags
   * 1) max row for each sheet
   * 2) complete, seems duplicate with 1)
   * 3) start index in rowIdArray, might not same with the startRowIndex in parameter
   */
  public JSONObject getCurrentPartialDoc(JSONObject criteria)
  {
    String sheetId = null;
    int startRow = 1;
    int endRow = -1;
    if (criteria != null)
    {
      if (criteria.containsKey("sheet"))
      {
        sheetId = (String) criteria.get("sheet");
        if (sheetId.equalsIgnoreCase("first"))// get the first sheet
          sheetId = null;
      }
      if (criteria.containsKey("startrow"))
        startRow = Integer.parseInt(criteria.get("startrow").toString());
      if (criteria.containsKey("endrow"))
        endRow = Integer.parseInt(criteria.get("endrow").toString());
    }
    boolean bJoin = false;
    if (!CommonUtils.hasValue(sheetId))
    {
      sheetId = _getFirstSheetId();
      if(startRow == 1)//get the first row from the first sheet, then means it is the first time to load
        bJoin = true;
    }
    JSONObject partial = this.getPartial(sheetId, startRow, 1, endRow, -1, true, true, false, bJoin);
    return partial;
  }
  
  private String _getFirstSheetId()
  {
    String sheetId = null;
    if (wholeMeta.containsKey(ConversionConstant.SHEETSIDARRAY))
    {
      JSONArray sheetsIdArrayJSON = (JSONArray) wholeMeta.get(ConversionConstant.SHEETSIDARRAY);
      sheetId = (String)sheetsIdArrayJSON.get(0);
    }
    return sheetId;
  }

  public JSONObject getPartial(String sheetId, int startRowIndex, int startColIndex, int endRowIndex, int endColIndex,
      boolean bWholeSheetMeta, boolean bHasReferenced, boolean bFragDoc, boolean bJoin)
  {
    try
    {
      if (startRowIndex < 1)
        startRowIndex = 1;
      if (startColIndex < 1)
        startColIndex = 1;
      Set<String> cellStyleIdSet = new HashSet<String>();

      String sheetName = _getSheetName(sheetId);
      if (sheetName == null)
        return null;
      // 1. construct meta.js
      OrderedJSONObject metaJSON = new OrderedJSONObject();
      String fileType = null;
      if (wholeMeta.containsKey(ConversionConstant.FILE_TYPE_FIELD))
        fileType = (String) wholeMeta.get(ConversionConstant.FILE_TYPE_FIELD);
      if (CommonUtils.hasValue(fileType))
        metaJSON.put(ConversionConstant.FILE_TYPE_FIELD, fileType);
      // 1.1 sheet meta
      JSONObject sheetsJSON = new JSONObject();
      JSONArray sheetsIdArrayJSON = new JSONArray();
      if (bWholeSheetMeta)
      {
        if (wholeMeta.containsKey(ConversionConstant.SHEETS))
          sheetsJSON = (JSONObject) wholeMeta.get(ConversionConstant.SHEETS);
        if (wholeMeta.containsKey(ConversionConstant.SHEETSIDARRAY))
          sheetsIdArrayJSON = (JSONArray) wholeMeta.get(ConversionConstant.SHEETSIDARRAY);
      }
      else
      {
        OrderedJSONObject sheetJSON = new OrderedJSONObject();
        sheetJSON.put(ConversionConstant.SHEETNAME, sheetName);
        sheetsJSON.put(sheetId, sheetJSON);
        sheetsIdArrayJSON.add(sheetId);
      }
      if (null != sheetsJSON && !sheetsJSON.isEmpty())
        metaJSON.put(ConversionConstant.SHEETS, sheetsJSON);
      if (null != sheetsIdArrayJSON && !sheetsIdArrayJSON.isEmpty())
        metaJSON.put(ConversionConstant.SHEETSIDARRAY, sheetsIdArrayJSON);
      int sheetCnt = sheetsIdArrayJSON.size();
      // set the max row for current sheet and the empty sheet
      for (int i = 0; i < sheetCnt; i++)
      {
        String sId = (String) sheetsIdArrayJSON.get(i);
        // NEW attribute, maxrow
        int maxRow = this.getMaxRowIndex(sId);
        boolean bCurrSheet = sId.equals(sheetId);
        if (sheetsJSON.containsKey(sId))
        {
          JSONObject sheetMeta = (JSONObject) sheetsJSON.get(sId);
          sheetMeta.put(ConversionConstant.MAXROWINDEX, maxRow);
//          if (bCurrSheet && partialLevel == ServiceConstants.PARTIAL_LEVEL_SHEET)
//          {
//            if ((startRowIndex == 1) && (maxRow > PARTIAL_MAX_ROW))
//            {
//              nextStartRow = startRowIndex + PARTIAL_ROW_CNT;
//              endRowIndex = nextStartRow - 1;
//            }
//          }
        }
      }
      // 1.2 row meta and row id array
      OrderedJSONObject partSheetsArray = new OrderedJSONObject();
      OrderedJSONObject partRowColArray = new OrderedJSONObject();
      if(startRowIndex > 1)
        partRowColArray.put(ConversionConstant.STARTROW, startRowIndex);
      JSONArray partRowsIdArray = new JSONArray();
      JSONObject partRowsMeta = new JSONObject();
      endRowIndex = this.updateMeta(sheetId, startRowIndex, endRowIndex, partRowsIdArray, partRowsMeta, cellStyleIdSet, true, bFragDoc);
      partRowColArray.put(ConversionConstant.ROWSIDARRAY, partRowsIdArray);
      if (!partRowsMeta.isEmpty())
        metaJSON.put(ConversionConstant.ROWS, partRowsMeta);
      // 1.3 col meta and col id array
      JSONArray partColsIdArray = new JSONArray();
      JSONObject partColsMeta = new JSONObject();
      endColIndex = this.updateMeta(sheetId, startColIndex, endColIndex, partColsIdArray, partColsMeta, cellStyleIdSet, false, bFragDoc);
      partRowColArray.put(ConversionConstant.COLUMNSIDARRAY, partColsIdArray);
      if (!partColsMeta.isEmpty())
        metaJSON.put(ConversionConstant.COLUMNS, partColsMeta);
      partSheetsArray.put(sheetId, partRowColArray);
      metaJSON.put(ConversionConstant.SHEETSARRAY, partSheetsArray);

      // 3. construct content.js
      OrderedJSONObject contentJSON = new OrderedJSONObject();
      OrderedJSONObject sheetsCJSON = new OrderedJSONObject();

      OrderedJSONObject sheetCJSON = new OrderedJSONObject();
      OrderedJSONObject rowsJSON = new OrderedJSONObject();
      sheetCJSON.put(ConversionConstant.ROWS, rowsJSON);

      JSONObject sheetRJSON = new JSONObject();
      JSONObject partReference = new JSONObject();
      if (wholeRef.containsKey(ConversionConstant.SHEETS))
      {
        JSONObject sheetsRJSON = (JSONObject) wholeRef.get(ConversionConstant.SHEETS);
        if (sheetsRJSON.containsKey(sheetId))
          sheetRJSON = (JSONObject) sheetsRJSON.get(sheetId);
      }
      
      JSONObject sheetsMetaInfo = (JSONObject) wholeMeta.get(ConversionConstant.SHEETS);
      JSONArray sheetsIdArray = (JSONArray) wholeMeta.get(ConversionConstant.SHEETSIDARRAY);
      JSONObject sheetsArray = (JSONObject) wholeMeta.get(ConversionConstant.SHEETSARRAY);
      SheetMeta  sheetMeta = new SheetMeta(sheetsMetaInfo, sheetsIdArray);
      RowColIdIndexMeta  rowColIdIndexMeta = new RowColIdIndexMeta(sheetsArray);
      FormulaReference formulaReference = new FormulaReference(wholeRef);
      
      // TODO below only affects current sheetId (criteria-ed sheet),
      // need to fix it to apply to all sheets
      JSONObject rowsContent = _getRowsContent(sheetId);
      for (int index = 0; index < partRowsIdArray.size(); index++)
      {
        String rowId = (String) partRowsIdArray.get(index);
        if (CommonUtils.hasValue(rowId))
        {
          OrderedJSONObject rowJSON = new OrderedJSONObject();
          JSONObject rowContent = (JSONObject) rowsContent.get(rowId);
          // start index might use the previous repeat style row/col
          if ((index == 0) && (rowContent == null))
          {
            if (partRowsMeta.containsKey(rowId))
            {
              JSONObject m = (JSONObject) partRowsMeta.get(rowId);
              if (m.containsKey("followstyle"))
              {
                String tId = m.get("followstyle").toString();
                rowContent = (JSONObject) rowsContent.get(tId);
                m.remove("followstyle");
              }
            }
          }
          if (rowContent == null)
            continue;
          Iterator<String> colIdIter = (Iterator<String>) rowContent.keySet().iterator();
          while (colIdIter.hasNext())
          {
            String colId = colIdIter.next();
            JSONObject cellContent = (JSONObject) rowContent.get(colId);
            int colIndex = _getIndexById(sheetId, colId, false);
            int endRepeatColIndex = colIndex;
            if (cellContent.containsKey(ConversionConstant.REPEATEDNUM))
            {
              int cellRepeatNum = Integer.parseInt(cellContent.get(ConversionConstant.REPEATEDNUM).toString());
              endRepeatColIndex = colIndex + cellRepeatNum;
            }
            if (!(colIndex > endColIndex || endRepeatColIndex < startColIndex))
            {
              // update repeatenumber for frag document
              if (bFragDoc)
              {
                if (colIndex < startColIndex)
                  colIndex = startColIndex;
                if (endRepeatColIndex > endColIndex)
                  endRepeatColIndex = endColIndex;

                int cellRepeatNum = endRepeatColIndex - colIndex;
                if (cellRepeatNum > 0)
                  cellContent.put(ConversionConstant.REPEATEDNUM, cellRepeatNum);
                else
                  cellContent.remove(ConversionConstant.REPEATEDNUM);
              }
              String value = "";
              if (cellContent.containsKey("v"))
                value = cellContent.get("v").toString();
              // record the style id
              if (cellContent.containsKey(ConversionConstant.STYLEID))
              {
                String styleId = cellContent.get(ConversionConstant.STYLEID).toString();
                cellStyleIdSet.add(styleId);
              }
              // track all the reference of the partial document
              if (CommonUtils.hasValue(value) && MessageUtil.isFormulaString(value))
              {
                if (sheetRJSON.containsKey(rowId))
                {
                  boolean isExist = true;
                  JSONObject rowRJSON = (JSONObject) sheetRJSON.get(rowId);
                  OrderedJSONObject newRowRJSON = new OrderedJSONObject();
                  if (partReference.containsKey(rowId))
                  {
                    newRowRJSON = (OrderedJSONObject) partReference.get(rowId);
                  }
                  else
                    isExist = false;
                  if (rowRJSON.containsKey(colId))
                  {
                    JSONObject cellRJSON = (JSONObject) rowRJSON.get(colId);
                    newRowRJSON.put(colId, cellRJSON);
                    if (!isExist)
                      partReference.put(rowId, newRowRJSON);
                    
                    if(Transformer.bPartialLoadModel)
                    {
                      String newFormula = formulaReference.updateFormula(sheetId, rowId, colId, value, rowColIdIndexMeta, sheetMeta);
                      cellContent.put(ConversionConstant.VALUE, newFormula);
                    }
                  }
                }
              }
//              /**
//               * prioritize the formula for all clients' parse performance. 
//               */
//              if(MessageUtil.isFormulaString(value)){
//                String normalFormula = cellContent.get(ConversionConstant.VALUE).toString();
//                String priorityFormula = FormulaPrioritizer.prioritize(normalFormula);
//                if(!normalFormula.equals(priorityFormula))
//                  cellContent.put(ConversionConstant.FORMULA_VALUE, priorityFormula);
//              }
              if (!cellContent.isEmpty())
                rowJSON.put(colId, cellContent);
            }
          }
          if (!rowJSON.isEmpty())
            rowsJSON.put(rowId, rowJSON);
        }
      }

      sheetsCJSON.put(sheetId, sheetCJSON);
      contentJSON.put(ConversionConstant.SHEETS, sheetsCJSON);

      // 4. construct reference.js
      if (bHasReferenced)
      {
        if (!partReference.isEmpty())
        {
          // After done,merge new sheetsArray with the existing one, and add referenced cell/style in sheetsCJSON, stylesJSON
          JSONObject refSheetsArray = new JSONObject();
          JSONObject newSheetsRJSON = new JSONObject();
          newSheetsRJSON.put(sheetId, partReference);
          this.getReference(sheetId, newSheetsRJSON, sheetsCJSON, cellStyleIdSet, refSheetsArray);
          // merge sheetsArray with meta
          this.mergeMeta(refSheetsArray, partSheetsArray);

        }
      }
      if (bJoin)
      {
        // get all the range info when user join
        this.getAllRangeWhenPartial(partSheetsArray);
        JSONObject names = null;
        if (wholeContent.containsKey(ConversionConstant.NAME_RANGE))
          names = (JSONObject) wholeContent.get(ConversionConstant.NAME_RANGE);
        if (null != names && !names.isEmpty())
          contentJSON.put(ConversionConstant.NAME_RANGE, names);
        JSONObject unnames = null;
        if (wholeContent.containsKey(ConversionConstant.UNNAME_RANGE))
          unnames = (JSONObject) wholeContent.get(ConversionConstant.UNNAME_RANGE);
        if (null != unnames && !unnames.isEmpty())
          contentJSON.put(ConversionConstant.UNNAME_RANGE, unnames);
        //add pnames for preserve range list
        JSONObject pnames = null;
        if(wholeContent.containsKey(ConversionConstant.PRESERVE_NAMES_RANGE))
          pnames = (JSONObject)wholeContent.get(ConversionConstant.PRESERVE_NAMES_RANGE);
        if(null != pnames && !pnames.isEmpty())
          contentJSON.put(ConversionConstant.PRESERVE_NAMES_RANGE, pnames);
        // get all the column meta so that client can prepare the cell.markup to get the right column width
        this.getAllColumnMeta(partSheetsArray, metaJSON, cellStyleIdSet);
      }
      

      JSONObject styles = new JSONObject();
      if (wholeContent.containsKey(ConversionConstant.STYLES))
        styles = (JSONObject) wholeContent.get(ConversionConstant.STYLES);

      OrderedJSONObject partStyles = new OrderedJSONObject();
      Iterator<String> styleIter = styles.keySet().iterator();
      while (styleIter.hasNext())
      {
        String styleId = styleIter.next();
        if (cellStyleIdSet.contains(styleId) || styleId.contains("default"))
        {
          JSONObject obj = (JSONObject) styles.get(styleId);
          partStyles.put(styleId, obj);
        }
      }
      contentJSON.put(ConversionConstant.STYLES, partStyles);
      if(wholeContent.containsKey(ConversionConstant.CALCULATED))
        contentJSON.put(ConversionConstant.CALCULATED, wholeContent.get(ConversionConstant.CALCULATED));
      // TODO: put reference.js??
      OrderedJSONObject docJSON = new OrderedJSONObject();
      docJSON.put(ConversionConstant.CONTENT, contentJSON);
      docJSON.put(ConversionConstant.META, metaJSON);
      // docJSON.put(ConversionConstant.REFERENCE, refJSON);
      if(bJoin && wholeUnsupport != null)
        docJSON.put("unsupport_feature", wholeUnsupport);
//      if(nextStartRow > -1)
//        docJSON.put(ConversionConstant.NEXT_ROW, nextStartRow);
      return docJSON;
    }
    catch (Exception e)
    {
      LOG.throwing(getClass().toString(), "getCurrentPartialDoc", e);
      return null;
    }
  }

  private JSONObject _getRowsContent(String sheetId)
  {
    JSONObject sheetsContent = new JSONObject();
    if (wholeContent.containsKey(ConversionConstant.SHEETS))
      sheetsContent = (JSONObject) wholeContent.get(ConversionConstant.SHEETS);
    JSONObject sheetContent = new JSONObject();
    if (sheetsContent.containsKey(sheetId))
      sheetContent = (JSONObject) sheetsContent.get(sheetId);
    JSONObject rowsContent = new JSONObject();
    if (sheetContent.containsKey(ConversionConstant.ROWS))
      rowsContent = (JSONObject) sheetContent.get(ConversionConstant.ROWS);
    return rowsContent;
  }
//  private JSONObject _getRowColIdArray(String sheetId)
//  {
//    JSONObject sheetsArray = new JSONObject();
//    if (wholeMeta.containsKey(ConversionConstant.SHEETSARRAY))
//      sheetsArray = (JSONObject) wholeMeta.get(ConversionConstant.SHEETSARRAY);
//    JSONObject rowColArray = new JSONObject();
//    if (sheetsArray.containsKey(sheetId))
//      rowColArray = (JSONObject) sheetsArray.get(sheetId);
//    return rowColArray;
//  }

  // if sheetId != null, only merge the sheetId meta, and overwrite other sheet meta
  // if == null, merge all the sheet meta, _startRowIndex, _startColIndex are also useless
  // merge the refSheetsArray into sourceSheetsArray
  // rowIdsArray/colIdsArray in refSheetsArray are all start from 1, but with startrow/col index
  // rowIdsArray/colIdsArray in sourceSheetsArray are all start from the defined startrow/col index
  private void mergeMeta(JSONObject refSheetsArray, JSONObject sourceSheetsArray)
  {
    Set<Entry<String, JSONObject>> sheetEntries = refSheetsArray.entrySet();
    for (Iterator sheetIter = sheetEntries.iterator(); sheetIter.hasNext();)
    {
      Entry<String, JSONObject> sheetEntry = (Entry<String, JSONObject>) sheetIter.next();
      String sId = sheetEntry.getKey();
      JSONObject sheetJSON = sheetEntry.getValue();
      JSONObject sheetIDJSON = null;
      if (sourceSheetsArray.containsKey(sId))
      {
        sheetIDJSON = (JSONObject) sourceSheetsArray.get(sId);
      }
      else
      {
        sheetIDJSON = new JSONObject();
        sourceSheetsArray.put(sId, sheetIDJSON);
      }
      _mergeIdArray(sheetJSON, sheetIDJSON, true);
      _mergeIdArray(sheetJSON, sheetIDJSON, false);
    }
  }

  private void _mergeIdArray(JSONObject refSheetJSON, JSONObject sourceSheetJSON, boolean bRow)
  {
    String idArrayStr = ConversionConstant.COLUMNSIDARRAY;
    if (bRow)
      idArrayStr = ConversionConstant.ROWSIDARRAY;
    JSONArray refIds = (JSONArray) refSheetJSON.get(idArrayStr);
    // if reference sheet is empty, continue
    if (refIds == null || refIds.size() == 0)
      return;
    int _refStart = 1;
    String startStr = ConversionConstant.STARTCOL;
    if (bRow)
      startStr = ConversionConstant.STARTROW;
    if (refSheetJSON.containsKey(startStr))
      _refStart = Integer.parseInt(refSheetJSON.get(startStr).toString());
    int _refEnd = refIds.size();
    JSONArray sourceIds = (JSONArray) sourceSheetJSON.get(idArrayStr);
    if (sourceIds == null)
    {
      if (_refStart >= 1)
      {
        JSONArray newIds = new JSONArray();
        for (int i = _refStart - 1; i < refIds.size(); i++)
          newIds.add(refIds.get(i));
        sourceSheetJSON.put(idArrayStr, newIds);
        sourceSheetJSON.put(startStr, _refStart);
      }
    }
    else
    {
      int _sourceStart = 1;
      if (sourceSheetJSON.containsKey(startStr))
        _sourceStart = Integer.parseInt(sourceSheetJSON.get(startStr).toString());
      int _sourceEnd = _sourceStart + sourceIds.size() - 1;
      JSONArray newIds = new JSONArray();
      // merge row id array
      if (_refStart < _sourceStart)
      {
        sourceSheetJSON.put(startStr, _refStart);
        int startRow = _refStart;
        int endRow = _refEnd;
        if (_refEnd >= _sourceStart)
          endRow = _sourceStart - 1;
        for (int i = startRow - 1; i < endRow; i++)
          newIds.add(refIds.get(i));
        for (int i = 0; i < (_sourceStart - _refEnd - 1); i++)
          newIds.add("");
      }
      else
        sourceSheetJSON.put(startStr, _sourceStart);
      int _index = _sourceStart - 1;
      for (int i = 0; i < sourceIds.size(); i++)
      {
        String id = (String) sourceIds.get(i);
        if (!CommonUtils.hasValue(id) && _index < _refEnd)
        {
          id = (String) refIds.get(_index);
        }
        newIds.add(id);
        _index++;
      }
      // newIds.addAll(sourceIds);
      if (_refEnd > _sourceEnd)
      {
        int startRow = _refStart;
        int endRow = _refEnd;
        if (_refStart <= _sourceEnd)
          startRow = _sourceEnd + 1;
        else
          for (int i = 0; i < (_refStart - _sourceEnd - 1); i++)
            newIds.add("");
        for (int i = startRow - 1; i < endRow; i++)
          newIds.add(refIds.get(i));
      }
      sourceSheetJSON.put(idArrayStr, newIds);
    }
  }

  // startIndex is 1-based, and the start row/column of this partial document should inherited the previous styled row/column if it has
  // idArray should also be optimized that the last id should not be ""
  // private void updateMeta(String sheetId, int index, JSONArray allIdArray, JSONArray idArray, JSONObject metas,
  // Set<String>cellStyleIdSet, boolean bRow)
  private int updateMeta(String sheetId, int startIndex, int endIndex, JSONArray partIdArray, JSONObject partMetas,
      Set<String> cellStyleIdSet, boolean bRow, boolean bFragDoc)
  {
    JSONObject allMeta = new JSONObject();
    String metaKey = ConversionConstant.COLUMNS;
    String idArrayKey = ConversionConstant.COLUMNSIDARRAY;
    if (bRow)
    {
      metaKey = ConversionConstant.ROWS;
      idArrayKey = ConversionConstant.ROWSIDARRAY;
    }
    if (wholeMeta.containsKey(metaKey))
      allMeta = (JSONObject) wholeMeta.get(metaKey);

    JSONObject rowColArray = rowColIdMap.get(sheetId);
    if(rowColArray == null)
    	rowColArray = new JSONObject();
    JSONArray allIdArray = (JSONArray) rowColArray.get(idArrayKey);
    if (allIdArray == null)
      allIdArray = new JSONArray();
    int cnt = allIdArray.size();
    if (startIndex < 1)
      startIndex = 1;
    if (endIndex > cnt || endIndex < 1)
      endIndex = cnt;
    // get repeat style row of row at index
    if (startIndex > cnt)
      return endIndex;
    HashSet<String> partRowIds = new HashSet<String> ();
    for (int i = startIndex; i <= endIndex; i++)
    {
      String id = (String) allIdArray.get(i - 1);
      partIdArray.add(id);
      if (allMeta != null)
      {
        JSONObject sheetMeta = (JSONObject) allMeta.get(sheetId);
        JSONObject meta = null;
        // new format meta
        if(null != sheetMeta)
          meta = (JSONObject) sheetMeta.get(id);
        else // old format meta
          meta = (JSONObject) allMeta.get(id);
        if (meta != null)
        {
          JSONObject partSheetMeta = (JSONObject)partMetas.get(sheetId);
          if(null == partSheetMeta)
          {
            partSheetMeta = new JSONObject();
            partMetas.put(sheetId, partSheetMeta);
          }
          meta.remove(ConversionConstant.SHEETID);
          partSheetMeta.put(id, meta);
          partRowIds.add(id);
          if (meta.containsKey(ConversionConstant.INDEX))
            meta.remove(ConversionConstant.INDEX);
          int repeatNum = 0;
          if (meta.containsKey(ConversionConstant.REPEATEDNUM))
            repeatNum = Integer.parseInt(meta.get(ConversionConstant.REPEATEDNUM).toString());
          if (bFragDoc)
          {
            if ((i + repeatNum) > endIndex)
              repeatNum = endIndex - i;
          }
          if (repeatNum > 0)
            meta.put(ConversionConstant.REPEATEDNUM, repeatNum);
          else
            meta.remove(ConversionConstant.REPEATEDNUM);
          if (meta.containsKey(ConversionConstant.STYLEID))
            cellStyleIdSet.add((String) meta.get(ConversionConstant.STYLEID));
        }
      }
    }

    String id = (String) allIdArray.get(startIndex - 1);
    if (partRowIds.contains(id))
      return endIndex;
    JSONObject rowsContent = new JSONObject();
    if (bRow){
      rowsContent = rowColIdMap.get(sheetId);
      if(rowsContent == null)
    	  rowsContent = new JSONObject();
    }
    int repeatNum = -1;
    for (int i = startIndex - 1; i > 0; i--)
    {
      String tId = (String) allIdArray.get(i - 1);
      if (CommonUtils.hasValue(tId))
      {
        JSONObject sheetMeta = (JSONObject) allMeta.get(sheetId);
        JSONObject meta = null;
        if(null != sheetMeta)
          meta = (JSONObject) sheetMeta.get(id);
        else
          meta = (JSONObject) allMeta.get(id);
        if (meta != null)
        {
          repeatNum = 0;
          if (meta.containsKey(ConversionConstant.REPEATEDNUM))
            repeatNum = Integer.parseInt(meta.get(ConversionConstant.REPEATEDNUM).toString());
        }
        else if (bRow)
        {
          JSONObject rowContent = (JSONObject) rowsContent.get(tId);
          if (rowContent != null && rowContent.size() > 0)
            repeatNum = 0;
        }
        if (repeatNum > -1)
        {
          int end = i + repeatNum;
          if (end >= startIndex)
          {
            repeatNum = end - startIndex;
            if (!CommonUtils.hasValue(id))
            {
              id = createId(bRow);
              partIdArray.set(0, id);// update id in id array
            }
            JSONObject newMeta = (JSONObject) meta.clone();
//            partMetas.put(id, newMeta);// update meta
            JSONObject partSheetMeta = (JSONObject)partMetas.get(sheetId);
            if(null == partSheetMeta)
            {
              partSheetMeta = new JSONObject();
              partMetas.put(sheetId, partSheetMeta);
            }
            newMeta.remove(ConversionConstant.SHEETID);
            partSheetMeta.put(id, newMeta);
            if (newMeta.containsKey(ConversionConstant.INDEX))
              newMeta.remove(ConversionConstant.INDEX);
            if (repeatNum > 0)
              newMeta.put(ConversionConstant.REPEATEDNUM, repeatNum);
            else
              newMeta.remove(ConversionConstant.REPEATEDNUM);
            if (newMeta.containsKey(ConversionConstant.STYLEID))
              cellStyleIdSet.add((String) newMeta.get(ConversionConstant.STYLEID));
            newMeta.put("followstyle", tId);// temp set this attribute in case the tId contain content(styled cell)
          }
          break;
        }
      }
    }
    // optimize idArray
    int size = partIdArray.size();
    for (int i = (size - 1); i >= 0; i--)
    {
      String iid = partIdArray.get(i).toString();
      if (!CommonUtils.hasValue(iid))
        partIdArray.remove(i);
      else
        break;
    }
    return endIndex;
  }

  // get all the referenced cell/style to update the sheetsCJSON and stylesJSON which in content.js
  // also return sheetsArray which contain all the referenced row/col id
  private void getReference(String sheetId, JSONObject newSheetsRJSON, OrderedJSONObject sheetsCJSON, Set<String> cellStyleIdSet,
      JSONObject sheetsArray)
  {
    if (newSheetsRJSON.containsKey(sheetId))
    {
      JSONObject sheetRJSON = (JSONObject) newSheetsRJSON.get(sheetId);
      Set<Entry<String, Object>> rowEntries = sheetRJSON.entrySet();
      for (Iterator rowIter = rowEntries.iterator(); rowIter.hasNext();)
      {
        Entry<String, JSONObject> rowEntry = (Entry<String, JSONObject>) rowIter.next();
        String rowId = rowEntry.getKey();
        JSONObject rowCellsJson = rowEntry.getValue();
        Set<Entry<String, JSONObject>> cellEntries = rowCellsJson.entrySet();
        for (Iterator cellIter = cellEntries.iterator(); cellIter.hasNext();)
        {
          Entry<String, JSONObject> cellEntry = (Entry<String, JSONObject>) cellIter.next();
          JSONObject cellJSON = cellEntry.getValue();
          if (cellJSON.containsKey(ConversionConstant.FORMULACELL_REFERNCE_NAME))
          {
            JSONArray cellTypeArray = (JSONArray) cellJSON.get(ConversionConstant.FORMULACELL_REFERNCE_NAME);
            int size = cellTypeArray.size();
            for (int i = 0; i < size; i++)
            {
              JSONObject cellType = (JSONObject) cellTypeArray.get(i);
              this.putReference(cellType, sheetsCJSON, cellStyleIdSet, sheetsArray);
            }
          }
        }
      }
    }
  }

  private void putReference(JSONObject cellType, OrderedJSONObject sheetsCJSON, Set<String> cellStyleIdSet, JSONObject sheetsArray)
  {
    try
    {
      if (cellType.containsKey(ConversionConstant.REFERENCE_TYPE))
      {
        JSONObject rangeCells = new JSONObject();
        String sheetId = null;
        String address = null;
        StringBuffer refKey = new StringBuffer();
        String type = cellType.get(ConversionConstant.REFERENCE_TYPE).toString();
        int startRowIndex = -1;
        int endRowIndex = -1;
        int startColIndex = -1;
        int endColIndex = -1;
        if (ConversionConstant.NAMES_REFERENCE.equals(type))
        {
        	JSONObject nameRange = null;
        	if(cellType.containsKey(ConversionConstant.NAME_RANGE))
        	{	
	        	String rangeId = (String) cellType.get(ConversionConstant.NAME_RANGE);
	        	if(names.containsKey(rangeId))
	        	{
	        		nameRange = (JSONObject) names.get(rangeId);	        		
	        	}
        	}
        	if(nameRange == null)
        		return;
    		cellType = nameRange;
    	    cellType.put(ConversionConstant.REFERENCE_TYPE,ConversionConstant.NAMES_REFERENCE);
    	    //for name range with single cell
    	    if(!cellType.containsKey(ConversionConstant.RANGE_ENDROWID))
    	    	cellType.put(ConversionConstant.RANGE_ENDROWID,  (String) cellType.get(ConversionConstant.RANGE_STARTROWID));
    	    if(!cellType.containsKey(ConversionConstant.RANGE_ENDCOLID))
    	    	cellType.put(ConversionConstant.RANGE_ENDCOLID,  (String) cellType.get(ConversionConstant.RANGE_STARTCOLID));

        }
          if (cellType.containsKey(ConversionConstant.SHEETID) )
          {
            sheetId = (String) cellType.get(ConversionConstant.SHEETID);
            refKey.append(sheetId);
          }
          if( cellType.containsKey(ConversionConstant.RANGE_ADDRESS))
          {
            address = (String) cellType.get(ConversionConstant.RANGE_ADDRESS);
            refKey.append(":");
            refKey.append(address);
          }
          if(refMap.containsKey(refKey.toString()))
            return;
          else
            refMap.put(refKey.toString(), true);
          if (ConversionConstant.CELL_REFERENCE.equals(type))
          {
            // sheetId = (String) cellType.get(ConversionConstant.SHEETID);
            String rowId = (String) cellType.get(ConversionConstant.ROWID_NAME);
            String colId = (String) cellType.get(ConversionConstant.COLUMNID_NAME);
            int rowIndex = _getIndexById(sheetId, rowId, true);
            if (rowIndex < 0)
              return;
            int colIndex = _getIndexById(sheetId, colId, false);
            if (colIndex < 0)
              return;
            startRowIndex = rowIndex;
            endRowIndex = rowIndex;
            startColIndex = colIndex;
            endColIndex = colIndex;
          }
          else if (ConversionConstant.RANGE_REFERENCE.equals(type) || ConversionConstant.NAMES_REFERENCE.equals(type))
          {
//            sheetId = cellType.get(ConversionConstant.SHEETID).toString();
            String sRowId = (String) cellType.get(ConversionConstant.RANGE_STARTROWID);
            int sRowIndex = _getIndexById(sheetId, sRowId, true);
            if (sRowIndex < 0)
              return;
            String sColId = (String) cellType.get(ConversionConstant.RANGE_STARTCOLID);
            int sColIndex = _getIndexById(sheetId, sColId, false);
            if (sColIndex < 0)
              return;
            String eRowId = (String) cellType.get(ConversionConstant.RANGE_ENDROWID);
            int eRowIndex = _getIndexById(sheetId, eRowId, true);
            if (eRowIndex < 0)
              return;
            String eColId = (String) cellType.get(ConversionConstant.RANGE_ENDCOLID);
            int eColIndex = _getIndexById(sheetId, eColId, false);
            if (eColIndex < 0)
              return;
            startRowIndex = sRowIndex;
            endRowIndex = eRowIndex;
            startColIndex = sColIndex;
            endColIndex = eColIndex;
          }
          //0 means use the index in address
          if(startRowIndex == 0 || endRowIndex == 0 || startColIndex == 0 || endColIndex == 0){
            ReferenceParser.ParsedRef ref = ReferenceParser.parse(address);
            if(ref != null){
              if(startRowIndex == 0)
                startRowIndex = ReferenceParser.translateRow(ref.startRow);
              if(endRowIndex == 0)
                endRowIndex = ReferenceParser.translateRow(ref.endRow);
              if(startColIndex == 0)
                startColIndex = ReferenceParser.translateCol(ref.startCol);
              if(endColIndex == 0)
                endColIndex = ReferenceParser.translateCol(ref.endCol);
            }
          }
        _getPartCellsRef(sheetId, startRowIndex, endRowIndex, startColIndex, endColIndex, sheetsCJSON, cellStyleIdSet, sheetsArray);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "putReference throw expection when get partial document", e);
    }
  }

  private JSONArray _getCellRef(String sheetId, String rowId, String columnId)
  {
    if (wholeRef.containsKey(ConversionConstant.SHEETS))
    {
      JSONObject sheetsJSON = (JSONObject) wholeRef.get(ConversionConstant.SHEETS);
      if (sheetsJSON.containsKey(sheetId))
      {
        JSONObject sheetJSON = (JSONObject) sheetsJSON.get(sheetId);
        if (sheetJSON.containsKey(rowId))
        {
          JSONObject rowJSON = (JSONObject) sheetJSON.get(rowId);
          if (rowJSON.containsKey(columnId))
          {
            JSONObject cellsJSON = (JSONObject) rowJSON.get(columnId);
            if (cellsJSON.containsKey(ConversionConstant.FORMULACELL_REFERNCE_NAME))
            {
              JSONArray returnArray = (JSONArray) cellsJSON.get(ConversionConstant.FORMULACELL_REFERNCE_NAME);
              return returnArray;
            }
          }
        }
      }
    }
    return null;

  }
  //index are 1-based, 0 means that id is ConversionConstant.MAX_REF
  private void _getPartCellsRef(String sheetId, int startRowIndex, int endRowIndex, int startColIndex, int endColIndex,
      OrderedJSONObject sheetsCJSON, Set<String> cellStyleIdSet, JSONObject sheetsArray)
  {
    if (startRowIndex < 0 || endRowIndex < 0 && startColIndex < 0 || endColIndex < 0)
      return;
    JSONObject rowColArray = rowColIdMap.get(sheetId);
    if (rowColArray == null)
      return;
    JSONArray colsIdArray = (JSONArray) rowColArray.get(ConversionConstant.COLUMNSIDARRAY);
    JSONArray rowsIdArray = (JSONArray) rowColArray.get(ConversionConstant.ROWSIDARRAY);
    JSONObject rowsMeta = (JSONObject) wholeMeta.get(ConversionConstant.ROWS);
    if (rowsMeta == null)
      rowsMeta = new JSONObject();
    if (rowsIdArray != null && !rowsIdArray.isEmpty() && colsIdArray != null && !colsIdArray.isEmpty())
    {
      int rLen = rowsIdArray.size();
      int cLen = colsIdArray.size();
      if(startRowIndex > rLen)
        return;
      if(startColIndex > cLen)
        return;
      if(endRowIndex > rLen)
        endRowIndex = rLen;
      if(endColIndex > cLen)
        endColIndex = cLen;
      JSONObject rowsContent = _getRowsContent(sheetId);
      for (int i = startRowIndex; i <= endRowIndex; i++)
      {
        String rowId = (String) rowsIdArray.get(i-1);
        if (!CommonUtils.hasValue(rowId))
          continue;
        int rowRepeat = 0;
        JSONObject meta = (JSONObject) rowsMeta.get(rowId);
        if (meta != null && meta.containsKey(ConversionConstant.REPEATEDNUM))
          rowRepeat = Integer.parseInt(meta.get(ConversionConstant.REPEATEDNUM).toString());
        if (rowRepeat > 0)
          i += rowRepeat;
        JSONObject rowContent = (JSONObject) rowsContent.get(rowId);
        if (rowContent != null)
        {
          for (int j = startColIndex; j <= endColIndex; j++)
          {
            String colId = (String) colsIdArray.get(j-1);
            if (CommonUtils.hasValue(colId))
            {
              JSONObject cell = (JSONObject) rowContent.get(colId);
              if (cell != null)
              {
                boolean isExist = this.updateContent(sheetId, rowId, colId, cell, sheetsCJSON, cellStyleIdSet, sheetsArray);
                if (!isExist)
                {
                  if (cell.containsKey("v"))
                  {
                    String value = cell.get("v").toString();
                    if (CommonUtils.hasValue(value) && MessageUtil.isFormulaString(value))
                    {
                      JSONArray cellTypeArray = _getCellRef(sheetId, rowId, colId);
                      if (cellTypeArray == null)
                        continue;
                      int typeSize = cellTypeArray.size();
                      for (int m = 0; m < typeSize; m++)
                      {
                        JSONObject cellTypeJSON = (JSONObject) cellTypeArray.get(m);
                        this.putReference(cellTypeJSON, sheetsCJSON, cellStyleIdSet, sheetsArray);
                      }
                    }
                  }
                }
                int repeateNum = 0;
                if (cell.containsKey(ConversionConstant.REPEATEDNUM))
                  repeateNum = Integer.parseInt(cell.get(ConversionConstant.REPEATEDNUM).toString());
                if (repeateNum > 0)
                  j += repeateNum;
              }
            }
          }
        }
      }
    }
  }
  

  private boolean updateContent(String sheetId, String rowId, String colId, JSONObject cellJSON, OrderedJSONObject sheetsCJSON,
      Set<String> cellStyleIdSet, JSONObject sheetsArray)
  {
    JSONObject sheet = null;
    JSONObject rows = null;
    if (sheetsCJSON.containsKey(sheetId))
    {
      sheet = (JSONObject) sheetsCJSON.get(sheetId);
    }
    else
    {
      sheet = new JSONObject();
      sheetsCJSON.put(sheetId, sheet);
    }
    if (sheet.containsKey(ConversionConstant.ROWS))
    {
      rows = (JSONObject) sheet.get(ConversionConstant.ROWS);
    }
    else
    {
      rows = new JSONObject();
      sheet.put(ConversionConstant.ROWS, rows);
    }
    JSONObject row = null;
    if (rows.containsKey(rowId))
    {
      row = (JSONObject) rows.get(rowId);
    }
    else
    {
      row = new JSONObject();
      rows.put(rowId, row);
    }
    if (row.containsKey(colId))
      return true;// must already exist in content.js
    // update content
    row.put(colId, cellJSON);
    // update style
    if (cellJSON.containsKey(ConversionConstant.STYLEID))
    {
      String styleId = cellJSON.get(ConversionConstant.STYLEID).toString();
      cellStyleIdSet.add(styleId);
    }
    // update sheetsArray
    int index = _getIndexById(sheetId, rowId, true);
    this._setId(sheetsArray, sheetId, index, rowId, true);
    index = _getIndexById(sheetId, colId, false);
    this._setId(sheetsArray, sheetId, index, colId, false);
    return false;
  }

  // get the max row number of specified sheet id
  // the max row means the last row which has content or style
  public int getMaxRowIndex(String sheetId)
  {
	JSONObject rowColArray = rowColIdMap.get(sheetId);
    if (rowColArray == null)
      return 0;
    JSONArray rowIdArray = (JSONArray) rowColArray.get(ConversionConstant.ROWSIDARRAY);
    if (rowIdArray == null)
      return 0;
    JSONObject rowsContent = _getRowsContent(sheetId);
    JSONObject allMeta = (JSONObject) wholeMeta.get(ConversionConstant.ROWS);
    if ((rowsContent == null || rowsContent.size() == 0) && (allMeta == null || allMeta.size() == 0))
      return 0;
    int cnt = rowIdArray.size();
    for (int i = cnt - 1; i >= 0; i--)
    {
      String rowId = (String) rowIdArray.get(i);
      if (CommonUtils.hasValue(rowId))
      {
        if (rowsContent != null)
        {
          JSONObject rowContent = (JSONObject) rowsContent.get(rowId);
          if (rowContent != null && rowContent.size() > 0)
          {
            Iterator<String> cellIter = rowContent.keySet().iterator();
            while (cellIter.hasNext())
            {
              String colId = cellIter.next();
              JSONObject cellContent = (JSONObject) rowContent.get(colId);
              if (cellContent.containsKey(ConversionConstant.VALUE))
              {
                String value = cellContent.get(ConversionConstant.VALUE).toString();
                if (CommonUtils.hasValue(value))
                  return i + 1;
              }
              Number cs = (Number)cellContent.get(ConversionConstant.COLSPAN);
              if (cs!=null)
              {
            	  int ncs = cs.intValue();
            	  if(ncs>1)
            		  return i + 1;
              }
              if (cellContent.containsKey(ConversionConstant.STYLEID))
              {
                String styleId = cellContent.get(ConversionConstant.STYLEID).toString();
                if (CommonUtils.hasValue(styleId) && !styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))
                  return i + 1;
              }
            }
          }
        }
        if (allMeta != null)
        {
          JSONObject meta = (JSONObject) allMeta.get(rowId);
          if (meta != null)
          {
//            boolean bHeight = meta.containsKey(ConversionConstant.HEIGHT);
            boolean bHide = false;
            String visibility = (String)meta.get(ConversionConstant.VISIBILITY);
  			if(visibility != null){
      			if("hide".equalsIgnoreCase(visibility) || "filter".equalsIgnoreCase(visibility))
      				bHide = true;  
  			}
  				
//            if (bHeight || bHide)
            if(bHide)
              return i + 1;
          }
        }
      }
    }
    return 0;
  }

  private void getAllColumnMeta(JSONObject sourceSheetsArray, JSONObject metaJSON, Set<String> cellStyleIdSet)
  {
    JSONObject newSheetsArray = new JSONObject();
    JSONArray sheetIdArray = (JSONArray) wholeMeta.get(ConversionConstant.SHEETSIDARRAY);
    JSONObject allMeta = (JSONObject) wholeMeta.get(ConversionConstant.COLUMNS);
    if (allMeta == null || allMeta.isEmpty())
      return;
    JSONObject newAllColMeta = new JSONObject();
    for (int i = 0; i < sheetIdArray.size(); i++)
    {
      String sheetId = (String) sheetIdArray.get(i);
      if (CommonUtils.hasValue(sheetId))
      {
        JSONObject rowColArray = rowColIdMap.get(sheetId);
        if (rowColArray == null)
          continue;
        JSONArray colIdArray = (JSONArray) rowColArray.get(ConversionConstant.COLUMNSIDARRAY);
        if (colIdArray == null || colIdArray.size() == 0)
          continue;
        JSONObject sheetColMeta = (JSONObject)allMeta.get(sheetId);
        for (int j = 0; j < colIdArray.size(); j++)
        {
          String colId = (String) colIdArray.get(j);
          
          JSONObject meta = null;
          if(null != sheetColMeta)
            meta = (JSONObject) sheetColMeta.get(colId);
          else
            meta = (JSONObject) allMeta.get(colId);
          if (meta != null)
          {
            if(meta.containsKey(ConversionConstant.STYLEID)){
              String styleId = (String)meta.get(ConversionConstant.STYLEID);
              cellStyleIdSet.add(styleId);
            }
            this._setId(newSheetsArray, sheetId, j + 1, colId, false);
            // backward compatible old meta format
            if(null == sheetColMeta)
            {
              JSONObject newSheetColMeta = (JSONObject)newAllColMeta.get(sheetId);
              if(null == newSheetColMeta)
              {
                newSheetColMeta = new JSONObject();
                newAllColMeta.put(sheetId,newSheetColMeta );
              }
              meta.remove(ConversionConstant.SHEETID);
              newSheetColMeta.put(colId, meta);
            }
          }
        }
      }
    }
    this.mergeMeta(newSheetsArray, sourceSheetsArray);
    if(newAllColMeta.isEmpty())
      metaJSON.put(ConversionConstant.COLUMNS, allMeta);
    else
      metaJSON.put(ConversionConstant.COLUMNS, newAllColMeta);
  }

  // only called when first load document, return all the range(task/comments)
  // and merge the row/column id of this range with the source sheets array
  private void getAllRangeWhenPartial(JSONObject sourceSheetsArray)
  {
    int loop = 0;
    JSONObject rangesJSON = null;
    JSONObject sheetsArray = new JSONObject();
    while (loop < 3)
    {
      if (loop == 0)
      {
        rangesJSON = (JSONObject) wholeContent.get(ConversionConstant.UNNAME_RANGE);
      }
      else if(loop == 1)
      {
        rangesJSON = (JSONObject) wholeContent.get(ConversionConstant.NAME_RANGE);
      }
      else
      {
        rangesJSON = (JSONObject) wholeContent.get(ConversionConstant.PRESERVE_NAMES_RANGE);
      }
      if (rangesJSON != null)
      {
        Iterator<JSONObject> rangeIter = rangesJSON.values().iterator();
        while (rangeIter.hasNext())
        {
          JSONObject rangeJSON = rangeIter.next();
          String updatedRangeAddress = "";
          String startRowId = null;
          String startColId = null;
          String endRowId = null;
          String endColId = null;
          String sheetId = null;
          int startRowIndex = -1;
          int startColIndex = -1;
          int endRowIndex = -1;
          int endColIndex = -1;
          String sheetName = null;
          String rangeAddress = null;
          rangeAddress = (String) rangeJSON.get(ConversionConstant.RANGE_ADDRESS);
          sheetId = (String) rangeJSON.get(ConversionConstant.SHEETID);
          if (!CommonUtils.hasValue(sheetId))
            continue;
          sheetName = _getSheetName(sheetId);
          if (!CommonUtils.hasValue(sheetName))
            continue;// invalid sheet
          if (rangeJSON.containsKey(ConversionConstant.ROWID_NAME))
          {
            startRowId = (String) rangeJSON.get(ConversionConstant.ROWID_NAME);
            if (CommonUtils.hasValue(startRowId))
              startRowIndex = _getIndexById(sheetId, startRowId, true);
            if (startRowIndex < 0)
              continue;
          }
          if (rangeJSON.containsKey(ConversionConstant.COLUMNID_NAME))
          {
            startColId = (String) rangeJSON.get(ConversionConstant.COLUMNID_NAME);
            if (CommonUtils.hasValue(startColId))
              startColIndex = _getIndexById(sheetId, startColId, false);
            if (startColIndex < 0)
              continue;
          }
          if (rangeJSON.containsKey(ConversionConstant.RANGE_STARTROWID))
          {
            startRowId = (String) rangeJSON.get(ConversionConstant.RANGE_STARTROWID);
            if (CommonUtils.hasValue(startRowId))
              startRowIndex = _getIndexById(sheetId, startRowId, true);
            if (startRowIndex < 0)
              continue;// invalid start row
          }
          if (rangeJSON.containsKey(ConversionConstant.RANGE_STARTCOLID))
          {
            startColId = (String) rangeJSON.get(ConversionConstant.RANGE_STARTCOLID);
            if (CommonUtils.hasValue(startColId))
              startColIndex = _getIndexById(sheetId, startColId, false);
            if (startColIndex < 0)
              continue;// invalid start col
          }
          if (rangeJSON.containsKey(ConversionConstant.RANGE_ENDROWID))
          {
            endRowId = (String) rangeJSON.get(ConversionConstant.RANGE_ENDROWID);
            if (CommonUtils.hasValue(endRowId))
              endRowIndex = _getIndexById(sheetId, endRowId, true);
            if (endRowIndex < 0)
              continue;// invalid end row
          }
          if (rangeJSON.containsKey(ConversionConstant.RANGE_ENDCOLID))
          {
            endColId = (String) rangeJSON.get(ConversionConstant.RANGE_ENDCOLID);
            if (CommonUtils.hasValue(endColId))
              endColIndex = _getIndexById(sheetId, endColId, false);
            if (endColIndex < 0)
              continue;// invalid end col
          }
          updatedRangeAddress = ReferenceUtil
              .getRefAddress(sheetName, startRowIndex, startColIndex, endRowIndex, endColIndex, rangeAddress);
          rangeJSON.put(ConversionConstant.RANGE_ADDRESS, updatedRangeAddress);
          if (startRowIndex > 0)
            this._setId(sheetsArray, sheetId, startRowIndex, startRowId, true);
          if (endRowIndex > 0 && endRowIndex != startRowIndex)
            this._setId(sheetsArray, sheetId, endRowIndex, endRowId, true);
          if (startColIndex > 0)
            this._setId(sheetsArray, sheetId, startColIndex, startColId, false);
          if (endColIndex > 0 && endColIndex != startColIndex)
            this._setId(sheetsArray, sheetId, endColIndex, endColId, false);
        }
      }
      loop++;
    }
    this.mergeMeta(sheetsArray, sourceSheetsArray);
  }

  private String _getSheetName(String sheetId)
  {
    JSONObject sheets = (JSONObject) wholeMeta.get(ConversionConstant.SHEETS);
    if (sheets != null)
    {
      JSONObject sheet = (JSONObject) sheets.get(sheetId);
      if (sheet != null)
      {
        String sheetName = sheet.get(ConversionConstant.SHEETNAME).toString();
        return sheetName;
      }
    }
    return null;
  }

  private void _setId(JSONObject sheetsArray, String sheetId, int index, String id, boolean bRow)
  {
    JSONObject mSheet = new JSONObject();
    if (sheetsArray.containsKey(sheetId))
    {
      mSheet = (JSONObject) sheetsArray.get(sheetId);
    }
    else
    {
      sheetsArray.put(sheetId, mSheet);
      mSheet.put(ConversionConstant.ROWSIDARRAY, new JSONArray());
      mSheet.put(ConversionConstant.COLUMNSIDARRAY, new JSONArray());
      mSheet.put(ConversionConstant.STARTROW, 0);
      mSheet.put(ConversionConstant.STARTCOL, 0);
    }
    JSONArray idArray = null;
    String idArrayKey = ConversionConstant.COLUMNSIDARRAY;
    if (bRow)
      idArrayKey = ConversionConstant.ROWSIDARRAY;
    if (mSheet.containsKey(idArrayKey))
      idArray = (JSONArray) mSheet.get(idArrayKey);
    else
    {
      idArray = new JSONArray();
      mSheet.put(idArrayKey, idArray);
    }
    int minIndex = 0;
    String startIndexKey = ConversionConstant.STARTCOL;
    if (bRow)
      startIndexKey = ConversionConstant.STARTROW;
    minIndex = Integer.parseInt(mSheet.get(startIndexKey).toString());
    if (minIndex < 1 || index < minIndex)
    {
      minIndex = index;
      mSheet.put(startIndexKey, minIndex);
    }
    int cnt = index - idArray.size();
    for (int i = 0; i < cnt; i++)
      idArray.add("");
    idArray.set(index - 1, id);
  }
  //return 0 for MAX_REF
  //return -1 for non-exist id
  private int _getIndexById(String sheetId, String id, boolean bRow)
  {
    int index = -1;
    if (!CommonUtils.hasValue(sheetId) || !CommonUtils.hasValue(id))
      return -1;
    if(id.equals(ConversionConstant.MAX_REF))
      return 0;
    JSONObject rowColArray = rowColIdMap.get(sheetId);
    if(rowColArray == null)
    	rowColArray = new JSONObject();
    String idKey = ConversionConstant.COLUMNSIDARRAY;
    if (bRow)
      idKey = ConversionConstant.ROWSIDARRAY;
    JSONArray idArray = (JSONArray) rowColArray.get(idKey);
    if (null == idArray)
      return -1;
    index = idArray.indexOf(id);
    if (-1 == index)
      return -1;
    return index + 1;
  }

  private String createId(boolean bRow)
  {
    if((maxRowCnt < 1) && (maxColCnt < 1))
      this.getMaxRowColCnt();
    String key;
    int cnt;
    if (bRow)
    {
      maxRowCnt++;
      key = RowColIdIndexMeta.RID;
      cnt = maxRowCnt;
    }
    else
    {
      maxColCnt++;
      key = RowColIdIndexMeta.CID;
      cnt = maxColCnt;
    }

    String id = key + cnt;
    return id;
  }
  
  public void getMaxRowColCnt()
  {
    JSONObject sheetsArray = null;
    if (wholeMeta.containsKey(ConversionConstant.SHEETSARRAY))
      sheetsArray = (JSONObject) wholeMeta.get(ConversionConstant.SHEETSARRAY);
    if (null == sheetsArray || sheetsArray.isEmpty())
      return;
    Set<Entry<String, JSONObject>> entries = sheetsArray.entrySet();
    Iterator<Entry<String, JSONObject>> iter = entries.iterator();
    while (iter.hasNext())
    {
      Entry<String, JSONObject> entry = iter.next();
      JSONObject sheetArray = entry.getValue();
      JSONArray rowsIdArray = (JSONArray) sheetArray.get(ConversionConstant.ROWSIDARRAY);
      JSONArray colsIdArray = (JSONArray) sheetArray.get(ConversionConstant.COLUMNSIDARRAY);
      if (null != colsIdArray && !colsIdArray.isEmpty())
      {
        for (int i = 0; i < colsIdArray.size(); i++)
        {
          String colId = (String) colsIdArray.get(i);
          int length = colId.length();
          if (length > 0)
          {
            String strCount = colId.substring(2, length);
            int count = Integer.parseInt(strCount);
            if (count > this.maxColCnt)
            {
              this.maxColCnt = count;
            }
          }
        }
      }
      if (null != rowsIdArray && !rowsIdArray.isEmpty())
      {
        for (int i = 0; i < rowsIdArray.size(); i++)
        {
          String rowId = (String) rowsIdArray.get(i);
          int length = rowId.length();
          if (length > 0)
          {
            String strCount = rowId.substring(2, length);
            int count = Integer.parseInt(strCount);
            if (count > this.maxRowCnt)
            {
              this.maxRowCnt = count;
            }
          }
        }
      }
    }
  }
  
//  public static void main(String[] args)
//  {
//    String docUri = "E:/dd";
//      String uri = docUri + File.separator + "meta.js";
//      JSONObject meta = SpreadsheetDocumentModel.loadJsFile(uri);
//      uri = docUri + File.separator + "content.js";
//      JSONObject content = SpreadsheetDocumentModel.loadJsFile(uri);
//      uri = docUri + File.separator + "reference.js";
//
//      JSONObject reference = SpreadsheetDocumentModel.loadJsFile(uri);
//      
//      JSONObject docJson = new JSONObject();
//      docJson.put(ConversionConstant.CONTENT, content);
//      docJson.put(ConversionConstant.META, meta);
//      docJson.put(ConversionConstant.REFERENCE, reference);
//      JSONObject criteria = new JSONObject();
//      criteria.put("sheet", "first");
//      
//      SpreadsheetPartialHelper partialHelper = new SpreadsheetPartialHelper(docJson, -1, -1);
//      long start = System.currentTimeMillis();
//      JSONObject pDoc = partialHelper.getCurrentPartialDoc(criteria);
//      long end = System.currentTimeMillis();
//      System.out.println("partial:" + (end-start));
//  }
}
