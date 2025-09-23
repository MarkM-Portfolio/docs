/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.util;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.filetype.IMimeTypeDetector;
import com.ibm.symphony.conversion.service.common.filetype.MSOfficeOOXMLDetector;
import com.ibm.symphony.conversion.service.common.filetype.MimeTypeConstants;
import com.ibm.symphony.conversion.service.common.filetype.MimeTypeDetector;
import com.ibm.symphony.conversion.service.common.filetype.ODFDetector;
import com.ibm.symphony.conversion.service.common.filetype.ODFPwdDetector;
import com.ibm.symphony.conversion.service.common.filetype.OOXMLPwdDetector;

public class FileTypeUtil
{

  public static Map<String, String> ExtensionMimeMap = new HashMap<String, String>();
  static
  {
    ExtensionMimeMap.put("doc", MimeTypeConstants.DOC_MIMETYPE);
    ExtensionMimeMap.put("ppt", MimeTypeConstants.PPT_MIMETYPE);
    ExtensionMimeMap.put("xls", MimeTypeConstants.XLS_MIMETYPE);
    ExtensionMimeMap.put("dot", MimeTypeConstants.DOC_MIMETYPE);
    ExtensionMimeMap.put("pot", MimeTypeConstants.PPT_MIMETYPE);
    ExtensionMimeMap.put("xlt", MimeTypeConstants.XLS_MIMETYPE);
    ExtensionMimeMap.put("docx", MimeTypeConstants.DOCX_MIMETYPE);
    ExtensionMimeMap.put("pptx", MimeTypeConstants.PPTX_MIMETYPE);
    ExtensionMimeMap.put("xlsx", MimeTypeConstants.XLSX_MIMETYPE);
    ExtensionMimeMap.put("xlsm", MimeTypeConstants.XLSM_MIMETYPE);
    ExtensionMimeMap.put("dotx", MimeTypeConstants.DOTX_MIMETYPE);
    ExtensionMimeMap.put("potx", MimeTypeConstants.POTX_MIMETYPE);
    ExtensionMimeMap.put("xltx", MimeTypeConstants.XLTX_MIMETYPE);    
    ExtensionMimeMap.put("otp", MimeTypeConstants.OTP_MIMETYPE);
    ExtensionMimeMap.put("ots", MimeTypeConstants.OTS_MIMETYPE);
    ExtensionMimeMap.put("ott", MimeTypeConstants.OTT_MIMETYPE);
    ExtensionMimeMap.put("odt", MimeTypeConstants.ODT_MIMETYPE);
    ExtensionMimeMap.put("odp", MimeTypeConstants.ODP_MIMETYPE);
    ExtensionMimeMap.put("ods", MimeTypeConstants.ODS_MIMETYPE);
    ExtensionMimeMap.put("txt", MimeTypeConstants.TXT_MIMETYPE);
  }

  public static List<String> ODF_MIMETYPE_LIST = getMimeTypeList("ODF");

  public static List<String> OFFICE_MIMETYPE_LIST = getMimeTypeList("office");

  public static List<String> OFFICEXML_MIMETYPE_LIST = getMimeTypeList("officeXML");

  private static List<String> FROM_TEMPLATE_LIST = getMimeTypeList("template");

  private static Logger log = Logger.getLogger(FileTypeUtil.class.getName());

  public static String getFileMimeType(File sourceFile, String source_MIMETYPE)
  {
    log.finest("Start to find a correct file mime type. ");
    List<String> mimeTypeList = new ArrayList<String>();

    if (FileUtil.isZIPFile(sourceFile))
    {
      if (ODF_MIMETYPE_LIST.contains(source_MIMETYPE))
      {
        mimeTypeList.addAll(ODF_MIMETYPE_LIST);
        mimeTypeList.addAll(OFFICEXML_MIMETYPE_LIST);
      }
      else
      {
        mimeTypeList.addAll(OFFICEXML_MIMETYPE_LIST);
        mimeTypeList.addAll(ODF_MIMETYPE_LIST);
      }
    }
    else
    {
      mimeTypeList.addAll(OFFICE_MIMETYPE_LIST);
    }
    mimeTypeList.remove(source_MIMETYPE);
    for (String mimeType : mimeTypeList)
    {
      if (isCorrectFileType(sourceFile, mimeType, null))
      {
        log.finest("Find the correct file mime type. " + mimeType);
        return mimeType;
      }
    }

    log.finest("Faile to find the correct file mime type. ");
    return null;
  }

