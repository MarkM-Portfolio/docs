/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload.legacy;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

//TODO: move the static method to ReferenceAddressHelper
public class FormulaReference
{
  private static final Logger LOG = Logger.getLogger(FormulaReference.class.getName());
  
  public JSONObject mReferences;
  
  public FormulaReference(JSONObject referenceJSON){
    if(referenceJSON != null)
      mReferences = referenceJSON;
    else
      mReferences = new JSONObject();
    //TODO: set mNameRanges with the document names
    //might add name range to reference.js
  }
  
  public JSONArray getReferenceJSONArray(String sheetId, String rowId, String columnId)
  {
    if(mReferences.containsKey(ConversionConstant.SHEETS)){
      JSONObject sheetsJSON = (JSONObject)mReferences.get(ConversionConstant.SHEETS);
      if(sheetsJSON.containsKey(sheetId)){
        JSONObject sheetJSON = (JSONObject)sheetsJSON.get(sheetId);
        if(sheetJSON.containsKey(rowId)){
          JSONObject rowJSON = (JSONObject)sheetJSON.get(rowId);
          if(rowJSON.containsKey(columnId)){
            JSONObject cellsJSON = (JSONObject)rowJSON.get(columnId);
            if(cellsJSON.containsKey(ConversionConstant.FORMULACELL_REFERNCE_NAME)){
              JSONArray returnArray = (JSONArray)cellsJSON.get(ConversionConstant.FORMULACELL_REFERNCE_NAME);
              return returnArray;
            }
          }
        }
      }
    }
    return null;
  }

  //if cell at sheetId, rowId, columnId does not exist, 
  //then create the empty reference list for this cell in the reference model
  public JSONArray getOrCreateReferenceJSONArray(String sheetId, String rowId, String columnId){
    JSONObject sheetsJSON = null;
    if(!mReferences.containsKey(ConversionConstant.SHEETS)){
      sheetsJSON = new JSONObject();
      mReferences.put(ConversionConstant.SHEETS, sheetsJSON);
    }else{
      sheetsJSON = (JSONObject)mReferences.get(ConversionConstant.SHEETS);
    }
    JSONObject sheetJSON = null;
    if(!sheetsJSON.containsKey(sheetId)){
      sheetJSON = new JSONObject();
      sheetsJSON.put(sheetId, sheetJSON);
    }else{
      sheetJSON = (JSONObject)sheetsJSON.get(sheetId);
    }
    JSONObject rowJSON = null;
    if(!sheetJSON.containsKey(rowId)){
      rowJSON = new JSONObject();
      sheetJSON.put(rowId, rowJSON);
    }else{
      rowJSON = (JSONObject)sheetJSON.get(rowId);
    }
    JSONObject cellJSON = null;
    if(!rowJSON.containsKey(columnId)){
      cellJSON = new JSONObject();
      rowJSON.put(columnId, cellJSON);
    }else{
      cellJSON = (JSONObject)rowJSON.get(columnId);
    }
    JSONArray returnArray = null;
    if(!cellJSON.containsKey(ConversionConstant.FORMULACELL_REFERNCE_NAME)){
      returnArray = new JSONArray();
      cellJSON.put(ConversionConstant.FORMULACELL_REFERNCE_NAME, returnArray);
    }else{
      returnArray = (JSONArray)cellJSON.get(ConversionConstant.FORMULACELL_REFERNCE_NAME);
    }
    return returnArray;
  }
  
  
  /**
   * Update the formula representation of the cell at (rowId, columnId)
   * This method is used by flashing to draft document when
   * rename/delete sheet, add/delete row/column messages have been applied to draft document.
   * Need to convert the JSON format to the formula which represented by cell/range address
   * @param rowId   the row id of the cell
   * @param columnId    the column id of the cell
   * @return the updated formula representation of the cell
   */
  public String updateFormula(String sheetId, String rowId, String columnId,
      String formula, RowColIdIndexMeta rowColIdIndexMeta, SheetMeta sheetMeta){
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.entering(FormulaReference.class.getName(), "updateFormula", new Object[] { sheetId, rowId, columnId, formula, rowColIdIndexMeta,
          sheetMeta });
    }
    int copyStartIndex = 0;
    int length = formula.length();
    StringBuffer updatedFormula = new StringBuffer();
    JSONArray refJSONArray = getReferenceJSONArray(sheetId, rowId, columnId);
    if(refJSONArray != null){
      //sort formula token array by token index
      Object[] sortRefArray = ReferenceUtil.sort(refJSONArray.toArray(), 
          ConversionConstant.FORMULA_TOKEN_INDEX, true);

      for(int i = 0; i < sortRefArray.length; i++)
      {
        try
        {
          JSONObject tokenJSON = (JSONObject)sortRefArray[i];
          
          //copy part of the formula which does not related with the tokens
          int tokenIndex = Integer.parseInt(tokenJSON.get(ConversionConstant.FORMULA_TOKEN_INDEX).toString());
          String tokenType = tokenJSON.get(ConversionConstant.REFERENCE_TYPE).toString();
          // process the virtual reference which is used by partial load getting the all related cell's value referred in the range
          // but it's not used to update the formula
          if(tokenIndex < 0)
            continue;
          
          updatedFormula.append(formula.substring(copyStartIndex, tokenIndex));
          
          //get cell address by cell id
          String tokenAddress = "";
          String updatedTokenAddress = "";
          //TODO: get absolute or relative cell address by the text of token
          if((tokenType.equals(ConversionConstant.CELL_REFERENCE)) || (tokenType.equals(ConversionConstant.RANGE_REFERENCE))){
            tokenAddress = (String)tokenJSON.get(ConversionConstant.RANGE_ADDRESS);
            updatedTokenAddress = ReferenceUtil.updateRangeAddressWhenFlush2Doc(tokenJSON,rowColIdIndexMeta, sheetMeta);
          }
          else if(tokenType.equals(ConversionConstant.NAMES_REFERENCE)){
            tokenAddress = (String)tokenJSON.get(ConversionConstant.NAME_RANGE);
            updatedTokenAddress = tokenAddress;
          }
          //copy the updated tokens to the updatedFormula
          copyStartIndex = tokenIndex + tokenAddress.length();
          String oldToken = tokenAddress;
          if(copyStartIndex >= length)
            oldToken = formula.substring(tokenIndex);
          else
            oldToken = formula.substring(tokenIndex, copyStartIndex);
          if(oldToken.equals(tokenAddress))
          {
            int updateTokenIndex = updatedFormula.length();
            updatedFormula.append(updatedTokenAddress);
            //also update the reference model with new token address and token index
            tokenJSON.put(ConversionConstant.RANGE_ADDRESS, updatedTokenAddress);
            tokenJSON.put(ConversionConstant.FORMULA_TOKEN_INDEX, updateTokenIndex);
          }
          else
          {
            if (LOG.isLoggable(Level.WARNING))
            {
              LOG.log(Level.WARNING, "=============the cell at < sheetId :" + sheetId + " rowId : " + rowId +
                  " columnId : " + columnId + " > has the formula + " + formula + 
                  " which does not contain the cell address " + tokenAddress);
            }
          }
        }
        catch(Exception e){
          LOG.log(Level.WARNING, "error occurred when update the formula by the token", e);
        }
      }
    }
    //copy the end part of the original formula to the updatedFormula
    if(copyStartIndex < formula.length())
      updatedFormula.append(formula.substring(copyStartIndex));
    
    String formulaString = updatedFormula.toString();
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.exiting(FormulaReference.class.getName(), "updateFormula", formulaString);
    }
    return formulaString;
  }

}
