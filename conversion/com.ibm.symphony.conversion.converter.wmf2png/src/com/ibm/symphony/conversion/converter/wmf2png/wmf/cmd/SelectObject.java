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
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class SelectObject extends WMFCommand
{
  protected SelectObject() { }
  int index = -1;

  @Override
  public void onExecute(WMFRenderer renderer)
  {
    CreateObject obj = renderer.selectObject(index);
    obj.onSelectObject(renderer); 
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    SelectObject cmd = new SelectObject();
    cmd.id = id;
    cmd.index = in.readWORD(); 
    return cmd;
  }

}
