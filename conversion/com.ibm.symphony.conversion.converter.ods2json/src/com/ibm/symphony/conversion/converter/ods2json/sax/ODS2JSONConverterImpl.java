/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.logging.Level;
import java.util.logging.Logger;


import java.io.RandomAccessFile;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;
import org.odftoolkit.odfdom.doc.OdfDocument.OdfMediaType;
import org.odftoolkit.odfdom.doc.OdfDocument.OdfXMLFile;
import org.odftoolkit.odfdom.doc.office.OdfOfficeStyles;
import org.odftoolkit.odfdom.dom.element.config.ConfigConfigItemElement;
import org.odftoolkit.odfdom.incubator.meta.OdfOfficeMeta;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.odftoolkit.odfdom.pkg.OdfPackage.OdfFile;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.json.java.OrderedJSONObject;
import com.ibm.symphony.conversion.converter.ods2json.AbstractJSONFileAccess;
import com.ibm.symphony.conversion.converter.ods2json.ContentJSONFileAccess;
import com.ibm.symphony.conversion.converter.ods2json.OdfdraftPackage;
import com.ibm.symphony.conversion.converter.ods2json.sax.style.FontFaceStyleHelper;
import com.ibm.symphony.conversion.converter.ods2json.sax.style.FormatStyleHelper;
import com.ibm.symphony.conversion.converter.ods2json.sax.style.StyleDetector;
import com.ibm.symphony.conversion.converter.ods2json.sax.style.TableCellStyleHelper;
import com.ibm.symphony.conversion.service.ConversionConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.OdfDomUtil;
import com.ibm.symphony.conversion.service.exception.OutOfCapacityException;
import com.ibm.symphony.conversion.service.formulalexer.IDMFormulaLexer;
import com.ibm.symphony.conversion.spreadsheet.ServiceConstants;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.UnNameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.PageSetting;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.StyleMap;
import com.ibm.symphony.conversion.spreadsheet.impl.JSONWriter;

public class ODS2JSONConverterImpl
{
  private static final Logger LOG = Logger.getLogger(ODS2JSONConverterImpl.class.getName());

  private String conversionFolder;

  private ConversionUtil.Document document;

  // cell style name as the key, corresponding cell style id as the value
  private HashMap<String, String> cellStyleNameIdMap;

  // cell format style name as the key, corresponding format id as the value
  private HashMap<String, ConversionUtil.NumberFormat> cellFormatNameIdMap;

  // for number style, the style for positive number is key, negative number style is value
  private HashMap<String, List<StyleMap>> cellFormatStyleIdMap;

  private HashMap<String, ConversionUtil.CellStyleType> cellCurrencyMap;

  // sheet name as the key, corresponding sheet id as the value;
  private HashMap<String, String> sheetNameIdMap;

  private HashMap<String, Boolean> cellImageMap;
  
  private HashMap<String, String> unsupportFeatures;
  
  private ConversionConstant.JSONWriteMode writeMode = ConversionConstant.JSONWriteMode.SHEET;
  
  private static final ExecutorService pool = Executors.newCachedThreadPool();

  public ODS2JSONConverterImpl(String conversionFolder)
  {
    this.conversionFolder = conversionFolder;
    cellStyleNameIdMap = new HashMap<String, String>();
    sheetNameIdMap = new HashMap<String, String>();
    cellFormatNameIdMap = new HashMap<String, ConversionUtil.NumberFormat>();
    cellFormatStyleIdMap = new HashMap<String, List<StyleMap>>();
    cellCurrencyMap = new HashMap<String, ConversionUtil.CellStyleType>();
    unsupportFeatures = new HashMap<String, String>();
    cellImageMap = new HashMap<String, Boolean>();
  }

  public String convert(String source, String sourceType, String targetType) throws Exception
  {
    return convert(source, sourceType, targetType, null, false);
  }
  
  public String convert(String source, String sourceType, String targetType, Map parameters) throws Exception
  {
    return convert(source, sourceType, targetType, parameters, false);
  }

