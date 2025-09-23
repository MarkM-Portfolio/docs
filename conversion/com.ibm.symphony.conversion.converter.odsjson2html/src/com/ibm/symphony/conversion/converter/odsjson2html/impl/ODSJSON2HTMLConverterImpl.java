/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odsjson2html.impl;

import java.io.BufferedOutputStream;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;
import java.util.Map.Entry;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang.StringUtils;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

public class ODSJSON2HTMLConverterImpl
{
  private static Logger log = Logger.getLogger(ODSJSON2HTMLConverterImpl.class.getName());

  private static final Pattern PATTERN_NUMBER = Pattern.compile("^-?\\d+(\\.\\d*)?$");

  private static final Pattern PATTERN_DECIMAL = Pattern.compile("^\\d+\\.\\d+$");

  private static final Pattern PATTERN_LINKPROTOCOL = Pattern.compile("^(http|ftp|https)://.*$");

  private static final int MAX_COLUMN_COUNT = 52;

  private static final int MAX_ROW_COUNT = 1000;

  private static final int DEFAULT_COLUMN_WIDTH = 80;

  private static final int BORDER_DATA_TOP = 0;

  private static final int BORDER_DATA_RIGHT = 1;

  private static final int BORDER_DATA_BOTTOM = 2;

  private static final int BORDER_DATA_LEFT = 3;

  private static final int BORDER_DATA_COLOR = 0;

  private static final int BORDER_DATA_WIDTH = 1;

  private static final String DEFAULT_BORDER_COLOR = "black";

  private static final String CSS_CLASS_FIRST = " class='first'";

  private static final String DEFAULT_PROTOCOL = "http://";

  private static enum BORDER_POSITION {
    TOP, RIGHT, BOTTOM, LEFT
  };

  private static enum BORDER_STYLE_ITEM {
    COLOR, WIDTH
  }

  private JSONObject contentJson;

  private JSONObject metaJson;

  private JSONObject referenceJson;

  private JSONObject sheets;

  private JSONObject sheetsArray;

  private JSONObject rows;

  private JSONArray sheetsIdArray;

  private JSONObject cols;

  private JSONObject styles;

  private JSONObject unnames;

  private JSONObject sheetsContent;

  private Boolean[] hideColumns;

  private java.util.Map<String, String> styleCache;

  private PartialDocumentData partialDocumentData;

  public void convert(File sourceFile, File targetFolder) throws IOException
  {
    FileOutputStream fileOut = null;
    BufferedWriter writer = null;

    try
    {
      init(sourceFile);
      boolean first = true;
      for (Iterator iterator = sheetsIdArray.iterator(); iterator.hasNext();)
      {
        String sheetId = (String) iterator.next();

        if (isSheetEmpty(sheetId))
        {
          // skip empty sheets
          continue;
        }

        String fileName = null;
        if (first)
        {
          fileName = "content.html";
        }
        else
        {
          fileName = "content-" + sheetId + ".html";
        }

        fileOut = new FileOutputStream(new File(targetFolder, fileName));
        writer = new BufferedWriter(new OutputStreamWriter(new BufferedOutputStream(fileOut), Charset.forName("utf-8")));
        if (first)
        {
          writeSheetMeta(writer);
          first = false;
        }
        writeSheet(sheetId, writer);
        writer.flush();
        writer.close();
        fileOut.close();
      }
      if (first)
      {
        // didn't get chance to generate first html file, write meta for empty document
        fileOut = new FileOutputStream(new File(targetFolder, "content.html"));
        writer = new BufferedWriter(new OutputStreamWriter(new BufferedOutputStream(fileOut), Charset.forName("utf-8")));
        writeSheetMeta(writer);
        writer.flush();
        writer.close();
        fileOut.close();
      }
    }
    finally
    {
      if (writer != null)
      {
        writer.close();
      }

      if (fileOut != null)
      {
        fileOut.close();
      }
    }
  }

  // To get the filtered ColId
  private String getFilterCol(String sheetId) throws IOException
  {
    String colFilter = null;
    String usage = null;
    String sheetIdTemp = null;
    Set<Entry<String, JSONObject>> childName = unnames.entrySet();
    for (Iterator iter = childName.iterator(); iter.hasNext();)
    {
      Entry<String, JSONObject> entry = (Entry<String, JSONObject>) iter.next();
      JSONObject child = entry.getValue();
      Object o = child.get(ConversionConstant.RANGE_USAGE);
      if (o != null)
      {
        usage = String.valueOf(o);
      }
      o = child.get(ConversionConstant.SHEETID);
      if (o != null)
      {
        sheetIdTemp = String.valueOf(o);
      }
      if (ConversionConstant.USAGE_FIlTER.equals(usage) && sheetIdTemp.equals(sheetId))
      {
        o = child.get(ConversionConstant.RANGE_STARTCOLID);
        if (o != null)
        {
          colFilter = String.valueOf(o);
          break;
        }
      }
    }
    return colFilter;
  }

