/* IBM Confidential                                                  */

package com.ibm.docs.viewer.external.auth;

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

import org.apache.commons.lang.StringUtils;

import com.ibm.concord.viewer.platform.component.ComponentRegistry;
import com.ibm.concord.viewer.platform.directory.DirectoryComponentImpl;
import com.ibm.concord.viewer.spi.auth.IAuthenticationAdapter;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.directory.IDirectoryAdapter;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.members.IMemberBase;
import com.ibm.connections.directory.services.DSProvider;
import com.ibm.connections.directory.services.DSProviderFactory;
import com.ibm.docs.common.util.J2CAliasHelper;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.viewer.external.util.Constants;
import com.ibm.docs.viewer.external.util.ExternalParasHelper;
import com.ibm.json.java.JSONObject;

public class ExternalAuth implements IAuthenticationAdapter
{
  public static String EXTERNAL_AUTH_KEY = "external.cmis";

  public static String EXTERNAL_AUTH_REST = "external.rest";

  private static final Logger LOG = Logger.getLogger(ExternalAuth.class.getName());

  private static final String APIREQUEST_URI = "/api";

  private static final String LOGIN_URI = "/login";

  private static final String REDIRECT_PARAM = "redirect";

  private IDirectoryAdapter directoryAdapter;

  private String s2sMethod;

  private boolean bypassSSO = false;

  private String OAuthAuthorizeEndPoint;

  private String docsAppClientId;

  protected static DSProvider DIRECTORY_SERVICE = DSProviderFactory.INSTANCE.getProfileProvider();

