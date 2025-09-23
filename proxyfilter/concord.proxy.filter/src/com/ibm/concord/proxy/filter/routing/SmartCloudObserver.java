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

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Calendar;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

//import com.ibm.docs.dns.SmartCloudDNSService;

import org.apache.commons.httpclient.DefaultHttpMethodRetryHandler;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.SimpleHttpConnectionManager;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.apache.commons.io.IOUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.cache.ChildData;
import org.apache.curator.framework.recipes.cache.NodeCache;
import org.apache.curator.framework.recipes.cache.NodeCacheListener;
import org.apache.curator.framework.recipes.cache.TreeCache;
import org.apache.curator.framework.recipes.cache.TreeCacheEvent;
import org.apache.curator.framework.recipes.cache.TreeCacheListener;
import org.apache.curator.framework.recipes.cache.TreeCacheEvent.Type;
import org.apache.curator.framework.recipes.locks.InterProcessMutex;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.framework.state.ConnectionStateListener;
import org.apache.curator.retry.RetryNTimes;
import org.apache.curator.utils.CloseableUtils;
import org.apache.curator.utils.ZKPaths;
import org.apache.zookeeper.CreateMode;
import org.apache.zookeeper.data.Stat;

import sun.misc.BASE64Decoder;

import com.ibm.concord.proxy.filter.ConcordFilterDeployer;
import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.DataCenterPhase;
import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.DataCenterStatus;
import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.ServerPhase;
import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.ServerStatus;
import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.UpgradingPolicy;
import com.ibm.concord.proxy.mbean.StaticClusterMgr;
import com.ibm.concord.proxy.util.ConcordRequestParser;
import com.ibm.json.java.JSONObject;
import com.ibm.wsspi.cluster.ClusterObserver;
import com.ibm.wsspi.cluster.EndPoint;
import com.ibm.wsspi.cluster.Identity;

public class SmartCloudObserver implements ClusterObserver
{
  private static Logger LOG = Logger.getLogger(SmartCloudObserver.class.getName());
  
  private SmartCloudManagement clusterMgr;
  
  private boolean bTopologyChanged = false;
  
  private static String docsZKPath = "/data/docs/data";
  
  private static int docsZKPathLength = ZKPaths.split(docsZKPath).size() + 1; // plus 1 for topology name level
  
  private static final String topologyZKPath = "/topology/docs/servers";

  private static final String targetTreeZKPath = "/data/docs/target_trees";
  
  // data center status
  private static final String topoStatusZKNode = "status";
  private static final String topoPhaseZKNode = "phase";
  private static final String topoMutexZKNode = "mutex";
  private static final String topoConfigZKNode = "config";
  
  private static final String docsMembersZKNode = "members";
  private static final String docsHeartBeatZKNode = "heartbeat";
  private static final String docsStatusZKNode = "status";
  private static final String docsPhaseZKNode = "phase";
  private static final String docsBuildZKNode = "build-timestamp";
  private static final String docsHostNameZKNode = "hostname";
  private static final String docsFullNameZKNode = "fullname";
  
  private String connectionString;// = "9.112.251.91:2181";//9.115.208.65(docsnext)
  
  private String baseTopologyName;
  
  static final String ENDPOINT_AVAILABLE_NAME = "type.state.change.reachability";
  
  private static final String NODEJS_SET_URL = "http://localhost:9099/set/";
  private static final String NODEJS_GET_URL = "http://localhost:9099/status";
  private static final String NODEJS_INACTIVE_STATUS = "inactive";
  private static final String NODEJS_ACTIVE_STATUS = "active";
  private static final String NODEJS_KEY_SEED = "CloudFactoryRules";
  
  private SimpleHttpConnectionManager httpConnectionManager;
  
  private final CuratorFramework client;
  
  private boolean isZKServerSide0;
  
  private Object upgradingLock = new Object();
  
  private ConcurrentHashMap<String, NodeCache> upgradingOneByOneNodeCaches = new ConcurrentHashMap<String, NodeCache>();
  private ConcurrentHashMap<String, NodeCache> upgradingAllNodeCaches = new ConcurrentHashMap<String, NodeCache>();
  
  private ThreadPoolExecutor executor;
  
  private static final long UPGRADING_THRESHOLD = 5 * 60 * 1000;//TODO:time
  
  
  public SmartCloudObserver(SmartCloudManagement mgr, String baseTN, String connectString, boolean bZKServerSide0)
  {
    isZKServerSide0 = bZKServerSide0;
    clusterMgr = mgr;
    connectionString = connectString;
    baseTopologyName = baseTN;
    
    docsZKPath = "/" + baseTopologyName + docsZKPath;
    LOG.log(Level.INFO, "ZooKeeper: Connecting " + connectionString + " and observe at path " + docsZKPath);
    
    client = CuratorFrameworkFactory.newClient(connectionString, 20 * 1000, 2 * 1000, new RetryNTimes(3, 2000));
    client.start();
    
    httpConnectionManager = new SimpleHttpConnectionManager();
    httpConnectionManager.getParams().setConnectionTimeout(5000);
    
    registerEvent();
    
    executor = new ThreadPoolExecutor(1, 1, UPGRADING_THRESHOLD, TimeUnit.MILLISECONDS, new ArrayBlockingQueue<Runnable>(1));
  }
  
  public void uninit()
  {
    if (client != null)
      CloseableUtils.closeQuietly(client);
  }
  
