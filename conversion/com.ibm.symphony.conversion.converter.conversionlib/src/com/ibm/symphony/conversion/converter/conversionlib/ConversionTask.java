package com.ibm.symphony.conversion.converter.conversionlib;

import java.io.File;
import java.util.Map;

public class ConversionTask
{
  public File sourceFile;

  public File targetFile;
  
  public String sourceType;
  
  public String targetType;
  
  public Map options = null;
  
  public ConversionTask(File sourceFile, File targetFile, String sourceType, String targetType, Map parameters)
  {
    this.sourceFile = sourceFile;
    this.targetFile = targetFile;
    this.sourceType = sourceType;
    this.targetType = targetType;
    this.options = parameters;
  }
  
  public String toString()
  {
    return "source is "+this.sourceFile+". target:"+this.targetFile+".";
  }


}
