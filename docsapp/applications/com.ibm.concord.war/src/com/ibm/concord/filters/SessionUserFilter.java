/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.filters;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import com.ibm.concord.platform.Platform;
import com.ibm.docs.authentication.AuthenticationComponent;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.servlets.DriverEndpointCallback;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.authentication.util.ExternalParasHelper;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.RepositoryServiceUtil;

/**
 * @author gaowwei@cn.ibm.com
 * 
 */
public class SessionUserFilter implements Filter
{
  private IAuthenticationAdapter deafultAuthAdapter;
  
  private static final Logger LOG = Logger.getLogger(SessionUserFilter.class.getName());

  public SessionUserFilter()
  {
    deafultAuthAdapter = (IAuthenticationAdapter) Platform.getComponent(AuthenticationComponent.COMPONENT_ID).getService(
        IAuthenticationAdapter.class);
  }

  public void destroy()
  {
    deafultAuthAdapter.destroy();
  }

  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
  {
    try
    {
      // set thread local url config, for building urls
      URLConfig.setScheme(request.getScheme());
      URLConfig.setServerName(request.getServerName());
      URLConfig.setServerPort(request.getServerPort());
      URLConfig.setContextPath(((HttpServletRequest) request).getContextPath());
      URLConfig.setStaticPath(ConcordUtil.getStaticRootPath());
      URLConfig.setIcfilesContext(((HttpServletRequest) request).getHeader("x-ibm-icfiles-context"));

      // LC and Concord are configured LTPA SSO, we need to keep LTPA token from cookie
      // to be stored in thread local, for adapters to use
      Cookie[] cookies = ((HttpServletRequest) request).getCookies();
      URLConfig.setRequestCookies(cookies);

      String uri = ((HttpServletRequest) request).getRequestURI();
      String repoId = ConcordUtil.getRepoId((HttpServletRequest) request);
      IAuthenticationAdapter authAdapter = null;
      if (uri != null && uri.contains("driverscallback"))
      {
        String files[] = ExternalParasHelper.getRepoAndFile((HttpServletRequest)request);   
        repoId = files[0];        
      }
      
      if (repoId != null)
      {
        authAdapter = (IAuthenticationAdapter) Platform.getComponent(AuthenticationComponent.COMPONENT_ID).getService(IAuthenticationAdapter.class, repoId);
        if( authAdapter != null )
        {
          authAdapter.doFilter(request, response, chain);
        }
        else
        {
          LOG.log(Level.INFO, "Can not find auth adapter for repositry " + repoId);
        }
        
      }
      else
      {
        deafultAuthAdapter.doFilter(request, response, chain);
      }
    }
    catch (IOException e)
    {
      throw (e);
    }
    catch (ServletException e)
    {
      throw (e);
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "session user filter exception!", e);
    }
    finally
    {
      URLConfig.remove();
    }
  }

  public void init(FilterConfig config) throws ServletException
  {
    deafultAuthAdapter.init(config);
  }
}
