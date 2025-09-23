package com.ibm.docs.directory.external;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.lang.StringEscapeUtils;

import com.ibm.docs.common.oauth.OAuth2Helper;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.external.members.ExternalProfilesMembersModel;
import com.ibm.docs.directory.external.members.ExternalProfilesUserImpl;
import com.ibm.docs.directory.external.util.ExternalConstant;
import com.ibm.docs.directory.members.IMemberBase;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.external.util.ConfigHelper;
import com.ibm.json.java.JSONObject;

public class ExternalProfilesDirectoryImpl extends AbstractExternalDirectoryImpl
{   
  public static String USER_ID = "id";

  public static String USER_NAME = "name";

  public static String USER_DISPLAY_NAME = "display_name";

  public static String USER_EMAIL = "email";

  public static String USER_PHOTO_URL = "photo";

  public static String USER_ORG_ID = "org_id";

  public static String USER_ORG_NAME = "org_name";

  public static String USER_JOB_TITLE = "job_title";

  public static final String USER_REPO_ID = "repo_id";

  private static final Logger LOG = Logger.getLogger(ExternalProfilesDirectoryImpl.class.getName());

  private static final String KEYS = "keys";

  private static final String KEY_USER_ID = "id_key";

  private static final String KEY_USER_NAME = "name_key";

  private static final String KEY_USER_DISPLAY_NAME = "display_name_key";

  private static final String KEY_USER_EMAIL = "email_key";

  private static final String KEY_USER_PHOTO_URL = "photo_url_key";

  private static final String KEY_USER_ORG_ID = "org_id_key";

  private static final String KEY_URL_QUERY_ID = "url_query_key";

  private static final String KEY_PROFILES_URL = "profiles_url";

  private static final String KEY_USER_ORG_NAME = "org_name_key";

  private static final String KEY_USER_JOB_TITLE = "job_title_key";

  private static final String KEY_CURRENT_USER_PROFILES_URL = "current_user_profiles_url";
  
  public static final String KEY_LOCALE = "locale";

  private static String URL_QUERY_ID = "userid";

  private ExternalProfilesMembersModel model;

  private String repoId;

  private String profilesUrl;
  
  private String currentUserProfilesUrl;

  private String s2sMethod;

  ConfigHelper configHelper;

  public ExternalProfilesDirectoryImpl(JSONObject config)
  {
    repoId = (String) config.get("id");
    if (repoId == null)
    {
      LOG.log(Level.SEVERE, "Did not get the repository ID!!");
    }
    else
    {
      LOG.log(Level.INFO, "Got the repository ID: " + repoId);
    }

    profilesUrl = (String) config.get(KEY_PROFILES_URL);
    if (profilesUrl == null)
    {
      LOG.log(Level.SEVERE, "Did not get the profiles URL!!");
    }
    else
    {
      LOG.log(Level.INFO, "Got the profiles URL: " + profilesUrl);
    }
    currentUserProfilesUrl = (String) config.get(KEY_CURRENT_USER_PROFILES_URL);

    JSONObject keysObj = (JSONObject) config.get(KEYS);
    if (keysObj != null)
    {
      USER_ID = (String) keysObj.get(KEY_USER_ID);
      USER_NAME = (String) keysObj.get(KEY_USER_NAME);
      USER_DISPLAY_NAME = (String) keysObj.get(KEY_USER_DISPLAY_NAME);
      USER_EMAIL = (String) keysObj.get(KEY_USER_EMAIL);
      USER_PHOTO_URL = (String) keysObj.get(KEY_USER_PHOTO_URL);
      USER_ORG_ID = (String) keysObj.get(KEY_USER_ORG_ID);
      USER_ORG_NAME = (String) keysObj.get(KEY_USER_ORG_NAME);
      USER_JOB_TITLE = (String) keysObj.get(KEY_USER_JOB_TITLE);
      URL_QUERY_ID = (String) keysObj.get(KEY_URL_QUERY_ID);
    }
    LOG.log(Level.INFO, "The user json keys are: {0}, {1}", new Object[] { USER_ID, USER_ORG_ID });

    LOG.log(Level.INFO, "Initial the configuration for ExternalProfilesDirectoryImpl");
    configHelper = new ConfigHelper(config);
    s2sMethod = configHelper.getS2SMethod();

  }

  private void setRequestHeaders(HttpMethod method, UserBean requester)
  {
    configHelper.setRequestHeaders(method, requester, null);
  }

  private JSONObject getUserProfile(UserBean caller, String userId)
  {
    JSONObject jsonObj = null;
    String queryUrl = currentUserProfilesUrl;
    if (userId != null)
    {
      queryUrl = profilesUrl.replace("{ID}", userId);
    }

    GetMethod getMethod = new GetMethod(queryUrl);
    setRequestHeaders(getMethod, caller);

    try
    {
      int nHttpStatus = configHelper.getHttpClient().executeMethod(getMethod);

      if (HttpStatus.SC_OK == nHttpStatus)
      {
        String jsonStr = getMethod.getResponseBodyAsString();
        String unescapedStr = StringEscapeUtils.unescapeJava(jsonStr);
        // LOG.log(Level.FINEST, "User json string is: {0}, unescaped json string is: {1}", new Object[] { jsonStr, unescapedStr }); //
        // SPI!!
        jsonObj = JSONObject.parse(unescapedStr);
        // LOG.log(Level.FINEST, "People API call returned " + jsonObj); // SPI!!
      }
      else
      {
        LOG.log(Level.WARNING, "Failed to get user information from: {0}, the status is: {1}", new Object[] { queryUrl, nHttpStatus });
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE, "Failed to get user information from: {0}, the error is: {1}", new Object[] { queryUrl, e });
    }
    finally
    {
      if (getMethod != null)
      {
        getMethod.releaseConnection();
      }
    }
    return jsonObj;
  }

  @Override
  public UserBean getById(UserBean caller, String id)
  {
    UserBean bean = null;
    try
    {
      JSONObject jsonObj = getUserProfile(caller, id);

      if (jsonObj != null)
      {
        jsonObj.put(USER_REPO_ID, repoId);
        ExternalProfilesUserImpl userImpl = new ExternalProfilesUserImpl(model, jsonObj);
        bean = new UserBean(userImpl);
        if (ExternalConstant.S2S_METHOD_OAUTH2.equalsIgnoreCase(s2sMethod))
        {
          OAuth2Helper helper = configHelper.getOAuthThreadLocalHelper().get();
          if (helper != null)
          {
        	String helperID = configHelper.getOAuthHelperId(bean);
            helper.setTokenMeta(bean.getId(), configHelper.getRepoId(), configHelper.getFileId(bean));
            bean.setObject(helperID, helper);
          }
        }
        LOG.log(Level.FINEST, "External Profiles User id is: ", bean.getId());      
      }
    }
    catch (Exception e)
    {
    }
    finally
    {
      configHelper.getOAuthThreadLocalHelper().remove();
    }

    if (bean == null)
    {
      LOG.log(Level.SEVERE, "Did not get UserBean for ID {0}", new Object[] { id });
    }
    return bean;
  }

  @Override
  public IOrg getOrgById(String orgId)
  {
    IOrg org = model.getOrg(IMemberBase.DEFAULT_ORG_ID);
    return org;
  }

  @Override
  public UserBean getByEmail(UserBean caller, String email)
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public UserBean getByDN(UserBean caller, String DN)
  {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public List<UserBean> search(UserBean user, String query)
  {
    List<UserBean> users = new ArrayList<UserBean>();
    return users;
  }

  @Override
  public IMembersModel getMembersModel()
  {
    return model;
  }

}
