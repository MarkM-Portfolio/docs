/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.styleattr;

import java.util.Map;

import org.odftoolkit.odfdom.doc.style.OdfStyle;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public interface PropertyConvertor
{
  /**
   * convert html css style name and value to odf style property
   * @param style -- target to store converted odf style property
   * @param cssMap -- html style map
   * @param name  -- html css property name
   * @param value -- html css property value
   */
  void convert(ConversionContext context,OdfStyle style, Map<String, String> cssMap, String name, String value);
}
