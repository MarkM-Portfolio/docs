/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.common.util;

import javax.servlet.http.Cookie;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public class URLConfig
{
  private static ThreadLocal<String> t_scheme = new ThreadLocal<String>();
  private static ThreadLocal<String> t_serverName = new ThreadLocal<String>();
  private static ThreadLocal<Integer> t_serverPort = new ThreadLocal<Integer>();
  private static ThreadLocal<String> t_contextPath = new ThreadLocal<String>();
  private static ThreadLocal<String> t_staticPath = new ThreadLocal<String>();
  private static ThreadLocal<Cookie[]> t_requestCookies = new ThreadLocal<Cookie[]>();
  private static ThreadLocal<String> t_code = new ThreadLocal<String>();
  private static ThreadLocal<String> t_file = new ThreadLocal<String>();
  private static ThreadLocal<String> t_requestID = new ThreadLocal<String>();
  private static ThreadLocal<String> t_responseID = new ThreadLocal<String>();
  private static ThreadLocal<String> t_icfilesContext = new ThreadLocal<String>();
  
  private String serverName;
  private String scheme;
  private String contextPath;
  private int port;
  private Cookie[] requestCookies;
  private String code;
  private String resquestID;
  private String responseID;
  private String icfilesContext;
  
  public static URLConfig toInstance() {
    URLConfig config = new URLConfig();
    config.scheme = URLConfig.getScheme();
    config.serverName = URLConfig.getServerName();
    config.port = URLConfig.getServerPort();
    config.contextPath = URLConfig.getContextPath();
    config.requestCookies = URLConfig.getRequestCookies();
    config.code = URLConfig.getRequestCode();
    config.resquestID = URLConfig.getRequestID();
    config.icfilesContext = URLConfig.getIcfilesContext();
    return config;
  }
  
  public static void fromInstance(URLConfig config) {
    if (config == null)
      return;
    URLConfig.setContextPath(config.contextPath);
    URLConfig.setScheme(config.scheme);
    URLConfig.setServerName(config.serverName);
    URLConfig.setServerPort(config.port);
    URLConfig.setRequestCookies(config.requestCookies);
    URLConfig.setRequestCode(config.code);
    URLConfig.setRequestID(config.resquestID);
    URLConfig.setResponseID(config.responseID);
    URLConfig.setIcfilesContext(config.icfilesContext);
  }
  
  public static String getScheme()
  {
    return t_scheme.get();
  }
  public static void setScheme(String scheme)
  {
    t_scheme.set(scheme);
  }
  public static String getServerName()
  {
    return t_serverName.get();
  }
  public static void setServerName(String name)
  {
    t_serverName.set(name);
  }
  public static int getServerPort()
  {
    return t_serverPort.get() == null ? 80 : t_serverPort.get();
  }
  public static void setServerPort(int port)
  {
    t_serverPort.set(port);
  }
  public static String getContextPath()
  {
    return t_contextPath.get();
  }
  public static void setContextPath(String path)
  {
    t_contextPath.set(path);
  }
  public static String getStaticPath()
  {
    return t_staticPath.get();
  }
  public static void setStaticPath(String path)
  {
    t_staticPath.set(path);
  }  
  public static Cookie[] getRequestCookies()
  {
    return t_requestCookies.get();
  }
  public static void setRequestCookies(Cookie[] cookies)
  {
    t_requestCookies.set(cookies);
  }
  public static void setRequestCode(String code)
  {
    t_code.set(code);
  }
  public static String getRequestCode()
  {
    return t_code.get();
  }
  
  public static void setRequestFile(String code)
  {
    t_file.set(code);
  }
  public static String getRequestFile()
  {
    return t_file.get();
  }  
  /**
   * @return the requestID
   */
  public static String getRequestID()
  {
    return t_requestID.get();
  }

  /**
   * @param requestID the requestID to set
   */
  public static void setRequestID(String requestID)
  {
    t_requestID.set(requestID);
  }

  /**
   * @return the responseID
   */
  public static String getResponseID()
  {
    return t_responseID.get();
  }

  /**
   * @param responseID the responseID to set
   */
  public static void setResponseID(String responseID)
  {
    t_responseID.set(responseID);
  }
  
  public static String getIcfilesContext()
  {
    return t_icfilesContext.get();
  }
  public static void setIcfilesContext(String icfilesContext)
  {
    t_icfilesContext.set(icfilesContext);
  }

  public static void remove()
  {
    t_contextPath.remove();
    t_serverPort.remove();
    t_serverName.remove();
    t_scheme.remove();
    t_requestCookies.remove();
    t_code.remove();
    t_file.remove();
    t_requestID.remove();
    t_responseID.remove();
    t_icfilesContext.remove();
  }

}
