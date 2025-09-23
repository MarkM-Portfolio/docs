package com.ibm.symphony.conversion.converter.json2xlsx;
import java.io.File;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.conversionlib.ConversionLibManager;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;


public class JSON2XLSXConverter extends AbstractFormatConverter
{
  private static Logger log = Logger.getLogger(JSON2XLSXConverter.class.getName());

  @Override
  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "json2xlsx"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters);
  }

  @Override
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    long start = System.currentTimeMillis();
    long threadID = Thread.currentThread().getId();
    ConversionLogger.log(log, Level.INFO, Long.toHexString(threadID)+": JSON2XLSXConverter start");
    
    ConversionResult result = ConversionLibManager.getInstance().convert(sourceFile, targetFolder, "json", "xlsx", parameters);

    if (result.isSucceed())
    {
      String targetContentPath = targetFolder.getAbsolutePath() + File.separator + "content.xlsx";
      File convertedFile = new File(targetContentPath);
      result.setConvertedFile(convertedFile);
    }

    long end = System.currentTimeMillis();
    ConversionLogger.log(log, Level.INFO, Long.toHexString(threadID)+": JSON2XLSX cost time: " + Long.toString(end - start) + "ms");

    return result;
  }

}
