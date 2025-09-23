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

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.security.cert.X509Certificate;
import java.util.HashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.proxy.lotuslive.saml.util.ProxyAuthConfig;
import com.ibm.docs.proxy.lotuslive.saml.util.DMZConfigHelper;
import com.ibm.ws.exception.ConfigurationError;
import com.ibm.ws.ffdc.FFDCFilter;
import com.ibm.ws.proxy.filter.http.HttpProxyServerFilter;
import com.ibm.wsspi.buffermgmt.*;
import com.ibm.wsspi.cluster.adapter.channel.ChannelSelectionAdapter;
import com.ibm.wsspi.http.channel.HttpRequestMessage;
import com.ibm.wsspi.http.channel.values.StatusCodes;
import com.ibm.wsspi.proxy.filter.FilterWrapper;
import com.ibm.wsspi.proxy.filter.http.HttpFilterStatusCode;
import com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext;
import com.ibm.wsspi.runtime.service.WsServiceRegistry;
import java.security.KeyStore;

public class AuthRequestFilter extends HttpProxyServerFilter
{
  private static Logger logger = Logger.getLogger(AuthRequestFilter.class.getName());

  private static volatile ChannelSelectionAdapter selectionService = null;

  private Lock clusterFilterLock = new ReentrantLock();

  /**
	 */
  public StatusCodes doFilter(HttpProxyServiceContext serviceContext) throws Exception
  {
    logger.entering(AuthRequestFilter.class.getName(), "doFilter() -- " + serviceContext.getRequest().getRequestURLAsString());

    StatusCodes code = HttpFilterStatusCode.STATUS_FILTER_SUCCESS;
    HttpRequestMessage request = serviceContext.getRequest();
    String backfromsaml = ProxyAuthConfig.getInstance().getUrlBackFromSAML();
    String rqstURI = request.getRequestURI();

    boolean bLTPA2 = true;
    HashMap<String, String> attrLtpaMap = new HashMap<String, String>();
    HashMap<String, String> attrLtpaMap2 = new HashMap<String, String>();
    if (TokenHelper.validateLTPA(serviceContext, !bLTPA2, attrLtpaMap) && TokenHelper.validateLTPA(serviceContext, bLTPA2, attrLtpaMap2))
    {// 1. this is trusted request
      if (logger.isLoggable(Level.FINEST))
      {
        logger.info("this is trusted request.");
      }
      SAMLUser samlUser = new SAMLUser(attrLtpaMap);
      if (samlUser.getCustomerId() == null) {
        samlUser = new SAMLUser(attrLtpaMap2);
      }
      appendUserInfoToRequest(serviceContext, samlUser);
      if (request.getMethod().equals("POST") && rqstURI.equals(backfromsaml))
      {// possible post SAML assert with LTPA cookie, handle it again      
        logger.info("this is an trusted request with SAML token.");
        code = this.handleSAMLPost(serviceContext);
      }      
    }
    else if (request.getMethod().equals("POST") && rqstURI.equals(backfromsaml))
    {// 2. handle saml post here      
      logger.info("this is un trusted request with SAML token.");
      code = this.handleSAMLPost(serviceContext);
    }
    else
    {// 3. this is an untrusted request
      if (rqstURI.indexOf(ProxyAuthConfig.getInstance().getUriApi()) >= 0 || rqstURI.indexOf(ProxyAuthConfig.getInstance().getUriStatic()) >= 0)
      {// this is request from client code. if unauthenticated, means logout already or token expiration.
        logger.info("this is an untrust request from client API or accessing static files. will return UNAUTHORIZED");
        request.appendHeader("TARGET", ProxyAuthConfig.getInstance().getUriExpiration());
        request.setRequestURL(ProxyAuthConfig.getInstance().getIDPForwardPage());
      }
      else
      {// direct the request to proxy's local provider, the response filter will then tell browser to redirect to TFIM
        logger.info("this is an untrust request. will be redirected");
        String targetUri = request.getRequestURI();
        String queryStr = request.getQueryString();

        if (queryStr != null && !"".equals(queryStr))
        {
          logger.info("the target url also contains query string: " + queryStr);
          queryStr = queryStr.replace("&", " ");
          targetUri += "?" + queryStr;
          targetUri = URLEncoder.encode(targetUri, "UTF-8");
          logger.info("transform and encode target uri to " + targetUri);
        }
        request.appendHeader("TARGET", targetUri);
        request.setRequestURL(ProxyAuthConfig.getInstance().getIDPForwardPage());
      }
    }

    logger.exiting(AuthRequestFilter.class.getName(), "init()");
    return code;
  }

