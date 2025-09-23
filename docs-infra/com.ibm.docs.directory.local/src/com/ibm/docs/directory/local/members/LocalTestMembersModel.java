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
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class LocalTestMembersModel implements IMembersModel
{
  // Organization map. Organizations are keyed by id.
  private HashMap<String, LocalTestOrgImpl> orgs = new HashMap<String, LocalTestOrgImpl>();
  
  /**
   * @param jsonUsers a JSON array which contains users.
   */
  public LocalTestMembersModel(JSONArray jsonUsers)
  {
    for (Object o : jsonUsers)
    {
      if (o instanceof JSONObject)
      {
        JSONObject jsonUser = (JSONObject)o;
        Object orgId = ((JSONObject) o).get(UserProperty.PROP_ORGID.toString());
        if (orgId != null)
        {
          LocalTestOrgImpl org = (LocalTestOrgImpl)this.createOrg(orgId.toString(), null);
          LocalTestUserImpl user = new LocalTestUserImpl(org, jsonUser);
          org.addUser(user);
        }
      }
    }
  }

  public IOrg getOrg(String orgId)
  {
    if (orgId == null)
    {
      if (!this.orgs.isEmpty())
      {
        Object[] orgArray = this.orgs.values().toArray();
        if (orgArray[0] instanceof IOrg)
        {
          return (IOrg)orgArray[0];
        }
        
      }
      else
      {
        return null;
      }
    }
    return this.orgs.get(orgId);
  }

  public IOrg createOrg(String orgId, Map<String, String> properties)
  {
    LocalTestOrgImpl org = this.orgs.get(orgId);
    if (org == null)
    {
      org = new LocalTestOrgImpl(orgId, properties);
      this.orgs.put(orgId, org);
    }
    
    return org;
  }

  public void removeOrg(IOrg org)
  {
    this.orgs.remove(org.getId());
  }

  public List<IOrg> listOrgs()
  {
    ArrayList<IOrg> orgList = new ArrayList<IOrg>();
    
    if (!this.orgs.isEmpty())
    {
      Collection<LocalTestOrgImpl> orgs = this.orgs.values();
      orgList.addAll(orgs);
    }
    
    return orgList;
  }

}
