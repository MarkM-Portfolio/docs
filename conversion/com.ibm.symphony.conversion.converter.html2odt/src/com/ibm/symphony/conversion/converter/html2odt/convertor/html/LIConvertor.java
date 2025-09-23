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

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleParagraphProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.html2odt.common.CSSGroupStylesUtil;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class LIConvertor extends GeneralXMLConvertor
{
  private static String[] stylesFromList = { HtmlCSSConstants.TEXT_ALIGN, HtmlCSSConstants.DIRECTION, HtmlCSSConstants.COLOR, HtmlCSSConstants.BORDER,
      HtmlCSSConstants.BORDER_LEFT, HtmlCSSConstants.BORDER_TOP, HtmlCSSConstants.BORDER_RIGHT, HtmlCSSConstants.BORDER_BOTTOM,
      HtmlCSSConstants.BORDER_WIDTH, HtmlCSSConstants.BORDER_LEFT_WIDTH, HtmlCSSConstants.BORDER_TOP_WIDTH,
      HtmlCSSConstants.BORDER_RIGHT_WIDTH, HtmlCSSConstants.BORDER_BOTTOM_WIDTH, HtmlCSSConstants.BORDER_STYLE,
      HtmlCSSConstants.BORDER_LEFT_STYLE, HtmlCSSConstants.BORDER_TOP_STYLE, HtmlCSSConstants.BORDER_RIGHT_STYLE,
      HtmlCSSConstants.BORDER_BOTTOM_STYLE, HtmlCSSConstants.BORDER_COLOR, HtmlCSSConstants.BORDER_LEFT_COLOR,
      HtmlCSSConstants.BORDER_TOP_COLOR, HtmlCSSConstants.BORDER_RIGHT_COLOR, HtmlCSSConstants.BORDER_BOTTOM_COLOR,
      HtmlCSSConstants.BREAK_BEFORE, HtmlCSSConstants.FONT_WEIGHT, HtmlCSSConstants.FONT_SIZE, HtmlCSSConstants.FONT_FAMILY,
      HtmlCSSConstants.TEXT_DECORATION, "font-style", HtmlCSSConstants.LINE_HEIGHT};

  private static Set<String> styleSet = new HashSet<String>();
  {
    Collections.addAll(styleSet, stylesFromList);
  }

  /*
   * static boolean isHeading(Element element) { String name = element.getNodeName(); if ("h".equalsIgnoreCase(name.substring(0, 1))) return
   * true; else { if (HtmlCSSConstants.OL.equalsIgnoreCase(name) || HtmlCSSConstants.UL.equalsIgnoreCase(name) ||
   * HtmlCSSConstants.LI.equalsIgnoreCase(name)) { NodeList children = element.getChildNodes(); for (int i = 0; i < children.getLength();
   * i++) { Node child = children.item(i); if (child instanceof Element) { if (isHeading((Element) child)) return true; } } } return false;
   * } }
   */

  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    String className = htmlElement.getAttribute(HtmlCSSConstants.CLASS);
    String style = htmlElement.getAttribute(HtmlCSSConstants.STYLE);
    String id = htmlElement.getAttribute("id");
    OdfElement odfElement = null;
    if (className != null && className.indexOf("lst-header") != -1)
    {
      // List Header
      OdfDocument odfDoc = (OdfDocument) context.getTarget();
      odfElement = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(ConvertUtil.getOdfName("text:list-header"));

      parent.appendChild(odfElement);
    }
    else
    {
      odfElement = convertElement(context, htmlElement, parent);
    }

    if (odfElement != null)
    {
      convertListChildren(context, htmlElement, odfElement);
    }
    else
    {
      convertChildren(context, htmlElement, parent);
    }
  }

  private static Set<String> blockListChildren = new HashSet<String>();
  static
  {
    Collections.addAll(blockListChildren, new String[] { "p", "ol", "ul", "h1", "h2", "h3", "h4", "h5", "h6" });
  }

  private void convertListChildren(ConversionContext context, Element htmlElement, OdfElement parent)
  {

    Document htmlDoc = (Document) context.getSource();
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();

    List<Element> blockElementQueue = new ArrayList<Element>();

    Node child = (Node) htmlElement.getFirstChild();

    boolean createNewP = true;
    while (child != null)
    {
      // by default, each child should be appended to the block element,
      // but if the span is mapped as the text:p in odf, all its' children will be move to the block element
      // and the span itself will not be append to the block element.
      boolean appendChild = true;
      String nodeName = child.getNodeName().toLowerCase();
      if (blockListChildren.contains(nodeName))
      {
        blockElementQueue.add((Element) child.cloneNode(true));
        createNewP = true;
      }
      else
      {
        if (createNewP)
        {
          Element paragraph = htmlDoc.createElement(HtmlCSSConstants.P);
          paragraph.setAttribute(HtmlCSSConstants.ID, DOMIdGenerator.generate());
          blockElementQueue.add(paragraph);
        }

        Element blockElement;
        if (blockElementQueue.size() > 0)
        {
          blockElement = blockElementQueue.get(blockElementQueue.size() - 1);
        }
        else
        {
          blockElement = htmlDoc.createElement(HtmlCSSConstants.P);
          blockElement.setAttribute(HtmlCSSConstants.ID, DOMIdGenerator.generate());

          blockElementQueue.add(blockElement);
        }

        if (child instanceof Element)
        {
          Element elementChild = (Element) child;
          OdfElement odfChild = indexTable.getFirstOdfNode(elementChild);

          if (odfChild != null && odfChild.getNodeName().equals(ODFConstants.TEXT_P))
          {
            updateBlockElement(blockElement, elementChild);
            appendChild = false;
          }
          else
          {
            // This part may have some issues about associate the styleName with the created p.
            if (elementChild.getNodeName().equalsIgnoreCase(HtmlCSSConstants.SPAN))
            {
              String className = elementChild.getAttribute(HtmlCSSConstants.CLASS);
              String pClassName = blockElement.getAttribute(HtmlCSSConstants.CLASS);

              if (className != null && className.length() > 0 && (pClassName == null || pClassName.length() == 0))
                blockElement.setAttribute(HtmlCSSConstants.CLASS, className);

              String _src = elementChild.getAttribute("_src");
              if (ODFConstants.TEXT_P.equals(_src))
              {
                String style = elementChild.getAttribute(HtmlCSSConstants.STYLE);
                String pStyle = blockElement.getAttribute(HtmlCSSConstants.STYLE);

                if (style != null && style.length() > 0 && (pStyle == null || pStyle.length() == 0))
                  blockElement.setAttribute(HtmlCSSConstants.STYLE, style);
              }
            }
          }
          if (elementChild.getNodeName().equalsIgnoreCase(HtmlCSSConstants.SPAN))
          {
            String ts = blockElement.getAttribute(HtmlCSSConstants.TABSTOP);
            if (ts == null || ts.length() == 0)
            {
              ts = elementChild.getAttribute(HtmlCSSConstants.TABSTOP);
              if (ts != null && ts.length() > 0)
              {
                blockElement.setAttribute(HtmlCSSConstants.TABSTOP, ts);

                String style = blockElement.getAttribute(HtmlCSSConstants.STYLE);
                if (style == null || style.length() == 0)
                  blockElement.setAttribute(HtmlCSSConstants.STYLE, "");
              }
            }
          }
        }
        if (appendChild)
          blockElement.appendChild(child.cloneNode(true));
        createNewP = false;
      }
      Node pre = child;
      child = child.getNextSibling();
      htmlElement.removeChild(pre);
    }

    if (blockElementQueue.size() == 0)
    {
      // empty paragraph should be added.
      Element blockElement = htmlDoc.createElement(HtmlCSSConstants.P);
      blockElementQueue.add(blockElement);
    }

    String liStyle = htmlElement.getAttribute(HtmlCSSConstants.STYLE);
    Map<String, String> liStyleMap = null;
    Map<String, String> fontStylesMap = null;
    if (liStyle != null && liStyle.length() > 0)
    {
      Map<String, String> styles = ConvertUtil.buildCSSMap(liStyle);
      liStyleMap = new HashMap<String, String>();
      fontStylesMap = new HashMap<String, String>();
      for (Map.Entry<String, String> entry : styles.entrySet())
      {
        if (styleSet.contains(entry.getKey()))
          liStyleMap.put(entry.getKey(), entry.getValue());
        
        if (CSSGroupStylesUtil.getFontStylePropNames().contains(entry.getKey()))
          fontStylesMap.put(entry.getKey(), entry.getValue());
      }
      if ("always".equals(styles.get(HtmlCSSConstants.PAGE_BREAK_BEFORE)))
      {
        liStyleMap.put(HtmlCSSConstants.BREAK_BEFORE, "page");
      }
    }
    
    for (Element e : blockElementQueue)
    {
      htmlElement.appendChild(e);
      String nodeName = e.getNodeName().toLowerCase();
      if (HtmlCSSConstants.P.equals(nodeName) || nodeName.startsWith("h"))
      {
        String pStyle = e.getAttribute(HtmlCSSConstants.STYLE);
        if (liStyleMap != null && liStyleMap.size() > 0)
        {
          // need merge li style into paragraph
          if (pStyle == null || pStyle.length() == 0)
          {
            filterMarginStyle(context, liStyleMap, e);
            pStyle = ConvertUtil.convertMapToStyle(liStyleMap);
          }
          else
          {
            Map<String, String> pStyleMap = new HashMap<String, String>();
            pStyleMap.putAll(liStyleMap);
            pStyleMap.putAll(ConvertUtil.buildCSSMap(pStyle));
            filterMarginStyle(context, pStyleMap, e);
            pStyle = ConvertUtil.convertMapToStyle(pStyleMap);
          }
          liStyleMap.remove(HtmlCSSConstants.BREAK_BEFORE);// page break should be applied only once
        }
        handlePreservedStyle(pStyle, e);
        if (pStyle != null && pStyle.length() > 0)
        {
          e.setAttribute(HtmlCSSConstants.STYLE, pStyle);
        }
      }
      else if (HtmlCSSConstants.OL.equals(nodeName) || HtmlCSSConstants.UL.equals(nodeName))
      {
        String childStyle = e.getAttribute(HtmlCSSConstants.STYLE);       

        if (fontStylesMap != null && fontStylesMap.size() > 0)
        {         
            // need merge li font style into ul/ol
            if (childStyle == null || childStyle.length() == 0)
              childStyle = ConvertUtil.convertMapToStyle(fontStylesMap);
            else
            {
              Map<String, String> styleMap = new HashMap<String, String>();
              styleMap.putAll(fontStylesMap);
              styleMap.putAll(ConvertUtil.buildCSSMap(childStyle));
              childStyle = ConvertUtil.convertMapToStyle(styleMap);
            }
             e.setAttribute(HtmlCSSConstants.STYLE, childStyle);
        }
      }
    }

    convertChildren(context, htmlElement, parent);
  }

  private void updateBlockElement(Element blockElement, Element span)
  {
    String id = span.getAttribute(HtmlCSSConstants.ID);
    blockElement.setAttribute(HtmlCSSConstants.ID, id);

    String style = span.getAttribute(HtmlCSSConstants.STYLE);
    if (style != null && style.length() > 0)
      blockElement.setAttribute(HtmlCSSConstants.STYLE, style);

    String className = span.getAttribute(HtmlCSSConstants.CLASS);
    if (className != null && className.length() > 0)
      blockElement.setAttribute(HtmlCSSConstants.CLASS, className);

    // copy the children to the paragraph;
    Node spanChild = span.getFirstChild();
    while (spanChild != null)
    {
      blockElement.appendChild(spanChild.cloneNode(true));
      spanChild = spanChild.getNextSibling();
    }

  }

  private void handlePreservedStyle(String pStyle, Element element)
  {
    if (pStyle != null)
    {
      if (!pStyle.contains(HtmlCSSConstants.MARGIN_LEFT))
      {
        element.setAttribute("preservedStyleName", HtmlCSSConstants.MARGIN_LEFT);
      }
    }
  }

  // Temp fix for pasted margin issue.defect 16299
  private void filterMarginStyle(ConversionContext context,Map<String,String> styleMap, Element htmlElement)
  {
    if( styleMap != null && !styleMap.containsKey(HtmlCSSConstants.MARGIN_LEFT) && styleMap.containsKey(HtmlCSSConstants.MARGIN_RIGHT))
    {
      OdfStyle oldStyle = CSSUtil.getOldStyle(context, htmlElement.getAttribute("class"), OdfStyleFamily.Paragraph);

      if(oldStyle == null || !oldStyle.hasProperty(OdfStyleParagraphProperties.MarginRight))
      {
        if(!HtmlCSSConstants.RTL.equalsIgnoreCase(styleMap.get(HtmlCSSConstants.DIRECTION)))
        	styleMap.remove(HtmlCSSConstants.MARGIN_RIGHT);

        styleMap.remove(HtmlCSSConstants.TEXT_INDENT);
      }
    }
  }
}
