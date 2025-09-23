/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.index;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;
import java.util.TreeSet;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.w3c.dom.Node;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;

public class JsonToODSIndex
{

  private HashMap<String, Object> objectMap = null;
  private Map<String, Set<PreserveNameIndex>> preservedMap = null;
//  private Map<String, Set<PreserveNameIndex>> validations = null;  
  private Map<String, String> groupPreservedMap = null;
  private Map<String, Boolean> cellChangeMap = null;
  private Map<String, Boolean> cellHasWholeRowColRef = null;
  private Map<String, Boolean> cellDefaultFormatMap = null;
  private List<String> preservedList = null;
  private List<IndexRange> defaultFormattingList = null;
  private Map<String, PreserveNameIndex> groupPreservedIndexMap = null;
  private Map<String, String> stylePolicyMap = null;
  private Map<String, List<String>> columnCellMap = null;
  private Map<String, String> mergeColumnCellMap = null;
  private Map<String, List<Range>> cellImageMap = null;
  private Map<String, Range> commentsMap = null;
//  private IdToODSDOMNodeLocator odfDomLocator = null;
  private IdToNodeLocator odfDomLocator = null;
  private Node node;
  private Map<String,Integer> rowColRNMap = null;
  
  public JsonToODSIndex(ConversionContext context, Document jsonDoc, OdfDocument odfdoc)
  {
    objectMap = new HashMap<String, Object>();
    preservedMap = new HashMap<String, Set<PreserveNameIndex>>();
//    validations =  new HashMap<String, Set<PreserveNameIndex>>();
    groupPreservedMap = new HashMap<String,String>();
    cellChangeMap = new HashMap<String,Boolean>();
    cellHasWholeRowColRef = new HashMap<String, Boolean>();
    cellDefaultFormatMap = new HashMap<String,Boolean>();
    groupPreservedIndexMap = new HashMap<String,PreserveNameIndex>();
    preservedList = new ArrayList<String>();
    defaultFormattingList = new ArrayList<IndexRange>();
    stylePolicyMap = new HashMap<String,String>();
    columnCellMap = new HashMap<String,List<String>>();
    mergeColumnCellMap = new HashMap<String,String>();
    cellImageMap = new HashMap<String,List<Range>>();
    commentsMap = new HashMap<String,Range>();
    rowColRNMap = new HashMap<String, Integer>();
    context.put("DefaultFormattingRange", defaultFormattingList);
    context.put("StylePolicy", stylePolicyMap);
    context.put("columnCellMap", columnCellMap);
    context.put("MergeColumnCellMap", mergeColumnCellMap);
    indexJsonDataObject(context,jsonDoc);
    indexImageData(jsonDoc);
    indexPreserveData(jsonDoc);
    indexStylePolicy(context, jsonDoc);
//    odfDomLocator = new IdToODSDOMNodeLocator(context,jsonDoc,odfdoc);
    context.put("ODSIndex", this);
    odfDomLocator = new IdToNodeLocator(context,jsonDoc,odfdoc);
    node = odfDomLocator.getDocument();
  }

  public Node getDocuemnt()
  {
    return node;
  }
  
  private void indexStylePolicy(ConversionContext context, Document doc)
  {
    int length = doc.sheetList.size();
    for (int sheetIndex = 0; sheetIndex < length; sheetIndex++)
    {
      ConversionUtil.Sheet sheet = doc.sheetList.get(sheetIndex);
      List<String> rowList = sheet.rowIdArray;
      int size = rowList.size();
      for(int rIdx = 0; rIdx < size; rIdx++)
      {
        String rowId = rowList.get(rIdx);
        Row row = (Row) this.getJsonDataObject(rowId);
        List<String> colList = sheet.columnIdArray;
        int colSize = colList.size();
        for( int colIdx = 0; colIdx < colSize; colIdx ++ )
        {
          String colId = colList.get(colIdx);
          String cellId = IndexUtil.generateCellId(rowId, colId);
          if(cellId != null && !"".equals(cellId))
          {
            Cell cell = IndexUtil.getCellByIndex(context,sheet,row,colIdx);
            if( null != cell && null != cell.styleId)
            {
              if(isDefaultFormatting(context,sheet.sheetId, rIdx,colIdx))
              {
                stylePolicyMap.put(cell.styleId, "OverWrite");
                setDefaultFormatting(cellId);
              }
            }
          }
        }
      }
    }
  }

