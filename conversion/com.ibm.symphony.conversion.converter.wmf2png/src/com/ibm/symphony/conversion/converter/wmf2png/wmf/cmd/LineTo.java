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
import java.awt.geom.Point2D.Float;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaUtil;

public class LineTo extends WMFCommand
{
  Point point;

  @Override
  public void onExecute(WMFRenderer renderer)
  {
    Float floadP = MetaUtil.convertPoint(point, renderer);
    renderer.lineTo(floadP);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    LineTo cmd = new LineTo();
    cmd.id = id;
    short y = in.readShort();
    short x = in.readShort();
    cmd.point = new Point(x, y);
    
    return cmd;
  }

}
