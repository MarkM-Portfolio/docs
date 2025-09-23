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
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextOutlineLevelStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextOutlineStyle;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.converter.odt2html.convertor.css.CSSConvertorUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.CounterUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;

public class HeadingConvertor extends HtmlConvertor
{
  /*
   * (non-Javadoc)
   * 
   * 1. set max level as 6 2. add class name as Outlne_(level) 3. add counter-rest: Outline_(level) when text:restart-numbering
   */

  @SuppressWarnings("unchecked")
  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    String outlineLevel = element.getAttribute(ODFConstants.TEXT_OUTLINE_LEVEL);
    int level = Integer.parseInt(outlineLevel);
    if (level > 6)
    {
      level = 6;
      outlineLevel = "6";
    }
    String outlineName = "Outline_" + outlineLevel;

    Document doc = (Document) context.getTarget();
    Element h = HtmlConvertorUtil.createHtmlElement(context, element, "h" + outlineLevel);
    
    //Add hyper link reference name into TargetName map 
    context.getHeadingNameMap().put(h, element.getTextContent()+"|outline");
    
    String styleName = element.getAttribute(ODFConstants.TEXT_STYLE_NAME);
    HtmlConvertorUtil.generatePageBreak(context, styleName, element, h, parent);

    parent.appendChild(h);
    
    

    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");
    ParagraphConvertor.convertTabStop(context, map, styleName, h);
    
    Map<String, String> tmpStyle = new HashMap<String,String>();
    tmpStyle.putAll( map.get("default-style_paragraph") );

    
    String fontColor = HtmlConvertorUtil.getWindowFontColor(context, element);
    if( fontColor != null )
    {
      tmpStyle.put(HtmlCSSConstants.COLOR, fontColor);
    }
    if(! tmpStyle.containsKey(HtmlCSSConstants.FONT_WEIGHT))
      tmpStyle.put(HtmlCSSConstants.FONT_WEIGHT, "normal");
    
    context.put("tmpStyle", tmpStyle);
  
   
    

    String className = null;
    
    
    String pMarginLeft = null, pMarginRight = null;
    String pIndent = null;
    Map<String,String> paragraphStyle = map.get(styleName);
    
    Map<String,String> styleToChildren = new HashMap<String,String>();
    if(paragraphStyle != null && paragraphStyle.containsKey( HtmlCSSConstants.BACKGROUND_COLOR ))
    {
      Set<String> styles = (Set<String>) context.get("BackgroundColorChangedInTextProperties");
      if(styles!=null && styles.contains( styleName) )
      {
        String bgColor = paragraphStyle.remove(HtmlCSSConstants.BACKGROUND_COLOR);
        
        styleToChildren.put(HtmlCSSConstants.BACKGROUND_COLOR, bgColor);
      }
    }
    if(paragraphStyle != null && paragraphStyle.containsKey( HtmlCSSConstants.TEXT_DECORATION ))
    {
      String textDecoration = paragraphStyle.remove(HtmlCSSConstants.TEXT_DECORATION);
      
      styleToChildren.put(HtmlCSSConstants.TEXT_DECORATION, textDecoration);
    }
    

