package com.ibm.concord.spreadsheet.document.model.impl;

import java.io.IOException;
import java.util.ArrayList;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.builder.ToStringBuilder;
import org.apache.commons.lang.builder.ToStringStyle;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.impl.io.ContentRowDeserializer;
import com.ibm.concord.spreadsheet.document.model.impl.io.ModelIOFactory;
import com.ibm.concord.spreadsheet.document.model.impl.io.ModelIOFactory.LoadMode;
import com.ibm.concord.spreadsheet.document.model.impl.io.swap.IRawDataStorageAdapter;
import com.ibm.concord.spreadsheet.document.model.impl.io.swap.ISwapInCapable;
import com.ibm.concord.spreadsheet.document.model.impl.io.swap.SwapInOnlyList;
import com.ibm.concord.spreadsheet.document.model.style.StyleManager;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.IMapEntryListener;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.Position;
import com.ibm.json.java.JSONObject;

public class Row extends BasicModel implements ISwapInCapable
{
  private static final Logger LOG = Logger.getLogger(Row.class.getName());
  
  private int height;

  private Visibility visibility;

  private int repeatedNum;

  private List<ValueCell> valueCells;

  private List<StyleCell> styleCells;

  private List<CoverInfo> coverList;
  
  private Map<Integer, FormulaCell> rowFormulaCellsMap;

  private Sheet parent;
  
  private IRawDataStorageAdapter rawContentCells;
  
  private ContentRowDeserializer contentRowDeserializer;
  
  private boolean swappingIn;

  public Row(Sheet parent, int id)
  {
    this.id = id;
    this.parent = parent;
    this.height = 0;
    this.visibility = null;
    this.repeatedNum = 0;
    
    this.coverList = new ArrayList<CoverInfo>();
    if (ModelIOFactory.LOAD_MODE == LoadMode.ALL)
    {
      this.valueCells = new ArrayList<ValueCell>();
      this.styleCells = new ArrayList<StyleCell>();
    }
    else
    {
      contentRowDeserializer = parent.getParent().getContentRowDeserializer();
      this.valueCells = new SwapInOnlyList<ValueCell>(new ArrayList<ValueCell>(), this); 
      this.styleCells = new SwapInOnlyList<StyleCell>(new ArrayList<StyleCell>(), this);
      swappingIn = false;
    }
  }

  /**
   * copy all the attributes and stylecells in row model
   * 
   * @param index
   * @param row
   */
  public Row(int index, Row row)
  {
    if (null == row)
      return;
    this.parent = row.getParent();
    this.id = this.getIDManager().getRowIdByIndex(this.parent.getId(), index, true);
    this.valueCells = new ArrayList<ValueCell>();
    this.styleCells = new ArrayList<StyleCell>();
    this.coverList = new ArrayList<CoverInfo>();
    List<StyleCell> sCells = row.getStyleCells();
    if (null != sCells)
    {
      int styleCellCnt = sCells.size();
      for (int i = 0; i < styleCellCnt; i++)
      {
        StyleCell cell = sCells.get(i);
        StyleCell nCell = new StyleCell(cell);
        nCell.setParent(this);
        this.styleCells.add(nCell);
      }
    }
    this.setHeight(row.getHeight());
    this.setVisibility(row.getVisibility());
    this.setRepeatedNum(row.getRepeatedNum());
  }
  
