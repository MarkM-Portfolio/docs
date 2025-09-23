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

import com.ibm.symphony.conversion.converter.json2ods.sax.element.AnchorPreserveConvertor;
import com.ibm.symphony.conversion.converter.json2ods.sax.element.DeletePreserveConvertor;
import com.ibm.symphony.conversion.converter.json2ods.sax.element.PreserveConvertor;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;

public class PreserveFragmentReader extends XMLFragmenttReader
{
  private PreserveConvertor convertor;

  private RangeType type;
  
  public PreserveFragmentReader(PreserveNameIndex index)
  {
    this.type = index.type;
    switch(type)
    {
      case ANCHOR:
        convertor = new AnchorPreserveConvertor(index);
        break;
      case DELETE:
        convertor = new DeletePreserveConvertor(index);
        break;  
      default:  
        convertor = new PreserveConvertor(index);
        break;
    }
  }
  
  public void setXMLWriter(TransformerHandler hdl)
  {
    super.setXMLWriter(hdl);
    convertor.setXMLWriter(hdl);
  }
  
  /**
   * http://xerces.apache.org/xerces2-j/faq-sax.html#faq-2 : SAX may deliver contiguous text as multiple calls to characters, for reasons
   * having to do with parser efficiency and input buffering. It is the programmer's responsibility to deal with that appropriately, e.g. by
   * accumulating text until the next non-characters event.
   */
  public void characters(char[] ch, int start, int length) throws SAXException
  {
    hdl.characters(ch, start, length);
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    if(type == null)
    {
      convertor.startElement(uri, localName, qName, attributes);
      return;
    }
    else
    {
      switch(type)
      {
        case ANCHOR:
          
        default:
          convertor.startElement(uri, localName, qName, attributes);
      }
    }
  }
  
  public void endElement(String uri, String localName, String qName) throws SAXException
  {
    convertor.endElement(uri, localName, qName);
  }
  
}
