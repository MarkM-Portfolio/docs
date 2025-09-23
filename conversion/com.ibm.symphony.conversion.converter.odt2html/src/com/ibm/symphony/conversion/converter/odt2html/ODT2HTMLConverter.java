/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.odt2html;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfDefaultStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextOutlineLevelStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextOutlineStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.element.office.OfficeBodyElement;
import org.odftoolkit.odfdom.dom.element.office.OfficeMasterStylesElement;
import org.odftoolkit.odfdom.dom.element.office.OfficeTextElement;
import org.odftoolkit.odfdom.dom.element.style.StyleFooterElement;
import org.odftoolkit.odfdom.dom.element.style.StyleHeaderElement;
import org.odftoolkit.odfdom.dom.element.style.StyleMasterPageElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.odftoolkit.odfdom.incubator.meta.OdfMetaDocumentStatistic;
import org.odftoolkit.odfdom.incubator.meta.OdfOfficeMeta;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import symphony.org.w3c.tidy.Tidy;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.odt2html.convertor.ODTConvertorUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.css.CSSConvertorFactory;
import com.ibm.symphony.conversion.converter.odt2html.convertor.css.CSSConvertorUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.css.CSSConvertorUtil.LevelsWrapper;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.HtmlConvertorFactory;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.HtmlConvertorUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.ListConvertor;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.CounterUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.ListSymbolUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.list.ListUtil;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.upgrade.HtmlUpgradeConvertorFactory;
import com.ibm.symphony.conversion.converter.odt2html.convertor.html.upgrade.UpgradeConvertorUtil;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConversionLogger;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.service.common.indextable.OdfToHtmlIndex;
import com.ibm.symphony.conversion.service.common.shape2image.ODFDrawingParser;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.common.util.JTidyUtil;
import com.ibm.symphony.conversion.service.common.util.StringPool;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class ODT2HTMLConverter extends AbstractFormatConverter
{
  private static final String BEFORE = ":before";

  private static final String TARGET_FOLDER = "output" + File.separator + "odt2html";

  private static final String SUFFIX_HTML = ".html";

  private static final String SUFFIX_ZIP = ".zip";

  private static final String TARGET_FILENAME = "content" + SUFFIX_HTML;

  private static final String TARGET_CSS_FILENAME = "style.css";
  
  private static final String PAGE_SETTINGS_FILENAME = "page-settings.js";
  
  private static int MAX_CONVERSION_PAGE_COUNT = 0;

  private static int MAX_CONVERSION_KBYTE_SIZE = 0;

  Logger log = Logger.getLogger(ODT2HTMLConverter.class.getName());

  private static final ExecutorService pool = Executors.newCachedThreadPool();

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

  /**
   * Generate target content path
   * 
   * @param parent
   *          -- parent path
   * @param sourceFileName
   *          -- source file name, not used currently
   * @return
   */
  private String generateTargetContentPath(String parent, String sourceFileName)
  {
    return new File(parent, TARGET_FILENAME).getPath();
  }

  private String generateCSSFilePath(String parent)
  {
    return new File(parent, TARGET_CSS_FILENAME).getPath();
  }

  private String checkDocumentSize(OdfDocument odfDoc) throws Exception
  {
    if (MAX_CONVERSION_PAGE_COUNT == 0 || MAX_CONVERSION_KBYTE_SIZE == 0)
      readMaxValues();
    OdfFileDom metaDom = odfDoc.getMetaDom();
    OdfOfficeMeta officeMeta = new OdfOfficeMeta(metaDom);
    OdfMetaDocumentStatistic docStat = officeMeta.getDocumentStatistic();
    if (docStat != null)
    {
      Integer pageCount = docStat.getPageCount();
      if (pageCount != null)
      {
        if (pageCount.intValue() > MAX_CONVERSION_PAGE_COUNT)
        {
          log.finer("Page count:" + pageCount);
          return ConversionConstants.ERROR_DOCUMENT_EXCEED_PAGE_COUNT;
        }
        else
          return null;
      }
    }

    OdfElement officeText = (OdfElement) odfDoc.getContentDom().getRootElement().getElementsByTagName(ODFConstants.OFFICE_TEXT).item(0);
    int txtLength = officeText.getTextContent().getBytes("UTF8").length;
    if (txtLength > (MAX_CONVERSION_KBYTE_SIZE + 1) * 1024)
    {
      return ConversionConstants.ERROR_DOCUMENT_EXCEED_PAGE_CHARACTER;
    }

    return null;
  }

  private static void readMaxValues()
  {
    JSONObject docConfItem = (JSONObject) ConversionService.getInstance().getConfig("document");
    if (docConfItem != null)
    {
      MAX_CONVERSION_PAGE_COUNT = ((Long) docConfItem.get("max-page-count")).intValue();
      MAX_CONVERSION_KBYTE_SIZE = ((Long) docConfItem.get("max-pure-text-size")).intValue();
    }
    else
    {
      MAX_CONVERSION_PAGE_COUNT = 100;
      MAX_CONVERSION_KBYTE_SIZE = 512;
    }
  }

  private ConversionResult upgrade(ConversionContext context, File sourceFile, File targetFile, OdfDocument odf, Map parameters)
      throws ConversionException
  {

    BufferedOutputStream os = null;
    InputStream in = null;
    ConversionResult result = (ConversionResult) context.get("result");
    try
    {
      Tidy tidy = JTidyUtil.getTidy();
      in = new FileInputStream(targetFile);
      Document htmlDoc = tidy.parseDOM(in, (OutputStream) null);
      OdfToHtmlIndex indexTable = new OdfToHtmlIndex(sourceFile.getParent(), htmlDoc);
      context.setOdfToHtmlIndexTable(indexTable);
      context.put("source", odf);
      context.put("target", htmlDoc);
      Map<String, Map<String, String>> cssMap = createCSSMap();
      context.put("CSSStyle", cssMap);
      context.put("contentRootNode", ODFConstants.OFFICE_TEXT);
      ODPConvertStyleMappingUtil.mappingAllStyleNodes(odf, context);

      OdfElement root = odf.getContentDom().getRootElement();
      OfficeBodyElement odfBody = OdfElement.findFirstChildNode(OfficeBodyElement.class, root);
      Node htmlBody = indexTable.getFirstHtmlNode(odfBody);
      if (htmlBody == null)
        return result;

      OdfElement content = OdfElement.findFirstChildNode(OfficeTextElement.class, odfBody);
      String bodyId = ((Element) htmlBody).getAttribute(HtmlCSSConstants.ID);
      context.put("BodyId", bodyId);

      // Set TabRelateToIndent value in context
      ConvertUtil.getTabRelateToIndent(context, odf);

      // style Map
      Map<String, Map<String, String>> stylesMap = new HashMap<String, Map<String, String>>();
      convertStyle(context, odf, stylesMap);

      // upgrade existing features
      
      String oldVersion = (String) parameters.get("curDraftVersion");
      if(oldVersion == null)
    	  oldVersion = UpgradeConvertorUtil.readVersionText(new File(sourceFile.getParentFile(), "conversionVersion.txt"));
      if (oldVersion != null && oldVersion.length() > 0)
      {
        JSONArray jArray = UpgradeConvertorUtil.getUpgradedElements(oldVersion);
        if (jArray != null)
          context.put("upgradedElements", jArray);
      }
      
      //1.0.1 -> 1.0.3 no html and odf update, only style convert to string pool.
      if(oldVersion != null && oldVersion.equals("1.0.1") && ConversionConstants.CURRENT_CONVERTER_VERSION_DOCUMENT.equals("1.0.3"))
      {
        indexTable.save(odf);        
        return result;
      }

      // Convert to html for new features
      log.finer("Convert contents in content.xml.");
      IConvertor htmlConvertor = HtmlUpgradeConvertorFactory.getInstance().getConvertor("CONVERT_CHILD");
      htmlConvertor.convert(context, content, htmlBody);
      addAnchor(context);
      addParagraph(context, (Element) htmlBody);

      // Convert Header && Footer section
      log.finer("Convert Header && Footer section.");
      OdfElement styleRoot = (OdfElement) odf.getStylesDom().getRootElement();
      convertHeaderFooter(context, styleRoot, htmlDoc, htmlBody);

      indexTable.save(odf);

      os = new BufferedOutputStream(new FileOutputStream(targetFile));

      log.finer("Document upgrading is finished.");
      context.finishAllSubTasks();
      tidy.pprint(htmlDoc, os);
    }
    catch (Throwable e)
    {
      ConversionLogger.log(log, Level.SEVERE, 100, e.getMessage(), e);
      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    finally
    {
      odf.close();
      
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (IOException e)
        {
          ConversionLogger.log(log, Level.SEVERE, 100, e.getMessage(), e);
          ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
          result.addWarning(ce);
        }
      }
      if (in != null)
      {
        try
        {
          in.close();
        }
        catch (IOException e)
        {
          ConversionLogger.log(log, Level.SEVERE, 100, e.getMessage(), e);
          ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
          result.addWarning(ce);
        }
      }
    }
    return result;
  }

  private ConversionResult convert(File sourceFile, File targetFolder, Map parameters, boolean isZip) throws ConversionException
  {
    log.entering(getClass().getName(), "convert", sourceFile.getName());
    log.info("source: " + sourceFile.getName());
    log.info("target: " + targetFolder);
    long beginTime = System.currentTimeMillis();
    BufferedOutputStream os = null;
    //InputStream sourceFileStream = null;
    ConversionResult result = new ConversionResult();
    OdfDocument odf = null;

    ConversionContext context = new ConversionContext();
    try
    {
      context.setExecutorService(pool);
      context.put("result", result);
      context.put("targetFolder", targetFolder);
      context.put("srcType", "odt");
      IConversionService conversionService = ConversionService.getInstance();

      String targetContentPath = generateTargetContentPath(targetFolder.getPath(), sourceFile.getName());
      String htmlFileName = targetContentPath;
      OdfToHtmlIndex indexTable = new OdfToHtmlIndex(targetFolder.getPath());
      context.setOdfToHtmlIndexTable(indexTable);
      StringPool stringPool;
      if (parameters != null && Boolean.valueOf((String) parameters.get("upgradeVersion")))
      {
        context.put("isUpgrade", true);

        FileUtil.copyDirectory(sourceFile, targetFolder);
        stringPool = StringPool.load(targetFolder);
        context.put("stringPool", stringPool);

        File odfFile = new File(targetFolder, "odfdraft");
        if(odfFile.exists())
        {
          File odfFileTmp = new File(targetFolder, "odfdraft.tmp");
          odfFile.renameTo(odfFileTmp);
          
          odf = OdfDocument.loadDocument(odfFileTmp);

          File htmlFile = new File(targetFolder, "content.html");
          htmlFileName = htmlFile.getAbsolutePath();

          result = upgrade(context, odfFile, htmlFile, odf, parameters);  
        }
        else
        {
          File htmlFile = new File(targetFolder, "content.html");
          htmlFileName = htmlFile.getAbsolutePath();          
        }
      }
      else
      {
        stringPool = StringPool.createStringPool();
        context.put("stringPool", stringPool);

        context.put("isUpgrade", false);
        //sourceFileStream = new FileInputStream(sourceFile);
        odf = OdfDocument.loadDocument(sourceFile);
        boolean ignoreLimit = (parameters != null && Boolean.valueOf((String) parameters.get("isPublished")));

        if (!ignoreLimit)
        {
          String ret = checkDocumentSize(odf);
          if(ret != null)
          {
            ConversionWarning ce = new ConversionWarning(ConversionConstants.ERROR_FILE_IS_TOO_LARGE, false, "", "File size is greater than predefined max pages/characters");
            Map<String, String> params = new HashMap<String, String>();
            params.put("conv_err_code", ret);
            ce.setParameters(params);
            result.addWarning(ce);
            result.setSucceed(false);
            return result;
          }
        }
        log.finer("File size checking is OK.");

        OdfElement root = odf.getContentDom().getRootElement();
        // check old ODF version
        String version = root.getAttribute(ODFConstants.ODF_ATTR_OFFICE_VERSION);
        if (version != null && !version.equals("1.2"))
        {
          ConversionWarning cw = new ConversionWarning(ConversionConstants.WARNING_OLD_ODF_VERSION, false, "", "Old ODF version: "
              + version);
          result.addWarning(cw);
        }
        OdfElement content = (OdfElement) root.getElementsByTagName(ODFConstants.OFFICE_TEXT).item(0);

        Tidy tidy = JTidyUtil.getTidy();
        Document html = Tidy.createEmptyDocument();
        Node node = html.getFirstChild();

        Node head = node.appendChild(html.createElement("head"));
        // <link type="text/css" rel="stylesheet" href="style.css" />
        Element link = (Element) head.appendChild(html.createElement("link"));
        HtmlConvertorUtil.setAttribute(link,"type", "text/css",false);
        HtmlConvertorUtil.setAttribute(link,"rel", "stylesheet",false);
        HtmlConvertorUtil.setAttribute(link,"href", "style.css?timestamp=" + System.nanoTime(),false);
        

        OfficeBodyElement odfBody = OdfElement.findFirstChildNode(OfficeBodyElement.class, root);
        Element htmlBody = html.createElement("body");

        String bodyId = DOMIdGenerator.generate();
        if (bodyId.length() > 7)
        {
          bodyId = "id_" + bodyId.substring(bodyId.length() - 4);
        }
        HtmlConvertorUtil.setAttribute(htmlBody,HtmlCSSConstants.ID, bodyId,false);
        context.put("BodyId", bodyId);
        indexTable.addEntryByOdfNode(odfBody, bodyId, IndexUtil.RULE_NORMAL);

        // Locale info will be set in setLocaleInfo().
        String locale = getLocaleInfo(context, odf);
        if(locale != null)
          HtmlConvertorUtil.setAttribute(htmlBody,"class", "concord_Doc_Style_1 "+locale,false);
        else
          HtmlConvertorUtil.setAttribute(htmlBody,"class", "concord_Doc_Style_1",false);
        
        Node body = node.appendChild(htmlBody);
        context.put("source", odf);
        context.put("target", html);
        Map<String, Map<String, String>> cssMap = createCSSMap();
        context.put("CSSStyle", cssMap);
        context.put("contentRootNode", ODFConstants.OFFICE_TEXT);
        ODPConvertStyleMappingUtil.mappingAllStyleNodes(odf, context);

        // Add tab-stop-distance attribute to body
        applyTabStopDistanceAttribute(odf, htmlBody);
        // Set TabRelateToIndent value in context
        ConvertUtil.getTabRelateToIndent(context, odf);

        // style Map
        Map<String, Map<String, String>> stylesMap = new HashMap<String, Map<String, String>>();
        convertStyle(context, odf, stylesMap);

        // added page layout style
        applyPageStyle(context, body);
        
        // Convert to html
        log.finer("Convert contents in content.xml.");
        IConvertor htmlConvertor = HtmlConvertorFactory.getInstance().getConvertor(content);
        htmlConvertor.convert(context, content, body);
        addAnchor(context);
        addParagraph(context, htmlBody);

        generateOulineInformation(context, (Element) body);

        // Convert Header && Footer section
        log.finer("Convert Header && Footer section.");
        OdfElement styleRoot = (OdfElement) odf.getStylesDom().getRootElement();
        convertHeaderFooter(context, styleRoot, html, htmlBody);

        // applyPrintInfo(targetFolder,html,htmlBody);
        indexTable.save(odf);
        os = new BufferedOutputStream(new FileOutputStream(htmlFileName));
        os.write(("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" "
            + "\"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n").getBytes());

        log.finer("Document conversion is finished.");

        context.finishAllSubTasks();

        tidy.pprint(html, os);
        cssMap = filterUnusedListStyle(context, cssMap);
        applyGloablStyle(context, cssMap, stylesMap);
        CSSConvertorUtil.storeToCSSFile(cssMap, new File(generateCSSFilePath(targetFolder.getPath())));
      }
      stringPool.save(targetFolder);

      // zip target content folder
      if (isZip)
      {
        File targetFile = new File(targetFolder.getParent(), targetFolder.getName() + SUFFIX_ZIP);
        FileUtil.zipFolder(targetFolder, targetFile);
        result.setConvertedFile(targetFile);
      }
      else
      {
        result.setConvertedFilePath(htmlFileName);
      }

    }
    catch (Throwable e)
    {
      ConversionLogger.log(log, Level.SEVERE, 100, e.getMessage(), e);
      ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
      result.addWarning(ce);
      result.setSucceed(false);
    }
    finally
    {
      if( odf != null)
      {
        odf.close();
        File odfFileTmp = new File(targetFolder, "odfdraft.tmp");
        if( odfFileTmp.exists())
          odfFileTmp.delete();
      }
      
      ODFDrawingParser.flushCache(context);
      log.log(Level.FINEST, "flush the Batik cache.");
      if (os != null)
      {
        try
        {
          os.close();
        }
        catch (IOException e)
        {
          ConversionLogger.log(log, Level.SEVERE, 100, e.getMessage(), e);
          ConversionWarning ce = new ConversionWarning("100", false, "", e.getMessage());
          result.addWarning(ce);
        }
      }
      context.clear();
    }
    log.finer("Converted from odt to html cost:" + (System.currentTimeMillis() - beginTime) + "ms");
    log.exiting(getClass().getName(), "convert");

    
    return result;
  }

  private void convertStyle(ConversionContext context, OdfDocument odf, Map<String, Map<String, String>> stylesMap) throws Exception
  {
    // Convert style from style.xml
    log.finer("Convert style from style.xml.");
    OdfElement styleElement = odf.getStylesDom().getRootElement();
    IConvertor styleConvertor = CSSConvertorFactory.getInstance().getConvertor(styleElement);
    context.put("InplaceStyle", stylesMap);
    styleConvertor.convert(context, styleElement, stylesMap);

    // Convert style from content.xml
    log.finer("Convert automatic style from content.xml.");
    styleElement = (OdfElement) odf.getContentDom().getAutomaticStyles();
    styleConvertor.convert(context, styleElement, stylesMap);
  }
  
  private String getLocaleInfo(ConversionContext context, OdfDocument odf) throws Exception
  {
    String locale = null; 
    OdfFileDom metadom = odf.getMetaDom();
    OdfOfficeMeta fMetadata = new OdfOfficeMeta(metadom);
    String dcLanguageValue = fMetadata.getLanguage();
    if(dcLanguageValue != null)
    {
      // odt and doc->odt has locale info in meta.xml
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
      // docx->odt dosen't have locale info in meta.xml, use info in default style of style.xml.  
      // This is not accurate. Just handle Japanese and Korean.
      OdfDefaultStyle defaultStyle = odf.getStylesDom().getOfficeStyles().getDefaultStyle(OdfStyleFamily.Paragraph);
      OdfStylePropertiesBase txtprop = defaultStyle.getPropertiesElement(OdfStylePropertiesSet.TextProperties);
      String countryAsian = txtprop.getAttribute(ODFConstants.STYLE_COUNTRY_ASIAN);
      String languageAsian = txtprop.getAttribute(ODFConstants.STYLE_LANGUAGE_ASIAN);
      String fontNameAsian = txtprop.getAttribute(ODFConstants.STYLE_FONT_NAME_ASIAN);
      
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

  private Map<String, Map<String, String>> filterUnusedListStyle(ConversionContext context, Map<String, Map<String, String>> cssMap)
  {
    Set<String> usedListStyleNameSet = ListUtil.getUsedListStyleSet(context);

    Map<String, Map<String, String>> result = new HashMap<String, Map<String, String>>();
    for (String name : usedListStyleNameSet)
    {
      for (int i = 1; i <= 10; i++)
      {
        String styleName = name + "_" + i;
        String cssStyleName = ListUtil.generateCssStyleName(styleName);
        Map<String, String> styleMap = cssMap.get(cssStyleName);
        if (i == 1 && styleMap == null)
          break;

        if (styleMap != null)
          result.put(cssStyleName, styleMap);
        
        //include '.rtl' counterpart style rules
        cssStyleName = cssStyleName.replaceAll(BEFORE, "." + HtmlCSSConstants.RTL + BEFORE);
        styleMap = cssMap.get(cssStyleName);
        if (styleMap != null)
          result.put(cssStyleName, styleMap);
        
        String cssPosStyleName = ListUtil.generateCssPostionStyleName(styleName);
        styleMap = cssMap.get(cssPosStyleName);
        if (styleMap != null)
          result.put(cssPosStyleName, styleMap);
        
        //include '.rtl' counterpart style rules
        cssPosStyleName = cssPosStyleName.replaceAll(CSSConvertorUtil.LIST_CLASS_PATTERN, "$1." + HtmlCSSConstants.RTL);
        styleMap = cssMap.get(cssPosStyleName);
        if (styleMap != null)
          result.put(cssPosStyleName, styleMap);      
      }
    }
    return result;
  }

  private void applyGloablStyle(ConversionContext context, Map<String, Map<String, String>> cssMap,
      Map<String, Map<String, String>> stylesMap)
  {
    Map<String, String> defaultStyles = new HashMap<String, String>();
    defaultStyles.put(HtmlCSSConstants.PADDING, "0");
    defaultStyles.put(HtmlCSSConstants.MARGIN_BOTTOM, "0");
    defaultStyles.put(HtmlCSSConstants.MARGIN_TOP, "0");

    cssMap.put("ul, ol, p", defaultStyles);
    defaultStyles = new HashMap<String, String>();
    defaultStyles.put(HtmlCSSConstants.DISPLAY, HtmlCSSConstants.BLOCK);
    cssMap.put("li", defaultStyles);

    Map<String, String> globalDefaultStyle = stylesMap.get("default-style_paragraph");
    if (globalDefaultStyle != null)
    {
      defaultStyles = new HashMap<String, String>();

      String fontSize = globalDefaultStyle.get(HtmlCSSConstants.FONT_SIZE);

      if (fontSize != null)
      {
        defaultStyles.put(HtmlCSSConstants.FONT_SIZE, fontSize);
      }
      String fontFamily = globalDefaultStyle.get(HtmlCSSConstants.FONT_FAMILY);

      if (fontFamily != null)
      {
        defaultStyles.put(HtmlCSSConstants.FONT_FAMILY, fontFamily);
      }

      if (defaultStyles.size() > 0)
      {
        cssMap.put("li", defaultStyles);
      }
    }
    
    Map<String, String> defaultTextStyle = stylesMap.get("Default_20_Text");
    if(defaultTextStyle != null)
    {
      defaultStyles = new HashMap<String, String>();

      String fontSize = defaultTextStyle.get(HtmlCSSConstants.FONT_SIZE);

      if (fontSize != null)
      {
        defaultStyles.put(HtmlCSSConstants.FONT_SIZE, fontSize);
      }
      String fontFamily = defaultTextStyle.get(HtmlCSSConstants.FONT_FAMILY);

      if (fontFamily != null)
      {
        defaultStyles.put(HtmlCSSConstants.FONT_FAMILY, fontFamily);
      }

      if (defaultStyles.size() > 0)
      {
        cssMap.put("p", defaultStyles);
      }
    }

  }

  /**
   * private void applyPrintInfo(File targetFolder, Document htmlDoc, Element htmlBody) { Element pageLayoutDiv =
   * htmlDoc.createElement("div"); String style = htmlBody.getAttribute("style"); style = style.replace("padding-", ""); if
   * (style.indexOf("page-widths") != -1) { style = style.replace("width:", "ignore:"); style = style.replace("page-widths", "width"); }
   * style = style.replace("page-", ""); style = style.replace(";", ","); style = style.replace(" !important", ""); String pageLayout =
   * style + "header:" + this.hasHeader + ",footer:" + this.hasFooter + ","; pageLayout = pageLayout.replace("cm", "");
   * pageLayoutDiv.setAttribute("style", "display:none;"); pageLayoutDiv.setAttribute("id", "page-layout-info");
   * pageLayoutDiv.setAttribute("page-layout", pageLayout); pageLayoutDiv.setAttribute("class", "pageLayout");
   * htmlBody.appendChild(pageLayoutDiv); }
   */

  private void applyPageStyle(ConversionContext context, Node body) throws Exception
  {
    log.finer("Convert page layout style.");
    OdfDocument doc = (OdfDocument) context.getSource();
    Set<String> layoutStyles = CSSConvertorUtil.getPageLayoutStyleSet(context);
    String style = ((Element) body).getAttribute("style");
    Set<String> usedNames = CSSConvertorUtil.getUsedMasterPageNameSet(context);
    OdfElement styleRoot = doc.getStylesDom().getRootElement();
    OfficeMasterStylesElement officeMaster = OdfElement.findFirstChildNode(OfficeMasterStylesElement.class, styleRoot);

    usedNames.add("Standard");

    if (usedNames.size() > 0)
    {
      NodeList nodes = officeMaster.getElementsByTagName(ODFConstants.STYLE_MASTER_PAGE);
      Set usedLayouts = new HashSet<String>();
      // remove the unused page layout
      // step 1: collect the used page layout, different masterPage can
      // use the same page layout.
      for (int i = 0; i < nodes.getLength(); i++)
      {
        StyleMasterPageElement odfMP = (StyleMasterPageElement) nodes.item(i);
        String styleName = odfMP.getStyleNameAttribute();
        if (styleName != null && usedNames.contains(styleName))
        {
          String layoutStyle = odfMP.getStylePageLayoutNameAttribute();
          usedLayouts.add(layoutStyle);
        }
      }
      // step 2: remove the unused.
      String[] layouts = new String[layoutStyles.size()];
      layoutStyles.toArray(layouts);
      for (String layout : layouts)
      {
        if (!usedLayouts.contains(layout))
        {
          layoutStyles.remove(layout);
        }
      }

    }

    if (layoutStyles.size() > 0)
    {
      final Map<String, Map<String, String>> stylesMap = (Map<String, Map<String, String>>) context.get("InplaceStyle");

      // find the max width page layout from the used page layout.
      String maxWidthStyleName = Collections.max(layoutStyles, new Comparator<String>()
      {
        public int compare(String o1, String o2)
        {
          Map<String, String> s1 = stylesMap.get(o1);
          Map<String, String> s2 = stylesMap.get(o2);
          if (s1 == null && s2 != null)
          {
            return -1;
          }
          else if (s1 != null && s2 == null)
          {
            return 1;
          }
          else
          {
            String w1 = s1.get(HtmlCSSConstants.WIDTH);
            String w2 = s2.get(HtmlCSSConstants.WIDTH);

            if (w1 == null && w2 != null)
            {
              return -1;
            }
            else if (w1 != null && w2 == null)
            {
              return 1;
            }
            else
            {
              if (w1.contains(" "))
                w1 = w1.split(" ")[0];
              if (w2.contains(" "))
                w2 = w2.split(" ")[0];

              float fw1 = Float.parseFloat(w1.substring(0, w1.length() - 2));
              float fw2 = Float.parseFloat(w2.substring(0, w2.length() - 2));

              if (fw1 < fw2)
                return -1;
              else if (fw1 == fw2)
                return 0;
              else
                return 1;
            }
          }
        }
      });

      Map<String, String> layoutStyle = stylesMap.get(maxWidthStyleName);

      if (layoutStyle != null && layoutStyle.size() > 0)
      {
        outputPageSettings(context, layoutStyle);
        style += ConvertUtil.convertMapToStyle(layoutStyle);
        context.put("PagePaddingLeft", layoutStyle.get(HtmlCSSConstants.PADDING_LEFT));
        context.put("PagePaddingTOP", layoutStyle.get(HtmlCSSConstants.PADDING_TOP));
        HtmlConvertorUtil.setAttribute(((Element) body),"style", style);
      }
    }
  }

  //output the page setttings to json file so that Docs server/client side will read them
  //to fill the initial value for PDF print dialog
  private void outputPageSettings(ConversionContext context, Map<String, String> layoutStyle)
  {
    JSONObject psObj = new JSONObject();
    psObj.put("pageWidth", layoutStyle.get(HtmlCSSConstants.PAGE_WIDTH));
    psObj.put("pageHeight", layoutStyle.get(HtmlCSSConstants.PAGE_HEIGHT));
    psObj.put("orientation", layoutStyle.get(HtmlCSSConstants.PRINT_ORIENTATION));
    psObj.put("marginLeft", layoutStyle.get(HtmlCSSConstants.ODF_MARGIN_LEFT));//here padding is just odf margin + odf padding
    psObj.put("marginRight", layoutStyle.get(HtmlCSSConstants.ODF_MARGIN_RIGHT));
    psObj.put("marginTop", layoutStyle.get(HtmlCSSConstants.ODF_MARGIN_TOP));
    psObj.put("marginBottom", layoutStyle.get(HtmlCSSConstants.ODF_MARGIN_BOTTOM));

    File psFile = new File((File) context.get("targetFolder"), PAGE_SETTINGS_FILENAME);
    if(psFile.exists())
      psFile.delete();
    OutputStream fos = null;
    try
    {
      fos = new FileOutputStream(psFile);
      psObj.serialize(fos);
    }
    catch (FileNotFoundException e)
    {
      log.log(Level.WARNING,"Fail to output page-settings.js, FileNotFoundException",e);
    }
    catch (IOException e)
    {
      log.log(Level.WARNING,"Fail to output page-settings.js, IOException",e);
    }
    finally 
    {
      if(fos != null)
      {
        try
        {
          fos.close();
        }
        catch (IOException e)
        {
          log.log(Level.WARNING,"Fail to close page-settings.js stream, IOException",e);
        }
      }
    }
  }

  private void applyTabStopDistanceAttribute(OdfDocument odfDoc, Element htmlBody) throws Exception
  {
    OdfOfficeStyles officeStyles = odfDoc.getStylesDom().getOfficeStyles();
    OdfDefaultStyle paragraphStyle = officeStyles.getDefaultStyle(OdfStyleFamily.Paragraph);
    OdfElement paragraphElement = (OdfElement) paragraphStyle.getElementsByTagName(ODFConstants.STYLE_PARAGRAPH_PROPERTIES).item(0);
    String tabstop = paragraphElement.getAttribute(ODFConstants.STYLE_TAB_STOP_DISTANCE);
    if (tabstop != null && !tabstop.equals(""))
      HtmlConvertorUtil.setAttribute(htmlBody,HtmlCSSConstants.TAB_STOP_DISTANCE, UnitUtil.getCMLength(tabstop) + "cm");
    else
      HtmlConvertorUtil.setAttribute(htmlBody,HtmlCSSConstants.TAB_STOP_DISTANCE, "2cm",false);
  }

  private void convertHeaderFooter(ConversionContext context, OdfElement styleRoot, Document htmlDoc, Node htmlNode)
  {
    Node refNode = htmlNode.getFirstChild();
    boolean isUpgrade = UpgradeConvertorUtil.isUpgrade(context);

    OfficeMasterStylesElement officeMaster = OdfElement.findFirstChildNode(OfficeMasterStylesElement.class, styleRoot);
    if (officeMaster != null)
    {
      StyleMasterPageElement standardMasterPage = null;
      NodeList nodes = officeMaster.getElementsByTagName(ODFConstants.STYLE_MASTER_PAGE);
      for (int i = 0; i < nodes.getLength(); i++)
      {
        StyleMasterPageElement odfMP = (StyleMasterPageElement) nodes.item(i);

        if (odfMP.getStyleNameAttribute() != null && odfMP.getStyleNameAttribute().equalsIgnoreCase("standard"))
        {
          standardMasterPage = odfMP;
          break;
        }
      }

      if (standardMasterPage != null)
      {
        StyleHeaderElement header = OdfElement.findFirstChildNode(StyleHeaderElement.class, standardMasterPage);

        if (header != null)
        {
          Node headerNode = null;
          IConvertor htmlConvertor = null;
          if (!isUpgrade)
          {
            Element htmlHeader = htmlDoc.createElement("div");
            HtmlConvertorUtil.setAttribute(htmlHeader,"id", "header_div",false);
            HtmlConvertorUtil.setAttribute(htmlHeader,"class", "nolock",false);
            HtmlConvertorUtil.setAttribute(htmlHeader,"style", "display:none;",false);
            

            if (refNode == null)
              headerNode = htmlNode.appendChild(htmlHeader);
            else
              headerNode = htmlNode.insertBefore(htmlHeader, refNode);

            htmlConvertor = HtmlConvertorFactory.getInstance().getConvertor(header);
          }
          else
          {
            headerNode = ODTConvertorUtil.getChildNodeById(htmlNode, "header_div");
            htmlConvertor = HtmlUpgradeConvertorFactory.getInstance().getConvertor("CONVERT_CHILD");
          }

          if (headerNode != null)
          {
            context.put("contentRootNode", header.getNodeName());
            htmlConvertor.convert(context, header, headerNode);
          }
        }

        StyleFooterElement footer = OdfElement.findFirstChildNode(StyleFooterElement.class, standardMasterPage);

        if (footer != null)
        {
          Node footerNode = null;
          IConvertor htmlConvertor = null;
          if (!isUpgrade)
          {
            Element htmlFooter = htmlDoc.createElement("div");
            HtmlConvertorUtil.setAttribute(htmlFooter,"id", "footer_div",false);
            HtmlConvertorUtil.setAttribute(htmlFooter,"class", "nolock",false);
            HtmlConvertorUtil.setAttribute(htmlFooter,"style", "display:none;",false);

            if (refNode == null)
              footerNode = htmlNode.appendChild(htmlFooter);
            else
              footerNode = htmlNode.insertBefore(htmlFooter, refNode);

            htmlConvertor = HtmlConvertorFactory.getInstance().getConvertor(footer);
          }
          else
          {
            footerNode = ODTConvertorUtil.getChildNodeById(htmlNode, "footer_div");
            htmlConvertor = HtmlUpgradeConvertorFactory.getInstance().getConvertor("CONVERT_CHILD");
          }

          if (footerNode != null)
          {
            context.put("contentRootNode", footer.getNodeName());
            htmlConvertor.convert(context, footer, footerNode);
          }
        }
      }
    }
  }

  private Map<String, Map<String, String>> createCSSMap()
  {
    Map<String, Map<String, String>> cssMap = new LinkedHashMap<String, Map<String, String>>();
    return cssMap;
  }

  private void addAnchor(ConversionContext context)
  {
    HashSet<String> headinglinkRefList = context.getHeadinglinkRefList();

    if (!headinglinkRefList.isEmpty())
    {
      HashMap<Element, String> headingNameMap = context.getHeadingNameMap();
      Iterator iterHeadinglinkRefList = headinglinkRefList.iterator();

      while (iterHeadinglinkRefList.hasNext())
      {
        // headinglinkRefKey is href value of <a>, usually like
        // "1.headingA". headingName usually like "headingA"
        String headinglinkRef = (String) iterHeadinglinkRefList.next();
        Iterator iterator = headingNameMap.entrySet().iterator();

        while (iterator.hasNext())
        {
          Map.Entry entry = (Map.Entry) iterator.next();
          // element is <h1/h2/...>
          Element element = (Element) entry.getKey();
          String elementName = element.getAttribute(HtmlCSSConstants.NAME);
          // headingName is the content of <h1/h2/...>
          String headingName = (String) entry.getValue();

          if (headinglinkRef.endsWith(headingName) && (elementName == null || elementName.length() == 0))
          {
            String temp = headinglinkRef.substring(0, headinglinkRef.length() - headingName.length());
            if (temp.endsWith(".") || headinglinkRef.equals(headingName))
            {
              HtmlConvertorUtil.setAttribute(element,HtmlCSSConstants.NAME, headinglinkRef);
              break;
            }
          }
        }
      }
    }
  }

  public void addParagraph(ConversionContext context, Element htmlBody)
  {
    // if <body> just contain <div>, add a child node <p>. Otherwise, the
    // the cursor couldn't move out of the <div>.
    NodeList nodelist = htmlBody.getChildNodes();
    if (nodelist != null)
    {
      for (int i = 0; i < nodelist.getLength(); i++)
      {
        Node node = nodelist.item(i);
        if (node.getNodeName().equals(HtmlCSSConstants.DIV))
        {
          if (i == 0)
          {
            htmlBody.insertBefore(HtmlConvertorUtil.generateParagraphNode(context, "pForDelete"), node);
          }
          else
          {
            Node previousNode = nodelist.item(i - 1);
            if (previousNode.getNodeName().equals(HtmlCSSConstants.DIV))
            {
              htmlBody.insertBefore(HtmlConvertorUtil.generateParagraphNode(context, "pForDelete"), node);
            }

            if (i == nodelist.getLength() - 1)
            {
              htmlBody.appendChild(HtmlConvertorUtil.generateParagraphNode(context, "pForDelete"));
            }
          }
        }
      }
    }
  }

  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    IConversionService conversionService = ConversionService.getInstance();
    String targetFolderPath = generateTargetFolderPath(conversionService.getRepositoryPath(), sourceFile.getName());
    return convert(sourceFile, new File(targetFolderPath), parameters, true);
  }

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    return convert(sourceFile, targetFolder, parameters, false);
  }

  private void generateOulineInformation(ConversionContext context, Element body)
  {
    OdfStyle styleElement = CSSConvertorUtil.getStyleElement(context, "Heading_20_1", OdfStyleFamily.Paragraph);
    if (styleElement != null)
    {
      String headingListStyleName = styleElement.getAttribute(ODFConstants.STYLE_LIST_STYLE_NAME);
      StringBuilder startBuffer = new StringBuilder();
      StringBuilder typeBuffer = new StringBuilder();
      StringBuilder tabStopBuffer = new StringBuilder();

      if (headingListStyleName != null && headingListStyleName.length() > 0 && !"Outline".equals(headingListStyleName))
      {
        ListUtil.getUsedListStyleSet(context).add(headingListStyleName);
        LevelsWrapper leves = CSSConvertorUtil.getTextListStyleElement(context, headingListStyleName);
        if (leves != null)
        {

          for (int i = 1; i <= 10; i++)
          {
            OdfElement listLevel = leves.getLevel(i);
            if (listLevel != null)
            {
              if (ODFConstants.TEXT_LIST_LEVEL_STYLE_NUMBER.equals(listLevel.getNodeName()))
              {
                startBuffer.append(listLevel.getAttribute(ODFConstants.TEXT_START_VALUE));
                startBuffer.append(',');

                String format = listLevel.getAttribute(ODFConstants.STYLE_NUM_FORMAT);
                format = CounterUtil.getFormatCode(format);

                typeBuffer.append(format);
                typeBuffer.append(',');

                String dspLevels = listLevel.getAttribute(ODFConstants.TEXT_DISPLAY_LEVELS);
                if (!"1".equals(dspLevels))
                  typeBuffer.append(dspLevels);
                typeBuffer.append(':');
              }
              else if (listLevel != null && ODFConstants.TEXT_LIST_LEVEL_STYLE_BULLET.equals(listLevel.getNodeName()))
              {
                startBuffer.append(',');

                typeBuffer.append(ListSymbolUtil.extractToUnicode(listLevel.getAttribute(ODFConstants.TEXT_BULLET_CHAR)));
                typeBuffer.append(",:");
              }
              else
              {
                startBuffer.append(',');
                typeBuffer.append(",:");
              }

            }
            else
            {
              startBuffer.append(',');
              typeBuffer.append(",:");
            }
            tabStopBuffer.append(ListConvertor.getTabStopPosition(leves, i));
            tabStopBuffer.append(',');
          }

          HtmlConvertorUtil.setAttribute(body,"bulletclass", "lst-" + headingListStyleName);

        }

      }
      else
      {
        // the outline style should be applied here.
        ListUtil.getUsedListStyleSet(context).add("Outline");
        OdfDocument doc = (OdfDocument) context.getSource();
        try
        {
          OdfFileDom stylesDom = doc.getStylesDom();
          OdfTextOutlineStyle outlineStyle = stylesDom.getOfficeStyles().getOutlineStyle();
          LevelsWrapper leves = CSSConvertorUtil.generateListStyleWapper(outlineStyle);
          for (int i = 1; i <= 10; i++)
          {
            OdfTextOutlineLevelStyle outlineLevel = outlineStyle.getLevel(i);
            if (outlineLevel != null)
            {
              String format = outlineLevel.getStyleNumFormatAttribute();
              typeBuffer.append(format);
              typeBuffer.append(',');

              if (format.length() > 0)
              {
                int dspLevels = outlineLevel.getTextDisplayLevelsAttribute();
                if (1 != dspLevels)
                  typeBuffer.append(dspLevels);

                startBuffer.append(outlineLevel.getTextStartValueAttribute());
              }
            }
            else
            {
              typeBuffer.append(',');
            }
            typeBuffer.append(':');
            startBuffer.append(',');
            tabStopBuffer.append(ListConvertor.getTabStopPosition(leves, i));
            tabStopBuffer.append(',');
          }

        }
        catch (Exception e)
        {
        }
        HtmlConvertorUtil.setAttribute(body,"bulletclass", "lst-Outline",false);

      }
      String start = startBuffer.substring(0, startBuffer.length() - 1);
      HtmlConvertorUtil.setAttribute(body,"starts", start);

      String type = typeBuffer.substring(0, typeBuffer.length() - 1);
      HtmlConvertorUtil.setAttribute(body,"types", type);
      String bulleteTabStop = tabStopBuffer.substring(0, tabStopBuffer.length() - 1);
      HtmlConvertorUtil.setAttribute(body,"_firststop", bulleteTabStop);
    }
  }
}
