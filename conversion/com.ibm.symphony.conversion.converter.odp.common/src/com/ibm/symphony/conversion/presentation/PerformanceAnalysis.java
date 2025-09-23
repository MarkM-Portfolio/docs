/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfPresentationDocument;
import org.odftoolkit.odfdom.dom.element.draw.DrawPageElement;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.common.ConversionContext;

/*
 * === TODO =======================
 * Once both Import and Export are there, produce a file
 * Execute this as a spawned Thread
 * Add Javadoc
 * ================================
 * 
 - Conversion time
 - Total file size before import and after export 
 - Size of ODF Pictures directory before import and after export
 - Size of ODF ObjectReplacements directory before import and after export
 - Size of ODF content.xml before import and after export
 - Size of ODF styles.xml before import and after export
 - TODO: Size of Concord directory after export
 - Size of Concord content.html after export
 - TODO: Size of Concord Pictures directory after export
 - Count of files in ODF Pictures directory before import and after export
 - TODO: Count of files in Concord Pictures directory after export
 - Count of Total Pages
 - Count of Shapes
 - TODO: Count of Total Images (unique count?)
 - Count of Images/Shapes taking longer than 100ms to convert
 - Count of SVM/EMF/EMF Images
 - Count of Cropped Images
 - Total Shape conversion time
 - Bullet image conversion time
 - TODO: Count of images <= 1K, 10K, 100K, 1M, and > 1M before import and after export (add method)
 */

public class PerformanceAnalysis
{

  private static String CLASS_DESCRIPTIVE_NAME = "Presentation Performance Analysis";

  public static String CLASS = PerformanceAnalysis.class.toString();

  public static Logger log = Logger.getLogger(PerformanceAnalysis.class.getName());

  // ==============================================================================================================
  // General Constants
  // ==============================================================================================================
  public static final boolean DEBUG = false;

  public static final boolean CONTEXT_DEBUG = false | DEBUG;

  private static final String NL = System.getProperty("line.separator");

  private static final String OFFICE_VERSION = "office:version";

  private static final String OFFICE_VERSION_10 = "1.0";

  private static final String OFFICE_VERSION_11 = "1.1";

  private static final String DASH = "-";

  private static final String COMMA = ",";

  private static final String IMAGE = "Image";

  private static final String SVG = "SVG";

  private static final long ONE_HUNDRED_MS = 100;

  // ==============================================================================================================
  // Performance Context Keys: Format = GROUP + TYPE + METRIC
  // ==============================================================================================================

  // ==============================================================================================================
  // Performance Context Key - Group
  // ==============================================================================================================
  public static final String CONVERTOR_SINGLE = "PresentationPerformanceAnalysis";

  public static final String CONVERTOR_IMPORT = "PresentationPerformanceAnalysis:Import";

  public static final String CONVERTOR_EXPORT = "PresentationPerformanceAnalysis:Export";

  public static final String ODP2HTML = "ODP2HTML";

  public static final String HTML2ODP = "HTML2ODP";

  public static final String PPT2ODP = "PPT2ODP";

  public static final String PPTX2ODP = "PPTX2ODP";

  public static final String GENERAL = "GENERAL";

  private static String[] cvConvertorKeys = { ODP2HTML, HTML2ODP, PPTX2ODP, PPT2ODP };

  // ==============================================================================================================
  // Performance Context Key - Type
  // ==============================================================================================================
  public static final String SIZE = DASH + "Size" + DASH;

  public static final String COUNT = DASH + "Count" + DASH;

  public static final String FILE = DASH + "File" + DASH;

  // ==============================================================================================================
  // Performance Context Key - Metric
  // ==============================================================================================================
  private static final String CONTENT_HTML = "content.html";

  private static final String CONTENT_XML = "content.xml";

  private static final String STYLES_XML = "styles.xml";

  private static final String PICTURES = "Pictures";

  private static final String OBJECT_REPLACEMENTS = "ObjectReplacements";

  private static final String MASTER = "Master";

  private static final String CONTENT = "Content";

  private static final String AUTOMATIC = "Automatic";

  private static final String OFFICE = "Office";

  private static final String STYLES = "Styles";

  private static final String GRAPHICS = "Graphics";

  private static final String SHAPES = "Shapes";

  private static final String IMAGES = "Images";

  private static final String CONVERTED_SHAPES = "ConvertedShapes";

  private static final String CROPPED_IMAGES = "CroppedImages";

  private static final String CONVERTED_IMAGES = "ConvertedImages";

  private static final String LONG_IMAGE_CONVERSION = "LongImageConversion";

  private static final String SHAPE_CONVERSION_TIME = "ShapeConversionTime";

  private static final String IMAGE_CONVERSION_TIME = "ImageConversionTime";

  private static final String BULLET_IMAGE_CONVERSION_TIME = "BulletImageConversionTime";

  private static final String ACF_SCAN_TIME = "AcfScanTime";

  private static final String PAGES = "Pages";

  private static final String VERSION = "OfficeVersion";

  private static final String MASTER_OFFICE_STYLES = MASTER + DASH + OFFICE + STYLES;