  public boolean isDefaultFormatting(ConversionContext context,String sheetId, int rowIndex, int columnIdx)
  {
    List<IndexRange> defaultRange = (List<IndexRange>) context.get("DefaultFormattingRange");
    boolean isDefaultFormatting = false;
    Iterator<IndexRange> rIt = defaultRange.iterator();

    
    if(rowIndex == -1)
    {
      while(rIt.hasNext())
      {
        IndexRange ir = rIt.next();
        if(!ir.sheetId.equals(sheetId))
          continue;
        if(ir.startRowIndex != -1)
          continue;
        int realColIdx = columnIdx+ 1;
        if(realColIdx >= ir.startColIndex && realColIdx <= ir.endColIndex)
        {
          isDefaultFormatting = true;
          break;
        }
      }
    }
    else
    {
      while(rIt.hasNext())
      {
        IndexRange ir = rIt.next();
        if(!ir.sheetId.equals(sheetId))
          continue;
        int realRowIdx = rowIndex+ 1;
        int realColIdx = columnIdx+ 1;
        if( realRowIdx < ir.startRowIndex || ir.endRowIndex!= -1 && ir.endRowIndex < realRowIdx )
          continue;
        if( realColIdx < ir.startColIndex || ir.endColIndex!= -1 && ir.endColIndex < realColIdx )
          continue;
        else
        {
          isDefaultFormatting = true;
          break;
        }
      }  
    }
    
    return isDefaultFormatting;
  }
  
  public boolean isDefaultFormatting(String cellId)
  {
    if(cellDefaultFormatMap.containsKey(cellId))
      return cellDefaultFormatMap.get(cellId);
    return false;
  }
  
  public void setDefaultFormatting(String cellId)
  {
    cellDefaultFormatMap.put(cellId, true);
  }

  public Set<PreserveNameIndex> getPreserveData(String id)
  {
    return preservedMap.get(id);
  }
  
//  public Map<String, Set<PreserveNameIndex>> getDataValidations()
//  {
//    return validations;
//  }
  
  public boolean containsPreserveObjInCell(String cellId)
  {
    return preservedMap.containsKey(cellId);
  }
  
  public boolean containsPreserveObjInRow(String rowId)
  {
    boolean containsPreserveObject = false;
    String prefix = rowId + "_";
    Iterator<String> keySet = preservedMap.keySet().iterator();
    while(keySet.hasNext())
    {
      String key = keySet.next();
      if(key.startsWith(prefix))
      {
        containsPreserveObject = true;
        break;
      }
    }
    return containsPreserveObject;
  }
  
  public boolean isPreservedRow(String rowId)
  {
    return preservedList.contains(rowId);
  }
  
  private void indexImageData(Document doc)
  {
    List<Range> unames = doc.unnameList;
    int length = unames.size();
    for( int  i = 0; i< length; i++)
    {
      Range range = unames.get(i);
      RangeType type = range.usage;
      switch(type)
      {
        case IMAGE:
        case CHART_AS_IMAGE:
        case CHART:
        {
          if(ConversionUtil.hasValue(range.startRowId) && ConversionUtil.hasValue(range.startColId) )
          {
            List<Range> rangeList  = null;
            DrawFrameRange iRange = (DrawFrameRange)range;
            if(ConversionUtil.isAnchorToPage(iRange))
            {
              rangeList = cellImageMap.get(range.sheetId);
              if(rangeList == null)
              {
                rangeList = new ArrayList<Range>();
                cellImageMap.put(range.sheetId, rangeList);
              }
            }
            else
            {
              String cellId = IndexUtil.generateCellId(range.startRowId, range.startColId);
              rangeList = cellImageMap.get(cellId);
              if(rangeList == null)
              {
                rangeList = new ArrayList<Range>();
                cellImageMap.put(cellId, rangeList);
              }
            }
            rangeList.add(range);
          }
          break;
        }
        case COMMENT:
        {
          String cellId = IndexUtil.generateCellId(range.startRowId, range.startColId);
          commentsMap.put(cellId, range);
          break;
        }
        default:
          break;
      }
    }
  }
  
  public Range getCommentsByContainerId(String cellId)
  {
    return commentsMap.get(cellId);
  }
  
  public boolean containsComments(String cellId)
  {
    return commentsMap.containsKey(cellId);
  }
  public Map<String, Range> getCommentsMap()
  {
    return commentsMap;
  }
  public List<Range> getImageByContainerId(String cellId)
  {
    return cellImageMap.get(cellId);
  }
  
  public boolean containsImage(String cellId)
  {
    return cellImageMap.containsKey(cellId);
  }
  
  public boolean containsImageInRow(String rowId)
  {
    Iterator<String> keys = cellImageMap.keySet().iterator();
    while(keys.hasNext())
    {
      String key = keys.next();
      if(key.startsWith(rowId+ "_"))
        return true;
    }
    return false;
  }
  
