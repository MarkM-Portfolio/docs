package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.builder.HashCodeBuilder;

import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.impl.BasicModel;
import com.ibm.concord.spreadsheet.document.model.impl.Column;
import com.ibm.concord.spreadsheet.document.model.impl.CoverInfo;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.FormulaCell;
import com.ibm.concord.spreadsheet.document.model.impl.Row;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.impl.StyleCell;
import com.ibm.concord.spreadsheet.document.model.impl.ValueCell;
import com.ibm.concord.spreadsheet.document.model.impl.Visibility;
import com.ibm.concord.spreadsheet.document.model.impl.io.swap.IRawDataStorageAdapter;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;

public class SheetContentIteratorImpl implements ISheetContentIteratorWithRawData<Sheet>
{
  private static final Logger LOG = Logger.getLogger(SheetContentIteratorImpl.class.getName());

  private Row currentRow;

  private StyleObject defaultCellStyle;

  private List<Row> rows;

  private List<ValueCell> valueCells;

  private List<StyleCell> styleCells;

  private List<CoverInfo> coverInfos;
  
  private Map<Integer, CoverInfo> coverMap;

  private List<Column> columns;

  private int pRow, pCoverInfo, pValueCell, pStyleCell;

  private Object cellValue, cellCalcValue;
  
  private int cellType;

  private int cellStringIndex;

  // styleObject got from style cells
  private StyleObject cellStyle;

  // returned cell style in getCellStyle()
  private StyleObject returnedStyleCell;

  // flag that cellStyle got from style cells have been updated with column style data
  private boolean cellStyleUpdated;

  private String cellLink;

  private List<FormulaToken> formulaTokens;
  
  private int formulaErrProps;
  
  private boolean bCellDirty;

  private int cellStyleRepeat, cellColspan, cellRowspan, cellCoveredRepeat, cellRepeatDelta;

  // 1-based cell column index for current iteration
  private int cellIndex;

  // 1-base cell column index for the smallest possible index right after this iteration,
  // that is, cellIndex + (current iteration repeat) + 1
  private int nextCellIndex;

  // 1 based cell column index, of the cell that nearest to cellIndex but is not a styled cell,
  // would be Integer.MAX_VALUE if such cell not exists
  private int nextNonStyleCellIndex;

  private HashCodeBuilder rowHashCodeBuilder;

  // inner column iterator for content iterating, the latter for public column iteration methods defined in interface
  private ColumnIterator innerColumnIterator, columnIterator;

  private Sheet sheet;


  public SheetContentIteratorImpl(Document d)
  {
    columnIterator = new ColumnIterator();
    innerColumnIterator = new ColumnIterator();
    defaultCellStyle = d.getStyleManager().getDefaultCellStyle();
  }

  public void setSheetModel(Sheet st)
  {
    rows = st.getRows();
    columns = st.getColumns();
    sheet = st;
  }

  public void firstRow()
  {
    pRow = 0;

    currentRow = null;

    valueCells = null;
    styleCells = null;
    coverInfos = null;
    coverMap = null;
  }

  public void nextRow()
  {
    if (!hasNextRow())
    {
      throw new NoSuchElementException("no more rows");
    }
    if (currentRow != null)
    {
      pRow = forwardModelList(rows, currentRow.getIndex() + 1, pRow);
    }
    if (pRow < rows.size())
    {
      currentRow = rows.get(pRow++);
      valueCells = currentRow.getValueCells();
      styleCells = currentRow.getStyleCells();
      coverInfos = currentRow.getCoverList();
      coverMap = null;
      rowHashCodeBuilder = new HashCodeBuilder();
      // reset column iterator
      innerColumnIterator.firstColumn();
      if (innerColumnIterator.hasNextColumn())
      {
        innerColumnIterator.nextColumn();
      }
    }
    else
    {
      currentRow = null;
      valueCells = null;
      styleCells = null;
      coverInfos = null;
      coverMap = null;
      rowHashCodeBuilder = null;
    }
  }

  public boolean hasNextRow() throws NoSuchElementException
  {
    return pRow < rows.size();
  }

