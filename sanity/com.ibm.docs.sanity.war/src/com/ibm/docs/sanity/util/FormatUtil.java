package com.ibm.docs.sanity.util;

import java.util.HashMap;
import java.util.Map;

public class FormatUtil
{
  public static final Map<String, String> MS_FORMATS = new HashMap<String, String>(12);

  public static final Map<String, String> MSOOXML_FORMATS = new HashMap<String, String>(3);

  public static final Map<String, String> ODF_FORMATS = new HashMap<String, String>(6);

  public static final Map<String, String> ODF_TEMPLATE_FORMATS = new HashMap<String, String>(6);

  public static final Map<String, String> MS2ODF = new HashMap<String, String>(6);

  public static final Map<String, String> ODF2MS = new HashMap<String, String>(3);

  public static final Map<String, String> ALL_FORMATS = new HashMap<String, String>(9);

  public static final StringBuffer ALL_EXTS = new StringBuffer();

  public static final Map<String, String> OOXML2MS = new HashMap<String, String>(3);

  public static final String TXT_MIMETYPE = "text/plain";

  public static final String CSV_MIMETYPE = "text/csv";

  static
  {
    MS_FORMATS.put("application/vnd.ms-excel", "xls");
    MS_FORMATS.put("application/msword", "doc");
    MS_FORMATS.put("application/vnd.ms-powerpoint", "ppt");
    MS_FORMATS.put("xls", "application/vnd.ms-excel");
    MS_FORMATS.put("doc", "application/msword");
    MS_FORMATS.put("ppt", "application/vnd.ms-powerpoint");
    MSOOXML_FORMATS.put("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx");
    MSOOXML_FORMATS.put("application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx");
    MSOOXML_FORMATS.put("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx");
    MSOOXML_FORMATS.put("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    MSOOXML_FORMATS.put("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    MSOOXML_FORMATS.put("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    MS_FORMATS.putAll(MSOOXML_FORMATS);

    ALL_EXTS.append(".doc,");
    ALL_EXTS.append(".ppt,");
    ALL_EXTS.append(".xls,");
    ALL_EXTS.append(".docx,");
    ALL_EXTS.append(".pptx,");
    ALL_EXTS.append(".xlsx,");

    ODF_FORMATS.put("application/vnd.oasis.opendocument.text", "odt");
    ODF_FORMATS.put("application/vnd.oasis.opendocument.spreadsheet", "ods");
    ODF_FORMATS.put("application/vnd.oasis.opendocument.presentation", "odp");
    ODF_FORMATS.put("odt", "application/vnd.oasis.opendocument.text");
    ODF_FORMATS.put("odp", "application/vnd.oasis.opendocument.presentation");
    ODF_FORMATS.put("ods", "application/vnd.oasis.opendocument.spreadsheet");

    ALL_EXTS.append(".odt,");
    ALL_EXTS.append(".odp,");
    ALL_EXTS.append(".ods,");

    ODF_TEMPLATE_FORMATS.put("application/vnd.oasis.opendocument.presentation-template", "otp");
    ODF_TEMPLATE_FORMATS.put("application/vnd.oasis.opendocument.spreadsheet-template", "ots");
    ODF_TEMPLATE_FORMATS.put("application/vnd.oasis.opendocument.text-template", "ott");
    ODF_TEMPLATE_FORMATS.put("ott", "application/vnd.oasis.opendocument.text-template");
    ODF_TEMPLATE_FORMATS.put("otp", "application/vnd.oasis.opendocument.presentation-template");
    ODF_TEMPLATE_FORMATS.put("ots", "application/vnd.oasis.opendocument.spreadsheet-template");

    ODF2MS.put("odt", "doc");
    ODF2MS.put("ods", "xls");
    ODF2MS.put("odp", "ppt");
    ODF2MS.put("ott", "doc");
    ODF2MS.put("ots", "xls");
    ODF2MS.put("otp", "ppt");

    OOXML2MS.put("docx", "doc");
    OOXML2MS.put("pptx", "ppt");
    OOXML2MS.put("xlsx", "xls");

    ALL_FORMATS.putAll(ODF_TEMPLATE_FORMATS);
    ALL_FORMATS.putAll(ODF_FORMATS);
    ALL_FORMATS.putAll(MS_FORMATS);
    ALL_FORMATS.put(TXT_MIMETYPE, "txt");
    ALL_FORMATS.put("txt", TXT_MIMETYPE);
    ALL_FORMATS.put(CSV_MIMETYPE, "csv");
    ALL_FORMATS.put("csv", CSV_MIMETYPE);

  }

}