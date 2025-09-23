/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.spi.auth;

import javax.servlet.Filter;

import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public interface IAuthenticationAdapter extends Filter
{
  public static final String REQUEST_USER = "request.user";

  public static final String REQUEST_USER_ID = "userid";

  public static final String S2S_USERID_CREATETHUMBANIL = "s2sCall.createThumbnail";
  
  public static final String S2S_USERID_SANITYCHECK="sanity@ibm.com";

  public void init(JSONObject config);

  /**
   * Only used for the event from News
   * 
   * @param id
   *          the user id
   * @return
   * @throws Exception
   */
  public UserBean getUserBean(String id) throws Exception;
}
