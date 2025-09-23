/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.concord.proxy.filter.routing;

import java.io.IOException;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.proxy.filter.ConcordFilterDeployer;
import com.ibm.concord.proxy.mbean.StaticClusterMgr;
import com.ibm.concord.proxy.util.ConcordProxyConstants;
import com.ibm.concord.proxy.util.ConcordRequestParser;
import com.ibm.lotusLive.registry.DecryptException;
import com.ibm.lotusLive.registry.RegistryParser;
import com.ibm.lotusLive.registry.SettingNotFoundException;
import com.ibm.wsspi.http.channel.HttpRequestMessage;
import com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext;
import com.ibm.zookeeper.client.ZooKeeperClient;

/**
 * Routing docs related http request for SmartCloud
 */
public class SmartCloudRoutingPolicy implements IRoutingPolicy
{
  private static Logger LOG = Logger.getLogger(SmartCloudRoutingPolicy.class.getName());

  private static final SmartCloudRoutingPolicy instance = new SmartCloudRoutingPolicy();

  private SmartCloudManagement clusterMgr;

  private SmartCloudObserver observer;

  private RoutingSelectorAdvisor selectAdvisor;

  private IRoutingPolicy delegatePolicy;

  private boolean isDocsMA;
  
  private StaticClusterMgr.RoutingPolicy routingPolicyValue = StaticClusterMgr.RoutingPolicy.STATIC;
  
  StaticClusterMgr staticClusterMgr;

  public static SmartCloudRoutingPolicy getInstance()
  {
    return instance;
  }

  private SmartCloudRoutingPolicy()
  {
    LOG.log(Level.INFO, "Initialize SmartCloud routing policy");
    String topologyName = null;
    String baseTopologyName = null;
    String connectionString = null;
    boolean bZKServerSide0 = true;
    try
    {
      RegistryParser registryParser = new RegistryParser();
      try
      {
        String maSetting = registryParser.getSetting("Docs", "is_docs_multiactive");
        isDocsMA = (maSetting != null) && Boolean.parseBoolean(maSetting);
        LOG.log(Level.INFO, "Docs Multi-Active is " + isDocsMA);
        routingPolicyValue = StaticClusterMgr.RoutingPolicy.enumValueOf(registryParser.getSetting("Docs", "docsrp_routing_policy"));
        LOG.log(Level.INFO, "Docs Routing Policy is " + routingPolicyValue);
        ZooKeeperClient scZKClient = new ZooKeeperClient();
        bZKServerSide0 = scZKClient.isZKServerSide0();
        scZKClient.close();
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING, "IO error for ", e);
      }
      catch (SettingNotFoundException e)
      {
        LOG.log(Level.WARNING, "Could not read settings from registry parser", e);
      }
      catch (DecryptException e)
      {
        LOG.log(Level.WARNING, "DecryptException when get settings from registry parser", e);
      }
      if (isDocsMA || (routingPolicyValue == StaticClusterMgr.RoutingPolicy.DYNAMIC))
      {
        topologyName = registryParser.getTopologyName();
        baseTopologyName = registryParser.getBaseTopologyName();
        connectionString = ZooKeeperClient.getConnectString(registryParser, null);
        LOG.log(Level.INFO, "Zookeeper: Read settings from registry.xml with topology name \'" + topologyName + "' base topology name \'"
            + baseTopologyName + "\' and ZooKeeper connection string " + connectionString);
      }
    }
    catch (SettingNotFoundException e1)
    {
      LOG.log(Level.WARNING, "Zookeeper: Could not settings from registry parser", e1);
    }

    if (connectionString == null)
    {
      LOG.log(Level.WARNING, "Zookeeper: Could not get ZooKeeper connection string. Fall back to OnpremiseRoutingPolicy");
      delegatePolicy = new OnpremiseRoutingPolicy();
      return;
    }
    clusterMgr = new SmartCloudManagement(topologyName, isDocsMA);

    observer = new SmartCloudObserver(clusterMgr, baseTopologyName, connectionString, bZKServerSide0);

    selectAdvisor = new RoutingSelectorAdvisor(clusterMgr);

    staticClusterMgr = ConcordFilterDeployer.getStaticClusterMgrInstance();
    
    StaticClusterMgr.setSmartCloudManager(clusterMgr);
    StaticClusterMgr.setSmartCloudObserver(observer);
    // DataCenterStatus status = clusterMgr.getDataCenterStatus(clusterMgr.getLocalTopologyName());
    // if(status == DataCenterStatus.INACTIVE || status == null)
    // {
    // synchronized(clusterMgr)
    // {
    // try
    // {
    // clusterMgr.wait();
    // }
    // catch (InterruptedException e)
    // {
    // LOG.log(Level.WARNING, "Waiting for data center status change to active/upgrading, docsrp can route docs request with ",e )
    // }
    // }
    // }

  }

  @Override
  public Map<String, String> doRoute(HttpProxyServiceContext serviceContext)
  {
    if (delegatePolicy != null)
    {
      return delegatePolicy.doRoute(serviceContext);
    }

    if (observer.isTopologyChanged())
    {
      observer.setTopologyChanged(false);
      selectAdvisor.update();
    }

    MemberIdentity member = selectAdvisor.selectByRequest(serviceContext);
    LOG.log(Level.FINEST, serviceContext.getRequest().getRequestURI() + "->" + member);
    if (member != null)
    {
      String fullName = member.getServerFullName();
      Map<String, String> descMap = ConcordRequestParser.getDescMapFromFullName(fullName);
      if (descMap != null)
      {
        serviceContext.setAttribute("routeByCookie", "true");
        String defaultCellName = serviceContext.getResourcePolicy().getCellName();
        descMap.put("CELLNAME", defaultCellName);
        String nodeName = (String) descMap.get("NODENAME");
        String serverName = (String) descMap.get("MEMBERNAME");
        if (StaticClusterMgr.isServerExists(defaultCellName, nodeName, serverName))
          return descMap;
        else
        {
          StringBuilder builder = new StringBuilder().append(ConcordProxyConstants.COMPONENT_NAME)
              .append(ConcordProxyConstants.RP_NO_SERVER_FOUND).append(": Did not find the server: ").append(fullName);
          LOG.log(Level.WARNING, builder.toString());
          return null;
        }
      }
    }
    HttpRequestMessage request = serviceContext.getRequest();
    String requestURI = request.getRequestURI();
    LOG.log(Level.WARNING, "PAY ATTENTOIN!!! No availabe server selected by SmartCloudRoutingPolicy for request " + requestURI);
//    ReentrantReadWriteLock targetTreeLock = staticClusterMgr.getTargetTreeLock();
//    Lock lock = targetTreeLock.readLock();
//    lock.lock();
    return null;
  }
}
