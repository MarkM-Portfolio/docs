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

import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;

public abstract class SimpleGraphicAttributeConvertor extends AbstractAttributeConvertor
{
  // private static final String CLASS = SimpleAttributeConvertor.class.getName();
  //
  // private static final Logger LOG = Logger.getLogger(CLASS);

  @SuppressWarnings({ "restriction" })
  @Override
  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    OdfElement element = (OdfElement) context.get(ODPConvertConstants.CONTEXT_CURRENT_ELEMENT);
    String familyValue = CSSConvertUtil.getStyleFamily(element, false);

    boolean insideShape = (Boolean) context.get(ODPConvertConstants.CONTEXT_INSIDE_SHAPE);

    if (insideShape && ODPConvertConstants.HTML_VALUE_GRAPHIC.equals(familyValue))
    {
      return;
    }

    String controllingValue = this.findControllingAttribute(context, element);
    if ((controllingValue != null) && (controllingValue.equals(ODPConvertConstants.HTML_VALUE_NONE)))
      return;

    String odfAttrName = attr.getNodeName();
    String value = attr.getNodeValue();

    String cssAttrName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(odfAttrName);

    if (cssAttrName != null && value != null)
    {
      detectAndHandleStyleOverwrite(context, cssAttrName, value, styleMap);
    }
  }

  /**
   * Finds the value of the Controlling Attribute for this Attribute
   * 
   * @param context
   *          Conversion context
   * @param style
   *          Style currently being processed
   * @return String value of the controlling attribute
   */
  @SuppressWarnings("restriction")
  public String findControllingAttribute(ConversionContext context, OdfElement style)
  {
    String controllingValue = style.getAttribute(getControllingName());
    if (controllingValue == null || controllingValue.length() == 0)
    {
      Node styleNode = style.getParentNode().getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME);
      while (styleNode != null)
      {
        String parentStyleName = styleNode.getNodeValue();
        OdfStyle parentStyle = null;
        List<Node> styleList = ODPConvertStyleMappingUtil.getAllStyleNameNodesByKey(context, parentStyleName);
        if (styleList != null && (parentStyle = (OdfStyle) styleList.get(0)) != null)
        {
          controllingValue = parentStyle.getProperty(getControllingProperty());
          if (controllingValue != null && controllingValue.length() > 0)
            return controllingValue;
        }
        else
        {
          return null;
        }
        styleNode = parentStyle.getAttributes().getNamedItem(ODPConvertConstants.ODF_ATTR_PARENT_STYLE_NAME);
      }
    }
    return controllingValue;
  }

  /**
   * Gets the name of the Controlling Attribute (e.g. draw:fill)
   * 
   * @return String name of the controlling attribute
   */
  abstract protected String getControllingName();

  /**
   * Gets the property type of the Controlling Attribute (e.g. OdfStyleGraphicProperties.Fill)
   * 
   * @return OdfStyleProperty property type of the controlling attribute
   */
  abstract protected OdfStyleProperty getControllingProperty();

}
