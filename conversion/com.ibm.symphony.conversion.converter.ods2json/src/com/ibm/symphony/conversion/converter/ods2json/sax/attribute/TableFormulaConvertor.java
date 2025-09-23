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

import com.ibm.symphony.conversion.converter.ods2json.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.GeneralContext;
import com.ibm.symphony.conversion.service.common.ConversionContext;

public class TableFormulaConvertor extends GeneralAttributeConvertor
{
  public TableFormulaConvertor(String attrName)
  {
    super(attrName);
  }

  public String convert(ConversionContext context, GeneralContext convertor,Object targetObject)
  {
    String formula = convertor.getAttrValue(mAttrName);
    
    //check if it is ms syntax formula, if yes, return the formula value as null 
    //which means do not convert it as formula 
    Object isMSObj = context.get("MSFormula");
    if(isMSObj != null)
    {
      boolean isMS = Boolean.parseBoolean(isMSObj.toString());
      if(isMS && formula.startsWith(ODSConvertUtil.MSPREFIX))
        return null;
    }
    // formula always beginning with "of:=" in ods.
    // TODO - typical formula would be either "=SUM([.A1:.B3])", "=[.A1]" or =[SheetName.A1]
    
    return ODSConvertUtil.convertFormula(formula);
  }
}
