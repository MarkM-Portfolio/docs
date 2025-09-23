/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.shape2image;

import org.apache.batik.dom.svg.SVGDOMImplementation;
import org.w3c.dom.DOMImplementation;
import org.w3c.dom.Document;

public class SVGDocumentFactory {
	  public static Document createSVGDocument()
	  {
	    DOMImplementation impl = SVGDOMImplementation.getDOMImplementation();
	    return impl.createDocument(SVGDOMImplementation.SVG_NAMESPACE_URI, "svg", null);
	  }
}
