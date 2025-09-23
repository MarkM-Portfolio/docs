package com.ibm.concord.spreadsheet.document.model.formula;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.Broadcaster;
import com.ibm.concord.spreadsheet.document.model.IListener;
import com.ibm.concord.spreadsheet.document.model.Listener;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.ACTION;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.CATEGORY;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.EventSource;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.TYPE;
import com.ibm.concord.spreadsheet.document.model.formula.Area.AreaUpdateInfo;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.FormulaCell;
import com.ibm.concord.spreadsheet.document.model.impl.IDManager;
import com.ibm.concord.spreadsheet.document.model.impl.Range;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.impl.RangeList.RangeIterator;
import com.ibm.concord.spreadsheet.document.model.impl.RangeList.RangeMap;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper.Position;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/**
 * <p>
 * AreaManager is used to manage the areas which represents the formula references
 * <p>
 * Area is stored seperately if they belong to different area page
 *
 */
public class AreaManager extends Listener
{
  private static final Logger LOG = Logger.getLogger(AreaManager.class.getName());
  
  // Sheet Id <--> area pages in the sheet
  // in each sheet the area pages are splitted into size 128*16(row * col)
  // ------------------------------------------------------------------------------------------>Col(1024)
  // | page 1              | page 1 + ROWS_PAGE_SIZE              | page 1 + ROWS_PAGE_SIZE*2
  // | page 2              | page 2 + ROWS_PAGE_SIZE              | page 2 + ROWS_PAGE_SIZE*2
  // | ...                 | ...                                  | ...
  // | page ROWS_PAGE_SIZE | page ROWS_PAGE_SIZE + ROWS_PAGE_SIZE | page ROWS_PAGE_SIZE + ROWS_PAGE_SIZE*2
  // \/
  // Row( MAX_REF_ROW_NUM ~ 5000 for now)
  private HashMap<Integer, List<AreaPage>> pageTables;
  
  // the name range area data with upper case of name as key
  
  // it not only store the exist name range
  private HashMap<String, NameArea> namesArea;
  // for the undefined name ranges
  private HashMap<String, UndefinedNameArea> undefinedNamesArea;
  
  private HashMap<RangeUsage, HashMap<Integer, HashMap<String, Area>>> usageMap;
  // all the areas that need to be update
  Area updateAreas;//the head area of the update area list
  Area updateAreasLast;//the end area of update area list
 
  //all the impact formula cells
  private FormulaCell fCellHead;//the head of the formula cells linked list
  private FormulaCell fCellLast; //the last cell of the formula cells linked list
  
  //all the shared references(shared formula or shared ref) that need to be update
  private ArrayList<Area> sharedRefTrack;
  //all the impact shared formulas
  private ArrayList<SharedFormulaRefBase>sFormulaTrack;
  
  private Document doc;
  //the following is used to iterate page instance when broadcast
  private static final int ROW_PER_PAGE = 128;//TODO change to 128
  private static final int COL_PER_PAGE = 16;//TODO change to 16
  private static final int ROWS_PAGE_SIZE = (ConversionConstant.MAX_REF_ROW_NUM - 1)/ROW_PER_PAGE + 1; 
  private static final int COLS_PAGE_SIZE = (ConversionConstant.MAX_COL_NUM - 1)/COL_PER_PAGE + 1;
  private int nStart, nEnd, nCur, nRowBreak;
  
  public AreaManager(Document d)
  {
    doc = d;
    pageTables = new HashMap<Integer, List<AreaPage>>();
    namesArea = new HashMap<String, NameArea>();
    undefinedNamesArea = new HashMap<String, UndefinedNameArea>();
    usageMap = new HashMap<RangeUsage, HashMap<Integer, HashMap<String, Area>>>();
    SharedFormulaRef4DV.reset();
    SharedFormulaRef4CF.reset();
  }
  
  /**
   * add area for each unname/preserve/name range with specified usage
   * name range should be a Reference instance rather than a Area instance
   * the given area should not be null
   */
  public Area addArea(Area area) 
  {
    //TODO: for absolute image and warning comments should return directly
    this.startListeningArea(area.getRange(), null, area);
    this.addAreaInUsageMap(area);
    return area;
  }
  
  public void deleteArea(Area area)
  {
    this.endListeningArea(area.getRange(), null, area);
    this.deleteAreaInUsageMap(area);
  }
  
  public Area updateAreaByUsage(RangeInfo range, String id, RangeUsage usage, NotifyEvent event) {
    Area area = this.getAreaByUsage(id, usage, -1);
    if( area != null) {
      this.deleteArea(area);
      // should not change the area instance pointer, otherwise the related reference token's area is out of date
      area.rangeInfo = range.clone();
      area = this.addArea(area);
      EventSource ns = new EventSource(ACTION.SET, TYPE.AREA, area);
      NotifyEvent ne = new NotifyEvent(CATEGORY.DATACHANGE, ns);
      area.broadcast(ne);
    }
    return area;
  }
  
  /**
   * start listening to the new range, so that when anything changed in the range position
   * it can be notified in time
   * @param range    the range position
   * @param listener    the listener for the range
   * @param rangeArea    
   */
  public Area startListeningArea(RangeInfo range, IListener listener, Area rangeArea)
  {
    Area area = null;
    // found the right pages and insert to them
    if(range != null && range.isValid())
    {
      List<Integer> sheetids = doc.getSheetIdRanges(range.getSheetId(), range.getEndSheetId());
      boolean bFirst = true;
      for (int i=0; i < sheetids.size(); i++)
      {
        int sheetid = sheetids.get(i);
        List<AreaPage> pages = pageTables.get(sheetid);
        if(pages == null)
        {
          Sheet sheet = doc.getSheetById(sheetid);
          if(sheet == null)
          {
            LOG.log(Level.WARNING, "can not put area in sheetId: {0} in area manager, because this sheet does not exist", range.getSheetId());
            return null;
          }
          pages = new ArrayList<AreaPage>();
          pageTables.put(sheetid, pages);
        }
        
        int size = 0;
        
        ParsedRefType type = range.getType();
        boolean bRow = (type == ParsedRefType.ROW);
        boolean bCol = (type == ParsedRefType.COLUMN);
        
        firstPage(range,false);
        while(hasNextPage())
        {
          if(!bFirst && (bRow || bCol))
          {
            //the RowColArea only insert to the page at the first row(for column area) or the first column(for row area)
            if(!isStartEdgePage(nCur, bRow))
            {
              nextPage(bRow, bCol);
              continue;
            }
          }
          AreaPage page = ModelHelper.safeGetList(pages, nCur);
          if(page == null)
          {
            page = new AreaPage(nCur, doc, sheetid);
            ModelHelper.putToList(pages, nCur, page);
          }
          
          if(bFirst)
            size = page.getAreaSize();
          area = page.startListeningArea(area, range, listener, rangeArea);//insert the same area to different pages
          if(bFirst)
          {
            bFirst = false;
            if(page.getAreaSize() - size == 0)
            {
              area.addListener(listener);
              // means the area is already exist
              break;
            }
          }
          nextPage(bRow, bCol);
        }
      } 
    }
    return area;
  }
  
