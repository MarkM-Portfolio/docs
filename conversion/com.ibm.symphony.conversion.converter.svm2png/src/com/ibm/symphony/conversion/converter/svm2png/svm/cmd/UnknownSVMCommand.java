/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.svm2png.svm.cmd;

import java.io.IOException;

import com.ibm.symphony.conversion.converter.svm2png.svm.SVMCommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaRenderer;

public class UnknownSVMCommand extends Command
{ 
  @Override
  public void execute(MetaRenderer renderer)
  {
    
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    UnknownSVMCommand cmd = new UnknownSVMCommand();
    SVMCommandID cmdID = (SVMCommandID) id;

    in.skip(cmdID.getSize());
    
    cmd.id = cmdID;
    
    return cmd;
  }

}
