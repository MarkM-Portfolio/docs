package com.ibm.symphony.conversion.service.common.chart;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.number.OdfNumber;
import org.odftoolkit.odfdom.doc.number.OdfNumberBooleanStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberCurrencyStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberCurrencySymbol;
import org.odftoolkit.odfdom.doc.number.OdfNumberDateStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberFraction;
import org.odftoolkit.odfdom.doc.number.OdfNumberPercentageStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberTextStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberTimeStyle;
import org.odftoolkit.odfdom.doc.number.OdfScientificNumber;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleMap;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.element.style.StyleTextPropertiesElement;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.service.common.chart.Utils.VALUETYPE;

public class NumFormatHelper
{
  public static final Pattern OPERATOR = Pattern.compile("(>|=|<|>=|<=|<>)");
  public static final Pattern NUMBER = Pattern.compile("([0-9]+|true|false)");
  public static final Pattern PATTERN_TOKEN = Pattern.compile("(" + Pattern.quote("value()")
      +  "(" + OPERATOR.toString() +")" + "(" + NUMBER.toString() + ")" + ")");
  
  public static HashMap<String, ChartNumberFormat> buildChartFormatMap(OdfOfficeAutomaticStyles autoStyles)
  {
    String styleName = null;
    String category = null;
    String code = null;
    String currency = null;
    String fmFontColor = null;
    HashMap<String, ChartNumberFormat> map = new HashMap<String, ChartNumberFormat>();
    HashMap<String, ArrayList<StyleMap>> tStyleMap = new HashMap<String, ArrayList<StyleMap>>();
    
    Iterator<OdfNumberStyle> numItr = autoStyles.getNumberStyles().iterator();
    while (numItr.hasNext())
    {
      OdfNumberStyle style = numItr.next();
      styleName = style.getAttribute("style:name");
      code = NumFormatHelper.normalizeNumber(style, style.getConcordFormat());
      StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, style);
      fmFontColor = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
      category = "number";
      if(OdfElement.findFirstChildNode(OdfNumberFraction.class, style)!= null)
        category = "fraction";
      else if(OdfElement.findFirstChildNode(OdfScientificNumber.class, style)!= null)
        category = "scientific";
      
      ChartNumberFormat format = new ChartNumberFormat(category, code, currency, fmFontColor);
      map.put(styleName, format);
      NumFormatHelper.add2Map(tStyleMap, style, format);
    }

