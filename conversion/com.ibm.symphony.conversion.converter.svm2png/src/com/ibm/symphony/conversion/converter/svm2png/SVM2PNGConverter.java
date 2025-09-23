/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.svm2png;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import javax.imageio.ImageIO;

import com.ibm.symphony.conversion.converter.svm2png.svm.SVMInputStream;
import com.ibm.symphony.conversion.converter.svm2png.svm.SVMRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaHeader;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class SVM2PNGConverter extends AbstractFormatConverter
{
  private static final String TARGET_FOLDER = "output" + File.separator + "svm2png";
  
  Logger log = Logger.getLogger(SVM2PNGConverter.class.getName());
  
  /**
   * Generate target folder path
   * 
   * @param repositoryPath
   *          -- repository path
   * @param sourceFileName
   *          -- source file name, not used currently
   * @return
   */
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

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    log.info("source: " + sourceFile);
    log.info("target: " + targetFolder );  
    ConversionResult result = new ConversionResult();
    
    String targetName = (String) parameters.get("targetName");
    if(targetName == null)
      targetName = "result.png";
    
    
    File convertedFile = new File(targetFolder.getAbsolutePath() + File.separator + targetName);     
    Integer width =(Integer) parameters.get("width");
    Integer height =(Integer) parameters.get("height");
    Float scaleRatio = (Float) parameters.get("scaleRatio");
    if(width != null && width == 0 || height != null && height == 0)
    {
    	return result;
    }

    SVMInputStream in = null;
    OutputStream out = null;
    try
    {
      in = new SVMInputStream(new BufferedInputStream( new FileInputStream(sourceFile)));
      SVMRenderer renderer = null;
      
      if( width != null && height != null )
      {
        renderer = new SVMRenderer(in, width, height);
      }
      else if ( scaleRatio != null )
      {
        renderer = new SVMRenderer(in,scaleRatio);
      }
      else
      {
        renderer = new SVMRenderer(in);
      }
      
      MetaHeader header = renderer.getHeader();
      BufferedImage image = new BufferedImage((int) (header.getWidth() * renderer.getScaleRatio()), (int) (header.getHeight() * renderer.getScaleRatio()), BufferedImage.TYPE_INT_ARGB);
      Graphics2D g2d = image.createGraphics();
      renderer.paint(g2d);
      out = new BufferedOutputStream( new FileOutputStream(convertedFile) );
      ImageIO.write(image, "png", out);
      result.setConvertedFile(convertedFile);
      
      
    }
    catch (IOException e)
    {
      e.printStackTrace();
      
    }
    finally
    {
      if( in != null)
      {
        try
        {
          in.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
      if( out != null)
      {
        try
        {
          out.close();
        }
        catch (IOException e)
        {
          e.printStackTrace();
        }
      }
    }
    return result;
  }
}
