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

import java.util.Comparator;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;

public class PreserveNameIndex implements Comparable
{
  public String elementId;
  public String attrId;
  public String attrName;
  public RangeType type;
  
  public String startRowId;
  public String endRowId;
  
  public String startColId;
  public String endColId;
  public String address;
  
  public JSONObject data;
  
  public PreserveNameIndex(String eId,String aId,RangeType type)
  {
    elementId = eId;
    attrId = aId;
    this.type = type;
  }
  
  public int  compareTo(Object obj) {
	if(!(obj instanceof PreserveNameIndex))
	  return 0;
	PreserveNameIndex pNameIndex = (PreserveNameIndex)obj;
    return this.elementId.compareTo(pNameIndex.elementId);
  }
}

class PreserveNameComparator implements Comparator
{
	//@Override
  public int compare(Object o1, Object o2) {
	// TODO Auto-generated method stub
	int result = 0;
	PreserveNameIndex pNameIndex1 = (PreserveNameIndex)o1;
	PreserveNameIndex pNameIndex2 = (PreserveNameIndex)o2;
	if(pNameIndex1.elementId != null && pNameIndex2.elementId != null )
	  result = pNameIndex1.compareTo(pNameIndex2);
	return result;
  }
}
