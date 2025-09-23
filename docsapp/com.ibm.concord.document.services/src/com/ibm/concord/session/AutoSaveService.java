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

import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.platform.Platform;
import com.ibm.websphere.asynchbeans.Work;
import com.ibm.websphere.asynchbeans.WorkEvent;
import com.ibm.websphere.asynchbeans.WorkItem;
import com.ibm.websphere.asynchbeans.WorkListener;
import com.ibm.websphere.asynchbeans.WorkManager;

/**
 * Service for executing auto saving of documents to draft.
 *
 */
public class AutoSaveService
{
  private static final Logger LOG = Logger.getLogger(AutoSaveService.class.getName());
  
  private static final AutoSaveService instance = new AutoSaveService();
  
  // Type SAVE_TYPE_SAVEMSG(0) indicates the auto saving operation type is saving messages from message queue to msg.json.
  public static final int SAVE_TYPE_SAVEMSG = 0;
  // Type SAVE_TYPE_APPLYMSG(1) indicates the auto saving operation type is applying messages to document content.
  public static final int SAVE_TYPE_APPLYMSG = 1;
  // Type SAVE_TYPE_APPLYCONTENT(2) indicates the auto saving operation type is applying content to document content.
  public static final int SAVE_TYPE_APPLYCONTENT = 2;
  
  // Work listener to monitor the progress of the auto saving work.
  private WorkListener workListener;
  // Stores the list of document sessions that executing auto saving.
  private HashMap<String, String> runningList;
  
  /**
   * Declare the private constructor, so that can keep only singleton instance.
   *  
   */
  private AutoSaveService()
  {
    runningList = new HashMap<String, String>();
    
    workListener = new WorkListener()
    {
      /*
       * (non-Javadoc)
       * @see com.ibm.websphere.asynchbeans.WorkListener#workAccepted(com.ibm.websphere.asynchbeans.WorkEvent)
       */
      public void workAccepted(WorkEvent event)
      {
        if (LOG.isLoggable(Level.FINER))
        {
          Work work = event.getWork();
          if (work instanceof AutoSaveWork)
          {
            String sessionId = ((AutoSaveWork)work).getSessionId();
            LOG.log(Level.FINER, "Auto saving work for document {0} is accepted.", sessionId);
          }
        }
      }
      
      /*
       * (non-Javadoc)
       * @see com.ibm.websphere.asynchbeans.WorkListener#workStarted(com.ibm.websphere.asynchbeans.WorkEvent)
       */
      public void workStarted(WorkEvent event)
      {
        if (LOG.isLoggable(Level.FINER))
        {
          Work work = event.getWork();
          if (work instanceof AutoSaveWork)
          {
            String sessionId = ((AutoSaveWork)work).getSessionId();
            LOG.log(Level.FINER, "Auto saving work for document {0} is started.", sessionId);
          }
        }
      }
      
      /*
       * (non-Javadoc)
       * @see com.ibm.websphere.asynchbeans.WorkListener#workCompleted(com.ibm.websphere.asynchbeans.WorkEvent)
       */
      public void workCompleted(WorkEvent event)
      {
        if (event.getType() == WorkEvent.WORK_COMPLETED)
        {
          // Remove the session id from the running list after finished auto saving.
          Work work = event.getWork();
          if (work instanceof AutoSaveWork)
          {
            String sessionId = ((AutoSaveWork)work).getSessionId();
            clearSessionId(sessionId);
            
            LOG.log(Level.FINER, "Auto saving work for document {0} is completed.", sessionId);
          }
        }
      }
      
      /*
       * (non-Javadoc)
       * @see com.ibm.websphere.asynchbeans.WorkListener#workRejected(com.ibm.websphere.asynchbeans.WorkEvent)
       */
      public void workRejected(WorkEvent event)
      {
        if (event.getType() == WorkEvent.WORK_REJECTED)
        {
          // Remove the session id from the running list if the auto saving work is rejected.
          Work work = event.getWork();
          if (work instanceof AutoSaveWork)
          {
            String sessionId = ((AutoSaveWork)work).getSessionId();
            clearSessionId(sessionId);
            
            LOG.log(Level.FINER, "Auto saving work for document {0} is rejected.", sessionId);
          }
        }
      }
    };
  }
  
