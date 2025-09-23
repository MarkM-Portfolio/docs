/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax;

import java.util.ArrayList;

import java.util.HashSet;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleParagraphProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableCellProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.PositiveLength;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.FormulaToken;


public class ODSConvertUtil
{
  private static final Logger LOG = Logger.getLogger(ODSConvertUtil.class.getName());
  
  
  public final static Pattern doublePattern = Pattern.compile("^-?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)$");

  public final static Pattern percentPattern = Pattern.compile("^-?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)%$");

  public static final Pattern booleanPattern = Pattern.compile("true|false|TRUE|FALSE");

  public final static boolean isOF = false;// the export formula string with of: or not
  
  public final static Pattern dateReplacePattern = Pattern.compile("(~[y|d|E|s]*)([y|d|E|s]*)(~[y|d|E|s]*)");

  public final static String DEFAULT_EXPORT_TABLE_ROW_STYLE_NAME = "rod1";
  
  public final static String DEFAULT_EXPORT_COLUMN_STYLE_NAME = "cod1";
  
  public final static String DEFAULT_CELL_STYLE_NAME = "Default";// "DefaultCell";
  
  public final static String BORDER_WIDTH_THIN = "0.035cm"; // "0.0008in"; must use this number, otherwise when export to xls, border lost

  public final static String BORDER_WIDTH_THICK = "0.105cm"; // 2.5pt
  
  public final static String START_CELL_ADDRESS = "$A$1";

  public final static Random r = new Random();
  
  public static Set<String> imgType = new HashSet<String>();

  static
  {
    imgType.add("svm");
    imgType.add("wmf");
  }
  
  
  public static String saveImageSrcName(ConversionContext context, String src)
  {
    int index = src.substring(9).indexOf("/");
    if (index > 0)
    {
      String extName = src.substring(9, 9 + index);
      if (imgType.contains(extName))
      {
        src = src.replace(extName + "/", "");
        int dotIndex = src.lastIndexOf(".");
        src = src.substring(0, dotIndex + 1) + extName;
      }
    }
    HashSet<String> imageSrcSet = (HashSet<String>) context.get(ConversionConstant.IMAGESRC_SET);
    imageSrcSet.add(src.substring(9));
    return src;
  }
  
  public static String convertPXToINCH(int length)
  {
    String indent = length + Unit.PIXEL.abbr();
    return (Length.parseDouble(indent, Unit.INCH) + Unit.INCH.abbr());
  }
  
  public static String convertPXToINCH(double length)
  {
    String indent = length + Unit.PIXEL.abbr();
    return (Length.parseDouble(indent, Unit.INCH) + Unit.INCH.abbr());
  }
  
  public static String convertPXToCM(double length)
  {
    String indent = length + Unit.PIXEL.abbr();
    return (Length.parseDouble(indent, Unit.CENTIMETER) + Unit.CENTIMETER.abbr());
  }
  
  public static String getStyleName(OdfStyleFamily odfStyleFamily, String prefix)
  {
    if (prefix == null || "".equals(prefix))
    {
      prefix = String.valueOf(odfStyleFamily.getName().charAt(0)).toUpperCase();
    }
    return prefix + "_" + r.nextInt(Integer.MAX_VALUE);
  }
  
  public static OdfStyle createOdfStyle(ConversionContext context)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("Target");
    OdfStyle style = null;
    try
    {
      style = new OdfStyle(contentDom);
    }
    catch (Exception e)
    {
    }
    return style;
  }
  