  private void writeSheet(String sheetId, BufferedWriter writer) throws IOException
  {
    Object o = sheetsArray.get(sheetId);
    JSONObject sheet = (JSONObject) sheets.get(sheetId);
    String filterCol = getFilterCol(sheetId);
    int filterColIndex = -1;
    JSONObject rowsWithSheetId = (JSONObject) rows.get(sheetId);
    if (rowsWithSheetId == null)
    {
      rowsWithSheetId = new JSONObject();
    }
    String sheetName = (String) sheet.get(ConversionConstant.SHEETNAME);
    if (o == null)
    {
      return;
    }
    JSONArray rowsIdArray = (JSONArray) ((JSONObject) o).get(ConversionConstant.ROWSIDARRAY);
    JSONArray colsIdArray = (JSONArray) ((JSONObject) o).get(ConversionConstant.COLUMNSIDARRAY);
    JSONObject cellsByRows = (JSONObject) ((JSONObject) sheetsContent.get(sheetId)).get(ConversionConstant.ROWS);
    int rowCount = getMaxRowIndex(rowsIdArray, cellsByRows);
    o = sheet.get(ConversionConstant.MAXCOLINDEX);
    int colCount = o == null ? MAX_COLUMN_COUNT : ((Number) o).intValue();
    //int colCount = colsIdArray.size();
    /*boolean columnExceeded = colCount > MAX_COLUMN_COUNT;
    if (columnExceeded)
    {
      colCount = MAX_COLUMN_COUNT;
    }*/
    JSONObject[][] cells = getCellsArray(rowsIdArray, colsIdArray, cellsByRows, rowCount, colCount);
    JSONObject[] colsArray = getColsArray(colsIdArray, MAX_COLUMN_COUNT, sheetId);
    partialDocumentData.clear();

    writer.write("<table cellspacing='0' cellspadding='0' id='grid-");
    writer.write(sheetId);
    writer.write("'");
    /*if (columnExceeded)
    {
      writer.write(" class='columnExceeded'");
    }*/
    writer.write(">");
    writeColGroup(writer, colsArray, colCount);
    int rowRepeat, rowHeight;
    String rowId = null;
    boolean firstRow, hide, secondRowInRepeat;
    firstRow = true;
    hide = false;
    secondRowInRepeat = false;
    rowRepeat = -1;
    rowHeight = -1;
    StringBuilder rowHtmlStringBuilder = null;
    String previousRowString = null;
    String visibility = null;

    for (int rowIndex = 0; rowIndex < cells.length; rowIndex++)
    {
      if (rowRepeat == 0 || secondRowInRepeat)
      {
        // since we generate border for top and bottom cells, so we need to re-generate row html
        // for first, second and last row, and repeat in the middle
        // re-generate for second and last row
        secondRowInRepeat = false;
        rowHtmlStringBuilder = new StringBuilder();
        previousRowString = StringUtils.EMPTY;
      }
      else if (rowRepeat < 0)
      {
        // first row in the range, or not even a repeat range
        // reset rowId, row height, visibility and row repeatnum
        // not in row repeat range, get new rowId
        rowId = (String) rowsIdArray.get(rowIndex);
        // reset row style
        rowHeight = -1;
        hide = false;
        // row visibility & height
        if (StringUtils.isNotEmpty(rowId))
        {
          JSONObject row = (JSONObject) rowsWithSheetId.get(rowId);
          if (row != null)
          {
            rowRepeat = getIntValue(row, ConversionConstant.REPEATEDNUM);
            visibility = (String) row.get(ConversionConstant.VISIBILITY);
            // set hide true if row is hided or is filtered
            if ("hide".equals(visibility) || ConversionConstant.VISIBILITY_FIlTER.equals(visibility))
            {
              hide = true;
            }

            o = row.get(ConversionConstant.HEIGHT);
            rowHeight = o == null ? -1 : ((Number) o).intValue();
          }
        }
        // reset row string
        rowHtmlStringBuilder = new StringBuilder();
        previousRowString = StringUtils.EMPTY;
        // the row in this cycle is the first row in repeat,
        // for next cycle, will be second row, set flag
        if (rowRepeat > 0)
        {
          secondRowInRepeat = true;
        }
      }
      else
      {
        // row repeat, not first, second and last row,
        // repeat previous row string and continue
        if (previousRowString.indexOf(CSS_CLASS_FIRST) > -1)
        {
          previousRowString = previousRowString.replace(CSS_CLASS_FIRST, StringUtils.EMPTY);
        }

        writer.write(previousRowString);
        rowRepeat--;
        continue;
      }

      rowRepeat--;

      rowHtmlStringBuilder.append("<tr");
      // hidden row & row height
      if (hide || rowHeight > 0)
      {
        if (hide)
        {
          if (ConversionConstant.VISIBILITY_FIlTER.equals(visibility))
          {
            rowHtmlStringBuilder.append(" class='filtered'");
          }
          else
          {
            rowHtmlStringBuilder.append(" class='hidden'");
          }
        }
        if (rowHeight > 0)
        {
          rowHtmlStringBuilder.append(" style='");
          rowHtmlStringBuilder.append("height:").append(String.valueOf(rowHeight)).append("px;");
          rowHtmlStringBuilder.append('\'');
        }
      }

      if (!hide && firstRow)
      {
        // no hidden and is first, going to draw first shown row
        firstRow = false;
        rowHtmlStringBuilder.append(CSS_CLASS_FIRST);
      }

      rowHtmlStringBuilder.append('>');
      JSONObject[] cellsInRow = cells[rowIndex];
      for (int colIndex = 0; colIndex < cellsInRow.length; colIndex++)
      {
        JSONObject cell = cellsInRow[colIndex];
        String v = null;
        if (cell != null)
        {
          o = cell.get("v");
          if (o != null)
          {
            v = String.valueOf(o);
          }
        }
        // String v = cell == null ? null : String.valueOf(cell.get("v"));
        boolean isFormula = ConversionUtil.isFormulaString(v);
        boolean shouldLeftAlign = StringUtils.isNotEmpty(v)
            && !(isFormula || isNumberic(v) || Boolean.TRUE.toString().equalsIgnoreCase(v) || Boolean.FALSE.toString().equalsIgnoreCase(v));
        String borderStyle = getHtmlBorderStyle(cell, cells, colsArray, rowIndex, colIndex);
        String styleId = getCellStyleId(cell, colsArray[colIndex]);
        // flag that value written in the cell is just raw value, need client
        // calculation to refresh
        boolean rawValue = false;
        // flag that if the value is decimal ( && is not rawValue)
        boolean decimal = false;
        if (styleId != null && isFormatStyle(styleId))
        {
          String colId = null;
          if (colIndex < colsIdArray.size())
          {
            colId = (String) colsIdArray.get(colIndex);
          }
          else
          {
            colId = "";
          }
          if (cell == null || StringUtils.isEmpty((String) cell.get(ConversionConstant.STYLEID)))
          {
            // is a styled column
            partialDocumentData.addFormatColumn(sheetId, sheetName, colId, colIndex, styleId);
          }

          if (cell != null)
          {
            partialDocumentData.addFormatCell(sheetId, sheetName, rowId, rowIndex, colId, colIndex, cell);
          }
          rawValue = true;
        }
        decimal = !rawValue && StringUtils.isNotEmpty(v) && isDecimal(v);
        String colId = null;
        if (colIndex < colsIdArray.size())
        {
          colId = (String) colsIdArray.get(colIndex);
        }
        else
        {
          colId = "";
        }
        //flag the cell that contains filter header 
        boolean shouldFilterValueSpan = rowIndex == 0 && filterCol != null && filterCol.equals(colId);
        if (shouldFilterValueSpan)
        {
          filterColIndex = colIndex;
        }
        //flag the column which is filter column 
        boolean isFilterColumn = colIndex == filterColIndex;
        if (isFormula)
        {
          o = cell.get("cv");
          if (o != null)
          {
            v = String.valueOf(o);
          }
          partialDocumentData.addFormulaCell(sheetId, sheetName, rowId, rowIndex, colId, colIndex, cell);
          rawValue = true;
        }
        // To verify if there is number with Style, if yes, add v value to the cell
        boolean numericWithStyleOnFilter = StringUtils.isNotEmpty(v) && ((styleId != null && isFormatStyle(styleId)) || decimal);

        String htmlStyle = styleId != null ? getHtmlStyle(styleId) : "";

        rowHtmlStringBuilder.append("<td");
        if (rawValue)
        {
          // write id
          rowHtmlStringBuilder.append(" id='r").append(String.valueOf(rowIndex)).append("_c").append(colIndex).append('\'');
          rowHtmlStringBuilder.append(" class='rawValue");
        }
        else if (decimal)
        {
          rowHtmlStringBuilder.append(" class='decimal");
        }
        // if is filter column, tag a css class isFilterColumn
        // and if there is number with style add v value using numericWithStyleOnFilter
        if (isFilterColumn)
        {
          if (rawValue || decimal)
          {
            rowHtmlStringBuilder.append(" isFilterColumn'");
          }
          else
          {
            rowHtmlStringBuilder.append(" class='isFilterColumn'");
          }
          rowHtmlStringBuilder.append(" rowIndex='");// isFilterColumn'");
          rowHtmlStringBuilder.append(rowIndex);
          if (numericWithStyleOnFilter)
          {
            rowHtmlStringBuilder.append("' v='");
            rowHtmlStringBuilder.append(v);
          }
          rowHtmlStringBuilder.append("'");
        }
        else if (rawValue || decimal)
        {
          rowHtmlStringBuilder.append("'");
        }

        boolean hideColumn = hideColumns[colIndex] == null ? false : hideColumns[colIndex];

        if (StringUtils.isNotEmpty(htmlStyle) || shouldLeftAlign || StringUtils.isNotEmpty(borderStyle) || hideColumn)
        {
          rowHtmlStringBuilder.append(" style='");
          if (hideColumn)
          {
            // don't display the <TD>
            rowHtmlStringBuilder.append("display:none;");
          }
          if (StringUtils.isNotEmpty(htmlStyle))
          {
            rowHtmlStringBuilder.append(htmlStyle);
          }
          if (shouldLeftAlign && htmlStyle.indexOf("text-align") == -1)
          {
            rowHtmlStringBuilder.append("text-align:left;");
          }
          if (StringUtils.isNotEmpty(borderStyle))
          {
            rowHtmlStringBuilder.append(borderStyle);
          }
          rowHtmlStringBuilder.append('\'');
        }

        // write merged cells
        int colspan = cell == null ? 1 : getIntValue(cell, ConversionConstant.COLSPAN);
        if (colspan > 1)
        {
          rowHtmlStringBuilder.append(" colspan='").append(String.valueOf(colspan)).append('\'');
          colIndex += colspan - 1;
        }
        rowHtmlStringBuilder.append('>');

        // write float span for right align and unwrapped text
        JSONObject styleJson = (JSONObject) styles.get(styleId);
        boolean shouldWriteFloatSpan = false;
        if (styleJson != null)
        {
          shouldWriteFloatSpan = !getBooleanValue(styleJson, ConversionConstant.WRAPTEXT) // no wrapping
              && ConversionConstant.TEXT_ALIGN_VALUE_RIGHT.equals(styleJson.get(ConversionConstant.TEXT_ALIGN)); // align right
        }
        //To deal with the wrap text
        if (shouldWriteFloatSpan)
        {
          rowHtmlStringBuilder.append("<span class='alignRight'>");
        }
        //To deal with the filter header
        if (shouldFilterValueSpan)
        {
          String filterHeaderNode = "FilterHeader_" + sheetId;
          rowHtmlStringBuilder.append("<div id='").append(filterHeaderNode).append("' class='filter-header filterHeaderIcon'></div>");
        }

        //wrap text and filter header happen at the same time
        if (shouldFilterValueSpan && shouldWriteFloatSpan)
        {
          rowHtmlStringBuilder.append("<div class='wrapAndFilter'>");
        }
        if (StringUtils.isNotEmpty(v))
        {
          o = cell.get("link");
          if (o != null)
          {
            rowHtmlStringBuilder.append("<a href='");
            if (!isHyperLinkWithProtocol(v))
            {
              rowHtmlStringBuilder.append(DEFAULT_PROTOCOL);
            }
            rowHtmlStringBuilder.append(v);
            rowHtmlStringBuilder.append("'>");
            v = StringEscapeUtils.escapeHtml(escapeSingleQuote(v));
            rowHtmlStringBuilder.append(v);
            rowHtmlStringBuilder.append("</a>");
          }
          else
          {
            rowHtmlStringBuilder.append(StringEscapeUtils.escapeHtml(escapeSingleQuote(v)));
          }
        }
        if (shouldFilterValueSpan && shouldWriteFloatSpan)
        {
          rowHtmlStringBuilder.append("</div>");
        }
        if (shouldWriteFloatSpan)
        {
          rowHtmlStringBuilder.append("</span>");
        }
        rowHtmlStringBuilder.append("</td>");
      }
      rowHtmlStringBuilder.append("</tr>");
      previousRowString = rowHtmlStringBuilder.toString();
      writer.write(previousRowString);
    }
    writer.write("</table>");

    if (!partialDocumentData.isEmpty())
    {
      writer.write("<script type='text/javascript'>window.g_documentData['");
      writer.write(sheetId);
      writer.write("']=");
      writer.write(partialDocumentData.toString());
      if (filterCol != null)
      {
        writer.write(";window.g_filterColumnIndex=");
        writer.write(String.valueOf(filterColIndex));
      }
      writer.write(";</script>");
    }
    else
    {
      if (filterCol != null)
      {
        writer.write("<script type='text/javascript'>window.g_filterColumnIndex=");
        writer.write(String.valueOf(filterColIndex));
        writer.write(";</script>");
      }
    }
  }

