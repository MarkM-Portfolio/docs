package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.io.IOUtils;
import org.codehaus.jackson.JsonEncoding;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.JsonToken;

import com.ibm.concord.document.common.chart.ChartDocument;
import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.draft.IDraftDeserializer;
import com.ibm.concord.spreadsheet.SpreadsheetConfig;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.DocumentVersion;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.chart.ScDataProvider;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.TokenType;
import com.ibm.concord.spreadsheet.document.model.impl.Column;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Comments;
import com.ibm.concord.spreadsheet.document.model.impl.FormulaCell;
import com.ibm.concord.spreadsheet.document.model.impl.IDManager;
import com.ibm.concord.spreadsheet.document.model.impl.Range;
import com.ibm.concord.spreadsheet.document.model.impl.RangeList;
import com.ibm.concord.spreadsheet.document.model.impl.RangeList.RangeMap;
import com.ibm.concord.spreadsheet.document.model.impl.Row;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.impl.ValueCell;
import com.ibm.concord.spreadsheet.document.model.impl.io.JSONUtils.IFieldHandler;
import com.ibm.concord.spreadsheet.document.model.impl.io.ModelIOFactory.LoadMode;
import com.ibm.concord.spreadsheet.document.model.impl.io.ModelIOFactory.Rule;
import com.ibm.concord.spreadsheet.document.model.impl.io.handlers.MetaColumnHandler;
import com.ibm.concord.spreadsheet.document.model.impl.io.handlers.MetaRowHandler;
import com.ibm.concord.spreadsheet.document.model.impl.io.handlers.MetaSheetHandler;
import com.ibm.concord.spreadsheet.document.model.impl.io.handlers.PreserveValueHandler;
import com.ibm.concord.spreadsheet.document.model.impl.io.handlers.RangeHandler;
import com.ibm.concord.spreadsheet.document.model.impl.io.handlers.ReferenceHandler;
import com.ibm.concord.spreadsheet.document.model.impl.io.handlers.StyleRangeHandler;
import com.ibm.concord.spreadsheet.document.model.impl.io.swap.IRawDataStorageAdapter;
import com.ibm.concord.spreadsheet.document.model.impl.preserve.PreserveManager;
import com.ibm.concord.spreadsheet.document.model.style.StyleManager;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * Deserializes draft JSON to form document model. Constructs by {@link ModelIOFactory}.
 */
public class Deserializer implements IDraftDeserializer
{
  private static final Logger LOG = Logger.getLogger(Deserializer.class.getName());

  private final static String META_JSON_FILE = "meta.js";

  private final static String CONTENT_JSON_FILE = "content.js";

  private final static String REF_JSON_FILE = "reference.js";

  private final static String PRE_JSON_FILE = "preserve.js";

  private final static String RECOVER_META_JSON_FILE = "recover_meta.js";

  private final static String RECOVER_CONTENT_JSON_FILE = "recover_content.js";

  private final static String RECOVER_REF_JSON_FILE = "recover_reference.js";

  private final static String RECOVER_PRE_JSON_FILE = "recover_preserve.js";

  private boolean bRecover;

  private Rule[] rules;

  private JsonFactory jsonFactory;

  private InputStream[] inStreams;

  private Document document;
  
  private Document mainDoc;//only available when bReocver is true

  private DraftActionGenerator draftActionGenerator;

  private IDraftActionHandler handler;
  
  private String draftDir;
  
  public Deserializer()
  {
    ;
  }

  /**
   * <p>
   * Deserializes the draft.
   * <p>
   * <ol>
   * <li>The rule file is parsed and rules are built once the factory is set up.
   * <li>When deserializing, a Deserializer instance is created.
   * <li>The JSON files are opened in the sequence as mentioned above(meta.js, content.js, reference.js, preserve.js).
   * <li>For every file, first, the rules defined in the root apply. For a specific field name deserializer meets, it asks current rule for
   * guidance. If rule has the knowledge of the field name (defined as a "FIELD_NAME" item in the rule block, or a "*" is in the rule
   * block), it uses the rule defined in the block as the next rule.
   * <li>For the value(value including START_ARRAY), or the START_OBJECT deserializer meets, the next rule applies and the previous rule
   * pushed into a stack.
   * <li>Once the value is processed, or a END_OBJECT is met, the rule stack pops. Previous 3 steps repeats until one JSON file ends.
   * <p>
   * For every {@link Actions} deserializer meets, the appropriate method is called with the field path and current JsonParser. The
   * JsonParser stops at the place of the VALUE, or a START_ARRAY, or a START_OBJECT. The deserializer method must make the JsonParser stops
   * at the place of the VALUE, or the END_ARRAY, or the END_OBJECT.
   * 
   * @return constructed document model
   * @throws JsonParseException
   * @throws IOException
   */
  public Document deserialize() throws JsonParseException, IOException
  {
    JsonParser[] jps = new JsonParser[inStreams.length];
    for (int i = 0; i < inStreams.length; i++)
    {
      InputStream inStream = inStreams[i];
      if (inStream != null)
      {
        jps[i] = jsonFactory.createJsonParser(inStream);
      }
      else
      {
        jps[i] = null;
      }
    }

    try
    {
      document = new Document();
      
      document.setDraftDir(draftDir);

      ContentRowDeserializer contentRowDeserializer = new ContentRowDeserializer(jsonFactory, document.getStyleManager());
      document.setContentRowDeserializer(contentRowDeserializer);

      draftActionGenerator = new DraftActionGenerator();
      handler = new MainDraftActionHandler();

      for (int i = 0; i < jps.length; i++)
      {
        if (jps[i] != null)
        {
          processJson(jps[i], rules[i]);
        }
      }

      document.initMaxRowIndexMap();
      document.parseRulesObjs();
      return document;
    }
    finally
    {
      for (int i = 0; i < inStreams.length; i++)
      {
        try
        {
          if (jps[i] != null)
          {
            jps[i].close();
          }
        }
        catch (IOException e)
        {
          LOG.log(Level.WARNING, "Failed to close JsonParser, ", e);
        }
      }
    }
  }