  private static final String CONTENT_OFFICE_STYLES = CONTENT + DASH + OFFICE + STYLES;

  private static final String MASTER_AUTO_STYLES = MASTER + DASH + AUTOMATIC + STYLES;

  private static final String CONTENT_AUTO_STYLES = CONTENT + DASH + AUTOMATIC + STYLES;

  // ==============================================================================================================
  // Performance Context Keys
  // ==============================================================================================================
  public static final String KEY_REPORT = "Report";

  public static final String KEY_FILENAME = "Filename";

  public static final String KEY_TIME_TO_CONVERT = DASH + "Time" + DASH + "Conversion";

  public static final String KEY_FILE_VERSION = GENERAL + FILE + VERSION;

  public static final String KEY_PAGES = GENERAL + COUNT + PAGES;

  public static final String KEY_GRAPHICS = GENERAL + COUNT + GRAPHICS;

  public static final String KEY_SHAPES = GENERAL + COUNT + SHAPES;

  public static final String KEY_IMAGES = GENERAL + COUNT + IMAGES;

  public static final String KEY_CONVERTED_SHAPES = GENERAL + COUNT + CONVERTED_SHAPES;

  public static final String KEY_CROPPED_IMAGES = GENERAL + COUNT + CROPPED_IMAGES;

  public static final String KEY_CONVERTED_IMAGES = GENERAL + COUNT + CONVERTED_IMAGES;

  public static final String KEY_LONG_IMAGE_CONVERSION = GENERAL + COUNT + LONG_IMAGE_CONVERSION;

  public static final String KEY_SHAPE_CONVERSION_TIME = GENERAL + COUNT + SHAPE_CONVERSION_TIME;

  public static final String KEY_IMAGE_CONVERSION_TIME = GENERAL + COUNT + IMAGE_CONVERSION_TIME;

  public static final String KEY_BULLET_IMAGE_CONVERSION_TIME = GENERAL + COUNT + BULLET_IMAGE_CONVERSION_TIME;

  public static final String KEY_ACF_SCAN_TIME = GENERAL + COUNT + ACF_SCAN_TIME;

  public static final String KEY_STYLES_XML = GENERAL + SIZE + STYLES_XML;

  public static final String KEY_CONTENT_XML = GENERAL + SIZE + CONTENT_XML;

  public static final String KEY_CONTENT_HTML = GENERAL + SIZE + CONTENT_HTML;

  public static final String KEY_PICTURES_SIZE = GENERAL + SIZE + PICTURES;

  public static final String KEY_OBJECT_REPLACEMENTS_SIZE = GENERAL + SIZE + OBJECT_REPLACEMENTS;

  public static final String KEY_PICTURES_COUNT = GENERAL + COUNT + PICTURES;

  public static final String KEY_OBJECT_REPLACEMENTS_COUNT = GENERAL + COUNT + OBJECT_REPLACEMENTS;

  public static final String KEY_MASTER_OFFICE_STYLES = GENERAL + COUNT + MASTER_OFFICE_STYLES;

  public static final String KEY_MASTER_AUTO_STYLES = GENERAL + COUNT + MASTER_AUTO_STYLES;

  public static final String KEY_CONTENT_OFFICE_STYLES = GENERAL + COUNT + CONTENT_OFFICE_STYLES;

  public static final String KEY_CONTENT_AUTO_STYLES = GENERAL + COUNT + CONTENT_AUTO_STYLES;

  // ==============================================================================================================
  // Conversion Result Constants
  // ==============================================================================================================
  public static final String PERF_TIME_ODP2HTML = "PerfTime-ODP2HTML";

  public static final String PERF_TIME_MS2ODP = "PerfTime-MS2ODP";

  public static final String PERF_STAT_PAGES = "PerfStat-Pages";

  public static final String PERF_STAT_SHAPES = "PerfStat-Shapes";

  public static final String PERF_STAT_SHAPES_CONVERTED = "PerfStat-ShapesConverted";

  public static final String PERF_STAT_IMAGES = "PerfStat-Images";

  public static final String PERF_STAT_IMAGES_CROPPED = "PerfStat-ImagesCropped";

  public static final String PERF_STAT_IMAGES_CONVERTED = "PerfStat-ImagesConverted";

  // ==============================================================================================================
  // Static Synchronized Members
  // ==============================================================================================================
  private static Map<String, Object> cvContextMap = Collections.synchronizedMap(new HashMap<String, Object>());

  private static String cvInputFilename = null;

  private static ArrayList<String> cvSourceFileImport = null;

  private static ArrayList<String> cvSourceFileExport = null;

  private static boolean cvKeepData = false;

  // ==============================================================================================================
  // Instance Variables
  // ==============================================================================================================
  private String ivFilename = null;

  private Map<String, Object> ivContext = new HashMap<String, Object>();

  private boolean ivReportGenerated = false;

