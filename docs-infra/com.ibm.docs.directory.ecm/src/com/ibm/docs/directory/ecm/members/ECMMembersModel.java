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

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;

public class ECMMembersModel implements IMembersModel
{

  public static final String DEFAULT_ORG_ID = "default_org";

  private HashMap<String, ECMOrgImpl> orgs = new HashMap<String, ECMOrgImpl>();

  public IOrg getOrg(String orgId)
  {
    if (orgId != null)
    {
      return this.orgs.get(orgId);
    }
    else
    {
      IOrg org = this.orgs.get(ECMMembersModel.DEFAULT_ORG_ID);
      if (org == null)
      {
        org = this.createDefaultOrg();
      }

      return org;
    }
  }

  public IOrg createOrg(String orgId, Map<String, String> properties)
  {
    ECMOrgImpl org = orgs.get(orgId);
    if (org == null)
    {
      org = new ECMOrgImpl(orgId, properties);
      this.orgs.put(orgId, org);
    }

    return org;
  }

  private ECMOrgImpl createDefaultOrg()
  {
    ECMOrgImpl org = new ECMOrgImpl(ECMMembersModel.DEFAULT_ORG_ID, null);
    orgs.put(ECMMembersModel.DEFAULT_ORG_ID, org);

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
      Collection<ECMOrgImpl> orgs = this.orgs.values();
      orgList.addAll(orgs);
    }

    return orgList;
  }
}
