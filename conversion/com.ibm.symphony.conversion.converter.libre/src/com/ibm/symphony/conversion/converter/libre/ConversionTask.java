/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of HCL                              */
/*                                                                   */
/* Copyright HCL Technologies Ltd. 2021                       		 */
/*                                                                   */
/* US Government Users Restricted Rights                             */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.libre;

import java.io.File;
import java.util.Map;

public class ConversionTask
{
  public File sourceFile;

  public File targetDir;
  
  public Map options = null;
  
  public ConversionTask(File source, File targetDir, Map parameters)
  {
    this.sourceFile = source;
    this.targetDir = targetDir;
    this.options = parameters;
  }
  
  public String toString()
  {
    return "source is "+this.sourceFile+". target:"+this.targetDir+".";
  }
}