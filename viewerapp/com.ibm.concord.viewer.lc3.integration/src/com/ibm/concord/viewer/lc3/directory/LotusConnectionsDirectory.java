/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lc3.directory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.lc3.members.LotusConnectionsMembersModel;
import com.ibm.concord.viewer.lc3.members.LotusConnectionsOrgImpl;
import com.ibm.concord.viewer.lc3.members.LotusConnectionsUserImpl;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
import com.ibm.concord.viewer.spi.members.IMembersModel;
import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.concord.viewer.spi.members.UserProperty;
import com.ibm.connections.directory.services.DSProviderFactory;
import com.ibm.connections.directory.services.data.DSObject;
import com.ibm.connections.directory.services.exception.DSException;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class LotusConnectionsDirectory implements IDirectoryAdapter
{
  private static final Logger LOG = Logger.getLogger(LotusConnectionsDirectory.class.getName());

  private LotusConnectionsMembersModel membersModel;

  public UserBean getById(UserBean caller, String id)
  {
    LotusConnectionsUserImpl userImpl = null;
    // one reason is, there is no such user's entry in Profiles DB
    // try to get from directory service then
    DSObject dsObj = null;
    try
    {
      // deprecate searchUserByExactIdMatch from Connections 3.5
      // dsObj = this.membersModel.getDSProvider().searchUserByExactIdMatch(id);
      dsObj = this.membersModel.getDSProvider().searchDSObjectByExactIdMatch(id, DSObject.ObjectType.PERSON);
    }
    catch (DSException e)
    {
      LOG.log(Level.WARNING, "WALTZ error for searching " + id, e);
    }

    if (dsObj != null)
    {
      LOG.log(Level.FINE, "Get dsObj with userId {0}, orgId is {1}.", new String[] { dsObj.get_id(), dsObj.get_orgid() });
      userImpl = new LotusConnectionsUserImpl(this.membersModel, dsObj);
    }
    else
    {
      // let's return a profile anyway
      HashMap<String, String> properties = new HashMap<String, String>();
      properties.put(UserProperty.PROP_DN.toString(), id);
      properties.put(UserProperty.PROP_DISPLAYNAME.toString(), id);
      userImpl = new LotusConnectionsUserImpl(this.membersModel, id, properties);
      LOG.log(Level.FINE, "Create a fake dsObj as {0}, orgId is {1}.", new String[] { userImpl.getId(), userImpl.getOrg().getId() });
    }

    userImpl.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + "/images/NoPhoto_Person_48.png");
    return new UserBean(userImpl);
  }

  public void init(JSONObject config)
  {
    this.membersModel = new LotusConnectionsMembersModel(DSProviderFactory.INSTANCE.getProfileProvider());
  }

  public List<UserBean> search(UserBean user, String query)
  {
    List<UserBean> users = new ArrayList<UserBean>();

    String raw_key_word = query;

    if (raw_key_word.length() == 1 && raw_key_word.charAt(0) == '*')
    {
      ; // do nothing here.
    }
    else
    {
      if (raw_key_word.length() > 0 && raw_key_word.charAt(0) == '*')
      {
        raw_key_word = raw_key_word.substring(1);
      }

      if (raw_key_word.length() > 0 && raw_key_word.charAt(raw_key_word.length() - 1) == '*')
      {
        raw_key_word = raw_key_word.substring(0, raw_key_word.length() - 1);
      }

      if (raw_key_word.length() < 2)
      {
        LOG.log(Level.FINE, "The query of [{0}, {1}] was ignored.", new Object[] { query, user == null ? null : user.getOrgId() });
        return users;
      }
    }

    DSObject[] results = null;
    try
    {
      // deprecate searchUserByExactIdMatch from Connections 3.5
      // results = this.membersModel.getDSProvider().searchUsersByNameSubstringQuery(query, 100);
      if (LotusConnectionsMembersModel.DEFAULT_ORG_ID.equals(user == null ? null : user.getOrgId()))
      {
        // single tenant
        results = this.membersModel.getDSProvider().searchDSObjectByNameSubstringQuery(query, DSObject.ObjectType.PERSON, 100, null);
      }
      else
      {
        // multi tenant
        query = raw_key_word;
        LOG.log(Level.FINE, "searchDSObjectByNameSubstringQuery is finding user {0} with {1}.", new Object[] { query,
            user == null ? null : user.getOrgId() });
        results = this.membersModel.getDSProvider().searchDSObjectByNameSubstringQuery(query, DSObject.ObjectType.PERSON, 100,
            user == null ? null : user.getOrgId());
      }
    }
    catch (DSException e)
    {
      LOG.log(Level.WARNING, "WALTZ error for searching {0} {1} {2}.", new Object[] { query, user == null ? null : user.getOrgId(), e });
      return users;
    }

    if (results == null)
    {
      LOG.log(Level.WARNING, "WALTZ not found records for searching {0} {1}.",
          new Object[] { query, user == null ? null : user.getOrgId() });
      return users;
    }

    for (int i = 0; i < results.length; i++)
    {
      DSObject dsObj = results[i];
      LotusConnectionsUserImpl userImpl = new LotusConnectionsUserImpl(this.membersModel, dsObj);
      UserBean userBean = new UserBean(userImpl);
      users.add(userBean);
    }
    return users;
  }

  public UserBean getByEmail(UserBean caller, String email)
  {
    LotusConnectionsUserImpl userImpl = null;
    // one reason is, there is no such user's entry in Profiles DB
    // try to get from directory service then
    DSObject dsObj = null;
    try
    {
      dsObj = this.membersModel.getDSProvider().searchUserByExactEmailMatch(email);
    }
    catch (DSException e)
    {
      LOG.log(Level.WARNING, "WALTZ error for searching " + email, e);
    }

    if (dsObj != null)
    {
      userImpl = new LotusConnectionsUserImpl(this.membersModel, dsObj);
    }
    else
    {
      // let's return a profile anyway
      HashMap<String, String> properties = new HashMap<String, String>();
      properties.put(UserProperty.PROP_DN.toString(), email);
      properties.put(UserProperty.PROP_DISPLAYNAME.toString(), email);
      properties.put(UserProperty.PROP_EMAIL.toString(), email);

      userImpl = new LotusConnectionsUserImpl(this.membersModel, email, properties);
    }

    userImpl.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + "/images/NoPhoto_Person_48.png");
    return new UserBean(userImpl);
  }

  public IMembersModel getMembersModel()
  {
    return this.membersModel;
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.spi.directory.IDirectoryAdapter#getOrgById(java.lang.String)
   */
  public IOrg getOrgById(String orgId)
  {
    LotusConnectionsOrgImpl org = null;
    DSObject dsObj = null;
    try
    {
      dsObj = this.membersModel.getDSProvider().searchDSObjectByExactIdMatch(orgId, DSObject.ObjectType.ORGANIZATION);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "WALTZ error for searching organization " + orgId, e);
    }

    if (dsObj != null)
    {
      // TODO: Fill the organization information.
      org = new LotusConnectionsOrgImpl(this.membersModel, orgId, null);
    }
    else if (LotusConnectionsMembersModel.DEFAULT_ORG_ID.equals(orgId))
    {
      // Create organization model instance for the default organization.
      org = new LotusConnectionsOrgImpl(this.membersModel, orgId, null);
    }
    return org;
  }
}
