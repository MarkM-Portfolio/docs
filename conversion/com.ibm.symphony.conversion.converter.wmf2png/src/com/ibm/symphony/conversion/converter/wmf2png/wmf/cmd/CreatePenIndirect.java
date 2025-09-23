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

import java.awt.BasicStroke;
import java.awt.Color;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFCommandID;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class CreatePenIndirect extends CreateObject
{
  Color strokeColor = null;
  int penWidth;
  
  @Override
  public void onSelectObject(WMFRenderer renderer)
  {
    BasicStroke stroke = new BasicStroke(penWidth * renderer.getXScale() * renderer.getScaleRatio());
    renderer.setStroke(stroke);
    renderer.setStrokePaint(strokeColor);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    CreatePenIndirect cmd = new CreatePenIndirect();
    cmd.id = id;
    
    int penStyle = in.readWORD();
    cmd.penWidth = in.readPointS().x;
    
    cmd.strokeColor = in.readColor();
    //@ToDo more styles should be supported;
    if( penStyle == 0x0005 )
    {
      //the pen is null;
      cmd.strokeColor = new Color(0,0,0,0);
    }
    WMFCommandID cmdID = (WMFCommandID) id;
    in.skip( ((cmdID.getSize() - 3) << 1) - 10 );
    return cmd;
  }

}
