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

import java.util.HashMap;
import java.util.Map;

public class FormatUtil
{
  public static final Map<String, String> MS_FORMATS = new HashMap<String, String>(0);
  
  public static final Map<String, String> ODF_FORMATS = new HashMap<String, String>(0);
  
  public static final Map<String, String> OTHER_FORMATS = new HashMap<String, String>(0);
  
  public static final Map<String, String> MS2ODF = new HashMap<String, String>(0);
  
  public static final Map<String, String> EXT2MIMETYPE = new HashMap<String, String>(10);

  static
  {
    MS_FORMATS.put("application/vnd.ms-excel", "xls");
    MS_FORMATS.put("application/msword", "doc");
    MS_FORMATS.put("application/vnd.ms-powerpoint", "ppt");
    MS_FORMATS.put("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx");
    MS_FORMATS.put("application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx");
    MS_FORMATS.put("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx");
    MS_FORMATS.put("application/vnd.openxmlformats-officedocument.wordprocessingml.template", "dotx");
    MS_FORMATS.put("application/vnd.openxmlformats-officedocument.presentationml.template", "potx");
    MS_FORMATS.put("application/vnd.openxmlformats-officedocument.spreadsheetml.template", "xltx");
    MS_FORMATS.put("application/vnd.ms-excel.sheet.macroenabled.12", "xlsm");
    MS_FORMATS.put("application/vnd.ms-excel.sheet.macroEnabled.12", "xlsm");
    MS_FORMATS.put("application/vnd.ms-excel.sheet.macroEnabled", "xlsm");
    
    ODF_FORMATS.put("application/vnd.oasis.opendocument.text", "odt");
    ODF_FORMATS.put("application/vnd.oasis.opendocument.text-template", "ott");
    ODF_FORMATS.put("application/vnd.oasis.opendocument.presentation", "odp");
    ODF_FORMATS.put("application/vnd.oasis.opendocument.presentation-template", "otp");
    ODF_FORMATS.put("application/vnd.oasis.opendocument.spreadsheet-template", "ots");
    ODF_FORMATS.put("application/vnd.oasis.opendocument.spreadsheet", "ods");
    
    OTHER_FORMATS.put("application/pdf", "pdf");
    
    MS2ODF.put("doc", "odt");
    MS2ODF.put("dot", "odt");
    MS2ODF.put("docx", "odt");
    MS2ODF.put("dotx", "odt");
    MS2ODF.put("xls", "ods");
    MS2ODF.put("xlt", "ods");
    MS2ODF.put("xlsx", "ods");
    MS2ODF.put("xlsm", "ods");
    MS2ODF.put("xltx", "ods");
    MS2ODF.put("ppt", "odp");
    MS2ODF.put("pot", "odp");
    MS2ODF.put("pptx", "odp");
    MS2ODF.put("potx", "odp");
    
    EXT2MIMETYPE.put("doc", "application/msword");
    EXT2MIMETYPE.put("dot", "application/msword");
    EXT2MIMETYPE.put("ppt", "application/vnd.ms-powerpoint");
    EXT2MIMETYPE.put("pot", "application/vnd.ms-powerpoint");
    EXT2MIMETYPE.put("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    EXT2MIMETYPE.put("dotx", "application/vnd.openxmlformats-officedocument.wordprocessingml.template");
    EXT2MIMETYPE.put("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    EXT2MIMETYPE.put("xltx", "application/vnd.openxmlformats-officedocument.spreadsheetml.template");
    EXT2MIMETYPE.put("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    EXT2MIMETYPE.put("potx", "application/vnd.openxmlformats-officedocument.presentationml.template");
    EXT2MIMETYPE.put("odt", "application/vnd.oasis.opendocument.text");
    EXT2MIMETYPE.put("ott", "application/vnd.oasis.opendocument.text-template");
    EXT2MIMETYPE.put("xls", "application/vnd.ms-excel");
    EXT2MIMETYPE.put("xlt", "application/vnd.ms-excel");
    EXT2MIMETYPE.put("ods", "application/vnd.oasis.opendocument.spreadsheet");
    EXT2MIMETYPE.put("ots", "application/vnd.oasis.opendocument.spreadsheet-template");
    EXT2MIMETYPE.put("odp", "application/vnd.oasis.opendocument.presentation");
    EXT2MIMETYPE.put("otp", "application/vnd.oasis.opendocument.presentation-template");
    EXT2MIMETYPE.put("pdf", "application/pdf");
    EXT2MIMETYPE.put("xlsm", "application/vnd.ms-excel.sheet.macroEnabled.12");
  }
}
