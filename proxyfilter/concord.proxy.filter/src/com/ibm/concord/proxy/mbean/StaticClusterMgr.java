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

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.PrintStream;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.ListIterator;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.IOUtils;

import com.ibm.concord.proxy.filter.routing.SmartCloudManagement;
import com.ibm.concord.proxy.filter.routing.SmartCloudObserver;
import com.ibm.concord.proxy.util.ConcordRequestParser;
import com.ibm.ws.cluster.channel.ChannelTargetImpl;
import com.ibm.ws.cluster.channel.HealthMonitorManagerImpl;
import com.ibm.ws.cluster.service.ClusterManagementImpl;
import com.ibm.ws.odc.ODCManagerImpl;
import com.ibm.ws.odc.ODCTreeImpl;
import com.ibm.ws.odc.ODCUtil;
import com.ibm.ws.odc.XmlParser;
import com.ibm.ws.odc.cell.TreeBuilder;
import com.ibm.ws.proxy.dwlm.http.ForeignODCTreeBuilder;
import com.ibm.wsspi.channel.framework.CFEndPoint;
import com.ibm.wsspi.channel.framework.ChannelFrameworkFactory;
import com.ibm.wsspi.channel.framework.ChannelFrameworkService;
import com.ibm.wsspi.cluster.ClusterManagement;
import com.ibm.wsspi.cluster.ClusterManagementFactory;
import com.ibm.wsspi.cluster.ClusterService;
import com.ibm.wsspi.cluster.ClusterServiceFactory;
import com.ibm.wsspi.cluster.EndPoint;
import com.ibm.wsspi.cluster.Identity;
import com.ibm.wsspi.cluster.adapter.IdentityMapping;
import com.ibm.wsspi.cluster.adapter.channel.CFEndPointUtility;
import com.ibm.wsspi.cluster.adapter.channel.HealthMonitorFactory;
import com.ibm.wsspi.odc.IODCFactory;
import com.ibm.wsspi.odc.ODCException;
import com.ibm.wsspi.odc.ODCFactory;
import com.ibm.wsspi.odc.ODCHelper;
import com.ibm.wsspi.odc.ODCManager;
import com.ibm.wsspi.odc.ODCManagerFactory;
import com.ibm.wsspi.odc.ODCNode;
import com.ibm.wsspi.odc.ODCTree;
import com.ibm.wsspi.proxy.config.ProxyConfig;
import com.ibm.wsspi.proxy.config.ProxyConfigService;
import com.ibm.wsspi.proxy.config.http.HttpProxyConfig;
import com.ibm.wsspi.runtime.service.WsServiceRegistry;

/**
 * A JMX management bean that being used to manage the static cluster information on WebSphere PROXY server.
 * 
 */
public class StaticClusterMgr implements StaticClusterMgrMBean
{
	private static Logger LOG = Logger.getLogger(StaticClusterMgr.class.getName());
	
	private static ODCHelper ODCHELPER = null;
	private static CheckServersStatusJob checkingStatusJob = null;
	private static boolean isEnableStaticRouting = true;
	private static long MONITOR_TIMEOUT = Integer.MAX_VALUE;
	private static Map<String, String> serversInfoMap = null;
	
	private static SmartCloudManagement scMgr;
	private static SmartCloudObserver  scObserver;
	
	private static String defaultCellName;
	
	private ReentrantReadWriteLock targetTreeLock = new ReentrantReadWriteLock();

	public enum RoutingPolicy {
	    STATIC("static"), DYNAMIC("dynamic");
	    
	    private String policy;
	    
	    RoutingPolicy(String p)
	    {
	      policy = p;
	    }
	    
	    public String toString()
	    {
	      return policy;
	    }
	    
	    public static RoutingPolicy enumValueOf(String value)
	    {
	      if (STATIC.toString().equals(value))
	        return STATIC;
	      else if (DYNAMIC.toString().equals(value))
	        return DYNAMIC;
	      return null;
	    }
	  }
	
	static
	{
		try
		{
			checkingStatusJob = new CheckServersStatusJob();
		}
		catch (Throwable ex)
		{
			LOG.log(Level.WARNING, "Exceptions happens while creating the job used to check status of servers in cluster", ex);
		}
		
		try
		{
			ODCHELPER = ODCFactory.getInstance().createODCHelper();
		}
		catch (Throwable ex)
		{
			LOG.log(Level.WARNING, "Exceptions happens while creating the ODC Helper instance", ex);
		}
		
		try
		{
			ProxyConfigService proxyConfigService = ((ProxyConfigService)WsServiceRegistry.getService(ProxyConfigService.class, ProxyConfigService.class));
			ProxyConfig proxyConfig = proxyConfigService.getProxyConfig();
			HttpProxyConfig httpProxyConfig = proxyConfig.getHttpProxyConfig();
			isEnableStaticRouting = httpProxyConfig.isEnableStaticRouting();
			MONITOR_TIMEOUT = (long)httpProxyConfig.getAvailabilityMonitorTimeout() * 1000l;
			
			LOG.log(Level.INFO, "Static routing: " + isEnableStaticRouting + "; high availability monitor timeout is: " + MONITOR_TIMEOUT);
			
			if (MONITOR_TIMEOUT < 0)
			{
				LOG.log(Level.INFO, "The high availability monitor timeout is: " + MONITOR_TIMEOUT + ", less than 0, so change it to " + Integer.MAX_VALUE);
				MONITOR_TIMEOUT = Integer.MAX_VALUE;
			}
		}
		catch (Exception ex)
		{
			LOG.log(Level.WARNING, "Unexpected exception obtaining while getting some proxy setttings", ex);
		}
		
		StaticClusterMgr.retrieveServersInfo();
	}
	
	private ClusterManagement clusterManagement;
	private Map<String, Identity> cloneIDMappings;
	private CFEndPointUtility cFEndPointUtility;
	
	/**
	 * Constructor of the StaticClusterMgr.
	 * 
	 */
	public StaticClusterMgr()
	{
		cFEndPointUtility = new CFEndPointUtility();
		cloneIDMappings = Collections.synchronizedMap(new HashMap<String, Identity>());
		clusterManagement = ClusterManagementFactory.getNonDistributedClusterManagement();
	}
	
