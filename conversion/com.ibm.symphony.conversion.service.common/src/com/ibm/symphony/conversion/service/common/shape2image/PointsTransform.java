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

import java.util.StringTokenizer;

public class PointsTransform
{
  private Point basePoint;

  private int min_x;

  private int max_x;

  private int min_y;

  private int max_y;

  public String parse(String expr)
  {
    StringBuilder svgPoints = new StringBuilder(expr.length());
    StringTokenizer pointsToken = new StringTokenizer(expr);
    int i = 0;
    while (pointsToken.hasMoreTokens())
    {
      String pointStr = pointsToken.nextToken();
      String[] points = pointStr.split(",");
      Point point = new Point(Integer.parseInt(points[0]), Integer.parseInt(points[1]));
      if (i == 0)
      {
        svgPoints.append("0").append(",").append("0").append(" ");
        basePoint = point;
        i++;
      }
      else
      {
        int x = point.getX() - basePoint.getX();
        int y = point.getY() - basePoint.getY();
        point = new Point(x, y);
        if (x < min_x)
          min_x = x;
        else if (x > max_x)
          max_x = x;

        if (y < min_y)
          min_y = y;
        else if (y > max_y)
          max_y = y;

        svgPoints.append(x).append(",").append(y).append(" ");
      }
    }
    return svgPoints.toString().trim();
  }

  public int getMinXCoordinate()
  {
    return min_x;
  }

  public int getMinYCoordinate()
  {
    return min_y;
  }

  public int getMaxXCoordinate()
  {
    return max_x;
  }

  public int getMaxYCoordinate()
  {
    return max_y;
  }
  
  public double width()
  {
    double actualWidth = max_x - min_x;
    return actualWidth / 1000;
  }

  public double height()
  {
    double actualHeight = max_y - min_y;
    return actualHeight / 1000;
  }
}