  private static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  @Override
  public void destroy()
  {

  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);
  }

  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    HttpSession session = request.getSession();
    UserBean userBean = (UserBean) session.getAttribute(ExternalAuth.class.getName());

    LOG.log(Level.FINEST, "Authentication type is: " + s2sMethod);
    
    if( request.getRequestURI().endsWith("/thumbnail") )
    {
      chain.doFilter(request, response);
      return;
    }
    
    // for OAuth authentication, need add the fileId in the cached refresh code because each file may have different code.
    boolean bOAuth = ExternalParasHelper.OAUTH.equalsIgnoreCase(s2sMethod);
    String authCode = null;
    String fileId = null;
    String repoId = null;
    if (bOAuth)
    {
      authCode = ExternalParasHelper.getOAuthCode(request);
      if (authCode != null)
      {
        URLConfig.setRequestCode(authCode);
      }
      String files[] = ExternalParasHelper.getRepoAndFile(request);
      repoId = files[0];
      fileId = files[1];
      if (fileId != null)
      {
        URLConfig.setRequestFile(fileId);
      }
    }

    Principal j2eePrincipal = request.getUserPrincipal();

    if (userBean == null)
    {
      LOG.log(Level.FINEST, "Call without userBean for:" + request.getRequestURI());
      if (bypassSSO)
      {// 1.1 bypassSSO and no userBean
        if (bOAuth && authCode == null)
        {
          LOG.log(Level.INFO, "First visit without userBean and oauth code.");
          redirectOAuth2Login(request, response, repoId, fileId);
          return;
        }
        LOG.log(Level.INFO, "by passed sso for this integration!");
        userBean = directoryAdapter.getById(null, null);
      }
      else if (j2eePrincipal != null)
      {// 1.2 not bypassSSO and no userBean but has j2eePrincipal
        String principalId = j2eePrincipal.getName();
        LOG.log(Level.INFO, "j2eePrincipal is: " + principalId);
        userBean = directoryAdapter.getById(null, principalId);
      }
      else
      { // 1.3 not bypassSSO, no userBean and no j2eePrincipal
        LOG.log(Level.INFO, "Login because j2eePrincipal is null!");
        redirectToLogin(request, response);
        return;
      }
      // Got userBean, check it and go ahead....
      if (userBean == null)
      {
        LOG.log(Level.WARNING, "Did not get userBean!");
        if (bOAuth)
        {
          if (authCode == null)
          {
            LOG.log(Level.WARNING, "There is no oauth code passed in!!!");
          }
          else
          {
            LOG.log(Level.WARNING, "Empty or expired refresh code!!!");
          }
          redirectOAuth2Login(request, response, repoId, fileId);
        }
        else
        {
          redirectToLogin(request, response);
        }
        return;
      }

      // cache the result in session
      request.setAttribute(REQUEST_USER, userBean);
      session.setAttribute(ExternalAuth.class.getName(), userBean);
    }
    else
    { // 2. when there is a userBean existing
      LOG.log(Level.FINEST, "Call with userBean for:" + request.getRequestURI());
      // session has combined with a user
      // check if authenticated user does not match with session
      boolean isValidSession = true;
      String principalId = userBean != null ? userBean.getProperty(IMemberBase.PROP_PRINCIPALID) : null;
      if (bypassSSO)
      { // 2.1 bypassSSO
        LOG.log(Level.FINEST, "Check validation when bypass sso is true.");
        if (principalId == null)
          isValidSession = false;
      }
      else
      { // 2.2 not bypassSSO
        if (principalId == null || j2eePrincipal == null || !principalId.equals(j2eePrincipal.getName()))
          isValidSession = false;
      }

      if (!isValidSession)
      { // It's invalid session.
        LOG.log(Level.FINEST, "Call with invalid userBean for : " + request.getRequestURI());
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
        LOG.log(Level.FINEST, "Call with valid userBean for : " + request.getRequestURI());
        request.setAttribute(REQUEST_USER, userBean);
      }
    }

    if (bOAuth && userBean != null)
    {
      if (authCode != null)
      {
        userBean.setProperty(Constants.AUTH_CODE, authCode);
      }
      if (fileId != null)
      {
        userBean.setProperty(ExternalParasHelper.FILE_ID, fileId);
      }
    }
    chain.doFilter(request, response);

    // 3. check the servlet response here, login again if need
    checkResponse4OAuth(request, response, repoId, fileId, bOAuth);
  }

  private void checkResponse4OAuth(HttpServletRequest request, HttpServletResponse response, String repoId, String fileId, boolean bOAuth)
      throws IOException, ServletException
  {
    Object error = request.getAttribute(ExternalParasHelper.ATTR_ERROR_CODE);
    if (error != null
        && ((Integer) error == RepositoryAccessException.EC_REPO_NOPERMISSION || (Integer) error == RepositoryAccessException.EC_REPO_NOVIEWPERMISSION))
    {
      if (bOAuth)
      {
        LOG.log(Level.WARNING, "Permission denied to get document entry! login from OAuth end point for {0} {1}!", new Object[] { repoId,
            fileId });
        redirectOAuth2Login(request, response, repoId, fileId);
      }
      else
      {
        LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
            "Except occured when get document entry! login from OAuth end point for %s %s!", repoId, fileId)).toString());
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }
    }

  }

  private void redirectOAuth2Login(HttpServletRequest request, HttpServletResponse response, String repoId, String fileId)
      throws IOException
  {
    String editUrl = OAuthAuthorizeEndPoint;
    editUrl += "?";
    editUrl += "response_type=code";
    editUrl += "&client_id=";
    editUrl += docsAppClientId;
    editUrl += "&" + ExternalParasHelper.STATE + "=";
    editUrl += repoId + ExternalParasHelper.STATE_SEPARATOR + fileId;

    LOG.log(Level.WARNING, "OAuth login for url: " + editUrl);
    response.sendRedirect(response.encodeRedirectURL(editUrl));
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
  public void init(FilterConfig arg0) throws ServletException
  {
  }

  @Override
  public void init(JSONObject config)
  {
    directoryAdapter = (IDirectoryAdapter) ((DirectoryComponentImpl) ComponentRegistry.getInstance().getComponent(
        DirectoryComponentImpl.COMPONENT_ID)).getService((String) config.get("id"));

    s2sMethod = (String) config.get("s2s_method");

    String tokenKey = (String) config.get("token_key");
    if (tokenKey != null)
      ExternalParasHelper.CODE_KEY = tokenKey;

    String bypassStr = (String) config.get(Constants.BYPASS_SSO);
    if ("true".equalsIgnoreCase(bypassStr)
        && (Constants.S2S_METHOD_OAUTH2.equalsIgnoreCase(s2sMethod) || Constants.S2S_METHOD_COOKIE.equalsIgnoreCase(s2sMethod) || 
            Constants.S2S_METHOD_S2STOKEN.equalsIgnoreCase(s2sMethod)))
    {
      bypassSSO = true;
    }
    LOG.log(Level.INFO, "The value bypass_sso is: " + bypassSSO);

    if (ExternalParasHelper.OAUTH.equalsIgnoreCase(s2sMethod))
    {
      // for OAuth2 grant type, password ? Toscana do not need client id/secret and will not stored in ViewerOauth_repoId config file
      OAuthAuthorizeEndPoint = (String) config.get(Constants.OAUTH_AUTHORIZE_ENDPOINT);
      LOG.log(Level.INFO, "The value OAUTH_AUTHORIZE_ENDPOINT is: " + OAuthAuthorizeEndPoint);
      String customerId = (String) config.get(Constants.KEY_OAUTH2_CUSTOMER_ID);
      LOG.log(Level.INFO, "The value KEY_OAUTH2_CUSTOMER_ID is: " + customerId);
      String[] pair = J2CAliasHelper.getJ2ASUserName(Constants.VIEWER_OAUTH_J2CALIAS_PREFIX + config.get("id"));
      if (StringUtils.isNotBlank(pair[0]) && StringUtils.isNotBlank(pair[1]))
      {
        LOG.info("Get Oauth2 Client Id!");
        docsAppClientId = pair[0];
      }
      else
      {
        LOG.warning("Failed to get Oauth2 Client Id.");
      }
    }

  }

  @Override
  public UserBean getUserBean(String id) throws Exception
  {
    // TODO Auto-generated method stub
    return null;
  }

}
