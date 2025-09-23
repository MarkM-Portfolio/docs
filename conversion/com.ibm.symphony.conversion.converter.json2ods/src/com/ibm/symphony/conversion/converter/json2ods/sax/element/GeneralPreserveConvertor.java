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

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Node;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.service.common.ConversionContext;

/*
 * For chart document, since we won't remove any element, so the workflow will not the same with the eidtable sheets.
 * the input will be always odf element instead of json data
 * 
 */

public class GeneralPreserveConvertor extends GeneralConvertor
{
  protected boolean bOutputAtEnd = false;
  public void convert(ConversionContext context,TransformerHandler mXmlWriter,Object input, Object output)
  {
    this.mXmlWriter = mXmlWriter;
    Object obj = context.get("bOutputAtEnd");
    if(null != obj)
      bOutputAtEnd = (Boolean)obj;
    else
      bOutputAtEnd = false;
    if(!bOutputAtEnd)
    {
      if(input instanceof Text || output instanceof Text)
      {
        outputText(input);
        return;
      }
    }
    OdfElement parent = (OdfElement)output;
    this.startElement(context,input);
    target = this.convertElement(context, input,parent);
    this.id = getNodeId(input);
    this.doPreserve(context, target,parent);
    if(!bOutputAtEnd)
      startOutput();
    this.convertChildren(context,mXmlWriter, input, target);
    if(!bOutputAtEnd)
      endOutput();
  }
  
  protected void flush(Node element)
  {
    if(element == null)
      return;

    Node head = element.getFirstChild();
    startOutput(element);
    while(head!=null)
    {
      head = head.getNextSibling();
      if(head instanceof Text)
      {
        outputText(head);
      }
      else
        flush(head);
    }
    endOutput(element);
  }
  
  public void buildDOMNode(ConversionContext context,TransformerHandler mXmlWriter,Object input, Object output)
  {
    this.mXmlWriter = mXmlWriter;
    if(input instanceof Text || output instanceof Text)
    {
      return;
    }
    OdfElement parent = (OdfElement)output;
    this.startElement(context,input);
    target = this.convertElement(context, input,parent);
    this.id = getNodeId(input);
    this.doPreserve(context, target,parent);
    this.buildChildren(context,mXmlWriter, input, target);
  }
  
  public void buildChildren(ConversionContext context,TransformerHandler mXmlWriter,Object input,OdfElement element)
  {
    if(element == null)
      return;

    Node head = element.getFirstChild();
    
    while(head!=null)
    {
      String nodeName = head.getNodeName();
      PreserveConvertorFactory.getInstance().getConvertor(nodeName).buildDOMNode(context, mXmlWriter,head, element);
      head = head.getNextSibling();
    }
  }
  
  public void convertChildren(ConversionContext context,TransformerHandler mXmlWriter,Object input,OdfElement element)
  {
    if(element == null)
      return;

    Node head = element.getFirstChild();
    
    while(head!=null)
    {
      String nodeName = head.getNodeName();
      PreserveConvertorFactory.getInstance().getConvertor(nodeName).convert(context,mXmlWriter, head, element);
      head = head.getNextSibling();
    }
  }
}
