/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.proxy.filter;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.management.MBeanServer;
import javax.management.ObjectInstance;
import javax.management.ObjectName;

import com.ibm.concord.proxy.mbean.StaticClusterMgr;
import com.ibm.concord.proxy.resource.ProxyLogUtil;
import com.ibm.concord.proxy.util.ConcordProxyConfig;
import com.ibm.concord.proxy.util.ConcordProxyConstants;
import com.ibm.websphere.management.AdminServiceFactory;
import com.ibm.ws.exception.ConfigurationError;
import com.ibm.ws.proxy.deployment.ProxyDeployment;
import com.ibm.ws.proxy.deployment.ProxyDeploymentCallback;
import com.ibm.wsspi.proxy.filter.FilterManagerService;
import com.ibm.wsspi.proxy.filter.FilterPointName;
import com.ibm.wsspi.proxy.filter.ProtocolName;
import com.ibm.wsspi.runtime.component.WsComponentImpl;
import com.ibm.wsspi.runtime.service.WsServiceRegistry;

public class ConcordFilterDeployer extends WsComponentImpl implements ProxyDeploymentCallback
{
	private static Logger logger = Logger.getLogger(ConcordFilterDeployer.class.getName(),
			"com.ibm.concord.proxy.resource.message");
	private static volatile ConcordProxyConfig config = null;

	private static volatile ConcordFilterDeployer instance;
	private static Lock filterDeployerLock = new ReentrantLock();
	private static ObjectInstance staticClusterMgrOI = null;

	private static StaticClusterMgr staticClusterMgrInstance;
	
	public static ConcordFilterDeployer getInstance()
	{
		if(logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordFilterDeployer.class.getName(),"getInstance()");
		}
		
		if(ConcordFilterDeployer.instance == null)
		{
			filterDeployerLock.lock();
			try
			{
				
				if(ConcordFilterDeployer.instance == null)
					ConcordFilterDeployer.instance = new ConcordFilterDeployer();
			}
			finally
			{
				filterDeployerLock.unlock();
			}
		}
		
