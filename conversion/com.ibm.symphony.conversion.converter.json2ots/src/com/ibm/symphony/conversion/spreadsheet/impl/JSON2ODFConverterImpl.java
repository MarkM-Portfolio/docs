/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.impl;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;
import org.odftoolkit.odfdom.doc.number.OdfNumberBooleanStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberCurrencyStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberDateStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberPercentageStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberTextStyle;
import org.odftoolkit.odfdom.doc.number.OdfNumberTimeStyle;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeBody;
import org.odftoolkit.odfdom.doc.office.OdfOfficeFontFaceDecls;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleMap;
import org.odftoolkit.odfdom.doc.style.OdfStyleParagraphProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableCellProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.doc.text.OdfTextParagraph;
import org.odftoolkit.odfdom.doc.text.OdfWhitespaceProcessor;
import org.odftoolkit.odfdom.dom.attribute.fo.FoFontStyleAttribute;
import org.odftoolkit.odfdom.dom.attribute.fo.FoFontWeightAttribute;
import org.odftoolkit.odfdom.dom.attribute.fo.FoWrapOptionAttribute;
import org.odftoolkit.odfdom.dom.attribute.office.OfficeBooleanValueAttribute;
import org.odftoolkit.odfdom.dom.attribute.office.OfficeValueAttribute;
import org.odftoolkit.odfdom.dom.attribute.office.OfficeValueTypeAttribute;
import org.odftoolkit.odfdom.dom.attribute.style.StyleFamilyAttribute;
import org.odftoolkit.odfdom.dom.attribute.style.StyleTextLineThroughStyleAttribute;
import org.odftoolkit.odfdom.dom.attribute.style.StyleTextUnderlineStyleAttribute;
import org.odftoolkit.odfdom.dom.element.dc.DcCreatorElement;
import org.odftoolkit.odfdom.dom.element.office.OfficeAnnotationElement;
import org.odftoolkit.odfdom.dom.element.style.StyleFontFaceElement;
import org.odftoolkit.odfdom.dom.element.table.TableCoveredTableCellElement;
import org.odftoolkit.odfdom.dom.element.table.TableNamedExpressionsElement;
import org.odftoolkit.odfdom.dom.element.table.TableNamedRangeElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableCellElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableCellElementBase;
import org.odftoolkit.odfdom.dom.element.table.TableTableColumnElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableElement;
import org.odftoolkit.odfdom.dom.element.table.TableTableRowElement;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.odftoolkit.odfdom.dom.style.props.OdfTableColumnProperties;
import org.odftoolkit.odfdom.dom.style.props.OdfTableRowProperties;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.OrderedJSONObject;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.spreadsheet.ServiceConstants;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.CellStyleType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.FormulaToken;

public class JSON2ODFConverterImpl
{
  public final static String RESERVERED = "reserved";

  public final static String COMMENTS_MSG_FILE = RESERVERED + "/comments.json";

  private static final Logger LOG = Logger.getLogger(JSON2ODFConverterImpl.class.getName());
  
  private final static String START_CELL_ADDRESS = "$A$1";

  private final static String DEFAULT_CELL_STYLE_NAME = "Default";// "DefaultCell";

  private final static String DEFAULT_COLUMN_STYLE_NAME = "co1";// "DefaultColumn";

  private final static String DEFAULT_ROW_STYLE_NAME = "ro1";// "DefaultRow";
  
  private final static String DEFAULT_EXPORT_TABLE_ROW_STYLE_NAME = "rod1";// "DefaultRow";
  
  private final static String DEFAULT_EXPORT_COLUMN_STYLE_NAME = "cod1";

  private final static String BORDER_WIDTH_THIN = "0.035cm"; // 0.05pt, must use this number, otherwise when export to xls, border lost

  private final static String BORDER_WIDTH_THICK = "0.105cm"; // 2.5pt

  private final static int MAX_ROW_COUNT = 65536;

  private final static int MAX_COLUMN_COUNT = 1024;// ???

  private final static Pattern doublePattern = Pattern.compile("^-?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)$");

  private final static Pattern percentPattern = Pattern.compile("^-?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)%$");

  private static final Pattern booleanPattern = Pattern.compile("true|false|TRUE|FALSE");

  private final static boolean isOF = false;// the export formula string with of: or not
  
  private final static Pattern dateReplacePattern = Pattern.compile("(~[y|d|E|s]*)([y|d|E|s]*)(~[y|d|E|s]*)");

  // Map for row style name -- row height
  private HashMap<String, Integer> rowStyleHeightMap;

  // Map for column style name -- column width
  private HashMap<String, Integer> columnStyleWidthMap;

  // Map for cell style name -- OdfStyle
  private HashMap<String, OdfElement> cellStyleMap;
  
//Map for format code -- format style name
  private HashMap<String, String> cellFormatStyleMap;

  private String conversionFolder;

  private static int formatIndex = 1;

  public JSON2ODFConverterImpl(String conversionFolder)
  {
    this.conversionFolder = conversionFolder;
    rowStyleHeightMap = new HashMap<String, Integer>();
    columnStyleWidthMap = new HashMap<String, Integer>();
    cellStyleMap = new HashMap<String, OdfElement>();
    cellFormatStyleMap = new HashMap<String, String>();
  }

