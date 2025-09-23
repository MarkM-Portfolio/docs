/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.beans;

import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class MediaDescriptor
{
  private String title;
  private String mimetype;
  private InputStream stream;
  private RandomAccessFile raf;
  private long length;

  /**
   * Caller should close the stream when it should be released
   * @param title   media title
   * @param mime    mime-type of the media
   * @param length  length if any
   * @param stream  stream to read the media
   */
  public MediaDescriptor(String title, String mime, InputStream stream)
  {
    this.title = title;
    this.mimetype = mime;
    this.stream = stream;
    setLength(-1);
  }

  /**
   * Caller should close the stream when it should be released
   * @param title   media title
   * @param mime    mime-type of the media
   * @param length  length if any
   * @param raf  randomAccess file stream to read the media
   */
  public MediaDescriptor(String title, String mime, RandomAccessFile raf)
  {
    this.title = title;
    this.mimetype = mime;
    this.raf = raf;
    setLength(-1);
  }
  
  public String getTitle()
  {
    return title;
  }
  
  public void setTitle(String title)
  {
    this.title = title;
  }
  
  public String getMimeType()
  {
    return mimetype;
  }
  
  public void setMimeType(String mimetype)
  {
    this.mimetype = mimetype;
  }
  
  public InputStream getStream()
  {
    return stream;
  }
  
  public void setStream(InputStream stream)
  {
    this.stream = stream;
  }

  public RandomAccessFile getRandomStream()
  {
    return raf;
  }

  public void setRandomStream(RandomAccessFile raf)
  {
    this.raf = raf;
  }

  public void dispose()
  {
    try
    {
      if(stream != null)
      {
        stream.close();
      }
      if(raf != null)
      {
        raf.close();
      }      
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }
  }
  
  public String toString()
  {
    return title + ";" + mimetype;
  }

  public void setLength(long length)
  {
    this.length = length;
  }

  public long getLength()
  {
    return length;
  }
}