  private boolean updateDataCenterStatusInZK(String topoStatusPath) {
    DataCenterStatus currentStatus = null;
    try
    {
      currentStatus = clusterMgr.getDataCenterStatus(clusterMgr.getLocalTopologyName());
      if (currentStatus == null)
      {
        LOG.log(Level.WARNING, "ZooKeeper: the current data center " + clusterMgr.getLocalTopologyName()
            + " status in memory is null, will try to get it from zookeeper");
        Stat stat = client.checkExists().forPath(topoStatusPath);
        if (stat != null)
        {
          String statusString = new String(client.getData().forPath(topoStatusPath));
          DataCenterStatus status = DataCenterStatus.enumValueOf(statusString);
          LOG.log(Level.INFO, "ZooKeeper: the current data center " + clusterMgr.getLocalTopologyName() + " status in zookeeper is "
              + status);
          if (status != null)
            currentStatus = status;
        }
      }
      if (currentStatus == null)
        currentStatus = DataCenterStatus.ACTIVE;

      LOG.info("ZooKeeper: Try to set data center status node " + topoStatusPath + " to " + currentStatus);
      Stat stat = client.checkExists().forPath(topoStatusPath);
      if (currentStatus != null)
      {
        if (stat == null)
          client.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL)
              .forPath(topoStatusPath, currentStatus.toString().getBytes());
        else
          client.setData().forPath(topoStatusPath, currentStatus.toString().getBytes());
      }
      return true;
    } catch(Exception e) {
      LOG.log(Level.WARNING, "ZooKeeper: Could not set topology status on node " + topoStatusPath + " with status " + currentStatus, e);
    }
    return false;
  }
  
  private void registerEvent()
  {
    final String topoStatusPath = ZKPaths.makePath(docsZKPath, clusterMgr.getLocalTopologyName(), topoStatusZKNode);
    
    client.getConnectionStateListenable().addListener(new ConnectionStateListener()
    {
      @Override
      public void stateChanged(CuratorFramework client, ConnectionState newState)
      {
        LOG.info("ZooKeeper: client state Changed to " + newState.toString());
        if (newState == ConnectionState.LOST)
        {
          while (true)
          {
            try
            {
              if (client.getZookeeperClient().blockUntilConnectedOrTimedOut())
              {
                if (client.getZookeeperClient().isConnected()) {
                  boolean result = updateDataCenterStatusInZK(topoStatusPath);
                  LOG.log(Level.INFO, "ZooKeeper: set data center status " + topoStatusPath + (result?" successfully":" failed" ) + " after reconnected to zookeeper");
                  break;
                } else {
                  LOG.log(Level.INFO, "ZooKeeper: Could not connect to zookeeper yet, connecting....");
                }
              }
            }
            catch (InterruptedException e)
            {
              LOG.log(Level.WARNING, "ZooKeeper: exception happens when client wait for connecting to zookeeper", e);
            }
            catch (Exception e)
            {
              LOG.log(Level.WARNING, "ZooKeeper: exception happens when client wait for connecting to zookeeper", e);
            }
          }
        }
      }
    });
    
    TreeCache dataTreeCache = new TreeCache(client, docsZKPath);
    dataTreeCache.getListenable().addListener(new TreeCacheListener()
    {
      @Override
      public void childEvent(CuratorFramework client, TreeCacheEvent event) 
      {
          Type type = event.getType();
          ChildData data = event.getData();
          
          if (data != null)
          {
            String dataPath = data.getPath();
            LOG.log(Level.INFO, "ZooKeeper: " + dataPath + " changed with event:" + type);
            
            List<String> nodeList = ZKPaths.split(dataPath);
            int length = nodeList.size();
            String lastNode = nodeList.get(length - 1);
            if ((length - docsZKPathLength) == 4)
            {
              // members path
              // dataPath should be in Pattern ${docsZKPath}/${topologyName}/members/${serverShortName}/*
              if (docsHeartBeatZKNode.equals(lastNode) || docsStatusZKNode.equals(lastNode) || docsBuildZKNode.equals(lastNode) 
                  || docsHostNameZKNode.equals(lastNode) || docsFullNameZKNode.equals(lastNode) || docsPhaseZKNode.equals(lastNode))
              {
                
                if (data.getData() == null)
                {
                  // znode has been deleted
                  if (docsHeartBeatZKNode.equals(lastNode))
                  {
                    boolean bAvailable = (type != Type.NODE_REMOVED);
                    setServerAvailable(nodeList.get(docsZKPathLength), nodeList.get(docsZKPathLength + 2), bAvailable);
                  }
                }
                else
                {
                  // znode has been created or updated
                  String nodeValue = new String(data.getData());
                  
                  if (docsHeartBeatZKNode.equals(lastNode))
                  {
                    setServerAvailable(nodeList.get(docsZKPathLength), nodeList.get(docsZKPathLength + 2), true);
                    return;
                  }
                  if (docsStatusZKNode.equals(lastNode))
                  {
                    setServerStatus(nodeList.get(docsZKPathLength), nodeList.get(docsZKPathLength + 2), ServerStatus.enumValueOf(nodeValue));
                    return;
                  }
                  if (docsPhaseZKNode.equals(lastNode))
                  {
                    ServerPhase phase = ServerPhase.enumValueOf(nodeValue);
                    setServerPhase(nodeList.get(docsZKPathLength), nodeList.get(docsZKPathLength + 2), phase);
                    if (phase == ServerPhase.FLIPPED)
                      checkDataCenterFlipped();
                    return;
                  }
                  if (docsBuildZKNode.equals(lastNode))
                  {
                    setServerBuild(nodeList.get(docsZKPathLength), nodeList.get(docsZKPathLength + 2), nodeValue);
                    return;
                  }
                  if (docsHostNameZKNode.equals(lastNode))
                  {
                    setServerHostName(nodeList.get(docsZKPathLength), nodeList.get(docsZKPathLength + 2), nodeValue);
                    return;
                  }
                  if (docsFullNameZKNode.equals(lastNode))
                  {
                    setServerFullName(nodeList.get(docsZKPathLength), nodeList.get(docsZKPathLength + 2), nodeValue);
                    return;
                  }
                }
              }
            } else if ((length - docsZKPathLength) == 2)
            {
              // topology path
              // dataPath should be in Pattern ${docsZKPath}/${topologyName}/*
              if (topoStatusZKNode.equals(lastNode) || topoPhaseZKNode.equals(lastNode) || topoConfigZKNode.equals(lastNode))
              {
                if (data.getData() == null)
                {
                  // znode has been deleted
                  // there are at least two docsrp in one topology
                  // znode ${docsZKPath}/currentTopologyName/status is deleted, means one of the docsrp might be crashed
                  // need set data center recover its original status again
                  if (topoStatusZKNode.equals(lastNode))
                  {
                    boolean result = updateDataCenterStatusInZK(topoStatusPath);
                    LOG.log(Level.INFO, "ZooKeeper: set data center status " + topoStatusPath + (result?" successfully":" failed" ) + " after status node removed.");
                  }
                }
                else
                {
                  // znode has been created or updated
                  String nodeValue = new String(data.getData());
                  String tn = nodeList.get(docsZKPathLength);
                  if (topoStatusZKNode.equals(lastNode))
                  {
                    setDataCenterStatus(tn, DataCenterStatus.enumValueOf(nodeValue));
                  } else if (topoPhaseZKNode.equals(lastNode))
                  {
                    setDataCenterPhase(tn, DataCenterPhase.enumValueOf(nodeValue));
                  }else if (topoConfigZKNode.equals(lastNode))
                  {
                    try
                    {
                      JSONObject config = JSONObject.parse(nodeValue);
                      setDataCenterConfig(tn, config);
                    }
                    catch (IOException e)
                    {
                      LOG.log(Level.WARNING, "ZooKeeper: Data Center config setting is not right : " + nodeValue, e);
                    }
                  }
              }
            }
          } 
        } else
        {
          LOG.log(Level.INFO, "ZooKeeper: " + type);
          if (type == Type.INITIALIZED)
          {
            // INITIALIZED means startup or reconnect
            try
            {
              LOG.log(Level.INFO, "ZooKeeper: Update all servers status when zookeeper initialized");
              updateAllServers();
              LOG.log(Level.INFO, "ZooKeeper: Current topology -> " + clusterMgr.toString());
            }
            catch (Exception e)
            {
              LOG.log(Level.WARNING, "ZooKeeper: Could not update all the docs servers status when reconnected to zookeeper server", e);
            }
          }
           
        } 
      }
    });
    try
    {
      dataTreeCache.start();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "ZooKeeper: Can not listen for " + docsZKPath, e);
    }
    
  }

  private void updateAllServers() throws Exception
  {
    LOG.entering(SmartCloudObserver.class.getName(), "updateAllServers");
    Set<String> serverNames = clusterMgr.getServerNames();
    Stat docsDataStat = client.checkExists().forPath(docsZKPath);
    if (docsDataStat == null)
    {
      LOG.log(Level.WARNING, "ZooKeeper: no server data exist in path " + docsZKPath);
      return;
    }
    List<String> topoNodes = client.getChildren().forPath(docsZKPath);
    LOG.log(Level.INFO, "serverNames length:" + serverNames.size());
    
    for (int i = 0; i < topoNodes.size(); i++)
    {
      String topoName = topoNodes.get(i);
      String topoPath = ZKPaths.makePath(docsZKPath, topoName);
      String topoStatusPath = ZKPaths.makePath(topoPath, topoStatusZKNode);
      Stat topoStat = client.checkExists().forPath(topoStatusPath);
      DataCenterStatus dcStatus = DataCenterStatus.INACTIVE;
      if (topoStat != null)
        dcStatus = DataCenterStatus.enumValueOf(new String(client.getData().forPath(topoStatusPath)));
      setDataCenterStatus(topoName, dcStatus);
      LOG.log(Level.INFO, "updateAllServers: data center status " + topoStatusPath + ":" + dcStatus);
      
      String membersPath = ZKPaths.makePath(topoPath, docsMembersZKNode);
      if (client.checkExists().forPath(membersPath) != null)
      {
        List<String> serverNodes = client.getChildren().forPath(membersPath);
        for (int j = 0; j < serverNodes.size(); j++)
        {
          String serverName = serverNodes.get(j);
          boolean bContain = serverNames.remove(serverName);
  //        LOG.log(Level.INFO, "serverNames length:" + serverNames.size());
          String serverPath = ZKPaths.makePath(membersPath, serverName);
          LOG.log(Level.INFO, "updateAllServers: serverPath -> " + serverPath);
          Stat stat = client.checkExists().forPath(ZKPaths.makePath(serverPath, docsHeartBeatZKNode));
          if(bContain)
          {
            LOG.log(Level.INFO, "updateAllServers: contain " + serverName + " check heartbeat path -> " + ZKPaths.makePath(serverPath, docsHeartBeatZKNode));
            if (stat != null)
              setServerAvailable(topoName, serverName, true);
            else
              setServerAvailable(topoName, serverName, false);
          }
          else
          {
            LOG.log(Level.INFO, "updateAllServers: " + ((stat != null)?"active ":"deactive ") + serverName);
            if (stat != null)
              activeServer(topoName, serverName);
            else
              deactiveServer(topoName, serverName);
          }
          String statusPath = ZKPaths.makePath(serverPath, docsStatusZKNode);
          stat = client.checkExists().forPath(statusPath);
          if(stat != null)
          {
            String status = new String(client.getData().forPath(statusPath));
            setServerStatus(topoName, serverName, ServerStatus.enumValueOf(status));
          }
          String buildPath = ZKPaths.makePath(serverPath, docsBuildZKNode);
          stat = client.checkExists().forPath(buildPath);
          if (stat != null)
          {
            String buildNum = new String(client.getData().forPath(buildPath));
            setServerBuild(topoName, serverName, buildNum);
          }
        }
      }
    }
    
    if (serverNames.size() > 0)
    {
      LOG.log(Level.WARNING, "ZooKeeper: the server nodes have been deleted in zookeeper which is abnormal. " + serverNames.toString());
      Iterator<String> iter = serverNames.iterator();
      while(iter.hasNext())
      {
        String serverName = iter.next();
        setServerAvailable(null, serverName, false);
      }
    }
    
    String topoStatusPath = ZKPaths.makePath(docsZKPath, clusterMgr.getLocalTopologyName(), topoStatusZKNode);
    
    // set data center status
    // because there are at least 2 DMZ proxies in local data center
    // so we need get that status in zookeeper, if not found, then set it to active
    // if found, set its local status
    try
    {
//      String statusString = DataCenterStatus.ACTIVE.toString();
      Stat stat = client.checkExists().forPath(topoStatusPath);
      if (stat != null)
      {
        String statusString = new String(client.getData().forPath(topoStatusPath));
        DataCenterStatus status = DataCenterStatus.enumValueOf(statusString);
        if (status != null)
          this.setDataCenterStatus(clusterMgr.getLocalTopologyName(), status);
        // set data center status to ACTIVE when docsrp flip
//        else
//          client.setData().forPath(topoStatusPath, DataCenterStatus.ACTIVE.toString().getBytes());
      } else
      {
        client.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).forPath(topoStatusPath, DataCenterStatus.ACTIVE.toString().getBytes());
      }
      
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "ZooKeeper: Could not set topology status when zookeeper initalize", e);
    }
    
    checkDataCenterFlipped();
    clusterMgr.setZKInitialized(true);
    
    LOG.exiting(SmartCloudObserver.class.getName(), "updateAllServers");
  }
  
  private void checkDataCenterFlipped()
  {
    try
    {
      DataCenterIdentity localDC = clusterMgr.getDataCenterIdentity(clusterMgr.getLocalTopologyName(), false);
      if ( localDC.getPhase() == DataCenterPhase.FLIPPING)
      {
        boolean bFlipped = true;
        Map<String, MemberIdentity> members = localDC.getMembers();
        Iterator<String> mIter = members.keySet().iterator();
        while (mIter.hasNext())
        {
          String key = mIter.next();
          MemberIdentity m = members.get(key);
          if (m.getPhase() == ServerPhase.FLIPPED)
            continue;
          bFlipped = false;
          break;
        }
        if (bFlipped)
        {
          LOG.log(Level.INFO, "checkDataCenterFlipped: Set data center " + clusterMgr.getLocalTopologyName() + " to flipped phase due to all the members are flipped." + localDC);
          String topoPhasePath = ZKPaths.makePath(docsZKPath, clusterMgr.getLocalTopologyName(), topoPhaseZKNode);
          Stat stat = client.checkExists().forPath(topoPhasePath);
          if (stat != null)
          {
            client.setData().forPath(topoPhasePath, DataCenterPhase.FLIPPED.toString().getBytes());
          } else
          {
            client.create().creatingParentsIfNeeded().forPath(topoPhasePath, DataCenterPhase.FLIPPED.toString().getBytes());
          }
          setDataCenterPhase(clusterMgr.getLocalTopologyName(), DataCenterPhase.FLIPPED);
        }
      }
    } catch (Exception e)
    {
      LOG.log(Level.WARNING, "checkDataCenterFlipped: failed to check data center phase", e);
    }
  }
  
  private void setDataCenterConfig(String tn, JSONObject config)
  {
    DataCenterIdentity dc = clusterMgr.getDataCenterIdentity(tn, true);
    dc.setConfig(config);
  }
  
  private void setDataCenterPhase(String tn, DataCenterPhase phase)
  {
    DataCenterPhase oriPhase = clusterMgr.getDataCenterPhase(tn);
    if (oriPhase != phase)
    {
      clusterMgr.setDataCenterPhase(tn, phase);
      bTopologyChanged = true;
    }
  }
  
  private void setDataCenterStatus(final String tn, DataCenterStatus topoStatus)
  {
    DataCenterStatus oriStatus = clusterMgr.getDataCenterStatus(tn);
    if (topoStatus != oriStatus)
    {
      LOG.log(Level.INFO, "Update data center " + tn + " status from " + oriStatus + " to " + topoStatus);
      clusterMgr.setDataCenterStatus(tn, topoStatus);
      bTopologyChanged = true;

      if (topoStatus == DataCenterStatus.UPGRADING)
      {
        String mutexPath = ZKPaths.makePath(docsZKPath, tn, topoMutexZKNode);
        InterProcessMutex drainMutex = new InterProcessMutex(client, mutexPath);
        try
        {
          boolean acquired = drainMutex.acquire(10, TimeUnit.MILLISECONDS);
          if (!acquired)
            LOG.log(Level.INFO, "Have not require the data center upgrading/patching mutex, ignore the event and return directly.");
          else
          {
            LOG.log(Level.INFO, "Start to upgrading/patching data center " + tn + ", it will last less than " + UPGRADING_THRESHOLD + "ms");
            DataCenterStatus status = getDataCenterStatusInZK(tn);
            LOG.log(Level.INFO, "Data center " + tn + " status is " + status);
            if (status == DataCenterStatus.INACTIVE)
            {
              LOG.log(Level.INFO, "Do not need to upgrading data center" + tn + " due to its status is INACTIVE now");
              return;
            }
      
            executor.execute((new Runnable()
            {
              public void run()
              {
                try
                {
                  synchronized (upgradingLock)
                  {
                    upgradingLock.wait(UPGRADING_THRESHOLD);
                  }
                }
                catch (InterruptedException e)
                {
                  LOG.log(Level.WARNING, "upgradingLock is interrupted.", e);
                }

                try
                {
                  DataCenterStatus status = getDataCenterStatusInZK(tn);
                  LOG.log(Level.INFO, "Now Data center " + tn + " status is " + status);
                  //check each server status
                  String membersPath = ZKPaths.makePath(docsZKPath, tn, docsMembersZKNode);
                  boolean bAllInactive = true;
                  List<String> childrenPaths = client.getChildren().forPath(membersPath);
                  for (int i = 0; i < childrenPaths.size(); i++)
                  {
                    String serverShortName = childrenPaths.get(i);
                    if (!isInactiveMemberInZK(ZKPaths.makePath(membersPath, serverShortName)))
                    {
                      bAllInactive = false;
                      LOG.log(Level.INFO, serverShortName + " is still not inactive after time out");
                    }
                  }
                  
                  if (status == DataCenterStatus.UPGRADING)
                  {
                    String log = "Set data center " + tn + " status to inactive";
                    if (!bAllInactive)
                      log += ", even though some of the server still have not drained completely!";
                    LOG.log(Level.INFO, log);
                    LOG.log(
                        Level.INFO,
                        "Make sure that Docs server has been dropped off from GZ F5, then you can safely upgrading/patching this data center as no request come in.");
                    
                    client.setData().forPath(ZKPaths.makePath(docsZKPath, tn, topoStatusZKNode),
                      DataCenterStatus.INACTIVE.toString().getBytes());
                  } else if (status == DataCenterStatus.ACTIVE)
                  {
                    LOG.log(Level.WARNING, "In attempt to set data center " + tn
                        + " status to inactive, but now the data center status is " + status + ". Stop inactive data center!!");
                  }
                }
                catch (Exception e)
                {
                  LOG.log(Level.WARNING, "Failed to set data center " + tn + " to inactive status.", e);
                }
                // Do not notify nodejs here because the proxy server which acquire mutex to upgrading data center
                // might not be in the data center/side which need to be down
//                notifyNodeJS(NODEJS_INACTIVE_STATUS);
              }
            }));

            // start to upgrade member servers
            DataCenterIdentity dc = clusterMgr.getDataCenterIdentity(tn, false);
            UpgradingPolicy policy = dc.getUpgradingPolicy();
            if (policy == UpgradingPolicy.ONEBYONE)
              upgradingMembersOneByOne(tn);
            else
              upgradingAllMembers(tn);
          }
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "Exception while set data center status to upgrading.", e);
        } finally
        {
          try
          {
            if (drainMutex.isAcquiredInThisProcess())
              drainMutex.release();
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "Release mutex for upgrading data center failed", e);
          }
        }
      } 
    }

  }
  
  /**
   * NodeJS server is only used to report server status in SmartCloud environment
   * LTM will query the status from NodeJS from time to time
   * @param topoStatus 
   */
  // NOT TEST YET!!
  private void notifyNodeJS(String status)
  {
    LOG.log(Level.WARNING, "notifyNodeJS: start notify nodejs");
    HttpClient httpClient = new HttpClient(httpConnectionManager);
    GetMethod getMethod = new GetMethod(NODEJS_SET_URL + status);
    getMethod.getParams().setParameter(HttpMethodParams.SO_TIMEOUT, 5000);
    getMethod.getParams().setParameter(HttpMethodParams.RETRY_HANDLER, new DefaultHttpMethodRetryHandler());
    try
    {
      String statusKey = getNodeJSKey();
      getMethod.setRequestHeader("status-key", statusKey);
      int statusCode = httpClient.executeMethod(getMethod);
      if (statusCode == HttpStatus.SC_OK)
      {
        String text = getMethod.getResponseBodyAsString();
        LOG.log(Level.INFO, "notifyNodeJS: succeed with info " + text);
      } else 
      {
        String text = getMethod.getResponseBodyAsString();
        LOG.log(Level.WARNING, "notifyNodeJS: failed with status " + statusCode + " and info " + text);
      }
    }
    catch (HttpException e)
    {
      LOG.log(Level.WARNING, "notifyNodeJS: Failed to notify node.js with data center status " + status, e);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "notifyNodeJS: Failed to notify node.js with data center status " + status, e);
    }
    catch (NoSuchAlgorithmException e)
    {
      LOG.log(Level.WARNING, "notifyNodeJS: Failed to generate MD5 value.", e);
    }
    
  }
  
  private static String getNodeJSKey() throws UnknownHostException, NoSuchAlgorithmException, UnsupportedEncodingException
  {
    Calendar cal = Calendar.getInstance();
    int zoneoffset = cal.get(Calendar.ZONE_OFFSET);
    int dstoffset = cal.get(Calendar.DST_OFFSET);
    cal.add(Calendar.MILLISECOND, -(zoneoffset + dstoffset));
    int year = cal.get(Calendar.YEAR);
    int month = cal.get(Calendar.MONTH);
    int day = cal.get(Calendar.DAY_OF_MONTH);
    InetAddress ia = InetAddress.getLocalHost();
    String hostname = ia.getHostName();
    StringBuffer sb = new StringBuffer();
    sb.append(NODEJS_KEY_SEED);
    sb.append(hostname);
    sb.append(year).append(month).append(day);
    
    String key = generateMD5Id(sb.toString());
    return key;
  }
  
  private static String generateMD5Id(String eigenvalue) throws UnsupportedEncodingException, NoSuchAlgorithmException
  {
    return getHexString(MessageDigest.getInstance("MD5").digest(eigenvalue.getBytes()));
  }

  private static String getHexString(byte[] raw) throws UnsupportedEncodingException
  {
    byte[] HEX_CHAR_TABLE = { (byte) '0', (byte) '1', (byte) '2', (byte) '3', (byte) '4', (byte) '5', (byte) '6', (byte) '7', (byte) '8',
        (byte) '9', (byte) 'a', (byte) 'b', (byte) 'c', (byte) 'd', (byte) 'e', (byte) 'f' };

    byte[] hex = new byte[2 * raw.length];
    int index = 0;

    for (byte b : raw)
    {
      int v = b & 0xFF;
      hex[index++] = HEX_CHAR_TABLE[v >>> 4];
      hex[index++] = HEX_CHAR_TABLE[v & 0xF];
    }
    return new String(hex, "ASCII");
  }
  
  // inactive members at the same time
  private void upgradingAllMembers(final String tn)
  {
    LOG.log(Level.INFO, "Start upgradingAllMembers in " + tn);
    final String membersPath = ZKPaths.makePath(docsZKPath, tn, docsMembersZKNode);
    try
    {
      List<String> childrenPaths = client.getChildren().forPath(membersPath);
      for (int i = 0; i < childrenPaths.size(); i++)
      {
        String serverShortName = childrenPaths.get(i);
        if (isActiveMemberInZK(ZKPaths.makePath(membersPath, serverShortName)))
        {
          final String memberStatusPath = ZKPaths.makePath(membersPath, serverShortName, docsStatusZKNode);
          client.setData().forPath(memberStatusPath, ServerStatus.INACTIVATING.toString().getBytes());
          LOG.log(Level.INFO, "Set " + serverShortName + " to INACTIVATING status");
          NodeCache nodeCache = upgradingAllNodeCaches.get(memberStatusPath);
          if (nodeCache == null)
          {
            final NodeCache newNodeCache = new NodeCache(client, memberStatusPath, false);
            newNodeCache.start();
            newNodeCache.getListenable().addListener(new NodeCacheListener()
            {
              @Override
              public void nodeChanged() throws Exception
              {
                String value = new String(newNodeCache.getCurrentData().getData());
                ServerStatus status = ServerStatus.enumValueOf(value);

                if (status == ServerStatus.INACTIVE)
                {
                  LOG.log(Level.INFO, "upgradingAllMembers: " + memberStatusPath + " changed value:" + value);
                  newNodeCache.close();
                  upgradingAllNodeCaches.remove(memberStatusPath);
                }else if (status == null || status == ServerStatus.ACTIVE)
                {
                  LOG.log(Level.WARNING, "upgradingAllMembers: Should check server status or manually set server status to inactive with path " + memberStatusPath);
                }

                // check if all the members are in inactive state
                List<String> childrenPaths = client.getChildren().forPath(membersPath);
                for (int i = 0; i < childrenPaths.size(); i++)
                {
                  String serverShortName = childrenPaths.get(i);
                  if (!isInactiveMemberInZK(ZKPaths.makePath(membersPath, serverShortName)))
                    return;
                }
                synchronized(upgradingLock)
                {
                  upgradingLock.notifyAll();
                }
              }
            });
            upgradingAllNodeCaches.put(memberStatusPath, newNodeCache);
          }
        }
      }
      
      for (int i = 0; i < childrenPaths.size(); i++)
      {
        String serverShortName = childrenPaths.get(i);
        if (!isInactiveMemberInZK(ZKPaths.makePath(membersPath, serverShortName)))
          return;
      }
      
      Enumeration<NodeCache> nodeEnum = upgradingAllNodeCaches.elements();
      while(nodeEnum.hasMoreElements())
      {
        NodeCache nodeCache = nodeEnum.nextElement();
        nodeCache.close();
      }
      upgradingAllNodeCaches.clear();
      
      synchronized(upgradingLock)
      {
        upgradingLock.notifyAll();
      }
      
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "ZooKeeper: Could not inactive members in topology" + tn, e);
    }
  }
  
  // Upgrading members one by one in one DataCenter 
  private boolean upgradingMembersOneByOne(final String tn)
  {
    LOG.log(Level.INFO, "Start to upgradingMembersOneByOne in " + tn);
    final String membersPath = ZKPaths.makePath(docsZKPath, tn, docsMembersZKNode);
    try
    {
      List<String> childrenPaths = client.getChildren().forPath(membersPath);
      for (int i = 0; i < childrenPaths.size(); i++)
      {
        String serverShortName = childrenPaths.get(i);
        if (isActiveMemberInZK(ZKPaths.makePath(membersPath, serverShortName)))
        {
          final String memberStatusPath = ZKPaths.makePath(membersPath, serverShortName, docsStatusZKNode);
          client.setData().forPath(memberStatusPath, ServerStatus.INACTIVATING.toString().getBytes());
          LOG.log(Level.INFO, "Set " + serverShortName + " to INACTIVATING status");
          NodeCache nodeCache = upgradingOneByOneNodeCaches.get(memberStatusPath);
          if (nodeCache == null)
          {
            final NodeCache newNodeCache = new NodeCache(client, memberStatusPath, false);
            newNodeCache.start();
            newNodeCache.getListenable().addListener(new NodeCacheListener()
            {
              @Override
              public void nodeChanged() throws Exception
              {
                String value = new String(newNodeCache.getCurrentData().getData());
                ServerStatus status = ServerStatus.enumValueOf(value);
                LOG.log(Level.INFO, "upgradingMembersOneByOne: " + memberStatusPath + " changed value:" + value);
                if (status == ServerStatus.INACTIVE)
                {
                  newNodeCache.close();
                  upgradingOneByOneNodeCaches.remove(memberStatusPath);
                  
                  // set other members status to inactiviating
                  upgradingMembersOneByOne(tn);
                  
                }else if (status == null || status == ServerStatus.ACTIVE)
                {
                  LOG.log(Level.WARNING, "upgradingMembersOneByOne: Should check server status or manually set server status to inactive with path " + memberStatusPath);
                }
              }

            });
            upgradingOneByOneNodeCaches.put(memberStatusPath, newNodeCache);
          }
          
          return false;
        }
      }
      
      for (int i = 0; i < childrenPaths.size(); i++)
      {
        String serverShortName = childrenPaths.get(i);
        if (!this.isInactiveMemberInZK(ZKPaths.makePath(membersPath, serverShortName)))
        {
          return false;
        }
      }
      
      Enumeration<NodeCache> nodeEnum = upgradingOneByOneNodeCaches.elements();
      while(nodeEnum.hasMoreElements())
      {
        NodeCache nodeCache = nodeEnum.nextElement();
        nodeCache.close();
      }
      upgradingOneByOneNodeCaches.clear();
      
      synchronized(upgradingLock)
      {
        upgradingLock.notifyAll();
      }
      return true;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "ZooKeeper: Could not inactive members in topology " + tn, e);
    }

    
    return false;
  }
  

  private DataCenterStatus getDataCenterStatusInZK(String tn) throws Exception
  {
    String dataCenterStatusPath = ZKPaths.makePath(docsZKPath, tn, topoStatusZKNode);
    DataCenterStatus status = null;
    Stat stat = client.checkExists().forPath(dataCenterStatusPath);
    if (stat != null)
    {
      String value = new String(client.getData().forPath(dataCenterStatusPath));
      status = DataCenterStatus.enumValueOf(value);
    }
    LOG.log(Level.INFO, "getDataCenterStatusInZK : " + tn + "->" + status);
    return status;
  }
  
  private boolean isActiveMemberInZK(String memberPath) throws Exception
  {
    String serverShortName = ZKPaths.getNodeFromPath(memberPath); 
    String memberHeartBeatPath = ZKPaths.makePath(memberPath, docsHeartBeatZKNode);
    Stat stat = client.checkExists().forPath(memberHeartBeatPath);
    
    if (stat == null)
    {
      LOG.log(Level.INFO, "isActiveMember: " + serverShortName + " is not live anymore.");
      return false;
    }
    String memberStatusPath = ZKPaths.makePath(memberPath, docsStatusZKNode);
    stat = client.checkExists().forPath(memberStatusPath);
    if (stat != null)
    {
      String value = new String(client.getData().forPath(memberStatusPath));
      ServerStatus status = ServerStatus.enumValueOf(value);
      LOG.log(Level.INFO, "isActiveMember: " + serverShortName + " status is " + status);
      if (status == ServerStatus.ACTIVE)
        return true;
    } else 
    {
      LOG.log(Level.WARNING, "isActiveMember: Can not find node " + memberStatusPath);
    }
    return false;
  }

  
