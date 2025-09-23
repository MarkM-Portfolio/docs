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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;

public class TOCConvertor extends HtmlConvertor
{
  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Document doc = (Document) context.getTarget();
    String bodyId = (String) context.get("BodyId");

    Element div = context.getOdfToHtmlIndexTable().createHtmlElement(element, doc, HtmlCSSConstants.DIV, IndexUtil.RULE_NOUPDATE, bodyId);

    HtmlConvertorUtil.setAttribute(div,HtmlCSSConstants.CONTENT_EDITABLE, "false",false);
    HtmlConvertorUtil.setAttribute(div,HtmlCSSConstants.CLASS, "TOC_Imported TOC placeholder_container",false);
    HtmlConvertorUtil.setAttribute(div,"unselectable", "on",false);
    HtmlConvertorUtil.setAttribute(div,HtmlCSSConstants.NAME, element.getAttribute(ODFConstants.TEXT_NAME)+"|region");
    
    Node elementChild = element.getFirstChild();
    if(ODFConstants.TEXT_TABLE_OF_CONTENT_SOURCE.equals(elementChild.getNodeName()))
    {
      String outlineLevel = ((Element) elementChild).getAttribute(ODFConstants.TEXT_OUTLINE_LEVEL);
      if(outlineLevel != null && !outlineLevel.equals(""))
        HtmlConvertorUtil.setAttribute(div,"_maxLevel", outlineLevel);
    }
    
    String styleName = element.getAttribute(ODFConstants.TEXT_STYLE_NAME);
    if(styleName != null)
    {
    	Map<String, Map<String, String>> stylesMap = (Map<String, Map<String, String>>) context.get("InplaceStyle");
        Map<String,String> styleMap = stylesMap.get(styleName);
        if(styleMap != null)
        {
        	String backgroundColor = styleMap.get(HtmlCSSConstants.BACKGROUND_COLOR);
            if(backgroundColor != null)
            	HtmlConvertorUtil.setAttribute(div,"style", HtmlCSSConstants.BACKGROUND_COLOR+":"+backgroundColor+";");
        }
    }
    
    parent.appendChild(div);

    HtmlConvertorUtil.convertChildren(context, element, div);
    
    Node child = div.getFirstChild();
    while(child != null)
    {
      if(HtmlCSSConstants.P.equals(child.getNodeName()))
      {
        Element childElement = (Element) child;
        String className = childElement.getAttribute(HtmlCSSConstants.CLASS);
        if(!className.contains("tocTitle"))
        {
          String style = childElement.getAttribute(HtmlCSSConstants.STYLE);
          Pattern p = Pattern.compile("text-align.\\w+;");  
          Matcher m = p.matcher(style);  
          if(m.find()) 
          {  
              style = m.replaceAll("");  
              HtmlConvertorUtil.setAttribute(childElement,HtmlCSSConstants.STYLE, style);
          }
        }
      }
      child = child.getNextSibling();
    }
    
  }
}