    Iterator<OdfNumberDateStyle> dateItr = autoStyles.getDateStyles().iterator();
    while (dateItr.hasNext())
    {
      OdfNumberDateStyle style = dateItr.next();
      styleName = style.getAttribute("style:name");
      code = style.getFormat();
      StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, style);
      fmFontColor = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
      category = "date";
      ChartNumberFormat format = new ChartNumberFormat(category, code, currency, fmFontColor);
      map.put(styleName, format);
      NumFormatHelper.add2Map(tStyleMap, style, format);
    }

    Iterator<OdfNumberTimeStyle> timeItr = autoStyles.getTimeStyles().iterator();
    while(timeItr.hasNext())
    {
      OdfNumberTimeStyle style = timeItr.next();
      styleName = style.getAttribute("style:name");
      code = NumFormatHelper.getConcordTimeFormat(style);
      StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, style);
      fmFontColor = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
      category = "time";
      ChartNumberFormat format = new ChartNumberFormat(category, code, currency, fmFontColor);
      map.put(styleName, format);
      NumFormatHelper.add2Map(tStyleMap, style, format);
    }
    
    Iterator<OdfNumberCurrencyStyle> currItr = autoStyles.getCurrencyStyles().iterator();
    while(currItr.hasNext())
    {
      OdfNumberCurrencyStyle style = currItr.next();
      styleName = style.getAttribute("style:name");
      code = style.getConcordFormat();
      StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, style);
      fmFontColor = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
      currency = NumFormatHelper.getCurrencyCode(style);
      category = "currency";
      ChartNumberFormat format = new ChartNumberFormat(category, code, currency, fmFontColor);
      map.put(styleName, format);
      NumFormatHelper.add2Map(tStyleMap, style, format);
    }
    
    Iterator<OdfNumberPercentageStyle> percItr = autoStyles.getPercentageStyles().iterator();
    while(percItr.hasNext())
    {
      OdfNumberPercentageStyle style = percItr.next();
      styleName = style.getAttribute("style:name");
      code = style.getConcordFormat();
      StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, style);
      fmFontColor = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
      category = "percent";
      ChartNumberFormat format = new ChartNumberFormat(category, code, currency, fmFontColor);
      map.put(styleName, format);
      NumFormatHelper.add2Map(tStyleMap, style, format);
    }
    
    Iterator<OdfNumberBooleanStyle> boolItr = autoStyles.getBooleanStyles().iterator();
    while(boolItr.hasNext())
    {
      OdfNumberBooleanStyle style = boolItr.next();
      styleName = style.getAttribute("style:name");
      code = style.getConcordFormat();
      StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, style);
      fmFontColor = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
      category = "boolean";
      ChartNumberFormat format = new ChartNumberFormat(category, code, currency, fmFontColor);
      map.put(styleName, format);
      NumFormatHelper.add2Map(tStyleMap, style, format);
    }

    Iterator<OdfNumberTextStyle> txtItr = autoStyles.getTextStyles().iterator();
    while(txtItr.hasNext())
    {
      OdfNumberTextStyle style = txtItr.next();
      styleName = style.getAttribute("style:name");
      code = style.getConcordFormat();
      StyleTextPropertiesElement colorProp = OdfElement.findFirstChildNode(StyleTextPropertiesElement.class, style);
      fmFontColor = (colorProp != null) ? colorProp.getFoColorAttribute() : null;
      category = "text";
      ChartNumberFormat format = new ChartNumberFormat(category, code, currency, fmFontColor);
      map.put(styleName, format);
      NumFormatHelper.add2Map(tStyleMap, style, format);
    }
    
    
  //merge
    Iterator<Map.Entry<String,ArrayList<StyleMap>>> keyItr = tStyleMap.entrySet().iterator();//.keySet().iterator();
    while(keyItr.hasNext())
    {
      Map.Entry<String,ArrayList<StyleMap>> entry = keyItr.next();
      String key = entry.getKey();
      ChartNumberFormat format = map.get(key);
      ArrayList<StyleMap> sMap = entry.getValue();
      NumFormatHelper.mergeStyle(map, sMap, format);
    }
    
    return map;
  }

  public static String getFormatStyleName(ChartNumberFormat format,OdfStyle odfStyle, OdfOfficeAutomaticStyles autoStyles, HashMap<String, String> formatStyleMap)
  { 
	  String formatCode = format.getCode();
	  String formatStyleName = "";
	  if (Utils.hasValue(formatCode))      {
		  
		  String formatStr = format.toString();
		  if (formatStyleMap.containsKey(formatStr))
			  formatStyleName = formatStyleMap.get(formatStr);
		  else
		  {
			  formatStyleName = Utils.getStyleName(null, Constant.FORMATID);
	          String[] fmColorArray = format.getFmFontColor().split(";", 4);
	          int fcLen = fmColorArray.length;
	          String[] categoryArray = format.getCategory().split(";", 4);
	          int lenCate = categoryArray.length;
	          String[] curArray = format.getCurrency().split(";", 4);
	          int lenCur = curArray.length;
	          String[] codes = formatCode.split(";", 4);
	          int len = codes.length;
	          
	          String valueType = categoryArray[0];
	          String appliedfmFontColor = fmColorArray[0];
	          String currency = curArray[0];
	          String pStyleName1 = formatStyleName + "P0";
	          String pStyleName2 = formatStyleName + "P1";
	          String pStyleName3 = formatStyleName + "P2";
	          
	          boolean p = false;
	          boolean n = false;
	          boolean z = false;
	          boolean hasTextCode = isTextFormat(codes[len - 1]);
	          OdfElement formatStyleElement = null;
	          boolean genFlg = true;
	          
	          for (int i = 0; i < len; i++)
	          {
	            OdfElement styleElment = null;
	            String code = codes[i];
	            String name = formatStyleName;
	            
	            // TODOthis.isTextFormat(codes[len-1])
	            if (len >= 2)
	            {
	              if (i == 0 && hasTextCode)// && (hasTextCode || ConversionUtil.hasValue(fmColorArray[i])))
	              {
	                name = pStyleName1;// for positive number style name
	                genFlg = p = true;
	              }
	              else if (i == 1 && !(isTextFormat(code)))
	              {
	                if (hasTextCode)
	                  name = pStyleName2;
	                else
	                  name = pStyleName1;
	                genFlg = n = true;
	                if (lenCur > i && Utils.hasValue(curArray[i]))
	                  currency = curArray[i];
	                if (lenCate > i && Utils.hasValue(categoryArray[i]))
	                  valueType = categoryArray[i];
	                if (fcLen > i && Utils.hasValue(fmColorArray[i]))
	                  appliedfmFontColor = fmColorArray[i];

	                // else use the positive number format
	              }
	              else if (i == 2 && !(isTextFormat(code)))
	              {
	                if (hasTextCode)
	                  name = pStyleName3;
	                else
	                  name = pStyleName2;
	                genFlg = z = true;
	                if (lenCur > i && Utils.hasValue(curArray[i]))
	                    currency = curArray[i];
	                if (lenCate > i && Utils.hasValue(categoryArray[i]))
	                    valueType = categoryArray[i];
	                if (fcLen > i && Utils.hasValue(fmColorArray[i]))
	                    appliedfmFontColor = fmColorArray[i];

	                // else use the positive number format
	              }
	              else if (i == len - 1 && hasTextCode)
	              {
	                currency = "";
	                valueType = "text";
	                genFlg = true;
	                if (Utils.hasValue(fmColorArray[fcLen - 1]))
	                  appliedfmFontColor = fmColorArray[fcLen - 1];

	              }
	            }
	            
	            if(genFlg){
	                styleElment = createStyleElement(valueType,odfStyle, code, name, currency);
	                
	                OdfStyleTextProperties fontColor = new OdfStyleTextProperties((OdfFileDom) odfStyle.getOwnerDocument());
	                fontColor.setFoColorAttribute(appliedfmFontColor);
	    	            appliedfmFontColor = ""; // clear for next use
	                styleElment.appendChild(fontColor);

	                // set style:map child element for format style
	                if (name.equals(formatStyleName))
	                  formatStyleElement = styleElment;
	                if (styleElment != null)
	                  autoStyles.appendChild(styleElment);
	    	            genFlg = false;
	            }	            
	          }
	          if (len > 1)
	          {
	            if (p)
	            {
	              OdfStyleMap styleMap = new OdfStyleMap((OdfFileDom) odfStyle.getOwnerDocument());
	              styleMap.setStyleApplyStyleNameAttribute(pStyleName1);
	              if (z)
	                styleMap.setStyleConditionAttribute("value()>0");
	              else
	                styleMap.setStyleConditionAttribute("value()>=0");
	              formatStyleElement.appendChild(styleMap);

	              // <0
	              OdfStyleMap styleMap1 = new OdfStyleMap((OdfFileDom) odfStyle.getOwnerDocument());
	              if (n)
	                styleMap1.setStyleApplyStyleNameAttribute(pStyleName2);
	              else
	                styleMap1.setStyleApplyStyleNameAttribute(pStyleName1);
	              styleMap1.setStyleConditionAttribute("value()<0");
	              formatStyleElement.appendChild(styleMap1);

	              if (z)
	              {
	                OdfStyleMap styleMap2 = new OdfStyleMap((OdfFileDom) odfStyle.getOwnerDocument());
	                styleMap2.setStyleApplyStyleNameAttribute(pStyleName3);
	                styleMap2.setStyleConditionAttribute("value()=0");
	                formatStyleElement.appendChild(styleMap2);
	              }
	            }
	            else
	            {
	              OdfStyleMap styleMap = new OdfStyleMap((OdfFileDom) odfStyle.getOwnerDocument());
	              styleMap.setStyleApplyStyleNameAttribute(pStyleName1);
	              styleMap.setStyleConditionAttribute("value()<0");
	              formatStyleElement.appendChild(styleMap);
	              if (z)
	              {
	                OdfStyleMap styleMap1 = new OdfStyleMap((OdfFileDom) odfStyle.getOwnerDocument());
	                styleMap1.setStyleApplyStyleNameAttribute(pStyleName2);
	                styleMap1.setStyleConditionAttribute("value()=0");
	                formatStyleElement.appendChild(styleMap1);
	              }
	            }
	          }
	          formatStyleMap.put(formatStr, formatStyleName);
		  }
      }
	  return formatStyleName;
  }
  
  private static OdfElement createStyleElement(String valueType, OdfStyle odfStyle,String code, String name, String currency)
  {
    OdfElement styleElment = null;
    VALUETYPE type = Utils.getValueType(valueType);
    switch(type)
    {
      case NUMBERS:
        styleElment = new OdfNumberStyle((OdfFileDom) odfStyle.getOwnerDocument(), code, name);
        break; 
      case PERCENT:
        styleElment = new OdfNumberPercentageStyle((OdfFileDom) odfStyle.getOwnerDocument(), code, name);
        break;
      case CURRENCY:
      {
        String symbolChar = Utils.getCurrencySymbol(currency);
        if (symbolChar == null)
          symbolChar = currency;
        if (symbolChar != null && (!code.contains(symbolChar) && !code.contains(currency)))
          code = symbolChar + code;
        styleElment = new OdfNumberCurrencyStyle((OdfFileDom) odfStyle.getOwnerDocument(), symbolChar, code, name);
        break;
      }
      case DATE:
      {
        String dCode = Utils.getDateTimePattern(code, Constant.DATE_TYPE, false);
        if (dCode == null)
          dCode = code;
        dCode = getODFFormat(dCode,Constant.DATE_TYPE);
        // normalize date format code
        styleElment = new OdfNumberDateStyle((OdfFileDom) odfStyle.getOwnerDocument(), dCode, name, null);
        break;
      }
      case TIME:
      {
        String tCode = Utils.getDateTimePattern(code, Constant.TIME_TYPE, false);
        if (tCode == null)
          tCode = code;
        // normalize time format code
        tCode = getODFFormat(tCode, Constant.TIME_TYPE);
        styleElment = new OdfNumberTimeStyle((OdfFileDom) odfStyle.getOwnerDocument(), tCode, name);
        break;
      }
      case BOOLEAN:
      {
        styleElment = new OdfNumberBooleanStyle((OdfFileDom) odfStyle.getOwnerDocument(), code, name);
        break;
      }
      case TEXT:
      {
        styleElment = new OdfNumberTextStyle((OdfFileDom) odfStyle.getOwnerDocument(), code, name);
        break;
      }
      default:
        break;
    }
    return styleElment;
  }  
	 
