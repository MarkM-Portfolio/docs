/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.util;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.MultiThreadedHttpConnectionManager;
import org.apache.commons.httpclient.protocol.Protocol;

import com.ibm.concord.viewer.platform.util.SelfSSLSocketFactory;
import com.ibm.json.java.JSONObject;

/**
 * Helper class to create and configure HttpClient(3.1) instance.
 * 
 */
public class HttpClientCreator
{
  private static final Logger LOG = Logger.getLogger(HttpClientCreator.class.getName());

  private static final String MAX_TOTAL = "maxTotal";

  private static final String MAX_PER_ROUTE = "maxPerRoute";

  private static final String SOCKET_TIMEOUT = "socketTimeout";

  private static final String CONNECTION_TIMEOUT = "connectionTimeout";

  private static final String CONN_MANAGER_TIMEOUT = "connManagerTimeout";

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
   * Initialize the configuration options.
   * 
   * @param config
   */
  public void config(JSONObject config)
  {
    String total = (String) config.get(MAX_TOTAL);
    String maxPerRoute = (String) config.get(MAX_PER_ROUTE);
    String soTimeoutStr = (String) config.get(SOCKET_TIMEOUT);
    String connTimeoutStr = (String) config.get(CONNECTION_TIMEOUT);
    String connMgrTimeoutStr = (String) config.get(CONN_MANAGER_TIMEOUT);

    maxTotal = (total != null) ? Integer.valueOf(total) : maxTotal;
    defaultMaxPerRoute = (maxPerRoute != null) ? Integer.valueOf(maxPerRoute) : defaultMaxPerRoute;
    socketTimeOut = (soTimeoutStr != null) ? Integer.valueOf(soTimeoutStr) : socketTimeOut;
    connectionTimeOut = (connTimeoutStr != null) ? Integer.valueOf(connTimeoutStr) : connectionTimeOut;
    connManagerTimeOut = (connMgrTimeoutStr != null) ? Integer.valueOf(connMgrTimeoutStr) : connManagerTimeOut;

    LOG.log(Level.FINER, "HttpClient parameters: " + SOCKET_TIMEOUT + "=" + socketTimeOut + " " + CONNECTION_TIMEOUT + "="
        + connectionTimeOut + " " + CONN_MANAGER_TIMEOUT + "=" + connManagerTimeOut + " " + MAX_TOTAL + "=" + maxTotal + " "
        + MAX_PER_ROUTE + "=" + defaultMaxPerRoute);
  }

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