  public boolean isRowEmpty()
  {
    if (currentRow == null)
    {
      return true;
    }

    if (currentRow != null)
    {
      return false;
    }

    // check row content cells stream first
    if (currentRow.getRawContentCells() != null && !currentRow.getRawContentCells().isEmpty())
    {
      return false;
    }

    if (valueCells.size() > 0 || styleCells.size() > 0 || coverInfos.size() > 0)
    {
      return false;
    }

    if (getRowHeight() > 0)
    {
      return false;
    }

    if (getRowVisbility() != null && getRowVisbility() != Visibility.VISIBLE)
    {
      return false;
    }

    if (getRowRepeat() > 0)
    {
      return false;
    }

    return true;
  }

  public int getRowId()
  {
    return currentRow.getId();
  }

  public int getRowIndex()
  {
    return currentRow.getIndex();
  }

  public int getRowHeight()
  {
    return currentRow.getHeight();
  }

  public int getRowRepeat()
  {
    return currentRow.getRepeatedNum();
  }

  public Visibility getRowVisbility()
  {
    return currentRow.getVisibility();
  }

  public int getRowContentHash()
  {
    if (rowHashCodeBuilder != null)
    {
      return rowHashCodeBuilder.toHashCode();
    }
    else
    {
      return 0;
    }
  }

  public IRawDataStorageAdapter getRowRawContentCells()
  {
    return currentRow.getRawContentCells();
  }

  public Map<Integer, FormulaCell> getRowFormulaCellsMap()
  {
    return currentRow.getRowFormulaCellsMap();
  }

  public void firstCell()
  {
    pStyleCell = 0;
    pValueCell = 0;
    pCoverInfo = 0;

    cellValue = null;
    cellCalcValue = null;
    bCellDirty = false;
    
    cellStyle = null;
    cellStyleUpdated = false;
    cellLink = null;
    cellStringIndex = -1;

    cellStyleRepeat = 0;
    cellColspan = 1;
    cellRowspan = 1;
    cellCoveredRepeat = 0;
    cellRepeatDelta = 0;

    cellIndex = 0;
    nextCellIndex = 0;
    nextNonStyleCellIndex = Integer.MAX_VALUE;
  }

