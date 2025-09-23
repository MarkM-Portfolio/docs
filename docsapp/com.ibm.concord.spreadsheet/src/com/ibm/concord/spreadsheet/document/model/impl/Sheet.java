package com.ibm.concord.spreadsheet.document.model.impl;

import java.lang.reflect.Method;
import java.util.ArrayList;

import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.builder.ToStringBuilder;
import org.apache.commons.lang.builder.ToStringStyle;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.EventSource;
import com.ibm.concord.spreadsheet.document.model.impl.BasicModel.Direction;
import com.ibm.concord.spreadsheet.document.model.impl.IDManager.IDStruct;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.impl.io.ModelIOFactory;
import com.ibm.concord.spreadsheet.document.model.impl.io.ModelIOFactory.LoadMode;
import com.ibm.concord.spreadsheet.document.model.impl.io.swap.IRawDataStorageAdapter;
import com.ibm.concord.spreadsheet.document.model.style.StyleManager;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.IMapEntryListener;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.Position;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Sheet
{
  private static final Logger LOG = Logger.getLogger(Sheet.class.getName());

  private int id;

  private String uuid;// only available if the sheet has been deleted

  private String sheetName;

  private List<Row> rows;

  private List<Column> columns;

  Document parent;

  private IDStruct idStruct;

  private Map<Integer, Map<Integer, FormulaCell>> formulaCellsMap;

  private IRawDataStorageAdapter rawMetaRows, rawContentRows;

  private int freezeRow;

  private int freezeCol;

  private int rowHeight;

  private String type;

  private boolean sheetProtected;

  private String dir = null;

  private String visibility;

  private String color;
  
  private boolean offGridLines;

  public Sheet(Document parent)
  {
    this(parent, IDManager.INVALID, null);
  }

  public Sheet(Document parent, int sheetId, String sheetName)
  {
    this.parent = parent;
    this.id = sheetId;
    this.sheetName = sheetName;
    this.columns = new ArrayList<Column>();
    if (ModelIOFactory.LOAD_MODE == LoadMode.ROWS_AS_STREAM)
    {
      // TODO, create list associated with raw data
      this.rows = new ArrayList<Row>();
    }
    else
    {
      this.rows = new ArrayList<Row>();
    }
    this.freezeRow = -1;
    this.freezeCol = -1;
    rowHeight = 0;
  }

  public Document getParent()
  {
    return this.parent;
  }

  public IDManager getIDManager()
  {
    return parent.getIDManager();
  }

  public StyleManager getStyleManager()
  {
    return this.parent.getStyleManager();
  }

  public int getIndex()
  {
    return this.getParent().getSheets().indexOf(this) + 1;
  }

  public List<Row> getRows()
  {
    return this.rows;
  }

  public List<Column> getColumns()
  {
    return this.columns;
  }

  /**
   * get row model according to the given rIndex
   * 
   * @param rIndex
   *          : 1-based
   * @return
   */
  public Row getRow(int rIndex)
  {
    if (rIndex <= 0)
      return null;
    Position pos = ModelHelper.search(this.rows, rIndex);
    if (pos.isFind)
      return this.rows.get(pos.index);
    return null;
  }

  public Position getRowPosition()
  {
    return null;
  }

  /**
   * create a row model according to the given rowIndex
   * 
   * @param rIndex
   *          : 1-based
   * @return
   */
  public Row createRow(int rIndex)
  {
    if (rIndex <= 0)
      return null;
    int rId = this.getIDManager().getRowIdByIndex(id, rIndex, true);
    Row row = new Row(this, rId);
    return row;
  }

  /**
   * create a column model according to the given column index
   * 
   * @param cIndex
   * @return
   */
  public Column createColumn(int cIndex)
  {
    if (cIndex <= 0)
      return null;
    int cId = this.getIDManager().getColIdByIndex(id, cIndex, true);
    Column col = new Column(this, cId);
    return col;
  }

  public Position getColumnPosition()
  {
    return null;
  }

  public ArrayList<Row> getRows(int srIndex, int erIndex)
  {
    return null;
  }

  public ArrayList<Column> getColumns(int scIndex, int ecIndex)
  {
    return null;
  }

  public String getSheetName()
  {
    return this.sheetName;
  }

  public void setSheetName(String sheetName)
  {
    this.sheetName = sheetName;
  }

  public String getDir()
  {
    return this.dir;
  }

  public void setDir(String dir)
  {
    this.dir = dir;
  }

  public int getId()
  {
    return id;
  }

  public void setId(int id)
  {
    this.id = id;
  }

  public String getUUId()
  {
    return uuid;
  }

  public void setUUId(String uid)
  {
    this.uuid = uid;
  }

  public void setFreezeRowIndex(int rIndex)
  {
    this.freezeRow = rIndex;
  }

  public int getFreezeRowIndex()
  {
    return this.freezeRow;
  }

  public void setFreezeColIndex(int cIndex)
  {
    this.freezeCol = cIndex;
  }

  public int getFreezeColIndex()
  {
    return this.freezeCol;
  }

  public IDStruct getIdStruct()
  {
    return idStruct;
  }

  public void setIdStruct(IDStruct idStruct)
  {
    this.idStruct = idStruct;
  }

  public int getRowHeight()
  {
    return rowHeight;
  }

  public void setRowHeight(int rowHeight)
  {
    this.rowHeight = rowHeight;
  }

  private Column getGlobalStyleColumn()
  {
    int length = this.columns.size();
    for (int i = length - 1; i >= 0; i--)
    {
      Column column = this.columns.get(i);
      if (column.getRepeatedNum() > ConversionConstant.THRES_GLOBAL_COL_STYLE && (column.isContainStyle()))
      {
        return column;
      }
    }
    return null;
  }

  /**
   * when insert empty column at the beginning, for each row, if it contain row style, the first insert column should also contain that
   * style And the first column should have the global column style if it exists
   * 
   * @param count
   *          : insert columns count
   */
  private void insertEmptyColAtBegin(int count)
  {
    Column gCol = this.getGlobalStyleColumn();
    if (gCol != null)
    {
      int colIndex = gCol.getIndex();
      if (colIndex == (count + 1))
      {
        gCol.setRepeatedNum(gCol.getRepeatedNum() + count);
        gCol.id = this.getIDManager().getColIdByIndex(this.id, 1, true);
      }
      else
      {
        Column newColumn = this.createColumn(1);
        newColumn.setRepeatedNum(count - 1);
        newColumn.setStyle(gCol.getStyle());
        newColumn.setWidth(gCol.getWidth());
        this.columns.add(0, newColumn);
      }
    }

    int length = this.rows.size();
    int colId = this.getIDManager().getColIdByIndex(this.id, 1, true);
    for (int i = 0; i < length; i++)
    {
      Row row = this.rows.get(i);
      if (row.isContainRowStyle())
      {
        StyleObject style = row.getRowStyle();
        StyleCell sCell = new StyleCell(row, colId);
        sCell.setStyle(style);
        sCell.setRepeatedNum(count - 1);
        row.insertStyleCell(sCell);
      }
    }
  }

  @SuppressWarnings("unchecked")
  public void insertCols(ParsedRef ref, JSONObject data)
  {
    int sCIndex = ref.getIntStartCol();
    int eCIndex = ref.getIntEndCol();
    int count = eCIndex - sCIndex + 1;

    // give space in idmanager
    getIDManager().insertColAtIndex(id, sCIndex, count);
    // restore "oc*" IDs
    JSONObject meta = (JSONObject) data.get(ConversionConstant.META);
    if (meta != null)
    {
      ModelHelper.iterateMap(meta, new IMapEntryListener<String, Number>()
      {
        public boolean onEntry(String strId, Number index)
        {
          if (strId.startsWith(ConversionConstant.ORIGIN_COLUMNID))
          {
            int numberId = ModelHelper.toNumberId(strId);
            getIDManager().setColumnIdAtIndex(id, index.intValue(), numberId);
          }
          return false;
        }
      });
    }

    // apply column properties
    JSONObject cols = (JSONObject) data.get(ConversionConstant.COLUMNS);

    if ((cols != null && cols.size() > 0) || data.containsKey(ConversionConstant.ROWS))
    {
      Set<CoverInfo> coverInfos = new HashSet<CoverInfo>();
      // enlarge cover cell
      if (sCIndex > 1)
      {
        int length = this.rows.size();
        for (int i = 0; i < length; i++)
        {
          Row row = this.rows.get(i);
          CoverInfo cInfo = row.getCoverInfo(sCIndex);
          if (null != cInfo)
          {
            int colSpan = cInfo.getColSpan();
            cInfo.setColSpan(colSpan + count);
            coverInfos.add(cInfo);
          }
        }
      }

      data.put(ConversionConstant.IS_COLUMN, true);
      SetRangeHelper helper = new SetRangeHelper(parent);
      helper.setInsertColumn(true);
      helper.applySetRangeMessage(ref, data);

      // the new column model has been created after call applySetRangeMessage
      Iterator<CoverInfo> iter = coverInfos.iterator();
      while (iter.hasNext())
      {
        CoverInfo cInfo = iter.next();
        this.insertCoverInfoInColumn(cInfo, sCIndex, eCIndex);
      }
    }
    else
    {// empty columns insert
      Position pos = ModelHelper.search(this.columns, sCIndex - 1);
      // change the columns model
      if (pos.isFind)
      {
        Column col = this.columns.get(pos.index);
        int repeatedNum = col.getRepeatedNum();
        col.setRepeatedNum(repeatedNum + count);
        if (!col.isVisible() || (col.getCoverList().size() > 0 && (col.getIndex() + repeatedNum + 1 == sCIndex)))
        {
          int nPos = ModelHelper.divide(this.columns, pos.index, sCIndex);
          ModelHelper.divide(this.columns, nPos, eCIndex + 1);
          Column nCol = this.columns.get(nPos);
          if (null != nCol)
          {
            nCol.setVisibility(null);
            nCol.getCoverList().clear();
          }
        }
      }
      if (sCIndex == 1)
      {
        this.insertEmptyColAtBegin(count);
      }
      else
      {
        int length = this.rows.size();
        for (int i = 0; i < length; i++)
        {
          Row row = this.rows.get(i);
          StyleCell sCell = row.getStyleCell(sCIndex - 1);
          if (null != sCell)
          {
            int repeatedNum = sCell.getRepeatedNum();
            sCell.setRepeatedNum(repeatedNum + count);
          }
          CoverInfo cInfo = row.getCoverInfo(sCIndex);
          if (null != cInfo)
          {
            int colSpan = cInfo.getColSpan();
            cInfo.setColSpan(colSpan + count);
            this.insertCoverInfoInColumn(cInfo, sCIndex, eCIndex);
          }
        }
      }

      if (sCIndex > 1)
        this.parent.insertRulesObj4EmptyRowCol(this.sheetName, sCIndex, eCIndex, false);
    }
    if (this.columns.size() > 0)
    {
      Column lastCol = this.columns.get(this.columns.size() - 1);
      int lastColIndex = lastCol.getIndex();
      if (lastCol.getRepeatedNum() + lastColIndex > ConversionConstant.MAX_COL_NUM)
      {
        lastCol.setRepeatedNum(ConversionConstant.MAX_COL_NUM - lastColIndex);
      }
    }

    // fix possibly out of bound columns and style cells
    for (Iterator iterator = rows.iterator(); iterator.hasNext();)
    {
      Row row = (Row) iterator.next();
      // reverse for every kind of cells
      List<? extends BasicModel> cells = row.getStyleCells();
      for (int i = cells.size() - 1; i >= 0; i--)
      {
        StyleCell sc = (StyleCell) cells.get(i);
        int cellIndex = sc.getIndex();
        if (cellIndex > ConversionConstant.MAX_COL_NUM)
        {
          cells.remove(i);
        }
        else
        {
          if (sc.getRepeatedNum() + cellIndex > ConversionConstant.MAX_COL_NUM)
          {
            sc.setRepeatedNum(ConversionConstant.MAX_COL_NUM - cellIndex);
          }
          // else, valid stylecell
          // last style cell ok, quit
          break;
        }
      }

      List<CoverInfo> coverCells = row.getCoverList();
      for (int i = coverCells.size() - 1; i >= 0; i--)
      {
        CoverInfo cc = coverCells.get(i);
        int idx = cc.getIndex();
        if (idx > ConversionConstant.MAX_COL_NUM)
          coverCells.remove(i);
        else
        {
          if (cc.getRepeatedNum() + idx > ConversionConstant.MAX_COL_NUM)
            cc.setRepeatedNum(ConversionConstant.MAX_COL_NUM - idx);
          // else, valid merge cell
          // last merge cell ok, quit
          break;
        }
      }
      // TODO check value cells and cover infos
    }
  }

  public void deleteCols(int sCIndex, int eCIndex, boolean isDlt)
  {
    // delete the cells in each row
    int size = this.rows.size();
    for (int i = 0; i < size; i++)
    {
      Row row = this.rows.get(i);

      // delete style cells between the delete cols
      List<StyleCell> styleCells = row.getStyleCells();
      Position pos = ModelHelper.search(styleCells, eCIndex);
      if (pos.isFind)
        ModelHelper.divide(styleCells, pos.index, eCIndex + 1);
      for (int j = pos.index; j >= 0; j--)
      {
        StyleCell sCell = styleCells.get(j);
        int sIndex = sCell.getIndex();
        int repeatedNum = sCell.getRepeatedNum();
        int eIndex = sIndex + repeatedNum;
        if (eIndex < sCIndex)
          break;
        // if the first delete column not the sIndex style cell, just change the repeated number
        if (sCIndex > sIndex && sCIndex <= eIndex)
        {
          int newRepeatedNum = sCIndex - 1 - sIndex;
          sCell.setRepeatedNum(newRepeatedNum);
          break;
        }
        sCell.remove();
        styleCells.remove(j);
      }

      // delete value cells between the delete cols
      List<ValueCell> valueCells = row.getValueCells();
      pos = ModelHelper.search(valueCells, eCIndex);
      for (int j = pos.index; j >= 0; j--)
      {
        ValueCell vCell = valueCells.get(j);
        int index = vCell.getIndex();
        if (index < sCIndex)
          break;
        // remove the formula reference count
        vCell.remove();
        valueCells.remove(j);
      }

      // delete coverInfo or change the col span between the delete cols
      row.deleteCoverCells(sCIndex, eCIndex, false);
    }

    // delete columns
    Position pos = ModelHelper.search(this.columns, eCIndex);
    if (pos.isFind)
      ModelHelper.divide(this.columns, pos.index, eCIndex + 1);
    for (int j = pos.index; j >= 0; j--)
    {
      Column col = this.columns.get(j);
      int sIndex = col.getIndex();
      int repeatedNum = col.getRepeatedNum();
      int eIndex = sIndex + repeatedNum;
      if (eIndex < sCIndex)
        break;
      // if the first delete column not the sIndex column, just change the repeated number
      if (sCIndex > sIndex && sCIndex <= eIndex)
      {
        int newRepeatedNum = sCIndex - 1 - sIndex;
        col.setRepeatedNum(newRepeatedNum);
        break;
      }
      col.remove();
      this.columns.remove(j);
    }
    if (isDlt)
      this.getIDManager().deleteColAtIndex(this.id, sCIndex, eCIndex);
    // insert global style column to the last until 1024 if it exists
    Column gCol = this.getGlobalStyleColumn();
    if (gCol != null)
    {
      Column lastCol = this.columns.get(this.columns.size() - 1);
      if (lastCol != null)
      {
        int lastColIndex = lastCol.getIndex();
        int rn = lastCol.getRepeatedNum();
        int index = lastColIndex + rn + 1;
        if (index < ConversionConstant.MAX_COL_NUM)
        {
          if (lastCol == gCol)
          {
            rn = ConversionConstant.MAX_COL_NUM - lastColIndex;
            lastCol.setRepeatedNum(rn);
          }
          else
          {
            rn = ConversionConstant.MAX_COL_NUM - index;
            Column newColumn = this.createColumn(index);
            newColumn.setRepeatedNum(rn);
            newColumn.setStyle(gCol.getStyle());
            newColumn.setWidth(gCol.getWidth());
            this.columns.add(newColumn);
          }
        }
      }
    }
  }

  @SuppressWarnings("unchecked")
  public void insertRows(int sRIndex, int eRIndex, JSONObject data)
  {
    final IDManager idManager = this.getIDManager();
    int rCnt = eRIndex - sRIndex + 1;
    JSONObject rows = (JSONObject) data.get(ConversionConstant.ROWS);
    // insert empty rows
    if (null == rows)
    {
      idManager.insertRowAtIndex(this.id, sRIndex, rCnt);
      // iterate columns to enlarge coverInfo
      int colSize = this.columns.size();
      int count = (eRIndex - sRIndex + 1);
      Set<CoverInfo> mCoverInfos = new HashSet<CoverInfo>();
      for (int i = 0; i < colSize; i++)
      {
        Column col = this.columns.get(i);
        CoverInfo cInfo = col.getCoverInfo(sRIndex);
        if (cInfo != null)
        {
          if (!mCoverInfos.contains(cInfo))
          {
            mCoverInfos.add(cInfo);
            cInfo.setRowSpan(cInfo.getRowSpan() + count);
          }
        }
      }
      // if insert empty rows at the top of the sheet, and the original top row
      // contain styles, the new insert row should follow the same style
      int followRIndex = (1 == sRIndex) ? eRIndex + 1 : sRIndex - 1;
      Position pos = ModelHelper.search(this.rows, followRIndex);
      Row row = null;
      if (pos.isFind)
        row = this.rows.get(pos.index);
      if (null != row)
      {
        boolean create = false;
        if (row.isContainStyle())
        {
          if (1 == sRIndex || row.isContainValue())
            create = true;
          else
          {
            if (row.isVisible())
            {
              int repeatedNum = row.getRepeatedNum();
              row.setRepeatedNum(repeatedNum + rCnt);
            }
            else
              create = true;
          }
        }
        if (create)
        {
          Row newRow = new Row(sRIndex, row);
          newRow.setVisibility(null);
          newRow.setRepeatedNum(rCnt - 1);
          int index = (1 == sRIndex) ? 0 : pos.index + 1;
          this.rows.add(index, newRow);
        }
      }
      if (sRIndex > 1)
        this.parent.insertRulesObj4EmptyRowCol(this.sheetName, sRIndex, eRIndex, true);
    }
    else
    {
      // insert rows with data

      // split the row
      Position pos = ModelHelper.search(this.rows, sRIndex);
      int index = pos.index;
      if (pos.isFind)
        index = ModelHelper.divide(this.rows, pos.index, sRIndex);
      index = index < 0 ? 0 : index;
      // insert row at idManager
      idManager.insertRowAtIndex(this.id, sRIndex, rCnt);
      // back up the original row id
      JSONObject meta = (JSONObject) data.get("meta");
      if (null != meta)
      {
        Iterator<?> iter = meta.keySet().iterator();
        while (iter.hasNext())
        {
          String rowId = iter.next().toString();
          if (rowId.startsWith(ConversionConstant.ORIGIN_ROWID))
          {
            int tmpIndex = Integer.parseInt(meta.get(rowId).toString());
            int numberId = ModelHelper.stripIdType(rowId);
            int idType = ModelHelper.toNumberIdType(rowId);
            int typedId = ModelHelper.typedId(idType, numberId);
            idManager.setRowIdAtIndex(this.id, tmpIndex, typedId);
          }
        }
      }
      // iterate columns to enlarge coverInfo
      int colSize = this.columns.size();
      int count = (eRIndex - sRIndex + 1);
      Set<CoverInfo> mCoverInfos = new HashSet<CoverInfo>();
      for (int i = 0; i < colSize; i++)
      {
        Column col = this.columns.get(i);
        CoverInfo cInfo = col.getCoverInfo(sRIndex);
        if (cInfo != null)
        {
          if (!mCoverInfos.contains(cInfo))
          {
            mCoverInfos.add(cInfo);
            cInfo.setRowSpan(cInfo.getRowSpan() + count);
          }
        }
      }
      // insert the new add rows
      JSONObject rowsJson = (JSONObject) data.get("rows");
      Iterator<Map.Entry> iter = rowsJson.entrySet().iterator();
      int sIndex = index;
      int start = index + rCnt + 1; // init a max index
      int rNum = 0;
      while (iter.hasNext())
      {
        Map.Entry entry = iter.next();
        JSONObject rowJson = (JSONObject) entry.getValue();
        if (rowJson.isEmpty())
          continue;
        rNum++;
        String strIndex = (String) entry.getKey();
        int rowIndex = Integer.parseInt(strIndex);
        int rId = idManager.getRowIdByIndex(this.id, rowIndex, true);
        Row row = new Row(this, rId);
        row.loadContentFromJSON(rowJson);
        index = ModelHelper.insert(this.rows, row, sIndex, sIndex + rNum, index, null, null).index;
        if (index < start)
          start = index;
      }
      ModelHelper.merge(this.rows, start + rNum - 1, Direction.BACKWARD);
      ModelHelper.merge(this.rows, start, Direction.FORWARD);
    }

    // check rows, remove rows beyond 0x100k.
    for (int i = this.rows.size() - 1; i >= 0; i--)
    {
      Row row = this.rows.get(i);
      if (row.getIndex() > ConversionConstant.MAX_ROW_NUM)
      {
        this.rows.remove(i);
      }
      else
      {
        if (row.getIndex() + row.getRepeatedNum() > ConversionConstant.MAX_ROW_NUM)
        {
          row.setRepeatedNum(ConversionConstant.MAX_ROW_NUM - row.getIndex());
        }
        break;
      }
    }
  }

  /**
   * The API for all the cut operation: row, rowrange, col, cell, range, sheet
   * 
   * @param startRow
   * @param endRow
   * @param startCol
   * @param endCol
   */
  public void cutRange(int sRIndex, int eRIndex, int sCIndex, int eCIndex, JSONObject data)
  {
    Object o = data.get(ConversionConstant.IS_COLUMN);
    boolean isColumn = o == null ? false : ((Boolean) o).booleanValue();
    if (isColumn)
    {
      this.deleteCols(sCIndex, eCIndex, false);
      if (sheetProtected && getStyleManager().getDefaultLockedAttr())
        addUnLockedCols(sCIndex, eCIndex);
      return;
    }
    // cut cell, cut range
    List<Row> rangeData = this.cutRangeData(sRIndex, eRIndex, sCIndex, eCIndex, null);
    // iterate each value cell and set value to "" for adding value set change in preserve.js
    if (rangeData != null)
    {
      int size = rangeData.size();
      for (int i = 0; i < size; i++)
      {
        Row r = rangeData.get(i);
        if (r == null)
          continue;// the row model might not exist
        List<ValueCell> vCells = r.getValueCells();
        for (int j = 0; j < vCells.size(); j++)
        {
          ValueCell cell = vCells.get(j);
          cell.setValue("", true);
        }
      }
    }

    boolean bRow = sCIndex == 1 && eCIndex == ConversionConstant.MAX_COL_NUM;
    // cut row
    if (bRow && (this.rows.size() != 0))
    {
      Position sPos = ModelHelper.search(this.rows, sRIndex);
      if (sPos.isFind)
        ModelHelper.divide(this.rows, sPos.index, sRIndex);
      Position ePos = ModelHelper.search(this.rows, eRIndex);
      int eIndex = ePos.index < 0 ? 0 : ePos.index;
      if (ePos.isFind)
        ModelHelper.divide(this.rows, ePos.index, eRIndex + 1);

      for (int i = eIndex; i >= 0; i--)
      {
        Row row = this.rows.get(i);
        int rIndex = row.getIndex();
        if (rIndex < sRIndex)
          break;
        if (rIndex >= sRIndex && rIndex <= eRIndex)
        {
          this.rows.remove(i);
          row.remove();
        }
      }
    }

    // cut col
    Object obCol = data.get(ConversionConstant.IS_COLUMN);
    Boolean bCol = (obCol != null) ? ((Boolean) obCol).booleanValue() : false;
    Object obSheet = data.get(ConversionConstant.FOR_SHEET);
    Boolean isCutSheet = (obSheet != null) ? ((Boolean) obSheet).booleanValue() : false;

    if ((bCol || isCutSheet) && (this.columns.size() != 0))
    {
      Position pos = ModelHelper.search(this.columns, eCIndex);
      if (pos.isFind)
        ModelHelper.divide(this.columns, pos.index, eCIndex + 1);
      for (int j = pos.index; j >= 0; j--)
      {
        Column col = this.columns.get(j);
        int sIndex = col.getIndex();
        int repeatedNum = col.getRepeatedNum();
        int eIndex = sIndex + repeatedNum;
        if (eIndex < sCIndex)
          break;
        // if the first delete column not the sIndex column, just change the repeated number
        if (sCIndex > sIndex && sCIndex <= eIndex)
        {
          int newRepeatedNum = sCIndex - 1 - sIndex;
          col.setRepeatedNum(newRepeatedNum);
          break;
        }
        col.setStyle(null);
        col.remove();
        this.columns.remove(j);
      }
    }

    if (sheetProtected && getStyleManager().getDefaultLockedAttr())
    {
      if (bCol || isCutSheet)
        addUnLockedCols(sCIndex, eCIndex);
      else
      {
        ParsedRef ref;
        if (bRow)
          ref = new ParsedRef(sheetName, String.valueOf(sRIndex), null, null, String.valueOf(eRIndex), null);
        else
          ref = new ParsedRef(sheetName, String.valueOf(sRIndex), ReferenceParser.translateCol(sCIndex), null, String.valueOf(eRIndex),
              ReferenceParser.translateCol(eCIndex));
        JSONObject styleJson = new JSONObject();
        styleJson.put(ConversionConstant.STYLE_UNLOCKED, true);
        JSONObject msg = ModelHelper.styleToRangeMessage(ref, styleJson);
        SetRangeHelper helper = new SetRangeHelper(this.parent);
        helper.applySetRangeMessage(ref, msg);
      }
    }
  }

  private void addUnLockedCols(int sCIndex, int eCIndex)
  {
    Position pos = ModelHelper.search(this.columns, sCIndex);
    int colId = this.getIDManager().getColIdByIndex(id, sCIndex, true);
    Column column = new Column(this, colId);
    if (sCIndex < eCIndex)
      column.setRepeatedNum(eCIndex - sCIndex);
    JSONObject style = new JSONObject();
    style.put(ConversionConstant.STYLE_UNLOCKED, true);
    column.setStyle(getStyleManager().addStyle(style));
    int index = pos.index < 0 ? 0 : pos.index + 1;
    this.columns.add(index, column);
  }

  /**
   * delete coverInfo between the the given range
   * 
   * @param startRow
   * @param endRow
   * @param startCol
   * @param endCol
   * @param bDeleteAnyway
   */
  public void deleteCoverCells(int startRow, int endRow, int startCol, int endCol, boolean bDeleteAnyway)
  {
    int sc, ec;
    if (endCol >= ConversionConstant.MAX_COL_NUM)
    {
      ec = this.columns.size() - 1;
    }
    else
    {
      Position pos = ModelHelper.search(this.columns, endCol);
      if (pos.isFind)
        ec = pos.index;
      else
        ec = pos.index < 0 ? 0 : pos.index;
    }
    if (startCol > 1)
    {
      Position pos = ModelHelper.search(this.columns, startCol);
      if (pos.isFind)
        sc = pos.index;
      else
        sc = pos.index < 0 ? 0 : (pos.index + 1);
    }
    else
      sc = 0;

    Set<CoverInfo> mCoverInfos = new HashSet<CoverInfo>();
    for (int i = sc; i <= ec && i < this.columns.size(); i++)
    {
      Column col = this.columns.get(i);
      List<CoverInfo> coverInfos = col.getCoverList();
      Position pos = ModelHelper.search(coverInfos, endRow, col.getCoverInfoIndexMethod, col.repeatCoverInfoMethod);
      int er = pos.index >= 0 ? pos.index : coverInfos.size() - 1;
      pos = ModelHelper.search(coverInfos, startRow, col.getCoverInfoIndexMethod, col.repeatCoverInfoMethod);
      int sr = pos.index >= 0 ? pos.index : 0;
      for (int j = er; j >= sr && j < coverInfos.size(); j--)
      {
        CoverInfo cInfo = coverInfos.get(j);
        // 49980 ignore the coverinfo not in this range.
        int csr = cInfo.getRowIndex();
        int cer = csr + cInfo.getRowSpan() - 1;
        if ((!(startRow <= csr && csr <= endRow)) && (!(startRow <= cer && cer <= endRow)) && (!(csr < startRow && cer > endRow)))
        {
          continue;
        }
        int rowSpan = cInfo.getRowSpan();
        int colSpan = cInfo.getColSpan();
        if (rowSpan <= 1 && colSpan <= 1)
        {
          coverInfos.remove(j);
          continue;
        }
        if (!mCoverInfos.contains(cInfo))
        {
          mCoverInfos.add(cInfo);
          int sIndex = cInfo.getRowIndex();
          int eIndex = sIndex + rowSpan - 1;
          if (eIndex < startRow)
            break;
          boolean delete = false;
          if (bDeleteAnyway)
            delete = true;
          else
          {
            if (sIndex >= startRow && sIndex <= endRow)
              delete = true;
            else
            {
              int dEIndex = (eIndex < endRow) ? eIndex : endRow;
              int delta = dEIndex - startRow + 1;
              int newRowSpan = rowSpan - delta;
              if (newRowSpan <= 1 && colSpan <= 1)
                delete = true;
              else
                cInfo.setRowSpan(newRowSpan);
            }
          }
          if (delete)
          {
            Object row = cInfo.getParent();
            if (row != null && row instanceof Row)
            {
              int mastercol = cInfo.getIndex();
              ((Row) row).splitCells(mastercol, mastercol);
            }
            else
            {
              cInfo = coverInfos.remove(j);
              cInfo.setRowSpan(1);
              cInfo.setColSpan(1);
            }
          }
        }
      }
    }
  }

  public void deleteRows(int sRIndex, int eRIndex)
  {
    IDManager idManager = this.getIDManager();
    if (0 == this.rows.size())
    {
      idManager.deleteRowAtIndex(this.id, sRIndex, eRIndex);
      return;
    }
    // delete coverInfo between the delete rows
    this.deleteCoverCells(sRIndex, eRIndex, 1, ConversionConstant.MAX_COL_NUM, false);
    Position sPos = ModelHelper.search(this.rows, sRIndex);
    if (sPos.isFind)
      ModelHelper.divide(this.rows, sPos.index, sRIndex);
    Position ePos = ModelHelper.search(this.rows, eRIndex);
    int eIndex = ePos.index < 0 ? 0 : ePos.index;
    if (ePos.isFind)
      ModelHelper.divide(this.rows, ePos.index, eRIndex + 1);
    for (int i = eIndex; i >= 0; i--)
    {
      Row row = this.rows.get(i);
      int rIndex = row.getIndex();
      if (rIndex < sRIndex)
        break;
      if (rIndex >= sRIndex && rIndex <= eRIndex)
      {
        this.rows.remove(i);
        row.remove();
      }
    }

    this.getIDManager().deleteRowAtIndex(this.id, sRIndex, eRIndex);
  }

  public void mergeCells(int sRIndex, int eRIndex, int sCIndex, int eCIndex)
  {
    int rowSpan = eRIndex - sRIndex + 1;
    Position pos = ModelHelper.search(this.rows, sRIndex);
    int index;
    Row row = null;
    if (pos.isFind)
    {
      index = pos.index;
      row = this.rows.get(index);
      if (row.getRepeatedNum() > 0)
      {
        index = ModelHelper.split(this.rows, index, sRIndex);
        row = this.rows.get(index);
      }
    }
    else
    {
      index = pos.index < 0 ? 0 : pos.index + 1;// get the first row in the range
      row = this.createRow(sRIndex);
      this.rows.add(index, row);
    }

    row.mergeCells(sCIndex, eCIndex, rowSpan);
    row.clearCells(sCIndex + 1, eCIndex);
    row.deleteStyleCells(sCIndex + 1, eCIndex);
    index++;
    // clear cells for the merged cells
    pos = ModelHelper.search(this.rows, eRIndex);
    int endIndex = pos.index;
    if (!pos.isFind)
      endIndex = endIndex < 0 ? 0 : endIndex;
    for (int i = index; i <= endIndex; i++)
    {
      row = this.rows.get(i);
      if (i == endIndex)
      {
        ModelHelper.split(this.rows, i, eRIndex + 1);
      }
      row.clearCells(sCIndex, eCIndex);
      row.deleteStyleCells(sCIndex, eCIndex);
    }
  }

  public void splitCells(int sRIndex, int eRIndex, int sCIndex, int eCIndex)
  {
    Position pos = ModelHelper.search(this.rows, sRIndex);
    int index = pos.index;
    if (!pos.isFind)
      index = pos.index < 0 ? 0 : pos.index + 1;
    int size = this.rows.size();
    for (int i = index; i < size; i++)
    {
      Row row = this.rows.get(i);
      int rIndex = row.getIndex();
      if (rIndex > eRIndex)
        break;
      row.splitCells(sCIndex, eCIndex);
    }
  }

  /**
   * filter the given rows or show the filtered rows
   * 
   * @param rangeInfo
   *          is the filtered range info
   * @param rows
   *          the row list which need to be filtered or show
   * @param bFilter
   *          true for filter given rows false for show the given rows, if rows is not given, then show the filtered rows
   * @param bShowPreviousFiltered
   *          only workable when bFilter is true true for show the previously filtered rows, and these rows should not conflict with the
   *          given rows if bFilter is true false to do nothing it often set to true when user do a filter
   * @return return the row list which has been filtered or unfiltered
   */
  public List<Row> filterRows(RangeInfo rangeInfo, JSONArray filterRows, boolean bFilter, boolean bShowPreviousFiltered)
  {
    List<Row> updateRows = new ArrayList<Row>();
    // int refStartRow = parsedRef.getIntStartRow();
    // int refEndRow = (parsedRef.getEndRow() == null) ? refStartRow : parsedRef.getIntEndRow();
    int refStartRow = rangeInfo.getStartRow();
    int refEndRow = rangeInfo.getEndRow();
    // TODO: assert that filterRow start is bigger than refStartRow, and filterRow end is less than refEndRow
    int i = 0;// the index iterator for filterRows
    int size = 0;
    // remove filter item that not in ascending order
    if (filterRows != null && filterRows.size() > 0)
    {
      boolean isSorted = true;
      for (int idx = filterRows.size() -1 ; idx >0 ; idx--) {
        int lastIndex = ((Number)filterRows.get(idx - 1)).intValue();
        int currIndex = ((Number)filterRows.get(idx)).intValue();
        if (lastIndex >= currIndex) { 
          isSorted = false;
          filterRows.remove(idx);
          if (filterRows.size() > idx) idx++;
        }
      }
      if (isSorted == false)
      {
        LOG.log(Level.WARNING, "filter rows items are not in acsending order. remove those items.");
      }
    }
    int filterIndex = refEndRow;
    if (filterRows != null && filterRows.size() > 0)
    {
      size = filterRows.size();
      filterIndex = ((Number) filterRows.get(0)).intValue();
      int lastFilterIndex = ((Number) filterRows.get(size - 1)).intValue();
      if (lastFilterIndex > refEndRow || filterIndex < refStartRow)
        LOG.log(Level.WARNING, "filter rows index from {0} to {1} is out of the filter range {2}", new Object[] { filterIndex,
            lastFilterIndex, rangeInfo.toString() });
    }

    // refine the end filter index when there is repeat number, set it to index of master row.
    Position posEnd = ModelHelper.search(this.rows, filterIndex);
    if (posEnd.isFind)
    {
      Row masterRow = this.rows.get(posEnd.index);
      filterIndex = masterRow.getIndex();
    }

    // get the start index of the rows
    Position pos = ModelHelper.search(this.rows, refStartRow);
    int index = pos.index;
    if (!pos.isFind)
      index = index < 0 ? 0 : index + 1;

    Row rowPointer = null;
    if (index < this.rows.size())
      rowPointer = this.rows.get(index);
    int loopcount = ConversionConstant.MAX_ROW_NUM + 1000;
    while (loopcount > 0 )
    {
      loopcount--;
      if (loopcount <=0) 
      {
        LOG.log(Level.WARNING, "deadloop in filterRows");
        throw new IndexOutOfBoundsException("deadloop in filterRows");
      }
      // append the new filtered rows when filter row index is greater than (last row model index + its repeat number)
      if (rowPointer == null)
      {
        if (bFilter)
        {
          while (i < size)
          {
            filterIndex = ((Number) filterRows.get(i)).intValue();
            int id = getIDManager().getRowIdByIndex(this.id, filterIndex, true);
            Row row = new Row(this, id);
            updateFilterRow(row, Visibility.FILTER, updateRows);

            int repeat = 0;
            i++;
            if (i < size)
            {
              int nextFilterIndex = ((Number) filterRows.get(i)).intValue();
              while (nextFilterIndex == (filterIndex + 1))
              {
                repeat++;
                filterIndex = nextFilterIndex;
                i++;
                if (i < size)
                  nextFilterIndex = ((Number) filterRows.get(i)).intValue();
                else
                  break;
              }
            }
            if (repeat > 0)
              row.setRepeatedNum(repeat);
            this.rows.add(row);
          }
        }
        break;
      }

      int rowPointerIndex = rowPointer.getIndex();
      if (filterIndex < rowPointerIndex)
      {
        // size==0 means do not need filterRows, but just show the previous filtered rows, so the work is complete
        if (size == 0)
          break;
        // move filterIndex, if i is out of the size filterRows, set filterIndex to the max index
        if (bFilter)
        {
          // insert new filtered row before rowPointerIndex
          // and get the next filterIndex to check if they can be repeated
          int id = this.getIDManager().getRowIdByIndex(this.id, filterIndex, true);
          Row row = new Row(this, id);
          updateFilterRow(row, Visibility.FILTER, updateRows);
          this.rows.add(index++, row);
          int repeat = 0;
          i++;
          if (i < size)
          {
            int nextFilterIndex = ((Number) filterRows.get(i)).intValue();
            while (nextFilterIndex < rowPointerIndex)
            {
              if (nextFilterIndex == (filterIndex + 1))
                repeat++;
              else
                break;
              filterIndex = nextFilterIndex;
              i++;
              if (i < size)
                nextFilterIndex = ((Number) filterRows.get(i)).intValue();
              else
                break;
            }
            if (repeat > 0)
              row.setRepeatedNum(repeat);
          }
          if (i >= size)
          {
            if (bShowPreviousFiltered)
              showLeftRows(index, updateRows);
            break;
          }
          else
            filterIndex = ((Number) filterRows.get(i)).intValue();
        }
        else
        {
          LOG.log(Level.WARNING, "there is no filtered row model exist at index {0}", filterIndex);
          // get next filtered row
          i++;
          // check i and length of filterRows to avoid apply message exception
          if (i >= filterRows.size())
            break;
          filterIndex = ((Number) filterRows.get(i)).intValue();
        }

      }// end if (filterIndex < rowPointerIndex)

      if (filterIndex == rowPointerIndex)
      {
        Visibility visi = null;
        // size==0 means do not need filterRows
        if (bFilter && size > 0)
          visi = Visibility.FILTER;
        // set visibility and move both filterIndex and index for rowPointer
        int repeat = 0;
        i++;
        if (i < size)
        {
          int nextFilterIndex = ((Number) filterRows.get(i)).intValue();
          while (nextFilterIndex == (filterIndex + 1) && repeat < rowPointer.getRepeatedNum())
          {
            repeat++;
            filterIndex = nextFilterIndex;
            i++;
            if (i < size)
              nextFilterIndex = ((Number) filterRows.get(i)).intValue();
            else
              break;
          }
        }
        if (repeat == rowPointer.getRepeatedNum())
        {
          updateFilterRow(rowPointer, visi, updateRows);
          index++;
          if (index >= this.rows.size())
            rowPointer = null;
          else
          {
            rowPointer = this.rows.get(index);
            rowPointerIndex = rowPointer.getIndex();
          }
        }
        else
        // if repeat < rowPointer.getRepeatedNum()
        {
          // for unfilter rows if they are the same visibility then do nothing
          if (rowPointer.getVisibility() == visi && visi == null && size == 0)
            break;
          // split
          int p = ModelHelper.divide(this.rows, index, rowPointerIndex + repeat + 1);
          // warning if p < 0
          updateFilterRow(rowPointer, visi, updateRows);
          if (p > 0)
          {
            index = p;
            rowPointer = this.rows.get(index);
            rowPointerIndex = rowPointer.getIndex();
          }
          else
          {
            index++;
            if (index >= this.rows.size())
              rowPointer = null;
            else
            {
              rowPointer = this.rows.get(index);
              rowPointerIndex = rowPointer.getIndex();
            }
          }
        }

        if (i >= size)
        {
          if (bShowPreviousFiltered)
            showLeftRows(index, updateRows);
          break;
        }
        else
          filterIndex = ((Number) filterRows.get(i)).intValue();
      }// end if (filterIndex == rowPointerIndex)

      if (rowPointer == null)
        continue;

      if (filterIndex > rowPointerIndex)
      {
        // move index for rowPointer
        if (bShowPreviousFiltered)
        {
          pos = ModelHelper.search(this.rows, filterIndex);
          int nextIndex = pos.index;
          if (pos.isFind && bFilter && i < size)
            nextIndex = ModelHelper.divide(this.rows, pos.index, filterIndex);
          else
            nextIndex = (nextIndex < 0) ? 0 : nextIndex + 1;
          // check if there are previously filtered rows need to show
          while (index < nextIndex)
          {
            if (rowPointer.getVisibility() == Visibility.FILTER)
              updateFilterRow(rowPointer, null, updateRows);
            index++;
            if (index >= this.rows.size())
              rowPointer = null;
            else
            {
              rowPointer = this.rows.get(index);
              rowPointerIndex = rowPointer.getIndex();
            }
          }
        }
        else
        {
          // get next rowPointerIndex
          index++;
          if (index >= this.rows.size())
            rowPointer = null;
          else
          {
            rowPointer = this.rows.get(index);
            rowPointerIndex = rowPointer.getIndex();
          }
        }
      }// end if (filterIndex > rowPointerIndex)

    }

    insertFilterEvent(updateRows);

    return updateRows;
  }

  // since now all the rows have been filtered, still need to unfilter the previously filtered row
  private void showLeftRows(int fromIndex, List<Row> updateRows)
  {
    int size = this.rows.size();
    while (fromIndex < size)
    {
      Row row = this.rows.get(fromIndex);
      if (row.getVisibility() == Visibility.FILTER)
        updateFilterRow(row, null, updateRows);
      fromIndex++;
    }
  }

  // set the visiblity attribute to row,
  // if the given visibility attribute is different with the row original attribute, put it in rowList
  private void updateFilterRow(Row row, Visibility visibility, List<Row> rowList)
  {
    Visibility oriVisi = row.getVisibility();
    if (oriVisi != visibility)
      rowList.add(row);
    row.setVisibility(visibility);
  }

  private void insertFilterEvent(List<Row> updateRows)
  {
    int size = updateRows.size();
    if (size > ConversionConstant.MAX_FILTER_ROW_COUNT)
    {
      // create one filter event
      int sr = updateRows.get(0).getIndex();
      int er = updateRows.get(size - 1).getIndex();
      RangeInfo refValue = new RangeInfo(id, sr, 1, er, ConversionConstant.MAX_COL_NUM, ParsedRefType.RANGE);
      EventSource source = new EventSource(NotifyEvent.ACTION.FILTER, NotifyEvent.TYPE.RANGE, refValue);
      NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
      parent.insertEvent(e);
    }
    else
    {
      // create several filter event for each
      for (int i = 0; i < size; i++)
      {
        int index = updateRows.get(i).getIndex();
        RangeInfo refValue = new RangeInfo(id, -1, index, 1, index, ConversionConstant.MAX_COL_NUM, ParsedRefType.RANGE);
        EventSource source = new EventSource(NotifyEvent.ACTION.FILTER, NotifyEvent.TYPE.RANGE, refValue);
        NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
        parent.insertEvent(e);
      }
    }
  }

  /**
   * show the previously filtered rows in the given range area
   * 
   * @param info
   *          the filter range info
   */
  public List<Row> restoreFilteredRows(RangeInfo info)
  {
    return this.filterRows(info, null, true, true);
  }

  /**
   * clear the cell value in the given range if end row/column index is -1 means taht clear the cell value until to the last cell
   * 
   * @param sRIndex
   *          the clear range start row index 1-based
   * @param eRIndex
   *          the clear range end row index 1-based, -1 is possible
   * @param sCIndex
   *          the clear range start column index 1-based
   * @param eCIndex
   *          the clear range end column index 1-based, -1 is possible
   */
  public void clearRange(int sRIndex, int eRIndex, int sCIndex, int eCIndex)
  {
    int size = this.rows.size();
    if (size == 0)
      return;
    int index = 0;
    if (sRIndex > 1)
    {
      Position pos = ModelHelper.search(this.rows, sRIndex);
      index = pos.index;
      if (!pos.isFind)
        index = pos.index < 0 ? 0 : (pos.index + 1);
    }

    if (eRIndex == -1)
    {
      Row lastRow = this.rows.get(size - 1);
      eRIndex = lastRow.getIndex();
    }
    while (index < size)
    {
      Row row = this.rows.get(index);
      if (row.getVisibility() != Visibility.FILTER)
      {
        int rIndex = row.getIndex();
        if (rIndex > eRIndex)
          break;
        row.clearCells(sCIndex, eCIndex);
      }
      index++;
    }
  }

  public void setColumns(int columnIndex, boolean isReplace, JSONObject columnStyle, JSONObject columnWidth, JSONObject columnVis)
  {
    if ((columnStyle != null && columnStyle.size() > 1) || (columnWidth != null && columnWidth.size() > 1)
        || (columnVis != null && columnVis.size() > 1))
    {
      LOG.log(Level.WARNING, "Trying to set multiple column props that is not supported yet, do nothing.");
    }
    else
    {
      Column column;
      int pColumn;
      Position pos = ModelHelper.search(columns, columnIndex);
      if (pos.isFind)
      {
        pColumn = ModelHelper.split(columns, pos.index, columnIndex);
        column = columns.get(pColumn);
      }
      else
      {
        pColumn = pos.index + 1;
        int columnId = getIDManager().getColIdByIndex(id, columnIndex, true);
        column = new Column(this, columnId);
        ModelHelper.insert(columns, column, pColumn);
      }

      if (columnStyle == null)
      {
        if (isReplace)
        {
          // reset column style
          column.setStyle(null);
        }
        // else, for merge, do nothing
      }
      else
      {
        columnStyle = (JSONObject) columnStyle.values().iterator().next();
        if (isReplace)
        {
          column.setStyle(getStyleManager().addStyle(columnStyle));
        }
        else
        {
          if (column.getStyle() == null)
          {
            column.setStyle(getStyleManager().addStyle(columnStyle));
          }
          else
          {
            column.setStyle(getStyleManager().changeStyle(column.getStyle(), columnStyle));
          }

          mergeColumnStyle(columnIndex, columnStyle);
        }
      }

      if (columnWidth == null)
      {
        if (isReplace)
        {
          column.setWidth(-1);
        }
        // else, for merge, do nothing
      }
      else
      {
        int width = ((Number) columnWidth.values().iterator().next()).intValue();
        if (width >= 0)
        {
          column.setWidth(width);
        }
      }

      if (columnVis == null)
      {
        if (isReplace)
        {
          column.setVisibility(null);
        }
        // else, for merge, do nothing
      }
      else
      {
        Visibility vis = Visibility.toVisibility((String) columnVis.values().iterator().next());
        if (vis != null)
        {
          column.setVisibility(vis);
        }
      }
    }
  }

  /**
   * Set values, i.e. undo clear, of row and range.
   * 
   * @param ref
   * @param data
   */
  @SuppressWarnings("unchecked")
  public void setValues(JSONObject data)
  {
    ModelHelper.iterateMap(data, new IMapEntryListener<String, JSONObject>()
    {
      public boolean onEntry(String strRowIndex, JSONObject rowData)
      {
        int rowIndex = Integer.parseInt(strRowIndex);
        Position pos = ModelHelper.search(rows, rowIndex);
        Row row;
        if (pos.isFind)
        {
          row = rows.get(pos.index);
          if (row.getRepeatedNum() > 0)
          {
            int index = ModelHelper.split(rows, pos.index, rowIndex);
            row = rows.get(index);
          }
        }
        else
        {
          int rowId = getIDManager().getRowIdByIndex(id, rowIndex, true);
          row = new Row(Sheet.this, rowId);
          ModelHelper.insert(rows, row);
        }

        row.setValues(rowData);
        return false;
      }
    });
  }

  void mergeColumnStyle(int columnIndex, JSONObject style)
  {
    int mid = -1;
    for (Iterator iterator = rows.iterator(); iterator.hasNext();)
    {
      Row row = (Row) iterator.next();
      List<StyleCell> styleCells = row.getStyleCells();
      Position pos = ModelHelper.search(styleCells, columnIndex, mid);
      if (pos.isFind)
      {
        int index = pos.index;
        mid = index;
        index = ModelHelper.split(styleCells, index, columnIndex);
        StyleCell sc = styleCells.get(index);
        StyleObject so = sc.getStyle();
        so = getStyleManager().changeStyle(so, style);
        sc.setStyle(so);
      }
      // else, no style cell at the column position, nothing to do
    }
  }

  /**
   * sort the range according to sortData all the cell model in the range will be exchanged by row
   * 
   * @param startRow
   *          the start row index of sort range, 1-based
   * @param endRow
   *          the end row index of sort range
   * @param startCol
   *          the start column index of sort range
   * @param endCol
   *          the end column index of sort range
   * @param sortData
   *          the sort order
   */
  public void sort(int startRow, int endRow, int startCol, int endCol, JSONObject sortData)
  {
    // 2 cut cells
    List<Row> sortRows = cutRangeData(startRow, endRow, startCol, endCol, sortData);
    // 3 paste reordered rows
    pasteRangeData(startRow, endRow, startCol, endCol, sortRows, sortData);
  }

  /**
   * cut range indicated by {startRow, endRow, startCol, endCol) this method only cut the value cell, style cell and cover info of the given
   * range
   * 
   * @param startRow
   *          the start row index of the cut range, 1-based
   * @param endRow
   *          the end row index of the cut range, 1-based
   * @param startCol
   *          the start column index of the cut range, 1-based
   * @param endCol
   *          the end column index of the cut range, 1-based, if startCol == 1 && endCol == MAX_COL_NUM then it will cut the data of the
   *          whole row
   * @param sr
   *          the row index of the row list which corresponding row model is equal or larger than startRow
   * @param er
   *          the row index of the row list which corresponding row model is equal or less than endRow
   * @return the cut range which represent by rows
   */
  private List<Row> cutRangeData(int startRow, int endRow, int startCol, int endCol, JSONObject sortData)
  {
    List<Row> sortRows = new ArrayList<Row>();
    if (this.rows.size() == 0)
      return sortRows;
    Position sPos = ModelHelper.search(this.rows, startRow);
    int sr = sPos.index;
    if (sPos.isFind)
      sr = ModelHelper.divide(this.rows, sPos.index, startRow);
    else
      sr = sr < 0 ? 0 : sr + 1;// get the first row in the range
    Position ePos = ModelHelper.search(this.rows, endRow);
    int er = ePos.index;
    if (ePos.isFind)
      ModelHelper.divide(this.rows, ePos.index, endRow + 1);
    else
      er = er < 0 ? 0 : er;// get the last row in the range

    for (int i = sr; i <= er; i++)
    {
      Row row = this.rows.get(i);
      int rIndex = row.getIndex();
      int cnt = rIndex - (sortRows.size() + startRow);
      if (cnt < 0)
        LOG.log(Level.WARNING, "there is overlapped row when sort at {0} row", rIndex);

      for (int j = 0; j < cnt; j++)
        sortRows.add(null);

      Row sortRow = new Row(row.getParent(), row.getId());
      sortRows.add(sortRow);

      cnt = row.getRepeatedNum();
      sortRow.setRepeatedNum(cnt);
      for (int j = 0; j < cnt; j++)
        sortRows.add(sortRow);

      // for style cells
      List<StyleCell> styleCells = row.getStyleCells();
      Position pos = ModelHelper.search(styleCells, endCol);
      int index = pos.index;
      if (pos.isFind)
        ModelHelper.divide(styleCells, index, endCol + 1);
      boolean bEnd = false;
      for (int j = index; j >= 0; j--)
      {
        StyleCell cell = styleCells.get(j);
        int cIndex = cell.getIndex();
        if (cIndex + cell.getRepeatedNum() < startCol)
          break;
        if (cIndex < startCol)
        {
          ModelHelper.divide(styleCells, j, startCol);
          j++;
          cell = styleCells.get(j);
          bEnd = true;
        }
        styleCells.remove(cell);
        sortRow.getStyleCells().add(0, cell);
        if (bEnd)
          break;
      }

      // for value cells
      List<ValueCell> valueCells = row.getValueCells();
      pos = ModelHelper.search(valueCells, endCol);
      for (int j = pos.index; j >= 0; j--)
      {
        ValueCell cell = valueCells.get(j);
        int cIndex = cell.getIndex();
        if (cIndex < startCol)
          break;
        valueCells.remove(cell);
        sortRow.getValueCells().add(0, cell);
      }

      // for cover info
      List<CoverInfo> coverCells = row.getCoverList();
      pos = ModelHelper.search(coverCells, endCol);
      for (int j = pos.index; j >= 0; j--)
      {
        CoverInfo cell = coverCells.get(j);
        int cIndex = cell.getIndex();
        if (cIndex < startCol)
          break;
        int endIndex = cIndex + cell.getRepeatedNum();
        if (endIndex > endCol)
        {
          LOG.log(Level.WARNING, "there should not be covered cell at the boundary of sort range");
          // TODO: split the coverInfo
        }
        else
          sortRow.getCoverList().add(0, cell);
        coverCells.remove(cell);
        this.deleteCoverInfoInColumn(cell);
      }
    }
    LOG.log(Level.INFO, "cutRangeData ( startRow: {0}, endRow: {1}, startCol: {2}, endCol: {3} ) return with {4} rows", new Object[] {
        startRow, endRow, startCol, endCol, sortRows.size() });
    return sortRows;
  }

  /**
   * pasted range indicated by {startRow, endRow, startCol, endCol) from the data in sortRows and with sortData reordered
   * 
   * @param startRow
   *          the start row index of the paste range, 1-based
   * @param endRow
   *          the end row index of the paste range, 1-based
   * @param startCol
   *          the start column index of the paste range, 1-based
   * @param endCol
   *          the end column index of the paste range, 1-based
   * @param sortRows
   *          the will be paste data
   * @param sortData
   *          the will be paste data need sort according to sortData before paste
   */
  private void pasteRangeData(int startRow, int endRow, int startCol, int endCol, List<Row> sortRows, JSONObject sortData)
  {
    // this flag means if check there are cells in the position which need to be replaced with the paste cells
    // this function here only support bCheckReplace=false, means not check
    // because all the cells in the paste range has already been cut before
    boolean bCheckReplace = false;
    Position sPos = ModelHelper.search(this.rows, startRow);
    int sr = sPos.index;
    if (sPos.isFind)
      sr = ModelHelper.divide(this.rows, sPos.index, startRow);
    else
      sr = sr < 0 ? 0 : sr;// get the last previous row of the range,
                           // if sr < 0 means that the row at startRow has not been found at the beginning,
                           // so it is not the last "previous" row of the range,
                           // so that should be (j=-1) in later to have one more loop which can contain the startRow
    Position ePos = ModelHelper.search(this.rows, endRow);
    int er = ePos.index;
    if (ePos.isFind)
      ModelHelper.divide(this.rows, ePos.index, endRow + 1);
    else
      er = er < 0 ? 0 : er;// get the last row in the range

    JSONArray sortResults = (JSONArray) sortData.get(ConversionConstant.SORT_RESULTS);
    int lastRIndex = endRow; // the iterator row index
    for (int i = er; i >= sr; i--)
    {
      int j = 0;// the looper index for the new sort rows between original two adjacent rows
      Row row = this.rows.get(i);
      int rIndex = row.getIndex();
      if (i == sr)
      {
        rIndex = startRow;
        if (rIndex < row.getIndex())
        {
          // if hitch here it must means that startRow is empty
          row = null;
          i = sr - 1;
          // then should insert the row at rIndex
          j = -1;
        }
      }
      // the empty rows count between two adjacent rows
      int cnt = lastRIndex - rIndex - 1;
      lastRIndex = rIndex;

      // insert sort rows into the current position of row list
      // and set correct row id and set this row as parent for each cell model
      ArrayList<Row> collectRows = new ArrayList<Row>();
      Row lastSortRow = null;
      for (; j < cnt; j++)
      {
        int index = rIndex + j + 1;
        int offsetRow = index - startRow;// the row index in the will be pasted range
        int actualOffsetRow = Integer.parseInt(sortResults.get(offsetRow).toString());// the paste row position in the sortRows
        Row sortRow = null;
        Row newRow = null;
        if (actualOffsetRow < sortRows.size())
          sortRow = sortRows.get(actualOffsetRow);
        if (sortRow == null)
        {
          if (row != null && j < row.getRepeatedNum())// TODO??
          {
            if (row != lastSortRow)
            {
              newRow = new Row(index, row);
              newRow.setRepeatedNum(0);
              lastSortRow = row;
              collectRows.add(newRow);
            }
            else
            {
              newRow = collectRows.get(collectRows.size() - 1);// the last row in collectRows
              newRow.setRepeatedNum(newRow.getRepeatedNum() + 1);
            }
          }
          continue;
        }
        if (sortRow != lastSortRow)
        {
          if (row != null && j < row.getRepeatedNum())
            newRow = new Row(index, row);
          else
            newRow = new Row(this, getIDManager().getRowIdByIndex(this.id, index, true));
          newRow.setRepeatedNum(0);
          cloneCells(sortRow, newRow, startCol, offsetRow - actualOffsetRow, 0);
        }
        else
        {
          newRow = collectRows.get(collectRows.size() - 1);// the last row in collectRows
          newRow.setRepeatedNum(newRow.getRepeatedNum() + 1);
          continue;
        }
        lastSortRow = sortRow;
        collectRows.add(newRow);
      }
      rows.addAll(i + 1, collectRows);
      // end empty rows
      if (row != null)
      {
        row.setRepeatedNum(0);
        // insert the cells of the sort rows into the current row
        int offsetRow = rIndex - startRow;// the row index in the will be pasted range
        int actualOffsetRow = Integer.parseInt(sortResults.get(offsetRow).toString());// the paste row position in the sortRows
        Row sortRow = null;
        if (actualOffsetRow < sortRows.size())
          sortRow = sortRows.get(actualOffsetRow);
        if (sortRow == null)
          continue;
        int rowDelta = offsetRow - actualOffsetRow;
        cloneCells(sortRow, row, startCol, rowDelta, 0);
      }
    }
    LOG.log(Level.INFO, "after pasteRangeData there are {0} rows", rows.size());
  }

  // clone the cells from row to newRow from the startCol index
  private void cloneCells(Row row, Row newRow, int startCol, int rowDelta, int colDelta)
  {
    // insert part of value cells
    Position pos = ModelHelper.search(newRow.getValueCells(), startCol);
    if (pos.isFind)
      LOG.log(Level.WARNING, "should not have value cell at {0}{1} when paste cells in sort range",
          new Object[] { ReferenceParser.translateCol(startCol), ReferenceParser.translateRow(newRow.getIndex()) });
    int insertIndex = pos.index < 0 ? 0 : pos.index + 1;
    List<ValueCell> vcells = row.getValueCells();
    newRow.getValueCells().addAll(insertIndex, vcells);
    // set parent for each cell and transform formula celll
    for (int c = 0; c < vcells.size(); c++)
    {
      ValueCell cell = vcells.get(c);
      cell.setParent(newRow);
      if (cell.isFormula() && cell.getFormulaCell() != null)
        ModelHelper.transformFormula(cell, rowDelta, 0);
    }
    // insert part of style cells
    pos = ModelHelper.search(newRow.getStyleCells(), startCol);
    if (pos.isFind)
      LOG.log(Level.WARNING, "should not have style cell at {0}{1} when paste cells in sort range",
          new Object[] { ReferenceParser.translateCol(startCol), ReferenceParser.translateRow(newRow.getIndex()) });
    insertIndex = pos.index < 0 ? 0 : pos.index + 1;
    List<StyleCell> scells = row.getStyleCells();
    for (int c = 0; c < scells.size(); c++)
    {
      StyleCell cell = scells.get(c);
      if (row.getRepeatedNum() > 0)
        cell = new StyleCell(cell);
      cell.setParent(newRow);
      newRow.getStyleCells().add(insertIndex, cell);
      insertIndex++;
    }
    pos = ModelHelper.search(newRow.getCoverList(), startCol);
    if (pos.isFind)
      LOG.log(Level.WARNING, "should not have cover cell at {0}{1} when paste cells in sort range",
          new Object[] { ReferenceParser.translateCol(startCol), ReferenceParser.translateRow(newRow.getIndex()) });
    insertIndex = pos.index < 0 ? 0 : pos.index + 1;
    List<CoverInfo> ccells = row.getCoverList();
    for (int c = 0; c < ccells.size(); c++)
    {
      CoverInfo cell = ccells.get(c);
      if (row.getRepeatedNum() > 0)
        cell = new CoverInfo(newRow, cell.getId(), cell.getColSpan(), cell.getRowSpan());
      cell.setParent(newRow);
      newRow.getCoverList().add(insertIndex, cell);
      this.insertCoverInfoInColumn(cell, -1, -1);
      insertIndex++;
    }
  }

  /**
   * Delete value cells, style cells and cover info between start column index to end col of the current row and all the cells behind endCol
   * or under the endRow should change parent row decided by delete direction
   * 
   * @param startRow
   *          1-based
   * @param endRow
   *          1-based
   * @param startCol
   *          1-based
   * @param endCol
   *          1-based
   * @param dir
   *          the direction for cell to shift up or left
   */
  public void deleteCells(int startRow, int endRow, int startCol, int endCol, int dir)
  {
  }

  /**
   * opposition of delete cells
   * 
   * @param startRow
   *          1-based
   * @param endRow
   *          1-based
   * @param startCol
   *          1-based
   * @param endCol
   *          1-based
   * @param dir
   */
  public void insertCells(int startRow, int endRow, int startCol, int endCol, int dir)
  {

  }

  /**
   * Delete the cover info from the columns
   * 
   * @param ci
   */
  public void deleteCoverInfoInColumn(CoverInfo ci)
  {
    int startColIndex = 0;
    int endColIndex = 0;
    int coverStartCol = ci.getIndex();
    int coverEndCol = coverStartCol + ci.getColSpan() - 1;
    Position pos = ModelHelper.search(this.columns, coverEndCol);
    if (pos.isFind)
    {
      endColIndex = pos.index;
    }
    else
    {
      LOG.log(Level.WARNING, "the coverInfo is not stored in the corresponding columns correctly");
      endColIndex = pos.index < 0 ? 0 : pos.index;
    }

    pos = ModelHelper.search(this.columns, coverStartCol);
    if (pos.isFind)
    {
      startColIndex = pos.index;
    }
    else
    {
      LOG.log(Level.WARNING, "the coverInfo is not stored in the corresponding columns correctly");
      startColIndex = pos.index < 0 ? 0 : pos.index + 1;
    }
    while (endColIndex >= startColIndex)
    {
      if (endColIndex < this.columns.size())
      {
        Column col = this.columns.get(endColIndex);
        col.getCoverList().remove(ci);
      }
      endColIndex--;
    }
  }

  /**
   * Insert the cover info in the columns
   * 
   * @param ci
   *          the same CoverInfo instance shared with row
   * @param startCol
   *          if > 0, only insert columns which index >= startCol
   * @param endCol
   *          if > 0, only insert columns which index <= endCol
   */
  public void insertCoverInfoInColumn(CoverInfo ci, int startCol, int endCol)
  {
    int startColIndex = 0;
    int endColIndex = 0;
    int coverStartCol = ci.getIndex();
    if (startCol > 0)
      coverStartCol = Math.max(startCol, coverStartCol);
    int coverEndCol = coverStartCol + ci.getColSpan() - 1;
    if (endCol > 0)
      coverEndCol = Math.min(endCol, coverEndCol);

    Position pos = ModelHelper.search(this.columns, coverStartCol);
    if (pos.isFind)
    {
      startColIndex = ModelHelper.divide(this.columns, pos.index, coverStartCol);
    }
    else
      startColIndex = pos.index < 0 ? -1 : pos.index + 1;

    pos = ModelHelper.search(this.columns, coverEndCol);
    if (pos.isFind)
    {
      endColIndex = pos.index;
      ModelHelper.divide(this.columns, pos.index, coverEndCol + 1);
    }
    else
      endColIndex = pos.index < 0 ? -1 : pos.index;
    int index = coverEndCol + 1;
    int colIndex = coverStartCol;
    while (endColIndex >= startColIndex)
    {
      int endIndex = 0;
      if (endColIndex >= 0 && endColIndex < this.columns.size())
      {
        Column col = this.columns.get(endColIndex);
        col.insertCoverInfo(ci);
        colIndex = col.getIndex();
        endIndex = colIndex + col.getRepeatedNum() + 1;
      }
      else
      {
        endIndex = colIndex = coverStartCol;
      }
      int delta = index - endIndex;
      if (delta > 0)
      {
        Column col = this.createColumn(endIndex);
        col.setRepeatedNum(delta - 1);
        col.insertCoverInfo(ci);
        this.columns.add(endColIndex + 1, col);
      }
      index = colIndex;
      endColIndex--;
    }
    int delta = index - coverStartCol;
    if (delta > 0)
    {
      Column col = this.createColumn(coverStartCol);
      col.setRepeatedNum(delta - 1);
      col.insertCoverInfo(ci);
      this.columns.add(endColIndex + 1, col);
    }
  }

  public Map<Integer, Map<Integer, FormulaCell>> getFormulaCellsMap()
  {
    return formulaCellsMap;
  }

  public void setFormulaCellsMap(Map<Integer, Map<Integer, FormulaCell>> formulaCellsMap)
  {
    this.formulaCellsMap = formulaCellsMap;
  }

  public IRawDataStorageAdapter getRawMetaRows()
  {
    return rawMetaRows;
  }

  public void setRawMetaRows(IRawDataStorageAdapter rawMetaRows)
  {
    this.rawMetaRows = rawMetaRows;
  }

  public IRawDataStorageAdapter getRawContentRows()
  {
    return rawContentRows;
  }

  public void setRawContentRows(IRawDataStorageAdapter rawContentRows)
  {
    this.rawContentRows = rawContentRows;
  }

  public String getType()
  {
    return type;
  }

  public void setType(String type)
  {
    this.type = type;
  }

  public String getVisibility()
  {
    return visibility;
  }

  public void setVisibility(String visibility)
  {
    this.visibility = visibility;
  }

  public void setColor(String color)
  {
    this.color = color;
  }

  public String getColor()
  {
    return color;
  }

  public boolean isSheetProtected()
  {
    return sheetProtected;
  }

  public void setSheetProtected(boolean sheetProtected)
  {
    this.sheetProtected = sheetProtected;
  }
  
  public boolean getOffGridLines()
  {
    return this.offGridLines;
  }
  
  public void setOffGridLines(boolean offGridLines)
  {
    this.offGridLines = offGridLines;
  }

  public String toString()
  {
    return new ToStringBuilder(this, ToStringStyle.SHORT_PREFIX_STYLE).append("name", sheetName).toString();
  }

  // ////////////////////////////NODEJS//////////////////////
  /**
   * get the cell model at the rowIndex and colIndex TODO: what about StyleCell
   * 
   * @param rowIndex
   *          1-based
   * @param colIndex
   *          1-based
   * @return cell model
   */
  public ValueCell getCell(int rowIndex, int colIndex)
  {
    ValueCell cell = null;
    Row row = getRow(rowIndex);
    if (row != null)
    {
      cell = row.getValueCell(colIndex);
      if (cell != null)
        cell.getInfo();
    }
    return cell;
  }

  /**
   * get the cells array of the given range
   * 
   * @param sr
   *          1-based
   * @param sc
   * @param er
   * @param ec
   * @return
   */
  public ValueCell[] getCells(int sr, int sc, int er, int ec)
  {
    ArrayList<ValueCell> retCells = new ArrayList<ValueCell>();
    Position pos = ModelHelper.search(rows, sr);
    int posRowIndex = pos.index;
    if (!pos.isFind)
      posRowIndex = posRowIndex < 0 ? 0 : posRowIndex + 1;
    while (posRowIndex < rows.size())
    {
      Row row = rows.get(posRowIndex++);
      int rowIndex = row.getIndex();
      if (rowIndex > er)
        break;
      else if (rowIndex < sr)
        continue;
      // start cells in row
      List<ValueCell> cells = row.getValueCells();
      pos = ModelHelper.search(cells, sc);
      int posCellIndex = pos.index;
      if (!pos.isFind)
        posCellIndex = posCellIndex < 0 ? 0 : posCellIndex + 1;
      while (posCellIndex < cells.size())
      {
        ValueCell cell = cells.get(posCellIndex++);
        int colIndex = cell.getIndex();
        if (colIndex > ec)
          break;
        if (cell != null)
          cell.getInfo();// get the public info field which is used directly by nodejs
        retCells.add(cell);
      }
      // end cells in row
      int cnt = row.getRepeatedNum();
      int count = er - rowIndex;
      if (count <= cnt)
      {
        // the last content row
        break;
      }
    }
    ValueCell[] vCells = new ValueCell[retCells.size()];
    retCells.toArray(vCells);
    return vCells;
  }

  /**
   * get the two dimension array of the given range by row if there is empty cells should use null to take space
   * 
   * @param sr
   *          1-based
   * @param sc
   * @param er
   * @param ec
   * @return
   */
  public ValueCell[][] getCellsByRow(int sr, int sc, int er, int ec, boolean bOptimize)
  {
    ArrayList<ValueCell[]> retCells = new ArrayList<ValueCell[]>();
    // ValueCell[][] retCells = new ValueCell[er-sr+1][];
    Position pos = ModelHelper.search(rows, sr);
    int posRowIndex = pos.index;
    if (!pos.isFind)
      posRowIndex = posRowIndex < 0 ? 0 : posRowIndex + 1;
    int colCnt = ec - sc + 1;
    while (posRowIndex < rows.size())
    {
      Row row = rows.get(posRowIndex++);
      int rowIndex = row.getIndex();
      if (rowIndex > er)
        break;
      else if (rowIndex < sr)
        continue;
      int emptyRowcnt = rowIndex - retCells.size() - sr;
      for (int i = 0; i < emptyRowcnt; i++)
      {
        ArrayList<ValueCell> retRow = new ArrayList<ValueCell>();
        if (!bOptimize)
        {
          for (int j = 0; i < colCnt; i++)
          {
            retRow.add(null);
          }
        }
        ValueCell[] retRowArray = new ValueCell[retRow.size()];
        retRow.toArray(retRowArray);
        retCells.add(retRowArray);
      }
      // start cells in row
      List<ValueCell> cells = row.getValueCells();
      ArrayList<ValueCell> retRow = new ArrayList<ValueCell>();
      pos = ModelHelper.search(cells, sc);
      int posCellIndex = pos.index;
      if (!pos.isFind)
        posCellIndex = posCellIndex < 0 ? 0 : posCellIndex + 1;
      while (posCellIndex < cells.size())
      {
        ValueCell cell = cells.get(posCellIndex++);
        int colIndex = cell.getIndex();
        if (colIndex > ec)
          break;
        int cnt = colIndex - retRow.size() - sc;
        for (int i = 0; i < cnt; i++)
          retRow.add(null);
        if (cell != null)
          cell.getInfo();
        retRow.add(cell);
      }

      if (!bOptimize)
      {
        int cnt = ec - retRow.size() - sc;
        for (int i = 0; i < cnt; i++)
          retRow.add(null);
      }
      ValueCell[] retRowArray = new ValueCell[retRow.size()];
      retRow.toArray(retRowArray);
      retCells.add(retRowArray);
      // end cells in row

      int cnt = row.getRepeatedNum();
      int count = er - rowIndex;
      if (count <= cnt)
      {
        // the last content row
        cnt = count;
        if (!bOptimize)
        {
          for (int i = 0; i < cnt; i++)
          {
            ArrayList<ValueCell> retRow1 = new ArrayList<ValueCell>();
            for (int j = 0; i < colCnt; i++)
            {
              retRow1.add(null);
            }
            retRowArray = new ValueCell[retRow1.size()];
            retRow1.toArray(retRowArray);
            retCells.add(retRowArray);
          }
        }
        break;
      }
    }
    if (!bOptimize)
    {
      int cnt = er - retCells.size() - sr;
      for (int i = 0; i < cnt; i++)
        retCells.add(null);
    }
    ValueCell[][] vCells = new ValueCell[retCells.size()][];
    retCells.toArray(vCells);
    return vCells;
  }
}
