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

public abstract class MetaHeader
{
  private int width;

  private int height;

  public int getWidth()
  {
    return width;
  }

  public void setWidth(int width)
  {
    this.width = width;
  }

  public int getHeight()
  {
    return height;
  }

  public void setHeight(int height)
  {
    this.height = height;
  }
}