  /**
   * <p>
   * Get next logical cell that represents data, that including at least one item of following,
   * <ul>
   * <li>value
   * <li>link
   * <li>colspan
   * <li>iscovered
   * <li>style
   * <li>repeatnum
   * </ul>
   */
  public void nextCell() throws NoSuchElementException
  {
    if (!hasNextCell())
    {
      throw new NoSuchElementException();
    }

    // get nextCell logical data "candidates" from valueCells, styleCells and coverInfos,
    // current state is cell id, cell column index, cell value, cell link, cell colspan is consumed,
    // styleRepeat and coveredRepeat decreased by cellRepeatDelta,
    // all pointers point to next cell going to process

    // consume repeat from previous iteration
    cellStyleRepeat -= cellRepeatDelta + 1;
    cellCoveredRepeat -= cellRepeatDelta + 1;
    // the smallest possible next cellIndex this iteration may got,
    // it is the index if one of the repeats (style or coverinfo) continue.
    nextCellIndex = cellIndex + cellRepeatDelta + 1;
    // if colspan exists, turn colspan to coveredRepeat
    if (cellColspan > 1)
    {
      cellCoveredRepeat = cellColspan - 1;
    }
    // reset colspan
    cellColspan = 1;
    cellRowspan = 1;
    // index of next colspan cell or value cell
    nextNonStyleCellIndex = Integer.MAX_VALUE;

    // get valueCell candidate
    int valueCellIndex = Integer.MAX_VALUE;
    pValueCell = forwardModelList(valueCells, nextCellIndex, pValueCell);
    if (pValueCell < valueCells.size())
    {
      ValueCell vc = valueCells.get(pValueCell);
      // refresh cell id and column
      valueCellIndex = vc.getIndex();
    }
    // else, no more value cells
    // clear cell value for now
    cellValue = null;
    cellCalcValue = null;
    bCellDirty = false;
    cellLink = null;
    cellStringIndex = -1;
    formulaTokens = null;
    cellType = 0;
    formulaErrProps = FormulaUtil.FormulaErrProperty.NONE.getValue();
    // get coverInfos candidate, the cell is to write "iscovered" ("ic") or "colspan" ("cs") data.
    int coverInfoIndex = Integer.MAX_VALUE;
    if (cellCoveredRepeat <= 0)
    {
      // get next cell cover info
      pCoverInfo = forwardModelList(coverInfos, nextCellIndex, pCoverInfo);
      if (pCoverInfo < coverInfos.size())
      {
        CoverInfo ci = coverInfos.get(pCoverInfo);
        coverInfoIndex = ci.getIndex();
      }
      else
      {
        // no more cover infos
        cellColspan = 1;
        cellRowspan = 1;
      }
    }
    else
    {
      // have more coverInfo repeats,
      // coverInfoIndex would be next index
      coverInfoIndex = nextCellIndex;
    }

    // get style cell candidate
    int styleCellIndex = Integer.MAX_VALUE;
    if (cellStyleRepeat <= 0)
    {
      pStyleCell = forwardModelList(styleCells, nextCellIndex, pStyleCell);
      if (pStyleCell < styleCells.size())
      {
        StyleCell sc = styleCells.get(pStyleCell);
        styleCellIndex = sc.getIndex();
      }
      // else, no more style cells
      // previous cellStyle outdated, reset them
      // no more style cells
      cellStyle = null;
      cellStyleRepeat = 0;
    }
    else
    {
      // have more style repeats,
      // styleCellIndex would be next index
      styleCellIndex = nextCellIndex;
    }
    // anyway, clear and re-compute returnedCellStyle
    returnedStyleCell = null;
    cellStyleUpdated = false;

    // 3 candidates compete each other to win the nextCell() prize, i.e. what data to return in this iteration
    // get the smallest index from valueCellIndex, coverInfoIndex and styleCellIndex
    if (valueCellIndex > coverInfoIndex)
    {
      // coverInfo wins
      if (coverInfoIndex > styleCellIndex)
      {
        // choose styleCell
        nextStyleCell();
        // the coverInfo cell is nearest to the style cell
        nextNonStyleCellIndex = coverInfoIndex;
      }
      else if (coverInfoIndex == styleCellIndex)
      {
        // choose coverInfo and styleCell
        nextCoverInfo();
        nextStyleCell();
        if (cellCoveredRepeat > 0)
        {
          // is writing "iscovered" repeats, next stylecell, valuecell or colspan cell is the nearest cell
          nextNonStyleCellIndex = Math.min(peekNextValueCellIndex(), peekNextCoverInfoIndex());
          nextNonStyleCellIndex = Math.min(nextNonStyleCellIndex, peekNextStyleCellIndex());
        }
        else
        {
          // is writing "colspan",
          // current cell is the nearest cell
          nextNonStyleCellIndex = cellIndex;
        }
      }
      else
      {
        // choose coverInfo
        nextCoverInfo();
        if (cellCoveredRepeat > 0)
        {
          // is writing "iscovered" repeats, next stylecell, valuecell or colspan cell is the nearest cell
          nextNonStyleCellIndex = Math.min(peekNextValueCellIndex(), peekNextCoverInfoIndex());
          nextNonStyleCellIndex = Math.min(nextNonStyleCellIndex, peekNextStyleCellIndex());
        }
        // else, no need to set next non-style cell index, since the chosen one don't have a style
      }
    }
    else if (valueCellIndex == coverInfoIndex)
    {
      if (coverInfoIndex > styleCellIndex)
      {
        // choose styleCell
        nextStyleCell();
        // value cell index and the cover info index is the nearest non-style cell
        nextNonStyleCellIndex = valueCellIndex;
      }
      else if (coverInfoIndex == styleCellIndex)
      {
        // choose valueCell, coverInfo and styleCell
        nextValueCell();
        nextCoverInfo();
        nextStyleCell();
        // has value cell data, current cell is the nearest cell in all cases
        nextNonStyleCellIndex = cellIndex;
      }
      else
      {
        // choose valueCell, coverInfo
        nextValueCell();
        nextCoverInfo();
        // has value cell data, current cell is the nearest cell in all cases
        nextNonStyleCellIndex = cellIndex;
      }
    }
    else
    {
      // value cell wins
      if (valueCellIndex > styleCellIndex)
      {
        // choose styleCell
        nextStyleCell();
        // value cell index is the nearest to the style cell
        nextNonStyleCellIndex = valueCellIndex;
      }
      else if (valueCellIndex == styleCellIndex)
      {
        // choose valueCell and styleCell
        nextValueCell();
        nextStyleCell();
        // current cell is the nearest cell
        nextNonStyleCellIndex = cellIndex;
      }
      else
      {
        // choose valueCell
        nextValueCell();
        // no need to set non-style cell index
      }
    }

    forwardColumn();
    // hash everything that we have got
    hash();
  }

