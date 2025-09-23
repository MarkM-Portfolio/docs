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

import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class TextLineBreakConvertor extends GeneralODPConvertor
{
  private static final String CLASS = TextLineBreakConvertor.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  protected void doContentConvert(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
    // br with class "hideInIE" or "deleteOnExport" needs to be ignored on export
    String styleName = ((Element) htmlNode).getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if ((styleName != null)
        && (styleName.contains(ODPConvertConstants.HIDE_IN_IE) || styleName.contains(ODPConvertConstants.DELETE_ON_EXPORT)))
    {
      // found br tag with hideInIE or deleteOnExport class, it must then be ignored
      // br tag has no children, so there's no need to invoke convertChildren
      // it is then safe to return right away
      if (log.isLoggable(Level.FINE))
      {
        log.fine("skipped BR tag with hideInIE or deleteOnExport class");
      }
      return;
    }

    super.doContentConvert(context, htmlNode, odfParent);
  }

}
