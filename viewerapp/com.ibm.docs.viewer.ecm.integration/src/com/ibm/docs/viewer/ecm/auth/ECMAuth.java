/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.viewer.ecm.auth;

import java.io.IOException;
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
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.auth.S2SCallHelper;
import com.ibm.concord.viewer.platform.directory.DirectoryComponentImpl;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.members.IUser;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.viewer.ecm.members.ECMMembersModel;
import com.ibm.docs.viewer.ecm.members.ECMUserImpl;
import com.ibm.json.java.JSONObject;

public class ECMAuth implements IAuthenticationAdapter
{
  private static final Logger LOG = Logger.getLogger(ECMAuth.class.getName());

  private IDirectoryAdapter directoryAdapter;

  private static final String REDIRECT_PARAM = "redirect";

  private static final String APIREQUEST_URI = "/api";

  private static final String LOGIN_URI = "/login";

  private static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  private static final String ATTR_ERROR_CODE = "error_code";

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
    HttpSession session = request.getSession();
    Principal j2eePrincipal = request.getUserPrincipal();
    String userId = request.getHeader("onBehalfOf");
    UserBean userBean = (UserBean) session.getAttribute(UserBean.class.getName());

    boolean trustedCall = false; // s2s call
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
          LOG.log(Level.WARNING, "Un-Trusted s2s call in On-premise onbehalf of {0} without principal. ",
              new Object[] { userId, request.getRequestURI() });
        }
      }
    }

    if (userId != null && trustedCall)
    {
      // trusted s2s call
      LOG.log(Level.FINEST, "Trusted call for:  {0} ", request.getRequestURI());
      response.setHeader("X-LConn-Auth", "true");
      if (j2eePrincipal == null)
      {
        LOG.log(Level.WARNING, "S2S request without principal accepted:  {0} ", request.getRequestURI());
      }
      if ((userBean == null) || (!userId.equals(userBean.getId())))
      {
        LOG.log(Level.FINEST, "Trusted call with different id for:  {0} ", request.getRequestURI());
        if (request.getRequestURI().contains("/viewer/upload"))
        {
          userBean = new UserBean(IUser.ECM_DEFAULT_USER);
        }
        else
        {
          JSONObject jsonObj = new JSONObject();
          jsonObj.put("id", userId);
          jsonObj.put("name", "s2sFakeUser");
          jsonObj.put("email", "s2sFakeEmail");
          ECMUserImpl userImpl = new ECMUserImpl(new ECMMembersModel(), jsonObj);
          userBean = new UserBean(userImpl);
        }

        session.setAttribute(UserBean.class.getName(), userBean);
        LOG.log(Level.INFO, "Generated the user {0} according to s2s call user id", userBean.getId());
      }
      request.setAttribute(REQUEST_USER, userBean);
      chain.doFilter(request, response);
    }
    else
    {
      // request from normal clients
      if (j2eePrincipal == null)
      {
        LOG.log(Level.FINEST, "Call without j2eePrincipal for :  {0} ", request.getRequestURI());
        if (request.getRequestURI().contains("/thumbnails/ecm"))
        {
          UserBean user = new UserBean(IUser.ANONYMOUS_USER);
          request.setAttribute(IAuthenticationAdapter.REQUEST_USER, user);
          chain.doFilter(request, response);
          return;
        }
        if (userBean != null)
        {
          LOG.log(Level.WARNING, "Did not find the j2ee principal for user {0}.", userBean.getId());
        }
        else
        {
          LOG.log(Level.WARNING, "Did not find the j2ee principal.");
        }
        // client not authenticated
        redirectToLogin(request, response);
        return;
      }
      else if (userBean == null)
      {
        LOG.log(Level.FINEST, "Call without userBean for :  {0} ", request.getRequestURI());
        String principalId = j2eePrincipal.getName();
        userBean = directoryAdapter.getById(null, null);
        if (userBean == null)
        {
          LOG.log(Level.SEVERE, "Pls check ECM settings in viewer-config file!");
          response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
          return;
        }    
        userBean.setProperty(ECMUserImpl.PROP_PRINCIPALID, principalId);
        LOG.log(Level.INFO, "Generated the user {0} by directory service.", userBean.getId());

        session.setAttribute(UserBean.class.getName(), userBean);
        request.setAttribute(REQUEST_USER, userBean);
        chain.doFilter(request, response);
      }
      else
      {
        // session has combined with a user
        // check if authenticated user does not match with session
        String principalId = userBean.getProperty(ECMUserImpl.PROP_PRINCIPALID);
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
            StringBuffer msg = new StringBuffer();
            msg.append(ServiceCode.S_ERROR_NOT_AUTHENTICATED_USER);
            msg.append(" The user is ");
            msg.append(principalId);
            LOG.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_NOT_AUTHENTICATED_USER, msg.toString()));
            // Refresh the page
            response.sendRedirect(request.getRequestURL().toString());
          }
          else
          {
            LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                "No View Permission of user : %s .", userBean.getId())).toString());
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

  @Override
  public void init(FilterConfig config) throws ServletException
  {
    // TODO Auto-generated method stub
  }

  @Override
  public void init(JSONObject config)
  {
    directoryAdapter = (IDirectoryAdapter) ((DirectoryComponentImpl) Platform.getComponent(DirectoryComponentImpl.COMPONENT_ID))
        .getService("ecm");
  }

  @Override
  public UserBean getUserBean(String id) throws Exception
  {
    return directoryAdapter.getById(null, null);
  }

}
