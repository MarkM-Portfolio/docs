/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.svg2png;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.shape2image.TranscoderService;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class SVG2PNGConverter extends AbstractFormatConverter
{
  private static final Logger LOG = Logger.getLogger(SVG2PNGConverter.class.getName());
  
  private static final String TARGET_FOLDER = "output" + File.separator + "svg2png";
  
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters)
  {
	  LOG.info("source: " + sourceFile);
	  LOG.info("target: " + targetFolder );  
	  ConversionResult result = new ConversionResult();
	  
	  if (!targetFolder.exists())
	  {
	      targetFolder.mkdirs();
	  }
	  
	  String targetName = null;
	  if(parameters!=null)
		  targetName = (String) parameters.get("targetName");
	  
	  if(targetName == null)
	      targetName = "result.png";
	  
	  File convertedFile = new File(targetFolder.getAbsolutePath() + File.separator + targetName);  
	  try 
	  {
		TranscoderService transcoder = new TranscoderService();
		  
		OutputStream os = new BufferedOutputStream( new FileOutputStream(convertedFile));
		String svg = null;
		if(parameters!=null)
			svg = (String)parameters.get("svg");
		
		if(svg!=null)
			transcoder.convertSVG2PNG(svg, os);
		else
		{
			InputStream in = new FileInputStream(sourceFile);
			transcoder.convertSVG2PNG(in, os);
		}
		
		result.setConvertedFile(convertedFile);
		result.setSucceed(true);
	  } 
	  catch (Exception e) 
	  {
		LOG.log(Level.WARNING, e.getMessage());
		result.setSucceed(false);
	  }
	  return result;
  }
  private String generateTargetFolderPath(String repositoryPath, String sourceFileName)
  {
    File targetFolder = new File(repositoryPath + File.separator + TARGET_FOLDER + File.separator + UUID.randomUUID());
    if (!targetFolder.exists())
    {
      targetFolder.mkdirs();
    }
    return targetFolder.getPath();
  }

  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    String targetFolderPath = generateTargetFolderPath(conversionService.getRepositoryPath(), sourceFile.getName());
    return convert(sourceFile, new File(targetFolderPath), parameters);
  }
}
