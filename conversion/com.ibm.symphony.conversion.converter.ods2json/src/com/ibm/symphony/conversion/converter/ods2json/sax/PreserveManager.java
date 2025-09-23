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

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.OdfDocument.OdfMediaType;
import org.odftoolkit.odfdom.doc.OdfDocument.OdfXMLFile;

import com.ibm.json.java.JSONObject;
import com.ibm.json.java.OrderedJSONObject;
import com.ibm.symphony.conversion.converter.ods2json.OdfdraftPackage;
import com.ibm.symphony.conversion.converter.ods2json.sax.context.GeneralContext;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.formulalexer.IDMFormulaLexer;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.FormulaToken;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.JSONModel;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser.ParsedRef;
//import com.ibm.symphony.conversion.spreadsheet.index.ODSToJsonIndex;

public class PreserveManager
{
  private static final Logger LOG = Logger.getLogger(PreserveManager.class.getName());

  private static final String CLAZZ = PreserveManager.class.getName();
  
  // private PreserveStyleList styleList;
  private HashMap<String, ArrayList<PreserveRange>> rangeList;

  private int maxIndex;// for create element id

  private HashMap<String, Integer> rangeIdMap;// for create range id for each element

  private final static String configFileName = "preserve_name.json";

  public static String CHILD_KEY = "child";

  public static String PARENT_KEY = "parent";

  public static HashMap<String, HashMap<String, RangeType>> configMap = new HashMap<String, HashMap<String, RangeType>>();;

  static
  {
	loadConfig();  
  }
  
  public PreserveManager()
  {
    this.init();
  }

  // construct configMap
  private static void loadConfig()
  {
    try
    {
      InputStream in = PreserveManager.class.getResourceAsStream(configFileName);
      if (null != in)
      {
        JSONObject map = JSONObject.parse(in);
        Iterator<String> eleIter = map.keySet().iterator();
        while (eleIter.hasNext())
        {
          String eleName = eleIter.next();
          JSONObject attrJSONMap = (JSONObject) map.get(eleName);
          Iterator<String> attrIter = attrJSONMap.keySet().iterator();
          HashMap<String, RangeType> attrMap = new HashMap<String, RangeType>();
          while (attrIter.hasNext())
          {
            String attrName = attrIter.next();
            String type = (String) attrJSONMap.get(attrName);
            RangeType rangeType = RangeType.valueOf(type.toUpperCase());
            attrMap.put(attrName, rangeType);
          }
          configMap.put(eleName, attrMap);
        }
        in.close();
      }
    }
    catch (IOException e)
    {
      LOG.log(Level.SEVERE,"Load Preserve Config File Failed",e);
    }
  }

  private void init()
  {
    // input
    maxIndex = ConversionConstant.ID_INITAL_VALUE;
    rangeIdMap = new HashMap<String, Integer>();
    // output
    // styleList = new PreserveStyleList();
    rangeList = new HashMap<String, ArrayList<PreserveRange>>();
  }

  public HashMap<String, RangeType> getConfigByElementName(String name)
  {
    return (HashMap<String, RangeType>) configMap.get(name);
  }

  // public static class PreserveStyle{
  // public String address;
  // //odf attribute name/value pair
  // private HashMap<String, String> attributeMap;
  // //odf element name/id
  // private HashMap<String, String> elementMap;
  // public PreserveStyle(){
  // attributeMap = new HashMap<String, String>();
  // elementMap = new HashMap<String, String>();
  // }
  // public void addAttribute(String attrName, String attrValue){
  // attributeMap.put(attrName, attrValue);
  // }
  //    
  // public void addElement(String elementName, String elementId){
  // elementMap.put(elementName, elementId);
  // }
  // }

  // public static class PreserveRangeList{
  // private HashMap<String, HashMap<String, String>> rangeList;
  //    
  // public PreserveRangeList(){
  // rangeList = new HashMap<String, HashMap<String, String>>();
  // }
  // public void addRange(String elementId, String attrName, String rangeAddress){
  // HashMap<String, String> attrList = rangeList.get(elementId);
  // if(attrList == null){
  // attrList = new HashMap<String, String>();
  // rangeList.put(elementId, attrList);
  // }
  // attrList.put(attrName, rangeAddress);
  // }
  // }

  public static class PreserveRange
  {
    String attrName;

    RangeType rangeType;

    ParsedRef ref;
    
    String series;//only used for chart/split type
    
//    String parentId;//only used for chart/split type
    
    JSONObject data;

    public PreserveRange(String name, RangeType type, ParsedRef r)
    {
      attrName = name;
      rangeType = type;
      ref = r;
      data = new JSONObject();
    }
    
