/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.sym.impl;

import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ConversionTask
{

  private static final Logger LOG = Logger.getLogger(ConversionTask.class.getName());

  public String sourceFile;

  public String sourceType;

  public String targetType;

  public String targetDir;

  public SymphonyDescriptor symphonyDesc;

  public int connectCount;

  public HashMap<String, String> options = null;

  public ConversionTask(String source, String targetDir, String sourceType, String targetType, HashMap<String, String> options)
  {
    this.sourceFile = source;
    this.targetDir = targetDir;
    this.sourceType = sourceType;
    this.targetType = targetType;
    this.options = options;
  }

  public void setSymphonyDescriptor(SymphonyDescriptor symphonyDisc)
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.finer(symphonyDisc.toString());
    }
    this.symphonyDesc = symphonyDisc;
  }

  public void setConnectCount(int times)
  {
    this.connectCount = times;
  }

  public void increaseConnectCount()
  {
    this.connectCount++;
  }
}