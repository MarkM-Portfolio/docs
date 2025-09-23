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

import org.odftoolkit.odfdom.OdfElement;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;


public class IndexUtil
{
  public static final String ID_STRING = "id";

  public static final String ODFDRAFT_NAME = "odfdraft";
  
  public static void setXmlId(OdfElement odfNode,String idVal)
  {
    if (idVal != null && !idVal.equals(""))
    {
      odfNode.setAttribute(ID_STRING, idVal);
    }
  }
  
  public static String generateCellId(String rowId,String colId)
  {
    if(rowId == null || colId == null || "".equals(rowId) || "".equals(colId))
      return null;
    return rowId + "_" + colId;
  }
  
  
  public static Cell getCellByIndex(ConversionContext context,Sheet sheet,ConversionUtil.Row row, int cellIndex)
  {
    String colId = sheet.columnIdArray.get(cellIndex);
    if("".equals(colId))
      return null;
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    Document doc = (Document) context.get("Source");
    Cell cell = null;
    cell = row.getCellByIndex(colId);
    return cell;
  }
  
  private static Cell getPreservedCell(JsonToODSIndex index,String rowId,String colId, int cellIndex)
  {
    String cellId = IndexUtil.generateCellId(rowId, colId);
    OdfElement element = index.getOdfNodes(cellId);
    boolean isPreservedCell = index.containsPreserveObjInCell(cellId) || element != null;
    if(isPreservedCell)
    {
      Cell cell = new Cell();
      cell.rowId = rowId;
      cell.cellId = colId;
      cell.cellIndex = cellIndex;
      return cell;
    } 
    return null;
  }
  
}
