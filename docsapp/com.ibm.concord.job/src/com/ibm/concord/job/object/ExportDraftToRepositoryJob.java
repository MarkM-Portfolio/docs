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
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.context.ExportDraftToRepositoryContext;
import com.ibm.concord.job.exception.JobExecutionException;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.bean.DocHistoryBean;
import com.ibm.concord.platform.dao.DataAccessComponentImpl;
import com.ibm.concord.platform.dao.IDocHistoryDAO;
import com.ibm.concord.platform.exceptions.OutOfCapacityException;
import com.ibm.concord.platform.util.DocumentEntryHelper;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.spi.exception.ConcordException;
import com.ibm.docs.framework.IComponent;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class ExportDraftToRepositoryJob extends Job
{
  private static final Logger LOGGER = Logger.getLogger(ExportDraftToRepositoryJob.class.getName());

  private ExportDraftToRepositoryContext edc;

  public ExportDraftToRepositoryJob(ExportDraftToRepositoryContext edc)
  {
    super(edc);
    if (edc.mediaURI == null)
    {
      throw new NullPointerException();
    }

    this.edc = edc;
  }

  public Object exec() throws JobExecutionException
  {
    LOGGER.entering(ExportDraftToRepositoryJob.class.getName(), "exec");

    File resultFile1 = new File(edc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX);
    if (resultFile1.exists())
    {
      resultFile1.delete();
    }

    if (edc.asNewFile)
    {
      IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services")
          .getService(IDocumentServiceProvider.class);
      IDocumentService docService = docServiceProvider.getDocumentService(edc.docEntry.getMimeType());

      try
      {
        IDocumentEntry newDocEntry = docService.saveAs(edc.docEntry, edc.requester, edc.requestData, new JSONArray());
        return newDocEntry;
      }
      catch (ConcordException e)
      {
        if (e instanceof RepositoryAccessException)
        {
          RepositoryAccessException rae = (RepositoryAccessException) e;
          throw new JobExecutionException(String.valueOf(e.getErrCode()), e.getErrMsg(), null, rae.getStatusCode(), rae);
        }
        throw new JobExecutionException(e.getErrCode(), e);
      }
      catch (Exception e)
      {
        throw new JobExecutionException(-1, e);
      }
    }
    else
    {
      try
      {
        IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent("com.ibm.concord.document.services")
            .getService(IDocumentServiceProvider.class);

        JSONObject draftMeta = DraftStorageManager.getDraftStorageManager().getDraftMeta(edc.draftDescriptor);
        String newMime = edc.docEntry.getMimeType();
        String draftMime = (String) draftMeta.get(DraftMetaEnum.MIME.getMetaKey());
        IDocumentService docService = null;
        if (!newMime.equals(draftMime))
        {
          docService = docServiceProvider.getDocumentService(draftMime);
          edc.docEntry.setMimeType(draftMime);
        }
        else
        {
          docService = docServiceProvider.getDocumentService(newMime);
        }
        if (edc.overwrite && draftMeta.get(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey()) != null
            && ((Boolean) draftMeta.get(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey())).booleanValue())
        {// force update repository content but the Docs draft is Synchronized with repo, do nothing
          return edc.docEntry;
        }
        IDocumentEntry newDocEntry = docService.publish(edc.docEntry, edc.requester, edc.requestData, new JSONArray(), edc.overwrite);

        draftMeta.put(DraftMetaEnum.LAST_MODIFIED.getMetaKey(), AtomDate.valueOf(newDocEntry.getModified()).getValue());
        draftMeta.put(DraftMetaEnum.DRAFT_BASE_VERSION.getMetaKey(), newDocEntry.getVersion());
        draftMeta.put(DraftMetaEnum.BASE_CONTENT_HASH.getMetaKey(), newDocEntry.getContentHash());
        draftMeta.put(DraftMetaEnum.DRAFT_SYNC_STATE.getMetaKey(), Boolean.valueOf(true));
        draftMeta.put(DraftMetaEnum.MIME.getMetaKey(), newDocEntry.getMimeType());
        draftMeta.put(DraftMetaEnum.EXT.getMetaKey(), newDocEntry.getExtension());
        draftMeta.put(DraftMetaEnum.TITLE.getMetaKey(), newDocEntry.getTitle());
        DraftStorageManager.getDraftStorageManager().setDraftMeta(edc.draftDescriptor, draftMeta);

        IComponent daoComp = Platform.getComponent(DataAccessComponentImpl.COMPONENT_ID);
        IDocHistoryDAO docHisotryDAO = (IDocHistoryDAO) daoComp.getService(IDocHistoryDAO.class);
        DocHistoryBean dhb = new DocHistoryBean(newDocEntry.getRepository(), newDocEntry.getDocUri());
        dhb.setLastModified(newDocEntry.getModified().getTimeInMillis());
        dhb.setOrgId(edc.draftDescriptor.getCustomId());
        dhb.setDocId(newDocEntry.getDocId());
        dhb.setVersionSeriesId(newDocEntry.getVersionSeriesId());
        dhb.setLibraryId(newDocEntry.getLibraryId());
        dhb.setCommunityId(newDocEntry.getCommunityId());
        dhb.setLastAutoPublished(0);
        if (docHisotryDAO.get(dhb.getRepoId(), dhb.getDocUri()) == null)
        {
          dhb.setStatus(IDocHistoryDAO.INITIAL_STATUS);
          docHisotryDAO.add(dhb);
        }
        else
        {
          docHisotryDAO.update(dhb);
        }

        return newDocEntry;
      }
      catch (ConcordException e)
      {
        if (e instanceof RepositoryAccessException)
        {
          RepositoryAccessException rae = (RepositoryAccessException) e;
          throw new JobExecutionException(String.valueOf(e.getErrCode()), e.getErrMsg(), null, rae.getStatusCode(), rae);
        }
        throw new JobExecutionException(e.getErrCode(), e);
      }
      catch (OutOfCapacityException e)
      {
        throw new JobExecutionException(e.getErrorCode(), e);
      }
      catch (Exception e)
      {
        throw new JobExecutionException(-1, e);
      }
    }
  }

  public File getResultFile()
  {
    return new File(edc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX);
  }

  public void putResult(Object result)
  {
    try
    {
      writeString2File(new File(edc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX), DocumentEntryHelper.toJSON((IDocumentEntry) result)
          .toString());
    }
    catch (IOException e)
    {
      new File(edc.getWorkingDir(), RESULT + ENTRY_RESULT_SUFFIX).delete();
      putError(e);
    }
  }
}
