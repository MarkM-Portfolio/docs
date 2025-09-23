/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.index;


import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;

public class TableTableLocator extends GeneralLocator
{
  
  public void startElement(ConversionContext locatorContext,Object output)
  {
    Document doc = (Document) locatorContext.get("Source");
    String id = element.getAttribute(IndexUtil.ID_STRING);
    target = doc.getSheetById(id);
    String protect = element.getAttribute("table:protected");
    if(target != null && ConversionUtil.hasValue(protect) && Boolean.parseBoolean(protect))
      locatorContext.put("SheetProtect", true);
    else
      locatorContext.put("SheetProtect", false);
    locatorContext.put("Sheet", target);
  }
  
  public void endElement(ConversionContext localtorContext)
  {
    localtorContext.put("SheetProtect", false);
  }
}
