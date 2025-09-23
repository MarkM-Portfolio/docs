package com.ibm.docs.viewer.automation.action;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

/**
 * 
 * @author wangyixin
 * 
 */

public class GetSupportedFileFormats extends AbstractAction
{
  private JSONObject res;

  public GetSupportedFileFormats(HttpClient client, Server server)
  {
    super(client, server, RequestType.HTTP_GET);
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {

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
    return new StringBuffer(server.getHost()).append(server.getCtxRoot()).append("/api/filetypes").toString();
  }

  @Override
  public JSONObject getData()
  {
    return res;
  }

}
