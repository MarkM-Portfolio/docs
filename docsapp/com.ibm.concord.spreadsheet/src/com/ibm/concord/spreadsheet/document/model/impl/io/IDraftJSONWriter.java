package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.io.IOException;

import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.SerializableString;
import org.codehaus.jackson.util.TokenBuffer;

import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.json.java.JSONObject;

/**
 * <p>
 * This writer interface abstracts all actions that writes draft data to several {@link JsonGenerator}s. It only couples to
 * {@link JsonGenerator} and {@link JsonParser}.
 * <p>
 * All write* methods defined only accepts primitive objects, only except for {@link SerializableString} parameters for IDs mainly for
 * performance consideration. This hides model implementation details from serializing. The implemention only couples with the spreadsheet
 * JSON format.
 * <p>
 * The section parameter {@link DraftSection} tells write* methods about where to write. This hides the trouble of choosing between
 * {@link JsonGenerator}s. It can also hides the details about using a buffer for contents. The client of this interface should not call
 * {@link JsonGenerator} methods directly.
 * <p>
 * By default this writer writes to {@link JsonGenerator}s for different draft files. The client can also make it to write to a buffer and
 * flush to the {@link JsonGenerator} at a later time.
 * <p>
 * Most methods defined need to throw {@link JsonGenerationException} and {@link IOException}, which is needed for {@link JsonGenerator}
 * calls. Methods may also need to throw {@link IllegalStateException} when generation state is wrong.
 */
public interface IDraftJSONWriter
{
  /**
   * Index of meta.js JsonGenerator in array
   */
  public static final int META = 0;

  /**
   * Index of content.js JsonGenerator in array
   */
  public static final int CONTENT = 1;

  /**
   * Index of reference.js JsonGenerator in array
   */
  public static final int REFERENCE = 2;

  /**
   * Index of preserve.js JsonGenerator in array
   */
  public static final int PRESERVE = 3;

  /**
   * Set {@link JsonGenerator}s for draft files. In the order of meta.js, content.js, reference.js, preserve.js. This must be the first
   * method called after the writer is initialized.
   * 
   * @param jgs
   */
  public void setJsonGenerators(JsonGenerator... jgs);

  /**
   * If provided draft section is already opened.
   * 
   * @param section
   * @return
   */
  public boolean isDraftSectionOpened(DraftSection section);

  /**
   * If provided draft section is already closed.
   * 
   * @param section
   * @return
   */
  public boolean isDraftSectionClosed(DraftSection section);

  /**
   * If provided draft section is buffered.
   * 
   * @param section
   * @return
   */
  public boolean isDraftSectionBuffered(DraftSection section);

  /**
   * Open one section. Writer will open the section by write section string name and one {, or [.
   * 
   * @param section
   * @param useBuffer
   *          if true, this section will be opened as a {@link TokenBuffer}. The buffer can be retrieved or flushed.
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void openDraftSection(DraftSection section, boolean useBuffer) throws JsonGenerationException, IOException;

  /**
   * Close one section. Writer will close the section by writing a } or ].
   * 
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void closeDraftSection(DraftSection section) throws JsonGenerationException, IOException;

  /**
   * If the section is already buffered. Return corresponding {@link JsonParser} to read buffered content.
   * 
   * @param section
   * @return
   */
  public JsonParser getBufferedDraftSectionAsParser(DraftSection section);