		if(logger.isLoggable(Level.FINEST))
		{
			logger.exiting(ConcordFilterDeployer.class.getName(),"getInstance()");
		}
		return instance;			
	}
	
	public ConcordFilterDeployer()
	{
		if(logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordFilterDeployer.class.getName(),"ConcordFilterDeployer()");
		}
		setName("Http Test Filter Service");
		
		if(logger.isLoggable(Level.FINEST))
		{
			logger.exiting(ConcordFilterDeployer.class.getName(),"ConcordFilterDeployer()");
		}
	}
	
	public synchronized void initialize(Object obj) throws ConfigurationError
	{
		if(logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordFilterDeployer.class.getName(),"initialize()");
		}
		if(ProxyDeployment.proxyDeployment.isSupportedDeployment())
		{
			if (logger.isLoggable(Level.INFO))
			{
				logger.log(Level.INFO,
						ProxyLogUtil.get(ConcordProxyConstants.CONCORD_FILTER_SERVICE_STARTING));
			}
			try
			{
				if(ConcordFilterDeployer.config == null)
				{
					filterDeployerLock.lock();
					try
					{
						if(ConcordFilterDeployer.config == null)
							ConcordFilterDeployer.config = ConcordProxyConfig.getInstance();
					}
					finally
					{
						filterDeployerLock.unlock();
					}
					
				}
			}
			catch(Exception e)
			{
				logger.log(Level.WARNING, "ConcordFilterDeployer: initialize. Error reading configuration data");
			}
			
			deployConcordProxyFilters();
			
		}
		if(logger.isLoggable(Level.FINEST))
		{
			logger.exiting(ConcordFilterDeployer.class.getName(),"initialize()");
		}
	}
	
	public synchronized void start()
	{
		logger.entering(ConcordFilterDeployer.class.getName(),"start()");
		initStaticClusterMgrMBean();
		StaticClusterMgr.startCheckSrvsStatusJob();
		logger.exiting(ConcordFilterDeployer.class.getName(),"start()");
	}
	
	public synchronized void stop()
	{
		logger.entering(ConcordFilterDeployer.class.getName(),"stop()");
		uninitStaticClusterMgrMBean();
		StaticClusterMgr.stopCheckSrvsStatusJob();
		logger.exiting(ConcordFilterDeployer.class.getName(),"stop()");
	}
	
	public synchronized void destroy()
	{
		if(logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordFilterDeployer.class.getName(),"destroy()");
		}
		if(ConcordFilterDeployer.config != null)
		{
			filterDeployerLock.lock();
			try
			{
				if(ConcordFilterDeployer.config != null)
					ConcordFilterDeployer.config = null;
			}
			finally
			{
				filterDeployerLock.unlock();
			}
		}
		if(logger.isLoggable(Level.FINEST))
		{
			logger.exiting(ConcordFilterDeployer.class.getName(),"destroy()");
		}
	}

	public String expandVariable(String s) throws IllegalArgumentException
	{
		if(logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordFilterDeployer.class.getName(),"expandVariable()");
			logger.exiting(ConcordFilterDeployer.class.getName(),"expandVariable()");
		}
		return super.expandVariable(s);
	}

	public Object getWebSphereService(Class class1)
	{
		if(logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordFilterDeployer.class.getName(), "getWebSphereService()");
		}
		Object service = null;
		
		try 
		{
			service = WsServiceRegistry.getService(this, class1);
		}
		catch (Exception e) 
		{
			logger.log(Level.WARNING, "Exception trying to get service from websphere service registry");
		}
		if(logger.isLoggable(Level.FINEST))
		{
			logger.exiting(ConcordFilterDeployer.class.getName(),"getWebSphereService()");
		}
		return service;
	}

	public void releaseWebSphereService(Object arg0)
	{
		if(logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordFilterDeployer.class.getName(),"releaseWebSphereService()");
			logger.exiting(ConcordFilterDeployer.class.getName(),"releaseWebSphereService()");
		}
	}

	private void deployConcordProxyFilters() throws ConfigurationError
	{
		if(logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordFilterDeployer.class.getName(),"deployConcordProxyFilters()");
		}
		
		FilterManagerService filterManagerService = (FilterManagerService)getWebSphereService(com.ibm.wsspi.proxy.filter.FilterManagerService.class);
		
		if(filterManagerService == null)
		{
			if (logger.isLoggable(Level.SEVERE))
			{
				logger.log(Level.SEVERE,
						ProxyLogUtil.get(ConcordProxyConstants.CONCORD_FILTER_SERVICE_NO_SERVICE_MANAGER));
			}
		}
		else
		{
			createConcordFilters(filterManagerService);
			if (logger.isLoggable(Level.INFO))
			{
				logger.log(Level.INFO,
						ProxyLogUtil.get(ConcordProxyConstants.CONCORD_FILTER_SERVICE_STARTUP_SUCCESSFUL));
			}
		}
			
		if(logger.isLoggable(Level.FINEST))
		{
			logger.exiting(ConcordFilterDeployer.class.getName(),"deployConcordProxyFilters()");
		}		
	}
	
	private void createConcordFilters(FilterManagerService filtermanagerservice) throws ConfigurationError
	{
		if(logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordFilterDeployer.class.getName(),"createConcordFilters()");
		}
		
		try
		{
			logger.fine("Creating Filter Context");
			filtermanagerservice.createFilterContext("ConcordFilterContext",
		   		 					null,
		   		 					"Concord Filters",
		   		 					"Concord Context",
		   		 					null, null,
		   		 					new HashMap(),
		   		 					new LinkedList(),
		   		 					new LinkedList());
		}
		catch(Exception e)
		{
			logger.log(Level.WARNING, ProxyLogUtil.get(ConcordProxyConstants.CONCORD_FILTER_SERVICE_NO_FILTER_CONTEXT));
			throw new ConfigurationError("Unable to create Concord filter context", e);
		}

		try
		{
			// No need to check whether creating the filter or not, always create it.
			if (true)
			{
				if (logger.isLoggable(Level.FINE))
				{
					logger.fine("This is a clustered server: Loading the cluster routing filter.!");
				}
				
				logger.log(Level.INFO, "Creating Concord Request Filter: [" + ConcordRequestRoutingFilter.class.getName() + "]");
				filtermanagerservice.createFilter("ConcordFilterContext", "ConcordRequestRoutingFilter", 
						"com.ibm.concord.proxy.filter.ConcordRequestRoutingFilter", "Routes Cluster Http Request to the correct server in cluster", 
						"Concord Cluster Routing Filter", null, null, ProtocolName.HTTP, FilterPointName.PROXY_REQUEST, 9000, new HashMap());
				
				logger.log(Level.INFO, "Creating Concord Response Routing Filter: [" + ConcordResponseRoutingFilter.class.getName() + "]");
				filtermanagerservice.createFilter("ConcordFilterContext", "ConcordResponseRoutingFilter", 
						"com.ibm.concord.proxy.filter.ConcordResponseRoutingFilter", "Routes Remote Cluster Http Response to the correct client", 
						"Concord Response Routing Filter", null, null, ProtocolName.HTTP, FilterPointName.RESPONSE, 100011, new HashMap());
				
				logger.log(Level.INFO, "Creating Concord Response Setting Filter: [" + ConcordResponseSettingsFilter.class.getName() + "]");
				filtermanagerservice.createFilter("ConcordFilterContext", "ConcordResponseSettingsFilter", 
						"com.ibm.concord.proxy.filter.ConcordResponseSettingsFilter", "Change the settings of the response", 
						"Concord Response Settings Filter", null, null, ProtocolName.HTTP, FilterPointName.RESPONSE, 100012, new HashMap());
			}
		}
		catch (Exception e)
		{
			logger.log(Level.WARNING, ProxyLogUtil.get(ConcordProxyConstants.CONCORD_PROXY_FILTER_SERVICE_NO_CLUSTER_ROUTING));
		}
		
		if (logger.isLoggable(Level.FINEST))
		{
			logger.exiting(ConcordFilterDeployer.class.getName(),"createConcordFilters()");
		}
	}
	
	/**
	 * Register the MBean that being used to manage the static cluster information on proxy server.
	 * 
	 */
	private void initStaticClusterMgrMBean()
	{
		try
		{
		  staticClusterMgrInstance = new StaticClusterMgr();
			MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
			ObjectName anON = new ObjectName("com.ibm.concord.proxy.mbean:type=StaticClusterMgr");
			staticClusterMgrOI = mbServer.registerMBean(staticClusterMgrInstance, anON);
		}
		catch (Throwable ex)
		{
			logger.log(Level.WARNING, "Error happens while registering static cluster management MBean.", ex);
		}
	}
	
	/**
	 * Unregister the MBean that being used to manage the static cluster
	 * information on proxy server.
	 * 
	 */
	private void uninitStaticClusterMgrMBean()
	{
	  if (staticClusterMgrInstance != null )
      {
        staticClusterMgrInstance.uninit();
      }
	  
		if (staticClusterMgrOI != null)
		{
			try
			{
				MBeanServer mbServer = AdminServiceFactory.getMBeanFactory().getMBeanServer();
				mbServer.unregisterMBean(staticClusterMgrOI.getObjectName());
			}
			catch (Exception ex)
			{
				logger.log(Level.WARNING, "Error happens while unregistering static cluster management MBean.", ex);
			}
		}
	}
	
	public static StaticClusterMgr getStaticClusterMgrInstance()
	{
	  return staticClusterMgrInstance;
	}
}
