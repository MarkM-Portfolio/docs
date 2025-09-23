/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.ecm.directory;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.Cookie;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpState;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.lang.StringEscapeUtils;

import com.ibm.concord.viewer.platform.util.HttpClientCreator;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
import com.ibm.concord.viewer.spi.members.IMembersModel;
import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.concord.viewer.spi.members.UserProperty;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.viewer.ecm.members.ECMMembersModel;
import com.ibm.docs.viewer.ecm.members.ECMUserImpl;
import com.ibm.docs.viewer.ecm.util.CookieHelper;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ECMDirectory implements IDirectoryAdapter
{
  private URL serverUrl;

  private ECMMembersModel membersModel;

  private String repoId;

  private String ecmContextRoot;

  private HttpClient client;

  private static final String PHOTO_URL_DEFAULT = "/images/NoPhoto_Person_48.png";

  private static final Logger LOG = Logger.getLogger(ECMDirectory.class.getName());

  @Override
  public void init(JSONObject config)
  {
    membersModel = new ECMMembersModel();
    if (config.get("server_url") == null)
    {
      throw new IllegalStateException("<server_url> setting is missing from directory adapter config.");
    }

    if (config.get("id") == null)
    {
      throw new IllegalStateException("<id> setting is missing from directory adapter config.");
    }

    repoId = (String) config.get("id");

    try
    {
      ecmContextRoot = (String) config.get("server_url");
      if (((String) config.get("server_url")).endsWith("/"))
      {
        ecmContextRoot += "atom/people/feed?self=true";
      }
      else
      {
        ecmContextRoot += "/atom/people/feed?self=true";
      }
      serverUrl = new URL(ecmContextRoot);
    }
    catch (MalformedURLException e)
    {
      throw new IllegalStateException("Illegal URL string when perform initialization of class " + ECMDirectory.class.getSimpleName(), e);
    }

    HttpClientCreator httpClientCreator = new HttpClientCreator();
    httpClientCreator.config(config);
    client = httpClientCreator.create();
  }

  @Override
  public UserBean getById(UserBean caller, String id)
  {
    ECMUserImpl userImpl = null;
    JSONObject jsonObj = null;

    GetMethod getMethod = new GetMethod(serverUrl.toString());

    HttpState state = new HttpState();
    Cookie[] cookies = CookieHelper.getAllCookies(serverUrl.getHost());
    state.addCookies(cookies);

    try
    {
      int nHttpStatus = client.executeMethod(null, getMethod, state);

      if (HttpStatus.SC_OK == nHttpStatus)
      {
        String jsonStr = getMethod.getResponseBodyAsString();
        String unescapedStr = StringEscapeUtils.unescapeJava(jsonStr);
        // LOG.log(Level.INFO, "User json string is: {0}, unescaped json string is: {1}", new Object[]{jsonStr, unescapedStr});
        jsonObj = JSONObject.parse(unescapedStr);
        LOG.log(Level.INFO, "People API call returned successfully.");
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
      userImpl.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + PHOTO_URL_DEFAULT);
    }
    else
    {
      return null;
    }
    return new UserBean(userImpl);
  }

  @Override
  public UserBean getByEmail(UserBean caller, String email)
  {
    ECMUserImpl userImpl = null;
    // let's return a profile anyway
    HashMap<String, String> properties = new HashMap<String, String>();
    properties.put(UserProperty.PROP_DN.toString(), email);
    properties.put(UserProperty.PROP_DISPLAYNAME.toString(), email);
    properties.put(UserProperty.PROP_EMAIL.toString(), email);
    userImpl = new ECMUserImpl(this.membersModel, email, properties);
    userImpl.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + PHOTO_URL_DEFAULT);
    return new UserBean(userImpl);
  }

  @Override
  public List<UserBean> search(UserBean user, String query)
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public IMembersModel getMembersModel()
  {
    return membersModel;
  }

  public IOrg getOrgById(String orgId)
  {
    IOrg org = membersModel.getOrg(ECMMembersModel.DEFAULT_ORG_ID);
    return org;
  }

}
