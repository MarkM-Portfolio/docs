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

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeMasterStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleMasterPage;
import org.odftoolkit.odfdom.doc.style.OdfStylePageLayout;
import org.odftoolkit.odfdom.doc.style.OdfStylePageLayoutProperties;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Node;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.ods2json.AbstractJSONFileAccess;
import com.ibm.symphony.conversion.converter.ods2json.AbstractJSONFileAccess.JSONType;
import com.ibm.symphony.conversion.converter.ods2json.sax.ContextInfo;
import com.ibm.symphony.conversion.converter.ods2json.sax.CoverInfo;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.style.TableCellStyleHelper;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.formulalexer.IDMFormulaLexer;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.CellStyleType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;

public class TableTableContext extends GeneralContext
{
  private static final String CLAZZ = TableTableContext.class.getName();

  private static final Logger LOG = Logger.getLogger(CLAZZ);

  private boolean bInvalid;// if the context is invalid or not, invalid means that it should not convert as JSONModel

  ContextInfo mInfo;

  private int uniqueRowPos; // record the start uniqueRow index in the document.uniqueRows.uniqueRowList of this sheet

  private int uniqueColPos; // record the start uniqueCol index in the document.uniqueColumns.uniqueColList of this sheet

  private enum NEXT_OPERATION {
    NEXT_CELL, NEXT_COL, NEXT_CELL_AND_COL, NEXT_STOP
  }

  public TableTableContext(XMLImport importer, String uri, String localName, String name, Object target)
  {
    super(importer, uri, localName, name, target);
    mInfo = (ContextInfo) mContext.get("TableInfo");
    bInvalid = false;
    // Document doc = (Document) mContext.get("Target");
    // if (doc == null) // the target should not be the ConversionUtil.Sheet object
    // mbInvalid = true;
    // else
    // mbInvalid = false;
  }

