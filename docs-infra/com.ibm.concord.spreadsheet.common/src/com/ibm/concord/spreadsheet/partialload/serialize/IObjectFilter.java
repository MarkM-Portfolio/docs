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

import com.ibm.json.java.JSONObject;

/**
 * Filter to get called when serialize a JSON object.
 */
public interface IObjectFilter
{
  /**
   * Get called when jsonObject is going to be serialized.
   * 
   * @param fieldName
   *          JSON field name for current JSONObject. Is null when: 1) is in JSON root, 2) is nested in a JSON array.
   * 
   * @param jsonObject
   * @return
   */
  public JSONObject doFilter(String fieldName, JSONObject jsonObject);
}
