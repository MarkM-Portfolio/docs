package com.ibm.concord.services.rest.util;

import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.config.ConcordConfig;
import com.ibm.json.java.JSONObject;

public class HttpXFrameOptionsUtil
{
  private static final String DENY = "DENY";
  
  private static final String SAMEORIGINAL = "SAMEORIGIN";
  
  private static final String ALLOWFROM = "ALLOW-FROM";
  
  private static JSONObject xFrameConfig = ConcordConfig.getInstance().getSubConfig("x-frame-options");
  
  private static String xFrameOption;
  
  private static String xFrameAllowUri;
  
  static
  { 
    if(xFrameConfig != null)
    {
      xFrameOption = (String)xFrameConfig.get("allow_option"); // such as: "DENY", "SAMEORIGIN", "ALLOW-FROM"     
      xFrameAllowUri = (String)xFrameConfig.get("allow_uri");  // such as: "https://app.box.com"
    }
  }
  
  public static void appendXFrameOptionsHeader(HttpServletResponse response)
  {
    if(ALLOWFROM.equalsIgnoreCase(xFrameOption) && xFrameAllowUri != null)
    {
      response.addHeader("X-Frame-Options", ALLOWFROM + " " + xFrameAllowUri);
    }
    else if(DENY.equalsIgnoreCase(xFrameOption))
    {
      response.addHeader("X-Frame-Options", DENY);      
    }
    else
    {
      response.addHeader("X-Frame-Options", SAMEORIGINAL);
    }
  }

}
