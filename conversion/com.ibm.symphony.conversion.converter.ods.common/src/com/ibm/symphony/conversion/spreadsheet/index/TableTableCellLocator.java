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

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;

public class TableTableCellLocator extends GeneralLocator
{

  public String getStyleId()
  {
    if(target == null || ! (target instanceof Cell))
      return null;
    Cell cell = (Cell) target;
    if(cell == null)
      return null;
    return cell.styleId;
  }
  
  public void startElement(ConversionContext locatorContext,Object output)
  {
    HashMap<String, Object> objectMap = (HashMap<String, Object>) locatorContext.get("supportObjectMap");
    if(output == null)
      return;
    Row row = (Row) output;
    Document doc = (Document) locatorContext.get("Source");
    String id = element.getAttribute(IndexUtil.ID_STRING);
    target = objectMap.get(id);
  }
  
  private Cell getCellById(ConversionContext context,ConversionUtil.Row row, int cellIndex)
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
