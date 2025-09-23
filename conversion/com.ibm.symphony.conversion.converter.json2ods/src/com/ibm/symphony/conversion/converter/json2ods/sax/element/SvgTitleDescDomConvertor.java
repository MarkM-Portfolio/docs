package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.List;
import javax.xml.transform.sax.TransformerHandler;
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.svg.SvgTitleElement;
import org.w3c.dom.Node;
import org.w3c.dom.Text;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;


public class SvgTitleDescDomConvertor extends GeneralConvertor
{
  private Object parentInput;
  String src;
  protected OdfElement createNewElement(ConversionContext context,Object input,OdfElement parent)
  {
    OdfFileDom contentDocument = (OdfFileDom) context.get("Target");
    SvgTitleElement element = new SvgTitleElement(contentDocument);
    return element;
  }
  
  public void setInput(Object input)
  {
    this.parentInput = input;
  }
  
  protected void setAttributes(ConversionContext context,Object input,OdfElement element)
  {
    
  }

  public void convert(ConversionContext context,TransformerHandler mXmlWriter,Object input, Object output)
  {
	this.mXmlWriter = mXmlWriter;
	if(output instanceof Text)
	  return;
	OdfElement parent = (OdfElement)output;
	if(parentInput instanceof DrawFrameRange)
	{
	  DrawFrameRange range = (DrawFrameRange)parentInput;
	  src = range.alt;
	  if(src == null)
		  src = "";
	}
	Node text = ((Node) input).getFirstChild();
	text.setNodeValue(src);
	this.startElement(context,input);
	OdfElement element = this.convertElement(context, input,parent);
	if(element==null)
	  return;
	target = element;
	startOutput();
	if(text instanceof Text)
	{
	  outputText(text);
	}
	endOutput();
  }
  
  protected void convertChildren(ConversionContext context,TransformerHandler mXmlWriter ,Object input,OdfElement element)
  {

  }
  
  protected void appendElement(ConversionContext context,TransformerHandler mXmlWriter,List<OdfElement> pList, OdfElement parent)
  {
  }
  
}
