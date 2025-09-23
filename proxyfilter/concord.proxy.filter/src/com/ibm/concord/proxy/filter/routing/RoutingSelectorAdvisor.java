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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Level;
import java.util.logging.Logger;


import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.DataCenterPhase;
import com.ibm.concord.proxy.filter.routing.SmartCloudManagement.ServerStatus;
import com.ibm.concord.proxy.util.ConcordRequestParser;
import com.ibm.json.java.JSONObject;
import com.ibm.wsspi.http.channel.HttpRequestMessage;
import com.ibm.wsspi.proxy.filter.http.HttpProxyServiceContext;

public class RoutingSelectorAdvisor
{

  private static Logger LOG = Logger.getLogger(RoutingSelectorAdvisor.class.getName());

  SmartCloudManagement clusterMgr;

  private ArrayList<ConcordRoutingSelector> selectors;

  private HashMap<String, Integer> selectorIndexMap;

  private ActiveServerRoutingCriteria activeServerCriteria;

  private ReadWriteLock rwLock = new ReentrantReadWriteLock();

  public RoutingSelectorAdvisor(SmartCloudManagement mgr)
  {
    clusterMgr = mgr;
    selectors = new ArrayList<ConcordRoutingSelector>();
    selectorIndexMap = new HashMap<String, Integer>();
    activeServerCriteria = new ActiveServerRoutingCriteria();
  }

  public MemberIdentity selectByRequest(HttpProxyServiceContext serviceContext)
  {
    // Routing Policy
    // //////////////////////////
    // 1. Docs non-session affinity request will route to active updated server
    // 2. Request does not have cookie will be selected to other active servers
    // 3. Request which has inactive server cookie will change the cookie and redirect to other servers
    // 4. JS which contains build number must be route to the corresponding servers with the same build number
    // 5. Response status code is 503/504, and docs pp server in cookie is inactiving, will be redirect to other active servers
    //

    IRoutingCriteria criteria = activeServerCriteria;
    JSONObject criteriaData = new JSONObject();
    HttpRequestMessage request = serviceContext.getRequest();
    String requestURI = request.getRequestURI();
    LOG.log(Level.FINE, "selectByRequest: " + requestURI);

    String docId = ConcordRequestParser.getDocumentIdFromRequest(request);
    if (docId != null)
    {
      // docs session affinity request
      String[] servers = ConcordRequestParser.getSrvNamesInCookie(request, docId);
      String fullName = servers != null && servers.length > 1 ? servers[0] : null;
      if (fullName != null && !"".equals(fullName))
      {
        // has cookie
        MemberIdentity m = clusterMgr.getMemberIdentityByFullName(null, fullName, false);
        if (m == null)
        {
          LOG.log(Level.WARNING, "selectByRequest: Can not get member with full name : " + fullName + ". And ZooKeeper client has "
              + (clusterMgr.isZKInitialized() ? "" : "not ") + "been initalized");
        }
        else if (m.isAvailable() && m.getStatus() != null && m.getStatus() != ServerStatus.INACTIVE)
        {
          if (m.getTopology() == null)
          {
            LOG.log(Level.WARNING, "selectByRequest: Member should not has topology as null for " + m);
          }
          DataCenterIdentity dc = clusterMgr.getDataCenterIdentity(m.getTopology(), false);
          String localTopoName = clusterMgr.getLocalTopologyName();
          DataCenterIdentity localDC = clusterMgr.getDataCenterIdentity(localTopoName, false);
          if (dc != null && !dc.isLocal())
          {
            boolean isAvailable = clusterMgr.isDocsMultiActive()
                && (dc.isAvailableByRemote() && (localDC.getPhase() == DataCenterPhase.FLIPPED));
            if (!isAvailable)
            {
              LOG.log(
                  Level.INFO,
                  "selectByRequest: The request "
                      + requestURI
                      + " has the cookie "
                      + fullName
                      + ", but should not route this request to that server due to local side/data center is not available to route to the other side/data center.\n "
                      + "Local data center info: " + localDC + "\nThe cookie server belonged data center info: " + dc);
              m = null;
            }
          }
          
          if (m != null)
          {
            if (m.getStatus() == ServerStatus.INACTIVATING)
            {
              LOG.log(Level.INFO, "selectByRequest: Need drain active session of file " + docId + " in " + m.getStatus() + " docs server "
                  + fullName);
            }
            
            LOG.log(Level.FINEST, "selectByRequest: Use the original cookie " + m);
            return m;
          }
        }
        else
          LOG.log(Level.WARNING, "selectByRequest: The server in the cookie is not available for file " + docId + ". The member info is "
              + m);
      }
    }
    else
    {
      // static resource and other none docs session affinity request
      String buildNumber = ConcordRequestParser.getBuildNumberFromURI(requestURI);
      if (buildNumber != null)
      {
        LOG.log(Level.FINEST, "selectByRequest: static resource with build number " + buildNumber);
        criteriaData.put("build", buildNumber);
      }
    }

    MemberIdentity m = select(criteria, criteriaData);
    if (m == null)
    {
      LOG.log(Level.WARNING, "selectByRequest: not available servers for  " + request.getRequestURI());
      LOG.log(Level.WARNING, "Please check servers status as below: " + clusterMgr.toString());
    }
    else if (!m.isLocalMember())
    {
      LOG.log(Level.INFO, "selectByRequest: " + requestURI + " will be routed to remote member " + m.getServerFullName());
    }

    return m;
  }

