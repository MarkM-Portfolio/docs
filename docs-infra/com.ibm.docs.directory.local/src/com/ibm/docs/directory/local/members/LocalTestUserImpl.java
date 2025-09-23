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

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.IUser;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.json.java.JSONObject;

public class LocalTestUserImpl implements IUser
{
  public static final String PROP_ID = "id";
  public static final String PROP_PASSWORD = "password";
  
  private String id;
  private LocalTestOrgImpl org;
  private HashMap<String, String> properties = new HashMap<String, String>();
  
  public LocalTestUserImpl(LocalTestOrgImpl org, JSONObject jsonUser)
  {
    this.org = org;
    
    Object value = jsonUser.get(PROP_ID);
    this.id = value.toString();
    
    value = jsonUser.get(PROP_PASSWORD);
    if (value != null)
    {
      this.properties.put(PROP_PASSWORD, value.toString());
    }
    
    for (UserProperty prop : UserProperty.values())
    {
      value = jsonUser.get(prop.toString());
      if (value != null)
      {
        this.properties.put(prop.toString(), value.toString());
      }
    }
  }
  
  public LocalTestUserImpl(LocalTestOrgImpl org, String userId, Map<String, String> properties)
  {
    this.org = org;
    this.id = userId;
    
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

  public IOrg getOrg()
  {
    return this.org;
  }
}
