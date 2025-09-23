/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.formula;

import java.util.Arrays;
import java.util.Comparator;
import java.util.StringTokenizer;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;

/**
 * Take from document server side
 */
public class ReferenceUtil
{
  private static final Logger LOG = Logger.getLogger(ReferenceUtil.class.getName());

  public static Object[] sort(Object[] array, final String sortType, final boolean bAscend)
  {
    if ((array != null) && (array.length > 1))
    {
      Arrays.sort(array, new Comparator()
      {

        public int compare(Object obj1, Object obj2)
        {
          Object value1 = ((JSONObject) obj1).get(sortType);
          Object value2 = ((JSONObject) obj2).get(sortType);
          int result = ((Comparable) value1).compareTo(value2);
          return bAscend ? result : (0 - result);
        }
      });
    }
    return array;
  }

  /**
   * when the draft document has been applied the message about delete/add row/column or delete/rename sheet we should update range address
   * if the deleted rows/columns cover the start/end row/column of this range or the renamed/deleted sheet is the sheet of this range.
   * 
   * @return rangeJSON will be updated with the range address
   */
  public static String updateRangeAddressWhenFlush2Doc(JSONObject rangeJSON, RowColIdIndexMeta rowColIdIndexMeta, SheetMeta sheetMeta)
  {
    String updatedRangeAddress = "";
    String startRowId = null;
    String startColId = null;
    String endRowId = null;
    String endColId = null;
    String sheetId = null;
    int startRowIndex = -1;
    int startColIndex = -1;
    int endRowIndex = -1;
    int endColIndex = -1;
    String sheetName = null;
    String rangeAddress = null;
    // String[] addressList = null;
    if (rangeJSON.containsKey(ConversionConstant.RANGE_ADDRESS))
    {
      rangeAddress = rangeJSON.get(ConversionConstant.RANGE_ADDRESS).toString();
      // addressList = rangeAddress.split(":");
    }
    if (rangeJSON.containsKey(ConversionConstant.SHEETID))
    {
      sheetId = (String) rangeJSON.get(ConversionConstant.SHEETID);
      // if the sheetId is empty(that means the range address is start with sheet name as "#REF!.")
      // change it to the first sheet
      if (ConversionUtil.hasValue(sheetId))
      {
        sheetName = sheetMeta.getSheetNameById(sheetId);
      }
    }
    if (sheetName != null)
    {
      // String tokenType = rangeJSON.get(ConversionConstant.REFERENCE_TYPE).toString();
      // if (tokenType.equals(ConversionConstant.CELL_REFERENCE))
      {
        // for cell
        if (rangeJSON.containsKey(ConversionConstant.ROWID_NAME))
        {
          startRowId = (String) rangeJSON.get(ConversionConstant.ROWID_NAME);
          if (ConversionUtil.hasValue(startRowId))
          {
            if (startRowId.equals(ConversionConstant.MAX_REF))
              startRowIndex = 0;
            else
              startRowIndex = rowColIdIndexMeta.getRowIndexById(sheetId, startRowId);
          }
        }
        if (rangeJSON.containsKey(ConversionConstant.COLUMNID_NAME))
        {
          startColId = (String) rangeJSON.get(ConversionConstant.COLUMNID_NAME);
          if (ConversionUtil.hasValue(startColId))
            startColIndex = rowColIdIndexMeta.getColIndexById(sheetId, startColId);
        }
      }
      // else
      {
        if (rangeJSON.containsKey(ConversionConstant.RANGE_STARTROWID))
        {
          startRowId = (String) rangeJSON.get(ConversionConstant.RANGE_STARTROWID);
          if (ConversionUtil.hasValue(startRowId))
          {
            if (startRowId.equals(ConversionConstant.MAX_REF))
              startRowIndex = 0;
            else
              startRowIndex = rowColIdIndexMeta.getRowIndexById(sheetId, startRowId);
          }
        }
        if (rangeJSON.containsKey(ConversionConstant.RANGE_STARTCOLID))
        {
          startColId = (String) rangeJSON.get(ConversionConstant.RANGE_STARTCOLID);
          if (ConversionUtil.hasValue(startColId))
            startColIndex = rowColIdIndexMeta.getColIndexById(sheetId, startColId);
        }
        if (rangeJSON.containsKey(ConversionConstant.RANGE_ENDROWID))
        {
          endRowId = (String) rangeJSON.get(ConversionConstant.RANGE_ENDROWID);
          if (ConversionUtil.hasValue(endRowId))
          {
            if (endRowId.equals(ConversionConstant.MAX_REF))
              endRowIndex = 0;
            else
              endRowIndex = rowColIdIndexMeta.getRowIndexById(sheetId, endRowId);
          }
        }
        if (rangeJSON.containsKey(ConversionConstant.RANGE_ENDCOLID))
        {
          endColId = (String) rangeJSON.get(ConversionConstant.RANGE_ENDCOLID);
          if (ConversionUtil.hasValue(endColId))
            endColIndex = rowColIdIndexMeta.getColIndexById(sheetId, endColId);
        }
      }
      updatedRangeAddress = getRefAddress(sheetName, startRowIndex, startColIndex, endRowIndex, endColIndex, rangeAddress);
    }
    else
    {
      updatedRangeAddress = updateAddressWithInvalidSheetName(rangeAddress);
    }
    rangeJSON.put(ConversionConstant.RANGE_ADDRESS, updatedRangeAddress);
    return updatedRangeAddress;
  }