  public boolean hasNextCell() throws NoSuchElementException
  {
    if (pStyleCell < styleCells.size() || pValueCell < valueCells.size() || pCoverInfo < coverInfos.size())
    {
      // have more data in lists, of cause we have next cell
      return true;
    }

    // check repeat
    getCellRepeat();
    if (cellStyleRepeat - cellRepeatDelta - 1 > 0 || cellCoveredRepeat - cellRepeatDelta - 1 > 0)
    {
      // have more repeat to go, still we have next cell
      return true;
    }

    if (cellColspan > 1)
    {
      // have "iscovered" to write
      return true;
    }

    return false;
  }

  public boolean isCellEmpty()
  {
    if (getCellValue() != null || cellLink != null)
    {
      // has value
      return false;
    }

    if (getCellStyle() != null)
    {
      // has style
      return false;
    }

    if (cellColspan > 1 || cellRowspan > 1 || cellCoveredRepeat > 0)
    {
      // has covered info
      return false;
    }

    // have nothing, maybe but style repeat number
    return true;
  }

  public int getCellId()
  {
    return sheet.getIDManager().getColIdByIndex(sheet.getId(), cellIndex, true);
  }

  public int getCellIndex()
  {
    return cellIndex;
  }

  public StyleObject getCellStyle()
  {
    if (cellStyleUpdated)
    {
      return returnedStyleCell;
    }

    // check if the cell style is necessary
    cellStyleUpdated = true;
    if (cellStyle == null)
    {
      // no style
      returnedStyleCell = null;
    }
    else if (cellStyle == defaultCellStyle)
    {
      // if it is the original column id, keep the default cell style for preserve
      // because default cell style might means there are styles in this cell but none of them can be supported
      if (ModelHelper.isOriginalId(getCellId()) && ModelHelper.isOriginalId(getRowId()))
      {
        returnedStyleCell = cellStyle;
      }
      else
      // for default cell style, not necessary if the cell doesn't have any column style covering it
      // since columnIterator current column is the column that is nearest to it,
      // just need to ensure till the cell end, no column styles ahead
      if (innerColumnIterator.hasStyleTillIndex(null, getCellIndex() + getCellRepeat()))
      {
        // don't need the defaultCellStyle
        returnedStyleCell = null;
      }
      else
      {
        returnedStyleCell = cellStyle;
      }
    }
    else
    {
      if (cellStyle.isPreserved() && ModelHelper.isOriginalId(getRowId()))
      {
        // if current cell style is preserved, and the cell is in original row, (not a row added by editing), we need the style 
        returnedStyleCell = cellStyle;
      }
      else
      {
        // for any other cell style, not necessary if the cell have the column with the same style covering it
        // must make sure current column covers whole cell repeat range and have the certain style
        Column column = innerColumnIterator.currentColumn;
        if (column != null && column.getIndex() <= getCellIndex()
            && innerColumnIterator.hasStyleTillIndex(cellStyle, getCellIndex() + getCellRepeat()))
        {
          // don't need this style
          returnedStyleCell = null;
        }
        else
        {
          // check if it is a valid style,
          if (cellStyle.isEmpty())
          {
            if (LOG.isLoggable(Level.FINER))
            {
              LOG.log(Level.FINER, "ignoring cell empty style {0}.", cellStyle);
            }
            returnedStyleCell = null;
          }
          else
          {
            returnedStyleCell = cellStyle;
          }
        }
      }
    }

    return returnedStyleCell;
  }

