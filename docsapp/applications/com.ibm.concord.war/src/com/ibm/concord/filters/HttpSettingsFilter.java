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
import java.util.ArrayList;
import java.util.List;
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

import com.ibm.docs.common.util.HttpSettingsUtil;
import com.ibm.docs.common.util.URLConfig;

/**
 * This filter is used to set the HTTP headers.
 * 
 */
public class HttpSettingsFilter implements Filter
{
  private static final Logger LOG = Logger.getLogger(HttpSettingsFilter.class.getName());

  /**
   * 
   */
  public HttpSettingsFilter()
  {
    // Do nothing.
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
   */
  public void init(FilterConfig config) throws ServletException
  {
    // Do nothing.
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.Filter#destroy()
   */
  public void destroy()
  {
    // Do nothing.
  }

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest, javax.servlet.ServletResponse, javax.servlet.FilterChain)
   */
  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    try
    {
      // Set an integer header in response that presents the request is served by IBM Docs application, this header is used in PROXY server.

      String serverName = HttpSettingsUtil.getServerName();
      List<String> list = new ArrayList<String>();
      list.add(serverName);
      String problemID = HttpSettingsUtil.generateProblemId(list);
      URLConfig.setRequestID(problemID);
      request.setAttribute(HttpSettingsUtil.PROBLEM_ID, problemID);
      if (response != null)
      {
        response.setIntHeader("IBMDocsApp", 1);
        response.addHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
        response.setHeader(HttpSettingsUtil.PROBLEM_ID, URLConfig.getRequestID());
      }

      // Set a default content type to response. Because HTTP compress filter of PROXY server needs the type.
      response.setContentType("text/html");
      chain.doFilter(request, response);
      
    }
    catch (Throwable ex)
    {
      LOG.log(Level.WARNING, "Exception happens while setting the response", ex);
    }
  }
  
}