  public void init(FilterWrapper filterWrapper) throws Exception
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthRequestFilter.class.getName(), "init()");
    }

    super.init(filterWrapper);

    if (selectionService == null)
    {
      clusterFilterLock.lock();
      try
      {
        if (selectionService == null)
        {
          selectionService = (ChannelSelectionAdapter) WsServiceRegistry.getService(this, ChannelSelectionAdapter.class);
        }
      }
      finally
      {
        clusterFilterLock.unlock();
      }

      if (selectionService == null)
      {
        if (logger.isLoggable(Level.WARNING))
        {
          logger.warning("Unable to obtain the ChannelSelectionAdapter from the service registry.");
        }
        throw new ConfigurationError("Unable to obtain the ChannelSelectionAdapter from the service registry.");
      }
    }

    if (logger.isLoggable(Level.FINEST))
    {
      logger.exiting(AuthRequestFilter.class.getName(), "init()");
    }
  }
  
  private StatusCodes handleSAMLPost(HttpProxyServiceContext serviceContext)
  {
      String samlXML = null;
      String targetURL = null;
      HttpRequestMessage request = serviceContext.getRequest();
      try
      {
        if (!serviceContext.isRequestBodyComplete())
        {
          logger.info("handleSAMLPost: need entire request from client");
          return HttpFilterStatusCode.STATUS_FILTER_NEED_COMPLETE_BODY;
        }
        String bufStr = WsByteBufferUtils.asString(serviceContext.getRequestBodyBuffers());
        String bodyStr = URLDecoder.decode(bufStr);
        HashMap<String, String> bodyMap = new HashMap<String, String>();
        getParasFromSAMLBody(bodyStr, bodyMap);
        targetURL = bodyMap.get(OpenSAML.SAMLTarget);
        samlXML = bodyMap.get(OpenSAML.SAMLResponse);
        logger.info("handleSAMLPost: decoded SAML token body successfully.");
      }
      catch (Throwable throwable)
      {
        FFDCFilter.processException(throwable, "ConcordRequestFilter: handleSAMLPost", "Error to get post body");
        return HttpFilterStatusCode.STATUS_FILTER_NEED_COMPLETE_BODY;
      }

      if (samlXML != null && samlXML.length() > 0)
      {// this is a request with SAML Token
        logger.info("Got SAML XML in base64 format.");
        try
        {
          OpenSAML samlInstance = ProxyAuthConfig.getInstance().getOpenSAML();
          String ketStoreFile = DMZConfigHelper.getJksFile();
          String password = ProxyAuthConfig.getInstance().getJksSAMLPassWord();
          String caKey = ProxyAuthConfig.getInstance().getJksSAMLKey();
          KeyStore ks = samlInstance.getKeyStore(ketStoreFile, password);
          X509Certificate certificate = samlInstance.getCertificate(ks, caKey, password);
          HashMap<String, String> attrMap = new HashMap<String, String>();
          HashMap<String, String> status = new HashMap<String, String>();
          if (samlInstance.verifyAssertion(certificate, samlXML, attrMap, status))
          {
            // We should encode the user's display name because it may contain special character from SAML XML.
            String userName = attrMap.get(SAMLUser.SAML_ATTR_USERNAME);
            try
            {
              if (userName != null)
              {
                userName = URLEncoder.encode(userName, "UTF-8");
              }
              attrMap.put(SAMLUser.SAML_ATTR_USERNAME, userName);
            }
            catch (Exception e)
            {
              logger.log(Level.WARNING, "Exception happens while encoding the display name of user!", e);
            }
            
            SAMLUser samlUser = new SAMLUser(attrMap);
            // this user will be used to generate UserBean in application, be used to generate ltpa token in response filter
            appendUserInfoToRequest(serviceContext, samlUser);
            request.appendHeader("TARGET", targetURL);
            request.setRequestURL(ProxyAuthConfig.getInstance().getAuthedForwardPage());
            logger.info("Verified SAML XML.");
          }
          else
          {
            logger.warning("invalid SAML XML.");
            return HttpFilterStatusCode.STATUS_FILTER_NEED_COMPLETE_BODY;
          }
        }
        catch (Exception e)
        {
          FFDCFilter.processException(e, "ConcordRequestFilter: doFilter", "Error to get OpenSAML");
          return HttpFilterStatusCode.STATUS_FILTER_NEED_COMPLETE_BODY;
        }
      }
      else
      {
        logger.warning("SAML XML is NULL...");
        return HttpFilterStatusCode.STATUS_FILTER_NEED_COMPLETE_BODY;
      }	 
      return HttpFilterStatusCode.STATUS_FILTER_SUCCESS;
  }

  private void appendUserInfoToRequest(HttpProxyServiceContext serviceContext, SAMLUser user)
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthRequestFilter.class.getName(), "appendUserInfoToRequest() -- "
          + serviceContext.getRequest().getRequestURLAsString());
    }

    HttpRequestMessage request = serviceContext.getRequest();
    request.appendHeader(SAMLUser.SAML_ATTR_CUSTOMERID, user.getCustomerId());
    request.appendHeader(SAMLUser.SAML_ATTR_GROUPS, user.getGroups());
    request.appendHeader(SAMLUser.SAML_ATTR_MAIL, user.getEmail());
    request.appendHeader(SAMLUser.SAML_ATTR_ORGID, user.getOrgId());
    request.appendHeader(SAMLUser.SAML_ATTR_ORGNAME, user.getOrgName());
    request.appendHeader(SAMLUser.SAML_ATTR_PERSONID, user.getPersonId());
    request.appendHeader(SAMLUser.SAML_ATTR_SESSIONCREATION, user.getSessionCreation());
    request.appendHeader(SAMLUser.SAML_ATTR_SUBSCRIBERID, user.getSubscribeId());
    request.appendHeader(SAMLUser.SAML_ATTR_USERNAME, user.getUserName());

    if (logger.isLoggable(Level.FINEST))
    {
      logger.exiting(AuthRequestFilter.class.getName(), "appendUserInfoToRequest()");
    }
  }

  private void getParasFromSAMLBody(String samlBody, HashMap map)
  {
    String[] tokens = samlBody.split("&");
    for (int i = 0; i < tokens.length; i++)
    {
      String pairStr = tokens[i];
      int pos = -1;
      if ((pos = pairStr.indexOf("=")) > 0)
      {// first "=" character indicate the key/value
        String key = pairStr.substring(0, pos);
        map.put(key, pairStr.substring(pos + 1));
      }
    }
  }  
}
