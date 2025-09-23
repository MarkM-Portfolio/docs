package com.ibm.concord.viewer.services.rest.thumbnails;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.exception.CacheStorageAccessException;
import com.ibm.concord.viewer.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.object.ImportDraftFromRepositoryJob;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.common.util.URLConfig;

public class ThumbnailService4Doc extends ThumbnailService
{

  private static final Logger log = Logger.getLogger(ThumbnailService4Doc.class.getName());

  public static final String FULLIMAGE = "pictures";

  private boolean forceSave = false;

  public enum DownsizeSourceType {
    VIEW_CONVERSION_RESULT, UPLOAD_CONVERSION_RESULT
  }

  public ThumbnailService4Doc(UserBean user, IDocumentEntry docEntry)
  {
    super(user, docEntry);
  }

  public void exec()
  {
    if (isThumbnailsExisted())
    {
      log.log(Level.INFO, "Unneeded thumbnail service request since size.json is found. Doc id: " + docEntry.getDocId());
      return;
    }

    boolean shouldConvertFromRepository = false;
    try
    {
      shouldConvertFromRepository = !shouldConvertFromDraft();
    }
    catch (CacheStorageAccessException e)
    {
      log.log(Level.SEVERE, "DraftStorageAccessException:" + e.getMessage());
      return;
    }
    catch (CacheDataAccessException e)
    {
      log.log(Level.SEVERE, "DraftDataAccessException:" + e.getMessage());
      return;
    }

    if (hasUploadConversion())
    {
      // upload cache existed, do downsize
      generateThumbnailsFromUploadCache();
    }
    else if (shouldConvertFromRepository)
    {
      // no cache, do upload conversion for just first page
      scheduleThumbnailConversion();
    }
    else
    {
      // valid cache existed, do downsize
      generateThumbnailsFromVallidCache();
    }
  }

