package com.ibm.docs.viewer.automation.action;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

public class GetCellVariable extends AbstractAction
{
  private String value;

  private String cellVar;

  public GetCellVariable(HttpClient client, Server server, String key)
  {
    super(client, server, RequestType.HTTP_GET);
    cellVar = key;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
  }

  @Override
  protected void postExec(ResponseData data) throws Exception
  {
    super.postExec(data);
    value = data.getDataAsString();
  }

  @Override
  protected String getURI()
  {
    String queryString=cellVar;
    try
    {
      queryString = URLEncoder.encode(cellVar, "UTF-8");
    }
    catch (UnsupportedEncodingException e)
    {
      e.printStackTrace();
    }
    return new StringBuffer(server.getHost()).append("/v/proxy?type=query&cellVar=").append(queryString).toString();
  }

  @Override
  public String getData()
  {
    return value;
  }
}
