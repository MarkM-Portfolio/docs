package com.ibm.concord.spreadsheet.document.compare;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.xml.sax.SAXException;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.compare.MetaComparator.ColumnStruct;
import com.ibm.concord.spreadsheet.document.model.style.StyleObject;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.IMapEntryListener;
import com.ibm.json.java.JSONObject;

public class ContentComparator extends MapComparator
{
  Map<String, StyleObject> leftStyles;

  Map<String, StyleObject> rightStyles;

  private List<CellStruct> leftCells, rightCells;

  public ContentComparator(MetaJudger j, String path)
  {
    super(j, path);
    leftStyles = new HashMap<String, StyleObject>();
    rightStyles = new HashMap<String, StyleObject>();
    j.setStyleMapping(leftStyles, true);
    j.setStyleMapping(rightStyles, false);
  }

  @Override
  public boolean reportMissingValue(String key, Object value, boolean isLeft) throws SAXException
  {
    // pathList like
    // content, sheets, <sheetId>, rows, <rowId>, <columnId>
    if (pathList.size() < 5)
    {
      // only works when list has 5 or 6 elements, means certain row lacks certain cells
      return super.reportMissingValue(key, value, isLeft);
    }

    if (key.equals(ConversionConstant.REPEATEDNUM))
    {
      boolean res;
      if (isLeft)
      {
        res = onRepeatNotEqual(0, ((Number) value).intValue());
      }
      else
      {
        res = onRepeatNotEqual(((Number) value).intValue(), 0);
      }

      if (res == false)
      {
        return false;
      }
    }

    if (isLeft)
    {
      return super.reportMissingValue(key, value, isLeft);
    }

    // right missing value, check if it is the form of { sid: "..." }, or columnId: { sid: "..." }
    String columnId;
    String styleId;
    String sheetId = pathList.get(2);
    int repeat = 0;
    JSONObject o;
    Object v;

    if (key.equals(ConversionConstant.STYLEID))
    {
      styleId = (String) value;
      columnId = pathList.get(5);
    }
    else if (value instanceof JSONObject)
    {
      o = (JSONObject) value;
      v = o.get(ConversionConstant.STYLEID);
      if (v == null)
      {
        // try form of columnId: { sid: "..." }
        Set<String> keySet = o.keySet();
        if (keySet.size() == 1)
        {
          columnId = keySet.iterator().next();
          v = o.get(columnId);
          if (v instanceof JSONObject)
          {
            o = (JSONObject) v;
            v = o.get(ConversionConstant.STYLEID);
            if (v != null)
            {
              styleId = (String) v;
              v = o.get(ConversionConstant.REPEATEDNUM);
              if (v != null)
              {
                repeat = ((Number) v).intValue();
              }
            }
            else
            {
              return super.reportMissingValue(key, value, isLeft);
            }
          }
          else
          {
            return super.reportMissingValue(key, value, isLeft);
          }
        }
        else
        {
            return super.reportMissingValue(key, value, isLeft);
        }
      }
      else
      {
        styleId = (String) v;
        columnId = key;
        v = o.get(ConversionConstant.REPEATEDNUM);
        if (v != null)
        {
          repeat = ((Number) v).intValue();
        }
      }
    }
    else
    {
      return super.reportMissingValue(key, value, isLeft);
    }

    // in left cell columnId, style styleId with repeatnum repeat is reported missing, check if it is correct
    MetaJudger mj = (MetaJudger) judger;
    int index = mj.getIndexById(sheetId, columnId, false, true);
    int res;

    List<ColumnStruct> columns = mj.columns.get(sheetId);
    if (columns != null)
    {
      ColumnStruct cs = new ColumnStruct(index, null, repeat);
      res = Arrays.binarySearch(columns.toArray(new ColumnStruct[columns.size()]), cs, new MetaComparator.ColumnStructComparator());

      if (styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))
      {
        // dfs is missing, check if corresponding column doesn't contain any style
        if (res < 0)
        {
          res = -res - 1;
          if (res > 1)
          {
            cs = columns.get(res - 1);
            // assert no covering
            if (cs.index + cs.repeat >= index)
            {
              return super.reportMissingValue(key, value, isLeft);
            }
          }

          if (res < columns.size() - 1)
          {
            cs = columns.get(res + 1);
            if (index + repeat >= cs.index)
            {
              return super.reportMissingValue(key, value, isLeft);
            }
          }

          // ok with this missing
          return false;
        }
      }
      else
      {
        // common style
        if (res >= 0)
        {
          cs = columns.get(res);
          // cs include cell
          if (cs.index <= index && cs.index + repeat >= index + repeat)
          {
            // left cell with styleId is reported missing, check if cs.styleId(which is also from left) equals
            // to styleId
            if (styleId.equals(cs.styleId))
            {
              return false;
            }
          }
        }
      }
    }
    else
    {
      // column is empty
      if (styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))
      {
        return false;
      }
    }

    // the style missing not related to column, check if it is included in right model
    CellStruct leftCell = new CellStruct(index, styleId, repeat);
    res = Arrays.binarySearch(rightCells.toArray(new CellStruct[rightCells.size()]), leftCell, new CellStructComparator());
    if (res >= 0)
    {
      CellStruct rightCell = rightCells.get(res);
      // right cell must include leftCell
      if (rightCell.index <= index && rightCell.index + rightCell.repeat >= index + repeat)
      {
        // style ok
        StyleObject leftStyle = leftStyles.get(styleId);
        StyleObject rightStyle = rightStyles.get(rightCell.styleId);
        if (leftStyle.hashCode() == rightStyle.hashCode())
        {
          return reverseCheck(rightCell);
        }
      }
    }

    return super.reportMissingValue(key, value, isLeft);
  }

  @Override
  public boolean reportNotEqual(String key, Object left, Object right)
  {
    if (ConversionConstant.REPEATEDNUM.equals(key))
    {
      if (!onRepeatNotEqual(((Number) left).intValue(), ((Number) right).intValue()))
      {
        return false;
      }
    }
    // TODO Auto-generated method stub
    return super.reportNotEqual(key, left, right);
  }

  @Override
  public void compare(Map o1, Map o2)
  {
    if (pathList.size() == 5)
    {
      // just entered a new row
      String leftRowId = pathList.get(4);
      String leftSheetId = pathList.get(2);
      String rightSheetId = rightPathList.get(2);

      prepareRow(leftSheetId, o1, true);
      prepareRow(rightSheetId, o2, false);
    }

    // TODO Auto-generated method stub
    super.compare(o1, o2);
  }

  // return false if this un-equal is ok
  private boolean onRepeatNotEqual(int leftRepeat, int rightRepeat)
  {
    String leftSheetId = pathList.get(2);
    String leftColumnId = pathList.get(5);
    int leftIndex = ((MetaJudger) judger).getIndexById(leftSheetId, leftColumnId, false, true);
    // left index repeat should be leftRepeat, but is set to rightRepeat, see if it is ok
    // we don't worry style value since the error will be reported anyway
    CellStruct leftCell = new CellStruct(leftIndex, null, leftRepeat);
    int res = Arrays.binarySearch(rightCells.toArray(new CellStruct[rightCells.size()]), leftCell, new CellStructComparator());
    if (res >= 0)
    {
      CellStruct rightCell = rightCells.get(res);
      // rightcell includes leftcell
      if (rightCell.index <= leftIndex && rightCell.index + rightCell.repeat >= leftIndex + leftRepeat)
      {
        return reverseCheck(rightCell);
      }
    }

    return true;
  }
  
  // check in left cell list to make sure right cell structure is ok,
  // return false if it is ok, true if error
  private boolean reverseCheck(CellStruct rightCell)
  {
    CellStruct cs = new CellStruct(rightCell.index, rightCell.styleId, 0);
    // search in left cell
    int res = Arrays.binarySearch(leftCells.toArray(new CellStruct[leftCells.size()]), cs, new CellStructComparator());
    if (res >= 0)
    {
      int repeat = rightCell.repeat + 1;
      int rightCellEnd = rightCell.index + rightCell.repeat;
      String rightStyleId = rightCell.styleId;
      // start from res, cs, look up in leftCells, to make sure rightCell style and repeatnum correct
      for (; res < leftCells.size(); res++)
      {
        cs = leftCells.get(res);
        if (cs.index > rightCellEnd)
        {
          break;
        }
        
        String leftStyleId = cs.styleId;
        StyleObject leftStyle = leftStyles.get(leftStyleId);
        StyleObject rightStyle = rightStyles.get(rightStyleId);
        if (leftStyle.hashCode() != rightStyle.hashCode())
        {
          break;
        }
        
        repeat -= cs.repeat + 1;
      }
      // right cell repeat should just equals repeat in all cells that has the styles in left
      // so if repeat is 0, we are good
      return !(repeat == 0);
    }
    else
    {
      return true;
    }
  }

  // prepare for style
  public void prepare(Map o1, Map o2)
  {
    prepareStyle(o1, true);
    prepareStyle(o2, false);

    leftCells = new ArrayList<ContentComparator.CellStruct>();
    rightCells = new ArrayList<ContentComparator.CellStruct>();
  }

  private void prepareStyle(Map json, boolean bLeft)
  {
    Map<String, StyleObject> styles = leftStyles;
    if (!bLeft)
    {
      styles = rightStyles;
    }
    JSONObject stylesJSON = (JSONObject) json.get(ConversionConstant.STYLES);
    Iterator<String> styleIdIter = stylesJSON.keySet().iterator();
    while (styleIdIter.hasNext())
    {
      String styleId = styleIdIter.next();
      JSONObject styleJSON = (JSONObject) stylesJSON.get(styleId);
      StyleObject style = new StyleObject(styleJSON);
      styles.put(styleId, style);
    }
  }

  @SuppressWarnings("unchecked")
  private void prepareRow(final String sheetId, Map o2, final boolean isLeft)
  {
    final MetaJudger mj = (MetaJudger) judger;
    final CellStructComparator comp = new CellStructComparator();
    final List<CellStruct> cells;
    if (isLeft)
    {
      cells = leftCells;
    }
    else
    {
      cells = rightCells;
    }
    
    cells.clear();
    ModelHelper.iterateMap(o2, new IMapEntryListener<String, JSONObject>()
    {
      public boolean onEntry(String columnId, JSONObject cellObject)
      {
        String styleId = null;
        int index = 0, repeat = 0;
       
        Object o = cellObject.get(ConversionConstant.STYLEID);
        if (o != null)
        {
          styleId = (String) o;
        }

        if (styleId != null)
        {
          index = mj.getIndexById(sheetId, columnId, false, isLeft);
          o = cellObject.get(ConversionConstant.REPEATEDNUM);
          if (o != null)
          {
            repeat = ((Number) o).intValue();
          }

          CellStruct cs = new CellStruct(index, styleId, repeat);
          CellStruct[] arr = new CellStruct[cells.size()];
          cells.toArray(arr);
          int res = Arrays.binarySearch(arr, cs, comp);
          if (res < 0)
          {
            cells.add(-res - 1, cs);
          }
        }

        return false;
      }
    });
  }

  public static class CellStruct
  {
    public String styleId;

    public int repeat, index;

    public CellStruct(int i, String sid, int r)
    {
      index = i;
      styleId = sid;
      repeat = r;
    }
  }

  public static class CellStructComparator implements Comparator<CellStruct>
  {
    public int compare(CellStruct object1, CellStruct object2)
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
