/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.filters;

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
 * @author linfeng_li
 * 
 */
public class HttpSettingsFilter implements Filter
{
  private static final Logger LOG = Logger.getLogger(HttpSettingsFilter.class.getName());

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
   */
  @Override
  public void init(FilterConfig paramFilterConfig) throws ServletException
  {
    // Do nothing.
  }

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest, javax.servlet.ServletResponse, javax.servlet.FilterChain)
   */
  @Override
  public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException,
      ServletException
  {
    doFilter((HttpServletRequest) servletRequest, (HttpServletResponse) servletResponse, filterChain);
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

  /*
   * (non-Javadoc)
   * 
   * @see javax.servlet.Filter#destroy()
   */
  @Override
  public void destroy()
  {
    // Do nothing.
  }

}
