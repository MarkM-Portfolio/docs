/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.servlet;

import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.document.services.DocumentURLBuilder;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.exceptions.MalformedRequestException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.LimitsUtil;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.SessionConfig;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.exception.AccessException;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spi.exception.DocumentServiceException;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.RequestParser;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.json.java.JSONObject;

public class ConcordDocServlet extends HttpServlet
{
  private static final long serialVersionUID = 6476845491217397520L;

  private static final Logger LOG = Logger.getLogger(ConcordDocServlet.class.getName());

  private static final String ATTR_ERROR_CODE = "error_code";

  private static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  private static final String EDIT_OR_VIEW = "editorview";

  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    // limit active sessions
    int limit = SessionConfig.getMaxActiveEditing();
    SessionManager mgr = SessionManager.getInstance();
    if (limit > 0 && limit <= mgr.getActiveSessionNumbers())
    {
      LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          " Cannot open the document in this Docs server, only %s documents can be opened at the same time. ", new Object[] { limit }))
          .toString());
      request.setAttribute(ATTR_ERROR_CODE, DocumentServiceException.EC_DOCUMENT_EXCEED_MAX_SESSION_ERROR);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }

    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    RequestParser requestParser = new RequestParser(request);

    if (requestParser.isRootRequest())
    {
      response.setStatus(HttpServletResponse.SC_ACCEPTED);
      return;
    }

    String type = requestParser.getEditorType();
    String repoId = requestParser.getRepoId();
    String uri = requestParser.getDocUri();
    String contentPath = requestParser.getDocContentPath();
    String actionType = requestParser.getActionType();
    boolean isDraft = requestParser.isDraft();

    if (type == null || type.length() <= 0 || repoId == null || repoId.length() <= 0 || uri == null || uri.length() <= 0
        || actionType == null || actionType.length() <= 0 || contentPath == null || contentPath.length() <= 0)
    {
      // malformed request
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(" malformed request url %s . ",
          request.getRequestURL())).toString());
      request.setAttribute(ATTR_ERROR_CODE, MalformedRequestException.EC_MALFORMED_INVALID_REQUEST);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }

    boolean isAttachment = !contentPath.equalsIgnoreCase("content");
    // Attachment related request is not server sensitive.
    if ((!isAttachment) && !(actionType.equalsIgnoreCase(EDIT_OR_VIEW)))
    {
      boolean bServing = ConcordDocServlet.checkServingSrv(request, response, repoId, uri);
      if (!bServing)
        return;
    }

    // get document entry
    IDocumentEntry docEntry = null;
    String repoType = DocumentEntryUtil.getRepoTypeFromId(repoId);
    try
    {
      // Input '!bIsServeEditorPage' as the last parameter in this call to check document entry from dynamic cache, because
      // if this request is accessing the attachment, need to use cache mechanism to minimize the hole for access control.
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, isAttachment);
    }
    catch (RepositoryAccessException e)
    {
      LOG.log(Level.SEVERE, e.getErrMsg(), e);
      int nErrorCode = e.getErrCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOPERMISSION)
      {
        nErrorCode = actionType.equalsIgnoreCase("view") ? RepositoryAccessException.EC_REPO_NOVIEWPERMISSION
            : RepositoryAccessException.EC_REPO_NOEDITPERMISSION;
      }
      request.setAttribute(ATTR_ERROR_CODE, nErrorCode);      
      if ( repoType != null && !repoType.equals(RepositoryConstants.REPO_TYPE_EXTERNAL_CMIS)&&
            !repoType.equals(RepositoryConstants.REPO_TYPE_EXTERNAL_REST) )
      {
        LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
            " nErrorCode %s , RepositoryAccessException %s . ", nErrorCode, e)).toString());
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      }
      return;
    }
    catch (Exception e)
    {
      // TODO: If the repository id in URL is wrong, throw a NullPointerException. Should give a more accurate error code and message in
      // future release.
      LOG.severe(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          " Exceptions %s happened. ", new Object[] { e })).toString());
      request.setAttribute(ATTR_ERROR_CODE, -1);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }

    if (docEntry == null)
    {
      // not found
      LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), "not found ").toString());
      request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_NOTFOUNDDOC);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }

    if (actionType.equalsIgnoreCase(EDIT_OR_VIEW))
    {
      String redirectURI = null;
      redirectURI = getRedirectUriForLCFiles(docEntry);

      if (null == redirectURI)
      {
        LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), " redirectURI null ")
            .toString());
        request.setAttribute(ATTR_ERROR_CODE, -1);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }
      else
      {
        response.sendRedirect(response.encodeRedirectURL(redirectURI));
        return;
      }
    }

    if (docEntry.isEncrypt())
    {
      // encrypted
      LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), " document is encrypted ")
          .toString());
      request.setAttribute(ATTR_ERROR_CODE, AccessException.EC_DOCUMENT_ENCRYPT);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }

    IDocumentService docSrv = null;
    String mimeType = docEntry.getMimeType();

    if (isAttachment)
    {
      // if the request is for attachment, get document service according to draft meta data
      // defect 14167
      DraftDescriptor dd = DocumentServiceUtil.getDraftDescriptor(user, docEntry);
      if (dd != null)
      {
        JSONObject draftMeta = null;
        try
        {
          draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(dd);
          mimeType = (String) draftMeta.get(DraftMetaEnum.MIME.getMetaKey());
        }
        catch (DraftDataAccessException e)
        {
          LOG.log(Level.SEVERE, "Failed to read draft metadata information of this document " + docEntry.getDocUri(), e);
        }

      }
    }
    docSrv = DocumentServiceUtil.getDocumentService(mimeType);
    //Deny the access to Note from browser side
    
    if (docSrv == null || !ConcordUtil.supportNote(request, mimeType))
    {
      // unsupported document format
      LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), " unsupported document format ")
          .toString());
      request.setAttribute(ATTR_ERROR_CODE, UnsupportedMimeTypeException.EC_MIME_UNSUPPORTED_TYPE);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }

    // Set the size limit into the request.
    request.setAttribute("doc_size_limit",
        LimitsUtil.getShownSizeLimit((JSONObject) docSrv.getConfig().get("limits"), docEntry.getMimeType()));

    if (actionType.equalsIgnoreCase("view"))
    {
      checkLegacyData(request, response, user, docEntry, repoId);
      ViewAction action = new ViewAction(user, docEntry, isDraft, contentPath);
      action.exec(request, response);
      return;
    }
    else if (actionType.equalsIgnoreCase("edit"))
    {
      checkLegacyData(request, response, user, docEntry, repoId);
      EditAction action = new EditAction(user, docEntry, contentPath);
      action.exec(request, response);
      return;
    }
    else if (actionType.equalsIgnoreCase("revision"))
    {
      Object obj = Platform.getComponent("com.ibm.concord.platform.revision").getConfig().get("enabled");
      boolean enabled = obj != null ? Boolean.valueOf(obj.toString()).booleanValue() : false;
      if (enabled)
      {
        DocumentServiceUtil.forwardRevisionViewPage(user, docEntry, request, response);
      }
      else
      {
        LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(),
            " MalformedRequestException EC_MALFORMED_INVALID_REQUEST ").toString());
        request.setAttribute(ATTR_ERROR_CODE, MalformedRequestException.EC_MALFORMED_INVALID_REQUEST);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      }
      return;
    }
    else
    {
      LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(),
          " MalformedRequestException EC_MALFORMED_INVALID_REQUEST ").toString());
      request.setAttribute(ATTR_ERROR_CODE, MalformedRequestException.EC_MALFORMED_INVALID_REQUEST);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
  }

  public static boolean checkServingSrv(HttpServletRequest request, HttpServletResponse response, String repoId, String uri)
      throws IOException, ServletException
  {
    int status = ServiceUtil.checkServingSrv(request, response, repoId, uri);
    if (status == ServiceUtil.SERVING_STATUS_OTHERSRV)
    {
      // Sleep 2 seconds here, so that can redirect to the right server after the old server is not available, because
      // FireFox only can redirect 21 times and we know the old server is unavailable after 15 seconds, so sleep here.
      try
      {
        Thread.sleep(2000);
      }
      catch (Throwable e)
      {
        LOG.log(Level.WARNING, "Exceptions happen while sleep before redirect the request", e);
      }
      // The status is ServiceUtil.SERVING_STATUS_OTHERSRV(1), mean this server can not serve the document, should redirect to the same
      // URI.
      String queryStr = request.getQueryString();
      String editUrl = queryStr != null && !"".equals(queryStr) ? (request.getRequestURI() + "?" + queryStr) : request.getRequestURI();
      response.sendRedirect(response.encodeRedirectURL(editUrl));
      return false;
    }
    else if (status == ServiceUtil.SERVING_STATUS_EXCEPTION)
    {
      // The status is ServiceUtil.SERVING_STATUS_EXCEPTION(2), mean that can not access the database, should redirect to error page.
      LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), "can not access the database ").toString());
      request.setAttribute(ATTR_ERROR_CODE, 0);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return false;
    }
    return true;
  }

