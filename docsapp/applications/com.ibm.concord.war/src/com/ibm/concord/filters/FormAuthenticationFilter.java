/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.filters;

import java.io.IOException;
import java.net.URL;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.security.Principal;
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
import javax.servlet.http.HttpServletResponseWrapper;

public class FormAuthenticationFilter implements Filter {
  private static final Logger LOG = Logger.getLogger(FormAuthenticationFilter.class.getName());

  private static String REDIRECT_PARAM = "redirect";
  private static String LOGIN_ERROR_PARAM = "error=true";
  private static String LOGIN_URI = "/login";

  public FormAuthenticationFilter() {
    super();
  }

  public void init(FilterConfig config) throws ServletException {
  }

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
    doFilter((HttpServletRequest)request, (HttpServletResponse)response, chain);
  }

  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    String redirectUrl = request.getParameter(REDIRECT_PARAM);
    if (redirectUrl != null)
    {
      redirectUrl = URLDecoder.decode(redirectUrl, "utf-8");

      HttpServletResponseRedirectTrapper responseTrap = new HttpServletResponseRedirectTrapper(response);
      chain.doFilter(request, responseTrap);
      if (redirectUrl == null)
      {
        redirectUrl = responseTrap.getRedirectURL();
      }

      URL redirectURL = new URL(redirectUrl);
      if (!request.getServerName().equalsIgnoreCase(redirectURL.getHost()))
      {
        redirectUrl = redirectURL.getFile();
      }

      Principal principal = request.getUserPrincipal();
      if (principal == null)
      {
        String queryString = (request.getQueryString() != null) ? "?" + request.getQueryString() + "&" + LOGIN_ERROR_PARAM : "?" + LOGIN_ERROR_PARAM + "&" + REDIRECT_PARAM + "=" + URLEncoder.encode(redirectUrl, "UTF-8");
        redirectUrl = request.getContextPath() + LOGIN_URI + queryString;
      }

      response.sendRedirect(response.encodeRedirectURL(redirectUrl));
    }
    else
    {
      HttpServletResponseRedirectTrapper responseTrap = new HttpServletResponseRedirectTrapper(response);
      chain.doFilter(request, responseTrap);
      Principal principal = request.getUserPrincipal();
      if (principal == null)
      {
        LOG.log(Level.WARNING, "Did not find J2EE principal, form authentication failed.");
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
      }
      else
      {
        response.setStatus(HttpServletResponse.SC_OK);
      }
    }
  }
  
  public void destroy() {
  }
  
  static class HttpServletResponseRedirectTrapper extends HttpServletResponseWrapper
  {
    private String redirectURL;

    public HttpServletResponseRedirectTrapper(HttpServletResponse wrappedResponse) {
      super(wrappedResponse);
    }

    public void sendRedirect(String url) {
      this.redirectURL = url;
    }

    public String getRedirectURL() {
      return redirectURL;
    }
  }

}