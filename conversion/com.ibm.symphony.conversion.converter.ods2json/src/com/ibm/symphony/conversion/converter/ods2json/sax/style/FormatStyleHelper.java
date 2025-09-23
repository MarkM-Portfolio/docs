/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.style;

import java.util.ArrayList;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.number.OdfNumberBooleanStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberCurrencyStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberCurrencySymbol;
import org.odftoolkit.odfdom.doc.number.OdfNumberDateStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberFraction;
import org.odftoolkit.odfdom.doc.number.OdfScientificNumber;
import org.odftoolkit.odfdom.doc.number.OdfNumberPercentageStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberText;
import org.odftoolkit.odfdom.doc.number.OdfNumberTextContent;
import org.odftoolkit.odfdom.doc.number.OdfNumberTextStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberTimeStyle;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyleMap;
import org.odftoolkit.odfdom.dom.element.style.StyleTextPropertiesElement;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.ods2json.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.NumberFormat;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.StyleMap;

public class FormatStyleHelper
{
  private static final String CLAZZ = FormatStyleHelper.class.getName();
  private static final Logger LOG = Logger.getLogger(FormatStyleHelper.class.getName());
  public void convert(OdfElement styles, ConversionContext context)
  {
    LOG.entering(CLAZZ, "convert");
    try{
      if(styles == null)
        return;
      HashMap<String,NumberFormat> cellFormatNameIdMap = (HashMap<String, NumberFormat>) context.get("cellFormatNameIdMap");
      //get the format style from content.xml or styles.xml
      boolean bAuto = false;
      if(styles instanceof OdfOfficeAutomaticStyles)
        bAuto = true;
      //Number: float, scientific, fraction
      
      Iterator<OdfNumberStyle> numberStyleIter = null;
      if(bAuto)
        numberStyleIter = ((OdfOfficeAutomaticStyles)styles).getNumberStyles().iterator();
      else
        numberStyleIter = ((OdfOfficeStyles)styles).getNumberStyles().iterator();
      while(numberStyleIter.hasNext()){
        OdfNumberStyle numberStyle = numberStyleIter.next();
        String styleName = numberStyle.getStyleNameAttribute();
        String formatCode = numberStyle.getConcordFormat();
        StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, numberStyle);
        String color = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
        formatCode = ConversionUtil.normalizeNumber(numberStyle, formatCode);
        String type = ConversionConstant.NUMBERS_TYPE;
        if(OdfElement.findFirstChildNode(OdfNumberFraction.class, numberStyle)!= null)
        	type = ConversionConstant.FRACTION_TYPE;
        else if(OdfElement.findFirstChildNode(OdfScientificNumber.class, numberStyle)!= null)
        	type = ConversionConstant.SCIENTIFIC_TYPE;
        if(ConversionUtil.hasValue(formatCode))
        {
          ConversionUtil.NumberFormat format = new ConversionUtil.NumberFormat(type, formatCode, null, color);
          cellFormatNameIdMap.put(styleName, format);
          mapFormatStyleName(context,numberStyle, styleName);
        }
      }
      
      // stores the format name which is in the style map of a text style
      HashSet<String> textDateStyleSet = new HashSet<String>();
      
      //Do not support ods boolean again
      //Text
      Iterator<OdfNumberTextStyle> textStyleIter = null;
      if(bAuto)
        textStyleIter = ((OdfOfficeAutomaticStyles)styles).getTextStyles().iterator();
      else
        textStyleIter = ((OdfOfficeStyles)styles).getTextStyles().iterator();
      while(textStyleIter.hasNext()){
        OdfNumberTextStyle textStyle = textStyleIter.next();
        String styleName = textStyle.getStyleNameAttribute();
        String formatCode = getConcordTextFormat(textStyle);
        StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, textStyle);
        
        // Add the name of the style (which is referred by the style map of a text style) into set
        OdfStyleMap styleMap = OdfElement.findFirstChildNode(OdfStyleMap.class, textStyle);
        while (styleMap != null) {
          String styleApplyStyleName = styleMap.getStyleApplyStyleNameAttribute();
          textDateStyleSet.add(styleApplyStyleName);
          styleMap = OdfElement.findNextChildNode(OdfStyleMap.class, styleMap);
        }
        
        String color = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
        // TODO not implemented yet
        ConversionUtil.NumberFormat format = new ConversionUtil.NumberFormat(ConversionConstant.TEXT_TYPE, formatCode, null, color);
        cellFormatNameIdMap.put(styleName, format);
        mapFormatStyleName(context,textStyle, styleName);
        
      }
      
