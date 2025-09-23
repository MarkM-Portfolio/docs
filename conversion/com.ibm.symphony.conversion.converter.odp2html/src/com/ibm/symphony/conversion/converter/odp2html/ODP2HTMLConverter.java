/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odp2html;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfDocument.OdfMediaType;
import org.odftoolkit.odfdom.doc.OdfPresentationDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeMasterStyles;
import org.odftoolkit.odfdom.doc.style.OdfDefaultStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleMasterPage;
import org.odftoolkit.odfdom.doc.style.OdfStylePageLayout;
import org.odftoolkit.odfdom.dom.attribute.fo.FoMarginBottomAttribute;
import org.odftoolkit.odfdom.dom.attribute.fo.FoMarginLeftAttribute;
import org.odftoolkit.odfdom.dom.attribute.fo.FoMarginRightAttribute;
import org.odftoolkit.odfdom.dom.attribute.fo.FoMarginTopAttribute;
import org.odftoolkit.odfdom.dom.attribute.fo.FoPageHeightAttribute;
import org.odftoolkit.odfdom.dom.attribute.fo.FoPageWidthAttribute;
import org.odftoolkit.odfdom.dom.attribute.style.StylePrintOrientationAttribute;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.element.table.TableTableTemplateElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.odftoolkit.odfdom.incubator.meta.OdfOfficeMeta;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import symphony.org.w3c.tidy.Tidy;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.ODPMetaFile;
import com.ibm.symphony.conversion.presentation.PerformanceAnalysis;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.presentation.StackableProperties;
import com.ibm.symphony.conversion.presentation.UnsupportedFeatures;
import com.ibm.symphony.conversion.presentation.importodf.ODPConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertorFactory;
import com.ibm.symphony.conversion.presentation.importodf.html.content.HtmlContentConvertorFactory;
import com.ibm.symphony.conversion.presentation.importodf.html.content.ShapeElementConvertor;
import com.ibm.symphony.conversion.presentation.importodf.html.master.HtmlMasterConvertorFactory;
import com.ibm.symphony.conversion.presentation.importodf.image.ODPImageConvertor;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.IUpgradeConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.acf.ACFUtil;
import com.ibm.symphony.conversion.service.common.chart.odf2json.ChartImport;
import com.ibm.symphony.conversion.service.common.indextable.OdfToHtmlIndex;
import com.ibm.symphony.conversion.service.common.shape2image.ODFConversionPostProcessingData;
import com.ibm.symphony.conversion.service.common.shape2image.ODFDrawingParser;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;
import com.ibm.symphony.conversion.service.common.util.DraftDomFixer;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.common.util.JTidyUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;
import com.ibm.symphony.conversion.service.impl.ConversionConfig;
import com.ibm.symphony.presentation.upgrade.HtmlUpgradeConvertorFactory;
import com.ibm.symphony.presentation.upgrade.HtmlUpgradeUtils;

