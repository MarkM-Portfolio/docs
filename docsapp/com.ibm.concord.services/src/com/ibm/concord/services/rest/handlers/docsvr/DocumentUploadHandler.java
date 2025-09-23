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
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.concord.document.services.DocumentEntryUtil;
import com.ibm.concord.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.ConvertDuringUploadContext;
import com.ibm.concord.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.job.object.ConvertDuringUploadJob;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.entitlement.EntitlementComponent;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.services.rest.PostHandler;
import com.ibm.concord.session.DocumentSessionService;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.Permission;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.entitlement.IEntitlementService;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryConstants;
import com.ibm.docs.repository.RepositoryProviderRegistry;

/**
 * Handler to handle the document uploading events being sent from IC servers.
 * 
 */
public class DocumentUploadHandler implements PostHandler
{
  public static final Logger LOGGER = Logger.getLogger(DocumentUploadHandler.class.getName());

  private IDocumentServiceProvider serviceProvider;

  /**
   * 
   */
  public DocumentUploadHandler()
  {
    serviceProvider = (IDocumentServiceProvider) Platform.getComponent(DocumentServiceComponentImpl.COMPONENT_ID).getService(
        IDocumentServiceProvider.class);
  }

  /**
   * Check whether the MIME type of this document is valid or not.
   * 
   * @param docEntry
   * @return
   */
  private boolean isValidMIMEType(IDocumentEntry docEntry)
  {
    if (serviceProvider.getDocumentService(docEntry.getMimeType()) == null)
    {
      return false;
    }
    return true;
  }

  /**
   * 
   * @param docEntry
   * @param user
   * @return
   * @throws DraftStorageAccessException
   * @throws DraftDataAccessException
   */
  private boolean shouldConvert(IDocumentEntry docEntry, UserBean user) throws DraftStorageAccessException, DraftDataAccessException
  {
    if ((docEntry.getMediaSize() == 0) || docEntry.isEncrypt())
    {
      return false;
    }

    // OCS 114686
    // When a document is edited for the first time, it will be marked as IBMDocs type (DocumentEditHandler)
    // This change will cause upload conversion request sent to Docs server.
    // If DocumentUploadHandler and DocumentEditHandler are handled in two docs servers,
    // the race on draft file lock will happen.
    // So if the document is IBMDocs file, don't convert.
    DocumentSessionService service = DocumentSessionService.getInstance();
    try
    {
      String srvNameInDB = service.getServingServer(docEntry.getRepository(), docEntry.getDocUri());
      if (srvNameInDB != null)
      {
        LOGGER.log(Level.INFO, "There has been session servering the document " + docEntry.getDocUri()
            + ", so no need to start conversion during upload");
        return false;
      }
    }
    catch (Exception e)
    {
      LOGGER.log(Level.WARNING, "Exception happens while checking the serving server for document " + docEntry.getDocUri(), e);
    }

    DraftStorageManager draftStoreMgr = DraftStorageManager.getDraftStorageManager();
    DraftDescriptor draftDesc = draftStoreMgr.getDraftDescriptor(ConcordUtil.retrieveFileOwnerOrgId(docEntry, user),
        docEntry.getRepository(), docEntry.getDocUri());
    if (draftStoreMgr.isDraftExisted(draftDesc))
    {
      boolean isDraftValid = draftStoreMgr.isDraftValid(draftDesc, docEntry);

      if (!isDraftValid)
      {
        // Start conversion during upload if the draft is not valid.
        LOGGER.log(Level.INFO, "The document " + docEntry.getDocUri() + " need to start conversion during upload as draft is invalid");
        return true;
      }
      else
      {
        // Do not start conversion during upload if the draft is valid.
        LOGGER.log(Level.INFO, "The document " + docEntry.getDocUri() + " no need to start conversion during upload as draft is valid");
        return false;
      }
    }
    else
    {
      // Start conversion during upload if there is no draft at all.
      LOGGER.log(Level.INFO, "The document " + docEntry.getDocUri() + " need to start conversion during upload as there is no draft");
      
      if (docEntry.getVersionSeriesUri() != null)
      {// ECM/CCM document have different uri for different versions 
        IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
        IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
        ArrayList <DocHistoryBean> beans = docHisotryDAO.get(docEntry.getRepository(), null, docEntry.getVersionSeriesId());
        if(beans != null && beans.size() > 0)
        {// ever be edited by Docs, do not do upload convert any more.
          LOGGER.log(Level.INFO, "The document " + docEntry.getDocUri() + " no need to start conversion during upload as transferable draft existing");
          return false;                    
        }                
        else
        {
          return true;
        }
      }      
      
      return true;
    }
  }