  /*
   * @param source the conversion folder that contains draft json files return the converted ods file path
   */
  public String convert(String source, String sourceType, String targetType)
  {
    if (!sourceType.equalsIgnoreCase(ServiceConstants.JSON_MIMETYPE)
        || (!targetType.equalsIgnoreCase(ServiceConstants.ODS_MIMETYPE) && !targetType.equalsIgnoreCase(ServiceConstants.OTS_MIMETYPE)))
    {
      return null;
    }
    OdfSpreadsheetDocument spreadsheetDoc;
    String targetFilePath = null;
    String targetFileName = null;

    try
    {
      if (targetType.equalsIgnoreCase(ServiceConstants.ODS_MIMETYPE))
      {
        targetFileName = "content.ods";
        spreadsheetDoc = (OdfSpreadsheetDocument) OdfSpreadsheetDocument.loadDocument(ConversionUtil.getBlankSpreadSheetDocument(ServiceConstants.ODS_MIMETYPE, source));
      }
      else
      {
        targetFileName = "content.ots";
        spreadsheetDoc = (OdfSpreadsheetDocument) OdfSpreadsheetDocument.loadDocument(ConversionUtil.getBlankSpreadSheetDocument(ServiceConstants.OTS_MIMETYPE, source));
      }

//      List<OdfTable> odfTables = spreadsheetDoc.getTableList();
//      for (int i = 1; i < odfTables.size(); i++)
//      {
//        OdfTable table = odfTables.get(i);
//        table.remove();
//        table.release();
//      }
      
      ConversionUtil.Document doc = new ConversionUtil.Document();
      String metaFilePath = source + File.separator + "meta.js";
      String contentFilePath = source + File.separator + "content.js";
      doc.docMetaJSON = ConversionUtil.getObjectFromJSON(metaFilePath);
      doc.docContentJSON = ConversionUtil.getObjectFromJSON(contentFilePath);
      
      float fileVersion = 0;
      String oVersion = (String)doc.docMetaJSON.get(ConversionConstant.FILE_VERSION_FIELD);
      if(oVersion!=null)
         fileVersion = Float.parseFloat(oVersion);
      if(fileVersion<1.0)
      {
        ConversionUtil.mapMeta2ShortKey(doc.docMetaJSON);
        ConversionUtil.mapContent2ShortKey(doc.docContentJSON);
      }
      
      doc.getObjectFromJSON();

      // add xmlns:of namespace
      OdfFileDom contentDom = spreadsheetDoc.getContentDom();
      // convert automatic styles
      OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();

      // export row and column autostyles
      exportRowStyle(doc, autoStyles);
      exportColumnStyle(doc, autoStyles);

      // default cell auto style
      ConversionUtil.CellStyleType defaultCellStyle = new ConversionUtil.CellStyleType();
      ConversionUtil.NumberFormat format = null;
      List<String> fontNameList = new ArrayList<String>();
      for (ConversionUtil.CellStyleType cellStyle : doc.cellStyleList)
      {
        if (!ConversionConstant.DEFAULT_CELL_STYLE.equals(cellStyle.styleId))
        {
          OdfStyle odfStyle = new OdfStyle(contentDom);
          exportCellStyle(cellStyle, odfStyle, defaultCellStyle, false, fontNameList);
          autoStyles.appendChild(odfStyle);
          format = new ConversionUtil.NumberFormat(cellStyle.formatCategory, cellStyle.formatCode, 
              cellStyle.formatCurrency, cellStyle.fmFontColor);
          exportFormatStyle(odfStyle, format, autoStyles);
        }
      }
      addFontFaceDecls(spreadsheetDoc,fontNameList);

      // convert sheet content
      deleteAllTable(contentDom);
      for (int sheetIndex = 0; sheetIndex < doc.sheetList.size(); sheetIndex++)
      {
        ConversionUtil.Sheet sheet = doc.sheetList.get(sheetIndex);
//        OdfTable odfTable = null;
//        if (sheetIndex == 0)
//        {
//          odfTable = odfTables.get(0);
//          // as the odfToolkit default column/row style is different with Concord
//          // so here set the first column/row as Concord default style explicitly
//          OdfTableColumn firstColumn = odfTable.getColumnByIndex(0);
//          firstColumn.getOdfElement().setTableStyleNameAttribute(DEFAULT_COLUMN_STYLE_NAME);
//          OdfTableRow firstRow = odfTable.getRowByIndex(0);
//          firstRow.getOdfElement().setTableStyleNameAttribute(DEFAULT_ROW_STYLE_NAME);
//        }
//        else
//        {
//          // odfTable = OdfTable.newTable(odsDoc, 1, 1);
//          odfTable = newTable(spreadsheetDoc);
//        }

        TableTableElement odfTable = new TableTableElement(contentDom);
        spreadsheetDoc.getContentRoot().appendChild(odfTable);
//        OdfTable odfTable = OdfTable.getInstance(tableElement);
        //delete the initial first table
//        if (sheetIndex == 0)
//        {
//          TableTableElement firstTable = odfTables.get(0).getOdfElement();
//          firstTable.getParentNode().removeChild(firstTable);
//        }
        odfTable.setTableNameAttribute(sheet.sheetName);

        // if the sheet is empty, then set table:print="false" in order to export pdf successfully
        // if(sheet.rowList.size() == 0){
        odfTable.setTablePrintAttribute(false);
        // }
        // prepare the row and column first, then add cell for each row
        // because if we insert row when add cell,
        // the new inserted row will copy the style of the previous row
        // which is the OdfToolkit behavior
        ArrayList<ConversionUtil.Column> coveredColumnList = getCoveredColumnList(sheet);
        int columnElementSize = coveredColumnList.size();
        List<TableTableColumnElement> odfColumnList = new ArrayList<TableTableColumnElement>();
        int maxColCnt = 0;
        for (int i = 0; i < columnElementSize; i++)
        {
//          odfTable.appendColumn();
          TableTableColumnElement odfColumn = new TableTableColumnElement(contentDom);
          ConversionUtil.Column column = coveredColumnList.get(columnElementSize - 1 - i);
          int size = setColumnStyle(column, odfColumn);
          maxColCnt += size;
          if (column.visibility.equalsIgnoreCase("hide"))
          {
            odfColumn.setTableVisibilityAttribute("collapse");
          }
          else if (column.visibility.equalsIgnoreCase("filter"))
          {
            odfColumn.setTableVisibilityAttribute("filter");
          }
          odfColumnList.add(odfColumn);
          odfTable.appendChild(odfColumn);
        }
        ArrayList<ConversionUtil.Row> coveredRowList = getCoveredRowList(sheet);
        int rowElementSize = coveredRowList.size();
        List<TableTableRowElement> odfRowList = new ArrayList<TableTableRowElement>();
        int maxRowCnt = 0;
        for (int i = 0; i < rowElementSize; i++)
        {
//          odfTable.appendRow();
          TableTableRowElement odfRow = new TableTableRowElement(contentDom);
          ConversionUtil.Row row = coveredRowList.get(rowElementSize - i - 1);
          int size = setRowStyle(row, odfRow);
          maxRowCnt += size;
          if (row.visibility.equalsIgnoreCase("hide"))
          {
            odfRow.setTableVisibilityAttribute("collapse");
          }
          else if (row.visibility.equalsIgnoreCase("filter"))
          {
            odfRow.setTableVisibilityAttribute("filter");
          }
          odfRowList.add(odfRow);
          odfTable.appendChild(odfRow);
        }
//        List<TableTableColumnElement> odfColumnList = odfTable.getColumnList();
//        for (int i = columnElementSize - 1; i >= 0; i--)
//        {
//          ConversionUtil.Column column = coveredColumnList.get(i);
//          TableTableColumnElement odfColumn = odfColumnList.get(columnElementSize - 1 - i);
//          setColumnStyle(column, odfColumn);
//          if (column.visibility.equalsIgnoreCase("hide"))
//          {
//            odfColumn.setTableVisibilityAttribute("collapse");
//          }
//          else if (column.visibility.equalsIgnoreCase("filter"))
//          {
//            odfColumn.setTableVisibilityAttribute("filter");
//          }
//        }
//
//        List<TableTableRowElement> odfRowList = odfTable.getRowList();
//        for (int i = rowElementSize - 1; i >= 0; i--)
//        {
//          ConversionUtil.Row row = coveredRowList.get(i);
//          TableTableRowElement odfRow = odfRowList.get(rowElementSize - i - 1);
//          setRowStyle(row, odfRow);
//          if (row.visibility.equalsIgnoreCase("hide"))
//          {
//            odfRow.setTableVisibilityAttribute("collapse");
//          }
//          else if (row.visibility.equalsIgnoreCase("filter"))
//          {
//            odfRow.setTableVisibilityAttribute("filter");
//          }
//        }

        // insert cell for cell style and content
        int maxCellCount = sheet.columnIdArray.size();
        List<ConversionUtil.Row> rowlist = sheet.rowList;
        for (int rIdx = 0; rIdx < rowlist.size(); rIdx++)
        {
          ConversionUtil.Row row = rowlist.get(rIdx);
          int rowIndex = row.rowIndex;

          TableTableRowElement odfRow = getOdfRowByIndex(odfRowList, rowIndex);
          if (sheet.rowIdArray.get(rowIndex).equals(row.rowId))
          {

            for (int columnIdx = 0; columnIdx < row.cellList.size(); columnIdx++)
            {
              ConversionUtil.Cell cell = row.cellList.get(columnIdx);
              int columnIndex = cell.cellIndex;
              boolean isCovered = cell.isCovered;
              TableTableCellElementBase odfCell = getOdfCellByIndex(odfRow, columnIndex, isCovered);
              if (ConversionUtil.hasValue(cell.styleId))
              {
                String cellStyleName = cell.styleId;
                if (cell.styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))
                  cellStyleName = DEFAULT_CELL_STYLE_NAME;
                odfCell.setTableStyleNameAttribute(cellStyleName);
              }
              if (cell.repeatedNum > 0)
              {
                setColumnsRepeatedNumber(odfCell, cell.repeatedNum + 1);
              }
              if (cell.colSpan > 1)
              {
                setColumnSpannedNumber(odfCell, cell.colSpan);
              }
              appendCellStyle(cell, odfCell, sheet, doc, spreadsheetDoc, autoStyles, defaultCellStyle);
              setCellValue(cell, sheet, doc, odfCell);
              if (cell.comment != null)
              {
                OfficeAnnotationElement odfComment = new OfficeAnnotationElement(spreadsheetDoc.getContentDom());
                if (ConversionUtil.hasValue(cell.comment.author))
                {
                  DcCreatorElement odfCommentCreator = new DcCreatorElement(spreadsheetDoc.getContentDom());
                  odfCommentCreator.setTextContent(cell.comment.author);
                  odfComment.appendChild(odfCommentCreator);
                }
                if (ConversionUtil.hasValue(cell.comment.content))
                {
                  OdfWhitespaceProcessor textProcessor = new OdfWhitespaceProcessor();
                  OdfTextParagraph para = new OdfTextParagraph(contentDom);
                  textProcessor.append(para, cell.comment.content);
                  odfComment.appendChild(para);
                }
                odfCell.appendChild(odfComment);
              }
            }
          }
          else
          {
            LOG.warning("rowId should exist in the rowIdArray");
          }
          // TODO: add the cell in this row so that the cell count is the same with column count
          if (odfRow != null)
          {
            int cellCount = getOdfCellCount(odfRow);
            if (cellCount > maxCellCount)
              maxCellCount = cellCount;
          }
        }
        // post operation for the current sheet
        // 1) fill the cell of the row
        // 2) fill the row, column of the sheet
        fillSheet(odfTable, odfRowList, maxCellCount, sheet, maxColCnt, maxRowCnt);

//        odfTable.release();
      }

      exportNameRanges(doc.nameList, doc, spreadsheetDoc);

      // export Task and Comments to concord.js file which should be zipped in ods files
      OrderedJSONObject concordJSON = exportTaskAndComment(doc, source);

      if (!concordJSON.isEmpty())
      {
        // String concordFilePath = source + File.separator + "concord.js";
        // FileOutputStream jsConcordOut = new FileOutputStream(concordFilePath);
        // concordJSON.serialize(jsConcordOut);
        // jsConcordOut.close();
        // FileInputStream input = new FileInputStream(new File(concordFilePath));
        // odsDoc.getPackage().insert(input, "concord.js","JSON");
        // input.close();
        ByteArrayOutputStream jsConcordOut = new ByteArrayOutputStream();
        concordJSON.serialize(jsConcordOut);
        byte[] bytes = jsConcordOut.toByteArray();
        spreadsheetDoc.getPackage().insert(bytes, "concord.js", "JSON");
        jsConcordOut.close();
      }
      // save the document
      targetFilePath = conversionFolder + File.separator + targetFileName;
      spreadsheetDoc.save(targetFilePath);
      spreadsheetDoc.close();
      this.clear();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "convert to ods failed", e);
      this.clear();
    }

    return targetFilePath;
  }

  private void deleteAllTable(OdfFileDom contentDom)
  {
      OdfElement root = contentDom.getRootElement();
      OdfOfficeBody officeBody = OdfElement.findFirstChildNode(OdfOfficeBody.class, root);
      OdfElement typedContent = OdfElement.findFirstChildNode(
              OdfElement.class, officeBody);
      NodeList childList = typedContent.getChildNodes();
      int length = childList.getLength();
      for (int i = length-1;  i >=0; i--) {
        Node node = childList.item(i);
        if(node instanceof TableTableElement){
          typedContent.removeChild(node);
        }
      }
  }

  private void setDisplayText(TableTableCellElementBase cell, String content)
  {
    if (content == null)
      content = "";
    OdfWhitespaceProcessor textProcessor = new OdfWhitespaceProcessor();
    String[] paraArray = content.split("\n");
    for (int i = 0; i < paraArray.length; i++)
    {
      OdfTextParagraph para = new OdfTextParagraph((OdfFileDom) cell.getOwnerDocument());
      textProcessor.append(para, paraArray[i]);
      cell.appendChild(para);
    }
  }
  
  // clear all the variables
  private void clear()
  {
    rowStyleHeightMap.clear();
    columnStyleWidthMap.clear();
    cellStyleMap.clear();
    cellFormatStyleMap.clear();
  }

  public void setColumnsRepeatedNumber(TableTableCellElementBase cell, int repeatedNum)
  {
    if (repeatedNum < 1)
    {
      repeatedNum = 1;
    }
    cell.setTableNumberColumnsRepeatedAttribute(new Integer(repeatedNum));
  }
  
  public void setColumnSpannedNumber(TableTableCellElementBase cell, int spannedNum)
  {
    if (spannedNum < 1)
      spannedNum = 1;
    if (cell instanceof TableTableCellElement)
      ((TableTableCellElement) cell).setTableNumberColumnsSpannedAttribute(new Integer(spannedNum));
    else
      LOG.log(Level.WARNING, "the covered cell element should not have col span attribute");
  }
  
  // set the default format for the cell if no format index is given
  private void appendCellStyle(Cell cell, TableTableCellElementBase odfCell, ConversionUtil.Sheet sheet, Document doc, OdfSpreadsheetDocument odsDoc,
      OdfOfficeAutomaticStyles autoStyles, ConversionUtil.CellStyleType defaultCellStyle)
  {
    try
    {
      ConversionUtil.CellStyleType cellStyle = getCellStyle(cell, sheet, doc);
      if (cellStyle != null && cellStyle.formatCategory != null)
      {
        ConversionUtil.NumberFormat format = new ConversionUtil.NumberFormat(cellStyle.formatCategory, cellStyle.formatCode,
            cellStyle.formatCurrency, cellStyle.fmFontColor);

        if ((cellStyle != null) && (cellStyle.formatCode != null))
        {
          // TODO It should never happen
          return;
        }

        String valueType = format.getCategory();
        if (valueType != null)
        {
          String cellStyleNamePrefix = "";
          ConversionUtil.CellStyleType newCellStyle = null;
          if (cellStyle != null)
          {
            newCellStyle = new ConversionUtil.CellStyleType(cellStyle);
            cellStyleNamePrefix = cellStyle.styleId;
          }
          else
          {
            newCellStyle = new ConversionUtil.CellStyleType();
            cellStyleNamePrefix = ConversionConstant.SID_USER;
          }
          // ConversionUtil.CellStyleType cellStyle = null;
          // if(ConversionUtil.hasValue(cell.styleId)){
          // cellStyle = doc.getCellStyleFromStyleId(cell.styleId);
          // if(cellStyle.formatIndex > -1)
          // return;
          // }else{
          // //TODO: if cell has no style, and column has style
          // }
          String cellStyleName = cellStyleNamePrefix + valueType;
          // if cell has style, but the style content does not has format index
          // then the style should be changed which should add format index according to the format type
          // if( (cellStyle == null) || (cell.styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))){
          // cellStyle = new ConversionUtil.CellStyleType();
          newCellStyle.styleId = cellStyleName;
          odfCell.setTableStyleNameAttribute(cellStyleName);
          // }

          if (!cellStyleMap.containsKey(cellStyleName))
          {
            OdfStyle odfCellStyle = new OdfStyle(odsDoc.getContentDom());
            exportCellStyle(newCellStyle, odfCellStyle, defaultCellStyle, false, null);
            autoStyles.appendChild(odfCellStyle);
            exportFormatStyle(odfCellStyle, format, autoStyles);
            cellStyleMap.put(cellStyleName, odfCellStyle);
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "can not create a cell style", e);
    }
  }

  // get the applied cell style of cell
  private CellStyleType getCellStyle(Cell cell, ConversionUtil.Sheet sheet, Document doc)
  {
    if (cell != null)
    {
      String styleId = null;
      if (ConversionUtil.hasValue(cell.styleId))
      {
        styleId = cell.styleId;
      }
      else
      {
        // get from column
        String columnId = null;
        int cellColumnIndex = cell.cellIndex;
        int startIndex = (cellColumnIndex >= sheet.columnIdArray.size()) ? (sheet.columnIdArray.size() - 1) : cellColumnIndex;
        for (int i = startIndex; i >= 0; i--)
        {
          columnId = sheet.columnIdArray.get(i);
          if (ConversionUtil.hasValue(columnId))
          {
            for (int j = 0; j < doc.uniqueColumns.uniqueColumnList.size(); j++)
            {
              ConversionUtil.Column column = doc.uniqueColumns.uniqueColumnList.get(j);
              if (columnId.equals(column.columnId))
              {
                if ((column.columnIndex + column.repeatedNum) >= cellColumnIndex)
                  styleId = column.styleId;
                break;
              }
            }
          }
        }
      }
      if (ConversionUtil.hasValue(styleId))
        return doc.getCellStyleFromStyleId(styleId);
    }
    return null;
  }

//  private OdfTable newTable(OdfSpreadsheetDocument odsDoc)
//  {
//    try
//    {
//      TableTableElement tableElement = new TableTableElement(odsDoc.getContentDom());
//      TableTableColumnElement columnElement = new TableTableColumnElement(odsDoc.getContentDom());
//      setColumnStyle(new ConversionUtil.Column(), columnElement);
//      tableElement.appendChild(columnElement);
//      TableTableRowElement rowElement = new TableTableRowElement(odsDoc.getContentDom());
//      setRowStyle(new ConversionUtil.Row(), rowElement);
//      TableTableCellElement cellElement = new TableTableCellElement(odsDoc.getContentDom());
//      rowElement.appendChild(cellElement);
//      tableElement.appendChild(rowElement);
//      odsDoc.getContentRoot().appendChild(tableElement);
//      return OdfTable.getInstance(tableElement);
//    }
//    catch (Exception e)
//    {
//      LOG.log(Level.WARNING, "can not create a table", e);
//    }
//    return null;
//
//  }

  // TODO: not get absolute cell address from the id, just get the address of the name json object
  private void exportNameRanges(List<ConversionUtil.Range> nameList, ConversionUtil.Document doc, OdfSpreadsheetDocument odsDoc)
  {
    try
    {
      TableNamedExpressionsElement expressionsElement = new TableNamedExpressionsElement(odsDoc.getContentDom());
      for (int i = 0; i < nameList.size(); i++)
      {
        ConversionUtil.Range nameRange = nameList.get(i);
        TableNamedRangeElement rangeElement = new TableNamedRangeElement(odsDoc.getContentDom());
        rangeElement.setTableNameAttribute(nameRange.rangeId);
        ConversionUtil.Sheet sheet = doc.getSheetById(nameRange.sheetId);
        //if (sheet != null)
        {
          // String startCellAddress = ConversionUtil.getAbsoluteCellAddress(
          // sheet.columnIdArray.indexOf(nameRange.startColId), sheet.rowIdArray.indexOf(nameRange.startRowId), sheet.sheetName);
          // //endCellAddress does not need sheet name because it is same with the startCellAddress
          // String endCellAddress = ConversionUtil.getAbsoluteCellAddress(
          // sheet.columnIdArray.indexOf(nameRange.endColId), sheet.rowIdArray.indexOf(nameRange.endRowId), null);
          // rangeElement.setTableCellRangeAddressAttribute(startCellAddress+":."+endCellAddress);
          rangeElement.setTableCellRangeAddressAttribute(nameRange.address);
          String startCellAddress = nameRange.address.split(":")[0];
          if(startCellAddress.contains(ConversionConstant.INVALID_REF))
        	  startCellAddress = this.START_CELL_ADDRESS;
          // TODO: what is base cell address, use sample file 20100719-wrv2_reviewformulier.ods
          rangeElement.setTableBaseCellAddressAttribute(startCellAddress);
          expressionsElement.appendChild(rangeElement);
        }
      }

      if (nameList.size() > 0)
        odsDoc.getContentRoot().appendChild(expressionsElement);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "export name range encounters problem", e);
    }
  }

  private OrderedJSONObject exportTaskAndComment(ConversionUtil.Document doc, String source)
  {
    OrderedJSONObject concordJSON = new OrderedJSONObject();
    // TASK
    OrderedJSONObject tasksJSON = new OrderedJSONObject();
    OrderedJSONObject commentsJSON = new OrderedJSONObject();
    for (int i = 0; i < doc.unnameList.size(); i++)
    {
      ConversionUtil.Range unname = doc.unnameList.get(i);
      // if the address is invalid(contains #REF!), it is not necessary to be reserved.
      if (ConversionUtil.hasValue(unname.address) && !unname.address.contains(ConversionConstant.INVALID_REF))
      {
        if (ConversionUtil.RangeType.TASK == unname.usage)
          tasksJSON.put(unname.rangeId, unname.address);
        else if (ConversionUtil.RangeType.COMMENT == unname.usage)
          commentsJSON.put(unname.rangeId, unname.address);
      }
    }
    if (!tasksJSON.isEmpty())
      concordJSON.put(ConversionUtil.RangeType.TASK.toString(), tasksJSON);
    if (!commentsJSON.isEmpty())
      concordJSON.put(ConversionUtil.RangeType.COMMENT.toString(), commentsJSON);
    // COMMENT CONTENT which is exist in reserved/comments.json
    try
    {
      String commentFilePath = source + File.separator + COMMENTS_MSG_FILE;
      InputStream input = new FileInputStream(new File(commentFilePath));
      if (input != null)
      {
        JSONArray commentsArray = JSONArray.parse(input);
        if ((commentsArray != null) && !commentsArray.isEmpty())
          concordJSON.put(ConversionConstant.CONCORD_COMMENT_CONTENT, commentsArray);
        input.close();
      }
    }
    catch (FileNotFoundException fnfException)
    {
      // LOG.info("can not get json", fnfException);
    }
    catch (IOException ioException)
    {
      LOG.log(Level.WARNING, "can not get json", ioException);
    }
    return concordJSON;
  }

  private void exoprtDefaultRowStyle(OdfOfficeAutomaticStyles autoStyles)
  {
    rowStyleHeightMap.put(DEFAULT_EXPORT_TABLE_ROW_STYLE_NAME, ConversionUtil.Row.defaultHeight);
    OdfStyle odfRowStyle = new OdfStyle((OdfFileDom)autoStyles.getOwnerDocument());
    odfRowStyle.setStyleNameAttribute(DEFAULT_EXPORT_TABLE_ROW_STYLE_NAME);
    odfRowStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_ROW.toString());
    odfRowStyle.setProperty(OdfTableRowProperties.RowHeight, convertPXToINCH(ConversionUtil.Row.defaultHeight));
    odfRowStyle.setProperty(OdfTableRowProperties.UseOptimalRowHeight, "true");
    autoStyles.appendChild(odfRowStyle);
  }
  
  private void exportRowStyle(ConversionUtil.Document doc, OdfOfficeAutomaticStyles autoStyles)
  {
    // export default row style
    exoprtDefaultRowStyle(autoStyles);
    // export other row style
    // start with "ro2" because "ro1" is exist in the empty spreadsheet document
    int rowStyleIndex = 2;
    for (int i = 0; i < doc.uniqueRows.uniqueRowList.size(); i++)
    {
      ConversionUtil.Row styledRow = doc.uniqueRows.uniqueRowList.get(i);
      if (styledRow.height != ConversionUtil.Row.defaultHeight)
      {
        boolean isInserted = false;
        Iterator<String> keys = rowStyleHeightMap.keySet().iterator();
        while (keys.hasNext())
        {
          if (rowStyleHeightMap.get(keys.next()) == styledRow.height)
          {
            isInserted = true;
            break;
          }
        }
        if (!isInserted)
        {
          String rowStyleName = ConversionConstant.ROWID + rowStyleIndex++;
          rowStyleHeightMap.put(rowStyleName, styledRow.height);
          OdfStyle odfRowStyle = new OdfStyle((OdfFileDom) autoStyles.getOwnerDocument());
          odfRowStyle.setStyleNameAttribute(rowStyleName);
          odfRowStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_ROW.toString());
          odfRowStyle.setProperty(OdfTableRowProperties.RowHeight, convertPXToINCH(styledRow.height));
          // odfRowStyle.setProperty(OdfTableRowProperties.UseOptimalRowHeight, "true");
          autoStyles.appendChild(odfRowStyle);
        }
      }
    }
  }

  private void exportDefaultColumnStyle(OdfOfficeAutomaticStyles autoStyles)
  {
    columnStyleWidthMap.put(DEFAULT_EXPORT_COLUMN_STYLE_NAME, ConversionUtil.Column.defaultWidth);
    OdfStyle odfColumnStyle = new OdfStyle((OdfFileDom)autoStyles.getOwnerDocument());
    odfColumnStyle.setStyleNameAttribute(DEFAULT_EXPORT_COLUMN_STYLE_NAME);
    odfColumnStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_COLUMN.toString());
    odfColumnStyle.setProperty(OdfTableColumnProperties.ColumnWidth, convertPXToINCH(ConversionUtil.Column.defaultWidth));
    autoStyles.appendChild(odfColumnStyle);
  }
  
  // export the row automatic style
  private void exportColumnStyle(ConversionUtil.Document doc, OdfOfficeAutomaticStyles autoStyles)
  {
    // export default column style
    exportDefaultColumnStyle(autoStyles);
//    columnStyleWidthMap.put(DEFAULT_COLUMN_STYLE_NAME, ConversionUtil.Column.defaultWidth);
//    // OdfStyle odfColumnStyle = new OdfStyle((OdfFileDom)autoStyles.getOwnerDocument());
//    // odfColumnStyle.setStyleNameAttribute(DEFAULT_COLUMN_STYLE_NAME);
//    // odfColumnStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_COLUMN.toString());
//    // odfColumnStyle.setProperty(OdfTableColumnProperties.ColumnWidth, convertPXToINCH(ConversionUtil.Column.defaultWidth));
//    // autoStyles.appendChild(odfColumnStyle);
    // export other column style
    // start with "co2" because "co1" is exist in the empty spreadsheet document
    int columnStyleIndex = 2;
    for (int i = 0; i < doc.uniqueColumns.uniqueColumnList.size(); i++)
    {
      ConversionUtil.Column styledColumn = doc.uniqueColumns.uniqueColumnList.get(i);
      if (styledColumn.width != ConversionUtil.Column.defaultWidth)
      {
        boolean isInserted = false;
        Iterator<String> keys = columnStyleWidthMap.keySet().iterator();
        while (keys.hasNext())
        {
          if (columnStyleWidthMap.get(keys.next()) == styledColumn.width)
          {
            isInserted = true;
            break;
          }
        }
        if (!isInserted)
        {
          String columnStyleName = ConversionConstant.COLUMNID + columnStyleIndex++;
          columnStyleWidthMap.put(columnStyleName, styledColumn.width);
          OdfStyle odfColumnStyle = new OdfStyle((OdfFileDom) autoStyles.getOwnerDocument());
          odfColumnStyle.setStyleNameAttribute(columnStyleName);
          odfColumnStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_COLUMN.toString());
          odfColumnStyle.setProperty(OdfTableColumnProperties.ColumnWidth, convertPXToINCH(styledColumn.width));
          autoStyles.appendChild(odfColumnStyle);
        }
      }
    }
  }

  // start with of: and has bracket around the cell/range address
  // while the tempalte ods does not has namespace for "of
  // xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2"
  private String getODFFormula(String text)
  {
    ArrayList<FormulaToken> tokenList = ConversionUtil.getTokenFromFormula(text, null);
    boolean bNeedUpdate = false;
    for (int i = 0; i < tokenList.size(); i++)
    {
      ConversionUtil.FormulaToken token = tokenList.get(i);
      String t = token.getText();
      if (t.contains(ConversionConstant.INVALID_REF))
      {

        ReferenceParser.ParsedRef ref = token.getRef();
        if (ref != null)
        {
          token.setChangeText("[" + t + "]");
          bNeedUpdate = true;
        }
      }
    }
    if (bNeedUpdate)
    {
      text = ConversionUtil.updateFormula(text, tokenList);
      StringBuffer formula = new StringBuffer();
      formula.append("of:");
      formula.append(text);
      return formula.toString();
    }
    return text;
  }

  // set the value, calculatedvalue and showvalue to odfCell
  private void setCellValue(ConversionUtil.Cell cell, ConversionUtil.Sheet sheet, ConversionUtil.Document doc, TableTableCellElementBase odfCell)
  {
    ConversionUtil.CellStyleType cellStyle = getCellStyle(cell, sheet, doc);
    String value = null;
    if(ConversionUtil.hasValue(cell.value))
      value = cell.value.toString();
    if (ConversionUtil.hasValue(value) && (value.startsWith("=")) && value.length() > 1)
    {
      String formula = value;
      if (isOF)
        formula = this.getODFFormula(formula);
      odfCell.setTableFormulaAttribute(formula);
      if (ConversionUtil.hasValue(cell.calculateValue))
      {
        value = cell.calculateValue.toString();
      }
    }
    String showvalue = ConversionUtil.hasValue(cell.showValue) ? cell.showValue : value;
    try
    {
      if (ConversionUtil.hasValue(value))
      {
        String valueType = null;

        if (ConversionUtil.hasValue(showvalue))
        {
          if(showvalue.startsWith("'"))
              showvalue = showvalue.substring(1);
          setDisplayText(odfCell, showvalue);
        }

        // guess the value type from the cell value
        if (cellStyle != null && ConversionUtil.hasValue(cellStyle.formatCategory))
        {
          if (doublePattern.matcher(value).matches()){
            //if positive/negative category are not equal, then set value type to float
        	String[] cateArray = cellStyle.formatCategory.split(";", 4);
        	if((cateArray.length > 1 && ConversionUtil.hasValue(cateArray[1])) 
            		|| (cateArray.length > 2 && ConversionUtil.hasValue(cateArray[2])))
              valueType = ConversionConstant.NUMBERS_TYPE;
            else{
              valueType = cateArray[0];
            }
            
          }else
            valueType = "string";
        }else
        {
          if (doublePattern.matcher(value).matches())
            valueType = ConversionConstant.NUMBERS_TYPE;
          else if (percentPattern.matcher(value).matches())
            valueType = ConversionConstant.PERCENTS_TYPE;
          else if (booleanPattern.matcher(value).matches())
            valueType = ConversionConstant.BOOLEAN_TYPE;
        }
        if( ConversionUtil.hasValue(value) && value.startsWith("'"))
            valueType = "string";
        // set value type and value for odfCell
        if (ConversionUtil.hasValue(valueType))
        {

          OdfFileDom dom = (OdfFileDom) odfCell.getOwnerDocument();
          if (valueType.equals(ConversionConstant.NUMBERS_TYPE)
              || valueType.equals(ConversionConstant.TEXT_TYPE))
          {
            odfCell.setOfficeValueTypeAttribute(OfficeValueTypeAttribute.Value.FLOAT.toString());
            OfficeValueAttribute attr = new OfficeValueAttribute(dom);
            odfCell.setOdfAttribute(attr);
            attr.setValue(value);
          }
          else if (valueType.equals(ConversionConstant.PERCENTS_TYPE))
          {
            odfCell.setOfficeValueTypeAttribute(OfficeValueTypeAttribute.Value.PERCENTAGE.toString());
            OfficeValueAttribute attr = new OfficeValueAttribute(dom);
            odfCell.setOdfAttribute(attr);
            attr.setValue(value);
          }
          else if (valueType.equals(ConversionConstant.DATE_TYPE))
          {
            odfCell.setOfficeValueTypeAttribute(OfficeValueTypeAttribute.Value.DATE.toString());
            // format int value with yyyy-MM-dd format
            // java.util.Date start from 1970-1-1
            // while Symphony Date start from 1989-12-31
            if (doublePattern.matcher(value).matches())
            {
              Date startDate = new Date("12/30/1899");
              double dValue = Double.parseDouble(value);
              long day = (long)dValue;
              long time = (long)(startDate.getTime() +day * 86400000);
              StringBuffer timeBuf = new StringBuffer();
              timeBuf.append(new SimpleDateFormat("yyyy-MM-dd").format(new Date(time)));
              double dDay = dValue - day;
              if(dDay != 0.0){
                Date startDate1 = new Date("1/1/1970");
                time = (long)(dDay*86400000 + startDate1.getTime());
                Date date = new Date(time);
                timeBuf.append(new SimpleDateFormat("'T'HH':'mm':'ss").format(new Date(time)));
              }
              value = timeBuf.toString();
              odfCell.setOfficeDateValueAttribute(value);
            }
          }
          else if (valueType.equals(ConversionConstant.TIME_TYPE))
          {
            odfCell.setOfficeValueTypeAttribute(OfficeValueTypeAttribute.Value.TIME.toString());
            // format value with HH:mm:SS
            if (doublePattern.matcher(value).matches())
            {
              Date startDate = new Date("1/1/1970");
              double dValue = Double.parseDouble(value);
              long day = (long)dValue;
              double dDay = dValue - day;
              long time = (long)(dDay*86400000 + startDate.getTime());
              Date date = new Date(time);
              int hour = date.getHours();
              int min = date.getMinutes();
              int sec = date.getSeconds();
              long lHour = day*24 + hour;
              StringBuffer timeBuf = new StringBuffer();
              timeBuf.append("PT");
              timeBuf.append(lHour);
              timeBuf.append("H");
              timeBuf.append(min);
              timeBuf.append("M");
              timeBuf.append(sec);
              timeBuf.append("S");
              value = timeBuf.toString();
              odfCell.setOfficeTimeValueAttribute(value);
            }
          }
          else if (valueType.equals(ConversionConstant.CURRENCY_TYPE))
          {
            odfCell.setOfficeValueTypeAttribute(OfficeValueTypeAttribute.Value.CURRENCY.toString());
            OfficeValueAttribute attr = new OfficeValueAttribute(dom);
            odfCell.setOdfAttribute(attr);
            attr.setValue(value);
            String currency = cellStyle.formatCurrency;
            if (ConversionUtil.hasValue(currency))
              odfCell.setOfficeCurrencyAttribute(currency);
          }
          else if (valueType.equals(ConversionConstant.BOOLEAN_TYPE))
          {
            odfCell.setOfficeValueTypeAttribute(OfficeValueTypeAttribute.Value.BOOLEAN.toString());
            OfficeBooleanValueAttribute attr = new OfficeBooleanValueAttribute(dom);
            odfCell.setOdfAttribute(attr);
            attr.setValue(value);
          }
//          else if (valueType.equals(ConversionConstant.TEXT_TYPE))
//          {
//            odfCell.getOdfElement().setOfficeValueTypeAttribute(OfficeValueTypeAttribute.Value.STRING.toString());
//            odfCell.getOdfElement().setOfficeStringValueAttribute(value);
//          }
          else if(valueType.equals("string"))
          {
              odfCell.setOfficeValueTypeAttribute(OfficeValueTypeAttribute.Value.STRING.toString());
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "cell value type is not right", e);
      odfCell.setOfficeValueTypeAttribute(OfficeValueTypeAttribute.Value.STRING.toString());
      setDisplayText(odfCell, value);
    }

  }

  private void fillSheet(TableTableElement odfTable, List<TableTableRowElement> odfRowList, int maxCellCount, ConversionUtil.Sheet sheet, int colCnt, int rowCnt)
  {
    // 1) fill the cell count of the existing row
    for (int i = 0; i < odfRowList.size(); i++)
    {
      fillRow(odfRowList.get(i), maxCellCount);
    }

    // 2)if maximum cell count of row is greater than column count,
    // then the total column count should be the same with maximum cell count
    int sparedColumnCount = maxCellCount - colCnt;
    if (sparedColumnCount > 0)
    {
      TableTableColumnElement newColumnElement = new TableTableColumnElement((OdfFileDom) odfTable.getOwnerDocument());
      ConversionUtil.Column defaultColumn = new ConversionUtil.Column();
      defaultColumn.repeatedNum = sparedColumnCount - 1;
      setColumnStyle(defaultColumn, newColumnElement);
      // insert column element before the first row element
      odfTable.insertBefore(newColumnElement, odfRowList.get(0));
    }

    // 3)if one of the column has default cell style,
    // then the total row count should be 65535
    boolean hasStyledColumn = false;
    for (int i = 0; i < sheet.columnList.size(); i++)
    {
      ConversionUtil.Column styledColumn = sheet.columnList.get(i);
      if (ConversionUtil.hasValue(styledColumn.styleId))
      {
        hasStyledColumn = true;
        break;
      }
    }
    if (hasStyledColumn)
    {
      int sparedRowCount = MAX_ROW_COUNT - rowCnt;
      if (sparedRowCount > 0)
      {
        if (sparedRowCount > 1)
        {
          TableTableRowElement newRowElement = new TableTableRowElement((OdfFileDom) odfTable.getOwnerDocument());
          ConversionUtil.Row defaultRow = new ConversionUtil.Row();
          defaultRow.repeatedNum = sparedRowCount - 2;
          setRowStyle(defaultRow, newRowElement);
          odfTable.appendChild(newRowElement);
          fillRow(newRowElement, maxCellCount);
        }
        // NOTES HERE:
        // insert last row with repeatedNum = 0
        // so that Symphony can display the generated document with shortest vertical scroll bar
        TableTableRowElement newRowElement = new TableTableRowElement((OdfFileDom) odfTable.getOwnerDocument());
        ConversionUtil.Row defaultRow = new ConversionUtil.Row();
        setRowStyle(defaultRow, newRowElement);
        odfTable.appendChild(newRowElement);
        fillRow(newRowElement, maxCellCount);
      }
    }
  }

  // if the cell count of each row is less than maxCellCount,then add default cells
  private void fillRow(TableTableRowElement odfRowElement, int maxCellCount)
  {
    int cellCount = getOdfCellCount(odfRowElement);
    int sparedCellSize = maxCellCount - cellCount;
    if (sparedCellSize > 0)
    {
      TableTableCellElement odfCellElement = new TableTableCellElement((OdfFileDom) odfRowElement.getOwnerDocument());
      odfRowElement.appendChild(odfCellElement);
      odfCellElement.setTableNumberColumnsRepeatedAttribute(sparedCellSize);
    }
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

  private TableTableRowElement getOdfRowByIndex(List<TableTableRowElement> odfRowList, int rowIndex)
  {
    int count = 0;
    for (int i = 0; i < odfRowList.size(); i++)
    {
      TableTableRowElement odfRow = odfRowList.get(i);
      if (rowIndex <= count)
        return odfRow;
      Integer rowRepeateNumberAttr = odfRow.getTableNumberRowsRepeatedAttribute();
      int rowRepeateNumber = (rowRepeateNumberAttr == null) ? 1 : rowRepeateNumberAttr.intValue();
      count += rowRepeateNumber;
    }
    return null;
  }

  private TableTableCellElementBase getOdfCellByIndex(TableTableRowElement odfRow, int columnIndex, boolean isCovered)
  {
    int index = columnIndex;
    NodeList nodeList = odfRow.getChildNodes();
    TableTableCellElementBase odfCellElement = null;
    for (int i = 0; i < nodeList.getLength(); i++)
    {
      Node n = nodeList.item(i);
      if (n instanceof TableTableCellElementBase)
      {
        odfCellElement = (TableTableCellElementBase) n;
        if (index == 0)
        {
          return odfCellElement;
        }
        else
        {
          int nextIndex = index - odfCellElement.getTableNumberColumnsRepeatedAttribute().intValue();
          if (nextIndex < 0)
          {
            return odfCellElement;
          }
          else
          {
            index = nextIndex;
          }
        }
      }
    }
    if (index >= 0)
    {
      if (index > 0)
      {
        if (isCovered)
        {
          odfCellElement = new TableCoveredTableCellElement((OdfFileDom) odfRow.getOwnerDocument());
        }
        else
        {
          odfCellElement = new TableTableCellElement((OdfFileDom) odfRow.getOwnerDocument());
        }
        odfRow.appendChild(odfCellElement);
        odfCellElement.setTableNumberColumnsRepeatedAttribute(index);
      }
      if (isCovered)
      {
        odfCellElement = new TableCoveredTableCellElement((OdfFileDom) odfRow.getOwnerDocument());
      }
      else
      {
        odfCellElement = new TableTableCellElement((OdfFileDom) odfRow.getOwnerDocument());
      }
      odfRow.appendChild(odfCellElement);
    }
    return odfCellElement;
  }

  private int setRowStyle(ConversionUtil.Row row, TableTableRowElement odfRow)
  {
    Iterator<String> rowStyleNameIter = rowStyleHeightMap.keySet().iterator();
    while (rowStyleNameIter.hasNext())
    {
      String rowStyleName = rowStyleNameIter.next();
      if (rowStyleHeightMap.get(rowStyleName).intValue() == row.height)
      {
        odfRow.setStyleName(rowStyleName);
        break;
      }
    }
    int repeatNum = 1;
    if (row.repeatedNum > 0)
    {
      repeatNum = row.repeatedNum + 1;
      odfRow.setTableNumberRowsRepeatedAttribute(repeatNum);
    }
    if (ConversionUtil.hasValue(row.styleId))
      odfRow.setTableDefaultCellStyleNameAttribute(row.styleId);
    return repeatNum;
  }

  private int setColumnStyle(ConversionUtil.Column column, TableTableColumnElement odfColumn)
  {
    
    Iterator<String> columnStyleNameIter = columnStyleWidthMap.keySet().iterator();
    while (columnStyleNameIter.hasNext())
    {
      String columnStyleName = columnStyleNameIter.next();
      if (columnStyleWidthMap.get(columnStyleName).intValue() == column.width)
      {
        odfColumn.setStyleName(columnStyleName);
        break;
      }
    }
    int repeatNum = 1;
    if (column.repeatedNum > 0){
      repeatNum = column.repeatedNum + 1;
      odfColumn.setTableNumberColumnsRepeatedAttribute(repeatNum);
    }
    String defaultCellStyleName = column.styleId;
    if (!ConversionUtil.hasValue(defaultCellStyleName))
      defaultCellStyleName = DEFAULT_CELL_STYLE_NAME;
    odfColumn.setTableDefaultCellStyleNameAttribute(defaultCellStyleName);
    return repeatNum;
  }

  // convert the length which is in PIXEL unit to INCH unit
  private String convertPXToINCH(int length)
  {
    String indent = length + Unit.PIXEL.abbr();
    return (Length.parseDouble(indent, Unit.INCH) + Unit.INCH.abbr());
  }

  /**
   * export cell style to automatic styles element if export default style, all the attributes should be exported if export other style,
   * only the attributes that are not same with default style should be exported
   */
  private void exportCellStyle(ConversionUtil.CellStyleType cellStyleType, OdfStyle odfStyle,
      ConversionUtil.CellStyleType defaultCellStyle, boolean bDefault, List<String> fontNameList)
  {
    // default cell style
    if (cellStyleType.styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))
    {
      odfStyle.setStyleNameAttribute(DEFAULT_CELL_STYLE_NAME);
    }
    else
    {
      // other customized cell style
      odfStyle.setStyleNameAttribute(cellStyleType.styleId);
      odfStyle.setStyleParentStyleNameAttribute(DEFAULT_CELL_STYLE_NAME);
    }
    odfStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_CELL.toString());

    if (ConversionUtil.hasValue(cellStyleType.fontName) && (bDefault || !cellStyleType.fontName.equals(defaultCellStyle.fontName)))
    {
    	odfStyle.setProperty(OdfStyleTextProperties.FontName, cellStyleType.fontName);
    	if(fontNameList!=null){
    		if(!fontNameList.contains(cellStyleType.fontName))
    			fontNameList.add(cellStyleType.fontName);
    	}
    } 	    
    if ((cellStyleType.fontSize != defaultCellStyle.fontSize) || bDefault)
    {
      String pointValue = cellStyleType.fontSize + Unit.POINT.abbr();
      odfStyle.setProperty(OdfStyleTextProperties.FontSize, pointValue);
      odfStyle.setProperty(OdfStyleTextProperties.FontSizeAsian, pointValue);
      odfStyle.setProperty(OdfStyleTextProperties.FontSizeComplex, pointValue);
    }
    if (ConversionUtil.hasValue(cellStyleType.fontColor) && (!cellStyleType.fontColor.equals(defaultCellStyle.fontColor) || bDefault))
      odfStyle.setProperty(OdfStyleTextProperties.Color, cellStyleType.fontColor);

    if ((cellStyleType.fontItalic != defaultCellStyle.fontItalic) || bDefault)
    {
      if (cellStyleType.fontItalic)
        odfStyle.setProperty(OdfStyleTextProperties.FontStyle, FoFontStyleAttribute.Value.ITALIC.toString());
      else
        odfStyle.setProperty(OdfStyleTextProperties.FontStyle, FoFontStyleAttribute.Value.NORMAL.toString());
    }

    if ((cellStyleType.fontUnderline != defaultCellStyle.fontUnderline) || bDefault)
    {
      if (cellStyleType.fontUnderline)
        odfStyle.setProperty(OdfStyleTextProperties.TextUnderlineStyle, StyleTextUnderlineStyleAttribute.Value.SOLID.toString());
      else
        odfStyle.setProperty(OdfStyleTextProperties.TextUnderlineStyle, StyleTextUnderlineStyleAttribute.Value.NONE.toString());
    }
    if ((cellStyleType.fontStrikeThrough != defaultCellStyle.fontStrikeThrough) || bDefault)
    {
      if (cellStyleType.fontStrikeThrough)
        odfStyle.setProperty(OdfStyleTextProperties.TextLineThroughStyle, StyleTextLineThroughStyleAttribute.Value.SOLID.toString());
      else
        odfStyle.setProperty(OdfStyleTextProperties.TextLineThroughStyle, StyleTextLineThroughStyleAttribute.Value.NONE.toString());
    }
    if ((cellStyleType.fontBold != defaultCellStyle.fontBold) || bDefault)
    {
      if (cellStyleType.fontBold)
      {
        odfStyle.setProperty(OdfStyleTextProperties.FontWeight, FoFontWeightAttribute.Value.BOLD.toString());
        odfStyle.setProperty(OdfStyleTextProperties.FontWeightAsian, FoFontWeightAttribute.Value.BOLD.toString());
        odfStyle.setProperty(OdfStyleTextProperties.FontWeightComplex, FoFontWeightAttribute.Value.BOLD.toString());
      }
      else
      {
        odfStyle.setProperty(OdfStyleTextProperties.FontWeight, FoFontWeightAttribute.Value.NORMAL.toString());
        odfStyle.setProperty(OdfStyleTextProperties.FontWeightAsian, FoFontWeightAttribute.Value.NORMAL.toString());
        odfStyle.setProperty(OdfStyleTextProperties.FontWeightComplex, FoFontWeightAttribute.Value.NORMAL.toString());
      }
    }
    if ((cellStyleType.borderLeft == cellStyleType.borderRight) && (cellStyleType.borderLeft == cellStyleType.borderBottom)
        && (cellStyleType.borderLeft == cellStyleType.borderTop))
      exportCellBorderStyle(odfStyle, OdfStyleTableCellProperties.Border, cellStyleType.borderLeft, cellStyleType.borderLeftColor);
    else
    {
      exportCellBorderStyle(odfStyle, OdfStyleTableCellProperties.BorderLeft, cellStyleType.borderLeft, cellStyleType.borderLeftColor);
      exportCellBorderStyle(odfStyle, OdfStyleTableCellProperties.BorderRight, cellStyleType.borderRight, cellStyleType.borderRightColor);
      exportCellBorderStyle(odfStyle, OdfStyleTableCellProperties.BorderTop, cellStyleType.borderTop, cellStyleType.borderTopColor);
      exportCellBorderStyle(odfStyle, OdfStyleTableCellProperties.BorderBottom, cellStyleType.borderBottom, cellStyleType.borderBottomColor);
    }
    if (ConversionUtil.hasValue(cellStyleType.textAlign) && (!(cellStyleType.textAlign.equals(defaultCellStyle.textAlign)) || bDefault))
    {
      // compatiblity with ODF, left->start, right->end
      if (cellStyleType.textAlign.equalsIgnoreCase(ConversionConstant.DEFAULT_TEXT_ALIGN_VALUE))
        cellStyleType.textAlign = "start";
      else if (cellStyleType.textAlign.equalsIgnoreCase(ConversionConstant.TEXT_ALIGN_VALUE_RIGHT))
        cellStyleType.textAlign = "end";
      odfStyle.setProperty(OdfStyleParagraphProperties.TextAlign, cellStyleType.textAlign);
    }

    // TODO: check, and ODF2JSONConverter use Length.parse instead of ConversionUtil.ConvertToPX
    if ((cellStyleType.indent != defaultCellStyle.indent) || bDefault)
      odfStyle.setProperty(OdfStyleParagraphProperties.MarginLeft, convertPXToINCH(cellStyleType.indent));
    if ((cellStyleType.wraptext != defaultCellStyle.wraptext) || bDefault)
    {
      if (cellStyleType.wraptext)
        odfStyle.setProperty(OdfStyleTableCellProperties.WrapOption, FoWrapOptionAttribute.Value.WRAP.toString());
      else
        odfStyle.setProperty(OdfStyleTableCellProperties.WrapOption, FoWrapOptionAttribute.Value.NO_WRAP.toString());
    }

    if (ConversionUtil.hasValue(cellStyleType.backgroundColor)
        && (!(cellStyleType.backgroundColor.equals(defaultCellStyle.backgroundColor)) || bDefault))
      odfStyle.setProperty(OdfStyleTableCellProperties.BackgroundColor, cellStyleType.backgroundColor);

  }
  private void addFontFaceDecls(OdfSpreadsheetDocument odfDoc, List<String> fontNameList) throws Exception
  {
    OdfElement odfContent = odfDoc.getContentDom().getRootElement();
    NodeList decls = odfContent.getElementsByTagNameNS((String) ConvertUtil.getNamespaceMap().get(ConversionConstant.OFFICE),
    		ConversionConstant.FONT_FACE_DECLS);
    OdfOfficeFontFaceDecls decl = null;
    if (decls.getLength() == 0)
    {
      decl = new OdfOfficeFontFaceDecls(odfDoc.getContentDom());
      odfContent.appendChild(decl);
    }
    else
    {
      decl = (OdfOfficeFontFaceDecls) decls.item(0);
    }
    for(Iterator<String> fontNameIte= fontNameList.iterator(); fontNameIte.hasNext();){
    	String fontName=fontNameIte.next();
    	createFontFace(decl, fontName, fontName, "", "");
    }
  }
  private void createFontFace(OdfOfficeFontFaceDecls decl, String name, String svgFontFamily, String styleFontFamilyGeneric,
	      String styleFontPitch)
	  {
	    StyleFontFaceElement sffe = null;
	    boolean isExisted = false;
	    NodeList children = decl.getChildNodes();
	    for (int i = 0; i < children.getLength(); i++)
	    {
	      sffe = (StyleFontFaceElement) children.item(i);
	      if (name.equalsIgnoreCase(sffe.getStyleNameAttribute()) && svgFontFamily.equalsIgnoreCase(sffe.getSvgFontFamilyAttribute())
	          && styleFontFamilyGeneric.equalsIgnoreCase(sffe.getStyleFontFamilyGenericAttribute())
	          && styleFontPitch.equalsIgnoreCase(sffe.getStyleFontPitchAttribute()))
	      {
	        isExisted = true;
	        break;
	      }
	    }
	    if (!isExisted)
	    {
	      sffe = decl.newStyleFontFaceElement(name);
	      sffe.setSvgFontFamilyAttribute(svgFontFamily);
	      //sffe.setStyleFontFamilyGenericAttribute(styleFontFamilyGeneric);
	      //sffe.setStyleFontPitchAttribute(styleFontPitch);
	    }
	  }
  private void exportFormatStyle(OdfStyle odfCellStyle,	ConversionUtil.NumberFormat format, OdfElement parentElement) 
  {try{
	    String formatCode = format.getCode();
	    String valueType = format.getCategory();
	    if (ConversionUtil.hasValue(valueType))
	    {
	      String formatStyleName = "";
	      String formatStr = format.toString();
	      if (cellFormatStyleMap.containsKey(formatStr))
	        formatStyleName = cellFormatStyleMap.get(formatStr);
	      else
	      {
	        formatStyleName = ConversionConstant.FORMATID + formatIndex++;
            String[] fmColorArray = format.getFmFontColor().split(";", 4);
            int fcLen = fmColorArray.length;
            String[] categoryArray = format.getCategory().split(";", 4);
            String[] curArray = format.getCurrency().split(";", 4);
            String[] codes = formatCode.split(";", 4);
            int len = codes.length;
            
            String appliedfmFontColor = fmColorArray[0];
	        String currency = format.getCurrency();
	       String pStyleName1 = formatStyleName + "P0";
	       String pStyleName2 = formatStyleName + "P1";
	       String pStyleName3 = formatStyleName + "P2";
	       boolean p = false;
	       boolean n = false;
	       boolean z = false;
	       boolean hasTextCode = this.isTextFormat(codes[len-1]);
	       OdfElement formatStyleElement = null;
	      
	       for(int i=0; i<len; i++){
	        OdfElement styleElment = null;
	        String code = codes[i];
	        String name = formatStyleName;
	        
	        //TODOthis.isTextFormat(codes[len-1])
	        if(len >= 2){
	          if(i==0)
              {
                if (hasTextCode || ConversionUtil.hasValue(fmColorArray[i]))
                {
                  name = pStyleName1;// for positive number style name
                  p = true;
                }
                valueType = categoryArray[i];
              }
	          else if(i == 1 && !(this.isTextFormat(code)))
	          {
	        	if(hasTextCode)
	        		name = pStyleName2;
	        	else
	        		name = pStyleName1;
	            n = true;
	            if(ConversionUtil.hasValue(curArray[i]))
	              currency = curArray[i];
	            if(ConversionUtil.hasValue(categoryArray[i]))
	              valueType = categoryArray[i];
	            if(ConversionUtil.hasValue(fmColorArray[i]))
	            	appliedfmFontColor = fmColorArray[i];
	            //else use the positive number format
	          }else if(i == 2  && !(this.isTextFormat(code))){
	        	if(hasTextCode)
	        		name = pStyleName3; 
	        	else
	        		name = pStyleName2;
	        	z = true;
	           if(ConversionUtil.hasValue(curArray[i]))
	              currency = curArray[i];
	            if(ConversionUtil.hasValue(categoryArray[i]))
	              valueType = categoryArray[i];
	            if(ConversionUtil.hasValue(fmColorArray[i]))
	            	appliedfmFontColor = fmColorArray[i];
	            //else use the positive number format
	          }else if(i == len-1 && (hasTextCode || ConversionUtil.hasValue(fmColorArray[fcLen - 1]))){
	        	  currency = "";
	        	  valueType = "text";
        	  if(ConversionUtil.hasValue(fmColorArray[fcLen - 1]))
              	appliedfmFontColor = fmColorArray[fcLen - 1];
	          }
	        }
	          
	         if (ConversionConstant.NUMBERS_TYPE.equals(valueType))
	        {
	          styleElment = new OdfNumberStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), code, name);
	        }
	        else if (ConversionConstant.PERCENTS_TYPE.equals(valueType))
	        {
	          styleElment = new OdfNumberPercentageStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), code, name);
	        }
	        else if (ConversionConstant.CURRENCY_TYPE.equals(valueType))
	        {
	          String symbolChar = ConversionUtil.getCurrencySymbol(currency);
	          if(symbolChar == null)
	            symbolChar = currency;
	          if (symbolChar != null && (!code.contains(symbolChar) && !code.contains(currency)))
	            code = symbolChar + code;
	          styleElment = new OdfNumberCurrencyStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), symbolChar, code, name);
	        }
	        else if (ConversionConstant.DATE_TYPE.equals(valueType))
	        {
	          String dCode = ConversionUtil.getDateTimePattern(code, ConversionConstant.DATE_TYPE, false);
	          if(dCode == null)
	            dCode = code;
	          dCode = getODFFormat(dCode, ConversionConstant.DATE_TYPE);
	          //normalize date format code 
	          styleElment = new OdfNumberDateStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), dCode, name, null);
	        }
	        else if (ConversionConstant.TIME_TYPE.equals(valueType))
	        {
	          String tCode = ConversionUtil.getDateTimePattern(code, ConversionConstant.TIME_TYPE, false);
	          if(tCode == null)
	            tCode = code;
	          //normalize time format code 
	          tCode = getODFFormat(tCode, ConversionConstant.TIME_TYPE);
	          styleElment = new OdfNumberTimeStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), tCode, name);
	        }
	        else if (ConversionConstant.BOOLEAN_TYPE.equals(valueType))
	        {
	          styleElment = new OdfNumberBooleanStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), code, name);
	        }
	        else if (ConversionConstant.TEXT_TYPE.equals(valueType))
	        {
	          styleElment = new OdfNumberTextStyle((OdfFileDom) odfCellStyle.getOwnerDocument(), code, name);
	        }
        OdfStyleTextProperties fontColor = new OdfStyleTextProperties((OdfFileDom)odfCellStyle.getOwnerDocument());
  	    fontColor.setFoColorAttribute(appliedfmFontColor);
  	    styleElment.appendChild(fontColor);
	        //set style:map child elemetn for format style
	        if(name.equals(formatStyleName))
	        	formatStyleElement = styleElment;
	        if(styleElment != null)
	          parentElement.appendChild(styleElment);
	       }
       if(len >1)
       {
	       if(p)
	       {
	    	   OdfStyleMap styleMap = new OdfStyleMap((OdfFileDom)odfCellStyle.getOwnerDocument());
	           styleMap.setStyleApplyStyleNameAttribute(pStyleName1);
	           if(z)
	         	  styleMap.setStyleConditionAttribute("value()>0");
	           else
	         	  styleMap.setStyleConditionAttribute("value()>=0");
	           formatStyleElement.appendChild(styleMap);
	           
	           //<0
	           OdfStyleMap styleMap1 = new OdfStyleMap((OdfFileDom)odfCellStyle.getOwnerDocument());
	           if(n)
	         	  styleMap1.setStyleApplyStyleNameAttribute(pStyleName2);
	           else
	         	  styleMap1.setStyleApplyStyleNameAttribute(pStyleName1);             
	     	  styleMap1.setStyleConditionAttribute("value()<0");             
	     	  formatStyleElement.appendChild(styleMap1);
	           
	           if(z){
	         	  OdfStyleMap styleMap2 = new OdfStyleMap((OdfFileDom)odfCellStyle.getOwnerDocument());
	               styleMap2.setStyleApplyStyleNameAttribute(pStyleName3);
	               styleMap2.setStyleConditionAttribute("value()=0");
	               formatStyleElement.appendChild(styleMap2);
	           }
	       }
	       else
	       {
	    	   OdfStyleMap styleMap = new OdfStyleMap((OdfFileDom)odfCellStyle.getOwnerDocument());
	           styleMap.setStyleApplyStyleNameAttribute(pStyleName1);
	           styleMap.setStyleConditionAttribute("value()<0");
	           formatStyleElement.appendChild(styleMap);
	           if(z)
	           {
	         	  OdfStyleMap styleMap1 = new OdfStyleMap((OdfFileDom)odfCellStyle.getOwnerDocument());
	               styleMap1.setStyleApplyStyleNameAttribute(pStyleName2);
	               styleMap1.setStyleConditionAttribute("value()=0");
	               formatStyleElement.appendChild(styleMap1);
	           }
	           }
	       }
	       cellFormatStyleMap.put(formatStr, formatStyleName);
	      }
	      odfCellStyle.setStyleDataStyleNameAttribute(formatStyleName);
	    }
	    }catch(Exception e){
	      LOG.log(Level.WARNING, "can not export number format for code" + format.toString(), e);
	    }
	  }

  //y->Y, d->D, E->N,s->S
  private String getODFFormat(String format, String type){
    if(ConversionConstant.DATE_TYPE.equals(type)
        || ConversionConstant.TIME_TYPE.equals(type)){
      
      int i=0;
      char ch;
      StringBuffer newFormat = new StringBuffer();
      while (i < format.length()) {
        ch = format.charAt(i);
        switch(ch){
          case 'y':
            newFormat.append("Y");
            break;
          case 'd':
            newFormat.append("D");
            break;
          case 'E':
            newFormat.append("N");
            break;
          case 's':
            newFormat.append("S");
            break;
          case 'h':
            newFormat.append("H");
            break;
          default:
            newFormat.append(ch);
        }
        i++;
      }
      return newFormat.toString();
    }
//      code = code.replaceAll("y", "Y");
//      code = code.replaceAll("d", "D");
//      code = code.replaceAll("E", "N");
    return format;
  }
  private static void exportCellBorderStyle(OdfStyle odfStyle, OdfStyleProperty styleProperty, String borderKind, String borerColor)
  {
    if (ConversionUtil.hasValue(borderKind) && ConversionUtil.hasValue(borerColor))
    {
      if (borderKind.equals(ConversionConstant.DEFAULT_ZERO))
      {
        // do nothing for now
        // odfStyle.setProperty(styleProperty, "none");

      }
      else
      {
        String borderWidth = BORDER_WIDTH_THIN;// 0.05pt
        if (borderKind.equalsIgnoreCase(ConversionConstant.DEFAULT_BORDER_THICK))
        {
          borderWidth = BORDER_WIDTH_THICK;// 2.5pt
        }
        String border = borderWidth + " solid " + borerColor;
        odfStyle.setProperty(styleProperty, border);
      }
    }
  }

  /**
   * return the row which covered the row at rowIndex
   * 
   * @param rowIndex
   * @return return itself no row covered
   */
  private ConversionUtil.Row getCoveredRow(ConversionUtil.Sheet sheet, int rowIndex)
  {
    String rowId = sheet.rowIdArray.get(rowIndex);
    ConversionUtil.Row row = sheet.getRowById(rowId);
    if (row == null)
    {
      row = new ConversionUtil.Row();
      row.sheetId = sheet.sheetId;
      row.rowId = rowId;
      row.rowIndex = rowIndex;
    }
    for (int i = rowIndex - 1; i >= 0; i--)
    {
      String previousRowId = sheet.rowIdArray.get(i);
      ConversionUtil.Row previousRow = sheet.getRowById(previousRowId);
      if (previousRow != null)
      {
        int rowIndent = rowIndex - (previousRow.rowIndex + previousRow.repeatedNum);
        if (rowIndent <= 0)
          return previousRow;
        else
        {
          if (rowIndent > 1)
          {
            if (ConversionUtil.hasValue(row.rowId))
            {
              return row;
            }
            else
            {
              // this row must be default styled row(default row height, row without default cell style)
              row.repeatedNum = rowIndent - 1;
              row.rowIndex = previousRow.rowIndex + previousRow.repeatedNum + 1;
              row.rowId = "";
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

  /**
   * return the column which covered the column at rowIndex
   * 
   * @param columnIndex
   * @return return itself no column covered
   */
  private ConversionUtil.Column getCoveredColumn(ConversionUtil.Sheet sheet, int columnIndex)
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
    for (int i = columnIndex - 1; i >= 0; i--)
    {
      String previousColumnId = sheet.columnIdArray.get(i);
      ConversionUtil.Column previousColumn = sheet.getStyledColumnById(previousColumnId);
      if (previousColumn != null)
      {
        int columnIndent = columnIndex - (previousColumn.columnIndex + previousColumn.repeatedNum);
        if (columnIndent <= 0)
          return previousColumn;
        else
        {
          if (columnIndent > 1)
          {
            // this row must be default styled row(default row height, row without default cell style)
            column.repeatedNum = columnIndent - 1;
            column.columnIndex = previousColumn.columnIndex + previousColumn.repeatedNum + 1;
            column.columnId = "";
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

  private ArrayList<ConversionUtil.Row> getCoveredRowList(ConversionUtil.Sheet sheet)
  {
    ArrayList<ConversionUtil.Row> coveredRowList = new ArrayList<ConversionUtil.Row>();
    for (int rowIndex = sheet.rowIdArray.size() - 1; rowIndex >= 0;)
    {
      ConversionUtil.Row row = getCoveredRow(sheet, rowIndex);
      coveredRowList.add(row);
      rowIndex = row.rowIndex - 1;
    }
    return coveredRowList;
  }

  private ArrayList<ConversionUtil.Column> getCoveredColumnList(ConversionUtil.Sheet sheet)
  {
    ArrayList<ConversionUtil.Column> coveredColumnList = new ArrayList<ConversionUtil.Column>();
    for (int columnIndex = sheet.columnIdArray.size() - 1; columnIndex >= 0;)
    {
      ConversionUtil.Column column = getCoveredColumn(sheet, columnIndex);
      coveredColumnList.add(column);
      columnIndex = column.columnIndex - 1;
    }
    return coveredColumnList;
  }

  public static void main(String[] args)
  {
    // long start = System.currentTimeMillis();
    // String conversionFolder = "F:\\eclipse-SDK-3.4-win32\\workspace\\Concord\\content.js";
    // new JSON2ODFConverterImpl().convert(conversionFolder, "js", "ods");
    // long end = System.currentTimeMillis();
    // System.out.println("done in " + (end - start) + "ms");

  }
  private boolean isTextFormat(String formatCode){
	  	String replaced = formatCode.replaceAll("[\\\\].", "");
		return replaced.indexOf("@") != -1;
	}
}
