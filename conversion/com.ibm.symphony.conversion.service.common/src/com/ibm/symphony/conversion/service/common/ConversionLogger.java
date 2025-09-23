/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.symphony.conversion.service.common;

import java.util.logging.Level;
import java.util.logging.Logger;

public class ConversionLogger
{
  private final static String CONVERSION_LOG_PREFIX = "CLFAE";

  // If the source method and source class has been initialized
  private static transient boolean sourceInited;

  /**
   * The name of the class that issued the logging call.
   * 
   * @serial
   */
  private static String sourceClassName;

  /**
   * The name of the method that issued the logging call.
   * 
   * @serial
   */
  private static String sourceMethodName;

  /**
   * Logs a message of the specified level with the supplied parameter array and exception.
   * 
   * @param log
   *          the logger that will be used
   * @param level
   *          the level of the given message
   * @param msg
   *          the simple message that need to be logged
   * 
   */
  public static void log(Logger log, Level level, String msg)
  {
    // clog(level, 0, null, null, null, null, msg, null);
    String sourceClass = getSourceClassName();
    String sourceMethod = getSourceMethodName();
    boolean isWasLogger = isWasLogger(log);

    if (isWasLogger)
      log.log(level, msg);
    else
      log.logp(level, sourceClass, sourceMethod, msg);
  }

  /**
   * Logs a message of the specified level with the supplied parameter array and exception.
   * 
   * @param log
   *          the logger that will be used
   * @param level
   *          the level of the given message
   * @param msgCode
   *          the standard code of the log which will be logged next to "CLFAE"
   * @param msg
   *          the simple message that need to be logged
   * 
   */
  public static void log(Logger log, Level level, int msgCode, String msg)
  {
    log(log, level, msgCode, null, null, null, null, msg, null);
  }

  /**
   * Logs a message of the specified level with the supplied parameter array and exception.
   * 
   * @param log
   *          the logger that will be used
   * @param level
   *          the level of the given message
   * @param msgCode
   *          the standard code of the log which will be logged next to "CLFAE"
   * @param e
   *          the exception that need to be logged
   * 
   */
  public static void log(Logger log, Level level, int msgCode, Throwable e)
  {
    log(log, level, msgCode, null, null, null, null, null, e);
  }

  /**
   * Logs a message of the specified level with the supplied parameter array and exception.
   * 
   * @param log
   *          the logger that will be used
   * @param level
   *          the level of the given message
   * @param msgCode
   *          the standard code of the log which will be logged next to "CLFAE"
   * @param msg
   *          the simple message that need to be logged
   * @param e
   *          the exception that need to be logged
   * 
   */
  public static void log(Logger log, Level level, int msgCode, String msg, Throwable e)
  {
    log(log, level, msgCode, null, null, null, null, msg, e);
  }

  /**
   * Logs a message of the specified level with the supplied parameter array and exception.
   * 
   * @param log
   *          the logger that will be used
   * @param level
   *          the level of the given message
   * @param msgCode
   *          the standard code of the log which will be logged next to "CLFAE"
   * @param sourceMime
   *          the source document mime type that need to be logged
   * @param targetMime
   *          the target document mime type that need to be logged
   * @param msg
   *          the simple message that need to be logged
   * 
   */
  public static void log(Logger log, Level level, int msgCode, String sourceMime, String targetMime, String msg)
  {
    log(log, level, msgCode, null, null, sourceMime, targetMime, msg, null);
  }

  /**
   * Logs a message of the specified level with the supplied parameter array and exception.
   * 
   * @param log
   *          the logger that will be used
   * @param level
   *          the level of the given message
   * @param msgCode
   *          the standard code of the log which will be logged next to "CLFAE"
   * @param sourceMime
   *          the source document mime type that need to be logged
   * @param targetMime
   *          the target document mime type that need to be logged
   * @param msg
   *          the simple message that need to be logged
   * @param e
   *          the exception that need to be logged
   * 
   */
  public static void log(Logger log, Level level, int msgCode, String sourceMime, String targetMime, String msg, Throwable e)
  {
    log(log, level, msgCode, null, null, sourceMime, targetMime, msg, e);
  }

  /**
   * Logs a message of the specified level with the supplied parameter array and exception.
   * 
   * @param log
   *          the logger that will be used
   * @param level
   *          the level of the given message
   * @param msgCode
   *          the standard code of the log which will be logged next to "CLFAE"
   * @param sourcePath
   *          the source document path that need to be logged
   * @param targetPath
   *          the target document path that need to be logged
   * @param sourceMime
   *          the source document mime type that need to be logged
   * @param targetMime
   *          the target document mime type that need to be logged
   * @param msg
   *          the simple message that need to be logged
   * @param e
   *          the exception that need to be logged
   * 
   */
  public static void log(Logger log, Level level, int msgCode, String sourcePath, String targetPath, String sourceMime, String targetMime,
      String msg, Throwable e)
  {
    Object[] paras = new Object[6];
    paras[0] = msgCode;
    paras[1] = sourcePath;
    paras[2] = targetPath;
    paras[3] = sourceMime;
    paras[4] = targetMime;
    paras[5] = msg;
    log(log, level, paras, e);
  }

