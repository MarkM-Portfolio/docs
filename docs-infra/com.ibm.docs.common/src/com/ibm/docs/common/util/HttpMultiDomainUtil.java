/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.util;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.misc.BASE64Decoder;

/**
 * @author linfeng_li
 * 
 */
public class HttpMultiDomainUtil
{

  private static final Logger LOG = Logger.getLogger(HttpMultiDomainUtil.class.getName());

  private static final Pattern IE_PATTERN = Pattern
      .compile("([a-zA-Z0-9\\;\\ \\.\\(\\/\\,\\:\\-]*)(MSIE |Trident.*rv[:])([0-9\\.]+)([a-zA-Z0-9\\)\\ \\;\\.\\/\\-]*)");

  private static final Pattern CHROME_PATTERN = Pattern
      .compile("([a-zA-Z0-9\\;\\ \\.\\(\\)\\/\\,\\:\\_\\-\\+\\-]*)(Chrome[\\/])([0-9\\.]*)([a-zA-Z0-9\\ \\.\\(\\)\\/]*)");

  private static final Pattern FIREFOX_PATTERN = Pattern
      .compile("([a-zA-Z0-9\\;\\ \\.\\(\\)\\/\\,\\:\\_\\-]*)(Firefox[\\/]+)([0-9\\.]*)([a-zA-Z0-9\\ \\.\\(\\)]*)");

  private static final Pattern OPERA_PATTERN = Pattern
      .compile("([a-zA-Z0-9\\;\\ \\.\\(\\)\\/\\,\\:\\_\\-]*)(Opera |Version[\\/])([0-9\\.]*)([a-zA-Z0-9\\ \\.\\(\\)]*)");

  private static final Pattern SAFARI_PATTERN = Pattern
      .compile("([a-zA-Z0-9\\;\\ \\.\\(\\)\\/\\,\\:\\_\\-\\+\\-]*)(Version[\\/])([0-9\\.]*)([a-zA-Z0-9\\ \\.\\(\\)]*)(Safari[\\/])([0-9\\.]*)");

  private static final Pattern EDGE_PATTERN = Pattern
      .compile("([a-zA-Z0-9\\;\\ \\.\\(\\)\\/\\,\\:\\_\\-\\+\\-]*)(Edge[\\/])([0-9\\.]*)([a-zA-Z0-9\\ \\.\\(\\)\\/]*)");

  private static final Pattern ELECTRON_PATTERN = Pattern
      .compile("([a-zA-Z0-9\\;\\ \\.\\(\\)\\/\\,\\:\\_\\-\\+\\-]*)(Electron[\\/])([0-9\\.]*)([a-zA-Z0-9\\ \\.\\(\\)\\/]*)");
  
  private static final String FIREFOX_Version_Content_Security = "36";

  private static final String CHROME_Version_Content_Security = "39";

  private static final String SAFARI_Version_Content_Security = "10";

  private static final String OPERA_Version_Content_Security = "26";

  private static final String Content_Policy = "Content-Security-Policy";

  private static final String X_Frame_Options = "X-Frame-Options";

  private static final String blankRef = " ";

  private static String semicolon = ";";

  public static String ELECTRON_Id = "Note-Request-Id";

  public static String ELECTRON_TOKEN = "docsrte1";

  /**
   * such as: "default-src", "script-src", "style-src", "img-src" , "connect-src" , "font-src" , "object-src" , "media-src" , "frame-src" ,
   * "sandbox" , "report-uri" , "child-src" , "form-action" , "frame-ancestors" , "plugin-types"
   */

