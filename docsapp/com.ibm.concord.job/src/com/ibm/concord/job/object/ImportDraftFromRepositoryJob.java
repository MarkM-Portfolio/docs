/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.job.object;

import java.io.File;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.config.AutoPublishConfig;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.context.ConvertDuringUploadContext;
import com.ibm.concord.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.job.listener.ImportDraftFromRepositoryJobListener;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.draft.DraftAction;
import com.ibm.concord.platform.draft.DraftActionEvent;
import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.ImportDocumentContext;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.IRepositoryAdapter;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.docs.repository.RepositoryComponent;
import com.ibm.docs.repository.RepositoryProviderRegistry;
import com.ibm.icu.util.Calendar;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ImportDraftFromRepositoryJob extends Job
{
  private static final Logger LOGGER = Logger.getLogger(ImportDraftFromRepositoryJob.class.getName());

  private ImportDraftFromRepositoryContext idc;

  public ImportDraftFromRepositoryJob(ImportDraftFromRepositoryContext idc)
  {
    super(idc);
    ImportDraftFromRepositoryJobListener importDraftJobListener = new ImportDraftFromRepositoryJobListener();
    this.addListener(importDraftJobListener);

    if (idc.mediaURI == null)
    {
      throw new NullPointerException();
    }

    this.idc = idc;
  }

  public Object exec() throws JobExecutionException
  {
    LOGGER.entering(ImportDraftFromRepositoryJob.class.getName(), "exec");
    File resultFile = new File(idc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX);
    if (resultFile.exists())
    {
      if (!resultFile.delete())
      {
        LOGGER.log(Level.WARNING, "failed to delete file " + resultFile.getAbsolutePath());
      }
    }
    IDocumentEntry newDocEntry = null;
    try
    {
      IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services")
          .getService(IDocumentServiceProvider.class);
      if (idc.forceSave && !idc.upgradeConvert)
      {
        JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(idc.draftDescriptor);
        String newMime = idc.docEntry.getMimeType();
        String draftMime = (String) draftMeta.get(DraftMetaEnum.MIME.getMetaKey());
        IDocumentService docService = null;
        if (!newMime.equals(draftMime))
        {
          docService = docServiceProvider.getDocumentService(draftMime);
          idc.docEntry.setMimeType(draftMime);
          docService.publish(idc.docEntry, idc.requester, new JSONObject(), new JSONArray(), idc.overwrite);
          DraftStorageManager.getDraftStorageManager().discardDraft(idc.draftDescriptor);
        }
        else
        {
          docService = docServiceProvider.getDocumentService(newMime);
          docService.publish(idc.docEntry, idc.requester, new JSONObject(), new JSONArray(), idc.overwrite);

          draftMeta.put(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey(), Boolean.valueOf(true));
          DraftStorageManager.getDraftStorageManager().setDraftMeta(idc.draftDescriptor, draftMeta);
        }

        IComponent repoComp = Platform.getComponent(RepositoryComponent.COMPONENT_ID);
        RepositoryProviderRegistry service = (RepositoryProviderRegistry) repoComp.getService(RepositoryProviderRegistry.class);
        IRepositoryAdapter repositoryAdapter = service.getRepository(idc.docEntry.getRepository());
        IDocumentEntry[] versions = repositoryAdapter.getVersions(idc.requester, idc.docEntry);
        // DraftActionEvent event = new DraftActionEvent(null, DraftAction.SYNC, versions);
        // DraftStorageManager.getDraftStorageManager(false).notifyListener(event);
        IDocumentEntry restoreVersion = versions.length == 1 ? versions[0] : versions[1];
        idc.docEntry = repositoryAdapter.restoreVersion(idc.requester, idc.docEntry.getDocUri(), restoreVersion.getDocId());
        JSONObject data = new JSONObject();
        data.put("restoreVersion", restoreVersion.getVersion());
        data.put("newVersion", idc.docEntry.getVersion());
        DraftActionEvent event = new DraftActionEvent(idc.draftDescriptor, DraftAction.RESTORE, data);
        DraftStorageManager.getDraftStorageManager().notifyListener(event);
      }

      IDocumentService docService = docServiceProvider.getDocumentService(idc.docEntry.getMimeType());

      /*
       * JSONObject parameters = new JSONObject(); parameters.put("password", idc.password); parameters.put(Constant.KEY_UPGRADE_CONVERT,
       * String.valueOf(idc.upgradeConvert)); parameters.put(Constant.KEY_GET_SNAPSHOT, String.valueOf(idc.getSnapshot));
       */
      ImportDocumentContext parameters = new ImportDocumentContext();
      parameters.password = idc.password;
      parameters.upgradeConvert = idc.upgradeConvert;
      parameters.getSnapshot = idc.getSnapshot;

      // Generate the upload convert job id, and set it as the parameter for importing document that used to check upload conversion job.
      ConvertDuringUploadContext context = new ConvertDuringUploadContext();
      context.requester = idc.requester;
      context.mediaURI = idc.mediaURI;
      context.sourceMime = idc.sourceMime;
      context.targetMime = idc.targetMime;
      context.modified = idc.modified;
      context.docEntry = idc.docEntry;
      // parameters.put(Constant.KEY_UPLOAD_CONVERT_ID, context.getJobId());
      parameters.uploadConvertID = context.getJobId();

      if (idc.docEntry.getMediaSize() <= 0 && !idc.upgradeConvert)
      {// new created document, 0 size, can not be converted.
       // but upgradeConvert is OK because upgrade convert won't use the repository contents.
        LOGGER.log(Level.WARNING, "Importing the 0 size empty document: " + idc.docEntry.getTitle());
        JSONObject data = new JSONObject();
        data.put("newTitle", idc.docEntry.getTitle());
        DraftStorageManager.getDraftStorageManager().discardDraft(idc.draftDescriptor);
        newDocEntry = docService.createDocument(idc.requester, idc.docEntry.getRepository(), idc.docEntry.getDocUri(), data, idc.docEntry);
      }
      else
      {
        newDocEntry = docService.importDocument(idc.requester, idc.docEntry, parameters);
      }

      IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
      IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
      DocHistoryBean dhb = new DocHistoryBean(newDocEntry.getRepository(), newDocEntry.getDocUri());
      dhb.setLastModified(newDocEntry.getModified().getTimeInMillis());
      dhb.setOrgId(idc.draftDescriptor.getCustomId());
      dhb.setDocId(newDocEntry.getDocId());
      dhb.setVersionSeriesId(newDocEntry.getVersionSeriesId());
      dhb.setLibraryId(newDocEntry.getLibraryId());
      dhb.setCommunityId(newDocEntry.getCommunityId());
      dhb.setLastAutoPublished(0);
      dhb.setStatus(IDocHistoryDAO.INITIAL_STATUS);
      if (idc.getSnapshot)
      {
        dhb.setSLastVisit(Calendar.getInstance().getTime());
      }
      if (docHisotryDAO.get(dhb.getRepoId(), dhb.getDocUri()) == null)
      {
        dhb.setAutoPublish(AutoPublishConfig.getAutoPublish());
        docHisotryDAO.add(dhb);
      }
      else
      {
        docHisotryDAO.updateWithCacheStatus(dhb);
      }
    }
    catch (ConversionException e)
    {
      JobExecutionException jee = new JobExecutionException(e.getErrCode(), e);
      if (!e.getData().isEmpty())
      {
        jee.setData(e.getData());
      }
      jee.getData().put("jobid", e.getData().get("jobid"));
      throw jee;
    }
    catch (ConcordException e)
    {
      if (e instanceof RepositoryAccessException)
      {
        RepositoryAccessException rae = (RepositoryAccessException) e;
        throw new JobExecutionException(rae.getErrCode(), rae);
      }
      throw new JobExecutionException(e.getErrCode(), e);
    }
    catch (UnsupportedMimeTypeException e)
    {
      throw new JobExecutionException(e.getErrorCode(), e);
    }
    catch (Exception e)
    {
      LOGGER.log(Level.SEVERE, "unknow error " + e);
      throw new JobExecutionException(-1, e);
    }

    LOGGER.exiting(ImportDraftFromRepositoryJob.class.getName(), "exec", "SUCCESS");

    return newDocEntry;
  }

  public File getResultFile()
  {
    return new File(idc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX);
  }

  public void putResult(Object result)
  {
    try
    {
      writeString2File(new File(idc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX), DocumentEntryHelper.toJSON((IDocumentEntry) result)
          .toString());
    }
    catch (IOException e)
    {
      new File(idc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX).delete();
      putError(e);
    }
  }
}
