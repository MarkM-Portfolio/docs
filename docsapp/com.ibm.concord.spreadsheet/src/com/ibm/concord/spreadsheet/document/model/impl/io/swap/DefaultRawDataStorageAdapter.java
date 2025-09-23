package com.ibm.concord.spreadsheet.document.model.impl.io.swap;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Default implementation of {@link IRawDataStorageAdapter}, with storage state checking.
 */
public abstract class DefaultRawDataStorageAdapter implements IRawDataStorageAdapter
{
  protected static enum State {
    /**
     * Nothing in the storage.
     */
    EMPTY,
    /**
     * OutputStream is opened and not closed yet.
     */
    IS_WRITING,
    /**
     * OutputStream is closed and no one is reading yet.
     */
    IDLE,
    /**
     * getInputStream() is called and InputStream has been returned at least once.
     */
    BEEN_READING
  }

  protected State state;

  /**
   * If the storage can be read, only be true if the storage is not in writing and is not empty.
   * 
   * @return
   */
  protected boolean canRead()
  {
    return state != State.EMPTY && state != State.IS_WRITING;
  }

  protected boolean canWrite()
  {
    return state != State.IS_WRITING;
  }

  public InputStream getInputStream() throws IllegalStateException, IOException
  {
    if (!canRead())
    {
      throw new IllegalStateException("can't read raw data now.");
    }
    
    state = State.BEEN_READING;

    return doGetInputStream();
  }

  public OutputStream getOutputStream() throws IllegalStateException, IOException
  {
    if (!canWrite())
    {
      throw new IllegalStateException("can't write raw data now.");
    }
    
    state = State.IS_WRITING;
      
    return doGetOutputStream();
  }
  
  public void closeOutputStream() throws IOException
  {
    if (state == State.IS_WRITING)
    {
      state = State.IDLE;
    }
    
    doCloseOutputStream();
  }

  public void clear() throws IOException
  {
    state = State.EMPTY;
    
    doClear();
  }

  protected abstract InputStream doGetInputStream() throws IOException;

  protected abstract OutputStream doGetOutputStream() throws IOException;
  
  protected abstract void doCloseOutputStream() throws IOException;
  
  protected abstract void doClear() throws IOException;
}
