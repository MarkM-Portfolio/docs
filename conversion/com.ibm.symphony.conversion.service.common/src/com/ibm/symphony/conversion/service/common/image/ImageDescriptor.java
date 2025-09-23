/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.image;

import java.awt.Image;

public class ImageDescriptor implements Comparable<ImageDescriptor>
{
  private Image image;
  private String fileName;
  private int xPos;
  private int yPos;
  private int zIndex;
  private int width;
  private int height;  
  
  public Image getImage()
  {
    return image;
  }
  public void setImage(Image image)
  {
    this.image = image;
  }
  public String getFileName()
  {
    return fileName;
  }
  public void setFileName(String fileName)
  {
    this.fileName = fileName;
  }
  public int getXPos()
  {
    return xPos;
  }
  public void setXPos(int xPos)
  {
    this.xPos = xPos;
  }
  public int getYPos()
  {
    return yPos;
  }
  public void setYPos(int yPos)
  {
    this.yPos = yPos;
  }
  public int getzIndex()
  {
    return zIndex;
  }
  public void setzIndex(int zIndex)
  {
    this.zIndex = zIndex;
  }
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
  public int compareTo(ImageDescriptor imageDescriptor)
  {
    return zIndex - imageDescriptor.getzIndex();
  }
  private int cm2pixel(double value)
  {
    return (int)(value*96/2.5399);
  }
  
  public ImageDescriptor(Image image, int xPos, int yPos, int zIndex, int width, int height)
  {
    super();
    this.image = image;
    this.fileName = null;
    this.xPos = xPos;
    this.yPos = yPos;
    this.zIndex = zIndex;
    this.width = width;
    this.height = height;
  }
  
  public ImageDescriptor(Image image, String xPos, String yPos, String zIndex, String width, String height)
  {
    super();
    this.image = image;
    this.fileName = null;
    this.xPos = cm2pixel(Double.valueOf(xPos.substring(0, xPos.length()-2)));
    this.yPos = cm2pixel(Double.valueOf(yPos.substring(0, yPos.length()-2)));
    this.zIndex = Integer.parseInt(zIndex);
    this.width = cm2pixel(Double.valueOf(width.substring(0, width.length()-2)));
    this.height = cm2pixel(Double.valueOf(height.substring(0, height.length()-2)));
  }
  public ImageDescriptor(String fileName, String xPos, String yPos, String zIndex, String width, String height)
  {
    super();
    this.image = null;
    this.fileName = fileName;
    this.xPos = cm2pixel(Double.valueOf(xPos.substring(0, xPos.length()-2)));
    this.yPos = cm2pixel(Double.valueOf(yPos.substring(0, yPos.length()-2)));
    this.zIndex = Integer.parseInt(zIndex);
    this.width = cm2pixel(Double.valueOf(width.substring(0, width.length()-2)));
    this.height = cm2pixel(Double.valueOf(height.substring(0, height.length()-2)));
  }

}
