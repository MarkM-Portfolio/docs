/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.html;

import java.util.HashMap;
import java.util.Map;

import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.IConvertorFactory;

public class XMLConvertorFactory implements IConvertorFactory
{

  private static IConvertorFactory instance = new XMLConvertorFactory();

  private static IConvertor GENERAL_XML_CONVERTOR = new GeneralXMLConvertor();

  private static Map<String, IConvertor> convertorMap = new HashMap<String, IConvertor>();
  static
  {
    // add Convertors here
    convertorMap.put(HtmlCSSConstants.UL, new ULConvertor());
    convertorMap.put(HtmlCSSConstants.OL, new OLConvertor());
    convertorMap.put(HtmlCSSConstants.LI, new LIConvertor());
    convertorMap.put(HtmlCSSConstants.DIV, new DIVConvertor());
    convertorMap.put(HtmlCSSConstants.BODY, new BodyConvertor());
    convertorMap.put(HtmlCSSConstants.H, new HeadingConvertor());
    convertorMap.put(HtmlCSSConstants.P, new ParagraphConvertor());
    convertorMap.put(HtmlCSSConstants.IMG, new ImageConvertor());
    convertorMap.put(HtmlCSSConstants.SHAPE, new ShapeConvertor());
    convertorMap.put(HtmlCSSConstants.BR, new BRConvertor());
    convertorMap.put(HtmlCSSConstants.TABLE, new TableConvertor());
    convertorMap.put(HtmlCSSConstants.TR, new TableRowConvertor());
    convertorMap.put(HtmlCSSConstants.TD, new TableCellConvertor());
    convertorMap.put(HtmlCSSConstants.TH, new TableCellConvertor());
    convertorMap.put(HtmlCSSConstants.COL, new TableColumnConvertor());    
    convertorMap.put(HtmlCSSConstants.A, new AnchorConvertor());
    convertorMap.put(HtmlCSSConstants.HR, new HRConvertor());
    convertorMap.put(HtmlCSSConstants.SPAN, new SpanConvertor());
    convertorMap.put(HtmlCSSConstants.CAPTION, new CaptionConvertor());
    convertorMap.put(Constants.PAGE_NUMBER_CLASS, new PageNumberConvertor());
    convertorMap.put(Constants.DATE_TIME_CLASS, new DateTimeConvertor());
    convertorMap.put(Constants.TEXT_SEQUENCE_CLASS, new TextSequenceConvertor());
    convertorMap.put(Constants.HEADER_FOOTER, new HeaderFooterConvertor());
  }

  public static IConvertorFactory getInstance()
  {
    return instance;
  }

  public IConvertor getConvertor(Object input)
  {
    IConvertor convertor = null;

    if (input instanceof Node)
    {
      Node node = (Node) input;
      String nodeName = node.getNodeName();
      convertor = convertorMap.get(nodeName);
      if (convertor != null)
        return convertor;

      if ((nodeName.length() == 2) && nodeName.startsWith(HtmlCSSConstants.H))
      {
        String lastChar = nodeName.substring(1);
        try
        {
          Integer.parseInt(lastChar);
        }
        catch (NumberFormatException e)
        {
          return GENERAL_XML_CONVERTOR;
        }
        convertor = convertorMap.get(HtmlCSSConstants.H);
        return convertor;
      }
    }
    else
    {
      convertor = convertorMap.get(input);
      return convertor;
    }

    return GENERAL_XML_CONVERTOR;
  }

}