  /**
   * 
   * @param request
   * @param response
   */
  private void startUploadConvertJob(HttpServletRequest request, HttpServletResponse response, UserBean user, IDocumentEntry docEntry, boolean isAdminUser)
  {
    String docUri = docEntry.getDocUri();
    String sourceMime = docEntry.getMimeType();
    String targetMime = serviceProvider.getDocumentType(sourceMime);
    long modified = docEntry.getModified().getTimeInMillis();

    ImportDraftFromRepositoryContext importContext = new ImportDraftFromRepositoryContext();
    importContext.mediaURI = docUri;
    importContext.sourceMime = sourceMime;
    importContext.targetMime = targetMime;
    importContext.modified = modified;
    importContext.docEntry = docEntry;
    
    String jobId = importContext.getJobId();
    File workingDir = new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docUri, jobId, false));

    if (!workingDir.exists() || !Job.isRunning(workingDir, jobId) && !Job.isFinishedSuccess(workingDir, jobId))
    {
      ConvertDuringUploadContext context = new ConvertDuringUploadContext();
      context.requester = user;
      context.mediaURI = docUri;
      context.sourceMime = sourceMime;
      context.targetMime = targetMime;
      context.modified = modified;
      context.docEntry = docEntry;
      context.isAdminUser = isAdminUser;
      String convetJobId = context.getJobId();      
      context.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docUri, convetJobId)));

      if (!Job.isRunning(context.getWorkingDir(), convetJobId) && !Job.isFinishedSuccess(context.getWorkingDir(), convetJobId))
      {
        ConvertDuringUploadJob convertDuringUploadJob = new ConvertDuringUploadJob(context);
        convertDuringUploadJob.schedule();
      }
      else
      {
        LOGGER.log(Level.INFO, "Because another upload convert job is running, so do not need to do upload convert for document " + docUri);
      }
    }
    else
    {
      LOGGER.log(Level.INFO, "Because importing job is running, so do not need to do upload convert for document " + docUri);
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.concord.services.rest.PostHandler#doPost(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws Exception
  {
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);
    boolean isAdminUser = false;
    
    IEntitlementService service = (IEntitlementService) Platform.getComponent(EntitlementComponent.COMPONENT_ID).getService(
        IEntitlementService.class);
    boolean isUserEntitled = service.isEntitled(user, IEntitlementService.ENTITLE_NAME_CONVERSION_DURING_UPLOAD);
    if (!isUserEntitled)
    {
      LOGGER.log(Level.INFO, "The user {0} is not entitled for conversion during upload", new Object[]{user.getId()});
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    IDocumentEntry docEntry = null;
    try
    {
      if(RepositoryConstants.REPO_TYPE_ECM.equalsIgnoreCase(repoId))
      {
        LOGGER.log(Level.INFO, "The user {0} is requesting to upload convert ECM document {1} in repository {2}", new Object[]{user.getId(), uri, repoId});
        RepositoryProviderRegistry repoService = (RepositoryProviderRegistry) Platform.getComponent(RepositoryComponent.COMPONENT_ID).getService(
            RepositoryProviderRegistry.class);
        docEntry = repoService.getRepository(repoId).getDocument(uri);
        isAdminUser = true;
      }
      else
      {
        docEntry = DocumentEntryUtil.getEntry(user, repoId, uri, false);
      }      
    }
    catch (RepositoryAccessException ex)
    {
      LOGGER.log(Level.SEVERE, "Exception happens while getting the entry of document " + uri + ", status code is: " + ex.getStatusCode(),
          ex);
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    catch (Exception ex)
    {
      LOGGER.log(Level.SEVERE, "Exception happens when getting the entry of document " + uri, ex);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (docEntry == null)
    {
      LOGGER.log(Level.WARNING, "Did not find the entry of document");
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    if (!Permission.EDIT.hasPermission(docEntry.getPermission()))
    {
      LOGGER
          .log(Level.WARNING, "Did not have edit permission while doing converting during upload for document {0}.", docEntry.getDocUri());
      response.sendError(HttpServletResponse.SC_FORBIDDEN);
      return;
    }

    if (!isValidMIMEType(docEntry))
    {
      // Unsupported document type.
      LOGGER.log(Level.WARNING, "Do not support to do uploading convert for the MIME type: " + docEntry.getMimeType());
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }

    try
    {
      if (shouldConvert(docEntry, user))
      {
        startUploadConvertJob(request, response, user, docEntry, isAdminUser);
      }
      else
      {
        LOGGER.log(Level.FINE, "Because the draft is valid, so do not need to do upload convert for document " + uri);
      }
    }
    catch (Throwable ex)
    {
      LOGGER.log(Level.WARNING, "Exception happens while start upload convert job for document " + uri, ex);
      response.sendError(HttpServletResponse.SC_BAD_REQUEST);
      return;
    }
  }
}
