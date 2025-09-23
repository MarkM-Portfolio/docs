package com.ibm.concord.spreadsheet.document.model.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.document.common.chart.ChartDocument;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.DocumentVersion;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.AreaRelation;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeRelation;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.Broadcaster;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.EventSource;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.TYPE;
import com.ibm.concord.spreadsheet.document.model.chart.ScDataProvider;
import com.ibm.concord.spreadsheet.document.model.chart.ScDataSequence;
import com.ibm.concord.spreadsheet.document.model.formula.Area;
import com.ibm.concord.spreadsheet.document.model.formula.AreaManager;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.RecoverReferenceToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.ReferenceToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.TokenType;
import com.ibm.concord.spreadsheet.document.model.formula.SharedFormulaRef4CF;
import com.ibm.concord.spreadsheet.document.model.formula.SharedFormulaRef4DV;
import com.ibm.concord.spreadsheet.document.model.formula.SharedFormulaRef4RulesObj;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.impl.RangeList.RangeMap;
import com.ibm.concord.spreadsheet.document.model.impl.io.ContentRowDeserializer;
import com.ibm.concord.spreadsheet.document.model.impl.io.ModelIOFactory;
import com.ibm.concord.spreadsheet.document.model.impl.preserve.PreserveManager;
import com.ibm.concord.spreadsheet.document.model.impl.preserve.PreserveRangeList;
import com.ibm.concord.spreadsheet.document.model.rulesObject.DataValidation;
import com.ibm.concord.spreadsheet.document.model.rulesObject.RulesObj;
import com.ibm.concord.spreadsheet.document.model.rulesObject.ConditionalFormat;
import com.ibm.concord.spreadsheet.document.model.style.StyleManager;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.IMapEntryListener;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.Position;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.SerializableStringIdConvertor;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Document extends Broadcaster
{
  private static final Logger LOG = Logger.getLogger(Document.class.getName());

  protected IDManager idManager = null;

  protected StyleManager styleManager = null;

  protected PreserveManager preserveManager = null;

  protected RecoverManager recoverManager = null;

  /**
   * RangeList for named range and un-named range, which takes string as ID type
   */
  protected RangeList<String> rangeList = null;
  
  protected ViewSetting viewManager = null;

  protected ReferenceList referenceList = null;

  protected List<Sheet> sheets = null;
  
  //temp code, just store the chart data
  //protected JSONArray charts = null;
  
  protected List<ChartDocument> charts = null;

  protected DocumentVersion version;
  
  private boolean isCSV;

  private boolean isDate1904;

  private boolean calculated;

  private ModelHelper.SerializableStringIdConvertor idConvertor;

  private int defaultColumnWidth = -1;

  private String locale;

  private DraftDescriptor draftDesc;
  
  // to deserialize content row raw data
  private ContentRowDeserializer contentRowDeserializer;
  
  private String draftDir;
  
  private AreaManager areaManager;
  
  private List<NotifyEvent> eventList;
  
  private Map<String, Comments> comments = null;
  
  private Map<String, RulesObj> rulesObjects = null;

  public Document()
  {
    sheets = new ArrayList<Sheet>();
    idManager = new IDManager();
    styleManager = new StyleManager();
    charts = new ArrayList<ChartDocument>();

    idConvertor = new SerializableStringIdConvertor();
    viewManager = new ViewSetting(this);
	eventList = new ArrayList<NotifyEvent>();
	areaManager = getAreaManager();
	
	comments = new HashMap<String, Comments>();
	rulesObjects = new HashMap<String, RulesObj>();
  }

  public void parseRulesObjs()
  {
	  Iterator<String> iter = rulesObjects.keySet().iterator();
	  while(iter.hasNext())
	  {
		  String id = iter.next();
		  RulesObj rulesObj = rulesObjects.get(id);
		  rulesObj.parse();
	  }
  }
  
  public void initMaxRowIndexMap()
  {
    StyleManager styleManager = this.getStyleManager();
    StyleObject defaultStyle = styleManager.getDefaultCellStyle();
    PreserveManager pm = this.getPreserveManager();
    Map<Integer, Integer> maxRowMap = pm.getMaxRowMap();
    // only if the first time open the document, init the max row index
    if (null == maxRowMap)
    {
      int sheetCnt = this.sheets.size();
      for (int i = 0; i < sheetCnt; i++)
      {
        Sheet sheet = this.sheets.get(i);
        int sheetId = sheet.getId();
        List<Row> rows = sheet.getRows();
        int rowCnt = rows.size();
        if (rowCnt > 0)
        {
          Row lastRow = rows.get(rowCnt - 1);
          boolean bLastRow = true;
          if(lastRow.isContainRowStyle())
          {
            StyleObject style = lastRow.getRowStyle();
            if(defaultStyle.equals(style))
              bLastRow = false;
          }  
          int rIndex = bLastRow ? (lastRow.getIndex() + lastRow.getRepeatedNum()) : (lastRow.getIndex() -1) ;
          pm.setMaxRow(sheetId, rIndex);
        }
      }
    }
  }

  /********************************************* sheet ************************************/

  /*
   * add a new sheet into the document
   * 
   * @param sheetName: sheet name
   * 
   * @param index: sheet index 1-based
   * 
   * @param uuid: null means this is a new sheet, otherwise the undo event of delete sheet
   */
  public Sheet insertSheet(String sheetName, int index, String uuid)
  {
	if(this.getSheetByName(sheetName) != null)
		return null;
    int sheetId = IDManager.INVALID;
    Sheet sheet = null;
    if (null != uuid)
    {
      try
      {
        sheet = getRecoverManager().recoverSheet(uuid, sheetName, index);
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "the insert sheet should be in recover document, but error happens", e);
      }
      return sheet;
    }
    // insert a whole new sheet
    
    int sheetCount = this.sheets.size();
    if (index <= 0 || index > sheetCount + 1)
    {
      LOG.log(Level.WARNING, "wrong sheet index!!!");
      return null;
    }
    sheet = new Sheet(this);
    sheet.setSheetName(sheetName);
    sheetId = this.idManager.addSheet(sheet);
    this.sheets.add(index - 1, sheet);
    
    //broadcast
    if(sheetId != IDManager.INVALID)
    {
      RangeInfo refValue = new RangeInfo(sheetId, 1, 1, ConversionConstant.MAX_ROW_NUM, ConversionConstant.MAX_COL_NUM, ParsedRefType.RANGE);
      EventSource source = new EventSource(NotifyEvent.ACTION.INSERT, NotifyEvent.TYPE.SHEET, refValue);
      NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
      insertEvent(e);
    }
    
    broadcastEventList();
    
    return sheet;
  }

  /**
   * delete a sheet instance by sheet name
   * 
   * @param sheetName
   *          sheet name
   */
  public void deleteSheet(String sheetName, String uuid)
  {
    // first backup the sheet info by recoverManager
    if (sheets.size() < 2)
    {
      LOG.log(Level.WARNING, "less than 2 sheets existing, delete sheet refused.");
      return;
    }
    
    try
    {
      getRecoverManager().backupSheet(uuid, sheetName);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "the delete sheet should be add into recover document, but error happens", e);
    }
    // then remove the sheet
    Map<String, Sheet> sheetNameMap = this.idManager.getSheetNameMap();
    Sheet sheet = sheetNameMap.get(sheetName);
    int sheetId = sheet.getId();
    // broadcast predelete event
    RangeInfo refValue = new RangeInfo(sheetId, 1, 1, ConversionConstant.MAX_ROW_NUM, ConversionConstant.MAX_COL_NUM, ParsedRefType.RANGE);
    EventSource source = new EventSource(NotifyEvent.ACTION.PREDELETE, NotifyEvent.TYPE.SHEET, refValue);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    insertEvent(e);
    broadcastEventList();

    this.sheets.remove(sheet);
    this.idManager.deleteSheet(sheet);
    this.getPreserveManager().getValueCellSet().delete(sheetId);
  }

  /*
   * move sheet from original Index to target index
   * 
   * @param sheetName :
   * 
   * @param delta : original sheet index plus delta equal to the target sheet index
   */
  public void moveSheet(String sheetName, int delta)
  {
    if (delta == 0)
      return;
    Sheet sheet = this.idManager.getSheetNameMap().get(sheetName);
    int srcIndex = sheet.getIndex();
    if (srcIndex < 0)
    {
      LOG.log(Level.WARNING, "the sheet does not existed!");
      return;
    }
    int tarIndex = srcIndex + delta;
    if (tarIndex < 1 || tarIndex > this.sheets.size())
    {
      LOG.log(Level.WARNING, "the target sheet index is wrong");
      return;
    }

    RangeInfo refValue = new RangeInfo(sheet.getId(), 1, 1, ConversionConstant.MAX_ROW_NUM, ConversionConstant.MAX_COL_NUM, ParsedRefType.RANGE);
    EventSource source = new EventSource(NotifyEvent.ACTION.PREMOVE, NotifyEvent.TYPE.SHEET, refValue);
    JSONObject data = new JSONObject();
    data.put(ConversionConstant.DELTA,delta);
    source.setData(data);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    insertEvent(e);
    broadcastEventList();
    
    this.sheets.remove(srcIndex - 1);
    this.sheets.add(tarIndex - 1, sheet);
    
  }

  /**
   * rename sheet name
   * 
   * @param sheetName
   *          old sheet name
   * @param newName
   *          new sheet name
   */
  public void renameSheet(String sheetName, String newName)
  {
    Map<String, Sheet> sheetNameMap = this.idManager.getSheetNameMap();
    Sheet sheet = sheetNameMap.get(sheetName);
    if (null != sheet)
    {
      sheet.setSheetName(newName);
      sheetNameMap.remove(sheetName);
      sheetNameMap.put(newName, sheet);
      
      RangeInfo refValue = new RangeInfo(sheet.getId(), 1, 1, ConversionConstant.MAX_ROW_NUM, ConversionConstant.MAX_COL_NUM, ParsedRefType.RANGE);
      EventSource source = new EventSource(NotifyEvent.ACTION.SET, NotifyEvent.TYPE.SHEET, refValue);
      NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
      insertEvent(e);
      broadcastEventList();
    }
  }
  
  public void setSheetVisibility(String sheetName, String visibility)
  {
    Map<String, Sheet> sheetNameMap = this.idManager.getSheetNameMap();
    Sheet sheet = sheetNameMap.get(sheetName);
    if (null != sheet)
    {
      sheet.setVisibility(visibility);
    }
  }
  
  public void setSheetGridLines(String sheetName, boolean off)
  {
    Map<String, Sheet> sheetNameMap = this.idManager.getSheetNameMap();
    Sheet sheet = sheetNameMap.get(sheetName);
    if (null != sheet)
    {
      sheet.setOffGridLines(off);
    }
  }
  
  /**
   * Set sheet freeze info.
   * @param sheetName
   * 
   * @param rowIndex
   * 
   * @param colIndex
   */
  public void freezeSheet(String sheetName, int rowIndex, int colIndex){
	  Sheet sheet = this.idManager.getSheetNameMap().get(sheetName);
	  if(rowIndex >= 0)
		  sheet.setFreezeRowIndex(rowIndex);
	  if(colIndex >= 0)
		  sheet.setFreezeColIndex(colIndex);
  }

  /********************************************* row ************************************/
  /**
   * insert rows according json data which has row information,like row height,style,cell value and so on. this operation will insert new
   * row instances
   * 
   * @param sheetName
   *          sheet name
   * @param sRIndex
   *          start row index 1-based
   * @param eRIndex
   *          end row index 1-based
   * @param data
   * @return
   */
  public void insertRows(String sheetName, int sRIndex, int eRIndex, JSONObject data)
  {
    Sheet sheet = this.getSheetByName(sheetName);
    int sheetId = sheet.getId();
    // broadcast preinsert event
    RangeInfo refValue = new RangeInfo(sheetId, sRIndex, 1, eRIndex, ConversionConstant.MAX_COL_NUM, ParsedRefType.ROW);
    EventSource source = new EventSource(NotifyEvent.ACTION.PREINSERT, NotifyEvent.TYPE.ROW, refValue);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    insertEvent(e);
    broadcastEventList();

    sheet.insertRows(sRIndex, eRIndex, data);
    
    //broadcast insert event
    source.setAction(NotifyEvent.ACTION.INSERT);
    insertEvent(e);
    broadcastEventList();
    
    // handle undoRanges
    if (null != data.get("undoRanges"))
    {
      JSONObject rsJson = (JSONObject) data.get("undoRanges");
      restoreRangeByDelta(rsJson, sRIndex, eRIndex, NotifyEvent.TYPE.ROW);
    }
    if(null != data.get("undoCharts"))
    {
      JSONObject rsJson = (JSONObject) data.get("undoCharts");
      restoreChartByDelta(rsJson, sRIndex, eRIndex, NotifyEvent.TYPE.ROW);
    }
    JSONObject rsJson = (JSONObject) data.get("undoFreeze");
    if(null != rsJson)
    {
      Number delta = (Number) rsJson.get(ConversionConstant.DELTA);
      if(delta != null)
        restoreFreeze(sRIndex, delta.intValue(), true, sheetName);
    }
  }
  

  /**
   * For undo delete row(s)/column(s), need to restore the freeze window settings according to the delta info in the event.
   * @param sIndex
   * @param delta
   * @param bRow, insertRow or insertColumn.
   * @param sheetName
   */
  private void restoreFreeze(int sIndex, int delta, boolean bRow, String sheetName) 
  {
	int newIndex = sIndex + delta;
	if(bRow)
	{
	  freezeSheet(sheetName, newIndex, -1);	
	}else
	{
	  freezeSheet(sheetName, -1, newIndex);	
	}
  }

  /**
   * For undo delete row/column, some ranges need to be restored according to the delta info which json format is like this
   * "undoRanges":{"name":{"startIndex":1,"delta":3,"usage":"NAMES"}
   * 
   * @param data
   *          the undoRanges json object
   * @param sIndex
   *          inserted start index
   * @param eIndex
   *          inserted end index
   * @param type
   *          inserted type, should be NotifyEvent.TYPE.ROW or COLUMN
   */
  private void restoreRangeByDelta(JSONObject data, int sIndex, int eIndex, TYPE type)
  {
    Iterator<String> iter = data.keySet().iterator();

    while (iter.hasNext())
    {
      String rangeId = iter.next();
      JSONObject delta = (JSONObject) data.get(rangeId);
      String strUsage = (String) delta.get(ConversionConstant.RANGE_USAGE);
      RangeUsage usage = RangeUsage.NAMES;
      if (null != strUsage)
        usage = RangeUsage.enumValueOf(strUsage);
      Range range;
      RangeList rangeList = getRangeList();
      if (usage == RangeUsage.NAMES)
        range = rangeList.getRangeByUsage(rangeId.toLowerCase(), usage);
      else {
        range = rangeList.getRangeByUsage(rangeId, usage);
        if(range == null) {
        	rangeList = getPreserveManager().getRangeList();
        	range = rangeList.getRangeByUsage(rangeId, usage);
        }
      }
      if (range != null)
      {
    	ParsedRef parsedRef = getRestoredRange(range, delta, sIndex, eIndex, type); 
        if(parsedRef != null)
        {	
        	rangeList.updateRangeByUsage(parsedRef, range, usage);
       
	        if (delta.containsKey(ConversionConstant.RANGE_OPTIONAL_DATA))
	        {
	          JSONObject jData = (JSONObject) delta.get(ConversionConstant.RANGE_OPTIONAL_DATA);
	          JSONObject rangeData = range.getData();
	          JSONObject oData = (JSONObject) rangeData.get(ConversionConstant.RANGE_OPTIONAL_DATA);
	          if (null != oData)
	            oData.putAll(jData);
	        }
	        
	        if (usage == RangeUsage.NAMES)
	        {
    	        EventSource source = new EventSource(NotifyEvent.ACTION.SET, NotifyEvent.TYPE.RANGEADDRESS, range);
    	        NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    	        insertEvent(e);
    	        broadcast(e);
	        }
        }
      }
    }

  }
  /**
   * For undo delete row/column, some chart data source need to be restored according to the delta info which json format is like this
   * "undoCharts":{"Object 1":{"yVal ser2":[{"startIndex":1,"delta":1}],"label ser1":[{"startIndex":1,"delta":1}]}}
   * 
   * @param data
   *          the undoCharts json object
   * @param sIndex
   *          inserted start index
   * @param eIndex
   *          inserted end index
   * @param type
   *          inserted type, should be NotifyEvent.TYPE.ROW or COLUMN
   */
  private void restoreChartByDelta(JSONObject data, int sIndex, int eIndex, TYPE type)
  {
	  ReferenceList refList = getReferenceList();
	  Iterator<String> iter = data.keySet().iterator();
	  while (iter.hasNext())
	  {
		  String chartId = iter.next();
		  ChartDocument chartDoc = getChart(chartId);
		  if(chartDoc != null)
		  {
			  JSONObject dataSeqs = (JSONObject) data.get(chartId);
			  Iterator<String> dataSeqIter = dataSeqs.keySet().iterator();
			  while(dataSeqIter.hasNext())
			  {
				  String seqKey = dataSeqIter.next();
				  JSONArray seqDeltas = (JSONArray) dataSeqs.get(seqKey);
				  String role = seqKey;
				  String seriesId = null;
				  int idx = seqKey.indexOf(" ");
				  if(idx > 0)
				  {
					role = seqKey.substring(0, idx);
					seriesId = seqKey.substring(idx+1);
				  }
				  ScDataSequence dataSeq = (ScDataSequence)(chartDoc.getDataSequence(role,seriesId));
				  if(dataSeq != null)
				  {
					  for(int i = 0; i< seqDeltas.size(); i++)
					  {
						  JSONObject delta = (JSONObject) seqDeltas.get(i);
						  if(delta != null)
						  {
							  Range range = dataSeq.getReference(i);
							  if(range != null)
							  {
								  ParsedRef parsedRef = getRestoredRange(range, delta, sIndex, eIndex, type); 
								  if(parsedRef != null)
								  {
									  Reference ref = refList.getRefByAddress(parsedRef, parsedRef.sheetName, 0, true);
									  dataSeq.putReference(ref,i);
								  }
							  }
						  }
					  }
				  }
			  }
		  }
	  }
  }

  private ParsedRef getRestoredRange(Range range, JSONObject delta, int sIndex, int eIndex, TYPE type)
  {
      RangeInfo rInfo = range.getRangeInfo();
      int s;
      int e;
      if (type == NotifyEvent.TYPE.ROW)
      {
        s = rInfo.getStartRow();
        e = rInfo.getEndRow();
      }
      else
      {
        s = rInfo.getStartCol();
        e = rInfo.getEndCol();
      }
      if (s < sIndex && e > eIndex)
         return null;
      ParsedRef parsedRef = range.getParsedRef();
      //if refValue is Sheet1!#REF! which is due to delete column A for Sheet1!A:A
      // can not directly use parsedRef for Sheet1!#REF! , because it can not be recovered because of the parsedRefType of parsedRef
//      String refValue = range.getAddress();
//      ParsedRef parsedRef = ReferenceParser.parse(refValue);
      int sI = ((Number) delta.get("startIndex")).intValue();
      int deltaNum = ((Number) delta.get("delta")).intValue();
      if (sI == 1)
      {
        if (s != -1)
        {
          if (sIndex + deltaNum == s)
            s = sIndex;
          else
            e = e + deltaNum;
        }
        else
        {
          s = sIndex;
          e = sIndex + deltaNum - 1;
        }
      }
      else
      {
        if (s != -1)
          s = s - deltaNum;
        else
        {
          s = sIndex + sI - 1;
          e = s + deltaNum - 1;
        }
      }

      if (type == NotifyEvent.TYPE.ROW)
      {
        parsedRef.startRow = ReferenceParser.translateRow(s);
        parsedRef.endRow = ReferenceParser.translateRow(e);
      }
      else
      {
        parsedRef.startCol = ReferenceParser.translateCol(s);
        parsedRef.endCol = ReferenceParser.translateCol(e);
      }
      return parsedRef;
  }
  /**
   * delete rows between start row index and end row index
   * 
   * @param sheetName
   *          sheet name
   * @param sRIndex
   *          start row index 1-based
   * @param eRIndex
   *          end row index 1-based
   */
  public void deleteRows(String sheetName, int sRIndex, int eRIndex)
  {
    Sheet sheet = this.getSheetByName(sheetName);
    int sheetId = sheet.getId();
    // broadcast predelete event
    RangeInfo refValue = new RangeInfo(sheetId, sRIndex, 1, eRIndex, ConversionConstant.MAX_COL_NUM, ParsedRefType.ROW);
    EventSource source = new EventSource(NotifyEvent.ACTION.PREDELETE, NotifyEvent.TYPE.ROW, refValue);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    insertEvent(e);
    broadcastEventList();
    sheet.deleteRows(sRIndex, eRIndex);
  }

  public void setRows(ParsedRef ref, JSONObject data)
  {
    SetRangeHelper helper = new SetRangeHelper(this);

    Sheet sheet = getSheetByName(ref.getSheetName());
    int sheetId = sheet.getId();
    // broadcast  event
    RangeInfo refValue = new RangeInfo(sheetId, ref.getIntStartRow(), 1, ref.getIntEndRow(), ConversionConstant.MAX_COL_NUM, ParsedRefType.RANGE);
    EventSource source = new EventSource(NotifyEvent.ACTION.SET, NotifyEvent.TYPE.RANGE, refValue);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    NotifyEvent e2 = null;
    boolean bBroadcastSet = true;
    if (data.containsKey(ConversionConstant.ROWS))
    {
      Object o = data.get(ConversionConstant.IS_REPLACE);
      if (o != null && ((Boolean) o))
      {
        // is replace, call set range directly
        helper.applySetRangeMessage(ref, data);
      }
      else
      {
        JSONObject rowsData = (JSONObject) data.get(ConversionConstant.ROWS);
        // is undo set style or undo set value
        if (ModelHelper.isJSONContainsValue(rowsData))
        {
          // has value, is undo set value
          sheet.setValues(rowsData);
        }
        else
        {
          // has style, is undo set style
          helper.applySetRangeMessage(ref, data);
        }
      }
    }
    else if (data.containsKey(ConversionConstant.STYLE))
    {
      data = ModelHelper.styleToRangeMessage(ref, (JSONObject) data.get(ConversionConstant.STYLE));
      helper.applySetRangeMessage(ref, data);
      bBroadcastSet = false;//TODO: just not broadcast set row style event, will broadcast if the style contain number format
    }
    else if (data.containsKey(ConversionConstant.VISIBILITY) || data.containsKey(ConversionConstant.HEIGHT))
    {
      String key;
      Object v;
      boolean isSetVis = false;

      if (data.containsKey(ConversionConstant.VISIBILITY))
      {
        key = ConversionConstant.VISIBILITY;
        v = data.get(ConversionConstant.VISIBILITY);
        isSetVis = true;
 		EventSource source2 = new EventSource(NotifyEvent.ACTION.HIDE, NotifyEvent.TYPE.ROW, refValue);
        e2 = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source2);
        if(((String)v).equalsIgnoreCase("visible"))//if set visibility event will not set rows data for the given parameter "data"
          source2.setAction(NotifyEvent.ACTION.SHOW);
      }
      else
      {
        key = ConversionConstant.HEIGHT;
        v = data.get(ConversionConstant.HEIGHT);
        bBroadcastSet = false;
      }

      data = new JSONObject();
      JSONObject rows = new JSONObject();
      data.put(ConversionConstant.ROWS, rows);
      if (isSetVis)
      {
        data.put(ConversionConstant.IGNORE_FILTER_ROW, true);
      }
      JSONObject row = new JSONObject();
      rows.put(Integer.toString(ref.getIntStartRow()), row);
      row.put(key, v);
      if (ref.getIntEndRow() > ref.getIntStartRow())
      {
        row.put(ConversionConstant.REPEATEDNUM, ref.getIntEndRow() - ref.getIntStartRow());
      }
      data.put(ConversionConstant.IS_ROW, true);

      helper.applySetRangeMessage(ref, data);
    }
    // else, unknown message
    
    if(bBroadcastSet)
      insertEvent(e);
    if(e2 != null)
      insertEvent(e2);
    
    broadcastEventList();
    
  }

  // /**
  // * clear the cell's value not include style between sRIndex and sRIndex
  // *
  // * @param sheetName
  // * sheet name
  // * @param sRIndex
  // * start row index 1-based
  // * @param eRIndex
  // * end row index 1-based
  // */
  // public void clearRows(String sheetName, int sRIndex, int eRIndex)
  // {
  //
  // }

  /********************************************* column ************************************/
  /**
   * insert columns with json data which has column information,like column width,style,cell value and so on. this operation will insert new
   * column instances with data
   * 
   * @param sheetName
   *          sheet name
   * @param sCIndex
   *          start column index
   * @param eCIndex
   *          end column index
   * @param colData
   *          json data (if this parameter not exist,then insert empty columns)
   */
  public void insertColumns(ParsedRef ref, JSONObject colData)
  {
    Sheet sheet = this.getSheetByName(ref.getSheetName());

    int sheetId = sheet.getId();
    // broadcast preinsert event
    RangeInfo refValue = new RangeInfo(sheetId, 1, ref.getIntStartCol(), ConversionConstant.MAX_ROW_NUM, ref.getIntEndCol(), ParsedRefType.COLUMN);
    EventSource source = new EventSource(NotifyEvent.ACTION.PREINSERT, NotifyEvent.TYPE.COLUMN, refValue);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    insertEvent(e);
    broadcastEventList();

    sheet.insertCols(ref, colData);
    
    //broadcast insert event
    source.setAction(NotifyEvent.ACTION.INSERT);
    broadcast(e);
    // handle undoRanges
    if (null != colData.get("undoRanges"))
    {
      JSONObject rsJson = (JSONObject) colData.get("undoRanges");
      restoreRangeByDelta(rsJson, ref.getIntStartCol(), ref.getIntEndCol(), NotifyEvent.TYPE.COLUMN);
    }
    if(null != colData.get("undoCharts"))
    {
      JSONObject rsJson = (JSONObject) colData.get("undoCharts");
      restoreChartByDelta(rsJson, ref.getIntStartCol(), ref.getIntEndCol(), NotifyEvent.TYPE.COLUMN);
    }
    JSONObject rsJson = (JSONObject) colData.get("undoFreeze");
    if(null != rsJson)
    {
      Number delta = (Number) rsJson.get(ConversionConstant.DELTA);
      if(null != delta)
        restoreFreeze(ref.getIntStartCol(), delta.intValue(), false, ref.getSheetName());
    }
    
  }

  /**
   * delete columns between sCIndex and sCIndex
   * 
   * @param sheetName
   *          sheet name
   * @param sCIndex
   *          start column index 1-based
   * @param eCIndex
   *          end column index 1-based
   */
  public void deleteColumns(String sheetName, int sCIndex, int eCIndex)
  {
    Sheet sheet = this.getSheetByName(sheetName);
    int sheetId = sheet.getId();
    // broadcast predelete event
    RangeInfo refValue = new RangeInfo(sheetId, 1, sCIndex, ConversionConstant.MAX_ROW_NUM, eCIndex, ParsedRefType.COLUMN);
    EventSource source = new EventSource(NotifyEvent.ACTION.PREDELETE, NotifyEvent.TYPE.COLUMN, refValue);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    insertEvent(e);
    broadcastEventList();

    sheet.deleteCols(sCIndex, eCIndex,true);
  }
  
  
  /**
   * set columns with json data which has column information,like column width,style,cell value and so on.
   */
  public void setColumns(ParsedRef ref, JSONObject data)
  {
	if(!ref.isValid())
		return;
	
    int repNum = ref.getIntEndCol() - ref.getIntStartCol();
    
    Sheet sheet = getSheetByName(ref.getSheetName());
    int sheetId = sheet.getId();
    // broadcast  event
    RangeInfo refValue = new RangeInfo(sheetId, 1, ref.getIntStartCol(), ConversionConstant.MAX_ROW_NUM, ref.getIntEndCol(), ParsedRefType.RANGE);
    EventSource source = new EventSource(NotifyEvent.ACTION.SET, NotifyEvent.TYPE.RANGE, refValue);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    NotifyEvent e2 = null;
    boolean bBroadcastSet = true;
    
    JSONObject colsMeta = (JSONObject) data.get(ConversionConstant.COLUMNS);
    boolean hasStyle = false;
    if(null == colsMeta)
    {
      colsMeta = new JSONObject();
      JSONObject colMeta = new JSONObject();
      if(data.containsKey(ConversionConstant.STYLE))
      {
        hasStyle = true;
        colMeta.put(ConversionConstant.STYLE, data.get(ConversionConstant.STYLE));
        bBroadcastSet = false;
      }
      if( data.containsKey(ConversionConstant.VISIBILITY))
      {
        colMeta.put(ConversionConstant.VISIBILITY, data.get(ConversionConstant.VISIBILITY));
        
        Object v = data.get(ConversionConstant.VISIBILITY);
        EventSource source2 = new EventSource(NotifyEvent.ACTION.SHOW, NotifyEvent.TYPE.COLUMN, refValue);
        e2 = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source2);
        if(((String)v).equalsIgnoreCase("hide"))//if set visibility event will not set rows data for the given parameter "data"
          source2.setAction(NotifyEvent.ACTION.HIDE);
      }
      if(data.containsKey(ConversionConstant.WIDTH))
      {
        colMeta.put(ConversionConstant.WIDTH, data.get(ConversionConstant.WIDTH));
        bBroadcastSet = false;
      }
      colMeta.put(ConversionConstant.REPEATEDNUM,repNum);
      colsMeta.put(ref.getStartCol(), colMeta);
    }  
    else
      hasStyle = true;
    JSONObject colsData = new JSONObject();
    colsData.put(ConversionConstant.COLUMNS, colsMeta);
    if(hasStyle && !colsMeta.isEmpty())
    {
      JSONObject cellsJson = ModelHelper.constructEventByColStyle(colsMeta, styleManager);
      JSONObject rowsJson = new JSONObject();
      JSONObject rowJson = new JSONObject();
      rowJson.put(ConversionConstant.CELLS, cellsJson); 
      rowJson.put(ConversionConstant.REPEATEDNUM, (ConversionConstant.MAX_ROW_NUM -1)); 
      rowsJson.put("1", rowJson);
      colsData.put(ConversionConstant.ROWS, rowsJson);
    }
    colsData.put(ConversionConstant.IS_COLUMN, true);
    SetRangeHelper helper = new SetRangeHelper(this);
    helper.applySetRangeMessage(ref, colsData);


    if (data.containsKey(ConversionConstant.ROWS))
    {
      data.remove(ConversionConstant.COLUMNS);
      helper.applySetRangeMessage(ref, data);
      bBroadcastSet = true;
    }
    
    if(bBroadcastSet)
      insertEvent(e);
    if(e2 != null)
      insertEvent(e2);
    broadcastEventList();
  }

  /********************************************* Range ************************************/
  /**
   * this is a powerful function which can handle set range/rows style and its undo, paste range/rows and its undo
   * 
   * @param sheetName
   *          sheet name
   * @param {sRIndex,eRIndex,sCIndex,eCIndex} 1-based
   * @param data
   *          json
   */
  public void setRange(ParsedRef ref, JSONObject data)
  {
    SetRangeHelper helper = new SetRangeHelper(this);
    Sheet sheet = getSheetByName(ref.getSheetName());
    int sheetId = sheet.getId();
    
    RangeInfo refValue = new RangeInfo(sheetId, ref.getIntStartRow(), ref.getIntStartCol(), ref.getIntEndRow(), ref.getIntEndCol(), ParsedRefType.RANGE);
    EventSource source = new EventSource(NotifyEvent.ACTION.SET, NotifyEvent.TYPE.RANGE, refValue);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    boolean bBroadcastSet = true;
    
    if (data.containsKey(ConversionConstant.ROWS))
    {
      Object o = data.get(ConversionConstant.IS_REPLACE);
      if (o != null && ((Boolean) o))
      {
        // is replace, call set range directly
        helper.applySetRangeMessage(ref, data);
        //TODO: remove usage param when support c/p of cf
        removeRangesByUsage(refValue, RangeUsage.DATA_VALIDATION);
        Object bRCmts = data.get(ConversionConstant.IS_REPLACE_COMMENTS);
        if(bRCmts != null && ((Boolean) bRCmts))
        	deleteCommentsInRange(refValue);
      }
      else
      {
        JSONObject rowsData = (JSONObject) data.get(ConversionConstant.ROWS);
        // is undo set style or undo set value
        if (ModelHelper.isJSONContainsValue(rowsData))
        {
          // has value, is undo set value
          sheet.setValues(rowsData);
        }
        else
        {
          // has style, is undo set style
          helper.applySetRangeMessage(ref, data);
        }
      }
    }
    else if (data.containsKey(ConversionConstant.STYLE))
    {
      data = ModelHelper.styleToRangeMessage(ref, (JSONObject) data.get(ConversionConstant.STYLE));
      helper.applySetRangeMessage(ref, data);
      bBroadcastSet = false; //TODO: for format style
    }
    // else, unknown event
    
    if(bBroadcastSet)
      insertEvent(e);
    
    broadcastEventList();
  }

  /**
   * clear the cell's value not include style in the range
   * 
   * @param sheetName
   *          sheet name
   * @param {sRIndex,eRIndex,sCIndex,eCIndex} 1-based
   */
  public void clearRange(ParsedRef ref)
  {
    Sheet sheet = getSheetByName(ref.getSheetName());

    if (sheet == null)
    {
      LOG.log(Level.WARNING, "clearRange on an sheet {0} that not exist.", ref.getSheetName());
      return;
    }
    RangeInfo info = ModelHelper.getRangeInfoFromParseRef(ref, sheet.getId());
    sheet.clearRange(info.getStartRow(), info.getEndRow(), info.getStartCol(), info.getEndCol());
    
    //broadcast
    RangeInfo refValue = new RangeInfo(sheet.getId(), info.getStartRow(), info.getStartCol(), info.getEndRow(), info.getEndCol(), ParsedRefType.RANGE);
    EventSource source = new EventSource(NotifyEvent.ACTION.SET, NotifyEvent.TYPE.RANGE, refValue);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    insertEvent(e);
    broadcastEventList();
  }

  private ArrayList<SharedFormulaRef4RulesObj>getOrderedRulesObjs(RangeInfo info, boolean bRowOrder)
  {
	  ArrayList<SharedFormulaRef4RulesObj> ret = new ArrayList<SharedFormulaRef4RulesObj>();
	  Set<String> keys = rulesObjects.keySet();
	  if(keys == null)
		  return ret;
	  
	  Object[] keysArray = keys.toArray();
	 for(int i = keysArray.length - 1; i >= 0; i --)
	 {
		 RulesObj obj = rulesObjects.get((String)keysArray[i]);
		 List<SharedFormulaRef4RulesObj> l = obj.ranges();
		 for(int j = l.size() - 1; j >=0; j --)
		 {
			 SharedFormulaRef4RulesObj range = l.get(j);
			 if(range.getSheetId() != info.getSheetId())
				 continue;
			 if(range.intersect(info))
			 {
				 boolean inserted = false;
				 for(int k = 0; k < ret.size(); k ++)
				 {
					 SharedFormulaRef4RulesObj r = ret.get(k);
					 if(bRowOrder && range.getStartRow() < r.getStartRow() || !bRowOrder && range.getStartCol() < r.getStartCol())
					 {
						 ret.add(k, range);
						 inserted = true;
						 break;
					 }
				 }
				 if(!inserted)
					 ret.add(range);
			 }
		 }
	 }
	 return ret;
  }
  
  protected void insertRulesObj4EmptyRowCol(String sheetName, int start, int end, boolean bRow)
	{
	  	Sheet sheet = getSheetByName(sheetName);
		int sheetId = sheet.getId();
		RangeInfo info = new RangeInfo(sheetId, bRow ? start - 1 : 1, bRow ? 1 : start - 1, bRow ? start - 1: ConversionConstant.MAX_ROW_NUM, bRow ? ConversionConstant.MAX_COL_NUM : start - 1, ParsedRefType.RANGE);
	    
		ArrayList<SharedFormulaRef4RulesObj> ranges = getOrderedRulesObjs(info, !bRow);
		int size = ranges.size();
		if (size == 0)
			return;
		int delta = end - start + 1;
		int rowDelta = bRow ? delta : 0;
		int colDelta = bRow ? 0 : delta;
		RangeInfo updateRange = new RangeInfo(sheetId, bRow ? start : 1, bRow ? 1 : start,  ConversionConstant.MAX_ROW_NUM, ConversionConstant.MAX_COL_NUM, ParsedRefType.RANGE);
		for(int i = 0; i < size ; i ++)
		{
			SharedFormulaRef4RulesObj range = ranges.get(i);
			if ((bRow && range.getEndRow() == start - 1) || (!bRow && range.getEndCol() == start - 1))
				range.updateAddress(updateRange, rowDelta, colDelta, this, true);
		}
	}
  
  private void insertRulesObjByUsage(ParsedRef parsedRef, JSONObject rangeJson, RangeUsage usage)
  {
	Sheet sheet = getSheetByName(parsedRef.getSheetName());
	int sheetId = sheet.getId();
	RangeInfo info = ModelHelper.getRangeInfoFromParseRef(parsedRef, sheetId);
	String rangeIdStr = (String) rangeJson.get(ConversionConstant.RANGEID);
	//remove data validations for the rangeAddress
	if(usage == RangeUsage.DATA_VALIDATION)
		removeRangesByUsage(info, usage);
	else if(usage == RangeUsage.CONDITIONAL_FORMAT)
		removeSplitedRanges(rangeIdStr,  usage);
	//create new data validation instance
	
	addRulesObjByUsage(rangeIdStr, info, rangeJson, usage, true);
  }
  
  private void removeSplitedRanges(String pId, RangeUsage usage)
  {
	  Set<String> keys = rulesObjects.keySet();
	 if(keys == null)
		 return;
     
	 Object[] keysArray = keys.toArray();
	 for(int i = keysArray.length - 1; i >= 0; i --)
	 {
		 RulesObj obj = rulesObjects.get((String)keysArray[i]);
		 if(usage != null && obj.getUsage() != usage)
			 continue;
		 List<SharedFormulaRef4RulesObj> l = obj.ranges();
		 for(int j = l.size() - 1; j >=0; j --)
		 {
			 SharedFormulaRef4RulesObj range = l.get(j);
			 if(range.getId().indexOf(pId + "_") == 0 || range.getId().equals(pId))
			 {
				 RulesObj data = range.getRulesObj();
				  data.removeRange(range);
				  range.endListeningSharedArea(areaManager, range, range);
				  range.clearRefTokens(this);
			 }
		 }
	 }
  }
  
  private void deleteCommentsInRange(RangeInfo info)
  {
	  RangeList<String> list = getRangeList();
	  RangeMap cmtMap = list.getRangeMapByUsage(RangeUsage.COMMENT, false);
	  if(cmtMap != null)
	  {
		  Iterator iter = cmtMap.keySet().iterator();
		  while(iter.hasNext())
	      {
		      Range r = (Range)cmtMap.get(iter.next());
		      RangeRelation relation = ModelHelper.compareRange(r.getRangeInfo(), info);
		      if(relation == RangeRelation.SUBSET || relation == RangeRelation.EQUAL){
		    	  list.deleteRange(r);
		    	  comments.remove(r.getId());
		      }
	      }
	  }
	  
  }
  
  private void removeRangesByUsage(RangeInfo info, RangeUsage usage)
  {	
	  Set<String> keys = rulesObjects.keySet();
	 if(keys == null)
		 return;
     
	 Object[] keysArray = keys.toArray();
	 for(int i = keysArray.length - 1; i >= 0; i --)
	 {
		 RulesObj obj = rulesObjects.get((String)keysArray[i]);
		 if(usage != null && obj.getUsage() != usage)
			 continue;
		 List<SharedFormulaRef4RulesObj> l = obj.ranges();
		 for(int j = l.size() - 1; j >=0; j --)
		 {
			 SharedFormulaRef4RulesObj range = l.get(j);
			 RangeInfo interRange = range.rangeIntersection(info);
			  if(interRange != null)
			  {
				  if(range.compare(interRange) == AreaRelation.EQUAL)
				  {
					  RulesObj data = range.getRulesObj();
					  data.removeRange(range);
					  range.endListeningSharedArea(areaManager, range, range);
					  range.clearRefTokens(this);
				  }else{//split range.
					  range.removPartialRange(interRange, this);
				  }
			  }
		 }
	 }
  }
  
  /**
   * insert name/unname range
   * 
   * @param parsedRef
   * @param rangeJson
   */
  public Range insertRange(ParsedRef parsedRef, JSONObject rangeJson)
  {
    // extract the range id and usage
    String rangeIdStr = (String) rangeJson.get(ConversionConstant.RANGEID);
    String usageStr = (String) rangeJson.get(ConversionConstant.RANGE_USAGE);
    RangeUsage usage = RangeUsage.enumValueOf(usageStr);
    
    if(usage == RangeUsage.DATA_VALIDATION || usage == RangeUsage.CONDITIONAL_FORMAT){
    	insertRulesObjByUsage(parsedRef, rangeJson, usage);
		return null;
    }
    
    Range range = null;
    // new range and check the type of the range id, int or String
    if (usage == RangeUsage.IMAGE || usage == RangeUsage.SHAPE || usage == RangeUsage.CHART_AS_IMAGE || usage == RangeUsage.FILTER || usage == RangeUsage.COMMENT
        || usage == RangeUsage.TASK || usage == RangeUsage.CHART || usage == RangeUsage.NAMES || usage == RangeUsage.ACCESS_PERMISSION)
    {
      // string range id
      RangeList<String> list = getRangeList();

      if(usage == RangeUsage.NAMES)
        range = list.getRangeByUsage(rangeIdStr.toLowerCase(), usage);
      else
      range = list.getRangeByUsage(rangeIdStr, usage);
      if (range != null)
      {
        LOG.log(Level.WARNING, "range with id {0} and usage {1} is exist in the range list", new Object[] { rangeIdStr, usageStr });
        return range;
      }
      
      range = new Range(this, parsedRef, null, true);
      range.setId(rangeIdStr);
      range.setUsage(usage);
      
      if(usage == RangeUsage.COMMENT){
    	  RangeMap cmtMap = list.getRangeMapByUsage(RangeUsage.COMMENT, false);
    	  if(cmtMap != null)
    	  {
    		  Iterator iter = cmtMap.keySet().iterator();
    		  while(iter.hasNext())
    	      {
    		      Range r = (Range)cmtMap.get(iter.next());
    		      if(r.equals(range, true))
    		      {
    		    	  LOG.log(Level.WARNING, "There is comments for {0}", new Object[] {range.getAddress()});
    		    	  return null;
    		      }
    	      }
    	  }
      }
      
      if(usage == RangeUsage.FILTER)
      {
          //remove the preserve range for range filter(which is unsupport filter),
          //it is the same behavior as client side
          PreserveRangeList pRangeList = this.getPreserveManager().getRangeList();
          RangeMap<String> rangeFilterRanges = pRangeList.getByUsageRangeMap().get(RangeUsage.RANGEFILTER);
          if(rangeFilterRanges != null)
          {
            Range<String> rangeFilter = null;
            Iterator<Map.Entry<String, Range<String>>>  iter = rangeFilterRanges.entrySet().iterator();
            while(iter.hasNext())
            {
              Map.Entry<String, Range<String>> entry = iter.next();
              Range<String> iterRange = entry.getValue();
              if(iterRange != null && iterRange.sheetId == range.sheetId)
              {
                rangeFilter = iterRange;//one sheet only contains most one filter
                Sheet sheet = getSheetByName(parsedRef.getSheetName());
                sheet.restoreFilteredRows(iterRange.getRangeInfo());
                break;
              }
            }
            if(rangeFilter != null)
              pRangeList.deleteRange(rangeFilter);
          }
          //remove existing filter range in the same sheet. One sheet can only has one filter.
          RangeMap<String> filterlist = list.getByUsageRangeMap().get(RangeUsage.FILTER);
          if (filterlist!=null) 
          {
        	  Range<String> rangeFilter = null;
        	  Iterator<Map.Entry<String, Range<String>>>  iter = filterlist.entrySet().iterator();
        	  while(iter.hasNext())
        	  {
        		  Map.Entry<String, Range<String>> entry = iter.next();
        		  Range<String> iterRange = entry.getValue();
        		  if(iterRange != null && iterRange.sheetId == range.sheetId)
        		  {
        			  rangeFilter = iterRange;//one sheet only contains most one filter
        			  Sheet sheet = getSheetByName(parsedRef.getSheetName());
        			  sheet.restoreFilteredRows(iterRange.getRangeInfo());
        			  break;
        		  }
        	  }
        	  if(rangeFilter != null)
        		  list.deleteRange(rangeFilter);
          }

      }
      if(usage == RangeUsage.NAMES)
      {
        //TODO: do not need set lower case name when use areamanager
        //name range id is always the upper case, and put the range id in optional data
        range.setId(rangeIdStr.toLowerCase());
        range.getData().put("name", rangeIdStr);
      }
      list.addRange(range);

    }
    else
    {
      // technically, preserve range id is int, but it can never be added by client
      LOG.log(Level.WARNING, "should provide implementation for insertRange with message\nrefValue: {0}\ndata:{1}", new Object[] {
          parsedRef.toString(), rangeJson.toString() });
      return null;
    }

    // set optional data
    JSONObject rangeData = (JSONObject) rangeJson.get(ConversionConstant.RANGE_OPTIONAL_DATA);
    if (range != null && rangeData!=null)
    {
      if(usage == RangeUsage.CHART)
      {
      	//chart json will not be store in the range json
         JSONObject chartJson = (JSONObject)rangeData.remove(ConversionConstant.USAGE_CHART);
         if(chartJson != null){
	         ChartDocument chart = new ChartDocument();
	         ScDataProvider provider = new ScDataProvider(this);
	         chart.attachDataProvider(provider);
	         chart.loadFromJson(chartJson);
	         chart.setChartId(rangeIdStr);
	         charts.add(chart);
         }
      }
      if(usage == RangeUsage.COMMENT)
      {
    	  JSONArray itmesJson = (JSONArray)rangeData.get(ConversionConstant.ITEMS);
    	  Comments commentsObj = new Comments(rangeIdStr, itmesJson);
    	  comments.put(rangeIdStr, commentsObj);
      }
      else
      {
	      JSONObject data = new JSONObject();
	      data.put(ConversionConstant.RANGE_OPTIONAL_DATA, rangeData);
	      range.setData(data);
      }
    }
    
    //broadcast
    if(range != null && range.getUsage() == RangeUsage.NAMES)
    {
      Range refValue = range;
      EventSource source = new EventSource(NotifyEvent.ACTION.INSERT, NotifyEvent.TYPE.RANGEADDRESS, refValue);
      NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
      broadcast(e);
    }
    return range;
  }

  /**
   * delete the name/unname range
   * 
   * @param parsedRef
   * 
   * @param rangeJson
   */
  public void deleteRange(ParsedRef parsedRef, JSONObject rangeJson)
  {
    // extract the range id and usage
    String rangeIdStr = (String) rangeJson.get(ConversionConstant.RANGEID);
    String usageStr = (String) rangeJson.get(ConversionConstant.RANGE_USAGE);
    RangeUsage usage = RangeUsage.enumValueOf(usageStr);
    Range range = null;
    if(usage == RangeUsage.DATA_VALIDATION)
    {
    	Sheet sheet = this.getSheetByName(parsedRef.getSheetName());
    	int sheetId = sheet.getId();
    	this.removeRangesByUsage(ModelHelper.getRangeInfoFromParseRef(parsedRef, sheetId), usage);

    	return;
    }else if(usage == RangeUsage.CONDITIONAL_FORMAT){
    	//TODO: need when UI implemented, remove a rulesObj,its model and area 
    	return;
    }
    
    if (usage == RangeUsage.IMAGE || usage == RangeUsage.SHAPE || usage == RangeUsage.CHART_AS_IMAGE || usage == RangeUsage.FILTER || usage == RangeUsage.COMMENT
        || usage == RangeUsage.TASK || usage == RangeUsage.CHART || usage == RangeUsage.NAMES || usage == RangeUsage.ACCESS_PERMISSION)
    {
      RangeList list = getRangeList();
      if(usage == RangeUsage.NAMES)
        range = list.getRangeByUsage(rangeIdStr.toLowerCase(), usage);
      else
      range = list.getRangeByUsage(rangeIdStr, usage);
      list.deleteRange(range);

      if (range != null && usage == RangeUsage.FILTER)
      {
        String sheetName = parsedRef.getSheetName();
        Sheet sheet = this.getSheetByName(sheetName);
        sheet.restoreFilteredRows(range.getRangeInfo());
      }
      if(usage == RangeUsage.CHART){
    	  ChartDocument chartDoc = getChart(rangeIdStr);
    	  if(chartDoc != null)
    		  charts.remove(chartDoc);
      }
      else if(usage == RangeUsage.COMMENT)
      {
    	  comments.remove(rangeIdStr);
      }
    }
    else
      LOG.log(Level.WARNING, "should provide implementation for deleteRange with message\nrefValue: {0}\ndata:{1}", new Object[] {
          parsedRef.toString(), rangeJson.toString() });
  //broadcast
    if(range != null && range.getUsage() == RangeUsage.NAMES)
    {
      Range refValue = range;
      EventSource source = new EventSource(NotifyEvent.ACTION.DELETE, NotifyEvent.TYPE.RANGEADDRESS, refValue);
      NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
      insertEvent(e);
    }
    broadcastEventList();

  }

  /**
   * update the range address or data in rangeJosn
   * 
   * @param parsedRef
   * @param rangeJson
   */
  public void updateRange(ParsedRef parsedRef, final JSONObject rangeJson)
  {
    String rangeIdStr = (String) rangeJson.get(ConversionConstant.RANGEID);
    String usageStr = (String) rangeJson.get(ConversionConstant.RANGE_USAGE);
    final RangeUsage usage = RangeUsage.enumValueOf(usageStr);
    Range range = null;
    if (usage == RangeUsage.IMAGE || usage == RangeUsage.SHAPE || usage == RangeUsage.CHART_AS_IMAGE || usage == RangeUsage.FILTER || usage == RangeUsage.COMMENT
        || usage == RangeUsage.TASK || usage == RangeUsage.CHART || usage == RangeUsage.NAMES || usage == RangeUsage.ACCESS_PERMISSION )
    {
      RangeList list = getRangeList();
      if (usage == RangeUsage.NAMES)
        range = list.getRangeByUsage(rangeIdStr.toLowerCase(), usage);
      else
        range = list.getRangeByUsage(rangeIdStr, usage);
      if (range != null)
        list.updateRangeByUsage(parsedRef, range, usage);
      else
      {
    	if(usage == RangeUsage.ACCESS_PERMISSION && rangeJson.containsKey(ConversionConstant.RANGE_OPTIONAL_DATA))
    	{
    	  JSONObject data = (JSONObject)((JSONObject)rangeJson.get(ConversionConstant.RANGE_OPTIONAL_DATA));
    	  if(data != null && data.containsKey(ConversionConstant.RANGE_ACL_DATA_ADD))
    	  {
    		  JSONArray addData = (JSONArray) data.get(ConversionConstant.RANGE_ACL_DATA_ADD);
    		  JSONObject newJson = new JSONObject();
    		  newJson.put(ConversionConstant.RANGEID, rangeIdStr);
    		  newJson.put(ConversionConstant.RANGE_USAGE, usageStr);
    		  JSONObject newData = new JSONObject();
    		  newData.put("bSheet", true);
    		  newData.put(ConversionConstant.RANGE_ACL_DATA_TYPE, ConversionConstant.RANGE_ACL_TYPE_READONLY);
    		  newData.put(ConversionConstant.RANGE_ACL_DATA_OWNERS, addData);
    		  newData.put(ConversionConstant.RANGE_ACL_DATA_CREATOR, data.get("creator"));
    		  newJson.put(ConversionConstant.RANGE_OPTIONAL_DATA, newData);
    		  this.insertRange(parsedRef, newJson);
    	  }
    	}
      }	  
    }
    else if (usage != RangeUsage.NORMAL)
    {
      LOG.log(Level.FINEST, "should be preserve range with \nrefValue: {0}\ndata:{1}",
          new Object[] { parsedRef.toString(), rangeJson.toString() });
      RangeList list = getPreserveManager().getRangeList();
      range = list.getRangeByUsage(rangeIdStr, usage);
      if (range != null)
        list.updateRangeByUsage(parsedRef, range, usage);
    }

    if(usage == RangeUsage.COMMENT)
    {
  	  JSONObject rangeData = (JSONObject) rangeJson.get(ConversionConstant.RANGE_OPTIONAL_DATA);
  	  Comments commentsObj = comments.get(rangeIdStr);
  	  if(rangeData != null && commentsObj != null)
  	  {
    	  String actionStr = (String)rangeData.get(ConversionConstant.ACTION);
    	  JSONObject itemJson = (JSONObject)rangeData.get(ConversionConstant.ITEM);
    	  if(ConversionConstant.ACTION_APPEND.equals(actionStr))
    	  {	
    		  commentsObj.append(itemJson);
    	  }
    	  else if(ConversionConstant.ACTION_UNDOAPPEND.equals(actionStr))
    	  {
    		  commentsObj.undoAppend(itemJson);
    	  }
    	  else
    	  {
    		  Number index = (Number)rangeData.get(ConversionConstant.INDEX);
    		  if(index != null)
    			  commentsObj.update(index.intValue(), itemJson);
    	  }
  	  }
    }
    if (range != null)
    {
      // update optional data and other attribute, such as series for preserve range
      final JSONObject rangeData = range.getData();
      final Document self = this;
      final ParsedRef pRef = parsedRef;
      ModelHelper.iterateMap(rangeJson, new IMapEntryListener<String, Object>()
      {
        public boolean onEntry(String id, Object obj)
        {
          if (id.equals(ConversionConstant.RANGE_OPTIONAL_DATA))
          {
            JSONObject data = (JSONObject) rangeData.get(ConversionConstant.RANGE_OPTIONAL_DATA);
            if (null == data)
                rangeData.put(ConversionConstant.RANGE_OPTIONAL_DATA, obj);
            else
            {
            	JSONArray owners = null;
                if(usage == RangeUsage.ACCESS_PERMISSION)
                {
                  owners = (JSONArray) data.get(ConversionConstant.RANGE_ACL_DATA_OWNERS);
                  JSONObject setData = (JSONObject)obj;
                  if(setData.containsKey(ConversionConstant.RANGE_ACL_DATA_ADD))
                  {
                	JSONArray addOwners = (JSONArray) ((JSONObject)obj).get(ConversionConstant.RANGE_ACL_DATA_ADD);
                	for(int i = addOwners.size() -1; i >= 0; i--)
                	{
                		if(!owners.contains(addOwners.get(i)))
                			owners.add(addOwners.get(i));
                	}
                	return false;
                  }	 
                  else if(setData.containsKey(ConversionConstant.RANGE_ACL_DATA_DELETE))
                  {
                	JSONArray dltOwners = (JSONArray) ((JSONObject)obj).get(ConversionConstant.RANGE_ACL_DATA_DELETE);
                	int len = owners.size();
                	for(int i = len -1; i >= 0; i--)
                	{
                	  if(dltOwners.contains(owners.get(i)))
                		owners.remove(i);
                	}
                	if(owners.size() == 0)
                	{
                	   self.deleteRange(pRef, rangeJson);
                	}
                	return false;
                  }
                }
                data.putAll((JSONObject) obj);
                if(usage == RangeUsage.ACCESS_PERMISSION)
                {
                	owners = (JSONArray) data.get(ConversionConstant.RANGE_ACL_DATA_OWNERS);
                	if(!owners.contains("everyoneExceptMe"))
                		data.remove("except");
                }
            }
          }
          else if (!id.equals(ConversionConstant.RANGEID) && !id.equals(ConversionConstant.RANGE_USAGE))
          {
            rangeData.put(id, obj);
          }
          return false;
        }
      });
      
      if(usage == RangeUsage.ACCESS_PERMISSION) 
      {
    	  JSONObject jsonData = (JSONObject)rangeJson.get(ConversionConstant.RANGE_OPTIONAL_DATA);
    	  JSONObject rData = (JSONObject) rangeData.get(ConversionConstant.RANGE_OPTIONAL_DATA);
    	  if(rData.containsKey("bSheet"))
    		  rData.put(ConversionConstant.RANGE_ACL_DATA_CREATOR, jsonData.get(ConversionConstant.RANGE_ACL_DATA_CREATOR));
      }
      // TODO: what about the data for preserve range, such as attribute, series, index(reference index in the formula typed name range)
      // in fact, need to check if they can be modified, I think index might change, but have not found where to change it in old model yet
    }
    
    //broadcast
    if(range != null && range.getUsage() == RangeUsage.NAMES)
    {
      Range refValue = range;
      EventSource source = new EventSource(NotifyEvent.ACTION.SET, NotifyEvent.TYPE.RANGEADDRESS, refValue);
      NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
      insertEvent(e);
    }
    broadcastEventList();
  }

  public RangeList getRangeListByUsage(RangeUsage usage)
  {
    RangeList list = null;
    switch (usage)
      {
        case NORMAL :
          list = null;
          break;
        case TASK :
        case COMMENT :
        case FILTER :
        case IMAGE :
        case SHAPE :
        case CHART_AS_IMAGE :
        case CHART:
        case NAMES:
          list = getRangeList();
          break;
        case REFERENCE :
          LOG.log(Level.WARNING, "reference is not stored in reference list, pls check!");
          list = getReferenceList();
          break;
        default:
          list = getPreserveManager().getRangeList();
          break;
      }
    return list;
  }
  
  public List<ChartDocument> getCharts()
  {
	  return charts;
  }
  
  public void addChart(ChartDocument chart)
  {
	  charts.add(chart);
  }
  
  public ChartDocument getChart(String chartId)
  {
	  for(int i=0;i<charts.size();i++)
	  {
		ChartDocument chart = charts.get(i);
		if(chart.getChartId().equals(chartId))
			return chart;
	  }
	  return null;
  }
  
  //return all the rulesobjs  of document, including dv and cf
  public List<SharedFormulaRef4RulesObj> getRulesObjs()
  {
	  ArrayList<SharedFormulaRef4RulesObj> list = new ArrayList<SharedFormulaRef4RulesObj>();
	  Iterator<String> iter = rulesObjects.keySet().iterator();
	  while(iter.hasNext())
	  {
		  String id = iter.next();
		  RulesObj rulesObj = rulesObjects.get(id);
		  List<SharedFormulaRef4RulesObj> l = rulesObj.getRanges();
		  list.addAll(l);
	  }
	  
	  return list;
  }
  
  public void removeRulesObj(String id)
  {
	  rulesObjects.remove(id);
  }
  
  public void renameRulesObj(RulesObj obj, String newName, RangeUsage usage)
  {
	 
	  rulesObjects.remove(obj.getId());
	  rulesObjects.put(newName, obj);
  }
  
  public void addRulesObj(RulesObj rulesObj)
  {
	  rulesObjects.put(rulesObj.getId(), rulesObj);
  }
  
  public void addRulesObjByUsage(String id, RangeInfo info, JSONObject data, RangeUsage usage, boolean parse)
  {
	  SharedFormulaRef4RulesObj area = null;
	  data = (JSONObject)data.get(ConversionConstant.DATA);
	  RulesObj rulesObj = null;
	  
	  if(usage == RangeUsage.DATA_VALIDATION)
	  {
		  area = new SharedFormulaRef4DV(info, this, id);
		  if(data.containsKey(ConversionConstant.CRITERIA))
			  rulesObj = new DataValidation((SharedFormulaRef4DV)area, this, (JSONObject)data.get(ConversionConstant.CRITERIA));
	  }else if(usage == RangeUsage.CONDITIONAL_FORMAT)
	  {
		  area = new SharedFormulaRef4CF(info, this, id);
		  if(data.containsKey(ConversionConstant.CRITERIAS))
			  rulesObj = new ConditionalFormat((SharedFormulaRef4CF)area, this, data);
	  }
	  if(area == null)
		  return;
	  if(rulesObj != null){
		  rulesObjects.put(id, rulesObj);
		  area.setRulesObj(rulesObj);
		  if(parse)
			  rulesObj.parse();
	  }else{
		  String pid = (String)data.get(ConversionConstant.PARENTID);
		  rulesObj = rulesObjects.get(pid);
		  if(rulesObj != null){
			  rulesObj.addRange(area);
			  area.setRulesObj(rulesObj);
			  if(parse)
				  rulesObj.parse4Range(area);
		  }
	  }
	  
	  areaManager.startListeningArea(info, area, area);
  }
  
  public void addComments(Comments commentsObj)
  {
	  comments.put(commentsObj.getId(), commentsObj);
  }

  public void deleteComments(Object id)
  {
	  comments.remove(id);
  }
  
  public Map<String, Comments> getComments()
  {
	  return comments;
  }
  
  /**
   * merge the cells between sCIndex and eCIndex column for each row between sRIndex and eRIndex
   * 
   * @param {sRIndex,eRIndex,sCIndex,eCIndex} 1-based
   */
  public void mergeCells(String sheetName, int sRIndex, int eRIndex, int sCIndex, int eCIndex)
  {
    if (sRIndex < 0 || eRIndex < 0 || sCIndex < 0 || eCIndex < 0)
    {
      LOG.log(Level.WARNING, "wrong index when apply merge cells");
      return;
    }
    Sheet sheet = this.getSheetByName(sheetName);
    sheet.mergeCells(sRIndex, eRIndex, sCIndex, eCIndex);
  }

  /**
   * split the cells between sCIndex and eCIndex column for each row between sRIndex and eRIndex
   * 
   * @param {sRIndex,eRIndex,sCIndex,eCIndex} 1-based
   */
  public void splitCells(String sheetName, int sRIndex, int eRIndex, int sCIndex, int eCIndex)
  {
    if (sRIndex < 0 || eRIndex < 0 || sCIndex < 0 || eCIndex < 0)
    {
      LOG.log(Level.WARNING, "wrong index when apply split cells");
      return;
    }
    Sheet sheet = this.getSheetByName(sheetName);
    sheet.splitCells(sRIndex, eRIndex, sCIndex, eCIndex);
  }

  /**
   * sort this range according to the sortData
   * 
   * @param ref the parsedRef which need sort
   * @param {sRIndex,eRIndex,sCIndex,eCIndex} 1-based
   * @param sortData    the sort data order and others
   */
  public void sortRange(ParsedRef ref, JSONObject sortData)
  {
    Sheet sheet = getSheetByName(ref.getSheetName());

    if (sheet == null)
    {
      LOG.log(Level.WARNING, "sortRange on an sheet {0} that not exist.", ref.getSheetName());
      return;
    }
    RangeInfo info = ModelHelper.getRangeInfoFromParseRef(ref, sheet.getId());
    sheet.sort(info.getStartRow(), info.getEndRow(), info.getStartCol(), info.getEndCol(), sortData);
    // broadcast sort event
    RangeInfo refValue = new RangeInfo(sheet.getId(), info.getStartRow(), info.getStartCol(), info.getEndRow(), info.getEndCol(), ParsedRefType.RANGE);
    EventSource source = new EventSource(NotifyEvent.ACTION.SORT, NotifyEvent.TYPE.RANGE, refValue);
    source.setData(sortData);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    insertEvent(e);
    EventSource source2 = new EventSource(NotifyEvent.ACTION.SET, NotifyEvent.TYPE.RANGE, refValue);
    NotifyEvent e2 = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source2);
    insertEvent(e2);
    broadcastEventList();
  }

  public void filterRange(ParsedRef ref, JSONObject filterData)
  {
    String rangeIdStr = (String) filterData.get(ConversionConstant.RANGEID);
    Range range = getRangeList().getRangeByUsage(rangeIdStr, RangeUsage.FILTER);
    if (range == null)
    {
      LOG.log(Level.WARNING, "range for filer with range id {0} does not exist when do filter", rangeIdStr);
      return;
    }
    
    String sheetName = ref.getSheetName();
    Sheet sheet = this.getSheetByName(sheetName);
    
    JSONObject rangeData = range.getData();
    JSONObject data = (JSONObject) rangeData.get(ConversionConstant.RANGE_OPTIONAL_DATA);
    if (null == data)
    {
      data = new JSONObject();
      rangeData.put(ConversionConstant.RANGE_OPTIONAL_DATA, data);
    }

    RangeInfo info = range.getRangeInfo();
    //if the filter type is column, means it's old filter
    boolean bNoSupportFilter = range.getType() == ParsedRefType.COLUMN ;
    if(data.containsKey(ConversionConstant.ORIGINAL_ODS_FILTER ))  
    {
    	bNoSupportFilter = Boolean.parseBoolean(data.get(ConversionConstant.ORIGINAL_ODS_FILTER).toString()) ;
    	data.remove(ConversionConstant.ORIGINAL_ODS_FILTER);
    }
    if(data.containsKey(ConversionConstant.ORIGINAL_OOXML_FILTER))
    	data.remove(ConversionConstant.ORIGINAL_OOXML_FILTER);
    //detect if it's contain color filter
    Iterator iter = data.keySet().iterator();
    while(iter.hasNext())
    {
    	Object key = iter.next();
    	Object value = data.get(key);
    	JSONObject rules = null;
    	if(value instanceof JSONObject)
    		rules = (JSONObject) value;
    	if(rules != null && (rules.containsKey(ConversionConstant.COLOR_FILTER) || 
    					rules.containsKey(ConversionConstant.DATE_TIME_FILTER) ||
    					rules.containsKey(ConversionConstant.TOP10_FILTER) ||
    					rules.containsKey(ConversionConstant.DYNAMIC_FILTER)))
    	{
    		bNoSupportFilter = true;
    		break;
    	}
    }	

    //if filter is old filter, here needs first clear all the previous filtered rows
    if(bNoSupportFilter)
    {
    	 sheet.restoreFilteredRows(info);
    	 data.clear();
    }
    int sr = ref.getIntStartRow();
    int er = ref.getIntEndRow();
    int sc = ref.getIntStartCol();
    int ec = ref.getIntEndCol();
    if(bNoSupportFilter || sr!=info.getStartRow() || er!=info.getEndRow() || sc!=info.getStartCol() || ec!=info.getEndCol())
    {
      JSONObject ndata = new JSONObject();
      ndata.put(ConversionConstant.RANGE_USAGE, ConversionConstant.USAGE_FILTER);
      ndata.put(ConversionConstant.RANGEID, range.getId());
      this.updateRange(ref, ndata);
    }
    
    //filter rows or show rows
    JSONArray showRows = (JSONArray)filterData.get(ConversionConstant.ROWS_SHOW);
    if(showRows!=null && showRows.size()>0)
      sheet.filterRows(range.getRangeInfo(), showRows, false, false);
    
    JSONArray hideRows = (JSONArray)filterData.get(ConversionConstant.ROWS_HIDDEN);
    if(hideRows!=null && hideRows.size()>0)
      sheet.filterRows(range.getRangeInfo(), hideRows, true, false);

    //broadcast, the filter event is insert in filterRows
    //because restoreFilteredRows might be called by notify event which can not explicitly call it
    broadcastEventList();
    
    //Update filter rule
    Number col = (Number) filterData.get("col");
    if(col==null)
    {
      LOG.log(Level.WARNING, "Invalid filter operation, no column infomation");
      return;
    }
    int iCol = col.intValue();
    if(iCol==0)
      return;
    String sCol = String.valueOf(iCol);
    Number clear = (Number) filterData.get("clear");
    Object set = filterData.get("set");
    //here set could be null, means remove the rule
    if(clear!=null || filterData.containsKey("set"))
    {
      data.remove(sCol);
      if(set!=null)
        data.put(sCol,set);
    }
    else
    {
      JSONObject rule = (JSONObject)data.get(sCol);
      JSONArray add = (JSONArray)filterData.get("add");
      if(add!=null && add.size()>0)
      {
        if(rule==null)
        {
          rule = new JSONObject();
          rule.put("keys", new JSONArray());
          data.put(String.valueOf(iCol),rule);
        }
        JSONArray keys = (JSONArray)rule.get("keys");
        keys.addAll(add);
      }
      JSONArray del = (JSONArray) filterData.get("del");
      if(del!=null && del.size()>0 && rule!=null)
      {
        JSONArray keys = (JSONArray)rule.get("keys");
        Set<String> keyset = new HashSet<String>();
        for(int i=0;i<keys.size();i++)
          keyset.add((String)keys.get(i));
        for(int i=0;i<del.size();i++)
          keyset.remove(del.get(i));
        
        keys.clear();
        keys.addAll(keyset);
      }
    }
   
  }
  
  public void cutRange(ParsedRef parsedRef, JSONObject data)
  {
    Sheet sheet = this.getSheetByName(parsedRef.getSheetName());
    int sheetId = sheet.getId();
    RangeInfo info = ModelHelper.getRangeInfoFromParseRef(parsedRef, sheetId);
    int sRIndex = info.getStartRow();
    int eRIndex = info.getEndRow();
    int sCIndex = info.getStartCol();
    int eCIndex = info.getEndCol();
    sheet.cutRange(sRIndex, eRIndex, sCIndex, eCIndex, data);
    //TODO: remove usage param when support c/p of CF
    removeRangesByUsage(info, RangeUsage.DATA_VALIDATION);
    deleteCommentsInRange(info);
    //broadcast
    RangeInfo refValue = new RangeInfo(sheet.getId(), sRIndex, sCIndex, eRIndex, eCIndex, ParsedRefType.RANGE);
    EventSource source = new EventSource(NotifyEvent.ACTION.SET, NotifyEvent.TYPE.RANGE, refValue);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    insertEvent(e);
    broadcastEventList();
  }

  @SuppressWarnings("unchecked")
  public void setChart(String chartId, JSONObject data)
  {
    final ChartDocument chart = this.getChart(chartId);
    if (chart == null)
    	return;
    
    JSONObject settings = (JSONObject) data.get("settings");
    if(settings==null)
    	return;
    
    chart.set(settings);
  }
  /********************************************* Cell ************************************/
  /**
   * set cell data, including value and style
   */
  public void setCell(ParsedRef ref, JSONObject data)
  {
    if(!ref.isValid())
      return;
    // invalid data json, ignore it
    if (data.isEmpty())
      return;
    Sheet sheet = getSheetByName(ref.getSheetName());
    
    JSONObject cellData = (JSONObject) data.remove("cell");
    if (cellData.containsKey(ConversionConstant.COLSPAN))
    {
      JSONObject rows = new JSONObject();
      data.put(ConversionConstant.ROWS, rows);
      JSONObject row = new JSONObject();
      rows.put(String.valueOf(ref.getIntStartRow()), row);
      JSONObject cells = new JSONObject();
      row.put(ConversionConstant.CELLS, cells);
      cells.put(ref.getStartCol(), cellData);

      Object v = cellData.get(ConversionConstant.COLSPAN);
      int colspan = ((Number) v).intValue();
      StringBuilder sb = new StringBuilder();
      if (ref.getSheetName() != null)
      {
        sb.append(ref.getSheetName()).append('.'); //
      }
      sb.append(ref.getStartCol()).append(ref.getStartRow()).append(':');
      int endColumn = ref.getIntStartCol() + colspan - 1;
      sb.append(ReferenceParser.translateCol(endColumn));
      sb.append(ref.getStartRow());
      ref = ReferenceParser.parse(sb.toString());

      new SetRangeHelper(this).applySetRangeMessage(ref, data);
    }
    else
    {
      boolean isReplace = Boolean.TRUE.equals(data.get(ConversionConstant.IS_REPLACE));
      
      // set cell in place
      if(sheet == null)
        return;
      if(sheet == null)
        return;
      Position pos = ModelHelper.search(sheet.getRows(), ref.getIntStartRow());
      Row row;
      if (pos.isFind)
      {
        int index = pos.index;
        index = ModelHelper.split(sheet.getRows(), index, ref.getIntStartRow());
        row = sheet.getRows().get(index);
      }
      else
      {
        row = sheet.createRow(ref.getIntStartRow());
        ModelHelper.insert(sheet.getRows(), row);
      }
      
      // for value and link
      Object value = cellData.get(ConversionConstant.VALUE); 
      Object link = cellData.get(ConversionConstant.LINK);
      if (isReplace)
      {
        ValueCell vc = row.getValueCell(ref.getIntStartCol());
        if (vc == null)
        {
          if (value != null || link != null)
          {
            vc = row.createValueCell(ref.getIntStartCol(), value);
            vc.setLink((String) link);
            ModelHelper.insert(row.getValueCells(), vc);
          }
          // else, no value cell, no values set, do nothing
        }
        else
        {
          vc.setValue(value, true);
          vc.setLink((String) link);
        }
      }
      else
      {
        if (value != null || link != null)
        {
          ValueCell vc = row.getValueCell(ref.getIntStartCol());
          if (vc == null)
          {
            vc = row.createValueCell(ref.getIntStartCol(), value);
            if (link != null)
              vc.setLink((String) link);
            else
            {
              if (ModelHelper.isValidURL(value))
                vc.setLink((String) value);
            }
            ModelHelper.insert(row.getValueCells(), vc);
          }
          else
          {
            String oldLink = vc.getLink();
            if (value != null)
            {
              vc.setValue(value, true);
              // if clear cell's value then the do not need to preserve the link anymore
              if (value instanceof String)
              {
                String v = (String) value;
                if (v.length() == 0)
                  oldLink = null;
              }
            }

            if (link != null)
              vc.setLink((String) link);
            else
            {
              if (oldLink == null)
              {
                if (ModelHelper.isValidURL(value))
                  vc.setLink((String) value);
              }
              else
                vc.setLink(oldLink);
            }
          }
        }
        // else, no value needs to set, do nothing
      }

      // for styles
      Object styleObj = cellData.get(ConversionConstant.STYLE);
      pos = ModelHelper.search(row.getStyleCells(), ref.getIntStartCol());
      StyleCell sc;
      if (pos.isFind)
      {
        int index = pos.index;
        index = ModelHelper.split(row.getStyleCells(), index, ref.getIntStartCol());
        sc = row.getStyleCells().get(index);
      }
      else
      {
        sc = row.createStyleCell(ref.getIntStartCol());
        ModelHelper.insert(row.getStyleCells(), sc);
      }
      
      if (styleObj == null)
      {
        if (isReplace)
        {
          sc.setStyle(styleManager.getDefaultCellStyle());
        }
        // else, do nothing
      }
      else
      {
        JSONObject so = (JSONObject) styleObj;

        if (isReplace)
        {
          sc.setStyle(styleManager.addStyle(so));
        }
        else
        {
          if (sc.getStyle() == null)
          {
            pos = ModelHelper.search(sheet.getColumns(), ref.getIntStartCol());
            if (pos.isFind)
            {
              Column column = sheet.getColumns().get(pos.index);
              if (column.getStyle() != null)
              {
                sc.setStyle(styleManager.changeStyle(column.getStyle(), so));
              }
              else
              {
                sc.setStyle(styleManager.addStyle(so));
              }
            }
            else
            {
              sc.setStyle(styleManager.addStyle(so));
            }
          }
          else
          {
            sc.setStyle(styleManager.changeStyle(sc.getStyle(), so));
          }
        }
      }
    }
    //broadcast
    RangeInfo refValue = new RangeInfo(sheet.getId(), ref.getIntStartRow(), ref.getIntStartCol(), ref.getIntStartRow(), ref.getIntStartCol(), ParsedRefType.RANGE);
    EventSource source = new EventSource(NotifyEvent.ACTION.SET, NotifyEvent.TYPE.RANGE, refValue);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    insertEvent(e);
    broadcastEventList();
  }

  public IDManager getIDManager()
  {
    return this.idManager;
  }

  public StyleManager getStyleManager()
  {
    return this.styleManager;
  }

  public RangeList<String> getRangeList()
  {
    if (null == this.rangeList)
    {
      this.rangeList = new RangeList<String>(this);
      this.rangeList.startListening(this);
    }
    return this.rangeList;
  }
  
  public boolean hasACL()
  {
    return this.getRangeList().hasValidACLRanges();
  }
  
  public ViewSetting getViewManager()
  {
	return this.viewManager;
  }
  
  public ReferenceList getReferenceList()
  {
    if (null == this.referenceList)
    {
      this.referenceList = new ReferenceList(this);
      this.referenceList.startListening(this);
    }
    return this.referenceList;
  }
  
  public AreaManager getAreaManager()
  {
    if(null == areaManager)
    {
      areaManager = new AreaManager(this);
      areaManager.startListening(this);
    }
    return areaManager;
  }

  public PreserveManager getPreserveManager()
  {
    if (preserveManager == null)
    {
      preserveManager = new PreserveManager(this);
    }

    return preserveManager;
  }

  public RecoverManager getRecoverManager()
  {
    if (recoverManager == null)
    {
      recoverManager = new RecoverManager(this);
    }
    return recoverManager;
  }

  /*
   * get all the sheets in this document
   */
  public List<Sheet> getSheets()
  {
    return this.sheets;
  }

  public Sheet getSheetByName(String sheetName)
  {
    return idManager.getSheetNameMap().get(sheetName);
  }

  public Sheet getSheetById(int sheetId)
  {
    return idManager.getSheetIdMap().get(sheetId);
  }
  public List<Integer> getSheetIdRanges(int sheetId, int endSheetId)
  {
    List<Integer> ret = new ArrayList<Integer>();
    Sheet sheet = getSheetById(sheetId);
    Sheet endSheet = getSheetById(endSheetId);
    if (sheet != null && endSheet != null)
    {
      int beginindex = sheet.getIndex(); 
      int endindex = endSheet.getIndex();
      if (beginindex <= endindex)
      {
        for (int i = beginindex; i <= endindex; i++)
        {
          Sheet s = this.getSheets().get(i-1);
          ret.add(s.getId());
        }
        return ret;
      }
    }
    return ret;
  }

  public int getNextSheetId(int sheetId)
  {
    Sheet sheet = getSheetById(sheetId);
    if (sheet != null)
    {
      int beginindex = sheet.getIndex() - 1; 
      if (beginindex < this.getSheets().size() - 1)
      {
        Sheet s = this.getSheets().get(beginindex + 1);
        return s.getId();
      }
    }
    return -1;
  }

  public int getPrevSheetId(int sheetId)
  {
    Sheet sheet = getSheetById(sheetId);
    if (sheet != null)
    {
      int endindex = sheet.getIndex() - 1; 
      if (endindex > 0)
      {
        Sheet s = this.getSheets().get(endindex - 1);
        return s.getId();
      }
    }
    return -1;
  }

  public DocumentVersion getVersion()
  {
    return version;
  }

  public void setVersion(DocumentVersion version)
  {
    this.version = version;
  }
  
  public boolean isCSV()
  {
    return isCSV;
  }

  public void setIsCSV(boolean isCSV)
  {
    this.isCSV = isCSV;
  }

  public boolean isDate1904() {
	 return isDate1904;
  }

  public void setIsDate1904(boolean date1904) {
	  this.isDate1904 = date1904;
  }

  public boolean isCalculated()
  {
    return calculated;
  }

  public void setCalculated(boolean calculated)
  {
    this.calculated = calculated;
  }

  public ModelHelper.SerializableStringIdConvertor getIdConvertor()
  {
    return idConvertor;
  }

  public int getDefaultColumnWidth()
  {
    return defaultColumnWidth;
  }

  public void setDefaultColumnWidth(int defaultColumnWidth)
  {
    this.defaultColumnWidth = defaultColumnWidth;
  }

  public String getLocale()
  {
    return locale;
  }

  public void setLocale(String locale)
  {
    this.locale = locale;
  }

  public static void reportMemory()
  {
    if (LOG.isLoggable(Level.FINE))
    {
      Runtime rt = Runtime.getRuntime();
      LOG.log(Level.WARNING, "memory used: {0}", rt.totalMemory() - rt.freeMemory());
    }
  }

  public void checkDefaultStyle(ParsedRef parsedRef, JSONObject data)
  {
    if (null == data)
      return;
    PreserveManager pm = this.getPreserveManager();
    // undo set default style
    if (null != data.get(ConversionConstant.UNDO_DEFAULT))
    {
      pm.deleteDefaultStyleRange(parsedRef);
      return;
    }
    boolean setDefault = false;
    if (ParsedRefType.CELL == parsedRef.type)
    {
      JSONObject cell = (JSONObject) data.get("cell");
      JSONObject style = null;
      if (null != cell)
        style = (JSONObject) cell.get(ConversionConstant.STYLE);
      String styleId = null;
      if (null != style)
        styleId = (String) style.get("id");
      if (null != styleId && styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))
        setDefault = true;
    }
    else
    {
      JSONObject style = (JSONObject) data.get(ConversionConstant.STYLE);
      String styleId = null;
      if (null != style)
        styleId = (String) style.get("id");
      if (null != styleId && styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))
        setDefault = true;
    }
    if (setDefault)
      pm.addDefaultStyleRange(parsedRef);
  }
  
  void recoverRulesObjects(int sheetId, Document recoverDoc)
  {
	  Set<String> keys = recoverDoc.rulesObjects.keySet();
	  Object[] keysArray = keys.toArray();
	  for(int i = keysArray.length - 1; i >= 0; i --)
	 {
		  RulesObj rulesObj = recoverDoc.rulesObjects.get((String)keysArray[i]);
		 List<SharedFormulaRef4RulesObj> l = rulesObj.ranges();
		 SharedFormulaRef4RulesObj range = l.get(0);
		 if(range.getSheetId() == sheetId)
		 {
			 this.addRulesObj(rulesObj);
			 recoverDoc.removeRulesObj(rulesObj.getId());
		 }
	 }
  }

  void backupRulesObjects(int sheetId, Document mainDoc)
  {
	 Set<String> keys = mainDoc.rulesObjects.keySet();
	 Object[] keysArray = keys.toArray();
	 for(int i = keysArray.length - 1; i >= 0; i --)
	 {
		 RulesObj rulesObj = mainDoc.rulesObjects.get((String)keysArray[i]);
		 List<SharedFormulaRef4RulesObj> l = rulesObj.ranges();
		 SharedFormulaRef4RulesObj range = l.get(0);
		 if(range.getSheetId() == sheetId)
		 {
			 this.addRulesObj(rulesObj);
			 mainDoc.removeRulesObj(rulesObj.getId());
		 }
	 }
  }
  
  /**
   * Used for recover manager to backup the sheet content and referred style from mainDoc
   * 
   * @param st
   *          the will be delete sheet
   */
  void backupSheet(Sheet st)
  {
    // add sheet content
    sheets.add(st);
    Document mainDoc = st.getParent();
    // add sheet referred style and remove the style ref count from the main document style manager
    List<Row> rows = st.getRows();
    StyleManager mainStyleManager = mainDoc.getStyleManager();
    for (int i = 0; i < rows.size(); i++)
    {
      Row row = rows.get(i);
      // remove style reference count from main doc, and add this style to style manager
      List<StyleCell> sCells = row.getStyleCells();
      int size = sCells.size();
      for (int j = 0; j < size; j++)
      {
        StyleCell cell = sCells.get(j);
        StyleObject style = cell.getStyle();
        // if the recover doc styleManager does not contain such style,
        // it will create a new style which has the same hashcode as style, but different instance
        // so should set the new style to styleCell so that it can serialize the right style with style id
        StyleObject newStyle = styleManager.addStyle(style);
        cell.setStyle(newStyle);
      }
    }
    List<Column> cols = st.getColumns();
    for(int i = 0; i < cols.size(); i++)
    {
      Column col = cols.get(i);
      StyleObject style = col.getStyle();
      StyleObject newStyle = styleManager.addStyle(style);
      col.setStyle(newStyle);
    }
    // postpone set parent until serialize
    // set sheet parent to the recover document
    // st.parent = this;
  }

  /**
   * Used for recover manager to recover the sheet content and referred style to the mainDoc
   * 
   * @param sheet
   *          the sheet instance
   * @param sheetName
   *          the insert sheet name for sheet
   * @param sheetIndex
   *          the insert sheet index for sheet
   * @param recoverDoc
   */
  public void recoverSheet(Sheet sheet, String sheetName, int sheetIndex, Document recoverDoc)
  {
    sheet.setSheetName(sheetName);
    sheet.setVisibility(null);
    sheets.add(sheetIndex - 1, sheet);
    List<Row> rows = sheet.getRows();
    for (int i = 0; i < rows.size(); i++)
    {
      Row row = rows.get(i);
      // remove style reference count from main doc, and add this style to style manager
      List<StyleCell> sCells = row.getStyleCells();
      int size = sCells.size();
      for (int j = 0; j < size; j++)
      {
        StyleCell cell = sCells.get(j);
        StyleObject style = cell.getStyle();
        // newStyle and style might not be the same style instance
        // so set the newStyle to styleCell
        StyleObject newStyle = styleManager.addStyle(style);
        cell.setStyle(newStyle);
      }
    }
    List<Column> cols = sheet.getColumns();
    for(int i = 0; i < cols.size(); i++)
    {
      Column col = cols.get(i);
      StyleObject style = col.getStyle();
      StyleObject newStyle = styleManager.addStyle(style);
      col.setStyle(newStyle);
    }
    recoverDoc.sheets.remove(sheet);
    sheet.parent = this;
  }
  
  /**
   * Recover the reference refered by recover doc to the main doc
   * Notice that the references refer to the sheet in main doc, rather than recover doc
   * so we should recover these references from unname ranges in main doc to references in reference list
   * @param sheet
   */
  public void recoverOuterRefFromUnNameRange(Sheet sheet)
  {
    if(sheet != null)
    {
      int sheetId = sheet.getId();
      
      AreaManager areaMgr = getAreaManager();
      AreaManager recAreaMgr = null;
      Document recoverDoc = getRecoverManager().getRecoverDoc();
      if(recoverDoc != null)
        recAreaMgr = recoverDoc.getAreaManager();
      
      List<Row> rows = sheet.getRows();
      for(int i = 0; i < rows.size(); i++)
      {
        Row row = rows.get(i);
        List<ValueCell> vCells = row.getValueCells();
        int size = vCells.size();
        for(int j = 0; j < size; j++)
        {
          ValueCell vc = vCells.get(j);
          FormulaCell cell = vc.getFormulaCell();
          boolean bUpdate = false;
          if(cell != null)
          {
            for(int m = 0; m < cell.getTokenList().size(); m++)
            {
              FormulaToken token = cell.getTokenList().get(m);
              Area tokenArea = token.getArea();
              if(token.getType() == TokenType.RECREF)
              {
                RecoverReferenceToken rrToken = (RecoverReferenceToken)token;
                Range<String> r = this.getRangeList().getRangeByUsage(rrToken.getRefName(), RangeUsage.RECOVER_REFERENCE);
                if(r != null)
                {
                  int sId = sheetId;
                  //update it to reference token according to unname range address
                  bUpdate = true;
                  String refName = token.getChangeText();
                  ParsedRef parsedRef = r.getParsedRef();
                  
                  if(parsedRef != null && parsedRef.sheetName != null)
                  {
                    Sheet s = getSheetByName(parsedRef.sheetName);
                    if(s != null)
                      sId = s.getId();
                  }
                  
                  Area area = null;
                  //if r is invalid, getParsedRef will return null, but private attribute "address" in r has the right address with #REf!
                  if(parsedRef == null ||  !parsedRef.isValid())
                  {
                    parsedRef = ReferenceParser.parse(r.getAddress());
//                    ref = new Reference(this, parsedRef, sheet.getSheetName(), true);//just get the patternMask
//                    ref.setId(refList.generateId());
//                    ref.updateAddress(parsedRef, sheet.getSheetName());
                    if(this.getSheetById(r.sheetId) == null)//the sheet of reference has been deleted
                    {
                      //ref address with the invalid sheet name, it means that the ref sheet has also been delete
                      //but it might be in the recovered document which might be recovered later
                      sId = r.sheetId;
                      if(recAreaMgr != null)
                        area = recAreaMgr.startListeningArea(ModelHelper.getRangeInfoFromParseRef(parsedRef, sId), cell, null);
                    }else
                      area = areaMgr.startListeningArea(ModelHelper.getRangeInfoFromParseRef(parsedRef, sId), cell, null);
                  }
                  
                  if(area == null)
                    area = areaMgr.startListeningArea(ModelHelper.getRangeInfoFromParseRef(parsedRef, sId), cell, null);
                  ReferenceToken refToken = new ReferenceToken(this);
                  refToken.setIndex(token.getIndex());
                  refToken.setType(TokenType.RANGE);
                  refToken.setArea(area);
                  refToken.setText(rrToken.getRefValue());//original reference address
                  refToken.setChangeText(parsedRef.getAddress(false));//updated reference address
                  refToken.setRefMask(parsedRef.patternMask);
//                  if(!refToken.isValid())
//                    refToken.setError(ERRORCODE.INVALID_REF);
                  cell.getTokenList().set(m, refToken);//update the RECREF token to reference token
                }
              }else if(tokenArea != null && tokenArea.getSheetId() == sheetId)
              {
                ReferenceToken rToken = (ReferenceToken)token;
                rToken.setDocument(this);
              }
            }
          }
          if(bUpdate)
          {
            vc.updateFormula();
            cell.setDirty(true);//the cell in the will be recovered sheet refer to other sheet in main doc which content might be changed
          }
        }
      }
    }
  }
  public void setDraftDescriptor(DraftDescriptor dd)
  {
    draftDesc = dd;
  }

  public DraftDescriptor getDraftDescriptor()
  {
    return draftDesc;
  }

  public ContentRowDeserializer getContentRowDeserializer()
  {
    return contentRowDeserializer;
  }

  public void setContentRowDeserializer(ContentRowDeserializer contentRowDeserializer)
  {
    this.contentRowDeserializer = contentRowDeserializer;
  }

  
  public void insertEvent(NotifyEvent event)
  {
    eventList.add(event);
  }
  
  public void broadcastEventList()
  {
    for(int i = 0; i < eventList.size(); i++)
    {
      NotifyEvent event = eventList.get(i);
      broadcast(event);
    }
    eventList.clear();
  }
  
  ///////////////////////Customize method for nodejs
  /**
   * decompose the document model for node.js
   */
  public synchronized void decompose()
  {
    for (int i = 0; i < sheets.size(); i++)
    {
      Sheet sheet = sheets.get(i);
      Map<Integer, Map<Integer, FormulaCell>> fCells = sheet.getFormulaCellsMap();
      if (fCells != null)
      {
        fCells.clear();
        fCells = null;
      }

      List<Row> rows = sheet.getRows();
      for (int j = 0; j < rows.size(); j++)
      {
        Row row = rows.get(j);
        row.decompose();
        row = null;
      }
      rows.clear();
      rows = null;

      List<Column> cols = sheet.getColumns();
      for (int j = 0; j < cols.size(); j++)
      {
        Column col = cols.get(j);
        col = null;
      }
      cols.clear();
      cols = null;
    }
    this.sheets = null;
    this.areaManager.decompose();
    this.areaManager = null;
    this.idManager.decompose();
    this.idManager = null;
    this.styleManager = null;
    this.preserveManager = null;
    this.recoverManager = null;
    this.rangeList = null;
    this.referenceList = null;
    this.charts = null;
    this.version = null;
    this.idConvertor = null;
    this.locale = null;
    this.draftDesc = null;
    System.gc();

  }

  /**
   * return all value cells for node.js
   * @return
   */
  public List<ValueCell> getAllValueCells(){
      ArrayList<ValueCell> result = new ArrayList<ValueCell>();
      for(int i=0;i<getSheets().size();i++){
          Sheet sheet =  getSheets().get(i);
          for(int j=0;j<sheet.getRows().size();j++){
              Row row = sheet.getRows().get(j);
              int size = row.getValueCells().size();//do this for swap in
              result.addAll(row.getValueCells());
          }
      }

      return result;
  }
  
  @SuppressWarnings("unchecked")
  public ValueCell[] getDirtyCells(){
    final ArrayList<ValueCell> result = new ArrayList<ValueCell>();
    final IDManager idMan = getIDManager();
    for(int i=0;i<getSheets().size();i++){
        final Sheet sheet =  getSheets().get(i);
        switch(ModelIOFactory.LOAD_MODE)
        {
          case ALL:
            for(int j=0;j<sheet.getRows().size();j++){
              Row row = sheet.getRows().get(j);
              List<ValueCell> cells = row.getValueCells();
              int size = cells.size();//do this for swap in
              for(int m = 0; m < size; m++)
              {
                ValueCell vc = cells.get(m);
                FormulaCell fc = vc.getFormulaCell();
                if(fc != null && fc.isDirty())
                  result.add(vc);
              }
            }
            break;
          case CELLS_AS_STREAM :
            for (int j = 0; j < sheet.getRows().size(); j++)
            {
              final Row row = sheet.getRows().get(j);
              Map cells = row.getRowFormulaCellsMap();
              if(cells != null && cells.size() > 0){
                List<ValueCell> vCells = row.getValueCells();
                for(int m = 0; m < vCells.size(); m++)
                {
                  ValueCell vc = vCells.get(m);
                  FormulaCell fc = vc.getFormulaCell();
                  if(fc != null && ( fc.isDirty() || (vc.getCalcValue() == null) )){
                    vc.getInfo();//get the public info field which is used directly by nodejs
                    result.add(vc);
                  }
                }
              }
            }
            break;
          case ROWS_AS_STREAM:
            Map rowCells = sheet.getFormulaCellsMap();
            ModelHelper.iterateMap(rowCells, new ModelHelper.IMapEntryListener<Integer, Map>()
            {
              public boolean onEntry(Integer rowId, Map cells)
              {
                final Row row = sheet.getRow(idMan.getRowIndexById(sheet.getId(), rowId));
                ModelHelper.iterateMap(cells, new ModelHelper.IMapEntryListener<Integer, FormulaCell>()
                {
                  public boolean onEntry(Integer colId, FormulaCell cell)
                  {
                    ValueCell vc = row.getValueCell(idMan.getColIndexById(sheet.getId(), colId));
                    if(vc.getFormulaCell().isDirty())
                      result.add(vc);
                    return false;
                  }
                });
                return false;
              }

            });
            break;
        }
    }
    ValueCell[] cells = new ValueCell[result.size()];
    result.toArray(cells);
    return cells;
  }
  
  /**
   * get the cell model at the rowIndex and colIndex
   * TODO: what about StyleCell
   * @param sheetId 
   * @param rowIndex    1-based
   * @param colIndex    1-based
   * @return cell model
   */
  public ValueCell getCell(int sheetId, int rowIndex, int colIndex){
    ValueCell cell = null;
    Sheet sheet = this.getSheetById(sheetId);
    if(sheet != null)
      cell = sheet.getCell(rowIndex, colIndex);
    return cell;  
  
  }
  
  /**
   * get the cells array of the given range
   * @param sheetId 
   * @param sr 1-based
   * @param sc
   * @param er
   * @param ec
   * @return
   */
  public ValueCell[] getCells(int sheetId, int sr, int sc, int er, int ec){
    ValueCell[] cells = new ValueCell[0];
    Sheet sheet = this.getSheetById(sheetId);
    if(sheet != null)
      cells = sheet.getCells(sr, sc, er, ec);
    return cells;
  }

  /**
   * get the two dimension array of the given range by row
   * if there is empty cells should use null to take space
   * @param sheetId
   * @param sr  1-based
   * @param sc
   * @param er
   * @param ec
   * @return
   */
  public ValueCell[][] getCellsByRow(int sheetId, int sr, int sc, int er, int ec, boolean bOptimize){
    ValueCell[][] cells = new ValueCell[0][];
    Sheet sheet = this.getSheetById(sheetId);
    if(sheet != null)
      cells = sheet.getCellsByRow(sr, sc, er, ec, bOptimize);
    return cells;
  }
  
  public String getDraftDir()
  {
    return draftDir;
  }

  public void setDraftDir(String draftDir)
  {
    this.draftDir = draftDir;
  }

  public void setDir(String sheetName, String dir)
  {
    Map<String, Sheet> sheetNameMap = this.idManager.getSheetNameMap();
    Sheet sheet = sheetNameMap.get(sheetName);
    if (null != sheet)
      sheet.setDir(dir);
  }

  public boolean isValid()
  {
    Map<String, Sheet> sheetNameMap = this.idManager.getSheetNameMap();
    int visibleSheetNum = 0;
    Iterator<Map.Entry<String, Sheet>>  iter = sheetNameMap.entrySet().iterator();
    while(iter.hasNext())
    {
      Map.Entry<String, Sheet> entry = iter.next();
      Sheet sheet = entry.getValue();
      if(sheet != null && 
         (sheet.getVisibility()==null || sheet.getVisibility().equalsIgnoreCase("visible")) )
      {
        visibleSheetNum++;
      }
    }
    // SheetNameMap.size != SheetIdMap.size means the some sheetnames are duplicated
    if (this.idManager.getSheetNameMap().size() != this.idManager.getSheetIdMap().size() 
        || visibleSheetNum == 0)
      return false;
    else 
      return true;
  }

}
