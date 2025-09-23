/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.docs.proxy.lotuslive.saml.filter;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.docs.proxy.lotuslive.saml.resource.ProxyLogUtil;
import com.ibm.docs.proxy.lotuslive.saml.util.ProxyAuthConfig;
import com.ibm.docs.proxy.lotuslive.saml.util.ProxyAuthConstants;
import com.ibm.ws.exception.ConfigurationError;
import com.ibm.ws.ffdc.FFDCFilter;
import com.ibm.ws.proxy.deployment.ProxyDeployment;
import com.ibm.ws.proxy.deployment.ProxyDeploymentCallback;
import com.ibm.wsspi.proxy.filter.FilterManagerService;
import com.ibm.wsspi.proxy.filter.FilterPointName;
import com.ibm.wsspi.proxy.filter.ProtocolName;
import com.ibm.wsspi.runtime.component.WsComponentImpl;
import com.ibm.wsspi.runtime.service.WsServiceRegistry;

public class AuthFilterDeployer extends WsComponentImpl implements ProxyDeploymentCallback
{

  private static Logger logger = Logger.getLogger(AuthFilterDeployer.class.getName(), "com.ibm.docs.proxy.lotuslive.saml.resource.message");

  private static String filterContext = "ConcordAuthFilter";

  private static volatile ProxyAuthConfig config = null;

  private static volatile AuthFilterDeployer instance;

  private static Lock filterDeployerLock = new ReentrantLock();

