package com.ibm.concord.spreadsheet.document.model.formula;

import java.util.ArrayList;
import java.util.Iterator;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.AreaRelation;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.IListener;
import com.ibm.concord.spreadsheet.document.model.Listener;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.ACTION;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.CATEGORY;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.EventSource;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.TYPE;
import com.ibm.concord.spreadsheet.document.model.formula.Area.AreaUpdateInfo;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.Position;

public class AreaPage
{
  
  private static final Logger LOG = Logger.getLogger(AreaPage.class.getName());
  //the area list which store all the areas in this area page
  private List<Area> areaList;
  // the ref list which store all the references which can be shared with the same address
  private List<Reference> refList;
  //the area list which store all the 3d areas in this area page
  private List<Reference> ref3DList;
  private int pageIndex;
  private Document doc;
  private int sheetId;
  public AreaPage(int index, Document doc, int sId)
  {
    areaList = new ArrayList<Area>();
    refList = new ArrayList<Reference>();
    ref3DList = new ArrayList<Reference>();
    pageIndex = index;
    this.doc = doc;
    this.sheetId = sId;
  }
  
  /**
   * add listner to the area, if area does not exist, insert it to page, 
   * if area is null, then find the area at range position
   * @param range
   * @param area if area is given, it must get from the current page, rather than the new one
   * @return
   */
  Area startListeningArea(Area area, RangeInfo range, IListener listener, Area rangeArea)
  {
    // for unname range/preserve range
    if (rangeArea != null && !(rangeArea instanceof Reference)) {
      area = getOrCreateArea(range, areaList, true, listener, rangeArea);
    }
    List list = refList;
    if(range.is3D())
      list = ref3DList;
    if(area == null)
    {
      area = getOrCreateArea(range, list, true, listener, rangeArea);
    }
    else
    {
      //insert directly
      Position pos = this.findArea(range, list, true, rangeArea);
      if(!pos.isFind)
      {
        list.add(pos.index + 1, area);
      }
    }
    return area;
  }
  
  // insert area if such area does not exist, create a new area and insert
  public void insertArea(Area area)
  {
    if (area == null)
      return;
    if (area.isValid()) {
      RangeInfo rangeInfo = area.getRange().clone();
      List list = this.refList;
      if (!( area instanceof Reference))
          list = this.areaList;
      else if(area.is3DArea())
          list = this.ref3DList;
      Position pos = this.findArea(area.getRange(), list, true, area);
      if (pos.isFind)
          return;
      list.add(pos.index+1, area);
    }
  }
  
  /**
   * Remove the listener from area, if no listener in this area, remove this area
   * @param area if area is given, it must get from the current page, rather than the new one
   * @param range
   * @param listener
   */
  Area endListeningArea(Area area, RangeInfo range, IListener listener, Area rangeArea)
  {
    // for unname/preserve range
    if (rangeArea != null && !( rangeArea instanceof Reference)) {
        Position pos = this.findArea(range, this.areaList, true, rangeArea);
        if (!pos.isFind)
            return null;
        //the listener is removed in araemanager.areaHandler
        area = this.areaList.remove(pos.index);
        return area;
    }
    List list = this.refList;
    if(range.is3D())
        list = this.ref3DList;
    int index = -2;
    if(area == null)
    {
      Position pos = this.findArea(range, list, true, rangeArea);
      if (!pos.isFind)
          return null;
      index = pos.index;
      area = (Area)list.get(index);
      area.removeListener(listener);
    }
    // must be reference
    // 1) for normal reference, if it has no listener, should remove from areaPage
    // 2) for name reference, if given listener is nil, it means delete name reference
    boolean bName = (area.getUsage() == RangeUsage.NAMES);
    if ( (area != null && !bName && !area.hasListener())
            || (bName && listener == null) ) {
        if (index == -2) { // never find such area
            Position pos = this.findArea(range, list, true, rangeArea);
            if (pos.isFind){
                index = pos.index;
            } else
                index = -1;
        }
        if (index > -1)
            list.remove(index);
    }
    return area;
  }
  
  
  /**
   * Notify the listener of each area in the range
   * @param range
   * @param event
   */
  boolean areaBroadcast(RangeInfo range, NotifyEvent event, AreaManager man)
  {
    boolean bBroadcast = this.areaBroadcast(range, this.refList, event, man);
    bBroadcast |= this.areaBroadcast(range, this.ref3DList, event, man);
    
    return bBroadcast;
  }
  
