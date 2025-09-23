package com.ibm.concord.spreadsheet.document.model.util;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Queue;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.codehaus.jackson.SerializableString;
import org.codehaus.jackson.io.SerializedString;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.common.utils.CommonUtils;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeRelation;
import com.ibm.concord.spreadsheet.document.model.formula.Area;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.ReferenceToken;
import com.ibm.concord.spreadsheet.document.model.impl.BasicModel;
import com.ibm.concord.spreadsheet.document.model.impl.BasicModel.Direction;
import com.ibm.concord.spreadsheet.document.model.impl.Column;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.FormulaCell;
import com.ibm.concord.spreadsheet.document.model.impl.IDManager;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.impl.Row;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.impl.StyleCell;
import com.ibm.concord.spreadsheet.document.model.impl.ValueCell;
import com.ibm.concord.spreadsheet.document.model.style.StyleManager;
import com.ibm.json.java.JSONObject;

public class ModelHelper
{
  private static final Logger LOG = Logger.getLogger(ModelHelper.class.getName());
  
  public static class Position
  {
    public boolean isFind = false;

    public int index = 0;

    public Position(boolean isfind, int index)
    {
      this.isFind = isfind;
      this.index = index;
    }
  }

  /**
   * to find the position of the model in the list which's index equal to the given modelIndex
   * 
   * @param list
   *          the arraylist of the model
   * @param modelIndex
   *          the index of the model 1-based
   * @return
   */
  public static Position search(List list, int modelIndex)
  {
    return search(list, modelIndex, list.size() >> 1);
  }

  /**
   * to find the position of the model in the list which's index equal to the given modelIndex
   * use the method call to get the model index
   * 
   * @param list
   *          the arraylist of the model
   * @param modelIndex
   *          the index of the model 1-based
   * @param method
   *          the method to determin the model index
   * @return
   */
  public static Position search(List list, int modelIndex, Method getMethod, Method repeatMethod)
  {
    return search(list, modelIndex, 0, list.size() - 1, list.size() >> 1, getMethod, repeatMethod);
  }
  
  /**
   * to find the position of the model in the list which's index equal to the given modelIndex
   * 
   * @param list
   *          the arraylist of the model
   * @param modelIndex
   *          the index of the model 1-based
   * @param mid
   *          predict a mid in case can accelerate the search
   * 
   * @return
   */
  public static Position search(List list, int modelIndex, int mid)
  {
    return search(list, modelIndex, 0, list.size() - 1, mid, null, null);
  }

  /**
   * to find the position of the model in the list which's index equal to the given modelIndex, !!!sIndex and eIndex used to reduce the
   * scope for search, be attention, if do not know the exactly correct value, do not use it
   * 
   * @param list
   * @param modelIndex
   *          : 1-based
   * @param sIndex
   *          : 0-based must be >=0 && < list.size()
   * @param eIndex
   *          : 0-based must be >=0 && < list.size()
   * @return
   */
  public static Position search(List list, int modelIndex, int sIndex, int eIndex, int mid, Method getMethod, Method repeatMethod)
  {
    if (null == list || list.isEmpty() || modelIndex < 0 || sIndex > eIndex)
      return new Position(false, -1);
    int low = 0, high = list.size() - 1;
    if (sIndex > low && sIndex <= high)
      low = sIndex;
    if (eIndex >= sIndex && eIndex < high)
      high = eIndex;
    if (high > modelIndex)
      high = modelIndex;
    if (mid < low || mid > high)
    {
      mid = (low + high) >> 1;
    }
    while (low <= high)
    {
      BasicModel model = (BasicModel) list.get(mid);
      int start, rn;
      try{
        if(getMethod != null)
          start = (Integer)getMethod.invoke(model, null);
        else
          start = model.getIndex();
        if(repeatMethod != null)
          rn = (Integer)repeatMethod.invoke(model, null);
        else
          rn = model.getRepeatedNum();
      }catch(InvocationTargetException ite) {
        start = model.getIndex();
        rn = model.getRepeatedNum();
      } catch(IllegalAccessException iae) {
        start = model.getIndex();
        rn = model.getRepeatedNum();
      }
      int end = start + rn;
      if (modelIndex >= start && modelIndex <= end)
        return new Position(true, mid);
      if (modelIndex < start)
        high = mid - 1;
      else
        low = mid + 1;
      mid = (low + high) >> 1;
    }
    return new Position(false, high);
  }

  /**
   * insert the model into list by ascending order,if the model already exists in the index, returning the existing model
   * 
   * @param list
   *          : should not be null
   * @param model
   */
  public static Position insert(List list, BasicModel model)
  {
    return insert(list, model, list.size() >> 1);
  }
  
  /**
   * insert the model into list by ascending order,if the model already exists in the index, returning the existing model
   * 
   * the model index is given by method calling
   * @param list
   *          : should not be null
   * @param model
   * @param method
   */
  public static Position insert(List list, BasicModel model, Method getMethod, Method repeatMethod)
  {
    return insert(list, model, 0, list.size() - 1, list.size() >> 1, getMethod, repeatMethod);
  }

  /**
   * insert the model into list by ascending order
   * 
   * @param list
   *          : should not be null
   * @param model
   * @return Position : if Position.isFind is true means the model is already in the list, Position.index is its position else insert the
   *         model into the list, Position.index is its position
   */
  public static Position insert(List list, BasicModel model, int mid)
  {
    return insert(list, model, 0, list.size() - 1, mid, null, null);
  }

  /**
   * insert the model into list by ascending order sIndex and eIndex used to reduce the scope for search, be attention, if do not know the
   * exactly correct value, do not use it
   * 
   * @param list
   * @param model
   * @param sIndex
   * @param eIndex
   * @param mid
   * @param method the method to get the modelIndex of given model
   * @return
   */
  public static Position insert(List list, BasicModel model, int sIndex, int eIndex, int mid, Method getMethod, Method repeatMethod)
  {
    if (null == list || null == model)
      return new Position(false, -1);
    int modelIndex;
    try{
      if(getMethod != null)
        modelIndex = (Integer)getMethod.invoke(model, null);
      else
        modelIndex = model.getIndex();
    }catch(InvocationTargetException ite) {
      modelIndex = model.getIndex();
    } catch(IllegalAccessException iae) {
      modelIndex = model.getIndex();
    }
    Position pos = search(list, modelIndex, sIndex, eIndex, mid, getMethod, repeatMethod);
    // the model is already in the list
    if (pos.isFind)
      return pos;
    int index = pos.index < 0 ? 0 : pos.index + 1;
    list.add(index, model);
    pos.index = index;

    return pos;
  }

