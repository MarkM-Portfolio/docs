/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odf2image;

import java.io.File;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.sym.SymConversionResult;
import com.ibm.symphony.conversion.converter.sym.impl.SymphonyConverterImpl;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.IFormatConverter;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class ODF2ImageConverter implements IFormatConverter
{
  private static final String DOC_MIMETYPE = "application/msword";

  private static final String XLS_MIMETYPE = "application/vnd.ms-excel";

  private static final String PPT_MIMETYPE = "application/vnd.ms-powerpoint";

  private static final String ODT_MIMETYPE = "application/vnd.oasis.opendocument.text";

  private static final String ODT_MIMETYPE_TEMPL = "application/vnd.oasis.opendocument.text-template";

  private static final String ODS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet";
  
  private static final String ODS_MIMETYPE_TEMPL = "application/vnd.oasis.opendocument.spreadsheet-template";

  private static final String ODP_MIMETYPE = "application/vnd.oasis.opendocument.presentation";
  
  private static final String ODP_MIMETYPE_TEMPL = "application/vnd.oasis.opendocument.presentation-template";

  private static final Logger log = Logger.getLogger(ODF2ImageConverter.class.getName());

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters)
  {
    log.entering(getClass().getName(), "convert", sourceFile.getPath());
    ConversionResult result = new ConversionResult();
    String sourceType = (String) parameters.get("sourceMIMEType");
    String targetType = (String) parameters.get("targetMIMEType");
    String midType;
    if (sourceType.equals(ODT_MIMETYPE)||sourceType.equals(ODT_MIMETYPE_TEMPL))
      midType = DOC_MIMETYPE;
    else if (sourceType.equals(ODS_MIMETYPE)||sourceType.equals(ODS_MIMETYPE_TEMPL))
      midType = XLS_MIMETYPE;
    else
      midType = PPT_MIMETYPE;

    SymConversionResult symResult = null;
    String converted = null;
    String tmpFolderPath = getTempFolder();
    try
    {
      log.log(Level.INFO, "STJOB start to convert " + sourceFile + " with Symphony.");
      symResult = SymphonyConverterImpl.getInstance().convert(sourceFile.getPath(), tmpFolderPath, sourceType, midType, null);
      if (symResult.isSucceed())
      {
        converted = symResult.getTargetFile();
        result = ConversionService.getInstance().getConverter(midType,
            targetType).convert(new File(converted), targetFolder, parameters);
      }
      else
      {
        log.log(Level.SEVERE, "STJOB failed to convert " + sourceFile + ".");
        String featureID = symResult.getErrorCode();
        String waringDesc = symResult.getErrorMsg();
        ConversionWarning ce = new ConversionWarning(featureID, false, "", waringDesc);
        result.addWarning(ce);
        result.setSucceed(false);
      }
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "STJOB failed to convert " + sourceFile + ".");
      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
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

  public ConversionResult convert(File sourceFile, Map parameters)
  {
    String targetPath = getTempFolder();
    return convert(sourceFile, new File(targetPath), parameters);
  }

  private String getTempFolder()
  {
    IConversionService conversionService = ConversionService.getInstance();
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "viewer"
        + File.separator + UUID.randomUUID());
    tempFolder.mkdirs();
    return tempFolder.getAbsolutePath();
  }
  public boolean isRunnableAvailable()
  {
	return SymphonyConverterImpl.getInstance().hasAvailableInstance();
  }
}