  public void startElement(AttributesImpl attributes)
  {
    if (bInvalid)
      return;
    if (mInfo.getOutOfCapacity())
      return;
    mbGenerateXMLIdAtEnd = true;// the order for SAXWriter to write this element
    super.startElement(attributes);

    Document document = (Document) mContext.get("Target");
    uniqueRowPos = document.uniqueRows.uniqueRowList.size();
    uniqueColPos = document.uniqueColumns.uniqueColumnList.size();

    ContextInfo info = (ContextInfo) mContext.get("TableInfo");
    info.rowIndex = 0;
    info.columnIndex = 0;
    info.hasStyledColumn = false;
    info.maxColInRowWithValue = -1;
    info.maxColInRowWithStyle = -1;
    info.coverInfo = new CoverInfo();
    // TableTableElement odfTable = (TableTableElement) element;
    HashMap<String, String> sheetNameIdMap = (HashMap<String, String>) mContext.get("sheetNameIdMap");
    ConversionUtil.Sheet sheet = new ConversionUtil.Sheet();
    this.mTarget = sheet;
    // sheet meta attribute
    sheet.sheetIndex = info.tableId;
    sheet.sheetId = ConversionConstant.ST + sheet.sheetIndex;
    this.addIdOnOdfElement(sheet.sheetId);
    sheet.sheetName = this.getAttrValue("table:name");

    boolean protetionProtected = Boolean.valueOf(this.getAttrValue("table:protected"));
    if (protetionProtected)
      sheet.protectionProtected = protetionProtected;

    try
    {
      OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles) mContext.get("autostyles");
      if (autoStyles != null)
      {
        Iterator<OdfStyle> styleIter = autoStyles.getStylesForFamily(OdfStyleFamily.Table).iterator();
        while (styleIter.hasNext())
        {
          OdfStyle odfStyle = styleIter.next();
          Node nameNode = odfStyle.getAttributes().getNamedItem(ODFConstants.STYLE_NAME);
          if (nameNode != null && nameNode.getNodeValue().equalsIgnoreCase(this.getAttrValue(ODFConstants.TABLE_STYLE_NAME)))
          {
            Node tableProperties = odfStyle.getPropertiesElement(OdfStylePropertiesSet.TableProperties);
            Node writingMode = (tableProperties != null) ? tableProperties.getAttributes().getNamedItem("style:writing-mode") : null;
            if (writingMode != null && ODFConstants.RL_TB.equalsIgnoreCase(writingMode.getNodeValue()))
            {
              sheet.sheetDirection = "rtl";
            }
            Node displayNode = (tableProperties != null) ? tableProperties.getAttributes().getNamedItem("table:display") : null;
            if (displayNode != null)
            {
              String display_value = displayNode.getNodeValue();
              if (display_value.equalsIgnoreCase("false"))
              {
                sheet.visibility = ConversionConstant.SHEETHIDE;
              }
            }
            break;
          }
        }
      }
    }
    catch (Exception e)
    {/* Gracefully do nothing */
    }
    sheetNameIdMap.put(sheet.sheetName, sheet.sheetId);
    mContext.put("Sheet", sheet);
  }

  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes)
  {
    if (mInfo.getOutOfCapacity() || bInvalid)
      return new GeneralContext(mImport, uri, localName, qName, mTarget);
    GeneralContext context = null;
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch (name)
      {
        case TABLE_TABLE_COLUMN :
          context = new TableColumnContext(mImport, uri, localName, qName, mTarget);
          break;
        case TABLE_TABLE_ROW :
          context = new TableRowContext(mImport, uri, localName, qName, mTarget);
          break;
        case TABLE_TABLE_HEADER_ROWS :
        case TABLE_TABLE_ROWS :
        case TABLE_TABLE_ROW_GROUP :
          context = new TableRowGroupContext(mImport, uri, localName, qName, mTarget);
          break;
        case TABLE_TABLE_HEADER_COLUMNS :
        case TABLE_TABLE_COLUMNS :
        case TABLE_TABLE_COLUMN_GROUP :
          context = new TableColumnGroupContext(mImport, uri, localName, qName, mTarget);
          break;
        case TABLE_TABLE_SOURCE :
          // if there is a link to table that provides a source for a table
          // does not support it for now
          bInvalid = true;
          context = new GeneralContext(mImport, uri, localName, qName, mTarget);
          removeIdOnOdfElement();// remove the xml id for this table
          break;
        default:
          context = new GeneralContext(mImport, uri, localName, qName, mTarget);
      }
    // write the table:table start element when createChildContext
    // because table xml id need to export or not is decided by the child element of table
    // if there is table:table-source child element, then the table should not contain xml id
    // because this table will not added in document model
    mbGenerateXMLIdAtEnd = false;
    return context;
  }

  public void endElement()
  {
    if (mInfo.getOutOfCapacity() || bInvalid)
      return;
    Document document = (Document) mContext.get("Target");
    ConversionUtil.Sheet sheet = (Sheet) mContext.get("Sheet");
    ContextInfo info = (ContextInfo) mContext.get("TableInfo");
    // get the page style of the first sheet as the Docs Print page setup
    if (sheet.sheetIndex == 1)
      setPageSetting();
    // and export style is error, the row out of 65535 should be default in Sheet2
    // check if the last row in uniqueRowList is the styledRow, if no, delete it
    Row lastRow = checkLastRow(document, sheet);

    sheet.maxColumnIndex = Math.max(info.maxColInRowWithValue, info.maxColInRowWithStyle);
    if (info.hasStyledColumn)
    {
      boolean bFakeColumnStyle = false;
      if (info.rowIndex < 65535)
      {
        // if column has style and row number is less than 65535
        // then it must be fake column style, we should transform it to row style
        // to avoid to much row repeat number with default cell style
        bFakeColumnStyle = true;
      }
      else if (info.rowIndex == 1048576)
      {
        // exported by IBM docs, no matter it is fake column or not, always set the repeat number to 1048576
        // so we need to check the last row
        // for the new version of json2ods, we will use the rule of Symphony
        if (lastRow != null)
        {
          deserializeCellList(lastRow, sheet);
          List<Cell> lastCellList = lastRow.cellList;
          // if last row is all the default cells, we should delete it, and do transform fake column
          if (lastCellList != null)
          {
            int size = lastCellList.size();
            if (size == 1)
            {
              Cell lastCell = lastCellList.get(0);
              if (ConversionConstant.DEFAULT_CELL_STYLE.equals(lastCell.styleId)
                  || ConversionConstant.DEFAULT_CELL_STYLE_NAME.equals(lastCell.styleId))
              {
                bFakeColumnStyle = true;
                if ((lastRow.rowIndex + lastRow.repeatedNum) >= 65535 && !ConversionUtil.hasValue(lastRow.styleId)
                    && !ConversionUtil.hasValue(lastRow.visibility))
                {
                  document.uniqueRows.uniqueRowList.remove(document.uniqueRows.uniqueRowList.size() - 1);
                  info.rowIndex = lastRow.rowIndex - 1;
                }
              }
            }
          }
        }
      }

      if (bFakeColumnStyle)
        transformFakeColumnStyleToCells(document, sheet, info);
    }
    document.sheetList.add(sheet);

    super.endElement();

    info.tableId++;
    // if "Sheet" is null, any row/column should not be created
    mContext.put("Sheet", null);

    ConversionConstant.JSONWriteMode writeMode = (ConversionConstant.JSONWriteMode) mContext.get("writeMode");
    if (writeMode != ConversionConstant.JSONWriteMode.WORKSHEET)
    {
      AbstractJSONFileAccess jsonFileAccess = (AbstractJSONFileAccess) mContext.get("ContentJSONFileAccess");
      JSONType type = jsonFileAccess.getJSONType(ConversionConstant.SHEETS);

      try
      {
        boolean bFirstSheet = (Boolean) mContext.get("bFirstTable");
        if (writeMode == ConversionConstant.JSONWriteMode.SHEET)
        {
          JSONObject object = sheet.storeContentToJSON();
          // don't output if the sheet is empty
          JSONObject rows = (JSONObject) object.get(ConversionConstant.ROWS);
          if (!rows.isEmpty())
          {
            jsonFileAccess.writePairBuffer(type, sheet.sheetId, object, !bFirstSheet);
            if (bFirstSheet)
              mContext.put("bFirstTable", false);
          }

          sheet.rowList = null;
        }
        else
        {
          // PER ROW serialization - not implemented yet
        }
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "can not write sheet content");
      }
    }
  }

  // delete the unnecessary last row, and return the updated last row
  private Row checkLastRow(Document document, Sheet sheet)
  {
    int uniqueRowSize = document.uniqueRows.uniqueRowList.size();
    ConversionUtil.Row lastRow = (uniqueRowSize > 0) ? document.uniqueRows.uniqueRowList.get(uniqueRowSize - 1) : null;
    // if the previous row in rows of meta.js is not belong to the current sheet, then set it to null
    if ((lastRow != null) && !lastRow.sheetId.equals(sheet.sheetId))
      lastRow = null;
    if (lastRow != null)
    {
      boolean lastRowChanged = false;
      if (!ConversionUtil.Row.isStyledRow(lastRow))
      {
        document.uniqueRows.uniqueRowList.remove(uniqueRowSize - 1);
        lastRowChanged = true;
      }
      else
      {
        // 1) get the row height of the last row and set it as SHEET_ROW_HEIGHT
        // 2) import ibm docs exported file which always fill the row repeate to 1048576
        // to avoid big row repeat number
        if ((lastRow.cellList == null || lastRow.cellList.size() == 0) && (lastRow.rowIndex + lastRow.repeatedNum) >= ConversionConstant.MAX_REF_ROW_NUM
            && !ConversionUtil.hasValue(lastRow.styleId) && !ConversionUtil.hasValue(lastRow.visibility))
        {
          if (lastRow.isOptimizeHeight)
          {
            if( lastRow.height > 0 && lastRow.height != ConversionUtil.Row.defaultHeight)
              sheet.rowHeight = lastRow.height;
            document.uniqueRows.uniqueRowList.remove(uniqueRowSize - 1);
            lastRowChanged = true;
          }
        }
      }
      if (lastRowChanged)
      {
        lastRow = (uniqueRowSize > 1) ? document.uniqueRows.uniqueRowList.get(uniqueRowSize - 2) : null;
        if ((lastRow != null) && !lastRow.sheetId.equals(sheet.sheetId))
          lastRow = null;
      }
    }
    return lastRow;
  }

  private void transformFakeColumnStyleToCells(Document doc, Sheet sheet, ContextInfo info)
  {
    preparseColumnDefaultCellStyle(doc);
    // iterate cells in each row(include the unique row which has no content cell)
    // if cell's style is not default, then apply the column style
    // if cell does not exist, create one with the column style
    List<Row> newRowList = new ArrayList<Row>();
    List<Row> newUniqueRowList = new ArrayList<Row>();
    List<Integer> newUniqueRowIndexList = new ArrayList<Integer>();

    int rowCount = sheet.rowList.size();
    // int rowIdCount = sheet.rowIdArray.size();
    int rowIdCount = info.rowIndex;
    int index = 0;
    int uniqueIndex = uniqueRowPos;
    List<Row> uniqueRowList = doc.uniqueRows.uniqueRowList;
    int uniqueRowCount = uniqueRowList.size();
    List<Column> uniqueColList = doc.uniqueColumns.uniqueColumnList;
    int uniqueColCount = uniqueColList.size();
    Row row = null;
    Row uniqueRow = null;
    if (index < rowCount)
      row = sheet.rowList.get(index);
    if (uniqueIndex < uniqueRowCount)
      uniqueRow = uniqueRowList.get(uniqueIndex);

    for (int rowIndex = 0; rowIndex < rowIdCount;)
    {
      if (row != null && row.rowIndex == rowIndex)
      {
        newRowList.add(row);
        mergeColumnStyle(row, doc, sheet);
        rowIndex += row.repeatedNum + 1;
        // next style row if the row is also the style row
        if (row == uniqueRow)
        {
          uniqueIndex++;
          if (uniqueIndex < uniqueRowCount)
            uniqueRow = uniqueRowList.get(uniqueIndex);
          else
            uniqueRow = null;
        }
        // next content row
        index++;
        if (index < rowCount)
          row = sheet.rowList.get(index);
        else
          row = null;
      }
      else if (uniqueRow != null && uniqueRow.rowIndex == rowIndex)
      {
        // create content row with column style and add to rowList
        createTemplateCells(doc, uniqueRow);
        newRowList.add(uniqueRow);
        rowIndex += uniqueRow.repeatedNum + 1;
        // next style row
        uniqueIndex++;
        if (uniqueIndex < uniqueRowCount)
          uniqueRow = uniqueRowList.get(uniqueIndex);
        else
          uniqueRow = null;
      }
      else
      {
        // create this unique row with repeate number until to the next row or unique Row
        // update sheet.rowIdArray uniqueRowList
        int nextIndex = rowIdCount;
        if (row != null)
          nextIndex = row.rowIndex;
        if (uniqueRow != null && nextIndex > uniqueRow.rowIndex)
          nextIndex = uniqueRow.rowIndex;
        int repeateNum = nextIndex - rowIndex - 1;
        if (repeateNum >= 0)
        {
          Row newRow = new Row();
          newRow.sheetId = sheet.sheetId;
          newRow.rowIndex = rowIndex;
          newRow.rowId = ConversionUtil.updateIdArray(rowIndex, sheet, doc, true, false);
          newRow.height = sheet.rowHeight;
          newRow.repeatedNum = repeateNum;
          newUniqueRowList.add(newRow);
          newUniqueRowIndexList.add(uniqueIndex);
          createTemplateCells(doc, newRow);
          newRowList.add(newRow);
        }

        rowIndex = nextIndex;
      }
    }
    sheet.rowList = newRowList;
    // merge uniqueRowList in order
    for (int i = newUniqueRowIndexList.size() - 1; i >= 0; i--)
    {
      Row newUniqueRow = newUniqueRowList.get(i);
      int pos = newUniqueRowIndexList.get(i);
      uniqueRowList.add(pos, newUniqueRow);
    }
    String defaultStyleName = ConversionConstant.DEFAULT_CELL_STYLE;
    if (doc.defaultStyle != null)
    {
      //if default font size is not equal to defaultcellstyle, then default row height of each sheet should also be changed
      defaultStyleName = ConversionConstant.DEFAULT_CELL_STYLE_NAME;
      if(doc.defaultStyle.fontSize != ConversionConstant.DEFAULT_FONT_SIZE && sheet.rowHeight == ConversionConstant.DEFAULT_HEIGHT_VALUE)
      {
        double height = ConversionConstant.HEIGHT_FONT_FACTOR * doc.defaultStyle.fontSize;
        sheet.rowHeight = (int)height;
      }
    }
    // remove the column style, because it has all been merged to each cells
    for (int i = uniqueColPos; i < uniqueColCount; i++)
    {
      Column uniqueCol = uniqueColList.get(i);
      uniqueCol.styleId = defaultStyleName;
    }
  }

  //copy the the column default cell style with preserveStyleName attribute which value is the xml table:default-cell-style-name
  private void preparseColumnDefaultCellStyle(Document doc)
  {
    HashMap<String, CellStyleType> styleMap = new HashMap<String, CellStyleType>();
    List<Column> uniqueColList = doc.uniqueColumns.uniqueColumnList;
    int uniqueColCount = uniqueColList.size();
    for (int i = uniqueColPos; i < uniqueColCount; i++)
    {
      Column uniqueCol = uniqueColList.get(i);
      if (ConversionUtil.hasValue(uniqueCol.styleId))
      {
        CellStyleType newStyleWithPreserve = styleMap.get(uniqueCol.styleId);
        if (newStyleWithPreserve == null )
        {
          for (int j = 0; j < doc.cellStyleList.size(); j++)
          {
            ConversionUtil.CellStyleType style = doc.cellStyleList.get(j);
            if (style.styleId.equals(uniqueCol.styleId))
            {
              newStyleWithPreserve = new CellStyleType(style);
              newStyleWithPreserve.preserveStyleName = uniqueCol.defaultCellStyleName;
              newStyleWithPreserve.styleId = TableCellStyleHelper.createStyleId(mContext);
              break;
            }
          }
          styleMap.put(uniqueCol.styleId, newStyleWithPreserve);
        }
        if( newStyleWithPreserve != null )
          uniqueCol.styleId = newStyleWithPreserve.styleId;
      }
    }
    doc.cellStyleList.addAll(styleMap.values());
  }

  // deserialize the row.cellList incase the row has been serialized to json string
  private void deserializeCellList(Row row, Sheet sheet)
  {
    try
    {
      if (ConversionUtil.hasValue(row.jsonCellString))
      {
        if (row.cellList == null)
          row.cellList = new ArrayList<Cell>();
        // if the row has already been serialized, we should deserialize it first
        int colCount = sheet.columnIdArray.size();
        JSONObject rowJSON = JSONObject.parse(row.jsonCellString);
        for (int columnIndex = 0; columnIndex < colCount; columnIndex++)
        {
          String columnId = sheet.columnIdArray.get(columnIndex);
          if (ConversionUtil.hasValue(columnId))
          {
            if (rowJSON.containsKey(columnId))
            {
              Cell cell = new Cell();
              cell.cellId = columnId;
              cell.rowId = row.rowId;
              cell.cellIndex = columnIndex;
              JSONObject cellJSON = (JSONObject) rowJSON.get(columnId);
              cell.getObjectFromJSON(cellJSON);
              boolean isODFFormula = (Boolean) mContext.get("isODFFormula");
              if (!isODFFormula && 
                  ConversionUtil.hasValue(cell.value) &&
                  ConversionUtil.isFormulaString(cell.value.toString()))
              {
                cell.value = IDMFormulaLexer.transOOXMLFormulaToODF(cell.value.toString());
              }
              row.cellList.add(cell);
              columnIndex += cell.repeatedNum;
            }
          }
        }
      }
    }
    catch (IOException ioe)
    {
      LOG.log(Level.WARNING, "deserializeCellList: the jsonstring for row must contains error {0} ", row.jsonCellString);
    }
  }

  private void mergeColumnStyle(Row row, Document doc, Sheet sheet)
  {
    deserializeCellList(row, sheet);
    List<Cell> newCells = new ArrayList<Cell>();
    int cellCount = row.cellList.size();
    int index = 0;
    Cell cell = null;
    if (index < cellCount)
      cell = row.cellList.get(index);
    List<Column> uniqueColList = doc.uniqueColumns.uniqueColumnList;
    int uniqueColCount = uniqueColList.size();
    for (int i = uniqueColPos; i < uniqueColCount; i++)
    {
      Column uniqueCol = uniqueColList.get(i);
      if (ConversionUtil.hasValue(uniqueCol.styleId))
      {
        NEXT_OPERATION nextOp = nextCell(cell, uniqueCol, newCells, sheet, doc);
        while ((nextOp == NEXT_OPERATION.NEXT_CELL) || (nextOp == NEXT_OPERATION.NEXT_CELL_AND_COL))
        {
          index++;
          if (index < cellCount)
            cell = row.cellList.get(index);
          else
            cell = null;
          if (nextOp == NEXT_OPERATION.NEXT_CELL_AND_COL)
            break;
          nextOp = nextCell(cell, uniqueCol, newCells, sheet, doc);
        }
        if (nextOp == NEXT_OPERATION.NEXT_STOP)
          break;
      }
    }
    if (cell != null && index < cellCount)
    {
      List<Cell> others = row.cellList.subList(index, cellCount);
      newCells.addAll(others);
    }
    row.cellList = newCells;
    row.storeToJSONString();
  }

  private NEXT_OPERATION nextCell(Cell cell, Column uniqueCol, List<Cell> newCells, Sheet sheet, Document doc)
  {
    Cell preCell = null;
    if (newCells.size() > 0)
      preCell = newCells.get(newCells.size() - 1);
    int colStart = uniqueCol.columnIndex;
    int colEnd = colStart + uniqueCol.repeatedNum;
    int start = colStart;
    if (preCell != null)
    {
      int index = preCell.cellIndex + preCell.repeatedNum + 1;
      if (index > sheet.maxColumnIndex)
        return NEXT_OPERATION.NEXT_STOP;
      if (start < index)
        start = index;
    }
    if (cell == null)
    {
      int rn = colEnd - start;
      if (rn >= 0)
      {
        Cell newCell = new Cell();
        newCell.cellId = ConversionUtil.updateIdArray(start, sheet, doc, false, false);
        newCell.cellIndex = start;
        newCell.styleId = uniqueCol.styleId;
        newCell.repeatedNum = rn;
        newCells.add(newCell);
      }
      return NEXT_OPERATION.NEXT_COL;
    }
    int cellStart = cell.cellIndex;
    int cellEnd = cellStart + cell.repeatedNum;

    if (cellStart > colEnd)
    {
      int rn = colEnd - start;
      if (rn >= 0)
      {
        Cell newCell = new Cell();
        newCell.cellId = ConversionUtil.updateIdArray(start, sheet, doc, false, false);
        newCell.cellIndex = start;
        newCell.rowId = cell.rowId;
        newCell.styleId = uniqueCol.styleId;
        newCell.repeatedNum = rn;
        newCells.add(newCell);
      }
      return NEXT_OPERATION.NEXT_COL;
    }
    if (cellEnd < colStart)
    {
      newCells.add(cell);
      return NEXT_OPERATION.NEXT_CELL;
    }
    int rn = cellStart - start - 1;
    if (rn >= 0)
    {
      Cell newCell = new Cell();
      newCell.cellId = ConversionUtil.updateIdArray(start, sheet, doc, false, false);
      newCell.cellIndex = start;
      newCell.rowId = cell.rowId;
      newCell.styleId = uniqueCol.styleId;
      newCell.repeatedNum = rn;
      newCells.add(newCell);
    }
    if (!ConversionUtil.hasValue(cell.styleId))
      cell.styleId = uniqueCol.styleId;
    newCells.add(cell);
    if (cellEnd >= colEnd)
      return NEXT_OPERATION.NEXT_CELL_AND_COL;
    return NEXT_OPERATION.NEXT_CELL;
  }


  private void createTemplateCells(Document doc, Row row)
  {
    List<Cell> cells = new ArrayList<Cell>();
    List<Column> uniqueColList = doc.uniqueColumns.uniqueColumnList;
    int uniqueColCount = uniqueColList.size();
    for (int i = uniqueColPos; i < uniqueColCount; i++)
    {
      Column uniqueCol = uniqueColList.get(i);
      if (ConversionUtil.hasValue(uniqueCol.styleId))
      {
        // create cell
        Cell cell = new Cell();
        cell.styleId = uniqueCol.styleId;
        cell.repeatedNum = uniqueCol.repeatedNum;
        cell.cellId = uniqueCol.columnId;
        cell.cellIndex = uniqueCol.columnIndex;
        cell.rowId = row.rowId;
        cells.add(cell);
      }
    }
    row.cellList = cells;
    row.storeToJSONString();
  }

  private void setPageSetting()
  {
    try
    {
      ConversionUtil.PageSetting setting = new ConversionUtil.PageSetting();
      String tableStyleName = getAttrValue("table:style-name");
      if (ConversionUtil.hasValue(tableStyleName))
      {
        OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles) mContext.get("autostyles");
        OdfStyle tableStyle = autoStyles.getStyle(tableStyleName, OdfStyleFamily.Table);
        if (tableStyle != null)
        {
          String masterName = tableStyle.getStyleMasterPageNameAttribute();
          if (ConversionUtil.hasValue(masterName))
          {
            OdfDocument odfDoc = (OdfDocument) mContext.get("Source");
            OdfOfficeMasterStyles masterStyles = odfDoc.getOfficeMasterStyles();
            OdfStyleMasterPage masterPage = masterStyles.getMasterPage(masterName);
            if (masterPage != null)
            {
              String pageLayoutName = masterPage.getStylePageLayoutNameAttribute();
              if (ConversionUtil.hasValue(pageLayoutName))
              {
                OdfOfficeAutomaticStyles autoStylesInStyles = odfDoc.getStylesDom().getAutomaticStyles();
                OdfStylePageLayout pageLayout = autoStylesInStyles.getPageLayout(pageLayoutName);
                if (pageLayout != null)
                {
                  String width = pageLayout.getProperty(OdfStylePageLayoutProperties.PageWidth);
                  String height = pageLayout.getProperty(OdfStylePageLayoutProperties.PageHeight);
                  String oritation = pageLayout.getProperty(OdfStylePageLayoutProperties.PrintOrientation);
                  String marginTop, marginBot, marginLeft, marginRight;
                  String margin = pageLayout.getProperty(OdfStylePageLayoutProperties.Margin);
                  if (margin == null)
                  {
                    marginTop = pageLayout.getProperty(OdfStylePageLayoutProperties.MarginTop);
                    marginBot = pageLayout.getProperty(OdfStylePageLayoutProperties.MarginBottom);
                    marginLeft = pageLayout.getProperty(OdfStylePageLayoutProperties.MarginLeft);
                    marginRight = pageLayout.getProperty(OdfStylePageLayoutProperties.MarginRight);
                  }
                  else
                  {
                    marginTop = marginBot = marginLeft = marginRight = margin;
                  }
                  String pageOrder = pageLayout.getProperty(OdfStylePageLayoutProperties.PrintPageOrder);

                  setting.width = width;
                  setting.height = height;
                  setting.oritation = oritation;
                  setting.marginLeft = marginLeft;
                  setting.marginRight = marginRight;
                  setting.marginTop = marginTop;
                  setting.marginBottom = marginBot;
                  setting.pageOrder = pageOrder;
                  mContext.put("page-settings", setting);
                }
              }
            }
          }
        }
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }

  }
}
