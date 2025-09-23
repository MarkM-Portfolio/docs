/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2json;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.conversionlib.ConversionLibManager;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.IFormatConverter;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class ODT2JSONConverter extends AbstractFormatConverter
{
  private static Logger log = Logger.getLogger(ODT2JSONConverter.class.getName());

  private static final String TEMP_OUTPUT_FILE = "tempOutput.json";
  private static final String UPGRADE_VERSION = "upgradeVersion";
  private static final String CONTENT_HTML = "content.html";
  private static final String CONTENT_JSON = "content.json";
  private static final String INIT_SOURCE_MIMETYPE = "initSourceMimeType";
  
  private ConversionResult convert(File sourceFile, File targetFolder, Map parameters, boolean isZip) throws ConversionException
  {
    if(parameters != null && Boolean.valueOf((String)parameters.get(UPGRADE_VERSION)))
    {
      ConversionResult result = doUpgrade(sourceFile, targetFolder, parameters);
      return result;
    }
    
    ConversionResult result = doConvertByCL(sourceFile, targetFolder, parameters);
    File convertedFile = result.getConvertedFile();
    
    if (isZip && convertedFile != null)
    {
      try
      {
        File convertedFolder = convertedFile.getParentFile();
        File targetFile = new File(convertedFolder.getParent(), convertedFolder.getName() + ConversionConstants.SUFFIX_ZIP);
        FileUtil.zipFolder(convertedFolder, targetFile);
        result.setConvertedFile(targetFile);
      }
      catch (IOException e)
      {
        ConversionLogger.log(log, Level.WARNING, "Failed to zip the converted files");
      }
    }
    return result;
  }

  private ConversionResult doConvertByCL(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    ConversionResult result = ConversionLibManager.getInstance().convert(sourceFile, targetFolder, "odt", "json", parameters);

    if (result.isSucceed())
    {
      String targetContentPath = targetFolder.getAbsolutePath() + File.separator + CONTENT_JSON;
      result.setConvertedFilePath(targetContentPath);
    }
    else if (result.getWarnings().size() > 0)
    {
      ConversionWarning warning = result.getWarnings().get(result.getWarnings().size() - 1);
      if (ConversionConstants.ERROR_CONTAIN_SVM_FILE.equals(warning.getFetureID()))
      {
        convertSVM2PNG(targetFolder);
        String targetContentPath = targetFolder.getAbsolutePath() + File.separator + CONTENT_JSON;
        result.getWarnings().remove(warning);
        result.setConvertedFilePath(targetContentPath);
        result.setSucceed(true);
      }
    }
    return result;
  }

  private ConversionResult doUpgrade(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    ConversionResult result = null;
    File contentFile = new File(sourceFile, CONTENT_HTML);
    if(contentFile.exists())
    {
    	//upgrade html first for version equal or earlier than 103
    	File tempFolder1= null;
        String oldVersion = ConvertUtil.readVersionText(new File(sourceFile.getParentFile(), "conversionVersion.txt"));
        parameters.put("curDraftVersion", oldVersion);
        if (oldVersion != null && oldVersion.length() > 0 && ConvertUtil.compareVersion(oldVersion, "1.0.3")<=0)
        {
            tempFolder1= getTempFolder();
            ConversionResult tempResult1 = ConversionService.getInstance().getConverter(ConversionConstants.ODT_MIMETYPE, 
                    ConversionConstants.HTML_MIMETYPE).convert(sourceFile, tempFolder1, parameters);
            if(!tempResult1.isSucceed())
            	return tempResult1;
            
            /*Currently don't need to update current version of html after upgrading. But if there is json version change, it need to be set to the earlier json version. */
         }
        
      if(tempFolder1 != null)
      	sourceFile = tempFolder1;
      File tempFoler = getTempFolder();
      //upgrade from old HTML draft to new JSON draft
      ConversionResult tempResult = ConversionService.getInstance().getConverter(ConversionConstants.HTML_MIMETYPE, 
          ConversionConstants.ODT_MIMETYPE).convert(sourceFile, tempFoler, parameters);
      if(tempResult.isSucceed())
      {
    	String initSourceMimeType = (String) parameters.get(INIT_SOURCE_MIMETYPE);
    	if(ConversionConstants.DOCX_MIMETYPE.equals(initSourceMimeType) || ConversionConstants.DOC_MIMETYPE.equals(initSourceMimeType))
    	{
    	  File flagFile = new File(targetFolder.getParent(), targetFolder.getName()+File.separator+"doc2json");
          try {
        	  flagFile.createNewFile();
    	  } catch (IOException e) {
    	  }
            
          result = doConvertByCL(tempResult.getConvertedFile(), targetFolder, parameters);
            
          flagFile.delete();
    	}
    	else
    		result = doConvertByCL(tempResult.getConvertedFile(), targetFolder, parameters);
      }
      else
      {
        result = new ConversionResult();
        String msg = "Upgrade error - fail to export HTML to ODT, source file: " + sourceFile.getAbsolutePath();
        ConversionLogger.log(log, Level.WARNING, 100, msg);
        ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "",msg);
        result.addWarning(ce);
        result.setSucceed(false);
      }
    }
    else
    {
      contentFile = new File(sourceFile, CONTENT_JSON);
      if(contentFile.exists())
      {
        result = new ConversionResult();
        //TODO: upgrade from old JSON draft to new JSON draft, currently, just copy back
        result = new ConversionResult();
        FileUtil.copyDirectory(sourceFile, targetFolder);
        String targetContentPath = targetFolder.getAbsolutePath() + File.separator + CONTENT_JSON;
        result.setConvertedFilePath(targetContentPath);
      }
      else
      {
        result = new ConversionResult();
        String msg = "Upgrade error - bad source draft, content file does not exist, source file: " + sourceFile.getAbsolutePath();
        ConversionLogger.log(log, Level.WARNING, 100, msg);
        ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, false, "",msg);
        result.addWarning(ce);
        result.setSucceed(false);
      }
    }
    return result;
  }

  private void convertSVM2PNG(File targetFolder) throws ConversionException
  {
    File tempOutputFile = new File(targetFolder, TEMP_OUTPUT_FILE);
    if (tempOutputFile.exists())
    {
      FileInputStream fis = null;
      try
      {
        fis = new FileInputStream(tempOutputFile);
        JSONObject tmpObj = JSONObject.parse(fis);
        JSONObject svmObjs = (JSONObject) tmpObj.get("svm");
        Set<Map.Entry<String, JSONObject>> entries = svmObjs.entrySet();
        Iterator<Entry<String, JSONObject>> iter = entries.iterator();

        IConversionService convSvc = ConversionService.getInstance();
        IFormatConverter converter = convSvc.getConverter(ConversionConstants.SVM_MIMETYPE, ConversionConstants.PNG_MIMETYPE);
        while (iter.hasNext())
        {
          JSONObject svmObj = iter.next().getValue();
          String sourcePath = (String) svmObj.get("source");
          try{
            String targetPath = (String) svmObj.get("target");
            int width = getPTValue((String) svmObj.get("width"));
            int height = getPTValue((String) svmObj.get("height"));
            Map<String, Object> params = new HashMap<String, Object>();
            params.put("width", width);
            params.put("height", height);
            int idx = targetPath.lastIndexOf('/');
            File source = new File(sourcePath);
            File subFolder = new File(targetPath.substring(0, idx));
            params.put("targetName", targetPath.substring(idx));
            ConversionResult rst = converter.convert(source, subFolder, params);
            if (rst.isSucceed())
            {
              if (!source.delete())
              {
                ConversionLogger.log(log, Level.WARNING, "Can not delete file " + source.getAbsolutePath());
              }
            }
            else
            {
              ConversionLogger.log(log, Level.WARNING, "Fail to convert " + source.getAbsolutePath() + " to PNG file");
            }
          } 
          catch( Exception e)
          {
            ConversionLogger.log(log, Level.WARNING, "Can not convert svm file: " + sourcePath);
          }
        }
      }
      catch (FileNotFoundException e)
      {
        ConversionLogger.log(log, Level.WARNING, "Can not find the temp output file: " + tempOutputFile.getAbsolutePath());
      }
      catch (IOException e)
      {
        ConversionLogger.log(log, Level.WARNING, "IOException for parse temp output file: " + tempOutputFile.getAbsolutePath());
      }
      finally
      {
        if (fis != null)
        {
          try
          {
            fis.close();
          }
          catch (IOException e)
          {
            ConversionLogger.log(log, Level.WARNING, "IOException for delete temp output file: " + tempOutputFile.getAbsolutePath());
          }
        }
        if (!tempOutputFile.delete())
        {
          ConversionLogger.log(log, Level.WARNING, "Can not delete temp output file " + tempOutputFile.getAbsolutePath());
        }
      }
    }
    else
    {
      ConversionLogger.log(log, Level.WARNING, "Can not find SVM record file - tempOutput.json");
    }

  }

  private int getPTValue(String strVal)
  {
    strVal = ConvertUtil.convertUnitToPT(strVal);
    strVal = strVal.substring(0, strVal.length() - 2);
    int value = (int) (0.5 + 2 * Double.parseDouble(strVal));
    return value;
  }

  private File getTempFolder()
  {
    IConversionService conversionService = ConversionService.getInstance();
    File tempFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "odt2json"
        + File.separator + "temp" + File.separator + UUID.randomUUID());
    tempFolder.mkdirs();
    return tempFolder;
  }
  
  @SuppressWarnings("rawtypes")
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    return convert(sourceFile, targetFolder, parameters, false);
  }

  @SuppressWarnings("rawtypes")
  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "odt2json"
        + File.separator + UUID.randomUUID());
    targetFolder.mkdirs();
    return convert(sourceFile, targetFolder, parameters, true);
  }

}