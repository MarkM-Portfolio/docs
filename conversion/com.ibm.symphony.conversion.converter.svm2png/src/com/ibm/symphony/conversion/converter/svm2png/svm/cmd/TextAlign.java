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
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.CommandID;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaInputStream;

public class TextAlign extends SVMCommand
{
  int textAlign;
  
  @Override
  public void onExecute(SVMRenderer renderer)
  {
    renderer.setTextAlign(textAlign);
  }

  @Override
  protected Command read(MetaInputStream in, CommandID id) throws IOException
  {
    TextAlign cmd = new TextAlign();
    cmd.id = id;
    cmd.textAlign = in.readWORD();
    
    return cmd;
  }
}
