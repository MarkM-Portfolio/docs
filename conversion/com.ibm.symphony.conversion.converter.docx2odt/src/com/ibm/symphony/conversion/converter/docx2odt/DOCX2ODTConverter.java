/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.docx2odt;

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
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.DocUnsupportFeature;
import com.ibm.symphony.conversion.service.common.DocUnsupportFeature.FeatureInfo;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class DOCX2ODTConverter extends AbstractFormatConverter
{

  private static final String DOCX_MIMETYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  private static final String ODT_MIMETYPE = "application/vnd.oasis.opendocument.text";

  private static Logger log = Logger.getLogger(DOCX2ODTConverter.class.getName());
  
  private static final String MSG = "Conversion warning for unsupported feature";
  
  private static final String TEXT_SUFFIX = ".txt";
  
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", sourceFile.getPath());
    long beginTime = System.currentTimeMillis();
    ConversionResult result = new ConversionResult();
    SymConversionResult symResult = null;

    String converted = null;
    try
    {
      symResult = SymphonyConverterImpl.getInstance().convert(sourceFile.getPath(), targetFolder.getAbsolutePath(),
          DOCX_MIMETYPE, ODT_MIMETYPE, parameters == null ? null : new HashMap(parameters));

      if(symResult.isSucceed())
      {
        converted = symResult.getTargetFile();
        result.setConvertedFilePath(converted);
        addWarning(result, sourceFile.getAbsolutePath());
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
      log.log(Level.SEVERE, "Failed to convert DOCX to ODT:", e);       
      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    log.finer("Converted from docx to odt cost:" + (System.currentTimeMillis() - beginTime) + "ms");
    log.exiting(getClass().getName(), "convert");
    return result;
  }
  
  public static void addWarning(ConversionResult result, String sourceFilePath)
  {
    File logFile = new File(sourceFilePath + TEXT_SUFFIX);
    if(logFile.exists())
    {
      BufferedReader br = null;
      try
      {
        br = new BufferedReader(new InputStreamReader(new FileInputStream(logFile)));
        String token = null; 
        while((token = br.readLine()) != null)
        { 
          FeatureInfo featureInfo = DocUnsupportFeature.DocxUnsupportFeatureMap.get(token);
          if(featureInfo != null && !result.hasWarning(featureInfo.errorCode))
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
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "docx2odt"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters);
  }
  
  public boolean isRunnableAvailable()
  {
    return SymphonyConverterImpl.getInstance().hasAvailableInstance();
  }
  
}
