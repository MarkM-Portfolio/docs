package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.builder.HashCodeBuilder;
import org.codehaus.jackson.JsonEncoding;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonToken;
import org.codehaus.jackson.SerializableString;
import org.codehaus.jackson.io.SerializedString;
import org.codehaus.jackson.util.TokenBuffer;

import com.ibm.concord.document.common.chart.ChartDocument;
import com.ibm.concord.spi.draft.IDraftSerializer;
import com.ibm.concord.spreadsheet.SpreadsheetConfig;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.DocumentFeature;
import com.ibm.concord.spreadsheet.common.DocumentVersion;
import com.ibm.concord.spreadsheet.common.utils.CommonUtils;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.formula.Area;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.RecoverReferenceToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.ReferenceToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.VirtualFormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.SharedFormulaRef4CF;
import com.ibm.concord.spreadsheet.document.model.formula.SharedFormulaRef4RulesObj;
import com.ibm.concord.spreadsheet.document.model.impl.CoverInfo;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Comments;
import com.ibm.concord.spreadsheet.document.model.impl.FormulaCell;
import com.ibm.concord.spreadsheet.document.model.impl.IDManager;
import com.ibm.concord.spreadsheet.document.model.impl.IDManager.IDStruct;
import com.ibm.concord.spreadsheet.document.model.impl.Range;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.impl.RangeList;
import com.ibm.concord.spreadsheet.document.model.impl.RangeList.RangeIterator;
import com.ibm.concord.spreadsheet.document.model.impl.RangeList.RangeMap;
import com.ibm.concord.spreadsheet.document.model.impl.RangeList.RangesStruct;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.impl.Visibility;
import com.ibm.concord.spreadsheet.document.model.impl.io.ModelIOFactory.LoadMode;
import com.ibm.concord.spreadsheet.document.model.impl.io.swap.IRawDataStorageAdapter;
import com.ibm.concord.spreadsheet.document.model.impl.preserve.PreserveManager;
import com.ibm.concord.spreadsheet.document.model.impl.preserve.PreserveRangeList;
import com.ibm.concord.spreadsheet.document.model.impl.preserve.PreserveStyleRangeList;
import com.ibm.concord.spreadsheet.document.model.impl.preserve.PreserveValueCellSet;
import com.ibm.concord.spreadsheet.document.model.style.StyleManager;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.IMapEntryListener;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * Serialize document model to draft JSON. Construct by {@link ModelIOFactory}.
 */
public class Serializer implements IDraftSerializer
{
  private static final Logger LOG = Logger.getLogger(Serializer.class.getName());

  // serialized string constant
  private static final SerializableString SER_STR_EMPTY = new SerializedString("");

  // an hash code generated when nothing had been hashed, i.e. for an empty object
  private static final int HASH_EMPTY = new HashCodeBuilder().toHashCode();

  private JsonFactory jsonFactory;

  private OutputStream[] outStreams;

  private JsonGenerator[] jgs;

  private Document document;

  private DraftJSONWriterImpl jsonWriter;

  private ISheetContentIteratorWithRawData<Sheet> contentIterator;

  private ModelHelper.SerializableStringIdConvertor idConvertor;

  // for meta rows writing
  // if previously has opened "<sheetId>: {" for meta rows
  private boolean metaRowsSheetOpened;

  // in a row repeat range, the master row's properties
  private int masterRowId, masterRowIndex, masterRowRepeat, masterRowHeight, masterRowHash;

  private Visibility masterRowVis;

  // the state that if master row has/had any content or meta information to serialize/serialized
  private boolean masterRowEmpty;

  // if current row is determined to cannot repeat master row
  // if row has value, link or cover info, or row is not neighbor to previous master row, row can't repeat
  private boolean rowNotRepeat;

  // flag, true when current row is the master row
  private boolean currentIsMaster;

  // pre-checked range address, save as member to avoid duplicated range.getAddress()
  private String rangeAddress;

  // for reference writing
  // if previously has opened "<sheetId>: {" for references
  private boolean referencesSheetOpened;

  // if previously has opened "<rowId>: {" for references
  private boolean referencesRowOpened;

  // serializer for recover doc
  private boolean bRecover;

  private Document mainDoc;

  private int draftFildCnt;

  private List<StyleObject> styleList;

  private DraftActionGenerator actionGenerator;

  private ContentCellHandler contentCellHandler;

  private IdHandler idHandler;

  private DraftActionHandlerCompositor actionHandlers;

  boolean hasNodeJSEnabled;
  boolean isClosed;
  
  public Serializer()
  {
    draftFildCnt = 4;
  }

  public void setIsClosed(boolean isClosed)
  {
	  this.isClosed = isClosed;
  }
  
  public void setDraftFileCount(int cnt)
  {
    draftFildCnt = cnt;
  }

  public void setRecoverSerializer(boolean bRec)
  {
    bRecover = bRec;
  }

  /**
   * set the main document if this serializer is used for recover doc
   * 
   * @param doc
   */
  public void setMainDoc(Document doc)
  {
    mainDoc = doc;
  }

  public void setOutStreams(OutputStream... outStreams)
  {
    this.outStreams = outStreams;
  }

  public void setJsonFactory(JsonFactory jsonFactory)
  {
    this.jsonFactory = jsonFactory;
  }

  public void setStyleList(List<StyleObject> styleList)
  {
    this.styleList = styleList;
  }

