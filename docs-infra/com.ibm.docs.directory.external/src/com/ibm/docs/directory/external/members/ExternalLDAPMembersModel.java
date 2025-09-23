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

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ibm.connections.directory.services.DSProvider;
import com.ibm.docs.directory.members.IMemberBase;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;

public class ExternalLDAPMembersModel implements IMembersModel
{
  private DSProvider dsProvider;

  private HashMap<String, ExternalLDAPOrgImpl> orgs = new HashMap<String, ExternalLDAPOrgImpl>();

  public ExternalLDAPMembersModel(DSProvider dsProvider)
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
      IOrg org = this.orgs.get(IMemberBase.DEFAULT_ORG_ID);
      if (org == null)
      {
        org = this.createDefaultOrg();
      }

      return org;
    }
  }

  public IOrg createOrg(String orgId, Map<String, String> properties)
  {
    ExternalLDAPOrgImpl org = this.orgs.get(orgId);
    if (org == null)
    {
      org = new ExternalLDAPOrgImpl(this, orgId, properties);
      this.orgs.put(orgId, org);
    }

    return org;
  }

  private ExternalLDAPOrgImpl createDefaultOrg()
  {
    ExternalLDAPOrgImpl org = new ExternalLDAPOrgImpl(this, IMemberBase.DEFAULT_ORG_ID, null);
    orgs.put(IMemberBase.DEFAULT_ORG_ID, org);

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
      Collection<ExternalLDAPOrgImpl> orgs = this.orgs.values();
      orgList.addAll(orgs);
    }

    return orgList;
  }

  public DSProvider getDSProvider()
  {
    return this.dsProvider;
  }

}