  private void initContext(ConversionContext context)
  {
    context.put("cellStyleNameIdMap", cellStyleNameIdMap);
    context.put("sheetNameIdMap", sheetNameIdMap);
    context.put("cellFormatNameIdMap", cellFormatNameIdMap);
    context.put("cellFormatStyleIdMap", cellFormatStyleIdMap);
    context.put("cellCurrencyMap", cellCurrencyMap);
    context.put("cellImageMap", cellImageMap);
    // unsupport feature
    HashMap<String, Integer> result = new HashMap<String, Integer>();
    Set<String> contentUnsupportFeatureSet = new HashSet<String>();
    Set<String> styleUnsupFeatureSet = new HashSet<String>();
    context.put("ContentUnsupportFeatureSet", contentUnsupportFeatureSet);
    context.put("StyleUnsupportFeatureSet", styleUnsupFeatureSet);
    context.put("UnsupportFeatureResult", result);
    context.put("writeMode", writeMode); // Three different write modes: Worksheet, Sheet, Row
    context.put("bFirstTable", true); // indicate whether the current table in TableTableContext is first table or not 
    // Create a pool of subtasks to use for tasks that can run asynchronous to our main conversion thread
    context.setExecutorService(pool);
  }

  // bRowHasDefaultCellStyle is used to indicate that the row should have default cell style or not
  private String convert(String source, String sourceType, String targetType, Map parameters, boolean bRowHasDefaultCellStyle) throws Exception
  {
    byte[] debug_cfg = null;
    // only for TP2 support
    File sourceFile = null;

    OdfSpreadsheetDocument odfSheetDoc = null;
    ConversionContext context = null;
    FileOutputStream jsContentOut = null;
    FileOutputStream jsMetaOut = null;
    FileOutputStream jsReferenceOut = null;
    FileOutputStream jsPreserveOut = null;
    FileOutputStream jsPageSettingOut = null;
    FileOutputStream jsCommentsOut = null;
    AbstractJSONFileAccess jsonFileAccess = null;
    long endTime;
    long startTime = System.currentTimeMillis();
    try
    {
      if ((!sourceType.equalsIgnoreCase(ServiceConstants.ODS_MIMETYPE) && !sourceType.equalsIgnoreCase(ServiceConstants.OTS_MIMETYPE))
          || !targetType.equalsIgnoreCase(ServiceConstants.JSON_MIMETYPE))
      {
        LOG.warning("The file can not be converted due to that source is not an ods file or the targetis not an js file.");
        return null;
      }
      sourceFile = new File(source);

      try
      {
        odfSheetDoc = (OdfSpreadsheetDocument) OdfDocument.loadDocument(sourceFile);
        debug_cfg = odfSheetDoc.getPackage().getBytes("debug.cfg");
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "load ods file failed", e);
        return null;
      }

      OdfPackage pack = odfSheetDoc.getPackage();
      // To detect the size of content.xml
      // If it is more than 20MB size, it will not allowed to be converted

      String contentFilePath = OdfXMLFile.CONTENT.getFileName();
      // InputStream contentStream = pack.getUncachedInputStream(contentFilePath);
      //
      // long length = FileUtil.getSize(contentStream);
      // if(SpreadsheetConfig.exceedLimits(length))
      // {
      // odfSheetDoc.close();
      // throw new OutOfCapacityException("Can't edit document with content.xml with " + length + "B");
      // }

      context = new ConversionContext();
      ContextInfo info = new ContextInfo(parameters);
      document = new ConversionUtil.Document();
      document.url = source;
      document.maxColumnId = ConversionConstant.ID_INITAL_VALUE;
      document.maxRowId = ConversionConstant.ID_INITAL_VALUE;
      info.tableId = ConversionConstant.ID_INITAL_VALUE;
      context.put("Target", document);
      context.put("Source", odfSheetDoc);
      context.put("TableInfo", info);
      context.put("styleIndex", 0);
      context.put("TargetFolder", conversionFolder);
      context.put("isODFFormula", IDMFormulaLexer.InternalFormulaType.equals(IDMFormulaLexer.LexFormulaType.FORMAT_ODF));
      
      String contentFile = conversionFolder + File.separator + "content.js";
      jsonFileAccess = new ContentJSONFileAccess(new RandomAccessFile(contentFile, "rw"), 6, document);
      context.put("ContentJSONFileAccess", jsonFileAccess);

      initContext(context);
      Set<String> UnsupportFeatureSet = new HashSet<String>();
      boolean hasMacro = false;
      if (DetectorUtil.detectMacro(odfSheetDoc)) {
    	  //UnsupportFeatureSet.add("macro"); 
    	  hasMacro = true;
      }

      Set<String> chartNames = this.getChartNameList(odfSheetDoc);
      context.put("ChartNames", chartNames);
      // Preserve context
      PreserveManager preserveManger = new PreserveManager();
      context.put("PreserveManager", preserveManger);
      String targetDir = conversionFolder;
      OdfdraftPackage draftpackage = new OdfdraftPackage(targetDir + File.separator + ODSConvertUtil.ODFDRAFT_NAME);
      try
      {
        // still construct the styles.xml dom tree to get all the styles
        OdfOfficeStyles styles = odfSheetDoc.getDocumentStyles();
        new FontFaceStyleHelper().convert(odfSheetDoc.getStylesDom(), context);
        new FormatStyleHelper().convert(styles, context);
        new TableCellStyleHelper().convert(styles, context);

        // use sax to parse content.xml
        ODSConvertUtil.parseXML(odfSheetDoc, draftpackage, contentFilePath, context);
        // detect style after parse content.xml done, because all the styles is there
        StyleDetector detector = new StyleDetector();
        detector.detect(context);
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "parse content.xml error", e);
        return null;
      }