public class ODP2HTMLConverter extends AbstractFormatConverter
{
  private static String CONVERTOR = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_CONVERTOR, "ODP", "HTML");

  public static String CLASS = ODP2HTMLConverter.class.toString();

  private static Logger LOG = Logger.getLogger(ODP2HTMLConverter.class.getName());

  private static final String OFFICE_VERSION = "office:version";

  private static ExecutorService pool = null;

  private static final long MAX_SUBTASK_TIMEOUT = 20000; // 20 seconds per
  
  
  private HashMap<String,String> slideNameIDMap = new HashMap<String, String>();
  private ArrayList<Element> slideHrefList = new ArrayList<Element>();

  // Singleton Convertors

  private static final ShapeElementConvertor shapeConvertor = new ShapeElementConvertor();

  private static final ChartImport chartConvertor = new ChartImport();
  
  private String generateTargetFolderPath(String repositoryPath, String sourceFileName)
  {
    File targetFolder = new File(repositoryPath + File.separator + ODPConvertConstants.FILE_ODP2HTMP_TARGET_FOLDER + File.separator
        + UUID.randomUUID());
    if (!targetFolder.exists())
    {
      targetFolder.mkdirs();
    }
    return targetFolder.getPath();
  }

  private String generateTargetContentPath(String parent, String sourceFileName, String fileName)
  {
    return new File(parent, fileName).getPath();
  }

  @SuppressWarnings({ "rawtypes", "unchecked" })
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters, boolean isZip) throws ConversionException
  {
    long start = System.currentTimeMillis();
    ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_STARTS, CONVERTOR));

    if (!targetFolder.exists())
    {
      targetFolder.mkdirs();
    }

    BufferedOutputStream os = null;
    OdfDocument odf = null;

    ConversionContext context = new ConversionContext();
    ConversionResult result = new ConversionResult();

    boolean isUpgrade = false;
    String tmpOdpPath = null;

    try
    {
      context.put(ODPConvertConstants.CONTEXT_CONVERT_RESULT, result);
      /*
       * IConversionService conversionService = Activator.getDefault().getConversionService(); JSONObject config=(JSONObject)
       * conversionService.getConfig("presentation"); if(config!=null) MAX_FILE_SIZE=Integer.valueOf(config.get("max-file-size"
       * ).toString()); if(sourceFile.length()>MAX_FILE_SIZE) throw new MaxFileException
       * ("Document's size is bigger the limit:"+MAX_FILE_SIZE+" bytes");
       */
      String targetContentPath = generateTargetContentPath(targetFolder.getPath(), sourceFile.getName(),
          ODPConvertConstants.FILE_HTML_CONTENT_FILE_NAME);
      String targetMasterPath = generateTargetContentPath(targetFolder.getPath(), sourceFile.getName(),
          ODPConvertConstants.FILE_HTML_MASTER_FILE_NAME);

      File contentHtmlFile = new File(targetContentPath);
      File masterHtmlFile = new File(targetMasterPath);
      try
      {
        if (!contentHtmlFile.exists())
          contentHtmlFile.createNewFile();
        if (!masterHtmlFile.exists())
          masterHtmlFile.createNewFile();
      }
      catch (Exception e)
      {
        ODPCommonUtil.handleException(e, context, CONVERTOR);
      }

      // build index table.

      context.put(ODPConvertConstants.CONTEXT_TARGET_BASE, targetFolder.getPath());
      context.put(ODPConvertConstants.CONTEXT_SOURCE_PATH, sourceFile.getPath());
      context.put(ODPConvertConstants.CONTEXT_SLIDE_NAME_ID, slideNameIDMap);
      context.put(ODPConvertConstants.CONTEXT_SLIDE_HREF_LIST, slideHrefList);
      
      if (parameters != null && Boolean.valueOf((String) parameters.get(ODPConvertConstants.UPGRADE_VERSION)))
      {
        isUpgrade = true;
        // sourceFile = new File("F://scmainstream_converson//TestDocs//testHtml");

        FileUtil.copyDirectory(sourceFile, targetFolder);

        File odfFile = new File(sourceFile, "odfdraft");
        if (odfFile.exists())
        {
          odf = OdfPresentationDocument.loadDocument(odfFile);
        }

        String sourceConversionVersion = HtmlUpgradeUtils.getConversionVersion(sourceFile.getPath());
        ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UPGRADE, sourceConversionVersion,
                                                             ConversionConstants.CURRENT_CONVERTER_VERSION_PRESENTATION));
        parameters.put(ODPConvertConstants.SOURCE_CONVERSION_VERSION, sourceConversionVersion);
        result = upgrade(context, odfFile, targetFolder, odf, parameters);

        // then invoke new import to get latest html from old exported odp
        String newFilePath = (String) context.get(ODPConvertConstants.CONTEXT_EXPORT_CONVERT_RESULT);
        if (newFilePath != null && !newFilePath.isEmpty())
        {
          // Check for a Symphony Logfile (if the original file was a PPTX file)
          UnsupportedFeatures.parseSymphonyLogForWarnings(context);
          convert(context, newFilePath, targetFolder.getPath());

          // delete odp file with parent dir after migration is done
          tmpOdpPath = new File(newFilePath).getParent();
        }
      }
      else
      {
        // Check for a Symphony Logfile (if the original file was a PPTX file)
        UnsupportedFeatures.parseSymphonyLogForWarnings(context);

        convert(context, sourceFile.getPath(), targetFolder.getPath());
      }

      if (result.isSucceed())
      {
        // store in target folder.
        if (LOG.isLoggable(Level.FINE))
        {
          LOG.fine("target:" + targetFolder.getPath());
        }
        String width = null;
        String height = null;
        String imagesize = null;
        String poolsize = null;
        try{
        	JSONObject presentationConfig = ConversionConfig.getInstance().getSubConfig("presentation");
        	width = presentationConfig.get("image-down-size-width").toString();
        	height = presentationConfig.get("image-down-size-height").toString();
        	imagesize = presentationConfig.get("image-down-size").toString();
        	poolsize = presentationConfig.get("image-down-size-pool").toString();
        } catch (Exception e) {
        	LOG.fine("Using default image down size Max width:800, Max height:600");
        }
        int dWidth = 800;
        int dHeight = 600;
        int dImageSize = 500;
        int dPoolSize = 10;
        if(width != null)
        	dWidth = Integer.parseInt(width);
        if(height != null)
        	dHeight = Integer.parseInt(height);
        if(imagesize != null)
        	dImageSize = Integer.parseInt(imagesize);
        if(poolsize != null)
        	dPoolSize = Integer.parseInt(poolsize);
        DraftDomFixer domfixer = new DraftDomFixer();
        domfixer.fixDomByPath(targetContentPath, dWidth, dHeight, dImageSize, dPoolSize);
        
        // zip target content folder
        if (isZip)
        {
          File targetFile = new File(targetFolder.getParent(), targetFolder.getName() + ODPConvertConstants.FILE_SUFFIX_ZIP);
          FileUtil.zipFolder(targetFolder, targetFile);
          result.setConvertedFile(targetFile);
        }
        else
        {
          result.setConvertedFile(contentHtmlFile);
        }
      }
    }
    catch (Throwable t)
    {
      ODPCommonUtil.handleException(t, context, CONVERTOR);
    }
    finally
    {
      ODPMetaFile.closeResource(os);
      ODPMetaFile.closeResource(odf);

      if (tmpOdpPath != null)
        FileUtil.forceDelete(tmpOdpPath);
    }
    
    slideNameIDMap.clear();
    slideHrefList.clear();
    context.remove(ODPConvertConstants.CONTEXT_SLIDE_NAME_ID);
    context.remove(ODPConvertConstants.CONTEXT_SLIDE_HREF_LIST);
    
    long end = System.currentTimeMillis();

    ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ENDS, CONVERTOR, Long.toString(end - start)));

    if (!isUpgrade)
      gatherStatistics(context, sourceFile, targetFolder, end - start);

    return result;
  }

  @SuppressWarnings("rawtypes")
  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    String targetFolderPath = generateTargetFolderPath(conversionService.getRepositoryPath(), sourceFile.getName());
    return convert(sourceFile, new File(targetFolderPath), parameters, true);
  }

  @SuppressWarnings("rawtypes")
  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    return convert(sourceFile, targetFolder, parameters, false);
  }

  @SuppressWarnings("restriction")
  public void convert(ConversionContext context, Object input, Object output) throws Exception
  {
    BufferedOutputStream os = null;
    BufferedOutputStream mos = null; // Output Stream for master.html
    OdfDocument odf = null;
    File odfdraftTmp = null;

    try
    {
      String outputString = (String) output;

      // Create a pool of subtasks to use for tasks that can run
      // asynchronous to our main conversion thread
      if (pool == null)
      {
        int maxThreads = PresentationConfig.getThreadLimit();
        if (maxThreads == 0)
          pool = Executors.newCachedThreadPool();
        else
          pool = Executors.newFixedThreadPool(maxThreads);
      }
      context.setExecutorService(pool);

      odf = OdfPresentationDocument.loadDocument(new File((String) input));

      // Check and Log the Open Office XML Version -- Potentially add a
      // warning message in the future to the ConversionResult
      Double officeVersion = checkOdfVersion(context, odf);
      context.put(ODPConvertConstants.CONTEXT_OFFICE_VERSION, officeVersion);

      // Switch to alternate means of loading ODF File for REALLY Old
      // Formats
      if (officeVersion == 0.0 || officeVersion == 1.1)
      {
        // Copy the old File to a temporary File
        File targetDir = new File(outputString);
        odfdraftTmp = new File(outputString + File.separator + "odfdraft.tmp");
        ODPMetaFile.copyFile((String) input, targetDir, "odfdraft.tmp");

        // Close the old method access
        ODPMetaFile.closeResource(odf);

        // Reopen with the alternate means of loading
        odf = OdfPresentationDocument.loadDocument(odfdraftTmp);
      }

      // Determine the number of pages in the content.xml and whether or
      // not the limit has been exceeded
      int numberOfPages = ((OdfPresentationDocument) odf).getSlideCount();
      PresentationConfig.checkPageLimit(context, numberOfPages);

      // Create the ODF to HTML Index Table
      OdfToHtmlIndex indexTable = new OdfToHtmlIndex(outputString);
      context.put(ODPConvertConstants.CONTEXT_INDEX_TABLE, indexTable);

      // MANIFEST.XML - Convert Charts and Copy Images
      initializeContextForManifest(odf, context, outputString);

      // STYLES.XML - Convert styles
      initializeContextForStyles(odf, context);
      
      // Get the Locale info (sets in the context to enable use for font-family processing) 
      String locale = getLocaleInfo(context, odf);
      
      // Set ParagraphSummation value in context
      getParagraphSummation(context, odf);

      OdfElement styleElement = odf.getStylesDom().getRootElement();
      IConvertor styleConvertor = CSSConvertorFactory.getInstance().getConvertor(styleElement);

      styleConvertor.convert(context, styleElement, ODPConvertConstants.CONTEXT_TARGET_BASE);

      // STYLES.XML - Convert Master Styles
      OdfElement masterContent = (OdfElement) odf.getStylesDom().getElementsByTagName(ODPConvertConstants.ODF_STYLE_MASTER).item(0);
      Tidy tidy = JTidyUtil.getTidy();
      Document masterHtml = Tidy.createEmptyDocument();
      Node masterNode = masterHtml.getFirstChild();
      masterNode.appendChild(masterHtml.createElement(ODPConvertConstants.HTML_ELEMENT_HEAD));
      Element masterBody = (Element) masterNode.appendChild(masterHtml.createElement(ODPConvertConstants.HTML_ELEMENT_BODY));
      ODPConvertUtil.setAutomaticHtmlConcordId(masterBody, ODPConvertConstants.BODY_PREFIX);

      //add default style in first child of master body
      Element masterStyleContainer = (Element) masterBody.appendChild(masterHtml.createElement(ODPConvertConstants.HTML_ELEMENT_DIV));
      masterStyleContainer.setAttribute(ODPConvertConstants.CONCORD_ODF_ATTR_ID, "master_style_mode_value");
      
      initializeContextForMaster(odf, masterHtml, context);

      IConvertor htmlMasterConvertor = HtmlMasterConvertorFactory.getInstance().getConvertor(masterContent);
      htmlMasterConvertor.convert(context, masterContent, masterBody);
      String masterFileName = (String) context.get(ODPConvertConstants.CONTEXT_TARGET_BASE) + File.separator
          + ODPConvertConstants.FILE_HTML_MASTER_FILE_NAME;
      context.put(ODPConvertConstants.CONTEXT_TARGET_CONTENT_PATH, masterFileName);

      // CONTENT.XML - Convert styles and content
      OdfElement content = (OdfElement) odf.getContentDom().getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_PRESENTATION).item(0);
      Document html = Tidy.createEmptyDocument();
      Node node = html.getFirstChild();
      Node head = node.appendChild(html.createElement(ODPConvertConstants.HTML_ELEMENT_HEAD));
      Element body = (Element) node.appendChild(html.createElement(ODPConvertConstants.HTML_ELEMENT_BODY));
      Element styleContainer = (Element) body.appendChild(html.createElement(ODPConvertConstants.HTML_ELEMENT_DIV));
      styleContainer.setAttribute(ODPConvertConstants.CONCORD_ODF_ATTR_ID, "custom_style_mode_value");
      context.put(ODPConvertConstants.CONTEXT_PRESENTATION_STYLE_CONTAINER, styleContainer);
      
      // Set the Locale on the body.
      if(locale != null)
        body.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.TUNDRA+" "+locale);
      else
        body.setAttribute(ODPConvertConstants.HTML_ATTR_CLASS, ODPConvertConstants.TUNDRA);
            
      ODPConvertUtil.setAutomaticHtmlConcordId(body, ODPConvertConstants.BODY_PREFIX);
      context.put(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE, new LinkedHashMap<String, Map<String, String>>());
      context.put(ODPConvertConstants.CONTEXT_LIST_BEFORE_STYLE, new LinkedHashMap<String, Map<String, String>>());

      initializeContextForContents(odf, html, context);

      IConvertor htmlConvertor = HtmlContentConvertorFactory.getInstance().getConvertor(content);
      htmlConvertor.convert(context, content, body);
      appendContentHead(html, head, context);
      String htmlFileName = (String) context.get(ODPConvertConstants.CONTEXT_TARGET_BASE) + File.separator
          + ODPConvertConstants.FILE_HTML_CONTENT_FILE_NAME;
      context.put(ODPConvertConstants.CONTEXT_TARGET_CONTENT_PATH, htmlFileName);

      updateHrefSlideNameToID(context);      
      
      // Sync up any outstanding asynchronous subtasks
      finishAllSubTasks(context, MAX_SUBTASK_TIMEOUT);
      writeCommonStyle(context);
      // Now write out master.html and content.html since the last of the
      // updates to them are complete.
      byte[] htmlTitle = (ODPConvertConstants.HTML_TITLE).getBytes();

      mos = new BufferedOutputStream(new FileOutputStream(masterFileName));
      mos.write(htmlTitle);
      tidy.pprint(masterHtml, mos);

      performAcfScan(context, html); // Scan the HTML for Malicious content
      os = new BufferedOutputStream(new FileOutputStream(htmlFileName));
      os.write(htmlTitle);
      tidy.pprint(html, os);

      // Cleanup the Unused images
      cleanup(context, outputString);

      // save the mapping table.
      indexTable.save(odf);
    }

    finally
    {
      // Flush the Batik Cache
      LOG.fine("Flush the Batik cache");
      ODFDrawingParser.flushCache(context);

      ODPMetaFile.closeResource(os);
      ODPMetaFile.closeResource(mos);
      ODPMetaFile.closeResource(odf);

      if (odfdraftTmp != null)
      {
        odfdraftTmp.delete(); // delete the .tmp file if it exists
      }
    }
  }
  
  @SuppressWarnings("unchecked")
  private void updateHrefSlideNameToID(ConversionContext context) {
	ArrayList<Element> slideHrefList = (ArrayList<Element>) context
			.get(ODPConvertConstants.CONTEXT_SLIDE_HREF_LIST);
	HashMap<String, String> slideNameIDMap = (HashMap<String, String>) context
			.get(ODPConvertConstants.CONTEXT_SLIDE_NAME_ID);
	int size = slideHrefList.size();
	for (int i = 0; i < size; i++) {
		String aname = "xlink_href";
		Element htmlNode = slideHrefList.get(i);
		String linkString = "slideaction://?";
		String slideName = htmlNode.getAttribute(aname).substring(1); // remove # of #slide1
		if(slideNameIDMap.containsKey(slideName)) {
			//Only deal with slideName for now.  in odf link to object name is the same url eg. #title1, #outline1.
			String slideId = slideNameIDMap.get(slideName);
			htmlNode.setAttribute(aname, linkString + slideId);
		}
	}
  }

