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

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaHeader;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class SetWindowExt extends WMFCommand
{
  private short y;
  private short x;
  
  public short getX() { return x; }
  public short getY() { return y; }
  
  @Override
  public void onExecute(WMFRenderer renderer)
  {
    try
    {
      MetaHeader header = renderer.getHeader();
      renderer.setXScale(header.getWidth() /(float) x);
      renderer.setYScale(header.getHeight() / (float) y);
    }
    catch (IOException e)
    {
      e.printStackTrace();
    }

  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    SetWindowExt cmd = new SetWindowExt();
    cmd.id = id;
    cmd.y = in.readShort();
    cmd.x = in.readShort();
    
    return cmd;
  }

}
