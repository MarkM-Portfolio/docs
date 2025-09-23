/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.event.conversion;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.exception.CacheStorageAccessException;
import com.ibm.concord.viewer.config.ConfigConstants;
import com.ibm.concord.viewer.config.HTMLViewConfig;
import com.ibm.concord.viewer.config.PresConfig;
import com.ibm.concord.viewer.config.TextConfig;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.object.ImportDraftFromRepositoryJob;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.platform.util.LimitsUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.services.rest.thumbnails.ThumbnailService4Doc;
import com.ibm.concord.viewer.services.util.FileSizeLimit;
import com.ibm.concord.viewer.spi.action.ViewContext;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.docs.common.util.URLConfig;

public class UploadConversionService
{
  private UserBean user;

  private IDocumentEntry docEntry;

  private ICacheDescriptor draftDesc;

  private boolean forceSave;

  private static final Logger log = Logger.getLogger(UploadConversionService.class.getName());

  public UploadConversionService(UserBean user, IDocumentEntry docEntry)
  {
    this.user = user;
    this.docEntry = docEntry;
  }

  public void exec()
  {
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

    if (shouldConvertFromRepository)
    {
      convertFromRepository();
    }

  }

  public void convertFromRepository()
  {
    StringBuffer msg = new StringBuffer();
    msg.append(ServiceCode.S_INFO_CONVERSION_NEEDED);
    msg.append(" This is for upload service");
    msg.append(". Doc id is ").append(docEntry.getDocUri());
    msg.append(". Mime type is ").append(docEntry.getMimeType());
    log.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_CONVERSION_NEEDED, msg.toString()));

    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
        DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);

    if (FileSizeLimit.belowMinSize(docEntry.getMediaSize(), docEntry.getMimeType()))
    {// File size not reach into lower limit of conversion.
      msg = new StringBuffer();
      msg.append("Doc id is ");
      msg.append(docEntry.getDocUri());
      msg.append(". Mime type is ");
      msg.append(docEntry.getMimeType());
      msg.append(" Size is ");
      msg.append(docEntry.getMediaSize());
      log.log(Level.SEVERE, "Invalid media size. {0}", msg);
      return;
    }

    try
    {
      boolean multiConvertEnabled = ViewerConfig.getInstance().supportMultiConvert(
          DocumentTypeUtils.getStellentType(docEntry.getMimeType()));
      ICacheDescriptor desc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry);
      ViewContext context = desc.getViewContext();
      if (context == ViewContext.VIEW_PDF)
      {
        // when pdfjs is enabled, only generate thumbnail for pdf upload conversion event
        ThumbnailService4Doc ts = new ThumbnailService4Doc(user, docEntry);
        ts.scheduleThumbnailConversion();
      }
      // PDF size checked above,and PDF should always start upload conversion in viewer side.
      else if (DocumentTypeUtils.isHTML(docEntry.getMimeType(), ViewerConfig.RepositoryType.FILES.getId()))
      {
        if (multiConvertEnabled)
        {
          // full-image conversion
          getStellentViewJob(docServiceProvider).scheduleUpload();
        }
        else
        {
          // one-page conversion, cache path is different from the full-image conversion
          ThumbnailService4Doc ts = new ThumbnailService4Doc(user, docEntry);
          ts.scheduleThumbnailConversion();

          if (FileSizeLimit.exceedMaxHTMLSize(docEntry.getMediaSize(), docEntry.getMimeType()))
          {
            msg = new StringBuffer();
            msg.append(ServiceCode.S_SEVERE_MEDIA_SIZE_EXCEEDS);
            msg.append(" Doc id is ");
            msg.append(docEntry.getDocUri());
            msg.append(". Mime Type is ");
            msg.append(docEntry.getMimeType());
            log.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.SEVERE_MEDIA_SIZE_EXCEEDS, msg.toString()));
          }
          else
          { // we also need check if user has docs entitlement. If no, change to non-snapshot mode.
            if (context != ViewContext.VIEW_HTML_SS)
            {
              getHTMLViewJob(docServiceProvider).scheduleUpload();
            }
          }
        }
      }
      else
      {
        // 49965: support two type of upload conversion in SC-June-2015 release
        if (multiConvertEnabled)
        {
          if (FileSizeLimit.exceedMaxHTMLSize(docEntry.getMediaSize(), docEntry.getMimeType()))
          {
            msg = new StringBuffer();
            msg.append(ServiceCode.S_SEVERE_MEDIA_SIZE_EXCEEDS);
            msg.append(" Doc id is ");
            msg.append(docEntry.getDocUri());
            msg.append(". Mime Type is ");
            msg.append(docEntry.getMimeType());
            log.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.SEVERE_MEDIA_SIZE_EXCEEDS, msg.toString()));
          }
          else
          {
            getHTMLViewJob(docServiceProvider).scheduleUpload();
          }
        }

        // full-image conversion
        getStellentViewJob(docServiceProvider).scheduleUpload();
      }
    }
    catch (Exception e)
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_WORK_UNABLE_START);
      msg.append("This occurred when upload files.");
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      log.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_WORK_UNABLE_START, msg.toString()));
    }

  }

  private Job getStellentViewJob(IDocumentServiceProvider docServiceProvider)
  {
    ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();

    jContext.mediaURI = docEntry.getDocUri();
    jContext.sourceMime = docEntry.getMimeType();
    jContext.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
    jContext.modified = docEntry.getModified().getTimeInMillis();
    jContext.forceSave = this.forceSave;

    jContext.requester = user;
    jContext.docEntry = docEntry;
    jContext.draftDescriptor = this.draftDesc;

    jContext.isHTML = false;

    URLConfig config = URLConfig.toInstance();

    jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(jContext.draftDescriptor, jContext.getJobId())));

    ImportDraftFromRepositoryJob importJob = new ImportDraftFromRepositoryJob(jContext, true);
    importJob.config = config;
    return importJob;
  }

  private ImportDraftFromRepositoryJob getHTMLViewJob(IDocumentServiceProvider docServiceProvider)
  {
    ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();

    jContext.mediaURI = docEntry.getDocUri();
    jContext.sourceMime = docEntry.getMimeType();
    jContext.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
    jContext.modified = docEntry.getModified().getTimeInMillis();
    jContext.forceSave = this.forceSave;

    jContext.requester = user;
    jContext.docEntry = docEntry;
    jContext.draftDescriptor = this.draftDesc;

    jContext.isHTML = true;
    jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(jContext.draftDescriptor, jContext.getJobId())));

    return new ImportDraftFromRepositoryJob(jContext, true);
  }

  private boolean shouldConvertFromDraft() throws CacheStorageAccessException, CacheDataAccessException
  {
    draftDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry);
    if (draftDesc.getViewContext() == ViewContext.VIEW_HTML_SS)
    {
      return false;
    }
    return draftDesc.isValid();
  }

  public void execImg2Html()
  {
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

    if (shouldConvertFromRepository)
    {
      Img2HtmlConvertFromRepository();
    }
  }

  public void Img2HtmlConvertFromRepository()
  {
    StringBuffer msg = new StringBuffer();
    msg.append(ServiceCode.S_INFO_CONVERSION_NEEDED);
    msg.append(" This is for Img2HTML upload service.");
    msg.append(" Doc title is ").append(docEntry.getTitle());
    msg.append(". Doc id is ").append(docEntry.getDocUri());
    msg.append(". Mime type is ").append(docEntry.getMimeType());
    log.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_CONVERSION_NEEDED, msg.toString()));

    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
        DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);

    if (!LimitsUtil.exceedLimits(docEntry.getMediaSize(), Platform.getViewerConfig().getSubConfig(ConfigConstants.FILE_SIZE_THRESHOLD_KEY),
        docEntry.getMimeType()))
    {
      // File size not reach into lower limit of conversion.
      return;
    }

    try
    {
      boolean isPres = DocumentTypeUtils.PRESENTATION.equalsIgnoreCase(DocumentTypeUtils.getStellentType(docEntry.getMimeType()));
      boolean isText = DocumentTypeUtils.TEXT.equalsIgnoreCase(DocumentTypeUtils.getStellentType(docEntry.getMimeType()));
      // PDF size checked above,and PDF should always start upload conversion in viewer side.
      if (DocumentTypeUtils.isHTML(docEntry.getMimeType(), docEntry.getRepository()))
      {
        String maxSize = isPres ? PresConfig.getMaxSize() : (isText ? TextConfig.getMaxSize() : HTMLViewConfig.getMaxSize());
        boolean exceedSizeLimit = LimitsUtil.exceedLimits(docEntry.getMediaSize(), maxSize);
        if (!exceedSizeLimit)
        {
          ImportDraftFromRepositoryJob job = getHTMLViewJob(docServiceProvider);
          if (!job.hasUploadConversion() || job.cleanUploadFailure())
          {
            job.scheduleUpload();
          }
        }
        else
        {
          msg = new StringBuffer();
          msg.append(ServiceCode.S_SEVERE_MEDIA_SIZE_EXCEEDS);
          msg.append(" Doc title is " + docEntry.getTitle());
          msg.append(". Doc id is ");
          msg.append(docEntry.getDocUri());
          log.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.SEVERE_MEDIA_SIZE_EXCEEDS, msg.toString()));
          return;
        }
      }
    }
    catch (Exception e)
    {
      msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_WORK_UNABLE_START);
      msg.append("This occurred when upload files.");
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document title:" + docEntry.getTitle());
      msg.append(" Document version:" + docEntry.getVersion());
      log.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_WORK_UNABLE_START, msg.toString()));
    }

  }

}
