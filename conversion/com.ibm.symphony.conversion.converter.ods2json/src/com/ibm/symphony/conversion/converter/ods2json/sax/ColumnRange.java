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

public class ColumnRange
{
  public int startCol;
  public int endCol;
  
  public ColumnRange(int startCol, int endCol)
  {
      this.startCol = startCol;
      this.endCol = endCol;
  }
  
  public boolean isInRange(int index)
  {
      if(index >= this.startCol && index <= this.endCol) return true;
      else return false;
  }
}
