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
import java.util.Map;
import java.util.Stack;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;

public class HeadingConvertor extends GeneralXMLConvertor
{

  protected void convertAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    String styleName = htmlElement.getAttribute(Constants.CLASS);
    if (styleName != null && styleName.length() > 0)
    {
      String classValue = styleName.split(" ")[0];
      if(!"cssHeading".equals(classValue))
    	htmlElement.setAttribute(Constants.CLASS, classValue);
      else
    	htmlElement.removeAttribute(Constants.CLASS);
    }
    
    String oldStyleName = odfElement.getAttribute(ODFConstants.TEXT_STYLE_NAME);
    String oldParentStyleName = "";
    OdfStyleBase oldStyle = XMLConvertorUtil.getStyle(oldStyleName, OdfStyleFamily.Paragraph, (OdfDocument) context.getTarget());
    if(oldStyle != null)
      oldParentStyleName = oldStyle.getOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.STYLE_PARENT_STYLE_NAME));

    String nodeName = htmlElement.getNodeName();
    int level = Integer.parseInt(nodeName.substring(1));
    OdfName attrName = ConvertUtil.getOdfName(ODFConstants.TEXT_OUTLINE_LEVEL);
    String attrValue = odfElement.getOdfAttributeValue(attrName);
    if (null != attrValue && (!"".equals(attrValue)))
    {
      int oldLevel = Integer.parseInt(attrValue);
      if (oldLevel > 6 && level == 6)
      {
        level = oldLevel;
      }
    }
    odfElement.setOdfAttributeValue(attrName, String.valueOf(level));
    
    //update css class style to style string
    updateStyle(context, htmlElement, styleName);
    
    super.convertAttributes(context, htmlElement, odfElement);
    
    String newStyleName = odfElement.getAttribute(ODFConstants.TEXT_STYLE_NAME);   
    if (newStyleName.length() == 0 || newStyleName.equals("Default_20_Text"))
    {
      OdfStylableElement stylable = (OdfStylableElement) odfElement;
      stylable.setStyleName("Heading_20_" + level);
      
      OdfStyleBase style = XMLConvertorUtil.getStyle("Heading_20_" + level, OdfStyleFamily.Paragraph, (OdfDocument) context.getTarget());
      if (style == null)
        XMLConvertorUtil.generateDefaultHeadingStyle(context, level);
    }
    else
    {
      OdfStyleBase style = XMLConvertorUtil.getStyle(newStyleName, OdfStyleFamily.Paragraph, (OdfDocument) context.getTarget());
      String newParentStyleName = style.getOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.STYLE_PARENT_STYLE_NAME));
      if(newParentStyleName.length() == 0 || newParentStyleName.equals("Default_20_Text") || newParentStyleName.equals("Heading") )
      {
        newParentStyleName = "Heading_20_" + level;
        style.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.STYLE_PARENT_STYLE_NAME), newParentStyleName);
      }
      
      OdfStyleBase parentStyle = XMLConvertorUtil.getStyle(newParentStyleName, OdfStyleFamily.Paragraph, (OdfDocument) context.getTarget());     
      if (parentStyle == null)
        XMLConvertorUtil.generateDefaultHeadingStyle(context, level);      
      
      if(htmlElement.getNodeName().equals("h6") && ("List_20_Heading".equals(oldStyleName) || "List_20_Contents".equals(oldStyleName)))
        style.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.STYLE_PARENT_STYLE_NAME), oldStyleName);
      else if(htmlElement.getNodeName().equals("h6") && ("List_20_Heading".equals(oldParentStyleName) || "List_20_Contents".equals(oldParentStyleName)))
        style.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.STYLE_PARENT_STYLE_NAME), oldParentStyleName);
      
      XMLConvertorUtil.removeInheritStyle(style, null, style.getParentStyle());

    }  

  }
  
  protected OdfElement convertElement(ConversionContext context, Element htmlElement, OdfElement parent)
  {
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    OdfElement odfElement = indexTable.getFirstOdfNode(htmlElement);
    if (odfElement != null)
    {
      String parentNodeName = parent.getNodeName();
      if(!(ODFConstants.TEXT_H.equals(parentNodeName) || ODFConstants.TEXT_P.equals(parentNodeName)))
        parent.appendChild(odfElement);
      return odfElement;
    }

    return XMLConvertorUtil.convertElement(context, htmlElement, parent);
  }
  
  private void updateStyle(ConversionContext context, Element element, String styleName)
  {
	  String styleString = element.getAttribute("style");
	  Map<String, String> styleMap = ConvertUtil.buildCSSMap(styleString);

	  String align = styleMap.get(HtmlCSSConstants.TEXT_ALIGN);
	  String direction = styleMap.get(HtmlCSSConstants.DIRECTION);
	  boolean isRtlDir = HtmlCSSConstants.RTL.equalsIgnoreCase(direction);
	  if(align == null && direction != null) {
		  styleMap.put(HtmlCSSConstants.TEXT_ALIGN, isRtlDir ? HtmlCSSConstants.RIGHT : HtmlCSSConstants.LEFT);
	  }	  
	  if(isRtlDir) {
          //switch back from HTML right-margin style to ODF fo:left-margin style if margin-right isn't 0
          String marginRight = styleMap.remove(HtmlCSSConstants.MARGIN_RIGHT);
          if(marginRight != null && !marginRight.matches("[\\.0a-z]*")) {
        	  styleString =  styleString.replace(HtmlCSSConstants.MARGIN_RIGHT, HtmlCSSConstants.MARGIN_LEFT);
        	  element.setAttribute(HtmlCSSConstants.STYLE, styleString);
          }
	  }
	  StringBuffer style = new StringBuffer("");
	  Map<String, String> cssMap = new HashMap<String,String>();
	  if(styleName != null && styleName.contains("cssHeading"))
	  {
	    Map<String, Map<String,String>> wholeMap = (Map<String, Map<String, String>>) context.get(Constants.TEMPLATE_STYLE_HEADING_SOURCE);
	    Map<String, String> tempMap = wholeMap.get("body.concord_doc_style_1 "+ element.getNodeName().toLowerCase() + ".cssheading");
	    if(tempMap != null)
	      cssMap.putAll(tempMap);
	  }
	  //get doc template css if have, and add into cssMap, now only consider the class value is a single string
      String templateKey = CSSUtil.getTemplateClassName(context,element);
      if(templateKey != null)
      {
        Map<String,Map<String,String>> templatesCSS = (Map<String, Map<String, String>>) context.get(Constants.STYLE_DOC_TEMPLATES_SOURCE);
        Stack<String> templateKeyStack = CSSUtil.generateTemplateKeyStack(templateKey);
        while(!templateKeyStack.empty())
        {
          String tempKey = templateKeyStack.pop();
          Map<String, String> tempMap = templatesCSS.get(tempKey.toLowerCase());
          if(tempMap != null)
          {
            cssMap.putAll(tempMap);
          }
        }
      }
      
      //merge the css from cssMap to style string
      if(!cssMap.isEmpty())
      {
    	  if(!"".equals(styleString))
    	  {
    		  //moved at the beginning of method Map<String, String> styleMap = ConvertUtil.buildCSSMap(styleString);
    		  updateStyleMap(styleMap);
              cssMap.putAll(styleMap);
    	  }
    	  
    	  if( element.getParentNode().getNodeName().equalsIgnoreCase("li") )
    	  {
    	    // remove margin left and text-indent for heading  in list
    	    cssMap.remove(HtmlCSSConstants.MARGIN_LEFT);
    	    cssMap.remove(HtmlCSSConstants.MARGIN_RIGHT);
            cssMap.remove(HtmlCSSConstants.TEXT_INDENT);
    	  }
    	  
          for(String key: cssMap.keySet())
          {
            style.append(key+":"+cssMap.get(key)+";");
          }
    	  
    	  element.setAttribute("style", style.toString());
      }
  }
  
