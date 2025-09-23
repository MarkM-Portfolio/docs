/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.filters;

import java.io.IOException;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.services.rest.util.HandlerEntry;
import com.ibm.concord.services.rest.util.HandlerFactory;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.entitlement.gatekeeper.IGateKeeperService;
import com.ibm.json.java.JSONObject;

import java.util.regex.Matcher;

public class EntitlementFilter implements Filter
{
  private static final Logger LOG = Logger.getLogger(EntitlementFilter.class.getName());

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    HttpServletRequest httpRequest = (HttpServletRequest) request;
    UserBean user = (UserBean) httpRequest.getAttribute("request.user");
    if (user != null)
    {
      HandlerEntry entry = HandlerFactory.getHandlerEntry(httpRequest);
      if (entry != null && entry.isGateKeeper())
      {
        String gatekeeper = user.getGateKeeper();
        if (gatekeeper != null && !"".equals(gatekeeper))
        {
          try
          {
            JSONObject fJson = JSONObject.parse(gatekeeper);
            if (fJson != null)
            {
              boolean matched = isUrlMatched(fJson, entry);
              if (!matched)
              {
                HttpServletResponse httpResponse = (HttpServletResponse) response;
                LOG.log(Level.WARNING, "Request is forbidden because it's no entitlement request.");
                httpResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
              }
            }
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "Failed to parse JSON string " + gatekeeper, e);
          }
        }
      }
    }
    chain.doFilter(request, response);

  }

  private boolean isUrlMatched(JSONObject fJson, HandlerEntry entry)
  {
    @SuppressWarnings("unchecked")
    Iterator<String> itu = fJson.keySet().iterator();
    while (itu.hasNext())
    {
      String key = itu.next();
      Object obj = fJson.get(key);
      if (obj instanceof JSONObject)
      {
        JSONObject jsonObj = (JSONObject) obj;
        String featureUrl = (String) jsonObj.get(IGateKeeperService.FEATURE_URL);
        String[] fUrls = featureUrl.split(";");
        for (int i = 0; i < fUrls.length; i++)
        {
          Matcher match = entry.match(doProcess(fUrls[i]));
          if (match != null)
          {
            return true;
          }
        }
      }
    }
    return false;
  }

  private String doProcess(String path)
  {
    if (path.endsWith("/"))
    {
      // Ensure that we don't have any trailing "/"'s at the end of the path
      // string
      while (path.endsWith("/") && path.length() > 1)
      {
        path = path.substring(0, path.length() - 1);
      }
    }
    if (path.startsWith("/api/") || path.startsWith("/app/"))
    {
      path = path.substring(4);
    }
    else if (path.startsWith("api/") || path.startsWith("app/"))
    {
      path = path.substring(3);
    }
    return path;
  }

  public void init(FilterConfig filterConfig) throws ServletException
  {
    HandlerFactory.loadHandlerEntries();
  }

  public void destroy()
  {

  }
}
