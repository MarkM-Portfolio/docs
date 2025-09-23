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

import java.io.File;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.proxy.filter.routing.OnpremiseRoutingPolicy;
import com.ibm.concord.proxy.filter.routing.IRoutingPolicy;
import com.ibm.concord.proxy.filter.routing.SmartCloudRoutingPolicy;
import com.ibm.concord.proxy.mbean.StaticClusterMgr;
import com.ibm.concord.proxy.util.ConcordRequestParser;
import com.ibm.ws.proxy.filter.http.HttpProxyServerFilter;
import com.ibm.wsspi.cluster.ClusterService;
import com.ibm.wsspi.cluster.ClusterServiceFactory;
import com.ibm.wsspi.cluster.Identity;
import com.ibm.wsspi.http.channel.HttpRequestMessage;
import com.ibm.wsspi.http.channel.values.StatusCodes;
import com.ibm.wsspi.proxy.filter.FilterWrapper;
import com.ibm.wsspi.proxy.filter.http.HttpFilterStatusCode;
import com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext;
import com.ibm.wsspi.proxy.selection.policy.SelectionPolicy;

/**
 * Routes the HTTP requests to IBM Docs server based on cookie. 
 *
 */
public class ConcordRequestRoutingFilter extends HttpProxyServerFilter
{
	private static Logger logger = Logger.getLogger(ConcordRequestRoutingFilter.class.getName());
	
	private static final String SCA_CLUSTER_MEMBER_IDENTITY = "ucf.cluster.member.id";
	
	private static ClusterService clusterService = ClusterServiceFactory.getClusterService();
	
	private static IRoutingPolicy policy;
	
	private Lock filterLock = new ReentrantLock();
	/*
	 * (non-Javadoc)
	 * @see com.ibm.wsspi.proxy.filter.http.HttpDefaultFilter#init(com.ibm.wsspi.proxy.filter.FilterWrapper)
	 */
	public void init(FilterWrapper filterWrapper) throws Exception
	{
		logger.entering(ConcordRequestRoutingFilter.class.getName(), "init()");
		
		super.init(filterWrapper);
		
		if (policy == null)
		{
		  filterLock.lock();
		  try
		  {
		    if (policy == null)
		    {
		      if (StaticClusterMgr.isEnableStaticRouting())
		      {
		        policy = SmartCloudRoutingPolicy.getInstance();
		      }
		      else
		        policy = new OnpremiseRoutingPolicy();
		    }
		  }
		  finally
		  {
		    filterLock.unlock();
		  }
		}
		
		logger.exiting(ConcordRequestRoutingFilter.class.getName(), "init()");
	}
	
	/**
	 *	Method doFilter is the SPI interface called for this class on a request that needs to
	 *  be proxied to an application server. This methods determines if it's a Concord request, 
	 *  then determines the server which the request needs to go to based on the cookie.
	 *  
	 */
	public StatusCodes doFilter(HttpProxyServiceContext serviceContext) throws Exception
	{
		logger.entering(ConcordRequestRoutingFilter.class.getName(), "doFilter()");

		StatusCodes status = HttpFilterStatusCode.STATUS_FILTER_SUCCESS;
		if (!ConcordRequestParser.isMonitoredAppName(serviceContext.getResourcePolicy().getApplicationName()))
		{
			// this request is not headed to our EAR so we don't care about handling the request.
			return status;
		}
		
		HttpRequestMessage request = serviceContext.getRequest();
		if (logger.isLoggable(Level.FINEST))
		{
			logger.finest("Routing request: [" + request.getMethod() + "][" + request.getRequestURI() + "]");
		}
		
		serviceContext.setAttribute("docsRequest", "true");
		
		// Route the request according to the full server name in cookie.
		Map<String, String> descMap = policy.doRoute(serviceContext);
		if (descMap != null)
		{
			Identity identity = clusterService.getIdentity(descMap);
			SelectionPolicy selectionPolicy = serviceContext.getSelectionPolicy();
			Map criteriaMap = selectionPolicy.getSelectionCriteraMap();
			criteriaMap.put(SCA_CLUSTER_MEMBER_IDENTITY, identity);
			
			logRoutingRequest(serviceContext, identity.toString());
		}
		else
		{
//		  logger.info("Use WAS proxy to select route for URI : " + request.getRequestURI());
		  logRoutingRequest(serviceContext, "WLM-Default Routing");
		}
		
		logger.exiting(ConcordRequestRoutingFilter.class.getName(), "doFilter()");
		
		return status;
	}
	
	/**
	 * Log the routing information.
	 * 
	 * @param context
	 * @param targetServer
	 */
	private void logRoutingRequest(HttpProxyServiceContext context, String targetServer)
	{
		if (logger.isLoggable(Level.FINEST))
		{
			String ip = context.getClientAddr().getHostAddress() + ":" + context.getClientPort();
			logger.finest(context.getRequest().getMethod() + " ip[" + ip + "] uri[ " + context.getRequest().getRequestURI() + "] targetServer[" + targetServer + "]");
		}
	}
}
