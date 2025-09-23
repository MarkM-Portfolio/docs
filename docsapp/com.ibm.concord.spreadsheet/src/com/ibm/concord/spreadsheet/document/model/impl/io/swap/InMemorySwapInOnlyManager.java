package com.ibm.concord.spreadsheet.document.model.impl.io.swap;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.zip.DeflaterOutputStream;
import java.util.zip.InflaterInputStream;
import java.util.zip.InflaterOutputStream;

/**
 * Simple implementation of {@link ISwapInOnlyManager} and {@link IRawDataStorageAdapter} that stores raw data in memory as byte[].
 */
public class InMemorySwapInOnlyManager implements ISwapInOnlyManager
{
  // initial byte[] size
  private static final int BYTE_BUFFER_INIT_SIZE = 10240;

  public IRawDataStorageAdapter createRawDataStorage()
  {
    return new InMemoryRawDataStorage();
  }

  public IRawDataStorageAdapter createCompressedRawDataStorage()
  {
    return new InMemoryInflaterRawDataStorage();
  }

  public class InMemoryRawDataStorage extends DefaultRawDataStorageAdapter
  {
    private byte[] buffer;

    private ByteArrayOutputStream outputStream;

    public InMemoryRawDataStorage()
    {
      ;
    }

    @Override
    protected InputStream doGetInputStream() throws IOException
    {
      ByteArrayInputStream inputStream = new ByteArrayInputStream(buffer);
      return inputStream;
    }

    @Override
    protected OutputStream doGetOutputStream() throws IOException
    {
      clear();
      state = State.IS_WRITING;
      outputStream = new ByteArrayOutputStream(BYTE_BUFFER_INIT_SIZE);
      return outputStream;
    }

    @Override
    protected void doCloseOutputStream() throws IOException
    {
      outputStream.flush();
      outputStream.close();
      buffer = outputStream.toByteArray();
      outputStream = null;
    }

    @Override
    protected void doClear() throws IOException
    {
      buffer = null;
    }

    /**
     * Returns the raw data content in string.
     */
    public String toString()
    {
      if (!canRead())
      {
        return "can't call toString() now.";
      }
      else
      {
        try
        {
          return new String(buffer, "utf-8");
        }
        catch (UnsupportedEncodingException e)
        {
          // never happens;
          return e.toString();
        }
      }
    }

    public boolean isEmpty()
    {
      return buffer == null;
    }
  }

  /**
   * Accesses raw data in byte[] with default Java {@link InflaterOutputStream} and {@link InflaterInputStream}
   */
  public class InMemoryInflaterRawDataStorage extends DefaultRawDataStorageAdapter
  {
    private byte[] buffer;
    
    private DeflaterOutputStream deflaterOutputStream;
    
    private ByteArrayOutputStream byteOutputStream;
    
    @Override
    protected InputStream doGetInputStream() throws IOException
    {
      ByteArrayInputStream byteIn = new ByteArrayInputStream(buffer);
      InflaterInputStream inflaterInputStream = new InflaterInputStream(byteIn);
      return inflaterInputStream;
    }

    @Override
    protected OutputStream doGetOutputStream() throws IOException
    {
      clear();
      state = State.IS_WRITING;
      byteOutputStream = new ByteArrayOutputStream(BYTE_BUFFER_INIT_SIZE);
      deflaterOutputStream = new DeflaterOutputStream(byteOutputStream);
      return deflaterOutputStream;
    }

    @Override
    protected void doCloseOutputStream() throws IOException
    {
      deflaterOutputStream.flush();
      deflaterOutputStream.close();
      byteOutputStream.flush();
      byteOutputStream.close();
      buffer = byteOutputStream.toByteArray();
      byteOutputStream = null;
      deflaterOutputStream = null;
    }

    @Override
    protected void doClear() throws IOException
    {
      buffer = null;
    }
    
    public String toString()
    {
      if (!canRead())
      {
        return "can't call toString() now.";
      }
      try
      {
        InputStream in = getInputStream();
        InputStreamReader reader = new InputStreamReader(in, "utf-8");
        char[] buf = new char[5120];
        int res = reader.read(buf);
        StringBuilder sb = new StringBuilder();
        while (res > 0)
        {
          sb.append(buf, 0, res);
          res = reader.read(buf);
        }
        reader.close();
        in.close();
        return sb.toString();
      }
      catch (IOException e)
      {
        // never happens
        return e.toString();
      }
    }

    public boolean isEmpty()
    {
      return buffer == null;
    }
  }
}
