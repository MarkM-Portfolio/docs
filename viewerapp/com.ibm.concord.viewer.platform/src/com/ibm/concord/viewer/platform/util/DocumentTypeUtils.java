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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.ibm.concord.viewer.config.HTMLViewConfig;

public class DocumentTypeUtils
{
  public static final String ODP_MIMETYPE = "application/vnd.oasis.opendocument.presentation";

  public static final String ODS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet";

  public static final String ODT_MIMETYPE = "application/vnd.oasis.opendocument.text";
  
  public static final String OTP_MIMETYPE = "application/vnd.oasis.opendocument.presentation-template";

  public static final String OTS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet-template";

  public static final String OTT_MIMETYPE = "application/vnd.oasis.opendocument.text-template";

  public static final String PPT_MIMETYPE = "application/vnd.ms-powerpoint";

  public static final String DOC_MIMETYPE = "application/msword";

  public static final String XLS_MIMETYPE = "application/vnd.ms-excel";

  public static final String PPTX_MIMETYPE = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  
  public static final String POTX_MIMETYPE = "application/vnd.openxmlformats-officedocument.presentationml.template";

  public static final String DOCX_MIMETYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  
  public static final String DOTX_MIMETYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.template";

  public static final String RTF_MIMETYPE = "application/rtf";

  public static final String TXT_MIMETYPE = "text/plain";

  public static final String XLSX_MIMETYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  
  public static final String XLTX_MIMETYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.template";

  public static final String XLSM_MIMETYPE_STANDARD = "application/vnd.ms-excel.sheet.macroEnabled.12";
  
  public static final String XLSM_MIMETYPE = "application/vnd.ms-excel.sheet.macroenabled.12";

  public static final String XLSM_MIMETYPE_2010 = "application/vnd.ms-excel.sheet.macroEnabled";

  public static final String PDF_MIMETYPE = "application/pdf";

  public static final String JPEG_EXT = "jpeg";

  public static final String JPG_EXT = "jpg";

  public static final String BMP_EXT = "bmp";

  public static final String PNG_EXT = "png";

  public static final String GIF_EXT = "gif";

  public static final String TIF_EXT = "tiff";

  private static HashMap<String, Object> mimeToExtention = new HashMap<String, Object>();

  private static HashMap<String, String> odf2MsMap = new HashMap<String, String>();

  private static HashMap<String, String> odfMap = new HashMap<String, String>();

  private static HashMap<String, String> stellentMap = new HashMap<String, String>();

  private static HashMap<String, String> imageMap = new HashMap<String, String>();
  
  private static List<String> viewOnlyDocTypes = new ArrayList<String>();
  
  private static List<String> viewOnlyDocTypesWithExt = new ArrayList<String>();

  public static final String PRESENTATION = "pres";

  public static final String TEXT = "text";

  public static final String SPREADSHEET = "sheet";

  public static final String PDF = "pdf";

  public static final String IMAGE = "image";

