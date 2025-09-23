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
import org.odftoolkit.odfdom.doc.style.OdfStyleListLevelLabelAlignment;
import org.odftoolkit.odfdom.doc.style.OdfStyleListLevelProperties;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.odt2html.convertor.css.CSSConvertorUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.css.CSSConvertorUtil.LevelsWrapper;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.CounterUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.ListSymbolUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.ListUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;

public class ListConvertor extends GeneralHtmlConvertor
{

  @Override
  protected void doConvertHtml(ConversionContext context, OdfElement element, Element parent)
  {
    int level = HtmlConvertorUtil.getListLevel(context, element);
    if (level == 1)
    {
      // this is the behaiver of symphony3.0.1, split list to make compatible with symphony3.0
      OdfElement newList = ListUtil.splitList(context, element);
    }

    Element htmlNode = convertElement(context, element, parent);

    if (level == 1)
    {
      context.put("CurrentListRoot", element);
      String name = element.getAttribute(ODFConstants.TEXT_STYLE_NAME);
      if (name.length() > 0)
        ListUtil.getUsedListStyleSet(context).add(name);
    }

    if (htmlNode != null)
    {
      convertAttributes(context, element, htmlNode);
      convertChildren(context, element, htmlNode);
      
      //Blank ol/ul is forbidden under body
      if(parent.getNodeName().equals(HtmlCSSConstants.BODY) && htmlNode.getFirstChild() == null)
      {
        parent.removeChild(htmlNode);
      }
    }
    else
    {
      convertChildren(context, element, parent);
    }

    if (level == 1)
    {
      context.remove("CurrentListRoot");

    }

  }

  public static int getCounterDefaultValue(ConversionContext context, String counterName)
  {
    OdfElement levelStyleElement = CSSConvertorUtil.getTextListLevelStyleElement(context, counterName);
    int startValue = 0;
    String strStartValue = levelStyleElement.getAttribute(ODFConstants.TEXT_START_VALUE);
    if (strStartValue.length() > 0)
    {
      try
      {
        startValue = Integer.parseInt(strStartValue) - 1;
      }
      catch (NumberFormatException e)
      {
      }
    }
    return startValue;
  }

  @Override
  protected Element convertElement(ConversionContext context, OdfElement element, Element parent)
  {
    String styleName = HtmlConvertorUtil.getListLevelStyleName(context, element);

    if (styleName.length() > 0)
    {
      // search style element
      Document doc = (Document) context.getTarget();

      OdfElement listStyleLevelElement = CSSConvertorUtil.getTextListLevelStyleElement(context, styleName);

      if (listStyleLevelElement != null)
      {
        if (ODFConstants.TEXT_LIST_LEVEL_STYLE_BULLET.equals(listStyleLevelElement.getNodeName())
            || ODFConstants.TEXT_LIST_LEVEL_STYLE_IMAGE.equals(listStyleLevelElement.getNodeName()))
        {
          Element newNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.UL);
          parent.appendChild(newNode);
          return newNode;
        }
        else
        {
          Element newNode = HtmlConvertorUtil.createHtmlElement(context, element, HtmlCSSConstants.OL);
          parent.appendChild(newNode);
          return newNode;
        }
      }

    }

