/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.attribute;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.dom.attribute.office.OfficeValueTypeAttribute;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.XMLUtil;
import com.ibm.symphony.conversion.spreadsheet.XMLUtil.VALUETYPE;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;

public class ValueTypeConvertor
{
  private static final Logger LOG = Logger.getLogger(ValueTypeConvertor.class.getName());

//set cell.type, if cellStyle is boolean, do not need set cell style , but need set true as text:p
  // how about '123, test calc value is true, True
  public void convert(ConversionContext context,AttributesImpl attrs,Object value,ConversionUtil.CellStyleType cellStyle, ConversionUtil.Cell cell)
  {
    String valueType = null;
    String strValue = value.toString();

    int cellType = cell.type;
    // get the value type from cell type
    int type = cellType >> 3;
    switch (type)
      {
        case ConversionConstant.CELL_TYPE_BOOLEAN :
          valueType = ConversionConstant.BOOLEAN_TYPE;
          break;
        case ConversionConstant.CELL_TYPE_ERROR :
          //option 1: set it as Symphony style, but when export xls, the error code can not be exported correctly
          // such as for "of:#N/A" it will be "="#N"/A" in excel
          // if formula return value is error, then always set value type as float and value as 0
          strValue = "0";
          // if it is not formula, such as user input error string directly, we should set it as formula without "="
          // otherwise Symphony will show it as "0"
          String f = cell.value.toString();
          if (!ConversionUtil.isFormulaString(f))
            attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_TABLE_FORMULA, "", "of:" + f);
          // do not need break here
          // option 2: just set it as string, but when export to xls, it show as string, you can reenter it to correct it
//          valueType = ConversionConstant.STRING_TYPE;
//          break;
        case ConversionConstant.CELL_TYPE_NUMBER :
          valueType = ConversionConstant.NUMBERS_TYPE;
          if (cellStyle != null && ConversionUtil.hasValue(cellStyle.formatCategory))
          {
            if (ConversionConstant.doublePattern.matcher(strValue).matches() && !Double.isInfinite(Double.parseDouble(strValue)))
            {
              valueType = getCurrencyPropertyByValue(strValue, cellStyle.formatCategory, false);
            }
            else
              valueType = ConversionConstant.STRING_TYPE;
          }
          break;
        case ConversionConstant.CELL_TYPE_STRING :
          valueType = ConversionConstant.STRING_TYPE;
          break;
        default:// ConversionConstant.CELL_TYPE_UNKNOWN
          // guess the value type from the cell value
          if (cellStyle != null && ConversionUtil.hasValue(cellStyle.formatCategory))
          {
            if (ConversionConstant.doublePattern.matcher(strValue).matches() && !Double.isInfinite(Double.parseDouble(strValue)))
            {
              valueType = getCurrencyPropertyByValue(strValue, cellStyle.formatCategory, false);
            }
            else
              valueType = ConversionConstant.STRING_TYPE;
          }
          else
          {
            if (ConversionConstant.doublePattern.matcher(strValue).matches() && !Double.isInfinite(Double.parseDouble(strValue)))
              valueType = ConversionConstant.NUMBERS_TYPE;
            else if (ConversionConstant.percentPattern.matcher(strValue).matches())
              valueType = ConversionConstant.PERCENTS_TYPE;
            else if (ConversionConstant.booleanPattern.matcher(strValue).matches())
              valueType = ConversionConstant.BOOLEAN_TYPE;
          }
          break;
      }
    
    if (!ConversionUtil.hasValue(valueType))
      valueType = ConversionConstant.STRING_TYPE;

    boolean bPrefixStyle = false;
    if (ConversionUtil.hasValue(strValue) && strValue.startsWith("'"))
    {
      valueType = ConversionConstant.STRING_TYPE;
      bPrefixStyle = true;
    }

