package com.ibm.symphony.conversion.service.common;

public class ErrCodeConstants
{ 
  //0-999: http response to concord
  //1000-1199:conversion.service.rest.was (1200-1500 info code)
  public static final int CONVERSION_SERVLET_INIT_ERR = 1000;

  public static final int CONVERSION_FILESTREAM_CLOSE_ERR = 1001;
  
  public static final int CONVERSION_SERVERINFO_NEW_ERR = 1002;

  public static final int CONVERSION_SERVERINFO_DEL_ERR = 1003;

  public static final int CONVERSION_SERVERINFO_READ_ERR = 1004;

  public static final int CONVERSION_VERSIONINFO_NEW_ERR = 1005;

  public static final int CONVERSION_VERSIONINFO_DEL_ERR = 1006;

  public static final int CONVERSION_RESULT_NEW_ERR = 1007;

  public static final int CONVERSION_RESULT_DEL_ERR = 1008;

  public static final int CONVERSION_RESULT_READ_ERR = 1009;

  public static final int CONVERSION_SERVER_MONITOR_NEW_ERR = 1010;

  public static final int CONVERSION_SERVER_MONITOR_DEL_ERR = 1011;

  public static final int CONVERSION_SERVER_MONITOR_READ_ERR = 1012;

  public static final int CONVERSION_SERVER_MONITOR_WRITE_ERR = 1013;

  public static final int CONVERSION_WAS_WORK_ERR = 1014;
  
  public static final int CONVERSION_TASK_MISSING_ERR = 1015;
  
  public static final int CONVERSION_SERVER_PROCESSID_READ_ERR = 1016;
  
  public static final int CONVERSION_S2S_TOKEN_MISSING_ERR = 1017;

  public static final int CONVERSION_S2S_TOKEN_MISMATCH_ERR = 1018;

  public static final int CONVERSION_S2S_TOKEN_READ_ERR = 1019;
  
  public static final int CONVERSION_WAS_CONFIG_LOAD_ERR = 1020;

  public static final int CONVERSION_SERVICE_MISSING_ERR = 1021;
  
  public static final int CONVERSION_NFS_TARGET_MISSING_ERR = 1022;
  
  public static final int CONVERSION_JOB_STATUS_DEL_ERR = 1023;
}
