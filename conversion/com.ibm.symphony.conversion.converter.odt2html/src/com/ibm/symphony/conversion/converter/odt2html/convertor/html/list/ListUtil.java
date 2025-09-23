/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html.convertor.html.list;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeFontFaceDecls;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextListStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.element.style.StyleFontFaceElement;
import org.odftoolkit.odfdom.dom.element.text.TextListElement;
import org.odftoolkit.odfdom.dom.element.text.TextListItemElement;
import org.odftoolkit.odfdom.dom.element.text.TextListLevelStyleElementBase;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.odt2html.convertor.ODTConvertorUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.css.CSSConvertorUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.HtmlConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.OdfElementUtil;
import com.ibm.symphony.conversion.service.common.util.StringPool;

public class ListUtil
{
  public static final String[] listElement = { "li", "h1", "h2", "h3", "h4", "h5", "h6" };

  private static final String SP_LIST_PREFIX = "LST_";

  private static final String SP_STYLE_TXT_PREFIX = "SST_";

  private static final String SP_STYLE_FONT_PREFIX = "SFF_";

  public static OdfElement splitList(ConversionContext context, OdfElement listRoot)
  {
    OdfElement splitItem = getFirstSplitItem(listRoot);
    if (splitItem != null)
    {
      NewListResult result = prepareNewList(context, splitItem);

      Node next = listRoot.getNextSibling();
      if (next != null)
      {
        listRoot.getParentNode().insertBefore(result.listRoot, next);
      }
      else
      {
        listRoot.getParentNode().appendChild(result.listRoot);
      }

      moveElement(splitItem, result.appendPoint, listRoot);

      // copy style
      copyListStyle(context, (TextListElement) listRoot, result.listRoot);

      return result.listRoot;

    }
    return null;
  }

  private static void copyListStyle(ConversionContext context, TextListElement source, TextListElement target)
  {
    String sourceStyle = source.getTextStyleNameAttribute();
    int randValue = (int) (Math.random() * 1000);
    String targetStyle = sourceStyle + (int) (Math.random() * 1000);
    OdfTextListStyle sourceStyleElement = (OdfTextListStyle) CSSConvertorUtil.getTextListStyleElement(context, sourceStyle).getSource();

    OdfTextListStyle targetStyleElement = (OdfTextListStyle) sourceStyleElement.cloneNode(true);
    targetStyleElement.setStyleNameAttribute(targetStyle);
    Node next = sourceStyleElement.getNextSibling();
    if (next != null)
    {
      sourceStyleElement.getParentNode().insertBefore(targetStyleElement, next);
    }
    else
    {
      sourceStyleElement.getParentNode().appendChild(targetStyleElement);
    }
    target.setTextStyleNameAttribute(targetStyleElement.getStyleNameAttribute());

    flattenListStyle(context, targetStyleElement);

    Map<String, Map<String, String>> cssMap = (Map<String, Map<String, String>>) context.get("CSSStyle");
    Map<String, Map<String, String>> map = (Map<String, Map<String, String>>) context.get("InplaceStyle");

    for (int i = 1; i <= 10; i++)
    {
      String targetStyleName = targetStyleElement.getStyleNameAttribute() + "_" + i;
      String sourceStyleName = sourceStyleElement.getStyleNameAttribute() + "_" + i;

      String targetCSSStyleName = generateCssStyleName(targetStyleName);
      // dup the style and position style.
      Map<String, String> styleMap = cssMap.get(generateCssStyleName(sourceStyleName));
      cssMap.put(targetCSSStyleName, styleMap);

      String targetCSSPositionName = generateCssPostionStyleName(targetStyleName);
      styleMap = cssMap.get(generateCssPostionStyleName(sourceStyleName));
      cssMap.put(targetCSSPositionName, styleMap);

      map.put(targetStyleName, map.get(sourceStyleName));
    }

    // rename style name for the continued list
    updateContinuedList(context, (Element) target.getNextSibling(), sourceStyle, targetStyle);

  }

