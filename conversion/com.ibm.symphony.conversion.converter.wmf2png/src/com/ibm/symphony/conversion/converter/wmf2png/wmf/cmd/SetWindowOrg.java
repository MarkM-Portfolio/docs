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

import java.io.IOException;

import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaRenderer;

public class SetWindowOrg extends Command
{
  int offsetX = 0;
  int offsetY = 0;
  
  public int getOffsetX()
  {
    return offsetX;
  }

  public int getOffsetY()
  {
    return offsetY;
  }
  
  protected SetWindowOrg()
  {
  }

  @Override
  public void execute(MetaRenderer renderer)
  {
    renderer.setOffsetX(offsetX);
    renderer.setOffsetY(offsetY);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    SetWindowOrg cmd = new SetWindowOrg();
    cmd.id = id;
    cmd.offsetY = in.readShort();
    cmd.offsetX = in.readShort();
    return cmd;
  }

}
