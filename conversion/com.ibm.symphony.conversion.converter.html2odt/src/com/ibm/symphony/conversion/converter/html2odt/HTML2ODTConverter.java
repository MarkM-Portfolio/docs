/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfTextDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.office.OdfOfficeFontFaceDecls;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.doc.style.OdfDefaultStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.element.OdfStylePropertiesBase;
import org.odftoolkit.odfdom.dom.element.office.OfficeMasterStylesElement;
import org.odftoolkit.odfdom.dom.element.style.StyleFontFaceElement;
import org.odftoolkit.odfdom.dom.element.style.StyleMasterPageElement;
import org.odftoolkit.odfdom.dom.element.style.StyleTablePropertiesElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.incubator.meta.OdfOfficeMeta;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.odftoolkit.odfdom.pkg.manifest.OdfFileEntry;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import symphony.org.w3c.tidy.Tidy;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.html2odt.common.HTML2ODTUtil;
import com.ibm.symphony.conversion.converter.html2odt.common.HtmlTemplateCSSParser;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.propertyConvertors.FontFamilyConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.GeneralListConvertor;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.GeneralListConvertor.ListStyle;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.XMLConvertorFactory;
import com.ibm.symphony.conversion.converter.html2odt.convertor.html.XMLConvertorUtil;
import com.ibm.symphony.conversion.service.AbstractFormatConverter;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.ConversionResult;
import com.ibm.symphony.conversion.service.ConversionWarning;
import com.ibm.symphony.conversion.service.IConversionService;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.IConvertor;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.OdfDomUtil;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.service.common.util.FileUtil;
import com.ibm.symphony.conversion.service.common.util.JTidyUtil;
import com.ibm.symphony.conversion.service.common.util.StringPool;
import com.ibm.symphony.conversion.service.exception.ConversionException;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class HTML2ODTConverter extends AbstractFormatConverter
{

  private static Logger log = Logger.getLogger(HTML2ODTConverter.class.getName());
  
  public ConversionResult convert(File sourceFile, Map parameters) throws ConversionException
  {
    try
    {
      IConversionService conversionService = ConversionService.getInstance();
      File targetFolder = new File(conversionService.getRepositoryPath() + File.separator + "output" + File.separator + "html2odt"
          + File.separator + UUID.randomUUID());

      boolean isNewDirSuccess = targetFolder.mkdirs();

      if (isNewDirSuccess)
        return convert(sourceFile, targetFolder, parameters);
      else
        return failedConversionResult(ConversionConstants.ERROR_UNKNOWN, null);
    }
    catch (Exception e)
    {
      return failedConversionResult(ConversionConstants.ERROR_UNKNOWN, e.getMessage());
    }
  }

  public ConversionResult convert(File sourceFile, File targetFolder, Map parameters) throws ConversionException
  {
    log.info("source: " + sourceFile);
    log.info("target: " + targetFolder);
    log.entering(getClass().getName(), "convert", new Object[] { sourceFile, targetFolder, parameters });
    File tmpDraftFolder = sourceFile;
    if (sourceFile.isDirectory())
    {
      sourceFile = new File(sourceFile, "content.html");
    }
    File sourceFolder = sourceFile.getParentFile();
    StringPool stringPool = StringPool.load(sourceFolder);
    ConversionResult result = new ConversionResult();
    InputStream in = null;
    //InputStream odfDraftStream = null;
    OdfDocument odfDoc = null;
    try
    {
      Tidy tidy = JTidyUtil.getTidy();
      in = new FileInputStream(sourceFile);
      Document htmlDoc = tidy.parseDOM(in, (OutputStream) null);
      // filter task, comments
      XMLConvertorUtil.filterElement(htmlDoc.getFirstChild(), false, false, true);

      Element body = (Element) htmlDoc.getElementsByTagName("body").item(0);

      boolean isNewFile = false;
      // load index table
      HtmlToOdfIndex indexTable = new HtmlToOdfIndex(sourceFolder.getPath());

      String odfPath = sourceFolder.getPath() + File.separator + IndexUtil.ODFDRAFT_NAME;
      File odfFile = new File(odfPath);
      if (!odfFile.exists())
      {
        odfDoc = OdfTextDocument.newTextDocument();
        //odfDoc.save(odfFile);
        isNewFile = true;
      }
      else
      {
        if (indexTable.isHtmlNodeIndexed(body))
        {
          //InputStream odfDraftStream = new FileInputStream(odfFile);
          
          File odfdraftTemp = new File(sourceFolder.getPath() + File.separator + IndexUtil.ODFDRAFT_NAME + ".tmp");
          odfFile.renameTo( odfdraftTemp );
          
          odfDoc = OdfTextDocument.loadDocument(odfdraftTemp);
          isNewFile = false;
        }
        else
        {
          indexTable.clearIndex();
          odfDoc = OdfTextDocument.newTextDocument();
          //odfDoc.save(odfFile);
          isNewFile = true;
        }
      }

      indexTable.loadODFDOM(odfDoc.getContentDom());

      // Set the export ODT's default property value in default style.
      setPropertiesofDefaultStyle(odfDoc);

      OdfElement odfContent = odfDoc.getContentDom().getRootElement();
      if (!isNewFile)
      {
        indexTable.processDeletedHtmlNodes(htmlDoc);
      }

      ConversionContext context = new ConversionContext();
      context.put("stringPool", stringPool);
      if(parameters != null && parameters.get("targetMIMEType") != null)
        context.put("targetTypeMS", ((String)parameters.get("targetMIMEType")).contains("msword"));      
      context.put(Constants.SOURCE, htmlDoc);
      context.put(Constants.TARGET, odfDoc);
      context.put(Constants.RESULT, result);
      putCommentArrayToContext(context, sourceFile);
      context.put(Constants.TARGET_ROOT_NODE, ODFConstants.OFFICE_TEXT);
      HashSet<String> imageSrcSet = new HashSet();
      context.put(Constants.IMAGESRC_SET, imageSrcSet);
      HashSet<String> shapeImageSrcSet = new HashSet();
      context.put(Constants.SHAPE_IMAGESRC_SET, shapeImageSrcSet);
      context.setHtmlToOdfIndexTable(indexTable);
      HtmlTemplateCSSParser.loadStyleDocument(context);
      if(stringPool!=null)
        HTML2ODTUtil.loadPreservedStyle(context,htmlDoc,odfDoc,stringPool);

      setLocaleRelatedInfo(context, odfDoc, body, isNewFile);
      
      IConvertor convertor = XMLConvertorFactory.getInstance().getConvertor(body);
      convertor.convert(context, body, odfContent);
      
      applyGlobalOutlineStyle(context, body);
      addFontFaceDecls2FileDom(context, odfDoc);

      // start to convert header&footer.
      OdfElement odfStyleContent = odfDoc.getStylesDom().getRootElement();
      indexTable.setOdfFileDom(odfDoc.getStylesDom());
      context.setHtmlToOdfIndexTable(indexTable);
      convertHeaderFooter(context, odfDoc, odfStyleContent, indexTable);

      addPicNameToMap(context);
      extractImage(context, odfDoc, sourceFolder);
      deleteUnusedStyle(odfDoc);
      
      //Set <meta:generator> in meta.xml as product name
      ConvertUtil.setMetaDomMetaGenerator(odfDoc);

      indexTable.save(odfDoc);

      //package concord draft into ODF packakge
      File convertedFile = new File(targetFolder,"content.odt");
      boolean packageDraft = (parameters != null) ? Boolean.valueOf((String)parameters.get("packageDraft")): false;
      if(packageDraft)
      {
        String picFolderPath = (String)parameters.get("pictureFolder");
        OdfDomUtil.packageConcordDraft(tmpDraftFolder, odfDoc, picFolderPath);
        odfDoc.save(convertedFile);
      }
      else
      {
        FileUtil.copyFileToDir(odfFile, targetFolder, "content.odt");
      }
     
      result.setConvertedFile(convertedFile);
    }
    catch (Exception e)
    {
      log.log(Level.INFO, e.getMessage(),e);
      result = failedConversionResult(ConversionConstants.ERROR_UNKNOWN, e.getMessage());
    }
    finally
    {
      if( odfDoc != null)
        odfDoc.close();
      
      File odfdraftTemp = new File(sourceFolder.getPath() + File.separator + IndexUtil.ODFDRAFT_NAME + ".tmp");
      if( odfdraftTemp.exists() )
        odfdraftTemp.delete();
      
      if (in != null)
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
    }
    log.exiting(getClass().getName(), "convert");
    return result;
  }

  private void convertHeaderFooter(ConversionContext context, OdfDocument odfDoc, OdfElement odfStyleRoot, HtmlToOdfIndex indexTable)
  {
    Node header = (Node) context.get(Constants.HTML_HEADER_ROOT);
    Node footer = (Node) context.get(Constants.HTML_FOOTER_ROOT);

    if (header != null || footer != null)
    {
      OfficeMasterStylesElement officeMaster = OdfElement.findFirstChildNode(OfficeMasterStylesElement.class, odfStyleRoot);
      StyleMasterPageElement standardMasterPage = null;
      NodeList nodes = officeMaster.getElementsByTagName(ODFConstants.STYLE_MASTER_PAGE);
      for (int i = 0; i < nodes.getLength(); i++)
      {
        StyleMasterPageElement odfMP = (StyleMasterPageElement) nodes.item(i);

        if (odfMP.hasAttribute(ODFConstants.STYLE_NAME) && odfMP.getAttribute(ODFConstants.STYLE_NAME).equalsIgnoreCase("standard"))
        {
          standardMasterPage = odfMP;
          break;
        }
      }

      if (header != null)
      {
        context.put(Constants.TARGET_ROOT_NODE, ODFConstants.STYLE_HEADER);

        IConvertor convertor = XMLConvertorFactory.getInstance().getConvertor(header);
        convertor.convert(context, header, standardMasterPage);
      }

      if (footer != null)
      {
        context.put(Constants.TARGET_ROOT_NODE, ODFConstants.STYLE_FOOTER);

        IConvertor convertor = XMLConvertorFactory.getInstance().getConvertor(footer);
        convertor.convert(context, footer, standardMasterPage);
      }
    }
  }

  private void deleteUnusedStyle(OdfDocument odfDoc)
  {
    try
    {
      OdfOfficeAutomaticStyles autoStyles = odfDoc.getContentDom().getAutomaticStyles();
      Iterator<OdfStyle> styles = autoStyles.getAllStyles().iterator();
      while (styles.hasNext())
      {
        OdfStyle style = styles.next();
        if (style.getStyleUserCount() == 0)
        {
          autoStyles.removeChild(style);
        }
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
  }

  private void setLocaleRelatedInfo(ConversionContext context, OdfDocument odfDoc, Element body, boolean isNewFile) throws Exception
  {
    String locale = null;
    String bodyClassName = body.getAttribute(Constants.CLASS);
    int startIndex = bodyClassName.indexOf("lotus");
    if(startIndex != -1)
    {
      int endIndex = bodyClassName.indexOf(" ", startIndex);
      if(endIndex != -1)
        locale = bodyClassName.substring(startIndex, endIndex);
      else
        locale = bodyClassName.substring(startIndex);
      
      context.put("locale", locale);
    }
    if(locale != null && isNewFile)
    {
      OdfFileDom metadom = odfDoc.getMetaDom();
      OdfOfficeMeta fMetadata = new OdfOfficeMeta(metadom);
      if(ConvertUtil.CJKLocale.contains(locale))
      {
        JSONObject CJKLocaleInfoMap = ConvertUtil.getCJKLocaleInfoMap();
        Map map = (Map) CJKLocaleInfoMap.get(locale);
        String dcLanguage = (String)map.get(ODFConstants.DC_LANGUAGE);
        fMetadata.setLanguage(dcLanguage);
        
        OdfDefaultStyle defaultStyle = odfDoc.getStylesDom().getOfficeStyles().getDefaultStyle(OdfStyleFamily.Paragraph);
        defaultStyle.setProperty(OdfStyleTextProperties.CountryAsian, (String) map.get(ODFConstants.STYLE_COUNTRY_ASIAN));
        defaultStyle.setProperty(OdfStyleTextProperties.LanguageAsian, (String) map.get(ODFConstants.STYLE_LANGUAGE_ASIAN));
        defaultStyle.setProperty(OdfStyleTextProperties.FontName, (String) map.get(ODFConstants.STYLE_FONT_NAME));
        String fontNameAsianStr = (String) map.get(ODFConstants.STYLE_FONT_NAME_ASIAN);
        String[] fontNameAsian = fontNameAsianStr.split(",");
        defaultStyle.setProperty(OdfStyleTextProperties.FontNameAsian, fontNameAsian[0]);
      }
      else
      {
        JSONObject unCJKLocaleInfoMap = ConvertUtil.getUnCJKLocaleInfoMap();
        Map map = (Map) unCJKLocaleInfoMap.get(locale);
        String dcLanguage = (String)map.get(ODFConstants.DC_LANGUAGE);
        fMetadata.setLanguage(dcLanguage);
        
        OdfDefaultStyle defaultStyle = odfDoc.getStylesDom().getOfficeStyles().getDefaultStyle(OdfStyleFamily.Paragraph);
        defaultStyle.setProperty(OdfStyleTextProperties.Language, (String) map.get(ODFConstants.FO_LANGUAGE));
        defaultStyle.setProperty(OdfStyleTextProperties.Country, (String) map.get(ODFConstants.FO_COUNTRY));
      }
    }
  }

  private void addFontFaceDecls2FileDom(ConversionContext context, OdfDocument odfDoc) throws Exception
  {
    OdfFileDom odfContent = odfDoc.getContentDom();
    OdfFileDom odfStyle = odfDoc.getStylesDom();
    addFontFaceDecls(context, odfContent);
    addFontFaceDecls(context, odfStyle);
  }

  private void addFontFaceDecls(ConversionContext context, OdfFileDom odfFileDom) throws Exception
  {
    OdfElement odfContent = odfFileDom.getRootElement();
    NodeList decls = odfContent.getElementsByTagNameNS((String) ConvertUtil.getNamespaceMap().get(Constants.OFFICE),
        Constants.FONT_FACE_DECLS);
    OdfOfficeFontFaceDecls decl = null;
    if (decls.getLength() == 0)
    {
      decl = new OdfOfficeFontFaceDecls(odfFileDom);
      odfContent.appendChild(decl);
    }
    else
    {
      decl = (OdfOfficeFontFaceDecls) decls.item(0);
    }
    String locale = (String) context.get("locale");
    if(!ConvertUtil.CJKLocale.contains(locale))
    {
      createFontFace(decl, "Arial", "Arial", "roman", "variable");
      createFontFace(decl, "Courier New", "Courier New", "modern", "fixed");
      createFontFace(decl, "Georgia", "Georgia", "roman", "variable");
      createFontFace(decl, "Times New Roman", "Times New Roman", "roman", "variable");
      createFontFace(decl, "Comic Sans MS", "Comic Sans MS", "script", "variable");
      createFontFace(decl, "Lucida Sans Unicode", "Lucida Sans Unicode", "swiss", "variable");
      createFontFace(decl, "Tahoma", "Tahoma", "swiss", "variable");
      createFontFace(decl, "Trebuchet MS", "Trebuchet MS", "swiss", "variable");
      createFontFace(decl, "Verdana", "Verdana", "roman", "variable");
    }
    else
    {
      createFontFace(decl, "Tahoma1", "Tahoma", null, null);
      createFontFace(decl, "Arial", "Arial", "roman", "variable");
      createFontFace(decl, "Arial1", "Arial", "swiss", "variable");
      createFontFace(decl, "Tahoma", "Tahoma", "system", "variable");
      
      JSONObject CJKLocaleInfoMap = ConvertUtil.getCJKLocaleInfoMap();
      Map map = (Map) CJKLocaleInfoMap.get(locale);
      String fontNameAsianStr = (String) map.get(ODFConstants.STYLE_FONT_NAME_ASIAN);
      String[] fontNameAsian = fontNameAsianStr.split(",");
      createFontFace(decl, fontNameAsian[0], "'"+fontNameAsian[0]+"'", "system", "variable");
      String fontfaceName = (String) map.get("font-face-name");
      if(fontfaceName != null)
        createFontFace(decl, fontfaceName, "'"+fontfaceName+"'", "system", "variable");
    }
    
    Set<String> fontSet = FontFamilyConvertor.getFontSet(context);
    
    Iterator<String> it = fontSet.iterator();
    while( it.hasNext( ) )
    {
      String fontFamily = it.next();
      String svgFontFamily;
      if( fontFamily.indexOf(' ') != -1)
      {
        svgFontFamily = "'" + fontFamily + "'";
      }
      else
      {
        svgFontFamily = fontFamily;
      }
      createFontFace(decl, fontFamily, svgFontFamily, "system", "variable");

    }
  }

  private void createFontFace(OdfOfficeFontFaceDecls decl, String name, String svgFontFamily, String styleFontFamilyGeneric,
      String styleFontPitch)
  {
    StyleFontFaceElement sffe = null;
    boolean isExisted = false;
    NodeList children = decl.getChildNodes();
    for (int i = 0; i < children.getLength(); i++)
    {
      sffe = (StyleFontFaceElement) children.item(i);
      if (name.equalsIgnoreCase(sffe.getStyleNameAttribute()) && svgFontFamily.equalsIgnoreCase(sffe.getSvgFontFamilyAttribute()))
      {
        isExisted = true;
        break;
      }
    }
    if (!isExisted)
    {
      sffe = decl.newStyleFontFaceElement(name);
      sffe.setSvgFontFamilyAttribute(svgFontFamily);
      if(styleFontFamilyGeneric != null)
        sffe.setStyleFontFamilyGenericAttribute(styleFontFamilyGeneric);
      if(styleFontPitch != null)
        sffe.setStyleFontPitchAttribute(styleFontPitch);
    }
  }
  
  private void addPicNameToMap(ConversionContext context)
  {
    try{
      OdfDocument odfDoc = (OdfDocument) context.getTarget();
      OdfFileDom fileDom = odfDoc.getContentDom();
      NodeList nodelist = fileDom.getAutomaticStyles().getElementsByTagName(ODFConstants.ODF_STYLE_TEXTLIST_IMAGE_STYLE);
      addPicNameListToMap(context, nodelist);
      nodelist = fileDom.getElementsByTagName("draw:fill-image");
      addPicNameListToMap(context, nodelist);
      
      fileDom = odfDoc.getStylesDom();
      nodelist = fileDom.getElementsByTagName(ODFConstants.ODF_STYLE_TEXTLIST_IMAGE_STYLE);
      addPicNameListToMap(context, nodelist);
      
      nodelist = fileDom.getElementsByTagName("draw:fill-image");
      addPicNameListToMap(context, nodelist);
    }
    catch(Exception e)
    {
      log.log(Level.WARNING, e.getMessage(), e);
    }
  }
  
  private void addPicNameListToMap(ConversionContext context, NodeList nodelist)
  {
    if(nodelist != null)
    {
      HashSet<String> imageSrcSet = (HashSet<String>) context.get(Constants.IMAGESRC_SET);
      int len = nodelist.getLength();
      for(int i=0; i<len; i++)
      {
        String href = ((Element) nodelist.item(i)).getAttribute(ODFConstants.XLINK_HREF);
        if(href != null)
        {
          int index = href.lastIndexOf("/");
          imageSrcSet.add(href.substring(index+1));
        }
      }
    }
  }

  private void extractImage(ConversionContext context, OdfDocument odf, File sourceFolder)
  {   
    File pictureRoot = new File(sourceFolder.getAbsolutePath() + "/Pictures/");
    if (!pictureRoot.exists())
      return;
    
    HashSet<String> imageSrcSet = (HashSet<String>) context.get(Constants.IMAGESRC_SET);
    HashSet<String> shapeImageSrcSet = (HashSet<String>) context.get(Constants.SHAPE_IMAGESRC_SET);
    OdfPackage odfPackage = odf.getPackage();
    Set<String> fileEntries = odfPackage.getFileEntries();
    File[] pictureFileList = pictureRoot.listFiles();
    FileInputStream in = null;
    
    try
    {
      for (int i = 0; i < pictureFileList.length; i++)
      {
        String fileName = pictureFileList[i].getName();        
        if(pictureFileList[i].isFile())
        {
          String filePath = "Pictures/"+fileName;   
          if(imageSrcSet.contains(fileName))
          {
            if(!fileEntries.contains(filePath))
            {
              in = new FileInputStream(pictureFileList[i].getAbsolutePath());
              if (in != null)
              {
                odfPackage.insert(in, "./Pictures/" + fileName, OdfFileEntry.getMediaTypeString(fileName));
                in.close();
              }
            }
          }
          else
          {
            int index = fileName.lastIndexOf(".");
            int len = fileName.length();
            String ext = fileName.substring(index+1,len);
            if(ConvertUtil.noCvtFormats.contains(ext))
            {
              if(!shapeImageSrcSet.contains(fileName))
              {
                pictureFileList[i].delete();
                
                if(fileEntries.contains(filePath))
                  odfPackage.remove(filePath);
              }
            }
          }
        }
        else if(pictureFileList[i].isDirectory())
        {
          File[] subPictureFileList = pictureFileList[i].listFiles();
          for (int j = 0; j < subPictureFileList.length; j++)
          {
            String subFileName = subPictureFileList[j].getName();
            if(!fileName.equals("shape"))
            {
              int len = subFileName.length();
              subFileName = subFileName.substring(0, len-3)+fileName; 
            }
            if(!imageSrcSet.contains(subFileName))
            {
              if(fileName.equals("shape"))
              {
                subFileName = "shape/"+subFileName;
              }
              odfPackage.remove("Pictures/"+subFileName);
              subPictureFileList[j].delete();
            }
          }
        }
      }
    }
    catch (Exception e)
    {
      log.log(Level.SEVERE, "Picture copy/delete error", e);
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

  private ConversionResult failedConversionResult(String ERROR_ID, String ERROR_Message) throws ConversionException
  {
    ConversionResult result = new ConversionResult();
    ConversionWarning ce = new ConversionWarning(ERROR_ID, false, "", ERROR_Message);
    result.addWarning(ce);
    result.setSucceed(false);
    return result;
  }

  private void setPropertiesofDefaultStyle(OdfDocument odfDoc)
  {
    /*
     * Drop the following content and set the default font name 'Arial' in the odfdom
     * 
     * 
     * 
    // Set the export ODT's default Font Name as 'Arial'.
    StyleTextPropertiesElement textPros = (StyleTextPropertiesElement) getPropertyElement(odfDoc, OdfStyleFamily.Paragraph,
        "style:text-properties");
    if (textPros != null)
    {
      textPros.setStyleFontNameAsianAttribute(Constants.CONCORD_DEFAULT_FONT_STYLE_NAME);
      textPros.setStyleFontNameAttribute(Constants.CONCORD_DEFAULT_FONT_STYLE_NAME);
      textPros.setStyleFontNameComplexAttribute(Constants.CONCORD_DEFAULT_FONT_STYLE_NAME);
    }
    */

    // Set the export ODT's default Table border-model as 'collapsing'.
    StyleTablePropertiesElement tablePros = (StyleTablePropertiesElement) getPropertyElement(odfDoc, OdfStyleFamily.Table,
        "style:table-properties");
    if (tablePros != null)
    {
      tablePros.setTableBorderModelAttribute(Constants.DEFAULT_TABLE_BORDER_MODEL);
    }
  }

  private OdfStylePropertiesBase getPropertyElement(OdfDocument odfDoc, OdfStyleFamily family, String propertyName)
  {
    try
    {
      OdfDefaultStyle defaultStyle = odfDoc.getStylesDom().getOfficeStyles().getDefaultStyle(family);

      if (defaultStyle != null)
      {
        NodeList children = defaultStyle.getChildNodes();
        for (int i = 0; i < children.getLength(); i++)
        {
          if (children.item(i).getNodeName().equals(propertyName))
          {
            OdfStylePropertiesBase prosBase = (OdfStylePropertiesBase) children.item(i);
            return prosBase;
          }
        }
      }
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    return null;
  }
  
  static ListStyle.Type[] defaultOutlineTypes =  new ListStyle.Type[]{ 
      new ListStyle.Type("lst-n",1),
      new ListStyle.Type("lst-n",2),
      new ListStyle.Type("lst-n",3),
      new ListStyle.Type("lst-n",4),
      new ListStyle.Type("lst-n",5),
      new ListStyle.Type("lst-n",6),
      new ListStyle.Type("lst-n",7),
      new ListStyle.Type("lst-n",8),
      new ListStyle.Type("lst-n",9),
      new ListStyle.Type("lst-n",10),
  };
  
  private static void applyGlobalOutlineStyle(ConversionContext context, Element body)
  {
    String outlineClass = body.getAttribute("bulletclass");
    if( outlineClass != null && outlineClass.startsWith("lst-"))
    {
      outlineClass = outlineClass.substring(4);
      
      
      Map<String, OdfElement> listStylesMap = GeneralListConvertor.getOdfTextListStyleMap(context);
      OdfElement odflistStyle = listStylesMap.get( outlineClass );
      OdfDocument odfDoc = (OdfDocument) context.getTarget();
      
      try
      {
        OdfFileDom stylesDom = odfDoc.getStylesDom();
        OdfOfficeStyles odfStyles = stylesDom.getOfficeStyles();        
        if( odflistStyle != null)
        {      
          if( outlineClass.equalsIgnoreCase("outline") ) // outline means no need to write.
            return;
          
          if( odflistStyle.getOwnerDocument() != stylesDom)
          {
            // move the auto style to office style.
            Node newStyle = OdfDomUtil.cloneNode(stylesDom, odflistStyle, true);
            odfStyles.appendChild(newStyle);
            odflistStyle.getParentNode().removeChild(odflistStyle);
            odflistStyle = (OdfElement) newStyle;
          }        
        }
        else
        {
          // no heading exists, but the outline is already setted.
          String className = body.getAttribute("bulletclass");
          ListStyle listStyle = GeneralListConvertor.parseListStyle(context, body, className, defaultOutlineTypes);
          odflistStyle = listStyle.generateODFStyle(context, stylesDom, "officeStyles");
        }
        
        if( outlineClass.equalsIgnoreCase("outline") ) // outline means no need to write.
          return;
        
        
        for( int i = 1; i<=10; i++)
        {
          String styleName = "Heading_20_" + i;
          OdfStyle headingStyle = odfStyles.getStyle(styleName, OdfStyleFamily.Paragraph);
          
          if( headingStyle != null)
          {
            headingStyle.setStyleListStyleNameAttribute( odflistStyle.getAttribute(ODFConstants.STYLE_NAME) );
            headingStyle.setStyleListLevelAttribute(i);
          }
          
        }
      }
      catch(Exception e)
      {
        log.log(Level.SEVERE, "Failed to apply outline", e);
      }
    }    
  } 

  void putCommentArrayToContext(ConversionContext context, File sourceFile)
  {
    File commentFile = new File(sourceFile.getParent()+File.separator+"Reserved"+File.separator+"comments.json");
    if(commentFile.exists())
    {
      InputStream is = null;
      JSONArray comments = null;
      try
      { 
        is = new FileInputStream(commentFile);
        comments = JSONArray.parse(is);
      }
      catch (FileNotFoundException e)
      {
        log.log(Level.WARNING,"failed to parse comments.json - FileNotFoundException", e);
      }
      catch (IOException e)
      {
        log.log(Level.WARNING,"failed to parse comments.json - IOException", e);
      }
      finally
      {
        if(is !=null)
        {
          try
          {
            is.close();
          }
          catch (IOException e)
          {
            log.log(Level.WARNING,"failed to close comments.json stream - IOException", e);
          }
        }
      }
      context.put(Constants.COMMENT_ARRAY,comments);
    }
  }

}
