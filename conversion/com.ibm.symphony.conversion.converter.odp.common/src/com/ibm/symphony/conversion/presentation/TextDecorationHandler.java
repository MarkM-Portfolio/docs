/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation;

import java.util.HashMap;
import java.util.LinkedHashMap;

import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;

/**
 * Provides a collection of methods to handle the text-decoration CSS property. As per defect 9864, the text-decoration property
 * is put on hold in a context hash, and released only once a text node is reached. The purpose of this class is simply to group
 * these methods in a single location and allow them to share common data.
 */
public class TextDecorationHandler
{

  private final static String[] textDecorationKeys = { ODPConvertConstants.CSS_VALUE_OVERLINE,
    ODPConvertConstants.CSS_VALUE_STRIKETHROUGH, ODPConvertConstants.CSS_VALUE_UNDERLINE };

  /**
   * Puts a given text-decoration related style on hold in the context for a given style name. The overline, line-through, and
   * underline values are stored separately as fake CSS properties in the CONTEXT_CSS_ON_HOLD_STYLE context hash.
   *
   * @param context - the current conversion context
   * @param styleName - the name of the style being put on hold
   * @param key - the text-decoration key, either overline, line-through, or underline
   * @param value - the text-decoration value, either "none" or some other value when enabled
   */
  @SuppressWarnings("unchecked")
  static public void putStyleOnHold(ConversionContext context, String styleName, String key, String value)
  {
    // gets the context hash and initializes it if it doesn't exist
    Object tmp = context.get(ODPConvertConstants.CONTEXT_CSS_ON_HOLD_STYLE);
    HashMap<String, HashMap<String, String>> onHoldStyles;
    if (tmp == null)
    {
      onHoldStyles = new HashMap<String, HashMap<String, String>>();
      context.put(ODPConvertConstants.CONTEXT_CSS_ON_HOLD_STYLE, onHoldStyles);
    }
    else
    {
      onHoldStyles = (HashMap<String, HashMap<String, String>>) tmp;
    }

    // gets the props for the current style name and initializes it if it doesn't exist
    HashMap<String, String> props;
    if (onHoldStyles.containsKey(styleName))
    {
      props = onHoldStyles.get(styleName);
    }
    else
    {
      props = new HashMap<String, String>();
      onHoldStyles.put(styleName, props);
    }

    // sets the value of the current text-decoration key
    String valueAsBooleanString = String.valueOf(!ODPConvertConstants.HTML_VALUE_NONE.equals(value));
    props.put(key, valueAsBooleanString);
  }

  /**
   * Process the text-decoration style to set the styletemplate attribute in the html node and merge the text-decoration style in
   * the stackable properties.
   *
   * @param context - the current conversion context
   * @param props - list of properties
   * @param htmlNode - html node to set the styletemplate attribute in
   */
  static public void processStyle(ConversionContext context, LinkedHashMap<String, String> props, Element htmlNode)
  {
    // at this point, props is populated by AbstractContentHtmlConvertor.constructStyleString with a bunch of styles, those of
    // interest here are those listed in the textDecorationKeys class member, and their values are expected to be either the
    // "true" or "false" strings or null, where "true" and "false" respectively means enabled and disabled, while null means that
    // the style is undefined

    StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);
    if (sp == null)
    {
      // at this point, stackable properties should always be available, but this is just a precaution
      return;
    }

    // merge the text-decoration values in the stackable properties and turn them into fake CSS properties to set the
    // styletemplate attribute in the html node
    StringBuilder styleTplBuf = new StringBuilder(128);
    for (String key : textDecorationKeys)
    {
      String value = null;
      if (props.containsKey(key) && props.get(key) != null)
      {
        // if key defined in current style, use its value and add on stack
        value = props.get(key);
        sp.addProperty(key, value, StackableProperties.Type.CSS, null);
      }
      else if (ODPConvertConstants.BOOLEAN_VALUE_TRUE.equals(sp.getValue(key).getValue()))
      {
        // otherwise, if key is already set on the stack, and is true, use its value
        value = ODPConvertConstants.BOOLEAN_VALUE_TRUE;
      }
      if (value != null)
      {
        // a value was found, add it to the styletemplate buffer
        styleTplBuf.append(key + ODPConvertConstants.SYMBOL_COLON + value + ODPConvertConstants.SYMBOL_SEMICOLON);
      }
    }

