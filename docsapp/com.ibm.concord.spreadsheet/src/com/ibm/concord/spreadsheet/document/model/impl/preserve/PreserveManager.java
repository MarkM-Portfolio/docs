package com.ibm.concord.spreadsheet.document.model.impl.preserve;

import java.util.HashMap;
import java.util.Map;

import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;

public class PreserveManager
{
  private Document parent;

  private Map<Integer, Integer> maxRowMap;

  private PreserveStyleRangeList styleRangeList;

  private PreserveRangeList rangeList;
  
  private PreserveValueCellSet valueCellSet;

  public PreserveManager(Document d)
  {
    parent = d;
    maxRowMap = null;
  }
  

  
  public int getMaxRow(int sheetId)
  {
    if(null == maxRowMap)
      return -1;
    Integer o = maxRowMap.get(sheetId);
    if (o == null)
    {
      return -1;
    }
    else
    {
      return o;
    }
  }

  public void setMaxRow(int sheetId, int maxRow)
  {
    if(null == maxRowMap)
      maxRowMap = new HashMap<Integer, Integer>();;
    maxRowMap.put(sheetId, maxRow);
  }

  public PreserveStyleRangeList getStyleRangeList()
  {
    if (styleRangeList == null)
    {
      styleRangeList = new PreserveStyleRangeList(parent);
      styleRangeList.startListening(this.parent);
    }
    
    return styleRangeList;
  }

  public PreserveRangeList getRangeList()
  {
    if (rangeList == null)
    {
      rangeList = new PreserveRangeList(parent);
      rangeList.startListening(this.parent);
    }

    return rangeList;
  }

  public PreserveValueCellSet getValueCellSet()
  {
    if (valueCellSet == null)
    {
      valueCellSet = new PreserveValueCellSet();
    }

    return valueCellSet;
  }
  
  public boolean isExceedOriMaxRow(ParsedRef parsedRef)
  {
    String sheetName = parsedRef.getSheetName();
    Sheet sheet = this.parent.getIDManager().getSheetNameMap().get(sheetName);
    int sheetId = sheet.getId();
    int maxRowIndex = this.getMaxRow(sheetId);
    int curSRIndex = parsedRef.getIntStartRow();
    return curSRIndex > maxRowIndex ;
  }
  
  public void addDefaultStyleRange(ParsedRef parsedRef)
  {
    if(this.isExceedOriMaxRow(parsedRef))
      return;
    this.getStyleRangeList().addRange(parsedRef);
  }
  
  public void deleteDefaultStyleRange(ParsedRef parsedRef)
  {
    if(this.isExceedOriMaxRow(parsedRef))
      return;
    this.getStyleRangeList().deleteRange(parsedRef);
  }

  public Map<Integer, Integer> getMaxRowMap()
  {
    return maxRowMap;
  }


  /**
   * Used for recover manager to backup the preserve range list, style range list and value set of the sheet from preserve manager of the main document
   * @param sheetId the will be delete sheet Id
   * @param preserveManager the preserve manager of the main document
   */
  public void backup(int sheetId, PreserveManager preserveManager)
  {
    if(preserveManager.rangeList != null)
      getRangeList().backup(sheetId, preserveManager.rangeList);
    if(preserveManager.styleRangeList != null)
      getStyleRangeList().backup(sheetId, preserveManager.styleRangeList);
    if(preserveManager.valueCellSet != null)
      getValueCellSet().backup(sheetId, preserveManager.valueCellSet);
  }


  /**
   * Used to recover the preserve range list, style range list and value set of specified sheet from recover manager to main document
   * @param sheetId     the will be recovered sheet id
   * @param preserveManager the preserve manager of recover document
   */
  public void recoverSheet(Integer sheetId, PreserveManager recoverPreserveManager)
  {
    if(recoverPreserveManager.rangeList != null)
      getRangeList().recoverRanges4Sheet(sheetId, recoverPreserveManager.rangeList);
    if(recoverPreserveManager.styleRangeList != null)
      getStyleRangeList().recoverRanges4Sheet(sheetId, recoverPreserveManager.styleRangeList);
    if(recoverPreserveManager.valueCellSet != null)
      getValueCellSet().recoverSheet(sheetId, recoverPreserveManager.valueCellSet);
    
  }
}

