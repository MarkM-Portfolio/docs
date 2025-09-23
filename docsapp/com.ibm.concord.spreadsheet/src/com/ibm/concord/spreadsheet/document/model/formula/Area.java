package com.ibm.concord.spreadsheet.document.model.formula;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.codehaus.jackson.SerializableString;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.AreaRelation;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeRelation;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.Broadcaster;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.EventSource;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * Represent a formula reference, if several formula refer to formula reference which are have the same address
 * then these formula references share the same area
 */
public class Area extends Broadcaster
{
  private static final Logger LOG = Logger.getLogger(Area.class.getName());
  
  protected RangeInfo rangeInfo;
  
  public Area next;
  public Area pre;
//  public Area pre;
  public int updateStatus; // calc from AreaUpdateInfo
  Document doc;
  private SerializableString serializedId;
  RangeUsage usage = ConversionUtil.RangeUsage.NORMAL;
  
  private String id;
  
  private JSONObject data;
  static enum AreaUpdateInfo
  {
    NONE(0),
    UPDATE(1),
    REMOVE(2),
    ADD(4),
    CHANGE(8);
    
    int info;
    AreaUpdateInfo(int i) {
      info = i;
    }
    
    public int getValue(){
      return info;
    }
  }
  public Area(RangeInfo info, String id, RangeUsage u, Document doc)
  {
    rangeInfo = info;
    this.doc = doc;
    this.usage = u;
    this.id = id;
    if(rangeInfo == null)
    {
      LOG.log(Level.WARNING, "should not create an area with null range info");
      rangeInfo = new RangeInfo(-1,-1,-1,-1,-1,-1, ParsedRefType.INVALID);
    }
    next = null;
    updateStatus = AreaUpdateInfo.NONE.getValue();
  }
  
  RangeInfo getRange()
  {
    return rangeInfo;
  }
  
  public int getSheetId()
  {
    return rangeInfo.getSheetId();
  }
  public int getEndSheetId()
  {
    return rangeInfo.getEndSheetId();
  }
  
  public int getStartRow()
  {
    return rangeInfo.getStartRow();
  }
  
  public int getStartCol()
  {
    return rangeInfo.getStartCol();
  }
  
  public int getEndRow()
  {
    return rangeInfo.getEndRow();
  }
  
  public int getEndCol()
  {
    return rangeInfo.getEndCol();
  }
  
  public ReferenceParser.ParsedRefType getType() 
  {
    return rangeInfo.getType();
  }
  
  public RangeUsage getUsage()
  {
    return usage;
  }
  
  public void setId(String d)
  {
    id = d;
  }
  
  public String getId()
  {
    return id;
  }
  
  public JSONObject getData()
  {
    return data;
  }
  
  public void setData(JSONObject d) 
  {
    data = d;
  }
  
  public void setRangeInfo(RangeInfo info) {
	rangeInfo = info;
  }

  public RangeInfo rangeIntersection(RangeInfo r)
  {
	  RangeRelation relation = ModelHelper.compareRange(rangeInfo, r);
	  if(relation == RangeRelation.EQUAL)
			return rangeInfo;
		if(relation == RangeRelation.SUBSET)
			return rangeInfo;
		if(relation == RangeRelation.SUPERSET)
			return r;
		if(relation == RangeRelation.INTERSECTION){
			int sC1 = r.getStartCol();
			int eC1 = r.getEndCol();
			int sR1 = r.getStartRow();
			int eR1 = r.getEndRow();
			int sC2 = getStartCol();
			int eC2 = getEndCol();
			int sR2 = getStartRow();
			int eR2 = getEndRow();
			int sR = sR1 >= sR2 ? sR1 : sR2;
			int eR = eR1 <= eR2 ? eR1 : eR2;
			int sC = sC1 >= sC2 ? sC1 : sC2;
			int eC = eC1 <= eC2 ? eC1 : eC2;
			
			RangeInfo info = new RangeInfo(getSheetId(), getEndSheetId(), sR, sC, eR, eC, ParsedRefType.RANGE);
			return info;
		}
		return null;
  }
  
