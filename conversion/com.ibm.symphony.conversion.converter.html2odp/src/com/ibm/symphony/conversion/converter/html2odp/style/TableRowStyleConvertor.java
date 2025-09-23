/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.style;

import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class TableRowStyleConvertor implements CSSStyleConvertor
{
    public void convertStyle(ConversionContext context, Element htmlElement, OdfElement odfElement, String styleName, String styleString)
    {
      //do nothing.(Height,backgroundcolor)
    
    }
    
    public void convertStyle(ConversionContext context, Element htmlElement, OdfElement odfElement, String styleName, Map<String,String> styleMap)
    {
      //do nothing.(Height,backgroundcolor)
      
    }
}
