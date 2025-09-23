/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.index;

public class Pair
{
  static class OffSetPair{
    int offset;
    int length;
    public OffSetPair(int offset, int length)
    {
      this.offset = offset;
      this.length = length;
    }
  }
  static class NameIDPair
  {
    String name;
    String id;
    public NameIDPair(String name, String id)
    {
      this.name = name;
      this.id = id;
    }
  }
  
  public static class ColumnIDPair
  {
    String cellStyleId ;
    String id ;
    public ColumnIDPair(String id, String cellStyleId)
    {
      this.cellStyleId = cellStyleId;
      this.id = id;
    }
    
    public boolean equals(Object o)
    {
      if(o instanceof ColumnIDPair)
      {
        ColumnIDPair obj = (ColumnIDPair)o;
        return obj.id.equals(this.id) 
        && obj.cellStyleId.equals(this.cellStyleId) ;
      }
      return false;
    }
    
    public int hashCode()
    {
      return this.id.hashCode() + this.cellStyleId.hashCode();
    }
  }
  
}
