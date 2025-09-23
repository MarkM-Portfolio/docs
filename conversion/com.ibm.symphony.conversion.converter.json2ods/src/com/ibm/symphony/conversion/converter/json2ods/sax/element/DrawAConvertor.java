package com.ibm.symphony.conversion.converter.json2ods.sax.element;


import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.xml.sax.XMLReader;

import com.ibm.symphony.conversion.converter.json2ods.sax.FrameFragementReader;
import com.ibm.symphony.conversion.converter.json2ods.sax.ODSSAXParser;
import com.ibm.symphony.conversion.converter.json2ods.sax.XMLFragmenttReader;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;
import com.ibm.symphony.conversion.spreadsheet.index.ODSOffsetRecorder;

public class DrawAConvertor extends GeneralSAXConvertor
{
  private static final String CLAZZNAME = DrawAConvertor.class.getName();
  private static final Logger LOG = Logger.getLogger(CLAZZNAME);
  
  public DrawAConvertor(ConversionContext context, TransformerHandler hdl, DrawFrameRange image)
  {
  }

  public void convert(ConversionContext context,Object input, Object output)
  {
    reader = (ODSOffsetRecorder) context.get("Recorder");
    hdl = (TransformerHandler)output;
    String xml = getTargetXMLById(context, input);
    
    try
    {
      XMLFragmenttReader fReader =  new FrameFragementReader(context,input);
      ODSSAXParser parser = new ODSSAXParser();
      XMLReader xmlReader = (XMLReader)context.get("XMLReaderInstance2");;
      parser.setXMLReader(xmlReader);
      parser.setHandler(fReader);
      parser.parseXML(context,hdl,input, xml);
    }
    catch (Exception e)
    {
      LOG.logp(Level.SEVERE,CLAZZNAME, "convert", "Invalid XML format", e);
    }
  }
  
  protected void setTableStyleNameAttribute(ConversionContext context,Object input, OdfElement element)
  {
    
  }
  
  protected String createNewElement(ConversionContext context, Object input)
  {
    try
    {
      Range image = (Range) input;
      String xml = "";
      
      if(image instanceof DrawFrameRange)
      {
          xml = "<draw:a><draw:frame><draw:image xlink:type=\"simple\" xlink:show=\"embed\" xlink:actuate=\"onLoad\"></draw:image></draw:frame></draw:a>";
      }
      else
      {
          xml = "<draw:a><draw:frame></draw:frame></draw:a>";
      }
      return xml;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "can not create a draw frame", e);
    }
    return "<draw:a></draw:a>";
  }

  protected String getOdfElement(ConversionContext context,Object input)
  {
    String xmlId = getNodeId(input);
    String cellXML = reader.locateById(xmlId);
    if(ConversionUtil.hasValue(cellXML))
      cellXML = "<draw:a>" + reader.locateById(xmlId) + "</draw:a>";
    return cellXML;
  }
  
  protected String getNodeId(Object input)
  {
    Range image = (Range)input;
    return image.rangeId;
  }
}
