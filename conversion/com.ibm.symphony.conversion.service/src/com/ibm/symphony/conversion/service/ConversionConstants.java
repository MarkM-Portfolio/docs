/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service;

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
  
  public static final String SVM_MIMETYPE = "image/svm";
  
  public static final String TXT_MIMETYPE = "text/plain";
  
  public static final String RTF_MIMETYPE = "application/rtf";

  /************************ Feature error ID *******************************/
  public static final String ERROR_UNKNOWN = "100";
  
  public static final String ERROR_CONTAIN_SVM_FILE = "411";
  
  public static final String ERROR_FILE_IS_TOO_LARGE = "413";

  public static final String ERROR_INVALID_FILE_MIME_TYPE = "415";
  
  public static final String ERROR_INVALID_FILE_PASSWORD = "491";
  
  public static final String ERROR_UNSUPPORT_FILE_PASSWORD = "492";  
  
  public static final String ERROR_OUT_OF_QUEUE_SIZE = "493";
  
  public static final String ERROR_SYM_JOB_OVERTIME = "495";
  
  public static final String ERROR_SYM_CONNECTION_UNAVAILABLE = "496";
  
  public static final String ERROR_ILLEGAL_ARGUMENT = "497";
  
  public static final String ERROR_WORK_MANAGER_OVERTIME = "521";
  
  public static final String ERROR_IO_EXCEPTION = "522";

  public static final String ERROR_SINGLE_PAGE_OVERTIME = "523";
  
  public static final String ERROR_DOWNSIZE_ERROR = "524";
  
  public static final String ERROR_NFS_IO_EXCEPTION = "525";
  
  public static final String STATUS_MIME_TYPE_MODIFIED = "526";
  
  public static final String ERROR_CONVERSION_LIB = "527";
  
  public static final String ERROR_EMPTY_FILE_ERROR = "528";
  
  public static final String ERROR_CORRUPTED_FILE_ERROR = "529";
  
  public static final String ERROR_SPREADSHEET_FILE_SIZE = "530";

  public static final String ERROR_SPREADSHEET_CELL_NUMBER = "531";

  public static final String ERROR_SPREADSHEET_ROW_NUMBER = "532";

  public static final String ERROR_SPREADSHEET_COLUMN_NUMBER = "533";

  public static final String ERROR_SPREADSHEET_FORMULA_NUMBER = "534";
  
  public static final String ERROR_DOCUMENT_EXCEED_PAGE_COUNT = "535";
  
  public static final String ERROR_DOCUMENT_EXCEED_PAGE_CHARACTER = "536";
  
  public static final String ERROR_PRESENTATION_SLIDE_NUMBER = "537";
  
  public static final String ERROR_PRESENTATION_OBJECT_NUMBER = "538";
  
  public static final String ERROR_PRESENTATION_SYM_TOOLARGE = "539";

  public static final String WARNING_OLD_ODF_VERSION = "900";

  /************************ End of Feature error ID *************************/
  
  public static final String CURRENT_CONVERTER_VERSION_DOCUMENT = "1.2.0";
  
  public static final String CURRENT_CONVERTER_VERSION_SPREADSHEET = "1.3.0";
  
  public static final String CURRENT_CONVERTER_VERSION_PRESENTATION = "1.1.1";

  public static final String CONVERTER_VERSION_PRESENTATION_110 = "1.1.0";

}
