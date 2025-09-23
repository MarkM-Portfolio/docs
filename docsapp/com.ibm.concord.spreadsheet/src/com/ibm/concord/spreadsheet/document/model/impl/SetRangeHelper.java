package com.ibm.concord.spreadsheet.document.model.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.builder.ToStringBuilder;
import org.apache.commons.lang.builder.ToStringStyle;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.document.message.RangeDataUtil;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.IMapEntryListener;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.Position;
import com.ibm.json.java.JSONObject;

/**
 * <p>
 * Class to implement setunnamedrange event.
 * <h1>setunnamedrange event summary</h1>
 * <h2>1, Event sources and data flag and misc attributes, from client side's view</h2>
 * <table border="1px">
 * <tr>
 * <th>Source JS</th>
 * <th>Functionality</th>
 * <th>Attributes</th>
 * </tr>
 * <tr>
 * <td>ImportHelper.js</td>
 * <td>???</td>
 * <td>bR: true</td>
 * </tr>
 * <tr>
 * <td>UndoManager.js</td>
 * <td>Cut Rows</td>
 * <td>
 * <li>bR: true
 * <li>bRow: true</td>
 * </tr>
 * <tr>
 * <td rowspan="2">Base.js</td>
 * <td>Range Style</td>
 * <td>style: ...</td>
 * </tr>
 * <tr>
 * <td>Auto Fill</td>
 * <td>
 * <li>bR: true
 * <li>ignoreFilteredRow: true</td>
 * </tr>
 * <tr>
 * <td rowspan="4">Clipboard.js</td>
 * <td>
 * <li>Paste colspanned cell
 * <li>AND Cut & Paste cell</td>
 * <td>bR: true</td>
 * </tr>
 * <tr>
 * <td>Paste Column</td>
 * <td>
 * <li>bR: true
 * <li>bCol: true
 * <li>style: ...
 * <li>width: ...</td>
 * </tr>
 * <tr>
 * <td>Paste Row</td>
 * <td>
 * <li>bR: true
 * <li>bRow: true
 * </tr>
 * <tr>
 * <td>Paste Range</td>
 * <td>
 * <li>bR: true
 * <li>bCut: true (only for cut message, to clear whole range)
 * </tr>
 * 
 * </table>
 * <h2>Data JSON format</h2>
 * 
 * <pre>
 * <code>
 * "rows": {
 *  "(1 based row index)": {
 *      "cells": {
 *          "(A based column index)": { ... }
 *          ...
 *      }
 *      "height": ...
 *      "visibility": ...
 *      "repeatednum": ...
 *  }
 * }
 * </code>
 * </pre>
 */
public class SetRangeHelper
{
  private static final Logger LOG = Logger.getLogger(SetRangeHelper.class.getName());

  private static final int MAX_REF_ROW_NUM;
  
  private static final int INVALID_VALUE = -255;

  private Document document;

  private Sheet sheet;

  private JSONObject rangeData;

  private boolean isReplace, isRow, isColumn, isIgnoringFiltered, isInsertColumn, forAll;

  private RowMerger rowMerger;

  private CellMerger cellMerger;

  private ColumnCellMerger columnCellMerger;

  private ColumnMerger columnMerger;

  public SetRangeHelper(Document d)
  {
    document = d;

    rowMerger = new RowMerger();
    cellMerger = new CellMerger();

    columnMerger = new ColumnMerger();

    isInsertColumn = false;
  }

  public Map<String, Map<String, Object>> orgColumnData(JSONObject columnStyle, JSONObject columnWidth, JSONObject columnVis,
      JSONObject columnRN)
  {
    Map<String, Map<String, Object>> cols = new HashMap<String, Map<String, Object>>();

    if (columnStyle != null)
    {
      for (Object _colName : columnStyle.keySet())
      {
        String colName = (String) _colName;
        Map<String, Object> map = new HashMap<String, Object>();
        map.put(ConversionConstant.STYLE, columnStyle.get(_colName));
        cols.put(colName, map);
      }
    }
    if (columnWidth != null)
    {
      for (Object _colName : columnWidth.keySet())
      {
        String colName = (String) _colName;
        Map<String, Object> map = cols.get(colName);
        if (map == null)
        {
          map = new HashMap<String, Object>();
          map.put(ConversionConstant.WIDTH, columnWidth.get(_colName));
          cols.put(colName, map);
        }
        else
        {
          map.put(ConversionConstant.WIDTH, columnWidth.get(_colName));
        }
      }
    }
    if (columnVis != null)
    {
      for (Object _colName : columnVis.keySet())
      {
        String colName = (String) _colName;
        Map<String, Object> map = cols.get(colName);
        if (map == null)
        {
          map = new HashMap<String, Object>();
          map.put(ConversionConstant.VISIBILITY, columnVis.get(_colName));
          cols.put(colName, map);
        }
        else
        {
          map.put(ConversionConstant.VISIBILITY, columnVis.get(_colName));
        }
      }
    }

    if (columnRN != null)
    {
      for (Object _colName : columnRN.keySet())
      {
        String colName = (String) _colName;
        Map<String, Object> map = cols.get(colName);
        Number rn = (Number) columnRN.get(_colName);
        if (map == null)
        {
          map = new HashMap<String, Object>();
          map.put(ConversionConstant.REPEATEDNUM, rn);
          cols.put(colName, map);
        }
        else
        {
          map.put(ConversionConstant.REPEATEDNUM, rn);
        }
      }
    }
    return cols;
  }

