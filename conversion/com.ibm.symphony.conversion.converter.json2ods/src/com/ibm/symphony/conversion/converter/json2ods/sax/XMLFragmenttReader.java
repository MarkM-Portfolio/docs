/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax;

import javax.xml.transform.sax.TransformerHandler;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

public class XMLFragmenttReader extends DefaultHandler
{
  
  protected TransformerHandler hdl;

  public XMLFragmenttReader()
  {
  }
  
  public void setXMLWriter(TransformerHandler hdl)
  {
    this.hdl = hdl;
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    if(!qName.equals(ConversionConstant.ODF_ELEMENT_TABLETABLE_CELL) && !qName.equals(ConversionConstant.ODF_ELEMENT_TABLECONVEREDTABLE_CELL))
      return;
  }
  
  public void endElement(String uri, String localName, String qName) throws SAXException
  {
  }

}
