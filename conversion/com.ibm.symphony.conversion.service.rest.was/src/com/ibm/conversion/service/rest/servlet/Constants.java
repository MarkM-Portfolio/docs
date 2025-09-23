/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.conversion.service.rest.servlet;

public class Constants
{
  /**
   * file path to be converted. There are two method to specify the file: 1.filePath (ignore InputStream if exists) 2.InputStream of request
   * body (only used without filePath)
   */
  public static final String PARAMETER_FILEPATH = "filePath";

  public static final String PARAMETER_TARGETFOLDER = "targetFolder";

  public static final String PARAMETER_SOURCETYPE = "sourceMIMEType";

  public static final String PARAMETER_TARGETTYPE = "targetMIMEType";

  public static final String PARAMETER_JOBID = "JOBID";

  public static final String PARAMETER_SERVERNAME = "SERVERNAME";

  public static final String PARAMETER_ACTION = "action";

  public static final String PARAMETER_PICTURE_FOLDER = "pictureFolder";

  // return converted file path if set to true, else return binary stream
  public static final String PARAMETER_RETURNPATH = "returnPath";

  public static final String HEADER_JOBID = "JOBID";

  public static final String HEADER_CONVERSION_ERRORS = "Conversion-Errors";

  public static final String HEADER_CONVERSION_WARNINGS = "Conversion-Warning";

  // converted file path. Only return if "returnPath" is set using Get method
  public static final String HEADER_TARGET_PATH = "targetPath";

  public static final String INCOMING_FOLDER_NAME = "incoming";

  public static final String TEMP_FOLDER_NAME = "temp";

  public static final String CONVERSION_SERVER_STATUS = "conversion_server_status";

  public static final String MONITOR_SERVERS_FOLDER = "servers";

  public static final String JOB_RESULT_FILE_NAME = "result.json";

  public static final String JOB_STATUS_FILE_NAME = "status.json";

  public static final String MAX_FILE_SIZE = "maxFileSize";

  public static final String RESPONSE_STATUS = "status";

  public static final String PARAMETER_CORRECT_SOURCETYPE = "correctSourceMIMEType";

  public static final String PARAMETER_FORCECONVERT = "forceConvert";

  public static final int HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR = 520;

  public static final int HTTP_RESPONSE_CLUSTER_NODE_DOWN = 494;

  public static final int HTTP_RESPONSE_OUT_OF_QUEUE_SIZE = 493;

  public static final String JOB_RESULT_VERSION_FILE_NAME = "conversionVersion.txt";

  // current conversion version

  public static final String PARAMETER_NFS_TARGET_FOLDER = "nfsTargetFolder";

  public static final String PARAMETER_FROMTEMPLATE = "fromTemplate";

  // for reconvert, if old converter version is different from current conversion version,this will be the old conversion version.
  public static final String PARAMETER_UPGRADE_VERSION = "upgradeVersion";

  public static final String INIT_SOURCE_MIMETYPE = "initSourceMimeType";

  // for convert during upload
  public static final String PARAMETER_UPLOAD_CONVERT = "background";

  public static final String PNG = "application/png";

  public static final String GIF = "application/gif";

  public static final String JPEG = "application/jpeg";

  public static final String PARAMETER_DETECT = "detect";
  
  public static final String NO_CACHE_HEADER_KEY = "Cache-Control";
  
  public static final String NO_CACHE_HEADER_VALUE = "private, no-store, no-cache, must-revalidate";

}
