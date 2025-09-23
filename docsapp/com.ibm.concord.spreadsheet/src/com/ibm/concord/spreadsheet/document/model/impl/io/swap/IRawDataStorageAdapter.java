package com.ibm.concord.spreadsheet.document.model.impl.io.swap;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * <p>
 * A storage that stores raw data from draft.
 * <p>
 * After the storage is created, the user call getOutputStream() to write the raw data. During the time, the user can't call
 * getInputStream() to read from it. The user must call closeOutputStream() to notify the adapter to end writing to the stream. After that,
 * the user can call getInputStream() to read from it.
 */
public interface IRawDataStorageAdapter
{
  /**
   * Get the InputStream attached to the raw data to read it.
   * 
   * @return
   * @throws IllegalStateException
   *           If the storage is empty, or the storage is still in writing.
   */
  public InputStream getInputStream() throws IllegalStateException, IOException;

  /**
   * Get the OutputStream attached to the raw data to write it. Depends on the implementation, call this method may clear() the whole
   * storage.
   * 
   * @return
   * @throws IllegalStateException
   *           If the storage is already in writing and not closed yet.
   */
  public OutputStream getOutputStream() throws IllegalStateException, IOException;

  /**
   * Notify the storage to finish writing.
   */
  public void closeOutputStream() throws IOException;

  /**
   * Clear the storage.
   */
  public void clear() throws IOException;
  
  /**
   * If the storage is empty.
   * @return
   */
  public boolean isEmpty();
}
