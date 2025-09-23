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
import java.io.IOException;

import com.ibm.symphony.conversion.converter.svm2png.svm.SVMCommandID;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class DrawRect extends SVMCommand
{
  Rectangle rect;
  
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    if(!renderer.getMBLineColor() && !renderer.getMBFillColor())
      return;
    
    int x = (int) ((rect.x - renderer.getOffsetX())*renderer.getScaleRatio()*renderer.getXScale());
    int y = (int) ((rect.y - renderer.getOffsetY())*renderer.getScaleRatio()*renderer.getYScale());
    int width = (int) ((rect.width+rect.x- renderer.getOffsetY()) * renderer.getScaleRatio() * renderer.getXScale())- x;
    int height = (int) ((rect.height+rect.y- renderer.getOffsetY()) * renderer.getScaleRatio() * renderer.getYScale())- y;
    Rectangle newRect = new Rectangle(x, y, width, height);
    renderer.fillAndDrawShape(newRect);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    DrawRect cmd = new DrawRect();
    cmd.id = id;
    cmd.rect = in.readRectL();    
    in.skip(((SVMCommandID) id).getSize() - 16);
    return cmd;
  }

}
