package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import javax.xml.transform.sax.TransformerHandler;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;

public class SvgTitleDescConvertor
{
  
  TransformerHandler hdl;
  private ConversionContext context;
  private Object input;
  String src;
  
  public SvgTitleDescConvertor(ConversionContext context,TransformerHandler hdl, Object input)
  {
    
    this.hdl = hdl;
    this.input = input;
    this.context = context;
  }
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    AttributesImpl attrs = new AttributesImpl(attributes);
    hdl.startElement(uri, localName, qName, attrs);
  }
  
  public void convert(ConversionContext context2, Object input2, boolean isNew2)
  {
    
  }
  public void endElement(String uri, String localName, String qName) throws SAXException
  {
	  DrawFrameRange range = (DrawFrameRange)input;
	  if(qName == ConversionConstant.ODF_ELEMENT_SVG_TITLE)
	  {
        src = range.alt;
	  }
	  hdl.characters(src.toCharArray(), 0, src.length());
  }
}