  public int getCellRepeat()
  {
    // we have styelRepeat and coveredRepeat, we have current cellIndex, we have nextNonStyleCellIndex
    // get maximum possible repeat, between styleRpeat, coverRepeat and till nonStyleCellIndex

    int repeat = 0;

    if (cellStyleRepeat > 0)
    {
      // have style repeat
      repeat = cellStyleRepeat - 1;
    }

    if (cellCoveredRepeat > 0)
    {
      // have covered repeat
      if (cellStyleRepeat <= 0)
      {
        // didn't pick up style repeat, i.e. no style cell chosen in this iteration, pick up cover repeat
        repeat = cellCoveredRepeat - 1;
      }
      else
      {
        // choose between covered repeat and style repeat
        repeat = Math.min(repeat, cellCoveredRepeat - 1);
      }
    }

    if (nextNonStyleCellIndex < Integer.MAX_VALUE)
    {
      // have next non-style cell index
      if (repeat > 0)
      {
        // choose between repeat till next non-style cell, and current repeat
        repeat = Math.min(repeat, nextNonStyleCellIndex - cellIndex - 1);
      }
    }

    if (repeat < 0)
    {
      // repeat can be -1 if nextNonStyleCellIndex equals cellIndex
      repeat = 0;
    }

    // how much repeat does this call consume?
    cellRepeatDelta = repeat;
    return repeat;
  }

  public String getCellLink()
  {
    return cellLink;
  }

  public Object getCellValue()
  {
    if (cellValue == null)
    {
      return null;
    }
    else
    {
      if (cellValue instanceof String && ((String) cellValue).length() == 0)
      {
        // for empty string, return null
        return null;
      }
      else
      {
        return cellValue;
      }
    }
  }
  
  public int getCellType()
  {
    return cellType;
  }

  public int getCellStringIndex()
  {
    return cellStringIndex;
  }

  public List<FormulaToken> getFormulaTokens()
  {
    return formulaTokens;
  }

  public int getFormulaErrProps()
  {
    return formulaErrProps;
  }
  
  public Object getCellCalcValue()
  {
    if (getCellDirty())
    {
      // don't serialize dirty cell's calculated value
      return null;
    }
    else
    {
      return cellCalcValue;
    }
  }
  
  public boolean getCellDirty()
  {
    return bCellDirty;
  }
  
  public int getCellColSpan()
  {
    return cellColspan;
  }

  public int getCellRowSpan()
  {
    return cellRowspan;
  }
  
  public boolean getCellIsCovered()
  {
    return cellCoveredRepeat > 0;
  }

  private void hash()
  {
    if (cellIndex > 0 && /* if cell is empty, serializer will not write it, also don't hash it */ !isCellEmpty())
    {
      // only hash if we already serialized, or ready to serialize something
      rowHashCodeBuilder.append(cellIndex);
      rowHashCodeBuilder.append(cellValue);
      rowHashCodeBuilder.append(cellLink);
      rowHashCodeBuilder.append(cellStringIndex);
      rowHashCodeBuilder.append(getCellStyle());
      if (getCellStyle() != null && getCellStyle().isPreserved())
      {
        // if current row has a cell with preserved style, mess the hash so the row could never be merged
        rowHashCodeBuilder.append(Math.random());
      }
      rowHashCodeBuilder.append(getCellRepeat());
      rowHashCodeBuilder.append(cellColspan);
      rowHashCodeBuilder.append(cellRowspan);
      rowHashCodeBuilder.append(getCellIsCovered());
    }
  }

  public void firstColumn()
  {
    columnIterator.firstColumn();
  }

  public void nextColumn()
  {
    columnIterator.nextColumn();
  }

  public boolean hasNextColumn() throws NoSuchElementException
  {
    return columnIterator.hasNextColumn();
  }

  public boolean isColumnEmpty()
  {
    if (columnIterator.currentColumn == null)
    {
      return true;
    }

    if (getColumnStyle() != null)
    {
      return false;
    }

    if (getColumnWidth() >= 0)
    {
      return false;
    }

    if (getColumnVisibility() != null && getColumnVisibility() != Visibility.VISIBLE)
    {
      return false;
    }

    return true;
  }

  public int getColumnId()
  {
    return columnIterator.currentColumn.getId();
  }

  public int getColumnIndex()
  {
    return columnIterator.currentColumn.getIndex();
  }

  public StyleObject getColumnStyle()
  {
    StyleObject style = columnIterator.currentColumn.getStyle();
    // no need to set column with default cell style, returns null for this
    if (style == null)
    {
      return null;
    }
    else if (style == defaultCellStyle)
    {
      return null;
    }
    else
    {
      if (style.isEmpty())
      {
        if (LOG.isLoggable(Level.FINER))
        {
          LOG.log(Level.FINER, "ignoring column empty style {0}.", style);
        }
        return null;
      }
      else
      {
        return style;
      }
    }
  }

