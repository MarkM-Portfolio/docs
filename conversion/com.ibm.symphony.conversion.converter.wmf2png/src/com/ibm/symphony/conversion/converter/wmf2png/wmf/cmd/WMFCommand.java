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

import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.Command;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaRenderer;


public abstract class  WMFCommand extends Command
{

  @Override
  public void execute(MetaRenderer renderer)
  {
    WMFRenderer wmf = (WMFRenderer) renderer;
    onExecute(wmf);
  }
  
  public abstract void onExecute(WMFRenderer renderer);

}
