package com.ibm.symphony.conversion.converter.json2docx;

import java.io.File;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.converter.conversionlib.ConversionLibManager;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class JSON2DOCXConverter extends AbstractFormatConverter {

	private static Logger log = Logger.getLogger(JSON2DOCXConverter.class.getName());

	@Override
	public ConversionResult convert(File sourceFile, Map parameters)
			throws ConversionException {
	    IConversionService conversionService = ConversionService.getInstance();
	    File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "json2docx"
	        + File.separator + UUID.randomUUID());
	    targetFolder.mkdirs();
	    return convert(sourceFile, targetFolder, parameters);
	}

	@Override
	public ConversionResult convert(File sourceFile, File targetFolder,
			Map parameters) throws ConversionException {
	    log.entering(getClass().getName(), "convert", sourceFile.getPath());
	    ConversionResult result = new ConversionResult();
	    
	    try
	    {
	      result = ConversionLibManager.getInstance().convert(sourceFile, targetFolder, "json", "docx", parameters);
	      
	      if(result.isSucceed())
	      {
	          String targetContentPath = targetFolder.getAbsolutePath() + File.separator + "content.docx";
	          File convertedFile = new File(targetContentPath);
	          if(convertedFile.exists())
	        	  result.setConvertedFile(convertedFile);
	          else
	          {
	    	      log.log(Level.SEVERE, "Failed to generate docx document by JSON to DOCX with unknown error. " + sourceFile.getPath());       
	    	      ConversionWarning ce = new ConversionWarning("100", false, "", "Failed to generate docx document by JSON to DOCX with unknow error.");
	    	      result.addWarning(ce);
	    	      result.setSucceed(false);	        	  
	          }
	      }
	    }
	    catch (Exception e)
	    {
	      log.log(Level.SEVERE, "Failed to convert JSON to DOCX:", e);       
	      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
	      result.addWarning(ce);
	      result.setSucceed(false);
	    }
	    finally
	    {
	      
	    }

	    log.exiting(getClass().getName(), "convert");
	    return result;
	  
	}

}
