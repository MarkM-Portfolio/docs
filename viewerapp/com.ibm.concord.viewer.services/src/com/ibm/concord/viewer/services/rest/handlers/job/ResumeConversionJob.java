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
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.FileUtils;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.exception.CacheStorageAccessException;
import com.ibm.concord.viewer.cache.spi.impl.ImageCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.ThumbnailDescriptor;
import com.ibm.concord.viewer.config.ThumbnailConfig;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.config.ThumbnailConfig.ThumbnailRequestType;
import com.ibm.concord.viewer.document.common.AbstractDocumentService;
import com.ibm.concord.viewer.document.common.rendition.RenditionConversionHandler;
import com.ibm.concord.viewer.document.common.rendition.UploadConversionHandler;
import com.ibm.concord.viewer.document.services.DocumentServiceUtil;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.JobUtil;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.exception.JobExecutionException;
import com.ibm.concord.viewer.job.object.RestartImportDraftFromRepositoryJob;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.conversion.ConversionComponentImpl;
import com.ibm.concord.viewer.platform.conversion.ConversionTask;
import com.ibm.concord.viewer.platform.conversion.ConversionTask.TaskCategory;
import com.ibm.concord.viewer.platform.conversion.FullImageConversionTask;
import com.ibm.concord.viewer.platform.conversion.IConversionService;
import com.ibm.concord.viewer.platform.conversion.StellentOption;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.platform.util.JobHelper;
import com.ibm.concord.viewer.platform.util.LimitsUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.concord.viewer.spi.document.services.IDocumentServiceProvider;
import com.ibm.concord.viewer.spi.exception.DocumentServiceException;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.tempstorage.repository.TempStorageRepository;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

public class ResumeConversionJob extends Job
{
  private static final Logger logger = Logger.getLogger(ResumeConversionJob.class.getName());

  protected UserBean user;

  protected String workingDir;

  protected String internalURI;

  protected ICacheDescriptor cacheDesc;

  protected ThumbnailDescriptor thumbnailDesc;

  protected IDocumentEntry docEntry = null;

  protected static IConversionService conversionService;

  protected static String conversionServiceURL;

  protected static String conversionResultURL;

  protected String jobId = null;

  protected String targetPath = null;

  protected String filePath = null;

  protected String mimeType = null;

  protected String targetMimeType = null;

  protected String sourceMimeType = null;

  protected String viewerLockerPath;

  private boolean isConversionDoneForThumbnail = false;

  protected boolean isConversionDone = false;

  protected JobHelper helper;

  HashMap<String, Object> options = new HashMap<String, Object>();

  private ConversionTask thumbnailTask = null;

  private RenditionConversionHandler thumbnailHanlder = null;

  private ConversionTask fullImageTask = null;

  private RenditionConversionHandler fullImageHanlder = null;

  protected String step = Constant.JOB_START;

  private static final String THUMBNAIL = "thumbnails";

  private static final String FULLIMAGE = "pictures";

  private static final String THUMBNAIL_CONVERSION_SWITCH = "convertthumbnail";

  private static final String FULLIMAGE_WIDTH = "graphicwidth";

  private static final String THUMBNAIL_WIDTH = "thumbnailwidth";

