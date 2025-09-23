/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of HCL                              */
/*                                                                   */
/* Copyright HCL Technologies Ltd. 2021                       		 */
/*                                                                   */
/* US Government Users Restricted Rights                             */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.libre;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.MultiThreadedHttpConnectionManager;
import org.apache.commons.httpclient.protocol.Protocol;

import com.ibm.json.java.JSONObject;

/**
 * Helper class to create and configure HttpClient(3.1) instance.
 * 
 */
public class HttpClientCreator
{
  private static final Logger LOG = Logger.getLogger(HttpClientCreator.class.getName());

  private static int HTTPS_PORT_DEFAULT = 443;

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

  /**
   * Create a fully configured HttpClient instance.
   * 
   * @return HttpClient instance
   */
  public HttpClient create()
  {
    HttpClient httpClient = null;
    Protocol.registerProtocol("https", new Protocol("https", new SelfSSLSocketFactory(), HTTPS_PORT_DEFAULT));
    LOG.info("SSL context initialized and HTTPS registered.");

    MultiThreadedHttpConnectionManager connMngr = new MultiThreadedHttpConnectionManager();
    connMngr.getParams().setDefaultMaxConnectionsPerHost(maxTotal);
    connMngr.getParams().setMaxTotalConnections(defaultMaxPerRoute);
    httpClient = new HttpClient(connMngr);
    httpClient.getParams().setParameter("http.socket.timeout", socketTimeOut);
    httpClient.getParams().setParameter("http.connection.timeout", connectionTimeOut);
    httpClient.getParams().setParameter("http.conn-manager.timeout", connManagerTimeOut);
    return httpClient;
  }

}
