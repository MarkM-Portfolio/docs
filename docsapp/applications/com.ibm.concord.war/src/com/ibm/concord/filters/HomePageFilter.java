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

public class HomePageFilter implements Filter
{
  
  private static final Logger LOG = Logger.getLogger(HomePageFilter.class.getName());

  private final String HOME_JSP = "/docs/home";
  
  private final String DOCS = "/docs";
  
  private final String DOCS_WITH_SLASH = "/docs/";

  public void destroy()
  {
    // TODO Auto-generated method stub

  }

  public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws IOException, ServletException
  {
    HttpServletRequest request = (HttpServletRequest)req;
    String method = request.getMethod();
    String uri = request.getRequestURI();
    if(method != null && method.equalsIgnoreCase("GET"))
    {
      if(uri!=null && (uri.equalsIgnoreCase(this.DOCS) || uri.equalsIgnoreCase(this.DOCS_WITH_SLASH))) {
        HttpServletResponse response = (HttpServletResponse) resp;
        response.sendRedirect(this.HOME_JSP);
        LOG.log(Level.INFO, "Redirect to homepage from: ", uri);
        return;        
      }
    }
    chain.doFilter(req, resp);
    return;
  }

  public void init(FilterConfig arg0) throws ServletException
  {
    // TODO Auto-generated method stub

  }

}