  /**
   * start listening to a name range
   * @param name    the name of the name range
   * @param listener
   * @return
   */
  public Area startListeningArea(String name, IListener listener)
  {
    Area area = this.getNameRangeDataByName(name);
    if(area != null) {
      area = this.startListeningArea(area.getRange(), listener, area);
    }else
    {
      //undefined name range
      UndefinedNameArea ua = undefinedNamesArea.get(name.toLowerCase());
      if(ua != null)
        ua.addListener(listener);
    }
    return area;
//    String lowerId = name.toLowerCase();
//    Area area = this.namesArea.get(lowerId);
//    if (area != null) {
//        area = this.startListeningArea(area.getRange(), listener, area);
//    } else {
//    //undefined name range
//      UndefinedNameArea ua = undefinedNamesArea.get(lowerId);
//      if(ua == null) {
//        ua = new UndefinedNameArea(name);
//        undefinedNamesArea.put(lowerId, ua);
//      }
//      ua.addListener(listener);
//    }
//    return area;
    
  }
  
  /**
   * end listening to the area, so it will not be notified when anything changed in the area position
   * @param area
   */
  public boolean endListeningArea(Area rangeArea, IListener listener)
  {
    RangeUsage usage = rangeArea.getUsage();
    if(usage == RangeUsage.NAMES || usage == RangeUsage.UNDEFINE_NAMES)
        return this.endListeningArea(rangeArea.getId(), listener);
    else
        return this.endListeningArea(rangeArea.getRange(), listener, rangeArea);
  }
  
  private boolean endListeningArea(RangeInfo range, IListener listener, Area rangeArea)
  {
    Area area = null;
    if(range != null && range.isValid())
    {
      List<Integer> sheetids = doc.getSheetIdRanges(range.getSheetId(), range.getEndSheetId());
      for (int i=0; i < sheetids.size(); i++)
      {
        int sheetid = sheetids.get(i);
        List<AreaPage> pages = pageTables.get(sheetid);
        if(pages == null)
        {
          LOG.log(Level.WARNING, "it is impossible to call endListeneningArea for range : {0},{1},{2},{3},{4}" ,
              new Object[]{range.getSheetId(), range.getStartRow(), range.getStartCol(), range.getEndRow(), range.getEndCol()});
          return false;
        }
        
        ParsedRefType type = range.getType();
        boolean bRow = (type == ParsedRefType.ROW);
        boolean bCol = (type == ParsedRefType.COLUMN);
        boolean bEndAndStillHasListener = false;
        
        firstPage(range, true);
        while(hasNextPage())
        {
          if(bRow || bCol)
          {
            //the RowColArea only insert to the page at the first row(for column area) or the first column(for row area)
            if(!isStartEdgePage(nCur, bRow))
            {
              nextPage(bRow, bCol);
              continue;
            }
          }
          AreaPage page = ModelHelper.safeGetList(pages, nCur);
          if(page != null){
            area = page.endListeningArea(area, range, listener, rangeArea);
            if(area == null)
            {
              System.out.println("a");
              LOG.log(Level.WARNING, "The area for range : {0},{1},{2},{3},{4} is null when endListeningArea" ,
              new Object[]{range.getSheetId(), range.getStartRow(), range.getStartCol(), range.getEndRow(), range.getEndCol()});
            }
            else if(area.hasListener()) {
              bEndAndStillHasListener = true;
              break;
            }
          }
          nextPage(bRow, bCol);
        }
        if(bEndAndStillHasListener)// do not need iterate other sheets because area should still be there
          break;
      }
      return true;
    }
    return false;
  }
  
 public boolean endListeningSharedArea(Area a, IListener listener){
     if(a instanceof SharedFormulaRefBase || a instanceof SharedReferenceRef)
     {
        if(sharedRefTrack == null)
            return false;
        for(int i = 0; i < sharedRefTrack.size(); i ++)
        {
            if(sharedRefTrack.get(i) == a){
                a.removeListener(listener);
                if(!a.hasListener())
                    sharedRefTrack.remove(i);
                return true;
            }
        }
        return false;
     }
     Area areaPointer = updateAreas;
     Area pre = null;
      while(areaPointer != null)
      {
        Area area = areaPointer;
        areaPointer = area.next;
        if(area == a)
        {
            area.removeListener(listener);
            if(!area.hasListener())
            {
                if(updateAreas == area)
                    updateAreas = area.next;
                if(pre != null)
                    pre.next = areaPointer;
                if(areaPointer != null)
                  areaPointer.pre = pre;
                // remove a from update area chain
                area.updateStatus = AreaUpdateInfo.NONE.getValue();
            }
            return true;
        }
        pre = a;
      }
      return false;
    }
  
  
  /**
   * end listening to the name range
   * @param name
   * @param listener
   */
  public boolean endListeningArea(String name, IListener listener)
  {
    if(name != null)
    {
      String upperName = name.toLowerCase();
      //check if undefined name
      UndefinedNameArea b = undefinedNamesArea.get(upperName);
      if(b != null)
      {
        b.removeListener(listener);
        if(!b.hasListener())
          undefinedNamesArea.remove(upperName);
      }
      // if name range
      Area a = namesArea.get(upperName);
      if (a != null) 
      {
        boolean bSuccess = endListeningArea(a.getRange(), listener, a);
        if(!bSuccess && a != null)
        {
          //it might be that the name range area is in the deleted sheet
          //while namesArea still keep the relationship between name and the delete area if the recover doc has not been serialized
          a.removeListener(listener);
          return true;
        }
        return bSuccess;
      }
    }
    return true;
  }
  
