/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.css.propertyConvertors;

import java.util.HashMap;
import java.util.Map;

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleParagraphProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableCellProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableColumnProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableRowProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;

import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class GeneralCSSPropertyConvertor implements ICSSPropertyConvertor
{
  public final static Map<String, OdfStyleProperty> TEXT_STYLE_NAME_PROR_MAP = new HashMap<String, OdfStyleProperty>();

  public final static Map<String, OdfStyleProperty> PARAGRAPH_STYLE_NAME_PROR_MAP = new HashMap<String, OdfStyleProperty>();
  
  public final static Map<String, OdfStyleProperty> GRAPHIC_STYLE_NAME_PROR_MAP = new HashMap<String, OdfStyleProperty>();
  
  public final static Map<String, OdfStyleProperty> SHAPE_STYLE_NAME_PROR_MAP = new HashMap<String, OdfStyleProperty>();

  public final static Map<String, OdfStyleProperty> TABLE_STYLE_NAME_PROR_MAP = new HashMap<String, OdfStyleProperty>();

  public final static Map<String, OdfStyleProperty> TABLE_CELL_STYLE_NAME_PROR_MAP = new HashMap<String, OdfStyleProperty>();

  public final static Map<String, OdfStyleProperty> TABLE_ROW_STYLE_NAME_PROR_MAP = new HashMap<String, OdfStyleProperty>();

  public final static Map<String, OdfStyleProperty> TABLE_COL_STYLE_NAME_PROR_MAP = new HashMap<String, OdfStyleProperty>();

  static
  {
    TEXT_STYLE_NAME_PROR_MAP.put("fo:font-size", OdfStyleTextProperties.FontSize);
    TEXT_STYLE_NAME_PROR_MAP.put("fo:background-color", OdfStyleTextProperties.BackgroundColor);
    TEXT_STYLE_NAME_PROR_MAP.put("fo:color", OdfStyleTextProperties.Color);
    TEXT_STYLE_NAME_PROR_MAP.put("fo:text-shadow", OdfStyleTextProperties.TextShadow);
    TEXT_STYLE_NAME_PROR_MAP.put("fo:font-variant", OdfStyleTextProperties.FontVariant);
    TEXT_STYLE_NAME_PROR_MAP.put("fo:text-transform", OdfStyleTextProperties.TextTransform);
    TEXT_STYLE_NAME_PROR_MAP.put("style:font-size-asian", OdfStyleTextProperties.FontSizeAsian);
    TEXT_STYLE_NAME_PROR_MAP.put("style:font-size-complex", OdfStyleTextProperties.FontCharsetComplex);
    TEXT_STYLE_NAME_PROR_MAP.put("style:font-name", OdfStyleTextProperties.FontName);
    TEXT_STYLE_NAME_PROR_MAP.put("style:use-window-font-color", OdfStyleTextProperties.UseWindowFontColor);
    TEXT_STYLE_NAME_PROR_MAP.put("style:text-blinking", OdfStyleTextProperties.TextBlinking);
    TEXT_STYLE_NAME_PROR_MAP.put("text:display", OdfStyleTextProperties.Display);
    TEXT_STYLE_NAME_PROR_MAP.put("fo:letter-spacing", OdfStyleTextProperties.LetterSpacing);

    // paragraph may contains text properties
    PARAGRAPH_STYLE_NAME_PROR_MAP.putAll(TEXT_STYLE_NAME_PROR_MAP);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:padding", OdfStyleParagraphProperties.Padding);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:padding-top", OdfStyleParagraphProperties.PaddingTop);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:padding-bottom", OdfStyleParagraphProperties.PaddingBottom);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:padding-left", OdfStyleParagraphProperties.PaddingLeft);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:padding-right", OdfStyleParagraphProperties.PaddingRight); 
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:text-align", OdfStyleParagraphProperties.TextAlign);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:margin-left", OdfStyleParagraphProperties.MarginLeft);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:margin-right", OdfStyleParagraphProperties.MarginRight);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:margin-top", OdfStyleParagraphProperties.MarginTop);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:margin-bottom", OdfStyleParagraphProperties.MarginBottom);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:margin", OdfStyleParagraphProperties.Margin);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:text-indent", OdfStyleParagraphProperties.TextIndent);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:line-height", OdfStyleParagraphProperties.LineHeight);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:border-top", OdfStyleParagraphProperties.BorderTop);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:border-bottom", OdfStyleParagraphProperties.BorderBottom);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:border-left", OdfStyleParagraphProperties.BorderLeft);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:border-right", OdfStyleParagraphProperties.BorderRight);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:border", OdfStyleParagraphProperties.Border);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("style:border-line-width", OdfStyleParagraphProperties.BorderLineWidth);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("style:border-line-width-top", OdfStyleParagraphProperties.BorderLineWidthTop);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("style:border-line-width-bottom", OdfStyleParagraphProperties.BorderLineWidthBottom);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("style:border-line-width-left", OdfStyleParagraphProperties.BorderLineWidthLeft);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("style:border-line-width-right", OdfStyleParagraphProperties.BorderLineWidthRight);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:background-color", OdfStyleParagraphProperties.BackgroundColor);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("fo:break-before", OdfStyleParagraphProperties.BreakBefore);
    PARAGRAPH_STYLE_NAME_PROR_MAP.put("writing-mode", OdfStyleParagraphProperties.WritingMode);
    
    //GRAPHIC
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:border-top", OdfStyleGraphicProperties.BorderTop);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:border-bottom", OdfStyleGraphicProperties.BorderBottom);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:border-left", OdfStyleGraphicProperties.BorderLeft);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:border-right", OdfStyleGraphicProperties.BorderRight);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:border", OdfStyleGraphicProperties.Border);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("style:border-line-width", OdfStyleGraphicProperties.BorderLineWidth);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("style:border-line-width-top", OdfStyleGraphicProperties.BorderLineWidthTop);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("style:border-line-width-bottom", OdfStyleGraphicProperties.BorderLineWidthBottom);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("style:border-line-width-left", OdfStyleGraphicProperties.BorderLineWidthLeft);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("style:border-line-width-right", OdfStyleGraphicProperties.BorderLineWidthRight);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:padding", OdfStyleGraphicProperties.Padding);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:padding-top", OdfStyleGraphicProperties.PaddingTop);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:padding-bottom", OdfStyleGraphicProperties.PaddingBottom);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:padding-left", OdfStyleGraphicProperties.PaddingLeft);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:padding-right", OdfStyleGraphicProperties.PaddingRight);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:margin-left", OdfStyleGraphicProperties.MarginLeft);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:margin-right", OdfStyleGraphicProperties.MarginRight);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:margin-top", OdfStyleGraphicProperties.MarginTop);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:margin-bottom", OdfStyleGraphicProperties.MarginBottom);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:margin", OdfStyleGraphicProperties.Margin);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("svg:x", OdfStyleGraphicProperties.X);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("svg:y", OdfStyleGraphicProperties.Y);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("svg:width", OdfStyleGraphicProperties.Width);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("svg:height", OdfStyleGraphicProperties.Height);
    GRAPHIC_STYLE_NAME_PROR_MAP.put("fo:background-color", OdfStyleGraphicProperties.BackgroundColor);
      
    //shape properties
    SHAPE_STYLE_NAME_PROR_MAP.put("draw:fill-color", OdfStyleGraphicProperties.FillColor);
    SHAPE_STYLE_NAME_PROR_MAP.put("draw:textarea-vertical-align", OdfStyleGraphicProperties.TextareaVerticalAlign);
    SHAPE_STYLE_NAME_PROR_MAP.put("fo:wrap-option", OdfStyleGraphicProperties.WrapOption);
    
    //table properties
    TABLE_STYLE_NAME_PROR_MAP.put("style:width", OdfStyleTableProperties.Width);
    TABLE_STYLE_NAME_PROR_MAP.put("table:align", OdfStyleTableProperties.Align);
    TABLE_STYLE_NAME_PROR_MAP.put("table:display", OdfStyleTableProperties.Display);
    TABLE_STYLE_NAME_PROR_MAP.put("fo:margin", OdfStyleTableProperties.Margin);
    TABLE_STYLE_NAME_PROR_MAP.put("fo:margin-left", OdfStyleTableProperties.MarginLeft);
    TABLE_STYLE_NAME_PROR_MAP.put("fo:margin-right", OdfStyleTableProperties.MarginRight);
    TABLE_STYLE_NAME_PROR_MAP.put("fo:margin-top", OdfStyleTableProperties.MarginTop);
    TABLE_STYLE_NAME_PROR_MAP.put("fo:margin-bottom", OdfStyleTableProperties.MarginBottom);
    TABLE_STYLE_NAME_PROR_MAP.put("fo:break-before", OdfStyleTableProperties.BreakBefore);
    TABLE_STYLE_NAME_PROR_MAP.put("fo:background-color", OdfStyleTableProperties.BackgroundColor);
    TABLE_STYLE_NAME_PROR_MAP.put("table:border-model", OdfStyleTableProperties.BorderModel);
    TABLE_STYLE_NAME_PROR_MAP.put("writing-mode", OdfStyleTableProperties.WritingMode);
    //table cell properties
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:background-color", OdfStyleTableCellProperties.BackgroundColor);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:border", OdfStyleTableCellProperties.Border);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:border-left", OdfStyleTableCellProperties.BorderLeft);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:border-bottom", OdfStyleTableCellProperties.BorderBottom);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:border-right", OdfStyleTableCellProperties.BorderRight);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:border-top", OdfStyleTableCellProperties.BorderTop);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:padding", OdfStyleTableCellProperties.Padding);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:padding-right", OdfStyleTableCellProperties.Padding);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:padding-bottom", OdfStyleTableCellProperties.PaddingBottom);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:padding-left", OdfStyleTableCellProperties.PaddingLeft);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:padding-right", OdfStyleTableCellProperties.PaddingRight);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:padding-top", OdfStyleTableCellProperties.PaddingTop);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("style:vertical-align", OdfStyleTableCellProperties.VerticalAlign);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("style:writing-mode", OdfStyleTableCellProperties.WritingMode);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("style:border-line-width", OdfStyleTableCellProperties.BorderLineWidth);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("style:border-line-width-bottom", OdfStyleTableCellProperties.BorderLineWidthBottom);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("style:border-line-width-left", OdfStyleTableCellProperties.BorderLineWidthLeft);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("style:border-line-width-right", OdfStyleTableCellProperties.BorderLineWidthRight);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("style:border-line-width-top", OdfStyleTableCellProperties.BorderLineWidthTop);
    TABLE_CELL_STYLE_NAME_PROR_MAP.put("fo:text-align", OdfStyleParagraphProperties.TextAlign);

    //table row properties
    TABLE_ROW_STYLE_NAME_PROR_MAP.put("style:min-row-height", OdfStyleTableRowProperties.MinRowHeight);

    //table col properties
    TABLE_COL_STYLE_NAME_PROR_MAP.put("style:column-width", OdfStyleTableColumnProperties.ColumnWidth);
    TABLE_COL_STYLE_NAME_PROR_MAP.put("style:rel-column-width", OdfStyleTableColumnProperties.RelColumnWidth);

  }

  public void convert(ConversionContext context, OdfStyle style, Map<String, String> htmlStyle, String name, String value)
  {
    Object odfName = CSSUtil.getODFName(style.getFamily(),name);
    if (odfName != null)
    {
      Map <String, OdfStyleProperty> propertyMap = getPropertyMap(style.getFamily());
      if(propertyMap !=null)
      {
        OdfStyleProperty odfProp = propertyMap.get(odfName);
        if (odfProp != null)
        {
          String odfValue = CSSUtil.convertHtmlStyleValue(odfProp, value);
          if (odfValue != null)
          {
            style.setProperty(odfProp, odfValue);
          }
        }
        else
        {
          // Don't append a warning, maybe paragraph or other style
          // XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_STYLE, name + " is not converted.");
        }        
      }
    }
    if(style.getFamily().equals(OdfStyleFamily.Graphic))
    {
      Map <String, OdfStyleProperty> propertyMap = SHAPE_STYLE_NAME_PROR_MAP;
      OdfStyleProperty odfProp = propertyMap.get(name);
      if (odfProp != null)
      {
        String odfValue = CSSUtil.convertHtmlStyleValue(odfProp, value);
        if (odfValue != null)
        {
          style.setProperty(odfProp, odfValue);
        }
      }
    }
  }
  
  protected OdfStyleProperty getPropertyName(OdfStyle style, String odfName)
  {
	  return getPropertyMap(style.getFamily()).get(odfName);
  }

  public static Map<String, OdfStyleProperty> getPropertyMap(OdfStyleFamily family)
  {
    Map<String, OdfStyleProperty> rs = null;
    if (OdfStyleFamily.Text.equals(family))
    {
      rs = TEXT_STYLE_NAME_PROR_MAP;
    }
    else if (OdfStyleFamily.Paragraph.equals(family))
    {
      rs = PARAGRAPH_STYLE_NAME_PROR_MAP;
    }
    else if (OdfStyleFamily.Graphic.equals(family))
    {
      rs = GRAPHIC_STYLE_NAME_PROR_MAP;
    }
    else if (OdfStyleFamily.Table.equals(family))
    {
      rs = TABLE_STYLE_NAME_PROR_MAP;
    }
    else if (OdfStyleFamily.TableCell.equals(family))
    {
      rs = TABLE_CELL_STYLE_NAME_PROR_MAP;
    }
    else if (OdfStyleFamily.TableRow.equals(family))
    {
      rs = TABLE_ROW_STYLE_NAME_PROR_MAP;
    }
    else if (OdfStyleFamily.TableColumn.equals(family))
    {
      rs = TABLE_COL_STYLE_NAME_PROR_MAP;
    }
    
    return rs;
  }

}
