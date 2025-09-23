/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.viewer.mail.auth;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.members.UserProperty;
import com.ibm.connections.directory.services.DSProvider;
import com.ibm.connections.directory.services.data.DSObject;
import com.ibm.connections.directory.services.exception.DSException;

public class MailOrgImpl implements IOrg
{
  private MailMembersModel model;

  private String id;

  private HashMap<String, String> properties;

  public MailOrgImpl(MailMembersModel model, String id, Map<String, String> properties)
  {
    this.model = model;
    this.id = id;
    if (properties != null && !properties.isEmpty())
    {
      this.properties.putAll(properties);
    }
  }

  public String getId()
  {
    return this.id;
  }

  public String getProperty(String key)
  {
    return this.properties.get(key);
  }

  public void setProperty(String key, String value)
  {
    this.properties.put(key, value);
  }

  public Set<String> listProperties()
  {
    return this.properties.keySet();
  }

  public IUser getUser(String userId)
  {
    DSProvider dsProvider = model.getDSProvider();
    DSObject dsUser = null;
    MailUserImpl user = null;
    try
    {
      dsUser = dsProvider.searchUserByExactIdMatch(userId);
    }
    catch (DSException e)
    {
      e.printStackTrace();
    }

    if (dsUser != null)
    {
      user = new MailUserImpl(this.model, dsUser);
    }

    return user;
  }

  public List<IUser> getUsersByPropertyExactMatch(UserProperty prop, String value)
  {
    if (UserProperty.PROP_EMAIL.toString().equals(prop))
    {
      DSProvider dsProvider = model.getDSProvider();
      DSObject dsUser = null;
      try
      {
        dsUser = dsProvider.searchUserByExactEmailMatch(value);
      }
      catch (DSException e)
      {
        e.printStackTrace();
        return null;
      }

      if (dsUser != null)
      {
        MailUserImpl user = new MailUserImpl(this.model, dsUser);
        ArrayList<IUser> result = new ArrayList<IUser>();
        result.add(user);

        return result;
      }
    }

    return null;
  }

  public List<IUser> getUsersByPropertySubString(UserProperty prop, String value)
  {
    if (UserProperty.PROP_DISPLAYNAME.toString().equals(prop))
    {
      DSProvider dsProvider = model.getDSProvider();
      DSObject[] dsUsers = null;
      try
      {
        dsUsers = dsProvider.searchUsersByNameSubstringQuery(value, 100);
      }
      catch (DSException e)
      {
        e.printStackTrace();
        return null;
      }

      if (dsUsers != null)
      {
        ArrayList<IUser> result = new ArrayList<IUser>();
        for (DSObject dsUser : dsUsers)
        {
          MailUserImpl user = new MailUserImpl(this.model, dsUser);
          result.add(user);
        }

        return result;
      }
    }

    return null;
  }

  public IUser createUser(String userId, Map<String, String> properties)
  {
    // Cannot create user in this implementation
    return null;
  }

  public void removeUser(IUser user)
  {
    // Cannot remove user in this implementation
  }

}
