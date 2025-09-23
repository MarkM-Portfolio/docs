package com.ibm.docs.viewer.automation.action;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

public class QueryAttachment extends AbstractAction
{

  private String uuid;

  private JSONObject res;

  public QueryAttachment(HttpClient client, Server server, String uuid)
  {
    super(client, server, RequestType.HTTP_GET);
    this.uuid = uuid;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {

  }

  @Override
  protected void postExec(ResponseData data) throws Exception
  {
    if (data.getCode() == 200)
      res = data.getDataAsJSON();
    else if (data.getCode() == 404)
    {
      res = new JSONObject();
      res.put("responseCode", "404");
    }
    else
      throw new UnexpectedHTTPCode("Response code is " + data.getCode() + ", expecting 200 and 404");

  }

  @Override
  protected String getURI()
  {
    return new StringBuffer(server.getHost()).append(server.getCtxRoot()).append("/api/tempstore/inotes/").append(uuid).toString();
  }

  @Override
  public Object getData()
  {
    return res;
  }

}
