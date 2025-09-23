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

public class DelectObject extends WMFCommand
{
  int index;
  @Override
  public void onExecute(WMFRenderer renderer)
  {
    renderer.delectObject(index);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    DelectObject cmd = new DelectObject();
    cmd.id = id;
    cmd.index = in.readWORD();
    return cmd;
  }

}
