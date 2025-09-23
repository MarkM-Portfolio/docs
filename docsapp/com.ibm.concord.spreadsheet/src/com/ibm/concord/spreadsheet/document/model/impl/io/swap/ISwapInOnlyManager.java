package com.ibm.concord.spreadsheet.document.model.impl.io.swap;

/**
 * A raw data manager that only swap in data into memory. It only cares about creating a raw data storage to store raw data from
 * deserializer.
 */
public interface ISwapInOnlyManager
{
  /**
   * Create a raw data storage.
   * 
   * @return
   */
  public IRawDataStorageAdapter createRawDataStorage();

  /**
   * Create a raw data storage with certain compression method. It depends on the caller to choose if use compressed raw data or not. If the
   * raw data is fairly short, choosing compressed raw data is not a good idea -- it doesn't save memory, meanwhile wastes time.
   * 
   * @return
   */
  public IRawDataStorageAdapter createCompressedRawDataStorage();
}