	public static boolean isEnableStaticRouting()
	{
	  return isEnableStaticRouting;
	}
	
	public boolean printAllClusterInformation()
	{
      if (!isEnableStaticRouting)
      {
          LOG.log(Level.INFO, "Only support to print the cluster information in static route mode");
          return false;
      }
      // Retrieve the servers information in ODC tree.
      retrieveServersInfo();
      return true;
	}
	/*
	 * (non-Javadoc)
	 * @see com.ibm.concord.proxy.mbean.StaticClusterMgrMBean#reloadClusterInformation()
	 */
	public synchronized boolean reloadClusterInformation()
	{
		LOG.log(Level.INFO, "reloadClusterInformation() ENTRY");
		
		long start = System.currentTimeMillis();
		
		try
		{
			if (!isEnableStaticRouting)
			{
				LOG.log(Level.INFO, "Only support to reload the cluster information in static route mode");
				return false;
			}
			
			long startStop = System.currentTimeMillis();
			
			IODCFactory odcFactory = ODCFactory.getInstance();
			TreeBuilder odcTreeBuilder = (TreeBuilder)odcFactory.createODCTreeBuilder();
			odcTreeBuilder.stop();
			
			LOG.log(Level.INFO, "Spend " + (System.currentTimeMillis() - startStop) + " miliseconds to stop ODC tree builder");
			
			// Clear the servers in the map.
			serversInfoMap.clear();
			
			long startUndefine = System.currentTimeMillis();
			
			// Remove the old nodes from target tree.
			ODCManager odcMgr = ODCManagerFactory.getManager();
			ODCTree tree = odcMgr.getTree("target", ODCHELPER.cellGroup);
			ODCNode root = tree.getRoot();
			ODCNode nodes[] = root.getChildren();
			int len = nodes != null ? nodes.length : 0;
			for (int index = 0; index < len; index++)
			{
				if (!ForeignODCTreeBuilder.FOREIGN_TARGET_CELL_NAME.equals(nodes[index].getName()) && !nodes[index].isOnMyCell())
				{
					// UnDefine the cluster information.
					ODCNode cellNode = nodes[index];
					ODCNode clusterNodes[] = cellNode.getNodes(ODCHELPER.cluster);
					int length = clusterNodes != null ? clusterNodes.length : 0;
					for (int number = 0; number < length; number++)
					{
						// Remove information of the members in the cluster.
						undefineClusterInformation(cellNode, clusterNodes[number]);
					}
					
					// Remove the node from target tree.
					root.removeChild(nodes[index]);
					LOG.log(Level.INFO, "reloadClusterInformation(), remove the old node: " + cellNode.getName());
				}
			}
			
			LOG.log(Level.INFO, "Spend " + (System.currentTimeMillis() - startUndefine) + " miliseconds to undefine old cluster");
			
			long startTree = System.currentTimeMillis();
			
			// Change the value of private variable "initialized", so that can rebuild the target tree into memory.
			Field field = TreeBuilder.class.getDeclaredField("initialized");
			field.setAccessible(true);
			field.setBoolean(odcTreeBuilder, false);
			field.setAccessible(false);
			
			// Rebuild the target tree into memory.
			odcTreeBuilder.start();
			
			LOG.log(Level.INFO, "Spend " + (System.currentTimeMillis() - startTree) + " miliseconds to start tree builder");
			
			// Retrieve the servers information in ODC tree.
			retrieveServersInfo();
			
			long startDefine = System.currentTimeMillis();
			
			// Redefine the cluster information after refresh the target tree.
			nodes = root.getChildren();
			len = nodes != null ? nodes.length : 0;
			for (int index = 0; index < len; index++)
			{
				if (!ForeignODCTreeBuilder.FOREIGN_TARGET_CELL_NAME.equals(nodes[index].getName()) && !nodes[index].isOnMyCell())
				{
					ODCNode cellNode = nodes[index];
					ODCNode clusterNodes[] = cellNode.getNodes(ODCHELPER.cluster);
					int length = clusterNodes != null ? clusterNodes.length : 0;
					for (int number = 0; number < length; number++)
					{
						// Rebuild the cluster information into memory.
						defineClusterInformation(cellNode, clusterNodes[number]);
					}
				}
			}
			
			LOG.log(Level.INFO, "Spend " + (System.currentTimeMillis() - startDefine) + " miliseconds to define new cluster");
			
			return true;
		}
		catch (Throwable ex)
		{
			LOG.log(Level.WARNING, "Exceptions happens while reload the target tree XML", ex);
		}
		finally
		{
			LOG.log(Level.INFO, "Spend " + (System.currentTimeMillis() - start) + " miliseconds to reloadClusterInformation()");
			LOG.log(Level.INFO, "reloadClusterInformation() EXIT");
		}
		
		return false;
	}
	