  /**
   * broadcast the areas which has the intersection with given range
   * the area will broadcast to the listeners
   * Used for set cell/range data
   * @param range   the range area which data might changed
   */
  public boolean areaBroadcast(RangeInfo range, NotifyEvent event)
  {
    boolean bBroadcast = false;
    if(range != null && range.isValid())
    {
      List<AreaPage> pages = pageTables.get(range.getSheetId());
      if(pages == null)
        return false;
      
      firstPage(range, true);
      while(hasNextPage())
      {
        AreaPage page = ModelHelper.safeGetList(pages, nCur);
        if(page != null)
          bBroadcast |= page.areaBroadcast(range, event, this);
        nextPage(false, false);
      }
      
      // areaBroadcast for the whole row/column areas on the start edge pages
      if (range.getStartRow() > this.ROW_PER_PAGE) {
        RangeInfo topRange = new RangeInfo(range.getSheetId(), range.getEndSheetId(), 1, range.getStartCol(), 1, range.getEndCol(), range.getType());
        firstPage(topRange, true);
        while (this.hasNextPage()) {
          AreaPage page = ModelHelper.safeGetList(pages, nCur);
          if (page != null)
            bBroadcast |= page.areaBroadcast(range, event, this);
          this.nextPage(false, false);
        }
      }

      if (range.getStartCol() > this.COL_PER_PAGE) {
        RangeInfo leftRange = new RangeInfo(range.getSheetId(), range.getEndSheetId(), range.getStartRow(), 1, range.getEndRow(), 1, range.getType());
        firstPage(leftRange, true);
        while (this.hasNextPage()) {
          AreaPage page = ModelHelper.safeGetList(pages, nCur);
          if (page != null)
            bBroadcast |= page.areaBroadcast(range, event,this);
          this.nextPage(false, false);
        }
      }
    }
    return bBroadcast;
  }
  
  /**
   * update all the areas in the given range with the row delta and col delta change
   * Used for insert/delete row/column
   * @param range   
   * @param rowDelta
   * @param colDelta
   * @param mode
   */
  public void updateBroadcastAreas(RangeInfo range, int rowDelta, int colDelta, NotifyEvent event)
  {
    if(range != null && range.isValid())
    {
      int sr = range.getStartRow();
      int sc = range.getStartCol();
      int er = range.getEndRow();
      int ec = range.getEndCol();
      if(rowDelta < 0)
        sr += rowDelta;
      if(colDelta < 0)
        sc += colDelta;
      RangeInfo updateRange = new RangeInfo(range.getSheetId(), range.getEndSheetId(), sr, sc, er, ec, range.getType());
      List<AreaPage> pages = pageTables.get(range.getSheetId());
      if(pages == null)
        return;
      if(updateAreas != null)
        LOG.log(Level.WARNING, "there are still areas in update chains");
      firstPage(updateRange, true);
      while(hasNextPage())
      {
        AreaPage page = ModelHelper.safeGetList(pages, nCur);
        if(page != null)
          page.updateAreas(range, rowDelta, colDelta, event, this);
        nextPage(false, false);
      }
      if(sFormulaTrack != null && (rowDelta != 0 || colDelta != 0))
        splitSharedFormula(range, rowDelta, colDelta);
      
      manageUpdateAreas(null, null);
    }
  }
  
  private void manageUpdateAreas(Method areaActionMethod, Method clearAreaMethod)
  {
    Area areaPointer = this.updateAreas;
    while (areaPointer != null) {
      Area a = areaPointer;
      areaPointer = a.next;
      boolean bInsert = a.updateStatus > AreaUpdateInfo.UPDATE.getValue();
      a.next = null;
      a.pre = null;
      if (!bInsert) {//even invalid area need to insert to page for restore in later undo action
        a.updateStatus = AreaUpdateInfo.NONE.getValue();
        continue;
      }
        
      // insert the updated range into the pages(they have been removed from their pages
      // when page.updateAreas incase the area has been disordered due to update
      RangeInfo newRange = a.getRange();

      ReferenceParser.ParsedRefType type = newRange.getType();
      boolean bRow = (type == ReferenceParser.ParsedRefType.ROW);
      boolean bCol = (type == ReferenceParser.ParsedRefType.COLUMN);
    
      List<Integer> sheets = new ArrayList<Integer>();
      JSONArray opSheets = (a.getData() != null)?(JSONArray)a.getData().get("opSheets"):null;
        if(opSheets != null) {
            // for 3D reference, we need update areas in each sheet range
            // opSheets only exists for 3D reference, but it is not all the sheet range
            // but some of the sheets that need delete/remove/update 3D reference
            for(int i = 0; i < opSheets.size(); i++) {
                sheets.add((Integer)opSheets.get(i));
            }
        } else if(a.is3DArea()) {
            // without opSheets, 3D reference should iterate each sheets
            sheets = this.doc.getSheetIdRanges(newRange.getSheetId(), newRange.getEndSheetId());
        } else {
            sheets.add(newRange.getSheetId());
        }
        for(int i = 0; i < sheets.size(); i++) {
            int sheetid = sheets.get(i);
            List<AreaPage> pages = pageTables.get(sheetid);
            if(pages == null)
            {
              Sheet sheet = doc.getSheetById(sheetid);
              if(sheet == null)
              {
                LOG.log(Level.WARNING, "can not update area in sheetId: {0} in area manager, because this sheet does not exist", sheetid);
                continue;
              }
              pages = new ArrayList<AreaPage>();
              pageTables.put(sheetid, pages);
            }
            
            firstPage(newRange, false);
            while (this.hasNextPage()) {
                if ((bRow || bCol) && !this.isStartEdgePage(this.nCur, bRow)) {
                    nextPage(bRow, bCol);
                    continue;
                }
                AreaPage page = ModelHelper.safeGetList(pages, this.nCur);
                if(page == null)
                {
                  page = new AreaPage(nCur, doc, sheetid);
                  ModelHelper.putToList(pages, nCur, page);
                }
                if(areaActionMethod != null)
                  try
                  {
                    areaActionMethod.invoke(page, a);
                  }
                  catch (IllegalArgumentException e)
                  {
                   LOG.log(Level.WARNING, "can not trigger area action method in manageUpdateAreas");
                  }
                  catch (IllegalAccessException e)
                  {
                    LOG.log(Level.WARNING, "can not trigger area action method in manageUpdateAreas");
                  }
                  catch (InvocationTargetException e)
                  {
                    LOG.log(Level.WARNING, "can not trigger area action method in manageUpdateAreas");
                  }
                else
                    page.insertArea(a);
                this.nextPage(bRow, bCol);
            }
        }
        a.updateStatus = AreaUpdateInfo.NONE.getValue();
        if(clearAreaMethod != null)
          try
          {
            clearAreaMethod.invoke(this, a);
          }
          catch (IllegalArgumentException e)
          {
            LOG.log(Level.WARNING, "can not trigger clear action method in manageUpdateAreas");
          }
          catch (IllegalAccessException e)
          {
            LOG.log(Level.WARNING, "can not trigger clear action method in manageUpdateAreas");
          }
          catch (InvocationTargetException e)
          {
            LOG.log(Level.WARNING, "can not trigger clear action method in manageUpdateAreas");
          }
    }
    
    if(areaActionMethod == null && this.sharedRefTrack != null){
        for(int i = 0; i < sharedRefTrack.size(); i++)
        {
            Area ref = sharedRefTrack.get(i);
            ref.updateStatus = AreaUpdateInfo.NONE.getValue();
            this.startListeningArea(ref.getRange(), null, ref);
        }
        sharedRefTrack.clear();
    }
    
    this.updateAreas = null;
    this.updateAreasLast = null;
  }
  