  /**
   * appendResponseHeader
   * 
   * @param request
   * @param response
   */
  public static void appendIFrameResponseHeader(HttpServletRequest request, HttpServletResponse response,JSONArray domainList)
  {
    LOG.entering(HttpMultiDomainUtil.class.getName(), "appendIFrameResponseHeader");
    String userAgentStr = request.getHeader("User-Agent");
    LOG.log(Level.FINEST, "appendResponseHeader userAgentStr : " + userAgentStr);
    JSONObject versionJsonObject = getBrowserInfo(userAgentStr);
    String browserType = (String) versionJsonObject.get("name");
    String browserVersion = (String) versionJsonObject.get("version");
    String accessUri = blankRef;
    if(domainList != null)
    {
      for (int i = 0; i < domainList.size(); i++)
      {
        String domainStr = (String) domainList.get(i);
        if (!accessUri.contains(domainStr))
        {
          accessUri += domainList.get(i) + blankRef;
        }
      }
    }
    LOG.log(Level.FINEST, "appendResponseHeader browserType : " + browserType + " , browserVersion : " + browserVersion + " , accessUri : "
        + accessUri);
    if (accessUri != null && !blankRef.equals(accessUri))
    {
      if (browserType != null && browserVersion != null)
      {
        if (BrowserConstants.BROWSER_IE.equals(browserType))
        {
          addXFrameOptions(response,domainList);
        }
        else if (BrowserConstants.BROWSER_FIREFOX.equals(browserType))
        {
          if (compareVersions(browserVersion, FIREFOX_Version_Content_Security) >= 0)
          {
            addContentPolicy(response, accessUri);
          }
          else
          {
            addXFrameOptions(response, domainList);
          }
        }
        else if (BrowserConstants.BROWSER_OPERA.equals(browserType))
        {
          if (compareVersions(browserVersion, OPERA_Version_Content_Security) >= 0)
          {
            addContentPolicy(response, accessUri);
          }
          else
          {
            addXFrameOptions(response, domainList);
          }
        }
        else if (BrowserConstants.BROWSER_SAFARI.equals(browserType))
        {
          if (compareVersions(browserVersion, SAFARI_Version_Content_Security) >= 0)
          {
            addContentPolicyForSafari(response, accessUri);
          }
          else
          {
            addXFrameOptions(response, domainList);
          }
        }
        else if (BrowserConstants.BROWSER_CHROME.equals(browserType))
        {
          if (compareVersions(browserVersion, CHROME_Version_Content_Security) >= 0)
          {
            addContentPolicy(response, accessUri);
          }
          else
          {
            addXFrameOptions(response, domainList);
          }
        }
        else if (BrowserConstants.BROWSER_EDGE.equals(browserType))
        {
          addXFrameOptions(response, domainList);
        }
        else if (BrowserConstants.BROWSER_ELECTRON.equals(browserType))
        {
          addForElectron(request, response, accessUri);
        }
      }
      else
      {
        addXFrameOptions(response, domainList);
      }
    }
    else
    {
      addXFrameOptions(response, domainList);
    }
    LOG.exiting(HttpMultiDomainUtil.class.getName(), "appendIFrameResponseHeader");
  }

  /**
   * addXFrameOptions
   * 
   * @param response
   * @param domainList 
   */
  private static void addXFrameOptions(HttpServletResponse response, JSONArray domainList)
  {
    LOG.entering(HttpMultiDomainUtil.class.getName(), "addXFrameOptions");
    if (domainList != null && domainList.size() != 0)
    {
      /**
       * allow self same original(file) to use viewer app 
       * 
       * response.addHeader(X_Frame_Options, BrowserConstants.ALLOWFROM + blankRef + domainList.get(0));
       */
      LOG.log(Level.FINEST, "allow self same original to use viewer app");
    }
    else
    {
      response.addHeader(X_Frame_Options, BrowserConstants.SAMEORIGINAL);
    }
    LOG.exiting(HttpMultiDomainUtil.class.getName(), "addXFrameOptions");
  }

  /**
   * getPolicyStr
   * 
   * @return
   */
  private static String getPolicyStr(String accessUri)
  {
    return BrowserConstants.FRAME_ANCESTORS + blankRef + accessUri + semicolon;
  }

  /**
   * addContentPolicy
   * 
   * @param response
   */
  private static void addContentPolicy(HttpServletResponse response, String accessUri)
  {
    LOG.entering(HttpMultiDomainUtil.class.getName(), "addContentPolicy");
    response.addHeader(Content_Policy, getPolicyStr(accessUri));
    LOG.exiting(HttpMultiDomainUtil.class.getName(), "addContentPolicy");
  }

  /**
   * addContentPolicyForSafari
   * 
   * @param response
   */
  private static void addContentPolicyForSafari(HttpServletResponse response, String accessUri)
  {
    LOG.entering(HttpMultiDomainUtil.class.getName(), "addContentPolicyForSafari");
    response.addHeader(Content_Policy, getPolicyStr(accessUri));
    LOG.exiting(HttpMultiDomainUtil.class.getName(), "addContentPolicyForSafari");
  }
  