  /**
   * Implement SPI {@link IDraftDeserializer}.
   */
  public Object deserialize(DraftDescriptor draftDescriptor) throws Exception
  {
    inStreams = new InputStream[4];
    try 
    {
      DraftStorageManager dsm = DraftStorageManager.getDraftStorageManager(false);
      JSONArray draftSections = dsm.listDraftSections(draftDescriptor, null);
      for (Iterator iterator = draftSections.iterator(); iterator.hasNext();)
      {
        JSONObject section = (JSONObject) iterator.next();
        String relPath = (String) section.get("rel_path");
        if (relPath != null && relPath.contains(File.separator))
        {
          // section relPath is the path that relative to media root, if contains pathSep, means
          // the file is in subdir, we don't want these files
          continue;
        }
          
        String name = (String) section.get("name");
        // for recover document
        if (bRecover)
        {
          if (RECOVER_META_JSON_FILE.equals(name))
          {
            inStreams[0] = new FileInputStream((String) section.get("abs_path"));
          }
          else if (RECOVER_CONTENT_JSON_FILE.equals(name))
          {
            inStreams[1] = new FileInputStream((String) section.get("abs_path"));
          }
          else if (RECOVER_REF_JSON_FILE.equals(name))
          {
            if (SpreadsheetConfig.useReferenceJS())
            {
              inStreams[2] = new FileInputStream((String) section.get("abs_path"));
            }
          }
          else if (RECOVER_PRE_JSON_FILE.equals(name))
          {
            inStreams[3] = new FileInputStream((String) section.get("abs_path"));
          }
        }
        else
        // for main doc
        {
          if (META_JSON_FILE.equals(name))
          {
            inStreams[0] = new FileInputStream((String) section.get("abs_path"));
          }
          else if (CONTENT_JSON_FILE.equals(name))
          {
            inStreams[1] = new FileInputStream((String) section.get("abs_path"));
          }
          else if (REF_JSON_FILE.equals(name))
          {
            if (SpreadsheetConfig.useReferenceJS())
            {
              inStreams[2] = new FileInputStream((String) section.get("abs_path"));
            }
          }
          else if (PRE_JSON_FILE.equals(name))
          {
            inStreams[3] = new FileInputStream((String) section.get("abs_path"));
          }
        }
      }
      long begintime = System.nanoTime();
      Document doc = deserialize();
      doc.setDraftDescriptor(draftDescriptor);
      long endtime = System.nanoTime();
      LOG.log(Level.INFO, "deserialize " + draftDescriptor.getDocId()+ " used "+((endtime-begintime)/1e9)+" usereference:"+SpreadsheetConfig.useReferenceJS());
      if(!bRecover){
      	loadChart(draftDescriptor);
      	loadComments(draftDescriptor);
      }
      return doc;
      
    } finally 
    {
      for( int i = 0 ; i < inStreams.length; i++) 
      {
        IOUtils.closeQuietly(inStreams[i]);
      }
    }
  }
  
