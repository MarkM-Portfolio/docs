/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.cssattr;

import java.util.HashMap;
import java.util.Map;

import org.odftoolkit.odfdom.OdfAttribute;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;

public class TransitionAttributeConvertor extends AbstractAttributeConvertor
{
  // private static final String CLASS = TransitionAttributeConvertor.class.getName();
  //
  // private static final Logger LOG = Logger.getLogger(CLASS);

  @SuppressWarnings({ "unchecked", "restriction" })
  @Override
  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    String odfAttrName = attr.getNodeName();
    String value = attr.getNodeValue();

    String cssAttrName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(odfAttrName);

    Map<String, String> transitionMap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_TRANSITION_VALUES);
    if (transitionMap == null)
    {
      transitionMap = new HashMap<String, String>();
    }
    transitionMap.put(odfAttrName, value);
    context.put(ODPConvertConstants.CONTEXT_TRANSITION_VALUES, transitionMap);

    if (cssAttrName != null && value != null)
    {
      detectAndHandleStyleOverwrite(context, cssAttrName, value, styleMap);
    }
  }
}
