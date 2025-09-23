package com.ibm.concord.platform.util;

import com.ibm.docs.common.util.WASConfigHelper;

public class ConcordVersionCheck
{
  private static String docsVersion = null;
  private static boolean isValid = false;
  private static long lastCheckTime = 0;
  final private static long duration = 60 * 1000;
  final private static String KEY_CONVERSION_VERSION = "CONVERSION_VERSION";
  
  public static boolean isValidVersion()
  {
    if (docsVersion == null)
      docsVersion = ConcordUtil.getVersion();
    
    // if it has been a valid Docs version, no need to check again
    if (isValid)
      return true;
    
    if (needCheck())
    {
      if (ConcordUtil.isLocalBuild())
        isValid = true;
      else
      {
        String conversionVersion = WASConfigHelper.getCellVariable(KEY_CONVERSION_VERSION);
         
        if (conversionVersion == null) // on smartcloud, conversion and Docs are in different cell, cannot read the variable
          isValid = true;
        else 
          isValid = docsVersion.equals(conversionVersion);
      }
      
      lastCheckTime = System.currentTimeMillis();
    }
    
    return isValid;
  }

  private static boolean needCheck()
  {
    if (isValid)
      return false;

      
    if (lastCheckTime == 0)
      return true;
    
    if (docsVersion == null)
      return true;
        
    long currentTime = System.currentTimeMillis();
    if ((currentTime - lastCheckTime) > duration)
      return true; 
    else
      return false;
  }
}
