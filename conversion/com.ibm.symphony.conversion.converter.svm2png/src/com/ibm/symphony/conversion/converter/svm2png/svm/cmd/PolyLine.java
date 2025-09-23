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

public class PolyLine extends SVMCommand
{
  Point[] points;
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    if(!renderer.getMBLineColor())
      return;
    
    GeneralPath path = new GeneralPath(renderer.getWindingRule());
    for(int i=0;i<points.length;i++)
    {
      Point p = points[i];
      int x = (int) ((p.x - renderer.getOffsetX()) * renderer.getScaleRatio() * renderer.getXScale());
      int y = (int) ((p.y - renderer.getOffsetY()) * renderer.getScaleRatio() * renderer.getYScale());
      if (i == 0)
      {
        path.moveTo(x, y);
      }
      else
      {
        path.lineTo(x, y);
      }
    }
    renderer.drawShape(path);    
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    PolyLine cmd = new PolyLine();
    cmd.id = id;
    
    int numofPoint = in.readWORD();
    cmd.points = new Point[numofPoint];
    in.readPointL(cmd.points);
    
    in.skip(((SVMCommandID) id).getSize() - (2+numofPoint*8)); // No use now
    
    return cmd;
  }

}
