/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.wmf2png.wmf.cmd;

import java.awt.Point;
import java.awt.geom.GeneralPath;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class Polygon extends WMFCommand
{
  Point[] points;
  @Override
  public void onExecute(WMFRenderer renderer)
  {
    GeneralPath path = new GeneralPath(renderer.getWindingRule());
    for(int i=0;i<points.length;i++)
    {
      Point p = points[i];
      float x = (p.x - renderer.getOffsetX()) * renderer.getScaleRatio() * renderer.getXScale();
      float y = (p.y - renderer.getOffsetY()) * renderer.getScaleRatio() * renderer.getYScale();
      if (i == 0)
      {
        path.moveTo(x, y);
      }
      else
      {
        path.lineTo(x, y);
      }
    }
    path.closePath();
    renderer.fillAndDrawShape(path);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    Polygon cmd = new Polygon();
    cmd.id = id;
    
    short numofPoint = in.readShort();
    cmd.points = new Point[numofPoint];
    in.readPointS(cmd.points);
    
    return cmd;
  }

}