  static
  {
    JSONObject conversionConfig = (JSONObject) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getConfig()
        .get("conversionService");
    conversionServiceURL = conversionConfig.get("serviceurl").toString();
    conversionResultURL = conversionConfig.get("resulturl").toString();
    conversionService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
        IConversionService.class);
  }

  public void cleanFailure()
  {

  }

  public String getDocumentId()
  {
    return this.docEntry.getDocId();
  }

  public ResumeConversionJob(ImportDraftFromRepositoryContext idc)
  {
    super(idc);

    this.workingDir = idc.getWorkingDir().getPath();
    this.user = idc.requester;
    this.internalURI = idc.draftDescriptor.getInternalURI();
    this.cacheDesc = idc.draftDescriptor;
    this.thumbnailDesc = idc.thumbnailDesc;
    this.docEntry = idc.docEntry;
    this.viewerLockerPath = this.internalURI + File.separator + Constant.VIEWER_JOB_LOCKER;
    this.helper = new JobHelper(this.viewerLockerPath);
  }

  @Override
  public Object exec() throws JobExecutionException
  {
    logger.entering(ResumeConversionJob.class.getName(), "exec");

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
      if (step.equals(Constant.JOB_DOWNLOAD_FILE_DONE) || step.equals(Constant.JOB_THUMBNAIL_STARTED)
          || step.equals(Constant.JOB_FULLIMAGE_STARTED))
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
    logger.exiting(ResumeConversionJob.class.getName(), "exec", "SUCCESS");
    return "SUCCESS";
  }

  @Override
  public void putResult(Object result)
  {
    try
    {
      writeString2File(new File(workingDir, RESULT + NONE_RESULT_SUFFIX), (String) result);
    }
    catch (IOException e)
    {
      new File(workingDir, RESULT + NONE_RESULT_SUFFIX).delete();
      putError(e);
    }
  }

  @Override
  public File getResultFile()
  {
    return new File(workingDir, RESULT + NONE_RESULT_SUFFIX);
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
    this.jobId = (String) statusJson.get(Constant.FULLIMAGE_JOBID_KEY);
    this.isConversionDone = (String) statusJson.get(Constant.JOB_FULLIMAGE_DONE) == null ? false : true;
    this.isConversionDoneForThumbnail = (String) statusJson.get(Constant.JOB_THUMBNAIL_DONE) == null ? false : true;

    this.targetPath = (String) statusJson.get(Constant.FULLIMAGE_TARGETPATH_KEY);
    this.mimeType = (String) statusJson.get(Constant.SOURCE_MIMETYPE_KEY);
    this.sourceMimeType = this.mimeType;
    this.filePath = (String) statusJson.get(Constant.FILE_PATH_KEY);
    this.targetMimeType = (String) statusJson.get(Constant.TARGET_MIMETYPE_KEY);

    step = (String) statusJson.get(Constant.STEP_KEY);
    if (step == null)
    {
      step = Constant.JOB_START;
    }
    if (step.equals(Constant.JOB_FULLIMAGE_STARTED))
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

  protected void prepare() throws CacheStorageAccessException, CacheDataAccessException
  {
    this.options.put(Constant.VIEWER_JOB_LOCKER_KEY, this.viewerLockerPath);
    CacheStorageManager.getCacheStorageManager().prepareCache(this.cacheDesc);
  }

  private Hashtable<String, Object> getFullImageParamMap()
  {
    Hashtable<String, Object> paramMap = new Hashtable<String, Object>();
    Map<String, String> conf = AbstractDocumentService.getStellentOptions(this.mimeType);
    options.clear();
    options.putAll(conf);
    options.remove(THUMBNAIL_CONVERSION_SWITCH);
    options.put(StellentOption.GRAPHIC_WIDTH.getName(), conf.get(FULLIMAGE_WIDTH));
    options.put(Constant.VIEWER_JOB_LOCKER_KEY, this.viewerLockerPath);
    paramMap.put("path", filePath);
    paramMap.put("sourceType", mimeType);
    paramMap.put("targetType", targetMimeType);
    paramMap.put("targetPath", ViewerUtil.getTargetFolder(cacheDesc.getFullImageURI(), TaskCategory.FULLIMAGES));
    paramMap.put("options", options);
    return paramMap;
  }

  /**
   * If the conversion task need to be created via RemoteConversionService, then this required = true else required = true
   * 
   * @param required
   * @throws Exception
   */
  private void convertThumbnail() throws Exception
  {
    thumbnailTask = conversionService.createConversionTask(TaskCategory.THUMBNAILS);
    thumbnailTask.setViewerLockerPath(this.viewerLockerPath);
    String thumbnailTargetFolder = ViewerUtil.getTargetFolder(cacheDesc.getThumbnailURI(), TaskCategory.THUMBNAILS);
    String width = AbstractDocumentService.getStellentOptions(mimeType).get(THUMBNAIL_WIDTH);
    thumbnailHanlder = new RenditionConversionHandler(THUMBNAIL, thumbnailTargetFolder, thumbnailTargetFolder,
        DocumentTypeUtils.getStellentType(mimeType), width);
    thumbnailTask.addTaskListenner(thumbnailHanlder);
  }

  /**
   * If the conversion task need to be created via RemoteConversionService, then this required = true else required = true
   * 
   * @param required
   * @throws Exception
   */
  private void convertFullImage(boolean required) throws Exception
  {
    if (required)
    {
      logger.info("Conversion task for fullimage start to be created...");
      Map<String, String> conf = AbstractDocumentService.getStellentOptions(this.mimeType);
      options.putAll(conf);
      options.remove(THUMBNAIL_CONVERSION_SWITCH);
      options.put(StellentOption.GRAPHIC_WIDTH.getName(), conf.get(FULLIMAGE_WIDTH));
      options.put(Constant.VIEWER_JOB_LOCKER_KEY, this.viewerLockerPath);
      // thumbnail service
      this.options.put(ThumbnailConfig.SMALL_THUMBNAIL_WIDTH_KEY, String.valueOf(ThumbnailConfig.SMALLWIDTH));
      this.options.put(ThumbnailConfig.MEDIUM_THUMBNAIL_WIDTH_KEY, String.valueOf(ThumbnailConfig.MEDIUMWIDTH));
      this.options.put(ThumbnailConfig.LARGE_THUMBNAIL_WIDTH_KEY, String.valueOf(ThumbnailConfig.LARGEWIDTH));
      this.options.put(ThumbnailConfig.SMALL_THUMBNAIL_HEIGHT_KEY, String.valueOf(ThumbnailConfig.SMALLHEIGHT));
      this.options.put(ThumbnailConfig.MEDIUM_THUMBNAIL_HEIGHT_KEY, String.valueOf(ThumbnailConfig.MEDIUMHEIGHT));
      this.options.put(ThumbnailConfig.LARGE_THUMBNAIL_HEIGHT_KEY, String.valueOf(ThumbnailConfig.LARGEHEIGHT));
      this.options.put("docId", docEntry.getDocId());
      this.options.put("repoId", docEntry.getRepository());
      this.options.put("lastModified", String.valueOf(docEntry.getModified().getTimeInMillis()));
      this.options.put("inotesRequest", String.valueOf(docEntry.getRepository().equals(TempStorageRepository.REPO_ID_TEMP_STORAGE)));
      this.options.put("thumbSrvReq", ThumbnailRequestType.VIEW_DOCUMENT);
      this.options.put("thumbnailTarget", this.thumbnailDesc.getThumbnailServiceURI());
      this.options.put("userId", ViewerConfig.getInstance().isLocalEnv() ? this.user.getEmail() : this.user.getId());
      this.options.put("communityId", this.docEntry.getCommunityId());
      this.options.put("thumbnailPostUserEmail", this.user.getEmail());
      this.options.put(Constant.VIEWER_SHARED_DATA_NAME, cacheDesc.getSharedDataName());
      this.options.put(Constant.VIEWER_SHARED_DATA_ROOT, cacheDesc.getCacheHome());

      IDocumentService docSrv = DocumentServiceUtil.getDocumentService(docEntry.getMimeType());
      JSONObject limits = (JSONObject) docSrv.getConfigs().get("limits");
      if (DocumentTypeUtils.isHTML(docEntry.getMimeType(), docEntry.getRepository())
          || LimitsUtil.exceedLimits(docEntry.getMediaSize(), limits))
      {
        logger.log(Level.INFO, "Set conversion config to only convert one page. Doc Id: " + docEntry.getDocUri());
        this.options.put(StellentOption.WHAT_TO_PRINT.getName(), "range");
        this.options.put(StellentOption.PRINT_STARTPAGE.getName(), "0");
        this.options.put(StellentOption.PRINT_ENDPAGE.getName(), "1");
      }

      String fullImageTargetFolder = ViewerUtil.createTargetFolder(cacheDesc.getFullImageURI(), TaskCategory.FULLIMAGES);

      fullImageTask = conversionService.convert(this.filePath, this.mimeType, this.targetMimeType, fullImageTargetFolder, options, true,
          this);
      logger.info("Conversion task for fullimage is created successfully...");

      helper.addElement(Constant.STEP_KEY, Constant.JOB_FULLIMAGE_STARTED);

      fullImageHanlder = new RenditionConversionHandler(FULLIMAGE, fullImageTargetFolder, fullImageTargetFolder,
          DocumentTypeUtils.getStellentType(mimeType), conf.get(FULLIMAGE_WIDTH));
      fullImageTask.addTaskListenner(fullImageHanlder);
    }
    else
    {
      fullImageTask = new FullImageConversionTask(conversionServiceURL, conversionResultURL, conversionService.getHttpClient());
      fullImageTask.setJobId(jobId);
      fullImageTask.setTargetPath(targetPath);
      fullImageTask.setViewerLockerPath(this.viewerLockerPath);
      fullImageTask.setParamMap(getFullImageParamMap());
      logger.info("Conversion task for fullimage JOBID:" + jobId);
      logger.info("Conversion task for fullimage restored...");

      String fullImageTargetFolder = ViewerUtil.getTargetFolder(cacheDesc.getFullImageURI(), TaskCategory.FULLIMAGES);
      String width = AbstractDocumentService.getStellentOptions(mimeType).get(FULLIMAGE_WIDTH);
      fullImageHanlder = new RenditionConversionHandler(FULLIMAGE, fullImageTargetFolder, fullImageTargetFolder,
          DocumentTypeUtils.getStellentType(mimeType), width);
      fullImageTask.addTaskListenner(fullImageHanlder);
    }

  }

  private void queryState() throws Exception
  {
    if (this.isConversionDone && !this.isConversionDoneForThumbnail)
    {
      logger.log(Level.FINE, "Only Thumbnail Task need to query.....");
      conversionService.queryState(new ConversionTask[] { thumbnailTask }, this);
    }
    else if (!this.isConversionDone && this.isConversionDoneForThumbnail)
    {
      logger.log(Level.FINE, "Only FullImage Task need to query.....");
      conversionService.queryState(new ConversionTask[] { fullImageTask }, this);
    }
    else if (!this.isConversionDone && !this.isConversionDoneForThumbnail)
    {
      logger.log(Level.FINE, "Both Thumbnail and  FullImage Task need to query.....");
      conversionService.queryState(new ConversionTask[] { thumbnailTask, fullImageTask }, this);
    }
    helper.addElement(Constant.STEP_KEY, Constant.JOB_QUERYSTATE_FINISHED);
  }

  private void storeCache() throws Exception
  {
    JSONObject meta = new JSONObject();
    String thumbnailConvertDir = ViewerUtil.getTargetFolder(cacheDesc.getThumbnailURI(), TaskCategory.THUMBNAILS);
    String fullImageConvertDir = ViewerUtil.getTargetFolder(cacheDesc.getFullImageURI(), TaskCategory.FULLIMAGES);
    String widthThumbnail = AbstractDocumentService.getStellentOptions(mimeType).get(THUMBNAIL_WIDTH);
    String widthFullImage = AbstractDocumentService.getStellentOptions(mimeType).get(FULLIMAGE_WIDTH);
    meta.put("thumbnails",
        this.getHandler(THUMBNAIL, thumbnailConvertDir, thumbnailConvertDir, DocumentTypeUtils.getStellentType(mimeType), widthThumbnail)
            .getResultJson());
    meta.put("fullImages",
        this.getHandler(FULLIMAGE, fullImageConvertDir, fullImageConvertDir, DocumentTypeUtils.getStellentType(mimeType), widthFullImage)
            .getResultJson());
    // XXX-NBM to be worked out
    DocumentServiceUtil.storeDraft(user, this.docEntry, meta, false);
    helper.addElement(Constant.STEP_KEY, Constant.JOB_STORE_CACHE_FINISHED);
  }

  protected void correctMimeType(ConversionException e) throws Exception
  {
    // This part is used to handle the invalid mimetype but in fact it can be converted with corrected mime type
    if (e.getErrCode() == ConversionException.EC_CONV_EXT_CONTENT_MISMATCH)
    {
      this.sourceMimeType = (String) e.getData().get(Constant.CORRECT_FORMAT);
      if (this.sourceMimeType != null)
      {
        logger.log(Level.FINE, "This mimetype can be corrected to: " + this.sourceMimeType);
        helper.addElement(Constant.SOURCE_MIMETYPE_KEY, this.sourceMimeType);

        this.mimeType = this.sourceMimeType;
      }
      else
      {
        StringBuffer msg = new StringBuffer();
        msg.append(ServiceCode.S_ERROR_UNSUPPORTTED_MIME);
        msg.append("The MIME type of ");
        msg.append(docEntry.getDocUri());
        msg.append(" is " + docEntry.getMimeType());
        msg.append(" .returned type by Conversion is: " + e.getData());
        logger.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_UNSUPPORTTED_MIME, msg.toString()));
        throw e;
      }
    }
    else
    {
      throw e;
    }
  }

  public void continueWork() throws Exception
  {
    logger.log(Level.INFO, "started continueWork() for userID: {0},DocId:{1}, MimeType:{2}, Version:{3}" + " Step:" + step, new Object[] {
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
        // Only if the step in JOB_FULLIMAGE_STARTED we don't need to convert it.
        if (step.equals(Constant.JOB_FULLIMAGE_STARTED))
        {
          this.convertFullImage(false);
        }
        else
        {
          this.convertFullImage(true);
        }
        this.convertThumbnail();
        this.queryState();
      }
      catch (ConversionException e)
      {
        this.correctMimeType(e);
        this.convertFullImage(true);
        this.convertThumbnail();
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

    cacheDesc = new ImageCacheDescriptor(user, docEntry);
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
    logger.log(Level.INFO, "complete continueTailWork() DocURI:{0}, MimeType:{1}, Version:{2}" + " Step:" + step, new Object[] {
        this.docEntry.getDocUri(), this.docEntry.getMimeType(), this.docEntry.getVersion() });
  }

  private RenditionConversionHandler getHandler(String name, String convertDir, String mediaDir, String stellentType, String width)
  {
    if (name.equals(THUMBNAIL))
    {
      if (thumbnailHanlder == null)
        thumbnailHanlder = new RenditionConversionHandler(name, convertDir, mediaDir, stellentType, width);
      return thumbnailHanlder;
    }
    else
    {
      if (fullImageHanlder == null)
        fullImageHanlder = new RenditionConversionHandler(name, convertDir, mediaDir, stellentType, width);
      return fullImageHanlder;
    }
  }

  protected boolean isViewerStarted()
  {
    File f = new File(viewerLockerPath);
    if (f.exists())
      return true;
    else
      return false;
  }

  public boolean hasUploadConversion()
  {
    ImportDraftFromRepositoryContext idc = (ImportDraftFromRepositoryContext) getJobContext();

    boolean isImageView = !idc.isHTML;
    File f = new File(idc.draftDescriptor.getInternalURI() + File.separator + idc.docEntry.getDocId() + File.separator + FULLIMAGE);
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

  public void manageWork() throws Exception
  {
    StringBuffer msg = new StringBuffer("Viewer conversion fails.");
    try
    {
      ConversionTask thumbnailTask = conversionService.createConversionTask(TaskCategory.THUMBNAILS);
      ConversionTask fullImageTask = conversionService.createConversionTask(TaskCategory.FULLIMAGES);
      Hashtable<String, Object> paramMap = new Hashtable<String, Object>();
      paramMap.put("targetPath", this.cacheDesc.getInternalURI() + File.separator + docEntry.getDocId() + File.separator + FULLIMAGE);
      fullImageTask.setParamMap(paramMap);
      Map<String, String> conf = AbstractDocumentService.getStellentOptions(this.mimeType);

      UploadConversionHandler thumbnailHanlder = new UploadConversionHandler(THUMBNAIL, this.cacheDesc.getInternalURI() + File.separator
          + docEntry.getDocId() + File.separator + THUMBNAIL, this.cacheDesc.getThumbnailURI(),
          DocumentTypeUtils.getStellentType(mimeType), conf.get(THUMBNAIL_WIDTH));
      thumbnailTask.addTaskListenner(thumbnailHanlder);
      UploadConversionHandler fullImageHanlder = new UploadConversionHandler(FULLIMAGE, this.cacheDesc.getInternalURI() + File.separator
          + docEntry.getDocId() + File.separator + FULLIMAGE, this.cacheDesc.getFullImageURI(),
          DocumentTypeUtils.getStellentType(mimeType), conf.get(FULLIMAGE_WIDTH));
      fullImageTask.addTaskListenner(fullImageHanlder);

      thumbnailHanlder.addListener(fullImageHanlder);
      fullImageHanlder.addListener(thumbnailHanlder);

      conversionService.queryState(new ConversionTask[] { thumbnailTask, fullImageTask }, this);
      JSONObject meta = new JSONObject();

      meta.put("thumbnails", thumbnailHanlder.getResultJson());
      meta.put("fullImages", fullImageHanlder.getResultJson());

      // XXX-NBM to be worked out
      DocumentServiceUtil.storeDraft(this.user, this.docEntry, meta, false);
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

  public void cleanFolder(File f)
  {
    try
    {
      if (f.exists())
      {
        FileUtils.cleanDirectory(f);
        f.delete();
      }
    }
    catch (IOException e)
    {
      logger.log(Level.WARNING, "Clean folder failed. Document Id:" + docEntry.getDocId());
    }
  }
}