  /**
   * merge the model at index position in the list with its neighbors, if they can be merged
   * 
   * @param list
   *          the arraylist of the model
   * @param index
   *          the index the model in the list
   * @param Direction
   * @return : the index of the merged model, -1 means wrong index
   */
  public static int merge(List list, int index, Direction dire)
  {
    int size = list.size();
    if (index < 0 || index >= size)
      return -1;
    BasicModel cModel = (BasicModel) list.get(index);
    if (dire == Direction.BOTH || dire == Direction.BACKWARD)
    {
      int nIndex = index + 1;
      if (nIndex < size)
      {
        BasicModel lModel = (BasicModel) list.get(nIndex);
        if (cModel.isMergable(lModel))
        {
          int repeatedNum = cModel.getRepeatedNum() + lModel.getRepeatedNum() + 1;
          cModel.setRepeatedNum(repeatedNum);
          list.remove(nIndex);
        }
      }
    }
    if (dire == Direction.BOTH || dire == Direction.FORWARD)
    {
      int pIndex = index - 1;
      if (pIndex >= 0)
      {
        BasicModel pModel = (BasicModel) list.get(pIndex);
        if (cModel.isMergable(pModel))
        {
          int repeatedNum = pModel.getRepeatedNum() + cModel.getRepeatedNum() + 1;
          pModel.setRepeatedNum(repeatedNum);
          list.remove(index);
          index = pIndex;
        }
      }
    }
    return index;
  }

  public static int merge(List list, int index)
  {
    return merge(list, index, Direction.BOTH);
  }

  /**
   * split the model in the index position into 3 parts: the previous model, the model index start with modelIndex without repeatednum, the
   * latter part
   * 
   * @param list
   *          the arraylist of the model
   * @param index
   *          the index the model need to be splitted in the list
   * @param modelIndex
   *          1-based return integer -1 means the node could not been divided, otherwise the index of the node which start index is
   *          modelIndex
   */
  public static int split(List list, int index, int modelIndex)
  {
    int nIndex = divide(list, index, modelIndex);
    if (nIndex == -1)
      return -1;
    divide(list, nIndex, modelIndex + 1);
    return nIndex;
  }

  /**
   * divde the model in the index position into 2 parts: the previous model, the model index start with modelIndex
   * 
   * @param list
   *          the arraylist of the model
   * @param index
   *          the index the model need to be splitted in the list
   * @param modelIndex
   *          1-based return -1 means the node could not been divided, otherwise the index of the new add node
   * @return the index of the model start with modelIndex
   */
  public static int divide(List list, int index, int modelIndex)
  {
    if (null == list || list.isEmpty() || index < 0 || modelIndex < 0)
      return -1;
    int size = list.size();
    if (index >= size)
      return -1;
    BasicModel model = (BasicModel) list.get(index);
    int start = model.getIndex();
    if (start == modelIndex)
      return index;
    int end = start + model.getRepeatedNum();
    if (modelIndex < start || modelIndex > end)
      return -1;

    BasicModel nModel = null;

    if (model instanceof Row)
    {
      nModel = new Row(modelIndex, (Row) model);
    }
    else if (model instanceof Column)
    {
      nModel = new Column(modelIndex, (Column) model);
    }
    else
    {
      nModel = new StyleCell(modelIndex, (StyleCell) model);
    }
    int pRepNum = modelIndex - 1 - start;
    int lRepNum = end - modelIndex;
    model.setRepeatedNum(pRepNum);
    nModel.setRepeatedNum(lRepNum);
    list.add(index + 1, nModel);
    return index + 1;
  }

  /**
   * compare two ranges by their range info(contain sheetId, start/end row/col index) if given range is not valid, return
   * RangeRelation.INVALID
   * 
   * @param range1
   * @param range2
   * @return RangeRelation
   */
  public static RangeRelation compareRange(RangeInfo range1, RangeInfo range2)
  {
    int sC1 = range1.getStartCol();
    int eC1 = range1.getEndCol();
    int sR1 = range1.getStartRow();
    int eR1 = range1.getEndRow();
    if (sC1 < 0 || eC1 < 0 || sR1 < 0 || eR1 < 0)
      return RangeRelation.INVALID;
    int sC2 = range2.getStartCol();
    int eC2 = range2.getEndCol();
    int sR2 = range2.getStartRow();
    int eR2 = range2.getEndRow();
    if (sC2 < 0 || eC2 < 0 || sR2 < 0 || eR2 < 0)
      return RangeRelation.INVALID;
    boolean hasSameSheet = false;
    if (range1.getSheetId() == IDManager.INVALID && range2.getSheetId() == IDManager.INVALID)
      hasSameSheet = true;
    else if (range1.getSheetId() == range2.getSheetId())
      hasSameSheet = true;
    if (hasSameSheet)
    {
      if ((sR1 == sR2) && (eR1 == eR2) && (sC1 == sC2) && (eC1 == eC2))
        return RangeRelation.EQUAL;
      if ((sR1 >= sR2) && (eR1 <= eR2) && (sC1 >= sC2) && (eC1 <= eC2))
        return RangeRelation.SUBSET;
      if ((sR1 <= sR2) && (eR1 >= eR2) && (sC1 <= sC2) && (eC1 >= eC2))
        return RangeRelation.SUPERSET;
      boolean rowHasIntersect = !((eR1 < sR2) || (eR2 < sR1));
      boolean colHasIntersect = !((eC1 < sC2) || (eC2 < sC1));
      if (rowHasIntersect && colHasIntersect)
      {
        return RangeRelation.INTERSECTION;
      }
      else
        return RangeRelation.NOINTERSECTION;
    }
    return RangeRelation.NOINTERSECTION;
  }