      if (info.getOutOfCapacity())
      {
        if (info.cellCnt > ConversionConstant.MAX_CELL_COUNT)
          throw new OutOfCapacityException(531, "Can't edit document with " + ConversionConstant.MAX_CELL_COUNT + "+ cells");
        if (info.formulaCnt > ConversionConstant.MAX_FORMULA_CELL_COUNT)
          throw new OutOfCapacityException(534, "Can't edit document with " + ConversionConstant.MAX_FORMULA_CELL_COUNT + "+ formula cells");

        throw new OutOfCapacityException(532, "Can't edit document with " + ConversionConstant.MAX_REF_ROW_NUM + "+ rows in its sheet(s)");
      }

      convertViewsSettings(context);

      context.put("Target", null);

      // preserveManger.preserveChart(odfSheetDoc, context);
      File targetDirFile = new File(targetDir);
      targetDirFile.mkdirs();

      String targetContentFile = targetDir + File.separator + "content.js";
      // File jsContentFile = new File(targetContentFile);

      String targetMetaFile = targetDir + File.separator + "meta.js";
      // File jsMetaFile = new File(targetMetaFile);

      String targetReferenceFile = targetDir + File.separator + "reference.js";
      // File jsReferenceFile = new File(targetReferenceFile);

      String targetPreserveFile = targetDir + File.separator + "preserve.js";
      // File jsReferenceFile = new File(targetReferenceFile);

      String targetPageSettingFile = targetDir + File.separator + "page-settings.js";

      String targetCommentsFile = targetDir + File.separator + "comments.js";

