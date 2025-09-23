/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;

public class DeletePreserveConvertor extends PreserveConvertor
{
  
  public DeletePreserveConvertor(PreserveNameIndex index)
  {
    super(index);
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    AttributesImpl attrs = new AttributesImpl(attributes);
    String id = attrs.getValue(ConversionConstant.ID_STRING);
    if(index.elementId.equals(id))
    {
      attrs.addAttribute("", "", index.attrName, "", index.address);
    }
    super.startElement(uri, localName, qName, attrs);
  }

}
