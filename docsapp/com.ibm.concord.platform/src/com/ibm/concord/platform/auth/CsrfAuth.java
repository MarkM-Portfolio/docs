/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.auth;

import java.io.IOException;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class CsrfAuth
{
  private static CsrfAuth instance = null;

  private static final String CSRF_HEADER_NAME = "X-Csrf-Token";

  private static final String CSRF_TIMESTAMP = "X-Timestamp";

  private static final Logger LOG = Logger.getLogger(CsrfAuth.class.getName());

  public static CsrfAuth getInstance()
  {
    if (instance == null)
    {
      instance = new CsrfAuth();
    }
    return instance;
  }

  public boolean isEmptyToken(HttpServletRequest request)
  {
    LOG.entering("CsrfAuth", "isEmptyToken", new Object[] { request.getContextPath() });
    String csrfHeader = request.getHeader(CSRF_HEADER_NAME);
    String csrfTime = request.getHeader(CSRF_TIMESTAMP);
    return this.isEmptyToken(csrfHeader, csrfTime);
  }

  /**
   * To verify csrf token in form submit requests
   * 
   * @param userBean
   *          user
   * @param formData
   *          csrf token from none ajax requests
   * @return whether the csrf token is valid
   */
  public boolean verify(UserBean userBean, String formData)
  {
    LOG.entering("CsrfAuth", "verify", new Object[] { formData });
    boolean verified = false;
    try
    {
      JSONObject csrfObj = JSONObject.parse(formData);
      String csrfHeader = (String) csrfObj.get(CSRF_HEADER_NAME);
      String csrfTime = (String) csrfObj.get(CSRF_TIMESTAMP);
      verified = verify(userBean, csrfHeader, csrfTime);
    }
    catch (IOException e)
    {
      LOG.warning("Failed to parse csrf form token!" + e);
    }

    LOG.exiting("CsrfAuth", "verify", new Object[] { verified });
    return verified;
  }

  /**
   * To verify csrf token in http header
   * 
   * @param request
   *          http request
   * @return whether the csrf token is valid
   */
  public boolean verify(HttpServletRequest request)
  {
    LOG.entering("CsrfAuth", "verify", new Object[] { request.getContextPath() });

    UserBean userBean = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    String csrfHeader = request.getHeader(CSRF_HEADER_NAME);
    String csrfTime = request.getHeader(CSRF_TIMESTAMP);
    boolean verified = verify(userBean, csrfHeader, csrfTime);

    LOG.exiting("CsrfAuth", "verify", new Object[] { verified });
    return verified;
  }

  private boolean verify(UserBean userBean, String csrfHeader, String csrfTime)
  {
    if (this.isEmptyToken(csrfHeader, csrfTime))
    {
      LOG.warning("No CSRF Header information");
    }
    else
    {
      if (userBean != null)
      {
        String id = userBean.getId();

        String seed = id + "@@" + csrfTime.substring(4, csrfTime.length() - 1) + "##";
        String token = ConcordUtil.generateMD5Id(seed);

        if (token != null && token.equals(csrfHeader))
        {
          return true;
        }
      }
      else
      {
        LOG.warning("UserBean is null!!");
      }
    }
    return false;
  }

  private boolean isEmptyToken(String token, String timeStamp)
  {
    if (token == null || token.length() <= 0)
      return true;
    if (timeStamp == null || timeStamp.length() <= 4)
      return true;

    return false;
  }

}
