package com.ibm.concord.services.servlet;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.cache.ChildData;
import org.apache.curator.framework.recipes.cache.TreeCache;
import org.apache.curator.framework.recipes.cache.TreeCacheEvent;
import org.apache.curator.framework.recipes.cache.TreeCacheListener;
import org.apache.curator.framework.recipes.cache.TreeCacheEvent.Type;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.framework.state.ConnectionStateListener;
import org.apache.curator.retry.RetryNTimes;
import org.apache.curator.utils.CloseableUtils;
import org.apache.curator.utils.ZKPaths;
import org.apache.zookeeper.CreateMode;
import org.apache.zookeeper.data.Stat;

import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.json.java.JSONObject;
import com.ibm.lotusLive.registry.DecryptException;
import com.ibm.lotusLive.registry.RegistryParser;
import com.ibm.lotusLive.registry.SettingNotFoundException;
import com.ibm.websphere.asynchbeans.WorkException;
import com.ibm.websphere.runtime.ServerName;
import com.ibm.zookeeper.client.ZooKeeperClient;

public class SmartCloudInitializer
{
  private static final Logger LOG = Logger.getLogger(SmartCloudInitializer.class.getName());

  // ZooKeeper Client settings
  private static String docsZKPath = "/data/docs/data";

  private static final String topoConfigZKNode = "config";

  private static final String topoStatusZKNode = "status";

  private static final String topoPhaseZKNode = "phase";

  private static final String docsMembersZKNode = "members";

  private static final String docsHeartBeatZKNode = "heartbeat";

  private static final String docsStatusZKNode = "status";

  private static final String docsPhaseZKNode = "phase";

  private static final String docsBuildZKNode = "build-timestamp";

  private static final String docsHostNameZKNode = "hostname";

  private static final String docsFullNameZKNode = "fullname";

  private static final int docsZKPathLength = ZKPaths.split(docsZKPath).size() + 1; // plus 1 for topology name level

  private static String connectionString;// = "9.112.251.91:2181";//9.115.208.65(docsnext)

  // zookeeper client in SmartCloud env for heart beat and multi-active
  private CuratorFramework client;

  // Topology that current docs server locate in
  private String topologyName;

  private String baseTopologyName;

  // Server Status of current docs server
  private static ServerStatus serverStatus = ServerStatus.ACTIVE;

  private RegistryParser registryParser;

  private boolean isDocsMA = false;

  private HashMap<String, String> serverNameMap = new HashMap<String, String>();

  private RoutingPolicy routingPolicyValue = RoutingPolicy.STATIC;

  private boolean bZookeeperConnected = false;

  private String shortHostName;

  private SmartCloudManagement mgr = null;

  /*
   * In Multi-Data center env 1) We can set the whole data center to be down for maintainence 1.1) config data center upgrading policy
   * <b>upgradingPolicy</b>: 0 -> upgrading members in this data center one by one 1 -> upgrading all the members at the same time
   * <b>draftChangeLevel</b>: means the draft format or message of different file type has been changed, the value is a 3 bit binary Text ->
   * 001 Presentation -> 010 Spreadsheet -> 100 For example, the following policy means that we should upgrade all the members at the same
   * time, and the format of all the file type have changed. create /${baseTopologyName}/data/docs/data/Jupiter/config {"upgradingPolicy":0,
   * "draftChangeLevel":7} 1.2) set data center status to upgrading with path set /${baseTopologyName}/data/docs/data/${TopologyName}/status
   * upgrading 2) Or only set one specified server to be down set
   * /${baseTopologyName}/data/docs/data/${TopologyName}/members/${serverShortName}/status inactivating serverShortName should be like
   * pattern docs1a
   */
  private static JSONObject dataCenterConfig;

  private static String DRAFT_CHANGE_LEVEL = "draftChangeLevel";

  private static String UPGRADING_POLICY = "upgradingPolicy";

  private static UpgradingPolicy upgradingPolicy = UpgradingPolicy.ONEBYONE;

  private static int draftChangeLevel = 0;

  public static final int DRAFT_CHANGE_TEXT_MASK = 1;

  public static final int DRAFT_CHANGE_PRES_MASK = 2;