  boolean areaBroadcast(RangeInfo range, List<? extends Area> list, NotifyEvent event, AreaManager man)
  {
    boolean bBroadcast = false;
    for(int i = 0 ; i < list.size(); i++)
    {
      Area a = list.get(i);
      if(a.updateStatus == AreaUpdateInfo.NONE.getValue() && a.intersect(range))
      {
        a.broadcast(event);
        a.updateStatus = AreaUpdateInfo.UPDATE.getValue();
        man.appendToReferenceTrack(a);
        bBroadcast = true;
      }else if( a.getStartRow() > range.getEndRow())
      {
        break;
      }
    }
    return bBroadcast;
  }
  
  boolean areaBroadcastAll( NotifyEvent event, AreaManager man)
  {
    boolean bBroadcast = this.areaBroadcastAll(this.refList, event, man);
    bBroadcast |= this.areaBroadcastAll(this.ref3DList, event, man);
    
    return bBroadcast;
  }
  
  boolean areaBroadcastAll(List<? extends Area> list, NotifyEvent event, AreaManager man)
  {
    boolean bBroadcast = false;
    for(int i = 0 ; i < list.size(); i++)
    {
      Area a = list.get(i);
      if(a.updateStatus == AreaUpdateInfo.NONE.getValue())
      {
        a.broadcast(event);
        a.updateStatus = AreaUpdateInfo.UPDATE.getValue();
        man.appendToReferenceTrack(a);
        bBroadcast = true;
      }
    }
    return bBroadcast;
  }
  
  // return the last updateArea in chain
  void updateAreas(RangeInfo range, int rowDelta, int colDelta, NotifyEvent event, AreaManager man)
  {
    this.updateAreas(range, this.areaList, rowDelta, colDelta, event, man);
    this.updateAreas(range, this.refList, rowDelta, colDelta, event, man);
    
    // do not need update 3D reference, because insert/delete row/column will not affect 3D reference address
    // but the range3D content might be changed
    EventSource es = new EventSource(ACTION.SET, TYPE.RANGE, event.getSource().getRefValue());
    NotifyEvent ns = new NotifyEvent(CATEGORY.DATACHANGE, es);
    this.areaBroadcast((RangeInfo)event.getSource().getRefValue(), this.ref3DList, ns, man);
  }
  
