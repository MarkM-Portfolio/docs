package com.ibm.docs.directory.external.members;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ibm.docs.directory.members.IMemberBase;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;

public class ExternalProfilesMembersModel implements IMembersModel
{
  private HashMap<String, ExternalProfilesOrgImpl> orgs = new HashMap<String, ExternalProfilesOrgImpl>();

  private ExternalProfilesOrgImpl createDefaultOrg()
  {
    ExternalProfilesOrgImpl org = new ExternalProfilesOrgImpl(this, IMemberBase.DEFAULT_ORG_ID, null);
    orgs.put(IMemberBase.DEFAULT_ORG_ID, org);

    return org;
  }
  
  @Override
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

  @Override
  public IOrg createOrg(String orgId, Map<String, String> properties)
  {
    ExternalProfilesOrgImpl org = this.orgs.get(orgId);
    if (org == null)
    {
      org = new ExternalProfilesOrgImpl(this, orgId, properties);
      this.orgs.put(orgId, org);
    }

    return org;
  }

  @Override
  public void removeOrg(IOrg org)
  {
    this.orgs.remove(org.getId());
  }

  @Override
  public List<IOrg> listOrgs()
  {
    ArrayList<IOrg> orgList = new ArrayList<IOrg>();

    if (!this.orgs.isEmpty())
    {
      Collection<ExternalProfilesOrgImpl> orgs = this.orgs.values();
      orgList.addAll(orgs);
    }

    return orgList;
  }

}