	/**
	 * Remove the information of the members in the cluster.
	 * 
	 * @param cellNode cellNode specifies the ODC node of the cell
	 * @param clusterNode specifies the ODC node of the cluster
	 */
	private void undefineClusterInformation(ODCNode cellNode, ODCNode clusterNode)
	{
		LOG.log(Level.INFO, "undefineClusterInformation() ENTRY");
		
		try
		{
			if (cellNode == null || clusterNode == null)
			{
				LOG.log(Level.WARNING, "Undefine cluster: Cell or cluster ODC node is null, cell ODC node: " + cellNode + ", cluster ODC node: " + clusterNode);
				return;
			}
			
			LOG.log(Level.INFO, "Undefine the cluster information for cell " + cellNode.getName() + ", cluster " + clusterNode.getName());
			
			if (!clusterNode.is(ODCHELPER.cluster))
			{
				LOG.log(Level.WARNING, "Undefine cluster: The ODCNode passed in is type: " + clusterNode.getType() + ", but should be type: " + ODCHELPER.cluster);
				return;
			}
			
			Identity cluster = IdentityMapping.getClusterIdentityFromClusterName(cellNode.getName(), clusterNode.getName());
			if (IdentityMapping.isGenericCluster(cluster))
			{
				LOG.log(Level.WARNING, "Undefine cluster: The cluster is Generic and should not be removed.");
				return;
			}
			
			synchronized (cluster)
			{
				ODCNode[] clusterMemberNodes = clusterNode.getNodes(ODCHELPER.server);
				if (clusterMemberNodes == null || clusterMemberNodes.length == 0)
				{
					LOG.log(Level.INFO, "Undefine cluster: There is no members in the cluster " + clusterNode);
					return;
				}
				
				String cellName = cellNode.getName();
				int length = clusterMemberNodes.length;
				Identity[] clusterMemberIdentities = new Identity[length];
				for (int index = 0; index < length; index++)
				{
					ODCNode nodeNode = clusterMemberNodes[index].getNode(ODCHELPER.node);
					String nodeName = nodeNode.getName();
					String hostName = (String) nodeNode.getProperty(ODCHELPER.nodeHostName);
					String serverName = clusterMemberNodes[index].getName();
					Identity clusterMember = ((ClusterManagementImpl) clusterManagement).createClusterMember(cellName, nodeName, hostName, serverName);
					clusterMemberIdentities[index] = clusterMember;
					
					LOG.log(Level.INFO, "Undefines the member [" + clusterMember + "] for cluster [" + cluster + "]");
				}
				clusterManagement.disjoinCluster(cluster, clusterMemberIdentities);
			}
		}
		catch (Throwable ex)
		{
			LOG.log(Level.WARNING, "Exception happens while undefining the cluster information", ex);
		}
		finally
		{
			LOG.log(Level.INFO, "undefineClusterInformation() EXIT");
		}
	}
	
	/**
	 * Rebuild the cluster information on this PROXY server into memory.
	 * 
	 * @param cellNode specifies the ODC node of the cell
	 * @param clusterNode specifies the ODC node of the cluster
	 */
	private void defineClusterInformation(ODCNode cellNode, ODCNode clusterNode)
	{
		LOG.log(Level.INFO, "defineClusterInformation() ENTRY");
		
		try
		{
			if (cellNode == null || clusterNode == null)
			{
				LOG.log(Level.WARNING, "Define cluster: Cell or cluster ODC node is null, cell ODC node: " + cellNode + ", cluster ODC node: " + clusterNode);
				return;
			}
			
			LOG.log(Level.INFO, "Define the cluster information for cell " + cellNode.getName() + ", cluster " + clusterNode.getName());
			
			if (!clusterNode.is(ODCHELPER.cluster))
			{
				LOG.log(Level.WARNING, "Define cluster: The ODCNode passed in is type: "+ clusterNode.getType() + ", but should be type: " + ODCHELPER.cluster);
				return;
			}
			
			Identity cluster = IdentityMapping.getClusterIdentityFromClusterName(cellNode.getName(), clusterNode.getName());
			if (IdentityMapping.isGenericCluster(cluster))
			{
				LOG.log(Level.WARNING, "Define cluster: The cluster is Generic and should not be removed.");
				return;
			}
			
			synchronized (cluster)
			{
				String clusterName = clusterNode.getName();
				String passedInClusterName = (String) cluster.getProperties().get("CLUSTERNAME");
				if (passedInClusterName == null || !passedInClusterName.equals(clusterName))
				{
					LOG.log(Level.INFO, "The passed in cluster: " + cluster + " has name: " + passedInClusterName + " that doesn't match ODCNode's cluster name: " + clusterName);
				}
				
				ODCNode[] clusterMemberNodes = clusterNode.getNodes(ODCHELPER.server);
				if (clusterMemberNodes == null || clusterMemberNodes.length == 0)
				{
					LOG.log(Level.INFO, "Undefine cluster: There is no members in the cluster " + clusterNode);
					return;
				}
				
				String cellName = cellNode.getName();
				int length = clusterMemberNodes.length;
				Identity[] clusterMemberIdentities = new Identity[length];
				for (int index = 0; index < length; index++)
				{
					String serverCloneID = (String) clusterMemberNodes[index].getProperty(ODCHELPER.serverCloneId);
					String serverName = clusterMemberNodes[index].getName();
					ODCNode nodeNode = clusterMemberNodes[index].getNode(ODCHELPER.node);
					String nodeName = nodeNode.getName();
					String hostName = (String) nodeNode.getProperty(ODCHELPER.nodeHostName);
					Identity clusterMember = ((ClusterManagementImpl) clusterManagement).createClusterMember(cellName, nodeName, hostName, serverName);
					clusterManagement.setClusterAssociation(cluster, clusterMember);
					
					if (serverCloneID != null)
					{
						setCloneId(clusterMember, serverCloneID);
					}
					clusterMemberIdentities[index] = clusterMember;
					
					Integer weight = (Integer) clusterMemberNodes[index].getProperty(ODCHELPER.serverWeight);
					clusterManagement.setDesiredWeight(cluster, clusterMember, weight.intValue());
					
					ODCNode[] transports = clusterMemberNodes[index].getNodes(ODCHELPER.transport);
					LinkedList<ODCNode> channelChainsList = new LinkedList<ODCNode>();
					for (ODCNode transportNode : transports)
					{
						ODCNode[] channelChains = transportNode.getNodes(ODCHELPER.channelChain);
						channelChainsList.addAll(Arrays.asList(channelChains));
					}
					ListIterator<ODCNode> iter = channelChainsList.listIterator();
					while (iter.hasNext())
					{
						CFEndPoint cfep = (CFEndPoint) ((ODCNode) iter.next()).getProperty(ODCHELPER.channelChainCFEndpoint);
						if (cfep != null)
						{
							cFEndPointUtility.addCFEndPointToMember(clusterMember, cfep, cellName, nodeName, serverName);
						}
					}
					
					LOG.log(Level.INFO, "Defines the member [" + clusterMember + "] for cluster [" + cluster + "]");
				}
				
				clusterManagement.joinCluster(cluster, clusterMemberIdentities);
			}
		}
		catch (Throwable ex)
		{
			LOG.log(Level.WARNING, "Exception happens while defining the cluster information", ex);
		}
		finally
		{
			LOG.log(Level.INFO, "defineClusterInformation() EXIT");
		}
	}
	
