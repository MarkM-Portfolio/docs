/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.context;

import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

public class TextAContext extends GeneralDOMContext{

	public TextAContext(XMLImport importer, String uri, String localName,
			String name, Object target) {
		super(importer, uri, localName, name, target);		
	}
	
	private String herf;

	public String getHerf() {
		return herf;
	}
	private String text;
	public String getText() {
		return text;
	}

	@Override
	public void startElement(AttributesImpl attributes) {
		// TODO Auto-generated method stub
		super.startElement(attributes);		
		herf = this.getAttrValue(ConversionConstant.ODF_ATTR_XLINK_HREF);		
	}
	
	  public void endElement()
	  {
	    super.endElement();
		text = mElement.getTextContent();
	  }
}