  // get the cell address by row/column index in the pattern of the addressPattern
  // that is the absolute or relative address
  // if index < 0, means update it to #REF!
  // if index = 0, means not change the index of partternAddress
  // but if start index > 0, end index == 0, then should keep the delta index in the patternAddress
  public static String getRefAddress(String refSheetName, int rowIndex, int colIndex, int endRowIndex, int endColIndex,
      String patternAddress)
  {
    ReferenceParser.ParsedRef ref = ReferenceParser.parse(patternAddress);
    if (ref == null)
      return patternAddress;
    if (ref.sheetName != null)// keep the original address format that with sheet name or not
      ref.sheetName = refSheetName;
    // if ref.endSheetName = "", means that the patternAddress is like Sheet1.A1:.B2
    // if ref.endSheetName = null, Sheet1.A1:B2
    if (ConversionUtil.hasValue(ref.endSheetName))
      ref.endSheetName = refSheetName;
    if (rowIndex == 0)
      rowIndex = ReferenceParser.translateRow(ref.startRow);
    if (endRowIndex == 0)
    {
      int _start = ReferenceParser.translateRow(ref.startRow);
      int _end = ReferenceParser.translateRow(ref.endRow);
      if ((_start > 0) && (_end > 0) && (rowIndex > 0))
      {
        endRowIndex = rowIndex + (_end - _start);
      }
      else
        endRowIndex = _end;
    }
    // boolean bRowChange = false;
    // if( (rowIndex > endRowIndex) && (endRowIndex > 0))
    // {
    // int index = endRowIndex;
    // endRowIndex = rowIndex;
    // rowIndex = index;
    // bRowChange = true;
    // }
    // if(rangeJSON != null){
    // if(bRowChange){
    // String startRowId = (String) rangeJSON.get(ConversionConstant.RANGE_STARTROWID);
    // String endRowId = (String) rangeJSON.get(ConversionConstant.RANGE_ENDROWID);
    // rangeJSON.put(ConversionConstant.RANGE_STARTROWID, endRowId);
    // rangeJSON.put(ConversionConstant.RANGE_ENDROWID, startRowId);
    // }
    // }
    ref.startCol = ReferenceParser.translateCol(colIndex);
    ref.startRow = ReferenceParser.translateRow(rowIndex);
    ref.endCol = ReferenceParser.translateCol(endColIndex);
    ref.endRow = ReferenceParser.translateRow(endRowIndex);
    return ref.toString();

  }

  // if cellAddress contains the sheetName, then update it to "#REF!"
  // the address might be a single cell address or a range address
  public static String updateAddressWithInvalidSheetName(String address)
  {
    StringBuffer buf = new StringBuffer();
    if (address != null)
    {
      String[] addressList = address.split(":");
      for (int i = 0; i < addressList.length; i++)
      {
        String text = addressList[i];
        if (i > 0)
          buf.append(':');
        StringTokenizer stDot = new StringTokenizer(text, ".");
        // get sheet table name and the cell address
        if (stDot.countTokens() >= 2)
        {
          String sheetAddress = stDot.nextToken();
          StringTokenizer stDollar = new StringTokenizer(sheetAddress, "$");
          String sheetName = stDollar.nextToken();
          buf.append(text.replaceFirst(sheetName, ConversionConstant.INVALID_REF));
        }
        else
          buf.append(text);
      }
    }
    return buf.toString();
  }
}
