/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.proxy.filter;

import java.net.URLEncoder;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.proxy.mbean.StaticClusterMgr;
import com.ibm.concord.proxy.mbean.StaticClusterMgr.MonitorTargetInfo;
import com.ibm.concord.proxy.mbean.StaticClusterMgr.RequestSchemes;
import com.ibm.concord.proxy.util.AESUtil;
import com.ibm.concord.proxy.util.ConcordRequestParser;
import com.ibm.ws.proxy.filter.FilterUtilsFactory;
import com.ibm.ws.proxy.filter.http.HttpProxyServerFilter;
import com.ibm.wsspi.cluster.Identity;
import com.ibm.wsspi.cluster.adapter.IdentityMapping;
import com.ibm.wsspi.http.channel.HttpRequestMessage;
import com.ibm.wsspi.http.channel.HttpResponseMessage;
import com.ibm.wsspi.http.channel.values.HttpHeaderKeys;
import com.ibm.wsspi.http.channel.values.StatusCodes;
import com.ibm.wsspi.proxy.filter.FilterWrapper;
import com.ibm.wsspi.proxy.filter.http.HttpFilterStatusCode;
import com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext;
import com.ibm.wsspi.proxy.resource.policy.http.HttpResourcePolicy;

/**
 *
 */
public class ConcordResponseRoutingFilter extends HttpProxyServerFilter
{
  private static Logger logger = Logger.getLogger(ConcordResponseRoutingFilter.class.getName());

  private static final String DOCS_AFFINITY_COOKIE = "DOCS_AFFINITY_COOKIE";
  
  private static final String DOCS_JSESSIONID_NAME = "jsessionid";
  
  private static final String DEFAULT_JSESSIONID_COOKIE_NAME = "JSESSIONID";
  
  private boolean hasSetAffinityCookieName = false;
  
  private static final String[] cookieNames = new String[]{"x-Q-App-Context", "flushedId"};
  
  private String jsessionIdCookieName = DEFAULT_JSESSIONID_COOKIE_NAME;

  /**
   * Set the session affinity cookie name.
   * 
   * @param serviceContext
   */
  private synchronized void setAffinityCookieName(HttpProxyServiceContext serviceContext)
  {
    try
    {
      if (!hasSetAffinityCookieName)
      {
        HttpResourcePolicy policy = serviceContext.getResourcePolicy();
        if (policy != null)
        {
          Map<String, String> appCookieNames = Collections.synchronizedMap(new HashMap<String, String>());
          Map<String, String> moduleCookieNames = Collections.synchronizedMap(new HashMap<String, String>());
          Identity clusterIdentity = IdentityMapping.getClusterIdentityFromClusterName(policy.getCellName(), policy.getClusterName());
          FilterUtilsFactory.getFilterUtils().addNonDefaultCookieNameData(clusterIdentity, DOCS_AFFINITY_COOKIE, appCookieNames,
              moduleCookieNames);
        }
        hasSetAffinityCookieName = true;
        initJSessionIdName();
      }
    }
    catch (Throwable ex)
    {
      logger.log(Level.WARNING, "Exception happens while setting the session affinity cookie name", ex);
    }
  }
  
  private void initJSessionIdName()
  {
    String name = System.getProperty(DOCS_JSESSIONID_NAME);
    if(name != null && !name.equals(""))
    {
      jsessionIdCookieName = name;
    }
    logger.info("The customized jsessionid cookie name is " + jsessionIdCookieName);
  }

