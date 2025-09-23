package com.ibm.docs.viewer.automation.action;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.message.BasicNameValuePair;

import com.ibm.docs.viewer.automation.Server;
import com.ibm.docs.viewer.automation.config.ServerConfigHelper;
import com.ibm.docs.viewer.automation.config.ServerConfigHelper.RepositoryType;
import com.ibm.docs.viewer.automation.util.FileUtil;
import com.ibm.docs.viewer.automation.util.MimeTypeUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class LocalUploadFile extends AbstractAction
{
  File src;

  String id;

  public LocalUploadFile(HttpClient client, Server server, String userId, File f)
  {
    super(client, server, RequestType.HTTP_POST, 200);
    src = f;
  }

  // @Override
  // public void execute() throws Exception
  // {
  // }

  @Override
  public Object getData()
  {
    return id;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
    File desc = new File(ServerConfigHelper.getInstance().getViewerCacheRoot(RepositoryType.LOCAL.getId()), id);
    FileUtil.copy(src, desc);
    JSONObject meta = new JSONObject();
    meta.put("version", "1");
    meta.put("owner", "test1@cn.ibm.com");
    JSONArray acl = new JSONArray();
    JSONObject acl1 = new JSONObject();
    acl1.put("permission", "VIEW,EDIT");
    acl1.put("principal", "test1@cn.ibm.com");
    acl.add(acl1);
    meta.put("acl", acl);

    meta.put("title", src.getName());
    meta.put("mimetype", MimeTypeUtil.MIME_TYPE_MAP.getContentType(src.getName()));

    File metaFile = new File(ServerConfigHelper.getInstance().getViewerCacheRoot(RepositoryType.LOCAL.getId()), id + ".js");
    try
    {
      meta.serialize(new FileOutputStream(metaFile));
    }
    catch (FileNotFoundException e)
    {
      e.printStackTrace();
      return;
    }
    catch (IOException e)
    {
      e.printStackTrace();
      return;
    }

    List<NameValuePair> parameters = new ArrayList<NameValuePair>();
    parameters.add(new BasicNameValuePair("relativepath", ""));
    parameters.add(new BasicNameValuePair("displayname", id));
    parameters.add(new BasicNameValuePair("userid", "1"));
    parameters.add(new BasicNameValuePair("email", "test1@cn.ibm.com"));
    parameters.add(new BasicNameValuePair("extension", src.getName().substring(src.getName().lastIndexOf("."))));
    parameters.add(new BasicNameValuePair("title", src.getName()));
    parameters.add(new BasicNameValuePair("fileSize", String.valueOf(src.length())));
    parameters.add(new BasicNameValuePair("version", "1"));
    parameters.add(new BasicNameValuePair("mimetype", MimeTypeUtil.MIME_TYPE_MAP.getContentType(src.getName())));
    parameters.add(new BasicNameValuePair("modified", String.valueOf(desc.lastModified())));
    parameters.add(new BasicNameValuePair("dynamicToken", generateToken(id, String.valueOf(desc.lastModified()))));
    parameters.add(new BasicNameValuePair("request", "UPLOAD_FILE"));

    // parameters.add(new BasicNameValuePair("repository", "viewer.storage"));
    // parameters.add(new BasicNameValuePair("docId", id));

    try
    {
      UrlEncodedFormEntity requestEntity = new UrlEncodedFormEntity(parameters);
      ((HttpPost) request).setEntity(requestEntity);
    }
    catch (UnsupportedEncodingException e)
    {
      e.printStackTrace();
    }
  }

  private String generateToken(String docId, String modified)
  {
    String key = docId + modified;
    try
    {
      byte[] rawMD5 = MessageDigest.getInstance("MD5").digest(key.getBytes());

      StringBuffer value = new StringBuffer();
      for (int i = 0; i < rawMD5.length; i++)
      {
        String hex = Integer.toHexString(0xFF & rawMD5[i]);
        if (hex.length() == 1)
        {
          value.append('0');
        }
        value.append(hex);
      }
      return value.toString();
    }
    catch (NoSuchAlgorithmException e)
    {
      throw new IllegalArgumentException(e);
    }
  }

  @Override
  protected String getURI()
  {
    id = UUID.randomUUID().toString();
    return new StringBuffer(server.getHost()).append(server.getCtxRoot()).append("/upload").append("/").append("viewer.storage")
        .append("/").append(id).toString();
  }

}
