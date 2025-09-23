/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.xls2html;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
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

public class XLS2HTMLConverter extends AbstractFormatConverter
{

  private static final String XLS_MIMETYPE = "application/vnd.ms-excel";

  private static final String HTML_MIMETYPE = "text/html";

  private static final String SUFFIX_ZIP = ".zip";

  private static Logger log = Logger.getLogger(XLS2HTMLConverter.class.getName());

  private ConversionResult convert(File sourceFile, File targetFolder, Map parameters, boolean isZip) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", sourceFile.getPath());
    ConversionResult result = new ConversionResult();
    SymConversionResult symResult = null;
    String converted = null;
    try
    {
      symResult = SymphonyConverterImpl.getInstance().convert(sourceFile.getPath(), targetFolder.getAbsolutePath(), XLS_MIMETYPE,
          HTML_MIMETYPE, parameters == null ? null : new HashMap(parameters));

      if(symResult.isSucceed())
      {
        converted = symResult.getTargetFile();
        // zip target content folder
        File convertedFile = new File(converted);
        File convertedFolder = convertedFile.getParentFile();
        if (isZip)
        {
          File targetFile = new File(convertedFolder.getParent(), convertedFolder.getName() + SUFFIX_ZIP);
          FileUtil.zipFolder(convertedFolder, targetFile);
          result.setConvertedFile(targetFile);
        }
        else
        {
          result.setConvertedFilePath(converted);
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
    catch (Exception e)
    {
      log.log(Level.SEVERE, "Failed to convert XLS to HTML:", e);
      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
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
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "xls2html"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters, true);
  }
  
  public boolean isRunnableAvailable()
  {
    return SymphonyConverterImpl.getInstance().hasAvailableInstance();
  }

}
