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

import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class AnchorConvertor extends GeneralHtmlConvertor
{

  @SuppressWarnings("unchecked")
  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    if(ODFConstants.DRAW_A.equals(element.getNodeName()))
    {
      convertChildren(context, element, parent);
    }
    else if (isInTOC(element))
    {
      // in toc, drop the page number, refine the link.
      NodeList children = element.getChildNodes();
      if(children == null || children.getLength() == 0)
        return;
      
      int length = children.getLength();
      Node lastChild = children.item(length - 1);
      if( lastChild instanceof Text && ((Text) lastChild).getWholeText().matches("\\w+") )
        length--;
      
      if(length == 0)
        return;
      
      Document doc = (Document) context.getTarget();
      Element a = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.A);
      parent.appendChild(a);
      if("Index_20_Link".equals(element.getAttribute(ODFConstants.TEXT_STYLE_NAME)))
      {
        HtmlConvertorUtil.setAttribute(a, HtmlCSSConstants.CLASS, "toclink",false);
        if(HtmlCSSConstants.P.equals(parent.getNodeName()))
        {
          String parentStyle = parent.getAttribute(HtmlCSSConstants.STYLE);
          Map<String, String> parentStyleMap = ConvertUtil.buildCSSMap(parentStyle);
          if(parentStyleMap.containsKey(HtmlCSSConstants.COLOR) || parentStyleMap.containsKey(HtmlCSSConstants.TEXT_DECORATION))
          {
            StringBuilder sb = new StringBuilder();
            if(parentStyleMap.containsKey(HtmlCSSConstants.COLOR))
              sb.append(HtmlCSSConstants.COLOR).append(":").append(parentStyleMap.get(HtmlCSSConstants.COLOR)).append(";");         
            if(parentStyleMap.containsKey(HtmlCSSConstants.TEXT_DECORATION))
              sb.append(HtmlCSSConstants.TEXT_DECORATION).append(":").append(parentStyleMap.get(HtmlCSSConstants.TEXT_DECORATION)).append(";");
            HtmlConvertorUtil.setAttribute(a,HtmlCSSConstants.STYLE, sb.toString());
          }        
        }
      }
      
      for (int i = 0; i < length; i++)
      {
        Node node = children.item(i);
        if (node instanceof OdfElement)
        {
          OdfElement child = (OdfElement) node;
          IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(child);
          convertor.convert(context, child, a);

        }
        else if (node instanceof Text)
        {
          Text txtNode = (Text) node;
          String txt = txtNode.getNodeValue();
          txt = HtmlConvertorUtil.replaceContinuousSpaceWithNbsp(txt);// replace space with nbsp
          Text txtChild = doc.createTextNode(txt);
          a.appendChild(txtChild);
        }
      }
      
      String link = element.getAttribute(ODFConstants.XLINK_HREF);      
      if(link.length()>0)
      {
        HtmlConvertorUtil.setAttribute(a,HtmlCSSConstants.HREF, link);
        HtmlConvertorUtil.setAttribute(a,HtmlCSSConstants.CKE_SAVED_HREF, link);
        if(link.endsWith("|outline"))
          context.getHeadinglinkRefList().add(link.substring(1));
      }
    }
    else
    {
      super.doConvertHtml(context, element, parent);     
    }
  }

  public static boolean isInTOC(OdfElement element)
  {
    Node node = element;
    boolean inToc = false;
    do
    {
      node = node.getParentNode();
      if (node != null && ODFConstants.TEXT_INDEX_BODY.equals(node.getNodeName()))
      {
        inToc = true;
        break;
      }

    }
    while (node != null && !ODFConstants.OFFICE_TEXT.equals(node.getNodeName()));
    return inToc;
  }
  
  protected void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {
    super.convertAttributes(context, element, htmlNode);
      
    String target = element.getAttribute(ODFConstants.OFFICE_TARGET_FRAME_NAME);
    if(target.length()>0)
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.TARGET, target);
    
    String link = element.getAttribute(ODFConstants.XLINK_HREF);
    if( link.length() > 0)
    {  
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CKE_SAVED_HREF, link);
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.HREF, link);
      if(link.startsWith("#") && link.contains("|"))
      {
        if(link.endsWith("|outline"))
          context.getHeadinglinkRefList().add(link.substring(1));
      }
      htmlNode.removeAttribute(HtmlCSSConstants.SRC);
    }
  }
}
