/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.directory.lotuslive;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.directory.lotuslive.members.LotusLiveUserImpl;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.connections.directory.services.DSProvider;
import com.ibm.connections.directory.services.DSProviderFactory;
import com.ibm.connections.directory.services.data.DSObject;
import com.ibm.connections.directory.services.exception.DSException;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.json.java.JSONObject;

public class LotusLiveDirectory implements IDirectoryAdapter
{
  private static final Logger LOG = Logger.getLogger(LotusLiveDirectory.class.getName());
  
  private DSProvider dsProvider;
  public void init(JSONObject config)
  {
    dsProvider = DSProviderFactory.INSTANCE.getProfileProvider();
  }

  public UserBean getById(UserBean caller, String id)
  {
    DSObject dsObj = null;
    try
    {
      dsObj = dsProvider.searchDSObjectByExactIdMatch(id, DSObject.ObjectType.PERSON);
    }
    catch (DSException e)
    {
      LOG.log(Level.WARNING, "WALTZ error for searching " + id, e);
    }
    
    if(dsObj != null)
    {
      return createUser(dsObj);
    }
    else
    {
      // let's return a profile anyway
      return createMockUser(id);
    }
  }

  public IOrg getOrgById(String orgId)
  {
    return null;
  }
  
  public UserBean getByDN(UserBean caller, String DN)
  {
	  return null;
  }

  public UserBean getByEmail(UserBean caller, String email)
  {
    DSObject dsObj = null;
    try
    {
      dsObj = dsProvider.searchUserByExactEmailMatch(email);
    }
    catch (DSException e)
    {
      LOG.log(Level.WARNING, "WALTZ error for searching email", e);
    }
    
    if(dsObj != null)
    {
      return createUser(dsObj);
    }
    else
    {
      // let's return a profile anyway
      return createMockUser(email);
    }
  }

  public List<UserBean> search(UserBean caller, String query)
  {
    DSObject[] results = null;
    try {
      results = this.dsProvider.searchDSObjectByNameSubstringQuery(query, DSObject.ObjectType.PERSON, 100, caller.getOrgId());
      int cnt = results != null ? results.length : 0;
      LOG.log(Level.FINE, (new StringBuilder()).append("Performing directory search: [query: ").append(query).append(", orgId: ").append(caller.getOrgId()).append("]=").append(cnt).toString());
    }
    catch(DSException e)
    {
      LOG.log(Level.WARNING, "WALTZ error for searching " + query, e);
      return new ArrayList<UserBean>();
    }

    List<UserBean> users = new ArrayList<UserBean>();
    if (results == null)
      return users;
    
    for (int i = 0; i < results.length; i++)
    {
      DSObject dsObj = results[i];
      UserBean userBean = createUser(dsObj);
      // FIXME: WALTZ now returns all the result, let's filter it temporarily
      if (userBean.getOrgId().equals(caller.getOrgId()))
        users.add(userBean);
    }
    return users;
  }

  private UserBean createUser(DSObject dsObj)
  {
    LotusLiveUserImpl userImpl = new LotusLiveUserImpl(dsObj.get_id(), dsObj);
    UserBean userBean = new UserBean(userImpl);
    return userBean;
  }
  
  private UserBean createMockUser(String id)
  {
    LotusLiveUserImpl userImpl = new LotusLiveUserImpl(id, (DSObject)null);
    UserBean userBean = new UserBean(userImpl);
    return userBean;
  }
  
  public IMembersModel getMembersModel()
  {
    return null;
  }

}
