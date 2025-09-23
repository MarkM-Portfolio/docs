/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.rest;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author linfeng_li
 * 
 */
public class DomainHandler implements GetHandler
{

  /* (non-Javadoc)
   * @see com.ibm.concord.viewer.services.rest.GetHandler#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    JSONObject retValue = new JSONObject();
    retValue = getDomainList();
    response.setContentType("application/json");
    response.setHeader("Cache-Control", "no-cache");
    retValue.serialize(response.getOutputStream());
  }

  /**
   * getDomainList
   * 
   * @return
   */
  public static JSONObject getDomainList()
  {
    JSONObject jsonObject = new JSONObject();
    JSONArray domainList = Platform.getViewerConfig().getConfigList(ConfigConstants.DOMAIN_LIST_KEY);
    jsonObject.put("domain_list", domainList);
    return jsonObject;
  }

}
