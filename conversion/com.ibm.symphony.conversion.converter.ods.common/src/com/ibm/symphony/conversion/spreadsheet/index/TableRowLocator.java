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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;

public class TableRowLocator extends GeneralLocator
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
    String id = element.getAttribute(IndexUtil.ID_STRING);
    target = (Row) index.getJsonDataObject(id);
  }
  protected void traverseChildren(ConversionContext localtorContext)
  {
    if(target == null)
      return;
    Row row = (Row) target;
    List<Cell> cellList = getCoveredCellList(localtorContext,row);
    int length = cellList.size();
    for (int columnIdx = 0; columnIdx < length; columnIdx++)
    {
      Cell cell = cellList.get(length - columnIdx - 1);
      cell.repeatedNum = cell.org_repeatedNum;
      TableCellSAXLocator.buildStyleMap(localtorContext, cell);
    }
  }
  
  private List<ConversionUtil.Cell> getCoveredCellList(ConversionContext context,ConversionUtil.Row row)
  {
    Sheet sheet = (Sheet) context.get("Sheet");
    List<ConversionUtil.Cell> coveredCellList = new ArrayList<ConversionUtil.Cell>();
    if(sheet != null)
    {
      int size = sheet.columnIdArray.size();
      Cell next = null;
      for (int cellIndex = size - 1; cellIndex >= 0;)
      {
        ConversionUtil.Cell cell = getPrevIndexedCell(context ,row, cellIndex,next);
        next = cell;
        coveredCellList.add(cell);
        cellIndex = cell.cellIndex - 1;
      }
    }
    return coveredCellList;
  }
  
  private Cell getCellByIndex(ConversionContext context,ConversionUtil.Row row, int cellIndex)
  {
    Sheet sheet = (Sheet) context.get("Sheet");
    String colId = sheet.columnIdArray.get(cellIndex);
    if("".equals(colId))
      return null;
    Cell cell = null;
    Cell tmpcell = row.getCellByIndex(colId);
    if (tmpcell!=null)
    {
      cell = tmpcell;
      int rn = tmpcell.org_repeatedNum;
      rn = rn > cell.repeatedNum ? rn : cell.repeatedNum;
      cell.repeatedNum =rn;
    }
    else
    {
      cell = getPreservedCell(context,row,colId,cellIndex);        
    }
    return cell;
  }
  
  
  private Cell getPreservedCell(ConversionContext context,Row row,String colId, int cellIndex)
  {
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    ODSOffsetRecorder reader = (ODSOffsetRecorder) context.get("Recorder");
    String rowId = row.rowId;
    String cellId = IndexUtil.generateCellId(rowId, colId);
    String xml = reader.locateById(cellId);
    boolean isPreservedCell = index.containsPreserveObjInCell(cellId) || xml != null;
    if(isPreservedCell)
    {
      Cell cell = new Cell();
      cell.rowId = rowId;
      cell.cellId = colId;
      cell.cellIndex = cellIndex;
      cell.repeatedNum = ConversionUtil.getRepeatNum(xml);
      List<ConversionUtil.Cell> cellList = row.cellList;
      int cellSize = cellList.size();
      for( int cellColumnIndex = cellSize - 1 ; cellColumnIndex >= 0; cellColumnIndex-- )
      {    	 
	    Cell tmp = cellList.get(cellColumnIndex);
		//repeat the cell tmp
		if(tmp.cellIndex < cellIndex && tmp.cellIndex + tmp.repeatedNum >= cell.cellIndex){
		  if( cell.styleId != null)
		    cell.styleId = tmp.styleId;
			break;
		}    	 
      }
      return cell;
    } 
    return getChangedCell(context,rowId,colId,row.rowIndex,cellIndex);
  }
  
  private Cell getChangedCell(ConversionContext context,String rowId, String colId,int rIdx, int cellIndex)
  {
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    Sheet sheet = (Sheet) context.get("Sheet");
    if(index.isDefaultFormatting(context,sheet.sheetId, rIdx,cellIndex))
    {
      Cell cell = new Cell();
      cell.rowId = rowId;
      cell.cellId = colId;
      cell.cellIndex = cellIndex;
      cell.styleId = ConversionConstant.DEFAULT_CELL_STYLE_NAME;
      return cell;
    }
    return null;
  }
  /**
   * return the row which covered the cell at cellIndex
   * 
   * @param rowIndex
   * @return return itself no cell covered
   */
  private ConversionUtil.Cell getPrevIndexedCell(ConversionContext context,ConversionUtil.Row row, int cellIndex, Cell next)
  {
    Sheet sheet = (Sheet) context.get("Sheet");
    Cell currcell = getCellByIndex(context, row,cellIndex);
    Map<String,Integer> rnMap = (Map<String, Integer>) context.get("InitialRepeatNumber");
    if(currcell == null)
    {
      currcell = new Cell();
      currcell.rowId = row.rowId;
      currcell.cellIndex = cellIndex;
      String colId = sheet.columnIdArray.get(cellIndex);
      Column col = sheet.getStyledColumnById(colId);
      if(col!=null && next == null)
        currcell.repeatedNum = col.repeatedNum;
    }
    
    for (int i = cellIndex - 1; i >= 0; i--)
    {
      Cell prevCell = getCellByIndex(context, row, i);
      if (prevCell != null)
      {
        boolean hasPrevCellId = ConversionUtil.hasValue(prevCell.cellId);
        String id = IndexUtil.generateCellId(prevCell.rowId, prevCell.cellId);
        int cellIndent = cellIndex - (prevCell.cellIndex + prevCell.repeatedNum);
        if (cellIndent <= 0)
        {
          if(hasPrevCellId)
          {
        	if(next != null){
        	  if(!rnMap.containsKey(id))
                rnMap.put(id, prevCell.repeatedNum);
              prevCell.repeatedNum = currcell.cellIndex - prevCell.cellIndex;
        	}
          }
          return prevCell;
        }
        else
        {
          if (cellIndent > 1)
          {
            if (ConversionUtil.hasValue(currcell.cellId))
            {
              return currcell;
            }
            else
            {
              // this row must be default styled row(default row height, row without default cell style)
              currcell.repeatedNum = cellIndent - 1;
              currcell.cellIndex = prevCell.cellIndex + prevCell.repeatedNum + 1;
              currcell.cellId = "";
            }
          }
          return currcell;
        }
      }
      else
      {
        
      }
    }
    // if still not return, return the cell at the 1st
    if (!ConversionUtil.hasValue(currcell.cellId))
    {
      currcell.repeatedNum = currcell.repeatedNum + cellIndex;
      currcell.cellIndex = 0;
      currcell.cellId = "";
    }
    return currcell;
  }
}