  /**
   * <p>
   * This method serializes provided Document.
   * <p>
   * This method de-composition Document model into primitive values, use one {@link IDraftJSONWriter} implementation to write data to
   * appropriate JSON stream.
   * <p>
   * The serializing sequence
   * <ol>
   * <li>meta.js, except ID array, meta rows and meta columns
   * <li>content.js styles
   * <li>content.js ranges
   * <li>meta.js meta columns, meta rows into writer's buffer, sheet content, together with references.
   * <li>preserve.js ranges
   * <li>preserve.js others
   * <li>meta.js ID array
   * <li>meta.js flush meta rows and meta columns
   * </ol>
   * 
   * @param d
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void serialize(Document d) throws JsonGenerationException, IOException
  {
    if (outStreams == null)
    {
      throw new IllegalStateException("No OutputStream assigned.");
    }
    // if userefercenjs flag is not set, do not process reference.js.
    // But need provide a null stream. Or there will be exception
    if (SpreadsheetConfig.useReferenceJS()) 
      jgs = new JsonGenerator[outStreams.length];
    else
      jgs = new JsonGenerator[outStreams.length + 1];
    int skip = 0;
    for (int i = 0; i < outStreams.length; i++)
    {
      if (!SpreadsheetConfig.useReferenceJS() && 
          i == IDraftJSONWriter.REFERENCE)
      {
        skip = 1; // do not process reference.js
        jgs[IDraftJSONWriter.REFERENCE] = null;
      }
      if (outStreams[i] != null)
      {
        jgs[i + skip] = jsonFactory.createJsonGenerator(outStreams[i], JsonEncoding.UTF8);
      }
    }

    jsonWriter = new DraftJSONWriterImpl(jsonFactory);
    jsonWriter.setJsonGenerators(jgs);
    jsonWriter.setNodeJSEnabled(hasNodeJSEnabled);
    document = d;

    idConvertor = document.getIdConvertor();

    if (ModelIOFactory.LOAD_MODE != LoadMode.ALL)
    {
      actionGenerator = new DraftActionGenerator();

      actionHandlers = new DraftActionHandlerCompositor();
      contentCellHandler = new ContentCellHandler();
      actionHandlers.addHandler(contentCellHandler);

      if (styleList != null && !styleList.isEmpty())
      {
        IDraftActionHandler styleIdHandler = new StyleIdHandler();
        actionHandlers.addHandler(styleIdHandler);
      }

      idHandler = new IdHandler();
      actionHandlers.addHandler(idHandler);
    }

    try
    {
      //version is null in recovered sheet meta.
      DocumentVersion curVersion = document.getVersion();
      if(curVersion != null && curVersion.hasFeature(DocumentFeature.SHAPE_WITHOUT_TXT))
      {
        jsonWriter.writeVersion(DocumentVersion.VERSION_1_0_6.toString());
      }
      else
      {
        jsonWriter.writeVersion(DocumentVersion.VERSION_1_0_5.toString());
      }

      if (document.getDefaultColumnWidth() >= 0)
      {
        jsonWriter.writeDefaultColumnWidth(document.getDefaultColumnWidth());
      }

      if (idConvertor.getInitRowCount() > 1)
      {
        jsonWriter.writeInitRowCount(idConvertor.getInitRowCount());
      }

      if (idConvertor.getInitColumnCount() > 1)
      {
        jsonWriter.writeInitColumnCount(idConvertor.getInitColumnCount());
      }

      if (idConvertor.getInitStyleCount() > 1)
      {
        jsonWriter.writeInitStyleCount(idConvertor.getInitStyleCount());
      }

      if (idConvertor.getInitSheetId() > 0)
      {
        jsonWriter.writeInitSheetId(idConvertor.getInitSheetId());
      }

      if (document.getLocale() != null)
      {
        jsonWriter.writeLocale(document.getLocale());
      }

      if (document.isCSV())
      {
        jsonWriter.writeCSV(document.isCSV());
      }
      
      if (document.isDate1904())
      {
        jsonWriter.writeDate1904();
      }

      // TODO calculate and serialize max column index and max row index
      writeMetaSheets();

      if (document.isCalculated())
      {
        jsonWriter.writeCalculated(true);
      }
      writeContentRanges();

      writeSheetContent();

      writeStyles();

      writePreserveRanges(DraftSection.PRESERVE_PNAMES);

      writePreserveOthers();

      writeIdArray();

      jsonWriter.flushBufferedDraftSection(DraftSection.META_ROWS);
      jsonWriter.flushBufferedDraftSection(DraftSection.META_COLUMNS);

      if (!bRecover){
        writeCharts();
        writeComments();
      }
    }
    finally
    {
      jsonWriter.close();
    }
  }

  public void serialize(Object draftObject, List<OutputStream> outStreams) throws IOException
  {
    setOutStreams(outStreams.toArray(new OutputStream[outStreams.size()]));
    // serialize recover manager
    Document doc = (Document) draftObject;
    serialize(doc);
  }

  // write meta.js sheets and sheetsIdArray
  private void writeMetaSheets() throws JsonGenerationException, IOException
  {
    List<Sheet> sheets = document.getSheets();
    // write meta.js sheets
    DraftSection section = DraftSection.META_SHEETS;
    jsonWriter.openDraftSection(section, false);
    for (int i = 0; i < sheets.size(); i++)
    {
      Sheet st = sheets.get(i);
      SerializableString sheetId = idConvertor.toSerializableStringId(st.getId());
      jsonWriter.openObject(sheetId, section);
      jsonWriter.writeSheetIndex(i + 1);
      jsonWriter.writeSheetName(st.getSheetName());
      if ("rtl".equalsIgnoreCase(st.getDir()))      
    	  jsonWriter.writeSheetDirection("rtl");
      jsonWriter.writeSheetProtected(st.isSheetProtected());
      if (st.getFreezeRowIndex() >= 0)
        jsonWriter.writeFreezeRow(st.getFreezeRowIndex());
      if (st.getFreezeColIndex() >= 0)
        jsonWriter.writeFreezeCol(st.getFreezeColIndex());      
      if ( st.getVisibility() != null)
        jsonWriter.writeSheetVisibility(st.getVisibility());
      if(st.getColor() != null)
    	jsonWriter.writeSheetColor(st.getColor());
      if (st.getOffGridLines())
        jsonWriter.writeOffGridLines(st.getOffGridLines());
      if (bRecover)
        jsonWriter.writeSheetUUID(st.getUUId());

      if (st.getRowHeight() > 0)
      {
        jsonWriter.writeSheetRowHeight(st.getRowHeight());
      }

      if (st.getType() != null)
      {
        jsonWriter.writeSheetType(st.getType());
      }

      jsonWriter.closeObject(section);
    }
    jsonWriter.closeDraftSection(section);

    section = DraftSection.META_SHEETSIDARRAY;
    jsonWriter.openDraftSection(section, false);
    for (int i = 0; i < sheets.size(); i++)
    {
      Sheet st = sheets.get(i);
      SerializableString sheetId = idConvertor.toSerializableStringId(st.getId());
      jsonWriter.writeId(sheetId, section);
    }
    jsonWriter.closeDraftSection(section);
  }

  // write content.js styles
  private void writeStyles() throws JsonGenerationException, IOException
  {
    jsonWriter.openDraftSection(DraftSection.CONTENT_STYLES, false);
    StyleManager styleManager = document.getStyleManager();
    Map<Integer, StyleObject> styleMap = styleManager.getStyleMap();
    int styleCount = 0;

    StyleObject style = styleManager.getDefaultCellStyle();
    style.setSerializedId(new SerializedString(ConversionConstant.DEFAULT_CELL_STYLE));
    writeStyle(style);

    style = styleManager.getDefaultStyle();
    if (!style.isEmpty())
    {
      style.setSerializedId(new SerializedString(ConversionConstant.DEFAULT_CELL_STYLE_NAME));
      writeStyle(style);
    }

    int w = styleManager.getDefaultColWidth();
    if (w >= 0)
    {
      jsonWriter.writeDefaultColumnStyle(w);
    }

    int h = styleManager.getDefaultRowHeight();
    if (h > 0)
    {
      jsonWriter.writeDefaultRowStyle(h);
    }

    Collection<StyleObject> styles = styleMap.values();

    for (Iterator<StyleObject> iterator = styles.iterator(); iterator.hasNext();)
    {
      style = iterator.next();
      // style would be null if list is not full
      if (style == null || style.isEmpty())
      {
        // find empty style
        LOG.finer("Find empty style, skip.");
        continue;
      }

      if (style.getSerializedId(null) == null)
      {
        LOG.finer("Find unused style, skip.");
        continue;
      }

      writeStyle(style);
    }
    jsonWriter.closeDraftSection(DraftSection.CONTENT_STYLES);
  }

  // write one content.js style def
  private void writeStyle(StyleObject style) throws JsonGenerationException, IOException
  {
    jsonWriter.openObject(style.getSerializedId(null), DraftSection.CONTENT_STYLES);

    jsonWriter.writeStyleAlign((String) style.getAttribute(ConversionConstant.TEXT_ALIGN));
    jsonWriter.writeStyleValign((String) style.getAttribute(ConversionConstant.VERTICAL_ALIGN));
    jsonWriter.writeStyleDirection((String) style.getAttribute(ConversionConstant.DIRECTION));
    jsonWriter.writeStyleBackgroundColor((String) style.getAttribute(ConversionConstant.BACKGROUND_COLOR));
    jsonWriter.writeStyleIndent((Number) style.getAttribute(ConversionConstant.INDENT));
    jsonWriter.writeStyleWrap((Boolean) style.getAttribute(ConversionConstant.WRAPTEXT));
    jsonWriter.writeStylePreserve((String) style.getAttribute(ConversionConstant.STYLE_PRESERVE));
    jsonWriter.writeStyleDxfId((Number) style.getAttribute(ConversionConstant.STYLE_DXFID));
    jsonWriter.writeStyleHidden((Boolean) style.getAttribute(ConversionConstant.STYLE_HIDDEN));
    jsonWriter.writeStyleLocked((Boolean) style.getAttribute(ConversionConstant.STYLE_UNLOCKED));
    jsonWriter.writeStyleBorderWidth((String) style.getAttribute(ConversionConstant.BORDER_TOP), //
        (String) style.getAttribute(ConversionConstant.BORDER_RIGHT), //
        (String) style.getAttribute(ConversionConstant.BORDER_BOTTOM), //
        (String) style.getAttribute(ConversionConstant.BORDER_LEFT)); //
    jsonWriter.writeStyleBorderColor((String) style.getAttribute(ConversionConstant.BORDER_TOP_COLOR), //
        (String) style.getAttribute(ConversionConstant.BORDER_RIGHT_COLOR), //
        (String) style.getAttribute(ConversionConstant.BORDER_BOTTOM_COLOR), //
        (String) style.getAttribute(ConversionConstant.BORDER_LEFT_COLOR));
    jsonWriter.writeStyleBorderStyle((String) style.getAttribute(ConversionConstant.BORDER_TOP_STYLE), //
        (String) style.getAttribute(ConversionConstant.BORDER_RIGHT_STYLE), //
        (String) style.getAttribute(ConversionConstant.BORDER_BOTTOM_STYLE), //
        (String) style.getAttribute(ConversionConstant.BORDER_LEFT_STYLE));
    jsonWriter.writeStyleFormat((String) style.getAttribute(ConversionConstant.FORMATCATEGORY), //
        (String) style.getAttribute(ConversionConstant.FORMATCODE), //
        (String) style.getAttribute(ConversionConstant.FORMAT_FONTCOLOR), //
        (String) style.getAttribute(ConversionConstant.FORMATCURRENCY)); //
    jsonWriter.writeStyleFont((Boolean) style.getAttribute(ConversionConstant.BOLD), //
        (Boolean) style.getAttribute(ConversionConstant.ITALIC), //
        (Boolean) style.getAttribute(ConversionConstant.STRIKTHROUGH), //
        (Boolean) style.getAttribute(ConversionConstant.UNDERLINE), //
        (String) style.getAttribute(ConversionConstant.COLOR), //
        (String) style.getAttribute(ConversionConstant.FONTNAME), //
        (Number) style.getAttribute(ConversionConstant.SIZE)); //

    jsonWriter.closeObject(DraftSection.CONTENT_STYLES);
  }

  // write content named range, unnamed range and preserve range
  private void writeContentRanges() throws JsonGenerationException, IOException
  {
    // write named ranges
    RangeList<String> rangeList = document.getRangeList();
    Map<RangeUsage, RangeMap<String>> rangesByType = rangeList.getByUsageRangeMap();
    RangeMap<String> nameRanges = rangesByType.get(RangeUsage.NAMES);
    List<SharedFormulaRef4RulesObj> rulesObjs = document.getRulesObjs();
    if (nameRanges != null && !nameRanges.isEmpty())
    {
      final DraftSection section = DraftSection.CONTENT_NAMES;
      jsonWriter.openDraftSection(section, false);

      ModelHelper.iterateMap(nameRanges, new RangeIterator<String>()
      {
        public boolean onEntry(String id, Range<String> range)
        {
          try
          {
            // for named range, id is in lower case, use range's string id which is the
            // original name
            String name = (String)range.getData().get("name");
            if(name == null)
              name = id;
            range.getData().remove("name");
            jsonWriter.openObject(name, section);
            // named range don't need to pre-check, just read address
            rangeAddress = range.getAddress();
            writeRange(range, section);
            jsonWriter.closeObject(section);
            return false;
          }
          catch (Exception e)
          {
            // can't do anything, throw to upper
            throw new RuntimeException(e);
          }
        }
      });

      jsonWriter.closeDraftSection(section);
    }

    // write unnamed ranges
    ModelHelper.iterateMap(rangesByType, new IMapEntryListener<RangeUsage, RangeMap<String>>()
    {
      public boolean onEntry(RangeUsage type, RangeMap<String> ranges)
      {
        try
        {
          final DraftSection section = DraftSection.CONTENT_UNNAMES;
          if (!jsonWriter.isDraftSectionOpened(section))
          {
            // "unnames" in content.js not opened, open it now
            jsonWriter.openDraftSection(section, false);
          }
          ModelHelper.iterateMap(ranges, new RangeIterator<String>()
          {
            public boolean onEntry(String id, Range<String> range)
            {
              try
              {
                if (preCheckRange(range) && range.getUsage() != RangeUsage.NAMES)//name range already serialized 
                {
                  jsonWriter.openObject(id, section);
                  writeRange(range, section);
                  jsonWriter.closeObject(section);
                }
                return false;
              }
              catch (Exception e)
              {
                // can't do anything, throw to upper
                throw new RuntimeException(e);
              }
            }
          });
          return false;
        }
        catch (Exception e)
        {
          // can't do anything, throw to upper
          throw new RuntimeException(e);
        }

      }
    });

    //write data validations
    if(rulesObjs.size() > 0)
    {
    	 try
         {
	    	final DraftSection section = DraftSection.CONTENT_UNNAMES;
	    	if (!jsonWriter.isDraftSectionOpened(section))
	    		 jsonWriter.openDraftSection(section, false);
	    	
	    	Iterator<SharedFormulaRef4RulesObj> iter = rulesObjs.iterator();
	    	while(iter.hasNext())
	    	{
	    		SharedFormulaRef4RulesObj range = iter.next();
	    		String addr =  range.getAddress(document);
	    		if (addr == null || addr.contains(ConversionConstant.INVALID_REF))
	    			continue;
	    		if (range instanceof SharedFormulaRef4CF) {
	    			processConditionaFormatRange((SharedFormulaRef4CF)range);
	    		}
	    		jsonWriter.openObject(range.getId(), section);
	    		writeRulesObjRange(range, section);
	    		jsonWriter.closeObject(section);
	    	}
         }
    	 catch (Exception e)
         {
           // can't do anything, throw to upper
           throw new RuntimeException(e);
         }
    }
    	
    
    if (jsonWriter.isDraftSectionOpened(DraftSection.CONTENT_UNNAMES))
    {
      jsonWriter.closeDraftSection(DraftSection.CONTENT_UNNAMES);
    }

    writePreserveRanges(DraftSection.CONTENT_PNAMES);
  }
  
  private void processConditionaFormatRange(SharedFormulaRef4CF range) {
	int ruleCount = range.getRulesCount();
	for (int i=0; i<ruleCount; i++) {
	    StyleObject so = null;
		String sid = range.getRuleStyleId(i);
		if (sid != null) {
            int numberId = ModelHelper.stripIdType(sid);    	            
            so = styleList.size() > numberId ?  styleList.get(numberId) : null;
		} else {
			JSONObject style = range.getRuleStyleJSON(i);
			if (style != null)
				so = document.getStyleManager().addStyle(style);
		}
		if (so != null) {
            SerializableString serId = so.getSerializedId(idConvertor);
            range.setRuleStyleId(i, serId.toString());
        } else {
          	LOG.log(Level.WARNING, "Did not find the Style");
        }
	}
  }

  private void writeRulesObjRange(SharedFormulaRef4RulesObj range, DraftSection section)throws JsonGenerationException, IOException
  {
	  IDManager idMgr = document.getIDManager();
	  SerializableString strId;
	  int sheetId = range.getSheetId();
	  if (sheetId != IDManager.INVALID)
	  {
	      strId = idConvertor.toSerializableStringId(sheetId);
	      jsonWriter.writeSheetId(strId, section);
	  }
	  
	  int id = idMgr.getRowIdByIndex(sheetId, range.getStartRow(), true, true);
	  if (id != IDManager.INVALID)
	  {
	      strId = idConvertor.toSerializableStringId(id);
	      jsonWriter.writeStartRowId(strId, section);
	  }
	  
	  id = idMgr.getRowIdByIndex(sheetId, range.getEndRow(), true, true);
	  if (id != IDManager.INVALID)
	  {
	      strId = idConvertor.toSerializableStringId(id);
	      jsonWriter.writeEndRowId(strId, section);
	  }
	  
	  id = idMgr.getColIdByIndex(sheetId, range.getStartCol(), true);
	  if (id != IDManager.INVALID)
	  {
	      strId = idConvertor.toSerializableStringId(id);
	      jsonWriter.writeStartColumnId(strId, section);
	  }
	  
	  id = idMgr.getColIdByIndex(sheetId, range.getEndCol(), true);
	  if (id != IDManager.INVALID)
	  {
	      strId = idConvertor.toSerializableStringId(id);
	      jsonWriter.writeEndColumnId(strId, section);
	  }
	  
	  jsonWriter.writeUsage(range.getUsage(), section);
	  jsonWriter.writeAddress(range.getAddress(document), section);
	  jsonWriter.writeData(range.getJsonData(), section);
  }
  
  // write one range def
  private <T> void writeRange(Range<T> range, DraftSection section) throws JsonGenerationException, IOException
  {
    SerializableString strId;
    int id = range.getSheetId();
    boolean bShareId = false;
    if (range.getUsage() == RangeUsage.RECOVER_REFERENCE && bRecover)
      bShareId = true;
    if (id != IDManager.INVALID)
    {
      strId = idConvertor.toSerializableStringId(id);
      jsonWriter.writeSheetId(strId, section);
      if (bShareId)
        mainDoc.getIdConvertor().shareIdCache(idConvertor, id);
    }
    id = range.getEndSheetId();
    if (id != IDManager.INVALID)
    {
      strId = idConvertor.toSerializableStringId(id);
      jsonWriter.writeEndSheetId(strId, section);
      if (bShareId)
        mainDoc.getIdConvertor().shareIdCache(idConvertor, id);
    }

    id = range.getStartRowId();
    if (id != IDManager.INVALID)
    {
      strId = idConvertor.toSerializableStringId(id);
      jsonWriter.writeStartRowId(strId, section);
      if (bShareId)
        mainDoc.getIdConvertor().shareIdCache(idConvertor, id);
    }

    id = range.getEndRowId();
    if (id != IDManager.INVALID)
    {
      strId = idConvertor.toSerializableStringId(id);
      jsonWriter.writeEndRowId(strId, section);
      if (bShareId)
        mainDoc.getIdConvertor().shareIdCache(idConvertor, id);
    }

    id = range.getStartColId();
    if (id != IDManager.INVALID)
    {
      strId = idConvertor.toSerializableStringId(id);
      jsonWriter.writeStartColumnId(strId, section);
      if (bShareId)
        mainDoc.getIdConvertor().shareIdCache(idConvertor, id);
    }

    id = range.getEndColId();
    if (id != IDManager.INVALID)
    {
      strId = idConvertor.toSerializableStringId(id);
      jsonWriter.writeEndColumnId(strId, section);
      if (bShareId)
        mainDoc.getIdConvertor().shareIdCache(idConvertor, id);
    }

    jsonWriter.writeUsage(range.getUsage(), section);
    jsonWriter.writeAddress(rangeAddress, section);
    jsonWriter.writeData(range.getData(), section);
  }

  // Write content.js sheets, meta.js rows and meta.js columns, reference.js
  // This method uses one ISheetContentIterator implementation to help to iterate all over one sheet.
  // This method tries to write content JSON as compressed as possible. It will try to repeat everything possible.
  // To repeat one row, it needs to serialize row content to one TokenBuffer first, later flush the buffer to draft JSON,
  // or increase master meta row repeat if the content is the same with the master.
  private void writeSheetContent() throws JsonGenerationException, IOException
  {
    contentIterator = new SheetContentIteratorImpl(document);
    List<Sheet> sheets = document.getSheets();
    // open related draft sections
    jsonWriter.openDraftSection(DraftSection.META_COLUMNS, true);
    jsonWriter.openDraftSection(DraftSection.META_ROWS, true);
    jsonWriter.openDraftSection(DraftSection.CONTENT_SHEETS, false);
    if (SpreadsheetConfig.useReferenceJS())
    {
      jsonWriter.openDraftSection(DraftSection.REFERENCE_SHEETS, false);
    }

    TokenBuffer buffer;

    int rowIndex;

    // FOR every sheet
    for (Iterator<Sheet> iterator = sheets.iterator(); iterator.hasNext();)
    {
      Sheet sheet = iterator.next();
      contentIterator.setSheetModel(sheet);
      writeMetaColumns(sheet);
      // reset master row properties
      metaRowsSheetOpened = false;
      masterRowId = -1;
      masterRowIndex = -1;
      masterRowHeight = 0;
      masterRowRepeat = 0;
      masterRowVis = null;
      masterRowEmpty = true;
      // reset reference writing
      referencesSheetOpened = false;

      if (contentCellHandler != null)
      {
        contentCellHandler.sheet = sheet;
      }

      // write sheet content and rows
      DraftSection section = DraftSection.CONTENT_SHEETS;

      if (sheet.getRawMetaRows() != null || sheet.getRawContentRows() != null)
      {
        // all rows in sheet is raw data, serialize from raw data
        writeSheetRawRows(sheet);
      }
      else
      {
        // write sheet id
        jsonWriter.openObject(idConvertor.toSerializableStringId(sheet.getId()), section);
        // write "rows: {"
        jsonWriter.openObject(ConversionConstant.ROWS, section);

        for (contentIterator.firstRow(); contentIterator.hasNextRow();)
        {
          contentIterator.nextRow();
          if (contentIterator.isRowEmpty())
          {
            if (LOG.isLoggable(Level.FINER))
            {
              LOG.log(Level.FINER, "Ignore empty row ({0}: {1}) at index {3}.", new Object[] { sheet.getId(), contentIterator.getRowId(),
                  contentIterator.getRowIndex() });
            }
          }
          else
          {
            // we have entered a new row, set not a master for now
            currentIsMaster = false;
            rowNotRepeat = false;
            // reset reference writing
            referencesRowOpened = false;

            if (masterRowId == -1)
            {
              // first row
              currentRowAsMaster();
              // first row has nothing to repeat, set as not repeat to make the content serialize to draft
              rowNotRepeat = true;
            }
            else
            {
              // pre-check if row meta can repeat
              rowIndex = contentIterator.getRowIndex();
              if (masterRowIndex + masterRowRepeat + 1 != rowIndex)
              {
                // not neighboring, can't repeat
                rowNotRepeat = true;
              }

              if (masterRowHeight != contentIterator.getRowHeight())
              {
                rowNotRepeat = true;
              }

              if (masterRowVis != contentIterator.getRowVisbility())
              {
                rowNotRepeat = true;
              }

              if (contentIterator.getRowRawContentCells() != null)
              {
                // row has raw data and never be deserialized. copy it, row cannot repeat
                rowNotRepeat = true;
              }

              if (!currentIsMaster && rowNotRepeat)
              {
                // if row can't repeat due to pre-check
                // and current row is not master, since master row is always (rowNotRepeat == false)
                // flush previously master row meta if any
                writeRowMeta(sheet);
                // current row as new master row candidate
                currentRowAsMaster();
              }
            }

            if (contentIterator.getRowRawContentCells() == null)
            {
              // serialize from model
              contentIterator.firstCell();
              if (!contentIterator.hasNextCell())
              {
                // row has no cell content
                if (rowNotRepeat)
                {
                  // if current row is not repeating, it could be a master candidate, set its hash
                  masterRowHash = contentIterator.getRowContentHash();
                }
                else
                {
                  // row repeating, check empty hash
                  if (masterRowHash == contentIterator.getRowContentHash())
                  {
                    // row repeats
                    masterRowRepeat += 1 + contentIterator.getRowRepeat();
                  }
                  else
                  {
                    // row content not equal, replace master
                    writeRowMeta(sheet);
                    currentRowAsMaster();
                    masterRowHash = contentIterator.getRowContentHash();
                  }
                }
                continue;
              }

              // write row id
              if (rowNotRepeat)
              {
                buffer = null;
                jsonWriter.openObject(idConvertor.toSerializableStringId(contentIterator.getRowId()), section);
              }
              else
              {
                buffer = new TokenBuffer(null);
                buffer.writeFieldName(idConvertor.toSerializableStringId(contentIterator.getRowId()));
                buffer.writeStartObject();
              }

              while (contentIterator.hasNextCell())
              {
                contentIterator.nextCell();
                if (contentIterator.isCellEmpty())
                {
                  if (LOG.isLoggable(Level.FINER))
                  {
                    LOG.log(
                        Level.FINER,
                        "Ignore empty cell ({0}: {1}: {2}) at index ({3}, {4}).",
                        new Object[] { sheet.getId(), contentIterator.getRowId(), contentIterator.getCellId(),
                            contentIterator.getRowIndex(), contentIterator.getCellIndex() });
                  }
                }
                else
                {
                  if (rowNotRepeat)
                  {
                    // row cannot repeat, start writing to draft
                    writeCellContentToDraft();
                    // if row cannot repeat, current row is a master candidate, we serialized some cell content, set as not empty
                    masterRowEmpty = false;
                  }
                  else
                  {
                    // it is possible that current row can repeat, write content to buffer
                    if (contentIterator.getRowId() == masterRowId)
                    {
                      // current row is master candidate, or in a repeat range, if it is a master candidate, we write something (in the
                      // buffer),
                      // set master as not empty
                      masterRowEmpty = false;
                    }

                    writeCellContentToBuffer(buffer);
                    if (rowNotRepeat)
                    {
                      // row changed to cannot repeat, flush current buffer
                      flushBufferToDraft(buffer);
                      // current row has data, previous master row need to be flushed,
                      writeRowMeta(sheet);
                      // current row can't be used as master row, serialize it and abandon
                      currentRowAsMaster();
                      // we have something in current row to make it change to cannot repeat, the content make the row not empty
                      masterRowEmpty = false;
                      writeRowMeta(sheet);
                      masterRowId = -1;
                    }
                  }

                  if (SpreadsheetConfig.useReferenceJS())
                  { // check if enable reference.js usage
                    // else, no need to update formula
                    // write references
                    // write references
                    List<FormulaToken> formulaTokens = contentIterator.getFormulaTokens();
                    //should serialize reference for empty tokenlist if the cell is dirty, so that it can create formula cell when deserialize
                    if (formulaTokens != null && ( (formulaTokens.size() > 0 ) || contentIterator.getCellDirty()) )
                    {
                      openReferenceSheet(sheet.getId());
                      openReferenceRow(contentIterator.getRowId());
                      writeReferences(contentIterator.getRowId(), contentIterator.getCellId(), formulaTokens, contentIterator.getFormulaErrProps());
                    }
                  }
                }
              }

              // we iterated all cell content
              if (rowNotRepeat)
              {
                // row is not repeated, if it is set during pre-check, the row content is already serialized,
                // if it is set during cell content serializing, row content also serialized, with current row
                // we only need to call closeObject() and end the row
                jsonWriter.closeObject(section);
                // this row could be a master candidate, record hash
                masterRowHash = contentIterator.getRowContentHash();
              }
              else
              {
                int hash = contentIterator.getRowContentHash();
                if (masterRowHash == hash)
                {
                  // row content equal, increase master repeat to include current row
                  masterRowRepeat += 1 + contentIterator.getRowRepeat();
                }
                else
                {
                  // row content not equal, row not repeat
                  // flush previous master row meta
                  writeRowMeta(sheet);
                  // current row as new master row
                  flushBufferToDraft(buffer);
                  jsonWriter.closeObject(section);
                  currentRowAsMaster();
                  masterRowHash = contentIterator.getRowContentHash();
                  // after currentRowAsMaster(), masterRowEmpty means the master row meta is empty or not, plus content empty information 
                  masterRowEmpty = masterRowEmpty && (masterRowHash == HASH_EMPTY);
                }
              }
            }
            else
            {
              writeRowRawContentCells(sheet);
              if (currentIsMaster)
              {
                // if current row is master row, row meta for this raw row didn't get chance to flush, flush it now
                // suppose this raw row is not empty
                masterRowEmpty = false;
                writeRowMeta(sheet);
                // reset master row candidate
                masterRowId = -1;
              }
            }
            closeReferenceRow();
          } // end of serialize all row content
        } // end of iterating all sheet content rows
        // close content "rows"
        jsonWriter.closeObject(section);
        // close sheet
        jsonWriter.closeObject(section);
        if (masterRowId > 0)
        {
          // flush last master row index
          writeRowMeta(sheet);
        }
        // else, row meta is previously cleared, and never be set to a valid row

        // close meta rows sheet
        closeMetaRowsSheet();
        // close references sheet
        closeReferenceSheet();
      } // end of condition that row models are built.
    } // end of FOR all sheets

    if (SpreadsheetConfig.useReferenceJS())
    {
      jsonWriter.closeDraftSection(DraftSection.REFERENCE_SHEETS);
    }
    jsonWriter.closeDraftSection(DraftSection.META_COLUMNS);
    jsonWriter.closeDraftSection(DraftSection.META_ROWS);
    jsonWriter.closeDraftSection(DraftSection.CONTENT_SHEETS);
  }

  // set current row meta data from iterator as a candidate meta row
  private void currentRowAsMaster()
  {
    masterRowId = contentIterator.getRowId();
    masterRowIndex = contentIterator.getRowIndex();
    masterRowRepeat = contentIterator.getRowRepeat();
    masterRowHeight = contentIterator.getRowHeight();
    masterRowVis = contentIterator.getRowVisbility();
    // pre-check if this master row is empty
    masterRowEmpty = masterRowHeight == 0 && (masterRowVis == null || masterRowVis == Visibility.VISIBLE);
    masterRowHash = 0;
    currentIsMaster = true;
  }

  // flush the temp content buffer to draft JSON
  private void flushBufferToDraft(TokenBuffer buffer) throws JsonParseException, IOException
  {
    DraftSection section = DraftSection.CONTENT_SHEETS;
    // buffer starts with <rowId>: {
    // contains at least one cell def <columnId>: {
    JsonParser jp = buffer.asParser();
    JsonToken jt = jp.nextToken();
    // write rowId
    jsonWriter.openObject(jp.getCurrentName(), section);
    // jump over {
    jp.nextToken();
    jt = jp.nextToken();
    while (jt != null)
    {
      // write columnId
      jsonWriter.openObject(jp.getCurrentName(), section);
      // jump over {
      jp.nextToken();
      jt = jp.nextToken();
      while (jt != JsonToken.END_OBJECT)
      {
        String fieldName = jp.getCurrentName();
        if (fieldName.equals(ConversionConstant.STYLEID))
        {
          jp.nextToken();
          jsonWriter.writeStyleId(new SerializedString(jp.getText()), section);
        }
        else if (fieldName.equals(ConversionConstant.LINK))
        {
          jp.nextToken();
          jsonWriter.writeLink(jp.getText());
        }
        else if (fieldName.equals(ConversionConstant.VALUE))
        {
          jt = jp.nextToken();
          if (jt == JsonToken.VALUE_STRING)
          {
            jsonWriter.writeValue(jp.getText());
          }
          else if (jt == JsonToken.VALUE_NUMBER_FLOAT)
          {
            jsonWriter.writeValue(jp.getDoubleValue());
          }
          else
          {
            jsonWriter.writeValue(jp.getLongValue());
          }
        }
        else if (fieldName.equals(ConversionConstant.CALCULATEDVALUE) && hasNodeJSEnabled)
        {
          jt = jp.nextToken();
          if (jt == JsonToken.VALUE_STRING)
          {
            jsonWriter.writeCalcValue(jp.getText());
          }
          else if (jt == JsonToken.VALUE_NUMBER_FLOAT)
          {
            jsonWriter.writeCalcValue(jp.getDoubleValue());
          }
          else
          {
            jsonWriter.writeCalcValue(jp.getLongValue());
          }
        }
        else if (fieldName.equals(ConversionConstant.CELL_DIRTY) && hasNodeJSEnabled)
        {
          jp.nextToken();
          jsonWriter.writeCellDirty(jp.getBooleanValue());
        }
//        else if (fieldName.equals(ConversionConstant.FORMULA_ERRORCODE) && hasNodeJSEnabled)
//        {
//          jp.nextToken();
//          jsonWriter.writeCellErrorCode(jp.getIntValue());
//        }
        else if (fieldName.equals(ConversionConstant.REPEATEDNUM))
        {
          jp.nextToken();
          jsonWriter.writeRepeatedNum(jp.getIntValue(), section);
        }
        else if (fieldName.equals(ConversionConstant.COLSPAN))
        {
          jp.nextToken();
          jsonWriter.writeColSpan(jp.getIntValue());
        }
        else if (fieldName.equals(ConversionConstant.ROWSPAN))
        {
          jp.nextToken();
          jsonWriter.writeRowSpan(jp.getIntValue());
        }
        else if (fieldName.equals(ConversionConstant.ISCOVERED))
        {
          jp.nextToken();
          jsonWriter.writeIsCovered();
        }
        else if (fieldName.equals(ConversionConstant.KEY_STRING_INDEX))
        {
          jp.nextToken();
          jsonWriter.writeCellStringIndex(jp.getIntValue());
        }
        else if (fieldName.equals(ConversionConstant.CELL_TYPE))
        {
          jp.nextToken();
          jsonWriter.writeCellType(jp.getIntValue());
        }
        else
        {
          LOG.log(Level.WARNING, "From content buffer, read unknown data with field name {0}.", fieldName);
          jp.nextToken();
        }
        jt = jp.nextToken();
      }
      // close column id
      jsonWriter.closeObject(section);
      // jt is now END_OBJECT, jump to next column id
      jt = jp.nextToken();
    }
  }

  // write one cell content to temp content buffer
  private void writeCellContentToBuffer(TokenBuffer buffer) throws JsonGenerationException, IOException
  {
    // write cell column id
    buffer.writeFieldName(idConvertor.toSerializableStringId(contentIterator.getCellId()));
    buffer.writeStartObject();
    // cell style
    if (contentIterator.getCellStyle() != null)
    {
      buffer.writeFieldName(ConversionConstant.STYLEID);
      buffer.writeString(contentIterator.getCellStyle().getSerializedId(idConvertor));
    }
    // cell link
    if (contentIterator.getCellLink() != null)
    {
      rowNotRepeat = true;
      buffer.writeFieldName(ConversionConstant.LINK);
      buffer.writeString(contentIterator.getCellLink());
    }
    // cell value
    Object v = contentIterator.getCellValue();
    if (v != null)
    {
      rowNotRepeat = true;
      buffer.writeFieldName(ConversionConstant.VALUE);
      if (v instanceof String)
      {
        buffer.writeString((String) v);
      }
      else if (v instanceof Number)
      {
        if (v instanceof Float || v instanceof Double)
        {
          buffer.writeNumber(((Number) v).doubleValue());
        }
        else
        {
          // v is integer or long
          buffer.writeNumber(((Number) v).longValue());
        }
      }
    }
    // cell type
    if (contentIterator.getCellType() != 0)
    {
      if (!hasNodeJSEnabled && (contentIterator.getCellType() & ConversionConstant.FORMULA_TYPE_MASK) != 0)
      {
        // is formula, nodejs is disabled, write unknown.
        buffer.writeNumberField(ConversionConstant.CELL_TYPE, (ConversionConstant.CELL_TYPE_UNKNOWN << 3) | contentIterator.getCellType()
            & ConversionConstant.FORMULA_TYPE_MASK);
      }
      else
      {
        buffer.writeNumberField(ConversionConstant.CELL_TYPE, contentIterator.getCellType());
      }
    }
    // cell repeatnum
    int repeat = contentIterator.getCellRepeat();
    if (repeat > 0)
    {
      buffer.writeFieldName(ConversionConstant.REPEATEDNUM);
      buffer.writeNumber(repeat);
    }
    // cell colspan
    if (contentIterator.getCellColSpan() > 1)
    {
      rowNotRepeat = true;
      buffer.writeFieldName(ConversionConstant.COLSPAN);
      buffer.writeNumber(contentIterator.getCellColSpan());
    }
    // cell rowspan
    if(contentIterator.getCellRowSpan() > 1)
    {
      rowNotRepeat = true;
      buffer.writeFieldName(ConversionConstant.ROWSPAN);
      buffer.writeNumber(contentIterator.getCellRowSpan());
    }
    
    // cell iscovered
    if (contentIterator.getCellIsCovered())
    {
      rowNotRepeat = true;
      buffer.writeFieldName(ConversionConstant.ISCOVERED);
      buffer.writeBoolean(true);
    }
    if(hasNodeJSEnabled)
    {
      // formula cell dirty, cv, ec
      if(contentIterator.getCellDirty())
      {
        buffer.writeFieldName(ConversionConstant.CELL_DIRTY);
        buffer.writeBoolean(true);
        //do not need write cv and ec, because it need recalc
      }
      else
      {
        //write cv and ec if has
        Object cv = contentIterator.getCellCalcValue();
        if( cv != null)
        {
          buffer.writeFieldName(ConversionConstant.CALCULATEDVALUE);
          if (cv instanceof String)
          {
            buffer.writeString((String) cv);
          }
          else if (cv instanceof Number)
          {
            if (cv instanceof Float || cv instanceof Double)
            {
              buffer.writeNumber(((Number) cv).doubleValue());
            }
            else
            {
              // v is integer or long
              buffer.writeNumber(((Number) cv).longValue());
            }
          }
        }
//      if(contentIterator.getCellErrCode() != FormulaUtil.ERRORCODE.NONE.getValue())
//      {
//        buffer.writeFieldName(ConversionConstant.FORMULA_ERRORCODE);
//        buffer.writeNumber(contentIterator.getCellErrCode());
//      }
      }
    }
    // cell string index
    if (contentIterator.getCellStringIndex() > 0)
    {
      rowNotRepeat = true;
      buffer.writeFieldName(ConversionConstant.KEY_STRING_INDEX);
      buffer.writeNumber(contentIterator.getCellStringIndex());
    }

    // close cell
    buffer.writeEndObject();
  }

  // write one cell content to draft JSON
  private void writeCellContentToDraft() throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.CONTENT_SHEETS;

    // write cell column id
    jsonWriter.openObject(idConvertor.toSerializableStringId(contentIterator.getCellId()), section);
    // cell style
    if (contentIterator.getCellStyle() != null)
    {
      jsonWriter.writeStyleId(contentIterator.getCellStyle().getSerializedId(idConvertor), section);
    }
    // cell link
    if (contentIterator.getCellLink() != null)
    {
      jsonWriter.writeLink(contentIterator.getCellLink());
    }
    // cell value
    Object v = contentIterator.getCellValue();
    if (v != null)
    {
      if (v instanceof String)
      {
        jsonWriter.writeValue((String) v);
      }
      else if (v instanceof Number)
      {
        if (v instanceof Float || v instanceof Double)
        {
          jsonWriter.writeValue(((Number) v).doubleValue());
        }
        else
        {
          jsonWriter.writeValue(((Number) v).longValue());
        }
      }
    }
    
    // cell type
    if (contentIterator.getCellType() != 0)
    {
      if (!hasNodeJSEnabled && (contentIterator.getCellType() & ConversionConstant.FORMULA_TYPE_MASK) != 0)
      {
        // is formula, nodejs is disabled, write unknown.
        jsonWriter.writeCellType((ConversionConstant.CELL_TYPE_UNKNOWN << 3) | contentIterator.getCellType()
            & ConversionConstant.FORMULA_TYPE_MASK);
      }
      else
      {
        jsonWriter.writeCellType(contentIterator.getCellType());
      }
    }
    
    // cell string index
    if (contentIterator.getCellStringIndex() > 0)
    {
      jsonWriter.writeCellStringIndex(contentIterator.getCellStringIndex());
    }

    // cell repeatnum
    int repeat = contentIterator.getCellRepeat();
    if (repeat > 0)
    {
      jsonWriter.writeRepeatedNum(repeat, section);
    }
    // cell colspan
    if (contentIterator.getCellColSpan() > 1)
    {
      jsonWriter.writeColSpan(contentIterator.getCellColSpan());
    }
    // cell rowspan
    if (contentIterator.getCellRowSpan() > 1)
    {
      jsonWriter.writeRowSpan(contentIterator.getCellRowSpan());
    }
    // cell iscovered
    if (contentIterator.getCellIsCovered())
    {
      jsonWriter.writeIsCovered();
    }
    if(hasNodeJSEnabled)
    {
      // formula cell dirty, cv, ec
      if(contentIterator.getCellDirty())
      {
        jsonWriter.writeCellDirty(true);
        //do not need write cv and ec, because it need recalc
      }
      else
      {
        //write cv and ec if has
        Object cv = contentIterator.getCellCalcValue();
        if( cv != null)
        {
          if (cv instanceof String)
          {
            jsonWriter.writeCalcValue((String)cv);
          }
          else if (cv instanceof Number)
          {
            if (cv instanceof Float || cv instanceof Double)
            {
              jsonWriter.writeCalcValue(((Number)cv).doubleValue());
            }
            else
            {
              // v is integer or long
              jsonWriter.writeCalcValue(((Number) cv).longValue());
            }
          }
        }
//      if(contentIterator.getCellErrCode() != FormulaUtil.ERRORCODE.NONE.getValue())
//      {
//        jsonWriter.writeCellErrorCode(contentIterator.getCellErrCode());
//      }
      }
    }
    // close cell
    jsonWriter.closeObject(section);
  }

  private void writeRowRawContentCells(Sheet sheet) throws JsonGenerationException, IOException
  {
    // serialize from raw data
    IRawDataStorageAdapter rawData = contentIterator.getRowRawContentCells();
    if (LOG.isLoggable(Level.FINEST))
    {
      LOG.log(Level.FINEST, "serialize from raw data for row with id {0}, data: {1}.",
          new Object[] { contentIterator.getRowId(), rawData.toString() });
    }

    actionGenerator.setRootRule(ModelIOFactory.getInstance().getContentSheetRowRule());
    contentCellHandler.rowFormulaCellMap = contentIterator.getRowFormulaCellsMap();
    contentCellHandler.rowId = contentIterator.getRowId();
    
    contentCellHandler.rowCoverInfos = contentIterator.getCoverCells();
    jsonWriter.writeRowRawContentCells(idConvertor.toSerializableStringId(contentIterator.getRowId()), rawData, actionGenerator,
        actionHandlers);
  }

  private void writeSheetRawRows(Sheet sheet) throws IllegalStateException, IOException
  {
    // serialize from sheet raw meta rows
    IRawDataStorageAdapter rawData = sheet.getRawMetaRows();
    if (rawData != null)
    {
      if (LOG.isLoggable(Level.FINEST))
      {
        LOG.log(Level.FINEST, "serialize from raw data for meta rows in sheet with id {0}, data: {1}.", new Object[] { sheet.getId(),
            rawData.toString() });
      }
      actionGenerator.setRootRule(ModelIOFactory.getInstance().getMetaRowRule());
      jsonWriter.writeSheetRawMetaRows(idConvertor.toSerializableStringId(sheet.getId()), rawData, actionGenerator, idHandler);
    }
    // else, no meta rows

    // serialize from sheet content rows
    rawData = sheet.getRawContentRows();
    if (rawData != null)
    {
      if (LOG.isLoggable(Level.FINEST))
      {
        LOG.log(Level.FINEST, "serialize from raw data for content rows in sheet with id {0}, data: {1}.", new Object[] { sheet.getId(),
            rawData.toString() });
      }
      referencesSheetOpened = false;
      contentCellHandler.sheet = sheet;
      actionGenerator.setRootRule(ModelIOFactory.getInstance().getContentSheetRule());
      jsonWriter.writeSheetRawContentRows(idConvertor.toSerializableStringId(sheet.getId()), rawData, actionGenerator, actionHandlers);
      closeReferenceSheet();
    }
    // else, no content rows
  }

  // write a "<sheetId>: {" for meta rows, if previously written, don't write again
  private void openMetaRowsSheet(int sheetId) throws JsonGenerationException, IOException
  {
    if (!metaRowsSheetOpened)
    {
      metaRowsSheetOpened = true;
      jsonWriter.openObject(idConvertor.toSerializableStringId(sheetId), DraftSection.META_ROWS);
    }
  }

  // close a "<sheetId>: {" object for meta rows, if previously not opened, don't close
  private void closeMetaRowsSheet() throws JsonGenerationException, IOException
  {
    if (metaRowsSheetOpened)
    {
      jsonWriter.closeObject(DraftSection.META_ROWS);
    }
  }

  // flush master row properties
  private void writeRowMeta(Sheet sheet) throws JsonGenerationException, IOException
  {
    if (masterRowEmpty)
    {
      // this row has no meta to write, no content written, skip writing its meta
      if (LOG.isLoggable(Level.FINEST))
      {
        LOG.log(Level.FINEST, "row {0} has no content, skip flushing its meta.", masterRowId);
      }

      return;
    }

    // if "<rowId>: {" for meta rows is written
    boolean opened = false;
    DraftSection section = DraftSection.META_ROWS;

    int sheetId = sheet.getId();
    if (masterRowHeight > 0)
    {
      openMetaRowsSheet(sheetId);
      if (!opened)
      {
        jsonWriter.openObject(idConvertor.toSerializableStringId(masterRowId), section);
        opened = true;
      }

      jsonWriter.writeHeight(masterRowHeight);
    }

    if (masterRowVis != null && masterRowVis != Visibility.VISIBLE)
    {
      openMetaRowsSheet(sheetId);
      if (!opened)
      {
        jsonWriter.openObject(idConvertor.toSerializableStringId(masterRowId), section);
        opened = true;
      }

      jsonWriter.writeVisibility(masterRowVis.toString(), DraftSection.META_ROWS);
    }

    if (masterRowRepeat > 0)
    {
      openMetaRowsSheet(sheetId);
      if (!opened)
      {
        jsonWriter.openObject(idConvertor.toSerializableStringId(masterRowId), section);
        opened = true;
      }

      jsonWriter.writeRepeatedNum(masterRowRepeat, DraftSection.META_ROWS);
    }

    if (opened)
    {
      jsonWriter.closeObject(section);
    }
  }

  // write meta.js meta columns for a sheet
  private void writeMetaColumns(Sheet sheet) throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.META_COLUMNS;
    int value;
    StyleObject style;
    Visibility vis;

    if (sheet.getColumns().size() > 0)
    {
      // sheet have columns to write
      jsonWriter.openObject(idConvertor.toSerializableStringId(sheet.getId()), section);

      for (contentIterator.firstColumn(); contentIterator.hasNextColumn();)
      {
        contentIterator.nextColumn();

        if (!contentIterator.isColumnEmpty())
        {
          jsonWriter.openObject(idConvertor.toSerializableStringId(contentIterator.getColumnId()), section);
          // column repeat num
          value = contentIterator.getColumnRepeat();
          if (value > 0)
          {
            jsonWriter.writeRepeatedNum(value, section);
          }
          // column style
          style = contentIterator.getColumnStyle();
          if (style != null)
          {
            jsonWriter.writeStyleId(style.getSerializedId(idConvertor), section);
          }
          // column width
          value = contentIterator.getColumnWidth();
          if (value >= 0)
          {
            jsonWriter.writeWidth(value);
          }
          // column visibility
          vis = contentIterator.getColumnVisibility();
          if (vis != null && vis != Visibility.VISIBLE)
          {
            jsonWriter.writeVisibility(vis.toString(), section);
          }

          jsonWriter.closeObject(section);
        }
        else
        {
          if (LOG.isLoggable(Level.FINER))
          {
            LOG.log(Level.FINER, "Ignore empty column ({0}, {1}), index {2}.",
                new Object[] { sheet.getSheetName(), contentIterator.getColumnId(), contentIterator.getColumnIndex() });
          }
        }
      }

      jsonWriter.closeObject(section);
    }
  }

  // for reference.js, write one "sheetId": {. If previously opened, don't open.
  private void openReferenceSheet(int sheetId) throws JsonGenerationException, IOException
  {
    if (!referencesSheetOpened)
    {
      referencesSheetOpened = true;
      jsonWriter.openObject(idConvertor.toSerializableStringId(sheetId), DraftSection.REFERENCE_SHEETS);
    }
  }

  // for reference.js, close "sheetId": {. If previously not opened, don't close.
  private void closeReferenceSheet() throws JsonGenerationException, IOException
  {
    if (referencesSheetOpened)
    {
      jsonWriter.closeObject(DraftSection.REFERENCE_SHEETS);
    }
  }

  // for reference.js, write one "rowId": {. If previously opened, don't open.
  private void openReferenceRow(int rowId) throws JsonGenerationException, IOException
  {
    if (!referencesRowOpened)
    {
      referencesRowOpened = true;
      if (LOG.isLoggable(Level.FINEST))
      {
        LOG.log(Level.FINEST, "references row {0} opened.", rowId);
      }

      jsonWriter.openObject(idConvertor.toSerializableStringId(rowId), DraftSection.REFERENCE_SHEETS);
    }
  }

  // for reference.js, close "rowId": {. If previously not opened, don't close.
  private void closeReferenceRow() throws JsonGenerationException, IOException
  {
    if (referencesRowOpened)
    {
      if (LOG.isLoggable(Level.FINEST))
      {
        LOG.log(Level.FINEST, "previously opened references row closed.");
      }

      jsonWriter.closeObject(DraftSection.REFERENCE_SHEETS);
    }
  }

  // for reference.js, write refernce defs for a cell.
  private void writeReferences(int cellRowId, int cellColumnId, List<FormulaToken> tokens, int errProps) throws JsonGenerationException, IOException
  {
    if (LOG.isLoggable(Level.FINER))
    {
      LOG.entering(Serializer.class.getName(), "writeReferences", new Object[] { cellRowId, cellColumnId, tokens });
    }

    DraftSection section = DraftSection.REFERENCE_SHEETS;

    // sheet id and row id is already serialized,
    // serialize column id
    jsonWriter.openObject(idConvertor.toSerializableStringId(cellColumnId), section);
    
    // write "ep"
    if(hasNodeJSEnabled && errProps != FormulaUtil.FormulaErrProperty.NONE.getValue())
      jsonWriter.writeFormulaErrProps(errProps);
    // serialize "cells"
    jsonWriter.openArray(ConversionConstant.CELLS, section);
    int invalidTokenCount = 0;
    for (Iterator<FormulaToken> iterator = tokens.iterator(); iterator.hasNext();)
    {
      FormulaToken token = iterator.next();
      switch (token.getType())
        {
          case NAME :
            // "name" reference
            jsonWriter.openObject(section);
            jsonWriter.writeReferenceType(ConversionConstant.NAME_RANGE);
//            ReferenceToken rt = (ReferenceToken)token;
//            Area area = rt.getArea();
//            String name = null;
//            if (area == null)
//              name = token.getText();// the undefined name range
//            else
//              name = area.getName();
            jsonWriter.writeReferenceNames(token.getText());
            // serialize "index"
            jsonWriter.writeReferenceIndex(token.getIndex());
            jsonWriter.closeObject(section);
            break;
          case RANGE :
            // regular reference
            if (token.isValid() || bRecover)
            {
              // serialize "{"
              jsonWriter.openObject(section);
              ReferenceToken rt = (ReferenceToken)token;
              Area a = rt.getArea();
              int sheetId = a.getSheetId();
              if(bRecover)
              {
                // for recover doc serialize, even it is the invalid reference, it still need export
                // because it might refer to the sheet in the main doc
                if(mainDoc.getSheetById(sheetId) != null)
                {
                  jsonWriter.writeReferenceType(ConversionConstant.RECOVER_REFERENCE);
                  
                  String id = a.getSerializedId(mainDoc.getIdConvertor()).toString();
                  // get recover unname range which id is the serialiable id for area
                  // if not exist create a new unnamed range in main doc
                  if(mainDoc.getRangeList().getRangeByUsage(id, RangeUsage.RECOVER_REFERENCE) == null)
                  {
                    Range<String> recoverRange = new Range(mainDoc, token.getText(), null, true);
                    recoverRange.setId(id);
                    recoverRange.setUsage(RangeUsage.RECOVER_REFERENCE);
                    mainDoc.getRangeList().addRange(recoverRange);
                  }
                  jsonWriter.writeReferenceNames(id);
                  mainDoc.getIdConvertor().cacheStrId(id);
                }//else here notice that if the reference is in recover doc when serialize recover doc
                //it will not export reference start/end row/column id because it does not necessary for partialDeserializer
              }else
              {
                // serialize "sheetid"
                jsonWriter.writeSheetId(idConvertor.toSerializableStringId(sheetId), section);
                int startRowId = document.getIDManager().getRowIdByIndex(sheetId, a.getStartRow(), true, true);
                int startColId = document.getIDManager().getColIdByIndex(sheetId, a.getStartCol(), true);
                int endRowId = document.getIDManager().getRowIdByIndex(sheetId, a.getEndRow(), true, true);
                int endColId = document.getIDManager().getColIdByIndex(sheetId, a.getEndCol(), true);
                if (endRowId == IDManager.INVALID || endColId == IDManager.INVALID)
                {
                  // "cell" typed reference
                  jsonWriter.writeReferenceType(ConversionConstant.REF_TYPE_CELL);
                  jsonWriter.writeReferenceRowId(idConvertor.toSerializableStringId(startRowId));
                  jsonWriter.writeReferenceColumnId(idConvertor.toSerializableStringId(startColId));
                }
                else
                {
                  // "range" typed reference
                  jsonWriter.writeReferenceType(ConversionConstant.REF_TYPE_RANGE);
                  jsonWriter.writeStartRowId(idConvertor.toSerializableStringId(startRowId), section);
                  jsonWriter.writeEndRowId(idConvertor.toSerializableStringId(endRowId), section);
                  jsonWriter.writeStartColumnId(idConvertor.toSerializableStringId(startColId), section);
                  jsonWriter.writeEndColumnId(idConvertor.toSerializableStringId(endColId), section);
                }
              }
              //TODO: here token.text must be udpated because formulaCell.updateFormula must be called previously
              jsonWriter.writeAddress(token.getText(), section);
              // serialize "index"
              jsonWriter.writeReferenceIndex(token.getIndex());
              jsonWriter.closeObject(section);
            }
            else
            {
              if (LOG.isLoggable(Level.FINE))
              {
                LOG.log(Level.FINE, "Ignore a reference that has invalid addr. Addr: {0}, id: ({1}, {2}).", new Object[] { token.getText(),
                    cellRowId, cellColumnId });
              }
              invalidTokenCount++;
            }
            break;
          case VREF :
            if (token.isValid())
            {
              VirtualFormulaToken vt = (VirtualFormulaToken) token;
              FormulaToken lt = vt.getLeftToken();
              FormulaToken rt = vt.getRightToken();
              int leftIndex = tokens.indexOf(lt) - invalidTokenCount;
              int rightIndex = tokens.indexOf(rt) - invalidTokenCount;
              if (leftIndex >= 0 && rightIndex >= 0)
              {
                // serialize "{"
                jsonWriter.openObject(section);
                jsonWriter.writeReferenceType(ConversionConstant.VIRTUAL_REFERENCE);
                jsonWriter.writeReferenceIndex(-1);
                jsonWriter.writeReferenceLeftIndex(leftIndex);
                jsonWriter.writeReferenceRightIndex(rightIndex);
                // serialize "}"
                jsonWriter.closeObject(section);
              }
              else
              {
                LOG.log(Level.WARNING, "A virtual reference has left or right indexes that <0. indexes: ({0}, {1}), id: ({2}, {3}).",
                    new Object[] { leftIndex, rightIndex, cellRowId, cellColumnId });
                invalidTokenCount++;
              }
            }
            else
            {
              if (LOG.isLoggable(Level.FINE))
              {
                LOG.log(Level.FINE, "Ignore a virtual reference that has #REF!. id: ({0}, {1}).", new Object[] { cellRowId, cellColumnId });
                invalidTokenCount++;
              }
            }
            break;
          case RECREF :
            // recover reference serialize
            // it means recover doc has been deserialized but not recovered
            if(bRecover)
            {
              jsonWriter.openObject(section);
              jsonWriter.writeReferenceType(ConversionConstant.RECOVER_REFERENCE);
              // sync with ReferenceHandler when deserializer
              RecoverReferenceToken rrToken = (RecoverReferenceToken)token;
              String refName = rrToken.getRefName();
              mainDoc.getIdConvertor().cacheStrId(refName);
              String refValue = rrToken.getRefValue();
              jsonWriter.writeReferenceNames(refName);
              jsonWriter.writeAddress(refValue, section);
              // serialize "index"
              jsonWriter.writeReferenceIndex(rrToken.getIndex());
              jsonWriter.closeObject(section);
            }
            break;
          default:
            // never here
            break;
        }
    }

    jsonWriter.closeArray(section);
    jsonWriter.closeObject(section);

    if (LOG.isLoggable(Level.FINER))
    {
      LOG.exiting(Serializer.class.getName(), "writeReferences");
    }
  }

  // for preserve.js and content.js, write "pnames" def
  private void writePreserveRanges(final DraftSection section) throws JsonGenerationException, IOException
  {
    PreserveManager manager = document.getPreserveManager();
    PreserveRangeList rangeList = manager.getRangeList();
    Map<String, List<Range<String>>> ranges = rangeList.getPreserveRangesById();
    if (ranges.isEmpty())
    {
      // no preserve ranges,
      return;
    }

    jsonWriter.openDraftSection(section, false);

    ModelHelper.iterateMap(ranges, new IMapEntryListener<String, List<Range<String>>>()
    {
      public boolean onEntry(String key, List<Range<String>> value)
      {
        try
        {
          // key is nX part of the preserve range, if it is for preserve.js, serialize it, otherwise ignore it
          if (section == DraftSection.PRESERVE_PNAMES)
          {
            jsonWriter.openObject(key, section);
          }

          for (Iterator<Range<String>> iterator = value.iterator(); iterator.hasNext();)
          {
            Range<String> range = iterator.next();
            if (preCheckRange(range))
            {
              jsonWriter.openObject(range.getId(), section);
              writeRange(range, section);
              jsonWriter.closeObject(section);
            }
          }

          if (section == DraftSection.PRESERVE_PNAMES)
          {
            jsonWriter.closeObject(section);
          }
        }
        catch (Exception e)
        {
          throw new RuntimeException(e);
        }

        return false;
      }
    });

    jsonWriter.closeDraftSection(section);
  }

  // write preserve.js style, value, maxrow
  private void writePreserveOthers() throws JsonGenerationException, IOException
  {
    PreserveManager manager = document.getPreserveManager();
    PreserveStyleRangeList styleRanges = manager.getStyleRangeList();
    Map<Integer, RangesStruct<Integer>> rangeMap = styleRanges.getBySheetIdRangeMap();
    if (rangeMap != null && !rangeMap.isEmpty())
    {
      jsonWriter.openDraftSection(DraftSection.PRESERVE_STYLE, false);
      ModelHelper.iterateMap(rangeMap, new IMapEntryListener<Integer, RangesStruct<Integer>>()
      {
        public boolean onEntry(Integer sheetId, RangesStruct<Integer> ranges)
        {
          try
          {
            jsonWriter.openObject(idConvertor.toSerializableStringId(sheetId), DraftSection.PRESERVE_STYLE);
            RangeMap<Integer> rangeMap = ranges.getRangeMap();
            ModelHelper.iterateMap(rangeMap, new RangeIterator<Integer>()
            {
              public boolean onEntry(Integer rangeId, Range<Integer> value)
              {
                RangeInfo ri = value.getRangeInfo();
                try
                {
                  if (ri.getEndRow() == IDManager.INVALID && ri.getEndCol() == IDManager.INVALID)
                  {
                    // only start rows
                    if (ri.getStartRow() == IDManager.INVALID && ri.getStartCol() == IDManager.INVALID)
                    {
                      // error
                      LOG.log(Level.WARNING, "Preserve style range {0}, all index are INVALID. Don't serialize.", rangeId);
                      return false;
                    }
                    jsonWriter.openObject(idConvertor.toStringId(rangeId), DraftSection.PRESERVE_STYLE);
                    jsonWriter.writeStartRowIndex(ri.getStartRow());
                    jsonWriter.writeStartColumnIndex(ri.getStartCol());
                    jsonWriter.closeObject(DraftSection.PRESERVE_STYLE);

                    return false;
                  }
                  jsonWriter.openObject(idConvertor.toStringId(rangeId), DraftSection.PRESERVE_STYLE);
                  if (ri.getStartRow() != IDManager.INVALID)
                    jsonWriter.writeStartRowIndex(ri.getStartRow());
                  if (ri.getStartCol() != IDManager.INVALID)
                    jsonWriter.writeStartColumnIndex(ri.getStartCol());
                  if (ri.getEndRow() != IDManager.INVALID)
                    jsonWriter.writeEndRowIndex(ri.getEndRow());
                  if (ri.getEndCol() != IDManager.INVALID)
                    jsonWriter.writeEndColumnIndex(ri.getEndCol());
                  jsonWriter.closeObject(DraftSection.PRESERVE_STYLE);
                  return false;
                }
                catch (Exception e)
                {
                  throw new RuntimeException(e);
                }
              }
            });

            jsonWriter.closeObject(DraftSection.PRESERVE_STYLE);
          }
          catch (Exception e)
          {
            throw new RuntimeException();
          }
          return false;
        }
      });
      jsonWriter.closeDraftSection(DraftSection.PRESERVE_STYLE);
    }

    PreserveValueCellSet set = manager.getValueCellSet();
    Map<Integer, Map<Integer, Map<Integer, Integer>>> valueCellSet = set.getValueCellSet();
    if (valueCellSet != null && !valueCellSet.isEmpty())
    {
      jsonWriter.openDraftSection(DraftSection.PRESERVE_VALUE, false);
      ModelHelper.iterateMap(valueCellSet, new ModelHelper.IMapEntryListener<Integer, Map<Integer, Map<Integer, Integer>>>()
      {
        public boolean onEntry(Integer sheetId, Map<Integer, Map<Integer, Integer>> value)
        {
          try
          {
            jsonWriter.openObject(idConvertor.toSerializableStringId(sheetId), DraftSection.PRESERVE_VALUE);

            ModelHelper.iterateMap(value, new IMapEntryListener<Integer, Map<Integer, Integer>>()
            {
              public boolean onEntry(Integer rowId, Map<Integer, Integer> columnIdMap)
              {
                try
                {
                  jsonWriter.openObject(idConvertor.toSerializableStringId(rowId), DraftSection.PRESERVE_VALUE);
                  Set<Integer> columnIdSet = columnIdMap.keySet();
                  for (Iterator<Integer> iterator = columnIdSet.iterator(); iterator.hasNext();)
                  {
                    Integer id = iterator.next();
                    Integer value = columnIdMap.get(id);
                    jsonWriter.writePreserveValue(idConvertor.toSerializableStringId(id), value);
                  }
                  jsonWriter.closeObject(DraftSection.PRESERVE_VALUE);
                }
                catch (Exception e)
                {
                  throw new RuntimeException(e);
                }

                return false;
              }
            });

            jsonWriter.closeObject(DraftSection.PRESERVE_VALUE);
          }
          catch (Exception e)
          {
            throw new RuntimeException(e);
          }

          return false;
        }
      });
      jsonWriter.closeDraftSection(DraftSection.PRESERVE_VALUE);
    }

    Map<Integer, Integer> maxRowMap = manager.getMaxRowMap();
    if (maxRowMap != null && !maxRowMap.isEmpty())
    {
      jsonWriter.openDraftSection(DraftSection.PRESERVE_MAXROW, false);
      ModelHelper.iterateMap(maxRowMap, new IMapEntryListener<Integer, Integer>()
      {
        public boolean onEntry(Integer sheetId, Integer value)
        {
          try
          {
            jsonWriter.writePreserveMaxRow(idConvertor.toSerializableStringId(sheetId), value);
          }
          catch (Exception e)
          {
            throw new RuntimeException(e);
          }

          return false;
        }
      });

      jsonWriter.closeDraftSection(DraftSection.PRESERVE_MAXROW);
    }
  }

  // last thing to write, for meta.js, the id array
  private void writeIdArray() throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.META_SHEETSARRAY;
    jsonWriter.openDraftSection(section, false);

    List<Sheet> sheets = document.getSheets();
    for (Iterator<Sheet> iterator = sheets.iterator(); iterator.hasNext();)
    {
      Sheet sheet = (Sheet) iterator.next();
      IDStruct idStruct = sheet.getIdStruct();
      jsonWriter.openObject(idConvertor.toSerializableStringId(sheet.getId()), section);
      jsonWriter.openArray(ConversionConstant.ROWSIDARRAY, section);
      writeIdList(idStruct.rowIdList);
      jsonWriter.closeArray(section);
      jsonWriter.openArray(ConversionConstant.COLUMNSIDARRAY, section);
      writeIdList(idStruct.columnIdList);
      jsonWriter.closeArray(section);
      jsonWriter.closeObject(section);
    }

    jsonWriter.closeDraftSection(section);
  }

  // write one ID list. Only IDs that are converted before in idConvertor is serialized.
  private void writeIdList(List<Integer> idList) throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.META_SHEETSARRAY;
    int emptyCount = 0;

    for (Iterator<Integer> iterator = idList.iterator(); iterator.hasNext();)
    {
      Integer id = iterator.next();
      // original id should also be kept even it does not used in model
      // because it might used by odf draft file for preserve info
      if (id == null || !(idConvertor.isIDUsed(id) || ModelHelper.isOriginalId(id)))
      {
        emptyCount++;
      }
      else
      {
        if (emptyCount > 0)
        {
          // write (emptyCount) empty strings
          for (; emptyCount > 0; emptyCount--)
          {
            jsonWriter.writeId(SER_STR_EMPTY, section);
          }
        }
        jsonWriter.writeId(idConvertor.toSerializableStringId(id), section);
      }
    }
  }

  private void writeCharts() throws IOException
  {
    List<ChartDocument> charts = document.getCharts();
    for (int i = 0; i < charts.size(); i++)
    {
      ChartDocument chart = charts.get(i);
      JSONObject json = chart.toJson();
      json.serialize(this.outStreams[i + 1 + draftFildCnt]);
    }
  }
  
  private void writeComments()throws IOException
  {
	  Map<String, Comments> comments = document.getComments();
	  Set<Entry<String, Comments>>  set = comments.entrySet();
	  JSONArray content = new JSONArray();
	  for (Iterator<Entry<String, Comments>> iterator = set.iterator(); iterator.hasNext();)
      {
		  Entry<String, Comments> entry = iterator.next();
		  Comments commentsObj = entry.getValue();
		  JSONObject commentsJson =  commentsObj.toJson();
		  content.add(commentsJson);
	  }
	  content.serialize(this.outStreams[draftFildCnt]);
  }

  // pre-check a range, if the address contains #REF!, return false
  private boolean preCheckRange(Range r)
  {
    rangeAddress = r.getAddress();
    if (rangeAddress.contains(ConversionConstant.INVALID_REF))
    {
      switch (r.getUsage())
        {
          case ANCHOR :
            // LOG warning and don't serialize
            LOG.log(Level.WARNING, "ANCHOR range id {0} contains #REF! address {1}, ", new Object[] { r.getId(), rangeAddress });
            return false;
          case FILTER :
          case STYLE :
          case COMMENT :
          case TASK :
            // case DELETE :
          case COPY :
          case INHERIT :
            // LOG FINE and don't serialize
            if (LOG.isLoggable(Level.FINE))
            {
              LOG.log(Level.FINE, "Range ID {0} contains #REF! address {1}, don't serialize.", new Object[] { r.getId(), rangeAddress });
            }

            return false;
          case IMAGE:
          case SHAPE:
          case CHART:
          case ACCESS_PERMISSION:
        	  if(!isClosed || r.getRangeInfo().isValid())
        		  return true;
        	  return false;
          default:
            // others, serialize as-is
            return true;
        }
    }

    if (r.getUsage() == RangeUsage.RECOVER_REFERENCE && !idConvertor.isIDUsed((String) r.getId()))
      // only serialize the used recover reference in unname range
      return false;
    return true;
  }

  // handlers to process content cells,
  // 1) add "d" for dirty cells
  // 2) remove "cv" for dirty cells
  // 3) add "t" if cells is not typed yet
  
  private class ContentCellHandler extends DefaultDraftActionHandler
  {
    public Map<Integer, FormulaCell> rowFormulaCellMap;

    public Map<Integer, CoverInfo> rowCoverInfos;
    
    public Sheet sheet;

    public int rowId, columnId;

    private FormulaCell formulaCell;
    
    private Object value, calcValue;
    
    private String styleId;
    
    private CoverInfo coverInfo;
    
    public void onAction(List<String> fieldPath, Actions action, JsonParser jp) throws JsonParseException, IOException
    {
      int size;
      String id;

      switch (action)
        {
          case CONTENT_SHEET_ROW :
            // can't be here if LOAD_MODE is not ROWS_AS_STREAM
            if (sheet != null && sheet.getFormulaCellsMap() != null)
            {
              size = fieldPath.size() - 1;
              id = fieldPath.get(size);
              rowId = ModelHelper.toNumberId(id);
              rowFormulaCellMap = sheet.getFormulaCellsMap().get(rowId);
            }
            else
            {
              // either sheet is null, or sheet formulaCellsMap is null
              rowFormulaCellMap = null;
            }
            referencesRowOpened = false;
            break;
          case CONTENT_SHEET_ROW_CELL :
            if (rowFormulaCellMap == null && sheet != null && sheet.getFormulaCellsMap() != null)
            {
              rowFormulaCellMap = sheet.getFormulaCellsMap().get(rowId);
            }
            if (rowFormulaCellMap != null)
            {
              size = fieldPath.size() - 1;
              // last element in fieldPath is column id
              id = fieldPath.get(size);
              columnId = ModelHelper.toNumberId(id);
              formulaCell = rowFormulaCellMap.get(columnId);
              
              if (formulaCell != null)
              {
                if (formulaCell.isDirty())
                {
                  // remove cv for dirty cell
                  ((ModifiableJsonParser) jp).localRemove(ConversionConstant.CALCULATEDVALUE);
                }
              }
            }
            else
            {
              // no formulas in this row
              formulaCell = null;
            }
            
            if(rowCoverInfos != null)
            {
              size = fieldPath.size() - 1;
              // last element in fieldPath is column id
              id = fieldPath.get(size);
              columnId = ModelHelper.toNumberId(id);
              coverInfo = rowCoverInfos.get(columnId);
            }
            else
              coverInfo = null;
            
            // remove "d" for the cell, if it is dirty, we will write a new one in the end
            ((ModifiableJsonParser) jp).localRemove(ConversionConstant.CELL_DIRTY);
            
            // remove "cs" & "rs" for the cell if it has already been split
            // if coverInfo is not null, the updated value will be write later
            if(coverInfo == null)
            {
              ((ModifiableJsonParser) jp).localRemove(ConversionConstant.COLSPAN);
              ((ModifiableJsonParser) jp).localRemove(ConversionConstant.ROWSPAN);
            }
            value = null;
            calcValue = null;
            styleId = null;
            
            break;
          case CONTENT_SHEET_ROW_CELL_PROPS :
            size = fieldPath.size() - 1;
            String fieldName = fieldPath.get(size);
            
            if (ConversionConstant.VALUE.equals(fieldName))
            {
              value = ((ModifiableJsonParser) jp).getValueAsObject();
              boolean isFormula = false;
              
              if (formulaCell != null)
              {
                if (value != null && ModelHelper.isFormula((String) value))
                {
                  isFormula = true;
                  
                  if (formulaCell.isUpdateFormula())
                  {
                    String newValue = FormulaUtil.updateFormula((String) value, formulaCell.getTokenList());
                    if (!value.equals(newValue))
                    {
                      // formula changed, write back to jp
                      ((ModifiableJsonParser) jp).modifyValue(newValue);
                      value = newValue;
                    }
                  }
                  if (SpreadsheetConfig.useReferenceJS())
                  { // check if enable reference.js usage
                    // else, no need to update formula
                    // write references
                    if (formulaCell.getTokenList() != null && (formulaCell.getTokenList().size() > 0 || formulaCell.isDirty()))
                    {
                      openReferenceSheet(sheet.getId());
                      openReferenceRow(rowId);
                      writeReferences(rowId, columnId, formulaCell.getTokenList(), formulaCell.getErrProps());
                    }
                    // else, no references to write
                  }
                }
                // else, cell is not formula
              }
              // else, no formulaCell object for this cell
              
              if (!isFormula)
              {
                if (!document.getVersion().hasFeature(DocumentFeature.TYPED_CELL))
                {
                  // update value according to type accordingly,
                  // only guess type from this value, this result can't be worse,
                  // if cell type is already determined to be boolean due to style, the value is already
                  // fixed to be number, fix will not change it
                  // only fix value for document prior to 1.
                  value = CommonUtils.fixValueByType(value, CommonUtils.getCellType(value, null, false));
                  ((ModifiableJsonParser) jp).modifyValue(value);
                }
              }
            }
            else if (ConversionConstant.CELL_TYPE.equals(fieldName))
            {
              // for cell type in stream, re-write it to formula-unknown if formula cell is dirty, or NodeJS is disabled
              if (formulaCell != null && (formulaCell.isDirty() || !hasNodeJSEnabled))
              {
                // current cell is dirty formula cell
                ((ModifiableJsonParser) jp).modifyValue((ConversionConstant.CELL_TYPE_UNKNOWN << 3) | ConversionConstant.FORMULA_TYPE_NORMAL);
              }
              // stop copying any more "t"'s in this object
              ((ModifiableJsonParser) jp).localRemove(ConversionConstant.CELL_TYPE);
            }
            else if (ConversionConstant.CALCULATEDVALUE.equals(fieldName))
            {
              if (formulaCell == null || !formulaCell.isDirty())
              {
                if (!document.getVersion().hasFeature(DocumentFeature.TYPED_CELL))
                {
                  // only update cell type before version 1.02
                  
                  // only accept calc value when cell is not dirty,
                  // should not need dirty check since cv is removed before entering cell props
                  calcValue = ((ModifiableJsonParser) jp).getValueAsObject();
                  // update calcvalue, refer to value part for more details
                  // update but don't parse numeric string calcvalue to number 
                  calcValue = CommonUtils.fixValueByType(calcValue, CommonUtils.getCellType(calcValue, null, false, true));
                  ((ModifiableJsonParser) jp).modifyValue(calcValue);
                }
              }
            }
            else if (ConversionConstant.STYLEID.equals(fieldName))
            {
              styleId = jp.getText();
            }
            else if (ConversionConstant.COLSPAN.equals(fieldName))
            {
              if (coverInfo != null)
              {
                ((ModifiableJsonParser) jp).modifyValue(coverInfo.getColSpan());
              } 
            }
            else if (ConversionConstant.ROWSPAN.equals(fieldName))
            {
              if (coverInfo != null)
              {
                ((ModifiableJsonParser) jp).modifyValue(coverInfo.getRowSpan());
              }
            }
            // else, other cell props
            
            break;
        }
    }

    @Override
    public void postAction(List<String> fieldPath, Actions action, JsonParser jp)
    {
      switch (ModelIOFactory.LOAD_MODE)
        {
          case ROWS_AS_STREAM :
            switch (action)
              {
                case CONTENT_SHEET_ROW :
                  // only need to close reference row here if in ROWS_AS_STREAM mode, since for CELLS_AS_STREAM mode, this postAction
                  // still enters.
                  try
                  {
                    closeReferenceRow();
                  }
                  catch (Exception e)
                  {
                    throw new RuntimeException(e);
                  }
                  break;
                default:
                  break;
              }
            break;
          case CELLS_AS_STREAM :
            switch (action)
              {
                case CONTENT_SHEET_ROW_CELL :
                  if (!document.getVersion().hasFeature(DocumentFeature.TYPED_CELL))
                  {
                    // if no cell type attached before, compute cell type
                    if (formulaCell != null && formulaCell.isDirty())
                    {
                      calcValue = null;
                    }
                    boolean isFormatBoolean = false;
                    if (styleId != null && styleId.indexOf("default") == -1 && styleId.indexOf("Default") == -1)
                    {
                      // not any of the default styles
                      int numberId = ModelHelper.stripIdType(styleId);
                      StyleObject so = null;
                      if (numberId < styleList.size())
                      {
                        so = styleList.get(numberId);
                        if (so != null)
                        {
                          isFormatBoolean = ConversionConstant.BOOLEAN_TYPE.equals(so.getAttribute(ConversionConstant.FORMATCATEGORY));
                        }
                      }
                    }
                    // else, no boolean type
                    int cellType = CommonUtils.getCellType(value, calcValue, isFormatBoolean);
                    if (cellType != 0)
                    {
                      ((ModifiableJsonParser) jp).insertField(ConversionConstant.CELL_TYPE, cellType);
                    }
                  }

                  if (formulaCell != null && formulaCell.isDirty())
                  {
                    ((ModifiableJsonParser) jp).insertField(ConversionConstant.CELL_DIRTY, true);
                  }
                  break;
                default:
                  break;

              }
            break;
          default:
            break;

        }
    }
  }

  // handlers to notice every style serialized and mark style id
  private class StyleIdHandler extends DefaultDraftActionHandler
  {
    public void onAction(List<String> fieldPath, Actions action, JsonParser jp) throws JsonParseException, IOException
    {
      if (action == Actions.CONTENT_SHEET_ROW_CELL_PROPS)
      {
        if (fieldPath.get(fieldPath.size() - 1).equals(ConversionConstant.STYLEID))
        {
          String sid = jp.getText();
          if (!sid.equals(ConversionConstant.DEFAULT_CELL_STYLE) && !sid.equals(ConversionConstant.DEFAULT_CELL_STYLE_NAME))
          {
            int numberId = ModelHelper.stripIdType(sid);
            // get the style loaded from original draft
            StyleObject so;
            if (styleList.size() > numberId)
            {
              so = styleList.get(numberId);
            }
            else
            {
              so = null;
            }

            if (so == null)
            {
              LOG.log(Level.WARNING, "can't find StyleObject for style id {0}.", sid);
            }
            else
            {
              SerializableString serId = so.getSerializedId(idConvertor);
              ((ModifiableJsonParser) jp).modifyValue(serId.getValue());
            }
          }
          // else, do nothing for dcs
        }
      }
    }
  }

  private class IdHandler extends DefaultDraftActionHandler
  {
    @Override
    public void onFieldName(Actions action, JsonParser jp) throws JsonParseException, IOException
    {
      switch (action)
        {
          case CONTENT_SHEET_ROW :
            // to catch sheet content row id
          case CONTENT_SHEET_ROW_CELL :
            // to catch sheet content cell column id
          case META_ROW_SHEET :
            // to catch meta row id
            String id = jp.getText();
            int numberId = ModelHelper.toNumberId(id);
            SerializableString serId = idConvertor.toSerializableStringId(numberId);
            ((ModifiableJsonParser) jp).modifyValue(serId.getValue());
            break;
          default:
            break;
        }
    }
  }

  private abstract class DefaultDraftActionHandler implements IDraftActionHandler
  {
    public void onAction(List<String> fieldPath, Actions action, JsonParser jp) throws JsonParseException, IOException
    {
      ;
    }

    public void postAction(List<String> fieldPath, Actions action, JsonParser jp)
    {
      ;
    }

    public void onFieldName(Actions action, JsonParser jp) throws JsonParseException, IOException
    {
      ;
    }
  }

  public void setNodeJSEnabled(boolean enabled)
  {
    hasNodeJSEnabled = enabled;
  }
}
