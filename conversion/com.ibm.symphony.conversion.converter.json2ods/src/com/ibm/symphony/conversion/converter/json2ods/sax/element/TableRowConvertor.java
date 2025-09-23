/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.table.TableTableRowElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfTableRowProperties;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.json2ods.ContextInfo;
import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.index.IndexUtil;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.spreadsheet.index.ODSOffsetRecorder;

public class TableRowConvertor  extends GeneralConvertor
{

  private static final Logger LOG = Logger.getLogger(TableRowConvertor.class.getName());
  private int cellCount = 0; 
  private boolean isNew ;
  private HashMap<Integer, Cell> preserveCells;//column index -> preserve cell in one row
  
  public void convert(ConversionContext context,TransformerHandler mXmlWriter,Object input, Object output)
  {
    preserveCells = new HashMap<Integer, Cell>();
    this.mXmlWriter = mXmlWriter;
    OdfElement parent = (OdfElement)output;
    ContextInfo info = (ContextInfo)context.get("ContextInfo");
    Row row = (Row) input;
    int rowIndex = row.rowIndex;
    target = this.convertElement(context,input,parent);
    parent.appendChild(target);
    TableTableRowElement tableRow = (TableTableRowElement)target;
    int size = setRowAttribute(context,row, tableRow);
    info.rowIndex += row.repeatedNum;
    info.maxRowCnt += size;
    this.removeChildren(context,mXmlWriter,target);
    startOutput();
    if (rowIndex >-1)
      this.convertChildren(context,mXmlWriter, row, target);
    else
      LOG.warning("rowId should exist in the rowIdArray");
    //fillRow
    ODSConvertUtil.fillRow(this.mXmlWriter,cellCount, info.maxColCnt);
    endOutput();
  }
  
