/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2014, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.authentication.filters;

import java.io.IOException;
import java.net.URLEncoder;
import java.security.Principal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
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

import com.ibm.docs.authentication.util.EntitlmentUtil;
import com.ibm.docs.authentication.util.URLMatcher;
import com.ibm.docs.authentication.util.PatternResolver;
import com.ibm.concord.config.ConcordConfig;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.entitlement.EntitlementConstants;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.connections.directory.services.DSProvider;
import com.ibm.connections.directory.services.DSProviderFactory;
import com.ibm.connections.directory.services.data.DSObject;
import com.ibm.connections.directory.services.exception.DSException;
import com.ibm.connections.directory.services.exception.DSNotImplementedException;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.connections.members.LotusConnectionsMembersModel;
import com.ibm.docs.directory.connections.members.LotusConnectionsUserImpl;
import com.ibm.docs.directory.members.IMembersModel;
import com.ibm.json.java.JSONObject;

/**
 * @author gaowwei@cn.ibm.com
 */
public class LotusConnectionsAuth implements IAuthenticationAdapter
{
  private static final Logger LOG = Logger.getLogger(LotusConnectionsAuth.class.getName());

  private static final String APP_NAME = "docs";

  protected static DSProvider DIRECTORY_SERVICE;

  private static final String REDIRECT_PARAM = "redirect";

  private static final String APIREQUEST_URI = "/api";

  private static final String LOGIN_URI = "/login";

  private static final String AUTH_TYPE = "auth_type";

  private static final String AUTH_TYPE_TAM = "TAM";

  private static final String AUTH_HOST = "auth_host";

  private static boolean isMultitenancy = false;

  private static String s2sToken = null;

  private static String authType = null;

  private static String authHost = null;

  private static final Set<URLMatcher> URL_PATTERN = new HashSet<URLMatcher>();

  static
  {
    DIRECTORY_SERVICE = DSProviderFactory.INSTANCE.getProfileProvider();
    Map<String, String> params = new HashMap<String, String>();
    params.put("asFormat", "pdf");
    URLMatcher matcher = new URLMatcher("/app/doc/([^/]+)/([^/]+)/view/content", params);
    URL_PATTERN.add(matcher);
    matcher = new URLMatcher("/api/job/([^/]+)/([^/]+)/([^/]+)", new HashMap<String, String>());
    URL_PATTERN.add(matcher);
  }

  private LotusConnectionsMembersModel membersModel;

  private LotusConnectionsMembersModel getMembersModel()
  {
    if (this.membersModel == null)
    {
      IDirectoryAdapter directoryAdapter = (IDirectoryAdapter) ComponentRegistry.getInstance()
          .getComponent(DirectoryComponent.COMPONENT_ID).getService(IDirectoryAdapter.class);
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
    if (config != null)
    {
      authType = (String) config.get(AUTH_TYPE);
      authHost = (String) config.get(AUTH_HOST);
    }

    JSONObject multitenancyConfig = ConcordConfig.getInstance().getSubConfig("multitenancy");
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
    s2sToken = ConcordConfig.getInstance().getS2SToken();
  }

  public void destroy()
  {
    ;
  }

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
  }

  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    HttpSession session = request.getSession();
    UserBean userBean = (UserBean) session.getAttribute(LotusConnectionsAuth.class.getName());

    Principal j2eePrincipal = request.getUserPrincipal();
    String userId = request.getHeader("onBehalfOf");
    String token = request.getHeader("s2stoken");
    boolean trustedCall = false;
    if (userId != null)
    {
      if (request.isUserInRole(EntitlementConstants.USER_ROLE_ADMIN))
      {
        trustedCall = true;
        if(LOG.isLoggable(Level.FINE))
        {
          LOG.fine("the user {0} is accessing request {1} via j2c alias");
        }
      }
      else if (j2eePrincipal != null)
      { // for federated LDAP, the isUserInRole does not work
        trustedCall = true;
      }
      else if (s2sToken != null && s2sToken.equalsIgnoreCase(token))
      {
        // s2s token is not supported!
      }
      else
      {
        // nothing
      }
    }

