/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.emf2png;


import java.io.File;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

//import org.freehep.graphicsio.emf.EMFInputStream;
//import org.freehep.graphicsio.emf.EMFRenderer;
//import org.freehep.graphicsio.emf.EMFTagSet;
//import org.freehep.util.export.ExportFileType;

import com.ibm.symphony.conversion.converter.libre.LibreManager;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;

public class EMF2PNGConverter
{
  public static Logger log = Logger.getLogger(EMF2PNGConverter.class.getName());
  
  public static void convert(ConversionResult result, File sourceFile, File targetFile, Integer width, Integer height, Float scaleRatio)
  {
    try
    {
      HashMap<String, Object> parameters = new HashMap<String, Object>();
      parameters.put("graphicwidth", ""+width);
      parameters.put("height", ""+height);
      parameters.put("scaleRatio", ""+scaleRatio);
      parameters.put("real_target_folder", targetFile.getParentFile().getAbsolutePath());
   //   parameters.put("thumbnailFolder", targetFile.getParentFile().getAbsolutePath());
      parameters.put("skipDownsize", "true");
      parameters.put("skipThumbnail", "true");
      String picName = targetFile.getName();
      parameters.put("title", picName.substring(0, picName.lastIndexOf(".")));

      result = LibreManager.getInstance().convert(sourceFile, targetFile.getParentFile(), parameters);
  
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "Failed to convert EMF to PNG:", e);       
      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
  }

//  public static void convert(ConversionResult result, File sourceFile, File targetFile, Integer width, Integer height, Float scaleRatio)
//  {
    /*
    WMF2PNGConverter.log.info("Convert EMF with freehep");
    EMFInputStream in = null;
    OutputStream out = null;
    try
    {
      EMFTagSet tagSet = new EMFTagSet(EMFInputStream.DEFAULT_VERSION);
      tagSet.addTag( new ExtCreatePen() );
      in = new EMFInputStream(   new FileInputStream( sourceFile ), tagSet );
      EMFRenderer renderer = new EMFRenderer( in );
      Dimension size = renderer.getSize();
      if( width != null && height != null )
      {
        scaleRatio = Math.min( (float) width / size.width, (float) height/size.height);
      }
      else if( scaleRatio == null)
      {
        scaleRatio = 1.0f;
      }
      
      
      BufferedImage image = new BufferedImage( (int) (size.width * scaleRatio) , (int) (size.height * scaleRatio), BufferedImage.TYPE_INT_ARGB);
      Graphics2D g2d = image.createGraphics();
      WMF2PNGConverter.log.info("rendering emf.");
      
      AffineTransform at = g2d.getTransform();
      
      g2d.scale(scaleRatio.doubleValue(), scaleRatio.doubleValue());
      renderer.paint(g2d);
      g2d.setTransform(at);
      
      out = new BufferedOutputStream(new FileOutputStream(targetFile));
      ImageIO.write(image, "png", out);
      
    }
    catch ( Exception e)
    {
      WMF2PNGConverter.log.log(Level.INFO, e.getMessage(), e);  
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
    */
//  }

}
