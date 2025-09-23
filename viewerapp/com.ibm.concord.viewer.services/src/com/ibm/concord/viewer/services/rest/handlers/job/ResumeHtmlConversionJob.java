/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.rest.handlers.job;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.spi.impl.HTMLCacheDescriptor;
import com.ibm.concord.viewer.document.services.DocumentServiceUtil;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.exception.JobExecutionException;
import com.ibm.concord.viewer.job.object.RestartImportDraftFromRepositoryJob;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.conversion.ConversionTask;
import com.ibm.concord.viewer.platform.conversion.ConversionTask.ConversionEvent;
import com.ibm.concord.viewer.platform.conversion.ConversionTask.TaskCategory;
import com.ibm.concord.viewer.platform.util.NFSFileUtil;
import com.ibm.concord.viewer.platform.conversion.JSONConversionTask;
import com.ibm.concord.viewer.platform.conversion.TaskListener;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.viewer.spi.exception.DocumentServiceException;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class ResumeHtmlConversionJob extends ResumeConversionJob
{
  private static final Logger logger = Logger.getLogger(ResumeHtmlConversionJob.class.getName());

  private static final String HTML = "html";

  HashMap<String, Object> options = new HashMap<String, Object>();

  private ConversionTask htmlTask = null;

  public ResumeHtmlConversionJob(ImportDraftFromRepositoryContext idc)
  {
    super(idc);
  }

  @Override
  public Object exec() throws JobExecutionException
  {
    logger.entering(ResumeHtmlConversionJob.class.getName(), "exec");

    try
    {
      if (!this.isViewerStarted())
      {
        if (this.hasUploadConversion())
        {
          this.manageWork();
          return "SUCCESS";
        }
      }
      if (step.equals(Constant.JOB_DOWNLOAD_FILE_DONE) || step.equals(Constant.JOB_HTML_STARTED))
      {
        this.continueWork();
      }
      else
      {
        this.continueTailWork();
      }
    }
    catch (ConversionException e)
    {
      JobExecutionException jee = new JobExecutionException(e.getErrCode(), e);
      String correctFmt = (String) e.getData().get(Constant.CORRECT_FORMAT);
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
      logger.log(Level.SEVERE, "unknow error " + e);
      throw new JobExecutionException(-1, e);
    }
    logger.exiting(ResumeHtmlConversionJob.class.getName(), "exec", "SUCCESS");
    return "SUCCESS";
  }

  public void resumeWork() throws Exception
  {
    // If the viewer job is not started and upload job is started then schedule to manage work
    if (!this.isViewerStarted())
    {
      if (this.hasUploadConversion())
      {
        this.setCurrentType("RESUME_MANAGE");
        schedule();
        return;
      }
    }

    // If the viewer job is started and upload job will be ignored even if upload job started
    JSONObject statusJson = helper.getJson();
    this.jobId = (String) statusJson.get(Constant.HTML_JOBID_KEY);
    this.isConversionDone = (String) statusJson.get(Constant.JOB_HTML_DONE) == null ? false : true;
    this.targetPath = (String) statusJson.get(Constant.HTML_TARGETPATH_KEY);
    this.mimeType = (String) statusJson.get(Constant.SOURCE_MIMETYPE_KEY);
    this.sourceMimeType = this.mimeType;
    this.filePath = (String) statusJson.get(Constant.FILE_PATH_KEY);
    this.targetMimeType = (String) statusJson.get(Constant.TARGET_MIMETYPE_KEY);

    step = (String) statusJson.get(Constant.STEP_KEY);
    if (step == null)
    {
      step = Constant.JOB_START;
    }
    if (step.equals(Constant.JOB_HTML_STARTED))
    {
      if (jobId == null)
        step = Constant.JOB_DOWNLOAD_FILE_DONE;
    }
    logger.log(Level.FINE, "Current Step for DocUri:{0}, MimeType:{1}, Version:{2}" + " Step:" + step,
        new Object[] { this.docEntry.getDocUri(), this.docEntry.getMimeType(), this.docEntry.getVersion() });
    if (step.equals(Constant.JOB_START))
    {
      restartWork();
      return;
    }
    try
    {
      schedule();
    }
    catch (Exception e)
    {
      StringBuffer msg = new StringBuffer();
      msg.append(ServiceCode.S_ERROR_WORK_UNABLE_START);
      msg.append(" This occurred when failover job start.");
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      logger.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_WORK_UNABLE_START, msg.toString()));
    }
  }

  private Hashtable<String, Object> getJSONParamMap()
  {
    Hashtable<String, Object> paramMap = new Hashtable<String, Object>();
    options.clear();
    options.put(Constant.VIEWER_JOB_LOCKER_KEY, this.viewerLockerPath);
    paramMap.put("path", filePath);
    paramMap.put("sourceType", mimeType);
    paramMap.put("targetType", targetMimeType);
    paramMap.put("targetPath", ViewerUtil.getTargetFolder(cacheDesc.getHtmlURI(), TaskCategory.HTML));
    paramMap.put("options", options);
    return paramMap;
  }

  /**
   * If the conversion task need to be created via RemoteConversionService, then this required = true else required = true
   * 
   * @param required
   * @throws Exception
   */
  private void convertHtml(boolean required) throws Exception
  {
    if (required)
    {
      logger.info("Conversion task for HTML start to be created...");
      // TODO
      options.clear();
      options.put(Constant.VIEWER_JOB_LOCKER_KEY, this.viewerLockerPath);
      this.options.put(Constant.VIEWER_SHARED_DATA_NAME, cacheDesc.getSharedDataName());
      this.options.put(Constant.VIEWER_SHARED_DATA_ROOT, cacheDesc.getCacheHome());
      final String htmlTargetFolder = ViewerUtil.createTargetFolder(cacheDesc.getHtmlURI(), TaskCategory.HTML);
      htmlTask = conversionService.convert(this.filePath, this.mimeType, this.targetMimeType, htmlTargetFolder, options, true, this);
      logger.info("Conversion task for html is created successfully...");

      htmlTask.addTaskListenner(new TaskListener()
      {

        public void onEvent(ConversionEvent event) throws FileNotFoundException, InterruptedException, IOException
        {
          if (event.equals(ConversionEvent.DONE))
          {
            // move all the conversion result
            File mediaDir = new File(cacheDesc.getHtmlURI());
            File[] conversionResults = new File(htmlTargetFolder).listFiles();
            for (File f : conversionResults)
            {
              File dest = new File(mediaDir, f.getName());
              if (f.isDirectory()) {
                if (!NFSFileUtil.nfs_MoveDirToDir(f, dest, NFSFileUtil.NFS_RETRY_SECONDS)) {
                  throw new IOException("Exception raised when moving directory: " + f.getAbsolutePath());
                }
              } else {
                boolean succ = NFSFileUtil.nfs_renameFile(f, dest, NFSFileUtil.NFS_RETRY_SECONDS); 
                if (!succ)
                {
                  throw new IOException("Exception raised when moving file: " + f.getAbsolutePath());
                }
              }
            }
          }
        }

        public void setConvertDir(String convertDir)
        {
        }

        public String getConvertDir()
        {
          return null;
        }

        public void addListener(TaskListener otherType)
        {
          throw new RuntimeException("addListener is not supported by this TaskListener");
        }

      });

      helper.addElement(Constant.STEP_KEY, Constant.JOB_HTML_STARTED);
    }
    else
    {
      htmlTask = new JSONConversionTask(conversionServiceURL, conversionResultURL, conversionService.getHttpClient());
      htmlTask.setJobId(jobId);
      htmlTask.setTargetPath(targetPath);
      htmlTask.setViewerLockerPath(this.viewerLockerPath);
      htmlTask.setParamMap(getJSONParamMap());
      logger.info("Conversion task for html JOBID:" + jobId);
      logger.info("Conversion task for html restored...");
    }
  }

  private void queryState() throws Exception
  {
    if (!this.isConversionDone)
    {
      logger.log(Level.FINE, "HTML Task need to query.....");
      conversionService.queryState(new ConversionTask[] { htmlTask }, this);
    }
    helper.addElement(Constant.STEP_KEY, Constant.JOB_QUERYSTATE_FINISHED);
  }

  private void storeCache() throws Exception
  {
    DocumentServiceUtil.storeDraft(user, this.docEntry, null, true);
    helper.addElement(Constant.STEP_KEY, Constant.JOB_STORE_CACHE_FINISHED);
  }

  public void continueWork() throws Exception
  {
    logger.log(Level.INFO, "started continueWork() for userId: {0},DocId:{1}, MimeType:{2}, Version:{3}" + " Step:" + step, new Object[] {
        this.user.getId(), this.docEntry.getDocId(), this.docEntry.getMimeType(), this.docEntry.getVersion() });
    StringBuffer msg = new StringBuffer("Viewer conversion fails.");
    try
    {
      if (this.step.equals(Constant.JOB_DOWNLOAD_FILE_DONE))
      {
        this.prepare();
      }
      try
      {
        // Only if the step in JOB_HTML_STARTED we don't need to convert it.
        if (step.equals(Constant.JOB_HTML_STARTED))
        {
          this.convertHtml(false);
        }
        else
        {
          this.convertHtml(true);
        }
        this.queryState();
      }
      catch (ConversionException e)
      {
        this.correctMimeType(e);
        this.convertHtml(true);
        this.queryState();
      }
      this.storeCache();
      logger.log(Level.INFO, "Rendition conversion done. Document Id: " + docEntry.getDocId());
    }
    catch (ConversionException e)
    {
      msg.append(ServiceCode.S_ERROR_CONVERSION_EXCEPTION);
      msg.append(" Error code:" + e.getErrCode());
      msg.append(" Error message:" + e.getMessage());
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());

      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_CONVERSION_EXCEPTION, msg.toString()));
      throw e;
    }
    catch (RepositoryAccessException e)
    {
      msg.append(ServiceCode.S_ERROR_ACCESS_REPOSITORY);
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_ACESS_REPOSITORY, msg.toString()));
      throw e;
    }
    catch (FileNotFoundException e)
    {
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      logger.log(Level.SEVERE, "File is not found." + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (InterruptedException e)
    {
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      logger.log(Level.SEVERE, "InterruptedException throws for " + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (IOException e)
    {
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      msg.append(" IO Message:" + e.getMessage());
      logger.log(Level.SEVERE, "IOException throws for " + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (UnsupportedMimeTypeException e)
    {
      msg.append(ServiceCode.S_ERROR_UNSUPPORTTED_MIME);
      msg.append("The MIME type of ");
      msg.append(docEntry.getDocUri());
      msg.append(" is " + docEntry.getMimeType());
      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_UNSUPPORTTED_MIME, msg.toString()));
      throw e;
    }
    catch (CacheDataAccessException e)
    {
      msg.append(ServiceCode.S_ERROR_ACESS_CACHE_DATA);
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      msg.append(" Cache Directory:" + cacheDesc.getInternalURI());
      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_ACESS_CACHE_DATA, msg.toString()));
      throw e;
    }
    catch (Exception e)
    {
      msg.append(ServiceCode.S_SEVERE_UNKNOWN_ERROR);
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      msg.append(" e:" + e.getMessage());

      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.SEVERE_UNKNOWN_ERROR, msg.toString()));
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    logger.log(Level.INFO, "completed continueWork() DocURi:{0}, MimeType:{1}, Version:{2}" + " Step:" + step,
        new Object[] { this.docEntry.getDocUri(), this.docEntry.getMimeType(), this.docEntry.getVersion() });
  }

  public void restartWork() throws Exception
  {
    logger.log(Level.INFO, "start restartWork() DocURI:{0}, MimeType:{1}, Version:{2}" + " Step:" + step,
        new Object[] { this.docEntry.getDocUri(), this.docEntry.getMimeType(), this.docEntry.getVersion() });

    cacheDesc = new HTMLCacheDescriptor(user, docEntry);
    // CacheStorageManager.getCacheStorageManager().getCacheDescriptor(user, docEntry, this.isHTML);// fail over was not completed
    // // for
    // // html Yet.
    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
        "com.ibm.concord.viewer.document.services").getService(IDocumentServiceProvider.class);

    ImportDraftFromRepositoryContext jContext = new ImportDraftFromRepositoryContext();
    jContext.mediaURI = docEntry.getDocUri();
    jContext.sourceMime = docEntry.getMimeType();
    jContext.targetMime = docServiceProvider.getDocumentType(docEntry.getMimeType());
    jContext.modified = docEntry.getModified().getTimeInMillis();
    jContext.forceSave = false;

    jContext.requester = user;
    jContext.docEntry = docEntry;
    jContext.draftDescriptor = cacheDesc;
    jContext.isHTML = true/* this.isHTML */;

    jContext.setWorkingDir(new File(JobUtil.getDefaultWorkingDir(jContext.draftDescriptor, jContext.getJobId())));
    URLConfig config = URLConfig.toInstance();

    Job importMediaJob = new RestartImportDraftFromRepositoryJob(jContext);
    importMediaJob.config = config;

    importMediaJob.schedule();
    logger.log(Level.INFO, "complete restartWork() DocURI:{0}, MimeType:{1}, Version:{2}" + " Step:" + step,
        new Object[] { this.docEntry.getDocUri(), this.docEntry.getMimeType(), this.docEntry.getVersion() });

  }

  public void continueTailWork() throws Exception
  {
    logger.log(Level.INFO, "start continueTailWork() DocURI:{0}, MimeType:{1}, Version:{2}" + " Step:" + step,
        new Object[] { this.docEntry.getDocUri(), this.docEntry.getMimeType(), this.docEntry.getVersion() });
    StringBuffer msg = new StringBuffer("Viewer conversion fails.");
    try
    {
      this.storeCache();
      logger.log(Level.INFO, "Viewer conversion done. Document Id: " + docEntry.getDocId());
    }
    catch (RepositoryAccessException e)
    {
      msg.append(ServiceCode.S_ERROR_ACCESS_REPOSITORY);
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_ACESS_REPOSITORY, msg.toString()));
      throw e;
    }
    catch (CacheDataAccessException e)
    {
      msg.append(ServiceCode.S_ERROR_ACESS_CACHE_DATA);
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      msg.append(" Cache Directory:" + cacheDesc.getInternalURI());
      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_ACESS_CACHE_DATA, msg.toString()));
      throw e;
    }
    catch (InterruptedException e)
    {
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      logger.log(Level.SEVERE, "InterruptedException throws for " + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (IOException e)
    {
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      msg.append(" IO Message:" + e.getMessage());
      logger.log(Level.SEVERE, "IOException throws for " + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (Exception e)
    {
      msg.append(ServiceCode.S_SEVERE_UNKNOWN_ERROR);
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.SEVERE_UNKNOWN_ERROR, msg.toString()));
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    logger.log(Level.INFO, "complete continueTailWork() DocURI:{0}, MimeType:{1}, Version:{2}" + " Step:" + step,
        new Object[] { this.docEntry.getDocUri(), this.docEntry.getMimeType(), this.docEntry.getVersion() });
  }

  public void manageWork() throws Exception
  {
    StringBuffer msg = new StringBuffer("Viewer conversion fails.");
    try
    {
      ConversionTask task = conversionService.createConversionTask(TaskCategory.HTML);

      Hashtable<String, Object> paramMap = new Hashtable<String, Object>();
      paramMap.put("targetPath", this.cacheDesc.getInternalURI() + File.separator + docEntry.getDocId() + File.separator + HTML);
      task.setParamMap(paramMap);

      conversionService.queryState(new ConversionTask[] { task }, this);

      DocumentServiceUtil.storeDraft(this.user, this.docEntry, null, true);
      logger.log(Level.INFO, "Rendition conversion done. - manage work for failover. Document Id: " + docEntry.getDocId());
    }
    catch (ConversionException e)
    {
      msg.append(ServiceCode.S_ERROR_CONVERSION_EXCEPTION);
      msg.append(" Error code:" + e.getErrCode());
      msg.append(" Error message:" + e.getMessage());
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());

      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_CONVERSION_EXCEPTION, msg.toString()));
      throw e;
    }
    catch (IOException e)
    {
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      msg.append(" IO Message:" + e.getMessage());
      logger.log(Level.SEVERE, "IOException throws for " + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (InterruptedException e)
    {
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      logger.log(Level.SEVERE, "InterruptedException throws for " + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (Exception e)
    {
      msg.append(ServiceCode.S_SEVERE_UNKNOWN_ERROR);
      msg.append(" Document id:" + docEntry.getDocId());
      msg.append(" Document version:" + docEntry.getVersion());
      msg.append(" e:" + e.getMessage());

      logger.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.SEVERE_UNKNOWN_ERROR, msg.toString()));
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    finally
    {
      // If manage work failed, we should clean the upload conversion, if the upload conversion is not cleaned and invalid result file is
      // in,
      // then this document can never be converted again
      // If manage work succeeded, the folder also need to be cleaned
      cleanFolder(new File(this.cacheDesc.getInternalURI() + File.separator + docEntry.getDocId()));
    }
  }
}