  /**
   * Get the singleton instance of the auto saving service.
   * 
   * @return
   */
  public static AutoSaveService getInstance()
  {
    return instance;
  }
  
  /**
   * Remove the session id from running list after finished the auto saving.
   * 
   * @param sessionId
   */
  private void clearSessionId(String sessionId)
  {
    synchronized (runningList)
    {
      if (runningList.containsKey(sessionId))
      {
        LOG.log(Level.FINER, "Remove the session id {0} from running list.", sessionId);
        runningList.remove(sessionId);
      }
    }
  }
  
  /**
   * Start a work to execute the auto saving for specified document.
   * 
   * @param sessionId specifies the document session
   * @param type specifies the type of auto saving operation
   */
  public void triggerAutoSave(String sessionId, int type)
  {
    // Check if it is executing the auto saving for the document session firstly, if yes, ignore this request.
    synchronized (runningList)
    {
      if (runningList.containsKey(sessionId))
      {
        LOG.log(Level.FINER, "Auto saving work for document {0} is executing, so ignore this request.", sessionId);
        return;
      }
      else
      {
        runningList.put(sessionId, sessionId);
      }
    }
    
    try
    {
      LOG.log(Level.FINER, "Start auto saving work for document {0}.", sessionId);
      
      AutoSaveWork work = new AutoSaveWork(sessionId, type);
      WorkItem workItem = Platform.getAutoSaveWorkManager().startWork(work, WorkManager.INDEFINITE, workListener);
      if (workItem.getStatus() == WorkEvent.WORK_REJECTED)
      {
        clearSessionId(sessionId);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception happens while starting auto saving work for document " + sessionId, e);
      // If exception happens while start the work, should remove the session id from the listener.
      clearSessionId(sessionId);
    }
  }  
}

/**
 * This class implements the com.ibm.websphere.asynchbeans.Work interface, is a type of asynchronous bean used  
 * by application components to run code in parallel. Used to execute the auto saving work in managed threads.
 *
 */
class AutoSaveWork implements Work
{
  private static final Logger LOG = Logger.getLogger(AutoSaveWork.class.getName());
  
  private String sessionId;
  // Specifies the auto saving operation type.
  private int type;
  
  /**
   * 
   * @param sessionId specifies the document session id
   * @param type specifies the auto saving operation type
   */
  public AutoSaveWork(String sessionId, int type)
  {
    this.sessionId = sessionId;
    this.type = type;
  }
  
  /**
   * 
   * @return
   */
  public String getSessionId()
  {
    return this.sessionId;
  }
  
  /*
   * (non-Javadoc)
   * @see java.lang.Runnable#run()
   */
  public void run()
  {
    try
    {
      // Execute auto saving for specified document.
      DocumentSession docSession = SessionManager.getInstance().getSession(sessionId);
      if (docSession != null)
      {
        if (type == AutoSaveService.SAVE_TYPE_SAVEMSG)
        {
          LOG.log(Level.FINER, "Start to save messages for document {0}.", sessionId);
          docSession.saveMessages();
          LOG.log(Level.FINER, "Finish to save messages for document {0}.", sessionId);
        }
        else if (type == AutoSaveService.SAVE_TYPE_APPLYMSG)
        {
          LOG.log(Level.FINER, "Start to execute auto saving for document {0}.", sessionId);
          docSession.autoSave();
          LOG.log(Level.FINER, "Finish to execute auto saving for document {0}.", sessionId);      
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception happens while executing auto saving operation(" + type + ") for document: " + sessionId, e);
    }
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.websphere.asynchbeans.Work#release()
   */
  public void release()
  {
    LOG.log(Level.FINER, "Auto saving work for document {0} is released.", sessionId);
  }
}

