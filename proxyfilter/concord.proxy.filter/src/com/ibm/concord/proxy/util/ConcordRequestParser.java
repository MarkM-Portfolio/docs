/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.proxy.util;

import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.Cookie;

import com.ibm.concord.proxy.mbean.StaticClusterMgr;
import com.ibm.misc.BASE64Decoder;
import com.ibm.wsspi.http.channel.HttpRequestMessage;
import com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext;

public class ConcordRequestParser
{
  private static Logger logger = Logger.getLogger(ConcordRequestParser.class.getName());

  /*
   * any url to access a document document id is in url
   */
  private static Pattern PATTERN_DOCUMENT_APP_REQUEST = Pattern.compile("/.+/app/[^/]+/([^/]+)/([^/?]+).*");

  private static Pattern PATTERN_DOCUMENT_API_DOC_REQUEST = Pattern.compile("/.+/api/docsvr/([^/]+)/([^/]+).*");

  private static Pattern PATTERN_DOCUMENT_API_FRG_REQUEST = Pattern.compile("/.+/api/frgsvr/([^/]+)/([^/]+).*");

  private static Pattern PATTERN_DOCUMENT_API_JOB_REQUEST = Pattern.compile("/.+/api/job/([^/]+)/([^/]+).*");

  private static Pattern PATTERN_DOCUMENT_API_ACT_REQUEST = Pattern.compile("/.+/api/actsvr/([^/]+)/([^/]+).*");

  private static Pattern PATTERN_DOCUMENT_API_TSK_REQUEST = Pattern.compile("/.+/api/tasksvr/([^/]+)/([^/]+).*");

  private static Pattern[] PATTERN_DOCUMENT_LIST = { PATTERN_DOCUMENT_APP_REQUEST, PATTERN_DOCUMENT_API_DOC_REQUEST,
      PATTERN_DOCUMENT_API_FRG_REQUEST, PATTERN_DOCUMENT_API_JOB_REQUEST, PATTERN_DOCUMENT_API_ACT_REQUEST,
      PATTERN_DOCUMENT_API_TSK_REQUEST };

  private static Pattern PATTERN_STATIC_RESOURCE_REQEUST = Pattern.compile("/.+/static/([^/]+)/.+");

  /*
   * bayeux long poll request document id is in parameters
   */
  private static Pattern PATTERN_BAYEUX_REQUEST = Pattern.compile("/.+/coEditServlet.*");

  private static Pattern PATTERN_RTC4WEB_REQUEST = Pattern.compile("/.+/RTCServlet.*");

  private static Pattern PATTERN_DOCUMENT_APP_DRIVERSCALLBACK_REQUEST = Pattern.compile("/.+/driverscallback.*");

  private static final char COOKIE_NAME_SEP = '_';

  public static boolean isMonitoredAppName(String applicationName)
  {
    return applicationName.contains("IBMDocs");
  }

  public static boolean isMonitoredModuleName(String moduleName)
  {
    return moduleName.equalsIgnoreCase("com.ibm.concord.war.war");
  }

  private static boolean matchBayeuxURI(String uri)
  {
    Matcher matcher = PATTERN_BAYEUX_REQUEST.matcher(uri);
    return matcher.matches();
  }

  private static boolean matchRtc4WebURI(String uri)
  {
    Matcher matcher = PATTERN_RTC4WEB_REQUEST.matcher(uri);
    return matcher.matches();
  }

  private static boolean matchDriverCallbackURI(String uri)
  {
    Matcher matcher = PATTERN_DOCUMENT_APP_DRIVERSCALLBACK_REQUEST.matcher(uri);
    return matcher.matches();
  }

  public static boolean matchAppURI(String uri)
  {
    Matcher matcher = PATTERN_DOCUMENT_APP_REQUEST.matcher(uri);
    return matcher.matches();
  }

  public static String getBuildNumberFromURI(String uri)
  {
    Matcher matcher = PATTERN_STATIC_RESOURCE_REQEUST.matcher(uri);
    if (matcher.matches())
    {
      String buildNumber = matcher.group(1);
      return buildNumber;
    }
    return null;
  }

  private static String getDocumentIdFromURI(String uri)
  {
    for (int i = 0; i < PATTERN_DOCUMENT_LIST.length; i++)
    {
      Pattern p = PATTERN_DOCUMENT_LIST[i];
      Matcher matcher = p.matcher(uri);
      if (matcher.matches())
      {
        String repoId = matcher.group(1);
        String docId = matcher.group(2);
        return (repoId + COOKIE_NAME_SEP + docId);
      }
    }

    return null;
  }

