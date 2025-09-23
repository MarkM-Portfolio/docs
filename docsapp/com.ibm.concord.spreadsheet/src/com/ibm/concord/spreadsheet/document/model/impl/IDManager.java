package com.ibm.concord.spreadsheet.document.model.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonToken;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.model.impl.io.Actions;
import com.ibm.concord.spreadsheet.document.model.impl.io.Deserializer;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.json.java.JSONObject;

public class IDManager
{
  //invalid id
  public final static int INVALID = -1;
  //max id which refer to the row at index larger than ConversionConstant.MAX_REF_ROW_NUM
  public final static int MAXID = -2;

  private static final Logger LOG = Logger.getLogger(IDManager.class.getName());

  private Map<Integer, IDStruct> idStructMap;

  // sheetID: sheet
  private Map<Integer, Sheet> sheetIdMap;

  // sheetName: sheet
  private Map<String, Sheet> sheetNameMap;

  private int maxRowCount;

  private int maxColCount;

  private int maxSheetCount;

  public static final int ID_TYPE_ORIGINAL_ROW = 0x1;

  public static final int ID_TYPE_ROW = 0x2;

  public static final int ID_TYPE_ORIGINAL_COLUMN = 0x3;

  public static final int ID_TYPE_COLUMN = 0x4;

  public static final int ID_TYPE_SHEET = 0x5;

  public static final int ID_TYPE_ORIGINAL_SHEET = 0x6;
  
  public IDManager()
  {
    sheetIdMap = new HashMap<Integer, Sheet>();
    sheetNameMap = new HashMap<String, Sheet>();
    idStructMap = new HashMap<Integer, IDManager.IDStruct>();
    maxRowCount = 0;
    maxColCount = 0;
    maxSheetCount = 0;
  }

  /**
   * get row id according to the given row index
   * 
   * @param sheetId
   * @param index
   *          : 1-based
   * @param create
   *          : true means if the id does not existed, need to create one for it
   * @return
   */
  public int getRowIdByIndex(int sheetId, int index, boolean create)
  {
    return getRowIdByIndex(sheetId, index, create, false);
  }
  
  /**
   * get row id according to the given row index 
   * if row index is larger than the max row number, return maxid
   * @param sheetId
   * @param index
   * @param create
   * @param bMax    true to return maxid
   * @return
   */
  public int getRowIdByIndex(int sheetId, int index, boolean create, boolean bMax)
  {
    if(index < 1)
      return INVALID;
    IDStruct struct = idStructMap.get(sheetId);
    if (struct == null)
    {
      LOG.log(Level.WARNING, "Trying to getRowIdByIndex on a non-exist sheet with id {0}, ", sheetId);
      return INVALID;
    }
    List<Integer> rowsIdList = struct.rowIdList;

    int size = rowsIdList.size();
    if (index > size)
    {
      if (create)
      {
        if(bMax && index > ConversionConstant.MAX_REF_ROW_NUM)
          return MAXID;
        int newId = ModelHelper.typedId(ID_TYPE_ROW, ++maxRowCount);
        ModelHelper.putToList(rowsIdList, index - 1, newId);
        struct.rowIdToIndexMap.put(newId, index);
        return newId;
      }
      else
        return INVALID;
    }

    Integer rId = rowsIdList.get(index - 1);
    if (!create)
    {
      if (null == rId)
        return INVALID;
      return rId;
    }
    if (rId == null)
    {
      rId = ModelHelper.typedId(ID_TYPE_ROW, ++maxRowCount);
      rowsIdList.set(index - 1, rId);
      struct.rowIdToIndexMap.put(rId, index);
    }
    return rId;
  }

  /**
   * get column id according to the given column index
   * 
   * @param sheetId
   * @param index
   *          : 1-based
   * @param create
   *          : true means if the id does not existed, need to create one for it
   * @return
   */
  public int getColIdByIndex(int sheetId, int index, boolean create)
  {
    if(index < 1)
      return INVALID;
    IDStruct struct = idStructMap.get(sheetId);
    if (struct == null)
    {
      LOG.log(Level.WARNING, "Trying to getRowIdByIndex on a non-exist sheet with id {0}, ", sheetId);
      return INVALID;
    }
    List<Integer> colsIdList = struct.columnIdList;
    int size = colsIdList.size();

    if (index > size)
    {
      if (create)
      {
        int newId = ModelHelper.typedId(ID_TYPE_COLUMN, ++maxColCount);
        ModelHelper.putToList(colsIdList, index - 1, newId);
        struct.columnIdToIndexMap.put(newId, index);
        return newId;
      }
      else
        return INVALID;
    }

    Integer cId = colsIdList.get(index - 1);
    if (!create)
    {
      if (null == cId)
        return INVALID;
      return cId;
    }
    if (cId == null)
    {
      cId = ModelHelper.typedId(ID_TYPE_COLUMN, ++maxColCount);
      colsIdList.set(index - 1, cId);
      struct.columnIdToIndexMap.put(cId, index);
    }
    return cId;
  }

