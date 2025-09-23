/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.html;

import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSStyleConvertorFactory;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class AnchorConvertor extends GeneralXMLConvertor
{
  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    Node childNode = htmlElement.getFirstChild();
    if(childNode != null && HtmlCSSConstants.IMG.equals(childNode.getNodeName()))
    {
      String type = ((Element) childNode).getAttribute("_type");
      if(type == null || !type.equals("shape"))
      {
        HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
        OdfElement drawA = indexTable.getFirstOdfNode(htmlElement);
        if (drawA == null)
          drawA = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.DRAW_A));
        
        convertAttributes(context, htmlElement, drawA);
        
        if(ODFConstants.DRAW_FRAME.equals(parent.getNodeName()))
        {
          convertChildren(context, htmlElement, parent);
          Node temp = parent.getNextSibling();
          if(temp == null)
            parent.getParentNode().appendChild(drawA);
          else
            parent.getParentNode().insertBefore(drawA, temp);
          
          drawA.appendChild(parent);
          String drawStyleName = parent.getAttribute(ODFConstants.DRAW_STYLE_NAME);
          ((OdfStylableElement) parent).setStyleName(drawStyleName);
        }
        else
        {
          parent.appendChild(drawA);
          convertChildren(context, htmlElement, drawA);
        }
        
        return;
      }
    }
    
    if(htmlElement.getParentNode().getNodeName().equals(HtmlCSSConstants.LI))
    {
      try
      {
        OdfElement odfElement = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_P));     
        parent.appendChild(odfElement);
        parent = odfElement;
      }
      catch (Exception e)
      {
        XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ELEMENT, e);
      }
    }
    
    if(isRealBookmark(htmlElement))
    {
      convertBookmark(context, htmlElement, parent);
      return;
    }
    
    super.doConvertXML(context, htmlElement, parent);
  }
  
  // This part is for handle fake bookmark. If bookmark is readonly, this func could be removed.
  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null && !ODFConstants.TEXT_BOOKMARK_REF.equals(odfElement.getNodeName()))// fake bookmark exported as hyperlink
    {
      parent.appendChild(odfElement);
      return odfElement;
    }
    String className = htmlElement.getAttribute(HtmlCSSConstants.CLASS);
    if("bookmark".equals(className))//handle fake bookmark
    {
      NodeList nodeList = htmlElement.getChildNodes();
      int len = nodeList.getLength();
      for(int i=0; i<len; i++)
      {
        Node node = nodeList.item(i);
        if(HtmlCSSConstants.SPAN.equals(node.getNodeName()) )
        {
          String spanStyle = ((Element) node).getAttribute(HtmlCSSConstants.STYLE);
          if(!spanStyle.contains(HtmlCSSConstants.COLOR) || !spanStyle.contains(HtmlCSSConstants.TEXT_DECORATION))
          {
            Map<String, String> map = ConvertUtil.buildCSSMap(spanStyle);
            if(!map.containsKey(HtmlCSSConstants.COLOR))
              map.put(HtmlCSSConstants.COLOR, "black");
            if(!map.containsKey(HtmlCSSConstants.TEXT_DECORATION))
              map.put(HtmlCSSConstants.TEXT_DECORATION, "none");
            ((Element) node).setAttribute(HtmlCSSConstants.STYLE, ConvertUtil.convertMapToStyle(map));
          }
        }
      }
    }
    
    return XMLConvertorUtil.convertElement(context, htmlElement, parent);
  }
  
  protected void convertAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    String href = htmlElement.getAttribute(HtmlCSSConstants.CKE_SAVED_HREF);
    if(href != null && href.length() != 0)
      odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_HREF), href);
    String target = htmlElement.getAttribute(HtmlCSSConstants.TARGET);
    if(target != null && target.length() != 0)
      odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.OFFICE_TARGET_FRAME_NAME), target);
  }
  
  // <a class="bookmark">xxx</a> or <a class="bookmark"><span>xxxx</span></a> will be treated as bookmark or else treated as hyperlink
  // If bookmark readonly, bookmark will be always this kind of structure. And don't need to judge bookmark is real or fake. 
  private boolean isRealBookmark(Element htmlElement)
  {
    String className = htmlElement.getAttribute(HtmlCSSConstants.CLASS);
    if(!"bookmark".equals(className))
      return false;
    
    Node node = htmlElement.getFirstChild();
    if(node == null)
      return true;
    else if(node != null && node.getNextSibling() == null)
    {
      if(node instanceof Text)
        return true;
      else if(node.getNodeName().equals(HtmlCSSConstants.SPAN))
      {
        Node childNode = node.getFirstChild();
        if(childNode == null)
          return true;
        if(childNode != null && childNode.getNextSibling() == null && childNode instanceof Text)
          return true;
      }
    }
    
    return false;
  }
  
  private void convertBookmark(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    String spanStyle = null;
    Element spanNode = null;
    Node node = htmlElement.getFirstChild();
    if(node != null && node.getNodeName().equals(HtmlCSSConstants.SPAN))
    {
      spanNode = (Element) node;
      spanStyle = spanNode.getAttribute(HtmlCSSConstants.STYLE);
      node = node.getFirstChild();
    }
    
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    
    //old bookmark || new bookmark(copy&paste)
    if(odfElement != null || odfElement == null && node != null && node instanceof Text)
    {
      if (odfElement == null)// new bookmark
      {
        odfElement = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_BOOKMARK_REF));
        String value = node.getNodeValue();
        String text = htmlElement.getAttribute("_bookmark");
        if(text != null && text.length() > 0)
        {
          odfElement.appendChild(XMLConvertorUtil.getCurrentFileDom(context).createTextNode(text));
          odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_RELATIVE_CONTEXT_CHAPTER_CON), value);
          odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_RELATIVE_CONTEXT_CHAPTER_REF), "true");
        }
        else
        {
          odfElement.appendChild(XMLConvertorUtil.getCurrentFileDom(context).createTextNode(value));
        }
        
        String href = htmlElement.getAttribute(HtmlCSSConstants.CKE_SAVED_HREF);
        if(href != null && href.length() > 1)
          odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_REF_NAME), href.substring(1));
        String format = htmlElement.getAttribute("_format");
        if(format != null && format.length() != 0)
          odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_REF_FORMAT), format);
      }
      else if(node != null)// old bookmark. When bookmark isn't readonly, the text under it maybe modified. So couldn't preserve it. If readonly, delete this part.
      {
        odfElement.removeChild(odfElement.getFirstChild());
        
        String value = node.getNodeValue();
        String text = htmlElement.getAttribute("_bookmark");
        if(text != null && text.length() > 0)
        {
          odfElement.appendChild(XMLConvertorUtil.getCurrentFileDom(context).createTextNode(text));
          odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_RELATIVE_CONTEXT_CHAPTER_CON), value);
        }
        else
        {
          odfElement.appendChild(XMLConvertorUtil.getCurrentFileDom(context).createTextNode(value));
        }
      }
        
      if(spanStyle != null && spanStyle.length()>0)
      {
        OdfElement spanElement = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_SPAN));
        CSSStyleConvertorFactory.getInstance().getConvertor(OdfStyleFamily.Text).convertStyle(context, spanNode, spanElement, null, spanStyle);
        parent.appendChild(spanElement);
        spanElement.appendChild(odfElement);
      }
      else
        parent.appendChild(odfElement);
    }
  }

}