  public static String getODFDraftMimeType(File sourceFile, String source_MIMETYPE)
  {
    log.finest("Start to find a correct file mime type. ");

    String realMimeType = null;

    if (!sourceFile.exists())
    {
      String type = getEditorType(source_MIMETYPE);
      if (type.equals("document"))
        return MimeTypeConstants.ODT_MIMETYPE;
      else if (type.equals("presentation"))
        return MimeTypeConstants.ODP_MIMETYPE;
      else
        return MimeTypeConstants.ODS_MIMETYPE;
    }
    if (ODF_MIMETYPE_LIST.contains(source_MIMETYPE))
    {
      realMimeType = source_MIMETYPE;
    }
    else
    {
      if (FileUtil.isZIPFile(sourceFile))
      {
        IMimeTypeDetector detector = MimeTypeDetector.getInstance().getDetector("ODF");
        for (String mimeType : ODF_MIMETYPE_LIST)
        {
          if (isCorrectFileType(sourceFile, mimeType, detector))
          {
            log.finest("Find the correct file mime type. " + mimeType);
            realMimeType = mimeType;
            break;
          }
        }
      }
    }
    if (realMimeType != null && ODFDetector.ODFTemplateMap.containsKey(realMimeType))
      realMimeType = ODFDetector.ODFTemplateMap.get(realMimeType);

    return realMimeType;
  }

  public static String getEditorType(String sourceMIMEType)
  {
    String type = null;
    if (sourceMIMEType.equals(MimeTypeConstants.ODT_MIMETYPE) || sourceMIMEType.equals(MimeTypeConstants.OTT_MIMETYPE)
        || sourceMIMEType.equals(MimeTypeConstants.DOCX_MIMETYPE) || sourceMIMEType.equals(MimeTypeConstants.DOTX_MIMETYPE)
        || sourceMIMEType.equals(MimeTypeConstants.DOC_MIMETYPE)
        || sourceMIMEType.equals(MimeTypeConstants.TXT_MIMETYPE))
      type = "document";
    else if (sourceMIMEType.equals(MimeTypeConstants.ODP_MIMETYPE) || sourceMIMEType.equals(MimeTypeConstants.OTP_MIMETYPE)
        || sourceMIMEType.equals(MimeTypeConstants.PPTX_MIMETYPE) || sourceMIMEType.equals(MimeTypeConstants.POTX_MIMETYPE)
        || sourceMIMEType.equals(MimeTypeConstants.PPT_MIMETYPE))
      type = "presentation";
    else if (sourceMIMEType.equals(MimeTypeConstants.ODS_MIMETYPE) || sourceMIMEType.equals(MimeTypeConstants.OTS_MIMETYPE)
        || sourceMIMEType.equals(MimeTypeConstants.XLSX_MIMETYPE) || sourceMIMEType.equals(MimeTypeConstants.XLTX_MIMETYPE)
        || sourceMIMEType.equals(MimeTypeConstants.XLS_MIMETYPE) || sourceMIMEType.equals(MimeTypeConstants.XLSM_MIMETYPE)
        || sourceMIMEType.equals(MimeTypeConstants.XLSM_12_MIMETYPE) )
      type = "spreadsheet";

    return type;
  }

