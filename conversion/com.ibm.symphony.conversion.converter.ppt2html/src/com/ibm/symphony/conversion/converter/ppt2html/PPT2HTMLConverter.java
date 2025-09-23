/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ppt2html;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.sym.SymConversionResult;
import com.ibm.symphony.conversion.converter.sym.impl.SymphonyConverterImpl;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.PerformanceAnalysis;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class PPT2HTMLConverter extends AbstractFormatConverter
{
  private static String CONVERTOR = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_CONVERTOR, "PPT", "HTML");

  @SuppressWarnings("unused")
  private static Logger log = Logger.getLogger(PPT2HTMLConverter.class.getName());

  @SuppressWarnings({ "unchecked", "rawtypes" })
  private ConversionResult convert(File sourceFile, File targetFolder, Map parameters, boolean isZip) throws ConversionException
  {
    long start = System.currentTimeMillis();
    ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_STARTS, CONVERTOR));

    ConversionContext context = new ConversionContext();
    ConversionResult result = new ConversionResult();

    SymConversionResult symResult = null;
    String converted = null;
    String tmpFolderPath = getTempFolderPath();
    try
    {
      context.put(ODPConvertConstants.CONTEXT_CONVERT_RESULT, result);

      // ppt->odp
      symResult = SymphonyConverterImpl.getInstance()
          .convert(sourceFile.getPath(), tmpFolderPath, ConversionConstants.PPT_MIMETYPE, ConversionConstants.ODP_MIMETYPE,
              parameters == null ? null : new HashMap(parameters));

      long endInterval = System.currentTimeMillis();
      String PPT2ODPCONVERTOR = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_CONVERTOR, "PPT", "ODP");
      ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ENDS, PPT2ODPCONVERTOR + " (Symphony)",
          Long.toString(endInterval - start)));

      if (symResult.isSucceed())
      {
        converted = symResult.getTargetFile();
        // odp->html
        result = ConversionService.getInstance()
            .getConverter(ConversionConstants.ODP_MIMETYPE, ConversionConstants.HTML_MIMETYPE)
            .convert(new File(converted), targetFolder, parameters);

        // zip target content folder
        if (isZip)
        {
          File convertedFile = result.getConvertedFile();
          File convertedFolder = convertedFile.getParentFile();
          File targetFile = new File(convertedFolder.getParent(), convertedFolder.getName() + ConversionConstants.SUFFIX_ZIP);
          FileUtil.zipFolder(convertedFolder, targetFile);
          result.setConvertedFile(targetFile);
        }

        if (PresentationConfig.isCollectPerfStats())
        {
          PerformanceAnalysis.addPerformanceInfoToResult(result, PerformanceAnalysis.PERF_TIME_MS2ODP, Long.toString(endInterval - start));
        }
      }
      else
      {
        ODPCommonUtil.addMessage(context, symResult.getErrorCode(), ConversionConstants.ERROR_PRESENTATION_SYM_TOOLARGE, false, "", symResult.getErrorMsg(), true);
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
    long end = System.currentTimeMillis();
    ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ENDS, CONVERTOR, Long.toString(end - start)));

    return result;
  }

  @SuppressWarnings({ "rawtypes" })
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    return convert(sourceFile, targetFolder, parameters, false);
  }

  @SuppressWarnings({ "rawtypes" })
  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "ppt2html"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters, true);
  }

  private String getTempFolderPath()
  {
    IConversionService conversionService = ConversionService.getInstance();
    // Symphony converter uses source file name as converted file name. In order to avoid replacement,
    // create temp folder for each document
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "ppt2html"
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
      PerformanceAnalysis.recordConversionTime(context, PerformanceAnalysis.PPT2ODP, sourceFile.getPath(), timeToConvert);
    }
  }

  public boolean isRunnableAvailable()
  {
    return SymphonyConverterImpl.getInstance().hasAvailableInstance();
  }

}
