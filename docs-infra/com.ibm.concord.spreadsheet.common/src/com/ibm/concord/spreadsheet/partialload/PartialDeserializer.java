/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Filter;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.JsonToken;
import org.codehaus.jackson.util.TokenBuffer;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.DocumentFeature;
import com.ibm.concord.spreadsheet.common.DocumentVersion;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaError;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaLexer;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaParsedRef;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaRefParser;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaToken;
import com.ibm.concord.spreadsheet.common.utils.CommonUtils;
import com.ibm.concord.spreadsheet.common.utils.FormulaPrioritizer;
import com.ibm.concord.spreadsheet.common.utils.StreamBuilder;
import com.ibm.concord.spreadsheet.partialload.MapHelper.IMapEntryListener;
import com.ibm.concord.spreadsheet.partialload.reference.NRJSPartialReference;
import com.ibm.concord.spreadsheet.partialload.reference.PartialReference;
import com.ibm.concord.spreadsheet.partialload.serialize.IValueHandler;
import com.ibm.concord.spreadsheet.partialload.serialize.IValueHandlerResult;
import com.ibm.concord.spreadsheet.partialload.serialize.IValueHandlerResult.OPERATION;
import com.ibm.concord.spreadsheet.partialload.serialize.impl.DefaultValueHandler;
import com.ibm.concord.spreadsheet.partialload.serialize.impl.SerializationUtils;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.json.java.OrderedJSONObject;

public class PartialDeserializer
{
  private static final Logger LOG = Logger.getLogger(PartialDeserializer.class.getName());

  // special index value when collecting range id, indicating that the id is null in reference object
  public static final int ID_IS_NULL = -255;

  private static final String CRITERIA_SHEET = "sheet";
  
  private static final String COMMENTS_JSON_FILE = "comments.json";
  private static final String COMMENTS_JS_FILE = "comments.js";
  private static final String RESERVED_HERF = "Reserved";
  private static final String PAGE_SETTINGS_FILE = "page-settings.js";

  private static final String CRITERIA_SHEET_FIRST = "first";

  // flag indicates if we need to collect impact cells (1st level) of the criteria sheet
  private static final boolean ENABLE_COLLECT_IMPACT_CELLS = true;

  // set true to ignore all impact cells in criteria sheet, irrelevant the criteria rows that PD has set
  public static boolean IGNORE_IMPACT_CELLS_IN_CRITERIA_SHEET = true;

  private static Pattern RECREF_PATTERN = Pattern.compile("(rf\\d+)");

  private static final String FORMULAREGEX = "(^=[\\w\\W]+)|(^\\{=.+\\}$)";

  private static final Pattern pattern = Pattern.compile(FORMULAREGEX);

  private static final List<String> CHART_ROLES;

  static
  {
    CHART_ROLES = Arrays.asList(ConversionConstant.X_VALUES, ConversionConstant.Y_VALUES, ConversionConstant.VALUES,
        ConversionConstant.LABEL, ConversionConstant.CATEGORIES);
  }
  
  private JSONObject criteria;

  private int criteriaStartRow, criteriaEndRow;

  private String criteriaSheetId;

  // all rows that needs to be collected as a criteria row, if all rows needs to be collected, it is set to null
  private Set<String> criteriaRowIdSet;

  private JsonParser contentJp;

  /**
   * For access from {@link PartialReference}
   */
  public JSONObject metaObject;

  private Map<String, String> sheetName2Id;
  private Map<String, String> sheetId2Name;
  private Map<String, Integer> sheetName2Index;

  private JSONArray chartRefs;

  private List<IDMFormulaParsedRef> nrjschartRefs;

  private String draftRootUri;

  private JSONObject partMetaObject, partMetaSheetsObject;

  /**
   * For access from {@link PartialReference}
   */
  public JSONObject partContentObject;

  private PartialReference partialReference;

  private NRJSPartialReference nrjspartialReference;

  private boolean isNRJSMode;

  /**
   * For access from {@link PartialReference}
   */
  public RowColIdIndexMeta rowColIdIndexMeta;

  private boolean isFirstLoading;

  private TokenBuffer nameRangeBuffer, stylesBuffer;

  private JSONObject nameRangeObject;

  private Map<String, TokenBuffer> sheetsBuffer;

  private Set<String> styleIdSet;

  // styles with boolean format category
  private Set<String> booleanStyleIdSet;

  // named range that references to current criteria sheet
  private Set<String> nameRangeSet;

  private AbstractJsonGeneratorListener stylesListener, cellListener, unnamedRangeListener;

  // max column index listener
  private MaxColumnIndexListener maxciListener;

  private PartialSheetsArray partSheetsArray;

  private DocumentVersion documentVersion;

  // max column index of criteria sheet
  private int maxColumnIndex;

  // total content rows defs in content.js for criteria sheet, and
  // criteria row loaded in content.js
  private int criteriaContentRowCount, allContentRowCount;

  // gather cell reference information.
  private CellCollector cellCollector, impactCellsCollector;

  // if in the state of getting more content, don't get referenced cell that in
  // the same criteria sheet since they are duplicated content in client side,
  // also mess client side loading process
  private boolean isGettingMoreContent;

  private boolean initialized;

  private boolean hasMoreContent;
  
  private StreamBuilder streamer;

  public PartialDeserializer()
  {
    isFirstLoading = false;
    isNRJSMode = false;

    sheetsBuffer = new HashMap<String, TokenBuffer>();

    styleIdSet = new HashSet<String>();

    booleanStyleIdSet = new HashSet<String>();

    nameRangeSet = new HashSet<String>();

    sheetName2Id = new HashMap<String, String>();

    sheetId2Name = new HashMap<String, String>();

    sheetName2Index = new HashMap<String, Integer>();

    initialized = false;
    
    streamer = null;
  }

