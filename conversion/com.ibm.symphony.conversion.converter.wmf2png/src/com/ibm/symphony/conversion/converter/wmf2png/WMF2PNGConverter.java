/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.wmf2png;

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
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.imageio.ImageIO;

import com.ibm.symphony.conversion.converter.emf2png.EMF2PNGConverter;
import com.ibm.symphony.conversion.converter.win32.WinPlatformMetaConvertor;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFInputStream;
import com.ibm.symphony.conversion.converter.wmf2png.wmf.WMFRenderer;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaFileUtil;
import com.ibm.symphony.conversion.convertor.metafile.common.MetaHeader;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class WMF2PNGConverter extends AbstractFormatConverter
{
  private static final String TARGET_FOLDER = "output" + File.separator + "wmf2png";
  
  public static Logger log = Logger.getLogger(WMF2PNGConverter.class.getName());

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

    String targetName = "result.png";
    if( parameters != null && parameters.containsKey("targetName"))
      targetName = (String) parameters.get("targetName");
    
    
    File targetFile = new File(targetFolder.getAbsolutePath() + File.separator + targetName);
    Integer width = null;
    Integer height = null;
    Float scaleRatio = 0.2f;
    if ( parameters != null && parameters.containsKey("width") )
      width = (Integer) parameters.get("width");
    if ( parameters != null && parameters.containsKey("height") )
      height =(Integer) parameters.get("height");
    if ( parameters != null && parameters.containsKey("scaleRatio") )
      scaleRatio = (Float) parameters.get("scaleRatio");
    
    WinPlatformMetaConvertor instance = WinPlatformMetaConvertor.getInstance();
    
    if( instance != null)
    {
      //windows platform, call jni to convert
      boolean rst = false;
      if( width != null && height != null )
      {
        rst = instance.convert(sourceFile.getPath(), targetFile.getPath(), width, height);
      }
      else
      {
        rst = instance.convert(sourceFile.getPath(), targetFile.getPath(), scaleRatio);
      }
      
      result.setSucceed(rst);
      if( rst )
      {
        result.setConvertedFile(targetFile);
      }
      //log.info("Call jni to conert with result: " + rst);
    }
    else
    {
      if( System.getProperty("os.name").toLowerCase().startsWith("win") )
      {
        log.severe("Visual C++ 2010 Redistributable must be installed to support wmf&emf");
        result.setConvertedFile(null);
        result.setSucceed(false);
      }
      else
      {
        //call java
        String format = MetaFileUtil.getFileType(sourceFile);
        log.info("file format:" + format);
  
        if("wmf".equals( format ) )
        {
          convertWMF2PNG(result, sourceFile, targetFile, width, height, scaleRatio);
        }
        else if( "emf".equals( format) )
        {
          EMF2PNGConverter.convert(result, sourceFile, targetFile, width, height, scaleRatio);
        }
        else
        {
          //not wmf file format
          result.setConvertedFile(null);
          result.setSucceed(false);
        }
      }
    }
    
    return result;
  }

  private void convertWMF2PNG(ConversionResult result, File sourceFile, File targetFile, Integer width, Integer height, Float scaleRatio)
  {
    WMFInputStream in = null;
    OutputStream out = null;

    try
    {
      
      in = new WMFInputStream(new BufferedInputStream( new FileInputStream(sourceFile)));
      
      
      WMFRenderer renderer = null;
      if( width != null && height != null )
      {
        renderer = new WMFRenderer(in, width, height);
      }
      else if ( scaleRatio != null )
      {
        renderer = new WMFRenderer(in,scaleRatio);
      }
      else
      {
        renderer = new WMFRenderer(in);
      }
      MetaHeader header = renderer.getHeader();
      BufferedImage image = new BufferedImage((int) (header.getWidth() * renderer.getScaleRatio()), (int) (header.getHeight() * renderer.getScaleRatio()), BufferedImage.TYPE_INT_ARGB);
      Graphics2D g2d = image.createGraphics();
      log.info("rendering wmf.");
      renderer.paint(g2d);
      
      out = new BufferedOutputStream( new FileOutputStream(targetFile) );
      log.info("saving png file: " + targetFile);
      ImageIO.write(image, "png", out);

      result.setConvertedFile(targetFile);
    }
    catch (Exception e)
    {
      log.log(Level.INFO, e.getMessage(),e);
      result.setConvertedFile(null);
      result.setSucceed(false);
      
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
  }
}