	/**
     * Print the cluster information in the memory of this PROXY server.
     * 
     * @param cellNode specifies the ODC node of the cell
     * @param clusterNode specifies the ODC node of the cluster
     */
    private static void printClusterInformation(ODCNode cellNode, ODCNode clusterNode)
    {
        LOG.log(Level.INFO, "printClusterInformation() ENTRY");
        
        try
        {
            if (cellNode == null || clusterNode == null)
            {
                LOG.log(Level.WARNING, "Print cluster: Cell or cluster ODC node is null, cell ODC node: " + cellNode + ", cluster ODC node: " + clusterNode);
                return;
            }
            
            LOG.log(Level.INFO, "Print the cluster information for cell " + cellNode.getName() + ", cluster " + clusterNode.getName());
            
            if (!clusterNode.is(ODCHELPER.cluster))
            {
                LOG.log(Level.WARNING, "Print cluster: The ODCNode passed in is type: "+ clusterNode.getType() + ", but should be type: " + ODCHELPER.cluster);
                return;
            }
            
            Identity cluster = IdentityMapping.getClusterIdentityFromClusterName(cellNode.getName(), clusterNode.getName());
            LOG.log(Level.INFO, "Print cluster: cluster identity : " + cluster);
            
            if (IdentityMapping.isGenericCluster(cluster))
            {
                LOG.log(Level.WARNING, "Print cluster: The cluster is Generic.");
                return;
            }
            
            synchronized (cluster)
            {
                String clusterName = clusterNode.getName();
                String passedInClusterName = (String) cluster.getProperties().get("CLUSTERNAME");
                if (passedInClusterName == null || !passedInClusterName.equals(clusterName))
                {
                    LOG.log(Level.INFO, "The passed in cluster: " + cluster + " has name: " + passedInClusterName + " that doesn't match ODCNode's cluster name: " + clusterName);
                }
                
                ODCNode[] clusterMemberNodes = clusterNode.getNodes(ODCHELPER.server);
                if (clusterMemberNodes == null || clusterMemberNodes.length == 0)
                {
                    LOG.log(Level.INFO, "Print cluster: There is no members in the cluster " + clusterNode);
                    return;
                }
                
                String cellName = cellNode.getName();
                int length = clusterMemberNodes.length;
                for (int index = 0; index < length; index++)
                {
                    String serverCloneID = (String) clusterMemberNodes[index].getProperty(ODCHELPER.serverCloneId);
                    String serverName = clusterMemberNodes[index].getName();
                    ODCNode nodeNode = clusterMemberNodes[index].getNode(ODCHELPER.node);
                    String nodeName = nodeNode.getName();
                    String hostName = (String) nodeNode.getProperty(ODCHELPER.nodeHostName);
                    Integer weight = (Integer) clusterMemberNodes[index].getProperty(ODCHELPER.serverWeight);

                    Identity memberIdentity = IdentityMapping.getMemberIdentityFromMemberName(cellName, nodeName, serverName);
                    LOG.log(Level.INFO, "Print cluster: member identity " + memberIdentity);
                    
                    LOG.log(Level.INFO, "Print cluster: member [serverName: {0}, nodeName: {1}, hostName: {2}, serverCloneID: {3}, weight: {4}", 
                        new Object[]{serverName, nodeName, hostName,serverCloneID, weight});
                
                    
                    ODCNode[] transports = clusterMemberNodes[index].getNodes(ODCHELPER.transport);
                    LinkedList<ODCNode> channelChainsList = new LinkedList<ODCNode>();
                    for (ODCNode transportNode : transports)
                    {
                        ODCNode[] channelChains = transportNode.getNodes(ODCHELPER.channelChain);
                        channelChainsList.addAll(Arrays.asList(channelChains));
                    }
                    ListIterator<ODCNode> iter = channelChainsList.listIterator();
                    LOG.log(Level.INFO, "CFEndPoint list:");
                    while (iter.hasNext())
                    {
                        CFEndPoint cfep = (CFEndPoint) ((ODCNode) iter.next()).getProperty(ODCHELPER.channelChainCFEndpoint);
                        if (cfep != null)
                        {
                          LOG.log(Level.INFO, cfep.toString());
                        }
                    }
                    
                }
            }
        }
        catch (Throwable ex)
        {
            LOG.log(Level.WARNING, "Exception happens while printing the cluster information", ex);
        }
        finally
        {
            LOG.log(Level.INFO, "printClusterInformation() EXIT");
        }
    }
	/**
	 * 
	 * @param memberIdentity
	 * @param cloneID
	 */
	private void setCloneId(Identity memberIdentity, String cloneID)
	{
		LOG.entering(StaticClusterMgr.class.getName(), "setCloneId");
		
		boolean updated = false;
		if (cloneIDMappings.get(cloneID) == null)
		{
			updated = true;
		}
		else if (cloneIDMappings.get(cloneID) != memberIdentity)
		{
			clusterManagement.undefineAttribute((Identity) cloneIDMappings.get(cloneID), cloneID);
			updated = true;
		}
		
		if (updated)
		{
			cloneIDMappings.put(cloneID, memberIdentity);
			clusterManagement.defineAttribute(memberIdentity, cloneID);
		}
		
		LOG.exiting(StaticClusterMgr.class.getName(), "setCloneId");
	}
	
