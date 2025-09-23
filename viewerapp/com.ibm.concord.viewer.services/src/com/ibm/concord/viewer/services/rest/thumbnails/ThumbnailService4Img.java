package com.ibm.concord.viewer.services.rest.thumbnails;

import java.awt.Dimension;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

import com.ibm.concord.viewer.config.ThumbnailConfig;
import com.ibm.concord.viewer.platform.repository.RepositoryServiceUtil;
import com.ibm.concord.viewer.serviceability.LoggerUtil;
import com.ibm.concord.viewer.serviceability.ServiceCode;
import com.ibm.concord.viewer.spi.beans.IDocumentEntry;
import com.ibm.concord.viewer.spi.beans.MediaDescriptor;
import com.ibm.concord.viewer.spi.beans.UserBean;
import com.ibm.concord.viewer.spi.exception.RepositoryAccessException;
import com.ibm.concord.viewer.spi.util.FileUtil;
import com.ibm.json.java.JSONObject;

public class ThumbnailService4Img extends ThumbnailService
{

  private static final Logger log = Logger.getLogger(ThumbnailService4Img.class.getName());

  private String fileExt = "";

  private File targetPath = null;

  public ThumbnailService4Img(UserBean user, IDocumentEntry docEntry)
  {
    super(user, docEntry);
  }

  public void exec()
  {
    log.entering(ThumbnailServiceJob4Img.class.getName(), "exec", new Object[] { user.getId(), docEntry.getDocUri() });

    if (isThumbnailsExisted())
    {
      log.log(Level.INFO, "Unneeded thumbnail service request since size.json is found. Doc id: " + docEntry.getDocId());
      return;
    }

    // valid cache existed, do downsize
    generateThumbnails();

    log.exiting(ThumbnailServiceJob4Img.class.getName(), "exec");

  }

  private void generateThumbnails()
  {
    log.entering(ThumbnailService4Img.class.getName(), "generateThumbnails", docEntry.getDocUri());

    if (!aquireLock())
      return;

    StringBuffer msg = new StringBuffer();
    msg.append(ServiceCode.S_INFO_CONVERSION_NEEDED);
    msg.append(" This is for image thumbnail service.");
    msg.append(" Doc id is ").append(docEntry.getDocUri());
    msg.append(" Mime type is ").append(docEntry.getMimeType());
    msg.append(" LastModified is ").append(docEntry.getModified().getTimeInMillis());
    log.log(Level.INFO, LoggerUtil.getLogMessage(ServiceCode.INFO_CONVERSION_NEEDED, msg.toString()));

    try
    {
      File sourceDir = new File(thumbnailServiceCachedDir);
      sourceDir.mkdirs();
      fileExt = "." + docEntry.getExtension();
      File imgSrc = new File(sourceDir, "image" + fileExt);
      if (!imgSrc.exists())
      {
        MediaDescriptor media = RepositoryServiceUtil.download(user, docEntry);
        FileUtil.copyInputStreamToFile(media.getStream(), imgSrc);
      }
      generateThumbnailsImpl(imgSrc);
      imgSrc.delete();
      log.log(Level.INFO, "Image thumbnails were successfully generated in:" + thumbnailServiceCachedDir);
    }
    catch (IOException e)
    {
      log.log(Level.SEVERE, "IOException:" + e.getMessage());
    }
    catch (InterruptedException e)
    {
      log.log(Level.SEVERE, "InterruptedException:" + e.getMessage());
    }
    catch (RepositoryAccessException e)
    {
      log.log(Level.SEVERE, "RepositoryAccessException:" + e.getMessage());
    }
    finally
    {
      releaseLock();
    }

    log.exiting(ThumbnailService4Img.class.getName(), "generateThumbnails");
  }

  private void generateThumbnailsImpl(File srcImg) throws IOException, InterruptedException
  {
    int sHeight = generateSmallThumbnail(srcImg);
    int mHeight = generateMediumThumbnail(srcImg);
    int lHeight = generateLargelThumbnail(srcImg);
    generateSizeJson(new Dimension(100, sHeight), new Dimension(250, mHeight), new Dimension(500, lHeight), fileExt);
  }

  public int generateSmallThumbnail(File next) throws IOException, InterruptedException
  {
    return generateThumbnail(next, ThumbnailConfig.SMALLWIDTH, ThumbnailConfig.SMALLHEIGHT, "ts");
  }

  public int generateMediumThumbnail(File next) throws IOException, InterruptedException
  {
    return generateThumbnail(next, ThumbnailConfig.MEDIUMWIDTH, ThumbnailConfig.MEDIUMHEIGHT, "tm");
  }

  public int generateLargelThumbnail(File next) throws IOException, InterruptedException
  {
    return generateThumbnail(next, ThumbnailConfig.LARGEWIDTH, ThumbnailConfig.LARGEHEIGHT, "tl");
  }

