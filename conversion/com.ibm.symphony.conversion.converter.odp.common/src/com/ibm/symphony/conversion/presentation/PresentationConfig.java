/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.presentation.exceptions.LimitExceededException;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.impl.ConversionService;

//================================================================================
// Presentation Configuration Properties
//================================================================================
//
// Example conversion-config.json:
//  "presentation":{
//     "max-pages": 100,
//     "max-graphics": 5000,
//     "performance-stats": true,
//     "debug-graphics": true,
//     "encode-graphics": true,
//     "encode-threshold-graphics": 2048,
//     "async-graphics": true,
//     "shape-format": "svg",
//     "max-threads": 0,
//     "evaluate-new-feature": ""
//  },
//
//--------------------------------------------------------------------------------
// Definition of configuration properties
//--------------------------------------------------------------------------------
// max-pages                : Maximum number of pages allowed for import (LONG)
// max-graphics             : Maximum number of graphics allowed for import (LONG)
// performance-stats        : Enable performance statistics gathering (BOOLEAN)
// debug-graphics           : Enable debug shape to image conversion (BOOLEAN)
// encode-graphics          : Enable Base64 encoding of small images (BOOLEAN) 
// encode-threshold-graphics: Threshold for when to Base64 encode images (LONG)
// async-graphics           : Enable asynchronous graphic conversion (BOOLEAN)
// shape-format             : Render format for Shapes (STRING)
// max-threads              : Maximum threads allowed in the thread pool used for 
//                          : an individual conversion.  0 (the default) means 
//                          : unlimited.  If you want to cap threads that each 
//                          : conversion will use at any one time, you can specify 
//                          : a number of threads from 1 - NN (INT)
// enable-new-feature       : Enable new features features for evaluation (STRING)
//================================================================================
public class PresentationConfig
{
  private static final String CLASS = PresentationConfig.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  private static final String PRESENTATION = "presentation";

  private static final String PAGE = "Page";

  private static final String GRAPHIC = "Graphic";

  // ==============================================================================
  // Valid String Configuration Values
  // ==============================================================================
  private static final String SVG = "svg";

  private static final String IMAGE = "image";

  public static final String FEATURE_CONVERSION_LIBRARY = "ConversionLibrary";

  public static final String FEATURE_CHARTS = "Charts";

  // ==============================================================================
  // Configuration Tokens
  // ==============================================================================
  private static final String MAX_PAGES = "max-pages";

//  private static final String MAX_GRAPHICS = "max-graphics";

  private static final String COLLECT_PERF_STATS = "performance-stats";

  private static final String DEBUG_GRAPHICS = "debug-graphics";

  private static final String ENCODE_GRAPHICS = "encode-graphics";

  private static final String ENCODE_THRESHOLD_GRAPHICS = "encode-threshold-graphics";

  private static final String ASYNC_GRAPHICS = "async-graphics";

  private static final String SHAPE_FORMAT = "shape-format";

  private static final String MAX_THREADS = "max-threads";

  private static final String ENABLE_NEW_FEATURE = "enable-new-feature";

  // ==============================================================================
  // Default Configuration Values
  // ==============================================================================
  private static final long DEFAULT_MAX_PAGES = Long.MAX_VALUE;

//  private static final long DEFAULT_MAX_GRAPHICS = Long.MAX_VALUE;

  private static final boolean DEFAULT_COLLECT_PERF_STATS = false;

  private static final boolean DEFAULT_DEBUG_GRAPHICS = false;

  private static final boolean DEFAULT_ENCODE_GRAPHICS = true;

  private static final long DEFAULT_ENCODE_THRESHOLD_GRAPHICS = 2 * 1024;

  private static final boolean DEFAULT_ASYNC_GRAPHICS = true;

  private static final String DEFAULT_SHAPE_FORMAT = IMAGE;

  private static final int DEFAULT_MAX_THREADS = 0; // unlimited

  private static final String DEFAULT_ENABLE_NEW_FEATURE = "";

  // ==============================================================================
  // Cached Configuration Values
  // ==============================================================================
  private static long cvMaxPages = -1;

  private static long cvMaxGraphics = -1;

  private static boolean cvCollectPerfStats = false;

  private static boolean cvDebugGraphics = false;

  private static boolean cvEncodeGraphics = false;

  private static long cvGraphicsEncodingThreshold = -1;

  private static boolean cvAsyncGraphics = false;

  private static String cvShapeFormat = null;

  private static int cvMaxThreads = -1;

  private static String cvEnableNewFeature = null;

