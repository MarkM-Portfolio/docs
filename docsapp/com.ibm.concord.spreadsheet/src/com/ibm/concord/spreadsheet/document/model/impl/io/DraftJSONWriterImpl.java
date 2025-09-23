package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.SerializableString;
import org.codehaus.jackson.util.TokenBuffer;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.impl.io.swap.IRawDataStorageAdapter;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.partialload.serialize.impl.SerializationUtils;
import com.ibm.json.java.JSONObject;

public class DraftJSONWriterImpl implements IDraftJSONWriter, IDraftRawDataWriter
{
  private static final Logger LOG = Logger.getLogger(DraftJSONWriterImpl.class.getName());

  // if need to reserve cv in streams
  private boolean RESERVE_CV;

  private JsonGenerator[] jgs;

  // for every JsonGenerator, that is not buffered, which section is it writing to
  private DraftSection[] inSections;

  // previously selected JsonGenerator index in jgs array, -1 if it is a buffer
  private int selected;

  private boolean opened;

  private boolean closed;

  private Set<DraftSection> openedDraftSections;

  private Set<DraftSection> closedDraftSections;

  private Map<DraftSection, TokenBuffer> buffers;

  private DataJSONObjectListener dataListener;

  private JsonFactory jsonFactory;

  public DraftJSONWriterImpl(JsonFactory jf)
  {
    openedDraftSections = new HashSet<DraftSection>();
    closedDraftSections = new HashSet<DraftSection>();
    buffers = new HashMap<DraftSection, TokenBuffer>();
    opened = false;
    closed = false;

    dataListener = new DataJSONObjectListener();
    jsonFactory = jf;
  }

  public void setJsonGenerators(JsonGenerator... jgs)
  {
    if (opened)
    {
      throw new IllegalStateException("already called setJsonGenerators().");
    }
    this.jgs = jgs;
    inSections = new DraftSection[jgs.length];
    opened = true;
  }

  public boolean isDraftSectionOpened(DraftSection section)
  {
    return openedDraftSections.contains(section);
  }

  public boolean isDraftSectionClosed(DraftSection section)
  {
    return closedDraftSections.contains(section);
  }

  public boolean isDraftSectionBuffered(DraftSection section)
  {
    return (buffers.containsKey(section));
  }

  public void openDraftSection(DraftSection section, boolean useBuffer) throws JsonGenerationException, IOException
  {
    assertSectionNew(section);
    JsonGenerator jg = null;
    if (useBuffer)
    {
      jg = new TokenBuffer(null);
      buffers.put(section, (TokenBuffer) jg);
    }
    else
    {
      jg = selectJsonGenerator(section, false, false);
      assertInSection(null);
      inSections[selected] = section;
    }
    jg.writeFieldName(section.toString());
    if (section == DraftSection.META_SHEETSIDARRAY)
    {
      jg.writeStartArray();
    }
    else
    {
      jg.writeStartObject();
    }
    openedDraftSections.add(section);
  }

  public void closeDraftSection(DraftSection section) throws JsonGenerationException, IOException
  {
    assertSectionOpened(section);
    JsonGenerator jg = selectJsonGenerator(section);
    if (section == DraftSection.META_SHEETSIDARRAY)
    {
      jg.writeEndArray();
    }
    else
    {
      jg.writeEndObject();
    }
    openedDraftSections.remove(section);
    if (!(jg instanceof TokenBuffer))
    {
      // this token is not buffered
      closedDraftSections.add(section);
      inSections[selected] = null;
    }
  }

  public JsonParser getBufferedDraftSectionAsParser(DraftSection section)
  {
    TokenBuffer buf = buffers.get(section);
    if (buf != null)
    {
      return buf.asParser();
    }
    else
    {
      return null;
    }
  }

  public void flushBufferedDraftSection(DraftSection section) throws JsonGenerationException, IOException
  {
    JsonParser bufParser = getBufferedDraftSectionAsParser(section);
    if (bufParser != null)
    {
      // need to select the unbuffered JsonGenerator
      JsonGenerator jg = selectJsonGenerator(section, false, false);
      assertSectionNew(section);
      assertInSection(null);
      bufParser.nextToken();
      jg.copyCurrentStructure(bufParser);
      closedDraftSections.add(section);
    }
    else
    {
      LOG.log(Level.WARNING, "No buffer for section {0}.", section);
    }
  }