  public void loadContentFromJSON(JSONObject rowData)
  {
    if(null == rowData)
      return;
    //load row meta
    Object v = rowData.get(ConversionConstant.HEIGHT);
    if(null != v)
    {
      int h = Integer.parseInt(v.toString());
      if(h > 0)
        this.setHeight(h);
    }
    v = rowData.get(ConversionConstant.REPEATEDNUM);
    if(null != v)
      this.setRepeatedNum(Integer.parseInt(v.toString()));
    v = rowData.get(ConversionConstant.VISIBILITY);
    if(null != v)
      this.setVisibility(visibility.toVisibility(v.toString()));
    
    final IDManager idManger = this.getIDManager();
    StyleManager styleManager = this.getStyleManager();
    //load cells
    JSONObject cells = (JSONObject)rowData.get(ConversionConstant.CELLS);
    if(null != cells && !cells.isEmpty())
    {
      Iterator<?> it = cells.entrySet().iterator();
      
      while(it.hasNext())
      {
        Map.Entry<?,?> entry = (Map.Entry<?,?>) it.next();
        String strColIndex = (String)entry.getKey();
        int colIndex = ReferenceParser.translateCol(strColIndex);
        JSONObject cell = (JSONObject)entry.getValue();
        int colId = idManger.getColIdByIndex(this.parent.getId(), colIndex, true);
        ValueCell vCell = null;
        //value cel
        v = cell.get(ConversionConstant.VALUE);
        if(null != v)
        {
          vCell = new ValueCell(this,colId);
          vCell.setValue(v, true);
          this.insertValueCell(vCell);
        }
        v = cell.get(ConversionConstant.LINK);
        if(null != v)
        {
          if(null == vCell)
          {  
            vCell = new ValueCell(this,colId);
            this.insertValueCell(vCell);
          }  
          vCell.setLink(v.toString());
        }  
        //style cell
        v = cell.get(ConversionConstant.STYLE);
        if(null != v)
        {
          StyleObject style = styleManager.addStyle((JSONObject)v);
          v = cell.get(ConversionConstant.REPEATEDNUM);
          int repeatedNum = (null == v) ? 0 : Integer.parseInt(v.toString());
          StyleCell sCell = new StyleCell(this,colId);
          sCell.setRepeatedNum(repeatedNum);
          sCell.setStyle(style);
          this.insertStyleCell(sCell);
        }
        //cover info
        int colSpan = 1;
        int rowSpan = 1;
        v = cell.get(ConversionConstant.COLSPAN);
        if(null != v)
        {
          colSpan = Integer.parseInt(v.toString());
        }
        v = cell.get(ConversionConstant.ROWSPAN);
        if(null != v)
          rowSpan = Integer.parseInt(v.toString());
        if(rowSpan > 1 || colSpan > 1){
          CoverInfo ci = new CoverInfo(this,colId,colSpan,rowSpan);
          this.insertCoverInfo(ci);
          this.parent.insertCoverInfoInColumn(ci, -1, -1);
        } else {
          v = cell.get(ConversionConstant.ISCOVERED);
          if(null != v && (Boolean.parseBoolean(v.toString()) == true)){
            List<Column> cols = this.parent.getColumns();
            Position pos = ModelHelper.search(cols, colIndex);
            if(pos.isFind)
            {
              Column coverCol = cols.get(pos.index);
              int rowIndex = this.getIndex();
              //first check if this covered cell is belong to the inserted rows
              CoverInfo cover = coverCol.getCoverInfo(rowIndex);
              if(cover == null) 
              {
                //if not belong, then check if it should be enlarged with the upper cover cell
                cover = coverCol.getCoverInfo(rowIndex - 1);
                if(cover != null)
                {
                  int startRow = cover.getRowIndex();
                  if(startRow + cover.getRowSpan() <= rowIndex)
                    cover.setRowSpan(rowIndex + this.getRepeatedNum() + 1 - startRow);
                }
              }
            }
          }
        }
      }
    }  
  }
  public int getHeight()
  {
    return this.height;
  }

  public void setHeight(int h)
  {
    this.height = h;
  }

  public boolean isVisible()
  {
    if(null == this.visibility) 
      return true;
    return false;
  }
  
  public Visibility getVisibility()
  {
    return visibility;
  }

  public void setVisibility(Visibility visibility)
  {
    this.visibility = visibility;
  }

  public int getRepeatedNum()
  {
    return this.repeatedNum;
  }

  public void setRepeatedNum(int num)
  {
    this.repeatedNum = num;
  }
  
  public ValueCell getValueCell(int index)
  {
    Position pos = ModelHelper.search(this.valueCells, index);
    if(pos.isFind)
      return this.valueCells.get(pos.index);
    return null;
  }
  
