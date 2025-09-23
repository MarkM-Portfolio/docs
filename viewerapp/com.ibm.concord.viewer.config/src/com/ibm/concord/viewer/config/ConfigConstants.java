/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.config;

public class ConfigConstants
{
  public static final String CACHE_FREQUENCY_KEY = "frequency";

  public static final String RENDITION_AGE_THRESHOLD_KEY = "age_threshold_of_rendition_latest_version";

  public static final String CACHE_SIZE_THRESHOLD_KEY = "size_threshold_of_rendition_cache";

  public static final String HOUSE_KEEPING_KEY = "House_Keeping";

  public static final String FILE_SIZE_THRESHOLD_KEY = "file_size_threshold";

  public static final String VIEWER_SHARED_DATA_ROOT = "VIEWER_SHARED_DATA_ROOT";
  
  public static final String VIEWER_LOCAL_DATA_ROOT="VIEWER_LOCAL_DATA_ROOT";

  public static final String VIEWER_SHARED_DATA_NAME = "VIEWER_SHARED_DATA_NAME";
  
  public static final String DOCS_SHARED_DATA_NAME = "DOCS_SHARED_DATA_NAME";

  public static final String THUMBNAILSRV_AGE_THRESHOLD_KEY = "age_threshold_of_thumbnailSrv_latest_version";

  public static final String THUMBNAILS_KEY = "thumbnails";

  public static final String THUMBNAILSRV_IMAGE_TASKQUEUE_CAPACITY = "capacity_of_thumbnailSrv_image_taskqueue";

  public static final String MAILATTACHMENT_AGE_THRESHOLD_KEY = "age_threshold_of_mail_attachment";

  public static final String CACHE_TYPE = "cache_type";

  public static final String VIEWER_LOCAL_DATA_NAME = "VIEWER_LOCAL_DATA_NAME";
  
  public enum CacheType{
    LOCAL,
    NFS
  }
  
  public static final String IS_ENCRYPTED = "cache_encrypt"; 
  
  public static final String DOMAIN_LIST_KEY = "WhiteDomainList";
  
  public static final String DISK_THRESHOLD_OF_CACHE = "disk_threshold_of_cache";
}