package com.ibm.docs.viewer.automation.action;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.logging.Logger;

import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.HTTP;
import org.apache.http.NameValuePair;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

public class MailSnoopTest extends AbstractAction
{
  private static final String BUILD_TS = "timestamp";

  private static final String VIEWER_VERSION = "version";

  private static final String PRODUCT_NAME = "product_name";

  private static final String BUILD_DESCRIPTION = "build_description";

  private static final String HOSTNAME = "host";

  private static final String SHARD_DATA_DIR = "shareddatadir";

  private JSONObject res;

  private String uri;

  private boolean isSanityCheck;

  public MailSnoopTest(HttpClient client, Server server, String uri, boolean isSanityCheck)
  {
    super(client, server, RequestType.HTTP_GET);
    this.uri = uri;
    this.isSanityCheck = isSanityCheck;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
  }

  @Override
  protected void postExec(ResponseData data) throws Exception
  {
    super.postExec(data);
    if (isSanityCheck)
    {
      res = new JSONObject();
      res.put("result", data.getDataAsString());
    }
    else
    {
      res = data.getDataAsJSON();
    }
  }

  @Override
  protected String getURI()
  {
    StringBuffer url = new StringBuffer(server.getHost()).append(server.getCtxRoot()).append(uri);
    if (isSanityCheck)
    {
      ArrayList<NameValuePair> params = new ArrayList<NameValuePair>();
      params.add(new BasicNameValuePair("sanity", "true"));
      String parameterString = URLEncodedUtils.format(params, "utf-8"); //$NON-NLS-1$
      url.append("?").append(parameterString).toString();
    }
    return url.toString();
  }

  @Override
  public JSONObject getData()
  {
    return res;
  }

  public String getHostname()
  {
    if (res != null)
    {
      return (String) res.get(HOSTNAME);
    }
    return null;
  }

  public String getBuildVersion()
  {
    if (res != null)
    {
      return (String) res.get(BUILD_TS);
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

  public String getSharedDataDir()
  {
    if (res != null)
    {
      String data_dir = (String) res.get(SHARD_DATA_DIR);

      if (data_dir != null && !"null".equalsIgnoreCase(data_dir))
        return data_dir;
    }
    return null;
  }

  public JSONObject getResponse()
  {
    return res;
  }
}
