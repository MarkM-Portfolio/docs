package com.ibm.concord.spreadsheet.partialload.reference;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonToken;
import org.codehaus.jackson.util.TokenBuffer;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaError;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaLexer;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaParsedRef;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaRefParser;
import com.ibm.concord.spreadsheet.common.formulalexer.IDMFormulaToken;
import com.ibm.concord.spreadsheet.partialload.CellCollector;
import com.ibm.concord.spreadsheet.partialload.PartialDeserializer;
import com.ibm.concord.spreadsheet.partialload.RowColIdIndexMeta;
import com.ibm.concord.spreadsheet.partialload.SheetMeta;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * No reference.js implementation for PartialReference. Class handling formula reference related functions, reads in reference.js in Jackson
 * partial. A Jackson version of FormulaReference and ReferenceUtil class.
 */
public class NRJSPartialReference
{
  private static final Logger LOG = Logger.getLogger(NRJSPartialReference.class.getName());

  private static Integer NEG_ONE = Integer.valueOf(-1);

  // private HashMap<String, List<FormulaParsedRef>> referenceMap;
  private HashMap<String, HashMap<String, List<IDMFormulaParsedRef>>> referenceBySheetIdMap;

  private PartialDeserializer deserializer;

  private JSONObject partRefObject;

  private ArrayList<IDMFormulaParsedRef> vrefList;

  /**
   * This constructor reads in reference.js from InputStream, by using JsonParser.
   * 
   * @param referenceInputStream
   * @param jsonFactory
   * @throws IOException
   * @throws JsonParseException
   */
  public NRJSPartialReference()
  {
    partRefObject = new JSONObject();
    // referenceMap = new HashMap<String, List<FormulaParsedRef>>();
    referenceBySheetIdMap = new HashMap<String, HashMap<String, List<IDMFormulaParsedRef>>>();
    vrefList = new ArrayList<IDMFormulaParsedRef>();
  }

  public boolean isEmpty() throws JsonParseException, IOException
  {
    return referenceBySheetIdMap.isEmpty();
  }

  public void setPartialDeserializer(PartialDeserializer d)
  {
    this.deserializer = d;
  }

  /**
   * Get reference object in reference.sheets.&lt;sheetId&gt;
   * 
   * @param sheetId
   * @return
   * @throws IOException
   * @throws JsonParseException
   */
  public HashMap<String, List<IDMFormulaParsedRef>> get(String sheetId) throws JsonParseException, IOException
  {
    HashMap<String, List<IDMFormulaParsedRef>> s = referenceBySheetIdMap.get(sheetId);
    if (s == null)
    {
      return null;
    }
    return s;
  }

  public void addParsedRef(String sheetId, String rowId, String colId, List<IDMFormulaParsedRef> refs)
  {
    HashMap<String, List<IDMFormulaParsedRef>> sheetMap = referenceBySheetIdMap.get(sheetId);
    if (sheetMap == null)
    {
      sheetMap = new HashMap<String, List<IDMFormulaParsedRef>>();
      referenceBySheetIdMap.put(sheetId, sheetMap);
    }
    String rowId_colId = rowId + "_" + colId;
    sheetMap.put(rowId_colId, refs);
  }

  static int fn = 0;