//  private boolean isInactiveMember(String tn, String serverShortName)
//  {
//    MemberIdentity m = clusterMgr.getMemberIdentity(tn, serverShortName, false);
//    if (m == null || !m.isAvailable())
//      return true;
//    if (m.getStatus() == ServerStatus.INACTIVE)
//      return true;
//    return false;
//  }
  
  private boolean isInactiveMemberInZK(String memberPath) throws Exception
  {
    String serverShortName = ZKPaths.getNodeFromPath(memberPath); 
    String memberHeartBeatPath = ZKPaths.makePath(memberPath, docsHeartBeatZKNode);
    Stat stat = client.checkExists().forPath(memberHeartBeatPath);
    if (stat == null)
    {
      LOG.log(Level.INFO, "isInactiveMember: " + serverShortName + " is not live anymore.");
      return true;
    }
    String memberStatusPath = ZKPaths.makePath(memberPath, docsStatusZKNode);
    stat = client.checkExists().forPath(memberStatusPath);
    if (stat != null)
    {
      String value = new String(client.getData().forPath(memberStatusPath));
      ServerStatus status = ServerStatus.enumValueOf(value);
      LOG.log(Level.INFO, "isInactiveMember: " + serverShortName + " status is " + status);
      if (status == ServerStatus.INACTIVE)
        return true;
    } else 
    {
      LOG.log(Level.WARNING, "isInactiveMember: Can not find node " + memberStatusPath);
    }
    return false;
  }
  
  private void setServerPhase(String tn, String serverShortName, ServerPhase phase)
  {
    ServerPhase oriPhase = clusterMgr.getServerPhase(tn, serverShortName);
    
    if(phase != oriPhase)
    {
      clusterMgr.setServerPhase(tn, serverShortName, phase);
    }
  }
  
  private void setServerStatus(String tn, String serverShortName, ServerStatus status)
  {
    ServerStatus oriStatus = clusterMgr.getServerStatus(tn, serverShortName);
    
    if(status != oriStatus) {
      if (status == ServerStatus.ACTIVE)
      {
        activeServer(tn, serverShortName);
      } else if(status == ServerStatus.INACTIVE)
      {
        deactiveServer(tn, serverShortName);
      }
      clusterMgr.setServerStatus(tn, serverShortName, status);
      bTopologyChanged = true;
    }
  }
  
  private void setServerBuild(String tn, String serverShortName, String buildTimeStamp)
  {
    clusterMgr.setServerBuild(tn, serverShortName, buildTimeStamp);
  }
  
  private void setServerHostName(String tn, String serverShortName, String hostName)
  {
    clusterMgr.setServerHostName(tn, serverShortName, hostName);
  }

  private void setServerFullName(String tn, String serverShortName, String hostName)
  {
    clusterMgr.setServerFullName(tn, serverShortName, hostName);
  }
  
  private void setServerAvailable(String tn, String serverShortName, boolean bAvailable)
  {
    boolean bChanged = clusterMgr.setServerAvailable(tn, serverShortName, bAvailable);
    bTopologyChanged |= bChanged;
  }
  
  private void activeServer(String tn, String serverShortName)
  {
    mergeTargetTree(tn, serverShortName);
    try
    {
      registerDNS(tn, serverShortName);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Zookeeper: failed to get path " + topologyZKPath + " when register DNS", e);
    }
    String heartbeatPath = ZKPaths.makePath(docsZKPath, tn, docsMembersZKNode, serverShortName, docsHeartBeatZKNode);
    
    try
    {
      Stat stat = client.checkExists().forPath(heartbeatPath);
      if (stat != null)
        setServerAvailable(tn, serverShortName, true);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "ZooKeeper: exception happens when check heartbeat node", e);
    }
    if (clusterMgr.isDocsMultiActive())
    {
      MemberIdentity member = clusterMgr.getMemberIdentity(tn, serverShortName, false);
      StaticClusterMgr.setEndPointAvailable(member.getServerFullName(), true);
    }
  }

  // do not need to register dns for docs when in the same data center
  private void registerDNS(String tn, String serverShortName) throws Exception
  {
    MemberIdentity member = clusterMgr.getMemberIdentity(tn, serverShortName, false);
    String hostName = member.getHostName();
         
    String nodePath = topologyZKPath;
    if (isZKServerSide0)
      nodePath = "/" + tn + topologyZKPath;
    LOG.log(Level.FINE, "topology zookeeper path is " + nodePath);
    List<String> seqNodes = client.getChildren().forPath(nodePath);
    for (int i = 0; i <  seqNodes.size(); i++)
    {
      String seq = seqNodes.get(i);
      String seqFullPath = ZKPaths.makePath(nodePath, seq);
      String hostNamePath = ZKPaths.makePath(seqFullPath, "hostname");
      Stat stat = client.checkExists().forPath(hostNamePath);
      if (stat != null)
      {
        String seqHostName = new String(client.getData().forPath(hostNamePath));
        if (seqHostName.equals(hostName))
        {
          String ip = new String(client.getData().forPath(ZKPaths.makePath(seqFullPath, "front_end")));
          LOG.log(Level.INFO, "registerDNS: add name entry " + hostName + " <-> " + ip);
          //TODO: Deployment should be changed if enable dynamic DNS
          //put com.ibm.docs.dns.jar in to was/java/lib/ext and change the jvm start up parameters
//          SmartCloudDNSService.addHostAddrEntry(ip, hostName);
          break;
        }
      }
    }
  }
  
  private void unregisterDNS(String tn, String serverShortName)
  {
//    MemberIdentity member = clusterMgr.getMemberIdentity(tn, serverShortName, false);
//    String hostName = member.getHostName();
//    SmartCloudDNSService.removeHostAddrByHostName(hostName);
  }
  
  // merge server with hostName to proxy's topology target tree
  // then export to proxy's targettree.xml under staticRoots folder
  private void mergeTargetTree(String tn, String serverShortName)
  {
    if (!clusterMgr.isDocsMultiActive())
      return;
    ByteArrayInputStream is = null;
    ByteArrayOutputStream os = null;
    InputStream decodeInputStream = null;
    MemberIdentity member = clusterMgr.getMemberIdentity(tn, serverShortName, false);
    String hostName = member.getHostName();
    if (hostName == null)
    {
      LOG.log(Level.WARNING, "mergeTargetTree: failed to merge target tree for server with topologyName:" + tn + " ; name:" + serverShortName + ", because its hostname is null");
      return;
    }
    
    LOG.log(Level.INFO, "mergeTargetTree: " + tn + ":" + serverShortName + " with hostname " + hostName);
    
    boolean isServerExists = false;
    Map<String, String> descMap = ConcordRequestParser.getDescMapFromFullName(member.getServerFullName());
    if (descMap != null) {
      String cellName = (String)descMap.get("CELLNAME");
      String nodeName = (String)descMap.get("NODENAME");
      String serverName = (String)descMap.get("MEMBERNAME");
      isServerExists = StaticClusterMgr.isServerExists(cellName, nodeName, serverName);
    }
    try
    {
      if (isServerExists) {
        LOG.log(Level.INFO, "mergeTargetTree: Do not need merge target tree because " + tn + ":" + serverShortName + " is already in proxy's target trees");
      } else 
      {
        long start = System.currentTimeMillis();
        boolean bFound = false;
        String nodePath = targetTreeZKPath;
        if (isZKServerSide0)
          nodePath = "/" + tn + targetTreeZKPath;
        LOG.log(Level.FINE, "Target tree zookeeper path is " + nodePath);
        List<String> seqNodes = client.getChildren().forPath(nodePath);
        for(int i = 0; i < seqNodes.size(); i++)
        {
          String seq = seqNodes.get(i);
          String hostNamePath = ZKPaths.makePath(nodePath, seq, "hostname");
          Stat stat = client.checkExists().forPath(hostNamePath);
          if (stat != null)
          {
            String name = new String(client.getData().forPath(hostNamePath));
            if (hostName.equals(name)) 
            {
              bFound = true;
              String path = ZKPaths.makePath(nodePath, seq);
              byte[] data = client.getData().forPath(path);
              is = new ByteArrayInputStream(data);
              os = new ByteArrayOutputStream(); 
              BASE64Decoder decoder = new BASE64Decoder();
              decoder.decodeBuffer(is, os);
              decodeInputStream = new ByteArrayInputStream(os.toByteArray());
              StaticClusterMgr mgr = ConcordFilterDeployer.getStaticClusterMgrInstance();
              LOG.log(Level.INFO, "mergeTargetTree: Start merge target tree from " + path + " with hostname " + name);
              mgr.mergeToTargetTree(decodeInputStream);
              StaticClusterMgr.addServerInfo((String)descMap.get("CELLNAME"), (String)descMap.get("NODENAME"), (String)descMap.get("MEMBERNAME"));
              LOG.log(Level.INFO, "Spend " + (System.currentTimeMillis() - start) + " miliseconds to merge target tree for " + tn + ":" + serverShortName);
              break;
            }
          }
        }
        if (!bFound)
          LOG.log(Level.WARNING, "mergeTargetTree: Can not find the target_tree.xml in path " + nodePath + " for " + hostName);
        
        
        // enable here only if docs set target tree with path /data/docs/target_tree/hostname
        // rather than sequential number
//        List<String> seqNodes = client.getChildren().forPath(topologyZKPath);
//        for (int i = 0; i <  seqNodes.size(); i++)
//        {
//          String seq = seqNodes.get(i);
//          String seqFullPath = ZKPaths.makePath(topologyZKPath, seq);
//          String hostNamePath = ZKPaths.makePath(seqFullPath, "hostname");
//          Stat stat = client.checkExists().forPath(hostNamePath);
//          if (stat != null)
//          {
//            String seqHostName = new String(client.getData().forPath(hostNamePath));
//            if (seqHostName.equals(hostName))
//            {
//              String path = ZKPaths.makePath(targetTreeZKPath, hostName);
//              byte[] data = client.getData().forPath(path);
//              is = new ByteArrayInputStream(data);
//              os = new ByteArrayOutputStream(); 
//              BASE64Decoder decoder = new BASE64Decoder();
//              decoder.decodeBuffer(is, os);
//              decodeInputStream = new ByteArrayInputStream(os.toByteArray());
//              StaticClusterMgr mgr = ConcordFilterDeployer.getStaticClusterMgrInstance();
//              LOG.log(Level.INFO, "mergeTargetTree: Start merge target tree from " + path + " with hostname " + hostName);
//              mgr.mergeToTargetTree(decodeInputStream);
//              break;
//            }
//          }
//        }
      }
      
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "ZooKeeper: Could not get targettree.xml of " + hostName + " which just startup", e);
    }
    finally
    {
      IOUtils.closeQuietly(is);
      IOUtils.closeQuietly(os);
      IOUtils.closeQuietly(decodeInputStream);
    }
    
  }

  private void deactiveServer(String tn, String serverShortName)
  {
//    setServerAvailable(tn, serverShortName, false);
    unregisterDNS(tn, serverShortName);
    MemberIdentity member = clusterMgr.getMemberIdentity(tn, serverShortName, false);
    StaticClusterMgr.setEndPointAvailable(member.getServerFullName(), false);
  }
  
  public boolean isTopologyChanged()
  {
    return bTopologyChanged;
  }
  
  public void setTopologyChanged(boolean bChange)
  {
    bTopologyChanged = bChange;
  }

  @Override
  public void notify(Identity paramIdentity, String type, Object data)
  {
    //TODO£º can not listen to ENDPOINT_AVAILABLE_NAME event
    LOG.log(Level.INFO, "recieve event " + type);
    if (ENDPOINT_AVAILABLE_NAME.equalsIgnoreCase(type))
    {
      EndPoint endPoint = (EndPoint) data;
      boolean isAvailable = endPoint.isAvailable();
      Identity identity = endPoint.getIdentity();
      Map map = identity.getProperties();
      //TODO: get server name and setAvailable here
    }
  }

