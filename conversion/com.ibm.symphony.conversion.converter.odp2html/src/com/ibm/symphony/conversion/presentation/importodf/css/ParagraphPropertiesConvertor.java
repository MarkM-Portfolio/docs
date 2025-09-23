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

import java.util.Map;
import java.util.logging.Logger;

import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class ParagraphPropertiesConvertor extends ODFStyleElementConvertor
{
  private static final String CLASS = ParagraphPropertiesConvertor.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  @SuppressWarnings("unchecked")
  @Override
  protected void doConvert(ConversionContext context, Node element, Object output)
  {
    Map<String, Map<String, String>> styles = (Map<String, Map<String, String>>) output;

    NamedNodeMap attributes = element.getAttributes();
    String rawStyleName = CSSConvertUtil.getRawStyleName(element, context);
    String styleName = CSSConvertUtil.getStyleName(rawStyleName);

    Map<String, String> styleMap = CSSConvertUtil.getStyleMap(styleName, styles);
    Map<String, String> styleMapSplitProperties = null;

    String styleType = element.getNodeName();

    Element parentNode = (Element) element.getParentNode();
    if (ODPConvertConstants.ODF_ATTR_STYLE_STYLE.equals(parentNode.getNodeName())
        && ODPConvertConstants.HTML_VALUE_GRAPHIC.equals(CSSConvertUtil.getStyleFamily(parentNode, true)))
    {
      styleMapSplitProperties = createSubsetStyle(context, element, styleType, rawStyleName, styles);
    }

    Object oldElement = context.get(ODPConvertConstants.CONTEXT_CURRENT_ELEMENT);
    context.put(ODPConvertConstants.CONTEXT_CURRENT_ELEMENT, element);

    // Determine the style map to use for attribute parsing
    Map<String, String> styleMapToProcess = styleMap;
    if (styleMapSplitProperties != null)
    {
      styleMapToProcess = styleMapSplitProperties;
    }

    String direction = styleMapToProcess.get(HtmlCSSConstants.DIRECTION);
    if (attributes != null && attributes.getLength() > 0)
    {
      for (int j = 0; j < attributes.getLength(); j++)
      {
        parseAttribute(attributes.item(j), context, styleMapToProcess);
      }

      // Check to ensure we don't indent off the left margin of this paragraph
      String leftMargin = styleMapToProcess.get(HtmlCSSConstants.MARGIN_LEFT);
      String textIndent = styleMapToProcess.get(HtmlCSSConstants.TEXT_INDENT);
      if (leftMargin != null)
      {
        if (textIndent != null)
        {
          double margin = Double.parseDouble(leftMargin.substring(0, leftMargin.indexOf("%")));
          double indent = Double.parseDouble(textIndent.substring(0, textIndent.indexOf("%")));
          if (margin + indent < 0.0)
          {
            if (margin == 0)
            {
              LOG.fine("Removing negative indent: " + textIndent);
              // Just remove the negative indent
              styleMapToProcess.remove(HtmlCSSConstants.TEXT_INDENT);
            }
            else
            {
              LOG.fine("Updating negative indent");
              // Set the negative indent to not go left of our margin
              styleMapToProcess.put(HtmlCSSConstants.TEXT_INDENT, Double.toString(-margin) + "%");
            }
          }
        }
      }

      Node writingModeAttr = attributes.getNamedItem("style:writing-mode");
      if(direction == null && writingModeAttr != null && ODFConstants.RL_TB.equalsIgnoreCase(writingModeAttr.getNodeValue())) {
    	  //create 'rtl' style rule corresponding to regular whith padding-left replaced by padding-right
          double margin = (leftMargin != null) ? Double.parseDouble(leftMargin.substring(0, leftMargin.indexOf("%"))) : 0;
    	  if(margin != 0) {
    		  styleName = styleName.trim() + ODPConvertConstants.CSS_RTL_QUALIFIER;
    		  styleMap = CSSConvertUtil.getStyleMap(styleName, styles);
    		  styleMap.put(HtmlCSSConstants.MARGIN_RIGHT, leftMargin);
    		  styleMap.put(HtmlCSSConstants.MARGIN_LEFT, "0");
    	  }
      }
    }

    // Copy substyle to full style if needed
    if (styleMapSplitProperties != null)
    {
      styleMap.putAll(styleMapSplitProperties);
    }

    context.put(ODPConvertConstants.CONTEXT_CURRENT_ELEMENT, oldElement);
    CSSConvertUtil.convertCSSChildren(context, element, styles);
  }
}