  private void writeSheetMeta(Writer writer) throws IOException
  {
    // output sheet array meta
    writer.write("<script type='text/javascript'>window.g_documentData={};window.g_sheets=[");
    boolean first = true;
    for (Iterator iterator = sheetsIdArray.iterator(); iterator.hasNext();)
    {
      String sheetId = (String) iterator.next();
      if (!isSheetEmpty(sheetId))
      {
        // sheet has content
        if (!first)
        {
          writer.write(",");
        }
        JSONObject sheet = (JSONObject) sheets.get(sheetId);
        writer.write("{'id':'");
        writer.write(sheetId);
        writer.write("','" + ConversionConstant.SHEETNAME + "':'");
        writer.write(StringEscapeUtils.escapeJavaScript((String) sheet.get(ConversionConstant.SHEETNAME)));
        if (first)
        {
          writer.write("','loaded':true}");
          first = false;
        }
        else
        {
          writer.write("'}");
        }
      }
    }
    writer.write("];</script>");
  }

  private void writeColGroup(Writer writer, JSONObject[] colsArray, int colCount) throws IOException
  {
    // set the hide boolean array to judge whether the column should be hide; set default is false
    hideColumns = new Boolean[colCount];
    writer.write("<colgroup>");
    // get column width
    JSONObject defaultColStyle = (JSONObject) styles.get(ConversionConstant.DEFAULT_COLUMN_STYLE);
    int defaultWidth = DEFAULT_COLUMN_WIDTH;
    if (defaultColStyle != null)
    {
      Object o = defaultColStyle.get(ConversionConstant.WIDTH);
      if (o != null)
      {
        defaultWidth = ((Number) o).intValue();
      }
    }

    for (int i = 0; i < colCount; i++)
    {
      int width = defaultWidth;
      if (i < colsArray.length)
      {
        JSONObject col = colsArray[i];
        if (col != null)
        {
          Object hide = col.get(ConversionConstant.VISIBILITY);
          hideColumns[i] = hide == null ? false : ((String) hide).equals("hide");
          if (!hideColumns[i])
          {
            Object o = col.get(ConversionConstant.WIDTH);
            if (o != null)
            {
              width = ((Number) o).intValue();
            }
          }
        }
        if (hideColumns[i] == null || !hideColumns[i])
        {
          writer.write("<col");
          writer.write(" style='width:");
          writer.write(String.valueOf(width));
          writer.write("px;min-width:");
          writer.write(String.valueOf(width));
          writer.write("px;'");
          writer.write('>');
        }
      }
    }
    writer.write("</colgroup>");
  }

