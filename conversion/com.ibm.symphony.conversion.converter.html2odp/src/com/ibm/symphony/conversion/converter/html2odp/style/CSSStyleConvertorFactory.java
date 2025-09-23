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
import java.util.Map;

import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;

public class CSSStyleConvertorFactory
{
  public final static CSSStyleConvertorFactory instance = new CSSStyleConvertorFactory();

  private static CSSStyleConvertor GeneralCSSStyleConvertor = new GeneralCSSStyleConvertor();

  // Default Initial Capacity for the Convertor HashMap
  private static final int CONVERTOR_MAP_CAPACITY = (int) (8 * 1.33) + 1;

  private static Map<OdfStyleFamily, CSSStyleConvertor> convertorMap = new HashMap<OdfStyleFamily, CSSStyleConvertor>(
      CONVERTOR_MAP_CAPACITY);

  static
  {
    // Add Convertors here - If adding, please update the initial capacity
    convertorMap.put(OdfStyleFamily.Text, new TextStyleConvertor());
    convertorMap.put(OdfStyleFamily.Paragraph, new ParagraphStyleConvertor());
    convertorMap.put(OdfStyleFamily.Graphic, new GraphicStyleConvertor());
    convertorMap.put(OdfStyleFamily.Table, new TableStyleConvertor());
    convertorMap.put(OdfStyleFamily.TableCell, new TableCellStyleConvertor());
    convertorMap.put(OdfStyleFamily.TableRow, new TableRowStyleConvertor());
    convertorMap.put(OdfStyleFamily.TableColumn, new TableColumnStyleConvertor());
    convertorMap.put(OdfStyleFamily.DrawingPage, new DrawingPageStyleConvertor());
  }

  public static CSSStyleConvertorFactory getInstance()
  {
    return instance;
  }

  public CSSStyleConvertor getConvertor(OdfStyleFamily family)
  {
    CSSStyleConvertor convertor = convertorMap.get(family);
    if (convertor != null)
      return convertor;
    return GeneralCSSStyleConvertor;
  }
}
