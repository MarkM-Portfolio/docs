/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.filter;

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
import com.ibm.docs.common.util.ThreadConfig;


/**
 * Servlet Filter implementation class HttpSettingsFilter
 */
public class HttpSettingsFilter implements Filter
{

  private static final Logger LOG = Logger.getLogger(HttpSettingsFilter.class.getName());

  /**
   * Default constructor.
   */
  public HttpSettingsFilter()
  {
    // Do nothing.
  }

  /**
   * @see Filter#destroy()
   */
  public void destroy()
  {
    // Do nothing.
  }

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
  }

  /**
   * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
   */
  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    // place your code here
    try
    {
      // Set an integer header in response that presents the request is served by IBM Docs application, this header is used in PROXY server.

      String serverName = HttpSettingsUtil.getServerName();
      List<String> list = new ArrayList<String>();
      list.add(serverName);
      String problemID = HttpSettingsUtil.generateProblemId(list);
      ThreadConfig.setRequestID(problemID);
      request.setAttribute(HttpSettingsUtil.PROBLEM_ID, problemID);
      if (response != null)
      {
        response.addHeader(HttpSettingsUtil.PROBLEM_ID, ThreadConfig.getRequestID());
      }
      // pass the request along the filter chain
      chain.doFilter(request, response);
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, "Exception happens while setting the response", e);
    }
    finally
    {
      ThreadConfig.remove();
    }
  }

  /**
   * @see Filter#init(FilterConfig)
   */
  public void init(FilterConfig fConfig) throws ServletException
  {
    // Do nothing.
  }

}