  public void processFormularString(String sheetname, String sheetId, String rowId, String colId, String f)
  {
    List<IDMFormulaParsedRef> refs = parseFormularString(f, sheetname, vrefList);
    addParsedRef(sheetId, rowId, colId, refs);
  }
  public List<IDMFormulaParsedRef> parseFormularString(String f, String sheetname, ArrayList<IDMFormulaParsedRef> vrefs)
  {
    fn++;
    if (vrefs == null)
      vrefs = new ArrayList<IDMFormulaParsedRef>();
    List<IDMFormulaError> ferr = new ArrayList<IDMFormulaError>();
    // System.out.println(fn+") "+f + " sheetid:"+sheetId+" rowid:"+rowId+" colId:"+colId);
    boolean inVRef = false;
    boolean inRowColFunc = false;
    String func = null;
    int numParen = 0;
    IDMFormulaParsedRef lastRef = null;
    List<IDMFormulaToken> tokens = IDMFormulaLexer.parseq(f, ferr, IDMFormulaLexer.InternalFormulaType);
    List<IDMFormulaParsedRef> refs = new ArrayList<IDMFormulaParsedRef>();
    for (IDMFormulaToken token : tokens)
    {
       if (token.type == IDMFormulaToken.LexTokenType.FUNCTION_TYPE) 
       {
       	 func = token.getText();
       	 // for a formula like =ROW(Sheet2!1:1000), the result isn't affected by the content of Sheet2!1:1000
       	 // but in =ROW(INDIRECT(Sheet2!A1)), the value of Sheet2!A1 must be calculated
       	 // so only ignore the immediate reference in column/row functions during partial loading
         if (func.equalsIgnoreCase("row")|| func.equalsIgnoreCase("rows") 
           || func.equalsIgnoreCase("column")|| func.equalsIgnoreCase("columns"))
         {
        	inRowColFunc = true;
       	 }
       }
       
       if (inRowColFunc) 
       {
     	  if (token.subType ==  IDMFormulaToken.TokenSubtype.SEPERATOR_OPEN) 
     	  {
     		 numParen++;
     	  } 
     	  else if (token.subType ==  IDMFormulaToken.TokenSubtype.SEPERATOR_CLOSE) 
     	  {
     		 numParen--;
         	if (numParen == 0) 
         	{
              inRowColFunc = false;
         	}
     	  }
       }

      if (token.type == IDMFormulaToken.LexTokenType.OPERATOR_TYPE && token.getText() != null && token.getText().equals(":"))
      {
        if (lastRef != null)
        {
          inVRef = true;
        }
      }
      else if (token.type == IDMFormulaToken.LexTokenType.REFERENCE_TYPE)
      {
    	if (inRowColFunc && numParen == 1) // immediate parameters of row/column functions
    	{
    	  continue;
    	}
        IDMFormulaParsedRef ref = (IDMFormulaParsedRef) (token.value);
        if (ref.getSheetName() == null || ref.getSheetName().isEmpty())
        {
          ref.setSheetName(sheetname);
        }
        if (inVRef == true && lastRef != null)
        {
          if ((lastRef.getRefMask() & IDMFormulaParsedRef.IDMSS_DEFAULT_RANGE_MASK) == 0)
          {
            // 3d ref
            String startsheetname = lastRef.getSheetName();
            String endsheetname = ref.getSheetName();
            List<String> sheetnames = this.deserializer.getSheetNames(startsheetname, endsheetname);
            refs.remove(lastRef);
            for (int i=0; i < sheetnames.size() - 1; i++)
            {
              IDMFormulaParsedRef ref3d = ref.clone();
              ref3d.setSheetName(sheetnames.get(i));
              int mask = ref3d.getRefMask();
              ref3d.setRefMask(mask | IDMFormulaParsedRef.MASK_ONE_PIECE_OF_3D_RANGE);
              refs.add(ref3d);
            }
          }
          else
          {
            vrefs.add(lastRef);
            vrefs.add(ref);
            IDMFormulaParsedRef vref = IDMFormulaParsedRef.createParseRefWithType(IDMFormulaLexer.InternalFormulaType, "vref", false, sheetname, false, "", false, "", false, "",
                false, "", (ref.getRefMask() | IDMFormulaParsedRef.MASK_QUOTE_SHEETNAME)>0);
            vrefs.add(vref);
            refs.add(vref);
          }
        }
        refs.add(ref);
        lastRef = ref;
        inVRef = false;
        // System.out.println("fref:"+ref.getAddress()+" sheetId:"+sheetId + " type:"+ref.getRefType()); // yuanlin
      }
      else if (token.type == IDMFormulaToken.LexTokenType.NAME_TYPE)
      {
        IDMFormulaParsedRef ref = IDMFormulaParsedRef.createParseRefWithType(IDMFormulaLexer.InternalFormulaType, "names", false, token.getText(), false, "", false, "", false,
            "", false, "", false);
        ref.setIndex(token.getOffset());
        if (inVRef == true && lastRef != null)
        {
          vrefs.add(lastRef);
          vrefs.add(ref);
          IDMFormulaParsedRef vref = IDMFormulaParsedRef.createParseRefWithType(IDMFormulaLexer.InternalFormulaType, "vref", false, sheetname, false, "", false, "", false, "",
              false, "", false);
          vrefs.add(vref);
          refs.add(vref);
        }
        refs.add(ref);
        lastRef = ref;
        inVRef = false;
        // System.out.println("fref:"+ref.getAddress()+" sheetId:"+sheetId+ " type:"+ref.getRefType()); // yuanlin
      }
      else
      {
        lastRef = null;
        inVRef = false;
      }

    }
    // if (ferr.size() > 0)
    // System.out.println("with error: " + f);
    return refs;
  }

