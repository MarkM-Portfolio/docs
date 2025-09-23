/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.csv2json;

import java.io.File;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.IFormatConverter;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;
import com.ibm.symphony.conversion.spreadsheet.impl.CSV2JSONConverterImpl;

public class CSV2JSONConverter extends AbstractFormatConverter 
{

  private static final String CSV_MIMETYPE = "text/csv";

  private static final String JSON_MIMETYPE = "application/json";

  private static final String TARGET_FOLDER = "output" + File.separator + "csv2json";

  private static final String SUFFIX_ZIP = ".zip";

  private static Logger log = Logger.getLogger(CSV2JSONConverter.class.getName());

  public ConversionResult convert(File sourceFile, File conversionFolder, Map parameters, boolean isZip)
  {
    log.entering(getClass().getName(), "convert", sourceFile);

    ConversionResult result = new ConversionResult();
    CSV2JSONConverterImpl converter = new CSV2JSONConverterImpl(conversionFolder.getPath());

    String path = null;
    try
    {
      path = converter.convert(sourceFile.getPath(), CSV_MIMETYPE, JSON_MIMETYPE);
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
    catch (Exception e)
    {
      log.severe(e.getMessage());
      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    log.exiting(getClass().getName(), "convert", result);
    return result;
  }

  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File conversionFolder = new File(conversionService.getRepositoryPath() + File.separator + TARGET_FOLDER + File.separator
        + UUID.randomUUID());
    conversionFolder.mkdirs();
    return convert(sourceFile, conversionFolder, parameters, true);
  }

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    return convert(sourceFile, targetFolder, parameters, false);
  }
}
