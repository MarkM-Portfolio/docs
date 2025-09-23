/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
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

import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.connections.directory.services.DSProvider;
import com.ibm.connections.directory.services.DSProviderFactory;
import com.ibm.docs.authentication.AuthenticationComponent;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.authentication.util.EntitlmentUtil;
import com.ibm.docs.authentication.util.ExternalParasHelper;
import com.ibm.docs.authentication.util.URLMatcher;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.dao.ICustomerCredentialDAO;
import com.ibm.docs.directory.external.ExternalDirectory;
import com.ibm.docs.directory.external.util.ExternalConstant;
import com.ibm.docs.directory.members.IMemberBase;
import com.ibm.docs.directory.members.UserProperty;
import com.ibm.docs.entitlement.IEntitlementService.EntitlementLevel;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.json.java.JSONObject;

public class ExternalAuth implements IAuthenticationAdapter
{ 
  private static final Logger LOG = Logger.getLogger(ExternalAuth.class.getName());

  private static final String APIREQUEST_URI = "/api";

  private static final String LOGIN_URI = "/login";
  
  private static final String REDIRECT_PARAM = "redirect";
  
  private static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  private IDirectoryAdapter directoryAdapter;

  private String s2sMethod;
  
  private String OAuthAuthorizeEndPoint;
  
  private String docsAppClientId;
  
  private boolean bypassSSO = false;

  protected static DSProvider DIRECTORY_SERVICE = DSProviderFactory.INSTANCE.getProfileProvider();
  
  private static final Set<URLMatcher> URL_PATTERN = new HashSet<URLMatcher>();
  
  private IAuthenticationAdapter scAuthAdapter;

  static
  {
    Map<String, String> params = new HashMap<String, String>();
    params.put("asFormat", "pdf");
    URLMatcher matcher = new URLMatcher("/app/doc/([^/]+)/([^/]+)/view/content", params);
    URL_PATTERN.add(matcher);
    matcher = new URLMatcher("/api/job/([^/]+)/([^/]+)/([^/]+)", new HashMap<String, String>());
    URL_PATTERN.add(matcher);
  }

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
    LOG.entering(ExternalAuth.class.getName(), "doFilter");
    HttpSession session = request.getSession();
    UserBean userBean = (UserBean) session.getAttribute(ExternalAuth.class.getName());
        
