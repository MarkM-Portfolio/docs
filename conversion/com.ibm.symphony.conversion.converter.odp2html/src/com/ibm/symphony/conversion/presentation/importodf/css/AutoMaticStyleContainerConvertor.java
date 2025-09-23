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

import java.io.File;
import java.util.Map;

import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class AutoMaticStyleContainerConvertor extends CSSContainerConvertor
{
  public AutoMaticStyleContainerConvertor() 
  {
    // mich: this attribute allows to insert a prefix in front of the css classes defined in the css files
    // this was added for defect 42214 in order to add a ".concord" prefix to fix the so called "one ui" issue
    cssStyleClassPrefix = ODPConvertConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS;
  }

  @Override
  protected void doCSSContainerConvert(ConversionContext context, Node element, Map<String, Map<String, String>> styles)
  {
    CSSConvertUtil.convertCSSChildren(context, element, styles);

  }

  protected void postConvert(ConversionContext context, Node element, Map<String, Map<String, String>> styles)
  {
    //super.postConvert(context, element, styles);  // don't write yet, master.html processing may change the map
    context.put(ODPConvertConstants.CONTEXT_CSS_AUTOMATIC_STYLE, styles);
  }
  
  protected String getFilePath(ConversionContext context)
  {
    return (String) context.get(ODPConvertConstants.CONTEXT_TARGET_BASE) + File.separator + ODPConvertConstants.CSS_STYLE_AUTO_FILE;
  }
  
  /*
   * Write the automatic style map to disk.  
   * 
   * We need to do this later than postConvert() because while processing master.html, changes 
   * are made to the style map. 
   * 
   * @param context - conversion context
   * 
   */
  @SuppressWarnings("unchecked")
  public void writeAutomaticStyles(ConversionContext context)
  {
    Map<String, Map<String, String>> styles = (Map<String, Map<String, String>>) context
    .get(ODPConvertConstants.CONTEXT_CSS_AUTOMATIC_STYLE);
    if (styles != null && !styles.isEmpty())
    {
      super.postConvert(context, null, styles);
    }
  }

}