    // sets the styletemplate attribute in the html node
    String styleTemplate = styleTplBuf.toString();
    if (styleTemplate.length() > 0)
    {
      htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE_TEMPLATE, styleTemplate);
    }
  }

  /**
   * Takes the text-decoration style previously put on hold and sets it as inline style of the enclosing span of the current text
   * node.
   *
   * @param context - the current conversion context
   * @param textNode - the current text node
   */
  static public void releaseStyleOnHold(ConversionContext context, Node textNode)
  {
    Element parent = (Element) textNode.getParentNode();
    if (parent == null || !parent.getNodeName().equals(ODPConvertConstants.HTML_ELEMENT_SPAN))
    {
      // text node must already be attached to a parent and parent must be a span
      return;
    }

    StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);
    if (sp == null)
    {
      // this is just in case, stackable properties should always be available at this point
      return;
    }

    // builds and sets the inline style from the stackable properties
    StringBuilder styleTplBuf = new StringBuilder(128);
    styleTplBuf.append(ODPConvertConstants.CSS_TEXT_DECORATION + ODPConvertConstants.SYMBOL_COLON);
    boolean keyFound = false;
    for (String key : textDecorationKeys)
    {
      if (ODPConvertConstants.BOOLEAN_VALUE_TRUE.equals(sp.getValue(key).getValue()))
      {
        keyFound = true;
        styleTplBuf.append(key + ODPConvertConstants.SYMBOL_WHITESPACE);
      }
    }
    if (keyFound)
    {
      String styleTemplate = styleTplBuf.toString().trim() + ODPConvertConstants.SYMBOL_SEMICOLON;
      String parentStyle = parent.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
      
      if(parentStyle != null)
        parent.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, parentStyle + styleTemplate);
      else
        parent.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, styleTemplate);
    }
  }

  /**
   * Returns a style string with its text-decoration values filtered against the applicable styletemplate value. This method
   * applies only to spans that contains only one text node.
   *
   * @param styleStr - the style string to filter
   * @param htmlNode - the html node to which belongs the style string
   * @return the filtered style string
   */
  public static String filterInlineStyle(String styleStr, Element htmlNode)
  {
    // html node must be a span that contains only one text node
    if (!htmlNode.getNodeName().equals(ODPConvertConstants.HTML_ELEMENT_SPAN) ||
        htmlNode.getChildNodes().getLength() != 1 ||
        htmlNode.getFirstChild().getNodeType() != Node.TEXT_NODE)
    {
      // bail out, return incoming style string unchanged
      return styleStr;
    }

    // handles the text-decoration inline style
    // creates a CSSProperties object to handle the style string and extracts the text-decoration property
    CSSProperties cpStyleStr = new CSSProperties(styleStr, true);
    String textDecoration = cpStyleStr.getProperty(ODPConvertConstants.CSS_TEXT_DECORATION);
    // checks for special cases
    if (textDecoration == null)
    {
      // no text-decoration found, we need an empty string to work with
      textDecoration = "";
    }
    else if (textDecoration.contains(ODPConvertConstants.CSS_VALUE_NONE))
    {
      // if the text-decoration property contains "none", bail out as "none" is not a value that should be filtered, return
      // incoming style string unchanged
      return styleStr;
    }

    // handles the styletemplate attribute
    // walks up the hierarchy to find the nearest styletemplate attribute
    String styleTmpl = "";
    Element parentNode = (Element) htmlNode.getParentNode();
    while (parentNode != null)
    {
      styleTmpl = parentNode.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE_TEMPLATE);
      if (styleTmpl == null)
      {
        styleTmpl = "";
      }
      if (styleTmpl.length() > 0)
      {
        break;
      }
      parentNode = (Element) parentNode.getParentNode();
      if (parentNode.getNodeName().equals("body"))
      {
        // no need to go above the body tag
        parentNode = null;
      }
    }
    if (styleTmpl.length() == 0)
    {
      // no styletemplate could be found, bail out as there's nothing to compare the inline style against, return incoming style
      // string unchanged
      return styleStr;
    }
    CSSProperties cpStyleTmpl = new CSSProperties(styleTmpl, true);

    // turns the style string text-decoration value into a hash to work with, and filters the keys against the parent's
    // styletemplate
    HashMap<String, Boolean> styleStringHash = new HashMap<String, Boolean>();
    for (String key : textDecorationKeys)
    {
      // sets the hash with the current value
      styleStringHash.put(key, textDecoration.contains(key));
      // and then filters against the parent's styletemplate
      if (ODPConvertConstants.BOOLEAN_VALUE_TRUE.equals(cpStyleTmpl.getProperty(key)))
      {
        if (styleStringHash.get(key))
        {
          // key is set in the style string, but also set in the styletemplate, remove it from the style string
          styleStringHash.put(key, false);
        }
        else
        {
          // key is not set in the style string, but it is set in the styletemplate, turn this key off in the style string
          styleStringHash.put(ODPConvertConstants.CSS_VALUE_TEXT_DECORATION_NO_PREFIX + key, true);
        }
      }
    }

    // sets the text-decoration property with its new value, or remove it if it has become empty
    StringBuilder newValueBuf = new StringBuilder(128);
    for (String key : styleStringHash.keySet())
    {
      if (styleStringHash.get(key))
      {
        newValueBuf.append(key + ODPConvertConstants.SYMBOL_WHITESPACE);
      }
    }
    String newValue = newValueBuf.toString().trim();
    if (newValue.length() == 0)
    {
      cpStyleStr.removeProperty(ODPConvertConstants.CSS_TEXT_DECORATION);
    }
    else
    {
      cpStyleStr.setProperty(ODPConvertConstants.CSS_TEXT_DECORATION, newValue);
    }

    return cpStyleStr.getPropertiesAsString();
  }

}