// docEntry must not null
  private String getRedirectUriForLCFiles(IDocumentEntry docEntry)
  {
    if (Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      return DocumentURLBuilder.getEditDocumentURI(docEntry);
    }
    else if (Permission.VIEW.hasPermission(docEntry.getPermission()))
    {
      return DocumentURLBuilder.getLCViewDocumentURI(docEntry);
    }
    else
    {
      return DocumentURLBuilder.getLCFileDetailURI(docEntry);
    }
  }

  private void checkLegacyData(HttpServletRequest request, HttpServletResponse response, UserBean user, IDocumentEntry docEntry,
      final String repoId) throws ServletException, IOException
  {
    try
    {
      String newOrgId = ConcordUtil.retrieveFileOwnerOrgId(docEntry, user);
      final DraftDescriptor newDraft = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(newOrgId, docEntry.getRepository(),
          docEntry.getDocUri());
      final DraftDescriptor oldDraft = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(newOrgId, docEntry.getRepository(),
          docEntry.getCreator()[0] + IDocumentEntry.DOC_URI_SEP + docEntry.getDocId());
      if (new File(oldDraft.getURI()).exists() && DraftStorageManager.getDraftStorageManager().isDraftExisted(oldDraft)
          && DraftStorageManager.getDraftStorageManager().isDraftDirty(oldDraft))
      {
        if (DraftStorageManager.getDraftStorageManager().transferDraft(oldDraft, newDraft))
        {
          ConcordUtil.updateDbForTransferredDraft(oldDraft, newDraft, user, docEntry, repoId, false, newOrgId, null);
        }
        else
        {
          LOG.log(Level.WARNING, "Old Draft and New Draft Co-Existed. {0} {1}", new Object[] { oldDraft, newDraft });
        }
      }

      // Transfer org case
      String oldOrgId = ConcordUtil.retrieveFileOwnerOrgIdFromDB(docEntry);
      if (oldOrgId != null)
      {
        if (!newOrgId.equals(oldOrgId))
        {
          final DraftDescriptor oldOrgDraft = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(oldOrgId,
              docEntry.getRepository(), docEntry.getDocUri());
          if (new File(oldOrgDraft.getURI()).exists() && DraftStorageManager.getDraftStorageManager().isDraftExisted(oldOrgDraft))
          {
            try
            {
              JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(oldOrgDraft);
              if (DocumentServiceUtil.transferDraft(docEntry, oldOrgDraft, newDraft))
              {
                Object lastModified = draftMeta != null ? draftMeta.get(DraftMetaEnum.LAST_MODIFIED.getMetaKey()) : null;
                ConcordUtil.updateDbForTransferredDraft(oldOrgDraft, newDraft, user, docEntry, repoId, true, newOrgId, lastModified);
              }
              else
              {
                LOG.log(Level.WARNING, "Old Draft and New Draft Co-Existed. {0} {1}", new Object[] { oldOrgDraft, newDraft });
              }
            }
            catch (ConcordException e)
            {
              if (new File(newDraft.getURI()).exists() && DraftStorageManager.getDraftStorageManager().isDraftExisted(newDraft))
              {
                LOG.log(Level.WARNING, "Old Draft and New Draft have been trasferred by other edit session. {0} {1}", new Object[] {
                    oldOrgDraft, newDraft });
              }
              else
              {
                throw e;
              }
            }
          }
        }
      }
      else
      {
        LOG.log(Level.FINE, "can not retrieve file owner org id from database for document " + docEntry.getDocUri()
            + ", no need to check organization transfer.");
      }
    }
    catch (ConcordException e)
    {
      LOG.severe(new LogEntry(docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          "ConcordException : %s . ", e)).toString());
      request.setAttribute(ATTR_ERROR_CODE, e.getErrCode());
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    RequestParser requestParser = new RequestParser(request);
    String repoId = request.getParameter("repoid");

    if (repoId == null)
      repoId = requestParser.getRepoId();

    String uri = request.getParameter("docuri");
    if (uri == null)
      uri = requestParser.getDocUri();

    String password = request.getParameter("docpwd");

    String syncDraft = request.getParameter("syncdraft");

    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    String actionType = requestParser.getActionType();
    String contentPath = requestParser.getDocContentPath();
    boolean isDraft = requestParser.isDraft();
    try
    {
      IDocumentEntry docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, false);
      if (docEntry == null)
      {
        // not found
        LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(" Document uri %s , not found ", uri))
            .toString());
        request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_NOTFOUNDDOC);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }

      IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
      if (docSrv == null)
      {
        // unsupported document format
        LOG.warning(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
            " User %s get document %s , unsupported document format ", user.getId(), uri)).toString());
        request.setAttribute(ATTR_ERROR_CODE, UnsupportedMimeTypeException.EC_MIME_UNSUPPORTED_TYPE);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }
      if (actionType.equalsIgnoreCase("view"))
      {
        checkLegacyData(request, response, user, docEntry, repoId);
        ViewAction action = new ViewAction(user, docEntry, isDraft, contentPath);
        action.exec(request, response);
        return;
      }
      if (syncDraft != null)
      {
        boolean isSyncDraft = Boolean.valueOf(syncDraft);
        checkLegacyData(request, response, user, docEntry, repoId);
        UploadNewVersionAction action = new UploadNewVersionAction(user, docEntry, contentPath, isSyncDraft);
        action.exec(request, response);
        return;
      }
      DecryptAction action = new DecryptAction(user, docEntry, null, password);
      action.exec(request, response);
      return;
    }
    catch (ConcordException e)
    {
      LOG.severe(new LogEntry(URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(" ConcordException : %s . ", e))
          .toString());
      int nErrorCode = e.getErrCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOPERMISSION)
      {
        nErrorCode = RepositoryAccessException.EC_REPO_NOEDITPERMISSION;
      }

      request.setAttribute(ATTR_ERROR_CODE, e.getErrCode());
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
  }
}
