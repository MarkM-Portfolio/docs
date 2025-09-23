/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.lc3.notification;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.namespace.QName;

import org.apache.abdera.model.Document;
import org.apache.abdera.model.Element;
import org.apache.abdera.model.ExtensibleElement;
import org.apache.abdera.parser.stax.FOMParser;
import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpState;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.io.IOUtils;

import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.docs.common.security.HttpClientCreator;
import com.ibm.concord.spi.exception.PreferenceException;
import com.ibm.concord.spi.notification.IPreference;
import com.ibm.docs.common.security.CookieHelper;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.connections.httpClient.CustomAuthClientRuntimeException;
import com.ibm.json.java.JSONObject;

public class ConnectionsPreferenceImpl implements IPreference
{
  private static final Logger LOG = Logger.getLogger(ConnectionsPreferenceImpl.class.getName());

  private static final String USER_AGENT = "User-Agent";

  private static final String S2S_METHOD_LIVE = "conn_live";
  
  private static final String TD_NAMESPACE = "urn:ibm.com/td";

  private static final String TD_PREFIX = "td";

  private static final String ERRORCODE = "errorCode";

  private static final String ERRORMESSAGE = "errorMessage";
  
  private static final QName QNAME_ERRORCODE = new QName(TD_NAMESPACE, ERRORCODE, TD_PREFIX);

  private static final QName QNAME_ERRORMESSAGE = new QName(TD_NAMESPACE, ERRORMESSAGE, TD_PREFIX);
  

  private String s2sToken;

  private String s2sMethod;

  private String bidiPreferenceUrl;

  private HttpClient httpClient;

  private String userAgent;

  public HashMap<String, String> getBidiPreferences(UserBean requester) throws PreferenceException
  {
    if (requester == null)
      throw new NullPointerException();
    HashMap<String, String> bidiPrefs = new HashMap<String, String>();

    if (bidiPreferenceUrl != null && !bidiPreferenceUrl.isEmpty())
    {
      LOG.log(Level.INFO, "REST API call will be issued on the following URL: " + bidiPreferenceUrl);

      GetMethod getMethod = new GetMethod(bidiPreferenceUrl);

      try
      {
        int nHttpStatus;
        String host = null;
        try
        {
          URL reqUrl = new URL(bidiPreferenceUrl);
          host = reqUrl.getHost();
        }
        catch (MalformedURLException e)
        {
          LOG.log(Level.WARNING, "Invalid URL of" + bidiPreferenceUrl, e);
        }

        if (isConnLive())
        {
          setRequestHeaders(getMethod, requester);
          nHttpStatus = httpClient.executeMethod(getMethod);
        }
        else
        {
          HttpState state = new HttpState();
          Cookie[] cookies = CookieHelper.getAllCookies(host);
          state.addCookies(cookies);
          nHttpStatus = httpClient.executeMethod(null, getMethod, state);
        }

        if (HttpStatus.SC_OK == nHttpStatus)
        {
          JSONObject jsonObjResult = null;
          jsonObjResult = JSONObject.parse(getMethod.getResponseBodyAsString());
          LOG.log(Level.FINEST, "REST API call returned " + jsonObjResult); // SPI!!
          if (jsonObjResult != null)
            jsonObjResult = (JSONObject) jsonObjResult.get("entry");
          if (jsonObjResult != null)
            jsonObjResult = (JSONObject) jsonObjResult.get("appData");
          if (jsonObjResult != null)
            jsonObjResult = (JSONObject) jsonObjResult.get("userSettings");
          if (jsonObjResult != null)
          {
            String isBidi = "false";
            String textDirection = "";
            if (jsonObjResult.get("bidiEnabled") != null)
            {
              isBidi = jsonObjResult.get("bidiEnabled").toString();
            }
            if (jsonObjResult.get("textDirection") != null)
            {
              textDirection = jsonObjResult.get("textDirection").toString();
              if ("CTX".equals(textDirection))
                textDirection = "contextual";
            }
            bidiPrefs.put(bidi_isBidi, isBidi);
            LOG.log(Level.INFO, "Bidi preference " + bidi_isBidi + " was retrieved and its value is " + isBidi);
            bidiPrefs.put(bidi_textDir, textDirection);
            LOG.log(Level.INFO, "Bidi preference " + bidi_textDir + " was retrieved and its value is " + textDirection);
          }

        }
        else
        {
          throw processError(getMethod);
        }
      }
      catch (IOException e)
      {
        throw new PreferenceException(PreferenceException.EC_BIDI_PREFERENCE_ERROR, new JSONObject(), e);
      }
      catch (CustomAuthClientRuntimeException e)
      {
        PreferenceException rae = processError(getMethod);
        rae.initCause(e);
        throw rae;
      }
      finally
      {
        if (getMethod != null)
        {
          getMethod.releaseConnection();
        }
      }
    }
    else
    {
      LOG.log(Level.WARNING, "The bidi preference url server is null!");
    }
    LOG.exiting(ConnectionsPreferenceImpl.class.getName(), "getBidiPreferences", bidiPrefs);

    return bidiPrefs;
  }
  
