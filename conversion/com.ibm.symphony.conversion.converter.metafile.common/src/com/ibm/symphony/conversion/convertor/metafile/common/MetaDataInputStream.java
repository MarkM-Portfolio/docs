/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.convertor.metafile.common;

import java.awt.Color;
import java.awt.Point;
import java.awt.Rectangle;
import java.io.ByteArrayInputStream;
import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;

public class MetaDataInputStream extends FilterInputStream
{

  public MetaDataInputStream(InputStream in)
  {
    super(in);
  }
  
  @Override
  public long skip(long n) throws IOException
  {
    long total = 0;
    long cur = 0;

    while ((total < n) && ((cur = in.skip(n - total)) > 0))
    {
      total += cur;
    }

    return total;
  }

  public MetaDataInputStream openSubStream(int len) throws IOException
  {
    byte[] buf = new byte[len];
    readFully(buf);
    MetaDataInputStream subStream = new MetaDataInputStream( new ByteArrayInputStream(buf)  );
    return subStream;    
  }

  public int readFully(byte[] buffer) throws IOException
  {
    int size = buffer.length;
    if( available() < size )
    {
      size = available();
    }
    int len = 0;
    for(int nRead=0; nRead < size; nRead+= len )
    {
      len = read(buffer, 0 , size);
    }
    return size;
  }
  
  
  public int readWORD() throws IOException // return unsigned short
  {
    return ByteUtil.readWord(read(), read());
  }

  public void readWORD(int[] buf) throws IOException // return unsigned short
  {
    for (int i = 0; i < buf.length; i++)
    {
      buf[i] = readWORD();
    }
  }

  public short readShort() throws IOException // return signed short
  {
    return (short) readWORD();
  }

  public long readDWORD() throws IOException // return unsigned int
  {
    return ByteUtil.toUnsign(readInt());
  }

  public int readInt() throws IOException // return unsigned int
  {
    return ByteUtil.readInt(read(), read(), read(), read());
  }

  public void readInt(int[] buf) throws IOException // return unsigned int
  {
    for (int i = 0; i < buf.length; i++)
    {
      buf[i] = readInt();
    }
  }

  public void readDWORD(long[] buf) throws IOException
  {
    for (int i = 0; i < buf.length; i++)
    {
      buf[i] = readDWORD();
    }
  }

  public Color readColor() throws IOException
  {
    int r = read();
    int g = read();
    int b = read();
    Color color = new Color(r, g, b);
    skip(1);
    return color;
  }

  public Point readPointS() throws IOException
  {
    return new Point(readShort(), readShort());
  }

  public Point readPointL() throws IOException
  {
    return new Point(readInt(), readInt());
  }

  public void readPointS(Point[] points) throws IOException
  {
    for (int i = 0; i < points.length; i++)
    {
      points[i] = readPointS();
    }
  }

  public void readPointL(Point[] points) throws IOException
  {
    for (int i = 0; i < points.length; i++)
    {
      points[i] = readPointL();
    }
  }

  public Rectangle readRectRV() throws IOException
  {
    short b = readShort();
    short r = readShort();
    short t = readShort();
    short l = readShort();

    return new Rectangle(l, t, r - l, b - t);

  }

  public Rectangle readRectL() throws IOException
  {
    int l = readInt();
    int t = readInt();
    int r = readInt();
    int b = readInt();
    return new Rectangle(l, t, r - l, b - t);

  }

}
