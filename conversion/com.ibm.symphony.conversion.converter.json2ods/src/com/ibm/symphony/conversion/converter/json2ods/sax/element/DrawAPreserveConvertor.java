package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class DrawAPreserveConvertor extends GeneralPreserveConvertor
{
  private static final Logger LOG = Logger.getLogger(DrawAPreserveConvertor.class.getName());
  
  public void convert(ConversionContext context,TransformerHandler mXmlWriter,Object input, Object output)
  {
    bOutputAtEnd = true;
    context.put("bOutputAtEnd",bOutputAtEnd);
    super.convert(context, mXmlWriter, input, output);
    bOutputAtEnd = false;
    context.put("bOutputAtEnd",bOutputAtEnd);
    if(input instanceof Node)
      flush((Node)input);
  }
  
}
