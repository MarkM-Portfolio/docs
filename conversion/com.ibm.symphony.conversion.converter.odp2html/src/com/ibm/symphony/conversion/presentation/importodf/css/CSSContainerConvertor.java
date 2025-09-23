/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.css;

import java.util.LinkedHashMap;
import java.util.Map;

import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public abstract class CSSContainerConvertor extends AbstractCSSConvertor
{
  // mich: this attribute allows to insert a prefix in front of the css classes defined in the css files
  // this was added for defect 42214 in order to add a ".concord" prefix to fix the so called "one ui" issue
  protected String cssStyleClassPrefix = "";

  protected void doConvert(ConversionContext context, Node element, Object output)
  {
    // we don't need target file base.
    // but need to change the output into Map<String, Map<String, String>().
    Map<String, Map<String, String>> styles = new LinkedHashMap<String, Map<String, String>>();
    preConvert(context, element);
    doCSSContainerConvert(context, element, styles);
    this.postConvert(context, element, styles);
  }

  abstract protected void doCSSContainerConvert(ConversionContext context, Node element, Map<String, Map<String, String>> styles);

  protected void preConvert(ConversionContext context, Node element)
  {
    String targetFile = getFilePath(context);
    ODPConvertUtil.createFile(targetFile);
  }

  protected void postConvert(ConversionContext context, Node element, Map<String, Map<String, String>> styles)
  {
    ODPConvertUtil.writeContents(this.getFilePath(context), CSSConvertUtil.getStyleContents(styles, cssStyleClassPrefix).getBytes());
  }

  abstract protected String getFilePath(ConversionContext context);
}
