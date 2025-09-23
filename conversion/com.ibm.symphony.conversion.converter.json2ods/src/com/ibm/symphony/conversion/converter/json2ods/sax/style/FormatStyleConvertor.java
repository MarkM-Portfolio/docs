/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.style;

import java.util.HashMap;
import java.util.Locale;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.number.OdfNumberBooleanStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberCurrencyStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberDateStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberPercentageStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberTextStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberTimeStyle;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleMap;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.OdfNamespaceNames;

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.XMLUtil;
import com.ibm.symphony.conversion.spreadsheet.XMLUtil.VALUETYPE;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

import com.ibm.icu.text.*;

public class FormatStyleConvertor
{
  private static final Logger LOG = Logger.getLogger(FormatStyleConvertor.class.getName());
  
  @SuppressWarnings("unchecked")
  public void convertStyle(ConversionContext context,OdfStyle odfCellStyle, ConversionUtil.NumberFormat format)
  {
    HashMap<String, String> cellFormatStyleMap = (HashMap<String, String>) context.get("cellFormatStyleMap");
    OdfFileDom contentDom = (OdfFileDom)context.get("Target");
    try
    {
      String formatCode = format.getCode();
      //String valueType = format.getCategory();
      if (ConversionUtil.hasValue(formatCode))
      {
        String formatStyleName = "";
        String formatStr = format.toString();
        if (cellFormatStyleMap.containsKey(formatStr))
          formatStyleName = cellFormatStyleMap.get(formatStr);
        else
        {
          formatStyleName = ODSConvertUtil.getStyleName(null, ConversionConstant.FORMATID);
          StringBuffer fmc = new StringBuffer(format.getFmFontColor());
          StringBuffer fmcate = new StringBuffer(format.getCategory());
          StringBuffer fvcur = new StringBuffer(format.getCurrency());
          StringBuffer fmcode = new StringBuffer(formatCode);
          
          if(formatCode.split(";", 4).length == 1 && VALUETYPE.CURRENCY == XMLUtil.getValueType(format.getCategory()))
        	  normalizeByCurrency(fmc, fmcate, fvcur, fmcode);
          
          String[] fmColorArray = fmc.toString().split(";", 4);
          String[] categoryArray = fmcate.toString().split(";", 4);
          String[] curArray = fvcur.toString().split(";", 4);
          String[] codes = fmcode.toString().split(";", 4);
          
          String valueType = categoryArray[0];
          String appliedfmFontColor = fmColorArray[0];
          String currency = curArray[0];
          String pStyleName1 = formatStyleName + "P0";
          String pStyleName2 = formatStyleName + "P1";
          String pStyleName3 = formatStyleName + "P2";
          int fcLen = fmColorArray.length;
          int lenCate = categoryArray.length;
          int lenCur = curArray.length;
          int len = codes.length;
          
          boolean p = false;
          boolean n = false;
          boolean z = false;
          boolean hasTextCode = this.isTextFormat(codes[len - 1]);
          OdfElement formatStyleElement = null;
          boolean genFlg = true;
          OdfOfficeAutomaticStyles autoStyles = null;
          try
          {
            autoStyles = contentDom.getAutomaticStyles();
          }
          catch (Exception e)
          {
          }
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
              else if (i == 1 && !(this.isTextFormat(code)))
              {
                if (hasTextCode)
                  name = pStyleName2;
                else
                  name = pStyleName1;
                genFlg = n = true;
                if (lenCur > i && ConversionUtil.hasValue(curArray[i]))
                  currency = curArray[i];
                if (lenCate > i && ConversionUtil.hasValue(categoryArray[i]))
                  valueType = categoryArray[i];
                if (fcLen > i && ConversionUtil.hasValue(fmColorArray[i]))
                  appliedfmFontColor = fmColorArray[i];

                // else use the positive number format
              }
              else if (i == 2 && !(this.isTextFormat(code)))
              {
                if (hasTextCode)
                  name = pStyleName3;
                else
                  name = pStyleName2;
                genFlg = z = true;
                if (lenCur > i && ConversionUtil.hasValue(curArray[i]))
                    currency = curArray[i];
                if (lenCate > i && ConversionUtil.hasValue(categoryArray[i]))
                    valueType = categoryArray[i];
                if (fcLen > i && ConversionUtil.hasValue(fmColorArray[i]))
                    appliedfmFontColor = fmColorArray[i];

                // else use the positive number format
              }
              else if (i == len - 1 && hasTextCode)
              {
                currency = "";
                valueType = "text";
                genFlg = true;
                if (ConversionUtil.hasValue(fmColorArray[fcLen - 1]))
                  appliedfmFontColor = fmColorArray[fcLen - 1];

              }
            }
            if(genFlg){
            String	locale = "en_US";
            styleElment = createStyleElement(valueType,odfCellStyle, code, name, currency, locale.replace("-", "_"));

            OdfStyleTextProperties fontColor = new OdfStyleTextProperties((OdfFileDom) odfCellStyle.getOwnerDocument());
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
              OdfStyleMap styleMap = new OdfStyleMap((OdfFileDom) odfCellStyle.getOwnerDocument());
              styleMap.setStyleApplyStyleNameAttribute(pStyleName1);
              if (z)
                styleMap.setStyleConditionAttribute("value()>0");
              else
                styleMap.setStyleConditionAttribute("value()>=0");
              formatStyleElement.appendChild(styleMap);

              // <0
              OdfStyleMap styleMap1 = new OdfStyleMap((OdfFileDom) odfCellStyle.getOwnerDocument());
              if (n)
                styleMap1.setStyleApplyStyleNameAttribute(pStyleName2);
              else
                styleMap1.setStyleApplyStyleNameAttribute(pStyleName1);
              styleMap1.setStyleConditionAttribute("value()<0");
              formatStyleElement.appendChild(styleMap1);

              if (z)
              {
                OdfStyleMap styleMap2 = new OdfStyleMap((OdfFileDom) odfCellStyle.getOwnerDocument());
                styleMap2.setStyleApplyStyleNameAttribute(pStyleName3);
                styleMap2.setStyleConditionAttribute("value()=0");
                formatStyleElement.appendChild(styleMap2);
              }
            }
            else
            {
              OdfStyleMap styleMap = new OdfStyleMap((OdfFileDom) odfCellStyle.getOwnerDocument());
              styleMap.setStyleApplyStyleNameAttribute(pStyleName1);
              styleMap.setStyleConditionAttribute("value()<0");
              formatStyleElement.appendChild(styleMap);
              if (z)
              {
                OdfStyleMap styleMap1 = new OdfStyleMap((OdfFileDom) odfCellStyle.getOwnerDocument());
                styleMap1.setStyleApplyStyleNameAttribute(pStyleName2);
                styleMap1.setStyleConditionAttribute("value()=0");
                formatStyleElement.appendChild(styleMap1);
              }
            }
          }
//          cellFormatStyleMap.put(formatStr, formatStyleName);
        }
        odfCellStyle.setStyleDataStyleNameAttribute(formatStyleName);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "can not export number format for code" + format.toString(), e);
    }
  }
  
  /**
   * Formatting from Web client only has one format code(for positive value), 
   * need to append format code for negative value to make the formatting result correct after export to ods.
   * e.g.
   *  nl-nl, currency format pattern = "#,##0.00;#,##0.00-"
   *  ja-jp, currency format pattern = "#,##0.00;-Â¥ #,##0.00"
   * @param fmColorArray
   * @param categoryArray
   * @param curArray
   * @param codes
   * @param currency
   */
  private void normalizeByCurrency(StringBuffer fmColorArray, StringBuffer categoryArray, StringBuffer curArray, StringBuffer codes)
  {
      String currency = curArray.toString();
	  
	  String curLang = ConversionUtil.getCurrencyLanguage(currency);
	  String curCountry = curLang;
	  String codeStr = codes.toString();
	  if(null != curLang)
      	curCountry = ConversionUtil.getCurrencyCountry(currency);
	  
	  String symbolChar = ConversionUtil.getCurrencySymbol(currency);
	  curLang = (curLang == null) ? "en" : curLang;
	  curCountry = (curCountry == null) ? "US" : curCountry;
	  
	  DecimalFormat df = (DecimalFormat)NumberFormat.getCurrencyInstance(new Locale(curLang, curCountry));
	  String nPrefix = df.getNegativePrefix();
	  String nSuffix = df.getNegativeSuffix();
	  
	  if(symbolChar == null)
	    symbolChar = df.getCurrency().getSymbol();
      if( !(nPrefix != null && nPrefix.contains(symbolChar))
            && !(nSuffix != null && nSuffix.contains(symbolChar)))
      {
        nPrefix = "(" + symbolChar;
        nSuffix = ")";
      }
	  
	 if(currency.equalsIgnoreCase("EUR")){
		  //	"#,##0.00 [$€-1]" ==> "#,##0.00 [$€-1];-#,##0.00 [$€-1]"; 
		  //	"[$€-2] #,##0.00" ==> "[$€-2] #,##0.00;-[$€-2] #,##0.00"  
		  codes.append(";-" + codeStr);
	  }
	 else{
		 String nCode = codeStr.replace(symbolChar, "");
		 codes.append(";" + nPrefix + nCode + nSuffix);
	 }
	 
	  fmColorArray.append(";" + fmColorArray.toString());
	  categoryArray.append(";" + categoryArray.toString());
	  curArray.append(";" + curArray.toString());
  }
  
  private OdfElement createStyleElement(String valueType, OdfStyle odfCellStyle,String code, String name, String currency,String locale)
  {
    OdfElement styleElment = null;
    VALUETYPE type = XMLUtil.getValueType(valueType);
    switch(type)
    {
      case NUMBERS:
      case FRACTION:
      case SCIENTIFIC:
        styleElment = new OdfNumberStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), code, name);
        if(ConversionUtil.hasValue(code) && code.indexOf("#") == -1 && code.indexOf("0") == -1)
          styleElment.setAttributeNS(OdfNamespaceNames.STYLE.getUri(), "style:numberformat-string", "\"" + code + "\"");
        break; 
      case PERCENT:
        styleElment = new OdfNumberPercentageStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), code, name);
        break;
      case CURRENCY:
      {
        String symbolChar = ConversionUtil.getCurrencySymbol(currency);
        String curLang = ConversionUtil.getCurrencyLanguage(currency);
        String curCountry = curLang;
        String prefix = "";
        String suffix = "";
//        String oldCode = code;
        boolean isGeneralEuroCurrency = false; 
        
        if (symbolChar == null)
        	symbolChar = currency;
        DecimalFormat df = null;
        if(null != curLang){
        	curCountry = ConversionUtil.getCurrencyCountry(currency);
        	isGeneralEuroCurrency = (curLang.equals("") || curCountry.equals("")) && currency.equalsIgnoreCase("EUR");
        	//using Germany currency format as the default format for general EUR("#,##0.00_- [$€-1]" or "[$€-2] #,##0.00")
        	if(isGeneralEuroCurrency){
        		df = (DecimalFormat)NumberFormat.getCurrencyInstance(new Locale("de", "DE"));
        		String reg = "\\[\\u0024\\u20ac-(1|2)\\]";
        		Matcher m = Pattern.compile(reg).matcher(code);
        		code = m.replaceAll(symbolChar);
        	}
        	else
        		df = (DecimalFormat)NumberFormat.getCurrencyInstance(new Locale(curLang, curCountry));
	        prefix = df.getPositivePrefix();
	        suffix = df.getPositiveSuffix();
        }
        
        //ICU returns "\uffe5" for both CNY and JPY, 
        //but in ods: "\uffe5" for CNY and "\u00a5" for JPY.
        //and in xls: "\u00a5" for both CNY and JPY.
        //So, replace "\uffe5" with "\u00a5" for JPY and CNY
        if(curLang != null && (curLang.equalsIgnoreCase("ja") || curLang.equalsIgnoreCase("zh"))){
          if(code.contains("\uffe5")){
        	code = code.replace("\uffe5", "\u00a5");
        	prefix = "\u00a5";
          }
        }
        //ICU returns "TRY" for TR, but in ods and xls, they use "#.##0,00[$TL-41F]"
        else if(curLang != null && curLang.equalsIgnoreCase("tr")){
        	code = code.replace("TRY", "TL");
        	suffix = " TL";
        }
        //ICU retruns "sFr." for fr_CH, but xls takes "fr."
        else if("fr".equalsIgnoreCase(curLang) && "CH".equalsIgnoreCase(curCountry))
        {
          if(code.indexOf("sFr.") >= 0)
            code = code.replaceAll("fr.", "");
          code = code.replace("fr.", "sFr.");
        }
        
        // when use OdfNumberCurrencyStyle build odf currency style element
        // code should contains symbolChar if symbolChar is not empty
        // or if currency is empty, should set symbolChar as the default en-US symbol
        if(!ConversionUtil.hasValue(currency))
        {
          if(!ConversionUtil.hasValue(symbolChar))
          {
            if(df == null)
              df = (DecimalFormat)NumberFormat.getCurrencyInstance(new Locale("en", "US"));
            symbolChar  = df.getCurrency().getSymbol();
          }
          
        } else{
          // Such as currency is "HKD", code is "HKD #,##0", while symbol char is "$" which is got from currency, 
          // We should use currency as the currency symbol char
          if(code.contains(currency))
            symbolChar = currency;
        }
        
        if (symbolChar != null && (!code.contains(symbolChar) && 
            ( (!code.contains(prefix) && ConversionUtil.hasValue(prefix))  || !ConversionUtil.hasValue(prefix)) )){
            //append symbolChar if code does not contain symbolChar
            if(ConversionUtil.hasValue(suffix) && suffix.contains(symbolChar))
                code = code + suffix;
            else
                code = symbolChar + code;
        }
        styleElment = new OdfNumberCurrencyStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), symbolChar, code, name, curLang, curCountry);
        break;
      }
      case DATE:
      {
    	String dCode = "";
		int dateType = ConversionUtil.getDateTimeType(code.toLowerCase());
		if(dateType < 0){
			dCode = ConversionUtil.getDateTimePattern(code, ConversionConstant.DATE_TYPE, locale, false);
		}else if(dateType >= 4){
			dateType = (dateType == 4) ? DateFormat.SHORT : DateFormat.LONG;
			SimpleDateFormat dtf = (SimpleDateFormat)DateFormat.getDateTimeInstance(dateType, dateType, new Locale(locale));
			dCode = dtf.toPattern();
		}else{
			SimpleDateFormat df = (SimpleDateFormat)DateFormat.getDateInstance(dateType, new Locale(locale));
			dCode = df.toPattern();
		}
		
		//ICU result update: for fr(except fr_CA): date-medium
		if((locale.indexOf("fr") >= 0) && !locale.equalsIgnoreCase("fr_ca") && dateType == 2)
			dCode = dCode.replace("yy", "yyyy");
		
		//ICU result update: for ja: date-short && date-medium
		if((locale.indexOf("ja") >= 0) && (dateType == 2 || dateType == 3))
			dCode = dCode.replace("yy", "yyyy");
		
        if (dCode == null)
          dCode = code;
        dCode = getODFFormat(dCode, ConversionConstant.DATE_TYPE);
        // normalize date format code
        styleElment = new OdfNumberDateStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), dCode, name, null);
        break;
      }
      case TIME:
      {
        String tCode = "";
        int timeType = ConversionUtil.getDateTimeType(code.toLowerCase());
        if(timeType < 0){
        	tCode = ConversionUtil.getDateTimePattern(code, ConversionConstant.TIME_TYPE, locale, false);
        }else{
        	SimpleDateFormat tf = (SimpleDateFormat)DateFormat.getTimeInstance(timeType, new Locale(locale));
			tCode = tf.toPattern();
        }
        
        if (tCode == null)
          tCode = code;
        // normalize time format code
        tCode = getODFFormat(tCode, ConversionConstant.TIME_TYPE);
        String fCode = tCode.replaceAll("(\\[([H|h]+)\\])", "$2");
        styleElment = new OdfNumberTimeStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), fCode, name);
        if(!tCode.equals(fCode))
        	styleElment.setAttributeNS(OdfNamespaceNames.NUMBER.getUri(), ConversionConstant.NUMBER_TRUNCATE_OVERFLOW, "false");
        break;
      }
      case BOOLEAN:
      {
        styleElment = new OdfNumberBooleanStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), code, name);
        break;
      }
      case TEXT:
      {
        styleElment = new OdfNumberTextStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), code, name);
        break;
      }
      default:
        break;
    }
    return styleElment;
  }

  //y->Y, d->D, E->N,s->S
  private String getODFFormat(String format, String type){
    if(ConversionConstant.DATE_TYPE.equals(type)
        || ConversionConstant.TIME_TYPE.equals(type)){
      
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
  
  private boolean isTextFormat(String formatCode){
    String replaced = formatCode.replaceAll("[\\\\].", "");
    return replaced.indexOf("@") != -1;
  }
}