  private void splitSharedFormula(RangeInfo range, int rowDelta, int colDelta)
  {
       for(int i = 0; i < sFormulaTrack.size(); i++)
       {
           SharedFormulaRefBase sharedFormulaRef = sFormulaTrack.get(i);
           sharedFormulaRef.splitSharedReferences(range, rowDelta, colDelta, doc);
       }
       sFormulaTrack.clear();
  }
  
  /**
   * Iterate the areas in sheet and do broadcast
   * @param e
   */
  private void updateBroadcastAreasInSheet(int sheetId, NotifyEvent e)
  {
    List<AreaPage> pages = pageTables.get(sheetId);
    if(pages != null)
    {
      for(int i = 0; i < pages.size(); i++)
      {
        AreaPage page = pages.get(i);
        if(page != null)
          page.areaBroadcastAll(e, this);
      }
    }
  }
  
  /**
   * get the first page which impact by the given range address
   * @param range
   */
  private void firstPage(RangeInfo range, boolean onlyQuery)
  {
    nStart = getPageIndex(range.getStartRow(), range.getStartCol());
    nEnd = getPageIndex(range.getEndRow(), range.getEndCol());
    if (onlyQuery) {
      List<AreaPage> pages = this.pageTables.get(range.getSheetId());
      if (this.nEnd >= pages.size())
          this.nEnd = pages.size() - 1;
  }
    nCur = nStart;
    nRowBreak = getPageIndex(range.getEndRow(), range.getStartCol()) - nStart;
  }
  
  /**
   * check if the given page is locate at the most left edge or the most top edge of the sheet
   * @param page
   * @return
   */
  private boolean isStartEdgePage(int pageIndex, boolean bLeft)
  {
    if(bLeft)
    {
      int index = pageIndex/ROWS_PAGE_SIZE;
      if(index == 0)
        return true;
    }else
    {
      int index = pageIndex%ROWS_PAGE_SIZE;
      if(index == 0)
        return true;
    }
    return false;
  }
  private boolean hasNextPage()
  {
    if(nCur <= nEnd)
      return true;
    nStart = nEnd = nCur = 0;
    return false;
  }
  
  private void nextPage(boolean bRow, boolean bCol)
  {
    if(!hasNextPage())
      throw new NoSuchElementException();
    if (bRow || bCol) {
      if(bRow){
        this.nCur++;
        if (this.nCur > (this.nStart + this.nRowBreak)) {
            //only iterate the pages at the left side
            this.nCur = this.nEnd + 1;//stop here
        }
      } else {
        this.nCur += this.ROWS_PAGE_SIZE;
      }
    } else {
      this.nCur++;
      if (this.nCur > (this.nStart + this.nRowBreak)) {
        this.nStart += this.ROWS_PAGE_SIZE;
        this.nCur = this.nStart;
      }
    }
  }
  
  /**
   * get the page index of the point which locate at row and col index 
   * @param row the row index 1-based
   * @param col the col index 1-base
   * @return    the area page
   */
  private int getPageIndex(int row, int col)
  {
    int index = 0;
    if(!ModelHelper.isValidRow(row) || !ModelHelper.isValidCol(col))
    {
      LOG.log(Level.WARNING, "can not get the area page for the invalid row {0} or col {1} index",
          new Object[]{row, col});
      return 0;
    }
    if(row > ConversionConstant.MAX_REF_ROW_NUM)
      index = ROWS_PAGE_SIZE - 1;
    else
      index = (row-1)/ROW_PER_PAGE;
    index += (col-1)/COL_PER_PAGE * ROWS_PAGE_SIZE;
    return index;
  }
  
  // get the page range info at index
  public static RangeInfo getPageRange(int sheetId, int index)
  {
    int colCount = index/ROWS_PAGE_SIZE;
    int rowCount = index%ROWS_PAGE_SIZE;
    int row = rowCount * ROW_PER_PAGE + 1;
    int col = colCount * COL_PER_PAGE + 1;
    return new RangeInfo(sheetId,sheetId, row, col, row+ROW_PER_PAGE-1, col+COL_PER_PAGE-1, ReferenceParser.ParsedRefType.RANGE);
  }
  
