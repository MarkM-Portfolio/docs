/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.viewer.platform.conversionResult;

public class ConversionConstants
{

  public static final String DOC_MIMETYPE = "application/msword";

  public static final String DOCX_MIMETYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  public static final String HTML_MIMETYPE = "text/html";

  public static final String ODT_MIMETYPE = "application/vnd.oasis.opendocument.text";

  public static final String OTT_MIMETYPE = "application/vnd.oasis.opendocument.text-template";

  public static final String PDF_MIMETYPE = "application/pdf";

  public static final String ODS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet";

  public static final String JSON_MIMETYPE = "application/json";

  public static final String OTS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet-template";

  public static final String ODP_MIMETYPE = "application/vnd.oasis.opendocument.presentation";

  public static final String OTP_MIMETYPE = "application/vnd.oasis.opendocument.presentation-template";

  public static final String XLS_MIMETYPE = "application/vnd.ms-excel";
  
  public static final String XLSX_MIMETYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  public static final String PPT_MIMETYPE = "application/vnd.ms-powerpoint";

  public static final String SUFFIX_ZIP = ".zip";
  
  public static final String PPTX_MIMETYPE = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  
  public static final String PNG_MIMETYPE = "image/png";
  
  public static final String TXT_MIMETYPE = "text/plain";

  /************************ Feature error ID *******************************/
  public static final String ERROR_UNKNOWN = "100";
  
  public static final String ERROR_FILE_IS_TOO_LARGE = "413";

  public static final String ERROR_INVALID_FILE_MIME_TYPE = "415";
  
  public static final String ERROR_INVALID_FILE_PASSWORD = "491";
  
  public static final String ERROR_UNSUPPORT_FILE_PASSWORD = "492";  
  
  public static final String ERROR_OUT_OF_QUEUE_SIZE = "493";
  
  public static final String ERROR_SYM_JOB_OVERTIME = "495";
  
  public static final String ERROR_SYM_CONNECTION_UNAVAILABLE = "496";
  
  public static final String ERROR_WORK_MANAGER_OVERTIME = "521";
  
  /**
   * Viewer errors
   */
  public static final String ERROR_IO_EXCEPTION = "522";

  public static final String ERROR_SINGLE_PAGE_OVERTIME = "523";
  
  public static final String ERROR_DOWNSIZE_ERROR = "524";

  public static final String ERROR_EMPTY_FILE_ERROR = "528";
  
  public static final String ERROR_CORRUPTED_FILE_ERROR = "529";
  
  public static final String ERROR_ILLEGAL_ARGUMENT = "497";
  
  public static final String WARNING_OLD_ODF_VERSION = "900";
  
  public static final String HTTP_RESPONSE_UNKNOWN_CONVERSION_ERROR = "520";
  
  public static final String SC_OK = "200";
  
  public static final String SC_ACCEPTED = "202";  
  

  /************************* Snapshot errors *******************************/

  /**
   * Exception code(1602) indicates that cannot access to the storage server(This is a general error for draft storage access exception).
   */
  public static final int SNAPSHOT_DRAFTSTORAGE_ACCESS_ERROR = 1602;

  /**
   * Exception code(1601) indicates that cannot access to the storage server(This is a general error for draft data access exception).
   */
  public static final int SNAPSHOT_DRAFTDATA_ACCESS_ERROR = 1601;

  /************************ End of Feature error ID *************************/
  
  public static final String CURRENT_CONVERTER_VERSION_DOCUMENT = "1.0.0";
  
  public static final String CURRENT_CONVERTER_VERSION_SPREADSHEET = "1.0.0";
  
  public static final String CURRENT_CONVERTER_VERSION_PRESENTATION = "1.0.0";

}
