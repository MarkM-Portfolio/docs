package com.ibm.concord.viewer.services.rest;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.platform.Platform;
import com.ibm.json.java.JSONObject;

public class EntitlementHandler implements GetHandler
{

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    JSONObject rest = new JSONObject();
    try
    {
      boolean entitled = Platform.getEntitlementSrv().isEntitledUser(request);
      if (entitled)
      {
        rest.put("entitled", "true");
      }
      else
      {
        rest.put("entitled", "false");
      }
    }
    catch (Exception e)
    {
      rest.put("entitled", "false");
      rest.put("error", e.getMessage());
    }
    finally
    {
      rest.serialize(response.getOutputStream());
    }
  }

}
