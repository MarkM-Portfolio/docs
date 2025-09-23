/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2001, 2021                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.libre;

import java.awt.Dimension;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Enumeration;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.Set;
import java.util.List;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.libre.ExportStatusCodeEx;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.impl.ConversionService;
import com.ibm.symphony.conversion.service.common.util.EncodingUtil;
import com.ibm.symphony.conversion.service.common.util.NFSFileUtil;
import com.outsideinsdk.ExportProperties;
import com.outsideinsdk.ExportStatusCode;

import com.sun.star.beans.PropertyValue;

import com.sun.star.uno.XComponentContext;
import ooo.connector.BootstrapSocketConnector;
import com.sun.star.drawing.XDrawPages;
import com.sun.star.drawing.XDrawPagesSupplier;
import com.sun.star.frame.*;
import com.sun.star.lang.XComponent;
import com.sun.star.lang.XMultiComponentFactory;
import com.sun.star.sdbc.SQLException;
import com.sun.star.sdbc.XCloseable;
import com.sun.star.text.XTextDocument;
import com.sun.star.uno.UnoRuntime;
import com.sun.star.uno.XComponentContext;
import ooo.connector.server.OOoServer;

public class LibreExport
{

  /**
   * Constant strings containing the keys for the required command line parameters.
   */
	
  private String[] execParams = new String[4];

  private boolean unix = true;

  private File tempTargetFolder = null;

  private File realTargetFolder = null;

  private String filePrefix = "";

  private String fileExt = "";

  private int currentIndexCopied = -1;

  private static final Logger log = Logger.getLogger(LibreExport.class.getName());

  private static final String CLASS_NAME = LibreExport.class.getName();

  private LibreManager libreMgr;

  private ExportStatusCode statusCode = null;

  private String thumbnailDir = null;

  private static String FULLIMAGE_DIR = "pictures";

  private static String THUMBNAIL_DIR = "thumbnails";

  private static final String THUMBNAIL_WIDTH_KEY = "thumbnailwidth";

  private static int THUMBNAIL_WIDTH = 300;

  private boolean skipDownsize = false;

  private boolean skipThumbnail = false;

  private ThumbnailConverter thumbnailConverter = null;

  private void init(File tempTarget, File realTarget, String prefix, String ext)
  {
	log.entering(CLASS_NAME, "init", new Object[] { tempTarget.getAbsolutePath(), realTarget.getAbsolutePath(), prefix, ext });

    if (System.getProperty("os.name").startsWith("Windows") == true)
    {
      unix = false;
    }
    else
    {
      unix = true;
    }

    tempTargetFolder = tempTarget;
    realTargetFolder = realTarget;
    filePrefix = prefix;
    fileExt = ext;

    log.exiting(CLASS_NAME, "init");
  }

  public LibreExport(File tempTarget, File realTarget, String prefix, String ext, Properties properties, LibreManager libreMgr)
  {
    init(tempTarget, realTarget, prefix, ext);
    this.libreMgr = libreMgr;
    skipThumbnail = Boolean.valueOf((String) properties.remove("skipThumbnail")).booleanValue();
    if (!skipThumbnail)
      this.thumbnailConverter = new ThumbnailConverter(tempTarget, prefix, ext, properties);
    setProperties(properties);
  }

  private void setProperties(Properties properties)
  {
    String thumbnailWidth = (String) properties.remove(THUMBNAIL_WIDTH_KEY);
    if (thumbnailWidth != null)
    {
      THUMBNAIL_WIDTH = Integer.parseInt(thumbnailWidth);
      log.fine("Using passed thumbnail width: " + THUMBNAIL_WIDTH);
    }
    else
    {
      log.fine("Using default thumbnail width: " + THUMBNAIL_WIDTH);
    }

    String srcMIME = (String) properties.remove("sourceMIMEType");
    String downSize = (String) properties.remove("skipDownsize");
    if (Util.isSpreadSheetFile(srcMIME) || Boolean.valueOf(downSize).booleanValue())
    {
      skipDownsize = true;
    }
    parseProperties(properties);
  }

