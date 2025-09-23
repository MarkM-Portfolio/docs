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
import java.io.IOException;

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class SetTextColor extends WMFCommand
{
  Color color;
  @Override
  public void onExecute(WMFRenderer renderer)
  {
    renderer.setTextPaint(color);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    SetTextColor cmd = new SetTextColor();
    cmd.id = id;
    cmd.color = in.readColor();
    return cmd;
  }

}
