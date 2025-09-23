/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2pdf;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.sym.SymConversionResult;
import com.ibm.symphony.conversion.converter.sym.impl.SymphonyConverterImpl;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class ODT2PDFConverter extends AbstractFormatConverter
{

  private static final String ODT_MIMETYPE = "application/vnd.oasis.opendocument.text";

  private static final String PDF_MIMETYPE = "application/pdf";
  

  private static Logger log = Logger.getLogger(ODT2PDFConverter.class.getName());

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", sourceFile.getPath());
    ConversionResult result = new ConversionResult();

    File tmpFolder = getTempFolder();
    SymConversionResult symResult = null;
    try
    {
      symResult = SymphonyConverterImpl.getInstance()
      .convert(sourceFile.getPath(), targetFolder.getAbsolutePath(), ODT_MIMETYPE, PDF_MIMETYPE,
          parameters == null ? null : new HashMap(parameters));
        if(!symResult.isSucceed() )
        {
          String featureID = symResult.getErrorCode();
          String waringDesc = symResult.getErrorMsg();
          ConversionWarning ce = new ConversionWarning(featureID, false, "", waringDesc);
          result.addWarning(ce);
          result.setSucceed(false);
        }
        else
        {
          result.setConvertedFilePath(symResult.getTargetFile());
        }
    }
    catch (Exception e)
    {
      e.printStackTrace();
      log.severe(e.getMessage());
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

  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "odt2pdf"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters);
  }
  
  private File getTempFolder()
  {
    IConversionService conversionService = ConversionService.getInstance();
    // Symphony converter uses source file name as converted file name. In order to avoid replacement,
    // create temp folder for each document
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "odt2pdf"
        + File.separator + "temp" + File.separator + UUID.randomUUID());
    tempFolder.mkdirs();
    return tempFolder;
  }
  
  public boolean isRunnableAvailable()
  {
    return SymphonyConverterImpl.getInstance().hasAvailableInstance();
  }

}
