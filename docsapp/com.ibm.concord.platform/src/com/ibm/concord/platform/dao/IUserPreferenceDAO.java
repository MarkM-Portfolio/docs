/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.dao;

import java.util.HashMap;

import com.ibm.concord.platform.bean.UserPreferenceBean;

/**
 * @author gaowwei@cn.ibm.com
 *
 */
public interface IUserPreferenceDAO
{
  /**
   * @param bean
   * @return
   */
  public boolean add(UserPreferenceBean bean);

  /**
   * @param id
   *        user's id
   * @return
   */
  public UserPreferenceBean getById(String userid, String prop_key);

  /**
   * @param bean
   * @return
   */
  public boolean update(UserPreferenceBean bean);

  /**
   * @param bean
   * @return
   */
  public boolean delete(UserPreferenceBean bean);

  /**
   * 
   * @param userId
   * @return
   */
  public boolean delete(String userid);
  
  
  public HashMap<String,UserPreferenceBean> getAllById(String userid);
}
