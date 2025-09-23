/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation;

import java.awt.Dimension;

/**
 * 
 * @author krings
 * Basically contains clipping/cropping information for an image.
 * If the same image is shown numerous times, there is no reason to calculate
 * the dimensions and DPI over and over. 
 */
public class ODPClipInfo
{


  private Dimension dim;
  private Dimension dpi;
  private double clipWidth;
  private double clipHeight;
  
  public ODPClipInfo(Dimension dim, Dimension dpi, double clipWidth, double clipHeight) 
  {
    this.dim = dim;
    this.dpi = dpi;
    this.clipWidth = clipWidth;
    this.clipHeight = clipHeight;
  }
  
  public ODPClipInfo(Dimension dim, Dimension dpi) 
  {
    this.dim = dim;
    this.dpi = dpi;
  }
  
  public Dimension getDim()
  {
    return dim;
  }

  public void setDim(Dimension dim)
  {
    this.dim = dim;
  }

  public Dimension getDpi()
  {
    return dpi;
  }

  public void setDpi(Dimension dpi)
  {
    this.dpi = dpi;
  }

  public double getHeight()
  {
    return this.dim.getHeight();
  }
  
  public double getWidth()
  {
    return this.dim.getWidth();
  }
  
  public double getClipWidth()
  {
    return clipWidth;
  }

  public void setClipWidth(double clipWidth)
  {
    this.clipWidth = clipWidth;
  }

  public double getClipHeight()
  {
    return clipHeight;
  }

  public void setClipHeight(double clipHeight)
  {
    this.clipHeight = clipHeight;
  }

  
}