  private void loadComments(DraftDescriptor draftDescriptor) throws Exception
  {
	  String uri = draftDescriptor.getURI();
	  
	  String path = uri + File.separator + "comments.js";
	  File commentsfile = new File(path);
	  
	  if (!commentsfile.exists())
      {
    	  path = uri + File.separator + "Reserved" + File.separator + "comments.json";
    	  commentsfile = new File(path);
      }
	 
      if (commentsfile.exists())
      {
	    	InputStream stream = null;
	        try
	        {
	        	stream = new FileInputStream(path);
	        	JSONArray commentsJson = JSONArray.parse(stream);
	        	if(commentsJson != null)
	        	{
	        		for(int i = 0; i < commentsJson.size(); i++)
	        		{
	        			JSONObject comments = (JSONObject) commentsJson.get(i);
	        			Comments commentsObj = new Comments(comments);
	        			document.addComments(commentsObj);
	        		}
	        	}
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
  
  private void loadChart(DraftDescriptor draftDescriptor) throws Exception
  {
	String uri = draftDescriptor.getURI();
	RangeList<String> rangeList = document.getRangeList();
    Map<RangeUsage, RangeMap<String>> rangesByType = rangeList.getByUsageRangeMap();
    RangeMap<String> chartRanges = rangesByType.get(RangeUsage.CHART);
    if(chartRanges==null)
    	return;
    Set<String> chartIds = chartRanges.keySet();
    Iterator<String> itr = chartIds.iterator();
    while(itr.hasNext())
    {
    	String chartId = itr.next();
    	String path = uri + File.separator + "Charts" + File.separator + chartId + ".js";
    	InputStream stream = null;
    	try
    	{
    	  stream = new FileInputStream(path);
          JSONObject json = JSONObject.parse(stream);
          ChartDocument chart = new ChartDocument();
          ScDataProvider provider = new ScDataProvider(document);
          chart.attachDataProvider(provider);
          chart.loadFromJson(json);
          chart.setChartId(chartId);
          document.addChart(chart);
    	}
    	catch(Exception e)
    	{
    	  LOG.log(Level.WARNING, "Load  chart {0} failed", chartId);
    	}
    	finally
    	{
    	  try
    	  {
    	    stream.close();
    	  }
    	  catch(Exception e)
          {
    	    LOG.log(Level.WARNING, "Close  chart {0} stream failed", chartId);
          }
    	}
    }
  }

  public void setRules(Rule[] rules)
  {
    this.rules = rules;
  }

  public void setJsonFactory(JsonFactory jf)
  {
    jsonFactory = jf;
  }

  public void setInputStreams(InputStream... ins)
  {
    inStreams = ins;
  }

  /**
   * Set the deserializer for recover document, and share the styleManager and styleList from mainDoc
   * 
   * @param bRec
   * @param man
   * @param list
   */
  public void setRecoverDeserializer(boolean bRec)
  {
    bRecover = bRec;
  }

  /**
   * check if the deserializer is for recover document
   * 
   * @return
   */
  public boolean IsRecoverDeserializer()
  {
    return bRecover;
  }

  /**
   * set the main document if this deserializer is used for recover doc
   * @param doc
   */
  public void setMainDoc(Document doc)
  {
    mainDoc = doc;
  }
  /**
   * Get style list of original draft.
   * 
   * @return
   */
  public List<StyleObject> getStyleList()
  {
    return ((MainDraftActionHandler) handler).getStyleList();
  }
  
  public void setDraftDir(String draftDir)
  {
    this.draftDir = draftDir;
  }

  private void processJson(JsonParser jp, Rule rule) throws JsonParseException, IOException
  {
    JsonToken jt = jp.nextToken();
    draftActionGenerator.setRootRule(rule);

    while (jt != null)
    {
      if (draftActionGenerator.onToken(jp, handler))
      {
        // onToken() moved jp, don't move jp now
        jt = jp.getCurrentToken();
      }
      else
      {
        jt = jp.nextToken();
      }
    }
  }

  private class MainDraftActionHandler implements IDraftActionHandler
  {
    private IDManager idManager;

    private StyleManager styleManager;

    private List<StyleObject> styleList;

    private IFieldHandler<Sheet> metaSheetHandler;

    private IFieldHandler<Row> metaRowHandler;

    private IFieldHandler<Column> metaColumnHandler;

    private IFieldHandler<Range> rangeHandler;

    private IFieldHandler<Map<Integer,Integer>> preserveValueHandler;

    private IFieldHandler<Range<Integer>> styleRangeHandler;

    private ReferenceHandler referenceHandler;
    
    private ContentRowDeserializer contentRowDeserializer;

    private Sheet contextSheet;

    private Row contextRow;
    
    private int contextRowId;//only used for ROWS_AS_STREAM

    private FormulaCell contextFormulaCell;

    private StyleObject contextStyleObject;

    private boolean sheetsArrayLoaded;

    // row cache for row defs in meta when meta: row comes before
    // sheetsArray
    private Map<Integer, Map<Integer, Row>> metaRows;

    private Map<Integer, Row> contextMetaRows;

    // context map for preserve "value": rowId: { columnId set }
    private Map<Integer, Map<Integer, Integer>> contextPreserveValueMap;

    // column cache for column defs in meta when meta: column comes before
    // sheetsArray
    private Map<Integer, Map<Integer, Column>> metaColumns;

    private Map<Integer, Column> contextMetaColumns;

    private Map<Integer, FormulaCell> contextRowFormulaCellsMap;

    public MainDraftActionHandler()
    {
      metaSheetHandler = new MetaSheetHandler();
      metaRowHandler = new MetaRowHandler();
      metaColumnHandler = new MetaColumnHandler();
      rangeHandler = new RangeHandler();
      preserveValueHandler = new PreserveValueHandler();
      styleRangeHandler = new StyleRangeHandler();
      referenceHandler = new ReferenceHandler();
      if(bRecover)
        referenceHandler.setDoc(document, mainDoc);
      idManager = document.getIDManager();
      styleManager = document.getStyleManager();
      styleList = new ArrayList<StyleObject>();

      ((MetaColumnHandler) metaColumnHandler).setStyleList(styleList);
      ((MetaColumnHandler) metaColumnHandler).setStyleManager(styleManager);
      ((StyleRangeHandler) styleRangeHandler).setIdManager(idManager);
      
      contentRowDeserializer = document.getContentRowDeserializer();
      contentRowDeserializer.setStyleList(styleList);
      contentRowDeserializer.setRootRule(ModelIOFactory.getInstance().getContentSheetRule());

      sheetsArrayLoaded = false;
    }

    public void onAction(List<String> fieldPath, Actions action, JsonParser jp) throws JsonParseException, IOException
    {
      String id;
      int numberId;
      Row row;
      Column column;
      JsonToken jt;
      Range<Integer> intRange;

      if (contextStyleObject != null)
      {
        // parse content.js, style
        contextStyleObject.loadFromJSON(action, jp);
        return;
      }

      switch (action)
        {
          case NO_ACTION :
            break;
          case META_VERSION :
            String ver = jp.getText();
            document.setVersion(DocumentVersion.parseVersionString(ver));
            break;
          case META_SHEET :
            id = fieldPath.get(1);
            numberId = ModelHelper.toNumberId(id);
            Sheet sheet = new Sheet(document);
            sheet.setId(numberId);
            metaSheetHandler.setContext(sheet);
            JSONUtils.forEachField(metaSheetHandler, jp);
            idManager.addSheet(sheet);
            break;
          case META_SHEETSIDARRAY :
            // nothing to do
            break;
          case META_ROW_SHEET :
            if (ModelIOFactory.LOAD_MODE == LoadMode.ROWS_AS_STREAM)
            {
              id = fieldPath.get(1);
              numberId = ModelHelper.toNumberId(id);
              contextSheet = document.getSheetById(numberId);
              contextSheet.setRawMetaRows(JSONUtils.storeRawData(jsonFactory, jp, false));
              break;
            }
            // else, do nothing and continue to action META_COLUMN_SHEET, no break
          case META_COLUMN_SHEET :
            id = fieldPath.get(1);
            numberId = ModelHelper.toNumberId(id);
            contextSheet = document.getSheetById(numberId);
            if (!sheetsArrayLoaded)
            {
              // meta rows and columns comes before sheetsArray, put row
              // into cache first
              if (metaRows == null)
              {
                metaRows = new HashMap<Integer, Map<Integer, Row>>();
              }
              contextMetaRows = metaRows.get(numberId);
              if (contextMetaRows == null)
              {
                contextMetaRows = new HashMap<Integer, Row>();
                metaRows.put(numberId, contextMetaRows);
              }
              if (metaColumns == null)
              {
                metaColumns = new HashMap<Integer, Map<Integer, Column>>();
              }
              contextMetaColumns = metaColumns.get(numberId);
              if (contextMetaColumns == null)
              {
                contextMetaColumns = new HashMap<Integer, Column>();
                metaColumns.put(numberId, contextMetaColumns);
              }
            }
            else
            {
              contextMetaColumns = null;
              contextMetaRows = null;
            }
            break;
          case META_ROW :
            id = fieldPath.get(2);
            numberId = ModelHelper.toNumberId(id);
            row = new Row(contextSheet, numberId);
            metaRowHandler.setContext(row);
            JSONUtils.forEachField(metaRowHandler, jp);

            if (contextMetaRows != null)
            {
              contextMetaRows.put(numberId, row);
            }
            else
            {
              ModelHelper.insert(contextSheet.getRows(), row, contextSheet.getRows().size() - 1);
            }
            break;
          case META_COLUMN :
            id = fieldPath.get(2);
            numberId = ModelHelper.toNumberId(id);
            column = new Column(contextSheet, numberId);
            metaColumnHandler.setContext(column);
            JSONUtils.forEachField(metaColumnHandler, jp);
            if (column.getStyle() != null)
            {
              styleManager.changeRefCount(column.getStyle(), column.getRepeatedNum());
            }

            if (contextMetaColumns != null)
            {
              contextMetaColumns.put(numberId, column);
            }
            else
            {
              ModelHelper.insert(contextSheet.getColumns(), column, contextSheet.getColumns().size() - 1);
            }
            break;
          case META_SHEETSARRAY :
            sheetsArrayLoaded = true;
            break;
          case META_ROWSIDARRAY :
          case META_COLUMNSIDARRAY :
            id = fieldPath.get(1);
            numberId = ModelHelper.toNumberId(id);
            contextSheet = document.getSheetById(numberId);
            idManager.loadIdListFromJSON(contextSheet, action, jp);
            break;
          case META_LOCALE :
            String locale = jp.getText();
            document.setLocale(locale);
            break;
          case META_DEFAULT_COLUMN_WIDTH :
            int width = jp.getIntValue();
            document.setDefaultColumnWidth(width);
            break;
          case META_INIT_ROWCOUNT :
            int rowCount = jp.getIntValue();
            document.getIdConvertor().setInitRowCount(rowCount);
            document.getIDManager().setMaxRowCount(rowCount);
            break;
          case META_INIT_COLUMNCOUNT :
            int colCount = jp.getIntValue();
            document.getIdConvertor().setInitColumnCount(colCount);
            document.getIDManager().setMaxColCount(colCount);
            break;
          case META_INIT_SHEETCOUNT :
            int sheetCount = jp.getIntValue();
            document.getIdConvertor().setInitSheetId(sheetCount);
            document.getIDManager().setMaxSheetCount(sheetCount);
            break;
          case META_INIT_STYLECOUNT :
            int styleCount = jp.getIntValue();
            document.getIdConvertor().setInitStyleCount(styleCount);
            break;
          case META_CSV:
             document.setIsCSV(jp.getBooleanValue());
            break;
          case META_DATE1904:
        	document.setIsDate1904(jp.getBooleanValue());
        	break;
          case CONTENT_CALCULATED :
            boolean caled = jp.getBooleanValue();
            document.setCalculated(caled);
            break;
          case CONTENT_STYLE :
            id = fieldPath.get(1);
            if (ConversionConstant.DEFAULT_CELL_STYLE.equals(id))
            {
              contextStyleObject = styleManager.getDefaultCellStyle();
            }
            else if (ConversionConstant.DEFAULT_CELL_STYLE_NAME.equals(id))
            {
              contextStyleObject = styleManager.getDefaultStyle();
            }
            else if (ConversionConstant.DEFAULT_ROW_STYLE.equals(id) || ConversionConstant.DEFAULT_COLUMN_STYLE.equals(id))
            {
              // for default row style and column style, don't load in
              // styleObject
              contextStyleObject = null;
            }
            else
            {
              numberId = ModelHelper.stripIdType(id);
              contextStyleObject = ModelHelper.safeGetList(styleList, numberId);
              if (contextStyleObject == null)
              {
                contextStyleObject = new StyleObject();
                ModelHelper.putToList(styleList, numberId, contextStyleObject);
              }
            }
            break;
          case CONTENT_STYLE_HEIGHT :
            styleManager.setDefaultRowHeight(jp.getIntValue());
            break;
          case CONTENT_STYLE_WIDTH :
            styleManager.setDefaultColWidth(jp.getIntValue());
            break;
          case CONTENT_SHEET :
            id = fieldPath.get(1);
            numberId = ModelHelper.toNumberId(id);
            contextSheet = document.getSheetById(numberId);
            if (contextSheet == null)
            {
              if (LOG.isLoggable(Level.INFO))
              {
                LOG.log(Level.INFO, "skip sheet {0} in content.js but not in meta.js.", new Object[] { id });
              }
              jp.skipChildren();
            }
            else
            {
              if (ModelIOFactory.LOAD_MODE == LoadMode.ROWS_AS_STREAM)
              {
                if (SpreadsheetConfig.useReferenceJS())
                {
                  contextSheet.setRawContentRows(JSONUtils.storeRawData(jsonFactory, jp, false));
                } 
                else 
                {
                  contextSheet.setRawContentRows(storeRawDataAndInfos(jsonFactory, jp, false, contextSheet));
                }
              }
              else
              {
                // for all other modes, we need to load rows
                contentRowDeserializer.setSheet(contextSheet);
                contentRowDeserializer.deserialize(jp);
              }
            }
            contextRow = null;
            break;
          case CONTENT_SHEET_ROWS:
            // tag action
            break;
          case CONTENT_SHEET_ROW :
          case CONTENT_SHEET_ROW_CELL :
            // not here, handled in contentRowDeserializer
            break;
          case CONTENT_UNNAME :
            id = fieldPath.get(1);
            Range range = new Range(document, id);
            rangeHandler.setContext(range);
            JSONUtils.forEachField(rangeHandler, jp);
            RangeUsage usage = range.getUsage();
            if(usage == RangeUsage.DATA_VALIDATION || usage == RangeUsage.CONDITIONAL_FORMAT)
            	document.addRulesObjByUsage(id, range.getRangeInfo(), range.getData(), usage, false);
            else
            	document.getRangeList().addRange(range);
            break;
          case CONTENT_NAME :
            id = fieldPath.get(1);
            Range nameRange = new Range(document, id.toLowerCase());//use the upper case name as name range id
            rangeHandler.setContext(nameRange);
            nameRange.getData().put("name", id);//put case sensitive name to optional data
            JSONUtils.forEachField(rangeHandler, jp);
            document.getRangeList().addRange(nameRange);
            break;
          case CONTENT_PNAME :
            // preserve ranges are loaded in preserve.js, skip this part
            jp.skipChildren();
            break;
          case REFERENCE_SHEET :
            id = fieldPath.get(1);
            numberId = ModelHelper.toNumberId(id);
            contextSheet = document.getSheetById(numberId);
            if (contextSheet == null)
            {
              LOG.log(Level.WARNING, "In reference.js, sheet {0} not exists.", id);
            }
            break;
          case REFERENCE_SHEET_ROW :
            id = fieldPath.get(2);
            numberId = ModelHelper.toNumberId(id);
            if (contextSheet == null)
            {
              contextRow = null;
            }
            else
            {
              switch (ModelIOFactory.LOAD_MODE)
                {
                  case ALL :
                    // rows are constructed,
                    contextRow = contextSheet.getRow(idManager.getRowIndexById(contextSheet.getId(), numberId));
                    if (contextRow == null)
                    {
                      LOG.log(Level.WARNING, "In reference.js, row {0} not exists.", id);
                    }
                    break;
                  case CELLS_AS_STREAM :
                    // rows are constructed,
                    contextRow = contextSheet.getRow(idManager.getRowIndexById(contextSheet.getId(), numberId));
                    if (contextRow == null)
                    {
                      LOG.log(Level.WARNING, "In reference.js, row {0} not exists.", id);
                      contextRowFormulaCellsMap = null;
                    }
                    else
                    {
                      contextRowFormulaCellsMap = contextRow.getRowFormulaCellsMap();
                      if (contextRowFormulaCellsMap == null)
                      {
                        contextRowFormulaCellsMap = new HashMap<Integer, FormulaCell>();
                        contextRow.setRowFormulaCellsMap(contextRowFormulaCellsMap);
                      }
                    }
                    break;
                  case ROWS_AS_STREAM :
                    // all rows as streaming, no rows is constructed, store references in list
                    if (contextSheet == null)
                    {
                      contextRowFormulaCellsMap = null;
                    }
                    else
                    {
                      Map<Integer, Map<Integer, FormulaCell>> map = contextSheet.getFormulaCellsMap();
                      if (map == null)
                      {
                        map = new HashMap<Integer, Map<Integer, FormulaCell>>();
                        contextSheet.setFormulaCellsMap(map);
                      }
                      contextRowFormulaCellsMap = new HashMap<Integer, FormulaCell>();
                      map.put(numberId, contextRowFormulaCellsMap);
                      contextRowId = numberId;
                    }

                    break;
                  default:
                    break;
                }
            }
            break;
          case REFERENCE_SHEET_ROW_COLUMN :
            id = fieldPath.get(3);
            numberId = ModelHelper.toNumberId(id);

            switch (ModelIOFactory.LOAD_MODE)
              {
                case ALL :
                  if (contextRow == null)
                  {
                    contextFormulaCell = null;
                  }
                  else
                  {
                    ValueCell vc = contextRow.getValueCell(idManager.getColIndexById(contextSheet.getId(), numberId));
                    if (vc == null)
                    {
                      LOG.log(Level.WARNING, "In reference.js, cell {0} in row {1} not exists.", new Object[] { id, contextRow.getId() });
                    }
                    else
                    {
                      contextFormulaCell = vc.getFormulaCell();
                      if (contextFormulaCell == null)
                      {
                        LOG.log(Level.WARNING, "cell {0} in row {1} with value {2} has references but don't have a formula cell.",
                            new Object[] { id, contextRow.getId(), vc.getValue() });
                        contextFormulaCell = new FormulaCell(contextSheet, contextRow.getId(), numberId);
                        vc.setFormulaCell(contextFormulaCell);
//                        if(document.isCalculated())
//                          contextFormulaCell.setDirty(true,true);
                      }
                    }
                  }
                  break;
                case CELLS_AS_STREAM :
                  // row loaded,
                  if (contextRow == null)
                  {
                    contextFormulaCell = null;
                  }
                  else
                  {
                    contextFormulaCell = new FormulaCell(contextSheet, contextRow.getId(), numberId);
                    contextRowFormulaCellsMap.put(numberId, contextFormulaCell);
                  }
                  break;
                case ROWS_AS_STREAM :
                  // row not loaded
                  if (contextRowFormulaCellsMap == null)
                  {
                    contextFormulaCell = null;
                  }
                  else
                  {
                    contextFormulaCell = new FormulaCell(contextSheet, contextRowId, numberId);
                    contextRowFormulaCellsMap.put(numberId, contextFormulaCell);
                  }
                  break;
                default:
                  break;
              }
            break;
          case REFERENCE_CELLS_LIST :
            if (contextFormulaCell == null)
            {
              jp.skipChildren();
            }
            else
            {
              // jt at {
              jt = jp.nextToken();
              referenceHandler.setContext(contextFormulaCell);
              while (jt != JsonToken.END_ARRAY)
              {
                referenceHandler.resetIndex();
                JSONUtils.forEachField(referenceHandler, jp);
                if (referenceHandler.getFormulaToken() == null || 
                    (referenceHandler.getFormulaToken().getType() != TokenType.NAME && !referenceHandler.getFormulaToken().isValid()))
                {
                  if (LOG.isLoggable(Level.FINE))
                  {
                    LOG.log(Level.FINE, "Ignore invalid reference at {0}.", fieldPath);
                  }
                }
                else
                {
                  if (referenceHandler.getIndex() > 0)
                  {
                    // regular reference
                    contextFormulaCell.pushRef(referenceHandler.getFormulaToken());
                    referenceHandler.getFormulaToken().setIndex(referenceHandler.getIndex());
                  }
                  else if (referenceHandler.getIndex() == -1)
                  {
                    // virtual reference
                    if (referenceHandler.getLeftIndex() >= 0 && referenceHandler.getRightIndex() >= 0)
                    {
                      if (contextFormulaCell.getTokenList().size() > referenceHandler.getLeftIndex()
                          && contextFormulaCell.getTokenList().size() > referenceHandler.getRightIndex())
                      {
                        // generate virtual reference
                        FormulaUtil.generateVirtualToken(contextFormulaCell.getTokenList().get(referenceHandler.getLeftIndex()), //
                            contextFormulaCell.getTokenList().get(referenceHandler.getRightIndex()), //
                            contextFormulaCell, true);
                      }
                      else
                      {
                        // virtual reference out of bound,
                        // including references not
                        // deserialized?
                        LOG.log(Level.WARNING, "Virtual reference left index {0} and right index {1} out of bound.", new Object[] {
                            referenceHandler.getLeftIndex(), referenceHandler.getRightIndex() });
                      }
                    }
                    else
                    {
                      // virtual reference indexes invalid
                      LOG.log(Level.WARNING, "Virtual reference left index {0} and right index {1} invalid.", new Object[] {
                          referenceHandler.getLeftIndex(), referenceHandler.getRightIndex() });
                    }
                  }
                  else
                  {
                    // invalid reference
                    LOG.log(Level.WARNING, "Reference index {0} invalid. Address: {1}.", new Object[] { referenceHandler.getIndex(),
                        referenceHandler.getFormulaToken().getText() });
                  }
                }

                jt = jp.nextToken();
              }
            }
            break;
          case REFERENCE_CELLS_ERRORPROPS:
            if (contextFormulaCell == null)
              jp.skipChildren();
            else
              contextFormulaCell.setErrProps(jp.getIntValue());
            break;
          case PRESERVE_MAXROW :
            id = fieldPath.get(1);
            numberId = ModelHelper.toNumberId(id);
            document.getPreserveManager().setMaxRow(numberId, jp.getIntValue());
            break;
          case PRESERVE_STYLE_SHEET :
            id = fieldPath.get(1);
            numberId = ModelHelper.toNumberId(id);
            ((StyleRangeHandler) styleRangeHandler).setSheetId(numberId);
            contextSheet = document.getSheetById(numberId);
            break;
          case PRESERVE_STYLE_SHEET_RANGE :
            id = fieldPath.get(2);
            numberId = ModelHelper.toNumberId(id);
            intRange = new Range<Integer>(document, numberId);
            styleRangeHandler.setContext(intRange);
            JSONUtils.forEachField(styleRangeHandler, jp);
            intRange.setSheetId(contextSheet.getId());
            document.getPreserveManager().getStyleRangeList().addRange(intRange);
            break;
          case PRESERVE_VALUE_SHEET :
            id = fieldPath.get(1);
            numberId = ModelHelper.toNumberId(id);
            contextPreserveValueMap = document.getPreserveManager().getValueCellSet().get(numberId, true);
            break;
          case PRESERVE_VALUE_SHEET_ROW :
            id = fieldPath.get(2);
            numberId = ModelHelper.toNumberId(id);
            Map<Integer, Integer> preserveValueSet = contextPreserveValueMap.get(numberId);
            if (preserveValueSet == null)
            {
              preserveValueSet = new HashMap<Integer, Integer>();
              contextPreserveValueMap.put(numberId, preserveValueSet);
            }
            preserveValueHandler.setContext(preserveValueSet);
            JSONUtils.forEachField(preserveValueHandler, jp);
            break;
          case PRESERVE_RANGE :
            // nothing to do;
            break;
          case PRESERVE_RANGE_INNER :
            id = fieldPath.get(2);
            // numberId = ModelHelper.toPreserveNumberId(id);
            Range<String> pRange = new Range<String>(document, id);
            rangeHandler.setContext(pRange);
            JSONUtils.forEachField(rangeHandler, jp);
            PreserveManager pm = document.getPreserveManager();
            pm.getRangeList().addRange(pRange);
            if (pRange.getUsage() == RangeUsage.COPY)
              pm.getValueCellSet().addPreserveCellIds(pRange.getSheetId(), pRange.getStartRowId(), pRange.getStartColId());
            break;
          default:
            jp.skipChildren();
            LOG.log(Level.WARNING, "Unknown action {0}, in field path stack {1}.", new Object[] { action, fieldPath });
            break;
        }
    }

    public void postAction(List<String> fieldPath, Actions action, JsonParser jp)
    {
      switch (action)
        {
          case META_SHEETSARRAY :
            if (metaRows != null)
            {
              ModelHelper.iterateMap(metaRows, new ModelHelper.IMapEntryListener<Integer, Map<Integer, Row>>()
              {
                public boolean onEntry(Integer sheetId, Map<Integer, Row> rows)
                {
                  final Sheet sheet = document.getSheetById(sheetId);
                  final List<Row> l = sheet.getRows();
                  ModelHelper.iterateMap(rows, new ModelHelper.IMapEntryListener<Integer, Row>()
                  {
                    public boolean onEntry(Integer id, Row row)
                    {
                      ModelHelper.insert(l, row, l.size() - 1);
                      return false;
                    }
                  });
                  return false;
                }
              });
              contextMetaRows = null;
              metaRows = null;
            }

            if (metaColumns != null)
            {
              ModelHelper.iterateMap(metaColumns, new ModelHelper.IMapEntryListener<Integer, Map<Integer, Column>>()
              {
                public boolean onEntry(Integer sheetId, Map<Integer, Column> columns)
                {
                  final Sheet sheet = document.getSheetById(sheetId);
                  final List<Column> l = sheet.getColumns();

                  ModelHelper.iterateMap(columns, new ModelHelper.IMapEntryListener<Integer, Column>()
                  {
                    public boolean onEntry(Integer id, Column column)
                    {
                      ModelHelper.insert(l, column, l.size() - 1);
                      return false;
                    }
                  });
                  return false;
                }
              });
              contextMetaColumns = null;
              metaColumns = null;
            }
            break;
          case CONTENT_STYLE :
            if (contextStyleObject != styleManager.getDefaultCellStyle() && contextStyleObject != styleManager.getDefaultStyle())
            {
              // is not default styles
              StyleObject newStyleObject = styleManager.addStyle(contextStyleObject);
              if (newStyleObject != contextStyleObject)
              {
                // style instance changed, means the generated style is replaced by another style previously added
                // and with identical content, replace the style instance in styleList to make other objects (cells, columns)
                // to use this new style
                String styleId = fieldPath.get(1);
                int numberId = ModelHelper.stripIdType(styleId);
                ModelHelper.putToList(styleList, numberId, newStyleObject);
              }
            }
            contextStyleObject = null;
            break;
          default:
            break;
        }
    }

    public void onFieldName(Actions action, JsonParser jp) throws JsonParseException, IOException
    {
      ;
    }

    public List<StyleObject> getStyleList()
    {
      return styleList;
    }
    // read current structure of jp into a raw data
    public IRawDataStorageAdapter storeRawDataAndInfos(JsonFactory jsonFactory, JsonParser jp, boolean useInflater, Sheet contextSheet)
        throws IOException
    {
      IRawDataStorageAdapter rawData;

      if (useInflater)
      {
        rawData = ModelIOFactory.getInstance().getSwapManager().createCompressedRawDataStorage();
      }
      else
      {
        rawData = ModelIOFactory.getInstance().getSwapManager().createRawDataStorage();
      }
      OutputStream rawOut = rawData.getOutputStream();
      JsonGenerator jg = jsonFactory.createJsonGenerator(rawOut, JsonEncoding.UTF8);
      Map<Integer, Map<Integer, FormulaCell>> cellMap = contextSheet.getFormulaCellsMap();
      if (cellMap == null)
      {
        cellMap = new HashMap<Integer, Map<Integer, FormulaCell>>();
      }
      
      Map<Integer, Map<Integer, List>> mergeMap = new HashMap<Integer, Map<Integer, List>>();
      Map<String, Map> rowInfos = new HashMap<String, Map>();
      rowInfos.put("formulas", cellMap);
      rowInfos.put("mergeCells", mergeMap);
      copyCurrentStructureAndInfos(jp, jg, contextSheet, null, null, rowInfos);
      
      if (cellMap.size() > 0)
      {
          contextSheet.setFormulaCellsMap(cellMap);
      }
      //TODO: insert rows for mergeCells
      jg.flush();
      rawData.closeOutputStream();
      return rawData;
    }

    public void copyCurrentStructureAndInfos(JsonParser jp, JsonGenerator jg, Sheet sheet, Integer rowId, Integer colId, Map<String, Map> map)
        throws IOException, JsonProcessingException
    {
      boolean isValue = false;
      JsonToken token = jp.getCurrentToken();
      int spanIndex = 0;
      Integer[] mergeInfo = null;
      // jump over field
      if (token == JsonToken.FIELD_NAME)
      {
        String fieldName = jp.getText();
        isValue = false;
        if (fieldName.compareTo("or1") >= 0 && fieldName.compareTo("or:") < 0)
        {
          rowId = ModelHelper.toNumberId(fieldName);
        }
        else if (fieldName.compareTo("oc1") >= 0 && fieldName.compareTo("oc:") < 0)
        {
          colId = ModelHelper.toNumberId(fieldName);
        }
        else if (fieldName.compareTo("ro1") >= 0 && fieldName.compareTo("ro:") < 0)
        {
          rowId = ModelHelper.toNumberId(fieldName);
        }
        else if (fieldName.compareTo("co1") >= 0 && fieldName.compareTo("co:") < 0)
        {
          colId = ModelHelper.toNumberId(fieldName);
        }
        else if (fieldName.equals("v"))
        {
          isValue = true;
        }
        else if(fieldName.equals(ConversionConstant.COLSPAN))
        {
          Map<Integer, Map<Integer, Integer[]>> mergeCells = map.get("mergeCells");
          Map<Integer, Integer[]> rowMergeCells = mergeCells.get(rowId);
          if(rowMergeCells == null)
          {
            rowMergeCells = new HashMap<Integer, Integer[]>();
            mergeCells.put(rowId, rowMergeCells);
          }
          mergeInfo = rowMergeCells.get(colId);
          if(mergeInfo == null) {
            mergeInfo = new Integer[2];
            rowMergeCells.put(colId, mergeInfo);
          }
          spanIndex = 0;
        } 
        else if(fieldName.equals(ConversionConstant.ROWSPAN))
        {
          Map<Integer, Map<Integer, Integer[]>> mergeCells = map.get("mergeCells");
          Map<Integer, Integer[]> rowMergeCells = mergeCells.get(rowId);
          if(rowMergeCells == null)
          {
            rowMergeCells = new HashMap<Integer, Integer[]>();
            mergeCells.put(rowId, rowMergeCells);
          }
          mergeInfo = rowMergeCells.get(colId);
          if(mergeInfo == null) {
            mergeInfo = new Integer[2];
            rowMergeCells.put(colId, mergeInfo);
          }
          spanIndex = 1;
        }
        
        jg.writeFieldName(jp.getCurrentName());
        token = jp.nextToken();
        if (isValue == true)
        {
          String f = jp.getText();
          Map<Integer, Map<Integer, FormulaCell>> formulaMap = map.get("formulas");
          if (f.startsWith("=") && colId!=null && rowId!=null)
          {
            Map<Integer, FormulaCell> cellMap = formulaMap.get(rowId);
            if (cellMap == null) 
            {
              cellMap = new HashMap<Integer, FormulaCell>();
              formulaMap.put(rowId, cellMap);
            }
            FormulaCell contextFormulaCell = new FormulaCell(sheet, rowId, colId);
            FormulaUtil.parseFormulaToken(f, contextFormulaCell, true);
            cellMap.put(colId, contextFormulaCell);
          }
        }
        if(mergeInfo != null)
          mergeInfo[spanIndex] = jp.getIntValue();
      }

      switch (token)
        {
          case START_OBJECT :
            jg.writeStartObject();
            while (jp.nextToken() != JsonToken.END_OBJECT)
            {
              copyCurrentStructureAndInfos(jp, jg, sheet, rowId, colId, map);
            }

            if (jp instanceof ModifiableJsonParser)
            {
              ModifiableJsonParser mjp = (ModifiableJsonParser) jp;
              while (mjp.hasInsertedFields())
              {
                // if current mjp still has inserted fields, it is meant to be inserted in current object,
                // but current object is ending, flush it before ends the object
                JsonParser ijp = mjp.insertedFieldAsParser();
                ijp.nextToken();
                while (ijp.getCurrentToken() != null)
                {
                  jg.copyCurrentEvent(ijp);
                  ijp.nextToken();
                }
                mjp.clearInsertedFields();
              }
            }

            jg.writeEndObject();
            break;
          case START_ARRAY :
            jg.writeStartArray();

            while (jp.nextToken() != JsonToken.END_ARRAY)
            {
              copyCurrentStructureAndInfos(jp, jg, sheet, rowId, colId, map);
            }

            jg.writeEndArray();
            break;
          default:
            jg.copyCurrentEvent(jp);
            break;
        }
    }

  }
}
