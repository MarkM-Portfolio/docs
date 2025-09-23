/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.template;

import java.io.File;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Level;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfPresentationDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeMasterStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfDefaultStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleMasterPage;
import org.odftoolkit.odfdom.doc.style.OdfStylePageLayout;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.attribute.fo.FoPageHeightAttribute;
import org.odftoolkit.odfdom.dom.attribute.fo.FoPageWidthAttribute;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.element.draw.DrawFrameElement;
import org.odftoolkit.odfdom.dom.element.style.StyleTextPropertiesElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.odftoolkit.odfdom.incubator.meta.OdfOfficeMeta;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.html2odp.util.ConvertFileUtil;
import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;

public class ReplaceStyleXmlConvert
{

  // private static final String CLASS = ReplaceStyleXmlConvert.class.getName();

  // private static final Logger log = Logger.getLogger(CLASS);

  private String getNewTemplateStyleName(Element body)
  {
    String template = null, classValue = null;
    Node node = body.getFirstChild();
    // Traverse the body until we get to the first draw_page
    while (node != null)
    {
      if (node instanceof Element) // html element
      {
        Element element = (Element) node;
        classValue = element.getAttribute(ODPConvertConstants.HTML_ATTR_CLASS);
        if (classValue != null && classValue.toLowerCase().startsWith(ODPConvertConstants.HTML_CLASS_DRAW_PAGE))
        {
          // Check if a template is provided
          template = element.getAttribute(ODPConvertConstants.HTML_ATTR_DRAW_MASTER_PAGE_NAME);
          if (template != null && template.startsWith(ODPConvertConstants.SYMBOL_U))
          {
            template = template.replaceFirst(ODPConvertConstants.SYMBOL_U, ODPConvertConstants.SYMBOL_UNDERBAR);
          }
          break;
        }
        node = node.getFirstChild();
      }
      else
      // Skip past any extraneous #text nodes
      {
        node = node.getNextSibling();
        ODPCommonUtil.logMessage(Level.WARNING, ODPCommonUtil.LOG_EXTRA_TEXT_NODE);
      }
    }
    return template == null ? ODPConvertConstants.DEFAULT_TEMPLATE : template;
  }

