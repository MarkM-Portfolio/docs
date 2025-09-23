package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.List;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.draw.DrawAElement;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;

public class DrawADomConvertor extends GeneralConvertor
{
  
  protected OdfElement createNewElement(ConversionContext context,Object input,OdfElement parent)
  {
    OdfFileDom contentDocument = (OdfFileDom) context.get("Target");
    if(input instanceof DrawFrameRange)
    {
    	DrawFrameRange image = (DrawFrameRange)input;
      if(ConversionUtil.hasValue(image.link))
      {
        DrawAElement drawA = new DrawAElement(contentDocument);
        return drawA;
      }
    }
    return null;
  }
  
  protected void setAttributes(ConversionContext context,Object input,OdfElement element)
  {
    if(input instanceof DrawFrameRange)
    {
    	DrawFrameRange image = (DrawFrameRange)input;
      if(ConversionUtil.hasValue(image.link))
      {
        ((DrawAElement)element).setXlinkHrefAttribute(image.link);
      }
    }
  }
  
  protected String getNodeId(Object input)
  {
    if(id != null && !"".equals(id))
      return id;
    if(input instanceof OdfElement)
    {
      String sId = ((OdfElement)input).getAttribute(IndexUtil.ID_STRING);
      if(sId!= null && !"".equals(sId))
      {
        this.id = sId;
      }
      return this.id;
    }
    else if(input instanceof Range)
    {
      return this.id = ((Range)input).rangeId;
    }
    return null;
  }
  
  protected OdfElement getOdfElement(ConversionContext context,Object input)
  {
    OdfFileDom contentDocument = (OdfFileDom) context.get("Target");
    if(input instanceof DrawFrameRange)
    {
    	DrawFrameRange image = (DrawFrameRange)input;
      if(ConversionUtil.hasValue(image.link))
      {
        DrawAElement drawA = new DrawAElement(contentDocument);
        return drawA;
      }
    }
    return null;
  }
  
  
  protected void convertChildren(ConversionContext context,TransformerHandler mXmlWriter ,Object input,OdfElement element)
  {
    if(element == null)
      return;
    if(input instanceof OdfElement)
    {
      Node head = element.getFirstChild();
      
      while(head!=null)
      {
        String nodeName = head.getNodeName();
        OdfElementConvertorFactory.getInstance().getConvertor(nodeName).convert(context,mXmlWriter, head, element);
        head = head.getNextSibling();
      }
    }
    else if( input instanceof Range)
    {
      OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_DRAW_FRAME).convert(context,mXmlWriter, input, element);
    }
  }
  
  protected void appendElement(ConversionContext context,TransformerHandler mXmlWriter,List<OdfElement> pList, OdfElement parent)
  {
  }
  
}
