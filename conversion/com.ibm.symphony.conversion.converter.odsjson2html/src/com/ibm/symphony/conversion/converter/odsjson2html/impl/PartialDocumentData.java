/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odsjson2html.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser.ParsedRef;

/**
 * Stores partial document data fit for view client side number format and formula calc
 * 
 * 
 */
public class PartialDocumentData
{
  private JSONObject document;

  private JSONObject content;

  private JSONObject meta;

  private JSONObject metaSheets;
  
  private JSONObject metaColumns;

  private JSONObject sheetsArray;

  private JSONArray sheetsIdArray;

  private JSONObject contentSheets;

  private JSONObject styles;

  private JSONObject parentMeta;

  private JSONObject parentMetaSheets;
  
  private JSONObject parentMetaCols;

  private JSONObject parentContent;

  private JSONObject parentReference;

  private JSONObject parentStyles;
  
  private JSONObject parentNames;

  private JSONObject parentSheetsArray;

  private JSONObject parentContentSheets;

  private Map<String, JSONObject> contentRows;

  private Map<String, JSONArray> metaRowsIdArray;

  private Map<String, JSONArray> metaColsIdArray;

  private Set<String> addedFormulaCellAddrSet;

  private JSONObject parentReferenceSheets;

  private boolean empty;

  public PartialDocumentData(JSONObject parentContent, JSONObject parentMeta, JSONObject parentReference)
  {
    document = new JSONObject();
    this.content = new JSONObject();
    this.meta = new JSONObject();
    metaSheets = new JSONObject();
    sheetsArray = new JSONObject();
    sheetsIdArray = new JSONArray();
    styles = new JSONObject();
    contentSheets = new JSONObject();
    contentRows = new HashMap<String, JSONObject>();
    metaRowsIdArray = new HashMap<String, JSONArray>();
    metaColsIdArray = new HashMap<String, JSONArray>();
    addedFormulaCellAddrSet = new HashSet<String>();

    document.put(ConversionConstant.CONTENT, content);
    document.put(ConversionConstant.META, meta);

    meta.put(ConversionConstant.SHEETSARRAY, sheetsArray);

    content.put(ConversionConstant.STYLES, styles);
    content.put(ConversionConstant.SHEETS, contentSheets);
    styles.put(ConversionConstant.DEFAULT_CELL_STYLE, new JSONObject());

    this.parentContent = parentContent;
    this.parentMeta = parentMeta;
    this.parentSheetsArray = (JSONObject) this.parentMeta.get(ConversionConstant.SHEETSARRAY);
    this.parentMetaSheets = (JSONObject) this.parentMeta.get(ConversionConstant.SHEETS);
    this.parentMetaCols = (JSONObject) this.parentMeta.get(ConversionConstant.COLUMNS);
    this.parentReference = parentReference;
    if (this.parentReference != null)
    {
      parentReferenceSheets = (JSONObject) this.parentReference.get(ConversionConstant.SHEETS);
      if (parentReferenceSheets == null)
      {
        parentReferenceSheets = new JSONObject();
      }
    }
    parentStyles = (JSONObject) this.parentContent.get(ConversionConstant.STYLES);
    parentContentSheets = (JSONObject) this.parentContent.get(ConversionConstant.SHEETS);
    parentNames = (JSONObject) this.parentContent.get(ConversionConstant.NAME_RANGE);
    
    meta.put(ConversionConstant.SHEETS, parentMetaSheets);
    meta.put(ConversionConstant.SHEETSIDARRAY, parentMeta.get(ConversionConstant.SHEETSIDARRAY));

    empty = true;
  }

  public String toString()
  {
    return document.toString();
  }

  public boolean isEmpty()
  {
    return empty;
  }

  public void clear()
  {
    metaSheets.clear();
    sheetsArray.clear();
    sheetsIdArray.clear();

    styles.clear();
    styles.put(ConversionConstant.DEFAULT_CELL_STYLE, new JSONObject());
    contentSheets.clear();
    contentRows.clear();
    metaRowsIdArray.clear();
    metaColsIdArray.clear();

    addedFormulaCellAddrSet.clear();

    empty = true;
  }

