/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.local.members;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.IUser;
import com.ibm.docs.directory.members.UserProperty;

public class LocalTestOrgImpl implements IOrg
{
  private String id;
  private HashMap<String, String> properties = new HashMap<String, String>();
  
  // User map. Users are keyed by user id
  private HashMap<String, LocalTestUserImpl> users = new HashMap<String, LocalTestUserImpl>();
  
  public LocalTestOrgImpl(String id, Map<String, String> properties)
  {
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
    return this.users.get(userId);
  }

  public IUser createUser(String userId, Map<String, String> properties)
  {
    LocalTestUserImpl user = this.users.get(userId);
    if (user == null)
    {
      user = new LocalTestUserImpl(this, userId, properties);
      this.users.put(userId, user);
    }
    
    return user;
  }
 

  public void removeUser(IUser user)
  {
    this.users.remove(user.getId());
  }

  public void addUser(LocalTestUserImpl user)
  {
    this.users.put(user.getId(), user);
  }

  public List<IUser> getUsersByPropertyExactMatch(UserProperty prop, String value)
  {
    ArrayList<IUser> result = new ArrayList<IUser>();
    for (String userId : this.users.keySet())
    {
      LocalTestUserImpl user = this.users.get(userId);
      String propValue = user.getProperty(prop.toString());
      if (propValue != null && propValue.equalsIgnoreCase(value))
      {
        result.add(user);
      }
    }
    return result;
  }

  public List<IUser> getUsersByPropertySubString(UserProperty prop, String value)
  {
    ArrayList<IUser> result = new ArrayList<IUser>();
    if (value != null && value.length() > 0)
    {
      value = value.replaceAll("\\*", ".*");
      for (String userId : this.users.keySet())
      {
        LocalTestUserImpl user = this.users.get(userId);
        String propValue = user.getProperty(prop.toString());
        if (propValue != null && Pattern.matches(value, propValue))
        {
          result.add(user);
        }
      }
    }
    return result;
  }
}
