/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.presentation;

import java.text.MessageFormat;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;

import com.ibm.json.java.JSONObject;

//================================================================================
// Presentation Configuration Properties
//================================================================================
//
// Example conversion-config.json:
//  "mobile_limits": {
//      "max-size": "5120",
//      "actual-max-size": "6144",
//      "max-pages": "50",
//      "max-graphics":"500"
//  },
//
//--------------------------------------------------------------------------------
// Definition of configuration properties
//--------------------------------------------------------------------------------
// max-pages                : Maximum number of pages allowed (LONG)
// max-graphics             : Maximum number of graphics allowed (LONG)
//================================================================================
public class PresentationConfig
{
  private static final String CLASS = PresentationConfig.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  private static final IDocumentService cvDocService;

  private static final String PRES = "pres";

  private static final String MOBILE_LIMITS = "mobile_limits";

  // ==============================================================================
  // Configuration Tokens
  // ==============================================================================
  private static final String MAX_PAGES = "max-pages";

//  private static final String MAX_GRAPHICS = "max-graphics";

  // ==============================================================================
  // Default Configuration Values
  // ==============================================================================
  private static final long DEFAULT_MAX_PAGES_MOBILE = 50;

//  private static final long DEFAULT_MAX_GRAPHICS_MOBILE = 500;

  // ==============================================================================
  // Cached Configuration Values
  // ==============================================================================
  private static long cvMaxPagesMobile = -1;

//  private static long cvMaxGraphicsMobile = -1;

  // ==============================================================================
  // Messages
  // ==============================================================================
  public static final String LOG_NUMERIC = "numeric";

  public static final String LOG_BOOLEAN = "boolean";

  public static final String LOG_NOT_SET = "not set";

  public static final String LOG_CONFIGURATION_VALUE = "Configuration value for {0} = {1}";

  public static final String LOG_NO_VALID_CONFIG_VALUE = "No valid {0} value was set for {1}, initializing to a default value";

  static
  {
    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
        DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);
    cvDocService = docServiceProvider.getDocumentServiceByType(PRES);
  }

  /**
   * Gets the Mobile Page Limit from the appropriate configuration.
   * <p>
   * 
   * @return long Mobile Page Limit configuration value
   * 
   */
  public static long getMobilePageLimit()
  {
    long maxSize = cvMaxPagesMobile;
    if (maxSize < 0) // Check if the value has been cached
    {
      maxSize = getPresentationConfigNumericValue(MAX_PAGES, DEFAULT_MAX_PAGES_MOBILE);

      if (maxSize >= 0) // Cache the property
      {
        cvMaxPagesMobile = maxSize;
      }
    }
    return maxSize;
  }

  /**
   * Determines if the page count exceeds the configured limit.
   * <p>
   * 
   * @param count
   *          Current page count
   * 
   * @return boolean indicating whether or not the limit has been exceeded
   * 
   */
  protected static boolean exceedMobilePageLimits(long count)
  {
    return count > getMobilePageLimit();
  }

  /**
   * Gets the Mobile Graphic Limit from the appropriate configuration..
   * <p>
   * 
   * @return long Mobile Graphic Limit configuration value
   * 
   */
//  public static long getMobileGraphicLimit()
//  {
//    long maxSize = cvMaxGraphicsMobile;
//    if (maxSize < 0) // Check if the value has been cached
//    {
//      maxSize = getPresentationConfigNumericValue(MAX_GRAPHICS, DEFAULT_MAX_GRAPHICS_MOBILE);
//
//      if (maxSize >= 0) // Cache the property
//      {
//        cvMaxGraphicsMobile = maxSize;
//      }
//    }
//    return maxSize;
//  }

  /**
   * Determines if the graphic count exceeds the configured limit.
   * <p>
   * 
   * @param count
   *          Current graphic count
   * 
   * @return boolean indicating whether or not the limit has been exceeded
   * 
   */
