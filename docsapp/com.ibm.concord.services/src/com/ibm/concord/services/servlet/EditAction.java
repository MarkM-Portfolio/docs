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

import java.io.BufferedInputStream;
import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.collaboration.editors.EditorsList;
import com.ibm.concord.collaboration.editors.EditorsListUtil;
import com.ibm.concord.config.AutoPublishConfig;
import com.ibm.concord.config.ConcordConfig;
import com.ibm.concord.config.ConfigConstants;
import com.ibm.concord.document.services.AttachmentsUtil;
import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentPageSettingsUtil;
import com.ibm.concord.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.job.object.ImportDraftFromRepositoryJob;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.bean.DocumentEditorBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.dao.IDocumentEditorsDAO;
import com.ibm.concord.platform.exceptions.OutOfCapacityException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.platform.util.BidiUtilities;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.LimitsUtil;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.MediaDescriptor;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.concord.spi.notification.IPreference;
import com.ibm.docs.common.util.HttpMultiDomainUtil;
import com.ibm.docs.common.util.LogEntry;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.entitlement.Entitlement;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.entitlement.gatekeeper.IGateKeeperService;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.misc.BASE64Encoder;

public class EditAction
{
  private static final Logger LOG = Logger.getLogger(EditAction.class.getName());

  private static final String CLASS_NAME = EditAction.class.getName();

  protected static final String ERROR_JSP = "/WEB-INF/pages/error.jsp";

  protected static final String ATTR_ERROR_CODE = "error_code";

  protected static final String ATTR_MOBILE_ERROR_MSG = "mobile_error_message";

  protected UserBean user;

  protected IDocumentEntry docEntry;

  protected DraftDescriptor draftDesc;

  protected boolean draftExisted;

  protected String contentPath;

  protected boolean forceSave;

  protected boolean hasACL;
  
  protected boolean hasTrack;
  
  protected boolean upgradeConvert;

  protected IDocumentServiceProvider docServiceProvider;

