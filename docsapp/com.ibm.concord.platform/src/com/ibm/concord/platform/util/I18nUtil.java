/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2017. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.util;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.platform.Platform;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.helper.LanguageCookieHelper;
import com.ibm.json.java.JSONObject;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.members.UserProperty;

public class I18nUtil
{
  private static final Logger LOG = Logger.getLogger(I18nUtil.class.getName());

  /**
   * get the fall backed locale. Obsolete, use request.getLocale().toString() instead.
   * 
   * @param request
   * @return
   */
  public static String getFallbackLocale(HttpServletRequest request)
  {
    LOG.entering(I18nUtil.class.getName(), "getFallbackLocale");
    String locale = null;
    UserBean userBean = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    if(userBean != null) {
      locale = userBean.getProperty(UserProperty.PROP_LOCALE.toString()); 
    }
    if (locale == null)
    {
      locale = request.getLocale().toString(); 
      if(locale == null) {
        locale = "en-us";
      }
    }
    locale = locale.toLowerCase().replaceAll("_", "-");
    locale = LanguageCookieHelper.getFallbackLanguage(locale);
    LOG.log(Level.INFO, "Language I18n get:" + locale);
    LOG.exiting(I18nUtil.class.getName(), "getFallbackLocale", locale);
    return locale;
  }

  public static JSONObject getCustomizedFonts()
  {
    LOG.entering(I18nUtil.class.getName(), "getCustomizedFonts");
    JSONObject config = Platform.getConcordConfig().getSubConfig("CustomizedFonts");
    if (config == null)
    {
      JSONObject json = new JSONObject();
      json.put("enabled", "false");
      return json;
    }
    else
    {
      String enabled = (String) config.get("enabled");
      if ("false".equalsIgnoreCase(enabled))
      {
        JSONObject json = new JSONObject();
        json.put("enabled", "false");
        return json;
      }
    }
    LOG.exiting(I18nUtil.class.getName(), "getCustomizedFonts", config);
    return config;
  }

  public static String getProductName(HttpServletRequest request)
  {
    LOG.entering(I18nUtil.class.getName(), "getProductName");
    LOG.exiting(I18nUtil.class.getName(), "getProductName", "Docs");
    return "Docs";
  }
}
