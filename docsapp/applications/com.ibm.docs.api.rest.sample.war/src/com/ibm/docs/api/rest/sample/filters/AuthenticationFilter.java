package com.ibm.docs.api.rest.sample.filters;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.security.Principal;
import java.util.Enumeration;
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

import com.ibm.json.java.JSONObject;

/**
 * Servlet Filter implementation class AuthenticationFilter
 */
public class AuthenticationFilter implements Filter
{
  private final static String S2S_METHOD_OAUTH2 = "oauth2";
  
  private final static String S2S_METHOD_J2CALIAS = "j2c_alias";
  
  private final static String S2S_METHOD_COOKIE = "cookies";
  
  private final static String S2S_METHOD_S2STOKEN = "s2s_token";
  
  private static final String S2STOKEN_KEY = "token";

  private static final String LOGIN_URI = "/login";

  private static final String REDIRECT_PARAM = "redirect";
  
  private static final Logger LOG = Logger.getLogger(AuthenticationFilter.class.getName());
  
  private static String s2sMethod;

  private static String s2sToken;
  
  private static String asUserKey;
  
  private String authType;
  /**
   * Default constructor.
   */
  public AuthenticationFilter()
  {
  }

  /**
   * @see Filter#destroy()
   */
  public void destroy()
  {
    // TODO Auto-generated method stub
  }

  /**
   * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
   */
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    HttpServletRequest req = (HttpServletRequest)request;
    HttpServletResponse resp = (HttpServletResponse)response;
    if (S2S_METHOD_J2CALIAS.equalsIgnoreCase(s2sMethod))
    {
      Principal j2eePrincipal = req.getUserPrincipal();
      if (j2eePrincipal == null)
      {
        redirectToLogin(req, resp);
        return;
      }
      LOG.log(Level.INFO, "Server to server call via j2c_alias... ");
    }
    else if (S2S_METHOD_S2STOKEN.equalsIgnoreCase(s2sMethod))
    {
      String token = req.getHeader(S2STOKEN_KEY);
      if (s2sToken == null || !s2sToken.equalsIgnoreCase(token))
      {
        return;
      }
      LOG.log(Level.INFO, "Server to server call via s2s_token... ");
    }
    else if("cookies".equalsIgnoreCase(s2sMethod))
    {
      Principal j2eePrincipal = req.getUserPrincipal();
      if (j2eePrincipal == null)
      {
        redirectToLogin(req, resp);
        return;
      }
      LOG.log(Level.INFO, "Server to server call via cookies... ");
    }
    else if (S2S_METHOD_OAUTH2.equalsIgnoreCase(s2sMethod))
    {
      String bearer = req.getHeader("Authorization");
      if (bearer != null && bearer.contains("Bearer"))
      {
        return;
      }
      else
      {
        redirectToLogin(req, resp);
        return;
      }
//      Enumeration<String> strs = req.getHeaderNames();
//      while(strs.hasMoreElements())
//      {
//        String str = strs.nextElement();
//        LOG.info("header name: " + str);
//      }
    }
    else
    {
      LOG.log(Level.INFO, "Not support server to server call...");
    }

    String asUser = req.getHeader(asUserKey);
    LOG.log(Level.INFO, "Server to server call as-user: " + asUser);

    // pass the request along the filter chain
    chain.doFilter(request, response);
  }

  /**
   * @see Filter#init(FilterConfig)
   */
  public void init(FilterConfig fConfig) throws ServletException
  {
    InputStream is = null;
    try
    {
      is = getClass().getResourceAsStream("/com/ibm/docs/api/rest/sample/filters/config.json");
      JSONObject json = JSONObject.parse(is);
      s2sMethod = (String) json.get("s2s_method");
      s2sToken = (String) json.get(S2S_METHOD_S2STOKEN);
      asUserKey = (String) json.get("onbehalfof_key");
      
      LOG.log(Level.INFO, "S2S method is: {0}, S2S toekn is: {1}, as-user key is: {2}", new Object[]{s2sMethod, s2sToken, asUserKey});
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    finally
    {
      try
      {
        is.close();
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
    }    
  }
  
  private void redirectToLogin(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    String queryString = (request.getQueryString() != null) ? "?" + request.getQueryString() : "";
    String loginUrl = request.getContextPath() + LOGIN_URI;
    try
    {
      String redirectUrl = loginUrl + "?" + REDIRECT_PARAM + "="
          + URLEncoder.encode(request.getRequestURL().toString() + queryString, "UTF-8");

      response.sendRedirect(response.encodeRedirectURL(redirectUrl));
    }
    catch (UnsupportedEncodingException e)
    {
    }
  }  
}
