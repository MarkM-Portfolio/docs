package com.ibm.docs.viewer.automation.action;

import org.apache.commons.codec.binary.Base64;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

public class QueryUploadConverisonDirectory extends AbstractAction
{

  private String uri;

  private JSONObject res;

  public QueryUploadConverisonDirectory(HttpClient client, Server server, String uri)
  {
    super(client, server, RequestType.HTTP_GET);
    this.uri = uri;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
    String basicAuth = "test2@cn.ibm.com:passw0rd";
    request.addHeader("Authorization", "Basic " + Base64.encodeBase64String(basicAuth.getBytes()));

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
    return new StringBuffer("http://localhost:9080").append(server.getCtxRoot()).append("/api/uploadConversion/").append(uri).toString();
  }

  @Override
  public Object getData()
  {
    return res;
  }

}
