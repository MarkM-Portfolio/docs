/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.util;

public class Constant
{
  public final static String USERDISPLAY_COMPOSITE_PREFIX = " <";

  public final static String USERDISPLAY_COMPOSITE_SUFFIX = ">";

  public static final String STEP_KEY = "step";

  // failover steps for image: 1 2 4 5 6 7
  // failover steps for html: 1 2 5 6 7
  public static final String JOB_START = "1";

  public static final String JOB_DOWNLOAD_FILE_DONE = "2";

  public static final String JOB_THUMBNAIL_STARTED = "4";

  public static final String JOB_FULLIMAGE_STARTED = "5";

  public static final String JOB_HTML_STARTED = "5";

  public static final String JOB_QUERYSTATE_FINISHED = "6";

  public static final String JOB_STORE_CACHE_FINISHED = "7";

  public static final String JOB_THUMBNAIL_DONE = "THUMBNAILS.DONE";

  public static final String JOB_THUMBNAILSERVICE_DONE = "THUMBNAILSERVICE.DONE";

  public static final String JOB_FULLIMAGE_DONE = "FULLIMAGES.DONE";

  public static final String JOB_HTML_DONE = "HTML.DONE";

  public static final String VIEWER_JOB_LOCKER_KEY = "viewer.job.locker.filePath";

  public static final String FILE_PATH_KEY = "filePath";

  public static final String SOURCE_MIMETYPE_KEY = "sourceMimeType";

  public static final String TARGET_MIMETYPE_KEY = "targetMimeType";

  public static final String THUMBNAILS_JOBID_KEY = "jobid_thumbnails";

  public static final String THUMBNAILSERVICE_JOBID_KEY = "jobid_thumbnailservice";

  public static final String FULLIMAGE_JOBID_KEY = "jobid_pictures";

  public static final String HTML_JOBID_KEY = "jobid_html";

  public static final String VIEWER_JOB_LOCKER = "job.lock";

  public static final String THUMBNAILS_TARGETPATH_KEY = "targetPath_thumbnails";

  public static final String THUMBNAILSERVICE_TARGETPATH_KEY = "targetPath_thumbnailservice";

  public static final String FULLIMAGE_TARGETPATH_KEY = "targetPath_pictures";

  public static final String HTML_TARGETPATH_KEY = "targetPath_html";

  public static final String STATUS_VIEW = "VIEW";

  public static final String STATUS_UPLOAD = "UPLOAD";

  public static final String STATUS_MANAGE = "MANAGE";
  
  public static final String STATUS_PASSWORD_PROMPT = "PASSWORD_PROMPT";

  /**
   * @see com.ibm.conversion.service.rest.servlet.Constants.PARAMETER_UPLOAD_CONVERT
   */
  public static final String UPLOAD_CONVERT_KEY = "background";

  public static final String SMART_CLOUD = "smart_cloud";

  public static final String CORRECT_FORMAT = "correctFormat";

  public static final String CONV_ERR_CODE = "conv_err_code";

  public static final String LIMITS = "limits";

  public static final String JOBID = "jobId";

  public static final String VIEWER_SHARED_DATA_NAME = "viewer_shared_data_name";

  public static final String VIEWER_SHARED_DATA_ROOT = "viewer_shred_data_root";
  
  public static final String JOB_PRIORITY = "job_priority";

}
