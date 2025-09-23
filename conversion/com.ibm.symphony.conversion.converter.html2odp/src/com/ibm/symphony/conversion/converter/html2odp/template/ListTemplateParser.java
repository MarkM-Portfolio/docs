/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.template;

import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.util.Map;
import java.util.logging.Level;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyleListLevelProperties;
import org.odftoolkit.odfdom.doc.text.OdfTextListStyle;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.element.style.StyleListLevelPropertiesElement;
import org.odftoolkit.odfdom.dom.element.style.StyleTextPropertiesElement;
import org.odftoolkit.odfdom.dom.element.text.TextListLevelStyleBulletElement;
import org.odftoolkit.odfdom.dom.element.text.TextListLevelStyleElementBase;
import org.odftoolkit.odfdom.dom.element.text.TextListLevelStyleImageElement;
import org.odftoolkit.odfdom.dom.element.text.TextListLevelStyleNumberElement;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class ListTemplateParser extends CSSTemplateParser
{
  // Constants
  public static enum LIST_TYPE {
    BULLET, NUMBER, IMAGE
  };

  private static final String CLASS = ListTemplateParser.class.getName();

  // private static final Logger log = Logger.getLogger(CLASS);

  private static final String LIST_STYLES_CSS = "liststyles.css";

  private static final String TEMPLATE_BACKGROUND = "background";

  private static final String TEMPLATE_CONTENT = "content";

  private static final String TEMPLATE_ATTR = "attr";

  private static final String TEMPLATE_VALUES = "values";

  private static final String BULLETLIST_IMAGES_RESOURCE_DIRECTORY = "/resource/images/bulletlist/";

  private static final String TEMPLATE_BEFORE_SUFFIX = ":before";

  private static final String DEFAULT_BULLET_SPECIFIER = "\u26AB";

  private static final int DEFAULT_BULLET_FONTSIZE = 100; // 100% (previously 45%)

  private static final int DEFAULT_NUMBER_FONTSIZE = 100; // 100%


  // Member data
  private LIST_TYPE _listType = null;

  private String _specifiers = null;

  private String _styleName = null;
  
  private String _listStyle = null;

  private String _numType = null;

  private int _fontSize = 0;

  private String _charBefores = null;

  private String _charAfters = null;

  private String _fontFamilies = null;

  private String _fontColor = null;

  private String _backgroundImage = null; // url

  @SuppressWarnings("unused")
  private String _backgroundPosition = null; // em values

  @SuppressWarnings("unused")
  private String _backgroundSize = null; // em values

  private String _marginLeft = null;

  private String _marginRight = null;

  private String _textIndent = null;

  public OdfTextListStyle convertCSStoODF(ConversionContext context, String listStyleName, Element htmlNode)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("target");
    @SuppressWarnings("unchecked")
    Map<String, Map<String, String>> mapCSSInfo = (Map<String, Map<String, String>>) context.get(ODPConvertConstants.CONTEXT_LIST_STYLE_SOURCE);
    if (mapCSSInfo == null)
    {
      // Load the CSS Document if not yet loaded into the context
      mapCSSInfo = loadCSSDocument(context, LIST_STYLES_CSS);
      if (mapCSSInfo != null)
      { // Save the css style map in the context for subsequent use
        context.put(ODPConvertConstants.CONTEXT_LIST_STYLE_SOURCE, mapCSSInfo);
      }
      else
      {
        return null;
      }
    }
    
    // Get the list type <ol> or <ul> from the html node
    String listType = htmlNode.getNodeName();
    int index = listStyleName.lastIndexOf("_");
    setListStyle(listStyleName.substring(0, index));
    setStyleName(listStyleName);
    
    Map<String, String> liInfo = mapCSSInfo.get(ODFConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS + " " + HtmlCSSConstants.LI + "." + _listStyle);
    Map<String, String> liBeforeInfo = mapCSSInfo.get(ODFConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS + " " + HtmlCSSConstants.LI + "."
        + _listStyle + TEMPLATE_BEFORE_SUFFIX);
    
    if(liBeforeInfo==null){
    	String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_LIST_STYLE_NOT_EXIST, listStyleName);
        ODPCommonUtil.logMessage(Level.WARNING, message);
    	return null;
    }
    // Set the list before info
    if (listType.equals(HtmlCSSConstants.OL)) // <ol> - numbering
    {
      setListType(LIST_TYPE.NUMBER);
      setNumType(htmlNode.getAttribute("numbertype"));
      // Set the level specific content information
      setContentForLevels(liBeforeInfo);
      setFontSize(DEFAULT_NUMBER_FONTSIZE); // 100%
    }
    else // <ul> - bullet or image
    {
      if(liBeforeInfo.get("background") != null)
      {
        setListType(LIST_TYPE.IMAGE);
        setImageAttribute(liBeforeInfo);
      }
      else
      {
        setListType(LIST_TYPE.BULLET);
        // Set the level specific content information
        setContentForLevels(liBeforeInfo);
        setFontSize(DEFAULT_BULLET_FONTSIZE); // 100%
      }
    }
    
    // Set the margin-left and text-indent, padding-right
    if (liInfo != null)
    {
      setPosition(liInfo);
    }
    
    // Append the style to the contentDom
    return appendStyle(contentDom, context);
  }
  
  private void setContentForLevels(Map<String, String> liBeforeInfo)
  {
    String content = liBeforeInfo.get(TEMPLATE_CONTENT);
    
    String[] specifiers = getCharsFromContent(content);
    if (specifiers != null)
    {
      _charBefores = specifiers[0];
      _specifiers = specifiers[1];
      _charAfters = specifiers[2];
    }
    String fontFamily = liBeforeInfo.get(HtmlCSSConstants.FONT_FAMILY);
    if (fontFamily != null)
    {
      _fontFamilies = fontFamily.replace('\"', '\'');
    }
  }
  
  private void setPosition(Map<String, String> liInfo)
  {
    setMarginRight(liInfo.get(HtmlCSSConstants.MARGIN_RIGHT));
    setMarginLeft(liInfo.get(HtmlCSSConstants.MARGIN_LEFT));
    setTextIndent(liInfo.get(HtmlCSSConstants.TEXT_INDENT));
  }
  
  private void setImageAttribute(Map<String, String> liBeforeInfo)
  {
    String background = liBeforeInfo.get(TEMPLATE_BACKGROUND);
    String[] values = background.trim().split("\\s+"); // split by whitespace
    setBackgroundImage(values[0]);
    if (values.length > 1)
    {
      //setBackgroundRepeat(values[1]);
    }
    //setBackgroundPosition(spanInfo.get(HtmlCSSConstants.BACKGROUND_POSITION));
    setBackgroundSize(liBeforeInfo.get(HtmlCSSConstants.BACKGROUND_SIZE));
  }

  /**
   * Append the new bullet or number or image style to the automatic styles section of the contentDom
   * 
   * @param contentDom
   *          - current content dom
   * @param context
   *          - the current ConversionContext
   * @return the style added, null if an error occurred.
   */
  private OdfTextListStyle appendStyle(OdfFileDom contentDom, ConversionContext context)
  {
    try
    {
      // Create the list style element
      OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
      OdfTextListStyle listStyle = autoStyles.newListStyle();
      listStyle.setStyleNameAttribute(_styleName);

      if (_listType == LIST_TYPE.IMAGE)
      {
        // Copy the image to the /Pictures directory in ODF
        copyImage(contentDom, context);
      }

      StyleListLevelPropertiesElement levelProperties = null;
      switch (_listType)
      {
        case BULLET :
          TextListLevelStyleBulletElement bulletLevel = listStyle.newTextListLevelStyleBulletElement(_specifiers, 1);
          if (_charAfters != null)
            bulletLevel.setStyleNumSuffixAttribute(_charAfters);
          // Add the list level properties
          levelProperties = bulletLevel.newStyleListLevelPropertiesElement();
          // Add the text level properties
          StyleTextPropertiesElement bulletTextStyle = bulletLevel.newStyleTextPropertiesElement("true"); // text:display
          bulletTextStyle.setFoFontSizeAttribute(MeasurementUtil.formatDecimal(_fontSize, 0) + "%");
          if (_fontFamilies != null)
            bulletTextStyle.setFoFontFamilyAttribute(_fontFamilies);
          if (_fontColor != null && _fontColor.length() > 0)
            bulletTextStyle.setFoColorAttribute(_fontColor);
          else
            bulletTextStyle.setStyleUseWindowFontColorAttribute(true);
          break;
        case NUMBER :
          String specifier = _specifiers;
          if (specifier.equals(TEMPLATE_VALUES)) // attr(values) specified
          {
            specifier = _numType;
          }
          TextListLevelStyleNumberElement numberLevel = listStyle.newTextListLevelStyleNumberElement(specifier, 1);
          if (_charBefores != null)
            numberLevel.setStyleNumPrefixAttribute(_charBefores);
          if (_charAfters != null)
            numberLevel.setStyleNumSuffixAttribute(_charAfters);
          // Add the list level properties
          levelProperties = numberLevel.newStyleListLevelPropertiesElement();
          // Add the text level properties
          StyleTextPropertiesElement numberTextStyle = numberLevel.newStyleTextPropertiesElement("true"); // text:display
          numberTextStyle.setFoFontSizeAttribute(MeasurementUtil.formatDecimal(_fontSize, 0) + "%");
          if (_fontColor != null && _fontColor.length() > 0)
            numberTextStyle.setFoColorAttribute(_fontColor);
          else
            numberTextStyle.setStyleUseWindowFontColorAttribute(true);
          break;
        case IMAGE :
          TextListLevelStyleImageElement imageLevel = listStyle.newTextListLevelStyleImageElement(1);
          // Set the image information
          imageLevel.setXlinkHrefAttribute(getBackgroundImageRef());
          imageLevel.setXlinkShowAttribute("embed");
          imageLevel.setXlinkActuateAttribute("onLoad");
          imageLevel.setXlinkTypeAttribute("simple");
          // Add the list level properties
          levelProperties = imageLevel.newStyleListLevelPropertiesElement();
          levelProperties.setStyleVerticalPosAttribute("middle");
          levelProperties.setStyleVerticalRelAttribute("line");
          levelProperties.setFoHeightAttribute(getBackgroundHeight(context, 1));
          levelProperties.setFoWidthAttribute(getBackgroundWidth(context, 1));
          break;
      }
      // Set the common list level properties
      _textIndent = "0.3";
      _marginRight = "0.9";
      double spaceBefore =  Double.parseDouble(_textIndent);
      levelProperties.setTextSpaceBeforeAttribute(MeasurementUtil.formatDecimal(spaceBefore, 2)+ "cm");
      levelProperties.setTextMinLabelWidthAttribute(MeasurementUtil.formatDecimal(Double.parseDouble(_marginRight), 2)+ "cm");
      
      // Create the text list level style bullet or number elements
      TextListLevelStyleElementBase levelDetails = listStyle.getLevel(1);
      for (int i = 2; i <= 10; ++i)
      {
        Node newLevelDetails = levelDetails.cloneNode(true);
        ((Element) newLevelDetails).setAttribute(ODPConvertConstants.ODF_ATTR_TEXT_LEVEL, Integer.toString(i));
        OdfStyleListLevelProperties newLevelListProp = (OdfStyleListLevelProperties) ((OdfStyleBase) newLevelDetails).getPropertiesElement(OdfStylePropertiesSet.ListLevelProperties);
        
        double newLevelSpaceBefore = (i-1)*ODPConvertConstants.INCREASE_INDENT + spaceBefore;
        newLevelListProp.setTextSpaceBeforeAttribute(MeasurementUtil.formatDecimal(newLevelSpaceBefore, 2)+ "cm");
        listStyle.appendChild(newLevelDetails);       
      }

      return listStyle;
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".appendStyle");
      ODPCommonUtil.logException(context, Level.SEVERE, message, e);
      return null;
    }
  }

  /**
   * Copy the image from the source file specified in getBackgroundImageName into the ODF package
   * 
   * @param contentDom
   *          - the current content DOM
   * @param context
   *          - the current conversion context
   * @return boolean True if successful
   */
  private boolean copyImage(OdfFileDom contentDom, ConversionContext context)
  {
    boolean success = false;

    String imageName = getBackgroundImageName().replace("%20", " ");
    String imageResourcePath = BULLETLIST_IMAGES_RESOURCE_DIRECTORY + imageName;
   
    InputStream imageStream = ListTemplateParser.class.getResourceAsStream(imageResourcePath);
    
    if (imageStream != null)
    {
      try
      {
        OdfPackage pkg = contentDom.getOdfDocument().getPackage();
        pkg.insert(imageStream, ODPConvertConstants.FILE_PICTURE_START_PREFIX + imageName, ODPConvertConstants.MIME_TYPE_PNG);
        success = true;
      }
      catch (URISyntaxException e)
      {
        ODPCommonUtil.logException(context, Level.SEVERE, ODPCommonUtil.LOG_FAILED_IMAGE_EXPORT, e);
      }
      catch (Exception e)
      {
        ODPCommonUtil.logException(context, Level.SEVERE, ODPCommonUtil.LOG_FAILED_IMAGE_EXPORT, e);
      }
      finally
      {
        try
        {
        	 imageStream.close();
        }
        catch (IOException e)
        {
        	ODPCommonUtil.logException(context,Level.SEVERE, "io error when closing " + imageResourcePath, e);
        }
      }
    }
    else
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_IMAGE_FILE_NOT_EXIST, getBackgroundImageName());
      ODPCommonUtil.logMessage(Level.WARNING, message);
    }
    return success;
  }

  /**
   * Get the level specific characters to use from the content.
   * 
   * @param content
   *          - the content: line from the liststyles.css
   * @return String[] - String[0] contains the prefix string, String[1] contains the bullet or number character, String[2] contains the
   *         suffix string. null is returned if an error occurs.
   */
  private String[] getCharsFromContent(String content)
  {
    if (content == null)
      return null;

    String[] charInfo = new String[3];

    int nFind1 = 0, nFind2 = 0;
    if (content.contains(TEMPLATE_ATTR)) // Sequence specified via an attribute
    {
      // Note: for Japanese sequence the assumptions include 1) optional prefix (unicode format), 2) attr(values), 3) optional suffix
      // (unicode format)
      // (suffix always includes a blank character after it)
      // Example: content: "\0028" attr(values) "\0029" " ";
      if (content.startsWith("\""))
      {
        // Before character specified
        nFind1 = content.indexOf('"');
        if (-1 == nFind1)
        {
          return null;
        }
        nFind2 = content.indexOf('"', nFind1 + 1);
        if (-1 == nFind2)
        {
          return null; // Unpaired quotes. Invalid format.
        }
        String numPrefix = getCharFromLabel(content.substring(nFind1 + 1, nFind2));
        if (numPrefix != null)
          charInfo[0] = numPrefix;
        ++nFind2;
      }

      // attr
      nFind1 = content.indexOf('(', nFind2);
      if (-1 == nFind1)
      {
        return null;
      }
      nFind2 = content.indexOf(')', nFind1);
      if (-1 == nFind2)
      {
        return null;
      }
      charInfo[1] = content.substring(nFind1 + 1, nFind2).trim();
      ++nFind2;

      // After character(s)
      nFind1 = content.indexOf('"', nFind2);
      if (-1 != nFind1)
      {
        nFind2 = content.indexOf('"', nFind1 + 1);
        if (-1 == nFind1)
        {
          return null; // Unpaired quotes. Invalid format.
        }
        StringBuilder charsAfter = new StringBuilder(16);
        String charAfter = content.substring(nFind1 + 1, nFind2);
        if (charAfter.startsWith("\\")) // Unicode format
        {
          String numSuffix = getCharFromLabel(content.substring(nFind1 + 1, nFind2));
          if (numSuffix != null)
            charsAfter.append(numSuffix);
        }
        else
        // Just some characters
        {
          charsAfter.append(charAfter);
        }
        ++nFind2;
        nFind1 = content.indexOf('"', nFind2);
        if (-1 != nFind1)
        {
          nFind2 = content.indexOf('"', nFind1 + 1);
          if (-1 == nFind1)
          {
            return null; // Unpaired quotes. Invalid format.
          }
          charAfter = content.substring(nFind1 + 1, nFind2);
          if (charAfter.startsWith("\\")) // Unicode format
          {
            String numSuffix = getCharFromLabel(content.substring(nFind1 + 1, nFind2));
            if (numSuffix != null)
              charsAfter.append(numSuffix);
          }
          else
          // Just some characters
          {
            charsAfter.append(charAfter);
          }
        }
        if (charsAfter.length() > 0)
          charInfo[2] = charsAfter.toString();
      }
    }
    else
    // Bullet list of some type
    {
      // Note: for bullets the assumptions include 1) no prefix, 2) bullet char (unicode format), 3) Always blank suffix
      // Example: content: "\2666" "  "
      nFind1 = content.indexOf('"');
      if (-1 == nFind1)
      {
        return null;
      }
      nFind2 = content.indexOf('"', nFind1 + 1);
      if (-1 == nFind2)
      {
        return null; // Unpaired quotes. Invalid format.
      }
      // Bullet character specified (first label in this case)
      String bulletChar = getCharFromLabel(content.substring(nFind1 + 1, nFind2));
      if (bulletChar == null)
        bulletChar = DEFAULT_BULLET_SPECIFIER;
      charInfo[1] = bulletChar;
      ++nFind2;
      // After character(s)
      nFind1 = content.indexOf('"', nFind2);
      if (-1 != nFind1)
      {
        nFind2 = content.indexOf('"', nFind1 + 1);
        if (-1 == nFind1)
        {
          return null; // Unpaired quotes. Invalid format.
        }
        if (nFind2 > nFind1 + 1)
        {
          charInfo[2] = content.substring(nFind1 + 1, nFind2);
        }
      }
    }
    return charInfo;
  }

  /**
   * Converts a css unicode character value into a char for use in ODF attributes
   * 
   * @param label
   *          - String containing the unicode character of the form \NNNN
   * @return String containing the char to use for the ODF attribute. null if error.
   */
  private static String getCharFromLabel(String label)
  {
    String charString = null;
    if (label != null && label.startsWith("\\"))
    {
      // Unicode format character specified
      try
      {
        char charValue = (char) Integer.parseInt(label.substring(1), 16);
        charString = String.valueOf(charValue);
      }
      catch (NumberFormatException e)
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".getCharFromLabel");
        ODPCommonUtil.logException(Level.SEVERE, message, e);
      }
    }
    return charString;
  }

  /**
   * @param styleName
   *          the styleName to set
   */
  public void setStyleName(String styleName)
  {
    _styleName = styleName;
  }
  
  public void setListStyle(String listStyle)
  {
    _listStyle = listStyle;
  }
  
  public void setNumType(String numType)
  {
    _numType = numType;
  }
  
  /**
   * @param listType
   *          the listType to set
   */
  public void setListType(LIST_TYPE listType)
  {
    _listType = listType;
  }

  /**
   * @param fontSize
   *          the fontSize to set
   */
  public void setFontSize(int fontSize)
  {
    _fontSize = fontSize;
  }


  /**
   * @param marginLeft
   *          the marginLeft to set
   */
  public void setMarginLeft(String marginLeft)
  {
    if (_marginLeft == null || !_marginLeft.contains("!important"))
      _marginLeft = marginLeft;
  }


  /**
   * @param marginRight
   *          the marginRight to set
   */
  public void setMarginRight(String marginRight)
  {
    if(_marginRight == null || !_marginRight.contains("!important"))
      _marginRight = marginRight;
  }

  /**
   * @param textIndent
   *          the textIndent to set
   */
  public void setTextIndent(String textIndent)
  {
    if (_textIndent == null || !_textIndent.contains("!important"))
      _textIndent = textIndent;
  }

  /**
   * @param backgroundImage
   *          the backgroundImage to set
   */
  public void setBackgroundImage(String backgroundImage)
  {
    if (backgroundImage != null)
      _backgroundImage = backgroundImage.trim();
  }

  /**
   * Get the image reference from the background-image to use for the xlink:href ODF attribute
   * 
   * @return String containing the imageRef. null if image isn't available
   */
  public String getBackgroundImageRef()
  {
    if (_backgroundImage != null)
    {
      String imageRef = "Pictures";
      int start = _backgroundImage.lastIndexOf('/');
      if (start != -1)
      {
        String imageFile = _backgroundImage.substring(start);
        if (imageFile.endsWith(")"))
          imageFile = imageFile.substring(0, imageFile.length() - 1);
        return imageRef += imageFile;
      }
    }
    return null;
  }

  /**
   * Returns the file name of the background image. If the file name contains any directories, the returned value is only the leaf element
   * of the path name. This method is a spin-off of getBackgroundImageRef.
   * 
   * @return the background image file name
   */
  public String getBackgroundImageName()
  {
    if (_backgroundImage != null)
    {
      int start = _backgroundImage.lastIndexOf('/');
      if (start != -1)
      {
        String imageFileName = _backgroundImage.substring(start + 1);
        if (imageFileName.endsWith(")"))
        {
          imageFileName = imageFileName.substring(0, imageFileName.length() - 1);
        }
        return imageFileName;
      }
    }
    return null;
  }

  /**
   * @param backgroundPosition
   *          the backgroundPosition to set
   */
  public void setBackgroundPosition(String backgroundPosition)
  {
    if (backgroundPosition != null)
      _backgroundPosition = backgroundPosition.trim();
  }

  /**
   * @param backgroundSize
   *          the backgroundSize to set
   */
  public void setBackgroundSize(String backgroundSize)
  {
    if (backgroundSize != null)
      _backgroundSize = backgroundSize.trim();
  }

  /**
   * Get the background height from the backgroundSize to use for the fo:height ODF attribute. A straight em to cm conversion is used here
   * (i.e. 1em == 1cm) because that is what makes the appearance look the same as well as the fact that this is what we are doing on import.
   * 
   * @param context
   *          - Conversion context
   * @param level
   *          - The list level (1 - 10)
   * @return String containing the height in cm. If not found, the default height will be returned.
   */
  public String getBackgroundHeight(ConversionContext context, int level)
  {
    return "0.5334cm";
  }

  /**
   * Get the background width from the backgroundSize to use for the fo:width ODF attribute. A straight em to cm conversion is used here
   * (i.e. 1em == 1cm) because that is what makes the appearance look the same as well as the fact that this is what we are doing on import.
   * 
   * @param context
   *          - Conversion context
   * @param level
   *          - The list level (1 - 10)
   * @return String containing the width in cm. If not found, the default width will be returned.
   */
  public String getBackgroundWidth(ConversionContext context, int level)
  {
    return "0.5334cm";
  }

}
