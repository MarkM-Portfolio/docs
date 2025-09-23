package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.io.IOException;

import org.codehaus.jackson.SerializableString;

import com.ibm.concord.spreadsheet.document.model.impl.io.swap.IRawDataStorageAdapter;

/**
 * Add raw data support. Every method is attached with action generator and handler. If set to not null, can generate actions during JSON
 * copy.
 */
public interface IDraftRawDataWriter
{
  /**
   * Write raw data for all rows in a sheet.
   * 
   * @param rowId
   * @param rawData
   * @param actionGenerator
   * @param actionHandler
   * @throws IllegalStateException
   * @throws IOException
   */
  public void writeSheetRawContentRows(SerializableString sheetId, IRawDataStorageAdapter rawData, DraftActionGenerator actionGenerator,
      IDraftActionHandler actionHandler) throws IllegalStateException, IOException;

  /**
   * Write raw data for all meta rows in a sheet.
   * 
   * @param rawData
   * @param actionGenerator
   * @param actionHandler
   */
  public void writeSheetRawMetaRows(SerializableString sheetId, IRawDataStorageAdapter rawData, DraftActionGenerator actionGenerator,
      IDraftActionHandler actionHandler) throws IllegalStateException, IOException;

  /**
   * Write raw data for all cells in a row.
   * 
   * @param rowId
   * @param rawData
   * @param actionGenerator
   * @param actionHandler
   */
  public void writeRowRawContentCells(SerializableString rowId, IRawDataStorageAdapter rawData, DraftActionGenerator actionGenerator,
      IDraftActionHandler actionHandler) throws IllegalStateException, IOException;
}
