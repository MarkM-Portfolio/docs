package com.ibm.docs.viewer.automation.action;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

public class QueryJobStatus extends AbstractAction
{
  private String fileId;

  private String jobId;

  private String version;

  private String repositoryId;

  private boolean htmlJob;

  private String userAgent;

  public static final String STATUS_PENDING = "pending";

  public static final String STATUS_COMPLETE = "complete";

  public static final String STATUS_ERROR = "error";

  private JSONObject res;

  public QueryJobStatus(HttpClient client, Server server, String fileId, String jobId, String version, String repositoryId,
      boolean htmlJob, String userAgent)
  {
    super(client, server, RequestType.HTTP_GET);
    this.jobId = jobId;
    this.version = version;
    this.fileId = fileId;
    this.repositoryId = repositoryId;
    this.htmlJob = htmlJob;
    this.userAgent = userAgent;
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

    if (!htmlJob) // image view version != null
    {
      // http://docs10.cn.ibm.com/viewer/api/job/lcfiles/76ff9759-cb9f-4826-b7f4-65d415fa1a12/1/d21b5ddb2ec91b02ab4f563539f0f0a4
      // ?dojo.preventCache=1383528806802
      return new StringBuffer(server.getHost()).append(server.getCtxRoot()).append("/api/job/").append(repositoryId).append("/")
          .append(fileId).append("/").append(version).append("/").append(jobId).append("?dojo.preventCache=")
          .append(System.currentTimeMillis()).toString();
    }
    else
    {
      // html view
      // http://docs10.cn.ibm.com/viewer/api/job/lcfiles/aaee8bb7-8470-4945-a695-ac56b7a33f69/41977e93e629b47a0806eaabe0db2c90?mode=html&dojo.preventCache=1383541111254
      return new StringBuffer(server.getHost()).append(server.getCtxRoot()).append("/api/job/").append(repositoryId).append("/")
          .append(fileId).append("/").append(jobId).append("?version=").append(version).append("&mode=html&dojo.preventCache=")
          .append(System.currentTimeMillis()).toString();
    }
  }

  @Override
  public JSONObject getData()
  {
    return res;
  }

}