  public static final int DRAFT_CHANGE_SHEET_MASK = 4;

  public enum ServerStatus {
    ACTIVE("active"), INACTIVATING("inactivating"), INACTIVE("inactive");

    private String status;

    ServerStatus(String st)
    {
      status = st;
    }

    public String toString()
    {
      return status;
    }

    public static ServerStatus enumValueOf(String value)
    {

      if (ACTIVE.toString().equals(value))
        return ACTIVE;
      else if (INACTIVATING.toString().equals(value))
        return INACTIVATING;
      else if (INACTIVE.toString().equals(value))
        return INACTIVE;
      return null;
    }
  }

  public enum UpgradingPolicy {
    ONEBYONE, ALL
  }

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

  public enum DataCenterStatus {
    // Data Center can provide service as normal
    ACTIVE("active"),
    // Data Center prepared to refresh build for all the members,
    // so we need select servers from other data centers to provide service
    UPGRADING("upgrading"),
    // Data Center can not provide any service
    INACTIVE("inactive");

    private String status;

    DataCenterStatus(String st)
    {
      status = st;
    }

    public String toString()
    {
      return status;
    }

    public static DataCenterStatus enumValueOf(String value)
    {

      if (ACTIVE.toString().equals(value))
        return ACTIVE;
      else if (UPGRADING.toString().equals(value))
        return UPGRADING;
      else if (INACTIVE.toString().equals(value))
        return INACTIVE;
      LOG.log(Level.WARNING, "DataCenterStatus: can not recognize " + value);
      return null;
    }
  }

  public enum DataCenterPhase {
    // Set when side/data center is redeploying
    REDEPLOY("redeploy"),
    // Set when side/data center is flipping
    FLIPPING("flipping"),
    // Set when side/data center is flipped
    FLIPPED("flipped");

    private String phase;

    DataCenterPhase(String p)
    {
      phase = p;
    }

    public String toString()
    {
      return phase;
    }

    public static DataCenterPhase enumValueOf(String value)
    {

      if (REDEPLOY.toString().equals(value))
        return REDEPLOY;
      else if (FLIPPING.toString().equals(value))
        return FLIPPING;
      else if (FLIPPED.toString().equals(value))
        return FLIPPED;
      LOG.log(Level.WARNING, "DataCenterPhase: can not recognize " + value);
      return null;
    }
  }

  public enum ServerPhase {
 // Set when side/data center is redeploying
    REDEPLOY("redeploy"),
    // Set when side/data center is flipped
    FLIPPED("flipped");
    
    private String phase;
    
    ServerPhase(String p) {
      phase  = p;
    }
    
    public String toString() {
      return phase;
    }
    
    public static ServerPhase enumValueOf(String value) {
      
      if (REDEPLOY.toString().equals(value))
        return REDEPLOY;
      else if(FLIPPED.toString().equals(value))
        return FLIPPED;
      LOG.log(Level.WARNING, "ServerPhase: can not recognize " + value);
      return null;
    }
  }
  
  public SmartCloudInitializer()
  {
    registryParser = new RegistryParser();
    try
    {
      String maSetting = registryParser.getSetting("Docs", "is_docs_multiactive");
      isDocsMA = (maSetting != null) && Boolean.parseBoolean(maSetting);
      LOG.log(Level.INFO, "Docs Multi-Active is " + isDocsMA);
      routingPolicyValue = RoutingPolicy.enumValueOf(registryParser.getSetting("Docs", "docsrp_routing_policy"));
      LOG.log(Level.INFO, "Docs Routing Policy is " + routingPolicyValue);
    }
    catch (SettingNotFoundException e)
    {
      LOG.log(Level.WARNING, "Could not read settings from registry parser", e);
    }
    catch (DecryptException e)
    {
      LOG.log(Level.WARNING, "DecryptException when get settings from registry parser", e);
    }
  }

  public boolean isZookeeperEnabled()
  {
    return (isDocsMA || (routingPolicyValue == RoutingPolicy.DYNAMIC));
  }

  public boolean isDocsMA()
  {
    return isDocsMA;
  }

  public boolean isZookeeperConnected()
  {
    return bZookeeperConnected;
  }

