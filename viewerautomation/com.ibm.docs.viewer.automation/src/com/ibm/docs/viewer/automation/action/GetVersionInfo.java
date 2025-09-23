package com.ibm.docs.viewer.automation.action;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

public class GetVersionInfo extends AbstractAction
{
  private static final String BUILD_VERSION = "timestamp";

  private static final String VIEWER_VERSION = "version";

  private static final String PRODUCT_NAME = "product_name";

  private static final String BUILD_DESCRIPTION = "build_description";

  private JSONObject res;

  public GetVersionInfo(HttpClient client, Server server)
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
    return new StringBuffer(server.getHost()).append(server.getCtxRoot()).append("/version").toString();
  }

  @Override
  public JSONObject getData()
  {
    return res;
  }

  public String getBuildVersion()
  {
    if (res != null)
    {
      return (String) res.get(BUILD_VERSION);
    }
    return null;
  }

  public String getViewerVersion()
  {
    if (res != null)
    {
      return (String) res.get(VIEWER_VERSION);
    }
    return null;
  }

  public String getProductName()
  {
    if (res != null)
    {
      return (String) res.get(PRODUCT_NAME);
    }
    return null;
  }

  public String getBuildDescription()
  {
    if (res != null)
    {
      return (String) res.get(BUILD_DESCRIPTION);
    }
    return null;
  }
}
