/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.session;

import java.util.Calendar;
import java.util.Collection;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Timer;
import java.util.TimerTask;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.bean.DocumentSessionBean;
import com.ibm.websphere.runtime.ServerName;


public class HeartBeatService
{
  private static final Logger LOG = Logger.getLogger(HeartBeatService.class.getName());
  
  private static final HeartBeatService _instance = new HeartBeatService();
  
  private int HB_INTERVAL;
  
  private int HB_TIMEOUT;
  
  private Timer timer;
  
  private int count;
  
  private Hashtable<String, DocumentSessionBean> purgedSessions = new Hashtable<String, DocumentSessionBean>();
  
  private HeartBeatService()
  {
    int itvl = SessionConfig.getHeartBeatInterval();
    int tmt = SessionConfig.getHeartBeatTimeout();
    int rty = SessionConfig.getHeartBeatRetryCount();
    HB_INTERVAL = (itvl + tmt + tmt*rty + itvl + 1)*1000;
    HB_TIMEOUT = HB_INTERVAL*2;
    count = 0;
  }
  
  public static HeartBeatService getInstance()
  {
    return _instance;
  }
  
  public static void start()
  {
    _instance.startBeating();
  }
  
  public int getHeartBeatInterval()
  {
    return HB_INTERVAL;
  }
  
  private void startBeating()
  {
    timer = new Timer();
    timer.schedule(new HeartBeat(), 0, HB_INTERVAL);
  }
  
  /**
   * Purge the document session in the database. Sometime, document session is not created, but has added a record
   * into document session database, there is no chance to delete the record in database, so purge the database here.
   * 
   */
  private void purgeSessionDatabase()
  {
    try
    {
      if ((count++) >= 20)
      {
        SessionManager manager = SessionManager.getInstance();
        DocumentSessionService service = DocumentSessionService.getInstance();
        
        // Every 20 times to clear the unused document sessions information in database.
        Collection<DocumentSessionBean> list = purgedSessions.values();
        Iterator<DocumentSessionBean> iter = list.iterator();
        while (iter.hasNext())
        {
          DocumentSessionBean bean = iter.next();
          if (bean != null && manager.getSession(bean.getRepoId(), bean.getDocId()) == null)
          {
            service.unServeDocument(bean.getRepoId(), bean.getDocId());
          }
        }
        purgedSessions.clear();
        
        // Find the unused document session information in database.
        List<DocumentSessionBean> beans = service.getServedDocuments(ServerName.getFullName());
        int size = beans != null ? beans.size() : 0;
        for (int index = 0; index < size; index++)
        {
          DocumentSessionBean bean = beans.get(index);
          if (bean != null && manager.getSession(bean.getRepoId(), bean.getDocId()) == null)
          {
            purgedSessions.put(manager.getKey(bean.getRepoId(), bean.getDocId()), bean);
          }
        }
        
        count = 0;
      }
    }
    catch (Throwable ex)
    {
      LOG.log(Level.WARNING, "Failed when purging document session database", ex);
    }
  }
  
  private synchronized void check() throws Throwable
  {
    // check clients' availability
    SessionManager sessMgr = SessionManager.getInstance();

    try
    {
      Enumeration<String> sessionIds = sessMgr.getSessionIds();

      Map<String, String> lefts = new HashMap<String, String>();
      long now = Calendar.getInstance().getTime().getTime();

      for (; sessionIds.hasMoreElements();)
      {
        String id = sessionIds.nextElement();
        DocumentSession docSess = sessMgr.getSession(id);
        if (docSess == null)
        {
          continue;
        }

        Participant pList[] = docSess.getParticipants();
        for (Participant p : pList)
        {
          if ((now - p.getReportTime().getTime()) > HB_TIMEOUT)
          {
            lefts.put(p.getClientId(), id);
          }
        }
        
        // Clear the kicked out participant.
        Participant pKickedList[] = docSess.getKickedParticipants();
        for (Participant p : pKickedList)
        {
          if ((now - p.getReportTime().getTime()) > HB_TIMEOUT)
          {
            docSess.removeKickedParitcipant(p.getClientId());
          }
        }

        for (Entry<String, String> e : lefts.entrySet())
        {
          DocumentSession tempSess = sessMgr.getSession(e.getValue());
          if (tempSess == null)
          {
            LOG.log(Level.INFO, "document has been closed while performing heart beat check" + e.getValue());
            continue;
          }
          tempSess.leave(e.getKey(),null);         
          tempSess.removeOTContext(e.getKey());          
        }
      }
      purgeSessionDatabase();
    }
    catch (Throwable ex)
    {
      throw ex;
    }
  }
  
  class HeartBeat extends TimerTask
  {
    /*
     * (non-Javadoc)
     * @see java.util.TimerTask#run()
     */
    public void run()
    {
      try
      {
        check();
      }
      catch (Throwable e)
      {
        LOG.log(Level.WARNING, "failed when performing heart beat check " , e);
      }
    }
  }
}
