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

import java.util.Map;

import org.odftoolkit.odfdom.doc.style.OdfStyle;


public interface ICSSPropertyConvertor
{
  /**
   * convert html css style name and value to odf style property
   * @param style -- target to store converted odf style property
   * @param cssMap -- html style map
   * @param name  -- html css property name
   * @param value -- html css property value
   */
  void convert(OdfStyle style, Map<String, String> cssMap, String name, String value);
}
