/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ppt2odp;

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
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class PPT2ODPConverter extends AbstractFormatConverter
{
  private static String CONVERTOR = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_CONVERTOR, "PPT", "ODP");

  @SuppressWarnings("unused")
  private static Logger log = Logger.getLogger(PPT2ODPConverter.class.getName());

  @SuppressWarnings({ "unchecked", "rawtypes" })
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    long start = System.currentTimeMillis();
    ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_STARTS, CONVERTOR));

    ConversionContext context = new ConversionContext();
    ConversionResult result = new ConversionResult();

    SymConversionResult symResult = null;
    String converted = null;
    try
    {
      context.put(ODPConvertConstants.CONTEXT_CONVERT_RESULT, result);

      symResult = SymphonyConverterImpl.getInstance()
          .convert(sourceFile.getPath(), targetFolder.getAbsolutePath(), ConversionConstants.PPT_MIMETYPE,
              ConversionConstants.ODP_MIMETYPE, parameters == null ? null : new HashMap(parameters));

      if (symResult.isSucceed())
      {
        converted = symResult.getTargetFile();
        result.setConvertedFilePath(converted);
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

    long end = System.currentTimeMillis();
    ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ENDS, CONVERTOR, Long.toString(end - start)));

    gatherStatistics(context, sourceFile, targetFolder, end - start);

    return result;
  }

  @SuppressWarnings("rawtypes")
  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "ppt2odp"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters);
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
