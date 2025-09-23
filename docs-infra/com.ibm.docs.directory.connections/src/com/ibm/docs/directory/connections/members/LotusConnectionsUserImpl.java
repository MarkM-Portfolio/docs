/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2012, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.connections.members;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.connections.directory.services.data.DSObject;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.IUser;
import com.ibm.docs.directory.members.UserProperty;

public class LotusConnectionsUserImpl implements IUser
{
  private static final Logger LOG = Logger.getLogger(LotusConnectionsUserImpl.class.getName());
  
  public static final String PROP_PRINCIPALID = "principal_id";
  
  private LotusConnectionsMembersModel model;
  private String id;
  private HashMap<String, String> properties = new HashMap<String, String>();
  
  public LotusConnectionsUserImpl(LotusConnectionsMembersModel model, DSObject dsUser)
  {
    this.model = model;
    LOG.log(Level.FINEST, "LotusConnectionsUserImpl: model=[{0}]", new Object[] { model });

    if (dsUser != null)
    {
      this.id = dsUser.get_id();
      String reposId = dsUser.get_reposid();
      LOG.log(Level.FINEST, "LotusConnectionsUserImpl: 1) reposId=[{0}]", new Object[] { reposId });
      if (reposId == null)
      {
        reposId = "DEFAULT_REPOID";
      }
      LOG.log(Level.FINEST, "LotusConnectionsUserImpl: 2) reposId=[{0}]", new Object[] { reposId });
      
      String orgId = dsUser.get_orgid();
      LOG.log(Level.FINEST, "LotusConnectionsUserImpl: 1) orgId=[{0}]", new Object[] { orgId });
      if (orgId == null)
      {
        orgId = LotusConnectionsMembersModel.DEFAULT_ORG_ID;
      }
      LOG.log(Level.FINEST, "LotusConnectionsUserImpl: 2) orgId=[{0}]", new Object[] { orgId });
      
      this.properties.put(UserProperty.PROP_DISPLAYNAME.toString(), dsUser.get_name());
      this.properties.put(UserProperty.PROP_DN.toString(), dsUser.get_dn());
      this.properties.put(UserProperty.PROP_EMAIL.toString(), dsUser.get_email());
      boolean isExternal = false;
      try
      {
        isExternal = dsUser.is_user_external();
      }
      catch (Throwable e)
      {
        LOG.log(Level.INFO, "No is_user_external method in DSObject ", e);
      }
      this.properties.put(UserProperty.PROP_ISEXTERNAL.toString(), String.valueOf(isExternal));
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