  private MemberIdentity select(IRoutingCriteria criteria, JSONObject criteriaData)
  {
    Lock lock = rwLock.readLock();
    lock.lock();
    try
    {
      for (int i = 0; i < selectors.size(); i++)
      {
        ConcordRoutingSelector selector = selectors.get(i);
        if (criteria.check(selector, criteriaData))
        {
          MemberIdentity m = selector.select(criteria, criteriaData);
          if (m != null)
          {
            LOG.log(Level.FINEST, "selectByRequest: select " + m + " with " + criteria.getClass().getName() + " " + criteriaData);
            return m;
          }
        }
      }
      LOG.log(Level.INFO, "selectByRequest: Could not found available servers with criteria -> " + criteriaData);
      LOG.log(Level.INFO, this.getSelectorsDescription());
      if (criteriaData.containsKey("build-must"))
      {
        boolean bBuildMust = Boolean.parseBoolean((criteriaData.get("build-must").toString()));
        if (!bBuildMust)
        {
          criteriaData.remove("build");
          // select again without build info
          for (int i = 0; i < selectors.size(); i++)
          {
            ConcordRoutingSelector selector = selectors.get(i);
            if (criteria.check(selector, criteriaData))
            {
              MemberIdentity m = selector.select(criteria, criteriaData);
              if (m != null)
              {
                LOG.log(Level.FINEST, "selectByRequest: select " + m + " with updated criteria " + criteria.getClass().getName() + " "
                    + criteriaData);
                return m;
              }
            }
          }
        }
      }
    }
    finally
    {
      lock.unlock();
    }
    return null;
  }

