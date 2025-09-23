package com.ibm.docs.directory.external.members;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.IUser;
import com.ibm.docs.directory.members.UserProperty;

public class ExternalProfilesOrgImpl implements IOrg
{
  private ExternalProfilesMembersModel model;

  private String id;

  private HashMap<String, String> properties;

  public ExternalProfilesOrgImpl(ExternalProfilesMembersModel model, String id, Map<String, String> properties)
  {
    this.model = model;
    this.id = id;
    this.properties = new HashMap<String, String>();
    if (properties != null && !properties.isEmpty())
    {
      this.properties.putAll(properties);
    }
  }

  @Override
  public String getId()
  {
    return this.id;
  }

  @Override
  public String getProperty(String key)
  {
    return this.properties.get(key);
  }

  @Override
  public void setProperty(String key, String value)
  {
    this.properties.put(key, value);
  }

  @Override
  public Set<String> listProperties()
  {
    return this.properties.keySet();
  }

  @Override
  public IUser getUser(String userId)
  {
    // Cannot getUser in this implementation
    return null;
  }

  @Override
  public List<IUser> getUsersByPropertyExactMatch(UserProperty prop, String value)
  {
    // Cannot getUsersByPropertyExactMatch in this implementation
    return null;
  }

  @Override
  public List<IUser> getUsersByPropertySubString(UserProperty prop, String value)
  {
    // Cannot getUsersByPropertySubString in this implementation
    return null;
  }

  @Override
  public IUser createUser(String userId, Map<String, String> properties)
  {
    // Cannot create user in this implementation
    return null;
  }

  @Override
  public void removeUser(IUser user)
  {
    // Cannot remove user in this implementation
  }

}
