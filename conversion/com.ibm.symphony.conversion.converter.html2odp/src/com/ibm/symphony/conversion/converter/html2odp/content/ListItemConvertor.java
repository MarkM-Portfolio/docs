/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.content;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.xerces.dom.ElementImpl;
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import symphony.org.w3c.tidy.DomUtil;

import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.CSSProperties;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class ListItemConvertor extends AbstractODPConvertor
{
  private static final Set<String> pStyleSet = new HashSet<String>();
  {
    pStyleSet.add(HtmlCSSConstants.TEXT_ALIGN);
    pStyleSet.add(HtmlCSSConstants.LINE_HEIGHT);
  }

  /**
   * Convert the List Item from html to ODF
   * 
   * @param context
   *          - The conversion context
   * @param htmlNode
   *          - the html element containing the list element
   * @param odfParent
   *          - the ODF parent element
   */
  @SuppressWarnings("restriction")
  protected void doContentConvert(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = null;
    if (indexTable.isHtmlNodeIndexed(htmlNode))
    {
      odfElement = indexTable.getFirstOdfNode(htmlNode);
    }
    else
    {
      String odfNodeName = getOdfNodeName(htmlNode);
      OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);
      odfElement = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(odfNodeName), odfNodeName);
      indexTable.addEntryByHtmlNode(htmlNode, odfElement);
    }

    odfParent.appendChild(odfElement);
    context.put("CurrentListItemElement", odfElement);
    convertChildren(context, htmlNode, odfElement);
  }
  
  protected void convertChildren(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    Node element = odfElement.getFirstChild();
    // TODO: workaround for D33886 by indicating list-item without old text:p from odf
    String id = odfElement.getAttribute("id");
    String newStr = (String) context.get(ODPConvertConstants.CONTEXT_UNIQUE_ID); 
    if (newStr == null || newStr.isEmpty())
    {
    	// TODO: there must be sth wrong if it goes here!
    	String uniqueId = DOMIdGenerator.generate();
    	newStr = uniqueId.substring(uniqueId.length()-5);
    	context.put(ODPConvertConstants.CONTEXT_UNIQUE_ID, uniqueId);
    }
    else
    {
    	newStr = newStr.substring(newStr.length()-5);
    }

    if (id != null && !id.contains(newStr))
    {
        while(element != null)
        {
          if(element.getNodeName().equals(ODPConvertConstants.ODF_ELEMENT_TEXT_PARAGRAPH))
          {
            Node temp = element;
            element = element.getNextSibling();
            odfElement.removeChild(temp);
          }
          else
            break;
        }
        odfElement.setAttribute("id", id + "_" + newStr);
    }

    String pStyleName = getPStyleName(htmlElement);
    String lhd = null;
    String customStyle = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE);
    if (customStyle.contains("abs-"+ODPConvertConstants.CSS_LINE_HEIGHT)) 
    {
    	CSSProperties absLHcp = new CSSProperties(htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);
    	lhd = absLHcp.getProperty("abs-"+ODPConvertConstants.CSS_LINE_HEIGHT);
    }
    Node pNode = null;
    NodeList nodelist = htmlElement.getElementsByTagName(ODPConvertConstants.HTML_ELEMENT_SPAN);
    String spanStyle = null;
    if(nodelist.getLength() == 1)
    {
      String className = ((Element) nodelist.item(0)).getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
      if(className == null || "".equals(className))// Convert this span to text:p
      { 
     	 Node spanNode = nodelist.item(0);
    	 if (spanNode != null && spanNode.getParentNode() != null
    		 && spanNode.getParentNode().getNodeName().equals(ODPConvertConstants.HTML_ELEMENT_TEXTA)) // under a, pnode keeps null
    	 {
    		 // do nothing
    	 }
    	 else
    	 {
    	   pNode = spanNode;
           replaceSPAN2P((Element) pNode);
           spanStyle = ((Element) pNode).getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    	 }
      }
    }

    if(pNode == null)
    {
      Document htmlDoc = (Document) context.getSource();
      pNode = htmlDoc.createElement(ODPConvertConstants.HTML_ELEMENT_P);
      Node node = htmlElement.getFirstChild();
      while(node != null)// Append all node under <li> to new <p>, append <p> to <li>. <p> will be converted to text:p
      {
        Node temp = node;
        node = node.getNextSibling();
        htmlElement.removeChild(temp);
        pNode.appendChild(temp);
      }
      
      htmlElement.appendChild(pNode);
    }
    
    if(pStyleName != null)
      ((Element) pNode).setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, pStyleName);
    
    // Editor could just add some attributes to paragraph, till now just text-align. Extract them from <li> style, then put them on pNode
    String style = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    StringBuilder newStyle = new StringBuilder();
    if(spanStyle != null)
      newStyle.append(spanStyle);
    Map<String, String> styleMap = ConvertUtil.buildCSSMap(style);
    Set<Entry<String, String>> entrySet= styleMap.entrySet();
    Iterator<Entry<String, String>> iter = entrySet.iterator();
    while(iter.hasNext())
    {
      Entry<String, String> entry = iter.next();
      if(pStyleSet.contains(entry.getKey()))
        newStyle.append(entry.getKey()).append(":").append(entry.getValue()).append(";");
    }
    ((Element) pNode).setAttribute(ODPConvertConstants.HTML_ATTR_STYLE, newStyle.toString());
    if(lhd != null) {
      CSSProperties absLHcp = new CSSProperties(((Element) pNode).getAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE), true);
      absLHcp.setProperty("abs-"+ODPConvertConstants.CSS_LINE_HEIGHT, lhd);
      ((Element) pNode).setAttribute(ODPConvertConstants.HTML_ATTR_CUSTOMSTYLE, absLHcp.getPropertiesAsString());  
    }
    super.convertChildren(context, htmlElement, odfElement);
  }

  private String getPStyleName(Node htmlElement)
  {
    String pStyleName = null;
    String className = ((Element) htmlElement).getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    if(className != null)
    {
      String[] classNames = className.split(" ");
      for(int i=classNames.length-1; i>=0; i--)
      {
        String styleName = classNames[i].trim();
        if(!styleName.startsWith("lst-") && !styleName.startsWith("ML_") && !styleName.startsWith("MP_") 
            && !styleName.startsWith("MT_") && !styleName.startsWith("IL_"))
        {
          pStyleName = styleName;
          break;
        }
      }
    }
    return pStyleName;
  }
  /**
   * Replace the span with p and remove the display:block attribute (the reverse of import for text:list-header only lists.
   * 
   * @param htmlNode
   */
  private void replaceSPAN2P(Element htmlNode)
  {
    DomUtil.setElementName(htmlNode, HtmlCSSConstants.P);
  }
}