  private String getHtmlStyle(String styleId)
  {
    // try hit cache
    String s = styleCache.get(styleId);
    if (StringUtils.isNotEmpty(s))
    {
      return s;
    }

    StringBuilder style = new StringBuilder();
    JSONObject styleJson = (JSONObject) styles.get(styleId);

    appendHtmlStyleIfExists(style, styleJson, ConversionConstant.TEXT_ALIGN, "text-align");
    appendHtmlStyleIfExists(style, styleJson, ConversionConstant.BACKGROUND_COLOR, "background-color");

    JSONObject fontJson = (JSONObject) styleJson.get(ConversionConstant.FONT);
    if (fontJson != null)
    {
      appendHtmlStyleIfExists(style, fontJson, ConversionConstant.FONTNAME, "font-family");
      appendHtmlStyleIfExists(style, fontJson, ConversionConstant.SIZE, "font-size", "pt");
      appendHtmlStyleIfExists(style, fontJson, ConversionConstant.COLOR, "color");
      if (getBooleanValue(fontJson, ConversionConstant.ITALIC))
      {
        style.append("font-style:italic;");
      }
      if (getBooleanValue(fontJson, ConversionConstant.BOLD))
      {
        style.append("font-weight:bold;");
      }
      boolean underline = getBooleanValue(fontJson, ConversionConstant.UNDERLINE);
      boolean st = getBooleanValue(fontJson, ConversionConstant.STRIKTHROUGH);
      if (underline || st)
      {
        style.append("text-decoration:");
        if (underline)
        {
          style.append("underline ");
        }
        if (st)
        {
          style.append("line-through");
        }
        style.append(';');
      }
    }

    boolean wrapText = getBooleanValue(styleJson, ConversionConstant.WRAPTEXT);
    if (wrapText)
    {
      style.append("white-space:pre-wrap;word-wrap:break-word;");
    }
    else
    {
      String align = getStringValue(styleJson, ConversionConstant.TEXT_ALIGN);
      if (align.equalsIgnoreCase(ConversionConstant.TEXT_ALIGN_VALUE_JUSTIFY))
        style.append("white-space:pre-wrap;word-wrap:break-word;");
    }
    s = style.toString();
    styleCache.put(styleId, s);
    return s;
  }