  public void addAreaInUsageMap(Area area) {
    String id = area.getId();
    RangeUsage usage = area.getUsage();
    if (usage == RangeUsage.NAMES) {
        id = id.toLowerCase();
        this.namesArea.put(id, (NameArea)area);
        return;
    }
    HashMap<Integer, HashMap<String, Area>> areaMap = usageMap.get(usage);
    if(areaMap == null) {
        areaMap = new HashMap<Integer, HashMap<String, Area>>();
        usageMap.put(usage, areaMap);
    }
    int sheetId = area.getSheetId();
    HashMap<String, Area> areaSheet = areaMap.get(sheetId);
    if (areaSheet != null) {
      areaSheet = new HashMap<String, Area>();
      areaMap.put(sheetId, areaSheet);
    }
    areaSheet.put(id, area);
  }

  public void deleteAreaInUsageMap(Area area) {
    String id = area.getId();
    RangeUsage usage = area.getUsage();
    if (usage == RangeUsage.NAMES) {
        id = id.toLowerCase();
        this.namesArea.remove(id);
        return;
    }
    HashMap<Integer, HashMap<String, Area>> areaMap = usageMap.get(usage);
    if (areaMap != null) {
      int sheetId = area.getSheetId();
      HashMap<String, Area> areaSheet = areaMap.get(sheetId);
      if (areaSheet != null)
        areaSheet.remove(id);
    }
  }

  public Area getAreaByUsage(String id, RangeUsage usage, int sheetId)
  {
    if (usage == RangeUsage.NAMES) {
      id = id.toLowerCase();
      return this.namesArea.get(id);
    }
    
    HashMap<Integer, HashMap<String, Area>> areaMap = usageMap.get(usage);
    if (sheetId > -1) {
      HashMap<String, Area> areaSheet = areaMap.get(sheetId);
      if (areaSheet != null)
        return areaSheet.get(id);
    } else {
      Area area = null;
      Iterator<Integer> sheetIdIterator = areaMap.keySet().iterator();
      while(sheetIdIterator.hasNext()) {
        sheetId = sheetIdIterator.next();
        area = areaMap.get(sheetId).get(id);
        if (area != null)
          return area;
      }
    }
    
    return null;
  }
  
//  /**
//   * Get the area according to range info
//   * return null if the area does not exist
//   * @param range
//   * @return
//   */
//  public Area getArea(RangeInfo range, boolean bWholeRowCol)
//  {
//    if(range == null || !range.isValid())
//      return null;
//    List<AreaPage> pages = pageTables.get(range.getSheetId());
//    if(pages == null)
//      return null;
//    firstPage(range);
//    AreaPage page = ModelHelper.safeGetList(pages, nCur);
//    if(page == null)
//      return null;
//    Area a = page.getArea(range, bWholeRowCol);
//    return a;
//  }
//  
  /**
   * 
   * Get the name range data by name
   * if name is not referred by any formula cell yet, 
   * it will return the new area which is not insert to areaManager yet
   * @param name
   * @return
   */
  private Area getNameRangeDataByName(String name)
  {
    if(name == null)
      return null;
    String lowerName = name.toLowerCase();
    NameArea a = namesArea.get(lowerName);
    if(a == null)
    {
      Range<String> nameRange = doc.getRangeList().getRangeByUsage(lowerName, RangeUsage.NAMES);
      if(nameRange == null)
      {
        if(undefinedNamesArea.get(lowerName) == null)
          undefinedNamesArea.put(lowerName, new UndefinedNameArea(lowerName));
        return null;
      }
      RangeInfo nameInfo = nameRange.getRangeInfo();
      if (a == null)
      {
          a = new NameArea(nameInfo, name, doc);
          this.addArea(a);
      }
    }
    return a;
  }

