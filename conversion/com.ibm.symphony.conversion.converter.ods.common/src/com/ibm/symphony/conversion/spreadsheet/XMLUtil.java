/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet;

import java.util.HashMap;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;

import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

public class XMLUtil
{
  private static final String CLAZZ = XMLUtil.class.getName();

  private static final Logger LOG = Logger.getLogger(CLAZZ);

  public static enum NODENAME {
    CHART_PLOT_AREA, // ConversionConstant.ODF_ELEMENT_CHART_PLOT_AREA,
    CHART_CHART, // ConversionConstant.ODF_ELEMENT_CHART_CHART,
    // OFFICE_ANNOTATION,
    AUTOMATIC_STYLES, // ConversionConstant.ODF_ELEMENT_OFFICE_AUTOMATIC_STYLES,
    OFFICE_BODY, // ConversionConstant.ODF_ELEMENT_OFFICE_BODY,
    OFFICE_CHART, // ConversionConstant.ODF_ELEMENT_OFFICE_CHART,
    DOCUMENT_CONTENT, // ConversionConstant.ODF_ELEMENT_OFFICE_DOCUMENT_CONTENT,
    DOCUMENT_STYLES, // ConversionConstant.ODF_ELEMENT_OFFICE_DOCUMENT_STYLES,
    FONT_DECLS, // ConversionConstant.ODF_ELEMENT_OFFICE_FONT_DECLS,
    SCRIPTS, // ConversionConstant.ODF_ELEMENT_OFFICE_SCRIPTS,
    SPREADSHEET, // ConversionConstant.ODF_ELEMENT_OFFICE_SPREADSHEET,
    DRAW_A,// ConversionConstant.ODF_ELEMENT_DRAW_A,
    DRAW_FRAME,  //ConversionConstant.ODF_ELEMENT_DRAW_FRAME,     
    DRAW_IMAGE, // ConversionConstant.ODF_ELEMENT_DRAW_IMAGE,
    SVG_TITLE, //ConversionConstant.ODF_ELEMENT_SVG_TITLE,
    DRAW_OBJECT, // ConversionConstant.ODF_ELEMENT_DRAW_OBJECT,
    STYLES, // ConversionConstant.ODF_ELEMENT_OFFICE_STYLES,
    STYLE_FONT_FACE, // ConversionConstant.ODF_ELEMENT_STYLE_FONT_FACE,
    TABLE_SHAPES, // ConversionConstant.ODF_ELEMENT_TABLESHAPES,
    TABLE_TABLE, // ConversionConstant.ODF_ELEMENT_TABLETABLE,
    TABLE_COVERED_TABLE_CELL, // ConversionConstant.ODF_ELEMENT_TABLECONVEREDTABLE_CELL,
    TABLE_TABLE_CELL, // ConversionConstant.ODF_ELEMENT_TABLETABLE_CELL,
    TABLE_TABLE_COLUMN, // ConversionConstant.ODF_ELEMENT_TABLETABLE_COLUMN,
    TABLE_TABLE_COLUMNS, // ConversionConstant.ODF_ELEMENT_TABLE_TABLE_COLUMNS,
    TABLE_TABLE_COLUMN_GROUP, // ConversionConstant.ODF_ELEMENT_TABLE_COLUMN_GROUP,
    TABLE_TABLE_ROW, // ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW,
    TABLE_NAMED_EXPRESSION, // ConversionConstant.ODF_ELEMENT_NAMED_EXPRESSION,
    TABLE_NAMED_EXPRESSIONS, // ConversionConstant.ODF_ELEMENT_NAMED_EXPRESSIONS,
    TABLE_TABLE_HEADER_COLUMNS, // ConversionConstant.ODF_ELEMENT_TABLE_TABLE_HEADER_COLUMNS,
    TABLE_TABLE_HEADER_ROWS, // ConversionConstant.ODF_ELEMENT_TABLE_TABLE_HEADER_ROWS,
    TABLE_NAMED_RANGE, // ConversionConstant.ODF_ELEMENT_NAMED_RANGE,
    TABLE_TABLE_ROWS, // ConversionConstant.ODF_ELEMENT_TABLE_TABLE_ROWS,
    TABLE_TABLE_ROW_GROUP, // ConversionConstant.ODF_ELEMENT_TABLE_ROW_GROUP,
    TEXT_H, // ConversionConstant.ODF_ELEMENT_TEXT_H,
    TEXT_P, // ConversionConstant.ODF_ELEMENT_TEXT_P,
    TABLE_TABLE_FILTER_CONDITION, //ConversionConstant.ODF_ELEMENT_TABLE_TABLE_FILTER_CONDITION
    TABLE_TABLE_FILTER, // ConversionConstant.ODF_ELEMENT_TABLE_TABLE_FILTER, 
    TABLE_TABLE_DATABASE_RANGE, // ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGE,  
    TABLE_TABLE_DATABASE_RANGES, // ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES,      
    TABLE_CONTENT_VALIDATIONS, //ConversionConstant.ODF_ELEMENT_TABLE_CONTENT_VALIDATIONS
    TABLE_CONTENT_VALIDATION, //ConversionConstant.ODF_ELEMENT_TABLE_CONTENT_VALIDATION
    TABLE_HELP_MESSAGE, //ConversionConstant.ODF_ELEMENT_TABLE_TABLE_HELP_MESSAGE 
    TABLE_ERROR_MESSAGE, //ConversionConstant.ODF_ELEMENT_TABLE_TABLE_ERROR_MESSAGE 
    OFFICE_ANNOTATION,
    OFFICE_SPREADSHEET,
    DEFAULTNAME;
  }

