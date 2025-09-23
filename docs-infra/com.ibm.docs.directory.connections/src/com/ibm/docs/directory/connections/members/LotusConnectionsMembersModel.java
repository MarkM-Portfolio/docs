/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.connections.members;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ibm.connections.directory.services.DSProvider;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;

public class LotusConnectionsMembersModel implements IMembersModel
{
  public static final String DEFAULT_ORG_ID = "default_org";
  
  private DSProvider dsProvider;
  private HashMap<String, LotusConnectionsOrgImpl> orgs = new HashMap<String, LotusConnectionsOrgImpl>();
  
  public LotusConnectionsMembersModel(DSProvider dsProvider)
  {
    this.dsProvider = dsProvider;
  }
  
  public IOrg getOrg(String orgId)
  {
    if (orgId != null)
    {
      return this.orgs.get(orgId);
    }
    else
    {
      IOrg org = this.orgs.get(LotusConnectionsMembersModel.DEFAULT_ORG_ID);
      if (org == null)
      {
        org = this.createDefaultOrg();
      }
      
      return org;
    }
  }

  public IOrg createOrg(String orgId, Map<String, String> properties)
  {
    LotusConnectionsOrgImpl org = this.orgs.get(orgId);
    if (org == null)
    {
      org = new LotusConnectionsOrgImpl(this, orgId, properties);
      this.orgs.put(orgId, org);
    }
    
    return org;
  }
  
  private LotusConnectionsOrgImpl createDefaultOrg()
  {
    LotusConnectionsOrgImpl org = new LotusConnectionsOrgImpl(this, LotusConnectionsMembersModel.DEFAULT_ORG_ID, null);
    orgs.put(LotusConnectionsMembersModel.DEFAULT_ORG_ID, org);
    
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
      Collection<LotusConnectionsOrgImpl> orgs = this.orgs.values();
      orgList.addAll(orgs);
    }
    
    return orgList;
  }

  public DSProvider getDSProvider()
  {
    return this.dsProvider;
  }
}
