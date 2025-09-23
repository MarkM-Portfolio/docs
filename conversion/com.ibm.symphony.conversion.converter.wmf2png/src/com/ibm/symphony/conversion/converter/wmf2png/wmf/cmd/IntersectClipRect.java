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

import java.awt.Rectangle;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class IntersectClipRect extends WMFCommand
{
  Rectangle rect;
  @Override
  public void onExecute(WMFRenderer renderer)
  {
    float x = (rect.x - renderer.getOffsetX())*renderer.getScaleRatio()*renderer.getXScale();
    float y = (rect.y - renderer.getOffsetY())*renderer.getScaleRatio()*renderer.getYScale();
    float width = rect.width * renderer.getScaleRatio() * renderer.getXScale();
    float height = rect.height * renderer.getScaleRatio() * renderer.getYScale();
    renderer.getGraphics().clipRect((int)x, (int)y, (int)width, (int)height);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    IntersectClipRect cmd = new IntersectClipRect();
    cmd.id = id;
    cmd.rect = in.readRectRV();    
    return cmd;
  }

}
