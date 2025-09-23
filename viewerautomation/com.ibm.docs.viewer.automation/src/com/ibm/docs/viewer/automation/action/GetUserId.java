package com.ibm.docs.viewer.automation.action;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class GetUserId extends AbstractAction
{
  private String userId;

  public GetUserId(HttpClient client, Server server)
  {
    super(client, server, RequestType.HTTP_GET);
  }

  public String getData()
  {
    return userId;
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
    JSONObject json = data.getDataAsJSON();
    if (json != null)
    {
      JSONArray items = (JSONArray) json.get("items");
      JSONObject person = (JSONObject) items.get(0);
      userId = (String) person.get("id");
    }else{
      throw new Exception("Login failed.");
    }
  }

  @Override
  protected String getURI()
  {
    return new StringBuffer(server.getHost()).append("/files/form/api/people/feed?self=true&format=json").toString();
  }

}
