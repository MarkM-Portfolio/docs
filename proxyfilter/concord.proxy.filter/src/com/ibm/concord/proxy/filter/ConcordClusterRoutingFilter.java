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

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.proxy.resource.ProxyLogUtil;
import com.ibm.concord.proxy.util.ConcordRequestParser;
import com.ibm.concord.proxy.util.ConcordServerIdentityCache;
import com.ibm.ws.exception.ConfigurationError;
import com.ibm.ws.ffdc.FFDCFilter;
import com.ibm.ws.proxy.filter.http.HttpProxyServerFilter;
import com.ibm.wsspi.cluster.ClusterObserver;
import com.ibm.wsspi.cluster.ClusterService;
import com.ibm.wsspi.cluster.ClusterServiceFactory;
import com.ibm.wsspi.cluster.Identity;
import com.ibm.wsspi.cluster.adapter.IdentityMapping;
import com.ibm.wsspi.cluster.adapter.channel.ChannelSelectionAdapter;
import com.ibm.wsspi.http.channel.values.StatusCodes;
import com.ibm.wsspi.proxy.filter.FilterWrapper;
import com.ibm.wsspi.proxy.filter.http.HttpFilterStatusCode;
import com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext;
import com.ibm.wsspi.proxy.selection.policy.SelectionPolicy;
import com.ibm.wsspi.runtime.service.WsServiceRegistry;

public class ConcordClusterRoutingFilter extends HttpProxyServerFilter
{
	private static Logger logger = Logger.getLogger(ConcordClusterRoutingFilter.class.getName());
	
	private static final String SCA_CLUSTER_MEMBER_IDENTITY = "ucf.cluster.member.id";
	
	private static volatile ChannelSelectionAdapter selectionService = null;
	
	private ConcordClusterObserver observer = new ConcordClusterObserver();
	
	private static ClusterService clusterService = null;
	
	private Identity clusterIdentity = null;
	
	private Identity[] identities = null;
	
	private Lock clusterFilterLock = new ReentrantLock();
	
	/*
	 * ObjectCache to contain active documents
	 */
	private volatile ConcordServerIdentityCache activeDocumentMap = null;
	
	/*
	 * Map containing active servers in the cluster
	 */
	private Map<String,Identity> activeServerMap = new TreeMap<String, Identity>();
	
	/**
	 *	doFilter is the SPI interface called for this class on a request that needs to
	 *  be proxied to an application server.
	 *  
	 *  This methods determines if it's a Concord request, then determines the server
	 *  which the request needs to go to.  This filter is tied into UCF and receives
	 *  updates when new servers are added and removed from the cluster. In the event of a
	 *  server being removed from a cluster, will reassign the request to a given server 
	 */
	public StatusCodes doFilter(HttpProxyServiceContext serviceContext) throws Exception
	{
		StatusCodes code = HttpFilterStatusCode.STATUS_FILTER_SUCCESS;
		if (!ConcordRequestParser.isMonitoredAppName(serviceContext.getResourcePolicy().getApplicationName()))
		{
			// this request is not headed to our EAR so we don't care about handling the request.
			return code;
		}
		
		/*
		 * Setup clusterIdentity message the first time through
		 */
		try {
			if (clusterIdentity == null)
			{
				initClusterIdentity(serviceContext);
			}
		}
		catch (Exception e)
		{
			FFDCFilter.processException(e, "ConcordClusterRoutingFilter: doFilter", "error initing cluster ids");
		}
		
		if (clusterIdentity != null)
		{
			if (logger.isLoggable(Level.FINEST))
			{
				logger.finest("Routing request: [" + serviceContext.getRequest().getMethod() + "][" + serviceContext.getRequest().getRequestURI() + "]");
			}
			
			// try to get document id from the request
			String documentId = ConcordRequestParser.getDocumentIdFromRequest(serviceContext.getRequest());
			if (documentId != null)
			{
				setRouteByDocumentId(serviceContext, documentId);
			}
			else {
				logRoutingRequest(serviceContext,"DEFAULT","WLM-Routing");
			}
		}
		
		return code;
	}

	public void init(FilterWrapper filterWrapper) throws Exception
	{
		if(logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordClusterRoutingFilter.class.getName(), "init()");
		}
		
		super.init(filterWrapper);
		
		if (selectionService == null)
		{
			clusterFilterLock.lock();
			try {
				if (selectionService == null)
				{
					selectionService = (ChannelSelectionAdapter)WsServiceRegistry.getService(this, ChannelSelectionAdapter.class);
				}
			}
			finally {
				clusterFilterLock.unlock();
			}
			
			if (selectionService == null)
			{
				if (logger.isLoggable(Level.WARNING))
				{
					logger.warning("Unable to obtain the ChannelSelectionAdapter from the service registry.");
				}
				throw new ConfigurationError("Unable to obtain the ChannelSelectionAdapter from the service registry.");
			}
		}
		
