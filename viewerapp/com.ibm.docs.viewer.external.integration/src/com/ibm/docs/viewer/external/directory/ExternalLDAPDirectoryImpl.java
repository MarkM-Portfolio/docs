package com.ibm.docs.viewer.external.directory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.members.IMemberBase;
import com.ibm.concord.viewer.spi.members.IMembersModel;
import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.concord.viewer.spi.members.UserProperty;
import com.ibm.connections.directory.services.DSProviderFactory;
import com.ibm.connections.directory.services.data.DSObject;
import com.ibm.connections.directory.services.exception.DSException;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.viewer.external.members.ExternalLDAPMembersModel;
import com.ibm.docs.viewer.external.members.ExternalLDAPOrgImpl;
import com.ibm.docs.viewer.external.members.ExternalLDAPUserImpl;
import com.ibm.json.java.JSONObject;


public class ExternalLDAPDirectoryImpl extends AbstractExternalDirectoryImpl
{

  private static final Logger LOG = Logger.getLogger(ExternalLDAPDirectoryImpl.class.getName());

  private ExternalLDAPMembersModel membersModel;

  private static final String PHOTO_URL_DEFAULT = "/images/NoPhoto_Person_48.png";

  public ExternalLDAPDirectoryImpl(JSONObject config)
  {
    this.membersModel = new ExternalLDAPMembersModel(DSProviderFactory.INSTANCE.getProfileProvider());
  }

  public UserBean getById(UserBean caller, String id)
  {    
    ExternalLDAPUserImpl userImpl = null;
    DSObject dsObj = null;
    if(id != null)
    {
      try
      {
        dsObj = this.membersModel.getDSProvider().searchAccountByExactLoginUserNameMatch(id);
      }
      catch (DSException e)
      {
        LOG.log(Level.WARNING, "WALTZ error for searching " + id, e);
      }
    }

    if (dsObj != null)
    {
      userImpl = new ExternalLDAPUserImpl(this.membersModel, dsObj);
    }
    else
    {
      HashMap<String, String> properties = new HashMap<String, String>();   
      if(id == null)
      {      
        id = "anonymous";
      }
      id = "anonymous";
      properties.put(UserProperty.PROP_DN.toString(), id);
      properties.put(UserProperty.PROP_DISPLAYNAME.toString(), id);
      properties.put(IMemberBase.PROP_PRINCIPALID, id);
      properties.put(UserProperty.PROP_ORGID.toString(), "external");      
      userImpl = new ExternalLDAPUserImpl(this.membersModel, id, properties);
    }
    userImpl.setProperty(IMemberBase.PROP_PRINCIPALID, id);
    userImpl.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + PHOTO_URL_DEFAULT);

    UserBean bean = new UserBean(userImpl);
    return bean;
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
      if (IMemberBase.DEFAULT_ORG_ID.equals(user == null ? null : user.getOrgId()))
      {
        LOG.log(Level.FINE, "searchDSObjectByNameSubstringQuery is finding user {0}.", query);
        results = this.membersModel.getDSProvider().searchDSObjectByNameSubstringQuery(query, DSObject.ObjectType.PERSON, 100, null);
      }
      else
      {
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
      ExternalLDAPUserImpl userImpl = new ExternalLDAPUserImpl(this.membersModel, dsObj);
      UserBean userBean = new UserBean(userImpl);
      users.add(userBean);
    }
    return users;
  }

  public UserBean getByDN(UserBean caller, String DN)
  {
    ExternalLDAPUserImpl userImpl = null;
    // one reason is, there is no such user's entry in Profiles DB
    // try to get from directory service then
    DSObject dsObj = null;
    try
    {
      dsObj = this.membersModel.getDSProvider().searchUserByExactDNMatch(DN);
    }
    catch (DSException e)
    {
      LOG.log(Level.WARNING, "WALTZ error for searching " + DN, e);
    }

    if (dsObj != null)
    {
      LOG.log(Level.WARNING, "id: " + dsObj.get_id());
      LOG.log(Level.WARNING, "accountid: " + dsObj.get_accountid());
      LOG.log(Level.WARNING, "guid: " + dsObj.get_guid());
      LOG.log(Level.WARNING, "principal: " + dsObj.get_principal());
      LOG.log(Level.WARNING, "userid: " + dsObj.get_userid());
      userImpl = new ExternalLDAPUserImpl(this.membersModel, dsObj);
    }
    else
    {
      HashMap<String, String> properties = new HashMap<String, String>();
      properties.put(UserProperty.PROP_DN.toString(), DN);
      properties.put(UserProperty.PROP_DISPLAYNAME.toString(), DN);
      properties.put(UserProperty.PROP_EMAIL.toString(), DN);
      userImpl = new ExternalLDAPUserImpl(this.membersModel, DN, properties);
    }
    userImpl.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + PHOTO_URL_DEFAULT);

    return new UserBean(userImpl);
  }

  public UserBean getByEmail(UserBean caller, String email)
  {
    ExternalLDAPUserImpl userImpl = null;
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
      LOG.log(Level.WARNING, "id: " + dsObj.get_id());
      LOG.log(Level.WARNING, "accountid: " + dsObj.get_accountid());
      LOG.log(Level.WARNING, "guid: " + dsObj.get_guid());
      LOG.log(Level.WARNING, "principal: " + dsObj.get_principal());
      LOG.log(Level.WARNING, "userid: " + dsObj.get_userid());
      userImpl = new ExternalLDAPUserImpl(this.membersModel, dsObj);      
    }
    else
    {
      HashMap<String, String> properties = new HashMap<String, String>();
      properties.put(UserProperty.PROP_DN.toString(), email);
      properties.put(UserProperty.PROP_DISPLAYNAME.toString(), email);
      properties.put(UserProperty.PROP_EMAIL.toString(), email);
      userImpl = new ExternalLDAPUserImpl(this.membersModel, email, properties);
    }
    userImpl.setProperty(UserProperty.PROP_PHOTO.toString(), URLConfig.getContextPath() + PHOTO_URL_DEFAULT);

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
    ExternalLDAPOrgImpl org = null;
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
      org = new ExternalLDAPOrgImpl(this.membersModel, orgId, null);
    }
    else if (IMemberBase.DEFAULT_ORG_ID.equals(orgId))
    {    
      org = new ExternalLDAPOrgImpl(this.membersModel, orgId, null);
    }
    return org;
  }

}