  public int getColumnRepeat()
  {
    return columnIterator.repeat;
  }

  public Visibility getColumnVisibility()
  {
    return columnIterator.currentColumn.getVisibility();
  }

  public int getColumnWidth()
  {
    return columnIterator.currentColumn.getWidth();
  }

  public Map<Integer, CoverInfo> getCoverCells()
  {
    if(coverMap == null) {
      coverMap = new HashMap<Integer, CoverInfo>();
      List<CoverInfo> list = currentRow.getCoverList();
      for(int i = 0; i < list.size(); i++)
      {
        CoverInfo cover = list.get(i);
        coverMap.put(cover.getId(), cover);
      }
    }
    return coverMap;
  }
  /*
   * choose value cell data pointed by pValueCell for nextCell()
   */
  private void nextValueCell()
  {
    if (pValueCell < valueCells.size())
    {
      ValueCell vc = valueCells.get(pValueCell);
      // refresh cell id and column
      cellIndex = vc.getIndex();
      // refresh link and value
      if (vc.isFormula() && vc.getFormulaCell() != null && vc.getFormulaCell().isUpdateFormula())
      {
        cellValue = vc.updateFormula();
      }
      else
      {
        cellValue = vc.getValue();
      }

      cellLink = vc.getLink();

      cellCalcValue = vc.getCalcValue();
      
      cellStringIndex = vc.getStringIndex();
      
      cellType = vc.getCellType();
      
      // refresh formula tokens
      if (vc.getFormulaCell() == null)
      {
        formulaTokens = null;
        formulaErrProps = FormulaUtil.FormulaErrProperty.NONE.getValue();
        bCellDirty = false;
      }
      else
      {
        formulaTokens = vc.getFormulaCell().getTokenList();
        formulaErrProps = vc.getFormulaCell().getErrProps();
        bCellDirty = vc.getFormulaCell().isDirty();
        if(bCellDirty)
        {
          cellCalcValue = null;//reset the calc value
        }
      }

      pValueCell++;
    }
    else
    {
      LOG.warning("pValueCell exceeds valueCells size, force current valueCell to be null.");
      cellValue = null;
      cellLink = null;
      formulaTokens = null;
      formulaErrProps = FormulaUtil.FormulaErrProperty.NONE.getValue();
      cellCalcValue = null;
      bCellDirty = false;
      cellType = 0;
    }
  }

  /*
   * Choose cover info data. Either by continuing cover info repeat, or by new cover info cell pointed by pCoverInfo
   */
  private void nextCoverInfo()
  {
    if (cellCoveredRepeat <= 0)
    {
      if (pCoverInfo < coverInfos.size())
      {
        // next cover info cell
        CoverInfo ci = coverInfos.get(pCoverInfo);
        cellColspan = ci.getColSpan();
        cellRowspan = ci.getRowSpan();
        cellIndex = ci.getIndex();
        pCoverInfo++;
      }
      else
      {
        LOG.warning("pCoverInfo exceeds coverInfos size, force current coverInfo to be null.");
        cellColspan = cellRowspan = 1;
      }
    }
    else
    {
      // repeat continues
      cellIndex = nextCellIndex;
    }
  }

  /*
   * Choose style cell data. Either by continuing style repeat, or by new style cell pointed by pStyleCell
   */
  private void nextStyleCell()
  {
    if (cellStyleRepeat <= 0)
    {
      if (pStyleCell < styleCells.size())
      {
        StyleCell sc = styleCells.get(pStyleCell);
        cellStyle = sc.getStyle();
        cellStyleUpdated = false;
        // repeat num plus current cell
        cellStyleRepeat = sc.getRepeatedNum() + 1;
        cellIndex = sc.getIndex();
        // look ahead to merge style cell
        pStyleCell++;
        for (; pStyleCell < styleCells.size(); pStyleCell++)
        {
          StyleCell nextSc = styleCells.get(pStyleCell);
          // check the nextSc cell can be merged with prev styles
          // it is possible that cellStyle could be null
          if (!((cellStyle != null && cellStyle.isPreserved()) || (nextSc.getStyle() != null && nextSc.getStyle().isPreserved())) // cell style and next style both not preserved, if they not null at first
              && nextSc.getStyle() == cellStyle && nextSc.getIndex() == cellIndex + cellStyleRepeat)
          {
            // nextSc is neighbor of current styleCell and the same style, merge by increasing cellStyleRepeat
            cellStyleRepeat += 1 + nextSc.getRepeatedNum();
          }
          else
          {
            break;
          }
        }
      }
      else
      {
        LOG.warning("pStyleCell exceeds styleCells size, force style cell to be null.");
        cellStyle = null;
        cellStyleUpdated = false;
        cellStyleRepeat = 0;
      }
    }
    else
    {
      // repeat continues
      cellIndex = nextCellIndex;
    }
  }

