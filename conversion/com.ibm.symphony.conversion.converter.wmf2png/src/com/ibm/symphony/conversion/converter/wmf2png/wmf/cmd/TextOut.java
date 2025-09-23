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

public class TextOut extends WMFCommand
{

  
  private String text;
  private Point point;
  
  @Override
  public void onExecute(WMFRenderer renderer)
  {
    Float p = MetaUtil.convertPoint(point, renderer);
    renderer.drawText(text, p.x, p.y);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    TextOut cmd = new TextOut();
    cmd.id = id;
    int strLen = in.readShort();
    if(0 != ( strLen & 1))
    {
      strLen ++;
    }
    byte[] textBuf = new byte[strLen];
    in.read(textBuf);
    cmd.text = new String(textBuf).trim();
    
    int y = in.readShort();
    int x = in.readShort();
    cmd.point = new Point(x,y);
    return cmd;
  }

}
