/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.proxy.lotuslive.saml.util;

import java.io.UnsupportedEncodingException;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import com.ibm.docs.proxy.lotuslive.saml.filter.OpenSAML;
import com.ibm.docs.proxy.lotuslive.saml.util.DMZConfigHelper;
import com.ibm.ws.ffdc.FFDCFilter;
import com.ibm.ws.security.util.Base64Coder;
import com.ibm.ws.util.Base64;

public class ProxyAuthConfig
{  

  private String urlForwardTFIMPage = "";// "https://apps.docsdev.cn.ibm.com/docs/shouldnotexist1";

  private String urlForwardAuthedPage = "";// "https://apps.docsdev.cn.ibm.com/docs/shouldnotexist2";

  private String urlTFIM = "";// "https://apps.docsdev.cn.ibm.com/sps/idp/saml11/login";

  private String urlProviderId = "";// "https://apps.docsdev.cn.ibm.com/docs";

  private String urlBackFromSAML = "";// "https://apps.docsdev.cn.ibm.com/docs/backfromsaml";

  private String uriLogout = "/docs/logout"; // add it into variable later

  private String uriApi = "/docs/api/"; // add it into variable later

  private String uriStatic = "/docs/static/"; // add it into variable later

  private String uriExpiration = "/docs/expiration"; // add it into variable later

  private String urlHomePage = "";// "https://apps.docsdev.cn.ibm.com/files";

  private String urlHostPage = "";// "https://apps.docsdev.cn.ibm.com";

  private String targetId = "TARGET";

  private String jksSAMLPassWord = "";// "passw0rd";

  private String jksSAMLKey = "";// "lotusliveidp";

  private OpenSAML samlInstance = null;
  
  private final static ProxyAuthConfig config = new ProxyAuthConfig();

  public static ProxyAuthConfig getInstance()
  {
    return config;
  }

  private ProxyAuthConfig()
  {
    samlInstance = new OpenSAML();
  }

  public String getURLTFIM()
  {
    if (urlTFIM == null || urlTFIM.length() == 0)
      urlTFIM = DMZConfigHelper.getCellVariable("DOCS_TFIM_URL");
    return urlTFIM;
  }

  public String getURLProviderId()
  {
    if (urlProviderId == null || urlProviderId.length() == 0)
      urlProviderId = DMZConfigHelper.getCellVariable("DOCS_PROVIDER_ID");
    return urlProviderId;
  }

  public String getTargetId()
  {
    return targetId;
  }

  public String getIDPForwardPage()
  {
    if (urlForwardTFIMPage == null || urlForwardTFIMPage.length() == 0)
      urlForwardTFIMPage = DMZConfigHelper.getCellVariable("DOCS_NOEXISTING_PAGE_IDP");
    return urlForwardTFIMPage;
  }

  public String getAuthedForwardPage()
  {
    if (urlForwardAuthedPage == null || urlForwardAuthedPage.length() == 0)
      urlForwardAuthedPage = DMZConfigHelper.getCellVariable("DOCS_NOEXISTING_PAGE_AUTHED");
    return urlForwardAuthedPage;
  }

  public String getUrlBackFromSAML()
  {
    if (urlBackFromSAML == null || urlBackFromSAML.length() == 0)
      urlBackFromSAML = DMZConfigHelper.getCellVariable("DOCS_BACKFROMSAML_PAGE");
    return urlBackFromSAML;
  }

  public String getUriLogout()
  {
    // get it from cell variable later
    return uriLogout;
  }

  public String getUriApi()
  {
    return uriApi;
  }
  
  public String getUriStatic()
  {
    return uriStatic;
  }

  public String getUriExpiration()
  {
    return uriExpiration;
  }

  public String getHomePage()
  {
    if (urlHomePage == null || urlHomePage.length() == 0)
      urlHomePage = DMZConfigHelper.getCellVariable("DOCS_HOME_PAGE");
    return urlHomePage;
  }

  public String getHostPage()
  {
    if (urlHostPage == null || urlHostPage.length() == 0)
      urlHostPage = DMZConfigHelper.getCellVariable("DOCS_HOST_PAGE");
    return urlHostPage;
  }

  public OpenSAML getOpenSAML()
  {
    return samlInstance;
  }

  public String getJksSAMLKey()
  {
    if (jksSAMLKey == null || jksSAMLKey.length() == 0)
    {
      jksSAMLKey = DMZConfigHelper.getCellVariable("DOCS_SAML_JKSKEY");
    }
    return jksSAMLKey;
  }

  public String getJksSAMLPassWord()
  {
    if (jksSAMLPassWord == null || jksSAMLPassWord.length() == 0)
    {
      String base64PSW = DMZConfigHelper.getCellVariable("DOCS_SAML_JKSPASSWORD");
      try
      {
        byte[] decodedBytes = Base64.decode(base64PSW);
        jksSAMLPassWord = new String(decodedBytes, "UTF-8");
      }
      catch (UnsupportedEncodingException e)
      {
        FFDCFilter.processException(e, "ConcordProxyConfig: getJksSAMLPassWord", "Error to get JKS SAML PASSWORD");
      }

    }
    return jksSAMLPassWord;
  }
}
