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

import java.util.ArrayList;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.presentation.CSSProperties;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;

/**
 * Implement special code for hyperlinks i.e. Text A.
 */
public class HyperlinkConvertor extends GeneralODPConvertor {

  @SuppressWarnings("restriction")
  protected void parseAttributes(ConversionContext context, Element htmlNode, OdfElement element, OdfElement odfParent, OdfStyleFamily family)
  {
    // defect 10273, the text-decoration style must be removed here on export to avoid unnecessary style growth, search "10273"
    // in AbstractContentHtmlConvertor for more info about where it's added on import
    CSSProperties cp = new CSSProperties(htmlNode.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE), true);
    cp.removeProperty(ODPConvertConstants.CSS_TEXT_DECORATION);
    htmlNode.setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, cp.getPropertiesAsString());

    super.parseAttributes(context, htmlNode, element, odfParent, family);
    
    String val = htmlNode.getAttribute(HtmlCSSConstants.HREF);
    if (val != null && val.length() > 0) 
    {
      String attname = ODFConstants.XLINK_HREF; 
      element.setAttributeNS(ContentConvertUtil.getNamespaceUri(attname), attname, val);
    }
    
    val = htmlNode.getAttribute("xlink_href");
    if (val != null && val.length() > 0) 
    {
    	// only deal with slide action for now. consider to support link to object later.
    	String slideAction = "slideaction://?";
    	if(val.startsWith(slideAction)) {
    		@SuppressWarnings("unchecked")
			ArrayList<Element> slideHrefList = (ArrayList<Element>) context.get(ODPConvertConstants.CONTEXT_SLIDE_HREF_LIST);
    		slideHrefList.add(element);
    		String attname = ODFConstants.XLINK_HREF; 
    	    element.setAttributeNS(ContentConvertUtil.getNamespaceUri(attname), attname, val.substring(slideAction.length()));
    	}
    }
    
    val = htmlNode.getAttribute(HtmlCSSConstants.ALT);
    if (val != null && val.length() > 0) 
    {
      String attname = ODFConstants.OFFICE_TITLE; 
      element.setAttributeNS(ContentConvertUtil.getNamespaceUri(attname), attname, val);
    }
  }
}
