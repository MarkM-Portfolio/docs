package com.ibm.docs.viewer.automation.auth;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.codec.binary.Base64;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.util.EntityUtils;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.docs.viewer.automation.User;
import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig;

public class BasicLoginContext
{
  private Server server;

  private HttpClient httpClient;

  private static final Logger logger = Logger.getLogger(BasicLoginContext.class.getName());

  public BasicLoginContext(Server server, HttpClient httpClient)
  {
    super();
    this.server = server;
    this.httpClient = httpClient;
  }

  public void doLogin(User user) throws Exception
  {
    int reponseCode = -1;
    String basicAuth = user.getId() + ":" + user.getPassword();

    HttpEntity responseEntity = null;

    Exception loginException = null;
    URL url = null;
    try
    {
      url = new URL(new StringBuffer(server.getHost()).append(server.getLoginURI()).toString());
      HttpGet request = new HttpGet(url.toString());
      request.addHeader("Authorization", "Basic " + Base64.encodeBase64String(basicAuth.getBytes()));
      request.addHeader("User-Agent", ViewerAutomationConfig.getConfig().getUserAgent());

      HttpResponse response = httpClient.execute(request);
      responseEntity = response.getEntity();
      StatusLine status = response.getStatusLine();
      reponseCode = status.getStatusCode();

      if (reponseCode != 200)
      {
        loginException = new Exception("Failed to login.  Response code is " + reponseCode);
      }
    }
    catch (MalformedURLException e)
    {
      logger.log(Level.WARNING, "Failed to login to " + url + ".", e);
      loginException = e;
    }
    catch (ClientProtocolException e)
    {
      logger.log(Level.WARNING, "Failed to login to " + url + ".", e);
      loginException = e;
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, "Failed to login to " + url + ".", e);
      loginException = e;
    }
    finally
    {
      if (responseEntity != null)
      {
        try
        {
          EntityUtils.consume(responseEntity);
        }
        catch (IOException e)
        {
          logger.warning(e.getMessage());
        }
      }
      if (loginException != null)
      {
        throw loginException;
      }
    }
  }

}