  public void applySetRangeMessage(ParsedRef ref, JSONObject data)
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.entering(SetRangeHelper.class.getName(), "applySetRangeMessage", new Object[] { ref, data });
    }

    sheet = document.getSheetByName(ref.getSheetName());

    if (sheet == null)
    {
      LOG.log(Level.WARNING, "SetRange on an sheet {0} that not exist.", ref.getSheetName());
      return;
    }

    // all flags used in data
    Object o = data.get(ConversionConstant.IS_REPLACE);
    isReplace = o == null ? false : ((Boolean) o).booleanValue();

    //TODO: if isReplace, remove all the coverInfo totally in ref
    o = data.get(ConversionConstant.IS_ROW);
    isRow = o == null ? false : ((Boolean) o).booleanValue();

    o = data.get(ConversionConstant.IS_COLUMN);
    isColumn = o == null ? false : ((Boolean) o).booleanValue();

    o = data.get(ConversionConstant.IS_FOLLOW_PART);
    boolean isFollowPart = o == null ? false : ((Boolean) o).booleanValue();

    o = data.get(ConversionConstant.IGNORE_FILTER_ROW);
    isIgnoringFiltered = o == null ? false : ((Boolean) o).booleanValue();

    forAll = isRow && isColumn;

    RangeDataUtil.transformData(data, false);

    int startCol, endCol, startRow, endRow;
    if (ref.type == ParsedRefType.CELL)
    {
      startRow = ref.getIntStartRow();
      endRow = startRow;
      startCol = ref.getIntStartCol();
      endCol = startCol;
    }
    else if (ref.type == ParsedRefType.COLUMN || isColumn)
    {
      if (ref.type == ParsedRefType.RANGE)
      {
        startRow = ref.getIntStartRow();
        endRow = ref.getIntEndRow();
      }
      else
      {
        startRow = 1;
        endRow = ConversionConstant.MAX_ROW_NUM;
      }
      startCol = ref.getIntStartCol();
      endCol = ref.getIntEndCol();
    }
    else if (ref.type == ParsedRefType.ROW)
    {
      // row reference
      startRow = ref.getIntStartRow();
      endRow = ref.getIntEndRow();
      startCol = 1;
      endCol = ConversionConstant.MAX_COL_NUM;
    }
    else
    {
      startRow = ref.getIntStartRow();
      endRow = ref.getIntEndRow();
      startCol = ref.getIntStartCol();
      endCol = ref.getIntEndCol();
    }

    rowMerger.setStartIndex(startRow);
    rowMerger.setEndIndex(endRow);
    cellMerger.setStartIndex(startCol);
    cellMerger.setEndIndex(endCol);

    rangeData = data;

    if( isReplace ) 
    {
      // for cut/copy paste, split the merged cells in the original range
      if (isColumn) 
      {
        List<Row> rows = sheet.getRows();
        int length = rows.size();
        for(int i = 0 ; i < length ; i++)
        {
          Row row = rows.get(i);
          row.deleteCoverCells(startCol, endCol, true);
        }
      } else 
      {
        sheet.deleteCoverCells(startRow, endRow, startCol, endCol, true);
      }
    }
    if (isColumn && !isFollowPart)
    {
      columnMerger.setStartIndex(startCol);
      columnMerger.setEndIndex(endCol);

      JSONObject columnsData = (JSONObject) data.get(ConversionConstant.COLUMNS);
      List<BasicModel> eventRows = new ArrayList<BasicModel>();
      if (columnsData != null)
        ModelHelper.iterateMap(columnsData, new ColumnsListener(eventRows));
      columnMerger.setEventList(eventRows);

      columnMerger.doMerge();
    }

    JSONObject rowsData = (JSONObject) data.get(ConversionConstant.ROWS);

    if (rowsData == null)
    {
      // no rows data provided, nothing to do
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.exiting(SetRangeHelper.class.getName(), "applySetRangeMessage, no rows data.");
      }

      return;
    }

    if (!isReplace && !isInsertColumn)
    {
      // only need to merge column styles to cells when set(merge) style, and is not UNDO DELETE column(in which case isReplace is also
      // false)
      columnCellMerger = new ColumnCellMerger();
      columnCellMerger.setStartIndex(startCol);
      columnCellMerger.setEndIndex(endCol);
      columnCellMerger.setEventList(sheet.getColumns());
    }

    List<BasicModel> eventRows = new ArrayList<BasicModel>();
    // arrange rows
    ModelHelper.iterateMap(rowsData, new RowsListener(eventRows));
    rowMerger.setEventList(eventRows);
    if (LOG.isLoggable(Level.FINEST))
    {
      LOG.log(Level.FINEST, "Row data arranged as {0}.", eventRows);
    }

    if (LOG.isLoggable(Level.FINEST))
    {
      LOG.log(Level.FINEST, "setRange current status {0}.", toString());
    }

    rowMerger.doMerge();

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.exiting(SetRangeHelper.class.getName(), "applySetRangeMessage");
    }
  }

  /**
   * Set current status as inserting column, i.e. UNDO DELETE a column. When this flag is set, by current design, no other flags (isReplace,
   * etc) is set.
   * 
   * @param isInsertColumn
   */
  public void setInsertColumn(boolean isInsertColumn)
  {
    this.isInsertColumn = isInsertColumn;
  }

  @Override
  public String toString()
  {
    return new ToStringBuilder(this, ToStringStyle.SHORT_PREFIX_STYLE).append("sheetName", sheet.getSheetName()) //
        .append("rowMerger", rowMerger) //
        .append("cellMerger", cellMerger) //
        .append("rangeData", rangeData) //
        .append("isReplace", isReplace) //
        .append("isRow", isRow) //
        .append("isColumn", isColumn) //
        .append("isIgnoreingFiltered", isIgnoringFiltered) //
        .append("isInsertColumn", isInsertColumn) //
        .toString();
  }

  public class ColumnStruct extends BasicModel
  {
    public int index;

    public int repeat;

    public int width;

    public Visibility vis;

    public JSONObject style;

    public ColumnStruct(int i, Map<String, Object> data)
    {
      index = i;
      Object o = data.get(ConversionConstant.REPEATEDNUM);
      repeat = o == null ? 0 : ((Number) o).intValue();
      style = (JSONObject) data.get(ConversionConstant.STYLE);

      if (data.containsKey(ConversionConstant.WIDTH))
      {
        o = data.get(ConversionConstant.WIDTH);
        if (o == null)
        {
          width = -1;
        }
        else
        {
          width = ((Number) o).intValue();
        }
      }
      else
      {
    	width = INVALID_VALUE;
      }

      if (data.containsKey(ConversionConstant.VISIBILITY))
      {
        o = data.get(ConversionConstant.VISIBILITY);
        if (o == null)
        {
          vis = Visibility.VISIBLE;
        }
        else
        {
          vis = Visibility.toVisibility((String) o);
        }
      }
    }

    @Override
    public int getIndex()
    {
      return index;
    }

    @Override
    public int getRepeatedNum()
    {
      return repeat;
    }

    @Override
    public void setRepeatedNum(int num)
    {

    }

    @Override
    public Object getParent()
    {
      return null;
    }

    @Override
    public boolean isMergable(BasicModel model)
    {
      return false;
    }

    @Override
    public void remove()
    {
      // TODO Auto-generated method stub
      
    }

  }

  public class RowStruct extends BasicModel
  {
    public int index;

    public int repeat;

    public int height;

    public Visibility vis;

    public List<BasicModel> cells;

    public RowStruct(int i, JSONObject data)
    {
      index = i;
      Object o = data.get(ConversionConstant.REPEATEDNUM);
      repeat = o == null ? 0 : ((Number) o).intValue();

      o = data.get(ConversionConstant.CELLS);
      if (o != null)
      {
        cells = new ArrayList<BasicModel>();
        ModelHelper.iterateMap((JSONObject) o, new CellsListener(cells));
      }

      o = data.get(ConversionConstant.HEIGHT);
      if (o == null)
      {
        height = -1;
      }
      else
      {
        height = ((Number) o).intValue();
      }

      if (data.containsKey(ConversionConstant.VISIBILITY))
      {
        o = data.get(ConversionConstant.VISIBILITY);
        if (o == null)
        {
          vis = Visibility.VISIBLE;
        }
        else
        {
          vis = Visibility.toVisibility((String) o);
        }
      }
    }

    @Override
    public int getIndex()
    {
      return index;
    }

    @Override
    public int getRepeatedNum()
    {
      return repeat;
    }

    @Override
    public void setRepeatedNum(int num)
    {
      ;
    }

    @Override
    public Object getParent()
    {
      return null;
    }

    @Override
    public boolean isMergable(BasicModel model)
    {
      return false;
    }

    public String toString()
    {
      ToStringBuilder b = new ToStringBuilder(this, ToStringStyle.SHORT_PREFIX_STYLE);
      b.append("index", getIndex()); //
      b.append("repeat", getRepeatedNum()); //
      b.append("height", height);
      b.append("vis", vis);
      return b.toString();
    }
    @Override
    public void remove()
    {
    }
  }

  public class CellStruct extends BasicModel
  {
    public int index;

    public int repeat;

    public JSONObject cellData;

    public CellStruct(int i, JSONObject o)
    {
      index = i;
      Object v = o.get(ConversionConstant.REPEATEDNUM);
      repeat = (v == null) ? 0 : ((Number) v).intValue();
      cellData = o;
    }

    @Override
    public int getIndex()
    {
      return index;
    }

    @Override
    public int getRepeatedNum()
    {
      return repeat;
    }

    @Override
    public void setRepeatedNum(int num)
    {
      ;
    }

    @Override
    public Object getParent()
    {
      return null;
    }

    @Override
    public boolean isMergable(BasicModel model)
    {
      return false;
    }

    public String toString()
    {
      ToStringBuilder b = new ToStringBuilder(this, ToStringStyle.SHORT_PREFIX_STYLE);
      b.append("index", getIndex()); //
      b.append("repeat", getRepeatedNum()); //
      b.append("data", cellData);
      return b.toString();
    }

    @Override
    public void remove()
    {
      // TODO Auto-generated method stub
      
    }
  }

  private class ColumnsListener implements IMapEntryListener<String, Map<String, Object>>
  {
    private List<BasicModel> list;

    public ColumnsListener(List<BasicModel> l)
    {
      list = l;
    }

    public boolean onEntry(String key, Map<String, Object> value)
    {
      int index = ReferenceParser.translateCol(key);

      ColumnStruct column = new ColumnStruct(index, value);

      Position p = ModelHelper.search(list, index);
      if (p.isFind)
      {
        // oops, error
        LOG.log(Level.WARNING, "Range message contains duplicated row, {0}: {1}", new Object[] { key, value });
      }
      else
      {
        ModelHelper.insert(list, column, p.index + 1);
      }

      return false;
    }
	
  }

  private class RowsListener implements IMapEntryListener<String, JSONObject>
  {
    private List<BasicModel> list;

    public RowsListener(List<BasicModel> l)
    {
      list = l;
    }

    public boolean onEntry(String key, JSONObject value)
    {
      int index = Integer.parseInt(key);

      RowStruct row = new RowStruct(index, value);

      Position p = ModelHelper.search(list, index);
      if (p.isFind)
      {
        // oops, error
        LOG.log(Level.WARNING, "Range message contains duplicated row, {0}: {1}", new Object[] { key, value });
      }
      else
      {
        ModelHelper.insert(list, row, p.index + 1);
      }

      return false;
    }
  }

  private class CellsListener implements IMapEntryListener<String, JSONObject>
  {
    private List<BasicModel> list;

    public CellsListener(List<BasicModel> l)
    {
      list = l;
    }

    public boolean onEntry(String key, JSONObject value)
    {
      int index = ReferenceParser.translateCol(key);
      CellStruct cs = new CellStruct(index, value);
      Position p = ModelHelper.search(list, index);
      if (p.isFind)
      {
        LOG.log(Level.WARNING, "Range message contains duplicated cell, {0}: {1}", new Object[] { key, value });
      }
      else
      {
        ModelHelper.insert(list, cs, p.index + 1);
      }
      return false;
    }
  }

  private class ColumnMerger extends AbstractMerger
  {

    private List<Column> modelColumns;

    private int pModelColumns;

    private Column currentColumn;

    @Override
    protected void onStart()
    {
      modelColumns = sheet.getColumns();

      // find start
      Position pos = ModelHelper.search(modelColumns, start);
      if (pos.isFind)
      {
        pModelColumns = pos.index;
        pModelColumns = ModelHelper.divide(modelColumns, pModelColumns, start);
      }
      else
      {
        pModelColumns = pos.index + 1;
      }

      if (pModelColumns < modelColumns.size())
      {
        currentColumn = modelColumns.get(pModelColumns);
      }
      else
      {
        currentColumn = null;
      }
    }

    @Override
    protected int getModelIndex()
    {
      return currentColumn.getIndex();
    }

    @Override
    protected boolean hasNextModel()
    {
      return currentColumn != null;
    }

    @Override
    protected void createModel(BasicModel event, int repeat)
    {
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.entering(SetRangeHelper.ColumnMerger.class.getName(), "createModel", new Object[] { event, repeat });
      }

      if (index > ConversionConstant.MAX_COL_NUM)
      {
        // going to create a row in a very large index, ignore it
        if (LOG.isLoggable(Level.INFO))
        {
          LOG.log(Level.FINEST, "cannot create a model in a index {0} that is over {1}.", new Object[] { index,
              ConversionConstant.MAX_COL_NUM });
        }

        if (LOG.isLoggable(Level.FINER))
        {
          LOG.exiting(SetRangeHelper.ColumnMerger.class.getName(), "createModel, exit due to index over MAX");
        }

        return;
      }

      Column column = null;

      if (event == null)
      {
      }
      else
      {
        ColumnStruct eventColumn = (ColumnStruct) event;
        int id = sheet.getIDManager().getColIdByIndex(sheet.getId(), index, true);
        column = new Column(sheet, id);
        column.setRepeatedNum(repeat);
        ModelHelper.insert(modelColumns, column, pModelColumns);
        // if sheet is protected, set the column unlocked
        if(sheet.isSheetProtected() && sheet.getStyleManager().getDefaultLockedAttr()){
        	JSONObject styleJson = new JSONObject();
        	styleJson.put(ConversionConstant.STYLE_UNLOCKED, true);
        	column.setStyle(sheet.getStyleManager().addStyle(styleJson));
        }
        mergeColAttr(eventColumn, column);
        // created model is inserted before pModelRows, pModelRows should increase after the creation
        pModelColumns++;
      }

      if (LOG.isLoggable(Level.FINER))
      {
        LOG.exiting(SetRangeHelper.ColumnMerger.class.getName(), "createModel", column);
      }
    }

    @Override
    protected void divideModel(int end)
    {
      if (currentColumn.getIndex() + currentColumn.getRepeatedNum() > end)
      {
        ModelHelper.divide(modelColumns, pModelColumns, end + 1);
      }
    }

    @Override
    protected int changeModel(BasicModel event)
    {
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.entering(SetRangeHelper.ColumnMerger.class.getName(), "changeModel", new Object[] { event });
      }

      int repeat = currentColumn.getRepeatedNum();
      pModelColumns++;

      Column column = currentColumn;
      if (pModelColumns < modelColumns.size())
      {
        currentColumn = modelColumns.get(pModelColumns);
      }
      else
      {
        currentColumn = null;
      }

      ColumnStruct eventColumn = (ColumnStruct) event;

      if (isReplace)
      {
    	// if sheet is protected, set the column unlocked
        if(sheet.isSheetProtected() && sheet.getStyleManager().getDefaultLockedAttr()){
        	JSONObject styleJson = new JSONObject();
        	styleJson.put(ConversionConstant.STYLE_UNLOCKED, true);
        	column.setStyle(sheet.getStyleManager().addStyle(styleJson));
        }
        else
        	column.setStyle(null);
        column.setVisibility(null);
        column.setWidth(-1);
      }

      if (event != null)
      {
        mergeColAttr(eventColumn, column);
      }

      if (LOG.isLoggable(Level.FINER))
      {
        LOG.exiting(SetRangeHelper.ColumnMerger.class.getName(), "changeModel", repeat);
      }

      return repeat;
    }

    private void mergeColAttr(ColumnStruct data, Column column)
    {
      JSONObject columnStyle = data.style;
      int columnIndex = column.getIndex();
      if (columnStyle == null)
      {
        // for merge, do nothing
      }
      else
      {
        if (column.getStyle() == null)
        {
          column.setStyle(sheet.getStyleManager().addStyle(columnStyle));
        }
        else
        {
          column.setStyle(sheet.getStyleManager().changeStyle(column.getStyle(), columnStyle));
        }
        // sheet.mergeColumnStyle(columnIndex, columnStyle);
      }

      if (data.width >= -1)
        column.setWidth(data.width);
      if (data.vis != null)
        column.setVisibility(data.vis);
    }

  }

  // used for no-replace, to merge column style to cells
  private class ColumnCellMerger extends AbstractMerger
  {
    private int pColumnStart, pStyleCell;

    private Row row;

    private List<StyleCell> styleCells;

    private StyleCell currentStyleCell;

    private boolean isColumnsEmpty;

    public ColumnCellMerger()
    {
      pColumnStart = -1;
    }

    @Override
    protected void onStart()
    {
      if (pColumnStart == -1)
      {
        Position pos = ModelHelper.search(events, start);
        if (pos.isFind)
        {
          pColumnStart = pos.index;
          // split the column to fit in abstract doMerge() alg
          pColumnStart = ModelHelper.divide(events, pColumnStart, start);
        }
        else
        {
          pColumnStart = pos.index + 1;
        }
      }

      // change pEvent to begin with the first column in the setting range
      pEvent = pColumnStart;

      styleCells = row.getStyleCells();
      Position pos = ModelHelper.search(styleCells, start);
      if (pos.isFind)
      {
        pStyleCell = pos.index;
        pStyleCell = ModelHelper.divide(styleCells, pStyleCell, start);
      }
      else
      {
        pStyleCell = pos.index + 1;
      }

      if (pStyleCell < styleCells.size())
      {
        currentStyleCell = styleCells.get(pStyleCell);
      }
      else
      {
        currentStyleCell = null;
      }
    }

    @Override
    protected int getModelIndex()
    {
      return currentStyleCell.getIndex();
    }

    @Override
    protected boolean hasNextModel()
    {
      return currentStyleCell != null;
    }

    @Override
    protected void createModel(BasicModel event, int repeat)
    {
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.entering(SetRangeHelper.ColumnCellMerger.class.getName(), "createModel", new Object[] { event, index, repeat });
      }

      Column column = (Column) event;

      if (column != null && column.getStyle() != null)
      {
        // create style cell containing column's style
        int id = sheet.getIDManager().getColIdByIndex(sheet.getId(), index, true);
        StyleCell sc = new StyleCell(row, id);
        sc.setRepeatedNum(repeat);
        sc.setStyle(column.getStyle());
        ModelHelper.insert(styleCells, sc, pStyleCell);

        pStyleCell++;
      }
      // else, column is null, nothing to do

      if (LOG.isLoggable(Level.FINER))
      {
        LOG.exiting(SetRangeHelper.ColumnCellMerger.class.getName(), "createModel");
      }
    }

    @Override
    protected void divideModel(int end)
    {
      if (currentStyleCell.getIndex() + currentStyleCell.getRepeatedNum() > end)
      {
        ModelHelper.divide(styleCells, pStyleCell, end + 1);
      }
    }

    @Override
    protected int changeModel(BasicModel event)
    {
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.entering(SetRangeHelper.ColumnCellMerger.class.getName(), "changeModel", new Object[] { event });
      }

      int repeat = currentStyleCell.getRepeatedNum();

      Column column = (Column) event;

      if (column != null && column.getStyle() != null)
      {
        if (currentStyleCell.getStyle() == null)
        {
          currentStyleCell.setStyle(((Column) event).getStyle());
        }
        // else, style cell has style, don't put column style to it
      }
      // else, column is null, nothing to do

      if (pStyleCell + 1 < styleCells.size())
      {
        currentStyleCell = styleCells.get(++pStyleCell);
        if (LOG.isLoggable(Level.FINEST))
        {
          LOG.log(Level.FINEST, "pStyleCell moved to index {0}, current style cell {1}.", new Object[] { pStyleCell, currentStyleCell });
        }
      }
      else
      {
        currentStyleCell = null;
      }

      if (LOG.isLoggable(Level.FINER))
      {
        LOG.exiting(SetRangeHelper.ColumnCellMerger.class.getName(), "changeModel", repeat);
      }

      return repeat;
    }

    public void setRow(Row row)
    {
      this.row = row;
    }
  }

  private class CellMerger extends AbstractMerger
  {
    private List<ValueCell> valueCells;

    private List<StyleCell> styleCells;

    private List<CoverInfo> covers;

    private ValueCell currentValueCell;

    private StyleCell currentStyleCell;

    private int pValueCell, pStyleCell, pCover, coverLock;

    private Row row;

    public void setRow(Row row)
    {
      valueCells = row.getValueCells();
      styleCells = row.getStyleCells();
      covers = row.getCoverList();
      coverLock = 0;
      this.row = row;
    }

    @Override
    protected void onStart()
    {
      Position pos;
      if (isReplace || isInsertColumn)
      {
        pos = ModelHelper.search(valueCells, start);
        if (pos.isFind)
        {
          pValueCell = pos.index;
        }
        else
        {
          pValueCell = pos.index + 1;
        }

        if (pValueCell < valueCells.size())
        {
          currentValueCell = valueCells.get(pValueCell);
        }

        pos = ModelHelper.search(covers, start);
        if (pos.isFind)
        {
          pCover = pos.index;
        }
        else
        {
          pCover = pos.index + 1;
        }

        if (!isInsertColumn)
        {
          if (pCover < covers.size() && covers.get(pCover).getIndex() <= end)
          {
            // clear all the cover info cells ahead, since covers can't be divided so should break all model covers on start
            for (covers.remove(pCover); pCover < covers.size() && covers.get(pCover).getIndex() <= end; covers.remove(pCover))
              ;
          }
          // else, pCover already beyond covers, no cover ahead
        }
        // else, do nothing for insert column, covers will be enlarged if needed (if message contains "ic": true),
      }
      // else, no need to care about value cells and covers when is not replace

      if (columnCellMerger != null && !columnCellMerger.isColumnsEmpty)
      {
        // for not replace, put column style to cells
        columnCellMerger.setRow(row);
        columnCellMerger.doMerge();
      }

      pos = ModelHelper.search(styleCells, start);
      if (pos.isFind)
      {
        pStyleCell = pos.index;
        if (isInsertColumn)
        {
          StyleCell sc = styleCells.get(pStyleCell);
          if (sc.getIndex() < start)
          {
            // stylecell across inserted column, increase repeat
            sc.setRepeatedNum(sc.getRepeatedNum() + 1);
            pStyleCell = ModelHelper.divide(styleCells, pStyleCell, start);
          }
        }
        else
        {
          pStyleCell = ModelHelper.divide(styleCells, pStyleCell, start);
        }
      }
      else
      {
        pStyleCell = pos.index + 1;
      }

      if (pStyleCell < styleCells.size())
      {
        currentStyleCell = styleCells.get(pStyleCell);
      }
    }

    @Override
    protected int getModelIndex()
    {
      // return the smallest index of the value cell, style cell and cover
      int index = Integer.MAX_VALUE;
      if (currentValueCell != null)
      {
        index = currentValueCell.getIndex();
      }

      if (currentStyleCell != null)
      {
        index = Math.min(index, currentStyleCell.getIndex());
      }

      return index;
    }

    @Override
    protected boolean hasNextModel()
    {
      // at least one of the model is not null
      return (currentValueCell != null || currentStyleCell != null);
    }

    @Override
    protected void createModel(BasicModel event, int repeat)
    {
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.entering(SetRangeHelper.CellMerger.class.getName(), "createModel", new Object[] { event, index, repeat });
      }

      // no any model fit for current event, create models
      if (event == null)
      {
        if (isReplace)
        {
          if (isColumn)
          {
            // for paste column message, don't create dcs cells to let cell show column style
            ;
          }
          else
          {
            // for replace, null event, create cells with dcs
            int id = sheet.getIDManager().getColIdByIndex(sheet.getId(), index, true);
            if(sheet.isSheetProtected() && sheet.getStyleManager().getDefaultLockedAttr()){
            	JSONObject styleJson = new JSONObject();
            	styleJson.put(ConversionConstant.STYLE_UNLOCKED, true);
            	newStyleCell(sheet.getStyleManager().addStyle(styleJson), repeat, id);
            }
            else
            	newStyleCell(sheet.getStyleManager().getDefaultCellStyle(), repeat, id);
          }
        }
        // else for insert column, don't create dcs cells, nothing to do
        // else for merge, null event, nothing to do
      }
      else
      {
        // has event data
        CellStruct eventCell = (CellStruct) event;
        JSONObject cellData = eventCell.cellData;
        int id = sheet.getIDManager().getColIdByIndex(sheet.getId(), index, true);
        if (isReplace || isInsertColumn)
        {
          // for value and covers
          Object value = cellData.get(ConversionConstant.VALUE);
          Object link = cellData.get(ConversionConstant.LINK);
          if (value != null || link != null)
          {
            ValueCell vc = new ValueCell(row, id);
            vc.setValue(value, true);
            vc.setLink((String) link);
            ModelHelper.insert(valueCells, vc, pValueCell);

            pValueCell++;
          }
          int colspan = 1;
          int rowspan = 1;
          Object colspanObj = cellData.get(ConversionConstant.COLSPAN);
          if (colspanObj != null)
          {
            colspan = Integer.parseInt(colspanObj.toString());
          }
          Object rowspanObj = cellData.get(ConversionConstant.ROWSPAN);
          if (rowspanObj != null)
          {
            rowspan = Integer.parseInt(rowspanObj.toString());
          }
          if(colspan > 1 || rowspan > 1)
            newCover(colspan, rowspan, id);
          // else, no cover to set

          if (isInsertColumn)
          {
            // for insert columns, if insert an "ic: true" cell, need to enlarge cover before it
            Object iscovered = cellData.get(ConversionConstant.ISCOVERED);
            if (index > coverLock && iscovered != null && ((Boolean) iscovered))
            {
              enlargeCover(eventCell.repeat);
            }
            // else, no action
          }
          // else, no action
        }
        // else, don't care about value and covers when is not replace

        // for style, has style data
        JSONObject styleJson = (JSONObject) cellData.get(ConversionConstant.STYLE);
        if (styleJson == null)
        {
          if (isReplace)
          {
            if (isColumn)
            {
              // for paste column message, don't create dcs cells to let cell show column style
              ;
            }
            else
            {
              // for replace, null event, create cells with dcs
        	 if(sheet.isSheetProtected() && sheet.getStyleManager().getDefaultLockedAttr()){
        		JSONObject style = new JSONObject();
        		style.put(ConversionConstant.STYLE_UNLOCKED, true);
             	newStyleCell(sheet.getStyleManager().addStyle(style), repeat, id);
        	 }
             else
            	newStyleCell(sheet.getStyleManager().getDefaultCellStyle(), repeat, id);
            }
          }
          // else, for insert column, don't create dcs cell, nothing to do
          // else, for merge, nothing to do
        }
        else
        {
          StyleObject so = sheet.getStyleManager().addStyle(styleJson);
          if(sheet.isSheetProtected() && sheet.getStyleManager().getDefaultLockedAttr()){
	          JSONObject delta = new JSONObject();
	          delta.put(ConversionConstant.STYLE_UNLOCKED, true);
	          so = sheet.getStyleManager().changeStyle(so, delta);
          }
          if (so == null)
          {
            // we had a style, but all attributes are removed so null is returned, use dcs instead
            // if use null here, if has a column style, column style is shown which is wrong, considering
            // we actually had a style
	    	  if(sheet.isSheetProtected() && sheet.getStyleManager().getDefaultLockedAttr()){
	    		JSONObject style = new JSONObject();
	        	style.put(ConversionConstant.STYLE_UNLOCKED, true);
	            so = sheet.getStyleManager().addStyle(style);
	    	  }
	          else
	            so = sheet.getStyleManager().getDefaultCellStyle();
          }
          newStyleCell(so, repeat, id);
        }
      }

      if (LOG.isLoggable(Level.FINER))
      {
        LOG.exiting(SetRangeHelper.CellMerger.class.getName(), "createModel");
      }
    }

    @Override
    protected void divideModel(int end)
    {
      // only style cell needs divide
      if (currentStyleCell != null && currentStyleCell.getIndex() + currentStyleCell.getRepeatedNum() > end)
      {
        ModelHelper.divide(styleCells, pStyleCell, end + 1);
      }
    }

    @Override
    protected int changeModel(BasicModel event)
    {
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.entering(SetRangeHelper.CellMerger.class.getName(), "changeModel", new Object[] { event });
      }

      int repeat = 0;

      if (event == null)
      {
        if (isReplace)
        {
          if (currentStyleCell != null && currentStyleCell.getIndex() == index)
          {
            // has current style cell and event is null
            repeat = currentStyleCell.getRepeatedNum();
            if (isColumn)
            {
              // for paste column message, if event is null, means the cell should show column's style, clear its style to null
              currentStyleCell.setStyle(null);
            }
            else
            {
              // for replace, clear style cell
              if(sheet.isSheetProtected() && sheet.getStyleManager().getDefaultLockedAttr()){
            	  JSONObject style = new JSONObject();
            	  style.put(ConversionConstant.STYLE_UNLOCKED, true);
            	  currentStyleCell.setStyle(sheet.getStyleManager().addStyle(style));
              }
              else
                  currentStyleCell.setStyle(sheet.getStyleManager().getDefaultCellStyle());
            }
            nextStyleCell();
            // clear value cells from index till index + repeat
            clearValueCell(index + repeat);
          }
          else
          {
            // no style cell, must have value cell
            if (currentValueCell != null && currentValueCell.getIndex() == index)
            {
              repeat = 0;
              // clear current value cell
              clearValueCell(index);

              if (isColumn)
              {
                // for paste column message, don't create dcs cell, do nothing
                ;
              }
              else
              {
                // create a new style cell that has defautlcellstyle
                int id = sheet.getIDManager().getColIdByIndex(sheet.getId(), index, true);
                newStyleCell(sheet.getStyleManager().getDefaultCellStyle(), 0, id);
              }
            }
            // else, both value cell and style cell are null, never happens
          }
        }
        else if (isInsertColumn)
        {
          // for the case of undo delete column and is changing model, the only possible case is
          // current index has enlarged style cells, check the style cell
          if (currentStyleCell != null && currentStyleCell.getIndex() == index)
          {
            // since event is null, clear the style so the column style appears
            currentStyleCell.setStyle(null);
            repeat = currentStyleCell.getRepeatedNum();
            nextStyleCell();
          }
          else if (currentValueCell != null && currentValueCell.getIndex() == index)
          {
            // cannot happen, anyway, clear the value
            LOG.log(
                Level.WARNING,
                "UNDO DELETE column but with model value cell in cellMerger.changeModel(), cannot happen, clear the value cell anyway. {0}",
                currentValueCell);
            clearValueCell(index);
          }
        }
        else
        {
          // else, for merge, nothing to do, for merge, we only have style cell, skip the style cell
          repeat = currentStyleCell.getRepeatedNum();
          nextStyleCell();
        }
      }
      else
      {
        // has event data
        CellStruct eventCell = (CellStruct) event;
        JSONObject cellData = eventCell.cellData;
        int id = sheet.getIDManager().getColIdByIndex(sheet.getId(), index, true);

        if (isReplace || isInsertColumn)
        {
          // for value
          Object value = cellData.get(ConversionConstant.VALUE);
          Object link = cellData.get(ConversionConstant.LINK);
          if (value != null || link != null)
          {
            ValueCell vc;
            if (currentValueCell != null && currentValueCell.getIndex() == index)
            {
              vc = currentValueCell;
              nextValueCell();
            }
            else
            {
              vc = new ValueCell(row, id);
              ModelHelper.insert(valueCells, vc, pValueCell);
              pValueCell++;
            }
            vc.setValue(value, true);
            vc.setLink((String) link);
          }
          // no event value provided, leave the values alone, after
          // we make sure about the repeat, we clear all the value cells in the way

          // for covers
          int colspan = 1;
          int rowspan = 1;
          Object colspanObj = cellData.get(ConversionConstant.COLSPAN);
          if (colspanObj != null)
          {
            colspan = Integer.parseInt(colspanObj.toString());
          }
          Object rowspanObj = cellData.get(ConversionConstant.ROWSPAN);
          if (rowspanObj != null)
          {
            rowspan = Integer.parseInt(rowspanObj.toString());
          }
          if(colspan > 1 || rowspan > 1)
            newCover(colspan, rowspan, id);
          // else, no cover to set

          if (isInsertColumn)
          {
            // for insert columns, if insert an "ic: true" cell, need to enlarge cover before it
            Object iscovered = cellData.get(ConversionConstant.ISCOVERED);
            if (index > coverLock && iscovered != null && ((Boolean) iscovered))
            {
              enlargeCover(eventCell.repeat);
            }
            // else, no action
          }
          // else, no action

          // for style
          JSONObject styleJson = (JSONObject) cellData.get(ConversionConstant.STYLE);
          StyleObject so = null;
          if (styleJson != null)
          {
            so = new StyleObject(styleJson);
            so = sheet.getStyleManager().addStyle(so);
            if(sheet.isSheetProtected() && sheet.getStyleManager().getDefaultLockedAttr()){
            	JSONObject delta = new JSONObject();
            	delta.put(ConversionConstant.STYLE_UNLOCKED, true);
            	so = sheet.getStyleManager().changeStyle(so, delta);
            }
            if (so == null)
            {
              // we had a style, but all attributes are removed so null is returned, use dcs instead
              // if use null here, if has a column style, column style is shown which is wrong, considering
              // we actually had a style
              if(sheet.isSheetProtected() && sheet.getStyleManager().getDefaultLockedAttr()){
            	  JSONObject style = new JSONObject();
            	  style.put(ConversionConstant.STYLE_UNLOCKED, true);
            	  so = sheet.getStyleManager().addStyle(style);
              }
              else
            	  so = sheet.getStyleManager().getDefaultCellStyle();
            }
          }
          else
          {
            if (isColumn)
            {
              // for paste column message, clear style
              so = null;
            }
            else if (isInsertColumn)
            {
              // for insert column message, clear style
              so = null;
            }
            else
            {
              // clear style as dcs
              if(sheet.isSheetProtected() && sheet.getStyleManager().getDefaultLockedAttr()){
            	  JSONObject style = new JSONObject();
            	  style.put(ConversionConstant.STYLE_UNLOCKED, true);
            	  so = sheet.getStyleManager().addStyle(style);
              }
              else
            	  so = sheet.getStyleManager().getDefaultCellStyle();
            }
          }

          if (currentStyleCell != null && currentStyleCell.getIndex() == index)
          {
            currentStyleCell.setStyle(so);
            repeat = currentStyleCell.getRepeatedNum();
            nextStyleCell();
          }
          else
          {
            // no style cell at this index, but since we are in changeModel(), we must have a value cell here, so create
            // style cell with repeat num 0
            if (so != null)
            {
              newStyleCell(so, 0, id);
            }
            repeat = 0;
          }

          // clear all value cell from current index till index + repeat
          clearValueCell(index + repeat);
        }
        else
        {
          // for not replace and not insert column, only cares about style
          JSONObject styleJson = (JSONObject) cellData.get(ConversionConstant.STYLE);
          if (styleJson != null)
          {
            if (currentStyleCell.getStyle() == null)
            {
              currentStyleCell.setStyle(sheet.getStyleManager().addStyle(styleJson));
            }
            else
            {
              currentStyleCell.setStyle(sheet.getStyleManager().changeStyle(currentStyleCell.getStyle(), styleJson));
            }
          }
          // else, no style to set

          // although style may be null, still need to move styleCell pointer ahead
          // currentStyelCell must be not null and at the index
          repeat = currentStyleCell.getRepeatedNum();
          nextStyleCell();
        }
      }

      if (LOG.isLoggable(Level.FINER))
      {
        LOG.exiting(SetRangeHelper.CellMerger.class.getName(), "changeModel", repeat);
      }

      return repeat;
    }

    private void nextValueCell()
    {
      if (pValueCell + 1 < valueCells.size())
      {
        currentValueCell = valueCells.get(++pValueCell);
        if (LOG.isLoggable(Level.FINEST))
        {
          LOG.log(Level.FINEST, "pValueCell moved to {0}, current value cell {1}.", new Object[] { pValueCell, currentValueCell });
        }
      }
      else
      {
        currentValueCell = null;
      }
    }

    private void nextStyleCell()
    {
      if (pStyleCell + 1 < styleCells.size())
      {
        currentStyleCell = styleCells.get(++pStyleCell);
        if (LOG.isLoggable(Level.FINEST))
        {
          LOG.log(Level.FINEST, "pStyleCell moved to index {0}, current style cell {1}.", new Object[] { pStyleCell, currentStyleCell });
        }
      }
      else
      {
        currentStyleCell = null;
      }
    }

    // clear value cell start from current cell till end index
    private void clearValueCell(int end)
    {
      if (LOG.isLoggable(Level.FINEST))
      {
        LOG.log(Level.FINEST, "clear value cell till {0}.", new Object[] { end });
      }

      while (currentValueCell != null && currentValueCell.getIndex() <= end)
      {
        currentValueCell.setValue(null, true);
        currentValueCell.setLink(null);

        nextValueCell();
      }
    }

    private void newCover(int colspan, int rowspan, int id)
    {
      if (colspan > 1 || rowspan > 1)
      {
        if (LOG.isLoggable(Level.FINEST))
        {
          LOG.log(Level.FINEST, "new cover {0} {1}.", new Object[] { colspan, id });
        }
        
        CoverInfo cover = new CoverInfo(row, id, colspan, rowspan);
        int colIndex = cover.getIndex();
        ModelHelper.insert(covers, cover, pCover);
        sheet.insertCoverInfoInColumn(cover, -1, -1);
        if (colIndex + colspan - 1 > coverLock)
          coverLock = colIndex + colspan - 1;
        pCover++;
      }
      // else, no cover to set
    }
    // enlarge cover before index by 1, only for insert column
    private void enlargeCover(int coverRepeat)
    {
      List<Column> cols = sheet.getColumns();
      CoverInfo cover = null;
      //first check if this covered cell is belong to the inserted columns
      Position pos = ModelHelper.search(cols, index);
      if(pos.isFind)
      {
        Column coverCol = cols.get(pos.index);
        cover = coverCol.getCoverInfo(row.getIndex());
        if(cover != null)
          return;
      }
      // then check if it should be enlarged with the previous cover cell
      pos = ModelHelper.search(cols, index - 1);
      if (pos.isFind) 
      {
        Column coverCol = cols.get(pos.index);
        cover = coverCol.getCoverInfo(row.getIndex());
      }
      
      if (cover != null)
      {
        int startCol = cover.getIndex();
        if(startCol + cover.getColSpan() <= index){
          // enlarge cover by 1 to cover current index
          cover.setColSpan(index + coverRepeat + 1 - startCol);
          sheet.insertCoverInfoInColumn(cover, index, index + coverRepeat);
        }
      }
      else
      {
        // no valid cover found, create a cover to contain this "ic"
        newCover(2 + coverRepeat, 1, sheet.getIDManager().getColIdByIndex(sheet.getId(), index - 1, true));
      }
    }

    private void newStyleCell(StyleObject style, int repeat, int id)
    {
      if (LOG.isLoggable(Level.FINEST))
      {
        LOG.log(Level.FINEST, "new style cell {0} {1}.", new Object[] { repeat, id });
      }

      style = sheet.getStyleManager().addStyle(style);
      StyleCell sc = new StyleCell(row, id);
      sc.setStyle(style);
      sc.setRepeatedNum(repeat);
      ModelHelper.insert(styleCells, sc, pStyleCell);

      pStyleCell++;
    }
  }

  private class RowMerger extends AbstractMerger
  {
    private List<Row> modelRows;

    private int pModelRows;

    private Row currentRow;

    @Override
    protected void onStart()
    {
      modelRows = sheet.getRows();

      // find start
      Position pos = ModelHelper.search(modelRows, start);
      if (pos.isFind)
      {
        pModelRows = pos.index;
        pModelRows = ModelHelper.divide(modelRows, pModelRows, start);
      }
      else
      {
        pModelRows = pos.index + 1;
      }

      if (pModelRows < modelRows.size())
      {
        currentRow = modelRows.get(pModelRows);
      }
      else
      {
        currentRow = null;
      }
    }

    @Override
    protected int getModelIndex()
    {
      return currentRow.getIndex();
    }

    @Override
    protected boolean hasNextModel()
    {
      return currentRow != null;
    }

    @Override
    protected void createModel(BasicModel event, int repeat)
    {
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.entering(SetRangeHelper.RowMerger.class.getName(), "createModel", new Object[] { event, repeat });
      }

      if (index > MAX_REF_ROW_NUM)
      {
        // going to create a row in a very large index, ignore it
        if (LOG.isLoggable(Level.INFO))
        {
          LOG.log(Level.FINEST, "cannot create a row in a index {0} that is over {1}.", new Object[] { index, MAX_REF_ROW_NUM });
        }

        if (LOG.isLoggable(Level.FINER))
        {
          LOG.exiting(SetRangeHelper.RowMerger.class.getName(), "createModel, exit due to index over MAX");
        }

        return;
      }

      Row row = null;

      if (event == null)
      {
        if (isReplace)
        {
          // for replace, null event, create a blank row full of defaultcellstyle cells
          int id = sheet.getIDManager().getRowIdByIndex(sheet.getId(), index, true);
          row = new Row(sheet, id);
          row.setRepeatedNum(repeat);
          ModelHelper.insert(modelRows, row, pModelRows);
          cellMerger.setRow(row);
          cellMerger.setEventList(null);
          cellMerger.doMerge();
          // created model is inserted before pModelRows, pModelRows should increase after the creation
          pModelRows++;
        }
        // else for merge, null event, nothing to do;
      }
      else
      {
        RowStruct eventRow = (RowStruct) event;
        int id = sheet.getIDManager().getRowIdByIndex(sheet.getId(), index, true);
        row = new Row(sheet, id);
        row.setRepeatedNum(repeat);
        ModelHelper.insert(modelRows, row, pModelRows);
        cellMerger.setRow(row);
        cellMerger.setEventList(eventRow.cells);
        cellMerger.doMerge();
        if (isRow)
        {
          setRowProps(eventRow, row);
        }
        // created model is inserted before pModelRows, pModelRows should increase after the creation
        pModelRows++;
      }

      if (LOG.isLoggable(Level.FINER))
      {
        LOG.exiting(SetRangeHelper.RowMerger.class.getName(), "createModel", row);
      }
    }

    @Override
    protected void divideModel(int end)
    {
      if (currentRow.getIndex() + currentRow.getRepeatedNum() > end)
      {
        ModelHelper.divide(modelRows, pModelRows, end + 1);
      }
    }

    @Override
    protected int changeModel(BasicModel event)
    {
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.entering(SetRangeHelper.RowMerger.class.getName(), "changeModel", new Object[] { event });
      }

      int repeat = currentRow.getRepeatedNum();
      pModelRows++;

      Row row = currentRow;
      if (pModelRows < modelRows.size())
      {
        currentRow = modelRows.get(pModelRows);
      }
      else
      {
        currentRow = null;
      }

      if (isIgnoringFiltered && row.getVisibility() == Visibility.FILTER)
      {
        if (LOG.isLoggable(Level.FINER))
        {
          LOG.exiting(SetRangeHelper.RowMerger.class.getName(), "changeModel, exit change nothing due to isIgnoringFiltered is set.",
              repeat);
        }

        return repeat;
      }

      RowStruct eventRow = (RowStruct) event;

      if (event == null)
      {
        if (isReplace)
        {
          cellMerger.setRow(row);
          cellMerger.setEventList(null);
          cellMerger.doMerge();
        }
        // else, for merge, nothing to do
      }
      else
      {
        cellMerger.setRow(row);
        cellMerger.setEventList(((RowStruct) event).cells);
        cellMerger.doMerge();
      }

      if (isRow)
      {
        setRowProps(eventRow, row);
      }

      if (LOG.isLoggable(Level.FINER))
      {
        LOG.exiting(SetRangeHelper.RowMerger.class.getName(), "changeModel", repeat);
      }

      return repeat;
    }

    private void setRowProps(RowStruct eventRow, Row rowModel)
    {
      if (eventRow == null)
      {
        if (isReplace)
        {
          rowModel.setHeight(0);
          rowModel.setVisibility(null);
        }
        // else, for merge, do nothing
      }
      else
      {
        if (eventRow.height >= 0)
        {
          rowModel.setHeight(eventRow.height);
        }
        else
        {
          if (isReplace)
          {
            rowModel.setHeight(0);
          }
          // else, for merge, don't change height
        }

        if (eventRow.vis != null)
        {
          if (eventRow.vis == Visibility.VISIBLE)
          {
            rowModel.setVisibility(null);
          }
          else
          {
            rowModel.setVisibility(eventRow.vis);
          }
        }
        else
        {
          if (isReplace)
          {
            rowModel.setVisibility(null);
          }
          // else, for merge, don't change vis
        }
      }
    }
  }

  // Inner class that merges event model (instances that extends BasicModel) to document model
  // Glossary,
  // ** "event": event model
  // ** "model": document model
  // ** "p": prefix for variables means pointer to elements in an ordered list
  private abstract class AbstractMerger
  {
    protected int start, end;

    protected List<? extends BasicModel> events;

    // repeat number from event that going to be consumed by model
    protected int eventRepeat;

    // pointers
    protected int pEvent;

    // index
    protected int index;

    public void setStartIndex(int i)
    {
      start = i;
    }

    public void setEndIndex(int i)
    {
      end = i;
    }

    public void setEventList(List<? extends BasicModel> l)
    {
      events = l;
    }

    public String toString()
    {
      return new ToStringBuilder(this, ToStringStyle.SHORT_PREFIX_STYLE) //
          .append("start", start) //
          .append("end", end) //
          .append("event models", events).toString(); //
    }

    public void doMerge()
    {
      if (LOG.isLoggable(Level.FINER))
      {
        LOG.entering(SetRangeHelper.AbstractMerger.class.getName(), "doMerge");
      }

      if (LOG.isLoggable(Level.FINEST))
      {
        LOG.log(Level.FINEST, "current status, {0}", toString());
      }

      pEvent = 0;
      index = start;

      onStart();

      BasicModel event;
      int eventIndex;
      int modelIndex, modelRepeat;

      while (index <= end)
      {
        // pick up eventModel
        event = null;
        if (events != null && pEvent < events.size())
        {
          // more event models
          event = events.get(pEvent);
          eventIndex = event.getIndex();
          if (eventIndex > index)
          {
            // event model in gap, keep event model null and move index forward
            if (LOG.isLoggable(Level.FINEST))
            {
              LOG.log(Level.FINEST, "event index {0} after index {1}, events have gap, current event as null.", new Object[] { eventIndex,
                  index });
            }
            eventRepeat = eventIndex - index;
            eventIndex = index;
            event = null;
          }
          else if (eventIndex == index)
          {
            // event model right matches current index
            if (LOG.isLoggable(Level.FINEST))
            {
              LOG.log(Level.FINEST, "event {0} matches index {1}, forward pEvent to {2}.", new Object[] { event, index, pEvent + 1 });
            }
            eventRepeat = Math.min(event.getRepeatedNum() + 1, end - index + 1);
            pEvent++;
          }
          else
          {
        	if(pEvent == 0){
        		// set range event refValue might not match with the events
        		// start is decided by refValue, but events might out of refValue scope
        		// so set the start to the events first index and restart loop
        		index = start = eventIndex;
        		onStart();
        		continue;
        	}
            throw new IllegalStateException("event index " + eventIndex + " before index " + index + ", setRange in error.");
          }
        }
        else
        {
          // no more event models
          // event is null
          eventIndex = index;
          eventRepeat = end - index + 1;
          if (LOG.isLoggable(Level.FINEST))
          {
            LOG.log(Level.FINEST, "no more events after pEvent {0}, index {1}, null events repeats {2}", new Object[] { pEvent, index,
                eventRepeat });
          }
        }

        // consume event, decrease eventRepeat and increase index
        while (eventRepeat > 0)
        {
          if (hasNextModel())
          {
            modelIndex = getModelIndex();
            // since we looked down every index from start, we can't miss any model
            // so model index can be only greater than, or equal to index
            if (modelIndex > index)
            {
              modelRepeat = Math.min(modelIndex - index - 1, eventRepeat - 1);
              if (LOG.isLoggable(Level.FINEST))
              {
                LOG.log(Level.FINEST, "models has gap until model index {0}, create new model for current event, repeat {1}.",
                    new Object[] { modelIndex, modelRepeat });
              }
              createModel(event, modelRepeat);
              eventRepeat = eventRepeat - modelRepeat - 1;
              index += modelRepeat + 1;
            }
            else if (modelIndex == index)
            {
              if (LOG.isLoggable(Level.FINEST))
              {
                LOG.log(Level.FINEST, "matched model at index {0}, change model with current event.", new Object[] { modelIndex });
              }
              divideModel(index + eventRepeat - 1);
              // changeModel() returns repeat consumed, it includes the master model,
              // so the repeat is already +1
              modelRepeat = changeModel(event);
              eventRepeat = eventRepeat - modelRepeat - 1;
              index += modelRepeat + 1;
            }
            else
            {
              throw new IllegalStateException("model index " + modelIndex + " before index " + index + ", setRange in error.");
            }
          }
          else
          {
            if (LOG.isLoggable(Level.FINEST))
            {
              LOG.log(Level.FINEST, "no more models after index {0}.", index);
            }

            createModel(event, eventRepeat - 1);
            index += eventRepeat;
            eventRepeat = 0; // eventRepeat - (eventRepeat - 1) - 1
          }
        }
      }

      if (LOG.isLoggable(Level.FINER))
      {
        LOG.exiting(SetRangeHelper.AbstractMerger.class.getName(), "doMerge");
      }
    }

    // called when merging process starts
    protected abstract void onStart();

    // returns current model index, can only be called when has next model
    protected abstract int getModelIndex();

    // returns if current model list has next model
    protected abstract boolean hasNextModel();

    // create new model from event. the new model starts at current index and repeat to provided repeat
    protected abstract void createModel(BasicModel event, int repeat);

    // split current model to make sure the model end at or before index end.
    protected abstract void divideModel(int end);

    // change model by applying the event, returns repeat that consumed
    protected abstract int changeModel(BasicModel event);
  }

  static
  {
    int max = 1048576;

    if (ConversionConstant.MAX_REF_ROW_NUM > 0)
    {
      max = ConversionConstant.MAX_REF_ROW_NUM;
    }
    else
    {
      LOG.log(Level.WARNING,
          "max row constant not set in ConversionConstant, default to 1048576, should set this value before initializing SetRangeHelper.");
    }

    // actual max is 1 row after
    // when set columns happens, row has model in last row,
    // we need an additional row model in last row + 1 to keep the column style to repeat to
    // infinity
    MAX_REF_ROW_NUM = max + 1;
  }
}
