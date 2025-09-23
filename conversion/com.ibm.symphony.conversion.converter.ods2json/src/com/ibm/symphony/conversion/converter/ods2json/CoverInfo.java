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

import java.util.ArrayList;
import java.util.HashMap;

public class CoverInfo
{
  public HashMap<Integer,ArrayList<ColumnRange>> coverInfo;
  
  public CoverInfo()
  {
      coverInfo = new HashMap<Integer,ArrayList<ColumnRange>>();
  }
  
  public void addCoverInfo(int rowIndex, int startColIndex, int endColIndex)
  {
      ColumnRange range = new ColumnRange(startColIndex,endColIndex);
      ArrayList<ColumnRange> list = this.coverInfo.get(rowIndex);
      if(list == null)
      {
          list = new ArrayList<ColumnRange>();
          this.coverInfo.put(rowIndex, list);
      }
      //the range in the list must be ordered
      list.add(range);
  }
  
//  public boolean isCoveredCell(int rowIndex, int colIndex)
//  {
//      ArrayList<ColumnRange> list = this.coverInfo.get(rowIndex);
//      if(list == null) return false;
//      for(int index = 0; index < list.size();index++)
//      {
//          ColumnRange range = list.get(index);
//          if(range.isInRange(colIndex)) return true;
//      }
//      return false;
//  }
  
  //startColIndex~endColIndex might cover several ColumnRange
  //if startColIndex==endColIndex==range.startCol, then it should not be in covered range
  //it is the cell with the col span > 1
  public ArrayList<ColumnRange> getCoveredColumnRange(int rowIndex, int startColIndex, int endColIndex)
  {
    ArrayList<ColumnRange> coveredRanges = new ArrayList<ColumnRange>();
    ArrayList<ColumnRange> list = this.coverInfo.get(rowIndex);
    if (list == null)
      return coveredRanges;
    // int colIndex = startColIndex;
    int size = list.size();
    for (int i = 0; i < size; i++)
    {
      ColumnRange range = list.get(i);
      if (range.endCol < startColIndex)
        continue;
      if (range.startCol < endColIndex)
        coveredRanges.add(range);
      else
        break;
    }
    return coveredRanges;
  }
}