  public static RangeInfo getRangeInfoFromParseRef(ParsedRef ref, int sheetId)
  {
    return getRangeInfoFromParseRef(ref, sheetId, sheetId);
  }
  /**
   * return the range info which has sheet id, and start row, start column, end row, end column four index from given parsedRef
   * if the parsedRef is row, then the start column index is 1 and end column index is MAX_COL_NUM(1024 for now)
   * if the parsedRef is col, then the start row index is 1 and end row index is MAX_ROW_NUM(1048576 for now)
   * @param ref
   * @param sheetId
   * @param endSheetId
   * @return range info
   */
  public static RangeInfo getRangeInfoFromParseRef(ParsedRef ref, int sheetId, int endSheetId)
  {
    int startCol, endCol, startRow, endRow;
    if (ParsedRefType.CELL == ref.type)
    {
      startRow = ref.getIntStartRow();
      endRow = startRow;
      startCol = ref.getIntStartCol();
      endCol = startCol;
    }
    else if (ParsedRefType.COLUMN == ref.type)
    {
      startRow = 1;
      endRow = ConversionConstant.MAX_ROW_NUM;
      startCol = ref.getIntStartCol();
      if(ref.endCol == null)
        endCol = startCol;
      else
        endCol = ref.getIntEndCol();
    }
    else if (ParsedRefType.ROW == ref.type)
    {
      // row reference
      startRow = ref.getIntStartRow();
      if(ref.endRow == null)
        endRow = startRow;
      else
        endRow = ref.getIntEndRow();
      startCol = 1;
      endCol = ConversionConstant.MAX_COL_NUM;
    }
    else
    {
      startRow = ref.getIntStartRow();
      endRow = ref.getIntEndRow();
      startCol = ref.getIntStartCol();
      endCol = ref.getIntEndCol();
    }
    RangeInfo info = new RangeInfo(sheetId, endSheetId, startRow, startCol, endRow, endCol, ref.type);
    return info;
  }
  
  public static int getRefMaskByType(ParsedRefType type)
  {
    int refMask = ReferenceParser.RANGE_PATTERN_MASK;
    if (type == ParsedRefType.COLUMN)
      refMask = ReferenceParser.COL_PATTERN_MASK;
    else if(type == ParsedRefType.ROW)
      refMask = ReferenceParser.ROW_PATTERN_MASK;
    return refMask;
  }
  //TODO:
//  public ParsedRefType getRefTypeByMask(int mask)
//  {
//    
//  }
  
  public static String getAddress(String sheetName, int startRow, int startCol, String endSheetName, 
      int endRow, int endCol, int refPatternMask, boolean bInvalidSheetName)
  {
    ParsedRef ref = getParsedRef(sheetName, startRow, startCol, endSheetName, endRow, endCol, refPatternMask);
    return ref.getAddressByMask(refPatternMask, bInvalidSheetName);
  }
  
  public static ParsedRef getParsedRef(String sheetName, int startRow, int startCol, String endSheetName, 
      int endRow, int endCol, int refPatternMask)
  {
    String sSheet = sheetName;
    String eSheet = (endSheetName!=null && !endSheetName.equals(sheetName)) ? endSheetName: null;
    String sr = null;
    String er = null;
    String sc = null;
    String ec = null;
    if ((refPatternMask & ReferenceParser.START_SHEET) > 0)
    {
      if ((refPatternMask & ReferenceParser.END_SHEET) > 0)
      {
        if ((refPatternMask & ReferenceParser.EMPTY_END_SHEET) > 0)
          eSheet = "";
        else if (eSheet == null) {
          eSheet = sheetName;
        }
      }
    }
    if ((refPatternMask & ReferenceParser.START_ROW) > 0)
      sr = ReferenceParser.translateRow(startRow);
    if ((refPatternMask & ReferenceParser.END_ROW) > 0)
      er = ReferenceParser.translateRow(endRow);
    if ((refPatternMask & ReferenceParser.START_COLUMN) > 0)
      sc = ReferenceParser.translateCol(startCol);
    if ((refPatternMask & ReferenceParser.END_COLUMN) > 0)
      ec = ReferenceParser.translateCol(endCol);
    // the ref also has the right type
    ParsedRef ref = new ParsedRef(sSheet, sr, sc, eSheet, er, ec);
    ref.patternMask = refPatternMask;
    return ref;
  }
  
  /**
   * return a new ParsedRef which is the integrity pattern of given ref
   * if the given ref is single cell, then the returned ref will also set the end row/col which is the same as start row/col
   * if the give ref is a single row, then the returned ref will set the end row which is the same as start row
   * if the given ref is a single column, then the returned ref will set the end column which is the same as start column
   * @param ref
   */
  public static ParsedRef getIntegrityParsedRef(ParsedRef parsedRef)
  {
    if(parsedRef == null)
      return null;
    String sr = parsedRef.startRow;
    String er = parsedRef.endRow;
    String sc = parsedRef.startCol;
    String ec = parsedRef.endCol;
    if (ParsedRefType.CELL == parsedRef.type)
    {
      er = sr;
      ec = sc;
    }else if(er == null && ParsedRefType.ROW == parsedRef.type)
    {
      er = sr;
    }else if(ec == null && ParsedRefType.COLUMN == parsedRef.type)
    {
      ec = sc;
    }
    ParsedRef integrityRef = new ParsedRef(parsedRef.sheetName, sr, sc, parsedRef.endSheetName, er, ec);
    return integrityRef;
  }
  
  public static boolean isValidRow(int row)
  {
    return ( row >= 1 && row <= ConversionConstant.MAX_ROW_NUM);
  }
  
  public static boolean isValidCol(int col)
  {
    return ( col >= 1 && col <= ConversionConstant.MAX_COL_NUM);
  }
  /**
   * Transform the formula cell with the reference change rowDelta and colDelta except the absolute address type
   * @param cell    the formula cell
   * @param rowDelta delta for reference row index 
   * @param colDelta delta for reference column index
   */
  public static void transformFormula(ValueCell cell, int rowDelta, int colDelta)
  {
    if(cell != null && cell.isFormula() && cell.getFormulaCell() != null)
    {
      FormulaCell fc = cell.getFormulaCell();
      List<FormulaToken> tokens = fc.getTokenList();
      if(tokens != null)
      {
        Sheet sheet = cell.getParent().getParent();
        Document doc = sheet.getParent();
        for(int i = 0; i < tokens.size(); i++)
        {
          FormulaToken token = tokens.get(i);
          Area area = token.getArea();
          if(area != null)
          {
            ReferenceToken rt = (ReferenceToken)token;
            int sheetId = area.getSheetId();
            if(sheetId != sheet.getId())
              continue;
            if(!rt.isValid())
              continue;//TODO: for invalid area, still can do transform
            ParsedRef ref = rt.getParsedRef();
            boolean bChange = false;
            if(rowDelta != 0)
            {
              bChange |= addIndentForReference(ref, rowDelta, true);
            }
            if(colDelta != 0)
            {
              bChange |= addIndentForReference(ref, colDelta, false);
            }
            if(bChange)
            {
              RangeInfo range = getRangeInfoFromParseRef(ref, area.getSheetId(), area.getEndSheetId());
//              fc.deleteRef(token);
              doc.getAreaManager().endListeningArea(area, fc);
              boolean bWholeRowCol = (ref.type == ParsedRefType.ROW || ref.type == ParsedRefType.COLUMN);
              Area newArea = doc.getAreaManager().startListeningArea(range, fc, null);
              rt.setArea(newArea);
              if(newArea == null)
                rt.setChangeText(ref.toString());
              rt.setRefMask(ref.patternMask);//the mask might be swapped by addIndentForReference
//              fc.pushRef(token, i);
            }
          }
        }
        cell.updateFormula();
      }
    }
  }
  
