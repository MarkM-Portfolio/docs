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
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfAttribute;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.TextDecorationHandler;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;

import com.ibm.symphony.conversion.service.common.ConversionContext;

abstract public class LineStyleConvertor extends AbstractAttributeConvertor
{
  private static final String CLASS = LineStyleConvertor.class.getName();

  @SuppressWarnings("unused")
  private static final Logger LOG = Logger.getLogger(CLASS);

  abstract protected String getCssLineStyle();

  @SuppressWarnings("restriction")
  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    Node owner = (Node) attr.getOwnerElement();
    String rawStyleName = CSSConvertUtil.getRawStyleName(owner, context);
    String styleName = CSSConvertUtil.getStyleName(rawStyleName);
    TextDecorationHandler.putStyleOnHold(context, styleName, getCssLineStyle(), attr.getNodeValue());

    // as of defect 9864, this below is obsolete  
    /*
    String odfAttrName = attr.getNodeName();
    String value = attr.getNodeValue();

    String cssAttrName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(odfAttrName);

    String currVal = styleMap.get(cssAttrName);
    if (!value.equals(ODPConvertConstants.HTML_VALUE_NONE))
    {
      String newVal = getCssLineStyle();

      if ((currVal == null) || currVal.equals(ODPConvertConstants.HTML_VALUE_NONE)) // if the current value is null or none, just
      {
        value = newVal;

        // The ODF styles below all map to this one CSS property: text-decoration
        // - style:text-underline-style
        // - style:text-overline-style
        // - style:text-line-through-style
        // It is therefore expected for the text-decoration property to be modified over the course of the parsing of a single
        // style element, and these modifications should not be perceived as an overwrite and cause a CDUP style creation.
      }
      else
      { // Check to see if the attribute is already set, if not then append it.
        if (currVal.indexOf(newVal) == -1) // Style not currently set in value
        {
          value = currVal + " " + newVal;
        }
        else
          // Current value is already set, do not set it again in the style map
          return;
      }
    }

    // if current value is none, we don't want to reset the value to none if it is already set (but should set it if not already set)
    else
    {
      if (currVal != null)
        return;
    }

    if (cssAttrName != null && value != null)
    {
      styleMap.put(cssAttrName, value);
    }
    */
  }

}
