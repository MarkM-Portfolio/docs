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
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;

public class TableCalculationSettingsContext extends GeneralContext
{

  public TableCalculationSettingsContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    GeneralContext context = null;
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case TABLE_NULL_DATE :
        context = new TableNullDateContext(mImport, uri, localName, qName, mTarget);
        break;
      default:
        context =  new GeneralContext(mImport, uri, localName, qName, mTarget);
    }
    return context;
  }

}
