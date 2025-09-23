package com.ibm.docs.viewer.automation.action;

import java.io.File;
import java.util.logging.Logger;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

public class QueryMailAttachment extends AbstractAction
{

  private String uuid;

  private JSONObject res;
  
  private String f;

  public QueryMailAttachment(HttpClient client, Server server, String f, String uuid)
  {
    super(client, server, RequestType.HTTP_POST);
    this.uuid = uuid;
    this.f = f;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
	  if (f != null && f.length() > 0) {
	      File file = new File(f);
	      request.setHeader("Title", file.getName());
	  }
  }

  @Override
  protected void postExec(ResponseData data) throws Exception
  {
    res = data.getDataAsJSON();
    if (res == null)
    {
      res = new JSONObject();
    }
    if (data.getCode() == 201)
    {
      res.put("responseCode", "201");
    }
    else if (data.getCode() == 409)
    {
      res.put("responseCode", "409");
    }
    else if (data.getCode() == 423)
    {
      res.put("responseCode", "423");
    }
    else
      throw new UnexpectedHTTPCode("Response code is " + data.getCode() + ", expecting 201, 409 and 423");

  }

  @Override
  protected String getURI()
  {
    String url = new StringBuffer(server.getHost()).append(server.getCtxRoot()).append("/api/attachment/mail/").append(uuid).toString();
    Logger.getLogger(QueryMailAttachment.class.getName()).info("Query attachment url is : " + url);
    return url;
  }

  @Override
  public Object getData()
  {
    return res;
  }

}
