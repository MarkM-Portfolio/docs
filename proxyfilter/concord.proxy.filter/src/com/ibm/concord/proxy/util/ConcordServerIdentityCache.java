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

import com.ibm.tx.util.logging.FFDCFilter;
import com.ibm.wsspi.cluster.Identity;

public abstract class ConcordServerIdentityCache
{
	private static final Logger	logger	= Logger.getLogger(ConcordServerIdentityCache.class.getName());
	private static volatile ConcordServerIdentityCache instance = null;
	private static ReentrantLock cacheLock = new ReentrantLock();
	
	public static ConcordServerIdentityCache getInstance()
	{
		if (instance == null)
		{
			cacheLock.lock();
			try {
				if (logger.isLoggable(Level.FINE))
				{
					logger.fine("Creating Dynacache based Document id Cache");
				}
				instance = new ConcordDynamicDocumentIdCache();
			}
			catch (Exception e)
			{
				FFDCFilter.processException(e, 
						"ConcordServerIdentityCache", 
						"Dynacache is not enabled: using Mapped based cache instance instead of dynamic cache");
				instance = new ConcordMapDocumentIdCache();
			}
			finally {
				cacheLock.unlock();
			}
		}
		
		return instance;
	}
	
	public abstract void put(String sessionId, Identity serverId);
	public abstract void remove(String sessionId);
	public abstract Identity get(String sessionId);
	public abstract boolean containsKey(String sessionId);
	public abstract void invalidateServerId(Identity id);
}