	/**
	 * Retrieve all the servers in current ODC tree. These servers information are used to verify the serving server. 
	 * 
	 */
	public synchronized static void retrieveServersInfo()
	{
		LOG.log(Level.INFO, "RetrieveServersInfo() ENTRY");
		
		try
		{
			ODCManager manager = ODCManagerFactory.getManager();
			ODCTree tree = manager.getTree("target", ODCHELPER.cellGroup);
			ODCNode cells[] = tree.getRoot().getChildren();
			
			int cellNumber = (cells != null) ? cells.length : 0;
			Map<String, String> serversMap = new HashMap<String, String>();
			for (int index = 0; index < cellNumber; index++)
			{
				ODCNode cell = cells[index];
				
				LOG.log(Level.INFO, "Retrieve servers information, found cell: " + cell.getName());
				if (defaultCellName == null && !ForeignODCTreeBuilder.FOREIGN_TARGET_CELL_NAME.equals(cell.getName()) && !cell.isOnMyCell())
				{
				  defaultCellName = cell.getName();
				}
				ODCNode[] clusterNodes = cell.getNodes(ODCHELPER.cluster);
		        if (clusterNodes.length > 0)
		        {
		          // Rebuild the cluster information into memory.
		          printClusterInformation(cell, clusterNodes[0]);
		        }
				ODCNode nodes[] = cell.getNodes(ODCHELPER.node);
				int nodeNumber = (nodes != null) ? nodes.length : 0;
				for (int number = 0; number < nodeNumber; number++)
				{
					ODCNode node = nodes[number];
					
					LOG.log(Level.INFO, "Retrieve servers information, found node: " + node.getName());
					
					ODCNode servers[] = node.getNodes(ODCHELPER.server);
					int serverNumber = (servers != null) ? servers.length : 0;
					for (int count = 0; count < serverNumber; count++)
					{
						String fullName = node.getName() + "\\" + servers[count].getName();
						serversMap.put(fullName, fullName);
						
						LOG.log(Level.INFO, "Retrieve servers information, found server: " + fullName);
					}
				}
			}
			serversInfoMap = serversMap;
		}
		catch (Throwable ex)
		{
			LOG.log(Level.WARNING, "Exception happens while retrieving the servers information", ex);
		}
		
		LOG.log(Level.INFO, "RetrieveServersInfo() EXIT");
	}
	
	/**
	 * Check if the specified server exists or not. If do not find specified server, then should not specify the server in selection criteria map. 
	 * 
	 * @param cellName specifies the cell name that the server belong to
	 * @param nodeName specifies the node name that the server belong to
	 * @param serverName specifies the name of server being checked
	 * @return true if the server exists, otherwise false
	 */
	public static boolean isServerExists(String cellName, String nodeName, String serverName)
	{
		if (!isEnableStaticRouting)
		{
			// Do not check the server in non-static route mode.
			return true;
		}
		
		if (cellName == null || nodeName == null || serverName == null)
		{
			return false;
		}
		try
		{
			return serversInfoMap.containsKey(nodeName + "\\" + serverName);
		}
		catch (Throwable ex)
		{
			LOG.log(Level.WARNING, "Exception happens while checking specified server", ex);
		}
		return false;
	}
	
	public static boolean addServerInfo(String cellName, String nodeName, String serverName)
	{
	  if (cellName == null || nodeName == null || serverName == null)
      {
          return false;
      }
      String fullName = nodeName + "\\" + serverName;
      serversInfoMap.put(fullName, fullName);
      LOG.log(Level.INFO, "Add servers information: " + fullName);
      return true;
	}
	
	// check the server available status in zookeeper/SmartCloudManager in SmartCloud
	public static boolean isServerAvailable(String fullName)
	{
	  boolean bServerAvailable = false;
	  if (isEnableStaticRouting) {
        if (scMgr != null && fullName != null) {
          bServerAvailable = scMgr.isServerAvailable(null, fullName);
        }
      }
	  return bServerAvailable;
	}
	
    public static void setEndPointAvailable(String serverFullName, boolean bAvailable)
    {
      LOG.entering(StaticClusterMgr.class.getName(), "setEndPointAvailable", serverFullName);
      Map<String, String> descMap = ConcordRequestParser.getDescMapFromFullName(serverFullName);
      if (descMap != null)
      {
        descMap.put("CELLNAME", defaultCellName);
        ClusterService clusterService = ClusterServiceFactory.getClusterService();
  
        Identity clusterMember = clusterService.getIdentity(descMap);
  
        EndPoint[] endPoints = clusterService.matchEndPoints(clusterMember, ChannelTargetImpl.distinction);
        for (int num = 0; num < endPoints.length; num++)
        {
          EndPoint endPoint = endPoints[num];
          endPoint.setAvailability(bAvailable);
        }
      }
  
      LOG.exiting(StaticClusterMgr.class.getName(), "setEndPointAvailable");
  
    }
	
    public ReentrantReadWriteLock getTargetTreeLock() {
      return targetTreeLock;
    }
  