  public EditAction(UserBean user, IDocumentEntry docEntry, String contentPath)
  {
    this.user = user;
    this.docEntry = docEntry;
    this.contentPath = contentPath;
    docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID).getService(
        IDocumentServiceProvider.class);
  }

  public JSONObject shouldEditFromDraftForSnapshot(DocumentSession docSess) throws DraftStorageAccessException, DraftDataAccessException
  {
    JSONObject checkResult = new JSONObject();
    checkResult.put("shouldEditFromDraft", shouldEditFromDraft(docSess));
    checkResult.put("forceSave", forceSave);
    checkResult.put("upgradeConvert", upgradeConvert);

    return checkResult;
  }
  
  protected boolean shouldEditFromDraft(DocumentSession docSess) throws DraftStorageAccessException, DraftDataAccessException
  {
    /*
     * Operation A: [R&W] [discard draft] from house keeping. system initiated. Operation B: [R&W] [discard draft and import latest publish
     * version] from edit button. user initiated, within single user request. Operation C: [R&W] [discard draft -> import latest publish
     * version] from discard draft menu. user initiated, across two user requests. Operation D: [R&W] [edit draft] from edit button. user
     * initiated, within single user request. Operation E: [R&W] [view draft] from view button or menu.
     * 
     * 5 (Readers) * 5 (Writers) + 5 = 30
     */
    if (docSess == null)
    {
      draftDesc = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user),
          docEntry.getRepository(), docEntry.getDocUri());
      draftExisted = DraftStorageManager.getDraftStorageManager().isDraftExisted(draftDesc);
      LOG.log(Level.INFO, "the draft exist status of " + docEntry.getDocUri() + " is " + draftExisted);
      if (draftExisted)
      {
        ServiceUtil.checkDraftValid(draftDesc, docEntry, user);
        String version = (String) docServiceProvider.getDocumentService(docEntry.getMimeType()).getConfig().get("draftFormatVersion");
        boolean needUpgrade = ConcordUtil.checkDraftFormatVersion(draftDesc.getURI(), version);
        boolean isDraftDirty = DraftStorageManager.getDraftStorageManager().isDraftDirty(draftDesc);
        boolean isDraftValid = DraftStorageManager.getDraftStorageManager().isDraftValid(draftDesc, docEntry);
        this.hasACL = DocumentPageSettingsUtil.getACLState(user, docEntry);
        this.hasTrack = DocumentPageSettingsUtil.hasChangeHistory(user, docEntry);
        LOG.log(Level.INFO, "the draft status of " + docEntry.getDocUri() + " is: needUpgrade:" + needUpgrade + " isDraftDirty:"
            + isDraftDirty + " isDraftValid:" + isDraftValid + " hasACL :" + this.hasACL + " hasTrack :" + this.hasTrack);

        if (isDraftValid)
        {
          // if there is draft and needConvert is true, we should do upgrade convert.
          if (needUpgrade)
          {
            upgradeConvert = true;
            return false;
          }
          return true;
        }
        else
        {
          //If the draft contain ACL, means can only edit the draft
          if(this.hasACL || this.hasTrack) return true;
          // if edit from repository, need to prevent data lost by force save the draft.
          forceSave = isDraftDirty;
          upgradeConvert = needUpgrade;
          // if upload new version enabled, user can choose to keep the out of date draft.
          return forceSave && isForceUseOldDraft();
        }
      }
      else
      {
        if (docEntry.getMediaSize() <= 0 && !docEntry.isPublished())
          return true; // for new Docs document with 0 size, we create empty draft anyway.
        return false; // always edit from repository when there is no draft at all.
      }
    }
    else
    {
      draftExisted = true;
      draftDesc = docSess.getDraftDescriptor();
      return true; // always edit from draft when there is an editing draft.
    }
  }

  private void transferDraft(DocumentSession docSession)
  {
    if (docSession != null)
    {
      return;
    }

    String historyDraftUri = null;
    try
    {
      DraftDescriptor dd = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(
          ConcordUtil.retrieveFileOwnerOrgId(docEntry, user), docEntry.getRepository(), docEntry.getDocUri());
      boolean ddExisted = DraftStorageManager.getDraftStorageManager().isDraftExisted(dd);

      if (!ddExisted)
      {
        String repoId = docEntry.getRepository();
        String libraryId = docEntry.getLibraryId();
        String versionSeriesId = docEntry.getVersionSeriesId();
        IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
        IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
        List<DocHistoryBean> beans = docHisotryDAO.get(repoId, libraryId, versionSeriesId);
        Iterator<DocHistoryBean> it = beans.iterator();
        while (it.hasNext())
        {
          DocHistoryBean bean = it.next();
          historyDraftUri = bean.getDocUri();
          break;
        }

        if (historyDraftUri != null)
        {
          DraftDescriptor historyDd = DraftStorageManager.getDraftStorageManager(false).getDraftDescriptor(user.getOrgId(), repoId,
              historyDraftUri);
          boolean transferableDraftExisted = DraftStorageManager.getDraftStorageManager().isDraftExisted(historyDd);
          if (transferableDraftExisted)
          {// draft with different ID can be used by current document version, we need to transfer the existing draft from a folder a
           // another
            boolean transferDraftIsDirty = DraftStorageManager.getDraftStorageManager().isDraftDirty(historyDd);
            boolean transferDraftIsValid = DraftStorageManager.getDraftStorageManager().isContentHashSyncedWithRepo(historyDd, docEntry);
            LOG.log(Level.INFO, "Transfer Draft is dirty: ", transferDraftIsDirty);
            LOG.log(Level.INFO, "Transfer Draft is valid: ", transferDraftIsValid);

            JSONObject draftMeta = DraftStorageManager.getDraftStorageManager(false).getDraftMeta(historyDd);
            if (DraftStorageManager.getDraftStorageManager().transferDraft(historyDd, dd))
            {
              draftMeta.put(DraftMetaEnum.DOC_ID.getMetaKey(), docEntry.getDocUri());
              if (transferDraftIsValid)
              {
                draftMeta.put(DraftMetaEnum.LAST_MODIFIED.getMetaKey(), AtomDate.valueOf(docEntry.getModified()).getValue());
                draftMeta.put(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey(), docEntry.getVersion());
                draftMeta.put(DraftMetaEnum.BASE_CONTENT_HASH.getMetaKey(), docEntry.getContentHash());
                draftMeta.put(DraftMetaEnum.MIME.getMetaKey(), docEntry.getMimeType());
              }
              DraftStorageManager.getDraftStorageManager(false).setDraftMeta(dd, draftMeta);
              ConcordUtil.updateDbForTransferredDraft(historyDd, dd, user, docEntry, docEntry.getRepository(), false,
                  docEntry.getRepository(), null);
            }
            else
            {
              LOG.log(Level.WARNING, "Old Draft and New Draft Co-Existed. {0} {1}", new Object[] { historyDd, dd });
            }

          }
        }
      }
    }
    catch (DraftStorageAccessException e)
    {
      LOG.log(Level.WARNING, "Transfer Draft failed. {0} {1}", new Object[] { docEntry.getVersionSeriesId(), docEntry.getDocUri() });
    }
    catch (DraftDataAccessException e)
    {
      LOG.log(Level.WARNING, "Transfer Draft failed. {0} {1}", new Object[] { docEntry.getVersionSeriesId(), docEntry.getDocUri() });
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "Transfer Draft failed. {0} {1}", new Object[] { docEntry.getVersionSeriesId(), docEntry.getDocUri() });
    }
  }

  private void setDocHistory(final IDocumentEntry docEntry, final DraftDescriptor draftDesc)
  {
    IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
    IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
    DocHistoryBean dhb = new DocHistoryBean(docEntry.getRepository(), docEntry.getDocUri());
    dhb.setLastModified(docEntry.getModified().getTimeInMillis());
    dhb.setOrgId(draftDesc.getCustomId());
    dhb.setDocId(docEntry.getDocId());
    dhb.setVersionSeriesId(docEntry.getVersionSeriesId());
    dhb.setLibraryId(docEntry.getLibraryId());
    dhb.setCommunityId(docEntry.getCommunityId());
    dhb.setDLastVisit(Calendar.getInstance().getTime()); 
    dhb.setStatus(IDocHistoryDAO.INITIAL_STATUS);
    if (docHisotryDAO.get(dhb.getRepoId(), dhb.getDocUri()) == null)
    {          
      if( docEntry.getRepository().equalsIgnoreCase(RepositoryConstants.REPO_TYPE_ECM))
      {
        dhb.setAutoPublish(AutoPublishConfig.getAutoCheckIn());
      }
      else 
      {
        dhb.setAutoPublish(AutoPublishConfig.getAutoPublish());
      }
      
      docHisotryDAO.add(dhb);
    }
    else
    {
      docHisotryDAO.update(dhb);
    }
  }

  public void exec(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
  {
    LOG.entering(CLASS_NAME, "exec " + docEntry.getDocId() + " " + docEntry.getMimeType());

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), " have no permission ")
          .toString());
      request.setAttribute(ATTR_ERROR_CODE, RepositoryAccessException.EC_REPO_NOEDITPERMISSION);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
    boolean isSessionClosing = SessionManager.getInstance().isSessionClosing(docEntry);
    DocumentSession docSession = SessionManager.getInstance().getSession(docEntry.getRepository(), docEntry.getDocUri());
    if (RepositoryServiceUtil.draftTransferable(docEntry.getRepository()))
    {
      if (docSession != null && docSession.getPublishing())
      {
        LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(),
            "ECM/CCM Document " + docEntry.getDocId() + " is publishing by another user.").toString());
        int nErrorCode = RepositoryAccessException.EC_REPO_CANNOT_EDIT_LOCKED_DOC;
        request.setAttribute(ATTR_ERROR_CODE, nErrorCode);
        request.getRequestDispatcher(ERROR_JSP).forward(request, response);
        return;
      }
      transferDraft(docSession);
    }

    // check draft status
    boolean shouldEditFromRepository = false;
    try
    {
      shouldEditFromRepository = !shouldEditFromDraft(docSession);
    }
    catch (ConcordException e)
    {
      LOG.log(Level.SEVERE, "Access error happens when check view from draft or repo, status code: "
          + HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e);
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }

    JSONObject multitenancyConfig = Platform.getConcordConfig().getSubConfig("multitenancy");
    if (multitenancyConfig != null)
    {
      request.setAttribute("mt_enabled", Boolean.valueOf((String) multitenancyConfig.get("enablement")));
    }
    else
    {
      request.setAttribute("mt_enabled", false);
    }

    JSONObject sessionConfig = Platform.getConcordConfig().getSubConfig("session");
    if (sessionConfig != null)
    {
      request.setAttribute("login_retry", Boolean.valueOf((String) sessionConfig.get("login_retry")));
    }
    else
    {
      request.setAttribute("login_retry", false);
    }

    if (shouldEditFromRepository)
    {
      // dirty draft is out of date, caused by upload new version
      if (draftDesc != null && Boolean.TRUE.equals(draftDesc.isDraftOutOfDate()) && forceSave)
      {
        // if this is a force reconvert request caused by document draft is out of date, need user make decision, load new version or
        // keep the old one. This logic didn't consider version change during user make decision.
        if (contentPath.equalsIgnoreCase("content"))
        {
          boolean conflictLock = false;
          try
          {
            LOG.log(Level.INFO, "Lock document " + docEntry.getDocId() + " to avoid decision conflict.");
            DocumentEntryUtil.lock(user, docEntry);
            conflictLock = true;
          }
          catch (RepositoryAccessException e)
          {
            LOG.log(Level.SEVERE, e.getErrMsg(), e);
            int nErrorCode = e.getErrCode();
            if (nErrorCode == -1)
            {
              String lockerId = docEntry.getLockOwner()[0];
              LOG.log(Level.WARNING, "Document " + docEntry.getDocId() + " is locked by user " + lockerId + ".");
              if (!user.getId().equalsIgnoreCase(lockerId))
              {
                LOG.severe(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                    " locked by user %s ", new Object[] { lockerId })).toString());
                nErrorCode = RepositoryAccessException.EC_REPO_NOEDITPERMISSION;
                request.setAttribute(ATTR_ERROR_CODE, nErrorCode);
                request.getRequestDispatcher(ERROR_JSP).forward(request, response);
                return;
              }
            }
            else
            {
              LOG.severe(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                  " accessed repository got exception, error message: %s .", new Object[] { e })).toString());
              request.setAttribute(ATTR_ERROR_CODE, nErrorCode);
              request.getRequestDispatcher(ERROR_JSP).forward(request, response);
              return;
            }
          }

          try
          {
            // update document entry according to existing draft
            IDocumentEntry draftDocEntry = DocumentEntryUtil.getEntry(user, docEntry.getRepository(), docEntry.getDocUri(), true);
            request.setAttribute("jobId", "0");
            request.setAttribute("doc_mimeType", draftDocEntry.getMimeType());
            request.setAttribute("isDraftOutOfDate", true);
            request.setAttribute("hasConflictLock", conflictLock);
            LOG.log(Level.INFO, "Draft is out of date, need user to decide whether load new content from repository or not.");
            serveEditorPage(request, response, draftDocEntry);
            return;
          }
          catch (ConcordException e)
          {
            LOG.log(Level.SEVERE, "Data access error happens when read draft meta, status code "
                + HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
          }
        }
        else
        {
          serveAttachment(request, response);
          return;
        }
      }
      request.setAttribute("editFromRepository", "true");
      boolean shouldRenameDoc = false;
      ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();
      jContext.mediaURI = docEntry.getDocUri();
      String deepDetectKey = "edit_deepdetect_" + docEntry.getDocUri();
      deepDetectKey = URLEncoder.encode(deepDetectKey, "UTF-8");
      JSONObject json = ServiceUtil.getJSONDataFromCookie(request.getCookies(), deepDetectKey);
      if (json != null)
      {
        String format = (String) json.get("correctFormat");
        if (format != null && !format.equals(""))
        {
          String mime = Platform.getMimeType("." + format);
          shouldRenameDoc = (mime != null && !mime.equals(docEntry.getMimeType()));
          jContext.sourceMime = mime;
          docEntry.setMimeType(mime);  
        }
      }
      else
      {
        jContext.sourceMime = docEntry.getMimeType();
      }

      /*
       * Ensure the limits check based on the corrected MIME type.
       */
      {
        IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
        IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
        DocHistoryBean docHistoryBean = docHisotryDAO.get(docEntry.getRepository(), docEntry.getDocUri());
        boolean everAccess = docHistoryBean != null && docHistoryBean.getLastModified() == docEntry.getModified().getTimeInMillis();
        String mimeType = docEntry.getMimeType();
        IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
        long size = docEntry.getMediaSize();
        JSONObject limits = (JSONObject) docSrv.getConfig().get("limits");

        if ("text/csv".equals(mimeType) && LimitsUtil.exceedTextFileSizeLimit(size, limits))
        {
          // CSV file exceed limits
          LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(),
              " document is too large . ").toString());
          request.setAttribute(ATTR_ERROR_CODE, OutOfCapacityException.EC_OUTOF_CAPACITY);
          request.getRequestDispatcher(ERROR_JSP).forward(request, response);
          return;
        }
        if (!everAccess && !LimitsUtil.accessByMobile(request)
            && LimitsUtil.exceedLimits(docEntry.getMediaSize(), (JSONObject) docSrv.getConfig().get("limits")))
        {
          // File exceed limits
          LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(),
              " document is too large . ").toString());
          request.setAttribute(ATTR_ERROR_CODE, OutOfCapacityException.EC_OUTOF_CAPACITY);
          request.getRequestDispatcher(ERROR_JSP).forward(request, response);
          return;
        }
        if (!everAccess && LimitsUtil.accessByMobile(request) && LimitsUtil.exceedMobileSizeLimit(request, docEntry, docSrv))
        {
          LOG.warning(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(),
              " document exceeds size limitation on Mobile . ").toString());
          request.setAttribute(ATTR_MOBILE_ERROR_MSG, LimitsUtil.getShowSizeOfMobile(docSrv));
          request.setAttribute(ATTR_ERROR_CODE, OutOfCapacityException.EC_OUTOF_CAPACITY_File_Size_Mobile);
          request.getRequestDispatcher(ERROR_JSP).forward(request, response);
          return;
        }
      }

      jContext.forceSave = forceSave;
      jContext.upgradeConvert = upgradeConvert;
      if (jContext.upgradeConvert)
      { // reset source mime, target mime, modified, uri according to current draft if it's upgrade convert
        try
        {
          JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDesc);
          String mime = (String) draftMeta.get(DraftMetaEnum.MIME.getMetaKey());
          jContext.modified = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.LAST_MODIFIED.getMetaKey())).getCalendar()
              .getTimeInMillis();
          jContext.sourceMime = mime;
          jContext.targetMime = docServiceProvider.getDocumentType(mime);
        }
        catch (DraftDataAccessException e)
        {
          LOG.log(Level.WARNING, "Failed to get draft meta when upgrade convert file: {0} and the exceptions are: {1}", new Object[] {
              jContext.mediaURI, e });
        }
      }
      else
      {
        jContext.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
        jContext.modified = docEntry.getModified().getTimeInMillis();
      }

      jContext.requester = user;
      jContext.docEntry = docEntry;
      jContext.draftDescriptor = draftDesc;

      jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), jContext.getJobId())));

      if (Job.isFinishedSuccess(jContext.getWorkingDir(), jContext.getJobId()) && draftExisted && !upgradeConvert)
      {
        if (shouldRenameDoc)
        {
          try
          {
            // Change the extension name to correct one.
            docEntry = DocumentServiceUtil.correctFileName(user, docEntry);
          }
          catch (Exception ex)
          {
            LOG.log(Level.WARNING, "Failed to correct the document file name", ex);
          }
        }

        if (contentPath.equalsIgnoreCase("content"))
        {
          request.setAttribute("jobId", jContext.getJobId());
          request.setAttribute("doc_mimeType", docEntry.getMimeType());
          serveEditorPage(request, response, docEntry);
        }
        else
        {
          serveAttachment(request, response);
        }
      }
      else
      {
        if (contentPath.equalsIgnoreCase("content"))
        {
          URLConfig config = URLConfig.toInstance();

          Job importMediaJob = new ImportDraftFromRepositoryJob(jContext);
          importMediaJob.config = config;
          String jobId = importMediaJob.schedule();

          request.setAttribute("jobId", jobId);
          request.setAttribute("jobLive", true);
          request.setAttribute("doc_mimeType", docEntry.getMimeType());
          request.setAttribute("upgradeConvert", upgradeConvert);
          serveEditorPage(request, response, docEntry);
        }
        else
        {
          /*
           * This ELSE logic is very important in that when a document in MS format was edited, it will be converted into ODF format and
           * published to repository. In those cases, EditAction's exec will be re-called for serve attachments, and in those calls for
           * attachments, Job.isFinish() will return false, MD5 changed due to the ODF format update to repository, but we still need to
           * avoid schedule new Job in those cases.
           */
          serveAttachment(request, response);
        }
      }
      /*
       * Remove this CREATE action, will be journaled as IMPORT in future //Edit success for new uploaded documents IJournalAdapter
       * journalAdapter = (IJournalAdapter) Platform.getComponent( JournalComponentImpl.COMPONENT_ID).getService(IJournalAdapter.class);
       * JournalHelper.Actor a = new JournalHelper.Actor(this.user.getEmail(), this.user.getId(), this.user.getCustomerId());
       * JournalHelper.Entity jnl_obj = new JournalHelper.Entity(JournalHelper.Objective.FILE, docEntry.getTitle(),
       * docEntry.getDocId(),user.getCustomerId()); journalAdapter.publish(new JournalMsgBuilder(JournalHelper.Component.DOCS_EDITOR, a,
       * JournalHelper.Action.CREATE, jnl_obj, JournalHelper.Outcome.SUCCESS).build());
       */
    }
    else
    {
      if (contentPath.equalsIgnoreCase("content"))
      {
        JSONObject draftMetadata = null;
        if (draftExisted)
        {
          // load draft meta data.
          try
          {
            draftMetadata = getDraftMeta(draftDesc);
          }
          catch (DraftDataAccessException e)
          {
            LOG.log(Level.SEVERE, "Data access error happens when read draft meta, status code "
                + HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
          }
        }
        else
        { // edit from draft but no draft? the new created Docs document is used but draft is removed.
          JSONObject data = new JSONObject();
          data.put("newTitle", docEntry.getTitle());
          JSONArray domainList = ConcordConfig.getInstance().getConfigList(ConfigConstants.DOMAIN_LIST_KEY);
          IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
          try
          {
            docEntry = docSrv.createDocument(user, docEntry.getRepository(), docEntry.getDocUri(), data, docEntry);
            draftMetadata = getDraftMeta(draftDesc);
            setDocHistory(docEntry, draftDesc);
          }
          catch (RepositoryAccessException e)
          {
            LOG.severe(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                " RepositoryAccessException : %s . ", new Object[] { e })).toString());
            request.setAttribute(ATTR_ERROR_CODE, e.getStatusCode());
//            HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
            HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
            request.getRequestDispatcher(ERROR_JSP).forward(request, response);
            return;
          }
          catch (UnsupportedMimeTypeException e)
          {
            LOG.severe(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                " UnsupportedMimeTypeException : %s . ", new Object[] { e })).toString());
            request.setAttribute(ATTR_ERROR_CODE, e.getErrorCode());
//            HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
            HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
            request.getRequestDispatcher(ERROR_JSP).forward(request, response);
            return;
          }
          catch (Exception e)
          {
            //            String problemId = ConcordUtil.generateProblemId();
            LOG.severe(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
                " problem id %s and Exception : %s . ", new Object[] { URLConfig.getRequestID(), e })).toString());
            // unknown error
            //            request.setAttribute("problem_id", problemId);