    return super.convertElement(context, element, parent);
  }

  @Override
  protected void convertAttributes(ConversionContext context, OdfElement element, Element htmlNode)
  {
    String styleName = HtmlConvertorUtil.getListLevelStyleName(context, element);
    int pos = styleName.lastIndexOf('_');
    String strLevel = styleName.substring(pos + 1);
    int level = Integer.parseInt(strLevel);

    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");
    Map<String, String> styleMap = map.get(styleName);
    Map<String, String> tmpStyle = new HashMap<String, String>();
    if (styleMap != null)
      tmpStyle.putAll(styleMap);
    tmpStyle.remove(HtmlCSSConstants.MARGIN_LEFT);
    tmpStyle.remove(HtmlCSSConstants.TEXT_INDENT);

    String marginLeft = parseMarginLeft(context, htmlNode, styleName, map);
    if (marginLeft != null)
      tmpStyle.put(HtmlCSSConstants.MARGIN_LEFT, marginLeft);

    Element parent = (Element) htmlNode.getParentNode();
    String pStyle = parent.getAttribute(HtmlCSSConstants.STYLE);
    String textAlign = HtmlCSSConstants.LEFT;
    if (pStyle != null && pStyle.contains(HtmlCSSConstants.DIRECTION + ODFConstants.SYMBOL_COLON + HtmlCSSConstants.RTL)) {
    	if (marginLeft != null) {
    		tmpStyle.remove(HtmlCSSConstants.MARGIN_LEFT);
    		tmpStyle.put(HtmlCSSConstants.MARGIN_RIGHT, marginLeft);
    	}
    	textAlign = HtmlCSSConstants.RIGHT;
    }
	  
    if (HtmlCSSConstants.LI.equals(parent.getNodeName()) && pStyle != null)
    {
      if (pStyle.indexOf(HtmlCSSConstants.TEXT_ALIGN) != -1)
        tmpStyle.put(HtmlCSSConstants.TEXT_ALIGN, textAlign);
    }

    context.put("tmpStyle", tmpStyle);
    HtmlConvertorUtil.convertAttributes(context, element, htmlNode);

    // generate format infomation for editor
    if (level == 1)
    {
      String name = styleName.substring(0, pos);
      HtmlConvertorUtil.setAttribute(htmlNode, HtmlCSSConstants.CLASS, "lst-" + name + " " + styleName);

      LevelsWrapper levels = CSSConvertorUtil.getTextListStyleElement(context, name);
      if (levels != null)
      {
        generateFormatInfo(htmlNode, levels);
      }
    }
    else
    {
      HtmlConvertorUtil.setAttribute(htmlNode, HtmlCSSConstants.CLASS, styleName);

    }

    processNumbering(context, element, htmlNode);

  }

  protected void processNumbering(ConversionContext context, OdfElement element, Element htmlNode)
  {
    String styleName = HtmlConvertorUtil.getListLevelStyleName(context, element);
    String name = styleName.substring(0, styleName.lastIndexOf('_'));

    LevelsWrapper levels = CSSConvertorUtil.getTextListStyleElement(context, name);
    String strLevel = styleName.substring(styleName.lastIndexOf('_') + 1);
    int level = Integer.parseInt(strLevel);

    if (level == 1)
    {
      // for the first level

      if (element.hasAttribute(ODFConstants.TEXT_CONTINUE_LIST)
          || "true".equals(element.getAttribute(ODFConstants.TEXT_CONTINUE_NUMBERING)))
      {
        HtmlConvertorUtil.setAttribute(htmlNode, HtmlCSSConstants.CLASS, htmlNode.getAttribute("class") + " " + "continue");
        /*
         * // disable import sonsecutive numbering if(
         * "true".equals(listStyleElement.getAttribute(ODFConstants.TEXT_CONSECUTIVE_NUMBERING)))
         * htmlNode.setAttribute(HtmlCSSConstants.CLASS, htmlNode.getAttribute("class") + " " + "consecutive" );
         */
      }
      else
      {
        // reset counters
        ListConvertor.resetCounters(context, name, 1, 10, levels);

        /*
         * // disable import sonsecutive numbering if(
         * "true".equals(listStyleElement.getAttribute(ODFConstants.TEXT_CONSECUTIVE_NUMBERING))) {
         * htmlNode.setAttribute(HtmlCSSConstants.CLASS, htmlNode.getAttribute("class") + " " + "consecutive" ); //reset 1st level.
         * ListConvertor.resetCounters(context, name, 1, 1, listStyleElement); } else { //reset all level.
         * ListConvertor.resetCounters(context, name, 1, 10, listStyleElement); }
         */
      }
    }
  }

  public void generateFormatInfo(Element htmlNode, LevelsWrapper listStyleElement)
  {
    // generate format info for editor>>>>>>>>>>>>>
    StringBuilder startBuffer = new StringBuilder();
    StringBuilder typeBuffer = new StringBuilder();
    StringBuilder tabStopBuffer = new StringBuilder();
    for (int i = 1; i <= 10; i++)
    {
      OdfElement listLevel = listStyleElement.getLevel(i);
      if (listLevel != null)
      {
        String format = listLevel.getAttribute(ODFConstants.STYLE_NUM_FORMAT);

        if (ODFConstants.TEXT_LIST_LEVEL_STYLE_NUMBER.equals(listLevel.getNodeName()) || format.length() > 0)
        {
          startBuffer.append(listLevel.getAttribute(ODFConstants.TEXT_START_VALUE));
          startBuffer.append(',');

          format = CounterUtil.getFormatCode(format);

          typeBuffer.append(format);
          typeBuffer.append(',');

          String dspLevels = listLevel.getAttribute(ODFConstants.TEXT_DISPLAY_LEVELS);
          if (!"1".equals(dspLevels))
            typeBuffer.append(dspLevels);
          typeBuffer.append(':');
        }
        else if (listLevel != null && ODFConstants.TEXT_LIST_LEVEL_STYLE_BULLET.equals(listLevel.getNodeName()))
        {
          startBuffer.append(',');

          typeBuffer.append(ListSymbolUtil.extractToUnicode(listLevel.getAttribute(ODFConstants.TEXT_BULLET_CHAR)));
          typeBuffer.append(",:");
        }
        else
        {
          startBuffer.append(',');
          typeBuffer.append("url,:");
        }
      }
      else
      {
        startBuffer.append(',');
        typeBuffer.append("url,:");
      }
      tabStopBuffer.append(getTabStopPosition(listStyleElement, i));
      tabStopBuffer.append(',');

    }
    String start = startBuffer.substring(0, startBuffer.length() - 1);
    if (!start.equals(",,,,,,,,,"))
      HtmlConvertorUtil.setAttribute(htmlNode, "starts", start);

    String type = typeBuffer.substring(0, typeBuffer.length() - 1);
    if (!type.equals(",:,:,:,:,:,:,:,:,:,"))
      HtmlConvertorUtil.setAttribute(htmlNode, "types", type);
    HtmlConvertorUtil.setAttribute(htmlNode, "_firststop", tabStopBuffer.substring(0, tabStopBuffer.length() - 1));
    // generate format info for editor end<<<<<<<<<<<<
  }

  public static void resetCounters(ConversionContext context, String name, int levelFrom, int levelTo, LevelsWrapper levels)
  {
    for (int i = levelFrom; i <= levelTo; i++)
    {
      OdfElement listLevel = levels.getLevel(i);
      if (listLevel != null)
      {
        String format = listLevel.getAttribute(ODFConstants.STYLE_NUM_FORMAT);
        if (ODFConstants.TEXT_LIST_LEVEL_STYLE_NUMBER.equals(listLevel.getNodeName()) || format.length() > 0)
        {
          int startValue = 0;
          String strStartValue = listLevel.getAttribute(ODFConstants.TEXT_START_VALUE);
          if (strStartValue.length() > 0)
          {
            try
            {
              startValue = Integer.parseInt(strStartValue) - 1;
            }
            catch (NumberFormatException e)
            {
            }
          }
          String counterName = name + "_" + i;
          CounterUtil.setCounterValue(context, counterName, startValue);
          // mark the variable as unused.
          CounterUtil.getUsedCounterSet(context).remove(counterName);
        }
      }
    }
  }

  public static String parseMarginLeft(ConversionContext context, Element htmlNode, String styleName,
      Map<String, Map<String, String>> styles)
  {
    Map<String, Map<String, String>> cssMap = (Map<String, Map<String, String>>) context.get("CSSStyle");

    Map<String, String> styleMap = styles.get(styleName);
    Map<String, String> cssPosStyleMap = cssMap.get(ListUtil.generateCssPostionStyleName(styleName));

    Element parent = (Element) htmlNode.getParentNode();
    if (HtmlCSSConstants.LI.equals(parent.getNodeName()))
    {
      String liMarginLeft = ListItemConvertor.getListItemMarginLeftMap(context).get(parent);
      if (liMarginLeft != null)
      {
        String marginLeft = cssPosStyleMap.get(HtmlCSSConstants.MARGIN_LEFT);
        if (liMarginLeft.startsWith("-"))
        {
          liMarginLeft = liMarginLeft.substring(1);
          marginLeft = ConvertUtil.addLength(marginLeft, liMarginLeft);
        }
        else
        {
          marginLeft = ConvertUtil.addLength(marginLeft, "-" + liMarginLeft);
        }
        return marginLeft;
      }
    }
    return null;
  }

  public static String getTabStopPosition(LevelsWrapper levels, int level)
  {
    if (levels != null)
    {
      OdfElement listLevelElement = levels.getLevel(level);
      if (listLevelElement != null)
      {
        OdfStyleListLevelProperties listLevelProperties = OdfElement
            .findFirstChildNode(OdfStyleListLevelProperties.class, listLevelElement);
        if (listLevelProperties != null)
        {
          OdfStyleListLevelLabelAlignment alignment = listLevelProperties.findFirstChildNode(OdfStyleListLevelLabelAlignment.class,
              listLevelProperties);
          if (alignment != null)
          {
            String tabStop = alignment.getTextListTabStopPositionAttribute();
            if (tabStop != null && tabStop.length() > 0)
            {
              if (UnitUtil.getUnit(tabStop).toLowerCase().equals(Unit.INCH.abbr()))
                tabStop = UnitUtil.convertINToCM(tabStop);
              return tabStop;
            }
          }
        }
      }
    }
    return 0.741 * level + "cm";
  }
}
