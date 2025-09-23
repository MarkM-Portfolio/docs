package com.ibm.docs.viewer.automation.action;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;

import com.ibm.docs.viewer.automation.Server;

public class MoveFileToTrash extends AbstractAction
{
  private String userId;

  private String fileId;

  private final static int successCode = 204;

  public MoveFileToTrash(HttpClient client, Server server, String fileId, String userId)
  {
    super(client, server, RequestType.HTTP_POST,successCode);
    this.fileId = fileId;
    this.userId = userId;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
    request.setHeader("X-Update-Nonce", "true");
    request.setHeader("X-Method-Override", "DELETE");

  }

  @Override
  protected String getURI()
  {
    return new StringBuffer(server.getHost()).append("/files/form/api/userlibrary/").append(userId).append("/document/").append(fileId)
        .append("/entry").toString();
  }

  @Override
  public Object getData()
  {
    return null;
  }

}
