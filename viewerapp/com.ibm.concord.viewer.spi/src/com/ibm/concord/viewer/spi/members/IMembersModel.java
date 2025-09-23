/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.members;

import java.util.List;
import java.util.Map;

public interface IMembersModel
{
  /**
   * Get an organization by ID.
   * @param orgId The id of the organization to get. If this is null, default organization is returned.
   * @return An instance of organization
   */
  public IOrg getOrg(String orgId);
  
  /**
   * Create an organization
   * @param orgId the identifier for organization to be created.
   * @param properties the properties to be applied to new organization.
   * @return An organization created.
   */
  public IOrg createOrg(String orgId, Map<String, String> properties);
  
  /**
   * Remove an organization from model
   * @param org organization to be removed.
   */
  public void removeOrg(IOrg org);
  
  /**
   * List all organizations in model
   * @return a list of organizations.
   */
  public List<IOrg> listOrgs();
}
