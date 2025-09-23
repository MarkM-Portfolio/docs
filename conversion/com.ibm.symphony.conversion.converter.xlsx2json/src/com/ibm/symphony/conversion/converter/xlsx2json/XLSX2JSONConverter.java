/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.xlsx2json;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.codehaus.jackson.JsonParseException;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.conversionlib.ConversionLibManager;
import com.ibm.symphony.conversion.converter.sym.SymConversionResult;
import com.ibm.symphony.conversion.converter.sym.impl.SymphonyConverterImpl;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.common.util.NFSFileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.JSONWriter;

public class XLSX2JSONConverter extends AbstractFormatConverter
{
  private static Logger log = Logger.getLogger(XLSX2JSONConverter.class.getName());

  private final static String configFileName = "feature_map.json";
  
  private final static String XLSX_MIMETYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  
  private static final String JSON_MIMETYPE = "application/json";

  private static final String FILE_RESERVE = "Reserved";
  
  private static JSONObject featureMap = null;
  
  static
  {
    InputStream in = null;
    try
    {
      in = XLSX2JSONConverter.class.getResourceAsStream(configFileName);
      if (in != null)
      {
        JSONObject features = JSONObject.parse(in);
        featureMap = (JSONObject) features.get("featuresId");
      }
    }
    catch (IOException e)
    {
    }
    finally
    {
      if (in != null)
        try
        {
          in.close();
        }
        catch (IOException e)
        {
        }
    }
  }

  private ConversionResult convert(File sourceFile, File targetFolder, Map parameters, boolean isZip) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", sourceFile.getPath());
    long start = System.currentTimeMillis();
    ConversionLogger.log(log, Level.INFO, "XLSX2JSONConverter start");

    ConversionResult result = null;
    if (parameters != null && Boolean.valueOf((String) parameters.get("upgradeVersion")))
    {
      //when upgrade, sourceFile must be the folder which contains the old version json files and odfDraft
      //rather than the path of the ods file
      result = upgrade(sourceFile, targetFolder, parameters);
    }
    else
    {
      if (ConversionLibManager.getInstance().isConvLibEnabled())
      {
        
        if (parameters != null && parameters.containsKey("firstImport"))
        {
          // bOnlyImport means that there is no edit change for document draft, so we can simply import ods again
          boolean bFirstImport = Boolean.parseBoolean((String)  parameters.get("firstImport"));
          if (bFirstImport)
          {
            // Do not import ACL if it is first import
            parameters.put("ACLRanges", "false");
          }
        }
        result = convertByConvLib(sourceFile, targetFolder, parameters);
      }
      else
      {
        result = convertBySymphony(sourceFile, targetFolder, parameters, start);
      }
    }

    long end = System.currentTimeMillis();
    ConversionLogger.log(log, Level.INFO, "XLSX2JSONConverter cost time: " + Long.toString(end - start) + "ms");

