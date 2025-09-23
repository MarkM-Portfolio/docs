/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.job.object;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.BlockingQueue;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.cache.CacheMetaEnum;
import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.exception.JobExecutionException;
import com.ibm.concord.viewer.platform.ConversionUtils;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.component.IComponent;
import com.ibm.concord.viewer.platform.conversionResult.ConversionConstants;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.viewer.platform.repository.RepositoryComponent;
import com.ibm.concord.viewer.platform.repository.RepositoryProviderRegistry;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.viewer.spi.exception.DocumentServiceException;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.repository.IRepositoryAdapter;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.json.java.JSONObject;

public class ImportDraftFromRepositoryJob extends Job
{
  private static final Logger LOGGER = Logger.getLogger(ImportDraftFromRepositoryJob.class.getName());

  protected ImportDraftFromRepositoryContext idc;

  private boolean isThumbnailRequest = false;
  public BlockingQueue<String> jobMsgQ = null;
  public boolean isMsgSource = true;

  public ImportDraftFromRepositoryJob(ImportDraftFromRepositoryContext idc)
  {
    super(idc);

    if (idc.mediaURI == null)
    {
      throw new NullPointerException();
    }

    this.idc = idc;
    if(idc.isPromptPassword) {
      this.currentType = Constant.STATUS_PASSWORD_PROMPT;
    }
  }

  public ImportDraftFromRepositoryJob(ImportDraftFromRepositoryContext idc, boolean isUploadConversion)
  {
    super(idc, isUploadConversion);

    if (idc.mediaURI == null)
    {
      throw new NullPointerException();
    }

    // XXX-NBM remove this idc reference as super class already has it
    this.idc = idc;
    if (isUploadConversion)
    {
      this.currentType = Constant.STATUS_UPLOAD;
    }
    else
    {
      this.currentType = Constant.STATUS_VIEW;
    }
  }

  public boolean cleanUploadFailure()
  {
    boolean cleaned = false;
    String resultPath = this.idc.draftDescriptor.getInternalURI() + File.separator + idc.docEntry.getDocId();
    JSONObject result = ConversionUtils.getConversionResult(resultPath);
    int statusCode = (Integer) result.get(ConversionUtils.STATUS_CODE);
    if (!String.valueOf(statusCode).equals(ConversionConstants.ERROR_FILE_IS_TOO_LARGE)
        && !String.valueOf(statusCode).equals(ConversionConstants.SC_OK)
        && !String.valueOf(statusCode).equals(ConversionConstants.SC_ACCEPTED))
    {
      String message = "JobID:" + getJobContext().getJobId() + " MimeType:" + idc.docEntry.getMimeType() + " DocVersion:"
          + idc.docEntry.getVersion() + " DocID:" + idc.docEntry.getDocId();
      LOGGER.log(Level.FINE, message + " Clean upload cache started: " + resultPath);
      FileUtil.cleanDirectory(new File(resultPath));
      cleaned = true;
      LOGGER.log(Level.FINE, message + "  Clean upload cache completed:" + resultPath);
    }

    return cleaned;
  }

  public void cleanFailure()
  {
    if (hasUploadConversion())
    {
      cleanUploadFailure();
    }

    if ((Job.getResultFile(getJobContext().getWorkingDir()).exists()) || (Job.getError(getJobContext().getWorkingDir()) != null))
    {
      String message = "JobID:" + getJobContext().getJobId() + " MimeType:" + idc.docEntry.getMimeType() + " DocVersion:"
          + idc.docEntry.getVersion() + " DocID:" + idc.docEntry.getDocId();

      LOGGER.log(Level.FINE, message + " Cleaned Folder started: " + idc.draftDescriptor.getInternalURI());
      FileUtil.cleanDirectory(new File(idc.draftDescriptor.getMediaURI()));
      FileUtil.cleanDirectory(new File(idc.draftDescriptor.getTempURI(null)));
      FileUtil.deleteFile(idc.draftDescriptor.getInternalURI() + File.separator + "image.json");
      FileUtil.deleteFile(idc.draftDescriptor.getInternalURI() + File.separator + "meta.json");
      FileUtil.deleteFile(idc.draftDescriptor.getInternalURI() + File.separator + "job.lock");
      if (idc.isHTML)
        FileUtil.cleanDirectory(new File(idc.draftDescriptor.getHtmlURI()));
      LOGGER.log(Level.FINE, message + "  Cleaned Folder completed:" + idc.draftDescriptor.getInternalURI());
    }

  }

