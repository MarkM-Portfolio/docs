/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.attribute;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;

public class AttributeConvertorFactory
{
  private static AttributeConvertorFactory instance = new AttributeConvertorFactory();

  public static AttributeConvertorFactory getInstance()
  {
    return instance;
  }
  
  public AttributeConvertor getConvertor(String key)
  {
    XMLUtil.ATTRNAME type = XMLUtil.getXMLAttrToken(key);
    AttributeConvertor convertor = null;
    switch(type)
    {
      case TABLE_VISIBILITY:
        convertor = new TableVisibilityConvertor(key);
        break;
      case TABLE_FORMULA:
        convertor = new TableFormulaConvertor(key);
        break;
      case OFFICE_VALUE_TYPE:
        convertor = new ValueTypeConvertor(key);
        break;
      case FO_BORDER:
        convertor = new BorderConvertor(key);
        break;
      case FO_BORDER_LEFT:
        convertor = new BorderConvertor(key);
        break;
      case FO_BORDER_RIGHT:  
        convertor = new BorderConvertor(key);
        break;
      case FO_BORDER_TOP: 
        convertor = new BorderConvertor(key);
        break;
      case FO_BORDER_BOTTOM:
        convertor = new BorderConvertor(key);
        break;
      case DEFAULTNAME:
      default:
        convertor = new GeneralAttributeConvertor(key);
    }
    return convertor;
  }
}
