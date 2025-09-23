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

public class GetSpreadsheetJson extends AbstractAction
{
  private JSONObject res;

  private String fileId;

  private String version;

  private String repositoryId;

  public GetSpreadsheetJson(HttpClient client, Server server, String fileId, String repositoryId, String version)
  {
    super(client, server, RequestType.HTTP_GET);
    this.fileId = fileId;
    this.repositoryId = repositoryId;
    this.version = version;
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
    // http://localhost:9080/viewer/api/docsvr/tempstorage/d97fd0877ad0df305133a4d519eb0fd0/edit?criteria=%7B%22sheet%22%3A%22first%22%2C%22startrow%22%3A1%2C%22endrow%22%3A200%7D&nonce=null&checkEntitlement=true&sid=null&version=1&dojo.preventCache=1390285214053
    return new StringBuffer(server.getHost()).append(server.getCtxRoot())
        .append("/api/docsvr/")
        .append(repositoryId)
        .append("/")
        .append(fileId)
        .append("/edit?")
        .append(
            "criteria=%7B%22sheet%22%3A%22first%22%2C%22startrow%22%3A1%2C%22endrow%22%3A200%7D&nonce=null&checkEntitlement=true&sid=null&version=")
        .append(version).toString();
  }

  @Override
  public JSONObject getData()
  {
    return res;
  }

}