  public JSONObject deserialize() throws Exception
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.entering("PartialDeserializer", "deserialize", new Object[] {});
    }
    // System.out.println("begin deserialize:"+(new Date()).toLocaleString()+" - "+ (System.nanoTime()/1000));

    initCriteria();

    if (criteriaSheetId == null)
    {
      return null;
    }
    // System.out.println("deserialize Criteria:"+criteria.serialize(true));
    
    initPartMetaObject();

    // pre-process content
    // initialize content generator listeners
    // collect styles
    stylesListener = new StyleListener(this);
    // update formula cells
    cellListener = new CellListener(this);
    // get max row and column index in unnamed range defs, will also get the style IDs used by conditional format
    unnamedRangeListener = new UnnamedRangeListener(this);

    JSONObjectGenerator contentGenerator = new JSONObjectGenerator();
    contentGenerator.addListener(stylesListener);
    if (cellListener != null)
    {
      ((CellListener) cellListener).setGenerator(contentGenerator);
      contentGenerator.addListener(cellListener);
    }
    // collect ids in ranges
    if (isFirstLoading)
    {
      contentGenerator.addListener(new IdInRangeListener(this));
      contentGenerator.addListener(new NamedRangeListener(this));
      contentGenerator.addListener(unnamedRangeListener);
    }

    maxciListener = new MaxColumnIndexListener(this);
    contentGenerator.addListener(maxciListener);

    contentGenerator.writeStartObject();
    contentJp.nextToken();
    SerializationUtils.iterateSerializing(contentJp, contentGenerator, new ContentHandler(this));
    partContentObject = contentGenerator.getRootObject();
    // System.out.println("after iterateSerializing:"+(new Date()).toLocaleString()+" - "+ (System.nanoTime()/1000));
    if (nrjspartialReference != null) 
      nrjspartialReference.loadSheetReference(sheetsBuffer);
    // System.out.println("after load reference:"+(new Date()).toLocaleString()+" - "+ (System.nanoTime()/1000));
    if (!initialized && partialReference != null && partialReference.hasUnParsedVRefs())
    {
      partialReference.parseVRefs();
    }
    else if (!initialized && nrjspartialReference != null && nrjspartialReference.hasUnParsedVRefs())
    {
      nrjspartialReference.parseVRefs();
    }

    updateMaxRow();

    if (isNRJSMode)
    {
      collectNRJSCharts();
    }
    else
    {
      collectCharts();
    }
    
    //load comments
    if(isFirstLoading)
    {
    	String path = draftRootUri + File.separator + COMMENTS_JS_FILE;
	    File commentsfile = new File(path);
    	
        if (!commentsfile.exists())
        {
        	path = draftRootUri + File.separator + RESERVED_HERF + File.separator + COMMENTS_JSON_FILE;        
        	commentsfile = new File(path);
        }
        if (commentsfile.exists())
        {
	    	InputStream stream = null;
	        try
	        {
                if (this.streamer != null)
                  stream = this.streamer.getInputStream(path);
                else
                  stream = new FileInputStream(path);
	        	//JSONObject commentsJson = JSONObject.parse(stream);
	        	JSONArray commentsJson = JSONArray.parse(stream);
	        	partContentObject.put("comments", commentsJson);
	        }
	        catch (Exception e)
	        {
	          LOG.log(Level.WARNING, "can not load comments.", e);
	        }
	        finally
	        {
	          try
	          {
	            stream.close();
	          }
	          catch (Exception e)
	          {
	            LOG.log(Level.WARNING, "can not close stream for comments at {0}", path);
	          }
	        }
        }
    }

    if (isNRJSMode)
    {
      collectNRJSReferences();
    }
    else
    {
      collectReferences();
    }

    if (isNRJSMode && ENABLE_COLLECT_IMPACT_CELLS && nrjspartialReference != null && !nrjspartialReference.isEmpty())
    {
      getNameRange("");
      impactCellsCollector = nrjspartialReference.collectImpactCells(criteriaSheetId, criteriaRowIdSet, cellCollector, this);
    }
    else if (ENABLE_COLLECT_IMPACT_CELLS && partialReference != null && !partialReference.isEmpty())
    {
      getNameRange("");
      impactCellsCollector = partialReference.collectImpactCells(criteriaSheetId, criteriaRowIdSet, cellCollector, this);
    }

    if (!isGettingMoreContent)
    {
      Set<String> chartHrefs = ((UnnamedRangeListener) unnamedRangeListener).chartsNotInSheet;
      if (!chartHrefs.isEmpty())
        collectImpactCharts(criteriaSheetId, chartHrefs);
    }
    // System.out.println("before updateContent:"+(new Date()).toLocaleString()+" - "+ (System.nanoTime()/1000));

    updateContent();

    // fill in maxrowindex and maxcolumnindex for current criteria sheet
    // fill maxrowindex
    // other sheet maxrowindex are filled on-the-fly in pre-processing.
    JSONObject sheetObject = (JSONObject) partMetaSheetsObject.get(criteriaSheetId);
    int maxRowIndex = getMaxRowIndex();
    if (maxRowIndex > 0)
    {
      sheetObject.put(ConversionConstant.MAXROWINDEX, maxRowIndex);
    }

    // fill in maxcolumnindex
    int contentMaxColumnIndex = maxciListener.maxColumnIndex;
    if (contentMaxColumnIndex > maxColumnIndex)
    {
      maxColumnIndex = contentMaxColumnIndex;
    }
    int unnamedRangeColumnIndex = ((UnnamedRangeListener) unnamedRangeListener).maxColIndex;
    if (unnamedRangeColumnIndex > maxColumnIndex)
    {
      maxColumnIndex = unnamedRangeColumnIndex;
    }

    if (maxColumnIndex > ConversionConstant.MIN_SHOW_COL_NUM)
    {
      sheetObject.put(ConversionConstant.MAXCOLINDEX, maxColumnIndex);
    }
    else
    {
      // if max column index <= MIN, in the case that sheetObject already has another max column index, we need
      // to overwrite it to a smaller number
      Object o = sheetObject.get(ConversionConstant.MAXCOLINDEX);
      if (o != null)
      {
        int indexInDraft = ((Number) o).intValue();
        if (indexInDraft > ConversionConstant.MIN_SHOW_COL_NUM)
        {
          // re-write to a smaller number
          sheetObject.put(ConversionConstant.MAXCOLINDEX, ConversionConstant.MIN_SHOW_COL_NUM);
        }
      }
    }

    updateStyle();

    partSheetsArray.flush();

    if (isFirstLoading)
    {
      partMetaObject.put("loadedSheet", criteriaSheetId);
      setHasMacro();
    }

    setHasMoreContent();

    JSONObject doc = new JSONObject();

    doc.put(ConversionConstant.META, partMetaObject);
    doc.put(ConversionConstant.CONTENT, partContentObject);
    if (isNRJSMode && nrjspartialReference != null)
    {
      JSONObject ref = nrjspartialReference.getPartRefObj();
      if (ref != null && !ref.isEmpty())
      {
        doc.put(ConversionConstant.REFERENCE, ref);
      }
    }
    else if (partialReference != null)
    {
      JSONObject ref = partialReference.getPartRefObj();
      if (ref != null && !ref.isEmpty())
      {
        doc.put(ConversionConstant.REFERENCE, ref);
      }
    }

    initialized = true;

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.exiting(PartialDeserializer.class.getName(), "deserialize");
    }

    return doc;
  }

  /**
   * <p>
   * Reset the internal state of PD.
   * <p>
   * It is for calling PD twice for partial row get. Caller <em>must</em> call first time to get first N rows, 2nd time to get remaining
   * rows.
   */
  public void reset()
  {
    styleIdSet.clear();
    nameRangeSet.clear();
    sheetName2Id.clear();
    sheetId2Name.clear();
    if (partialReference!=null)
      partialReference.resetPartReferenceObject();
    if (nrjspartialReference!=null) {
      nrjspartialReference.resetPartReferenceObject();
    }

    isFirstLoading = false;
    isNRJSMode = false;
  }

  private void initCriteria()
  {
    criteriaSheetId = criteria == null ? null : (String) criteria.get(CRITERIA_SHEET);

    if (criteriaSheetId == null)
    {
      LOG.log(Level.SEVERE, "deserialization failed, wrong criteria " + criteria + ". returning null.");
    }
    else
    {
      if (CRITERIA_SHEET_FIRST.equals(criteriaSheetId))
      {
        String lastVisitSheet = criteria == null ? null : (String) criteria.get("name");
        String lastId = this.sheetName2Id.get(lastVisitSheet);
        if (lastId != null)
        {
          criteriaSheetId = lastId;
        }
        else
        {
          criteriaSheetId = (String) JSONUtils.findPath(metaObject, new String[] { ConversionConstant.SHEETSIDARRAY, "[0]" })[1];
        }
        // Fix the criteria sheet id in case that the selected creteria sheet is hidden.
        fixCriteriaSheetId();
        isFirstLoading = true;
      }
    }

    criteriaStartRow = criteriaEndRow = -1;

    Object o = criteria.get(ConversionConstant.STARTROW);
    if (o != null)
    {
      criteriaStartRow = ((Number) o).intValue();
    }

    o = criteria.get(ConversionConstant.ENDROW);
    if (o != null)
    {
      criteriaEndRow = ((Number) o).intValue();
    }

    if (criteriaStartRow != -1 || criteriaEndRow != -1)
    {
      JSONArray rowsIdArray = (JSONArray) JSONUtils.findPath(metaObject, new String[] { ConversionConstant.SHEETSARRAY, criteriaSheetId,
          ConversionConstant.ROWSIDARRAY })[2];

      if (rowsIdArray != null)
      {
        int start = criteriaStartRow < 1 ? 0 : criteriaStartRow - 1;
        int end = criteriaEndRow < 1 ? rowsIdArray.size() : Math.min(rowsIdArray.size(), criteriaEndRow);
        if (start == 0 && end == rowsIdArray.size())
        {
          // get full sheet
        }
        else
        {
          criteriaRowIdSet = new HashSet<String>();
          for (int i = start; i < end; i++)
          {
            String id = (String) rowsIdArray.get(i);
            if (StringUtils.isNotEmpty(id))
            {
              criteriaRowIdSet.add(id);
            } // else, empty criteria rows id
          }
        }
      }// else, no rows id array provided
    } // else, collect full criteria sheet

    isGettingMoreContent = false;
    if (criteriaStartRow > 1)
    {
      isGettingMoreContent = true;
    }

    if (partialReference != null)
    {
      isNRJSMode = false;
    } else {
      isNRJSMode = true;
    }

  }

  @SuppressWarnings("unchecked")
  private void initPartMetaObject() throws JsonParseException, IOException
  {
    // construct necessary partMeta
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.entering(PartialDeserializer.class.getName(), "initPartMetaObject");
    }

    if (!initialized)
    {
      // init rowColIdIndexMeta
      rowColIdIndexMeta = new RowColIdIndexMeta((JSONObject) metaObject.get(ConversionConstant.SHEETSARRAY));
    }

    partMetaObject = new JSONObject();
    JSONUtils.copyValue(metaObject, partMetaObject, ConversionConstant.FILE_TYPE_FIELD);
    partMetaSheetsObject = (JSONObject) JSONUtils.copyValue(metaObject, partMetaObject, ConversionConstant.SHEETS);
    JSONUtils.copyValue(metaObject, partMetaObject, ConversionConstant.SHEETSIDARRAY);

    Object[] objs = JSONUtils.copyPath(metaObject, partMetaObject, new String[] { ConversionConstant.SHEETSARRAY, criteriaSheetId });

    partSheetsArray = new PartialSheetsArray((JSONObject) objs[0]);

    int defaultWidth = ConversionConstant.DEFAULT_WIDTH_VALUE;
    Object tmpO = metaObject.get(ConversionConstant.DEFAULT_COLUMN_WIDTH);
    if (tmpO != null)
      defaultWidth = ((Number) tmpO).intValue();

    if (isFirstLoading)
    {
      JSONUtils.copyValue(metaObject, partMetaObject, ConversionConstant.CSV_FLAG);
      JSONUtils.copyValue(metaObject, partMetaObject, ConversionConstant.DATE1904);
      JSONObject rows = (JSONObject) JSONUtils.copyValue(metaObject, partMetaObject, ConversionConstant.ROWS);
      if (rows != null)
      {
        // update row id to meta
        // down to rows.<sheetId>
        MapHelper.iterateMap(rows, new IMapEntryListener<String, JSONObject>()
        {
          public boolean onEntry(final String sheetId, JSONObject sheetRowsMeta)
          {
            // only for sheet which is not the criteria sheet should update row id
            // otherwise it might set the wrong "STARTROW" index for criteria sheet
            if (!sheetId.equals(criteriaSheetId))
            {
              partSheetsArray.settingSheet(sheetId);
              // down to rows.<sheetId>.<rowId>
              MapHelper.iterateMap(sheetRowsMeta, new IMapEntryListener<String, JSONObject>()
              {
                public boolean onEntry(String rowId, JSONObject rowMeta)
                {
                  // collect row id
                  int rowIndex = rowColIdIndexMeta.getRowIndexById(sheetId, rowId);
                  partSheetsArray.setRowId(rowIndex, rowId);
                  return false;
                }
              });
            }

            return false;
          }
        });
      }

      // do 3 things:
      // collect styles in columns
      // update column id to meta
      // calculate max column id, record criteria sheet max column index, record other sheets' to sheets meta
      JSONObject columns = (JSONObject) JSONUtils.copyValue(metaObject, partMetaObject, ConversionConstant.COLUMNS);

      if (columns != null)
      {
        Set<Entry<String, JSONObject>> sheets = columns.entrySet();
        // down to columns.<sheetId>
        for (Iterator sheetIter = sheets.iterator(); sheetIter.hasNext();)
        {
          Entry<String, JSONObject> sheetEntry = (Entry<String, JSONObject>) sheetIter.next();
          String columnSheetId = sheetEntry.getKey();
          partSheetsArray.settingSheet(columnSheetId);
          JSONObject sheet = sheetEntry.getValue();
          Set<Entry<String, JSONObject>> columnSet = sheet.entrySet();

          int maxColIndex = ConversionConstant.MIN_SHOW_COL_NUM;
          boolean isCriteria = columnSheetId.equals(criteriaSheetId);

          // down to columns.<sheetId>.<columnId>
          for (Iterator columnIter = columnSet.iterator(); columnIter.hasNext();)
          {
            Entry<String, JSONObject> columnEntry = (Entry<String, JSONObject>) columnIter.next();
            String columnId = columnEntry.getKey();
            JSONObject column = columnEntry.getValue();
            String sid = (String) column.get(ConversionConstant.STYLEID);
            // collect column style id
            if (sid != null)
            {
              styleIdSet.add(sid);
            }
            int colIndex = rowColIdIndexMeta.getColIndexById(columnSheetId, columnId);
            if (!isCriteria)
            {
              // record column id
              partSheetsArray.setColumnId(colIndex, columnId);
            }

            // compute max column index for criteria sheet
            if (isCriteria)
            {
              int maxci = colIndex;
              Object o = column.get(ConversionConstant.REPEATEDNUM);
              if (o != null)
              {
                Object width = column.get(ConversionConstant.WIDTH);
                if ((width != null && ((Number) width).intValue() != defaultWidth)
                    || (CommonUtils.hasValue(sid) && !sid.equals(ConversionConstant.DEFAULT_CELL_STYLE_NAME)))
                  maxci += ((Number) o).intValue();
              }
              if (maxci > maxColIndex)
              {
                maxColIndex = maxci;
              }
            }
          }

          // record max column index
          if (isCriteria)
          {
            if (maxColIndex > ConversionConstant.MIN_SHOW_COL_NUM)
            {
              if (maxColIndex > ConversionConstant.MAX_SHOW_COL_NUM)
              {
                maxColIndex = ConversionConstant.MAX_SHOW_COL_NUM;
              }
              maxColumnIndex = maxColIndex;
            }
          }
        }
      } // process meta columns done
    } // process first loading meta done
    else
    {
      // for partial load sheet, load all meta rows for criteria sheet
      if (criteriaRowIdSet == null)
      {
        JSONUtils.copyPath(metaObject, partMetaObject, new String[] { ConversionConstant.ROWS, criteriaSheetId });
      }
      else
      {
        Object[] res = JSONUtils.findPath(metaObject, new String[] { ConversionConstant.ROWS, criteriaSheetId });
        if (res[1] != null)
        {
          JSONObject metaRows = (JSONObject) res[1];
          res = JSONUtils.ensurePath(partMetaObject, new String[] { ConversionConstant.ROWS, criteriaSheetId });
          final JSONObject partMetaRows = (JSONObject) res[1];
          MapHelper.iterateMap(metaRows, new IMapEntryListener<String, JSONObject>()
          {
            public boolean onEntry(String rowId, JSONObject row)
            {
              if (criteriaRowIdSet.contains(rowId))
              {
                partMetaRows.put(rowId, row);
              }

              return false;
            }
          });
        }
        // else, no meta rows
      }
    }

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.exiting("PartialDeserializer", "initPartMetaObject");
    }
  }

  private void updateMaxRow()
  {
    // sheets may have unnamed range set or rows meta, but no content,
    Set<String> unnamedRangeSheetsSet = ((UnnamedRangeListener) unnamedRangeListener).unnamedRangeSheetsSet;
    JSONObject allRows = (JSONObject) metaObject.get(ConversionConstant.ROWS);

    Iterator<Map.Entry<String, JSONObject>> itor = partMetaSheetsObject.entrySet().iterator();
    while (itor.hasNext())
    {
      Map.Entry<String, JSONObject> entry = itor.next();
      String id = entry.getKey();
      JSONObject partSheet = entry.getValue();
      Object maxrow = partSheet.get(ConversionConstant.MAXROWINDEX);
      if (maxrow == null)
      {
        boolean bUpdate = false;
        if (unnamedRangeSheetsSet.contains(id))
        {
          bUpdate = true;
        }
        if (!bUpdate && allRows != null)
        {
          JSONObject rows = (JSONObject) allRows.get(id);
          if (rows != null && rows.keySet().size() > 0)
          {
            bUpdate = true;
          }
        }
        if (bUpdate)
          partSheet.put(ConversionConstant.MAXROWINDEX, 1);
      }
    }
  }

  /**
   * Collect impact charts of sheet "sheetId". It only collects 1st level impact charts, the collected charts' reference is not collected.
   **/
  public void collectImpactCharts(String criteriaSheetId, Set<String> chartHrefs)
  {
    JSONArray loadCharts = null;
    if (!isFirstLoading)
      loadCharts = (JSONArray) criteria.get("loadedCharts");

    JSONObject charts = (JSONObject) partContentObject.get("charts");
    if (charts == null)
      charts = new JSONObject();
    Iterator<String> itor = chartHrefs.iterator();
    while (itor.hasNext())
    {
      String href = itor.next(); // "Charts/" + chartId

      String chartId = href.substring("Charts/".length());
      if (loadCharts != null && loadCharts.contains(chartId))
        continue;

      String path = draftRootUri + File.separator + href + ".js";
      InputStream stream = null;
      try
      {
        if (this.streamer != null)
          stream = this.streamer.getInputStream(path);
        else
          stream = new FileInputStream(path);
        JSONObject chartJson = JSONObject.parse(stream);

        boolean collect = false;
        List<String> refs = getChartReferences(chartJson);
        for (int i = 0; i < refs.size(); i++)
        {
          String addrs = refs.get(i);
          JSONArray typeJSONs = generateReference(addrs);
          for (int j = 0; j < typeJSONs.size(); j++)
          {
            OrderedJSONObject typeJSON = (OrderedJSONObject) typeJSONs.get(j);
            String type = (String) typeJSON.get(ConversionConstant.REFERENCE_TYPE);
            if (!ConversionConstant.NAME_RANGE.equals(type))
            {
              String sheetId = (String) typeJSON.get(ConversionConstant.SHEETID);
              if (criteriaSheetId.equals(sheetId))
              {
                collect = true;
                break;
              }
            }
          }
          if (collect)
            break;
        }

        if (collect && !charts.containsKey(chartId))
        {
          chartJson.put(ConversionConstant.PARTIAL_REFERENCE, Boolean.TRUE);
          charts.put(chartId, chartJson);
        }
      }
      catch (Exception e)
      {
        LOG.log(Level.WARNING, "can not collect chart.", e);
      }
      finally
      {
        try
        {
          stream.close();
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "can not close stream for chart at {0}", path);
        }
      }
    }

    partContentObject.put("charts", charts);
  }

  private void collectCharts() throws Exception
  {
    chartRefs = new JSONArray();
    JSONObject charts = new JSONObject();
    if (isFirstLoading)
    {
      // load the chart document in this sheet
      Set<String> chartHrefs = ((UnnamedRangeListener) unnamedRangeListener).chartsInSheet;

      Iterator<String> itor = chartHrefs.iterator();
      while (itor.hasNext())
      {
        String href = itor.next(); // "Charts/" + chartId

        String path = draftRootUri + File.separator + href + ".js";

        InputStream stream = null;

        try
        {
          if (this.streamer != null)
            stream = this.streamer.getInputStream(path);
          else
            stream = new FileInputStream(path);

          JSONObject chartJson = JSONObject.parse(stream);
          String chartId = href.substring("Charts/".length());
          charts.put(chartId, chartJson);

          List<String> refs = getChartReferences(chartJson);
          for (int i = 0; i < refs.size(); i++)
          {
            String addrs = refs.get(i);
            chartRefs.addAll(generateReference(addrs));
          }
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "can not collect chart.", e);
        }
        finally
        {
          try
          {
            stream.close();
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "can not close stream for chart at {0}", path);
          }
        }

      }
    }
    else
    {
      JSONArray unloadCharts = (JSONArray) criteria.get("charts");
      if (unloadCharts != null)
      {
        for (int i = 0; i < unloadCharts.size(); i++)
        {
          String chartId = (String) unloadCharts.get(i);
          InputStream stream = null;
          String path = draftRootUri + File.separator + "Charts" + File.separator + chartId + ".js";
          try
          {
            if (this.streamer != null)
              stream = this.streamer.getInputStream(path);
            else
              stream = new FileInputStream(path);
            JSONObject chartJson = JSONObject.parse(stream);
            charts.put(chartId, chartJson);

            List<String> refs = getChartReferences(chartJson);
            for (int j = 0; j < refs.size(); j++)
            {
              String addrs = refs.get(j);
              chartRefs.addAll(generateReference(addrs));
            }
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "can not collect chart.", e);
          }
          finally
          {
            try
            {
              stream.close();
            }
            catch (Exception e)
            {
              LOG.log(Level.WARNING, "can not close stream for chart at {0}", path);
            }
          }
        }
      }
    }
    if (!charts.isEmpty())
      partContentObject.put("charts", charts);
  }

  private void collectNRJSCharts() throws Exception
  {
    nrjschartRefs = new ArrayList<IDMFormulaParsedRef>();
    JSONObject charts = new JSONObject();
    if (isFirstLoading)
    {
      // load the chart document in this sheet
      Set<String> chartHrefs = ((UnnamedRangeListener) unnamedRangeListener).chartsInSheet;

      Iterator<String> itor = chartHrefs.iterator();
      while (itor.hasNext())
      {
        String href = itor.next(); // "Charts/" + chartId

        String path = draftRootUri + File.separator + href + ".js";

        InputStream stream = null;

        try
        {
          if(this.streamer != null)
            stream = this.streamer.getInputStream(path);
          else
            stream = new FileInputStream(path);

          JSONObject chartJson = JSONObject.parse(stream);
          String chartId = href.substring("Charts/".length());
          charts.put(chartId, chartJson);

          List<String> refs = getChartReferences(chartJson);
          for (int i = 0; i < refs.size(); i++)
          {
            String addrs = refs.get(i);
            List<IDMFormulaError> ferr = new ArrayList<IDMFormulaError>();
            // System.out.println("parsechartref:"+addrs); // yuanlin
            if (addrs.startsWith("("))
            {
              // reference array
              int state = 0, beginpos = 1, pos = beginpos;
              while (pos < addrs.length())
              {
                char nextChar = addrs.charAt(pos);
                // remove blank
                while (nextChar == ' ' || nextChar == 0xA0 || nextChar == 0x3000)
                {
                  pos++;
                  if (pos < addrs.length())
                    nextChar = addrs.charAt(pos);
                  else
                    break;
                }
                // skip sheetname
                if (nextChar == '\'')
                {
                  do
                  {
                    pos++;
                    if (pos < addrs.length())
                      nextChar = addrs.charAt(pos);
                    else
                      break;
                    if (nextChar == '\'' && addrs.charAt(pos - 1) != '\'')
                      break;
                  }
                  while (pos < addrs.length());
                }
                // find endchar
                int endpos = addrs.indexOf(',', pos);
                if (endpos < 0)
                  endpos = addrs.indexOf(')', pos);
                if (endpos < 0)
                  endpos = addrs.length();
                String refaddr = addrs.substring(beginpos, endpos);
                ArrayList<IDMFormulaParsedRef> vrefs = new ArrayList<IDMFormulaParsedRef>();
                List<IDMFormulaParsedRef> chartrefs = nrjspartialReference.parseFormularString(refaddr, "", vrefs);
                if (vrefs.size()>0)
                {
                  List<IDMFormulaParsedRef> chart_vrefs = nrjspartialReference.getParsedVRef(vrefs);
                  chartrefs.addAll(chart_vrefs);
                }
                nrjschartRefs.addAll(chartrefs);
                beginpos = endpos + 1;
                pos = beginpos;
              }

            }
            else
            {
              ArrayList<IDMFormulaParsedRef> vrefs = new ArrayList<IDMFormulaParsedRef>();
              List<IDMFormulaParsedRef> chartrefs = nrjspartialReference.parseFormularString(addrs, "", vrefs);
              if (vrefs.size()>0)
              {
                List<IDMFormulaParsedRef> chart_vrefs = nrjspartialReference.getParsedVRef(vrefs);
                chartrefs.addAll(chart_vrefs);
              }
              nrjschartRefs.addAll(chartrefs);
            }
          }
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "can not collect chart.", e);
        }
        finally
        {
          try
          {
            stream.close();
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "can not close stream for chart at {0}", path);
          }
        }

      }
    }
    else
    {
      JSONArray unloadCharts = (JSONArray) criteria.get("charts");
      if (unloadCharts != null)
      {
        for (int i = 0; i < unloadCharts.size(); i++)
        {
          String chartId = (String) unloadCharts.get(i);
          InputStream stream = null;
          String path = draftRootUri + File.separator + "Charts" + File.separator + chartId + ".js";
          try
          {
            if(this.streamer != null)
              stream = this.streamer.getInputStream(path);
            else
              stream = new FileInputStream(path);
            JSONObject chartJson = JSONObject.parse(stream);
            charts.put(chartId, chartJson);

            List<String> refs = getChartReferences(chartJson);
            for (int j = 0; j < refs.size(); j++)
            {
              String addrs = refs.get(j);
              List<IDMFormulaError> ferr = new ArrayList<IDMFormulaError>();
              List<IDMFormulaToken> tokens = IDMFormulaLexer.parseq(addrs, ferr, IDMFormulaLexer.LexFormulaType.FORMAT_OOXML);
              for (IDMFormulaToken token : tokens)
              {
                if (token.type == IDMFormulaToken.LexTokenType.REFERENCE_TYPE)
                {
                  IDMFormulaParsedRef ref = (IDMFormulaParsedRef) (token.value);
                  nrjschartRefs.add(ref);
                  // System.out.println("chartref:" + ref.getAddress()); // yuanlin
                }
              }
            }
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "can not collect chart.", e);
          }
          finally
          {
            try
            {
              stream.close();
            }
            catch (Exception e)
            {
              LOG.log(Level.WARNING, "can not close stream for chart at {0}", path);
            }
          }
        }
      }
    }
    if (!charts.isEmpty())
      partContentObject.put("charts", charts);
  }

  private List<String> getChartReferences(JSONObject content)
  {
    List<String> refs = new ArrayList<String>();

    JSONObject plotArea = (JSONObject) content.get(ConversionConstant.PLOTAREA);
    JSONArray axisList = (JSONArray) plotArea.get(ConversionConstant.AXIS);
    if (axisList != null)
    {
      for (int i = 0; i < axisList.size(); i++)
      {
        JSONObject axis = (JSONObject) axisList.get(i);
        JSONObject cat = (JSONObject) axis.get(ConversionConstant.CATEGORIES);
        if (cat != null)
        {
          String ref = (String) cat.get(ConversionConstant.REF);
          if (ref != null && ref.length() > 0)
            refs.add(ref);
        }
      }
    }
    JSONArray plots = (JSONArray) plotArea.get(ConversionConstant.PLOTS);
    if (plots != null)
    {
      for (int i = 0; i < plots.size(); i++)
      {
        JSONObject plot = (JSONObject) plots.get(i);
        JSONArray seriesList = (JSONArray) plot.get(ConversionConstant.SERIES_LIST);
        for (int j = 0; j < seriesList.size(); j++)
        {
          JSONObject series = (JSONObject) seriesList.get(j);
          for (int t = 0; t < CHART_ROLES.size(); t++)
          {
            String role = CHART_ROLES.get(t);
            JSONObject json = (JSONObject) series.get(role);
            if (json != null)
            {
              String ref = (String) json.get(ConversionConstant.REF);
              if (ref != null && ref.length() > 0)
                refs.add(ref);
            }
          }
        }
      }
    }
    return refs;
  }

  // for debug
  // private void checkRef(List<JSONObject> objs) {
  // if (objs==null || objs.size()<=0) return;
  // for (int i=0;i<objs.size();i++) {
  // JSONObject obj = objs.get(i);
  // String referencedRowId = (String) obj.get(ConversionConstant.ROWID_NAME);
  // if ("or28".equals(referencedRowId)) {
  // int a=3;
  // a= a+1;
  // }
  // }
  // }

  /*
   * Collect cells reference info and generate cell collector. This will lookup reference.js and collect referenced start from sheetId.
   */
  @SuppressWarnings("unchecked")
  private void collectReferences() throws JsonParseException, IOException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.entering(PartialDeserializer.class.getName(), "collectReferences");
    }

    cellCollector = new CellCollector();

    if (criteriaRowIdSet == null)
    {
      cellCollector.collectSheet(criteriaSheetId);
    }

    // init reference.js
    JSONObject referenceSheetObject = null;
    if (partialReference != null && !partialReference.isEmpty())
    {
      referenceSheetObject = (JSONObject) partialReference.get(criteriaSheetId);
    }

    final LinkedList<JSONObject> referenceQueue = new LinkedList<JSONObject>();
    if (chartRefs != null && !chartRefs.isEmpty())
      referenceQueue.addAll(chartRefs);

    if (referenceSheetObject != null)
    {
      MapHelper.iterateMap(referenceSheetObject, new IMapEntryListener<String, JSONObject>()
      {
        public boolean onEntry(String rowId, JSONObject referenceCellsObject)
        {
          if (criteriaRowIdSet != null)
          {
            if (!criteriaRowIdSet.contains(rowId))
            {
              // current row is not criteria row, so no need to get collected, skip
              return false;
            }
            // else, continue to proceed
          }
          // else, continue to proceed

          MapHelper.iterateMap(referenceCellsObject, new IMapEntryListener<String, JSONObject>()
          {
            public boolean onEntry(String columnId, JSONObject cellsObject)
            {
              JSONArray cellsArray = (JSONArray) cellsObject.get(ConversionConstant.CELLS);
              if (cellsArray != null && !cellsArray.isEmpty())
              {
                referenceQueue.addAll(cellsArray);
              }
              return false;
            }
          });
          return false;
        }
      });
    }

    Set<String> namedCache = new HashSet<String>();

    while (!referenceQueue.isEmpty())
    {
      JSONObject referenceObject = referenceQueue.poll();

      if (referenceObject == null)
      {
        // the case that "cells" array is empty, ignore
        continue;
      }
      String referencedSheetId = (String) referenceObject.get(ConversionConstant.SHEETID);
      // System.out.println("@@:"+(String) referenceObject.get("addr")+" sheeid:"+ referencedSheetId);

      // if (!sheetId.equals(iterator.getSheetId()))
      // {
      // partialReference.writeReference(iterator.getSheetId(), iterator.getRowId(), iterator.getColId(), referenceObject);
      // }

      if (!shouldCollect(referencedSheetId))
      {
        if (LOG.isLoggable(Level.FINEST))
        {
          LOG.log(Level.FINEST, "referenceObject ref to current sheet, skip.");
        }
        // do nothing
      }
      else
      {
        String refType = (String) referenceObject.get(ConversionConstant.REFERENCE_TYPE);

        if (ConversionConstant.REF_TYPE_CELL.equals(refType))
        {
          if (referencedSheetId == null)
          {
            LOG.log(Level.WARNING, "ignore cell reference without sheet id, {0}", referenceObject);
            continue;
          }
          // cell reference
          String referencedRowId = (String) referenceObject.get(ConversionConstant.ROWID_NAME);
          String referencedColumnId = (String) referenceObject.get(ConversionConstant.COLUMNID_NAME);
          // collect this cell
          if (shouldCollect(referencedSheetId, referencedRowId, referencedColumnId)) // the cell has been already collected
          {
            cellCollector.collectCell(referencedSheetId, referencedRowId, referencedColumnId);

            updatePartSheetsArray(referencedSheetId, referencedRowId, referencedColumnId, -1, -1);

            // lookup the cell in reference
            JSONArray cellsArray = partialReference.get(referencedSheetId, referencedRowId, referencedColumnId);
            if (cellsArray != null)
            {
              if (LOG.isLoggable(Level.FINEST))
              {
                LOG.log(Level.FINEST, "find nesetd referencing info in {0}->{1}->{2}->{3}, add to iterator.", new Object[] {
                    referencedSheetId, referencedRowId, referencedColumnId, cellsArray });
              }

              referenceQueue.addAll(cellsArray);

            }
          }
        }
        else
        {
          if (ConversionConstant.NAME_RANGE.equals(refType))
          {
            String name = (String) referenceObject.get(ConversionConstant.NAMES_REFERENCE);
            name = name.toLowerCase();
            if (namedCache.contains(name))
            {
              if (LOG.isLoggable(Level.FINER))
              {
                LOG.log(Level.FINER, "skip cached named range {0}.", name);
              }
              continue;
            }
            referenceObject = getNameRange(name);
            if (referenceObject == null)
            {
              LOG.log(Level.FINER, "Did not find name range {0}, ignore.", name);
              continue;
            }
            namedCache.add(name);
            referencedSheetId = (String) referenceObject.get(ConversionConstant.SHEETID);
            String endSheetId = (String) referenceObject.get(ConversionConstant.ENDSHEETID);
            if (endSheetId != null && nrjspartialReference != null)
            {
              String refAddr = (String) referenceObject.get(ConversionConstant.RANGE_ADDRESS);
              ArrayList<IDMFormulaParsedRef> vrefList = new ArrayList<IDMFormulaParsedRef>();
              List<IDMFormulaParsedRef> refs = nrjspartialReference.parseFormularString(refAddr, null, vrefList);
              // 3d reference name
              for (int i=0; i<refs.size(); i++)
              {
                IDMFormulaParsedRef parsedRef = refs.get(i);
                JSONObject ref = new JSONObject();
                ref.put(ConversionConstant.REFERENCE_TYPE, parsedRef.getRefType());
                ref.put(ConversionConstant.RANGE_ADDRESS, parsedRef.getAddress());
                ref.put(ConversionConstant.SHEETID, parsedRef.getAddress());
                ref.put(ConversionConstant.RANGE_STARTROWID, referenceObject.get(ConversionConstant.RANGE_STARTROWID));
                ref.put(ConversionConstant.RANGE_STARTCOLID, referenceObject.get(ConversionConstant.RANGE_STARTCOLID));
                ref.put(ConversionConstant.RANGE_ENDROWID, referenceObject.get(ConversionConstant.RANGE_ENDROWID));
                ref.put(ConversionConstant.RANGE_ENDCOLID, referenceObject.get(ConversionConstant.RANGE_ENDCOLID));
                referenceQueue.add(ref);
              }
              continue;
            }
          }

          if (referencedSheetId == null)
          {
            LOG.log(Level.WARNING, "ignore reference without sheet id, {0}", referenceObject);
            continue;
          }

          // early quit if referenced sheet is in criteria.
          if (!shouldCollect(referencedSheetId))
          {
            continue;
          }

          cellCollector.collectingSheet(referencedSheetId);
          cellCollector.lookingSheet(referencedSheetId);

          int startRowIndex = getIndexFromReference(referenceObject, ConversionConstant.RANGE_STARTROWID);
          int startColIndex = getIndexFromReference(referenceObject, ConversionConstant.RANGE_STARTCOLID);
          int endRowIndex = getIndexFromReference(referenceObject, ConversionConstant.RANGE_ENDROWID);
          int endColIndex = getIndexFromReference(referenceObject, ConversionConstant.RANGE_ENDCOLID);
          // for the case that end row/column id not exists, back to cell reference
          if (endRowIndex == ID_IS_NULL)
          {
            endRowIndex = startRowIndex;
          }
          if (endColIndex == ID_IS_NULL)
          {
            endColIndex = startColIndex;
          }

          if (startRowIndex == -1 || endRowIndex == -1 || startColIndex == -1 || endColIndex == -1 || startColIndex == ID_IS_NULL
              || startRowIndex == ID_IS_NULL)
          {
            if (LOG.isLoggable(Level.INFO))
            {
              LOG.log(Level.INFO, "range address ({0}, {1}):({2}, {3}) contains #REF!, ignore, original object: {4}", new Object[] {
                  startRowIndex, startColIndex, endRowIndex, endColIndex, referenceObject });
            }
            continue;
          }

          // lookup range
          if (LOG.isLoggable(Level.FINEST))
          {
            LOG.log(Level.FINEST, "start collecting range in sheet {0}, address ({1}, {2}):({3}, {4}).", new Object[] { referencedSheetId,
                startRowIndex, startColIndex, endRowIndex, endColIndex });
          }

          RowColumnIdIterator rangeIterator = new RowColumnIdIterator(rowColIdIndexMeta, referencedSheetId, startRowIndex, endRowIndex,
              startColIndex, endColIndex);

          JSONObject referencedSheetObject = partialReference.get(referencedSheetId);
          while (rangeIterator.hasNext())
          {
            int colIndex = rangeIterator.getColIndex();
            int rowIndex = rangeIterator.getRowIndex();
            String[] ids = rangeIterator.next();
            String rowId = ids[0];
            String colId = ids[1];
            if (shouldCollect(referencedSheetId, rowId) && !(cellCollector.lookingRow(rowId) && cellCollector.lookingCell(colId)))
            {
              // the cell is not collected yet
              cellCollector.collectCell(rowId, colId);

              updatePartSheetsArray(referencedSheetId, rowId, colId, rowIndex, colIndex);

              // check referenced cell
              Object[] objs = JSONUtils.findPath(referencedSheetObject, new String[] { rowId, colId, ConversionConstant.CELLS });
              JSONArray cellsArray = (JSONArray) objs[2];
              if (cellsArray != null)
              {
                if (LOG.isLoggable(Level.FINEST))
                {
                  LOG.log(Level.FINEST, "find nested referencing info in {0}->{1}->{2}->{3}, add to iterator.", new Object[] {
                      referencedSheetId, rowId, colId, cellsArray });
                }

                referenceQueue.addAll(cellsArray);
              }
            } // collecting cell done
          } // range iterating done
        } // collecting referenced range done
      } // collecting reference object done
    } // collecting entire references done

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.exiting(PartialDeserializer.class.getName(), "collectReferences");
    }
  }

  /*
   * Collect cells reference info and generate cell collector. This will lookup reference.js and collect referenced start from sheetId.
   */
  @SuppressWarnings("unchecked")
  private void collectNRJSReferences() throws JsonParseException, IOException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.entering(PartialDeserializer.class.getName(), "collectNRJSReferences");
    }

    cellCollector = new CellCollector();

    if (criteriaRowIdSet == null)
    {
      cellCollector.collectSheet(criteriaSheetId);
    }

    // init reference.js
    HashMap<String, List<IDMFormulaParsedRef>> referenceSheetObject = null;
    if (nrjspartialReference != null && !nrjspartialReference.isEmpty())
    {
      referenceSheetObject = nrjspartialReference.get(criteriaSheetId);
    }

    final LinkedList<IDMFormulaParsedRef> referenceQueue = new LinkedList<IDMFormulaParsedRef>();
    if (nrjschartRefs != null && !nrjschartRefs.isEmpty())
      referenceQueue.addAll(nrjschartRefs);

    if (referenceSheetObject != null)
    {
      MapHelper.iterateMap(referenceSheetObject, new IMapEntryListener<String, List<IDMFormulaParsedRef>>()
      {
        public boolean onEntry(String key, List<IDMFormulaParsedRef> value)
        {
          String[] rowId_colId = key.split("_");
          String refRowId = rowId_colId[0];
          String refColId = rowId_colId[1];
          if (criteriaRowIdSet != null && criteriaRowIdSet.contains(refRowId))
          {
            // System.out.println("##0:"+value);
            referenceQueue.addAll(value);
          }
          else if (criteriaRowIdSet == null)
          {
            // System.out.println("##1:"+value);
            referenceQueue.addAll(value);
          }
          return false;
        }
      });
    }

    Set<String> namedCache = new HashSet<String>();

    while (!referenceQueue.isEmpty())
    {
      IDMFormulaParsedRef referenceObject = referenceQueue.poll();
      if (referenceObject == null)
      {
        // the case that "cells" array is empty, ignore
        continue;
      }
      String referencedSheetId = this.sheetName2Id.get(referenceObject.getSheetName());
      // System.out.println("##:"+referenceObject.getAddress()+" sheeid:"+referencedSheetId + "reftype:"+referenceObject.getRefType());
      if (referencedSheetId == null)
        referencedSheetId = criteriaSheetId;

      // if (!sheetId.equals(iterator.getSheetId()))
      // {
      // partialReference.writeReference(iterator.getSheetId(), iterator.getRowId(), iterator.getColId(), referenceObject);
      // }

      if (!"names".equals(referenceObject.getRefType()) && !shouldCollect(referencedSheetId))
      {
        if (LOG.isLoggable(Level.FINEST))
        {
          LOG.log(Level.FINEST, "referenceObject ref to current sheet, skip.");
        }
        // do nothing
      }
      else
      {
        String refType = referenceObject.getRefType();

        if ("cell".equals(refType))
        {
          if (referencedSheetId == null)
          {
            LOG.log(Level.WARNING, "ignore cell reference without sheet id, {0}", referenceObject);
            continue;
          }
          // cell reference
          String referencedRowId = rowColIdIndexMeta.getRowIdbyIndex(referencedSheetId, referenceObject.getIntStartRow());
          String referencedColumnId = rowColIdIndexMeta.getColIdbyIndex(referencedSheetId, referenceObject.getIntStartCol());
          // collect this cell
          if (shouldCollect(referencedSheetId, referencedRowId, referencedColumnId)) // the cell has been already collected
          {
            cellCollector.collectCell(referencedSheetId, referencedRowId, referencedColumnId);

            updatePartSheetsArray(referencedSheetId, referencedRowId, referencedColumnId, referenceObject.getIntStartRow(), referenceObject.getIntStartCol());

            // lookup the cell in reference
            List<IDMFormulaParsedRef> cellsArray = nrjspartialReference.get(referencedSheetId, referencedRowId, referencedColumnId);
            if (cellsArray != null && !cellsArray.isEmpty())
            {
              if (LOG.isLoggable(Level.FINEST))
              {
                LOG.log(Level.FINEST, "find nesetd referencing info in {0}->{1}->{2}->{3}, add to iterator.", new Object[] {
                    referencedSheetId, referencedRowId, referencedColumnId, cellsArray });
              }

              referenceQueue.addAll(cellsArray);
            }
          }
        }
        else
        {
          // cache all range reference as well as namerange 
          JSONObject jsonreferenceObject = null;
          String name = (String) referenceObject.getAddress();
          name = name.toLowerCase();
          if (namedCache.contains(name))
          {
            if (LOG.isLoggable(Level.FINER))
            {
              LOG.log(Level.FINER, "skip cached named range {0}.", name);
            }
            continue;
          }
          if (ConversionConstant.NAME_RANGE.equals(refType.toString()))
          {
            jsonreferenceObject = getNameRange(name);
            if (jsonreferenceObject == null)
            {
              LOG.log(Level.FINER, "Did not find name range {0}, ignore.", name);
              continue;
            }
            referencedSheetId = (String) jsonreferenceObject.get(ConversionConstant.SHEETID);
            String referencedEndSheetId = (String) jsonreferenceObject.get(ConversionConstant.ENDSHEETID);
            if (referencedEndSheetId!=null && !referencedEndSheetId.isEmpty())
            {
               // 3d reference, parsed real range from formula 
              String refaddr = (String) jsonreferenceObject.get(ConversionConstant.RANGE_ADDRESS);
              if (refaddr != null && !refaddr.isEmpty())
              {
                ArrayList<IDMFormulaParsedRef> vrefs = new ArrayList<IDMFormulaParsedRef>();
                List<IDMFormulaParsedRef> refs3d = nrjspartialReference.parseFormularString(refaddr, "", vrefs);
                referenceQueue.addAll(refs3d);
              }
              namedCache.add(name);
              continue;
            }
            if (!shouldCollect(referencedSheetId))
              continue;
          }
          else if (IDMFormulaRefParser.COLS.equals(refType))
          {
            if (referenceObject.getIntStartRow() < 0)
              referenceObject.setStartRow(1);
            if (referenceObject.getIntEndRow() < 0)
              referenceObject.setEndRow(ConversionConstant.MAX_REF_ROW_NUM);
          }
          else if (IDMFormulaRefParser.ROWS.equals(refType))
          {
            if (referenceObject.getIntStartCol() < 0)
              referenceObject.setEndCol(1);
            if (referenceObject.getIntEndRow() < 0)
              referenceObject.setEndCol(ConversionConstant.MAX_COL_NUM);
          }
          // early quit if referenced sheet is in criteria.
          if (!shouldCollect(referencedSheetId))
          {
            continue;
          }
          namedCache.add(name);

          cellCollector.collectingSheet(referencedSheetId);
          cellCollector.lookingSheet(referencedSheetId);
          int startRowIndex = referenceObject.getIntStartRow();
          int startColIndex = referenceObject.getIntStartCol();
          int endRowIndex = referenceObject.getIntEndRow();
          int endColIndex = referenceObject.getIntEndCol();
          if (jsonreferenceObject != null)
          {
            startRowIndex = getIndexFromReference(jsonreferenceObject, ConversionConstant.RANGE_STARTROWID);
            startColIndex = getIndexFromReference(jsonreferenceObject, ConversionConstant.RANGE_STARTCOLID);
            endRowIndex = getIndexFromReference(jsonreferenceObject, ConversionConstant.RANGE_ENDROWID);
            endColIndex = getIndexFromReference(jsonreferenceObject, ConversionConstant.RANGE_ENDCOLID);
          }
          // for the case that end row/column id not exists, back to cell reference
          if (endRowIndex == ID_IS_NULL)
          {
            endRowIndex = startRowIndex;
          }
          if (endColIndex == ID_IS_NULL)
          {
            endColIndex = startColIndex;
          }
          
          // the row/column index may be less than -1 when the reference is like Sheet1!A1:Sheet1!#REF!
          if (startRowIndex <= -1 || endRowIndex <= -1 || startColIndex <= -1 || endColIndex <= -1 || startColIndex == ID_IS_NULL
              || startRowIndex == ID_IS_NULL)
          {
            if (LOG.isLoggable(Level.INFO))
            {
              LOG.log(Level.INFO, "range address ({0}, {1}):({2}, {3}) contains #REF!, ignore, original object: {4}", new Object[] {
                  startRowIndex, startColIndex, endRowIndex, endColIndex, referenceObject });
            }
            continue;
          }

          // lookup range
          if (LOG.isLoggable(Level.FINEST))
          {
            LOG.log(Level.FINEST, "start collecting range in sheet {0}, address ({1}, {2}):({3}, {4}).", new Object[] { referencedSheetId,
                startRowIndex, startColIndex, endRowIndex, endColIndex });
          }

          RowColumnIdIterator rangeIterator = new RowColumnIdIterator(rowColIdIndexMeta, referencedSheetId, startRowIndex, endRowIndex,
              startColIndex, endColIndex);

          HashMap<String, List<IDMFormulaParsedRef>> nrjsreferencedSheetObject = nrjspartialReference.get(referencedSheetId);
          while (rangeIterator.hasNext())
          {
            int colIndex = rangeIterator.getColIndex();
            int rowIndex = rangeIterator.getRowIndex();
            String[] ids = rangeIterator.next();
            String rowId = ids[0];
            String colId = ids[1];
            if (shouldCollect(referencedSheetId, rowId) && !(cellCollector.lookingRow(rowId) && cellCollector.lookingCell(colId)))
            {
              // the cell is not collected yet
              cellCollector.collectCell(rowId, colId);

              updatePartSheetsArray(referencedSheetId, rowId, colId, rowIndex, colIndex);

              // check referenced cell
              if (nrjsreferencedSheetObject != null)
              {
                String rowcolId = rowId + "_" + colId;
                List<IDMFormulaParsedRef> refs = nrjsreferencedSheetObject.get(rowcolId);
                if (refs != null && refs.size() > 0)
                {
                  if (LOG.isLoggable(Level.FINEST))
                  {
                    LOG.log(Level.FINEST, "find nested referencing info in {0}->{1}->{2}->{3}, add to iterator.", new Object[] {
                        referencedSheetId, rowId, colId, refs });
                  }
                  referenceQueue.addAll(refs);
                }
              } // check nrjsreferencedSheetObject
            } // collecting cell done
          } // range iterating done
        } // collecting referenced range done
      } // collecting reference object done
    } // collecting entire references done

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.exiting(PartialDeserializer.class.getName(), "collectReferences");
    }
  }

  private JSONArray generateReference(String addrs)
  {
    JSONArray refs = new JSONArray();

    List<String> addresses = CommonUtils.getRanges(addrs);
    for (int i = 0; i < addresses.size(); i++)
    {
      String addr = addresses.get(i);
      boolean isName = true;
      OrderedJSONObject typeJSON = new OrderedJSONObject();
      ParsedRef parseRef = ReferenceParser.parse(addr);
      if (parseRef != null)// && FormulaUtil.isValidFormulaRef(parseRef))
      {
        if (!parseRef.isValid())
          continue;
        String type = parseRef.type.toString();
        typeJSON.put(ConversionConstant.REFERENCE_TYPE, type);
        String sheetId = this.sheetName2Id.get(parseRef.sheetName);
        if (sheetId != null)
        {
          typeJSON.put(ConversionConstant.SHEETID, sheetId);
          typeJSON.put(ConversionConstant.RANGE_ADDRESS, addr);
          if (ParsedRefType.CELL == parseRef.type)
          {
            int colIndex = ReferenceParser.translateCol(parseRef.startCol);
            int rowIndex = ReferenceParser.translateRow(parseRef.startRow);
            String referenceRowId = "";
            if (rowIndex > ConversionConstant.MAX_REF_ROW_NUM)
              referenceRowId = ConversionConstant.MAX_REF;
            else
              referenceRowId = rowColIdIndexMeta.getOrCreateRowIdByIndex(sheetId, rowIndex);

            String referenceColId = rowColIdIndexMeta.getOrCreateColIdByIndex(sheetId, colIndex);
            typeJSON.put(ConversionConstant.ROWID_NAME, referenceRowId);
            typeJSON.put(ConversionConstant.COLUMNID_NAME, referenceColId);

          }
          else
          {
            int startColIndex = ReferenceParser.translateCol(parseRef.startCol);
            int startRowIndex = ReferenceParser.translateRow(parseRef.startRow);
            int endColIndex = ReferenceParser.translateCol(parseRef.endCol);
            int endRowIndex = ReferenceParser.translateRow(parseRef.endRow);

            String referenceEndRowId = "";
            if (ParsedRefType.COLUMN == parseRef.type)
            {
              startRowIndex = 1;
              referenceEndRowId = ConversionConstant.MAX_REF;
            }
            else if (ParsedRefType.ROW == parseRef.type)
            {
              startColIndex = 1;
              endColIndex = ConversionConstant.MAX_COL_NUM;
            }
            String referenceStartRowId = "";
            if (startRowIndex > ConversionConstant.MAX_REF_ROW_NUM)
              referenceStartRowId = ConversionConstant.MAX_REF;
            else
              referenceStartRowId = rowColIdIndexMeta.getOrCreateRowIdByIndex(sheetId, startRowIndex);
            String referenceStartColId = rowColIdIndexMeta.getOrCreateColIdByIndex(sheetId, startColIndex);

            if (ParsedRefType.COLUMN != parseRef.type)
            {
              if (endRowIndex > ConversionConstant.MAX_REF_ROW_NUM)
                referenceEndRowId = ConversionConstant.MAX_REF;
              else
                referenceEndRowId = rowColIdIndexMeta.getOrCreateRowIdByIndex(sheetId, endRowIndex);
            }
            String referenceEndColId = rowColIdIndexMeta.getOrCreateColIdByIndex(sheetId, endColIndex);
            typeJSON.put(ConversionConstant.RANGE_STARTROWID, referenceStartRowId);
            typeJSON.put(ConversionConstant.RANGE_STARTCOLID, referenceStartColId);
            typeJSON.put(ConversionConstant.RANGE_ENDROWID, referenceEndRowId);
            typeJSON.put(ConversionConstant.RANGE_ENDCOLID, referenceEndColId);
          }
          isName = false;
        }
      }
      if (isName)// name
      {
        typeJSON.put(ConversionConstant.REFERENCE_TYPE, ConversionConstant.NAME_RANGE);
        typeJSON.put(ConversionConstant.NAMES_REFERENCE, addr);
      }

      refs.add(typeJSON);
    }

    return refs;
  }

  /*
   * Update collected referenced cells to content
   */
  private void updateContent() throws JsonParseException, IOException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.entering(PartialDeserializer.class.getName(), "updateContent");
    }

    JSONObject partSheets = (JSONObject) partContentObject.get(ConversionConstant.SHEETS);
    RowsListener rowsListener = new RowsListener();

    Set<Entry<String, TokenBuffer>> sheetBufferEntry = sheetsBuffer.entrySet();
    for (Iterator iterator = sheetBufferEntry.iterator(); iterator.hasNext();)
    {
      Entry<String, TokenBuffer> sheetEntry = (Entry<String, TokenBuffer>) iterator.next();
      String id = sheetEntry.getKey();
      if ((initialized && criteriaSheetId.equals(id)) || cellCollector.lookingSheet(id)
          || (impactCellsCollector != null && impactCellsCollector.lookingSheet(id)))
      {
        // it is possible that impactCellsCollector.lookingSheet() doesn't get called, call it
        if (impactCellsCollector != null)
        {
          impactCellsCollector.lookingSheet(id);
        }

        JsonParser jp = sheetEntry.getValue().asParser();
        // forward to start
        jp.nextToken();
        // forward to "rows" field name
        jp.nextToken();
        JSONObjectGenerator jg = new JSONObjectGenerator();
        jg.addListener(stylesListener);
        jg.addListener(cellListener);
        rowsListener.setGenerator(jg);
        jg.addListener(rowsListener);

        // forward the FormulaCellListener state
        if (cellListener != null)
        {
          ((CellListener) cellListener).setState(CellListener.State.SHEET);
          ((CellListener) cellListener).setSheetId(id);
          ((CellListener) cellListener).setGenerator(jg);
        }

        jg.writeStartObject();
        if (initialized && criteriaSheetId.equals(id))
        {
          // FIXME the copy don't trigger rowsHandler. so impactedCell flag is never changed, if it leaves at "true",
          // it will add bPR to all cells.
          // close the flag before copying. NOTE if IGNORE_IMPACT_CELLS_IN_CRITERIA_SHEET is set to false, here will made all
          // cell set to impacted false, so no cell in criteria cell can mark bPR, which will cause defect.
          ((CellListener) cellListener).setImpactedCell(false);
          // need to update 2nd part max column index
          jg.addListener(maxciListener);
          jg.copyCurrentStructure(jp);
        }
        else
        {
          _iterateSerializing(jp, jg, new DefaultValueHandler(new RowsHandler()));
        }
        jg.writeEndObject();
        JSONObject sheetObject = jg.getRootObject();

        if (!initialized && id.equals(criteriaSheetId))
        {
          // merge criteria sheet with referenced rows
          Object[] objs = JSONUtils.findPath(partSheets, new String[] { criteriaSheetId, "rows" });
          JSONObject partRows = (JSONObject) objs[1];
          partRows.putAll((Map) sheetObject.get(ConversionConstant.ROWS));
        }
        else
        {
          partSheets.put(id, sheetObject);
        }
      }
    }

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.exiting(PartialDeserializer.class.getName(), "updateContent");
    }
  }

  private void updateStyle() throws JsonParseException, IOException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.entering(PartialDeserializer.class.getName(), "updateStyle");
    }

    if (stylesBuffer != null)
    {
      if (isFirstLoading)
      {
        styleIdSet.add(ConversionConstant.DEFAULT_CELL_STYLE);
        styleIdSet.add(ConversionConstant.DEFAULT_ROW_STYLE);
        styleIdSet.add(ConversionConstant.DEFAULT_COLUMN_STYLE);
      }

      JsonParser jp = stylesBuffer.asParser();
      JSONObjectGenerator jg = new JSONObjectGenerator();
      // forward to start
      jp.nextToken();
      // forward to "styles"
      jp.nextToken();
      jg.writeStartObject();
      _iterateSerializing(jp, jg, new PickupStylesHandler(this));
      jg.writeEndObject();
      JSONObject styles = jg.getRootObject();

      partContentObject.put(ConversionConstant.STYLES, styles);
    }

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.exiting(PartialDeserializer.class.getName(), "updateStyle");
    }
  }

  private void collectIdsInRange(String sheetId, String startRowId, String endRowId, String startColumnId, String endColumnId)
  {
    if (!this.criteriaSheetId.equals(sheetId))
    {
      partSheetsArray.settingSheet(sheetId);

      // set end ids first to make the id array large enough for start id,
      // to prevent growing twice.
      int index;
      if (endRowId != null)
      {
        index = rowColIdIndexMeta.getRowIndexById(sheetId, endRowId);
        partSheetsArray.setRowId(index, endRowId);
      }

      if (startRowId != null)
      {
        index = rowColIdIndexMeta.getRowIndexById(sheetId, startRowId);
        partSheetsArray.setRowId(index, startRowId);
      }

      if (endColumnId != null)
      {
        index = rowColIdIndexMeta.getColIndexById(sheetId, endColumnId);
        partSheetsArray.setColumnId(index, endColumnId);
      }

      if (startColumnId != null)
      {
        index = rowColIdIndexMeta.getColIndexById(sheetId, startColumnId);
        partSheetsArray.setColumnId(index, startColumnId);
      }
    }
  }

  /*
   * Get max row index of criteria sheet. Must be called after content is pre processed
   */
  private int getMaxRowIndex()
  {
    JSONArray rowIdArray = rowColIdIndexMeta.rowsIdArrayMap.get(criteriaSheetId);
    if (rowIdArray == null)
      return 0;
    Object[] objs = JSONUtils.findPath(partContentObject, new String[] { ConversionConstant.SHEETS, criteriaSheetId,
        ConversionConstant.ROWS });
    JSONObject rowsContent = (JSONObject) objs[2];
    JSONObject allMeta = (JSONObject) metaObject.get(ConversionConstant.ROWS);

    if ((rowsContent == null || rowsContent.size() == 0) && (allMeta == null || allMeta.size() == 0))
      return 0;
    int cnt = rowIdArray.size();
    for (int i = cnt - 1; i >= 0; i--)
    {
      String rowId = (String) rowIdArray.get(i);
      if (CommonUtils.hasValue(rowId))
      {
        if (rowsContent != null)
        {
          JSONObject rowContent = (JSONObject) rowsContent.get(rowId);
          if (rowContent != null && rowContent.size() > 0)
          {
            Iterator<String> cellIter = rowContent.keySet().iterator();
            while (cellIter.hasNext())
            {
              String colId = cellIter.next();
              JSONObject cellContent = (JSONObject) rowContent.get(colId);
              if (cellContent.containsKey(ConversionConstant.VALUE))
              {
                String value = cellContent.get(ConversionConstant.VALUE).toString();
                if (CommonUtils.hasValue(value))
                  return i + 1;
              }
              Number cs = (Number) cellContent.get(ConversionConstant.COLSPAN);
              if (cs != null)
              {
                int ncs = cs.intValue();
                if (ncs > 1)
                  return i + 1;
              }
              if (cellContent.containsKey(ConversionConstant.STYLEID))
              {
                String styleId = cellContent.get(ConversionConstant.STYLEID).toString();
                if (CommonUtils.hasValue(styleId) && !styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE)
                    && !styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE_NAME))
                  return i + 1;
              }
            }
          }
        }
        if (allMeta != null)
        {
          JSONObject meta = (JSONObject) allMeta.get(rowId);
          if (meta != null)
          {
            // boolean bHeight = meta.containsKey(ConversionConstant.HEIGHT);
            boolean bHide = false;
            String visibility = (String) meta.get(ConversionConstant.VISIBILITY);
            if (visibility != null)
            {
              if ("hide".equalsIgnoreCase(visibility) || "filter".equalsIgnoreCase(visibility))
                bHide = true;
            }

            // if (bHeight || bHide)
            if (bHide)
              return i + 1;
          }
        }
      }
    }
    return 0;
  }

  private void setHasMoreContent()
  {
    // called for first load, set in partial meta that if the criteria sheet has more data to go,
    // if set to true, client will send another request after the first is received
    // our loading is per-row, meta row is all loaded, content row is partial,
    // compare all rows defed in content and rows that loaded as criteria.
    if (criteria.containsKey(ConversionConstant.ENDROW) && criteriaContentRowCount < allContentRowCount)
    {
      partMetaObject.put("hasMoreContent", true);
      hasMoreContent = true;
    }
  }
  
  private void setHasMacro()
  {    
    String path = draftRootUri + File.separator + PAGE_SETTINGS_FILE;
    File pageFile = new File(path);
    
    if (pageFile.exists())
    {
        InputStream stream = null;
        try
        {
            stream = new FileInputStream(path);
            JSONObject pageJson = JSONObject.parse(stream);
            Object obj = pageJson.get("hasMacro");
            Boolean hasMacro = obj != null ?(Boolean)obj : false;
            if(hasMacro)
            {
              partMetaObject.put("hasMacro", true);
            }
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "can not load macro.", e);
        }
        finally
        {
          try
          {
            stream.close();
          }
          catch (Exception e)
          {
            LOG.log(Level.WARNING, "can not close stream for macro at {0}", path);
          }
        }
    }    
  }

  public static boolean isFormulaString(String v)
  {
    if (null == v)
    {
      return false;
    }
    return pattern.matcher(v).matches();
  }

  /**
   * Public for access from {@link PartialReference}
   */
  public void updatePartSheetsArray(String referencedSheetId, String referencedRowId, String referencedColumnId, int rowIndex, int colIndex)
  {
    if (criteriaRowIdSet == null || (criteriaRowIdSet != null && !referencedSheetId.equals(criteriaSheetId)))
    {
      // for partial row, criteria sheet contains full ID information, no need to update ID information to partSheetsArray,
      // doing so will set wrong startrow to partSheetsArray
      // for non-partial row, update sheetsArray as usual
      partSheetsArray.settingSheet(referencedSheetId);
      if (rowIndex<0)
          rowIndex = rowColIdIndexMeta.getRowIndexById(referencedSheetId, referencedRowId);
      if (colIndex<0)
        colIndex = rowColIdIndexMeta.getColIndexById(referencedSheetId, referencedColumnId);
      partSheetsArray.setRowId(rowIndex, referencedRowId);
      partSheetsArray.setColumnId(colIndex, referencedColumnId);
    }
  }

  /**
   * Public for access from {@link PartialReference}
   * 
   * @param name
   * @return
   * @throws JsonProcessingException
   * @throws IOException
   */
  public JSONObject getNameRange(String name) throws JsonProcessingException, IOException
  {
    if (nameRangeObject == null)
    {
      JSONObject obj = null;

      if (isFirstLoading)
      {
        obj = (JSONObject) partContentObject.get(ConversionConstant.NAME_RANGE);
      }
      else if (nameRangeBuffer != null)
      {
        JSONObjectGenerator jg = new JSONObjectGenerator();
        NamedRangeListener l = new NamedRangeListener(this);
        l.setState(NamedRangeListener.State.NAMES);
        jg.addListener(l);
        JsonParser jp = nameRangeBuffer.asParser();
        jp.nextToken();
        jg.copyCurrentStructure(jp);
        obj = jg.getRootObject();
      }

      if (obj != null)
      {
        nameRangeObject = new JSONObject();

        // copy obj to nameRangeObj, with key lowerCased
        Set<Entry<String, JSONObject>> entries = obj.entrySet();
        for (Iterator iterator = entries.iterator(); iterator.hasNext();)
        {
          Entry<String, JSONObject> entry = (Entry<String, JSONObject>) iterator.next();
          nameRangeObject.put(entry.getKey().toLowerCase(), entry.getValue());
        }
      }
    }
    if (nameRangeObject != null)
    {
      return (JSONObject) nameRangeObject.get(name.toLowerCase());
    }
    return null;
  }

  /**
   * Based on current PD context, if need to collect provided sheet. Public for accessing from PR.
   * 
   * @return false if no need to collect the sheet, true cannot determine by now.
   */
  public boolean shouldCollect(String sheetId)
  {
    // if want full criteria sheet, and sheetId equals criteriaSheetId, the sheet don't need to be collected
    // if is getting for more content, and sheetId equals criteriaSheetId, the sheet don't need to be collected
    return !((criteriaRowIdSet == null || isGettingMoreContent) && criteriaSheetId.equals(sheetId));
  }

  /**
   * Based on current PD context, if need to collect current row. Public for accessing from PR.
   * 
   * @return false if no need to collect the sheet, true cannot determine by now.
   */
  public boolean shouldCollect(String sheetId, String rowId)
  {
    if (!shouldCollect(sheetId))
    {
      // sheet no need to collect
      return false;
    }

    if (criteriaRowIdSet != null && criteriaRowIdSet.contains(rowId))
    {
      // current row is criteria row, don't collect
      return false;
    }

    return true;
  }

  /**
   * Based on current PD context, if need to collect provided cell. Public for accessing from PR.
   * 
   * @return false if no need to collect the sheet, true cannot determine by now.
   */
  public boolean shouldCollect(String sheetId, String rowId, String columnId)
  {
    if (!shouldCollect(sheetId))
    {
      return false;
    }

    if (!shouldCollect(sheetId, rowId))
    {
      return false;
    }

    if (cellCollector.lookingSheet(sheetId) && cellCollector.lookingRow(rowId) && cellCollector.lookingCell(columnId))
    {
      // cell is already collected
      return false;
    }

    return true;
  }

  /**
   * Public for access from {@link PartialReference}
   * 
   * @param object
   * @param key
   * @return
   */
  public int getIndexFromReference(JSONObject object, String key)
  {
    String id = (String) object.get(key);
    if (id == null)
    {
      return ID_IS_NULL;
    }
    if (id.equals(ConversionConstant.MAX_REF))
    {
      String address = (String) object.get(ConversionConstant.RANGE_ADDRESS);
      ParsedRef ref = ReferenceParser.parse(address);
      if (ref.getType() == ParsedRefType.ROW && key.equals(ConversionConstant.RANGE_ENDCOLID))
        return ConversionConstant.MAX_COL_NUM;
      if (ref.getType() == ParsedRefType.COLUMN && key.equals(ConversionConstant.RANGE_ENDROWID))
        return ConversionConstant.MAX_ROW_NUM;
      if (key.equals(ConversionConstant.RANGE_STARTROWID) || key.equals(ConversionConstant.ROWID_NAME))
      {
        return ReferenceParser.translateRow(ref.startRow);
      }
      if (key.equals(ConversionConstant.RANGE_ENDROWID))
      {
        return ReferenceParser.translateRow(ref.endRow);
      }
      if (key.equals(ConversionConstant.RANGE_STARTCOLID) || key.equals(ConversionConstant.COLUMNID_NAME))
      {
        return ReferenceParser.translateCol(ref.startCol);
      }
      if (key.equals(ConversionConstant.RANGE_ENDCOLID))
      {
        return ReferenceParser.translateCol(ref.endCol);
      }
    }
    else
    {
      String sheetId = (String) object.get(ConversionConstant.SHEETID);
      if (key.equals(ConversionConstant.RANGE_STARTROWID) || key.equals(ConversionConstant.RANGE_ENDROWID)
          || key.equals(ConversionConstant.ROWID_NAME))
      {
        return rowColIdIndexMeta.getRowIndexById(sheetId, id);
      }

      if (key.equals(ConversionConstant.RANGE_STARTCOLID) || key.equals(ConversionConstant.RANGE_ENDCOLID)
          || key.equals(ConversionConstant.COLUMNID_NAME))
      {
        return rowColIdIndexMeta.getColIndexById(sheetId, id);
      }
    }

    return -1;
  }
  
  public void setCriteria(JSONObject criteria)
  {
    this.criteria = criteria;
  }

  public void setContentJsonParser(JsonParser contentJp)
  {
    this.contentJp = contentJp;
  }
  public List<String> getSheetNames(String startsheetname, String endsheetname)
  {
    ArrayList<String> ret = new ArrayList<String>();
    Integer startindex = this.sheetName2Index.get(startsheetname);
    Integer endindex = this.sheetName2Index.get(endsheetname);
    if (startindex!=null && endindex!=null)
    {
      JSONArray idArray = (JSONArray) metaObject.get(ConversionConstant.SHEETSIDARRAY);
      for (int i = startindex; i <= endindex; i++)
      {
         String sheetid = idArray.get(i).toString();
         ret.add(this.sheetId2Name.get(sheetid));
      }
    }
    return ret;
  }
  public void setMetaObject(JSONObject o)
  {
    metaObject = o;

    JSONObject sheets = (JSONObject) metaObject.get(ConversionConstant.SHEETS);
    Iterator<Map.Entry<String, JSONObject>> itor = sheets.entrySet().iterator();
    while (itor.hasNext())
    {
      Map.Entry<String, JSONObject> entry = itor.next();
      String id = entry.getKey();
      JSONObject sheet = entry.getValue();
      String sheetName = (String) sheet.get(ConversionConstant.SHEETNAME);
      this.sheetName2Id.put(sheetName, id);
      this.sheetId2Name.put(id, sheetName);
    }
    JSONArray idArray = (JSONArray) metaObject.get(ConversionConstant.SHEETSIDARRAY);
    int idArraySize = idArray.size();
    for (int i = 0; i < idArraySize; i++)
    {
      String sheetid = idArray.get(i).toString();
      {
        String sheetname = this.sheetId2Name.get(sheetid);
        if (sheetname != null)
        {
          this.sheetName2Index.put(sheetname, i);
        }
      }
    }
  }

  public void setPartialReference(PartialReference partialReference)
  {
    this.partialReference = partialReference;
  }

  public void setNRJSPartialReference(NRJSPartialReference nrjspartialReference)
  {
    this.nrjspartialReference = nrjspartialReference;
  }

  public Set<String> getNameRangeSet()
  {
    return nameRangeSet;
  }

  public void setDocumentVersion(String ver)
  {
    this.documentVersion = DocumentVersion.parseVersionString(ver);
  }

  public void setDraftRootUri(String draftRootUri)
  {
    this.draftRootUri = draftRootUri;
  }

  public boolean isHasMoreContent()
  {
    return hasMoreContent;
  }

  public int getCriteriaStartRow()
  {
    return criteriaStartRow;
  }

  public void setCriteriaStartRow(int criteriaStartRow)
  {
    this.criteriaStartRow = criteriaStartRow;
  }

  public int getCriteriaEndRow()
  {
    return criteriaEndRow;
  }

  public void setCriteriaEndRow(int criteriaEndRow)
  {
    this.criteriaEndRow = criteriaEndRow;
  }

  public String getCriteriaSheetId()
  {
    return criteriaSheetId;
  }

  public void setCriteriaSheetId(String criteriaSheetId)
  {
    this.criteriaSheetId = criteriaSheetId;
  }

  /*
   * ONLY used by following iteratingSerializing method to workaround TokenBuffer.Parser getCurrentName() bug.
   */
  private String _fieldName;

  /*
   * Specialized version for the buggy TokenBuffer.Parser. The Parser TokenBuffer returns has a bug that, the getCurrentName() returns null
   * for the value after a FIELD_NAME. To workaround this, we must walk through every token and save the field name for a FIELD_NAME token.
   * 
   * @deperated use this ONLY on TokenBuffer.Parser.
   */
  private void _iterateSerializing(JsonParser jsonParser, JsonGenerator jsonGenerator, IValueHandler handler) throws JsonParseException,
      IOException
  {
    JsonToken jsonToken = jsonParser.getCurrentToken();
    // jump to a JSON value (non-FIELD_NAME)
    if (jsonToken == JsonToken.FIELD_NAME)
    {
      // save the field_name token
      _fieldName = jsonParser.getText();
      jsonToken = jsonParser.nextToken();
    }

    IValueHandlerResult result = null;

    while (result == null || result.getOperation() != OPERATION.OP_RESULT_END)
    {
      if (jsonToken == JsonToken.FIELD_NAME)
      {
        // save the field_name token
        _fieldName = jsonParser.getText();
        jsonToken = jsonParser.nextToken();
      }
      result = handler.handle(jsonParser);
      switch (result.getOperation())
        {
          case OP_RESULT_END :
            // do nothing, ends the iteration
            break;
          case OP_ITERATE_DEEPER :
            // move deeper in
            jsonGenerator.writeFieldName(_fieldName);
            jsonGenerator.writeStartObject();
            // move inside current value
            jsonToken = jsonParser.nextToken();
            _iterateSerializing(jsonParser, jsonGenerator, (IValueHandler) result.getContext());
            jsonGenerator.writeEndObject();
            // to let next iterate found the FIELD_NAME token, we must use nextToken() instead of
            // nextValue().
            jsonToken = jsonParser.nextToken();
            break;
          case OP_RESULT_SKIP :
            jsonParser.skipChildren();
            jsonToken = jsonParser.nextToken();
            break;
          case OP_RESULT_TAKE_ORIGIN :
            // if current token is START_OBJECT or START_ARRAY, the copy() interace
            // will write START_OBJECT but not the FIELD_NAME, write the field name outside it
            jsonToken = jsonParser.getCurrentToken();
            if (jsonToken != JsonToken.FIELD_NAME)
            {
              jsonGenerator.writeFieldName(_fieldName);
            }
            jsonGenerator.copyCurrentStructure(jsonParser);
            jsonToken = jsonParser.nextToken();
            break;
          default:
            jsonToken = jsonParser.nextToken();
            break;
        }
    }
    // no onEnd() needed
  }

  /*
   * Fix the criteria sheet id in case that the selected criteria sheet is hidden. It looks for a un-hidden sheet cyclly (1st sheet -> last
   * sheet -> 1st sheet) starting from the criteria sheet to look for a un-hide sheet.
   */
  private void fixCriteriaSheetId()
  {
    JSONArray idArray = (JSONArray) metaObject.get(ConversionConstant.SHEETSIDARRAY);
    JSONObject sheetsMeta = (JSONObject) metaObject.get(ConversionConstant.SHEETS);
    JSONObject sheet = (JSONObject) sheetsMeta.get(criteriaSheetId);
    String vis = (String) sheet.get(ConversionConstant.VISIBILITY);
    int pSheet = -1;
    int pStart = -1;
    while (ConversionConstant.SHEETHIDE.equals(vis) || ConversionConstant.SHEETVERYHIDE.equals(vis))
    {
      // selected criteria sheet is hidden, turn to next sheet
      if (pSheet == -1)
      {
        // which sheet are we in?
        // pSheet = ((Number) sheet.get(ConversionConstant.SHEETINDEX)).intValue() - 1;
        // pStart = pSheet;
        int idArraySize = idArray.size();
        for (int i = 0; i < idArraySize; i++)
        {
          if (idArray.get(i).equals(criteriaSheetId))
          {
            pSheet = i;
            pStart = pSheet;
            break;
          }
        }
      }

      // check next sheet
      pSheet++;
      if (pSheet == idArray.size())
      {
        pSheet = 0;
      }
      // cycle back to the start, we get an error
      if (pSheet == pStart)
      {
        LOG.log(Level.WARNING, "Loaded document does not have a visible sheet.");
        break;
      }
      criteriaSheetId = (String) idArray.get(pSheet);
      sheet = (JSONObject) sheetsMeta.get(criteriaSheetId);
      vis = (String) sheet.get(ConversionConstant.VISIBILITY);
    }
  }

  private static class BooleanCategoryStyleListener extends AbstractJsonGeneratorListener
  {
    private Set<String> styleIdSet;

    private enum State {
      STYLE, STYLE_ID, STYLE_FORMAT, STYLE_FORMAT_CATEGORY;
    };

    private State state;

    private String styleId;

    public BooleanCategoryStyleListener(PartialDeserializer d)
    {
      styleIdSet = d.booleanStyleIdSet;
      state = State.STYLE;
    }

    @Override
    public void onEndObject()
    {
      switch (state)
        {
          case STYLE :
            // end of STYLE means end of the section, never happens...
            break;
          case STYLE_ID :
            state = State.STYLE;
            break;
          case STYLE_FORMAT :
            state = State.STYLE_ID;
            break;
          default:
            break;
        }
    }

    @Override
    public void onFieldName(String name)
    {
      switch (state)
        {
          case STYLE :
            // name is style id
            styleId = name;
            state = State.STYLE_ID;
            break;
          case STYLE_ID :
            if (ConversionConstant.FORMAT.equals(name))
            {
              state = State.STYLE_FORMAT;
            }
            break;
          case STYLE_FORMAT :
            if (ConversionConstant.FORMATCATEGORY.equals(name))
            {
              state = State.STYLE_FORMAT_CATEGORY;
            }
            break;
          default:
            break;
        }
    }

    @Override
    public String onString(String s)
    {
      if (state == State.STYLE_FORMAT_CATEGORY)
      {
        if (ConversionConstant.BOOLEAN_TYPE.equals(s))
        {
          styleIdSet.add(styleId);
        }
        state = State.STYLE_FORMAT;
      }

      return s;
    }
  }

  // listens content.styles
  private class StyleListener extends AbstractJsonGeneratorListener
  {
    private Set<String> styleIdSet;

    private boolean inStyle;

    public StyleListener(PartialDeserializer d)
    {
      styleIdSet = d.styleIdSet;
      inStyle = false;
    }

    @Override
    public void onFieldName(String name)
    {
      if (!inStyle)
      {
        inStyle = name.equals(ConversionConstant.STYLEID);
      }
    }

    public String onString(String s)
    {
      if (inStyle)
      {
        inStyle = false;
        styleIdSet.add(s);
      }
      return s;
    }
  }

  /*
   * Listener that collects all "id"s appeared in ranges JSON, also collects styleid written. Declared "static" to contain STATE enum.
   */
  private static class IdInRangeListener extends AbstractJsonGeneratorListener
  {
    private enum State {
      RANGE, RANGE_ID, RANGE_DATA, ATTR_SHEETID, ATTR_START_ROWID, ATTR_START_COLUMN_ID, ATTR_END_ROWID, ATTR_END_COLUMNID
    }

    private State state = null;

    private String sheetId, startRowId, endRowId, startColumnId, endColumnId;

    private PartialDeserializer deserializer;

    public IdInRangeListener(PartialDeserializer d)
    {
      deserializer = d;
    }

    @Override
    public void onFieldName(String name)
    {
      if (state == null)
      {
        if (name.equals(ConversionConstant.NAMES_REFERENCE) || name.equals(ConversionConstant.UNNAME_RANGE)
            || name.equals(ConversionConstant.PRESERVE_NAMES_RANGE))
        {
          state = State.RANGE;
        }
      }
      else if (state == State.RANGE)
      {
        state = State.RANGE_ID;
      }
      else if (state == State.RANGE_ID)
      {
        if (name.equals(ConversionConstant.SHEETID))
        {
          state = State.ATTR_SHEETID;
        }
        else if (name.equals(ConversionConstant.RANGE_STARTROWID))
        {
          state = State.ATTR_START_ROWID;
        }
        else if (name.equals(ConversionConstant.RANGE_ENDROWID))
        {
          state = State.ATTR_END_ROWID;
        }
        else if (name.equals(ConversionConstant.RANGE_STARTCOLID))
        {
          state = State.ATTR_START_COLUMN_ID;
        }
        else if (name.equals(ConversionConstant.RANGE_ENDCOLID))
        {
          state = State.ATTR_END_COLUMNID;
        }
        else if (name.equals(ConversionConstant.DATA))
        {
          state = State.RANGE_DATA;
        }
        else
        {
          // no interest
          ;
        }
      }
      else
      {
        // no interest
      }
    }

    @Override
    public void onEndObject()
    {
      if (state != null)
      {
        switch (state)
          {
            case RANGE_ID :
              state = State.RANGE;
              // collect id
              // if part of the row/column id is not null, should collect it for name range
              // it is used for delete row/column undo in client side,
              // because all name range address change to #REF!, rather than #REF!1 or A#REF!
              if (sheetId != null)// && startRowId != null && startColumnId != null)
              {
                deserializer.collectIdsInRange(sheetId, startRowId, endRowId, startColumnId, endColumnId);
              }
              sheetId = null;
              startRowId = null;
              endRowId = null;
              startColumnId = null;
              endColumnId = null;
              break;
            case RANGE_DATA :
              state = State.RANGE_ID;
              break;
            case RANGE :
              state = null;
              break;
            default:
              // no interest
              ;
          }
      }
    }

    @Override
    public String onString(String s)
    {
      if (state != null)
      {
        switch (state)
          {
            case ATTR_SHEETID :
              sheetId = s;
              state = State.RANGE_ID;
              break;
            case ATTR_END_COLUMNID :
              endColumnId = s;
              state = State.RANGE_ID;
              break;
            case ATTR_END_ROWID :
              endRowId = s;
              state = State.RANGE_ID;
              break;
            case ATTR_START_COLUMN_ID :
              startColumnId = s;
              state = State.RANGE_ID;
              break;
            case ATTR_START_ROWID :
              startRowId = s;
              state = State.RANGE_ID;
              break;
            default:
              // no interest
              ;
          }
      }
      return s;
    }
  }

  /*
   * listens for cells.<id>.v, cells.<id>.cv, cells.<id>.d, do the following,
   * 
   * 1) for formula value, when document doesn't have DocumentFeature.ALWAYS_UPDATED_FORMULA, update formula value. 2) for formula value,
   * prioritize the formula 3) when document doesn't have DocumentFeature.TYPED_CELL, update cell type data
   */
  private static class CellListener extends AbstractJsonGeneratorListener
  {
    private enum State {
      SHEETS, SHEET, ROWS, ROW, COLUMN, VALUE, CALCVALUE, ISDIRTY, STYLE_ID, CELL_TYPE
    };

    private PartialDeserializer deserializer;

    private RowColIdIndexMeta rowColIdIndexMeta;

    private PartialReference partialReference;

    private NRJSPartialReference nrjspartialReference;

    private boolean isNRJS = false;

    private SheetMeta sheetMeta;

    private State state;

    private String sheetId, rowId, columnId, styleId;

    private Object value, calcValue;

    private boolean isDirty;

    private JSONObjectGenerator generator;

    private boolean isImpactedCell;

    private Set<String> booleanStyleIdSet;

    private int cellType;

    public CellListener(PartialDeserializer d)
    {
      deserializer = d;
      rowColIdIndexMeta = d.rowColIdIndexMeta;
      partialReference = d.partialReference;
      nrjspartialReference = d.nrjspartialReference;
      isNRJS = d.isNRJSMode;
      JSONObject metaObject = d.metaObject;
      sheetMeta = new SheetMeta((JSONObject) metaObject.get(ConversionConstant.SHEETS),
          (JSONArray) metaObject.get(ConversionConstant.SHEETSIDARRAY));
      state = null;
      isImpactedCell = false;
      booleanStyleIdSet = d.booleanStyleIdSet;
    }

    @Override
    public void onEndObject()
    {
      if (state != null)
      {
        switch (state)
          {
            case SHEETS :
              state = null;
              break;
            case SHEET :
              sheetId = null;
              state = State.SHEETS;
              break;
            case ROWS :
              state = State.SHEET;
              break;
            case ROW :
              state = State.ROWS;
              rowId = null;
              break;
            case VALUE :
            case CALCVALUE :
            case STYLE_ID :
            case ISDIRTY :
            case CELL_TYPE :
              state = State.COLUMN;
              break;
            case COLUMN :
              state = State.ROW;

              if (!deserializer.documentVersion.hasFeature(DocumentFeature.TYPED_CELL))
              {
                if (value != null)
                {
                  // add cell type
                  if (isDirty)
                  {
                    // dirty cell, abandon calcValue,
                    calcValue = null;
                  }
                  int cellType = CommonUtils.getCellType(value, calcValue, (styleId != null && booleanStyleIdSet.contains(styleId)));
                  if (cellType != 0)
                  {
                    ((JSONObject) generator.getCurrentObject()).put(ConversionConstant.CELL_TYPE, cellType);
                  }
                  if (calcValue != null)
                  {
                    // fix calcValue and write back
                    ((JSONObject) generator.getCurrentObject()).put(ConversionConstant.CALCULATEDVALUE,
                        CommonUtils.fixValueByType(calcValue, cellType));
                  }
                  else
                  {
                    // fix rawvalue
                    ((JSONObject) generator.getCurrentObject()).put(ConversionConstant.VALUE, CommonUtils.fixValueByType(value, cellType));
                  }
                }
                // else, cell no value, skip
              }
              else
              {
                // disable following code for now, don't fix boolean value in such case
                // disabled: deal with the exception that cell is boolean type and value is not fixed to 0 and 1
                if (false && cellType >> 3 == ConversionConstant.CELL_TYPE_BOOLEAN)
                {
                  // try to fix boolean cell
                  if ((cellType & ConversionConstant.FORMULA_TYPE_MASK) != 0)
                  {
                    // is formula cell, check conversion value
                    ((JSONObject) generator.getCurrentObject()).put(ConversionConstant.CALCULATEDVALUE,
                        CommonUtils.fixValueByType(calcValue, cellType));
                  }
                  else
                  {
                    // not formula cell, check value
                    ((JSONObject) generator.getCurrentObject()).put(ConversionConstant.VALUE, CommonUtils.fixValueByType(value, cellType));
                  }
                }
              }

              columnId = null;
              isDirty = false;
              value = null;
              calcValue = null;
              styleId = null;
              cellType = 0;
              break;
            default:
              break;
          }
      }
    }

    @Override
    public void onFieldName(String name)
    {
      if (state == null)
      {
        if (name.equals(ConversionConstant.SHEETS))
        {
          state = State.SHEETS;
        }
      }
      else
      {
        switch (state)
          {
            case SHEETS :
              // sheet id
              sheetId = name;
              state = State.SHEET;
              break;
            case SHEET :
              // rows
              state = State.ROWS;
              break;
            case ROWS :
              state = State.ROW;
              rowId = name;
              break;
            case ROW :
              state = State.COLUMN;
              columnId = name;
              break;
            case COLUMN :
              if (name.equals(ConversionConstant.VALUE))
              {
                state = State.VALUE;
              }
              else if (name.equals(ConversionConstant.CALCULATEDVALUE))
              {
                state = State.CALCVALUE;
              }
              else if (name.equals(ConversionConstant.CELL_DIRTY))
              {
                state = State.ISDIRTY;
              }
              else if (name.equals(ConversionConstant.STYLEID))
              {
                state = State.STYLE_ID;
              }
              else if (name.equals(ConversionConstant.CELL_TYPE))
              {
                state = State.CELL_TYPE;
              }
              break;
            default:
              break;
          }
      }
    }

    @Override
    public String onString(String s)
    {
      if (state == State.VALUE)
      {
        state = State.COLUMN;

        if (isFormulaString(s))
        {
           if (this.isNRJS) {
             String sheetName = deserializer.sheetId2Name.get(sheetId);
             this.nrjspartialReference.processFormularString(sheetName, sheetId, rowId, columnId, s);
           }
          if (!deserializer.documentVersion.hasFeature(DocumentFeature.ALWAYS_UPDATED_FORMULA))
          {
            try
            {
              if (isNRJS)
              {
                s = nrjspartialReference.updateFormula(sheetId, rowId, columnId, s, rowColIdIndexMeta, sheetMeta);
              }
              else
              {
                s = partialReference.updateFormula(sheetId, rowId, columnId, s, rowColIdIndexMeta, sheetMeta);
              }
            }
            catch (Exception e)
            {
              LOG.log(Level.WARNING, "updateFormula error, keep origin formula", e);
            }
          }

          if (false)
          {
            // priortize formula
            String pF = FormulaPrioritizer.prioritize(s);
            if (!pF.equals(s))
            {
              if (LOG.isLoggable(Level.FINEST))
              {
                LOG.log(Level.FINEST, "in ({0}, {1}, {2}), prioritize formula to {3}, add back to cell object as \"fv\".", new String[] {
                    sheetId, rowId, columnId, pF });
              }
              ((JSONObject) generator.getCurrentObject()).put(ConversionConstant.FORMULA_VALUE, pF);
            }
          }
          if (isImpactedCell)
          {
            ((JSONObject) generator.getCurrentObject()).put(ConversionConstant.PARTIAL_REFERENCE, Boolean.TRUE);
          }
        }

        value = s;
      }
      else if (state == State.CALCVALUE)
      {
        calcValue = s;
        state = State.COLUMN;
      }
      else if (state == State.STYLE_ID)
      {
        styleId = s;
        state = State.COLUMN;
      }

      return s;
    }

    @Override
    public void onWriteNumber(Number n)
    {
      if (state == State.VALUE)
      {
        state = State.COLUMN;
        value = n;
      }
      else if (state == State.CALCVALUE)
      {
        state = State.COLUMN;
        calcValue = n;
      }
      else if (state == State.CELL_TYPE)
      {
        state = State.COLUMN;
        cellType = n.intValue();
      }
    }

    @Override
    protected void onWriteDefault(Object o)
    {
      if (state == State.VALUE || state == State.CALCVALUE || state == State.ISDIRTY || state == State.STYLE_ID)
      {
        state = State.COLUMN;
      }
    }

    @Override
    public void onWriteBoolean(boolean b)
    {
      if (state == State.ISDIRTY)
      {
        isDirty = b;
        state = State.COLUMN;
      }
    }

    public void setState(State s)
    {
      state = s;
      rowId = null;
    }

    public void setSheetId(String s)
    {
      sheetId = s;
    }

    public void setGenerator(JSONObjectGenerator generator)
    {
      this.generator = generator;
    }

    public boolean isImpactedCell()
    {
      return isImpactedCell;
    }

    public void setImpactedCell(boolean isImpactedCell)
    {
      this.isImpactedCell = isImpactedCell;
    }
  }

  // listens on content.sheets.<id>.rows.{ ... }, remove empty rows
  private static class RowsListener extends AbstractJsonGeneratorListener
  {
    private enum State {
      ROWS, ROW, COLUMN
    };

    private State state;

    private String rowId;

    private JSONObjectGenerator generator;

    public RowsListener()
    {
      state = null;
    }

    public void setGenerator(JSONObjectGenerator generator)
    {
      state = null;
      rowId = null;
      this.generator = generator;
    }

    @Override
    public void onEndObject()
    {
      if (state != null)
      {
        switch (state)
          {
            case COLUMN :
              state = State.ROW;
              break;
            case ROW :
              state = State.ROWS;
              // row closing, tidy this row if possible
              JSONObject row = (JSONObject) generator.getCurrentObject();
              if (row.isEmpty())
              {
                if (LOG.isLoggable(Level.FINER))
                {
                  LOG.log(Level.FINER, "generating while row {0} is empty, remove it from 'rows' element.", rowId);
                }
                JSONObject rows = (JSONObject) generator.peekObject();
                rows.remove(rowId);
              }
              rowId = null;
              break;
            case ROWS :
              state = null;
              break;
            default:
              // never here;
          }
      }
    }

    @Override
    public void onFieldName(String name)
    {
      if (state == null)
      {
        if (name.equals(ConversionConstant.ROWS))
        {
          state = State.ROWS;
        }
      }
      else
      {
        switch (state)
          {
            case ROWS :
              state = State.ROW;
              rowId = name;
              break;
            case ROW :
              state = State.COLUMN;
              break;
            case COLUMN :
              // inside cell, meeting "v", "sid", etc..., still in cell, do nothing
              break;
            default:
              // never here
          }
      }
    }
  }

  // listens in content.sheets.<id>.rows.<rowid>.<colid>.{...}, calculates max column index
  private static class MaxColumnIndexListener extends AbstractJsonGeneratorListener
  {
    private PartialDeserializer deserializer;

    private int maxColumnIndex;

    private RowColIdIndexMeta rowColIdIndexMeta;

    private String columnId;

    private int repeat;

    private String sheetId;

    private boolean isCellNotNull;

    private boolean isCellDefaultStyle;

    private enum State {
      ROWS, ROW, COLUMN, REPEATEDNUM, VALUE, STYLEID
    };

    private State state;

    public MaxColumnIndexListener(PartialDeserializer d)
    {
      deserializer = d;
      maxColumnIndex = d.maxColumnIndex;
      rowColIdIndexMeta = d.rowColIdIndexMeta;
      sheetId = d.criteriaSheetId;
      columnId = null;
      repeat = 0;
    }

    @Override
    public void onEndObject()
    {
      if (state != null)
      {
        switch (state)
          {
            case COLUMN :
              state = State.ROW;
              if (columnId != null && (!isCellDefaultStyle || isCellNotNull))
              {
                int colIndex = rowColIdIndexMeta.getColIndexById(sheetId, columnId);
                if (repeat > 0)
                {
                  colIndex += repeat;
                }
                if (colIndex > maxColumnIndex)
                {
                  if (colIndex > ConversionConstant.MAX_SHOW_COL_NUM)
                  {
                    // if column index > 52, only update max index when cell has value
                    if (isCellNotNull)
                    {
                      maxColumnIndex = colIndex;
                    }
                    else
                    {
                      // if is not > 52, update as 52
                      if (maxColumnIndex < ConversionConstant.MAX_SHOW_COL_NUM)
                      {
                        maxColumnIndex = ConversionConstant.MAX_SHOW_COL_NUM;
                      }
                    }
                  }
                  else
                  {
                    maxColumnIndex = colIndex;
                  }
                }
              }

              columnId = null;
              repeat = 0;
              break;
            case ROW :
              state = State.ROWS;
              break;
            case ROWS :
              state = null;
              break;
            default:
              // never here;
          }
      }
    }

    @Override
    public void onFieldName(String name)
    {
      if (state == null)
      {
        if (name.equals(ConversionConstant.ROWS))
        {
          state = State.ROWS;
        }
      }
      else
      {
        switch (state)
          {
            case ROWS :
              state = State.ROW;
              break;
            case ROW :
              state = State.COLUMN;
              isCellNotNull = false;
              isCellDefaultStyle = false;
              columnId = name;
              break;
            case COLUMN :
              // inside cell
              if (name.equals(ConversionConstant.REPEATEDNUM))
              {
                state = State.REPEATEDNUM;
              }
              else if (name.equals(ConversionConstant.VALUE))
              {
                state = State.VALUE;
              }
              else if (name.equals(ConversionConstant.STYLEID))
              {
                state = State.STYLEID;
              }
              else
              {
                // not interested
                ;
              }

              break;
            default:
              // never here
          }
      }
    }

    @Override
    public String onString(String s)
    {
      if (state == State.STYLEID)
      {
        state = State.COLUMN;
        isCellDefaultStyle = s.equals(ConversionConstant.DEFAULT_CELL_STYLE);
      }

      return super.onString(s);
    }

    @Override
    public void onWriteNumber(Number n)
    {
      if (state == null)
      {
        return;
      }

      switch (state)
        {
          case REPEATEDNUM :
            repeat = n.intValue();
            state = State.COLUMN;
            break;
          case VALUE :
            isCellNotNull = true;
            state = State.COLUMN;
            break;
          default:
            // not interested
            break;
        }
    }

    @Override
    protected void onWriteDefault(Object o)
    {
      if (state == State.VALUE)
      {
        state = State.COLUMN;
        if (o instanceof String)
        {
          isCellNotNull = o != null && ((String) o).length() > 0;
        }
        else
        {
          isCellNotNull = o != null;
        }
      }
    }
  }

  // listener when reading named range, find named range that references to current criteria sheet
  private static class NamedRangeListener extends AbstractJsonGeneratorListener
  {
    private String criteriaSheetId;

    private enum State {
      NAMES, OBJECT, SHEET_ID, START_ROW_ID
    };

    private State state;

    private String rangeName;

    private Set<String> nameSet;

    private Set<String> criteriaRowIdSet;

    private String sheetId, startRowId;

    public NamedRangeListener(PartialDeserializer d)
    {
      criteriaSheetId = d.criteriaSheetId;
      nameSet = d.nameRangeSet;
      state = null;
      criteriaRowIdSet = d.criteriaRowIdSet;
    }

    @Override
    public void onEndObject()
    {
      if (state != null)
      {
        switch (state)
          {
            case NAMES :
              state = null;
              break;
            case OBJECT :
              state = State.NAMES;
              if (criteriaRowIdSet == null || IGNORE_IMPACT_CELLS_IN_CRITERIA_SHEET)
              {
                if (criteriaSheetId.equals(sheetId))
                {
                  nameSet.add(rangeName);
                }
              }
              else
              {
                if (criteriaRowIdSet.contains(startRowId))
                {
                  nameSet.add(rangeName);
                }
              }
              sheetId = null;
              startRowId = null;
              break;
            case SHEET_ID :
              // never here
              break;
            default:
              break;
          }
      }
    }

    @Override
    public String onString(String s)
    {
      if (state != null)
      {
        switch (state)
          {
            case SHEET_ID :
              sheetId = s;
              state = State.OBJECT;
              break;
            case START_ROW_ID :
              startRowId = s;
              state = State.OBJECT;
              break;
            default:
              // don't care
              break;
          }
      }

      return s;
    }

    @Override
    public void onFieldName(String name)
    {
      if (state == null)
      {
        if (name.equals(ConversionConstant.NAME_RANGE))
        {
          state = State.NAMES;
        }
      }
      else
      {
        switch (state)
          {
            case NAMES :
              rangeName = name;
              state = State.OBJECT;
              break;
            case OBJECT :
              if (name.equals(ConversionConstant.SHEETID))
              {
                state = State.SHEET_ID;
              }
              else if (name.equals(ConversionConstant.RANGE_STARTROWID))
              {
                state = State.START_ROW_ID;
              }

              break;
            case SHEET_ID :
              // never here
              break;
            case START_ROW_ID :
              // never here
            default:
              // never here
              break;
          }
      }
    }

    public void setState(State s)
    {
      state = s;
    }
  }

  // listens unnamed range defs in content, calculates its max column index
  // also records sheets that have unnamed ranges, in order to update its max row index
  // will also get the style IDs used by conditional format
  private static class UnnamedRangeListener extends AbstractJsonGeneratorListener
  {
    private RowColIdIndexMeta rowColIdIndexMeta;

    private boolean interested;
    
    private Set<String> styleIdSet;

    private enum State {
      UNNAMES, OBJECT, DATA_OBJECT, CRITERIAS_OBJECT, ATTR_USAGE, ATTR_SHEETID, ATTR_SCID, ATTR_ECID, ATTR_HREF, ATTR_STYLEID, END
    };

    private List<String> CF_CRITERIA_KEYS = Arrays.asList("type", "operator", "priority", "stopIfTrue", "styleid", "dxfId", "cfvos", "gte", "val", "colors", "clr1", "clr2", "clr3", "iconset_iconSet", "iconset_showValue","iconset_percent","iconset_reverse","databar_x14id");
    
    private State state;

    private String scid, ecid, srid, erid, sheetId, criteriaSheetId;

    private int maxColIndex;

    private String usage;

    private String href;

    private Set<String> unnamedRangeSheetsSet;

    private Set<String> chartsInSheet;

    private Set<String> chartsNotInSheet;

    public UnnamedRangeListener(PartialDeserializer d)
    {
      rowColIdIndexMeta = d.rowColIdIndexMeta;
      criteriaSheetId = d.criteriaSheetId;
      state = null;
      maxColIndex = 0;
      unnamedRangeSheetsSet = new HashSet<String>();
      chartsInSheet = new HashSet<String>();
      chartsNotInSheet = new HashSet<String>();
      styleIdSet = d.styleIdSet;
    }

    @Override
    public void onEndObject()
    {
      if (state != null)
      {
        switch (state)
          {
            case UNNAMES :
              state = State.END;
              break;
            case DATA_OBJECT :
              state = State.OBJECT;
              break;
            case OBJECT :
              state = State.UNNAMES;

              if (interested)
              {
                unnamedRangeSheetsSet.add(sheetId);
                if (criteriaSheetId.equals(sheetId))
                {
                  int colIndex = 0;

                  if (ecid != null)
                  {
                    colIndex = rowColIdIndexMeta.getColIndexById(sheetId, ecid);
                  }
                  else if (scid != null)
                  {
                    colIndex = rowColIdIndexMeta.getColIndexById(sheetId, scid);
                  }
                  if (colIndex > maxColIndex)
                  {
                    maxColIndex = colIndex;
                  }
                }
              }
              if (usage != null && usage.equals(ConversionConstant.USAGE_CHART))
              {
                if (sheetId != null && sheetId.equals(criteriaSheetId))
                  chartsInSheet.add(href);
                else
                  chartsNotInSheet.add(href);
              }

              break;
            default:
              // no interest
              break;
          }
      }
    }

    @Override
    public void onFieldName(String name)
    {
      if (state == null)
      {
        if (name.equals(ConversionConstant.UNNAME_RANGE))
        {
          state = State.UNNAMES;
        }
      }
      else
      {
    	// check and exit CRITERIAS_OBJECT state onFieldName because it's not doable in onEndObject
    	if (State.CRITERIAS_OBJECT == state) {
    		boolean cfField = CF_CRITERIA_KEYS.contains(name);
    		if (!cfField) {
    			state = State.OBJECT;
    		}
    	}
    	
        switch (state)
          {
            case UNNAMES :
            case END:
              state = State.OBJECT;
              interested = false;
              scid = null;
              ecid = null;
              srid = null;
              erid = null;
              sheetId = null;
              break;
            case OBJECT :
              if (name.equals(ConversionConstant.RANGE_USAGE))
              {
                state = State.ATTR_USAGE;
              }
              else if (name.equals(ConversionConstant.RANGE_STARTCOLID))
              {
                state = State.ATTR_SCID;
              }
              else if (name.equals(ConversionConstant.RANGE_ENDCOLID))
              {
                state = State.ATTR_ECID;
              }
              else if (name.equals(ConversionConstant.SHEETID))
              {
                state = State.ATTR_SHEETID;
              }
              else if (name.equals(ConversionConstant.DATA))
              {
                state = State.DATA_OBJECT;
              }
              else
              {
                // no interest
                ;
              }
              break;
            case DATA_OBJECT :
              if (name.equals("href"))
              {
                state = State.ATTR_HREF;
              }
              else if(name.equals(ConversionConstant.CRITERIAS))
              {
              	state = State.CRITERIAS_OBJECT;
              }  
              break;
            case CRITERIAS_OBJECT :
                if(name.equals(ConversionConstant.STYLEID_A))
                {
              	  state = State.ATTR_STYLEID;
                }            	
            	break;
            default:
              break;
            // no interest
          }
      }
    }

    @Override
    public String onString(String s)
    {
      if (state != null)
      {
        switch (state)
          {
            case ATTR_SHEETID :
              sheetId = s;
              state = State.OBJECT;
              break;
            case ATTR_ECID :
              ecid = s;
              state = State.OBJECT;
              break;
            case ATTR_SCID :
              scid = s;
              state = State.OBJECT;
              break;
            case ATTR_USAGE :
              interested = s.equals(ConversionConstant.USAGE_IMAGE) || s.equals(ConversionConstant.USAGE_COMMENTS)
                  || s.equals(ConversionConstant.USAGE_CHART_AS_IMAGE) || s.equals(ConversionConstant.USAGE_FILTER)
                  || s.equals(ConversionConstant.USAGE_CHART) || s.equals(ConversionConstant.USAGE_CONDITIONAL_FORMAT)
                  || s.equals(ConversionConstant.USAGE_SHAPE);
              usage = s;
              state = State.OBJECT;
              break;
            case ATTR_HREF :
              href = s;
              state = State.DATA_OBJECT;
              break;
            case ATTR_STYLEID :            	
            	styleIdSet.add(s);
            	state = State.CRITERIAS_OBJECT;
            	break;
            default:
              break;
          }
      }

      return s;
    }

    public void setState(State state)
    {
      this.state = state;
    }
  }

  /*
   * Handler for content
   */
  private class ContentHandler extends DefaultValueHandler
  {
    public ContentHandler(PartialDeserializer d)
    {
      ;
    }

    protected IValueHandlerResult doHandle(JsonParser jsonParser) throws JsonParseException, IOException
    {
      String fieldName = jsonParser.getCurrentName();

      if (fieldName == null)
      {
        return IValueHandlerResult.NEXT;
      }
      else if (fieldName.equals(ConversionConstant.SHEETS))
      {
        return new IValueHandlerResult.IterateDeeper(new SheetsHandler());
      }
      else if (fieldName.equals(ConversionConstant.UNNAME_RANGE))
      {
        if (isFirstLoading)
        {
          return new IValueHandlerResult.IterateDeeper(new UnnamedRangeHandler());
        }
        else
        {
          UnnamedRangeListener l = (UnnamedRangeListener) unnamedRangeListener;
          l.setState(UnnamedRangeListener.State.UNNAMES);
          JSONEventGenerator jg = new JSONEventGenerator(new NullJsonGenerator());
          jg.addListener(l);
          jg.copyCurrentStructure(jsonParser);
          return IValueHandlerResult.SKIP;
        }
      }
      else if (fieldName.equals(ConversionConstant.NAME_RANGE))
      {
        if (isFirstLoading)
        {
          // serialize name range for first loading
          return IValueHandlerResult.TAKE_ORIGIN;
        }
        else
        {
          // save name range
          TokenBuffer nameRangeBuffer = new TokenBuffer(null);
          nameRangeBuffer.copyCurrentStructure(jsonParser);
          PartialDeserializer.this.nameRangeBuffer = nameRangeBuffer;
          return IValueHandlerResult.SKIP;
        }
      }
      else if (fieldName.equals(ConversionConstant.PRESERVE_NAMES_RANGE))
      {
        if (isFirstLoading)
        {
          // serialize pnames for first loading
          return IValueHandlerResult.TAKE_ORIGIN;
        }
        else
        {
          return IValueHandlerResult.SKIP;
        }
      }
      else if (fieldName.equals(ConversionConstant.STYLES))
      {
        // save styles for future process
        TokenBuffer stylesBuffer = new TokenBuffer(null);

        JSONEventGenerator jg = new JSONEventGenerator(stylesBuffer);
        jg.addListener(new BooleanCategoryStyleListener(PartialDeserializer.this));
        jg.copyCurrentStructure(jsonParser);
        PartialDeserializer.this.stylesBuffer = stylesBuffer;

        return IValueHandlerResult.SKIP;
      }
      else if (fieldName.equals(ConversionConstant.CALCULATED))
      {
        return IValueHandlerResult.TAKE_ORIGIN;
      }
      else
      {
        // ignore all others
        return IValueHandlerResult.SKIP;
      }
    }
  }

  /*
   * Handler for content.sheets
   */
  private class SheetsHandler extends DefaultValueHandler
  {
    public SheetsHandler()
    {
      ;
    }

    protected IValueHandlerResult doHandle(JsonParser jsonParser) throws JsonParseException, IOException
    {
      String sheetId = jsonParser.getCurrentName();

      if (sheetId.equals(criteriaSheetId))
      {
        if (criteriaRowIdSet != null)
        {
          if (initialized)
          {
            // if already initialized and is partial row, sheetsBuffer["criteriaSheetId"] has the rows left
            // after the first response, skip the content in stream, will put criteria sheet content later in 2nd round content iterate
            return IValueHandlerResult.SKIP;
          }
          else
          {
            criteriaContentRowCount = 0;
            allContentRowCount = 0;
            TokenBuffer sheet = new TokenBuffer(null);
            sheetsBuffer.put(sheetId, sheet);
            // write {, "rows" :, {
            sheet.writeStartObject();
            sheet.writeFieldName(ConversionConstant.ROWS);
            sheet.writeStartObject();
            return new IValueHandlerResult.IterateDeeper(new DefaultValueHandler(new CriteriaRowsHandler(sheet)));
          }
        }
        else
        {
          return new IValueHandlerResult.IterateDeeper(new DefaultValueHandler(new DefaultValueHandler(new DefaultValueHandler(
              new CellPropsHandler()))));
        }
      }
      else
      {
        if (!initialized)
        {
          TokenBuffer sheet = new TokenBuffer(null);
          sheet.copyCurrentStructure(jsonParser);
          sheetsBuffer.put(sheetId, sheet);

          // check if the sheet is not empty
          // sheet TokenBuffer's structure is : { "rows" : { ... } }, move tokens forward to check
          // if it has something in,
          // check structure if is longer then [ START_OBJECT, FIELD_NAME, START_OBJECT, FIELD_NAME, ... ]
          JsonParser jp = sheet.asParser();
          JsonToken t = jp.nextToken();
          int length = 0;
          while (t != null && length < 3)
          {
            length++;
            t = jp.nextToken();
          }

          if (length >= 3 && t == JsonToken.FIELD_NAME)
          {
            // current Token is a "FIELD_NAME" after "rows"
            JSONObject sheetObject = (JSONObject) partMetaSheetsObject.get(sheetId);
            sheetObject.put(ConversionConstant.MAXROWINDEX, 1);
          }
        }

        return IValueHandlerResult.SKIP;
      }
    }
  }

  /*
   * Handler for first round content processing, pick up rows that in criteria set.
   */
  private class CriteriaRowsHandler extends DefaultValueHandler
  {
    private TokenBuffer sheetBuffer;

    public CriteriaRowsHandler(TokenBuffer b)
    {
      sheetBuffer = b;
    }

    @Override
    protected IValueHandlerResult doHandle(JsonParser jsonParser) throws JsonParseException, IOException
    {
      // count the rows in criteria sheet
      allContentRowCount++;

      String rowId = jsonParser.getCurrentName();

      // if in here, criteriaRowIdSet must != null
      if (criteriaRowIdSet.contains(rowId))
      {
        // we only care about rows count when is first loading
        criteriaContentRowCount++;
        // skip column ID and to cell properties
        return new IValueHandlerResult.IterateDeeper(new DefaultValueHandler(new CellPropsHandler()));
      }
      else
      {
        // buffer current row
        sheetBuffer.writeFieldName(rowId);
        sheetBuffer.copyCurrentStructure(jsonParser);
        return IValueHandlerResult.SKIP;
      }
    }

    @Override
    public void onEnd(JsonParser jsonParser) throws JsonParseException, IOException
    {
      sheetBuffer.writeEndObject();
      sheetBuffer.writeEndObject();
    }
  }

  /*
   * Handler for content.sheets.<id>.rows
   */
  private class RowsHandler extends DefaultValueHandler
  {
    public RowsHandler()
    {
      ;
    }

    @Override
    protected IValueHandlerResult doHandle(JsonParser jsonParser) throws JsonParseException, IOException
    {
      String rowId = _fieldName;

      if (cellCollector.lookingRow(rowId) || (impactCellsCollector != null && impactCellsCollector.lookingRow(rowId)))
      {
        if (impactCellsCollector != null)
        {
          impactCellsCollector.lookingRow(rowId);
        }
        return new IValueHandlerResult.IterateDeeper(new CellsHandler());
      }
      else
      {
        return IValueHandlerResult.SKIP;
      }
    }
  }

  /*
   * Handler for content.sheets.<id>.rows.<id>
   */
  private class CellsHandler extends DefaultValueHandler
  {
    private CellListener listener;

    public CellsHandler()
    {
      listener = (CellListener) cellListener;
    }

    @Override
    protected IValueHandlerResult doHandle(JsonParser jsonParser) throws JsonParseException, IOException
    {
      String colId = _fieldName;

      if (cellCollector.lookingCell(colId))
      {
        if (listener.isImpactedCell())
        {
          listener.setImpactedCell(false);
        }

        return new IValueHandlerResult.IterateDeeper(new CellPropsHandler());
      }
      else if (impactCellsCollector != null && impactCellsCollector.lookingCell(colId))
      {
        if (!listener.isImpactedCell())
        {
          listener.setImpactedCell(true);
        }

        return new IValueHandlerResult.IterateDeeper(new CellPropsHandler());
      }
      else
      {
        return IValueHandlerResult.SKIP;
      }
    }
  }

  /*
   * Handler for content.sheets.<id>.rows.<id>.<id>, all _fieldName being cell property name
   */
  private class CellPropsHandler extends DefaultValueHandler
  {
    public CellPropsHandler()
    {
      ;
    }

    @Override
    protected IValueHandlerResult doHandle(JsonParser jsonParser) throws JsonParseException, IOException
    {
      // only skip sIdx property and keep others
      String fieldName = _fieldName;
      if (fieldName == null)
      {
        fieldName = jsonParser.getCurrentName();
      }

      if (ConversionConstant.KEY_STRING_INDEX.equals(fieldName))
      {
        return IValueHandlerResult.SKIP;
      }
      else
      {
        return IValueHandlerResult.TAKE_ORIGIN;
      }
    }
  }

  /*
   * Handler for content.styles, pickup styles that the partial document used
   */
  private class PickupStylesHandler extends DefaultValueHandler
  {
    private PartialDeserializer deserializer;

    private Set<String> styleIdSet;

    public PickupStylesHandler(PartialDeserializer d)
    {
      deserializer = d;
      styleIdSet = d.styleIdSet;
    }

    protected IValueHandlerResult doHandle(JsonParser jsonParser) throws JsonParseException, IOException
    {
      String styleId = deserializer._fieldName;

      if (styleIdSet.contains(styleId))
      {
        return IValueHandlerResult.TAKE_ORIGIN;
      }
      else
      {
        return IValueHandlerResult.SKIP;
      }
    }
  }

  // Handler for content.unnames should skip all the ranges with "RECREF" usage which range id start with "rf"
  private class UnnamedRangeHandler extends DefaultValueHandler
  {
    public UnnamedRangeHandler()
    {
      ;
    }

    protected IValueHandlerResult doHandle(JsonParser jsonParser) throws JsonParseException, IOException
    {
      String rangeId = jsonParser.getCurrentName();
      Matcher m = RECREF_PATTERN.matcher(rangeId);
      if (m.matches())
      {
        return IValueHandlerResult.SKIP;
      }
      else
      {
        return IValueHandlerResult.TAKE_ORIGIN;
      }
    }
  }
  
  public void setStreamBuilder(StreamBuilder streamer) {
    this.streamer = streamer;
  }
}