  public static enum ATTRNAME {
    TABLE_VISIBILITY, TABLE_FORMULA, OFFICE_VALUE_TYPE, FO_BORDER, FO_BORDER_LEFT, FO_BORDER_RIGHT, FO_BORDER_TOP, FO_BORDER_BOTTOM, DEFAULTNAME;
  }

  // pls put it by alphabetic order
  private static String nodeNames[] = new String[] {
      ConversionConstant.ODF_ELEMENT_CHART_PLOT_AREA,
      ConversionConstant.ODF_ELEMENT_CHART_CHART,
      // ConversionConstant.ODF_ELEMENT_OFFICE_ANNONATION,
      ConversionConstant.ODF_ELEMENT_OFFICE_AUTOMATIC_STYLES, ConversionConstant.ODF_ELEMENT_OFFICE_BODY,
      ConversionConstant.ODF_ELEMENT_OFFICE_CHART, ConversionConstant.ODF_ELEMENT_OFFICE_DOCUMENT_CONTENT,
      ConversionConstant.ODF_ELEMENT_OFFICE_DOCUMENT_STYLES, ConversionConstant.ODF_ELEMENT_OFFICE_FONT_DECLS,
      ConversionConstant.ODF_ELEMENT_OFFICE_SCRIPTS, ConversionConstant.ODF_ELEMENT_OFFICE_SPREADSHEET,
      ConversionConstant.ODF_ELEMENT_DRAW_A,ConversionConstant.ODF_ELEMENT_DRAW_FRAME,     
      ConversionConstant.ODF_ELEMENT_DRAW_IMAGE,ConversionConstant.ODF_ELEMENT_SVG_TITLE,
      ConversionConstant.ODF_ELEMENT_DRAW_OBJECT, ConversionConstant.ODF_ELEMENT_OFFICE_STYLES,
      ConversionConstant.ODF_ELEMENT_STYLE_FONT_FACE, ConversionConstant.ODF_ELEMENT_TABLE_SHAPES,ConversionConstant.ODF_ELEMENT_TABLETABLE,
      ConversionConstant.ODF_ELEMENT_TABLECONVEREDTABLE_CELL, ConversionConstant.ODF_ELEMENT_TABLETABLE_CELL,
      ConversionConstant.ODF_ELEMENT_TABLETABLE_COLUMN, ConversionConstant.ODF_ELEMENT_TABLE_TABLE_COLUMNS,
      ConversionConstant.ODF_ELEMENT_TABLE_COLUMN_GROUP, ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW,
      ConversionConstant.ODF_ELEMENT_NAMED_EXPRESSION, ConversionConstant.ODF_ELEMENT_NAMED_EXPRESSIONS,
      ConversionConstant.ODF_ELEMENT_TABLE_TABLE_HEADER_COLUMNS, ConversionConstant.ODF_ELEMENT_TABLE_TABLE_HEADER_ROWS,
      ConversionConstant.ODF_ELEMENT_NAMED_RANGE, ConversionConstant.ODF_ELEMENT_TABLE_TABLE_ROWS,
      ConversionConstant.ODF_ELEMENT_TABLE_ROW_GROUP, ConversionConstant.ODF_ELEMENT_TEXT_H, ConversionConstant.ODF_ELEMENT_TEXT_P,
      ConversionConstant.ODF_ELEMENT_TABLE_TABLE_FILTER_CONDITION,ConversionConstant.ODF_ELEMENT_TABLE_TABLE_FILTER,
      ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGE, ConversionConstant.ODF_ELEMENT_TABLE_TABLE_DATABASE_RANGES,
      ConversionConstant.ODF_ELEMENT_TABLE_TABLE_CONTENT_VALIDATIONS, ConversionConstant.ODF_ELEMENT_TABLE_TABLE_CONTENT_VALIDATION,
      ConversionConstant.ODF_ELEMENT_TABLE_TABLE_HELP_MESSAGE,ConversionConstant.ODF_ELEMENT_TABLE_TABLE_ERROR_MESSAGE,
      ConversionConstant.ODF_ELEMENT_OFFICE_ANNONATION, ConversionConstant.ODF_ELEMENT_OFFICE_SPREADSHEET
  };

