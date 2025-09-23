/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.style;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Random;
import java.util.StringTokenizer;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.number.OdfNumberStyle;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.doc.text.OdfTextListStyle;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.odftoolkit.odfdom.type.Color;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;

import com.ibm.symphony.conversion.converter.html2odp.content.ODFConvertorUtil;
import com.ibm.symphony.conversion.converter.html2odp.model.Division;
import com.ibm.symphony.conversion.converter.html2odp.model.MetricsUnit;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class CSSUtil
{
//  private static final String CLASS = CSSUtil.class.getName();
//
//  private static final Logger log = Logger.getLogger(CLASS);

  private final static Random r = new Random();

  public static Map<String, String> buildCSSMap(String htmlStyle)
  {
    Map<String, String> rs = new HashMap<String, String>();
    StringTokenizer st = new StringTokenizer(htmlStyle, ";");
    while (st.hasMoreTokens())
    {
      String prop = st.nextToken();
      int index = prop.indexOf(":");
      if (index < 0)
        continue;
      String name = prop.substring(0, index);
      String value = prop.substring(index + 1);
      if (name != null)
      {
        // defect 38783,38738,38699,38533 to lower case is important, used as key in map
        name = name.trim().toLowerCase();
      }
      if (value != null)
        value = value.trim();
      rs.put(name, value);
    }
    return rs;
  }

  public static Object getODFName(OdfStyleFamily family, String name)
  {
    Object odfName = null;
    if (OdfStyleFamily.Table.equals(family))
    {
      odfName = ODFConvertorUtil.getHtmlTableMap().get(name);
    }
    else if (OdfStyleFamily.TableCell.equals(family))
    {
      odfName = ODFConvertorUtil.getHtmlTableCellMap().get(name);
      if (odfName == null)
        odfName = ODFConvertorUtil.getHtmlTextMap().get(name);
    }
    else
    {
      odfName = ODFConvertorUtil.getHtmlTextMap().get(name);
    }

    return odfName;
  }

  public static String computeMeasureByPercentage(String baseValue, String percentage)
  {
    Measure measure = Measure.parseNumber(baseValue);
    MetricsUnit mu = new MetricsUnit(percentage);
    double finalValue = measure.getNumber() * mu.getRealValue();
    return finalValue + measure.getUnit();
  }

  /**
   * convert html value to odf value
   * 
   * @param odfProp
   * @param value
   * @return
   */
  public static String convertHtmlStyleValue(ConversionContext context, OdfStyleProperty odfProp, String value)
  {
    if (value == null)
      return "";
    value = value.trim();
    String rs = value;
    // convert px to pt or inch
    if (value.toLowerCase().indexOf("px") == (value.length() - 2))
    {
      if (OdfStyleTextProperties.FontSize.equals(odfProp) || OdfStyleTextProperties.FontWeight.equals(odfProp))
      {
        rs = convertPXToPT(value);
      }
      else
      {
        rs = convertPXToIN(value);
      }
    }

    /*
     * if(odfProp.equals(OdfStyleGraphicProperties.BackgroundColor)) return rs;
     */
    // defect 38773, IE save color as #0ff, should change to SixDigitHexRGB
    else if (odfProp.getName().getLocalName().indexOf("color") >= 0)
    {
      // background color may be transparent,do not convert
      if (!ODPConvertConstants.CSS_VALUE_TRANSPARENT.equalsIgnoreCase(value) && !"inherit".equalsIgnoreCase(value))
        rs = Color.toSixDigitHexRGB(value);
    }
    else if (value.endsWith("%"))
    {
      double newValue = getPercentWidthInCm(context, Measure.extractNumber(value) / 100 );
      rs = MeasurementUtil.formatDecimal(newValue) + Unit.CENTIMETER.abbr();
    }
    else if (odfProp.getName().getLocalName().indexOf("writing-mode") >= 0)
    {	
    	rs = HtmlCSSConstants.RTL.equalsIgnoreCase(value) ? ODFConstants.RL_TB : ODFConstants.LR_TB;
    }
    return rs;
  }

  public static String convertPXToIN(String value)
  {
    String length = value.toLowerCase().replace("px", "");
    String indent = length + Unit.PIXEL.abbr();
    return (Length.parseDouble(indent, Unit.INCH) + Unit.INCH.abbr());
  }

  public static String convertPXToPT(String value)
  {
    String length = value.toLowerCase().replace("px", "");
    String indent = length + Unit.PIXEL.abbr();
    return (Length.parseDouble(indent, Unit.POINT) + Unit.POINT.abbr());
  }

  public static String convertPTToIN(String value)
  {
    String length = value.toLowerCase().replace("pt", "");
    String indent = length + Unit.POINT.abbr();
    return (Length.parseDouble(indent, Unit.INCH) + Unit.INCH.abbr());
  }

  public static String convertPXToCM(String value)
  {
    String length = value.toLowerCase().replace("px", "");
    String indent = length + Unit.PIXEL.abbr();
    return (Length.parseDouble(indent, Unit.CENTIMETER) + Unit.CENTIMETER.abbr());
  }

  public static String convertBorderValue(String subV)
  {
    String rs = subV;
    if ("thin".equals(subV))
    {
      rs = "0.002cm";
    }
    else if ("medium".equals(subV))
    {
      rs = "0.088cm";
    }
    else if ("thick".equals(subV))
    {
      rs = "0.176cm";
    }
    else if ("red".equals(subV))
    {
      rs = "#ff0000";
    }
    else if ("green".equals(subV))
    {
      rs = "#00ff00";
    }
    else if ("blue".equals(subV))
    {
      rs = "#0000ff";
    }
    else if (subV.indexOf("rgb") != -1)
    {
      rs = Color.toSixDigitHexRGB(subV);
    }
    else if (subV.endsWith("px"))
    {
      rs = convertPXToCM(subV);
    }
    return rs;
  }

  public static OdfStyle getOldStyle(OdfDocument odfDoc, String styleName, OdfStyleFamily odfStyleFamily)
  {
    try
    {
      OdfOfficeStyles odfStyles = odfDoc.getStylesDom().getOfficeStyles();
      OdfOfficeAutomaticStyles autoStyles = odfDoc.getContentDom().getAutomaticStyles();
      OdfStyle oldStyle = null;
      if (odfStyles != null)
      {
        oldStyle = odfStyles.getStyle(styleName, odfStyleFamily);
      }
      if (oldStyle == null && autoStyles != null)
      {
        oldStyle = autoStyles.getStyle(styleName, odfStyleFamily);
      }
      return oldStyle;
    }
    catch (Exception e)
    {
      return null;
    }
  }

  public static Double getTextSize(OdfDocument odfDoc, String styleName, OdfStyleFamily odfStyleFamily)
  {
    OdfStyle odfStyle = getOldStyle(odfDoc, styleName, odfStyleFamily);
    if (odfStyle == null)
      return null;
    String fontSizeValue = odfStyle.getProperty(OdfStyleTextProperties.FontSize);
    if (fontSizeValue != null)
      return Measure.extractNumber(fontSizeValue);
    return null;
  }

  /**
   * Get the default text color to use for the style. Note: this will search the parent hierarchy and will return either the fo:color or and
   * indication to use-window-font-color whichever is found first.
   * 
   * @param odfDoc
   * @param styleName
   *          - the style to start looking for the color to use
   * @param odfStyleFamily
   *          - the style family to check
   * @return String containing the fo:color attribute or "" if use-window-font-color is found to be true. null will be returned if neither
   *         value is found or if the style is not found.
   */
  public static String getTextColor(OdfDocument odfDoc, String styleName, OdfStyleFamily odfStyleFamily)
  {
    OdfStyle odfStyle = getOldStyle(odfDoc, styleName, odfStyleFamily);
    if (odfStyle == null)
      return null;
    String fontColorValue = odfStyle.getProperty(OdfStyleTextProperties.Color);
    if (fontColorValue != null)
      return fontColorValue;
    else
    {
      // Check if we have use-window-font-color
      String useWindowColor = odfStyle.getProperty(OdfStyleTextProperties.UseWindowFontColor);
      if (useWindowColor != null && useWindowColor.equals("true"))
      {
        return ""; // Return use-window-font-color: true
      }
      else
      {
        // Check if our parent has color or use-window-font-color
        @SuppressWarnings("restriction")
        String parentStyleName = odfStyle.getAttribute(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME);
        if (parentStyleName != null)
        {
          String parentColor = getTextColor(odfDoc, parentStyleName, odfStyleFamily);
          if (parentColor != null)
            return parentColor;
        }
      }
    }
    return null;
  }

  public static OdfTextListStyle getOldListStyle(OdfDocument odfDoc, String styleName)
  {
    try
    {
      OdfOfficeStyles odfStyles = odfDoc.getContentDom().getOfficeStyles();
      OdfOfficeAutomaticStyles autoStyles = odfDoc.getContentDom().getAutomaticStyles();
      OdfTextListStyle oldStyle = null;
      if (odfStyles != null)
      {
        oldStyle = getOldListStyle(odfStyles.getListStyles(), styleName);
      }
      if (oldStyle == null && autoStyles != null)
      {
        oldStyle = getOldListStyle(autoStyles.getListStyles(), styleName);
      }
      return oldStyle;
    }
    catch (Exception e)
    {
      return null;
    }
  }

  /**
   * Find and return the list style matching styleName Note: this is being used because it appears that autoStyles.getListStyle(styleName)
   * does not find newly added styles.
   * 
   * @param listStyles
   *          - an iterator for the styles DOM to be searched
   * @param styleName
   *          - the name of the list style to search for
   * @return OdfTextListStyle with style:name styleName. null returned if not found.
   */
  private static OdfTextListStyle getOldListStyle(Iterable<OdfTextListStyle> listStyles, String styleName)
  {
    OdfTextListStyle oldStyle = null;
    Iterator<OdfTextListStyle> list = listStyles.iterator();
    while (list.hasNext())
    {
      OdfTextListStyle listStyle = list.next();
      if (listStyle.getStyleNameAttribute().equals(styleName))
      {
        oldStyle = listStyle;
        break;
      }
    }
    return oldStyle;
  }

  public static OdfNumberStyle getOldNumberStyle(OdfDocument odfDoc, String styleName)
  {
    try
    {
      OdfOfficeStyles odfStyles = odfDoc.getContentDom().getOfficeStyles();
      OdfOfficeAutomaticStyles autoStyles = odfDoc.getContentDom().getAutomaticStyles();
      OdfNumberStyle oldStyle = null;
      if (odfStyles != null)
      {
        oldStyle = odfStyles.getNumberStyle(styleName);
      }
      if (oldStyle == null && autoStyles != null)
      {
        oldStyle = autoStyles.getNumberStyle(styleName);
      }
      return oldStyle;
    }
    catch (Exception e)
    {
      return null;
    }
  }

  public static void convertBorderValues(Map<String, String> htmlStyle, String key, String[] values)
  {
    String htmlValue = htmlStyle.get(key);
    if (htmlValue != null && htmlValue.length() > 0)
    {
      htmlValue = convertRGBValues(htmlValue);
      StringTokenizer st = new StringTokenizer(htmlValue, " ");
      int i = 0;
      while (st.hasMoreTokens())
      {
        String subV = st.nextToken();
        if ("-moz-use-text-color".equals(subV))
        {
          String textColor = htmlStyle.get("color");
          if (textColor != null && textColor.length() > 0)
          {
            subV = textColor;
          }
          else
          {
            subV = "#000000";// default black color
          }
        }
        subV = convertBorderValue(subV);
        i++;
        switch (i)
          {
            case 1 :
              values[0] = subV;
              values[2] = subV;
              break;
            case 2 :
              values[1] = subV;
              values[3] = subV;
              break;
            case 3 :
              values[2] = subV;
              break;
            case 4 :
              values[3] = subV;
              break;
          }
      }
    }
  }

  public static String getStyleName(OdfStyleFamily odfStyleFamily, String prefix)
  {
    if (prefix == null || prefix.length() == 0)
    {
      prefix = String.valueOf(odfStyleFamily.getName().charAt(0)).toUpperCase();
    }
    return prefix + "_" + r.nextInt(Integer.MAX_VALUE);
  }

  public static String convertRGBValues(String htmlValue)
  {
    String rs = htmlValue;
    int start_idx = 0;
    if (htmlValue != null && htmlValue.length() > 0)
      start_idx = htmlValue.indexOf("rgb");
    if (start_idx != -1)
    {
      StringBuilder sb = new StringBuilder(32);
      int end_idx = -1;
      do
      {
        sb.append(htmlValue.substring(end_idx + 1, start_idx));
        end_idx = htmlValue.indexOf(")", start_idx);
        String colorV = Color.toSixDigitHexRGB(htmlValue.substring(start_idx, end_idx + 1));
        sb.append(colorV);
        start_idx = htmlValue.indexOf("rgb", end_idx + 1);
      }
      while (-1 != start_idx);
      sb.append(htmlValue.substring(end_idx + 1));
      rs = sb.toString();
    }
    return rs;
  }

  public static String getShorthandValue(String[] borderWidthArray, String[] borderStyleArray, String[] borderColorArray, int index)
  {
    StringBuilder sb = new StringBuilder(32);
    sb.append(borderWidthArray[index]);
    sb.append(" ");
    sb.append(borderStyleArray[index]);
    sb.append(" ");
    sb.append(borderColorArray[index]);
    return sb.toString();
  }
  
  /**
   * Returns the centimeters value of a given width expressed in percentage.
   *
   * @param width - the width in percentage to convert
   * 
   * @return the width in centimeters
   */
  public static double getPercentWidthInCm(ConversionContext context, double percentWidth)
  {
    double parentWidth_d = 0.0;
    
    String parentWidth = (String) context.get(ODPConvertConstants.CONTEXT_PARENT_WIDTH);
    if (parentWidth != null)
    {
      parentWidth_d = Measure.extractNumber(parentWidth);
    }
    else
    {
      // parent width isn't set, use page width
      Division currentSize = (Division) context.get(ODPConvertConstants.CONTEXT_CURRENT_SIZE);
      MetricsUnit width = currentSize.getWidth();
      parentWidth_d = width.getRealValue();
    }

    return  percentWidth * parentWidth_d;
    
  }

}
