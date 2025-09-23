/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.styleattr;

import java.util.Map;

import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleParagraphProperties;

import java.util.logging.Level;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;

public class AlignmentConvertor implements PropertyConvertor
{
  // private static final String CLASS = AlignmentConvertor.class.getName();

  // private static final Logger log = Logger.getLogger(CLASS);

  public void convert(ConversionContext context, OdfStyle style, Map<String, String> cssMap, String name, String value)
  {
    String alignment = ODPConvertConstants.ALIGNMENT_START; // Assume left;

    if (ODPConvertConstants.ALIGNMENT_CENTER.equals(value))
    {
      alignment = ODPConvertConstants.ALIGNMENT_CENTER;
    }
    else if (ODPConvertConstants.ALIGNMENT_RIGHT.equals(value))
    {
      alignment = ODPConvertConstants.ALIGNMENT_END;
    }
    else if (ODPConvertConstants.ALIGNMENT_LEFT.equals(value))
    {
      alignment = ODPConvertConstants.ALIGNMENT_START;
    }
    else
    {
      // TODO: may be issue since no value set for alignment 
      // String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_INVALID_ALIGNMENT, value);
      // ODPCommonUtil.logMessage(Level.WARNING, message);
    }
    style.setProperty(OdfStyleParagraphProperties.TextAlign, alignment);
  }
}
