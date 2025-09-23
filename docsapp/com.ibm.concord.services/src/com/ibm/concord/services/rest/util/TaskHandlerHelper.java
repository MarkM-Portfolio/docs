/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.util;

import java.util.Set;

import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.json.java.JSONObject;

/**
 * Task handlers return the json object to client in order to deal with error/exception user cases.
 * 
 */
public class TaskHandlerHelper
{
  public static JSONObject getErrorJSONObjec(int errorCode)
  {
    JSONObject json = new JSONObject();
    json.put("status", "error");
    json.put("error_code", errorCode);
    return json;
  }

  /**
   * Get to know whether the document has 'Edit' access right or not
   */
  public static boolean hasEditAccessRight(IDocumentEntry parentDoc)
  {
    if (parentDoc == null)
      return false;
    Set<Permission> permissions = parentDoc.getPermission();
    if (Permission.EDIT.hasPermission(permissions))
    {
      return true;
    }
    return false;
  }
}