  public void loadSheetReference(Map<String, TokenBuffer> sheetsBuffer) throws JsonParseException, IOException
  {
    int errn = 0;
    int n = 0;
    long begintime = System.nanoTime();
    List<IDMFormulaError> ferr = new ArrayList<IDMFormulaError>();
    Set<Entry<String, TokenBuffer>> sheetBufferEntry = sheetsBuffer.entrySet();
    for (Iterator iterator = sheetBufferEntry.iterator(); iterator.hasNext();)
    {
      Entry<String, TokenBuffer> sheetEntry = (Entry<String, TokenBuffer>) iterator.next();
      String sheetId = sheetEntry.getKey();
      JsonParser contentJp = sheetEntry.getValue().asParser();
      JsonToken jsonToken = contentJp.nextToken();
      String rowId = "";
      String colId = "";
      String sheetName = getSheetNameByID(sheetId);
      while (jsonToken != null)
      {
        if (jsonToken == JsonToken.FIELD_NAME)
        {
          // save the field_name token
          String fieldName = contentJp.getText();
          if (fieldName.compareTo("or1") >= 0 && fieldName.compareTo("or:") < 0)
          {
            rowId = fieldName;
          }
          else if (fieldName.compareTo("oc1") >= 0 && fieldName.compareTo("oc:") < 0)
          {
            colId = fieldName;
          }
          else if (fieldName.compareTo("ro1") >= 0 && fieldName.compareTo("ro:") < 0)
          {
            rowId = fieldName;
          }
          else if (fieldName.compareTo("co1") >= 0 && fieldName.compareTo("co:") < 0)
          {
            colId = fieldName;
          }
          else if (fieldName.equalsIgnoreCase("v"))
          {
            jsonToken = contentJp.nextToken();
            String f = contentJp.getText();
            if (f.startsWith("=") || (f.startsWith("{=") && f.endsWith("}")))
            {
              ferr.clear();
              n++;
              processFormularString(sheetName, sheetId, rowId, colId, f);
            }
          }
          else if (fieldName.equals("rows"))
          {
            // just continue
          }
          else
          {
            jsonToken = contentJp.nextToken();
            contentJp.skipChildren();
          }
        }
        jsonToken = contentJp.nextToken();
      }
    }
    long endtime = System.nanoTime();
    // System.out.println("total spend " + (endtime - begintime) / 1e9 + "s to process " + n + " fomulas with " + errn + " errors");

  }

