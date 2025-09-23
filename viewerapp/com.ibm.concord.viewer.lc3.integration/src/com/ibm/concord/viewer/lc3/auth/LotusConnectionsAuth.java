/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.lc3.auth;

import java.io.IOException;
import java.net.URL;
import java.net.URLEncoder;
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
import com.ibm.concord.viewer.lc3.members.LotusConnectionsMembersModel;
import com.ibm.concord.viewer.lc3.members.LotusConnectionsUserImpl;
import com.ibm.concord.viewer.lc3.util.PatternResolver;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.auth.S2SCallHelper;
import com.ibm.concord.viewer.platform.directory.DirectoryComponentImpl;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.members.IMembersModel;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.connections.directory.services.DSProvider;
import com.ibm.connections.directory.services.DSProviderFactory;
import com.ibm.connections.directory.services.data.DSObject;
import com.ibm.connections.directory.services.exception.DSException;
import com.ibm.connections.directory.services.exception.DSNotImplementedException;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class LotusConnectionsAuth implements IAuthenticationAdapter
{
  private static final Logger LOG = Logger.getLogger(LotusConnectionsAuth.class.getName());

  private static final String APP_NAME = "viewer";

  protected static DSProvider DIRECTORY_SERVICE;

  private static String REDIRECT_PARAM = "redirect";

  private static String APIREQUEST_URI = "/api";

  private static String LOGIN_URI = "/login";

  private static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  private static final String ATTR_ERROR_CODE = "error_code";

  private static String AUTH_TYPE = "auth_type";

  private static String AUTH_HOST = "auth_host";

  enum AuthType {
    BASIC, FORM, TAM
  }

  private static AuthType authType = null;

  private static String authHost = null;

  private static boolean isMultitenancy = false;

  private static final String CLASS_NAME = LotusConnectionsAuth.class.getName();

  static
  {
    DIRECTORY_SERVICE = DSProviderFactory.INSTANCE.getProfileProvider();
  }

  private LotusConnectionsMembersModel membersModel;

  private LotusConnectionsMembersModel getMembersModel()
  {
    if (this.membersModel == null)
    {
      IDirectoryAdapter directoryAdapter = (IDirectoryAdapter) Platform.getComponent(DirectoryComponentImpl.COMPONENT_ID).getService(
          "viewer.storage");
      if (directoryAdapter != null)
      {
        IMembersModel model = directoryAdapter.getMembersModel();
        if (model instanceof LotusConnectionsMembersModel)
        {
          this.membersModel = (LotusConnectionsMembersModel) model;
        }
      }
    }
    return this.membersModel;
  }

  public void init(JSONObject config)
  {
    LOG.entering(CLASS_NAME, "init");

    if (config != null)
    {
      try
      {
        authType = AuthType.valueOf(((String) config.get(AUTH_TYPE)).toUpperCase());
        if (AuthType.TAM.equals(authType))
        {
          authHost = new URL((String) config.get(AUTH_HOST)).toString();
        }

        LOG.info(new StringBuffer("Authentication type is ").append(authType).append(".  Authentication host is ").append(authHost)
            .toString());
      }
      catch (Exception e)
      {
        LOG.warning("Error occured when parsing authentication.  Config is " + config.toString());
        authType = null;
        authHost = null;
      }
    }

    JSONObject multitenancyConfig = Platform.getViewerConfig().getSubConfig("multitenancy");
    if (multitenancyConfig != null)
    {
      isMultitenancy = Boolean.valueOf((String) multitenancyConfig.get("enablement"));

      String tenantPattern = (String) multitenancyConfig.get("tenant_pattern");
      if (tenantPattern != null)
      {
        PatternResolver.setServicePattern(APP_NAME, false, tenantPattern);
      }
      else
      {
        LOG.warning("tenant_pattern was missing from multitenancy configuration.");
      }

      String secureTenantPattern = (String) multitenancyConfig.get("secure_tenant_pattern");
      if (secureTenantPattern != null)
      {
        PatternResolver.setServicePattern(APP_NAME, true, secureTenantPattern);
      }
      else
      {
        LOG.warning("secure_tenant_pattern was missing from multitenancy configuration.");
      }
    }

    LOG.log(Level.INFO, "Multitennacy enabled: " + isMultitenancy);

    LOG.exiting(CLASS_NAME, "init");
  }

  public void destroy()
  {
  }

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
  }

  public UserBean getUserBean(String id) throws Exception
  {
    try
    {
      DSObject dsObj = DIRECTORY_SERVICE.searchDSObjectByExactIdMatch(id, DSObject.ObjectType.PERSON);
      if (dsObj == null)
      {
        return null;
      }

      LotusConnectionsUserImpl user = new LotusConnectionsUserImpl(this.getMembersModel(), dsObj);
      UserBean userBean = new UserBean(user);
      LOG.log(Level.INFO, "Found the user {0} by directory service according to s2s call user id", userBean.getId());
      return userBean;
    }
    catch (DSException e)
    {
      throw new Exception(e);
    }
  }

  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    HttpSession session = request.getSession();
    UserBean userBean = (UserBean) session.getAttribute(UserBean.class.getName());
    StringBuffer msg = new StringBuffer();

    Principal j2eePrincipal = request.getUserPrincipal();
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
      { // on-premise
        if (request.isUserInRole(ViewerUtil.USER_ROLE_ADMIN))
        {
          trustedCall = true;
          LOG.log(Level.INFO, "Trusted S2S call in On-premise act as admin {0} onhehalf of {1}. {2}", new Object[] {
              ViewerUtil.USER_ROLE_ADMIN, userId, request.getRequestURI() });
        }
        else if (j2eePrincipal != null)
        {
          if (S2SCallHelper.verify(request))
          {
            trustedCall = true;
            LOG.log(Level.INFO, "Trusted S2S call in On-premise onbehalf of {0} with s2sToken. {1}",
                new Object[] { userId, request.getRequestURI() });
          }
          else
          {
            LOG.log(Level.WARNING, "Un-Trusted s2s call in On-premise onbehalf of {0} due to incorrect token! {1} ", new Object[] { userId,
                request.getRequestURI() });
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
          }
        }
        else
        {
          LOG.log(Level.WARNING, "Un-Trusted s2s call in On-premise onbehalf of {0} without principal. {1} ",
              new Object[] { userId, request.getRequestURI() });
        }
      }
    }

    if (userId != null && trustedCall)
    {
      LOG.log(Level.FINEST, "Trusted call for:  {0} ", request.getRequestURI());
      response.setHeader("X-LConn-Auth", "true");
      if (j2eePrincipal == null)
      {
        LOG.log(Level.WARNING, "S2S request without principal accepted:  {0} ", request.getRequestURI());
      }
      if ((userBean == null) || (!userId.equals(userBean.getId())))
      {
        if (userId.endsWith(IAuthenticationAdapter.S2S_USERID_CREATETHUMBANIL))
        {
          userBean = new UserBean(IUser.FAKE_USER);
        }
        else
        {
          try
          {
            userBean = getUserBean(userId);
            session.setAttribute(UserBean.class.getName(), userBean);
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "Exception happens while searching user by directory service according to s2s call user id", e);
            redirectToLogin(request, response);
            return;
          }
        }

      }
      request.setAttribute(REQUEST_USER, userBean);
      chain.doFilter(request, response);
    }
    else
    {
      if (j2eePrincipal == null)
      {
        // client not authenticated
        msg = new StringBuffer();
        msg.append(ServiceCode.S_INFO_PRINCIPAL_EMPTY);
        LOG.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_PRINCIPAL_EMPTY, msg.toString()));
        redirectToLogin(request, response);
        return;
      }
      else if (userBean == null)
      {
        // client authenticated, but hasn't been combined with session
        String principalId = j2eePrincipal.getName();

        DSObject dsOrg = null;
        if (isMultitenancy)
        {
          try
          {
            PatternResolver resolver = PatternResolver.getServicePattern(APP_NAME, request.isSecure());

            StringBuilder patternUrl = new StringBuilder();
            patternUrl.append(request.getScheme()).append("://").append(request.getHeader("Host"));

            LOG.log(Level.INFO, "Looking up org for host {0}", patternUrl.toString());

            if (resolver != null)
            {
              String segment = resolver.extractSegmentFromUrl(patternUrl.toString());
              dsOrg = DIRECTORY_SERVICE.searchOrganizationByExactURLMatch(segment);
            }
            else
            {
              LOG.log(Level.WARNING, "not found tenant resolver for {0} {1}", new Object[] { APP_NAME, request.isSecure() });
            }

            LOG.log(Level.INFO, "Found the organization {0} by directory service.", dsOrg.toString());
          }
          catch (DSNotImplementedException e)
          {
            LOG.log(Level.WARNING, "Exception happens while searching organization by directory service");
          }
          catch (DSException e)
          {
            LOG.log(Level.WARNING, "Exception happens while searching organization by directory service", e);
            redirectToLogin(request, response);
          }
        }

        try
        {
          DSObject dsObj = null;
          if (isMultitenancy)
          {
            dsObj = DIRECTORY_SERVICE.searchUserSubscriptionByExactLoginUserIdAndOrgIdMatch(principalId,
                dsOrg == null ? null : dsOrg.get_id());
          }
          else
          {
            dsObj = DIRECTORY_SERVICE.searchAccountByExactLoginUserNameMatch(principalId);
          }

          LotusConnectionsUserImpl user = new LotusConnectionsUserImpl(this.getMembersModel(), dsObj);
          user.setProperty(LotusConnectionsUserImpl.PROP_PRINCIPALID, principalId);
          userBean = new UserBean(user);

          if (userBean.getId() == null)
          {
            LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), " No Edit Permission . ").toString());
            request.setAttribute("error_code", RepositoryAccessException.EC_REPO_NOEDITPERMISSION);
            request.getRequestDispatcher(ERROR_JSP).forward(request, response);
            return;
          }

          session.setAttribute(UserBean.class.getName(), userBean);
          request.setAttribute(REQUEST_USER, userBean);

          chain.doFilter(request, response);
        }
        catch (DSException e)
        {
          redirectToLogin(request, response);
        }
      }
      else
      {
        // session has combined with a user
        // check if authenticated user does not match with session
        String principalId = userBean.getProperty(LotusConnectionsUserImpl.PROP_PRINCIPALID);
        if (principalId == null || !principalId.equals(j2eePrincipal.getName()))
        {
          LOG.log(Level.FINEST, "Call with invalid userBean for :  {0} ", request.getRequestURI());
          // user for current session has changed
          // invalidate current session
          try
          {
            session.invalidate();
          }
          catch (IllegalStateException e)
          {
            // called on an already invalidated session
            LOG.log(Level.WARNING, "Exception happens while invalidate the http session.", e);
          }
          if (principalId != null)
          {
            msg = new StringBuffer();
            msg.append(ServiceCode.S_ERROR_NOT_AUTHENTICATED_USER);
            msg.append(" The user is ");
            msg.append(principalId);
            LOG.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_NOT_AUTHENTICATED_USER, msg.toString()));
            // Refresh the page
            response.sendRedirect(request.getRequestURL().toString());
          }
          else
          {
            LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), " No View Permission . ").toString());
            request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_NOVIEWPERMISSION);
            request.getRequestDispatcher(ERROR_JSP).forward(request, response);
          }

          return;
        }
        else
        {
          LOG.log(Level.FINEST, "Call with valid userBean for :  {0} ", request.getRequestURI());
          request.setAttribute(REQUEST_USER, userBean);
          chain.doFilter(request, response);
        }
      }
    }
  }

  private void redirectToLogin(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    String uri = request.getRequestURI();
    if (uri.startsWith(request.getContextPath() + APIREQUEST_URI))
    {
      response.setHeader("WWW-Authenticate", "XHR");
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
      LOG.log(Level.WARNING, "This is API request: " + uri);
      return;
    }
    String redirectUrl = null;
    if (AuthType.TAM.equals(authType))
    {
      redirectUrl = authHost + uri;
    }
    else
    {
      String queryString = (request.getQueryString() != null) ? "?" + request.getQueryString() : "";
      String loginUrl = request.getContextPath() + LOGIN_URI;
      redirectUrl = loginUrl + "?" + REDIRECT_PARAM + "=" + URLEncoder.encode(request.getRequestURL().toString() + queryString, "UTF-8");
    }
    try
    {
      response.sendRedirect(response.encodeRedirectURL(redirectUrl));
    }
    catch (IllegalStateException e)
    {
      LOG.fine("Login exception caught. Check if it's upload conversion in SAML env.");
    }
  }

  public void init(FilterConfig filterConfig) throws ServletException
  {
  }
}