  /**
   * Logs a message of the specified level with the supplied parameter array and exception.
   * 
   * @param log
   *          the logger that will be used
   * @param level
   *          the level of the given message
   * @param msgCode
   *          the standard code of the log which will be logged next to "CLFAE"
   * @param paras
   *          the parameter array associated with the event that need to be logged. 0:sourcePath;1:targetPath
   *          2:sourceMimeType;3:targetMimeType;
   * @param msg
   *          the simple message that need to be logged
   * @param e
   *          the exception that need to be logged
   */
  public static void log(Logger log, Level level, int msgCode, Object[] paras, String msg, Throwable e)
  {
    Object[] fParas = new Object[6];
    fParas[0] = msgCode;
    if (paras != null && paras.length == 4)
    {
      fParas[1] = paras[0];
      fParas[2] = paras[1];
      fParas[3] = paras[2];
      fParas[4] = paras[3];
    }
    fParas[5] = msg;
    log(log, level, fParas, e);
  }

  /**
   * Logs a message of the specified level with the supplied parameter array and exception.
   * 
   * @param log
   *          the logger that will be used
   * @param level
   *          the level of the given message
   * @param paras
   *          the parameter array associated with the event that need to be logged. 0:msgCode;1:sourcePath;2:targetPath
   *          3:sourceMimeType;4:targetMimeType;5:simple message
   * @param e
   *          the exception that need to be logged
   */
  public static void log(Logger log, Level level, Object[] paras, Throwable e)
  {
    String levelMark = getLevelMark(level);
    String sourceClass = getSourceClassName();
    String sourceMethod = getSourceMethodName();
    boolean isWasLogger = isWasLogger(log);

    if (paras != null && paras.length >= 6)
    {
      StringBuffer errMsg = new StringBuffer();
      errMsg.append(CONVERSION_LOG_PREFIX);
      String errCode = (((Integer) paras[0]) == 0) ? "000" : paras[0].toString();
      errMsg.append(errCode);
      errMsg.append(levelMark);
      errMsg.append(": ");

      String sourcePath = (paras[1] == null) ? "" : paras[1].toString();
      String targetPath = (paras[2] == null) ? "" : paras[2].toString();
      String sourceMime = (paras[3] == null) ? "" : paras[3].toString();
      String targetMime = (paras[4] == null) ? "" : paras[4].toString();
      String msg = (paras[5] == null) ? "" : paras[5].toString();

      if (!sourcePath.equals(""))
      {
        errMsg.append("Convert from " + sourcePath + "(" + sourceMime + ")");
        errMsg.append(" to " + targetPath + "(" + targetMime + "). ");
      }
      else if (!sourceMime.equals(""))
      {
        errMsg.append("Convert from " + sourceMime);
        errMsg.append(" to " + targetMime + ". ");
      }
      else if (!targetPath.equals(""))
      {
        errMsg.append("Convert to " + targetPath + ". ");
      }

      errMsg.append(msg);

      if (e == null)
      {
        if (isWasLogger)
          log.log(level, errMsg.toString());
        else
          log.logp(level, sourceClass, sourceMethod, errMsg.toString());
      }
      else
      {
        if (isWasLogger)
          log.log(level, errMsg.toString(), e);
        else
          log.logp(level, sourceClass, sourceMethod, errMsg.toString(), e);
      }
    }
    else
    {
      String unknowMsg = CONVERSION_LOG_PREFIX + "000" + levelMark;

      if (paras == null)
      {
        if (e != null)
        {
          if (isWasLogger)
            log.log(level, unknowMsg, e);
          else
            log.logp(level, sourceClass, sourceMethod, unknowMsg, e);
        }
        else
        {
          if (isWasLogger)
            log.log(level, unknowMsg);
          else
            log.logp(level, sourceClass, sourceMethod, unknowMsg);
        }
      }
      else
      {
        if (e != null)
        {
          if (isWasLogger)
            log.log(level, unknowMsg + ": " + e, paras);
          else
            log.logp(level, sourceClass, sourceMethod, unknowMsg + ": " + e, paras);
        }

        else
        {
          if (isWasLogger)
            log.log(level, unknowMsg, paras);
          else
            log.logp(level, sourceClass, sourceMethod, unknowMsg, paras);
        }
      }
    }
  }

  private static boolean isWasLogger(Logger log)
  {
    if (log.getClass().getName().equals("java.util.logging.Logger"))
      return false;
    else
      return true;
  }

  /*
   * Init the sourceClass and sourceMethod fields.
   */
  private static void initSource()
  {
    if (!sourceInited)
    {
      StackTraceElement[] elements = (new Throwable()).getStackTrace();
      int i = 0;
      String current = null;
      FINDLOG: for (; i < elements.length; i++)
      {
        current = elements[i].getClassName();
        if (current.equals(ConversionLogger.class.getName()))
        {
          break FINDLOG;
        }
      }
      while (++i < elements.length && elements[i].getClassName().equals(current))
      {
        // do nothing
      }
      if (i < elements.length)
      {
        sourceClassName = elements[i].getClassName();
        sourceMethodName = elements[i].getMethodName();
      }
      sourceInited = true;
    }
  }

  /**
   * Gets the name of the class that issued the logging call.
   * 
   * @return the name of the class that issued the logging call
   */
  private static String getSourceClassName()
  {
    initSource();
    return sourceClassName;
  }

  /**
   * Gets the name of the method that issued the logging call.
   * 
   * @return the name of the method that issued the logging call
   */
  private static String getSourceMethodName()
  {
    initSource();
    return sourceMethodName;
  }

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
}
