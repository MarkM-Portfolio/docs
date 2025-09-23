/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload.serialize;

import com.ibm.json.java.JSONArray;

/**
 * Filter to get called when serialize a JSON array.
 */
public interface IArrayFilter
{
  /**
   * Get called when jsonArray is going to be serialized.
   * 
   * @param fieldName
   *          JSON field name for current JSONArray. Is null when: 1) is in JSON root, 2) is nested in a JSON array.
   * 
   * @param jsonArray
   * @return
   */
  public JSONArray doFilter(String fieldName, JSONArray jsonArray);
}