  void updateAreas(RangeInfo range, List<? extends Area> list, int rowDelta, int colDelta, NotifyEvent event, AreaManager man)
  {
    RangeInfo pageRange = AreaManager.getPageRange(range.getSheetId(), pageIndex);
    List<Integer> areaRemoveIndexes = new ArrayList<Integer>();
    int length = list.size();
    for ( int i = 0; i < length; i++) {
        Area a = list.get(i);
        if (a.updateStatus > 0) {
            // if the area already in updateChain, it means that the range address has been updated
            if ((a.updateStatus & AreaUpdateInfo.REMOVE.getValue()) > 0) {
                    areaRemoveIndexes.add(i);
            } else {
                if (rowDelta != 0) {
                    if (rowDelta < 0 ) {
                        if ( a.getEndRow() < pageRange.getStartRow())
                            // but not set REMOVE status
                            areaRemoveIndexes.add(i);
                    } else {
                        if (a.getEndRow() > pageRange.getEndRow()) {
                            // the area have not been set REMOVE but it might need add to other area after insert action
                            a.updateStatus |= AreaUpdateInfo.ADD.getValue();
                        } else
                            // do not need to add because area end in the next pageRange
                            a.updateStatus &= (~AreaUpdateInfo.ADD.getValue());
                    }
                } else if(colDelta != 0) {
                    if (colDelta < 0 ) {
                        if ( a.getEndCol() < pageRange.getStartCol())
                            // but not set REMOVE status
                            areaRemoveIndexes.add(i);
                    } else {
                        if (a.getEndCol() > pageRange.getEndCol()) {
                            // the area have not been set REMOVE but it might need add to other area after insert action
                            a.updateStatus |= AreaUpdateInfo.ADD.getValue();
                        } else
                            // do not need to add because area end in the next pageRange
                            a.updateStatus &= (~AreaUpdateInfo.ADD.getValue());
                    }
                }
            }
        } else {
            int startRow = a.getStartRow();
            int startCol = a.getStartCol();
            int endRow = a.getEndRow();
            int endCol= a.getEndCol();
            if (a.update(range, rowDelta, colDelta, event)) { // if need update, put it to updateChain
              a.broadcast(event);  
              a.updateStatus |= AreaUpdateInfo.UPDATE.getValue();
                if(a.getUsage() == RangeUsage.SHARED_REFS || a.getUsage() == RangeUsage.SHARED_FORMULAS || a.getUsage() == RangeUsage.DATA_VALIDATION || a.getUsage() == RangeUsage.CONDITIONAL_FORMAT){
                    areaRemoveIndexes.add(i);
                    a.updateStatus |= AreaUpdateInfo.REMOVE.getValue();
                    man.appendToSharedRefTrack(a);
                }else{
                    if(rowDelta != 0) {
                        //size changed, the order might be changed, so even it is still in this page, but it need first remove from page then add later
                        if ( (endRow - startRow) != (a.getEndRow() - a.getStartRow()) || a.getStartRow() > pageRange.getEndRow() || a.getEndRow() < pageRange.getStartRow()) {
                            areaRemoveIndexes.add(i);
                            a.updateStatus |= AreaUpdateInfo.REMOVE.getValue();
                        }
                    } else {
                        if ( (endCol - startCol) != (a.getEndCol() - a.getStartCol()) || a.getStartCol() > pageRange.getEndCol() || a.getEndCol() < pageRange.getStartCol()) {
                            areaRemoveIndexes.add(i);
                            a.updateStatus |= AreaUpdateInfo.REMOVE.getValue();
                        }
                    }
                    man.appendToReferenceTrack(a);
                }
            }
        }
        
    }
    // remove the area that should not be in this page or the mis-order areas after udpate
    
    for ( int i = areaRemoveIndexes.size() - 1; i >= 0; i--) {
        int index = areaRemoveIndexes.get(i);
        list.remove(index);
    }
  }

  public Area getArea(RangeInfo range, Area rangeArea)
  {
    List<? extends Area> list = this.refList;
    if (rangeArea != null && !( rangeArea instanceof Reference)) {
        list = this.areaList;
    } else if(range.is3D())
        list = this.ref3DList;
    return this.getOrCreateArea(range, list, false, null, rangeArea);
  }
  
  //get area according to range, if not find and bCreate = true, create a new area 
  private Area getOrCreateArea(RangeInfo range, List list, boolean bCreate, IListener listener, Area rangeArea)
  {
    Area area = null;
    Position pos = findArea(range, list, true, rangeArea);
    // for unname range
    if (list == areaList) {
      area = rangeArea;
      if (!pos.isFind) {
        if (bCreate) {
          int index = pos.index < 0 ? 0 : pos.index + 1;
          areaList.add(index, area);
        } else
          return null;
      }
      return area;
    }
    // for reference and name
    if(pos.isFind)
      return (Area)list.get(pos.index);
    if(bCreate)
    {
      if (rangeArea != null)
        area = rangeArea;
      else
        area = new Reference(range, doc);
        
      int index = pos.index < 0 ? 0 : pos.index + 1;
      list.add(index, area);
      area.addListener(listener);
      return area;
    }
    return null;
  }