  private static String[] attrNames = { ConversionConstant.ODF_ATTRIBUTE_TABLE_VISIBILITY,
      ConversionConstant.ODF_ATTRIBUTE_TABLE_TABLE_FORMULA, ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_TYPE,
      ConversionConstant.ODF_ATTRIBUTE_FO_BORDER, ConversionConstant.ODF_ATTRIBUTE_FO_BORDER_LEFT,
      ConversionConstant.ODF_ATTRIBUTE_FO_BORDER_RIGHT, ConversionConstant.ODF_ATTRIBUTE_FO_BORDER_TOP,
      ConversionConstant.ODF_ATTRIBUTE_FO_BORDER_BOTTOM };

  public static enum VALUETYPE {
    BOOLEAN, STRING, CURRENCY, DATE, TIME, PERCENT, FLOAT, NUMBERS, FRACTION, SCIENTIFIC,TEXT;
  }

  private static String[] valueTypeArray = { ConversionConstant.BOOLEAN_TYPE, ConversionConstant.STRING_TYPE,
      ConversionConstant.CURRENCY_TYPE, ConversionConstant.DATE_TYPE, ConversionConstant.TIME_TYPE, ConversionConstant.PERCENTS_TYPE,
      ConversionConstant.FLOAT_TYPE,ConversionConstant.NUMBERS_TYPE,ConversionConstant.FRACTION_TYPE, ConversionConstant.SCIENTIFIC_TYPE, ConversionConstant.TEXT_TYPE };

  private static HashMap<String, VALUETYPE> valueTypes = new HashMap<String, VALUETYPE>();

  private static XMLTokenEntry entries[] = new XMLTokenEntry[] {
      new XMLTokenEntry(NODENAME.TABLE_TABLE_COLUMN, "table:style-name", OdfStyleFamily.TableColumn),
      new XMLTokenEntry(NODENAME.TABLE_TABLE_ROW, "table:style-name", OdfStyleFamily.TableRow) };

  private static HashMap<String, NODENAME> nodeTypes = new HashMap<String, NODENAME>();

  private static HashMap<String, ATTRNAME> attrTypes = new HashMap<String, ATTRNAME>();

  private static HashMap<NODENAME, XMLTokenEntry> xmlTokenMap = new HashMap<NODENAME, XMLTokenEntry>();
  static
  {
    int length = nodeNames.length;
    for (int i = 0; i < length; i++)
    {
      NODENAME enumName = NODENAME.values()[i];
      nodeTypes.put(nodeNames[i], enumName);
    }
    length = attrNames.length;
    for (int i = 0; i < length; i++)
    {
      attrTypes.put(attrNames[i], ATTRNAME.values()[i]);
    }
    length = entries.length;
    for (int i = 0; i < length; i++)
    {
      XMLTokenEntry entry = entries[i];
      xmlTokenMap.put(entry.mTokenName, entry);
    }

    length = valueTypeArray.length;

    for (int i = 0; i < length; i++)
    {
      VALUETYPE type = VALUETYPE.values()[i];
      valueTypes.put(valueTypeArray[i], type);
    }
  }

  public static XMLTokenEntry getXMLTokenEntry(String qName)
  {
    NODENAME token = getXMLToken(qName);
    return xmlTokenMap.get(token);
  }

  public static NODENAME getXMLToken(String qName)
  {
    NODENAME token = nodeTypes.get(qName);
    if (token == null)
      token = NODENAME.DEFAULTNAME;
    return token;
  }

  public static ATTRNAME getXMLAttrToken(String qName)
  {
    ATTRNAME token = attrTypes.get(qName);
    if (token == null)
      token = ATTRNAME.DEFAULTNAME;
    return token;
  }

  public static VALUETYPE getValueType(String valueType)
  {
    return valueTypes.get(valueType);
  }
}