  /**
   * Check if the file Type is correct.
   * 
   * @param sourceFile
   * @param source_MIMETYPE
   * @param fromTemplate
   * 
   * @throws IOException
   */
  public static boolean isCorrectFileType(File sourceFile, String source_MIMETYPE, Map paras, File targetFolder)
  {
    log.finest("File Type Detector: " + source_MIMETYPE + "  " + sourceFile.getAbsolutePath() + "  " + paras);
    if (!NFSFileUtil.nfs_assertExistsFile(sourceFile, NFSFileUtil.NFS_RETRY_SECONDS))
    {
      log.warning("Can not find the file specified: " + sourceFile.getAbsolutePath());
      return false;
    }
    
    boolean isCorrectType = true;

    IMimeTypeDetector detector = getDetector(source_MIMETYPE);
    if (detector == null)
      return true;

    if (paras != null && paras.containsKey("isFromTemplate") && (Boolean) paras.get("isFromTemplate"))
    {
      if (FROM_TEMPLATE_LIST.contains(source_MIMETYPE))
      {
        isCorrectType = isCorrectFileType(sourceFile, source_MIMETYPE, detector);
        if (isCorrectType)
        {
          detector.updateTemplateMimeType(sourceFile, source_MIMETYPE, targetFolder, paras);
        }
//comment if odt--ott
//        else
//        {
//          if(ODFDetector.ODFTemplateMap.containsKey(source_MIMETYPE))
//            isCorrectType = isCorrectFileType(sourceFile, ODFDetector.ODFTemplateMap.get(source_MIMETYPE), detector);
//          else if(MSOfficeOOXMLDetector.OOXMLTemplateMap.containsKey(source_MIMETYPE))
//            isCorrectType = isCorrectFileType(sourceFile, ODFDetector.ODFTemplateMap.get(source_MIMETYPE), detector);
//          
//          if(isCorrectType)
//            detector.updateTemplateMimeType(sourceFile, source_MIMETYPE, targetFolder, paras);
//        }
        //comment if doc-odt
        // else
        // {
        // String realMimeType = getFileMimeType(sourceFile, source_MIMETYPE);
        // if (ODF_MIMETYPE_LIST.contains(realMimeType) || OFFICE_MIMETYPE_LIST.contains(realMimeType))
        // {
        // if (!MimeTypeDetector.MimeTypeGroup.get(source_MIMETYPE).equals(MimeTypeDetector.MimeTypeGroup.get(realMimeType)))
        // detector = getDetector(realMimeType);
        //
        // detector.updateTemplateMimeType(sourceFile, realMimeType, targetFolder, paras);
        // isCorrectType = true;
        // }
        // }
      }
      else
        isCorrectType = false;
    }
    else
      isCorrectType = isCorrectFileType(sourceFile, source_MIMETYPE, detector);

    log.finest("Result of File Type Detector: " + isCorrectType);

    return isCorrectType;
  }

  /**
   * Check if the Odf File is password protected.
   * 
   * @param sourceFile
   * 
   * @throws IOException
   */
  public static boolean isPwdProtectedOdf(File sourceFile)
  {
    return ODFPwdDetector.isPwdProtected(sourceFile);
  }

  /**
   * Check if the OOXML File is password protected.
   * 
   * @param sourceFile
   * 
   * @throws IOException
   */
  public static boolean isPwdProtectedOOXML(File sourceFile)
  {
    return OOXMLPwdDetector.isPwdProtected(sourceFile);
  }

  /**
   * Check if the file Type is correct.
   * 
   * @param sourceFile
   * @param source_MIMETYPE
   * @param detector
   * @throws IOException
   */
  public static boolean isCorrectFileType(File sourceFile, String source_MIMETYPE, IMimeTypeDetector detector)
  {
    log.finest("File Type Detector: " + source_MIMETYPE + "  " + sourceFile.getAbsolutePath());

    boolean isCorrectType = true;

    String detectorKey = MimeTypeDetector.MimeTypeGroup.get(source_MIMETYPE);
    if (detectorKey != null)
    {
      Map<String, String> options = new HashMap<String, String>();
      if (detectorKey.equals(MimeTypeDetector.MimeTypeGroup_ODF))
        options.put("mainFile", "content.xml");
      else if (detectorKey.equals(MimeTypeDetector.MimeTypeGroup_OFFICEXML))
      {
        if (source_MIMETYPE.equals(MimeTypeConstants.DOCX_MIMETYPE) || source_MIMETYPE.equals(MimeTypeConstants.DOTX_MIMETYPE))
          options.put("mainFile", "word/document.xml");
        else if (source_MIMETYPE.equals(MimeTypeConstants.XLSX_MIMETYPE) || 
                 source_MIMETYPE.equals(MimeTypeConstants.XLTX_MIMETYPE ) ||
                 source_MIMETYPE.equals(MimeTypeConstants.XLSM_12_MIMETYPE) ||
                 source_MIMETYPE.equals(MimeTypeConstants.XLSM_MIMETYPE) )
          options.put("mainFile", "xl/workbook.xml");
        else if (source_MIMETYPE.equals(MimeTypeConstants.PPTX_MIMETYPE) || source_MIMETYPE.equals(MimeTypeConstants.POTX_MIMETYPE))
          options.put("mainFile", "ppt/presentation.xml");
      }
      if (detector == null)
        detector = MimeTypeDetector.getInstance().getDetector(detectorKey);

      isCorrectType = detector.isCorrectMimeType(sourceFile, source_MIMETYPE, options);
    }
    log.finest("Result of File Type Detector: " + isCorrectType);

    return isCorrectType;
  }

