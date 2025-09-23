/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.AsyncContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.document.common.FragmentManager;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocReferenceDAO;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.services.rest.handlers.docsvr.async.GetPartialAsyncListener;
import com.ibm.concord.services.rest.handlers.docsvr.async.GetPartialProcessor;
import com.ibm.concord.services.rest.handlers.docsvr.async.JoinSessionAsyncListener;
import com.ibm.concord.services.rest.handlers.docsvr.async.JoinSessionAsyncProcessor;
import com.ibm.concord.services.rest.handlers.tasksvr.TaskService;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.DocumentSessionException;
import com.ibm.concord.session.Participant;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.session.message.Message;
import com.ibm.concord.session.message.MessageConstants;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentEditHandler implements GetHandler, PostHandler
{
  private static final Logger LOG = Logger.getLogger(DocumentEditHandler.class.getName());
  
  private static final long ASYNC_SERVLET_TIME = 30L * 1000L ;

  private static final long GET_PARTIAL_ASYNC_SERVLET_TIME = 120L * 1000L ;
  
  /**
   * Get the parameter "criteria" from the request for fetching partial content of document model.
   * 
   * @param request
   * @return
   */
  private JSONObject getCriteria(HttpServletRequest request)
  {
    JSONObject criteria = null;
    try
    {
      String criteriaStr = request.getParameter("criteria");
      if (criteriaStr != null)
      {
        criteria = JSONObject.parse(criteriaStr);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Can not parse the parameter 'criteria' in the request to a json object", e);
    }
    return criteria;
  }

  private JSONObject getLeaveData(HttpServletRequest request)
  {
    JSONObject data = null;
    try
    {
      String str = request.getParameter("leavedata");
      if (str != null)
      {
        data = JSONObject.parse(str);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Can not parse the parameter 'leavedata' in the request to a json object", e);
    }
    return data;
  }

  /**
   * Convert the participants to a JSON array.
   * 
   * @param participants
   * @return
   */
  private JSONArray convertParticipantsToJSON(Participant participants[])
  {
    int length = participants != null ? participants.length : 0;
    JSONArray array = new JSONArray(length);
    for (int index = 0; index < length; index++)
    {
      Participant participant = participants[index];
      UserBean bean = participant.getUserBean();
      array.add(bean.toJSON());
    }
    return array;
  }

  /**
   * Package the entitlement related error into a JSON object.
   * 
   * @param session
   *          specifies the document session that error happens on
   * @param ex
   *          presents the no entitlement exception
   * @return
   */
  private JSONObject packageEntitlementError(DocumentSession session, DocumentSessionException ex)
  {
    JSONObject json = new JSONObject();
    json.put("status", "error");
    json.put("error_code", ex.getErrorCode());
    json.put("error_msg", ex.getMessage());
    if (ex.getData() instanceof Participant[])
    {
      json.put(MessageConstants.PARTICIPANTS, convertParticipantsToJSON((Participant[]) ex.getData()));
    }
    return json;
  }

  /**
   * Get the document entry according to the user, repository id and the document URI.
   * 
   */
  private IDocumentEntry getDocumentEntry(UserBean user, String repoId, String uri, boolean bCache) throws Exception
  {
    IDocumentEntry docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, bCache);
    if (docEntry == null)
    {
      // Did not find the document entry, the document may have been removed.
      LOG.log(Level.WARNING, "Can not get the document entry of {0} in repository {1}.", new Object[] { uri, repoId });
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOTFOUNDDOC);
    }

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      // The caller does not have the editing permission on this document.
      LOG.log(Level.WARNING, "{0} does not have edit permission on document {1}.", new Object[] { user.getId(), uri });
      throw new RepositoryAccessException(RepositoryAccessException.EC_REPO_NOEDITPERMISSION);
    }

    // Have not been published && file size is not empty, then this is the first time a non-IBMdocs is edited.
    if (!docEntry.isPublished() && 0 != docEntry.getMediaSize())
    {
      try
      {
        docEntry = DocumentEntryUtil.setIBMdocsType(user, docEntry);
        
        if(RepositoryConstants.REPO_TYPE_ECM.equalsIgnoreCase(repoId))
        {// for ECM, setIBMdocsType will cause LAST_MODIFIED change
          DraftDescriptor draftDesc = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user),
              docEntry.getRepository(), docEntry.getDocUri());
          JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDesc);
          draftMeta.put(DraftMetaEnum.LAST_MODIFIED.getMetaKey(), AtomDate.valueOf(docEntry.getModified()).getValue());
          draftMeta.put(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey(), docEntry.getVersion());
          draftMeta.put(DraftMetaEnum.MIME.getMetaKey(), docEntry.getMimeType());        
          DraftStorageManager.getDraftStorageManager().setDraftMeta(draftDesc, draftMeta);
          
          DocumentEntryHelper.clearEntryCache(user, docEntry.getDocUri());
          LOG.log(Level.FINE, "Because setIBMdocsType refreshed ECM metaData on document entry of {0} in repository {1}.", new Object[] { uri, repoId });
        }        
        LOG.log(Level.FINE, "setIBMdocsType on document entry of {0} in repository {1}.", new Object[] { uri, repoId });
      }
      catch (Throwable ex)
      {
        LOG.log(Level.WARNING, "setIBMdocsType failed on document entry of {0} in repository {1}.", new Object[] { uri, repoId });
      }
    }

    return docEntry;
  }

  /**
   * Package the exception happens when getting the document entry into a JSON object.
   * 
   * @param exception
   *          specifies the exception happens when getting the document entry
   * @return the packaged JSON object
   */
  private JSONObject packageGetDocEntryError(Exception exception)
  {
    JSONObject json = new JSONObject();
    json.put("status", "error");
    if (exception instanceof RepositoryAccessException)
    {
      int nErrorCode = ((RepositoryAccessException) exception).getErrCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOPERMISSION)
      {
        nErrorCode = RepositoryAccessException.EC_REPO_NOEDITPERMISSION;
      }
      json.put("error_code", nErrorCode);
      json.put("error_msg", exception.getMessage());
    }
    return json;
  }

  /**
   * Join session of document .
   * 
   * @param request
   * @param response
   * @param docEntry
   * @param caller
   * @throws Exception
   */
  private void doJoinSession(HttpServletRequest request, HttpServletResponse response, IDocumentEntry docEntry, UserBean caller)
      throws Exception
  {
    LOG.info(new ActionLogEntry(caller, Action.JOINSESSION, docEntry.getDocUri(), "browser:" + request.getHeader("User-Agent"))
        .toString());
    AsyncContext asyncContext = null;
    try
    {
      if (!request.isAsyncSupported())
      {
        String msg = "The doJoinSession request is not support Async.";
        LOG.log(Level.WARNING, msg);
        sendErrorResponse(response, DocumentServiceException.EC_DOCUMENT_ASYNC_RESPONSE_TIME_OUT, msg);
        return;
      }
      asyncContext = request.startAsync();
      asyncContext.setTimeout(ASYNC_SERVLET_TIME);
      asyncContext.addListener(new JoinSessionAsyncListener(asyncContext, docEntry, caller));
      ThreadPoolExecutor executor = (ThreadPoolExecutor) request.getServletContext().getAttribute("asyncExecutor");
      executor.execute(new JoinSessionAsyncProcessor(asyncContext, docEntry, caller));
    }
    catch (IllegalStateException e)
    {
      if (asyncContext != null)
      {
        asyncContext.complete();
      }
      String msg = "The doJoinSession request is occur exception ";
      LOG.log(Level.WARNING, msg + e.getMessage());
      sendErrorResponse(response, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR, msg);
      return;
    }
    catch (RejectedExecutionException e)
    {
      if (asyncContext != null)
      {
        asyncContext.complete();
      }
      String msg = "The doJoinSession request is occur exception ";
      LOG.log(Level.WARNING, msg + e.getMessage());
      sendErrorResponse(response, DocumentServiceException.EC_DOCUMENT_ASYNC_MAX_REQUEST_ERROR, msg);
      return;
    }
    LOG.exiting(this.getClass().getName(), "doJoinSession");
  }

  private void doLeaveSession(HttpServletRequest request, HttpServletResponse response, String repoId, String uri, UserBean caller)
      throws Exception
  {
    SessionManager mgr = SessionManager.getInstance();
    String clientId = request.getSession().getId();
    JSONObject leftdata = this.getLeaveData(request);
    // check if close draft
    DocumentSession docSess = mgr.getSession(repoId, uri);
    if (docSess != null)
    {
      docSess.leave(clientId, leftdata);
    }    
    RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
        .getService(RepositoryProviderRegistry.class);
    IRepositoryAdapter repositoryAdapter = service.getRepository(repoId);
    repositoryAdapter.processLeaveData(caller, repoId, uri, null);
    
    response.setStatus(HttpServletResponse.SC_OK);
  }

  /**
   * Get partial content of document according to the criteria. If do not have criteria, should get the entire content of document.
   * 
   * @param request
   * @param response
   * @param docBean
   * @param caller
   * @throws Exception
   */
  private void doGetPartial(HttpServletRequest request, HttpServletResponse response, IDocumentEntry docEntry, UserBean caller)
      throws Exception
  {
    LOG.info(new ActionLogEntry(caller, Action.ASYNC_GET_PARTIAL, docEntry.getDocUri(), "browser:" + request.getHeader("User-Agent"))
        .toString());
    AsyncContext asyncContext = null;
    try
    {
      if (!request.isAsyncSupported())
      {
        LOG.log(Level.WARNING, "The getPartial request is not support Async.");
        response.sendError(HttpServletResponse.SC_NOT_ACCEPTABLE);
        return;
      }
      asyncContext = request.startAsync();
      asyncContext.addListener(new GetPartialAsyncListener(asyncContext, docEntry, caller));
      asyncContext.setTimeout(GET_PARTIAL_ASYNC_SERVLET_TIME);
      ThreadPoolExecutor executor = (ThreadPoolExecutor) request.getServletContext().getAttribute("asyncExecutor");
      executor.execute(new GetPartialProcessor(asyncContext, docEntry, caller));
    }
    catch (IllegalStateException e)
    {
      if (asyncContext != null)
      {
        asyncContext.complete();
      }
      String msg = "The doJoinSession request is occur exception ";
      LOG.log(Level.WARNING, msg + e.getMessage());
      sendErrorResponse(response, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR, msg);
      return;
    }
    catch (RejectedExecutionException e)
    {
      if (asyncContext != null)
      {
        asyncContext.complete();
      }
      String msg = "The doJoinSession request is occur exception ";
      LOG.log(Level.WARNING, msg + e.getMessage());
      sendErrorResponse(response, DocumentServiceException.EC_DOCUMENT_ASYNC_MAX_REQUEST_ERROR, msg);
      return;
    }
    LOG.exiting(this.getClass().getName(), "doGetPartial");
  }

  private void doGetState(HttpServletRequest request, HttpServletResponse response, IDocumentEntry docEntry, UserBean caller)
      throws Exception
  {
    String start = request.getParameter("start");
    String end = request.getParameter("end");
    SessionManager mgr = SessionManager.getInstance();

    DocumentSession docSess = mgr.getSession(docEntry);
    if (docSess == null)
    {
      LOG.log(Level.WARNING, "The document has been closed while getting state: " + docEntry.getDocUri());
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    long lStart = 0;
    long lEnd = Long.MAX_VALUE;
    try
    {
      lStart = (start != null) ? Long.parseLong(start) : lStart;
      lEnd = (end != null) ? Long.parseLong(end) : lEnd;
    }
    catch (NumberFormatException ex)
    {
      LOG.log(Level.WARNING, "Request parameters 'start' [{0}] or 'end' [{1}] are invalid.", new Object[] { start, end });
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    List<Message> msgList = docSess.getState(lStart, lEnd);
    if (msgList == null)
    {
      LOG.log(Level.WARNING, "Can not get the state from sequence " + lStart + " to " + lEnd);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    JSONObject json = new JSONObject();
    json.put(MessageConstants.BASE_SEQ, docSess.getBaseSeq());
    json.put(MessageConstants.STATE_SEQ_KEY, docSess.getServerSeq());
    json.put(MessageConstants.MSG_LIST, Message.toJSONArray(msgList));

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_OK);
    json.serialize(response.getWriter(), true);
  }

  /**
   * Check the status of the document session. If the session is closing, then return the "pending" status to client. If the document
   * session was closed, then return "complete" status to the client, and client can join the session.
   * 
   */
  private void doGetSessionStatus(HttpServletRequest request, HttpServletResponse response, UserBean caller, String repoId, String docUri)
      throws Exception
  {
    DocumentSession session = SessionManager.getInstance().getClosingSession(repoId, docUri);
    if (session != null)
    {
      JSONObject json = new JSONObject();
      json.put("status", "pending");
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
    }
    else
    {
      try
      {
        IDocumentEntry docEntry = getDocumentEntry(caller, repoId, docUri, false);
        DraftDescriptor draftDesc = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(
            ConcordUtil.retrieveFileOwnerOrgId(docEntry, caller), repoId, docUri);
        boolean isDraftValid = DraftStorageManager.getDraftStorageManager().isDraftValid(draftDesc, docEntry);
        String version = (String) DocumentServiceUtil.getDocumentService(docEntry.getMimeType()).getConfig().get("draftFormatVersion");
        boolean needUpgrade = ConcordUtil.checkDraftFormatVersion(draftDesc.getURI(), version);
        JSONObject json = new JSONObject();
        if (!isDraftValid || needUpgrade)
        {
          json.put("refresh", "true");
        }
        json.put("status", "complete");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        json.serialize(response.getWriter(), true);
      }
      catch (Exception e)
      {
        LOG.log(Level.SEVERE, e.getMessage(), e);
        JSONObject json = packageGetDocEntryError(e);
        json.put("status", "error");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        json.serialize(response.getWriter(), true);
      }
    }
  }

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String method = request.getParameter("method");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, repoId, uri) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }

    if ("getSessionStatus".equalsIgnoreCase(method))
    {
      doGetSessionStatus(request, response, user, repoId, uri);
      return;
    }
    else if ("leave".equalsIgnoreCase(method))
    {
      // Leave method do not need a document entry, so execute this method before getting the document entry.
      doLeaveSession(request, response, repoId, uri, user);
      return;
    }

    IDocumentEntry docEntry = null;
    try
    {
      docEntry = getDocumentEntry(user, repoId, uri, true);
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, e.getMessage(), e);
      JSONObject json = packageGetDocEntryError(e);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      return;
    }

    if (method == null)
    {
      doJoinSession(request, response, docEntry, user);
    }
    else if (method.equalsIgnoreCase("getState"))
    {
      doGetState(request, response, docEntry, user);
    }
    else if (method.equalsIgnoreCase("getpartial"))
    {
      doGetPartial(request, response, docEntry, user);
    }
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String method = request.getParameter("method");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, repoId, uri) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }

    IDocumentEntry docEntry;
    try
    {
      docEntry = getDocumentEntry(user, repoId, uri, false);
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, "Error happens when getting document entry of " + uri, e);

      if (e.getErrCode() == RepositoryAccessException.EC_REPO_NOTFOUNDDOC)
      {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      }
      else
      {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      }
      JSONObject json = new JSONObject();
      json.put("status", "error");
      json.put("error_code", e.getStatusCode());
      if (e.getErrCode() == RepositoryAccessException.EC_REPO_NOPERMISSION)
      {
        json.put("error_code", RepositoryAccessException.EC_REPO_NOEDITPERMISSION);
      }
      json.put("error_msg", e.getErrMsg());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getOutputStream());
      return;
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Error happens when getting document entry of " + uri, e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (method.equalsIgnoreCase("reconnect"))
    {
      // cannot assume document session is still there when client wants to reconnect
      this.doReconnect(request, response, docEntry, user);
      return;
    }

    SessionManager mgr = SessionManager.getInstance();
    DocumentSession docSess = mgr.getSession(docEntry);
    if (docSess == null)
    {
      LOG.log(Level.WARNING, "The document session {0} has been closed while doing {1}.", new Object[] { uri, method });
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    if (method.equalsIgnoreCase("submit"))
    {
      doSubmit(request, response, docEntry, docSess, user);
    }
  }

  public void doPut(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    doPost(request, response);
  }

  @SuppressWarnings("unused")
  private void doReconnect(HttpServletRequest request, HttpServletResponse response, IDocumentEntry docEntry, UserBean caller)
      throws Exception
  {
    String clientId = request.getSession().getId();
    String clientMime = null;
    String clientModified = null;
    long clientCurrentSeq = 0;
    long clientLocalMsgCount = 0;
    long clientSeq = 0;
    LOG.info("User " + caller.getId() + " is reconnecting to document " + docEntry.getDocId() + " with clientId " + clientId); 
    try
    {
      JSONObject jsonBody = JSONObject.parse(request.getReader());
      String seq = jsonBody.get(MessageConstants.STATE_SEQ_KEY).toString();
      String cnt = jsonBody.get(MessageConstants.LOCAL_MSG_CNT).toString();
      String cSeq = jsonBody.get(MessageConstants.CLIENT_SEQ).toString();
      clientCurrentSeq = Long.parseLong(seq);
      clientSeq = Long.parseLong(cSeq);
      clientLocalMsgCount = Long.parseLong(cnt);
      clientMime = (String) jsonBody.get(MessageConstants.DOC_MIME);
      clientModified = (String) jsonBody.get(MessageConstants.DOC_MODIFIED);
      
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error parsing request body: ", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    DraftDescriptor draftDesc = null;
    try
    {
      draftDesc = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(
          ConcordUtil.retrieveFileOwnerOrgId(docEntry, caller), docEntry.getRepository(), docEntry.getDocUri());
      ServiceUtil.checkDraftValid(draftDesc, docEntry, caller);
    }
    catch (Exception ex)
    {
      // If can not get the draft meta, then should reload the document window.
      LOG.log(Level.WARNING, "Can not get the draft meta of document " + docEntry.getDocUri(), ex);
      JSONObject retJson = new JSONObject();
      retJson.put(MessageConstants.RECONNECT_ACTION, "reload");
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      retJson.serialize(response.getWriter());
      return;
    }

    SessionManager mgr = SessionManager.getInstance();
    DocumentSession docSess = mgr.getSessionWhenJoin(docEntry);
    if (docSess == null)
    {
      // try to establish document session again
      try
      {
        docSess = mgr.openSession(caller, docEntry, draftDesc);
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "Can not open the document session of " + docEntry.getDocUri(), e);
        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        return;
      }
    }
    Participant p = null;
    try
    {
      p = docSess.join(caller, clientId, false);
    }
    catch (DocumentServiceException ex)
    {
      LOG.log(Level.SEVERE, ex.getErrMsg(), ex);
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      JSONObject json = new JSONObject();
      json.put("status", "error");
      json.put("error_code", ex.getErrCode());
      json.put("error_msg", ex.getMessage());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      return;
    }
    // client's client sequence is fine, as long as it's bigger
    if(clientSeq < p.getClientSeq())
    {
      p.updateClientSeq(clientSeq);      
    }

    // Check whether the document's last modification time and MIME type are changed or not. If both modification time and type are
    // changed, then should refresh the whole client, if only last modification time is changed, then only need reload the document.
    // TODO: Comment out these codes currently, because did not support upload new version in Files UI now.
    /*
     * String modified = draftMeta != null ? (String) draftMeta.get(DraftMetaEnum.LAST_MODIFIED.getMetaKey()) : null; if (modified != null
     * && clientModified != null && !clientModified.equalsIgnoreCase(modified)) { JSONObject retJson = new JSONObject(); String mime =
     * (String) draftMeta.get(DraftMetaEnum.MIME.getMetaKey()); if (clientMime != null && !clientMime.equalsIgnoreCase(mime)) {
     * retJson.put(MessageConstants.RECONNECT_ACTION, "refresh"); } else { retJson.put(MessageConstants.RECONNECT_ACTION, "reload"); }
     * response.setContentType("application/json"); response.setCharacterEncoding("UTF-8"); retJson.serialize(response.getWriter()); return; }
     */

    // check if client's state is newer than base state
    if (clientCurrentSeq < docSess.getBaseSeq())
    {
      if (LOG.isLoggable(Level.FINE))
      {
        LOG.log(Level.FINE, "need reload clientId:" + clientId + ";doc:" + docEntry.getDocUri() + ";currentSeq:" + clientCurrentSeq
            + ";baseSeq:" + docSess.getBaseSeq() + ";serverSeq:" + docSess.getServerSeq());
      }
      // means client is in old state, and cannot recover
      // client has to reload whole content from server
      // let's just return latest state to client
      JSONObject retJson = packageStateResponse(request, response, docSess, docEntry, p);
      if (retJson == null)
      {
        return;
      }

      retJson.put(MessageConstants.RECONNECT_ACTION, "reload");
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_OK);
      retJson.serialize(response.getWriter());
      return;
    }
    else if (clientCurrentSeq > docSess.getServerSeq())
    {
      if (LOG.isLoggable(Level.FINE))
      {
        LOG.log(Level.FINE, "need restore clientId:" + clientId + ";doc:" + docEntry.getDocUri() + ";currentSeq:" + clientCurrentSeq
            + ";baseSeq:" + docSess.getBaseSeq() + ";serverSeq:" + docSess.getServerSeq());
      }
      // client contains latest data
      // this maybe caused by server crash, in memory data lost
      // tell browser to restore data from client to server
      response.setStatus(HttpServletResponse.SC_OK);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");

      // user's session id may changed, return to client and replace with old one
      JSONObject retJson = new JSONObject();
      retJson.put(MessageConstants.CLIENT_ID, clientId);
      retJson.put(MessageConstants.CLIENT_SEQ, p.getClientSeq());
      retJson.put(MessageConstants.BASE_SEQ, docSess.getBaseSeq());
      retJson.put(MessageConstants.STATE_SEQ_KEY, docSess.getServerSeq());
      retJson.put(MessageConstants.SECURE_TOKEN, docSess.getSecureToken());
      retJson.put(MessageConstants.RECONNECT_ACTION, "restore");
      retJson.serialize(response.getWriter());
      return;
    }
    else
    {
      if (LOG.isLoggable(Level.FINE))
      {
        LOG.log(Level.FINE, "fine clientId:" + clientId + ";doc:" + docEntry.getDocUri() + ";currentSeq:" + clientCurrentSeq + ";baseSeq:"
            + docSess.getBaseSeq() + ";serverSeq:" + docSess.getServerSeq());
      }
      // great!! everything is still fine

      // restore my current sequence from client
      p.updateCurrentSeq(clientCurrentSeq);

      response.setStatus(HttpServletResponse.SC_OK);
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");

      // user's session id may changed, return to client and replace with old one
      JSONObject retJson = new JSONObject();
      retJson.put(MessageConstants.CLIENT_ID, clientId);
      retJson.put(MessageConstants.CLIENT_SEQ, p.getClientSeq());
      retJson.put(MessageConstants.BASE_SEQ, docSess.getBaseSeq());
      // do not use latest server sequence here, because it's different with client
      retJson.put(MessageConstants.STATE_SEQ_KEY, clientCurrentSeq);
      retJson.put(MessageConstants.SECURE_TOKEN, docSess.getSecureToken());
      retJson.put(MessageConstants.RECONNECT_ACTION, "ok");
      retJson.serialize(response.getWriter());
      return;
    }
  }

  private void doSubmit(HttpServletRequest request, HttpServletResponse response, IDocumentEntry docEntry, DocumentSession docSess,
      UserBean user) throws Exception
  {
    String clean = request.getParameter("clean");
    FragmentManager fm = FragmentManager.getInstance();
    fm.submitFragment(user, docEntry);
    if (Boolean.valueOf(clean))
    {
      // Delete the parent/child document relationship
      IDocReferenceDAO dao = (IDocReferenceDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
          IDocReferenceDAO.class);
      boolean success = dao.deleteByChildDocument(docEntry.getRepository(), docEntry.getDocUri());
      if (success)
      {
        // Delete the document from repository
        RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
            .getService(RepositoryProviderRegistry.class);
        IRepositoryAdapter repoAdapter = service.getRepository(docEntry.getRepository());
        try
        {
          repoAdapter.deleteDocument(user, docEntry.getDocUri());
        }
        catch (Exception e)
        {
          LOG.log(Level.SEVERE, "can not delete the document from repository " + request.getRequestURL(), e);
          success = false;
        }
      }
      else
      {
        LOG.log(Level.SEVERE, "can not delete the Master/Private document relationship from db " + request.getRequestURL());
      }
      if (!success)
      {
        JSONObject json = new JSONObject();
        json.put("status", "error");
        json.put("error_code", RepositoryAccessException.EC_REPO_CANNOT_DELETE);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        json.serialize(response.getWriter(), true);
        return;
      }
    }
    response.setStatus(HttpServletResponse.SC_OK);
  }

  private JSONObject packageStateResponse(HttpServletRequest request, HttpServletResponse response, DocumentSession docSess,
      IDocumentEntry docEntry, Participant p) throws Exception
  {
    // try to open draft, get latest document content
    JSONObject state = new JSONObject();
    try
    {
      // Get the parameter "criteria" from the request for fetching partial content of document model.
      JSONObject criteria = new JSONObject();
      JSONObject contentCriteria = getCriteria(request);
      criteria.put(MessageConstants.CONTENT_STATE_KEY, contentCriteria);      
      // add user id
      criteria.put(MessageConstants.USER_ID, p.getUserBean().getId());
      
      state = docSess.getCurrentState(criteria);
    }
    catch (ConcordException e)
    {
      JSONObject json = new JSONObject();
      json.put("status", "error");
      json.put("error_code", e.getErrCode());
      json.put("error_msg", e.getMessage());
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
      LOG.log(Level.SEVERE, " can not access or open draft storage of " + docSess.getDocUri(), e);
      return null;
    }

    // Get linked activity information
    TaskService taskService = new TaskService();
    String activityId = taskService.getActivityId(p.getUserBean(), docSess.getRepository(), docSess.getDocUri());
    String activityName = null;
    if (activityId != null)
    {
      try
      {
        String role = taskService.getPersonRole(activityId, p.getUserBean().getId());
        if ((role == null) || (!role.equalsIgnoreCase("owner")))
          taskService.addMember(p.getUserBean(), activityId, p.getUserBean().getId(), null);
        activityName = taskService.getActivityTitle(p.getUserBean(), activityId);
      }
      catch (AccessException ex)
      {
        LOG.info("AccessException retrieved get activity role, this may be an invalid activityId " + activityId);
        activityId = null;
      }
    }

    JSONObject activityJson = null;
    if (activityId != null)
    {
      activityJson = new JSONObject();
      activityJson.put("activityId", activityId);
      activityJson.put("activityName", activityName);
    }

    JSONObject retJson = new JSONObject();

    retJson.put(MessageConstants.CLIENT_ID, p.getClientId());
    retJson.put(MessageConstants.STATE, state);
    retJson.put(MessageConstants.BEAN, DocumentEntryHelper.toJSON(docEntry));
    retJson.put(MessageConstants.ACTIVITY, activityJson);
    retJson.put(MessageConstants.CLIENT_SEQ, p.getClientSeq());
    retJson.put(MessageConstants.BASE_SEQ, docSess.getBaseSeq());
    retJson.put(MessageConstants.STATE_SEQ_KEY, String.valueOf(state.get(MessageConstants.STATE_SEQ_KEY)));
    retJson.put(MessageConstants.SECURE_TOKEN, docSess.getSecureToken());

    return retJson;
  }
  
  /**
   * Sent error code and message 
   * 
   * @param response
   * @throws IOException
   */
  private void sendErrorResponse(HttpServletResponse response, int serviceStatus, String error_msg)
      throws IOException
  {
    JSONObject json = new JSONObject();
    json.put("status", "error");
    json.put("error_code", serviceStatus);
    json.put("error_msg", error_msg);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
    json.serialize(response.getWriter(), true);
  }
}