  /*
   * Peek without moving the pointer, returns next value cell index. Integer.MAX if no more value cells.
   */
  private int peekNextValueCellIndex()
  {
    pValueCell = forwardModelList(valueCells, getCellIndex() + 1, pValueCell);
    if (pValueCell < valueCells.size())
    {
      ValueCell nextVc = valueCells.get(pValueCell);
      return nextVc.getIndex();
    }
    else
    {
      return Integer.MAX_VALUE;
    }
  }

  /*
   * Peek without moving the pointer, returns next cover info cell index. Integer.MAX if no more cover info cells.
   */
  private int peekNextCoverInfoIndex()
  {
    pCoverInfo = forwardModelList(coverInfos, getCellIndex() + 1, pCoverInfo);
    if (pCoverInfo < coverInfos.size())
    {
      CoverInfo nextCi = coverInfos.get(pCoverInfo);
      return nextCi.getIndex();
    }
    else
    {
      return Integer.MAX_VALUE;
    }
  }

  /*
   * Peek without moving the pointer, returns next style cell index. Integer.MAX if no more style cells.
   */
  private int peekNextStyleCellIndex()
  {
    pStyleCell = forwardModelList(styleCells, getCellIndex() + 1, pStyleCell);
    if (pStyleCell < styleCells.size())
    {
      StyleCell nextSc = styleCells.get(pStyleCell);
      return nextSc.getIndex();
    }
    else
    {
      return Integer.MAX_VALUE;
    }
  }

  /*
   * Advance pointer in a model list till the index of model at the pointer equals or greater than the targetIndex. For normal cases, the
   * model at pStart would be good. But in cases that models are mis-ordered, the model at pStart would before the targetIndex, in such
   * cases the method would bypass these elements and relocate pStart to a correct position. Returns corrected pStart, which in most cases,
   * is the passed in pStart itSelf.
   */
  private int forwardModelList(List<? extends BasicModel> models, int targetIndex, int pStart)
  {
    if (pStart >= models.size())
    {
      return pStart;
    }

    if (models.get(pStart).getIndex() >= targetIndex)
    {
      return pStart;
    }

    for (; pStart < models.size(); pStart++)
    {
      BasicModel model = models.get(pStart);
      if (model.getIndex() >= targetIndex)
      {
        break;
      }
      else
      {
        LOG.log(Level.WARNING, "Bypassing mis-ordered model {0} at index {1}, target index {2}.", new Object[] { model, model.getIndex(),
            targetIndex });
      }
    }
    return pStart;
  }

  /*
   * Next cell would be at getCellIndex() with repeat num getCellRepeat(). Check if this cell goes beyond current column, if so, forward the
   * column iterator.
   */
  private void forwardColumn()
  {
    if (innerColumnIterator.currentColumn != null)
    {
      Column column = innerColumnIterator.currentColumn;
      int columnIndex = column.getIndex();
      // current column ends at columnEndIndex
      int columnEndIndex = columnIndex + innerColumnIterator.repeat;
      int cellIndex = getCellIndex();
      if (cellIndex > columnEndIndex)
      {
        // current cell goes after current column, forward column until the column covers current cell, or goes after current cell
        // flag that we found an appropriate column
        boolean hit = false;
        if (innerColumnIterator.hasNextColumn())
        {
          for (; innerColumnIterator.hasNextColumn();)
          {
            innerColumnIterator.nextColumn();
            // current column covering current cell
            column = innerColumnIterator.currentColumn;
            columnIndex = column.getIndex();
            columnEndIndex = columnIndex + innerColumnIterator.repeat;

            if (columnIndex >= cellIndex // column goes beyond current cell
                || columnEndIndex >= cellIndex) // column covering current cell
            {
              hit = true;
              break;
            }
          }
        }

        if (!hit)
        {
          // clear iterator, we are out of columns
          innerColumnIterator.currentColumn = null;
        }
      }
    }
  }