  /**
   * Add a formula cell to this partial document. A formula cell must have its value, but will not necessary have style. This call also adds
   * all referenced cell to this partial document.
   * 
   * @param sheetId
   * @param sheetName
   * @param rowId
   * @param rowIndex
   *          0 based
   * @param colId
   * @param colIndex
   *          0 based
   * @param cell
   */
  public void addFormulaCell(String sheetId, String sheetName, String rowId, int rowIndex, String colId, int colIndex, JSONObject cell)
  {
    String vTemp = ConversionUtil.prioritize(String.valueOf(cell.get("v")));
    cell.put("v", vTemp);
    empty = false;

    // check if this cell is already added as a formula cell
    String setKey = getFormulaCellSetKey(sheetId, rowId, colId);
    if (addedFormulaCellAddrSet.contains(setKey))
    {
      return;
    }

    addedFormulaCellAddrSet.add(setKey);
    List<CellStruct> cellQueue = new LinkedList<CellStruct>();
    cellQueue.add(new CellStruct(sheetId, sheetName, rowId, rowIndex, colId, colIndex, cell));

    while (!cellQueue.isEmpty())
    {
      CellStruct cellStruct = cellQueue.remove(0);
      JSONObject addedCell = addValueCell(cellStruct.sheetId, cellStruct.sheetName, cellStruct.rowId, cellStruct.rowIndex,
          cellStruct.colId, cellStruct.colIndex, cellStruct.cell);
      appendFormatStyleToCell(cellStruct.sheetId, cellStruct.colId, addedCell, cellStruct.cell);

      // find referenced cell
      JSONObject sheet = (JSONObject) parentReferenceSheets.get(cellStruct.sheetId);
      if (sheet == null)
      {
        continue;
      }

      JSONObject row = (JSONObject) sheet.get(cellStruct.rowId);
      if (row == null)
      {
        continue;
      }

      JSONObject cellsJson = (JSONObject) row.get(cellStruct.colId);
      if (cellsJson == null)
      {
        continue;
      }

      JSONArray refCells = (JSONArray) cellsJson.get(ConversionConstant.CELLS);
      if (refCells == null)
      {
        continue;
      }

      for (Iterator iterator = refCells.iterator(); iterator.hasNext();)
      {
        JSONObject refCell = (JSONObject) iterator.next();
        String refType = (String) refCell.get(ConversionConstant.REFERENCE_TYPE);
        String refAddr = "";
        if (ConversionConstant.RANGE_REFERENCE.equals(refType) || ConversionConstant.NAME_RANGE.equals(refType))
        {
          if (ConversionConstant.NAME_RANGE.equals(refType)){
            refAddr = (String) refCell.get(ConversionConstant.NAME_RANGE);
            JSONObject tempNamesRange = (JSONObject) this.parentNames.get(refAddr);
            JSONObject namesTemp = new JSONObject();
            if(content.get(ConversionConstant.NAME_RANGE) == null){
              content.put(ConversionConstant.NAME_RANGE, namesTemp);
            }
            namesTemp = (JSONObject) content.get(ConversionConstant.NAME_RANGE);
            namesTemp.put(refAddr, tempNamesRange);
            
            // TODO consider using "="
            refCell.putAll(tempNamesRange);
          }
          
          refAddr = (String) refCell.get(ConversionConstant.RANGE_ADDRESS);
          ParsedRef parsedRangeRef = ReferenceParser.parse(refAddr);
          String refSheetName = null;
          String refSheetId = (String) refCell.get(ConversionConstant.SHEETID);
          CellStruct parsedCellStruct = new CellStruct();
          int startRowIndex = ReferenceParser.translateRow(parsedRangeRef.getStartRow()) - 1;
          int endRowIndex = ReferenceParser.translateRow(parsedRangeRef.getEndRow()) - 1;
          int startColIndex = ReferenceParser.translateCol(parsedRangeRef.getStartCol()) - 1;
          int endColIndex = ReferenceParser.translateCol(parsedRangeRef.getEndCol()) - 1;
          if (StringUtils.isEmpty(parsedRangeRef.getSheetName()))
          {
            // no sheet name in range address, set sheet name as in deriving cellStruct
            refSheetName = cellStruct.sheetName;
          }
          else
          {
            refSheetName = parsedRangeRef.getSheetName();
          }
          // FOR the range in parent document
          JSONObject parentRowColIdArray = (JSONObject) parentSheetsArray.get(refSheetId);
          JSONArray parentRowsIdArray = (JSONArray) parentRowColIdArray.get(ConversionConstant.ROWSIDARRAY);
          JSONArray parentColsIdArray = (JSONArray) parentRowColIdArray.get(ConversionConstant.COLUMNSIDARRAY);
          JSONObject parentSheet = (JSONObject) parentContentSheets.get(refSheetId);
          JSONObject parentRows = (JSONObject) parentSheet.get(ConversionConstant.ROWS);
          for (int i = startRowIndex; i <= endRowIndex; i++)
          {
            if (parentRowsIdArray.size() <= i)
            {
              break;
            }
            String refRowId = (String) parentRowsIdArray.get(i);
            if (StringUtils.isEmpty(refRowId))
            {
              continue;
            }
            JSONObject refRow = (JSONObject) parentRows.get(refRowId);
            if (refRow == null)
            {
              continue;
            }

            for (int j = startColIndex; j <= endColIndex; j++)
            {
              if (parentColsIdArray.size() <= j)
              {
                break;
              }
              String refColId = (String) parentColsIdArray.get(j);
              if (StringUtils.isEmpty(refColId))
              {
                continue;
              }
              setKey = getFormulaCellSetKey(refSheetId, refRowId, refColId);
              if (addedFormulaCellAddrSet.contains(setKey))
              {
                continue;
              }
              addedFormulaCellAddrSet.add(setKey);

              JSONObject refCellJson = (JSONObject) refRow.get(refColId);
              if (refCellJson != null)
              {
                CellStruct refCellStruct = new CellStruct(refSheetId, refSheetName, refRowId, i, refColId, j, refCellJson);
                cellQueue.add(refCellStruct);
              }
            }
          }
        }
        else if (ConversionConstant.CELL_REFERENCE.equals(refType))
        {
          String refSheetId = (String) refCell.get(ConversionConstant.SHEETID);
          String refRowId = (String) refCell.get(ConversionConstant.ROWID_NAME);
          String refColId = (String) refCell.get(ConversionConstant.COLUMNID_NAME);
          refAddr = (String) refCell.get(ConversionConstant.RANGE_ADDRESS);
          setKey = getFormulaCellSetKey(refSheetId, refRowId, refColId);
          if (!addedFormulaCellAddrSet.contains(setKey))
          {
            addedFormulaCellAddrSet.add(setKey);
            ParsedRef parsedCellRef = ReferenceParser.parse(refAddr);
            CellStruct refCellStruct = new CellStruct();
            refCellStruct.rowIndex = ReferenceParser.translateRow(parsedCellRef.getStartRow()) - 1;
            refCellStruct.colIndex = ReferenceParser.translateCol(parsedCellRef.getStartCol()) - 1;
            refCellStruct.sheetId = refSheetId;
            refCellStruct.rowId = refRowId;
            refCellStruct.colId = refColId;
            if (StringUtils.isEmpty(parsedCellRef.getSheetName()))
            {
              refCellStruct.sheetName = cellStruct.sheetName;
            }
            else
            {
              refCellStruct.sheetName = parsedCellRef.getSheetName();
            }
            // find cell
            JSONObject parentSheet = (JSONObject) parentContentSheets.get(refSheetId);
            if (parentSheet == null)
            {
              continue;
            }
            JSONObject parentRows = (JSONObject) parentSheet.get(ConversionConstant.ROWS);
            JSONObject parentRow = (JSONObject) parentRows.get(refRowId);
            if (parentRow == null)
            {
              continue;
            }
            JSONObject parentCell = (JSONObject) parentRow.get(refColId);
            if (parentCell == null)
            {
              continue;
            }
            refCellStruct.cell = parentCell;
            cellQueue.add(refCellStruct);
          }
        }
        else
        {
          continue;
        }
      }
    }
  }

