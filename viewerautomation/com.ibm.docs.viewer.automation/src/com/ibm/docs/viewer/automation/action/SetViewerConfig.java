package com.ibm.docs.viewer.automation.action;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.message.BasicNameValuePair;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

public class SetViewerConfig extends AbstractAction
{
  private JSONObject config;

  private static final Logger logger = Logger.getLogger(PostAttachment.class.getName());

  public SetViewerConfig(HttpClient client, Server server, JSONObject config)
  {
    super(client, server, RequestType.HTTP_POST);
    this.config = config;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
    List<NameValuePair> params = new ArrayList<NameValuePair>();
    params.add(new BasicNameValuePair("config", config.toString()));
    try
    {
      UrlEncodedFormEntity requestEntity = new UrlEncodedFormEntity(params);
      ((HttpPost) request).setEntity(requestEntity);
    }
    catch (UnsupportedEncodingException e)
    {
      logger.log(Level.WARNING, "Failed to init set viewer config request.  " + e.getMessage(), e);
    }
  }

  @Override
  protected void postExec(ResponseData data) throws Exception
  {
    super.postExec(data);

    JSONObject response = data.getDataAsJSON();
    if (response != null && (String) response.get(ERROR_KEY) != null)
    {
      throw new Exception((String) response.get(ERROR_KEY));
    }
  }

  @Override
  protected String getURI()
  {
    return new StringBuffer(server.getHost()).append("/v/proxy?type=setting").toString();
  }

  @Override
  public Object getData()
  {
    return null;
  }

}