    public void setChartSeries(String s){
      series = s;
    }
    
//    public void setParentId(String id){
//      parentId = id;
//    }
    
    public OrderedJSONObject toJSON(ConversionUtil.Document doc)
    {
      if(ref == null)//might be row index > 65536
        return null;
      ConversionUtil.Range range = new ConversionUtil.Range();
      ConversionUtil.setCellRangeByToken(range, ref, doc, null);
      if (ConversionUtil.hasValue(range.sheetId))
      {
        OrderedJSONObject rangeJSON = new OrderedJSONObject();
        rangeJSON.put(ConversionConstant.SHEETID, range.sheetId);
        rangeJSON.put(ConversionConstant.RANGE_ATTRIBUTE, attrName);
        rangeJSON.put(ConversionConstant.RANGE_USAGE, rangeType.toString());
        
        if (ConversionUtil.hasValue(range.startRowId))
          rangeJSON.put(ConversionConstant.RANGE_STARTROWID, range.startRowId);
        if (ConversionUtil.hasValue(range.startColId))
          rangeJSON.put(ConversionConstant.RANGE_STARTCOLID, range.startColId);
        if (ConversionUtil.hasValue(range.endRowId))
          rangeJSON.put(ConversionConstant.RANGE_ENDROWID, range.endRowId);
        if (ConversionUtil.hasValue(range.endColId))
          rangeJSON.put(ConversionConstant.RANGE_ENDCOLID, range.endColId);
        if (IDMFormulaLexer.InternalFormulaType.equals(IDMFormulaLexer.LexFormulaType.FORMAT_ODF))
        {
          rangeJSON.put(ConversionConstant.RANGE_ADDRESS, ref.toString());
        }
        else
        {
          rangeJSON.put(ConversionConstant.RANGE_ADDRESS, IDMFormulaLexer.transODFFormulaToOOXML(ref.toString()));
        }
        if(ConversionUtil.hasValue(series))
          rangeJSON.put(ConversionConstant.CHART_SERIES, series);
        if(!data.isEmpty())
          rangeJSON.put(ConversionConstant.DATAFILED, data);
                
  //      if(ConversionUtil.hasValue(parentId))
  //        rangeJSON.put(ConversionConstant.RANGE_PARENT_ID, parentId);
        return rangeJSON;
      }//else if range has not sheet id, will not be exported
      //such as chart type range has address with 'local-table' as sheet name
      //which chart use the private data, rather than the data in the document
        return null;
    }
  }

  // export to preserve.js
  public JSONObject toJSON(Document doc)
  {
    LOG.entering(CLAZZ, "toJSON");
    JSONObject preserve = new JSONObject();
    Iterator<String> iter = rangeList.keySet().iterator();
    while(iter.hasNext()){
      String id = iter.next();
      ArrayList<PreserveRange> list = rangeList.get(id);
      int length = list.size();
      JSONObject ranges = new JSONObject();
      for(int i=0; i<length; i++){
        PreserveRange range = list.get(i);
        JSONObject rangeJSON = range.toJSON(doc);
        if(rangeJSON == null)
          continue;
        String rangeId = id + "-" + i;
        ranges.put(rangeId, rangeJSON);
        doc.preserveRangeList.put(rangeId, rangeJSON);//update content.js
      }
      if(!ranges.isEmpty())
        preserve.put(id, ranges);
    }
    JSONObject retJSON = new JSONObject();
    retJSON.put(ConversionConstant.PRESERVE_RANGE, preserve);
    LOG.exiting(CLAZZ, "toJSON");
    return retJSON;
  }

