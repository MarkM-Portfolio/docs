/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.migration.tasks;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.abdera.model.AtomDate;

import com.ibm.concord.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.document.services.DocumentServiceUtil;
import com.ibm.concord.draft.DraftMetaEnum;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.job.Job;
import com.ibm.concord.job.JobUtil;
import com.ibm.concord.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.platform.exceptions.ConversionException;
import com.ibm.concord.platform.util.ConcordUtil;
import com.ibm.concord.platform.util.Constant;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.concord.spi.beans.ImportDocumentContext;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.repository.RepositoryAccessException;
import com.ibm.json.java.JSONObject;

public class UpgradeDraftTask implements IMigrationTask
{
  private static final Logger LOG = Logger.getLogger(UpgradeDraftTask.class.getName());

  @Override
  public MigrationTaskContext check(File orgHome, File draftHome)
  {
    LOG.entering(this.getClass().getName(), "check", new Object[] { draftHome.getPath() });
    boolean needUpgrade = false;
    MigrationTaskContext context = null;
    DraftDescriptor dd = null;
    try
    {
      dd = DraftStorageManager.getDraftStorageManager().getDraftDescriptor(orgHome.getParentFile().getName(), null, draftHome.getName());
      boolean draftExisted = DraftStorageManager.getDraftStorageManager().isDraftExisted(dd);
      if (draftExisted)
      {
        JSONObject meta = DraftStorageManager.getDraftStorageManager().getDraftMeta(dd);
        String mime = (String) meta.get(DraftMetaEnum.MIME.getMetaKey());
        String ext = (String) meta.get(DraftMetaEnum.EXT.getMetaKey());
        // actually draft_last_visit should be get. But getDraftMeta will change this item, so user last modified as priority
        String atomDate = (String) meta.get(DraftMetaEnum.DRAFT_LAST_MODIFIED.getMetaKey());
        String repoId = (String) meta.get(DraftMetaEnum.REPOSITORY_ID.getMetaKey());
        String customerId = (String) meta.get(DraftMetaEnum.CUSTOMER_ID.getMetaKey());
        String modifier = (String) meta.get(DraftMetaEnum.DRAFT_LAST_MODIFIER_ID.getMetaKey());
        if ((atomDate != null) && (mime != null) && (ext != null) && (repoId != null) && (customerId != null) && (modifier != null))
        {
          long modified = AtomDate.valueOf(atomDate).getTime();
          IDocumentService docSrv = DocumentServiceUtil.getDocumentService(mime);
          if (docSrv != null)
          {
            needUpgrade = ConcordUtil.checkDraftFormatVersion(dd.getURI(), docSrv.getDraftFormatVersion());
          }

          if (needUpgrade)
          {
            context = new MigrationTaskContext(draftHome.getPath(), draftHome.getPath(), getClass().getName(), customerId, repoId,
                modifier, ext, modified);
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Failed to check draft " + dd, e);
    }
    LOG.exiting(this.getClass().getName(), "check", new Object[] { draftHome.getPath(), needUpgrade });

    return context;
  }

  @Override
  public boolean migrate(MigrationTaskContext context) throws Exception
  {
    IDocumentEntry docEntry = context.getDocumentEntry();
    if (docEntry != null)
    {
      IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
      // check if the draft has been upgraded
      DraftDescriptor dd = DocumentServiceUtil.getDraftDescriptor(null, docEntry);
      boolean needUpgrade = ConcordUtil.checkDraftFormatVersion(dd.getURI(), docSrv.getDraftFormatVersion());

      if (!needUpgrade)
      {
        return true;
      }

      // check if the draft is being upgraded
      IDocumentServiceProvider serviceProvider = (IDocumentServiceProvider) Platform
          .getComponent(DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);
      ImportDraftFromRepositoryContext importContext = new ImportDraftFromRepositoryContext();
      importContext.mediaURI = docEntry.getDocUri();
      importContext.sourceMime = docEntry.getMimeType();
      importContext.targetMime = serviceProvider.getDocumentType(docEntry.getMimeType());
      importContext.modified = context.getPriority();
      importContext.docEntry = docEntry;

      File workingDir = new File(JobUtil.getDefaultWorkingDir(dd.getCustomId(), docEntry.getDocUri(), importContext.getJobId(), false));

      if (!workingDir.exists() || !Job.isRunning2(workingDir, importContext.getJobId()))
      {
        /*
        JSONObject parameters = new JSONObject();
        parameters.put(Constant.KEY_UPGRADE_CONVERT, "true");
        parameters.put(Constant.KEY_BACKGROUND_CONVERT, "true");
        */
        ImportDocumentContext parameters = new ImportDocumentContext();
        parameters.upgradeConvert = true;
        parameters.backgroundConvert = true;
        try
        {
          docSrv.importDocument(null, docEntry, parameters);
        }
        catch (ConversionException e)
        {
          LOG.log(Level.WARNING, "Exception got when upgrade " + context.getWorkHome(), e);
          if ((e.getErrCode() == ConversionException.EC_CONV_SERVICE_UNAVAILABLE)
              || (e.getErrCode() == ConversionException.EC_CON_SERVER_BUSY))
          {
            throw e;
          }
          else
          {
            return false;
          }
        }
        catch (RepositoryAccessException rae)
        {
          int nErrorCode = rae.getErrCode();
          if (nErrorCode == RepositoryAccessException.EC_REPO_NOTFOUNDDOC)
          {
            LOG.log(Level.WARNING, "Did not find document on repository when upgrading draft {0}.", context.getWorkHome());
          }
          else
          {
            LOG.log(Level.WARNING, "Download document from repository thrown errors when upgrading draft " + context.getWorkHome(), rae);
          }
          return false;
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "Exception got when upgrade " + context.getWorkHome(), e);
          return false;
        }
      }
      return true;
    }
    else
    {
      LOG.log(Level.WARNING, "Draft " + context.getWorkHome() + " updrade cancelled, draft file missing.");
      return false;
    }
  }
}