  public AuthFilterDeployer()
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthFilterDeployer.class.getName(), "AuthFilterDeployer()");
    }
    setName("Http DMZ SAML Filter Service");

    if (logger.isLoggable(Level.FINEST))
    {
      logger.exiting(AuthFilterDeployer.class.getName(), "AuthFilterDeployer()");
    }
  }

  public synchronized void initialize(Object obj) throws ConfigurationError
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthFilterDeployer.class.getName(), "initialize()");
    }
    if (ProxyDeployment.proxyDeployment.isSupportedDeployment())
    {
      if (logger.isLoggable(Level.INFO))
      {
        logger.log(Level.INFO, ProxyLogUtil.get(ProxyAuthConstants.CONCORD_FILTER_SERVICE_STARTING));
      }
      try
      {
        if (AuthFilterDeployer.config == null)
        {
          filterDeployerLock.lock();
          try
          {
            if (AuthFilterDeployer.config == null)
              AuthFilterDeployer.config = ProxyAuthConfig.getInstance();
          }
          finally
          {
            filterDeployerLock.unlock();
          }

        }
      }
      catch (Exception e)
      {
        FFDCFilter.processException(e, "AuthFilterDeployer: initialize", "Error reading configuration data");
      }

      deployConcordProxyFilters();

    }
    if (logger.isLoggable(Level.FINEST))
    {
      logger.exiting(AuthFilterDeployer.class.getName(), "initialize()");
    }
  }

  public synchronized void start()
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthFilterDeployer.class.getName(), "start()");
      logger.exiting(AuthFilterDeployer.class.getName(), "start()");
    }
  }

  public synchronized void stop()
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthFilterDeployer.class.getName(), "stop()");
      logger.exiting(AuthFilterDeployer.class.getName(), "stop()");
    }
  }

  public synchronized void destroy()
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthFilterDeployer.class.getName(), "destroy()");
    }
    if (AuthFilterDeployer.config != null)
    {
      filterDeployerLock.lock();
      try
      {
        if (AuthFilterDeployer.config != null)
          AuthFilterDeployer.config = null;
      }
      finally
      {
        filterDeployerLock.unlock();
      }
    }
    if (logger.isLoggable(Level.FINEST))
    {
      logger.exiting(AuthFilterDeployer.class.getName(), "destroy()");
    }
  }

  public String expandVariable(String s) throws IllegalArgumentException
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthFilterDeployer.class.getName(), "expandVariable()");
      logger.exiting(AuthFilterDeployer.class.getName(), "expandVariable()");
    }
    return super.expandVariable(s);
  }

  public Object getWebSphereService(Class class1)
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthFilterDeployer.class.getName(), "getWebSphereService()");
    }
    Object service = null;

    try
    {
      service = WsServiceRegistry.getService(this, class1);
    }
    catch (Exception e)
    {
      FFDCFilter.processException(e, "getWebSphereService", "Exception trying to get service from websphere service registry",
          new Object[] { class1.toString() });
    }
    if (logger.isLoggable(Level.FINEST))
    {
      logger.exiting(AuthFilterDeployer.class.getName(), "getWebSphereService()");
    }
    return service;
  }

  public void releaseWebSphereService(Object arg0)
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthFilterDeployer.class.getName(), "releaseWebSphereService()");
      logger.exiting(AuthFilterDeployer.class.getName(), "releaseWebSphereService()");
    }
  }

  private void deployConcordProxyFilters() throws ConfigurationError
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthFilterDeployer.class.getName(), "deployConcordProxyFilters()");
    }

    FilterManagerService filterManagerService = (FilterManagerService) getWebSphereService(com.ibm.wsspi.proxy.filter.FilterManagerService.class);

    if (filterManagerService == null)
    {
      if (logger.isLoggable(Level.SEVERE))
      {
        logger.log(Level.SEVERE, ProxyLogUtil.get(ProxyAuthConstants.CONCORD_FILTER_SERVICE_NO_SERVICE_MANAGER));
      }
    }
    else
    {
      createConcordFilters(filterManagerService);
      if (logger.isLoggable(Level.INFO))
      {
        logger.log(Level.INFO, ProxyLogUtil.get(ProxyAuthConstants.CONCORD_FILTER_SERVICE_STARTUP_SUCCESSFUL));
      }
    }

    if (logger.isLoggable(Level.FINEST))
    {
      logger.exiting(AuthFilterDeployer.class.getName(), "deployConcordProxyFilters()");
    }
  }

  private void createConcordFilters(FilterManagerService filtermanagerservice) throws ConfigurationError
  {
    if (logger.isLoggable(Level.FINEST))
    {
      logger.entering(AuthFilterDeployer.class.getName(), "createConcordFilters()");
    }

    try
    {
      logger.fine("Creating Filter Context");
      filtermanagerservice.createFilterContext(filterContext, null, "Concord Filters", "Concord Context", null, null, new HashMap(),
          new LinkedList(), new LinkedList());
    }
    catch (Exception e)
    {
      FFDCFilter.processException(e, "createConcordFilters", "Unable to create ConcordFilterContext to deploy Concord Filters");
      logger.log(Level.WARNING, ProxyLogUtil.get(ProxyAuthConstants.CONCORD_FILTER_SERVICE_NO_FILTER_CONTEXT));

      throw new ConfigurationError("Unable to create Concord filter context", e);
    }

    try
    {
      if (logger.isLoggable(Level.FINE))
      {
        logger.fine("This is a DMZ secure proxy: Loading the SAML filter.!");
      }

      logger.fine("Creating Concord Filter: [" + AuthRequestFilter.class.getName() + "]");
      filtermanagerservice.createFilter(filterContext, "ConcordSAMLRequestFilter",
          "com.ibm.docs.proxy.lotuslive.saml.filter.AuthRequestFilter", "Do SAML auth for request to DMZ secure proxy",
          "Concord DMZ secure proxy saml request Filter", null, null, ProtocolName.HTTP, FilterPointName.PROXY_REQUEST, 10001,
          new HashMap());
      logger.fine("Creating Concord Filter: [" + AuthResponseFilter.class.getName() + "]");
      filtermanagerservice.createFilter(filterContext, "ConcordSAMLResponseFilter",
          "com.ibm.docs.proxy.lotuslive.saml.filter.AuthResponseFilter", "Add ltpa cookie in response",
          "Concord DMZ secure proxy saml response Filter", null, null, ProtocolName.HTTP, FilterPointName.RESPONSE, 10002, new HashMap());

    }
    catch (Exception e)
    {
      FFDCFilter.processException(e, "createConcordFilters", "Unable to create ConcordAuthFilter");
    }

    if (logger.isLoggable(Level.FINEST))
    {
      logger.exiting(AuthFilterDeployer.class.getName(), "createConcordAuthFilters()");
    }
  }
}