  public boolean initZookeeperClient() throws Exception
  {
    try
    {
      topologyName = registryParser.getTopologyName();
      baseTopologyName = registryParser.getBaseTopologyName();
      connectionString = ZooKeeperClient.getConnectString(registryParser, null);
      LOG.log(Level.INFO, "Zookeeper: Read settings from registry.xml with topology name \'" + topologyName + "' base topology name \'"
          + baseTopologyName + "' and ZooKeeper connection string " + connectionString);
    }
    catch (SettingNotFoundException e1)
    {
      LOG.log(Level.WARNING, "Zookeeper: Could not settings of ZooKeeper connection string from registry parser", e1);
    }

    if (connectionString == null)
    {
      LOG.log(Level.SEVERE, "Zookeeper: Could not get ZooKeeper connection string");
      return false;
    }
    String hostName = InetAddress.getLocalHost().getHostName();
    if (hostName == null)
    {
      LOG.log(Level.WARNING, "Zookeeper: Could not get docs server's host name");
      return false;
    }

    String[] names = hostName.split("\\.");
    shortHostName = names[0];
    LOG.log(Level.INFO, "server short name is " + shortHostName);
    
    if (topologyName == null)
    {
      if (names.length > 1)
        topologyName = hostName.substring(names[0].length() + 1);
    }

    mgr = new SmartCloudManagement(topologyName);

    LOG.log(Level.INFO, "Zookeeper: The current docs server network info: Topology -> " + topologyName + " ; " + "HostName -> " + hostName);
    docsZKPath = "/" + baseTopologyName + docsZKPath;

    String path = ZKPaths.makePath(docsZKPath, topologyName, docsMembersZKNode, shortHostName);
    final String hbPath = ZKPaths.makePath(path, docsHeartBeatZKNode);
    LOG.log(Level.INFO, "Zookeeper: Connecting " + connectionString + " and observe at path " + docsZKPath);
    client = CuratorFrameworkFactory.newClient(connectionString, 20 * 1000, 2 * 1000, new RetryNTimes(3, 2000));
    client.start();
    client.getConnectionStateListenable().addListener(new ConnectionStateListener()
    {
      @Override
      public void stateChanged(CuratorFramework client, ConnectionState newState)
      {
        LOG.info("ZooKeeper: client state Changed to " + newState.toString());
        switch (newState)
          {
            case LOST :
            {
              bZookeeperConnected = false;
              while (true)
              {
                try
                {
                  if (client.getZookeeperClient().blockUntilConnectedOrTimedOut())
                  {
                    LOG.info("ZooKeeper: Try to set heartbeat node when reconnected");
                    Stat stat = client.checkExists().forPath(hbPath);
                    if (stat == null)
                      client.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).forPath(hbPath, "true".getBytes());
                    else
                      client.setData().forPath(hbPath, "true".getBytes());
                    break;
                  }
                }
                catch (InterruptedException e)
                {
                  LOG.log(Level.WARNING, "ZooKeeper: InterruptedException happens when client wait for connecting to zookeeper", e);
                }
                catch (Exception e)
                {
                  LOG.log(Level.WARNING, "ZooKeeper: Exception happens when client wait for connecting to zookeeper", e);
                }
              }
              break;
            }
            case SUSPENDED :
            {
              bZookeeperConnected = false;
              break;
            }
            case RECONNECTED :
            case CONNECTED :
            {
              bZookeeperConnected = true;
              break;
            }
            default:
              break;
          }
      }
    });