      //Date
      Iterator<OdfNumberDateStyle> dateStyleIter = null;
      if(bAuto)
        dateStyleIter = ((OdfOfficeAutomaticStyles)styles).getDateStyles().iterator();
      else
        dateStyleIter = ((OdfOfficeStyles)styles).getDateStyles().iterator();
      while(dateStyleIter.hasNext()){
        OdfNumberDateStyle dateStyle = dateStyleIter.next();
        String styleName = dateStyle.getStyleNameAttribute();
        String formatCode = dateStyle.getFormat();//use the y/d/E instead of Y/D/N which is compatible with dojo
        StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, dateStyle);
        String color = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
        //if the date style is not referred by the style map of a text style, that means the format code is related with the locale
        if (!textDateStyleSet.contains(styleName)) {
            String code = ConversionUtil.getDateTimePattern(formatCode, ConversionConstant.DATE_TYPE, true);
            if (code != null) {
              formatCode = code;
            }
        }
        ConversionUtil.NumberFormat format = new ConversionUtil.NumberFormat(ConversionConstant.DATE_TYPE, formatCode, null, color);
        cellFormatNameIdMap.put(styleName, format);
        mapFormatStyleName(context, dateStyle, styleName);
      }
      //Time
      Iterator<OdfNumberTimeStyle> timeStyleIter = null;
      if(bAuto)
        timeStyleIter = ((OdfOfficeAutomaticStyles)styles).getTimeStyles().iterator();
      else
        timeStyleIter = ((OdfOfficeStyles)styles).getTimeStyles().iterator();
      while(timeStyleIter.hasNext()){
        OdfNumberTimeStyle timeStyle = timeStyleIter.next();
        String styleName = timeStyle.getStyleNameAttribute();
        String formatCode = getConcordTimeFormat(timeStyle);//should not use OdfNumberTimeStyle.getConcordFormat
        StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, timeStyle);
        String color = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
        if (!textDateStyleSet.contains(styleName)) {
          String code = ConversionUtil.getDateTimePattern(formatCode, ConversionConstant.TIME_TYPE, true);
          if (code != null) {
            formatCode = code;
          }
        }
        ConversionUtil.NumberFormat format = new ConversionUtil.NumberFormat(ConversionConstant.TIME_TYPE, formatCode, null, color);
        cellFormatNameIdMap.put(styleName, format);
        mapFormatStyleName(context, timeStyle, styleName);
      }
      //Currency
      Iterator<OdfNumberCurrencyStyle> currencyStyleIter = null;
      if(bAuto)
        currencyStyleIter = ((OdfOfficeAutomaticStyles)styles).getCurrencyStyles().iterator();
      else
        currencyStyleIter = ((OdfOfficeStyles)styles).getCurrencyStyles().iterator();
        
      while(currencyStyleIter.hasNext()){
        OdfNumberCurrencyStyle currencyStyle = currencyStyleIter.next();
        String styleName = currencyStyle.getStyleNameAttribute();
        String formatCode = currencyStyle.getConcordFormat();
        String currCode = getCurrencyCode(currencyStyle);
//        if("EUR".equalsIgnoreCase(currCode)){
//        	int eurIndex = formatCode.indexOf("\u20AC"); //euro symbol
//        	if(eurIndex == 0)	//"鈧� #,##0.00"  ==>  "[$鈧�-2] #.##0,00"
//        		formatCode = formatCode.replace("\u20AC", "[\u0024\u20ac-2]");//currencyStyle.getAttribute(ConversionConstant.STYLE_NUMBERFORMAT);
//        	else	//"#,##0.00 鈧�"  ==>  "#,##0.00 [$鈧�-1]"
//        		formatCode = formatCode.replace("\u20AC", "[\u0024\u20ac-1]");
//        }
        StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, currencyStyle);
        String color = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
        ConversionUtil.NumberFormat format;
        if (currCode != null) {
            format = new ConversionUtil.NumberFormat(ConversionConstant.CURRENCY_TYPE, formatCode, currCode, color);
        }else
            format = new ConversionUtil.NumberFormat(ConversionConstant.NUMBERS_TYPE, formatCode, null, color);
        cellFormatNameIdMap.put(styleName, format);    
        mapFormatStyleName(context, currencyStyle, styleName);
      }
      //Percentage
      Iterator<OdfNumberPercentageStyle> percentageStyleIter = null;
      if(bAuto)
        percentageStyleIter = ((OdfOfficeAutomaticStyles)styles).getPercentageStyles().iterator();
      else
        percentageStyleIter = ((OdfOfficeStyles)styles).getPercentageStyles().iterator();
      while(percentageStyleIter.hasNext()){
        OdfNumberPercentageStyle percentageStyle = percentageStyleIter.next();
        String styleName = percentageStyle.getStyleNameAttribute();
        String formatCode = percentageStyle.getConcordFormat();
        StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, percentageStyle);
        String color = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
        ConversionUtil.NumberFormat format = new ConversionUtil.NumberFormat(ConversionConstant.PERCENTS_TYPE, formatCode, null, color);
        cellFormatNameIdMap.put(styleName, format);
        mapFormatStyleName(context, percentageStyle, styleName);
      }
    }catch (Exception e) {
      LOG.log(Level.WARNING,"Convert format style failed", e);
    }
    LOG.exiting(CLAZZ, "convert");
  }