//  public static void main(String[] argvs)
//  {
//    HttpClient httpClient = new HttpClient();
////    GetMethod getMethod = new GetMethod(NODEJS_GET_URL);
////    getMethod.getParams().setParameter(HttpMethodParams.SO_TIMEOUT, 5000);
////    getMethod.getParams().setParameter(HttpMethodParams.RETRY_HANDLER, new DefaultHttpMethodRetryHandler());
////    
////    PostMethod postMethod = new PostMethod(NODEJS_SET_URL + "Active");
////    postMethod.getParams().setParameter(HttpMethodParams.SO_TIMEOUT, 5000);
////    postMethod.getParams().setParameter(HttpMethodParams.RETRY_HANDLER, new DefaultHttpMethodRetryHandler());
////    try
////    {
////      int statusCode = httpClient.executeMethod(getMethod);
////      if (statusCode == HttpStatus.SC_OK)
////      {
////        InputStream is = new AutoCloseInputStream(getMethod.getResponseBodyAsStream());
////        if (is != null)
////        {
////          String text = IOUtils.toString(is);
////          System.out.println(text);
////        }
////        
////      }
////      //TODO: set header
////      statusCode = httpClient.executeMethod(postMethod);
////      if (statusCode == HttpStatus.SC_OK)
////      {
////        //TODO:
////      }
////    }
////    catch (HttpException e)
////    {
////      // TODO Auto-generated catch block
////      e.printStackTrace();
////    }
////    catch (IOException e)
////    {
////      // TODO Auto-generated catch block
////      e.printStackTrace();
////    }
//    GetMethod getMethod = new GetMethod(NODEJS_SET_URL + "Inactive");
//    getMethod.getParams().setParameter(HttpMethodParams.SO_TIMEOUT, 5000);
//    getMethod.getParams().setParameter(HttpMethodParams.RETRY_HANDLER, new DefaultHttpMethodRetryHandler());
//    try
//    {
//      String statusKey = getNodeJSKey();
//      getMethod.setRequestHeader("status-key", statusKey);
//      int statusCode = httpClient.executeMethod(getMethod);
//      if (statusCode == HttpStatus.SC_OK)
//      {
//        String text = getMethod.getResponseBodyAsString();
//        System.out.println(text);
//      }
//    }
//    catch (HttpException e)
//    {
//      LOG.log(Level.WARNING, "notifyNodeJS: Failed to notify node.js with data center status ", e);
//    }
//    catch (IOException e)
//    {
//      LOG.log(Level.WARNING, "notifyNodeJS: Failed to notify node.js with data center status ", e);
//    }
//    catch (NoSuchAlgorithmException e)
//    {
//      LOG.log(Level.WARNING, "notifyNodeJS: Failed to generate MD5 value.", e);
//    }
//  }
}
