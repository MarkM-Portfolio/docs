/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.lcfiles.daemon.handlers;

import java.io.UnsupportedEncodingException;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpConnectionManager;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.MultiThreadedHttpConnectionManager;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.params.HttpClientParams;
import org.apache.commons.httpclient.protocol.Protocol;

import com.ibm.connections.httpClient.ServerToServerHttpClient;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.lcfiles.daemon.config.DocsDaemonConfig;
import com.ibm.docs.lcfiles.daemon.util.SelfSSLSocketFactory;

/**
 * Daemon thread being used to process handled Lotus Connections events.
 * 
 */
public class DaemonThread extends Thread
{

  private static final Logger LOG = Logger.getLogger(DaemonThread.class.getName());

  private static final String FILES_UPLOAD_URI_PREFIX = "/api/docsvr/lcfiles/";

  private static final String CCM_UPLOAD_URI_PREFIX = "/api/docsvr/ecm/";

  private static final String DOCS_UPLOAD_URI_POSTFIX = "/upload";

  private static final String DOCS_DELETE_URI_POSTFIX = "/delete";

  private static final int HTTPS_PORT_DEFAULT = 443;

  private boolean isStopped = false;

  private List<EventInfo> waitingEventList = new ArrayList<EventInfo>();

  /*
   * (non-Javadoc)
   * 
   * @see java.lang.Thread#start()
   */
  public void start()
  {
    try
    {
      isStopped = false;
      super.start();
    }
    catch (Throwable ex)
    {
      LOG.log(Level.WARNING, "Exception happens while starting this daemon thread", ex);
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see java.lang.Thread#run()
   */
  public void run()
  {
    DocsDaemonConfig config = null;
    HttpClient httpClient = null;
    try
    {
      config = DocsDaemonConfig.getInstance();

      StringBuilder configString = new StringBuilder("Docs server url:");
      if (config.isCloud())
      {// No token trace for on-premise!!!
        configString.append(config.getDocsServerUrl()).append(", s2sToken: ").append(config.getS2SToken());
      }
      configString.append(", j2c alias:").append(config.getJ2cAlias()).append(", isIgnoreEvent: ").append(config.isIgnoreEvent());
      LOG.log(Level.INFO, configString.toString());

      httpClient = getHttpClient(config);

      while (!isStopped)
      {
        try
        {
          List<EventInfo> eventList = new ArrayList<EventInfo>();
          synchronized (waitingEventList)
          {
            if (waitingEventList.isEmpty())
            {
              waitingEventList.wait();
            }
            if (!waitingEventList.isEmpty())
            {
              eventList.addAll(waitingEventList);
              waitingEventList.clear();
            }
          }

          processEvents(eventList, config, httpClient);
        }
        catch (Throwable e)
        {
          LOG.log(Level.WARNING, "Exception happens processing events", e);
        }
      }
    }
    catch (Throwable ex)
    {
      LOG.log(Level.WARNING, "Exception happens while initialize the event handler");
    }
  }

  /**
   * Stop the daemon thread.
   * 
   */
  public void kill()
  {
    isStopped = true;

    synchronized (waitingEventList)
    {
      waitingEventList.notifyAll();
    }
  }

  /**
   * Submit an event to the daemon thread, this event will be processed in this daemon thread.
   * 
   * @param event
   *          being submitted
   */
  public void submitEvent(EventInfo event)
  {
    if (isStopped)
    {
      LOG.log(Level.INFO, "The daemon thread has been stopped, so can not process the event");
      return;
    }

    try
    {
      synchronized (waitingEventList)
      {
        waitingEventList.add(event);
        waitingEventList.notifyAll();
      }
    }
    catch (Throwable ex)
    {
      LOG.log(Level.WARNING, "Exception happens while submitting the event", ex);
    }
  }

  /**
   * Generates the HTTP method being used to send request to Docs server.
   * 
   * @param userId
   * @param docId
   * @param config
   * @return
   */
  private HttpMethod generateMethod(EventInfo event, String userId, String docId, DocsDaemonConfig config)
  {
    StringBuffer url = new StringBuffer();

    url.append(config.getDocsServerUrl());
    if (DocsEventHandler.isFilesEvents(event.eventName))
    {
      url.append(FILES_UPLOAD_URI_PREFIX);
    }
    else
    {
      url.append(CCM_UPLOAD_URI_PREFIX);
    }

    url.append(docId);
    if (DocsEventHandler.isDraftDeleteEvents(event.eventName))
    {
      url.append(DOCS_DELETE_URI_POSTFIX);
    }
    else
    {
      url.append(DOCS_UPLOAD_URI_POSTFIX);
    }

    String parameters = DocsEventHandler.getRequestParameters(event.eventName);
    if (parameters != null && parameters.length() > 0)
    {
      url.append(parameters);
    }

    HttpMethod method = new PostMethod(url.toString());

    // always append the token, SC will always use it, Docs app may or may not use it depends on the LDAP for on-premise
    method.setRequestHeader("s2stoken", config.getS2SToken());
    if (userId != null)
    {
      method.setRequestHeader("onBehalfOf", userId);
    }

    String csrfTime = Long.toString(System.currentTimeMillis());
    String seed = userId + "@@" + csrfTime.substring(4, csrfTime.length() - 1) + "##";
    String token = generateMD5Id(seed);
    if (LOG.isLoggable(Level.FINE))
    {
      LOG.log(Level.FINE, "X-Csrf-Token:" + token + " X-Timestamp:" + csrfTime);
    }
    method.setRequestHeader("X-Csrf-Token", token);
    method.setRequestHeader("X-Timestamp", csrfTime);
    return method;
  }

  /**
   * Generates the HTTP client being used to send request to Docs server.
   * 
   * @param config
   * 
   * @return
   */
  private HttpClient getHttpClient(DocsDaemonConfig config)
  {
    HttpClient httpClient = null;
    HttpConnectionManager clientsManager = null;
    if (!config.isCloud())
    {
      httpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(config.getJ2cAlias());
      clientsManager = httpClient.getHttpConnectionManager();
      ((ServerToServerHttpClient) httpClient).set_authHeaderChecking(false);
    }
    else
    {
      try
      {
        URL docsURL = new URL(config.getDocsServerUrl());
        if ("https".equalsIgnoreCase(docsURL.getProtocol())) // enable https
        {
          Protocol.registerProtocol("https", new Protocol("https", new SelfSSLSocketFactory(), HTTPS_PORT_DEFAULT));
          LOG.info("SSL context initialized and HTTPS registered.");
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, "Docs server URL is invalid: " + config.getDocsServerUrl(), e);
        throw new IllegalArgumentException(e);
      }

      clientsManager = new MultiThreadedHttpConnectionManager();
      httpClient = new HttpClient(clientsManager);
    }

    HttpClientParams clientParams = httpClient.getParams();
    clientParams.setParameter("http.socket.timeout", config.getSocketTimeOut());
    clientParams.setParameter("http.connection.timeout", config.getConnectionTimeOut());
    clientParams.setParameter("http.connection-manager.timeout", config.getConnManagerTimeOut());
    clientsManager.getParams().setMaxTotalConnections(config.getMaxConnection());
    clientsManager.getParams().setDefaultMaxConnectionsPerHost(config.getMaxConnectionPerHost());
    return httpClient;
  }

  /**
   * Process the events: Send requests to Docs server, Docs will handle these requests and do something.
   * 
   * @param eventList
   * @param config
   * @param client
   */
  private void processEvents(List<EventInfo> eventList, DocsDaemonConfig config, HttpClient client)
  {
    int size = eventList != null ? eventList.size() : 0;
    for (int index = 0; index < size; index++)
    {
      EventInfo event = eventList.get(index);
      HttpMethod method = null;
      try
      {
        logEvent(event);

        String userId = event.actorId;
        String docId = event.itemId;
        if (userId != null && docId != null)
        {
          method = generateMethod(event, userId, docId, config);
          client.executeMethod(method);

          int nHttpStatus = method.getStatusCode();
          if (LOG.isLoggable(Level.FINE))
          {
            LOG.log(Level.FINE, "The status code of docs daemon request: " + method.getURI() + " with user " + userId + " is "
                + nHttpStatus);
          }
        }
      }
      catch (SocketTimeoutException ex)
      {
        LOG.log(Level.SEVERE, "SocketTimeoutException happens while sending request to Docs server.");
      }
      catch (Throwable ex)
      {
        LOG.log(Level.SEVERE, "Error happens while sending request to Docs server.", ex);
      }
      finally
      {
        if (method != null)
        {
          // Release the HTTP connection.
          method.releaseConnection();
        }
      }
    }
  }

  private String generateMD5Id(String eigenvalue)
  {
    try
    {
      return getHexString(MessageDigest.getInstance("MD5").digest(eigenvalue.getBytes()));
    }
    catch (NoSuchAlgorithmException e)
    {
      LOG.log(Level.WARNING, "Calculate MD5 ID failed, caused by no Java MD5 algorithm found.", e);
      return UUID.randomUUID().toString();
    }
    catch (UnsupportedEncodingException e)
    {
      LOG.log(Level.WARNING, "Calculate MD5 ID failed, caused by unsupported encoding.", e);
      return UUID.randomUUID().toString();
    }
  }

  private String getHexString(byte[] raw) throws UnsupportedEncodingException
  {
    byte[] HEX_CHAR_TABLE = { (byte) '0', (byte) '1', (byte) '2', (byte) '3', (byte) '4', (byte) '5', (byte) '6', (byte) '7', (byte) '8',
        (byte) '9', (byte) 'a', (byte) 'b', (byte) 'c', (byte) 'd', (byte) 'e', (byte) 'f' };

    byte[] hex = new byte[2 * raw.length];
    int index = 0;

    for (byte b : raw)
    {
      int v = b & 0xFF;
      hex[index++] = HEX_CHAR_TABLE[v >>> 4];
      hex[index++] = HEX_CHAR_TABLE[v & 0xF];
    }
    return new String(hex, "ASCII");
  }

  /**
   * Records the information of processed event into log file.
   * 
   * @param event
   */
  private void logEvent(EventInfo event)
  {
    if (LOG.isLoggable(Level.FINE))
    {
      LOG.log(Level.FINE, "logEvent:");

      StringBuffer buffer = new StringBuffer();
      buffer.append("Actor ID: " + event.actorId);
      buffer.append(", Container ID: " + event.containerId);
      buffer.append(", Event ID: " + event.eventId);
      buffer.append(", Event Name: " + event.eventName);
      buffer.append(", Event Type: " + event.eventTypeName);
      buffer.append(", Event Source: " + event.eventSourceName);
      buffer.append(", File ID: " + event.itemId);
      buffer.append(", File Name: " + event.itemName);

      LOG.log(Level.FINE, buffer.toString());
    }
  }
}
