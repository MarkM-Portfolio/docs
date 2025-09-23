package com.ibm.concord.session;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.http.Cookie;

import com.ibm.docs.common.util.URLConfig;
import com.ibm.websphere.asynchbeans.Work;

/**
 * This class implements the com.ibm.websphere.asynchbeans.Work interface, it is a type of asynchronous bean used  
 * by application components to run code in parallel. Used to execute the session closing work in managed threads.
 * 
 */
class SessionCloseWork implements Work
{
  private static final Logger LOG = Logger.getLogger(SessionCloseWork.class.getName());
  
  private String sessionId;
  private Cookie[] cookies;
  
  /**
   * 
   * @param sessionId specifies the session id of document being closed
   */
  public SessionCloseWork(String sessionId, Cookie[] cookies)
  {
    this.sessionId = sessionId;
    this.cookies = cookies;
  }
  
  /*
   * (non-Javadoc)
   * @see java.lang.Runnable#run()
   */
  public void run()
  {
    DocumentSession docSession = SessionManager.getInstance().getSession(sessionId);
    if (docSession != null)
    {
      LOG.log(Level.FINER, "Start to execute session closing work for document {0}.", sessionId);
      if(this.cookies != null) 
      {
        URLConfig.setRequestCookies(this.cookies);        
      }
      
      docSession.doClose(true, false);
      LOG.log(Level.FINER, "Finish to execute session closing work for document {0}.", sessionId);
    }
    else
    {
      LOG.log(Level.INFO, "Did not find the document session {0} while executing session closing work.", sessionId);
    }
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.websphere.asynchbeans.Work#release()
   */
  public void release()
  {
    LOG.log(Level.FINER, "Session closing work for document {0} is released.", sessionId);
  }
}