  static
  {
    mimeToExtention.put("odp", ODP_MIMETYPE);
    mimeToExtention.put("otp", OTP_MIMETYPE);
    mimeToExtention.put("ods", ODS_MIMETYPE);
    mimeToExtention.put("ots", OTS_MIMETYPE);
    mimeToExtention.put("odt", ODT_MIMETYPE);
    mimeToExtention.put("ott", OTT_MIMETYPE);
    mimeToExtention.put("ppt", PPT_MIMETYPE);
    mimeToExtention.put("xls", XLS_MIMETYPE);
    mimeToExtention.put("doc", DOC_MIMETYPE);
    mimeToExtention.put("pot", PPT_MIMETYPE);
    mimeToExtention.put("xlt", XLS_MIMETYPE);
    mimeToExtention.put("dot", DOC_MIMETYPE);
    mimeToExtention.put("pptx", PPTX_MIMETYPE);
    mimeToExtention.put("potx", POTX_MIMETYPE);
    mimeToExtention.put("xlsx", XLSX_MIMETYPE);
    mimeToExtention.put("xltx", XLTX_MIMETYPE);
    mimeToExtention.put("docx", DOCX_MIMETYPE);
    mimeToExtention.put("dotx", DOTX_MIMETYPE);
    mimeToExtention.put("xlsm", XLSM_MIMETYPE);
    mimeToExtention.put("rtf", RTF_MIMETYPE);
    mimeToExtention.put("txt", TXT_MIMETYPE);

    odf2MsMap.put(ODS_MIMETYPE, XLS_MIMETYPE);
    odf2MsMap.put(ODT_MIMETYPE, DOC_MIMETYPE);
    odf2MsMap.put(ODP_MIMETYPE, PPT_MIMETYPE);
    odf2MsMap.put(OTS_MIMETYPE, XLS_MIMETYPE);
    odf2MsMap.put(OTT_MIMETYPE, DOC_MIMETYPE);
    odf2MsMap.put(OTP_MIMETYPE, PPT_MIMETYPE);

    odfMap.put(ODS_MIMETYPE, "ods");
    odfMap.put(OTS_MIMETYPE, "ots");
    odfMap.put(ODT_MIMETYPE, "odt");
    odfMap.put(OTT_MIMETYPE, "ott");
    odfMap.put(ODP_MIMETYPE, "odp");
    odfMap.put(OTP_MIMETYPE, "otp");

    stellentMap.put(DOC_MIMETYPE, TEXT);
    stellentMap.put(DOCX_MIMETYPE, TEXT);
    stellentMap.put(ODT_MIMETYPE, TEXT);
    //stellentMap.put(DOT_MIMETYPE, TEXT);
    stellentMap.put(OTT_MIMETYPE, TEXT);
    stellentMap.put(DOTX_MIMETYPE, TEXT);

    stellentMap.put(PPT_MIMETYPE, PRESENTATION);
    stellentMap.put(PPTX_MIMETYPE, PRESENTATION);
    stellentMap.put(ODP_MIMETYPE, PRESENTATION);
    //stellentMap.put(POT_MIMETYPE, PRESENTATION);
    stellentMap.put(POTX_MIMETYPE, PRESENTATION);
    stellentMap.put(OTP_MIMETYPE, PRESENTATION);

    stellentMap.put(XLS_MIMETYPE, SPREADSHEET);
    stellentMap.put(XLSX_MIMETYPE, SPREADSHEET);
    stellentMap.put(ODS_MIMETYPE, SPREADSHEET);
    stellentMap.put(XLSM_MIMETYPE, SPREADSHEET);
    stellentMap.put(XLSM_MIMETYPE_STANDARD, SPREADSHEET);
    stellentMap.put(XLSM_MIMETYPE_2010, SPREADSHEET);
    //stellentMap.put(XLT_MIMETYPE, SPREADSHEET);
    stellentMap.put(XLTX_MIMETYPE, SPREADSHEET);
    stellentMap.put(OTS_MIMETYPE, SPREADSHEET);

    stellentMap.put(PDF_MIMETYPE, PDF);
    stellentMap.put(RTF_MIMETYPE, TEXT);
    stellentMap.put(TXT_MIMETYPE, TEXT);

    imageMap.put(JPEG_EXT, IMAGE);
    imageMap.put(JPG_EXT, IMAGE);
    imageMap.put(BMP_EXT, IMAGE);
    imageMap.put(PNG_EXT, IMAGE);
    imageMap.put(GIF_EXT, IMAGE);
    imageMap.put(TIF_EXT, IMAGE);
    
    viewOnlyDocTypes.add(DOTX_MIMETYPE);
    viewOnlyDocTypes.add(POTX_MIMETYPE);
    viewOnlyDocTypes.add(XLTX_MIMETYPE);
    viewOnlyDocTypes.add(OTT_MIMETYPE);
    viewOnlyDocTypes.add(OTP_MIMETYPE);
    viewOnlyDocTypes.add(OTS_MIMETYPE);
    viewOnlyDocTypes.add(RTF_MIMETYPE);
    viewOnlyDocTypes.add(TXT_MIMETYPE);
    viewOnlyDocTypesWithExt.add(DOC_MIMETYPE+"dot");
    viewOnlyDocTypesWithExt.add(PPT_MIMETYPE+"pot");
    viewOnlyDocTypesWithExt.add(XLS_MIMETYPE+"xlt");
  }

  public static String getStellentType(String mimeType)
  {
    return stellentMap.get(mimeType);
  }

  public static String getMimeType(String ext)
  {
    return (String) mimeToExtention.get(ext);
  }

  public static boolean isODF(String mimeType)
  {
    return odfMap.get(mimeType) != null ? true : false;
  }

  public static String getMSType(String odfMimeType)
  {
    String mimeType = odf2MsMap.get(odfMimeType);
    if (mimeType == null)
      mimeType = odfMimeType;
    return mimeType;
  }

  public static boolean isPDF(String type)
  {
    return PDF.equalsIgnoreCase(getStellentType(type));
  }

  public static boolean isText(String type)
  {
    return TEXT.equalsIgnoreCase(getStellentType(type));
  }

  public static boolean isPres(String type)
  {
    return PRESENTATION.equalsIgnoreCase(getStellentType(type));
  }

  public static boolean isSpreadSheet(String type)
  {
    return SPREADSHEET.equalsIgnoreCase(getStellentType(type));
  }

  public static boolean isHTML(String mime, String repoId)
  {
    String appType = getStellentType(mime);
    String[] exclude = HTMLViewConfig.getExcludes();
    for (String str : exclude)
    {
      String[] tokens = str.split(":");
      String repositories = null;
      String type = tokens[0];
      if (tokens.length > 1)
      {
        repositories = tokens[1];
      }
      if (repositories == null || repositories.contains(repoId))
      {
        if (type.equalsIgnoreCase(appType) || type.equalsIgnoreCase(mime))
        {
          return false;
        }
      }
    }
    return HTMLViewConfig.isEnable();
  }

  public static boolean isImage(String type)
  {
    return IMAGE.equalsIgnoreCase(imageMap.get(type.toLowerCase()));
  }
  
  public static boolean isViewOnly(String mimetype, String ext)
  {
    boolean viewonly = false;
    if (mimetype != null) {
      if (DocumentTypeUtils.viewOnlyDocTypes.contains(mimetype))
      {
        viewonly = true;
      } else if (ext != null) {
        String checkstr = mimetype;
        if (DocumentTypeUtils.viewOnlyDocTypesWithExt.contains(mimetype+ext))
        {
          viewonly = true;
        }
      }
    }
    return viewonly;
  }

}
