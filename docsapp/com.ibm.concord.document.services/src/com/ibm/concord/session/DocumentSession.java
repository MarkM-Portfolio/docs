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

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.collaboration.editors.EditorsListUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.draft.state.DraftState;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.dao.IDocRecentsDAO;
import com.ibm.concord.platform.draft.DraftAction;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.platform.webmsg.WebMessageComponentImpl;
import com.ibm.concord.session.message.Message;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentService.TransformResult;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.concord.spi.webmessage.IWebMessageAdapter;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentSession
{
  private static final String EDIT_SESSION_OPEN = "edit.session.open";

  private static final String EDIT_SESSION_CLOSE = "edit.session.close";

  private static final Logger LOG = Logger.getLogger(DocumentSession.class.getName());

  private IDocumentEntry docEntry;

  private UserBean lastModifier;

  private UserBean lastLeaver;

  private String repoId;

  private String docUri;

  private String docType;

  private String sessionId;

  private IDocRecentsDAO daoRecentFiles;

  private UserBean caller;

  private IDocumentService ds;

  private DraftDescriptor draftDescriptor;

  private Map<String, Participant> clientMap;

  private ConcurrentSkipListMap<Date, Participant> orderedClientCache;

  private Participant[] orderedClient;

  private boolean cacheUpdated;

  private Map<String, Participant> kickedOutClientMap;

  // The error code that presents why the users cannot join the session.
  private int cannotJoinErrorCode = 0;

  // The map of users who cannot join the document session. Key is the client id, value is the user names list.
  private Map<String, HashSet<String>> cannotJoinUsers;

  // The synchronized object for saving content state of this document.
  private Object savingLock = new Object();

  // The lock used for session inactive when server is in inactivating status
  private ReentrantReadWriteLock inactivatingReadWriteLock = new ReentrantReadWriteLock();

  private List<Message> transformedList;

  private List<Message> hbPendingList;

  private boolean isInCoEditing = false;

  private Object msgProcessLock = new Object();

  private List<String> conflictClients;

  private Object OTContext;

  private IWebMessageAdapter webMsgAdapter;

  private String secureToken;

  private Date lastChangedDate;

  // The last time stamp when saving messages from message queue to msg.json.
  private long lastSaveMsgTime;

  // The interval time to do auto saving.
  private int HB_INTERVAL;

  // coedit: The max size of messages in message queue, if current size exceeds this value, then should move the messages from queue to
  // msg.json.
  private static final int MAX_SAVE_MSG_SIZE_FOR_COEDIT = SessionConfig.getMaxSaveMsgSizeForCoEdit();

  // coedit: The max size of messages in message queue and msg.json, if current size exceeds this value, then should apply messages.
  private static final int MAX_APPLY_MSG_SIZE_FOR_COEDIT = SessionConfig.getMaxApplyMsgSizeForCoEdit();

  // single user:The max size of messages in message queue, if current size exceeds this value, then should move the messages from queue to
  // msg.json.
  private static final int MAX_SAVE_MSG_SIZE_FOR_SINGLE = SessionConfig.getMaxSaveMsgSizeForSingle();

  // single user: The max size of messages in message queue and msg.json, if current size exceeds this value, then should apply messages.
  private static final int MAX_APPLY_MSG_SIZE_FOR_SINGLE = SessionConfig.getMaxApplyMsgSizeForSingle();

  // The max string length of messages in message queue, if current size exceeds this value, then should apply messages.
  private long MAX_APPLYMSG_MEMSIZE;

  private long baseSeq;

  // The sequence of last message that has been saved in msg.json.
  private long savedSeq;

  // The number of messages that have being buffered in msg.json.
  private long bufferedMsgNumber;

  // The total string length of messages in message queue.
  private long messageStringsSize;

  private static final String BASE_SEQ_KEY = "base_seq";

  private static final String MSGS_KEY = "msgs";

  // The max integer value of a JavaScript variable is 2^53(0x20000000000000L).
  private static final long MAX_SEQ_VALUE = 0x20000000000000L;

  // Trace folder under 'temp' folder in draft.
  public final static String TRACE_FOLDER = "trace";

  // Trace log file for the initial content of document.
  public final static String TRACE_STATE_0_FILE = "state0.json.trace";

  // Trace log file for the incoming messages.
  public final static String TRACE_IN_MSGS_FILE = "inmsgs.json.trace";

  // Trace log file for the outgoing messages.
  public final static String TRACE_OUT_MSGS_FILE = "outmsgs.json.trace";

  // Amount of asControl messages, they are treated as content msg, but should not impact auto save performance
  private long amountOfAsCtrlMsg = 0;

  private boolean opened;

  private boolean isPublishing;

  private Object openLock = new Object();

  private SessionStatus sessionStatus = SessionStatus.ACTIVE;

  public enum SessionStatus {
    ACTIVE("active"), INACTIVE("inactive");

    private String status;

    SessionStatus(String st)
    {
      status = st;
    }

    public String toString()
    {
      return status;
    }

    public static SessionStatus enumValueOf(String value)
    {

      if (ACTIVE.toString().equals(value))
        return ACTIVE;
      else if (INACTIVE.toString().equals(value))
        return INACTIVE;
      return null;
    }
  }

  /**
   * Construct the document session instance.
   * 
   * @param caller
   *          the user who create the document session
   * @param docEntry
   *          the document entry of this session
   * @deprecated
   */
  protected DocumentSession(UserBean caller, IDocumentEntry docEntry)
  {
    this.docEntry = docEntry;
    this.caller = caller;
    this.repoId = docEntry.getRepository();
    this.docUri = docEntry.getDocUri();
    this.docType = DocumentServiceUtil.getDocumentType(docEntry);
    ds = DocumentServiceUtil.getDocumentServiceByType(this.docType);
    transformedList = new ArrayList<Message>();
    hbPendingList = new ArrayList<Message>();
    conflictClients = new ArrayList<String>();
    secureToken = UUID.randomUUID().toString();
    clientMap = new HashMap<String, Participant>();
    orderedClientCache = new ConcurrentSkipListMap<Date, Participant>();
    orderedClient = null;
    cacheUpdated = true;
    kickedOutClientMap = new HashMap<String, Participant>();
    cannotJoinUsers = new HashMap<String, HashSet<String>>();
    // Initialize time stamp when saving messages from message queue to msg.json.
    lastSaveMsgTime = Calendar.getInstance().getTime().getTime();
    // Get the interval time for auto saving.
    HB_INTERVAL = HeartBeatService.getInstance().getHeartBeatInterval();

    MAX_APPLYMSG_MEMSIZE = SessionConfig.getMaxMsgsSizeInQueue();
    if (!"sheet".equalsIgnoreCase(DocumentServiceUtil.getDocumentType(docEntry)))
    {
      MAX_APPLYMSG_MEMSIZE = 3 * MAX_APPLYMSG_MEMSIZE;
    }

    // The default string length in the message queue is 0.
    messageStringsSize = 0;

    SessionManager sessionMgr = SessionManager.getInstance();
    sessionId = sessionMgr.getKey(docEntry);
  }

  protected DocumentSession(UserBean caller, IDocumentEntry docEntry, DraftDescriptor draftDescriptor)
  {
    this.docEntry = docEntry;
    this.draftDescriptor = draftDescriptor;
    this.caller = caller;
    this.repoId = docEntry.getRepository();
    this.docUri = docEntry.getDocUri();
    this.docType = DocumentServiceUtil.getDocumentType(docEntry);
    ds = DocumentServiceUtil.getDocumentServiceByType(this.docType);
    transformedList = new ArrayList<Message>();
    hbPendingList = new ArrayList<Message>();
    conflictClients = new ArrayList<String>();
    secureToken = UUID.randomUUID().toString();
    clientMap = new HashMap<String, Participant>();
    orderedClientCache = new ConcurrentSkipListMap<Date, Participant>();
    orderedClient = null;
    cacheUpdated = true;
    kickedOutClientMap = new HashMap<String, Participant>();
    cannotJoinUsers = new HashMap<String, HashSet<String>>();
    // Initialize time stamp when saving messages from message queue to msg.json.
    lastSaveMsgTime = Calendar.getInstance().getTime().getTime();
    // Get the interval time for auto saving.
    HB_INTERVAL = HeartBeatService.getInstance().getHeartBeatInterval();

    MAX_APPLYMSG_MEMSIZE = SessionConfig.getMaxMsgsSizeInQueue();
    if (!"sheet".equalsIgnoreCase(DocumentServiceUtil.getDocumentType(docEntry)))
    {
      MAX_APPLYMSG_MEMSIZE = 3 * MAX_APPLYMSG_MEMSIZE;
    }

    // The default string length in the message queue is 0.
    messageStringsSize = 0;

    SessionManager sessionMgr = SessionManager.getInstance();
    sessionId = sessionMgr.getKey(docEntry);
  }

  /**
   * Open the document session: Initialize the web message adapter, get the buffered messages from draft, etc.
   * 
   * @param caller
   */
  protected void open(UserBean caller, IDocumentEntry docEntry)
  {
    synchronized (openLock)
    {
      if (opened)
        return;
      webMsgAdapter = (IWebMessageAdapter) Platform.getComponent(WebMessageComponentImpl.COMPONENT_ID).getService(IWebMessageAdapter.class);

      Date now = Calendar.getInstance().getTime();
      lastChangedDate = now;

      // Remove draft state in-case previous corrupted state is inherited by new session.
      DraftState.DRAFTS_STATE.remove(draftDescriptor.getDocId());

      // Load the buffered messages and message sequence number in msg.json.
      try
      {
        JSONObject msgJson = DraftStorageManager.getDraftStorageManager().getBufferredMsg(draftDescriptor);
        long sequence = Long.parseLong(msgJson.get(BASE_SEQ_KEY).toString());
        JSONArray bufferedList = (JSONArray) msgJson.get(MSGS_KEY);
        bufferedMsgNumber = bufferedList != null ? bufferedList.size() : 0;
        setSavedSeq(sequence + bufferedMsgNumber);
        setBaseSeq(sequence + bufferedMsgNumber);
      }
      catch (ConcordException e)
      {
        LOG.log(Level.SEVERE, "cannot read msg.json file for draft:" + draftDescriptor, e);
      }

      try
      {
        JSONObject metaJson = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDescriptor);
        metaJson.put(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey(), AtomDate.valueOf(Calendar.getInstance()).getValue());
        DraftStorageManager.getDraftStorageManager().setDraftMeta(draftDescriptor, metaJson);
      }
      catch (DraftDataAccessException e)
      {
        LOG.log(Level.SEVERE, "cannot update meta.json file for draft:" + draftDescriptor, e);
      }
      opened = true;
      SessionManager.getInstance().notifySessionOpened(this, docEntry);
      RepositoryServiceUtil.notifySessionEventToRepository(docEntry, EDIT_SESSION_OPEN);
    }

    LOG.info(new ActionLogEntry(caller, Action.OPENSESSION, docEntry.getDocUri(), null).toString());
  }

  /**
   * @return the document uri of the document entry for this session
   */
  public String getDocUri()
  {
    return docUri;
  }

  /**
   * @return the document repository of the document entry for this session
   */
  public String getRepository()
  {
    return repoId;
  }

  /**
   * Get the draft descriptor of this document session.
   * 
   * @return the draft descriptor of this session
   */
  public DraftDescriptor getDraftDescriptor()
  {
    return draftDescriptor;
  }

  /**
   * Do close this document session, executes following operations in the method: 1. Save the content. 2. Remove the session from session
   * manager. 3. Reset sequence and clean up the useless draft file. 4. Remove the document session and serving server information from
   * database.
   */
  protected void doClose(boolean inWork, boolean discard)
  {
    // 1. Apply all messages to draft.
    applyAll(DraftAction.CLOSE);

    // 2. Remove the session from session manager.
    boolean removed = SessionManager.getInstance().removeSession(sessionId);

    // 3. Reset sequence and clean up the useless draft file.
    if (removed)
    {
      // If current server sequence is near the max value of a Long variable, it may overflow, so
      // reset the message base sequence to 0 in draft file "msg.json" after apply all the messages.
      try
      {
        // Assumes that there are 10 clients will generate 240000(10*120*200) messages in 120(Default LTPA timeout) minutes.
        if ((MAX_SEQ_VALUE - getServerSeq()) <= 240000 && transformedList.size() == 0)
        {
          boolean success = DraftStorageManager.getDraftStorageManager().resetMsgBaseSeq(draftDescriptor);
          if (success)
          {
            setBaseSeq(0);
            setSavedSeq(0);
          }
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Can not reset the message base sequence to 0 in msg.json", e);
      }

      // clear the useless files created in the session
      ds.clearup(draftDescriptor);

      try
      {
        JSONObject metaJson = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDescriptor);
        metaJson.put(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey(), AtomDate.valueOf(Calendar.getInstance()).getValue());
        DraftStorageManager.getDraftStorageManager().setDraftMeta(draftDescriptor, metaJson);
        // also update doc_history database to track the last visit timestamp
        IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
        IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
        String repId = docEntry.getRepository();
        String docUri = docEntry.getDocUri();
        DocHistoryBean bean = docHisotryDAO.get(repId, docUri);
        if (bean != null)
        {
          bean.setDLastVisit(Calendar.getInstance().getTime());
          docHisotryDAO.updateDraftLastVisit(bean);
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "cannot update meta.json file for draft:" + draftDescriptor, e);
      }

      try
      {
        // Remove the session information in database after the document session is closed.
        DocumentSessionService service = DocumentSessionService.getInstance();
        service.unServeDocument(repoId, docUri);
        RepositoryServiceUtil.notifySessionEventToRepository(docEntry, EDIT_SESSION_CLOSE);
      }
      catch (Exception ex)
      {
        LOG.log(Level.WARNING, "Exception happens while unserving the document in this server.", ex);
      }
      /**
       * Intentionally disable snapshot generation for 50851
       */
      /*
       * try { DraftStorageManager.getDraftStorageManager().generateSnapshotFromDraft(draftDescriptor); } catch (ConcordException e) {
       * LOG.log(Level.SEVERE, "Exception happens while generating snapshot", e); }
       */
    }

    SessionManager.getInstance().notifySessionClosed(this, inWork, discard);

    // Remove draft state by the end of session close, so that memory could be released.
    // This should later than any meta/draft operation when close session.
    DraftState.DRAFTS_STATE.remove(draftDescriptor.getDocId());

    LOG.info(new ActionLogEntry(caller, Action.CLOSESESSION, docUri, null).toString());
  }

  /**
   * Close the document session synchronously or asynchronously according to the parameter 'sync'.
   * 
   * @param sync
   *          specifies whether closing the session synchronously
   */
  protected void close(boolean sync, boolean discard)
  {
    isInCoEditing = false;

    if (sync || getUnAppliedMsgCount() == 0)
    {
      doClose(false, discard);
    }
    else
    {
      // Trigger a closing work that being executed in another thread managed by auto saving work manager.
      triggerCloseWork();
    }
  }

  /**
   * Get participant by user to check if there are existing same user that join the session from different browser at the same time or not.
   * 
   * @param caller
   * @return
   */
  private Participant getParticipantByUser(UserBean caller)
  {
    String userId = caller != null ? caller.getId() : null;
    if (userId != null)
    {
      Participant participants[] = getParticipants();
      for (Participant participant : participants)
      {
        UserBean pUser = participant != null ? participant.getUserBean() : null;
        if (pUser != null && userId.equals(pUser.getId()))
        {
          return participant;
        }
      }
    }
    return null;
  }

  /**
   * Kick out the participant from the clients map because the same user joined the session from different browsers.
   * 
   * @param clientId
   *          indicates the client id of the participant that will be kicked out from the session
   */
  private void kickOutParticipant(String clientId, boolean kickOut)
  {
    synchronized (clientMap)
    {
      Participant participant = this.getParticipant(clientId);
      if (participant != null)
      {
        clientMap.remove(clientId);

        removeFromOrderedCache(participant);

        cannotJoinUsers.remove(clientId);
        if (cannotJoinUsers.isEmpty())
        {
          cannotJoinErrorCode = 0;
        }

        if (kickOut)
        {
          kickedOutClientMap.put(clientId, participant);
        }

        lastChangedDate = Calendar.getInstance().getTime();

        LOG.log(Level.INFO, "Participant {0} is kicked out from session {1}.", new Object[] { clientId, docUri });
      }
    }
  }

  /**
   * Check whether there are the same user joined the document session from different browsers or not. If find the same user in the document
   * session, then kick out the previous participant from this document session.
   * 
   * @param caller
   *          specifies the user that is going to be checked
   * @param clientId
   *          specifies the id of client that is going to be checked
   */
  private void checkDuplicateUser(UserBean caller, String clientId)
  {
    Participant prev = getParticipantByUser(caller);
    if (prev != null && !prev.getClientId().equals(clientId))
    {
      // Kick out previous participant, because the same user joined the document session from different browsers.
      kickOutParticipant(prev.getClientId(), true);
      removeOTContext(prev.getClientId());
    }

    if (prev == null && getParticipant(clientId) != null)
    {
      // Kick out previous participant, because the different users joined the document session sequentially from same browser.
      kickOutParticipant(clientId, false);
      removeOTContext(clientId);
    }

  }

  /**
   * Before join the session, check if all editors have entitlement for co-editing or not, if not, then can not join the session.
   * 
   * @param caller
   *          indicates the current user that is going to join the session
   * @param clientId
   *          indicates the current client id that is going to join the session
   * @throws DocumentSessionException
   */
  private void checkEntitlement(UserBean caller, String clientId) throws DocumentSessionException
  {
    IEntitlementService service = (IEntitlementService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(
        IEntitlementService.class);

    Participant participants[] = getParticipants();
    int count = participants != null ? participants.length : 0;
    if (getParticipant(clientId) == null)
    {
      int errorCode = 0;
      String message = "";
      if (count > 1)
      {
        // Check the entitlement of the user that is going to join the session.
        boolean isUserEntitled = service.isEntitled(caller, IEntitlementService.ENTITLE_NAME_COEDIT);
        if (!isUserEntitled)
        {
          cannotJoinErrorCode = errorCode = DocumentSessionException.ERR_PT_NOENTITLED_COEDIT;
          message = "You can not join the session, because you are not entitled for co-editing and other users are editing this file";
        }
      }
      else if (count == 1)
      {
        // Check the entitlement of the users that is going to join the session and has joined the session.
        boolean[] isUsersEntitled = service.isEntitled(new UserBean[] { caller, participants[0].getUserBean() },
            IEntitlementService.ENTITLE_NAME_COEDIT);
        if (isUsersEntitled != null && isUsersEntitled.length > 0 && !isUsersEntitled[0])
        {
          errorCode = DocumentSessionException.ERR_PT_NOENTITLED_COEDIT;
          cannotJoinErrorCode = isUsersEntitled.length > 1 && !isUsersEntitled[1] ? DocumentSessionException.ERR_PT_NOENTITLED_COEDIT2
              : errorCode;
          message = "You can not join the session, because you are not entitled for co-editing and other users are editing this file";
        }
        else if (isUsersEntitled != null && isUsersEntitled.length > 1 && !isUsersEntitled[1])
        {
          cannotJoinErrorCode = errorCode = DocumentSessionException.ERR_PT_NOENTITLED_COEDIT2;
          message = "You can not join the session, because another user is editing the file and is not entitled for co-editing";
        }
      }

      if (errorCode != 0)
      {
        // Store the users which can not join the session into the 'cannotJoinUsers', so that can show the warning message to users who is
        // editing the file,
        // the warning message talks which users want to join the editing session but cannot join the session because of no entitlement for
        // co-editing.
        String displayName = caller.getDisplayName();
        for (int index = 0; index < count; index++)
        {
          String theClientId = participants[index].getClientId();
          HashSet<String> userSet = cannotJoinUsers.get(theClientId);
          if (userSet == null)
          {
            userSet = new HashSet<String>();
            cannotJoinUsers.put(theClientId, userSet);
          }
          userSet.add(displayName);
        }

        LOG.log(Level.WARNING, "{0}, error code is {1} in session {2}.", new Object[] { message, errorCode, docUri });
        DocumentSessionException ex = new DocumentSessionException(message, errorCode);
        ex.setData(participants);
        throw ex;
      }
    }
  }

  /**
   * Check whether the count of the participants exceeds the max number of participants or not.
   * 
   * @throws DocumentServiceException
   */
  private void checkMaxParticipants() throws DocumentServiceException
  {
    int limitPerSession = SessionConfig.getMaxUsersPerSession();
    if (limitPerSession > 0 && getParticipantsCount() >= limitPerSession)
    {
      DocumentServiceException dse = new DocumentServiceException(DocumentServiceException.EC_DOCUMENT_EXCEED_MAX_USERS_PER_SESSION_ERROR);
      dse.getData().put("limitPerSession", limitPerSession);
      throw dse;
    }
  }

  /**
   * Join this document session to start editing the document.
   * 
   * @param caller
   *          indicates the current user that is going to join the session
   * @param clientId
   *          indicates the current client id that is going to join the session
   * @param checkEntitlement
   *          indicates that if check the 'co-edit' entitltment of the editor or not
   * @return
   * @throws DocumentServiceException
   * @throws DocumentSessionException
   */
  public Participant join(UserBean caller, String clientId, boolean checkEntitlement) throws DocumentSessionException,
      DocumentServiceException, Exception
  {
    Participant p = null;
    synchronized (clientMap)
    {
      // When the client joined, if this participant is in the kicked out map, should remove it from this map.
      if (kickedOutClientMap.containsKey(clientId))
      {
        kickedOutClientMap.remove(clientId);
      }

      checkDuplicateUser(caller, clientId);

      if (checkEntitlement)
      {
        checkEntitlement(caller, clientId);
      }

      p = clientMap.get(clientId);
      if (p == null)
      {
        checkMaxParticipants();

        Date now = Calendar.getInstance().getTime();
        p = new Participant(caller, clientId, now, getServerSeq());
        clientMap.put(clientId, p);

        addToOrderedCache(p);

        // start message dispatcher, if more than two users
        if (clientMap.size() == 2)
        {
          isInCoEditing = true;

          // Only spreadsheet and presentation need the OTContext, text does not need.
          if ("sheet".equalsIgnoreCase(docType) || "pres".equalsIgnoreCase(docType))
          {
            OTContext = ds.genOTContext(draftDescriptor);
          }
        }
        lastChangedDate = now;

        LOG.info(new ActionLogEntry(caller, Action.JOINSESSION, docUri, "clientId: " + clientId + ", pCount: " + getParticipantsCount())
            .toString());
      }
      else
      {
        p.updateCurrentSeq(getServerSeq());
        p.updateReportTime(Calendar.getInstance().getTime());
      }
      removeOTContext(p.getClientId());
      daoRecentFiles = (IDocRecentsDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(IDocRecentsDAO.class);
      if (daoRecentFiles != null)
      {
        if (RepositoryServiceUtil.supportRecentFiles(this.repoId))
        {// don't record ecm/ccm/cmis files in recent files list because they are temporary draft
          daoRecentFiles.add(caller.getId(), this.repoId, this.docUri);
        }
      }

      SessionManager.getInstance().notifyUserJoin(this, caller, clientId);
    }
    return p;
  }

  /**
   * Some client is going to leave from this document session.
   * 
   * @param clientId
   *          indicates the id of client that is going to leave the session
   * @param data
   *          indicates data sent by client while the client is leaving, current it is only used by spreadsheet
   */
  public void leave(String clientId, JSONObject data)
  {
    boolean isCloseSession = false;
    synchronized (clientMap)
    {
      Participant p = clientMap.get(clientId);
      if (p != null)
      {
        clientMap.remove(clientId);

        removeFromOrderedCache(p);

        cannotJoinUsers.remove(clientId);
        if (cannotJoinUsers.isEmpty())
        {
          cannotJoinErrorCode = 0;
        }
        if (data != null)
        {
          ds.processLeaveData(p.getUserBean(), this.docUri, data);
        }

        removeOTContext(clientId);

        LOG.info(new ActionLogEntry(p.getUserBean(), Action.LEAVESESSION, docUri, "clientId: " + clientId).toString());
      }

      if (!clientMap.isEmpty())
      {
        if (clientMap.size() == 1)
        {
          isInCoEditing = false;
        }
        Date now = Calendar.getInstance().getTime();
        lastChangedDate = now;
      }
      else
      {
        isCloseSession = true;
      }
      if (p != null)
      {
        lastLeaver = p.getUserBean();
        SessionManager.getInstance().notifyUserLeave(this, p.getUserBean(), clientId);
      }
    }

    if (isCloseSession)
    {
      SessionManager.getInstance().closeSession(sessionId, false, false);
    }

    EditorsListUtil.removeEditorsList(repoId, docUri);
  }

  /**
   * Check whether there exists any participant in this document session.
   * 
   * @return true if there is no participant in this session, otherwise false
   */
  protected boolean isEmpty()
  {
    synchronized (clientMap)
    {
      return clientMap.isEmpty();
    }
  }

  /**
   * Check whether specified client has been kicked out or not.
   * 
   * @param clientId
   *          specifies the id of client being checked
   * @return true if specified client has been kicked out
   */
  public boolean isKickedOut(String clientId)
  {
    boolean isKickedOut = false;
    synchronized (clientMap)
    {
      isKickedOut = kickedOutClientMap.containsKey(clientId);
    }
    return isKickedOut;
  }

  /**
   * Get the kicked out participant from the kicked out clients map according to the client id.
   * 
   * @param clientId
   *          specifies the id of client has been kicked out
   * @return the found kicked participant, null if did not find the participant
   */
  public Participant getKickedParticipant(String clientId)
  {
    synchronized (clientMap)
    {
      return kickedOutClientMap.get(clientId);
    }
  }

  /**
   * Get the error code that presents why the users cannot join the session.
   * 
   * @return the error code that presents why the users cannot join session
   */
  public int getCannotJoinErrorCode()
  {
    return this.cannotJoinErrorCode;
  }

  /**
   * Get the display names of users who want to join the session but can not join. These names will be shown to each client that is doing
   * co-edit, and these names are removed from the map after being retrieved.
   * 
   * @param clientId
   *          specifies the id of the client that the cannot join user list being shown to
   * @return the names of users who want to join the session but can not join
   */
  public String[] getCannotJoinUsers(String clientId)
  {
    HashSet<String> userSet = cannotJoinUsers.get(clientId);
    if (userSet != null && !userSet.isEmpty())
    {
      String[] users = userSet.toArray(new String[0]);
      userSet.clear();
      return users;
    }
    return null;
  }

  /**
   * Answers if this document is co-edited by multiple users currently.
   * 
   * @return true the document is co-edited by multiple users, otherwise false
   */
  public boolean isCoEditing()
  {
    return isInCoEditing;
  }

  /**
   * Get the participant of this document session by the client id.
   * 
   * @param clientId
   *          specifies the client id
   * @return participant if find by the client id, null otherwise
   */
  public Participant getParticipant(String clientId)
  {
    synchronized (clientMap)
    {
      return clientMap.get(clientId);
    }
  }

  /**
   * Get all the participants of this document session.
   * 
   * @return all the participants of this document session
   */
  public Participant[] getParticipants()
  {
    synchronized (clientMap)
    {
      int size = clientMap.values().size();
      return clientMap.values().toArray(new Participant[size]);
    }
  }

  public void addToOrderedCache(Participant p)
  {
    orderedClientCache.put(p.getJoinTime(), p);
    cacheUpdated = true;
  }

  public void removeFromOrderedCache(Participant p)
  {
    orderedClientCache.remove(p.getJoinTime());
    cacheUpdated = true;
  }

  public Participant[] getOrderedParticipants()
  {
    if (cacheUpdated)
    {
      int size = orderedClientCache.size();
      orderedClient = orderedClientCache.values().toArray(new Participant[size]);
      cacheUpdated = false;
    }
    return orderedClient;

  }

  /**
   * Serialize participants list
   */
  public JSONArray participantsToJSON()
  {
    Participant pList[] = getOrderedParticipants();
    int length = pList != null ? pList.length : 0;
    JSONArray a = new JSONArray(length);
    for (int index = 0; index < length; index++)
    {
      Participant p = pList[index];
      UserBean bean = p.getUserBean();
      JSONObject json = bean.toJSON();
      json.put("client_id", p.getClientId());
      // Add join-time into the JSON data
      Date joinDate = p.getJoinTime();
      if (joinDate != null)
        json.put("join_time", String.valueOf(joinDate.getTime()));
      // End of add join-time into the JSON data
      a.add(json);
    }
    return a;
  }

  /**
   * Get all the participants have been kicked out from this document session.
   * 
   * @return the array of participants that have been kicked out
   */
  public Participant[] getKickedParticipants()
  {
    synchronized (clientMap)
    {
      int size = kickedOutClientMap.values().size();
      return kickedOutClientMap.values().toArray(new Participant[size]);
    }
  }

  /**
   * Remove the participant from the kicked out participants' client map.
   * 
   * @param clientId
   *          specifies the id of the client has been kicked out
   */
  public void removeKickedParitcipant(String clientId)
  {
    synchronized (clientMap)
    {
      Participant p = kickedOutClientMap.get(clientId);
      if (p != null)
      {
        kickedOutClientMap.remove(clientId);
        LOG.info("Remove the kicked out participant " + p.getUserBean().getId() + ", " + clientId + " from " + docUri);
      }
    }
  }

  /**
   * Get the count of participants in this document session.
   * 
   * @return the count of participants in this document session
   */
  public int getParticipantsCount()
  {
    synchronized (clientMap)
    {
      return clientMap.values().size();
    }
  }

  /**
   * Get the secure token of this document session.
   * 
   * @return the secure token of this document session
   */
  public String getSecureToken()
  {
    return secureToken;
  }

  /**
   * Get the last time that the participants in this document session have been changed.
   * 
   * @return the last time that the participants in this document session have been changed
   */
  public Date getLastChangedDate()
  {
    return lastChangedDate;
  }

  /**
   * Get sequence number of the saved document model
   * 
   * @return base sequence number
   */
  public long getBaseSeq()
  {
    return baseSeq;
  }

  /**
   * Set sequence number of the saved document model.
   * 
   * @param seq
   */
  private void setBaseSeq(long seq)
  {
    baseSeq = seq;
  }

  /**
   * Get the total string length of messages message queue.
   * 
   * @return
   */
  private long getMessageStringsSize()
  {
    return this.messageStringsSize;
  }

  /**
   * Get the number of the messages that are not applied into document content.
   * 
   * @return the number of messages that are not applied into document content
   */
  private long getUnAppliedMsgCount()
  {
    synchronized (transformedList)
    {
      return (baseSeq + transformedList.size() - savedSeq) + bufferedMsgNumber;
    }
  }

  /**
   * If the DocumentSession contains un-saved contents message
   */
  public boolean isSessionDirty()
  {
    if (getMessageStringsSize() > 0)
      return true;
    return false;
  }

  /**
   * Get sequence number which has been saved, including the saved document model, and saved messages
   * 
   * @return saved sequence number
   */
  public long getSavedSeq()
  {
    return savedSeq;
  }

  /**
   * Set sequence number which has been saved, including the saved document model, and saved messages.
   * 
   * @param seq
   */
  public void setSavedSeq(long seq)
  {
    savedSeq = seq;
  }

  /**
   * Get latest sequence number of message in this session.
   * 
   * @return latest sequence number that server can see
   */
  public long getServerSeq()
  {
    synchronized (transformedList)
    {
      return baseSeq + transformedList.size();
    }
  }

  /**
   * Answers if document in memory is not synchronized with what's in storage.
   * 
   * @return true if not synchronized, false otherwise
   */
  public boolean outOfSync()
  {
    return (transformedList.size() > 0 || bufferedMsgNumber > 0);
  }

  /**
   * Get minimum sequence number which all clients have
   * 
   * @return
   */
  public long getMinSeq()
  {
    long min = Long.MAX_VALUE;
    Participant pList[] = getParticipants();
    for (Participant p : pList)
    {
      if (min > p.getCurrentSeq())
      {
        min = p.getCurrentSeq();
      }
    }
    return min;
  }

  /**
   * Get each document session's ot context for example, presentation use this for lock/release
   */

  public JSONObject getOTContext()
  {
    JSONObject otContext = null;

    if (ds != null)
      otContext = ds.OTContextSerialize(draftDescriptor);
    else
      otContext = new JSONObject();

    return otContext;
  }

  /**
   * For presentation editor, this method will remove a client's lock information
   * 
   * @param draftDes
   * @param clientId
   */
  public void removeOTContext(String clientId)
  {
    if (ds != null)
      ds.removeOTContext(draftDescriptor, clientId);
  }

  /**
   * Receive the messages and process these messages.
   * 
   * @param msgList
   *          message list that received
   * @param p
   *          the participant who send the messages to server
   * @return the new server sequence
   */
  public long receiveMessage(JSONArray msgList, Participant p)
  {
    int size = msgList.size();
    if (p != null)
    {
      for (int i = 0; i < size; i++)
      {
        JSONObject msg = (JSONObject) msgList.get(i);
        boolean isServerMsg = false;
        Object ob = msg.get(MessageConstants.IS_SERVER_MSG);
        if (ob != null)
        {
          isServerMsg = Boolean.parseBoolean(ob.toString());
        }
        if (!isServerMsg)
          msg = ds.processSuspiciousContent(msg);
        msg.put(MessageConstants.CLIENT_ID, p.getClientId());
        msg.put(MessageConstants.USER_ID, p.getUserBean().getId());
        processCommentsMessage(msg, p);
      }
    }

    if (LOG.isLoggable(Level.FINEST))
    {
      for (int i = 0; i < size; i++)
      {
        JSONObject jsonMsg = (JSONObject) msgList.get(i);
        traceIncomingMessage(jsonMsg);
      }
    }

    boolean bCoediting = isCoEditing();
    synchronized (msgProcessLock)
    {
      try
      {
        List<Message> msgs = new ArrayList<Message>();
        for (int index = 0; index < size; index++)
        {
          JSONObject jsonMsg = (JSONObject) msgList.get(index);
          Message msg = new Message(jsonMsg);

          if (msg.isControlMsg())
          {
            // Control message does not have quality of service support, just publish it
            this.publishControlMessage(msg);
            continue;
          }
          else if (msg.isClientLogMsg())
          {
            this.recordClientLog(msg);
            continue;
          }

          if (!validateMessage(msg, p))
          {
            continue;
          }

          if (processMessage(msg, bCoediting) == null)
          {
            continue;
          }

          msgs.add(msg);
        }

        if (!msgs.isEmpty())
        {
          lastModifier = p.getUserBean();
          SessionManager.getInstance().notifyMessageReceived(this, p.getUserBean(), p.getClientId());
        }

        publishContentMessage(msgs);
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Error happens while process messages in " + (bCoediting ? "co-editing" : "single-editing") + " mode", e);
      }
    }

    return getServerSeq();
  }

  /**
   * Process the message, includes resolve the conflict message, transform message if it's in co-editing mode, then put into message list.
   * 
   * @param msg
   *          specifies the message being processed
   * @param bCoediting
   *          specifies if it's co-editing mode or not
   * @return the message if process the message successfully, null if it's not a valid message or it's a resolving conflict message
   */
  protected Message processMessage(Message msg, boolean bCoediting)
  {
    // this message is used to resolve a conflict client
    // this message will not be published to other clients
    // this client will rollback all it's local change, clean
    // waitingList and sendoutList, then send out this resolve conflict message
    if (msg.isResolveConflictMessage())
    {
      resolveConflictClient(msg.getClientId());
      return null;
    }

    // check the client is in conflict status or not
    // will discard it directly if it's still conflict
    if (!validateClientConflict(msg))
      return null;

    synchronized (transformedList)
    {
      TransformResult state = TransformResult.ACCEPT;
      if (bCoediting)
      {
        JSONArray baseList = findTransformBase(msg);
        if (baseList == null)
        {
          // this is an invalid message, just skip it.
          return null;
        }

        try
        {
          state = ds.transformMessage(msg.toJSON(), baseList, OTContext);
        }
        catch (Exception e)
        {
          // catch all the exception, which means this message is something wrong,
          // and server cannot accept it. then mark this message as rejected.
          // when sender receive this message, the sender client need to reload
          // when other client receive this message, just ignore it
          LOG.log(Level.WARNING, "OT error for message, docId: " + docUri + "; message: " + msg.toJSON().toString(), e);
          msg.setControlType(MessageConstants.CONTROL_TYPE_REJECT);
        }
      }

      if (state == TransformResult.ACCEPT)
      {
        long seq = getServerSeq() + 1;
        msg.setServerSeq(seq);
        transformedList.add(msg);

        if (msg.isAsControlMsg())
        {
          addAsCtrlMsgAmount(1);
        }
        else
        {
          messageStringsSize += msg.getSize();
        }

        if (LOG.isLoggable(Level.FINEST))
        {
          traceTransformedMessage(msg.toJSON());
        }
        return msg;
      }
      else if (state == TransformResult.CONFLICT)
      {
        registerConflictClient(msg.getClientId());
        return null;
      }
    }

    return null;
  }

  /**
   * Get the list of messages of which the type are server message.
   * 
   * @return
   */
  public List<Message> readHBPendingList()
  {
    List<Message> ret = hbPendingList;
    hbPendingList = new ArrayList<Message>();
    return ret;
  }

  /**
   * Publish the messages from server to clients in co-editing mode.
   * 
   * @param msgs
   *          specifies the content messages being published
   */
  private void publishContentMessage(List<Message> msgs)
  {
    if (msgs == null || msgs.size() <= 0)
    {
      LOG.log(Level.FINE, "The message list is empty, nothing is needed to be published");
      return;
    }

    if (this.isCoEditing())
    {
      JSONArray out = new JSONArray();
      for (int i = 0; i < msgs.size(); i++)
      {
        JSONObject wrapper = new JSONObject();
        wrapper.put("type", "content");
        wrapper.put("msg", msgs.get(i).toJSON());
        out.add(wrapper);
      }

      publishMessage("/" + repoId + "/" + docUri + "/" + secureToken, out.toString());
    }
    else
    // if (msg.isServerMessage())
    {
      // server generated messages need to be delivered to client by heart beat append the message to heart beat queue
      for (int i = 0; i < msgs.size(); i++)
      {
        Message msg = msgs.get(i);
        if (msg.isServerMessage())
          hbPendingList.add(msg);
      }
    }
  }

  /**
   * Publish the messages from server to all clients through message pushing engine.
   * 
   * @param channel
   *          specifies the channel that the message being published to
   * @param msgText
   *          specifies the message text being published
   */
  private void publishMessage(String channel, String msgText)
  {
    webMsgAdapter.publishMessage(channel, msgText);
  }

  /**
   * Register the client into the conflict client list when the client has conflict message.
   * 
   * @param clientId
   *          the id of the client
   */
  private void registerConflictClient(String clientId)
  {
    synchronized (conflictClients)
    {
      if (!conflictClients.contains(clientId))
        conflictClients.add(clientId);
    }
  }

  /**
   * Remove the client from the conflict client list.
   * 
   * @param clientId
   *          the id of the client
   */
  private void resolveConflictClient(String clientId)
  {
    synchronized (conflictClients)
    {
      if (conflictClients.contains(clientId))
        conflictClients.remove(clientId);
    }
  }

  /**
   * Check whether the client sending the message is conflict client or not.
   * 
   * @param msg
   *          message itself
   * @return TRUE if not in conflict state
   */
  private boolean validateClientConflict(Message msg)
  {
    String clientId = msg.getClientId();
    // the client hasn't resolve conflict yet
    synchronized (conflictClients)
    {
      if (conflictClients.contains(clientId))
        return false;
    }
    return true;
  }

  /**
   * check if this message is valid to be processed maybe a duplicated message, or unresolved conflict
   * 
   * @param msg
   *          the message being validated
   * @param p
   *          the participant that the message belongs to
   * @return TRUE if valid
   */
  private boolean validateMessage(Message msg, Participant p)
  {
    String clientId = msg.getClientId();
    // conflicted message still need to be put in waitingList
    // when process the message, will check if it's from a conflicted client,
    // then discard it.
    // if(!validateClientConflict(msg))
    // return false;

    // server generated message will not be controlled by client sequence
    if (msg.isServerMessage())
      return true;

    // check the message's server sequence base to see if it's an valid message.
    if (!validateServerSequence(msg))
      return false;

    // check duplication
    long clientSeq = msg.getClientSeq();

    if (p == null)
    {
      // this client has left? now we cannot validate it's message anymore, just ignore it
      LOG.info("docId:" + docUri + "; A client has left while validating it's message. message:" + msg.toJSON());
      return false;
    }

    if (clientSeq <= p.getClientSeq())
    {
      // receive a duplicate message
      if (LOG.isLoggable(Level.INFO))
      {
        LOG.info("duplicated message: doc " + docUri + ", clientId " + clientId + ", clientSeq " + clientSeq);
      }
      return false;
    }

    // update this client's recorded sequence
    p.updateClientSeq(clientSeq);
    return true;
  }

  /**
   * Check if the messages's server sequence is valid or not.
   * 
   * @param msg
   *          the message being checked
   * @return true if the sequence is valid, otherwise false
   */
  private boolean validateServerSequence(Message msg)
  {
    synchronized (transformedList)
    {
      long serverSeq = msg.getServerSeq();
      long size = transformedList.size();
      long off = serverSeq - this.baseSeq;
      if (off < 0 || off > size)
      {
        LOG.warning("Error sequence: doc=" + docUri + ",message=" + serverSeq + ",base=" + baseSeq + ",saved=" + savedSeq
            + ", transformed=" + size);
        return false;
      }
      return true;
    }
  }

  /**
   * put the user_id and user_name in comments message on server side. It's unsafe to trust the information from client.
   * 
   * @param msg
   * @param p
   */
  private void processCommentsMessage(JSONObject msg, Participant p)
  {
    Object type = msg.get(MessageConstants.MESSAGE_TYPE_KEY);
    String strType = (type != null) ? type.toString() : null;
    if (strType != null && strType.equalsIgnoreCase(MessageConstants.COMMENTS_STATE_KEY))
    {
      Object action = msg.get("action");
      String straction = (action != null) ? action.toString() : null;
      if (("pres".equalsIgnoreCase(docType) && straction != null && !straction.equalsIgnoreCase("update"))
          || !"pres".equalsIgnoreCase(docType))
      {
        JSONObject data = (JSONObject) msg.get("data");
        if (data != null)
        {
          data.put("uid", p.getUserBean().getId());
          data.put("name", p.getUserBean().getDisplayName());
        }
      }
    }
  }

  /**
   * Find the messages list that do transform for specified message based on.
   * 
   * @param msg
   *          specifies the message being transformed
   * @return message list that do transform for specified message based on
   */
  private JSONArray findTransformBase(Message msg)
  {
    JSONArray list = new JSONArray();
    if (msg.isServerMessage())
      return list;

    if (!validateServerSequence(msg))
    {
      return null;
    }

    long serverSeq = msg.getServerSeq();
    Long off = serverSeq - this.baseSeq;

    for (int i = off.intValue(); i < transformedList.size(); i++)
    {
      JSONObject compareMsgJSON = transformedList.get(i).toJSON();
      JSONObject msgJSON = msg.toJSON();
      if (ds.isTransformCandidate(compareMsgJSON, msgJSON))
      {
        list.add(compareMsgJSON);
      }
    }

    return list;
  }

  /**
   * Check whether should do auto saving or not, if yes, then trigger auto saving work. The condition of triggering auto saving work is:
   * Transform message list size is bigger than MAX_MSGLIST_SIZE, or auto saving interval is bigger than interval time.
   * 
   */
  public void checkAutoSave()
  {
    try
    {
      // Clear the messages that have been saved and got by all the clients.
      clearMessages();

      long now = Calendar.getInstance().getTime().getTime();
      long interval = now - lastSaveMsgTime;
      long asCtrlMsgAmount = getAsCtrlMsgAmount();
      int maxApplyMsgSize = this.isCoEditing() ? MAX_APPLY_MSG_SIZE_FOR_COEDIT : MAX_APPLY_MSG_SIZE_FOR_SINGLE;
      int maxSaveMsgSize = this.isCoEditing() ? MAX_SAVE_MSG_SIZE_FOR_COEDIT : MAX_SAVE_MSG_SIZE_FOR_SINGLE;
      if ((getUnAppliedMsgCount() - asCtrlMsgAmount) > maxApplyMsgSize || getMessageStringsSize() > MAX_APPLYMSG_MEMSIZE)
      {
        triggerAutoSave(AutoSaveService.SAVE_TYPE_APPLYMSG);
      }
      else if (interval < 0 || interval > HB_INTERVAL || (getServerSeq() - savedSeq - asCtrlMsgAmount) > maxSaveMsgSize)
      {
        triggerAutoSave(AutoSaveService.SAVE_TYPE_SAVEMSG);
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exception happens while check auto saving for document: " + docUri, ex);
    }
  }

  /**
   * Call auto saving service to trigger auto saving.
   * 
   * @param type
   *          specifies the saving operation type
   */
  private void triggerAutoSave(int type)
  {
    AutoSaveService service = AutoSaveService.getInstance();
    service.triggerAutoSave(sessionId, type);
  }

  /**
   * Trigger a work being executed in a thread managed by auto saving work manager to close the document session.
   * 
   */
  private void triggerCloseWork()
  {
    LOG.log(Level.FINER, "Start session closing work for document {0}.", sessionId);
    try
    {

      SessionCloseWork work = new SessionCloseWork(sessionId, URLConfig.getRequestCookies());
      Platform.getAutoPublishWorkManager().startWork(work);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Exception happens while starting session closing work for document " + sessionId, e);
    }
  }

  /**
   * Save the unsaved messages in queue to msg.json and delete the messages which the sequences of are less than the minimum sequence.
   * 
   * @return true if save the messages successfully, otherwise false
   */
  public boolean saveMessages()
  {
    long toSequence = getMinSeq();
    synchronized (savingLock)
    {
      try
      {
        long saveStartSeq;
        JSONArray msgsToBeSaved = new JSONArray();
        synchronized (transformedList)
        {
          if (getBaseSeq() > toSequence || toSequence > getServerSeq())
          {
            LOG.log(Level.WARNING, "Bad sequence: base=" + getBaseSeq() + ";server=" + getServerSeq() + ";to=" + toSequence);
            return false;
          }

          // Put the messages that being moved to msg.json into the array.
          saveStartSeq = getSavedSeq() < getBaseSeq() ? getBaseSeq() : getSavedSeq();
          long startIndex = saveStartSeq - getBaseSeq();
          long size = transformedList.size();
          Message msg = null;
          for (long index = startIndex; index < size; index++)
          {
            msg = transformedList.get((int) index);
            if (msg.isAsControlMsg())
            {
              msgsToBeSaved.add(Message.SAVED_AS_CTRL_MSG);
            }
            else
            {
              msgsToBeSaved.add(msg.toJSON());
            }
          }
        }

        // Append the messages into the end of file msg.json.
        DraftStorageManager dsm = DraftStorageManager.getDraftStorageManager();
        int result = dsm.appendMessages(draftDescriptor, msgsToBeSaved);

        // Delete the messages that have been appended to msg.json from message queue.
        synchronized (transformedList)
        {
          long savedSeq = saveStartSeq + result;
          long newBaseSeq = savedSeq > toSequence ? toSequence : savedSeq;
          long removedCount = newBaseSeq - getBaseSeq();
          if (removedCount > 0)
          {
            for (long index = 0; index < removedCount; index++)
            {
              transformedList.remove(0);
            }
            setBaseSeq(newBaseSeq);
          }
          bufferedMsgNumber += result;
          setSavedSeq(savedSeq);
          resetAsCtrlMsgAmount();

          if (LOG.isLoggable(Level.FINE))
          {
            LOG.log(Level.FINE, "Saving messages successfully, saveStartSeq: " + saveStartSeq + ", baseSeq: " + getBaseSeq()
                + ", savedSeq: " + getSavedSeq() + ", serverSeq: " + getServerSeq());
          }
        }

        // Update the last time stamp when saving messages from message queue to msg.json.
        lastSaveMsgTime = Calendar.getInstance().getTime().getTime();
        return true;
      }
      catch (Exception ex)
      {
        LOG.log(Level.WARNING, "Error while purging messages: " + docUri, ex);
      }
    }
    return false;
  }

  public void autoSave()
  {
    saveState(getMinSeq(), DraftAction.AUTOSAVE);
  }

  /*
   * called when in some context that the caller want all messages being applied to draft storage directly BE CAREFUL of using this method,
   * coz will clean all transformed messages.
   */
  private void applyAll(DraftAction action)
  {
    saveState(getServerSeq(), action);
  }

  /**
   * Apply all the messages of message queue and msg.json to document content in draft.
   * 
   * @param toSequence
   * @return
   */
  private boolean saveState(long toSequence, DraftAction action)
  {
    synchronized (savingLock)
    {
      try
      {
        long serverSequence;
        JSONArray msgsToBeApplied = new JSONArray();

        synchronized (transformedList)
        {
          if (getSavedSeq() < getBaseSeq() || getSavedSeq() > getServerSeq())
          {
            LOG.log(Level.WARNING, "Bad sequence: baseSeq=" + getBaseSeq() + ";serverSeq=" + getServerSeq() + ";savedSeq=" + getSavedSeq());
          }

          serverSequence = getServerSeq();
          long saveStartSeq = getSavedSeq() < getBaseSeq() ? getBaseSeq() : getSavedSeq();
          if (saveStartSeq >= getServerSeq() && bufferedMsgNumber == 0)
          {
            // It's already being saved.
            LOG.log(Level.FINE, "It's already being saved, baseSeq {0}, serverSeq {1}, savedSeq {2}, toSequence {3}.", new Object[] {
                getBaseSeq(), getServerSeq(), saveStartSeq, toSequence });
            return false;
          }

          // saveStartSeq -> serverSeq will be applied to document.
          int size = transformedList.size();
          long startIndex = saveStartSeq - getBaseSeq();
          for (long index = startIndex; index < size; index++)
          {
            Message msg = transformedList.get((int) index);
            msgsToBeApplied.add(msg.toJSON());
          }
        }

        // Save the messages to content.
        DraftStorageManager dsm = DraftStorageManager.getDraftStorageManager();
        dsm.saveDraft(draftDescriptor, serverSequence, msgsToBeApplied, action);

        synchronized (transformedList)
        {
          // Remove baseSeq -> toSequence from transformedList
          if ((toSequence - getBaseSeq()) > 0)
          {
            long removedCount = toSequence - getBaseSeq();
            for (long index = 0; index < removedCount; index++)
            {
              transformedList.remove(0);
            }
            setBaseSeq(toSequence);
          }

          // Update savedSeq, bufferedMsgNumber.
          setSavedSeq(serverSequence);
          bufferedMsgNumber = 0;
          messageStringsSize = 0;
          resetAsCtrlMsgAmount();

          if (LOG.isLoggable(Level.FINE))
          {
            LOG.log(Level.FINE, docUri + " saved to: base: " + getBaseSeq() + " saved: " + getSavedSeq());
          }
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "error saving content change to draft: " + docUri, e);
      }
    }
    return true;
  }

  /**
   * Clear the messages that have been saved and got by all the clients.
   * 
   */
  private void clearMessages()
  {
    long toSequence = getMinSeq();

    synchronized (transformedList)
    {
      long newBaseSeq = getSavedSeq() > toSequence ? toSequence : getSavedSeq();
      long removedCount = newBaseSeq - getBaseSeq();
      if (removedCount > 0)
      {
        for (long index = 0; index < removedCount; index++)
        {
          transformedList.remove(0);
        }
        setBaseSeq(newBaseSeq);

        if (LOG.isLoggable(Level.FINER))
        {
          LOG.log(Level.FINER, "Clearing messages successfully, remove count: " + removedCount + ", newBaseSeq: " + newBaseSeq
              + ", savedSeq: " + getSavedSeq() + ", serverSeq: " + getServerSeq());
        }
      }
    }
  }

  /**
   * Get the messages that from start sequence to end sequence.
   * 
   * @param start
   *          specifies the start sequence
   * @param end
   *          specifies the end sequence
   * @return the messages between start sequence and end sequence
   */
  public List<Message> getState(long start, long end)
  {
    List<Message> msgList = new ArrayList<Message>(4);
    synchronized (transformedList)
    {
      start = (start <= 0) ? (getBaseSeq() + 1) : start;
      end = (end == Long.MAX_VALUE) ? getServerSeq() : end;

      if (end == getBaseSeq() || start == (getServerSeq() + 1))
      {
        // Return an empty message list under this condition.
        return msgList;
      }

      long idx = start - getBaseSeq() - 1;
      long len = end - start + 1;

      if ((idx < 0) || (len <= 0) || ((idx + len) > transformedList.size()))
      {
        LOG.log(Level.WARNING, "Bad sequence range: start {0}, end {1}, base {2}, transformedList size {3} for doc {4}.", new Object[] {
            start, end, getBaseSeq(), transformedList.size(), docUri });
        return null;
      }

      for (long i = idx; i < (idx + len); i++)
      {
        msgList.add(transformedList.get((int) i));
      }
    }
    return msgList;
  }

  /**
   * Get current content of the document according to the criteria.
   * 
   * @param criteria
   * @return the document content
   * @throws DraftDataAccessException
   * @throws DraftStorageAccessException
   */
  public JSONObject getCurrentState(JSONObject criteria) throws DraftDataAccessException, DraftStorageAccessException, Exception
  {
    autoSave();

    JSONObject state = null;
    synchronized (savingLock)
    {
      state = ds.getCurrentState(draftDescriptor, null, criteria);
      state.put(MessageConstants.STATE_SEQ_KEY, getSavedSeq());
      state.put(MessageConstants.OTCONTEXT, getOTContext());
      state.put(MessageConstants.PARTICIPANTS, participantsToJSON());
    }

    if (LOG.isLoggable(Level.FINEST) && (getServerSeq() == 0))
    {
      // Only trace the initial content state.
      if (criteria == null || criteria.containsKey(MessageConstants.CONTENT_STATE_KEY))
      {
        traceInitialState(state);
      }
    }
    return state;
  }

  /**
   * Stores the initial content state into the trace file.
   * 
   * @param contentState
   */
  private void traceInitialState(JSONObject contentState)
  {
    if (LOG.isLoggable(Level.FINEST) && getServerSeq() == 0)
    {
      try
      {
        File traceFolder = new File(draftDescriptor.getTempURI(TRACE_FOLDER));
        if (!traceFolder.exists())
        {
          traceFolder.mkdirs();
        }
        File file = new File(traceFolder, TRACE_STATE_0_FILE);
        if (!file.exists())
        {
          file.createNewFile();
        }
        FileWriter fw = new FileWriter(file);
        fw.write(contentState.toString());
        fw.close();
      }
      catch (Throwable e)
      {
        LOG.log(Level.WARNING, "Exception happens when tracing initial state", e);
      }
    }
  }

  /**
   * Stores the incoming messages into the trace file.
   * 
   * @param jsonMsg
   */
  private void traceIncomingMessage(JSONObject jsonMsg)
  {
    if (LOG.isLoggable(Level.FINEST))
    {
      try
      {
        File traceFolder = new File(draftDescriptor.getTempURI(TRACE_FOLDER));
        if (!traceFolder.exists())
        {
          traceFolder.mkdirs();
        }
        File file = new File(traceFolder, TRACE_IN_MSGS_FILE);
        if (!file.exists())
        {
          file.createNewFile();
        }
        FileWriter fw = new FileWriter(file, true);
        fw.write(jsonMsg.toString());
        fw.write("\r\n");
        fw.close();
      }
      catch (Throwable e)
      {
        LOG.log(Level.WARNING, "Exception happens when tracing incoming messages", e);
      }
    }
  }

  /**
   * Stores the outgoing messages into the trace file.
   * 
   * @param jsonMsg
   */
  private void traceTransformedMessage(JSONObject jsonMsg)
  {
    if (LOG.isLoggable(Level.FINEST))
    {
      try
      {
        File traceFolder = new File(draftDescriptor.getTempURI(TRACE_FOLDER));
        if (!traceFolder.exists())
        {
          traceFolder.mkdirs();
        }
        File file = new File(traceFolder, TRACE_OUT_MSGS_FILE);
        if (!file.exists())
        {
          file.createNewFile();
        }
        FileWriter fw = new FileWriter(file, true);
        fw.write(jsonMsg.toString());
        fw.write("\r\n");
        fw.close();
      }
      catch (Throwable e)
      {
        LOG.log(Level.WARNING, "exception when appending transformed msg ", e);
      }
    }
  }

  /**
   * The message was used to record log from client side.
   * 
   * @param msg
   *          The client log message.
   */
  public void recordClientLog(Message msg)
  {
    // If the message is client log, just save it in log.
    if (msg.isClientLogMsg())
      LOG.log(Level.WARNING, "Client Log: User " + msg.getClientId() + " in document " + this.docUri + " log info:" + msg.getLogContent());
  }

  /**
   * Publish the control message to all the clients.
   * 
   * @param msg
   *          the control message being published
   */
  public void publishControlMessage(Message msg)
  {
    if (this.isCoEditing())
    {
      JSONObject wrapper = new JSONObject();
      wrapper.put("type", "control");
      wrapper.put("msg", msg.toJSON());

      publishMessage("/" + repoId + "/" + docUri + "/" + secureToken, wrapper.toString());
    }
  }

  public void publishServerMessage(JSONObject msg)
  {
    JSONObject wrapper = new JSONObject();
    wrapper.put(MessageConstants.IS_SERVER_MSG, true);
    wrapper.put("msg", msg);

    Message message = new Message(wrapper);
    if (this.isCoEditing())
      try
      {
        publishMessage("/" + repoId + "/" + docUri + "/" + secureToken, message.toJSON().serialize());
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "Failed to publish server message", e);
      }
    else
      hbPendingList.add(message);
  }

  /**
   * Publish the activity message to all the clients.
   * 
   * @param msg
   *          the activity message being published
   */
  public void publishActivityMessage(JSONObject msg)
  {
    if (this.isCoEditing())
    {
      JSONObject wrapper = new JSONObject();
      wrapper.put("type", "activity");
      wrapper.put("msg", msg);

      publishMessage("/" + repoId + "/" + docUri + "/" + secureToken, wrapper.toString());
    }
  }

  /**
   * Update the content of specified fragment. It's related with working private document.
   * 
   * @param fragId
   *          specifies the fragment id
   * @param json
   *          specifies the content
   */
  public void updateFragment(String fragId, JSONObject json)
  {
    JSONObject contentJson = (JSONObject) json.get("content");

    // 1 generate fragment update message
    JSONArray ja = new JSONArray();
    JSONObject js = new JSONObject();

    if (docType.equalsIgnoreCase("text"))
    {
      // text document
      String docStr = (String) contentJson.get("html");
      js.put("type", "updateFragment");// message type
      js.put("is_server_msg", true);// client seq

      JSONObject event = new JSONObject();
      event.put("t", "uft");// action type
      event.put("fragId", fragId);
      event.put("data", docStr);
      JSONArray events = new JSONArray();
      events.add(event);
      js.put("updates", events);

    }
    else if (docType.equalsIgnoreCase("sheet"))
    {
      // spreadsheet
      if (fragId != null)
        contentJson.put("fragid", fragId);
      js.put("is_server_msg", true);// client seq

      JSONObject event = new JSONObject();
      event.put("action", "set");// action type
      JSONObject refJSON = new JSONObject();
      refJSON.put("refType", "fragment");
      refJSON.put("refValue", fragId);
      event.put("reference", refJSON);
      event.put("data", contentJson);
      JSONArray events = new JSONArray();
      events.add(event);
      js.put("updates", events);
    }

    ja.add(js);
    // 2 put this server message to queue
    receiveMessage(ja, null);
  }

  /**
   * Get the content of specified section. It's related with working private document.
   * 
   * @param sectionId
   *          specifies the id of the section in draft
   * @return the content of the specified section
   * 
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  public JSONObject getSection(String sectionId) throws DraftStorageAccessException, DraftDataAccessException
  {
    // apply all content first
    autoSave();
    JSONObject section = ds.getSection(draftDescriptor, new JSONArray(), sectionId, repoId + "/" + docUri);
    return section;
  }

  public void setFragmentWorking(UUID id, JSONObject section, String data)
  {
    // 1 generate fragment working message
    JSONArray ja = new JSONArray();
    JSONObject js = new JSONObject();

    if (docType.equalsIgnoreCase("text"))
    {
      js.put("combined", "true");
      js.put("type", "Special");// message type
      js.put("is_server_msg", true);
      js.put("resolve_conflict", false);

      JSONArray updates = new JSONArray();

      JSONObject delta = new JSONObject();
      JSONArray actions = new JSONArray();
      JSONObject action = new JSONObject();
      action.put("length", 0);
      action.put("index", 0);
      action.put("string", id.toString());
      action.put("commandType", "Attribute_frag_id");
      actions.add(action);

      delta.put("elementId", data);// elementId
      delta.put("deltaData", actions);
      updates.add(delta);

      delta = new JSONObject();
      actions = new JSONArray();
      action = new JSONObject();
      action.put("length", 0);
      action.put("index", 0);
      action.put("string", "working");
      action.put("commandType", "Attribute_state");
      actions.add(action);

      delta.put("elementId", data);// elementId
      delta.put("deltaData", actions);
      updates.add(delta);
      js.put("updates", updates);
    }

    else if (docType.equalsIgnoreCase("sheet"))
    {
      JSONObject content = (JSONObject) section.get("content");
      String sectionId = "";
      String address = "";
      if (content.containsKey("section"))
        sectionId = (String) content.get("section");
      if (content.containsKey("address"))
        address = (String) content.get("address");
      StringBuffer refValue = new StringBuffer();
      refValue.append(sectionId);
      refValue.append("|");
      refValue.append(address);
      JSONObject dataJSON = new JSONObject();
      dataJSON.put("fragid", id.toString());
      dataJSON.put("state", "working");
      js.put("is_server_msg", true);// client seq

      JSONObject event = new JSONObject();
      event.put("isoperation", true);
      event.put("action", "set");// action type
      JSONObject refJSON = new JSONObject();
      refJSON.put("refType", "unnamerange");
      refJSON.put("refValue", refValue.toString());
      event.put("reference", refJSON);
      event.put("data", dataJSON);
      JSONArray events = new JSONArray();
      events.add(event);
      // JSONObject msgJSON = new JSONObject();
      // msgJSON.put("events", events);
      // js.put("data", msgJSON);
      js.put("updates", events);
    }

    ja.add(js);
    // 2 put this server message to queue
    receiveMessage(ja, null);
  }

  private void addAsCtrlMsgAmount(int number)
  {
    amountOfAsCtrlMsg += number;
  }

  private long getAsCtrlMsgAmount()
  {
    return amountOfAsCtrlMsg;
  }

  private void resetAsCtrlMsgAmount()
  {
    amountOfAsCtrlMsg = 0;
  }

  public void setPublishing(boolean publish)
  {
    isPublishing = publish;
  }

  public boolean getPublishing()
  {
    return isPublishing;
  }

  public IDocumentEntry getDocumentEntry()
  {
    return docEntry;
  }

  public UserBean getLastModifer()
  {
    return lastModifier;
  }

  public UserBean getLastLeaver()
  {
    return lastLeaver;
  }

  public SessionStatus getStatus()
  {
    return sessionStatus;
  }

  public void setStatus(SessionStatus status)
  {
    sessionStatus = status;
  }

  public ReentrantReadWriteLock getInactiveLock()
  {
    return inactivatingReadWriteLock;
  }
}
