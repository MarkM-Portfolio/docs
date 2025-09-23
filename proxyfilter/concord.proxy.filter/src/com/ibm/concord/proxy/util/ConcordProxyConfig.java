/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.proxy.util;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.resource.Resource;

import com.ibm.concord.proxy.resource.ProxyLogUtil;
import com.ibm.websphere.models.config.proxy.GenericServerCluster;
import com.ibm.websphere.models.config.proxy.ProxySettings;
import com.ibm.websphere.models.config.proxy.URIGroup;
import com.ibm.websphere.models.config.topology.cluster.ClusterMember;
import com.ibm.websphere.models.config.topology.cluster.ServerCluster;
import com.ibm.ws.runtime.service.ConfigRoot;
import com.ibm.ws.runtime.service.Repository;
import com.ibm.wsspi.runtime.service.WsServiceRegistry;

public class ConcordProxyConfig {
	
	private static Logger logger = Logger.getLogger(ConcordProxyConfig.class.getName());
	private static volatile ConcordProxyConfig config = null;
	private static Lock lock = new ReentrantLock();
	
	/*
	 * WAS specific config
	 */
	private static ProxySettings proxySettings = null;
	private EList clusterMembers = null;
	private boolean isClustered = false;
	private boolean isRemoteRoutingEnabled = false;
	private String clusterName = null;
	private static Map<String, URIGroup> uriGroupings = new HashMap<String, URIGroup>();
	private static Map<String, GenericServerCluster> genericServerClusters = new HashMap<String,GenericServerCluster>();
	
	/*
	 * Concord specific id cache timeout config
	 * By default, the value is set to 180 seconds.
	 * This value should be less or equal to the timeout value of heartbeat,
	 * which is determined by Concord document server.
	 */
	private static final String CONCORD_IDCACHE_TIMEOUT_KEY = "concord.idcache.timeout";
	private int idCacheInactiveTimeout = 180;

	public static ConcordProxyConfig getInstance() throws Exception
	{
		if (config == null)
		{
			lock.lock();
			try {
				if (config == null)
				{
					config = new ConcordProxyConfig();
				}
			}
			finally
			{
				lock.unlock();
			}
		}
		return config;
	}
	
	public boolean isClustered()
	{
		return isClustered;
	}
	
	public boolean isRemoteRoutingEnabled()
	{
		if(logger.isLoggable(Level.FINEST))
			logger.entering(ConcordProxyConfig.class.getName(),
							"isRemoteRoutingEnabled");
		boolean returnValue = (isRemoteRoutingEnabled && !genericServerClusters.isEmpty());
		
		if(logger.isLoggable(Level.FINEST))
			logger.entering(ConcordProxyConfig.class.getName(),
							"isRemoteRoutingEnabled returning: " + isRemoteRoutingEnabled);
		return returnValue;
	}

	public int getDocumentIdCacheTimeout()
	{
		return idCacheInactiveTimeout;
	}
	
	private ConcordProxyConfig() throws Exception
	{
		readWASConfig();
		readConcordConfig();
	}
	
	private void readWASConfig() throws Exception
	{
		if (logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordProxyConfig.class.getName(), "readWASConfig");
		}
		
		Repository  repository = (Repository) WsServiceRegistry.getService(this,Repository.class);
		
		try {
			if (repository != null) 
		    {
		        Resource proxySettingsResource = repository.getConfigRoot ().getResource (ConfigRoot.SERVER, "proxy-settings.xml");
				if(logger.isLoggable(Level.FINE))
					logger.fine("Handling the proxy-settings.xml config");
				for (Object current : proxySettingsResource.getContents ())
		        {
				  if(current instanceof com.ibm.websphere.models.config.proxy.ProxySettings)
		          {
					  proxySettings = (ProxySettings) current; 
		          }          
		        }		
				Resource proxyEnvironment = repository.getConfigRoot().getResource (ConfigRoot.CELL, "proxy-environment.xml");
					
		        for (Object current : proxyEnvironment.getContents ())
		        {
		          if (current instanceof com.ibm.websphere.models.config.proxy.URIGroup)
		          {
		            URIGroup   uriGroup   = (URIGroup) current;
		            uriGroupings.put(uriGroup.getName(), uriGroup);
		          }
		          else if(current instanceof com.ibm.websphere.models.config.proxy.GenericServerCluster)
		          {
		        	  GenericServerCluster genericCluster = (GenericServerCluster) current;
		        	  logger.fine("Generic Server Cluster: Name: "+genericCluster.getName());
		        	  genericServerClusters.put(genericCluster.getName(), genericCluster);
		          }
		        }
		        isRemoteRoutingEnabled = true;
		    }
			else
			{
				isRemoteRoutingEnabled = false;
			}
		}
		catch (Exception e)
		{
			if (logger.isLoggable(Level.FINE))
			{
				logger.fine("Distributed Clusters are not configured");
			}
			isRemoteRoutingEnabled = false;
		}
		
