/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet;

public abstract class ServiceConstants
{

  public static final String XML_SHEET_ELEMENT_NAME = "sheet";

  public static final String XML_SHEET_ELEMENT_ATTRIBUTE_NAME = "name";

  public static final String XML_COL_ELEMENT_NAME = "col";

  public static final String XML_COL_ELEMENT_ATTRIBUTE_LETTER = "letter";

  public static final String XSD_LOCATION;

  public static final String XML_DOCUMENT_ELEMENT_ATTRIBUTE_URI = "uri";

  public static final String XML_DOCUMENT_ELEMENT_ATTRIBUTE_TYPE = "type";

  public static final String XML_DOCUMENT_ELEMENT_NAME = "document";

  public static final String XML_VALUE_ELEMENT_NAME = "value";

  public static final String XML_RAW_ELEMENT_NAME = "raw";

  public static final String XML_STATUS_ELEMENT_NAME = "status";

  public static final String XML_FORMAT_ELEMENT_NAME = "format";

  public static final String XML_ROW_ELEMENT_ATTRIBUTE_NUM = "num";

  public static final String XML_ROW_ELEMENT_NAME = "row";

  public final static String HTTP_OP_DELETE = "DELETE";

  public final static String HTTP_OP_PUT = "PUT";

  public final static String HTTP_OP_GET = "GET";

  public final static String HTTP_OP_POST = "POST";

  public final static String HTTP_OP_HEAD = "HEAD";

  public final static String REST_PARAM_SPREADSHEET_URI = "document";

  public final static String REST_PARAM_SPREADSHEET_SELECT_RESTRICTION = "restrict";

  public final static String REST_PARAM_SPREADSHEET_CALCULATED = "calculate";

  public static final String REST_PARAM_SPREADSHEET_APPEND_MODE = "append";

  public static final String SERVLET_CONTEXT_STORAGEFORMAT_CACHE_KEY = "com.ibm.mashups.colab.spreadsheet.storageformat.cache";

  public static final String SERVLET_CONTEXT_STORAGEFORMAT_PUBSUB_KEY = "com.ibm.mashups.colab.spreadsheet.storageformat.subscribers";

  public static final String ODS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet";
  
  public static final String OTS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet-template";

  public static final String XLS_MIMETYPE = "application/vnd.ms-excel";

  public static final String XLSX_MIMETYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  
  public static final String JSON_MIMETYPE = "application/json";
  
  public static final String PDF_MIMETYPE = "application/pdf";
  
  public static final String CSV_MIMETYPE = "text/csv";
  
  static
  {
    XSD_LOCATION = Properties.getProperty("xsd.location", "");
  }

}
