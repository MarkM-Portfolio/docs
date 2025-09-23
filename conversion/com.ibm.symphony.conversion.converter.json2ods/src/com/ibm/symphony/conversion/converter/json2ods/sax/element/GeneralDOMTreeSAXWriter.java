/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.doc.style.OdfStyleTableProperties;
import org.odftoolkit.odfdom.dom.element.office.OfficeBodyElement;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

public class GeneralDOMTreeSAXWriter
{
  TransformerHandler hdl; 
  public GeneralDOMTreeSAXWriter(TransformerHandler hdl)
  {
    this.hdl = hdl;
  }
  
  public void outputXML(ConversionContext context, Node node)
  {
    int type = node.getNodeType();
    switch (type)
    {
      case Node.DOCUMENT_NODE :
      {
        outputXML(context,((Document) node).getDocumentElement());
        break;
      }
      case Node.ELEMENT_NODE :
      {
        output(context,node);
        break;
      }
      default:
        break;
    }
  }
  
  public void startOutput(Node node)
  {
    String qName = node.getNodeName();
    NamedNodeMap map = node.getAttributes();
    AttributesImpl attrs = null;
    if(map !=null)
    {
    int len = map.getLength();
    if(len > 0 )
      attrs = new AttributesImpl();
    for(int i = 0; i< len; i++)
    {
      Node attr = map.item(i);
      attrs.addAttribute(attr.getBaseURI(), "", attr.getNodeName(), "", attr.getNodeValue());
    }
    }
    try
    {
      hdl.startElement(node.getBaseURI(), node.getLocalName(), qName, attrs);
    }
    catch (SAXException e)
    {
      e.printStackTrace();
    }
  }
  
  public void output(ConversionContext context, Node node)
  {
    startOutput(node);
    outputChildren(context,node);
    endOutput(node);
  }
  
  protected void endOutput(Node node)
  {
    String qName = node.getNodeName();
    try
    {
      if( qName == null)
        return;
      hdl.endElement(node.getBaseURI(), node.getLocalName(), qName);
    }
    catch (SAXException e)
    {
      e.printStackTrace();
    }
  }
  
  private void outputChildren(ConversionContext context, Node parent)
  {
    NodeList children = parent.getChildNodes();
    int cLen = children.getLength();

    for( int i = 0; i< cLen; i++)
    {
      Node child = children.item(i);
      if(child instanceof Text)
      {
        Text text = (Text)child;
        String textData = text.getData();
        char[] ctext = textData.toCharArray();
        try
        {
          hdl.characters(ctext, 0, ctext.length);
        }
        catch (SAXException e)
        {
          e.printStackTrace();
        }
      }
      else if(child.getFirstChild() instanceof OdfStyleTableProperties)
      {
          TablePropertiesConvertor.getInstance().convert(context, child);
          output(context,child);
      }
      else if(child instanceof OfficeBodyElement)
      {
        OfficeBodyElement officeBody = (OfficeBodyElement)child;
        startOutput(child);
        OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_OFFICE_SPREADSHEET).convert(context,hdl, officeBody.getFirstChild(), officeBody);
        endOutput(child);
      }
      else
        output(context,child);
    }
    
  }
  
  
}