      try
      {
        if (odfSheetDoc.getSettingsStream() != null)
        {
          OdfFileDom setting = odfSheetDoc.getSettingsDom();
          SettingUpdate update = new SettingUpdate(setting, document);
          update.updateSettings();
          // Store settings.xml to odfdraft
          String settingPath = OdfXMLFile.SETTINGS.getFileName();
          odfSheetDoc.getPackage().insert(odfSheetDoc.getSettingsDom(), settingPath, "text/xml");
          draftpackage.storeFile(settingPath, odfSheetDoc.getPackage().getBytes(settingPath));
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.INFO, "Update Setting Exception");
      }
      // acl flag, need export to pageSetting.js
      boolean hasACL = false;
      // write odfdraft with ZipFile API instead of odftoolkit API
      // odfSheetDoc.save(targetDir + File.separator + ODSConvertUtil.ODFDRAFT_NAME);
      {
        // save chart dom to odfdraft if exists
        List<OdfDocument> chartDocs = odfSheetDoc.getEmbeddedDocuments(OdfMediaType.CHART);
        for (int i = 0; i < chartDocs.size(); i++)
        {
          try
          {
            OdfDocument chartDoc = chartDocs.get(i);
            String chartContentPath = chartDoc.getDocumentPackagePath() + OdfXMLFile.CONTENT.getFileName();
            odfSheetDoc.getPackage().insert(chartDoc.getContentDom(), chartContentPath, "text/xml");
            draftpackage.storeFile(chartContentPath, odfSheetDoc.getPackage().getBytes(chartContentPath));
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "load chart failed", e);
          }
        }
        // store ACL to odfdraft
        // first import, do not import ACL --> isImportACL = false
        // migration --> isImportACL = true
        // revert to unmodified version --> isImportACL == null
        
