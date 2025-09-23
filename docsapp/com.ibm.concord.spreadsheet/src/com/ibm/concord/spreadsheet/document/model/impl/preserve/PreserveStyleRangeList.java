package com.ibm.concord.spreadsheet.document.model.impl.preserve;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.Broadcaster;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.EventSource;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.IDManager;
import com.ibm.concord.spreadsheet.document.model.impl.Range;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.impl.RangeList;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;

public class PreserveStyleRangeList extends RangeList<Integer>
{
  private static final Logger LOG = Logger.getLogger(PreserveStyleRangeList.class.getName());
  private int MaxCount = 0;
  
  // for range id ,the prefix is "ra", here is the number type for "ra"
  private static int idNubmerType =  ModelHelper.toNumberIdType(ConversionConstant.RANGE_PREFIX);
  
  /**
   * Record preserve "style": { "(sheetId)": { "(rangeId)": ... objects
   */
  public PreserveStyleRangeList(Document doc)
  {
    super(doc);
  }
  
  public int generateId()
  {
    return this.MaxCount++;
  }
  
  public Range addRange(Range r)
  {
    Integer rId = (Integer)r.getId();
    if(null == rId)
    {
      int numberId = ++this.MaxCount;
      rId = ModelHelper.typedId(this.idNubmerType, numberId);
      r.setId(rId);
    }
    else
    {
      int numberId = ModelHelper.stripIdType(rId);
      if(numberId > this.MaxCount)
        this.MaxCount = numberId;
    }
    r.setUsage(RangeUsage.STYLE);
    return super.addRange(r);
  }
  
  public void addRange(ParsedRef parsedRef)
  {
    ParsedRef integrityRef = ModelHelper.getIntegrityParsedRef(parsedRef);
    Range r = new Range(this.doc, integrityRef,null,false);
    this.addRange(r);
  }
  
  public void deleteRange(ParsedRef parsedRef)
  {
    ParsedRef integrityRef = ModelHelper.getIntegrityParsedRef(parsedRef);
    Range r = new Range(this.doc, integrityRef,null,false);
    r.setUsage(RangeUsage.STYLE);
    
    RangesStruct rangeStruct = getRangesStruct(r.getSheetId(),false);
    if(null == rangeStruct)
      return;
    
    int srId = r.getStartRowId();
    int erId = r.getEndRowId();
    int scId = r.getStartColId();
    int ecId = r.getEndColId();
    
    RangeMap rangeMap = rangeStruct.getRangeMap();
    HashMap rows = rangeStruct.getRows();
    HashMap cols = rangeStruct.getCols();
    
    HashSet<Range> srRangeSet = null;
    HashSet<Range> erRangeSet = null;
    HashSet<Range> scRangeSet = null;
    HashSet<Range> ecRangeSet = null;
    HashSet<Range> finalRangeSet = null;
    if(null != rows)
    {
      if(srId != IDManager.INVALID)
        srRangeSet = (HashSet<Range>)rows.get(srId);
      if(erId != IDManager.INVALID)
        erRangeSet = (HashSet<Range>)rows.get(erId);
    }
    if(null != cols)
    {
      if(scId != IDManager.INVALID)
        scRangeSet = (HashSet<Range>)cols.get(scId);
      if(ecId != IDManager.INVALID)
        ecRangeSet = (HashSet<Range>)cols.get(ecId);
    }
    switch(r.getType())
    {
//      case CELL:
      case RANGE:
        HashSet<Range> trSet = (null == erRangeSet || erId == srId) ? srRangeSet : (HashSet<Range>) ModelHelper.getIntersection(srRangeSet,erRangeSet);
        HashSet<Range> tcSet = (null == ecRangeSet || ecId == scId) ? scRangeSet : (HashSet<Range>) ModelHelper.getIntersection(scRangeSet,ecRangeSet);
        finalRangeSet = (HashSet<Range>) ModelHelper.getIntersection(trSet,tcSet);
        break;
      case ROW:
        finalRangeSet = ( null == erRangeSet || erId == srId) ? srRangeSet : (HashSet<Range>) ModelHelper.getIntersection(srRangeSet,erRangeSet);
        break;
      case COLUMN:
        finalRangeSet = (null == ecRangeSet || ecId == scId) ? scRangeSet : (HashSet<Range>) ModelHelper.getIntersection(scRangeSet,ecRangeSet);
        break;
    }
    //TODO: log
    if(null == finalRangeSet)
    { 
      LOG.log(Level.WARNING, "undo an no-existed default style range!!!");
      return;
    }
    
    Iterator<Range> iter = finalRangeSet.iterator();
    while(iter.hasNext())
    {
      Range range = iter.next();
      if(range.equals(r))
      {
        this.deleteRange(range);
        break;
      }  
    }  
  }
  
  /**
   * PreserveStyleRangeList does not contain usageMap, because all ranges are STYLE
   */
  public Map<RangeUsage, RangeMap<Integer>> getByUsageRangeMap()
  {
    return null;
  }
  