  /**
   * Add a format cell to this partial document. A format cell must have its value and its format style.
   * 
   * @param sheetId
   * @param sheetName
   * @param rowId
   * @param rowIndex
   *          0 based
   * @param colId
   * @param colIndex
   *          0 based
   * @param cell
   */
  public void addFormatCell(String sheetId, String sheetName, String rowId, int rowIndex, String colId, int colIndex, JSONObject cell)
  {
    empty = false;

    JSONObject addedCell = addValueCell(sheetId, sheetName, rowId, rowIndex, colId, colIndex, cell);
    appendFormatStyleToCell(sheetId, colId, addedCell, cell);
  }
  
  public void addFormatColumn(String sheetId, String sheetName, String colId, int colIndex, String styleId)
  {
    empty = false;
    
    addSheet(sheetId, sheetName);
    addColumn(sheetId, colId, colIndex);
    if (metaColumns == null)
    {
      metaColumns = new JSONObject();
      meta.put(ConversionConstant.COLUMNS, metaColumns);
    }
    
    JSONObject metaTemp = (JSONObject) metaColumns.get(sheetId);
    if (metaTemp == null)
    {
      metaTemp = new JSONObject();
      metaColumns.put(sheetId, metaTemp);
    }
    JSONObject col = new JSONObject();
    col.put(ConversionConstant.STYLEID, styleId);
    metaTemp.put(colId, col);
 
    addFormatStyle(styleId);
  }