  private int generateThumbnail(File next, int width, int height, String namePrfix) throws IOException, InterruptedException
  {
    String localThumbnail = new File(thumbnailServiceCachedDir, namePrfix + "_" + next.getName()).getAbsolutePath();
    ImageFile image = new ImageFile(next.getAbsolutePath());
    if (image.isCorrupted) // unsupported format
    {
      log.log(Level.INFO, "Unsupported file format:" + next.getCanonicalPath());
      return -1;
    }

    int w = image.getWidth();
    int h = image.getHeight();

    if (w <= 0 || h <= 0) // wrong size
    {
      log.log(Level.INFO, "Image size is wrong:" + next.getCanonicalPath());
      return -1;
    }

    Dimension imgSize = new Dimension(w, h);

    // scale image
    if (w >= h)
    {
      height = (imgSize.width > 0) ? (int) ((width * imgSize.height) / imgSize.width) : width;
      downSize(next.getAbsolutePath(), localThumbnail, null, -1, -1, width, height);
    }
    else
    {
      height = (imgSize.width > 0) ? (int) ((width * imgSize.width) / imgSize.height) : width;
      downSize(next.getAbsolutePath(), localThumbnail, null, -1, -1, height, width);
    }
    log.log(Level.INFO, "Image thumbnail path:" + localThumbnail);

    return height;
  }

  public void downSize(String srcFilePath, String targetFilePath, String formatName, int x, int y, int width, int height)
      throws IOException, InterruptedException
  {
    log.entering(ThumbnailService4Img.class.getName(), "downSize", new Object[] { srcFilePath, targetFilePath });

    if (formatName != null)
    {
      targetFilePath = targetFilePath.substring(0, targetFilePath.lastIndexOf(".") + 1) + formatName;
    }
    else
    {
      formatName = targetFilePath.substring(targetFilePath.lastIndexOf(".") + 1).toLowerCase();
      formatName = formatName.equals("jpg") ? "jpeg" : formatName;
    }

    File targetFile = new File(targetFilePath);

    BufferedImage srcBufImage = ImageIO.read(new File(srcFilePath));
    if (srcBufImage.getWidth() > width || srcBufImage.getHeight() > height)
    {
      if (height < 0)
      {
        height = (int) (srcBufImage.getHeight() * ((double) width / srcBufImage.getWidth()));
      }

      Image thumbnail = srcBufImage.getScaledInstance(width, height, Image.SCALE_SMOOTH);
      BufferedImage bufTarget = null;
      if (formatName.equalsIgnoreCase("jpeg"))
        bufTarget = new BufferedImage(thumbnail.getWidth(null), thumbnail.getHeight(null), BufferedImage.TYPE_INT_RGB);
      else
        bufTarget = new BufferedImage(thumbnail.getWidth(null), thumbnail.getHeight(null), BufferedImage.TYPE_INT_ARGB);
      bufTarget.getGraphics().drawImage(thumbnail, 0, 0, null);
      ImageIO.write(bufTarget, formatName, targetFile);
    }
    else
      ImageIO.write(srcBufImage, formatName, targetFile);

    log.exiting(ThumbnailService4Img.class.getName(), "downSize");
  }

  public void generateSizeJson(Dimension small, Dimension medium, Dimension large, String fileExtension) throws IOException
  {
    OutputStream outputStream = null;

    StringBuffer JSON = new StringBuffer("{\"small\":{\"w\":").append(small.width).append(",\"h\":").append(small.height)
        .append("}, \"medium\":{\"w\":").append(medium.width).append(",\"h\":").append(medium.height).append("},\"large\":{\"w\":")
        .append(large.width).append(",\"h\":").append(large.height).append("}, \"format\":\"").append(fileExt).append("\"}");
    JSONObject sizeJson = JSONObject.parse(JSON.toString());
    try
    {
      File json = new File(thumbnailServiceCachedDir, THUMBNAILS_SIZE_DESCRIPTION);
      outputStream = new FileOutputStream(json);
      sizeJson.serialize(outputStream);
    }
    catch (IOException e)
    {
      log.log(Level.SEVERE, "Error when create size.json  at {0} {1}" + new Object[] { targetPath, e });
      throw e;
    }
    finally
    {
      if (outputStream != null)
      {
        try
        {
          outputStream.close();
        }
        catch (IOException e)
        {
          log.log(Level.WARNING, "Close size.json Failed during Preparation. {0} {1}", new Object[] { sizeJson, e });
          throw e;
        }
      }
    }
  }

  private class ImageFile
  {
    private String fileName;

    private boolean isCorrupted = true;

    private Dimension d = new Dimension(-1, -1);

    public ImageFile(String fn)
    {
      fileName = fn;
      File img = new File(fileName);
      ImageInputStream in = null;
      try
      {
        in = ImageIO.createImageInputStream(img);
        final Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
        if (readers.hasNext())
        {
          ImageReader reader = (ImageReader) readers.next();
          try
          {
            reader.setInput(in);
            d.setSize(new Dimension(reader.getWidth(0), reader.getHeight(0)));

            try
            {
              ImageIO.read(img);
              isCorrupted = false;
            }
            catch (Exception e)
            {
              isCorrupted = true;
            }
          }
          finally
          {
            reader.dispose();
          }
        }
        else
        {
          isCorrupted = true;
        }
      }
      catch (IOException e)
      {
        isCorrupted = true;
      }
      catch (Exception e)
      {
        isCorrupted = true;
      }
      finally
      {
        if (in != null)
        {
          try
          {
            in.close();
          }
          catch (IOException e)
          {
          }
        }
      }
    }

    public int getWidth()
    {
      return (int) d.getWidth();
    }

    public int getHeight()
    {
      return (int) d.getHeight();
    }
  }
}
