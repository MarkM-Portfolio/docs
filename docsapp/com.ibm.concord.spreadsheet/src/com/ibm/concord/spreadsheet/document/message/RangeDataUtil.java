/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.document.message;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.SerializationUtils;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil;
import com.ibm.concord.spreadsheet.document.message.Message.FormulaTokenId;
import com.ibm.concord.spreadsheet.document.message.Message.OPType;
import com.ibm.concord.spreadsheet.document.message.Message.Token;
import com.ibm.concord.spreadsheet.document.message.Message.TokenId;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.ReferenceToken;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class RangeDataUtil
{
  private static final Logger LOG = Logger.getLogger(RangeMsg.class.getName());

  private static Map<String, Object> createCellDataById(JSONObject cellJson, String sheetName, IDManager idm, boolean transformFormula)
  {
    Map<String, Object> cellDataUseId = new HashMap<String, Object>();

    Object value = cellJson.get(ConversionConstant.VALUE_A);
    if (transformFormula && value != null && MessageUtil.isFormulaString(value.toString()))
    {
      FormulaTokenId formulaTokenId = new FormulaTokenId(value.toString(), cellJson.get(ConversionConstant.TOKENARRAY));
      formulaTokenId.updateTokenId(idm, sheetName);
      cellDataUseId.put(ConversionConstant.VALUE_A, formulaTokenId);
    }
    else if (value != null)
    {
      cellDataUseId.put(ConversionConstant.VALUE_A, value);
    }

    // keep all the properties into the map except repeatednum and value
    Iterator cellItor = cellJson.entrySet().iterator();
    while (cellItor.hasNext())
    {
      java.util.Map.Entry cellEntry = (java.util.Map.Entry) cellItor.next();
      String key = (String) cellEntry.getKey();
      if (key.equals(ConversionConstant.REPEATEDNUM_A) || key.equals(ConversionConstant.VALUE_A))
        continue;
      cellDataUseId.put(key, cellEntry.getValue());
    }

    return cellDataUseId;
  }

  private static JSONObject createCellDataByIndex(Map<String, Object> cellDataUseId, IDManager idm)
  {
    JSONObject cellJson = new JSONObject();

    Iterator cellItor = cellDataUseId.entrySet().iterator();
    while (cellItor.hasNext())
    {
      java.util.Map.Entry cellEntry = (java.util.Map.Entry) cellItor.next();
      String key = (String) cellEntry.getKey();
      Object cellPro = cellEntry.getValue();
      if (cellPro instanceof FormulaTokenId)
      {
        FormulaTokenId formulaTokenId = (FormulaTokenId) cellPro;
        formulaTokenId.updateToken(idm);
        String cellvalue = formulaTokenId.getValue();
        cellJson.put(ConversionConstant.VALUE_A, cellvalue);
        JSONArray tokenArr = formulaTokenId.getTokenArray();
        if (tokenArr != null && !tokenArr.isEmpty())
          cellJson.put(ConversionConstant.TOKENARRAY, tokenArr);
      }
      else if(cellPro instanceof TokenId)
      {
    	TokenId colSpanTokenId = (TokenId)cellPro;
        colSpanTokenId.updateToken(idm);
    	int colspan = colSpanTokenId.getToken().getCount(OPType.Column);
    	if(colspan>1)
    		cellJson.put(ConversionConstant.COLSPAN_A, colspan);
      }
      else
      {
        cellJson.put(key, cellPro);
      }
    }
    return cellJson;
  }

  public static void fillRowsUseId(Map<TokenId, Object> rowsById, String sheetName, int rowIndex, JSONObject rowJson, IDManager idm)
  {
    fillRowsUseId(rowsById, sheetName, rowIndex, rowJson, idm, true);
  }

  public static void fillRowsUseId(Map<TokenId, Object> rowsById, String sheetName, int rowIndex, JSONObject rowJson, IDManager idm,
      boolean transformFormula)
  {

    JSONObject cellsJson = (JSONObject) rowJson.get(ConversionConstant.CELLS);
    // if cellsJson is null, no data need be transformed
    if (cellsJson == null)
      return;

    Object rowrepeat = rowJson.get(ConversionConstant.REPEATEDNUM_A);
    int repeatedNum = 0;
    if (rowrepeat != null)
    {
      repeatedNum = Integer.valueOf(rowrepeat.toString());
    }

    // get row index
    // int rowIndex = Integer.valueOf((String) entry.getKey());
    int endRowIndex = rowIndex + repeatedNum;
    String refvalue = sheetName + "!" + rowIndex + ":" + endRowIndex;

    // create a token to track the change of the row range
    Token token = new Token(refvalue, null, OPType.Row);
    TokenId tokenId = new TokenId(token, idm);
    Map<TokenId, Object> cellsUseId = new HashMap<TokenId, Object>();

    Iterator cellsItor = cellsJson.entrySet().iterator();
    while (cellsItor.hasNext())
    {
      java.util.Map.Entry cellsEntry = (java.util.Map.Entry) cellsItor.next();
      String colIndex = (String) cellsEntry.getKey();
      JSONObject cellJson = (JSONObject) cellsEntry.getValue();

      Object cellrepeat = cellJson.get(ConversionConstant.REPEATEDNUM_A);
      int cellRepeateNum = 0;
      if (cellrepeat != null)
        cellRepeateNum = Integer.valueOf(cellrepeat.toString());

      // get column index
      int startColIndex = ReferenceParser.translateCol(colIndex);
      int endColIndex = startColIndex + cellRepeateNum;
      String cellrefvalue = sheetName + "!" + colIndex + ":" + ReferenceParser.translateCol(endColIndex);

      // create a token to track the change of the column range
      Token celltoken = new Token(cellrefvalue, null, OPType.Column);
      TokenId celltokenId = new TokenId(celltoken, idm);

      Map<String, Object> cellDataUseId = createCellDataById(cellJson, sheetName, idm, transformFormula);
      Number colspan = (Number)cellJson.get(ConversionConstant.COLSPAN_A);
      if(colspan!=null)
      {
    	  int spanEnd = startColIndex + colspan.intValue() - 1;
    	  String colSpanAddr = sheetName + "!" + colIndex + ":" + ReferenceParser.translateCol(spanEnd);
    	  Token newToken = new Token(colSpanAddr,sheetName,OPType.UnnameRange);
    	  TokenId colSpanTokenId = new TokenId(newToken,idm);
    	  cellDataUseId.put(ConversionConstant.COLSPAN_A, colSpanTokenId);
      }
      cellsUseId.put(celltokenId, cellDataUseId);
    }

    // create a row map using row id as key
    Map<String, Object> rowDataById = new HashMap<String, Object>();
    rowDataById.put(ConversionConstant.CELLS, cellsUseId);

    // if there still are the properties, such as style, width, keep them.
    Iterator rowJsonItor = rowJson.entrySet().iterator();
    while (rowJsonItor.hasNext())
    {
      java.util.Map.Entry colEntry = (java.util.Map.Entry) rowJsonItor.next();
      String key = (String) colEntry.getKey();
      if (key.equals(ConversionConstant.REPEATEDNUM_A) || key.equals(ConversionConstant.CELLS))
        continue;
      rowDataById.put(key, colEntry.getValue());
    }

    rowsById.put(tokenId, rowDataById);

  }

  public static void fillRowsUseIndex(JSONObject rowsByIndex, TokenId tokenid, Map<String, Object> rowDataUseId, IDManager idm)
  {
    tokenid.updateToken(idm);
    Token token = tokenid.getToken();
    int rowIndex = token.getStartRowIndex();
    int endRowIndex = token.getEndRowIndex();
    if (rowIndex == -1)
      return;

    JSONObject rowJson = new JSONObject();

    int repeatedNum = endRowIndex - rowIndex;
    if (repeatedNum > 0)
    {
      rowJson.put(ConversionConstant.REPEATEDNUM_A, repeatedNum);
    }

    Map<String, Object> cellsUseId = (Map<String, Object>) rowDataUseId.get(ConversionConstant.CELLS);
    if (cellsUseId == null)
      return;

    JSONObject cellsJson = new JSONObject();
    rowJson.put(ConversionConstant.CELLS, cellsJson);

    Iterator cellsItor = cellsUseId.entrySet().iterator();
    while (cellsItor.hasNext())
    {
      java.util.Map.Entry cellentry = (java.util.Map.Entry) cellsItor.next();

      TokenId celltokenid = (TokenId) cellentry.getKey();
      celltokenid.updateToken(idm);
      Token celltoken = celltokenid.getToken();
      int colIndex = celltoken.getStartColIndex();
      int endcolIndex = celltoken.getEndColIndex();

      if (colIndex == -1)
        continue;

      Map<String, Object> cellDataUseId = (Map<String, Object>) cellentry.getValue();

      JSONObject cellJson = createCellDataByIndex(cellDataUseId, idm);
      int cellRepeateNum = endcolIndex - colIndex;
      if (cellRepeateNum > 0)
        cellJson.put(ConversionConstant.REPEATEDNUM_A, cellRepeateNum);
      
      String sColIndex = ReferenceParser.translateCol(colIndex + 1);
      cellsJson.put(sColIndex, cellJson);
    }

    // if there still are the properties, such as style, width, keep them.
    Iterator rowItor = rowDataUseId.entrySet().iterator();
    while (rowItor.hasNext())
    {
      java.util.Map.Entry colEntry = (java.util.Map.Entry) rowItor.next();
      String key = (String) colEntry.getKey();
      if (key.equals(ConversionConstant.REPEATEDNUM_A) || key.equals(ConversionConstant.CELLS))
        continue;
      rowJson.put(key, colEntry.getValue());
    }

    rowsByIndex.put(String.valueOf(rowIndex + 1), rowJson);
  }

  // move and enlarge data.

  public static boolean transformData(JSONObject data, boolean useValue)
  {
    Object o = data.get("extras");

    if (o == null)
      return false;

    JSONObject extras = (JSONObject) o;

    int rowCount = ((Number) extras.get("rowCount")).intValue();
    int colCount = ((Number) extras.get("colCount")).intValue();
    int rowRepeat = ((Number) extras.get("rowRepeat")).intValue();
    int colRepeat = ((Number) extras.get("colRepeat")).intValue();
    int rowDelta = ((Number) extras.get("rowDelta")).intValue();
    int colDelta = ((Number) extras.get("colDelta")).intValue();

    Object columns = data.get(ConversionConstant.COLUMNS);
    Object rows = data.get(ConversionConstant.ROWS);

    Object o2 = data.get(ConversionConstant.FOR_CUT_PASTE);
    boolean isCutPaste = o2 == null ? false : ((Boolean) o2).booleanValue();

    data.remove("extras");

    if (columns != null)
    {
      JSONObject jsonColumns = (JSONObject) columns;
      JSONObject newColumns = null;
      if (colDelta == 0)
        newColumns = jsonColumns;
      else
      {
        newColumns = new JSONObject();
        data.put(ConversionConstant.COLUMNS, newColumns);
      }

      Set<String> set = new HashSet<String>((Set<String>) jsonColumns.keySet());
      for (String colName : set)
      {
        Object column = jsonColumns.get(colName);
        int colIndex = ReferenceParser.translateCol(colName);
        int newColIndex = colIndex;
        if (colDelta != 0)
        {
          newColIndex = colIndex + colDelta;
          newColumns.put(ReferenceParser.translateCol(newColIndex), column);
        }
        for (int i = 1; i < colRepeat; i++)
        {
          int repeatedColIndex = newColIndex + colCount * i;
          String newColName = ReferenceParser.translateCol(repeatedColIndex);
          newColumns.put(newColName, column);
        }
      }
    }
    if (rows != null)
    {
      JSONObject jsonRows = (JSONObject) rows;
      JSONObject newRows = null;
      if (rowDelta == 0)
        newRows = jsonRows;
      else
      {
        newRows = new JSONObject();
        data.put(ConversionConstant.ROWS, newRows);
      }
      Set<String> rowSet = new HashSet<String>((Set<String>) jsonRows.keySet());
      try
      {
        for (String rowIndex : rowSet)
        {
          JSONObject row = (JSONObject) jsonRows.get(rowIndex);
          if (rowDelta != 0)
          {
            if (!isCutPaste)
              row.put(ConversionConstant.OFFSET_A, rowDelta);
            newRows.put(Integer.parseInt(rowIndex) + rowDelta + "", row);
          }
          if (row.containsKey(ConversionConstant.CELLS))
          {
            JSONObject cells = (JSONObject) row.get(ConversionConstant.CELLS);
            JSONObject newCells = null;
            if (colDelta == 0)
              newCells = cells;
            else
            {
              newCells = new JSONObject();
              row.put(ConversionConstant.CELLS, newCells);
            }

            Set<String> set = new HashSet<String>((Set<String>) cells.keySet());
            for (String colName : set)
            {
              JSONObject oldCell = (JSONObject) cells.get(colName);
              String cellString = oldCell.serialize();
              if (cellString != null)
              {
                int colIndex = ReferenceParser.translateCol(colName);
                int newColIndex = colIndex;
                if (colDelta != 0)
                {
                  newColIndex = colIndex + colDelta;
                  if (!isCutPaste)
                    oldCell.put(ConversionConstant.OFFSET_A, colDelta);
                  newCells.put(ReferenceParser.translateCol(newColIndex), oldCell);
                }
                for (int i = 1; i < colRepeat; i++)
                {
                  int repeatedColIndex = newColIndex + colCount * i;
                  String newColName = ReferenceParser.translateCol(repeatedColIndex);
                  JSONObject newCell = JSONObject.parse(cellString);
                  if (!isCutPaste)
                    newCell.put(ConversionConstant.OFFSET_A, colDelta + colCount * i);
                  newCells.put(newColName, newCell);
                }
              }
            }
          }
          String rowString = row.serialize();
          if (rowString != null)
          {
            for (int i = 1; i < rowRepeat; i++)
            {
              int newRowIndex = Integer.parseInt(rowIndex) + rowDelta + rowCount * i;
              JSONObject newRow = JSONObject.parse(rowString);
              if (!isCutPaste)
                newRow.put(ConversionConstant.OFFSET_A, rowDelta + rowCount * i);
              newRows.put(newRowIndex + "", newRow);
            }
          }
        }
      }
      catch (Exception ex)
      {
        LOG.log(Level.WARNING, "error when transformData to enlarge data", ex);
      }
    }

    if (!isCutPaste)
    {

      HashMap<String, byte[]> cachedTokens = new HashMap<String, byte[]>();
      HashMap<String, byte[]> cachedParsedRefs = new HashMap<String, byte[]>();
      rows = data.get(ConversionConstant.ROWS);
      if (rows != null)
      {
        JSONObject jsonRows = (JSONObject) rows;
        Set<String> set = new HashSet<String>((Set<String>) jsonRows.keySet());
        for (String rowIndex : set)
        {
          JSONObject row = (JSONObject) jsonRows.get(rowIndex);
          if (row != null && row.containsKey(ConversionConstant.CELLS))
          {
            JSONObject cells = (JSONObject) row.get(ConversionConstant.CELLS);
            Set<String> set2 = new HashSet<String>((Set<String>) cells.keySet());
            for (String colName : set2)
            {
              JSONObject cellJson = (JSONObject) ((JSONObject) cells.get(colName));
              String valueKey = useValue ? ConversionConstant.VALUE_A : ConversionConstant.VALUE;
              transformFormula(row, cellJson, valueKey, cachedTokens, cachedParsedRefs);
            }
          }
        }
      }

      if (rows != null)
      {
        JSONObject jsonRows = (JSONObject) rows;
        for (String rowIndex : (Set<String>) jsonRows.keySet())
        {
          JSONObject row = (JSONObject) jsonRows.get(rowIndex);
          if (row != null && row.containsKey(ConversionConstant.CELLS))
          {
            JSONObject cells = (JSONObject) row.get(ConversionConstant.CELLS);
            for (String colName : (Set<String>) cells.keySet())
            {
              JSONObject cellJson = (JSONObject) ((JSONObject) cells.get(colName));
              cellJson.remove(ConversionConstant.OFFSET_A);
            }
          }
          row.remove(ConversionConstant.OFFSET_A);
        }
      }
    }

    return true;
  }

  private static void transformFormula(JSONObject rowJson, JSONObject cellJson, String valueKey, HashMap<String, byte[]> cachedTokens,
      HashMap<String, byte[]> cachedParsedRefs)
  {
    Object value = cellJson.get(valueKey);
    JSONArray tokenArr = (JSONArray) cellJson.get(ConversionConstant.TOKENARRAY);

    if (value == null || !MessageUtil.isFormulaString(value.toString()))
      return;

    int rowOffset = 0;
    int colOffset = 0;

    if (rowJson.containsKey(ConversionConstant.OFFSET_A))
      rowOffset = ((Number) rowJson.get(ConversionConstant.OFFSET_A)).intValue();
    if (cellJson.containsKey(ConversionConstant.OFFSET_A))
      colOffset = ((Number) cellJson.get(ConversionConstant.OFFSET_A)).intValue();

    if (rowOffset == 0 && colOffset == 0)
      return;

    String strValue = value.toString();
    ArrayList<FormulaToken> formulaTokenList = null;

    final JSONObject key = new JSONObject();
    key.put(ConversionConstant.VALUE_A, value);
    key.put(ConversionConstant.TOKENARRAY, tokenArr);
    final String keyString = key.toString();
    byte[] _cached = cachedTokens.get(keyString);
    if (_cached != null)
    {
      try
      {
        formulaTokenList = (ArrayList<FormulaToken>) SerializationUtils.deserialize(_cached);
      }
      catch (Exception ex)
      {
      }
    }

    if (formulaTokenList == null)
    {
      if (tokenArr != null)
        formulaTokenList = ConversionUtil.getTokenFromTokenArray(strValue, tokenArr);
      else
        formulaTokenList = ConversionUtil.getTokenFromFormula(strValue);
      try
      {
        cachedTokens.put(keyString, SerializationUtils.serialize(formulaTokenList));
      }
      catch (Exception ex)
      {
      }
    }
    for (int i = 0; i < formulaTokenList.size(); i++)
    {
      FormulaToken token = (FormulaToken) formulaTokenList.get(i);
      ReferenceToken rt = (ReferenceToken) token;
      String text = token.getText();
      ParsedRef ref = rt.getParsedRef();
      if (ref == null)
      {
        _cached = cachedParsedRefs.get(text);
        if (_cached != null)
        {
          try
          {
            ref = (ParsedRef) SerializationUtils.deserialize(_cached);
          }
          catch (Exception ex)
          {
          }
        }
      }
      if (ref == null)
      {
        ref = ReferenceParser.parse(text);
        if (ref != null)
        {
          try
          {
            cachedParsedRefs.put(text, SerializationUtils.serialize(ref));
          }
          catch (Exception ex)
          {
          }
        }
      }

      if (ref != null)
      {
        boolean bChange = false;
        if (rowOffset != 0)
        {
          bChange |= ModelHelper.addIndentForReference(ref, rowOffset, true);
        }
        if (colOffset != 0)
        {
          bChange |= ModelHelper.addIndentForReference(ref, colOffset, false);
        }
        if (bChange)
        {
          rt.setChangeText(ref.toString());
          rt.setRefMask(ref.patternMask);// the mask might be swapped by addIndentForReference
        }
      }
    }
    String newValue = ConversionUtil.updateFormula((String) value, formulaTokenList, tokenArr);
    cellJson.put(valueKey, newValue);
  }
}