package com.ibm.concord.spreadsheet.document.model.impl.preserve;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * To record preserve "value": { "(sheetId"): { "(rowId)": { "(columnId)" : boolean data.
 */
public class PreserveValueCellSet
{
  public static final int VALUE_CHANGE = 1;
  public static final int WHOLE_ROWCOL_REF = 2;//other value should be 4,8,16...
  // the cells which value had changed and need preserve
  private Map<Integer, Map<Integer, Map<Integer, Integer>>> set;
  
  //the cells which need to be preserved when the value changed
  private Map<Integer, Map<Integer, Set<Integer>>> ids;
  
  public PreserveValueCellSet()
  {
    set = new HashMap<Integer, Map<Integer, Map<Integer, Integer>>>();
    ids = new HashMap<Integer, Map<Integer, Set<Integer>>>();
  }

  public Map<Integer, Map<Integer, Set<Integer>>> getIds()
  {
    return this.ids;
  }
  
  public void delete(int sheetId)
  {
    this.set.remove(sheetId);
  }
  
  private void addForInit(int sheetId, int rowId, int colId)
  {
    Map<Integer, Set<Integer>> m = ids.get(sheetId);
    if (null == m)
    {
      m = new HashMap<Integer, Set<Integer>>();
      ids.put(sheetId, m);
    }
    Set<Integer> s = m.get(rowId);
    if(null == s)
    {
      s = new HashSet<Integer>();
      m.put(rowId, s);
    }
    s.add(colId);
  }
  
  private void add(int sheetId, int rowId, int colId, int v)
  {
    Map<Integer, Map<Integer, Integer>> m = set.get(sheetId);
    if (null == m)
    {
      m = new HashMap<Integer, Map<Integer, Integer>>();
      set.put(sheetId, m);
    }
    Map<Integer, Integer> s = m.get(rowId);
    if(null == s)
    {
      s = new HashMap<Integer, Integer>();
      m.put(rowId, s);
    }
    int value = v;
    Integer oriValue = s.get(colId);
    if(oriValue != null)
    {
      value |= oriValue;
    }
    s.put(colId, value);
  }
  
  private void delete(int sheetId, int rowId, int colId, int v)
  {
    Map<Integer, Map<Integer, Integer>> m = set.get(sheetId);
    if (null == m)
    {
      return;
    }
    Map<Integer, Integer> s = m.get(rowId);
    if(null == s)
    {
      return;
    }
    Integer oriValue = s.get(colId);
    if(oriValue != null)
    {
      int value = (oriValue & ~v);
      if(value == 0)
        s.remove(colId);
      else
        s.put(colId, value);
    }
  }
  /**
   * add the cell which needs preserve into ids
   * @param sheetId
   * @param rowId
   * @param colId
   */
  public void addPreserveCellIds(int sheetId, int rowId, int colId)
  {
    this.addForInit(sheetId, rowId, colId);
  }
  
  public boolean isNeedPreserve(int sheetId, int rowId, int colId)
  {
    Map<Integer, Set<Integer>> m = ids.get(sheetId);
    if(null == m)
      return false;
    Set<Integer> s = m.get(rowId);
    if(null == s)
      return false;
    return s.contains(colId);
  }
  
  public void addValueChange(int sheetId, int rowId, int colId)
  {
    if(this.isNeedPreserve(sheetId, rowId, colId))
      add(sheetId, rowId, colId, VALUE_CHANGE);
  }
  
  public void addWholeRowColRef(int sheetId, int rowId, int colId)
  {
    add(sheetId, rowId, colId, WHOLE_ROWCOL_REF);
  }
  
  public void deleteWholeRowColRef(int sheetId, int rowId, int colId)
  {
    delete(sheetId, rowId, colId, WHOLE_ROWCOL_REF);
  }
  
  /**
   * Returning rowId: { columnId set } data
   * 
   * @param sheetId
   * @param create
   *          if not found, lazy new one
   * @return
   */
  public Map<Integer, Map<Integer, Integer>> get(int sheetId, boolean create)
  {
    Map<Integer, Map<Integer, Integer>> m = set.get(sheetId);
    if (m == null && create)
    {
      m = new HashMap<Integer, Map<Integer, Integer>>();
      set.put(sheetId, m);
    }
    return m;
  }

  public boolean contains(int sheetId, int rowId, int columnId)
  {
    Map<Integer, Map<Integer, Integer>> m = get(sheetId, false);
    if (m == null)
    {
      return false;
    }
    else
    {
      Map<Integer, Integer> s = m.get(rowId);
      if (s == null)
      {
        return false;
      }
      return (s.get(columnId) != null);
    }
  }

  public Map<Integer, Map<Integer, Map<Integer, Integer>>> getValueCellSet()
  {
    return set;
  }

  /**
   * Used for recover manager to backup the value cells for sheet from the value cell set of the main document
   * @param sheetId the will be deleted sheet id
   * @param valueCellSet the value cell set of the main document
   */
  public void backup(int sheetId, PreserveValueCellSet mainValueSet)
  {
    Map<Integer, Map<Integer, Map<Integer, Integer>>> valueCellSet = mainValueSet.getValueCellSet();
    Map<Integer, Map<Integer, Integer>> sheet = valueCellSet.get(sheetId);
    if(sheet != null)
    {
      set.put(sheetId, sheet);
    }
  }
  
  /**
   * Used for recover the value cells of sheet from recover document to main document
   * @param sheetId the will be recovered sheet id
   * @param valueCellSet the value cell set of the recover document
   */
  public void recoverSheet(int sheetId, PreserveValueCellSet recoverValueSet)
  {
    Map<Integer, Map<Integer,  Map<Integer, Integer>>> valueCellSet = recoverValueSet.getValueCellSet();
    Map<Integer,  Map<Integer, Integer>> sheet = valueCellSet.get(sheetId);
    if(sheet != null)
    {
      set.put(sheetId, sheet);
      recoverValueSet.delete(sheetId);
    }
  }
}