  private boolean libreExport(String inputPath, String outputPath) {
	  log.entering(LibreExport.class.getName(), "libreExport");
    try {
      // Create random port no to connect to oooServer	
      Random rnd = new Random();
	  int portNo = rnd. nextInt(9999);
      String oooAcceptOption = "--accept=socket,host=localhost,port="+portNo+";urp;";
		
      String librePathProp = System.getProperty("os.name").contains("Linux")?"libreOffice":"libreOfficeWin";
      JSONObject st = (JSONObject) ConversionService.getInstance().getConfig(librePathProp);
      String libreOfficeExeFolder = st.get("path").toString();
		
	  List<String> oooOptions = OOoServer.getDefaultOOoOptions();
      oooOptions.add("-env:UserInstallation=file://" + new File(outputPath).getParentFile().getAbsolutePath());

	  OOoServer oooServer = new OOoServer(libreOfficeExeFolder, oooOptions);
      oooServer.start(oooAcceptOption);
		
	  BootstrapSocketConnector bootstrapSocketConnector = new BootstrapSocketConnector(oooServer);
      XComponentContext xContext = bootstrapSocketConnector.connect("localhost", portNo);
	  XMultiComponentFactory xMCF = xContext.getServiceManager();
      Object oDesktop = xMCF.createInstanceWithContext("com.sun.star.frame.Desktop", xContext);
	  XDesktop xDesktop = (XDesktop) UnoRuntime.queryInterface(XDesktop.class, oDesktop);
	  XComponentLoader xCompLoader = (XComponentLoader) UnoRuntime
				.queryInterface(com.sun.star.frame.XComponentLoader.class, xDesktop);

      PropertyValue[] inputPropertyValues = new PropertyValue[1];
      inputPropertyValues[0] = new PropertyValue();
      inputPropertyValues[0].Name = "Hidden";
      inputPropertyValues[0].Value = true;

      PropertyValue outputPropertyValues[] = new PropertyValue[2];
      outputPropertyValues[0] = new PropertyValue();
      outputPropertyValues[0].Name = "URL";
  
      outputPropertyValues[1] = new PropertyValue();
      outputPropertyValues[1].Name = "FilterName";
      outputPropertyValues[1].Value = "writer_png_Export";
  
      if (!new File(inputPath).canRead()) {
        throw new RuntimeException("Cannot load template:" + new File(inputPath));
      }
    
      String inputFilePath = "file:///" + inputPath;
      String outputFilePath = "file:///" + outputPath;
      
      XComponent sourceDoc = xCompLoader.loadComponentFromURL(inputFilePath,"_blank", 0, inputPropertyValues);
      outputPropertyValues[0].Value = outputFilePath;
  
      XStorable xStorable = (XStorable) UnoRuntime.queryInterface(XStorable.class, sourceDoc);
      if (xStorable != null) {
        xStorable.storeToURL(outputFilePath, outputPropertyValues);
        closeFile(sourceDoc);
      }
      
      log.info("File converted successfully using Libre Office located at " + libreOfficeExeFolder);

      statusCode = ExportStatusCode.SCCERR_OK;
      libreMgr.notifyNext();

      // oooServer.kill();
      bootstrapSocketConnector.disconnect();
      log.exiting(LibreExport.class.getName(), "libreExport");
      return true;
    
    } catch (Exception e) {
      log.logp(Level.SEVERE, CLASS_NAME, "libreExport", e.getMessage(), e);
      e.printStackTrace();
      return false;
    }

  }

  public ExportStatusCode export(String inputPath, String outputPath, String outputFormat, String exePath, final long timeout)
  {
    log.entering(LibreExport.class.getName(), "export");

    libreExport(inputPath, outputPath);
  
    if (isNextImageAvailable() && ExportStatusCode.SCCERR_OK.equals(statusCode))
    {
      try {
        copyNext();
      } catch (Exception e) {
        e.printStackTrace();
      }
    
    }
   
    log.exiting(CLASS_NAME, "export", statusCode);
    
    return statusCode;
  }

  private static void  closeFile(XComponent xComponent) throws SQLException
  {
    XCloseable xCloseable = (XCloseable) UnoRuntime.queryInterface(XCloseable.class, xComponent);
    if (xCloseable != null)
    {
      xCloseable.close();
        xCloseable = null;
    }
    else
    {
      xComponent.dispose();
      xComponent = null;
    }
  }

  private boolean isNextImageAvailable()
  {
    String next = getFileName(this.currentIndexCopied + 1);
    File next_img = new File(tempTargetFolder, next);
    if (!next_img.exists())
      return false;
    Image img = new Image(next_img.getAbsolutePath());
    return !img.isCorrupted();
  }

