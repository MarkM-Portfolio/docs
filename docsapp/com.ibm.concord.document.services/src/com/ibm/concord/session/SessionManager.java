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

import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.List;
import java.util.logging.Logger;

import com.ibm.concord.collaboration.editors.EditorSessionListener;
import com.ibm.concord.document.services.autopublish.AutoPublishSessionListener;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.listener.ISessionListener;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.directory.beans.UserBean;

/**
 * @author ruisuy@cn.ibm.com
 * 
 */
public final class SessionManager
{
  private static final Logger LOG = Logger.getLogger(SessionManager.class.getName());

  // private static final SessionManager _instance = new SessionManager();

  private Hashtable<String, DocumentSession> sessions;

  // Stores the sessions that being removed. If there is no participant join the session when
  // closing the session, then should remove the session from the map 'sessionsToBeRemoved'
  private Hashtable<String, DocumentSession> sessionsToBeRemoved;

  private List<ISessionListener> listeners;

  public SessionManager()
  {
    sessions = new Hashtable<String, DocumentSession>();
    sessionsToBeRemoved = new Hashtable<String, DocumentSession>();
    HeartBeatService.start();
    /**
     * This is temporary fix to avoid deadlock. In convention of this design, we MUST not call  
     * Platform.getComponent(String id) in the component initialization phrase. The best chance 
     * is to call the service after getting real interface to do such things.
     * In the future we should consider use Spring to replace current mechanism
     *  
    ISessionListener sessionListener = RevisionService.getInstance().getSessionListener();
    addListener(sessionListener);
    */
    ISessionListener autoPublishListener = new AutoPublishSessionListener();
    addListener(autoPublishListener);
    ISessionListener editorListener = new EditorSessionListener();
    addListener(editorListener);
  }

  protected String getKey(IDocumentEntry docEntry)
  {
    return getKey(docEntry.getRepository(), docEntry.getDocUri());
  }

  protected String getKey(String repoId, String docUri)
  {
    return repoId + "/" + docUri;
  }

  public static SessionManager getInstance()
  {
    SessionManager sessMgr = (SessionManager) Platform.getComponent(SessionManagerComponentImpl.COMPONENT_ID).getService(
        SessionManager.class);
    return sessMgr;
  }

  /**
   * @deprecated
   */
  public DocumentSession openSession(UserBean caller, IDocumentEntry docEntry) throws Exception
  {
    LOG.entering(SessionManager.class.getName(), "openSession",
        new Object[] { caller.getId(), docEntry.getDocUri(), docEntry.getRepository() });
    DocumentSession sess = getSession(docEntry);
    if (sess == null)
    {
      synchronized (sessions)
      {
        sess = getSession(docEntry);
        if (sess == null)
        {
          sess = new DocumentSession(caller, docEntry);
          sessions.put(getKey(docEntry), sess);
        }
      }
    }
    sess.open(caller, docEntry);
    LOG.exiting(SessionManager.class.getName(), "openSession",
        new Object[] { caller.getId(), docEntry.getDocUri(), docEntry.getRepository() });
    return sess;
  }

  public DocumentSession openSession(UserBean caller, IDocumentEntry docEntry, DraftDescriptor draftDescriptor) throws Exception
  {
    LOG.entering(SessionManager.class.getName(), "openSession",
        new Object[] { caller.getId(), docEntry.getDocUri(), docEntry.getRepository() });
    DocumentSession sess = getSession(docEntry);
    if (sess == null)
    {
      synchronized (sessions)
      {
        sess = getSession(docEntry);
        if (sess == null)
        {
          sess = new DocumentSession(caller, docEntry, draftDescriptor);
          sessions.put(getKey(docEntry), sess);
        }
      }
    }
    sess.open(caller, docEntry);
    LOG.exiting(SessionManager.class.getName(), "openSession",
        new Object[] { caller.getId(), docEntry.getDocUri(), docEntry.getRepository() });
    return sess;
  }

  public void closeSession(IDocumentEntry docEntry)
  {
    closeSession(getKey(docEntry), true, true);
  }

  public void closeSession(IDocumentEntry docEntry, boolean sync)
  {
    closeSession(getKey(docEntry), sync, false);
  }

  protected void closeSession(String repoId, String docUri, boolean sync)
  {
    closeSession(getKey(repoId, docUri), sync, false);
  }

  /**
   * Close the session of specified document. Remove the session from the map 'sessions', put the session into the map
   * 'sessionsToBeRemoved', then call DocumentSession.close().
   * 
   * @param sessionId
   *          specifies the id of session that being closed
   */
  protected void closeSession(String sessionId, boolean sync, boolean discard)
  {
    DocumentSession session = null;
    synchronized (sessions)
    {
      session = sessions.remove(sessionId);
      if (session != null && !sync)
      {
        sessionsToBeRemoved.put(sessionId, session);
      }
    }
    if (session != null)
    {
      session.close(sync, discard);
    }

  }

