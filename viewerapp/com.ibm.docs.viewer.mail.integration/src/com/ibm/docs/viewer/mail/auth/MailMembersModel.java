/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.docs.viewer.mail.auth;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ibm.concord.viewer.spi.members.IMembersModel;
import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.connections.directory.services.DSProvider;

public class MailMembersModel implements IMembersModel
{
  public static final String DEFAULT_ORG_ID = "default_org";
  
  private DSProvider dsProvider;
  private HashMap<String, MailOrgImpl> orgs = new HashMap<String, MailOrgImpl>();
  
  public MailMembersModel(DSProvider dsProvider)
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
      IOrg org = this.orgs.get(MailMembersModel.DEFAULT_ORG_ID);
      if (org == null)
      {
        org = this.createDefaultOrg();
      }
      
      return org;
    }
  }

  public IOrg createOrg(String orgId, Map<String, String> properties)
  {
    MailOrgImpl org = this.orgs.get(orgId);
    if (org == null)
    {
      org = new MailOrgImpl(this, orgId, properties);
      this.orgs.put(orgId, org);
    }
    
    return org;
  }
  
  private MailOrgImpl createDefaultOrg()
  {
    MailOrgImpl org = new MailOrgImpl(this, MailMembersModel.DEFAULT_ORG_ID, null);
    orgs.put(MailMembersModel.DEFAULT_ORG_ID, org);
    
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
      Collection<MailOrgImpl> orgs = this.orgs.values();
      orgList.addAll(orgs);
    }
    
    return orgList;
  }

  public DSProvider getDSProvider()
  {
    return this.dsProvider;
  }
}
