/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.lotuslive;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.lotuslive.members.LotusLiveMembersModel;
import com.ibm.docs.directory.lotuslive.members.LotusLiveOrgImpl;
import com.ibm.docs.directory.lotuslive.members.LotusLiveUserImpl;
import com.ibm.docs.directory.dao.ISubscriberDAO;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.json.java.JSONObject;

public class BssSubscriberDbDirectory implements IDirectoryAdapter
{
  private ISubscriberDAO subDAO;

  private LotusLiveMembersModel membersModel;

  private static final String PHOTO_URL = "/profiles/photo.do?userid=";

  public void init(JSONObject config)
  {
    subDAO = (ISubscriberDAO) ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID).getService(ISubscriberDAO.class);
    membersModel = new LotusLiveMembersModel();
  }

  public UserBean getById(UserBean caller, final String id)
  {
    Map<String, String> userProperties = subDAO.getById(id);
    return createUser(id, userProperties);
  }

  public IOrg getOrgById(String orgId)
  {
    Map<String, String> orgProperties = subDAO.getById(orgId);
    return createOrg(orgId, orgProperties);
  }

  public UserBean getByEmail(UserBean caller, String email)
  {
    List<String> subIds = subDAO.searchByColumnExactMatch(ISubscriberDAO.COL_EMAIL, email);
    if (subIds.isEmpty())
    {
      return createUser(email, new HashMap<String, String>());
    }
    else
    {
      return getById(caller, subIds.get(0));
    }
  }
  
  public UserBean getByDN(UserBean caller, String DN)
  {
	  return null;
  }

  public List<UserBean> search(UserBean caller, String query)
  {
    List<String> subIds = subDAO.searchByColumnSubString(ISubscriberDAO.COL_DISPLAY_NAME, query);

    List<UserBean> users = new ArrayList<UserBean>();
    if (subIds.isEmpty())
    {
      return users;
    }
    else
    {
      for (int i = 0; i < subIds.size(); i++)
      {
        UserBean user = getById(caller, subIds.get(0));
        if (user.getOrgId().equals(caller.getOrgId()))
        {
          users.add(user);
        }
      }
      return users;
    }
  }

  public IMembersModel getMembersModel()
  {
    return membersModel;
  }

  private UserBean createUser(String id, Map<String, String> userProps)
  {
    LotusLiveUserImpl userImpl = new LotusLiveUserImpl(id, userProps);
    UserBean userBean = new UserBean(userImpl);
    userBean.setProperty(UserProperty.PROP_ORGID.toString(), userBean.getProperty(UserProperty.PROP_CUSTOMERID.toString()));
    userBean.setProperty(UserProperty.PROP_PHOTO.toString(), PHOTO_URL + id);
    return userBean;
  }

  private IOrg createOrg(String orgId, Map<String, String> orgProps)
  {
    LotusLiveOrgImpl orgImpl = new LotusLiveOrgImpl(orgId, orgProps);
    return orgImpl;
  }
}