  @Override
  public void notify(Broadcaster caster, NotifyEvent e)
  {
    if (e.getCategory() == CATEGORY.DATACHANGE)
    {
      FormulaCell trackFromCell = this.fCellLast;
      RangeInfo updateRange = null;
      int rowDelta = 0;
      int colDelta = 0;
      
      EventSource source = e.getSource();
      // insert/delete/set range address
      if (source.getRefType() == TYPE.RANGEADDRESS)
      {
//        areaHandler(e);
        Range<String> range = (Range<String>)source.getRefValue();
        RangeInfo rangeInfo = range.getRangeInfo();
        String name = range.getId();
        String lowerId = name.toLowerCase();
        NameArea newArea = null;
        if(source.getAction() != ACTION.DELETE)
        {
          //get or create the area which range info is equal with range
          newArea = this.namesArea.get(lowerId);
          if (newArea == null) {
            newArea = new NameArea(rangeInfo, name, doc);
            this.addArea(newArea);
          }
        }
        EventSource ns = new EventSource(ACTION.SET, TYPE.AREA, newArea);
        NotifyEvent ne = new NotifyEvent(CATEGORY.DATACHANGE, ns);
        if(source.getAction() == ACTION.SET || source.getAction() == ACTION.DELETE)
        {
          Area a = namesArea.get(lowerId);
          if(a != null)
          {
            a.broadcast(ne);
            a.removeAllListener();
            namesArea.put(lowerId, newArea);
            if(source.getAction() == ACTION.DELETE)
              this.deleteArea(a);
          }
        }
        else if(source.getAction() == ACTION.INSERT)
        {
          // notify the cell which refer to the undefined name range
          UndefinedNameArea ua = undefinedNamesArea.get(lowerId);
          if(ua != null)
          {
            ua.broadcast(ne);
            ua.removeAllListener();
            undefinedNamesArea.remove(name);
            namesArea.put(lowerId, newArea);
          }
        }
      }
      // set sheet name, move sheet, delete sheet, insert sheet?
      else if (source.getRefType() == TYPE.SHEET)
      {
        clearReferenceTrack();
        sheetHanlder(e);
      }
      else if ((source.getAction() == ACTION.PREINSERT || source.getAction() == ACTION.PREDELETE))
      {
        if (source.getRefType() == TYPE.ROW || source.getRefType() == TYPE.COLUMN)
        {
          clearReferenceTrack();
          RangeInfo range = (RangeInfo)source.getRefValue();
          int sr = range.getStartRow();
          int er = range.getEndRow();
          int sc = range.getStartCol();
          int ec = range.getEndCol();
          if (source.getRefType() == TYPE.ROW)
          {
            rowDelta = er - sr + 1;
          }
          else
          {
            colDelta = ec - sc + 1;
          }
            
          if(source.getAction() == ACTION.PREINSERT)
          {
            updateRange = new RangeInfo(range.getSheetId(), range.getSheetId(), sr, sc, ConversionConstant.MAX_ROW_NUM, ConversionConstant.MAX_COL_NUM, ReferenceParser.ParsedRefType.RANGE);
          }else
          {
              updateRange = new RangeInfo(range.getSheetId(),range.getSheetId(), sr + rowDelta, sc + colDelta, ConversionConstant.MAX_ROW_NUM, ConversionConstant.MAX_COL_NUM, ReferenceParser.ParsedRefType.RANGE);
              rowDelta = -rowDelta;
              colDelta = -colDelta;
          }
          updateBroadcastAreas(updateRange, rowDelta, colDelta, e);// set update formula for impact cells
        }
        else
        {
          LOG.log(Level.WARNING, "AreaManager can not support event with {0} {1}", new String[] { source.getAction().toString(),
              source.getRefType().toString() });
        }
      }
      else if (source.getAction() == ACTION.SET 
          || source.getAction() == ACTION.SHOW || source.getAction() == ACTION.HIDE || source.getAction() == ACTION.FILTER || source.getAction() == ACTION.SORT)
      {
        if (source.getRefType() == TYPE.CELL || source.getRefType() == TYPE.RANGE
            || source.getRefType() == TYPE.ROW || source.getRefType() == TYPE.COLUMN)
        {
          areaBroadcast((RangeInfo)source.getRefValue(), e);
          // next, set dirty for all the formula cells in the set range
          // FOR PERFOMANCE ISSUE, this should be done after track formula, in case there is dup broadcast to track formula
          // but now just set dirty when formula cell is parse
        }
        else
        {
          LOG.log(Level.WARNING, "AreaManager can not support event with {0} {1}", new String[] { source.getAction().toString(),
              source.getRefType().toString() });
        }
      }
      else if ((source.getAction() == ACTION.INSERT)
          && (source.getRefType() == TYPE.ROW || source.getRefType() == TYPE.COLUMN))
      {
        //do nothing for insert, but in preinsert
      }
      else
        LOG.log(Level.WARNING, "AreaManager can not support event with {0} {1}", new String[] { source.getAction().toString(),
            source.getRefType().toString() });
      if(trackFromCell != null) {
        trackFromCell = trackFromCell.next;
      } else
        trackFromCell = this.fCellHead;
      // for performance, do not set dirty for impact cells now
//      trackFormula(e, trackFromCell, updateRange, rowDelta, colDelta);   
    }
  }
  
//  private void areaHandler(NotifyEvent e)
//  {
//    EventSource source = e.getSource();
//    Area area = (Area)source.getRefValue();
//    RangeInfo rangeInfo = area.getRange();
//    String id = area.getId();
//    ACTION action = source.getAction();
//    JSONObject data = source.getData();
//    JSONObject areaData = (JSONObject)data.get(ConversionConstant.DATA);
//    String usageStr = (String)data.get(ConversionConstant.RANGE_USAGE);
//    RangeUsage usage = RangeUsage.enumValueOf(usageStr);
//    
//    EventSource ns = new EventSource(action, TYPE.AREA, area);
//    NotifyEvent ne = new NotifyEvent(CATEGORY.DATACHANGE, ns);
//    ns.setData(data);
//    if (action == ACTION.DELETE) {
//      area = this.getAreaByUsage(id, usage, -1);
//      if (area == null)
//        return;
//      ns.setRefValue(area);
//      if (usage == RangeUsage.NAMES && area.hasListener()) {
//        String lowerId = id.toLowerCase();
//        UndefinedNameArea undefinedName = new UndefinedNameArea(id);
//        this.undefinedNamesArea.put(lowerId, undefinedName);
//        ns.setRefValue(undefinedName);
//        List<IListener> ls = area.getAllListeners();
//        for ( int i = 0 ; i < ls.size(); i++) {
//          IListener l = ls.get(i);
//          undefinedName.addListener(l);
//        }
//      }
//      this.deleteArea(area);
//      area.broadcast(ne);
//      area.removeAllListener();
//    } else if(action == ACTION.INSERT) {
//      Area oldArea = this.getAreaByUsage(id, usage, -1);
//      if (oldArea != null)
//        this.deleteArea(oldArea);
////      if (usage == RangeUsage.NAMES) {
////        area = new NameArea(rangeInfo, id, doc);
////      } else
////        area = new Area(rangeInfo, id, usage, doc);
//      if(areaData != null)
//        area.setData((JSONObject)areaData.clone());
//      ns.setRefValue(area);
//      area = this.addArea(area);
//      if (usage == RangeUsage.NAMES) {
//        String lowerId = id.toLowerCase();
//        // notify the cell which refer to the undefined name range
//        UndefinedNameArea ua = undefinedNamesArea.get(lowerId);
//        if(ua != null)
//        {
//          ua.broadcast(ne);
//          List<IListener> ls = ua.getAllListeners();
//          for ( int i = 0 ; i < ls.size(); i++) {
//            IListener l = ls.get(i);
//            area.addListener(l);
//          }
//          ua.removeAllListener();
//          undefinedNamesArea.remove(lowerId);
//          namesArea.put(lowerId, (NameArea)area);
//        }
//      } else {
//        area.broadcast(ne);
//        //TODO: test data
//      }
//    } else if(action == ACTION.SET) {
//      this.updateAreaByUsage(rangeInfo, id, usage, ne);
//    }
//    //TODO: test data change
////    if(ne._data)
////        event._data = ne._data;
//  }
  
