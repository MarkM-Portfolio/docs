/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.services.rest.thumbnails;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.viewer.config.ThumbnailConfig;
import com.ibm.concord.viewer.config.ViewerConfig;
import com.ibm.concord.viewer.config.ThumbnailConfig.ThumbnailRequestType;
import com.ibm.concord.viewer.document.common.AbstractDocumentService;
import com.ibm.concord.viewer.job.Job;
import com.ibm.concord.viewer.job.JobContext;
import com.ibm.concord.viewer.job.context.ImportDraftFromRepositoryContext;
import com.ibm.concord.viewer.job.exception.JobExecutionException;
import com.ibm.concord.viewer.platform.Platform;
import com.ibm.concord.viewer.platform.conversion.ConversionComponentImpl;
import com.ibm.concord.viewer.platform.conversion.IConversionService;
import com.ibm.concord.viewer.platform.conversion.StellentOption;
import com.ibm.concord.viewer.platform.exceptions.ConversionException;
import com.ibm.concord.viewer.platform.exceptions.UnsupportedMimeTypeException;
import com.ibm.concord.viewer.platform.util.Constant;
import com.ibm.concord.viewer.services.rest.thumbnails.ThumbnailService4Doc.DownsizeSourceType;
import com.ibm.concord.viewer.tempstorage.repository.TempStorageRepository;
import com.ibm.json.java.JSONObject;

public class ThumbnailServiceJob extends Job
{
  private static final String THUMBNAIL_CONVERSION_SWITCH = "convertthumbnail";

  private ImportDraftFromRepositoryContext jobContext;

  private static final Logger logger = Logger.getLogger(ThumbnailServiceJob.class.getName());

  private DownsizeSourceType downsizeSrcType = DownsizeSourceType.VIEW_CONVERSION_RESULT;

  public ThumbnailServiceJob(ImportDraftFromRepositoryContext jobContext)
  {
    super(jobContext);
    if (jobContext.mediaURI == null)
    {
      throw new NullPointerException();
    }

    this.jobContext = jobContext;
  }

  public ThumbnailServiceJob(ImportDraftFromRepositoryContext jobContext, boolean isUploadConversion)
  {
    super(jobContext, isUploadConversion);

    if (jobContext.mediaURI == null)
    {
      throw new NullPointerException();
    }

    // XXX-NBM remove this idc reference as super class already has it
    this.jobContext = jobContext;
    if (isUploadConversion)
    {
      this.currentType = Constant.STATUS_UPLOAD;
    }
    else
    {
      this.currentType = Constant.STATUS_VIEW;
    }
  }

  public String getDocumentId()
  {
    return this.jobContext.docEntry.getDocId();
  }

  public boolean hasUploadConversion()
  {
    boolean isImageView = !jobContext.isHTML;
    File f = new File(jobContext.draftDescriptor.getInternalURI() + File.separator + jobContext.docEntry.getDocId() + File.separator
        + FULLIMAGE);
    if (isImageView)
    {
      if (f.exists() && new File(f, STATE).exists())
      {
        return true;
      }
    }
    else
    // HTML
    {
      if (new File(f.getParentFile(), STATE).exists())
      {
        return true;
      }
    }
    return false;
  }

  @Override
  public void cleanFailure()
  {
    File[] files = jobContext.getWorkingDir().listFiles();
    for (File file : files)
    {
      if (!file.getName().equals(jobContext.getJobId()))
      {
        file.delete();
      }
    }

  }