  /**
   * combine all the tokens with operator :(colon) to one range
   * 
   * @param left
   * @param right
   * @return
   */
  private void generateReference(JSONObject token, JSONObject left, JSONObject right)
  {
    String sSheetId = (String) left.get(ConversionConstant.SHEETID);
    String eSheetId = (String) right.get(ConversionConstant.SHEETID);
    if (sSheetId == null || eSheetId == null)
    {
      LOG.log(Level.WARNING, "ignore cell reference without sheet id, {0}", left);
      LOG.log(Level.WARNING, "ignore cell reference without sheet id, {0}", right);
      return;
    }
    String sSheet = getSheetNameByID(sSheetId);
    String eSheet = getSheetNameByID(eSheetId);

    int startRowIndex1 = -1;
    int startColIndex1 = -1;
    int endRowIndex1 = -1;
    int endColIndex1 = -1;
    String refType = (String) left.get(ConversionConstant.REFERENCE_TYPE);
    if (ConversionConstant.REF_TYPE_CELL.equals(refType))
    {
      startRowIndex1 = endRowIndex1 = deserializer.getIndexFromReference(left, ConversionConstant.ROWID_NAME);
      startColIndex1 = endColIndex1 = deserializer.getIndexFromReference(left, ConversionConstant.COLUMNID_NAME);
    }
    else
    {
      startRowIndex1 = deserializer.getIndexFromReference(left, ConversionConstant.RANGE_STARTROWID);
      startColIndex1 = deserializer.getIndexFromReference(left, ConversionConstant.RANGE_STARTCOLID);
      endRowIndex1 = deserializer.getIndexFromReference(left, ConversionConstant.RANGE_ENDROWID);
      endColIndex1 = deserializer.getIndexFromReference(left, ConversionConstant.RANGE_ENDCOLID);
    }
    // for the case that end row/column id not exists, back to cell
    // reference
    if (endRowIndex1 == deserializer.ID_IS_NULL)
    {
      endRowIndex1 = startRowIndex1;
    }
    if (endColIndex1 == deserializer.ID_IS_NULL)
    {
      endColIndex1 = startColIndex1;
    }

    if (startRowIndex1 == -1 || endRowIndex1 == -1 || startColIndex1 == -1 || endColIndex1 == -1
        || startColIndex1 == deserializer.ID_IS_NULL || startRowIndex1 == deserializer.ID_IS_NULL)
    {
      if (LOG.isLoggable(Level.INFO))
      {
        LOG.log(Level.INFO, "range address ({0}, {1}):({2}, {3}) contains #REF!, ignore, original object: {4}", new Object[] {
            startRowIndex1, startColIndex1, endRowIndex1, endColIndex1, left });
      }
      return;
    }

    int startRowIndex2 = -1;
    int startColIndex2 = -1;
    int endRowIndex2 = -1;
    int endColIndex2 = -1;
    refType = (String) right.get(ConversionConstant.REFERENCE_TYPE);
    if (ConversionConstant.REF_TYPE_CELL.equals(refType))
    {
      startRowIndex2 = endRowIndex2 = deserializer.getIndexFromReference(right, ConversionConstant.ROWID_NAME);
      startColIndex2 = endColIndex2 = deserializer.getIndexFromReference(right, ConversionConstant.COLUMNID_NAME);
    }
    else
    {
      startRowIndex2 = deserializer.getIndexFromReference(right, ConversionConstant.RANGE_STARTROWID);
      startColIndex2 = deserializer.getIndexFromReference(right, ConversionConstant.RANGE_STARTCOLID);
      endRowIndex2 = deserializer.getIndexFromReference(right, ConversionConstant.RANGE_ENDROWID);
      endColIndex2 = deserializer.getIndexFromReference(right, ConversionConstant.RANGE_ENDCOLID);
    }
    // for the case that end row/column id not exists, back to cell
    // reference
    if (endRowIndex2 == deserializer.ID_IS_NULL)
    {
      endRowIndex2 = startRowIndex2;
    }
    if (endColIndex2 == deserializer.ID_IS_NULL)
    {
      endColIndex2 = startColIndex2;
    }

    if (startRowIndex2 == -1 || endRowIndex2 == -1 || startColIndex2 == -1 || endColIndex2 == -1
        || startColIndex2 == deserializer.ID_IS_NULL || startRowIndex2 == deserializer.ID_IS_NULL)
    {
      if (LOG.isLoggable(Level.INFO))
      {
        LOG.log(Level.INFO, "range address ({0}, {1}):({2}, {3}) contains #REF!, ignore, original object: {4}", new Object[] {
            startRowIndex2, startColIndex2, endRowIndex2, endColIndex2, right });
      }
      return;
    }

    int startCol = Math.min(startColIndex1, startColIndex2);
    int startRow = Math.min(startRowIndex1, startRowIndex2);
    int endCol = Math.max(endColIndex1, endColIndex2);
    int endRow = Math.max(endRowIndex1, endRowIndex2);

    String address = "";
    if (sSheet != null)
    {
      sSheet = ReferenceParser.formatSheetName(sSheet);
      address += sSheet;
      address += ".";
    }
    address += ReferenceParser.translateCol(startCol) + startRow + ":";
    if (eSheet != null)
    {
      eSheet = ReferenceParser.formatSheetName(eSheet);
      address += eSheet;
      address += ".";
    }
    address += ReferenceParser.translateCol(endCol) + endRow;

    token.put(ConversionConstant.RANGE_ADDRESS, address);
    token.put(ConversionConstant.RANGE_STARTROWID, deserializer.rowColIdIndexMeta.getRowIdbyIndex(sSheetId, startRow));
    token.put(ConversionConstant.RANGE_ENDROWID, deserializer.rowColIdIndexMeta.getRowIdbyIndex(eSheetId, endRow));
    token.put(ConversionConstant.RANGE_STARTCOLID, deserializer.rowColIdIndexMeta.getColIdbyIndex(sSheetId, startCol));
    token.put(ConversionConstant.RANGE_ENDCOLID, deserializer.rowColIdIndexMeta.getColIdbyIndex(eSheetId, endCol));
    token.put(ConversionConstant.SHEETID, sSheetId);
  }

  private String getSheetNameByID(String sheetId)
  {
    JSONObject sheets = (JSONObject) deserializer.metaObject.get(ConversionConstant.SHEETS);
    Iterator<Map.Entry<String, JSONObject>> itor = sheets.entrySet().iterator();
    while (itor.hasNext())
    {
      Map.Entry<String, JSONObject> entry = itor.next();
      String id = entry.getKey();
      if (id.equals(sheetId))
      {
        JSONObject sheet = entry.getValue();
        return (String) sheet.get(ConversionConstant.SHEETNAME);
      }
    }
    return null;
  }