	/**
	 * Check the status of the servers in the cluster.
	 * 
	 * @param targetInfo specifies target that being checked
	 * 
	 */
	public static void checkServersStatus(MonitorTargetInfo targetInfo)
	{
		LOG.entering(StaticClusterMgr.class.getName(), "checkServersStatus", targetInfo);
		
		LOG.log(Level.INFO, "checkServersStatus for " + targetInfo);
		if (targetInfo == null || targetInfo.getCellName() == null || targetInfo.getClusterName() == null)
		{
			LOG.log(Level.WARNING, "Illegal parameters, the value of parameter targetInfo is invalid");
			return;
		}
		
		String cellName = targetInfo.getCellName();
		String clusterName = targetInfo.getClusterName();
		RequestSchemes scheme = targetInfo.getRequestScheme();
		
		try
		{
			ODCNode cellNode = null;
			ODCNode clusterODCNode = null;
			ODCTree tree = ODCManagerFactory.getManager().getTree("target", ODCHELPER.cellGroup);
			ODCNode root = tree.getRoot();
			ODCNode nodes[] = root.getChildren();
			int size = nodes != null ? nodes.length : 0;
			for (int index = 0; index < size; index++)
			{
				if (!ForeignODCTreeBuilder.FOREIGN_TARGET_CELL_NAME.equals(nodes[index].getName()) && !nodes[index].isOnMyCell())
				{
					cellNode = nodes[index];
					if (!cellName.equals(cellNode.getName()))
					{
						continue;
					}
					ODCNode clusterODCNodes[] = cellNode.getNodes(ODCHELPER.cluster);
					int length = clusterODCNodes != null ? clusterODCNodes.length : 0;
					for (int number = 0; number < length; number++)
					{
						if (clusterName.equals(clusterODCNodes[number].getName()))
						{
							clusterODCNode = clusterODCNodes[number];
							break;
						}
					}
				}
			}
			
			if (clusterODCNode == null)
			{
				LOG.log(Level.WARNING, "Cluster ODC Node is null");
				return;
			}
			
			ClusterService clusterService = ClusterServiceFactory.getClusterService();
			ChannelFrameworkService channelFramework = (ChannelFrameworkService) ChannelFrameworkFactory.getChannelFramework();
			HealthMonitorManagerImpl healthMonitorManager = (HealthMonitorManagerImpl) HealthMonitorFactory.getHealthMonitorManager();
			
			ODCNode[] clusterMembers = clusterODCNode.getNodes(ODCHELPER.server);
			int length = clusterMembers != null ? clusterMembers.length : 0;
			if (length <= 0)
			{
				LOG.log(Level.WARNING, "Did not have members in the cluster " + clusterODCNode.getName());
				return;
			}
			
			for (int index = 0; index < length; index++)
			{
				ODCNode nodeNode = clusterMembers[index].getNode(ODCHELPER.node);
				Map<String, String> descMap = new HashMap<String, String>();
				descMap.put("CELLNAME", cellName);
				descMap.put("NODENAME", nodeNode.getName());
				descMap.put("MEMBERNAME", clusterMembers[index].getName());
				Identity clusterMember = clusterService.getIdentity(descMap);
				LOG.log(Level.INFO, "get cluster member by description key (CELLNAME:{0}, NODENAME:{1}, MEMBERNAME:{2}", new String[]{descMap.get("CELLNAME"), descMap.get("NODENAME"), descMap.get("MEMBERNAME")});
				LOG.log(Level.INFO, clusterMember.toString());
				EndPoint[] endPoints = clusterService.matchEndPoints(clusterMember, ChannelTargetImpl.distinction);
				CFEndPoint[] cfEndpoints = new CFEndPoint[endPoints.length];
				ArrayList<EndPoint> endPointsList = new ArrayList<EndPoint>();
				ArrayList<CFEndPoint> cfEndpointsList = new ArrayList<CFEndPoint>();    
				for (int num = 0; num < endPoints.length; num++)
				{
					cfEndpoints[num] = IdentityMapping.getCFEndPoint(endPoints[num].getIdentity());
					boolean sslEnabled = cfEndpoints[num].isSSLEnabled();
					if ((scheme == RequestSchemes.UNKNOWN) || (scheme == RequestSchemes.HTTP && !sslEnabled) || (scheme == RequestSchemes.HTTPS && sslEnabled))
					{
						channelFramework.prepareEndPoint(cfEndpoints[num]);
						endPointsList.add(endPoints[num]);
						cfEndpointsList.add(cfEndpoints[num]);
						LOG.log(Level.INFO, "Add monitor end point " + cfEndpoints[num]);
					}
				}
				
				if (cfEndpointsList.size() > 0)
				{
					healthMonitorManager.addMonitoringEndPoints(cfEndpointsList.toArray(new CFEndPoint[0]), endPointsList.toArray(new EndPoint[0]), MONITOR_TIMEOUT);
				}
				
				LOG.log(Level.INFO, "Monitor the health of endpoints [" + endPointsList + "]");						
			}
		}
		catch (Throwable ex)
		{
			LOG.log(Level.WARNING, "Exception happens while checking the status of servers in the cluster", ex);
		}
		
		LOG.exiting(StaticClusterMgr.class.getName(), "checkServersStatus");
	}
	
	/**
	 * Start the job that being used to check the status of server in a cluster.
	 * 
	 */
	public static void startCheckSrvsStatusJob()
	{
		if (isEnableStaticRouting)
		{
			checkingStatusJob.start();
		}
	}
	
	/**
	 * Notify to execute the job to check the status of servers in cluster.
	 * 
	 * @param targetInfo specifies the target which being monitored the health for.
	 * 
	 */
	public static void invokeCheckSrvsStatusJob(MonitorTargetInfo targetInfo)
	{
		if (isEnableStaticRouting)
		{
		    LOG.log(Level.INFO, "invoke check service status job on target " + targetInfo);
			checkingStatusJob.invoke(targetInfo);
		}
	}
	
	/**
	 * Stop the job that being used to check the status of server in a cluster.
	 * 
	 */
	public static void stopCheckSrvsStatusJob()
	{
		if (isEnableStaticRouting)
		{
			checkingStatusJob.finish();
		}
	}
	

    private ODCTree readTargetTree(String targetTreePath) throws FileNotFoundException, Exception
    {
      ODCTreeImpl tree = null;
      FileInputStream in = null;
      try 
      {
        in = new FileInputStream(targetTreePath);
        tree = readTargetTree(in);
        
      }
      finally
      {
        IOUtils.closeQuietly(in);
      }
      return tree;
    }
    
    private ODCTreeImpl readTargetTree(InputStream in) throws Exception
    {
      ODCTreeImpl tree = new ODCTreeImpl((ODCManagerImpl)ODCHELPER.mgr, "target", ODCHELPER.cellGroup);
      XmlParser parser = new XmlParser(tree, ODCHELPER);
      parser.parse(in, false, new String[0]);
      return tree;
    }
    
