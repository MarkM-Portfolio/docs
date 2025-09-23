/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.css;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class ParagraphPropertiesConvertor extends CSSConvertor
{
  private static HashMap<String, String> tabstopPropertyMap = new HashMap<String, String>();
  static
  {
	  tabstopPropertyMap.put(ODFConstants.STYLE_CHAR, "c");
	  tabstopPropertyMap.put(ODFConstants.STYLE_LEADER_COLOR, "lc");
	  tabstopPropertyMap.put(ODFConstants.STYLE_LEADER_STYLE, "ls");
	  tabstopPropertyMap.put(ODFConstants.STYLE_LEADER_TEXT, "ltx");
	  tabstopPropertyMap.put(ODFConstants.STYLE_LEADER_TEXT_STYLE, "lts");
	  tabstopPropertyMap.put(ODFConstants.STYLE_LEADER_TYPE, "lt");
	  tabstopPropertyMap.put(ODFConstants.STYLE_LEADER_WIDTH, "lw");
	  tabstopPropertyMap.put(ODFConstants.STYLE_POSITION, "p");
	  tabstopPropertyMap.put(ODFConstants.STYLE_TYPE, "t");
  }
  
  @Override
  protected void doConvertCSS(ConversionContext context, OdfElement element, Map<String, Map<String, String>> map)
  {
    CSSConvertorUtil.parseStyle(context, element, map);
    String styleName = CSSConvertorUtil.getStyleName(element);
    convertTabStopStyle(context, element, styleName, map);
    processBreakBefore(context, styleName, element);
    adjustRtlParagraphMargins(context, element, styleName, map);
    Map<String,String> styleMap = map.get(styleName);
    String lineHeight = element.getAttribute(ODFConstants.FO_LINE_HEIGHT);
    //style attribute line-height like this "150%" convert to "1.5"
    if(lineHeight.endsWith("%"))
    {
      String valuePercentage = lineHeight.substring(0, lineHeight.length()-1);
      double value = Double.parseDouble(valuePercentage)/100;
      styleMap.put(HtmlCSSConstants.LINE_HEIGHT, String.valueOf(value));
    }
    
    styleMap.remove(HtmlCSSConstants.MARGIN);//fo:margin dosen't effect in Symphony. Just fo:margin-left... has effect.
  }

  public static void processBreakBefore(ConversionContext context, String styleName, OdfElement element)
  {
    Map<String,String> pageBreakMap = CSSConvertorUtil.getPageBreakMap(context);

    if ("page".equals(element.getAttribute(ODFConstants.FO_BREAK_BEFORE)) )
    {
      pageBreakMap.put(styleName,ODFConstants.FO_BREAK_BEFORE);
    }
    else
    {
      OdfElement styleElement = (OdfElement) element.getParentNode();
      if( styleElement != null && styleElement.getAttribute(ODFConstants.STYLE_MASTER_PAGE_NAME).length() > 0 )
      {
        pageBreakMap.put(styleName,ODFConstants.STYLE_PAGE_NUMBER);
      }
    }
  }
  
  private void convertTabStopStyle(ConversionContext context, OdfElement element, String styleName, Map<String, Map<String, String>> map)
  {
    String marginLeft = null;
    Boolean trti = (Boolean) context.get("TabsRelativeToIndent");
    if(trti != null && trti)
    {
      Map<String,String> styleMap = map.get(styleName);
      marginLeft = styleMap.get(HtmlCSSConstants.MARGIN_LEFT);
    }
    
	NodeList children = element.getChildNodes();
	for (int i = 0; i < children.getLength(); i++)
	{
	  Node child = children.item(i);
	  if (child instanceof OdfElement && child.getNodeName().equals(ODFConstants.STYLE_TAB_STOPS))
	  {
		  NodeList tabstoplist = child.getChildNodes();
		  HashMap<String, String> tabstopMap = new HashMap<String, String>();
		  StringBuffer tabstopStyle = new StringBuffer();
		  for(int k=0; k<tabstoplist.getLength(); k++)
		  {
			  Node tabstop = tabstoplist.item(k);
			  NamedNodeMap attributes = tabstop.getAttributes();
	    	  for (int j = 0; j < attributes.getLength(); j++)
	    	  {
	    	    Node attr = attributes.item(j);
	    	    if(attr.getNodeName().equals(ODFConstants.STYLE_POSITION))
	    	    {
	    	      if(marginLeft != null && !"".equals(marginLeft))
	    	        tabstopStyle.append(tabstopPropertyMap.get(attr.getNodeName())+":"+UnitUtil.addLength(attr.getNodeValue(), marginLeft)+",");
	    	      else
	    	        tabstopStyle.append(tabstopPropertyMap.get(attr.getNodeName())+":"+UnitUtil.getCMLength(attr.getNodeValue())+"cm,");
	    	    }
	    	    else
	    	      tabstopStyle.append(tabstopPropertyMap.get(attr.getNodeName())+":"+attr.getNodeValue()+",");
	    	  }
	    	  tabstopStyle.deleteCharAt(tabstopStyle.length()-1).append(';');
		  }
		  
		  tabstopMap.put(styleName+"_TabStop", tabstopStyle.toString());
	      map.put(styleName+"_TabStop", tabstopMap);
	  }
	}
  }
 
  private void adjustRtlParagraphMargins(ConversionContext context, OdfElement element, String styleName, Map<String, Map<String, String>> map)
  {
	OdfElement parent = (OdfElement) element.getParentNode();
	String attr = parent.getAttribute(ODFConstants.STYLE_LIST_STYLE_NAME);
	//Adjust margin and indentation for all 'right-to-left' paragraphs except those under list item
	if(attr == null || attr.length() == 0) {
		Map<String,String> styleMap = map.get(styleName);
		String direction = styleMap.get(HtmlCSSConstants.DIRECTION);
		if(HtmlCSSConstants.RTL.equalsIgnoreCase(direction)) {
			String marginLeft = styleMap.get(HtmlCSSConstants.MARGIN_LEFT);
			if(marginLeft != null && marginLeft.length() > 0){
				styleMap.remove(HtmlCSSConstants.MARGIN_LEFT);
				styleMap.put(HtmlCSSConstants.MARGIN_RIGHT,marginLeft);
			}
		}
	}
  }
}
