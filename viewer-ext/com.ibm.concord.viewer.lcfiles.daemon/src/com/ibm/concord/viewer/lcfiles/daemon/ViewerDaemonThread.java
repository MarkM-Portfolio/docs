/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Viewer Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lcfiles.daemon;

import java.net.SocketTimeoutException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpConnectionManager;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.MultiThreadedHttpConnectionManager;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.params.HttpClientParams;
import org.apache.commons.httpclient.protocol.Protocol;

import com.ibm.concord.viewer.lcfiles.daemon.config.ViewerDaemonConfig;
import com.ibm.concord.viewer.lcfiles.daemon.utils.S2SCallHelper;
import com.ibm.concord.viewer.lcfiles.daemon.utils.SelfSSLSocketFactory;
import com.ibm.connections.httpClient.ServerToServerHttpClient;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;

public class ViewerDaemonThread extends Thread
{
  private static final Logger LOG = Logger.getLogger(ViewerDaemonThread.class.toString());

  private static final String VIEWER_UPLOAD_URI_POSTFIX = "/upload";

  public static final String USERNAME = "userid";

  public static final String DOCUMENT = "docId";

  public static final String EXTENSION = "extension";

  public static final String DISPLAYNAME = "displayname";

  public static final String EMAIL = "email";

  public static final String RELATIVEPATH = "relativepath";

  public static final String MODIFIED = "modified";

  public static final String MIMETYPE = "mimetype";

  public static final String RELATEDCOMMUNITYIDS = "relatedcommunityids";

  public static final String TITLE = "title";

  public static final String VERSION = "version";

  public static final String FILESIZE = "fileSize";

  public static final String REQUEST = "request";

  private boolean isStopped = false;

  private List<EventInfo> waitingEventList = new ArrayList<EventInfo>();

  public void start()
  {
    try
    {
      isStopped = false;
      super.start();
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exception happens while starting this daemon thread", ex);
    }
  }

  /**
   * Records the information of processed event into log file.
   * 
   * @param event
   */
  private void logEvent(EventInfo event)
  {
    if(LOG.isLoggable(Level.FINE))
    {
      StringBuffer buffer = new StringBuffer();
      buffer.append("logEvent : ");
      buffer.append("Actor ID: " + event.actorId);
      buffer.append(", Email ID: " + event.actorEmail);
      buffer.append(", DisplayName: " + event.actorName);
      buffer.append(", File Extension: " + event.extention);
      buffer.append(", Document Id: " + event.docId);
      buffer.append(", File Relative Path: " + event.relativePath);
      buffer.append(", Event Date: " + event.modified);
      buffer.append(", Mime Type: " + event.mimetype);
      buffer.append(", Title: " + event.title);
      buffer.append(", Version: " + event.version);
      buffer.append(", FileSize: " + event.fileSize);
      buffer.append(", EventType: " + event.request.name());
      LOG.log(Level.FINE, buffer.toString());
    }
  }