  public static void updateContinuedList(ConversionContext context, Element target, String oldStyleName, String newStyleName)
  {
    Element next = target;
    if (next != null)
    {
      Element parent = (Element) target.getParentNode();
      while (next != null)
      {
        if (ODFConstants.TEXT_LIST.equals(next.getNodeName()))
        {
          if (next.getAttribute(ODFConstants.TEXT_STYLE_NAME).equals(oldStyleName)
              && ("true".equals(next.getAttribute(ODFConstants.TEXT_CONTINUE_NUMBERING)) || next
                  .hasAttribute(ODFConstants.TEXT_CONTINUE_LIST)))
          {
            HtmlConvertorUtil.setAttribute(next, ODFConstants.TEXT_STYLE_NAME, newStyleName);
          }
        }
        next = (Element) next.getNextSibling();
      }
      if (parent != null && !parent.getNodeName().equals(context.get("contentRootNode")))
      {
        next = (Element) parent.getNextSibling();
        updateContinuedList(context, next, oldStyleName, newStyleName);
      }
    }
  }

  private static void moveElement(Node node, Node target, OdfElement finishPos)
  {

    if (node instanceof Element)
    {
      ((Element) node).removeAttribute(ODFConstants.TEXT_START_VALUE);
    }
    Node toMove = node;
    Node parent = node.getParentNode();
    while (toMove != null)
    {
      target.appendChild(toMove.cloneNode(true));

      Node next = toMove.getNextSibling();
      parent.removeChild(toMove);
      toMove = next;
    }
    if (parent != finishPos)
    {
      Element parentNext = (Element) parent.getNextSibling();
      target = target.getParentNode();
      while (parentNext == null)
      {
        parent = parent.getParentNode();
        target = target.getParentNode();
        if (parent != finishPos)
        {
          parentNext = (Element) parent.getNextSibling();
        }
        else
        {
          break;
        }
      }
      if (parentNext != null)
      {
        moveElement(parentNext, target, finishPos);
      }

    }
  }

  private static class NewListResult
  {
    TextListElement listRoot;

    OdfElement appendPoint;
  };

  private static NewListResult prepareNewList(ConversionContext context, OdfElement splitItem)
  {
    NewListResult result = new NewListResult();
    OdfFileDom doc = (OdfFileDom) splitItem.getOwnerDocument();
    int level = HtmlConvertorUtil.getListLevel(context, splitItem);
    result.appendPoint = result.listRoot = new TextListElement(doc);

    while (level > 2)
    {
      TextListItemElement item = ((TextListElement) result.appendPoint).newTextListItemElement();
      result.appendPoint = item.newTextListElement();
      level--;
    }

    if (ODFConstants.TEXT_LIST.equals(splitItem.getNodeName()))
    {
      result.appendPoint = ((TextListElement) result.appendPoint).newTextListItemElement();
    }
    return result;
  }

  private static OdfElement getFirstSplitItem(OdfElement element)
  {
    if (ODFConstants.TEXT_LIST_ITEM.equals(element.getNodeName()))
    {
      if (element.getAttribute(ODFConstants.TEXT_START_VALUE).length() > 0)
        return element;
    }
    else if (ODFConstants.TEXT_LIST.equals(element.getNodeName())
        && ODFConstants.TEXT_LIST_ITEM.equals(element.getParentNode().getNodeName()))
    {
      Node prev = element.getPreviousSibling();
      if (prev != null && ODFConstants.TEXT_LIST.equals(prev.getNodeName()))
        return element;
    }
    Node child = element.getFirstChild();
    while (child != null)
    {
      if (child instanceof OdfElement)
      {
        OdfElement rst = getFirstSplitItem((OdfElement) child);
        if (rst != null)
          return rst;
      }
      child = child.getNextSibling();
    }
    return null;
  }

