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

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfElement;

import com.ibm.symphony.conversion.converter.ods2json.sax.context.GeneralContext;
import com.ibm.symphony.conversion.service.common.ConversionContext;



public interface AttributeConvertor
{
  /**
   * convert the attribute in content element
   * @param context
   * @param element parser context
   * @param concord spreadsheet target object for odf element 
   * @return the processed value of odf attribute for concord spreadsheet
   */
  
  public String convert(ConversionContext context, GeneralContext convertor, Object target);
  
  /**
   * convert the attribute in style element
   * @param context
   * @param concord spreadsheet target object for odf element 
   * @param attribute name
   * @param attribute value
   */
  
  public void convert(ConversionContext context,Object target,String key,String value);
}
