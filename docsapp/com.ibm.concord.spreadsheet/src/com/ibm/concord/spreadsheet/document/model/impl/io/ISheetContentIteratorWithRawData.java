package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.util.Map;

import com.ibm.concord.spreadsheet.document.model.impl.FormulaCell;
import com.ibm.concord.spreadsheet.document.model.impl.io.swap.IRawDataStorageAdapter;

/**
 * Add raw data support.
 * 
 * @param <T>
 */
public interface ISheetContentIteratorWithRawData<T> extends ISheetContentIterator<T>
{
  /**
   * Return attached raw row content cells.
   * 
   * @return
   */
  public IRawDataStorageAdapter getRowRawContentCells();

  /**
   * Get current row's formula cells map.
   * 
   * @return
   */
  public Map<Integer, FormulaCell> getRowFormulaCellsMap();
}
