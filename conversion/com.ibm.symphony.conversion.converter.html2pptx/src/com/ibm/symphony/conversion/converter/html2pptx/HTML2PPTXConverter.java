/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2pptx;

import java.io.File;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.conversionlib.ConversionLibManager;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class HTML2PPTXConverter extends AbstractFormatConverter
{
  private static String CONVERTOR = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_CONVERTOR, "HTML", "PPTX");

  @SuppressWarnings("unused")
  private static Logger log = Logger.getLogger(HTML2PPTXConverter.class.getName());

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    long start = System.currentTimeMillis();
    long threadID = Thread.currentThread().getId();
    ConversionLogger.log(log, Level.INFO, Long.toHexString(threadID)+": "+ODPCommonUtil.createMessage(ODPCommonUtil.LOG_STARTS, CONVERTOR));
    
    ConversionResult result = ConversionLibManager.getInstance().convert(sourceFile, targetFolder, "html", "pptx", parameters);
    if (result.isSucceed())
    {
      String targetContentPath = targetFolder.getAbsolutePath() + File.separator + "content.pptx";
      File convertedFile = new File(targetContentPath);
      result.setConvertedFile(convertedFile);
    }

    long end = System.currentTimeMillis();
    ConversionLogger.log(log, Level.INFO, Long.toHexString(threadID)+": "+ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ENDS, CONVERTOR, Long.toString(end - start)));

    return result;
  }

  @SuppressWarnings("rawtypes")
  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "html2pptx"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters);
  }
}
