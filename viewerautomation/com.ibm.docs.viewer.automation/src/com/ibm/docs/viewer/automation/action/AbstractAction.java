package com.ibm.docs.viewer.automation.action;

import java.io.IOException;
import java.io.InputStream;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.util.EntityUtils;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

/**
 * @author niebomin
 * 
 */
public abstract class AbstractAction implements IAction
{
  protected HttpClient client;

  protected Server server;

  // protected String endPoint;

  protected byte[] data;

  private RequestType type;

  private int successCode;

  public static final String ERROR_KEY = "error";

  private static final Logger logger = Logger.getLogger(AbstractAction.class.getName());

  private static final int DEFAULT_SUCCESSCODE = 200;

  public AbstractAction(HttpClient client, Server server, RequestType type)
  {
    this(client, server, type, DEFAULT_SUCCESSCODE);
  }

  public AbstractAction(HttpClient client, Server server, RequestType type, int successCode)
  {
    this.client = client;
    this.server = server;
    this.type = type;
    this.successCode = successCode;
  }

  /**
   * set up end point
   */
  protected abstract void initRequest(HttpUriRequest request);

  /**
   * get data or whatever
   */
  protected void postExec(ResponseData data) throws Exception
  {
    if (data.getCode() != this.successCode)
    {
      throw new UnexpectedHTTPCode("Error!  Response code is " + data.getCode() + ", expecting " + successCode);
    }
  }

  protected abstract String getURI();

  @Override
  public void execute() throws Exception
  {
    HttpUriRequest request = null;
    switch (type)
      {
        case HTTP_POST :
          request = new HttpPost(getURI());
          break;
        case HTTP_GET :
          request = new HttpGet(getURI());
          break;
        default:
          break;
      }

    HttpEntity entity = null;
    try
    {
      initRequest(request);

      HttpResponse response = client.execute(request);
      entity = response.getEntity();

      InputStream stream = null;
      String encoding = null;
      if (entity != null)
      {
        stream = entity.getContent();
        if (entity.getContentEncoding() != null)
          encoding = entity.getContentEncoding().getValue();
      }
      ResponseData data = new ResponseData(response.getStatusLine().getStatusCode(), stream, encoding);
      postExec(data);
    }
    catch (ClientProtocolException e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
      throw e;
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
      throw e;
    }
    catch (Exception e)
    {
      logger.log(Level.WARNING, e.getMessage(), e);
      throw e;
    }
    finally
    {
      if (entity != null)
      {
        try
        {
          EntityUtils.consume(entity);
        }
        catch (IOException e)
        {
          logger.log(Level.WARNING, e.getMessage(), e);
        }
      }
    }
  }

  @Override
  public abstract Object getData();

}
