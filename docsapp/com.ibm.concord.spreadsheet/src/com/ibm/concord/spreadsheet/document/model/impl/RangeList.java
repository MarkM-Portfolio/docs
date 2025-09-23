package com.ibm.concord.spreadsheet.document.model.impl;

/**
 * Store all the unname ranges, including filter, image, comments
 * and name ranges
 */
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeRelation;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.Broadcaster;
import com.ibm.concord.spreadsheet.document.model.Listener;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.EventSource;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.TYPE;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.ACTION;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class RangeList<T> extends Listener
{
  private static final Logger LOG = Logger.getLogger(RangeList.class.getName());
  
  protected Document doc;
  /**
   * sheetId: {rows:[], cols:[], rangeId:{}}
   */
  protected Map<Integer, RangesStruct<T>> map = null;

  /**
   * rangeType: (rangeId: range)
   */
  protected Map<RangeUsage, RangeMap<T>> usageMap = null;

  public RangeList(Document doc)
  {
    map = new HashMap<Integer, RangesStruct<T>>();
    this.doc = doc;
  }

  public Document getParent()
  {
    return doc;
  }
  
  public Range addRange(Range<T> r)
  {
    if(r == null)
      return null;
    
    if(r.is3D()) {
      T id = r.getId();
      RangesStruct<T> startSheet = getRangesStruct(r.getSheetId(), true);
      startSheet.get3DRangeMap().put(id, r);
      RangesStruct<T> endSheet = getRangesStruct(r.getEndSheetId(), true);
      endSheet.get3DRangeMap().put(id, r);
  } else {
    RangesStruct<T> ranges = getRangesStruct(r.getSheetId(), true);
    if(ranges != null)
    {
      ranges.addRange(r);
    }
  }
    //should always put into usage map
      if (r.getUsage() != RangeUsage.NORMAL)
      {
        RangeMap<T> uMap = getRangeMapByUsage(r.getUsage(), true);
        if(uMap != null)
          uMap.put(r);
        
        if(r.getUsage() == RangeUsage.RECOVER_REFERENCE)
        {
          //recover ref count should set to document idConvertor for serializer
          doc.getIdConvertor().updateRecRefCount((String)r.getId());
        }
      }
      
    return r;
  }
  
  public void deleteRange(Range<T> r)
  {
    if(null == r)
      return;
    if(r.is3D()) {
      T id = r.getId();
      RangesStruct<T> startSheet = getRangesStruct(r.getSheetId(), false);
      if (startSheet != null)
        startSheet.get3DRangeMap().remove(id);
      RangesStruct<T> endSheet = getRangesStruct(r.getEndSheetId(), false);
      if (endSheet != null)
        endSheet.get3DRangeMap().remove(id);
  } else {
    RangesStruct<T> ranges = getRangesStruct(r.getSheetId(), false);
    if(ranges != null)
      ranges.deleteRange(r);
  }
    if (r.getUsage() != RangeUsage.NORMAL)
    {
      RangeMap<T> uMap = getRangeMapByUsage(r.getUsage(), true);
      if(uMap != null)
        uMap.remove(r.getId());
    }
  }
  //for preDelete
  private void deleteRange(Range<T> r, Iterator<T> iter)
  {
    if(null == r)
      return;
    if (iter != null)
      iter.remove();
    if (r.getUsage() != RangeUsage.NORMAL)
    {
      RangeMap<T> uMap = getRangeMapByUsage(r.getUsage(), true);
      if(uMap != null)
        uMap.remove(r.getId());
    }
  }
  
  /**
   * delete all the ranges of usage type
   * @param usage
   */
  public void deleteRangesByUsage(RangeUsage usage)
  {
    RangeMap<T> uMap = getRangeMapByUsage(usage, false);
    if(uMap != null)
    {
      ModelHelper.iterateMap(uMap, new RangeIterator<T>()
      {
        public boolean onEntry(T id, Range<T> range)
        {
          RangesStruct<T> ranges = getRangesStruct(range.getSheetId(), false);
          if(ranges != null)
            ranges.deleteRange(range);
          return false;
        }
      });
    }
    if(usageMap != null)
      usageMap.remove(usage);
  }

  protected RangesStruct getRangesStruct(int sheetId, boolean bCreate)
  {
    Sheet sheet = this.doc.getIDManager().getSheetIdMap().get(sheetId);
    if(sheet == null)
      return null;
    RangesStruct<T> rm = map.get(sheetId);
    if (rm == null && bCreate)
    {
      rm = new RangesStruct<T>();
      map.put(sheetId, rm);
    }
    return rm;
  }

  protected RangeMap<T> getRangeMapByUsage(RangeUsage t, boolean bCreate)
  {
    Map<RangeUsage, RangeMap<T>> uMap = getByUsageRangeMap();
    if(uMap == null)
      return null;
    RangeMap<T> rm = uMap.get(t);
    if (rm == null)
    {
      rm = new RangeMap<T>();
      usageMap.put(t, rm);
    }
    return rm;
  }
  //used for NodeJS
  public ArrayList<Range> getNameRanges()
  {
    final ArrayList<Range> names = new ArrayList<Range>();
    RangeMap nameMap = getRangeMapByUsage(RangeUsage.NAMES, false);
    ModelHelper.iterateMap(nameMap, new RangeIterator<String>()
    {
      public boolean onEntry(String id, Range<String> range)
      {
        names.add(range);
        return false;
      }
    });
    return names;
  }
  
  public boolean hasValidACLRanges()
  {
    RangeMap aclMap = getRangeMapByUsage(RangeUsage.ACCESS_PERMISSION,false);
    if(aclMap == null) return false;
    boolean ret = false;
    Iterator iter = aclMap.keySet().iterator();
    while(iter.hasNext())
    {
      String id = (String) iter.next();
      Range range = (Range)aclMap.get(id);
      if(range.isValid())
      {
        ret = true; break;
      }
    }
    return ret;
  }
  
  public Map<Integer, RangesStruct<T>> getBySheetIdRangeMap()
  {
    return map;
  }

  public Map<RangeUsage, RangeMap<T>> getByUsageRangeMap()
  {
    if(usageMap == null)
      usageMap = new HashMap<RangeUsage, RangeMap<T>>();
    return usageMap;
  }

  public Range<T> getRangeById(T rangeId, int sheetId)
  {
    RangesStruct<T> struct = getRangesStruct(sheetId, false);
    if(struct != null)
    {
      Range<T> range = struct.getRangeMap().get(rangeId);
      if (range == null) {
        range = struct.get3DRangeMap().get(rangeId);
      }
      return range;
    }else
    {
      Set<Entry<Integer, RangesStruct<T>>> set = map.entrySet();
      for (Iterator<Entry<Integer, RangesStruct<T>>> iterator = set.iterator(); iterator.hasNext();)
      {
        Entry<Integer, RangesStruct<T>> entry = iterator.next();
        struct = entry.getValue();
        Range<T> r = struct.getRangeMap().get(rangeId);
        if(r == null) {
          r = struct.get3DRangeMap().get(rangeId);
        }
        if (r != null)
          return r;
      }
    }
    return null;
  }
  
  public Range<T> getRangeByUsage(T rangeId, RangeUsage t)
  {
    RangeMap<T> ranges = getRangeMapByUsage(t, false);
    if(ranges != null)
    {
      return ranges.get(rangeId);
    }
    return null;
  }
  
  void modifyShapeRanges(int sheetId,int sIndex, int eIndex, TYPE type)
  {
    RangeMap<T> ranges = new RangeMap<T>();
    RangeMap<T> imageMap = getRangeMapByUsage(RangeUsage.IMAGE, false);
    if(imageMap != null)
      ranges.putAll(imageMap);
    RangeMap<T> shapeMap = getRangeMapByUsage(RangeUsage.SHAPE, false);
    if(shapeMap != null)
      ranges.putAll(shapeMap);
    RangeMap<T> chartImageMap = getRangeMapByUsage(RangeUsage.CHART_AS_IMAGE, false);
    if(chartImageMap != null)
      ranges.putAll(chartImageMap);
    RangeMap<T> chartMap = getRangeMapByUsage(RangeUsage.CHART, false);
    if(chartMap != null)
      ranges.putAll(chartMap);
    Iterator<T> iter = ranges.keySet().iterator();
    while(iter.hasNext())
    {
      T id = iter.next();
      Range<T> range = ranges.get(id);
      if(sheetId != range.getSheetId())
        continue;
      JSONObject data = (JSONObject)range.getData().get(ConversionConstant.RANGE_OPTIONAL_DATA);
      if(data == null || data.isEmpty())
      {
        LOG.log(Level.WARNING, "!!!!!!!!!!!!!!the image or chart has no data, range id is" + id);
        continue;
      }
      String pt = (String)data.get("pt");
      if(null != pt && pt.equalsIgnoreCase("absolute"))
        continue;
      RangeInfo info = range.getRangeInfo();
      int rsIndex, reIndex;
      if(type == TYPE.ROW)
      {
        rsIndex = info.getStartRow();
        reIndex = info.getEndRow();
      }else
      {
        rsIndex = info.getStartCol();
        reIndex = info.getEndCol();
      }
      if(eIndex < rsIndex || reIndex < sIndex || (sIndex <= rsIndex && eIndex >= reIndex ))
        continue;
      
      if(rsIndex >= sIndex && rsIndex <= eIndex )
      {
        if(type == TYPE.ROW)
          data.put("y", 0);
        else
          data.put("x", 0);
      }
      else if(reIndex >= sIndex && reIndex <= eIndex )
      {
        if(type == TYPE.ROW)
          data.put("ey", -1);
        else
          data.put("ex", -1);
      }  
    }
  }
  
  public void preDelete(EventSource s)
  {
    IDManager idManager = this.doc.getIDManager();
    RangeInfo info = (RangeInfo)s.getRefValue();
    int sheetId = info.getSheetId();
    NotifyEvent.TYPE type = s.getRefType();
    RangesStruct<T> struct = getRangesStruct(sheetId, false);
    if(struct != null)
    {
      if(type == NotifyEvent.TYPE.ROW || type == NotifyEvent.TYPE.COLUMN)
      {
        int sIndex = -1;
        int eIndex = -1;
        if(type == NotifyEvent.TYPE.ROW)
        {
          sIndex = info.getStartRow();
          eIndex = info.getEndRow();
        }else
        {
          sIndex = info.getStartCol();
          eIndex = info.getEndCol();
        }
        if(sIndex > eIndex)
        {
          int rIndex = eIndex;
          eIndex = sIndex;
          sIndex = rIndex;
        }
        modifyRangesDataByUsage(sheetId, sIndex, eIndex, type, ACTION.PREDELETE);
        HashMap<Integer, HashSet<Range>> structEntry;
        if(type == NotifyEvent.TYPE.ROW)
          structEntry = struct.getRows();
        else
          structEntry = struct.getCols();
        for(int rIndex = sIndex; rIndex <= eIndex; rIndex++)
        {
          int id = IDManager.INVALID;
          if(type == NotifyEvent.TYPE.ROW)
            id = idManager.getRowIdByIndex(sheetId, rIndex, false);
          else
            id = idManager.getColIdByIndex(sheetId, rIndex, false);
          HashSet<Range> set = structEntry.get(id);
          if(set != null)
          {
            Iterator<Range> iter = set.iterator();
            while(iter.hasNext())
            {
              Range r = iter.next();
              if (!r.is3D())  // ignore 3d reference
                this.changeByType(struct, r, sheetId, sIndex, eIndex, type);
              else {
                String address = r.getAddress();
                r.setAddress(address, true);
              }
            }
            structEntry.remove(id);
          }
          
        }
      }else if(type == NotifyEvent.TYPE.SHEET)
      {
        RangeMap<T> ranges = struct.getRangeMap();
        Iterator<T> iter = ranges.keySet().iterator();
        while(iter.hasNext())
        {
          T id = iter.next();
          Range r = ranges.get(id);
          if(r != null)
          {
            ConversionUtil.RangeUsage usage = r.getUsage();
            switch(usage)
            {
              //for following type, move from usage map
              //and they can be recovered to usage map when recover sheet
              //seems useless, because when recover, it can still put to usageMap again
              case DELETE:
              case ANCHOR:
              case INHERIT:
              case COPY:
              {
                r.setInvalidSheetName();
                //no break here because they need remove from usage map
              }
              case STYLE:
              case IMAGE:
              case SHAPE:
              case CHART_AS_IMAGE:
              case ACCESS_PERMISSION:
              case TASK:
              case FILTER:
              {
                RangeMap<T> m = this.getRangeMapByUsage(usage, false);
                if(m != null)
                {
                  m.remove(id);
                }
                break;
              }
              case COMMENT:
              {
            	  deleteRange(r, iter);
            	  doc.deleteComments(id);
            	  break;
              }
              case NORMAL:
                LOG.log(Level.WARNING, "there is a range {0} with normal usage in rangelist" + r.getId());
                break;
              case NAMES:
                if (r.is3D())
                {
                  // process later
                  break;
                }
              case CHART://the chart reference might referenced by the chart in the exist sheet 
              case SPLIT:
              case FORMULA:
              case REFERENCE://reference should stored in referenceList
              case VALIDATION_REF:
              default:
              {
                r.setInvalidSheetName();
                break;
              }
            }
          }
        }
        RangeMap<T> range3Ds = struct.get3DRangeMap();
        iter = range3Ds.keySet().iterator();
        while(iter.hasNext()) {
          T id = iter.next();
          Range<T> r = range3Ds.get(id);
          if(r != null && r.is3D()) {
            if (sheetId == r.getSheetId() || sheetId == r.getEndSheetId()) {
              int newSheetId = -1;
              if (r.getSheetId() == sheetId)
              {
                newSheetId = doc.getNextSheetId(sheetId);
                if (newSheetId > 0) {
                  r.setSheetId(newSheetId);
                }
              }
              else if (r.getEndSheetId() == sheetId)
              {
                newSheetId = doc.getPrevSheetId(sheetId);
                if (newSheetId > 0) {
                  r.setEndSheetId(newSheetId);
                }
              }
              if (r.getSheetId() == r.getEndSheetId()) {
                this.modify3DRefTo2D(r);
              }if (newSheetId > -1) {
                RangesStruct<T> newSheet = getRangesStruct(newSheetId, true);
                newSheet.get3DRangeMap().put(id, r);
              }
            }
          }
        }
        map.remove(sheetId);
      }
    } 
  }
  
  
  private void modify3DRefTo2D(Range<T> range) 
  {
    T rangeID = range.getId();
    
    // delete from range3D map 
    RangesStruct<T> startSheet = getRangesStruct(range.getSheetId(), true);
    startSheet.get3DRangeMap().remove(rangeID);
    
    // add 2d range map
    this.addRange(range);
  }
  
  private void preMove(EventSource s)
  {
    NotifyEvent.TYPE type = s.getRefType();
    if(type ==NotifyEvent.TYPE.SHEET) {
      RangeInfo info = (RangeInfo)s.getRefValue();
      int sheetId = info.getSheetId();
      int delta = (Integer)s.getData().get(ConversionConstant.DELTA);
      Sheet sheet = doc.getSheetById(sheetId);
      int fromIndex = sheet.getIndex();
      int toIndex = fromIndex + delta;
      RangesStruct<T> struct = getRangesStruct(sheetId, false);
      if(struct != null) {
        RangeMap<T> range3Ds = struct.get3DRangeMap();
        Iterator<T> iter = range3Ds.keySet().iterator();
        while(iter.hasNext()) {
          T id = iter.next();
          Range<T> r = range3Ds.get(id);
          if(r != null && r.is3D()) {
            if (sheetId == r.getSheetId() || sheetId == r.getEndSheetId()) {
              Sheet startSheet = this.doc.getSheetById(r.getSheetId());
              Sheet endSheet = this.doc.getSheetById(r.getEndSheetId());
              if (startSheet != null && endSheet != null) {
                int startIndex = startSheet.getIndex();
                int endIndex = endSheet.getIndex();
                int newSheetId = -1;
                if(sheetId == r.getSheetId() && toIndex >= endIndex) {
                  iter.remove();
                  newSheetId = doc.getNextSheetId(sheetId);
                  r.setSheetId(newSheetId);
                  
                } else if (sheetId == r.getEndSheetId() && toIndex <= startIndex) {
                  iter.remove();
                  newSheetId = doc.getPrevSheetId(sheetId);
                  r.setEndSheetId(newSheetId);
                }
                if (r.getSheetId() == r.getEndSheetId()) {
                  this.modify3DRefTo2D(r);
                } else if(newSheetId > -1) {
                  RangesStruct<T> newSheet = getRangesStruct(newSheetId, true);
                  newSheet.get3DRangeMap().put(id, r);
                }
              }
            }
          }
        }
      }
    }
  }
  protected void modifyRangesDataByUsage(int sheetId, int sIndex, int eIndex, TYPE type, ACTION action) {
	  modifyShapeRanges(sheetId, sIndex, eIndex, type);
      modifyFilterRanges(sheetId, sIndex, eIndex, type,action);
  }

  //when delete row/column cover the filter header
  //the filtered row need to be restored and delete such filter
  void modifyFilterRanges(int sheetId, int sIndex, int eIndex, TYPE type, ACTION action)
  {
    if(type == TYPE.ROW || type == TYPE.COLUMN)
    {
      Sheet sheet = this.doc.getSheetById(sheetId);
      RangeMap<T> map = getRangeMapByUsage(RangeUsage.FILTER, false);
      if(map == null)
        return;
      Iterator<T> iter = map.keySet().iterator();
      ArrayList<Range> deleteRanges = new ArrayList<Range>();
      while(iter.hasNext())
      {
        T id = iter.next();
        Range<T> r = map.get(id);
        RangeInfo info = r.getRangeInfo();
        if(sheetId != info.getSheetId())
          continue;
        
        if(type == TYPE.COLUMN)
        {
          int start= info.getStartCol();
          int end = info.getEndCol();
          int cnt = eIndex - sIndex + 1;
          JSONObject data = (JSONObject)r.getData().get(ConversionConstant.RANGE_OPTIONAL_DATA);
          if(action==ACTION.PREDELETE && (sIndex<=start && eIndex>=end))
          {
            sheet.restoreFilteredRows(info);
            deleteRanges.add(r);
          }
          else if(data!=null && !data.isEmpty())
          {
            JSONObject newData = new JSONObject();
            Iterator<Map.Entry<String, JSONObject>> itor = data.entrySet().iterator();
            while(itor.hasNext())
            {
              Map.Entry<String, JSONObject> entry = itor.next();
              String sCol = entry.getKey();
              Object value = entry.getValue();
              if(!(value instanceof JSONObject))
              {
            	  newData.put(sCol, value);
            	  continue;
              }
              JSONObject rule = (JSONObject) value;
              int iCol = Integer.valueOf(sCol);
              if(action==ACTION.PREDELETE)
              {
                if(iCol<sIndex)
                  newData.put(sCol, rule);
                else if(iCol>eIndex)
                  newData.put(String.valueOf(iCol-cnt), rule);
              }
              else if(action==ACTION.INSERT)
              {
                if(iCol<sIndex)
                  newData.put(sCol, rule);
                else
                  newData.put(String.valueOf(iCol+cnt), rule);
              }
            }
            
            if(newData.isEmpty())
              r.getData().remove(ConversionConstant.RANGE_OPTIONAL_DATA);
            else
              r.getData().put(ConversionConstant.RANGE_OPTIONAL_DATA,newData);
          }
        }
        else if(type == TYPE.ROW)
        {
          if(action==ACTION.PREDELETE)
          {
            int start = info.getStartRow();
            if(start>=sIndex && start<=eIndex)
            {
              sheet.restoreFilteredRows(info);
              deleteRanges.add(r);
            }
          }
        }
      }
      for(int i = 0; i < deleteRanges.size(); i++)
      {
        Range<T> r = deleteRanges.get(i);
        deleteRange(r);
      }
    }
  
  }

  //called by setRangeInfo/setRange/updateUnnameRange/recoverRanges4Sheet
  public void updateRangeByUsage(ParsedRef ref, Range<T> range,RangeUsage usage )
  {
    if(range != null)
    {
      int osId = range.getSheetId();
      int osr = range.getStartRowId();
      int osc = range.getStartColId();
      int oer = range.getEndRowId();
      int oec = range.getEndColId();
      boolean is3D = false;
      if (ref.is3DRef() || range.is3D()) {
        is3D = true;
        this.deleteRange(range);
      }
      range.updateAddress(ref, null);
      if (is3D) {
        this.addRange(range);
        return;
      }
      int sheetId = range.getSheetId();
      
      RangesStruct<T> sheet = getRangesStruct(sheetId, true);
      if(sheet != null)//sheet is null when sheetId is -1 or does not exist in document
      {
	      RangeMap<T> ranges = sheet.getRangeMap();
	      if(ranges.containsKey(range.getId()))
	      {
	        int nsr = range.getStartRowId();
	        int nsc = range.getStartColId();
	        int ner = range.getEndRowId();
	        int nec = range.getEndColId();
	        this.modifyRange(sheet, range, TYPE.ROW, osr, nsr, oer, ner, true);
	        this.modifyRange(sheet, range, TYPE.COLUMN, osc, nsc, oec, nec, true);
	      }else
	        addRange(range);
      }
      if(osId != sheetId)//even if sheetId is -1, should also remove range from the original sheet
      {
        //remove the range from osId rangesStruct
        sheet = getRangesStruct(osId, false);
        if(sheet != null)
        {
          sheet.getRangeMap().remove(range.getId());
          if(osr != IDManager.INVALID)
          {
            HashSet<Range> srSet = sheet.getRows().get(osr);
            if(srSet != null)
              srSet.remove(range);
          }
          if(oer != IDManager.INVALID)
          {
            HashSet<Range> erSet = sheet.getRows().get(oer);
            if(erSet != null)
              erSet.remove(range);
          }
          if(osc != IDManager.INVALID)
          {
            HashSet<Range> scSet = sheet.getCols().get(osc);
            if(scSet != null)
              scSet.remove(range);
          }
          if(oec != IDManager.INVALID)
          {
            HashSet<Range> ecSet = sheet.getCols().get(oec);
            if(ecSet != null)
              ecSet.remove(range);
          }
        }
      }
    }
  }
  
  private void changeByType(RangesStruct<T> sheet, Range<T> rangeModel, int sheetId, int sIndex, int eIndex, TYPE type)
  {
    IDManager idManager = this.doc.getIDManager();
    RangeInfo info = rangeModel.getRangeInfo();
    int start = info.getStartRow();
    int end = info.getEndRow();
    int startId = rangeModel.getStartRowId();
    int endId = rangeModel.getEndRowId();
    if( type == TYPE.COLUMN)
    {
      start = info.getStartCol();
      end = info.getEndCol();
      startId = rangeModel.getStartColId();
      endId = rangeModel.getEndColId();
    }
    
    boolean bChangeStartId = false;
    boolean bChangeEndId = false;
    
    int[] pos = getPredeletePositon(start, end, sIndex, eIndex, rangeModel.getUsage());
    if(start != pos[0])
    {
      start = pos[0];
      bChangeStartId = true;
    }
    if(end != pos[1])
    {
      end = pos[1];
      bChangeEndId = true;
    }
    
    if(bChangeStartId || bChangeEndId)
    {
      int os = startId;
      int oe = endId;
      if (bChangeStartId)
      {
        // if start == -1, getRowIdByIndex will return null,
        // which will delete the sheet.row[oldStartId] in this._map when call modifyRange
        if (type == TYPE.ROW)
        {
          startId = idManager.getRowIdByIndex(sheetId, start, true);
          rangeModel.setStartRowId(startId);
        }
        else
        {
          startId = idManager.getColIdByIndex(sheetId, start, true);
          rangeModel.setStartColId(startId);
        }
      }
      if (bChangeEndId)
      {
        if (type == TYPE.ROW)
        {
          if (end == start && bChangeStartId)
            endId = startId;
          else
            endId = idManager.getRowIdByIndex(sheetId, end, true);
          rangeModel.setEndRowId(endId);
        }
        else
        {
          if (end == start && bChangeStartId)
            endId = startId;
          else
            endId = idManager.getColIdByIndex(sheetId, end, true);
          rangeModel.setEndColId(endId);
        }
      }
      this.modifyRange(sheet, rangeModel, type, os, startId, oe, endId, false);
      // for style range, it should be delete from map, because it will not be undo to set the valid id
      //for other range type, should set it to invalid 
      if (start == -1 || end == -1)
      {
        RangeUsage usage = rangeModel.getUsage();
        switch (usage)
          {
          	case COMMENT:
          		doc.deleteComments(rangeModel.getId());//don't break
            case STYLE://client does not contain style range, so it can not recovered by undo delete row/column, but can recovered by undo delete sheet            
              //should not delete the following type of range, otherwise can not apply the undo event for these ranges
//            //for image, name, they can be recovered by undoRanges, rather than insert range
//            case DELETE:
//            case ANCHOR://except this, because anchor can never be removed, refer to Symphony
//            case INHERIT:
//            case COPY:
            {
              sheet.deleteRange(rangeModel);
              RangeMap<T> uMap = getRangeMapByUsage(usage, true);
              if(uMap != null)
                uMap.remove(rangeModel.getId());
              break;
            }

            default:
            {
              // the range invalid type change to bakType
              // when restoreRangeByDelta or recoverRange4Sheet, because they call range.updateAddress()
              if (rangeModel.getType() != ParsedRefType.INVALID)
              {
                rangeModel.setBakType(rangeModel.getType());
                rangeModel.setType(ParsedRefType.INVALID);
              }
              break;
            }
          }
      }
    }
  }
  
  /**
   * return the update range start/end index according to the current start/end index and will be delete sIndex/eIndex of row or column
   * this method can be inherited to change the update rules
   * @param start the original start index of range
   * @param end the original end index of range
   * @param sIndex the will be delete start index of row or col
   * @param eIndex the will be delete end index of row or col
   * @param usage the range usage
   * @return the update range start/end index of this range
   */
  protected int[] getPredeletePositon(int start, int end, int sIndex, int eIndex, RangeUsage usage)
  {
    if(sIndex <= start && eIndex >= end)
    {
      start = end = -1;
    }
    else if(start >= sIndex && start <= eIndex)
    {
      start = eIndex + 1;
    }
    else if(end >= sIndex && end <= eIndex)
    {
      end = sIndex -1;
    }
    return new int[]{start,end};
  }

  //bDeleteFromSet = true means that remove the old id from the rows or cols in sheet according to type
  public void modifyRange(RangesStruct<T> sheet, Range<T> range, TYPE type, int osId, int nsId, int oeId, int neId, boolean bDeleteFromSet)
  {
    if(sheet == null)
      return;
    HashMap<Integer, HashSet<Range>> map;
    if(type == TYPE.ROW)
      map = sheet.getRows();
    else
      map = sheet.getCols();
    if(nsId != osId)
    {
      //remove old id
      if(bDeleteFromSet && osId != IDManager.INVALID)
      {
        HashSet<Range> set = map.get(osId);
        if(set != null && osId != neId)
          set.remove(range);
      }
      //add new id
      if(nsId != IDManager.INVALID)
      {
        HashSet<Range> set = map.get(nsId);
        if(set == null)
        {
          set = new HashSet<Range>();
          map.put(nsId, set);
        }
        if(!set.contains(range))
          set.add(range);
      }
    }
    if(neId != oeId)
    {
      if(bDeleteFromSet && oeId != IDManager.INVALID)
      {
        HashSet<Range> set = map.get(oeId);
        if(set != null && oeId != nsId)
          set.remove(range);
      }
      if(neId != IDManager.INVALID)
      {
        HashSet<Range> set = map.get(neId);
        if(set == null)
        {
          set = new HashSet<Range>();
          map.put(neId, set);
        }
        if(!set.contains(range))
          set.add(range);
      }
    }
  }
  
  public static class RangeMap<T> extends HashMap<T, Range<T>>
  {
    private static final long serialVersionUID = 6115964121601452652L;

    public void put(Range<T> r)
    {
      put(r.getId(), r);
    }
  }
  
  public static class RangesStruct<T>
  {
    // map for rowId : [Range]
    private HashMap<Integer, HashSet<Range>> rows;

    // map for colId : [Range]
    private HashMap<Integer, HashSet<Range>> cols;

    // map for rangeId : [Range]
    private RangeMap<T> rangeMap;
    
    // map for rangeId: [3D Range]
    private RangeMap<T> range3DMap;

    public HashMap<Integer, HashSet<Range>> getRows()
    {
      return rows;
    }

    public HashMap<Integer, HashSet<Range>> getCols()
    {
      return cols;
    }

    public RangeMap<T> getRangeMap()
    {
      return rangeMap;
    }
    
    public RangeMap<T> get3DRangeMap()
    {
      return range3DMap;
    }

    public RangesStruct()
    {
      rows = new HashMap<Integer, HashSet<Range>>();
      cols = new HashMap<Integer, HashSet<Range>>();
      rangeMap = new RangeMap<T>();
      range3DMap = new RangeMap<T>();
    }
    
    public void addRange(Range<T> r)
    {
      rangeMap.put(r.getId(), r);
      int sr = r.getStartRowId();
      int er = r.getEndRowId();
      int sc = r.getStartColId();
      int ec = r.getEndColId();
      if(sr != IDManager.INVALID)
      {
        HashSet<Range> srSet = rows.get(sr);
        if(srSet == null)
        {
          srSet = new HashSet<Range>();
          rows.put(sr, srSet);
        }
        if(srSet.contains(r))
          LOG.log(Level.WARNING, "range is in the rangeList when addRange");
        else
          srSet.add(r);
      }
      if(er != sr && er != IDManager.INVALID)
      {
        HashSet<Range> erSet = rows.get(er);
        if(erSet == null)
        {
          erSet = new HashSet<Range>();
          rows.put(er, erSet);
        }
        if(erSet.contains(r))
          LOG.log(Level.WARNING, "range is in the rangeList when addRange");
        else
          erSet.add(r);
      }
      if(sc != IDManager.INVALID)
      {
        HashSet<Range> scSet = cols.get(sc);
        if(scSet == null)
        {
          scSet = new HashSet<Range>();
          cols.put(sc, scSet);
        }
        if(scSet.contains(r))
          LOG.log(Level.WARNING, "range is in the rangeList when addRange");
        else
          scSet.add(r);
      }
      if(ec != sc && ec != IDManager.INVALID)
      {
        HashSet<Range> ecSet = cols.get(ec);
        if(ecSet == null)
        {
          ecSet = new HashSet<Range>();
          cols.put(ec, ecSet);
        }
        if(ecSet.contains(r))
          LOG.log(Level.WARNING, "range is in the rangeList when addRange");
        else
          ecSet.add(r);
      }
      
    }
    
    public void deleteRange(Range<T> r)
    {
      rangeMap.remove(r.getId());
      
      int sr = r.getStartRowId();
      int er = r.getEndRowId();
      int sc = r.getStartColId();
      int ec = r.getEndColId();
      if(sr != IDManager.INVALID)
      {
        HashSet<Range> srSet = rows.get(sr);
        if(srSet != null)
          srSet.remove(r);
      }
      if(er != sr && er != IDManager.INVALID)
      {
        HashSet<Range> erSet = rows.get(er);
        if(erSet != null)
          erSet.remove(r);
      }
      if(sc != IDManager.INVALID)
      {
        HashSet<Range> scSet = cols.get(sc);
        if(scSet != null)
          scSet.remove(r);
      }
      if(ec != sc && ec != IDManager.INVALID)
      {
        HashSet<Range> ecSet = cols.get(ec);
        if(ecSet != null)
          ecSet.remove(r);
      }
    }
  }

  public abstract static class RangeIterator<T> implements ModelHelper.IMapEntryListener<T, Range<T>>
  {
  }

  @Override
  public void notify(Broadcaster caster, NotifyEvent e)
  {
    if (e != null)
    {
      EventSource s = e.getSource();
      switch(s.getAction())
      {
        case PREDELETE:
          preDelete(s);
          break;
        case INSERT:
          insert(s);
          break;
        case PREMOVE:
          preMove(s);
        case SORT:
          sort(s);
          break;
      }
    }
  }


  //listening for inserting row/column event
  //when insert first row/column, the range with column/row range type should change their startRow/startCol id
  // and should also attach to the corresponding row/column id list
  private void insert(EventSource s)
  {
    NotifyEvent.TYPE type = s.getRefType();
    if(type == NotifyEvent.TYPE.ROW || type == NotifyEvent.TYPE.COLUMN)
    {
      RangeInfo info = (RangeInfo)s.getRefValue();
      int sheetId = info.getSheetId();
      IDManager idManager = this.doc.getIDManager();
      RangesStruct<T> struct = getRangesStruct(sheetId, false);
      if(struct != null)
      {
        int sIndex = -1;
        int eIndex = -1;
        if(type == NotifyEvent.TYPE.ROW)
        {
          sIndex = info.getStartRow();
          eIndex = info.getEndRow();
        }else
        {
          sIndex = info.getStartCol();
          eIndex = info.getEndCol();
        }
        if(sIndex > eIndex)
        {
          int rIndex = eIndex;
          eIndex = sIndex;
          sIndex = rIndex;
        }
        this.modifyFilterRanges(sheetId, sIndex, eIndex, type, ACTION.INSERT);
        if(sIndex == 1)//insert first row/column
        {
          int maxId = IDManager.MAXID;
          HashSet<Range> rangeSet;
          ParsedRefType rangeType = ParsedRefType.ROW;
          int firstId;
          if(type == NotifyEvent.TYPE.ROW){
            rangeSet = struct.getRows().get(maxId);
            rangeType = ParsedRefType.COLUMN;
            firstId = idManager.getRowIdByIndex(sheetId, 1, true);
          }else{
            rangeSet = struct.getCols().get(maxId);
            firstId = idManager.getColIdByIndex(sheetId, 1, true);
          }
          if(rangeSet != null){
            Iterator<Range> iter = rangeSet.iterator();
            while(iter.hasNext()){
              Range r = iter.next();
              if(r.getType() == rangeType || r.getBakType() == rangeType){
                int osr, oer;
                if(type == NotifyEvent.TYPE.ROW){
                  osr = r.startRowId;
                  oer = r.endRowId;
                  r.startRowId = firstId;
                }else{
                  osr = r.startColId;
                  oer = r.endColId;
                  r.startColId = firstId;
                }
                //change the start id to the first id
                modifyRange(struct, r, type, osr, firstId, oer, oer, true);
              }
            }
          }
        }
      }
    }
  }

  private void sort(EventSource s)
  {
    RangeInfo info = (RangeInfo)s.getRefValue();
    JSONObject sortData = s.getData();
    if(sortData != null)
    {
      //modify the comments range in the sort
      RangeMap<T> commentMap = getRangeMapByUsage(RangeUsage.COMMENT, false);
      if(commentMap == null)
        return;
      JSONArray sortResults = (JSONArray)sortData.get(ConversionConstant.SORT_RESULTS);
      int size = 0;
      if(sortResults != null)
        size = sortResults.size();
      if(size <= 0)
        return;
      Iterator<T> iter = commentMap.keySet().iterator();
      while(iter.hasNext())
      {
        T id = iter.next();
        Range<T> comment = commentMap.get(id);
        RangeInfo commentInfo = comment.getRangeInfo();
        if(ModelHelper.compareRange(info, commentInfo) == RangeRelation.SUPERSET)
        {
          int offset = info.getStartRow();
          int cmtRow = commentInfo.getStartRow();
          int cmtRowWithOffset = cmtRow - offset;
          // var sheetName = rangeInfo.sheetName;
          if (size > cmtRowWithOffset)
          {
            int index = sortResults.indexOf((long)cmtRowWithOffset);
            if(index == -1)
            {
              LOG.log(Level.WARNING, "can not find the index {0} the in the sort result {1}", new Object[]{cmtRowWithOffset, sortResults});
              continue;
            }
            int cmtNewRow = index + offset;

            if (cmtNewRow == cmtRow)
              continue;
            ParsedRef ref = comment.getParsedRef();
            if (ref == null)
            {
              LOG.log(Level.WARNING, "the comment range {0} address is invalid when sort", id);
              continue;
            }
            ref.startRow = String.valueOf(cmtNewRow);
            ref.endRow = ref.startRow;
            updateRangeByUsage(ref, comment, RangeUsage.COMMENT);
          }
        }
      }
    }
  }
  /**
   * Used for recover manager from the rangeList in main document to backup all the ranges in sheet which has sheetId as key
   * @param sheetId the will be deleted sheet id
   * @param rangeList   the range list of the main document
   * @return true if there are ranges need to backup
   */
  public void backup(int sheetId, RangeList<T> rangeList)
  {
    RangesStruct<T> struct = rangeList.map.get(sheetId);
    
    //only back up range list when main document has ranges in sheetId
    if(struct != null)
    {
      if(map.get(sheetId) != null)
      {
        LOG.log(Level.WARNING, "the map for sheet {0} should not exist in range list of recover manager", new ModelHelper.SerializableStringIdConvertor().toStringId(sheetId));
        return;
      }
      if(this.doc == rangeList.doc)
      {
        LOG.log(Level.WARNING, "when backup range list, doc of recover manager is the same with the main document");
        return;
      }
      map.put(sheetId, struct);
      //update usage map because when serialize range, it iterate the usage map
      RangeMap<T> ranges = struct.getRangeMap();
      Iterator<T> iter = ranges.keySet().iterator();
     
      RangesStruct<T>  bacStruct = map.get(sheetId);
      RangeMap<T> bacRanges = bacStruct.getRangeMap();
      while(iter.hasNext())
      {
        T id = iter.next();
        Range<T> r = (Range<T>)ranges.get(id);
//        r.parent = doc;
        RangeUsage usage = r.getUsage();
        if (usage != RangeUsage.NORMAL)
        {
          if(usage == RangeUsage.NAMES)
          {
        	  Range<T> cr = new Range<T>(r);
        	  bacRanges.put(id, cr);
        	  r = cr;
          }
          RangeMap<T> uMap = getRangeMapByUsage(usage, true);
          if(uMap != null)
            uMap.put(r);
        }
      }	  
    }
  }
  
  /**
   * Used to recover the rangeList of specify sheet from recover manager to main document
   * @param sheetId the will be recovered sheet id
   * @param recoverRangeList the range list of recover document
   */
  public void recoverRanges4Sheet(int sheetId, RangeList<T> recoverRangeList)
  {
    Map<Integer, RangesStruct<T>> sheets = recoverRangeList.getBySheetIdRangeMap();
    RangesStruct<T> struct = sheets.get(sheetId);
    if(struct == null)
      return;
    map.put(sheetId, struct);
    recoverRangeList.map.remove(sheetId);
    RangeMap<T> ranges = struct.getRangeMap();
    Iterator<T> rangeIter = ranges.keySet().iterator();
    while(rangeIter.hasNext())
    {
      T id = rangeIter.next();
      Range<T> range = ranges.get(id);
      range.parent = doc;
      RangeUsage usage = range.getUsage();
      RangeMap<T> uMap = null;
      // for name range which not only exist in recoverRangeList but also exist in main doc
      // so should udpate name range in main doc according to range address info in recover doc
      // and remove this name range from recover doc
      if(usage == RangeUsage.NAMES)
      {
        //get the name range in main doc
        Range<T> nameRange = getRangeByUsage(id, RangeUsage.NAMES);//here the id must be the upper case of range name
        RangeMap<T> nameMap = this.getRangeMapByUsage(RangeUsage.NAMES, true);
        if(nameRange == null)//name range has been deleted.
        {
        	struct.deleteRange(range);
        	nameMap.remove(id);
        }
        else
        	nameMap.put(id, range);
        
        uMap = recoverRangeList.getRangeMapByUsage(RangeUsage.NAMES, false);
        if(uMap != null)
          uMap.remove(id);
        continue;
      }
      // recover sheet name after set parent, because the sheet content has already been recovered
      range.recoverSheetName(); 
     
      if (usage != RangeUsage.NORMAL)
      {
        uMap = getRangeMapByUsage(usage, true);
        if(uMap != null)
          uMap.put(range);
        if(usage == RangeUsage.COMMENT)
        	deleteRange(range, rangeIter);
        //remove from usage map
        uMap = recoverRangeList.getRangeMapByUsage(usage, false);
        if(uMap != null)
          uMap.remove(id);
      }
    }
  }
  
  public void setParent(final Document parentDoc)
  {
    Map<Integer, RangesStruct<T>> pMap = this.getBySheetIdRangeMap();
    ModelHelper.iterateMap(pMap, new ModelHelper.IMapEntryListener<Integer, RangesStruct<T>>()
    {
      public boolean onEntry(Integer sheetId, RangesStruct<T> struct)
      {
        RangeMap<T> rangeMap = struct.getRangeMap();
        Iterator<T> iter = rangeMap.keySet().iterator();
        while(iter.hasNext())
        {
          T id = iter.next();
          Range<T> range = rangeMap.get(id);
          range.parent = parentDoc;
        }
        return false;
      }
    });
    
  }
  
}