  public void update()
  {
    Lock lock = rwLock.writeLock();
    lock.lock();
    try
    {
      Map<String, DataCenterIdentity> dataCenters = clusterMgr.getDataCenters();
      String localDCName = clusterMgr.getLocalTopologyName();
      DataCenterIdentity localDC = dataCenters.get(localDCName);
      Iterator<String> iter = dataCenters.keySet().iterator();
      while (iter.hasNext())
      {
        String name = iter.next();
        DataCenterIdentity dc = dataCenters.get(name);
        Integer index = selectorIndexMap.get(name);
        LOG.log(Level.INFO, "update selector " + name + " at index " + index + " with info" + dc);
        ConcordRoutingSelector selector = null;
        if (index == null)
        {
          // add new data center selector into selectors
          // local selector have the highest priority that need insert at first place
          selector = new ConcordRoutingSelector(name);
          if (dc.isLocal())
          {
            selectors.add(0, selector);
            selectorIndexMap.put(name, 0);
            for (int i = 1; i < selectors.size(); i++)
            {
              String n = selectors.get(i).getName();
              int j = selectorIndexMap.get(n);
              LOG.log(Level.INFO, "adjust " + n + " from " + j + " to " + (j + 1));
              selectorIndexMap.put(n, j + 1);
            }
          }
          else
          {
            selectors.add(selector);
            selectorIndexMap.put(name, selectors.size() - 1);
          }
        }
        else
        {
          selector = selectors.get(index);
        }
        boolean isAvailable = false;
        // selector is only available when 
        // 1) it is local and status is active
        // 2) for remote dc:
        //   2.1) not available if it is not Multiactive
        //   2.2) not available if local dc is in inactive side(the phase is not flipped), which means current selector is only used for inactive testing
        if (dc.isLocal())
          isAvailable = dc.isAvailableByLocal();
        else 
        {
          isAvailable = clusterMgr.isDocsMultiActive() && (dc.isAvailableByRemote() && (localDC.getPhase() == DataCenterPhase.FLIPPED));
        }
        selector.update(dc.getMembers(), isAvailable);
      }
      LOG.log(Level.INFO, "selectors has been updated! " + this.getSelectorsDescription());

    }
    finally
    {
      lock.unlock();
    }
  }

  public String getSelectorsDescription()
  {
    StringBuilder sb = new StringBuilder();
    sb.append("Selectors Info as below:");
    sb.append("\n-----------------------------------------------------------------------------");
    for (int i = 0; i < selectors.size(); i++)
    {
      ConcordRoutingSelector selector = selectors.get(i);
      sb.append("\nselectors[" + i + "] -> ");
      sb.append(selector.toString());
    }
    return sb.toString();
  }
}

class ConcordRoutingSelector
{
  private static Logger LOG = Logger.getLogger(ConcordRoutingSelector.class.getName());

  private List<MemberIdentity> members;

  private boolean bAvailable;

  private int index;

  private String name;

  public ConcordRoutingSelector(String n)
  {
    name = n;
    members = new ArrayList<MemberIdentity>();
    index = 0;
  }

  public String getName()
  {
    return name;
  }

  /**
   * Select one of the members
   * 
   * @return
   */
  public MemberIdentity select(IRoutingCriteria criteria, JSONObject criteriaData)
  {
    LOG.entering(this.getClass().getName(), "select()");
    if (members != null)
    {
      int size = members.size();
      if (size == 0)
        return null;

      for (int i = 0; i < size; i++)
      {
        index = (++index) % size;
        MemberIdentity m = members.get(this.index);
        if (m != null && criteria.satisfy(m, criteriaData))
          return m;
      }
    }
    LOG.exiting(this.getClass().getName(), "select()");
    return null;
  }

  /**
   * Update the members
   */
  public void update(Map<String, MemberIdentity> allMembers, boolean bAvai)
  {
    LOG.entering(this.getClass().getName(), "update()");
    members.clear();
    // check each members
    if (allMembers != null)
    {
      Iterator<MemberIdentity> iter = allMembers.values().iterator();
      while (iter.hasNext())
      {
        MemberIdentity m = iter.next();
        LOG.log(Level.INFO, "update routing selector: checking member ->" + m);
        if (m != null && m.isAvailable() && m.getStatus() != null && m.getStatus() != ServerStatus.INACTIVE)
        {
          members.add(m);
        }
      }
    }
    bAvailable = bAvai;
    LOG.exiting(this.getClass().getName(), "update()");
  }

  public boolean isAvailable()
  {
    return bAvailable;
  }

  public String toString()
  {
    StringBuilder sb = new StringBuilder();
    sb.append("\n-----------------------------------------------------------------------------\n");
    sb.append("Data Center " + name + " is " + (bAvailable ? "available" : "unavailable") + " with member infos:");
    for (int i = 0; i < members.size(); i++)
    {
      sb.append("\n");
      MemberIdentity m = members.get(i);
      sb.append(m.toString());
    }
    return sb.toString();
  }
}