  /**
   * add the delta index for parsed reference 
   * @param ref parsedRef
   * @param delta   delta index
   * @param bRow    make delta change on row or column
   * @return true if delta change has been added to ref
   */
  public static boolean addIndentForReference(ParsedRef ref, int delta, boolean bRow)
  {
    boolean bChange = false;
    if (ref != null && delta != 0)
    {
      int absoluteStart, absoluteEnd;// absolute type of start and end index
      if (bRow)
      {
        absoluteStart = ref.patternMask & ReferenceParser.ABSOLUTE_ROW;
        absoluteEnd = ref.patternMask & ReferenceParser.ABSOLUTE_END_ROW;
      }
      else
      {
        absoluteStart = ref.patternMask & ReferenceParser.ABSOLUTE_COLUMN;
        absoluteEnd = ref.patternMask & ReferenceParser.ABSOLUTE_END_COLUMN;
      }
      // if not both of the start and end are aboslute type, then do delta index change
      if (!(absoluteStart > 0 && absoluteEnd > 0))
      {
        int start, end;
        if (bRow)
        {
          start = ref.getIntStartRow();
          end = ref.getIntEndRow();
        }
        else
        {
          start = ref.getIntStartCol();
          end = ref.getIntEndCol();
        }
        if (absoluteStart == 0 && start >= 0)
        {
          start += delta;
          bChange = true;
        }
        if (absoluteEnd == 0 && end >= 0)
        {
          end += delta;
          bChange = true;
        }
        if (start >= 0 && end >= 0 && start > end)
        {
          int n = start;
          start = end;
          end = n;
          ref.patternMask = ReferenceParser.swapAbsoluteType(ref.patternMask, bRow);
          bChange = true;
        }
        if (bRow)
        {
          start = start > ConversionConstant.MAX_ROW_NUM ? ConversionConstant.MAX_ROW_NUM : start;
          ref.startRow = ReferenceParser.translateRow(start);// if start
          end = end > ConversionConstant.MAX_ROW_NUM ? ConversionConstant.MAX_ROW_NUM : end;
          ref.endRow = ReferenceParser.translateRow(end);
        }
        else
        {
          start = start > ConversionConstant.MAX_COL_NUM ? ConversionConstant.MAX_COL_NUM : start;
          ref.startCol = ReferenceParser.translateCol(start);
          end = end > ConversionConstant.MAX_COL_NUM ? ConversionConstant.MAX_COL_NUM : end;
          ref.endCol = ReferenceParser.translateCol(end);
        }
      }
    }
    return bChange;
  }

  /**
   * Put an object to a list at any location. If list size smaller than index, list grows.
   * 
   * @param l
   * @param index
   * @param o
   */
  public static <T> void putToList(List<T> l, int index, T o)
  {
    int s = l.size();
    if (index < s)
    {
      l.set(index, o);
    }
    else
    {
      for (int i = s; i < index; i++)
      {
        l.add(null);
      }
      l.add(o);
    }
  }

  public static <T> T safeGetList(List<T> l, int index)
  {
    if (index < l.size())
    {
      return l.get(index);
    }
    else
    {
      return null;
    }
  }

  public static <K, V> void iterateMap(Map<K, V> m, IMapEntryListener<K, V> l)
  {
    if(m == null)
      return;
    Set<Entry<K, V>> set = m.entrySet();
    for (Iterator<Entry<K, V>> iterator = set.iterator(); iterator.hasNext();)
    {
      Entry<K, V> entry = iterator.next();
      if (l.onEntry(entry.getKey(), entry.getValue()))
      {
        break;
      }
    }
  }

  public static <T> Set<T> getIntersection(Set<T> setA, Set<T> setB)
  {
    if (null == setA || null == setB)
      return null;

    Set<T> setIntersection = new HashSet<T>();
    T item;

    Iterator<T> iterA = setA.iterator();
    while (iterA.hasNext())
    {
      item = iterA.next();
      if (setB.contains(item))
        setIntersection.add(item);
    }
    return setIntersection;
  }

  /**
   * Convert a set style message to a set range message.
   * 
   * @return
   */
  public static JSONObject styleToRangeMessage(ParsedRef ref, JSONObject styleJson)
  {
    JSONObject data = new JSONObject();
    JSONObject rows = new JSONObject();
    data.put(ConversionConstant.ROWS, rows);
    JSONObject row = new JSONObject();

    int start, repeat;

    if (ParsedRefType.COLUMN == ref.type)
    {
      // column reference, make row start from 1, repeat to end
      start = 1;
      repeat = ConversionConstant.MAX_ROW_NUM - 1;
    }
    else
    {
      start = ref.getIntStartRow();
      repeat = ref.getIntEndRow() - ref.getIntStartRow();
    }

    rows.put(Integer.toString(start), row);
    if (repeat > 0)
    {
      row.put(ConversionConstant.REPEATEDNUM, repeat);
    }
    
    JSONObject cells = new JSONObject();
    row.put(ConversionConstant.CELLS, cells);

    String startCol;

    if (ParsedRefType.ROW == ref.type)
    {
      startCol = "A";
      repeat = ConversionConstant.MAX_COL_NUM - 1;
    }
    else
    {
      startCol = ref.getStartCol();
      repeat = ref.getIntEndCol() - ref.getIntStartCol();
    }

    JSONObject cell = new JSONObject();
    cells.put(startCol, cell);
    cell.put(ConversionConstant.STYLE, styleJson);
    if (repeat > 0)
    {
      cell.put(ConversionConstant.REPEATEDNUM, repeat);
    }

    return data;
  }
  
