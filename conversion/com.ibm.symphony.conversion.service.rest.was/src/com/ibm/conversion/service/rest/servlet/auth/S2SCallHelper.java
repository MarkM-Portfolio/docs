/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.servlet.auth;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.security.Principal;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.misc.BASE64Decoder;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ErrCodeConstants;
import com.ibm.symphony.conversion.service.common.ConversionLogger;

public class S2SCallHelper
{
  private static final Logger LOG = Logger.getLogger(S2SCallHelper.class.getName());
  
  private static final String LOGIN_URI = "/login";
  
  private static final String REDIRECT_PARAM = "redirect";

  private static final String CONFIG_S2S_NAME = "token";
  
  private static final String SOFTWARE_MODE = "software_mode";
  
  private static final String ONPREMISE_AUTH = "onpremise_authentication"; // set "onpremise_authentication" to "token" if want to avoid principal check
  
  private static final String USER_ROLE_ADMIN = "docsAdmin";

  private String token = null;
  
  private boolean isCloud;
  
  private boolean isTokenAuthOnly = false;

  public S2SCallHelper(IConversionService convService)
  {
    token = (String) convService.getConfig(CONFIG_S2S_NAME);
    if (token == null)
    {
      ConversionLogger.log(LOG, Level.SEVERE, ErrCodeConstants.CONVERSION_S2S_TOKEN_MISSING_ERR, "Unable to get s2s security token");
    }
    
    String softwareMode = (String) convService.getConfig(SOFTWARE_MODE);
    if (softwareMode == null)
    {
      ConversionLogger.log(LOG, Level.SEVERE, "Unable to get software_mode");
    }
    if (softwareMode != null && softwareMode.trim().equalsIgnoreCase("sc"))
    {
      isCloud = true;
    }
    
    String onpremiseAuth = (String) convService.getConfig(ONPREMISE_AUTH);
    if(onpremiseAuth == null)
    {
      ConversionLogger.log(LOG, Level.WARNING, "Unable to get: " + ONPREMISE_AUTH);
    }
    else if(CONFIG_S2S_NAME.equalsIgnoreCase(onpremiseAuth))
    {
      isTokenAuthOnly = true;
    }
    else
    {
      ConversionLogger.log(LOG, Level.INFO, ONPREMISE_AUTH + "is: " + onpremiseAuth);
    }
  }

  public int verify(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    LOG.entering(S2SCallHelper.class.getName(), "verify");
    
    int status = HttpServletResponse.SC_FORBIDDEN;
    if (isCloud)
    {
      status = verifySC(request, response);
    }
    else if(isTokenAuthOnly)
    {
      LOG.log(Level.INFO, "verifying request token in On-Premise...");
      status = verifyOnPremiseToken(request, response);
    }
    else
    {
      LOG.log(Level.INFO, "verifying request principal in On-Premise...");
      status = verifyOnPremisePrincipal(request, response);
    }
    LOG.exiting(S2SCallHelper.class.getName(), "verify");
    return status;
  }
  
  private int verifySC(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    if (token != null)
    {
      String s2sToken = getToken(request.getHeader(CONFIG_S2S_NAME));
      if ((s2sToken != null) && s2sToken.equals(token))
      {
        return HttpServletResponse.SC_OK;
      }
      else
      {
        ConversionLogger.log(LOG, Level.WARNING, "Un-Trusted call with incorrect token in cloud for request " + request.getRequestURI());
      }
    }
    else
    {
      ConversionLogger.log(LOG, Level.WARNING, "Un-Trusted call with empty token in cloud for request " + request.getRequestURI());
    }
    response.sendError(HttpServletResponse.SC_FORBIDDEN);
    return HttpServletResponse.SC_FORBIDDEN;
  }
  
  private int verifyOnPremisePrincipal(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    Principal j2eePrincipal = request.getUserPrincipal();
    if (request.isUserInRole(USER_ROLE_ADMIN))
    {
      if(LOG.isLoggable(Level.FINE))
      {
        LOG.log(Level.FINE, "Trusted call via admin j2c_alias {0} for request {1}", new Object[]{USER_ROLE_ADMIN, request.getRequestURL()});
      }
      response.setHeader("X-LConn-Auth", "true");
      return HttpServletResponse.SC_OK;
    }
    else if(j2eePrincipal != null)
    {
      String rqtToken = request.getHeader(CONFIG_S2S_NAME);
      if (token != null && rqtToken != null)
      {
        String s2sToken = getToken(rqtToken);
        if ((s2sToken != null) && s2sToken.equals(token))
        {
          if(LOG.isLoggable(Level.FINE))
          {
            LOG.log(Level.FINE, "j2eePrincipal is {0} and s2s token is {1} for request {2}", new Object[]{j2eePrincipal, s2sToken, request.getRequestURL()});
          }
          response.setHeader("X-LConn-Auth", "true");
          return HttpServletResponse.SC_OK;
        }
        else
        {
          ConversionLogger.log(LOG, Level.SEVERE, ErrCodeConstants.CONVERSION_S2S_TOKEN_MISMATCH_ERR, "Authentication token mismatch: " + token);
          response.sendError(HttpServletResponse.SC_FORBIDDEN);
          return HttpServletResponse.SC_FORBIDDEN;
        }
      }
      else
      {
        ConversionLogger.log(LOG, Level.WARNING, "Authentication token is missed."); 
        response.sendError(HttpServletResponse.SC_FORBIDDEN);
        return HttpServletResponse.SC_FORBIDDEN;
      }
    }
    else
    {
      ConversionLogger.log(LOG, Level.WARNING, "Un-Trusted call!!! " + request.getRequestURI());
      redirectToLogin(request, response);
      return HttpServletResponse.SC_UNAUTHORIZED;
    }    
  }

  private int verifyOnPremiseToken(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    String rqtToken = request.getHeader(CONFIG_S2S_NAME);
    if (token != null && rqtToken != null)
    {
      String s2sToken = getToken(rqtToken);
      
      if ((s2sToken != null) && s2sToken.equals(token))
      {
        if(LOG.isLoggable(Level.FINE))
        {
          LOG.log(Level.FINE, "s2s token is {0} for request {1}", new Object[]{s2sToken, request.getRequestURL()});
        }
        response.setHeader("X-LConn-Auth", "true");
        return HttpServletResponse.SC_OK;
      }
      else
      {
        ConversionLogger.log(LOG, Level.SEVERE, ErrCodeConstants.CONVERSION_S2S_TOKEN_MISMATCH_ERR, "Authentication token mismatch: " + token);
        response.sendError(HttpServletResponse.SC_FORBIDDEN);
        return HttpServletResponse.SC_FORBIDDEN;
      }
    }
    else
    {
      ConversionLogger.log(LOG, Level.WARNING, "Authentication token is missed."); 
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return HttpServletResponse.SC_FORBIDDEN;
    }
  }
  
  private String getToken(String value)
  {
    BASE64Decoder decoder = new BASE64Decoder();
    try
    {
      byte[] bytes;
      bytes = decoder.decodeBuffer(value);
      return new String(bytes);
    }
    catch (IOException e)
    {
      ConversionLogger.log(LOG, Level.SEVERE, ErrCodeConstants.CONVERSION_S2S_TOKEN_READ_ERR, e.getLocalizedMessage());
      return null;
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
      ConversionLogger.log(LOG, Level.WARNING, "redirectToLogin exception: " + e);
    }    
  }
}