  public void close() throws JsonGenerationException, IOException
  {
    if (closed)
    {
      return;
    }

    if (openedDraftSections.contains(DraftSection.META_ROOT))
    {
      jgs[META].writeEndObject();
    }
    if (openedDraftSections.contains(DraftSection.CONTENT_ROOT))
    {
      jgs[CONTENT].writeEndObject();
    }
    if (openedDraftSections.contains(DraftSection.REFERENCE_ROOT))
    {
      jgs[REFERENCE].writeEndObject();
    }
    if (openedDraftSections.contains(DraftSection.PRESERVE_ROOT))
    {
      jgs[PRESERVE].writeEndObject();
    }
    for (int i = 0; i < jgs.length; i++)
    {
      try
      {
        if (jgs[i] != null)
        {
          jgs[i].flush();
          jgs[i].close();
        }
      }
      catch (IOException e)
      {
        // close silently
        LOG.log(Level.WARNING, "Failed to close JsonGenerator, ", e);
      }
    }
    closed = true;
  }

  public void writeVisibility(String vis, DraftSection section) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(section).writeStringField(ConversionConstant.VISIBILITY, vis);
  }

  public void writeRepeatedNum(int rn, DraftSection section) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(section).writeNumberField(ConversionConstant.REPEATEDNUM, rn);
  }

  public void writeStyleId(SerializableString styleId, DraftSection section) throws JsonGenerationException, IOException
  {
    JsonGenerator jg = selectJsonGenerator(section);
    jg.writeFieldName(ConversionConstant.STYLEID);
    jg.writeString(styleId);
  }

  public void openObject(String fieldName, DraftSection section) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(section).writeObjectFieldStart(fieldName);
  }

  public void openObject(SerializableString fieldName, DraftSection section) throws JsonGenerationException, IOException
  {
    JsonGenerator jg = selectJsonGenerator(section);
    jg.writeFieldName(fieldName);
    jg.writeStartObject();
  }

  public void openObject(DraftSection section) throws JsonGenerationException, IOException
  {
    JsonGenerator jg = selectJsonGenerator(section);
    jg.writeStartObject();
  }

  public void openArray(String fieldName, DraftSection section) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(section).writeArrayFieldStart(fieldName);
  }

  public void closeObject(DraftSection section) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(section).writeEndObject();
  }

  public void closeArray(DraftSection section) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(section).writeEndArray();
  }

  public void writeVersion(String ver) throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.META_VERSION;
    assertSectionNew(section);
    JsonGenerator jg = selectJsonGenerator(section, false, false);
    jg.writeStringField(ConversionConstant.FILE_VERSION_FIELD, ver);
    closedDraftSections.add(section);
  }

  public void writeCSV(boolean csv) throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.META_CSV;
    assertSectionNew(section);
    JsonGenerator jg = selectJsonGenerator(section, false, false);
    jg.writeBooleanField(/* add constant */ConversionConstant.CSV_FLAG, csv);
    closedDraftSections.add(section);
  }

  public void writeDate1904() throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.META_DATE1904;
    assertSectionNew(section);
    JsonGenerator jg = selectJsonGenerator(section, false, false);
    jg.writeBooleanField(ConversionConstant.DATE1904, true);
    closedDraftSections.add(section);
  }

  public void writeLocale(String locale) throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.META_LOCALE;
    assertSectionNew(section);
    JsonGenerator jg = selectJsonGenerator(section, false, false);
    jg.writeStringField(ConversionConstant.LOCALE, locale);
    closedDraftSections.add(section);
  }

  public void writeDefaultColumnWidth(int width) throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.META_DEFAULTCOLUMNWIDTH;
    assertSectionNew(section);
    JsonGenerator jg = selectJsonGenerator(section, false, false);
    jg.writeNumberField(ConversionConstant.DEFAULT_COLUMN_WIDTH, width);
    closedDraftSections.add(section);
  }

  public void writeSheetProtected(boolean sheetProtected) throws JsonGenerationException, IOException
  {
    if(sheetProtected)
    {
      selectJsonGenerator(DraftSection.META_SHEETS).writeBooleanField(ConversionConstant.PROTECTION_PROTECTED, sheetProtected);
    }
  }
  public void writeSheetIndex(int index) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.META_SHEETS).writeNumberField(ConversionConstant.SHEETINDEX, index);
  }

  public void writeSheetName(String sheetName) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.META_SHEETS).writeStringField(ConversionConstant.SHEETNAME, sheetName);
  }
  
  public void writeSheetVisibility(String visibility) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.META_SHEETS).writeStringField(ConversionConstant.VISIBILITY, visibility);
  }
  
  public void writeSheetColor(String color) throws JsonGenerationException, IOException
  {
	selectJsonGenerator(DraftSection.META_SHEETS).writeStringField(ConversionConstant.TABCOLOR, color); 
  }
  
  public void writeOffGridLines(boolean offGridLines) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.META_SHEETS).writeBooleanField(ConversionConstant.OFFGRIDLINES, offGridLines); 
  }
  
  public void writeSheetType(String type) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.META_SHEETS).writeStringField(ConversionConstant.TYPE, type);
  }
  
  public void writeSheetRowHeight(int height) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.META_SHEETS).writeNumberField(ConversionConstant.SHEET_ROW_HEIGHT, height);
  }

  public void writeFreezeRow(int rowIndex) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.META_SHEETS).writeNumberField(ConversionConstant.FREEZEROW, rowIndex);
  }

  public void writeFreezeCol(int colIndex) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.META_SHEETS).writeNumberField(ConversionConstant.FREEZECOLUMN, colIndex);
  }

  public void writeHeight(int h) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.META_ROWS).writeNumberField(ConversionConstant.HEIGHT, h);
  }

  public void writeWidth(int w) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.META_COLUMNS).writeNumberField(ConversionConstant.WIDTH, w);
  }

  public void writeId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(section).writeString(id);
  }

  public void writeCalculated(boolean cal) throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.CONTENT_CALCULATED;
    assertSectionNew(section);
    JsonGenerator jg = selectJsonGenerator(section, false, false);
    jg.writeBooleanField(ConversionConstant.CALCULATED, cal);
    closedDraftSections.add(section);
  }

  public void writeStyleAlign(String align) throws JsonGenerationException, IOException
  {
    if (align != null)
    {
      selectJsonGenerator(DraftSection.CONTENT_STYLES).writeStringField(ConversionConstant.TEXT_ALIGN, align);
    }
  }
  
  public void writeStyleValign(String valign) throws JsonGenerationException, IOException
  {
    if (valign != null)
    {
      selectJsonGenerator(DraftSection.CONTENT_STYLES).writeStringField(ConversionConstant.VERTICAL_ALIGN, valign);
    }
  }

  public void writeStyleDirection(String direction) throws JsonGenerationException, IOException
  {
    if (direction != null)
    {
      selectJsonGenerator(DraftSection.CONTENT_STYLES).writeStringField(ConversionConstant.DIRECTION, direction);
    }
  }

  public void writeSheetDirection(String direction) throws JsonGenerationException, IOException
  {
    if (direction != null)
    {
        selectJsonGenerator(DraftSection.META_SHEETS).writeStringField(ConversionConstant.DIRECTION, direction);
    }
  }
  public void writeStyleIndent(Number indent) throws JsonGenerationException, IOException
  {
    if (indent != null)
    {
      selectJsonGenerator(DraftSection.CONTENT_STYLES).writeNumberField(ConversionConstant.INDENT, indent.intValue());
    }
  }

  public void writeStyleWrap(Boolean wrap) throws JsonGenerationException, IOException
  {
    if (wrap != null)
    {
      selectJsonGenerator(DraftSection.CONTENT_STYLES).writeBooleanField(ConversionConstant.WRAPTEXT, wrap);
    }
  }

  public void writeStyleBackgroundColor(String bgc) throws JsonGenerationException, IOException
  {
    if (bgc != null)
    {
      selectJsonGenerator(DraftSection.CONTENT_STYLES).writeStringField(ConversionConstant.BACKGROUND_COLOR, bgc);
    }
  }
  
  public void writeStylePreserve(String presv) throws JsonGenerationException, IOException
  {
    if(presv != null)
      selectJsonGenerator(DraftSection.CONTENT_STYLES).writeStringField(ConversionConstant.STYLE_PRESERVE, presv);
  }
  
  public void writeStyleDxfId(Number dxfId) throws JsonGenerationException, IOException
  {
    if(dxfId != null)
      selectJsonGenerator(DraftSection.CONTENT_STYLES).writeNumberField(ConversionConstant.STYLE_DXFID, dxfId.intValue());
  }
  
  public void writeStyleHidden(Boolean hidden) throws JsonGenerationException, IOException
  {
    if(hidden != null)
    {
      selectJsonGenerator(DraftSection.CONTENT_STYLES).writeBooleanField(ConversionConstant.STYLE_HIDDEN, hidden);
    }
  }

  public void writeStyleLocked(Boolean unlocked) throws JsonGenerationException, IOException
  {
    if(unlocked != null)
    {
      selectJsonGenerator(DraftSection.CONTENT_STYLES).writeBooleanField(ConversionConstant.STYLE_UNLOCKED, unlocked);
    }
  }
  

  public void writeStyleBorderWidth(String t, String r, String b, String l) throws JsonGenerationException, IOException
  {
    if (t == null && r == null && b == null && l == null)
    {
      return;
    }
    JsonGenerator jg = selectJsonGenerator(DraftSection.CONTENT_STYLES);
    jg.writeObjectFieldStart(ConversionConstant.BORDER);
    writeIfExists(t, ConversionConstant.BORDER_TOP, jg);
    writeIfExists(r, ConversionConstant.BORDER_RIGHT, jg);
    writeIfExists(b, ConversionConstant.BORDER_BOTTOM, jg);
    writeIfExists(l, ConversionConstant.BORDER_LEFT, jg);
    jg.writeEndObject();
  }
  public void writeStyleBorderStyle(String t, String r, String b, String l) throws JsonGenerationException, IOException
  {
    if (t == null && r == null && b == null && l == null)
    {
      return;
    }
    JsonGenerator jg = selectJsonGenerator(DraftSection.CONTENT_STYLES);
    jg.writeObjectFieldStart(ConversionConstant.BORDERSTYLE);
    writeIfExists(t, ConversionConstant.BORDER_TOP_STYLE, jg);
    writeIfExists(r, ConversionConstant.BORDER_RIGHT_STYLE, jg);
    writeIfExists(b, ConversionConstant.BORDER_BOTTOM_STYLE, jg);
    writeIfExists(l, ConversionConstant.BORDER_LEFT_STYLE, jg);
    jg.writeEndObject();
  }

  public void writeStyleBorderColor(String t, String r, String b, String l) throws JsonGenerationException, IOException
  {
    if (t == null && r == null && b == null && l == null)
    {
      return;
    }
    JsonGenerator jg = selectJsonGenerator(DraftSection.CONTENT_STYLES);
    jg.writeObjectFieldStart(ConversionConstant.BORDERCOLOR);
    writeIfExists(t, ConversionConstant.BORDER_TOP_COLOR, jg);
    writeIfExists(r, ConversionConstant.BORDER_RIGHT_COLOR, jg);
    writeIfExists(b, ConversionConstant.BORDER_BOTTOM_COLOR, jg);
    writeIfExists(l, ConversionConstant.BORDER_LEFT_COLOR, jg);
    jg.writeEndObject();
  }

  public void writeStyleFormat(String cat, String code, String color, String cur) throws JsonGenerationException, IOException
  {
    if (cat == null && code == null && color == null && cur == null)
    {
      return;
    }
    JsonGenerator jg = selectJsonGenerator(DraftSection.CONTENT_STYLES);
    jg.writeObjectFieldStart(ConversionConstant.FORMAT);
    writeIfExists(cat, ConversionConstant.FORMATCATEGORY, jg);
    writeIfExists(code, ConversionConstant.FORMATCODE, jg);
    writeIfExists(color, ConversionConstant.FORMAT_FONTCOLOR, jg);
    writeIfExists(cur, ConversionConstant.FORMATCURRENCY, jg);
    jg.writeEndObject();
  }

  public void writeStyleFont(Boolean bold, Boolean italic, Boolean strikethrough, Boolean underline, String color, String fontName,
      Number fontSize) throws JsonGenerationException, IOException
  {
    if (bold == null && italic == null && strikethrough == null && underline == null && color == null && fontName == null
        && fontSize == null)
    {
      return;
    }
    JsonGenerator jg = selectJsonGenerator(DraftSection.CONTENT_STYLES);
    jg.writeObjectFieldStart(ConversionConstant.FONT);
    writeIfExists(bold, ConversionConstant.BOLD, jg);
    writeIfExists(italic, ConversionConstant.ITALIC, jg);
    writeIfExists(strikethrough, ConversionConstant.STRIKTHROUGH, jg);
    writeIfExists(underline, ConversionConstant.UNDERLINE, jg);
    writeIfExists(color, ConversionConstant.COLOR, jg);
    writeIfExists(fontName, ConversionConstant.FONTNAME, jg);
    if (fontSize != null)
    {
      if (fontSize instanceof Long || fontSize instanceof Integer)
      {
        jg.writeNumberField(ConversionConstant.SIZE, fontSize.intValue());
      }
      else if (fontSize instanceof Double || fontSize instanceof Float)
      {
        jg.writeNumberField(ConversionConstant.SIZE, fontSize.floatValue());
      }
      // else, unknown type
    }

    jg.writeEndObject();
  }

  public void writeDefaultColumnStyle(Integer w) throws JsonGenerationException, IOException
  {
    if (w != null)
    {
      int iw = w.intValue();
      if (iw > 0)
      {
        JsonGenerator jg = selectJsonGenerator(DraftSection.CONTENT_STYLES);
        jg.writeObjectFieldStart(ConversionConstant.DEFAULT_COLUMN_STYLE);
        jg.writeNumberField(ConversionConstant.WIDTH, iw);
        jg.writeEndObject();
      }
    }
  }

  public void writeDefaultRowStyle(Integer h) throws JsonGenerationException, IOException
  {
    if (h != null)
    {
      int ih = h.intValue();
      if (ih > 0)
      {
        JsonGenerator jg = selectJsonGenerator(DraftSection.CONTENT_STYLES);
        jg.writeObjectFieldStart(ConversionConstant.DEFAULT_ROW_STYLE);
        jg.writeNumberField(ConversionConstant.HEIGHT, ih);
        jg.writeEndObject();
      }
    }
  }

  public void writeUsage(RangeUsage type, DraftSection section) throws JsonGenerationException, IOException
  {
    if (type != RangeUsage.NORMAL)
    {
      selectJsonGenerator(section).writeStringField(ConversionConstant.RANGE_USAGE, type.toString());
    }
  }

  public void writeAddress(String addr, DraftSection section) throws JsonGenerationException, IOException
  {
    if (addr != null)
    {
      selectJsonGenerator(section).writeStringField(ConversionConstant.RANGE_ADDRESS, addr);
    }
  }

  public void writeSheetId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException
  {
    if (id != null)
    {
      JsonGenerator jg = selectJsonGenerator(section);
      jg.writeFieldName(ConversionConstant.SHEETID);
      jg.writeString(id);
    }
  }
  public void writeEndSheetId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException
  {
    if (id != null)
    {
      JsonGenerator jg = selectJsonGenerator(section);
      jg.writeFieldName(ConversionConstant.ENDSHEETID);
      jg.writeString(id);
    }
  }

  public void writeStartRowId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException
  {
    if (id != null)
    {
      JsonGenerator jg = selectJsonGenerator(section);
      jg.writeFieldName(ConversionConstant.RANGE_STARTROWID);
      jg.writeString(id);
    }
  }

  public void writeEndRowId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException
  {
    if (id != null)
    {
      JsonGenerator jg = selectJsonGenerator(section);
      jg.writeFieldName(ConversionConstant.RANGE_ENDROWID);
      jg.writeString(id);
    }
  }

  public void writeStartColumnId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException
  {
    if (id != null)
    {
      JsonGenerator jg = selectJsonGenerator(section);
      jg.writeFieldName(ConversionConstant.RANGE_STARTCOLID);
      jg.writeString(id);
    }
  }

  public void writeEndColumnId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException
  {
    if (id != null)
    {
      JsonGenerator jg = selectJsonGenerator(section);
      jg.writeFieldName(ConversionConstant.RANGE_ENDCOLID);
      jg.writeString(id);
    }
  }

  public void writeAttribute(String attr, DraftSection section) throws JsonGenerationException, IOException
  {
    if (attr != null)
    {
      selectJsonGenerator(section).writeStringField(ConversionConstant.ATTR, attr);
    }
  }

  public void writeData(JSONObject data, DraftSection section) throws JsonGenerationException, IOException
  {
    if (data != null)
    {
      // de-composite data, serialize key: value part at current level
      JsonGenerator jg = selectJsonGenerator(section);
      dataListener.setJsonGenerator(jg);
      ModelHelper.iterateMap(data, dataListener);
    }
  }

  public void writeValue(String value) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeStringField(ConversionConstant.VALUE, value);
  }

  public void writeValue(long value) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeNumberField(ConversionConstant.VALUE, value);
  }

  public void writeValue(double value) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeNumberField(ConversionConstant.VALUE, value);
  }

  public void writeLink(String link) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeStringField(ConversionConstant.LINK, link);
  }
  
  public void writeCellStringIndex(int index) throws JsonGenerationException, IOException
  {
    if (index > 0)
    {
      selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeNumberField(ConversionConstant.KEY_STRING_INDEX, index);
    }
  }

  public void writeColSpan(int colspan) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeNumberField(ConversionConstant.COLSPAN, colspan);
  }
  
  public void writeRowSpan(int rowspan) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeNumberField(ConversionConstant.ROWSPAN, rowspan);
  }

  public void writeCellDirty(boolean bDirty) throws JsonGenerationException, IOException
  {
    if(bDirty)
      selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeBooleanField(ConversionConstant.CELL_DIRTY, bDirty);
  }
  
  public void writeCalcValue(String value) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeStringField(ConversionConstant.CALCULATEDVALUE, value);
  }

  public void writeCalcValue(long value) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeNumberField(ConversionConstant.CALCULATEDVALUE, value);
  }
  
  public void writeCalcValue(double value) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeNumberField(ConversionConstant.CALCULATEDVALUE, value);
  }
  
