package com.ibm.concord.viewer.serviceability;

public class LoggerUtil
{
  private final static String LOG_PREFIX = "CLFAF";
  
  public static String getLogMessage(int errorCode, String msg)
  {
    StringBuffer retVal = new StringBuffer(LOG_PREFIX);
    retVal.append(String.format("%03d", errorCode));
    if (errorCode < 400)
    {
      retVal.append('I');
    }
    else if (errorCode < 700)
    {
      retVal.append('W');
    }
    else
    {
      retVal.append('E');
    }
    retVal.append(": ");

    // append some customized message
    if (msg != null)
      retVal.append(msg);

    return retVal.toString();
  }

}
