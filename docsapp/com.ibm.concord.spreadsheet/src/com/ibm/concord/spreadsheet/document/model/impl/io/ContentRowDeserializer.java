package com.ibm.concord.spreadsheet.document.model.impl.io;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.JsonEncoding;
import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.JsonToken;

import com.ibm.concord.spreadsheet.SpreadsheetConfig;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaError;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.impl.CoverInfo;
import com.ibm.concord.spreadsheet.document.model.impl.FormulaCell;
import com.ibm.concord.spreadsheet.document.model.impl.Row;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.impl.io.ModelIOFactory.Rule;
import com.ibm.concord.spreadsheet.document.model.impl.io.handlers.ContentCellHandler;
import com.ibm.concord.spreadsheet.document.model.impl.io.swap.IRawDataStorageAdapter;
import com.ibm.concord.spreadsheet.document.model.style.StyleManager;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.Position;

/**
 * Deserializer that for content "rows": ... for all rows or "(rowId): " for a single row.
 */
public class ContentRowDeserializer
{
  private JsonFactory jsonFactory;

  private DraftActionGenerator actionGenerator;

  private ContentRowActionHandler actionHandler;

  private ContentCellHandler contentCellHandler;

  // on postAction() call of this action, will end the deserialization
  private Actions endAction;

  private boolean finished;

  // true if jp is from raw data, i.e. we are deserializing raw data
  private boolean forRawData;

  public ContentRowDeserializer(JsonFactory jf, StyleManager sm)
  {
    jsonFactory = jf;

    actionGenerator = new DraftActionGenerator();
    actionHandler = new ContentRowActionHandler();
    contentCellHandler = new ContentCellHandler();
    contentCellHandler.setStyleManager(sm);
  }

  public void deserialize(IRawDataStorageAdapter rawData) throws JsonParseException, IllegalStateException, IOException
  {
    JsonParser jp = jsonFactory.createJsonParser(rawData.getInputStream());
    // jump over null token
    jp.nextToken();

    forRawData = true;
    deserialize(jp);
    jp.close();
    forRawData = false;
  }