    // merge tree2 to tree, and return the first cell node
    private ODCNode mergeTree(ODCTree tree, ODCTree tree2) throws ODCException
    {
      Lock lock = targetTreeLock.writeLock();
      lock.lock();
      try {
        ODCNode root = tree.getRoot();
        ODCNode[] nodes = root.getChildren();
        
        int len = nodes != null ? nodes.length : 0;
        for (int index = 0; index < len; index++)
        {
          if (!ForeignODCTreeBuilder.FOREIGN_TARGET_CELL_NAME.equals(nodes[index].getName()) && !nodes[index].isOnMyCell())
          {
            ODCNode cellNode = nodes[index];
            ODCNode[] clusterNodes = cellNode.getNodes(ODCHELPER.cluster);
            if (clusterNodes.length > 0)
            {
              // get first cluster node 
              ODCNode clusterNode = clusterNodes[0];
              ODCNode[] cellNodes2 = tree2.getRoot().getChildren();
              for (int i = 0; i < cellNodes2.length; i++)
              {
                ODCNode cellNode2 = cellNodes2[i];
                // add cell node
                root.addNode(cellNode2);
                // add server node to the first cluster node
                ODCNode[] clusterNodes2 = cellNode2.getNodes(ODCHELPER.cluster);
                for(int j = 0; j < clusterNodes2.length; j++) 
                {
                  ODCNode clusterNode2 = clusterNodes2[j];
                  ODCNode[] serverNodes2 = clusterNode2.getNodes(ODCHELPER.server);
                  for (int m = 0; m < serverNodes2.length; m++)
                  {
                    clusterNode.addNode(serverNodes2[m]);
                  }
                }
              }
              return cellNode;
            }
          }
        }
      } finally {
        lock.unlock();
      }
      return null;
    }
    
    public void mergeTargetTree(String sourcePath, String path) throws Exception
    {
      ODCTree sourceTree = readTargetTree(sourcePath);
      ODCTree tree = readTargetTree(path);
      mergeTree(sourceTree, tree);
      exportTargetTree(sourceTree, sourcePath+"_new");
    }
    
    public void mergeToTargetTree(InputStream in) throws Exception
    {
      ODCTree tree = readTargetTree(in);
      mergeToTargetTree(tree);
    }
    
    public void mergeToTargetTree(String path) throws Exception
    {
      ODCTree tree = readTargetTree(path);
      mergeToTargetTree(tree);
    }
    
    // Merge to current Websphere proxy target tree
    private void mergeToTargetTree(ODCTree newTree) throws Exception
    {
      
      ODCManager odcMgr = ODCManagerFactory.getManager();
      ODCTree tree = odcMgr.getTree("target", ODCHELPER.cellGroup);
      ODCNode cellNode = null;
      synchronized (tree) 
      {
        tree.beginTransaction("Update proxy target tree due to ");
        try
        {
          cellNode = mergeTree(tree, newTree);
          tree.commitTransaction();
        }catch(Exception e)
        {
          tree.rollbackTransaction();
        }
      }
      String targetXmlPath = System.getProperty("targetTreeXmlPath");
      exportTargetTree(tree, targetXmlPath+"/targetTree.xml");
      if (cellNode != null)
      {
        ODCNode[] clusterNodes = cellNode.getNodes(ODCHELPER.cluster);
        if (clusterNodes.length > 0)
        {
          // Rebuild the cluster information into memory.
          this.defineClusterInformation(cellNode, clusterNodes[0]);

//          Identity cluster = IdentityMapping.getClusterIdentityFromClusterName(cellNode.getName(), clusterNodes[0].getName());
//          synchronized(cluster) 
//          {
//            ClassLoader newCL = TreeBuilder.class.getClassLoader();
//            ClassLoader oldCL = Thread.currentThread().getContextClassLoader();
//            Thread.currentThread().setContextClassLoader(newCL);
//            try
//            {
//              StaticClusterManagement manager = StaticClusterManagementFactory.getStaticClusterManagement();
//              Field clusterCreatedField = StaticClusterManagement.class.getDeclaredField("clusterCreated");
//              clusterCreatedField.setAccessible(true);
////            Map map = clusterCreatedField.get(manager);map.put(cluster, false);
//              clusterCreatedField.setAccessible(false);
//            }
//            finally
//            {
//              Thread.currentThread().setContextClassLoader(oldCL);
//            }
//          }
        }
      }
    }
    
    private void exportTargetTree(ODCTree tree, String path) throws Exception
    {
      FileOutputStream fout = new FileOutputStream(path);
      PrintStream ps = new PrintStream(fout);
      
      printHeader(ps);
      ps.println("<cellGroup name=\"target\">");
      
      ODCNode[] nodes = tree.getRoot().getChildren();
      int len = nodes != null ? nodes.length : 0;
      for (int index = 0; index < len; index++)
      {
        if (!ForeignODCTreeBuilder.FOREIGN_TARGET_CELL_NAME.equals(nodes[index].getName()) && !nodes[index].isOnMyCell())
        {
          ODCNode cell = nodes[index];
          cell.print(ps);
        }
      }
      
      ps.println("</cellGroup>");
      
      ps.close();
    }
    
