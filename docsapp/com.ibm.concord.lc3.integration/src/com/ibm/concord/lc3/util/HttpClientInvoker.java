/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.lc3.util;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.Document;
import org.apache.abdera.model.Entry;
import org.apache.abdera.parser.ParseException;
import org.apache.abdera.parser.stax.FOMFactory;
import org.apache.abdera.parser.stax.FOMParser;
import org.apache.abdera.parser.stax.FOMParserOptions;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.methods.DeleteMethod;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.PutMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;

import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.docs.common.security.HttpClientCreator;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.connections.httpClient.ServerToServerHttpClientFactory;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

/**
 * 
 * @author litie@cn.ibm.com
 */
public class HttpClientInvoker
{

  private static final Logger LOG = Logger.getLogger(HttpClientInvoker.class.getName());

  private String j2cAlias;

  private String s2sMethod;

  private String s2sToken;

  private String userAgent;

  private static final String USER_AGENT = "User-Agent";

  private static final String S2S_METHOD_LIVE = "conn_live";

  public static final String APPLICATION_JSON = "application/json";

  public static final String APPLICATION_ATOM_XML = "application/atom+xml";
  
  private HttpClient client;

  public HttpClientInvoker(String alias)
  {
    j2cAlias = alias;
    client = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
  }

  public HttpClientInvoker(JSONObject config)
  {
    init(config);
  }

