package com.ibm.symphony.conversion.converter.doc2json;

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

public class DOC2JSONConverter extends AbstractFormatConverter
{
  private static Logger log = Logger.getLogger(DOC2JSONConverter.class.getName());

  private ConversionResult convert(File sourceFile, File targetFolder, Map parameters, boolean isZip) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", sourceFile.getPath());
    ConversionResult result = new ConversionResult();
    SymConversionResult symResult = null;
    String converted = null;
    String tmpFolderPath = getTempFolderPath();
    try
    {
      // doc->odt
      symResult = SymphonyConverterImpl.getInstance().convert(sourceFile.getPath(), tmpFolderPath,
          ConversionConstants.DOC_MIMETYPE, ConversionConstants.ODT_MIMETYPE, parameters == null ? null : new HashMap(parameters));
      
      if(symResult.isSucceed())
      {
        converted = symResult.getTargetFile();
        
        File flagFile = new File(targetFolder.getParent(), targetFolder.getName()+File.separator+"doc2json");
        flagFile.createNewFile();
        
        // odt->json
        result = ConversionService.getInstance().getConverter(ConversionConstants.ODT_MIMETYPE,
            ConversionConstants.JSON_MIMETYPE).convert(new File(converted), targetFolder, parameters);
        
        flagFile.delete();
        
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
      log.log(Level.SEVERE, "Failed to convert DOC to json:", e);       
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
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "doc2json"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters, true);
  }

  private String getTempFolderPath()
  {
    IConversionService conversionService = ConversionService.getInstance();
    // Symphony converter uses source file name as converted file name. In order to avoid replacement,
    // create temp folder for each document
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "doc2json"
        + File.separator + "temp" + File.separator + UUID.randomUUID());
    tempFolder.mkdirs();
    return tempFolder.getAbsolutePath();
  }
}
