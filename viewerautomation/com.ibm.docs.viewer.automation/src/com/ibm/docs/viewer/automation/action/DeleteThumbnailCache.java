package com.ibm.docs.viewer.automation.action;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

public class DeleteThumbnailCache extends AbstractAction
{
  private String path;

  public DeleteThumbnailCache(HttpClient client, Server server, String path)
  {
    super(client, server, RequestType.HTTP_POST);
    this.path = path;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
    // TODO Auto-generated method stub

  }

  @Override
  protected String getURI()
  {
    String queryString = path;
    try
    {
      queryString = URLEncoder.encode(path, "UTF-8");
    }
    catch (UnsupportedEncodingException e)
    {
      e.printStackTrace();
    }
    return new StringBuffer(server.getHost()).append("/v/proxy?type=delete_thumbnails&relativePath=").append(queryString).toString();
  }

  @Override
  public Object getData()
  {
    return null;
  }

}