  /**
   * 
   * @param sheetId
   * @param rId
   * @return : the index of the rId, -1 means not found, else means 1-based row index
   */
  public int getRowIndexById(int sheetId, int rId)
  {
    IDStruct struct = idStructMap.get(sheetId);
    if (struct == null)
    {
      LOG.log(Level.WARNING, "Trying to getRowIndexById on a non-exist sheet with id {0}, ", sheetId);
      return INVALID;
    }
    int index = struct.rowIdToIndexMap.get(rId);
    if (index == INVALID)
      return INVALID;
    return index;
  }

  /**
   * 
   * @param sheetId
   * @param cId
   * @return : the index of the cId, -1 means not found, else means 1-based column index
   */
  public int getColIndexById(int sheetId, int cId)
  {
    IDStruct struct = idStructMap.get(sheetId);
    if (struct == null)
    {
      LOG.log(Level.WARNING, "Trying to getColIndexById on a non-exist sheet with id {0}, ", sheetId);
      return INVALID;
    }
    int index = struct.columnIdToIndexMap.get(cId);
    if (index == INVALID)
      return INVALID;
    return index;
  }
  
  /**
   * for rIndex set the rId as it's row id
   * @param sheetId
   * @param rIndex  : 1-based
   * @param rId
   */
  public void setRowIdAtIndex(int sheetId, int rIndex, int rId)
  {
    if(rIndex < 1) 
      return;
    List<Integer> rowIdList = this.getRowIdList(sheetId);
    int size = rowIdList.size();
    if(size < rIndex)
    {
      for(int i = size; i < rIndex; i++)
        rowIdList.add(null);
    }  
    rowIdList.set(rIndex-1, rId);
    IDToIndexMap map = this.getRowIdToIndexMap(sheetId);
    map.put(rId, rIndex);
  }
  
  /**
   * for index set the cId as it's column id
   * @param sheetId
   * @param index  : 1-based
   * @param rId
   */
  public void setColumnIdAtIndex(int sheetId, int index, int cId)
  {
    if(index < 1)
      return;
    List<Integer> colIdList = this.getColumnIdList(sheetId);
    ModelHelper.putToList(colIdList, index - 1, cId);
    IDToIndexMap map = this.getColumnIdToIndexMap(sheetId);
    map.put(cId, index);
  }  
  
  
  /**
   * delete rows from rowIndex with count number
   * @param sheetId
   * @param srIndex : 1-based
   * @param erIndex : 1-based
   */
  public void deleteRowAtIndex(int sheetId, int srIndex, int erIndex)
  {
    if(srIndex < 1 || erIndex < 1)
      return;
    List<Integer> rowIdList = this.getRowIdList(sheetId);
    if(null == rowIdList)
    {
      LOG.log(Level.WARNING, "Trying to deleteRowAtIndex on a non-exist sheet with id {0}, ", sheetId);
      return;
    }
    int size = rowIdList.size();
    if(srIndex > size)
      return;
    erIndex = erIndex > size ? size : erIndex;

    for(int i = erIndex; i >= srIndex; i--)
      rowIdList.remove(i-1);
    IDToIndexMap map = this.getRowIdToIndexMap(sheetId);
    map.clear();
  }
  /**
   * insert rows from rowIndex with count number
   * @param sheetId 
   * @param srIndex : 1-based
   * @param count   : default is 1
   */
  public void insertRowAtIndex(int sheetId,int srIndex, int count)
  {
    if(srIndex < 1) 
      return;
    List<Integer> rowIdList = this.getRowIdList(sheetId);
    if(null == rowIdList)
    {
      LOG.log(Level.WARNING, "Trying to insertRowAtIndex on a non-exist sheet with id {0}, ", sheetId);
      return;
    }
    if(count <= 0)
      count = 1;
    //change to 0-based
    srIndex--;
    if(srIndex < rowIdList.size())
    {
      for(int i = 0; i < count; i++)
        rowIdList.add(srIndex,null);
      IDToIndexMap map = this.getRowIdToIndexMap(sheetId);
      map.clear();
    }  
  }
  /**
   * insert columns from scIndex with count number
   * @param sheetId
   * @param scIndex : 1-based
   * @param count   : default is 1
   */
  public void insertColAtIndex(int sheetId, int scIndex, int count)
  {
    if(scIndex < 1) 
      return;
    List<Integer> colIdList = this.getColumnIdList(sheetId);
    if(null == colIdList)
    {
      LOG.log(Level.WARNING, "Trying to insertColAtIndex on a non-exist sheet with id {0}, ", sheetId);
      return;
    }
    if(count <= 0)
      count = 1;
    //change to 0-based
    scIndex--;
    if(scIndex < colIdList.size())
    {
      for(int i = 0; i < count; i++)
        colIdList.add(scIndex,null);
      IDToIndexMap map = this.getColumnIdToIndexMap(sheetId);
      map.clear();
    }  
  }
  
