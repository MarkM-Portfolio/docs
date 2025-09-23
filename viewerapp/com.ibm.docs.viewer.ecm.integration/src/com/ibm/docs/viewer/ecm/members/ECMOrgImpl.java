/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.ecm.members;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.members.UserProperty;

public class ECMOrgImpl implements IOrg
{
  private String id;

  private HashMap<String, String> properties;

  public ECMOrgImpl(String id, Map<String, String> properties)
  {
    this.id = id;
    this.properties = new HashMap<String, String>();
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
    // Cannot getUser in this implementation
    return null;
  }

  public List<IUser> getUsersByPropertyExactMatch(UserProperty prop, String value)
  {
    // Cannot getUsersByPropertyExactMatch in this implementation
    return null;
  }

  public List<IUser> getUsersByPropertySubString(UserProperty prop, String value)
  {
    // Cannot getUsersByPropertySubString in this implementation
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
