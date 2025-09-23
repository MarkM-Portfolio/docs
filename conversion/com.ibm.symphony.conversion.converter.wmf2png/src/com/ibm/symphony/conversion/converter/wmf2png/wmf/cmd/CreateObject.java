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

public abstract class CreateObject extends WMFCommand
{

  @Override
  public void onExecute(WMFRenderer renderer)
  {
    renderer.storeObject(this);
  }
  
  public abstract void onSelectObject(WMFRenderer renderer);
}
