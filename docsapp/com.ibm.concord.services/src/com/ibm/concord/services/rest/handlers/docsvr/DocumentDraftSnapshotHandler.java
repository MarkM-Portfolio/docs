/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.services.rest.handlers.docsvr;

import java.io.File;
import java.io.IOException;
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
import com.ibm.concord.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.job.object.ImportDraftFromRepositoryJob;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.util.ActionLogEntry;
import com.ibm.concord.platform.util.ActionLogEntry.Action;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.services.rest.GetHandler;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.authentication.IAuthenticationAdapter;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.docs.framework.IComponent;
import com.ibm.icu.util.Calendar;
import com.ibm.json.java.JSONObject;

public class DocumentDraftSnapshotHandler implements GetHandler
{
  private static final Logger LOGGER = Logger.getLogger(DocumentDraftSnapshotHandler.class.getName());

  private boolean viewSnapshotEnabled = DraftStorageManager.getDraftStorageManager().viewerSnapshotEnabled();

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException
  {
    if (!viewSnapshotEnabled)
    {
      JSONObject json = new JSONObject();
      json.put("status", "error");
      json.put("error_code", "500");
      json.serialize(response.getWriter(), true);
      return;
    }
    UserBean user = (UserBean) request.getAttribute(IAuthenticationAdapter.REQUEST_USER);
    Matcher pathMatcher = (Matcher) request.getAttribute("path.matcher");
    String repoId = pathMatcher.group(1);
    String uri = pathMatcher.group(2);

    IDocumentEntry docEntry = null;
    String jobStatus = "complete";
    int errorCode = 0;

    try
    {
      docEntry = DocumentEntryUtil.getEntry(user, repoId, uri);
      DraftDescriptor draftDesc = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(
          ConcordUtil.retrieveFileOwnerOrgId(docEntry, user), docEntry.getRepository(), docEntry.getDocUri());
      boolean needUpgrade = false;
      boolean isSnapshotExisted = DraftStorageManager.getDraftStorageManager().isSnapshotExisted(draftDesc);
      long snapshotTimeStamp = DraftStorageManager.getDraftStorageManager().readTimeStamp(draftDesc.getSnapshotMediaURI());
      long docTimeStamp = docEntry.getModified().getTime().getTime();
      if (isSnapshotExisted)
      {
        IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
            DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);
        String version = (String) docServiceProvider.getDocumentService(docEntry.getMimeType()).getConfig().get("draftFormatVersion");
        needUpgrade = ConcordUtil.checkDraftFormatVersion(draftDesc.getSnapshotMediaURI(), version);
        if (docTimeStamp <= snapshotTimeStamp && !needUpgrade)
        {
          this.updateSnapshotLastVisit(docEntry);
        }
        else
        {
          triggerConversionJob(docEntry, user, draftDesc);
          jobStatus = "submit";
        }
      }
      else
      {
        if (DraftStorageManager.getDraftStorageManager().isDraftExisted(draftDesc)
            && DraftStorageManager.getDraftStorageManager().isDraftValid(draftDesc, docEntry))
        {
          IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
              DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);
          String version = (String) docServiceProvider.getDocumentService(docEntry.getMimeType()).getConfig().get("draftFormatVersion");
          needUpgrade = ConcordUtil.checkDraftFormatVersion(draftDesc.getURI(), version);
          if (needUpgrade)
          {
            triggerConversionJob(docEntry, user, draftDesc);
          }
          else
          {
            DraftStorageManager.getDraftStorageManager().cleanSnapshotReadableTag(draftDesc);
            DraftStorageManager.getDraftStorageManager().generateSnapshotFromDraft(draftDesc, docEntry);
            this.updateSnapshotLastVisit(docEntry);
          }
        }
        else
        {
          triggerConversionJob(docEntry, user, draftDesc);
        }
        jobStatus = "submit";
      }
      LOGGER.info(new ActionLogEntry(user, Action.SNAPSHOT, docEntry.getDocUri(), "sourceType: " + docEntry.getMimeType()
          + ", needUpgrade:" + needUpgrade + ", valid:" + (docTimeStamp <= snapshotTimeStamp)).toString() + ", size=" + docEntry.getMediaSize());
    }
    catch (ConcordException e)
    {
      jobStatus = "error";
      errorCode = e.getErrCode();
      LOGGER.log(Level.SEVERE, "Failed to generate snapshot for document. docID: " + uri, e);
    }
    JSONObject json = new JSONObject();
    json.put("status", jobStatus);
    json.put("error_code", errorCode);
    json.serialize(response.getWriter(), true);
  }

  private void updateSnapshotLastVisit(IDocumentEntry docEntry)
  {
    IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
    IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
    String repId = docEntry.getRepository();
    String docUri = docEntry.getDocUri();

    DocHistoryBean bean = docHisotryDAO.get(repId, docUri);
    if (bean != null)
    {
      bean.setSLastVisit(Calendar.getInstance().getTime());
      docHisotryDAO.updateSnapshotLastVisit(bean);
    }
  }

  private void triggerConversionJob(IDocumentEntry docEntry, UserBean user, DraftDescriptor draftDesc) throws DraftStorageAccessException,
      DraftDataAccessException
  {
    DraftStorageManager.getDraftStorageManager().cleanSnapshotReadableTag(draftDesc);

    URLConfig config = URLConfig.toInstance();

    ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();
    jContext.mediaURI = docEntry.getDocUri();
    jContext.sourceMime = docEntry.getMimeType();
    jContext.requester = user;
    jContext.docEntry = docEntry;
    jContext.draftDescriptor = draftDesc;
    jContext.forceSave = false;
    jContext.getSnapshot = true;

    String jobId = jContext.getJobId();

    File workingDir = new File(JobUtil.getDefaultWorkingDir(user.getCustomerId(), docEntry.getDocUri(), jobId));
    jContext.setWorkingDir(workingDir);

    Job importMediaJob = new ImportDraftFromRepositoryJob(jContext);
    importMediaJob.config = config;

    LOGGER.log(Level.INFO, "Trigger ImportMediaJob for document {0}", new Object[] { docEntry.getDocUri() });
    importMediaJob.schedule();

    return;
  }
}
