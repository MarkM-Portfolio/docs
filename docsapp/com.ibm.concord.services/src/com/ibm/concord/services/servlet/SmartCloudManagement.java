package com.ibm.concord.services.servlet;

/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.services.servlet.SmartCloudInitializer.DataCenterPhase;
import com.ibm.concord.services.servlet.SmartCloudInitializer.DataCenterStatus;
import com.ibm.concord.services.servlet.SmartCloudInitializer.ServerPhase;
import com.ibm.concord.services.servlet.SmartCloudInitializer.ServerStatus;

public class SmartCloudManagement
{
  private static Logger LOG = Logger.getLogger(SmartCloudManagement.class.getName());
  
  // Topology that current docs server locate in
  private static String topologyName;
  
  private ConcurrentHashMap<String, DataCenterIdentity> dataCenters;
  
  private HashMap<String, String> serverNameMap;
  
  SmartCloudManagement(String tn)
  {
    topologyName = tn;
    dataCenters = new ConcurrentHashMap<String, DataCenterIdentity>();
    serverNameMap = new HashMap<String, String>();
    LOG.log(Level.INFO, "Initialize SmartCloudClusterManagement with topology " + topologyName);
  }
  
  public String getLocalTopologyName()
  {
    return topologyName;
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

  public boolean setServerStatus(String tn, String serverShortName, ServerStatus status)
  {
    MemberIdentity server = getMemberIdentity(tn, serverShortName, true);
    String name = tn + ":" + serverShortName;
    LOG.log(Level.INFO, "setServerStatus: " + name + " with status " + status);
    ServerStatus oriStatus = server.getStatus();
    if (oriStatus != status)
    {
      server.setStatus(status);
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
      return true;
    }
    return false;
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
    LOG.log(Level.INFO, "setServerAvailable: " + name + " with availability " + bAvailable);
    if (bAvailable != server.isAvailable())
    {
      server.setAvailable(bAvailable);
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
  
  private ConcurrentHashMap<String, MemberIdentity> members;
  
  private DataCenterStatus status = DataCenterStatus.INACTIVE;
  private DataCenterPhase phase;
  
  private String topologyName;
  private boolean bLocal;
  
  DataCenterIdentity(String tn, boolean bL)
  {
    topologyName = tn;
    bLocal = bL;
    members = new ConcurrentHashMap<String, MemberIdentity>();
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
