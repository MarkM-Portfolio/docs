package com.ibm.concord.log;

public class ConcordErrorCode
{
  
  //WAS configuration error,like missing shared date folder variable
  public static final int WAS_CONFIG_ERROR = 1001;
  
  //Docs configuration file(concord-config.json) error,like the file not exists
  public static final int CONFIG_FILE_ERROR = 1002;
  
  //Database operation error
  public static final int DATABASE_OPERATION_ERROR = 1003;
  
  //Errors when apply XHTML message
  public static final int APPLY_XHTML_MESSAGE_ERROR = 1004;
  
  //Errors when get current state XHTML
  public static final int GET_CURRENT_STATE_XHTML_ERROR = 1005;
  
  //Errors when publish a new version document
  public static final int PUBLISH_ERROR = 1006;
  
  //Errors when save document as
  public static final int SAVE_AS_ERROR = 1007;
  
  //Errors when copy draft to directory
  public static final int COPY_DRAFT_TO_DIR_ERROR = 1008;
  
  //Errors when create document
  public static final int CREATE_DOCUMENT_ERROR = 1009;
  
  //Errors when import document
  public static final int IMPORT_DOCUMENT_ERROR = 1010;
  
  //Errors when convert document
  public static final int CONVERT_ERROR = 1011;
  
  //Errors when convert with concord folder
  public static final int CONVERT_WITH_FOLDER_ERROR = 1012;

  //Errors when get real mime type 
  public static final int GET_REAL_MIMETYPE_ERROR = 1013;

  //Errors when create documents with template
  public static final int CREATE_DOCUMENT_WITH_TEMPLATE_ERROR = 1014;

  //Errors when filter community registration cookie
  public static final int COMMUNITY_REGISTRATION_COOKIE_ERROR = 1015;

  //Errors when filter authentication component
  public static final int FILTER_AUTH_COMPONENT_ERROR = 1016;

  //Errors when get s2s call token
  public static final int S2S_CALL_CONFIG_ERROR = 1017;

  //Errors when cancel task
  public static final int CANCEL_TASK_ERROR = 1018;

  //Errors when convert request 
  public static final int CONVERT_REQUEST_ERROR = 1019;

  //Errors when get result task
  public static final int GET_RESULT_TASK_ERROR = 1020;

  //Errors when init directory component
  public static final int INIT_DIR_COMPONENT_ERROR = 1021;

  //Errors when init repository component
  public static final int INIT_REPO_COMPONENT_ERROR = 1022;

  //Errors when init version information
  public static final int INIT_VERSION_ERROR = 1023;

  //Errors when touch status file
  public static final int TOUCH_STATUS_FILE_ERROR = 1024;

  //Errors when presentation get section
  public static final int PRES_GET_SECTION_ERROR = 1025;

  //Errors when create presentation template
  public static final int PRES_CREATE_TEMPLATE_ERROR = 1026;

  //Errors when get partial content of document
  public static final int GET_PARTIAL_DOC_ERROR = 1027;

  //Errors when submit document
  public static final int DO_SUBMIT_ERROR = 1028;

  //Errors when upload multiple files
  public static final int MULTIFILE_UPLOAD_ERROR = 1029;

  //Errors when upload single file
  public static final int SINGLE_FILE_UPLOAD_ERROR = 1030;

  //Errors when upload
  public static final int UPLOAD_ERROR = 1031;

  //Errors when process Docs servlet
  public static final int DOCS_SERVLET_ERROR = 1032;

  //Errors when serve edit attachment
  public static final int SERVE_EDIT_ATTACHMENT_ERROR = 1033;

  //Errors when serve view attachment
  public static final int SERVE_VIEW_ATTACHMENT_ERROR = 1034;

  //Errors when serve spreadsheet
  public static final int SERVE_SPREADSHEET_ERROR = 1035;

  //Errors when filter entitlement
  public static final int FILTER_ENTITLEMENT_ERROR = 1036;

  //Errors when process rtc4web
  public static final int RTC4WEB_ERROR = 1037;

  //Errors when process text document service
  public static final int TEXT_DOCUMENT_SERVICE_ERROR = 1038;
  
  //Errors when database connections has issues
  public static final int DATABASE_INIT_ERROR = 1039;
  
  //Errors when get database connections
  public static final int DATABASE_CONNECTION_ERROR = 1040; 
  
  //Errors when get database connections
  public static final int WORKMANAGER_INIT_ERROR = 1041;
  
  //Errors when initializing housekeeping
  public static final int HUOSEKEEPING_INIT_ERROR = 1042;
  
  //Errors when init email notice component
  public static final int INIT_EMAIL_COMPONENT_ERROR = 1043;
  
  //Errors when init journal component
  public static final int INIT_JOURNAL_COMPONENT_ERROR = 1044;
}
