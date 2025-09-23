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

import java.io.BufferedReader;
import java.io.File;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class UnsupportedFeatures
{

  private static final String CLASS = UnsupportedFeatures.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  // Error Codes for Common Unsupported Features
  public static final String UNSUPPORT_FEATURE_OLD_ODF_VERSION = ConversionConstants.WARNING_OLD_ODF_VERSION; // preserved

  public static final String UNSUPPORT_FEATURE_XML_MACRO = "701"; // not preserved

  public static final String UNSUPPORT_FEATURE_OBJECT_GROUPING = "801"; // preserved

  public static final String UNSUPPORT_FEATURE_CUSTOM_SHAPE = "802"; // preserved

  public static final String UNSUPPORT_FEATURE_OLE_OBJECT = "803"; // preserved and not preserved

  public static final String UNSUPPORT_FEATURE_VIDEO_SOUND = "804"; // preserved

  // public static final String UNSUPPORT_FEATURE_SPEAKER_NOTES = "805"; // preserved

  public static final String UNSUPPORT_FEATURE_ANIMATION = "806"; // preserved

  public static final String UNSUPPORT_FEATURE_CAPTION = "807"; // preserved

  public static final String UNSUPPORT_FEATURE_HEADER = "808"; // preserved

  public static final String UNSUPPORT_FEATURE_ACTIVEX_CONTROL = "809"; // preserved

  public static final String UNSUPPORT_FEATURE_CHART = "810"; // preserved

  public static final String UNSUPPORT_FEATURE_XML_WORDART = "811"; // not preserved

  public static final String UNSUPPORT_FEATURE_XML_SMARTART = "812"; // not preserved

  public static final String UNSUPPORT_FEATURE_XML_THEME = "813"; // not preserved

  // Feature Text
  private static final String FEATURE_OLD_ODF_VERSION = "Old ODF Version: ";

  private static final String FEATURE_MACRO = "Macro";

  private static final String FEATURE_OBJECT_GROUPING = "Object Grouping";

  private static final String FEATURE_CUSTOM_SHAPE = "Custom Shape";

  private static final String FEATURE_OLE_OBJECT = "OLE Object";

  private static final String FEATURE_CHART = "Chart";

  private static final String FEATURE_VIDEO_SOUND = "Video or Sound";

  private static final String FEATURE_ANIMATION = "Animation";

  private static final String FEATURE_CAPTION = "Caption";

  private static final String FEATURE_HEADER = "Header";

  private static final String FEATURE_ACTIVEX = "ActiveX Control";

  private static final String FEATURE_WORDART = "WordArt";

  private static final String FEATURE_SMARTART = "SmartArt";

  private static final String FEATURE_THEME = "Theme";

  // Tokens for Unsupported XML Features detected by Symphony
  private static final String SYM_TOKEN_WORDART = "sp";

  private static final String SYM_TOKEN_SMARTART = "dataModel";

  private static final String SYM_TOKEN_CHART = "chart";

  private static final String SYM_TOKEN_OLE_OBJECT = "oleObj";

  private static final String SYM_TOKEN_THEME = "themeElements";

  private static final String SYM_TOKEN_ACTIVEX = "control";

  private static final String SYM_TOKEN_MACRO = "vbaProject";

  // Miscellaneous Constants
  private static final String MSG = "Conversion warning for unsupported feature";

  private static final String TEXT_SUFFIX = ".txt";

  private static final String SYMPHONY_UNSUPPORTED_LOG = "SymphonyUnsupportedLog";

  private static final boolean PRESERVED = true;

  private static final boolean NOT_PRESERVED = false;

  // Unsupported Feature Information
  private static final UnsupportedFeatures UF = new UnsupportedFeatures();

  private class FeatureInfo
  {

    public String errorCode = "";

    public String featureText = "";

    public boolean preserved = false;

    protected FeatureInfo(String errorCode, String featureText, boolean preserved)
    {
      this.errorCode = errorCode;
      this.featureText = featureText;
      this.preserved = preserved;
    }
  }

  // Default Initial Capacity for the cvXmlToFeatureInfoMap HashMap
  private static final int XML_TO_FEATUREINFO_MAP_CAPACITY = (int) (7 * 1.33) + 1;

  // Mapping of Symphony XML Tokens to Error Codes and Features
  private static final HashMap<String, FeatureInfo> cvXmlToFeatureInfoMap = new HashMap<String, FeatureInfo>(
      XML_TO_FEATUREINFO_MAP_CAPACITY);
  static
  {
    cvXmlToFeatureInfoMap.put(SYM_TOKEN_WORDART, UF.new FeatureInfo(UNSUPPORT_FEATURE_XML_WORDART, FEATURE_WORDART, NOT_PRESERVED));
    cvXmlToFeatureInfoMap.put(SYM_TOKEN_SMARTART, UF.new FeatureInfo(UNSUPPORT_FEATURE_XML_SMARTART, FEATURE_SMARTART, NOT_PRESERVED));
    cvXmlToFeatureInfoMap.put(SYM_TOKEN_CHART, UF.new FeatureInfo(UNSUPPORT_FEATURE_CHART, FEATURE_CHART, NOT_PRESERVED));
    cvXmlToFeatureInfoMap.put(SYM_TOKEN_OLE_OBJECT, UF.new FeatureInfo(UNSUPPORT_FEATURE_OLE_OBJECT, FEATURE_OLE_OBJECT, NOT_PRESERVED));
    cvXmlToFeatureInfoMap.put(SYM_TOKEN_THEME, UF.new FeatureInfo(UNSUPPORT_FEATURE_XML_THEME, FEATURE_THEME, NOT_PRESERVED));
    cvXmlToFeatureInfoMap.put(SYM_TOKEN_ACTIVEX, UF.new FeatureInfo(UNSUPPORT_FEATURE_ACTIVEX_CONTROL, FEATURE_ACTIVEX, NOT_PRESERVED));
    cvXmlToFeatureInfoMap.put(SYM_TOKEN_MACRO, UF.new FeatureInfo(UNSUPPORT_FEATURE_XML_MACRO, FEATURE_MACRO, NOT_PRESERVED));
  }

  // Default Initial Capacity for the cvXmlToFeatureInfoMap HashMap
  private static final int ERRORCODE_TO_FEATUREINFO_MAP_CAPACITY = (int) (10 * 1.33) + 1;

  // Mapping of Symphony XML Tokens to Error Codes and Features
  private static final HashMap<String, FeatureInfo> cvErrorCodeToFeatureInfoMap = new HashMap<String, FeatureInfo>(
      ERRORCODE_TO_FEATUREINFO_MAP_CAPACITY);
  static
  {
    cvErrorCodeToFeatureInfoMap.put(UNSUPPORT_FEATURE_OBJECT_GROUPING, UF.new FeatureInfo(UNSUPPORT_FEATURE_OBJECT_GROUPING,
        FEATURE_OBJECT_GROUPING, PRESERVED));
    cvErrorCodeToFeatureInfoMap.put(UNSUPPORT_FEATURE_CUSTOM_SHAPE, UF.new FeatureInfo(UNSUPPORT_FEATURE_CUSTOM_SHAPE,
        FEATURE_CUSTOM_SHAPE, PRESERVED));
    cvErrorCodeToFeatureInfoMap.put(UNSUPPORT_FEATURE_VIDEO_SOUND, UF.new FeatureInfo(UNSUPPORT_FEATURE_VIDEO_SOUND, FEATURE_VIDEO_SOUND,
        PRESERVED));
    cvErrorCodeToFeatureInfoMap.put(UNSUPPORT_FEATURE_HEADER, UF.new FeatureInfo(UNSUPPORT_FEATURE_HEADER, FEATURE_HEADER, PRESERVED));
    cvErrorCodeToFeatureInfoMap.put(UNSUPPORT_FEATURE_OLE_OBJECT, UF.new FeatureInfo(UNSUPPORT_FEATURE_OLE_OBJECT, FEATURE_OLE_OBJECT,
        PRESERVED));
    cvErrorCodeToFeatureInfoMap.put(UNSUPPORT_FEATURE_CHART, UF.new FeatureInfo(UNSUPPORT_FEATURE_OLE_OBJECT, FEATURE_CHART, PRESERVED));
    cvErrorCodeToFeatureInfoMap.put(UNSUPPORT_FEATURE_ANIMATION, UF.new FeatureInfo(UNSUPPORT_FEATURE_ANIMATION, FEATURE_ANIMATION,
        PRESERVED));
    cvErrorCodeToFeatureInfoMap.put(UNSUPPORT_FEATURE_CAPTION, UF.new FeatureInfo(UNSUPPORT_FEATURE_CAPTION, FEATURE_CAPTION, PRESERVED));
    cvErrorCodeToFeatureInfoMap.put(UNSUPPORT_FEATURE_ACTIVEX_CONTROL, UF.new FeatureInfo(UNSUPPORT_FEATURE_ACTIVEX_CONTROL,
        FEATURE_ACTIVEX, PRESERVED));
    cvErrorCodeToFeatureInfoMap.put(UNSUPPORT_FEATURE_OLD_ODF_VERSION, UF.new FeatureInfo(UNSUPPORT_FEATURE_OLD_ODF_VERSION,
        FEATURE_OLD_ODF_VERSION, PRESERVED));
  }

  /**
   * Adds a Conversion Warning to the Conversion Context (unless that type of warning already exists)
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param errorCode
   *          Error code of the Warning
   * @return void
   * 
   */
  public static void addUnsupportedWarning(ConversionContext context, String errorCode)
  {
    FeatureInfo featureInfo = cvErrorCodeToFeatureInfoMap.get(errorCode);
    addUnsupportedWarning(context, featureInfo);
  }

  /**
   * Adds a Conversion Warning to the Conversion Context (unless that type of warning already exists)
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param errorCode
   *          Error code of the Warning
   * @param extraText
   *          Extra text for Feature Text
   * @return void
   * 
   */
  public static void addUnsupportedWarning(ConversionContext context, String errorCode, String extraText)
  {
    FeatureInfo featureInfo = cvErrorCodeToFeatureInfoMap.get(errorCode);
    addUnsupportedWarning(context, featureInfo, extraText);
  }

  /**
   * Parse the Symphony log file (found in the source path) to determine if there are Unsupported Feature Warnings to be added to the
   * ConversionResult
   * 
   * @param context
   *          Conversion context
   */
  public static void parseSymphonyLogForWarnings(ConversionContext context)
  {
    String sourceFile = (String) context.get(ODPConvertConstants.CONTEXT_SOURCE_PATH);
    int index = sourceFile.lastIndexOf(File.separator);
    if (index >= 0)
    {
      String symphonyLogFilename = sourceFile.substring(0, index + 1) + SYMPHONY_UNSUPPORTED_LOG;
      parseSymphonyLogForWarnings(context, symphonyLogFilename);
    }
  }

  /**
   * Parse the Symphony log file to determine if there are Unsupported Feature Warnings to be added to the ConversionResult
   * 
   * @param context
   *          Conversion context
   * @param filename
   *          Filename of the Source presentation
   */
  protected static void parseSymphonyLogForWarnings(ConversionContext context, String filename)
  {
    File logfile = new File(filename + TEXT_SUFFIX);

    if (logfile.exists())
    {
      LOG.fine("Parsing Symphony logfile for warnings");

      BufferedReader reader = null;
      try
      {
        reader = ODPCommonUtil.openFileForRead(filename + TEXT_SUFFIX);
        String token = reader.readLine();
        while (token != null)
        {
          FeatureInfo featureInfo = cvXmlToFeatureInfoMap.get(token);
          if (featureInfo != null)
          {
            addUnsupportedWarning(context, featureInfo);
          }
          else
          {
            String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_TOKEN, token);
            ODPCommonUtil.logMessage(Level.WARNING, message);
          }
          token = reader.readLine();
        }
      }
      catch (Throwable t)
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".parseSymphonyLogForWarnings");
        ODPCommonUtil.logException(context, Level.WARNING, message, t);
      }
      finally
      {
        ODPMetaFile.closeResource(reader);
      }
    }
  }

  /**
   * Copies the Symphony log file to the target directory
   * 
   * @param context
   *          Conversion context
   * @param filename
   *          Filename of the Source presentation
   */
  public static void copySymphonyLog(ConversionContext context, String filename, String target)
  {
    filename += TEXT_SUFFIX;
    File logfile = new File(filename);

    if (logfile.exists())
    {
      ODPMetaFile.copyFile(filename, new File(target), SYMPHONY_UNSUPPORTED_LOG + TEXT_SUFFIX);
    }
  }

  /**
   * Adds a Conversion Warning to the Conversion Context (unless that type of warning already exists)
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param featureInfo
   *          Unsupported feature information
   * @return void
   * 
   */
  private static void addUnsupportedWarning(ConversionContext context, FeatureInfo featureInfo)
  {
    ODPCommonUtil.addMessage(context, featureInfo.errorCode, featureInfo.preserved, featureInfo.featureText, MSG, false);
  }

  /**
   * Adds a Conversion Warning to the Conversion Context (unless that type of warning already exists)
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param featureInfo
   *          Unsupported feature information
   * @param extraText
   *          Extra text for Feature Text
   * @return void
   * 
   */
  private static void addUnsupportedWarning(ConversionContext context, FeatureInfo featureInfo, String extraText)
  {
    ODPCommonUtil.addMessage(context, featureInfo.errorCode, featureInfo.preserved, featureInfo.featureText + extraText, MSG, false);
  }
}
