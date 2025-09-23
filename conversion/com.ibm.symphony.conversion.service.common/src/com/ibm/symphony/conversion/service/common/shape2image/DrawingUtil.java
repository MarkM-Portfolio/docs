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

public class DrawingUtil
{
  public  final static String DEFAULT_VIEWBOX = "0 0 21600 21600";
  public static double getAngle(Point start, Point end)
  {
    return getAngle(start,end,' ');
  }
  
  public static double getAngle(Point start, Point end,char flag)
  {
      int dy = end.getY() - start.getY();
      int dx = end.getX() - start.getX();
      if( dx == 0 )
      {
        if(dy>0)
          return Math.PI/2;
        else
          return 3*Math.PI/2;
      }
      
      double angle = Math.atan(dy*1.0 / dx);
      
      if (dx < 0 ) {
        angle = (Math.PI + angle);
      }
      else if (dy < 0) {
        angle = (angle + 2 * Math.PI);
      }
      return angle;
  }
  
  public static double getRealAngle(double angle)
  {
    if(angle == 0.0)
    {
      return 0.0;
    }
    if(angle >0 && angle < Math.PI/2)
    {
      return 2*Math.PI - angle;
    }
    else if( angle >= Math.PI/2 && angle < Math.PI)
    {
//      return 5*Math.PI/2 - angle;
      return 2*Math.PI - angle;
    }
    else if(angle == Math.PI)
    {
      return Math.PI;
    }
    else if( angle >Math.PI && angle < 3*Math.PI/2 )
    {
      return 2*Math.PI - angle;
    }
    else if( angle >= Math.PI*3/2 && angle < 2*Math.PI )
    {
      return 2*Math.PI-angle;
    } 
    return angle%Math.PI;
  }
  
}