  private void indexPreserveData(Document doc)
  {
    JSONObject preserveData = doc.docPreserveJSON;
    if(preserveData == null)
      return;
    Iterator<Entry> pdata = preserveData.entrySet().iterator();
    while( pdata.hasNext())
    {
      Entry typeEntry = pdata.next();
      String typeIdKey = (String)typeEntry.getKey();
      if(ConversionConstant.PRESERVE_RANGE.equals(typeIdKey))
      {
        JSONObject typeId =  (JSONObject) typeEntry.getValue();
        Iterator types = typeId.entrySet().iterator();
        while(types.hasNext())
        {
          Entry idEntry = (Entry) types.next();
          String eleIdKey = (String) idEntry.getKey();
          JSONObject ids = (JSONObject) idEntry.getValue();
          Iterator idElements = ids.entrySet().iterator();
          
          Set<PreserveNameIndex> elist = preservedMap.get(eleIdKey);
//          Set<PreserveNameIndex> vlist = validations.get(eleIdKey);
          
          while(idElements.hasNext())
          {
            Entry idEleEntry = (Entry) idElements.next();
            
            JSONObject it = (JSONObject) idEleEntry.getValue();
            String attr = (String) it.get(ConversionConstant.RANGE_ATTRIBUTE);
            String startRowId = (String) it.get(ConversionConstant.RANGE_STARTROWID);
            String endRowId = (String) it.get(ConversionConstant.RANGE_ENDROWID);
            String startColId = (String) it.get(ConversionConstant.RANGE_STARTCOLID);
            String endColId = (String) it.get(ConversionConstant.RANGE_ENDCOLID);
            String usage = (String) it.get(ConversionConstant.RANGE_USAGE);
            String address = (String) it.get(ConversionConstant.RANGE_ADDRESS);
            JSONObject data = (JSONObject) it.get(ConversionConstant.DATAFILED);
            RangeType type = RangeType.valueOf(usage.toUpperCase());
            PreserveNameIndex nameIndex = new PreserveNameIndex(eleIdKey,(String)idEleEntry.getKey(),type);
            nameIndex.startRowId = startRowId;
            nameIndex.endRowId = endRowId ;
            nameIndex.attrName = attr;
            nameIndex.address = address;
            nameIndex.startColId = startColId;
            nameIndex.endColId = endColId;
            if(null != data)
              nameIndex.data = data;
            if("child".equals(attr))
            {
              ReferenceParser.ParsedRef ref = ReferenceParser.parse(address);
              boolean bSet = false;
              if(ref != null)
              {
                //deal with the range address of whole row/column refrence such as A:B, 1:1
                //and here the child attribute only used for row/column group which reference is whole row/column reference
                ReferenceParser.ParsedRefType refType = ref.getType();
                boolean bRow = (ReferenceParser.ParsedRefType.ROW == refType);
                boolean bCol = (ReferenceParser.ParsedRefType.COLUMN == refType);
                if(bRow || bCol)
                {
                  if(bRow && startRowId!=null)
                  {
                    nameIndex.startRowId = startRowId;
                    if(endRowId == null)
                      endRowId = startRowId;
                    nameIndex.endRowId = endRowId;
                    groupPreservedMap.put(startRowId, eleIdKey);
                    groupPreservedMap.put(endRowId, eleIdKey);
                    groupPreservedIndexMap.put(eleIdKey, nameIndex);
                    bSet = true;
                  }else if(bCol && startColId != null)
                  {
                    nameIndex.startColId = startColId;
                    if(endColId == null)
                      endColId = startColId;
                    nameIndex.endColId = endColId;
                    groupPreservedMap.put(startColId, eleIdKey);
                    groupPreservedMap.put(endColId, eleIdKey);
                    groupPreservedIndexMap.put(eleIdKey, nameIndex);
                    bSet = true;
                  }
                }
              }
              if(!bSet){
              if(startRowId!=null && endRowId!= null)
              {
                nameIndex.startRowId = startRowId;
                nameIndex.endRowId = endRowId;
                groupPreservedMap.put(startRowId, eleIdKey);
                groupPreservedMap.put(endRowId, eleIdKey);
                groupPreservedIndexMap.put(eleIdKey, nameIndex);
              }
              else if(startRowId!=null && endRowId == null && startColId == null)
              {
                nameIndex.startRowId = startRowId;
                nameIndex.endRowId = startRowId;
                groupPreservedMap.put(startRowId, eleIdKey);
                groupPreservedIndexMap.put(eleIdKey, nameIndex);
              }
              if(startColId!=null && endColId!= null)
              {
                nameIndex.startColId = startColId;
                nameIndex.endColId = endColId;
                groupPreservedMap.put(startColId, eleIdKey);
                groupPreservedMap.put(endColId, eleIdKey);
                groupPreservedIndexMap.put(eleIdKey, nameIndex);
              }
              else if(startColId!=null && endColId == null && startRowId == null)
              {
                nameIndex.startRowId = startColId;
                nameIndex.endRowId = startColId;
                groupPreservedMap.put(startColId, eleIdKey);
                groupPreservedIndexMap.put(eleIdKey, nameIndex);
              }
              }
            }
            switch(type)
            {
              case ANCHOR:
              {
                preservedList.add(nameIndex.startRowId);
                break;
              }
              case DELETE:
              {
                if(null == nameIndex.address || nameIndex.address.contains("#REF!"))
                {
                  
                }
                else
                  preservedList.add(nameIndex.startRowId);
                break;
              }
//              case VALIDATION_REF:
//              {
//                if(vlist == null)
//                  vlist = new LinkedHashSet<PreserveNameIndex>();
//                vlist.add(nameIndex);
//                break;
//              }
              default:
                break;
            }
            
            if(elist == null)
              elist = new LinkedHashSet<PreserveNameIndex>();
            
            String cellId = IndexUtil.generateCellId(startRowId, startColId);
            if(cellId == null)
            {
              if(type==RangeType.CHART)
                elist.add(nameIndex);
               continue;
            }
            elist.add(nameIndex);
            
            Set<PreserveNameIndex> list = preservedMap.get(cellId);
            if(list == null)
              list = new TreeSet<PreserveNameIndex>(new PreserveNameComparator());
            if((endRowId == null || endRowId.equals(startRowId) )&& (endColId == null || endColId.equals(startColId)))
              list.add(nameIndex);
            preservedMap.put(cellId, list);
          }
//          if(null != vlist )
//            validations.put(eleIdKey, vlist);
          preservedMap.put(eleIdKey, elist);
        }
      }
      else if(ConversionConstant.STYLE.equals(typeIdKey))
      {
        JSONObject typeId =  (JSONObject) typeEntry.getValue();
        Iterator types = typeId.entrySet().iterator();
        while(types.hasNext())
        {
          Entry idEntry = (Entry) types.next();
          String sheetId = (String)idEntry.getKey();
          JSONObject st = (JSONObject) idEntry.getValue();
          Iterator sheets = st.entrySet().iterator();
          while(sheets.hasNext())
          {
            Entry stEntry = (Entry) sheets.next();
            String rangeId = (String) stEntry.getKey();
            IndexRange range = new IndexRange();
            range.sheetId = sheetId;
            JSONObject rangeAttrs = (JSONObject) stEntry.getValue();
            range.rangeId = rangeId;
            Number startRow = (Number) rangeAttrs.get("startrow");
            if(startRow != null)
              range.startRowIndex = startRow.intValue();
            Number endRow = (Number) rangeAttrs.get("endrow");
            if(endRow != null)
              range.endRowIndex = endRow.intValue();
            Number startCol = (Number) rangeAttrs.get("startcol");
            if(startCol != null)
              range.startColIndex = startCol.intValue();
            Number endCol = (Number) rangeAttrs.get("endcol");
            if(endCol != null)
              range.endColIndex = endCol.intValue();
            defaultFormattingList.add(range);
          }
        }
      }
      else if(ConversionConstant.REFERENCEVALUE.equals(typeIdKey))
      {
        JSONObject typeId =  (JSONObject) typeEntry.getValue();
        Iterator types = typeId.entrySet().iterator();
        while(types.hasNext())
        {
          Entry idEntry = (Entry) types.next();
          JSONObject st = (JSONObject) idEntry.getValue();
          Iterator sheets = st.entrySet().iterator();
          while(sheets.hasNext())
          {
            Entry stEntry = (Entry) sheets.next();
            String rowId = (String) stEntry.getKey();
            JSONObject cols = (JSONObject) stEntry.getValue();
            Iterator colIt = cols.entrySet().iterator();
            while(colIt.hasNext())
            {
              Entry colEntry = (Entry) colIt.next();
              String colId = (String) colEntry.getKey();
              Object v = colEntry.getValue();
              Boolean bChange = false;
              Boolean bWholeRowColReference = false;
              if(v instanceof Boolean)//old format for value change, "co1":true
              {
                bChange = (Boolean)v;
              }else if(v instanceof Long)
              {
                long value = (Long)v;
                bChange = (value & 0x1 ) > 0;
                bWholeRowColReference = (value & 0x2) > 0;
              }else if(v instanceof Integer)
              {
                int value = (Integer)v;
                bChange = (value & 0x1 ) > 0;
                bWholeRowColReference = (value & 0x2) > 0;
              }
              if(bChange || bWholeRowColReference)
              {
                String id = IndexUtil.generateCellId(rowId, colId);
                if(bChange)
                  cellChangeMap.put(id, bChange);
                if(bWholeRowColReference)
                  cellHasWholeRowColRef.put(id, bWholeRowColReference);
              }
            }
          }
        }
      }
    }
  }
  
