package com.ibm.concord.spreadsheet.document.compare;

import java.util.HashMap;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;
import java.util.logging.Logger;

import org.xml.sax.SAXException;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.compare.MetaComparator.ColumnStruct;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.IMapEntryListener;
import com.ibm.json.java.JSONObject;

public class MetaComparator extends MapComparator
{
  private static final Logger LOG = Logger.getLogger(MetaComparator.class.getName());
  
  private Map<String, String> keyMapping;

  public MetaComparator(MetaJudger j, String path)
  {
    super(j, path);
    keyMapping = new HashMap<String, String>();
    j.setKeyMapping(keyMapping);
    j.leftIdArray = new HashMap<String, List<String>[]>();
    j.rightIdArray = new HashMap<String, List<String>[]>();
  }

  // prepare for id mapping, include sheetId, rowId and columnId
  public void prepare(Map o1, Map o2) throws SAXException
  {
    String sheetKey = ConversionConstant.SHEETSIDARRAY;
    setMappingList((List) o1.get(sheetKey), (List) o2.get(sheetKey), sheetKey);
    setMapping((Map) o1.get(ConversionConstant.SHEETSARRAY), (Map) o2.get(ConversionConstant.SHEETSARRAY));

    prepareColumns(o1);
  }

  @SuppressWarnings("unchecked")
  private void prepareColumns(Map o1)
  {
    final Map<String, List<ColumnStruct>> columns = new HashMap<String, List<ColumnStruct>>();
    final MetaJudger mj = (MetaJudger) judger;
    mj.columns = columns;

    final JSONObject columnsObject = (JSONObject) o1.get(ConversionConstant.COLUMNS);
    if (columnsObject == null)
    {
      return;
    }

    ModelHelper.iterateMap(columnsObject, new IMapEntryListener<String, JSONObject>()
    {
      public boolean onEntry(String key, JSONObject sheetColumnsObject)
      {
        final String sheetId = key;
        final List<ColumnStruct> columnsList = new ArrayList<MetaComparator.ColumnStruct>();
        columns.put(sheetId, columnsList);
        final Comparator<ColumnStruct> comp = new ColumnStructComparator();
        
        ModelHelper.iterateMap(sheetColumnsObject, new IMapEntryListener<String, JSONObject>()
        {
          public boolean onEntry(String columnId, JSONObject columnObject)
          {
            String styleId = (String) columnObject.get(ConversionConstant.STYLEID);
            if (styleId != null)
            {
              int repeat = 0;
              Object o = columnObject.get(ConversionConstant.REPEATEDNUM);
              if (o != null)
              {
                repeat = ((Number) o).intValue();
              }
              int index = mj.getIndexById(sheetId, columnId, false, true);
              ColumnStruct cs = new ColumnStruct(index, styleId, repeat);
              ColumnStruct[] arr = new ColumnStruct[columnsList.size()];
              columnsList.toArray(arr);
              int res = Arrays.binarySearch(arr, cs, comp);
              if (res < 0)
              {
                columnsList.add(-res - 1, cs);
              }
            }
            return false;
          }
        });

        return false;
      }
    });
  }

  public void setMapping(Map o1, Map o2) throws SAXException
  {
    Set<Entry<String, Object>> leftEntrySet;
    
    if (o1 == null)
    {
      leftEntrySet = new HashSet<Map.Entry<String,Object>>();
    }
    else
    {
      leftEntrySet = o1.entrySet();
    }
    
    Set<String> rightKeySet;
    
    if (o2 == null)
    {
      rightKeySet = new HashSet<String>();
    }
    else
    {
      rightKeySet = new HashSet<String>(o2.keySet());
    }
    
    for (Iterator iterator = leftEntrySet.iterator(); iterator.hasNext();)
    {
      Entry<String, Object> entry = (Entry<String, Object>) iterator.next();
      String key = entry.getKey();
      Object value = entry.getValue();
      String key2 = judger.getMapping(key);
      Object valueRight = o2.get(key2);
      if (valueRight == null)
      {
        reportMissingValue(key2, value, false);
      }
      else
      {
        rightKeySet.remove(key2);
        if (value instanceof Map && valueRight instanceof Map)
        {
          pathList.add(key);
          rightPathList.add(key2);
          setMapping((Map) value, (Map) valueRight);

        }
        else if (value instanceof List && valueRight instanceof List)
        {
          if (judger.isMapping(key))
            setMappingList((List) value, (List) valueRight, key);
        }
        else
        {
          if (value instanceof Number && valueRight instanceof Number)
          {
            if (((Number) value).longValue() != ((Number) valueRight).longValue())
            {
              reportNotEqual(key, value, valueRight);
            }
          }
          else if (!value.equals(valueRight))
          {
            reportNotEqual(key, value, valueRight);
          }
        }
      }
    }
    for (Iterator iterator = rightKeySet.iterator(); iterator.hasNext();)
    {
      String key = (String) iterator.next();
      Object valueRight = o2.get(key);
      reportMissingValue(key, valueRight, true);
    }
    if (pathList.size() > 1)
    {
      pathList.remove(pathList.size() - 1);
      rightPathList.remove(rightPathList.size() - 1);
    }
  }

