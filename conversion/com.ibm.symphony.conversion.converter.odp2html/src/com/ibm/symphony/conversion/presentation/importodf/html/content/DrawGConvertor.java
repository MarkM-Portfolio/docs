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
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class DrawGConvertor extends GeneralContentHtmlConvertor
{
  private static final String CLASS = DrawGConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  @Override
  protected void doConvertHtml(ConversionContext context, Node odfElement, Element htmlParent)
  {
    log.fine("Entering Import " + CLASS + ".doConvertHtml");
    
    double oldParentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);

    // -------------------------------------------------------------------
    // NOTE: draw:g attributes are not preserved (for now) in the HTML
    //       so for now, there is no need to create an HTML element or parse it's attributes
    //       This is why the following code is commented out, and the parent of draw:g
    //       is passed as the htmlElement in convertChildren
    // -------------------------------------------------------------------
    //Element htmlElement = addHtmlElement(odfElement, htmlParent, context);
    // here the parent size in context will be changed.
    //htmlElement = parseAttributes2(odfElement, htmlElement, context);
    Element htmlElement = htmlParent;   

    convertChildren(context, odfElement, htmlElement);

    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, oldParentSize);
  }
}
