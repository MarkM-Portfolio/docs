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

import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.DataCenterPhase;
import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.DataCenterStatus;
import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.ServerPhase;
import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.ServerStatus;
import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.UpgradingPolicy;
import com.ibm.concord.proxy.mbean.StaticClusterMgr;
import com.ibm.json.java.JSONObject;


public class SmartCloudManagement
{
  private static Logger LOG = Logger.getLogger(SmartCloudManagement.class.getName());
  
  // Topology that current docs server locate in
  private static String topologyName;
  
  // Check if zookeeper client has been initialized
  // only after initialized, SmartCloudRoutingPolicy can know the members status and then route request by selecting available members
  private boolean bZKInitialized = false;
  
  private ConcurrentHashMap<String, DataCenterIdentity> dataCenters;
  
  private HashMap<String, String> serverNameMap;
  
  private DataCenterIdentity latestBuildDataCenter;
  
  private boolean isDocsMA;
  
  public enum DataCenterStatus {
    // Data Center can provide service as normal
    ACTIVE("active"),
    // Data Center prepared to refresh build for all the members,
    // so we need select servers from other data centers to provide service
    UPGRADING("upgrading"),
    // Data Center can not provide any service
    INACTIVE("inactive");
    
    private String status;
    
    DataCenterStatus(String st) {
      status  = st;
    }
    
    public String toString() {
      return status;
    }
    
