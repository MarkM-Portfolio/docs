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

import java.net.URLDecoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.doc.svg.OdfSvgDesc;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.HTML2ODTConverter;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;

public class ImageConvertor extends GeneralXMLConvertor
{
  private static Logger log = Logger.getLogger(HTML2ODTConverter.class.getName());
  
  public static final String DEFAULT_GRAPHIC_STYLE = "gr_default_1";
  
  public static Set<String> imgType = new HashSet<String>();

  public static Set<String> pagebreakType = new HashSet<String>();

  static
  {
    imgType.add("svm");
    imgType.add("wmf");
    imgType.add("tif");
  }

  static
  {
    pagebreakType.add("table");
    pagebreakType.add("p");
    pagebreakType.add("h1");
    pagebreakType.add("h2");
    pagebreakType.add("h3");
    pagebreakType.add("h4");
    pagebreakType.add("h5");
    pagebreakType.add("h6");
  }
  
  private boolean isListSpacer(Element htmlElement)
  {
    String className = htmlElement.getAttribute(HtmlCSSConstants.CLASS);
    if( className != null && className.toLowerCase().contains("listspacer"))
    {
      return true;
    }
    return false;    
  }

  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    String id = htmlElement.getAttribute(HtmlCSSConstants.ID);
    if( isListSpacer(htmlElement))
      return ;
    
    String commentId = htmlElement.getAttribute(Constants.COMMENT_ID);
    if (commentId.length() > 0)
    {
      convertComments(context, commentId, parent);
      return;
    }
    