  public String getGroupId(String rowId)
  {
    return groupPreservedMap.get(rowId);
  }
  
  public boolean isCellContainWholeRowColRef(String cellId)
  {
    if(cellHasWholeRowColRef.containsKey(cellId))
      return cellHasWholeRowColRef.get(cellId);
    return false;
  }
  public boolean isCellChanged(String cellId)
  {
    if(cellChangeMap.containsKey(cellId))
      return cellChangeMap.get(cellId);
    if(cellDefaultFormatMap.containsKey(cellId))
      return cellDefaultFormatMap.get(cellId);
    Set<PreserveNameIndex> ids = this.getPreserveData(cellId);
    boolean isChanged = true;
    if(ids == null)
      return isChanged;
    for(PreserveNameIndex indexName: ids)
    {
      RangeType type = indexName.type;
      
      switch(type)
      {
        case COPY:
        {
          isChanged = false;
        }
        break;
        default:
          break;  
      }
      if(isChanged)
        break;
    }
    return isChanged; 
  }
  
  public PreserveNameIndex getGroupIndex(String rowId)
  {
    return groupPreservedIndexMap.get(rowId);
  }
  
  public int getInitialRepeatNumber(String id)
  {
    if(rowColRNMap.containsKey(id))
      return rowColRNMap.get(id);
    return 0;
  }
  
