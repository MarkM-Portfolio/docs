package com.ibm.conversion.service.rest.servlet.util;

import java.io.File;


public class ConversionVersionCheck
{
  private static String conversionVersion = null;
  private static boolean isValid = false;
  private static long lastCheckTime = 0;
  private static boolean isLocalBuild = false;
  final private static long duration = 60 * 1000;
  final private static String KEY_CONVERSION_VERSION = "CONVERSION_VERSION";
  final private static String KEY_DOCS_VERSION = "DOCS_VERSION";
  
  public static void initVersion(String path)
  {
    File versionFile = new File(path, "version.txt");
    if(!versionFile.exists())
    {
      isLocalBuild = true;
    }
  }
  
  public static boolean isValidVersion()
  {
    if (conversionVersion == null)
      conversionVersion = WASConfigHelper.getCellVariable(KEY_CONVERSION_VERSION);
    
    // if it has been a valid Docs version, no need to check again
    if (isValid)
      return true;
    
    if (needCheck())
    {
      if (isLocalBuild)
        isValid = true;
      else
      {
        String docsVersion = WASConfigHelper.getCellVariable(KEY_DOCS_VERSION);
        
        if (docsVersion == null)// on smartcloud, conversion and Docs are in different cell, cannot read the variable
          isValid = true;
        else 
          isValid = ((conversionVersion!=null) && docsVersion.equals(conversionVersion));
  
        lastCheckTime = System.currentTimeMillis();
      }

    }
    
    return isValid;
  }

  private static boolean needCheck()
  {
    if (isValid)
      return false;

    if (lastCheckTime == 0)
      return true;
    
    if (conversionVersion == null)
      return true;
        
    long currentTime = System.currentTimeMillis();
    if ((currentTime - lastCheckTime) > duration)
      return true; 
    else
      return false;
  }
}
