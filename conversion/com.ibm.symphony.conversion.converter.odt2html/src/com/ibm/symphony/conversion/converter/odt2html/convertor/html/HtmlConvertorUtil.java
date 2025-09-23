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

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.doc.text.OdfTextLineBreak;
import org.odftoolkit.odfdom.doc.text.OdfTextSpace;
import org.odftoolkit.odfdom.doc.text.OdfTextSpan;
import org.odftoolkit.odfdom.doc.text.OdfTextTab;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.odftoolkit.odfdom.pkg.manifest.OdfFileEntry;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import symphony.org.w3c.tidy.DomUtil;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.odt2html.ODT2HTMLConverter;
import com.ibm.symphony.conversion.converter.odt2html.convertor.ODTConvertorUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.css.CSSConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.acf.ACFUtil;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.service.common.util.OdfElementUtil;
import com.ibm.symphony.conversion.service.common.util.StringPool;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class HtmlConvertorUtil
{

  static String[] styleAttributeNames = new String[] { "draw:style-name", "draw:text-style-name", "text:style-name",
      "presentation:style-name", "table:style-name" };

  static Logger log = Logger.getLogger(ODT2HTMLConverter.class.getName());

  static Set<String> formalParentNodeType = new HashSet<String>();
  static
  {
    formalParentNodeType.add(HtmlCSSConstants.P);
    formalParentNodeType.add(HtmlCSSConstants.DIV);
    formalParentNodeType.add(HtmlCSSConstants.SPAN);
    formalParentNodeType.add(HtmlCSSConstants.BODY);
  }

  @SuppressWarnings("unchecked")
  public static void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {
    JSONObject jsObj = ConvertUtil.getODFMap();
    NamedNodeMap attributes = element.getAttributes();
    Document doc = (Document) context.getTarget();
    for (int i = 0; i < attributes.getLength(); i++)
    {
      Node attr = attributes.item(i);
      Object htmlAttribute = jsObj.get(attr.getNodeName());
      if (htmlAttribute != null )
      {
        Attr htmlAttr = doc.createAttribute((String) htmlAttribute);
        String value = attr.getNodeValue();
        if (UnitUtil.getUnit(value).toLowerCase().equals(Unit.INCH.abbr()))
          value = UnitUtil.convertINToCM(value);
        HtmlConvertorUtil.setAttribute(htmlNode,htmlAttr.getName(),value);
      }
    }
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");

    if (map != null)
    {
      Map<String, String> styleMap = getElementStyleMap(element, map);

      Map<String, String> tmpStyle = (Map<String, String>) context.remove("tmpStyle");

      if (tmpStyle != null && tmpStyle.size() > 0)
      {
        Map<String, String> tmp = new HashMap<String, String>();
        tmp.putAll(tmpStyle);
        if (styleMap != null && styleMap.size() > 0)
        {
          tmp.putAll(styleMap);
        }
        styleMap = tmp;
      }

      if (styleMap != null && styleMap.size() > 0)
      {
        String style = ConvertUtil.convertMapToStyle(styleMap);
        HtmlConvertorUtil.setAttribute(htmlNode,"style", style);
      }
    }

  }
  public static void setAttribute(Element element,String attrName,String attrValue)
  {
    setAttribute(element,attrName,attrValue,true);
  }
  public static void setAttribute(Element element,String attrName,String attrValue,boolean doACFCheck)
  {
    if(doACFCheck)
    {
      if(ACFUtil.suspiciousAttribute(attrName,attrValue) == ACFUtil.ACF_ATTR_VALID)
        element.setAttribute(attrName, attrValue);
    }
    else
      element.setAttribute(attrName, attrValue);
  }
  public static String getElementStyleName(OdfElement element, Map<String, Map<String, String>> map)
  {
    for (String styleAttrName : styleAttributeNames)
    {
      String styleName = element.getAttribute(styleAttrName);
      if (styleName.length() > 0)
      {
        if (map.containsKey(styleName))
        {
          return styleName;
        }
      }
    }
    return null;
  }

  public static Map<String, String> getElementStyleMap(OdfElement element, Map<String, Map<String, String>> map)
  {
    Map<String, String> styleMap = null;
    for (String styleAttrName : styleAttributeNames)
    {
      String styleName = element.getAttribute(styleAttrName);
      if (styleName.length() > 0)
      {
        styleMap = map.get(styleName);
        if (styleMap != null)
        {
          break;
        }
      }
    }
    return styleMap;
  }

  public static void convertChildren(ConversionContext context, OdfElement element, Node htmlNode)
  {
    NodeList children = element.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      Node node = children.item(i);
      if (node instanceof OdfElement)
      {
        OdfElement child = (OdfElement) node;
        IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(child);
        convertor.convert(context, child, htmlNode);
      }
      else if (node instanceof Text)
      {
        appendText2Parent(context, htmlNode, (Text) node, null);
      }
    }
  }

  public static int getListLevel(ConversionContext context, OdfElement element)
  {
    int listLevel = 0;
    for (Node p = element; !p.getNodeName().equals(context.get("contentRootNode")); p = p.getParentNode())
    {
      if (p.getNodeName().equals(ODFConstants.TEXT_LIST))
      {
        listLevel++;
      }
    }
    return listLevel;
  }

  public static String getListLevelStyleName(ConversionContext context, OdfElement element)
  {
    int listLevel = 0;
    Node textList = null;
    for (Node p = element; !p.getNodeName().equals(context.get("contentRootNode")) && !p.getNodeName().equals(ODFConstants.DRAW_TEXT_BOX); p = p
        .getParentNode())
    {
      if (p.getNodeName().equals(ODFConstants.TEXT_LIST))
      {
        listLevel++;
        textList = p;
      }
    }
    if (textList != null)
    {
      String styleOverride = element.getAttribute(ODFConstants.TEXT_STYLE_OVERRIDE);
      if (styleOverride.length() > 0)
      {
        return styleOverride + "_" + listLevel;
      }
      else
      {
        return ((OdfElement) textList).getAttribute(ODFConstants.TEXT_STYLE_NAME) + "_" + listLevel;
      }
    }
    else
      return "";
  }

  public static String getListLevelCounterName(ConversionContext context, OdfElement element)
  {
    int listLevel = 0;
    Node textList = null;
    for (Node p = element; !p.getNodeName().equals(context.get("contentRootNode")); p = p.getParentNode())
    {
      if (p.getNodeName().equals(ODFConstants.TEXT_LIST))
      {
        listLevel++;
        textList = p;
      }
    }
    if (textList != null)
    {
      String name = ((OdfElement) textList).getAttribute(ODFConstants.TEXT_STYLE_NAME);
      // OdfTextListStyle listStyleElement = CSSConvertorUtil.getTextListStyleElement(context, name);
      return name + "_" + listLevel;
      /*
       * // disable import sonsecutive numbering // text:consecutive-numbering="true" if( "true".equals(
       * listStyleElement.getAttribute(ODFConstants.TEXT_CONSECUTIVE_NUMBERING) )) { return name + "_1" ; } else { return name + "_" +
       * listLevel; }
       */
    }
    else
      return "";

  }

  public static OdfElement getListRootElement(ConversionContext context, OdfElement element)
  {
    Node textList = null;
    for (Node p = element; !p.getNodeName().equals(context.get("contentRootNode")); p = p.getParentNode())
    {
      if (p.getNodeName().equals(ODFConstants.TEXT_LIST))
      {
        textList = p;
      }
    }
    return (OdfElement) textList;
  }

  // search the previous element in office:text
  private static Node getPreviousElement(OdfElement element)
  {
    if (element != null)
    {
      OdfElement parent = (OdfElement) element.getParentNode();
      if (parent != null)
      {
        if (ODFConstants.OFFICE_TEXT.equals(parent.getNodeName()))
        {
          return element.getPreviousSibling();
        }
        else
        {
          return getPreviousElement(parent);
        }
      }
    }
    return null;
  }

  public static void generatePageBreak(ConversionContext context, String styleName, OdfElement element, Element htmlNode, Element parent)
  {
    Map<String, String> pageBreaks = CSSConvertorUtil.getPageBreakMap(context);
    String pageBreakType = pageBreaks.get(styleName);
    if (pageBreakType != null)
    {
      if (ODFConstants.STYLE_PAGE_NUMBER.equals(pageBreakType))
      {
        OdfElement prev = (OdfElement) element.getPreviousSibling();
        // if( prev == null)
        // prev = (OdfElement) getPreviousElement(element);
        if (prev == null || ODFConstants.TEXT_SEQUENCE_DECLS.equals(prev.getNodeName())
            || ODFConstants.OFFICE_FORMS.equals(prev.getNodeName()))
        {
          return;// pagebreak==auto, will not generate pagebreak for the first element.
        }
      }

      if (HtmlCSSConstants.LI.equals(parent.getNodeName()))
      {
        String parentStyle = parent.getAttribute(HtmlCSSConstants.STYLE);
        HtmlConvertorUtil.setAttribute(parent,HtmlCSSConstants.STYLE, "page-break-before: always;" + parentStyle);
      }
      else
      {
        Document doc = (Document) context.getTarget();
        // change DIV to HR because Editor change to use HR as page break
        Element hr = createHtmlElement(context, element, HtmlCSSConstants.HR);
        HtmlConvertorUtil.setAttribute(hr,HtmlCSSConstants.STYLE, "page-break-before: always;",false);
        HtmlConvertorUtil.setAttribute(hr,HtmlCSSConstants.CLASS, "cke_pagebreak",false);
        
        if (HtmlCSSConstants.BODY.equals(parent.getNodeName()))
        {
          parent.appendChild(hr);
        }
        else
        {
          Node body = parent.getParentNode();
          Node underBody = parent;
          while (!HtmlCSSConstants.BODY.equals(body.getNodeName()))
          {
            underBody = body;
            body = body.getParentNode();
          }
          body.insertBefore(hr, underBody);
        }
        // Element span = context.getOdfToHtmlIndexTable().createHtmlElement(element, doc, HtmlCSSConstants.SPAN);
        // span.setAttribute(HtmlCSSConstants.STYLE, "display: none;");
        // div.appendChild(span);
        // span.appendChild(doc.createTextNode("\u00a0"));
      }

    }
  }

  public static void generateBRNode(ConversionContext context, OdfElement element, Element parent)
  {
    Document doc = (Document) context.getTarget();
    // Add <br class="hideInIE"/>
    Element br = doc.createElement(HtmlCSSConstants.BR);
    HtmlConvertorUtil.setAttribute(br,HtmlCSSConstants.CLASS, "hideInIE",false);
    parent.appendChild(br);
  }

  public static Element generateParagraphNode(ConversionContext context, String type)
  {
    if (type == null)
      type = "";

    Document doc = (Document) context.getTarget();
    Element elementP = doc.createElement("p");
    Element elementBR = doc.createElement("br");
    String bodyId = (String) context.get("BodyId");
    
    HtmlConvertorUtil.setAttribute(elementP,"id", DOMIdGenerator.generate(bodyId));
    HtmlConvertorUtil.setAttribute(elementP,"_type", type);
    HtmlConvertorUtil.setAttribute(elementBR,"class", "hideInIE",false);
    
    elementP.appendChild(elementBR);
    return elementP;
  }

  public static String replaceContinuousSpaceWithNbsp(String text)
  {
    char[] textArray = text.toCharArray();
    // change first space to Nbsp
    if (textArray[0] == '\u0020')
      textArray[0] = '\u00a0';
    boolean flag = false;
    for (int j = 0; j < text.length(); j++)
    {
      if (textArray[j] == '\u0020')
      {
        if (flag == false)
          flag = true;
        else
          textArray[j] = '\u00a0';
      }
      else
        flag = false;
    }
    return new String(textArray);
  }

  @SuppressWarnings("restriction")
  public static void appendText2Parent(ConversionContext context, Node htmlNode, Text node, Map styles)
  {
    Document doc = (Document) context.getTarget();
    Map<String, Object> nodes = getBuddyNodes(context, doc, (Element) htmlNode, styles, node);
    boolean isPreUnsupport = isUnsupportElement(context, (Node) nodes.get("pre"));
    boolean isNextUnsupport = isUnsupportElement(context, (Node) nodes.get("next"));
    if (isClose2UnsupportedElement(context, (Node) nodes.get("pre"), (Node) nodes.get("next")))
    {
      addSpan2TxtNode(doc, context, htmlNode, node, nodes, isPreUnsupport, styles);
      return;
    }
    else
    {
      Element span = null;
      if (null != styles)
      {
        span = doc.createElement(HtmlCSSConstants.SPAN);
        HtmlConvertorUtil.setAttribute(span,"style", ConvertUtil.convertMapToStyle(styles));
      }
      Text txtChild = (Text) nodes.get("txtChild");
      if (null != txtChild)
      {
        if (null != span)
        {
          span.appendChild(txtChild);
          ((Element) htmlNode).appendChild(span);
        }
        else
          ((Element) htmlNode).appendChild(txtChild);
      }
    }
  }

  /**
   * Add Id to Span which has text child node and the next or previous node has unsupported element If the previous node is a span with
   * unsupported element, add id to the span.
   * 
   * @param context
   * @param htmlNode
   * @param node
   * @param styles
   */
  public static void addSpan2TxtNode(Document doc, ConversionContext context, Node htmlNode, Text node, Map<String, Object> nodes,
      boolean isPreUnsupport, Map styles)
  {
    Element htmlSpan = (Element) nodes.get("span");
    boolean parentIsSpan = (Boolean) nodes.get("parentIsSpan");
    Node preNode = (Node) nodes.get("pre");
    Element htmlElement = (Element) htmlNode;
    try
    {
      OdfTextSpan odfSpan = null;
      if (parentIsSpan)
      {
        odfSpan = (OdfTextSpan) node.getParentNode();
      }
      else
      {
        odfSpan = new OdfTextSpan((OdfFileDom) node.getOwnerDocument());
        odfSpan.appendChild(node.cloneNode(true));
        node.getParentNode().replaceChild(odfSpan, node);
      }
      if (odfSpan == null)
      {
        if (nodes.get("parentNode") != null)
        {
          odfSpan = (OdfTextSpan) nodes.get("parentNode");
        }
      }
      context.getOdfToHtmlIndexTable().addEntryByOdfNodeWithForceId(odfSpan, htmlSpan, IndexUtil.RULE_NORMAL);
      if (isPreUnsupport)
      {
        if (preNode.getNodeName().equals("text:span"))
        {
          Element htmlPreSpan = null;
          if (parentIsSpan)
            htmlPreSpan = (Element) htmlSpan.getPreviousSibling();
          else
            htmlPreSpan = (Element) htmlElement.getChildNodes().item(htmlElement.getChildNodes().getLength() - 1);
          context.getOdfToHtmlIndexTable().addEntryByOdfNodeWithForceId((OdfElement) preNode, htmlPreSpan, IndexUtil.RULE_NORMAL);
        }
      }
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "Faild to add id to span", e);
    }
    if (!parentIsSpan || null != styles)
      htmlElement.appendChild(htmlSpan);
  }

  private static Map<String, Object> getBuddyNodes(ConversionContext context, Document doc, Element htmlElement, Map styles, Object node)
  {
    boolean parentIsSpan = false;
    Element htmlSpan = null;
    Text txtNode = (Text) node;
    Node preNode = null, nextNode = null;
    HashMap<String, Object> results = new HashMap<String, Object>();
    if (isSpan(htmlElement))
    {
      if (null == styles)
        htmlSpan = htmlElement;
      else
      {
        htmlSpan = doc.createElement(HtmlCSSConstants.SPAN);
        HtmlConvertorUtil.setAttribute(htmlSpan,HtmlCSSConstants.STYLE, ConvertUtil.convertMapToStyle(styles));
      }
      parentIsSpan = true;
      Node parentNode = txtNode.getParentNode();
      /*preNode = txtNode.getPreviousSibling();
      nextNode = txtNode.getNextSibling();
      */
      preNode = getBuddyNode(txtNode,preNode,"pre"); 
      nextNode = getBuddyNode(txtNode,nextNode,"next");
      
      if (isClose2UnsupportedElement(context, preNode, nextNode))
      {
        htmlSpan = doc.createElement(HtmlCSSConstants.SPAN);
        Text txtChild = creatTextNode(doc, txtNode);
        htmlSpan.appendChild(txtChild);
        results.put("span", htmlSpan);
        results.put("parentIsSpan", false);
        results.put("pre", preNode);
        addSpan2TxtNode(doc, context, htmlElement, txtNode, results, isUnsupportElement(context, preNode), styles);
        results.clear();
        results.put("parentNode", parentNode);
        txtNode = null;
      }
      /*preNode = parentNode.getPreviousSibling();
      nextNode = parentNode.getNextSibling();*/
      
       preNode = getBuddyNode(parentNode,preNode,"pre"); 
       nextNode = getBuddyNode(parentNode,nextNode,"next");
       
    }
    else
    {
      htmlSpan = doc.createElement(HtmlCSSConstants.SPAN);
      if (null != styles)
        HtmlConvertorUtil.setAttribute(htmlSpan,HtmlCSSConstants.STYLE, ConvertUtil.convertMapToStyle(styles));

      /*preNode = txtNode.getPreviousSibling();
      nextNode = txtNode.getNextSibling();*/
      preNode = getBuddyNode(txtNode,preNode,"pre"); 
      nextNode = getBuddyNode(txtNode,nextNode,"next");
      
    }
    Text txtChild = null;
    if (txtNode != null)
    {
      txtChild = creatTextNode(doc, txtNode);
      if (isClose2UnsupportedElement(context, preNode, nextNode))
        htmlSpan.appendChild(txtChild);
    }
    results.put("pre", preNode);
    results.put("next", nextNode);
    results.put("span", htmlSpan);
    results.put("parentIsSpan", parentIsSpan);
    results.put("txtChild", txtChild);
    return results;
  }

  private static boolean isSpan(Element htmlElement)
  {
    String srcAttr = htmlElement.getAttribute("_src");
    if (srcAttr != null && !srcAttr.equals(""))
      return false;
    else
      return HtmlCSSConstants.SPAN.equals(htmlElement.getNodeName().toLowerCase());

  }

  private static Node getBuddyNode(Node node, Node buddyNode, String flag)
  {
    if (flag.equals("pre"))
    {
      buddyNode = node.getPreviousSibling();
    }
    else
    {
      buddyNode = node.getNextSibling();
    }
    if (buddyNode == null)
      return null;
    if (buddyNode.getNodeName().equals(HtmlCSSConstants.P))
      return null;
    while (buddyNode instanceof Text // Text node
        || buddyNode instanceof OdfTextLineBreak // line break
        || buddyNode instanceof OdfTextTab // text tab
        || buddyNode instanceof OdfTextSpace)
    {
      buddyNode = getBuddyNode(buddyNode, buddyNode, flag);
    }
    return buddyNode;
  }

  private static Text creatTextNode(Document doc, Text txtNode)
  {
    Text txtChild;
    String content = txtNode.getNodeValue();
    content = HtmlConvertorUtil.replaceContinuousSpaceWithNbsp(content);// replace space with nbsp
    txtChild = doc.createTextNode(content);
    return txtChild;
  }

  private static boolean isClose2UnsupportedElement(ConversionContext context, Node preNode, Node nextNode)
  {
    boolean isPreUnsupport = isUnsupportElement(context, preNode);
    boolean isNextUnsupport = isUnsupportElement(context, nextNode);
    if (isPreUnsupport || isNextUnsupport)
      return true;
    return false;
  }

  /**
   * If the node or its' first level child has
   * 
   * @param context
   * @param node
   * @return
   */
  public static boolean isUnsupportElement(ConversionContext context, Node node)
  {
    if (null != node && !(node instanceof Text) && !context.getOdfToHtmlIndexTable().isOdfNodeIndexed((OdfElement) node))
    {
      NodeList children = node.getChildNodes();
      int length = children.getLength();
      for (int i = 0; i < length; i++)
      {
        Node child = children.item(i);
        if (isUnsupportElement(child))
          return true;
        else
          continue;
      }
      return isUnsupportElement(node);
    }
    else
      return false;
  }

  public static boolean isUnsupportElement(Node node)
  {
    List<String> disabledElements = ODTConvertorUtil.getDisabledElements();
    JSONObject odfMap = ConvertUtil.getODFMap();
    if (node instanceof Text || node instanceof OdfTextTab)
      return false;
    if (disabledElements.contains(node.getNodeName()))
      return true;
    if (!odfMap.containsKey(node.getNodeName()))
      return true;
    if(isAsCharTextBox(node))
      return true;
    return false;
  }
  
  public static boolean isAsCharTextBox(Node node)
  {
    if(ODFConstants.DRAW_FRAME.equals(node.getNodeName()))
    {
      if("as-char".equals(((Element) node).getAttribute(ODFConstants.TEXT_ANCHOR_TYPE)))
      {
        if(ODFConstants.DRAW_TEXT_BOX.equals(node.getFirstChild().getNodeName()))
          return true;
      }
    }
    return false;
  }

  public static String getWindowFontColor(ConversionContext context, OdfElement element)
  {
    // should check auto color
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");

    // if global font color is setted, ignore this
    if (map.get("default-style_paragraph").containsKey("color"))
      return null;

    Set<String> autoColors = CSSConvertorUtil.getAutoColorStyles(context);
    String styleName = getElementStyleName(element, map);
    if (autoColors.contains("default-style_paragraph"))
    {
      String fontColor = CSSConvertorUtil.getElementStyleVaule(context, element, HtmlCSSConstants.COLOR);
      if (fontColor == null || autoColors.contains(styleName))
      {
        String backgroundColor = CSSConvertorUtil.getElementStyleVaule(context, element, HtmlCSSConstants.BACKGROUND_COLOR);
        if (backgroundColor != null)
        {
          return CSSConvertorUtil.getWindowFontColor(backgroundColor);
        }
        else
        {
          if (autoColors.contains(styleName))
            return "#000000";
        }
      }
    }
    return null;
  }

  public static void addIdToParentSpan(ConversionContext context, OdfElement element, Element parent)
  {
    while (parent != null && parent.getNodeName().equals(HtmlCSSConstants.SPAN))
    {
      element = (OdfElement) element.getParentNode();
      context.getOdfToHtmlIndexTable().addEntryByOdfNodeWithForceId(element, parent, IndexUtil.RULE_NORMAL);
      parent = (Element) parent.getParentNode();
    }
  }

  public static String updateImageDirAndCopyImageToDraftFolder(ConversionContext context, String imageSrc, OdfElement element)
  {
    imageSrc = updateImageDir(context, imageSrc, element);
    copyImageToDraftFolder(context, imageSrc);
    return imageSrc;
  }

  /**
   * In normal, Images are under Pictures/, but Office2010 put images under media/. This Fuc will copy image from media/ to Pictures/,
   * update xhref:link value and return it.
   * 
   * @param imageSrc
   *          - original xhref:link value, eg. media/image1.jpg, Pictures/1000000202020.jpg
   * @param element
   *          - xhref:link on the element
   * @return - new xhref:link value. eg. media/image1.jpg will return as Pictures/image1.jpg
   */
  private static String updateImageDir(ConversionContext context, String imageSrc, OdfElement element)
  {
    if (imageSrc == null || !imageSrc.startsWith("media/"))
      return imageSrc;

    InputStream in = null;
    try
    {
      OdfDocument odf = (OdfDocument) context.getSource();
      OdfPackage odfPackage = odf.getPackage();
      in = odfPackage.getInputStream(imageSrc);
      File file = new File(imageSrc);
      String fileName = file.getName();
      odfPackage.insert(in, "./Pictures/" + fileName, OdfFileEntry.getMediaTypeString(fileName));
      odfPackage.remove(imageSrc);
      imageSrc = imageSrc.replaceFirst("media/", "Pictures/");
      HtmlConvertorUtil.setAttribute(element,ODFConstants.XLINK_HREF, imageSrc);
    }
    catch (Exception e)
    {
      log.log(Level.INFO, e.getMessage(), e);
    }
    finally
    {
      if (in != null)
      {
        try
        {
          in.close();
        }
        catch (IOException e)
        {
          log.log(Level.INFO, e.getMessage(), e);
        }
      }
    }

    return imageSrc;
  }

  /**
   * Copy Images which under Pictures/ to draft folder.
   */
  private static void copyImageToDraftFolder(ConversionContext context, String imageSrc)
  {
    // before use this func should use func updateImageDir to ensure that all images are under Pictures/.
    if (imageSrc == null || !imageSrc.startsWith("Pictures/"))
      return;

    InputStream in = null;
    OutputStream out = null;
    try
    {
      OdfDocument odf = (OdfDocument) context.getSource();
      OdfPackage odfPackage = odf.getPackage();
      String fileName = imageSrc.substring(9);
      File targetFolder = (File) context.get("targetFolder");
      File pictureDir = new File(targetFolder.getPath() + File.separator + "Pictures");
      if (!pictureDir.exists())
        pictureDir.mkdirs();
      String targetFilePath = pictureDir.getAbsolutePath() + File.separator + fileName;
      if (!new File(targetFilePath).exists())
      {
        in = odfPackage.getInputStream(imageSrc);
        out = new FileOutputStream(targetFilePath);
        int len = 0;
        byte[] buf = new byte[4096];
        while ((len = in.read(buf)) > 0)
        {
          out.write(buf, 0, len);
        }
      }
    }
    catch (Exception e)
    {
      log.log(Level.INFO, e.getMessage(), e);
    }
    finally
    {
      if (in != null)
      {
        try
        {
          in.close();
        }
        catch (IOException e)
        {
          log.log(Level.INFO, e.getMessage(), e);
        }
      }
      if (out != null)
      {
        try
        {
          out.close();
        }
        catch (IOException e)
        {
          log.log(Level.INFO, e.getMessage(), e);
        }
      }
    }
  }

  public static void updateHeightWidth(ConversionContext context, Map<String, String> styleMap, String styleName, String nodeName)
  {
    if (!hasGraphicParentStyle(context, styleName) && nodeName.equals("img"))
      return;
    String width = styleMap.get(HtmlCSSConstants.WIDTH);
    String height = styleMap.get(HtmlCSSConstants.HEIGHT);
    if (width != null)
    {
      String LRPaddingWidth = ConvertUtil.getLRPadding(styleMap);
      if (LRPaddingWidth != null)
      {
        String newWidth = UnitUtil.decreaseLength(width, LRPaddingWidth);
        styleMap.put(HtmlCSSConstants.WIDTH, newWidth);
      }
    }
    if (height != null)
    {
      String TBPaddingWidth = ConvertUtil.getTBPadding(styleMap);
      if (TBPaddingWidth != null)
      {
        String newHeight = UnitUtil.decreaseLength(height, TBPaddingWidth);
        styleMap.put(HtmlCSSConstants.HEIGHT, newHeight);
      }
    }
  }

  private static boolean hasGraphicParentStyle(ConversionContext context, String styleName)
  {
    boolean hasGraphicParentStyle = true;
    OdfElement styleElement;
    try
    {
      styleElement = (OdfElement) ((OdfDocument) context.getSource()).getContentDom().getAutomaticStyles();
      NodeList styleList = styleElement.getChildNodes();
      for (int i = 0; i < styleList.getLength(); i++)
      {
        Node style = styleList.item(i);
        if (style instanceof OdfStyle)
        {
          String autoStyleName = ((OdfStyle) style).getAttribute(ODFConstants.STYLE_NAME);
          if (styleName.equals(autoStyleName))
          {
            String parentStyleName = ((OdfStyle) style).getAttribute(ODFConstants.STYLE_PARENT_STYLE_NAME);
            if (parentStyleName == null || !parentStyleName.equals("Graphics"))
              hasGraphicParentStyle = false;
          }
        }
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    return hasGraphicParentStyle;
  }

  public static void removeDivOutOfSpan(Element spanNode, ArrayList<Element> list)
  {
    Node childNode = spanNode.getFirstChild();
    while (childNode != null)
    {
      Node tempNode = childNode;
      childNode = childNode.getNextSibling();
      if (tempNode.getNodeName().equals(HtmlCSSConstants.DIV))
      {
        if (list != null && list.contains(tempNode))
        {
          Node cloneNode = tempNode.cloneNode(true);
          spanNode.getParentNode().appendChild(cloneNode);
          spanNode.removeChild(tempNode);
        }
        else
        {
          Node cloneNode = tempNode.cloneNode(true);
          spanNode.getParentNode().insertBefore(cloneNode, spanNode);
          spanNode.removeChild(tempNode);
        }
      }
    }
  }

  public static Element createHtmlElement(ConversionContext context, OdfElement odfElement, String tagName)
  {
    Document doc = (Document) context.getTarget();
    String bodyId = (String) context.get("BodyId");
    return context.getOdfToHtmlIndexTable().createHtmlElement(odfElement, doc, tagName, IndexUtil.RULE_NORMAL, bodyId);
  }

  public static Element createHtmlElementWithForceId(ConversionContext context, OdfElement odfElement, String tagName)
  {
    Document doc = (Document) context.getTarget();
    String bodyId = (String) context.get("BodyId");
    return context.getOdfToHtmlIndexTable().createHtmlElementWithForceId(odfElement, doc, tagName, bodyId);
  }

  public static void addEntryByOdfNode(ConversionContext context, OdfElement odfNode, Element htmlNode)
  {
    Document doc = (Document) context.getTarget();
    String bodyId = (String) context.get("BodyId");
    context.getOdfToHtmlIndexTable().addEntryByOdfNode(odfNode, htmlNode, IndexUtil.RULE_NORMAL, bodyId);
  }

  private static Element createDivElement(ConversionContext context)
  {
    Document doc = (Document) context.getTarget();
    String bodyId = (String) context.get("BodyId");
    Element div = doc.createElement(HtmlCSSConstants.DIV);
    HtmlConvertorUtil.setAttribute(div,"id", DOMIdGenerator.generate(bodyId));
    return div;
  }

  private static Element generateLocationDiv(ConversionContext context, boolean isReadOnly)
  {
    Element locationDiv = createDivElement(context);
    HtmlConvertorUtil.setAttribute(locationDiv,"_type", HtmlCSSConstants.LOCATIONDIV,false);
    if (isReadOnly)
    {
      HtmlConvertorUtil.setAttribute(locationDiv,"unselectable", "on",false);
      HtmlConvertorUtil.setAttribute(locationDiv,"contenteditable", "false",false);
      HtmlConvertorUtil.setAttribute(locationDiv,"style", "-webkit-user-modify:read-only;-moz-user-select:none; ",false);
    }
    return locationDiv;
  }

  public static Element getLocationDiv(ConversionContext context, OdfElement odfElement, Element parent, String anchorType)
  {
    Element locationDiv = null;
    NodeList childNodes = parent.getChildNodes();
    boolean isReadOnly = true;
    if (odfElement.getNodeName().equals(ODFConstants.DRAW_FRAME))
    {
      if (odfElement.getFirstChild().getNodeName().equals(ODFConstants.DRAW_TEXT_BOX))
        isReadOnly = false;
    }
    if (anchorType.equals("page"))
    {
      if (odfElement.getParentNode().getNodeName().equals(ODFConstants.DRAW_G))
      {
        if (odfElement.getParentNode().getFirstChild().isSameNode(odfElement) && context.get("GroupImageList") == null)
        {
          return generateLocationDiv(context, isReadOnly);
        }
      }
      else
      {
        return generateLocationDiv(context, isReadOnly);
      }
    }
    locationDiv = getLocationDiv(childNodes, isReadOnly);
    if (locationDiv == null)
      locationDiv = generateLocationDiv(context, isReadOnly);
    return locationDiv;
  }

  private static Element getLocationDiv(NodeList childNodes, boolean isReadOnly)
  {
    for (int i = childNodes.getLength() - 1; i > -1; i--)
    {
      Node node = childNodes.item(i);
      if (node instanceof Element)
      {
        String _type = ((Element) node).getAttribute("_type");
        if (_type != null && (_type.equals(HtmlCSSConstants.TOPDIV) || _type.equals(HtmlCSSConstants.LOCATIONDIV)))
        {
          if (_type.equals(HtmlCSSConstants.TOPDIV))
          {
            NodeList topDivChildNodes = ((Element) node).getChildNodes();
            return getLocationDiv(topDivChildNodes, isReadOnly);
          }
          if (isReadOnly)
            setReadOnly2Div(node);
          return (Element) node;
        }
      }
    }
    return null;
  }

  private static void setReadOnly2Div(Node node)
  {
    if (((Element) node).getAttribute("unselectable") == null || ((Element) node).getAttribute("unselectable").equals(""))
    {
      HtmlConvertorUtil.setAttribute(((Element) node),"unselectable", "on",false);
      HtmlConvertorUtil.setAttribute(((Element) node),"contenteditable", "false",false);
      HtmlConvertorUtil.setAttribute(((Element) node),HtmlCSSConstants.STYLE, ((Element) node).getAttribute(HtmlCSSConstants.STYLE)
          + "-webkit-user-modify:read-only;-moz-user-select:none; ");
    }
    NodeList divList = ((Element) node).getElementsByTagName(HtmlCSSConstants.DIV);
    for (int j = 0; j < divList.getLength(); j++)
    {
      Element div = (Element) divList.item(j);
      if (div.getAttribute("unselectable") == null || div.getAttribute("unselectable").equals(""))
      {
        HtmlConvertorUtil.setAttribute(div,"unselectable", "on",false);
        HtmlConvertorUtil.setAttribute(div,"contenteditable", "false",false);
      }
    }
  }

  public static void appendLocationDiv2Parent(ConversionContext context, Element parent, Element locationDiv)
  {
    if (locationDiv.getParentNode() != null)
      return;
    if (!formalParentNodeType.contains(parent.getNodeName()))
    {
      Element paragraphDiv = createDivElement(context);
      HtmlConvertorUtil.setAttribute(paragraphDiv,"_type", HtmlCSSConstants.TOPDIV,false);
      HtmlConvertorUtil.setAttribute(paragraphDiv,"_sourceType", HtmlCSSConstants.NEWPARAGRAPHDIV,false);
      paragraphDiv.appendChild(locationDiv);
      locationDiv = paragraphDiv;
    }
    parent.appendChild(locationDiv);
    String type = parent.getAttribute("_type");
    if (type != null && !type.equals(""))
    {
      if (type.indexOf(HtmlCSSConstants.TOPDIV) == -1)
        HtmlConvertorUtil.setAttribute(parent,"_type", type + " " + HtmlCSSConstants.TOPDIV,false);
    }
    else
      HtmlConvertorUtil.setAttribute(parent,"_type", HtmlCSSConstants.TOPDIV,false);
    HtmlConvertorUtil.setAttribute(parent,"_sourceType", parent.getNodeName() + "Div",false);
  }

  public static void setPostionByAnchorType(ConversionContext context, Element locationDiv, Element element, OdfElement odfElement,
      String anchorType)
  {
    Map<String, String> styleMap = (Map<String, String>) context.get(locationDiv.getAttribute("id"));
    OdfElement anchorElement = odfElement;
    if (odfElement.getLastChild().getNodeName().equals(ODFConstants.DRAW_TEXT_BOX))
    {
      Map<String, Object> results = getGroupRelatedParameters(anchorElement);
      anchorElement = (OdfElement) results.get("drawg");
      if (anchorElement.getNodeName().equals(ODFConstants.DRAW_G))
        anchorType = "paragraph";
    }
    if (isAsToParagraph(context, anchorType, anchorElement))
      anchorType = "paragraph";
    if (("paragraph".equals(anchorType) || "char".equals(anchorType) || "page".equals(anchorType)))
    {
      HtmlConvertorUtil.setAttribute(locationDiv,"_srcAnchorType", anchorType,false);
      HtmlConvertorUtil.setAttribute(element,"_srcAnchorType", anchorType,false);

      if (("paragraph".equals(anchorType)))
      {
        if (hasPositon(odfElement))
        {
          if (styleMap == null)
          {
            String locationDivStyle = locationDiv.getAttribute(HtmlCSSConstants.STYLE);
            styleMap = createStyleMap4LocationDiv(context, locationDiv, locationDivStyle);
          }
          styleMap.put("position", "relative");
          HtmlConvertorUtil.setAttribute(locationDiv,HtmlCSSConstants.STYLE, ConvertUtil.convertMapToStyle(styleMap),false);
          HtmlConvertorUtil.setAttribute(element,HtmlCSSConstants.STYLE, element.getAttribute(HtmlCSSConstants.STYLE) + "position:absolute;");
        }
      }
    }
    removeHeightFromLocationDiv(context, locationDiv, styleMap);
  }

  public static void removeHeightFromLocationDiv(ConversionContext context, Element locationDiv, Map<String, String> styleMap)
  {
    String locationDivStyle = locationDiv.getAttribute(HtmlCSSConstants.STYLE);
    if (styleMap == null)
    {
      styleMap = createStyleMap4LocationDiv(context, locationDiv, locationDivStyle);
    }

    if (!styleMap.containsKey("position"))
    {
      styleMap.remove("height");
      HtmlConvertorUtil.setAttribute(locationDiv,HtmlCSSConstants.STYLE, ConvertUtil.convertMapToStyle(styleMap),false);
    }
  }

  public static Map<String, Object> getGroupRelatedParameters(OdfElement element)
  {
    Map<String, Object> results = new HashMap<String, Object>();
    String anchorType = element.getAttribute(ODFConstants.TEXT_ANCHOR_TYPE);
    String zIndex = element.getAttribute(ODFConstants.DRAW_Z_INDEX);
    OdfElement drawG = element;
    if (zIndex.length() == 0)
    {
      if (ODFConstants.DRAW_G.equals(element.getParentNode().getNodeName()))
        drawG = (OdfElement) element.getParentNode();
      while (ODFConstants.DRAW_G.equals(drawG.getNodeName()))
      {
        anchorType = drawG.getAttribute(ODFConstants.TEXT_ANCHOR_TYPE);
        zIndex = drawG.getAttribute(ODFConstants.DRAW_Z_INDEX);
        if (zIndex.length() != 0)
        {
          break;
        }
        drawG = (OdfElement) drawG.getParentNode();
      }

    }
    results.put("anchortype", anchorType);
    results.put("zindex", zIndex);
    results.put("drawg", drawG);
    return results;
  }

  private static boolean hasPositon(OdfElement odfElement)
  {
    if (odfElement.getAttribute(ODFConstants.SVG_HEIGHT).length() > 0
        && odfElement.getAttribute(ODFConstants.SVG_X).length() > 0
        && odfElement.getAttribute(ODFConstants.SVG_Y).length() > 0
        || (odfElement.getAttribute(ODFConstants.ODF_ATTR_SVG_X1).length() > 0
            && odfElement.getAttribute(ODFConstants.ODF_ATTR_SVG_X1).length() > 0
            && odfElement.getAttribute(ODFConstants.ODF_ATTR_SVG_X2).length() > 0
            && odfElement.getAttribute(ODFConstants.ODF_ATTR_SVG_Y1).length() > 0 && odfElement.getAttribute(ODFConstants.ODF_ATTR_SVG_Y1)
            .length() > 0))
    {
      return true;
    }
    if (isTranslate(odfElement))
      return true;
    return false;
  }

  public static boolean isTranslate(OdfElement element)
  {
    String transform = element.getAttribute(ODFConstants.DRAW_TRANSFORM);
    if (null != transform && !transform.equals(""))
    {
      if (transform.split("translate").length == 2)
        return true;
    }
    return false;
  }

  private static boolean isAsToParagraph(ConversionContext context, String anchorType, OdfElement anchorElement)
  {
    boolean isAsToParagraph = false;
    if ("char".equals(anchorType))
    {
      String styleName = anchorElement.getAttribute(ODFConstants.DRAW_STYLE_NAME);
      try
      {
        OdfOfficeAutomaticStyles styleElement = (OdfOfficeAutomaticStyles) ((OdfDocument) context.getSource()).getContentDom()
            .getAutomaticStyles();
        OdfStyle style = styleElement.getStyle(styleName, OdfStyleFamily.Graphic);
        if (style != null)
        {
          Map<OdfStyleProperty, String> props = ((OdfStyle) style).getStyleProperties();
          String vertical_ref = props.get(OdfStyleGraphicProperties.VerticalRel);
          String horizontal_ref = props.get(OdfStyleGraphicProperties.VerticalRel);
          if (vertical_ref != null && vertical_ref.equals("paragraph"))
          {
            if (horizontal_ref != null && horizontal_ref.indexOf("paragraph") != -1 && horizontal_ref.indexOf("end") == -1)
            {
              isAsToParagraph = true;
            }
          }
        }
      }
      catch (Exception e)
      {
        e.printStackTrace();
      }
    }
    return isAsToParagraph;
  }

  public static void normalizeDiv(ConversionContext context, Element paragraphDiv, Element locationDiv, boolean isGrouped,
      String anchorType, OdfElement odfElement)
  {
    if (anchorType.equals("as-char") && !isGrouped)
    {
      Element element = (Element) locationDiv.removeChild(locationDiv.getLastChild());
      Element locationParent = (Element) locationDiv.getParentNode();
      removeLocationDivFromParent(paragraphDiv, locationDiv, locationParent);
      if (element.getAttribute("_type").equals("drawframe"))
      {
        Map<String, String> style = new HashMap<String, String>();
        Node node = element.getLastChild();
        while (!(node instanceof Element))
        {
          if (node != null)
            node = node.getPreviousSibling();
          else
            break;
        }
        Element child = (Element) element.removeChild(node);
        context.getOdfToHtmlIndexTable().removeEntry(element.getAttribute("id") + "," + odfElement.getAttribute("id"));
        if (HtmlCSSConstants.DIV.equals(child.getNodeName()))
        {
          changeElementNameToDiv(paragraphDiv);
        }
        paragraphDiv.appendChild(child);
        context.getOdfToHtmlIndexTable().addEntryByOdfNode(odfElement, child);
        if (child instanceof Element)
        {
          Element div = (Element) child;
          String divclass = div.getAttribute("class");
          if (HtmlCSSConstants.DIV.equals(div.getNodeName()) && !divclass.endsWith("placeholder") && !divclass.equals("textbox"))
          {
            context.put(div.getAttribute("id"), style);
            DrawFrameConvertor.convertAttributes(context, odfElement, div);
          }
        }
      }
      else
      {
        if (paragraphDiv.getFirstChild() != null && paragraphDiv.getFirstChild().getNodeName().equals(HtmlCSSConstants.P))
          paragraphDiv.removeChild(paragraphDiv.getFirstChild());
        paragraphDiv.appendChild(element);
      }
    }
    else
    {
      changeElementNameToDiv(paragraphDiv);
      
      if (paragraphDiv.getFirstChild() != null && paragraphDiv.getFirstChild().getNodeName().equals(HtmlCSSConstants.P))
      {
        Element p = (Element) paragraphDiv.getFirstChild();
        String pNodeName = paragraphDiv.getNodeName();
        if ("pUnderDiv".equals(p.getAttribute("_type")))
        {
          Element cloneP = (Element) paragraphDiv.removeChild(p).cloneNode(true);
          if (pNodeName.equals(HtmlCSSConstants.DIV))
            paragraphDiv.appendChild(cloneP);
        }
      }
    }
  }
  
  private static void changeElementNameToDiv(Element element)
  {
    if (element.getNodeName().equals(HtmlCSSConstants.P))
    {
      DomUtil.setElementName(element, HtmlCSSConstants.DIV);
    }
    else if (element.getNodeName().equals(HtmlCSSConstants.SPAN))
    {
      DomUtil.setElementName(element, HtmlCSSConstants.DIV);
      Node parent = element.getParentNode();
      if(parent != null)
      {
        changeElementNameToDiv((Element) parent);
      }
    }
  }

  public static void removeLocationDivFromParent(Element paragraphDiv, Element locationDiv, Element locationParent)
  {
    String style = locationDiv.getAttribute(HtmlCSSConstants.STYLE);
    style = style.replace("height", "preHeight");
    HtmlConvertorUtil.setAttribute(locationDiv,HtmlCSSConstants.STYLE, style,false);
    if (locationDiv.getChildNodes().getLength() == 0)
    {
      if (locationParent.getAttribute("_sourceType").indexOf(HtmlCSSConstants.NEWPARAGRAPHDIV) != -1)
        paragraphDiv.removeChild(locationParent);
      else
      {
        paragraphDiv.removeChild(locationDiv);
      }
    }
  }

  public static void setHeightAccordingWrapOption(ConversionContext context, String yPos, String height, Element parentDiv,
      OdfStyle graphicStyle, String anchorType, boolean isGrouped)
  {
    String wrap = getWrapOption(context, graphicStyle, anchorType, isGrouped);
    String _type = parentDiv.getAttribute("_type");
    // if the parent div is draw frame and its parent is sencond div, the height should be added to sencond div
    if (_type != null && _type.indexOf("drawframe") != -1)
    {
      Element grandParent = (Element) parentDiv.getParentNode();
      _type = (String) grandParent.getAttribute("_type");
      if (_type != null && _type.indexOf(HtmlCSSConstants.LOCATIONDIV) != -1)
        parentDiv = grandParent;
    }
    // if the wrap option isn't run through , then it needs to set the height to relative div.
    if (!wrap.equals("run-through"))
    {
      String style = parentDiv.getAttribute("style");
      parseParentDivHeight(context, parentDiv, yPos, height, style);
      String wrapOption = (String) context.get("WrapOption");
      if (wrapOption != null && !wrapOption.equals("run-through"))
        context.put("WrapOption", "none");
    }
    else
    {
      Element paragraphDiv = (Element) parentDiv.getParentNode();
      if (paragraphDiv == null)
        paragraphDiv = (Element) context.get("CurrentParagraph");
      OdfElement paragraph = (OdfElement) context.get("CurrentOdfParagraph");
      if (paragraph != null)
      {
        String txt = paragraph.getTextContent();
        boolean hasAddedP4Del = (Boolean) context.get("HasAddedP4Del");
        if (txt == null || txt.equals("") || txt.equals(" "))
        {
          if (!hasAddedP4Del)
          {
            Element pUnderDivElement = HtmlConvertorUtil.generateParagraphNode(context, "pUnderDiv");
            ParagraphConvertor.addDefaultStyleToNoStyleP(context, pUnderDivElement);
            paragraphDiv.appendChild(pUnderDivElement);
            context.put("HasAddedP4Del", Boolean.TRUE);
          }
        }
        context.put("WrapOption", "run-through");
      }
    }
  }

  private static String getWrapOption(ConversionContext context, OdfStyle graphicStyle, String anchorType, boolean isGrouped)
  {
    if (anchorType.equals("as-char"))
    {
      return "none";
      // return "run-through";
    }
    String wrap = "none";
    if(graphicStyle != null)
    {
      Node wrapNode = graphicStyle.item(0).getAttributes().getNamedItem("style:wrap");
      if (wrapNode != null)
        wrap = wrapNode.getNodeValue();
    }
    return wrap;
  }

  public static void parseParentDivHeight(ConversionContext context, Element parentDiv, String yPos, String height, String style)
  {
    Map<String, String> styleMap = (Map<String, String>) context.get(parentDiv.getAttribute("id"));
    String newHeight = null;
    if (height != null && yPos != null && UnitUtil.getLength(height) > 0)
        newHeight = UnitUtil.addLength(yPos, height);

    if (newHeight == null)
      return;

    if (styleMap != null)
    {
      String oriHeight = styleMap.get("height");
      // Defect 7013. div height will calculate by editor later. This part will be deleted later.
      if ("0cm".equals(height) && oriHeight == null)
        return;
      if (oriHeight == null || ConvertUtil.compareLength(newHeight, oriHeight) > 0)
      {
        // replace old if the newer is larger.
        styleMap.put("height", newHeight);
      }
    }
    else if (parentDiv.getNodeName().equals(HtmlCSSConstants.DIV))
    {
      // only shape need to new a style map
      String _type = parentDiv.getAttribute("_type");
      if (_type != null && _type.indexOf(HtmlCSSConstants.LOCATIONDIV) != -1)
      {
        styleMap = createStyleMap4LocationDiv(context, parentDiv, style);
        if (newHeight != null && UnitUtil.getLength(newHeight) > 0)
            styleMap.put("height", newHeight);
      }
    }
    if (styleMap != null)
    {
      HtmlConvertorUtil.setAttribute(parentDiv,HtmlCSSConstants.STYLE, ConvertUtil.convertMapToStyle(styleMap));
    }
  }

  public static Map<String, String> createStyleMap4LocationDiv(ConversionContext context, Element parent, String style)
  {
    Map<String, String> styleMap = ConvertUtil.buildCSSMap(style);
    context.put(parent.getAttribute("id"), styleMap);
    return styleMap;
  }

  @SuppressWarnings("restriction")
  public static void removeID(Node element)
  {
    NodeList childNodes = element.getChildNodes();
    for (int i = 0; i < childNodes.getLength(); i++)
    {
      Node node = childNodes.item(i);
      if (node instanceof OdfElement)
      {
        OdfElement el = (OdfElement) node;
        if (el.hasAttribute(HtmlCSSConstants.ID))
          el.removeAttribute(HtmlCSSConstants.ID);
        removeID(el);
      }
    }
  }

  public static void flatten(ConversionContext context, OdfElement odfElement, Element imgNode)
  {
    String flattenedString = OdfElementUtil.flattenElement(odfElement);
    StringPool stringPool = (StringPool) context.get("stringPool");
    String key = stringPool.addString(flattenedString);
    HtmlConvertorUtil.setAttribute(imgNode,HtmlCSSConstants.preserve0, key);
  }
  
  public static boolean hasThinBorer(Map<String, String> styleMap)
  {
    Set<Entry<String, String>> set = styleMap.entrySet();
    Iterator iter = set.iterator();
    while(iter.hasNext())
    {
      Entry<String, String> entry = (Entry<String, String>) iter.next();
      String key = entry.getKey();
      if(key.startsWith("border"))
      {
        String value = entry.getValue();
        if(key.endsWith("width"))
        {
          if(ConvertUtil.compareLength(value, "0.75pt") < 0)
            return true;
        }
        else if(!value.endsWith("color") && !value.endsWith("style"))
        {
          if(compareBorder(value))
            return true;
        }
      }
    }
    return false;
  }
  
  private static boolean compareBorder(String border)
  {
    StringTokenizer st = new StringTokenizer(border, " ");
    String borderWidth = st.nextToken();
    if(borderWidth.endsWith("pt") || borderWidth.endsWith("cm") || borderWidth.endsWith("in"))
    {
      if(ConvertUtil.compareLength(borderWidth, "0.75pt") < 0)
        return true;
    }
    return false;
  }
  
}