  public StyleCell getStyleCell(int index)
  {
    Position pos = ModelHelper.search(this.styleCells, index);
    if(pos.isFind)
      return this.styleCells.get(pos.index);
    return null;
  }
  
  public CoverInfo getCoverInfo(int index)
  {
    Position pos = ModelHelper.search(this.coverList, index);
    if(pos.isFind)
      return this.coverList.get(pos.index);
    return null;
  }
  
  public List<StyleCell> getStyleCells()
  {
    return this.styleCells;
  }

  public List<ValueCell> getValueCells()
  {
    return valueCells;
  }

  public List<CoverInfo> getCoverList()
  {
    return this.coverList;
  }
  
  public int insertValueCell(ValueCell vc)
  {
    Position pos = ModelHelper.insert(this.valueCells, vc);
    if(pos.isFind)
    {
      LOG.log(Level.WARNING, " value cell at{0} is already existed!! " + vc.getIndex());
    }  
    return pos.index;
  }
  
  
  public int insertStyleCell(StyleCell sc)
  {
    Position pos =  ModelHelper.insert(this.styleCells, sc);
    if(pos.isFind)
    {
      LOG.log(Level.WARNING, " style cell at{0} is already existed!! " + sc.getIndex());
    }
    return ModelHelper.merge(this.styleCells, pos.index);
  }
  
  public int insertCoverInfo(CoverInfo ci)
  {
    Position pos = ModelHelper.insert(this.coverList, ci);
    if(pos.isFind)
    {
      LOG.log(Level.WARNING, " cover info at{0} is already existed!! " + ci.getIndex());
    }  
    return pos.index;
  }
  
  public Sheet getParent()
  {
    return this.parent;
  }

  public IDManager getIDManager()
  {
    return parent.getIDManager();
  }

  public StyleManager getStyleManager()
  {
    return this.parent.getParent().getStyleManager();
  }
  
  public StyleCell createStyleCell(int colIndex)
  {
    if (colIndex <= 0)
      return null;
    int sheetId = this.parent.getId();
    int cId = this.getIDManager().getColIdByIndex(sheetId, colIndex, true);
    StyleCell sCell = new StyleCell(this, cId);
    return sCell;
  }
  
  public ValueCell createValueCell(int colIndex,Object value)
  {
    if(colIndex <= 0) 
      return null;
    int sheetId = this.parent.getId();
    int cId = this.getIDManager().getColIdByIndex(sheetId, colIndex, true);
    ValueCell vCell = new ValueCell(this,cId);
    vCell.setValue(value, true);
    return vCell;
  }
  
  public int getIndex()
  {
    return this.getIDManager().getRowIndexById(this.parent.getId(), this.id);
  }

  public void copy(BasicModel model)
  {
    if (null == model)
      return;
    Row row = (Row) model;
    List<StyleCell> sCells = row.getStyleCells();
    if (null != sCells)
    {
      int styleCellCnt = sCells.size();
      for (int i = 0; i < styleCellCnt; i++)
      {
        StyleCell cell = sCells.get(i);
        StyleCell nCell = new StyleCell(this, cell.getId());
        nCell.setRepeatedNum(cell.getRepeatedNum());
        nCell.setStyle(cell.getStyle());
        this.styleCells.add(nCell);
      }
    }
    this.setHeight(row.getHeight());
    this.setVisibility(row.getVisibility());
  }

  /**
   * if this row only contain styleCells or height, it is repeatable which means it's repeatedNum could be > 0
   * @return
   */
  public boolean isRepeatable()
  {
    if(this.valueCells.size() > 0 || this.coverList.size() > 0)
      return false;
    if(this.styleCells.size() > 0 || this.height > 0) 
      return true;
    return false;
  }
  
