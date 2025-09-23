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

import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.Cookie;

import com.ibm.websphere.security.auth.WSLoginFailedException;
import com.ibm.ws.ffdc.FFDCFilter;
import com.ibm.ws.security.util.StringUtil;
import com.ibm.ws.security.util.Base64Coder;
import com.ibm.ws.security.ltpa.LTPAServerObject;
import com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext;
import com.ibm.wsspi.security.ltpa.Token;

public class TokenHelper
{
  private static Logger logger = Logger.getLogger(TokenHelper.class.getName());

  static final String tokenId = "LTPADocs";

  static final String token2Id = "LTPADocs2";
  
  static final String tokenFlagId = "LTPADocsFlag";

  private static final String LTPA2Factory = "com.ibm.ws.security.ltpa.LTPAToken2Factory";

  private static final String LTPAFactory = "com.ibm.ws.security.ltpa.LTPATokenFactory";

  /**
   * 
   * @param serviceContext
   * @param bRequest
   *          -- if the caller is a request filter or response filter
   * @return
   */
  public static boolean validateLTPA(HttpProxyServiceContext serviceContext, boolean bToken2, HashMap attrMap)
  {
    String tokenKey = bToken2 ? token2Id : tokenId;
    java.util.List<Cookie> cookies = serviceContext.getRequest().getAllCookies();
    if (cookies != null)
    {
      for (int i = 0; i < cookies.size(); i++)
      {
        Cookie c = cookies.get(i);
        if (cookies.get(i).getName().equals(tokenKey))
        {
          String testLtpaValue = c.getValue();
          byte[] bs = StringUtil.getBytes(testLtpaValue);
          byte[] credTok = Base64Coder.base64Decode(bs);
          LTPAServerObject serverObj = LTPAServerObject.getInstance();
          try
          {
            Token token = null;
            if ((token = serverObj.validateToken(credTok)) != null)
            {
              if (attrMap != null)
              {// need only get attrs for LTPA but not for LTPA2
                getTokenAttrs(token, attrMap);
              }
              return true;
            }
          }
          catch (WSLoginFailedException e)
          {
            FFDCFilter.processException(e, "TokenHelper: validateLTPA - " + tokenKey, "Error reading token");
          }
        }
      }
    }

    return false;
  }

  public static String generateLtpaTokenFromSAMLToken(String user, boolean bToken2, HashMap map)
  {
    if (user.length() == 0)
    {
      logger.log(Level.SEVERE, "generateLtpaTokenFromSAMLToken: did not get user id from saml token... ");
      return null;
    }

    String tokenFactory = bToken2 ? LTPA2Factory : LTPAFactory;
    LTPAServerObject serverObj = LTPAServerObject.getInstance();
    try
    {
      Token ltpatoken = (Token) serverObj.createLTPAToken("user:" + user, tokenFactory);
      if (map != null)
      {
        addTokenAttrs(ltpatoken, map);
      }

      try
      {
        byte[] bs = ltpatoken.getBytes();
        return StringUtil.toString(Base64Coder.base64Encode(bs));
      }
      catch (Exception e)
      {
        FFDCFilter.processException(e, "TokenHelper: generateLtpaTokenFromSAMLToken - " + tokenFactory, "Exception");
      }
    }
    catch (WSLoginFailedException e)
    {
      FFDCFilter.processException(e, "TokenHelper: generateLtpaTokenFromSAMLToken - " + tokenFactory, "WSLoginFailedException");
    }

    return null;
  }

  private static void getTokenAttrs(Token token, HashMap attrMap)
  {
    List<String> paraNames = Collections.list((Enumeration<String>) token.getAttributeNames());
    for (String paraName : paraNames)
    {
      attrMap.put(paraName, token.getAttributes(paraName)[0]);
    }
  }

  private static void addTokenAttrs(Token token, HashMap map)
  {
    Iterator it = map.entrySet().iterator();
    while (it.hasNext())
    {
      Map.Entry pairs = (Map.Entry) it.next();
      String key = (String) pairs.getKey();
      String value = (String) pairs.getValue();
      token.addAttribute(key, value);
    }
  }
}