		if(activeDocumentMap == null)
		{
			clusterFilterLock.lock();
			try
			{
				if(activeDocumentMap == null)
				{
					activeDocumentMap = ConcordServerIdentityCache.getInstance();
				}
				
			}
			finally
			{
				clusterFilterLock.unlock();
			}
			
		}

		if(logger.isLoggable(Level.FINEST))
		{
			logger.exiting(ConcordClusterRoutingFilter.class.getName(), "init()");
		}
	}
	
	/*
	 * Initialize the cluster identity. The cluster id tell the application which cell and cluster
	 * our applications are installed to
	 */
	private void initClusterIdentity(HttpProxyServiceContext serviceContext)
	{
		clusterFilterLock.lock();
		try {
			if (clusterIdentity == null)
			{
				if (serviceContext.getResourcePolicy() != null)
				{
					// check to make sure it's our request
					if (ConcordRequestParser.isMonitoredModuleName(serviceContext.getResourcePolicy().getModuleName()))
					{
						clusterIdentity = IdentityMapping.getClusterIdentityFromClusterName(
								serviceContext.getResourcePolicy().getCellName(), 
								serviceContext.getResourcePolicy().getClusterName());
						
						if (logger.isLoggable(Level.FINER))
						{
							logger.finer("Initializing cluster member data for ConcordClusterRouting filter: ");
							logger.finer("	Application Name ["+serviceContext.getResourcePolicy().getApplicationName()+"]");
							logger.finer("	Cell Name ["+serviceContext.getResourcePolicy().getCellName()+"]");
							logger.finer("	Cluster Name ["+serviceContext.getResourcePolicy().getClusterName()+"]");
							logger.finer("	Module Name ["+serviceContext.getResourcePolicy().getModuleName()+"]");
							logger.finer("	VHost Name ["+serviceContext.getResourcePolicy().getVirtualHostNameAlias()+"]");
							logger.finer("	Cluster Idendity ["+clusterIdentity+"]");
						}
						initMemberIds(clusterIdentity);
						registerClusterObserver(clusterIdentity, observer);
					}
				}
			}
		}
		finally {
			clusterFilterLock.unlock();
		}
	}
	
	/*
	 * Initialize the individual server identities for the server cluster
	 * along with the cell and node names
	 */
	private void initMemberIds(Identity clusterId)
	{
		if (logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordClusterRoutingFilter.class.getName(), "initMemberIds() - id: "+clusterId);
		}
		
		clusterService = ClusterServiceFactory.getClusterService();
		identities = clusterService.getMemberIdentities(clusterId);
		
		int count = 0;
		for (Identity clusterMemberId : identities)
		{
			if(logger.isLoggable(Level.FINE))
			{
				logger.fine("id["+count+"] value: " + clusterMemberId);
			}
			count++;
			String serverName = (String)clusterMemberId .getProperties().get("MEMBERNAME");
			activeServerMap.put(serverName,clusterMemberId);
		}
		
		if (logger.isLoggable(Level.FINEST))
		{
			logger.exiting(ConcordClusterRoutingFilter.class.getName(), "initMemberIds()");
		}
	}
	
	/*
	 * Register the inner class as cluster listener
	 */
	private void registerClusterObserver(Identity clusterId, ClusterObserver observer)
	{
		if(logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordClusterRoutingFilter.class.getName(),
					"registerClusterObserver");
		}
		if(logger.isLoggable(Level.FINE))
		{
			logger.fine("Registering for UCF events on clusterID ["+clusterId+"]");
		}
		
		clusterService.registerInterest(observer,clusterId,ClusterObserver.TYPE_MEMBER_ADDED);
    	clusterService.registerInterest(observer,clusterId,ClusterObserver.TYPE_MEMBER_REMOVED);
    	
    	if(logger.isLoggable(Level.FINEST))
		{
			logger.exiting(ConcordClusterRoutingFilter.class.getName(),
					"registerClusterObserver");
		}
	}
	
	/*
	 * Cluster Observer class is used to track the status of active servers in the cluster
	 */
	private class ConcordClusterObserver implements ClusterObserver
	{

		/* (non-Javadoc)
		 * @see com.ibm.wsspi.cluster.ClusterObserver#notify(com.ibm.wsspi.cluster.Identity, java.lang.String, java.lang.Object)
		 */
		public void notify(Identity clusterId, String type, Object memberId) {
			if (logger.isLoggable(Level.FINER))
			{
				logger.finer("NOTIFY: type["+type+"] cId["+clusterId+"] serverId["+memberId+"]");
			}
			Identity serverId = (Identity)memberId;
			String serverName = (String) serverId.getProperties().get("MEMBERNAME");
			if (type.equalsIgnoreCase(ClusterObserver.TYPE_MEMBER_REMOVED))
			{
				if (activeServerMap.containsKey(serverName))
				{
					clusterFilterLock.lock();
					try {
						if (logger.isLoggable(Level.FINE))
						{
							logger.fine("Cluster: MEMBER_REMOVED: server="+serverName);
							logger.fine("Removing "+serverName+" from server hashing list");
						}
						activeServerMap.remove(serverName);
						activeDocumentMap.invalidateServerId(serverId);
					}
					finally {
						clusterFilterLock.unlock();
					}
				}
				else {
					logger.log(Level.WARNING,
							ProxyLogUtil.get("CONCORD_CLUSTER_FILTER_MEMBER_REMOVED_NOT_ACTIVE_WARNING",serverName));
				}
			}
			else if (type.equalsIgnoreCase(ClusterObserver.TYPE_MEMBER_ADDED))
			{
				if (logger.isLoggable(Level.FINE))
				{
					logger.fine("Cluster: MEMBER_ADDED: server="+serverName);
					logger.fine("Adding "+serverName+" to server hashing list");
				}
				if (!activeServerMap.containsKey(serverName))
				{
					clusterFilterLock.lock();
					try {
						activeServerMap.put(serverName, serverId);
					}
					finally {
						clusterFilterLock.unlock();
					}
				}
				else {
					logger.log(Level.INFO, 
							ProxyLogUtil.get("CONCORD_CLUSTER_FILTER_MEMBER_ALREADY_ACTIVE_INF0",serverName));
				}
			}
		}
		
	}

	/*
	 * Set WLM routing based on the repository id and document id.
	 * documentId = repository id + document id
	 */
	private void setRouteByDocumentId(HttpProxyServiceContext serviceContext, String documentId)
	{
		try {
			SelectionPolicy selectionPolicy = serviceContext.getSelectionPolicy();
			Map criteriaMap = selectionPolicy.getSelectionCriteraMap();
			Identity id = (Identity)criteriaMap.get(SCA_CLUSTER_MEMBER_IDENTITY);
			
			if (documentId != null)
			{
				id = activeDocumentMap.get(documentId);
				String targetServer = null;
				if (id != null)
				{
					targetServer = (String) id.getProperties().get("MEMBERNAME");
					if (logger.isLoggable(Level.FINER))
					{
						logger.finer("Retrieved ID from active document map: server [" + targetServer + "] document id[" + documentId + "]");
					}
				}
				else {
					targetServer = calculateTargetServer(documentId);
					id = activeServerMap.get(targetServer);
					if (logger.isLoggable(Level.FINER))
					{
						logger.finer("Determined target server from algorithm: server [" + targetServer + "] document id[" + documentId + "]");
					}
				}
				if (logger.isLoggable(Level.FINER))
				{
					logger.finer("Attempting to set the ID with WLM");
				}
				criteriaMap.put(SCA_CLUSTER_MEMBER_IDENTITY, id);
				logRoutingRequest(serviceContext, documentId, targetServer);
			}
			else {
				logRoutingRequest(serviceContext,"DEFAULT","WLM-Routing");
			}
		}
		catch (Exception e)
		{
			FFDCFilter.processException(e, "ConcordClusterRouterFilter", "WLM-Routing-determination");
		}
	}
	
	private void logRoutingRequest(HttpProxyServiceContext context, String documentId, String targetServer)
	{
		if(logger.isLoggable(Level.FINE))
		{
			String ip = context.getClientAddr().getHostAddress()+ ":"+ context.getClientPort();
			logger.fine(context.getRequest().getMethod() + " ip["+ ip+ "] uri[ "+ context.getRequest().getRequestURI()+ "] documentId [ "+documentId+" ] targetServer["+targetServer+"]" );
		}
	}

	/*
	 * Compute the target server based on the document id
	 */
	private String calculateTargetServer(String documentId)
	{
		String targetServer = null;
		clusterFilterLock.lock();
		try {
			int hash = hashUri(documentId);
			int result = hash%activeServerMap.size();
			targetServer = (String)activeServerMap.keySet().toArray()[result];
			Identity id = activeServerMap.get(targetServer);
			activeDocumentMap.put(documentId, id);
		}
		finally {
			clusterFilterLock.unlock();
		}
		
		return targetServer;
	}
	
	/**
	 * Hash Algorithm that return an integer value based on the string parameter and number
	 * of servers active in a cluster.  Any given string is guaranteed to get the same integer result.
	 * 
	 * @param uri
	 * @return hash result
	 */	
	private static int hashUri(String uri)
	{
		int hashCode = 0;
		try
		{
			MessageDigest messageDigest = MessageDigest.getInstance("MD5");
			byte bid[] = messageDigest.digest(uri.getBytes());
			int eorTotal = 0;
			for (int i = 0; i < bid.length; i++)
			{
				eorTotal = eorTotal ^ bid[i];
			}

			hashCode = Math.abs(eorTotal);
		}
		catch (NoSuchAlgorithmException e)
		{
			FFDCFilter.processException(e, "ConcordClusterRoutingFilter", "Unable to create MD5 messageDigest");
		}
		return hashCode;
	}

}
