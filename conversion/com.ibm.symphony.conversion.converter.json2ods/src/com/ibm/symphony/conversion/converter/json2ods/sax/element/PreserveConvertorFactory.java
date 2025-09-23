/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import com.ibm.symphony.conversion.converter.json2ods.sax.IConvertor;
import com.ibm.symphony.conversion.converter.json2ods.sax.IConvertorFactory;
import com.ibm.symphony.conversion.spreadsheet.XMLUtil;
import com.ibm.symphony.conversion.spreadsheet.XMLUtil.NODENAME;

public class PreserveConvertorFactory implements IConvertorFactory
{
  private static PreserveConvertorFactory instance = new PreserveConvertorFactory();
  
  public static PreserveConvertorFactory getInstance()
  {
    return instance;
  }
  
  public IConvertor getConvertor(Object input)
  {
    String qName = (String) input;
    NODENAME nodeName = XMLUtil.getXMLToken(qName);
    IConvertor convertor = null;
    switch(nodeName)
    {
      case TABLE_NAMED_EXPRESSION:
        convertor = new NamedExpressionConvertor();
        break;  
      case TABLE_TABLE_DATABASE_RANGES:
        convertor = new TableDataRangesPreserveConverter();
        break;     
      case TABLE_TABLE_FILTER_CONDITION:
        convertor = new TableFilterConditionPreserveConverter();
        break;
      case DRAW_FRAME:
        convertor = new DrawFramePreserveConvertor();
        break;
      case DRAW_A:
        convertor = new DrawAPreserveConvertor();
        break;        
      default:
        convertor = new GeneralPreserveConvertor();
        break;
    }
    return convertor;
  }

}
