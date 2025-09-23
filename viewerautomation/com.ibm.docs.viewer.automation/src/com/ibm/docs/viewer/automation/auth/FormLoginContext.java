package com.ibm.docs.viewer.automation.auth;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
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

public class FormLoginContext
{
  private Server server;

  private HttpClient httpClient;

  private static final Logger logger = Logger.getLogger(FormLoginContext.class.getName());

  // private User user;

  public FormLoginContext(Server server, HttpClient httpClient)
  {
    super();
    this.server = server;
    this.httpClient = httpClient;
    // this.user = user;
  }

  public void doLogin(User user) throws Exception
  {
    int reponseCode = -1;

    JSONObject parameters = new JSONObject();
    parameters.put("j_username", user.getId());
    parameters.put("j_password", user.getPassword());

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
      reponseCode = status.getStatusCode();

      if (reponseCode != 302)
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