    LOG.log(Level.FINEST, "Authentication type is: " + s2sMethod);
    // for OAuth authentication, need add the fileId in the cached refresh code because each file may have different code.
    boolean bOAuth = ExternalParasHelper.OAUTH.equalsIgnoreCase(s2sMethod);
    String authCode = null;
    String fileId = null;
    String repoId = null;
    if (bOAuth) {                  
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
        // fileid attribute is used by error.jsp if error happens
        request.setAttribute("fileid", fileId);
      }      
    }

    String requestURI = request.getRequestURI();
    boolean bApiRequest = requestURI.startsWith(request.getContextPath() + APIREQUEST_URI);
    // 1. when userBean is null
    Principal j2eePrincipal = request.getUserPrincipal();
    if (userBean == null) {
      LOG.log(Level.FINEST, "Call without userBean for:" + requestURI);     
      String roleLevel = null;
      if(bypassSSO)
      {// 1.1 bypassSSO and no userBean
        
        // api request is not allowed to redirect oauth2 login page to get authentication code
        // because api request is always a xhr 
        if (bOAuth && authCode == null && !bApiRequest) {
          LOG.log(Level.INFO, "First visit without userBean and oauth code.");   
          redirectOAuth2Login(request, response, repoId, fileId);
          return;
        }
        roleLevel = EntitlementLevel.FULL.toString();
        LOG.log(Level.INFO, "by passed sso for this integration!"); 
        userBean = directoryAdapter.getById(null, null);
        if (userBean != null) {
          userBean.setProperty(UserProperty.PROP_ENTITLEMENT.toString(), EntitlementLevel.FULL.toString());
          LOG.log(Level.INFO, "set entitlement to {0} when by pass sso.", EntitlementLevel.FULL.toString());
        }
      }
      else if (j2eePrincipal != null)
      {// 1.2 not bypassSSO and no userBean but has j2eePrincipal      
        String principalId = j2eePrincipal.getName();
        LOG.log(Level.INFO, "j2eePrincipal is: " + principalId);
        userBean = directoryAdapter.getById(null, principalId);
      }
      else // 1.3 not bypassSSO, no userBean and no j2eePrincipal
      { 
        // if integrate with SmartCloud and not bypassSSO
        // use the SAML auth
        if (ConcordConfig.getInstance().isCloud())
        {
          LOG.log(Level.INFO, "Get userbean from SmartCloud.");
          if (scAuthAdapter == null)
            scAuthAdapter = (IAuthenticationAdapter) ComponentRegistry.getInstance().getComponent(AuthenticationComponent.COMPONENT_ID)
                .getService(IAuthenticationAdapter.class);
          DummyFilterChain dummyChain = new DummyFilterChain();
          scAuthAdapter.doFilter(request, response, dummyChain);
          userBean = (UserBean) request.getAttribute(REQUEST_USER);
          if (userBean == null) {
            LOG.log(Level.WARNING, "Could not get userbean from SmartCloud!");
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
          }
          session.setAttribute(ExternalAuth.class.getName(), userBean);
          LOG.log(Level.INFO, "set SmartCloud userbean for user " + userBean.getId());
        }
        else
        {
          LOG.log(Level.INFO, "Login because j2eePrincipal is null!");
          redirectToLogin(request, response);
          return;
        }
      }
      // Got userBean, check it and go ahead....
      if (userBean == null) {
        LOG.log(Level.WARNING, "Did not get userBean!");
        if (bOAuth) {         
          if (authCode == null) {
            LOG.log(Level.WARNING, "There is no oauth code passed in!!!");  
          } 
          else {
            LOG.log(Level.WARNING, "Empty or expired refresh code!!!");
          }      
          if (bApiRequest)
          {
//            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("text/x-json");
            response.setCharacterEncoding("UTF-8");
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setHeader("Cache-Control", "private, no-store, no-cache, must-revalidate");
            String errorMsg = "You need reload for server fail over";
            JSONObject result = new JSONObject();
            result.put("status", "error");
            result.put("error_code", DocumentServiceException.EC_DOCUMENT_SERVICE_FAILOVER);
            result.put("error_msg", errorMsg);
            result.put("reload", "true");
            result.serialize(response.getWriter());
            return;
          }
          redirectOAuth2Login(request, response, repoId, fileId);
        }
        else {
          redirectToLogin(request, response);
        }
        return;
      }
      boolean noEntitleCheck = false;
      LOG.log(Level.FINER, "Check entitlement for user {0} ", userBean == null ? "" : userBean.getId());
      if (!ConcordConfig.getInstance().isCloud())
      {
      boolean entitled = EntitlmentUtil.checkEntitlement(request, userBean, true, roleLevel);
      if (!entitled)
      {
        LOG.log(Level.WARNING, "unentitled users!");
        noEntitleCheck = EntitlmentUtil.isURLAllowed4Mobile(request, URL_PATTERN);
        if (noEntitleCheck)
        {
          LOG.log(Level.FINER, "The user {0} is not entitled is accessing Docs from mobile.", userBean.getId());
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
      }
      // cache the result in session
      request.setAttribute(REQUEST_USER, userBean);
      if (noEntitleCheck)
      {
        session.setAttribute(ExternalAuth.class.getName(), null);
      }
      else
      {
        session.setAttribute(ExternalAuth.class.getName(), userBean);
      }    
    }
    else { // 2. when there is a userBean existing
      LOG.log(Level.FINEST, "Call with userBean for:" + request.getRequestURI());
      // session has combined with a user
      // check if authenticated user does not match with session
      boolean isValidSession = true;
      String principalId = userBean != null ? userBean.getProperty(IMemberBase.PROP_PRINCIPALID) : null;
      if (bypassSSO) { // 2.1 bypassSSO
        LOG.log(Level.FINEST, "Check validation when bypass sso is true.");
        if (principalId == null)
          isValidSession = false;
      }
      else if (!ConcordConfig.getInstance().isCloud()){ // 2.2 not bypassSSO and not SmartCloud env     
        if (principalId == null || j2eePrincipal == null || !principalId.equals(j2eePrincipal.getName()))
          isValidSession = false;
      }       
            
      if (!isValidSession)
      { // It's invalid session.
        LOG.log(Level.INFO, "Call with invalid userBean for : " + request.getRequestURI());
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
          String queryString = (request.getQueryString() != null) ? "?" + request.getQueryString() : "";
          response.sendRedirect(URLEncoder.encode(uri + queryString, "UTF-8"));
        }
        return;
      }
      else
      {
        LOG.log(Level.FINEST, "Call with valid userBean for : " + request.getRequestURI());
        request.setAttribute(REQUEST_USER, userBean);
      }     
    }
    
    if (bOAuth && userBean != null) {
      if (authCode != null)
      {      
        userBean.setProperty("code", authCode);
      }
      if (fileId != null )
      {
          userBean.setProperty(ExternalParasHelper.FILE_ID, fileId);
      }
    }
    
    
    chain.doFilter(request, response);    
    
    // 3. check the servlet response here, login again if need
    checkResponse4OAuth(request, response, repoId, fileId, bOAuth);
  }
  
  private void checkResponse4OAuth(HttpServletRequest request, HttpServletResponse response, String repoId, String fileId, boolean bOAuth) throws IOException, ServletException
  {
    Object error = request.getAttribute(ExternalParasHelper.ATTR_ERROR_CODE);    
    if (error != null) {
      int errCode = (Integer)error;
      if (bOAuth && (errCode == ExternalParasHelper.EC_REPO_NOPERMISSION || errCode == ExternalParasHelper.EC_REPO_NOEDITPERMISSION)) {
        LOG.log(Level.WARNING, "Permission denied to get document entry! login from OAuth end point for {0} {1}!", new Object[] {repoId, fileId});
        redirectOAuth2Login(request, response, repoId, fileId);
      }
      else
      {
        LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
            "Except occured to get document entry! login from OAuth end point for %s %s !", repoId, fileId)).toString());
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
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
  
  private void redirectOAuth2Login(HttpServletRequest request, HttpServletResponse response, String repoId, String fileId) throws IOException
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

  @Override
  public void init(FilterConfig arg0) throws ServletException
  {
  }

  @Override
  public void init(JSONObject config)
  {
    directoryAdapter = (IDirectoryAdapter) ((DirectoryComponent) ComponentRegistry.getInstance().getComponent(
        DirectoryComponent.COMPONENT_ID)).getService(IDirectoryAdapter.class, (String) config.get("id"));

    s2sMethod = (String) config.get("s2s_method");

    String bypassStr = (String) config.get(ExternalConstant.BYPASS_SSO);
    if ("true".equalsIgnoreCase(bypassStr)
        && (ExternalConstant.S2S_METHOD_OAUTH2.equalsIgnoreCase(s2sMethod) || ExternalConstant.S2S_METHOD_COOKIE
            .equalsIgnoreCase(s2sMethod)))
    {
      bypassSSO = true;
    }
    
    LOG.log(Level.INFO, "The value bypass_sso is: " + bypassSSO);
    if (ExternalConstant.S2S_METHOD_OAUTH2.equalsIgnoreCase(s2sMethod))
    {
      OAuthAuthorizeEndPoint = (String) config.get(ExternalConstant.OAUTH_AUTHORIZE_ENDPOINT);
      LOG.log(Level.INFO, "The value OAUTH_AUTHORIZE_ENDPOINT is: " + OAuthAuthorizeEndPoint);
      String customerId = (String) config.get(ExternalConstant.KEY_OAUTH2_CUSTOMER_ID);
      LOG.log(Level.INFO, "The value KEY_OAUTH2_CUSTOMER_ID is: " + customerId);
      ICustomerCredentialDAO ccDAO = (ICustomerCredentialDAO) ComponentRegistry.getInstance().getComponent(DirectoryComponent.COMPONENT_ID)
          .getService(ICustomerCredentialDAO.class);
      docsAppClientId = ccDAO.get(customerId, ExternalConstant.KEY_OAUTH2_CLIENT_ID);
      if (docsAppClientId == null)
      {
        LOG.log(Level.WARNING, "Can not get OAuth client id with customer id " + customerId);
      }
    }
  }

}

class DummyFilterChain implements FilterChain {
  private static final Logger LOG = Logger.getLogger(DummyFilterChain.class.getName());
  @Override
  public void doFilter(ServletRequest arg0, ServletResponse arg1) throws IOException, ServletException
  {
    // do nothing here to avoid the following filters and the servlet call
    LOG.log(Level.FINEST, "Do nothing for DummyFilterChain");
  }
  
}
