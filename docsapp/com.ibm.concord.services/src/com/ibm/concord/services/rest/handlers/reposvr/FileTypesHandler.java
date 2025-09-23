/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.reposvr;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.services.rest.GetHandler;
import com.ibm.docs.common.util.FormatUtil;
import com.ibm.json.java.JSONObject;

public class FileTypesHandler implements GetHandler
{

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    JSONObject object = new JSONObject();
    object.putAll(FormatUtil.MS_FORMATS);
    object.putAll(FormatUtil.ODF_FORMATS);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    object.serialize(response.getOutputStream());
  }
}
