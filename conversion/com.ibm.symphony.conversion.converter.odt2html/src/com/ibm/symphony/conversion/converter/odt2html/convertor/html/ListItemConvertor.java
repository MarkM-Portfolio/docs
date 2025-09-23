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
import java.util.Set;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextListStyle;
import org.odftoolkit.odfdom.dom.element.OdfStyleBase;
import org.odftoolkit.odfdom.dom.element.text.TextListLevelStyleElementBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfParagraphProperties;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.odt2html.convertor.css.CSSConvertorUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.css.CSSConvertorUtil.LevelsWrapper;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.CounterUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;

public class ListItemConvertor extends HtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    Document doc = (Document) context.getTarget();
    
    Node child = element.getFirstChild();
    Element newNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.LI);

    if ( child != null && ODFConstants.TEXT_LIST.equals(child.getNodeName()))
    {
      //multilevel list
      //newNode.setAttribute(HtmlCSSConstants.STYLE, "display:block");
      parent.appendChild(newNode);
    }
    else if(child != null)
    {
      parent.appendChild(newNode);
      String direction = null;
      if (ODFConstants.TEXT_P.equals(child.getNodeName()) || ODFConstants.TEXT_H.equals(child.getNodeName()))
      {
    	boolean isSingleChild = (child.getNextSibling() == null)?true:false;
        // copy the style from the first paragraph.
        OdfElement paragraph = (OdfElement) child;
        Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");
        String pStyleName = paragraph.getAttribute(ODFConstants.TEXT_STYLE_NAME);
        Map<String, String> pStyleMap = null;
        Map<String, String> tmpStyle = new HashMap<String, String>();

        if (pStyleName.length() > 0)
        {
          pStyleMap = map.get(pStyleName);
          if (pStyleMap != null && pStyleMap.size() > 0)
          {
            tmpStyle.putAll(pStyleMap);

            String pMarginLeft = tmpStyle.get(HtmlCSSConstants.MARGIN_LEFT);
            
            if( pMarginLeft != null && isParagraphChangeMaringLeft(context, pStyleName, element) )
            {                
              
              String styleName = HtmlConvertorUtil.getListLevelStyleName(context, element);
              Map<String, String> styleMap = map.get(styleName);
              if( styleMap != null)
              {
                String marginLeft = styleMap.get(HtmlCSSConstants.MARGIN_LEFT);
                if( marginLeft!= null)
                {
                  if (marginLeft.startsWith("-"))
                  {
                    marginLeft = marginLeft.substring(1);
                    pMarginLeft = ConvertUtil.addLength(pMarginLeft, marginLeft);
                  }
                  else
                  {
                    pMarginLeft = ConvertUtil.addLength(pMarginLeft, "-" + marginLeft);
                  }
                }
                tmpStyle.put(HtmlCSSConstants.MARGIN_LEFT, pMarginLeft);
                //due to the marin-left is assigned to the li, the styles should be recorded so that it can be accessed by children.
                getListItemMarginLeftMap(context).put(newNode, pMarginLeft);
              }

              String indent = pStyleMap.get(HtmlCSSConstants.TEXT_INDENT);              
              if( indent != null)
              {
                tmpStyle.put(HtmlCSSConstants.TEXT_INDENT, indent);
              }
              else
              {
                tmpStyle.put(HtmlCSSConstants.TEXT_INDENT, "0cm");
              }
            }
            else
            {
              tmpStyle.remove(HtmlCSSConstants.MARGIN_LEFT);
              tmpStyle.remove(HtmlCSSConstants.TEXT_INDENT);
            }

            direction = pStyleMap.get(HtmlCSSConstants.DIRECTION);
            if(HtmlCSSConstants.RTL.equalsIgnoreCase(direction)) {
                /* ul/ol tweaking: style change 'margin-left'->'margin-right' && add to class ' rtl ' qualifier */
            	/* we let the left margin to be propagated down the hierarchy and tweak the resultant margin at the right spot */
            	/* i.e. on ul/ol parent after all relevant processing is finished, thus eliminating the need to mess with left margin everywhere in code */
                String pNodeName = parent.getNodeName(), pAttr = parent.getAttribute(HtmlCSSConstants.STYLE);
                if(pAttr != null && pAttr.length() > 0) {
              	  parent.setAttribute(HtmlCSSConstants.STYLE, pAttr.replace(HtmlCSSConstants.MARGIN_LEFT, HtmlCSSConstants.MARGIN_RIGHT));
                }
                
                String marginLeft = tmpStyle.remove(HtmlCSSConstants.MARGIN_LEFT);
                if(marginLeft != null)
              	  tmpStyle.put(HtmlCSSConstants.MARGIN_RIGHT, marginLeft);
              	  
                Element ancestor = parent;
                /* process all elements up on list chain by updating class value with ' rtl ' qualifier */
                while(!ODFConstants.HTML_ELEMENT_BODY.equals(pNodeName)) {
              	  pAttr = ancestor.getAttribute(HtmlCSSConstants.CLASS);
                  if((ODFConstants.HTML_ELEMENT_LI.equals(pNodeName) ||
                		  ODFConstants.HTML_ELEMENT_UL.equals(pNodeName) || ODFConstants.HTML_ELEMENT_OL.equals(pNodeName)) 
                		  && !pAttr.contains(ODFConstants.SYMBOL_WHITESPACE + HtmlCSSConstants.RTL + ODFConstants.SYMBOL_WHITESPACE)) {
                	  pAttr += ODFConstants.SYMBOL_WHITESPACE + HtmlCSSConstants.RTL + ODFConstants.SYMBOL_WHITESPACE;
                	  ancestor.setAttribute(HtmlCSSConstants.CLASS, pAttr);
                  }
                  
                  ancestor = (Element)ancestor.getParentNode();
                  pNodeName = ancestor.getNodeName();
                }
            }

            tmpStyle.remove(HtmlCSSConstants.MARGIN);
            tmpStyle.remove(HtmlCSSConstants.MARGIN_BOTTOM);
            tmpStyle.remove(HtmlCSSConstants.TEXT_DECORATION);
            tmpStyle.remove(HtmlCSSConstants.FONT_WEIGHT);
            tmpStyle.remove(HtmlCSSConstants.FONT_STYLE);
            tmpStyle.remove(HtmlCSSConstants.FONT_SIZE);
            tmpStyle.remove(HtmlCSSConstants.FONT_FAMILY);
            
            //check if the background color should be set on list item
            if( tmpStyle.containsKey( HtmlCSSConstants.BACKGROUND_COLOR ))
            {
              Set<String> styles = (Set<String>) context.get("BackgroundColorChangedInTextProperties");
              if(styles!=null && styles.contains( pStyleName) )
              {
                tmpStyle.remove(HtmlCSSConstants.BACKGROUND_COLOR);
              }
            }

            //display property should be removed from list item
            if(!isSingleChild)
            	tmpStyle.remove(HtmlCSSConstants.DISPLAY);

            if( ODFConstants.TEXT_H.equals( child.getNodeName() ))
            {
              //drop border of li which contains a block element child.
              tmpStyle.remove( HtmlCSSConstants.BORDER_LEFT );
              tmpStyle.remove( HtmlCSSConstants.BORDER_RIGHT );

              tmpStyle.remove( HtmlCSSConstants.BORDER_BOTTOM );
              tmpStyle.remove( HtmlCSSConstants.BORDER_TOP );
            }
          }
        }
        tmpStyle.put(HtmlCSSConstants.PADDING, "0cm");
        //tmpStyle.put("display", "block");
        context.put("tmpStyle", tmpStyle);
      }
      
      convertAttributes(context, element, newNode);
      if(HtmlCSSConstants.RTL.equalsIgnoreCase(direction)) {
      	  String pAttr = newNode.getAttribute(HtmlCSSConstants.CLASS);
      	  pAttr += ODFConstants.SYMBOL_WHITESPACE + HtmlCSSConstants.RTL + ODFConstants.SYMBOL_WHITESPACE;
      	  newNode.setAttribute(HtmlCSSConstants.CLASS, pAttr);
      }
    }
    HtmlConvertorUtil.convertChildren(context, element, newNode);
    String counterName = HtmlConvertorUtil.getListLevelCounterName(context,element);
    
    //This part is used to optimize performance for editor. 
    // /****** for editor performance begin. *********/

    updateValueForEditor(context, counterName, newNode);
    
    // /****** for editor performance end. *********/
    
    //make sure the current counter is initialed.
    if( HtmlCSSConstants.OL.equals(parent.getNodeName()))
    {
      int startValue = ListConvertor.getCounterDefaultValue(context, counterName);
      CounterUtil.initCounter(context, counterName, startValue);
    }
    
    
  }

  private boolean isParagraphChangeMaringLeft(ConversionContext context, String pStyleName, OdfElement element)
  {
    OdfStyle paragraphStyleElement = CSSConvertorUtil.getStyleElement(context, pStyleName, OdfStyleFamily.Paragraph);
       
    if( paragraphStyleElement != null)
    {
      String marginLeft = paragraphStyleElement.getProperty(OdfParagraphProperties.MarginLeft);
      if( marginLeft == null || marginLeft.length() == 0)
        return false;
      
      // make sure the marin-left did not get from parent.
      Node paragraphStyleChild = paragraphStyleElement.getFirstChild();
      while( paragraphStyleChild != null)
      {
        if( ODFConstants.STYLE_PARAGRAPH_PROPERTIES.equals( paragraphStyleChild.getNodeName() )   )
        {
          OdfElement paragraphProperties = (OdfElement) paragraphStyleChild;
          if( paragraphProperties.getAttribute(ODFConstants.FO_MARGIN_LEFT).length() > 0 )
            return true;
          
        }                  
        paragraphStyleChild = paragraphStyleChild.getNextSibling();
      }
      
      // check parent style, if the parent style contains attribute
      OdfStyleBase parentStyle = paragraphStyleElement.getParentStyle();
      if( parentStyle != null )
      {
        String listStyleName = parentStyle.getAttribute( ODFConstants.STYLE_LIST_STYLE_NAME );
        if( listStyleName.length() > 0 )
        {
          String styleName = HtmlConvertorUtil.getListLevelStyleName(context, element);
          int pos = styleName.lastIndexOf('_');
          if( pos != -1)
          {
            if(listStyleName.equals(styleName.substring(0, pos)))
                return true;

          }
          
        }
      }
    }
    return false;
  }
  
  protected void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {
    HtmlConvertorUtil.convertAttributes(context, element, htmlNode);
    Element parentNode = (Element) htmlNode.getParentNode();
    String styleName = HtmlConvertorUtil.getListLevelStyleName(context,element);
    String counterName = HtmlConvertorUtil.getListLevelCounterName(context,element);
    int pos = counterName.lastIndexOf('_');
    String name = counterName.substring(0, pos);
    int level = Integer.parseInt( counterName.substring( pos + 1 ) );
    LevelsWrapper levels = CSSConvertorUtil.getTextListStyleElement(context, name);

    if( HtmlCSSConstants.OL.equals( parentNode.getNodeName()) 
        && ! ODFConstants.TEXT_LIST_HEADER.equals(element.getNodeName()) )
    {
      //calculate numbering
      
      OdfElement currentlevelStyleElement = levels.getLevel( level );
      updateListItemValue(context, currentlevelStyleElement,levels, counterName, htmlNode);
      
      /*//disable import consecutive numbering
      if(! "true".equals(listStyleElement.getAttribute(ODFConstants.TEXT_CONSECUTIVE_NUMBERING)) )
      {
        //none consecutive numbering, reset children counter

        ListConvertor.resetCounters(context, name, level+1, 10, listStyleElement);
      }
      */

    }

    
    
    if(! ODFConstants.TEXT_LIST_HEADER.equals(element.getNodeName()) )
    {
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CLASS, styleName);
    }
    else
    {
      HtmlConvertorUtil.setAttribute(htmlNode,HtmlCSSConstants.CLASS, "lst-header",false);
    }
    ListConvertor.resetCounters(context, name, level+1, 10, levels);

  }
  
  private static void updateValueForEditor(ConversionContext context, String counterName, Element htmlNode)
  {
    Element li = htmlNode;
    int pos = counterName.lastIndexOf('_');
    String name = counterName.substring(0, pos);
    LevelsWrapper listStyleElement = CSSConvertorUtil.getTextListStyleElement(context, name);

    int currentLevel = Integer.parseInt(counterName.substring(pos + 1));
    if (li != null )
    {
      String values = li.getAttribute("values");
      String classValue = li.getAttribute("class");
      if (( values == null || values.length() == 0) && ( classValue == null || classValue.length()== 0 || classValue.equals("lst-header") ) )
      {
        OdfElement styleLevel = listStyleElement.getLevel(currentLevel);
        String format = styleLevel.getAttribute(ODFConstants.STYLE_NUM_FORMAT);
        format = CounterUtil.getFormatCode(format);

        // counter should be initialized and before shown.
        int defaultValue = 0;
        try
        {
          String startVal = styleLevel.getAttribute(ODFConstants.TEXT_START_VALUE);
          if( startVal.length() > 0)
            defaultValue = Integer.parseInt(startVal) - 1;
        }
        catch (NumberFormatException e)
        {
        }
        
        if(! classValue.equals("lst-header") )
        {
          CounterUtil.initCounter(context, counterName, defaultValue);

          values = CounterUtil.getCounterValueFormat(context, counterName, format);
        }
        else
        {
          int val = CounterUtil.getCounterValue(context, counterName, defaultValue);
          values = CounterUtil.getCounterValueFormat(val, format);
          CounterUtil.getUsedCounterSet(context).add(counterName);
        }
        HtmlConvertorUtil.setAttribute(li,"values", values);
      }
    }
  }
  
  private static void updateListItemValue(ConversionContext context, OdfElement currentlevelStyleElement, LevelsWrapper listStyleElement, String counterName, Element htmlNode)
  {
    try
    {
      int pos = counterName.lastIndexOf('_');
      String name = counterName.substring(0, pos);
      int currentLevel = Integer.parseInt(counterName.substring(pos + 1));
      String value = "";
      String strDspLevels = currentlevelStyleElement.getAttribute(ODFConstants.TEXT_DISPLAY_LEVELS);

      if (strDspLevels.length() == 0 || "1".equals(strDspLevels))
      {
        String format = currentlevelStyleElement.getAttribute(ODFConstants.STYLE_NUM_FORMAT);
        format = CounterUtil.getFormatCode(format);
        value = CounterUtil.showCounter(context, counterName, format);
      }
      else
      {

        int dspLevels = Integer.parseInt(strDspLevels);
        int start = currentLevel - dspLevels + 1;
        if (start < 1)
        {
          start = 1;
          dspLevels = currentLevel;
        }
        StringBuilder valueBuf = new StringBuilder();
        for (int i = start; i <= currentLevel; i++)
        {
          OdfElement levelStyleElement = listStyleElement.getLevel(i);
          String format = levelStyleElement.getAttribute(ODFConstants.STYLE_NUM_FORMAT);

          if(! ODFConstants.TEXT_LIST_LEVEL_STYLE_NUMBER.equals(levelStyleElement.getNodeName()) &&  format.length() == 0)
          {
            valueBuf.append('.');
            continue;
          }
          format = CounterUtil.getFormatCode(format);
          
          String prevCounterName = name + "_" + i;
          // parent counter should be initialized and current counter should be shown.
          if (i < currentLevel)
          {
            int defaultValue = 0;
            
              String startValue = levelStyleElement.getAttribute(ODFConstants.TEXT_START_VALUE);
              if( startValue.length() > 0)
              {
                try
                {
                  defaultValue = Integer.parseInt(startValue) - 1;
                  
                }
                catch (NumberFormatException e)
                {
                }
                
              }
              CounterUtil.initCounter(context, prevCounterName, defaultValue);
              valueBuf.append(CounterUtil.getCounterValueFormat(context, prevCounterName, format));
              valueBuf.append('.');
            
          }
          else
          {
            valueBuf.append(CounterUtil.showCounter(context, prevCounterName, format));
          }
        }
        value = valueBuf.toString();
      }
      HtmlConvertorUtil.setAttribute(htmlNode,"values", value);
      HtmlConvertorUtil.setAttribute(htmlNode,"_firststop", ListConvertor.getTabStopPosition(listStyleElement, currentLevel));
    }
    catch(NumberFormatException e)
    {
    }
  }
  protected static Map<Element,String> getListItemMarginLeftMap(ConversionContext context)
  {
    Map<Element,String> marginLeftMap = (Map<Element, String>) context.get("ListItemMarginLeftMap");
    if( marginLeftMap == null)
    {
      marginLeftMap = new HashMap<Element,String>();
      context.put("ListItemMarginLeftMap", marginLeftMap);
    }
    return marginLeftMap;
  }
}
