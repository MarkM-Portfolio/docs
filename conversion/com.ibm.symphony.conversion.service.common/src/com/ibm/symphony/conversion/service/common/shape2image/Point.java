/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.shape2image;

public class Point
{
  private int x;

  private int y;

  public Point(int x, int y)
  {
    this.x = x;
    this.y = y;
  }

  public String toString()
  {
    return String.valueOf(x) + "," + String.valueOf(y);
  }

  public int getX()
  {
    return x;
  }

  public int getY()
  {
    return y;
  }

}
