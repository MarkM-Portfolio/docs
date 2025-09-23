/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.external.directory;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
import com.ibm.concord.viewer.spi.members.IMembersModel;
import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.docs.viewer.external.util.Constants;
import com.ibm.json.java.JSONObject;

public class ExternalDirectory implements IDirectoryAdapter
{ 
  private static final Logger LOG = Logger.getLogger(ExternalDirectory.class.getName());
  
  private final String DEFAULT_PROFILES_URL = "https://abc.com/profiles";
  
  private final String PROFILES_URL = "profiles_url";
  
  private final String OAUTH_AUTHORIZE_ENDPOINT = "oauth2_endpoint";
  
  private String oauthAuthorizeURL;  
  
  private String customerId;
  
  AbstractExternalDirectoryImpl adapterImpl;

  public void init(JSONObject config)
  {
    if (config != null)
    {
      oauthAuthorizeURL = (String) config.get(OAUTH_AUTHORIZE_ENDPOINT);
      LOG.log(Level.INFO, "The value OAUTH_AUTHORIZE_ENDPOINT is: " + oauthAuthorizeURL);    
      customerId = (String) config.get(Constants.KEY_OAUTH2_CUSTOMER_ID);
      LOG.log(Level.INFO, "The value KEY_OAUTH2_CUSTOMER_ID is: " + customerId);
      
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
  
  public String getOAuthAuthorizeURL() {
    return oauthAuthorizeURL;
  }
  
  public String getCustomerId() {
    return customerId;
  }
}