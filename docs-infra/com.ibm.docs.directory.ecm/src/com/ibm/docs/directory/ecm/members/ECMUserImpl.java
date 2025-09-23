/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.ecm.members;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.IUser;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.json.java.JSONObject;

public class ECMUserImpl implements IUser
{
  public static final String PROP_PRINCIPALID = "principal_id";
  
  private ECMMembersModel model;

  private String id;

  private HashMap<String, String> properties = new HashMap<String, String>();

  public ECMUserImpl(ECMMembersModel model, JSONObject jsonUser)
  {
    this.model = model;
    if (jsonUser != null)
    {
      this.id = (String) jsonUser.get("id");
      String reposId = (String) jsonUser.get("repos_id");
      if (reposId == null)
      {
        reposId = "DEFAULT_REPOID";
      }

      String orgId = (String) jsonUser.get("org_id");
      if (orgId == null)
      {
        orgId = ECMMembersModel.DEFAULT_ORG_ID;
      }

      this.properties.put(UserProperty.PROP_DISPLAYNAME.toString(), (String) jsonUser.get("name"));
      this.properties.put(UserProperty.PROP_DN.toString(), id);
      this.properties.put(UserProperty.PROP_EMAIL.toString(), (String) jsonUser.get("email"));
      this.properties.put(UserProperty.PROP_ORGID.toString(), orgId);
      this.properties.put(UserProperty.PROP_CUSTOMERID.toString(), orgId);
      this.properties.put(UserProperty.PROP_REPOID.toString(), reposId);
      this.properties.put(UserProperty.PROP_ROLEID.toString(), "1");
      this.properties.put(UserProperty.PROP_ROLENAME.toString(), "1");
      this.properties.put(UserProperty.PROP_SHORTNAME.toString(), (String) jsonUser.get("shortName"));
    }
  }

  public ECMUserImpl(ECMMembersModel model, String id, Map<String, String> properties)
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

  public IOrg getOrg()
  {
    String orgId = this.getProperty(UserProperty.PROP_ORGID.toString());
    IOrg org = this.model.getOrg(orgId);
    if (org == null)
    {
      org = this.model.createOrg(orgId, null);
    }
    return org;
  }

}