  public List<IDMFormulaParsedRef> get(String sheetId, String rowId, String colId) throws JsonParseException, IOException
  {
    HashMap<String, List<IDMFormulaParsedRef>> s = get(sheetId);
    if (s != null)
    {
      String newId = rowId + "_" + colId;
      List<IDMFormulaParsedRef> refs = s.get(newId);
      if (refs != null && refs.size() > 0)
        return refs;
    }
    return null;
  }

  /**
   * Copied from FormulaReference.
   * 
   * @param sheetId
   * @param rowId
   * @param columnId
   * @param formula
   * @param rowColIdIndexMeta
   * @param sheetMeta
   * @return
   * @throws JsonParseException
   * @throws IOException
   */
  public String updateFormula(String sheetId, String rowId, String columnId, String formula, RowColIdIndexMeta rowColIdIndexMeta,
      SheetMeta sheetMeta) throws JsonParseException, IOException
  {
    int copyStartIndex = 0;
    int length = formula.length();
    StringBuffer updatedFormula = new StringBuffer();
    List<IDMFormulaParsedRef> refJSONArray = get(sheetId, rowId, columnId);
    if (refJSONArray != null)
    {
      // sort formula token array by token index
      Object[] sortRefArray = ReferenceUtil.sort(refJSONArray.toArray(), ConversionConstant.FORMULA_TOKEN_INDEX, true);

      for (int i = 0; i < sortRefArray.length; i++)
      {
        try
        {
          JSONObject tokenJSON = (JSONObject) sortRefArray[i];
          // copy part of the formula which does not related with the
          // tokens
          int tokenIndex = Integer.parseInt(tokenJSON.get(ConversionConstant.FORMULA_TOKEN_INDEX).toString());
          String tokenType = tokenJSON.get(ConversionConstant.REFERENCE_TYPE).toString();
          // process the virtual reference
          if (tokenIndex < 0)
          {
            // just need to update the virtual reference address;
            if ((tokenType.equals(ConversionConstant.CELL_REFERENCE)) || (tokenType.equals(ConversionConstant.RANGE_REFERENCE)))
            {
              ReferenceUtil.updateRangeAddressWhenFlush2Doc(tokenJSON, rowColIdIndexMeta, sheetMeta);
            }
            continue;
          }
          updatedFormula.append(formula.substring(copyStartIndex, tokenIndex));

          // get cell address by cell id
          String tokenAddress = "";
          String updatedTokenAddress = "";
          // TODO: get absolute or relative cell address by the text
          // of token
          if ((tokenType.equals(ConversionConstant.CELL_REFERENCE)) || (tokenType.equals(ConversionConstant.RANGE_REFERENCE)))
          {
            tokenAddress = (String) tokenJSON.get(ConversionConstant.RANGE_ADDRESS);
            updatedTokenAddress = ReferenceUtil.updateRangeAddressWhenFlush2Doc(tokenJSON, rowColIdIndexMeta, sheetMeta);
          }
          else if (tokenType.equals(ConversionConstant.NAMES_REFERENCE))
          {
            tokenAddress = (String) tokenJSON.get(ConversionConstant.NAME_RANGE);
            updatedTokenAddress = tokenAddress;
          }
          // copy the updated tokens to the updatedFormula
          copyStartIndex = tokenIndex + tokenAddress.length();
          String oldToken = tokenAddress;
          if (copyStartIndex >= length)
            oldToken = formula.substring(tokenIndex);
          else
            oldToken = formula.substring(tokenIndex, copyStartIndex);
          if (oldToken.equals(tokenAddress))
          {
            int updateTokenIndex = updatedFormula.length();
            updatedFormula.append(updatedTokenAddress);
            // also update the reference model with new token
            // address and token index
            tokenJSON.put(ConversionConstant.RANGE_ADDRESS, updatedTokenAddress);
            tokenJSON.put(ConversionConstant.FORMULA_TOKEN_INDEX, updateTokenIndex);
          }
          else
          {
            LOG.log(Level.WARNING, "=============the cell at < sheetId :" + sheetId + " rowId : " + rowId + " columnId : " + columnId
                + " > has the formula + " + formula + " which does not contain the cell address " + tokenAddress);
          }
        }
        catch (Exception e)
        {
          LOG.log(Level.WARNING, "error occurred when update the formula by the token", e);
        }
      }
    }
    // copy the end part of the original formula to the updatedFormula
    if (copyStartIndex < formula.length())
      updatedFormula.append(formula.substring(copyStartIndex));
    return updatedFormula.toString();
  }