//y->Y, d->D, E->N,s->S
  private static String getODFFormat(String format, String type){
    if(Constant.DATE_TYPE.equals(type)
        || Constant.TIME_TYPE.equals(type)){
      
      int i=0;
      char ch;
      StringBuffer newFormat = new StringBuffer();
      while (i < format.length()) {
        ch = format.charAt(i);
        switch(ch){
          case 'y':
            newFormat.append("Y");
            break;
          case 'd':
            newFormat.append("D");
            break;
          case 'E':
            newFormat.append("N");
            break;
          case 's':
            newFormat.append("S");
            break;
          case 'h':
            newFormat.append("H");
            break;
          default:
            newFormat.append(ch);
        }
        i++;
      }
      return newFormat.toString();
    }
//      code = code.replaceAll("y", "Y");
//      code = code.replaceAll("d", "D");
//      code = code.replaceAll("E", "N");
    return format;
  }
  
  private static boolean isTextFormat(String formatCode){
    String replaced = formatCode.replaceAll("[\\\\].", "");
    return replaced.indexOf("@") != -1;
  }
  
  // when parse style P, merge separated 4 styles(P,P0,P1,P2) into one "P0;P1;P2;P" 
  private static void add2Map(HashMap<String, ArrayList<StyleMap>> tStyleMap, OdfElement style ,ChartNumberFormat format)
  {
    
    OdfStyleMap styleMap = OdfElement.findFirstChildNode(OdfStyleMap.class, style);
    ArrayList<StyleMap> list = new ArrayList<StyleMap>();
    while(styleMap != null)
    {
      String condition = styleMap.getStyleConditionAttribute();
      if(condition != null)
      {
        condition = condition.trim();
        Matcher m = NumFormatHelper.PATTERN_TOKEN.matcher(condition);
        if(m.matches())
        {
          String op = m.group(2);
          String num = m.group(4);
          String styleName = styleMap.getStyleApplyStyleNameAttribute();
          StyleMap sMap = new StyleMap(op, num, styleName);
          list.add(sMap);
          
        }
      }
      styleMap = OdfElement.findNextChildNode(OdfStyleMap.class, styleMap);
    }
    if(!list.isEmpty())
      tStyleMap.put(style.getAttribute("style:name"), list);
  }
  
  private static void mergeStyle(HashMap<String, ChartNumberFormat> map, ArrayList<StyleMap> list, ChartNumberFormat format)
  {
    Iterator<StyleMap> mapIter = list.iterator();
    
    StringBuffer formatCodeStr = new StringBuffer();
    StringBuffer formatColorStr = new StringBuffer();
    StringBuffer formatCategoryStr = new StringBuffer();
    StringBuffer formatCurrencyStr = new StringBuffer();
    String pCategory = format.getCategory();
    String nCategory = "";
    String zCategory = "";
    String pCode = format.getCode();
    String nCode = "";
    String zCode = "";
    String pCurr = format.getCurrency();
    String nCurr = "";
    String zCurr = "";
    String pColor = format.getFmFontColor();
    String nColor = "";
    String zColor = "";
   
    boolean p = false, n = false, z = false;
    while (mapIter.hasNext()) {                         
        StyleMap sMap = mapIter.next();
        String num = sMap.getValue();
        if ("0".equals(num)) {
            String op = sMap.getOperator();
            String aStyleName = sMap.getMapStyle();
            ChartNumberFormat aFormat = map.remove(aStyleName);
            String aFormatCode = null;
            String aFormatColor = null;
            if (aFormat != null) {
                aFormatCode = aFormat.getCode();
                aFormatColor = aFormat.getFmFontColor() != null ? aFormat.getFmFontColor() : "";
                if (op.equals(">")) {
                    pCode = aFormatCode;
                    pColor = aFormatColor;
                    pCategory = aFormat.getCategory();
                    pCurr = aFormat.getCurrency();
                    p = true;
                } else if (op.equals(">=")) {
                    zCode = pCode = aFormatCode;
                    zColor = pColor = aFormatColor;
                    zCategory = pCategory = aFormat.getCategory();
                    zCurr = pCurr = aFormat.getCurrency();
                    z = p = true;
                } else if (op.equals("<")) {
                    nCode = aFormatCode;
                    nColor = aFormatColor;
                    nCategory = aFormat.getCategory();
                    nCurr = aFormat.getCurrency();
                    n = true;
                } else if (op.equals("<=")) {
                    zCode = nCode = aFormatCode;
                    zColor = nColor = aFormatColor;
                    zCategory = nCategory = aFormat.getCategory();
                    zCurr = nCurr = aFormat.getCurrency();
                    z = n = true;
                } else if (op.equals("=")) {
                    zCode = aFormatCode;
                    zColor = aFormatColor;
                    zCategory = aFormat.getCategory();
                    zCurr = aFormat.getCurrency();
                    z = true;
                } else if (op.equals("<>")) { 
                    pCode = aFormatCode;
                    pColor = aFormatColor;
                    pCategory = aFormat.getCategory();
                    pCurr = aFormat.getCurrency();
                    p = true;
                    if(!n){ //  "n(<);z(=);p(<>);t"
                        nCode = pCode;
                        nColor = pColor;
                        nCategory = pCategory;
                        nCurr = pCurr;
                        n = p;
                    }
                }   
            }
        }
    }
    
    if(p || !"text".equalsIgnoreCase(format.getCategory())){
        formatCodeStr.append(pCode);
        formatColorStr.append(pColor);
        formatCategoryStr.append(pCategory);
        formatCurrencyStr.append(pCurr);
        p = true;
    }
    if(n){ 
        formatCodeStr.append(";" + nCode);
        formatColorStr.append(";" + nColor);
        formatCategoryStr.append(";" + nCategory);
        formatCurrencyStr.append(";" + nCurr);
    }
    else if(p && z && !"text".equalsIgnoreCase(format.getCategory()) ){  // [blue]#.0;[green]#.00 ==> p & n & z   [blue]#.0;[red]@@ ==> p & n & z & t
        formatCodeStr.append(";" + format.getCode());
        formatColorStr.append(";" + format.getFmFontColor());
        formatCategoryStr.append(";" + format.getCategory());
        formatCurrencyStr.append(";" + format.getCurrency());
    }
    else{   //[blue]#.0;[green]@@ ==> p & z & t
        formatCodeStr.append(";");
        formatColorStr.append(";");
        formatCategoryStr.append(";");
        formatCurrencyStr.append(";");
    }
   
    if(z){
        formatCodeStr.append(";" + zCode);
        formatColorStr.append(";" + zColor);
        formatCategoryStr.append(";" + zCategory);
        formatCurrencyStr.append(";" + zCurr);
    }else if(n && !"text".equalsIgnoreCase(format.getCategory())){ // "<0;@"
        formatCodeStr.append(";");
        formatColorStr.append(";");
        formatCategoryStr.append(";");
        formatCurrencyStr.append(";");
    }
    
    if((p && n) || !"text".equalsIgnoreCase(format.getCategory())){ // "n;z;p;t"
        formatCodeStr.append(";" + format.getCode());
        formatColorStr.append(";" + format.getFmFontColor());
        formatCategoryStr.append(";" + format.getCategory());
        formatCurrencyStr.append(";" + format.getCurrency());
    }

    format.setCode(formatCodeStr.toString());
    format.setFmFontColor(formatColorStr.toString());
    format.setCurrency(formatCurrencyStr.toString());
    format.setCategory(formatCategoryStr.toString()); 
    
    
  }

  