  public boolean isContainStyle()
  {
    if(this.styleCells.size() > 0 || this.height > 0) 
      return true;
    return false;
  }
  /**
   *  only if the row contain ConversionConstant.MAX_COL_NUM style cell, and all continuous in index
   *  means this row contain row style
   */
  public boolean isContainRowStyle()
  {
    int size = this.styleCells.size();
    if(0 == size) return false;
    int totalCnt = 0;
    for(int i = 0; i < size; i++)
    {
      StyleCell sCell = this.styleCells.get(i);
      totalCnt += sCell.getRepeatedNum() + 1;
    }  
    return totalCnt >= ConversionConstant.THRES_ROW_STYLE;
  }
  
  /**
   * when isContainRowStyle() return true, this method return the row style 
   * otherwise, the result make no sense
   * @return
   */
  public StyleObject getRowStyle()
  {
    int size = this.styleCells.size();
    if(0 == size) return null;
    StyleCell sCell = this.styleCells.get(size -1);
    return sCell.getStyle();
  }
  
  public boolean isContainValue()
  {
    if(this.valueCells.size() > 0 || this.coverList.size() > 0)
      return true;
    return false;
  }
  
  /**
   * compact the repeatedNum of the style cells  
   */
  public void compactStyleCells()
  {
    int size = this.styleCells.size();
    if(size == 0) return;
    for(int i = size -1; i >= 0; i--)
    {
      ModelHelper.merge(this.styleCells, i, Direction.FORWARD);
    }  
  }
  
  public boolean isHasSameStyleCells(Row row)
  {
    if(null == row) return false;
    int cSize = this.styleCells.size();
    List<StyleCell> otherStyleCells = row.getStyleCells();
    int oSize = otherStyleCells.size();
    if(cSize != oSize)
      return false;
    for(int i = 0; i < cSize; i++)
    {
      if(!this.styleCells.get(i).equals(otherStyleCells.get(i)))
        return false;
    }  
    return true;
  }
  
  public CoverInfo mergeCells(int sCIndex, int eCIndex, int rowSpan)
  {
    // workaround for 49736: swap in row model here, or coverinfo 
    // will be overwrite later if row model is swap out
    getValueCell(0);
    int colSpan = eCIndex - sCIndex + 1;
    int colId = this.getIDManager().getColIdByIndex(this.parent.getId(), sCIndex, true);
    CoverInfo cover = new CoverInfo(this, colId, colSpan, rowSpan);
    ModelHelper.insert(this.coverList, cover);
    this.parent.insertCoverInfoInColumn(cover, -1, -1);
    return cover;
  }

  public void splitCells(int sCIndex, int eCIndex)
  {
    if (0 == this.coverList.size())
      return;
    // workaround for 49736: swap in row model here, or coverinfo 
    // will be overwrite later if row model is swap out
    getValueCell(0);
    Position pos = ModelHelper.search(this.coverList, eCIndex);
    int index = pos.index;
    for (int i = index; i >= 0; i--)
    {
      CoverInfo ci = this.coverList.get(i);
      int sc = ci.getIndex();
      int ec = sc + ci.getColSpan() -1;
      if(ec >= sCIndex){
        this.coverList.remove(i);
        this.parent.deleteCoverInfoInColumn(ci);
        ci.remove();
      }
      else
        break;
    }
  }
  

  public boolean isMergable(BasicModel model)
  {
    if(null == model)
      return false;
    Row nRow = (Row) model;
    int curSIndex = this.getIndex();
    int curEIndex = curSIndex + this.getRepeatedNum();
    
    int nSIndex = nRow.getIndex();
    int nEIndex = nSIndex + nRow.getRepeatedNum();
    if(curEIndex + 1 == nSIndex || nEIndex + 1 == curSIndex)
    {
      if(this.getHeight() != nRow.getHeight())
        return false;
      if(this.getVisibility() != nRow.getVisibility())
        return false;
      if(this.isContainValue() || nRow.isContainValue())
        return false;
      if(!this.isContainStyle() || !nRow.isContainStyle())
        return false;
      //need compact the style cells?
      this.compactStyleCells();
      nRow.compactStyleCells();
      return this.isHasSameStyleCells(nRow);
    }  
    return false;
  }