  public void setMappingList(List left, List right, String key)
  {
    List<String> leftIds = null;
    List<String> rightIds = null;
    if (pathList.size() > 0)
    {
      // store the rowIdsArray and colIdsArray
      String sheetId = pathList.get(pathList.size() - 1);
      MetaJudger mJudger = ((MetaJudger) judger);
      List<String>[] leftList = mJudger.leftIdArray.get(sheetId);
      List<String> leftRowList, leftColList;
      if (leftList == null)
      {
        leftList = new ArrayList[2];
        leftRowList = new ArrayList<String>();
        leftColList = new ArrayList<String>();
        leftList[0] = leftRowList;
        leftList[1] = leftColList;
        mJudger.leftIdArray.put(sheetId, leftList);
      }
      else
      {
        leftRowList = leftList[0];
        leftColList = leftList[1];
      }
      sheetId = rightPathList.get(rightPathList.size() - 1);
      List<String>[] rightList = mJudger.rightIdArray.get(sheetId);
      List<String> rightRowList, rightColList;
      if (rightList == null)
      {
        rightList = new ArrayList[2];
        rightRowList = new ArrayList<String>();
        rightColList = new ArrayList<String>();
        rightList[0] = rightRowList;
        rightList[1] = rightColList;
        mJudger.rightIdArray.put(sheetId, rightList);
      }
      else
      {
        rightRowList = rightList[0];
        rightColList = rightList[1];
      }
      leftIds = leftRowList;
      rightIds = rightRowList;
      if (key.endsWith(ConversionConstant.COLUMNSIDARRAY))
      {
        leftIds = leftColList;
        rightIds = rightColList;
      }
    }
    int leftSize = left.size();
    int rightSize = right.size();
    for (int i = 0; i < leftSize; i++)
    {
      String leftValue = (String) left.get(i);
      if (i < rightSize)
      {
        String rightValue = (String) right.get(i);
        keyMapping.put(leftValue, rightValue);
        if (leftIds != null)
        {
          leftIds.add(leftValue);
          rightIds.add(rightValue);
        }
      }
      else
      {
        if (leftIds != null)
          leftIds.add(leftValue);
      }
    }
    for (int i = leftSize; i < rightSize; i++)
    {
      String rightValue = (String) right.get(i);
      if (rightIds != null)
        rightIds.add(rightValue);
    }
  }

  public static class ColumnStruct
  {
    public String styleId;

    public int repeat, index;

    public ColumnStruct(int i, String sid, int r)
    {
      index = i;
      styleId = sid;
      repeat = r;
    }
  }
  
  public static class ColumnStructComparator implements Comparator<ColumnStruct>
  {
    public int compare(ColumnStruct object1, ColumnStruct object2)
    {
      // if o1 < o2, return -1, o1 > o2, return 1
      int start1 = object1.index;
      int end1 = start1 + object1.repeat;
      int start2 = object2.index;
      int end2 = start2 + object2.repeat;
      
      if (start1 <= start2 && end1 >= end2)
      {
        // 1 includes 2
        return 0;
      }
      
      if (start2 <= start1 && end2 >= end1)
      {
        // 2 includes 1
        return 0;
      }
      
      return start1 - start2;
    }
  }
}