  /**
   * Collect impact cells of sheet "sheetId". It only collects 1st level impact cells, the collected cells' reference is not collected.
   * 
   * @param criteriaRowIdSet
   * 
   * @param sheetId
   * @param cellCollector
   *          the referenced cells collected
   * @return
   * @throws IOException
   * @throws JsonParseException
   */
  public CellCollector collectImpactCells(String criteriaSheetId, Set<String> criteriaRowIdSet, CellCollector cellCollector,
      PartialDeserializer d) throws JsonParseException, IOException
  {
    CellCollector impactCellCollector = new CellCollector();
    Set<Map.Entry<String, HashMap<String, List<IDMFormulaParsedRef>>>> entries = referenceBySheetIdMap.entrySet();
    boolean sheetCollected, rowCollected, cellCollected;
    String sheetId, rowId, columnId;

    // String refSheetId = null;
    // String refStartRowId = null;
    // String refEndRowId = null;
    // String refStartColId = null;
    // String refEndColId = null;
    String refRowId = null;
    String refColId = null;
    // String refType = null;
    // String refAddr = null;
    // String refName = null;
    // int refIndex = 1;
    JSONObject metaObject = d.metaObject;
    SheetMeta sheetMeta = new SheetMeta((JSONObject) metaObject.get(ConversionConstant.SHEETS),
        (JSONArray) metaObject.get(ConversionConstant.SHEETSIDARRAY));

    Set<String> nameSet = d.getNameRangeSet();

    for (Iterator iterator = entries.iterator(); iterator.hasNext();)
    {
      Entry<String, HashMap<String, List<IDMFormulaParsedRef>>> entry = (Entry<String, HashMap<String, List<IDMFormulaParsedRef>>>) iterator
          .next();
      sheetId = entry.getKey();
      if (sheetId.equals(criteriaSheetId))
      {
        continue;
      }
      HashMap<String, List<IDMFormulaParsedRef>> referenceRefs = entry.getValue();
      Set<Entry<String, List<IDMFormulaParsedRef>>> refentries = (Set<Entry<String, List<IDMFormulaParsedRef>>>) referenceRefs.entrySet();
      for (Iterator refiterator = refentries.iterator(); refiterator.hasNext();)
      {
        Entry<String, List<IDMFormulaParsedRef>> refentry = (Entry<String, List<IDMFormulaParsedRef>>) refiterator.next();
        String[] rowId_colId = refentry.getKey().split("_");
        refRowId = rowId_colId[0];
        refColId = rowId_colId[1];
        List<IDMFormulaParsedRef> parsedRefs = refentry.getValue();
        cellCollector.lookingSheet(sheetId);
        cellCollector.lookingRow(refRowId);
        cellCollected = cellCollector.lookingCell(refColId);
        if (cellCollected)
          continue;
        boolean bCollect = false;
        JSONArray impactRef = new JSONArray();
        for (IDMFormulaParsedRef parsedRef : parsedRefs)
        {
          int mask = parsedRef.getRefMask();
          // ignore 3d reference part
//          if ( (mask & IDMFormulaParsedRef.MASK_ONE_PIECE_OF_3D_RANGE)>0 )
//            continue;
          int refStartRowIndex = parsedRef.getIntStartRow();
          int refStartColIndex = parsedRef.getIntStartCol();
          String refsheetname = parsedRef.getSheetName();
          String refSheetId = sheetMeta.getSheetIdByName(refsheetname);
          if (refSheetId == null || refSheetId.isEmpty())
          {
            refSheetId = sheetId;
          }
          String refStartRowId = deserializer.rowColIdIndexMeta.getRowIdbyIndex(refSheetId, refStartRowIndex);
          String refStartColId = deserializer.rowColIdIndexMeta.getColIdbyIndex(refSheetId, refStartColIndex);
          String refType = parsedRef.getRefType();
          String refAddr = parsedRef.getAddress();
          int refIndex = parsedRef.getIndex();
          boolean collect = false;
          if (criteriaRowIdSet == null || PartialDeserializer.IGNORE_IMPACT_CELLS_IN_CRITERIA_SHEET)
          {
            if (refSheetId != null && refSheetId.equals(criteriaSheetId))
            {
              collect = true;
            }
          }
          else
          {
            if (refStartRowId != null && criteriaRowIdSet.contains(refStartRowId))
            {
              collect = true;
            }
            else if (refRowId != null && criteriaRowIdSet.contains(refRowId))
            {
              collect = true;
            }
          }
          if (collect)
          {
            bCollect = true;
            d.updatePartSheetsArray(sheetId, refRowId, refColId, -1, -1);
            impactCellCollector.collectCell(sheetId, refRowId, refColId);
          }
          //  do not put 3d reference to reference.js 
          if ( (mask & IDMFormulaParsedRef.MASK_ONE_PIECE_OF_3D_RANGE)>0 )
            continue;

          JSONObject ref = new JSONObject();
          ref.put(ConversionConstant.REFERENCE_TYPE, refType);
          ref.put(ConversionConstant.FORMULA_TOKEN_INDEX, refIndex);
          if (refType.equals(ConversionConstant.CELL_REFERENCE))
          {
            ref.put(ConversionConstant.RANGE_ADDRESS, refAddr);
            ref.put(ConversionConstant.SHEETID, refSheetId);
            ref.put(ConversionConstant.ROWID_NAME, refStartRowId);
            ref.put(ConversionConstant.COLUMNID_NAME, refStartColId);
            impactRef.add(ref);
          }
          else if (refType.equals(ConversionConstant.NAME_RANGE))
          {
              ref.put(ConversionConstant.NAME_RANGE, refsheetname);
              impactRef.add(ref);
          }
          else if (refType.equals(ConversionConstant.RANGE_REFERENCE))
          {
            ref.put(ConversionConstant.RANGE_ADDRESS, refAddr);
            ref.put(ConversionConstant.SHEETID, refSheetId);
            ref.put(ConversionConstant.RANGE_STARTROWID, refStartRowId);
            ref.put(ConversionConstant.RANGE_STARTCOLID, refStartColId);
            int refEndRowIndex = parsedRef.getIntEndRow();
            int refEndColIndex = parsedRef.getIntEndCol();
            String refEndRowId = deserializer.rowColIdIndexMeta.getRowIdbyIndex(refSheetId, refEndRowIndex);
            String refEndColId = deserializer.rowColIdIndexMeta.getColIdbyIndex(refSheetId, refEndColIndex);
            ref.put(ConversionConstant.RANGE_ENDROWID, refEndRowId);
            ref.put(ConversionConstant.RANGE_ENDCOLID, refEndColId);
            impactRef.add(ref);
          }
          else if (refType.equals(IDMFormulaRefParser.ROWS))
          {
            ref.put(ConversionConstant.REFERENCE_TYPE, ConversionConstant.RANGE_REFERENCE);
            ref.put(ConversionConstant.RANGE_ADDRESS, refAddr);
            ref.put(ConversionConstant.SHEETID, refSheetId);
            ref.put(ConversionConstant.RANGE_STARTROWID, refStartRowId);
            ref.put(ConversionConstant.RANGE_STARTCOLID, refStartColId);
            int refEndRowIndex = parsedRef.getIntEndRow();
            int refEndColIndex = parsedRef.getIntEndCol();
            String refEndRowId = deserializer.rowColIdIndexMeta.getRowIdbyIndex(refSheetId, refEndRowIndex);
            String refEndColId = ConversionConstant.MAX_REF;
            ref.put(ConversionConstant.RANGE_ENDROWID, refEndRowId);
            ref.put(ConversionConstant.RANGE_ENDCOLID, refEndColId);
            impactRef.add(ref);
          }
          else if (refType.equals(IDMFormulaRefParser.COLS))
          {
            ref.put(ConversionConstant.REFERENCE_TYPE, ConversionConstant.RANGE_REFERENCE);
            ref.put(ConversionConstant.RANGE_ADDRESS, refAddr);
            ref.put(ConversionConstant.SHEETID, refSheetId);
            ref.put(ConversionConstant.RANGE_STARTROWID, refStartRowId);
            ref.put(ConversionConstant.RANGE_STARTCOLID, refStartColId);
            int refEndRowIndex = parsedRef.getIntEndRow();
            int refEndColIndex = parsedRef.getIntEndCol();
            String refEndRowId = ConversionConstant.MAX_REF;
            String refEndColId = deserializer.rowColIdIndexMeta.getColIdbyIndex(refSheetId, refEndColIndex);
            ref.put(ConversionConstant.RANGE_ENDROWID, refEndRowId);
            ref.put(ConversionConstant.RANGE_ENDCOLID, refEndColId);
            impactRef.add(ref);
          }
        }
        if (bCollect)
        {
          writeRefs(impactRef, sheetId, refRowId, refColId);
        }
      }
    }
    return impactCellCollector;
  }
  /**
   * partialRefObject is the partial reference json object corresponding to the formula cell in the partial content
   * 
   * @param obj
   */
  public JSONObject getPartRefObj()
  {
    return partRefObject;
  }

