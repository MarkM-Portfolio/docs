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

import org.odftoolkit.odfdom.dom.attribute.table.TableVisibilityAttribute;

import com.ibm.symphony.conversion.converter.ods2json.sax.context.GeneralContext;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class TableVisibilityConvertor extends GeneralAttributeConvertor
{
  public TableVisibilityConvertor(String attrName)
  {
    super(attrName);
    // TODO Auto-generated constructor stub
  }



  public String convert(ConversionContext context, GeneralContext convertor,Object targetObject)
  {
    String visibility = convertor.getAttrValue(mAttrName);
    if(visibility == null)
      visibility = TableVisibilityAttribute.DEFAULT_VALUE;
    if("visible".equalsIgnoreCase(visibility))
        visibility = "";
    else if(("collapse").equalsIgnoreCase(visibility))
        visibility = "hide";
    return visibility;
  }

}
