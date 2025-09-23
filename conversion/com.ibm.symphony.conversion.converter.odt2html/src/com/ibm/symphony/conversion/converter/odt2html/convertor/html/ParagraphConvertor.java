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

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.converter.odt2html.convertor.css.CSSConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;

public class ParagraphConvertor extends HtmlConvertor
{
  Logger log = Logger.getLogger(ParagraphConvertor.class.getName());

  private static String[] borderStyle = { HtmlCSSConstants.BORDER, HtmlCSSConstants.BORDER_LEFT, HtmlCSSConstants.BORDER_TOP,
      HtmlCSSConstants.BORDER_RIGHT, HtmlCSSConstants.BORDER_BOTTOM };

  private static Set<String> inlineTag = new HashSet<String>();
  static
  {
    inlineTag.add(HtmlCSSConstants.IMG);
    inlineTag.add(HtmlCSSConstants.SPAN);
    inlineTag.add(HtmlCSSConstants.A);
    inlineTag.add("#text");
  }

  private static Set<String> styleNamesToChildren = null;

  static
  {
    styleNamesToChildren = new HashSet<String>();
    Collections.addAll(styleNamesToChildren, new String[] { HtmlCSSConstants.TEXT_DECORATION });
  }

  @SuppressWarnings("unchecked")
  @Override
  public void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Document doc = (Document) context.getTarget();
    String styleName = element.getAttribute(ODFConstants.TEXT_STYLE_NAME);
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");
    Map<String, String> styleMap = map.get(styleName);
    if (styleMap == null)
    {
      styleMap = new HashMap<String, String>();
    }
    Map<String, String> tmpStyleMap = null;
    Element paragraphNode;

