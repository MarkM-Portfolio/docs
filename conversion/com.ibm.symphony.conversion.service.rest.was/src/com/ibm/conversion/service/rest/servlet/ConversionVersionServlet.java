/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2014, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.conversion.service.rest.servlet.util.ServletUtil;
import com.ibm.json.java.JSONObject;

public class ConversionVersionServlet extends HttpServlet
{

  private static final long serialVersionUID = -4636322133934473938L;

  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
  {
    String productName = ServletUtil.getProductName();
    String description = ServletUtil.getBuildDescription();
    String version = ServletUtil.getVersion();
    String timestamp = ServletUtil.getBuildNumber();
    Long ifixVersion = ServletUtil.getIfixVersion();
    String patchBaseBuild = ServletUtil.getPatchBaseBuild();

    resp.setHeader("Cache-Control", "no-cache");
    JSONObject retValue = new JSONObject();
    retValue.put("product_name", productName);
    retValue.put("build_description", description);
    retValue.put("version", version);
    retValue.put("build_timestamp", timestamp);
    if (ifixVersion != -1) retValue.put("ifix_version", ifixVersion);
    if (patchBaseBuild != "") retValue.put("patch_base_build", patchBaseBuild);
    resp.setContentType("application/json");
    retValue.serialize(resp.getOutputStream());
  }
}
