/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.content;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class DrawEllipseFrameConvertor extends DrawFrameConvertor
{
  /**
   * draw: connector and line use the attributes: svg:x1, svg:y1 and svg:x2, svg y2 instead of svg:x, svg:y, svg:height, svg:width.
   */
  protected void doContentConvert(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
    // Call the base class to do the convert.
    context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, true);
    super.doContentConvert(context, htmlNode, odfParent);
    context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, false);
  }

  /**
   * return true because ellipses are modifiable
   */
  protected boolean isModifiableShape()
  {
    return true;
  }  

}
