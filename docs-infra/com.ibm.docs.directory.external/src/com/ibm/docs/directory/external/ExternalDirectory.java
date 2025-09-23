/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.external;

import java.util.List;
import java.util.logging.Logger;

import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.json.java.JSONObject;

public class ExternalDirectory implements IDirectoryAdapter
{ 
  private static final Logger LOG = Logger.getLogger(ExternalDirectory.class.getName());
  
  private final String DEFAULT_PROFILES_URL = "https://abc.com/profiles";
  
  private final String PROFILES_URL = "profiles_url";
  
  AbstractExternalDirectoryImpl adapterImpl;

  public void init(JSONObject config)
  {
    if (config != null)
    {
      String profileURL = (String)config.get(PROFILES_URL);
      if (profileURL != null && !profileURL.isEmpty() && !profileURL.equalsIgnoreCase(DEFAULT_PROFILES_URL))
      {
        adapterImpl = new ExternalProfilesDirectoryImpl(config);
        return;
      }
    }
    adapterImpl = new ExternalLDAPDirectoryImpl(config);
  }
  
  public UserBean getById(UserBean caller, String id)
  {    
    return adapterImpl.getById(caller, id);
  }  

  public List<UserBean> search(UserBean user, String query)
  {
    return adapterImpl.search(user, query);
  }

  public UserBean getByDN(UserBean caller, String DN)
  {
    return adapterImpl.getByDN(caller, DN);
  }

  public UserBean getByEmail(UserBean caller, String email)
  {
    return adapterImpl.getByEmail(caller, email);
  }

  public IMembersModel getMembersModel()
  {
    return adapterImpl.getMembersModel();    
  }

  public IOrg getOrgById(String orgId)
  {
    return adapterImpl.getOrgById(orgId);
  }
  
}
