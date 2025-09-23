/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.pptx2html;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.conversionlib.ConversionLibManager;
import com.ibm.symphony.conversion.converter.sym.SymConversionResult;
import com.ibm.symphony.conversion.converter.sym.impl.SymphonyConverterImpl;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.PerformanceAnalysis;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.presentation.UnsupportedFeatures;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class PPTX2HTMLConverter extends AbstractFormatConverter
{
  private static String CONVERTOR = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_CONVERTOR, "PPTX", "HTML");

  private static Logger log = Logger.getLogger(PPTX2HTMLConverter.class.getName());

  private final static String configFileName = "feature_map.json";

  private static JSONObject featureMap = null;
  
  static
  {
    InputStream in = null;
    try
    {
      in = PPTX2HTMLConverter.class.getResourceAsStream(configFileName);
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
    long start = System.currentTimeMillis();
    ConversionLogger.log(log, Level.INFO, ODPCommonUtil.createMessage(ODPCommonUtil.LOG_STARTS, CONVERTOR));

    ConversionResult result = null;
    
    if (ConversionLibManager.getInstance().isConvLibEnabled())
    {
      result = convertByConvLib(sourceFile, targetFolder, parameters);
    }
    else
    {
      result = convertBySymphony(sourceFile, targetFolder, parameters, start);
    }

    long end = System.currentTimeMillis();
    ConversionLogger.log(log, Level.INFO, ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ENDS, CONVERTOR, Long.toString(end - start)));

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

  private ConversionResult convertByConvLib(File sourceFile, File targetFolder, Map parameters)
  {
    ConversionResult result = ConversionLibManager.getInstance().convert(sourceFile, targetFolder, "pptx", "html", parameters);
    if (result.isSucceed())
    {
      String targetContentPath = targetFolder.getAbsolutePath() + File.separator + "content.html";
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
      log.log(Level.SEVERE, "Failed to convert PPTX to HTML:", e);
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
    ConversionContext context = new ConversionContext();
    ConversionResult result = new ConversionResult();

    SymConversionResult symResult = null;
    String converted = null;
    String tmpFolderPath = getTempFolderPath();
    try
    {
      context.put(ODPConvertConstants.CONTEXT_CONVERT_RESULT, result);

      String sourceFilename = sourceFile.getPath();
      String targetFilename = targetFolder.getAbsolutePath();

      // pptx->odp
      symResult = SymphonyConverterImpl.getInstance()
          .convert(sourceFilename, tmpFolderPath, ConversionConstants.PPTX_MIMETYPE, ConversionConstants.ODP_MIMETYPE,
              parameters == null ? null : new HashMap(parameters));

      long endInterval = System.currentTimeMillis();
      ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ENDS, CONVERTOR + " (Symphony)",
          Long.toString(endInterval - start)));

      if (symResult.isSucceed())
      {
        UnsupportedFeatures.copySymphonyLog(context, sourceFilename, targetFilename);

        converted = symResult.getTargetFile();
        // odp->html
        result = ConversionService.getInstance()
            .getConverter(ConversionConstants.ODP_MIMETYPE, ConversionConstants.HTML_MIMETYPE)
            .convert(new File(converted), targetFolder, parameters);

        if (PresentationConfig.isCollectPerfStats())
        {
          PerformanceAnalysis.addPerformanceInfoToResult(result, PerformanceAnalysis.PERF_TIME_MS2ODP, Long.toString(endInterval - start));
        }
      }
      else
      {
        ODPCommonUtil.addMessage(context, symResult.getErrorCode(), false, "", symResult.getErrorMsg(), true);
      }
    }
    catch (Throwable t)
    {
      ODPCommonUtil.handleException(t, context, CONVERTOR);
    }
    finally
    {
      FileUtil.forceDelete(tmpFolderPath);
    }
    return result;
  }

  @SuppressWarnings("rawtypes")
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    return convert(sourceFile, targetFolder, parameters, false);
  }

  @SuppressWarnings("rawtypes")
  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "pptx2html"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters, true);
  }

  private String getTempFolderPath()
  {
    IConversionService conversionService = ConversionService.getInstance();
    // Symphony converter uses source file name as converted file name. In order to avoid replacement,
    // create temp folder for each document
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "pptx2html"
        + File.separator + "temp" + File.separator + UUID.randomUUID());
    tempFolder.mkdirs();
    return tempFolder.getAbsolutePath();
  }

  /**
   * Gather performance statistics for presentation conversion
   * 
   * @param context
   *          Conversion Context
   * @param sourceFile
   *          Source file or directory
   * @param targetFile
   *          Target directory or File
   * @param timeToConvert
   *          Amount of time taken to convert the file (in milliseconds)
   */
  protected void gatherStatistics(ConversionContext context, File sourceFile, File targetFile, long timeToConvert)
  {
    if (PresentationConfig.isCollectPerfStats())
    {
      PerformanceAnalysis.recordConversionTime(context, PerformanceAnalysis.PPTX2ODP, sourceFile.getPath(), timeToConvert);
    }
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
