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
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.table.TableNamedExpressionElement;
import org.odftoolkit.odfdom.dom.element.table.TableShapesElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableCellElementBase;
import org.odftoolkit.odfdom.dom.element.table.TableTableElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableRowElement;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.json2ods.ContextInfo;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.index.IndexUtil;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.json2ods.sax.style.TableRowStyleConvertor;
import com.ibm.symphony.conversion.spreadsheet.index.PreserveNameIndex;

public class TableTableConvertor extends GeneralConvertor
{
  private static final Logger LOG = Logger.getLogger(TableTableConvertor.class.getName());
  private List<Row> uniqueRowList;
  private Map<Integer,String> baseRowMap;

  protected String getNodeId(Object input)
  {
    Sheet sheet = (Sheet) input;
    return sheet.sheetId;
  }
  
  protected void startElement(ConversionContext context,Object input)
  {
    ContextInfo info = (ContextInfo)context.get("ContextInfo");
    info.rowIndex = 0;
    info.hasStyledColumn = false;
  }
  
  protected List<OdfElement> removeChildren(ConversionContext context,TransformerHandler mXmlWriter, OdfElement element)
  {
    if (element == null)
      return null;
    NodeList children = element.getChildNodes();
    List<OdfElement> unsupportChildren = new ArrayList<OdfElement>();
    int length = children.getLength();
    for (int i = 0; i < length; i++)
    {
      OdfElement odfNode = (OdfElement)children.item(i);
      if (!isNonPreserve(odfNode))
      {
        unsupportChildren.add(odfNode);
      }
    }
    int size = unsupportChildren.size();
    for (int i = 0; i < size; i++)
    {
      OdfElement odfNode = unsupportChildren.get(i);

      if (odfNode instanceof TableShapesElement)
      {
        OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_SHAPES)
            .convert(context, mXmlWriter, odfNode, element);
      }
      else
      {
        PreserveConvertorFactory.getInstance().getConvertor(odfNode.getNodeName()).convert(context, mXmlWriter, odfNode, element);
      }
    }
    return null;
  }
//  {
//    ///////////////version 1////////////////////////////////////////////
//    //remove the children has been deleted
//    if(element == null)
//      return null;
//    NodeList children = element.getChildNodes();
//    List<OdfElement> unsupportChildren = new ArrayList<OdfElement>();
//    int length = children.getLength();
//    for( int i = length - 1 ;i >=0; i--)
//    {
//      Node child = children.item(i);
//      OdfElement odfNode = (OdfElement) element.removeChild(child);
//      if(!isNonPreserve(odfNode))
//      {
//        unsupportChildren.add(odfNode);
//      }
//      
////      OdfElement child = (OdfElement)element.getFirstChild();
////      OdfElement odfNode = (OdfElement) element.removeChild(child);
////      oldChildren.add(odfNode);
////      tailChildren.add(odfNode);
////      String xmlId = odfNode.getAttribute(IndexUtil.ID_STRING);
////      if((xmlId != null && !"".equals(xmlId)) || isNonPreserve(odfNode))
////      {
////        if(odfNode instanceof TableNamedExpressionElement)
////          continue;
////        tailChildren.clear();
////      }
//    }
//    int size = unsupportChildren.size();
//    for(int i = size - 1; i >= 0; i-- )
//    {
//      OdfElement odfNode = unsupportChildren.get(i);
//      
//      if(odfNode instanceof TableShapesElement)
//      {
//        OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_SHAPES).convert(context,mXmlWriter, odfNode, element);
//      }
//      else
//      {
//        element.appendChild(odfNode);
////        if(isPrePreserved)
////          PreserveConvertorFactory.getInstance().getConvertor(odfNode.getNodeName()).buildDOMNode(context,mXmlWriter, odfNode, element);
////        else
//          PreserveConvertorFactory.getInstance().getConvertor(odfNode.getNodeName()).convert(context,mXmlWriter, odfNode, element);
//      }
//    }
//    return null;
//  }
//  {
  ///////////////////version ORIGNIAL 