  @SuppressWarnings("restriction")
  public OdfDocument doConvert(File targetFile, OdfDocument presentationDoc, Element body, ConversionContext context) throws Exception
  {
    String template = getNewTemplateStyleName(body);
    TemplateBean bean = ConvertTemplateUtil.getTemplate(template);
    boolean domUpdated = false;
    String path = targetFile.getPath() + File.separator + ODPConvertConstants.FILE_CONVERTED_ODP;
    File pathF = new File(path);
    OdfOfficeMasterStyles existingMasterStyles = presentationDoc.getOfficeMasterStyles();
    OdfStyleMasterPage masterPage = existingMasterStyles.getMasterPage(template);

    boolean isNew = (Boolean) context.get(ODPConvertConstants.CONTEXT_IS_NEW_DOC);
    if (bean != null && masterPage == null) // Master style changed?
    {
      String destDir = null;

      /**
       * save off the existing page layouts from the automatic styles
       */
      OdfFileDom existingStylesFile = presentationDoc.getStylesDom();
      OdfOfficeAutomaticStyles existingAutoStyles = existingStylesFile.getAutomaticStyles();
      NodeList existingPageLayouts = existingAutoStyles.getElementsByTagName(ODPConvertConstants.ODF_STYLE_PAGE_LAYOUT);
      
      /**
       * save off all the office styles.  We'll want to restore some of them after replacing styles.xml
       */
      OdfOfficeStyles existingOfficeStyles = existingStylesFile.getOfficeStyles();
      NodeList existingOfficeStylesList = existingOfficeStyles.getChildNodes();

      /**
       * save the existing DOM
       */
      destDir = targetFile.getPath() + File.separator + ODPConvertConstants.FILE_CONVERTED;
      File destDirF = new File(destDir);
      presentationDoc.save(path); // create the odp file
      ConvertFileUtil.doUnzip(path, destDir); // unzip the odp file

      /**
       * replace the styles.xml
       */
      File styleXmlFile = new File(destDir + File.separator + ODPConvertConstants.FILE_STYLES_XML);
      ConvertFileUtil.writeFileByByte(bean.getStyleXml(), styleXmlFile);

      FileUtil.zipFolder(destDirF, pathF); // zip the new odp folder
      FileUtil.cleanDirectory(destDirF); // delete the folder
      destDirF.delete();
      presentationDoc.close();
      presentationDoc = OdfPresentationDocument.loadDocument(pathF); // create the new odp file

      /**
       * add the images
       */
      String imageName;
      byte[] image;
      OdfPackage pkg = presentationDoc.getPackage();

      imageName = bean.getTitleImgName();
      image = bean.getTitleImgStream();
      pkg.insert(image, ODPConvertConstants.FILE_PICTURE_START_PREFIX + imageName, getMimeType(imageName));

      imageName = bean.getPageImgName();
      image = bean.getPageImgStream();
      pkg.insert(image, ODPConvertConstants.FILE_PICTURE_START_PREFIX + imageName, getMimeType(imageName));
      
      /**
       * restore the selected styles from the preserved styles list
       */
      if(!isNew && mergeOfficeStyles(presentationDoc, existingOfficeStylesList))
        domUpdated = true;
      
      /**
       * restore the existing page layouts and update the master as needed
       */
      if (!isNew && existingPageLayouts.getLength() > 0)
      {
        if (mergeOfficeAutomaticStyles(presentationDoc, existingPageLayouts))
          domUpdated = true;
      }
      
      /**
       * store the style name of content.xml
       */
      OdfFileDom contentFile = presentationDoc.getContentDom();
      OdfOfficeAutomaticStyles odfStylesInContent = contentFile.getAutomaticStyles();
      Iterable<OdfStyle> preStyles = odfStylesInContent.getStylesForFamily(OdfStyleFamily.Presentation);
      Map<String, OdfStyle> preMap = new HashMap<String, OdfStyle>();
      for (OdfStyle item : preStyles)
      {

        preMap.put(item.getStyleNameAttribute(), item);
      }
      context.put(ODPConvertConstants.CONTEXT_PRE_STYLE_NAME_MAP, preMap);
    }
    
    /**
     * Update the default fonts if an Asian locale is being used and the document is new.
     */
    if (setLocaleRelatedInfo(context, presentationDoc, body, isNew))
    {
      domUpdated = true;
    }
    
    if (domUpdated)
    {
      // Flush the changes. I don't know why I have to do this to enable the mainline path to be able to
      // find the updated page layouts - but this seems to work (even though it is a little drastic).
      presentationDoc.save(path);
      presentationDoc.close();
      presentationDoc = OdfPresentationDocument.loadDocument(pathF);
    }
    
    return presentationDoc;
  }

  private String getMimeType(String imageName)
  {
    String imageNameLC = imageName.toLowerCase();

    String mimeType = ODPConvertConstants.MIME_TYPE_PNG;
    if ((imageNameLC.endsWith(ODPConvertConstants.FILE_JPG)) || (imageNameLC.endsWith(ODPConvertConstants.FILE_JPEG)))
    {
      mimeType = ODPConvertConstants.MIME_TYPE_JPEG;
    }

    return mimeType;
  }
 
