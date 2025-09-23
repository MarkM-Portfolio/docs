/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.document.common;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.FileUtils;

import com.ibm.concord.viewer.cache.CacheStorageManager;
import com.ibm.concord.viewer.cache.exception.CacheDataAccessException;
import com.ibm.concord.viewer.cache.spi.impl.ImageCacheDescriptor;
import com.ibm.concord.viewer.cache.spi.impl.ThumbnailDescriptor;
import com.ibm.concord.viewer.config.ThumbnailConfig;
import com.ibm.concord.viewer.config.ThumbnailConfig.ThumbnailRequestType;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.document.common.rendition.RenditionConversionHandler;
import com.ibm.concord.viewer.document.common.rendition.UploadConversionHandler;
import com.ibm.concord.viewer.document.services.DocumentServiceUtil;
import com.ibm.concord.viewer.job.object.ImportDraftFromRepositoryJob;
import com.ibm.concord.viewer.platform.ConversionUtils;
import com.ibm.concord.viewer.platform.conversion.ConversionTask;
import com.ibm.concord.viewer.platform.conversion.ConversionTask.TaskCategory;
import com.ibm.concord.viewer.platform.conversion.IConversionService;
import com.ibm.concord.viewer.platform.conversion.StellentOption;
import com.ibm.concord.viewer.platform.conversionResult.ConversionConstants;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.platform.util.DocumentTypeUtils;
import com.ibm.concord.viewer.platform.util.JobHelper;
import com.ibm.concord.viewer.platform.util.LimitsUtil;
import com.ibm.concord.viewer.platform.util.ViewerUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.MediaDescriptor;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.cache.ICacheDescriptor;
import com.ibm.concord.viewer.spi.document.services.IDocumentService;
import com.ibm.concord.viewer.spi.exception.DocumentServiceException;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.job.IConversionJob;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.concord.viewer.tempstorage.repository.TempStorageRepository;
import com.ibm.docs.common.util.URLConfig;
import com.ibm.json.java.JSONObject;

/**
 * @author zhouqf@cn.ibm.com
 * 
 */
public class DocumentServiceHelper
{
  private static final Logger LOG = Logger.getLogger(DocumentServiceHelper.class.getName());

  private static final String THUMBNAIL_WIDTH = "thumbnailwidth";

  private static final String FULLIMAGE_WIDTH = "graphicwidth";

  private static final String THUMBNAIL = "thumbnails";

  public static final String THUMBNAILSERVICE = "thumbnailService";

  private static final String FULLIMAGE = "pictures";

  private static final String THUMBNAIL_CONVERSION_SWITCH = "convertthumbnail";

  private static final String THUMBNAILSERVICE_FILENAME = "ThumbnailService";

  protected ICacheDescriptor cacheDesc;

  protected ThumbnailDescriptor thumbnailDesc;

  protected File contentFile;

  protected File tempFolder;

  protected JobHelper helper;

  protected String lockerFileName;

  protected MediaDescriptor media;

  protected HashMap<String, Object> options;

  protected String filePath;

  protected String mimeType;

  protected String sourceMimeType;

  protected UserBean caller;

  protected IDocumentEntry entry;

  protected IConversionService conversionService;

  private ConversionTask thumbnailTask = null;

  private ConversionTask fullImageTask = null;

  private RenditionConversionHandler thumbnailHanlder = null;

  private RenditionConversionHandler fullImageHanlder = null;

  private String targetMimeType = "application/gif";

  protected IConversionJob job = null;

  private boolean isTempStorage = false;

  private boolean isIE8UserAgent = false;

  private String userAgent;

  private String mode;