  public static String getDocumentIdFromParam(HttpRequestMessage request)
  {
    String requestURI = request.getRequestURI();
    String repoId = null;
    String docId = null;
    if (matchRtc4WebURI(requestURI))
    {
      // look up document id from parameters
      repoId = request.getParameter("repository");
      docId = request.getParameter("uri");

    }
    else if (matchDriverCallbackURI(requestURI))
    {
      String state = request.getParameter("state");
      if (state != null)
      {
        logger.log(Level.INFO, "Got the parameter 'state' for driverscallback request: " + state);
        try
        {
          state = URLDecoder.decode(state, "UTF-8");
        }
        catch (UnsupportedEncodingException e)
        {
          logger.log(Level.SEVERE, "Error to decode string: ", e);
        }
        catch (Exception e)
        {
          logger.log(Level.SEVERE, "Error to decode string: ", e);
        }

        int index = state.indexOf("-");
        if (index > 0)
        {
          repoId = state.substring(0, index);
          docId = state.substring(index + 1);
          logger.log(Level.FINE, "Got the repository id: {0} and file id: {1} from request parameter 'state'.", new String[] { repoId,
              docId });
        }
        else
        {
          logger.log(Level.WARNING, "Incorrect state: " + state);
        }
      }
      else
      {
        repoId = request.getParameter("repository");
        docId = request.getParameter("file_id");
      }
    }
    if (repoId != null && docId != null)
    {
      return (repoId + COOKIE_NAME_SEP + docId);
    }
    return null;
  }

  public static String getDocumentIdFromRequest(HttpRequestMessage request)
  {
    String requestURI = request.getRequestURI();

    // match document related url
    String documentId = getDocumentIdFromURI(requestURI);
    if (documentId == null)
    {
      documentId = getDocumentIdFromParam(request);
    }

    return documentId;
  }

  /**
   * Check if the cookies is secure of the request, the cookie name is: repository id + "_" + document id. The value is: current server name
   * + ";" + old server name, the old server is the last server that serve the document, current server is the current server that serve the
   * document.
   * 
   * @param request
   *          specifies the HTTP request
   * @param docId
   *          is repository id + "_" + document id
   * @return true if the cookies is secure, false if it's not secure or does not exist
   */
  public static boolean isSecureSrvNamesCookie(HttpRequestMessage request, String docId)
  {
    if (request == null || docId == null)
    {
      return false;
    }
    try
    {
      String cookieName = URLEncoder.encode(docId, "UTF-8");
      Cookie cookie = request.getCookie(cookieName);
      if (cookie != null && cookie.getValue() != null)
      {
        return cookie.getSecure();
      }
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Failed to get the routing server from cookie.", e);
    }
    return false;
  }

  /**
   * Get the server names in cookie of the request, the cookie name is: repository id + "_" + document id. The value is: current server name
   * + ";" + old server name, the old server is the last server that serve the document, current server is the current server that serve the
   * document.
   * 
   * @param request
   *          specifies the HTTP request
   * @param docId
   *          is repository id + "_" + document id
   * @return full names of the servers, first element is the current server, second element is the old server
   */
  public static String[] getSrvNamesInCookie(HttpRequestMessage request, String docId)
  {
    String servers[] = new String[2];
    if (request == null || docId == null)
    {
      return servers;
    }
    try
    {
      String cookieName = URLEncoder.encode(docId, "UTF-8");
      Cookie cookie = request.getCookie(cookieName);
      if (cookie != null && cookie.getValue() != null)
      {
        String value = AESUtil.aesDecryptByString(cookie.getValue());
        int index = value.indexOf(";");
        if (index >= 0)
        {
          servers[0] = value.substring(0, index);
          servers[1] = value.substring(index + 1, value.length());
        }
        else
        {
          servers[0] = value;
          servers[1] = null;
        }
      }
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Failed to get the routing server from cookie.", e);
    }
    return servers;
  }

  public static Map<String, String> getDescMapFromFullName(String fullName)
  {
    if (fullName != null && !"".equals(fullName))
    {
      String cellName = null;
      String nodeName = null;
      String serverName = null;
      int index = fullName.indexOf("\\");
      if (index > 0)
      {
        cellName = fullName.substring(0, index);
        String partName = fullName.substring(index + 1, fullName.length());
        index = partName.indexOf("\\");
        if (index > 0)
        {
          nodeName = partName.substring(0, index);
          serverName = partName.substring(index + 1, partName.length());
        }
      }

      if (nodeName != null && !"".equals(nodeName) && serverName != null && !"".equals(serverName))
      {
        Map<String, String> descMap = new HashMap<String, String>();
        descMap.put("CELLNAME", cellName);
        descMap.put("NODENAME", nodeName);
        descMap.put("MEMBERNAME", serverName);
        return descMap;
      }
    }
    return null;
  }

