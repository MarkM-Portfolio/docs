/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.log;

import java.util.logging.Level;
import java.util.logging.Logger;

public class ConcordLogger
{
  private final static String DOCS_LOG_PREFIX = "CLFAD";
  
  public static void log(Logger log, Level level, int msgCode, String msg)
  {
    log(log, level, msgCode, msg, null);
  }
  
  /**
   * Log a message of the specified level with the error code and any exception
   */
  public static void log(Logger log, Level level, int msgCode, String msg, Throwable e)
  {
    String levelMark = getLevelMark(level);
    boolean isWasLogger = isWasLogger(log);
    
    StringBuffer errMsg = new StringBuffer();
    errMsg.append(DOCS_LOG_PREFIX);
    if (msgCode == 0)
    {
      errMsg.append("0000");
    }
    else
    {
      errMsg.append(msgCode);
    }
    errMsg.append(levelMark);
    errMsg.append(": ");
    if (msg == null)
    {
      errMsg.append("No Error Message");
    }
    else
    {
      errMsg.append(msg);
    }
    
    if (isWasLogger)
    {
     
      if (e == null)
      {
        log.log(level, errMsg.toString());
      }
      else
      {
        log.log(level, errMsg.toString(),e);
      }
    }
    else
    {
      String[] sourceInfo = getInvokeSourceInfo();
      String sourceClass = sourceInfo[0];
      String sourceMethod = sourceInfo[1];
      if (e == null)
      {
        log.logp(level, sourceClass, sourceMethod, errMsg.toString());
      }
      else
      {
        log.logp(level, sourceClass, sourceMethod, errMsg.toString(),e);
      }
    }
    
  }
  
  /*
   * Query the source class and source method which invoke this logger
   */
  private static String[] getInvokeSourceInfo()
  {
    String[] sourceInfo = {"",""};
    StackTraceElement[] elements = (new Throwable()).getStackTrace();
    
    for (int i = elements.length-2; i >= 0 ; i--)
    {
      if (elements[i].getClassName().equals(ConcordLogger.class.getName()))
      {
        sourceInfo[0] = elements[i+1].getClassName();
        sourceInfo[1] = elements[i+1].getMethodName();
        break;
      }
    }
   return sourceInfo;    
  }
  
  
  private static boolean isWasLogger(Logger log)
  {
    if (log.getClass().getName().equals("java.util.logging.Logger"))
      return false;
    else
      return true;
  }
  
  /*
   * Decide the level tag with the log.level
   */
  private static String getLevelMark(Level level)
  {
    if (level == Level.INFO)
      return "I";
    else if (level == Level.WARNING)
      return "W";
    else if (level == Level.SEVERE)
      return "E";
    else if (level == Level.FINE)
      return "I FINE";
    else if (level == Level.FINER)
      return "I FINER";
    else if (level == Level.FINEST)
      return "I FINEST";
    
    return "I";
  }

  /**
   * @param args
   */
  public static void main(String[] args)
  {
    

  }

}
