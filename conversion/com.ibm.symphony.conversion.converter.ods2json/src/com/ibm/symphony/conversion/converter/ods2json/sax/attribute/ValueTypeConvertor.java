/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.attribute;

import java.text.DecimalFormat;
import java.text.ParseException;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import com.ibm.symphony.conversion.converter.ods2json.sax.ContextInfo;
import com.ibm.symphony.conversion.converter.ods2json.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.GeneralContext;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.CellStyleType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;

public class ValueTypeConvertor extends GeneralAttributeConvertor
{
  public ValueTypeConvertor(String attrName)
  {
    super(attrName);
  }

  private static final String CLAZZ = ValueTypeConvertor.class.getName();
  private static final Logger LOG = Logger.getLogger(CLAZZ);

  private static final DecimalFormat decimalFormat = new DecimalFormat("#.###############");
  private static enum VALUETYPE {
    BOOLEAN, STRING, CURRENCY, DATE, TIME, PERCENTAGE, FLOAT;
  }
  
  private static String[] valueTypeArray = 
  {
    ConversionConstant.BOOLEAN_TYPE,
    ConversionConstant.STRING_TYPE,
    ConversionConstant.CURRENCY_TYPE,
    ConversionConstant.DATE_TYPE,
    ConversionConstant.TIME_TYPE,
    ConversionConstant.PERCENTAGE_TYPE,
    ConversionConstant.FLOAT_TYPE,
  };
  
  private static HashMap<String, VALUETYPE> valueTypes = new HashMap<String, VALUETYPE>();
  
  static
  {
    int length = valueTypeArray.length;
    
    for(int i = 0 ;i < length; i++)
    {
      VALUETYPE type = VALUETYPE.values()[i];
      valueTypes.put(valueTypeArray[i], type);
    }
  }
  
