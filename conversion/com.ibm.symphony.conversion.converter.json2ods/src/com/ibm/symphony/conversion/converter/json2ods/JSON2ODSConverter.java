/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods;

import java.io.File;
import java.io.FileInputStream;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.json2ods.sax.JSON2ODSConverterImpl;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;
import com.ibm.symphony.conversion.spreadsheet.index.IndexUtil;

public class JSON2ODSConverter extends AbstractFormatConverter
{

  private static final String ODS_MIMETYPE = "application/vnd.oasis.opendocument.spreadsheet";

  private static final String JSON_MIMETYPE = "application/json";

  private static final String TARGET_FOLDER = "output" + File.separator + "json2ods";

  Logger log = Logger.getLogger(JSON2ODSConverter.class.getName());

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters)
  {
    log.entering(getClass().getName(), "convert", sourceFile);

    ConversionResult result = new ConversionResult();
    File odsDraftFile = new File(sourceFile.getPath() + File.separator + IndexUtil.ODFDRAFT_NAME);
    String path = null;
    try
    {
//      if(odsDraftFile.exists())
//      {
        path = new JSON2ODSConverterImpl(targetFolder.getPath()).convert(sourceFile.getPath(), JSON_MIMETYPE, ODS_MIMETYPE, parameters);
//      }
//      else
//      {
//        path = new com.ibm.symphony.conversion.spreadsheet.impl.JSON2ODFConverterImpl(targetFolder.getPath()).convert(sourceFile.getPath(), JSON_MIMETYPE, ODS_MIMETYPE);
//      }
      if (path != null)
      {
        result.setConvertedFilePath(path);
      }
    }
    catch (Exception e)
    {
      log.severe(e.getMessage());
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", e.getMessage());
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
    // For UT test, do not use UUID as filename and output more info
    long begintime = 0;
    boolean isLocalTest = false;
    if (parameters != null && parameters.containsKey("LocalBatchTest")) isLocalTest = true;
    if (isLocalTest)
    {
        conversionFolder = new File(conversionService.getRepositoryPath() + File.separator + TARGET_FOLDER,
                sourceFile.getName()+"_");
        sourceFile = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "ods2json",
            sourceFile.getName()+"_");
        FileUtil.cleanDirectory(conversionFolder);
        begintime = System.nanoTime();
    }
    conversionFolder.mkdirs();
    ConversionResult ret = convert(sourceFile, conversionFolder, parameters);
    if (isLocalTest)
    {
        long endtime = System.nanoTime();
        //unzip odfdraft for regression test
        try {
            File odfdraftFile = new File(conversionFolder,"content.ods");
            if (odfdraftFile.exists()) {
                File odfdraftFolder = new File(conversionFolder,"content_ods");
                odfdraftFolder.mkdirs();
                FileUtil.unzip(new FileInputStream(odfdraftFile) , 
                        odfdraftFolder.getAbsolutePath());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("Convert "+ sourceFile+ " to " + conversionFolder);
        System.out.println("Convert Result:" + (ret.isSucceed()?"success":"failed"));
        double ctime = (endtime-begintime)/1000.0/1000.0/1000.0;
        int usedmb = (int) ((Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / 1024/1024);
        System.out.println(sourceFile.getName()+" CL-CONVERTER:Execute Time is " + (Math.round(ctime*10000)/10000.0)+ "s. Peak pageable memory size is " + usedmb + "MB");
    }
    return ret;
  }

}
