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

import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaRenderer;


public abstract class  SVMCommand extends Command
{

  @Override
  public void execute(MetaRenderer renderer)
  {
    SVMRenderer svm = (SVMRenderer) renderer;
    onExecute(svm);
  }
  
  public abstract void onExecute(SVMRenderer renderer);

}
