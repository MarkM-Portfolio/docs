/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lc3.members;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.members.UserProperty;
import com.ibm.connections.directory.services.data.DSObject;

public class LotusConnectionsUserImpl implements IUser
{
  public static final String PROP_PRINCIPALID = "principal_id";
  
  private LotusConnectionsMembersModel model;
  private String id;
  private HashMap<String, String> properties = new HashMap<String, String>();
  
  public LotusConnectionsUserImpl(LotusConnectionsMembersModel model, DSObject dsUser)
  {
    this.model = model;
    if (dsUser != null)
    {
      this.id = dsUser.get_id();
      String reposId = dsUser.get_reposid();
      if (reposId == null)
      {
        reposId = "DEFAULT_REPOID";
      }
      
      String orgId = dsUser.get_orgid();
      if (orgId == null)
      {
        orgId = LotusConnectionsMembersModel.DEFAULT_ORG_ID;
      }
      
      this.properties.put(UserProperty.PROP_DISPLAYNAME.toString(), dsUser.get_name());
      this.properties.put(UserProperty.PROP_DN.toString(), dsUser.get_dn());
      this.properties.put(UserProperty.PROP_EMAIL.toString(), dsUser.get_email());
      this.properties.put(UserProperty.PROP_ORGID.toString(), orgId);
      this.properties.put(UserProperty.PROP_CUSTOMERID.toString(), orgId);
      this.properties.put(UserProperty.PROP_REPOID.toString(), reposId);
      this.properties.put(UserProperty.PROP_ROLEID.toString(), Integer.toString(dsUser.get_role()));
      this.properties.put(UserProperty.PROP_ROLENAME.toString(), Integer.toString(dsUser.get_role()));
    }
  }
  
  public LotusConnectionsUserImpl(LotusConnectionsMembersModel model, String id, Map<String, String> properties)
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
