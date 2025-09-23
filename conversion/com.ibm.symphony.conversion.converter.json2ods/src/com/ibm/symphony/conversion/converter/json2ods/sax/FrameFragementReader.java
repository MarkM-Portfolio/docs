package com.ibm.symphony.conversion.converter.json2ods.sax;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.json2ods.sax.element.DrawFrameConvertor;
import com.ibm.symphony.conversion.converter.json2ods.sax.element.DrawImageConvertor;
import com.ibm.symphony.conversion.converter.json2ods.sax.element.DrawObjectConvertor;
import com.ibm.symphony.conversion.converter.json2ods.sax.element.SvgTitleDescConvertor;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.XMLUtil;
import com.ibm.symphony.conversion.spreadsheet.XMLUtil.NODENAME;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;

public class FrameFragementReader extends XMLFragmenttReader
{
  private ConversionContext context;
  private Object input;
  private DrawFrameConvertor eContext;
  
  private DrawImageConvertor iContext;
  
  private NODENAME type;
  
  public FrameFragementReader(ConversionContext context,Object input)
  {
    this.context = context;
    this.input = input;
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    String id = attributes.getValue(ConversionConstant.ID_STRING);
    boolean isNew = true;
    if(ConversionUtil.hasValue(id))
      isNew = false;
    type = XMLUtil.getXMLToken(qName);
    
    switch(type)
    {
      case DRAW_FRAME:
      {
        eContext = new DrawFrameConvertor(context,hdl,input);
        eContext.convert(context,input, isNew);
        eContext.startElement(uri, localName, qName, attributes);
        eContext.endElement(uri, localName, qName);
        break;
      }
      case DRAW_IMAGE:
      {
        iContext = new DrawImageConvertor(context,hdl,input);
        iContext.convert(context,input, isNew);
        iContext.startElement(uri, localName, qName, attributes);
        iContext.endElement(uri, localName, qName);
        break;
      }
      case DRAW_A:
      {
        AttributesImpl attrs = new AttributesImpl(attributes);
        if(input instanceof DrawFrameRange)
          attrs.addAttribute("", "", ConversionConstant.ODF_ATTR_XLINK_HREF, "",((DrawFrameRange)input).link );
        hdl.startElement(uri, localName, qName, attrs);
        break;
      }
      case DRAW_OBJECT:
      {
        DrawObjectConvertor converter = new DrawObjectConvertor(context,hdl,input);
        converter.convert(context,input, isNew);
        converter.startElement(uri, localName, qName, attributes);
        converter.endElement(uri, localName, qName);
        break;
      }
      default:
        hdl.startElement(uri, localName, qName, attributes);
        break;
    }
    
  }
  
  public void characters(char[] ch, int start, int length) throws SAXException
  {
	  DrawFrameRange range = (DrawFrameRange)input;
	  String src = null;
	  if((type == NODENAME.SVG_TITLE) && (range.usage == RangeType.CHART || range.usage == RangeType.IMAGE))
	  {	 
		src = range.alt;
		if(src == null) src = "";
		hdl.characters(src.toCharArray(), 0, src.length());
	  }	  
	  else
	  {
		hdl.characters(ch, start, length);
	  }
  }

  
  public void endElement(String uri, String localName, String qName) throws SAXException
  {
    hdl.endElement(uri, localName, qName);
  }
}