  // ==============================================================================
  // Indicators whether the Configuration Values have been set
  // ==============================================================================
  private static boolean cvDebugGraphicsSet = false;

  private static boolean cvEncodeGraphicsSet = false;

  private static boolean cvCollectPerfStatsSet = false;

  private static boolean cvAsyncGraphicsSet = false;

  /**
   * Retrieves the current page number
   * <p>
   * 
   * @param context
   *          Conversion context
   * @return Integer - Current page number
   * 
   */
  public static final Integer getCurrentPageNumber(ConversionContext context)
  {
    return (Integer) context.get(ODPConvertConstants.CONTEXT_PAGE_COUNT);
  }

  /**
   * Checks the count of pages (as provided) and determines whether the configured maximum page limit has been exceeded. If the limit has
   * been exceeded, appropriate error information is added to the conversion result and a LimitExceededException is thrown.
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param numberOfPages
   *          Number of Pages
   * @return void
   * @throws LimitExceededException
   * 
   */
  public static void checkPageLimit(ConversionContext context, int numberOfPages)
  {
    if (exceedPageLimits(numberOfPages))
    {
      throw failConversionDueToLimit(context, PAGE, getPageLimit());
    }
  }

  /**
   * Increments the count of pages (stored in the Conversion Context).
   * <p>
   * 
   * @param context
   *          Conversion context
   * @return void
   * 
   */
  public static void incrementPageCount(ConversionContext context)
  {
    int currentPageCount = 0;
    Integer numOfPages = getCurrentPageNumber(context);
    if (numOfPages != null)
    {
      currentPageCount = numOfPages + 1;
    }
    else
    {
      currentPageCount++;
    }

    if (isDebugGraphics())
    {
      log.info("---> Page #" + currentPageCount);
    }

    context.put(ODPConvertConstants.CONTEXT_PAGE_COUNT, new Integer(currentPageCount));
  }

  /**
   * Retrieves the current graphic number
   * <p>
   * 
   * @param context
   *          Conversion context
   * @return Integer - Current graphic number
   * 
   */
  public static final Integer getCurrentGraphicNumber(ConversionContext context)
  {
    return (Integer) context.get(ODPConvertConstants.CONTEXT_GRAPHIC_COUNT);
  }

  /**
   * Increments the count of graphics (stored in the Conversion Context) and determines whether the configured maximum graphic limit has
   * been exceeded. If the limit has been exceeded, appropriate error information is added to the conversion result and a
   * LimitExceededException is thrown.
   * <p>
   * 
   * @param context
   *          Conversion context
   * @return void
   * @throws LimitExceededException
   * 
   */
  public static void incrementGraphicCount(ConversionContext context)
  {
    incrementGraphicCount(context, 1);
  }

  /**
   * Increments the count of graphics (stored in the Conversion Context) and determines whether the configured maximum graphic limit has
   * been exceeded. If the limit has been exceeded, appropriate error information is added to the conversion result and a
   * LimitExceededException is thrown.
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param incrementAmount
   *          Amount to increment the count by
   * @return void
   * @throws LimitExceededException
   * 
   */
  public static void incrementGraphicCount(ConversionContext context, int incrementAmount)
  {
    int currentGraphicCount = 0;
    Integer numOfGraphics = getCurrentGraphicNumber(context);
    if (numOfGraphics != null)
    {
      currentGraphicCount = numOfGraphics + incrementAmount;
    }
    else
    {
      currentGraphicCount += incrementAmount;
    }

//    if (exceedGraphicLimits(currentGraphicCount))
//    {
//      throw failConversionDueToLimit(context, GRAPHIC, getGraphicLimit());
//    }

    context.put(ODPConvertConstants.CONTEXT_GRAPHIC_COUNT, new Integer(currentGraphicCount));
  }

