/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.ecm;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpState;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.protocol.Protocol;
import org.apache.commons.lang.StringEscapeUtils;

import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.ecm.members.ECMMembersModel;
import com.ibm.docs.directory.ecm.members.ECMUserImpl;
import com.ibm.docs.common.security.CookieHelper;
import com.ibm.docs.common.security.HttpClientCreator;
import com.ibm.docs.common.security.SelfSSLSocketFactory;
import com.ibm.docs.common.util.Time;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ECMDirectory implements IDirectoryAdapter
{
  private static final Logger LOG = Logger.getLogger(ECMDirectory.class.getName());
  
  private static final String REPO_KEY_ECM = "ecm";

  private ECMMembersModel membersModel;

  private String repoId;

  private URL serverUrl;

  private String ecmContextRoot;
  
  HttpClient client;

  private static final String PHOTO_URL_DEFAULT = "/images/NoPhoto_Person_48.png";

  public UserBean getById(UserBean caller, String id)
  {
    ECMUserImpl userImpl = null;
    JSONObject jsonObj = null;
    
    Time timer = new Time();
    String url = null;
    if(id == null)
    {
      url = serverUrl.toString() + "?self=true";
    }
    else
    {
      url = serverUrl.toString() + "?userid=" + id;
    }

    String host=serverUrl.getHost();
    GetMethod getMethod = new GetMethod(url);
    HttpState state = new HttpState();
    Cookie[] cookies = CookieHelper.getAllCookies(host);
    state.addCookies(cookies);
    try
    {
      int nHttpStatus = client.executeMethod(null, getMethod, state);

      if (HttpStatus.SC_OK == nHttpStatus)
      {
        String jsonStr = getMethod.getResponseBodyAsString();
        String unescapedStr = StringEscapeUtils.unescapeJava(jsonStr);
        //LOG.log(Level.FINEST, "User json string is: {0}, unescaped json string is: {1}", new Object[]{jsonStr, unescapedStr}); //SPI!!
        jsonObj = JSONObject.parse(unescapedStr);
        //LOG.log(Level.FINEST, "People API call returned " + jsonObj); //SPI!!
        JSONArray jsonArrayResult = null;
        if (jsonObj != null)
        {
          jsonArrayResult = (JSONArray) jsonObj.get("items");
        }
        if (jsonArrayResult != null)
        {
          jsonObj = (JSONObject) jsonArrayResult.get(0);
        }
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Failed to get user information! " + e);
      return null;
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }

    if (jsonObj != null)
    {
      jsonObj.put("repos_id", repoId);
      userImpl = new ECMUserImpl(membersModel, jsonObj);
      userImpl.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + URLConfig.getStaticPath() + PHOTO_URL_DEFAULT);
    }
    else
    {
      // let's return a profile anyway
      HashMap<String, String> properties = new HashMap<String, String>();
      properties.put(UserProperty.PROP_DN.toString(), id);
      properties.put(UserProperty.PROP_DISPLAYNAME.toString(), id);
      userImpl = new ECMUserImpl(this.membersModel, id, properties);
      userImpl.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + URLConfig.getStaticPath() + PHOTO_URL_DEFAULT);
    }
    
    UserBean bean = new UserBean(userImpl);
    LOG.log(Level.FINEST, url + " takes: " + timer.ellapse());
    if(bean.getId() != null)
      return bean;
    
    LOG.log(Level.SEVERE, "Failed to get user information! ");
    return null;
  }

  public void init(JSONObject config)
  {
    membersModel = new ECMMembersModel();
    if (config.get("server_url") == null)
    {
      LOG.log(Level.SEVERE, "ECMDirectory <server_url> setting is missing from directory adapter config.");
    }

    if (config.get("id") == null)
    {
      LOG.log(Level.SEVERE, "ECMDirectory <id> setting is missing from directory adapter config.");
    }

    repoId = (String) config.get("id");
    if(repoId == null || repoId.isEmpty())
    {
      repoId = REPO_KEY_ECM;
    }    

    try
    {
      ecmContextRoot = (String) config.get("server_url");
      if(ecmContextRoot == null || ecmContextRoot.isEmpty())
      {
        ecmContextRoot = "http://localhost/dm";
      }
      if (ecmContextRoot.endsWith("/"))
      {
        ecmContextRoot += "atom/people/feed";
      }
      else
      {
        ecmContextRoot += "/atom/people/feed";
      }
      serverUrl = new URL(ecmContextRoot);         
    }
    catch (MalformedURLException e)
    {
      LOG.log(Level.SEVERE, "ECMDirectory Illegal URL string when perform initialization of class.");
    }
    
    if(serverUrl == null)
    {
      try
      {
        serverUrl = new URL("http://localhost/dm/atom/people/feed");
      }
      catch (MalformedURLException e1)
      {
      }      
    }

    HttpClientCreator httpClientCreator = new HttpClientCreator();
    httpClientCreator.config(config);
    client = httpClientCreator.create();    
  }

  public List<UserBean> search(UserBean user, String query)
  {
    List<UserBean> users = new ArrayList<UserBean>();
    return users;
  }

  public UserBean getByEmail(UserBean caller, String email)
  {
    ECMUserImpl userImpl = null;
    // let's return a profile anyway
    HashMap<String, String> properties = new HashMap<String, String>();
    properties.put(UserProperty.PROP_DN.toString(), email);
    properties.put(UserProperty.PROP_DISPLAYNAME.toString(), email);
    properties.put(UserProperty.PROP_EMAIL.toString(), email);
    userImpl = new ECMUserImpl(this.membersModel, email, properties);
    userImpl.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + URLConfig.getStaticPath() + PHOTO_URL_DEFAULT);
    return new UserBean(userImpl);
  }

  public IMembersModel getMembersModel()
  {
    return membersModel;
  }

  public IOrg getOrgById(String orgId)
  {
    IOrg org = membersModel.getOrg(ECMMembersModel.DEFAULT_ORG_ID);
    return org;
  }

  public UserBean getByDN(UserBean caller, String DN)
  {
	  return null;
  }
}