  public String getDocumentId()
  {
    return this.idc.docEntry.getDocId();
  }

  public Object exec() throws JobExecutionException
  {
    LOGGER.entering(ImportDraftFromRepositoryJob.class.getName(), "exec");
    if (!this.getCurrentType().equals("UPLOAD"))
    {
      File resultFile = new File(idc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
      if (resultFile.exists())
      {
        resultFile.delete();
      }
    }
    try
    {
      IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
          "com.ibm.concord.viewer.document.services").getService(IDocumentServiceProvider.class);
      // if (idc.forceSave)
      // {
      // JSONObject draftMeta = CacheStorageManager.getCacheStorageManager().getCacheMeta(idc.draftDescriptor);
      // String newMime = idc.docEntry.getMimeType();
      // String draftMime = (String) draftMeta.get(CacheMetaEnum.MIME.getMetaKey());
      // if (!newMime.equals(draftMime))
      // {
      // idc.docEntry.setMimeType(draftMime);
      // CacheStorageManager.getCacheStorageManager().discardCache(idc.draftDescriptor);
      // }
      // else
      // {
      // CacheStorageManager.getCacheStorageManager().setCacheMeta(idc.draftDescriptor, draftMeta);
      // }
      //
      // IComponent repoComp = Platform.getComponent(RepositoryComponent.COMPONENT_ID);
      // RepositoryProviderRegistry service = (RepositoryProviderRegistry) repoComp.getService(RepositoryProviderRegistry.class);
      // IRepositoryAdapter repositoryAdapter = service.getRepository(idc.docEntry.getRepository());
      // IDocumentEntry[] versions = repositoryAdapter.getVersions(idc.requester, idc.docEntry.getDocUri());
      // String restoreVersion = versions.length == 1 ? versions[0].getDocId() : versions[1].getDocId();
      // idc.docEntry = repositoryAdapter.restoreVersion(idc.requester, idc.docEntry.getDocUri(), restoreVersion);
      // }
      this.setPassword(this.idc.password);
      IDocumentService docService = docServiceProvider.getDocumentService(idc.docEntry.getMimeType());
      docService.importDocument(idc.requester, idc.userAgent, idc.mode, idc.docEntry, this);

      LOGGER.log(Level.FINE, "docService.importDocument finished with JOBID:" + idc.getJobId());
    }
    catch (ConversionException e)
    {
      JobExecutionException jee = new JobExecutionException(e.getErrCode(), e);
      jee.setData(e.getData());
      throw jee;
    }
    catch (DocumentServiceException e)
    {
      throw new JobExecutionException(e.getErrorCode(), e);
    }
    catch (CacheDataAccessException e)
    {
      throw new JobExecutionException(e.getErrorCode(), e);
    }
    catch (RepositoryAccessException e)
    {
      throw new JobExecutionException(e.getStatusCode(), e);
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

    return "SUCCESS";
  }

  public File getResultFile()
  {
    return new File(idc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
  }

  public void putResult(Object result)
  {
    try
    {
      writeString2File(new File(idc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX), (String) result);
    }
    catch (IOException e)
    {
      new File(idc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX).delete();
      putError(e);
    }
  }

  public boolean hasUploadConversion()
  {
    LOGGER.entering(ImportDraftFromRepositoryJob.class.getName(), "hasUploadConversion", idc.isHTML);

    boolean isImageView = !idc.isHTML;
    File f = new File(this.idc.draftDescriptor.getInternalURI() + File.separator + this.idc.docEntry.getDocId() + File.separator
        + FULLIMAGE);
    if (isImageView)
    {
      if (f.exists() && new File(f, STATE).exists())
      {
        LOGGER.exiting(ImportDraftFromRepositoryJob.class.getName(), "hasUploadConversion", true);
        return true;
      }
    }
    else
    // HTML
    {
      if (new File(f.getParentFile(), STATE).exists())
      {
        LOGGER.exiting(ImportDraftFromRepositoryJob.class.getName(), "hasUploadConversion", true);
        return true;
      }
    }
    LOGGER.exiting(ImportDraftFromRepositoryJob.class.getName(), "hasUploadConversion", false);
    return false;
  }

  public boolean isThumbnailRequest()
  {
    return this.isThumbnailRequest;
  }

  public void setThumbnailRequest(boolean isThumbnailRequest)
  {
    this.isThumbnailRequest = isThumbnailRequest;
  }
}