  /*
   * considering neighbour cell and compute border style
   */
  private String getHtmlBorderStyle(JSONObject cell, JSONObject[][] cells, JSONObject[] colsArray, int rowIndex, int colIndex)
  {
    JSONObject topCell = null;
    JSONObject topBorder = null;
    JSONObject topBorderColor = null;
    String styleId = null;
    JSONObject styleJson = null;
    if (rowIndex > 0)
    {
      topCell = cells[rowIndex - 1][colIndex];
      styleId = getCellStyleId(topCell, colsArray[colIndex]);
      if (styleId != null)
      {
        styleJson = (JSONObject) styles.get(styleId);
        topBorder = (JSONObject) styleJson.get(ConversionConstant.BORDER);
        topBorderColor = (JSONObject) styleJson.get(ConversionConstant.BORDERCOLOR);
      }
    }

    JSONObject rightCell = null;
    JSONObject rightBorder = null;
    JSONObject rightBorderColor = null;
    if (colIndex < cells[rowIndex].length - 1)
    {
      rightCell = cells[rowIndex][colIndex + 1];
      styleId = getCellStyleId(rightCell, colsArray[colIndex + 1]);
      if (styleId != null)
      {
        styleJson = (JSONObject) styles.get(styleId);
        rightBorder = (JSONObject) styleJson.get(ConversionConstant.BORDER);
        rightBorderColor = (JSONObject) styleJson.get(ConversionConstant.BORDERCOLOR);
      }
    }
    JSONObject bottomCell = null;
    JSONObject bottomBorder = null;
    JSONObject bottomBorderColor = null;
    if (rowIndex < cells.length - 1)
    {
      bottomCell = cells[rowIndex + 1][colIndex];
      styleId = getCellStyleId(bottomCell, colsArray[colIndex]);
      if (styleId != null)
      {
        styleJson = (JSONObject) styles.get(styleId);
        bottomBorder = (JSONObject) styleJson.get(ConversionConstant.BORDER);
        bottomBorderColor = (JSONObject) styleJson.get(ConversionConstant.BORDERCOLOR);
      }
    }
    JSONObject leftCell = null;
    JSONObject leftBorder = null;
    JSONObject leftBorderColor = null;
    if (colIndex > 0)
    {
      leftCell = cells[rowIndex][colIndex - 1];
      styleId = getCellStyleId(leftCell, colsArray[colIndex - 1]);
      if (styleId != null)
      {
        styleJson = (JSONObject) styles.get(styleId);
        leftBorder = (JSONObject) styleJson.get(ConversionConstant.BORDER);
        leftBorderColor = (JSONObject) styleJson.get(ConversionConstant.BORDERCOLOR);
      }
    }

    StringBuilder style = new StringBuilder();
    styleId = getCellStyleId(cell, colsArray[colIndex]);
    JSONObject selfBorder = null;
    JSONObject selfBorderColor = null;
    if (styleId != null)
    {
      styleJson = (JSONObject) styles.get(styleId);
      selfBorder = (JSONObject) styleJson.get(ConversionConstant.BORDER);
      selfBorderColor = (JSONObject) styleJson.get(ConversionConstant.BORDERCOLOR);
    }

    Object[][] borderData = new Object[4][2];

    borderData[BORDER_DATA_TOP] = computeBorderStyle(//
        toBorderPxWidth(getBorderStyleFromJson(selfBorder, BORDER_POSITION.TOP, BORDER_STYLE_ITEM.WIDTH)), //
        getBorderStyleFromJson(selfBorderColor, BORDER_POSITION.TOP, BORDER_STYLE_ITEM.COLOR), //
        toBorderPxWidth(getBorderStyleFromJson(topBorder, BORDER_POSITION.BOTTOM, BORDER_STYLE_ITEM.WIDTH)), //
        getBorderStyleFromJson(topBorderColor, BORDER_POSITION.BOTTOM, BORDER_STYLE_ITEM.COLOR), //
        rowIndex == 0); // compare to top, self is master, but self don't prefer drawing top border, unless in row 1

    borderData[BORDER_DATA_RIGHT] = computeBorderStyle(//
        toBorderPxWidth(getBorderStyleFromJson(rightBorder, BORDER_POSITION.LEFT, BORDER_STYLE_ITEM.WIDTH)), //
        getBorderStyleFromJson(rightBorderColor, BORDER_POSITION.LEFT, BORDER_STYLE_ITEM.COLOR), //
        toBorderPxWidth(getBorderStyleFromJson(selfBorder, BORDER_POSITION.RIGHT, BORDER_STYLE_ITEM.WIDTH)), //
        getBorderStyleFromJson(selfBorderColor, BORDER_POSITION.RIGHT, BORDER_STYLE_ITEM.COLOR), //
        true); // compare to right, neighbor is master, but self would like to draw right border

    borderData[BORDER_DATA_BOTTOM] = computeBorderStyle(//
        toBorderPxWidth(getBorderStyleFromJson(bottomBorder, BORDER_POSITION.TOP, BORDER_STYLE_ITEM.WIDTH)), //
        getBorderStyleFromJson(bottomBorderColor, BORDER_POSITION.RIGHT, BORDER_STYLE_ITEM.COLOR), //
        toBorderPxWidth(getBorderStyleFromJson(selfBorder, BORDER_POSITION.BOTTOM, BORDER_STYLE_ITEM.WIDTH)), //
        getBorderStyleFromJson(selfBorderColor, BORDER_POSITION.BOTTOM, BORDER_STYLE_ITEM.COLOR), //
        true); // compare to bottom, neighbor is master, but self would like to draw bottom border

    borderData[BORDER_DATA_LEFT] = computeBorderStyle(toBorderPxWidth(//
        getBorderStyleFromJson(selfBorder, BORDER_POSITION.LEFT, BORDER_STYLE_ITEM.WIDTH)), //
        getBorderStyleFromJson(selfBorderColor, BORDER_POSITION.LEFT, BORDER_STYLE_ITEM.COLOR), //
        toBorderPxWidth(getBorderStyleFromJson(leftBorder, BORDER_POSITION.RIGHT, BORDER_STYLE_ITEM.WIDTH)), //
        getBorderStyleFromJson(leftBorderColor, BORDER_POSITION.RIGHT, BORDER_STYLE_ITEM.COLOR), //
        colIndex == 0); // compare to left, self is master, but self don't prefer drawing left border, unless in column 1

    style.append(borderData2HtmlBorderStyle(borderData));

    return style.toString();
  }