  /**
   * Get description map of the server that the request being routed to. The routing server is included in the cookie of the request. The
   * name of the cookie is: repository id + "_" + document id.
   * 
   * @param serviceContext
   *          proxy service context of the request
   * @return the description map of the server that the request being routed to
   */
  public static Map<String, String> getRoutingSrvDescMap(HttpProxyServiceContext serviceContext)
  {
    try
    {
      HttpRequestMessage request = serviceContext.getRequest();
      String servers[] = getSrvNamesInCookie(request, getDocumentIdFromRequest(request));
      String fullName = servers != null && servers.length > 1 ? servers[0] : null;
      Map<String, String> descMap = getDescMapFromFullName(fullName);
      if (descMap != null)
      {
        String nodeName = (String) descMap.get("NODENAME");
        String serverName = (String) descMap.get("MEMBERNAME");

        if (nodeName != null && !"".equals(nodeName) && serverName != null && !"".equals(serverName))
        {
          String defaultCellName = serviceContext.getResourcePolicy().getCellName();
          if (StaticClusterMgr.isServerExists(defaultCellName, nodeName, serverName))
          {
            descMap.put("CELLNAME", defaultCellName);
            return descMap;
          }
          else
          {
            StringBuilder builder = new StringBuilder().append(ConcordProxyConstants.COMPONENT_NAME)
                .append(ConcordProxyConstants.RP_NO_SERVER_FOUND).append(": Did not find the server: ").append(fullName);
            logger.log(Level.WARNING, builder.toString());
            return null;
          }
        }
      }
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, "Failed to get the routing server from cookie.", e);
    }
    return null;
  }

  /*
   * test
   */
  public static void main(String[] args)
  {
    System.out.println("Test document url regular expression");
    String url = "/concord/apd/doc/repository/idxxxxxxxxxx/edit";
    testDocumentURIMatcher(url, false, null);

    long start = System.currentTimeMillis();
    for (int index = 0; index < 100000; index++)
    {
      getDocumentIdFromURI(url);
    }
    System.out.println("Spend time: " + (System.currentTimeMillis() - start));

    url = "/concord/app/doc/repository/idxxxxxxxxxx/edit";
    testDocumentURIMatcher(url, true, "repository/idxxxxxxxxxx");
    url = "/api/docsvr/repository/idxxxxxxxxxx/edit";
    testDocumentURIMatcher(url, false, null);
    url = "/concord/api/docsvr/repository/id1/edit";
    testDocumentURIMatcher(url, true, "repository/id1");
    url = "/concord/api/docsvr/repository/id1";
    testDocumentURIMatcher(url, true, "repository/id1");
    url = "/concord/api/docsvr/repository/id2/edit/revision";
    testDocumentURIMatcher(url, true, "repository/id2");

    System.out.println("----------------------------------");
    System.out.println("Test bayeux url regular expression");
    url = "/concord/coEditServlet/idxxxxxxxxxx/edit";
    testBayeuxURIMatcher(url, true);
    url = "/concord/test/coEditServlet1";
    testBayeuxURIMatcher(url, true);
    url = "/coEditServlet1";
    testBayeuxURIMatcher(url, false);
    url = "/concord/test/coEditServle";
    testBayeuxURIMatcher(url, false);

    testParseServerName();
  }

  private static void testDocumentURIMatcher(String uri, boolean shouldMatch, String expectedId)
  {
    System.out.println(uri);
    System.out.print("\t");
    // match document related uri
    String documentId = getDocumentIdFromURI(uri);

    PrintStream ps;
    String log;
    if (shouldMatch && expectedId.equals(documentId))
    {
      ps = System.out;
      log = "correct: " + documentId;
    }
    else if (!shouldMatch)
    {
      ps = System.out;
      log = "correct, not match";
    }
    else
    {
      ps = System.err;
      log = "incorrect!!!";
    }

    ps.println(log);

  }

  private static void testBayeuxURIMatcher(String uri, boolean shouldMatch)
  {
    System.out.println(uri);
    boolean isMatch = matchBayeuxURI(uri);
    if (shouldMatch && isMatch)
    {
      System.out.println("correct");
    }
    else if (!shouldMatch && !isMatch)
    {
      System.out.println("correct");
    }
    else
    {
      System.err.println("incorrect!!!");
    }
  }

  private static void testParseServerName()
  {
    String fullName = "concord114Cell02\\concord114Node02\\member01";
    String cellName = null;
    String nodeName = null;
    String serverName = null;
    int index = fullName.indexOf("\\");
    if (index > 0)
    {
      cellName = fullName.substring(0, index);

      fullName = fullName.substring(index + 1, fullName.length());
      index = fullName.indexOf("\\");
      if (index > 0)
      {
        nodeName = fullName.substring(0, index);
        serverName = fullName.substring(index + 1, fullName.length());
      }
    }
    System.out.println("cellName: " + cellName + ", nodeName: " + nodeName + ", serverName: " + serverName);
  }
}
