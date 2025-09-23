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
import java.util.Map;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.outsideinsdk.ExportProperties;
import com.outsideinsdk.ExportStatusCode;


public class LibreConverter
{
  private static final Logger log = Logger.getLogger(LibreConverter.class.getName());
  
  private LibreManager libreMgr = null;

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters, LibreManager smg)
  {
    this.libreMgr = smg;
    return convert(sourceFile, targetFolder, parameters);
  }

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters)
  {
    log.log(Level.INFO, "STJOB start to convert "+sourceFile+".");
    int retryCount=0;
    ConversionResult result = null;

    try {
      result = convertInternal(sourceFile, targetFolder, parameters);
      while(retryCount<5&&result==null)
      {
        targetFolder.mkdirs();
        retryCount++;
        log.log(Level.INFO, "STJOB failed to create files in the targetFolder.Libre have tried "+retryCount+" times while convert "+sourceFile);
        try
        {
          Thread.sleep(200);
        }
        catch (InterruptedException e)
        {
        }
        result=convertInternal(sourceFile, targetFolder, parameters);
      }
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "STJOB conversion failed when convert "+sourceFile+" , here is the error message:", e);
      result = new ConversionResult(); 
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
      
      // DONT forget to free libre instance
      libreMgr.notifyNext();
    }

    if(result==null)
    {
      result = new ConversionResult();
      log.log(Level.SEVERE, "STJOB conversion failed after "+retryCount+" times while convert "+sourceFile);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", "create file error,maybe network error");
      result.addWarning(ce);
      result.setSucceed(false);
    }
    return result;
  }
  public ConversionResult convertInternal(File sourceFile, File targetFolder, Map parameters) throws Exception
  {
    ConversionResult result = new ConversionResult();
    Properties configProps = new Properties();
    configProps.putAll(LibreManager.getInstance().getConfig());
    configProps.remove(Constants.INPUTPATHKEY);
    configProps.remove(Constants.OUTPUTPATHKEY);
    String picName = (String) parameters.remove("title");
    configProps.putAll(parameters);
    Object gwidth = parameters.get("graphicwidth");
    if (gwidth != null)
      configProps.setProperty(ExportProperties.GRAPHICWIDTHLIMIT, (String)gwidth);
    Object gheight = parameters.get("graphicheight");
    if (gheight != null)
      configProps.setProperty(ExportProperties.GRAPHICHEIGHTLIMIT, (String)gheight);
    String oid = configProps.getProperty(Constants.OUTPUTIDKEY);
    String ext = "." + oid.substring(3).toLowerCase();
    if(ext.equals(".jpeg"))
      ext=".jpg";
    String prefix = picName != null ? picName : "image";
    String ofn = targetFolder + File.separator + prefix + ext;
    String exePath=configProps.getProperty(ExportProperties.EXEPATH);
    long timeout=LibreManager.getInstance().getTimeout();
    // Export exportor = new Export(configProps);
    String realTargetFolder = parameters.remove("real_target_folder").toString();
    configProps.remove("real_target_folder");
    configProps.remove("filePath");
//      configProps.remove("sourceMIMEType");
    configProps.remove("targetMIMEType");
    configProps.remove("targetFolder");
    configProps.remove("nfsTargetFolder");
    configProps.remove("background");
    LibreExport exportor = new LibreExport(targetFolder, new File(realTargetFolder), prefix, ext, configProps, libreMgr);
    long start = System.currentTimeMillis();
    ExportStatusCode res = exportor.export(sourceFile.toString(), ofn, oid, exePath, timeout);
    long end = System.currentTimeMillis();
    log.log(Level.FINE, "STJOB conversion cost " + (end - start) + "ms and the sourcefile is "+sourceFile);
    if (res.getCode() == ExportStatusCode.SCCERR_OK.getCode())
    {
      result.setSucceed(true);
      result.setConvertedFile(targetFolder);
      log.log(Level.INFO, "STJOB converted successfully with "+sourceFile);
      return result;
    }
    else if (res.getCode() == ExportStatusCode.SCCERR_PROTECTEDFILE.getCode())
    {
      log.log(Level.SEVERE, "STJOB conversion failed when convert "+sourceFile+",as the sourcefile is encrypted or password protected." + " Target folder, " + realTargetFolder);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_INVALID_FILE_PASSWORD, false, "", res.toString());
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
    else if (res.getCode() == ExportStatusCode.SCCERR_JAVA_TIMEDOUT.getCode())
    {
      log.log(Level.SEVERE, "STJOB conversion failed when convert "+sourceFile+",as libre process timeout( "+timeout+"ms)."  + " Target folder, " + realTargetFolder);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_WORK_MANAGER_OVERTIME, false, "", res.toString());
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
    else if (res.getCode() == ExportStatusCode.SCCERR_JAVA_INTERRUPTED.getCode())
    {
      log.log(Level.SEVERE, "STJOB was canceled and the libre process was interrupted when convert "+sourceFile  + " Target folder, " + realTargetFolder);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_WORK_MANAGER_OVERTIME, false, "", res.toString());
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
    else if (res.getCode() == ExportStatusCode.SCCERR_FILECREATE.getCode())
    {
      log.log(Level.SEVERE, "STJOB conversion failed when convert "+sourceFile+",because libre failed to create files in target folder." + " Target folder, " + realTargetFolder);
      return null;
    }
    else if (res.getCode() == ExportStatusCode.SCCERR_JAVA_IO_ERROR.getCode())
    {
      log.log(Level.SEVERE, "STJOB conversion failed when convert "+sourceFile+",because of IO exception" + " Target folder, " + realTargetFolder);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_IO_EXCEPTION, false, "", res.toString());
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
    else if (res.getCode() == ExportStatusCodeEx.SCCERR_SINGPAGE_TIMEUP.getCode())
    {
      log.log(Level.SEVERE, "STJOB conversion failed when convert "+sourceFile+",because of single page conversion times out" + " Target folder, " + realTargetFolder);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_SINGLE_PAGE_OVERTIME, false, "", res.toString());
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
    else if (res.getCode() == ExportStatusCodeEx.SCCERR_DOWNSIZE_ERROR.getCode())
    {
      log.log(Level.SEVERE, "STJOB conversion failed when convert "+sourceFile+",because of downsize exception occurred" + " Target folder, " + realTargetFolder);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_DOWNSIZE_ERROR, false, "", res.toString());
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
    else if (res.getCode() == ExportStatusCode.SCCERR_EMPTYFILE.getCode())
    {
      log.log(Level.SEVERE, "STJOB conversion failed when convert "+sourceFile+",because source file is an empty file" + " Target folder, " + realTargetFolder);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_EMPTY_FILE_ERROR, false, "", res.toString());
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
    else if (res.getCode() == ExportStatusCode.SCCERR_BADFILE.getCode())
    {
      log.log(Level.SEVERE, "STJOB conversion failed when convert "+sourceFile+",because source file is an corrupted file" + " Target folder, " + realTargetFolder);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_CORRUPTED_FILE_ERROR, false, "", res.toString());
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
    else
    {
      String errMsg = "unexpected libre internal error,"+res.toString();
      log.log(Level.SEVERE, "STJOB conversion failed when convert "+sourceFile+" , here is the error message:"+errMsg);
      ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "", errMsg);
      result.addWarning(ce);
      result.setSucceed(false);
      return result;
    }
  }
}