  private boolean copyNext() throws IOException, DownsizeException, InterruptedException
  {
    String shouldCopy = getFileName(this.currentIndexCopied + 1);

    final File next = new File(tempTargetFolder, shouldCopy);
    if (next.exists())
    {
      final File target = new File(realTargetFolder, shouldCopy);
      try
      {
        // copy full image
        NFSFileUtil.nfs_copyFileToFile(next, target, NFSFileUtil.NFS_RETRY_SECONDS);
        // write meta
        Image image = new Image(next.getAbsolutePath());
        int w = image.getWidth();
        int h = image.getHeight();
        Dimension imgSize = null;
        if (thumbnailConverter != null)
          imgSize = thumbnailConverter.checkImageSize(w, h);
        // Dimension imgSize = putImageToMeta(target, FULLIMAGE_DIR);

        // log.log(Level.INFO, "Copied the " + currentIndexCopied +
        // " full image from local " + next.getAbsolutePath() +
        // " Current index: "
        // + currentIndexCopied);

        if (!skipDownsize)
        {
          String localThumbnail = new File(next.getParentFile(), "t_" + next.getName()).getAbsolutePath();
          int width = THUMBNAIL_WIDTH;
          int height = (imgSize.width > 0) ? (int) ((width * imgSize.height) / imgSize.width) : width;
          Util.downSize(next.getAbsolutePath(), localThumbnail, null, -1, -1, width, height, Util.DOWNSIZE_GRAPHICS2D);
          // copy thumbnails
          File media = target.getParentFile().getParentFile();

          // for failover case, rendition manager changes "pictures"
          // into "pictures1".
          // Thumbnail dir needs the correspondingchange
          File nfsPicture = target.getParentFile();
          if (thumbnailDir == null)
          {
            thumbnailDir = THUMBNAIL_DIR;
            try
            {
              String lastChars = nfsPicture.getName().substring(FULLIMAGE_DIR.length());
              Integer.parseInt(lastChars);
              thumbnailDir += lastChars;
              log.info("Using none default thumbnail dir: " + thumbnailDir);
            }
            catch (Exception e)
            {
              ;
            }
          }
          File nfsThumbnail = new File(new File(media, thumbnailDir), next.getName());
          NFSFileUtil.nfs_copyFileToFile(new File(localThumbnail), nfsThumbnail.getAbsoluteFile(), NFSFileUtil.NFS_RETRY_SECONDS);
          // write meta
          // putImageToMeta(nfsThumbnail, THUMBNAIL_DIR);
        }
        if (!skipThumbnail && currentIndexCopied == -1)
        {
          Thread t = new Thread(new Runnable()
          {

            public void run()
            {
              log.log(Level.INFO, "Running thumbnail downsize thread. target: {0}", target.getPath());
              thumbnailConverter.generateThumbnails(next, target);
            }
          });
          log.log(Level.INFO, "Start thumbnail downsize thread. target: {0}", target.getPath());
          t.start();
          t.join();
          log.log(Level.INFO, "Exit thumbnail downsize thread. target: {0}", target.getPath());
        }
        currentIndexCopied++;
      }
      catch (IOException e)
      {
        log.log(Level.WARNING, "Cannot copy Libre result from: " + next.getAbsolutePath() + "to: " + target.getAbsolutePath());
        throw e;
      }
      catch (DownsizeException e)
      {
        log.log(Level.SEVERE, "Downsize error", e);
        throw e;
      }
      catch (InterruptedException e)
      {
        throw e;
      }
      catch (Exception e)
      {
        log.log(Level.WARNING, "Cannot copy Libre result from: " + next.getAbsolutePath() + "to: " + target.getAbsolutePath(), e);
      }
      return true;
    }
    return false;
  }

  private String getFileName(int idx)
  {
    StringBuffer fileName = new StringBuffer(filePrefix);
    if (idx == 0)
    {
      fileName.append(fileExt);
      return fileName.toString();
    }

    StringBuffer nextNo = new StringBuffer(Integer.toHexString(idx));
    int length = nextNo.length();
    for (int i = 0; i < 4 - length; i++)
    {
      nextNo.insert(0, "0");
    }

    fileName.append(nextNo);
    fileName.append(fileExt);
    return fileName.toString();
  }

 
  /**
   * Take the individual properties out of the Properties object, and if they are not the EXEPATH property, or their values are not equal to
   * DEFAULT, place them into the String array execParams.
   * 
   * @param properties
   */
  private void parseProperties(Properties properties)
  {
    if (properties == null)
    {
      execParams = new String[4];
      return;
    }

    int count = 0;
    Enumeration enum1 = properties.propertyNames();

    Set acceptParas = LibreManager.getInstance().getConfig().keySet();
    // First, determine the number of properties that will be used as
    // params.
    while (enum1.hasMoreElements())
    {
      String key = (String) enum1.nextElement();
      String value = properties.getProperty(key);
      if (acceptParas.contains(key) && value != ExportProperties.DEFAULT && key != ExportProperties.EXEPATH)
        count++;
    }

    // allocate space for the number of parameters that was just determined,
    // plus 4 slots for the
    // commandName and the 3 required parameters that will be passed to
    // convert().
    execParams = new String[count + 4];
    count = 4;
    enum1 = properties.propertyNames();

    // Now place the properties into their params slots, encoding those that
    // require it.
    while (enum1.hasMoreElements())
    {
      String key = (String) enum1.nextElement();
      String value = properties.getProperty(key);
      if (acceptParas.contains(key) && value != ExportProperties.DEFAULT && key != ExportProperties.EXEPATH)
      {
        if (key == ExportProperties.TEMPLATE)
          execParams[count] = ExportProperties.TEMPLATE_U + "=" + EncodingUtil.BASE64Encode(value);
        else if (key == ExportProperties.TEMPDIR)
          execParams[count] = ExportProperties.TEMPDIR_U + "=" + EncodingUtil.BASE64Encode(value);
        else
          execParams[count] = key + "=" + value;
        if (unix == false)
          execParams[count] = "\"" + execParams[count] + "\"";
        count++;
      }
    }
  }
}