  /**
   * Generates the HTTP client being used to send request to Viewer server.
   * 
   * @param config
   * 
   * @return
   */
  private HttpClient getHttpClient(ViewerDaemonConfig config)
  {
    HttpClient httpClient = null;
    HttpConnectionManager clientsManager = null;
    if (!config.isSmartCloud())
    {
      httpClient = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(config.getJ2cAlias());
      clientsManager = httpClient.getHttpConnectionManager();
      ((ServerToServerHttpClient) httpClient).set_authHeaderChecking(false);
    }
    else
    {
      Protocol.registerProtocol("https", new Protocol("https", new SelfSSLSocketFactory(), 443));
      LOG.info("SSL context initialized and HTTPS registered.");

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

  private PostMethod generateMethod(EventInfo eventInfo, ViewerDaemonConfig config)
  {
    if (eventInfo.docId == null || eventInfo.modified == null || eventInfo.repoId == null)
    {
      throw new IllegalArgumentException("DocId, LastModified and RepositoryId cannot be null.");
    }

    StringBuffer url = new StringBuffer();

    url.append(config.getViewerServerUrl());
    url.append(VIEWER_UPLOAD_URI_POSTFIX);
    url.append("/").append(eventInfo.repoId);
    url.append("/").append(eventInfo.docId);

    PostMethod method = new PostMethod(url.toString());

    method.setRequestHeader("X-LConn-RunAs", "userid=" + eventInfo.actorId
        + ",excludeRole=admin, excludeRole=global-moderator, excludeRole=search-admin");

    method.addParameter(MODIFIED, eventInfo.modified);

    if (eventInfo.relativePath != null)
    {
      method.addParameter(RELATIVEPATH, eventInfo.relativePath);
    }
    if (eventInfo.actorName != null)
    {
      method.addParameter(DISPLAYNAME, eventInfo.actorName);
    }
    if (eventInfo.actorEmail != null)
    {
      method.addParameter(EMAIL, eventInfo.actorEmail);
    }
    if (eventInfo.extention != null)
    {
      method.addParameter(EXTENSION, eventInfo.extention);
    }
    if (eventInfo.title != null)
    {
      method.addParameter(TITLE, eventInfo.title);
    }
    if (eventInfo.fileSize != null)
    {
      method.addParameter(FILESIZE, eventInfo.fileSize);
    }
    if (eventInfo.request != null)
    {
      method.addParameter(REQUEST, eventInfo.request.name());
    }
    if (eventInfo.version != null)
    {
      method.addParameter(VERSION, eventInfo.version);
    }
    if (eventInfo.mimetype != null)
    {
      method.addParameter(MIMETYPE, eventInfo.mimetype);
    }
    if (eventInfo.actorId == null)
    {
      eventInfo.actorId = "s2sCall.createThumbnail";
    }
    if (eventInfo.relatedCommunityIds != null)
    {
      method.addParameter(RELATEDCOMMUNITYIDS, eventInfo.relatedCommunityIds);
    }
    method.addParameter(USERNAME, eventInfo.actorId);
    method.setRequestHeader("onBehalfOf", eventInfo.actorId);

    if (S2SCallHelper.getToken() != null)
    {
      // In SmartCloud, the TAI provided by AC requires non-encoded token.
      if (ViewerDaemonConfig.getInstance().isSmartCloud())
      {
        method.setRequestHeader(S2SCallHelper.CONFIG_S2S_NAME, S2SCallHelper.getToken());
      } // In On-premise, auth filter provided by viewer itself requires encoded token.
      else
      {
        method.setRequestHeader(S2SCallHelper.CONFIG_S2S_NAME, S2SCallHelper.getEncodedToken());
      }
    }

    // method.addParameter("dynamicToken", generateToken(eventInfo.docId, eventInfo.modified));
    method.setRequestHeader("X-LConn-RunAs-For", "application");

    return method;
  }

  String generateToken(String docId, String modified)
  {
    String key = docId + modified;
    try
    {
      byte[] rawMD5 = MessageDigest.getInstance("MD5").digest(key.getBytes());

      StringBuffer value = new StringBuffer();
      for (int i = 0; i < rawMD5.length; i++)
      {
        String hex = Integer.toHexString(0xFF & rawMD5[i]);
        if (hex.length() == 1)
        {
          value.append('0');
        }
        value.append(hex);
      }
      // LOG.log(Level.FINER, "Dynamic token of [" + key + "]: " + value.toString());
      return value.toString();
    }
    catch (NoSuchAlgorithmException e)
    {
      LOG.log(Level.SEVERE, "Can not find Java MD5 algorithm, hash cache descriptor directory failed. {0}", e);
      throw new IllegalArgumentException(e);
    }
  }

  /**
   * Process the events: Send requests to Viewer server, Viewer will handle these requests and do something.
   * 
   * @param eventList
   */
  private void processEvents(List<EventInfo> eventList, ViewerDaemonConfig config, HttpClient client)
  {
    int size = eventList != null ? eventList.size() : 0;
    for (int index = 0; index < size; index++)
    {
      EventInfo event = eventList.get(index);
      HttpMethod method = null;
      try
      {
        logEvent(event);

        String docId = event.docId;
        String userId = event.actorId;
        if (docId != null)
        {
          method = generateMethod(event, config);
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
        LOG.log(Level.WARNING, "SocketTimeoutException happens while sending request to Viewer server.");
      }
      catch (Exception ex)
      {
        LOG.log(Level.WARNING, "Error happens while sending request to Viewer server.", ex);
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

  public void run()
  {
    ViewerDaemonConfig config = null;
    HttpClient httpClient = null;
    try
    {
      config = ViewerDaemonConfig.getInstance();
      StringBuilder configString = new StringBuilder("Viewer server url:");
      if (config.isSmartCloud())
      {
        configString.append(config.getViewerServerUrl());
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
              eventList.add(waitingEventList.remove(0));
            }
          }
          processEvents(eventList, config, httpClient);
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "Exception happens processing events", e);
        }
      }
    }
    catch (Exception ex)
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
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exception happens while submitting the event", ex);
    }
  }
}