    protected void printHeader(PrintStream ps) throws Exception
    {
      ps.println("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
      ps.println("<!DOCTYPE target [<!ENTITY apos \"'\"> <!ENTITY nbsp \" \">]>");
      ps.println("<!-- ");
      ps.print("   Automatically generated by: ");
      ps.println(ODCUtil.getMyServerPath());
      ps.print("   Date: ");
      ps.println(new Date());
      ps.println(" -->");
    }
    
    public static void main(String[] args)
    {
      StaticClusterMgr mgr = new StaticClusterMgr();
      try
      {
        ODCTree tree1 = mgr.readTargetTree("C:\\Work\\temp\\targettree_new.xml");
      }
      catch (Exception e)
      {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }
//    ODCTree tree2 = readTargetTree();
    }
    
    public static void uninit()
    {
      if (isEnableStaticRouting)
      {
        if (scObserver != null)
          scObserver.uninit();
      }
    }
	
    public static void setSmartCloudObserver(SmartCloudObserver observer)
    {
      scObserver = observer;
    }
    
    public static SmartCloudObserver getSmartCloudObserver()
    {
      return scObserver;
    }
    
    public static void setSmartCloudManager(SmartCloudManagement mgr)
    {
      scMgr = mgr;
    }
    
    public static SmartCloudManagement getSmartCloudManager()
    {
      return scMgr;
    }
	/**
	 * A thread that being used to check the status of servers in the cluster.
	 * 
	 */
	private static class CheckServersStatusJob extends Thread
	{
		private static Logger LOG = Logger.getLogger(CheckServersStatusJob.class.getName());
		private static long INTERVAL_TIME = 30000;
		
		private long lastCheckTime = 0l;
		private boolean isFinished = false;
		private boolean isInvoking = false;
		private ArrayList<MonitorTargetInfo> waitingList = new ArrayList<MonitorTargetInfo>();
		
		/**
		 * Only check the status when the interval time is bigger than 5 seconds with last checking.
		 * 
		 * @return true if the interval time between last checking time with current time is big enough, otherwise false
		 */
		private boolean isIntervalTimeEnough()
		{
			return ((System.currentTimeMillis() - lastCheckTime) > INTERVAL_TIME);
		}
		
		/*
		 * (non-Javadoc)
		 * @see java.lang.Thread#run()
		 */
		public void run()
		{
			synchronized (waitingList)
			{
				while (!isFinished)
				{
					try
					{
						// Waiting here, until want to execute the job to check the status of servers.
						waitingList.wait();
					}
					catch (Throwable ex)
					{
						LOG.log(Level.WARNING, "Exception happens while waiting the locking object of this thread", ex);
					}
					
					try
					{
						// Only check the status when the interval time is bigger than 5 seconds with last checking.
						if (!isFinished && isIntervalTimeEnough())
						{
						    LOG.log(Level.WARNING, "Checking server status now!");
							lastCheckTime = System.currentTimeMillis();
							int size = waitingList.size();
							for (int index = 0; index < size; index++)
							{
								checkServersStatus(waitingList.get(index));
							}
							waitingList.clear();
						}
					}
					catch (Throwable ex)
					{
						LOG.log(Level.WARNING, "Exception happens while checking the status of servers in the job", ex);
					}
				}
			}
		}
		
		/**
		 * Start the job that being used to check the status of server in a cluster.
		 * 
		 */
		public synchronized void start()
		{
			try
			{
				isFinished = false;
				super.start();
			}
			catch (Throwable ex)
			{
				LOG.log(Level.WARNING, "Exception happens while starting the checking status job", ex);
			}
		}
		
		/**
		 * Notify to execute the job to check the status of servers in cluster.
		 * 
		 * @param targetInfo specifies the target which being monitored the health for.
		 * 
		 */
		public void invoke(MonitorTargetInfo targetInfo)
		{
		  LOG.log(Level.WARNING, "Start job to check server status");
			if (isFinished || isInvoking || !isIntervalTimeEnough() || waitingList.contains(targetInfo))
			{
				return;
			}
			isInvoking = true;
			try
			{
				synchronized (waitingList)
				{
					waitingList.add(targetInfo);
					waitingList.notifyAll();
				}
			}
			catch (Throwable ex)
			{
				LOG.log(Level.WARNING, "Exception happens while notifying to execute the checking status job", ex);
			}
			finally
			{
				isInvoking = false;
			}
		}
		
		/**
		 * Finish the job that being used to check the status of server in a cluster.
		 * 
		 */
		public void finish()
		{
			try
			{
				isFinished = true;
				synchronized (waitingList)
				{
					waitingList.notifyAll();
				}
			}
			catch (Throwable ex)
			{
				LOG.log(Level.WARNING, "Exception happens while finishing checking status job", ex);
			}
		}
	}
	
	/**
	 * Defines the schemes of the HTTP request.
	 * 
	 */
	public static enum RequestSchemes
	{
		UNKNOWN,
		HTTP,
		HTTPS
	}
	
	/**
	 * Presents the information of the target which being monitored the health for.
	 *
	 */
	public static class MonitorTargetInfo
	{
		private String cellName;
		private String clusterName;
		private RequestSchemes scheme;
		
		/**
		 * 
		 * @param cellName
		 * @param clusterName
		 * @param scheme
		 */
		public MonitorTargetInfo(String cellName, String clusterName, RequestSchemes scheme)
		{
			this.cellName = cellName;
			this.clusterName = clusterName;
			this.scheme = scheme;
		}
		
		/**
		 * 
		 * @return
		 */
		public String getCellName()
		{
			return cellName;
		}
		
		/**
		 * 
		 * @return
		 */
		public String getClusterName()
		{
			return clusterName;
		}
		
		/**
		 * 
		 * @return
		 */
		public RequestSchemes getRequestScheme()
		{
			return scheme;
		}
		
		/*
		 * (non-Javadoc)
		 * @see java.lang.Object#toString()
		 */
		public String toString()
		{
			return "CELLNAME=" + cellName + ", CLUSTERNAME=" + clusterName + ", SCHEME=" + scheme;
		}
		
		/*
		 * (non-Javadoc)
		 * @see java.lang.Object#equals(java.lang.Object)
		 */
		public boolean equals(Object object)
		{
			if (object instanceof MonitorTargetInfo)
			{
				MonitorTargetInfo compared = (MonitorTargetInfo) object;
				
				boolean cellNameEqual = (cellName == null && compared.cellName == null) || (cellName != null && cellName.equals(compared.cellName));
				boolean clusterNameEqual = (clusterName == null && compared.clusterName == null) || (clusterName != null && clusterName.equals(compared.clusterName));
				boolean schemeEqual = (scheme == compared.scheme);
				if (cellNameEqual && clusterNameEqual && schemeEqual)
				{
					return true;
				}
			}
			return false; 
		}
	}
	
	// build time stamp format "20160323-0853"
	public static int compareBuild(String buildTimeStamp1, String buildTimeStamp2)
	{
	  if (buildTimeStamp1 == null)
	  {
	    if (buildTimeStamp2 == null)
	      return 0;
	    else 
	      return -1;
	  } else if (buildTimeStamp2 == null)
	    return 1;

	  String[] ns = buildTimeStamp1.split("-");
	  String[] os = buildTimeStamp2.split("-");
	  if(ns.length == 2 && os.length == 2)
	  {
	    for(int i = 0; i < 2; i++)
	    {
	      int nd = Integer.parseInt(ns[i]);
	      int od = Integer.parseInt(os[i]);
	      if(nd == od)
	        continue;
	      else if (nd > od)
	        return 1;
	      else
	        return -1;
	     }
	     return 0;
	  }
	    
	  LOG.log(Level.WARNING, "The build time stamp format is not right for " + buildTimeStamp1 + " or " + buildTimeStamp2);
	  return 2;
	}
}