  Position findArea(RangeInfo range, List list, boolean bMatch, Area rangeArea)
  {
    if(list.isEmpty())
      return new Position(false, -1);
    int low = 0;
    int high = list.size() - 1;
    while(low <= high)
    {
      int mid = ( low + high ) >> 1;
      Area a = (Area)list.get(mid);
      AreaRelation rel = a.compare(range);
      switch(rel)
      {
        case LESS:
          low = mid + 1;
          break;
        case GREATER:
          high = mid - 1;
          break;
        case EQUAL_NOTSHEETRANGE:
        case EQUAL:
          Position pos = new Position(true, mid);
          if (bMatch) 
          {
            if(rangeArea != null)
            {
                int i = mid;
                int length = list.size();
                while(i < length)
                {
                    Area curArea = (Area)list.get(i);
                    if(curArea == rangeArea)
                    {
                        return new Position(true, i);
                    }
                    AreaRelation relation = curArea.compare(range);
                    if(relation != AreaRelation.EQUAL && relation != AreaRelation.EQUAL_NOTSHEETRANGE)
                        break;
                    i ++;
                }
                i = mid - 1;
                while(i >= 0)
                {
                    Area curArea = (Area)list.get(i);
                    if(curArea == rangeArea)
                    {
                        return new Position(true, i);
                    }
                    AreaRelation relation = curArea.compare(range);
                    if(relation != AreaRelation.EQUAL && relation != AreaRelation.EQUAL_NOTSHEETRANGE)
                        break;
                    i -- ;
                }
                return  new Position(false, mid);
            } else {
              //rangeArea is null means it is now finding reference which can be shared
              // name reference should not be shared with normal reference
              // for 3D reference, it must have the same sheet range
              if(a.getUsage() == RangeUsage.REFERENCE && rel == AreaRelation.EQUAL)
                return pos;
              pos.isFind = false;
              int i = mid;
              int length = list.size();
              while(i < length)
              {
                  Area curArea = (Area)list.get(i);
                  AreaRelation relation = curArea.compare(range);
                  if(relation != AreaRelation.EQUAL && relation != AreaRelation.EQUAL_NOTSHEETRANGE)
                      break;
                  if(curArea.getUsage() == RangeUsage.REFERENCE && relation == AreaRelation.EQUAL)
                    return new Position(true, i);
                  i ++;
              }
              i = mid - 1;
              while(i >= 0)
              {
                  Area curArea = (Area)list.get(i);
                  AreaRelation relation = curArea.compare(range);
                  if(relation != AreaRelation.EQUAL && relation != AreaRelation.EQUAL_NOTSHEETRANGE)
                    break;
                  if(curArea.getUsage() == RangeUsage.REFERENCE && relation == AreaRelation.EQUAL)
                    return new Position(true, i);
                  i -- ;
              }
            }
          }
          return pos;
        default:
          LOG.log(Level.WARNING, "can not find area in the different area page");
          return null;
      }
    }
    return new Position(false, high);
  }
  
  int getAreaSize()
  {
    return areaList.size() + refList.size() + ref3DList.size();
  }
  
  public List<Reference> get3DAreas()
  {
    return ref3DList;
  }
  
  public int getPageIndex()
  {
    return pageIndex;
  }

  public void preDeleteSheet(int sheetId, NotifyEvent e, AreaManager man)
  {
    for (Iterator<Reference> it = ref3DList.iterator(); it.hasNext();) 
    {
      Reference area =it.next();
      if (area.updateStatus <= AreaUpdateInfo.UPDATE.getValue()) {
        area.preDeleteSheet(sheetId,e);
        man.appendToReferenceTrack(area);
      }
    }
    ref3DList.clear();
  }

  public void preMoveSheet(NotifyEvent e, int from, int to, AreaManager man)
  {
    for (Iterator<Reference> it = ref3DList.iterator(); it.hasNext();) 
    {
      Reference area =it.next();
      if (area.updateStatus <= AreaUpdateInfo.UPDATE.getValue()) {
        area.preMoveSheet(e, from, to);
        man.appendToReferenceTrack(area);
      }
    }
  }
  
  public void modify3DTo2DRef(Reference ref3D) {
    if(this.delete3DRef(ref3D))
        this.insertArea(ref3D);
  }

  public boolean delete3DRef(Reference ref3D) {
    for (int i = 0; i < this.ref3DList.size(); i++) {
      Reference a = this.ref3DList.get(i);
      if(a == ref3D) {
        this.ref3DList.remove(i);
        return true;
      }
    }
    return false;
  }

  public void update3DRefForMove(Reference ref3D) {
    if((ref3D.updateStatus & AreaUpdateInfo.CHANGE.getValue()) > 0 && !ref3D.is3DArea()) {
      // change from 3D ref list to refList
      if (sheetId == ref3D.getSheetId())
        this.modify3DTo2DRef(ref3D);
    }
    if((ref3D.updateStatus & AreaUpdateInfo.REMOVE.getValue()) > 0) {
        // remove from current page
        this.delete3DRef(ref3D);
    } else if((ref3D.updateStatus & AreaUpdateInfo.ADD.getValue()) > 0) {
        // insert into from current page
        this.insertArea(ref3D);
    }
  }
}