  /**
   * Add a plain value cell. Will not add style or add referenced cell.
   * 
   * @param sheetId
   * @param sheetName
   * @param rowId
   * @param rowIndex
   *          0 based
   * @param colId
   * @param colIndex
   *          0 based
   * @param cell
   * @return
   */
  private JSONObject addValueCell(String sheetId, String sheetName, String rowId, int rowIndex, String colId, int colIndex, JSONObject cell)
  {
    empty = false;

    JSONObject addedCell = getCell(sheetId, rowId, colId);
    if (addedCell != null)
    {
      return addedCell;
    }

    addSheet(sheetId, sheetName);
    addRow(sheetId, rowId, rowIndex);
    addColumn(sheetId, colId, colIndex);
    
    JSONObject rows = contentRows.get(sheetId);
    JSONObject row = (JSONObject) rows.get(rowId);
    if (row == null)
    {
      row = new JSONObject();
      rows.put(rowId, row);
    }
    JSONObject c = (JSONObject) row.get(colId);
    if (c == null)
    {
      c = new JSONObject();
      String v = null;
      String cv = null;
      if (cell != null)
      {
        Object o = cell.get("v");
        if (o != null)
        {
          v = String.valueOf(o);
        }
        Object ocv = cell.get("cv");
        if (ocv != null)
        {
          cv = String.valueOf(ocv);
        }
      }
      if (StringUtils.isNotEmpty(v))
      {
        c.put("v", cell.get("v"));
      }
      if (StringUtils.isNotEmpty(cv))
      {
        c.put("cv", cell.get("cv"));
      }
      row.put(colId, c);
    }
    
    return c;
  }

  private void appendFormatStyleToCell(String sheetId, String colId, JSONObject addedCell, JSONObject sourceCell)
  {
    if (addedCell.containsKey(ConversionConstant.STYLEID))
    {
      return;
    }

    String styleId = (String) sourceCell.get(ConversionConstant.STYLEID);
    if (styleId == null)
    {
      return;
    }
    JSONObject parentStyle = (JSONObject) parentStyles.get(styleId);
    if (parentStyle == null)
    {
      return;
    }
    JSONObject formatStyle = (JSONObject) parentStyle.get(ConversionConstant.FORMAT);
    if (formatStyle == null)
    {
      if (this.parentMetaCols == null)
      {
        return;
      }
      
      JSONObject column = (JSONObject) this.parentMetaCols.get(colId);
      String colStyleId = column == null ? null : (String) column.get(ConversionConstant.STYLEID);
      if (colStyleId == null)
      {
        return;
      }
      else
      {
        JSONObject colStyle = (JSONObject) parentStyles.get(colStyleId);
        if (colStyle.get(ConversionConstant.FORMAT) == null)
        {
          return;
        }
        else
        {
          // cell has no format style, but column has style. add default style to cell to clear format style
          styleId = ConversionConstant.DEFAULT_CELL_STYLE;
        }
      }
    }

    addedCell.put(ConversionConstant.STYLEID, styleId);
    if (styles.containsKey(styleId))
    {
      return;
    }

    JSONObject style = new JSONObject();
    style.put(ConversionConstant.FORMAT, formatStyle);
    styles.put(styleId, style);
  }
  
