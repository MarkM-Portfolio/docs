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
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.converter.odt2html.convertor.css.CSSConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class DrawFrameConvertor extends HtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    String contentDom = (String) context.get("contentRootNode");
    // If the draw frame is in Draw:G, and it's child is Image, it will call ImageConvertor directly.
    boolean isGrouped = false;
    String childType = getChildType(element);
    Map<String, Object> groupRelatedParams = HtmlConvertorUtil.getGroupRelatedParameters(element);
    String anchorType = (String) groupRelatedParams.get("anchortype");
    if (context.get("CurrentListRoot") != null )
    {
      if(anchorType.equals("as-char")&&childType.equals(ODFConstants.DRAW_IMAGE))
      {
        
      }
      else
        return;
    }
    if (GroupShapeConvertor.isUnderGroup(context))
    {
      isGrouped = true;
      Node node = element.getFirstChild();
      while (node != null)
      {
        if (ODFConstants.DRAW_IMAGE.equals(node.getNodeName()))
        {
          Element locationDiv = HtmlConvertorUtil.getLocationDiv(context, element, parent, anchorType);
          HtmlConvertorUtil.appendLocationDiv2Parent(context, parent, locationDiv);
          HtmlConvertorUtil.convertChildren(context, element, locationDiv);
          return;
        }
        else if (ODFConstants.DRAW_TEXT_BOX.equals(node.getNodeName()))
        {
          break;
        }

        node.getNextSibling();
      }
    }

    if(anchorType.equals("as-char")&&childType.equals(ODFConstants.DRAW_TEXT_BOX)&&!isGrouped)
      return;
    element.removeAttribute("id");

    Node elementFirstChild = element.getFirstChild();
    Node elementParent = element.getParentNode();
    /*
     * //Image under list shouldn't be imported as <div><img/></div>, just imported as <img/>. So <draw:frame> will be not imported.
     * if(ODFConstants.DRAW_IMAGE.equals(elementFirstChild.getNodeName()) &&
     * ODFConstants.TEXT_LIST_ITEM.equals(elementParent.getParentNode().getNodeName())) { HtmlConvertorUtil.convertChildren(context,
     * element, parent); return; }
     */
    // ***************defect 7200. Don't import blank text box.*********************************
    if (ODFConstants.DRAW_TEXT_BOX.equals(elementFirstChild.getNodeName()))
    {
      Node elementSon = elementFirstChild.getFirstChild();
      if (elementSon == null || elementSon.getNextSibling() == null && ODFConstants.TEXT_P.equals(elementSon.getNodeName())
          && elementSon.getFirstChild() == null)
      {
        // defect 11591. blank text box don't convert, so it just like unsupported element, need to add id to span for export preserve.
        if (HtmlCSSConstants.SPAN.equals(parent.getNodeName()) && ODFConstants.TEXT_SPAN.equals(elementParent.getNodeName()))
        {
          String id = parent.getAttribute(HtmlCSSConstants.ID);
          if ((id == null || "".equals(id)))
            context.getOdfToHtmlIndexTable().addEntryByOdfNodeWithForceId((OdfElement) elementParent, parent, IndexUtil.RULE_NORMAL);
        }
        return;
      }
    }
    // ********************************************************************************************
    
    Element paragraph = (Element) context.get("CurrentParagraph");
    Element locationDiv = HtmlConvertorUtil.getLocationDiv(context, element, parent, anchorType);
    HtmlConvertorUtil.appendLocationDiv2Parent(context, parent, locationDiv);
    if (paragraph != null && HtmlCSSConstants.P.equals(paragraph.getNodeName()))
    {
      String nodeName = elementFirstChild.getNodeName();
      if (!("as-char".equals(anchorType) && ODFConstants.DRAW_IMAGE.equals(nodeName)))
      {
        // DomUtil.setElementName(paragraph, HtmlCSSConstants.DIV);
        if (ODFConstants.DRAW_IMAGE.equals(nodeName))
        {
          String className = paragraph.getAttribute(HtmlCSSConstants.CLASS);
          HtmlConvertorUtil.setAttribute(paragraph,HtmlCSSConstants.CLASS, "anchor " + className);
        }
        else
        {
          String className = paragraph.getAttribute(HtmlCSSConstants.CLASS);
          HtmlConvertorUtil.setAttribute(paragraph,HtmlCSSConstants.CLASS, "anchort " + className);
        }
      }
      NodeList nodeList = element.getParentNode().getChildNodes();
      boolean isStoreStyle = false;
      for (int i = 0; i < nodeList.getLength(); i++)
      {
        Node node = nodeList.item(i);
        if (!node.getNodeName().equals(ODFConstants.DRAW_FRAME))
        {
          isStoreStyle = true;
          break;
        }
        else if (!node.getFirstChild().getNodeName().equals(ODFConstants.DRAW_TEXT_BOX))
        {
          isStoreStyle = true;
          break;
        }
      }
      if (!isStoreStyle)
        paragraph.removeAttribute("style");
    }
    Element drawFrameDiv = creatDivElement(context, element);
    locationDiv.appendChild(drawFrameDiv);
    if (!anchorType.equals("as-char"))
    {
      Map<String, String> style = new HashMap<String, String>();
      context.put(drawFrameDiv.getAttribute("id"), style);
      convertAttributes(context, element, drawFrameDiv);
    }
    HtmlConvertorUtil.convertChildren(context, element, drawFrameDiv);
    setReadOnlyToDiv(drawFrameDiv,locationDiv);
    // Add position:absolute;
    if(drawFrameDiv.getChildNodes().getLength() == 0)
    {
      handleUnsupporttedElementInDrawFrame(context,element,parent,locationDiv,drawFrameDiv);
    }
    else
    {
      //the child node can only be image or textbox or placeholder on IBMDOCS Sep2012 version
      Element childNode = getChildNodeOfDrawFrame(drawFrameDiv,childType);
      if(childNode != null)
      {
        HtmlConvertorUtil.setPostionByAnchorType(context, locationDiv, childNode, element, anchorType);
        HtmlConvertorUtil.normalizeDiv(context, parent, locationDiv, isGrouped, anchorType, element); 
      } 
    }
    
  }
  private void setReadOnlyToDiv(Element drawFrameDiv,Element locationDiv)
  {
    if(locationDiv.getAttribute("unselectable") != null && !locationDiv.getAttribute("unselectable").equals(""))
    {
      NodeList divList = drawFrameDiv.getElementsByTagName(HtmlCSSConstants.DIV);
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
  }
  private Element getChildNodeOfDrawFrame(Element drawFrameDiv, String childType)
  {
    Element childNode = null;
    if(childType.equals(ODFConstants.DRAW_IMAGE))
    {
      childNode = (Element) ((Element) drawFrameDiv).getElementsByTagName(HtmlCSSConstants.IMG).item(0); 
    }
    else if(childType.equals(ODFConstants.DRAW_TEXT_BOX))
    {
      Node child = drawFrameDiv.getFirstChild();
      while(child != null)
      {
        if(child.getNodeName().equals(HtmlCSSConstants.DIV))
        {
          String type = ((Element)child).getAttribute("_type");
          if(type != null && type.indexOf("textbox") != -1)
          {
            childNode = (Element)child;
            break;
          }
          else
            child = child.getNextSibling();
        }
        else
          child = child.getNextSibling();
      }
    }
    else
    {
      Node child = drawFrameDiv.getFirstChild();
      while(child != null)
      {
        if(child instanceof Element)
        {
          childNode = (Element)child;
          break;
        }
        child = child.getNextSibling();
      }
    }
    return childNode;
  }
  private void handleUnsupporttedElementInDrawFrame(ConversionContext context,OdfElement odfElement,Element paragraphDiv,Element locationDiv,Element drawFrameDiv)
  {
    context.getOdfToHtmlIndexTable().removeEntry(drawFrameDiv.getAttribute("id") + "," + odfElement.getAttribute("id"));
    odfElement.removeAttribute(HtmlCSSConstants.ID);
    locationDiv.removeChild(drawFrameDiv);
    Element locationParent = (Element) locationDiv.getParentNode();
    HtmlConvertorUtil.removeLocationDivFromParent(paragraphDiv, locationDiv, locationParent);
  }
  private Element creatDivElement(ConversionContext context, OdfElement odfElement)
  {
    Element div = HtmlConvertorUtil.createHtmlElement(context, odfElement, HtmlCSSConstants.DIV);
    HtmlConvertorUtil.setAttribute(div,"_type", "drawframe",false);
    return div;
  }

  protected static void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {

    Element parent = (Element) htmlNode.getParentNode();
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");
    String styleName = element.getAttribute(ODFConstants.DRAW_STYLE_NAME);
    Map<String, String> styleMap = map.get(styleName);
    if (styleMap == null)
      styleMap = new HashMap<String, String>();
    String textAlign = styleMap.get(HtmlCSSConstants.TEXT_ALIGN);
    if (textAlign == null)
    {
      if (HtmlCSSConstants.P.equals(parent.getNodeName()))
      {
        // check if the parent paragraph contains text-align style
        OdfElement paragraph = (OdfElement) element.getParentNode();
        styleName = paragraph.getAttribute(ODFConstants.TEXT_STYLE_NAME);
        styleMap = map.get(styleName);
        textAlign = styleMap.get(HtmlCSSConstants.TEXT_ALIGN);
      }
    }

    Map<String, String> styleById = (Map<String, String>) context.get(htmlNode.getAttribute("id"));
    String anchorType = element.getAttribute(ODFConstants.TEXT_ANCHOR_TYPE);

    if (isTableContainer(element))
    {
      if ("as-char".equals(anchorType) && textAlign != null)
        styleMap.remove(HtmlCSSConstants.TEXT_ALIGN);
      Map<String, String> marginMap = new HashMap<String,String>();
      if(styleMap.containsKey(HtmlCSSConstants.MARGIN))
        marginMap.put(HtmlCSSConstants.MARGIN, styleMap.get(HtmlCSSConstants.MARGIN));
      if(styleMap.containsKey(HtmlCSSConstants.MARGIN_BOTTOM))
        marginMap.put(HtmlCSSConstants.MARGIN_BOTTOM, styleMap.get(HtmlCSSConstants.MARGIN_BOTTOM));
      if(styleMap.containsKey(HtmlCSSConstants.MARGIN_LEFT))
        marginMap.put(HtmlCSSConstants.MARGIN_LEFT, styleMap.get(HtmlCSSConstants.MARGIN_LEFT));
      if(styleMap.containsKey(HtmlCSSConstants.MARGIN_RIGHT))
        marginMap.put(HtmlCSSConstants.MARGIN_RIGHT, styleMap.get(HtmlCSSConstants.MARGIN_RIGHT));
      if(styleMap.containsKey(HtmlCSSConstants.MARGIN_TOP))
        marginMap.put(HtmlCSSConstants.MARGIN_TOP, styleMap.get(HtmlCSSConstants.MARGIN_TOP));
      if(!marginMap.isEmpty())
        styleById.putAll(marginMap);
    }
    else if (!"as-char".equals(anchorType))
    {
      if (textAlign == null)
      {
        textAlign = "left";
      }
      styleById.put(HtmlCSSConstants.TEXT_ALIGN, textAlign);

      if (textAlign.equals("center"))
      {
        styleById.put(HtmlCSSConstants.MARGIN, "auto");
      }
      else if (textAlign.equals("right"))
      {
        styleById.put(HtmlCSSConstants.MARGIN, "auto 0cm auto auto");
      }
    }

    if (context.get("contentRootNode").equals("style:header") || context.get("contentRootNode").equals("style:footer"))
    {
      if (element.getElementsByTagName(ODFConstants.TEXT_PAGE_NUMBER) != null)
      {
        styleById.put(HtmlCSSConstants.WIDTH, "1.5cm");
      }
    }
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.STYLE, ConvertUtil.convertMapToStyle(styleById));

  }

  private static boolean isTableContainer(Node node)
  {
    boolean isTableContainer = false;
    NodeList childNodes = node.getChildNodes();
    if (childNodes != null)
    {
      Node firstChildNode = childNodes.item(0);
      if (firstChildNode instanceof Element)
      {
        childNodes = firstChildNode.getChildNodes();
        if (childNodes != null)
        {
          firstChildNode = childNodes.item(0);

          if (firstChildNode instanceof Element)
          {
            if (firstChildNode.getNodeName().equals(ODFConstants.TABLE_TABLE))
              isTableContainer = true;
          }
        }
      }
    }
    return isTableContainer;
  }

  // parse style and attribute of draw:frame for image/textbox tag
  public static void parseStyle(ConversionContext context, OdfElement drawFrame, Element htmlNode, Element parentDiv, OdfElement element,
      boolean isGrouped)
  {
    Map<String, Map<String, String>> wholeMap = (Map<String, Map<String, String>>) context.get("InplaceStyle");
    String drawFrameStyleName = drawFrame.getAttribute(ODFConstants.DRAW_STYLE_NAME);
    Map<String, String> styleMap = new HashMap<String, String>();
    Map<String, String> dfStyleMap = wholeMap.get(drawFrameStyleName);
    if(dfStyleMap != null)
      styleMap.putAll(dfStyleMap);

    String imageAttribute[] = getImageAttribute(context, drawFrame);
    String xPos = imageAttribute[0];
    String yPos = imageAttribute[1];
    String width = imageAttribute[2];
    String height = imageAttribute[3];
    if (width.length() > 0)
      styleMap.put(HtmlCSSConstants.WIDTH, width);
    if (!"0cm".equals(height))
      styleMap.put(HtmlCSSConstants.HEIGHT, height);
    if (xPos.length() > 0)
      styleMap.put(HtmlCSSConstants.LEFT, xPos);
    if (!"0cm".equals(yPos))
      styleMap.put(HtmlCSSConstants.TOP, yPos);

    String anchorType = drawFrame.getAttribute(ODFConstants.TEXT_ANCHOR_TYPE);
    String zIndex = drawFrame.getAttribute(ODFConstants.DRAW_Z_INDEX);
    if (zIndex.length() > 0)
    {
      styleMap.put(HtmlCSSConstants.ZINDEX, zIndex);
    }
    // addPositionAbsolute(drawFrame, htmlNode, anchorType, styleMap);
    // Calculate height for parent - div
    OdfElement graphicElement = (OdfElement)HtmlConvertorUtil.getGroupRelatedParameters(drawFrame).get("drawg");
    OdfStyle graphicStyle = ShapeConvertor.getGraphicStyle(context, graphicElement);
    // updateStyleByGroupElement(element, isGrouped, htmlNode, anchorType, zIndex)
    HtmlConvertorUtil.setHeightAccordingWrapOption(context, yPos, height, parentDiv, graphicStyle, anchorType,isGrouped);

    handleMargin(context, anchorType, drawFrameStyleName, styleMap);

    HtmlConvertorUtil.updateHeightWidth(context, styleMap, drawFrameStyleName, htmlNode.getNodeName());
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.STYLE, ConvertUtil.convertMapToStyle(styleMap));

  }

  public static String[] getImageAttribute(ConversionContext context, OdfElement drawFrame)
  {
    String width = drawFrame.getAttribute(ODFConstants.SVG_WIDTH);
    if (width.length() > 0)
      width = UnitUtil.getCMLength(width) + "cm";

    String height = drawFrame.getAttribute(ODFConstants.SVG_HEIGHT);
    if (height.length() > 0)
      height = UnitUtil.getCMLength(height) + "cm";
    else
      height = "0cm";

    String anchorType = drawFrame.getAttribute(ODFConstants.TEXT_ANCHOR_TYPE);
    OdfStyle odfStyle = CSSConvertorUtil.getStyleElement(context, drawFrame.getAttribute(ODFConstants.DRAW_STYLE_NAME), OdfStyleFamily.Graphic);
    String horizontalRel = null;
    String verticalRel = null;
    if(odfStyle != null)
    {
      horizontalRel = odfStyle.getProperty(OdfStyleGraphicProperties.HorizontalRel);
      verticalRel = odfStyle.getProperty(OdfStyleGraphicProperties.VerticalRel);
    }
    
    String xPos = drawFrame.getAttribute(ODFConstants.SVG_X);
    if (xPos.length() > 0)
    {
        xPos = UnitUtil.getCMLength(xPos) + "cm";
           
      if("page".equals(horizontalRel) &&(anchorType.equals("char") || anchorType.equals("paragraph")))
      {
        String pagePaddingLeft = (String) context.get("PagePaddingLeft");
        if(pagePaddingLeft != null)
          xPos = UnitUtil.decreaseLength(xPos, pagePaddingLeft);
      }
    }

    String yPos = drawFrame.getAttribute(ODFConstants.SVG_Y);
    if (yPos.length() > 0)
    {
        yPos = UnitUtil.getCMLength(yPos) + "cm";

      if("page".equals(verticalRel) &&(anchorType.equals("char") || anchorType.equals("paragraph")))
      {
        String pagePaddingTop = (String) context.get("PagePaddingTOP");
        if(pagePaddingTop != null)
          yPos = UnitUtil.decreaseLength(yPos, pagePaddingTop);
      }
    }
    else
    {
      yPos = "0cm";
    }

    return new String[] { xPos, yPos, width, height };
  }

  private static void handleMargin(ConversionContext context, String anchorType, String drawFrameStyleName, Map<String, String> styleMap)
  {
    // When the image anchor type is as-char, always affect position.
    if ("as-char".equals(anchorType))
      return;

    if (!styleMap.containsKey(HtmlCSSConstants.MARGIN) && !styleMap.containsKey(HtmlCSSConstants.MARGIN_TOP)
        && !styleMap.containsKey(HtmlCSSConstants.MARGIN_LEFT))
      return;

    // Position info(VerticalPos/HorizontalPos) is in draw:frame style. But if there is draw:g, the info is on draw:g style.
    String styleName = drawFrameStyleName;
    OdfStyle odfStyle = CSSConvertorUtil.getStyleElement(context, styleName, OdfStyleFamily.Graphic);
    String verticalPos = odfStyle.getProperty(OdfStyleGraphicProperties.VerticalPos);
    String horizontalPos = odfStyle.getProperty(OdfStyleGraphicProperties.HorizontalPos);

    // When image anchor type is not as-char, if !"top".equals(verticalPos) margin-top won't affect position,
    // if !"left".equals(horizontalPos) margin-left won't affect position
    CSSConvertorUtil.reOrgMarginBorderPadding(styleMap, HtmlCSSConstants.MARGIN);
    if (!"top".equals(verticalPos))
      styleMap.remove(HtmlCSSConstants.MARGIN_TOP);
    if (!"left".equals(horizontalPos))
      styleMap.remove(HtmlCSSConstants.MARGIN_LEFT);
  }

  public static OdfElement getDrawFrame(OdfElement image)
  {
    OdfElement drawFrame = (OdfElement) image.getParentNode();

    while (drawFrame != null && !drawFrame.getNodeName().equals(ODFConstants.DRAW_FRAME))
    {
      drawFrame = (OdfElement) drawFrame.getParentNode();
    }

    return drawFrame;

  }

  private static String getChildType(OdfElement odfElement)
  {
    String childType = "";
    Node node = odfElement.getFirstChild();
    if (ODFConstants.DRAW_IMAGE.equals(node.getNodeName()))
    {
      childType = ODFConstants.DRAW_IMAGE;
    }
    else if (ODFConstants.DRAW_TEXT_BOX.equals(node.getNodeName()))
    {
      childType = ODFConstants.DRAW_TEXT_BOX;
    }
    return childType;
  }
}