  private String borderData2HtmlBorderStyle(Object[][] borderData)
  {
    boolean fullBorder = true;
    StringBuilder color = new StringBuilder();
    StringBuilder width = new StringBuilder();
    StringBuilder fullStyle = new StringBuilder();
    for (int i = 0; i < 4; i++)
    {
      if (borderData[i] == null)
      {
        fullBorder = false;
        continue;
      }
      if (borderData[i][BORDER_DATA_WIDTH] != null && borderData[i][BORDER_DATA_COLOR] == null)
      {
        // border has width but no color, paint default color
        borderData[i][BORDER_DATA_COLOR] = DEFAULT_BORDER_COLOR;
      }
      for (int j = 0; j < 2; j++)
      {
        // prepare fullStyle
        fullStyle.append("border-");
        switch (i)
          {
            case BORDER_DATA_TOP :
              fullStyle.append("top-");
              break;
            case BORDER_DATA_RIGHT :
              fullStyle.append("right-");
              break;
            case BORDER_DATA_BOTTOM :
              fullStyle.append("bottom-");
              break;
            case BORDER_DATA_LEFT :
              fullStyle.append("left-");
              break;
            default:
              break;
          }
        switch (j)
          {
            case BORDER_DATA_COLOR :
              fullStyle.append("color:");
              fullStyle.append((String) borderData[i][j]);
              fullStyle.append(';');
              break;
            case BORDER_DATA_WIDTH :
              fullStyle.append("width:");
              fullStyle.append(((Integer) borderData[i][j]).toString());
              fullStyle.append("px;");
              break;
            default:
              break;
          }

        if (fullBorder)
        {
          switch (j)
            {
              case BORDER_DATA_COLOR :
                color.append((String) borderData[i][j]).append(' ');
                break;
              case BORDER_DATA_WIDTH :
                width.append((Integer) borderData[i][j]).append("px ");
                break;
              default:
                break;
            }
        }
      }
    }

    if (fullBorder)
    {
      // optimize for full border
      // remove end space
      color.deleteCharAt(color.length() - 1);
      width.deleteCharAt(width.length() - 1);
      if (borderData[BORDER_DATA_LEFT][BORDER_DATA_COLOR].equals(borderData[BORDER_DATA_RIGHT][BORDER_DATA_COLOR]))
      {
        removeLastValue(color);
        if (borderData[BORDER_DATA_BOTTOM][BORDER_DATA_COLOR].equals(borderData[BORDER_DATA_TOP][BORDER_DATA_COLOR]))
        {
          removeLastValue(color);
          if (borderData[BORDER_DATA_RIGHT][BORDER_DATA_COLOR].equals(borderData[BORDER_DATA_TOP][BORDER_DATA_COLOR]))
          {
            removeLastValue(color);
          }
        }
      }

      if (borderData[BORDER_DATA_LEFT][BORDER_DATA_WIDTH].equals(borderData[BORDER_DATA_RIGHT][BORDER_DATA_WIDTH]))
      {
        removeLastValue(width);
        if (borderData[BORDER_DATA_BOTTOM][BORDER_DATA_WIDTH].equals(borderData[BORDER_DATA_TOP][BORDER_DATA_WIDTH]))
        {
          removeLastValue(width);
          if (borderData[BORDER_DATA_RIGHT][BORDER_DATA_WIDTH].equals(borderData[BORDER_DATA_TOP][BORDER_DATA_WIDTH]))
          {
            removeLastValue(width);
          }
        }
      }
      StringBuilder s = new StringBuilder();
      s.append("border-color:").append(color).append(';');
      s.append("border-width:").append(width).append(';');
      return s.toString();
    }
    else
    {
      return fullStyle.toString();
    }
  }

  /**
   * <p>
   * Apply border style alg to choose border color/style and border width for a cell. Caller passes in competing border data. This method
   * returns selected border style and width for this cell.
   * <p>
   * Alg is like:
   * <li>when masterWidth >= slaveWidth, choose masterColor
   * <li>when masterWidth < slaveWidth, choose slaveColor
   * <li>if this cell <b>preferWidth</b>, then return bigger width px for this cell
   * 
   * @param masterWidth
   *          master side competing border
   * @param masterColor
   * @param slaveWidth
   *          slave side competing border
   * @param slaveColor
   * @param preferWidth
   *          if true, then this cell get wider width comparing to its neighbor.
   * @return
   */
  private Object[] computeBorderStyle(int masterWidth, String masterColor, int slaveWidth, String slaveColor, boolean preferWidth)
  {
    if (masterWidth == 0 && slaveWidth == 0)
    {
      return null;
    }

    Object[] res = new Object[2];

    if (slaveWidth > masterWidth)
    {
      // choose slave width
      res[BORDER_DATA_COLOR] = slaveColor;
      res[BORDER_DATA_WIDTH] = computeBorderWidth(slaveWidth, preferWidth);
    }
    else
    {
      // choose master width
      res[BORDER_DATA_COLOR] = masterColor;
      res[BORDER_DATA_WIDTH] = computeBorderWidth(masterWidth, preferWidth);
    }
    return res;
  }

  private int computeBorderWidth(int width, boolean preferWidth)
  {
    return preferWidth ? width - (width >> 1) : width >> 1;
  }