  private void addFormatStyle(String styleId)
  {
    if (styles.containsKey(styleId))
    {
      return;
    }

    JSONObject parentStyle = (JSONObject) parentStyles.get(styleId);
    JSONObject formatStyle = (JSONObject) parentStyle.get(ConversionConstant.FORMAT);
    if (formatStyle != null)
    {
      JSONObject style = new JSONObject();
      style.put(ConversionConstant.FORMAT, formatStyle);
      styles.put(styleId, style);
    }
  }

  private void addColumn(String sheetId, String colId, int colIndex)
  {
    JSONArray columnsIdArray = metaColsIdArray.get(sheetId);
    ensureSet(columnsIdArray, colIndex, colId);
  }

  private void addRow(String sheetId, String rowId, int rowIndex)
  {
    JSONArray rowsIdArray = metaRowsIdArray.get(sheetId);
    ensureSet(rowsIdArray, rowIndex, rowId);
  }

  /*
   * ensure the list size and set the object, no replace
   */
  private void ensureSet(ArrayList list, int index, Object o)
  {
    if (list.size() > index && StringUtils.isNotEmpty((String) list.get(index)))
    {
      return;
    }

    list.ensureCapacity(index + 1);
    while (list.size() <= index)
    {
      list.add(StringUtils.EMPTY);
    }
    list.set(index, o);
  }

  private void addSheet(String sheetId, String sheetName)
  {
    if (metaSheets.containsKey(sheetId))
    {
      // already added
      return;
    }

    // get sheet index from parent
    JSONObject parentSheet = (JSONObject) parentMetaSheets.get(sheetId);
    metaSheets.put(sheetId, parentSheet);
    int sheetIndex = ((Number) parentSheet.get(ConversionConstant.SHEETINDEX)).intValue();
    ensureSet(sheetsIdArray, sheetIndex, sheetId);

    JSONObject sheet = new JSONObject();
    JSONObject rows = new JSONObject();
    sheet.put(ConversionConstant.ROWS, rows);
    contentRows.put(sheetId, rows);
    contentSheets.put(sheetId, sheet);

    sheet = new JSONObject();
    JSONArray rowsIdArray = new JSONArray();
    JSONArray colsIdArray = new JSONArray();
    sheet.put(ConversionConstant.ROWSIDARRAY, rowsIdArray);
    sheet.put(ConversionConstant.COLUMNSIDARRAY, colsIdArray);
    metaRowsIdArray.put(sheetId, rowsIdArray);
    metaColsIdArray.put(sheetId, colsIdArray);
    sheetsArray.put(sheetId, sheet);
  }

  private String getFormulaCellSetKey(String sheetId, String rowId, String colId)
  {
    return new StringBuilder().append(sheetId).append(rowId).append(colId).toString();
  }

  private JSONObject getCell(String sheetId, String rowId, String colId)
  {
    JSONObject rows = contentRows.get(sheetId);
    if (rows == null)
    {
      return null;
    }
    JSONObject row = (JSONObject) rows.get(rowId);
    if (row == null)
    {
      return null;
    }
    JSONObject cell = (JSONObject) row.get(colId);
    return cell;
  }

  /*
   * simple struct def for a cell
   */
  private static class CellStruct
  {
    String sheetId;

    String sheetName;

    String rowId;

    int rowIndex;

    String colId;

    int colIndex;

    JSONObject cell;

    CellStruct()
    {
      rowIndex = -1;
      colIndex = -1;
    }

    CellStruct(String sid, String sname, String rid, int rindex, String cid, int cindex, JSONObject c)
    {
      sheetId = sid;
      sheetName = sname;
      rowId = rid;
      rowIndex = rindex;
      colId = cid;
      colIndex = cindex;
      cell = c;
    }
  }
}
