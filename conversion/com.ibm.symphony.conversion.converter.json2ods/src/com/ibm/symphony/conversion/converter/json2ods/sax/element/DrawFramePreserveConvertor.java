package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawAElement;
import org.odftoolkit.odfdom.dom.element.draw.DrawImageElement;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class DrawFramePreserveConvertor extends GeneralPreserveConvertor
{
  public void buildChildren(ConversionContext context,TransformerHandler mXmlWriter,Object input,OdfElement element)
  {
    if(element == null)
      return;

    NodeList children = element.getChildNodes();
    int length = children.getLength();
    
    if(length == 1 && children.item(0) instanceof DrawImageElement)
    {
      Node p = element.getParentNode();
      Node pp = p.getParentNode();
      if( pp instanceof DrawAElement)
      {
        pp.getParentNode().removeChild(pp);
      }
      else
        element.getParentNode().removeChild(element);
    }
    else
    {
      for( int  i = 0; i < length; i++ )
      {
        Node child = children.item(i);
        String nodeName = child.getNodeName();
        PreserveConvertorFactory.getInstance().getConvertor(nodeName).buildDOMNode(context,mXmlWriter, child, element);
      }
    }
  }
  
  public void convertChildren(ConversionContext context,TransformerHandler mXmlWriter,Object input,OdfElement element)
  {
    if(element == null)
      return;

    NodeList children = element.getChildNodes();
    int length = children.getLength();
    
    if(length == 1 && children.item(0) instanceof DrawImageElement)
    {
      Node p = element.getParentNode();
      Node pp = p.getParentNode();
      if( p instanceof DrawAElement || pp instanceof DrawAElement )
      {
        pp.removeChild(p);
      }
      else
        p.removeChild(element);
    }
    else
    {
      for( int  i = 0; i < length; i++ )
      {
        Node child = children.item(i);
        if(child instanceof Text)
        {
          
        }
        String nodeName = child.getNodeName();
        PreserveConvertorFactory.getInstance().getConvertor(nodeName).convert(context,mXmlWriter, child, element);
      }
    }
  }
}