  /**
   * delete columns from scIndex to ecIndex
   * @param sheetId
   * @param scIndex : 1-based
   * @param ecIndex : 1-based
   */
  public void deleteColAtIndex(int sheetId, int scIndex, int ecIndex)
  {
    if(scIndex < 1 || ecIndex < 1)
      return;
    List<Integer> colIdList = this.getColumnIdList(sheetId);
    if(null == colIdList)
    {
      LOG.log(Level.WARNING, "Trying to deleteColAtIndex on a non-exist sheet with id {0}, ", sheetId);
      return;
    }
    int size = colIdList.size();
    if(scIndex > size)
      return;
    ecIndex = ecIndex > size ? size : ecIndex;
    for(int i = ecIndex; i >= scIndex; i--)
      colIdList.remove(i-1);
    IDToIndexMap map = this.getColumnIdToIndexMap(sheetId);
    map.clear();
  }
  
  /**
   * Called from {@link Deserializer} to load row/column id list from JSON.
   * 
   * @param sheetId
   * @param action
   *          could be either {@link Actions#META_COLUMNSIDARRAY}, or {@link Actions#META_ROWSIDARRAY}
   * @param jp
   * @throws IOException
   * @throws JsonParseException
   */
  public void loadIdListFromJSON(Sheet sheet, Actions action, JsonParser jp) throws JsonParseException, IOException
  {
    List<Integer> idList;
    int maxId;
    if (action == Actions.META_ROWSIDARRAY)
    {
      idList = sheet.getIdStruct().rowIdList;
      maxId = maxRowCount;
    }
    else
    {
      idList = sheet.getIdStruct().columnIdList;
      maxId = maxColCount;
    }
    JsonToken jt = jp.nextToken();

    while (jt != JsonToken.END_ARRAY)
    {
      String id = jp.getText();
      if (id.length() > 0)
      {
        int numberId = ModelHelper.stripIdType(id);
        if (numberId > maxId)
        {
          maxId = numberId;
        }
        int idType = ModelHelper.toNumberIdType(id);
        int typedId = ModelHelper.typedId(idType, numberId);
        idList.add(typedId);
      }
      else
      {
        idList.add(null);
      }
      jt = jp.nextToken();
    }

    if (action == Actions.META_ROWSIDARRAY)
    {
      maxRowCount = maxId;
    }
    else
    {
      maxColCount = maxId;
    }

  }

  /**
   * Only for test
   */
  @Deprecated
  public void loadFromJson(JSONObject json)
  {
    // Iterator<?> iter = json.entrySet().iterator();
    // while (iter.hasNext())
    // {
    // Map.Entry<?, ?> entry = (Map.Entry<?, ?>) iter.next();
    // String sheetId = (String) entry.getKey();
    // JSONObject ids = (JSONObject) entry.getValue();
    // JSONArray rowsIdArray = (JSONArray) ids.get(ConversionConstant.ROWSIDARRAY);
    // JSONArray colsIdArray = (JSONArray) ids.get(ConversionConstant.COLUMNSIDARRAY);
    //
    // ArrayList rowsIdList = new ArrayList<Integer>();
    // if (null != rowsIdArray)
    // {
    // int length = rowsIdArray.size();
    // for (int i = 0; i < length; i++)
    // {
    // String rId = (String) rowsIdArray.get(i);
    // if (null != rId && rId.length() > 0)
    // {
    // int num = Integer.parseInt(rId.substring(2));
    // if (num > this.maxRowCount)
    // this.maxRowCount = num;
    // rowsIdList.add(num);
    // }
    // else
    // rowsIdList.add(0);
    // }
    // }
    //
    // ArrayList colsIdList = new ArrayList<Integer>();
    // if (null != colsIdArray)
    // {
    // int length = colsIdArray.size();
    // for (int i = 0; i < length; i++)
    // {
    // String cId = (String) colsIdArray.get(i);
    // if (null != cId && cId.length() > 0)
    // {
    // int num = Integer.parseInt(cId.substring(2));
    // if (num > this.maxColCount)
    // this.maxColCount = num;
    // colsIdList.add(num);
    // }
    // else
    // colsIdList.add(0);
    // }
    // }
    // ArrayList idArrays[] = idArrays = new ArrayList[2];
    // idArrays[0] = rowsIdList;
    // idArrays[1] = colsIdList;
    // this.idArray.put(sheetId, idArrays);
    // }
  }

  public List<Integer> getRowIdList(int sheetId)
  {
    return idStructMap.get(sheetId).rowIdList;
  }

