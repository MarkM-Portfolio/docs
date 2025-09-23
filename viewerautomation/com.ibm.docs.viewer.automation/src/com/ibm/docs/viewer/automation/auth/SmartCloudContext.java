package com.ibm.docs.viewer.automation.auth;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.util.EntityUtils;

import com.ibm.docs.viewer.automation.ClientFactory;
import com.ibm.docs.viewer.automation.Server;
import com.ibm.docs.viewer.automation.User;
import com.ibm.docs.viewer.automation.config.ViewerAutomationConfig;
import com.ibm.json.java.JSONObject;

public class SmartCloudContext
{
  private Server server;

  private HttpClient httpClient;

  private static final Logger logger = Logger.getLogger(SmartCloudContext.class.getName());

  public SmartCloudContext(Server server, HttpClient httpClient)
  {
    super();
    this.server = server;
    this.httpClient = httpClient;
    // this.user = user;
  }

  public static String read(InputStream is)
  {
    BufferedReader reader = null;
    try
    {
      reader = new BufferedReader(new InputStreamReader(is));
      String line = null;
      StringBuilder builder = new StringBuilder();
      while ((line = reader.readLine()) != null)
      {
        builder.append(line);
      }
      return new String(builder.toString().getBytes(), "UTF-8");
    }
    catch (Throwable e)
    {
      e.printStackTrace();
    }
    finally
    {
      if (reader != null)
      {
        try
        {
          reader.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
    return null;
  }

  public void doLogin(User user) throws Exception
  {
    int responseCode = -1;

    JSONObject parameters = new JSONObject();
    parameters.put("username", user.getId());
    parameters.put("password", user.getPassword());
    parameters.put("login-form-type", "pwd");

    HttpEntity responseEntity = null;

    Exception loginException = null;
    URL url = null;
    try
    {
      url = new URL(new StringBuffer(server.getHost()).append(server.getLoginURI()).toString());
      HttpPost request = new HttpPost(url.toString());
      HttpEntity entity = ClientFactory.createUrlEncoderEntity(parameters);
      request.setEntity(entity);

      request.addHeader("User-Agent", ViewerAutomationConfig.getConfig().getUserAgent());
      HttpResponse response = httpClient.execute(request);
      responseEntity = response.getEntity();
      StatusLine status = response.getStatusLine();
      responseCode = status.getStatusCode();

      if (responseCode == 200)
      {
        logger.log(Level.INFO, "User info is post to server.");
      }
      else if (responseCode == 302)
      {
        logger.log(Level.WARNING, "Login with warnings. Response code is " + responseCode);
      }
      else
      {
        loginException = new Exception("Failed to login.  Response code is {0}" + responseCode);
        logger.log(Level.SEVERE, "Failed to login. Response code is {0}. Content is {1}.",
            new Object[] { responseCode, read(responseEntity.getContent()) });
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
