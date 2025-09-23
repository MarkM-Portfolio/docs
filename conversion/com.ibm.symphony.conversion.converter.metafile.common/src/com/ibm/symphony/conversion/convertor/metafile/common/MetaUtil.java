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

import java.awt.Point;
import java.awt.Rectangle;
import java.awt.geom.Point2D;
import java.awt.geom.Rectangle2D;

public class MetaUtil
{
  public static Point2D.Float convertPoint(Point p, MetaRenderer r)
  {
    float x = ( p.x - r.offsetX) * r.getScaleRatio() * r.getXScale();
    float y = ( p.y - r.offsetY) * r.getScaleRatio() * r.getYScale();
    return new Point2D.Float(x, y);
  }
  
  public static Rectangle2D.Float convert(Rectangle rect, MetaRenderer r)
  {
    float x = (rect.x - r.offsetX) * r.getScaleRatio() * r.getXScale();
    float y = (rect.y - r.offsetY) * r.getScaleRatio() * r.getYScale();
    float width = rect.width * r.getScaleRatio() * r.getXScale();
    float height = rect.height * r.getScaleRatio() * r.getYScale();
    return new Rectangle2D.Float(x,y,width,height);
  }
}
