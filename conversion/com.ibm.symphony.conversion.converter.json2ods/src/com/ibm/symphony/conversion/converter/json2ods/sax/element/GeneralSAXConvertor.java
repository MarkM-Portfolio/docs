package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import javax.xml.transform.sax.TransformerHandler;

import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.index.ODSOffsetRecorder;

public abstract class GeneralSAXConvertor
{
  
  protected ODSOffsetRecorder reader;
  
  protected TransformerHandler hdl;
  protected String id;
  /*
   * input can be JSON object or OdfElement
   * return the converted element according to input
   */
  
  protected String getTargetXMLById(ConversionContext context,Object input)
  {
    String element = getOdfElement(context, input);
    if(element == null)
      element = createNewElement(context, input);
    return element;
  }
  
  /*
   * return the existing odf element by Id
   */
  
  protected String getOdfElement(ConversionContext context,Object input)
  {
    String xmlId = getNodeId(input);
    String cellXML = reader.locateById(xmlId);
    return cellXML;
  }
  
  protected abstract String createNewElement(ConversionContext context, Object input);
  
  protected abstract String getNodeId(Object input);
}