  // ==============================================================================================================
  // Main
  // ==============================================================================================================
  public static void main(String[] args)
  {

    if (!DEBUG)
    {
      log.setLevel(Level.WARNING);
      log.getParent().setLevel(Level.WARNING);
      Handler[] handlers = log.getHandlers();
      for (int h = 0; h < handlers.length; h++)
      {
        handlers[h].setLevel(Level.WARNING);
      }
    }

    try
    {
      PerformanceAnalysis.cvKeepData = true;

      parseArguments(args); // Parse and Validate Input Arguments

      PerformanceAnalysis importPerformanceContext = null;
      PerformanceAnalysis exportPerformanceContext = null;
      ConversionContext context = new ConversionContext();

      if (cvSourceFileImport != null)
      {
        for (int i = 0; i < cvSourceFileImport.size(); i++)
        {
          String importFilename = cvSourceFileImport.get(i);
          context.put(ODPConvertConstants.CONTEXT_SOURCE_PATH, importFilename);
          importPerformanceContext = PerformanceAnalysis.gatherStatistics(context, CONVERTOR_IMPORT, new File(importFilename));
          context.put(CONVERTOR_IMPORT + DASH + importPerformanceContext.getFilename(), importPerformanceContext);

          String exportFilename = cvSourceFileExport.get(i);
          context.put(ODPConvertConstants.CONTEXT_SOURCE_PATH, exportFilename);
          exportPerformanceContext = PerformanceAnalysis.gatherStatistics(context, CONVERTOR_EXPORT, new File(exportFilename));
          context.put(CONVERTOR_EXPORT + DASH + exportPerformanceContext.getFilename(), exportPerformanceContext);
        }
      }
      else
      {
        context.put(ODPConvertConstants.CONTEXT_SOURCE_PATH, cvInputFilename);
        importPerformanceContext = PerformanceAnalysis.gatherStatistics(context, CONVERTOR_SINGLE, new File(cvInputFilename));
      }

      exit("Performance Analysis completed successfully", 0);
    }
    catch (Exception ex)
    {
      ex.printStackTrace();
      exit("Unhandled exception in PerformanceAnalysis", 99);
    }
  }

  // ==============================================================================================================
  // Parse Arguments
  // ==============================================================================================================
  static protected void parseArguments(String[] args) throws Exception
  {
    int i = 0;
    while (i < args.length && args[i].startsWith("-"))
    {
      String arg = args[i++];

      if (arg.equals("-f"))
      {
        if (i < args.length)
        {
          cvInputFilename = args[i++];
        }
        else
        {
          exit("-f requires a file name", 1);
        }
        log.info("Performance Analysis input file = " + cvInputFilename);
      }
      else if (arg.equals("-comparelist"))
      {
        if (i < args.length)
        {
          cvInputFilename = args[i++];
        }
        else
        {
          exit("-comparelist requires a file name", 2);
        }
        loadCompareList();
      }
    }

    if (cvInputFilename == null)
    {
      cvInputFilename = getStringInput("Input filename: ");

      if ((cvInputFilename == null) || (cvInputFilename.length() == 0))
      {
        exit("Failed to read input filename", 10);
      }
      else
      {
        if (!fileExists(cvInputFilename))
        {
          exit("Input file " + cvInputFilename + " does not exist", 11);
        }
      }
    }
  }

  static protected void loadCompareList() throws Exception
  {

    log.info("Performance Analysis compare list file = " + cvInputFilename);

    File compareListFile = new File(cvInputFilename);
    BufferedReader br = null;
    String input = null;

    try
    {
      cvSourceFileImport = new ArrayList<String>();
      cvSourceFileExport = new ArrayList<String>();

      if (!compareListFile.exists())
      {
        exit("Compare list file " + cvInputFilename + " does not exist", 20);
      }

      br = new BufferedReader(new FileReader(compareListFile));
      input = br.readLine();
      while ((input != null) && input.length() > 0)
      {
        String[] pair = input.split(COMMA);
        cvSourceFileImport.add(pair[0]);
        cvSourceFileExport.add(pair[1]);

        input = br.readLine();
      }
    }
    catch (Exception e)
    {
      ODPMetaFile.closeResource(br);
      exit("-comparelist file is not a list comma separated pairs", 21);
    }
  }

  static protected void exit(String msg, int code)
  {
    if (code > 0)
    {

      System.err.println("java com.ibm.symphony.conversion.presentation [ -f <filename> | -comparelist <filename> ]" + NL);
      System.err.println(msg);
      System.exit(code);
    }
    else
    {
      System.out.println(msg);
      System.exit(0);
    }
  }

  // ==============================================================================================================
  // Public Methods
  // ==============================================================================================================
  public static PerformanceAnalysis gatherStatistics(ConversionContext context, String convertor, File sourceFile)
  {

    if (PresentationConfig.isCollectPerfStats())
    {
      PerformanceAnalysis perfContext = getPerformanceContext(context);
      perfContext.doGatherStatistics(context, convertor, sourceFile);
      PerformanceAnalysis.cleanupPerformanceContext(perfContext);
      return perfContext;
    }

    return null;
  }

  public static void recordAcfScanTime(ConversionContext context, long time)
  {
    if (PresentationConfig.isCollectPerfStats())
    {
      PerformanceAnalysis perfContext = getPerformanceContext(context);
      perfContext.putLong(KEY_ACF_SCAN_TIME, time);

      if (PresentationConfig.isDebugGraphics())
      {
        log.info("ACF Scan completed in " + time + " ms");
      }
    }
  }