  @Override
  public Object exec() throws JobExecutionException
  {
    logger.entering(ThumbnailServiceJob.class.getName(), "exec");

    IConversionService conversionService = (IConversionService) Platform.getComponent(ConversionComponentImpl.COMPONENT_ID).getService(
        IConversionService.class);
    String lockerFileName = jobContext.draftDescriptor.getInternalURI() + File.separator + Constant.VIEWER_JOB_LOCKER;
    Map<String, String> opsConf = AbstractDocumentService.getStellentOptions(jobContext.sourceMime);
    HashMap<String, Object> options = new HashMap<String, Object>();
    options.clear();
    options.putAll(opsConf);
    options.remove(THUMBNAIL_CONVERSION_SWITCH);
    options.put(Constant.VIEWER_JOB_LOCKER_KEY, lockerFileName);

    // thumbnail service
    options.put(ThumbnailConfig.SMALL_THUMBNAIL_WIDTH_KEY, String.valueOf(ThumbnailConfig.SMALLWIDTH));
    options.put(ThumbnailConfig.MEDIUM_THUMBNAIL_WIDTH_KEY, String.valueOf(ThumbnailConfig.MEDIUMWIDTH));
    options.put(ThumbnailConfig.LARGE_THUMBNAIL_WIDTH_KEY, String.valueOf(ThumbnailConfig.LARGEWIDTH));
    options.put(ThumbnailConfig.SMALL_THUMBNAIL_HEIGHT_KEY, String.valueOf(ThumbnailConfig.SMALLHEIGHT));
    options.put(ThumbnailConfig.MEDIUM_THUMBNAIL_HEIGHT_KEY, String.valueOf(ThumbnailConfig.MEDIUMHEIGHT));
    options.put(ThumbnailConfig.LARGE_THUMBNAIL_HEIGHT_KEY, String.valueOf(ThumbnailConfig.LARGEHEIGHT));
    options.put("docId", jobContext.docEntry.getDocId());
    options.put("repoId", jobContext.docEntry.getRepository());
    options.put("lastModified", String.valueOf(jobContext.docEntry.getModified().getTimeInMillis()));
    options.put("inotesRequest", String.valueOf(jobContext.docEntry.getRepository().equals(TempStorageRepository.REPO_ID_TEMP_STORAGE)));
    options.put("thumbSrvReq", ThumbnailRequestType.GENERATE_THUMBNAILS.name());
    options.put("thumbnailTarget", jobContext.thumbnailDesc.getThumbnailServiceURI());
    options.put("userId", ViewerConfig.getInstance().isLocalEnv() ? jobContext.requester.getEmail() : jobContext.requester.getId());
    options.put(ThumbnailConfig.THUMBNAILS_JOB_KEY, "true");
    options.put(Constant.VIEWER_SHARED_DATA_NAME, jobContext.draftDescriptor.getSharedDataName());
    options.put(Constant.VIEWER_SHARED_DATA_ROOT, jobContext.draftDescriptor.getCacheHome());
    options.put("communityId", jobContext.docEntry.getCommunityId());
    options.put("thumbnailPostUserEmail", jobContext.requester.getEmail());
    String srcMIME = jobContext.sourceMime;
    if ("application/vnd.ms-excel".equals(srcMIME) || "application/vnd.oasis.opendocument.spreadsheet".equals(srcMIME)
        || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".equals(srcMIME))
    {
      options.put(ThumbnailConfig.THUMBNAILS_CROPIMAGE_KEY, "true");
    }

    String picName = (String) options.get("title");
    String oid = (String) options.get(StellentOption.OUTPUT_ID.getName());
    String ext = "." + oid.substring(3).toLowerCase();
    if (ext.equals(".jpeg"))
      ext = ".jpg";
    String prefix = picName != null ? picName : "image";
    try
    {
      String firstImgPath = null;
      switch (downsizeSrcType)
        {
          case UPLOAD_CONVERSION_RESULT :
            firstImgPath = jobContext.draftDescriptor.getInternalURI() + File.separator + jobContext.docEntry.getDocId() + File.separator
                + FULLIMAGE;
            break;
          case VIEW_CONVERSION_RESULT :
            firstImgPath = jobContext.draftDescriptor.getFullImageURI();
            break;
        }
      if (firstImgPath == null)
        throw new IllegalArgumentException("Invalid first image path for thumbnail downsize job.");

      File firstPageImg = new File(firstImgPath, prefix + ext);
      conversionService.convert(firstPageImg.getAbsolutePath(), "application/gif", "application/gif",
          jobContext.thumbnailDesc.getThumbnailServiceURI(), options, true, this);
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
    catch (UnsupportedMimeTypeException e)
    {
      throw new JobExecutionException(e.getErrorCode(), e);
    }
    catch (IOException e)
    {
      throw new JobExecutionException(-1, e);
    }
    catch (Exception e)
    {
      logger.log(Level.SEVERE, "unknow error " + e);
      throw new JobExecutionException(-1, e);
    }
    logger.exiting(ThumbnailServiceJob.class.getName(), "exec", "SUCCESS");
    return "SUCCESS";
  }

  @Override
  public void putResult(Object result)
  {
    try
    {
      writeString2File(new File(jobContext.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX), (String) result);
      logger.warning("Thumbnail service generataion done.  Document Id: " + jobContext.docEntry.getDocId());
    }
    catch (IOException e)
    {
      new File(jobContext.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX).delete();
      putError(e);
    }

  }

  @Override
  public File getResultFile()
  {
    return new File(jobContext.getWorkingDir(), RESULT + NONE_RESULT_SUFFIX);
  }

  public DownsizeSourceType getDownsizeSrcType()
  {
    return downsizeSrcType;
  }

  public void setDownsizeSrcType(DownsizeSourceType downsizeSrcType)
  {
    this.downsizeSrcType = downsizeSrcType;
  }

}
