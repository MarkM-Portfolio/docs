/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.rtf2json;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.sym.SymConversionResult;
import com.ibm.symphony.conversion.converter.sym.impl.SymphonyConverterImpl;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.DocUnsupportFeature;
import com.ibm.symphony.conversion.service.common.DocUnsupportFeature.FeatureInfo;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class RTF2JSONConverter extends AbstractFormatConverter
{

  private static Logger log = Logger.getLogger(RTF2JSONConverter.class.getName());

  private static final String MSG = "Conversion warning for unsupported feature";

  private static final String TEXT_SUFFIX = ".txt";

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters, boolean isZip) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", sourceFile.getPath());
    long beginTime = System.currentTimeMillis();
    ConversionResult result = new ConversionResult();
    SymConversionResult symResult = null;

    String converted = null;
    try
    {
      symResult = SymphonyConverterImpl.getInstance().convert(sourceFile.getPath(), targetFolder.getAbsolutePath(),
          ConversionConstants.RTF_MIMETYPE, ConversionConstants.ODT_MIMETYPE, parameters == null ? null : new HashMap(parameters));

      if (symResult.isSucceed())
      {
        converted = symResult.getTargetFile();
        File flagFile = new File(targetFolder.getParent(), targetFolder.getName() + File.separator + "rtf2json");
        flagFile.createNewFile();

        // odt->json
        result = ConversionService.getInstance().getConverter(ConversionConstants.ODT_MIMETYPE, ConversionConstants.JSON_MIMETYPE)
            .convert(new File(converted), targetFolder, parameters);
        flagFile.delete();
        
        addWarning(result, sourceFile.getAbsolutePath());

        // zip target content folder
        if (isZip)
        {
          File convertedFile = result.getConvertedFile();
          File convertedFolder = convertedFile.getParentFile();
          File targetFile = new File(convertedFolder.getParent(), convertedFolder.getName() + ConversionConstants.SUFFIX_ZIP);
          FileUtil.zipFolder(convertedFolder, targetFile);
          result.setConvertedFile(targetFile);
        }
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
      log.log(Level.SEVERE, "Failed to convert RTF to JSON:", e);
      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    log.finer("Converted from rtf to json cost:" + (System.currentTimeMillis() - beginTime) + "ms");
    log.exiting(getClass().getName(), "convert");
    return result;
  }

  public static void addWarning(ConversionResult result, String sourceFilePath)
  {
    File logFile = new File(sourceFilePath + TEXT_SUFFIX);
    if (logFile.exists())
    {
      BufferedReader br = null;
      try
      {
        br = new BufferedReader(new InputStreamReader(new FileInputStream(logFile)));
        String token = null;
        while ((token = br.readLine()) != null)
        {
          FeatureInfo featureInfo = DocUnsupportFeature.DocxUnsupportFeatureMap.get(token);
          if (featureInfo != null && !result.hasWarning(featureInfo.errorCode))
          {
            ConversionWarning cw = new ConversionWarning(featureInfo.errorCode, featureInfo.preserved, "", featureInfo.featureText);
            result.addWarning(cw);
          }
        }
      }
      catch (Exception e)
      {
        log.log(Level.WARNING, MSG, e);
      }
      finally
      {
        if (br != null)
        {
          try
          {
            br.close();
          }
          catch (IOException e)
          {
            log.log(Level.WARNING, MSG, e);
          }
        }
      }
    }
  }

  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "rtf2json"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters, true);
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.ibm.symphony.conversion.service.IFormatConverter#convert(java.io.File, java.io.File, java.util.Map)
   */
  @Override
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    return convert(sourceFile, targetFolder, parameters, false);
  }

  public boolean isRunnableAvailable()
  {
    return SymphonyConverterImpl.getInstance().hasAvailableInstance();
  }

}
