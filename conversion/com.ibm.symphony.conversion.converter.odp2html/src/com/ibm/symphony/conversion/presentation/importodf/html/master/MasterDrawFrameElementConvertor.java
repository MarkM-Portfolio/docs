/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.html.master;

import java.util.logging.Logger;

import org.odftoolkit.odfdom.dom.element.draw.DrawFrameElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class MasterDrawFrameElementConvertor extends GeneralMasterHtmlConvertor
{
  private static final String CLASS = MasterDrawFrameElementConvertor.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);

  @SuppressWarnings("restriction")
  protected void doConvertHtml(ConversionContext context, Node element, Element htmlParent)
  {
    LOG.fine("Entering Import " + CLASS + ".doConvertHtml");

    DrawFrameElement drawFrame = (DrawFrameElement) element;
    String presentationClass = drawFrame.getAttribute(ODPConvertConstants.ODF_ATTR_PRESENTATION_CLASS);

    // The editor would like us to clean the imported draw frames as follows:
    // Clean the recognizable objects that we know we will add our own default text for it.
    // These includes the following presentation_class:
    // "title", "subtitle", "outline". The child of this draw_frame should be just an empty draw_text-box.
    if (presentationClass != null && AbstractMasterHtmlConvertor.cvCleanTypes.contains(presentationClass))
    {
      // Add the draw frame
      Node htmlNode = addHtmlElement(element, htmlParent, context);

      if (htmlNode instanceof Element)
      {
        // Parse the attributes for the draw frame
        htmlNode = parseAttributes(element, (Element) htmlNode, context);
        // Add the presentation_placeholder attribute
        ((Element) htmlNode).setAttribute("presentation_placeholder", "true");
        // Add an empty draw text box to the draw frame
        Document doc = (Document) context.getTarget();
        Node drawTextBox = doc.createElement(ODPConvertConstants.ODF_ELEMENT_DRAW_TEXTBOX);
        htmlNode = addHtmlElement(drawTextBox, htmlNode, context);
        // Parse the attributes for the draw text box (should be none)
        htmlNode = parseAttributes(drawTextBox, (Element) htmlNode, context);
        // Add the aria role
        ((Element) htmlNode).setAttribute(ODFConstants.HTML_ATTR_ARIA_ROLE, ODFConstants.ARIA_ROLE_TEXTBOX);
        ((Element) htmlNode).setAttribute(ODFConstants.HTML_ATTR_ARIA_LABEL, ODFConstants.ARIA_ROLE_TEXTBOX);
      }
    }
    else
    {
      // set draw frame attributes - needed when processing children
      String attr = ((Element) element).getAttribute(ODPConvertConstants.ODF_ATTR_SVG_WIDTH);
      if (attr.length() > 0)
        context.put(ODPConvertConstants.CONTEXT_PARENT_WIDTH, attr);

      super.doConvertHtml(context, element, htmlParent);

      // TODO in future story we'll want to process the children for Concord format
      // as described in Story 45769
      // Process the draw frame and its children using the content convertor
      // context.put(ODPConvertConstants.CONTEXT_PARENT_ELEMENT, element.getParentNode());
      // context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, 0.0);
      // new GeneralContentHtmlConvertor().convert(context, element, htmlParent);
      // context.remove(ODPConvertConstants.CONTEXT_PARENT_ELEMENT);
      // context.remove(ODPConvertConstants.CONTEXT_PARENT_SIZE);
    }
  }
}
