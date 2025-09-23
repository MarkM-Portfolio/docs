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

import java.awt.geom.Rectangle2D.Float;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaUtil;

public class Rectangle extends WMFCommand
{
  java.awt.Rectangle rect;
  @Override
  public void onExecute(WMFRenderer renderer)
  {
    Float r = MetaUtil.convert(rect, renderer);
    renderer.fillAndDrawShape(r);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    Rectangle cmd = new Rectangle();
    cmd.id = id;
    short b = in.readShort();
    short r = in.readShort();
    short t = in.readShort();
    short l = in.readShort();
    
    cmd.rect = new java.awt.Rectangle(l, t, r - l, b - t   );
    
    
    return cmd;
  }

}
