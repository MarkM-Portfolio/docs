package com.ibm.concord.services.servlet;

import java.util.Enumeration;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock.WriteLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.services.servlet.SmartCloudInitializer.ServerStatus;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.session.DocumentSession.SessionStatus;
import com.ibm.websphere.asynchbeans.Work;
import com.ibm.websphere.runtime.ServerName;

public class ServerInactivatingWork implements Work
{
  private static final Logger LOG = Logger.getLogger(ServerInactivatingWork.class.getName());

  private boolean bTextFormatChanged = false;
  private boolean bPresFormatChanged = false;
  private boolean bSheetFormatChanged = false;
  
  private String statusPath;
  public ServerInactivatingWork(String path)
  {
    statusPath = path;
    
    int draftChangeLevel = SmartCloudInitializer.getDraftChangeLevel();
    bTextFormatChanged = (draftChangeLevel & SmartCloudInitializer.DRAFT_CHANGE_TEXT_MASK) > 0;
    bPresFormatChanged = (draftChangeLevel & SmartCloudInitializer.DRAFT_CHANGE_PRES_MASK) > 0;
    bSheetFormatChanged = (draftChangeLevel & SmartCloudInitializer.DRAFT_CHANGE_SHEET_MASK) > 0;
  }
  
  @Override
  public void run()
  {
    LOG.log(Level.INFO, ServerName.getFullName() + " is in inactiviating status. Each session will be iterated to flush message.");
    long startTime = System.currentTimeMillis();
    SessionManager sessionMgr = SessionManager.getInstance();
    Enumeration<String> sessionIds = sessionMgr.getSessionIds();
    int sessionNum = 0;
    while (sessionIds.hasMoreElements())
    {
      DocumentSession session = null;
      WriteLock lock = null;
      try
      {
        sessionNum++;
        String id = sessionIds.nextElement();
        session = sessionMgr.getSession(id);
        if (session != null)
        {
          String docType = DocumentServiceUtil.getDocumentType(session.getDocumentEntry());
          boolean bFormatChanged = false;
          if ("text".equalsIgnoreCase(docType))
            bFormatChanged = bTextFormatChanged;
          else if ("pres".equalsIgnoreCase(docType))
            bFormatChanged = bPresFormatChanged;
          else if ("sheet".equalsIgnoreCase(docType))
            bFormatChanged = bSheetFormatChanged;
          LOG.log(Level.INFO, "Start to " + (bFormatChanged ? "save draft" : "save message") + " for document " + session.getDocUri());
          ReentrantReadWriteLock inactiveLock = session.getInactiveLock();
          lock = inactiveLock.writeLock();
          lock.lock();
          if (bFormatChanged)
            session.autoSave();
          else
            session.saveMessages();
          session.setStatus(SessionStatus.INACTIVE);
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Drain Session " + ((session != null) ? session.getDocUri() : null) + " failed.", e);
      }
      finally
      {
        try
        {
          if (lock != null)
            lock.unlock();
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "unlock write lock for " + ((session != null) ? session.getDocUri() : null) + " failed.", e);
        }
      }
    }
    long endTime = System.currentTimeMillis();
    LOG.log(Level.INFO, "It takes " + (endTime - startTime) + "ms to drain " + sessionNum + " sessions");
    SmartCloudInitializer scInitializer = PlatformInitializer.getSmartCloudInitializer();
    if (scInitializer != null && scInitializer.isZookeeperEnabled())
    {
      LOG.log(Level.INFO, "Start to set inactive");
      scInitializer.setZookeeperValue(statusPath, ServerStatus.INACTIVE.toString());
      sessionMgr.removeSessions();
    }
  }

  @Override
  public void release()
  {
    
  }


}
