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
import java.io.UnsupportedEncodingException;
import java.util.Map;
import java.util.HashSet;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class CommonStyleContainerConvertor extends CSSContainerConvertor
{
  Logger log = Logger.getLogger(CommonStyleContainerConvertor.class.getName());

  static final String CLASS = CommonStyleContainerConvertor.class.toString();

  public CommonStyleContainerConvertor()
  {
    // mich: this attribute allows to insert a prefix in front of the css classes defined in the css files
    // this was added for defect 42214 in order to add a ".concord" prefix to fix the so called "one ui" issue
    cssStyleClassPrefix = ODPConvertConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS;
  }

  @SuppressWarnings("unchecked")
  @Override
  protected void doCSSContainerConvert(ConversionContext context, Node element, Map<String, Map<String, String>> styles)
  {
    // do the convert for children.
    CSSConvertUtil.convertCSSChildren(context, element, styles);

    // During the conversion, the original table template cell styles are renamed using the CSS
    // selectors. As such the old style names have to then be deleted (see TableTemplateConvertor).
    // Get the old style names that must then be deleted.

    HashSet<String> oldStyleMapNames = (HashSet<String>) context.get(ODPConvertConstants.CONTEXT_OLD_TABLE_TEMPLATE_STYLENAMES);

    // Lastly, delete old style maps since we have now renamed them
    if (oldStyleMapNames != null && !oldStyleMapNames.isEmpty())
    {
      for (String oldStyleMap : oldStyleMapNames)
      {
        styles.remove(CSSConvertUtil.getStyleName(oldStyleMap)); // get rid of original style map
      }
      context.remove(ODPConvertConstants.CONTEXT_OLD_TABLE_TEMPLATE_STYLENAMES);
    }
  }

  protected void postConvert(ConversionContext context, Node element, Map<String, Map<String, String>> styles)
  {
      context.put(ODPConvertConstants.CONTEXT_CSS_COMMON_STYLE, styles);
  }

  protected String getFilePath(ConversionContext context)
  {
    return (String) context.get(ODPConvertConstants.CONTEXT_TARGET_BASE) + File.separator + ODPConvertConstants.CSS_STYLE_COMMON_FILE;
  }
}