  private void sheetHanlder(NotifyEvent e)
  {
    EventSource source = e.getSource();
    RangeInfo range = (RangeInfo)source.getRefValue();
    final int sheetId = range.getSheetId();
    
    if(source.getAction() == ACTION.PREDELETE)
    {
      updateBroadcastAreasInSheet(sheetId, e);
      List<AreaPage> pages = pageTables.get(sheetId);
      if (pages!=null)
      {
        for (AreaPage page:pages)
        {
          if(page != null)
            page.preDeleteSheet(sheetId, e, this);
        }
      }
      pageTables.remove(sheetId);
      try
      {
        this.manageUpdateAreas(AreaPage.class.getDeclaredMethod("modify3DTo2DRef", Reference.class), null);
      }
      catch (SecurityException e1)
      {
        LOG.log(Level.WARNING, "can not access modify3DTo2DRef method when managerUpdateAreas");
      }
      catch (NoSuchMethodException e1)
      {
        LOG.log(Level.WARNING, "no modify3DTo2DRef method when managerUpdateAreas");
      }
    }
    else if(source.getAction() == ACTION.PREMOVE)
    {
      int delta = (Integer)source.getData().get(ConversionConstant.DELTA);
      Sheet sheet = doc.getSheetById(sheetId);
      int sheetIndex = sheet.getIndex();
      int newSheetIndex = sheetIndex + delta;
      JSONObject oriData = e.getSource().getData();
      JSONObject data = null;
      if (oriData == null) 
        data = new JSONObject();
      else
        data = (JSONObject) oriData.clone();
      e.getSource().setData(data);
      List<AreaPage> pages = pageTables.get(sheetId);
      if (pages!=null)
      {
        for (AreaPage page:pages)
        {
          // update 3D reference for move sheet event, deal with case 1-4 in Area.preMoveSheet 
          if (page != null)
            page.preMoveSheet(e, sheetIndex, newSheetIndex, this);
        }
      }
      e.getSource().setData(oriData);
      // insert 3D reference if move in the sheet range (case 5-6 in Area.preMoveSheet)
      Sheet preSheet = null;
      if (sheetIndex < newSheetIndex) 
        preSheet = this.doc.getSheets().get(newSheetIndex-1);
      else if (newSheetIndex > 1)
        preSheet = this.doc.getSheets().get(newSheetIndex-2);
      if(preSheet != null)
        this.insert3DRefFromPreSheet(preSheet.getId(), sheetId, e);
      
      try
      {
        this.manageUpdateAreas(AreaPage.class.getDeclaredMethod("update3DRefForMove", Reference.class), AreaManager.class.getDeclaredMethod("clear3DRefOpSheetsData", Reference.class));
      }
      catch (SecurityException e1)
      {
        LOG.log(Level.WARNING, "can not access reflection method when move sheet");
      }
      catch (NoSuchMethodException e1)
      {
        LOG.log(Level.WARNING, "no specified reflection method when move sheet");
      }
    }
    else if(source.getAction() == ACTION.INSERT)
    {
      // if it is delete sheet undo event, and the recover doc has been serialized
      // then the name range in the recover doc, after recover, the name area should be updated for each listener
      RangeMap<String> map = doc.getRangeList().getByUsageRangeMap().get(RangeUsage.NAMES);
      ModelHelper.iterateMap(map, new RangeIterator<String>()
      {
        public boolean onEntry(String id, Range<String> range)
        {
          if(range.getSheetId() == sheetId) // only for the name range in the recover sheet
          {
            Area a = namesArea.get(id);
            //update area only when the sheetId in area is invalid, it means that the recover doc has been serialized
            //if not been serialized, the area will not changed 
            if(a != null && a.getSheetId() == IDManager.INVALID) 
            {
              NameArea newArea = (NameArea)startListeningArea(range.getRangeInfo(), null, a);
              EventSource ns = new EventSource(NotifyEvent.ACTION.SET, NotifyEvent.TYPE.AREA, newArea);
              NotifyEvent ne = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, ns);
              a.broadcast(ne);
              a.removeAllListener();
              namesArea.put(id, newArea);//the name area for range is out of date
            }
//            else
//              return true;//do not need iterate 
          }
          return false;
        }
      });
      Sheet sheet = doc.getSheetById(sheetId);
      if (sheet!=null)
      {
        int sheetidx = sheet.getIndex();
        if (sheetidx>1)
        {
          Sheet preSheet = doc.getSheets().get(sheetidx - 2);
          insert3DRefFromPreSheet(preSheet.getId(), sheet.getId(), e);
          try
          {
            this.manageUpdateAreas(null, AreaManager.class.getDeclaredMethod("clear3DRefOpSheetsData", Reference.class));
          }
          catch (SecurityException e1)
          {
            LOG.log(Level.WARNING, "can not access clear3DRefOpSheetsData method when managerUpdateAreas");
          }
          catch (NoSuchMethodException e1)
          {
            LOG.log(Level.WARNING, "no clear3DRefOpSheetsData method when managerUpdateAreas");
          }
        }
      }
    }
    else if(source.getAction() == ACTION.SET) {
      updateBroadcastAreasInSheet(sheetId, e);
    }
    
  }
  private void insert3DRefFromPreSheet(int preSheetId, int sheetId, NotifyEvent e)
  {
    List<AreaPage> pages = pageTables.get(preSheetId);
    if (pages == null)
      return;
    for (int i = 0; i < pages.size(); i++)
    {
      AreaPage page = pages.get(i);
      if (page == null)
        continue;
      List<Reference> ref3DList = page.get3DAreas();
      int size = (ref3DList == null)?0:ref3DList.size();
      for (int j = 0; j < size; j++){
        Reference ref = ref3DList.get(j);
        if(ref!=null && (ref.getEndSheetId() != preSheetId)
            && (ref.updateStatus <= AreaUpdateInfo.UPDATE.getValue()) ) {
          JSONArray opSheets = new JSONArray();
          opSheets.add(sheetId);
          JSONObject data = ref.getData();
          if (data == null ){
            data = new JSONObject();
            ref.setData(data);
          }
          data.put("opSheets", opSheets);
          ref.updateStatus |= (AreaUpdateInfo.UPDATE.getValue() | AreaUpdateInfo.ADD.getValue());
          ref.broadcast(e);
          this.appendToReferenceTrack(ref);
        }
      }
    }    
  }

  void clear3DRefOpSheetsData(Reference ref3D)
  {
    JSONObject data = ref3D.getData();
    if (data != null ){
      data.remove("opSheets");
    }
  }
  /////////////////////////////////////////////////////////////////////////
  public void appendToSharedFormulaTrack(SharedFormulaRefBase sharedFormulaRef)
  {
      if(sFormulaTrack == null)
          sFormulaTrack = new ArrayList<SharedFormulaRefBase>();
      for(int i = 0; i < sFormulaTrack.size(); i ++)
      {
          if(sFormulaTrack.get(i) == sharedFormulaRef)
              return;
      }
      sFormulaTrack.add(sharedFormulaRef);
  }
  
  public void appendToSharedRefTrack(Area sharedRef){
        if(sharedRefTrack == null)
            sharedRefTrack = new ArrayList<Area>();;
        for(int i = 0; i < sharedRefTrack.size(); i++)
        {
            if(sharedRefTrack.get(i) == sharedRef)
                return;
        }
        sharedRefTrack.add(sharedRef);
    }
  
  ///////////////////////////// Formula Track ///////////////////////////////////
  public boolean isInFormulaTrack(FormulaCell cell)
  {
    if( cell != null &&( cell.pre != null  ||  fCellHead == cell ) )
      return true;
    return false;
  }

  public void appendToFormulaTrack(FormulaCell cell)
  {
    if(isInFormulaTrack(cell))
      return;
    if(fCellLast != null)
      fCellLast.next = cell;
    else
      fCellHead = cell;
    cell.pre = fCellLast;
    cell.next = null;
    fCellLast = cell;
  }
  
  public void appendToReferenceTrack(Area a)
  {
    if (a != null && (a.pre != null || updateAreas == a))
      return;
    if(updateAreasLast != null)
      updateAreasLast.next = a;
    else
      updateAreas = a;
    a.pre = updateAreasLast;
    a.next = null;
    updateAreasLast = a;
  }
  
  public void clearReferenceTrack()
  {
    while(updateAreas != null)
    {
      Area area = updateAreas.next;
      updateAreas.next = null;
      updateAreas.pre = null;
      updateAreas.updateStatus = AreaUpdateInfo.NONE.getValue();
      updateAreas = area;
    }
    this.updateAreas = this.updateAreasLast = null;
  }
  
  public void removeFromFormulaTrack(FormulaCell cell)
  {
    if(cell == null)
      return;
    FormulaCell pre = cell.pre;
    if(pre != null || fCellHead == cell)
    {
      FormulaCell next = cell.next;
      if(pre != null)
        pre.next = next;
      else
        fCellHead = next;
      if(next != null)
        next.pre = pre;
      else
        fCellLast = pre;
      cell.pre = null;
      cell.next = null;
    }
  }
  
  /**
   * iterate the formula cell in the track list and append the new formula cell to track list if they are impact cells
   */
  public void trackFormula(NotifyEvent event,FormulaCell trackFromCell, RangeInfo updateRange, int rowDelta, int colDelta)
  {
    EventSource source = new EventSource(NotifyEvent.ACTION.SET, NotifyEvent.TYPE.CELL, null);
    NotifyEvent e = new NotifyEvent(NotifyEvent.CATEGORY.DATACHANGE, source);
    FormulaCell cellIter = trackFromCell;
    while(cellIter != null)
    {
      if(cellIter.isDirty())
      {
        RangeInfo cellPos = cellIter.getPos();
        if (updateRange != null && updateRange.getSheetId() == cellPos.getSheetId()) {
          Area a = new Area(cellPos, null, RangeUsage.NORMAL, doc);
          a.update(updateRange, rowDelta, colDelta, null);
          cellPos = a.getRange();
        }
        source.setRefValue(cellPos);
        areaBroadcast(cellPos, e);
      }
      cellIter = cellIter.next;
    }
    clearReferenceTrack();
  }

  ////////////////////////////////////////recover sheet operation//////////////////////////////////
  public void recoverRanges4Sheet(Integer sheetId, AreaManager recoverAreaManager)
  {
    List<AreaPage> pages = recoverAreaManager.pageTables.remove(sheetId);
    pageTables.put(sheetId, pages);
  }

  public void backup(int sheetId, AreaManager areaManager)
  {
    if(this.doc == areaManager.doc)
    {
      LOG.log(Level.WARNING, "when backup area manager, doc of recover manager is the same with the main document");
      return;
    }
    //backup AreaPages
    List<AreaPage> pages = areaManager.pageTables.get(sheetId);//not remove from main doc, because it still need when predelete sheet 
    pageTables.put( sheetId, pages);
    //TODO: usageMap backup, refer to RangeList, which create a new name range and store
  }
  
