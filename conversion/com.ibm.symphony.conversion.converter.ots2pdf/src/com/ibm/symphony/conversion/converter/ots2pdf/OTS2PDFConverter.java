/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ots2pdf;

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
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class OTS2PDFConverter extends AbstractFormatConverter
{

  private static final String OTS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet-template";

  private static final String PDF_MIMETYPE = "application/pdf";

  private static Logger log = Logger.getLogger(OTS2PDFConverter.class.getName());

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", sourceFile.getPath());
    ConversionResult result = new ConversionResult();
    SymConversionResult symResult = null;
    String converted = null;
    try
    {
      symResult = SymphonyConverterImpl.getInstance().convert(sourceFile.getPath(), targetFolder.getAbsolutePath(), OTS_MIMETYPE,
          PDF_MIMETYPE, parameters == null ? null : new HashMap(parameters));

      if(symResult.isSucceed())
      {
        converted = symResult.getTargetFile();
        result.setConvertedFilePath(converted);
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
      log.log(Level.SEVERE, "Failed to convert OTS to PDF:", e);       
      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }

    log.exiting(getClass().getName(), "convert");
    return result;
  }

  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "ots2pdf"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters);
  }
  
  public boolean isRunnableAvailable()
  {
    return SymphonyConverterImpl.getInstance().hasAvailableInstance();
  }

}
