package com.ibm.docs.viewer.automation.action;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.InputStreamEntity;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.json.java.JSONObject;

public class PostMailAttachment extends AbstractAction
{
  private File file;

  private JSONObject res;

  private String uuid;

  private static final int successCode = 201;

  private static final Logger logger = Logger.getLogger(PostAttachment.class.getName());

  public PostMailAttachment(HttpClient client, Server server, File f, String uuid)
  {
    super(client, server, RequestType.HTTP_POST, successCode);
    this.file = f;
    this.uuid = uuid;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
    try
    {
      request.setHeader("Title", this.file.getName());

      ((HttpPost) request).setEntity(new InputStreamEntity(new FileInputStream(file), file.length()));
    }
    catch (FileNotFoundException e)
    {
      logger.log(Level.SEVERE, "Can't find the file " + this.file.getName(), e);
    }
  }

  @Override
  protected void postExec(ResponseData data) throws Exception
  {
    super.postExec(data);
    res = null;
  }

  @Override
  protected String getURI()
  {
    return new StringBuffer(server.getHost()).append(server.getCtxRoot()).append("/api/attachment/mail/").append(uuid).toString();
  }

  @Override
  public Object getData()
  {
    return res;
  }

}
