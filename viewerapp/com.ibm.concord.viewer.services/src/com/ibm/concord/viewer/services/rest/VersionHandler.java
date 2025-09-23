package com.ibm.concord.viewer.services.rest;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.services.rest.GetHandler;
import com.ibm.json.java.JSONObject;

public class VersionHandler implements GetHandler
{
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
     String productName = ViewerUtil.getProductName();
     String description = ViewerUtil.getDescription();
     String version = ViewerUtil.getBuildVersion();
     String timestamp = ViewerUtil.getBuildNumber();
     Long ifixVersion = ViewerUtil.getIfixVersion();
     String patchBaseBuild = ViewerUtil.getPatchBaseBuild();

     response.setHeader("Cache-Control", "no-cache");
     JSONObject retValue = new JSONObject();
     retValue.put("product_name", productName);
     retValue.put("build_description", description);
     retValue.put("version", version);
     retValue.put("build_timestamp", timestamp);
     if (ifixVersion != -1) retValue.put("ifix_version", ifixVersion);
     if (patchBaseBuild != "") retValue.put("patch_base_build", patchBaseBuild);
     response.setContentType("application/json");
     retValue.serialize(response.getOutputStream());
  }
}
