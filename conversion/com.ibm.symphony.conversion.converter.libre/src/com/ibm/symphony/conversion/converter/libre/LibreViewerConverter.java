/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of HCL                              */
/*                                                                   */
/* Copyright HCL Technologies Ltd. 2021                       		 */
/*                                                                   */
/* US Government Users Restricted Rights                             */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.libre;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import com.ibm.symphony.conversion.converter.sym.SymConversionResult;
import com.ibm.symphony.conversion.converter.sym.impl.SymphonyConverterImpl;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class LibreViewerConverter extends AbstractFormatConverter
{
  private static final Logger log = Logger.getLogger(LibreViewerConverter.class.getName());

  private static final String XLS_MIMETYPE = "application/vnd.ms-excel";
  
  private static final String XLSX_MIMETYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  
  private static final String FLAG_FOLDER_NAME = "concord_published";

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters)
  {
		System.out.println("----------------LibreViewerConverter convert start ");  
  //converter.msword2png.MSWord2pngConverter
    boolean runThumbnailService = Boolean.valueOf((String) parameters.remove("thumbnailservicejob"));
    if (runThumbnailService)
    {
      ThumbnailConverter converter = new ThumbnailConverter(sourceFile, parameters);
      return converter.convert(sourceFile, targetFolder);
    }
    else
    {
      String sourceType = (String) parameters.get("sourceMIMEType");
      if(sourceType.equals(XLSX_MIMETYPE)&&isIBMDocsFile(sourceFile))
      {
        log.log(Level.FINE, "Detected xlsx file published by IBMDocs,start to save to xls with Symphony.");
        ConversionResult result = new ConversionResult();
        SymConversionResult symResult = null;
        String tmpFolderPath = getTempFolder();
        try
        {
          symResult = SymphonyConverterImpl.getInstance()
              .convert(sourceFile.getPath(), tmpFolderPath, XLSX_MIMETYPE, XLS_MIMETYPE, null);
          if (symResult.isSucceed())
          {
            File tempFile = new File(symResult.getTargetFile());
            LibreManager instance = LibreManager.getInstance();
            return instance.convert(tempFile, targetFolder, parameters);
          }
          else
          {
            log.log(Level.SEVERE, "Symphony failed to save " + sourceFile + " to xls.");
            String featureID = symResult.getErrorCode();
            String waringDesc = symResult.getErrorMsg();
            ConversionWarning ce = new ConversionWarning(featureID, false, "", waringDesc);
            result.addWarning(ce);
            result.setSucceed(false);
            return result;
          }
        }
        catch (Exception e)
        {
          log.log(Level.SEVERE, "Symphony failed to save " + sourceFile + " to xls.");
          ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
          result.addWarning(ce);
          result.setSucceed(false);
          return result;
        }
        finally
        {
          FileUtil.forceDelete(tmpFolderPath);
        }
      }
      else
      {
        LibreManager instance = LibreManager.getInstance();
        return instance.convert(sourceFile, targetFolder, parameters);
      }
    }
  }
  
  private String getTempFolder()
  {
    IConversionService conversionService = ConversionService.getInstance();
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "viewer"
        + File.separator + UUID.randomUUID());
    tempFolder.mkdirs();
    return tempFolder.getAbsolutePath();
  }
  
  public ConversionResult convert(File sourceFile, Map parameters)
  {
	  System.out.println("----------------LibreViewerConverter convert start 2");
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "viewer"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters);
  }

  public boolean isRunnableAvailable()
  {
    LibreManager instance = LibreManager.getInstance();
    int count = instance.getStInstanceCount();
    return (count > 0 || instance.getStFreeQueueSize() > 0);
  }
  private boolean isIBMDocsFile(File sourceFile)
  {
    boolean isIBMDocsFile = false;
    ZipFile docsFile = null;
    try
    {
      docsFile = new ZipFile(sourceFile, ZipFile.OPEN_READ);
      ZipEntry flagFolder = docsFile.getEntry(FLAG_FOLDER_NAME);
      if (flagFolder != null)
      {
        log.log(Level.FINE,"Detected concord_published folder inside the source file.");
        isIBMDocsFile=true;
      }
    }
    catch (Exception e)
    {
      log.log(Level.FINER, "Failed to read ooxml mime type.", e);
    }
    finally
    {
      try
      {
        if (docsFile != null)
        {
          docsFile.close();
        }
      }
      catch (IOException e)
      {
        log.log(Level.FINEST, "Failed to close stream.", e);
      }
    }
    return isIBMDocsFile;
  }
}
