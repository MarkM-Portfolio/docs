/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.codehaus.jackson.JsonParseException;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.ods2json.sax.ODS2JSONConverterImpl;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.common.util.NFSFileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.exception.OutOfCapacityException;
import com.ibm.symphony.conversion.service.formulalexer.IDMFormulaLexer;
import com.ibm.symphony.conversion.service.impl.ConversionService;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
public class ODS2JSONConverter extends AbstractFormatConverter
{

  private static final String ODS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet";

  private static final String JSON_MIMETYPE = "application/json";

  private static final String TARGET_FOLDER = "output" + File.separator + "ods2json";

  private static final String SUFFIX_ZIP = ".zip";

  private static final String FILE_RESERVE = "Reserved";
  
  private static Logger log = Logger.getLogger(ODS2JSONConverter.class.getName());

  public ConversionResult convert(File sourceFile, File conversionFolder, Map parameters, boolean isZip)
  {
    log.entering(getClass().getName(), "convert", sourceFile);

    ConversionResult result = new ConversionResult();
    //DOM converter
//    ODF2JSONConverterImpl converter = new ODF2JSONConverterImpl(conversionFolder.getPath());
    //SAX converter
    ODS2JSONConverterImpl converter = new ODS2JSONConverterImpl(conversionFolder.getPath());
    String path = null;
    try
    {
      if (parameters != null && Boolean.valueOf((String) parameters.get("upgradeVersion")))
      {
        //when upgrade, sourceFile must be the folder which contains the old version json files and odfDraft
        //rather than the path of the ods file
        path = upgrade(sourceFile, conversionFolder, parameters);
      }
      else
      {
        JSONObject ods2jsonParams = new JSONObject();
        if (parameters != null && Boolean.valueOf((String) parameters.get("isPublished")))
        {
          ods2jsonParams.put("ignoreLarge", "true");
        }
        // determine if import ACL
        if (parameters != null && parameters.containsKey("firstImport"))
        {
          // bOnlyImport means that there is no edit change for document draft, so we can simply import ods again
          boolean bFirstImport = Boolean.parseBoolean((String)  parameters.get("firstImport"));
          if (bFirstImport)
          {
            // Do not import ACL if it is first import
            ods2jsonParams.put("ACLRanges", false);
          }
        }
        path = converter.convert(sourceFile.getPath(), ODS_MIMETYPE, JSON_MIMETYPE, ods2jsonParams);
      }

      if (isZip)
      {
        File contentFile = new File(path);// content.js
        File targetFile = new File(conversionFolder.getParent(), conversionFolder.getName() + SUFFIX_ZIP);
        FileUtil.zipFolder(contentFile.getParentFile(), targetFile);
        if (path != null)
        {
          result.setConvertedFile(targetFile);
        }
      }
      else
      {
        result.setConvertedFilePath(path);
      }
    }
    catch (OutOfCapacityException e)
    {
      log.severe(e.getMessage());
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_FILE_IS_TOO_LARGE, false, "", e.getMessage());
      int errorCode = e.getErrorCode();
      if (errorCode != 0)
      {
        Map<String, Integer> params = new HashMap<String, Integer>();
        params.put("conv_err_code", errorCode);
        ce.setParameters(params);
      }
      result.addWarning(ce);
      result.setSucceed(false);
    }
    catch (Exception e)
    {
      log.severe(e.getMessage());
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    finally
    {
      HashMap<String, String> unsupportFeatures = converter.getUnsupportFeatures();
      boolean isPreseved = true;
      if(!unsupportFeatures.isEmpty()) 
      {
        Iterator<?> it = unsupportFeatures.entrySet().iterator();
        while(it.hasNext())
        {
          Map.Entry<String,String> entry = (Map.Entry<String,String>)it.next();
          ConversionWarning cw = new ConversionWarning(entry.getValue(), isPreseved, "",entry.getKey());
          result.addWarning(cw);
        }
      }
    }
    log.exiting(getClass().getName(), "convert", result);
    return result;
  }

  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File conversionFolder = new File(conversionService.getRepositoryPath() + File.separator + TARGET_FOLDER + File.separator
        + UUID.randomUUID());
    // For UT test, do not use UUID as filename and output more info
    long begintime = 0;
    boolean isLocalTest = false;
    if (parameters != null && parameters.containsKey("LocalBatchTest"))
      isLocalTest = true;
    if (isLocalTest)
    {
      boolean isUpgrade = false; 
      try {
        isUpgrade = Boolean.valueOf(parameters.get("upgradeVersion").toString());
      } catch (Exception e) {}
      if (isUpgrade) {
        conversionFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "json2ods",
            sourceFile.getName()+"_");
        sourceFile = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "ods2json",
            sourceFile.getName()+"_");
        FileUtil.cleanDirectory(conversionFolder);
      } else {
        conversionFolder = new File(conversionService.getRepositoryPath() + File.separator + TARGET_FOLDER, sourceFile.getName() + "_");
        FileUtil.cleanDirectory(conversionFolder);
      }
      begintime = System.nanoTime();
    }
    conversionFolder.mkdirs();
    ConversionResult ret = convert(sourceFile, conversionFolder, parameters, true);
    if (isLocalTest)
    {
      long endtime = System.nanoTime();
      // unzip odfdraft for regression test
      try
      {
        File odfdraftFile = new File(conversionFolder, "odfdraft");
        if (odfdraftFile.exists())
        {
          File odfdraftFolder = new File(conversionFolder, "odfdraft_zip");
          odfdraftFolder.mkdirs();
          FileUtil.unzip(new FileInputStream(odfdraftFile), odfdraftFolder.getAbsolutePath());
        }
      }
      catch (Exception e)
      {
        e.printStackTrace();
      }
      System.out.println("Convert " + sourceFile + " to " + conversionFolder);
      System.out.println("Convert Result:" + (ret.isSucceed() ? "success" : "failed"));
      double ctime = (endtime - begintime) / 1000.0 / 1000.0 / 1000.0;
      int usedmb = (int) ((Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / 1024 / 1024);
      System.out.println(sourceFile.getName() + " CL-CONVERTER:Execute Time is " + (Math.round(ctime * 10000) / 10000.0)
          + "s. Peak pageable memory size is " + usedmb + "MB");
    }
    return ret;
  }

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    return convert(sourceFile, targetFolder, parameters, false);
  }
  
  /**
   * Upgrade the json from old version to the new version
   * We have to make sure the json->ods has the backward compatibility and no id change for new version json
   * @param sourceFile  the old version json files and odfDraft
   * @param conversionFolder   the path for the new version json files
   * @param parameters
   * @return
   * @throws Exception 
   */
  private String upgrade(File sourceFolder, File conversionFolder, Map parameters) throws Exception
  {
    long start = System.currentTimeMillis();
    String path = null;
    String draftName = "odfdraft";
    File odfFile = new File(sourceFolder, draftName);

    //49641 all draft need upgrade now, if version is less than 1.3.0
    boolean needUpgrade = odfFile.exists();
    boolean isOdfDraft = false;
    if (needUpgrade == false)
    {
      String draftversion = NFSFileUtil.readDraftFormatVersion(sourceFolder);
      isOdfDraft = ConversionUtil.compareVersion(draftversion, "1.3.0") < 0 ;
      needUpgrade = ( draftversion==null || isOdfDraft );
    }
    if (needUpgrade)
    {
      File tmpFolder = getTempFolder();
      File sourceTmpFolder = getTempFolder();
      String odsFile = sourceFolder + File.separator + draftName;
      // first copy the "odfdraft" to tmpFolder incase the odfdraft has been deleted when json2ods failed
      // even it is not failed, "odfdraft" can be overwritten with the new converted one from ods2json
      NFSFileUtil.nfs_copyDirToDir(sourceFolder, sourceTmpFolder, NFSFileUtil.NFS_RETRY_SECONDS);
      try
      {
        // the file is converted with the old version but it has not been edit by docs
        // so we only need to import this file with latest conversion build
        boolean bOnlyImport = false;
        if (parameters.containsKey("uploadConvert"))
        {
          // bOnlyImport means that there is no edit change for document draft, so we can simply import ods again
          bOnlyImport = Boolean.parseBoolean((String)  parameters.get("uploadConvert"));
        }
        JSONObject ods2jsonParams = new JSONObject();
        if (!bOnlyImport)
        {
          // odf comments import/export is supported now. So remove the process for comments
          // Can put other process here that only for migration
          // ACL Ranges will be imported only in migration. Add a flag here
          ods2jsonParams.put("ACLRanges", true);
          
        } 
        if (odsFile != null)
        {
          // ods->json
          ODS2JSONConverterImpl converter = new ODS2JSONConverterImpl(conversionFolder.getPath());
          // set parameter for ignore file too large exceptions
          ods2jsonParams.put("ignoreLarge", "true");
          path = converter.convert(odsFile, ODS_MIMETYPE, JSON_MIMETYPE, ods2jsonParams);
        }
      }
      catch (Exception e)
      {
        log.log(Level.WARNING, "failed to upgrade version");
        path = null;
      }
      finally
      {
        FileUtil.forceDelete(sourceTmpFolder);
        FileUtil.forceDelete(tmpFolder);
      }
    }
    // keep the draft json when exception or odfFile is not exist
    if (path == null)
    {
      NFSFileUtil.nfs_copyDirToDir(sourceFolder, conversionFolder, NFSFileUtil.NFS_RETRY_SECONDS);
      path = conversionFolder + File.separator + "content.js";
    }
    long end = System.currentTimeMillis();
    log.log(Level.INFO, "Spreadsheet upgrade cost " + (end - start) + "ms");
    return path;
}
  
  public static void main(String[] args) throws JsonParseException, IOException{
    ConversionUtil.getPreservedCommentTaskRanges(new File("D:\\test"));
  }
  private File getTempFolder()
  {
    IConversionService conversionService = ConversionService.getInstance();
    // Symphony converter uses source file name as converted file name. In order to avoid replacement,
    // create temp folder for each document
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "json2ods"
        + File.separator + "temp" + File.separator + UUID.randomUUID());
    tempFolder.mkdirs();
    return tempFolder;
  }
}
