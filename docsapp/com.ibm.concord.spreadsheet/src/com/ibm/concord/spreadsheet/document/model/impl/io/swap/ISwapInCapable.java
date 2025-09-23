package com.ibm.concord.spreadsheet.document.model.impl.io.swap;


/**
 * The capability that can swap in from raw data to model. This model must contain raw data and can swap in raw data to model.
 */
public interface ISwapInCapable
{
  /**
   * Swap in from raw data to model.
   */
  public void swapIn();
  
  /**
   * Associate raw data storages with this capable
   * @param rawData
   */
  public void setRawData(IRawDataStorageAdapter rawData);
}
