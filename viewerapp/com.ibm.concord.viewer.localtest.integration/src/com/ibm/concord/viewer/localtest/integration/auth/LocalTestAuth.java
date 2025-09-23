/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.localtest.integration.auth;

import java.io.IOException;
import java.util.List;
import java.util.logging.Logger;

import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import sun.misc.BASE64Decoder;

import com.ibm.concord.viewer.localtest.integration.members.LocalTestMembersModel;
import com.ibm.concord.viewer.localtest.integration.members.LocalTestUserImpl;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.auth.S2SCallHelper;
import com.ibm.concord.viewer.platform.directory.DirectoryComponentImpl;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
import com.ibm.concord.viewer.spi.exception.AuthenticationException;
import com.ibm.concord.viewer.spi.members.IMembersModel;
import com.ibm.concord.viewer.spi.members.IOrg;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.concord.viewer.spi.members.UserProperty;
import com.ibm.json.java.JSONObject;

public class LocalTestAuth implements IAuthenticationAdapter
{
  private static final Logger LOG = Logger.getLogger(LocalTestAuth.class.getName());

  private LocalTestMembersModel membersModel;

  private String s2sToken;

  public void init(JSONObject config)
  {
    s2sToken = S2SCallHelper.getToken();
  }

  private LocalTestMembersModel getMembersModel()
  {
    if (this.membersModel == null)
    {
      IDirectoryAdapter directoryAdapter = (IDirectoryAdapter) Platform.getComponent(DirectoryComponentImpl.COMPONENT_ID).getService(
          "viewer.storage");
      if (directoryAdapter != null)
      {
        IMembersModel model = directoryAdapter.getMembersModel();
        if (model instanceof LocalTestMembersModel)
        {
          this.membersModel = (LocalTestMembersModel) model;
        }
      }
    }

    return this.membersModel;
  }

  public UserBean getUserBean(String email) throws Exception
  {
    try
    {
      LocalTestMembersModel localMembersModel = this.getMembersModel();
      if (localMembersModel != null)
      {
        IOrg org = localMembersModel.getOrg(null);
        List<IUser> users = org.getUsersByPropertyExactMatch(UserProperty.PROP_EMAIL, email);
        if (users.size() > 0)
        {
          return new UserBean(users.get(0));
        }
        else
        {
          LOG.warning("No matched user.");
          return null;
        }
      }
      else
      {
        LOG.warning("Local member model is null!!");
        return null;
      }
    }
    catch (Exception e)
    {
      throw e;
    }
  }

  /**
   * Get the user according to the specified email address.
   * 
   * @param email
   * @return
   */
  private UserBean getUserByEmail(String email)
  {
    LocalTestMembersModel localMembersModel = this.getMembersModel();
    if (localMembersModel != null)
    {
      List<IOrg> orgList = localMembersModel.listOrgs();
      int len = orgList != null ? orgList.size() : 0;
      for (int index = 0; index < len; index++)
      {
        IOrg org = orgList.get(index);
        List<IUser> users = org.getUsersByPropertyExactMatch(UserProperty.PROP_EMAIL, email);
        if (users != null && users.size() > 0)
        {
          UserBean userBean = new UserBean(users.get(0));
          return userBean;
        }
      }
    }

    return null;
  }

  private UserBean authenticate(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException
  {
    HttpSession session = request.getSession();
    UserBean user = (UserBean) session.getAttribute(UserBean.class.getName());
    if (user != null)
    {
      return user;
    }

    try
    {
      String token = request.getHeader("s2stoken");
      String email = request.getHeader("onBehalfOf");
      if (email != null && s2sToken != null && s2sToken.equalsIgnoreCase(token))
      {
        user = getUserByEmail(email);
        if (user != null)
        {
          session.setAttribute(LocalTestAuth.class.getName(), user);
        }
        return user;
      }

      String authorization = request.getHeader("authorization");
      if ((authorization != null) && (authorization.toUpperCase().startsWith(HttpServletRequest.BASIC_AUTH)))
      {
        String userpassEncoded = authorization.substring(HttpServletRequest.BASIC_AUTH.length() + 1);
        BASE64Decoder decoder = new BASE64Decoder();
        String userpassDecoded = new String(decoder.decodeBuffer(userpassEncoded));
        int index = userpassDecoded.indexOf(':');
        String username = userpassDecoded.substring(0, index);
        String password = userpassDecoded.substring(index + 1, userpassDecoded.length());

        user = verify(username, password);
        if (user != null)
        {
          session.setAttribute(UserBean.class.getName(), user);
        }
        return user;
      }
    }
    catch (Exception e)
    {
      throw new AuthenticationException(e.getMessage());
    }
    return null;
  }

  private UserBean verify(String username, String password)
  {
    LocalTestMembersModel localMembersModel = this.getMembersModel();
    if (localMembersModel != null)
    {
      IOrg org = localMembersModel.getOrg(null);
      List<IUser> users = org.getUsersByPropertyExactMatch(UserProperty.PROP_EMAIL, username);

      for (IUser user : users)
      {
        String savedPassword = user.getProperty(LocalTestUserImpl.PROP_PASSWORD);
        if (savedPassword != null && savedPassword.equals(password))
        {
          UserBean userBean = new UserBean(user);
          return userBean;
        }
      }
    }

    return null;
  }

  private void finalAction(HttpServletRequest request, HttpServletResponse response)
  {
    String realmName = "/index.html";
    response.addHeader("WWW-Authenticate", HttpServletRequest.BASIC_AUTH + " realm=\"" + realmName + "\"");
    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
  }

  public void destroy()
  {
  }

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    HttpServletRequest hrequest = (HttpServletRequest) request;
    HttpServletResponse hresponse = (HttpServletResponse) response;
    UserBean user = null;
    try
    {
      user = authenticate(hrequest, hresponse);
    }
    catch (AuthenticationException e)
    {
      hresponse.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    if (user == null)
    {
      finalAction(hrequest, hresponse);
    }
    else
    {
      hrequest.setAttribute(REQUEST_USER, user);
      chain.doFilter(hrequest, hresponse);
    }
  }

  public void init(FilterConfig filterConfig) throws ServletException
  {
  }

}
