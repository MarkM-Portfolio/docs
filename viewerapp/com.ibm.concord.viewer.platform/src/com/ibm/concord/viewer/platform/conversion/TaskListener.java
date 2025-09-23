/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversion;

import java.io.FileNotFoundException;
import java.io.IOException;

import com.ibm.concord.viewer.platform.conversion.ConversionTask.ConversionEvent;

public interface TaskListener
{
  public void onEvent(ConversionEvent event) throws FileNotFoundException, InterruptedException, IOException;
  public void setConvertDir(String convertDir);
  public String getConvertDir();
  public void addListener(TaskListener otherType);
}