  public boolean hasUnameRangeinCell(String cellId)
  {
    return this.containsPreserveObjInCell(cellId) || this.containsImage(cellId);
  }
  
  private void indexJsonDataObject(ConversionContext context,Document doc)
  {
    int size = doc.sheetList.size();
    int len = doc.uniqueRows.uniqueRowList.size();
    
    for(int i = 0; i< len;i ++)
    {
      Row uRow = doc.uniqueRows.uniqueRowList.get(i);
      rowColRNMap.put(uRow.rowId, uRow.repeatedNum);
    }
    
    int clen = doc.uniqueColumns.uniqueColumnList.size();
    
    for(int i = 0; i< clen;i ++)
    {
      Column uCol = doc.uniqueColumns.uniqueColumnList.get(i);
      rowColRNMap.put(uCol.columnId, uCol.repeatedNum);
    }
    
    for (int sheetIndex = 0; sheetIndex < size; sheetIndex++)
    {
      Sheet sheet = doc.sheetList.get(sheetIndex);
      objectMap.put(sheet.sheetId, sheet);
      List<ConversionUtil.Column> collist = sheet.columnList;
      int colSize = sheet.columnList.size();
      for( int colIndex = 0; colIndex < colSize; colIndex ++ )
      {
        Column column = collist.get(colIndex);
        objectMap.put(column.columnId, column);
      }
      
      List<ConversionUtil.Row> rowlist = sheet.rowList;
      int rowSize = rowlist.size();
      for( int rowIndex = 0; rowIndex < rowSize; rowIndex ++ )
      {
        Row row = rowlist.get(rowIndex);
        objectMap.put(row.rowId, row);
        // cell object need not put to global objectMap
        // below code is only used to set rowId to cell
        // so remove it and set rowId in Row.getObjectFromJSON()

        /*
        List<ConversionUtil.Cell> cellList = row.getCellList();
        int cellSize = cellList.size();
        for( int cellColumnIndex = 0; cellColumnIndex < cellSize;cellColumnIndex ++ )
        {
          Cell cell = cellList.get(cellColumnIndex);
          cell.rowId = row.rowId;
          String indexId = IndexUtil.generateCellId(row.rowId , cell.cellId);
          objectMap.put(indexId, cell);
        }
        */
      }
    }
    context.put("supportObjectMap", objectMap);
  }

  public OdfElement getOdfNodes(String id)
  {
    if (id == null || id.equals(""))
      return null;
    OdfElement odfNode = (OdfElement) odfDomLocator.getNode(id);
    return odfNode;
  }
  
  public boolean containsJsonDataObject(String id)
  {
    return objectMap.containsKey(id);
  }
  
  public Object getJsonDataObject(String id)
  {
    return objectMap.get(id);
  }

}
