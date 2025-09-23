/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.config.ConfigConstants;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * @author linfeng_li
 * 
 */
public class DomainHandler implements GetHandler
{

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.services.rest.GetHandler#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    JSONObject retValue = new JSONObject();
    retValue = getDomainList();
    response.setContentType("application/json");
    retValue.serialize(response.getOutputStream());
  }

  public static JSONObject getDomainList()
  {
    JSONObject jsonObject = new JSONObject();
    JSONArray domainList = Platform.getConcordConfig().getConfigList(ConfigConstants.DOMAIN_LIST_KEY);
    jsonObject.put("domain_list", domainList);
    return jsonObject;
  }

}
