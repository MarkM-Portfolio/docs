/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.image;

import java.awt.Image;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.awt.image.BufferedImage;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.Future;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.imageio.ImageIO;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.text.OdfTextListLevelStyleImage;
import org.odftoolkit.odfdom.dom.OdfNamespaceNames;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.ODPMetaFile;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.presentation.importodf.html.content.DrawImageElementConvertor;
import com.ibm.symphony.conversion.presentation.PerformanceAnalysis;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.IConvertor;

public class ODPImageConvertor implements IConvertor
{
  private static final String CLASS = ODPImageConvertor.class.getName();

  private static final Logger LOG = Logger.getLogger(CLASS);
  
  public static final ODPImageConvertor SINGLETON = new ODPImageConvertor();

  public void convert(ConversionContext context, Object input, Object output)
  {
    long start = System.currentTimeMillis();
    LOG.fine("Presentation initial image handling starts");

    OdfDocument odfDoc = (OdfDocument) input;
    String targetPath = (String) output;
    extractImage(context, odfDoc, targetPath);
    submitBulletConversionTask(context, odfDoc, targetPath + File.separator + ODPConvertConstants.FILE_PICTURE_PREFIX);

    if (PresentationConfig.isDebugGraphics())
    {
      long end = System.currentTimeMillis();
      LOG.info("Presentation initial image handling ends in " + (end - start) + " ms");
    }
  }

  private void extractImage(ConversionContext context, OdfDocument odf, String targetPath)
  {
    long start = System.currentTimeMillis();
    LOG.fine("Presentation image extraction starts");

    try
    {
      OdfPackage odfPackage = odf.getPackage();
      /**
       * Defect:31225: Conversion of the sample file failed There's a bug in OdfPackage.class of ODFToolkit. there's a nullpointerException
       * can't be catch in the getManifestEntries() function which get the folder defined in manifest.xml when the folder doesn't exist the
       * getManifestEntries() function will return null. So I move the odfPackage.getFileEntries() statement into inner Try...Catch to let
       * the convert go on.
       * 
       * The codes as below:
       * 
       * 
       */
      Set<String> files = odfPackage.getFileEntries();

      // Copy the images from the Picture folder
      File pictureDir = new File(targetPath + File.separator + ODPConvertConstants.FILE_PICTURE_PREFIX);
      copyImages(context, odfPackage, files, pictureDir, ODPConvertConstants.FILE_PICTURE_START_PREFIX);
      //D41035: Failed to edit this ODP file due to "java.lang.NullPointerException".
      //ODF 1.1, use media folder to store image.
      // Copy the images from the Media folder
      File mediaDir = new File(targetPath + File.separator + ODPConvertConstants.FILE_MEDIA_PREFIX);
      copyImages(context, odfPackage, files, mediaDir, ODPConvertConstants.FILE_MEDIA_START_PREFIX);

      // If there are object replacement images, extract them to the object replacement folder
      File objectReplacementDir = new File(targetPath + File.separator + ODPConvertConstants.FILE_OBJECT_REPLACEMENTS_FOLDER);
      copyImages(context, odfPackage, files, objectReplacementDir, ODPConvertConstants.FILE_OBJECT_REPLACEMENT_START_PREFIX);
    }
    catch (NullPointerException e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".extractImage");
      ODPCommonUtil.logException(context, Level.WARNING, message, e);
    }

