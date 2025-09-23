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

import java.awt.Rectangle;
import java.awt.Shape;
import java.awt.geom.Ellipse2D;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.svm2png.svm.SVMCommandID;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class Ellipse extends SVMCommand
{
  Rectangle rect;

  @Override
  public void onExecute(SVMRenderer renderer)
  {
    if(!renderer.getMBLineColor() && !renderer.getMBFillColor())
      return;
    
    float x = (rect.x - renderer.getOffsetX()) * renderer.getScaleRatio() * renderer.getXScale();
    float y = (rect.y - renderer.getOffsetY()) * renderer.getScaleRatio() * renderer.getYScale();
    float width = rect.width * renderer.getScaleRatio() * renderer.getXScale();
    float height = rect.height * renderer.getScaleRatio() * renderer.getYScale();
    Shape ellipe = new Ellipse2D.Float(x,y,width,height);
    renderer.fillAndDrawShape(ellipe);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    Ellipse cmd = new Ellipse();
    
    cmd.id = id;
    cmd.rect = in.readRectL();
    in.skip(((SVMCommandID) id).getSize() - 16);
    
    return cmd;
  }

}