//    //remove the children has been deleted
//    if(element == null)
//      return null;
//    List<OdfElement> oldChildren = new ArrayList<OdfElement>();
//    List<OdfElement> tailChildren = new ArrayList<OdfElement>();
//    NodeList children = element.getChildNodes();
//    
//    int length = children.getLength();
//    for( int i = 0 ;i < length; i++)
//    {
//      OdfElement child = (OdfElement)element.getFirstChild();
//      OdfElement odfNode = (OdfElement) element.removeChild(child);
//      oldChildren.add(odfNode);
//      tailChildren.add(odfNode);
//      String xmlId = odfNode.getAttribute(IndexUtil.ID_STRING);
//      if((xmlId != null && !"".equals(xmlId)) || isNonPreserve(odfNode))
//      {
//        if(odfNode instanceof TableNamedExpressionElement)
//          continue;
//        tailChildren.clear();
//      }
//    }
//    int size = oldChildren.size();
//    boolean isPrePreserved = false ;
//    for(int i = 0; i < size; i++ )
//    {
//      OdfElement odfNode = oldChildren.get(i);
//      String xmlId = odfNode.getAttribute(IndexUtil.ID_STRING);
//      if(isNonPreserve(odfNode))
//      {
//        isPrePreserved = true;
//        continue;
//      }
//      
//      if(odfNode instanceof TableShapesElement)
//      {
//        OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_SHAPES).convert(context,mXmlWriter, odfNode, element);
//      }
//      else
//      {
//        element.appendChild(odfNode);
//        if(isPrePreserved)
//          PreserveConvertorFactory.getInstance().getConvertor(odfNode.getNodeName()).buildDOMNode(context,mXmlWriter, odfNode, element);
//        else
//          PreserveConvertorFactory.getInstance().getConvertor(odfNode.getNodeName()).convert(context,mXmlWriter, odfNode, element);
//      }
//    }
//    return tailChildren;
//  }

  public void convert(ConversionContext context,TransformerHandler mXmlWriter,Object input, Object output)
  {
    this.mXmlWriter = mXmlWriter;
    baseRowMap = new HashMap<Integer,String>();
    OdfElement parent = (OdfElement) output;
    this.startElement(context, input);
    if(!(input instanceof OdfElement))
      pInput = input;
    target = convertElement(context, input, parent);
    parent.appendChild(target);
    Sheet sheet = (Sheet) input;
    uniqueRowList = ((ConversionUtil.Document)context.get("Source")).uniqueRows.uniqueRowList;
    TableTableElement odfTable = (TableTableElement) target;
    odfTable.setTableNameAttribute(sheet.sheetName);
    HashMap<String, String> tableStyleMap = (HashMap<String, String>)context.get("tableStyleMap");
    String tableStyleName = tableStyleMap.get(sheet.sheetId);
    if (tableStyleName != null)
      odfTable.setTableStyleNameAttribute(tableStyleName);

    // if the sheet is empty, then set table:print="false" in order to export pdf successfully
    if(sheet.rowList.size() == 0)
      odfTable.setTablePrintAttribute(false);
    else
      odfTable.setTablePrintAttribute(true);
    
    startOutput();
    context.put("Sheet", sheet);
    List<OdfElement> pList = this.removeChildren(context, mXmlWriter ,target);
    this.convertChildren(context, sheet, target);
    this.endElement(context);
  }

  public void convertChildren(ConversionContext context, Sheet sheet, OdfElement element)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    ContextInfo info = (ContextInfo) context.get("ContextInfo");
    
    List<Range> rangeList = index.getImageByContainerId(sheet.sheetId);
    
    NodeList list= element.getElementsByTagName(ConversionConstant.ODF_ELEMENT_TABLE_SHAPES);
    if((list == null || list.getLength() == 0) && rangeList != null)
    {
      OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_SHAPES).convert(context,mXmlWriter, null, element);
    }
    
