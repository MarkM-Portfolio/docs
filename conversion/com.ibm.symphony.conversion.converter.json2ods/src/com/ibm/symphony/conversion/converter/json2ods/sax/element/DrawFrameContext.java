package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.xml.sax.XMLReader;

import com.ibm.symphony.conversion.converter.json2ods.sax.FrameFragementReader;
import com.ibm.symphony.conversion.converter.json2ods.sax.ODSSAXParser;
import com.ibm.symphony.conversion.converter.json2ods.sax.XMLFragmenttReader;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.index.ODSOffsetRecorder;

public class DrawFrameContext extends GeneralSAXConvertor
{
  
  private static final String CLAZZNAME = DrawFrameContext.class.getName();
  private static final Logger LOG = Logger.getLogger(CLAZZNAME);

  public DrawFrameContext(ConversionContext context, TransformerHandler hdl, Range image)
  {
  }
  
  public void convert(ConversionContext context,Object input, Object output)
  {
    reader = (ODSOffsetRecorder) context.get("Recorder");
    hdl = (TransformerHandler)output;
    String xml = getTargetXMLById(context, input);
    Range frame = (Range) input;
    if(frame instanceof DrawFrameRange)
    {
      if(!xml.contains(ConversionConstant.ODF_ELEMENT_SVG_TITLE) && ((DrawFrameRange) frame).alt != null)
      {
        int index = xml.indexOf("</draw:frame>");
      	if(index != -1)
      	  xml = xml.substring(0, index) + "<svg:title>New</svg:title></draw:frame>";
      }
    }    
    
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

  protected String createNewElement(ConversionContext context, Object input)
  {
    try
    {
      Range frame = (Range) input;
      String xml = "";
      
      if(frame instanceof DrawFrameRange)
      {
    	  if(frame.usage==RangeType.IMAGE)
    		  xml = "<draw:frame><draw:image xlink:type=\"simple\" xlink:show=\"embed\" xlink:actuate=\"onLoad\"></draw:image></draw:frame>";
    	  else if(frame.usage==RangeType.CHART)
    		  xml = "<draw:frame>" +
    		        "<draw:object xlink:actuate=\"onLoad\" xlink:show=\"embed\" xlink:type=\"simple\"/>" +
    		  		"</draw:frame>";
    	  if(((DrawFrameRange) frame).alt != null)
    	  {
    		 int index = xml.indexOf("</draw:frame>");
    		 if(index != -1)
    		   xml = xml.substring(0, index) + "<svg:title>New</svg:title></draw:frame>";
    	  }
      }
      else
      {
          xml = "<draw:frame></draw:frame>";
      }
      return xml;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "can not create a draw frame", e);
    }
    return null;
  }

  protected String getNodeId(Object input)
  {
    Range image = (Range)input;
    return image.rangeId;
  }
  
}
