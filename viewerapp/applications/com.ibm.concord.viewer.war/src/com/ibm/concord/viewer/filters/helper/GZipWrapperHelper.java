package com.ibm.concord.viewer.filters.helper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.util.logging.Logger;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

public class GZipWrapperHelper extends HttpServletResponseWrapper
{
  private static final Logger LOG = Logger.getLogger(GZipWrapperHelper.class.getName());
  
  public static final int OUTPUT_NONE = 0;

  public static final int OUTPUT_WRITER = 1;

  public static final int OUTPUT_STREAM = 2;

  private int outputType = OUTPUT_NONE;

  private ServletOutputStream output = null;

  private PrintWriter writer = null;

  private ByteArrayOutputStream buffer = null;

  public GZipWrapperHelper(HttpServletResponse resp) throws IOException
  {
    super(resp);
    buffer = new ByteArrayOutputStream();
  }

  public PrintWriter getWriter() throws IOException
  {
    if (outputType == OUTPUT_STREAM)
      throw new IllegalStateException();
    else if (outputType == OUTPUT_WRITER)
      return writer;
    else
    {
      outputType = OUTPUT_WRITER;
      writer = new PrintWriter(new OutputStreamWriter(buffer, getCharacterEncoding()));
      return writer;
    }
  }

  public ServletOutputStream getOutputStream() throws IOException
  {
    if (outputType == OUTPUT_WRITER)
      throw new IllegalStateException();
    else if (outputType == OUTPUT_STREAM)
      return output;
    else
    {
      outputType = OUTPUT_STREAM;
      output = new WrappedOutputStream(buffer);
      return output;
    }
  }

  public void flushBuffer() throws IOException
  {
    if (outputType == OUTPUT_WRITER)
      writer.flush();
    if (outputType == OUTPUT_STREAM)
      output.flush();
  }

  public void reset()
  {
    outputType = OUTPUT_NONE;
    buffer.reset();
  }

  public byte[] getResponseData() throws IOException
  {
    flushBuffer();
    return buffer.toByteArray();

  }

  class WrappedOutputStream extends ServletOutputStream
  {
    private ByteArrayOutputStream buffer;

    public WrappedOutputStream(ByteArrayOutputStream buffer)
    {
      this.buffer = buffer;
    }

    public void write(int b) throws IOException
    {
      buffer.write(b);
    }

    public byte[] toByteArray()
    {
      return buffer.toByteArray();
    }
  }
}