    if (j2eePrincipal == null)
    {
      if (LOG.isLoggable(Level.FINE))
      {
        LOG.log(Level.FINE, "The j2eePrincipal is null for request {0}", new Object[] { request.getRequestURL() });
      }
      redirectToLogin(request, response);
      return;
    }

    if (userId != null && trustedCall)
    {
      response.setHeader("X-LConn-Auth", "true");
      if (LOG.isLoggable(Level.FINE))
      {
        LOG.log(Level.FINE, "The user {0} is accessing the request {1} via s2s call and user bean is {2}.", new Object[] { userId, request.getRequestURI(), userBean});
      }
      if ((userBean == null) || (!userId.equals(userBean.getId())))
      {
        try
        {
          DSObject dsObj = DIRECTORY_SERVICE.searchDSObjectByExactIdMatch(userId, DSObject.ObjectType.PERSON);

          LotusConnectionsUserImpl user = new LotusConnectionsUserImpl(this.getMembersModel(), dsObj);
          userBean = new UserBean(user);
          session.setAttribute(LotusConnectionsAuth.class.getName(), userBean);
        }
        catch (DSException e)
        {
          LOG.log(Level.WARNING, "Exception happens while searching user by directory service according to s2s call user id", e);
          redirectToLogin(request, response);
          return;
        }
      }
      request.setAttribute(REQUEST_USER, userBean);
      chain.doFilter(request, response);
    }
    else
    {
      if (userBean == null)
      {
        // client authenticated, but hasn't been combined with session
        String principalId = j2eePrincipal.getName();
        if (LOG.isLoggable(Level.FINE))
        {
          LOG.log(Level.FINE, "The user {0} is accessing the request {1} and user bean is {2}.", new Object[] { principalId, request.getRequestURI(), userBean});
        }
        DSObject dsOrg = null;
        if (isMultitenancy)
        {
          try
          {
            PatternResolver resolver = PatternResolver.getServicePattern(APP_NAME, request.isSecure());

            StringBuilder patternUrl = new StringBuilder();
            patternUrl.append(request.getScheme()).append("://").append(request.getHeader("Host"));
            if (resolver != null)
            {
              String segment = resolver.extractSegmentFromUrl(patternUrl.toString());
              dsOrg = DIRECTORY_SERVICE.searchOrganizationByExactURLMatch(segment);
              if (LOG.isLoggable(Level.FINEST))
              {
                LOG.log(Level.FINEST, "Looking up org {0} by resolved segment {1} for host {2}",
                    new Object[] { dsOrg, segment, patternUrl.toString() });
              }
            }
            else
            {
              LOG.log(Level.WARNING, "not found tenant resolver for {0} {1}", new Object[] { APP_NAME, request.isSecure() });
            }
          }
          catch (DSNotImplementedException e)
          {
            LOG.log(Level.WARNING, "Search Org Not Supported.", e);
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
            LOG.log(Level.FINEST, "MultiTenant: DIRECTORY_SERVICE.searchUserSubscriptionByExactLoginUserIdAndOrgIdMatch: principalId=[{0}] dsOrg=[{1}]", new Object[] { principalId, dsOrg });
            dsObj = DIRECTORY_SERVICE.searchUserSubscriptionByExactLoginUserIdAndOrgIdMatch(principalId, dsOrg == null ? null : dsOrg.get_id());
            LOG.log(Level.FINEST, "MultiTenant: DS results: {0}", new Object[] { dsObj });
          }
          else
          {
            LOG.log(Level.FINEST, "SingleTenant: DIRECTORY_SERVICE.searchAccountByExactLoginUserNameMatch: principalId=[{0}]", new Object[] { principalId });
            dsObj = DIRECTORY_SERVICE.searchAccountByExactLoginUserNameMatch(principalId);
            LOG.log(Level.FINEST, "SingleTenant: DS results: {0}", new Object[] { dsObj });
          }

          LotusConnectionsUserImpl user = new LotusConnectionsUserImpl(this.getMembersModel(), dsObj);
          user.setProperty(LotusConnectionsUserImpl.PROP_PRINCIPALID, principalId);
          LOG.log(Level.FINEST, "user from LotusConnectionsUserImpl DS results: membersRole=[{0}] user=[{1}]", new Object[] { this.getMembersModel(), user });
          
          userBean = new UserBean(user);
          LOG.log(Level.FINEST, "userBean from user: {0}", new Object[] { userBean });

          if (userBean.getId() == null)
          {
            LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), "The id of user id is null.").toString());
            request.setAttribute("error_code", 1002);
            request.getRequestDispatcher("/WEB-INF/pages/error.jsp").forward(request, response);
            return;
          }
          boolean noEntitleCheck = false;
          if (!EntitlmentUtil.checkEntitlement(request, userBean, true))
          {
            /**
             * This is a hack for mobile client to download odf as pdf format.
             * 
             * @Fixme
             */
            noEntitleCheck = EntitlmentUtil.isURLAllowed4Mobile(request, URL_PATTERN);
            if (noEntitleCheck)
            {
              if (LOG.isLoggable(Level.FINER))
              {
                LOG.log(Level.FINER, "The user {0} is not entitled is accessing Docs from mobile.", userBean.getId());
              }
            }
            else
            {
              String uri = request.getRequestURI();

              LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format("The user %s is not entitled.",
                  userBean.getId())).toString());

