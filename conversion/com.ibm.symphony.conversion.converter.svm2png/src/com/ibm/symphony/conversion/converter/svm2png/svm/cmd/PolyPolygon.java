/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.svm2png.svm.cmd;

import java.awt.Point;
import java.awt.geom.GeneralPath;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.svm2png.svm.SVMCommandID;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class PolyPolygon extends SVMCommand
{
  private Point[][] points;

  @Override
  public void onExecute(SVMRenderer renderer)
  {
    if(!renderer.getMBLineColor() && !renderer.getMBFillColor())
      return;
    
    GeneralPath path = new GeneralPath(renderer.getWindingRule());
    for (int i = 0; i < points.length; i++)
    {
      GeneralPath subPath = new GeneralPath(renderer.getWindingRule());
      for (int j = 0; j < points[i].length; j++)
      {
        Point p = points[i][j];
        int x = (int) ((p.x - renderer.getOffsetX()) * renderer.getScaleRatio() * renderer.getXScale());
        int y = (int) ((p.y - renderer.getOffsetY()) * renderer.getScaleRatio() * renderer.getYScale());
        if (j == 0)
        {
          subPath.moveTo(x, y);
        }
        else
        {
          subPath.lineTo(x, y);
        }
      }
      subPath.closePath();
      path.append(subPath, false);
    }
    path.closePath();
    renderer.fillAndDrawShape(path);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    int polyNum = in.readWORD();
    Point[][] points = new Point[polyNum][];
    int[] pointCounts = new int[polyNum];
    int passNum = 2;
    
    for (int i = 0; i < points.length; i++)
    {
      pointCounts[i] = in.readWORD();
      points[i] = new Point[pointCounts[i]];
      in.readPointL(points[i]);
      passNum += 2 + pointCounts[i]*8;
    }
    
    in.skip(((SVMCommandID) id).getSize() - passNum); // No use now

    PolyPolygon cmd = new PolyPolygon();
    cmd.id = id;
    cmd.points = points;
    return cmd;
  }

}