private void writeCommonStyle(ConversionContext context)
  {
    try
    {
      Map<String, Map<String, String>> styles = (Map<String, Map<String, String>>) context
          .get(ODPConvertConstants.CONTEXT_CSS_COMMON_STYLE);
      LinkedHashMap<String, Map<String, String>> cssInContent = (LinkedHashMap<String, Map<String, String>>) context
          .get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);
      Set<Entry<String, Map<String, String>>> set = cssInContent.entrySet();
      Iterator<Entry<String, Map<String, String>>> it = set.iterator();
      while (it.hasNext())
      {
        Entry<String, Map<String, String>> entry = it.next();
        if ((entry.getKey().toLowerCase().indexOf("il_") != -1 && entry.getKey().toLowerCase().indexOf("il_cs_")<0) || entry.getKey().toLowerCase().indexOf("lst-") != -1
            || entry.getKey().toLowerCase().indexOf("ml_") != -1)
          styles.put(entry.getKey(), entry.getValue());
      }
      String filePath = (String) context.get(ODPConvertConstants.CONTEXT_TARGET_BASE) + File.separator
          + ODPConvertConstants.CSS_STYLE_COMMON_FILE;
      ODPConvertUtil.writeContents(filePath, (CSSConvertUtil.globalStyle + CSSConvertUtil.symphonyDefaults + CSSConvertUtil
          .getStyleContents(styles, ODPConvertConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS)).getBytes("UTF-8"));
    }
    catch (UnsupportedEncodingException uee)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".convert");
      ODPCommonUtil.logException(context, Level.SEVERE, message, uee);
    }
  }
  /**
   * Upgrade the draft to the current version
   * 
   * @param context
   *          - the current conversion context
   * @param sourceFile
   *          - File referencing the odfdraft (if it exists)
   * @param targetFolder
   *          - the target folder containing content.html to be migrated.
   * @param odf
   *          - the existing OdfDocument. May be null if the document has not been published prior to upgrade.
   * @param parameters
   *          - parameters controlling conversion
   * @return ConversionResult containing the results.
   * @throws Exception
   */
  @SuppressWarnings({ "rawtypes", "restriction" })
  public ConversionResult upgrade(ConversionContext context, File sourceFile, File targetFolder, OdfDocument odf, Map parameters)
      throws Exception
  {
    BufferedOutputStream os = null;
    // BufferedOutputStream mos = null; // Output Stream for master.html
    BufferedInputStream inputStream = null;

    ConversionResult result = (ConversionResult) context.get("result");
    try
    {
      // Do the upgrade
      // OdfElement masterContent = (OdfElement)
      // odf.getStylesDom().getElementsByTagName(ODPConvertConstants.ODF_STYLE_MASTER).item(0);

      OdfElement content = null;
      if (odf != null)
      {
        content = (OdfElement) odf.getContentDom().getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_PRESENTATION).item(0);
      }

      File contentFile = new File(targetFolder, "content.html");
      Tidy tidy = JTidyUtil.getTidy();
      inputStream = new BufferedInputStream(new FileInputStream(contentFile));
      Document contentDoc = tidy.parseDOM(inputStream, (OutputStream) null);
      OdfToHtmlIndex indexTable = new OdfToHtmlIndex(targetFolder.getPath(), contentDoc);
      context.put(ODPConvertConstants.CONTEXT_INDEX_TABLE, indexTable);
      inputStream.close();

      File masterFile = new File(targetFolder, "master.html");
      inputStream = new BufferedInputStream(new FileInputStream(masterFile));
      Document masterDoc = tidy.parseDOM(inputStream, (OutputStream) null);
      context.put(ODPConvertConstants.CONTEXT_MASTER_HTML, masterDoc);
      inputStream.close();

      // Get the upgrade convertor
      IUpgradeConvertor htmlUpgradeConvertor = HtmlUpgradeConvertorFactory.getInstance().getConvertor(content);
      String sourceConversionVersion = (String) parameters.get(ODPConvertConstants.SOURCE_CONVERSION_VERSION);
      htmlUpgradeConvertor.doUpgrade(context, content, contentDoc, sourceConversionVersion);

      // NOTE: When/if the master.html is updated, it will need to be
      // written like the content.html is below
      performAcfScan(context, contentDoc); // Scan the HTML for Malicious content
      os = new BufferedOutputStream(new FileOutputStream(contentFile));
      tidy.pprint(contentDoc, os);
      os.close();

      masterDoc = (Document) context.get(ODPConvertConstants.CONTEXT_MASTER_HTML);
      if (masterDoc != null)
      {
        performAcfScan(context, masterDoc); // Scan the HTML for Malicious content
        os = new BufferedOutputStream(new FileOutputStream(masterFile));
        tidy.pprint(masterDoc, os);
        os.close();
      }

      // save the mapping table.
      indexTable.save(odf);
    }

    finally
    {
      ODPMetaFile.closeResource(os);
      ODPMetaFile.closeResource(inputStream);
    }
    return result;
  }

  /**
   * Perform an ACF Scan on the HTML to eliminate malicious content
   * 
   * @param context
   *          Conversion context
   * @param html
   *          the html DOM tree
   */
  private void performAcfScan(ConversionContext context, Document html)
  {
    long start = System.currentTimeMillis();

    NodeList children = html.getChildNodes();
    int numNodes = children.getLength();
    for (int i = 0; i < numNodes; i++)
    {
      performAcfScan(children.item(i));
    }

    if (PresentationConfig.isCollectPerfStats())
    {
      long end = System.currentTimeMillis();
      PerformanceAnalysis.recordAcfScanTime(context, (end - start));
    }
  }

  /**
   * Perform an ACF Scan on the HTML to eliminate malicious content by checking the attributes and then the children.
   * 
   * @param child
   *          the child node
   */
  private void performAcfScan(Node child)
  {
    List<Attr> list = null;

    NamedNodeMap attributes = child.getAttributes();
    int numAttrs = attributes.getLength();
    for (int j = 0; j < numAttrs; j++)
    {
      Node attribute = attributes.item(j);
      String name = attribute.getNodeName();
      String value = attribute.getNodeValue();

      int acfAction = suspiciousAttribute(name, value);
      if (acfAction == ACFUtil.ACF_ATTR_VALID)
      {
        // Attribute Key and Value are valid, no need to change the HTML
      }
      else if (acfAction == ACFUtil.ACF_ATTR_INVALID_VALUE)
      {
        attribute.setNodeValue(""); // Invalid Key - Set it to an empty string

        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_SUSPICIOUS_CONTENT_REMOVED, name, value);
        ODPCommonUtil.logMessage(Level.WARNING, message);
      }
      else if (acfAction == ACFUtil.ACF_ATTR_INVALID_KEY)
      {
        list = addToList((Attr) attribute, list); // Invalid Key - Add to list for later removal

        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_SUSPICIOUS_ATTRIBUTE_REMOVED, name);
        ODPCommonUtil.logMessage(Level.WARNING, message);
      }
    }

    // Remove the attribute node entirely if indicated
    if (list != null)
    {
      Iterator<Attr> iterator = list.iterator();
      while (iterator.hasNext())
      {
        Attr attribute = iterator.next();
        ((Element) child).removeAttributeNode(attribute);
      }
      list = null; // Free the collection since it could be long before it goes out of scope
    }

    NodeList children = child.getChildNodes();
    int numNodes = children.getLength();
    for (int i = 0; i < numNodes; i++)
    {
      performAcfScan(children.item(i));
    }
  }

  // Default Initial Capacity for the Token Separators HashSet
  private static final int OK_ATTRIBUTES_SET_CAPACITY = (int) (45 * 1.33) + 1;

  private static final HashSet<String> cvOkAttributes = new HashSet<String>(OK_ATTRIBUTES_SET_CAPACITY);
  static
  {
    cvOkAttributes.add("cell-text-color");
    cvOkAttributes.add("class");
    cvOkAttributes.add("clipinfo");
    cvOkAttributes.add("cnvcounter");
    cvOkAttributes.add("colspan");
    cvOkAttributes.add("contentBoxType");
    cvOkAttributes.add("contenteditable");
    cvOkAttributes.add("dcseline");
    cvOkAttributes.add("hideInSlideShow");
    cvOkAttributes.add("id");
    cvOkAttributes.add("orientation");
    cvOkAttributes.add("page-number-format");
    cvOkAttributes.add("pageheight");
    cvOkAttributes.add("pageunits");
    cvOkAttributes.add("pagewidth");
    cvOkAttributes.add("preserveforcopy");
    cvOkAttributes.add("preserveonly0");
    cvOkAttributes.add("preserveonly1");
    cvOkAttributes.add("preserveonly2");
    cvOkAttributes.add("preserveonly3");
    cvOkAttributes.add("preserveonly4");
    cvOkAttributes.add("preserveonly5");
    cvOkAttributes.add("preserveonly6");
    cvOkAttributes.add("preserveonly7");
    cvOkAttributes.add("preserveonly8");
    cvOkAttributes.add("preserveonly9");
    cvOkAttributes.add("preserveonly10");
    cvOkAttributes.add("preserveonly11");
    cvOkAttributes.add("preserveonly12");
    cvOkAttributes.add("preserveonly13");
    cvOkAttributes.add("preserveonly14");
    cvOkAttributes.add("preserveonly15");
    cvOkAttributes.add("removal-candidate");
    cvOkAttributes.add("rowspan");
    cvOkAttributes.add("show-on-title");
    cvOkAttributes.add("style-name");
    cvOkAttributes.add("styletemplate");
    cvOkAttributes.add("ungroupable");
    cvOkAttributes.add("type");
    cvOkAttributes.add("alt");
    cvOkAttributes.add("cellspacing");
    cvOkAttributes.add("height");
    cvOkAttributes.add("width");
    cvOkAttributes.add("field");
    cvOkAttributes.add("target");
  }

  private static int suspiciousAttribute(String name, String value)
  {
    // Check the list of OK attributes before deciding to scan
    if (cvOkAttributes.contains(name) || name.contains("_"))
    {
      return ACFUtil.ACF_ATTR_VALID;
    }

    return ACFUtil.suspiciousAttribute(name, value);
  }

  /**
   * Add nodes to a list for later removal. If the list is not created, it will be created and returned.
   * 
   * @param child
   *          - the child node
   * @param list
   *          - the list
   * @return Set list of nodes to remove
   */
  private List<Attr> addToList(Attr child, List<Attr> list)
  {
    if (list == null)
    {
      list = new ArrayList<Attr>();
    }
    list.add(child);
    return list;
  }

  @SuppressWarnings("unchecked")
  private void appendContentHead(Document html, Node head, ConversionContext context)
  {
    Map<String, Map<String, String>> contentStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE);

    Element officeLink = html.createElement(ODPConvertConstants.HTML_ELEMENT_LINK);
    officeLink.setAttribute(ODPConvertConstants.HTML_ATTR_HREF, ODPConvertConstants.CSS_STYLE_COMMON_FILE);
    officeLink.setAttribute(ODPConvertConstants.HTML_ATTR_TYPE, ODPConvertConstants.CSS_STYLE_TEXT_CSS);
    officeLink.setAttribute(ODPConvertConstants.HTML_ATTR_REL, ODPConvertConstants.CSS_STYLE_STYLESHEET);
    head.appendChild(officeLink);

    Element autoStyleLink = html.createElement(ODPConvertConstants.HTML_ELEMENT_LINK);
    autoStyleLink.setAttribute(ODPConvertConstants.HTML_ATTR_HREF, ODPConvertConstants.CSS_STYLE_AUTO_FILE);
    autoStyleLink.setAttribute(ODPConvertConstants.HTML_ATTR_TYPE, ODPConvertConstants.CSS_STYLE_TEXT_CSS);
    autoStyleLink.setAttribute(ODPConvertConstants.HTML_ATTR_REL, ODPConvertConstants.CSS_STYLE_STYLESHEET);
    head.appendChild(autoStyleLink);

    Element inlineStyle = html.createElement(ODPConvertConstants.HTML_STYLE_TAG);
    inlineStyle.setAttribute(ODPConvertConstants.HTML_ATTR_TYPE, ODPConvertConstants.CSS_STYLE_TEXT_CSS);
    head.appendChild(inlineStyle);

    /**
     * modified by pzzhang for image background special cases. [Defect 32500, Defect 32703]. Handling background re-prioritize
     */
    // mich: added cssStyleClassPrefix parameter to getStyleContents()
    // method for defect 42214 to fix the so called "one ui" issue
    Text textElement = html.createTextNode(CSSConvertUtil.marginTopOverrides
        + CSSConvertUtil.getStyleContents(contentStyles, ODPConvertConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS));
    // Text textElement =
    // html.createTextNode(CSSConvertUtil.getStyleContents(contentStyles).replaceAll(
    // "(text-align|vertical-align)([^:]*):([^;!]+);",
    // "$1$2:$3 !important;"));
    /** End added by pzzhang for the fix of defect 32500, 32703 **/

    inlineStyle.appendChild(textElement);
    
    Element listBeforStyle = html.createElement(ODPConvertConstants.HTML_STYLE_TAG);
    listBeforStyle.setAttribute(ODPConvertConstants.HTML_ATTR_TYPE, ODPConvertConstants.CSS_STYLE_TEXT_CSS);
    listBeforStyle.setAttribute("styleName", "list_before_style");
    
    
    Map<String, Map<String, String>> list_before_map = (Map<String, Map<String, String>>)context.get(ODPConvertConstants.CONTEXT_LIST_BEFORE_STYLE);
    StringBuffer sb = new StringBuffer();
    if(list_before_map != null){
			Iterator<Map.Entry<String,Map<String,String>>> itr = list_before_map.entrySet().iterator();
			while(itr.hasNext())
			{
				Entry<String, Map<String, String>> entry = itr.next();
				sb.append(entry.getKey() + entry.getValue().toString() + " ");
			}
		}
		Node textNode = html.createTextNode(sb.toString());
		listBeforStyle.appendChild(textNode);
    head.appendChild(listBeforStyle);
   
  }

  private void initializeContextForManifest(OdfDocument odf, ConversionContext context, String output)
  {
    LOG.fine("...Starting conversion of manifest information");
    try
    {
      // Copy Images to Draft
      ODPImageConvertor.SINGLETON.convert(context, odf, output);

      // Chart Support -------------------------------------------------------------
      if (PresentationConfig.isNewFeatureEnabled(PresentationConfig.FEATURE_CHARTS))
      {
        List<OdfDocument> odsChartDocs = odf.getEmbeddedDocuments(OdfMediaType.CHART);

        int numberOfCharts = odsChartDocs.size();
        HashSet<String> chartNameList = new HashSet<String>(numberOfCharts);
        if (numberOfCharts > 0)
        {
          // Convert Charts
          chartConvertor.convertAll(odf, output, false);

          String folderPath = output + File.separator + ODPConvertConstants.FILE_CHARTS_PREFIX;
          File chartsFolder = new File(folderPath);
          if (!chartsFolder.exists())
          {
            chartsFolder.mkdir();
          }

          // Compile the list of Chart Names
          for (int i = 0; i < numberOfCharts; i++)
          {
            OdfDocument odfChartDoc = odsChartDocs.get(i);
            String chartPath = odfChartDoc.getDocumentPackagePath();
            int sublen = chartPath.lastIndexOf(ODPConvertConstants.FILE_RESOURCE_SEPARATOR);
            String chartName = sublen > 0 ? chartPath.substring(0, sublen) : chartPath;
            chartNameList.add(chartName);
          }
        }

        context.put(ODPConvertConstants.CONTEXT_CHART_NAMES, chartNameList);
      }
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".initializeContextForManifest");
      ODPCommonUtil.logMessage(Level.WARNING, message);
    }
  }

  private void initializeContextForStyles(OdfDocument odf, ConversionContext context)
  {
    LOG.fine("...Starting conversion of style");
    try
    {
      context.put(ODPConvertConstants.CONTEXT_CONVERT_SOURCE, odf);
      context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT);
      context.put(ODPConvertConstants.CONTEXT_INSIDE_SHAPE, false);
      context.put(ODPConvertConstants.CONTEXT_INSIDE_SVGSHAPE, false);
      initPageLayoutProperties(odf, context);
      ODPConvertStyleMappingUtil.mappingAllStyleNodes(odf, context);
      context.put(ODPConvertConstants.CONTEXT_IN_STYLE, true);
      context.put(ODPConvertConstants.CONTEXT_DOCUMENT_TYPE, ODPConvertConstants.DOCUMENT_TYPE.STYLES);
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".initializeContextForStyles");
      ODPCommonUtil.logMessage(Level.WARNING, message);
    }
  }

  @SuppressWarnings({ "restriction", "unchecked" })
  private void initializeContextForMaster(OdfDocument odf, Document masterHtml, ConversionContext context) throws Exception
  {
    LOG.fine("...Starting conversion of master");

    context.put(ODPConvertConstants.CONTEXT_CONVERT_TARGET, masterHtml);
    context.put(ODPConvertConstants.CONTEXT_PARENT_SIZE, ODPConvertConstants.CONTEXT_PARENT_SIZE_DEFAULT);

    StackableProperties sp = new StackableProperties();
    context.put(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES, sp);

    // have to seed the stack with the font and line height from the
    // default. Otherwise line height
    // calculation won't work.

    String standard_text = CSSConvertUtil.getStyleName("standard");
    Map<String, Map<String, String>> commonStyles = (Map<String, Map<String, String>>) context
        .get(ODPConvertConstants.CONTEXT_CSS_COMMON_STYLE);

    if (commonStyles != null)
    {
      Map<String, String> standard = commonStyles.get(standard_text);

      if (standard != null)
      {
        String defaultFont = standard.get(ODPConvertConstants.CSS_FONT_FAMILY);
        String defaultLH = standard.get(ODPConvertConstants.CSS_LINE_HEIGHT);
        if (defaultFont != null || defaultLH != null)
        {
          sp.push();

          if (defaultFont != null)
          {
            sp.addProperty(ODPConvertConstants.CSS_FONT_FAMILY, defaultFont, StackableProperties.Type.CSS, null);
          }

          if (defaultLH != null)
          {
            sp.addProperty(ODPConvertConstants.CSS_LINE_HEIGHT, defaultLH, StackableProperties.Type.CSS, null);
          }
        }
      }
    }

    Element jsonElement = masterHtml.createElement(ODPConvertConstants.HTML_SCRIPT_TAG);
    Node head = masterHtml.getElementsByTagName(ODPConvertConstants.HTML_ELEMENT_HEAD).item(0);
    head.appendChild(jsonElement);

    try
    {
      // // Locate and record all Master Page Styles that are used so that
      // unused ones can be ignored
      // long start = System.currentTimeMillis();
      // HashSet<String> usedMasterPageStyles = new HashSet<String>();
      // OdfFileDom content = odf.getContentDom();
      // NodeList pages =
      // content.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_DRAWPAGE);
      // int length = pages.getLength();
      // for (int i = 0; i < length; i++)
      // {
      // DrawPageElement page = (DrawPageElement) pages.item(i);
      // String masterPageName =
      // page.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_MASTER_PAGE_NAME);
      // if ((masterPageName != null) && (masterPageName.length() > 0))
      // {
      // usedMasterPageStyles.add(masterPageName);
      // }
      // }
      // context.put(ODPConvertConstants.CONTEXT_USED_MASTER_PAGE_STYLES,
      // usedMasterPageStyles);
      // long end = System.currentTimeMillis();
      // log.info("Scanning for used master page styles = " + (end -
      // start) + " ms");

      // Locate table templates
      OdfFileDom styles = odf.getStylesDom();
      NodeList tabletemplates = styles.getElementsByTagName(ODPConvertConstants.ODF_STYLE_TABLE_TEMPLATE);
      JSONObject tableTemplateMap = new JSONObject();

      for (int i = 0; i < tabletemplates.getLength(); i++)
      {

        Node root = tabletemplates.item(i);

        if (!(root instanceof TableTableTemplateElement))
          continue;
        TableTableTemplateElement template = (TableTableTemplateElement) root;
        NodeList refMap = root.getChildNodes();
        JSONObject jsonRefMap = new JSONObject();
        for (int j = 0; j < refMap.getLength(); j++)
        {
          Node refItem = refMap.item(j);
          String refname = refItem.getNodeName();
          jsonRefMap.put(refname.substring(refname.indexOf(ODPConvertConstants.SYMBOL_COLON) + 1),
              refItem.getAttributes().getNamedItem(ODPConvertConstants.ODF_STYLE_TEXT_STYLE_NAME).getNodeValue());
        }
        String key = template.getAttributes().getNamedItem(ODPConvertConstants.ODF_STYLE_TEXT_STYLE_NAME).getNodeValue();
        if (key != null)
          tableTemplateMap.put(key, jsonRefMap);
      }

      context.put(ODPConvertConstants.CONTEXT_TABLE_TEMPLATE_REF, tableTemplateMap);

      Text textElement = masterHtml.createTextNode(tableTemplateMap.toString());
      jsonElement.appendChild(textElement);

      context.put(ODPConvertConstants.CONTEXT_IN_STYLE, true);
      context.put(ODPConvertConstants.CONTEXT_DOCUMENT_TYPE, ODPConvertConstants.DOCUMENT_TYPE.MASTER);
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".initializeContextForMaster");
      ODPCommonUtil.logMessage(Level.WARNING, message);
    }
    context.put(ODPConvertConstants.CONTEXT_OUTLINE_FONTSIZE_MAP, new HashMap<Double, Integer>());
  }

  @SuppressWarnings("restriction")
  private void initializeContextForContents(OdfDocument odf, Document html, ConversionContext context)
  {
    LOG.fine("...Starting conversion of content");
    // // For styles conversion in content.xml.

    context.put(ODPConvertConstants.CONTEXT_CONVERT_TARGET, html);
    OdfOfficeAutomaticStyles autoStyles;
    try
    {
      autoStyles = odf.getContentDom().getAutomaticStyles();
      // can not convert content styles currently, have to convert when
      // parsing.

      NodeList autoStyleList = autoStyles.getChildNodes();
      int size = autoStyleList.getLength();
      int capacity = ODPCommonUtil.calculateHashCapacity(size);
      Map<String, OdfElement> contentStylesNodeMap = new HashMap<String, OdfElement>(capacity);

      for (int i = 0; i < size; i++)
      {
        OdfElement odfElement = (OdfElement) autoStyleList.item(i);
        String styleName = odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_STYLE_NAME);
        contentStylesNodeMap.put(styleName, odfElement);

        // NOTE: This was commented out because it was causing us to
        // lose the horizontal text area alignment on export. Textarea
        // alignment
        // is different than text alignment. It controls where the
        // textarea begins and ends. Basically, if the textarea is
        // aligned in the
        // middle, some people think this is the same as text center
        // alignment. It is not. I am leaving this commented out for
        // now, but if
        // we ever figure out how to handle textarea alignment this may
        // need to be changed.

        // NodeList childrenList = odfElement.getChildNodes();
        // if (childrenList.getLength() > 0)
        // {
        // OdfElement tmp = (OdfElement)
        // OdfElement.findFirstChildNode(OdfStyleGraphicProperties.class,
        // odfElement);
        // if (tmp != null)
        // {
        // if
        // (tmp.hasAttribute(ODPConvertConstants.ODF_ATTR_DRAWTEXTAREAHORIZONTALALIGN))
        // {
        // String align =
        // tmp.getAttribute(ODPConvertConstants.ODF_ATTR_DRAWTEXTAREAHORIZONTALALIGN);
        // if (align != null &&
        // align.equals(ODPConvertConstants.HTML_ATTR_JUSTIFY))
        // {
        // tmp.setAttribute(ODPConvertConstants.ODF_ATTR_DRAWTEXTAREAHORIZONTALALIGN,
        // ODPConvertConstants.HTML_ATTR_CENTER);
        // }
        // }
        // }
        // }

      }
      context.put(ODPConvertConstants.CONTEXT_AUTOSTYLE_NODES_MAP, contentStylesNodeMap);

      context.put(ODPConvertConstants.CONTEXT_IN_STYLE, false);
      context.put(ODPConvertConstants.CONTEXT_DOCUMENT_TYPE, ODPConvertConstants.DOCUMENT_TYPE.CONTENT);
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".initializeContextForContents");
      ODPCommonUtil.logMessage(Level.WARNING, message);
    }
    context.put(ODPConvertConstants.CONTEXT_OUTLINE_FONTSIZE_MAP, new HashMap<Double, Integer>());
  }

  private void initPageLayoutProperties(OdfDocument odf, ConversionContext context)
  {
    String pageLayoutName = null;
    String pageWidth = ODPConvertConstants.CONTEXT_PAGE_WIDTH_DEFAULT;
    String pageHeight = ODPConvertConstants.CONTEXT_PAGE_HEIGHT_DEFAULT;
    String orientation = ODPConvertConstants.CONTEXT_PAGE_ORIENTATION_DEFAULT;

    OdfOfficeMasterStyles masterStyles = odf.getOfficeMasterStyles();

    Iterator<OdfStyleMasterPage> iterator = masterStyles.getMasterPages();
    while (iterator.hasNext())
    {
      OdfStyleMasterPage masterPage = (OdfStyleMasterPage) iterator.next();
      pageLayoutName = masterPage.getStylePageLayoutNameAttribute();
      break;
    }

    if (pageLayoutName != null)
    {
      try
      {
        OdfFileDom styleDom = odf.getStylesDom();
        OdfOfficeAutomaticStyles automaticStyles = styleDom.getAutomaticStyles();
        OdfStylePageLayout pageLayout = automaticStyles.getPageLayout(pageLayoutName);
        OdfStylePropertiesBase pageLayoutProperties = pageLayout.getPropertiesElement(OdfStylePropertiesSet.PageLayoutProperties);
        pageWidth = pageLayoutProperties.getOdfAttributeValue(FoPageWidthAttribute.ATTRIBUTE_NAME);
        pageHeight = pageLayoutProperties.getOdfAttributeValue(FoPageHeightAttribute.ATTRIBUTE_NAME);
        orientation = pageLayoutProperties.getOdfAttributeValue(StylePrintOrientationAttribute.ATTRIBUTE_NAME);
        outputPageSettings(context, pageLayoutProperties);
      }
      catch (Exception e)
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".initPageLayoutProperties");
        ODPCommonUtil.logMessage(Level.WARNING, message);
      }
    }

    Measure pwMeasure = Measure.parseNumber(pageWidth);
    if (pwMeasure.isINMeasure())
    {
      pwMeasure.convertINToCM();
      pageWidth = Double.toString(pwMeasure.getNumber());
      pageWidth+="cm";
    }
    context.put(ODPConvertConstants.CONTEXT_PAGE_WIDTH, pageWidth);

    Measure phMeasure = Measure.parseNumber(pageHeight);
    if (phMeasure.isINMeasure())
    {
      phMeasure.convertINToCM();
      pageHeight = Double.toString(phMeasure.getNumber());
      pageHeight+="cm";
    }
    context.put(ODPConvertConstants.CONTEXT_PAGE_HEIGHT, pageHeight);

    context.put(ODPConvertConstants.CONTEXT_PAGE_ORIENTATION, orientation);

    context.put(ODPConvertConstants.CONTEXT_IN_STYLE, false);
  }

  private void outputPageSettings(ConversionContext context, OdfStylePropertiesBase pageLayoutProperties)
  {
    JSONObject psObj = new JSONObject();
    psObj.put("orientation", pageLayoutProperties.getOdfAttributeValue(StylePrintOrientationAttribute.ATTRIBUTE_NAME));
    
    Map<String, OdfName> psMaps = new HashMap<String, OdfName>(6);
    psMaps.put("pageWidth", FoPageWidthAttribute.ATTRIBUTE_NAME);
    psMaps.put("pageHeight", FoPageHeightAttribute.ATTRIBUTE_NAME);
    psMaps.put("marginLeft", FoMarginLeftAttribute.ATTRIBUTE_NAME);
    psMaps.put("marginRight", FoMarginRightAttribute.ATTRIBUTE_NAME);
    psMaps.put("marginTop", FoMarginTopAttribute.ATTRIBUTE_NAME);
    psMaps.put("marginBottom", FoMarginBottomAttribute.ATTRIBUTE_NAME);
    
    Iterator<Entry<String, OdfName>> it = psMaps.entrySet().iterator();
    while(it.hasNext())
    {
      Entry<String, OdfName> entry = it.next();
      String value = pageLayoutProperties.getOdfAttributeValue(entry.getValue());
      value = UnitUtil.getCMLength(value) + "cm";
      psObj.put(entry.getKey(), value);
    }
    
    String targetFolderPath = (String)context.get(ODPConvertConstants.CONTEXT_TARGET_BASE);
    File psFile = new File(targetFolderPath + File.separator + "page-settings.js");
    if(psFile.exists())
      psFile.delete();
    OutputStream os = null;
    try
    {
      os = new FileOutputStream(psFile);
      psObj.serialize(os);
    }
    catch (FileNotFoundException e)
    {
      LOG.log(Level.WARNING, "Fail to write page-settings.js, FildNotFoundException", e);
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "Fail to write page-settings.js, IOException", e);
    }

    try
    {
      if( os != null)
        os.close();
    }
    catch (IOException e)
    {
      LOG.log(Level.WARNING, "Fail to close stream for page-settings.js, IOException", e);
    }
  }

  /**
   * Check and Log the Open Office XML Version -- Potentially add a warning message in the future to the ConversionResult
   * 
   * @param context
   *          - ConversionContext
   * @param odf
   *          - ODF Document
   * @return Double Office Version - 0.0 if unknown
   */
  private Double checkOdfVersion(ConversionContext context, OdfDocument odf)
  {
    Double officeVersion_d = new Double(0.0);
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
          officeVersion_d = Double.valueOf(officeVersion);
          if (officeVersion_d.compareTo(ODPConvertConstants.OFFICE_VERSION_12) < 0)
          {
            String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_OLD_ODP_VERSION, officeVersion);
            ODPCommonUtil.logMessage(Level.WARNING, message);
            UnsupportedFeatures.addUnsupportedWarning(context, UnsupportedFeatures.UNSUPPORT_FEATURE_OLD_ODF_VERSION, officeVersion);
          }
          return officeVersion_d;
        }
        line = metaData.readLine();
      }
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_OLD_ODP_VERSION, officeVersion_d);
      ODPCommonUtil.logMessage(Level.WARNING, message);
      UnsupportedFeatures.addUnsupportedWarning(context, UnsupportedFeatures.UNSUPPORT_FEATURE_OLD_ODF_VERSION, officeVersion_d.toString());
    }
    finally
    {
      ODPMetaFile.closeResource(metaData);
    }

    return officeVersion_d;
  }

  @SuppressWarnings({ "rawtypes", "unchecked", "restriction" })
  private String getLocaleInfo(ConversionContext context, OdfDocument odf) throws Exception
  {
    String locale = null; 
    OdfFileDom metadom = odf.getMetaDom();
    OdfOfficeMeta fMetadata = new OdfOfficeMeta(metadom);
    String dcLanguageValue = fMetadata.getLanguage();
    if(dcLanguageValue != null)
    {
      // odp and ppt->odp has locale info in meta.xml
      JSONObject CJKLocaleInfoMap = ConvertUtil.getCJKLocaleInfoMap();
      Iterator iter = CJKLocaleInfoMap.entrySet().iterator();
      while(iter.hasNext())
      {
        Entry<String, Map> entry = (Entry<String, Map>)iter.next();
        String dcLanguage = (String) entry.getValue().get(ODFConstants.DC_LANGUAGE);
        if(dcLanguage.equals(dcLanguageValue))
        {
          locale = entry.getKey();
          break;
        }
      }
      if(locale == null)
      {
        JSONObject unCJKLocaleInfoMap = ConvertUtil.getUnCJKLocaleInfoMap();
        iter = unCJKLocaleInfoMap.entrySet().iterator();
        while(iter.hasNext())
        {
          Entry<String, Map> entry = (Entry<String, Map>)iter.next();
          String dcLanguage = (String) entry.getValue().get(ODFConstants.DC_LANGUAGE);
          if(dcLanguage.equals(dcLanguageValue))
          {
            locale = entry.getKey();
            break;
          }
        }
      }
      
      if(locale != null)
        context.put("locale", locale);
    }
    else
    {
      // pptx->odp doesn't have locale info in meta.xml, attempt to use info in default style of style.xml.  
      // This is not accurate. Just handle Japanese and Korean.
      OdfDefaultStyle defaultStyle = odf.getStylesDom().getOfficeStyles().getDefaultStyle(OdfStyleFamily.Graphic);
      OdfStylePropertiesBase txtprop = defaultStyle.getPropertiesElement(OdfStylePropertiesSet.TextProperties);
      String countryAsian;
      String languageAsian;
      String fontNameAsian;
      if (txtprop != null)
      {
        countryAsian = txtprop.getAttribute(ODFConstants.STYLE_COUNTRY_ASIAN);
        languageAsian = txtprop.getAttribute(ODFConstants.STYLE_LANGUAGE_ASIAN);
        fontNameAsian = txtprop.getAttribute(ODFConstants.STYLE_FONT_FAMILY_ASIAN);
      }
      else
      {
        // for odp from Office, txtprop can be null
        countryAsian = "CN";
        languageAsian = "zh";
        fontNameAsian = "\'Lucida Sans Unicode\'";
      }

      JSONObject CJKLocaleInfoMap = ConvertUtil.getCJKLocaleInfoMap();
      if("JP".equals(countryAsian)&&"ja".equals(languageAsian))
      {
        Map jaMap = (Map) CJKLocaleInfoMap.get("lotusJapanese");
        String fontNameStr = (String) jaMap.get(ODFConstants.STYLE_FONT_NAME_ASIAN);
        String[] fontName = fontNameStr.split(",");
        for(int i=0; i<fontName.length; i++)
        {
          if(fontName[i].equals(fontNameAsian))
          {
            locale = "lotusJapanese";
            context.put("locale", locale);
            break;
          }
        }
      }
      else if("KR".equals(countryAsian)&&"ko".equals(languageAsian))
      {
        Map koMap = (Map) CJKLocaleInfoMap.get("lotusKorean");
        String fontNameStr = (String) koMap.get(ODFConstants.STYLE_FONT_NAME_ASIAN);
        String[] fontName = fontNameStr.split(",");
        for(int i=0; i<fontName.length; i++)
        {
          if(fontName[i].equals(fontNameAsian))
          {
            locale = "lotusKorean";
            context.put("locale", locale);
            break;
          }
        }
      }
    }
    return locale;
  }
  
  /**
   * Cleanup unneeded files from the Draft folder ((SVG, SVM, WMF, EMF, ObjectReplacements, etc.)
   * 
   * @param context
   *          Conversion Context
   * @param targetFile
   *          Target directory name
   */
  protected void cleanup(ConversionContext context, String targetFolder)
  {
    File targetDirectory = new File(targetFolder);
    cleanup(context, targetDirectory);
  }

  /**
   * Cleanup unneeded files from the Draft folder ((SVG, SVM, WMF, EMF, ObjectReplacements, etc.)
   * 
   * @param context
   *          Conversion Context
   * @param targetDirectory
   *          Target directory
   */
  protected void cleanup(ConversionContext context, File targetDirectory)
  {
    String targetDirectoryName = targetDirectory.getName();

    if (!targetDirectory.exists())
    {
      return;
    }

    File[] files = targetDirectory.listFiles();
    for (int i = 0; i < files.length; i++)
    {
      File f = files[i];
      if (f.isDirectory())
      {
        cleanup(context, f);
        if (f.getName().equals(ODPConvertConstants.FILE_OBJECT_REPLACEMENTS_FOLDER))
        {
          f.delete();
        }
      }
      else
      {
        String filename = f.getName();
        // Delete all SVG files (if not in debug mode)
        if (filename.endsWith(ODPConvertConstants.FILE_SUFFIX_SVG))
        {
          if (!PresentationConfig.isDebugGraphics())
          {
            f.delete();
          }
        }
        // Delete all Images in the ObjectReplacements folder
        else if (targetDirectoryName.equals(ODPConvertConstants.FILE_OBJECT_REPLACEMENTS_FOLDER))
        {
          f.delete();
        }
        else
        {
          // Delete all SVM, WMF, and EMF Images
          for (int j = 0; j < cvFileExtensionsToClean.length; j++)
          {
            if (filename.endsWith(cvFileExtensionsToClean[j]))
            {
              f.delete();
              break;
            }
          }
        }
      }
    }
  }

  /**
   * Finish all outstanding subtasks and update the conversion result with any conversion warnings. If the subtask requires post processing,
   * complete that as well.
   * 
   * @param context
   *          - the current ConversionContext
   * @param timeout
   *          - in milliseconds
   */
  private static void finishAllSubTasks(ConversionContext context, long timeout)
  {
    Collection<Future<?>> allTasks = context.getAllSubTasks();

    ArrayList<Future<?>> pendingTasks = new ArrayList<Future<?>>(allTasks.size() / 2); // List to hold tasks that are still
    // running.

    for (Future<?> f : allTasks)
    {
      LOG.fine("Task is done? " + f.isDone());
      if (!f.isDone())
      {
        // Add it to the pending list for handling after all the
        // completed tasks are processed
        pendingTasks.add(f);
      }
      else
      {
        finishSubTask(context, f, 0);
      }
    }
    for (Future<?> f : pendingTasks)
    {
    	finishSubTask(context, f, timeout);
    }
  }

  /**
   * Finish the specified subtask. This includes post processing if required.
   * 
   * @param context
   *          - the current ConversionContext
   * @param f
   *          - the subtask to finish
   * @param timeout
   *          - the amount of time in ms to block waiting for completion of the task. 0 means to block indefinitely (intended for use with
   *          tasks that are already done).
   */
  private static void finishSubTask(ConversionContext context, Future<?> f, long timeout)
  {
    try
    {
      Object result = null;
      if (timeout > 0)
      {
        result = f.get(timeout, TimeUnit.MILLISECONDS);
      }
      else
      {
        result = f.get();
      }
      if (result instanceof ConversionWarning)
      {
        // Post a warning (if an error is indicated)
        ConversionWarning cw = (ConversionWarning) result;
        ODPCommonUtil.addConversionError(context, cw);
      }
      else if (result instanceof ODFConversionPostProcessingData)
      {
        // Additional synchronous processing is required based on the
        // results
        ODFConversionPostProcessingData conversionResult = (ODFConversionPostProcessingData) result;
        if (conversionResult.isSuccessful())
        {
          shapeConvertor.doPostConvertHtml(context, conversionResult);
        }
        else
        {
          // Post a warning
          ConversionWarning cw = new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, true, conversionResult.getErrorDescription());
          ODPCommonUtil.addConversionError(context, cw);
        }
      }
      // Any other object we don't know what to do with so just return
    }
    catch (InterruptedException e)
    {
      ODPCommonUtil.addConversionError(context, new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, true, e.getLocalizedMessage(),
          ODPCommonUtil.createMessage(ODPCommonUtil.LOG_SUBTASK_EXCEPTION, "InterruptedException")));
    }
    catch (ExecutionException e)
    {
      ODPCommonUtil.addConversionError(context, new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, true, e.getLocalizedMessage(),
          ODPCommonUtil.createMessage(ODPCommonUtil.LOG_SUBTASK_EXCEPTION, "ExecutionException")));
    }
    catch (TimeoutException e)
    {
      ODPCommonUtil.addConversionError(context, new ConversionWarning(ConversionConstants.ERROR_UNKNOWN, true, e.getLocalizedMessage(),
          ODPCommonUtil.createMessage(ODPCommonUtil.LOG_SUBTASK_EXCEPTION, "TimeoutException")));
    }
  }

  private static final String[] cvFileExtensionsToClean = { ODPConvertConstants.FILE_SUFFIX_SVM, ODPConvertConstants.FILE_SUFFIX_WMF,
      ODPConvertConstants.FILE_SUFFIX_EMF };

  /**
   * Gather performance statistics for presentation conversion
   * 
   * @param context
   *          Conversion Context
   * @param sourceFile
   *          Source file or directory
   * @param targetFile
   *          Target directory or File
   * @param timeToConvert
   *          Amount of time taken to convert the file (in milliseconds)
   */
  protected void gatherStatistics(ConversionContext context, File sourceFile, File targetFile, long timeToConvert)
  {
    if (PresentationConfig.isCollectPerfStats())
    {
      String filename = sourceFile.getPath();
      PerformanceAnalysis.recordConversionTime(context, PerformanceAnalysis.ODP2HTML, filename, timeToConvert);
      PerformanceAnalysis.gatherStatistics(context, PerformanceAnalysis.ODP2HTML, sourceFile);
    }
  }
  
  private static void getParagraphSummation(ConversionContext context, OdfDocument odfDoc) throws Exception
  {
    context.put("ParagraphSummation", false);
    NodeList nodelist = odfDoc.getSettingsDom().getElementsByTagName(ODFConstants.CONFIG_CONFIG_ITEM);
    int len = nodelist.getLength();
    for(int i=0; i<len; i++)
    {
      String configName = ((Element) nodelist.item(i)).getAttribute(ODFConstants.CONFIG_NAME);
      if("ParagraphSummation".equals(configName))
      {
        Node node = nodelist.item(i).getFirstChild();
        if(node instanceof Text)
        {
          Text txtElement = (Text) node;
          String txt = txtElement.getNodeValue();
          if("true".equals(txt))
            context.put("ParagraphSummation", true);
        }
        break;
      }
    }
  }
}
