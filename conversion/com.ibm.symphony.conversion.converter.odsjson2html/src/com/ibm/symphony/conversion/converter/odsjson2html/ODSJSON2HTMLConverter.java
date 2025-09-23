/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odsjson2html;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.odsjson2html.impl.ODSJSON2HTMLConverterImpl;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class ODSJSON2HTMLConverter extends AbstractFormatConverter
{
  private static Logger log = Logger.getLogger(ODSJSON2HTMLConverter.class.getName());

  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", new Object[] { sourceFile.getPath(), parameters });
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "odsjson2html"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    ConversionResult conversionResult = convert(sourceFile, targetFolder, parameters);
    log.exiting(getClass().getName(), "convert", conversionResult);
    return conversionResult;
  }

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", new Object[] { sourceFile.getPath(), targetFolder, parameters });
    ConversionResult conversionResult = new ConversionResult();
    conversionResult.setSucceed(false);

    try
    {
      File converted = new File(targetFolder, "converted");
      converted.mkdirs();
      ODSJSON2HTMLConverterImpl impl = new ODSJSON2HTMLConverterImpl();
      impl.convert(sourceFile, converted);
      File zipFile = new File(targetFolder, targetFolder.getName() + ".zip");
      FileUtil.zipFolder(converted, zipFile);
      FileUtil.cleanDirectory(converted);
      FileUtil.deleteFile(converted);
      conversionResult.setConvertedFile(zipFile);
      conversionResult.setConvertedFilePath(zipFile.getPath());
      conversionResult.setSucceed(true);
    }
    catch (IOException e)
    {
      log.logrb(Level.SEVERE, ODSJSON2HTMLConverter.class.toString(), "convert", "com.ibm.symphony.conversion.converter.odsjson2html",
          "io exception in convert", e);
      conversionResult.setSucceed(false);
      throw new ConversionException(e.getLocalizedMessage());
    }

    log.exiting(getClass().getName(), "convert", conversionResult);
    return conversionResult;
  }
}
