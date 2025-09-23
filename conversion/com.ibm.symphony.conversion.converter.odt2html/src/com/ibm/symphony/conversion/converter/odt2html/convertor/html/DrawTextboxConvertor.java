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

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.OdfToHtmlIndex;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class DrawTextboxConvertor extends GeneralHtmlConvertor
{
  Logger log = Logger.getLogger(DrawTextboxConvertor.class.getName());
  
  public static JSONObject paragraphPropMap = null;
  
  static
  {
    InputStream input = null;
    try
    {
      input = DrawTextboxConvertor.class.getResourceAsStream("ParagraphProp.json");
      paragraphPropMap = JSONObject.parse(input);
    }
    catch (FileNotFoundException fnfException)
    {
      fnfException.printStackTrace();
    }
    catch (IOException ioException)
    {
      ioException.printStackTrace();
    }
    finally
    {
      if(input != null)
      {
        try
        {
          input.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
  }
  
  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    super.doConvertHtml(context, element, parent);

    Element textboxDiv = (Element) parent.getLastChild();
    String textboxStyle = textboxDiv.getAttribute(HtmlCSSConstants.STYLE);
    Map<String, String> textboxStyleMap =  ConvertUtil.buildCSSMap(textboxStyle);
    HashMap<String, String> wholeMap = new HashMap<String, String>();
    wholeMap.putAll(paragraphPropMap);
    wholeMap.putAll(textboxStyleMap);
    OdfElement drawFrame = DrawFrameConvertor.getDrawFrame(element);
    Map<String,Object> groupRelatedParams = HtmlConvertorUtil.getGroupRelatedParameters(drawFrame);
    String anchorType = (String)groupRelatedParams.get("anchortype");
    String zIndex = (String)groupRelatedParams.get("zindex");
    HtmlConvertorUtil.setAttribute(textboxDiv,HtmlCSSConstants.STYLE, ConvertUtil.convertMapToStyle(wholeMap) + "z-index:"+zIndex+";");
    
    if("char".equals(anchorType))
    {
      String svgY = ((OdfElement) element.getParentNode()).getAttribute(ODFConstants.SVG_Y);
      if(!svgY.startsWith("-"))
      {
        String id = null;
        Element textbox = null;
        if("as-char".equals(anchorType))
        {
          id = parent.getAttribute(HtmlCSSConstants.ID);
          textbox = textboxDiv;
        }
        else
        {
          id = ((Element) parent.getParentNode()).getAttribute(HtmlCSSConstants.ID);
          textbox = parent;
        }
        
        ArrayList<Node> list = (ArrayList<Node>) context.get("hasCharTextBox"+id);
        if(list == null)
          list = new ArrayList<Node>();
        
        list.add(textbox);
        context.put("hasCharTextBox"+id, list);
      }
    }
    handleTranslate(element, textboxDiv);
  }

  private void handlePosition(OdfElement element, Element parent, Element textboxDiv)
  {
    String _type = ((Element)parent.getParentNode()).getAttribute("_type");
    String style = ((Element)parent.getParentNode()).getAttribute("style");
    if(_type != null && !_type.equals(""))
    {
      String parentStyle = parent.getAttribute("style");
      parentStyle = parentStyle.replaceAll("position:relative;", "");
      HtmlConvertorUtil.setAttribute(parent,"style", parentStyle);
      if(textboxDiv.getAttribute("style").indexOf("position:absolute;") == -1 &&
          style.indexOf("position:relative;") != -1)
        HtmlConvertorUtil.setAttribute(textboxDiv,"style", textboxDiv.getAttribute("style")+"position:absolute;");
      handleTranslate(element, textboxDiv);
    }
  }

  private void handleTranslate(OdfElement element, Element textboxDiv)
  {
    String transform = ((OdfElement) element.getParentNode()).getAttribute(ODFConstants.DRAW_TRANSFORM);
    if (null != transform && !transform.equals(""))
    {
      if (transform.split("translate").length == 2)
      {
        String translate = transform.split("translate")[1];
        int start = translate.indexOf("(");
        int end = translate.indexOf(")");
        translate = translate.substring(start + 1, end);
        String x = translate.split(" ")[0];
        if (UnitUtil.getUnit(x).toLowerCase().equals(Unit.INCH.abbr()))
          x = UnitUtil.convertINToCM(x);
        String y = translate.split(" ")[1];
        if (UnitUtil.getUnit(y).toLowerCase().equals(Unit.INCH.abbr()))
          y = UnitUtil.convertINToCM(y);
        HtmlConvertorUtil.setAttribute(textboxDiv,"style", textboxDiv.getAttribute("style")+"left:"+x+";top:"+y+";");
      }
    }
  }
  
  protected void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {
    boolean isGrouped = false;
    isGrouped = ImageConvertor.isGrouped((OdfElement)element.getParentNode(), isGrouped, htmlNode);
    if(isGrouped)
      ImageConvertor.setGroupAttribute((OdfElement)element.getParentNode(), htmlNode);
    OdfElement drawFrame = DrawFrameConvertor.getDrawFrame(element);
    DrawFrameConvertor.parseStyle(context, drawFrame, htmlNode, (Element)htmlNode.getParentNode(),element,isGrouped);
    
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CLASS, drawFrame.getAttribute(ODFConstants.DRAW_STYLE_NAME)+" textbox");
    HtmlConvertorUtil.setAttribute(htmlNode,"_type", "textbox",false);
    HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.NAME, drawFrame.getAttribute(ODFConstants.DRAW_NAME) + "|frame");
    
    String minHeight = element.getAttribute(ODFConstants.FO_MIN_HEIGHT);
    if("".equals(minHeight))
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.STYLE, htmlNode.getAttribute(HtmlCSSConstants.STYLE)+"overflow:hidden;");
  }

  protected Element convertElement(ConversionContext context, OdfElement element, Element parent)
  {
    Element newNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.DIV);
    parent.appendChild(newNode);
    OdfElement drawFrame = DrawFrameConvertor.getDrawFrame(element);
    OdfToHtmlIndex indexTable = context.getOdfToHtmlIndexTable();
    if (!indexTable.isOdfNodeIndexed(drawFrame))
      HtmlConvertorUtil.addEntryByOdfNode(context, drawFrame, newNode);

    return newNode;
  }

  


}