  /**
   * Gets the Page Limit from the appropriate configuration. If none is found, the default page limit is Long.MAX_VALUE.
   * <p>
   * 
   * @return long Page Limit configuration value
   * 
   */
  public static long getPageLimit()
  {
    long maxSize = cvMaxPages;
    if (maxSize < 0) // Check if the value has been cached
    {
      maxSize = getPresentationConfigNumericValue(MAX_PAGES, DEFAULT_MAX_PAGES);

      if (maxSize >= 0) // Cache the property
      {
        cvMaxPages = maxSize;
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
  protected static boolean exceedPageLimits(long count)
  {
    return count > getPageLimit();
  }

  /**
   * Gets the Graphic Limit from the appropriate configuration. If none is found, the default graphic limit is Long.MAX_VALUE.
   * <p>
   * 
   * @return long Graphic Limit configuration value
   * 
   */
//  public static long getGraphicLimit()
//  {
//    long maxSize = cvMaxGraphics;
//    if (maxSize < 0) // Check if the value has been cached
//    {
//      maxSize = getPresentationConfigNumericValue(MAX_GRAPHICS, DEFAULT_MAX_GRAPHICS);
//
//      if (maxSize >= 0) // Cache the property
//      {
//        cvMaxGraphics = maxSize;
//      }
//    }
//    return maxSize;
//  }

  /**
   * Gets the Thread Limit from the appropriate configuration. If none is found, the default graphic limit is the number of CPUs on the
   * server.
   * <p>
   * 
   * @return int Thread Limit configuration value
   * 
   */
  public static int getThreadLimit()
  {
    int maxThreads = cvMaxThreads;
    if (maxThreads < 0) // Check if the value has been cached
    {
      maxThreads = getPresentationConfigIntegerValue(MAX_THREADS, DEFAULT_MAX_THREADS);

      // Cache the property
      if (maxThreads == 0)
      {
        int numCPUs = Runtime.getRuntime().availableProcessors();
        cvMaxThreads = numCPUs;
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_CONFIGURATION_VALUE, "Number of CPUs", numCPUs);
        ODPCommonUtil.logMessage(message);
      }
      else if (maxThreads > 0)
      {
        cvMaxThreads = maxThreads;
      }
    }
    return cvMaxThreads;
  }

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
//  protected static boolean exceedGraphicLimits(long count)
//  {
//    return count > getGraphicLimit();
//  }

  /**
   * Gets the Debug Graphics flag from the appropriate configuration. If none is found, the default is false.
   * <p>
   * 
   * @return boolean Debug Graphics configuration value
   * 
   */
  public static boolean isDebugGraphics()
  {
    if (!cvDebugGraphicsSet) // Check if the value has been cached
    {
      cvDebugGraphics = getPresentationConfigBooleanValue(DEBUG_GRAPHICS, DEFAULT_DEBUG_GRAPHICS);

      cvDebugGraphicsSet = true; // Cache the property
    }
    return cvDebugGraphics;
  }

  /**
   * Gets the Async Graphics flag from the appropriate configuration. If none is found, the default is true.
   * <p>
   * 
   * @return boolean Async Graphics configuration value
   * 
   */
  public static boolean isAsyncGraphics()
  {
    if (!cvAsyncGraphicsSet) // Check if the value has been cached
    {
      cvAsyncGraphics = getPresentationConfigBooleanValue(ASYNC_GRAPHICS, DEFAULT_ASYNC_GRAPHICS);

      cvAsyncGraphicsSet = true; // Cache the property
    }
    return cvAsyncGraphics;
  }

  /**
   * Gets the Encode Graphics flag from the appropriate configuration. If none is found, the default is true.
   * <p>
   * 
   * @return boolean Encode Graphics configuration value
   * 
   */
  public static boolean isEncodeGraphics()
  {
    if (!cvEncodeGraphicsSet) // Check if the value has been cached
    {
      cvEncodeGraphics = getPresentationConfigBooleanValue(ENCODE_GRAPHICS, DEFAULT_ENCODE_GRAPHICS);

      cvEncodeGraphicsSet = true; // Cache the property
    }
    return cvEncodeGraphics;
  }

  /**
   * Gets the Graphic Encoding Threshold from the appropriate configuration. If none is found, the default page limit is 1KB.
   * <p>
   * 
   * @return long Page Limit configuration value
   * 
   */
  public static long getGraphicEncodeThreshold()
  {
    long threshold = cvGraphicsEncodingThreshold;
    if (threshold < 0) // Check if the value has been cached
    {
      threshold = getPresentationConfigNumericValue(ENCODE_THRESHOLD_GRAPHICS, DEFAULT_ENCODE_THRESHOLD_GRAPHICS);

      if (threshold >= 0) // Cache the property
      {
        cvGraphicsEncodingThreshold = threshold;
      }
    }
    return threshold;
  }

  /**
   * Gets the Shape Format flag from the appropriate configuration. If the value is "svg", true is returned. If no value is found, the
   * default is false.
   * <p>
   * 
   * @return boolean true = Shape Format configuration value is set to "svg"
   * 
   */
  public static boolean isSvgShapeFormat()
  {
    if (cvShapeFormat == null) // Check if the value has been cached
    {
      cvShapeFormat = getPresentationConfigStringValue(SHAPE_FORMAT, DEFAULT_SHAPE_FORMAT).toLowerCase();
    }

    if ((cvShapeFormat.equals(SVG)))
    {
      return true;
    }
    return false;
  }

  /**
   * Gets the Shape Format flag from the appropriate configuration. If the value is "image", true is returned. If no value is found, the
   * default is true.
   * <p>
   * 
   * @return boolean true = Shape Format configuration value is set to "image"
   * 
   */
  public static boolean isImageShapeFormat()
  {
    if (cvShapeFormat == null) // Check if the value has been cached
    {
      cvShapeFormat = getPresentationConfigStringValue(SHAPE_FORMAT, DEFAULT_SHAPE_FORMAT).toLowerCase();
    }

    if ((cvShapeFormat.equals(IMAGE)))
    {
      return true;
    }
    return false;
  }

  /**
   * Gets the Collect Performance Statistics flag from the appropriate configuration. If none is found, the default is false.
   * <p>
   * 
   * @return boolean Collect Performance Statistics configuration value
   * 
   */
  public static boolean isCollectPerfStats()
  {
    if (!cvCollectPerfStatsSet) // Check if the value has been cached
    {
      cvCollectPerfStats = getPresentationConfigBooleanValue(COLLECT_PERF_STATS, DEFAULT_COLLECT_PERF_STATS);

      cvCollectPerfStatsSet = true; // Cache the property
    }
    return cvCollectPerfStats;
  }

  /**
   * Gets the Evaluate New Feature flag from the appropriate configuration. If none is found, the default is false.
   * <p>
   * 
   * @return boolean Evaluate New Feature configuration value
   * 
   */
  public static boolean isNewFeatureEnabled(String feature)
  {
    if (cvEnableNewFeature == null) // Check if the value has been cached
    {
      cvEnableNewFeature = getPresentationConfigStringValue(ENABLE_NEW_FEATURE, DEFAULT_ENABLE_NEW_FEATURE);
    }
    return cvEnableNewFeature.contains(feature);
  }

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
    JSONObject config = (JSONObject) ConversionService.getInstance().getConfig(PRESENTATION);

    Object value = null;
    if (config != null)
    {
      value = config.get(key);
    }

    if (value != null)
    {
      ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_CONFIGURATION_VALUE, key, value.toString()));
    }
    else
    {
      ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_CONFIGURATION_VALUE, key, ODPCommonUtil.LOG_NOT_SET));
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
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_NO_VALID_CONFIG_VALUE, ODPCommonUtil.LOG_NUMERIC, key);
        ODPCommonUtil.logMessage(Level.WARNING, message);
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
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_NO_VALID_CONFIG_VALUE, ODPCommonUtil.LOG_NUMERIC, key);
        ODPCommonUtil.logMessage(Level.WARNING, message);
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
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_NO_VALID_CONFIG_VALUE, ODPCommonUtil.LOG_BOOLEAN, key);
        ODPCommonUtil.logMessage(Level.WARNING, message);
      }
    }

    return booleanValue;
  }

  /**
   * Gets the specified configuration string value from the appropriate configuration.
   * <p>
   * 
   * @param key
   *          Key for the configuration value to retrieve
   * @param defaultValue
   *          Default Value if the configuration is not set
   * 
   * @return String configuration value
   * 
   */
  private static String getPresentationConfigStringValue(String key, String defaultValue)
  {
    Object value = getPresentationConfigValue(key);

    String stringValue = defaultValue; // Default size if the property is not set

    if (value != null)
    {
      try
      {
        if (value instanceof String)
        {
          stringValue = (String) value;
        }
      }
      catch (Exception e)
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_NO_VALID_CONFIG_VALUE, ODPCommonUtil.LOG_STRING, key);
        ODPCommonUtil.logMessage(Level.WARNING, message);
      }
    }

    return stringValue;
  }

  /**
   * Handles logging and reporting the Limit Exceeded condition, returning the Exception that can be used for reporting the error.
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param limit
   *          Type of limit exceeded
   * @param count
   *          Specific limit value exceeded
   * 
   * @return LimitExceededException
   * 
   */
  private static LimitExceededException failConversionDueToLimit(ConversionContext context, String limit, long count)
  {
    String subCode = "";
    String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_LIMIT_EXCEEDED, limit, count);
    if(limit.equalsIgnoreCase(PAGE))
    	subCode = ConversionConstants.ERROR_PRESENTATION_SLIDE_NUMBER;
    else if(limit.equalsIgnoreCase(GRAPHIC))
    	subCode = ConversionConstants.ERROR_PRESENTATION_OBJECT_NUMBER;
    return new LimitExceededException(context,subCode, message);
  }
}
