package com.ibm.concord.spreadsheet.document.compare;

import java.util.List;
import java.util.Map;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.compare.MetaComparator.ColumnStruct;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;

public class MetaJudger extends DefaultJudger
{
  Map<String, String> keyMapping;

  Map<String, StyleObject> leftStyles, rightStyles;

  // might useless
  public Map<String, List<String>[]> leftIdArray;

  public Map<String, List<String>[]> rightIdArray;
  
  public Map<String, List<ColumnStruct>> columns;

  public boolean isError(String path)
  {
    if (path.endsWith(ConversionConstant.CALCULATEDVALUE))
    {
      return false;
    }

    if (path.endsWith(ConversionConstant.MAXCOLINDEX))
    {
      return false;
    }
    
    return true;
  }

  public boolean isMapping(String path)
  {
    if (path.endsWith(ConversionConstant.ROWSIDARRAY) || path.endsWith(ConversionConstant.COLUMNSIDARRAY)
        || path.endsWith(ConversionConstant.SHEETSIDARRAY))
      return true;
    return false;
  }

  public void setKeyMapping(Map<String, String> map)
  {
    keyMapping = map;
  }

  public void setStyleMapping(Map<String, StyleObject> map, boolean bLeft)
  {
    if (bLeft)
      leftStyles = map;
    else
      rightStyles = map;
  }

  public String getMapping(String key)
  {
    String returnKey = keyMapping.get(key);
    if (returnKey != null)
      return returnKey;
    return key;
  }

  public boolean isEqual(Object v1, Object v2, String key)
  {
    if (key.endsWith(ConversionConstant.STYLEID))
    {
      String leftStyleId = (String) v1;
      String rightStyleId = (String) v2;
      StyleObject leftStyle = leftStyles.get(leftStyleId);
      StyleObject rightStyle = rightStyles.get(rightStyleId);
      if (leftStyle != null && rightStyle != null && leftStyle.hashCode() == rightStyle.hashCode())
        return true;
      return false;
    }
    if (key.endsWith(ConversionConstant.RANGE_STARTROWID) || key.endsWith(ConversionConstant.RANGE_ENDROWID)
        || key.endsWith(ConversionConstant.RANGE_STARTCOLID) || key.endsWith(ConversionConstant.RANGE_ENDCOLID))
    {
      String leftId = (String) v1;
      String rightId = (String) v2;
      if (rightId.equals(getMapping(leftId)))
      {
        return true;
      }
    }
    return super.isEqual(v1, v2, key);
  }

  public int getIndexById(String sheetId, String colId, boolean bRow, boolean isLeft)
  {
    Map<String, List<String>[]> ids = leftIdArray;
    if (!isLeft)
      ids = rightIdArray;
    List<String>[] array = ids.get(sheetId);
    if (array != null)
    {
      List<String> list = array[0];
      if (!bRow)
        list = array[1];
      if (list != null)
      {
        int length = list.size();
        for (int i = 0; i < length; i++)
        {
          String id = list.get(i);
          if (id.equals(colId))
            return i + 1;
        }
      }
    }
    return -1;
  }
}
