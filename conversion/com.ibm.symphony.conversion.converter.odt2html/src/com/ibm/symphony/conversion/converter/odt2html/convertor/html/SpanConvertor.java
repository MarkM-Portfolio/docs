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

import java.util.HashMap;
import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;

public class SpanConvertor extends GeneralHtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    //Blank span is forbidden under body
    if(parent.getNodeName().equals(HtmlCSSConstants.BODY))
      return;
    
    Document doc = (Document) context.getTarget();
    
    if (AnchorConvertor.isInTOC(element))
    {
      Element span = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.SPAN);
      parent.appendChild(span);
      convertAttributes(context, element, span);
      
      // in toc, drop the page number, refine the link.
      NodeList children = element.getChildNodes();
      int length = children.getLength();
      Node lastChild = children.item(length - 1);
      if( isPageNumber(element, lastChild) )
        length--;
      
      for (int i = 0; i < length; i++)
      {
        Node node = children.item(i);
        if (node instanceof OdfElement)
        {
          OdfElement child = (OdfElement) node;
          IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(child);
          convertor.convert(context, child, span);

        }
        else if (node instanceof Text)
        {
          Text txtNode = (Text) node;
          String txt = txtNode.getNodeValue();
          txt = HtmlConvertorUtil.replaceContinuousSpaceWithNbsp(txt);// replace space with nbsp
          Text txtChild = doc.createTextNode(txt);
          span.appendChild(txtChild);
        }
      }
      
      HtmlConvertorUtil.removeDivOutOfSpan(span, null);
      addIDToSpan(context, span, element);
    }
    else
    {
      super.doConvertHtml(context, element, parent);
      Node spanNode = parent.getLastChild();
      if(HtmlCSSConstants.SPAN.equals(spanNode.getNodeName()))
      {
        HtmlConvertorUtil.removeDivOutOfSpan((Element) spanNode, null);
        addIDToSpan(context, (Element) spanNode, element);
      }
    }
  }
  
  //defect 11591. If span contains unsupported element, need to add id to span for export preserve.
  private void addIDToSpan(ConversionContext context, Element span, OdfElement element)
  {
    String id = span.getAttribute(HtmlCSSConstants.ID);
    if((id == null || "".equals(id)) && HtmlConvertorUtil.isUnsupportElement(context, element))
    {
      context.getOdfToHtmlIndexTable().addEntryByOdfNodeWithForceId(element, span, IndexUtil.RULE_NORMAL);
    }
  }

  @Override
  protected void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");
    String styleName = element.getAttribute(ODFConstants.TEXT_STYLE_NAME);
    Map<String,String> styleMap = map.get(styleName);
    Map<String,String> tmpStyle = null;
    if( styleMap != null && styleMap.size() > 0)
    {
      String textDecoration = styleMap.get(HtmlCSSConstants.TEXT_DECORATION);
      if( textDecoration == null || "".equals(textDecoration))
      {
        String parentTextDecoration = getDecorationFromParentSpan( element,map  );
        if( parentTextDecoration != null )
        {
          tmpStyle=new HashMap<String,String>();
          tmpStyle.put(HtmlCSSConstants.TEXT_DECORATION, parentTextDecoration);
          context.put("tmpStyle", tmpStyle);
        }
      }
    }    
    String windowFontColor = HtmlConvertorUtil.getWindowFontColor(context, element);
    if( windowFontColor != null) 
    {
      if( tmpStyle == null)
        tmpStyle=new HashMap<String,String>();
      tmpStyle.put(HtmlCSSConstants.COLOR, windowFontColor);
    }
    if( tmpStyle != null)
      context.put("tmpStyle", tmpStyle);
    super.convertAttributes(context, element, htmlNode);
  }
  
  private static String getDecorationFromParentSpan(OdfElement element, Map<String, Map<String, String>> map )
  {
    OdfElement parent = (OdfElement) element.getParentNode();
    
    if( parent!=null && ODFConstants.TEXT_SPAN.equals(parent.getNodeName()))
    {
      String styleName = parent.getAttribute(ODFConstants.TEXT_STYLE_NAME);
      Map<String,String> styleMap = map.get(styleName);
      if( styleMap != null && styleMap.size() > 0)
      {
        String textDecoration = styleMap.get(HtmlCSSConstants.TEXT_DECORATION);        
        if(textDecoration != null && textDecoration.length() > 0)
        {
// Comment below code for Defect 2492, need to add text-decoration to the son Span. 
// Below code added for defect 45140. Comment below code couldn't reproduce that defect now.
//          if(element.getTextContent().trim().equals(parent.getTextContent().trim()))
//          	return null;
//          else
            return textDecoration;
        }
      } 
      return getDecorationFromParentSpan(parent, map);
    }
    return null;
  }
  
  private static boolean isPageNumber(OdfElement parent, Node lastNode)
  {
    // Just a page number
    if(!( lastNode instanceof Text && ((Text) lastNode).getWholeText().matches("\\d+")) )
      return false;
    
    // <text:p><text:span>...... 1</text:span></text:p>
    if(ODFConstants.TEXT_P.equals(parent.getParentNode().getNodeName()) && parent.getNextSibling() == null)
      return true;
    
    // <text:p><text:a><text:span>...... 1</text:span></text:a></text:p>
    Node grandParent = parent.getParentNode();
    if(ODFConstants.TEXT_P.equals(grandParent.getParentNode().getNodeName()) && grandParent.getNextSibling() == null && parent.getNextSibling() == null)
      return true;
    
    return false;
  }
}
