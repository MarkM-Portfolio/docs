package com.ibm.docs.alfresco.web.filter;

import java.io.IOException;
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

import com.ibm.docs.alfresco.util.Constants;

public class ParametersFilter implements Filter
{
  private static final Logger LOG = Logger.getLogger(ParametersFilter.class.getName());
  
  private static final String LOGIN_URI = "login";
  
  private static final String CALLBACK_URI = "driverscallback";
  
  private static final String REDIRECT_PARAM = "redirect";
  
  //private static final String REDIRECT_PAGE = "http://localhost:8080/share/page/context/mine/myfiles";
  private static final String REDIRECT_PAGE = "alfresco-error-page.html";
  
  @Override
  public void destroy()
  {
    // TODO Auto-generated method stub

  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
  }
  
  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    String uri = ((HttpServletRequest) request).getRequestURI();
    LOG.log(Level.INFO, "Access uri: " + uri);
    if (uri.contains(CALLBACK_URI))
    {
      String authCode = getAlfrescoTicket(request, response);
      if (authCode != null)
      {
        Cookie cookie = new Cookie(Constants.CODE, authCode);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        //cookie.setSecure(true);      // set it if only allow traffic over HTTPS
        response.addCookie(cookie);
      }
    }
    else if (uri.contains(LOGIN_URI))
    {
      String redirectUri = request.getParameter(REDIRECT_PARAM);
      if (redirectUri != null && redirectUri.contains(CALLBACK_URI))
      {
        // continue...
      }
      else
      {
        response.sendRedirect(request.getContextPath() + "/" + REDIRECT_PAGE);
        return;   
      }
    }
    chain.doFilter(request, response);
  }

  @Override
  public void init(FilterConfig arg0) throws ServletException
  {
    // TODO Auto-generated method stub

  }
  
  private String getAlfrescoTicket(HttpServletRequest request, HttpServletResponse response)
  {    
    String authCode = request.getParameter(Constants.CODE);
    if (authCode != null)
    {
      return authCode;
    }
    else
    {
      authCode = request.getHeader(Constants.CODE);
      if (authCode != null)
      {     
        return authCode;
      }
    }
    return null;
  }

}
