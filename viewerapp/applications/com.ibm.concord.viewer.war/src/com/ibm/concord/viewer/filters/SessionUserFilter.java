/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.filters;

import java.io.IOException;
import java.util.Enumeration;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.auth.AuthenticationComponentImpl;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.docs.common.util.HttpMultiDomainUtil;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONArray;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */

public class SessionUserFilter implements Filter
{
  private IAuthenticationAdapter authAdapter;

  public static final Logger logger = Logger.getLogger(SessionUserFilter.class.getName());

  public SessionUserFilter()
  {
    authAdapter = (IAuthenticationAdapter) Platform.getComponent(AuthenticationComponentImpl.COMPONENT_ID).getService(
        IAuthenticationAdapter.class);
  }

  public void destroy()
  {
    authAdapter.destroy();
  }

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    // set thread local url config, for building urls
    URLConfig.setScheme(request.getScheme());
    URLConfig.setServerName(request.getServerName());
    URLConfig.setServerPort(request.getServerPort());
    URLConfig.setContextPath(((HttpServletRequest) request).getContextPath());
    URLConfig.setIcfilesContext(request.getParameter("icfilesContext"));
    /**
     * Defect 56891 , Only effect On-premise and localtest env
     */
    if (ViewerConfig.getInstance().isOnpremise() || ViewerConfig.getInstance().isLocalEnv())
    {
      JSONArray domainList = ViewerConfig.getInstance().getConfigList(ConfigConstants.DOMAIN_LIST_KEY);
      HttpMultiDomainUtil.appendIFrameResponseHeader((HttpServletRequest) request, (HttpServletResponse) response, domainList);
    }
    // LC and Concord are configured LTPA SSO, we need to keep LTPA token from cookie
    // to be stored in thread local, for adapters to use
    Cookie[] cookies = ((HttpServletRequest) request).getCookies();
    URLConfig.setRequestCookies(cookies);

    if (logger.isLoggable(Level.FINER))
    {
      Enumeration<String> names = ((HttpServletRequest) request).getHeaderNames();

      logger.log(Level.FINER, "Called for url " + ((HttpServletRequest) request).getRequestURL() + " from " + request.getRemoteAddr());
      logger.log(Level.FINER, "Requst headers: ");
      while (names.hasMoreElements())
      {
        String name = (String) names.nextElement();
        logger.log(Level.FINER, "\t- " + name + ": " + ((HttpServletRequest) request).getHeader(name));
      }
    }

    logger.log(Level.INFO, "Got request {0}", ((HttpServletRequest) request).getRequestURI());
    
    String uri = ((HttpServletRequest) request).getRequestURI();
    String files[] = ViewerUtil.getRepoAndFile((HttpServletRequest)request);   
    String repo = files[0];
    IAuthenticationAdapter externalAuthAdapter = (IAuthenticationAdapter) Platform.getComponent(AuthenticationComponentImpl.COMPONENT_ID)
        .getService(repo);
    if (externalAuthAdapter != null)
    {
      externalAuthAdapter.doFilter(request, response, chain);
    }
    else
    {
      logger.log(Level.INFO, "Have not found authentication adapter for repo " + repo + ". Use default adapter instead.");
      authAdapter.doFilter(request, response, chain);
    }
  }

  public void init(FilterConfig config) throws ServletException
  {
    authAdapter.init(config);
  }
}