        Boolean isImportACL = null;
        if (parameters != null && parameters.get("ACLRanges") !=null)
          isImportACL = (Boolean)parameters.get("ACLRanges");
        if ( (isImportACL != null && isImportACL == true) ||
             (isImportACL == null && !isACLModified(odfSheetDoc)) )
        {
          hasACL = convertACLRanges(odfSheetDoc, document);
        }
        // ACL end
        // Store styles.xml to odfdraft
        String stylePath = OdfXMLFile.STYLES.getFileName();
        odfSheetDoc.getPackage().insert(odfSheetDoc.getStylesDom(), stylePath, "text/xml");
        draftpackage.storeFile(stylePath, odfSheetDoc.getPackage().getBytes(stylePath));
        // Store manifest.xml to odfdraft
        String manifestPath = OdfFile.MANIFEST.getPath();
        draftpackage.storeFile(manifestPath, odfSheetDoc.getPackage().getBytes(manifestPath));
        // Copy other files from input ods to odfdraft
        draftpackage.MergePackage(sourceFile);
        draftpackage.Save();
      }
      endTime = System.currentTimeMillis();
      System.out.println("convert ODS to JSON cost : " + (endTime - startTime));
      try
      {

//        long startTime1 = System.currentTimeMillis();
//        // reference should be stored before meta stored
//        // because the reference might refer to the col/row which id does not exist in meta
//        File refFile = new File(targetReferenceFile);
//        jsReferenceOut = new FileOutputStream(new File(targetReferenceFile));
//        // OrderedJSONObject refJson = document.storeRefToJSON();
//        JSONWriter jsRefWriter = new JSONWriter(jsReferenceOut);
//        jsRefWriter.serializeObject(document.storeRefToJSON());
//        // refJson.serialize(jsReferenceOut);
//
//        long endTime1 = System.currentTimeMillis();
//        System.out.println("parse ref : " + (endTime1 - startTime1));
        // must export preserve.js first, because it need add the preserve range to content.js
        jsPreserveOut = new FileOutputStream(new File(targetPreserveFile));
        JSONObject pJSON = preserveManger.toJSON(document);
        pJSON.serialize(jsPreserveOut);

        PageSetting pageSetting = (PageSetting) context.get("page-settings");
        if (pageSetting != null)
        {
          pageSetting.hasACL = hasACL;
          pageSetting.hasMacro = hasMacro;
          jsPageSettingOut = new FileOutputStream(new File(targetPageSettingFile));
          pageSetting.toJSON().serialize(jsPageSettingOut);
        }
        if (writeMode == ConversionConstant.JSONWriteMode.WORKSHEET)
        {
          jsContentOut = new FileOutputStream(new File(targetContentFile));
          document.storeContentToJSON().serialize(jsContentOut);
        }
        else
          jsonFileAccess.serialize();
        // limitation check for content.js
        File outputcontentFile = new File(targetContentFile);
        if (outputcontentFile.length()>ConversionConstant.MAX_CONTENTJS_LENGTH)
        {
            throw new OutOfCapacityException(530, "content.js length is larger than " + ConversionConstant.MAX_CONTENTJS_LENGTH + " bytes");
        }

        jsMetaOut = new FileOutputStream(new File(targetMetaFile));
        JSONWriter jsMetaWriter = new JSONWriter(jsMetaOut);
        jsMetaWriter.serializeObject(document.storeMetaToJSON());

        if (document.docCommentsJSON.size()>0)
        {
          OdfOfficeMeta odfOfficeMeta = new OdfOfficeMeta(odfSheetDoc.getMetaDom());
          String author = odfOfficeMeta.getInitialCreator();
          if (author==null || author.isEmpty())
            author = odfOfficeMeta.getCreator();
          if (author==null) 
            author="";
          Calendar t = odfOfficeMeta.getDcdate();
          if (t == null)
            t = odfOfficeMeta.getCreationDate();
          if (t == null)
            t = Calendar.getInstance();
          Date createtime = t.getTime();
          jsCommentsOut = new FileOutputStream(new File(targetCommentsFile));
          JSONWriter jsCommentsWriter = new JSONWriter(jsCommentsOut);
          jsCommentsWriter.serializeObject(document.storeCommentsToJSON(author, createtime));
        }
        this.unsupportFeatures = getResult(context, UnsupportFeatureSet);

        context.finishAllSubTasks();
        return targetContentFile;
      }
      catch (FileNotFoundException e)
      {
        LOG.log(Level.SEVERE, "can not find file", e);
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "", e);
      }
    }
    // should not catch any exception here
    // because ODS2JSONConverter will capture it and deal with different exceptions
    // such as outofcapacity exception
    finally
    {
      endTime = System.currentTimeMillis();
      System.out.println("ODS2JSON total cost : " + (endTime - startTime));
      try {
        if (debug_cfg!=null)
        {
          StringBuffer logbuffer = new StringBuffer();
          String targetDir = conversionFolder;
          logbuffer.append("\nCS Version:"+ ConversionUtil.getVersionFinal(this.getClass()));
          logbuffer.append("\nstarttime:"+ new Date(startTime));
          logbuffer.append("\nsourcepath:"+ source);
          logbuffer.append("\ndest path:" + conversionFolder);
          logbuffer.append("\nsource file size:"+ sourceFile.length());
          logbuffer.append("\nsourceType:"+ sourceType);
          logbuffer.append("\nbRowHasDefaultCellStyle:"+ bRowHasDefaultCellStyle);
          logbuffer.append("\narguments:" + parameters);
          logbuffer.append("\nisODFFormula:"+ context.get("isODFFormula"));
          logbuffer.append("\nendtime:" + new Date(endTime));
          FileOutputStream fos = new FileOutputStream(targetDir + File.separator + "import.log");
          fos.write(logbuffer.toString().getBytes("UTF-8"));
          fos.close();
        }
      } catch (Exception e)
      {
        // do nothing here
      }
      if (context != null)
        context.clear();
      if (jsContentOut != null)
        jsContentOut.close();
      if (jsReferenceOut != null)
        jsReferenceOut.close();
      if (jsMetaOut != null)
        jsMetaOut.close();
      if (jsPreserveOut != null)
        jsPreserveOut.close();
      if (jsPageSettingOut != null)
        jsPageSettingOut.close();
      if (jsCommentsOut != null)
        jsCommentsOut.close();
      if (odfSheetDoc != null)
        odfSheetDoc.close();
      if (jsonFileAccess != null)
        jsonFileAccess.close();

    }
    return null;
  }

  private boolean isACLModified(OdfSpreadsheetDocument odfSheetDoc)
  {
    try
    {
      String prefix = "_DOCS_ACL_";
      OdfOfficeMeta odfOfficeMeta;
      odfOfficeMeta = new OdfOfficeMeta(odfSheetDoc.getMetaDom());
      List<String> names = odfOfficeMeta.getUserDefinedDataNames();
      if (names != null) 
      {
        String name = prefix + "0";
        String value = odfOfficeMeta.getUserDefinedDataValue(name);
        if (value != null)
        {
          long acltime = Long.valueOf(value) / 1000;
          long modifiedtime = odfOfficeMeta.getDcdate().getTimeInMillis() / 1000;
          if (acltime == modifiedtime) 
          {
            return false; // modified time is not changed 
          }
        }
      }
    } 
    catch (Exception e) 
    {
      e.printStackTrace();
    }
    return true;
  }

  private boolean convertACLRanges(OdfSpreadsheetDocument odfSheetDoc, Document document2)
  {
    try
    {
      String prefix = "_DOCS_ACL_";
      OdfOfficeMeta odfOfficeMeta;
      odfOfficeMeta = new OdfOfficeMeta(odfSheetDoc.getMetaDom());
      List<String> names = odfOfficeMeta.getUserDefinedDataNames();
      if (names == null) return false;
      int minid = -1, maxid = -1;
      Map acls = new HashMap<Integer, String>();
      Iterator<String> it = names.iterator();
      while (it.hasNext())
      {
        String name = it.next();
        if (name.startsWith(prefix))
        {
          String value = odfOfficeMeta.getUserDefinedDataValue(name);
          int rid = Integer.valueOf(name.substring(prefix.length()));
          if (rid <=0) continue;
          acls.put(rid, value);
          if (minid < 0 || minid > rid) minid = rid;
          if (maxid < 0 || maxid < rid) maxid = rid;
        }
      }
      if (acls.size() > 0)
      {
          String acl = "";
          for (int i=minid ; i <= maxid ; i++)
          {
              acl = acl + acls.get(i);
          }
          String acljsonstr = ConversionUtil.HEXZIPStringToString(acl);
          JSONObject acljson = JSONObject.parse("{"+acljsonstr+"}");
          if (acljson != null) 
          {
            Iterator<?> itor = ((JSONObject)acljson.get("")).entrySet().iterator();
            while(itor.hasNext())
            {
                Map.Entry<?, ?> entry = (Map.Entry<?, ?>) itor.next();
                String key = (String)entry.getKey();
                Object value = entry.getValue();
                if(value instanceof JSONObject)
                {
                  UnNameRange unname = new UnNameRange();
                  unname.rangeId = key;
                  unname.rangeContentJSON = (JSONObject) value;
                  unname.getObjectFromJSON();
                  unname.address = IDMFormulaLexer.transOOXMLFormulaToODF(unname.address);
                  document.unnameList.add(unname);
                  return true; // this doc has ACL
                }
            }
          }
      }
      
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "load ACL range failed", e);
    }
    return false;
  }

  private Set<String> getChartNameList(OdfSpreadsheetDocument odfSheetDoc)
  {
    Set<String> chartNames = new HashSet<String>();
    List<OdfDocument> chartDocs = odfSheetDoc.getEmbeddedDocuments(OdfMediaType.CHART);
    for(int i=0; i<chartDocs.size(); i++)
    {
        OdfDocument chartDoc = chartDocs.get(i);
        String chartPath = chartDoc.getDocumentPackagePath();
        int sublen = chartPath.lastIndexOf("/");
        String chartName = sublen>0 ? chartPath.substring(0, sublen) : chartPath;
        chartNames.add(chartName);
    }
    return chartNames;
  }
  

  /*
   * should be called after convert
   */
  public HashMap<String, String> getUnsupportFeatures()
  {
    return this.unsupportFeatures;
  }

  public HashMap<String, String> getResult(ConversionContext context, Set<String> fullSet)
  {
    Set<String> styleUnsupFeatureSet = (Set<String>) context.get("StyleUnsupportFeatureSet");
    Set<String> contentUnsupFeatureSet = (Set<String>) context.get("ContentUnsupportFeatureSet");
    fullSet.addAll(contentUnsupFeatureSet);
    fullSet.addAll(styleUnsupFeatureSet);
    JSONObject result = new JSONObject();
    Iterator<String> it = fullSet.iterator();
    while (it.hasNext())
    {
      String feature = it.next();
      result.put(feature, DetectorUtil.featuresId.get(feature));
    }
    return result;
  }
  
  /**
   * Convert freeze/split window informations and showGrid
   * @param context
   */
  private void convertViewsSettings(ConversionContext context)
  {
	  OdfSpreadsheetDocument spreadsheetDoc = (OdfSpreadsheetDocument) context.get("Source");
	  Document doc = (Document) context.get("Target");
	  try
	  {
		  HashMap<String, Sheet> map = new HashMap<String, Sheet>();
		  for(Sheet sht: doc.sheetList)
			  map.put(sht.sheetName, sht);
		  if(spreadsheetDoc.getSettingsStream() == null){
		    return;
		  }
		  OdfFileDom settings = spreadsheetDoc.getSettingsDom();
		  NodeList namedItemMap = settings.getElementsByTagName(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_ITEM_MAP_NAMED);
		  Node view = null;
		  for(int i = 0; i < namedItemMap.getLength(); i++)
		  {
			  Node t = namedItemMap.item(i);
			  if("Tables".equals(t.getAttributes().getNamedItem(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_NAME).getNodeValue()))
				  view = t;
		  }
		  //Tables
		  if(view == null) return;
		  NodeList cfgs = view.getChildNodes();
		  for(int i = 0; i < cfgs.getLength(); i++)
		  {
			  Node sheetCfg = cfgs.item(i);
			  if(sheetCfg == null) continue;
			  Sheet sheet = map.get(sheetCfg.getAttributes().getNamedItem(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_NAME).getNodeValue());
			  if(sheet == null) continue;
			  Node each = sheetCfg.getFirstChild();
			  while(null != each)
			  {
				  ConfigConfigItemElement item = (ConfigConfigItemElement)each;
				  if(ConversionConstant.HORIZONTAL_SPLIT_MODE.equals(item.getConfigNameAttribute()))
					  sheet.horizontalSplitMode = Integer.parseInt(each.getTextContent());
				  if(ConversionConstant.VERTICAL_SPLIT_MODE.equals(item.getConfigNameAttribute()))
					  sheet.verticalSplitMode = Integer.parseInt(each.getTextContent());;
				  if(ConversionConstant.HORIZONTAL_SPLIT_POSITION.equals(item.getConfigNameAttribute()))
					  sheet.horizontalSplitPosition = Integer.parseInt(each.getTextContent());;
				  if(ConversionConstant.VERTICAL_SPLIT_POSITION.equals(item.getConfigNameAttribute()))
					  sheet.verticalSplitPosition = Integer.parseInt(each.getTextContent());;
				  each = each.getNextSibling();
			  }
		  }
		  
		  boolean showGridLines = true;
		  boolean foundGridLines = false;
		  NodeList configItemMap = settings.getElementsByTagName(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_ITEM_SET);
		  for(int i=0; i<configItemMap.getLength(); i++)
		  {
		    Node t = configItemMap.item(i);
		    if(ConversionConstant.ODF_ELEMENT_OOO_DOCUMENT_SETTINGS.equalsIgnoreCase(t.getAttributes().getNamedItem(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_NAME).getNodeValue()))
		    {
		      NodeList nodes = t.getChildNodes();
	          for(int j = 0; j < nodes.getLength(); j++)
	          {
	              Node n = nodes.item(j);
	              if(ConversionConstant.ODF_ELEMENT_CONFIG_SHOWGRID.equalsIgnoreCase(n.getAttributes().getNamedItem(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_NAME).getNodeValue())) 
	              {
	                 showGridLines = Boolean.parseBoolean(n.getChildNodes().item(0).getNodeValue().toString());
	                 foundGridLines = true;
	                 break;
	              }
	          }
	          if(foundGridLines)
	            break;
		    }
		  }
          for(Sheet sht: doc.sheetList)
          {
            sht.showGridLines = showGridLines;
          }
	  }
	  catch(Exception e)
	  {
		  LOG.log(Level.WARNING, "Import views settings failed!");
	  }
  }
  
}
