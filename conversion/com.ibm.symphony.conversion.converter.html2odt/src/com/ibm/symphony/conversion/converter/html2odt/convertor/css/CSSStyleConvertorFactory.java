/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.css;

import java.util.HashMap;
import java.util.Map;

import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;


public class CSSStyleConvertorFactory
{
  public final static CSSStyleConvertorFactory instance = new CSSStyleConvertorFactory();
  private static ICSSStyleConvertor GeneralCSSStyleConvertor = new GeneralCSSStyleConvertor();
  private static Map<OdfStyleFamily, ICSSStyleConvertor> convertorMap = new HashMap<OdfStyleFamily, ICSSStyleConvertor>();

  static
  {
    // add Convertors here
    convertorMap.put(OdfStyleFamily.Text, new TextStyleConvertor());
    convertorMap.put(OdfStyleFamily.Paragraph, new ParagraphStyleConvertor());
    convertorMap.put(OdfStyleFamily.Graphic, new GraphicStyleConvertor());
    convertorMap.put(OdfStyleFamily.Table, new TableStyleConvertor());
    convertorMap.put(OdfStyleFamily.TableCell, new TableCellStyleConvertor());
    convertorMap.put(OdfStyleFamily.TableRow, new TableRowStyleConvertor());
    convertorMap.put(OdfStyleFamily.TableColumn, new TableColumnStyleConvertor());
    
  }

  public static CSSStyleConvertorFactory getInstance()
  {
    return instance;
  }

  public ICSSStyleConvertor getConvertor(OdfStyleFamily family)
  {
    ICSSStyleConvertor convertor =  convertorMap.get(family);
    if(convertor != null)
      return convertor;
    return GeneralCSSStyleConvertor;
  }

}