    if (PresentationConfig.isDebugGraphics())
    {
      long end = System.currentTimeMillis();
      LOG.info("Presentation image extraction ends in " + (end - start) + " ms");
    }
  }

  private static ConversionWarning convertBulletImage(ConversionContext context, OdfDocument odfDoc, String targetImgDir,
      ArrayList<String> bulletImgPathSet)
  {
    ConversionWarning cw = null; // Default to success
    long start = System.currentTimeMillis();
    LOG.fine("Presentation image bullet conversion starts");

    Iterator<String> itrBullet = bulletImgPathSet.iterator();
    while (itrBullet.hasNext())
    {
      String currImgPath = (String) itrBullet.next();
      if (currImgPath == null || currImgPath.indexOf(ODPConvertConstants.FILE_SUFFIX_SVM) >= 0
          || currImgPath.indexOf(ODPConvertConstants.FILE_SUFFIX_WMF) >= 0 || currImgPath.indexOf(ODPConvertConstants.SYMBOL_DOT) < 0
          || currImgPath.endsWith(ODPConvertConstants.FILE_RESOURCE_SEPARATOR))
        continue;
      String currImgName = currImgPath.substring(currImgPath.indexOf(ODPConvertConstants.FILE_RESOURCE_SEPARATOR) + 1);
      if (currImgName.indexOf(ODPConvertConstants.FILE_RESOURCE_SEPARATOR) > 0)
        continue;
      String targetImg = targetImgDir + ODPConvertConstants.FILE_RESOURCE_SEPARATOR + currImgName;
      File imgFile = new File(targetImg);

      InputStream imginputStr = null;
      BufferedOutputStream imgOutputStr = null;
      try
      {
        if (!imgFile.exists()) // Only copy if the file isn't already there. Most/all should have been copied by extractImage()
        {
          imgFile.createNewFile();
          OdfPackage odfPack = odfDoc.getPackage();
          imginputStr = odfPack.getInputStream(currImgPath);
          imgOutputStr = new BufferedOutputStream(new FileOutputStream(targetImg));
          if (imginputStr == null)
          {
            continue;
          }
          int i;
          while ((i = imginputStr.read()) != -1)
          {
            imgOutputStr.write(i);
          }
        }

        createThumbnail(targetImgDir, currImgName, targetImgDir);
      }
      catch (Exception e)
      {
        ODPCommonUtil.handleException(e, context, "convertBulletImage");
      }
      finally
      {
        ODPMetaFile.closeResource(imgOutputStr);
        ODPMetaFile.closeResource(imginputStr);
      }
    }

    long end = System.currentTimeMillis();
    PerformanceAnalysis.recordBulletImageConversionTime(context, (end - start));
    return cw;
  }

  /**
   * Create addition images for IE8. This includes a small image (5x5) of the bullet. This is needed for the IE8 slide sorter since IE8
   * doesn't allow for resizing of images. The name of the smaller image is ODPConvertConstants.IMAGE_SUFFIX_SLIDESORTER added to the end of
   * the file name. e.g. "myImage.ss.gif"
   * 
   * In addition, create a fixed (16x16) version of the images for use in the IE8 slide editor panel. The name of this fixed size image is
   * ODPConvertConstants.IMAGE_SUFFIX_SLIDEEDITOR added to the end of the file name. e.g. "myImage.se.gif"
   * 
   * @param fromdir
   *          - name of dir to copy the image from
   * @param imgfile
   *          - file name of the image to reduce
   * @param todir
   *          - name of the dir to copy the image to
   * 
   */
  public static void createThumbnail(String fromdir, String imgfile, String todir) throws Exception
  {
    final int scaleSizeSS = 5, scaleSizeSE = 16;
    double scaleSizeSS_d = new Double(scaleSizeSS); // IE8 Slide Sorter size
    double scaleSizeSE_d = new Double(scaleSizeSE); // IE8 Slide Editor size
    double Ratio = 0.0;

    File file = new File(fromdir, imgfile);

    // new image file name has "ss" added to the image name for the IE slidesorter problem (e.g. myImage.ss.gif)
    int period = imgfile.lastIndexOf(".");
    String newImgFName = imgfile.substring(0, period) + ODPConvertConstants.IMAGE_SUFFIX_SLIDESORTER + imgfile.substring(period);
    File ThFile = new File(todir, newImgFName);

    BufferedImage Bi = ImageIO.read(file);
    if (Bi == null)
    {
      return; // TODO: this function is for IE8, thus could be @deprecated in future
    }

    // set max width height for slide sorter
    Image Itemp = Bi.getScaledInstance(scaleSizeSS, scaleSizeSS, Image.SCALE_SMOOTH);
    if ((Bi.getHeight() > scaleSizeSS) || (Bi.getWidth() > scaleSizeSS))
    { // Scale down using the largest dimension
      if (Bi.getHeight() > Bi.getWidth())
        Ratio = scaleSizeSS_d / Bi.getHeight();
      else
        Ratio = scaleSizeSS_d / Bi.getWidth();
    }
    else
    // Scale up using the smallest dimension
    {
      if (Bi.getHeight() > Bi.getWidth())
        Ratio = scaleSizeSS_d / Bi.getWidth();
      else
        Ratio = scaleSizeSS_d / Bi.getHeight();
    }
    AffineTransformOp op = new AffineTransformOp(AffineTransform.getScaleInstance(Ratio, Ratio), null);
    Itemp = op.filter(Bi, null);
    try
    {
      ImageIO.write((BufferedImage) Itemp, ODPConvertConstants.FILE_PNG, ThFile);
    }
    catch (Exception e)
    {
      ODPCommonUtil.logException(Level.WARNING, ODPCommonUtil.LOG_ERROR_BULLET_IMAGE, e);
      throw new Exception(ODPCommonUtil.LOG_ERROR_BULLET_IMAGE);
    }

    // Now make the IE slideeditor version
    Ratio = 0.0;
    newImgFName = imgfile.substring(0, period) + ODPConvertConstants.IMAGE_SUFFIX_SLIDEEDITOR + imgfile.substring(period);
    ThFile = new File(todir, newImgFName);
    Itemp = Bi.getScaledInstance(scaleSizeSE, scaleSizeSE, Image.SCALE_SMOOTH);
    if ((Bi.getHeight() > scaleSizeSE) || (Bi.getWidth() > scaleSizeSE))
    { // Scale down using the largest dimension
      if (Bi.getHeight() > Bi.getWidth())
        Ratio = scaleSizeSE_d / Bi.getHeight();
      else
        Ratio = scaleSizeSE_d / Bi.getWidth();
    }
    else
    // Scale up using the smallest dimension
    {
      if (Bi.getHeight() > Bi.getWidth())
        Ratio = scaleSizeSE_d / Bi.getWidth();
      else
        Ratio = scaleSizeSE_d / Bi.getHeight();
    }
    op = new AffineTransformOp(AffineTransform.getScaleInstance(Ratio, Ratio), null);
    Itemp = op.filter(Bi, null);
    try
    {
      ImageIO.write((BufferedImage) Itemp, ODPConvertConstants.FILE_PNG, ThFile);
    }
    catch (Exception e)
    {
      ODPCommonUtil.logException(ODPCommonUtil.LOG_ERROR_BULLET_IMAGE, e);
      throw new Exception(ODPCommonUtil.LOG_ERROR_BULLET_IMAGE);
    }
  }

  @SuppressWarnings("restriction")
  private static ArrayList<String> getBulletImagePathSet(OdfDocument odfDoc)
  {
    ArrayList<String> imageList = new ArrayList<String>();
    try
    {
      NodeList ImageNodes = odfDoc.getContentDom().getElementsByTagNameNS(OdfNamespaceNames.TEXT.getUri(),
          ODPConvertConstants.ODF_ATTR_LIST_LEVEL_STYLE_IMAGE);
      addBulletImageToList(ImageNodes, imageList);
    }
    catch (Exception ex)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".getBulletImagePathSet");
      ODPCommonUtil.logException(Level.WARNING, message, ex);
    }
    return imageList;
  }

  private static void addBulletImageToList(NodeList imageNodes, ArrayList<String> imageList)
  {
    for (int i = 0; i < imageNodes.getLength(); i++)
    {
      OdfTextListLevelStyleImage image = (OdfTextListLevelStyleImage) imageNodes.item(i);

      if (image.getXlinkActuateAttribute() != null)
      {
        String imageName = image.getXlinkHrefAttribute();
        if (!imageList.contains(imageName))
          imageList.add(imageName);
      }
    }
  }

  /**
   * Copy the image from the source file specified to the draft/Pictures dir
   * 
   * @param imageName
   *          - name of image to be copied
   * @param context
   *          - the current conversion context
   * @return boolean True if successful
   */
  public static boolean copyImage(ConversionContext context, String imageName)
  {
    boolean success = false;
    try
    {
      String BULLETLIST_IMAGES_RESOURCE_DIRECTORY = "resource/images/";
      String imageResourcePath = BULLETLIST_IMAGES_RESOURCE_DIRECTORY + imageName;
      InputStream input =
          ODPImageConvertor.class.getClassLoader().getResourceAsStream(imageResourcePath);
      if (input == null)
      {
    	  return success;
      }

      String targetPicturesPath =
        (String) context.get(ODPConvertConstants.CONTEXT_TARGET_BASE)
        + File.separator + ODPConvertConstants.FILE_PICTURE_START_PREFIX
        + imageName;
      File outputPic = new File(targetPicturesPath);
      if (outputPic.exists())
      {
    	  success = true;
    	  return success;
      }

      FileOutputStream output =
        new FileOutputStream(targetPicturesPath);
      int i = 0;
      while (i != -1)
      {
        i = input.read();
        output.write(i);
      }

      input.close();
      output.close();

      success = true;
    } catch (FileNotFoundException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } catch (NullPointerException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

    return success;
  }

  /**
   * Copy images matching the prefix into the target directory. Note: it is expected that the targetDir does not exist and thus it is
   * created in this method. In addition, if the imagePrefix is for the /Pictures directory, the images will be counted as they are copied.
   * 
   * @param context
   *          - the current conversion context
   * @param odfPackage
   *          - package containing the image files
   * @param files
   *          - list of files containing candidates for copy
   * @param targetDir
   *          - the directory to copy the images to
   * @param imagePrefix
   *          - the prefix to match for the files to copy to the target directory
   */
  private void copyImages(ConversionContext context, OdfPackage odfPackage, Set<String> files, File targetDir, String imagePrefix)
  {
    if (!targetDir.exists()) {
      targetDir.mkdirs(); // if Pictures dir is missing, create it
    }

    // if Pictures dir is already existing, go on
    if (targetDir.exists() && targetDir.isDirectory())
    {
      byte[] buf = new byte[4096];
      Iterator<String> fileList = files.iterator();
      boolean countPrefixMatch = imagePrefix.equals(ODPConvertConstants.FILE_PICTURE_START_PREFIX);
      int matchCount = 0;
      while (fileList.hasNext())
      {
        String file = fileList.next();
        if (file.length() > imagePrefix.length() && file.startsWith(imagePrefix))
        {
          InputStream in = null;
          OutputStream out = null;
          try
          {
            in = odfPackage.getInputStream(file);

            if (in == null)
            {
              String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ERROR_OPENING_FILE_ODF, file);
              ODPCommonUtil.logMessage(Level.WARNING, message);
            }
            else
            {

              String targetFileName = targetDir.getAbsolutePath() + File.separator + new File(file).getName();
              out = new BufferedOutputStream(new FileOutputStream(targetFileName));

              if (LOG.isLoggable(Level.FINE))
              {
                LOG.fine(file + " will be copied to " + targetFileName);
              }

              int len = 0;
              while ((len = in.read(buf)) > 0)
              {
                out.write(buf, 0, len);
              }
              if (countPrefixMatch)
              {
                // Count those images which will not be converted during the initial copy. The remainder of the
                // images will be counted as they are converted in DrawImageElementConvertor.
                String extName = file.substring(file.lastIndexOf(ODPConvertConstants.SYMBOL_DOT) + 1).toLowerCase();
                if (DrawImageElementConvertor.noCvtFormats.contains(extName))
                  ++matchCount;
              }
            }
          }
          catch (Exception e)
          {
            String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".copyImages");
            ODPCommonUtil.logException(context, Level.WARNING, message, e);
          }
          finally
          {
            ODPMetaFile.closeResource(in);
            ODPMetaFile.closeResource(out);
          }
          // Remove the file so it no longer is checked on subsequent invocations of this method
          //fileList.remove();
        }
        if (LOG.isLoggable(Level.FINE))
        {
          LOG.fine(file + " will not be copied");
        }
      }
      // Check Graphic Limit - This will throw a LimitExceededException if the limit is exceeded. The ODP2HTMLConvertor will handle it.
      if (matchCount > 0)
        PresentationConfig.incrementGraphicCount(context, matchCount);
    }
  }

  /**
   * Submit the bullet image conversion methods as a separate asynchronous thread since the images aren't required by any other part of
   * import.
   * 
   * @param context
   *          - the current conversion context
   * @param odfDoc
   *          - the OdfDocument
   * @param targetImgDir
   *          - the directory to create the bullet images in
   */
  private void submitBulletConversionTask(final ConversionContext context, final OdfDocument odfDoc, final String targetImgDir)
  {

    final Future<?> future = context.getTask("BulletConversion");

    if (future == null)
    {
      final ArrayList<String> bulletImgPathSet = getBulletImagePathSet(odfDoc);
      if (!bulletImgPathSet.isEmpty())
      {
        LOG.fine("Bullet images to convert - setup callable");
        Callable<ConversionWarning> task = new Callable<ConversionWarning>()
        {
          public ConversionWarning call()
          {

            ConversionWarning cw = null;
            try
            {
              cw = convertBulletImage(context, odfDoc, targetImgDir, bulletImgPathSet);
            }
            catch (Throwable th)
            {
              cw = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, true, th.getLocalizedMessage(),
                  "Error invoking conversion task");
            }

            if (cw != null) // Add the warning to the ConversionResult in the context
            {
              ODPCommonUtil.addConversionError(context, cw);
              return cw;
            }

            return new ConversionWarning(); // Return an empty conversion warning
          }
        };

        context.addTask("BulletConversion", task);
      }
    }
    else
    {
      ConversionWarning cw = null;
      try
      {
        cw = (ConversionWarning) future.get();
      }
      catch (Exception e)
      {
        cw = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, true, e.getLocalizedMessage(),
            "Error retrieving results from conversion task");
      }
      if (cw != null && cw.getDescription() != null && cw.getDescription().length() > 0)
      {
        LOG.warning(cw.getDescription());
      }
    }
  }
}