  /**
   * Thumbnail request is triggered by Files news event "files.command.createThumbnail".
   */
  protected ThumbnailRequestType thumbReqType = ThumbnailRequestType.VIEW_DOCUMENT;
  public void putDownloadCompleteMessage(String msg)
  {
    boolean isMsgSource = false;
    BlockingQueue<String> jobMsgQ = null;
    if (job instanceof ImportDraftFromRepositoryJob)
    {
      isMsgSource = ((ImportDraftFromRepositoryJob) job).isMsgSource;      
      jobMsgQ = ((ImportDraftFromRepositoryJob) job).jobMsgQ;   
    }
    
    if( !isMsgSource )
      return;
    
    if( jobMsgQ != null )
    {
      try
      {
        jobMsgQ.put(msg);
      }
      catch (InterruptedException e)
      {
        LOG.warning("Interrupted, when put download complete message into jobMsgQ.");
        return;
      }
      LOG.info("------> Message in jobMsgQ: " + msg);     
      return;
    }      
  }
  
  public String getDownloadCompleteMessage()
  {
    String msg = null;
    boolean isMsgSource = false;
    BlockingQueue<String> jobMsgQ = null;
    if (job instanceof ImportDraftFromRepositoryJob)
    {
      isMsgSource = ((ImportDraftFromRepositoryJob) job).isMsgSource;      
      jobMsgQ = ((ImportDraftFromRepositoryJob) job).jobMsgQ;   
    }
    
    if( jobMsgQ == null || isMsgSource)
    {
      return null;
    }   
  
    try
    {
      msg = jobMsgQ.poll(60000, TimeUnit.MILLISECONDS);
    }
    catch (InterruptedException e)
    {
      LOG.warning("Interrupted, when wait message in jobMsgQ: " + String.valueOf(msg));
    }
    finally
    {
      jobMsgQ = null;
    }
    LOG.info("<------ Message out jobMsgQ: " + String.valueOf(msg));
     
    return msg;
  }

  public DocumentServiceHelper(UserBean caller, String userAgent, String mode, IDocumentEntry entry, IConversionService conversionService,
      String targetMimeType, IConversionJob job)
  {
    this.caller = caller;
    this.entry = entry;
    this.conversionService = conversionService;
    this.targetMimeType = targetMimeType;
    this.job = job;
    this.setUserAgent(userAgent);
    this.setMode(mode);

    if (job.getCurrentType().equals(Constant.STATUS_UPLOAD))
    {
      thumbReqType = ThumbnailRequestType.UPLOAD_NEW_DOCUMENT;
    }
    if (job instanceof ImportDraftFromRepositoryJob && ((ImportDraftFromRepositoryJob) job).isThumbnailRequest())
    {
      thumbReqType = ThumbnailRequestType.GENERATE_THUMBNAILS;
    }
    this.thumbnailDesc = new ThumbnailDescriptor(this.entry);
    if (thumbReqType == ThumbnailRequestType.GENERATE_THUMBNAILS && job.getCurrentType().equals(Constant.STATUS_UPLOAD))
    {
      cacheDesc = thumbnailDesc;
    }
    else if (job.getCurrentType().equals(Constant.STATUS_UPLOAD))
    {
      setCacheDescriptor4UploadConversion();
    }
    else
    {
      cacheDesc = CacheStorageManager.getCacheStorageManager().getCacheDescriptor(caller, entry, this.userAgent, this.mode);
    }
    this.isTempStorage = entry.getRepository().equals(TempStorageRepository.REPO_ID_TEMP_STORAGE);
    this.lockerFileName = this.cacheDesc.getInternalURI() + File.separator + Constant.VIEWER_JOB_LOCKER;
    this.helper = new JobHelper(this.lockerFileName);
  }

  protected void setCacheDescriptor4UploadConversion()
  {
    cacheDesc = new ImageCacheDescriptor(caller, entry);
    LOG.log(Level.INFO, ">>> Image upload conversion request. Path= {0}", cacheDesc.getInternalURI());
  }

  public void setUserAgent(String userAgent)
  {
    this.userAgent = userAgent;
    isIE8UserAgent = ViewerUtil.isIE8(userAgent);
  }

  public void setMode(String mode)
  {
    this.mode = mode;

  }

  /**
   * Need to overridded
   * 
   * @return
   */
  protected boolean isHTML()
  {
    return false;
  }