//dojo use h/s/a instead of H/S/AM/PM
  private static String getConcordTimeFormat(OdfNumberTimeStyle timeStyle){
    String code = timeStyle.getConcordFormat().toLowerCase();
    code = code.replace("am/pm", "a");
    //"a" does not exist, then change "h" to "H"
    if(code.indexOf("a") == -1)
      code = code.replaceAll("h", "H");
    return code;
  }
  
  private static String normalizeNumber(OdfNumberStyle numberStyle, String code){
    if("0".equals(code)){
      Node m = numberStyle.getFirstChild();
      if (m instanceof OdfNumber) {
          OdfNumber number = OdfElement.findFirstChildNode(OdfNumber.class, numberStyle);
          if(number.getNumberDecimalPlacesAttribute() == null)
              code = "";
      }
    }
    return code;
  }
  
  private static String getCurrencyCode(OdfNumberCurrencyStyle currencyStyle)
  {
    String currCode = "USD";
    String lang = "";
    String country = "";

    String styleLang = currencyStyle.getAttribute("number:language");
    String styleCoun = currencyStyle.getAttribute("number:country");
    String styleCode = "";
    OdfNumberCurrencySymbol currSym = currencyStyle.getCurrencySymbolElement();
    if (currSym != null)
    {
      lang = currSym.getNumberLanguageAttribute();
      country = currSym.getNumberCountryAttribute();
      styleCode = currSym.getTextContent();// .getAttribute(ConversionConstant.STYLE_NUMBERFORMAT);
    }

    // Currency symbol has the higher priority if "styleLang-styleCoun" and "lang-country" both not null.
    // special case for general EUR currency: "[$€-2] #,##0.00", "#,##0.00 [$€-1]", "#,##0.00 [$€]" and "[$€] #,##0.00"
    if (lang != null && country != null)
      currCode = NumFormatHelper.getCurrencyCode(lang, country);
    else if (styleLang != "" || styleCoun != "")
      currCode = NumFormatHelper.getCurrencyCode(styleLang, styleCoun);
    else
    {
      if (styleCode.indexOf("\u20ac") >= 0)
        currCode = "EUR";
    }
    return currCode;
  }
  
  public static String getCurrencyCode(String lang, String country)
  {
    String langCoun = "";
    if (lang == null && country == null)
      return null;
    lang = (lang != null) ? lang : "";
    country = (country != null) ? "-" + country : "";
    langCoun = lang + country;
    for (int i = 0; i < NumFormatHelper.CURRENCY_CODE_BY_LANGUAGE_COUNTRY.length; ++i)
    {
      String cl[] = NumFormatHelper.CURRENCY_CODE_BY_LANGUAGE_COUNTRY[i];
      if (langCoun.equalsIgnoreCase(cl[1]))
        return cl[0];
    }
    return null;
  }
  
  final public static String[][] CURRENCY_CODE_BY_LANGUAGE_COUNTRY = {
    {"AUD", "en-AU"},
    {"BRL", "pt-BR"},
    {"CHF", "fr-CH"},
    {"CNY", "zh-CN"},   
    {"TWD", "zh-TW"},
    {"HKD", "zh-HK"},
    {"DEM", "de-DE"},
    {"DKK", "da-DK"},
    {"FRF", "fr-FR"},
    {"GBP", "en-GB"},
    {"ITL", "it-IT"}, 
    {"JPY", "ja-JP"},
    {"KRW", "ko-KR"}, 
    {"NLG", "nl-NL"},
    {"RUB", "ru-RU"}, 
    {"SEK", "sv-SE"}, 
    {"THB", "th-TH"}, 
    {"TRY", "tr-TR"}, 
    {"USD", "en-US"},
    {"ZAR", "en-ZA"}
  };
}
