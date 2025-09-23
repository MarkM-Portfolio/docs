/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.mail.auth;

import java.io.IOException;
import java.security.Principal;
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

import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.auth.S2SCallHelper;
import com.ibm.concord.viewer.platform.directory.DirectoryComponentImpl;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
import com.ibm.concord.viewer.spi.members.IMembersModel;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.connections.directory.services.DSProvider;
import com.ibm.connections.directory.services.DSProviderFactory;
import com.ibm.connections.directory.services.data.DSObject;
import com.ibm.connections.directory.services.exception.DSException;
import com.ibm.json.java.JSONObject;

public class MailAuth implements IAuthenticationAdapter
{
  private static final Logger LOG = Logger.getLogger(MailAuth.class.getName());

  private static String APIREQUEST_URI = "/api";

  private static DSProvider DIRECTORY_SERVICE;

  static
  {
    DIRECTORY_SERVICE = DSProviderFactory.INSTANCE.getProfileProvider();
  }

  private MailMembersModel membersModel;

  @Override
  public void destroy()
  {
    // TODO Auto-generated method stub
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
  }

  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    LOG.entering(MailAuth.class.getName(), "doFilter");

    HttpSession session = request.getSession();
    UserBean userBean = (UserBean) session.getAttribute(UserBean.class.getName());

    UserBean newUserBean = WebSEAL.getInstance().verify(request, response);
    String userId = request.getHeader("onBehalfOf");
    boolean trustedCall = false;

    if (userId != null)
    {
      if (ViewerConfig.getInstance().isSmartCloud())
      { // SmartCloud
        if (S2SCallHelper.verifyNonEncoding(request))
        {
          trustedCall = true;
          LOG.log(Level.INFO, "Trusted S2S call in SmartCloud onhehalf of {0}. {1}", new Object[] { userId, request.getRequestURI() });
        }
        else
        {
          LOG.log(Level.WARNING, "Un-Trusted s2s call in SmartCloud onbehalf of {0} due to incorrect token! {1} ", new Object[] { userId,
              request.getRequestURI() });
        }
      }
      else
      {
        LOG.log(Level.WARNING, "Not support on-premise for viewernext enablement. {0}:{1} ",
            new Object[] { userId, request.getRequestURI() });
      }
    }
    if (userId != null && trustedCall)
    {
      LOG.log(Level.FINEST, "Trusted s2s call for:  {0} ", request.getRequestURI());
      response.setHeader("X-LConn-Auth", "true");
      Principal j2eePrincipal = request.getUserPrincipal();
      if (j2eePrincipal == null)
      {
        LOG.log(Level.WARNING, "S2S request without principal accepted:  {0} ", request.getRequestURI());
      }
      if ((userBean == null) || (!userId.equals(userBean.getId())))
      {
        if (userId.endsWith(IAuthenticationAdapter.S2S_USERID_CREATETHUMBANIL)
            || userId.equals(IAuthenticationAdapter.S2S_USERID_SANITYCHECK))
        {
          userBean = new UserBean(IUser.FAKE_USER);
        }
        else
        {
          try
          {
            userBean = getUserBean(userId);
          }
          catch (Exception e)
          {
            userBean = null;
            LOG.log(Level.WARNING, "Exception happens while searching user by directory service according to s2s call user id", e);
          }
        }
      }
      if (userBean != null)
      {
        session.setAttribute(UserBean.class.getName(), userBean);
      }
      else
      {
        redirectToLogin(request, response);
        return;
      }
      request.setAttribute(REQUEST_USER, userBean);
      chain.doFilter(request, response);
      return;
    }

    if (newUserBean == null)
    {
      LOG.log(Level.WARNING, "Unauthorized request: " + request.getRequestURI());
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    }
    else
    {
      if (userBean == null)
      {
        LOG.log(Level.INFO, "Combine authenticated user with session.");
        userBean = newUserBean;
      }
      else
      {
        if (!userBean.getId().equals(newUserBean.getId()))
        {
          LOG.log(Level.INFO, "Invalid session with different user. userBean ={0}; newUserBean={1}", new Object[] { userBean.getId(),
              newUserBean.getId() });
          String principalId = userBean.getDisplayName();
          try
          {
            session.invalidate();
          }
          catch (IllegalStateException e)
          {
            // called on an already invalidated session
            LOG.log(Level.WARNING, "Exception happens while invalidate the http session.", e);
          }
          StringBuffer msg = new StringBuffer();
          msg.append(ServiceCode.S_ERROR_NOT_AUTHENTICATED_USER);
          msg.append(" The user is ");
          msg.append(principalId);
          LOG.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_NOT_AUTHENTICATED_USER, msg.toString()));
          response.sendRedirect(request.getRequestURI().toString());
          return;
        }
      }
      LOG.log(Level.INFO, "Found the user {0} for request: {1}", new Object[] { userBean.getId(), request.getRequestURI() });
      session.setAttribute(UserBean.class.getName(), userBean);
      request.setAttribute(REQUEST_USER, userBean);
      chain.doFilter(request, response);
    }

    LOG.exiting(MailAuth.class.getName(), "doFilter");
    return;
  }

  private void redirectToLogin(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    String uri = request.getRequestURI();
    if (uri.startsWith(request.getContextPath() + APIREQUEST_URI))
    {
      response.setHeader("WWW-Authenticate", "XHR");
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
      LOG.log(Level.WARNING, "This is API request: " + uri);
    }
  }

  @Override
  public void init(FilterConfig arg0) throws ServletException
  {
    // TODO Auto-generated method stub
  }

  @Override
  public void init(JSONObject config)
  {
    this.membersModel = new MailMembersModel(DSProviderFactory.INSTANCE.getProfileProvider());

  }

  @Override
  public UserBean getUserBean(final String id) throws Exception
  {
    LOG.entering(MailAuth.class.getName(), "getUserBean", id);
    try
    {
      DSObject dsObj = DIRECTORY_SERVICE.searchDSObjectByExactIdMatch(id, DSObject.ObjectType.PERSON);
      if (dsObj == null)
      {
        LOG.exiting(MailAuth.class.getName(), "getUserBean - Not hit!", null);
        return null;
      }

      MailUserImpl user = new MailUserImpl(this.getMembersModel(), dsObj);
      UserBean userBean = new UserBean(user);
      LOG.log(Level.INFO, "Found the user {0} by directory service according to s2s call user id", userBean.getId());
      return userBean;
    }
    catch (DSException e)
    {
      throw new Exception(e);
    }
  }

  private MailMembersModel getMembersModel()
  {
    if (this.membersModel == null)
    {
      IDirectoryAdapter directoryAdapter = (IDirectoryAdapter) Platform.getComponent(DirectoryComponentImpl.COMPONENT_ID).getService(
          "viewer.storage");
      if (directoryAdapter != null)
      {
        IMembersModel model = directoryAdapter.getMembersModel();
        if (model instanceof MailMembersModel)
        {
          this.membersModel = (MailMembersModel) model;
        }
      }
    }
    return this.membersModel;
  }
}
