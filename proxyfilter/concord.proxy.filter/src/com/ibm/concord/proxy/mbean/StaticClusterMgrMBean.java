/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.proxy.mbean;

import com.ibm.wsspi.odc.ODCTree;

/**
 * A JMX management bean that being used to manage the static cluster information on WebSphere PROXY server.
 * 
 */
public interface StaticClusterMgrMBean
{
	/**
	 * Reload the target tree XML files in static routes folder to refresh the cluster information on WebSphere PROXY server.
	 * 
	 * @return true if reload the cluster information successfully, otherwise false
	 */
	public boolean reloadClusterInformation();
	
	/**
	 * Get ODC tree in memory
	 */
	public boolean printAllClusterInformation();
	
	/**
	 * Merge the target tree defined in path to the memory target tree of proxy
	 * Export the updated tree node to targettree.xml
	 * Refresh the cluster information on WebSphere PROXY server
	 * 
	 * @param paths  the target tree paths which need to be merged
	 * @throws Exception
	 */
//	public void mergeToTargetTree(String path) throws Exception;
}