    public static DataCenterStatus enumValueOf(String value) {
      
      if (ACTIVE.toString().equals(value))
        return ACTIVE;
      else if(UPGRADING.toString().equals(value))
        return UPGRADING;
      else if(INACTIVE.toString().equals(value))
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
    
    DataCenterPhase(String p) {
      phase  = p;
    }
    
    public String toString() {
      return phase;
    }
    
    public static DataCenterPhase enumValueOf(String value) {
      
      if (REDEPLOY.toString().equals(value))
        return REDEPLOY;
      else if (FLIPPING.toString().equals(value))
        return FLIPPING;
      else if(FLIPPED.toString().equals(value))
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
  
  public enum ServerStatus {
    // Server can provide service as normal
    ACTIVE("active"),
    // Server prepare to be down for maintainance, such as restart
    INACTIVATING("inactivating"),
    // Server can not provide any service
    INACTIVE("inactive");
    
    private String status;
    
    ServerStatus(String st) {
      status  = st;
    }
    
    public String toString() {
      return status;
    }
    
    public static ServerStatus enumValueOf(String value) 
    {
      if (ACTIVE.toString().equals(value))
        return ACTIVE;
      else if(INACTIVATING.toString().equals(value))
        return INACTIVATING;
      else if(INACTIVE.toString().equals(value))
        return INACTIVE;
      LOG.log(Level.WARNING, "ServerStatus: can not recognize " + value);
      return null;
    }
  }
  
  public enum UpgradingPolicy {
    ONEBYONE, 
    ALL
  }
  
  SmartCloudManagement(String tn, boolean isMA)
  {
    topologyName = tn;
    isDocsMA = isMA;
    dataCenters = new ConcurrentHashMap<String, DataCenterIdentity>();
    serverNameMap = new HashMap<String, String>();
    LOG.log(Level.INFO, "Initialize SmartCloudClusterManagement with topology " + topologyName);
  }
  
  public String getLocalTopologyName()
  {
    return topologyName;
  }
  
  public boolean isDocsMultiActive()
  {
    return isDocsMA;
  }
  
  public Map<String, DataCenterIdentity> getDataCenters()
  {
    return dataCenters;
  }
  
  public DataCenterIdentity getDataCenterIdentity(String tn, boolean bCreate)
  {
    if(tn == null)
      tn = topologyName;
    DataCenterIdentity dc = dataCenters.get(tn);
    if(dc == null && bCreate) {
      boolean bLocal = topologyName.equals(tn);
      dc = new DataCenterIdentity(tn, bLocal);
      dataCenters.putIfAbsent(tn, dc);
    }
    return dc;
  }
  
  public DataCenterStatus getDataCenterStatus(String tn)
  {
    if(tn == null)
      tn = topologyName;
    DataCenterIdentity dc = dataCenters.get(tn);
    return dc != null ? dc.getStatus() : null;
  }
  
  public void setDataCenterStatus(String tn, DataCenterStatus s)
  {
    LOG.log(Level.INFO, "setDataCenterStatus: " + tn + " with status " + s);
    DataCenterIdentity dc = getDataCenterIdentity(tn, true);
    if (dc != null)
    {
      dc.setStatus(s);
      updateLatestBuild();
    }else {
      LOG.log(Level.WARNING, "setDataCenterStatus(" + s + ") failed due to can not find topology " + tn);
    }
  }
  
  public DataCenterPhase getDataCenterPhase(String tn)
  {
    if(tn == null)
      tn = topologyName;
    DataCenterIdentity dc = dataCenters.get(tn);
    return dc != null ? dc.getPhase() : null;
  }
  
  public void setDataCenterPhase(String tn, DataCenterPhase p)
  {
    LOG.log(Level.INFO, "setDataCenterPhase: " + tn + " with phase " + p);
    DataCenterIdentity dc = getDataCenterIdentity(tn, true);
    if (dc != null)
    {
      dc.setPhase(p);
      updateLatestBuild();
    }else {
      LOG.log(Level.WARNING, "setDataCenterPhase(" + p + ") failed due to can not find topology " + tn);
    }
  }
  
  public Set<String> getServerNames()
  {
    Set<String> membersSet = new HashSet<String>();
    Enumeration<String> dEnum = dataCenters.keys();
    while (dEnum.hasMoreElements())
    {
      String name = dEnum.nextElement();
      DataCenterIdentity dc = dataCenters.get(name);
      membersSet.addAll(dc.getMembers().keySet());
    }
    return membersSet;
  }
  
  public void setZKInitialized(boolean bInit)
  {
    LOG.log(Level.INFO, "setZKInitialized: zookeeper has " + (bInit?"":"not ") + "been initialized.");
    bZKInitialized = bInit;
  }
  
  public boolean isZKInitialized()
  {
    return bZKInitialized;
  }

  public boolean setServerStatus(String tn, String serverShortName, ServerStatus status)
  {
    MemberIdentity server = getMemberIdentity(tn, serverShortName, true);
    String name = tn + ":" + serverShortName;
    LOG.log(Level.INFO, "setServerStatus: " + name + " with status " + status);
    ServerStatus oriStatus = server.getStatus();
    if (oriStatus != status)
    {
      server.setStatus(status);
      DataCenterIdentity dc = this.getDataCenterIdentity(tn, false);
      dc.updateLatestBuild();
      return true;
    }
    return false;
  }
  
  public ServerStatus getServerStatus(String tn, String serverShortName)
  {
    MemberIdentity server = getMemberIdentity(tn, serverShortName, false);
    if (server != null)
      return server.getStatus();
    return null;
  }
  
  public boolean setServerPhase(String tn, String serverShortName, ServerPhase phase)
  {
    MemberIdentity server = getMemberIdentity(tn, serverShortName, true);
    String name = tn + ":" + serverShortName;
    LOG.log(Level.INFO, "setServerPhase: " + name + " with phase " + phase);
    ServerPhase oriPhase = server.getPhase();
    if (oriPhase != phase)
    {
      server.setPhase(phase);
      return true;
    }
    return false;
  }
  
  public ServerPhase getServerPhase(String tn, String serverShortName)
  {
    MemberIdentity server = getMemberIdentity(tn, serverShortName, false);
    if (server != null)
      return server.getPhase();
    return null;
  }
  
  public boolean setServerBuild(String tn, String serverShortName, String buildTimeStamp)
  {
    MemberIdentity server = getMemberIdentity(tn, serverShortName, true);
    String name = tn + ":" + serverShortName;
    LOG.log(Level.INFO, "setServerBuild: " + name + " with timestamp " + buildTimeStamp);
    if (buildTimeStamp != null && !buildTimeStamp.equals(server.getBuildTimeStamp()))
    {
      server.setBuildTimeStamp(buildTimeStamp);
      //update Data Center's latest build
      DataCenterIdentity dc = getDataCenterIdentity(tn, false);
      if (server.isAvailable() && (server.getStatus() == ServerStatus.ACTIVE))
      {
        dc.updateLatestBuild();
        if (dc.getStatus() == DataCenterStatus.ACTIVE && dc.getPhase() == DataCenterPhase.FLIPPED)
          this.updateLatestBuild();
      }
      return true;
    }
    return false;
  }

  public String updateLatestBuild()
  {
    int size = dataCenters.size();
    if (size > 0)
    {
      DataCenterIdentity latestDataCenter = null;
      Enumeration<String> enumeration = dataCenters.keys();
      while(enumeration.hasMoreElements())
      {
        String key = enumeration.nextElement();
        DataCenterIdentity dc = dataCenters.get(key);
        if ((dc.getPhase() == DataCenterPhase.FLIPPED) && (dc.getStatus() == DataCenterStatus.ACTIVE))
        {
          if(latestDataCenter == null)
            latestDataCenter = dc;
          else
          {
            int result = StaticClusterMgr.compareBuild(latestDataCenter.getLatestBuild(), dc.getLatestBuild());
            if (result < 0)
              latestDataCenter = dc;
          }
        }
      }
      latestBuildDataCenter = latestDataCenter;
      if (latestBuildDataCenter != null)
      {
        LOG.log(Level.INFO, "Update latest build " + latestBuildDataCenter.getLatestBuild() + " with " + latestBuildDataCenter.getTopologyName());
        latestBuildDataCenter.getLatestBuild();
      }
    }
    return null;
    
  }
  
  public String getLatestBuild()
  {
    if(latestBuildDataCenter != null)
      return latestBuildDataCenter.getLatestBuild();
    
    LOG.log(Level.WARNING, "Could not get latest build time stamp of the whole topology " + topologyName);
    return null;
  }
  
  public boolean setServerHostName(String tn, String serverShortName, String hostName)
  {
    MemberIdentity server = getMemberIdentity(tn, serverShortName, true);
    String name = tn + ":" + serverShortName;
    LOG.log(Level.INFO, "setServerHostName: " + name + " with hostname " + hostName);
    if (hostName != null && !hostName.equals(server.getHostName()))
    {
      server.setHostName(hostName);
      return true;
    }
    return false;
  }

  public boolean setServerFullName(String tn, String serverShortName, String serverFullName)
  {
    MemberIdentity server = getMemberIdentity(tn, serverShortName, true);
    String name = tn + ":" + serverShortName;
    LOG.log(Level.INFO, "setServerFullName: " + name + " with fullname " + serverFullName);
    if (serverFullName != null && !serverFullName.equals(server.getServerFullName()))
    {
      serverNameMap.put(serverFullName, serverShortName);
      server.setServerFullName(serverFullName);
      return true;
    }
    return false;
  }
  
  public boolean setServerAvailable(String tn, String serverShortName, boolean bAvailable)
  {
    MemberIdentity server = getMemberIdentity(tn, serverShortName, bAvailable);
    String name = tn + ":" + serverShortName;
    if (server == null && !bAvailable)
    {
      LOG.log(Level.WARNING, "setServerAvailable: server " + name + " is not a cluster member yet");
      return false;
    }
    LOG.log(Level.INFO, "setServerAvailable: " + name + " with availability " + bAvailable);
    if (bAvailable != server.isAvailable())
    {
      server.setAvailable(bAvailable);
      DataCenterIdentity dc = this.getDataCenterIdentity(tn, false);
      dc.updateLatestBuild();
      return true;
    }
    return false;
  }
  
  public boolean isServerAvailable(String tn, String serverShortName)
  {
    MemberIdentity server = getMemberIdentity(tn, serverShortName, false);
    if (server != null)
      return server.isAvailable();
    return false;
  }
  
  public MemberIdentity getMemberIdentity(String tn, String serverShortName, boolean bCreateIfAbsent)
  {
    if(serverShortName == null)
      return null;
    MemberIdentity member = null;
    if(tn == null && !bCreateIfAbsent) {
        Enumeration<String> dEnum = dataCenters.keys();
        while(dEnum.hasMoreElements()) {
          String name = dEnum.nextElement();
          if (name != null) 
          {
            MemberIdentity m = getMemberIdentity(name, serverShortName, false);
            if (m != null)
              return m;
          }
        }
    } else {
      DataCenterIdentity dc = this.getDataCenterIdentity(tn, bCreateIfAbsent);
      if (dc != null)
      {
        ConcurrentHashMap<String, MemberIdentity> map = dc.getMembers();;
        member = map.get(serverShortName);
        if (member == null && bCreateIfAbsent)
        {
          member = new MemberIdentity(tn, serverShortName, dc.isLocal());
          map.putIfAbsent(serverShortName, member);
        }
      }
    }
    return member;
  }
  
  public MemberIdentity getMemberIdentityByFullName(String tn, String serverFullName, boolean bCreateIfAbsent)
  {
    String serverShortName = serverNameMap.get(serverFullName);
    if (serverShortName == null)
    {
      LOG.log(Level.WARNING, "getMemberIdentityByFullName: return null since can't find the server with full name " + serverFullName);
      return null;
    }
    return getMemberIdentity(tn, serverShortName, bCreateIfAbsent);
  }
  
  public Map<String, MemberIdentity> getLocalMembers()
  {
    HashMap<String, MemberIdentity> members = new HashMap<String, MemberIdentity>();
    DataCenterIdentity dc = dataCenters.get(topologyName);
    if(dc != null)
      members.putAll( dc.getMembers() );
    return members;
  }
  
  public Map<String, MemberIdentity> getRemoteMembers()
  {
    HashMap<String, MemberIdentity> members = new HashMap<String, MemberIdentity>();
    Enumeration<String> dEnum = dataCenters.keys();
    while(dEnum.hasMoreElements()) {
      String name = dEnum.nextElement();
      if (!topologyName.equals(name)) 
      {
        DataCenterIdentity dc = dataCenters.get(name);
        members.putAll( dc.getMembers() );
      }
    }
    return members;
  }
  
  public String toString()
  {
    StringBuilder sb = new StringBuilder();
    sb.append("\n-----------------------------------------------------------------------------\n");
    sb.append("SmartCloud Topology -> ");
    Enumeration<String> key = dataCenters.keys();
    while(key.hasMoreElements())
    {
      String topo = key.nextElement();
      DataCenterIdentity dc = dataCenters.get(topo);
      sb.append(dc.toString());
    }
    return sb.toString();
  }
}

class MemberIdentity
{
  private String topology;
   
  private String shortName;
  
  private String serverFullName;
  
  private String hostName;
  // member(here is docs server) is in the same site as proxy server
  private boolean bLocal;
  
  // member is available
  private boolean bAvailable;
  
  // member is under maintainance or not
  private ServerStatus status;
  
  // member is flipped or not
  private ServerPhase phase;
  
  // the build number of member
  private String buildTimeStamp;
  
  MemberIdentity(String tn, String sName, boolean bLoc)
  {
    topology = tn;
    shortName = sName;
    bLocal = bLoc;
  }
  
  public void setStatus(ServerStatus st)
  {
    status = st;
  }
  
  public ServerStatus getStatus()
  {
    return status;
  }
  
  public void setPhase(ServerPhase sp)
  {
    phase = sp;
  }
  
  public ServerPhase getPhase()
  {
    return phase;
  }
  public boolean isLocalMember()
  {
    return bLocal;
  }
  
  public String getServerName()
  {
    return shortName;
  }
  
  public void setServerFullName(String fullName)
  {
    serverFullName = fullName;
  }
  
  public String getServerFullName()
  {
    return serverFullName;
  }
  
  public void setHostName(String name)
  {
    hostName = name;
  }
  
  public String getHostName()
  {
    return hostName;
  }
  
  public void setBuildTimeStamp(String build)
  {
    buildTimeStamp = build;
  }
  
  public String getBuildTimeStamp()
  {
    return buildTimeStamp;
  }
  
  public void setAvailable(boolean bAv)
  {
    bAvailable = bAv;
  }
  
  public boolean isAvailable()
  {
    return bAvailable;
  }
  
  public String getTopology()
  {
    return topology;
  }
  
  public String toString()
  {
    StringBuilder sb = new StringBuilder();
    sb.append("Member Info -> ");
    sb.append(serverFullName);
    sb.append(";");
    sb.append(hostName);
    sb.append(";");
    sb.append(bLocal?"local member":"remote member");
    sb.append(";");
    sb.append(bAvailable?"has heartbeat":"no heartbeat");
    sb.append(";");
    sb.append(status);
    sb.append(";");
    sb.append(phase);
    sb.append(";");
    sb.append(buildTimeStamp);
    sb.append(";");
    return sb.toString();
  }
}

class DataCenterIdentity {
  private static Logger LOG = Logger.getLogger(DataCenterIdentity.class.getName());
  
  private static String DRAFT_CHANGE_LEVEL = "draftChangeLevel";
  private static String UPGRADING_POLICY = "upgradingPolicy";
  
  private ConcurrentHashMap<String, MemberIdentity> members;
  
  private DataCenterStatus status = DataCenterStatus.INACTIVE;
  private DataCenterPhase phase;
  
  // The member with the lastest build timstamp in this data center
  // The build of the members might be different when upgrading or patching
  private MemberIdentity latestBuildMember;
  private String topologyName;
  private boolean bLocal;
  // config format {"draftChangeLevel":010, "upgradingPolicy":0}
  private JSONObject config;
  private UpgradingPolicy upgradingPolicy = UpgradingPolicy.ALL;
  
  DataCenterIdentity(String tn, boolean bL)
  {
    topologyName = tn;
    bLocal = bL;
    members = new ConcurrentHashMap<String, MemberIdentity>();
  }
  
  public String getLatestBuild()
  {
    if(latestBuildMember != null)
      return latestBuildMember.getBuildTimeStamp();
    
    LOG.log(Level.WARNING, "Could not get latest build time stamp of Data Center " + topologyName);
    return null;
  }
  
  public String updateLatestBuild()
  {
    int size = members.size();
    if (size > 0)
    {
      MemberIdentity latestMember = null;
      Enumeration<String> enumeration = members.keys();
      while(enumeration.hasMoreElements())
      {
        String key = enumeration.nextElement();
        MemberIdentity m = members.get(key);
        if (m.isAvailable() && (m.getStatus() == ServerStatus.ACTIVE))
        {
          if(latestMember == null)
            latestMember = m;
          else
          {
            int result = StaticClusterMgr.compareBuild(latestMember.getBuildTimeStamp(), m.getBuildTimeStamp());
            if (result < 0)
              latestMember = m;
          }
        }
      }
      latestBuildMember = latestMember;
      if (latestBuildMember != null)
      {
        LOG.log(Level.INFO, "Update latest build " + latestBuildMember.getBuildTimeStamp() + " with " + latestBuildMember.getServerFullName());
        return latestBuildMember.getBuildTimeStamp();
      }
    }
    return null;
    
  }

  public ConcurrentHashMap<String, MemberIdentity> getMembers() 
  {
    return members;
  }
  
  public boolean isAvailableByRemote()
  {
    return ((status == DataCenterStatus.ACTIVE) && (phase == DataCenterPhase.FLIPPED));
  }
  
  public boolean isAvailableByLocal()
  {
    return (this.bLocal && (status == DataCenterStatus.ACTIVE));
  }
  
  public DataCenterStatus getStatus()
  {
    return status;
  }
  
  public void setStatus(DataCenterStatus s)
  {
    status = s;
  }
  
  public DataCenterPhase getPhase()
  {
    return phase;
  }
  
  public void setPhase(DataCenterPhase p)
  {
    phase = p;
  }
  
  public void setConfig(JSONObject c)
  {
    config = c;
    
    Object obj = config.get(UPGRADING_POLICY);
    if (obj != null)
    {
      int p = Integer.parseInt(obj.toString());
      if (p == UpgradingPolicy.ALL.ordinal())
      {
        upgradingPolicy = UpgradingPolicy.ALL;
      }
    }
  }
  
  public UpgradingPolicy getUpgradingPolicy()
  {
    return upgradingPolicy;
  }
  
  public boolean isLocal()
  {
    return bLocal;
  }
  
  public String getTopologyName()
  {
    return topologyName;
  }
  
  public String toString()
  {
    StringBuilder sb = new StringBuilder();
    sb.append("\n-----------------------------------------------------------------------------\n");
    sb.append("Data Center Info -> ");
    sb.append(topologyName);
    sb.append(";");
    sb.append(status);
    sb.append(";");
    sb.append(phase);
    sb.append(";");
    sb.append(bLocal?"local data center":"remote data center");
    Enumeration<String> enumeration = members.keys();
    while(enumeration.hasMoreElements())
    {
      String key = enumeration.nextElement();
      MemberIdentity m = members.get(key);
      sb.append("\n\t");
      sb.append(m.toString());
    }
    return sb.toString();
  }
}