  /**
   * clear the cell's value from start column index to the end column index
   * @param sCIndex the clear cells start column index 1-based
   * @param eCIndex the clear cells end column index 1-based, -1 means the last value cell
   */
  public void clearCells(int sCIndex, int eCIndex)
  {
    int size = this.valueCells.size();
    if(size == 0)
      return;
    int index = 0;
    if(sCIndex > 1)
    {
      Position pos = ModelHelper.search(this.valueCells, sCIndex);
      index = pos.index;
      if (!pos.isFind)
      {
        index = pos.index < 0 ? 0 : (pos.index + 1);
      }
    }
    while (index < size)
    {
      ValueCell cell = this.valueCells.get(index);
      int cIndex = cell.getIndex();
      if(eCIndex != -1 && cIndex > eCIndex)
        break;
      cell.setValue("", true);
      index++;
    }
  }
  
  public void deleteStyleCells(int startCol, int endCol)
  {
    Position pos = ModelHelper.search(styleCells, endCol);
    int index = pos.index;
    if(pos.isFind)
      ModelHelper.divide(styleCells, index, endCol+1);
    boolean bEnd = false;
    for(int j = index; j >= 0; j-- )
    {
      StyleCell cell = styleCells.get(j);
      int cIndex = cell.getIndex();
      if( cIndex + cell.getRepeatedNum() < startCol)
        break;
      if( cIndex < startCol )
      {
        ModelHelper.divide(styleCells, j, startCol);
        j++;
        cell = styleCells.get(j);
        bEnd = true;
      }
      styleCells.remove(cell);
      if(bEnd)
        break;
    }
  }
  
  /**
   * Delete the cover cells between startCol and endCol
   * @param startCol
   * @param endCol
   * @param bDeleteAnyway true will delete the cover cell
   *            if the cover cell is located in range startCol ~ endCol, even the master cell's index is less than startCol
   *                      false will change the colSpan if master cell's index is less than startCol
   *            
   */
  public void deleteCoverCells(int startCol, int endCol, boolean bDeleteAnyway)
  {
    Position pos = ModelHelper.search(this.coverList, endCol);
    for (int j = pos.index; j >= 0; j--)
    {
      CoverInfo cInfo = this.coverList.get(j);
      int sIndex = cInfo.getIndex();
      int colSpan = cInfo.getColSpan();
      int rowSpan = cInfo.getRowSpan();
      int eIndex = sIndex + colSpan - 1;
      if (eIndex < startCol)
        break;
      boolean delete = false;
      if(bDeleteAnyway)
        delete = true;
      else
      {
        // the master cell would be deleted
        if (sIndex >= startCol && sIndex <= endCol)
          delete = true;
        else
        {
          int dEIndex = (eIndex < endCol) ? eIndex : endCol;
          int delta = dEIndex - startCol + 1;
          int newColSpan = colSpan - delta;
          if (newColSpan <= 1 && rowSpan <= 1)
            delete = true;
          else
            cInfo.setColSpan(newColSpan);
        }
      }
      if (delete)
      {
        cInfo = this.coverList.remove(j);
        this.parent.deleteCoverInfoInColumn(cInfo);
        cInfo.remove();
      }
    }
  }
  /**
   * Set values in current row.
   * @param data
   */
  @SuppressWarnings("unchecked")
  public void setValues(JSONObject data)
  {
    JSONObject cellsData = (JSONObject) data.get(ConversionConstant.CELLS);
    if (cellsData == null)
    {
      return;
    }

    ModelHelper.iterateMap(cellsData, new IMapEntryListener<String, JSONObject>()
    {
      public boolean onEntry(String columnName, JSONObject cellData)
      {
        Object value = cellData.get(ConversionConstant.VALUE);
        String link = (String) cellData.get(ConversionConstant.LINK);
        if (value != null || link != null)
        {
          int columnIndex = ReferenceParser.translateCol(columnName);
          Position pos = ModelHelper.search(valueCells, columnIndex);
          ValueCell vc;
          if (pos.isFind)
          {
            vc = valueCells.get(pos.index);
          }
          else
          {
            int columnId = getIDManager().getColIdByIndex(parent.getId(), columnIndex, true);
            vc = new ValueCell(Row.this, columnId);
            ModelHelper.insert(valueCells, vc, pos.index + 1);
          }
          if (value != null)
          {
            vc.setValue(value, true);
          }
          
          if (link != null)
          {
            vc.setLink(link);
          }
        }
        
        return false;
      }
    });
  }
  