//  ///////////////////////////////////////////////new ref value type for notify event///////////////////
//  /**
//   * AreaValue is used as RefValue in NotifyEvent
//   *
//   */
//  public class NameAreaRefValue 
//  {
//    Area area;
//    String name;
//    public NameAreaRefValue(String n, Area a)
//    {
//      name = n;
//      area = a;
//    }
//    
//    public Area getArea()
//    {
//      return area;
//    }
//    
//    public String getName()
//    {
//      return name;
//    }
//  }
  //only used for UT
  public HashMap<Integer, List<AreaPage>> getPageTables()
  {
    return pageTables;
  }
  
  public void decompose()
  {
    Iterator<Integer> iter = pageTables.keySet().iterator();
    while(iter.hasNext())
    {
      int pageIndex = iter.next();
      List<AreaPage> pages = pageTables.get(pageIndex);
      for(int i = 0; i < pages.size(); i++)
      {
        AreaPage page = pages.get(i);
        if(page == null)
          continue;
//        List<Area> areas = page.getAreas();
//        for(int j = 0; j < areas.size(); j++)
//        {
//          Area area = areas.get(j);
//          if(area == null)
//            continue;
//          area = null;
//        }
        page = null;
      }
      pages.clear();
      pages = null;
    }
    pageTables.clear();
    pageTables = null;
    
    namesArea.clear();
    namesArea = null;
    undefinedNamesArea.clear();
    undefinedNamesArea = null;
  }
}