  /**
   * If the section is already buffered. Flush the buffered content to draft JSON and mark the section as closed.
   * 
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void flushBufferedDraftSection(DraftSection section) throws JsonGenerationException, IOException;

  /**
   * Close the writer and related all {@link JsonGenerator}s.
   * 
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void close() throws JsonGenerationException, IOException;

  /**
   * Write "visibility: " field.
   * 
   * @param vis
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeVisibility(String vis, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * Write "rn: " field, i.e. repeated num.
   * 
   * @param rn
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeRepeatedNum(int rn, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * Write "sid: " field, i.e. style id.
   * 
   * @param styleId
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleId(SerializableString styleId, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * Write "(fieldName): {".
   * 
   * @param fieldName
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void openObject(String fieldName, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * Write "(fieldName): {".
   * 
   * @param fieldName
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void openObject(SerializableString fieldName, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * Write "{".
   * 
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void openObject(DraftSection section) throws JsonGenerationException, IOException;

  /**
   * Write "["
   * 
   * @param fieldName
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void openArray(String fieldName, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * Write "}"
   * 
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void closeObject(DraftSection section) throws JsonGenerationException, IOException;

  /**
   * Write "]"
   * 
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void closeArray(DraftSection section) throws JsonGenerationException, IOException;

  /**
   * For meta.js, write "version: ".
   * 
   * @param ver
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeVersion(String ver) throws JsonGenerationException, IOException;
  
  /**
   * For meta.js, write "csv: ".
   * 
   * @param csv
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeCSV(boolean csv) throws JsonGenerationException, IOException;
  
  /**
   * For meta.js, write "date1904: ".
   * 
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeDate1904() throws JsonGenerationException, IOException;

  /**
   * For meta.js, write "locale: ".
   * 
   * @param locale
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeLocale(String locale) throws JsonGenerationException, IOException;

  /**
   * For meta.js, write "protected: " to sheet session.
   * 
   * @param bprotected
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeSheetProtected(boolean sheetProtected) throws JsonGenerationException, IOException;
  
  /**
   * For meta.js, write "defaultcolumnwidth: ".
   * 
   * @param width
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeDefaultColumnWidth(int width) throws JsonGenerationException, IOException;
  
  /**
   * For meta.js, write "initcol: ".
   * 
   * @param cnt
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeInitColumnCount(int cnt) throws JsonGenerationException, IOException;

  /**
   * For meta.js, write "initrow: ".
   * 
   * @param cnt
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeInitRowCount(int cnt) throws JsonGenerationException, IOException;
  
  /**
   * For meta.js, write "initstyle: ".
   * 
   * @param cnt
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeInitStyleCount(int cnt) throws JsonGenerationException, IOException;

  /**
   * For meta.js, write "initsheet: ".
   * 
   * @param cnt
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeInitSheetId(int cnt) throws JsonGenerationException, IOException;

  /**
   * For meta.js, write "sheetindex: ".
   * 
   * @param index
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeSheetIndex(int index) throws JsonGenerationException, IOException;

  /**
   * For meta.js, write "sheetname: ".
   * 
   * @param sheetName
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeSheetName(String sheetName) throws JsonGenerationException, IOException;
  
  /**
   * For meta.js, write "visibility: ".
   * 
   * @param visibility
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeSheetVisibility(String visibility) throws JsonGenerationException, IOException;
  
  /**
   * For meta.js, write "uuid: ".
   * 
   * @param uuid
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeSheetUUID(String uuid) throws JsonGenerationException, IOException;
  
  /**
   * For meta.js, for meta sheet def, write "type: ".
   * 
   * @param uuid
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeSheetType(String type) throws JsonGenerationException, IOException;
  
  /**
   * For meta.js, for meta sheet def, write "rowHeight: ".
   * 
   * @param height
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeSheetRowHeight(int height) throws JsonGenerationException, IOException;

  /**
   * For meta.js meta rows, write "h: ".
   * 
   * @param h
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeHeight(int h) throws JsonGenerationException, IOException;

  /**
   * For meta.js meta columns, write "w: ".
   * 
   * @param w
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeWidth(int w) throws JsonGenerationException, IOException;

  /**
   * For meta.js ID array, write one ID.
   * 
   * @param id
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * For content.js, write "calculated: ".
   * 
   * @param cal
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeCalculated(boolean cal) throws JsonGenerationException, IOException;

  /**
   * For content.js styles, write "align: ".
   * 
   * @param align
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleAlign(String align) throws JsonGenerationException, IOException;

  /**
   * For content.js styles, write "direction: ".
   * 
   * @param direction
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleDirection(String direction) throws JsonGenerationException, IOException;
  
  /**
   * For meta.js styles, write "dir: ".
   * 
   * @param direction
   * @throws JsonGenerationException
   * @throws IOException
   */  
  public void writeSheetDirection(String direction) throws JsonGenerationException, IOException;

