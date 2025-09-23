/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
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
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.Result;
import javax.xml.transform.sax.TransformerHandler;
import javax.xml.transform.stream.StreamResult;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfDocument.OdfMediaType;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableCellProperties;
import org.odftoolkit.odfdom.doc.OdfSpreadsheetDocument;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.odftoolkit.odfdom.dom.style.props.OdfTableColumnProperties;
import org.odftoolkit.odfdom.dom.style.props.OdfTableRowProperties;
import org.odftoolkit.odfdom.incubator.meta.OdfOfficeMeta;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.odftoolkit.odfdom.pkg.manifest.OdfFileEntry;
import org.w3c.dom.Element;
import org.xml.sax.SAXParseException;
import org.xml.sax.XMLReader;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.json2ods.ContextInfo;
import com.ibm.symphony.conversion.converter.json2ods.OdfExportPackage;
import com.ibm.symphony.conversion.converter.json2ods.formula.FormulaReference;
import com.ibm.symphony.conversion.converter.json2ods.formula.RowColIdIndexMeta;
import com.ibm.symphony.conversion.converter.json2ods.formula.SheetMeta;
import com.ibm.symphony.conversion.converter.json2ods.sax.element.GeneralDOMTreeSAXWriter;
import com.ibm.symphony.conversion.converter.json2ods.sax.element.PreserveConvertorFactory;
import com.ibm.symphony.conversion.converter.json2ods.sax.style.FontfaceConvertor;
import com.ibm.symphony.conversion.converter.json2ods.sax.style.PreservedStyleConvertor;
import com.ibm.symphony.conversion.converter.json2ods.sax.style.TableCellStyleConvertor;
import com.ibm.symphony.conversion.converter.json2ods.sax.style.TableColumnStyleConvertor;
import com.ibm.symphony.conversion.converter.json2ods.sax.style.TableRowStyleConvertor;
import com.ibm.symphony.conversion.converter.json2ods.sax.style.TableTableStyleConvertor;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.OdfDomUtil;
import com.ibm.symphony.conversion.service.formulalexer.IDMFormulaLexer;
import com.ibm.symphony.conversion.spreadsheet.ServiceConstants;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.CellStyleType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser.ParsedRef;
import com.ibm.symphony.conversion.spreadsheet.index.IndexUtil;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;
import com.ibm.symphony.conversion.spreadsheet.index.ODSOffsetRecorder;
import com.ibm.symphony.conversion.spreadsheet.index.Pair;
import com.ibm.symphony.conversion.spreadsheet.index.Pair.ColumnIDPair;

public class JSON2ODSConverterImpl
{
  public final static String RESERVERED = "reserved";

  public final static String COMMENTS_MSG_FILE = RESERVERED + "/comments.json";

  private static final Logger LOG = Logger.getLogger(JSON2ODSConverterImpl.class.getName());

  // Map for table style <sheetId, tableStyleId> sheetId is JSONId, tableStyleId is ODFId
  private HashMap<String, String> tableStyleMap;
  
  // Map for row style name -- row height
  private HashMap<String, Integer> rowStyleHeightMap;

  // Map for row old/new style name
  private HashMap<String, Map<String, Boolean>> rowOldNewStyleMap;

  // Map for row which page break <sheetId, List<rowIndex>>
  private HashMap<String, List<Integer>> rowBreakMap;
  
  // Map for column style name -- column width
  private HashMap<String, Integer> columnStyleWidthMap;

  // Map for column old/new style name
  private HashMap<String, String> columnOldNewStyleMap;
  
  //Map for column which has default width and page break <sheetId, List<columnIndex>>
  private HashMap<String, List<Integer>> columnBreakMap;
  
  // Map for cell style name -- OdfStyle
  private HashMap<String, OdfElement> cellStyleMap;

  // Map for format code -- format style name
  private HashMap<String, String> cellFormatStyleMap;
  
  // Map for old style name -- new style name
  private HashMap<String, Map<String,String>> newStyleMap;
  
  // Map for json style name -> inherited column preserved xml style name (cellStyleType.preserveStyleName)
  private HashMap<String, String> preserveColumnCellStyleMap;
  
  // Map for format code -- format style name
  private HashMap<String, String> formatStyleMap;
  
  private HashMap<Pair.ColumnIDPair, String> colStyleMap;
  
  private HashMap<String, String> colDefaultCellStyleMap;
  
  private HashMap<String, Boolean> protectMap;
  
  private Map<String, Integer> cellRNMap;
  
  private Map<String, Boolean> styleBreakMap;
    
  Map<String, Integer> rowRNMap = new HashMap<String, Integer>();

  private String conversionFolder;

  public JSON2ODSConverterImpl(String conversionFolder)
  {
    this.conversionFolder = conversionFolder;
    tableStyleMap = new HashMap<String, String>();
    rowStyleHeightMap = new HashMap<String, Integer>();
	rowOldNewStyleMap = new HashMap<String, Map<String, Boolean>>();
    columnStyleWidthMap = new HashMap<String, Integer>();
    columnOldNewStyleMap = new HashMap<String, String>();
    columnBreakMap = new HashMap<String, List<Integer>>();
    rowBreakMap = new HashMap<String, List<Integer>>();
    cellStyleMap = new HashMap<String, OdfElement>();
    cellFormatStyleMap = new HashMap<String, String>();
    newStyleMap = new HashMap<String, Map<String, String>>();
    formatStyleMap = new HashMap<String, String>();
    colStyleMap = new HashMap<Pair.ColumnIDPair,String>();
    colDefaultCellStyleMap = new HashMap<String,String>(); 
    cellRNMap = new HashMap<String,Integer>(); 
    rowRNMap = new HashMap<String, Integer>();
    styleBreakMap = new HashMap<String, Boolean>();
    protectMap = new HashMap<String,Boolean>();
    preserveColumnCellStyleMap = new HashMap<String, String>();
  }

