/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.repository.external.util;

import java.io.IOException;
import java.util.Collections;

import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.MultiThreadedHttpConnectionManager;

import com.ibm.docs.common.security.CookieHelper;
import com.ibm.docs.directory.beans.UserBean;

public class CustomizedHttpClient extends HttpClient
{
  /**
   * max connections in the connection pool
   */
  private int maxTotal = 100;

  /**
   * max connections for a specific route
   */
  private int defaultMaxPerRoute = 100;

  /**
   * time out for reading data from conversion server. TIME UNIT is millisecond.
   */
  private int socketTimeOut = 10000;

  /**
   * time out for establishing connection with conversion server. TIME UNIT is millisecond.
   */
  private int connectionTimeOut = 10000;

  /**
   * time out for get connection from connection pool of connection manager. TIME UNIT is millisecond.
   */
  private int connManagerTimeOut = 10000;

  HttpClient httpClient = null;

  public CustomizedHttpClient()
  {
    MultiThreadedHttpConnectionManager connMngr = new MultiThreadedHttpConnectionManager();
    connMngr.getParams().setDefaultMaxConnectionsPerHost(maxTotal);
    connMngr.getParams().setMaxTotalConnections(defaultMaxPerRoute);
    httpClient = new HttpClient(connMngr);
    httpClient.getParams().setParameter("http.socket.timeout", socketTimeOut);
    httpClient.getParams().setParameter("http.connection.timeout", connectionTimeOut);
    httpClient.getParams().setParameter("http.conn-manager.timeout", connManagerTimeOut);
  }

  public int executeMethod(HttpMethod method) throws HttpException, IOException
  {
    setRequestHeaders(method);
    int status = httpClient.executeMethod(method);
    return status;
  }

  protected void setRequestHeaders(HttpMethod method)
  {
    // TODO: replace below with customized authentication method code...
    StringBuilder cookieBuilder = new StringBuilder("");
    Cookie[] cookies = CookieHelper.getAllCookies();
    String split = "";
    for (Cookie cookie : cookies)
    {
      if (cookie != null)
      {
        cookieBuilder.append(split);
        cookieBuilder.append(cookie.toString());
        split = "; ";
      }
    }
    method.setRequestHeader("Cookie", cookieBuilder.toString());
  }
}