  /**
   * Merge the required existing office:styles into the new office:styles 
   * @param presentationDoc - OdfDocument containing the new office:styles
   * @param existingOfficeStylesList - NodeList of existing office:styles
   * @return boolean - true if the DOM was updated, false if not
   * @throws Exception
   */
  @SuppressWarnings("restriction")
  private boolean mergeOfficeStyles(OdfDocument presentationDoc, NodeList existingOfficeStylesList) throws Exception
  {
    boolean domUpdated = false;
    OdfFileDom stylesFile = presentationDoc.getStylesDom();
    OdfOfficeStyles officeStyles = stylesFile.getOfficeStyles();

    // Get new styles which can be used to position restored files into the correct section
    Iterable<OdfStyle> presentationStyles = officeStyles.getStylesForFamily(OdfStyleFamily.Presentation);
    Iterator<OdfStyle> presentationStyleList = presentationStyles.iterator();
    OdfStyle presentationStyle = presentationStyleList.next();

    OdfDefaultStyle defaultStyle = officeStyles.getDefaultStyle(OdfStyleFamily.Graphic);

    // Loop through the existing styles, restoring those which need to be restored
    int nbrOfficeStyles = existingOfficeStylesList.getLength();
    for (int i = 0; i < nbrOfficeStyles; ++i)
    {
      OdfElement existingOfficeStyle = (OdfElement) existingOfficeStylesList.item(i);
      String nodeName = existingOfficeStyle.getNodeName();
      if (!nodeName.equals(ODPConvertConstants.ODF_ATTR_STYLE_STYLE))
      {
        if (nodeName.equals(ODPConvertConstants.ODF_STYLE_DEFAULT))
        {
          // Restore the default style (if different)
          if (!defaultStyle.isEqualNode(existingOfficeStyle))
          {
            officeStyles.replaceChild(stylesFile.importNode(existingOfficeStyle, true), defaultStyle);
            domUpdated = true;
            // update our default style position
            defaultStyle = officeStyles.getDefaultStyle(OdfStyleFamily.Graphic);
          }
        }
        else if (nodeName.equals(ODPConvertConstants.ODF_STYLE_PRES_PAGE_LAYOUT)
            || nodeName.equals(ODPConvertConstants.ODF_ELEMENT_TABLETABLE_TEMPLATE))
        {
          // Only restore these if not found in the new styles.xml
          String nodeNameAttr = nodeName.equals(ODPConvertConstants.ODF_STYLE_PRES_PAGE_LAYOUT) ? ODPConvertConstants.ODF_ATTR_STYLE_NAME
              : ODPConvertConstants.ODF_ATTR_TEXT_STYLE_NAME;
          String existingStyleName = existingOfficeStyle.getAttribute(nodeNameAttr);
          NodeList newStyles = officeStyles.getElementsByTagName(nodeName);
          int nbrNewStyles = newStyles.getLength();
          Element newStyle = null;
          boolean found = false;
          for (int j = 0; j < nbrNewStyles; ++j)
          {
            newStyle = (Element) newStyles.item(j);
            if (newStyle.getAttribute(nodeNameAttr).equals(existingStyleName))
            {
              found = true;
              break;
            }
          }
          if (!found)
          {
            // Restore in the same section
            if (newStyle != null)
              officeStyles.insertBefore(stylesFile.importNode(existingOfficeStyle, true), newStyle);
            else
              officeStyles.appendChild(stylesFile.importNode(existingOfficeStyle, true));
            domUpdated = true;
          }
        }
        else
        {
          String nodeNamePrefix = existingOfficeStyle.getOdfName().getPrefix();
          if (nodeNamePrefix.equals("draw"))
          {
            // Only restore these if not found in the new styles.xml
            String existingStyleName = existingOfficeStyle.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_NAME);
            NodeList newStyles = officeStyles.getElementsByTagName(nodeName);
            int nbrNewStyles = newStyles.getLength();
            Element newStyle = null;
            boolean found = false;
            for (int j = 0; j < nbrNewStyles; ++j)
            {
              newStyle = (Element) newStyles.item(j);
              if (newStyle.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_NAME).equals(existingStyleName))
              {
                found = true;
                break;
              }
            }
            if (!found)
            {
              // Restore in this section
              if (newStyle != null)
                officeStyles.insertBefore(stylesFile.importNode(existingOfficeStyle, true), newStyle);
              else
              {
                if (defaultStyle != null)
                  officeStyles.insertBefore(stylesFile.importNode(existingOfficeStyle, true), defaultStyle);
                else
                  officeStyles.appendChild(stylesFile.importNode(existingOfficeStyle, true));
              }
              domUpdated = true;
            }
          }
        }
      }
      else
      // style:style
      {
        OdfStyle existingStyle = (OdfStyle) existingOfficeStyle;
        OdfStyleFamily existingStyleFamily = existingStyle.getFamily();
        if (existingStyleFamily == OdfStyleFamily.Graphic)
        {
          // Restore or replace
          OdfStyle newStyle = officeStyles.getStyle(existingStyle.getStyleNameAttribute(), existingStyleFamily);
          if (newStyle != null)
          {
            // Replace
            officeStyles.replaceChild(stylesFile.importNode(existingOfficeStyle, true), newStyle);
          }
          else
          {
            // Restore in the style:style graphic section
            officeStyles.insertBefore(stylesFile.importNode(existingOfficeStyle, true), presentationStyle);
          }
          domUpdated = true;
        }
        else if (existingStyleFamily == OdfStyleFamily.TableCell)
        {
          // Restore only if not found
          OdfStyle newStyle = officeStyles.getStyle(existingStyle.getStyleNameAttribute(), existingStyleFamily);
          if (newStyle == null)
          {
            // Restore in the style:style section (before used by any table templates)
            officeStyles.insertBefore(stylesFile.importNode(existingOfficeStyle, true), presentationStyle);
            domUpdated = true;
          }
        }
      }
    }
    return domUpdated;
  }
 
  /**
   * 
   * @param presentationDoc - OdfDocument containing the new office:automatic-styles
   * @param existingPageLayouts - NodeList of existing page layouts 
   * @return boolean - true if the DOM was updated, false if not
   * @throws Exception
   */
  @SuppressWarnings("restriction")
  private boolean mergeOfficeAutomaticStyles(OdfDocument presentationDoc, NodeList existingPageLayouts) throws Exception
  {
    boolean domUpdated = false;
    OdfFileDom stylesFile = presentationDoc.getStylesDom();
    OdfOfficeAutomaticStyles autoStyles = stylesFile.getAutomaticStyles();
    OdfOfficeMasterStyles masterStyles = presentationDoc.getOfficeMasterStyles();
    Iterator<OdfStyleMasterPage> styleMasters = masterStyles.getMasterPages();

    // Replace any matching presentation styles with the existing ones and add any remaining
    for (int i = 0; i < existingPageLayouts.getLength(); ++i)
    {
      OdfStylePageLayout existingPageLayout = (OdfStylePageLayout) existingPageLayouts.item(i);
      String styleName = existingPageLayout.getStyleNameAttribute();
      OdfStylePageLayout templatePageLayout = autoStyles.getPageLayout(styleName);
      if (templatePageLayout != null)
      {
        if (!existingPageLayout.isEqualNode(templatePageLayout))
        {
          // Extract the page layout width and height so we can adjust any full size
          // frames to match the existing page layout dimensions
          // Note: the draw:frames with background images in our templates use width and height dimensions that
          // are page-width + .001 and page-height + .001 so if they are page height or width (or greater), we
          // will consider the draw:frame to be full size.
          OdfStylePropertiesBase templatePageLayoutProperties = templatePageLayout
              .getPropertiesElement(OdfStylePropertiesSet.PageLayoutProperties);
          String templatePageWidth = templatePageLayoutProperties.getOdfAttributeValue(FoPageWidthAttribute.ATTRIBUTE_NAME);
          double templatePageWidth_d = Measure.extractNumber(templatePageWidth);
          String templatePageHeight = templatePageLayoutProperties.getOdfAttributeValue(FoPageHeightAttribute.ATTRIBUTE_NAME);
          double templatePageHeight_d = Measure.extractNumber(templatePageHeight);

          OdfStylePropertiesBase existingPageLayoutProperties = existingPageLayout
              .getPropertiesElement(OdfStylePropertiesSet.PageLayoutProperties);
          String existingPageWidth = existingPageLayoutProperties.getOdfAttributeValue(FoPageWidthAttribute.ATTRIBUTE_NAME);
          String existingPageHeight = existingPageLayoutProperties.getOdfAttributeValue(FoPageHeightAttribute.ATTRIBUTE_NAME);

          // Loop through and update style masters needing update
          while (styleMasters.hasNext())
          {
            OdfStyleMasterPage templateMaster = styleMasters.next();
            if (templateMaster.getStylePageLayoutNameAttribute().equals(styleName))
            {
              // Master is using the template page layout so may need some updates to height and width
              NodeList drawFrames = templateMaster.getElementsByTagName(ODPConvertConstants.ODF_ELEMENT_DRAWFRAME);
              for (int j = 0; j < drawFrames.getLength(); ++j)
              {
                DrawFrameElement drawFrame = (DrawFrameElement) drawFrames.item(j);
                String width = drawFrame.getSvgWidthAttribute();
                double width_d = Measure.extractNumber(width);
                String height = drawFrame.getSvgHeightAttribute();
                double height_d = Measure.extractNumber(height);
                if (Double.compare(width_d, templatePageWidth_d) >= 0 && Double.compare(height_d, templatePageHeight_d) >= 0)
                {
                  // The height and width of this draw:frame are essentially the same as the page height and width
                  // so this draw:frame will need to be updated to use the existing page layout height and width
                  drawFrame.setSvgWidthAttribute(existingPageWidth);
                  drawFrame.setSvgHeightAttribute(existingPageHeight);
                }
              }
            }
          }

          // Replace the template item with a clone of the existing element
          autoStyles.replaceChild(stylesFile.importNode(existingPageLayout, true), templatePageLayout);
          domUpdated = true;
        }
      }
      else
      {
        // Append a clone of the existing element
        autoStyles.appendChild(stylesFile.importNode(existingPageLayout, true));
        domUpdated = true;
      }
    }
    return domUpdated;
  }
  
  /**
   * Update the default fonts if an Asian locale is being used and the document is new.
   * NOTE: the asian font provided is currently from the CJKLocaleInfo.json file to be 
   *       consistent with the Document teams implementation.  However, this font does
   *       NOT match what the UI shows as a default font for text.  Leave for now to be
   *       consistent but this should be reviewed.
   * 
   * @param context
   *          - the current ConversionContext
   * @param presentationDoc
   *          - the OdfDocument
   * @param asianFont
   *          - the asian font to apply to the master styles
   * @return boolean - true if the text properties were updated, false if they were not.
   * @throws Exception
   */
  @SuppressWarnings({ "restriction" })
  private boolean changeFontNameAsian(ConversionContext context, OdfDocument presentationDoc, String asianFont) throws Exception
  {
    boolean textPropertiesUpdated = false;
    OdfOfficeStyles officeStyles = presentationDoc.getStylesDom().getOfficeStyles();

    // Update all styles.xml text properties to contain the correct default asian font families
    NodeList textPropertiesElements = officeStyles.getElementsByTagName(ODPConvertConstants.ODF_ATTR_STYLE_TEXT_PROPERTIES);
    int nbrTextNodes = textPropertiesElements.getLength();
    for (int i = 0; i < nbrTextNodes; ++i)
    {
      StyleTextPropertiesElement textProperties = (StyleTextPropertiesElement) textPropertiesElements.item(i);
      String asianFontFamily = textProperties.getStyleFontFamilyAsianAttribute();
      if (asianFontFamily != null)
      {
        textProperties.setStyleFontFamilyAsianAttribute((String) asianFont);
        // Indicate the text properties were updated requiring a re-save of the styles.xml
        textPropertiesUpdated = true;
      }
    }

    return textPropertiesUpdated;
  }
  
  /**
   * Set the locale related information in the master styles. This includes setting the language in the metadata, updating the default
   * styles to include the asian styles, and updating the master styles to include the asian styles.
   * 
   * @param context
   *          - the current ConversionContext
   * @param presentationDoc
   *          - the OdfDocument
   * @param body
   *          - the body html element
   * @param isNewFile
   *          - true if this is a new file
   * @return boolean - true if the text properties were updated, false if they were not.
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  private boolean setLocaleRelatedInfo(ConversionContext context, OdfDocument presentationDoc, Element body, boolean isNewFile)
      throws Exception
  {
    boolean textPropertiesUpdated = false;

    String locale = (String) context.get("locale");
    if (locale != null && isNewFile)
    {
      OdfFileDom metadom = presentationDoc.getMetaDom();
      OdfOfficeMeta fMetadata = new OdfOfficeMeta(metadom);
      if (ConvertUtil.CJKLocale.contains(locale))
      {
        JSONObject CJKLocaleInfoMap = ConvertUtil.getCJKLocaleInfoMap();
        Map map = (Map) CJKLocaleInfoMap.get(locale);
        // Set the language in the metadata
        String dcLanguage = (String) map.get(ODFConstants.DC_LANGUAGE);
        fMetadata.setLanguage(dcLanguage);
        // Set the default asian country and language
        OdfDefaultStyle defaultStyle = presentationDoc.getStylesDom().getOfficeStyles().getDefaultStyle(OdfStyleFamily.Graphic);
        defaultStyle.setProperty(OdfStyleTextProperties.CountryAsian, (String) map.get(ODFConstants.STYLE_COUNTRY_ASIAN));
        defaultStyle.setProperty(OdfStyleTextProperties.LanguageAsian, (String) map.get(ODFConstants.STYLE_LANGUAGE_ASIAN));
        String fontNameAsianStr = (String) map.get(ODFConstants.STYLE_FONT_NAME_ASIAN);
        String[] fontNameAsian = fontNameAsianStr.split(",");
        // Update the asian font names throughout the master styles
        changeFontNameAsian(context, presentationDoc, fontNameAsian[0]);
      }
      else
      {
        JSONObject unCJKLocaleInfoMap = ConvertUtil.getUnCJKLocaleInfoMap();
        Map map = (Map) unCJKLocaleInfoMap.get(locale);
        String dcLanguage = (String) map.get(ODFConstants.DC_LANGUAGE);
        fMetadata.setLanguage(dcLanguage);

        OdfDefaultStyle defaultStyle = presentationDoc.getStylesDom().getOfficeStyles().getDefaultStyle(OdfStyleFamily.Graphic);
        defaultStyle.setProperty(OdfStyleTextProperties.Language, (String) map.get(ODFConstants.FO_LANGUAGE));
        defaultStyle.setProperty(OdfStyleTextProperties.Country, (String) map.get(ODFConstants.FO_COUNTRY));
      }
      textPropertiesUpdated = true;
    }
    return textPropertiesUpdated;
  }
}
