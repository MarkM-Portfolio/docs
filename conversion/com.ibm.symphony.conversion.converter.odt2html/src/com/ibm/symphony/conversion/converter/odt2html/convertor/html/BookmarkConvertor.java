/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class BookmarkConvertor extends GeneralHtmlConvertor
{
  protected void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {
    super.convertAttributes(context, element, htmlNode);
    
    String textName = element.getAttribute(ODFConstants.TEXT_NAME);
    if(textName.length()>0 && !ODFConstants.TEXT_BOOKMARK_END.equals(element.getNodeName()))
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.NAME, textName);
    
    String textRefName = element.getAttribute(ODFConstants.TEXT_REF_NAME);
    if(textRefName.length()>0)
    {
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CKE_SAVED_HREF, "#"+textRefName);
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.HREF, "#"+textRefName);
    }
    String referenceFormat = element.getAttribute(ODFConstants.TEXT_REF_FORMAT);
    if(referenceFormat.length()>0)
    {
      HtmlConvertorUtil.setAttribute(htmlNode,"_format", referenceFormat);
    }
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CLASS, "bookmark", false);
//    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CONTENT_EDITABLE, "false", false);
//    HtmlConvertorUtil.setAttribute(htmlNode,"unselectable", "on", false);
  }
  
  protected void convertChildren(ConversionContext context, OdfElement element, Node htmlNode)
  {
    Document doc = (Document) context.getTarget();
    String ref = element.getAttribute(ODFConstants.TEXT_RELATIVE_CONTEXT_CHAPTER_REF);
    String text = element.getTextContent();
    Text textNode = null;
    if(ref != null && "true".equals(ref.toLowerCase()))
    {
      String con = element.getAttribute(ODFConstants.TEXT_RELATIVE_CONTEXT_CHAPTER_CON);
      if(con != null && !"".equals(con))
      {
        HtmlConvertorUtil.setAttribute((Element) htmlNode,"_bookmark", text, false);
        textNode = doc.createTextNode(con);
      }
    }
    else
    {
      if(text != null && !"".equals(text))
      {
        textNode = doc.createTextNode(text);
      }
    }
    
    if(textNode != null)
    {
      Node parentNode = htmlNode.getParentNode();
      if(parentNode.getNodeName().equals(HtmlCSSConstants.SPAN))
      {
        if(parentNode.getFirstChild().getNextSibling() == null)// <span> just have one child which is <a>
        {
          Node ancestorNode = parentNode.getParentNode();
          Node parentNodeSibling = parentNode.getNextSibling();
          ancestorNode.removeChild(parentNode);
          parentNode.removeChild(htmlNode);
          if(parentNodeSibling == null)
          {
            ancestorNode.appendChild(htmlNode);
          }
          else
          {
            ancestorNode.insertBefore(htmlNode, parentNodeSibling);
          }
          htmlNode.appendChild(parentNode);
          parentNode.appendChild(textNode);
          return;
        }
      }
      htmlNode.appendChild(textNode);
    }
  }
}