//  protected static boolean exceedMobileGraphicLimits(long count)
//  {
//    return count > getMobileGraphicLimit();
//  }

  /**
   * Gets the specified configuration value from the appropriate configuration.
   * <p>
   * 
   * @param key
   *          Key for the configuration value to retrieve
   * 
   * @return Object configuration value
   * 
   */
  private static Object getPresentationConfigValue(String key)
  {
    JSONObject config = cvDocService.getConfig();
    if (config != null)
    {
      config = (JSONObject) config.get(MOBILE_LIMITS);
    }

    Object value = null;
    if (config != null)
    {
      value = config.get(key);
    }

    if (value != null)
    {
      logMessage(createMessage(LOG_CONFIGURATION_VALUE, key, value.toString()));
    }
    else
    {
      logMessage(createMessage(LOG_CONFIGURATION_VALUE, key, LOG_NOT_SET));
    }

    return value;
  }

  /**
   * Gets the specified configuration numeric value from the appropriate configuration.
   * <p>
   * 
   * @param key
   *          Key for the configuration value to retrieve
   * @param defaultValue
   *          Default Value if the configuration is not set
   * 
   * @return long configuration value
   * 
   */
  private static long getPresentationConfigNumericValue(String key, long defaultValue)
  {
    Object value = getPresentationConfigValue(key);

    long numericValue = defaultValue; // Default size if the property is not set

    if (value != null)
    {
      try
      {
        if (value instanceof Long)
        {
          numericValue = ((Long) value).longValue();
        }
        else if (value instanceof String)
        {
          numericValue = Long.parseLong((String) value);
        }
      }
      catch (Exception e)
      {
        String message = createMessage(LOG_NO_VALID_CONFIG_VALUE, LOG_NUMERIC, key);
        logMessage(Level.WARNING, message);
      }
    }

    return numericValue;
  }

  /**
   * Gets the specified configuration numeric value from the appropriate configuration.
   * <p>
   * 
   * @param key
   *          Key for the configuration value to retrieve
   * @param defaultValue
   *          Default Value if the configuration is not set
   * 
   * @return int configuration value
   * 
   */
  @SuppressWarnings("unused")
  private static int getPresentationConfigIntegerValue(String key, int defaultValue)
  {
    Object value = getPresentationConfigValue(key);

    int numericValue = defaultValue; // Default size if the property is not set

    if (value != null)
    {
      try
      {
        if (value instanceof Long)
        {
          numericValue = ((Long) value).intValue();
        }
        else if (value instanceof String)
        {
          numericValue = Integer.parseInt((String) value);
        }
      }
      catch (Exception e)
      {
        String message = createMessage(LOG_NO_VALID_CONFIG_VALUE, LOG_NUMERIC, key);
        logMessage(Level.WARNING, message);
      }
    }

    return numericValue;
  }

  /**
   * Gets the specified configuration boolean value from the appropriate configuration.
   * <p>
   * 
   * @param key
   *          Key for the configuration value to retrieve
   * @param defaultValue
   *          Default Value if the configuration is not set
   * 
   * @return boolean configuration value
   * 
   */
  @SuppressWarnings("unused")
  private static boolean getPresentationConfigBooleanValue(String key, boolean defaultValue)
  {
    Object value = getPresentationConfigValue(key);

    boolean booleanValue = defaultValue; // Default size if the property is not set

    if (value != null)
    {
      try
      {
        if (value instanceof Boolean)
        {
          booleanValue = ((Boolean) value).booleanValue();
        }
        else if (value instanceof String)
        {
          booleanValue = Boolean.parseBoolean((String) value);
        }
      }
      catch (Exception e)
      {
        String message = createMessage(LOG_NO_VALID_CONFIG_VALUE, LOG_BOOLEAN, key);
        logMessage(Level.WARNING, message);
      }
    }

    return booleanValue;
  }

  /**
   * Creates a formatted message
   * <p>
   * 
   * @param pattern
   *          Translatable message pattern
   * @param replacements
   *          Replacement text
   * @return String Formatted message
   * 
   */
  protected static final String createMessage(String pattern, Object[] replacements)
  {
    return MessageFormat.format(pattern, replacements);
  }

  /**
   * Creates a formatted message
   * <p>
   * 
   * @param pattern
   *          Translatable message pattern
   * @param replacement1
   *          Replacement text
   * @return String Formatted message
   * 
   */
  protected static final String createMessage(String pattern, Object replacement1)
  {
    return MessageFormat.format(pattern, new Object[] { replacement1 });
  }

  /**
   * Creates a formatted message
   * <p>
   * 
   * @param pattern
   *          Translatable message pattern
   * @param replacement1
   *          First Replacement text
   * @param replacement2
   *          Second Replacement text
   * @return String Formatted message
   * 
   */
  protected static final String createMessage(String pattern, Object replacement1, Object replacement2)
  {
    return MessageFormat.format(pattern, new Object[] { replacement1, replacement2 });
  }

  /**
   * Log message at INFO level
   * <p>
   * 
   * @param message
   *          Message text to log
   * @return void
   * 
   */
  protected static final void logMessage(String message)
  {
    logMessage(Level.INFO, "", message);
  }

  /**
   * Log message
   * <p>
   * 
   * @param logLevel
   *          Logging level
   * @param message
   *          Message text to log
   * @return void
   * 
   */
  protected static final void logMessage(Level logLevel, String message)
  {
    logMessage(logLevel, "", message);
  }

  /**
   * Log message
   * <p>
   * 
   * @param loggingClass
   *          Class logging the message
   * @param message
   *          Message text to log
   * @return void
   * 
   */
  protected static final void logMessage(String loggingClass, String message)
  {
    logMessage(Level.INFO, loggingClass, message);
  }

  /**
   * Log exception as a warning and vital context data (if the context is provided)
   * <p>
   * 
   * @param logLevel
   *          Logging level
   * @param loggingClass
   *          Class logging the message
   * @param message
   *          Message text to log
   * @return void
   * 
   */
  private static final void logMessage(Level logLevel, String loggingClass, String message)
  {
    LOG.logp(logLevel, loggingClass, "", message);
  }
}