//  public void writeCellErrorCode(int error) throws JsonGenerationException, IOException
//  {
//    selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeNumberField(ConversionConstant.FORMULA_ERRORCODE, error);
//  }
  
  public void writeCellType(int type) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeNumberField(ConversionConstant.CELL_TYPE, type);
  }

  public void writeIsCovered() throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.CONTENT_SHEETS).writeBooleanField(ConversionConstant.ISCOVERED, true);
  }

  public void writeFormulaErrProps(int props) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.REFERENCE_SHEETS).writeNumberField(ConversionConstant.FORMULA_ERRORPROP, props);
  }
  
  public void writeReferenceType(String type) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.REFERENCE_SHEETS).writeStringField(ConversionConstant.REFERENCE_TYPE, type);
  }

  public void writeReferenceIndex(int index) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.REFERENCE_SHEETS).writeNumberField(ConversionConstant.FORMULA_TOKEN_INDEX, index);
  }

  public void writeReferenceRowId(SerializableString id) throws JsonGenerationException, IOException
  {
    JsonGenerator jg = selectJsonGenerator(DraftSection.REFERENCE_SHEETS);
    jg.writeFieldName(ConversionConstant.ROWID_NAME);
    jg.writeString(id);
  }

  public void writeReferenceColumnId(SerializableString id) throws JsonGenerationException, IOException
  {
    JsonGenerator jg = selectJsonGenerator(DraftSection.REFERENCE_SHEETS);
    jg.writeFieldName(ConversionConstant.COLUMNID_NAME);
    jg.writeString(id);
  }

  public void writeReferenceLeftIndex(int leftIndex) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.REFERENCE_SHEETS).writeNumberField(ConversionConstant.LEFTTOKENINDEX, leftIndex);
  }

  public void writeReferenceRightIndex(int rightIndex) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.REFERENCE_SHEETS).writeNumberField(ConversionConstant.RIGHTTOKENINDEX, rightIndex);
  }

  public void writeReferenceNames(String names) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.REFERENCE_SHEETS).writeStringField(ConversionConstant.NAME_RANGE, names);
  }

  public void writePreserveMaxRow(SerializableString sheetId, int maxRow) throws JsonGenerationException, IOException
  {
    JsonGenerator jg = selectJsonGenerator(DraftSection.PRESERVE_MAXROW);
    jg.writeFieldName(sheetId);
    jg.writeNumber(maxRow);
  }

  public void writePreserveValue(SerializableString columnId, int value) throws JsonGenerationException, IOException
  {
    JsonGenerator jg = selectJsonGenerator(DraftSection.PRESERVE_VALUE);
    jg.writeFieldName(columnId);
    jg.writeNumber(value);
  }

  public void writeStartRowIndex(int index) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.PRESERVE_STYLE).writeNumberField(ConversionConstant.STARTROW, index);
  }

  public void writeEndRowIndex(int index) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.PRESERVE_STYLE).writeNumberField(ConversionConstant.ENDROW, index);
  }

  public void writeStartColumnIndex(int index) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.PRESERVE_STYLE).writeNumberField(ConversionConstant.STARTCOL, index);
  }

  public void writeEndColumnIndex(int index) throws JsonGenerationException, IOException
  {
    selectJsonGenerator(DraftSection.PRESERVE_STYLE).writeNumberField(ConversionConstant.ENDCOL, index);
  }

  public void writeInitColumnCount(int cnt) throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.META_INIT_COLUMNCOUNT;
    assertSectionNew(section);
    JsonGenerator jg = selectJsonGenerator(section, false, false);
    jg.writeNumberField(ConversionConstant.INIT_COLUMN_INDEX, cnt);
    closedDraftSections.add(section);
  }

  public void writeInitRowCount(int cnt) throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.META_INIT_ROWCOUNT;
    assertSectionNew(section);
    JsonGenerator jg = selectJsonGenerator(section, false, false);
    jg.writeNumberField(ConversionConstant.INIT_ROW_INDEX, cnt);
    closedDraftSections.add(section);
  }

  public void writeInitStyleCount(int cnt) throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.META_INIT_STYLECOUNT;
    assertSectionNew(section);
    JsonGenerator jg = selectJsonGenerator(section, false, false);
    jg.writeNumberField(ConversionConstant.INIT_STYLE_INDEX, cnt);
    closedDraftSections.add(section);
  }

  public void writeInitSheetId(int cnt) throws JsonGenerationException, IOException
  {
    DraftSection section = DraftSection.META_INIT_SHEETCOUNT;
    assertSectionNew(section);
    JsonGenerator jg = selectJsonGenerator(section, false, false);
    jg.writeNumberField(ConversionConstant.INIT_SHEET_INDEX, cnt);
    closedDraftSections.add(section);
  }

  public void writeSheetUUID(String uuid) throws JsonGenerationException, IOException
  {
    if (uuid != null)
      selectJsonGenerator(DraftSection.META_SHEETS).writeStringField(ConversionConstant.ACTION_ID, uuid);
  }

  public void writeSheetRawContentRows(SerializableString sheetId, IRawDataStorageAdapter rawData, DraftActionGenerator actionGenerator,
      IDraftActionHandler actionHandler) throws IllegalStateException, IOException
  {
    InputStream rawIn = rawData.getInputStream();
    JsonParser jp = jsonFactory.createJsonParser(rawIn);
    ModifiableJsonParser mjp = new ModifiableJsonParser(jp);
    if (!RESERVE_CV)
    {
      mjp.globalRemove("cv");
    }
    mjp.nextToken();
    JsonGenerator jg = selectJsonGenerator(DraftSection.CONTENT_SHEETS);
    // write "(sheetId): "
    jg.writeFieldName(sheetId);

    if (actionGenerator == null)
    {
      jg.copyCurrentStructure(mjp);
    }
    else
    {
      JSONUtils.copyCurrentStructure(mjp, jg, actionGenerator, actionHandler);
    }

    rawIn.close();
  }

  public void writeSheetRawMetaRows(SerializableString sheetId, IRawDataStorageAdapter rawData, DraftActionGenerator actionGenerator,
      IDraftActionHandler actionHandler) throws IllegalStateException, IOException
  {
    InputStream rawIn = rawData.getInputStream();
    JsonParser jp = jsonFactory.createJsonParser(rawIn);
    ModifiableJsonParser mjp = new ModifiableJsonParser(jp);
    mjp.nextToken();
    JsonGenerator jg = selectJsonGenerator(DraftSection.META_ROWS);
    jg.writeFieldName(sheetId);
    if (actionGenerator == null)
    {
      jg.copyCurrentStructure(mjp);
    }
    else
    {
      JSONUtils.copyCurrentStructure(mjp, jg, actionGenerator, actionHandler);
    }

    rawIn.close();
  }

  public void writeRowRawContentCells(SerializableString rowId, IRawDataStorageAdapter rawData, DraftActionGenerator actionGenerator,
      IDraftActionHandler actionHandler) throws IllegalStateException, IOException
  {
    InputStream rawIn = rawData.getInputStream();
    JsonParser jp = jsonFactory.createJsonParser(rawIn);
    ModifiableJsonParser mjp = new ModifiableJsonParser(jp);
    if (!RESERVE_CV)
    {
      mjp.globalRemove("cv");
    }
    mjp.nextToken();
    JsonGenerator jg = selectJsonGenerator(DraftSection.CONTENT_SHEETS);
    jg.writeFieldName(rowId);
    if (actionGenerator == null)
    {
      jg.copyCurrentStructure(mjp);
    }
    else
    {
      JSONUtils.copyCurrentStructure(mjp, jg, actionGenerator, actionHandler);
    }

    rawIn.close();
  }

  // INTERNALLY, assert a draft has already been opened
  private void assertSectionOpened(DraftSection section)
  {
    if (!openedDraftSections.contains(section))
    {
      throw new IllegalStateException("DraftSection " + section + " should be in opened state.");
    }
  }

  // INTERNALLY, assert a draft has not been opened or closed
  private void assertSectionNew(DraftSection section)
  {
    if (openedDraftSections.contains(section) || closedDraftSections.contains(section))
    {
      throw new IllegalStateException("DraftSection " + section + " already been opened or closed.");
    }
  }

  private void assertInSection(DraftSection section)
  {
    if (selected > -1)
    {
      if (inSections[selected] != section)
      {
        throw new IllegalStateException("JsonGenerator in index " + selected + " not in section " + section + ".");
      }
    }
  }

  private JsonGenerator selectJsonGenerator(DraftSection section) throws JsonGenerationException, IOException
  {
    return selectJsonGenerator(section, true, true);
  }

  // INTERNALLY, returns a JsonGenerator that suits current DraftSection
  private JsonGenerator selectJsonGenerator(DraftSection section, boolean includeBuffer, boolean withAssertion)
      throws JsonGenerationException, IOException
  {
    if (withAssertion)
    {
      assertSectionOpened(section);
    }
    if (includeBuffer)
    {
      TokenBuffer buf = buffers.get(section);
      if (buf != null)
      {
        selected = -1;
        return buf;
      }
    }

    JsonGenerator jg;

    switch (section)
      {
        case CONTENT_CALCULATED :
        case CONTENT_NAMES :
        case CONTENT_PNAMES :
        case CONTENT_ROOT :
        case CONTENT_SHEETS :
        case CONTENT_STYLES :
        case CONTENT_UNNAMES :
          selected = CONTENT;
          jg = jgs[selected];
          if (!openedDraftSections.contains(DraftSection.CONTENT_ROOT))
          {
            // content file has not been opened yet, open it by writing START_OBJECT
            jg.writeStartObject();
            openedDraftSections.add(DraftSection.CONTENT_ROOT);
          }
          break;
        case META_COLUMNS :
        case META_DEFAULTCOLUMNWIDTH :
        case META_INIT_ROWCOUNT :
        case META_INIT_COLUMNCOUNT :
        case META_INIT_STYLECOUNT :
        case META_INIT_SHEETCOUNT :
        case META_LOCALE :
        case META_ROOT :
        case META_ROWS :
        case META_SHEETS :
        case META_SHEETSARRAY :
        case META_SHEETSIDARRAY :
        case META_VERSION :
        case META_CSV :
        case META_DATE1904 :
          selected = META;
          jg = jgs[selected];
          if (!openedDraftSections.contains(DraftSection.META_ROOT))
          {
            // content file has not been opened yet, open it by writing START_OBJECT
            jg.writeStartObject();
            openedDraftSections.add(DraftSection.META_ROOT);
          }
          break;
        case REFERENCE_ROOT :
        case REFERENCE_SHEETS :
          selected = REFERENCE;
          jg = jgs[selected];
          if (!openedDraftSections.contains(DraftSection.REFERENCE_ROOT))
          {
            // content file has not been opened yet, open it by writing START_OBJECT
            jg.writeStartObject();
            openedDraftSections.add(DraftSection.REFERENCE_ROOT);
          }
          break;
        case PRESERVE_PNAMES :
        case PRESERVE_ROOT :
        case PRESERVE_STYLE :
        case PRESERVE_VALUE :
        case PRESERVE_MAXROW :
          selected = PRESERVE;
          jg = jgs[selected];
          if (!openedDraftSections.contains(DraftSection.PRESERVE_ROOT))
          {
            // content file has not been opened yet, open it by writing START_OBJECT
            jg.writeStartObject();
            openedDraftSections.add(DraftSection.PRESERVE_ROOT);
          }
          break;
        default:
          // never here
          selected = -1;
          return null;
      }

    if (withAssertion)
    {
      assertInSection(section);
    }
    return jgs[selected];
  }

  private void writeIfExists(Float f, String field, JsonGenerator jg) throws JsonGenerationException, IOException
  {
    if (f != null)
    {
      jg.writeNumberField(field, f.floatValue());
    }
  }

  private void writeIfExists(Boolean b, String field, JsonGenerator jg) throws JsonGenerationException, IOException
  {
    if (b != null)
    {
      jg.writeBooleanField(field, b.booleanValue());
    }
  }

  private void writeIfExists(String s, String field, JsonGenerator jg) throws JsonGenerationException, IOException
  {
    if (s != null)
    {
      jg.writeStringField(field, s);
    }
  }

  // listener for iterating range "data" field
  private class DataJSONObjectListener implements ModelHelper.IMapEntryListener<String, Object>
  {
    private JsonGenerator jg;

    public void setJsonGenerator(JsonGenerator jg)
    {
      this.jg = jg;
    }

    public boolean onEntry(String key, Object value)
    {
      try
      {
        if (value instanceof String)
        {
          jg.writeFieldName(key);
          jg.writeString((String) value);
        }
        else if (value instanceof Integer || value instanceof Long)
        {
          jg.writeFieldName(key);
          jg.writeNumber(((Number) value).longValue());
        }
        else if (value instanceof Float || value instanceof Double)
        {
          jg.writeFieldName(key);
          jg.writeNumber(((Number) value).doubleValue());
        }
        else if (value instanceof Boolean)
        {
          jg.writeFieldName(key);
          jg.writeBoolean(((Boolean) value).booleanValue());
        }
        else if (value instanceof JSONObject)
        {
          jg.writeFieldName(key);
          jg.writeStartObject();
          SerializationUtils.serializeSection(jg, (JSONObject) value);
          jg.writeEndObject();
        }
        else
        {
          LOG.log(Level.WARNING, "unexpected type in range data field, {0}: {1}", new Object[] { key, value });
        }
      }
      catch (Exception e)
      {
        throw new RuntimeException(e);
      }

      return false;
    }
  }

  public void setNodeJSEnabled(boolean hasNodeJSEnabled)
  {
    RESERVE_CV = hasNodeJSEnabled;
  }

}
