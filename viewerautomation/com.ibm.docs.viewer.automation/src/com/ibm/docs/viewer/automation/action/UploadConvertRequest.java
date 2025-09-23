package com.ibm.docs.viewer.automation.action;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.HTTP;

import com.ibm.docs.viewer.automation.Server;

public class UploadConvertRequest extends AbstractAction
{
  private EventInfo eventInfo;

  private String s2sToken;

  private boolean isSmartCloud;
  
  private String fileId;

  private String repositoryId;

  public UploadConvertRequest(HttpClient client, Server server, EventInfo event,String repositoryId, String fileId)
  {
    super(client, server, RequestType.HTTP_POST);
    this.repositoryId = repositoryId;
    this.fileId = fileId;
    this.eventInfo = event;
    s2sToken = "";
    isSmartCloud = false;
  }

  @Override
  protected void initRequest(HttpUriRequest request)
  {
    List<NameValuePair> params = new ArrayList<NameValuePair>();

    request.setHeader("X-LConn-RunAs", "userid=" + eventInfo.actorId
        + ",excludeRole=admin, excludeRole=global-moderator, excludeRole=search-admin");

   if (eventInfo.modified == null)
    {
      throw new IllegalArgumentException("lastModified and repository cannot be null.");
    }
    else
    {
      params.add(new BasicNameValuePair(EventInfo.MODIFIED, eventInfo.modified));
    }
    if (eventInfo.relativePath != null)
    {
      params.add(new BasicNameValuePair(EventInfo.RELATIVEPATH, eventInfo.relativePath));
    }
    if (eventInfo.actorName != null)
    {
      params.add(new BasicNameValuePair(EventInfo.DISPLAYNAME, eventInfo.actorName));
    }
    if (eventInfo.actorEmail != null)
    {
      params.add(new BasicNameValuePair(EventInfo.EMAIL, eventInfo.actorEmail));
    }
    if (eventInfo.extention != null)
    {
      params.add(new BasicNameValuePair(EventInfo.EXTENSION, eventInfo.extention));
    }
    if (eventInfo.title != null)
    {
      params.add(new BasicNameValuePair(EventInfo.TITLE, eventInfo.title));
    }
    if (eventInfo.fileSize != null)
    {
      params.add(new BasicNameValuePair(EventInfo.FILESIZE, eventInfo.fileSize));
    }
    if (eventInfo.request != null)
    {
      params.add(new BasicNameValuePair(EventInfo.REQUEST, eventInfo.request.name()));
    }
    if (eventInfo.version != null)
    {
      params.add(new BasicNameValuePair(EventInfo.VERSION, eventInfo.version));
    }
    if (eventInfo.minetype != null)
    {
      params.add(new BasicNameValuePair(EventInfo.MIMETYPE, eventInfo.minetype));
    }
    if (s2sToken != null)
    {
      if (isSmartCloud)
      {
        // params.setRequestHeader(S2SCallHelper.CONFIG_S2S_NAME, S2SCallHelper.getToken());
      }
      else
      {
        request.setHeader("s2stoken", "fallseason2011"/* S2SCallHelper.getEncryptedToken() */);
        // request.setHeader("authorization", "Basic dGVzdDFAY24uaWJtLmNvbTpwYXNzdzByZA==");
      }
    }
    if (eventInfo.actorId == null)
    {
      eventInfo.actorId = "files.command.createthumbnail";
    }
    params.add(new BasicNameValuePair(EventInfo.USERNAME, eventInfo.actorId));
    params.add(new BasicNameValuePair("dynamicToken", generateToken(fileId, eventInfo.modified)));
    request.setHeader("onBehalfOf", eventInfo.actorId);
    try
    {
      ((HttpPost) request).setEntity(new UrlEncodedFormEntity(params, HTTP.UTF_8));
    }
    catch (UnsupportedEncodingException e)
    {
      Logger.getLogger(GenerateThumbnailEvent.class.getName());
    }
    request.setHeader("X-LConn-RunAs-For", "application");
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
      Logger.getLogger(GenerateThumbnailEvent.class.getName()).log(Level.INFO, "Dynamic token of [" + key + "]: " + value.toString());
      return value.toString();
    }
    catch (NoSuchAlgorithmException e)
    {
      Logger.getLogger(GenerateThumbnailEvent.class.getName()).log(Level.SEVERE,
          "Can not find Java MD5 algorithm, hash cache descriptor directory failed. {0}", e);
      throw new IllegalArgumentException(e);
    }
  }

  @Override
  protected String getURI()
  {
	  return new StringBuffer(server.getHost()).append("/viewer/upload/").append(repositoryId).append("/").append(fileId).toString();
	    		
  }

  @Override
  public Object getData()
  {
    return null;
  }

}