        try
        {
	        if(repository!= null)
	        {
	           	if(logger.isLoggable(Level.FINE))
	        	{
	        		logger.fine("repository:cellName: "+ repository.getCellName() );
	        		logger.fine("repository:clusterName: "+ repository.getClusterName());
	        		
	        	}
	        	
	        	String clustersDir = System.getProperty("user.install.root")+"/config/cells/"+repository.getCellName()+"/clusters/";
	        	        	
	        	if(logger.isLoggable(Level.FINE))
	        	{
	        		logger.fine("Creating File object for " + clustersDir + "directory");
	        	}
	        	
	        	File file = new File(clustersDir);
	        	String [] clusters = file.list();
	        	/*
	        	 *  there should only be a single cluster on our deployment
	        	 */
	        	if(clusters != null && clusters.length > 0)
	        	{
		        	Resource clusterXML = repository.getConfigRoot().getResource(ConfigRoot.CLUSTER,clusters[0]+"/cluster.xml" );
		        	
		        	if(clusterXML != null)
			        {
			        	if(logger.isLoggable(Level.FINE))
			        	{
			        		logger.fine("Found cluster.xml: processing contents");
			        	}
			        	
			        	for(Object current : clusterXML.getContents())
				        {
				          if(logger.isLoggable(Level.FINEST))
			        	  {
			        		  logger.finest("procesing xml node[ "+ current + " ]");
			        	  }
			        		
			        	  if (current instanceof ServerCluster)
				          {
				            ServerCluster  serverCluster = (ServerCluster) current;
				            clusterName = serverCluster.getName();
				            clusterMembers = serverCluster.getMembers();
				            if (logger.isLoggable(Level.FINE))
				            {
				        		logger.fine("clusterName=["+clusterName+"]");
				        		for(Object member : clusterMembers)
				        		{
				        			if(logger.isLoggable(Level.FINE))
				        			{
				        				logger.fine("ClusterMember["+((ClusterMember)member).getMemberName()+"]");
				        			}
				        		}
				        	}
				            /*
				             * The cluster name is set so this server must be clustered
				             */
				            if (clusterName!=null)
				            {
				            	isClustered = true;
				            }
				          }
				        }
			        }
		        	else
		        	{
		        		if(logger.isLoggable(Level.FINE))
		        		{
		        			logger.fine("Unable to get resource for cluster.xml: repository is null");
		        		}
		        	}
		        	
		        }
	        	else
	        	{
	        		if(logger.isLoggable(Level.FINE))
	        		{
	        			logger.fine("Unable to get resource for cluster.xml: Resource is null");
	        		}
	        	}
	        }
        }
        catch(Exception e)
        {
        	if(logger.isLoggable(Level.FINE))
        	{
        		logger.fine("unable to load cluster.xml: " + e.getMessage());
        	}
        	isClustered = false;
        }
		
		if (logger.isLoggable(Level.FINEST))
		{
			logger.exiting(ConcordProxyConfig.class.getName(), "readWASConfig");
		}
	}
	
	private void readConcordConfig()
	{
		String sTimeoutValue = System.getenv(CONCORD_IDCACHE_TIMEOUT_KEY);
		if (sTimeoutValue == null)
		{
	    	if (logger.isLoggable(Level.INFO))
	    	{
				logger.log(Level.INFO,
						ProxyLogUtil.get("CONCORD_PROXY_NO_DOCUMENT_ID_CACHE_CONFIG_INFO"));
			}
	    	return;
		}
		
		try {
			int timeout = Integer.parseInt(sTimeoutValue);
			idCacheInactiveTimeout = timeout;
		}
		catch (NumberFormatException e)
		{
	    	if (logger.isLoggable(Level.WARNING))
	    	{
				logger.log(Level.WARNING,
						ProxyLogUtil.get("CONCORD_PROXY_DOCUMENT_ID_CACHE_CONFIG_WARNING"));
			}			
		}
	}
}