  public void resetPartReferenceObject()
  {
    partRefObject = new JSONObject();
  }

  public void writeReference(String refSheetId, String refRowId, String refColId, JSONObject referenceObject)
  {
    JSONObject sheet = (JSONObject) partRefObject.get(refSheetId);
    if (sheet == null)
    {
      sheet = new JSONObject();
      partRefObject.put(refSheetId, sheet);
    }
    JSONObject row = (JSONObject) sheet.get(refRowId);
    if (row == null)
    {
      row = new JSONObject();
      sheet.put(refRowId, row);
    }
    JSONObject cell = (JSONObject) row.get(refColId);
    if (cell == null)
    {
      cell = new JSONObject();
      row.put(refColId, cell);
    }
    JSONArray refs = (JSONArray) cell.get(ConversionConstant.CELLS);
    if (refs == null)
    {
      refs = new JSONArray();
      cell.put(ConversionConstant.CELLS, refs);
    }
    refs.add(referenceObject);
  }

  public void writeRefs(JSONArray referenceArray, String shId, String roId, String coId)
  {
    JSONObject sheet = (JSONObject) partRefObject.get(shId);
    if (sheet == null)
    {
      sheet = new JSONObject();
      partRefObject.put(shId, sheet);
    }
    JSONObject row = (JSONObject) sheet.get(roId);
    if (row == null)
    {
      row = new JSONObject();
      sheet.put(roId, row);
    }
    JSONObject cell = new JSONObject();
    cell.put(ConversionConstant.CELLS, referenceArray);
    row.put(coId, cell);
  }

