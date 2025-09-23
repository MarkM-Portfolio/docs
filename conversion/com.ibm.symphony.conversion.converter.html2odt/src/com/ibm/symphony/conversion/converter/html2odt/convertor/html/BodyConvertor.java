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

import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfDefaultStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextParagraph;
import org.odftoolkit.odfdom.dom.element.office.OfficeBodyElement;
import org.odftoolkit.odfdom.dom.element.office.OfficeTextElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class BodyConvertor extends GeneralXMLConvertor
{
  @Override
  protected void doConvertXML(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    OdfElement odfBody = convertElement(context, htmlElement, parent);
    OdfElement officeText = (OdfElement) OdfElement.findFirstChildNode(OfficeTextElement.class, odfBody);
    if (odfBody != null)
    {
      convertAttributes(context, htmlElement, odfBody);

      // remove extra empty paragraph for new document in Concord
      OdfElement firstPara = (OdfElement) OdfElement.findFirstChildNode(OdfTextParagraph.class, officeText);
      if (firstPara != null)
      {
        HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
        if (!indexTable.isOdfNodeIndexed(firstPara))
        {
          officeText.removeChild(firstPara);
        }
      }

      stripRedundantDiv(context, htmlElement);

      convertChildren(context, htmlElement, officeText);
    }
    else
    {
      convertChildren(context, htmlElement, officeText);
    }
  }

  public static void stripRedundantDiv(ConversionContext context, Element htmlElement)
  {
    String _type = (String) htmlElement.getAttribute("_type");
    if (_type != null && _type.indexOf(HtmlCSSConstants.TOPDIV)!= -1)
    {
      Node child = htmlElement.getFirstChild();
      while( child != null)
      {
        if( HtmlCSSConstants.DIV.equals(child.getNodeName()) )
        {
          Element element = (Element)child;
          if( HtmlCSSConstants.LOCATIONDIV.equals( element.getAttribute("_type" ) ) )
          {
            extractChildren( element );
            
            Node cur = child;
            child = child.getNextSibling();
            htmlElement.removeChild(cur);
            continue;
          }
        }
        child = child.getNextSibling();
      }
      
    }
  }
  
  private static void extractChildren(Element e)
  {
    Element parent = (Element) e.getParentNode();
    Node child = e.getFirstChild();
    while( child != null)
    {
      parent.insertBefore( child.cloneNode(true), e);
      child = child.getNextSibling();
    }
  }
  /*

  private static void stripRedundantDiv(ConversionContext context, Element htmlElement, HtmlToOdfIndex indexTable, Node child, Set<String> set)
  {
    if (((Element) child).getAttribute("_type").equals("secondDiv"))
    {
      List<OdfElement> odfElements = indexTable.getOdfNodes((Element) child);
      if (odfElements != null)
      {
        for(int i=0; i<odfElements.size(); i++)
        {
          OdfElement odfChild = odfElements.get(i);
          if(odfChild != null)
            set.add(odfChild.getAttribute(IndexUtil.ID_STRING)); 
        } 
      }
      Element secondDiv = (Element) child;
      NodeList secondNodeList = secondDiv.getChildNodes();
      while (secondDiv.hasChildNodes())
      {
        Node node = secondNodeList.item(0);
        if (secondNodeList.item(0) instanceof Element)
        {
          List<OdfElement> odfChilds = indexTable.getOdfNodes((Element) node);
          child = secondDiv.removeChild(node);
          if (odfChilds != null)
          {
            handleDrawFrame(context, htmlElement, child, secondDiv);
          }
          else
          {
            handleShape(context,htmlElement, child, secondDiv);
          }
        }
        else
          htmlElement.insertBefore(secondDiv.removeChild(node), secondDiv);
      }
      htmlElement.removeChild(secondDiv);
    }
  }

  private static void handleShape(ConversionContext context,Element htmlElement, Node child, Element secondDiv)
  {
    String _type;
    Element shapeNode = (Element) ((Element) child).getElementsByTagName("img").item(0);
    _type = shapeNode.getAttribute("_type");
    saveImageSrc(context, child, true);
    if (_type != null && _type.indexOf("symphonygroup") != -1)
    {
      HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
      OdfElement odfShape = indexTable.getFirstOdfNode(shapeNode);
      if(odfShape != null)
      {
        ShapeConvertor.addPicNameToMap(context, odfShape);
      }
      shapeNode = (Element) shapeNode.getParentNode();
      shapeNode.setAttribute("_type", "symphonygroup");
    }
    htmlElement.insertBefore(shapeNode, secondDiv);
  }

  private static void handleDrawFrame(ConversionContext context, Element htmlElement, Node child, Element secondDiv)
  {
    String _type;
    _type = ((Element) child).getAttribute("_type");
    if (_type != null && _type.indexOf("symphonygroup") != -1)
    {
      saveImageSrc(context, child, false);
      Document doc = (Document) context.getSource();
      Element div = doc.createElement(HtmlCSSConstants.DIV);
      div.setAttribute("_type", "symphonygroup");
      div.appendChild(child);
      htmlElement.insertBefore(div, secondDiv);
    }
    else
      htmlElement.insertBefore(child, secondDiv);
  }
  */
  
  private static void saveImageSrc(ConversionContext context, Node child, boolean isShapeImage)
  {
    HashSet<String> shapeImageSrcSet = (HashSet<String>) context.get(Constants.SHAPE_IMAGESRC_SET);
    NodeList imageNodes = ((Element)child).getElementsByTagName("img");
    for(int i=0; i<imageNodes.getLength(); i++)
    {
      Element imageNode = (Element)imageNodes.item(i);
      if(imageNode != null)
      {
        String src = imageNode.getAttribute(HtmlCSSConstants.SRC);
        if(isShapeImage)
          shapeImageSrcSet.add(src.substring(9));
        else
          ImageConvertor.saveImageSrcName(context, src);
      } 
    }
  }
  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement == null) // newly created from concord, add body id.
    {
      try
      {
        OdfDocument odfDoc = (OdfDocument) context.getTarget();
        odfElement = (OdfElement) OdfElement.findFirstChildNode(OfficeBodyElement.class, odfDoc.getContentDom().getRootElement());
        indexTable.addEntryByHtmlNode(htmlElement, odfElement);
      }
      catch (Exception e)
      {
        e.printStackTrace();
      }
    }
    return odfElement;
  }

  /*
   * As htmlElement's body style was converted from styles.xml. We need to store it back to styles.xml
   */
  protected void convertAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    OdfDocument odfDoc = (OdfDocument) context.getTarget();
    try
    {
      // put into context with body class name by "concord_Doc_Style"
      String bodyClassName = htmlElement.getAttribute(Constants.CLASS);
      if (bodyClassName != null)
      {
        int startIndex = bodyClassName.indexOf(Constants.BODY_TEMPLATE_STYLE_PREFIX);
        if (startIndex != -1)
        {
          int endIndex = bodyClassName.indexOf(" ", startIndex);
          endIndex = (endIndex == -1) ? bodyClassName.length() : endIndex;
          bodyClassName = "body." + bodyClassName.substring(startIndex, endIndex);
          context.put(Constants.BODY_CLASS_NAME, bodyClassName);
        }
      }

      String style = htmlElement.getAttribute("style");
      if (style != null && style.length() != 0)
      {
        Map<String, String> bodyStyleMap = ConvertUtil.buildCSSMap(style);
        String pageWidth = bodyStyleMap.get(HtmlCSSConstants.WIDTH);
        if (pageWidth != null && pageWidth.endsWith("!important"))
          pageWidth = pageWidth.substring(0, pageWidth.indexOf("!important")).trim();

        if (pageWidth != null)
          context.put(Constants.CONCORD_PAGE_WIDTH, pageWidth);

        String backgroundImage = bodyStyleMap.get(HtmlCSSConstants.BACKGROUND_IMAGE);
        if (backgroundImage != null && backgroundImage.startsWith("url(\"Pictures/"))
        {
          HashSet<String> imageSrcSet = (HashSet<String>) context.get(Constants.IMAGESRC_SET);
          imageSrcSet.add(backgroundImage.substring(14, backgroundImage.length() - 2));
        }

        OdfOfficeAutomaticStyles automaticStyles = odfDoc.getStylesDom().getAutomaticStyles();
        NodeList pageLayoutProperties = automaticStyles.getElementsByTagName(ODFConstants.STYLE_PAGE_LAYOUT_PROPERTIES);
        int length = pageLayoutProperties.getLength();
        for (int i = 0; i < length; i++)
        {
          Node pagelayoutNode = pageLayoutProperties.item(i);
          preserveStyle(style, pagelayoutNode);
        }
      }

      String tabstopDistance = htmlElement.getAttribute(HtmlCSSConstants.TAB_STOP_DISTANCE);
      OdfOfficeStyles officeStyles = odfDoc.getStylesDom().getOfficeStyles();
      OdfDefaultStyle paragraphStyle = officeStyles.getDefaultStyle(OdfStyleFamily.Paragraph);
      OdfElement paragraphElement = (OdfElement) paragraphStyle.getOrCreatePropertiesElement(OdfStylePropertiesSet.ParagraphProperties);
      if (tabstopDistance == null || tabstopDistance.length() == 0)
        tabstopDistance = "1.27cm";
      paragraphElement.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.STYLE_TAB_STOP_DISTANCE), tabstopDistance);
      
      // Set TabRelateToIndent value in context
      ConvertUtil.getTabRelateToIndent(context, odfDoc);
    }
    catch (Exception e)
    {
      XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_STYLE, e);
    }
  }

  /*
   * Just preserve background-color and background-image to odt document
   */
  protected void preserveStyle(String styles, Node node)
  {
    HashMap<String, String> currentStyles = new HashMap<String, String>();
    String[] attrs = styles.split(";");
    for (int i = 0; i < attrs.length; i++)
    {
      if (attrs[i].indexOf("background") != -1)
      {
        String[] pair = attrs[i].split(":");
        if (pair.length == 2)
        {
          currentStyles.put(pair[0], pair[1]);
        }
      }
    }
    HashMap<String, String> css2odf = new HashMap<String, String>();
    css2odf.put("background-color", "fo:background-color");
    css2odf.put("background-image", "xlink:href");
    css2odf.put("background-repeat", "style:repeat");
    css2odf.put("background-position", "style:position");

    NodeList children = node.getChildNodes();
    Node backgroundImageNode = null;
    for (int i = 0; i < children.getLength(); i++)
    {
      if (children.item(i).getNodeName().equals("style:background-image"))
      {
        backgroundImageNode = children.item(i);
        break;
      }
    }
    if (backgroundImageNode == null)
    {
      Node newNode = node.getOwnerDocument().createElement("style:background-image");
      backgroundImageNode = node.appendChild(newNode);
    }

    Iterator<Entry<String, String>> stylesIt = currentStyles.entrySet().iterator();
    while (stylesIt.hasNext())
    {
      Entry<String, String> entry = stylesIt.next();
      String odfTag = css2odf.get(entry.getKey());
      String odfTagValue = entry.getValue();
      if (odfTag.equals("fo:background-color"))
        updateValue(odfTag, odfTagValue, node);
      else if (odfTag.equals("xlink:href"))
      {
        int start = odfTagValue.indexOf("Pictures");
        if(start > -1)
          odfTagValue = odfTagValue.substring(start, odfTagValue.length() - 2);
        updateValue(odfTag, odfTagValue, backgroundImageNode);
      }
      else
        updateValue(odfTag, odfTagValue, backgroundImageNode);
    }
  }

  protected void updateValue(String tagName, String tagValue, Node parent)
  {
    NamedNodeMap childAttrs = parent.getAttributes();
    Node child = childAttrs.getNamedItem(tagName);
    if (child == null)
    {
      child = parent.getOwnerDocument().createAttribute(tagName);
      childAttrs.setNamedItem(child);
    }
    child.setNodeValue(tagValue.trim());
  }
}
