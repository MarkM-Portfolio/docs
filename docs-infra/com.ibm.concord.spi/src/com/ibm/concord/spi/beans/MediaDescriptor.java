/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spi.beans;

import java.io.IOException;
import java.io.InputStream;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class MediaDescriptor
{
  private String title;

  private String mimetype;

  private InputStream stream;

  private boolean isExternal;

  private boolean propagate;

  private MediaOptions options;

  // the default value of isExternal.
  public static final boolean DEFAULT_IS_EXTERNAL_VALUE = false;

  // the default value of propagate.
  public static final boolean DEFAULT_PROPAGATE_VALUE = false;

  /**
   * Caller should close the stream when it should be released
   * 
   * @param title
   *          media title
   * @param mime
   *          mime-type of the media
   * @param length
   *          length if any
   * @param stream
   *          stream to read the media
   * @param isExternal
   *          if it can be shared outside of organization.
   * @param propagate
   *          if others can share it
   * @param options
   *          optional parameters for a new document such as contextType and contextValue
   */
  public MediaDescriptor(String title, String mime, InputStream stream)
  {
    this.title = title;
    this.mimetype = mime;
    this.stream = stream;
    this.isExternal = DEFAULT_IS_EXTERNAL_VALUE;
    this.propagate = DEFAULT_PROPAGATE_VALUE;
  }

  public MediaDescriptor(String title, String mime, InputStream stream, boolean isExternal, boolean propagate)
  {
    this.title = title;
    this.mimetype = mime;
    this.stream = stream;
    this.isExternal = isExternal;
    this.propagate = propagate;
  }

  public MediaDescriptor(String title, String mime, InputStream stream, boolean isExternal, boolean propagate, MediaOptions options)
  {
    this(title, mime, stream, isExternal, propagate);
    this.options = options;
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

  public boolean getIsExternal()
  {
    return isExternal;
  }

  public void setIsExternal(boolean isExternal)
  {
    this.isExternal = isExternal;
  }

  public boolean getPropagate()
  {
    return propagate;
  }

  public void setPropagate(boolean propagate)
  {
    this.propagate = propagate;
  }

  public MediaOptions getOptions()
  {
    return options;
  }

  public void setOptions(MediaOptions options)
  {
    this.options = options;
  }

  public void dispose()
  {
    try
    {
      if (stream != null)
      {
        stream.close();
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
}