  public static String generateCssStyleName(String styleName)
  {

    StringBuilder sb = new StringBuilder();
    for (String elementName : listElement)
    {
      sb.append(' ');
      sb.append(elementName);
      sb.append('.');
      sb.append(styleName);
      sb.append(":before,");
    }
    return sb.substring(0, sb.length() - 1);
  }

  public static String generateCssPostionStyleName(String styleName)
  {
    StringBuilder sb = new StringBuilder();
    sb.append("ol.");
    sb.append(styleName);
    sb.append(" , ul.");
    sb.append(styleName);
    sb.append(" ");

    /*
     * if( styleName.endsWith( "_1")) { String name = styleName.substring(0, styleName.length() - 2);
     * 
     * return "ol.lst-" + name + " , ul.lst-" + name + " "; } else
     */
    return sb.toString();
  }

  public static Set<String> getUsedListStyleSet(ConversionContext context)
  {
    Set<String> set = (Set<String>) context.get("UsedListSylteNames");
    if (set == null)
    {
      set = new HashSet<String>();
      context.put("UsedListSylteNames", set);
    }
    return set;
  }

  public static void flattenListStyle(ConversionContext context, OdfElement element)
  {
    String flattenedString = OdfElementUtil.flattenElement(element);
    StringPool stringPool = (StringPool) context.get("stringPool");
    String key = element.getAttribute(ODFConstants.STYLE_NAME);
    key = stringPool.addString(SP_LIST_PREFIX + key, flattenedString);

    OdfTextListStyle txtListStyle = (OdfTextListStyle) element;
    flatternListTextStyle(context, txtListStyle, stringPool);
  }

  private static void flatternListTextStyle(ConversionContext context, OdfTextListStyle txtListStyle, StringPool stringPool)
  {
    try
    {
      OdfOfficeAutomaticStyles autoStyles = ODTConvertorUtil.getCurrentAutoStyles(context);
      OdfDocument odfDoc = (OdfDocument) context.get("source");
      OdfFileDom styleDom;
      styleDom = odfDoc.getStylesDom();
      OdfOfficeStyles officeStyles = styleDom.getOfficeStyles();
      OdfOfficeFontFaceDecls fontFaceDecls = ConvertUtil.getOfficeFontFaceDecls(ODTConvertorUtil.getCurrentFileDom(context));

      for (int i = 1; i < txtListStyle.getLength(); i++)
      {
        TextListLevelStyleElementBase listLevelStyle = txtListStyle.getLevel(i);

        if (listLevelStyle.hasAttribute(ODFConstants.TEXT_STYLE_NAME))
        {
          String textStyleName = listLevelStyle.getAttribute(ODFConstants.TEXT_STYLE_NAME);
          String key = SP_STYLE_TXT_PREFIX + textStyleName;

          if (!stringPool.contains(key))
          {
            OdfStyle oldTextStyle = autoStyles.getStyle(textStyleName, OdfStyleFamily.Text);
            if (oldTextStyle == null && officeStyles != null)
              oldTextStyle = officeStyles.getStyle(textStyleName, OdfStyleFamily.Text);

            if (oldTextStyle != null)
            {
              String flattenedString = OdfElementUtil.flattenElement(oldTextStyle);
              key = stringPool.addString(key, flattenedString);
            }
          }
        }

        OdfStylePropertiesBase textPro = listLevelStyle.getPropertiesElement(OdfStylePropertiesSet.TextProperties);
        if (textPro != null && textPro.hasAttribute(ODFConstants.STYLE_FONT_NAME))
        {
          String fontName = textPro.getAttribute(ODFConstants.STYLE_FONT_NAME);
          String key = SP_STYLE_FONT_PREFIX + fontName;

          if (!stringPool.contains(key))
          {
            StyleFontFaceElement fontFace = ConvertUtil.getFontFaceElement(fontFaceDecls, fontName);
            if (fontFace != null)
            {
              String flattenedString = OdfElementUtil.flattenElement(fontFace);
              key = stringPool.addString(key, flattenedString);
            }
          }
        }
      }
    }
    catch (Exception e)
    {
    }
  }

}
