/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json;

public class ContextInfo
{
  public int tableId;
  public int columnIndex;
  public int rowNum;
  public int rowIndex;
  public boolean bRowHasDefaultCellStyle;
  public int cellColumnIndex;
  public CoverInfo coverInfo;
  public boolean hasStyledColumn;
  public boolean outOfCapacity;
  public int nameRangeIndex; 
  
  public int maxColInRowWithValue = -1;
  public int maxColInRowWithStyle = -1;
  
  public ContextInfo()
  {
    coverInfo = new CoverInfo();
  }
}
