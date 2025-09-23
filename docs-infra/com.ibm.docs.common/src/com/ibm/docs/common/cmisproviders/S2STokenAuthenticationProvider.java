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

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.chemistry.opencmis.client.bindings.spi.BindingSession;
import org.apache.chemistry.opencmis.client.bindings.spi.StandardAuthenticationProvider;

public class S2STokenAuthenticationProvider extends StandardAuthenticationProvider
{  
  private static final long serialVersionUID = 1L;

  public static String S2S_TOKEN = "com.ibm.docs.repository.external.cmis.providers.S2STokenAuthenticationProvider.token";
  
  public static String S2S_TOKEN_KEY = "com.ibm.docs.repository.external.cmis.providers.S2STokenAuthenticationProvider.tokenkey";
  
  public static String ON_BEHALF_OF_KEY = "com.ibm.docs.repository.external.cmis.providers.S2STokenAuthenticationProvider.onbebalfof";
  
  public static String ON_BEHALF_OF_VALUE = "com.ibm.docs.repository.external.cmis.providers.S2STokenAuthenticationProvider.user";
  
  private String token;
  
  private String tokenKey;
  
  private String user;
  
  private String onBehalfKey;
  
  public void setSession(BindingSession session)
  {
    super.setSession(session);
    if (token == null)
    {
      token = (String) session.get(S2S_TOKEN);
    }
    if (tokenKey == null)
    {
      tokenKey = (String) session.get(S2S_TOKEN_KEY);
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

  @SuppressWarnings("unchecked")
  public Map<String, List<String>> getHTTPHeaders(String url)
  {
    Map headers = super.getHTTPHeaders(url);
    if (headers == null)
    {
      headers = new HashMap();
    }

    headers.put(tokenKey, Collections.singletonList(token));
    headers.put(onBehalfKey, Collections.singletonList(user));

    return headers;
  }
}
