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

import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.websphere.cache.DistributedMap;
import com.ibm.websphere.cache.exception.DynamicCacheServiceNotStarted;
import com.ibm.ws.cache.EntryInfo;
import com.ibm.ws.cache.ServerCache;
import com.ibm.ws.ffdc.FFDCFilter;
import com.ibm.wsspi.cluster.Identity;

public class ConcordDynamicDocumentIdCache extends ConcordServerIdentityCache
{
	private static final Logger logger = Logger.getLogger(ConcordDynamicDocumentIdCache.class.getName());
	private DistributedMap cache = null;
	private ReentrantLock lock = new ReentrantLock();
	private int cacheInactiveTimeout = 90;	// default inactive timeout
	
	private static final int DEFAULT_CACHE_ENTRY_TTL = Integer.MAX_VALUE;
	private static final int DEFAULT_CACHE_PRIORITY = 1;
	
	public static final String CONCORD_PROXY_DOCUMENTID_CACHE = "proxy/concord_id_cache";
	
	protected ConcordDynamicDocumentIdCache() throws DynamicCacheServiceNotStarted
	{
		if (logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordDynamicDocumentIdCache.class.getName(), "constructor");
		}
		
		try {
			cacheInactiveTimeout = ConcordProxyConfig.getInstance().getDocumentIdCacheTimeout();
		}
		catch (Exception e)
		{
			FFDCFilter.processException(e, "ConcordDynamicDocumentIdCache: constructor", "Error reading configuration data");
		}

		/*
		 * In the proxy server process, the dynacache entries are not bound to the JNDI
		 * names listed in config. We had to call the internal WebSphere APIs to create
		 * cache object.
		 */
		cache = (DistributedMap)ServerCache.cacheUnit.createObjectCache(CONCORD_PROXY_DOCUMENTID_CACHE);
		
		if (logger.isLoggable(Level.FINEST))
		{
			logger.exiting(ConcordDynamicDocumentIdCache.class.getName(), "constructor");
		}
	}
	
	public boolean containsKey(String documentId)
	{
		return cache.containsKey(documentId);
	}

	public Identity get(String documentId)
	{
		return (Identity) cache.get(documentId);
	}

	public void invalidateServerId(Identity id)
	{
		cache.invalidate(id);
	}

	public void put(String documentId, Identity serverId)
	{
		if (logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordDynamicDocumentIdCache.class.getName(), "put");
		}
		lock.lock();
		try {
			cache.put(documentId, 
					serverId, 
					DEFAULT_CACHE_PRIORITY, 
					DEFAULT_CACHE_ENTRY_TTL, 
					cacheInactiveTimeout, 
					EntryInfo.NOT_SHARED, 
					new Object[]{serverId,documentId});
		}
		finally {
			lock.unlock();
			if (logger.isLoggable(Level.FINEST))
			{
				logger.exiting(ConcordDynamicDocumentIdCache.class.getName(), "put");
			}
		}
	}

	public void remove(String documentId)
	{
		if (logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordDynamicDocumentIdCache.class.getName(), "remove");
		}
		lock.lock();
		try {
			cache.remove(documentId);
		}
		finally {
			lock.unlock();
			if (logger.isLoggable(Level.FINEST))
			{
				logger.exiting(ConcordDynamicDocumentIdCache.class.getName(), "remove");
			}
		}
	}

}