  /**
   * Only can be called when a client want to join a document session. If the session does not exist in map 'sessions', then find the
   * session in map 'sessionsToBeRemoved', if find it, means the session is closing, should move the session from map 'sessionsToBeRemoved'
   * to map 'sessions'.
   * 
   * @param docEntry
   *          specifies the entry of the document
   * @return the document session if find the session, otherwise null
   */
  public DocumentSession getSessionWhenJoin(IDocumentEntry docEntry)
  {
    if (docEntry == null)
    {
      return null;
    }

    String sessionId = getKey(docEntry);
    synchronized (sessions)
    {
      DocumentSession session = sessions.get(sessionId);
      if (session == null)
      {
        session = sessionsToBeRemoved.remove(sessionId);
        if (session != null)
        {
          sessions.put(sessionId, session);
        }
      }
      return session;
    }
  }

  public DocumentSession getSession(IDocumentEntry docEntry)
  {
    return getSession(docEntry.getRepository(), docEntry.getDocUri());
  }

  public DocumentSession getSession(String repoId, String docUri)
  {
    return getSession(getKey(repoId, docUri));
  }

  public DocumentSession getSession(String sessionId)
  {
    synchronized (sessions)
    {
      DocumentSession session = sessions.get(sessionId);
      if (session == null)
      {
        session = sessionsToBeRemoved.get(sessionId);
      }
      return session;
    }
  }

  /**
   * Remove the document session from the map 'sessionsToBeRemoved'.
   * 
   * @param sessionId
   *          specifies the session id of the document
   * @return true if remove the session, otherwise false
   */
  protected boolean removeSession(String sessionId)
  {
    synchronized (sessions)
    {
      if (sessionId != null)
      {
        return sessionsToBeRemoved.remove(sessionId) != null;
      }
    }
    return false;
  }

  /**
   * Remove all the sessions when this document is not going to serve service
   */
  public void removeSessions()
  {
    synchronized (sessions)
    {
      sessions.clear();
      sessionsToBeRemoved.clear();
    }
  }
  /**
   * Check if the specified document session is in closing status.
   * 
   * @param docEntry
   *          specifies the entry of document being checked
   * @return true if specified session is closing, otherwise false
   */
  public boolean isSessionClosing(IDocumentEntry docEntry)
  {
    synchronized (sessions)
    {
      if (docEntry != null)
      {
        return sessionsToBeRemoved.containsKey(getKey(docEntry));
      }
    }
    return false;
  }

  /**
   * Get the document session which is in closing status.
   * 
   * @param repoId
   *          specifies the document repository id
   * @param docUri
   *          specifies the document URI
   * @return session is in closing status, null if session is not closing
   */
  public DocumentSession getClosingSession(String repoId, String docUri)
  {
    synchronized (sessions)
    {
      return sessionsToBeRemoved.get(getKey(repoId, docUri));
    }
  }

  public int getActiveSessionNumbers()
  {
    return sessions.size();
  }

  public Enumeration<String> getSessionIds()
  {
    synchronized (sessions)
    {
      return sessions.keys();
    }
  }

  public void addListener(ISessionListener listener)
  {
    if (listener == null)
      return;

    if (listeners == null)
      listeners = new ArrayList<ISessionListener>();

    listeners.add(listener);
  }

  void notifySessionClosed(DocumentSession session, boolean inWork, boolean discard)
  {

    if (listeners != null)
    {
      for (ISessionListener listener : listeners)
      {
        UserBean user = session.getLastModifer();
        if (user == null)
          user = session.getLastLeaver();

        listener.sessionClosed(session.getDocumentEntry(), session.getDraftDescriptor(), user, inWork, discard);
      }
    }
  }

  void notifySessionOpened(DocumentSession session, IDocumentEntry docEntry)
  {
    if (listeners != null)
    {
      for (ISessionListener listener : listeners)
      {
        listener.sessionOpened(docEntry, session.getDraftDescriptor());
      }
    }
  }

  void notifyMessageReceived(DocumentSession session, UserBean user, String clientId)
  {
    if (listeners != null)
    {
      for (ISessionListener listener : listeners)
      {
        listener.messageReceived(session.getDraftDescriptor(), user);
      }
    }

  }

  public void notifyUserJoin(DocumentSession documentSession, UserBean user, String clientId)
  {
    if (listeners != null)
    {
      for (ISessionListener listener : listeners)
      {
        listener.userJoined(documentSession.getDocumentEntry(), user);
      }
    }
  }

  public void notifyUserLeave(DocumentSession documentSession, UserBean user, String clientId)
  {
    if (listeners != null)
    {
      for (ISessionListener listener : listeners)
      {
        listener.userLeave(documentSession.getDocumentEntry(), user);
      }
    }

  }
}