  private HashSet<Range> getPossibleEffectRanges(NotifyEvent.TYPE type, int sheetId,int sIndex)
  {
    HashSet<Range> result = new HashSet<Range>();
    RangesStruct struct = getRangesStruct(sheetId, false);
    if(null == struct)
      return result;
    
    IDManager idManager = this.doc.getIDManager();
    
    HashMap<Integer, HashSet<Range>> map = (type == NotifyEvent.TYPE.ROW) ? struct.getRows() : struct.getCols();
    List<Integer> idList =  (type == NotifyEvent.TYPE.ROW) ? idManager.getRowIdList(sheetId) : idManager.getColumnIdList(sheetId);
    int size = idList.size();
    int start = 1, end = size;
    if( sIndex > size/2)
      start = sIndex;
    else
      end = sIndex -1;
    for(int i = start; i <= end; i++)
    {
      Integer id = idList.get(i-1);
      if(id != null)
      {
        HashSet<Range> set = map.get(id);
        if(null != set)
        {
          Iterator<Range> iter = set.iterator();
          while(iter.hasNext())
          {
            Range range = iter.next();
            if(result.contains(range))
              result.remove(range);
            else
              result.add(range);
          }  
        }  
      }  
    }  
    return result;
  }
  
  //when insert row or column, the range should be split into two half
  public void preInsert(EventSource s)
  {
    NotifyEvent.TYPE type = s.getRefType();
    if(type != NotifyEvent.TYPE.ROW && type != NotifyEvent.TYPE.COLUMN)
      return;
    IDManager idManager = this.doc.getIDManager();
    RangeInfo info = (RangeInfo)s.getRefValue();
    int sheetId = info.getSheetId();
    
    RangesStruct struct = getRangesStruct(sheetId, false);
    if(null == struct)
      return;
    
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
    String sheetName = ((Sheet)idManager.getSheetIdMap().get(sheetId)).getSheetName();
    
    HashSet<Range> ranges = this.getPossibleEffectRanges(type, sheetId, sIndex);
    if(null == ranges) return;
    Iterator<Range> iter = ranges.iterator();    
    ArrayList<Range> newRanges = new ArrayList<Range>(); 
    while(iter.hasNext())
    {
      Range range = iter.next();
      RangeInfo rInfo = range.getRangeInfo();
      ParsedRefType rType = range.getType();
      ParsedRef ref = null;
      if(type == NotifyEvent.TYPE.ROW)
      {
        //TODO: when range change to does not have row range type , change it to row
        if(rType == ParsedRefType.RANGE || rType == ParsedRefType.ROW)
        {
          int srIndex = rInfo.getStartRow();
          int erIndex = rInfo.getEndRow();
          if(sIndex > srIndex && sIndex <= erIndex)
          {
            // modify the original range to the split prior half
            int oriERId = range.getEndRowId();
            int newERId = idManager.getRowIdByIndex(sheetId, sIndex-1, true);
            range.setEndRowId(newERId);
            int oriSRId = range.getStartRowId();
            this.modifyRange(struct, range, type, oriSRId, oriSRId, oriERId, newERId, true);
            // add the split latter half range
            String strSRIndex = Integer.toString(sIndex);
            String strERIndex = Integer.toString(erIndex);//(rType == RangeType.RANGE) ? Integer.toString(erIndex) : ( ( erIndex == sIndex)? null: Integer.toString(erIndex) );
            String strSCIndex = (rType == ParsedRefType.RANGE) ? ReferenceParser.translateCol(rInfo.getStartCol()) : null;
            String strECIndex = (rType == ParsedRefType.RANGE) ? ReferenceParser.translateCol(rInfo.getEndCol()) : null;
            ParsedRefType t = rType == ParsedRefType.RANGE ? ParsedRefType.RANGE: ParsedRefType.ROW;
            ref = new ParsedRef( sheetName,strSRIndex,strSCIndex,sheetName, strERIndex, strECIndex, t, ReferenceParser.ABSOLUTE_NONE);
          }  
        }  
      }
      else
      {
        //TODO: when range change to does not have col range type , change it to col
        if(rType == ParsedRefType.RANGE || rType == ParsedRefType.COLUMN)
        {
          int scIndex = rInfo.getStartCol();
          int ecIndex = rInfo.getEndCol();
          if(sIndex > scIndex && sIndex <= ecIndex)
          {
            // modify the original range to the split prior half
            int oriECId = range.getEndColId();
            int newECId = idManager.getColIdByIndex(sheetId, sIndex-1, true);
            range.setEndColId(newECId);
            int oriSCId = range.getStartColId();
            this.modifyRange(struct, range, type, oriSCId, oriSCId, oriECId, newECId, true);
            // add the split latter half range
            String strSRIndex = (rType == ParsedRefType.RANGE) ? Integer.toString(rInfo.getStartRow()) : null;
            String strERIndex = (rType == ParsedRefType.RANGE) ? Integer.toString(rInfo.getEndRow()) : null;
            String strSCIndex = ReferenceParser.translateCol(sIndex);
            String strECIndex = ReferenceParser.translateCol(ecIndex);
            ParsedRefType t = rType == ParsedRefType.RANGE ? ParsedRefType.RANGE: ParsedRefType.COLUMN;
            ref = new ParsedRef( sheetName,strSRIndex,strSCIndex,sheetName, strERIndex, strECIndex, t, ReferenceParser.ABSOLUTE_NONE);
          } 
        }  
      } 
      if(null != ref)
      {
        Range newRange = new Range(this.doc,ref,null,false);
        newRanges.add(newRange);
      }  
    }  
    int size = newRanges.size();
    for(int i = 0; i < size; i++)
    {
      this.addRange(newRanges.get(i));
    }  
  }
  
  @Override
  public void notify(Broadcaster caster, NotifyEvent e)
  {
    if (e != null)
    {
      EventSource s = e.getSource();
      if (s.getAction() == NotifyEvent.ACTION.PREDELETE)
        preDelete(s);
      else if (s.getAction() == NotifyEvent.ACTION.PREINSERT)
        preInsert(s);

    }
  }
}
