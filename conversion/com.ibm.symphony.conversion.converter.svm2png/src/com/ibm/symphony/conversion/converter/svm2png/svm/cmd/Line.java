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

import java.awt.geom.GeneralPath;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.svm2png.svm.SVMCommandID;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class Line extends SVMCommand
{
  int x1, y1, x2, y2;
  
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    if(!renderer.getMBLineColor())
      return;
    
    float xx1 = (x1 - renderer.getOffsetX()) * renderer.getScaleRatio() * renderer.getXScale();
    float yy1 = (y1 - renderer.getOffsetY()) * renderer.getScaleRatio() * renderer.getYScale();
    float xx2 = (x2 - renderer.getOffsetX()) * renderer.getScaleRatio() * renderer.getXScale();
    float yy2 = (y2 - renderer.getOffsetY()) * renderer.getScaleRatio() * renderer.getYScale();
    
    GeneralPath path = new GeneralPath(renderer.getWindingRule());
    path.moveTo(xx1, yy1);
    path.lineTo(xx2, yy2);
    renderer.drawShape(path);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    Line cmd = new Line();
    cmd.id = id;
    
    cmd.x1 = in.readInt();
    cmd.y1 = in.readInt();
    cmd.x2 = in.readInt();
    cmd.y2 = in.readInt();
    
    in.skip(((SVMCommandID) id).getSize() - 16);
    
    return cmd;
  }

}
