/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
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

import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.entitlement.EntitlementConstants;
import com.ibm.concord.config.ConcordConfig;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.ecm.members.ECMMembersModel;
import com.ibm.docs.directory.ecm.members.ECMUserImpl;
import com.ibm.docs.authentication.util.EntitlmentUtil;
import com.ibm.docs.authentication.util.URLMatcher;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.json.java.JSONObject;

public class ECMAuth implements IAuthenticationAdapter
{
  private static final Logger LOG = Logger.getLogger(ECMAuth.class.getName());

  private static final String REDIRECT_PARAM = "redirect";

  private static final String APIREQUEST_URI = "/api";

  private static final String LOGIN_URI = "/login";

  private static String s2sToken = null;

  private IDirectoryAdapter directoryAdapter;

  private static final Set<URLMatcher> URL_PATTERN = new HashSet<URLMatcher>();

  static
  {
    Map<String, String> params = new HashMap<String, String>();
    params.put("asFormat", "pdf");
    URLMatcher matcher = new URLMatcher("/app/doc/([^/]+)/([^/]+)/view/content", params);
    URL_PATTERN.add(matcher);
    matcher = new URLMatcher("/api/job/([^/]+)/([^/]+)/([^/]+)", new HashMap<String, String>());
    URL_PATTERN.add(matcher);
  }

  public void init(JSONObject config)
  {
    directoryAdapter = (IDirectoryAdapter) ((DirectoryComponent) ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID))
        .getService(IDirectoryAdapter.class, "ecm");

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
    Principal j2eePrincipal = request.getUserPrincipal();
    String userId = request.getHeader("onBehalfOf");
    UserBean userBean = (UserBean) session.getAttribute(ECMAuth.class.getName());
    String adminRole = "NONE";
    String token = request.getHeader("s2stoken");
    boolean trustedCall = false; // s2s call
    if (userId != null)
    {
      if (request.isUserInRole(EntitlementConstants.USER_ROLE_ADMIN))
      {
        trustedCall = true;
        adminRole = EntitlementConstants.USER_ROLE_ADMIN;
      }
      else if (j2eePrincipal != null)
      { // for federated LDAP, the isUserInRole does not work
        trustedCall = true;
      }
      else if (s2sToken != null && s2sToken.equalsIgnoreCase(token))
      {
        LOG.log(Level.WARNING, "This request comes from server side via server to server token. and is onhehalf of {0}, s2s token is not supported", userId);  
      }
      else
      {
        //do nothing and will redirect to login page
      }
    }
    if (LOG.isLoggable(Level.FINE))
    {
      LOG.log(Level.FINE, "The parameters for request {0} are : {1} {2} {3} {4} {5} {6}", new Object[] {request.getRequestURL(), adminRole, j2eePrincipal,
          userId, token, trustedCall, userBean});
    }
    if (userId != null && trustedCall)
    {// server to server call
      response.setHeader("X-LConn-Auth", "true");
      if (j2eePrincipal == null)
      {
        redirectToLogin(request, response);
        return;
      }
      if ((userBean == null) || (!userId.equals(userBean.getId())))
      {
        JSONObject jsonObj = new JSONObject();
        jsonObj.put("id", userId);
        jsonObj.put("name", "s2sFakeUser");
        jsonObj.put("email", "s2sFakeEmail");
        ECMUserImpl userImpl = new ECMUserImpl(new ECMMembersModel(), jsonObj);
        userBean = new UserBean(userImpl);
        session.setAttribute(ECMAuth.class.getName(), userBean);
      }
      request.setAttribute(REQUEST_USER, userBean);
      chain.doFilter(request, response);
    }
    else
    {// request from normal clients
      if (j2eePrincipal == null)
      {
        // client not authenticated
        redirectToLogin(request, response);
        return;
      }
      else if (userBean == null)
      {
        String principalId = j2eePrincipal.getName();
        userBean = directoryAdapter.getById(null, null);
        if(userBean == null)
        {
          LOG.log(Level.SEVERE, "Pls check ECM settings in concord-config file!");
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
          return;
        }
        userBean.setProperty(ECMUserImpl.PROP_PRINCIPALID, principalId);
        if (LOG.isLoggable(Level.FINEST))
        {
          LOG.log(Level.FINEST, "The j2eePrincipal of the request {0} is {1} who belongs to {2}.", new Object[] {
              request.getRequestURI(), principalId, userBean.getCustomerId() });
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
            LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format("The user %s is not entitled.",
                userBean.getId())).toString());
            String uri = request.getRequestURI();
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

        session.setAttribute(ECMAuth.class.getName(), userBean);
        request.setAttribute(REQUEST_USER, userBean);

        chain.doFilter(request, response);
        if (noEntitleCheck)
        {
          session.setAttribute(ECMAuth.class.getName(), null);
        }
      }
      else
      {
        // session has combined with a user
        // check if authenticated user does not match with session
        String principalId = userBean.getProperty(ECMUserImpl.PROP_PRINCIPALID);
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
    String queryString = (request.getQueryString() != null) ? "?" + request.getQueryString() : "";
    String loginUrl = request.getContextPath() + LOGIN_URI;
    String redirectUrl = loginUrl + "?" + REDIRECT_PARAM + "="
        + URLEncoder.encode(request.getRequestURL().toString() + queryString, "UTF-8");
    response.sendRedirect(response.encodeRedirectURL(redirectUrl));
  }

  public void init(FilterConfig filterConfig) throws ServletException
  {

  }
}