  private void init(JSONObject config)
  {
    if (S2S_METHOD_LIVE.equals(config.get("s2s_method")))
    {
      LOG.log(Level.INFO, "Configured to use shared secret S2S mechanism for ConnectionsLive.");
      s2sMethod = (String) config.get("s2s_method");
      s2sToken = (String) config.get("s2s_token");
      if (s2sToken == null || s2sToken.isEmpty())
      {
        throw new IllegalStateException("Cannot find server to server token in config file.");
      }
      
      HttpClientCreator httpClientCreator = new HttpClientCreator();
      httpClientCreator.config(config);
      client = httpClientCreator.create();
    }
    else
    {
      LOG.log(Level.INFO, "Configured to use J2C Alias S2S mechanism for Connections On Premise.");
      if (config.get("j2c_alias") == null)
      {
        throw new IllegalStateException("<j2c_alias> setting is missing from [Lotus Connection Files] repository adapter config.");
      }
      j2cAlias = (String) config.get("j2c_alias");
      
      client = ServerToServerHttpClientFactory.INSTANCE.getHttpClient(j2cAlias);
    }
    userAgent = ConcordUtil.getUserAgent("Connections");
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
      else
      {
        method.setRequestHeader("onBehalfOf", "bssadmin@us.ibm.com");
      }
    }
    else
    {
      if (requester != null)
      {
        method.setRequestHeader("X-LConn-RunAs", "userid=" + requester.getId()
            + ",excludeRole=admin, excludeRole=global-moderator, excludeRole=search-admin");
      }
    }
    method.setRequestHeader("X-LConn-RunAs-For", "application");
  }

  public Document sendGetMessage(UserBean requester, String url) throws AccessException
  {
    GetMethod getMethod = null;

    try
    {
      getMethod = new GetMethod(url);
      setRequestHeaders(getMethod, requester);
      client.executeMethod(getMethod);
      int status = getMethod.getStatusCode();
      if (status != 200)
      {
        throw new AccessException("unable to sent Get message to URL: " + url, status);
      }

      FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
      ro.setFilterRestrictedCharacters(true);
      ro.setAutodetectCharset(true);
      return new FOMParser().parse(getMethod.getResponseBodyAsStream(), ro);
    }
    catch (IOException e)
    {
      AccessException ae = new AccessException("unable to sent Get message to URL: " + url, 403);
      ae.initCause(e);
      throw ae;
    }
    catch (ParseException e)
    {
      LOG.warning("unable to prase the response message from: " + url);
      AccessException ae = new AccessException("unable to prase the response message from: " + url, 403);
      ae.initCause(e);
      throw ae;
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }
  }
  
  public boolean testGetMessage(UserBean requester, String url) throws AccessException
  {
    GetMethod getMethod = null;
    try
    {
      getMethod = new GetMethod(url);
      setRequestHeaders(getMethod, requester);
      client.executeMethod(getMethod);
      int status = getMethod.getStatusCode();
      return (status == 200);
    }
    catch (IOException e)
    {
      AccessException ae = new AccessException("unable to sent Get message to URL: " + url, 403);
      ae.initCause(e);
      throw ae;
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }
  }
  
  public Document sendPutMessage(UserBean requester, String url, Entry input) throws AccessException
  {
    PutMethod putMethod = null;

    try
    {
      putMethod = new PutMethod(url);
      setRequestHeaders(putMethod, requester);
      putMethod.setRequestEntity(new StringRequestEntity(input.toString(), APPLICATION_ATOM_XML, "UTF-8"));
      client.executeMethod(putMethod);

      int status = putMethod.getStatusCode();
      if (status < 200 || status >= 300)
      {
        throw new AccessException("Unable to send Put message to URL: " + url, status);
      }

      FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
      ro.setFilterRestrictedCharacters(true);
      return new FOMParser().parse(putMethod.getResponseBodyAsStream(), ro);
    }
    catch (ParseException e)
    {
      LOG.warning("unable to prase the response message from: " + url);
      AccessException ae = new AccessException("unable to prase the response message from: " + url, 403);
      ae.initCause(e);
      throw ae;
    }
    catch (IOException e)
    {
      AccessException ae = new AccessException("unable to sent Post message to URL: " + url, 403);
      ae.initCause(e);
      throw ae;
    }
    finally
    {
      if (putMethod != null)
      {
        putMethod.releaseConnection();
      }
    }
  }

  public Document sendPostMessage(UserBean requester, String url, Entry inputParam, boolean parseResp) throws AccessException
  {
    PostMethod postMethod = null;

    try
    {
      postMethod = new PostMethod(url);
      setRequestHeaders(postMethod, requester);
      postMethod.setRequestEntity(new StringRequestEntity(inputParam.toString(), APPLICATION_ATOM_XML, "UTF-8"));
      client.executeMethod(postMethod);

      int status = postMethod.getStatusCode();
      if (status != 200 && status != 201)
      {
        LOG.warning("unable to sent Post message to URL: " + url +" The status is: " + status);
        throw new AccessException("unable to sent Post message to URL: " + url, status);
      }

      if (parseResp)
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(true);
        return new FOMParser().parse(postMethod.getResponseBodyAsStream(), ro);
      }
    }
    catch (IOException e)
    {
      AccessException ae = new AccessException("unable to sent Post message to URL: " + url, 403);
      ae.initCause(e);
      throw ae;
    }
    catch (ParseException e)
    {
      LOG.warning("unable to prase the response message from: " + url);
      AccessException ae = new AccessException("unable to prase the response message from: " + url, 403);
      ae.initCause(e);
      throw ae;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
    }

    return null;
  }

  public void sendDeleteMessage(UserBean requester,String url) throws AccessException
  {
    DeleteMethod delMethod = null;
    try
    {
      delMethod = new DeleteMethod(url);
      setRequestHeaders(delMethod, requester);
      client.executeMethod(delMethod);

      int status = delMethod.getStatusCode();

      // HTTP/1.1 204 No Content
      if (status != 204)
      {
        LOG.warning("unable to sent Del message to URL: " + url +" The status is: " + status);
        throw new AccessException("unable to sent Del message to URL: " + url, status);
      }
    }
    catch (IOException e)
    {
      AccessException ae = new AccessException("unable to sent Del message to URL: " + url, 403);
      ae.initCause(e);
      throw ae;
    }
    finally
    {
      if (delMethod != null)
      {
        delMethod.releaseConnection();
      }
    }
  }

  public Document sendPostMessage(UserBean requester, String url, JSONObject inputParam, boolean parseResp) throws AccessException
  {
    PostMethod postMethod = null;

    try
    {
      postMethod = new PostMethod(url);
      setRequestHeaders(postMethod, requester);
      postMethod.setRequestEntity(new StringRequestEntity(inputParam.toString(), APPLICATION_JSON, "UTF-8"));
      client.executeMethod(postMethod);

      int status = postMethod.getStatusCode();
      if (status != 200 && status != 201)
      {
        LOG.warning("unable to sent Post message to URL: " + url +" The status is: " + status);
        throw new AccessException("unable to sent Post message to URL: " + url, status);
      }

      if (parseResp)
      {
        FOMParserOptions ro = new FOMParserOptions(new FOMFactory());
        ro.setFilterRestrictedCharacters(true);
        return new FOMParser().parse(postMethod.getResponseBodyAsStream(), ro);
      }
    }
    catch (IOException e)
    {
      AccessException ae = new AccessException("unable to sent Post message to URL: " + url, 403);
      ae.initCause(e);
      throw ae;
    }
    catch (ParseException e)
    {
      LOG.warning("unable to prase the response message from: " + url);
      AccessException ae = new AccessException("unable to prase the response message from: " + url, 403);
      ae.initCause(e);
      throw ae;
    }
    finally
    {
      if (postMethod != null)
      {
        postMethod.releaseConnection();
      }
    }

    return null;
  }

}