  // remove last parameter, from lastIndexOf(' ') ~ length()
  private StringBuilder removeLastValue(StringBuilder s)
  {
    s = s.delete(s.lastIndexOf(" "), s.length());
    return s;
  }

  /*
   * get border width/color style
   */
  private String getBorderStyleFromJson(JSONObject o, BORDER_POSITION pos, BORDER_STYLE_ITEM styleItem)
  {
    switch (styleItem)
      {
        case COLOR :
          if (o != null)
          {
            switch (pos)
              {
                case TOP :
                  return (String) o.get(ConversionConstant.BORDER_TOP_COLOR);
                case RIGHT :
                  return (String) o.get(ConversionConstant.BORDER_RIGHT_COLOR);
                case BOTTOM :
                  return (String) o.get(ConversionConstant.BORDER_BOTTOM_COLOR);
                case LEFT :
                  return (String) o.get(ConversionConstant.BORDER_LEFT_COLOR);
                default:
                  break;
              }
          }
          break;
        case WIDTH :
          if (o != null)
          {
            switch (pos)
              {
                case TOP :
                  return String.valueOf(o.get(ConversionConstant.BORDER_TOP));
                case RIGHT :
                  return String.valueOf(o.get(ConversionConstant.BORDER_RIGHT));
                case BOTTOM :
                  return String.valueOf(o.get(ConversionConstant.BORDER_BOTTOM));
                case LEFT :
                  return String.valueOf(o.get(ConversionConstant.BORDER_LEFT));
                default:
                  break;
              }
          }
          break;
        default:
          break;
      }
    return null;
  }

  private StringBuilder appendHtmlStyleIfExists(StringBuilder style, JSONObject styleJson, String jsonKey, String styleName)
  {
    return appendHtmlStyleIfExists(style, styleJson, jsonKey, styleName, "");
  }

  private StringBuilder appendHtmlStyleIfExists(StringBuilder style, JSONObject styleJson, String jsonKey, String styleName, String unit)
  {
    Object o = styleJson.get(jsonKey);
    if (o != null)
    {
      String v = String.valueOf(o);
      if (StringUtils.isNotEmpty(v))
      {
        style.append(styleName).append(':').append(v).append(unit).append(';');
      }
    }
    return style;
  }

  private int toBorderPxWidth(String width)
  {
    // try parse int
    int border;
    try
    {
      border = Integer.parseInt(width);
      return border;
    }
    catch (NumberFormatException nfe)
    {
      if (StringUtils.isEmpty(width) || "null".equalsIgnoreCase(width))
      {
        return 0;
      }
      else if ("thick".equalsIgnoreCase(width))
      {
        return 3;
      }
      else
      {
        return 1;
      }
    }
  }

  /*
   * cells array containing all content info. size is [rowCount][MAX_COL_COUNT]. index is 0 based row/col index
   */
  private JSONObject[][] getCellsArray(JSONArray rowsIdArray, JSONArray colsIdArray, JSONObject cellsByRows, int rowCount, int colCount)
  {
    JSONObject[][] cells = new JSONObject[rowCount][colCount];
    for (int rowIndex = 0; rowIndex < rowCount; rowIndex++)
    {
      String rowId = (String) rowsIdArray.get(rowIndex);
      JSONObject cellsInRow = (JSONObject) cellsByRows.get(rowId);
      if (cellsInRow == null)
      {
        continue;
      }
      JSONObject[] cellsArr = cells[rowIndex];
      for (int colIndex = 0; colIndex < colCount; colIndex++)
      {
        if (colIndex >= colsIdArray.size())
        {
          break;
        }
        String colId = (String) colsIdArray.get(colIndex);
        JSONObject cell = (JSONObject) cellsInRow.get(colId);
        if (cell == null)
        {
          continue;
        }
        cellsArr[colIndex] = cell;
        int repeat = getIntValue(cell, ConversionConstant.REPEATEDNUM);
        if (repeat > 0)
        {
          int endColIndex = Math.min(colIndex + repeat, colCount - 1);
          for (; colIndex <= endColIndex; colIndex++)
          {
            cellsArr[colIndex] = cell;
          }
          colIndex--;
        }
      }

      JSONObject rowMeta = (JSONObject) rows.get(rowId);
      if (rowMeta != null)
      {
        int repeat = getIntValue(rowMeta, ConversionConstant.REPEATEDNUM);
        if (repeat > 0)
        {
          // copy repeating row to next row
          System.arraycopy(cellsArr, 0, cells[rowIndex + 1], 0, colCount);
          rowIndex += repeat;
          if (repeat > 1)
          {
            // next row not the last row in repeat, copy to last row
            System.arraycopy(cellsArr, 0, cells[rowIndex], 0, colCount);
          }
        }
      }
    }

    return cells;
  }

  private JSONObject[] getColsArray(JSONArray colsIdArray, int colCount, String sheetId)
  {
    JSONObject[] arr = new JSONObject[colCount];
    // for column style
    int length = Math.min(arr.length, colsIdArray.size());
    for (int colIndex = 0; colIndex < length; colIndex++)
    {
      String colId = (String) colsIdArray.get(colIndex);
      if (StringUtils.isEmpty(colId))
      {
        continue;
      }

      // JSONObject col = (JSONObject) cols.get(colId);
      JSONObject columns = (JSONObject) cols.get(sheetId);
      JSONObject col = null;
      if (columns != null)
      {
        col = (JSONObject) columns.get(colId);
      }
      if (col != null)
      {
        arr[colIndex] = col;
        int repeat = getIntValue(col, ConversionConstant.REPEATEDNUM);
        int endColIndex = Math.min(colIndex + repeat, arr.length - 1);
        for (; colIndex <= endColIndex; colIndex++)
        {
          arr[colIndex] = col;
        }
        colIndex--;
      }
    }

    return arr;
  }

