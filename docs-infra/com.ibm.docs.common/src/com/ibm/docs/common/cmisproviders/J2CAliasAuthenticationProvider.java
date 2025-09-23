/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.cmisproviders;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.chemistry.opencmis.client.bindings.spi.BindingSession;
import org.apache.chemistry.opencmis.client.bindings.spi.StandardAuthenticationProvider;
import org.apache.chemistry.opencmis.commons.SessionParameter;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;

import com.ibm.connections.httpClient.ServerToServerHttpClient;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;

public class J2CAliasAuthenticationProvider extends StandardAuthenticationProvider
{    
  public static String J2C_URL = "com.ibm.docs.repository.external.cmis.providers.J2CAliasAuthenticationProvider.j2curl";
  
  public static String ON_BEHALF_OF_KEY = "com.ibm.docs.repository.external.cmis.providers.J2CAliasAuthenticationProvider.onbebalfof";
  
  public static String ON_BEHALF_OF_VALUE = "com.ibm.docs.repository.external.cmis.providers.J2CAliasAuthenticationProvider.user";
  
  private static final Logger LOG = Logger.getLogger(J2CAliasAuthenticationProvider.class.getName());

  private static final long serialVersionUID = 1L;
  
  private HttpClient httpClient;
  
  private String j2cAlias;
  
  private String j2cUrl;   
  
  private String user;
  
  private String onBehalfKey;
  
  public void setSession(BindingSession session)
  {
    super.setSession(session);
    if(this.j2cAlias == null)
    {     
      if ((session.get(SessionParameter.USER) instanceof String))
      {
        this.j2cAlias = (String) session.get(SessionParameter.USER);
      }
    }
    if(this.j2cUrl == null)
    {     
      if ((session.get(J2C_URL) instanceof String))
      {
        this.j2cUrl = (String) session.get(J2C_URL);
      }
    }  
    if (onBehalfKey == null)
    {
      onBehalfKey = (String) session.get(ON_BEHALF_OF_KEY);
    }
    if (user == null)
    {
      user = (String) session.get(ON_BEHALF_OF_VALUE);
    }     
  }
  
  public Map<String, List<String>> getHTTPHeaders(String url)
  {
    Map<String, List<String>> headers = getJ2CAliasHeaders(); 
    headers.put(onBehalfKey, Collections.singletonList(user));
    return headers;
  }
  
  private Map<String, List<String>> getJ2CAliasHeaders()
  {    
    if (httpClient == null)
    {
      httpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
      ((ServerToServerHttpClient) httpClient).set_authHeaderChecking(false);
    }
    
    Map<String, List<String>> cookieHeader = new HashMap<String, List<String>>();
    GetMethod getMethod = new GetMethod(j2cUrl);
    try
    {
      int nHttpStatus = httpClient.executeMethod(getMethod);
      if (HttpStatus.SC_OK == nHttpStatus)
      {
        Header[] cookie = getMethod.getRequestHeaders("Cookie");
        ArrayList<String> list = new ArrayList<String>();
        for (int i = 0; i < cookie.length; i++)
        {
          list.add(cookie[i].getValue());
        }
        cookieHeader.put("Cookie", list);
      }
      else
      {
        LOG.log(Level.SEVERE, "Failed to get http header by j2calias, return code: ", nHttpStatus);
      }      
    }
    catch (HttpException e)
    {
      LOG.log(Level.SEVERE, "Failed to get http header by j2calias. ", e.getLocalizedMessage());
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Failed to get http header by j2calias. " + e.getLocalizedMessage());
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }

    return cookieHeader;
  }

}