  public boolean hasUnParsedVRefs()
  {
    if (vrefList.size() > 0)
      return true;
    return false;
  }

  public int[] parseNameRange(String name)
  {
    int[] ret = new int[4];
    JSONObject referenceObject;
    try
    {
      referenceObject = deserializer.getNameRange(name);
      ret[0] = deserializer.getIndexFromReference(referenceObject, ConversionConstant.RANGE_STARTROWID);
      ret[1] = deserializer.getIndexFromReference(referenceObject, ConversionConstant.RANGE_STARTCOLID);
      ret[2] = deserializer.getIndexFromReference(referenceObject, ConversionConstant.RANGE_ENDROWID);
      ret[3] = deserializer.getIndexFromReference(referenceObject, ConversionConstant.RANGE_ENDCOLID);
      // for the case that end row/column id not exists, back to cell reference
      if (ret[2] == deserializer.ID_IS_NULL)
      {
        ret[2] = ret[0];
      }
      if (ret[3] == deserializer.ID_IS_NULL)
      {
        ret[3] = ret[1];
      }
    }
    catch (Exception e)
    {
      return null;
    }
    return ret;
  }
  public void parseVRefs()
  {
    getParsedVRef(vrefList);
  }
  public ArrayList<IDMFormulaParsedRef> getParsedVRef(ArrayList<IDMFormulaParsedRef> vrefs)
  {
    ArrayList<IDMFormulaParsedRef> parsedrefs = new ArrayList<IDMFormulaParsedRef>();
    for (int i = 0; i < vrefs.size(); i += 3)
    {
      IDMFormulaParsedRef startref = vrefs.get(i);
      IDMFormulaParsedRef endref = vrefs.get(i + 1);
      IDMFormulaParsedRef vref = vrefs.get(i + 2);
      int[] range1 = new int[4];
      int[] range2 = new int[4];
      if (startref.getRefType().equals("names"))
      {
        range1 = parseNameRange(startref.getSheetName());
      }
      else
      {
        range1[0] = Math.min(startref.getIntStartRow(),startref.getIntEndRow());
        range1[1] = Math.min(startref.getIntStartCol(),startref.getIntEndCol());
        range1[2] = Math.max(startref.getIntStartRow(),startref.getIntEndRow());
        range1[3] = Math.max(startref.getIntStartCol(),startref.getIntEndCol());
      }
      if (endref.getRefType().equals("names"))
      {
        range2 = parseNameRange(endref.getSheetName());
      }
      else
      {
        range2[0] = Math.min(endref.getIntStartRow(),endref.getIntEndRow());
        range2[1] = Math.min(endref.getIntStartCol(),endref.getIntEndCol());
        range2[2] = Math.max(endref.getIntStartRow(),endref.getIntEndRow());
        range2[3] = Math.max(endref.getIntStartCol(),endref.getIntEndCol());
      }
      if (range1 != null && range2 != null)
      {
          vref.setRefType("range");
          vref.setSheetName(startref.getSheetName());
          vref.setStartRow(Math.min(range1[0], range2[0]) - 1);
          vref.setStartCol(Math.min(range1[1], range2[1]) - 1);
          vref.setEndRow(Math.max(range1[2], range2[2]) - 1);
          vref.setEndCol(Math.max(range1[3], range2[3]) - 1);
          parsedrefs.add(vref);
      }
    }
    return parsedrefs;
  }
}