    // Listening znode status of docs server
    TreeCache treeCache = new TreeCache(client, docsZKPath);
    treeCache.getListenable().addListener(new TreeCacheListener()
    {
      @Override
      public void childEvent(CuratorFramework client, TreeCacheEvent event) throws Exception
      {
        Type type = event.getType();
        LOG.log(Level.INFO, "ZooKeeper: tree changed with event:" + type);

        ChildData data = event.getData();
        if (data != null)
        {
          String dataPath = data.getPath();
          String lastNode = ZKPaths.getNodeFromPath(dataPath);
          String nodeValue = (data.getData() == null) ? null : new String(data.getData());
          LOG.log(Level.INFO, "ZooKeeper: " + type + " in " + dataPath + " with data " + nodeValue);
          List<String> nodeList = ZKPaths.split(dataPath);
          int length = nodeList.size();
          if ((length - docsZKPathLength) == 4)
          {
            String serverShortName = nodeList.get(docsZKPathLength + 2);
            String serverTopoName = nodeList.get(docsZKPathLength);
            LOG.log(Level.FINEST, "event with topo " + serverTopoName + " and server short name " + serverShortName);

            boolean isSelf = (serverTopoName != null && serverTopoName.equals(topologyName) && serverShortName != null && serverShortName
                .equals(shortHostName));
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
                  mgr.setServerAvailable(serverTopoName, serverShortName, bAvailable);
                  if (isSelf)
                  {
                    LOG.log(Level.INFO, "hearbeat node has been deleted, try to set it to true with path " + dataPath);
                    client.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).forPath(hbPath, "true".getBytes());
                  }
                  return;
                }
              }
              else
              {
                // znode has been created or updated
                if (docsHeartBeatZKNode.equals(lastNode))
                {
                  mgr.setServerAvailable(serverTopoName, serverShortName, true);
                  if (isSelf)
                  {
                    if (!"true".equalsIgnoreCase(nodeValue))
                      client.setData().forPath(hbPath, "true".getBytes());
                  }
                  return;
                }
                if (docsStatusZKNode.equals(lastNode))
                {
                  ServerStatus status = ServerStatus.enumValueOf(nodeValue);
                  if (isSelf)
                  {
                    checkServerStatus(serverTopoName, serverShortName, dataPath, status);
                  }
                  mgr.setServerStatus(serverTopoName, serverShortName, status);
                  return;
                }
                if (docsPhaseZKNode.equals(lastNode))
                {
                  ServerPhase phase = ServerPhase.enumValueOf(nodeValue);
                  mgr.setServerPhase(serverTopoName, serverShortName, phase);
                  return;
                }
                if (docsBuildZKNode.equals(lastNode))
                {
                  mgr.setServerBuild(serverTopoName, serverShortName, nodeValue);
                  return;
                }
                if (docsHostNameZKNode.equals(lastNode))
                {
                  mgr.setServerHostName(serverTopoName, serverShortName, nodeValue);
                  return;
                }
                if (docsFullNameZKNode.equals(lastNode))
                {
                  String serverFullName = nodeValue;
                  String parentPath = ZKPaths.getPathAndNode(dataPath).getPath();
                  LOG.log(Level.FINEST, "serverNameMap add key " + serverFullName + " with value " + parentPath);
                  serverNameMap.put(serverFullName, parentPath);

                  mgr.setServerFullName(serverTopoName, serverShortName, nodeValue);
                  return;
                }
              }
            }
          }
          else if ((length - docsZKPathLength) == 2)
          {
            // topology path
            // dataPath should be in Pattern ${docsZKPath}/${topologyName}/*
            if (topoStatusZKNode.equals(lastNode) || topoPhaseZKNode.equals(lastNode) || topoConfigZKNode.equals(lastNode))
            {
              String tn = nodeList.get(docsZKPathLength);
              if (data.getData() == null)
              {
                if (topoStatusZKNode.equals(lastNode))
                {
                  if (type != Type.NODE_REMOVED)
                    mgr.setDataCenterStatus(tn, null);

                }
              } else
              {
                if (topoStatusZKNode.equals(lastNode))
                {
                  mgr.setDataCenterStatus(tn, DataCenterStatus.enumValueOf(nodeValue));

                }
                else if (topoPhaseZKNode.equals(lastNode))
                {
                  mgr.setDataCenterPhase(tn, DataCenterPhase.enumValueOf(nodeValue));
                }
                else if (topoConfigZKNode.equals(lastNode))
                {
                  try
                  {
                    if (tn.equals(topologyName))
                    {
                      JSONObject config = JSONObject.parse(nodeValue);
                      setDataCenterConfig(config);
                    }
                  }
                  catch (IOException e)
                  {
                    LOG.log(Level.WARNING, "ZooKeeper: Data Center config setting is not right : " + nodeValue, e);
                  }
                }
              }
            }
          }

        }
      }
    });
    treeCache.start();

    // ephemeral node for heartbeat
    // if the node does not exist means that server is not available
    // due to network issue or server is down
    Stat stat = client.checkExists().forPath(hbPath);
    if (stat == null)
      client.create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).forPath(hbPath, "true".getBytes());

    // persistent node for hostname
    String hnPath = ZKPaths.makePath(path, docsHostNameZKNode);
    stat = client.checkExists().forPath(hnPath);
    if (stat == null)
      client.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath(hnPath, hostName.getBytes());
    else
      client.setData().forPath(hnPath, hostName.getBytes());

    // persistent node for server full name
    String fullName = ServerName.getFullName();
    String fnPath = ZKPaths.makePath(path, docsFullNameZKNode);
    stat = client.checkExists().forPath(fnPath);
    if (stat == null)
      client.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath(fnPath, fullName.getBytes());
    else
      client.setData().forPath(fnPath, fullName.getBytes());

    // persistent node for build number
    String btPath = ZKPaths.makePath(path, docsBuildZKNode);
    stat = client.checkExists().forPath(btPath);
    if (stat == null)
      client.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath(btPath, ConcordUtil.getBuildNumber().getBytes());
    else
      client.setData().forPath(btPath, ConcordUtil.getBuildNumber().getBytes());

    // persistent node for status: active, inactivating, inactive
    String stPath = ZKPaths.makePath(path, docsStatusZKNode);
    stat = client.checkExists().forPath(stPath);
    if (stat == null)
      client.create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath(stPath, ServerStatus.ACTIVE.toString().getBytes());
    else
      client.setData().forPath(stPath, ServerStatus.ACTIVE.toString().getBytes());

    return true;
  }

  public void closeZookeeperClient()
  {
    CloseableUtils.closeQuietly(client);
  }

  private void checkServerStatus(String tn, String shortName, String statusPath, ServerStatus status) throws WorkException,
      IllegalArgumentException
  {
    try
    {
      LOG.log(Level.INFO, tn + ":" + shortName + " is now in " + status + " status.");
      ServerStatus oriStatus = getServerStatus();
      if (oriStatus == status)
        return;
      setServerStatus(status);
      if (status == ServerStatus.INACTIVATING)
      {
        ServerInactivatingWork work = new ServerInactivatingWork(statusPath);
        Platform.getWorkManager().startWork(work);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "checkServerStatus for " + tn + ":" + shortName + "with status " + status + " encountered error", e);
    }
  }

  public boolean isServerAvailable(String serverFullName)
  {
    boolean isAvailable = false;
    MemberIdentity member = mgr.getMemberIdentityByFullName(null, serverFullName, false);
    if (member != null)
    {
      LOG.log(Level.INFO, "isServerAvailable: {0} - {1} ", new String[] { serverFullName, member.toString() });
      if (member.isAvailable() && (member.getStatus() == ServerStatus.ACTIVE))
      {
        // check the side status of this server
        if (member.isLocalMember())
        {
          if (!bZookeeperConnected)
          {
            LOG.log(Level.INFO, "isServerAvailable: zookeeper could not connect righ now, check status file on nfs");
            isAvailable = ServiceUtil.checkStatusFile(serverFullName);
          } else
          {
            isAvailable = true;
          }
        }
        else
        {
          // If the side is not the same as local side, check if the side is active and flipped
          String serverTopoName = member.getTopology();
          DataCenterIdentity dc = mgr.getDataCenterIdentity(serverTopoName, false);
          if (dc != null && dc.getPhase() == DataCenterPhase.FLIPPED && dc.getStatus() == DataCenterStatus.ACTIVE)
          {
            isAvailable = true;
          }
          LOG.log(Level.INFO, "isServerAvailable: The server " + serverFullName + " is " + (isAvailable ? "" : "not")
              + " available due to the remote side " + dc);
        }
      }
    } else
    {
      LOG.log(Level.WARNING, "isServerAvailable: could not find the member with server name " + serverFullName);
    }
    return isAvailable;
  }

  public boolean isServerAvailableByQueryZK(String serverFullName)
  {
    boolean isAvailable = false;
    if (client != null)
    {
      // check zookeeper status
      String parentPath = serverNameMap.get(serverFullName);
      LOG.log(Level.FINEST, "serverNameMap: get key " + serverFullName + " return " + parentPath);
      if (parentPath == null)
      {
        LOG.log(Level.WARNING, "The server is not available since can't find the server with full name " + serverFullName + " in zk path "
            + parentPath);
        return false;
      }

      String hbPath = ZKPaths.makePath(parentPath, docsHeartBeatZKNode);
      try
      {
        Stat stat = client.checkExists().forPath(hbPath);
        if (stat != null)
        {
          String stPath = ZKPaths.makePath(parentPath, docsStatusZKNode);
          stat = client.checkExists().forPath(stPath);
          if (stat != null)
          {
            String statusStr = new String(client.getData().forPath(stPath));
            ServerStatus status = ServerStatus.enumValueOf(statusStr);
            if (status == ServerStatus.ACTIVE)
            {
              // check the side status of this server
              List<String> nodeList = ZKPaths.split(parentPath);
              int length = nodeList.size();
              if (length > docsZKPathLength)
              {
                String serverTopoName = nodeList.get(docsZKPathLength);
                if (serverTopoName != null)
                {
                  if (!serverTopoName.equals(topologyName))
                  {
                    LOG.log(Level.INFO, "isServerAvailable: The server " + serverFullName + " belong to " + serverTopoName);
                    // If the side is not the same as local side, check if the side is active and flipped ,
                    DataCenterStatus topoStatus = null;
                    DataCenterPhase topoPhase = null;
                    String topoStatusPath = ZKPaths.makePath(docsZKPath, serverTopoName, topoStatusZKNode);
                    String topoPhasePath = ZKPaths.makePath(docsZKPath, serverTopoName, topoPhaseZKNode);
                    Stat topoStatusStat = client.checkExists().forPath(topoStatusPath);
                    if (topoStatusStat != null)
                      topoStatus = DataCenterStatus.enumValueOf(new String(client.getData().forPath(topoStatusPath)));
                    Stat topoPhaseStat = client.checkExists().forPath(topoPhasePath);
                    if (topoPhaseStat != null)
                      topoPhase = DataCenterPhase.enumValueOf(new String(client.getData().forPath(topoPhasePath)));

                    if (topoStatus == DataCenterStatus.ACTIVE && topoPhase == DataCenterPhase.FLIPPED)
                      isAvailable = true;

                    LOG.log(Level.INFO, "isServerAvailable: The server " + serverFullName + " is " + (isAvailable ? "" : "not")
                        + " available due to the side " + serverTopoName + " status is " + topoStatus + " and phase is " + topoPhase);
                  }
                  else
                  {
                    isAvailable = true;
                  }
                }
              }

            }
          }
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING,
            "ZooKeeper: check heartbeat node failed. Exception happens while checking the status of Docs application on server "
                + serverFullName, e);
      }
    }
    return isAvailable;
  }

  public void setZookeeperValue(String path, String value)
  {
    try
    {
      client.setData().forPath(path, value.getBytes());
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Set " + path + " with value " + value + " failed.", e);
    }
  }

  public static ServerStatus getServerStatus()
  {
    return serverStatus;
  }

  public static void setServerStatus(ServerStatus status)
  {
    serverStatus = status;
  }

  public static void setDataCenterConfig(JSONObject json)
  {
    dataCenterConfig = json;
    Object policy = dataCenterConfig.get(UPGRADING_POLICY);
    if (policy != null)
    {
      int p = Integer.parseInt(policy.toString());
      if (p == UpgradingPolicy.ALL.ordinal())
      {
        upgradingPolicy = UpgradingPolicy.ALL;
      }
    }
    Object draftLevelStr = dataCenterConfig.get(DRAFT_CHANGE_LEVEL);
    if (draftLevelStr != null)
    {
      draftChangeLevel = Integer.parseInt(draftLevelStr.toString());
    }
  }

  public static UpgradingPolicy getUpgradingPolicy()
  {
    return upgradingPolicy;
  }

  public static int getDraftChangeLevel()
  {
    return draftChangeLevel;
  }

}