    // set value type and value for odfCell
    VALUETYPE enumValType = XMLUtil.getValueType(valueType);
    if (enumValType == null)
      enumValType = VALUETYPE.STRING;
    switch (enumValType)
      {
        case NUMBERS :
        case FRACTION :
        case SCIENTIFIC :
        case TEXT :
        {
          attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_TYPE, "",
              OfficeValueTypeAttribute.Value.FLOAT.toString());
          attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE, "", strValue);
          break;
        }
        case PERCENT :
        {
          attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_TYPE, "",
              OfficeValueTypeAttribute.Value.PERCENTAGE.toString());
          attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE, "", strValue);
          break;
        }
        case DATE :
        {
          Document document = (Document) context.get("Source");
          handleDateType(attrs, strValue, document.isDate1904);
          break;
        }
        case TIME :
        {
          handleTimeType(attrs, strValue);
          break;
        }
        case CURRENCY :
        {
          attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_TYPE, "",
              OfficeValueTypeAttribute.Value.CURRENCY.toString());
          attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE, "", strValue);
          String currency = getCurrencyPropertyByValue(strValue, cellStyle.formatCurrency, true);
          if (ConversionUtil.hasValue(currency))
            attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_CURRENCY, "", currency);
          break;
        }
        case BOOLEAN :
        {
          attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_TYPE, "",
              OfficeValueTypeAttribute.Value.BOOLEAN.toString());
          if (strValue.equals("0"))
            strValue = "false";
          else
            strValue = "true";
          attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_BOOLEAN_VALUE, "", strValue);
          break;
        }
        case STRING :
        default:
        {
          attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_TYPE, "",
              OfficeValueTypeAttribute.Value.STRING.toString());
          if (bPrefixStyle)
            attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_PREFIX, "", "true");
          break;
        }
      }
  }
  
  /**
   * Get currency category or code by value.
   * @param value
   * @param currencys
   * @param getCurrencyCode
   * @return
   */
  private String getCurrencyPropertyByValue(String value, String currencys, boolean getCurrencyCode)
  {
	  double valueD = Double.NaN;
      String[] currList = currencys.split(";", 4);
      String curr = currList[0];
      try{
		valueD = Double.parseDouble(value);
		
		if(valueD < 0 && currList.length >=2 && ConversionUtil.hasValue(currList[1])) 
			curr = currList[1];
		else if(valueD == 0 && currList.length >=3 && ConversionUtil.hasValue(currList[2])) 
			curr = currList[2];
		
      }catch(Exception e){
		if(currList.length == 4 && ConversionUtil.hasValue(currList[3]))
			curr = currList[3];
      }
      
      if(getCurrencyCode)
    	  curr = ConversionUtil.getOfficeCurrency(curr);
      return curr;
  }
  
  private void handleDateType(AttributesImpl attrs,String value, boolean isDate1904)
  {
    attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_TYPE, "", OfficeValueTypeAttribute.Value.DATE.toString());
    // format int value with yyyy-MM-dd format
    // java.util.Date start from 1970-1-1
    // while Symphony Date start from 1989-12-31
    if (ConversionConstant.doublePattern.matcher(value).matches())
    {
      Date startDate = new Date("12/30/1899");
      double dValue = Double.parseDouble(value);
      long day = (long)dValue;
      if (isDate1904) {
     	 day += 1462;  // delta value of 1/1/1904
      }
      long time = (long)(startDate.getTime() +day * 86400000);
      StringBuffer timeBuf = new StringBuffer();
      timeBuf.append(new SimpleDateFormat("yyyy-MM-dd").format(new Date(time)));
      double dDay = dValue - day;
      if(dDay != 0.0){
        Date startDate1 = new Date("1/1/1970");
        time = Math.round(dDay*86400000 + startDate1.getTime());
        Date date = new Date(time);
        timeBuf.append(new SimpleDateFormat("'T'HH':'mm':'ss").format(new Date(time)));
      }
      value = timeBuf.toString();
      attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_DATE_VALUE, "", value);
    }
  }
  
  private void handleTimeType(AttributesImpl attrs,String value)
  {
    attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_TYPE, "", OfficeValueTypeAttribute.Value.TIME.toString());
    // format value with HH:mm:SS
    if (ConversionConstant.doublePattern.matcher(value).matches())
    {
      Date startDate = new Date("1/1/1970");
      double dValue = Double.parseDouble(value);
      long day = (long)dValue;
      double dDay = dValue - day;
      long time = Math.round(dDay*86400000 + startDate.getTime());
      Date date = new Date(time);
      int hour = date.getHours();
      int min = date.getMinutes();
      int sec = date.getSeconds();
      long lHour = day*24 + hour;
      StringBuffer timeBuf = new StringBuffer();
      if(lHour < 0)
        timeBuf.append("-");
      timeBuf.append("PT");
      timeBuf.append(Math.abs(lHour));
      timeBuf.append("H");
      timeBuf.append(min);
      timeBuf.append("M");
      timeBuf.append(sec);
      timeBuf.append("S");
      value = timeBuf.toString();
      attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_OFFICE_TIME_VALUE, "", value);
    }
  }
}
