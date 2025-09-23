/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.authentication.filters;

import java.io.IOException;
import java.util.List;
import java.util.logging.Level;
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

import com.ibm.concord.config.ConcordConfig;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.concord.spi.exception.AuthenticationException;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.local.members.LocalTestMembersModel;
import com.ibm.docs.directory.local.members.LocalTestUserImpl;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.docs.directory.members.IOrg;
import com.ibm.docs.directory.members.IUser;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.directory.members.Subscriber;
import com.ibm.docs.entitlement.IEntitlementService.EntitlementLevel;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.json.java.JSONObject;

public class LocalTestAuth implements IAuthenticationAdapter
{
  private static final Logger LOG = Logger.getLogger(LocalTestAuth.class.getName());

  private static final String USER_ROLE_ENTITLED = "entitledDocsUser4DefaultLevel";

  private static final String USER_ROLE_FULL_ENTITLED = "entitledDocsUser4FullLevel";

  private static final String USER_ROLE_SOCIAL_ENTITLED = "entitledDocsUser4SocialLevel";

  private static final String USER_ROLE_BASIC_ENTITLED = "entitledDocsUser4BasicLevel";

  private static EntitlementLevel defaultLevel4AutoProvision = EntitlementLevel.FULL;

  private LocalTestMembersModel membersModel;

  private static String s2sToken = null;

  public void init(JSONObject config)
  {
    s2sToken = ConcordConfig.getInstance().getS2SToken();
  }

  private LocalTestMembersModel getMembersModel()
  {
    if (this.membersModel == null)
    {
      IDirectoryAdapter directoryAdapter = (IDirectoryAdapter) ComponentRegistry.getInstance()
          .getComponent(DirectoryComponent.COMPONENT_ID).getService(IDirectoryAdapter.class);
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

  private UserBean authenticate(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException
  {
    HttpSession session = request.getSession();
    UserBean user = (UserBean) session.getAttribute(LocalTestAuth.class.getName());
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
          if (!checkEntitlement(request, user, true))
          {
            user = null;
          }
          else
          {
            session.setAttribute(LocalTestAuth.class.getName(), user);
          }
        }
        return user;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Authenticating failed.", e);
      throw new AuthenticationException(e.getMessage());
    }
    return null;
  }

  private UserBean verify(String username, String password)
  {
    LocalTestMembersModel localMembersModel = this.getMembersModel();
    if (localMembersModel != null)
    {
      List<IOrg> orgList = localMembersModel.listOrgs();
      int len = orgList != null ? orgList.size() : 0;
      for (int index = 0; index < len; index++)
      {
        IOrg org = orgList.get(index);
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
    }

    return null;
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

  private void finalAction(HttpServletRequest request, HttpServletResponse response)
  {
    String realmName = "/index.html";
    response.addHeader("WWW-Authenticate", HttpServletRequest.BASIC_AUTH + " realm=\"" + realmName + "\"");
    LOG.log(Level.WARNING, "Unauthorized user.");
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
      LOG.log(Level.WARNING, "Access forbidden because failed to authenticate.");
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

  private boolean checkEntitlement(HttpServletRequest request, UserBean userBean, boolean doProvision)
  {
    IEntitlementService entitlementSvr = (IEntitlementService) ComponentRegistry.getInstance()
        .getComponent(EntitlementComponent.COMPONENT_ID).getService(IEntitlementService.class);
    if (request.isUserInRole(USER_ROLE_ENTITLED) || true)
    {
      if (userBean.getId() != null && doProvision && EntitlementLevel.NONE == entitlementSvr.getEntitlementLevel(userBean))
      {
        Subscriber subscriber = new Subscriber(userBean.getId(), userBean.getCustomerId(), Subscriber.TYPE_USER, "",
            userBean.getDisplayName(), userBean.getEmail(), Subscriber.STATE_ACTIVE, defaultLevel4AutoProvision.toString());
        entitlementSvr.addSubscriber(subscriber);
        userBean.setProperty(UserProperty.PROP_ENTITLEMENT.toString(), defaultLevel4AutoProvision.toString());
        LOG.log(Level.FINE, "The newly entitled user {0} was added into subscriber table for entitlement level {1}.", new Object[] {
            userBean.getId(), defaultLevel4AutoProvision.toString() });
      }
      return true;
    }
    else if (request.isUserInRole(USER_ROLE_FULL_ENTITLED))
    {
      if (userBean.getId() != null && doProvision && EntitlementLevel.NONE == entitlementSvr.getEntitlementLevel(userBean))
      {
        Subscriber subscriber = new Subscriber(userBean.getId(), userBean.getCustomerId(), Subscriber.TYPE_USER, "",
            userBean.getDisplayName(), userBean.getEmail(), Subscriber.STATE_ACTIVE, EntitlementLevel.FULL.toString());
        entitlementSvr.addSubscriber(subscriber);
        userBean.setProperty(UserProperty.PROP_ENTITLEMENT.toString(), EntitlementLevel.FULL.toString());
        LOG.log(Level.FINE, "The newly entitled user {0} was added into subscriber table for entitlement level {1}.", new Object[] {
            userBean.getId(), EntitlementLevel.FULL.toString() });
      }
      return true;
    }
    else if (request.isUserInRole(USER_ROLE_SOCIAL_ENTITLED))
    {
      if (userBean.getId() != null && doProvision && EntitlementLevel.NONE == entitlementSvr.getEntitlementLevel(userBean))
      {
        Subscriber subscriber = new Subscriber(userBean.getId(), userBean.getCustomerId(), Subscriber.TYPE_USER, "",
            userBean.getDisplayName(), userBean.getEmail(), Subscriber.STATE_ACTIVE, EntitlementLevel.SOCIAL.toString());
        entitlementSvr.addSubscriber(subscriber);
        userBean.setProperty(UserProperty.PROP_ENTITLEMENT.toString(), EntitlementLevel.SOCIAL.toString());
        LOG.log(Level.FINE, "The newly entitled user {0} was added into subscriber table for entitlement level {1}.", new Object[] {
            userBean.getId(), EntitlementLevel.SOCIAL.toString() });
      }
      return true;
    }
    else if (request.isUserInRole(USER_ROLE_BASIC_ENTITLED))
    {
      if (userBean.getId() != null && doProvision && EntitlementLevel.NONE == entitlementSvr.getEntitlementLevel(userBean))
      {
        Subscriber subscriber = new Subscriber(userBean.getId(), userBean.getCustomerId(), Subscriber.TYPE_USER, "",
            userBean.getDisplayName(), userBean.getEmail(), Subscriber.STATE_ACTIVE, EntitlementLevel.BASIC.toString());
        entitlementSvr.addSubscriber(subscriber);
        userBean.setProperty(UserProperty.PROP_ENTITLEMENT.toString(), EntitlementLevel.BASIC.toString());
        LOG.log(Level.FINE, "The newly entitled user {0} was added into subscriber table for entitlement level {1}.", new Object[] {
            userBean.getId(), EntitlementLevel.BASIC.toString() });
      }
      return true;
    }
    else
    {
      if (userBean.getId() != null && doProvision && EntitlementLevel.NONE != entitlementSvr.getEntitlementLevel(userBean))
      {
        entitlementSvr.removeSubscriber(userBean.getId(), Subscriber.TYPE_USER);
        LOG.log(Level.FINE, "The entitled user {0} was deleted from subscriber table.", userBean.getId());
      }
      return false;
    }
  }
}
