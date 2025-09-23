package com.ibm.docs.viewer.external.repository.cmis.provider;

import org.apache.commons.httpclient.Cookie;

import com.ibm.docs.common.cmisproviders.SSOCookieAuthenticationProvider;
import com.ibm.docs.viewer.external.util.CookieHelper;

public class ViewerSSOCookieAuthenticationProvider extends SSOCookieAuthenticationProvider
{
  protected Cookie[] getAllCookies()
  {
    return CookieHelper.getAllCookies();
  }
}