  public String toString()
  {
    ToStringBuilder b = new ToStringBuilder(this, ToStringStyle.SHORT_PREFIX_STYLE);
    b.append("index", getIndex()); //
    if (repeatedNum > 0)
    {
      b.append("r", repeatedNum);
    }
    if (height > 0)
    {
      b.append("height", height); //
    }
    if (visibility != null)
    {
      b.append("vis", visibility); //
    }
    return b.toString();
  }

  public Map<Integer, FormulaCell> getRowFormulaCellsMap()
  {
    return rowFormulaCellsMap;
  }

  public void setRowFormulaCellsMap(Map<Integer, FormulaCell> rowFormulaCellsMap)
  {
    this.rowFormulaCellsMap = rowFormulaCellsMap;
  }

  public IRawDataStorageAdapter getRawContentCells()
  {
    return rawContentCells;
  }

  public void setRawData(IRawDataStorageAdapter rawData)
  {
    this.rawContentCells = rawData;
  }

  public void swapIn()
  {
    if (swappingIn)
    {
      // if it is already in swapping, do nothing
      return;
    }
    
    try
    {
      if (rawContentCells != null && !rawContentCells.isEmpty() && !swappingIn)
      {
        swappingIn = true;
        
        contentRowDeserializer.setRootRule(ModelIOFactory.getInstance().getContentSheetRowRule());
        
        contentRowDeserializer.setSheet(parent);
        contentRowDeserializer.setRow(this);
        
        contentRowDeserializer.deserialize(rawContentCells);
        
        rawContentCells.clear();
      }
    }
    catch (Exception ex)
    {
      throw new RuntimeException(ex);
    }
    finally
    {
      if (swappingIn)
      {
        // we must clear raw data whatever it takes in the end of swapIn()
        rawContentCells = null;
        // also clear formula cell map
        rowFormulaCellsMap = null;
        swappingIn = false;
      }
    }
  }

  @Override
  public void remove()
  {
    // remove style reference count
    int size = styleCells.size();
    for (int j = 0; j < size; j++)
      styleCells.get(j).remove();//set null style and reset parent
    styleCells.clear();
    // remove formula reference count
    size = valueCells.size();
    for (int j = 0; j < size; j++)
    {
      ValueCell vc = valueCells.get(j);
      vc.remove();//set empty value and reset parent
    }
    valueCells.clear();
    size = coverList.size();
    for(int j = 0; j < size; j++)
    {
      CoverInfo info = coverList.get(j);
      this.parent.deleteCoverInfoInColumn(info);
      info.remove();
    }
    coverList.clear();
    parent = null;
  }

  public void decompose()
  {
    List<ValueCell> cells = this.valueCells;
    for (int m = 0; m < cells.size(); m++)
    {
      ValueCell cell = cells.get(m);
      FormulaCell fc = cell.getFormulaCell();
      if (fc != null)
      {
        fc.reset();
        List<FormulaToken> tokens = fc.getTokenList();
        tokens.clear();
        tokens = null;
        fc = null;
      }
      cell.info = null;
      cell = null;
    }
    cells.clear();
    Map<Integer, FormulaCell> fCellMap = this.getRowFormulaCellsMap();
    if (fCellMap != null)
    {
      ModelHelper.iterateMap(fCellMap, new IMapEntryListener<Integer, FormulaCell>(){

        public boolean onEntry(Integer key, FormulaCell fc)
        {
          fc = null;
          return false;
        }
      });
      fCellMap.clear();
      fCellMap = null;
    }
    List<StyleCell> sCells = this.getStyleCells();
    sCells.clear();
    sCells = null;
    List<CoverInfo> cInfos = this.getCoverList();
    cInfos.clear();
    cInfos = null;
  }
}
