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
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class TableNullDateContext extends GeneralContext
{
	  public TableNullDateContext(XMLImport importer, String uri, String localName, String qName, Object target)
	  {
		    super(importer, uri, localName, qName, target);
	  }
 	
	  public void startElement(AttributesImpl attrs)
	  {
	        mAttrs = attrs;
		    ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
			String value = this.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_DATE_VALUE);
		    if (value.contains("1904")) {
		    	document.isDate1904 = true;
		    }
	  }
}