    if (HtmlCSSConstants.LI.equals(parent.getNodeName()) && element.equals(element.getParentNode().getFirstChild()))
    {
      String parentClassName = parent.getAttribute("class");
      parent.removeAttribute("class");
      className = parentClassName;
      String value = parent.getAttribute("values");
      HtmlConvertorUtil.setAttribute(h,"values", value);
      if( paragraphStyle != null)
      {
        pMarginLeft = paragraphStyle.remove(HtmlCSSConstants.MARGIN_LEFT);
        pMarginRight = paragraphStyle.remove(HtmlCSSConstants.MARGIN_RIGHT);
        pIndent = paragraphStyle.remove(HtmlCSSConstants.TEXT_INDENT);
      }
      
      
    }
    else
    {
      // set counter from the outline style
      OdfDocument odfDoc = (OdfDocument) context.getSource();
      try
      {
        OdfTextOutlineStyle outlineStyle = odfDoc.getStylesDom().getOfficeStyles().getOutlineStyle();
        OdfTextOutlineLevelStyle outlineLevelStyle = outlineStyle.getLevel(level);
       
        if ("true".equals(element.getAttribute(ODFConstants.TEXT_RESTART_NUMBERING)))
        {
          CounterUtil.setCounterValue(context, outlineName, outlineLevelStyle.getTextStartValueAttribute() - 1);
        }
        
        // The outline style margin-left should be applied on heading if the heading specified the list-style-name as "outline" or don't contain this attribute.
        // defect 9290
        OdfStyle styleElement = CSSConvertorUtil.getStyleElement(context, styleName, OdfStyleFamily.Paragraph);
        String listStyleName = CSSConvertorUtil.getStyleAttribute(styleElement, "style:list-style-name");
        if( listStyleName == null /*|| listStyleName.equals("Outline")*/)
        {
          Map<String, String> outlineStyleMap = map.get(outlineName);
          if( outlineStyleMap != null )
          {
            Iterator<Entry<String, String>> iterator = outlineStyleMap.entrySet().iterator();
            while(iterator.hasNext())
            {
              Entry<String, String> entry = iterator.next();
              if(!tmpStyle.containsKey(entry.getKey()))
                tmpStyle.put(entry.getKey(), entry.getValue());
            }
          }
        }
        
        String numFormat = outlineLevelStyle.getStyleNumFormatAttribute();
        if( numFormat.length() > 0 && listStyleName == null)
        {
          className = outlineName;
          
          
          int displayLevel = outlineLevelStyle.getTextDisplayLevelsAttribute();
          int start = level - displayLevel + 1;
          if( start < 1)
          {
            start = 1;
            displayLevel = level;
          }
          StringBuilder value = new StringBuilder();
          for( int i=start;i<=level;i++)
          {
            OdfTextOutlineLevelStyle prevLevel = outlineStyle.getLevel(i);
            String format = prevLevel.getStyleNumFormatAttribute();
            String counter = "Outline_" + i;
            if( format.length() > 0)
            {
              int defaultValue = prevLevel.getTextStartValueAttribute() -1;

              if( i < level)
              {
                CounterUtil.initCounter(context, counter, defaultValue);
                value.append(CounterUtil.getCounterValueFormat(context,counter, defaultValue, format));
                value.append('.');
              }
              else
              {
                value.append(CounterUtil.showCounter(context, counter, format));
              }
              
            }
          }
          ListConvertor.resetCounters(context, "Outline", level+1, 10, CSSConvertorUtil.generateListStyleWapper(outlineStyle));

         
          HtmlConvertorUtil.setAttribute(h,"values", value.toString());
        }
      }
      catch (Exception e)
      {
      }
    }
    
	if(paragraphStyle != null && HtmlCSSConstants.RTL.equalsIgnoreCase(paragraphStyle.get(HtmlCSSConstants.DIRECTION))) {
        String marginLeft = paragraphStyle.remove(HtmlCSSConstants.MARGIN_LEFT);
        if(marginLeft != null)
        	paragraphStyle.put(HtmlCSSConstants.MARGIN_RIGHT, marginLeft);                	
 	}
	
    HtmlConvertorUtil.convertAttributes(context, element, h);

    if(className != null)
      HtmlConvertorUtil.setAttribute(h,"class", h.getAttribute("class")+" "+className);


    

    convertChildren(context, element, h, styleToChildren);
    
    //Make <h><div/></h> to <div/><h/> 
    NodeList nodelist = h.getChildNodes();
    if(nodelist != null && nodelist.getLength() != 0)
    {
    	for(int i=0; i<nodelist.getLength(); i++)
    	{
    		Node node = nodelist.item(i);
    		if(node.getNodeName().equals(HtmlCSSConstants.DIV))
    		{
    			Node cloneNode = node.cloneNode(true);
    			moveOutDivFromHeading(context,(Element)h.getParentNode(), (Element)cloneNode, h);
    			h.removeChild(node);
    			--i;
    		}
    	}
    	if(nodelist.getLength() == 0)
          h.getParentNode().removeChild(h);
    }
    if (ParagraphConvertor.isGenerateBRNode(h))
    {
      // Add <br class="hideInIE"/> to the heading
      HtmlConvertorUtil.generateBRNode(context, element, h);
    }
    //roll back style
    if(  paragraphStyle != null)
    {
      if( pMarginLeft != null)
        paragraphStyle.put(HtmlCSSConstants.MARGIN_LEFT, pMarginLeft);

      if( pMarginRight != null)
          paragraphStyle.put(HtmlCSSConstants.MARGIN_RIGHT, pMarginRight);

      if( pIndent != null)
        paragraphStyle.put(HtmlCSSConstants.TEXT_INDENT, pIndent);
      
      if( styleToChildren.size() > 0 )
        paragraphStyle.putAll(styleToChildren);
    }
    
    
    