//    if(rangeList != null)
//    {
//      Node shapeNode = null;
//      if(list != null && list.getLength() > 0){
//        shapeNode = list.item(0);
//      }
//      OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_SHAPES).convert(context,mXmlWriter, shapeNode, element);
//    }
    
    ArrayList coveredColumnList = getColumnList(context, sheet);
    int columnElementSize = coveredColumnList.size();
    for (int i = 0; i < columnElementSize; i++)
    {
      Object object = coveredColumnList.get(columnElementSize - 1 - i);
      if (object instanceof List)
      {
        OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_COLUMN_GROUP).convert(context, mXmlWriter,
            (List<Column>) object, element);
      }
      else if (object instanceof Column)
      {
        OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLETABLE_COLUMN).convert(context, mXmlWriter,
            (Column) object, element);
      }
    }
    Map<String, Integer> rnMap = (Map<String, Integer>) context.get("InitialRowRepeatNumber");
    rnMap.clear();
    Map<String, Integer> colRNMap = (Map<String, Integer>) context.get("InitialRepeatNumber");
    ArrayList<ConversionUtil.Row> coveredRowList = getCoveredRowList(context, sheet);
   
    int rowSize = coveredRowList.size();
    List<Row> newCoveredRowList = new ArrayList<Row>();
    
    int maxRowIndex = 0 ;
    
    for(int i = 0; i < rowSize;i++)
    {
      ConversionUtil.Row row = coveredRowList.get(rowSize - i - 1);
      if(rnMap.containsKey(row.rowId))
      {
        int rn = rnMap.get(row.rowId); 
        for(int j = 0; j< rn; j++)
        {
          maxRowIndex = Math.max(maxRowIndex,row.rowIndex + j + 1);
          baseRowMap.put(row.rowIndex + j + 1, row.rowId);
        } 
      }
      String rowId = baseRowMap.get(row.rowIndex);
      
      Row baseRow = (Row) index.getJsonDataObject(rowId);
      if(baseRow == null)
        continue;
      int lsize = baseRow.cellList.size();
      if(i == rowSize - 1)
      {
        Row finalrow = new Row();
        finalrow.rowIndex = row.rowIndex + row.repeatedNum + 1;
        finalrow.repeatedNum = maxRowIndex - (row.rowIndex + row.repeatedNum + 1) ;
        finalrow.sheetId = baseRow.sheetId;
        finalrow.styleId = baseRow.styleId;
        for(int k = 0; k<lsize;k++ )
        {
          Cell cell = baseRow.cellList.get(k);
          Cell newCell = new Cell(cell);
          newCell.cellIndex =cell.cellIndex;
          newCell.rowId = finalrow.rowId;
          finalrow.cellList.add(newCell);
        }
        newCoveredRowList.add(finalrow);
      }
      copyCellsToRow(context,baseRow,row);   
    }
    newCoveredRowList.addAll(coveredRowList);
    
    rowSize = newCoveredRowList.size();
    info.maxRowCnt = 0;
    List<Row> groupRow = null;
    PreserveNameIndex nameIndex = null;
    boolean groupStart = false;
    for (int i = 0; i < rowSize ; i++)
    {
      ConversionUtil.Row row = newCoveredRowList.get(rowSize - i - 1);
      String groupId = index.getGroupId(row.rowId);
      if (groupStart)
      {
        groupRow.add(row);
        boolean isGroupEndId = row.rowId.equals(nameIndex.endRowId);
        if(!isGroupEndId)
        {
          ConversionUtil.Row endRow = (Row) index.getJsonDataObject(nameIndex.endRowId);
          if(endRow!=null)
          {
        	  int indexindent =  endRow.rowIndex - (row.rowIndex + row.repeatedNum);
        	  if(indexindent <= 0)
        		  groupStart = false;
          }
          else
          {
        	  LOG.log(Level.SEVERE,"Can't find the row object in index map!");
        	  OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW).convert(context,mXmlWriter, row,
                  element);
          }
        }
        if(!groupStart || isGroupEndId )
        {
          OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_ROW_GROUP).convert(context, mXmlWriter ,groupRow,
              element);
          groupStart = false;
        }
      }
      else if (groupId != null && !"".equals(groupId))
      {
          nameIndex = index.getGroupIndex(groupId);
          if(ConversionUtil.hasValue(nameIndex.address) && !nameIndex.address.contains("#REF!")) {
            groupRow = new ArrayList<Row>();
            groupRow.add(row);
            groupStart = true;
            if (row.rowId.equals(nameIndex.endRowId))
            {
              groupStart = false;
              OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLE_ROW_GROUP).convert(context,mXmlWriter,
                  groupRow, element);
            }
          } else 
          {
            // if group is invalid, such as been deleted, just export this row as normal rows
            OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW).convert(context,mXmlWriter, row,
                element);
          }
      }
      else 
        OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW).convert(context,mXmlWriter, row,
            element);
      
    }

  }
  
  private int getRowSize(ConversionContext context,ArrayList<ConversionUtil.Row> rowList)
  {
    ContextInfo info = (ContextInfo)context.get("ContextInfo");
    int actualSize = rowList.size();
    if(actualSize == 0)
      return 0;

    if (info.hasStyledColumn)
    {
      actualSize = actualSize - 1; 
    }
    return actualSize;
    
  }
  
  private Row copyCellsToRow(ConversionContext context,Row source, Row target)
  {
    if(target.cellList.isEmpty())
    {
      int lsize = source.cellList.size();
      Map<String, Integer> colRNMap = (Map<String, Integer>) context.get("InitialRepeatNumber");
      for(int k = 0; k<lsize;k++ )
      {
        Cell cell = source.cellList.get(k);
        Cell newCell = new Cell(cell);
        newCell.value = null;
        String cellId = IndexUtil.generateCellId(cell.rowId, cell.cellId);
        Object orn = colRNMap.get(cellId);
        int colrn = (orn == null? cell.repeatedNum : (Integer)orn);
        newCell.repeatedNum = cell.repeatedNum = colrn;
        newCell.rowId = target.rowId;
        newCell.cellIndex =cell.cellIndex;
        if(!target.cellList.contains(newCell))
          target.cellList.add(newCell);
      }
    }
    return target;
  }

  private Row splitRow(ConversionContext context,Sheet sheet, Row row,int rowIndex)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");    
    ConversionUtil.Row preUniqueRow = row;
    boolean isSplit = false;
    ConversionUtil.Row imgRow = null;
    
    for(int i = rowIndex; i >= 0 && !uniqueRowList.contains(preUniqueRow); i--)
    {
      String rId = sheet.rowIdArray.get(i);
      preUniqueRow = (Row) index.getJsonDataObject(rId);
      if(index.containsImageInRow(rId) && !isSplit)
      {
        imgRow = preUniqueRow;
        isSplit = true;
      }
    }
    
    if(preUniqueRow !=null && isSplit)
    {
      int urn = preUniqueRow.repeatedNum;
      if(imgRow.rowIndex>preUniqueRow.rowIndex)
          preUniqueRow.repeatedNum = imgRow.rowIndex - preUniqueRow.rowIndex - 1;

      int rn = urn - (preUniqueRow.repeatedNum + imgRow.repeatedNum + 1);
      if(rn >=0)
      {
        copyCellsToRow(context,preUniqueRow,imgRow);
        if(rn >0 )
        {
          Row lastRow = new ConversionUtil.Row();
          lastRow.sheetId = sheet.sheetId;
          lastRow.rowIndex = imgRow.rowIndex + 1;
          lastRow.repeatedNum = rn - 1;
          copyCellsToRow(context,preUniqueRow,lastRow);
          return lastRow;
        }
      }
      else
        preUniqueRow.repeatedNum  = urn;
    }
    return null;
  }
  /**
   * return the row which covered the row at rowIndex
   * 
   * @param rowIndex
   * @return return itself no row covered
   */
  private ConversionUtil.Row getCoveredRow(ConversionContext context, ConversionUtil.Sheet sheet, int rowIndex, List<ConversionUtil.Row> coveredRowList)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    String rowId = sheet.rowIdArray.get(rowIndex);
    ConversionUtil.Row row = (Row) index.getJsonDataObject(rowId);
    Map<String, Integer> rnMap = (Map<String, Integer>) context.get("InitialRowRepeatNumber");
    Map<String, Integer> colRNMap = (Map<String, Integer>) context.get("InitialRepeatNumber");
    if (row == null)
    {
      row = new ConversionUtil.Row();
      row.sheetId = sheet.sheetId;
      row.rowId = rowId;
      row.rowIndex = rowIndex;
    }
    else
    {
      if(rowIndex < row.rowIndex)
        row.rowIndex = rowIndex;
      if(!rnMap.containsKey(rowId))
        rnMap.put(row.rowId, row.repeatedNum);
    }
    
    if(rowIndex == sheet.rowIdArray.size() - 1)
    {
      ConversionUtil.Row lastRow = splitRow(context, sheet, row,rowIndex);
      if(lastRow != null)
        return lastRow;
    }
    
    if(index.containsImageInRow(rowId))
    {
      ConversionUtil.Row preUniqueRow = row;
      for(int i = rowIndex; i >= 0 && !uniqueRowList.contains(preUniqueRow); i--)
      {
        String rId = sheet.rowIdArray.get(i);
        preUniqueRow = (Row) index.getJsonDataObject(rId);
      }
      if(preUniqueRow !=null )
      {
        int indent = rowIndex - preUniqueRow.rowIndex - 1;
        if(indent >= 0 && indent < preUniqueRow.repeatedNum)
        {
        	preUniqueRow.repeatedNum = indent;
        	copyCellsToRow(context,preUniqueRow,row);
        }
      }
      return row;
    }
     
    
    if(!row.cellList.isEmpty())
    {
      return row;
    }
    
    HashMap<String,List<Integer>> rowBreakMap = (HashMap<String,List<Integer>>) context.get("rowBreakMap");
    int preBreakRow = 0;
    if(rowBreakMap != null)
    {
      List<Integer> rowBreakList = rowBreakMap.get(sheet.sheetId);
      if(rowBreakList != null)
      {
    	int columnBreakLength = rowBreakList.size() - 1;
    	for(int colIndex = columnBreakLength; colIndex >= 0; colIndex--)
    	{
    	  int rowBreakIndex = rowBreakList.get(colIndex);
    	  if(rowBreakIndex == rowIndex)
    	  {
    		  //return row;
    		  preBreakRow = rowIndex - 1;
    		  break;
    	  }
    	  else if(rowBreakIndex < rowIndex)
    	  {
    		preBreakRow = rowBreakIndex;
    		break;
    	  }
    	}
      }
    }
    
    for (int i = rowIndex - 1; i >= 0; i--)
    {
      String previousRowId = sheet.rowIdArray.get(i);
      ConversionUtil.Row previousRow = (Row) index.getJsonDataObject(previousRowId);
//        sheet.getRowById(previousRowId);
      
      //the non empty previous row id might be created only for preserve or other results, 
      //and does not have any style or cell content in json
      //so here do not get the last none empty previous row to check if it can be used for current row
      //but check if it is in uniqueRowList.
      if (previousRow != null)
      {
        
        int rowIndent = rowIndex - (previousRow.rowIndex + previousRow.repeatedNum);
        
        if(rowIndent <0 )
        {
          if(ConversionUtil.hasValue(previousRowId))
            previousRow.repeatedNum = row.rowIndex - previousRow.rowIndex -1 ;
        }
        
        int uniqueRowIndent = rowIndent;
        ConversionUtil.Row preSplitRow = previousRow;
        ConversionUtil.Row preUniqueRow = previousRow;
        boolean isSplit = false;
        for(; i >= 0 && !uniqueRowList.contains(preUniqueRow); i--)
        {
          String rId = sheet.rowIdArray.get(i);
          preUniqueRow = (Row) index.getJsonDataObject(rId);
          if(preUniqueRow !=null && !preUniqueRow.cellList.isEmpty())
          {
            if(!isSplit)
              preSplitRow = preUniqueRow;
            else if(preUniqueRow.rowIndex + preUniqueRow.repeatedNum >= row.rowIndex)
            {
              copyCellsToRow(context, preUniqueRow,row);
            }
            break;
          }
          if(!isSplit && index.containsImageInRow(rId) )
          {
            preSplitRow = preUniqueRow;
            isSplit = true;
          }
        }
        if(preSplitRow != null )
          uniqueRowIndent = rowIndex - (preSplitRow.rowIndex + preSplitRow.repeatedNum);
        
        if (uniqueRowIndent <= 0 && preSplitRow != null)
        {
          if(!rnMap.containsKey(preSplitRow.rowId))
            rnMap.put(preSplitRow.rowId, preSplitRow.repeatedNum);
          if(!"".equals(rowId) && index.isPreservedRow(rowId))
          {
            preSplitRow.repeatedNum = row.rowIndex - preSplitRow.rowIndex - 1;          
            return row;
          }
          else
          {
            // if previousrow is for preserve, so j >= previousRow.rowIndex
    	    for(int j = rowIndex - 1; j >= preSplitRow.rowIndex; j--)
    	    {
      		  String tmpRowId = sheet.rowIdArray.get(j);
    		  //If there is row used for preserve during the repeated area, split it.
    		  if(!"".equals(tmpRowId) && (index.isPreservedRow(tmpRowId) || index.containsImageInRow(tmpRowId)) || preBreakRow == j)
    		  {
    		    row.rowId = sheet.rowIdArray.get(j+1);
     			//row.cellList = previousRow.cellList; 
    			// need clone cellList? Yes, change cells' id
    			copyCellsToRow(context,preSplitRow,row);
    			row.rowIndex = j+1;
    			row.height = preSplitRow.height;
    			row.styleId = preSplitRow.styleId;
    			row.repeatedNum = preSplitRow.repeatedNum - (j - preSplitRow.rowIndex + 1);
    			row.visibility = preSplitRow.visibility ;
    			row.cellmap = preSplitRow.cellmap;
    			row.rowMetaJSON = preSplitRow.rowMetaJSON; // repeat number is not correct, but seems doesn't matter
    			if(!rnMap.containsKey(preSplitRow.rowId))
    			  rnMap.put(preSplitRow.rowId, preSplitRow.repeatedNum);  
    			preSplitRow.repeatedNum = j - preSplitRow.rowIndex;
    			if(preBreakRow == j && preSplitRow.repeatedNum > 0)
    			  preSplitRow.repeatedNum--;
    			return row;
        	  } 
        	}
            return preSplitRow;
          }           
        }
        else
        {
          if(rowIndent > 1 && !ConversionUtil.hasValue(row.rowId))
    	  {
        	if(preBreakRow > previousRow.rowIndex + previousRow.repeatedNum)
        	{
              row.repeatedNum = rowIndex - preBreakRow - 1;
              row.rowIndex = preBreakRow + 1;
              row.rowId = ""; 
        	}
        	else
        	{
    	      // this row must be default styled row(default row height, row without default cell style)
              row.repeatedNum = rowIndent - 1;
              row.rowIndex = previousRow.rowIndex + previousRow.repeatedNum + 1;
              row.rowId = "";
        	}
    	  }
          else if(rowIndent <= 0)
    	  {
    	    //if the row need preserve, then split the repeat number for the nextRow which is right after the row
    	    if(index.isPreservedRow(rowId))
    	    {
    	      int rn = 0 - rowIndent - 1;
    	      if(rn >= 0)
    	      {
    	        //create the next row with the previous row style if the previous row can cover the next row(rowIndex+1)
    	        //but is split by current row
    	        ConversionUtil.Row lastCoveredRow = null;
    	        if(coveredRowList.size() > 0)
    	          lastCoveredRow = coveredRowList.get(coveredRowList.size() - 1);
    	        int nextRowIndex = rowIndex + 1;
    	        boolean bNeedNext = true;
    	        if(lastCoveredRow != null && lastCoveredRow.rowIndex >= nextRowIndex)
    	        {
    	          int rnGap = lastCoveredRow.rowIndex - nextRowIndex - 1;
    	          if(rnGap < 0)
    	          {
    	            bNeedNext = false;
    	            if(rnGap < -1)
    	              LOG.log(Level.WARNING, "getCoveredRowList must collect the wrong cells");
    	          }
    	          if(rnGap > rn)
                  {
                    LOG.log(Level.WARNING, "TODO: should fill the default cells");
                  }
                  rn = rn > rnGap?rnGap: rn;
    	        }
    	        if(bNeedNext)
    	        {
      	          ConversionUtil.Row nextRow = new ConversionUtil.Row();
        	      nextRow.sheetId = sheet.sheetId;
        	      nextRow.rowId = "";
        	      nextRow.rowIndex = nextRowIndex;
        	      nextRow.repeatedNum = rn;
        	      copyCellsToRow(context, previousRow, nextRow);
        	      coveredRowList.add(nextRow);
    	        }
    	      }
    	      
    	      copyCellsToRow(context, previousRow, row);
    	    }
    	    else
    	    {
    	      int rn = 0 - rowIndent;
    	      boolean bCover = true;
    	      ConversionUtil.Row lastCoveredRow = null;
              if(coveredRowList.size() > 0)
                lastCoveredRow = coveredRowList.get(coveredRowList.size() - 1);
              if(lastCoveredRow != null && lastCoveredRow.rowIndex >= rowIndex)
              {
                int rnGap = lastCoveredRow.rowIndex - rowIndex - 1;
                if(rnGap < 0)
                {
                  LOG.log(Level.WARNING, "getCoveredRowList must collect the wrong cells");
                  bCover = false;
                }
                if(rnGap > rn)
                {
                  LOG.log(Level.WARNING, "TODO: should fill the default cells");
                }
                rn = rn > rnGap?rnGap: rn;
              }
              if(bCover)
              {
        	      row.repeatedNum = rn;
        	      copyCellsToRow(context, previousRow, row);
              }
    	    }
    	  }
          return row;
        }
      }
    }
    // if still not return, return the row at the 1st
    if (!ConversionUtil.hasValue(rowId))
    {
      row.repeatedNum = rowIndex;
      row.rowIndex = 0;
      row.rowId = "";
    }
    return row;
  }

  private ArrayList<ConversionUtil.Row> getCoveredRowList(ConversionContext context, ConversionUtil.Sheet sheet)
  {
    ArrayList<ConversionUtil.Row> coveredRowList = new ArrayList<ConversionUtil.Row>();
    for (int rowIndex = sheet.rowIdArray.size() - 1; rowIndex >= 0;)
    {
      ConversionUtil.Row row = getCoveredRow(context, sheet, rowIndex, coveredRowList);
      coveredRowList.add(row);
      rowIndex = row.rowIndex - 1;
    }
    return coveredRowList;
  }

  public OdfElement createNewElement(ConversionContext context, Object input, OdfElement parent)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("Target");
    try
    {
      TableTableElement tableElement = new TableTableElement(contentDom);
      return tableElement;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "can not create a table", e);
    }
    return null;
  }

  private ArrayList getColumnList(ConversionContext context, ConversionUtil.Sheet sheet)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    ArrayList coveredColumnList = new ArrayList();
    List<Column> groupCol = null;
    boolean colGroupStart = false;
    int size = sheet.columnIdArray.size();
    int columnIndex = size - 1;
    String startColId = null;
    String endColId = null;
    for (int cIndex = size - 1; cIndex >= 0;)
    {
      while (cIndex > columnIndex)
      {
        String colId = sheet.columnIdArray.get(cIndex);
        if (colId.equals(startColId) && colGroupStart)
        {
          groupCol = reverseList(groupCol);
          coveredColumnList.add(groupCol);
          colGroupStart = false;
        }
        cIndex--;
      }
      if (cIndex == -1)
        continue;

      ConversionUtil.Column column = getCoveredColumn(context, index, sheet, cIndex);
      String groupId = index.getGroupId(column.columnId);
      PreserveNameIndex nameIndex = index.getGroupIndex(groupId);

      if (nameIndex != null)
      {
        startColId = nameIndex.startColId;
        endColId = nameIndex.endColId;
      }
      if (colGroupStart)
      {
        groupCol.add(column);
        if (groupId != null && !"".equals(groupId))
        {
          groupCol = reverseList(groupCol);
          coveredColumnList.add(groupCol);
          colGroupStart = false;
        }

      }
      else
      {
        if (groupId != null && !"".equals(groupId))
        {
          groupCol = new ArrayList<Column>();
          groupCol.add(column);
          colGroupStart = true;
          if(startColId == endColId)
          {
            colGroupStart = false;
            coveredColumnList.add(groupCol);
          }
        }
        else
        {
          coveredColumnList.add(column);
        }
      }
      columnIndex = column.columnIndex - 1;
      cIndex--;
    }
    return coveredColumnList;
  }
  
  private List<Column> reverseList(List<Column> colGroup)
  {
    int size = colGroup.size();
    for( int i = 0; i < size/2; i++)
    {
      Column column = colGroup.get(i);
      colGroup.set(i, colGroup.get(size- i - 1));
      colGroup.set(size- i - 1, column);
    }
    return colGroup;
  }
  
  public void endElement(ConversionContext context)
  {
    ContextInfo info = (ContextInfo) context.get("ContextInfo");
    if (info.hasStyledColumn)
    {
      int sparedRowCount = ConversionConstant.MAX_ROW_NUM - info.maxRowCnt;
      if (sparedRowCount > 0)
      {
//        if (sparedRowCount > 1)
//        {
//          ConversionUtil.Row defaultRow = new ConversionUtil.Row();
//          defaultRow.repeatedNum = sparedRowCount - 2;
//          OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW).convert(context, defaultRow,
//              target);
//
//        }
//        // NOTES HERE:
//        // insert last row with repeatedNum = 0
//        // so that Symphony can display the generated document with shortest vertical scroll bar
//        ConversionUtil.Row defaultRow = new ConversionUtil.Row();
//        OdfElementConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW).convert(context, defaultRow,
//            target);
        Sheet sheet = (Sheet)context.get("Sheet");
        String sheetRowStyleName = TableRowStyleConvertor.getSheetDefaultRowStyleName(sheet);
        HashMap<String,Integer> rowStyleHeightMap = (HashMap<String,Integer>) context.get("rowStyleHeightMap");
        if(!rowStyleHeightMap.containsKey(sheetRowStyleName))
          sheetRowStyleName = null;
        if (sparedRowCount > 1)
        {
          TableTableRowElement newRowElement = new TableTableRowElement((OdfFileDom) target.getOwnerDocument());
          ConversionUtil.Row defaultRow = new ConversionUtil.Row();
          defaultRow.repeatedNum = sparedRowCount - 2;
          newRowElement.setTableNumberRowsRepeatedAttribute(defaultRow.repeatedNum + 1 );
          AttributesImpl attrs = new AttributesImpl();
          attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_ROWS_REPEATED, "", Integer.toString(defaultRow.repeatedNum + 1));
          if(sheetRowStyleName != null)
            attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME, "", sheetRowStyleName);
          try
          {
            mXmlWriter.startElement("", "", ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW, attrs);
            int cellCount = getOdfCellCount(newRowElement);
            ODSConvertUtil.fillRow(mXmlWriter,cellCount, info.maxColCnt);
            mXmlWriter.endElement("", "", ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW);
          }
          catch (SAXException e)
          {
            e.printStackTrace();
          }
          
        }
        // NOTES HERE:
        // insert last row with repeatedNum = 0
        // so that Symphony can display the generated document with shortest vertical scroll bar
        ConversionUtil.Row defaultRow = new ConversionUtil.Row();
        try
        {
          AttributesImpl attrs = null;
          if(sheetRowStyleName != null)
          {
            attrs = new AttributesImpl();
            attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME, "", sheetRowStyleName);
          }
          TableTableRowElement newRowElement = new TableTableRowElement((OdfFileDom) target.getOwnerDocument());
          mXmlWriter.startElement("", "", ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW, attrs);
          int cellCount = getOdfCellCount(newRowElement);
          ODSConvertUtil.fillRow(mXmlWriter,cellCount, info.maxColCnt);
          mXmlWriter.endElement("", "", ConversionConstant.ODF_ELEMENT_TABLETABLE_ROW);
        }
        catch (SAXException e)
        {
          e.printStackTrace();
        }
      }
    }
    endOutput();
  }  
  
  private int getOdfCellCount(TableTableRowElement odfRowElement)
  {
    int cellCount = 0;
    NodeList nodeList = odfRowElement.getChildNodes();
    TableTableCellElementBase odfCellElement = null;
    for (int i = 0; i < nodeList.getLength(); i++)
    {
      Node n = nodeList.item(i);
      if (n instanceof TableTableCellElementBase)
      {
        odfCellElement = (TableTableCellElementBase) n;
        int cellRepeatedNum = odfCellElement.getTableNumberColumnsRepeatedAttribute().intValue();
        cellCount += cellRepeatedNum;
      }
    }
    return cellCount;
  }

  private Column getColumnByIndex(ConversionUtil.Sheet sheet, int columnIndex)
  {
    String columnId = sheet.columnIdArray.get(columnIndex);
    ConversionUtil.Column column = sheet.getStyledColumnById(columnId);
    if (column == null)
    {
      column = new ConversionUtil.Column();
      column.sheetId = sheet.sheetId;
      column.columnId = columnId;
      column.columnIndex = columnIndex;
    }
    return column;
  }

  /**
   * return the column which covered the column at rowIndex
   * 
   * @param columnIndex
   * @return return itself no column covered
   */
  private ConversionUtil.Column getCoveredColumn(ConversionContext context, JsonToODSIndex index, ConversionUtil.Sheet sheet, int columnIndex)
  {
    String columnId = sheet.columnIdArray.get(columnIndex);
    ConversionUtil.Column column = sheet.getStyledColumnById(columnId);
    if (column == null)
    {
      column = new ConversionUtil.Column();
      column.sheetId = sheet.sheetId;
      column.columnId = columnId;
      column.columnIndex = columnIndex;
    }
    else
      return column;
    
    HashMap<String,List<Integer>> columnBreakMap = (HashMap<String,List<Integer>>) context.get("columnBreakMap");
    int preBreakColumn = -1;
    if(columnBreakMap != null)
    {
      List<Integer> columnBreakList = columnBreakMap.get(sheet.sheetId);
      if(columnBreakList != null)
      {
    	int columnBreakLength = columnBreakList.size() - 1;
    	for(int colIndex = columnBreakLength; colIndex >= 0; colIndex--)
    	{
    	  int columnBreakIndex = columnBreakList.get(colIndex);
    	  if(columnBreakIndex == columnIndex)
    		return column;
    	  else if(columnBreakIndex < columnIndex)
    	  {
    		preBreakColumn = columnBreakIndex;
    		break;
    	  }
    	}
      }
    }
    
    String groupId = index.getGroupId(columnId);
    
    ConversionUtil.Column previousColumn = null;
    for (int i = columnIndex - 1; i >= 0; i--)
    {
      String previousColumnId = sheet.columnIdArray.get(i);
      previousColumn = sheet.getStyledColumnById(previousColumnId);
      String preGroupId = index.getGroupId(previousColumnId);
      if(ConversionUtil.hasValue(preGroupId))
      {
        if( null != previousColumn ){
          int columnIndent = columnIndex - (previousColumn.columnIndex + previousColumn.repeatedNum);
          if(columnIndent > 0)
        	  column.repeatedNum = columnIndent;
          else {
        	  previousColumn.repeatedNum = columnIndex - previousColumn.columnIndex - 1;
              column.styleId = previousColumn.styleId;
              column.visibility = previousColumn.visibility;
          }
        }
        return column;
      }
      if (previousColumn != null)
      {
        int columnIndent = columnIndex - (previousColumn.columnIndex + previousColumn.repeatedNum);
        if (columnIndent <= 0){
          if(ConversionUtil.hasValue(groupId))
          {
            previousColumn.repeatedNum = columnIndex - previousColumn.columnIndex - 1;
            column.styleId = previousColumn.styleId;
            return column;
          }
          return previousColumn;
        } else
        {
          if(ConversionUtil.hasValue(groupId))
        	return column;
          if (columnIndent > 1)
          {
        	if(preBreakColumn > previousColumn.columnIndex + previousColumn.repeatedNum)
        	{
              column.repeatedNum = columnIndex - preBreakColumn - 1;
              column.columnIndex = preBreakColumn + 1;
              column.columnId = "";	
        	}
        	else
        	{	
              // this row must be default styled row(default row height, row without default cell style)
              column.repeatedNum = columnIndent - 1;
              column.columnIndex = previousColumn.columnIndex + previousColumn.repeatedNum + 1;
              column.columnId = "";
        	}
          }
          return column;
        }
      }
    }
    // if still not return, return the column at the 1st
    column.repeatedNum = columnIndex;
    column.columnIndex = 0;
    column.columnId = "";
    return column;
  }
}
