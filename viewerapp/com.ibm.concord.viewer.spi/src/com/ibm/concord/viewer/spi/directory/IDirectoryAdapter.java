/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.directory;

import java.util.List;

import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.members.IMembersModel;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public interface IDirectoryAdapter
{
  public void init(JSONObject config);
  
  /**
   * Get a person's profile by id.
   * The id maybe a number, a email address, or a distinguish name, depending on implementation
   * @param caller
   *        caller of this request
   * @param id
   *        identifier of a person
   * @return
   *        profile information of a person, null if non-exists.
   */
  public UserBean getById(UserBean caller, String id);

  /**
   * Get a person's profile by id.
   * The id maybe a number, a email address, or a distinguish name, depending on implementation
   * @param caller
   *        caller of this request
   * @param id
   *        email of a person
   * @return
   *        profile information of a person, null if non-exists.
   */
  public UserBean getByEmail(UserBean caller, String email);

  public List<UserBean> search(UserBean user, String query);
  
  public IMembersModel getMembersModel();
  
}