  /**
   * For content.js styles, write "indent: ".
   * 
   * @param indent
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleIndent(Number indent) throws JsonGenerationException, IOException;

  /**
   * For content.js styles, write "wrap: ".
   * 
   * @param wrap
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleWrap(Boolean wrap) throws JsonGenerationException, IOException;

  /**
   * For content.js styles, write "bg: ".
   * 
   * @param bgc
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleBackgroundColor(String bgc) throws JsonGenerationException, IOException;
  
  /**
   * For content.js styles, write "hidden: ".
   * 
   * @param presv
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleHidden(Boolean hidden) throws JsonGenerationException, IOException;
  
  /**
   * For content.js styles, write "locked: ".
   * 
   * @param presv
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleLocked(Boolean locked) throws JsonGenerationException, IOException;
  
  /**
   * For content.js styles, write "preserve: ".
   * 
   * @param presv
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStylePreserve(String presv) throws JsonGenerationException, IOException;
   
  /**
   * For content.js styles, write border style grouped attributes.
   * 
   * @param t
   * @param r
   * @param b
   * @param l
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleBorderStyle(String t, String r, String b, String l) throws JsonGenerationException, IOException;
  
  /**
   * For content.js styles, write border width grouped attributes.
   * 
   * @param t
   * @param r
   * @param b
   * @param l
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleBorderWidth(String t, String r, String b, String l) throws JsonGenerationException, IOException;

  /**
   * For content.js styles, write border color grouped attributes.
   * 
   * @param t
   * @param r
   * @param b
   * @param l
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleBorderColor(String t, String r, String b, String l) throws JsonGenerationException, IOException;

  /**
   * For content.js styles, write format grouped attributes.
   * 
   * @param cat
   * @param code
   * @param color
   * @param cur
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleFormat(String cat, String code, String color, String cur) throws JsonGenerationException, IOException;

  /**
   * For content.js styles, write style font grouped attributes.
   * 
   * @param bold
   * @param italic
   * @param strikethrough
   * @param underline
   * @param color
   * @param fontName
   * @param fontSize
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStyleFont(Boolean bold, Boolean italic, Boolean strikethrough, Boolean underline, String color, String fontName,
      Number fontSize) throws JsonGenerationException, IOException;

  /**
   * For content.js styles, write "defaultcolumnstyle: { w: ".
   * 
   * @param w
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeDefaultColumnStyle(Integer w) throws JsonGenerationException, IOException;

  /**
   * For content.js styles, write "defaultrowstyle: { w: ".
   * 
   * @param h
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeDefaultRowStyle(Integer h) throws JsonGenerationException, IOException;

  /**
   * For all range defs, write "usage: ".
   * 
   * @param type
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeUsage(RangeUsage type, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * For all range defs, write "addr: ".
   * 
   * @param addr
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeAddress(String addr, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * For all range defs, write "sheetid: ".
   * 
   * @param id
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeSheetId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * For all range defs, write "srid: ".
   * 
   * @param id
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStartRowId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * For all range defs, write "erid: ".
   * 
   * @param id
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeEndRowId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * For all range defs, write "scid: ".
   * 
   * @param id
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStartColumnId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * For all range defs, write "ecid: ".
   * 
   * @param id
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeEndColumnId(SerializableString id, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * For all range defs, write "attr: ".
   * 
   * @param attr
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeAttribute(String attr, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * For all range defs, write "data: ".
   * 
   * @param data
   * @param section
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeData(JSONObject data, DraftSection section) throws JsonGenerationException, IOException;

  /**
   * For content cell def, write "v: ".
   * 
   * @param value
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeValue(String value) throws JsonGenerationException, IOException;

  /**
   * For content cell def, write "v: ".
   * 
   * @param value
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeValue(long value) throws JsonGenerationException, IOException;

  /**
   * For content cell def, write "v: ".
   * 
   * @param value
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeValue(double value) throws JsonGenerationException, IOException;

  /**
   * For content cell def, write "link: ".
   * 
   * @param link
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeLink(String link) throws JsonGenerationException, IOException;
  
  /**
   * For content cell def, write "sIdx: ".
   * 
   * @param link
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeCellStringIndex(int index) throws JsonGenerationException, IOException;

  /**
   * For content cell def, write "cs: ".
   * 
   * @param colspan
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeColSpan(int colspan) throws JsonGenerationException, IOException;

  /**
   * For content cell def, write "rs: ".
   * 
   * @param rowspan
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeRowSpan(int rowspan) throws JsonGenerationException, IOException;

  /**
   * For formula cell dirty status, write "d: ".
   * @param bDirty
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeCellDirty(boolean bDirty) throws JsonGenerationException, IOException;
  
  /**
   * For formula calculate value, write "cv: ".
   * @param value
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeCalcValue(String value) throws JsonGenerationException, IOException;

  /**
   * For formula calculate value, write "cv: ".
   * @param value
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeCalcValue(long value) throws JsonGenerationException, IOException;
  
  /**
   * For formula calculate value, write "cv: ".
   * @param value
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeCalcValue(double value) throws JsonGenerationException, IOException;

  /**
   * For cell type, write "t: ".
   * @param type
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeCellType(int type) throws JsonGenerationException, IOException;
  
//  /**
//   * For formula return error code, write "ec: ".
//   * @param error
//   * @throws JsonGenerationException
//   * @throws IOException
//   */
//  
//  public void writeCellErrorCode(int error) throws JsonGenerationException, IOException;
  /**
   * For content cell def, write "ic: true".
   * 
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeIsCovered() throws JsonGenerationException, IOException;

  /**
   * For reference def, write "type: ".
   * 
   * @param type
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeReferenceType(String type) throws JsonGenerationException, IOException;

  /**
   * For reference def, write "index: ".
   * 
   * @param index
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeReferenceIndex(int index) throws JsonGenerationException, IOException;

  /**
   * For reference def, write "rid: ".
   * 
   * @param id
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeReferenceRowId(SerializableString id) throws JsonGenerationException, IOException;

  /**
   * For reference def, write "cid: ".
   * 
   * @param id
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeReferenceColumnId(SerializableString id) throws JsonGenerationException, IOException;

  /**
   * For reference def, write "lIdx: ".
   * 
   * @param leftIndex
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeReferenceLeftIndex(int leftIndex) throws JsonGenerationException, IOException;

  /**
   * For reference def, write "rIdx: ".
   * 
   * @param rightIndex
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeReferenceRightIndex(int rightIndex) throws JsonGenerationException, IOException;

  /**
   * For reference def, write "names: ".
   * 
   * @param names
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeReferenceNames(String names) throws JsonGenerationException, IOException;

  /**
   * For preserve.js, write "sheetId: maxRow"
   * 
   * @param sheetId
   * @param maxRow
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writePreserveMaxRow(SerializableString sheetId, int maxRow) throws JsonGenerationException, IOException;

  /**
   * For preserve.js, write "columnId: true"
   * 
   * @param columnId
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writePreserveValue(SerializableString columnId, int value) throws JsonGenerationException, IOException;

  /**
   * For preserve.js, style range, write "startrow: "
   * 
   * @param index
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStartRowIndex(int index) throws JsonGenerationException, IOException;

  /**
   * For preserve.js, write "endrow: "
   * 
   * @param index
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeEndRowIndex(int index) throws JsonGenerationException, IOException;

  /**
   * For preserve.js, write "startcol: "
   * 
   * @param index
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeStartColumnIndex(int index) throws JsonGenerationException, IOException;

  /**
   * For preserve.js, write "endcol: "
   * 
   * @param index
   * @throws JsonGenerationException
   * @throws IOException
   */
  public void writeEndColumnIndex(int index) throws JsonGenerationException, IOException;
}
