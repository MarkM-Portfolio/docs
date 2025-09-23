/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfPresentationDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeMasterStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyleMasterPage;
import org.odftoolkit.odfdom.doc.style.OdfStylePageLayout;
import org.odftoolkit.odfdom.dom.attribute.fo.FoPageHeightAttribute;
import org.odftoolkit.odfdom.dom.attribute.fo.FoPageWidthAttribute;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.ls.LSException;

import com.ibm.symphony.conversion.converter.html2odp.content.ODPConvertFactory;
import com.ibm.symphony.conversion.converter.html2odp.model.Division;
import com.ibm.symphony.conversion.converter.html2odp.template.TemplateConvertFactory;
import com.ibm.symphony.conversion.converter.html2odp.util.ContentConvertUtil;
import com.ibm.symphony.conversion.converter.html2odp.util.StaticResourceManager;
import com.ibm.symphony.conversion.converter.html2odp.util.StyleHashKey;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.ODPMetaFile;
import com.ibm.symphony.conversion.presentation.PerformanceAnalysis;
import com.ibm.symphony.conversion.presentation.PresentationConfig;
import com.ibm.symphony.conversion.presentation.ZIndexedElement;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.OdfDomUtil;
import com.ibm.symphony.conversion.service.common.indextable.DOMIdGenerator;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.common.util.JTidyUtil;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class HTML2ODPConverter extends AbstractFormatConverter
{
  static final int BUFFER = 2048;

  private static String CONVERTOR = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_CONVERTOR, "HTML", "ODP");

  private static final String CLASS = HTML2ODPConverter.class.toString();

  Logger log = Logger.getLogger(HTML2ODPConverter.class.getName());
  
  private HashMap<String,String> slideNameIDMap = new HashMap<String, String>();
  private ArrayList<Element> slideHrefList = new ArrayList<Element>();

  @SuppressWarnings("rawtypes")
  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    // TODO Auto-generated method stub
    IConversionService conversionService = ConversionService.getInstance();
    String conversionFilePath = conversionService.getRepositoryPath() + File.separator + ODPConvertConstants.FILE_HTML2ODP_TARGET_FOLDER
        + File.separator + UUID.randomUUID();
    File conversionFile = new File(conversionFilePath);
    conversionFile.mkdirs();
    return convert(sourceFile, conversionFile, parameters);
  }

  @SuppressWarnings("rawtypes")
  public ConversionResult convert(File sourceDraftFolder, File targetFile, Map parameters) throws ConversionException
  {
    long start = System.currentTimeMillis();
    ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_STARTS, CONVERTOR));

    ConversionContext context = new ConversionContext();
    ConversionResult result = new ConversionResult();

    OdfDocument presentationDoc = null;
    File odfdraftTemp = null;

    BufferedInputStream input = null;
    BufferedInputStream content = null;
    try
    {
      // put unique id in context
      context.put(ODPConvertConstants.CONTEXT_UNIQUE_ID, DOMIdGenerator.generate());

      context.put(ODPConvertConstants.CONTEXT_CONVERT_RESULT, result);
      
      context.put(ODPConvertConstants.CONTEXT_SLIDE_NAME_ID, slideNameIDMap);
      context.put(ODPConvertConstants.CONTEXT_SLIDE_HREF_LIST, slideHrefList);

      File contentFile = new File(sourceDraftFolder.getPath() + File.separator + ODPConvertConstants.FILE_HTML_CONTENT_FILE_NAME);
      content = new BufferedInputStream(new FileInputStream(contentFile));
      Document htmlContentDom = (Document) JTidyUtil.getTidy().parseDOM(content, null);
      Element body = (Element) htmlContentDom.getElementsByTagName(ODPConvertConstants.HTML_ELEMENT_BODY).item(0);
      // Element head = (Element)htmlContentDom.getElementsByTagName("head").item(0);
      // get the odp document first, if not have, create a new one.

      boolean isNew = false;

      File odpDraftFile = new File(sourceDraftFolder.getPath() + File.separator + ODPConvertConstants.FILE_ODF_DRAFT);

      if (odpDraftFile.exists())
      {
        odfdraftTemp = new File(sourceDraftFolder.getPath() + File.separator + IndexUtil.ODFDRAFT_NAME + ".tmp");
        odpDraftFile.renameTo(odfdraftTemp);

        presentationDoc = OdfPresentationDocument.loadDocument(odfdraftTemp);
      }
      else
      {
        input = new BufferedInputStream(StaticResourceManager.getResourceFile(ODPConvertConstants.FILE_BLANK_TEMPLATE));
        presentationDoc = OdfPresentationDocument.loadDocument(input);
        isNew = true;
      }
      context.put(ODPConvertConstants.CONTEXT_IS_NEW_DOC, isNew);
      setLocalRelatedInfo(context, body);
      presentationDoc = TemplateConvertFactory.getConvert().doConvert(targetFile, presentationDoc, body, context); // Apply tempalte
      OdfFileDom odfContentDom = (OdfFileDom) presentationDoc.getContentDom();
      // build index table.
      HtmlToOdfIndex indexTable = new HtmlToOdfIndex(sourceDraftFolder.getPath(), odfContentDom);

      OdfElement odfRoot = odfContentDom.getRootElement();

      context.put(ODPConvertConstants.CONTEXT_CONVERT_SOURCE, htmlContentDom);
      context.put(ODPConvertConstants.CONTEXT_CONVERT_TARGET, odfContentDom);
      context.setHtmlToOdfIndexTable(indexTable);
      context.put(ODPConvertConstants.CONTEXT_INDEX_TABLE, indexTable);

      // context.put("source_unzip_folder", unzippedFolder);
      context.put(ODPConvertConstants.CONTEXT_SOURCE_PATH, sourceDraftFolder.getPath());
      context.put(ODPConvertConstants.CONTEXT_TARGET_PATH, targetFile.getPath());
      context.put(ODPConvertConstants.CONTEXT_STYLES_DOM, presentationDoc.getStylesDom());

      // we need a styles map to know the styles that being parsed
      // already.

      context.put(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP_ADDED, new HashMap<String, OdfElement>());
      context.put(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP_UPDATED, new HashMap<String, OdfElement>());
      context.put(ODPConvertConstants.CONTEXT_USED_STYLE_MAP, new HashMap<String, OdfElement>());
      context.put(ODPConvertConstants.CONTEXT_PAGE_FRAME_LIST, new LinkedList<ZIndexedElement>());
      initPageLayoutProperties(presentationDoc, context);

      context.put(ODPConvertConstants.CONTEXT_NEW_LIST_STYLE_NAME_MAP, new HashMap<String, String>());
      
      context.put(ODPConvertConstants.CONTEXT_INSIDE_SVGSHAPE, false);

      // go store the CSS styles from the DOM into the context
      createCssStyleMap(context, htmlContentDom);

      /**
       * mapping some style
       */
      // ODPConvertStyleMappingUtil.mappingAllStyleNodes(presentationDoc, context);
      this.getAllStyleNameElements(presentationDoc, context);

      // First, remove the deleted nodes.
      if (!isNew)
      {
        indexTable.processDeletedHtmlNodes(htmlContentDom);
      }

      // do the conversion
      ODPConvertFactory.getInstance().getConvertor(body).convert(context, body, odfRoot);
      updateHrefSlideIDtoName(context);
      
      // coliva. save the table template style information in the styles.xml file.
      OdfFileDom stylesdom = presentationDoc.getStylesDom();

      Document constyles = (Document) context.get(ODPConvertConstants.CONTEXT_TABLE_STYLE_ELEMENTS);
      String styles_used = (String) context.get(ODPConvertConstants.CONTEXT_DEFINED_TABLE_STYLES);

      if (constyles != null && styles_used != null)
      {
        NodeList tablestylesList = constyles.getElementsByTagName(ODPConvertConstants.ODF_TABLESTYLES);

        if (tablestylesList != null && tablestylesList.getLength() > 0)
        {
          copyTableStyles(tablestylesList.item(0), stylesdom, styles_used);
        }
      }

      if (log.isLoggable(Level.FINE))
      {
        log.fine(presentationDoc.getContentDom().toString());
      }

      // // Optimize prior to saving
      // if (PresentationConfig.isEvaluateNewFeature())
      // {
      // OdfFileDom odfFileDom = presentationDoc.getContentDom();
      // OdfOfficeAutomaticStyles autoStyles = odfFileDom.getAutomaticStyles();
      // log.info("Styles before optimization: " + PresentationConfig.countStyles(autoStyles));
      // autoStyles.optimize();
      // log.info("Styles after optimization: " + PresentationConfig.countStyles(autoStyles));
      // }

      log.fine("Beginning to write the ODP file to the file system.");

      // Set <meta:generator> in meta.xml as product name
      ConvertUtil.setMetaDomMetaGenerator(presentationDoc);

      // Save the new or updated index table (NOTE: This also saves the ODF Document to the SOURCE Directory)
      File savedFile = indexTable.save(presentationDoc);

      // package concord draft to ODF package
      File convertedFile = new File(targetFile, ODPConvertConstants.FILE_CONVERTED_ODP);
      boolean packageDraft = (parameters != null) ? Boolean.valueOf((String) parameters.get("packageDraft")) : false;
      if (packageDraft)
      {
        String picFolderPath = (String) parameters.get("pictureFolder");
        OdfDomUtil.packageConcordDraft(sourceDraftFolder, presentationDoc, picFolderPath);
        presentationDoc.save(convertedFile);
      }
      else
      {
        FileUtil.copyFileToDir(savedFile, targetFile, ODPConvertConstants.FILE_CONVERTED_ODP);
      }

      result.setConvertedFile(convertedFile);
    }
    catch (LSException e1)
    {
      if (presentationDoc != null)
      {
        try
        {
          log.severe(presentationDoc.getContentDom().toString());
        }
        catch (Exception e)
        {
          // Ignore
        }
      }
      ODPCommonUtil.addMessage(context, ODPConvertConstants.UNHANDLED_ERROR, false, "", e1.getMessage(), true);
    }
    catch (Exception e)
    {
      ODPCommonUtil.handleException(e, context, CONVERTOR);
    }
    finally
    {
      ODPMetaFile.closeResource(input);
      ODPMetaFile.closeResource(content);
      ODPMetaFile.closeResource(presentationDoc);

      if (odfdraftTemp != null && odfdraftTemp.exists())
        odfdraftTemp.delete();
    }
    
    slideNameIDMap.clear();
    slideHrefList.clear();
    context.remove(ODPConvertConstants.CONTEXT_SLIDE_NAME_ID);
    context.remove(ODPConvertConstants.CONTEXT_SLIDE_HREF_LIST);
    
    long end = System.currentTimeMillis();
    ODPCommonUtil.logMessage(ODPCommonUtil.createMessage(ODPCommonUtil.LOG_ENDS, CONVERTOR, Long.toString(end - start)));

    gatherStatistics(context, sourceDraftFolder, targetFile, end - start);

    return result;
  }
  @SuppressWarnings("unchecked")
  private void updateHrefSlideIDtoName(ConversionContext context) {
	  ArrayList<Element> slideHrefList = (ArrayList<Element>) context
				.get(ODPConvertConstants.CONTEXT_SLIDE_HREF_LIST);
		HashMap<String, String> slideNameIDMap = (HashMap<String, String>) context
				.get(ODPConvertConstants.CONTEXT_SLIDE_NAME_ID);
		int size = slideHrefList.size();
		String attname = ODFConstants.XLINK_HREF; 
		for (int i = 0; i < size; i++) {
			Element odfNode = slideHrefList.get(i);
			String slideId = odfNode.getAttribute(attname);
			String slideName = slideNameIDMap.get(slideId);
			odfNode.setAttributeNS(ContentConvertUtil.getNamespaceUri(attname), attname, "#"+slideName);
		}
 }