  /**
   * According to the current parsing odf element/attribute, check if this info should be preserved if yes, record the corresponding range
   * should be called when preserve odf attribute/value, or "parent" attr name in config file
   * 
   * @param context
   *          current conversion context
   * @param element
   *          parsing OdfElement
   * @param attrName
   *          parsing attribute
   * @param mTarget
   *          the self/parent model corresponding to the OdfElement
   */
  public void addRangeByTarget(ConversionContext context, GeneralContext convertor)
  {
    String eleName = convertor.getNodeName();
    HashMap<String, RangeType> attrs = configMap.get(eleName);
    if (attrs != null)
    {
      ParsedRef targetRef = null;
      Object target = convertor.getTarget();
      if (target != null && target instanceof ConversionUtil.JSONModel)
      {
        ConversionUtil.JSONModel model = (ConversionUtil.JSONModel) target;
        targetRef = getTargetRef(context, model);
      }
      Iterator<String> attrIter = attrs.keySet().iterator();
      while (attrIter.hasNext())
      {
        String attrName = attrIter.next();
        RangeType type = attrs.get(attrName);

        if (PARENT_KEY.equalsIgnoreCase(attrName))
        {
        //for anchor obj, if the parent is not table cell, do not preserve
          GeneralContext parentConv = convertor.getParentConvertor();
          GeneralContext ancestorConv = parentConv.getParentConvertor();
          String elementId = null;
          
          String parentQName = null;
          if(parentConv != null)
            parentQName = parentConv.getNodeName();
          
          if(ODSConvertUtil.isDrawFramePreserveChild(eleName))
          {
            if(!(ODSConvertUtil.isTableCellElement(ancestorConv.getNodeName())) 
                || configMap.containsKey(parentQName))//if parent element still need preserve, do not need create preserve range for this element,
                                                      //otherwise it will create two preserved ranges both for child and parent unsupport element
                                                      //such as <draw:control><svg:title>xxx</svg:title></draw:control>
            {
              return;
            }
            elementId = getOrCreatePreserveElementId(parentConv);
          }
          else
          {
            if( type == RangeType.ANCHOR && (!(ODSConvertUtil.isTableCellElement(parentQName))))
              return;
            elementId = getOrCreatePreserveElementId(convertor);
          }
          // element is the unsupport element, and target is the parent model
          // then address is the target object address
          // put it in PrserveRangeList
          if (targetRef == null){
            LOG.log(Level.WARNING, "target should not be null when addRangeTarget for <" + eleName + ">");
            return;
          }
          if(elementId == null){
            LOG.log(Level.WARNING, "target has already contain a id which is not the preserve id for <" + eleName + ">");
            return;
          }
          PreserveRange range = new PreserveRange(attrName, type, targetRef);
          addRange(elementId, range);
        }
        else if(!CHILD_KEY.equalsIgnoreCase(attrName))
        {
          String attrValue = convertor.getAttrValue(attrName);
          switch (type)
            {
              case INHERIT :
              case COPY :
              {
                // for inherit range type,
                // that is the attribute name/value pair put in PreserveStyleList
                // attribute value as the key
                if (ConversionUtil.hasValue(attrValue))
                {
                  if (targetRef == null)
                    LOG.log(Level.WARNING, "target should not be null when addRangeTarget for <" + eleName + ">");
                  PreserveRange range = new PreserveRange(attrName, type, targetRef);
                  addRange(attrValue, range);
                }
                break;
              }
              case FORMULA :
              {
                // parse formula
                
                String formula = attrValue;
                formula = "=" + formula;
                formula = ODSConvertUtil.convertFormula(formula);
                Document document = (Document) context.get("Target");
                ArrayList<ConversionUtil.Range> nameList = (ArrayList<ConversionUtil.Range>)document.nameList;
                ArrayList<FormulaToken> tokenList = ConversionUtil.getTokenFromFormula(formula, nameList);
                for(int i=0; i<tokenList.size();i++){
                  FormulaToken token = tokenList.get(i);
                  String elementId = getOrCreatePreserveElementId(convertor);
                  PreserveRange range = new PreserveRange(attrName, type, token.getRef());
                  if(token != null && token.getIndex() > -1 && token.getText() != null){
                    range.data.put("s", token.getIndex());
                    range.data.put("e", token.getIndex() + token.getText().length());
                  }
                  addRange(elementId, range);
                }                
                break;
              }
              case SPLIT:
              {
                if (ConversionUtil.hasValue(attrValue))
                {
                  ArrayList<String> addresses = ODSConvertUtil.getRanges(attrValue);
                  int length = addresses.size();
                  for(int i=0; i<length; i++){
                    String address = addresses.get(i);
                    ParsedRef ref = convertor.generatePreserveRef(address, attrName);
                    String elementId = getOrCreatePreserveElementId(convertor);
                    PreserveRange range = new PreserveRange(attrName, type, ref);
                    addRange(elementId, range);
                    String series = (String)context.get("ChartSeries");
                    if(series != null && series.equals(ConversionConstant.ROW_SERIES)){
                      range.setChartSeries(series);
                    }
//                    String parentId = (String)context.get("ParentId");
//                    if(ConversionUtil.hasValue(parentId))
//                      range.setParentId(parentId);
                  }
                }
                break;
              }
              default:
              {
                if (ConversionUtil.hasValue(attrValue))
                {
                  // others will get the referred range address by attribute value
                  // put it in PrserveRangeList
                  String address = attrValue;
                  //if the attrValue is not the address, it might be got from the other info by specific converter
                  ParsedRef ref = convertor.generatePreserveRef(address, attrName);
                  String elementId = getOrCreatePreserveElementId(convertor);
                  PreserveRange range = new PreserveRange(attrName, type, ref);
                  addRange(elementId, range);
                  if(type == RangeType.CHART){
                    String series = (String)context.get("ChartSeries");
                    if(series != null && series.equals(ConversionConstant.ROW_SERIES)){
                      range.setChartSeries(series);
                    }
//                    String parentId = (String)context.get("ParentId");
//                    if(ConversionUtil.hasValue(parentId))
//                      range.setParentId(parentId);
                  }
                }else
                  LOG.log(Level.WARNING, " Range type " + type.toString() + "with attribute name: " + attrName + " should not have empty value" );
                break;
              }
            }
        }
      }
    }
  }
  public static ParsedRef getTargetRef(ConversionContext context, JSONModel model)
  {
    Sheet sheet = (Sheet) context.get("Sheet");
    //parse table done
    if(sheet == null)
      return null;
    ConversionUtil.JSONType modelType = model.getType();
    ContextInfo info = (ContextInfo) context.get("TableInfo");
    String sheetName = sheet.sheetName;
    ReferenceParser.ParsedRefType type = null;
    String sCol = null;
    String sRow = null;
    String eCol = null;
    String eRow = null;
    switch (modelType)
      {
        case SHEET :{
          type = ReferenceParser.ParsedRefType.SHEET;
          break;
        }
        case COLUMN :{
          type = ReferenceParser.ParsedRefType.COLUMN;
          sCol = ReferenceParser.translateCol(info.columnIndex + 1);
//          ConversionUtil.Column col = (ConversionUtil.Column)model;
//          if(col.repeatedNum > 0){
//            eCol = ReferenceParser.translateCol(info.columnIndex + 1 + col.repeatedNum);
//            type = ConversionConstant.COLRANGE_REFERENCE;
//          }
          break;
        }
        case ROW :{
          type = ReferenceParser.ParsedRefType.ROW;
          sRow = ReferenceParser.translateRow(info.rowIndex + 1);
//          ConversionUtil.Row row = (ConversionUtil.Row)model;
//          if(row.repeatedNum > 0){
//            eRow = ReferenceParser.translateRow(info.rowIndex + 1 + row.repeatedNum);
//            type = ConversionConstant.ROWRANGE_REFERENCE;
//          }
          break;
        }
        case CELL :{
          type = ReferenceParser.ParsedRefType.CELL;
          sCol = ReferenceParser.translateCol(info.cellColumnIndex + 1);
          sRow = ReferenceParser.translateRow(info.rowIndex + 1);
//          ConversionUtil.Cell cell = (ConversionUtil.Cell)model;
//          if(cell.repeatedNum > 0){
//            eCol = ReferenceParser.translateCol(info.columnIndex + 1 + cell.repeatedNum);
//            type = ConversionConstant.RANGE_REFERENCE;
//          }
          break;
        }
      }
    ParsedRef ref = new ParsedRef(sheetName, sRow, sCol, null, null, null, type, 0);
    return ref;
  }

