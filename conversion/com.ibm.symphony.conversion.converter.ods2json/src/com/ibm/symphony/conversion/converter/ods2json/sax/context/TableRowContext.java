/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.context;

import java.util.ArrayList;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.style.OdfStyleTableRowProperties;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.ContextInfo;
import com.ibm.symphony.conversion.converter.ods2json.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.attribute.AttributeConvertorFactory;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;

public class TableRowContext extends GeneralContext
{

  private static final String CLAZZ = TableRowContext.class.getName();

  private static final Logger LOG = Logger.getLogger(CLAZZ);

  private boolean bInvalid;//if the context is invalid or not, invalid means that it should not convert as JSONModel

  public TableRowContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
//    ConversionUtil.Sheet sheet = (Sheet) mContext.get("Sheet");
//    if (sheet == null || info.rowIndex >= ConversionConstant.MAX_ROW_NUM)
//      mbInvalid = true;
//    else
//      mbInvalid = false;

    mbChildPreserve = true;// collect all the child cell context, used by ODSConvertUtil.getRowDefaultCellStyle
  }

  public void startElement(AttributesImpl attributes)
  {
//    if (bInvalid)
//      return;
    mbGenerateXMLIdAtEnd = true;//set it when mbInvalid = false
    super.startElement(attributes);
    ContextInfo info = (ContextInfo) mContext.get("TableInfo");
    info.cellColumnIndex = 0;

    ConversionUtil.Sheet sheet = (Sheet) mContext.get("Sheet");
    ConversionUtil.Row row = new ConversionUtil.Row();
    this.mTarget = row;
    // setDefaultRowStyle(odfRow, info);
    row.rowIndex = info.rowIndex;
    row.sheetId = sheet.sheetId;

    String visibility = AttributeConvertorFactory.getInstance().getConvertor("table:visibility").convert(mContext, this, row);
    row.visibility = visibility;
    String rowRepeateNumberAttr = this.getAttrValue("table:number-rows-repeated");
    int rowRepeateNumber = (rowRepeateNumberAttr == null) ? 1 : Integer.parseInt(rowRepeateNumberAttr);
    if ((rowRepeateNumber > 1))
      row.repeatedNum = (rowRepeateNumber - 1);
    // ////////////////////////////////////////////////
    // collect default cell style of row
    if (info.bRowHasDefaultCellStyle)
    {
      String defaultRowCellStyleName = getRowDefaultCellStyle(this, info.columnIndex);
      row.styleId = ODSConvertUtil.findCellStyleId(mContext, defaultRowCellStyleName);
    }
    
    int rowIndex = info.rowIndex+ rowRepeateNumber;
    if(ConversionUtil.isOutOfRowCapacilty(info.rowIndex + 1) && rowIndex >= ConversionConstant.MAX_ROW_INDEX )
      bInvalid = true;
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes){
    if (bInvalid)
      return super.createChildContext(uri, localName, qName, attributes);
    
    GeneralContext context = null;
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case TABLE_TABLE_CELL :
      case TABLE_COVERED_TABLE_CELL :
        context = new TableCellContext(mImport, uri, localName, qName, mTarget);
        break;
      default:
        context =  new GeneralContext(mImport, uri, localName, qName, mTarget);
    }
    return context;
  }

  public void endElement()
  {
    ConversionUtil.Row row = (ConversionUtil.Row) mTarget;
    ConversionUtil.Document document = (Document) mContext.get("Target");
    ConversionUtil.Sheet sheet = (Sheet) mContext.get("Sheet");
    ContextInfo info = (ContextInfo) mContext.get("TableInfo");
    int rowRepeateNumber = row.repeatedNum + 1;
    int rowIndex = info.rowIndex+ rowRepeateNumber;
    if(ConversionUtil.isOutOfRowCapacilty(info.rowIndex + 1) && rowIndex >= ConversionConstant.MAX_ROW_INDEX)
    {
      bInvalid = true;
      info.rowIndex += rowRepeateNumber;
    }
    if (bInvalid)
      return;
    // get the styled previous row of the current row
    int uniqueRowSize = document.uniqueRows.uniqueRowList.size();
    ConversionUtil.Row previousRow = (uniqueRowSize > 0) ? document.uniqueRows.uniqueRowList.get(uniqueRowSize - 1) : null;
    // if the previous row in rows of meta.js is not belong to the current sheet, then set it to null
    if ((previousRow != null) && !previousRow.sheetId.equals(sheet.sheetId))
      previousRow = null;
    String sHeight = XMLUtil.getStyleProperty(mContext, this, OdfStyleTableRowProperties.RowHeight);
    int height = 0;
    if (sHeight != null)
      height = Length.parseInt(sHeight, Unit.PIXEL);
    boolean isOptHeight = true;
    String opt = XMLUtil.getStyleProperty(mContext, this, OdfStyleTableRowProperties.UseOptimalRowHeight);
    if (opt != null)
      isOptHeight = Boolean.parseBoolean(opt);
    
    // if the row is no default width or cells of this row has specific style, then add to rows in meta.js
    if ((height != ConversionUtil.Row.defaultHeight) || hasCellStyleForRow(row, info.bRowHasDefaultCellStyle)
        || ConversionUtil.hasValue(row.visibility))
    {
      //Modify, the non empty previous row id might be created only for preserve, 
      //and does not have any style or cell content in json
      //so here do not get the last none empty previous row to check if it can be merged with the current row
      //but use the previousRow get from the uniqueRowList.
      /*
      // get the none empty previous row id, check if this previous row
      // 1) does not have any text content and so does current row
      // 2) the row index plus the repeat number is continuous with the current row index
      // 3) has the same row styleId and row height with current row
      // if the above conditions have been fulfilled, then merge these two rows
      // which is to modify the repeat number of the previous row
      String previousRowId = "";
      int previousRowIndex = (sheet.rowIdArray.size() > info.rowIndex) ? (info.rowIndex - 1) : (sheet.rowIdArray.size() - 1);
      for (int i = previousRowIndex; i >= 0; i--)
      {
        previousRowId = sheet.rowIdArray.get(i);
        previousRowIndex = i;
        if (ConversionUtil.hasValue(previousRowId))
          break;
      }
       */  	
      if ((previousRow != null) //&& previousRow.rowId.equals(previousRowId)
          && (previousRow.styleId.equals(row.styleId))
          && (previousRow.height == height)
          && ((previousRow.rowIndex + previousRow.repeatedNum + 1) == info.rowIndex)
          && hasSameCellListWithEmptyTextContent(previousRow, row)
          && !hasImageinRow(previousRow)
          && !hasImageinRow(row)
          // && isEmptyRowTextContent(previousRow)
          // && isEmptyRowTextContent(row)
          && ((!ConversionUtil.hasValue(previousRow.visibility) && !ConversionUtil.hasValue(row.visibility)) || (ConversionUtil
              .hasValue(previousRow.visibility) && previousRow.visibility.equalsIgnoreCase(row.visibility))))
      {
        previousRow.repeatedNum += rowRepeateNumber;
      }
      else
      {
        // here row.rowId == "", means that the cells of this row do not have any content
        if(row.rowIndex < sheet.rowIdArray.size())
          row.rowId = sheet.rowIdArray.get(row.rowIndex);
        if (!ConversionUtil.hasValue(row.rowId))
        {
          row.rowId = document.createId(true);// ConversionConstant.ROWID + document.maxRowId++;
        }

        // if the current row has its own style, then put the previous number of empty string as the place holder in rowIdArray
        int emptyRowCount = info.rowIndex - sheet.rowIdArray.size();
        for (int i = 0; i < (emptyRowCount + 1); i++)
          sheet.rowIdArray.add("");
        sheet.rowIdArray.set(info.rowIndex, row.rowId);
        
        row.height = (int) height;
        row.isOptimizeHeight = isOptHeight;
        // if the previous row does not cover the current row, and previous row has default cell style and default height
        // then delete it from uniqueRowList        
        if ((previousRow != null) && !ConversionUtil.Row.isStyledRow(previousRow))
          document.uniqueRows.uniqueRowList.remove(uniqueRowSize - 1);
        // might be added even the row is not styled row, will be
        document.uniqueRows.uniqueRowList.add(row);
      }
    }
    if (info.bRowHasDefaultCellStyle)
    {
      if (row.cellList.size() > 0)
      {
        sheet.rowList.add(row);
        // repeat the row in content.js when
        // 1)row repeat number > 1
        // 2)row has the default row style(then it will not be in the uniqueRowList)
        // 3)row does not have content but contains the empty cell with its own style
        if ((rowRepeateNumber > 1) && (!document.uniqueRows.uniqueRowList.contains(row)))
        {
          int emptyRowCount = info.rowIndex + (rowRepeateNumber - 1) - sheet.rowIdArray.size();
          for (int i = 0; i < (emptyRowCount + 1); i++)
            sheet.rowIdArray.add("");
          for (int i = 0; i < (rowRepeateNumber - 1); i++)
          {
            ConversionUtil.Row repeateRow = new ConversionUtil.Row();
            repeateRow.rowId = document.createId(true);// ConversionConstant.ROWID + document.maxRowId++;
            repeateRow.rowIndex = info.rowIndex + i + 1;
            repeateRow.cellList = row.cellList;
            sheet.rowList.add(repeateRow);
            sheet.rowIdArray.set(repeateRow.rowIndex, repeateRow.rowId);
          }
        }
      }
    }
    else
    {
      // when converting without row has default cell style
      // the current row might be merged with previous row when they are the same
      if (row.cellList.size() > 0)
      {
        // if previous row(which is get from uniqueRowList) cover this row, do not add it to content
        // and set the rowid to "" of rowIdArray at row.rowIndex
        if ((previousRow == null) || ((previousRow.rowIndex + previousRow.repeatedNum) < row.rowIndex))
        {
          sheet.rowList.add(row);
        }
        //should not remove the row id in row id array, because the row id will be set in odf draft which should be preserve
        //we should keep it in row id array
//        else if (sheet.rowIdArray.size() > info.rowIndex)
//        {
//          sheet.rowIdArray.set(info.rowIndex, "");
//          optimizeIdArray(sheet.rowIdArray);
//        }
      }
    }

    if(!ConversionUtil.hasValue(row.rowId)){
      if(row.cellList.size() == 0){
          //for defect 3147
          //cell does not have style and content, but the column have style that we do not support,
          //this cell will not add to row, but the row should generate xml id to preserve
          //but we do not treat it as out of capacity, so call updateIdArray, set bMax=true
          row.rowId = ConversionUtil.updateIdArray(info.rowIndex, sheet, document, true, true);
      }
    }
    this.addIdOnOdfElement(row.rowId);
    ConversionUtil.Row prepreviousRow = (sheet.rowList.size() > 1) ? sheet.rowList.get(sheet.rowList.size() - 2) : null;
    if (prepreviousRow!=null) 
    {
    	prepreviousRow.storeToJSONString();
    }
    super.endElement();

    info.rowIndex += rowRepeateNumber;
    sheet.maxRowIndex += rowRepeateNumber;
    //the cellCnt here also include the style
    //if the file size limitation for "cell-max-num" include the style cell, should enable the following code
//    info.cellCnt += row.cellList.size();
    
    //check if out of capacity
    // sheet.rowList.contains(row) means that
    // even rowIndex  is outofcapacity, and it is not empty row, but it might covered by previousRow repeatNumber, it should still not outofcapacity
//    if( (ConversionUtil.isOutOfRowCapacilty(row.rowIndex + 1) && !ConversionUtil.isEmptyRow(row) && sheet.rowList.contains(row))
//      || ConversionUtil.isOutOfCellCapacity(info.cellCnt, info.formulaCnt))
//    info.outOfCapacity = true;
    if( ConversionUtil.isOutOfRowCapacilty(sheet.rowIdArray.size())
        || ConversionUtil.isOutOfCellCapacity(info.cellCnt, info.formulaCnt))
      info.setOutOfCapacity(true);
  }

  private boolean isEmptyCell(ConversionUtil.Cell cell)
  {
    if (ConversionUtil.hasValue(cell.value) || ConversionUtil.hasValue(cell.showValue) || ConversionUtil.hasValue(cell.calculateValue)
        || cell.comment != null )
      return false;
    return true;
  }

  // compare the cell list of these two rows
  private boolean hasSameCellListWithEmptyTextContent(ConversionUtil.Row row1, ConversionUtil.Row row2)
  {
    if (row1.cellList.size() != row2.cellList.size())
      return false;
    for (int i = 0; i < row1.cellList.size(); i++)
    {
      ConversionUtil.Cell cell1 = row1.cellList.get(i);
      ConversionUtil.Cell cell2 = row2.cellList.get(i);
      if (!cell1.styleId.equals(cell2.styleId) || cell1.repeatedNum != cell2.repeatedNum || !isEmptyCell(cell1) || !isEmptyCell(cell2)
          || cell1.colSpan > 1 || cell2.colSpan > 1)
        return false;
    }
    return true;
  }
  
  private boolean hasImageinRow(Row row)
  {
    Map<String,Boolean> cellImageMap = (Map<String, Boolean>) mContext.get("cellImageMap");
    Iterator<String> imageMap = cellImageMap.keySet().iterator();
    while(imageMap.hasNext())
    {
      String cellId = imageMap.next();
      if(ConversionUtil.hasValue(row.rowId) && cellId.startsWith(row.rowId+"_"))
        return true;
    }
    return false;
  }

  // check if the row has the specified style
  private boolean hasCellStyleForRow(ConversionUtil.Row row, boolean bRowHasDefaultCellStyle)
  {
    if (ConversionUtil.hasValue(row.styleId))
      return true;
    if (!bRowHasDefaultCellStyle)
    {
      int size = row.cellList.size();
      for (int i = 0; i < size; i++)
      {
        ConversionUtil.Cell cell = row.cellList.get(i);
        if (ConversionUtil.hasValue(cell.styleId))
          return true;
      }
    }
    return false;
  }

  // cellCount is the cell number of this current row
  public static String getRowDefaultCellStyle(TableRowContext rowConvertor, int cellCount)
  {
    // check if the defaultCellStyle is the default style of the current document
    // which is defined in styles.xml and does not involved in cellStyleNameIdMap
    String defaultRowCellStyleName = rowConvertor.getAttrValue("table:default-cell-style-name");

    // ODS file might not store the default cell style in row,
    // so here check if all the cells of this row have the same cell style and they are all empty cells.
    if (!ConversionUtil.hasValue(defaultRowCellStyleName))
    {
      ArrayList<GeneralContext> cellsConvertor = rowConvertor.getChildConvertor();
      if (cellsConvertor.size() == 1)
      {
        TableCellContext cellCon = (TableCellContext) cellsConvertor.get(0);
        Object target = cellCon.getTarget();
        if(target != null)
        {
          ConversionUtil.Cell cell = (ConversionUtil.Cell)target;
          if (!ConversionUtil.hasValue(cell.value))
          {
            defaultRowCellStyleName = cellCon.getAttrValue("table:style-name");
          }
        }
      }else if(cellCount > 255)//extract the most occurred cell style as the row default cell style
      {

        // cellStyleCountMap is used to count the cell style repeat number
        // the largest number of cell style is used to as the default cell style of this row
        HashMap<String, Integer> cellStyleCountMap = new HashMap<String, Integer>();
        for (int cellColumnIndex = 0; cellColumnIndex < cellCount;)
        {
          TableCellContext cellCon = (TableCellContext) cellsConvertor.get(cellColumnIndex);
          String cellStyleName = cellCon.getAttrValue("table:style-name");
          String cellRepeateAttr = cellCon.getAttrValue("table:number-columns-repeated");
          int cellRepeateNumber = (cellRepeateAttr == null)?1:Integer.parseInt(cellRepeateAttr);
          if (ConversionUtil.hasValue(cellStyleName))
          {
            Integer cellStyleCount = cellStyleCountMap.get(cellStyleName);
            cellStyleCountMap
                .put(cellStyleName, (cellStyleCount == null) ? cellRepeateNumber : cellStyleCount.intValue() + cellRepeateNumber);
          }
          cellColumnIndex += cellRepeateNumber;
        }
        if (!ConversionUtil.hasValue(defaultRowCellStyleName))
        {
          int maxCount = 0;
          Set<Entry<String, Integer>> styleCountEntries = cellStyleCountMap.entrySet();
          for (Iterator iterator = styleCountEntries.iterator(); iterator.hasNext();)
          {
            Entry<String, Integer> entry = (Entry<String, Integer>) iterator.next();
            String styleName = entry.getKey();
            int count = entry.getValue();
            if ((count > 200) && (maxCount < count))
            {
              maxCount = count;
              defaultRowCellStyleName = styleName;
            }
          }
        }
      }
    }
    return defaultRowCellStyleName;
  }

}
