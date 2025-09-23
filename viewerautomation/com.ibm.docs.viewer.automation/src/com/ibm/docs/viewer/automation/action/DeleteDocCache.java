package com.ibm.docs.viewer.automation.action;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;

public class DeleteDocCache extends AbstractAction
{
  private String path;

  public DeleteDocCache(HttpClient client, Server server, String path)
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
    return new StringBuffer(server.getHost()).append("/v/proxy?type=delete_cache&relativePath=").append(path).toString();
  }

  @Override
  public Object getData()
  {
    return null;
  }

}
