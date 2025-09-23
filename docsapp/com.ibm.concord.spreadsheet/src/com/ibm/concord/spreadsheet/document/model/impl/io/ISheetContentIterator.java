package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.impl.CoverInfo;
import com.ibm.concord.spreadsheet.document.model.impl.Visibility;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;

/**
 * <p>
 * Iterates every cell, row, column in a provided sheet model.
 * <p>
 * This interface hides document model details from the client. What's more, it hides the complexity about:
 * <p>
 * compressing cell and column models, and
 * <p>
 * compositing cell def suitable for draft JSON, from data of document model.
 * <p>
 * This interface is set to generic typed to fit for any sheet models.
 * 
 * @param <T>
 *          the sheet model type
 */
public interface ISheetContentIterator<T>
{
  /**
   * Set a sheet model current iterator operates.
   * 
   * @param st
   */
  public void setSheetModel(T st);

  /**
   * Put iterator <em>before</em> first row. After this call, nextRow() will moves pointer to the first row in sheet model.
   */
  public void firstRow();

  /**
   * Moves iterator to the next row. Throws {@link NoSuchElementException} if no more rows.
   */
  public void nextRow();

  /**
   * If the sheet has more rows.
   * 
   * @return
   * @throws NoSuchElementException
   */
  public boolean hasNextRow() throws NoSuchElementException;

  /**
   * Roughly decide if a row is empty, if returns true, there's no need to serialize it. But if returns false, this row may still be empty.
   * The method should check if row meta is null and row child cells size.
   * 
   * @return
   */
  public boolean isRowEmpty();

  /**
   * Current row's ID, in number form.
   * 
   * @return
   */
  public int getRowId();

  /**
   * Current row's index.
   * 
   * @return
   */
  public int getRowIndex();

  /**
   * Current row's height.
   * 
   * @return
   */
  public int getRowHeight();

  /**
   * Current row's repeat number.
   * 
   * @return
   */
  public int getRowRepeat();

  /**
   * Current row's visibility.
   * 
   * @return
   */
  public Visibility getRowVisbility();

  /**
   * Current row's content hash code. It only hashes content that already passed by nextCell() calls.
   * 
   * @return
   */
  public int getRowContentHash();

  /**
   * Put pointer <em>before </em> the first cell in the row. If after this call, hasNextCell() returns false, the row is empty without any
   * cell content.
   */
  public void firstCell();

  /**
   * <p>
   * Movs iterator to next cell. Throws {@link NoSuchElementException} if no more rows.
   * <p>
   * After this call, all get* for cell properties should return current cell data suitable for draft JSON output. This call should compress
   * cell model and composite all necessary data from sheet model.
   * 
   * @throws NoSuchElementException
   */
  public void nextCell() throws NoSuchElementException;

  /**
   * If current row has more cells.
   * 
   * @return
   */
  public boolean hasNextCell();

  /**
   * Current cell's column ID.
   * 
   * @return
   */
  public int getCellId();

  /**
   * Current cell's column index.
   * 
   * @return
   */
  public int getCellIndex();

  /**
   * Current cell's style.
   * 
   * @return
   */
  public StyleObject getCellStyle();

  /**
   * Current cells' repeat number.
   * 
   * @return
   */
  public int getCellRepeat();

  /**
   * Current cell's link.
   * 
   * @return
   */
  public String getCellLink();

  /**
   * Current cell's value.
   * 
   * @return
   */
  public Object getCellValue();

  /**
   * Current cell's OOXML string index.
   * 
   * @return
   */
  public int getCellStringIndex();

  /**
   * Current cell's colspan.
   * 
   * @return
   */
  public int getCellColSpan();

  /**
   * Current cell's rowspan
   * 
   * @return
   */
  public int getCellRowSpan();
  
  /**
   * If current cell is covered.
   */
  public boolean getCellIsCovered();

  /**
   * Current cell's FormulaToken list.
   * 
   * @return
   */
  public List<FormulaToken> getFormulaTokens();

  /**
   * Current cell's Formula Error properties which is determined by the formula function error properties
   * 
   * @return
   */
  public int getFormulaErrProps();

  /**
   * Current cell's calculate value which is only used by formula cell
   * 
   * @return
   */
  public Object getCellCalcValue();


  /**
   * Current formula cell's dirty status
   * 
   * @return
   */
  public boolean getCellDirty();

  /**
   * Current cell's type.
   * 
   * @return
   */
  public int getCellType();

  /**
   * If current cell is empty, without any content to output. Note empty cells should still occupies document model. Needs to call
   * nextCell() for next.
   * 
   * @return
   */
  public boolean isCellEmpty();

  /**
   * Put pointer <em>before</em> the first column in the sheet.
   */
  public void firstColumn();

  /**
   * Moves iterator to next column.
   */
  public void nextColumn();

  /**
   * If sheet has more columns.
   * 
   * @return
   * @throws NoSuchElementException
   */
  public boolean hasNextColumn() throws NoSuchElementException;

  /**
   * If current column is empty, without any content to output.
   * 
   * @return
   */
  public boolean isColumnEmpty();

  /**
   * Current column's ID.
   * 
   * @return
   */
  public int getColumnId();

  /**
   * Current column's index.
   * 
   * @return
   */
  public int getColumnIndex();

  /**
   * Current column's style.
   * 
   * @return
   */
  public StyleObject getColumnStyle();

  /**
   * Current column's repeat num.
   * 
   * @return
   */
  public int getColumnRepeat();

  /**
   * Current column's repeat num.
   * 
   * @return
   */
  public Visibility getColumnVisibility();

  /**
   * Current column's width.
   */
  public int getColumnWidth();
  
  /**
   * Current row's cover info list
   */
  public Map<Integer, CoverInfo> getCoverCells();
}
