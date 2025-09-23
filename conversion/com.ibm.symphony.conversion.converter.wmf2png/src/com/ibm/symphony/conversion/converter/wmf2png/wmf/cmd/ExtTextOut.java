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

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFCommandID;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaDataInputStream;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaUtil;

public class ExtTextOut extends WMFCommand
{

  private Point point;
  private String text;

  @Override
  public void onExecute(WMFRenderer renderer)
  {
    Float p = MetaUtil.convertPoint(point, renderer);
    renderer.drawText(text, p.x, p.y);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    WMFCommandID cmdID = (WMFCommandID) id;
    MetaDataInputStream input = in.openSubStream( (int) ((cmdID.getSize() - 3 )<<1) );
    ExtTextOut cmd = new ExtTextOut();
    cmd.id = id;
    int y = input.readShort();
    int x = input.readShort();
    cmd.point = new Point(x,y);
    short strLength = input.readShort();
    int fwOpts = input.readShort();
    if ( ( fwOpts & ( 0x0002 | 0x0004 ) ) != 0)
    {
      input.readRectRV();
    }
    byte[] txtBuf = new byte[strLength];
    input.read(txtBuf);
    cmd.text = new String(txtBuf);
    
    
    return cmd;
  }

}