  /**
   * compare two areas
   * first compare the start point, from row to col
   * if start point is equal, compare the end point
   * @param area
   * @return
   */
  public AreaRelation compare(RangeInfo r)
  {
    if(r != null)
    {
      if(rangeInfo.getStartRow() < r.getStartRow())
        return AreaRelation.LESS;
      if(rangeInfo.getStartRow() > r.getStartRow())
        return AreaRelation.GREATER;
      if(rangeInfo.getEndRow() < r.getEndRow())
        return AreaRelation.LESS;
      if(rangeInfo.getEndRow() > r.getEndRow())
        return AreaRelation.GREATER;
      if(rangeInfo.getStartCol() < r.getStartCol())
        return AreaRelation.LESS;
      if(rangeInfo.getStartCol() > r.getStartCol())
        return AreaRelation.GREATER;
      if(rangeInfo.getEndCol() < r.getEndCol())
        return AreaRelation.LESS;
      if(rangeInfo.getEndCol() > r.getEndCol())
        return AreaRelation.GREATER;
      //here we do not care about the sheet name, even the sheet name are different
      // it is only used to search area in area page
      // because for 3D reference, Sheet1:Sheet3!A1:B2 and Sheet1:Sheet2!A1:B2
      // will exist in Sheet1 and Sheet2 page
      if( (rangeInfo.getSheetId() == r.getSheetId() && rangeInfo.getEndSheetId() == r.getEndSheetId())
          || (rangeInfo.getSheetId() == r.getEndSheetId() && rangeInfo.getEndSheetId() == r.getSheetId() ) ) 
            return AreaRelation.EQUAL;
      return AreaRelation.EQUAL_NOTSHEETRANGE;

    }
    return AreaRelation.NONE;
  }
  public boolean is3DArea() {
    return this.rangeInfo.is3D();
  }
  public boolean intersectSheet(int sheetid) {
    boolean ret = false;
    if (this.is3DArea() && doc!=null) {
        List<Integer> sheets = doc.getSheetIdRanges(this.getSheetId(), this.getEndSheetId());
        for (int i = 0; i < sheets.size(); i++) {
            int sheet = sheets.get(i);
            if (sheet == sheetid) {
                ret = true;
                break;
            }
        }
    } else
        ret = (this.getSheetId() == sheetid);
    return ret;
  }
  

  public boolean intersect(RangeInfo r)
  {
    if (this.intersectSheet(r.getSheetId()))
    {
      boolean rowHasIntersect = !((rangeInfo.getEndRow() < r.getStartRow()) || (r.getEndRow() < rangeInfo.getStartRow()));
      boolean colHasIntersect = !((rangeInfo.getEndCol() < r.getStartCol()) || (r.getEndCol() < rangeInfo.getStartCol()));
      return (rowHasIntersect && colHasIntersect);
    }
    return false;
  }
  
  public boolean in(RangeInfo r)
  {
    return ((rangeInfo.getStartRow() >= r.getStartRow()) && (rangeInfo.getEndRow() <= r.getEndRow()) 
        && (rangeInfo.getStartCol() >= r.getStartCol()) && (rangeInfo.getEndCol() <= r.getEndCol()));
  }

  public boolean update(RangeInfo range, int rowDelta, int colDelta, NotifyEvent event)
  {
    if (this.is3DArea()) return false;
    ReferenceParser.ParsedRefType type = rangeInfo.getType();
    if ( (type == ReferenceParser.ParsedRefType.COLUMN && rowDelta != 0 )
        || (type == ReferenceParser.ParsedRefType.ROW && colDelta != 0 ) ) 
      return false;
    int sr = rangeInfo.getStartRow();
    int sc = rangeInfo.getStartCol();
    int er = rangeInfo.getEndRow();
    int ec = rangeInfo.getEndCol();
    int startRow = range.getStartRow();
    int startCol = range.getStartCol();
    int endRow = range.getEndRow();
    int endCol = range.getEndCol();
    boolean bUpdate = false;
    if(rowDelta != 0 && sc >= startCol && ec <= endCol)
    {
      int nsr = updateStart(sr, startRow, rowDelta, ConversionConstant.MAX_ROW_NUM);
      int ner = updateEnd(er, startRow, rowDelta, ConversionConstant.MAX_ROW_NUM);
      if(ner < nsr)
      {
        bUpdate = true;//in fact be Invalid
        er = sr = -1;
      }
      else if(nsr != sr || ner != er)
      {
        bUpdate = true;
        sr = nsr;
        er = ner;
      }
    }
    if(colDelta != 0 && sr >= startRow && er <= endRow)
    {
      int nsc = updateStart(sc, startCol, colDelta, ConversionConstant.MAX_COL_NUM);
      int nec = updateEnd(ec, startCol, colDelta, ConversionConstant.MAX_COL_NUM);
      if(nec < nsc)
      {
        bUpdate = true;
        ec = sc = -1;
      }
      else if(nsc != sc || nec != ec)
      {
        bUpdate = true;
        sc = nsc;
        ec = nec;
      }
    }
    if(bUpdate)
      rangeInfo = new RangeInfo(rangeInfo.getSheetId(), rangeInfo.getEndSheetId(), sr, sc, er, ec, rangeInfo.getType());
    return bUpdate;
  }
  