  private void init(ConversionContext context)
  {
    context.put("columnStyleWidthMap", columnStyleWidthMap);
    context.put("columnOldNewStyleMap", columnOldNewStyleMap);
    context.put("columnBreakMap", columnBreakMap);
    context.put("tableStyleMap", tableStyleMap);
    context.put("rowStyleHeightMap", rowStyleHeightMap);
    context.put("rowOldNewStyleMap", rowOldNewStyleMap);
    context.put("rowBreakMap", rowBreakMap);
    context.put("newStyleMap", newStyleMap);
    context.put("cellFormatStyleMap", cellFormatStyleMap);
    context.put("preserveColumnCellStyleMap", preserveColumnCellStyleMap);
    context.put("styleBreakMap", styleBreakMap);
    
  }
  void readCommentArrayToContext(ConversionContext context, File commentsFile)
  {
      InputStream is = null;
      JSONArray comments = new JSONArray();
      try
      { 
        is = new FileInputStream(commentsFile);
        comments = JSONArray.parse(is);
        Map<String, JSONObject> items = new HashMap<String, JSONObject>();
        for (int i=0; i < comments.size(); i++ )
        {
          JSONObject item = (JSONObject) comments.get(i);
          String id = (String) item.get("id");
          if (id!=null && !id.isEmpty())
          {
            items.put(id, item);
          }
        }
        context.put("comments", items);
      }
      catch (FileNotFoundException e)
      {
        LOG.log(Level.WARNING,"failed to parse comments.json - FileNotFoundException", e);
      }
      catch (IOException e)
      {
        LOG.log(Level.WARNING,"failed to parse comments.json - IOException", e);
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
            LOG.log(Level.WARNING,"failed to close comments.json stream - IOException", e);
          }
        }
      }
  }

  /*
   * @param source the conversion folder that contains draft json files return the converted ods file path
   */
  public String convert(String source, String sourceType, String targetType, Map parameters) throws Exception
  {
    if (!sourceType.equalsIgnoreCase(ServiceConstants.JSON_MIMETYPE)
        || (!targetType.equalsIgnoreCase(ServiceConstants.ODS_MIMETYPE) && !targetType.equalsIgnoreCase(ServiceConstants.OTS_MIMETYPE)))
    {
      return null;
    }
    String targetFilePath = null;
    String targetFileName = null;
    OdfSpreadsheetDocument spreadsheetDoc = null;
    File odsDraftFile = new File(source + File.separator + IndexUtil.ODFDRAFT_NAME);
    InputStream draftStream = null;
    long startTime = System.currentTimeMillis();
    try
    {
      ConversionUtil.Document doc = new ConversionUtil.Document();
      String metaFilePath = source + File.separator + "meta.js";
      String contentFilePath = source + File.separator + "content.js";
      String preserveFilePath = source + File.separator + "preserve.js";
      String referenceFilePath = source + File.separator + "reference.js";
      doc.docMetaJSON = ConversionUtil.getObjectFromJSON(metaFilePath);
      doc.docContentJSON = ConversionUtil.getObjectFromJSON(contentFilePath, true); // pack row json
      doc.docPreserveJSON = ConversionUtil.getObjectFromJSON(preserveFilePath);
      // get locale from meta.js
      doc.docLocale = (String) doc.docMetaJSON.get(ConversionConstant.LOCALE);
      doc.docVersion = (String) doc.docMetaJSON.get(ConversionConstant.FILE_VERSION_FIELD);
      if (doc.docMetaJSON.get(ConversionConstant.DATE_1904) == null) {
    	  doc.isDate1904 = false;
      } else {
    	  doc.isDate1904 = (Boolean) doc.docMetaJSON.get(ConversionConstant.DATE_1904);
      }

      if (odsDraftFile.exists())
      {

        File odfdraftTemp = new File(source + File.separator + IndexUtil.ODFDRAFT_NAME + ".tmp");
        odsDraftFile.renameTo(odfdraftTemp);
        spreadsheetDoc = (OdfSpreadsheetDocument) OdfSpreadsheetDocument.loadDocument(odfdraftTemp);
        if (targetType.equalsIgnoreCase(ServiceConstants.ODS_MIMETYPE))
          targetFileName = "content.ods";
        else
          targetFileName = "content.ots";
      }
      else
      {
        if (targetType.equalsIgnoreCase(ServiceConstants.ODS_MIMETYPE))
        {
          targetFileName = "content.ods";
          draftStream = ConversionUtil.getBlankSpreadSheetDocument(ServiceConstants.ODS_MIMETYPE, source, doc.docLocale);
          spreadsheetDoc = (OdfSpreadsheetDocument) OdfSpreadsheetDocument.loadDocument(draftStream);
        }
        else
        {
          targetFileName = "content.ots";
          draftStream = ConversionUtil.getBlankSpreadSheetDocument(ServiceConstants.OTS_MIMETYPE, source, doc.docLocale);
          spreadsheetDoc = (OdfSpreadsheetDocument) OdfSpreadsheetDocument.loadDocument(draftStream);
        }
      }
      OdfPackage draftpackage = spreadsheetDoc.getPackage();
      byte[] debug_cfg = draftpackage.getBytes("debug.cfg");
      if (debug_cfg!=null)
      {
        Set<String> filter = new HashSet<String>(2);
        filter.add("odfdraft");
        filter.add("odfdraft.tmp");
        filter.add("content");
        String tmpDraftPath = new File(source).getAbsolutePath();
        OdfDomUtil.insertToPackage(spreadsheetDoc.getPackage(),tmpDraftPath, tmpDraftPath, "concord", filter);
      }

      if (doc.docVersion == null)
      {
        if (LOG.isLoggable(Level.INFO))
        {
          LOG.log(Level.INFO, "for draft before 1.0, map to short keys");
        }

        ConversionUtil.mapMeta2ShortKey(doc.docMetaJSON);
        ConversionUtil.mapContent2ShortKey(doc.docContentJSON);
      }
      else
      {
        if ("1.0".equals(doc.docVersion))
        {
          if (LOG.isLoggable(Level.INFO))
          {
            LOG.info("for draft version of 1.0, update all formuls.");
          }
          
          updateAllFormulas(doc, referenceFilePath);
        }
        //
      }
      doc.isODFFormula = IDMFormulaLexer.InternalFormulaType.equals(IDMFormulaLexer.LexFormulaType.FORMAT_ODF);
      if (doc.docVersion != null)
      {
        int fileVersion = (int) (Float.parseFloat(doc.docVersion) * 100);
        doc.isODFFormula = (fileVersion<104);
      }
      doc.getObjectFromJSON();

      ConversionContext context = new ConversionContext();
      context.put("TargetFolder", conversionFolder);
      context.put("DraftFolder", source);
      context.put("Source", doc);
      ContextInfo info = new ContextInfo();
      context.put("ContextInfo", info);
      context.put("formatStyleMap", formatStyleMap);
      context.put("colStyleMap",colStyleMap);
      context.put("colDefaultCellStyleMap", colDefaultCellStyleMap);
      context.put("InitialRepeatNumber", cellRNMap);
      
      context.put("InitialRowRepeatNumber",rowRNMap);
      
      context.put("ProtectInfo", protectMap);
      
      context.put("isODFFormula", doc.isODFFormula);

      // get comments data 
      String commentsFilePath = source + File.separator + "comments.js";
      File commentsfile = new File(commentsFilePath);
      if (commentsfile.exists())
      {
        readCommentArrayToContext(context, commentsfile);
      }
      else
      {
        commentsfile = new File(source, COMMENTS_MSG_FILE);
        if (commentsfile.exists())
          readCommentArrayToContext(context, commentsfile);
      }
      List<Range> aclranges = new ArrayList<Range>();
      if (doc.docVersion != null)
      {
        int fileVersion = (int) (Float.parseFloat(doc.docVersion) * 100);
        if(fileVersion<104)
        {
          context.put("isODFFormula", true);
        }
        else
        {
          context.put("isODFFormula", false);
          for(int i = 0; i < doc.nameList.size();i++)
          {
            Range name = doc.nameList.get(i);
            if (ConversionUtil.hasValue(name.address))
              name.address = IDMFormulaLexer.transOOXMLFormulaToODF(name.address);
          }
          for(int i = 0; i < doc.unnameList.size();i++)
          {
            Range unname = doc.unnameList.get(i);
            if (ConversionUtil.hasValue(unname.address))
            {
              // check ACL ranges
              if (unname.usage == RangeType.ACCESS_PERMISSION)
              {
                aclranges.add(unname);
              }
              else 
              {
                unname.address = IDMFormulaLexer.transOOXMLFormulaToODF(unname.address);
              }
            }
          }
          IDMFormulaLexer.transOOXMLFormulaToODF(doc.docPreserveJSON,"addr");
        }
      }

      Calendar modifiedtime = updateModifyTime(spreadsheetDoc);
      exportACLRanges(aclranges, modifiedtime, spreadsheetDoc);
      //creating SAXParser instance is time-cost, we would reuse the instance for reducing overhead. 
      //We prepare two instance for export to ensure independent.
      //one is for cell element, one is for preserve data in cell.
      XMLReader reader1 = ODSConvertUtil.createXMLReader2();
      context.put("XMLReaderInstance1", reader1);
      XMLReader reader2 = ODSConvertUtil.createXMLReader2();
      context.put("XMLReaderInstance2", reader2);
      
      // add xmlns:of namespace
//      OdfFileDom contentDom = spreadsheetDoc.getContentDom();
      
      context.put("Document", spreadsheetDoc);
      JsonToODSIndex index = new JsonToODSIndex(context,doc,spreadsheetDoc);
      // convert automatic styles
      this.checkCommentsCell(index,doc);
      init(context);
      OdfFileDom contentDom = (OdfFileDom)index.getDocuemnt();
      HashSet<String> imageSrcSet = new HashSet<String>();
      context.put(ConversionConstant.IMAGESRC_SET, imageSrcSet);
      // export row and column autostyles
      exportTableStyle(context, doc);
      exportRowStyle(context, doc);
      exportColumnStyle(context,doc);
      
      exportCellStyles(context, doc);

      updatePreservedCellStyles(context);
      // store content.xml to zipoutputstream directly instead of using odfDOM
      targetFilePath = conversionFolder + File.separator + targetFileName;
      OdfExportPackage exportpackage = new OdfExportPackage(targetFilePath);
      ODSSAXWriter writer = new ODSSAXWriter();
      TransformerHandler hdl = writer.getXMLWriter();
      writer.init(contentDom, spreadsheetDoc, exportpackage);
      GeneralDOMTreeSAXWriter domWriter = new GeneralDOMTreeSAXWriter(hdl);
      hdl.startDocument();
      // compatible with OpenOffice3.5, otherwise spreadsheet export by IBM docs can not be saved by OpenOffice
      char[] newLine = new char[]{'\n'};
      hdl.characters(newLine, 0, 1);
      domWriter.outputXML(context,contentDom);
      hdl.endDocument();
      
      // zip entry need not save
      // writer.save(spreadsheetDoc); 
//      writer.save(contentDom,spreadsheetDoc);
      //for conversion backward compatibility,
      //should also update the chart address if it is the old version if there is pnames for chart
      if(context.get("version_chart") == null || Boolean.parseBoolean(context.get("version_chart").toString()) == false) //no chart document export then check if need pnames to update the chart address
      {
        // below logic will write chart content to hdl, it is not necessary
        // work around here to write to a temp ByteArray
        ByteArrayOutputStream outStream = new ByteArrayOutputStream();
        Result resultxml = new StreamResult(outStream);
        hdl.setResult(resultxml);

        List<OdfDocument> chartDocs = spreadsheetDoc.getEmbeddedDocuments(OdfMediaType.CHART);
        for(OdfDocument chartDoc : chartDocs)
        {
          try
          {
            Element chartBody = (Element) chartDoc.getContentDom().getElementsByTagName(ConversionConstant.ODF_ELEMENT_OFFICE_BODY).item(0);
            PreserveConvertorFactory.getInstance().getConvertor(ConversionConstant.ODF_ELEMENT_OFFICE_CHART).convert(context, hdl, chartBody.getFirstChild(), chartBody);
          }
          catch(SAXParseException e)
          {
            LOG.log(Level.INFO, "invalid chart document format");
          }
        }
      }
      
      updateSettings(spreadsheetDoc, doc);
//      exportViewsSettings(spreadsheetDoc, doc);
//      exportNameRanges(doc.nameList, doc, spreadsheetDoc);
      File sourceFolder = new File(source);
      extractImage(context, spreadsheetDoc, sourceFolder);

      //package concord draft to ODF package
      boolean packageDraft = (parameters != null) ? Boolean.valueOf((String)parameters.get("packageDraft")) : false;
      if(packageDraft)
      {
        String picFolderPath = (String)parameters.get("pictureFolder");
        OdfDomUtil.packageConcordDraft(new File(source), spreadsheetDoc, picFolderPath);
      }
      // for debug
      if (debug_cfg!=null)
      {
        StringBuffer logbuffer = new StringBuffer();
        logbuffer.append("\nCS Version:"+ ConversionUtil.getVersionFinal(this.getClass()));
        logbuffer.append("\nstarttime:"+ new Date(startTime));
        logbuffer.append("\nsourcepath:"+ source);
        logbuffer.append("\ndest path:" + conversionFolder);
        logbuffer.append("\narguments:" + parameters);
        logbuffer.append("\nmeta locale:" + doc.docLocale);
        logbuffer.append("\nmeta version:"+ doc.docVersion);
        logbuffer.append("\nisODFFormula:"+ context.get("isODFFormula"));
        logbuffer.append("\nlogtime:" + new Date());
        draftpackage.insert(logbuffer.toString().getBytes("UTF-8"), "output.log", "");
        OdfDomUtil.packageConcordDraft(new File(source), spreadsheetDoc, "");
      }
      
      // save the document
      exportpackage.MergePackage(spreadsheetDoc);
      exportpackage.Save();
      // spreadsheetDoc.save(targetFilePath);
      ODSOffsetRecorder reader = (ODSOffsetRecorder) context.get("Recorder");
      reader.close();
      this.clear();
      context.clear();
    }
    //Do not catch exception here because need JSON2ODSConverter to catch it and set error conversion result
    finally{
      long endTime = System.currentTimeMillis();
      System.out.println("JSON2ODS total cost : " + (endTime - startTime));
      try
      {
        if(draftStream != null)
          draftStream.close();
        if(spreadsheetDoc !=null)
          spreadsheetDoc.close();
        
        File odfdraftTemp = new File(source + File.separator + IndexUtil.ODFDRAFT_NAME + ".tmp");
        if( odfdraftTemp.exists() )
          odfdraftTemp.delete();
      }
      catch (IOException e)
      {
        LOG.log(Level.SEVERE, "Error when accessing draft");
      }
    }

    return targetFilePath;
  }

  private Calendar updateModifyTime(OdfSpreadsheetDocument odfSheetDoc)
  {
    try
    {
      Calendar nowtime = Calendar.getInstance();
      OdfOfficeMeta odfOfficeMeta;
      odfOfficeMeta = new OdfOfficeMeta(odfSheetDoc.getMetaDom());
      odfOfficeMeta.setDcdate(Calendar.getInstance());
      return nowtime;
    }
    catch (Exception e)
    {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    return null;
  }

  private void exportACLRanges(List<Range> aclranges, Calendar modifiedtime, OdfSpreadsheetDocument odfSheetDoc)
  {
    try
    {
      String prefix = "_DOCS_ACL_";
      OdfOfficeMeta odfOfficeMeta;
      odfOfficeMeta = new OdfOfficeMeta(odfSheetDoc.getMetaDom());
      List<String> names = odfOfficeMeta.getUserDefinedDataNames();
      if (names != null)
      {
        Map acls = new HashMap<Integer, String>();
        Iterator<String> it = names.iterator();
        while (it.hasNext())
        {
          String name = it.next();
          if (name.startsWith(prefix))
          {
            odfOfficeMeta.removeUserDefinedDataByName(name);
          }
        }
      }
      if (aclranges.size() > 0)
      {
        long timevalue = modifiedtime.getTimeInMillis();
        odfOfficeMeta.setUserDefinedData(prefix + "0", "text", String.valueOf(timevalue));
        JSONObject acljson = new JSONObject();
        Iterator<Range> it1 = aclranges.iterator();
        while(it1.hasNext())
        {
          Range aclrange = it1.next();
          acljson.put(aclrange.rangeId, aclrange.rangeContentJSON);
        }
        JSONObject aclrootjson = new JSONObject();
        aclrootjson.put("", acljson);
        String tmpstr = aclrootjson.serialize();
        if (tmpstr.startsWith("{"))
          tmpstr=tmpstr.substring(1);
        if (tmpstr.endsWith("}"))
          tmpstr=tmpstr.substring(0,tmpstr.length()-1);
        String acljsonstr = ConversionUtil.ZIPStringToHexString(tmpstr);
        int textlen = 250;
        for (int i = 0 ; i <= (acljsonstr.length()-1)/textlen; i++)
        {
            int endpos = (i + 1) * textlen;
            if (endpos > acljsonstr.length()) 
              endpos = acljsonstr.length();
            String text = acljsonstr.substring(i*textlen, endpos);
            odfOfficeMeta.setUserDefinedData(prefix + (i+1), "text", text);
        }
      }
      
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "load ACL range failed", e);
    }
    
  }

  private void checkCommentsCell(JsonToODSIndex index, Document doc)
  {
    Map<String, Range> commentsmap = index.getCommentsMap();
    Iterator<Entry<String, Range>> pdata = commentsmap.entrySet().iterator();
    while( pdata.hasNext())
    {
      Entry entry = pdata.next();
      String cellid = (String)entry.getKey();
      Range range =  (Range)entry.getValue();
      Sheet sheet = doc.getSheetById(range.sheetId);
      if (sheet != null)
      {
        ParsedRef ref = ReferenceParser.parse(range.address);
        int startRow = ref.getIntStartRow();
        int startCol = ref.getIntStartCol();
        if (startRow > 0 && startCol > 0)
        {
          Row row = sheet.getRowByIndex(startRow - 1);
          if (row != null)
          {
            ConversionUtil.Cell c = row.getCellByIndex(range.startColId);
            if (c == null) {
              // if comments is added to an empty cell without sheet data
              // need create cell model here
              ConversionUtil.Cell cell = new ConversionUtil.Cell();
              cell.rowId = row.rowId;
              cell.cellIndex = startCol - 1;
              cell.cellId = range.startColId;
              cell.repeatedNum = 0;
              row.cellList.add(cell);
              row.cellmap.put(cell.cellId, row.cellList.size()-1);  // create (colid) -> (cell index in cellList) map
              Cell prevcell = row.getPrevCell(sheet.columnIdArray, range.startColId);
              if (prevcell != null && 
                  prevcell.cellIndex + prevcell.repeatedNum >= cell.cellIndex)
              {
                prevcell.repeatedNum = cell.cellIndex - prevcell.cellIndex - 1;
                Cell newCell = new Cell(prevcell);
                newCell.rowId = row.rowId;
                newCell.cellIndex = cell.cellIndex + 1;
                newCell.repeatedNum = newCell.cellIndex - cell.cellIndex - 1;
                newCell.cellId = doc.getId("col", sheet.sheetId, newCell.cellIndex, true);
                row.cellList.add(newCell);
                row.cellmap.put(newCell.cellId, row.cellList.size()-1);  // create (colid) -> (cell index in cellList) map
              }
            }
            else if (c.repeatedNum > 0)
            {
              c.repeatedNum = 0;
              Cell newCell = new Cell(c);
              newCell.repeatedNum = c.repeatedNum - 1;
              newCell.rowId = row.rowId;
              newCell.cellIndex = c.cellIndex + 1;
              newCell.cellId = doc.getId("col", sheet.sheetId, newCell.cellIndex, true);
              row.cellList.add(newCell);
              row.cellmap.put(newCell.cellId, row.cellList.size()-1);  // create (colid) -> (cell index in cellList) map
            }
          }
        }
      }
    }
  }

  private void updateSettings(OdfDocument spreadsheetDoc,Document doc)
  {
    OdfFileDom settings;
    try
    {
      settings = spreadsheetDoc.getSettingsDom();
      SettingUpdate update = new SettingUpdate(settings,doc);
      update.updateSettings();
    }
    catch (Exception e)
    {
      LOG.log(Level.INFO, "Update Setting Exception");
    }
  }

  private void extractImage(ConversionContext context, OdfDocument odf, File sourceFolder)
  {   
    File pictureRoot = new File(sourceFolder.getAbsolutePath() + "/Pictures/");
    if (!pictureRoot.exists())
      return;
    
    HashSet<String> imageSrcSet = (HashSet<String>) context.get(ConversionConstant.IMAGESRC_SET);
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
              pictureFileList[i].delete();
                
              if(fileEntries.contains(filePath))
                odfPackage.remove(filePath);
            }
          }
        }
        else if(pictureFileList[i].isDirectory())
        {
          File[] subPictureFileList = pictureFileList[i].listFiles();
          for (int j = 0; j < subPictureFileList.length; j++)
          {
            String subFileName = subPictureFileList[j].getName();
            int len = subFileName.length();
            String subFileNameInOdf = subFileName.substring(0, len-3)+fileName;
            if(!imageSrcSet.contains(subFileNameInOdf))
            {
              odfPackage.remove("Pictures/"+subFileNameInOdf);
              //subPictureFileList[j].delete();
            }
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.SEVERE, "Picture copy/delete error", e);
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
  
  private void updatePreservedCellStyles(ConversionContext context)
  {
    HashMap<String, List<String>> columnCellMap = (HashMap<String,List<String>>) context.get("columnCellMap");
    HashMap<Pair.ColumnIDPair, String> colStyleMap = (HashMap<ColumnIDPair, String>) context.get("colStyleMap");
    HashMap<String,String> formatStyleMap = (HashMap<String, String>) context.get("formatStyleMap");
    HashMap<String, String> colDefaultCellStyleMap = (HashMap<String, String>) context.get("colDefaultCellStyleMap");
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    Document doc = (Document) context.get("Source");
    Iterator<Entry<String, List<String>>> columnCells = columnCellMap.entrySet().iterator();
    while(columnCells.hasNext())
    {
      Entry<String, List<String>> colEntry = columnCells.next();
      String key = colEntry.getKey();
      Iterator<String> it = colEntry.getValue().iterator();
      while(it.hasNext())
      {
        String styleName = it.next();
        PreservedStyleConvertor convertor = new PreservedStyleConvertor();
        OdfStyle style = convertor.convertStyle(context, styleName);
        String dCellStyleId = colDefaultCellStyleMap.get(key);
        Column col = (Column) index.getJsonDataObject(key);
        if(col != null)
        {
          if(ConversionUtil.hasValue(col.styleId))
          {
            ConversionUtil.CellStyleType defaultCellStyle = (CellStyleType) context.get("defaultCellStyle");
            boolean bDefault = false;
            CellStyleType colDStyleType = doc.getCellStyleFromStyleId(col.styleId);

            if (ConversionUtil.hasValue(colDStyleType.backgroundColor)
                && (!(colDStyleType.backgroundColor.equals(defaultCellStyle.backgroundColor)) || bDefault))
              style.setProperty(OdfStyleTableCellProperties.BackgroundColor, colDStyleType.backgroundColor);
            else
              style.removeProperty(OdfStyleTableCellProperties.BackgroundColor);
          }
        }
        
        String newFormatStyleName = formatStyleMap.get(dCellStyleId);
        style.setStyleDataStyleNameAttribute(newFormatStyleName);
        Pair.ColumnIDPair pairKey = new Pair.ColumnIDPair(key,styleName);
        colStyleMap.put(pairKey, style.getStyleNameAttribute());
      }
    }
  }

  private void updateAllFormulas(Document doc, String referenceFilePath)
  {
    File file = new File(referenceFilePath);
    if (!file.exists())
    {
      // reference not exists
      return;
    }
    
    JSONObject metaJson = doc.docMetaJSON;
    JSONObject contentJson = doc.docContentJSON;
    JSONObject referenceJson = ConversionUtil.getObjectFromJSON(referenceFilePath);
    
    float fileVersion = 0;
    String oVersion = doc.docVersion;
    if(oVersion!=null)
       fileVersion = Float.parseFloat(oVersion);
    if(fileVersion<1.0)
    {
      ConversionUtil.mapReference2ShortKey(referenceJson);
    }
    
    FormulaReference formulaReference = new FormulaReference(referenceJson);
    SheetMeta sheetMeta = new SheetMeta((JSONObject) metaJson.get(ConversionConstant.SHEETS));
    RowColIdIndexMeta rowColIdIndexMeta = new RowColIdIndexMeta((JSONObject) metaJson.get(ConversionConstant.SHEETSARRAY));
    
    JSONObject referenceSheets = (JSONObject) referenceJson.get(ConversionConstant.SHEETS);
    // NULL when reference is empty
    if (referenceSheets == null)
    {
      return;
    }
    JSONObject contentSheets = (JSONObject) contentJson.get(ConversionConstant.SHEETS);
    if (contentSheets == null)
    {
      return;
    }
    Set<Entry<String, JSONObject>> sheetsEntrySet = referenceSheets.entrySet();
    for (Iterator iterator = sheetsEntrySet.iterator(); iterator.hasNext();)
    {
      Entry<String, JSONObject> entry = (Entry<String, JSONObject>) iterator.next();
      String sheetId = entry.getKey();
      JSONObject referenceSheetContent = entry.getValue();
      JSONObject contentSheetContent = (JSONObject) contentSheets.get(sheetId);
      if(contentSheetContent == null)
      {
        continue;
      }
      contentSheetContent = (JSONObject) contentSheetContent.get(ConversionConstant.ROWS);
      Set<Entry<String, JSONObject>> rowsEntrySet = referenceSheetContent.entrySet();
      for (Iterator rowsEntrySetIter = rowsEntrySet.iterator(); rowsEntrySetIter.hasNext();)
      {
        Entry<String, JSONObject> rowEntry = (Entry<String, JSONObject>) rowsEntrySetIter.next();
        String rowId = rowEntry.getKey();
        JSONObject referenceRowContent = rowEntry.getValue();
        JSONObject contentRowContent = (JSONObject) contentSheetContent.get(rowId);
        if (contentRowContent == null)
        {
          continue;
        }
        Set<Entry<String, JSONObject>> columnsEntrySet = referenceRowContent.entrySet();
        for (Iterator columnsEntryIter = columnsEntrySet.iterator(); columnsEntryIter.hasNext();)
        {
          Entry<String, JSONObject> columnEntry = (Entry<String, JSONObject>) columnsEntryIter.next();
          String colId = columnEntry.getKey();
          JSONObject contentCell = (JSONObject) contentRowContent.get(colId);
          if (contentCell == null)
          {
            continue;
          }
          // contentCell is a formula cell, update its address
          Object v = contentCell.get(ConversionConstant.VALUE);
          if (v instanceof String)
          {
            String formula = (String) v;
            // null safe, very rare cases that cell is mentioned in reference.js but is not a formula cell or not having a formula
            if (formula != null)
            {
              String updatedFormula = formulaReference.updateFormula(sheetId, rowId, colId, formula, rowColIdIndexMeta, sheetMeta);
              if (!formula.equals(updatedFormula))
              {
                contentCell.put(ConversionConstant.VALUE, updatedFormula);
              }
            }
          }
          else
          {
            LOG.log(Level.WARNING, "cell at ({0}, {1}, {2}), value {3} is not a formula cell, but has record in reference.", new Object[] { sheetId, rowId, colId, v });
          }
        }
      }
    }
  }
  
  // clear all the variables
  private void clear()
  {
    tableStyleMap.clear();
    rowStyleHeightMap.clear();
    columnStyleWidthMap.clear();
    rowOldNewStyleMap.clear();
	rowBreakMap.clear();
	columnOldNewStyleMap.clear();
	columnBreakMap.clear();
    cellStyleMap.clear();
    cellFormatStyleMap.clear();
    preserveColumnCellStyleMap.clear();
  }


  
  private void exportTableStyle(ConversionContext context,ConversionUtil.Document doc)
  {
    TableTableStyleConvertor convertor = new TableTableStyleConvertor();
    for (int i = 0; i < doc.sheetList.size(); i++)
    {
      Sheet sheet = doc.sheetList.get(i);
      convertor.convertStyle(context, sheet);
    }
    
  }
  
  private void exportRowStyle(ConversionContext context,ConversionUtil.Document doc)
  {
    TableRowStyleConvertor convertor = new TableRowStyleConvertor(); 
    // export default row style
    convertor.convertDefaultRowStyle(context);
    // export other row style
    // start with "ro2" because "ro1" is exist in the empty spreadsheet document
    Map<Integer,String> pageBreakMap = new HashMap<Integer,String>();
    int rowStyleIndex = 2;
    for (int i = 0; i < doc.uniqueRows.uniqueRowList.size(); i++)
    {
      ConversionUtil.Row styledRow = doc.uniqueRows.uniqueRowList.get(i);
      String breakType = getOldStyleBreakType(context, styledRow.rowId, OdfStyleFamily.TableRow);
      if (styledRow.height != ConversionUtil.Row.defaultHeight)
      {
        boolean isInserted = false;
        Iterator<String> keys = rowStyleHeightMap.keySet().iterator();
        while (keys.hasNext())
        {
          if (rowStyleHeightMap.get(keys.next()) == styledRow.height)
          {
          	String insertedBreakTyep = pageBreakMap.get(styledRow.height);
          	if(breakType.equals(insertedBreakTyep) || "both".equals(insertedBreakTyep))
          	  isInserted = true;
            break;
          }
        }
        if (!isInserted)
        {
          if(pageBreakMap.get(styledRow.height) != null)
          {
            pageBreakMap.put(styledRow.height, "both"); 
          }
          else
          {
          	pageBreakMap.put(styledRow.height, breakType);
          }     
          convertor.convertStyle(context,styledRow);
        }
      }
    }
    exportBreakDefaultRow(context,doc,convertor);
  }
  
  private void exportBreakDefaultRow(ConversionContext context, ConversionUtil.Document doc, TableRowStyleConvertor convertor)
  {
    JsonToODSIndex odsIndex = (JsonToODSIndex)context.get("ODSIndex");
    //the different row(both has page) who has default height(80) may have the different style(pixel different) 
    List<String> oldStyleArray = new ArrayList<String>();
	int sheetLength = doc.sheetList.size();
    for (int index = 0; index < sheetLength; index++)
    {
      Sheet sheet = doc.sheetList.get(index);
      List<Integer> rowBreakList = new ArrayList<Integer>(); 
      int rowIdLength = sheet.rowIdArray.size();
      for(int i = 0; i < rowIdLength; i++)
      {
    	String rowId = sheet.rowIdArray.get(i);
    	// rowId == "" or !rowId.startWith("or") continue;
    	if(!ConversionUtil.hasValue(rowId) || !rowId.startsWith(ConversionConstant.ROWID))
    	  continue;
    	OdfElement odfNode = odsIndex.getOdfNodes(rowId);
    	if(odfNode != null)
    	{
    	  OdfStyle oldStyle = null;
    	  String oldStyleName = odfNode.getAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
    	  if(oldStyleName != null)
    	    oldStyle = ODSConvertUtil.getOldStyle(context, oldStyleName, OdfStyleFamily.TableRow);
    	  if(oldStyle == null)
    		continue;
    	  String breakType = oldStyle.getProperty(OdfTableRowProperties.BreakBefore);
    	
      	  ConversionUtil.Row styledRow = sheet.getRowById(rowId);
    	  if(ConversionConstant.BREAK_PAGE.equals(breakType))
    	  {
    		if((styledRow == null || styledRow.height == ConversionUtil.Row.defaultHeight))
    		{
    		  Boolean isInserted = false;  
    		  int styleArrayLength = oldStyleArray.size();
    		  for(int j = 0; j < styleArrayLength; j++)
    		  {
    		    if(oldStyleArray.get(j).equals(oldStyle))
    			  isInserted = true; 
    		  }
    		  
    	      if(!isInserted)
    	      {
    	        String rowStyleName = ODSConvertUtil.getStyleName(OdfStyleFamily.TableRow, ConversionConstant.ROWID);
    	        if(styledRow == null)
    	        {
    	    	  styledRow = new ConversionUtil.Row();
    	    	  styledRow.rowId = rowId;
    	        }    
    	        rowStyleHeightMap.put(rowStyleName, ConversionUtil.Row.defaultHeight);
    	        convertor.createStyle(context, styledRow, rowStyleName, oldStyleName, false);
    	        oldStyleArray.add(oldStyleName);
    	      }
    	    }
    	    rowBreakList.add(i);
    	  }
    	}
      }
      if(rowBreakList != null)
        rowBreakMap.put(sheet.sheetId, rowBreakList);
    }  
  }
  
  // export the column automatic style
  private void exportColumnStyle(ConversionContext context,ConversionUtil.Document doc)
  {
    TableColumnStyleConvertor convertor = new TableColumnStyleConvertor();
    // export default column style
    convertor.convertDefaultColumnStyle(context);
    
    Map<Integer,String> pageBreakMap = new HashMap<Integer,String>();
//    columnStyleWidthMap.put(DEFAULT_COLUMN_STYLE_NAME, ConversionUtil.Column.defaultWidth);
//    // OdfStyle odfColumnStyle = new OdfStyle((OdfFileDom)autoStyles.getOwnerDocument());
//    // odfColumnStyle.setStyleNameAttribute(DEFAULT_COLUMN_STYLE_NAME);
//    // odfColumnStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE_COLUMN.toString());
//    // odfColumnStyle.setProperty(OdfTableColumnProperties.ColumnWidth, convertPXToINCH(ConversionUtil.Column.defaultWidth));
//    // autoStyles.appendChild(odfColumnStyle);
    // export other column style
    // start with "co2" because "co1" is exist in the empty spreadsheet document
    for (int i = 0; i < doc.uniqueColumns.uniqueColumnList.size(); i++)
    {
      ConversionUtil.Column styledColumn = doc.uniqueColumns.uniqueColumnList.get(i);
      String breakType = getOldStyleBreakType(context, styledColumn.columnId, OdfStyleFamily.TableColumn);
      if (styledColumn.width != ConversionUtil.Column.defaultWidth)
      {
        boolean isInserted = false;
        Iterator<String> keys = columnStyleWidthMap.keySet().iterator();
        while (keys.hasNext())
        {
          if (columnStyleWidthMap.get(keys.next()) == styledColumn.width)
          {
        	String insertedBreakTyep = pageBreakMap.get(styledColumn.width);
        	if(breakType.equals(insertedBreakTyep) || "both".equals(insertedBreakTyep))
        	  isInserted = true;
            break;
          }
        }
  	          
        if (!isInserted)
        {
          if(pageBreakMap.get(styledColumn.width) != null)
          {
            pageBreakMap.put(styledColumn.width, "both"); 
          }
          else
          {
        	pageBreakMap.put(styledColumn.width, breakType);
          }       	
          convertor.convertStyle(context, styledColumn);
        }
      }
    }

    exportBreakDefaultColumn(context,doc,convertor);
  }  
  
  private void exportBreakDefaultColumn(ConversionContext context, ConversionUtil.Document doc, TableColumnStyleConvertor convertor)
  {
    JsonToODSIndex odsIndex = (JsonToODSIndex)context.get("ODSIndex");
    //the different columns(both has page) who has default width(16) may have the different style(pixel different) 
    List<String> oldStyleArray = new ArrayList<String>();
	int sheetLength = doc.sheetList.size();
    for (int index = 0; index < sheetLength; index++)
    {
      Sheet sheet = doc.sheetList.get(index);
      List<Integer> columnBreakList = new ArrayList<Integer>(); 
      int columnBreakLength = sheet.columnIdArray.size();
      for(int i = 0; i < columnBreakLength; i++)
      {
    	String columnId = sheet.columnIdArray.get(i);
    	if(!ConversionUtil.hasValue(columnId) || !columnId.startsWith(ConversionConstant.COLUMNID))
    	  continue;
    	OdfElement odfNode = odsIndex.getOdfNodes(columnId);
    	if(odfNode != null)
    	{
    	  String oldStyleName = odfNode.getAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
    	  OdfStyle oldStyle = null;
    	  if(oldStyleName != null)
    	    oldStyle = ODSConvertUtil.getOldStyle(context, oldStyleName, OdfStyleFamily.TableColumn);
    	  if(oldStyle == null)
    	    continue;
    	  String breakType = oldStyle.getProperty(OdfTableColumnProperties.BreakBefore);
    	
    	  if(ConversionConstant.BREAK_PAGE.equals(breakType))
    	  {
    	    ConversionUtil.Column styledColumn = sheet.getStyledColumnById(columnId);
    		if(styledColumn == null || styledColumn.width == ConversionUtil.Column.defaultWidth)
    		{
    		  Boolean isInserted = false;
    		  int styleArrayLength = oldStyleArray.size();
    		  for(int j = 0; j < styleArrayLength; j++)
    		  {
    		    if(oldStyleArray.get(j).equals(oldStyle))
    			  isInserted = true; 
    		  }
    	      if(!isInserted)
    	      {
    	        String columnStyleName = ODSConvertUtil.getStyleName(OdfStyleFamily.TableColumn, ConversionConstant.COLUMNID);
    	        if(styledColumn == null)
    	        {
    	          styledColumn = new ConversionUtil.Column();
    	          styledColumn.columnId = columnId;
    	        }
    	        columnStyleWidthMap.put(columnStyleName, ConversionUtil.Column.defaultWidth);
    	        convertor.createStyle(context,styledColumn,columnStyleName,oldStyleName);
    	        oldStyleArray.add(oldStyleName);
    	      }
    	    }
    	    columnBreakList.add(i);
    	  }
    	}
      }
      if(columnBreakList != null)
        columnBreakMap.put(sheet.sheetId, columnBreakList);
    }  
  }
  
  private void exportCellStyles(ConversionContext context,Document doc)
  {
    // default cell auto style
    ConversionUtil.CellStyleType defaultCellStyle = new ConversionUtil.CellStyleType();
    ConversionUtil.CellStyleType defaultCellStyleFromODF =  com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil.convertStyle(context, ODSConvertUtil.DEFAULT_CELL_STYLE_NAME);
    List<String> fontNameList = new ArrayList<String>();
    context.put("fontNameList", fontNameList);
    context.put("defaultCellStyle", defaultCellStyle);
    context.put("defaultCellStyleFromODF", defaultCellStyleFromODF);//is used when merge style from draft to odf
    context.put("exportProtection", doc.exportProtection);
    for (ConversionUtil.CellStyleType cellStyle : doc.cellStyleList)
    {
      if (!ConversionConstant.DEFAULT_CELL_STYLE.equals(cellStyle.styleId))
      {
        TableCellStyleConvertor conertor = new TableCellStyleConvertor();
        conertor.convertStyle(context,cellStyle);
        
      }
    }
    FontfaceConvertor convertor = new FontfaceConvertor();
    try
    {
      convertor.convertFontFaceDecls(context,fontNameList);
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }

  }
  
  private OdfSpreadsheetDocument loadDocument(String source,String targetType)
  {
    String targetFilePath = null;
    String targetFileName = null;
    OdfSpreadsheetDocument spreadsheetDoc = null;
    
    File odsDraftFile = new File(source + File.separator + IndexUtil.ODFDRAFT_NAME);
    InputStream draftStream = null;
    try
    {
      if (odsDraftFile.exists())
      {
        draftStream = new FileInputStream(odsDraftFile);
        spreadsheetDoc = (OdfSpreadsheetDocument) OdfSpreadsheetDocument.loadDocument(draftStream);
        if (targetType.equalsIgnoreCase(ServiceConstants.ODS_MIMETYPE))
          targetFileName = "content.ods";
        else
          targetFileName = "content.ots";
      }
      else
      {
        if (targetType.equalsIgnoreCase(ServiceConstants.ODS_MIMETYPE))
        {
          targetFileName = "content.ods";
          draftStream = ConversionUtil
          .getBlankSpreadSheetDocument(ServiceConstants.ODS_MIMETYPE, source);
          spreadsheetDoc = (OdfSpreadsheetDocument) OdfSpreadsheetDocument.loadDocument(draftStream);
        }
        else
        {
          targetFileName = "content.ots";
          draftStream = ConversionUtil
          .getBlankSpreadSheetDocument(ServiceConstants.OTS_MIMETYPE, source);
          spreadsheetDoc = (OdfSpreadsheetDocument) OdfSpreadsheetDocument.loadDocument(draftStream);
        }
      }
    }
    catch(Exception e)
    {
      
    }
    return spreadsheetDoc;
  }
  
  private String getOldStyleBreakType(ConversionContext context, String columnRowId, OdfStyleFamily styleFamily)
  {
 	HashMap<String,List<String>> styleNameMap = (HashMap<String,List<String>>) context.get("styleNameMap");
    List<String> styleList = styleNameMap.get(columnRowId);
    if(styleList != null)
    {
      Iterator<String> it = styleList.iterator();
      while(it.hasNext())
      {
    	OdfStyle oldStyle = ODSConvertUtil.getOldStyle(context, it.next(), styleFamily);
    	Map<OdfStyleProperty,String> styleMap = oldStyle.getStyleProperties();
    	Iterator<OdfStyleProperty> styleIt = styleMap.keySet().iterator();
    	while(styleIt.hasNext())
    	{
    	  OdfStyleProperty stylePro = styleIt.next();
    	  if("fo:break-before".equals(stylePro.toString()))
    		return styleMap.get(stylePro);
    	}
        break;
      }	
    }
	return "auto";
  }
  
  public static void main(String[] args)
  {
    // long start = System.currentTimeMillis();
    // String conversionFolder = "F:\\eclipse-SDK-3.4-win32\\workspace\\Concord\\content.js";
    // new JSON2ODFConverterImpl().convert(conversionFolder, "js", "ods");
    // long end = System.currentTimeMillis();
    // System.out.println("done in " + (end - start) + "ms");

  }
}
