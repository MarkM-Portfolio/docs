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

import java.util.Stack;

import javax.xml.transform.sax.TransformerHandler;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;

import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

public class CopyCellFragmentReader extends XMLFragmenttReader
{
  protected TransformerHandler hdl;
  
  private Stack<Integer> levelStatck = new Stack<Integer>();
  
  private boolean isFiltered = true;
	  
  public CopyCellFragmentReader()
  {
  }
  
  public void setXMLWriter(TransformerHandler hdl)
  {
    super.setXMLWriter(hdl);
    this.hdl = hdl;
  }
  
  public void characters(char[] ch, int start, int length) throws SAXException
  {
    hdl.characters(ch, start, length);
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    int level = 0;
    if(!levelStatck.isEmpty())
      level = levelStatck.peek().intValue();
    int newLevel = level + 1;
    levelStatck.push(newLevel);
    if(newLevel == 2 && ConversionConstant.ODF_ELEMENT_TEXT_P.equals(qName))
      isFiltered = false;
    if(!isFiltered)
      hdl.startElement(uri, localName, qName, attributes);
  }
  
  public void endElement(String uri, String localName, String qName) throws SAXException
  {
    if(!isFiltered)
      hdl.endElement(uri, localName, qName);
    int level = levelStatck.pop();
    if(level == 2 && ConversionConstant.ODF_ELEMENT_TEXT_P.equals(qName))
      isFiltered = true;
  }
  
}
