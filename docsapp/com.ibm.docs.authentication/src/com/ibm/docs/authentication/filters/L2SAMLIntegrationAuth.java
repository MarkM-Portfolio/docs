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
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.security.CookieHelper;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.directory.lotuslive.members.LotusLiveUserImpl;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.directory.members.Subscriber;
import com.ibm.docs.entitlement.IEntitlementService.EntitlementLevel;
import com.ibm.docs.framework.ComponentRegistry;
import com.ibm.json.java.JSONObject;

/**
 * SAML Authentication Adapter
 * 
 * Notes:
 * 
 * <li>The LL TFIM SAML browser profile request URL should be: https://apps.lotuslive.com/sps/idp/saml11/login</li>
 * 
 * <li>Sample SP_PROVIDER_ID should be: (Lotus Live Labs) https://lotuslivelabs.research.ibm.com/l3proxywork/backfromsaml</li>
 * 
 * <li>For local test usage, the psudo-TFIM request URL is: http://localhost:9081/test/login.jsp And the Concord provider id is:
 * http://localhost:9081/proxy/backfromsaml</li>
 * 
 * @author litie
 */
public class L2SAMLIntegrationAuth implements IAuthenticationAdapter
{
  private Logger logger = Logger.getLogger(getClass().getName());

  private static String APIREQUEST_URI = "/api";

  private static String s2sToken = null;

  public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws IOException, ServletException
  {
    doFilter((HttpServletRequest) req, (HttpServletResponse) resp, chain);
  }

  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    try
    {
      HttpSession session = request.getSession();
      UserBean userBean = (UserBean) session.getAttribute(L2SAMLIntegrationAuth.class.getName());
      boolean isS2SCall = false;
      String token = request.getHeader("s2stoken");
      String userId = request.getHeader("onBehalfOf");
      String subscriberId = request.getHeader(LotusLiveUserImpl.SAML_ATTR_SUBSCRIBERID);

      if (subscriberId == null && userId != null && s2sToken != null && s2sToken.equalsIgnoreCase(token))
      {
        isS2SCall = true;
        subscriberId = userId;
      }

      if (isS2SCall)
      {
        EntitlementLevel entitlementLevel = EntitlementLevel.NONE;
        if (userBean == null || !subscriberId.equals(userBean.getId()))
        {
          IEntitlementService entitlementSvr = (IEntitlementService) ComponentRegistry.getInstance()
              .getComponent(EntitlementComponent.COMPONENT_ID).getService(IEntitlementService.class);
          Subscriber subscriber = entitlementSvr.getSubscriber(subscriberId, Subscriber.TYPE_USER);
          if (subscriber != null)
          {
            userBean = new UserBean(new LotusLiveUserImpl(subscriber));
            entitlementLevel = entitlementSvr.getEntitlementLevel(subscriber);
          }
          if (logger.isLoggable(Level.FINE))
          {
            logger.log(Level.FINE, "onBehalfOf={0}, entitlementLevel={1}, requestURL={2}",
                new Object[] { userId, entitlementLevel, request.getRequestURL() });
          }
          if (entitlementLevel == EntitlementLevel.NONE)
          {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
          }

          session.setAttribute(L2SAMLIntegrationAuth.class.getName(), userBean);
        }
        request.setAttribute(REQUEST_USER, userBean);
        chain.doFilter(request, response);
        return;
      }
      else if (subscriberId != null && subscriberId.length() > 0)
      {
        if (userBean == null)
        {
          EntitlementLevel entitlementLevel = EntitlementLevel.NONE;
          IEntitlementService entitlementSvr = (IEntitlementService) ComponentRegistry.getInstance()
              .getComponent(EntitlementComponent.COMPONENT_ID).getService(IEntitlementService.class);

          userBean = new UserBean(new LotusLiveUserImpl(request));
          entitlementLevel = entitlementSvr.getEntitlementLevel(userBean);

          if (entitlementLevel == EntitlementLevel.NONE)
          {
            String uri = request.getRequestURI();
            logger.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                "The user %s entitlementLevel is none with url %s.", userBean.getId(), uri)).toString());
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
          if(logger.isLoggable(Level.FINE))
          {
            logger.log(
                Level.FINE,
                (new StringBuilder()).append("User ").append(userBean.getId()).append(", orgId: ").append(userBean.getOrgId())
                .append(", entitlements: ").append(entitlementLevel.ordinal()).append("] logged in as:").append(session.getId())
                .append(", session is new:").append(session.isNew() ? "true" : "false").append(" for request ")
                .append(request.getRequestURL()).toString());
          }
          session.setAttribute(L2SAMLIntegrationAuth.class.getName(), userBean);
          request.setAttribute(REQUEST_USER, userBean);
          chain.doFilter(request, response);
          return;
        }
        else
        {
          // session has combined with a user
          // check if authenticated user does not match with session
          if (!userBean.getId().equals(subscriberId))
          {
            // user for current session has changed
            // invalidate current session
            try
            {
              logger.log(Level.WARNING,
                  new StringBuilder("Current session ").append(session.getId()).append(" for request ").append(request.getPathInfo())
                      .append(" is not valid for current user: ").append(subscriberId).append(" it's used by: ").append(userBean.getId())
                      .toString());
              session.invalidate();
            }
            catch (IllegalStateException e)
            {
              // called on an already invalidated session
              logger.log(Level.WARNING, "Exception happens while invalidate the http session.", e);
            }
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
          }
          else
          {
            boolean hasBHDocs = CookieHelper.hasDocsEntitlementCookie(request, userBean.getId());
            if (!hasBHDocs)
            {
              logger.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                  "no docs entitlement cookie: %s.", request.getRequestURL())).toString());
              String uri = request.getRequestURI();
              if (uri.startsWith(request.getContextPath() + APIREQUEST_URI))
              {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
              }
              else
              {
                request.setAttribute("error_code", 1002);
                request.getRequestDispatcher("/WEB-INF/pages/error.jsp").forward(request, response);
              }

              return;
            }
            request.setAttribute(REQUEST_USER, userBean);
            chain.doFilter(request, response);
            return;
          }
        }
      }
      else
      {
        logger
            .log(Level.WARNING, (new StringBuilder()).append("Null subscriberId: ").append(request.getRequestURL().toString()).toString());
        // TODO: then what's the right way to proceed?
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
      }
    }
    catch (IOException e)
    {
      logger.log(
          Level.SEVERE,
          (new StringBuilder()).append("Problem calling AuthenticationService.check for request ")
              .append(request.getRequestURL().toString()).append(": ").toString(), e);
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
    }
    request.setAttribute(REQUEST_USER, null);
  }

  public void init(FilterConfig filterConfig) throws ServletException
  {

  }

  public void init(JSONObject config)
  {
    s2sToken = ConcordConfig.getInstance().getS2SToken();
  }

  public void destroy()
  {

  }
}
