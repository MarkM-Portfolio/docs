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
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.cache.CacheMetaEnum;
import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.exception.JobExecutionException;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.component.IComponent;
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
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class RestartImportDraftFromRepositoryJob extends Job
{
  private static final Logger LOGGER = Logger.getLogger(RestartImportDraftFromRepositoryJob.class.getName());

  private ImportDraftFromRepositoryContext idc;

  public RestartImportDraftFromRepositoryJob(ImportDraftFromRepositoryContext idc)
  {
    super(idc);

    if (idc.mediaURI == null)
    {
      throw new NullPointerException();
    }

    this.idc = idc;
  }

  public void cleanFailure()
  {

  }

  public String getDocumentId()
  {
    return this.idc.docEntry.getDocId();
  }

  public Object exec() throws JobExecutionException
  {
    LOGGER.entering(RestartImportDraftFromRepositoryJob.class.getName(), "exec");

    File resultFile = new File(idc.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
    if (resultFile.exists())
    {
      resultFile.delete();
    }

    try
    {
      IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
          "com.ibm.concord.viewer.document.services").getService(IDocumentServiceProvider.class);
      // if (idc.forceSave)
      // {
      // JSONObject draftMeta = CacheStorageManager.getCacheStorageManager().getCacheMeta(idc.draftDescriptor);
      // String newMime = idc.docEntry.getMimeType();
      // String draftMime = (String)draftMeta.get(CacheMetaEnum.MIME.getMetaKey());
      // IDocumentService docService = null;
      // if(!newMime.equals(draftMime))
      // {
      // docService = docServiceProvider.getDocumentService(draftMime);
      // idc.docEntry.setMimeType(draftMime);
      // CacheStorageManager.getCacheStorageManager().discardCache(idc.draftDescriptor);
      // }
      // else
      // {
      // docService = docServiceProvider.getDocumentService(newMime);
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

      IDocumentService docService = docServiceProvider.getDocumentService(idc.docEntry.getMimeType());
      IDocumentEntry newDocEntry = docService.importDocument(idc.requester, idc.userAgent, idc.mode, idc.docEntry, this);

      LOGGER.log(Level.FINE, "docService.importDocument finished with JOBID:" + idc.getJobId());
    }
    catch (ConversionException e)
    {
      JobExecutionException jee = new JobExecutionException(e.getErrCode(), e);
      String correctFmt = (String)e.getData().get(Constant.CORRECT_FORMAT);
      if (correctFmt != null)
      {
        JSONObject data = new JSONObject();
        data.put("correctFormat", correctFmt);
        jee.setData(data);
      }
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

    LOGGER.exiting(RestartImportDraftFromRepositoryJob.class.getName(), "exec", "SUCCESS");

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
    boolean isImageView = !idc.isHTML;
    File f = new File(this.idc.draftDescriptor.getInternalURI() + File.separator + this.idc.docEntry.getDocId() + File.separator
        + FULLIMAGE);
    if (isImageView && !f.exists())
    {
      return false;
    }
    if (new File(f.getParentFile(), STATE).exists())
    {
      return true;
    }
    else
    {
      return false;
    }
  }
}
