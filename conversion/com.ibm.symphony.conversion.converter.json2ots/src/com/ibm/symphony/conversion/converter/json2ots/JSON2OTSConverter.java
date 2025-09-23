/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ots;

import java.io.File;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;
import com.ibm.symphony.conversion.spreadsheet.impl.JSON2ODFConverterImpl;

public class JSON2OTSConverter extends AbstractFormatConverter
{

  private static final String OTS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet-template";

  private static final String JSON_MIMETYPE = "application/json";

  private static final String TARGET_FOLDER = "output" + File.separator + "json2ots";

  Logger log = Logger.getLogger(JSON2OTSConverter.class.getName());

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters)
  {
    log.entering(getClass().getName(), "convert", sourceFile);

    ConversionResult result = new ConversionResult();

    JSON2ODFConverterImpl converter = new JSON2ODFConverterImpl(targetFolder.getPath());
    String path = null;
    try
    {
      path = converter.convert(sourceFile.getPath(), JSON_MIMETYPE, OTS_MIMETYPE);
      if (path != null)
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
    String conversionFolderPath = conversionService.getRepositoryPath() + File.separator + TARGET_FOLDER + File.separator
        + UUID.randomUUID();
    File conversionFolder = new File(conversionFolderPath);
    conversionFolder.mkdirs();
    return convert(sourceFile, conversionFolder, parameters);
  }

}