    // zip target content folder
    if (isZip)
    {
      File convertedFile = result.getConvertedFile();
      File convertedFolder = convertedFile.getParentFile();
      File targetFile = new File(convertedFolder.getParent(), convertedFolder.getName() + ConversionConstants.SUFFIX_ZIP);
      try
      {
        FileUtil.zipFolder(convertedFolder, targetFile);
      }
      catch (IOException e)
      {
        ConversionLogger.log(log, Level.WARNING, "IOException when zip target files!");
      }
      result.setConvertedFile(targetFile);
    }
    return result;
  }

  private ConversionResult upgrade(File sourceFolder, File targetFolder, Map parameters)
  {
    long start = System.currentTimeMillis();
    ConversionResult result = null;
    String draftName = "ooxmldraft";
    File ooxmlFile = new File(sourceFolder, draftName);
    //49641 all draft need upgrade now, if version is less than 1.3.0
    boolean needUpgrade = ooxmlFile.exists();
    if (needUpgrade == false)
    {
      String draftversion = NFSFileUtil.readDraftFormatVersion(sourceFolder);
      needUpgrade = ( draftversion==null || 
                      ConversionUtil.compareVersion(draftversion, "1.3.0") < 0 );
    }
    if (needUpgrade && ConversionLibManager.getInstance().isConvLibEnabled())
    {
      File tmpFolder = getTempFolder();
      File sourceTmpFolder = getTempFolder();
      String xlsxFile = sourceFolder + File.separator + draftName;
      // first copy the "ooxmldraft" to tmpFolder incase the ooxmldraft has been deleted when json2ods failed
      // even it is not failed, "ooxmldraft" can be overwritten with the new converted one from xlsx2json
      NFSFileUtil.nfs_copyDirToDir(sourceFolder, sourceTmpFolder, NFSFileUtil.NFS_RETRY_SECONDS);
      try
      {
        JSONObject commTaskRanges = null;
        boolean bOnlyImport = false;
        // the file is converted with the old version but it has not been edit by docs
        // so we only need to import this file with latest conversion build
        if (parameters.containsKey("uploadConvert"))
        {
          // bOnlyImport means that there is no edit change for document draft, so we can simply import ods again
          bOnlyImport = Boolean.parseBoolean((String) parameters.get("uploadConvert"));
        }
        JSONObject xlsx2jsonParams = new JSONObject();
        if (!bOnlyImport)
        {
          // json->xlsx
          ConversionResult tmpResult = ConversionService.getInstance().getConverter(JSON_MIMETYPE, XLSX_MIMETYPE)
              .convert(sourceTmpFolder, tmpFolder, parameters);// json is also in conversionFolder

          // exception handle for if json2ods not sucessful
          if (tmpResult.isSucceed())
          {
            xlsxFile = tmpResult.getConvertedFilePath();
            try
            {
              commTaskRanges = ConversionUtil.getPreservedCommentTaskRanges(sourceTmpFolder);
            }
            catch (JsonParseException e)
            {
              log.log(Level.WARNING, "Upgrade ods file: get preserved comment and task failed due to parse content.js error");
            }
            catch (IOException e)
            {
              log.log(Level.WARNING, "Upgrade ods file: get preserved comment and task failed due to IO error");
            }
          }
          else
          {
            xlsxFile = null;
            log.log(Level.WARNING, "failed to upgrade version when convert from old version json to xlsx");
          }
          // ACL Ranges will be imported only in migration. Add a flag here
          xlsx2jsonParams.put("ACLRanges", "true");
        } 
        if (xlsxFile != null)
        {
          // xlsx->json
          // set parameter for ignore file too large exceptions
          xlsx2jsonParams.put("isPublished", "true");
          if (commTaskRanges != null && !commTaskRanges.isEmpty())
          {
            String commTaskFilePath = tmpFolder + File.separator + "preservecommenttask.json";
            FileOutputStream os = null;
            try
            {
              os = new FileOutputStream(new File(commTaskFilePath));
              JSONWriter jw = new JSONWriter(os);
              jw.serializeObject(commTaskRanges);
              xlsx2jsonParams.put("commenttaskranges", commTaskFilePath);
              
              File reserveFolder = new File(sourceTmpFolder, FILE_RESERVE);
              if(reserveFolder.exists())
              {
                File targetReserveFolder = new File(targetFolder, FILE_RESERVE);
                NFSFileUtil.nfs_copyDirToDir(reserveFolder, targetReserveFolder, new HashSet<String>(), NFSFileUtil.NFS_RETRY_SECONDS);
              }
              // spreadsheet also need copy comments.js
              File commentjs = new File(sourceTmpFolder, "comments.js");
              if(commentjs.exists())
              {
                File targetReserveFolder = new File(targetFolder, FILE_RESERVE);
                NFSFileUtil.nfs_copyFileToDir(commentjs, targetFolder, null, NFSFileUtil.NFS_RETRY_SECONDS);
              }
              
            }
            finally
            {
              if(os != null)
                os.close();
            }
          }
          result = convert(new File(xlsxFile), targetFolder, xlsx2jsonParams);
        }
      }
      catch (Exception e)
      {
        log.log(Level.WARNING, "failed to upgrade version");
        result = null;
      }
      finally
      {
        FileUtil.forceDelete(sourceTmpFolder);
        FileUtil.forceDelete(tmpFolder);
      }
    }
    // keep the draft json when exception or odfFile is not exist
    if (result == null)
    {
      NFSFileUtil.nfs_copyDirToDir(sourceFolder, targetFolder, NFSFileUtil.NFS_RETRY_SECONDS);
      result = new ConversionResult();
      String targetContentPath = targetFolder.getAbsolutePath() + File.separator + "content.js";
      result.setConvertedFilePath(targetContentPath);
    }
    long end = System.currentTimeMillis();
    log.log(Level.INFO, "Spreadsheet(xlsx) upgrade cost " + (end - start) + "ms");
    return result;
  }

  private File getTempFolder()
  {
    IConversionService conversionService = ConversionService.getInstance();
    // Symphony converter uses source file name as converted file name. In order to avoid replacement,
    // create temp folder for each document
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "json2xlsx"
        + File.separator + "temp" + File.separator + UUID.randomUUID());
    tempFolder.mkdirs();
    return tempFolder;
  }
  
  private ConversionResult convertByConvLib(File sourceFile, File targetFolder, Map parameters)
  {
    ConversionResult result = ConversionLibManager.getInstance().convert(sourceFile, targetFolder, "xlsx", "json", parameters);
    if (result.isSucceed())
    {
      String targetContentPath = targetFolder.getAbsolutePath() + File.separator + "content.js";
      result.setConvertedFilePath(targetContentPath);
      String featurePath = targetFolder.getAbsolutePath() + File.separator + "feature.log";
      detectUnsupportFeature(result, featurePath);
    }
    return result;
  }

  private void detectUnsupportFeature(ConversionResult result, String filePath)
  {
    File file = new File(filePath);
    BufferedReader reader = null;
    try
    {
      if (file.exists())
      {
        reader = new BufferedReader(new FileReader(file));
        String content = null;
        boolean isPreseved = true;
        while ((content = reader.readLine()) != null)
        {
          String featureId = (String) featureMap.get(content);
          if (featureId != null)
          {
            ConversionWarning cw = new ConversionWarning(featureId, isPreseved, "", content);
            result.addWarning(cw);
          }
        }
      }
    }
    catch (IOException e)
    {
      log.log(Level.SEVERE, "Failed to convert XLSX to Json:", e);
    }
    finally
    {
      try
      {
        if (reader != null)
          reader.close();
      }
      catch (IOException e1)
      {
      }
    }
  }

  private ConversionResult convertBySymphony(File sourceFile, File targetFolder, Map parameters, long start)
  {
    log.entering(getClass().getName(), "convert", sourceFile.getPath());
    ConversionResult result = new ConversionResult();
    SymConversionResult symResult = null;
    String converted = null;
    String tmpFolderPath = getTempFolderPath();
    try
    {
      // xlsx->ods
      symResult = SymphonyConverterImpl.getInstance().convert(sourceFile.getPath(), tmpFolderPath,
          ConversionConstants.XLSX_MIMETYPE, ConversionConstants.ODS_MIMETYPE, parameters == null ? null : new HashMap(parameters));
      
      if(symResult.isSucceed())
      {
        converted = symResult.getTargetFile();
        
        // ods->json
        result = ConversionService.getInstance().getConverter(ConversionConstants.ODS_MIMETYPE,
            ConversionConstants.JSON_MIMETYPE).convert(new File(converted), targetFolder, parameters);
      }
      else
      {
        String featureID = symResult.getErrorCode();
        String waringDesc = symResult.getErrorMsg();
        ConversionWarning ce = new ConversionWarning(featureID, false, "", waringDesc);
        result.addWarning(ce);
        result.setSucceed(false);
      }
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "Failed to convert XLSX to Json:", e);
      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    finally
    {
      FileUtil.forceDelete(tmpFolderPath);
    }
    log.exiting(getClass().getName(), "convert");
    return result;
  }
  
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    return convert(sourceFile, targetFolder, parameters, false);
  }

  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
//    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "xlsx2json"
//        + File.separator + UUID.randomUUID());
    File targetFolder = new File("D:\\Work\\Sample\\PVTSample" + File.separator + "output" + File.separator + "xlsx2json" + File.separator
        + sourceFile.getName());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters, true);
  }

  private String getTempFolderPath()
  {
    IConversionService conversionService = ConversionService.getInstance();
    // Symphony converter uses source file name as converted file name. In order to avoid replacement,
    // create temp folder for each document
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "xlsx2json"
        + File.separator + "temp" + File.separator + UUID.randomUUID());
    tempFolder.mkdirs();
    return tempFolder.getAbsolutePath();
  }
  
  public boolean isRunnableAvailable()
  {
    if(ConversionLibManager.getInstance().isConvLibEnabled())
    {
      return (ConversionLibManager.getInstance().getClInstanceCount() > 0);
    }
    return SymphonyConverterImpl.getInstance().hasAvailableInstance();
  }

}