  /**
   * getBrowserInfo
   * 
   * @param userAgentStr
   */
  public static JSONObject getBrowserInfo(String userAgentStr)
  {
    LOG.entering(HttpMultiDomainUtil.class.getName(), "getBrowserInfo with user agent str : " + userAgentStr);
    String browserName = null;
    String browserVersion = null;
    Pattern VERSION_PATTERN = null;
    if (userAgentStr.indexOf(BrowserConstants.BROWSER_IE) > -1 || userAgentStr.indexOf(BrowserConstants.BROWSER_TRIDENT) > -1)
    {
      browserName = BrowserConstants.BROWSER_IE;
      VERSION_PATTERN = IE_PATTERN;
    }
    else if (userAgentStr.indexOf(BrowserConstants.BROWSER_SAFARI) > -1 && userAgentStr.indexOf(BrowserConstants.BROWSER_CHROME) == -1)
    {
      browserName = BrowserConstants.BROWSER_SAFARI;
      VERSION_PATTERN = SAFARI_PATTERN;
    }
    else if (userAgentStr.indexOf(BrowserConstants.BROWSER_CHROME) > -1 && userAgentStr.indexOf(BrowserConstants.BROWSER_EDGE) == -1
        && userAgentStr.indexOf(BrowserConstants.BROWSER_ELECTRON) == -1)
    {
      browserName = BrowserConstants.BROWSER_CHROME;
      VERSION_PATTERN = CHROME_PATTERN;
    }
    else if (userAgentStr.indexOf(BrowserConstants.BROWSER_OPERA) > -1)
    {
      browserName = BrowserConstants.BROWSER_OPERA;
      VERSION_PATTERN = OPERA_PATTERN;
    }
    else if (userAgentStr.indexOf(BrowserConstants.BROWSER_EDGE) > -1)
    {
      browserName = BrowserConstants.BROWSER_EDGE;
      VERSION_PATTERN = EDGE_PATTERN;
    }
    else if (userAgentStr.indexOf(BrowserConstants.BROWSER_FIREFOX) > -1 && userAgentStr.indexOf(BrowserConstants.BROWSER_OPERA) == -1)
    {
      browserName = BrowserConstants.BROWSER_FIREFOX;
      VERSION_PATTERN = FIREFOX_PATTERN;
    }
    else if (userAgentStr.indexOf(BrowserConstants.BROWSER_ELECTRON) > -1)
    {
      browserName = BrowserConstants.BROWSER_ELECTRON;
      VERSION_PATTERN = ELECTRON_PATTERN;
    }
    if (VERSION_PATTERN != null)
    {
      LOG.log(Level.FINEST, "getBrowserInfo with matcher : " + VERSION_PATTERN);
      Matcher versionMatcher = VERSION_PATTERN.matcher(userAgentStr);
      try
      {
        if (versionMatcher.matches())
        {
          browserVersion = versionMatcher.group(3);
        }
      }
      catch (Exception e)
      {
        browserVersion = "";
        LOG.log(Level.WARNING, "Exception happens while match user agent", e);
      }
    }

    JSONObject versionJsonObject = new JSONObject();
    versionJsonObject.put("name", browserName);
    versionJsonObject.put("version", browserVersion);
    LOG.exiting(HttpMultiDomainUtil.class.getName(), "getBrowserInfo with result : " + versionJsonObject);
    return versionJsonObject;
  }

  /**
   * compareVersions
   * 
   * @param version1
   * @param version2
   * @return
   */
  public static int compareVersions(String version1, String version2)
  {
    LOG.entering(HttpMultiDomainUtil.class.getName(), "compareVersions");
    String[] levels1 = version1.split("\\.");
    String[] levels2 = version2.split("\\.");
    int length = Math.max(levels1.length, levels2.length);
    for (int i = 0; i < length; i++)
    {
      Integer v1 = i < levels1.length ? Integer.parseInt(levels1[i]) : 0;
      Integer v2 = i < levels2.length ? Integer.parseInt(levels2[i]) : 0;
      int compare = v1.compareTo(v2);
      if (compare != 0)
      {
        LOG.exiting(HttpMultiDomainUtil.class.getName(), "compareVersions with result : " + compare);
        return compare;
      }
    }
    LOG.exiting(HttpMultiDomainUtil.class.getName(), "compareVersions with result : " + 0);
    return 0;
  }

  /**
   * @param request HttpServletRequest 
   * @param response HttpServletResponse 
   * @param accessUri access domain list 
   */
  private static void addForElectron(HttpServletRequest request, HttpServletResponse response, String accessUri)
  {
    String noteRequestId = request.getHeader(ELECTRON_Id);
    if (StringUtils.isNotEmpty(noteRequestId))
    {
      String noteRequestToken = null;
      try
      {
        noteRequestToken = new String(new BASE64Decoder().decodeBuffer(noteRequestId));
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "Exception happens while decode token of Electron Note", e);
      }
      if (StringUtils.isNotEmpty(noteRequestToken) && noteRequestToken.equals(ELECTRON_TOKEN))
      {
        LOG.log(Level.FINEST, "disable content policy with Electron Note");
      }
      else
      {
        addContentPolicy(response, accessUri);
      }
    }
    else
    {
      addContentPolicy(response, accessUri);
    }
  }
}
