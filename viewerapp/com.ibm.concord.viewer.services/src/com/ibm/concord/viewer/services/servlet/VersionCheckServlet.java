package com.ibm.concord.viewer.services.servlet;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.json.java.JSONObject;

public class VersionCheckServlet extends HttpServlet
{
  private static final long serialVersionUID = 5257311734717730008L;

  private Logger log = Logger.getLogger(VersionCheckServlet.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response)
  {

    try
    {
      String version = ViewerUtil.getBuildVersion();
      String timestamp = ViewerUtil.getBuildNumber();
      String productName = ViewerUtil.getProductName();
      String description = ViewerUtil.getDescription();
      Long ifixVersion = ViewerUtil.getIfixVersion();
      String patchBaseBuild = ViewerUtil.getPatchBaseBuild();

      response.setHeader("Cache-Control", "no-cache");
      JSONObject retValue = new JSONObject();
      retValue.put("build_description", description);
      retValue.put("product_name", productName);
      retValue.put("version", version);
      retValue.put("build_timestamp", timestamp);
      if (ifixVersion != -1) retValue.put("ifix_version", ifixVersion);
      if (patchBaseBuild != "") retValue.put("patch_base_build", patchBaseBuild);
      response.setContentType("application/json");
      retValue.serialize(response.getOutputStream());
    }
    catch (IOException e)
    {
      log.log(Level.WARNING, "Failed to get viewer version. ", e);
    }
  }
}