  protected int updateStart(int start, int nStart, int delta, int max)
  {
    if(start >= nStart)
      start += delta;
    else if(delta < 0 && (nStart + delta) <= start)
    {
      start = nStart + delta;
    }
    if(start < 0)
      start = 0;
    if(start > max)
      start = max;
    return start;
  }
  
  protected int updateEnd(int end, int nEnd, int delta, int max)
  {
    if(end >= nEnd)
      end += delta;
    else if(delta < 0 && (nEnd + delta) <= end)
    {
      end = nEnd + delta - 1;
    }
    if(end < 0)
      end = 0;
    if(end > max)
      end = max;
    return end;
  }

  public boolean isValid()
  {
    //TODO: what if sheetId is not exist
    return rangeInfo.isValid();
  }
  
  /**
   * Get serialized id for this Area when serialize this area as the recover reference.
   * 
   * @param convertor
   *          if provided, generate new ID and return, if set to null, return serializedId directly
   * @return
   */
  public SerializableString getSerializedId(ModelHelper.SerializableStringIdConvertor convertor)
  {
    if (serializedId != null)
    {
      return serializedId;
    }
    else
    {
      if (convertor != null)
      {
        serializedId = convertor.generateNextRecoverRangeId();
        return serializedId;
      }
      else
      {
        return null;
      }
    }
  }
  
  public int hashArea()
  {
    if(rangeInfo != null)
    {
      return (rangeInfo.getStartRow() << 26) ^
      (rangeInfo.getStartCol() << 21) ^
      (rangeInfo.getEndCol() << 15) ^
      rangeInfo.getEndRow();
    }
    return 0;
  }

  public void preDeleteSheet(int sheetId, NotifyEvent e)
  {
    if (!this.is3DArea()) return;
    this.updateStatus |= AreaUpdateInfo.UPDATE.getValue();
    if (this.getSheetId() == sheetId || this.getEndSheetId() == sheetId)
    {
      int newSheetId = rangeInfo.getSheetId();
      int newEndSheetId = rangeInfo.getEndSheetId();
      int sr = rangeInfo.getStartRow();
      int sc = rangeInfo.getStartCol();
      int er = rangeInfo.getEndRow();
      int ec = rangeInfo.getEndCol();
      if (this.getSheetId() == sheetId)
      {
        newSheetId = doc.getNextSheetId(sheetId);
      }
      if (this.getEndSheetId() == sheetId)
      {
        newEndSheetId = doc.getPrevSheetId(sheetId);
      }
      rangeInfo = new RangeInfo(newSheetId, newEndSheetId, sr, sc, er, ec, rangeInfo.getType());
      if (!this.is3DArea()) {
        this.updateStatus |= AreaUpdateInfo.CHANGE.getValue();
      }
    }
    this.broadcast(e);
  }
  