  @Deprecated
  /**
   * Only for test purpose
   */
  public boolean __hasStyleTillIndex(StyleObject style, int index)
  {
    return columnIterator.hasStyleTillIndex(style, index);
  }

  private class ColumnIterator
  {
    private int pColumn;

    private Column currentColumn;

    private int repeat;

    public void firstColumn()
    {
      pColumn = 0;
      currentColumn = null;
    }

    public boolean hasNextColumn()
    {
      return pColumn < columns.size();
    }

    public void nextColumn()
    {
      if (!hasNextColumn())
      {
        throw new NoSuchElementException("no more columns");
      }

      if (currentColumn != null)
      {
        pColumn = forwardModelList(columns, currentColumn.getIndex() + 1, pColumn);
      }

      if (pColumn < columns.size())
      {
        currentColumn = columns.get(pColumn++);
        repeat = currentColumn.getRepeatedNum();
        for (; pColumn < columns.size(); pColumn++)
        {
          Column nextColumn = columns.get(pColumn);

          // break if cannot merge
          if (nextColumn.getStyle() != currentColumn.getStyle())
          {
            break;
          }

          if (nextColumn.getWidth() != currentColumn.getWidth())
          {
            break;
          }

          if (nextColumn.getVisibility() != currentColumn.getVisibility())
          {
            break;
          }

          if (nextColumn.getIndex() != currentColumn.getIndex() + repeat + 1)
          {
            break;
          }

          // can merge
          repeat += 1 + nextColumn.getRepeatedNum();
        }
      }
      else
      {
        currentColumn = null;
        repeat = 0;
      }
    }

    /*
     * Start from current column, search down columns array, check if there is continuous columns model till or beyond index, that have
     * provided style. If style is null, check if these columns model don't have a style, or don't have a column model
     */
    public boolean hasStyleTillIndex(StyleObject style, int index)
    {
      if (style == null)
      {
        // ensure from current column, till index, we don't have column styles
        if (currentColumn == null)
        {
          // we are out of columns, of cause we don't have any column styles
          return true;
        }

        if (currentColumn.getIndex() > index)
        {
          // current column already out of range, we don't have any styles
          return true;
        }

        if (currentColumn.getStyle() == null || currentColumn.getStyle() == defaultCellStyle)
        {
          // currentColumn doesn't have a style, check following columns
          for (int p = pColumn; p < columns.size(); p++)
          {
            Column column = columns.get(p);
            if (column.getIndex() > index)
            {
              // next column out of range
              return true;
            }
            else
            {
              if (column.getStyle() != null && column.getStyle() != defaultCellStyle)
              {
                // next column have a style
                return false;
              }
            }
          }

          return true;
        }
        else
        {
          // current column have a style
          return false;
        }
      }
      else
      {
        // ensure from current column, till index, we have continuous column style "style"
        if (currentColumn == null)
        {
          // we are out of columns, we don't have the style
          return false;
        }

        if (currentColumn.getIndex() > index)
        {
          // current column already out of range, we don't have the style
          return false;
        }

        if (currentColumn.getStyle() == style)
        {
          // current column have the style, check following columns
          int prevColumnEnd = currentColumn.getIndex() + repeat;
          if (prevColumnEnd >= index)
          {
            return true;
          }
          for (int p = pColumn; p < columns.size(); p++)
          {
            Column column = columns.get(p);
            if (column.getIndex() == prevColumnEnd + 1)
            {
              // continuous column
              if (column.getStyle() == style)
              {
                // have the same style, continue the check
                prevColumnEnd = column.getIndex() + column.getRepeatedNum();
                if (prevColumnEnd >= index)
                {
                  // next column ends at the index, or beyond it
                  return true;
                }
                // else, continue the check
              }
              else
              {
                // next column doesn't have the style
                return false;
              }
            }
            else
            {
              // column is not continuous
              return false;
            }
          }
          // all columns checked, but still can't reach index,
          return false;
        }
        else
        {
          // current column doesn't have the style
          return false;
        }
      }
    }
  }
}