private void initPageLayoutProperties(OdfDocument odf, ConversionContext context)
  {
    String pageLayoutName = null;
    String pageWidth = ODPConvertConstants.CONTEXT_PAGE_WIDTH_DEFAULT;
    String pageHeight = ODPConvertConstants.CONTEXT_PAGE_HEIGHT_DEFAULT;

    OdfOfficeMasterStyles masterStyles = odf.getOfficeMasterStyles();

    Iterator<OdfStyleMasterPage> iterator = masterStyles.getMasterPages();
    if (iterator.hasNext())
    {
      OdfStyleMasterPage masterPage = (OdfStyleMasterPage) iterator.next();
      pageLayoutName = masterPage.getStylePageLayoutNameAttribute();
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
      }
      catch (Exception e)
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".initPageLayoutProperties");
        ODPCommonUtil.logException(context, Level.SEVERE, message, e);
      }
    }
    //41035: Failed to edit this ODP file due to "java.lang.NullPointerException".
    if(pageWidth.indexOf("in")>0){
    	pageWidth = pageWidth.replace("in", "");
    	pageWidth = Double.parseDouble(pageWidth) *2.5 +"cm";
    } 
    if(pageHeight.indexOf("in")>0){
    	pageHeight = pageHeight.replace("in", "");
    	pageHeight = Double.parseDouble(pageHeight) *2.5 +"cm";
    }
    
    Division pageSize = new Division(pageWidth, pageHeight);
    context.put(ODPConvertConstants.CONTEXT_PAGE_SIZE, pageSize);
    context.put(ODPConvertConstants.CONTEXT_CURRENT_SIZE, pageSize);
  }

  @SuppressWarnings({ "unchecked" })
  private void getAllStyleNameElements(OdfDocument odf, ConversionContext context)
  {
    // TODO: yangjun ,should replace styleMap by ODPConvertStyleMappingUtil
    Map<String, OdfElement> sytleMap = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP);
    if (sytleMap == null)
    {
      sytleMap = new HashMap<String, OdfElement>();
      context.put(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP, sytleMap);
    }

    // HashMap indexed by StyleHashKey which contains the hashcode of the style and the sum of the hashcodes of each object.
    // This should minimize (eliminate) collisions.
    // This is stored in the context, if not already there.
    Map<StyleHashKey, ArrayList<String>> styleHashMap = (Map<StyleHashKey, ArrayList<String>>) context
        .get(ODPConvertConstants.CONTEXT_STYLES_HASHMAP);
    if (styleHashMap == null)
    {
      styleHashMap = new HashMap<StyleHashKey, ArrayList<String>>();
      context.put(ODPConvertConstants.CONTEXT_STYLES_HASHMAP, styleHashMap);
    }

    try
    {

      // check the styles.xml
      Node root = odf.getStylesDom();
      getAllStyleNameElements(root.getChildNodes(), context);
      buildStyleHashMap(root.getChildNodes(), context);
      // check the content.xml
      root = odf.getContentDom();
      getAllStyleNameElements(root.getChildNodes(), context);
      buildStyleHashMap(root.getChildNodes(), context);

      // this method should be replace the above
      ODPConvertStyleMappingUtil.mappingAllStyleNodes(odf, context);
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".getAllStyleNameElements");
      ODPCommonUtil.logException(context, Level.SEVERE, message, e);
    }

  }

  /**
   * Stored all elements which has the 'style-name' attribute into a fast map
   * 
   * @param odf
   * @param context
   * @throws Exception
   */
  // TODO: yangjun ,should replace styleMap by ODPConvertStyleMappingUtil
  @SuppressWarnings("unchecked")
  private void getAllStyleNameElements(NodeList nodeList, ConversionContext context)
  {

    // check all nodes
    for (int i = 0; i < nodeList.getLength(); i++)
    {
      Node childNode = nodeList.item(i);
      NamedNodeMap attrs = childNode.getAttributes();
      // find the style:name node then store it into the fast map
      if (attrs != null && attrs.getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_NAME) != null)
      {
        // String nodevalue = attrs.getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_NAME).getNodeValue();
        if (attrs.getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_NAME).getNodeValue().equals(ODPConvertConstants.DP224))
        {
        }
        // List<Node> styleRef = new ArrayList<Node>(1);
        // styleRef.add(childNode);
        // stored into the fast map in context
        Map<String, OdfElement> sytleMap = (Map<String, OdfElement>) context.get(ODPConvertConstants.CONTEXT_ODP_STYLES_MAP);
        sytleMap.put(attrs.getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_NAME).getNodeValue(), (OdfElement) childNode);
      }
      NodeList children = childNode.getChildNodes();
      if (children != null)
      {
        getAllStyleNameElements(children, context);
      }
    }
  }

  /**
   * Build a hash map of styles so we can see if styles already exist quickly
   * 
   * @param nodeList
   *          - nodes to prime style information from
   * @param context
   */
  // TODO: yangjun ,should replace styleMap by ODPConvertStyleMappingUtil
  private void buildStyleHashMap(NodeList nodeList, ConversionContext context)
  {

    // check all nodes
    for (int i = 0; i < nodeList.getLength(); i++)
    {
      Node n = nodeList.item(i);
      if (n.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_STYLE_DOCUMENT_CONTENT)
          || n.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_STYLE_DOCUMENT))
      {
        NodeList nodes = n.getChildNodes();
        for (int j = 0; j < nodes.getLength(); j++)
        {
          Node n2 = nodes.item(j);
          if (n2.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_STYLE_AUTO)
              || n2.getNodeName().equalsIgnoreCase(ODPConvertConstants.ODF_STYLE_COMMON))
          {
            NodeList automaticStyles = n2.getChildNodes();
            populateStyleHashMap(automaticStyles, context);
          }
        }
      }
    }
  }

  @SuppressWarnings("unchecked")
  private void populateStyleHashMap(NodeList styles, ConversionContext context)
  {
    Map<StyleHashKey, ArrayList<String>> styleHashMap = (Map<StyleHashKey, ArrayList<String>>) context
        .get(ODPConvertConstants.CONTEXT_STYLES_HASHMAP);
    for (int i = 0; i < styles.getLength(); i++)
    {
      Node childNode = styles.item(i);
      NamedNodeMap attrs = childNode.getAttributes();
      // find the style:name node then store it into the fast map
      if (attrs != null && attrs.getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_NAME) != null)
      {
        String flattenStyle = StyleHashKey.flattenAttributes((OdfElement) childNode);
        if (flattenStyle != null)
        {
          // Check to see if we have a hash collision
          StyleHashKey hash = StyleHashKey.generateKey(flattenStyle);
          ArrayList<String> hashedStyles = styleHashMap.get(hash);
          if (null == hashedStyles)
          {
            // New style add it to the hash map
            hashedStyles = new ArrayList<String>();
          }
          hashedStyles.add(attrs.getNamedItem(ODPConvertConstants.ODF_ATTR_STYLE_NAME).getNodeValue());
          styleHashMap.put(hash, hashedStyles);
        }
      }
    }
  }

  /*
   * Build a local map containing the CSS styles (text/css) from the content.html.
   * 
   * @param context
   * 
   * @param htmlContentDom
   */
  private void createCssStyleMap(ConversionContext context, Document htmlContentDom)
  {
    try
    {
      Element cssStyles = (Element) htmlContentDom.getElementsByTagName("style").item(0);

      if (cssStyles != null)
      {
        String attr = cssStyles.getAttribute("type");
        if (attr.equals(ODPConvertConstants.CSS_STYLE_TEXT_CSS))
        {
          Node child = cssStyles.getFirstChild();
          if (child != null && child.getNodeType() == Node.TEXT_NODE)
          {
            String rawStyles = child.getNodeValue();

            // strip ".concord" from the css styles
            rawStyles = rawStyles.replaceAll(ODPConvertConstants.CSS_CONCORD_SPECIFICITY_INCREASE_CLASS + " ", "");

            String styles[] = rawStyles.split("\\.*\\}"); // create array so we can build a map

            int capacity = ODPCommonUtil.calculateHashCapacity(styles.length);
            Map<String, String> cssMap = new HashMap<String, String>(capacity);

            for (int i = 0; i < styles.length; i++)
            {
              String key = "";
              String value = "";

              try
              {
                String style[] = styles[i].split("\\.*\\{"); // we have each stylename and contents in the array element, so now split those
                                                             // up

                if (style.length > 0 && style[0] != null && style[0].length() > 0)
                  key = style[0].trim();

                if (style.length == 2 && style[1] != null)
                  value = style[1];

                if (key.length() > 0)
                  cssMap.put(key, value);
              }
              catch (Exception e)
              {
                // ignore any errors during parsing of the style string
                log.fine("createCssStyleMap() - ignoring error parsing style number:" + i + ". Key=" + key + ". Value=" + value);
                log.fine(e.toString());
              }
            }

            context.put(ODPConvertConstants.CONTEXT_CSS_CONTENT_STYLE, cssMap);

          }
        }
      }
    }
    catch (Exception e)
    {
      String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".createCssStyleMap");
      ODPCommonUtil.logException(context, Level.WARNING, message, e);
    }
  }

  /**
   * Copy the table template styles into the styles.xml DOM. The structure of the new tablestyles info is as follows:
   * 
   * <tablestyles> <tablestyle style:name="table-template-style-name"> <style:style style:name="xyz" style:family="table-cell"> <-style
   * definition child nodes-> </style:style> <-other style definition nodes->
   * <table:table-template text:style-name="table-template-style-name">
   * </table:table-template>
   * </tablestyle> <-other table template style definitions-> </tablestyles>
   * 
   * @param tablestyles
   *          The root node - each child represents a new table template.
   * @param stylesdom
   *          the styles.xml dom that will receive the new style information.
   * @param styles_used
   *          space separated list of table template styles used in the current content document.
   */
  private void copyTableStyles(Node tablestyles, Document stylesdom, String styles_used)
  {
    // nothing to do if no table styles are used in the document
    if (styles_used.length() <= 0)
    {
      return;
    }

    // expected to be a single-space delimited string
    String[] stringArray = styles_used.toLowerCase().split(" ");
    List<String> styleUsedList = Arrays.asList(stringArray);

    // get the current list of table templates in the styles dom
    // don't want to add it in if it's already there.
    HashSet<String> domTableTemplates = new HashSet<String>();

    NodeList tableTemplates = stylesdom.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_TEMPLATE);
    if (tableTemplates != null)
    {
      for (int tempindex = 0; tempindex < tableTemplates.getLength(); tempindex++)
      {
        Element tabletemp = (Element) tableTemplates.item(tempindex);
        String styleName = tabletemp.getAttribute(ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME);
        domTableTemplates.add(styleName.toLowerCase());
      }
    }

    // the new table style templates will go in the office:styles section
    Node styles = stylesdom.getElementsByTagName(ODPConvertConstants.ODF_STYLE_COMMON).item(0);

    // loop through each saved table style and see if we need to copy it over
    NodeList children = tablestyles.getChildNodes();
    for (int ci = 0; ci < children.getLength(); ci++)
    {
      Node child = children.item(ci);
      String childStyle = null;

      if (child instanceof Element)
      {
        childStyle = ((Element) child).getAttribute(ODPConvertConstants.ODF_ATTR_STYLE_NAME);
      }

      if (childStyle == null)
      {
        continue;
      }

      // don't add this table template if it already exists in the styles dom
      if (domTableTemplates.contains(childStyle.toLowerCase()))
      {
        continue;
      }

      if (styleUsedList.contains(childStyle.toLowerCase()))
      {
        NodeList nodesToAdd = child.getChildNodes();
        for (int ni = 0; ni < nodesToAdd.getLength(); ni++)
        {
          copyChildren(styles, nodesToAdd.item(ni), stylesdom);
        }
      }
    }
  }

  /**
   * Copy a node and its children from source document into a second document.
   * 
   * @param parent
   *          The new parent.
   * @param toCopy
   *          The node to copy.
   * @param dom
   *          The document that will import the new node.
   */
  private void copyChildren(Node parent, Node toCopy, Document dom)
  {
    Node converted = dom.adoptNode(toCopy.cloneNode(true));
    parent.appendChild(converted);
  }

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
      String filename = targetFile.getPath();
      PerformanceAnalysis.recordConversionTime(context, PerformanceAnalysis.HTML2ODP, filename, timeToConvert);
      // PerformanceAnalysis.gatherStatistics(context, PerformanceAnalysis.HTML2ODP, targetFile);
    }
  }
  
  private String setLocalRelatedInfo(ConversionContext context, Element body)
  {
    String locale = null;
    String bodyClassName = body.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
    int startIndex = bodyClassName.indexOf("lotus");
    if (startIndex != -1)
    {
      int endIndex = bodyClassName.indexOf(" ", startIndex);
      if (endIndex != -1)
        locale = bodyClassName.substring(startIndex, endIndex);
      else
        locale = bodyClassName.substring(startIndex);

      context.put("locale", locale);
    }
    return locale;
  }
}
