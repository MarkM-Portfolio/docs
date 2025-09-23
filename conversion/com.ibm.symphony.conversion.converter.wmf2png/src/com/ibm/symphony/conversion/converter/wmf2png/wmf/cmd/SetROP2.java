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

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFCommandID;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class SetROP2 extends WMFCommand
{

  int rop2Mode;
  @Override
  public void onExecute(WMFRenderer renderer)
  {
    renderer.setROP2Mode(rop2Mode);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    SetROP2 cmd = new SetROP2();
    cmd.id = id;
    cmd.rop2Mode = in.readWORD();
    
    WMFCommandID wmfID=(WMFCommandID)id;
    if( wmfID.getSize() == 5)
      in.skip(2L); // optional reseved parameter(word), just skip it.
    return cmd;
  }

}