  public List<Integer> getColumnIdList(int sheetId)
  {
    return idStructMap.get(sheetId).columnIdList;
  }

  public IDToIndexMap getRowIdToIndexMap(int sheetId)
  {
    return idStructMap.get(sheetId).rowIdToIndexMap;
  }

  public IDToIndexMap getColumnIdToIndexMap(int sheetId)
  {
    return idStructMap.get(sheetId).columnIdToIndexMap;
  }

  public Map<Integer, Sheet> getSheetIdMap()
  {
    return sheetIdMap;
  }

  public Map<String, Sheet> getSheetNameMap()
  {
    return sheetNameMap;
  }

  public int addSheet(Sheet st)
  {
    int id = st.getId();
    if (IDManager.INVALID == id)
    {
      id = ModelHelper.typedId(ID_TYPE_SHEET, ++maxSheetCount);
      st.setId(id);
    }
    else
    {
      int count = ModelHelper.stripIdType(id);
      this.maxSheetCount = (count > this.maxSheetCount) ? count : this.maxSheetCount;
    }
    sheetIdMap.put(id, st);
    sheetNameMap.put(st.getSheetName(), st);
    IDStruct struct = new IDStruct();
    idStructMap.put(id, struct);
    st.setIdStruct(struct);
    return id;
  }
  
  /**
   * Back up the sheet meta from idManager of the main document to the recover manager
   * @param st the will be backup sheet model
   * @param IDManager the IDManager of the main document
   * @return
   */
  int backupSheet(Sheet st, IDManager man)
  {
    int id = st.getId();
    if(IDManager.INVALID == id)
    {
      LOG.log(Level.WARNING, "the sheet id must exist when back up sheet meta info");
      return IDManager.INVALID;
    }
    sheetIdMap.put(id, st);
    sheetNameMap.put(st.getSheetName(), st);
    IDStruct struct = man.idStructMap.get(id);
    idStructMap.put(id, struct);
    return id;
  }
  
  /**
   * Recover the sheet meta from idManager of recover document to the main document
   * @param sheet the will be recovered sheet model
   * @param recoverIdManager the IdManager of recover document
   */
  public void recoverSheet(Sheet sheet, String oldSheetName, IDManager recoverIdManager)
  {
    int id = sheet.getId();
    sheetIdMap.put(id, sheet);
    sheetNameMap.put(sheet.getSheetName(), sheet);
    IDStruct struct = recoverIdManager.idStructMap.get(id);
    idStructMap.put(id, struct);
    // remove from recover idManager
    recoverIdManager.sheetIdMap.remove(id);
    recoverIdManager.sheetNameMap.remove(oldSheetName);
    recoverIdManager.idStructMap.remove(id);
    // refresh maxSheetCount
    int count = ModelHelper.stripIdType(id);
    this.maxSheetCount = (count > this.maxSheetCount) ? count : this.maxSheetCount;
  }
  
  public void deleteSheet(Sheet st)
  {
    int sheetId = st.getId();
    sheetIdMap.remove(sheetId);
    sheetNameMap.remove(st.getSheetName());
    idStructMap.remove(sheetId);
  }
  
  public void setMaxSheetCount(int maxSheetCount)
  {
    this.maxSheetCount = Math.max(this.maxSheetCount, maxSheetCount);
  }
  
  public void setMaxRowCount(int maxRowCount)
  {
    this.maxRowCount = Math.max(this.maxRowCount, maxRowCount);
  }

  public void setMaxColCount(int maxColCount)
  {
    this.maxColCount = Math.max(this.maxColCount, maxColCount);
  }
  
  public void decompose()
  {
    Iterator<Integer> iter = idStructMap.keySet().iterator();
    while(iter.hasNext()){
      int id = iter.next();
      IDStruct struct = idStructMap.get(id);
      struct.rowIdList.clear();
      struct.rowIdList = null;
      struct.columnIdList.clear();
      struct.columnIdList = null;
      struct.rowIdToIndexMap.clear();
      struct.rowIdToIndexMap = null;
      struct.columnIdToIndexMap.clear();
      struct.columnIdToIndexMap = null;
    }
    sheetIdMap.clear();
    sheetIdMap = null;
    sheetNameMap.clear();
    sheetNameMap = null;
  }

  /**
   * A struct combines ID <-> Index list and map together.
   */
  public static class IDStruct
  {
    public List<Integer> rowIdList, columnIdList;

    public IDToIndexMap rowIdToIndexMap, columnIdToIndexMap;

    public IDStruct()
    {
      rowIdList = new ArrayList<Integer>();
      columnIdList = new ArrayList<Integer>();
      rowIdToIndexMap = new IDToIndexMap(rowIdList);
      columnIdToIndexMap = new IDToIndexMap(columnIdList);
    }
  }

}