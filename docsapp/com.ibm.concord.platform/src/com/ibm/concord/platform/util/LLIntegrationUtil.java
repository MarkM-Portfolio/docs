/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.util;

import com.ibm.concord.platform.Platform;
import com.ibm.json.java.JSONObject;

public class LLIntegrationUtil
{
  private final static String LOTUSLIVE_INTEGRATION_CONFIG = "lotusLiveIntegration";

  private final static String LOTUSLIVE_URL_CONFIG = "lotuslive_url";

  private final static String LOTUSLIVE_THEME_CONFIG = "themeConfig";

  private final static String LOTUSLIVE_THEME_ENABLE = "enabled";

  private final static String LOTUSLIVE_THEME_URL = "theme_url";

  private static String serverUrl = null;

  private static boolean themeEnabled = false;

  private static String themeUrl = "{static}/styles/css/base.css";

  private static boolean bLocalTheme = false;
  static
  {
    JSONObject config = Platform.getConcordConfig().getSubConfig(LOTUSLIVE_INTEGRATION_CONFIG);
    if (config != null)
    {
      serverUrl = (String) config.get(LOTUSLIVE_URL_CONFIG);
      JSONObject themeConfig = (JSONObject) config.get(LOTUSLIVE_THEME_CONFIG);
      if (themeConfig != null)
      {
        String strThemeEnabled = (String) themeConfig.get(LOTUSLIVE_THEME_ENABLE);
        if (strThemeEnabled != null)
          themeEnabled = Boolean.valueOf(strThemeEnabled).booleanValue();

        if (themeEnabled)
        {
          themeUrl = (String) themeConfig.get(LOTUSLIVE_THEME_URL);
          if (themeUrl.startsWith("{static}"))
          {
            bLocalTheme = true;
            StringBuffer sb = new StringBuffer(Platform.getServletContext().getContextPath());
            String staticRootPath = ConcordUtil.getStaticRootPath();
            String customCss = themeUrl.substring(8);
            themeUrl = sb.append(staticRootPath).append(customCss).toString();
          }
          else
            bLocalTheme = false;
        }
      }
    }

    if (!themeEnabled)
    {
      bLocalTheme = true;
    }

    if (bLocalTheme)
    {
      themeUrl = themeEnabled ? themeUrl : "";
    }
    else
    {
      themeUrl = serverUrl + themeUrl;
    }

  }

  public static String getServerUrl()
  {
    return serverUrl;
  }

  public static String getThemeUrl(String subscriberid)
  {
    return (bLocalTheme || subscriberid == null || "".equals(subscriberid)) ? themeUrl : themeUrl + "/" + subscriberid;
  }
}