  public static void recordConversionTime(ConversionContext context, String convertor, String filename, long time)
  {
    if (PresentationConfig.isCollectPerfStats())
    {
      String key = convertor + KEY_TIME_TO_CONVERT;
      PerformanceAnalysis perfContext = getPerformanceContext(filename);
      perfContext.putLong(key, time);
    }
  }

  public static void recordCroppedImageConversionTime(ConversionContext context, long time)
  {
    if (PresentationConfig.isCollectPerfStats())
    {
      PerformanceAnalysis perfContext = getPerformanceContext(context);
      perfContext.incrementLong(KEY_CROPPED_IMAGES);

      perfContext.recordImageConversionTime(time);

      if (PresentationConfig.isDebugGraphics())
      {
        log.info("Cropped image conversion time = " + time + " ms");
      }
    }
  }

  public static void recordConvertedImageConversionTime(ConversionContext context, long time)
  {
    if (PresentationConfig.isCollectPerfStats())
    {
      PerformanceAnalysis perfContext = getPerformanceContext(context);
      perfContext.incrementLong(KEY_CONVERTED_IMAGES);

      perfContext.recordImageConversionTime(time);

      if (PresentationConfig.isDebugGraphics())
      {
        log.info("Non-browser friendly image conversion time = " + time + " ms");
      }
    }
  }

  public static void recordShapeConversionTime(ConversionContext context, long time)
  {
    if (PresentationConfig.isCollectPerfStats())
    {
      PerformanceAnalysis perfContext = getPerformanceContext(context);
      perfContext.incrementLong(KEY_CONVERTED_SHAPES);

      long count = perfContext.getLong(KEY_SHAPE_CONVERSION_TIME);
      count = count + time;
      perfContext.putLong(KEY_SHAPE_CONVERSION_TIME, count);
      if (time > ONE_HUNDRED_MS)
      {
        count = perfContext.getLong(KEY_LONG_IMAGE_CONVERSION);
        count++;
        perfContext.putLong(KEY_LONG_IMAGE_CONVERSION, count);
      }

      if (PresentationConfig.isDebugGraphics())
      {
        log.info("Shape image conversion time = " + time + " ms");
      }
    }
  }

  public static void recordBulletImageConversionTime(ConversionContext context, long time)
  {
    if (PresentationConfig.isCollectPerfStats())
    {
      PerformanceAnalysis perfContext = getPerformanceContext(context);
      perfContext.putLong(KEY_BULLET_IMAGE_CONVERSION_TIME, time);

      if (PresentationConfig.isDebugGraphics())
      {
        log.info("Bullet image conversion time = " + time + " ms");
      }
    }
  }

  public String getFilename()
  {
    return ivFilename;
  }

  public Object get(String key)
  {
    return ivContext.get(key);
  }

  public boolean containsKey(String key)
  {
    return ivContext.containsKey(key);
  }

