package com.ibm.docs.viewer.sanity;

public interface ISanityCheck
{
  public static final String CONFIG_CHECK = "Viewer Configuration Check";

  public static final String SHARED_DATA_CHECK = "Shared Storage Check";
  
  public static final String LOCAL_DATA_CHECK = "Local Storage Check";
  
  public static final String DOCS_SHARED_DATA_CHECK = "Docs Storage Check";

  public static final String CONVERSION_CHECK = "Conversoin Nodes Check";

  public static final String THUMBNAIL_CHECK = "Thumbnails Storage Check";
  
  public static final String THIRD_PART_CHECK = "Third Party Integration Check";

  public static final String STATUS = "status";

  public static final String STATUS_SUCCESS = "OK";

  public static final String STATUS_FAIL = "Fail";

  public static final String STATUS_MSG = "msg";

  public static final String CONVERSION_PORT_KEY = "WC_defaulthost";

  public static final String CONVERSION_HOST_KEY = "hostname";
  
  public static final String FILES_CONTENT_DIR = "FILES_CONTENT_DIR";
  
  public static final String PREVIEW_DIR = "preview";
  
  public static final String THIRD_PARTH_CHECK = "third";

  public void checkConfiguration();

  public void checkViewerSharedStorage();

  public void checkConversionNodes();

  public void checkFilesSharedStorage();

}
