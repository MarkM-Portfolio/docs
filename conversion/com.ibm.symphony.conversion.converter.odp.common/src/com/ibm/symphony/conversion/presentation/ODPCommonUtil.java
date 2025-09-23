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
import java.io.FileReader;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.w3c.dom.Attr;
import org.w3c.dom.Element;

import com.ibm.icu.text.MessageFormat;
import com.ibm.symphony.conversion.presentation.exceptions.PresentationConversionException;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class ODPCommonUtil
{
  private static final String CLASS = ODPCommonUtil.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  private static final int DEFAULT_GROWABLE_SIZE = 16;

  private static final int DEFAULT_ARRAY_SIZE = 1;

  // ==============================================================================
  // Strings for logging (potentially translatable in the future)
  // ==============================================================================

  public static final String LOG_LIMIT_EXCEEDED = "{0} limit of {1} exceeded.";

  public static final String LOG_SUBTASK_EXCEPTION = "{0} occurred while waiting for a subtask to complete.";

  public static final String LOG_UNEXPECTED_EXCEPTION = "Unexpected exception";

  public static final String LOG_UNEXPECTED_EXCEPTION_IN = "Unexpected exception in {0}";

  public static final String LOG_CONVERSION_ERROR = "Conversion error detected";

  public static final String LOG_ERROR_OPENING_FILE = "Unexpected exception while opening {0}";

  public static final String LOG_ERROR_OPENING_FILE_ODF = "Unable to open file {0}.  This could be caused by a zero length file or by a Symphony conversion issue.";

  public static final String LOG_NO_READER = "No reader found for given format: {0}";

  public static final String LOG_JPG_DPI = "JPG Image DPI is undefined for {0}";

  public static final String LOG_UNEXPECTED_TOKEN = "Unexpected token ({0}) found while parsing Symphony log file";

  public static final String LOG_ERROR_PARSING_CONFIG_FILE = "Error parsing configuration file for {0}";

  public static final String LOG_ERROR_BULLET_IMAGE = "Error creating bullet image for IE8.";
  
  public static final String LOG_ERROR_CONVERT_TABLE = "Error converting table, table structure maybe not correctly";
  
  public static final String LOG_ERROR_CONVERT_PAGE = "Error converting slide, slide structure maybe not correctly";
  
  public static final String LOG_ERROR_CONVERT_DRAWFRAME = "Error converting drawframe, the structure maybe not correctly";
  
  public static final String LOG_ERROR_CONVERT_IMGDRAWFRAME = "Error converting image drawframe, the structure maybe not correctly";
  
  public static final String LOG_ERROR_CONVERT_TEXTBOX = "Error converting textbox, the structure maybe not correctly";

  public static final String LOG_NO_DEFAULT_TABLE_CELL_STYLE = "No default Table Cell style exists.  This is likely due to a Symphony conversion issue or a ODF file in an old format.";

  public static final String LOG_OLD_ODP_VERSION = "ODP documents in version {0} are supported, but full fidelity is not guaranteed.";

  public static final String LOG_UNKNOWN_IMAGE_FORMAT = "Image in an unsupported format detected: {0}";

  public static final String LOG_UNKNOWN_LIST_FORMAT = "List in an unsupported format detected: {0}";

  public static final String LOG_NON_DISPLAYABLE_IMAGE = "Convertable image is too small to convert: {0}.  Image conversion will be performed at a slightly larger size that is convertible.";

  public static final String LOG_CROP_FAILURE = "Crop error exception occurred.";

  public static final String LOG_SYNC_IMAGE_ERROR = "Synchronous presentation image conversion was not successful on page {0}";

  public static final String LOG_ASYNC_IMAGE_ERROR = "Asynchronous presentation image conversion was not successful on page {0}";

  public static final String LOG_CONFIGURATION_VALUE = "Configuration value for {0} = {1}";

  public static final String LOG_OBJECT_REPLACEMENT_IMAGE_ERROR = "Presentation Object Replacement Image conversion was not successful.";

  public static final String LOG_UNKNOWN_PARENT_PRES_STYLE = "Parent's presentation style is unknown";

  public static final String LOG_FAILED_IMAGE_EXPORT = "Failure while preparing an image for export.";

  public static final String LOG_FAILED_ARIA_EXPORT = "Failure while exporting accessibility information.";

  public static final String LOG_IMAGE_FILE_NOT_EXIST = "File containing the image {0} does not exist.";
  
  public static final String LOG_LIST_STYLE_NOT_EXIST = "List Style {0} can't be found in CSS files.";

  public static final String LOG_URI_NOT_EXIST = "URI for the image {0} does not exist.";

  public static final String LOG_UNKNOWN_TRANSITION_STYLE = "Default style is not defined for transitions.";

  public static final String LOG_MALFORMED_STYLE = "Style appears to be malformed.  Style only contains drawing-page-properties and not the style:style element.";

  public static final String LOG_NO_MATCHING_ODF_NODE = "ODF node matching the HTML node was not located.";

  public static final String LOG_UNABLE_TO_PARSE_CELL = "Unable to parse cell fontsize to double.";

  public static final String LOG_INVALID_ALIGNMENT = "Alignment value is not left, right or center: {0}";

  public static final String LOG_INVALID_LINE_HEIGHT = "Unsupported line-height value: {0}";

  public static final String LOG_EXTRA_TEXT_NODE = "Ignoring extraneous text node.";

  public static final String LOG_NO_VALID_CONFIG_VALUE = "No valid {0} value was set for {1}, initializing to a default value";

  public static final String LOG_NUMERIC = "numeric";

  public static final String LOG_BOOLEAN = "boolean";

  public static final String LOG_STRING = "string";

  public static final String LOG_STARTS = "{0} starts";

  public static final String LOG_ENDS = "{0} ends in {1} ms";

  public static final String LOG_CONVERTOR = "Presentation {0} to {1} conversion";

  public static final String LOG_UNKNOWN = "unknown";

  public static final String LOG_NOT_SET = "not set";

  public static final String LOG_SOURCE_DOCUMENT = "Source document is {0}";

  public static final String LOG_TARGET_DOCUMENT = "Target document is {0}";

  public static final String LOG_CURRENTLY_PROCESSING = "Currently processing section {0} and page {1}";

  public static final String LOG_UPGRADE = "The presentation will be migrated from version {0} to {1}.";

  public static final String LOG_INSTALLED_FONT_LOOKUP_FAIL = "The lookup of installed system fonts failed.";

  public static final String LOG_COPY_PRESERVE_ATTR_IS_NULL = "Copy preserve attribute was null for new element.";

  public static final String LOG_SUSPICIOUS_CONTENT_REMOVED = "Suspicious content was removed from the document for {0}=\"{1}\"";

  public static final String LOG_SUSPICIOUS_ATTRIBUTE_REMOVED = "Suspicious content was removed from the document for {0}";

  public static final String LOG_LIST_FONT_STYLE = "Invalid list font size values found: \"{0}\" and \"{1}\".  This is likely due to a Symphony conversion issue or a ODF file in an old format.";

  public static final String LOG_NO_SHAPE_VALUE_FOUND = "No value was found for {0} in a shape.  This is likely due to a Symphony conversion issue or a ODF file in an old format.";

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
  public static final String createMessage(String pattern, Object[] replacements)
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
  public static final String createMessage(String pattern, Object replacement1)
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
  public static final String createMessage(String pattern, Object replacement1, Object replacement2)
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
  public static final void logMessage(String message)
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
  public static final void logMessage(Level logLevel, String message)
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
  public static final void logMessage(String loggingClass, String message)
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

  /**
   * Log vital context data
   * <p>
   * 
   * @param context
   *          Current conversion context
   * @return void
   * 
   */
  public static final void logContext(ConversionContext context)
  {
    if (context != null)
    {
      LOG.info(createMessage(LOG_SOURCE_DOCUMENT, context.get(ODPConvertConstants.CONTEXT_CONVERT_SOURCE)));
      LOG.info(createMessage(LOG_TARGET_DOCUMENT, context.get(ODPConvertConstants.CONTEXT_TARGET_BASE)));

      String currentDocSection = LOG_UNKNOWN;
      String currentPageNumber = LOG_UNKNOWN;

      ODPConvertConstants.DOCUMENT_TYPE currentDocSectionType = (ODPConvertConstants.DOCUMENT_TYPE) context
          .get(ODPConvertConstants.CONTEXT_DOCUMENT_TYPE);
      if (currentDocSectionType != null)
      {
        currentDocSection = currentDocSectionType.toString();
      }

      Integer currentPageNumberType = (Integer) context.get(ODPConvertConstants.CONTEXT_PAGE_COUNT);
      if (currentPageNumberType != null)
      {
        currentPageNumber = currentPageNumberType.toString();
      }

      LOG.info(createMessage(LOG_CURRENTLY_PROCESSING, currentDocSection, currentPageNumber));
    }
  }

  /**
   * Log exception
   * <p>
   * 
   * @param message
   *          Message text to log
   * @param e
   *          Detected exception
   * @return void
   * 
   */
  public static final void logException(String message, Throwable e)
  {
    logException(null, Level.SEVERE, message, e);
  }

  /**
   * Log exception and vital context data (if the context is provided)
   * <p>
   * 
   * @param context
   *          Current conversion context
   * @param message
   *          Message text to log
   * @param e
   *          Detected exception
   * @return void
   * 
   */
  public static final void logException(ConversionContext context, String message, Throwable e)
  {
    logException(context, Level.SEVERE, message, e);
  }

  /**
   * Log exception
   * <p>
   * 
   * @param logLevel
   *          Logging level
   * @param message
   *          Message text to log
   * @param e
   *          Detected exception
   * @return void
   * 
   */
  public static final void logException(Level logLevel, String message, Throwable e)
  {
    logException(null, logLevel, message, e);
  }

  /**
   * Log exception and vital context data (if the context is provided)
   * <p>
   * 
   * @param context
   *          Current conversion context
   * @param logLevel
   *          Logging level
   * @param message
   *          Message text to log
   * @param e
   *          Detected exception
   * @return void
   * 
   */
  public static final void logException(ConversionContext context, Level logLevel, String message, Throwable e)
  {
    logContext(context);

    if (message == null)
    {
      message = LOG_UNEXPECTED_EXCEPTION;
    }
    LOG.logp(logLevel, "", message, e.getLocalizedMessage(), e);
  }

  /**
   * Handle exceptions
   * <ul>
   * <li>PresentationConversionExceptions are thrown for detected scenarios (e.g. Limit exceeded conditions). Since these are detected
   * scenarios, the error has already been logged and recorded. No action is required.</li>
   * <li>Any other exception is unexpected, and therefore must be logged and the ConversionResult updated to indicate a failure.</li>
   * </ul>
   * <p>
   * 
   * @param e
   *          Detected exception
   * @param context
   *          Conversion context
   * @param convertor
   *          Name of the convertor
   * @return void
   * 
   */
  public static final void handleException(Throwable e, ConversionContext context, String convertor)
  {
    if (e instanceof PresentationConversionException)
    {
      // This is a detected error and has already set the appropriate status in the conversion result
    }
    else
    {
      ODPCommonUtil.addConversionError(context, ConversionConstants.ERROR_UNKNOWN, e.getLocalizedMessage());
      logException(context, createMessage(LOG_UNEXPECTED_EXCEPTION_IN, convertor), e);
    }
  }

  /**
   * Adds a Conversion Error/Warning message to the Conversion Context (unless that type of message already exists)
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param errorCode
   *          Error code of the Error/Warning
   * @param preserved
   *          Indicator as to whether or not the content is preserved
   * @param errorText
   *          Non-translated error text
   * @param logMessage
   *          Non-translated log entry
   * @param conversionFailed
   *          Flag indicating whether the conversion succeeded or failed
   * @return void
   * 
   */
  public static final void addMessage(ConversionContext context, String errorCode, boolean preserve, String errorText, String logMessage,
      boolean failed)
  {
    ConversionResult result = (ConversionResult) context.get(ODPConvertConstants.CONTEXT_CONVERT_RESULT);
    if (!result.hasWarning(errorCode))
    {
      ConversionWarning cw = new ConversionWarning(errorCode, preserve, "", errorText);
      result.addWarning(cw);
      LOG.warning(logMessage + ": " + errorText);
    }

    if (failed)
    {
      result.setSucceed(false);
    }
  }

  public static final void addMessage(ConversionContext context, String errorCode, String subCode, boolean preserve, String errorText, String logMessage,
	      boolean failed)
	  {
	    ConversionResult result = (ConversionResult) context.get(ODPConvertConstants.CONTEXT_CONVERT_RESULT);
	    if (!result.hasWarning(errorCode))
	    {
	      ConversionWarning cw = new ConversionWarning(errorCode, preserve, "", errorText);
	      Map<String, String> params = new HashMap<String, String>();
	      params.put("conv_err_code", subCode);
	      cw.setParameters(params);
	      result.addWarning(cw);
	      LOG.warning(logMessage + ": " + errorText);
	    }
	    if (failed)
	    {
	      result.setSucceed(false);
	    }
	  }
  /**
   * Adds a Conversion Error to the Conversion Context (unless that type of error already exists)
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param errorCode
   *          Error code of the Error
   * @param errorText
   *          Non-translated error text
   * @return void
   * 
   */
  public static final void addConversionError(ConversionContext context, String errorCode, String errorText)
  {
    addMessage(context, errorCode, false, errorText, LOG_CONVERSION_ERROR, true);
  }
  
  public static final void addConversionError(ConversionContext context, String errorCode, String subCode, String errorText)
  {
    addMessage(context, errorCode, subCode, false, errorText, LOG_CONVERSION_ERROR, true);
  }

  /**
   * Adds a Conversion Warning to the Conversion Context (unless that type of error already exists or the feature ID is not set.
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param cw
   *          Conversion Warning
   * @return void
   * 
   */
  public static final void addConversionError(ConversionContext context, ConversionWarning cw)
  {
    ConversionResult result = (ConversionResult) context.get(ODPConvertConstants.CONTEXT_CONVERT_RESULT);
    if (cw != null && cw.getFetureID() != null && !result.hasWarning(cw.getFetureID()))
    {
      result.addWarning(cw);
      if (cw.getLocation() != null)
        LOG.warning(cw.getLocation());
      if (cw.getDescription() != null)
        LOG.warning(cw.getDescription());
    }
  }

  /**
   * Adds a Conversion Warning to the Conversion Context (unless that type of error already exists or the feature ID is not set.
   * <p>
   * 
   * @param context
   *          Conversion context
   * @param cw
   *          Conversion Warning
   * @param e
   *          Exception to log
   * @return void
   * 
   */
  public static final void addConversionError(ConversionContext context, ConversionWarning cw, Throwable e)
  {
    logException(context, cw.getDescription(), e);
    addConversionError(context, cw);
  }

  /**
   * Safely sets the attribute in an HTML element. This works around a bug in JTidy where the set doesn't work correctly when the attribute
   * is already set.
   * <p>
   * 
   * @param htmlNode
   *          HTML Element
   * @param newAttr
   *          New Attribute
   * @param newValue
   *          New value for the attribute
   * @return void
   * 
   */
  public static final void setAttributeNode(Element htmlNode, Attr newAttr, String newValue)
  {
    // NOTE: No longer needed as there is now a fix in JTidy
    // String attrName = newAttr.getNodeName();
    // Attr oldAttr = htmlNode.getAttributeNode(attrName);
    // if (oldAttr != null)
    // {
    // htmlNode.removeAttribute(attrName);
    // }
    newAttr.setValue(newValue);
    htmlNode.setAttributeNode(newAttr);
  }

  /**
   * Opens the specified Filename for Read
   * 
   * @param filename
   *          <I>(Mandatory)</I>
   * @return BuffererReader Reader for the File <BR>
   *         <TT>
   * <BR><B>PreConditions:</B> N/A
   * <BR><B>PostConditions:</B> N/A
   * </TT>
   */
  public static BufferedReader openFileForRead(String filename) throws java.lang.Exception
  {
    try
    {
      BufferedReader in = new BufferedReader(new FileReader(filename));
      return in;
    }
    catch (java.io.IOException e)
    {
      ODPCommonUtil.logException(Level.WARNING, createMessage(LOG_ERROR_OPENING_FILE, filename), e);
    }

    return null;
  }

  /**
   * Calculate the Initial Capacity for an HashSet and HashMap.
   * <P>
   * If the anticipated size is zero, the calculated initial capacity will be the default Collection size of 16. For small anticipated
   * sizes, the initial size will be set at twice the anticipated size to allow for the 75% load factor for collection. For larger
   * collections, the initial size will be 1.33 times the anticipated size to allow for the 75 load factor.
   * 
   * @param anticipatedSize
   *          Anticipated size
   * @return int Calculated initial size
   */
  public static final int calculateHashCapacity(int anticipatedSize)
  {
    if (anticipatedSize == 0)
    {
      return DEFAULT_GROWABLE_SIZE;
    }
    else if (anticipatedSize < 100)
    {
      return anticipatedSize * 2;
    }
    else
    {
      return (int) (anticipatedSize * 1.33) + 1;
    }
  }

  /**
   * Calculate the Initial Capacity for an ArrayList.
   * <P>
   * If the anticipated size is zero, the calculated initial capacity will be the minimum size; otherwise, the initial size will be the
   * anticipated size.
   * 
   * @param anticipatedSize
   *          Anticipated size
   * @return int Calculated initial size
   */
  public static final int calculateArrayCapacity(int anticipatedSize)
  {
    if (anticipatedSize == 0)
    {
      return DEFAULT_ARRAY_SIZE;
    }
    else
    {
      return anticipatedSize;
    }
  }

  /**
   * Calculate the Initial Capacity for an ArrayList.
   * <P>
   * If the anticipated size is zero, the calculated initial capacity will be the minimum size; otherwise, the initial size will be the
   * anticipated size.
   * 
   * @param anticipatedSize
   *          Anticipated size
   * @return int Calculated initial size
   */
  public static final int calculateGrowableArrayCapacity(int anticipatedSize)
  {
    if (anticipatedSize == 0)
    {
      return DEFAULT_GROWABLE_SIZE;
    }
    else
    {
      return anticipatedSize;
    }
  }
}