//if the cell count of each row is less than maxCellCount,then add default cells
  public static void fillRow(TransformerHandler mXmlWriter,int cellCount, int maxCellCount)
  {
  	int sparedCellSize = maxCellCount - cellCount;
    if (sparedCellSize > 0)
    {
      AttributesImpl attrs = new AttributesImpl();
      attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_COLUMNS_REPEATED, "", Integer.toString(sparedCellSize));
      try
      {
        mXmlWriter.startElement("", "", ConversionConstant.ODF_ELEMENT_TABLETABLE_CELL, attrs);
        mXmlWriter.endElement("", "", ConversionConstant.ODF_ELEMENT_TABLETABLE_CELL);
      }
      catch (SAXException e)
      {
      }
      
    }
  }

  public static Boolean hasSupportStyle(ConversionContext context, String odfStyleName)
  {
    OdfStyle odfStyle = com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil.getOldStyle(context, odfStyleName, OdfStyleFamily.TableCell);
    if(odfStyle == null){
      LOG.log(Level.WARNING, "can not find odf style with styleName : {0}", odfStyleName);
      return false;
    }
    
    Map<OdfStyleProperty, String> styles = odfStyle.getStyleProperties();
    // text properties
    String fontName = styles.get(OdfStyleTextProperties.FontName);
    if (fontName != null && !fontName.equals(ConversionConstant.DEFAULT_FONT_NAME))
      return true;
    // TODO:fontsize must be "pt" ? String or int
    String fontSize = styles.get(OdfStyleTextProperties.FontSize);
    if (fontSize != null)
    {
      double fSize = Length.parseDouble(fontSize, Unit.POINT);
      if(fSize != ConversionConstant.DEFAULT_FONT_SIZE)
        return true;
    }
    String fontColor = styles.get(OdfStyleTextProperties.Color);
    if (fontColor != null && !fontColor.equals(ConversionConstant.DEFAULT_BLACK_COLOR_VALUE))
      return true;
    String italiaStyle = styles.get(OdfStyleTextProperties.FontStyle);
    if (italiaStyle != null && italiaStyle.equalsIgnoreCase("italic"))
      return true;
    String underlineStyle = styles.get(OdfStyleTextProperties.TextUnderlineStyle);
    if (underlineStyle != null && !underlineStyle.equalsIgnoreCase("none"))
      return true;
    String strikeThroughStyle = styles.get(OdfStyleTextProperties.TextLineThroughStyle);
    if (strikeThroughStyle != null && !strikeThroughStyle.equalsIgnoreCase("none"))
      return true;
    String boldStyle = styles.get(OdfStyleTextProperties.FontWeight);
    if (boldStyle != null && boldStyle.equalsIgnoreCase("bold"))
      return true;
    // border properties
    String borderStyle = styles.get(OdfStyleTableCellProperties.Border);
    if (borderStyle != null && !borderStyle.equalsIgnoreCase("none"))
      return true;
    String borderLeftStyle = styles.get(OdfStyleTableCellProperties.BorderLeft);
    if (borderLeftStyle != null && !borderLeftStyle.equalsIgnoreCase("none"))
      return true;
    String borderRightStyle = styles.get(OdfStyleTableCellProperties.BorderRight);
    if (borderRightStyle != null && !borderRightStyle.equalsIgnoreCase("none"))
      return true;
    String borderTopStyle = styles.get(OdfStyleTableCellProperties.BorderTop);
    if (borderTopStyle != null && !borderTopStyle.equalsIgnoreCase("none"))
      return true;
    String borderBottomStyle = styles.get(OdfStyleTableCellProperties.BorderBottom);
    if (borderBottomStyle != null && !borderBottomStyle.equalsIgnoreCase("none"))
      return true;
    // others
    if(odfStyle.hasProperty(OdfStyleParagraphProperties.MarginLeft))
      return true;
    String backgroundColor = odfStyle.getProperty(OdfStyleTableCellProperties.BackgroundColor);
    if(backgroundColor != null && !backgroundColor.equals(ConversionConstant.DEFAULT_WHITE_COLOR_VALUE))
        return true;
    String wrap = odfStyle.getProperty(OdfStyleTableCellProperties.WrapOption);
    if (wrap != null && wrap.equalsIgnoreCase("wrap"))
      return true;
    String textAlign = odfStyle.getProperty(OdfStyleParagraphProperties.TextAlign);
    if(textAlign != null)
      return true;
	String verticalAlign = odfStyle.getProperty(OdfStyleTableCellProperties.VerticalAlign);
	if(verticalAlign != null)
	  return true;
    // number format
    String formatStyleName = odfStyle.getStyleDataStyleNameAttribute();
    if(formatStyleName != null)
      return true;
    return false;
  }
  
  // border properties is not convert
  // number format is not convert
  // convert odf style to cellStyleType, except the format style,
  // because for export, if the cell style has the format style, it will rewrite by FormatStyleConverter
  // returned cellStyleType does not have styleId, because we only care about the cell style content
  public static ConversionUtil.CellStyleType convertStyle(ConversionContext context, String odfStyleName)
  {
    OdfStyle odfStyle = com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil.getOldStyle(context, odfStyleName, OdfStyleFamily.TableCell);
    if(odfStyle == null){
      return null;
    }
    ConversionUtil.CellStyleType cellStyle = new ConversionUtil.CellStyleType();
    // text properties
    String fontName = odfStyle.getProperty(OdfStyleTextProperties.FontName);
    if (fontName != null)
      cellStyle.fontName = fontName;
    // TODO:fontsize must be "pt" ? String or int
    String fontSize = odfStyle.getProperty(OdfStyleTextProperties.FontSize);
    if (fontSize != null)
    {
      cellStyle.fontSize = Length.parseDouble(fontSize, Unit.POINT);
    }
    String fontColor = odfStyle.getProperty(OdfStyleTextProperties.Color);
    if (fontColor != null )
      cellStyle.fontColor = fontColor;
    String italiaStyle = odfStyle.getProperty(OdfStyleTextProperties.FontStyle);
    if (italiaStyle != null )
      cellStyle.fontItalic = italiaStyle.equalsIgnoreCase("italic");
    String underlineStyle = odfStyle.getProperty(OdfStyleTextProperties.TextUnderlineStyle);
    if (underlineStyle != null)
      cellStyle.fontUnderline = !underlineStyle.equalsIgnoreCase("none");
    String strikeThroughStyle = odfStyle.getProperty(OdfStyleTextProperties.TextLineThroughStyle);
    if (strikeThroughStyle != null)
      cellStyle.fontStrikeThrough = !strikeThroughStyle.equalsIgnoreCase("none");
    String boldStyle = odfStyle.getProperty(OdfStyleTextProperties.FontWeight);
    if (boldStyle != null)
      cellStyle.fontBold = boldStyle.equalsIgnoreCase("bold");
    
    // others
    String marginLeft = odfStyle.getProperty(OdfStyleParagraphProperties.MarginLeft);
    if (marginLeft != null)
    {
      cellStyle.indent = PositiveLength.parseInt(marginLeft, Unit.PIXEL);
    }
    // TODO: the unit of color? RGB or int
    String backgroundColor = odfStyle.getProperty(OdfStyleTableCellProperties.BackgroundColor);
    if (backgroundColor != null)
      cellStyle.backgroundColor = backgroundColor;
    String wrap = odfStyle.getProperty(OdfStyleTableCellProperties.WrapOption);
    if (wrap != null)
      cellStyle.wraptext = wrap.equalsIgnoreCase("wrap");
    
    String textAlign = odfStyle.getProperty(OdfStyleParagraphProperties.TextAlign);
    if (textAlign != null)
    {
      if (textAlign.equalsIgnoreCase("start"))
        textAlign = "left";
      else if (textAlign.equalsIgnoreCase("end"))
        textAlign = "right";
      cellStyle.textAlign = textAlign;
    }
	String verticalAlign = odfStyle.getProperty(OdfStyleTableCellProperties.VerticalAlign);
	if(verticalAlign != null)
	  cellStyle.verticalAlign = verticalAlign;
    return cellStyle;
  }
}