              if (uri.startsWith(request.getContextPath() + APIREQUEST_URI))
              {
                response.sendError(HttpServletResponse.SC_FORBIDDEN);
                return;
              }
              else
              {
                request.setAttribute("error_code", 1002);
                request.getRequestDispatcher("/WEB-INF/pages/error.jsp").forward(request, response);
                return;
              }
            }
          }
          session.setAttribute(LotusConnectionsAuth.class.getName(), userBean);
          request.setAttribute(REQUEST_USER, userBean);

          chain.doFilter(request, response);
          if (noEntitleCheck)
          {
            session.setAttribute(LotusConnectionsAuth.class.getName(), null);
          }
        }
        catch (DSException e)
        {
          LOG.log(Level.WARNING, "Exception happens while searching user by directory service", e);
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
          // user for current session has changed
          // invalidate current session
          try
          {
            LOG.log(Level.WARNING, new StringBuilder("Current session ").append(session.getId()).append(" is not valid for current user: ")
                .append(j2eePrincipal.getName()).append(" it's used by: ").append(userBean.getId()).toString());
            session.invalidate();
          }
          catch (IllegalStateException e)
          {
            // called on an already invalidated session
            LOG.log(Level.WARNING, "Exception happens while invalidate the http session.", e);
          }

          String uri = request.getRequestURI();
          if (uri.startsWith(request.getContextPath() + APIREQUEST_URI))
          {
            LOG.log(Level.WARNING, "{0} is not an authenticated user.", userBean.getId());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
          }
          else
          {
            response.sendRedirect(uri);
          }
          return;
        }
        else
        {
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
      try
      {
        response.setHeader("WWW-Authenticate", "XHR");
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        LOG.log(Level.WARNING, "Request is not authorized while accessing URL: {0}", uri);
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Error to send authorized error response for URL: {0}", uri);
      }
      return;
    }
    if (LOG.isLoggable(Level.FINE))
    {
      LOG.log(Level.FINE, "The authentication type is: {0}, the authentication host is: {1}.", new Object[] { authType, authHost });
    }

    if (authType != null && authType.equalsIgnoreCase(AUTH_TYPE_TAM))
    {
      if (authHost != null && authHost.length() > 0)
      {
        String redirectUrl = authHost + uri;
        response.sendRedirect(response.encodeRedirectURL(redirectUrl));
      }
      else
      {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
      }
    }
    else
    {
      String queryString = (request.getQueryString() != null) ? "?" + request.getQueryString() : "";
      String loginUrl = request.getContextPath() + LOGIN_URI;
      String redirectUrl = loginUrl + "?" + REDIRECT_PARAM + "="
          + URLEncoder.encode(request.getRequestURL().toString() + queryString, "UTF-8");
      response.sendRedirect(response.encodeRedirectURL(redirectUrl));
    }
  }

  public void init(FilterConfig filterConfig) throws ServletException
  {
    ;
  }
}
