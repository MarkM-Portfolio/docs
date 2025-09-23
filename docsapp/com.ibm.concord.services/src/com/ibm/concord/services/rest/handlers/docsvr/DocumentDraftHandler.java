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

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.ExportDraftToRepositoryContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.job.object.ExportDraftToRepositoryJob;
import com.ibm.concord.platform.Platform;
import com.ibm.docs.directory.DirectoryComponent;
import com.ibm.concord.platform.draft.DraftAction;
import com.ibm.concord.platform.draft.DraftActionEvent;
import com.ibm.concord.platform.draft.DraftComponent;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.services.rest.DeleteHandler;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.services.rest.ServiceUtil;
import com.ibm.concord.services.rest.util.ExportDraftListener;
import com.ibm.concord.services.rest.util.ExportDraftToRepositoryListener;
import com.ibm.concord.session.DocumentSession;
import com.ibm.concord.session.Participant;
import com.ibm.concord.session.SessionManager;
import com.ibm.concord.spi.beans.AbstractDocumentEntry;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.IDirectoryAdapter;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.docs.repository.RepositoryServiceUtil;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class DocumentDraftHandler implements GetHandler, PostHandler, DeleteHandler
{
  public static final Logger LOGGER = Logger.getLogger(DocumentDraftHandler.class.getName());

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String location = request.getParameter("location");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, repoId, uri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }
    
    LOGGER.info(new ActionLogEntry(user, Action.DRAFTCONTENT, "file is " + uri).toString());

    IDocumentEntry docEntry = null;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.SEVERE, e.getErrMsg(), e);
      int nErrorCode = e.getErrCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOTFOUNDDOC)
      {
        LOGGER.log(Level.WARNING, "Did not find the entry of document {0} while getting draft.", uri);
        ServiceUtil.sendError(response, HttpServletResponse.SC_NOT_FOUND, e.toJSON().toString());
        return;
      }
      else
      {
        LOGGER.log(Level.WARNING, "Error happens when getting the entry of document {0} while getting draft.", uri);
        ServiceUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.toJSON().toString());
        return;
      }
    }

    DocumentSession docSess = SessionManager.getInstance().getSession(repoId, docEntry.getDocUri());
    DraftDescriptor dd = null;
    if (docSess == null)
    {
      dd = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user),
          docEntry.getRepository(), docEntry.getDocUri());
    }
    else
    {
      dd = docSess.getDraftDescriptor();
    }

    if (DraftStorageManager.getDraftStorageManager().isDraftExisted(dd))
    {
      ServiceUtil.checkDraftValid(dd, docEntry, user);
      JSONObject json = new JSONObject();

      {
        boolean isValid = DraftStorageManager.getDraftStorageManager().isDraftValid(dd, docEntry);
        json.put("valid", isValid);
      }

      boolean isDirty = (docSess != null && docSess.isSessionDirty()) ? true : DraftStorageManager.getDraftStorageManager().isDraftDirty(dd);
      json.put("dirty", isDirty);

      {
        JSONArray draftFiles = DraftStorageManager.getDraftStorageManager().listDraftSections(dd, null);
        long totalSize = 0;
        for (int i = 0; i < draftFiles.size(); i++)
        {
          totalSize += ((Long) ((JSONObject) draftFiles.get(i)).get("size")).longValue();
        }
        json.put("size", totalSize);
      }

      {
        JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(dd);

        AtomDate created = null;
        if (draftMeta.get(DraftMetaEnum.DRAFT_CREATED.getMetaKey()) != null)
        {
          created = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.DRAFT_CREATED.getMetaKey()));
        }

        AtomDate modified = null;
        if (draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey()) != null)
        {
          modified = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey()));
        }

        JSONObject lastEditorJSONObject = new JSONObject();
        String lastEditorId = (String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID.getMetaKey());
        if (lastEditorId != null)
        {
          lastEditorJSONObject.put("id", lastEditorId);
          IDirectoryAdapter directoryAdapter = (IDirectoryAdapter) ((DirectoryComponent)Platform.getComponent(DirectoryComponent.COMPONENT_ID)).getService(
              IDirectoryAdapter.class, repoId);
          UserBean lastEditor = directoryAdapter.getById(user, lastEditorId);
          if (lastEditor != null)
          {
            lastEditorJSONObject.put("displayName", lastEditor.getDisplayName());
            lastEditorJSONObject.put("email", lastEditor.getEmail());
          }
          else
          {
            lastEditorJSONObject.put("displayName", "");
            lastEditorJSONObject.put("email", "");
          }
        }

        AtomDate visited = null;
        if (draftMeta.get(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey()) != null)
        {
          visited = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_VISIT.getMetaKey()));
        }

        String baseVersion = (String) draftMeta.get(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey());

        json.put("created", created == null ? "null" : created.toString());
        json.put("modified", modified == null ? "null" : modified.toString());
        json.put("lasteditor", lastEditorJSONObject);
        json.put("visited", visited == null ? "null" : visited.toString());
        json.put("base_version", baseVersion == null ? "null" : baseVersion);
        json.put("latest_version", docEntry.getVersion() == null ? "null" : docEntry.getVersion());
        json.put("latest_version_modifier", docEntry.getModifier() == null ? "null" : docEntry.getModifier()[0]);
        json.put("latest_version_modified", docEntry.getModified() == null ? "null" : docEntry.getModified().getTimeInMillis());
      }

      {
        JSONArray editors = new JSONArray();

        if (docSess != null)
        {
          Participant pList[] = docSess.getParticipants();
          for (Participant p : pList)
          {
            JSONObject editor = new JSONObject();
            editor.put("displayName", p.getUserBean().getDisplayName());
            editor.put("id", p.getUserBean().getId());
            editor.put("email", p.getUserBean().getEmail());
            editors.add(editor);
          }
        }

        json.put("editors", editors);
      }

      if (Boolean.valueOf(location).booleanValue())
      {
        DraftComponent draftComp = (DraftComponent) Platform.getComponent(DraftComponent.COMPONENT_ID);
        json.put("location", "<DRAFT_HOME>" + dd.getInternalURI().substring(draftComp.getDraftHome().length()));
      }
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_OK);
      json.serialize(response.getWriter(), true);
      return;
    }
    else
    {
      DraftDataAccessException ddae = new DraftDataAccessException(dd);
      LOGGER.log(Level.WARNING, "The draft of document {0} does not exist while getting draft.", docEntry.getDocUri());
      ServiceUtil.sendError(response, HttpServletResponse.SC_NOT_FOUND, ddae.toJSON().toString());
      return;
    }
  }

  /*
   * This part is NOT USE any more. private void addTaskJournal(UserBean caller, JournalHelper.Component comp, JournalHelper.Action action,
   * JournalHelper.Outcome outcome, IDocumentEntry docEntry){ IJournalAdapter journalAdapter = (IJournalAdapter) Platform.getComponent(
   * JournalComponentImpl.COMPONENT_ID).getService(IJournalAdapter.class); JournalHelper.Actor a = new
   * JournalHelper.Actor(caller.getEmail(), caller.getId(), caller.getCustomerId()); JournalHelper.Entity jnl_obj = new
   * JournalHelper.Entity(JournalHelper.Objective.FILE, docEntry.getTitle(), docEntry.getDocId(), caller.getCustomerId());
   * journalAdapter.publish(new JournalMsgBuilder(comp, a, action, jnl_obj, JournalHelper.Outcome.SUCCESS).build()); }
   */
  private void handleNoPermissionError(HttpServletResponse response) throws Exception
  {
    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    JSONObject json = new JSONObject();
    json.put("status", "error");
    json.put("error_code", RepositoryAccessException.EC_REPO_NOEDITPERMISSION);
    json.put("error_msg", "You have no editing permission.");
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    json.serialize(response.getOutputStream());
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    final UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    final String clientId = request.getSession().getId();
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    final String repoId = pathMatcher.group(1);
    final String uri = pathMatcher.group(2);
    String method = request.getParameter("method");
    String soverwrite = request.getParameter("overwrite");

    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, repoId, uri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }

    IDocumentEntry docEntry = null;
    try
    {
      DocumentEntryHelper.clearEntryCache(user, uri);
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.SEVERE, e.getErrMsg(), e);
      int nErrorCode = e.getErrCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOTFOUNDDOC)
      {
        if (docEntry == null)
        {
          if ("saveas".equalsIgnoreCase(method))
          {
            DocumentSession docSess = SessionManager.getInstance().getSession(repoId, uri);
            if (docSess == null || docSess.getParticipant(clientId) == null)
            {
              LOGGER.log(Level.WARNING, "Session check failed when save as draft to repository. {0}", uri);
              ServiceUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN);
              return;
            }
            else
            {
              docEntry = new AbstractDocumentEntry()
              {
                private String mime = null;

                public String getDocUri()
                {
                  return uri;
                }

                public String getDocId()
                {
                  return null;
                }

                public String getMimeType()
                {
                  DocumentSession docSess = SessionManager.getInstance().getSession(repoId, uri);
                  if (mime == null && docSess != null)
                  {
                    DraftDescriptor dd = docSess.getDraftDescriptor();
                    try
                    {
                      mime = (String) DraftStorageManager.getDraftStorageManager().getDraftMeta(dd).get(DraftMetaEnum.MIME.getMetaKey());
                    }
                    catch (DraftDataAccessException e)
                    {
                      LOGGER.log(Level.SEVERE, "Save headless draft failed due to mime type missing from draft meta file.", e);
                    }
                  }
                  return mime;
                }

                public String getRepository()
                {
                  return repoId;
                }

                public long getMediaSize()
                {
                  return -1;
                }

                public Set<Permission> getPermission()
                {
                  return Permission.EDIT_SET;
                }

                public boolean isPublished()
                {
                  return true;
                }

              };
            }
          }
          else
          {
            LOGGER.log(Level.WARNING, "Did not find the entry of document {0} while doing {1}.", new Object[] { uri, method });
            /*
             * HTTP: GONE/410 The requested resource is no longer available at the server and no forwarding address is known. This condition
             * is expected to be considered permanent. Clients with link editing capabilities SHOULD delete references to the Request-URI
             * after user approval.
             */
            ServiceUtil.sendError(response, HttpServletResponse.SC_GONE);
            return;
          }
        }
      }
      else if (nErrorCode == RepositoryAccessException.EC_REPO_NOPERMISSION)
      {
        LOGGER.log(Level.WARNING, "No permission error happens when getting the entry of document {0} in doing {1}.", new Object[] { uri,
            method });
        handleNoPermissionError(response);
        return;
      }
      else
      {
        LOGGER.log(Level.WARNING, "Repository access error happens when getting the entry of document {0} in doing {1}.", new Object[] {
            uri, method });
        ServiceUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN);
        return;
      }
    }
    catch (Exception e)
    {
      LOGGER.log(Level.SEVERE, "Error happens when getting the entry of document " + uri + " while doing " + method, e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOGGER.log(Level.WARNING, "Did not have edit permission while posting draft of document {0}.", docEntry.getDocUri());
      handleNoPermissionError(response);
      return;
    }

    DocumentSession docSess = SessionManager.getInstance().getSession(repoId, docEntry.getDocUri());
    DraftDescriptor dd = null;
    if (docSess == null)
    {
      dd = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user),
          docEntry.getRepository(), docEntry.getDocUri());
    }
    else
    {
      dd = docSess.getDraftDescriptor();
    }

    if (!DraftStorageManager.getDraftStorageManager().isDraftExisted(dd))
    {
      LOGGER.log(Level.WARNING, "The draft does not exist while posting draft of document {0}.", docEntry.getDocUri());
      ServiceUtil.sendError(response, HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    if (docSess != null)
    {
      // Call DocumentSession.autoSave() here to apply all the messages into content.html/js.
      docSess.autoSave();
    }

    if ("saveas".equalsIgnoreCase(method))
    {
      doSaveAs(request, response, docEntry, dd, user);
      // addTaskJournal(user, JournalHelper.Component.DOCS_EDITOR, JournalHelper.Action.SAVEAS, JournalHelper.Outcome.SUCCESS, docEntry);
    }
    else
    {
      // publish as default
      boolean overwrite = (soverwrite != null) ? soverwrite.equalsIgnoreCase("true") : false; 
      doPublish(request, response, docEntry, dd, user, false, false, true, overwrite);
      // addTaskJournal(user, JournalHelper.Component.DOCS_EDITOR, JournalHelper.Action.PUBLISH, JournalHelper.Outcome.SUCCESS, docEntry);
    }
  }

  private boolean doPublish(HttpServletRequest request, HttpServletResponse response, IDocumentEntry docEntry, DraftDescriptor dd,
      UserBean user, boolean noBody, boolean sync, boolean needBackendPDF, boolean overwrite) throws Exception
  {
    boolean respectCache = Boolean.valueOf(request.getParameter("respect_cache"));

    JSONObject jsonBody = new JSONObject();
    if (!noBody)
    {
      try
      {
        jsonBody = JSONObject.parse(request.getReader());
      }
      catch (Exception e)
      {
        LOGGER.log(Level.WARNING, "Error parsing request body: ", e);
        ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
        return false;
      }
    }

    try
    {
      DraftStorageManager draftMgr = DraftStorageManager.getDraftStorageManager();
      JSONObject draftMeta = draftMgr.getDraftMeta(dd);

      IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
          DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);

      ExportDraftToRepositoryContext jContext = new ExportDraftToRepositoryContext();
      jContext.mediaURI = docEntry.getDocUri();
      jContext.customerId = user.getCustomerId();
      jContext.sourceMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
      jContext.targetMime = docEntry.getMimeType();
      jContext.draftModified = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey())).getTime();
      jContext.asNewFile = false;
      jContext.needBackendPDF = needBackendPDF;

      jContext.requester = user;
      jContext.docEntry = docEntry;
      jContext.requestData = jsonBody;
      jContext.draftDescriptor = dd;
      jContext.overwrite = overwrite;

      URLConfig config = URLConfig.toInstance();

      /*
       * The customer may would like to always save the draft as a new version in the repository, even the SAME content had ever be saved as
       * as a new version.
       */
      jContext.setHeadless(!respectCache);

      jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), jContext.getJobId())));

      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_OK);

      if ((respectCache && !Job.isFinishedSuccess(jContext.getWorkingDir(), jContext.getJobId())) || !respectCache)
      {
        DocumentSession docSess = SessionManager.getInstance().getSession(docEntry.getRepository(), docEntry.getDocUri());
        if(docSess!= null)
        {
          JSONObject message = new JSONObject();
          message.put("type", "prepublishNotify");
          message.put("user", user.getId());
          message.put("overwrite", Boolean.toString(overwrite));
          message.put("data", DocumentEntryHelper.toJSON(docEntry));
          docSess.publishServerMessage(message);          
        }
        Job exportMediaJob = new ExportDraftToRepositoryJob(jContext);
        exportMediaJob.config = config;
        
        ExportDraftListener lister = new ExportDraftListener();
        exportMediaJob.addListener(lister);
        
        ExportDraftToRepositoryListener exportMediaJobListener = new ExportDraftToRepositoryListener();
        exportMediaJob.addListener(exportMediaJobListener);

        String jobId = exportMediaJob.schedule();
        if (sync)
        {
          exportMediaJob.join();
          JobExecutionException jExp = exportMediaJob.getError();
          if (jExp != null)
          {
            throw jExp;
          }
        }
        else
        {
          JSONObject json = new JSONObject();
          json.put("id", jobId);
          json.put("status", "pending");
          response.setContentType("application/json");
          response.setCharacterEncoding("UTF-8");
          json.serialize(response.getWriter(), true);
        }
      }
      else
      {
        JSONObject json = new JSONObject();
        json.put("id", jContext.getJobId());
        json.put("status", "complete");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        json.serialize(response.getWriter(), true);
      }
    }
    catch (DraftDataAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Data access error happens while publishing the draft of document " + docEntry.getDocUri(), e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return false;
    }
    catch (JobExecutionException e)
    {
      if (String.valueOf(RepositoryAccessException.EC_REPO_OUT_OF_SPACE).equals(e.getErrorCode()))
      {
        LOGGER.log(Level.WARNING, "Repository Out of Space.");
        ServiceUtil.sendError(response, HttpServletResponse.SC_CONFLICT);
        return false;
      }
      else
      {
        LOGGER.log(Level.WARNING, "Job execution error happens while saving the draft of document {0}.", docEntry.getDocUri());
        ServiceUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        return false;
      }
    }
    catch (Exception e)
    {
      LOGGER.log(Level.SEVERE, "Error happens while publishing the draft of document " + docEntry.getDocUri(), e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
      return false;
    }
    return true;
  }

  private boolean doSaveAs(HttpServletRequest request, HttpServletResponse response, IDocumentEntry docEntry, DraftDescriptor dd, UserBean user)
      throws Exception
  { 
    JSONObject jsonBody = null;
    try
    {
      jsonBody = JSONObject.parse(request.getReader());
    }
    catch (Exception e)
    {
      LOGGER.log(Level.WARNING, "Error parsing request body: ", e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
      return false;
    }
    
    String communityUuid = request.getParameter("communityuuid");
    String folderUri = null;
    if (communityUuid != null)
    {
      LOGGER.log(Level.INFO, "communityuuid is " + communityUuid);
      try
      {
        folderUri = RepositoryServiceUtil.getFolderUri(user, docEntry.getRepository(), communityUuid);
        jsonBody.put("folderUri", folderUri);
        LOGGER.log(Level.INFO, "folderUri is " + folderUri);
      }
      catch (RepositoryAccessException e)
      {
        LOGGER.log(Level.SEVERE, "Failed to find communityuuid " + communityUuid, e);
        response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      } 
    }

    DraftStorageManager draftMgr = DraftStorageManager.getDraftStorageManager();
    try
    {
      JSONObject draftMeta = draftMgr.getDraftMeta(dd);

      IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
          DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);

      ExportDraftToRepositoryContext jContext = new ExportDraftToRepositoryContext();
      jContext.mediaURI = docEntry.getDocUri();
      jContext.customerId = user.getCustomerId();
      jContext.sourceMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
      jContext.targetMime = docEntry.getMimeType();
      jContext.draftModified = AtomDate.valueOf((String) draftMeta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey())).getTime();
      jContext.asNewFile = true;
      jContext.needBackendPDF = false;

      jContext.requester = user;
      jContext.docEntry = docEntry;
      jContext.requestData = jsonBody;
      jContext.draftDescriptor = dd;

      URLConfig config = URLConfig.toInstance();

      /*
       * The customer may would like to always save the draft as a new file in the repository, even the SAME content had ever be saved as
       * the same new file.
       */
      jContext.setHeadless(true);

      jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), jContext.getJobId())));

      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      response.setStatus(HttpServletResponse.SC_OK);

      Job exportMediaJob = new ExportDraftToRepositoryJob(jContext);
      exportMediaJob.config = config;
      
      ExportDraftToRepositoryListener exportMediaJobListener = new ExportDraftToRepositoryListener();
      exportMediaJob.addListener(exportMediaJobListener);
      
      String jobId = exportMediaJob.schedule();

      JSONObject json = new JSONObject();
      json.put("id", jobId);
      json.put("status", "pending");
      response.setContentType("application/json");
      response.setCharacterEncoding("UTF-8");
      json.serialize(response.getWriter(), true);
    }
    catch (DraftDataAccessException e)
    {
      LOGGER.log(Level.SEVERE, "Data access error happens while saving the draft of document " + docEntry.getDocUri() + " to another one.",
          e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return false;
    }
    catch (Exception e)
    {
      LOGGER.log(Level.WARNING, "Error happens while save the draft of document " + docEntry.getDocUri() + " to another one.", e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
      return false;
    }
    return true;
  }

  public void doDelete(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    boolean forcePublish = Boolean.valueOf(request.getParameter("publish"));
    String soverwrite = request.getParameter("overwrite");
    LOGGER.log(Level.INFO, user.getId() + " is discarding the draft of " + uri);

    // Check whether the request should be served by current server or not. If not, then should return the error status 471.
    if (ServiceUtil.checkServingSrv(request, response, repoId, uri, false) != ServiceUtil.SERVING_STATUS_SUCCESS)
    {
      ServiceUtil.setWrongSrvResponse(response);
      return;
    }

    IDocumentEntry docEntry;
    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, true);
      if (docEntry == null)
      {
        LOGGER.log(Level.WARNING, "Did not find the entry of document {0} while discarding draft.", uri);
        ServiceUtil.sendError(response, HttpServletResponse.SC_NOT_FOUND);
        return;
      }
    }
    catch (RepositoryAccessException e)
    {
      LOGGER.log(Level.SEVERE, e.getErrMsg(), e);
      int nErrorCode = e.getErrCode();
      if (nErrorCode == RepositoryAccessException.EC_REPO_NOTFOUNDDOC)
      {
        LOGGER.log(Level.WARNING, "Did not find the entry of document {0} while discarding draft.", uri);
        ServiceUtil.sendError(response, HttpServletResponse.SC_NOT_FOUND);
        return;
      }

      LOGGER.log(Level.WARNING, "Repository access error happens when getting the entry of document {0} in discarding draft.", uri);
      ServiceUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception e)
    {
      LOGGER.log(Level.SEVERE, "Error happens when getting the entry of document " + uri + " in discarding draft.", e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOGGER.log(Level.WARNING, "Did not have edit permission while discarding draft of document {0}.", docEntry.getDocUri());
      ServiceUtil.sendError(response, HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    DocumentSession docSess = SessionManager.getInstance().getSession(repoId, docEntry.getDocUri());
    DraftDescriptor dd = null;
    if (docSess == null)
    {
      dd = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user),
          docEntry.getRepository(), docEntry.getDocUri());
    }
    else
    {
      dd = docSess.getDraftDescriptor();
    }

    if (!DraftStorageManager.getDraftStorageManager().isDraftExisted(dd))
    {
      LOGGER.log(Level.WARNING, "The draft does not exist while discarding draft of document {0}.", docEntry.getDocUri());
      ServiceUtil.sendError(response, HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    if (docSess != null && docSess.getParticipantsCount() == 1 && docSess.getParticipant(request.getSession().getId()) != null)
    {
      // end the document session before continue
      SessionManager.getInstance().closeSession(docEntry);
    }
    else
    {
      LOGGER.log(Level.WARNING, "There are other sessions existed for this draft.", docEntry.getDocUri());
      ServiceUtil.sendError(response, HttpServletResponse.SC_CONFLICT);
      return;
    }

    try
    {
      if (forcePublish && DraftStorageManager.getDraftStorageManager().isDraftDirty(dd))
      {
        boolean overwrite = (soverwrite != null) ? soverwrite.equalsIgnoreCase("true") : false; 
        if(!doPublish(request, response, docEntry, dd, user, true, true, false, overwrite)){
          LOGGER.log(Level.SEVERE, "Draft force publish failed, cancel revert.", docEntry.getDocUri());
          return;
        }
        IComponent repoComp = Platform.getComponent(RepositoryComponent.COMPONENT_ID);
        RepositoryProviderRegistry service = (RepositoryProviderRegistry) repoComp.getService(RepositoryProviderRegistry.class);
        IRepositoryAdapter repositoryAdapter = service.getRepository(docEntry.getRepository());
        IDocumentEntry[] versions = repositoryAdapter.getVersions(user, docEntry);
        // DraftActionEvent event = new DraftActionEvent(null, DraftAction.SYNC, versions);
        // DraftStorageManager.getDraftStorageManager(false).notifyListener(event);
        IDocumentEntry restoreVersion = versions.length == 1 ? versions[0] : versions[1];
        IDocumentEntry newDocEntry = repositoryAdapter.restoreVersion(user, docEntry.getDocUri(), restoreVersion.getDocId());
        Map<String, Object> data = new HashMap<String, Object>();
        data.put("restoreVersion", restoreVersion.getVersion());
        data.put("newVersion", newDocEntry.getVersion());
        data.put("user", user);
        DraftActionEvent event = new DraftActionEvent(dd, DraftAction.RESTORE, data);
        DraftStorageManager.getDraftStorageManager().notifyListener(event);
      }

      if (SessionManager.getInstance().getSession(repoId, docEntry.getDocUri()) == null)
      {
        boolean toOrphan = DocumentServiceUtil.isOrphanCommentsFileType(docEntry.getExtension());
        DraftStorageManager.getDraftStorageManager().discardDraft(dd, toOrphan);
      }
      else
      {
        LOGGER.log(Level.WARNING, "There are newly created sessions existed for this draft.", docEntry.getDocUri());
        ServiceUtil.sendError(response, HttpServletResponse.SC_CONFLICT);
        return;
      }
    }
    catch (ConcordException e)
    {
      LOGGER.log(Level.SEVERE, "Draft access exception happens while discard draft.", e);
      ServiceUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      return;
    }
    /*
     * DISCARD will be removed from JOURNAL, and this is refactored as another IMPORT from Files repository IJournalAdapter journalAdapter =
     * (IJournalAdapter) Platform.getComponent( JournalComponentImpl.COMPONENT_ID).getService(IJournalAdapter.class); JournalHelper.Actor a
     * = new JournalHelper.Actor(user.getEmail(), user.getId(), user.getCustomerId()); JournalHelper.Entity jnl_obj = new
     * JournalHelper.Entity(JournalHelper.Objective.FILE, docEntry.getTitle(), docEntry.getDocId(), user.getCustomerId());
     * journalAdapter.publish(new JournalMsgBuilder(JournalHelper.Component.DOCS_EDITOR, a, JournalHelper.Action.DISCARD, jnl_obj,
     * JournalHelper.Outcome.SUCCESS).build()); response.setStatus(HttpServletResponse.SC_OK);
     */
  }
}
