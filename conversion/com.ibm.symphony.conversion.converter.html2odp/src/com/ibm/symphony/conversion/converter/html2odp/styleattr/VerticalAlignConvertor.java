/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.styleattr;

import java.util.Map;

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

public class VerticalAlignConvertor extends GeneralPropertyConvertor
{

//  private static final String CLASS = VerticalAlignConvertor.class.getName();
//
//  private static final Logger log = Logger.getLogger(CLASS);
  
  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    StringBuilder odfValue = new StringBuilder(16);
    if (ODPConvertConstants.HTML_VALUE_SUB.equalsIgnoreCase(value) || ODPConvertConstants.HTML_VALUE_SUPER.equalsIgnoreCase(value))
    {
      OdfStyle oldStyle = (OdfStyle) context.get(ODPConvertConstants.CONTEXT_OLD_STYLE_PARAM);
      
      // Property for subscript starts with a minus sign
      odfValue.append(value.toLowerCase());
      
      //if (ODPConvertConstants.HTML_VALUE_SUB.equalsIgnoreCase(value))
      //{
      //  odfValue.append(ODPConvertConstants.SYMBOL_DASH);
      //}

      // Calculate the Super/Subscript Font Size
      String fontSize = htmlStyle.get(ODPConvertConstants.CSS_FONT_SIZE);
      if (fontSize == null || fontSize.length() == 0)
      {
        // if we enter here it means there is no font size associated with this node.
        // This means we must use the same super/sub percentage values from the old style.
        // Just return, the calling code will copy the text-position from the old style.
        // If the old style doesn't exist we have to default to default size - ideally we'd
        // leave it at 100% but symphony will not render this for some reason.
        
        if (oldStyle != null)
          return;
        else
          fontSize = ODPConvertConstants.SUPER_SUB_SCRIPT_FONT_SIZE;
      }
      else
      {
        Measure measure = Measure.parseNumber(fontSize);
        if (measure.isEMMeasure())
        {
          double fontSize_d = measure.getNumber();
          
          fontSize = this.getNewPercentage(context, oldStyle, fontSize_d);
          if (fontSize == null)
          {
            if (fontSize_d != 0.0)
            {
              fontSize = MeasurementUtil.formatDecimal(fontSize_d * 100, 0) + ODPConvertConstants.SYMBOL_PERCENT;
            }
            else
            {
              fontSize = ODPConvertConstants.SUPER_SUB_SCRIPT_FONT_SIZE;
            }
          }
        }
        else if (measure.isPercentMeasure())
        // Already in the desired format
        {
        }
        else
        // Unsupported format - use default
        {
          fontSize = ODPConvertConstants.SUPER_SUB_SCRIPT_FONT_SIZE;
        }
      }

      // Construct the OdfStyle
      //odfValue.append(ODPConvertConstants.SUPER_SUB_SCRIPT_FONT_ADJUST + ODPConvertConstants.SYMBOL_WHITESPACE);
      odfValue.append(ODPConvertConstants.SYMBOL_WHITESPACE + fontSize);
      style.setProperty(OdfStyleTextProperties.TextPosition, odfValue.toString());
    }
    else if (ODPConvertConstants.ALIGNMENT_BOTTOM.equalsIgnoreCase(value) || ODPConvertConstants.ALIGNMENT_TOP.equalsIgnoreCase(value)
        || ODPConvertConstants.ALIGNMENT_MIDDLE.equalsIgnoreCase(value))
    {
      // If the style is table-cell, we need to set the new value
      if (style.getFamily() == OdfStyleFamily.TableCell)
      {
        style.setProperty(OdfStyleGraphicProperties.TextareaVerticalAlign, value.toLowerCase());
      }
    }
  }

  /**
   * Calculate the font percentage for the sub/superscript. This is done by extracting the font
   * size from the old style (the percentage is relative to the font size specified in the style,
   * this font size is not preserved anywhere during import. The calculation is this :
   * newPercent = [ em_value * parent_fontsize / oldStyle_fontsize ] * 100
   * 
   * @param context
   * @param oldStyle
   * @param emFontSize
   * @return
   */
  protected String getNewPercentage(ConversionContext context, OdfStyle oldStyle, double emFontSize)
  {
    if (emFontSize == 0.0)
      return null;
    
    Object parentFontSize = context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
    if (parentFontSize == null)
      return null;
    
    double  parentFontSize_d = (Double) parentFontSize;
    
    // if there is no font size, use the parent font size
    double fontsize_d = parentFontSize_d;
    
    String fontSize = getFontSize(oldStyle);
    if (fontSize != null && fontSize.length() > 0)
    {
      Measure measure = Measure.parseNumber(fontSize);
      if (!measure.isPTMeasure() || measure.getNumber() <= 0)
        return null;

      fontsize_d = measure.getNumber();
    }

    // Now calculate the new percentage
    double tmp = emFontSize * parentFontSize_d / fontsize_d * 100;
    long newPercent = Math.round(tmp);

    return (newPercent + ODPConvertConstants.SYMBOL_PERCENT); 
  }
  
  protected String getFontSize(Node style)
  {
    String fontSize = null;
    
    if (style == null)
      return null;

    NamedNodeMap map = style.getAttributes();
    if (map != null)
    {
      Node node = map.getNamedItem(ODPConvertConstants.ODF_ATTR_FONT_SIZE);

      if (node != null)
      {
        fontSize = node.getNodeValue();
      }
      else
      {
        NodeList children = style.getChildNodes();
        for (int i = 0; i < children.getLength(); i++)
        {
          Node child = children.item(i);
          if (child.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_ATTR_STYLE_TEXT_PROPERTIES))
          {
            Node fontSizeAttr = child.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_FONT_SIZE);
            if (fontSizeAttr != null)
            {
              fontSize = fontSizeAttr.getNodeValue();
              break;
            }
          }
        }
      }
    }
    return fontSize;
  }
}