    context.put("InHeading", "false");
  }
  private void moveOutDivFromHeading(ConversionContext context,Element parent, Element cloneNode, Element h)
  {
    String bodyId = (String) context.get("BodyId");
    Node insertBefore = cloneNode.cloneNode(true);
    HtmlConvertorUtil.setAttribute(((Element)insertBefore),"id", DOMIdGenerator.generate(bodyId));
    Element locationDiv = getLocationDiv(cloneNode);
    Element ibLocationDiv = getLocationDiv((Element)insertBefore);
    HtmlConvertorUtil.setAttribute(ibLocationDiv,"id", DOMIdGenerator.generate(bodyId));
    removeChildren(ibLocationDiv);
    String style = locationDiv.getAttribute("style");
    if(style.indexOf("position:relative;") != -1)
    {
      Node child = locationDiv.getFirstChild();
      while(child != null)
      {
        String top = getTop(child);
        if(top.indexOf("-") != -1)
        {
          Node currentChild = child;
          child = child.getNextSibling();
          ibLocationDiv.appendChild(locationDiv.removeChild(currentChild));
        }
        else
        {
          child = child.getNextSibling();
        }
      }
    }
    if(ibLocationDiv.getChildNodes().getLength()>0)
      parent.insertBefore(insertBefore, h);
    if(locationDiv.getChildNodes().getLength()>0)
      parent.appendChild(cloneNode);
  }
  private String getTop(Node child)
  {
    String top = "";
    if(child.getNodeName().equals(HtmlCSSConstants.DIV))
    {
      String type = ((Element)child).getAttribute("_type");
      if(type != null && type.equals("drawframe"))
      {
        child = child.getFirstChild();
        while(child != null)
        {
          if(child.getNodeName().equals(HtmlCSSConstants.DIV) ||
              child.getNodeName().equals(HtmlCSSConstants.IMG) )
            break;
          child = child.getNextSibling();
        }
        top = getTop((Element)child);
      }
    }
    else if(child.getNodeName().equals(HtmlCSSConstants.IMG))
    {
      top = getTop((Element)child);
    }
    return top;
  }
  private String getTop(Element element)
  {
    String top = "";
    String style = element.getAttribute(HtmlCSSConstants.STYLE);
    if(style.indexOf("position:absolute;") != -1)
    {
      String[] styles = style.split("top:");
      top = styles[1].split(";")[0];
    }
    return top;
  }
  private void removeChildren(Element div)
  {
    Node node = div.getFirstChild();
    while(node != null)
    {
      div.removeChild(node);
      node = div.getFirstChild();
    }
  }
  private Element getLocationDiv(Element cloneNode)
  {
    String type = cloneNode.getAttribute("_type");
    if(type.equals(HtmlCSSConstants.TOPDIV))
    {
      Node locationDiv = cloneNode.getFirstChild();
      if(locationDiv.getNodeName().equals(HtmlCSSConstants.DIV))
      {
        type = ((Element)locationDiv).getAttribute("_type");
        if(type.equals(HtmlCSSConstants.LOCATIONDIV))
        {
          return (Element)locationDiv;
        }
      }
    }
    return cloneNode;
  }
  private void convertChildren(ConversionContext context, OdfElement element, Element headingNode, Map<String,String> stylesToChildren )
  {
    if( stylesToChildren == null || stylesToChildren.size() == 0)
    {
      HtmlConvertorUtil.convertChildren(context, element, headingNode);
    }
    else
    {

      NodeList children = element.getChildNodes();
    
      for (int i = 0; i < children.getLength(); i++)
      {
        Node node = children.item(i);
        if (node instanceof OdfElement)
        {
          OdfElement child = (OdfElement) node;
          IConvertor convertor = HtmlConvertorFactory.getInstance().getConvertor(child);
          context.put("tmpStyle", stylesToChildren );
          convertor.convert(context, child, headingNode);

        }
        else if (node instanceof Text)
        {
          HtmlConvertorUtil.appendText2Parent(context, headingNode, (Text)node, stylesToChildren);
        }
      }
    }
    if (element.getChildNodes().getLength() == 0)
    {
      HtmlConvertorUtil.generateBRNode(context, element, headingNode);
    }    
  } 
}