  protected String[] extractErrorMessage(Document<?> errorDocument) throws PreferenceException
  {
    String[] s = new String[2];

    Element errorCodeElement = ((ExtensibleElement) errorDocument.getRoot()).getExtension(QNAME_ERRORCODE);
    Element errorMessageElement = ((ExtensibleElement) errorDocument.getRoot()).getExtension(QNAME_ERRORMESSAGE);

    if (errorCodeElement == null || errorMessageElement == null)
    {
      throw new PreferenceException(new IllegalStateException("errorCodeElement or errorMessageElement is null"));
    }
    else
    {
      s[0] = errorCodeElement.getText();
      s[1] = errorMessageElement.getText();
      return s;
    }
  }
  
  /**
   * Processes the error that occurs when connecting to connections sever.
   * 
   * @param httpMethod
   * @throws PreferenceException
   */
  protected PreferenceException processError(HttpMethod httpMethod)
  {
    if (LOG.isLoggable(Level.WARNING))
    {
      LOG.log(Level.WARNING, "[server to server call Response Code]: {0}", httpMethod.getStatusCode());
    }

    int nErrorCode = PreferenceException.EC_BIDI_PREFERENCE_ERROR;
    String errorCode = "";
    String errorMsg = "";
    String errorBody = "";
    ByteArrayInputStream bais = null;
    Document<?> errorDocument = null;
    try
    {
      bais = new ByteArrayInputStream(IOUtils.toByteArray(httpMethod.getResponseBodyAsStream()));
      errorBody = bais.toString();
      errorDocument = new FOMParser().parse(bais);
      String[] s = extractErrorMessage(errorDocument);
      errorCode = s[0];
      errorMsg = s[1];

      if (LOG.isLoggable(Level.WARNING))
      {
        LOG.log(Level.WARNING, "[server to server call Response Body]: {0}", errorDocument.getRoot());
      }
    }
    catch (Throwable ex)
    {
      LOG.log(Level.WARNING, "[server to server call Response Body]: {0} {1} {2}", new Object[] { errorBody, ex.getMessage(), ex });
    }
    finally
    {
      if (bais != null)
      {
        try
        {
          bais.close();
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "Exception happens when close response body stream: ", e);
        }
      }
    }

    PreferenceException exception = new PreferenceException(nErrorCode, errorCode,errorMsg);
    return exception;
  }

  protected boolean isConnLive()
  {
    return S2S_METHOD_LIVE.equals(s2sMethod);
  }

  private String generateBidiPreferencesURL(String serverUrl)
  {
    StringBuffer sb = new StringBuffer(serverUrl);
    sb.append("/opensocial/basic/rest/people/@me/@self?fields=userSettings.textDirection&fields=userSettings.bidiEnabled");
    return sb.toString();
  }

  protected void setRequestHeaders(HttpMethod method, UserBean requester)
  {
    method.setRequestHeader(USER_AGENT, userAgent);
    if (S2S_METHOD_LIVE.equals(s2sMethod))
    {
      method.setRequestHeader("s2stoken", s2sToken);
      if (requester != null)
      {
        method.setRequestHeader("onBehalfOf", requester.getEmail());
      }
    }
    method.setRequestHeader("X-LConn-RunAs-For", "application");
  }

  public void init(JSONObject config)
  {
    try
    {
      String serverUrl = (String) config.get("server_url");
      bidiPreferenceUrl = generateBidiPreferencesURL(serverUrl);

      if (S2S_METHOD_LIVE.equals(config.get("s2s_method")))
      {
        LOG.log(Level.INFO, "Configured to use shared secret S2S mechanism for SmartCloud.");
        s2sMethod = (String) config.get("s2s_method");
        s2sToken = (String) config.get("s2s_token");
        if (s2sToken == null || s2sToken.isEmpty())
        {
          throw new IllegalStateException("Cannot find server to server token in config file.");
        }
      }

      userAgent = ConcordUtil.getUserAgent("Files");

      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(config);
      httpClient = httpClientCreator.create();
    }
    catch (Throwable e)
    {
      LOG.log(Level.WARNING, "Failed to initialize preference configuration", e);
    }
  }

}
