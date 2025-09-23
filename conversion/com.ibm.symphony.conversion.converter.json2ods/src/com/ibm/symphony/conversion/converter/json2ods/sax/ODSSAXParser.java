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

import java.io.StringReader;

import javax.xml.transform.sax.TransformerHandler;

import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class ODSSAXParser
{
  private XMLFragmenttReader handler = null;
  
  private XMLReader xmlReader;
  
  public void setXMLReader(XMLReader reader)
  {
    this.xmlReader = reader;
  }
  
  public void setHandler(XMLFragmenttReader hdl)
  {
    this.handler = hdl;
  }
  
  public void parseXML(TransformerHandler hdl, String content) throws Exception
  {
    StringReader contentReader = new StringReader(content);
    InputSource source = new InputSource(contentReader);
    parseXML(hdl, source);
  }


  private void parseXML(TransformerHandler hdl, InputSource source) throws Exception
  {
    handler.setXMLWriter(hdl);

    xmlReader.setContentHandler(handler);
    InputSource contentSource = source;
    xmlReader.parse(contentSource);
  }
  
  public void parseXML(ConversionContext context,TransformerHandler hdl,Object input, String content) throws Exception
  {
    StringReader contentReader = new StringReader(content);
    InputSource source = new InputSource(contentReader);
    parseXML(context,hdl,input,source);
  }
  
  private void parseXML(ConversionContext context,TransformerHandler hdl,Object input,InputSource source) throws Exception
  {
      handler.setXMLWriter(hdl);
      xmlReader.setContentHandler(handler);
      xmlReader.parse(source);
  }
}
