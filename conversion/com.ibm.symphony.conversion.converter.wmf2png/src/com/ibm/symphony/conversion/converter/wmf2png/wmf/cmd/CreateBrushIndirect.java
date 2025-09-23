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

import java.awt.Color;
import java.awt.Paint;
import java.io.IOException;

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class CreateBrushIndirect extends CreateObject
{
  Paint fillPaint = null;
  @Override
  public void onSelectObject(WMFRenderer renderer)
  {
    renderer.setFillPaint(fillPaint);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    CreateBrushIndirect cmd = new CreateBrushIndirect();
    cmd.id = id;
    int bushStyle = in.readWORD();
    cmd.fillPaint = in.readColor();
    /*int bushHatch = */in.readWORD();
    //@Todo should support more styles
    if( bushStyle == 0x0001 ) // null style
    {
      cmd.fillPaint = new Color(0,0,0,0);
    }   
    return cmd;
  }

}