  protected OdfElement createNewElement(ConversionContext context,Object input,OdfElement parent)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("Target");
    try
    {
      TableTableRowElement tableRow  = new TableTableRowElement(contentDom);
      isNew = true;
      return tableRow;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "can not create a table row", e);
    }
    return null;
  } 

  
  protected String getNodeId(Object input)
  {
    Row row = (Row) input;
    return row.rowId;
  }
  
  protected String getStyleId(Object input)
  {
    Row row = (Row) input;
    return row.rowId;
  }
  
  public void convertChildren(ConversionContext context,TransformerHandler mXmlWriter,Row row,OdfElement element)
  {
    List<Cell> cellList = getCoveredCellList(context,row);
    int length = cellList.size();
    for (int columnIdx = 0; columnIdx < length; columnIdx++)
    {
      Cell cell = cellList.get(length - columnIdx - 1);
      cellCount += cell.repeatedNum;
      cellCount ++ ;
      new TableCellConvertor().convert(context, cell, mXmlWriter);
    }
    
  }
  private int setRowAttribute(ConversionContext context,ConversionUtil.Row row, TableTableRowElement odfRow)
  {
    setTableStyleNameAttribute(context,row,odfRow);
    if (row.visibility.equalsIgnoreCase("hide"))
    {
      odfRow.setTableVisibilityAttribute("collapse");
    }
    else if (row.visibility.equalsIgnoreCase("filter"))
    {
      odfRow.setTableVisibilityAttribute("filter");
    }
    else
      odfRow.removeAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_VISIBILITY);
    int repeatNum = 1;
    if (row.repeatedNum > 0)
    {
      repeatNum = row.repeatedNum + 1;
      odfRow.setTableNumberRowsRepeatedAttribute(repeatNum);
    }
    else
      odfRow.removeAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_ROWS_REPEATED);
    return repeatNum;
  }
  
  public void setTableStyleNameAttribute(ConversionContext context,Object input, OdfElement element)
  {
    TableTableRowElement odfRow = (TableTableRowElement)element; 
    Row row = (Row)input;
    Sheet sheet = (Sheet)context.get("Sheet");
    HashMap<String,List<Integer>> rowBreakMap = (HashMap<String,List<Integer>>) context.get("rowBreakMap");
    boolean isBreak = false;
    if(rowBreakMap != null)
    {
      int rIndex = row.rowIndex;
      List<Integer> rowBreakList = rowBreakMap.get(sheet.sheetId);
      if(rowBreakList != null && rowBreakList.contains(rIndex))
      {
        isBreak = true;
      }
    }
    
    HashMap<String,Integer> rowStyleHeightMap = (HashMap<String,Integer>) context.get("rowStyleHeightMap");
    Iterator<String> rowStyleNameIter = rowStyleHeightMap.keySet().iterator();
    
    HashMap<String,Map<String,Boolean>> rowOldNewStyleMap = (HashMap<String,Map<String,Boolean>>) context.get("rowOldNewStyleMap");
    Iterator<String> rowNewStyleIt = rowOldNewStyleMap.keySet().iterator();
    Boolean hasStyleName = false;
    
    HashMap<String,List<String>> styleNameMap = (HashMap<String,List<String>>) context.get("styleNameMap");
    List<String> styleList = styleNameMap.get(row.rowId);
    
    if(styleList != null)
    {
      Iterator<String> it = styleList.iterator();
      while(it.hasNext())
      {
    	String oldStyleName = it.next();
    	while(rowNewStyleIt.hasNext())
    	{	
    	  String rowNewStyleName = rowNewStyleIt.next();
    	  Boolean isChanged = isOptimalRowHeightChanged(context, row, OdfStyleFamily.TableRow);
    	  if((rowOldNewStyleMap.get(rowNewStyleName)).get(oldStyleName) == isChanged && rowStyleHeightMap.get(rowNewStyleName).intValue() == row.height)
    	  {
    	    odfRow.setTableStyleNameAttribute(rowNewStyleName);
	        hasStyleName = true;  
    	  }
    	}
	    break;
      }
    }
    if(!hasStyleName)
    {
      while (rowStyleNameIter.hasNext())
      {
        String rowStyleName = rowStyleNameIter.next();
        boolean isBreakStyle = false;
        if(!isBreak)
        {
          Map<String,Boolean> styleBreakMap = (HashMap<String,Boolean>) context.get("styleBreakMap");
          if(styleBreakMap.containsKey(rowStyleName))
          {
            isBreakStyle = styleBreakMap.get(rowStyleName);
          }
        }
        int height = rowStyleHeightMap.get(rowStyleName).intValue() ;
        if (height == row.height  && (isBreak == isBreakStyle))
        {
          //just set the style which has no old style, createStyle(...String oldStyleName == null)
          if(isNew)
          {
            OdfFileDom contentDom = (OdfFileDom) context.get("Target");
            OdfStyle style = contentDom.getAutomaticStyles().getStyle(rowStyleName, OdfStyleFamily.TableRow);
            String pro = style.getProperty(OdfTableRowProperties.UseOptimalRowHeight);
            if("true".equals(pro)&& height != ConversionUtil.Row.defaultHeight)
              continue;
          }
          odfRow.setTableStyleNameAttribute(rowStyleName);
          break;
        }
      }
    }
  }
  
  private List<ConversionUtil.Cell> getCoveredCellList(ConversionContext context,ConversionUtil.Row row)
  {
    Sheet sheet = (Sheet) context.get("Sheet");
    List<ConversionUtil.Cell> coveredCellList = new ArrayList<ConversionUtil.Cell>();
    List<ConversionUtil.Cell> newCoveredCellList = new ArrayList<ConversionUtil.Cell>();
    int size = sheet.columnIdArray.size();
    Cell next = null;
    Map<String,Integer> rnMap = (Map<String, Integer>) context.get("InitialRepeatNumber");
        
    int maxColIndex = sheet.maxColumnIndex;
    
    for (int cellIndex = size - 1; cellIndex >= 0;)
    {
      ConversionUtil.Cell cell = getPrevIndexedCell(context ,row, cellIndex,next, coveredCellList);
      next = cell;
      coveredCellList.add(cell);
      String id = IndexUtil.generateCellId(cell.rowId, cell.cellId);
      Object orn = rnMap.get(id);
      int rn = (Integer) (orn == null?0:orn);
      rn = rn > cell.repeatedNum? rn : cell.repeatedNum;
      int nc = cell.cellIndex + rn + 1;
      if(maxColIndex < nc)
      {
        maxColIndex = nc;
        sheet.maxColumnIndex = maxColIndex;
      }
      cellIndex = cell.cellIndex - 1;
    }
    if(coveredCellList.isEmpty())
      return coveredCellList;
    Cell lastCell = coveredCellList.get(0);
    int realLastIndex = lastCell.cellIndex + lastCell.repeatedNum + 1;
    if(maxColIndex > realLastIndex)
    {
      Cell realLastCell = new Cell();
      realLastCell.cellIndex = realLastIndex;
      realLastCell.repeatedNum = maxColIndex - (realLastIndex) - 1;
      newCoveredCellList.add(realLastCell);
      int lsize = row.cellList.size();
      for( int k = 0; k< lsize; k++ )
      {
        Cell cell = row.cellList.get(k);
        if(realLastCell.cellIndex < cell.cellIndex)
          continue;
        String cellId = IndexUtil.generateCellId(cell.rowId, cell.cellId);
        int rn = 0;
        if(ConversionUtil.hasValue(cellId) && rnMap.containsKey(cellId))
          rn = rnMap.get(cellId);
        rn = cell.repeatedNum > rn? cell.repeatedNum:rn;
        int maxCol = cell.cellIndex + rn;
        if( maxCol!=0 && maxCol >= realLastCell.cellIndex)
        {
          realLastCell.styleId = cell.styleId;
        }
      }
    }
    newCoveredCellList.addAll(coveredCellList);
    return newCoveredCellList;
  }
  
  private Cell getCellByIndex(ConversionContext context,ConversionUtil.Row row, int cellIndex)
  {
    Sheet sheet = (Sheet) context.get("Sheet");
    String colId = sheet.columnIdArray.get(cellIndex);
    if("".equals(colId))
      return null;
    Cell cell = null;
    cell = row.getCellByIndex(colId);
    if (cell == null) {
      int size= row.cellList.size();
      for( int i = 0 ;i < size; i++)
      {
        Cell tmpcell = row.cellList.get(i);
        if(tmpcell.cellId.equals(colId))
        {
          cell = new Cell(tmpcell);
          cell.rowId = tmpcell.rowId;
          cell.cellIndex = tmpcell.cellIndex;
          break;
        }
      }
    }
    if(cell == null)
    {
      cell = getPreservedCell(context,row,colId, cellIndex);        
    }
    return cell;
  }
  
  // if the preserved cell is covered by the previous style cell repeat number
  // then we should split the previous style cell and return the new created style cell after preserved cell
  private Cell getPreservedCell(ConversionContext context,Row row,String colId, int cellIndex)
  {
    Cell cell = preserveCells.get(cellIndex);
    if(cell != null)
      return cell;
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    ODSOffsetRecorder reader = (ODSOffsetRecorder) context.get("Recorder");
    String rowId = row.rowId;
    String cellId = IndexUtil.generateCellId(rowId, colId);
    String xml = reader.locateById(cellId);
    boolean isPreservedCell = index.hasUnameRangeinCell(cellId) || xml != null;
    if(isPreservedCell)
    {
      cell = new Cell();
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
		if(tmp.cellIndex < cellIndex){
		  if(tmp.cellIndex + tmp.repeatedNum < cell.cellIndex)
		    break;
//		  if( cell.styleId != null)
		    cell.styleId = tmp.styleId;
		  if(xml == null){			 
		    cell.repeatedNum = tmp.cellIndex + tmp.repeatedNum - cell.cellIndex;	
		  }else{
//		    //split the tmp cell by this cell and return the cell after this preserved cell
		    int endIndex = tmp.cellIndex + tmp.repeatedNum;
//		    Cell afterCell = new Cell();
//		    afterCell.cellIndex = cell.cellIndex + cell.repeatedNum + 1;
//		    if(afterCell.cellIndex <= endIndex){
//		      //when return afterCell, do not set the repeat number for the tmp cell now
//		      // because the preserved cell need the style id of this tmp cell
//		      afterCell.rowId = rowId;
//		      afterCell.repeatedNum = endIndex - afterCell.cellIndex;
//		      afterCell.styleId = tmp.styleId;
//		      tmp.repeatedNum = afterCell.cellIndex - tmp.cellIndex - 1;
//		      preserveCells.put(afterCell.cellIndex, afterCell);
//    		  return afterCell;
//		    }else{
		      //else the afterCell do not need to create
		      //and reset tmp.repeateNum, otherwise the repeat style number will be increased
		      cell.repeatedNum = endIndex - cell.cellIndex;
		      tmp.repeatedNum = cell.cellIndex - tmp.cellIndex - 1;
//		    }
		  }
		  break;
		}else if(cellIndex + cell.repeatedNum >= tmp.cellIndex){
		  cell.repeatedNum = tmp.cellIndex - cellIndex - 1;//not break here
		}
      }
      if(cell != null)
        preserveCells.put(cellIndex, cell);
      return cell;
    } 
    return getChangedCell(context,rowId,colId,row.rowIndex,cellIndex);
  }
  
  private Cell getChangedCell(ConversionContext context,String rowId, String colId,int rIdx, int cellIndex)
  {
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    Sheet sheet = (Sheet)context.get("Sheet");
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
  private ConversionUtil.Cell getPrevIndexedCell(ConversionContext context,ConversionUtil.Row row, int cellIndex, Cell next, List<ConversionUtil.Cell> coveredCellList)
  {
    Sheet sheet = (Sheet) context.get("Sheet");
    Map<String,Integer> rnMap = (Map<String, Integer>) context.get("InitialRepeatNumber");
    Cell currcell = getCellByIndex(context, row,cellIndex);
    int colSize = sheet.columnIdArray.size();
    boolean isLastCellCovered = false;
    int gap = 0;
    if(cellIndex == colSize - 1)
      isLastCellCovered = true;
    if(currcell == null)
    {
      currcell = new Cell();
      currcell.rowId = row.rowId;
      currcell.cellIndex = cellIndex;
      if(next == null){
        String colId = sheet.columnIdArray.get(cellIndex);
        Column col = sheet.getStyledColumnById(colId);
        if(col!=null)
          currcell.repeatedNum = col.repeatedNum;
      }
    }
    int size = row.cellList.size();
    for( int k = 0; k< size; k++ )//do not need to calc from the begining
    {
      Cell cell = row.cellList.get(k);
      if(currcell.cellIndex < cell.cellIndex)
        continue;
      String cellId = IndexUtil.generateCellId(cell.rowId, cell.cellId);
      int rn = 0;
      if(ConversionUtil.hasValue(cellId) && rnMap.containsKey(cellId))
        rn = rnMap.get(cellId);
      rn = cell.repeatedNum > rn? cell.repeatedNum:rn;
      
      if(isLastCellCovered && cell.cellIndex + cell.repeatedNum > cellIndex)
      {
        gap = cell.cellIndex + cell.repeatedNum - cellIndex;
      }
      int maxCol = cell.cellIndex + rn;
      if( maxCol!=0 && maxCol >= currcell.cellIndex)
      {
        currcell.styleId = cell.styleId;
      }
    }    
    String cellId = IndexUtil.generateCellId(currcell.rowId, currcell.cellId);
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    for (int i = cellIndex - 1; i >= 0; i--)
    {
      Cell prevCell = getCellByIndex(context, row, i);
      if (prevCell != null)
      {
        boolean hasCellId = ConversionUtil.hasValue(prevCell.cellId);
        int cellIndent = cellIndex - (prevCell.cellIndex + prevCell.repeatedNum);
        if (cellIndent <= 0 )
        {
          if(ConversionUtil.hasValue(cellId) && index.hasUnameRangeinCell(cellId))
          {
            prevCell.repeatedNum = currcell.cellIndex - prevCell.cellIndex - 1;//+gap?
            int rn = 0 - cellIndent - 1;
            
            if(rn >=0 )
            {
              //create next cell to fill up the repeat number which might be split by the id which used in unnamed range
              Cell lastCoveredCell = null;
              boolean bNeedNext = true;
              if(coveredCellList.size() > 0)
                lastCoveredCell = coveredCellList.get(coveredCellList.size() - 1);
              int nextCellIndex = cellIndex + 1;
              if(lastCoveredCell != null && lastCoveredCell.cellIndex >= nextCellIndex)
              {
                int rnGap = lastCoveredCell.cellIndex - nextCellIndex - 1;
                if(rnGap < 0)
                {
                  bNeedNext = false;//do not need create next cell, because lastCoveredCell is the nextCell
                  if(rnGap < -1)
                    LOG.log(Level.WARNING, "getCoveredCellList must collect the wrong cells");
                }
                if(rnGap > rn)
                {
                  LOG.log(Level.WARNING, "TODO: should fill the default cells?");
                }
//                else
//                {
//                  if(lastCoveredCell.styleId != prevCell.styleId)
//                    LOG.log(Level.WARNING, "wow, style is not equal, must be wrong");
//                }
                rn = rn > rnGap?rnGap: rn;
              }
              if(bNeedNext)
              {
                ConversionUtil.Cell nextCell = new Cell();
                nextCell.rowId = row.rowId;
                nextCell.cellIndex = nextCellIndex;
                nextCell.repeatedNum = rn;
                nextCell.styleId = prevCell.styleId;
                coveredCellList.add(nextCell);
              }
            }
            currcell.repeatedNum = 0;
            return currcell;
          }
          else if(hasCellId)
          {
            String prevcellId = IndexUtil.generateCellId(prevCell.rowId, prevCell.cellId);
            if(index.hasUnameRangeinCell(prevcellId))
            {
              prevCell.repeatedNum = currcell.cellIndex - prevCell.cellIndex - 1;//+gap?
              //current cell should has the repeatnumber incase the previous cell with the repeat number can cover the current cell
              int rn = 0 - cellIndent;
              boolean bCover = true;
              Cell lastCoveredCell = null;
              if(coveredCellList.size() > 0)
                lastCoveredCell = coveredCellList.get(coveredCellList.size() - 1);
              if(lastCoveredCell != null && lastCoveredCell.cellIndex >= cellIndex)
              {
                int rnGap = lastCoveredCell.cellIndex - cellIndex - 1;
                if(rnGap < 0)
                {
                  LOG.log(Level.WARNING, "getCoveredCellList must collect the wrong cells");
                  bCover = false;
                }
                else if(rnGap > rn)
                {
                  LOG.log(Level.WARNING, "TODO: should fill the default cells?");
                }
//                else
//                {
//                  if(lastCoveredCell.styleId != prevCell.styleId)
//                    LOG.log(Level.WARNING, "wow, style is not equal, must be wrong");
//                }
                rn = rn > rnGap?rnGap: rn;
              }
              if(bCover)
                currcell.repeatedNum = rn;
              return currcell;
            }
            else
              prevCell.repeatedNum = currcell.cellIndex - prevCell.cellIndex + gap;
            
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
      int lsize = row.cellList.size();
      for( int k = 0; k< lsize; k++ )
      {
        Cell cell = row.cellList.get(k);
        if(cell.cellIndex == currcell.cellIndex)
        {
          currcell.styleId = cell.styleId;
        }
      }
    }
    else
    {
      if(next != null)
        currcell.repeatedNum = next.cellIndex - currcell.cellIndex - 1;
    }
    return currcell;
  }
  
  private Boolean isOptimalRowHeightChanged(ConversionContext context, Row styledRow, OdfStyleFamily styleFamily)
  {
 	HashMap<String,List<String>> styleNameMap = (HashMap<String,List<String>>) context.get("styleNameMap");
    List<String> styleList = styleNameMap.get(styledRow.rowId);
    if(styleList != null)
    {
      Iterator<String> it = styleList.iterator();
      while(it.hasNext())
      {
      	int oldRowHeight = 0;
    	OdfStyle oldStyle = com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil.getOldStyle(context, it.next(), styleFamily);
    	String oldHeight = oldStyle.getProperty(OdfTableRowProperties.RowHeight);
    	if(oldHeight != null)
    	{
		  oldRowHeight = Length.parseInt(oldHeight, Unit.PIXEL);
    	  if("true".equals(oldStyle.getProperty(OdfTableRowProperties.UseOptimalRowHeight)) && oldRowHeight != styledRow.height)
    	    return true;
    	}
    	break;
      }	
    }
	return false;
  }  
}
