/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax;

import java.util.Map;

import com.ibm.json.java.JSONObject;

public class ContextInfo
{
  public int tableId;
  public int columnIndex;
  public int rowIndex;
  public boolean bRowHasDefaultCellStyle;
  public int cellColumnIndex;
  public CoverInfo coverInfo;
  public boolean hasStyledColumn;
  private boolean outOfCapacity;
  public int nameRangeIndex; 
  
  public int maxColInRowWithValue = -1;
  public int maxColInRowWithStyle = -1;
  
  //limitation
  public long cellCnt;
  public long formulaCnt;
  
  //parameters
  private boolean bIgnoreLarge = false;
  
  public ContextInfo(Map parameters)
  {
    coverInfo = new CoverInfo();
    if(parameters != null)
    {
      if(parameters.containsKey("ignoreLarge"))
      {
        bIgnoreLarge = Boolean.parseBoolean((String)parameters.get("ignoreLarge"));
      }
      
    }
  }
  
  public void setOutOfCapacity(boolean bOut)
  {
    outOfCapacity = bOut;
  }
  
  public boolean getOutOfCapacity()
  {
    return (outOfCapacity && !bIgnoreLarge);
  }
}
