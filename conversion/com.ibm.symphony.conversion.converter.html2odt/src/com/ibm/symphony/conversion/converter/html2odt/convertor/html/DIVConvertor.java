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

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSStyleConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.div.DrawframeConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.div.ParagraphDivConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.div.TOCConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.div.TextBoxConvertor;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class DIVConvertor extends GeneralXMLConvertor
{
  private static IConvertor paragraphDivConvertor = new ParagraphDivConvertor();
  private static IConvertor tocConvertor = new TOCConvertor();
  private static IConvertor drawframeConvertor = new DrawframeConvertor();
  private static IConvertor textboxConvertor = new TextBoxConvertor();

  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    List<OdfElement> odfElements = indexTable.getOdfNodes(htmlElement);
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);

    String _type = (String) htmlElement.getAttribute("_type");
    if (_type != null ) 
    {
      if ( _type.equals(HtmlCSSConstants.TOPDIV) || _type.equals(HtmlCSSConstants.LOCATIONDIV)  )    
      {
    	    String _sourceType = (String) htmlElement.getAttribute("_sourcetype");
    	    if (_sourceType != null  && _sourceType.equals("spanDiv") && parent.getNodeName().equals(ODFConstants.DRAW_TEXT_BOX)) 
    	    {
    	        OdfElement textPara = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_P));
    	        parent.appendChild(textPara);
    	        paragraphDivConvertor.convert(context, htmlElement, textPara);
    	    }
    	    else
    	    	paragraphDivConvertor.convert(context, htmlElement, parent);
        return;
      }
      else if (_type.indexOf("drawframe") != -1 )
      {
        if( _type.indexOf("group") != -1)
          return;
        drawframeConvertor.convert(context, htmlElement, parent);
        return;
      }
      else if (_type.indexOf("textbox") != -1)
      {
        if( _type.indexOf("group") != -1)
          return;
        textboxConvertor.convert(context, htmlElement, parent);
        return;
      }
    }

    String divclass = htmlElement.getAttribute("class");
    if (divclass != null)
    {
      if (divclass.startsWith("TOC_Imported") || divclass.equals("TOC placeholder_container"))
      {
        tocConvertor.convert(context, htmlElement, parent);
        return;
      }
      else if (divclass.equals("placeholder"))
      {
        if (odfElements.size() == 2 && odfElements.get(1) != null && ODFConstants.DRAW_FRAME.equals(odfElements.get(1).getNodeName()))
        {
          parent.appendChild(odfElements.get(1));
        }
        else
        {
          parent.appendChild(odfElement);
        }
        return;
      }
      else if (divclass.equals("pageLayout"))
      {
        parent.appendChild(odfElement);
        return;
      }
    }

    if (null != htmlElement.getAttribute("id") && htmlElement.getAttribute("id").equals("page-layout-info"))
      return;
    
    // This is header/footer
    if (isHFInContent(context, htmlElement, parent)) 
    {
      if (!context.get(Constants.TARGET_ROOT_NODE).equals(ODFConstants.OFFICE_TEXT))
      {
        IConvertor convertor = XMLConvertorFactory.getInstance().getConvertor("headerFooter");
        convertor.convert(context, htmlElement, parent);
      }
      return;
    }

    // page break;
    NamedNodeMap attrs = htmlElement.getAttributes();
    Node style = (null == attrs) ? null : attrs.getNamedItem(Constants.STYLE);
    if (null != style)
    {
      Map<String, String> styleMap = ConvertUtil.buildCSSMap(style.getNodeValue());
      if (null != styleMap && styleMap.containsKey(Constants.PAGE_BREAK))
      {// the div is a page break
        ImageConvertor.processPageBreak(context, htmlElement, parent);
        return;
      }
    }
    convertToTextBox(context, htmlElement, parent, null);
  }

  protected OdfElement convertToTextBox(ConversionContext context, Element htmlElement, Node parent, Node refNode)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement textPara = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_P));
    OdfElement drawFrame = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName(ODFConstants.DRAW_FRAME));
    OdfElement drawTextbox = XMLConvertorUtil.getCurrentFileDom(context)
        .createElementNS(ConvertUtil.getOdfName(ODFConstants.DRAW_TEXT_BOX));
    indexTable.addEntryByHtmlNode(htmlElement, textPara);
    drawFrame.appendChild(drawTextbox);
    textPara.appendChild(drawFrame);
    if (refNode == null)
      parent.appendChild(textPara);
    else
      parent.insertBefore(textPara, refNode);

    convertNewAttributes(context, htmlElement, drawFrame);
    convertNewAttributes(context, htmlElement, drawTextbox);
    convertChildren(context, htmlElement, drawTextbox);
    return textPara;
  }

  protected void convertNewAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    if (ODFConstants.DRAW_FRAME.equals((odfElement.getNodeName())))
    {
      String uuid = UUID.randomUUID().toString().substring(0, 4);
      odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.DRAW_NAME), "Frame_" + uuid);
      odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_ANCHOR_TYPE), "as-char");
      odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.SVG_WIDTH), "14.50cm");
      odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.DRAW_Z_INDEX), "0");

      String cssKey = CSSUtil.getTemplateClassName(context, htmlElement);
      if (cssKey != null)
      {
        Map<String, Map<String, String>> templatesCSS = (Map<String, Map<String, String>>) context
            .get(Constants.STYLE_DOC_TEMPLATES_SOURCE);
        Map<String, String> cssMap = templatesCSS.get(cssKey.toLowerCase());
        if (cssMap != null)
        {
          CSSStyleConvertorFactory.getInstance().getConvertor(OdfStyleFamily.Graphic)
              .convertStyle(context, htmlElement, odfElement, null, cssMap);
        }
      }
      NamedNodeMap attributes = htmlElement.getAttributes();
      if (attributes != null)
      {
        Node styleNode = attributes.getNamedItem(Constants.STYLE);
        String styleString = (styleNode != null) ? styleNode.getNodeValue() : null;
        if (styleString != null && !"".equals(styleString))
          CSSStyleConvertorFactory.getInstance().getConvertor(OdfStyleFamily.Graphic)
              .convertStyle(context, htmlElement, odfElement, null, styleString);
      }
    }
    else if (ODFConstants.DRAW_TEXT_BOX.equals((odfElement.getNodeName())))
    {
      odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.FO_MIN_HEIGHT), "0.34cm");
    }
  }

  private boolean isHFInContent(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    boolean isHF = false;
    NamedNodeMap attrs = htmlElement.getAttributes();
    Node idAttr = (null == attrs) ? null : attrs.getNamedItem("id");

    if (idAttr != null)
    {
      String idAttrValue = idAttr.getNodeValue();
      if (idAttrValue.equals(Constants.HEADER_DIV))
      {
        context.put(Constants.HTML_HEADER_ROOT, htmlElement);
        isHF = true;
      }
      else if (idAttrValue.equals(Constants.FOOTER_DIV))
      {
        context.put(Constants.HTML_FOOTER_ROOT, htmlElement);
        isHF = true;
      }
    }
    return isHF;
  }

  protected void convertChildren(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    List<Node> oldChildren = getOldChildren(context, odfElement);

    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    Node node = htmlElement.getFirstChild();
    while (node != null)
    {
      if (node instanceof Element)
      {
        if ("pUnderDiv".equals(((Element) node).getAttribute("_type")) || 
            ((Element) node).getAttribute(HtmlCSSConstants.ID).startsWith(Constants.PARA_UNDER_DIV_PRIFIX) || 
            ( HtmlCSSConstants.P.equals(node.getNodeName()) && ODFConstants.TEXT_P.equals( odfElement.getNodeName() )) )
        {
          Node nodeChild = node.getFirstChild();
          while (nodeChild != null)
          {
            convertChild(context, nodeChild, odfElement, oldChildren);
            nodeChild = nodeChild.getNextSibling();
          }
        }
        else
        {
          List<OdfElement> odfChilds = indexTable.getOdfNodes((Element) node);
          if (odfChilds != null && odfChilds.size() == 2 && odfChilds.get(0) != null && odfChilds.get(1) != null
              && ODFConstants.DRAW_FRAME.equals(odfChilds.get(1).getNodeName()) && ODFConstants.DRAW_FRAME.equals(odfElement.getNodeName()))
          {
            convertChild(context, node, (OdfElement) odfElement.getParentNode(), oldChildren);
          }
          else
          {
            convertChild(context, node, odfElement, oldChildren);
          }
        }
      }
      else
        convertChild(context, node, odfElement, oldChildren);

      node = node.getNextSibling();
    }
  }
}