  public void scheduleThumbnailConversion()
  {
    if (!aquireLock())
      return;

    StringBuffer msg = new StringBuffer();
    msg.append(ServiceCode.S_INFO_CONVERSION_NEEDED);
    msg.append(" This is for thumbnail service - one page upload conversion.");
    msg.append(" Doc id is ").append(docEntry.getDocUri());
    msg.append(" Mime type is ").append(docEntry.getMimeType());
    msg.append(" LastModified is ").append(docEntry.getModified().getTimeInMillis());
    log.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_CONVERSION_NEEDED, msg.toString()));

    startStellentConversion(true);
  }

  public void scheduleFullImageConversion()
  {
    if (!aquireLock())
      return;

    StringBuffer msg = new StringBuffer();
    msg.append(ServiceCode.S_INFO_CONVERSION_NEEDED);
    msg.append(" This is for thumbnail service - need cachelize.");
    msg.append(" Doc id is ").append(docEntry.getDocUri());
    msg.append(" Mime type is ").append(docEntry.getMimeType());
    msg.append(" LastModified is ").append(docEntry.getModified().getTimeInMillis());
    log.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_CONVERSION_NEEDED, msg.toString()));

    startStellentConversion(false);
  }

  private void startStellentConversion(boolean isUpload)
  {
    URLConfig config = URLConfig.toInstance();
    
    ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();
    jContext.mediaURI = docEntry.getDocUri();
    jContext.sourceMime = docEntry.getMimeType();
    jContext.isHTML = false;
    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
        DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);
    jContext.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
    jContext.modified = docEntry.getModified().getTimeInMillis();
    jContext.forceSave = forceSave;
    jContext.requester = user;
    jContext.docEntry = docEntry;
    jContext.thumbnailDesc = thumbSrvDraftDesc;

    if (isUpload)
    {
      jContext.draftDescriptor = thumbSrvDraftDesc;
      File thumbSrvWorkingDir = new File(JobUtil.getDefaultWorkingDir(jContext.draftDescriptor, jContext.getJobId()));
      jContext.setWorkingDir(thumbSrvWorkingDir);
    }
    else
    {
      jContext.draftDescriptor = draftDesc;
      File workingDir = new File(JobUtil.getDefaultWorkingDir(jContext.draftDescriptor, jContext.getJobId()));
      jContext.setWorkingDir(workingDir);
    }

    Job importMediaJob = new ImportDraftFromRepositoryJob(jContext, isUpload);
    ((ImportDraftFromRepositoryJob) importMediaJob).jobMsgQ = this.jobMsgQ;
    ((ImportDraftFromRepositoryJob) importMediaJob).isMsgSource = true;
    ((ImportDraftFromRepositoryJob) importMediaJob).setThumbnailRequest(true);
    importMediaJob.config = config;
    importMediaJob.setJobPriority(this.jobPriority);
    
    if (isUpload)
    {
      importMediaJob.scheduleUpload();
    }
    else
    {
      importMediaJob.schedule();
    }

  }

  public void generateThumbnailsFromVallidCache()
  {
    if (!aquireLock())
      return;

    StringBuffer msg = new StringBuffer();
    msg.append(ServiceCode.S_INFO_CONVERSION_NEEDED);
    msg.append(" This is for thumbnail service - valid cache existed - need downsize.");
    msg.append(" Doc id is ").append(docEntry.getDocUri());
    msg.append(" Mime type is ").append(docEntry.getMimeType());
    msg.append(" LastModified is ").append(docEntry.getModified().getTimeInMillis());
    log.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_CONVERSION_NEEDED, msg.toString()));

    generateThumbnails(DownsizeSourceType.VIEW_CONVERSION_RESULT);
  }

  public void generateThumbnailsFromUploadCache()
  {
    if (!aquireLock())
      return;

    StringBuffer msg = new StringBuffer();
    msg.append(ServiceCode.S_INFO_CONVERSION_NEEDED);
    msg.append(" This is for thumbnail service - upload cache existed - need downsize.");
    msg.append(" Doc id is ").append(docEntry.getDocUri());
    msg.append(" Mime type is ").append(docEntry.getMimeType());
    msg.append(" LastModified is ").append(docEntry.getModified().getTimeInMillis());
    log.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_CONVERSION_NEEDED, msg.toString()));

    generateThumbnails(DownsizeSourceType.UPLOAD_CONVERSION_RESULT);
  }

  private void generateThumbnails(DownsizeSourceType type)
  {
    URLConfig config = URLConfig.toInstance();

    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
        DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);
    ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();
    jContext.mediaURI = docEntry.getDocUri();
    jContext.sourceMime = docEntry.getMimeType();// "application/gif";
    jContext.isHTML = false;
    jContext.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());// "application/gif";
    jContext.modified = docEntry.getModified().getTimeInMillis();
    jContext.forceSave = forceSave;
    jContext.requester = user;
    jContext.docEntry = docEntry;
    jContext.draftDescriptor = draftDesc;
    jContext.thumbnailDesc = thumbSrvDraftDesc;

    jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(jContext.thumbnailDesc, jContext.getJobId())));

    ThumbnailServiceJob thumbnailServiceJob = new ThumbnailServiceJob(jContext, true);
    thumbnailServiceJob.config = config;
    thumbnailServiceJob.setDownsizeSrcType(type);
    thumbnailServiceJob.scheduleUpload();
  }

  public boolean hasUploadConversion()
  {
    File f = new File(draftDesc.getInternalURI() + File.separator + docEntry.getDocId() + File.separator + FULLIMAGE);
    if (f.exists() && new File(f, STATE).exists())
    {
      return true;
    }
    return false;
  }

  private boolean shouldConvertFromDraft() throws CacheStorageAccessException, CacheDataAccessException
  {
    return draftDesc.isValid();/* JobUtil.isValid(draftDesc, docEntry, false); */
  }

}