    if (HtmlCSSConstants.LI.equals(parent.getNodeName()))
    {
      //Prevent direction & alignment styles to be set into 'li' 'span' child,they only should be presereved on LI level,otherwise when
      //editor changes either of them, the new style gets changed on 'li' level, while old style value stays put on child 'span' level.
      //As the result, on document export, html2odt LIConvertor overwrites corresponding updated attribute of 'li' with that
      //of wrapped 'span' and corresponding Odf paragraph element has corresponding attribute of original (none updated by editor) value.
      String direction = styleMap.remove(HtmlCSSConstants.DIRECTION);
      String align = styleMap.get(HtmlCSSConstants.TEXT_ALIGN);
      if (direction != null || align != null) {
          if (tmpStyleMap == null) 
              tmpStyleMap = new HashMap<String, String>();

          if (direction != null) 
        	  tmpStyleMap.put(HtmlCSSConstants.DIRECTION, direction);

          if (align != null) 
        	  tmpStyleMap.put(HtmlCSSConstants.TEXT_ALIGN, align);
      }

      if (element.equals(element.getParentNode().getFirstChild()))
      {
        // this paragraph is the first paragraph of current list
        // paragraphNode = doc.createElement(HtmlCSSConstants.SPAN);
        paragraphNode = HtmlConvertorUtil.createHtmlElementWithForceId(context, element, HtmlCSSConstants.SPAN);
        HtmlConvertorUtil.setAttribute(paragraphNode,"_src", ODFConstants.TEXT_P,false);
        // if the paragraph in list contains border, don't set set border style on span.
        for (String border : borderStyle)
        {
          String value = styleMap.remove(border);
          if (value != null)
          {
            if (tmpStyleMap == null)
            {
              tmpStyleMap = new HashMap<String, String>();
            }
            tmpStyleMap.put(border, value);
          }
        }
        String marginLeft = styleMap.get(HtmlCSSConstants.MARGIN_LEFT);
        if (marginLeft != null)
        {
          if (tmpStyleMap == null)
          {
            tmpStyleMap = new HashMap<String, String>();
          }
          tmpStyleMap.put(HtmlCSSConstants.MARGIN_LEFT, marginLeft);
          styleMap.remove(HtmlCSSConstants.MARGIN_LEFT);
        }
        styleMap.remove(HtmlCSSConstants.TEXT_ALIGN);
        styleMap.remove(HtmlCSSConstants.LINE_HEIGHT);
      }
      else
      {
        // current paragraph is not the first child of the list item, set indent to 0cm
        paragraphNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.P);
        String indent = styleMap.get(HtmlCSSConstants.TEXT_INDENT);
        if (indent != null)
        {
          if (tmpStyleMap == null)
          {
            tmpStyleMap = new HashMap<String, String>();
          }
          tmpStyleMap.put(HtmlCSSConstants.TEXT_INDENT, indent);
        }
        styleMap.put(HtmlCSSConstants.TEXT_INDENT, "0cm");

        // adjust maring-left value
        String marginLeft = styleMap.get(HtmlCSSConstants.MARGIN_LEFT);
        if (marginLeft != null)
        {
          String baseMarginLeft = getBaseMarginLeft(context, element);
          if (baseMarginLeft != null)
          {
            // backup the original value.
            if (tmpStyleMap == null)
            {
              tmpStyleMap = new HashMap<String, String>();
            }
            tmpStyleMap.put(HtmlCSSConstants.MARGIN_LEFT, marginLeft);

            if (baseMarginLeft.startsWith("-"))
            {
              baseMarginLeft = baseMarginLeft.substring(1);
              marginLeft = ConvertUtil.addLength(marginLeft, baseMarginLeft);
            }
            else
            {
              marginLeft = ConvertUtil.addLength(marginLeft, "-" + baseMarginLeft);
            }
            styleMap.put(HtmlCSSConstants.MARGIN_LEFT, marginLeft);
          }
        }

      }
    }
    else
    {
      paragraphNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.P);
    }
    context.put("CurrentParagraph", paragraphNode);
    context.put("CurrentOdfParagraph", element);
    context.put("HasAddedP4Del", Boolean.FALSE);
    context.put("WrapOption", "");
    HtmlConvertorUtil.generatePageBreak(context, styleName, element, paragraphNode, parent);
    parent.appendChild(paragraphNode);

    // convert children
    convertChildren(context, element, paragraphNode);

    // roll back text-indent for list children
    if ("0cm".equals(styleMap.get(HtmlCSSConstants.TEXT_INDENT))
        && (tmpStyleMap == null || !tmpStyleMap.containsKey(HtmlCSSConstants.TEXT_INDENT)))
    {
      styleMap.remove(HtmlCSSConstants.TEXT_INDENT);
    }

    if (tmpStyleMap != null)
    {
      styleMap.putAll(tmpStyleMap);// restore the border styles.
    }
    context.remove("CurrentParagraph");

    ArrayList<Element> list = (ArrayList<Element>) context.remove("hasCharTextBox" + paragraphNode.getAttribute(HtmlCSSConstants.ID));
    if (HtmlCSSConstants.SPAN.equals(paragraphNode.getNodeName()))
    {
      HtmlConvertorUtil.removeDivOutOfSpan(paragraphNode, list);
    }
    else
    {
      if (HtmlCSSConstants.P.equals(paragraphNode.getNodeName()) && isGenerateBRNode(paragraphNode))
      {
        // Add <br class="hideInIE"/> to the paragraph
        HtmlConvertorUtil.generateBRNode(context, element, paragraphNode);
      }
      sortDiv(paragraphNode, list);
    }
    counteractMarginPaddingInDivChild(paragraphNode, styleMap);
    createPforInlineTag(context, doc, paragraphNode);
    createPforWrap(context, paragraphNode);
    updateParagraphClass(context, styleName, styleMap, element, paragraphNode);
    addDefaultStyleToNoStyleP(context, paragraphNode);
  }

  private void counteractMarginPaddingInDivChild(Element paragraphNode, Map<String, String> styleMap)
  {
    if (paragraphNode.getNodeName().equals(HtmlCSSConstants.DIV))
    {
      CSSConvertorUtil.reOrgMarginBorderPadding(styleMap, HtmlCSSConstants.MARGIN);
      CSSConvertorUtil.reOrgMarginBorderPadding(styleMap, HtmlCSSConstants.PADDING);
      String pargraphMarginLeft = styleMap.get("margin-left");
      String pargraphMarginTop = styleMap.get("margin-top");
      String pargraphPaddingLeft = styleMap.get("padding-left");
      String pargraphPaddingTop = styleMap.get("padding-top");
      if(pargraphMarginLeft != null)
        pargraphMarginLeft = pargraphMarginLeft.split("cm")[0];
      else
        pargraphMarginLeft = "0";
      if(pargraphMarginTop != null)
        pargraphMarginTop = pargraphMarginTop.split("cm")[0];
      else
        pargraphMarginTop = "0";
      if(pargraphPaddingLeft != null)
        pargraphPaddingLeft = pargraphPaddingLeft.split("cm")[0];
      else
        pargraphPaddingLeft = "0";
      if(pargraphPaddingTop != null)
        pargraphPaddingTop = pargraphPaddingTop.split("cm")[0];
      else
        pargraphPaddingTop = "0";
      String oppositeMarginLeft = String.valueOf(-(Double.parseDouble(pargraphMarginLeft) + Double
          .parseDouble(pargraphPaddingLeft))) + "cm;";
      String oppositeMarginTop = String.valueOf(-(Double.parseDouble(pargraphMarginTop) + Double
          .parseDouble(pargraphPaddingTop))) + "cm;";
      NodeList nodeList = paragraphNode.getChildNodes();
      for (int i = 0; i < nodeList.getLength(); i++)
      {
        Node child = nodeList.item(i);
        if (child.getNodeName().equals(HtmlCSSConstants.DIV))
        {
          Map<String, String> map = ConvertUtil.buildCSSMap(((Element)child).getAttribute("style"));
          if(map.containsKey("position"))
          {
            HtmlConvertorUtil.setAttribute(((Element) child),HtmlCSSConstants.STYLE,
                ((Element) child).getAttribute(HtmlCSSConstants.STYLE) + "margin-left:"+oppositeMarginLeft+""+"margin-top:"+oppositeMarginTop);
          }
        }
      }
    }
  }

  private void createPforWrap(ConversionContext context, Element paragraphNode)
  {
    if (HtmlCSSConstants.DIV.equals(paragraphNode.getNodeName()))
    {
      String wrapOption = (String) context.get("WrapOption");
      if (wrapOption != null && wrapOption.equals("run-through"))
      {
        if(paragraphNode.getLastChild() instanceof Element)
        {
          Element lastChild = (Element) paragraphNode.getLastChild();
          boolean hasAddedP4Del = (Boolean) context.get("HasAddedP4Del");
          if (!lastChild.getNodeName().equals(HtmlCSSConstants.P) && !hasAddedP4Del)
          {
            Element pUnderDivElement = HtmlConvertorUtil.generateParagraphNode(context, "pUnderDiv");
            addDefaultStyleToNoStyleP(context, pUnderDivElement);
            paragraphNode.appendChild(pUnderDivElement);
          }
        }
      }
    }

    context.remove("CurrentOdfParagraph");
    context.remove("HasAddedP4Del");
    context.remove("WrapOption");
  }
  
  public static boolean isGenerateBRNode(Node paragraphNode)
  {
      if(isBlankPorHeading(paragraphNode) || isLastChildLineBreak(paragraphNode) || isLastChildReadOnly(paragraphNode))
        return true;
      else
        return false;
  }
  
  private static boolean isBlankPorHeading(Node paragraphNode)
  {
    Node childNode = paragraphNode.getFirstChild();

    // <p> just have a childNode which is <span> or <a>, and the childNode has no child.
    while(childNode != null)
    {
      if(!isBlankNode(childNode))
        return false;
      childNode = childNode.getNextSibling();
    }
    
    return true;
    
  }

  private static boolean isBlankNode(Node node)
  {
    if(node == null)
      return true;

    if(node instanceof Element)
    {
      String nodeName = node.getNodeName();
      if (HtmlCSSConstants.A.equals(nodeName) || HtmlCSSConstants.SPAN.equals(nodeName))
      {
          return isBlankPorHeading(node);
      }
    }
    else
    {
      String nodeValue = node.getNodeValue();
      if(nodeValue == null || nodeValue.length()==0)
        return true;
    }
    return false;
  }
  
  private static boolean isLastChildLineBreak(Node node)
  {
    if(node == null)
      return false;
    
    Node lastChild = node.getLastChild();
    if(lastChild != null && HtmlCSSConstants.BR.equals(lastChild.getNodeName()) && "lb".equals(((Element) lastChild).getAttribute("type"))) 
      return true;
    
    return false;
  }
  
  private static boolean isLastChildReadOnly(Node node)
  {
    if(node == null)
      return false;
    
    Node lastChild = node.getLastChild();
    if(lastChild != null && lastChild instanceof Element)
    {
      String contentEditable = ((Element) lastChild).getAttribute(HtmlCSSConstants.CONTENT_EDITABLE);
      if(contentEditable != null && "false".equals(contentEditable.toLowerCase()))
        return true;
    }
    
    return false;
  }

  public static void createPforInlineTag(ConversionContext context, Document doc, Element paragraphNode)
  {
    if (!HtmlCSSConstants.DIV.equals(paragraphNode.getNodeName()))
      return;

    Node node = paragraphNode.getFirstChild();
    while (node != null)
    {
      String nodeName = node.getNodeName();
      if (inlineTag.contains(nodeName))
      {
        Node preNode = node.getPreviousSibling();
        if (preNode != null && HtmlCSSConstants.P.equals(preNode.getNodeName())
            && "pUnderDiv".equals(((Element) preNode).getAttribute("_type")))
        {
          Node newNode = node.cloneNode(true);
          preNode.appendChild(newNode);
          Node temp = node;
          node = node.getNextSibling();
          paragraphNode.removeChild(temp);
        }
        else
        {
          Element p = doc.createElement(HtmlCSSConstants.P);
          String bodyId = (String) context.get("BodyId");
          HtmlConvertorUtil.setAttribute(p,HtmlCSSConstants.ID, DOMIdGenerator.generate(bodyId));
          HtmlConvertorUtil.setAttribute(p,"_type", "pUnderDiv",false);
          String style = paragraphNode.getAttribute(HtmlCSSConstants.STYLE);
          Map<String, String> map =  ConvertUtil.buildCSSMap(style);
          if (map != null)
          {
            StringBuilder sb = new StringBuilder();
            if (map.containsKey(HtmlCSSConstants.FONT_FAMILY))
              sb.append(HtmlCSSConstants.FONT_FAMILY).append(":").append(map.get(HtmlCSSConstants.FONT_FAMILY)).append(";");
            if (map.containsKey(HtmlCSSConstants.FONT_SIZE))
              sb.append(HtmlCSSConstants.FONT_SIZE).append(":").append(map.get(HtmlCSSConstants.FONT_SIZE)).append(";");
            HtmlConvertorUtil.setAttribute(p,HtmlCSSConstants.STYLE, sb.toString());
          }
          Node newNode = node.cloneNode(true);
          p.appendChild(newNode);
          Node temp = node;
          node = node.getNextSibling();
          if (node == null)
          {
            paragraphNode.appendChild(p);
          }
          else
          {
            paragraphNode.insertBefore(p, node);
          }
          paragraphNode.removeChild(temp);
        }
      }
      else
        node = node.getNextSibling();
    }
  }

  private void updateParagraphClass(ConversionContext context, String styleName, Map<String, String> styleMap, OdfElement element, Element paragraphNode)
  {
    if (ODFConstants.TEXT_INDEX_BODY.equals(element.getParentNode().getNodeName()))
    {
      try
      {
        OdfDocument odfDoc = (OdfDocument) context.getSource();
        String templateStyleName = null;
        OdfOfficeAutomaticStyles autoStyles = odfDoc.getContentDom().getAutomaticStyles();
        OdfStyle style = autoStyles.getStyle(styleName, OdfStyleFamily.Paragraph);
        if (style != null)
        {
          String parentStyleName = style.getAttribute(ODFConstants.STYLE_PARENT_STYLE_NAME);
          if (TOCEntryTemplateConvertor.map.containsKey(parentStyleName))
            templateStyleName = parentStyleName;
        }
        if(templateStyleName == null && TOCEntryTemplateConvertor.map.containsKey(styleName))
          templateStyleName = styleName;
        if (templateStyleName != null)
        {
          String className = paragraphNode.getAttribute(HtmlCSSConstants.CLASS);
          String level = TOCEntryTemplateConvertor.map.get(templateStyleName);
          if (Integer.parseInt(level) > 6)
            level = "6";
          className = className + " L" + level;
          // L1,L2...L6 in class is a tag for editor distract different level TOC item style
          HtmlConvertorUtil.setAttribute(paragraphNode,HtmlCSSConstants.CLASS, className);
        }
      }
      catch (Exception e)
      {
        log.log(Level.WARNING, e.getMessage(), e);
      }
    }
    if(HtmlConvertorUtil.hasThinBorer(styleMap))
    {
      String className = paragraphNode.getAttribute(HtmlCSSConstants.CLASS);
      HtmlConvertorUtil.setAttribute(paragraphNode,HtmlCSSConstants.CLASS, className+" thinborder");
    }
  }
  
  public static void addDefaultStyleToNoStyleP(ConversionContext context, Element paragraphNode)
  {
    String style = paragraphNode.getAttribute(HtmlCSSConstants.STYLE);
    if((style == null || "".equals(style)) && HtmlCSSConstants.P.equals(paragraphNode.getNodeName()))
    {
      Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");
      Map<String, String> defaultParagraphStyleMap = map.get("default-style_paragraph");
      style = ConvertUtil.convertMapToStyle(defaultParagraphStyleMap);
      paragraphNode.setAttribute(HtmlCSSConstants.STYLE, style);
    }
  }

  private void sortDiv(Element paragraphNode, ArrayList<Element> list)
  {
    String _type = paragraphNode.getAttribute("_type");
    if (list != null)
    {
      if (_type == null || _type.indexOf("topDiv") == -1)
      {
        sortDiv1(paragraphNode, list);
      }
      else
      {
        if (paragraphNode.getChildNodes().getLength() > 1)
        {
          list.clear();
          if(paragraphNode.getFirstChild() instanceof Element)
          {
            Element secondDiv = ((Element) paragraphNode.getFirstChild());
            _type = secondDiv.getAttribute("_type");
            if (_type != null && _type.equals("secondDiv"))
            {
              while (paragraphNode.getChildNodes().getLength() > 1)
              {
                Node child = paragraphNode.removeChild(paragraphNode.getChildNodes().item(1));
                secondDiv.insertBefore(child, secondDiv.getFirstChild());
              }
            } 
          }
        }
      }
    }
  }

  private void sortDiv1(Element paragraphNode, ArrayList<Element> list)
  {
    try
    {
      for (int i = 0; i < list.size(); i++)
      {
        Element div = list.get(i);
        Node cloneDiv = div.cloneNode(true);
        paragraphNode.appendChild(cloneDiv);
        paragraphNode.removeChild(div);
      }
    }
    catch (Exception e)
    {
      log.log(Level.WARNING, e.getMessage(), e);
    }
  }

  private static String getBaseMarginLeft(ConversionContext context, OdfElement paragraph)
  {
    OdfElement parent = (OdfElement) paragraph.getParentNode();
    OdfElement firstSpling = (OdfElement) parent.getFirstChild();
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");
    String baseMarginLeft = null;
    if (firstSpling != null)
    {
      if (ODFConstants.TEXT_P.equals(firstSpling.getNodeName()) || ODFConstants.TEXT_H.equals(firstSpling.getNodeName()))
      {
        Map<String, String> baseParagraphStyleMap = HtmlConvertorUtil.getElementStyleMap(firstSpling, map);
        if(baseParagraphStyleMap != null)
        {
          baseMarginLeft = baseParagraphStyleMap.get(HtmlCSSConstants.MARGIN_LEFT);
          if (baseMarginLeft != null)
            return baseMarginLeft;        
        }
       }

    }
    // the base margin-left should be get from ol/ul
    String listStyleName = HtmlConvertorUtil.getListLevelStyleName(context, parent);
    Map<String, String> listStyle = map.get(listStyleName);
    if (listStyle != null)
      return listStyle.get(HtmlCSSConstants.MARGIN_LEFT);

    return null;
  }

  private void convertChildren(ConversionContext context, OdfElement element, Element paragraphNode)
  {
    Document doc = (Document) context.getTarget();
    String styleName = element.getAttribute(ODFConstants.TEXT_STYLE_NAME);
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");
    Map<String, String> styleMap = map.get(styleName);
    Map<String, String> stylesToChildren = null;

    // the temp style shuld be generated before moving styles to children.
    generateTmpStyle(context, element);

    Set<String> styles = (Set<String>) context.get("BackgroundColorChangedInTextProperties");
    Set<String> moveToChildren;
    if (styles != null && styles.contains(styleName))
    {
      // bg color should be moved to children
      moveToChildren = new HashSet<String>();
      moveToChildren.addAll(styleNamesToChildren);
      moveToChildren.add(HtmlCSSConstants.BACKGROUND_COLOR);
    }
    else
    {
      moveToChildren = styleNamesToChildren;
    }

    if (styleMap != null)
    {
      for (String style : moveToChildren)
      {
        String value = styleMap.remove(style);
        if (value != null)
        {
          if (stylesToChildren == null)
            stylesToChildren = new HashMap<String, String>();
          stylesToChildren.put(style, value);
        }
      }
    }

    HtmlConvertorUtil.convertAttributes(context, element, paragraphNode);

    ParagraphConvertor.convertTabStop(context, map, styleName, paragraphNode);

    String txt = element.getTextContent();
    if (txt.length() > 0)
    {
      boolean isInTOC = AnchorConvertor.isInTOC(element);
      NodeList children = element.getChildNodes();
      int length = children.getLength();
      if (isInTOC && !ODFConstants.TEXT_INDEX_TITILE.equals(element.getParentNode().getNodeName()))
      {
        Node lastChild = children.item(length - 1);

        if (lastChild instanceof Text && ((Text) lastChild).getWholeText().matches("\\d+"))
          length--;
      }

      if (stylesToChildren != null)
      {
        for (int i = 0; i < length; i++)
        {
          
          Node node = children.item(i);
          if (node instanceof Text)
          {
            HtmlConvertorUtil.appendText2Parent(context, paragraphNode, (Text) node, stylesToChildren);
          }
          else if ( ODFConstants.TEXT_TAB.equals( node.getNodeName() ) || ODFConstants.TEXT_S.equals( node.getNodeName() ) )
          {
            OdfElement child = (OdfElement) node;
            Element span = doc.createElement(HtmlCSSConstants.SPAN);
            HtmlConvertorUtil.setAttribute(span,"style", ConvertUtil.convertMapToStyle(stylesToChildren));
            paragraphNode.appendChild(span);
            
            IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(child);
            convertor.convert(context, child, span);
            
          }
          else if (node instanceof OdfElement)
          {
            OdfElement child = (OdfElement) node;
            String childStyleName = child.getAttribute(ODFConstants.TEXT_STYLE_NAME);
            Map<String, String> childStyleMap = map.get(childStyleName);
            List<String> styleNames = null;// store the styles moved to children
            if (childStyleMap != null)
            {
              styleNames = new ArrayList<String>();
              for (Iterator<Map.Entry<String, String>> it = stylesToChildren.entrySet().iterator(); it.hasNext();)
              {
                Entry<String, String> entry = it.next();
                if (!childStyleMap.containsKey(entry.getKey()))
                {
                  childStyleMap.put(entry.getKey(), entry.getValue());
                  styleNames.add(entry.getKey());
                }
                HtmlConvertorUtil.setAttribute(child,entry.getKey(), entry.getValue());
              }
            }

            IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(child);
            convertor.convert(context, child, paragraphNode);

            String nodeName = child.getNodeName();
            if (nodeName.equals(ODFConstants.TEXT_DATE) || nodeName.equals(ODFConstants.TEXT_TIME)
                || nodeName.equals(ODFConstants.TEXT_PAGE_NUMBER))
            {
              Element span = (Element) paragraphNode.getLastChild();
              HtmlConvertorUtil.setAttribute(span,"style", ConvertUtil.convertMapToStyle(stylesToChildren));
            }

            // roll back child style map
            if (styleNames != null)
            {
              for (String style : styleNames)
              {
                childStyleMap.remove(style);
              }
            }
          }
          
        }

      }
      else
      {
        for (int i = 0; i < length; i++)
        {
          Node node = children.item(i);
          if (node instanceof OdfElement)
          {
            OdfElement child = (OdfElement) node;
            IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(child);
            convertor.convert(context, child, paragraphNode);
          }
          else if (node instanceof Text)
          {
            HtmlConvertorUtil.appendText2Parent(context, paragraphNode, (Text) node, null);
          }
        }
      }
    }
    else
    {
      HtmlConvertorUtil.convertChildren(context, element, paragraphNode);
    }

    // save back the styles to paragraph
    if (stylesToChildren != null)
    {
      styleMap.putAll(stylesToChildren);
    }
  }

  public static void convertTabStop(ConversionContext context, Map<String, Map<String, String>> map, String styleName, Element htmlNode)
  {
    if ("".equals(styleName))
      return;

    Map<String, String> tabstopMap = map.get(styleName + "_TabStop");
    if (tabstopMap == null)
    {
      try
      {
        OdfDocument doc = (OdfDocument) context.getSource();
        OdfStyle style = doc.getContentDom().getAutomaticStyles().getStyle(styleName, OdfStyleFamily.Paragraph);
        if (style == null)
          style = doc.getStylesDom().getOfficeStyles().getStyle(styleName, OdfStyleFamily.Paragraph);
        if (style == null)
          style = doc.getStylesDom().getAutomaticStyles().getStyle(styleName, OdfStyleFamily.Paragraph);
        OdfStyleBase parentStyle = style.getParentStyle();
        while (parentStyle != null && parentStyle instanceof OdfStyle && tabstopMap == null)
        {
          styleName = ((OdfStyle) parentStyle).getStyleNameAttribute();
          tabstopMap = map.get(styleName + "_TabStop");
          parentStyle = parentStyle.getParentStyle();
        }
      }
      catch (Exception e)
      {
        //Invalid style name. No this style in all the dom
      }
    }

    if (tabstopMap != null)
    {
      String tabstop = tabstopMap.get(styleName + "_TabStop");
      if(tabstop.length() > 0)
        HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.TABSTOP, tabstop);
    }
  }

  protected void generateTmpStyle(ConversionContext context, OdfElement element)
  {
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");
    String windowFontColor = HtmlConvertorUtil.getWindowFontColor(context, element);
    // import the default paragraph style
    Map<String, String> defaultStyle = map.get("default-style_paragraph");
    String globalColor = defaultStyle.get(HtmlCSSConstants.COLOR);
    if (windowFontColor != null)
    {
      Map<String, String> tmpStyle = new HashMap<String, String>();
      tmpStyle.putAll(defaultStyle);
      tmpStyle.put(HtmlCSSConstants.COLOR, windowFontColor);
      defaultStyle = tmpStyle;
    }
    if(ODFConstants.TEXT_LIST_ITEM.equals(element.getParentNode().getNodeName()))
    {
      defaultStyle.remove(HtmlCSSConstants.DIRECTION);
      defaultStyle.remove(HtmlCSSConstants.TEXT_ALIGN);     
    }
    context.put("tmpStyle", defaultStyle);

  }
}