//            HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
            HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
            request.getRequestDispatcher(ERROR_JSP).forward(request, response);
            return;
          }
        }
        boolean showACLWarning = false;
        if(draftDesc != null && draftDesc.isDraftOutOfDate() != null)
          showACLWarning = draftDesc.isDraftOutOfDate() && this.hasACL;
        request.setAttribute("showACLWarning", showACLWarning);
        request.setAttribute("hasACL", this.hasACL);

        boolean showTrackWarning = false;
        if(draftDesc != null && draftDesc.isDraftOutOfDate() != null)
          showTrackWarning = draftDesc.isDraftOutOfDate() && this.hasTrack;
        request.setAttribute("showTrackWarning", showTrackWarning);
        request.setAttribute("hasTrack", this.hasTrack);

        ImportDraftFromRepositoryContext fakeJc = new ImportDraftFromRepositoryContext();
        String sourceMime = docEntry.getMimeType();
        String targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
        docEntry.setMimeType((String) draftMetadata.get(DraftMetaEnum.MIME.getMetaKey()));
        fakeJc.mediaURI = docEntry.getDocUri();
        fakeJc.modified = docEntry.getModified().getTimeInMillis();
        fakeJc.sourceMime = sourceMime;
        fakeJc.targetMime = targetMime;
        fakeJc.docEntry = docEntry;
        request.setAttribute("jobId", fakeJc.getJobId());

        // Check whether the session is closing, if yes, then should tell client to wait.
        if (isSessionClosing)
        {
          request.setAttribute("sessionClosing", true);
        }

        {
          RepositoryProviderRegistry service = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID)
              .getService(RepositoryProviderRegistry.class);
          IRepositoryAdapter adapter = service.getRepository(docEntry.getRepository());
          try
          {
            adapter.logEvent(user, docEntry.getDocUri(), "edit", null);
          }
          catch (UnsupportedOperationException e)
          {
            LOG.log(Level.INFO, "Log edit event failed. The logEvent call is not supported.");
          }
          catch (RepositoryAccessException e)
          {
            LOG.log(Level.SEVERE, "Log edit event failed.", e);
          }
        }
        request.setAttribute("doc_mimeType", sourceMime);
        serveEditorPage(request, response, docEntry);
      }
      else
      {
        serveAttachment(request, response);
      }
    }

    LOG.exiting(CLASS_NAME, "exec " + docEntry.getDocId() + " " + docEntry.getMimeType());
  }

  /**
   * Get draft meta data. try to get it from memory snapshot first, if not exist will read from file system.
   * 
   * @param draftDesc
   * @return
   * @throws DraftDataAccessException
   */
  private JSONObject getDraftMeta(DraftDescriptor draftDesc) throws DraftDataAccessException
  {
    if (draftDesc.getDraftMetaSnapshot() != null)
    {
      return draftDesc.clearDraftMetaSnapshot();
    }
    else
    {
      return DraftStorageManager.getDraftStorageManager().getDraftMeta(draftDesc);
    }
  }

  /**
   * Put the entitlements information as the attribute of the request, so that can get it in client.
   * 
   * @param request
   * @param response
   */
  private void packageEntitlements(HttpServletRequest request, HttpServletResponse response)
  {
    try
    {
      IEntitlementService service = (IEntitlementService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(
          IEntitlementService.class);
      Map<String, Entitlement> entitlements = service.getEntitlements(user);
      if (entitlements != null)
      {
        Iterator<Entitlement> iterator = entitlements.values().iterator();
        JSONArray entitleArray = new JSONArray();
        while (iterator.hasNext())
        {
          Entitlement entitle = iterator.next();
          entitleArray.add(entitle.toJson());
        }
        request.setAttribute("IBMDocs_Entitlements", entitleArray);
      }

      IGateKeeperService gkService = (IGateKeeperService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(
          IGateKeeperService.class);
      JSONObject features = gkService.getUserFeatures(user);
      if (features != null)
      {
        request.setAttribute("IBMDocs_GateKeeper", features);
      }
    }
    catch (Exception ex)
    {
      LOG.log(Level.WARNING, "Exception happens while getting the entitlements information for current user.", ex);
    }
  }

  /**
   * Forward to the Editor Page.
   * 
   * @throws ServletException
   * @throws IOException
   */
  private void serveEditorPage(HttpServletRequest request, HttpServletResponse response, IDocumentEntry docEntry) throws ServletException,
      IOException
  {
    JSONArray domainList = ConcordConfig.getInstance().getConfigList(ConfigConstants.DOMAIN_LIST_KEY);
    try
    {
      LOG.info(new ActionLogEntry(user, Action.EDITDOC, docEntry.getDocUri(), "mimeType: " + docEntry.getMimeType() + ", fileSize: "
          + docEntry.getMediaSize() + "bytes").toString());

      // Put the entitlements information as the attribute of the request.
      packageEntitlements(request, response);
      // put the editor in the editors database and cache, this must be done in servlet rather than DocumentEditHandler to ensure a color
      // was assigned to new joined user.
      updateEditors(user, docEntry);

      setBidiCookie(request, response);
      // forward to editor's page
//      HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);  
      HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
      DocumentServiceUtil.forwardEdit(user, docEntry, request, response);
    }
    catch (Exception e)
    {
      //      String problemId = ConcordUtil.generateProblemId();
      LOG.severe(new LogEntry( docEntry.getDocId(), URLConfig.getRequestID(), URLConfig.getResponseID(), String.format(
          " problem id %s and Exception : %s . ", new Object[] { URLConfig.getRequestID(), e })).toString());
      //      request.setAttribute("problem_id", problemId);
//      HttpXFrameOptionsUtil.appendXFrameOptionsHeader(response);
      HttpMultiDomainUtil.appendIFrameResponseHeader(request, response, domainList);
      request.getRequestDispatcher(ERROR_JSP).forward(request, response);
      return;
    }
  }

  private void serveAttachment(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException
  {
    MediaDescriptor media = null;
    try
    {
      String revision = ServiceUtil.getDataFromCookie(request.getCookies(), docEntry.getRepository() + "_" + docEntry.getDocId()
          + "_revision");
      if ((revision != null) && (revision.length() > 0))
        media = AttachmentsUtil.getRevisionAttachment(user, docEntry, revision, contentPath);
      else
        media = AttachmentsUtil.getDraftAttachment(user, docEntry, contentPath);
      if (media == null)
      {
        LOG.log(Level.WARNING, "Attachment is not found in path {0}.", contentPath);
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "get attachment error!", e);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
    boolean bMaxAge = false;
    Integer max_age = 3600; // keep the original value for max-age=3600
    JSONObject picture_cache_control = Platform.getConcordConfig().getSubConfig("picture-cache-control");
    if (picture_cache_control != null)
    {
      try
      {
        if ("true".equalsIgnoreCase((String)picture_cache_control.get("enabled")))
        {
          bMaxAge = true;
        }
        max_age = Integer.valueOf((String) picture_cache_control.get("Max-Age"));
      }
      catch (NumberFormatException nfe)
      {
        LOG.log(Level.WARNING, "concord-config.json issue deteced for picture-cache-control.", nfe);
      }
    }
    response.setContentType(media.getMimeType());
    response.setCharacterEncoding("UTF-8");
    if (bMaxAge)
    { // this will overwrite the settings in filter 
      response.setHeader("Cache-Control", "Max-Age=" + max_age);
    }
    response.setHeader("Content-disposition", "filename=" + media.getTitle());
    response.setStatus(HttpServletResponse.SC_OK);

    BufferedInputStream bis = new BufferedInputStream(media.getStream());
    ServletOutputStream out = response.getOutputStream();
    int numRead = -1;
    byte[] data = new byte[8192];
    while ((numRead = bis.read(data)) > 0)
    {
      out.write(data, 0, numRead);
    }
    bis.close();
    out.close();
  }

  private void updateEditors(UserBean caller, IDocumentEntry docEntry)
  {
    IDocumentEditorsDAO docEditorsDAO = (IDocumentEditorsDAO) Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID).getService(
        IDocumentEditorsDAO.class);
    DocumentEditorBean editor = new DocumentEditorBean(caller, docEntry);
    if (!docEditorsDAO.hasEditor(caller.getId(), docEntry.getDocUri()))
    {
      // add to cache
      EditorsList editors = EditorsListUtil.getEditorsList(caller, docEntry);
      if (editors.add(editor))
      {
        // persist the editors to database
        EditorsList.addEditorToDB(docEntry, editor);
      }
    }
  }

  private void setBidiCookie(HttpServletRequest request, HttpServletResponse response) throws ConcordException
  {
    String userIdEncoded = new BASE64Encoder().encode(user.getId().getBytes()).replace("=", "");
    Cookie[] cookies = request.getCookies();

    String bidiOnCookieKey = userIdEncoded + "_" + IPreference.bidi_isBidi;
    String bidiOnCookieValue = ServiceUtil.getDataFromCookie(cookies, bidiOnCookieKey);

    String bidiTextDirCookieKey = userIdEncoded + "_" + IPreference.bidi_textDir;
    String bidiTextDirCookieValue = ServiceUtil.getDataFromCookie(cookies, bidiTextDirCookieKey);

    if (bidiOnCookieValue == null || bidiTextDirCookieValue == null)
    {
      HashMap<String, String> bidiPrefs = BidiUtilities.getBidiPreferences(user, docEntry.getRepository());
      Object obj = bidiPrefs.get(IPreference.bidi_isBidi);
      if (obj != null)
      {
        bidiOnCookieValue = obj.toString();
      }
      else
      {
        bidiOnCookieValue = "false";
      }
      obj = bidiPrefs.get(IPreference.bidi_textDir);
      if (obj != null)
      {
        bidiTextDirCookieValue = obj.toString();
      }
      else
      {
        bidiTextDirCookieValue = "";
      }

      try
      {
        Cookie bidiOnCookie = new Cookie(bidiOnCookieKey, bidiOnCookieValue);
        bidiOnCookie.setMaxAge(-1);
        bidiOnCookie.setPath(request.getContextPath());
        response.addCookie(bidiOnCookie);

        Cookie bidiTextDirCookie = new Cookie(bidiTextDirCookieKey, bidiTextDirCookieValue);
        bidiTextDirCookie.setMaxAge(-1);
        bidiTextDirCookie.setPath(request.getContextPath());
        response.addCookie(bidiTextDirCookie);
        bidiTextDirCookie.setPath("/viewer");
        response.addCookie(bidiTextDirCookie);        
      }
      catch (Throwable e)
      {
        LOG.log(Level.WARNING, "Caught exception when set bidi cookies: ", e);
      }
    }

    request.setAttribute("bidiOn", bidiOnCookieValue);
    request.setAttribute("bidiTextDir", bidiTextDirCookieValue);
  }

  protected boolean isForceUseOldDraft()
  {
    return false;
  }
}
