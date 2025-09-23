/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.css;

import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.propertyConvertors.CSSPropertyConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.propertyConvertors.ICSSPropertyConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.XMLConvertorUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.OdfDomUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;

public class GeneralCSSStyleConvertor implements ICSSStyleConvertor
{
  private static final String MARGIN_PATTERN = "[\\.0 xptcmin]*";	
  protected OdfStyleFamily odfStyleFamily = OdfStyleFamily.Text;

  public void convertStyle(ConversionContext context, Element htmlElement, OdfElement odfElement, String styleName, String styleString)
  {
    OdfDocument odfDoc = (OdfDocument) context.getTarget();
    Map<String, String> styleMap = getCSSMap(context, odfDoc, htmlElement, odfStyleFamily, styleString);
    convertStyle(context, htmlElement, odfElement, styleName, styleMap);
  }

  public void convertStyle(ConversionContext context, Element htmlElement, OdfElement odfElement, String styleName,
      Map<String, String> styleMap)
  {

    if (odfElement.getNodeName().equals(ODFConstants.TEXT_DATE) || odfElement.getNodeName().equals(ODFConstants.TEXT_TIME))
      return;
    
    OdfDocument odfDoc = (OdfDocument) context.getTarget();
    OdfStylableElement stylable = (OdfStylableElement) odfElement;

    try
    {
      OdfFileDom currentFileDom = XMLConvertorUtil.getCurrentFileDom(context);
      OdfOfficeAutomaticStyles autoStyles = currentFileDom.getAutomaticStyles();
      context.put("OdfElement", odfElement);

      OdfStyle newStyle = parseStyle(context, currentFileDom, htmlElement, getStyleName(stylable, styleName), styleMap,
          odfStyleFamily);
      
      if(!(newStyle.getOwnerDocument()).equals(currentFileDom))
      {
        newStyle = (OdfStyle) OdfDomUtil.cloneNode(currentFileDom, newStyle, true);
      }

      if( newStyle != null && newStyle.getParentNode() != null)
      {
        // re-used style
        stylable.setStyleName(newStyle.getStyleNameAttribute());
        return;
      }

      OdfStyle oldStyle = CSSUtil.getOldStyle(context, getStyleName(stylable, styleName), odfStyleFamily);

      Set<String> preservedStyles = getPreservedStyleItems(htmlElement);
      
      XMLConvertorUtil.copyPreservedProperties(context,preservedStyles, newStyle, oldStyle);

      if (newStyle != null && oldStyle != null && oldStyle.equals(newStyle))
      {
        stylable.setStyleName(oldStyle.getStyleNameAttribute());
        return;
      }

      if (!newStyle.hasChildNodes())// no pros,use default style
      {
        setDefaultStyle(stylable);
      }
      else
      {
        newStyle.setStyleFamilyAttribute(odfStyleFamily.getName());
        newStyle.setStyleNameAttribute(newStyleName(stylable, styleName));
        autoStyles.appendChild(newStyle);
        stylable.setStyleName(newStyle.getStyleNameAttribute());
      }
    }
    catch (Exception e)
    {
      XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_STYLE, e);
    }
  }

  private static Set<String> getPreservedStyleItems(Element htmlElement)
  {
    Set<String> preservedStyles = null;
    if( htmlElement != null)
    {
      String preservedStyleName = htmlElement.getAttribute("preservedStyleName");
      if( preservedStyleName != null && preservedStyleName.length() > 0 )
      {
        String[] styles = preservedStyleName.split(";");
        preservedStyles = new HashSet<String>();
        Collections.addAll(preservedStyles, styles);
      }
    }
    return preservedStyles;
  }

  protected void setDefaultStyle(OdfStylableElement stylable)
  {
    stylable.setStyleName(Constants.DEFAULT_TEXT_STYLE);
  }

  protected String getStyleName(OdfStylableElement stylable, String styleName)
  {
    return styleName;
  }

  protected String newStyleName(OdfStylableElement stylable, String styleName)
  {
    return CSSUtil.getStyleName(odfStyleFamily, styleName);
  }

  protected boolean useDefaultValue(String key, String value)
  {
    return false;
  }

  /*
   * private final OdfStyle parseStyle(ConversionContext context, OdfFileDom odfDoc, Element htmlElement, String styleName, String
   * htmlStyle, OdfStyleFamily odfStyleFamily) {
   * 
   * Map<String, String> cssMap = getCSSMap(context, odfDoc.getOdfDocument(), htmlElement, odfStyleFamily, htmlStyle);
   * 
   * return parseStyle(context, odfDoc, htmlElement, styleName, cssMap, odfStyleFamily); }
   */
  protected OdfStyle parseStyle(ConversionContext context, OdfFileDom odfDoc, Element htmlElement, String styleName,
      Map<String, String> CSSMap, OdfStyleFamily odfStyleFamily)
  {
    OdfStyle style = new OdfStyle(odfDoc);
    style.setStyleFamilyAttribute(odfStyleFamily.getName());
    style.setStyleNameAttribute(CSSUtil.getStyleName(odfStyleFamily, styleName));
    context.put("HtmlElement", htmlElement);
    context.put("oldStyleName", styleName);
    processDirectionRelatedStyles(context, htmlElement, CSSMap);

    Iterator<Entry<String, String>> it = CSSMap.entrySet().iterator();
    while (it.hasNext())
    {
      Entry<String, String> entry = it.next();
      if (useDefaultValue(entry.getKey(), entry.getValue()))
        continue;
      ICSSPropertyConvertor convertor = CSSPropertyConvertorFactory.getInstance().getConvertor(entry.getKey());
      convertor.convert(context, style, CSSMap, entry.getKey(), entry.getValue());
    }
    context.remove("oldStyleName");
    context.remove("HtmlElement");
    return style;
  }

  private void processDirectionRelatedStyles(ConversionContext context, Element htmlElement, Map<String, String> CSSMap) {
    //in case of rtl list item (' rtl' qualifier in class name) direction of current 'li'
    //is what does matter, so target its direction into ODF paragraph style
    String direction = CSSMap.get(HtmlCSSConstants.DIRECTION);
    if(htmlElement != null && HtmlCSSConstants.P.equals(htmlElement.getNodeName())) {
    	Element parent = (Element)htmlElement.getParentNode();
    	if(HtmlCSSConstants.LI.equals(parent.getNodeName())) {
    		String classValue = parent.getAttribute(ODFConstants.HTML_ATTR_CLASS);
    		if(classValue != null) {
    			direction = classValue.contains(HtmlCSSConstants.RTL) ? HtmlCSSConstants.RTL : HtmlCSSConstants.LTR;
    			CSSMap.put(HtmlCSSConstants.DIRECTION, direction);
    		}
    	}
    	//switch back from HTML right-margin style to ODF fo:left-margin style if margin-right isn't 0
        if (HtmlCSSConstants.RTL.equalsIgnoreCase(direction)) {
            String align = CSSMap.get(HtmlCSSConstants.TEXT_ALIGN);
            if(align == null)
            	CSSMap.put(HtmlCSSConstants.TEXT_ALIGN, HtmlCSSConstants.RIGHT);

            String marginRight = CSSMap.remove(HtmlCSSConstants.MARGIN_RIGHT);
            if(marginRight != null && !marginRight.matches("[\\.0a-z]*"))
            	CSSMap.put(HtmlCSSConstants.MARGIN_LEFT, marginRight);
        }    	
    }
    //for Open Document format, table alignment should be 'left' for 'rtl' direction to make table right aligned.
    if(htmlElement != null && HtmlCSSConstants.TABLE.equals(htmlElement.getNodeName())) {
    	String margin = CSSMap.get(HtmlCSSConstants.MARGIN_RIGHT);
    	boolean isOnRtlMargin = (margin != null && margin.matches(MARGIN_PATTERN));
    	margin = CSSMap.get(HtmlCSSConstants.MARGIN_LEFT);
    	boolean isOnLtrMargin = (margin != null && margin.matches(MARGIN_PATTERN));
    	boolean isRtlAlign = isOnRtlMargin;
    	if(isOnLtrMargin)
    		isRtlAlign = false;

    	if(context.get("targetTypeMS") != null && (Boolean)context.get("targetTypeMS") && HtmlCSSConstants.RTL.equalsIgnoreCase(direction))
        	isRtlAlign = !isRtlAlign;

        CSSMap.put(ODFConstants.TABLE_ALIGN, isRtlAlign ? HtmlCSSConstants.RIGHT : HtmlCSSConstants.LEFT);
    }
  }
 
  protected Map<String, String> getCSSMap(ConversionContext context, OdfDocument odfDoc, Element htmlElement,
      OdfStyleFamily odfStyleFamily, String htmlStyle)
  {
    Map<String, String> cssMap = ConvertUtil.buildCSSMap(htmlStyle);
    return cssMap;
  }
}