  private void init(File sourceDir) throws IOException
  {
    FileInputStream fileIn = new FileInputStream(new File(sourceDir, "content.js"));
    contentJson = JSONObject.parse(fileIn);
    fileIn.close();
    fileIn = new FileInputStream(new File(sourceDir, "meta.js"));
    metaJson = JSONObject.parse(fileIn);
    fileIn.close();
    // may not have this...
    File refFile = new File(sourceDir, "reference.js");
    if (refFile.exists())
    {
      fileIn = new FileInputStream(refFile);
      referenceJson = JSONObject.parse(fileIn);
      fileIn.close();
    }
    else
    {
      referenceJson = new JSONObject();
    }

    sheets = (JSONObject) metaJson.get(ConversionConstant.SHEETS);
    sheetsArray = (JSONObject) metaJson.get(ConversionConstant.SHEETSARRAY);
    rows = (JSONObject) metaJson.get(ConversionConstant.ROWS);
    if (rows == null)
    {
      rows = new JSONObject();
    }

    sheetsIdArray = (JSONArray) metaJson.get(ConversionConstant.SHEETSIDARRAY);
    cols = (JSONObject) metaJson.get(ConversionConstant.COLUMNS);
    if (cols == null)
    {
      cols = new JSONObject();
    }

    sheetsContent = (JSONObject) contentJson.get(ConversionConstant.SHEETS);
    styles = (JSONObject) contentJson.get(ConversionConstant.STYLES);
    unnames = (JSONObject) contentJson.get(ConversionConstant.UNNAME_RANGE);
    if (styles == null)
    {
      styles = new JSONObject();
    }
    if (unnames == null)
    {
      unnames = new JSONObject();
    }
    styleCache = new HashMap<String, String>();
    partialDocumentData = new PartialDocumentData(contentJson, metaJson, referenceJson);
  }

  private int getMaxRowIndex(JSONArray rowsIdArray, JSONObject cellsByRows)
  {
    String rowId = null;
    boolean found = false;
    int i = 0;
    if (rowsIdArray == null)
    {
      // no rows at all, empty sheet
      return 0;
    }
    for (i = rowsIdArray.size() - 1; i >= 0; i--)
    {
      rowId = (String) rowsIdArray.get(i);
      JSONObject cells = (JSONObject) cellsByRows.get(rowId);
      if (rowId != null && cells != null)
      {
        // get row repeatednum, check if it is abnormaly large(>1000)
        JSONObject rowMeta = (JSONObject) rows.get(rowId);
        if (rowMeta != null && getIntValue(rowMeta, ConversionConstant.REPEATEDNUM) > MAX_ROW_COUNT)
        {
          // not last row
          found = false;
          continue;
        }

        Set<Entry<String, JSONObject>> cellEntry = cells.entrySet();
        for (Iterator iterator = cellEntry.iterator(); iterator.hasNext();)
        {
          Entry<String, JSONObject> entry = (Entry<String, JSONObject>) iterator.next();
          JSONObject cell = entry.getValue();
          Object o = cell.get("v");
          if (o != null && StringUtils.isNotEmpty(String.valueOf(o)))
          {
            found = true;
            break;
          }
          else
          {
            String styleId = (String) cell.get("styleid");
            if (styleId != null && !styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))
            {
              found = true;
              break;
            }
          }
        }
      }

      if (found)
      {
        break;
      }
    }
    if (!found)
    {
      return 0;
    }
    // i is 0-based line number
    JSONObject rowMeta = (JSONObject) rows.get(rowId);
    int repeat = rowMeta == null ? 0 : getIntValue(rowMeta, ConversionConstant.REPEATEDNUM);
    return i + repeat + 1;
  }

  private boolean isNumberic(String v)
  {
    return PATTERN_NUMBER.matcher(v).matches();
  }

  private boolean isHyperLinkWithProtocol(String v)
  {
    return PATTERN_LINKPROTOCOL.matcher(v).matches();
  }

  private boolean isDecimal(String v)
  {
    return PATTERN_DECIMAL.matcher(v).matches();
  }

  private int getIntValue(JSONObject obj, String key)
  {
    Object o = obj.get(key);
    return o == null ? 0 : ((Number) o).intValue();
  }

  private boolean getBooleanValue(JSONObject obj, String key)
  {
    Object o = obj.get(key);
    return o == null ? false : ((Boolean) o).booleanValue();
  }

  private String getStringValue(JSONObject obj, String key)
  {
    Object o = obj.get(key);
    return o == null ? "" : ((String) o);
  }

  /*
   * get cell style id, considering column style
   */
  private String getCellStyleId(JSONObject cell, JSONObject col)
  {
    String styleId = cell == null ? null : (String) cell.get(ConversionConstant.STYLEID);
    if (styleId != null)
    {
      return styleId;
    }
    else
    {
      if (col != null)
      {
        styleId = (String) col.get(ConversionConstant.STYLEID);
        return styleId;
      }
      return null;
    }
  }

  /*
   * check if is format style
   */
  private boolean isFormatStyle(String styleId)
  {
    JSONObject style = (JSONObject) styles.get(styleId);
    JSONObject format = (JSONObject) style.get(ConversionConstant.FORMAT);
    if (format == null)
    {
      return false;
    }
    String category = (String) format.get(ConversionConstant.FORMATCATEGORY);
    return StringUtils.isNotEmpty(category);
  }

  private String escapeSingleQuote(String v)
  {
    // strip prefix "'"
    StringBuilder sb = new StringBuilder(v);
    if (sb.charAt(0) == '\'')
    {
      sb.deleteCharAt(0);
    }

    return sb.toString();
  }

  // determine if a sheet is empty, by checking sheet content -> row JSON
  private boolean isSheetEmpty(String sheetId)
  {
    if (sheetsContent == null)
    {
      return true;
    }

    JSONObject sheetJson = (JSONObject) sheetsContent.get(sheetId);
    if (sheetJson == null)
    {
      return true;
    }

    JSONObject cellsByRows = (JSONObject) sheetJson.get(ConversionConstant.ROWS);
    return cellsByRows == null || cellsByRows.size() == 0;
  }
}
