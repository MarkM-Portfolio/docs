/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.local;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.local.members.LocalTestMembersModel;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.common.util.WASConfigHelper;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.IUser;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class LocalTestDirectory implements IDirectoryAdapter
{
  private static final Logger LOG = Logger.getLogger(LocalTestDirectory.class.getName());
  
  private LocalTestMembersModel membersModel;
  
  private static final String PHOTO_URL_DEFAULT = "/images/NoPhoto_Person_48.png";

  public void init(JSONObject config)
  {
    FileInputStream fis = null;
    try {
      String testUsersFile = config.get("test_users").toString();
      String fileName = WASConfigHelper.getDocsConfigPath() + File.separator + testUsersFile;
      fis = new FileInputStream(fileName);
      JSONArray userList = JSONArray.parse(fis);
      this.membersModel = new LocalTestMembersModel(userList);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing test users" , e);
    }
    finally
    {
      if(fis != null)
        try
      {
          fis.close();
      }
      catch (IOException e)
      {
        e.printStackTrace();
      }
    }

  }

  public UserBean getById(UserBean caller, String id)
  {
    UserBean userBean = null;
    List<IOrg> orgList = this.membersModel.listOrgs();
    int len = orgList != null ? orgList.size() : 0;
    for (int index = 0; index < len; index++)
    {
      IOrg org = orgList.get(index);
      IUser user = org.getUser(id);
      if (user != null)
      {
        userBean = new UserBean(user);
        userBean.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + PHOTO_URL_DEFAULT);
        break;
      }
    }
    return userBean;
  }

  public List<UserBean> search(UserBean user, String query)
  {
    List<UserBean> users = new ArrayList<UserBean>();
    List<IOrg> orgList = this.membersModel.listOrgs();
    int len = orgList != null ? orgList.size() : 0;
    for (int index = 0; index < len; index++)
    {
      IOrg org = orgList.get(index);
      List<IUser> resultUsers = org.getUsersByPropertySubString(UserProperty.PROP_DISPLAYNAME, query);
      for (IUser resultUser : resultUsers)
      {
        UserBean bean = new UserBean(resultUser);
        users.add(bean);
      }
    }
    return users;
  }

  
  public UserBean getByDN(UserBean caller, String DN)
  {
	  return null;
  }

  public UserBean getByEmail(UserBean caller, String email)
  {
    UserBean userBean = null;
    List<IOrg> orgList = this.membersModel.listOrgs();
    int len = orgList != null ? orgList.size() : 0;
    for (int index = 0; index < len; index++)
    {
      IOrg org = orgList.get(index);
      List<IUser> users = org.getUsersByPropertyExactMatch(UserProperty.PROP_EMAIL, email);
      
      if (users != null && !users.isEmpty())
      {
        IUser user = users.get(0);
        if (user != null)
        {
          userBean = new UserBean(user);
          userBean.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + PHOTO_URL_DEFAULT);
          break;
        }
      }
    }
    return userBean;
  }

  public IMembersModel getMembersModel()
  {
    return this.membersModel;
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spi.directory.IDirectoryAdapter#getOrgById(java.lang.String)
   */
  public IOrg getOrgById(String orgId)
  {
    return this.membersModel.getOrg(orgId);
  }
}
