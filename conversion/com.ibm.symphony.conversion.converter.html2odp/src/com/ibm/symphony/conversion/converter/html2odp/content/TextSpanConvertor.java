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

import java.util.Iterator;
import java.util.Map;
import java.util.TreeMap;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class TextSpanConvertor extends GeneralODPConvertor
{
 
  @SuppressWarnings("restriction")
  @Override
  protected void doContentConvert(ConversionContext context, Element htmlNode, OdfElement odfParent)
  {   
    
    String odfNodeName = getOdfNodeName(htmlNode);
    String odfParentName = odfParent.getNodeName();
    if (odfParentName.equals(ODPConvertConstants.ODF_ELEMENT_TEXT_A))
    {
      // We want to ignore the span and put the text item directly under the A. Symphony doesn't seem to like
      // the span element surrounding the text - this causes the link not to show up in the editor.
      convertChildren(context, htmlNode, odfParent);
    }
    else
    {
      HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
      if (indexTable.isHtmlNodeIndexed(htmlNode))
      {
        super.doContentConvert(context, htmlNode, odfParent);
        return;
      }
     
      if(htmlNode.hasChildNodes())
      {
        fixNestedSpans(htmlNode);
        if(!htmlNode.hasChildNodes())
          return;
      }
      NodeList cNodes = htmlNode.getChildNodes();
      //Editor will add empty span with 8203 follow a text-line-break BR.
      //Ignore this empty span to make ODF Elements clean.
      if(cNodes != null && cNodes.getLength() == 1) {
    	  Node child = cNodes.item(0);
    	  String sv = child.getNodeValue();
          if(sv == null || sv.isEmpty()) 
        	  return;
          Node brNode = htmlNode.getPreviousSibling();
          if(brNode != null && brNode.getNodeName().toLowerCase().equalsIgnoreCase("br") && brNode.hasAttributes()) {
        	  String clsString = ((Element)brNode).getAttribute("class");
        	  if(clsString != null && clsString.contains("text_line-break")){
        		  if(sv.equalsIgnoreCase(String.valueOf((char) 8203)))
        	          	return;
        	  }
          }
      }
      OdfFileDom contentDom = (OdfFileDom) context.get(ODPConvertConstants.CONTEXT_CONVERT_TARGET);

      OdfElement odfElement = contentDom.createElementNS(ContentConvertUtil.getNamespaceUri(odfNodeName), odfNodeName);
      removeSpacePlaceholder(htmlNode);
      parseAttributes(context, htmlNode, odfElement, odfParent);
   // krings - check to see if this is a field... if so call utility routine for special processing
      // We do not want to append the span if it is a field, otherwise it will appear twice in Symphony (once for the span and once for the field)
      boolean isField = ContentConvertUtil.isField(context);
      if (isField)
        ContentConvertUtil.handleFields(context, odfParent, odfElement);
      else
        odfParent.appendChild(odfElement);
      convertChildren(context, htmlNode, odfElement);

    }
  }

  private void fixNestedSpans(Element htmlNode)
  {
    Map<String, String> styleMap = null;
    String style = htmlNode.getAttribute("style");
    if(style != null && style.trim().length() > 0)
      styleMap = ConvertUtil.buildCSSMap(style);

    if(htmlNode.hasChildNodes())
    {
      NodeList childs = htmlNode.getChildNodes();
      Node child = childs.item(0);
      while(child != null)
      {
        if((child instanceof Element) && child.getNodeName().equals(ODPConvertConstants.HTML_ELEMENT_SPAN))
        {
          //if same attr(style && class - all same and child less than parent),Move childs before current child,remove the span,and set next child to first moved child.
          //if not same,-- move current child to be next sbling and update the attrs to be merged of parent and child.
          //            -- new copy of parent,append afer new sbling,move all right sblings under it. 
          //            -- if no child after reorg, return to convert next child else start convert current.
          Map<String, String> childStyleMap = null;
          String childStyle = ((Element)child).getAttribute("style");
          if(childStyle != null && childStyle.trim().length() > 0)
            childStyleMap = ConvertUtil.buildCSSMap(childStyle);

          boolean toParent = true;

          if(childStyleMap != null)
          {
            if(styleMap == null || styleMap.size() < childStyleMap.size())
              toParent = false;
            else
            {
              Iterator<String> keys = childStyleMap.keySet().iterator();
              while(keys.hasNext())
              {
                String key = keys.next();
                if(!(styleMap.containsKey(key) && styleMap.get(key).equals(childStyleMap.get(key))))
                {
                  toParent = false;
                  break;
                }
              }
            }
          }

          if(toParent)
            child = mergeToParent(child,htmlNode);
          else
          {
            if(childStyleMap != null)
            {
              if(styleMap == null)
                styleMap = new TreeMap<String, String>();
              String fontSizeParent = styleMap.get(ODPConvertConstants.CSS_FONT_SIZE);
              String fontSizeChild = childStyleMap.get(ODPConvertConstants.CSS_FONT_SIZE);
              styleMap.putAll(childStyleMap);
              if(fontSizeParent != null && fontSizeChild != null)
              {
                int lenParent = fontSizeParent.length();
                int lenChild = fontSizeChild.length();
                if(lenParent > 2 && fontSizeParent.endsWith("em") && lenChild > 2 && fontSizeChild.endsWith("em"))
                {
                  double val1 = Double.parseDouble(fontSizeParent.substring(0, lenParent-2));
                  double val2 = Double.parseDouble(fontSizeChild.substring(0, lenChild-2));
                  styleMap.put(ODPConvertConstants.CSS_FONT_SIZE, val1*val2+"em");
                }
              }
            }
            splitFromParent(child,htmlNode,styleMap);
             break;
          }
        }
        else
          child = child.getNextSibling();
      }
    }
  }

  private void splitFromParent(Node node, Element parent, Map<String, String> newStyleMap)
  {
    Node ref = parent.getNextSibling();
    Node topParent = parent.getParentNode();
    if(node.getNextSibling() != null)
    {
      Node dupParent = parent.cloneNode(false);
      topParent.insertBefore(dupParent, ref);
      ref = dupParent;
      Node moveNode = node.getNextSibling();
      while(moveNode != null)
      {
        dupParent.appendChild(moveNode.cloneNode(true));
        parent.removeChild(moveNode);
        moveNode = node.getNextSibling();
      }
    }
    Node curNode = node.cloneNode(true);
    topParent.insertBefore(curNode, ref);
    parent.removeChild(node);
    if(newStyleMap != null)
    {
      String style = ConvertUtil.convertMapToStyle(newStyleMap);
      ((Element)curNode).setAttribute("style", style);
    }
  }

  private Node mergeToParent(Node node, Node parent)
  {
    Node ref = node.getNextSibling();
    
    NodeList childs = node.getChildNodes();
    for(int i=0; i< childs.getLength();i++)
    {
      parent.insertBefore(childs.item(i), ref);
    }
    Node re = node.getNextSibling();
    parent.removeChild(node);

    return re;
  }
}