  // ==============================================================================================================
  // Internal Functional Methods
  // ==============================================================================================================
  @SuppressWarnings("restriction")
  protected void analyzeFile(File sourceFile)
  {
    long start = System.currentTimeMillis();

    OdfDocument odf = null;
    try
    {
      odf = OdfPresentationDocument.loadDocument(sourceFile);

      NodeList list = null;

      OdfElement masterOffice = (OdfElement) odf.getStylesDom().getOfficeStyles();
      countStyles(masterOffice, KEY_MASTER_OFFICE_STYLES);
      masterOffice = null;

      OdfElement masterAuto = (OdfElement) odf.getStylesDom().getAutomaticStyles();
      countStyles(masterAuto, KEY_MASTER_AUTO_STYLES);
      masterAuto = null;

      OdfElement master = (OdfElement) odf.getStylesDom().getElementsByTagName(ODPConvertConstants.ODF_STYLE_MASTER).item(0);
      list = master.getChildNodes();
      for (int n = 0; n < list.getLength(); n++)
      {
        Node node = list.item(n);
        countShapes(node, MASTER);
        countImages(node, MASTER);
      }
      master = null;

      OdfElement contentOffice = (OdfElement) odf.getContentDom().getOfficeStyles();
      countStyles(contentOffice, KEY_CONTENT_OFFICE_STYLES);
      contentOffice = null;

      OdfElement contentAuto = (OdfElement) odf.getContentDom().getAutomaticStyles();
      countStyles(contentAuto, KEY_CONTENT_AUTO_STYLES);
      contentAuto = null;

      OdfElement content = (OdfElement) odf.getContentDom().getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_PRESENTATION).item(0);
      list = content.getChildNodes();
      for (int n = 0; n < list.getLength(); n++)
      {
        Node node = list.item(n);
        if (node instanceof DrawPageElement)
        {
          incrementLong(KEY_PAGES);
          countShapes(node, CONTENT);
          countImages(node, CONTENT);
        }
      }
      content = null;

      OdfPackage odfPackage = odf.getPackage();
      Set<String> files = odfPackage.getFileEntries();
      countFiles(odfPackage, files, PICTURES);
      countFiles(odfPackage, files, CONTENT_XML);
      countFiles(odfPackage, files, STYLES_XML);
      countFiles(odfPackage, files, CONTENT_HTML);
      countFiles(odfPackage, files, OBJECT_REPLACEMENTS);
    }
    catch (Throwable t)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS_DESCRIPTIVE_NAME);
      ODPCommonUtil.logException(Level.WARNING, message, t);
    }
    finally
    {
      ODPMetaFile.closeResource(odf);
    }

    long end = System.currentTimeMillis();
    Long total = new Long(end - start);

    log.info("Time to analyze file = " + total + "ms");
  }

  /**
   * Check and Log the Open Office XML Version -- Potentially add a warning message in the future to the ConversionResult
   * 
   * @param odf
   *          - ODF Document
   * @return String Office Version
   */
  protected String checkOdfVersion(OdfDocument odf)
  {
    BufferedReader metaData = null;
    try
    {
      metaData = new BufferedReader(new InputStreamReader(odf.getMetaStream()));
      String line = metaData.readLine();
      while (line != null)
      {
        int index = line.indexOf(OFFICE_VERSION);
        if (index >= 0)
        {
          int firstQuoteIndex = line.indexOf(ODPConvertConstants.SYMBOL_QUOTE, index);
          int secondQuoteIndex = line.indexOf(ODPConvertConstants.SYMBOL_QUOTE, firstQuoteIndex + 1);
          String officeVersion = line.substring(firstQuoteIndex + 1, secondQuoteIndex);
          if (officeVersion.equals(OFFICE_VERSION_10) || officeVersion.equals(OFFICE_VERSION_11))
          {
            String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_OLD_ODP_VERSION, officeVersion);
            ODPCommonUtil.logMessage(Level.WARNING, message);
          }
          return officeVersion;
        }
        line = metaData.readLine();
      }
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_OLD_ODP_VERSION, ODPCommonUtil.LOG_UNKNOWN);
      ODPCommonUtil.logMessage(Level.WARNING, message);
    }
    finally
    {
      ODPMetaFile.closeResource(metaData);
    }

    return ODPCommonUtil.LOG_UNKNOWN;
  }

  protected void doGatherStatistics(ConversionContext context, String convertor, File sourceFile)
  {

    if (PresentationConfig.isCollectPerfStats())
    {

      // Gather Information for Performance Report
      putString(KEY_FILENAME, ivFilename);

      String odfVersion = "";
      OdfDocument odf = null;
      try
      {
        odf = OdfPresentationDocument.loadDocument(sourceFile);
        odfVersion = checkOdfVersion(odf);
      }
      catch (Throwable t)
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS_DESCRIPTIVE_NAME);
        ODPCommonUtil.logException(Level.WARNING, message, t);
      }
      finally
      {
        ODPMetaFile.closeResource(odf);
      }
      putString(KEY_FILE_VERSION, odfVersion);

      if (!odfVersion.equals(ODPCommonUtil.LOG_UNKNOWN))
      {

        analyzeFile(sourceFile);

        long pageLimit = PresentationConfig.getPageLimit();
//        long graphicLimit = PresentationConfig.getGraphicLimit();
        boolean debugGraphicsFlag = PresentationConfig.isDebugGraphics();
        boolean encodeGraphicsFlag = PresentationConfig.isEncodeGraphics();
        long encodeGraphicsThreshold = PresentationConfig.getGraphicEncodeThreshold();
        boolean asyncMode = PresentationConfig.isAsyncGraphics();
        String shapeTargetType = IMAGE;
        if (PresentationConfig.isSvgShapeFormat())
        {
          shapeTargetType = SVG;
        }

        long[] timeToConvert = new long[cvConvertorKeys.length];
        for (int i = 0; i < cvConvertorKeys.length; i++)
        {
          timeToConvert[i] = getLong(cvConvertorKeys[i] + KEY_TIME_TO_CONVERT);
        }
        long bulletImageConversionTime = getLong(KEY_BULLET_IMAGE_CONVERSION_TIME);
        long totalShapeConversionTime = getLong(KEY_SHAPE_CONVERSION_TIME);
        long totalImageConversionTime = getLong(KEY_IMAGE_CONVERSION_TIME);
        long numLongImageConversions = getLong(KEY_LONG_IMAGE_CONVERSION);

        long numPages = getLong(KEY_PAGES);
        long numGraphics = getLong(KEY_GRAPHICS);
        long numShapes = getLong(KEY_SHAPES);
        long numImages = getLong(KEY_IMAGES);
        long numConvertedShapes = getLong(KEY_CONVERTED_SHAPES);
        long numCroppedImages = getLong(KEY_CROPPED_IMAGES);
        long numConvertedImages = getLong(KEY_CONVERTED_IMAGES);
        long numCroppedConvertedImages = numCroppedImages + numConvertedImages;

        long avgShapeConversionTime = numConvertedShapes != 0 ? getLong(KEY_SHAPE_CONVERSION_TIME) * 1000 / numConvertedShapes / 1000 : 0;
        long avgImageConversionTime = numCroppedConvertedImages != 0 ? getLong(KEY_IMAGE_CONVERSION_TIME) * 1000
            / (numCroppedConvertedImages) / 1000 : 0;

        long sizeOfStylesXml = getLong(KEY_STYLES_XML);
        long sizeOfContentXml = getLong(KEY_CONTENT_XML);
        long sizeOfContentHtml = getLong(KEY_CONTENT_HTML);
        long sizeOfPictures = getLong(KEY_PICTURES_SIZE);
        long sizeOfObjectReplacements = getLong(KEY_OBJECT_REPLACEMENTS_SIZE);
        long countOfPictures = getLong(KEY_PICTURES_COUNT);
        long countOfObjectReplacements = getLong(KEY_OBJECT_REPLACEMENTS_COUNT);

        long masterOfficeStyles = getLong(KEY_MASTER_OFFICE_STYLES);
        long masterAutoStyles = getLong(KEY_MASTER_AUTO_STYLES);
        long contentOfficeStyles = getLong(KEY_CONTENT_OFFICE_STYLES);
        long contentAutoStyles = getLong(KEY_CONTENT_AUTO_STYLES);

        long acfScanTime = getLong(KEY_ACF_SCAN_TIME);

        // Add Performance Information to Conversion Results
        addPerformanceInfoToResult(context, PERF_TIME_ODP2HTML, Long.toString(timeToConvert[0]));
        addPerformanceInfoToResult(context, PERF_STAT_PAGES, Long.toString(numPages));
        addPerformanceInfoToResult(context, PERF_STAT_SHAPES, Long.toString(numShapes));
        addPerformanceInfoToResult(context, PERF_STAT_SHAPES_CONVERTED, Long.toString(numConvertedShapes));
        addPerformanceInfoToResult(context, PERF_STAT_IMAGES, Long.toString(numImages));
        addPerformanceInfoToResult(context, PERF_STAT_IMAGES_CROPPED, Long.toString(numCroppedImages));
        addPerformanceInfoToResult(context, PERF_STAT_IMAGES_CONVERTED, Long.toString(numConvertedImages));

        // Generate Performance Report
        String report = NL;
        report += "======================================================================================" + NL;
        report += "= Performance Statistics Gathering                                                   =" + NL;
        report += "======================================================================================" + NL;
        report += "INFO - Convertor                              : " + convertor + NL;
        report += "INFO - Filename                               : " + ivFilename + NL;
        report += "INFO - ODF Version                            : " + odfVersion + NL;
        report += "--------------------------------------------------------------------------------------" + NL;
        report += "CONFIG - Max Pages                            : " + pageLimit + NL;
//        report += "CONFIG - Max Graphics                         : " + graphicLimit + NL;
        report += "CONFIG - Debug Graphics Mode                  : " + debugGraphicsFlag + NL;
        report += "CONFIG - Encode Graphics Mode                 : " + encodeGraphicsFlag + NL;
        report += "CONFIG - Encode Graphics Threshold            : " + encodeGraphicsThreshold + NL;
        report += "CONFIG - Async Conversion Mode                : " + asyncMode + NL;
        report += "CONFIG - Shape Target Type                    : " + shapeTargetType + NL;
        report += "--------------------------------------------------------------------------------------" + NL;
        for (int i = 0; i < cvConvertorKeys.length; i++)
        {
          if (timeToConvert[i] > 0)
          {
            report += "PERFORMANCE - Time to convert                 : " + timeToConvert[i] + " ms (" + cvConvertorKeys[i] + ")" + NL;
          }
        }
        report += "PERFORMANCE - Bullet Image Conversion Time    : " + bulletImageConversionTime + " ms" + NL;
        report += "PERFORMANCE - Total Shape Conversion Time     : " + totalShapeConversionTime + " ms" + NL;
        report += "PERFORMANCE - Total Image Conversion Time     : " + totalImageConversionTime + " ms" + NL;
        report += "PERFORMANCE - Average Shape Conversion Time   : " + avgShapeConversionTime + " ms" + NL;
        report += "PERFORMANCE - Average Image Conversion Time   : " + avgImageConversionTime + " ms" + NL;
        report += "PERFORMANCE - Shape/Image Conversion > 100ms  : " + numLongImageConversions + NL;
        report += NL;
        report += "PERFORMANCE - Number of Pages                 : " + numPages + NL;
        report += "PERFORMANCE - Number of Total Graphics        : " + numGraphics + NL;
        report += "PERFORMANCE - Number of Shapes                : " + numShapes + NL;
        report += "PERFORMANCE - Number of Converted Shapes      : " + numConvertedShapes + NL;
        report += "PERFORMANCE - Number of Images                : " + numImages + NL;
        report += "PERFORMANCE - Number of Cropped Images        : " + numCroppedImages + NL;
        report += "PERFORMANCE - Number of Converted Images      : " + numConvertedImages + NL;
        report += NL;
        report += "PERFORMANCE - Size of styles.xml              : " + sizeOfStylesXml + NL;
        report += "PERFORMANCE - Size of content.xml             : " + sizeOfContentXml + NL;
        report += "PERFORMANCE - Size of content.html            : " + sizeOfContentHtml + NL;
        report += NL;
        report += "PERFORMANCE - Size of ODF Pictures            : " + sizeOfPictures + NL;
        report += "PERFORMANCE - Count of ODF Pictures           : " + countOfPictures + NL;
        report += "PERFORMANCE - Size of Object Replacements     : " + sizeOfObjectReplacements + NL;
        report += "PERFORMANCE - Count of Object Replacements    : " + countOfObjectReplacements + NL;
        report += NL;
        report += "PERFORMANCE - Number of Master Office Styles  : " + masterOfficeStyles + NL;
        report += "PERFORMANCE - Number of Master Auto Styles    : " + masterAutoStyles + NL;
        report += "PERFORMANCE - Number of Content Office Styles : " + contentOfficeStyles + NL;
        report += "PERFORMANCE - Number of Content Auto Styles   : " + contentAutoStyles + NL;
        report += NL;
        report += "PERFORMANCE - ACF Scan/Processing Time        : " + acfScanTime + " ms" + NL;
        report += "======================================================================================" + NL;

        System.out.println(report);

        if (CONTEXT_DEBUG)
        {
          Set<String> keys = ivContext.keySet();
          Iterator<String> iterator = keys.iterator();
          while (iterator.hasNext())
          {
            String key = iterator.next();
            System.out.println(key + " = " + ivContext.get(key));
          }
        }
        System.out.println();

        putString(KEY_REPORT, report);

        ivReportGenerated = true;
      }
    }
  }

  // ==============================================================================================================
  // Internal Helper Methods
  // ==============================================================================================================
  private PerformanceAnalysis(String filename)
  {
    this.ivFilename = filename;
    cvContextMap.put(filename, this);
  }

  private void resetCounters()
  {
    this.ivContext = new HashMap<String, Object>();
    ivReportGenerated = false;
  }

  private void putString(String key, String value)
  {
    if (ivReportGenerated)
    {
      resetCounters();
    }
    ivContext.put(key, value);
  }

  private void putLong(String key, long value)
  {
    if (ivReportGenerated)
    {
      resetCounters();
    }
    ivContext.put(key, new Long(value));
  }

  private void incrementLong(String key)
  {
    if (ivReportGenerated)
    {
      resetCounters();
    }
    long original = getLong(key);
    ivContext.put(key, new Long(original + 1));
  }

  @SuppressWarnings("unused")
  private void putBoolean(String key, boolean value)
  {
    if (ivReportGenerated)
    {
      resetCounters();
    }
    ivContext.put(key, new Boolean(value));
  }

  @SuppressWarnings("unused")
  private String getString(String key)
  {
    return (String) ivContext.get(key);
  }

  private long getLong(String key)
  {
    long value = 0;
    Long object = (Long) ivContext.get(key);
    if (object != null)
    {
      value = object.longValue();
    }
    return value;
  }

  @SuppressWarnings("unused")
  private boolean getBoolean(String key)
  {
    boolean value = false;
    Boolean object = (Boolean) ivContext.get(key);
    if (object != null)
    {
      value = object.booleanValue();
    }
    return value;
  }

  private void recordImageConversionTime(long time)
  {
    long count = getLong(KEY_IMAGE_CONVERSION_TIME);
    count = count + time;
    putLong(KEY_IMAGE_CONVERSION_TIME, count);
    if (time > ONE_HUNDRED_MS)
    {
      count = getLong(KEY_LONG_IMAGE_CONVERSION);
      count++;
      putLong(KEY_LONG_IMAGE_CONVERSION, count);
    }
  }

  private long countObjectsWithSubtotals(Node node, String[] list, String location)
  {

    long overallCount = 0;

    for (int i = 0; i < list.length; i++)
    {
      String s = node.toString();
      String key = location + list[i].substring(list[i].indexOf(ODPConvertConstants.SYMBOL_COLON));
      long count = getLong(key);
      for (int j = 0; j < s.length();)
      {
        int index = s.indexOf(list[i]);
        if (index >= 0)
        {
          count++;
          overallCount++;
          j = index + list[i].length();
          s = s.substring(j);
          j = 0;
        }
        else
        {
          j = s.length();
        }
      }
      putLong(key, count);
    }
    return overallCount;
  }

  private long countObjects(Node node, String[] list)
  {

    long overallCount = 0;

    for (int i = 0; i < list.length; i++)
    {
      String s = node.toString();
      for (int j = 0; j < s.length();)
      {
        int index = s.indexOf(list[i]);
        if (index >= 0)
        {
          overallCount++;
          j = index + list[i].length();
          s = s.substring(j);
          j = 0;
        }
        else
        {
          j = s.length();
        }
      }
    }
    return overallCount;
  }

  private void countStyles(Node node, String key)
  {
    long count = countObjects(node, cvListOfStyles);
    long numStyles = getLong(key);
    numStyles = count + numStyles;
    putLong(key, numStyles);
  }

  private static String[] cvListOfStyles = { "<style:style" };

  @SuppressWarnings("restriction")
  private void countStyles(OdfElement styles, String key)
  {
    if (styles != null)
    {
      NodeList list = styles.getChildNodes();
      for (int n = 0; n < list.getLength(); n++)
      {
        Node node = list.item(n);
        countStyles(node, key);
      }
    }
    else
    {
      putLong(key, 0);
    }
  }

  private void countShapes(Node node, String location)
  {
    long count = countObjectsWithSubtotals(node, cvListOfShapes, location);
    long numGraphics = getLong(KEY_GRAPHICS);
    long numShapes = getLong(KEY_SHAPES);
    numGraphics = count + numGraphics;
    numShapes = count + numShapes;
    putLong(KEY_GRAPHICS, numGraphics);
    putLong(KEY_SHAPES, numShapes);
  }

  private static String[] cvListOfShapes = { "<draw:custom-shape", "<draw:line", "<draw:circle", "<draw:rect", "<draw:ellipse",
      "<draw:path", "<draw:polygon", "<draw:regular-polygon", "<draw:connector", "<draw:polyline", "<draw:measure" };

  private void countImages(Node node, String location)
  {
    // TODO - How can we make the unique image counts
    long count = countObjectsWithSubtotals(node, cvListOfImages, location);
    long numGraphics = getLong(KEY_GRAPHICS);
    long numImages = getLong(KEY_IMAGES);
    numGraphics = count + numGraphics;
    numImages = count + numImages;
    putLong(KEY_GRAPHICS, numGraphics);
    putLong(KEY_IMAGES, numImages);
  }

  private static String[] cvListOfImages = { "<draw:image" };

  private void countFiles(OdfPackage odfPackage, Set<String> files, String location)
  {

    long overallCount = 0;
    long overallSize = 0;

    byte[] buf = new byte[4096];

    for (String file : files)
    {
      if (file.contains(location) && !file.endsWith(ODPConvertConstants.FILE_RESOURCE_SEPARATOR))
      {
        InputStream in = null;
        try
        {
          in = odfPackage.getInputStream(file);

          if (in != null)
          {
            int len = 0;
            while ((len = in.read(buf)) > 0)
            {
              overallSize += len;
            }
          }
        }
        catch (Throwable t)
        {
          String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS_DESCRIPTIVE_NAME);
          ODPCommonUtil.logException(Level.WARNING, message, t);
        }
        finally
        {
          ODPMetaFile.closeResource(in);
        }
        overallCount++;
      }
    }
    putLong(GENERAL + COUNT + location, overallCount);
    putLong(GENERAL + SIZE + location, overallSize);
  }

  private static PerformanceAnalysis getPerformanceContext(String sourceFilename)
  {
    String filename = sourceFilename;
    try
    {
      int index1 = filename.indexOf(ODPConvertConstants.SYMBOL_DOT);
      if (index1 >= 0)
      {
        int index2 = filename.substring(0, index1).lastIndexOf(File.separator);
        if (index2 >= 0)
        {
          String newFilename = filename.substring(index2 + 1);
          int index3 = newFilename.indexOf(File.separator);
          if (index3 >= 0)
          {
            filename = newFilename.substring(0, index3);
          }
        }
        else
        {
          filename = sourceFilename;
        }
      }
      else
      {
        filename = sourceFilename;
      }
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS_DESCRIPTIVE_NAME);
      ODPCommonUtil.logException(Level.WARNING, message, e);
    }

    PerformanceAnalysis perfContext = (PerformanceAnalysis) cvContextMap.get(filename);
    if (perfContext == null)
    {
      perfContext = new PerformanceAnalysis(filename);
    }

    return perfContext;
  }

  private static PerformanceAnalysis getPerformanceContext(ConversionContext context)
  {
    String filename = (String) context.get(ODPConvertConstants.CONTEXT_SOURCE_PATH);
    return PerformanceAnalysis.getPerformanceContext(filename);
  }

  private static void cleanupPerformanceContext(PerformanceAnalysis context)
  {
    if (!PerformanceAnalysis.cvKeepData)
    {
      cvContextMap.remove(context.ivFilename);
    }
  }

  public static boolean fileExists(String filename)
  {
    return new File(filename).exists();
  }

  public static String getStringInput(String prompt)
  {
    String input = null;
    System.out.print(prompt);

    BufferedReader br = null;
    try
    {
      br = new BufferedReader(new InputStreamReader(System.in));
      input = br.readLine();
    }
    catch (Exception e)
    {
    }
    finally
    {
      ODPMetaFile.closeResource(br);
    }

    return input;
  }

  public static void addPerformanceInfoToResult(ConversionContext context, String infoType, String infoValue)
  {
    ConversionResult result = (ConversionResult) context.get(ODPConvertConstants.CONTEXT_CONVERT_RESULT);
    addPerformanceInfoToResult(result, infoType, infoValue);
  }

  public static void addPerformanceInfoToResult(ConversionResult result, String infoType, String infoValue)
  {
    ConversionWarning cw = new ConversionWarning(infoType, true, "", infoValue);
    result.addWarning(cw);
  }
}
