package com.ibm.concord.services.rest.handlers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.json.java.JSONObject;

public class VersionHandler implements GetHandler
{
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    String productName = ConcordUtil.getProductName();
    String description = ConcordUtil.getBuildDescription();
    String version = ConcordUtil.getVersion();
    String timestamp = ConcordUtil.getBuildNumber();
    Long ifixVersion = ConcordUtil.getIfixVersion();
    String patchBaseBuild = ConcordUtil.getPatchBaseBuild();

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
