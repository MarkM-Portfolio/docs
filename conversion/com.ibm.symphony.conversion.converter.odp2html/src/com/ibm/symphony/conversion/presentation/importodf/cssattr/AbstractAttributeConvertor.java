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
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfAttribute;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.IConvertor;

public abstract class AbstractAttributeConvertor implements IConvertor
{
  private static final String CLASS = AbstractAttributeConvertor.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  @SuppressWarnings("unchecked")
  public void convert(ConversionContext context, Object input, Object output)
  {
    // TODO Auto-generated method stub
    // context will include the related node for the attribute.
    OdfAttribute attribute = (OdfAttribute) input;

    Map<String, String> styleMap = (Map<String, String>) output;
    convertAttribute(context, attribute, styleMap);

  }

  public abstract void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap);

  @SuppressWarnings("unchecked")
  protected void detectAndHandleStyleOverwrite(ConversionContext context, String cssAttrName, String value, Map<String, String> styleMap)
  {
    boolean overwriteDetected = false;

    String oldval = styleMap.get(cssAttrName);
    if (oldval != null && !oldval.equals(value))
    {
      Node elle = (Node) context.get(ODPConvertConstants.CONTEXT_CURRENT_ELEMENT);

      if (LOG.isLoggable(Level.FINE))
      {
        LOG.fine(cssAttrName + " overwrite detected for style " + CSSConvertUtil.getStyleName(elle, context) + ": was: " + oldval
            + " newval: " + value);
      }

      // Do not clobber the attribute. Instead create a new style entry. Set the new style
      // in the context which is detected when the call stack unwinds.
      if (styleMap instanceof HashMap)
      {
        Map<String, String> newmap = (Map<String, String>) context.get(ODPConvertConstants.CONTEXT_NEW_STYLE_MAP);

        if (newmap == null)
        {
          HashMap<String, String> x = (HashMap<String, String>) styleMap;
          newmap = (Map<String, String>) x.clone();
        }

        newmap.put(cssAttrName, value);
        overwriteDetected = true;

        context.put(ODPConvertConstants.CONTEXT_NEW_STYLE_MAP, newmap);
      }
      else
      {
        String classname = styleMap.getClass().toString();

        if (LOG.isLoggable(Level.FINE))
        {
          LOG.fine("Attribute overwrite - other map type detected: " + classname == null ? "unknown" : classname);
        }
      }

    }

    if (!overwriteDetected)
    {
      styleMap.put(cssAttrName, value);
    }
  }
}