  public void deserialize(JsonParser jp) throws JsonParseException, IOException
  {
    finished = false;

    JsonToken jt = jp.getCurrentToken();
    while (!finished)
    {
      if (actionGenerator.onToken(jp, actionHandler))
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

  public void setSheet(Sheet sheet)
  {
    contentCellHandler.setContextSheet(sheet);
    actionHandler.sheet = sheet;
  }

  public void setRow(Row row)
  {
    contentCellHandler.setContext(row);
    actionHandler.row = row;
  }

  public void setStyleList(List<StyleObject> styleList)
  {
    contentCellHandler.setStyleList(styleList);
  }

  public void setRootRule(Rule rootRule)
  {
    actionGenerator.setRootRule(rootRule);
    if (rootRule == ModelIOFactory.getInstance().getContentSheetRowRule())
    {
      endAction = Actions.CONTENT_SHEET_ROW;
    }
    else if (rootRule == ModelIOFactory.getInstance().getContentSheetRule())
    {
      endAction = Actions.CONTENT_SHEET_ROWS;
    }
    else
    {
      endAction = Actions.META_ROW_SHEET;
    }
  }

  private class ContentRowActionHandler implements IDraftActionHandler
  {
    public Sheet sheet;

    public Row row;

    public void onAction(List<String> fieldPath, Actions action, JsonParser jp) throws JsonParseException, IOException
    {
      String id;
      int numberId;
      int length;

      switch (action)
        {
          case CONTENT_SHEET_ROWS :
            // tag action
            break;
          case CONTENT_SHEET_ROW :
            length = fieldPath.size() - 1;
            id = fieldPath.get(length);
            numberId = ModelHelper.toNumberId(id);
            Position pos = ModelHelper.insert(sheet.getRows(), new Row(sheet, numberId), sheet.getRows().size() - 1);
            int rowPos = pos.index;
            row = sheet.getRows().get(rowPos);
            switch (ModelIOFactory.LOAD_MODE)
              {
                case ALL :
                  contentCellHandler.setContext(row);
                  break;
                case CELLS_AS_STREAM :
                  if (forRawData)
                  {
                    // deserializing row content cells raw data, go on to deserialize
                    contentCellHandler.setContext(row);
                  }
                  else
                  {
                    if (SpreadsheetConfig.useReferenceJS()==true) {
                      // deserializing sheet rows raw data, store raw rows
                      row.setRawData(JSONUtils.storeRawData(jsonFactory, jp, false));
                    } else {
                      // deserializing sheet rows raw data, store raw rows
                      row.setRawData(storeRawDataAndInfos(jsonFactory, jp, false, row));
                    }
                  }
                  break;
                case ROWS_AS_STREAM :
                  row.setRawData(JSONUtils.storeRawData(jsonFactory, jp, false));
                  break;
                default:
                  // never here;
                  break;
              }
            break;
          case CONTENT_SHEET_ROW_CELL :
            length = fieldPath.size() - 1;
            id = fieldPath.get(length);
            numberId = ModelHelper.toNumberId(id);
            contentCellHandler.setColumnId(numberId);
            JSONUtils.forEachField(contentCellHandler, jp);
            break;
          default:
            // don't care
            break;
        }

    }

    public void onFieldName(Actions action, JsonParser jp) throws JsonParseException, IOException
    {
      ;
    }

    public void postAction(List<String> fieldPath, Actions action, JsonParser jp)
    {
      if (action == endAction)
      {
        finished = true;
      }
    }

    // read current structure of jp into a raw data
    public IRawDataStorageAdapter storeRawDataAndInfos(JsonFactory jsonFactory, JsonParser jp, boolean useInflater, Row row)
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
      Map<Integer, FormulaCell> cellMap = new HashMap<Integer, FormulaCell>();
      Map<Integer, Integer[]> mergeMap = new HashMap<Integer, Integer[]>();
      Map<String, Map> rowInfos = new HashMap<String, Map>();
      rowInfos.put("formulas", cellMap);
      rowInfos.put("mergeCells", mergeMap);
      
      copyCurrentStructureAndInfos(jp, jg, row, "", rowInfos);
      if (cellMap.size() > 0)
      {
        Sheet contextSheet = row.getParent();
        Map<Integer, Map<Integer, FormulaCell>> map = contextSheet.getFormulaCellsMap();
        if (map == null)
        {
          map = new HashMap<Integer, Map<Integer, FormulaCell>>();
          contextSheet.setFormulaCellsMap(map);
        }
        map.put(row.getId(), cellMap);
      }
      if(mergeMap.size() > 0)
      {
        List<CoverInfo> coverInfos = row.getCoverList();
        Iterator<Integer> iter = mergeMap.keySet().iterator();
        while(iter.hasNext())
        {
          Integer colId = iter.next();
          Integer[] mergeInfo = mergeMap.get(colId);
          int colSpan = mergeInfo[0] == null ? 1 : mergeInfo[0];
          int rowSpan = mergeInfo[1] == null ? 1 : mergeInfo[1];
          CoverInfo cover = new CoverInfo(row, colId, colSpan, rowSpan);
          ModelHelper.insert(coverInfos, cover);
          row.getParent().insertCoverInfoInColumn(cover, -1, -1);
        }
      }
      jg.flush();
      rawData.closeOutputStream();
      return rawData;
    }

    public void copyCurrentStructureAndInfos(JsonParser jp, JsonGenerator jg, Row row, String colId, Map<String, Map> rowInfos)
        throws IOException, JsonProcessingException
    {
      boolean isValue = false;
      JsonToken token = jp.getCurrentToken();

      Integer[] mergeInfo = null;
      int spanIndex = 0;
      // jump over field
      if (token == JsonToken.FIELD_NAME)
      {
        String fieldName = jp.getText();
        isValue = false;
        if (fieldName.compareTo("oc1") >= 0 && fieldName.compareTo("oc:") < 0)
        {
          colId = fieldName;
        }
        else if (fieldName.compareTo("co1") >= 0 && fieldName.compareTo("co:") < 0)
        {
          colId = fieldName;
        }
        else if (fieldName.equals("v"))
        {
          isValue = true;
        }
        else if(fieldName.equals(ConversionConstant.COLSPAN))
        {
          int colNumberId = ModelHelper.toNumberId(colId);
          Map<Integer, Integer[]> mergeCells = rowInfos.get("mergeCells");
          mergeInfo = mergeCells.get(colNumberId);
          if(mergeInfo == null) {
            mergeInfo = new Integer[2];
            mergeCells.put(colNumberId, mergeInfo);
          }
          spanIndex = 0;
        } 
        else if(fieldName.equals(ConversionConstant.ROWSPAN))
        {
          int colNumberId = ModelHelper.toNumberId(colId);
          Map<Integer, Integer[]> mergeCells = rowInfos.get("mergeCells");
          mergeInfo = mergeCells.get(colNumberId);
          if(mergeInfo == null) {
            mergeInfo = new Integer[2];
            mergeCells.put(colNumberId, mergeInfo);
          }
          spanIndex = 1;
        }
        
        jg.writeFieldName(jp.getCurrentName());
        token = jp.nextToken();
        if (isValue == true)
        {
          Map<Integer, FormulaCell> cellMap = rowInfos.get("formulas");
          String f = jp.getText();
          if (f.startsWith("=") && !colId.isEmpty())
          {
            int colNumberId = ModelHelper.toNumberId(colId);
            FormulaCell contextFormulaCell = new FormulaCell(row.getParent(), row.getId(), colNumberId);
            FormulaUtil.parseFormulaToken(f, contextFormulaCell, true);
            cellMap.put(colNumberId, contextFormulaCell);
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
              copyCurrentStructureAndInfos(jp, jg, row, colId, rowInfos);
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
              copyCurrentStructureAndInfos(jp, jg, row, colId, rowInfos);
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
