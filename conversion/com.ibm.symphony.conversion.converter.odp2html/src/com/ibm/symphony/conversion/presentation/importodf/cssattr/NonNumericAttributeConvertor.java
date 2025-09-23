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

import java.util.Map;

import org.odftoolkit.odfdom.OdfAttribute;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;

public class NonNumericAttributeConvertor extends AbstractAttributeConvertor
{
  // private static final String CLASS = NonNumericAttributeConvertor();
  //
  // private static final Logger LOG = Logger.getLogger(CLASS);

  @SuppressWarnings({ "restriction" })
  @Override
  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    String odfAttrName = attr.getNodeName();
    String value = attr.getNodeValue();
    if(odfAttrName.equalsIgnoreCase("style:writing-mode") && value.equalsIgnoreCase("tb-rl")) {
  	  styleMap.put("vertical-writing", "tb-rl");
    }
    JSONObject attrMapping = null;
    String cssAttrName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(odfAttrName);
    JSONObject attrMap = ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF_ATTR);

    if ((attrMapping = (JSONObject) attrMap.get(odfAttrName)) != null)
    {
      value = (String) attrMapping.get(value); // if need translate the odf value into html value.
    }

    if (cssAttrName != null && value != null)
    {
      styleMap.put(cssAttrName, value);

      // Since these are non-numeric and do not influence the CSS Styles, there is no need to handle any style overwrites
      // detectAndHandleStyleOverwrite(context, cssAttrName, value, styleMap);
    }
  }
}
