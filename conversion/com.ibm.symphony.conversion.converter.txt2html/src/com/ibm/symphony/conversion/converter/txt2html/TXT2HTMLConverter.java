/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */


package com.ibm.symphony.conversion.converter.txt2html;

import java.io.File;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class TXT2HTMLConverter extends AbstractFormatConverter
{
  private static Logger log = Logger.getLogger(TXT2HTMLConverter.class.getName());

  private ConversionResult convert(File sourceFile, File targetFolder, Map parameters, boolean isZip) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", sourceFile.getPath());
    ConversionResult result = new ConversionResult();
    String tmpFolderPath = getTempFolderPath();
    
    try
    {
      // txt->odt
      result = ConversionService.getInstance().getConverter(ConversionConstants.TXT_MIMETYPE,
          ConversionConstants.ODT_MIMETYPE).convert(sourceFile, new File(tmpFolderPath), parameters);
      if(result.isSucceed())
      {
        File odtFile = result.getConvertedFile();
        // odt->html
        result = ConversionService.getInstance().getConverter(ConversionConstants.ODT_MIMETYPE,
            ConversionConstants.HTML_MIMETYPE).convert(odtFile, targetFolder, parameters);
        
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
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "Failed to convert TXT to HTML:", e);       
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    finally
    {
      FileUtil.forceDelete(tmpFolderPath);
    }
    log.exiting(getClass().getName(), "convert");
    return result;
  }
  
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    return convert(sourceFile, targetFolder, parameters, false);
  }
  
  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "txt2html"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters, true);
  }
  
  private String getTempFolderPath()
  {
    IConversionService conversionService = ConversionService.getInstance();
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "txt2html"
        + File.separator + "temp" + File.separator + UUID.randomUUID());
    tempFolder.mkdirs();
    return tempFolder.getAbsolutePath();
  }
}
