/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2doc;

import java.io.File;
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
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class JSON2DOCConverter extends AbstractFormatConverter
{
  private static Logger log = Logger.getLogger(JSON2DOCConverter.class.getName());

  private ConversionResult convert(File sourceFile, File targetFolder, Map parameters, boolean isZip) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", sourceFile.getPath());
    ConversionResult result = new ConversionResult();
    SymConversionResult symResult = null;
    String converted = null;
    File tmpFolder = getTempFolder();
    try
    {
      // json->odt
      ConversionResult tempResult = ConversionService.getInstance().getConverter(ConversionConstants.JSON_MIMETYPE,
          ConversionConstants.ODT_MIMETYPE).convert(sourceFile, tmpFolder, parameters);
      if(tempResult.isSucceed())
      {
    	     // odt->doc
          symResult = SymphonyConverterImpl.getInstance().convert(tempResult.getConvertedFilePath(), targetFolder.getAbsolutePath(),
              ConversionConstants.ODT_MIMETYPE, ConversionConstants.DOC_MIMETYPE, parameters == null ? null : new HashMap(parameters));
          
          if(symResult.isSucceed())
          {
            converted = symResult.getTargetFile();
            File convertedFile = new File(converted);
            result.setConvertedFile(convertedFile);
            
            // zip target content folder
            if (isZip)
            {
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
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "Failed to convert json to DOC:", e);       
      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    finally
    {
      FileUtil.forceDelete(tmpFolder);
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
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "json2doc"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters, true);
  }

  private File getTempFolder()
  {
    IConversionService conversionService = ConversionService.getInstance();
    // Symphony converter uses source file name as converted file name. In order to avoid replacement,
    // create temp folder for each document
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "json2doc"
        + File.separator + "temp" + File.separator + UUID.randomUUID());
    tempFolder.mkdirs();
    return tempFolder;
  }

  public boolean isRunnableAvailable()
  {
    return SymphonyConverterImpl.getInstance().hasAvailableInstance();
  }

}
