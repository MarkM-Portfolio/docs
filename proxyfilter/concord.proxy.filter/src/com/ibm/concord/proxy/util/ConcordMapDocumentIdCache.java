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

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.wsspi.cluster.Identity;

/*
 * Map based implementation to manage WasServer Identities for routing.
 * This class is only a backup in case Dynacache is not operational. This
 * class is very basic and does not support the inactive timeout which is
 * important for routing to the appropriate server.
 */
public class ConcordMapDocumentIdCache extends ConcordServerIdentityCache
{
	private static final Logger	logger	= Logger.getLogger(ConcordMapDocumentIdCache.class.getName());
	private Map<String, Identity> serverIdCache = new HashMap<String, Identity>();
	private ReentrantLock lock = new ReentrantLock();
	
	public boolean containsKey(String documentId)
	{
		return serverIdCache.containsKey(documentId);
	}

	public Identity get(String documentId)
	{
		return serverIdCache.get(documentId);
	}

	public void invalidateServerId(Identity id)
	{
		if (logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordMapDocumentIdCache.class.getName(), "invalidateServerId");
		}

		try {
			/*
			 * Iterate over the active documents and remove the id of the server that went inactive
			 */
			for (String documentId : serverIdCache.keySet())
			{
				Identity serverId = serverIdCache.get(documentId);
				if (id.equals(serverId))
				{
					if (logger.isLoggable(Level.FINE))
					{
						logger.fine("removing documentId["+documentId+"] which was handled on server["+serverId.getProperties().get("MEMBERNAME")+"]");
					}
					remove(documentId);
				}
			}
		}
		finally {
			if (logger.isLoggable(Level.FINEST))
			{
				logger.exiting(ConcordMapDocumentIdCache.class.getName(), "invalidateServerId");
			}			
		}
	}

	public void put(String documentId, Identity serverId)
	{
		if (logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordMapDocumentIdCache.class.getName(), "put");
		}
		lock.lock();
		try {
			serverIdCache.put(documentId, serverId);
		}
		finally {
			lock.unlock();
			if (logger.isLoggable(Level.FINEST))
			{
				logger.exiting(ConcordMapDocumentIdCache.class.getName(), "put");
			}
		}
	}

	public void remove(String documentId)
	{
		if (logger.isLoggable(Level.FINEST))
		{
			logger.entering(ConcordMapDocumentIdCache.class.getName(), "remove");
		}
		lock.lock();
		try {
			serverIdCache.remove(documentId);
		}
		finally {
			lock.unlock();
			if (logger.isLoggable(Level.FINEST))
			{
				logger.exiting(ConcordMapDocumentIdCache.class.getName(), "remove");
			}
		}
	}

}
