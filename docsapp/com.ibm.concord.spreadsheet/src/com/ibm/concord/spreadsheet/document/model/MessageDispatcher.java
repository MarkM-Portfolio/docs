package com.ibm.concord.spreadsheet.document.model;

import java.io.IOException;
import java.io.StringWriter;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonGenerator;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.DocumentFeature;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.partialload.serialize.IObjectFilter;
import com.ibm.concord.spreadsheet.partialload.serialize.impl.SerializationUtils;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class MessageDispatcher
{
  private static final Logger LOG = Logger.getLogger(MessageDispatcher.class.getName());
  enum EVENT_ACTION
  {
    INSERT("insert"),
    DELETE("delete"),
    SET("set"),
    MOVE("move"),
    CLEAR("clear"),
    SORT("sort"),
    FILTER("filter"),
    MERGE("merge"),
    SPLIT("split"),
    FREEZE("freeze");
    
    private String value;
    EVENT_ACTION(String value)
    {
      this.value = value.toUpperCase();
    }
    
    public static EVENT_ACTION fromString(String value)
    {
      return EVENT_ACTION.valueOf(value.trim().toUpperCase());
    }
  }
  
  enum EVENT_SCOPE
  {
    CELL("cell"),
    ROW("row"),
    COLUMN("column"),
    UNNAMERANGE("unnamerange"),
    NAMERANGE("namerange"),
    RANGE("range"),
    SHEET("sheet"),
    FRAGMENT("fragment"),
    CHART("chart");
    
    private String value;
    
    EVENT_SCOPE(String value)
    {
      this.value = value.toUpperCase();
    }
    
    public static EVENT_SCOPE fromString(String value)
    {
      return EVENT_SCOPE.valueOf(value.trim().toUpperCase());
    }
  }
  
  public static void main(String[] args)
  {
    if(EVENT_ACTION.INSERT == EVENT_ACTION.fromString("iNsert"))
      System.out.print("equal");
    else
      System.out.print("not equal");
  }
  
  private Document doc;
  
  public void setDocument(Document doc)
  {
    this.doc = doc;
  }
  
  private void serializeSection(JsonGenerator jsonGenerator, JSONArray jsonArray) throws JsonGenerationException, IOException
  {
    for (Iterator iterator = jsonArray.iterator(); iterator.hasNext();)
    {
      Object object = (Object) iterator.next();
      if (object instanceof JSONObject)
      {
        JSONObject o = (JSONObject) object;
        if (o != null)
        {
          jsonGenerator.writeStartObject();
          serializeSection(jsonGenerator, o);
          jsonGenerator.writeEndObject();
        }
      }
      else if (object instanceof JSONArray)
      {
        JSONArray o = (JSONArray) object;
        if (o != null)
        {
          jsonGenerator.writeStartArray();
          serializeSection(jsonGenerator, o);
          jsonGenerator.writeEndArray();
        }
      }
      else
      {
        serializeParts(jsonGenerator, object);
      }
    }
  }
  /**
   * serialize jsonObject using current jsonGenerator. It will start by writing FIELD_NAME. Write a START_OBJECT before calling this method.
   * 
   * @param jsonGenerator
   * @param jsonObject
   * @throws IOException
   * @throws JsonGenerationException
   */
  private void serializeSection(JsonGenerator jsonGenerator, JSONObject jsonObject) throws JsonGenerationException, IOException 
  {
    Set<Map.Entry> entries = jsonObject.entrySet();
    for (Iterator iterator = entries.iterator(); iterator.hasNext();)
    {
      Entry entry = (Entry) iterator.next();
      Object o = entry.getValue();
      String key = (String) entry.getKey();
      if ( ("data".equals(key) ||
            "v".equals(key) || 
            "cv".equals(key) || 
            "keys".equals(key) || 
            "text".equals(key) || 
            "content".equals(key) || 
            "sheetname".equals(key) ) 
           && o != null )
      {
        String v = o.getClass().getSimpleName() + "#" + (o.hashCode() & 0xffff);
        o = v;
      } 
      else if (("refValue".equals(key) || 
                "addr".equals(key) )
                && o != null )
      {
        String v = String.valueOf(o);
        int pos = v.indexOf('!');
        if (pos > 0)
          o = "#" + (v.substring(0,pos).hashCode() & 0xFFFF) + "#" + v.substring(pos);
      }
      jsonGenerator.writeFieldName(key);
      if (o instanceof JSONObject)
      {
        JSONObject obj = (JSONObject) o;
        if (obj != null)
        {
          jsonGenerator.writeStartObject();
          serializeSection(jsonGenerator, obj);
          jsonGenerator.writeEndObject();
        }
      }
      else if (o instanceof JSONArray)
      {
        JSONArray obj = (JSONArray) o;
        if (obj != null)
        {
          jsonGenerator.writeStartArray();
          serializeSection(jsonGenerator, obj);
          jsonGenerator.writeEndArray();
        }
      }
      else
      {
        serializeParts(jsonGenerator, o);
      }
    }
  }
  /*
   * Generate a part of JSON value.
   */
  private static void serializeParts(JsonGenerator jsonGenerator, Object o) throws JsonGenerationException, IOException
  {
    if (o == null)
    {
      jsonGenerator.writeNull();
    }
    else if (o instanceof String)
    {
      jsonGenerator.writeString((String) o);
    }
    else if (o instanceof Boolean)
    {
      jsonGenerator.writeBoolean((Boolean) o);
    }
    else if (o instanceof Integer)
    {
      jsonGenerator.writeNumber((Integer) o);
    }
    else if (o instanceof Long)
    {
      jsonGenerator.writeNumber((Long) o);
    }
    else if (o instanceof Float)
    {
      jsonGenerator.writeNumber((Float) o);
    }
    else if (o instanceof Double)
    {
      jsonGenerator.writeNumber((Double) o);
    }
    else
    {
      jsonGenerator.writeString(o.toString());
    }
  }
  
  public String getMessageForLog(JSONObject msg1, int len) 
  {
    String ret = "";
    try {
      String docid = "";
      if (doc != null && doc.getDraftDescriptor() != null)
      {
        docid = doc.getDraftDescriptor().getDocId();
      }
      StringWriter out = new StringWriter();
      JsonFactory f = new JsonFactory();
      JsonGenerator g = f.createJsonGenerator(out);
      g.writeStartObject();
      serializeSection(g, msg1);
      g.writeEndObject();
      g.flush();
      String msgout = out.toString();
      if (msgout.length() > len)
        msgout = msgout.substring(0, len) + " ...#"+msgout.length();
      ret = "[docid:" + docid + "] "+ msgout;
    } 
    catch ( Exception e ) 
    {
      // e.printStackTrace();
      ret = "Can not log Applymessage log. sth wrong in json message";
    }
    return ret;
  }
  public void dispatchMessage(JSONObject msg) 
  {
	try{
	  //	LOG.log(Level.INFO, " Apply message : " +  msg.toString());
	  // LOG.log(Level.INFO, " Apply message : " + getMessageForLog(msg, 1024) );
		JSONArray events = (JSONArray) msg.get(ConversionConstant.UPDATES);
	    if (events != null && !events.isEmpty())
	    {
	      doc.setCalculated(false);
	      for (int i = 0; i < events.size(); ++i)
	      {
	        JSONObject event = (JSONObject) events.get(i);
	        dispatchEvent(event);
	      }
	    }
	}catch(RuntimeException e)
	{
	  LOG.log(Level.WARNING, "==Apply message error: " +  getMessageForLog(msg, 1024));
	  throw e;
	}
  }
  /*
   * according to the event action and type, dispatch it to the corresponding method
   */
  public void dispatchEvent(JSONObject event)
  {
    String action = (String) event.get(ConversionConstant.ACTION);
    JSONObject data = (JSONObject) event.get(ConversionConstant.DATA);
    JSONObject reference = (JSONObject) event.get(ConversionConstant.REFERENCE);
    String refValue = (String) reference.get(ConversionConstant.REF_VALUE);
    String refType = (String) reference.get(ConversionConstant.REF_TYPE);

    Object obCut = data.get(ConversionConstant.FOR_CUT);
    Boolean isCut = (obCut != null) ? ((Boolean)obCut).booleanValue() : false;
    JSONObject newData = null;
    if(this.doc.getVersion().hasFeature(DocumentFeature.MORE_ABBR_NAME))
    	newData = data;
    else if(null != data)
    	newData = ConversionUtil.newWithShortKey(data);
    //TODO: do not use anything in the package com.ibm.concord.spreadsheet.model.references
    ParsedRef parsedRef = getEventRef(refValue, refType);
    EVENT_ACTION eAction = EVENT_ACTION.fromString(action);
    EVENT_SCOPE eScope = EVENT_SCOPE.fromString(refType);
    switch(eAction)
    {
      case INSERT:
        switch(eScope)
        {
          case ROW:
            this.insertRowsHelper(parsedRef, newData);
            break;
          case COLUMN:
            this.insertColsHelper(parsedRef, newData);
            break;
          case UNNAMERANGE:
          case RANGE:
            this.doc.insertRange(parsedRef, newData);
            break;
         case SHEET:
        	 this.insertSheetHelper(parsedRef, newData);
           break;
        }
        
        break;
      case DELETE:
        switch(eScope)
        {
          case ROW:
            this.deleteRowsHelper(parsedRef);
            break;
          case COLUMN:
            this.deleteColsHelper(parsedRef);
            break;
          case UNNAMERANGE:
          case RANGE:
            this.doc.deleteRange(parsedRef, newData);
            break;
         case SHEET:
        	 this.deleteSheetHelper(parsedRef, newData);
           break;
        }
        break;
      case SET:
        this.doc.checkDefaultStyle(parsedRef, newData);
        switch(eScope)
        {
          case CELL:
          	if(isCut)
          	{
          	  cutRangeHelper(parsedRef, newData);
          	}
          	else
          		setCellHelper(parsedRef, newData);
            break;
          case ROW:
        	if(parsedRef.isValid())
        		setRowsHelper(parsedRef, newData);
            break;
          case COLUMN:
            setColumnsHelper(parsedRef, newData);
            break;
          case UNNAMERANGE:
          	if(isCut)
          	{
          		cutRangeHelper(parsedRef, newData);
          	}
          	else{
          		//either be set range data with content/style/width
          		//or set range(such as image) with specific attribute
          		this.setRangeHelper(parsedRef, newData);
          	}
            break;
          case RANGE:
            //set name range address
            this.doc.updateRange(parsedRef, newData);
            break;
         case SHEET:
           this.processSheetHelper(parsedRef, newData);
           break;
         case CHART:
        	 this.setChartHelper(newData);
             break;           
        }
        break;
      case MOVE:
        switch(eScope)
        {
          case SHEET:
        	this.moveSheetHelper(parsedRef, newData);
            break;
        }
        break;
      case CLEAR:
        switch(eScope)
        {
          case ROW:
          	if(isCut)
          	{
	      	    cutRangeHelper(parsedRef, newData);
          		break;
          	}
          case UNNAMERANGE:
          case COLUMN:
            this.doc.clearRange(parsedRef);
            break;
        }
        break;
      case SORT:
        if(eScope == EVENT_SCOPE.UNNAMERANGE)
        {
          this.doc.sortRange(parsedRef, newData);
        }
        break;
      case FILTER:
        if(eScope == EVENT_SCOPE.UNNAMERANGE)
        {
          this.doc.filterRange(parsedRef, newData);
        }
        break;
      case MERGE:
        if(eScope == EVENT_SCOPE.UNNAMERANGE)
        {
          this.mergeHelper(parsedRef);
        }
        break;
      case SPLIT:
        if(eScope == EVENT_SCOPE.UNNAMERANGE)
        {
          this.splitHelper(parsedRef);
        }
        break;
      case FREEZE:
    	this.freezeWindowHelper(parsedRef, eScope, newData);
    	break;
    }
  }
  
  private void setChartHelper(JSONObject data)
  {
	  String chartId =(String) data.get("chartId"); 
	  doc.setChart(chartId, data);
  }
  
  private void setCellHelper(ParsedRef ref, JSONObject data)
  {
    doc.setCell(ref, data);
  }

  private void setRangeHelper(ParsedRef parsedRef, JSONObject data)
  {
    if(data.containsKey(ConversionConstant.ROWS) || data.containsKey(ConversionConstant.STYLE))
    {
      doc.setRange(parsedRef, data);
    }
    else
      this.doc.updateRange(parsedRef, data);
  }
  
  private void setRowsHelper(ParsedRef ref, JSONObject data)
  {
    doc.setRows(ref, data);
  }
  
  private void setColumnsHelper(ParsedRef ref, JSONObject data)
  {
    doc.setColumns(ref, data); 
  }

  //return the parsedRef with the integrate start/end row/col
  //for example, if parsedRef is cell, then return parsedRef which 
  //has the same start row with end row, same col with end col
  private ParsedRef getEventRef(String refValue, String refType)
  {
    ReferenceParser.ParsedRef parsedRef =  null;
    String sheetName = null;
    if(refType.equals(ConversionConstant.REF_TYPE_SHEET))
    {
      //TODO: what if the sheet name contain "|"
      sheetName = refValue;
      if(refValue.contains("|"))
      {
          int index = refValue.indexOf("|");
          sheetName = refValue.substring(0,index);
      }
      parsedRef = new ReferenceParser.ParsedRef(sheetName, null, null, null, null, null, ParsedRefType.SHEET, 0);
    }
    else
    {
      parsedRef = ReferenceParser.parse(refValue);
      sheetName = parsedRef.sheetName;
      if(refType.equals(ConversionConstant.REF_TYPE_CELL))
      {
        parsedRef.endRow = parsedRef.startRow;
        parsedRef.endCol = parsedRef.startCol;
      }
      else if(refType.equals(ConversionConstant.REF_TYPE_ROW))
      {
        if(parsedRef.endRow == null)
          parsedRef.endRow = parsedRef.startRow;
      }
      else if(refType.equals(ConversionConstant.REF_TYPE_COLUMN))
      {
        if(parsedRef.endCol == null)
          parsedRef.endCol = parsedRef.startCol;
      }
      else if(refType.equals(ConversionConstant.RANGE_REFERENCE) 
          || refType.equals(ConversionConstant.REF_TYPE_UNNAMERANGE))
      {
        if(parsedRef.endRow == null)
          parsedRef.endRow = parsedRef.startRow;
        if(parsedRef.endCol == null)
          parsedRef.endCol = parsedRef.startCol;
      }
    }
    return parsedRef;
  }

  private void insertSheetHelper(ParsedRef parsedRef, JSONObject data)
  {
    String sheetName = parsedRef.getSheetName();
    JSONObject sheet = (JSONObject)data.get(ConversionConstant.SHEET_REFERENCE);
    int sheetIndex = Integer.parseInt(sheet.get(ConversionConstant.SHEETINDEX).toString());
    String uuid = (String) sheet.get(ConversionConstant.ACTION_ID);
    this.doc.insertSheet(sheetName, sheetIndex, uuid);
  }
  
  private void deleteSheetHelper(ParsedRef parsedRef, JSONObject data)
  {
	String sheetName = parsedRef.getSheetName();
    JSONObject sheet = (JSONObject)data.get(ConversionConstant.SHEET_REFERENCE);
    String uuid = null;
    if(null != sheet)
      uuid = (String)sheet.get(ConversionConstant.ACTION_ID);
    this.doc.deleteSheet(sheetName, uuid);
  }
  
  private void processSheetHelper(ParsedRef parsedRef, JSONObject data)
  {
	String oldName = parsedRef.getSheetName();	
	JSONObject sheet = (JSONObject)data.get(ConversionConstant.SHEET_REFERENCE);
	if(sheet.containsKey(ConversionConstant.DIRECTION)) {
		String dir = sheet.get(ConversionConstant.DIRECTION).toString();
		this.doc.setDir(oldName, dir);
	} else if (sheet.containsKey("visibility") ){
	  String visibility = sheet.get("visibility").toString();
	  if (visibility.equalsIgnoreCase("visible"))
		  visibility = null;
	  this.doc.setSheetVisibility(oldName, visibility);
	} else if(sheet.containsKey(ConversionConstant.SHEETNAME)) {
	  String newName = sheet.get(ConversionConstant.SHEETNAME).toString();
	  this.doc.renameSheet(oldName, newName);
	} else if (sheet.containsKey(ConversionConstant.OFFGRIDLINES) ){
      boolean off = (Boolean)sheet.get(ConversionConstant.OFFGRIDLINES);
      this.doc.setSheetGridLines(oldName, off);
    }
  }
  
  private void moveSheetHelper(ParsedRef parsedRef, JSONObject data)
  {
	String sheetName = parsedRef.getSheetName();
	int delta = Integer.parseInt(data.get(ConversionConstant.DELTA).toString());
	this.doc.moveSheet(sheetName, delta);
  }
  
  private void insertRowsHelper(ParsedRef parsedRef, JSONObject data)
  {
    String sheetName = parsedRef.getSheetName();
    int sRIndex = parsedRef.getIntStartRow();
    int eRIndex = parsedRef.getIntEndRow();
    this.doc.insertRows(sheetName, sRIndex, eRIndex, data);
  }
  
  private void deleteRowsHelper(ParsedRef parsedRef)
  {
    String sheetName = parsedRef.getSheetName();
    int sRIndex = parsedRef.getIntStartRow();
    int eRIndex = parsedRef.getIntEndRow();
    this.doc.deleteRows(sheetName, sRIndex, eRIndex);
  }
  
  private void insertColsHelper(ParsedRef parsedRef, JSONObject data)
  {
    this.doc.insertColumns(parsedRef, data);
  }
  
  private void deleteColsHelper(ParsedRef parsedRef)
  {
    String sheetName = parsedRef.getSheetName();
    int sCIndex = parsedRef.getIntStartCol();
    int eCIndex = parsedRef.getIntEndCol(); 
    this.doc.deleteColumns(sheetName, sCIndex, eCIndex);
  }
  
  private void mergeHelper(ParsedRef parsedRef)
  {
    String sheetName = parsedRef.getSheetName();
    int sRIndex = parsedRef.getIntStartRow();
    int eRIndex = parsedRef.getIntEndRow();
    int sCIndex = parsedRef.getIntStartCol();
    int eCIndex = parsedRef.getIntEndCol();
    this.doc.mergeCells(sheetName, sRIndex, eRIndex, sCIndex, eCIndex);
  }
  
  private void splitHelper(ParsedRef parsedRef)
  {
    String sheetName = parsedRef.getSheetName();
    int sRIndex = parsedRef.getIntStartRow();
    int eRIndex = parsedRef.getIntEndRow();
    int sCIndex = parsedRef.getIntStartCol();
    int eCIndex = parsedRef.getIntEndCol();
    this.doc.splitCells(sheetName, sRIndex, eRIndex, sCIndex, eCIndex);
  }
  
  private void cutRangeHelper(ParsedRef parsedRef, JSONObject data)
  {
    this.doc.cutRange(parsedRef, data);
  }
  
  private void freezeWindowHelper(ParsedRef parsedRef, EVENT_SCOPE scope, JSONObject data){
	String sheetName = parsedRef.getSheetName();
	int rIndex = -1, cIndex = -1;
	if(scope == EVENT_SCOPE.COLUMN)
		cIndex = parsedRef.getIntStartCol();
	else if(scope == EVENT_SCOPE.ROW)
		rIndex = parsedRef.getIntStartRow();
	else if(scope == EVENT_SCOPE.SHEET){
		if(data.get(ConversionConstant.ROW_REFERENCE) != null)
			rIndex = 0;
		if(data.get(ConversionConstant.COL_REFERENCE) != null)
			cIndex = 0;
	}
	this.doc.freezeSheet(sheetName, rIndex, cIndex);
  }
}