  /**
   * Returns if the JSON has style. This method is to tell <em>undo set value</em> messages from <em>undo set style</em> messages. To
   * quickly return a result, it also uses "style" to quickly return false.
   * 
   * @param json
   * @return
   */
  public static boolean isJSONContainsValue(JSONObject json)
  {
    if (json.containsKey(ConversionConstant.VALUE) || json.containsKey(ConversionConstant.VALUE_A)
        || json.containsKey(ConversionConstant.LINK))
    {
      // first level has value, return
      return true;
    }
    else if (json.containsKey(ConversionConstant.STYLE) || json.containsKey(ConversionConstant.STYLEID_A))
    {
      return false;
    }
    else
    {
      Queue<JSONObject> queue = new LinkedList<JSONObject>();
      queue.add(json);
      while (!queue.isEmpty())
      {
        json = queue.remove();
        // json must don't have value, or styles, check its values
        Iterator iter = json.values().iterator();
        while (iter.hasNext())
        {
          Object o = iter.next();
          if (o instanceof JSONObject)
          {
            // quick exit
            JSONObject jo = (JSONObject) o;
            if (jo.containsKey(ConversionConstant.VALUE) || jo.containsKey(ConversionConstant.VALUE_A)
                || jo.containsKey(ConversionConstant.LINK))
            {
              return true;
            }
            else if (jo.containsKey(ConversionConstant.STYLE) || jo.containsKey(ConversionConstant.STYLEID_A))
            {
              return false;
            }
            else
            {
              queue.add(jo);
            }
          }
          // else, ignore
        }
      }

      return false;
    }
  }
  
  /**
   * Check if the text matches formula pattern.
   * 
   * @param text
   * @return
   */
  public static boolean isFormula(String text)
  {
    if (text.startsWith("=") && text.length()>1)
      return true;
    else
      return false;
  }
  @SuppressWarnings("unchecked")
  public static JSONObject constructEventByColStyle(JSONObject colsMeta, StyleManager styleManager)
  {
    final JSONObject event = new JSONObject();
    iterateMap(colsMeta, new IMapEntryListener<String, JSONObject>()
    {
      public boolean onEntry(String colIndex, JSONObject colMeta)
      {
        if(colMeta.containsKey(ConversionConstant.STYLE))
        {
          JSONObject col = new JSONObject();
          col.put(ConversionConstant.STYLE, colMeta.get(ConversionConstant.STYLE));
          Object rep = colMeta.get(ConversionConstant.REPEATEDNUM);
          if(null != rep)
            col.put(ConversionConstant.REPEATEDNUM, rep);
          event.put(colIndex, col);
        }
        return false;
      }
    });
    return event;
  }

  /**
   * Helper interface for easily iterate over a map.
   */
  public static interface IMapEntryListener<K, V>
  {
    /**
     * Called for every entry found in a map. Return true to halt the iteration.
     * 
     * @param e
     * @return
     */
    public boolean onEntry(K key, V value);
  }

