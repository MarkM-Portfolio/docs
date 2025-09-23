package com.ibm.docs.viewer.automation.action;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

public class GetViewerConfig extends AbstractAction
{
  private JSONObject config;
  
  public GetViewerConfig(HttpClient client, Server server)
  {
    super(client, server, RequestType.HTTP_GET);
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
    // nothing to do
  }

  @Override
  protected void postExec(ResponseData data) throws Exception
  {
    super.postExec(data);
    config = data.getDataAsJSON();
    String error = (String)config.get(ERROR_KEY);
    if(error != null)
    {
      throw new Exception(error);
    }
  }

  @Override
  protected String getURI()
  {
    return new StringBuffer(server.getHost()).append("/v/proxy?type=setting").toString();
  }

  @Override
  public JSONObject getData()
  {
    return config;
  }
}