//  Margin in html has two kind of tag. Change margin to margin-top/margin-left/margin-bottom/margin-right.  
  public void updateStyleMap(Map<String, String> styleMap)
  {
	  String margin = styleMap.get(HtmlCSSConstants.MARGIN);
	  if(margin != null && !"".equals(margin))
	  {
		  String[] marginValue = margin.split(" ");
		  int num = marginValue.length;
		  switch(num)
		  {
			  case 1:
				  styleMap.put(HtmlCSSConstants.MARGIN_TOP, marginValue[0]);
				  styleMap.put(HtmlCSSConstants.MARGIN_RIGHT, marginValue[0]);
				  styleMap.put(HtmlCSSConstants.MARGIN_BOTTOM, marginValue[0]);
				  styleMap.put(HtmlCSSConstants.MARGIN_LEFT, marginValue[0]);
				  break;
			  case 2:
				  styleMap.put(HtmlCSSConstants.MARGIN_TOP, marginValue[0]);
				  styleMap.put(HtmlCSSConstants.MARGIN_RIGHT, marginValue[1]);
				  styleMap.put(HtmlCSSConstants.MARGIN_BOTTOM, marginValue[0]);
				  styleMap.put(HtmlCSSConstants.MARGIN_LEFT, marginValue[1]);
				  break;
			  case 3:
				  styleMap.put(HtmlCSSConstants.MARGIN_TOP, marginValue[0]);
				  styleMap.put(HtmlCSSConstants.MARGIN_RIGHT, marginValue[1]);
				  styleMap.put(HtmlCSSConstants.MARGIN_BOTTOM, marginValue[2]);
				  styleMap.put(HtmlCSSConstants.MARGIN_LEFT, marginValue[1]);
				  break;
			  case 4:
				  styleMap.put(HtmlCSSConstants.MARGIN_TOP, marginValue[0]);
				  styleMap.put(HtmlCSSConstants.MARGIN_RIGHT, marginValue[1]);
				  styleMap.put(HtmlCSSConstants.MARGIN_BOTTOM, marginValue[2]);
				  styleMap.put(HtmlCSSConstants.MARGIN_LEFT, marginValue[3]);
		  }
		  styleMap.remove(HtmlCSSConstants.MARGIN);
	  }
  }
}