  /**
   * should be called when preserve "child" attribute name in config file
   * 
   * @param element
   *          parsing OdfElement
   * @param rangeAddress
   *          the child address
   */
  public void addChildRange(ConversionContext context, GeneralContext convertor, ParsedRef ref)
  {
    String eleName = convertor.getNodeName();
    HashMap<String, RangeType> attrs = configMap.get(eleName);
    if (attrs != null)
    {
      Iterator<String> attrIter = attrs.keySet().iterator();
      while (attrIter.hasNext())
      {
        String attrName = attrIter.next();
        if (CHILD_KEY.equalsIgnoreCase(attrName))
        {
          RangeType type = attrs.get(attrName);
          String elementId = getOrCreatePreserveElementId(convertor);
          if(elementId == null)
            break;
          ArrayList<PreserveRange> list = rangeList.get(elementId);
          if (list == null)
          {
            list = new ArrayList<PreserveRange>();
            rangeList.put(elementId, list);
          }
          // find the existing child range of this element
          int size = list.size();
          PreserveRange range = null;
          for (int i = 0; i < size; i++)
          {
            PreserveRange r = list.get(i);
            if (CHILD_KEY.equalsIgnoreCase(r.attrName))
            {
              // if exist, merge the range address
              r.ref = mergeRangeAddress(r.ref, ref);
              range = r;
              break;
            }
          }
          // if does not exist, add it directly
          if (range == null)
          {
            range = new PreserveRange(CHILD_KEY, type, ref);
            addRange(elementId, range);
          }
        }
      }
    }
  }