  /**
   * <p>
   * Convert string ID to integer ID.
   * <p>
   * Row ID, column ID need to convert. Number ID uses an 32b integer.
   * <p>
   * <table>
   * <tr>
   * <td>31</td>
   * <td>30 ~ 27</td>
   * <td>26 ~ 0</td>
   * </tr>
   * <tr>
   * <td>Reserved</td>
   * <td>ID Type</td>
   * <td>ID Content</td>
   * </tr>
   * <table>
   * <p>
   * For ID Types, 4 bits are reserved, totally 16 types are possible.
   * 
   * <table>
   * <tr>
   * <th>ID Type</th>
   * <th>ID Text</th>
   * <th>Code</th>
   * </tr>
   * <tr>
   * <td>Style Id</td>
   * <td>"ce"</td>
   * <td>0x0</td>
   * </tr>
   * <tr>
   * <td>Original Row Id</td>
   * <td>"or"</td>
   * <td>0x1</td>
   * </tr>
   * <tr>
   * <td>Row Id</td>
   * <td>"ro"</td>
   * <td>0x2</td>
   * </tr>
   * <tr>
   * <td>Original Column Id</td>
   * <td>"oc"</td>
   * <td>0x3</td>
   * </tr>
   * <tr>
   * <td>Column Id</td>
   * <td>"co"</td>
   * <td>0x4</td>
   * </tr>
   * <tr>
   * <td>Original Sheet Id</td>
   * <td>"os"</td>
   * <td>0x5</td>
   * </tr>
   * <tr>
   * <td>Sheet Id</td>
   * <td>"st"</td>
   * <td>0x6</td>
   * </tr>
   * <tr>
   * <td>Range Id</td>
   * <td>"ra"</td>
   * <td>0x7</td>
   * </tr>
   * <tr>
   * <td>Preserved Range Id</td>
   * <td>"n"</td>
   * <td>0x8</td>
   * </tr>
   * <table>
   * 
   * @param id
   */
  public static int toNumberId(String id)
  {
    if (ConversionConstant.MAX_REF.equals(id))
      return IDManager.MAXID;
    try {
	    String idType = id.substring(0, 2);
	    Integer o = idTypeToNumber.get(idType);
	    if (o == null)
	    {
	      LOG.log(Level.WARNING, "cannot convert id {0} to number, ", id);
	      return IDManager.INVALID;
	    }
	      return typedId(o, stripIdType(id));
    }
    catch (NumberFormatException e)
    {
      LOG.log(Level.WARNING, "cannot convert id {0} to number, exception occured, ", id);
      return IDManager.INVALID;
    }
    catch (IndexOutOfBoundsException e)
    {
      LOG.log(Level.WARNING, "cannot convert id {0} to number, exception occured, ", id);
      return IDManager.INVALID;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "cannot convert id {0} to number, exception occured, ", id);
      return IDManager.INVALID;
    }
  }

  public static int toNumberIdType(String id)
  {
    if (ConversionConstant.MAX_REF.equals(id))
    {
      LOG.log(Level.WARNING, "id {0} is refered by range for max row id which can not covert to number", id);
      return IDManager.INVALID;
    }
    String idType = id.substring(0, 2);
    Integer o = idTypeToNumber.get(idType);
    if (o == null)
    {
      LOG.log(Level.WARNING, "Can't convert id {0} to number, ", id);
      return IDManager.INVALID;
    }
    return o;
  }

  public static String toStringIdType(int id)
  {
    return idNumberToType[id >> 27];
  }

  /**
   * <p>
   * Convert preserve range string ID to integer ID.
   * <p>
   * Preserve range id take the form of nX-Y or nX. Use a 32-bit integer id to represent.
   * <p>
   * <table border="1px">
   * <tr>
   * <td>31</td>
   * <td>30 ~ 27</td>
   * <td>26 ~ 4</td>
   * <td>3 ~ 0</td>
   * </tr>
   * <tr>
   * <td>Reserved</td>
   * <td>0x8 (ID Type for preserve range)</td>
   * <td>X</td>
   * <td>Y, 0xF if original id is nX.</td>
   * </tr>
   * <table>
   * <p>
   * For Y, 4 bits are reserved, 0xF for not exists, largest Y will be 15.
   * 
   * @param id
   */
  public static int toPreserveNumberId(String id)
  {
    // index of '-'
    int index = id.indexOf('-');
    int ret = PRESERVE_RANGE_TYPE_MASK;
    int x, y;

    try
    {
      int startIndex = 1;
      if(id.indexOf("img") > -1)
      {
        ret = PRESERVE_IMG_RANGE_TYPE_MASK;
        startIndex = 3;
      }
      if (index > -1)
      {
        // id is nX-Y form or imgX-Y form
        x = Integer.parseInt(id.substring(startIndex, index));
        y = Integer.parseInt(id.substring(index + 1));
        if (y > 15)
        {
          // y overflow the preserve int code
          LOG.log(Level.WARNING, "Can't convert preserve range id {0} to number, since inner number greater than 15.", id);
          return IDManager.INVALID;
        }
        return ret | (x << 4) | y;
      }
      else
      {
        // id is nX form or imgX form
        x = Integer.parseInt(id.substring(startIndex));
        return ret | (x << 4) | 0xF;
      }
    }
    catch (NumberFormatException e)
    {
      LOG.log(Level.WARNING, "Can't convert preserve range id {0} to number, ", id);
      return IDManager.INVALID;
    }
  }

  public static int stripIdType(String id)
  {
	try{
		return Integer.parseInt(id.substring(2));
	}
	catch (IndexOutOfBoundsException e)
    {
      LOG.log(Level.WARNING, "cannot convert id {0} to number, exception occured, ", id);
      return IDManager.INVALID;
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "cannot convert id {0} to number, exception occured, ", id);
      return IDManager.INVALID;
    }
  }

  /**
   * Return number part of a number id and parse it to int.
   * 
   * @param id
   * @return
   */
  public static int stripIdType(int id)
  {
    return MASK_ID_TYPE & id;
  }

  /**
   * Add ID type to high 30 ~ 27 bit of the id, returning the new id.
   * 
   * @param idType
   * @param id
   * @return
   */
  public static int typedId(int idType, int id)
  {
    return (idType << 27) | id;
  }
  
  /**
   * check if the id is the orignial id(covert from ods file)
   * the original string id is start with "or","oc","os"
   * @param id
   * @return
   */
  public static boolean isOriginalId(int id)
  {
    int idType = id >> 27;
    switch(idType)
    {
      case 1:
      case 3:
      case 6:
        return true;
    }
    return false;
  }

  /**
   * <p>
   * Util class to covert number ID to {@link SerializableString} ID used in JSON drafts. Note that this class <strong>is not</strong>
   * thread safe.
   * <p>
   * For serialization only. Binded to Jackson {@link SerializableString} interface to benefit serialization performance.
   * <p>
   * IDs except styles should all goes through this method to gain serializable string id.
   * <p>
   * Sheet, row, column ID will be re-coded to compress the ID coding space.
   */
  public static class SerializableStringIdConvertor
  {
    private char[][] idNumberToBuf;

    // ID counts for row and column id
    private int rowCount, columnCount, styleCount;
    
    // max sheet ID converted, need to pass from recovery document to main document as init sheet id
    private int maxSheetId;
    
    // the recover reference count used for main document to create unnamed range if recover document exist
    private int recRefCount;

    // Initial ID counts for row, column and style id , this is used for main document if recover document exist
    private int initRowCount, initColumnCount, initStyleCount, initSheetCount;

    // ID cache used for serializable string id convertion
    private Map<Integer, SerializableString> idCache;
    
    private Set<String> strIdCache;

    /**
     * Last converted ID string length.
     */
    public int idLength;

    public SerializableStringIdConvertor()
    {
      rowCount = 1;
      columnCount = 1;
      styleCount = 1;

      initRowCount = 1;
      initColumnCount = 1;
      initStyleCount = 1;
      
      maxSheetId = 0;

      idCache = new HashMap<Integer, SerializableString>();
      idNumberToBuf = new char[idNumberToType.length][15];
      for (int i = 0; i < idNumberToType.length; i++)
      {
        char[] buf = idNumberToBuf[i];
        String type = idNumberToType[i];
        type.getChars(0, type.length(), buf, 0);
      }
    }

    public void setInitRowCount(int cnt)
    {
      int maxCount = rowCount < cnt? cnt:rowCount;
      initRowCount = maxCount;
      rowCount = maxCount;
    }

    /**
     * Set initial id count for row, column, sheet and style. Because the recover document and the main document should not has the same
     * sheet id, In case the id mixed when recover the deleted sheet to the main document
     * 
     * @param sheet
     */
    public int getInitRowCount()
    {
      return initRowCount;
    }

    public int getRowCount()
    {
      return rowCount;
    }

    public void setInitColumnCount(int cnt)
    {
      int maxCount = columnCount < cnt? cnt:columnCount;
      initColumnCount = maxCount;
      columnCount = maxCount;
    }

    public int getInitColumnCount()
    {
      return initColumnCount;
    }

    public int getColumnCount()
    {
      return columnCount;
    }

    public void setInitStyleCount(int cnt)
    {
      int maxCount = styleCount < cnt? cnt:styleCount;
      initStyleCount = maxCount;
      styleCount = maxCount;
    }

    public int getInitStyleCount()
    {
      return initStyleCount;
    }
    
    public int getStyleCount()
    {
      return styleCount;
    }
    
    public int getInitSheetId()
    {
      return initSheetCount;
    }

    public void setInitSheetId(int initSheetCount)
    {
      this.initSheetCount = initSheetCount;
    }
    
    public int getMaxSheetId()
    {
      return maxSheetId;
    }

    public void updateRecRefCount(String refId)
    {
      int rid = ModelHelper.stripIdType(refId);
      int cnt = rid + 1;
      recRefCount = recRefCount < cnt? cnt: recRefCount;
    }
    
    public String toStringId(int id)
    {
      char[] buf = toStringIdAsCharArray(id);
      return new String(buf, 0, idLength);
    }

    /**
     * <p>
     * Convert id to string according to code convention described in {@link ModelHelper#toNumberId(String)}. It is equal to
     * {@link Integer#toString(int)} but it outputs to a char[] buf instead of a string. The buffer starts at index 0 and ends before index
     * {@link SerializableStringIdConvertor#idLength}.
     * 
     * @param id
     *          number id
     * @param buf
     *          char buf
     * @param offset
     * @return length converted id string length
     */
    public char[] toStringIdAsCharArray(int id)
    {
      if (id < 0)
      {
        throw new IllegalArgumentException("id < 0");
      }

      int idType = id >> 27;
      int offset = idNumberToType[idType].length();
      id = stripIdType(id);
      idLength = stringSize(id) + offset;
      char[] buf = idNumberToBuf[idType];

      intToStringInBuf(id, idLength, buf);

      return buf;
    }

    /**
     * Convert number formed preserve range id to "nX" form or "nX-Y" form.
     * 
     * @param id
     * @return
     */
    public String toPreserveStringId(int id)
    {
      char[] buf = toPreserveStringIdAsCharArray(id);
      return new String(buf, 0, idLength);
    }

    /**
     * Convert number formed preserve range id to "nX" form or "nX-Y" form, as a char[] buf.
     * 
     * @param id
     * @return
     */
    public char[] toPreserveStringIdAsCharArray(int id)
    {
      char[] buf = idNumberToBuf[PRESERVE_ID_TYPE_NUMBER];
      int startIndex = 1;//"n" form
      if( (id & PRESERVE_IMG_RANGE_TYPE_MASK) == PRESERVE_IMG_RANGE_TYPE_MASK)
      {
        buf = idNumberToBuf[PRESERVE_IMG_ID_TYPE_NUMBER];
        startIndex = 3;//"img" form
      }
      // get 26 ~ 4 bits of id
      int x = (stripIdType(id) >> 4);
      // preserve id type length is 1 ("n") or 3 ("img")
      idLength = startIndex + stringSize(x);
      intToStringInBuf(x, idLength, buf);
      // get lower 4 bits of idS
      int y = id & PRESERVE_ID_Y_MASK;
      if (y != 0xF)
      {
        // has a latter "-y" part in id
        // append '-'
        buf[idLength] = '-';
        // append y part
        idLength += 1 + stringSize(y);
        intToStringInBuf(y, idLength, buf);
      }

      return buf;
    }

    /**
     * This is used for internal id which id is start from 0
     * rather than with idType
     * @param idType
     * @param id
     * @return
     */
    public SerializableString toSerializableStringId(int idType, int id)
    {
      id = typedId(idType, id);
      return toSerializableStringId(id);
    }
    /**
     * <p>
     * For serialization only. Binded to Jackson {@link SerializableString} interface to benefit serialization performance.
     * <p>
     * IDs including sheet ID, row ID and column ID should all go through this method to convert number ID to serializable string ID.
     * <p>
     * Row, column ID will be re-coded to tight the ID coding space.
     * <p>
     * Style ID should go through nextStyleId()
     */
    public SerializableString toSerializableStringId(int id)
    {
      if (id == IDManager.MAXID)
      {
        return MAX_REF_SER_STRING;
      }
      else if (id < 0)
      {
        throw new IllegalArgumentException("id < 0");
      }

      SerializableString result = idCache.get(id);
      if (result != null)
      {
        return result;
      }

      int idType = id >> 27;
      int oId = id;

      switch (idType)
        {
          case 0 :
            // style id, no cache, no re-coding
            LOG.log(Level.WARNING, "should not convert style ID with this method.");
            return null;
          case 1 :
          case 3 :
            // original row/column id which should not changed
            id = stripIdType(oId);
            break;
          case 2 :
            // row IDs
            id = rowCount++;
            break;
          case 4 :
            // column IDs
            id = columnCount++;
            break;
          case 5 :
            // sheet IDs should not changed, because client need getPartial which use sheetId as criteria
            id = stripIdType(oId);
            if (id > maxSheetId)
            {
              maxSheetId = id;
            }
            break;
          case 6 :
            // sheet IDs should not changed, because client need getPartial which use sheetId as criteria
            // "os" sheet IDs need not increase maxSheetId, since no new "os" sheet IDs could be created
            id = stripIdType(oId);
            break;
          case 10:
            // unname range id for recover reference referred by recover doc
            id = recRefCount++;
            break;
          default:
            LOG.log(Level.WARNING, "can't convert ID with type {0} in toSerializableStringId().", idType);
            return null;
        }

      int offset = idNumberToType[idType].length();
      idLength = stringSize(id) + offset;
      char[] buf = idNumberToBuf[idType];
      intToStringInBuf(id, idLength, buf);

      result = new SerializedString(new String(buf, 0, idLength));
      idCache.put(oId, result);
      return result;
    }

    /**
     * Return next style ID for serialization for this document.
     * 
     * @return
     */
    public SerializableString generateNextStyleId()
    {
      return new SerializedString(toStringId(styleCount++));
    }
    
    /**
     * Return next recover reference ID for serialization for this document.
     * 
     * @return
     */
    public SerializableString generateNextRecoverRangeId()
    {
      return toSerializableStringId(ID_TYPE_RECOVER_REF, recRefCount++);
    }

    /**
     * Is the ID been used (converted) before. Return true if in cache, this ID could be found.
     * 
     * @return
     */
    public boolean isIDUsed(int id)
    {
      return idCache.containsKey(id);
    }
    
    public void cacheStrId(String id)
    {
      if(strIdCache == null)
        strIdCache = new HashSet<String>();
      if(CommonUtils.hasValue(id))
        strIdCache.add(id);
    }
    
    public void shareIdCache(SerializableStringIdConvertor idConvertor2, int id)
    {
      SerializableString str = idConvertor2.idCache.get(id);
      if(str != null)
        idCache.put(id, str);
    }
    
    public boolean isIDUsed(String id)
    {
      // Notice that if cache is null return true directly
      // because when serialize, the recover document might exist in disk but not in memory
      // so recover doc does not need to serialize which will make strIdCache as null
      // main doc has no idea if the RECREF unnamed range need to export or not
      // so return true directly to make all these ranges exported conservatively
      return strIdCache == null || strIdCache.contains(id);
    }

    // int -> string method copied from Java Integer class
    private static void intToStringInBuf(int id, int charPos, char[] buf)
    {
      int q, r;

      // Generate two digits per iteration
      while (id >= 65536)
      {
        q = id / 100;
        // really: r = i - (q * 100);
        r = id - ((q << 6) + (q << 5) + (q << 2));
        id = q;
        buf[--charPos] = DigitOnes[r];
        buf[--charPos] = DigitTens[r];
      }

      // Fall thru to fast mode for smaller numbers
      // assert(i <= 65536, i);
      for (;;)
      {
        q = (id * 52429) >>> (16 + 3);
        r = id - ((q << 3) + (q << 1)); // r = i-(q*10) ...
        buf[--charPos] = digits[r];
        id = q;
        if (id == 0)
          break;
      }
    }

    // how many digits x have?
    private static int stringSize(int x)
    {
      for (int i = 0;; i++)
        if (x <= sizeTable[i])
          return i + 1;
    }

    // fields for integer -> string conversion
    private static final int[] sizeTable = { 9, 99, 999, 9999, 99999, 999999, 9999999, 99999999, 999999999, Integer.MAX_VALUE };

    private static final char[] DigitTens = { //
    '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', //
        '1', '1', '1', '1', '1', '1', '1', '1', '1', '1', //
        '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', //
        '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', //
        '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', //
        '5', '5', '5', '5', '5', '5', '5', '5', '5', '5', //
        '6', '6', '6', '6', '6', '6', '6', '6', '6', '6', //
        '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', //
        '8', '8', '8', '8', '8', '8', '8', '8', '8', '8', //
        '9', '9', '9', '9', '9', '9', '9', '9', '9', '9', //
    };

    private final static char[] DigitOnes = { //
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', //
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', //
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', //
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', //
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', //
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', //
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', //
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', //
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', //
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', //
    };

    /**
     * All possible chars for representing a number as a String
     */
    private final static char[] digits = { //
    '0', '1', '2', '3', '4', '5', //
        '6', '7', '8', '9', 'a', 'b', //
        'c', 'd', 'e', 'f', 'g', 'h', //
        'i', 'j', 'k', 'l', 'm', 'n', //
        'o', 'p', 'q', 'r', 's', 't', //
        'u', 'v', 'w', 'x', 'y', 'z' //
    };

    private static final int PRESERVE_ID_Y_MASK = 0xF;

    private static final int PRESERVE_ID_TYPE_NUMBER = 8;
    private static final int PRESERVE_IMG_ID_TYPE_NUMBER = 9;
    private static final int ID_TYPE_RECOVER_REF = 0xA;
    
    private static final SerializableString MAX_REF_SER_STRING = new SerializedString("M");

  }

  private static final Map<String, Integer> idTypeToNumber;

  private static final String[] idNumberToType;

  private static final int MASK_ID_TYPE = 0x7FFFFFF;

  // just for speed up since we already know the mask, to save a bitwise calculate.
  private static final int PRESERVE_RANGE_TYPE_MASK = 0x8 << 27;

  private static final int PRESERVE_IMG_RANGE_TYPE_MASK = 0x9 << 27;
  
  static
  {
    idNumberToType = new String[] { "ce", "or", "ro", "oc", "co", "st", "os", "ra", "n", "img", "rf" };
    idTypeToNumber = new HashMap<String, Integer>();

    for (int i = 0; i < idNumberToType.length; i++)
    {
      String type = idNumberToType[i];
      idTypeToNumber.put(type, i);
    }
  }

  // the pattern should same with the pattern in parseHelper.js's method isValidURL
  final private static Pattern PATTERN_URL = Pattern
      .compile(
          "^((http(s|)\\:\\/\\/)|(ftp\\:\\/\\/(([\\u0020-\\u00fe]+:[\\u0020-\\u00fe]+|anonymous)@)?))((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])(\\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])){3}|([a-zA-Z0-9]([a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,6})(:\\d+)?(\\/([\\d\\w\\@\\.\\%\\+\\-\\=\\&amp;\\?\\:\\\\\\&quot;\\'\\,\\|\\~\\;\\#])*)*$",
          Pattern.CASE_INSENSITIVE);

  final private static Pattern PATTERNLOOSE_URL = Pattern.compile(
      "^([\\d\\w\\/\\@\\.\\%\\+\\-\\=\\&amp;\\?\\:\\\\\\&quot;\\'\\,\\|\\~\\;\\#])*$", Pattern.CASE_INSENSITIVE);
  
  /* verify if valid url */
  public static boolean isValidURL(Object value)
  {
    if (value == null || !(value instanceof String))
      return false;
    String url = (String) value;
    String tmp = url.toLowerCase();
    if (tmp.indexOf("http://") == 0)
    {
      tmp = tmp.substring(7);// 7 is length of http://
      return PATTERNLOOSE_URL.matcher(url).matches();
    }
    if (tmp.indexOf("https://") == 0)
    {
      tmp = tmp.substring(8);// 8 is length of https://
      return PATTERNLOOSE_URL.matcher(url).matches();
    }
    if (tmp.indexOf("ftp://") == 0)
    {
      tmp = tmp.substring(6);// 6 is length of ftp://
      return PATTERNLOOSE_URL.matcher(url).matches();
    }
    if (tmp.indexOf("www.") == 0)
    {
      if (tmp.length() == 4)// 4 is length of www. if value is www. return false
        return false;
      tmp = tmp.substring(4);
      if (tmp.indexOf(".") == 0)// www.. return false
        return false;
      return PATTERNLOOSE_URL.matcher(url).matches();
    }
    return PATTERN_URL.matcher(url).matches();
  }
}
