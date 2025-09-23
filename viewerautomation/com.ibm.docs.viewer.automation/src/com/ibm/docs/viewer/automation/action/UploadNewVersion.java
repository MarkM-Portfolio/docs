package com.ibm.docs.viewer.automation.action;

import java.io.File;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.FileEntity;

import com.ibm.docs.viewer.automation.Server;

public class UploadNewVersion extends AbstractAction
{
  private String fileId;

  // private String repositoryId;
  private File newVersion;

  public UploadNewVersion(HttpClient client, Server server, String fileId, File f)
  {
    super(client, server, RequestType.HTTP_POST);
    this.fileId = fileId;
    // this.repositoryId = repositoryId;
    this.newVersion = f;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
    request.setHeader("X-Method-Override", "PUT");
    ((HttpPost)request).setEntity(new FileEntity(newVersion));
  }

  @Override
  protected String getURI()
  {
    return new StringBuffer(server.getHost()).append("/files/form/api/document/").append(fileId)
        .append("/entry?createVersion=true&replace=true").toString();
  }

  @Override
  public Object getData()
  {
    // TODO Auto-generated method stub
    return null;
  }

}
