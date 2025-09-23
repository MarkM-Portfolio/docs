/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.content;

import java.util.logging.Logger;

import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.UnsupportedFeatures;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class PreserveOnlyConvertor extends AbstractContentHtmlConvertor
{
  private static final String CLASS = PreserveOnlyConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");

    String nodeName = odfElement.getNodeName();

    if (nodeName.startsWith(ODPConvertConstants.ODF_ELEMENT_DRAWOBJECT))
    {
      UnsupportedFeatures.addUnsupportedWarning(context, UnsupportedFeatures.UNSUPPORT_FEATURE_OLE_OBJECT);
    }
    else if (nodeName.startsWith(ODPConvertConstants.ODF_ELEMENT_OFFICEEVENTLISTENERS))
    {
      UnsupportedFeatures.addUnsupportedWarning(context, UnsupportedFeatures.UNSUPPORT_FEATURE_OLE_OBJECT);
    }
    else if (ODPConvertConstants.ODF_ELEMENT_ANIMPAR.equals(nodeName))
    {
      UnsupportedFeatures.addUnsupportedWarning(context, UnsupportedFeatures.UNSUPPORT_FEATURE_ANIMATION);
    }
    else if (ODPConvertConstants.ODF_ELEMENT_DRAWCAPTION.equals(nodeName))
    {
      UnsupportedFeatures.addUnsupportedWarning(context, UnsupportedFeatures.UNSUPPORT_FEATURE_CAPTION);
    }
    else if (ODPConvertConstants.ODF_ELEMENT_DRAWCONTROL.equals(nodeName))
    {
      UnsupportedFeatures.addUnsupportedWarning(context, UnsupportedFeatures.UNSUPPORT_FEATURE_ACTIVEX_CONTROL);
    }

    // Flatten the odfElement and store in HTML
    int level = 0;
    String flattenedElement = ODPConvertUtil.flattenElement(odfElement, level);
    // Check to see how many preserved attributes we have and increment the count
    NamedNodeMap attrs = htmlParent.getAttributes();
    int numberOfPreservedElements = -1;
    if (attrs != null)
    {
      for (int i = 0; i < attrs.getLength(); i++)
      {
        Node item = attrs.item(i);
        // Use 2 colons to separate name from value, and the string "|-|" to separate attributes
        // Don't include id as this is not and attribute
        String attrName = item.getNodeName();
        if (attrName.startsWith(ODPConvertConstants.HTML_ATTR_PRESERVE_ONLY))
        {
          String sIndex = attrName.substring(ODPConvertConstants.HTML_ATTR_PRESERVE_ONLY.length());
          int iIndex = Integer.parseInt(sIndex);
          if (iIndex > numberOfPreservedElements)
            numberOfPreservedElements = iIndex;
        }
      }
    }
    numberOfPreservedElements += 1;
    htmlParent.setAttribute(ODPConvertConstants.HTML_ATTR_PRESERVE_ONLY + numberOfPreservedElements, flattenedElement);

    log.fine("Preserving unsupported <" + odfElement.getNodeName() + "> node in HTML preserveonly attribute");
  }

}
