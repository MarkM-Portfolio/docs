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

import java.util.HashMap;
import java.util.List;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;

public class TableTableRowLocator extends GeneralLocator
{
  public String getStyleId()
  {
    Row row = (Row) target;
    if( row == null)
      return null;
    return row.rowId;
  }
  
  public void startElement(ConversionContext locatorContext, Object output)
  {
    if(output == null)
      return;
    JsonToODSIndex index = (JsonToODSIndex) locatorContext.get("ODSIndex");
    Sheet sheet = (Sheet) output;
    Document doc = (Document) locatorContext.get("Source");
    String id = element.getAttribute(IndexUtil.ID_STRING);
    String styleName = element.getAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
    target = index.getJsonDataObject(id);
  }
  
  public void getCellById(ConversionContext context,Sheet sheet,String colId)
  {
    HashMap<String,List<String>> styleNameMap = (HashMap<String, List<String>>) context.get("styleNameMap");
    int size = sheet.columnIdArray.size();
    Row row = (Row) target;
    for (int cellIndex = size - 1; cellIndex >= 0;)
    {
      ConversionUtil.Cell cell = getCellByIndex(context ,row, cellIndex);
      String cellStyleId = cell.styleId;
//      List<String> styleList = styleNameMap.get(cellStyleId);
//      if(styleList == null)
//        styleList = new ArrayList<String>();
//      styleNameMap.put(cellStyleId, styleList);      
    }
  }

  private Cell getCellByIndex(ConversionContext context,ConversionUtil.Row row, int cellIndex)
  {
    Sheet sheet = (Sheet) context.get("Sheet");
    String colId = sheet.columnIdArray.get(cellIndex);
    if("".equals(colId))
      return null;
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    Document doc = (Document) context.get("Source");
    Cell cell = null;
    cell = row.getCellByIndex(colId);
    return cell;
  }
 
}