  public String convert(ConversionContext context, GeneralContext convertor, Object target)
  {
    String valueType = convertor.getAttrValue(mAttrName);
    ConversionUtil.Cell cell = (ConversionUtil.Cell) convertor.getTarget();
    String cellStyleId = cell.styleId;
    HashMap<String, CellStyleType> cellCurrencyMap = (HashMap<String, CellStyleType>) context.get("cellCurrencyMap");
    
    boolean bFormula = (cell.type & ConversionConstant.FORMULA_TYPE_MASK) > 0;
    Object typeValue = null;
    Object calculatevalue = null;
    Object value = cell.value;
    VALUETYPE vType = valueTypes.get(valueType);
    if(vType == null)
      vType = VALUETYPE.STRING;
    int type = ConversionConstant.CELL_TYPE_UNKNOWN;
   
    switch (vType)
      {
        case BOOLEAN :
        {
          // typeValue = odfCell.getBooleanValue().toString();
          String boolValue = convertor.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_OFFICE_BOOLEAN_VALUE);
          if (ConversionUtil.hasValue(boolValue))
          {
            if (boolValue.equalsIgnoreCase("true"))
              typeValue = 1;
            else if (boolValue.equalsIgnoreCase("false"))
              typeValue = 0;
          }else{
            // compatible with old version of IBM Docs json2ods which export office:value rather than office:boolean-value
            boolValue = convertor.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE);
            if(boolValue.equals("0"))
              typeValue = 0;
            else
              typeValue = 1;
          }
          type = ConversionConstant.CELL_TYPE_BOOLEAN;
          break;
        }
        case STRING :
        {
          String v = convertor.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_OFFICE_STRING_VALUE);
          if(v != null)
            typeValue = v;
          else
            typeValue = cell.showValue;
          //replace value using typevalue then unescape the single quote
          if (!bFormula && ConversionUtil.hasValue(typeValue))
          {
            String hasPrefix = convertor.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_PREFIX);
            if("true".equals(hasPrefix))
            {
              typeValue = "'" + typeValue;
            }else
            {
              // compatible for old version symphony which does not have "office:prefix" attribute
              // unescape the single quote
              String strValue = typeValue.toString();
              Matcher m = ConversionConstant.doublePattern.matcher(strValue);
              if (m.matches() || (strValue.length() > 0 && strValue.startsWith("'"))
                  || (ConversionUtil.isFormulaString(strValue) && !bFormula))
              {
                typeValue = "'" + strValue;
              }
            }
          }
          type = ConversionConstant.CELL_TYPE_STRING;
          break;
        }
        case CURRENCY :
        {
          typeValue = convertor.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE);
          String symbol = convertor.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_OFFICE_CURRENCY);
          if (symbol != null)
          {
            String styleId = cellStyleId;
            if(!ConversionUtil.hasValue(styleId)){
              Sheet sheet = (Sheet) context.get("Sheet");
              ContextInfo info = (ContextInfo)context.get("TableInfo");
              int cellColumnIndex = info.cellColumnIndex;
              styleId = ODSConvertUtil.getColumnStyleId(context, sheet, cellColumnIndex);
            }
            ConversionUtil.CellStyleType styleType = cellCurrencyMap.get(cellStyleId);
            if (styleType != null)
              styleType.formatCurrency = symbol;
          }
          if(ConversionUtil.hasValue(typeValue)){
            type = ConversionConstant.CELL_TYPE_NUMBER;
          }
          break;
        }
        case DATE :
        {
          typeValue = convertor.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_OFFICE_DATE_VALUE);
          if(ConversionUtil.hasValue(typeValue)){
        	ConversionUtil.Document document = (ConversionUtil.Document) context.get("Target");
        	typeValue = handleDateValue(typeValue.toString(), document.isDate1904);
            type = ConversionConstant.CELL_TYPE_NUMBER;
          }
          break;
        }
        case TIME :
        {
          typeValue = convertor.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_OFFICE_TIME_VALUE);
          if(ConversionUtil.hasValue(typeValue)){
            typeValue = handleTimeValue(typeValue.toString());
            type = ConversionConstant.CELL_TYPE_NUMBER;
          }
          break;
        }
        case PERCENTAGE :
        {
          // typeValue = Double.toString(odfCell.getPercentageValue());
          typeValue = convertor.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE);
          if(ConversionUtil.hasValue(typeValue)){
            type = ConversionConstant.CELL_TYPE_NUMBER;
          }
          break;
        }
        case FLOAT :
        {
          typeValue = convertor.getAttrValue(ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE);
          if(ConversionUtil.hasValue(typeValue)){
            type = ConversionConstant.CELL_TYPE_NUMBER;
          }
          break;
        }
      }

    if (typeValue != null)
    {
      if( type == ConversionConstant.CELL_TYPE_NUMBER && typeValue instanceof String)
      {
        try
        {
          String strValue = typeValue.toString();
          if(strValue.indexOf("E") == -1 && strValue.indexOf(".") == -1)
              typeValue = Long.parseLong(strValue);
          else
            typeValue = Double.parseDouble(strValue);
        }catch(NumberFormatException e)
        {
          LOG.log(Level.WARNING, "can not parse number for cell whose value is {0}", typeValue);
        }
      }
      if (bFormula)
      {
        calculatevalue = typeValue;
        // the calculate value of formula cell is the same as cell value
        // it means that it has not been calculated by IBM Docs
        if(cell.value.equals(calculatevalue))
        {
          calculatevalue = null;
          type = ConversionConstant.CELL_TYPE_UNKNOWN;
        }
      }else
        value = typeValue;
    }

    cell.value = value;
    cell.calculateValue = calculatevalue;
    cell.type |= (type << 3);
    return null;
  }

  private Object handleTimeValue(String val)
  {
    Object typeValue = val;
    try
    {
      typeValue = Integer.parseInt(val);
      return typeValue;
    }
    catch (NumberFormatException nfe)
    {
      try
      {
        Matcher m = ODSConvertUtil.PATTERN_ODF_TIME.matcher(val);
        if (m.matches())
        {
          String sign = m.group(1);
          String hour = m.group(2);
          long lHour = Long.parseLong(hour);
          String min = m.group(6);
          String sec = m.group(10);
          hour = String.valueOf(lHour % 24);
          StringBuffer timeBuf = new StringBuffer();
          timeBuf.append(hour);
          timeBuf.append(":");
          timeBuf.append(min);
          timeBuf.append(":");
          timeBuf.append(sec);
          Date date = new SimpleDateFormat("HH':'mm':'ss").parse(timeBuf.toString());
          double day = lHour / 24;
          Date startDate = new Date("1/1/1970");
          double time = (date.getTime() - startDate.getTime()) / 86400000.0;
          typeValue = Double.parseDouble(sign + decimalFormat.format(day + time));//only preserve maximum 15 decimal places 
        }
      }
      catch (ParseException pe)
      {
        LOG.log(Level.WARNING, "can not parse time format:" + typeValue, pe);
      }
      finally
      {
        return typeValue;
      }
    }
  }

  private Object handleDateValue(String val, boolean isDate1904)
  {
	String sDate = isDate1904 ? "1/1/1904" : "12/30/1899";
    Object typeValue = val;
    try
    {
      typeValue = Integer.parseInt(val);
      return typeValue;
    }
    catch (NumberFormatException nfe)
    {
      try
      {
        Date startDate = new Date(sDate);
        String[] times = val.split("T");
        Date date = new SimpleDateFormat("yyyy-MM-dd").parse(val);
        long dDay = Math.round((date.getTime() - startDate.getTime()) / 86400000.0);// Date long
        if (times.length > 1)
        {
          date = new SimpleDateFormat("HH':'mm':'ss").parse(times[1]);
          startDate = new Date("1/1/1970");
          double time = (date.getTime() - startDate.getTime()) / 86400000.0;
          typeValue = dDay + time;
        }
        else
          typeValue = dDay;
      }
      catch (ParseException pe)
      {
        LOG.log(Level.WARNING, "can not parse date format:" + typeValue);
      }
      finally
      {
        return typeValue;
      }
    }
  }
}
