package com.ibm.docs.viewer.automation.action;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

public class QueryCacheStatus extends AbstractAction
{

  private String fileId;

  private String repositoryId;

  private JSONObject res;

  private String userAgent;

  public QueryCacheStatus(HttpClient client, Server server, String repositoryId, String fileId, String userAgent)
  {
    super(client, server, RequestType.HTTP_GET);
    this.fileId = fileId;
    this.repositoryId = repositoryId;
    this.userAgent = userAgent;
  }
  
  public QueryCacheStatus(HttpClient client, Server server, String repositoryId, String fileId)
  {
    super(client, server, RequestType.HTTP_GET);
    this.fileId = fileId;
    this.repositoryId = repositoryId;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
    if (userAgent != null)
    {
      request.setHeader("User-Agent", userAgent);
    }

  }

  @Override
  protected void postExec(ResponseData data) throws Exception
  {
    super.postExec(data);
    res = data.getDataAsJSON();
  }

  @Override
  protected String getURI()
  {
    return new StringBuffer(server.getHost()).append(server.getCtxRoot()).append("/api/cache/").append(repositoryId).append("/").append(fileId).toString();
  }

  @Override
  public JSONObject getData()
  {
    return res;
  }

}