//dojo use h/s/a instead of H/S/AM/PM
  private String getConcordTimeFormat(OdfNumberTimeStyle timeStyle){
    String code = timeStyle.getConcordFormat().toLowerCase();
    code = code.replace("am/pm", "a");
    //"a" does not exist, then change "h" to "H"
    if(code.indexOf("a") == -1)
      code = code.replaceAll("h", "H");
    return code;
  }
  
  private String getConcordTextFormat(OdfNumberTextStyle textStyle){
    StringBuffer result = new StringBuffer();
    Node m = textStyle.getFirstChild();
    while (m != null) {
        if (m instanceof OdfNumberText) {
        	String textcontent = m.getTextContent();
			if(!"".equals(textcontent)) {
				result.append(textcontent);
			}
			
			String ph = ((OdfNumberText) m).getAttribute("number:place-holder"); // place holder attribute
			if(!"".equals(ph))
				result.append("_" + ph);
			
			String sc = ((OdfNumberText) m).getAttribute("number:star-char"); // star char attribute
			if(!"".equals(sc))
				result.append("*" + sc);
        } else if (m instanceof OdfNumberTextContent) {
            String textcontent = m.getTextContent();
            if (textcontent == null || textcontent.length() == 0) {
                textcontent = "@";
            }
            result.append(textcontent);
        }
        m = m.getNextSibling();
    }
    return result.toString();
  }
  
  private void mapFormatStyleName(ConversionContext context, OdfElement numberStyle, String styleName)
  {
    HashMap<String,List<StyleMap>> cellFormatStyleIdMap = (HashMap<String, List<StyleMap>>) context.get("cellFormatStyleIdMap");
    OdfStyleMap styleMap = OdfElement.findFirstChildNode(OdfStyleMap.class, numberStyle);
    while(styleMap != null){
      String condition = styleMap.getStyleConditionAttribute();
      if(condition != null){
        condition = condition.trim();
        Matcher m = ODSConvertUtil.PATTERN_TOKEN.matcher(condition);
        if (m.matches()) {
          String operator = m.group(2);
          String num = m.group(4);
          String aStyleName = styleMap.getStyleApplyStyleNameAttribute();
          StyleMap map = new StyleMap(operator, num, aStyleName);
          if(cellFormatStyleIdMap.get(styleName) == null)
              cellFormatStyleIdMap.put(styleName, new ArrayList<StyleMap> ());
          cellFormatStyleIdMap.get(styleName).add(map);
        }
      }
      styleMap = OdfElement.findNextChildNode(OdfStyleMap.class, styleMap);
    }
  }
  
  private String getCurrencyCode(OdfNumberCurrencyStyle currencyStyle){
	  String currCode = "USD";
	  String lang = "";
	  String country = "";
	  
      String styleLang = currencyStyle.getAttribute(ConversionConstant.CURRENCY_LANGUAGE);
      String styleCoun = currencyStyle.getAttribute(ConversionConstant.CURRENCY_COUNTRY);
      String styleCode = "";
      OdfNumberCurrencySymbol currSym = currencyStyle.getCurrencySymbolElement();
      if(currSym != null){ 
    	  lang = currSym.getNumberLanguageAttribute();
    	  country = currSym.getNumberCountryAttribute();
    	  styleCode = currSym.getTextContent();//.getAttribute(ConversionConstant.STYLE_NUMBERFORMAT);
      }
      
      //Currency symbol has the higher priority if "styleLang-styleCoun" and "lang-country" both not null.
      //special case for general EUR currency: "[$€-2] #,##0.00" and "#,##0.00 [$€-1]"
      if(lang != null && country != null)
    	  currCode = ConversionUtil.getCurrencyCode(lang, country);
      else if(styleLang != "" || styleCoun != "")
    	  currCode = ConversionUtil.getCurrencyCode(styleLang, styleCoun);
      else{
    	  if(styleCode.indexOf("\u20ac") >= 0)
    		  currCode = "EUR";
    	  else
    	    currCode = styleCode;
//    	  String reg = "\\[\\u0024\\u20ac(-(1|2))?\\]";
//  		  Matcher m = Pattern.compile(reg).matcher(styleCode);
//  		  if(m.find())
//  			  currCode = "EUR";
      }
	  return currCode;
  }
  
}