    if (XMLConvertorUtil.isShape(context, htmlElement))
    {
      String src = htmlElement.getAttribute(HtmlCSSConstants.SRC);
      IConvertor convertor = XMLConvertorFactory.getInstance().getConvertor(HtmlCSSConstants.SHAPE);
      convertor.convert(context, htmlElement, parent);
      saveImageSrcName(context,src);
    }
    else
    {

      if (isPageBreak(htmlElement))
      {
        processPageBreak(context, htmlElement, parent);
        return;
      }
      if ("ConcordTab".equals(htmlElement.getAttribute("class")))
      {
        HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
        OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
        if (odfElement != null)
        {
          parent.appendChild(odfElement);
        }
        else
        {
          OdfFileDom currentFileDom = XMLConvertorUtil.getCurrentFileDom(context);
          odfElement = currentFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_TAB));
          indexTable.addEntryByHtmlNode(htmlElement, odfElement);
          parent.appendChild(odfElement);
        }
        return;
      }
      else if("group".equals(htmlElement.getAttribute("class")))
      {
        HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
        OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
        if (odfElement != null)
        {
          parent.appendChild(odfElement);
          
          NodeList imageNodes = odfElement.getElementsByTagName(ODFConstants.DRAW_IMAGE);
          for(int i=0; i<imageNodes.getLength(); i++)
          {
            Element imageNode = (Element)imageNodes.item(i);
            if(imageNode != null)
            {
              String href = imageNode.getAttribute(ODFConstants.XLINK_HREF);
              HashSet<String> imageSrcSet = (HashSet<String>) context.get(Constants.IMAGESRC_SET);
              imageSrcSet.add(href.substring(9));
            } 
          }
        }
        return;
      }

      HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
      List<OdfElement> odfElements = indexTable.getOdfNodes(htmlElement);

      // Export <img> attributes to <draw:image>.
      // In convertAttritubes(), <img> attributes will be exported to <draw:frame> and <svg:title> in need.
      // <img> correspond to <draw:image/> or <draw:frame><draw:image/></draw:frame> or <draw:frame><draw:image/><svg:title/></draw:frame>
      if (odfElements != null && odfElements.get(0) != null)
      {
        for (int i = 0; i < odfElements.size() ; i++)
        {
          OdfElement element = odfElements.get(i);
          if(element != null && element.getNodeName().equals(ODFConstants.DRAW_IMAGE))
          {
            if(ODFConstants.DRAW_FRAME.equals(parent.getNodeName()))
              parent.appendChild(element);
            else
              XMLConvertorUtil.appendChild(context, (OdfElement)element.getParentNode(), parent);
            convertAttributes(context, htmlElement, element);
            convertChildren(context, htmlElement, element);
          }
        }
      }
      else
      // new created, <img> just correspond to <draw:frame><draw:image/></draw:frame>
      {
        OdfElement odfElement = convertElement(context, htmlElement, parent); // odfElement correspond to <draw:frame>
        OdfElement imageOdfElement = (OdfElement) odfElement.getFirstChild();// odfElement.getFirstChild() correspond to <draw:image>
        if (odfElement != null && imageOdfElement != null)
        {
          convertAttributes(context, htmlElement, imageOdfElement);
          convertChildren(context, htmlElement, imageOdfElement);
          String srcAnchorType = htmlElement.getAttribute("_srcanchortype");
          if("page".equals(srcAnchorType) )
          {
            OdfStyle style = generateDefaultStyle(context);
            odfElement.setAttribute(ODFConstants.DRAW_STYLE_NAME, style.getStyleNameAttribute());
            style.addStyleUser( (OdfStylableElement) odfElement);
          }
        }
      }
    }
  }

  private void convertComments(ConversionContext context, String commentId, OdfElement parent)
  {
    JSONArray comments = (JSONArray)context.get(Constants.COMMENT_ARRAY);
    if(comments != null)
    {
      for(int i=0; i< comments.size(); i++)
      {
        JSONObject comment = (JSONObject)comments.get(i);
        String cmtId = (String)comment.get("id");
        if(cmtId!=null && cmtId.equals(commentId))
        {
          OdfFileDom currentFileDom = XMLConvertorUtil.getCurrentFileDom(context);
          JSONArray items = (JSONArray)comment.get("items");
          for(int j=0; j< items.size(); j++)
          {
            JSONObject item = (JSONObject)items.get(j);
            OdfElement annotation = currentFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.OFFICE_ANNOTATION));
            if(j==0)
              annotation.setAttribute("cid", cmtId);
            else
              annotation.setAttribute("pid", cmtId);
            OdfElement dcCreator = currentFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.ODF_ELEMENT_DCCREATOR));
            dcCreator.setTextContent((String)item.get("name"));
            annotation.appendChild(dcCreator);
            OdfElement dcDate = currentFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.ODF_ELEMENT_DCDATE));
            long dVal = (Long)item.get("time");
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
            String date = sdf.format(new Date(dVal)).replace(' ', 'T');
            dcDate.setTextContent(date);
            annotation.appendChild(dcDate);
            OdfElement textP = currentFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_P));
            textP.setTextContent((String)item.get("content"));
            annotation.appendChild(textP);
            parent.appendChild(annotation);
          }
          break;
        }
      }
    }
  }

  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null)
    {
      parent.appendChild(odfElement);
      return odfElement;
    }

    try
    {
      OdfFileDom currentFileDom = XMLConvertorUtil.getCurrentFileDom(context);

      OdfElement image = currentFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.DRAW_IMAGE));
      
      if( parent.getNodeName().equals(ODFConstants.DRAW_FRAME)  )
      {
        odfElement = parent;
        
      }
      else
      {      
        odfElement = currentFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.DRAW_FRAME));

        if (parent.getNodeName().equals(ODFConstants.TEXT_LIST_ITEM))
        {
          OdfElement p = currentFileDom.createElementNS(ConvertUtil.getOdfName(ODFConstants.TEXT_P));
          p.appendChild(odfElement);
          parent.appendChild(p);
        }
        else
          parent.appendChild(odfElement);
      }
      
      String srcAnchorType = htmlElement.getAttribute("_srcanchortype");
      if( srcAnchorType == null || srcAnchorType.length() == 0)
      {
        srcAnchorType = "as-char";
      }
      else
      {
        if( "page".equals(srcAnchorType))
        {
          srcAnchorType = "paragraph";
          htmlElement.removeAttribute("class");
        }
      }
      
      odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_ANCHOR_TYPE), srcAnchorType);
      odfElement.appendChild(image);      
      
      
      if (!IndexUtil.NO_ID_NODES.contains(HtmlCSSConstants.IMG))
      {
        if( parent != odfElement)
        {
          indexTable.addEntryByHtmlNode(htmlElement, odfElement);
        }
        indexTable.addEntryByHtmlNode(htmlElement, image);
      }
      return odfElement;
    }
    catch (Exception e)
    {
      XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ELEMENT, e.getMessage());
      return null;
    }
  }
  
  protected void convertAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    // odfElement must be <draw:image>, htmlElement must be <img>
    OdfElement frameOdfElement = (OdfElement) odfElement.getParentNode();
    if(frameOdfElement == null)
    {
      Element frameHtmlElement = (Element)htmlElement.getParentNode();
      HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
      frameOdfElement = indexTable.getFirstOdfNode(frameHtmlElement);
    }
    // handle <img> with <draw:image> firstly
    String src = htmlElement.getAttribute(HtmlCSSConstants.SRC);
    if (src.contains("Pictures/"))
    {
      src = saveImageSrcName(context, src);
    }
    else
      src = URLDecoder.decode(src);

    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_HREF), src);
    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_TYPE), "simple");
    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_SHOW), "embed");
    odfElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.XLINK_ACTUATE), "onLoad");

    // handle <img alt="..." /> with <svg:title>
    String alt = htmlElement.getAttribute(HtmlCSSConstants.ALT);
    NodeList list = frameOdfElement.getElementsByTagName(ODFConstants.SVG_TITLE);
    if (list != null && list.item(0) != null)
    {
      if (alt != null && !alt.equals(""))
        list.item(0).setTextContent(alt);
      else
        frameOdfElement.removeChild(list.item(0));
    }
    if (alt != null && !alt.equals("") && (list == null || list.item(0) == null))
    {
      try
      {
        OdfElement altOdfElement = XMLConvertorUtil.getCurrentFileDom(context).createElementNS(
            ConvertUtil.getOdfName(ODFConstants.SVG_TITLE));
        altOdfElement.setTextContent(alt);
        frameOdfElement.appendChild(altOdfElement);
      }
      catch (Exception e)
      {
        XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ELEMENT, e.getMessage());
      }
    }
    preserveSVGDes(context, odfElement);
    // handle <img> with <draw:frame> later
    odfElement = frameOdfElement;
    
    String styleName = htmlElement.getAttribute("class");
    super.convertAttributes(context, htmlElement, odfElement);
  }
  private static void preserveSVGDes(ConversionContext context,OdfElement odfElement)
  {
    List<Node> oldChildren = (List<Node>)context.get("currentOldChildren");
    if(!oldChildren.isEmpty())
    {
      for(int i=1 ; i<oldChildren.size() ; i++)
      {
        Node node = oldChildren.get(oldChildren.size()-i);
        if(node instanceof OdfSvgDesc)
          odfElement.appendChild(node);
      }
    }
  }
  public static String saveImageSrcName(ConversionContext context, String src)
  {
    int flag = src.lastIndexOf("Pictures/");
    if(flag > 0)
      src = src.substring(flag);
    int index = src.substring(9).indexOf("/");
    if (index > 0)
    {
      String extName = src.substring(9, 9 + index);
      if (imgType.contains(extName))
      {
        src = src.replace(extName + "/", "");
        int dotIndex = src.lastIndexOf(".");
        src = src.substring(0, dotIndex + 1) + extName;
      }
      else if("shape".equals(extName))
      {
        src = src.replace("shape/", "");
      }
    }
    HashSet<String> imageSrcSet = (HashSet<String>) context.get(Constants.IMAGESRC_SET);
    imageSrcSet.add(src.substring(9));
    return src;
  }

  private static boolean isPageBreak(Element htmlElement)
  {
    NamedNodeMap attrs = htmlElement.getAttributes();
    Node classAttr = (null == attrs) ? null : attrs.getNamedItem(Constants.CLASS);
    if (null != classAttr)
    {
      String classVal = classAttr.getNodeValue();
      if (classVal != null && Constants.CK_PAGE_BREAK.equals(classVal))
      {
        return true;
      }
    }
    return false;
  }

  public static void processPageBreak(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    if (htmlElement.getParentNode().getNodeName().equalsIgnoreCase(HtmlCSSConstants.LI))
    {
      Node nextNode = htmlElement.getParentNode().getNextSibling();
      while (nextNode.getNodeType() != Node.ELEMENT_NODE)// there should be a block element after page break, otherwise, concord has error
      {
        nextNode = nextNode.getNextSibling();
      }
      Element nextHtmlNode = (Element) getChild((Element) nextNode, HtmlCSSConstants.SPAN);
      if (nextHtmlNode != null)
      {
        String styleAttrVal = nextHtmlNode.getAttribute(Constants.STYLE);
        styleAttrVal += "break-before: page;";
        nextHtmlNode.setAttribute(Constants.STYLE, styleAttrVal);

        parent.getParentNode().removeChild(parent);// remove the empty li
      }
    }
    else
    {
      Node nextNode = htmlElement.getNextSibling();
      nextNode = getPageBreakNode(context, nextNode);
      Element nextHtmlNode = (Element) nextNode;
      if (isPageBreak(nextHtmlNode))
      {
        Document htmlDoc = (Document) context.getSource();
        Element newPara = htmlDoc.createElement(HtmlCSSConstants.P);
        nextHtmlNode.getParentNode().insertBefore(newPara, nextHtmlNode);
        newPara.setAttribute(Constants.STYLE, "");
        nextHtmlNode = newPara;
      }
      String styleAttrVal = nextHtmlNode.getAttribute(Constants.STYLE);
      if (styleAttrVal.trim().equals("") || styleAttrVal.endsWith(";"))
        styleAttrVal += "break-before: page;";
      else
        styleAttrVal += ";break-before: page;";

      nextHtmlNode.setAttribute(Constants.STYLE, styleAttrVal);
    }
  }

  public static Node getChild(Element parent, String nodeName)
  {
    if (nodeName.equals(parent.getNodeName()))
      return parent;
    else
    {
      NodeList children = parent.getChildNodes();
      Node ret = null;
      for (int i = 0; i < children.getLength(); i++)
      {
        Node child = children.item(i);
        if (child instanceof Element)
        {
          ret = getChild((Element) child, nodeName);
          if (ret != null)
            return ret;
        }
      }
      return ret;
    }
  }

  private static Node getPageBreakNode(ConversionContext context, Node node)
  {
    while (node != null && !isPageBreakTypeNode(context, node))
    {
      Node pagebreakNode = getPageBreakNodeFromChildren(context, node);
      if (pagebreakNode != null)
        return pagebreakNode;

      node = node.getNextSibling();
    }
    return node;
  }

  private static Node getPageBreakNodeFromChildren(ConversionContext context,Node parentNode)
  {
    NodeList nodelist = parentNode.getChildNodes();

    if (nodelist != null)
    {
      for (int i = 0; i < nodelist.getLength(); i++)
      {
        Node node = nodelist.item(i);
        if (isPageBreakTypeNode(context, node))
          return node;
        else
        {
          node = getPageBreakNodeFromChildren(context, node);
          if (node != null)
            return node;
        }
      }
    }
    return null;
  }
  
  private static boolean isPageBreakTypeNode(ConversionContext context, Node node)
  {
    if(pagebreakType.contains(node.getNodeName()))
      return true;
    
    String nodeName = node.getNodeName().toLowerCase();
    if(HtmlCSSConstants.LI.equals(nodeName))
    {
      Node firstChild = node.getFirstChild();
      if(firstChild != null)
      {
        String childNodeName = firstChild.getNodeName().toLowerCase();
        if(!(HtmlCSSConstants.UL.equals(childNodeName) || HtmlCSSConstants.OL.equals(childNodeName)))
          return true;
        else
          return false;
      }
      else
        return false;
    }
    
    if(HtmlCSSConstants.DIV.equals(node.getNodeName()))
    {
      Element div = (Element) node;
      if( "topDiv".equals( div.getAttribute("_type") ))
        return true;
    }
    
    return false;
  }
  
  public static OdfStyle generateDefaultStyle(ConversionContext context)
  {
    OdfStyle style = (OdfStyle) XMLConvertorUtil.getStyle(DEFAULT_GRAPHIC_STYLE, OdfStyleFamily.Graphic, (OdfDocument) context.getTarget());
    if( style == null)
      style = (OdfStyle) context.get(DEFAULT_GRAPHIC_STYLE);
    if( style == null)
    {
      OdfFileDom odfDoc = XMLConvertorUtil.getCurrentFileDom(context);
      style = new OdfStyle(odfDoc);
      style.setStyleParentStyleNameAttribute("Graphics");
      style.setStyleFamilyAttribute(OdfStyleFamily.Graphic.getName());
      
      style.setStyleNameAttribute(DEFAULT_GRAPHIC_STYLE);
      style.setProperty(OdfStyleGraphicProperties.Mirror, "none");
      style.setProperty(OdfStyleGraphicProperties.Clip, "rect(0in, 0in, 0in, 0in)");
      style.setProperty(OdfStyleGraphicProperties.Luminance, "0%");
      style.setProperty(OdfStyleGraphicProperties.Contrast, "0%");
      style.setProperty(OdfStyleGraphicProperties.Red, "0%");
      style.setProperty(OdfStyleGraphicProperties.Green, "0%");
      style.setProperty(OdfStyleGraphicProperties.Blue, "0%");
      style.setProperty(OdfStyleGraphicProperties.Gamma, "100%");
      style.setProperty(OdfStyleGraphicProperties.ColorInversion, "false");
      style.setProperty(OdfStyleGraphicProperties.ImageOpacity, "100%");
      style.setProperty(OdfStyleGraphicProperties.ColorMode, "standard");
      style.setProperty(OdfStyleGraphicProperties.VerticalPos, "from-top");
      style.setProperty(OdfStyleGraphicProperties.VerticalRel, "paragraph");

      style.setProperty(OdfStyleGraphicProperties.HorizontalPos, "from-left");
      style.setProperty(OdfStyleGraphicProperties.HorizontalRel, "paragraph");

      
      odfDoc.getAutomaticStyles().appendChild(style);
      context.put(DEFAULT_GRAPHIC_STYLE, style);
    }
    return style;
  }
}