  private ParsedRef mergeRangeAddress(ParsedRef r1, ParsedRef r2)
  {
    try
    {
      ReferenceParser.ParsedRefType rangeType = r1.getType();
      String sheetName = r1.getSheetName();
      if (sheetName.equals(r2.getSheetName()))
      {
        boolean bRow = (ReferenceParser.ParsedRefType.ROW == rangeType);
        boolean bCol = (ReferenceParser.ParsedRefType.COLUMN == rangeType);
//        if (bRow)
//          rangeType = ConversionConstant.ROWRANGE_REFERENCE;
//        else if (bCol)
//          rangeType = ConversionConstant.COLRANGE_REFERENCE;
//        else
//          rangeType = ConversionConstant.RANGE_REFERENCE;
        String startCol = r1.getStartCol();
        String endCol = r1.getEndCol();
        if(!ConversionUtil.hasValue(endCol))
          endCol = startCol;
        String startRow = r1.getStartRow();
        String endRow = r1.getEndRow();
        if(!ConversionUtil.hasValue(endRow))
          endRow = startRow;
        String startCol2 = r2.getStartCol();
        String endCol2 = r2.getEndCol();
        if(!ConversionUtil.hasValue(endCol2))
          endCol2 = startCol2;
        String startRow2 = r2.getStartRow();
        String endRow2 = r2.getEndRow();
        if(!ConversionUtil.hasValue(endRow2))
          endRow2 = startRow2;
        if (!bRow)
        {
          // get start/end column
          int sc = ReferenceParser.translateCol(startCol);
          int ec = ReferenceParser.translateCol(endCol);
          int sc2 = ReferenceParser.translateCol(startCol2);
          int ec2 = ReferenceParser.translateCol(endCol2);
          if (sc > sc2)
            startCol = startCol2;
          if (ec2 > ec)
            endCol = endCol2;
        }
        else if (!bCol)
        {
          // get start/end row
          int sr = ReferenceParser.translateRow(startRow);
          int er = ReferenceParser.translateRow(endRow);
          int sr2 = ReferenceParser.translateRow(startRow2);
          int er2 = ReferenceParser.translateRow(endRow2);
          if (sr > sr2)
            startRow = startRow2;
          if (er2 > er)
            endRow = endRow2;
        }
        
        ParsedRef newRef = new ParsedRef(sheetName, startRow, startCol, r1.getEndSheetName(), endRow, endCol, rangeType, 0);
        return newRef;
      }
      else
      {
        LOG.log(Level.WARNING, "mergeRangeAddress with " + r1.toString() + " and " + r2.toString());
      }
    }
    catch (Exception e)
    {
    }
    return r1;
  }

  private String getOrCreatePreserveElementId(GeneralContext convertor)
  {
    String elementId = convertor.getOdfNodeIndex();
    if (!ConversionUtil.hasValue(elementId))
    {
      elementId = ConversionConstant.PRESERVEID + maxIndex++;
      convertor.addIdOnOdfElement(elementId);
    }else
    {
      if(!elementId.startsWith(ConversionConstant.PRESERVEID))
        return null;//for example, preserve <svg:title> for chart draw frame which already has chart id 
    }
    return elementId;
  }

  // the range id should start with elementId-
  public String createPreserveRangeId(String elementId)
  {
    Integer rangeIndex = rangeIdMap.get(elementId);
    if (rangeIndex == null)
      rangeIndex = ConversionConstant.ID_INITAL_VALUE;
    String rangeId = elementId + rangeIndex++;
    rangeIdMap.put(elementId, rangeIndex);// update the
    return rangeId;
  }

  private void addRange(String elementId, PreserveRange range)
  {
    if(elementId == null)
      return;
    ArrayList<PreserveRange> list = rangeList.get(elementId);
    if (list == null)
    {
      list = new ArrayList<PreserveRange>();
      rangeList.put(elementId, list);
    }
    list.add(range);
  }
  //TODO: use sax rather than chart
  //get the chart ole object
  public void preserveChart(OdfDocument doc, OdfdraftPackage odfdraft, ConversionContext context){
    List<OdfDocument> chartDocs = doc.getEmbeddedDocuments(OdfMediaType.CHART);
    for(int i=0; i<chartDocs.size(); i++){
      context.put("ChartSeries", "column");
      try{
        OdfDocument chartDoc = chartDocs.get(i);
        String chartPath = chartDoc.getDocumentPackagePath();
//        context.put("ParentId", chartPath);
        ODSConvertUtil.parseXML(chartDoc, odfdraft, chartPath + OdfXMLFile.CONTENT.getFileName(), context);
      }catch (Exception e) {
        LOG.log(Level.WARNING, "load chart failed", e);
      }
    }
  }

}
