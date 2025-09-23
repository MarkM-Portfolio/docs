/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.proxy.lotuslive.saml.filter;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.Cookie;

import com.ibm.docs.proxy.lotuslive.saml.util.ProxyAuthConfig;
import com.ibm.ws.ffdc.FFDCFilter;
import com.ibm.ws.proxy.filter.http.HttpProxyServerFilter;
import com.ibm.wsspi.http.channel.HttpRequestMessage;
import com.ibm.wsspi.http.channel.HttpResponseMessage;
import com.ibm.wsspi.http.channel.values.HttpHeaderKeys;
import com.ibm.wsspi.http.channel.values.StatusCodes;
import com.ibm.wsspi.proxy.filter.http.HttpFilterStatusCode;
import com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext;

public class AuthResponseFilter extends HttpProxyServerFilter
{
  private static Logger logger = Logger.getLogger(AuthResponseFilter.class.getName());

  public StatusCodes doFilter(HttpProxyServiceContext serviceContext) throws Exception
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthResponseFilter.class.getName(), "doFilter() -- ");
    }

    StatusCodes code = HttpFilterStatusCode.STATUS_FILTER_SUCCESS;
    HttpResponseMessage response = serviceContext.getResponse();
    HttpRequestMessage request = serviceContext.getRequest();
    String rqstUri = request.getRequestURI();
    String rqstUrl = request.getRequestURLAsString();
    rqstUrl = trimUrlPort(rqstUrl);

    if (rqstUri.equalsIgnoreCase(ProxyAuthConfig.getInstance().getUriLogout()))
    { // 0. this is logout uri, do clean work
      logger.entering(AuthResponseFilter.class.getName(), "Loggig out...");
      doLogout(serviceContext);
    }
    else if (rqstUrl.equals(ProxyAuthConfig.getInstance().getIDPForwardPage()))
    {// 1. this is untrust request, need to redirect to tfim or return as UNAUTHORIZED
      String targetUrl = ProxyAuthConfig.getInstance().getHomePage();
      String targetUri = request.getHeaderAsString("TARGET");
      if (targetUri != null && targetUri.equalsIgnoreCase(ProxyAuthConfig.getInstance().getUriExpiration()))
      {// this is request from client code. if unauthenticated, means logout already or token expiration.
        logger.info("UNAUTHORIZED, Target URI is:" + targetUri);
        response.setStatusCode(StatusCodes.UNAUTHORIZED);
      }
      else
      {// need to redirect to tfim
        if (targetUri != null)
          targetUrl = ProxyAuthConfig.getInstance().getHostPage() + targetUri;

        logger.info("REDIRECTED, Target URL is:" + targetUrl);
        String websealAuthURL = ProxyAuthConfig.getInstance().getURLTFIM() + "?SP_PROVIDER_ID="
            + ProxyAuthConfig.getInstance().getURLProviderId() + "&TARGET=" + targetUrl;

        response.setStatusCode(StatusCodes.FOUND);
        response.appendHeader("Location", websealAuthURL);
      }
    }
    else if (rqstUrl.equals(ProxyAuthConfig.getInstance().getAuthedForwardPage()))
    {// 2. this is validated saml response, need append ltpa token
      String targetUrl = request.getHeaderAsString("TARGET");
      if (targetUrl != null) {
    	  if(targetUrl.indexOf("?") > 0) 
    	  {
	    	  String[] parts = targetUrl.split("\\?");
	    	  if (parts.length > 1) {
	    		  String uri = parts[0];
	    		  String queryStr = parts[1];
	    		  queryStr = queryStr.replace(" ", "&");
	    		  targetUrl = uri + "?" + queryStr;
	    		  logger.info("AuthedForwardPage, transformed Target URL is:" + targetUrl);
	    	  }
    	  }
      }
      if (targetUrl == null || this.isMaliciousTarget(rqstUrl, targetUrl))
        targetUrl = ProxyAuthConfig.getInstance().getHomePage();     
      
      HashMap<String, String> userMap = new HashMap<String, String>();
      String user = getUserInHeader(request, userMap);
      if (user != null)
      {
        try
        {
          boolean bLTPA2 = true;
          String tokenStr = TokenHelper.generateLtpaTokenFromSAMLToken(user, !bLTPA2, userMap);
          String token2Str = TokenHelper.generateLtpaTokenFromSAMLToken(user, bLTPA2, userMap);
          if (tokenStr != null && token2Str != null)
          {
            logger.info("this is request which generated LTPA");
            Cookie cookie = new Cookie(TokenHelper.tokenId, tokenStr);
            cookie.setPath("/docs/; HttpOnly");
            cookie.setSecure(true);
            cookie.setMaxAge(-1);
            response.setCookie(cookie, HttpHeaderKeys.HDR_SET_COOKIE);
            Cookie cookie2 = new Cookie(TokenHelper.token2Id, token2Str);
            cookie2.setPath("/docs/; HttpOnly");
            cookie2.setSecure(true);
            cookie2.setMaxAge(-1);
            response.setCookie(cookie2, HttpHeaderKeys.HDR_SET_COOKIE);
            
            Cookie cookie3 = new Cookie(TokenHelper.tokenFlagId, "true");
            cookie3.setPath("/");
            cookie3.setSecure(true);
            cookie3.setMaxAge(-1);
            response.setCookie(cookie3, HttpHeaderKeys.HDR_SET_COOKIE);                        
          }
          else
          {
            logger.warning("failed to generate LTPA token!");
          }
        }
        catch (Exception e)
        {
          logger.warning("Error to get OpenSAML: " + e);
          FFDCFilter.processException(e, "ConcordResponseFilter: doFilter", "Error to get OpenSAML");
        }
      }
      else
      {
        logger.warning("no user information in the header!");
      }
      if (logger.isLoggable(Level.FINEST))
      {
        if (request.containsHeader(SAMLUser.SAML_ATTR_SUBSCRIBERID))
        {
          String subscribID = request.getHeaderAsString(SAMLUser.SAML_ATTR_SUBSCRIBERID);
          String reqSessionID = null;
          String resSessionID = null;
          Cookie cookie = request.getCookie("JSESSIONID");
          if (cookie != null && cookie.getValue() != null)
          {
            reqSessionID = cookie.getValue();
          }
          else
          {
            reqSessionID = "<EMPTY>";
          }
          Cookie cookie2 = response.getCookie("JSESSIONID");
          if (cookie2 != null && cookie2.getValue() != null)
          {
            resSessionID = cookie2.getValue();
          }
          else
          {
            resSessionID = "<EMPTY>";
          }
          int statuscode = response.getStatusCode().getIntCode();
          logger.finer("SubscribeID: "+subscribID+", request sessionID: "+reqSessionID+", response sessionID: "+resSessionID+" ,URL: "+rqstUrl+" ,Status Code: "+statuscode);
           
        }
      }
      response.setStatusCode(StatusCodes.FOUND);
      response.appendHeader("Location", targetUrl);
    }
    else
    {
      int status = response != null ? response.getStatusCodeAsInt() : 0;
      if (status == StatusCodes.FOUND.getIntCode())
      {
        String redirectURL = response.getHeaderAsString("Location");
        
        // Remove the port in the HTTP/HTTPS URL.
        String newRedirectURL = redirectURL != null ? trimUrlPort(redirectURL) : null;
        if (newRedirectURL != null && !"".equals(newRedirectURL))
        {
          logger.info("Changed redirect url from: " + redirectURL + " to " + newRedirectURL);
          response.setHeader("Location", newRedirectURL);
        }
      }
    }

    if (logger.isLoggable(Level.FINEST))
    {
      logger.exiting(AuthResponseFilter.class.getName(), "init()");
    }
    return code;
  }

  private void doLogout(HttpProxyServiceContext serviceContext)
  {
    logger.info("Clearing the ltpa token...");
    HttpResponseMessage response = serviceContext.getResponse();
    Cookie cookie = new Cookie(TokenHelper.tokenId, "");
    cookie.setMaxAge(0); // clear the cookie
    cookie.setPath("/docs/");
    response.setCookie(cookie, HttpHeaderKeys.HDR_SET_COOKIE);
    
    Cookie cookie2 = new Cookie(TokenHelper.token2Id, "");
    cookie2.setMaxAge(0); // clear the cookie
    cookie2.setPath("/docs/");
    response.setCookie(cookie2, HttpHeaderKeys.HDR_SET_COOKIE);
    
    Cookie cookie3 = new Cookie(TokenHelper.tokenFlagId, "");
    cookie3.setMaxAge(0); // clear the cookie
    cookie3.setPath("/");
    response.setCookie(cookie3, HttpHeaderKeys.HDR_SET_COOKIE);
    
    response.setStatusCode(StatusCodes.OK);
  }

  private String getUserInHeader(HttpRequestMessage request, HashMap map)
  {
    String user = request.getHeaderAsString(SAMLUser.SAML_ATTR_SUBSCRIBERID);
    map.put(SAMLUser.SAML_ATTR_CUSTOMERID, request.getHeaderAsString(SAMLUser.SAML_ATTR_CUSTOMERID));
    map.put(SAMLUser.SAML_ATTR_GROUPS, request.getHeaderAsString(SAMLUser.SAML_ATTR_GROUPS));
    map.put(SAMLUser.SAML_ATTR_MAIL, request.getHeaderAsString(SAMLUser.SAML_ATTR_MAIL));
    map.put(SAMLUser.SAML_ATTR_ORGID, request.getHeaderAsString(SAMLUser.SAML_ATTR_ORGID));
    map.put(SAMLUser.SAML_ATTR_ORGNAME, request.getHeaderAsString(SAMLUser.SAML_ATTR_ORGNAME));
    map.put(SAMLUser.SAML_ATTR_PERSONID, request.getHeaderAsString(SAMLUser.SAML_ATTR_PERSONID));
    map.put(SAMLUser.SAML_ATTR_SESSIONCREATION, request.getHeaderAsString(SAMLUser.SAML_ATTR_SESSIONCREATION));
    map.put(SAMLUser.SAML_ATTR_SUBSCRIBERID, request.getHeaderAsString(SAMLUser.SAML_ATTR_SUBSCRIBERID));
    map.put(SAMLUser.SAML_ATTR_USERNAME, request.getHeaderAsString(SAMLUser.SAML_ATTR_USERNAME));

    return user;
  }

  private static Pattern pattern = Pattern.compile("[^:]+://[^:/?]+:[0-9]+.*");
  private String trimUrlPort(String url)
  {
    Matcher matcher = pattern.matcher(url);
    if (matcher.find())
    {
      return url.replaceFirst(":\\d{1,}", "");
    }
    else
    {
      return url;
    }
  }
  
  private boolean isMaliciousTarget(String rqstUrl, String targetUrl) {
    logger.info("Checking malicious target url from request: " + rqstUrl);
    try {
      URI homeUri = new URI(rqstUrl);
      String homeDomain = homeUri.getHost();      
      URI uri = new URI(targetUrl);
      String domain = uri.getHost();    
      
      if(domain.equalsIgnoreCase(homeDomain))
        return false;
    } 
    catch (URISyntaxException e) {
      logger.warning("This is malicious target url: " + targetUrl);
      FFDCFilter.processException(e, "ConcordResponseFilter: isMaliciousTarget", "Error to check malicious target url");      
      return true;
    }
    
    logger.warning("This is malicious target url: " + targetUrl);
    return true;
  }
}
