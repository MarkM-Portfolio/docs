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

import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.converter.svm2png.SVMConst;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class ReadAlpha extends SVMCommand
{
  int rasterOp;
  
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    if (rasterOp == SVMConst.ROP_1)
    {
      renderer.setFillAlpha(0);
      renderer.setLineAlpha(0);
    }
    else if (rasterOp == SVMConst.ROP_0)
    {
      renderer.setFillAlpha(255);
      renderer.setLineAlpha(255);
    }
    
    renderer.setFillAlpha();
    renderer.setLineAlpha();
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    ReadAlpha cmd = new ReadAlpha();
    cmd.id = id;
    cmd.rasterOp = in.readWORD();
    
    return cmd;
  }

}