  public void exec() throws Exception
  {
    StringBuffer msg = new StringBuffer("Viewer conversion fails.");
    try
    {
      if (job.getCurrentType().equals(Constant.STATUS_UPLOAD))
      {
        this.manageRequest();
      }
      else if (job.getCurrentType().equals(Constant.STATUS_MANAGE))
      {
        String resultPath = this.cacheDesc.getInternalURI() + File.separator + entry.getDocId() + File.separator + FULLIMAGE;
        JSONObject result = ConversionUtils.getConversionResult(resultPath);
        int statusCode = (Integer) result.get(ConversionUtils.STATUS_CODE);
        if (String.valueOf(statusCode).equals(ConversionConstants.SC_OK)
            || String.valueOf(statusCode).equals(ConversionConstants.SC_ACCEPTED))
        {
          CacheStorageManager.getCacheStorageManager().prepareCache(this.cacheDesc);
          this.manageWork();
        }
      }
      else
      {
        cleanFolder(new File(this.cacheDesc.getInternalURI() + File.separator + entry.getDocId()));
        job.setCurrentType(Constant.STATUS_VIEW);
        // normal logic for view
        this.prepare();
        try
        {
          this.convertThumbnail();
          this.convertFullImage();
          this.queryState();
        }
        catch (ConversionException e)
        {
          releaseLock();
          this.correctMimeType(e);
          this.convertThumbnail();
          this.convertFullImage();
          this.queryState();
        }
        this.storeCache();
        // clean up source document after image conversion, for both upload and preview case
        this.cleanSourceAndTempDocumentAfterConversion();
        LOG.log(Level.INFO, "Rendition conversion done. Document Id: " + entry.getDocId());
      }
    }
    catch (ConversionException e)
    {
      msg.append(ServiceCode.S_ERROR_CONVERSION_EXCEPTION);
      msg.append(" Error code:" + e.getErrCode());
      msg.append(" Error message:" + e.getMessage());
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      LOG.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_CONVERSION_EXCEPTION, msg.toString()));
      throw e;
    }
    catch (RepositoryAccessException e)
    {
      msg.append(ServiceCode.S_ERROR_ACCESS_REPOSITORY);
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      LOG.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_ACESS_REPOSITORY, msg.toString()));
      throw e;
    }
    catch (FileNotFoundException e)
    {
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      LOG.log(Level.SEVERE, "File is not found." + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (InterruptedException e)
    {
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      LOG.log(Level.SEVERE, "InterruptedException throws for " + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (IOException e)
    {
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      msg.append(" IO Message:" + e.getMessage());
      LOG.log(Level.SEVERE, "IOException throws for " + msg.toString());
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }
    catch (UnsupportedMimeTypeException e)
    {
      msg.append(ServiceCode.S_ERROR_UNSUPPORTTED_MIME);
      msg.append("The MIME type of ");
      msg.append(entry.getDocUri());
      msg.append(" is " + entry.getMimeType());
      LOG.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_UNSUPPORTTED_MIME, msg.toString()));
      throw e;
    }
    catch (CacheDataAccessException e)
    {
      msg.append(ServiceCode.S_ERROR_ACESS_CACHE_DATA);
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      msg.append(" Cache Directory:" + cacheDesc.getInternalURI());
      LOG.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.ERROR_ACESS_CACHE_DATA, msg.toString()));
      throw e;
    }
    catch (Exception e)
    {
      msg.append(ServiceCode.S_SEVERE_UNKNOWN_ERROR);
      msg.append(" Document id:" + entry.getDocId());
      msg.append(" Document mimetype:" + entry.getMimeType());
      msg.append(" Document version:" + entry.getVersion());
      LOG.log(Level.SEVERE, LoggerUtil.getLogMessage(ServiceCode.SEVERE_UNKNOWN_ERROR, msg.toString()), e);
      throw new DocumentServiceException(e, DocumentServiceException.EC_DOCUMENT_SERVICE_ERROR);
    }

  }

  public void prepare() throws Exception
  {
    LOG.log(Level.FINEST, "importDocument:" + this.cacheDesc.getInternalURI() + " " + this.entry.getDocUri() + " started");
    if (job.getCurrentType().equals(Constant.STATUS_UPLOAD))
    {
      File sourceDir = new File(this.cacheDesc.getInternalURI() + File.separator + entry.getDocId());
      sourceDir.mkdirs();
      
      this.contentFile = new File(sourceDir, "contentfile");      
      retrieveContenfile();   
      
      this.options = new HashMap<String, Object>();
      this.options.put(Constant.VIEWER_JOB_LOCKER_KEY, this.lockerFileName);
    }
    else
    {
      // If the conversion is a normal view action rather than upload or manage action, the upload conversion directory need to be cleaned
      // to let upload conversion stopped
      cleanFolder(new File(this.cacheDesc.getInternalURI() + File.separator + entry.getDocId()));

      File cacheTempFolder = new File(this.cacheDesc.getTempURI(null));

      this.tempFolder = new File(cacheTempFolder, this.entry.getDocId());
      FileUtil.createTempFolder(this.tempFolder);

      // This helper is used to track the current step
      // Delete the file and start new track
      this.helper.clearElements();
      helper.addElement(Constant.STEP_KEY, Constant.JOB_START);
      
      this.contentFile = new File(cacheTempFolder, "contentfile");      
      retrieveContenfile();            
        
      this.options = new HashMap<String, Object>();
      this.options.put(Constant.VIEWER_JOB_LOCKER_KEY, this.lockerFileName);
      
      helper
          .addElements(
              new String[] { Constant.STEP_KEY, Constant.FILE_PATH_KEY, Constant.SOURCE_MIMETYPE_KEY, Constant.TARGET_MIMETYPE_KEY },
              new String[] { Constant.JOB_DOWNLOAD_FILE_DONE, this.contentFile.getAbsolutePath(), entry.getMimeType(),
                  this.getTargetMimeType() });
      CacheStorageManager.getCacheStorageManager().prepareCache(this.cacheDesc);
    }
    this.filePath = this.contentFile.getAbsolutePath();
    putDownloadCompleteMessage(filePath);
    this.mimeType = entry.getMimeType();
    this.sourceMimeType = entry.getMimeType();
  }

  private void retrieveContenfile() throws IOException, RepositoryAccessException
  {
    String msg = getDownloadCompleteMessage();
    File downloadedContentFile = null;
    if (msg != null)
    {
      downloadedContentFile = new File(msg);
    }      
    if( downloadedContentFile != null && downloadedContentFile.exists() )
    {
      FileUtil.copyFileToFile(downloadedContentFile,  this.contentFile);      
      LOG.log(Level.INFO, "Copy donwloaded file " + downloadedContentFile.getAbsolutePath() + " to " + 
          this.contentFile.getAbsolutePath());        
    }
    else        
    {         
      this.media = RepositoryServiceUtil.download(caller, entry);  
      FileUtil.copyInputStreamToFile(media.getStream(), this.contentFile);    
    }
  }

  protected void correctMimeType(ConversionException e) throws Exception
  {
    // This part is used to handle the invalid mimetype but in fact it can be converted with corrected mime type
    if (e.getErrCode() == ConversionException.EC_CONV_EXT_CONTENT_MISMATCH)
    {
      this.sourceMimeType = (String) e.getData().get(Constant.CORRECT_FORMAT);
      if (this.sourceMimeType != null)
      {
        LOG.log(Level.FINE, "This mimetype can be corrected to: " + this.sourceMimeType);
        helper.addElement(Constant.SOURCE_MIMETYPE_KEY, this.sourceMimeType);
        this.mimeType = this.sourceMimeType;
      }
      else
      {
        StringBuffer msg = new StringBuffer();
        msg.append(ServiceCode.S_ERROR_UNSUPPORTTED_MIME);
        msg.append("The MIME type of ");
        msg.append(entry.getDocUri());
        msg.append(" is " + entry.getMimeType());
        msg.append(" .returned type by Conversion is: " + e.getData());
        LOG.log(Level.WARNING, LoggerUtil.getLogMessage(ServiceCode.ERROR_UNSUPPORTTED_MIME, msg.toString()));
        throw e;
      }
    }
    else
    {
      throw e;
    }
  }

  private void releaseLock()
  {
    File thumbSrvLock = new File(new File(thumbnailDesc.getThumbnailServiceURI()), THUMBNAILSERVICE_FILENAME);
    if (thumbSrvLock.exists())
    {
      if (!thumbSrvLock.delete())
      {
        LOG.log(Level.WARNING, "Failed to released lock for thumbnail service. DocId: {0} LastModified: {1}",
            new Object[] { entry.getDocId(), entry.getModified().getTimeInMillis() });
      }
    }
    LOG.log(Level.INFO, "Released thumbnail service lock successfully. DocId: {0} LastModified: {1}", new Object[] { entry.getDocId(),
        entry.getModified().getTimeInMillis() });
  }

  private void convertThumbnail() throws Exception
  {
    Map<String, String> opsConf = AbstractDocumentService.getStellentOptions(this.mimeType);

    this.thumbnailTask = conversionService.createConversionTask(TaskCategory.THUMBNAILS);
    this.thumbnailHanlder = new RenditionConversionHandler(THUMBNAIL, this.cacheDesc.getThumbnailURI(), this.cacheDesc.getThumbnailURI(),
        DocumentTypeUtils.getStellentType(mimeType), opsConf.get(THUMBNAIL_WIDTH));
    this.thumbnailTask.addTaskListenner(this.thumbnailHanlder);

    this.helper.addElements(new String[] { Constant.STEP_KEY, Constant.FILE_PATH_KEY, Constant.SOURCE_MIMETYPE_KEY,
        Constant.TARGET_MIMETYPE_KEY }, new String[] { Constant.JOB_THUMBNAIL_STARTED, this.filePath, this.mimeType, getTargetMimeType() });
  }

  private void convertFullImage() throws Exception
  {
    Map<String, String> opsConf = AbstractDocumentService.getStellentOptions(this.mimeType);
    this.options.clear();
    this.options.putAll(opsConf);
    this.options.remove(THUMBNAIL_CONVERSION_SWITCH);
    this.options.put(Constant.VIEWER_JOB_LOCKER_KEY, this.lockerFileName);
    // thumbnail service
    this.options.put(ThumbnailConfig.SMALL_THUMBNAIL_WIDTH_KEY, String.valueOf(ThumbnailConfig.SMALLWIDTH));
    this.options.put(ThumbnailConfig.MEDIUM_THUMBNAIL_WIDTH_KEY, String.valueOf(ThumbnailConfig.MEDIUMWIDTH));
    this.options.put(ThumbnailConfig.LARGE_THUMBNAIL_WIDTH_KEY, String.valueOf(ThumbnailConfig.LARGEWIDTH));
    this.options.put(ThumbnailConfig.SMALL_THUMBNAIL_HEIGHT_KEY, String.valueOf(ThumbnailConfig.SMALLHEIGHT));
    this.options.put(ThumbnailConfig.MEDIUM_THUMBNAIL_HEIGHT_KEY, String.valueOf(ThumbnailConfig.MEDIUMHEIGHT));
    this.options.put(ThumbnailConfig.LARGE_THUMBNAIL_HEIGHT_KEY, String.valueOf(ThumbnailConfig.LARGEHEIGHT));
    this.options.put("docId", entry.getDocId());
    this.options.put("repoId", entry.getRepository());
    this.options.put("lastModified", String.valueOf(entry.getModified().getTimeInMillis()));
    this.options.put("inotesRequest", String.valueOf(isTempStorage));
    this.options.put("thumbSrvReq", thumbReqType.name());
    this.options.put("thumbnailTarget", this.thumbnailDesc.getThumbnailServiceURI());
    this.options.put("userId", ViewerConfig.getInstance().isLocalEnv() ? this.caller.getEmail() : this.caller.getId());
    this.options.put(Constant.VIEWER_SHARED_DATA_NAME, cacheDesc.getSharedDataName());
    this.options.put(Constant.VIEWER_SHARED_DATA_ROOT, cacheDesc.getCacheHome());
    this.options.put("thumbnailPostUserEmail", this.caller.getEmail());
    this.options.put("communityId", this.entry.getCommunityId());
    String userCode = URLConfig.getRequestCode();
    if (userCode != null)
    	this.options.put("userCode", userCode);
    
    IDocumentService docSrv = DocumentServiceUtil.getDocumentService(entry.getMimeType());
    JSONObject limits = (JSONObject) docSrv.getConfigs().get("limits");
    boolean isThumbUploadJob = (thumbReqType == ThumbnailRequestType.GENERATE_THUMBNAILS)
        && job.getCurrentType().equals(Constant.STATUS_UPLOAD);
    if (isThumbUploadJob /* || (DocumentTypeUtils.isHTML(entry.getMimeType()) && !isIE8UserAgent && !mode.equalsIgnoreCase("compact")) */
        || LimitsUtil.exceedLimits(entry.getMediaSize(), limits))
    {
      LOG.log(Level.INFO, "Set conversion config to only convert one page. Doc Id: " + entry.getDocUri());
      this.options.put(StellentOption.WHAT_TO_PRINT.getName(), "range");
      this.options.put(StellentOption.PRINT_STARTPAGE.getName(), "0");
      this.options.put(StellentOption.PRINT_ENDPAGE.getName(), "1");
    }

    if (job.getCurrentType().equals(Constant.STATUS_UPLOAD))
    {
      String targetFullImageFolder = this.cacheDesc.getInternalURI() + File.separator + entry.getDocId() + File.separator + FULLIMAGE;
      String targetThumbnailsFolder = this.cacheDesc.getInternalURI() + File.separator + entry.getDocId() + File.separator + THUMBNAIL;
      File fullFile = new File(targetFullImageFolder);
      File thumbFile = new File(targetThumbnailsFolder);
      fullFile.mkdirs();
      thumbFile.mkdirs();
      // TODO: Delete this because this should be created by Conversion, this is just for self-test
      // createFlag(fullFile);
      this.fullImageTask = conversionService.convert(this.filePath, this.mimeType, getTargetMimeType(), targetFullImageFolder,
          this.options, true, job);
    }
    else
    {
      this.fullImageTask = conversionService.convert(this.filePath, this.mimeType, getTargetMimeType(), this.cacheDesc.getFullImageURI(),
          this.options, true, job);
      this.fullImageHanlder = new RenditionConversionHandler(FULLIMAGE, this.cacheDesc.getFullImageURI(), this.cacheDesc.getFullImageURI(),
          DocumentTypeUtils.getStellentType(mimeType), opsConf.get(FULLIMAGE_WIDTH));
      this.fullImageTask.addTaskListenner(this.fullImageHanlder);

      this.helper.addElement(Constant.STEP_KEY, Constant.JOB_FULLIMAGE_STARTED);
    }
  }

  private void queryState() throws Exception
  {
    /**
     * start waiting
     */
    conversionService.queryState(new ConversionTask[] { this.thumbnailTask, this.fullImageTask }, job);
    this.helper.addElement(Constant.STEP_KEY, Constant.JOB_QUERYSTATE_FINISHED);
  }

  private void storeCache() throws Exception
  {
    JSONObject meta = new JSONObject();

    meta.put("thumbnails", this.thumbnailHanlder.getResultJson());
    meta.put("fullImages", this.fullImageHanlder.getResultJson());

    DocumentServiceUtil.storeDraft(this.caller, this.entry, meta, false);

    /* for mail repository files, encrypt the cache content */
    if (RepositoryServiceUtil.needEncryption(entry.getRepository()))
    {
      this.thumbnailHanlder.encryptCacheContent(entry, this.caller);
      this.fullImageHanlder.encryptCacheContent(entry, this.caller);
    }

    helper.addElement(Constant.STEP_KEY, Constant.JOB_STORE_CACHE_FINISHED);
    LOG.log(Level.FINEST, "importDocument:" + this.cacheDesc.getInternalURI() + " " + " finished");
  }

  private String getTargetMimeType()
  {
    return this.targetMimeType;
  }

  public void manageWork() throws Exception
  {
    StringBuffer msg = new StringBuffer();
    msg.append(ServiceCode.S_INFO_CONVERSION_CACHELIZE);
    msg.append(" Doc id is ").append(entry.getDocUri());
    msg.append(" LastModified is ").append(entry.getModified().getTimeInMillis());
    LOG.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_CONVERSION_CACHELIZE, msg.toString()));

    try
    {
      ConversionTask thumbnailTask = conversionService.createConversionTask(TaskCategory.THUMBNAILS);
      ConversionTask fullImageTask = conversionService.createConversionTask(TaskCategory.FULLIMAGES);

      Hashtable<String, Object> paramMap = new Hashtable<String, Object>();
      paramMap.put("targetPath", this.cacheDesc.getInternalURI() + File.separator + entry.getDocId() + File.separator + FULLIMAGE);
      fullImageTask.setParamMap(paramMap);
      Map<String, String> conf = AbstractDocumentService.getStellentOptions(this.mimeType);

      UploadConversionHandler thumbnailHanlder = new UploadConversionHandler(THUMBNAIL, this.cacheDesc.getInternalURI() + File.separator
          + entry.getDocId() + File.separator + THUMBNAIL, this.cacheDesc.getThumbnailURI(), DocumentTypeUtils.getStellentType(mimeType),
          conf.get(THUMBNAIL_WIDTH));
      thumbnailTask.addTaskListenner(thumbnailHanlder);
      UploadConversionHandler fullImageHanlder = new UploadConversionHandler(FULLIMAGE, this.cacheDesc.getInternalURI() + File.separator
          + entry.getDocId() + File.separator + FULLIMAGE, this.cacheDesc.getFullImageURI(), DocumentTypeUtils.getStellentType(mimeType),
          conf.get(FULLIMAGE_WIDTH));
      fullImageTask.addTaskListenner(fullImageHanlder);
      thumbnailHanlder.addListener(fullImageHanlder);
      fullImageHanlder.addListener(thumbnailHanlder);
      conversionService.queryState(new ConversionTask[] { thumbnailTask, fullImageTask }, job);
      JSONObject meta = new JSONObject();
      meta.put("thumbnails", thumbnailHanlder.getResultJson());
      meta.put("fullImages", fullImageHanlder.getResultJson());
      DocumentServiceUtil.storeDraft(this.caller, this.entry, meta, false);
      LOG.log(Level.INFO, "Rendition conversion done. Manage work for view. Document Id: " + entry.getDocId());
    }
    catch (Exception e)
    {
      LOG.log(Level.INFO, "Rendition conversion failed. Manage work for view. Document Id: " + entry.getDocId());
      throw e;
    }
    finally
    {
      // If manage work failed, we should clean the upload conversion, if the upload conversion is not cleaned and invalid result file is
      // in,
      // then this document can never be converted again
      // If manage work succeeded, the folder also need to be cleaned
      cleanFolder(new File(this.cacheDesc.getInternalURI() + File.separator + entry.getDocId()));
    }
  }

  public void manageRequest()
  {
    try
    {
      LOG.log(Level.FINE, "Submitting request for image conversion on upload. Document Id: " + entry.getDocId());
      prepare();
      convertFullImage();
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Image conversion for uploading failed. Document Id:" + this.entry.getDocId() + " " + e.getLocalizedMessage());
    }
  }

  public void createFlag(File f)
  {
    File flag = new File(f, "status.json");
    try
    {
      flag.createNewFile();
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "Create flag file failed. Document Id:" + this.entry.getDocId());
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
      LOG.log(Level.WARNING, "Clean folder failed. Document Id:" + this.entry.getDocId());
    }
  }

  public void cleanSourceAndTempDocumentAfterConversion()
  {
    File attachement = new File(this.cacheDesc.getInternalURI(), "mailAttachment");
    if (attachement.exists())
      attachement.delete();
    if (this.contentFile != null)
      this.contentFile.delete();
  }
}
