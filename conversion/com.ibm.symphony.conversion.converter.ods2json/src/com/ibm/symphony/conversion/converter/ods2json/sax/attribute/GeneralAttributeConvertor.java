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

import com.ibm.symphony.conversion.converter.ods2json.sax.context.GeneralContext;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class GeneralAttributeConvertor implements AttributeConvertor
{

  String mAttrName;
  public GeneralAttributeConvertor(String attrName){
    mAttrName = attrName;
  }
  
  public String convert(ConversionContext context, GeneralContext convertor,Object targetObject)
  {
    return null;
  }

  public void convert(ConversionContext context, Object target, String key, String value)
  {

  }

}