  /*
   *  Move sheet action will make 3D reference sheet range change
   * 
   *  shrink 3D reference (1.1, toIndex is inside 3D reference)
   *   |-------|
   *   |-->    |
   *   |    <--|
   *   |-------|
   *  
   *  shrink 3D reference (1.2, toIndex is outside 3D reference)
   *   |-------|
   *   |-------|-->
   * <-|-------|
   *   |-------|
   *   
   *  expand 3D reference (2)
   *   |-------|
   * <-|       |
   *   |       |->
   *   |-------|
   * 
   *  move out of 3D reference (3)
   *   |-------|
   *   |     --|->
   * <-|--     |
   *   |-------|
   *   
   *  move inside 3D reference (4)
   *   |-------|
   *   |  -->  |
   *   |  <--  |
   *   |-------|
   *   
   *   The following two case should not be happend in here,
   *   because now only tranverse the area in the moved sheet
   *   while the following two case, the move sheet is out of the area
   *   we need deal with it like insert sheet action
   *   
   *  move in 3D reference (5)
   *   |-------|
   * --|->     |
   *   |     <-|--
   *   |-------|
   *   
   *  across 3D reference (6)
   *   |-------|
   * --|-------|-->
   * <-|-------|--
   *   |-------|
  */
  public void preMoveSheet(NotifyEvent e, int fromIndex, int toIndex)
  {
    if (!this.is3DArea())
      return;
    int newSheetId = rangeInfo.getSheetId();
    int newEndSheetId = rangeInfo.getEndSheetId();
    int delta = (Integer) e.getSource().getData().get(ConversionConstant.DELTA);
    Sheet sheet = doc.getSheetById(newSheetId);
    Sheet endSheet = doc.getSheetById(newEndSheetId);
    if (sheet != null && endSheet != null)
    {
      JSONObject eventData = e.getSource().getData();
      List<Sheet> allSheets = this.doc.getSheets();
      List<Sheet> opSheets = new ArrayList<Sheet>();
      int startIndex = sheet.getIndex();
      int endIndex = endSheet.getIndex();
      if (fromIndex == startIndex || fromIndex == endIndex)
      { // 1 || 2
        if ((fromIndex == startIndex && toIndex > fromIndex) || (fromIndex == endIndex && toIndex < fromIndex))
        { // 1 for shrink
          // remove 3D reference from out sheet
          if (toIndex > startIndex && toIndex < endIndex)
          { // 1.1
            if (fromIndex == startIndex)
            {
              opSheets.addAll(allSheets.subList(startIndex, toIndex));
            }
            else
            {
              opSheets.addAll(allSheets.subList(toIndex - 1, endIndex - 1));
            }
          }
          else
          { // 1.2 for change the start/end sheet name
            eventData.put("addressChanged", true);
            opSheets.add(allSheets.get(fromIndex - 1));
            if (fromIndex == startIndex)
            {
              newSheetId = allSheets.get(startIndex).getId();
            }
            else
            {
              newEndSheetId = allSheets.get(endIndex - 2).getId();
            }
            if (endIndex - startIndex == 1)
            {
              // not 3D reference any more
              // should remove from the ref3DList of areaPage of newSheetName and insert to refList
              // this._parsedRef.setSheetName(newSheetName);
              // this._parsedRef.setEndSheetName(null);
              this.updateStatus |= AreaUpdateInfo.CHANGE.getValue();
              opSheets.add(this.doc.getSheetById(newSheetId));
            }
          }
          this.updateStatus |= AreaUpdateInfo.REMOVE.getValue();
        }
        else
        { // 2 for expand
          // insert 3D reference for expand sheet
          if (fromIndex == startIndex)
          {
            opSheets.addAll(allSheets.subList(toIndex - 1, startIndex - 1));
          }
          else
            opSheets.addAll(allSheets.subList(endIndex, toIndex));
          this.updateStatus |= AreaUpdateInfo.ADD.getValue();
        }
      }
      else if (fromIndex > startIndex && fromIndex < endIndex)
      {
        if (toIndex > startIndex && toIndex < endIndex)
        { // 4 for move inside
          // nothing happens, only the sheet order has changed
        }
        else
        { // 3 for move out
          opSheets.add(allSheets.get(fromIndex - 1));
          this.updateStatus |= AreaUpdateInfo.REMOVE.getValue();
        }
      }
      else
      {
        if (toIndex > startIndex && toIndex < endIndex)
        { // 5 for move in
          opSheets.add(allSheets.get(fromIndex - 1));
          this.updateStatus |= AreaUpdateInfo.ADD.getValue();
        }
        else
        { // 6 for accross
          // nothing happens, only the sheet index has changed
        }
      }
      
      JSONArray opSheetsJSON = new JSONArray();
      for(int i=0; i < opSheets.size(); i++) {
        opSheetsJSON.add(opSheets.get(i).getId());
      }
      if (data == null ){
        data = new JSONObject();
      }
      data.put("opSheets", opSheetsJSON);
      
      this.broadcast(e);
      eventData.put("addressChanged", false);
      rangeInfo = new RangeInfo(newSheetId, newEndSheetId, rangeInfo.getStartRow(), rangeInfo.getStartCol(), rangeInfo.getEndRow(),
          rangeInfo.getEndCol(), rangeInfo.getType());
    }
  }
}