  /**
   * Set the session affinity cookie value to avoid the load balance issue of proxy server.
   * 
   * @param serviceContext
   */
  private void setAffinityCookieValue(HttpProxyServiceContext serviceContext)
  {
    if (!hasSetAffinityCookieName)
    {
      setAffinityCookieName(serviceContext);
    }

    HttpResponseMessage response = serviceContext.getResponse();
    if (response.getCookie(jsessionIdCookieName) != null && response.getCookie(DOCS_AFFINITY_COOKIE) == null)
    {
      Cookie cookie = new Cookie(DOCS_AFFINITY_COOKIE, UUID.randomUUID().toString());
      cookie.setPath("/docs/");
      cookie.setMaxAge(-1);
      cookie.setHttpOnly(true);
      response.setCookie(cookie, HttpHeaderKeys.HDR_SET_COOKIE);

      logger.log(Level.FINER, "Set HCL Docs session affinity cookie value");
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.wsspi.proxy.filter.http.HttpDefaultFilter#init(com.ibm.wsspi.proxy.filter.FilterWrapper)
   */
  public void init(FilterWrapper filterWrapper) throws Exception
  {
    logger.entering(ConcordResponseRoutingFilter.class.getName(), "init()");

    super.init(filterWrapper);

    logger.exiting(ConcordResponseRoutingFilter.class.getName(), "init()");
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.wsspi.proxy.filter.http.HttpDefaultFilter#doFilter(com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext)
   */
  public StatusCodes doFilter(HttpProxyServiceContext serviceContext) throws Exception
  {
    logger.entering(ConcordResponseRoutingFilter.class.getName(), "doFilter()");

    StatusCodes statusCodes = HttpFilterStatusCode.STATUS_FILTER_SUCCESS;

    String fullNameInCookie = null;
    HttpResponseMessage response = serviceContext.getResponse();
    HttpRequestMessage request = serviceContext.getRequest();
    Integer docsFlag = response != null ? response.getHeaderAsInteger("IBMDocsApp") : null;
    int status = response != null ? response.getStatusCodeAsInt() : 0;
    if (serviceContext != null && serviceContext.containsAttribute("routeByCookie"))
    {
      // The status code is 500, 503, 504 or 404, presents the server being routed to is not available.
      if (docsFlag == null && (status == 500 || status == 503 || status == 504 || status == 404))
      {
        String docId = ConcordRequestParser.getDocumentIdFromRequest(request);
        String servers[] = ConcordRequestParser.getSrvNamesInCookie(request, docId);
        if (servers != null && servers[0] != null)
        {
          fullNameInCookie = servers[0];
          // New cookie value is: "" + ";" + old server.
          String encodedKey = URLEncoder.encode(docId, "UTF-8");
          String encodedName = AESUtil.aesEncryptToString((";" + servers[0]));
          if (encodedName.contains("\r"))
          {
            // Does not allow to contain the character'\r\n' in cookie value.
            encodedName = encodedName.replace("\r", "");
          }
          if (encodedName.contains("\n"))
          {
            // Does not allow to contain the character'\r\n' in cookie value.
            encodedName = encodedName.replace("\n", "");
          }
          Cookie cookie = new Cookie(encodedKey, encodedName);
          cookie.setPath("/docs/");
          cookie.setMaxAge(-1);
          boolean isSecure = ConcordRequestParser.isSecureSrvNamesCookie(request, docId);
          cookie.setSecure(isSecure);
          cookie.setHttpOnly(true);
          response.setCookie(cookie, HttpHeaderKeys.HDR_SET_COOKIE);

          logger.log(Level.FINE, "Change the cookie about serving server info for document " + docId + ", the old serving server is "
              + servers[0]);
        }

        // Return the new status code 302 to redirect the request.
        String requestURI = request.getRequestURI();
        if (requestURI != null && "GET".equals(request.getMethod()) && ConcordRequestParser.matchAppURI(requestURI))
        {
          String queryStr = request.getQueryString();
          requestURI = queryStr != null && !queryStr.equals("") ? (requestURI + "?" + queryStr) : requestURI;
          response.setHeader("Location", requestURI);
          response.setStatusCode(HttpServletResponse.SC_FOUND);

          logger.log(Level.FINE, "Redirect the request " + requestURI);
        }

        logger.log(Level.WARNING, "Can't route request " + requestURI + " to server " + servers[0] + ", status code is " + status + ".");
      }
    }

    if (serviceContext != null && serviceContext.containsAttribute("docsRequest"))
    {
      setAffinityCookieValue(serviceContext);

      // If the return status code is 500, 503, or 504, should re-check the status of the servers.
      if (docsFlag == null && (status == 500 || status == 503 || status == 504))
      {
        logger
            .log(Level.WARNING, "The response status code is {0}, need check the status of application servers being routed to.", status);

        // if that server is available, do not need check server status by health monitor
        boolean bServerAvailable = StaticClusterMgr.isEnableStaticRouting() && StaticClusterMgr.isServerAvailable(fullNameInCookie);
        if (!bServerAvailable)
        {
          HttpResourcePolicy policy = serviceContext.getResourcePolicy();
          RequestSchemes scheme = policy.isOutboundTransportSecure() ? RequestSchemes.HTTPS : RequestSchemes.HTTP;
          MonitorTargetInfo targetInfo = new MonitorTargetInfo(policy.getCellName(), policy.getClusterName(), scheme);
          StaticClusterMgr.invokeCheckSrvsStatusJob(targetInfo);
        }
      }
    }
    changeCookieAttr(serviceContext);
    logger.exiting(ConcordResponseRoutingFilter.class.getName(), "doFilter()");

    return statusCodes;
  }
  
  private void changeCookieAttr(HttpProxyServiceContext serviceContext)
  {
    for(String cookieName : cookieNames)
    {
      Cookie cookie = serviceContext.getResponse().getCookie(cookieName);
      if(cookie != null)
      {
        Cookie newCookie = new Cookie(cookieName, cookie.getValue());
        newCookie.setPath("/");
        newCookie.setMaxAge(-1);
        newCookie.setSecure(true);
        newCookie.setHttpOnly(true);
        serviceContext.getResponse().setCookie(newCookie, HttpHeaderKeys.HDR_SET_COOKIE);
      } 
    }
  }
}