  private static IMimeTypeDetector getDetector(String source_MIMETYPE)
  {
    String detectorKey = MimeTypeDetector.MimeTypeGroup.get(source_MIMETYPE);
    if (detectorKey == null)
      return null;
    return MimeTypeDetector.getInstance().getDetector(detectorKey);
  }

  private static List<String> getMimeTypeList(String type)
  {
    List<String> mimeTypeList = new ArrayList<String>();
    if (type.equals("ODF"))
    {
      mimeTypeList.add(MimeTypeConstants.ODP_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.ODS_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.ODT_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.OTP_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.OTS_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.OTT_MIMETYPE);
    }
    else if (type.equals("office"))
    {
      mimeTypeList.add(MimeTypeConstants.PPT_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.DOC_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.XLS_MIMETYPE);
    }
    else if (type.equals("officeXML"))
    {
      mimeTypeList.add(MimeTypeConstants.XLSX_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.PPTX_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.DOCX_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.POTX_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.DOTX_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.XLTX_MIMETYPE);      
      mimeTypeList.add(MimeTypeConstants.XLSM_12_MIMETYPE);      
      mimeTypeList.add(MimeTypeConstants.XLSM_MIMETYPE);      
    }
    else if (type.equals("template"))
    {
      mimeTypeList.add(MimeTypeConstants.OTP_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.OTS_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.OTT_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.PPT_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.DOC_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.XLS_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.POTX_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.DOTX_MIMETYPE);
      mimeTypeList.add(MimeTypeConstants.XLTX_MIMETYPE);      
    }
    return mimeTypeList;
  }

  public static String getMimeType(String fileName, Map parameters)
  {
    if (parameters != null && parameters.containsKey("sourceMIMEType"))
    {
      return (String) parameters.get("sourceMIMEType");
    }

    String fileExtentsion = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length());
    fileExtentsion = fileExtentsion.toLowerCase();
    return ExtensionMimeMap.get(fileExtentsion);
  }

  public static void main(String[] args) throws Exception
  {
    File dir = new File("F:\\Tmp\\Concord\\docTypeTest\\1");
    File[] files = dir.listFiles();
    System.out.println(files.length);

    int i = 0;
    for (File file : files)
    {
      String source_MIMETYPE = getMimeType(file.getName(), null);
      i++;
      String mimeType = source_MIMETYPE;
      boolean isCorrectMimeType = true;
      boolean fromTemplate = false;
      long start = System.currentTimeMillis();
      System.out.println("File name: " + file.getName());
      File targetDir = new File(file.getParent(), "t_" + file.getName());

      JSONObject obj = new JSONObject();
      if (fromTemplate)
        obj.put("isFromTemplate", fromTemplate);

      isCorrectMimeType = isCorrectFileType(file, source_MIMETYPE, obj, targetDir);
      if (!isCorrectMimeType)
      {
        mimeType = getFileMimeType(file, source_MIMETYPE);
        System.out.println("New File type: " + mimeType);
      }

      System.out.println("is correct? " + isCorrectMimeType + " " + fromTemplate);

      if (fromTemplate)
      {
        System.out.println("Template New File path: " + obj.get("filePath"));
      }
      else
      {
        if (ODF_MIMETYPE_LIST.contains(mimeType))
        {
          isCorrectMimeType = isPwdProtectedOdf(file);
          System.out.println("is password protected? " + isCorrectMimeType);
        }
        else if(mimeType == null && OFFICEXML_MIMETYPE_LIST.contains(source_MIMETYPE))
        {
          isCorrectMimeType = isPwdProtectedOOXML(file);
          System.out.println("is office password protected? " + isCorrectMimeType);
        }
      }

      long end = System.currentTimeMillis();
      System.out.println("done in:" + (end - start));
      System.out.println();
    }
  }

}
