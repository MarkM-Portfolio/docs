/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.external.members;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import com.ibm.connections.directory.services.data.DSObject;
import com.ibm.docs.directory.members.IMemberBase;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.IUser;
import com.ibm.docs.directory.members.UserProperty;

public class ExternalLDAPUserImpl implements IUser
{
  private ExternalLDAPMembersModel model;

  private String id;

  private HashMap<String, String> properties = new HashMap<String, String>();

  public ExternalLDAPUserImpl(ExternalLDAPMembersModel model, DSObject dsUser)
  {
    this.model = model;
    if (dsUser != null)
    {
      this.id = dsUser.get_id();
      String reposId = dsUser.get_reposid();
      if (reposId == null)
      {
        reposId = "DEFAULT_EXTERNAL_REPOID";
      }

      String orgId = dsUser.get_orgid();
      if (orgId == null)
      {
        orgId = IMemberBase.DEFAULT_ORG_ID;
      }

      this.properties.put(UserProperty.PROP_DISPLAYNAME.toString(), dsUser.get_name());
      this.properties.put(UserProperty.PROP_DN.toString(), dsUser.get_dn());
      this.properties.put(UserProperty.PROP_EMAIL.toString(), dsUser.get_email());
      this.properties.put(UserProperty.PROP_ISEXTERNAL.toString(), String.valueOf(false));
      this.properties.put(UserProperty.PROP_ORGID.toString(), orgId);
      this.properties.put(UserProperty.PROP_CUSTOMERID.toString(), orgId);
      this.properties.put(UserProperty.PROP_REPOID.toString(), reposId);
      this.properties.put(UserProperty.PROP_ROLEID.toString(), Integer.toString(dsUser.get_role()));
      this.properties.put(UserProperty.PROP_ROLENAME.toString(), Integer.toString(dsUser.get_role()));
    }
  }

  public ExternalLDAPUserImpl(ExternalLDAPMembersModel model, String id, Map<String, String> properties)
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
