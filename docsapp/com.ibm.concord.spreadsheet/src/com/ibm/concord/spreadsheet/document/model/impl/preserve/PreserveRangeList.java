package com.ibm.concord.spreadsheet.document.model.impl.preserve;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Range;
import com.ibm.concord.spreadsheet.document.model.impl.RangeList;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;

public class PreserveRangeList extends RangeList<String>
{
  private static final Logger LOG = Logger.getLogger(RangeList.class.getName());
  
  private Map<String, List<Range<String>>> preserveRangesById;

  private String contextPreserveId;

  private List<Range<String>> contextPreserveRanges;

  public PreserveRangeList(Document doc)
  {
    super(doc);

    contextPreserveId = null;
  }

  public Map<String, List<Range<String>>> getPreserveRangesById()
  {
    if (preserveRangesById == null)
    {
      preserveRangesById = new HashMap<String, List<Range<String>>>();
    }

    return preserveRangesById;
  }

  
  @Override
  public Range addRange(Range<String> r)
  {
    Range<String> range = super.addRange(r);
    addRange(range, false);
    return range;
  }
  /**
   * Store preserve ranges nX-Y's as X: [Y1, Y2], to deserialize them.  
   */
  private void addRange(Range<String> range, boolean bRecover)
  {
    Map<String, List<Range<String>>> ranges = getPreserveRangesById();

    String id = range.getId();
    // get preserve range id X part (nX-Y)
    String mainId = id.substring(0, id.lastIndexOf("-"));
//    int x = id | 0xF;
    if (contextPreserveId == null || !contextPreserveId.equals(mainId))
    {
      // context changed
      contextPreserveId = mainId;
      contextPreserveRanges = ranges.get(contextPreserveId);
      if (contextPreserveRanges == null)
      {
        contextPreserveRanges = new ArrayList<Range<String>>();
        ranges.put(contextPreserveId, contextPreserveRanges);
      }
    }
    if(bRecover)
    {
      //should check if there is range with id already exist in ranges
      //THIS WILL HAPPEN WHEN DELETE SHEET THAT THE RANGES HAVE NOT BEEN DELETED SUCH AS FORMULA USAGE TYPE
      for(int i = 0; i < contextPreserveRanges.size(); i++)
      {
        Range<String> r = contextPreserveRanges.get(i);
        if(id.equals(r.getId()))
        {
          contextPreserveRanges.remove(i);
          contextPreserveRanges.add(range);
          break;
        }
      }
    }else
      contextPreserveRanges.add(range);
  }
  
  public void deleteRange(Range<String> r)
  {
    if (r != null)
    {
      super.deleteRange(r);
      Map<String, List<Range<String>>> ranges = getPreserveRangesById();

      String id = r.getId();
      // get preserve range id X part (nX-Y)
//      int x = id | 0xF;
      String mainId = id.substring(0, id.lastIndexOf("-"));
      List<Range<String>> rs = ranges.get(mainId);
      if (rs != null)
        rs.remove(r);
    }

  }
  
  //the index are 1-based
  protected int[] getPredeletePositon(int start, int end, int sIndex, int eIndex, RangeUsage usage)
  {
    if (usage == RangeUsage.ANCHOR)// must be one cell
    {
      if ((sIndex <= start) && (eIndex >= start))
      {
//        if (!(start == 1 && sIndex == 1))
        {
          start = (sIndex > 1) ? (sIndex - 1) : (eIndex + 1);
          end = start;
        }
      }
      return new int[]{start,end};
    }
    else
      return super.getPredeletePositon(start, end, sIndex, eIndex, usage);
  }
  
  /**
   * Used for recover manager from the preserveRangeList in main document to backup all the preserve ranges in sheet which has sheetId as key
   * @param sheetId the will be deleted sheet id
   * @param rangeList   the preserve range list of the main document
   * @return true if there are ranges need to backup
   */
  public void backup(int sheetId, PreserveRangeList rangeList)
  {
    RangesStruct<String> struct = rangeList.getBySheetIdRangeMap().get(sheetId);
    
    //only back up range list when main document has ranges in sheetId
    if(struct != null)
    {
      if(map.get(sheetId) != null)
      {
        LOG.log(Level.WARNING, "the map for sheet {0} should not exist in range list of recover manager", new ModelHelper.SerializableStringIdConvertor().toStringId(sheetId));
        return;
      }
      if(this.doc == rangeList.getParent())
      {
        LOG.log(Level.WARNING, "when backup range list, doc of recover manager is the same with the main document");
        return;
      }
      //update usage map because when serialize range, it iterate the usage map
      RangeMap<String> ranges = struct.getRangeMap();
      Iterator<String> iter = ranges.keySet().iterator();
      while(iter.hasNext())
      {
        String id = iter.next();
        Range<String> r = (Range<String>)ranges.get(id);
        addRange(r);//still need insert to preserveRangesById
//        r.parent = doc;
      }
    }
  }
  
  /**
   * Used to recover the rangeList of specify sheet from recover manager to main document
   * @param sheetId the will be recovered sheet id
   * @param recoverRangeList the range list of recover document
   */
  public void recoverRanges4Sheet(int sheetId, PreserveRangeList recoverRangeList)
  {
    Map<Integer, RangesStruct<String>> sheets = recoverRangeList.getBySheetIdRangeMap();
    RangesStruct<String> struct = sheets.get(sheetId);
    if(struct == null)
      return;
//    map.put(sheetId, struct);
    recoverRangeList.getBySheetIdRangeMap().remove(sheetId);
    RangeMap<String> ranges = struct.getRangeMap();
    Iterator<String> rangeIter = ranges.keySet().iterator();
    while(rangeIter.hasNext())
    {
      String id = rangeIter.next();
      Range<String> range = ranges.get(id);
      range.setParent(doc);
      // recover sheet name after set parent, because the sheet content has already been recovered
      range.recoverSheetName();
      //here should not call this.addRange directly, because the range might already exist in getPreserveRangesById
      Range<String> r = super.addRange(range);
      addRange(r, true);
      RangeUsage usage = range.getUsage();
      if (usage != RangeUsage.NORMAL)
      {
//        RangeMap<Integer> uMap = getRangeMapByUsage(usage, true);
//        if(uMap != null)
//          uMap.put(range);
        //remove from usage map
        RangeMap<String> uMap = recoverRangeList.getRangeMapByUsage(usage, false);
        if(uMap != null)
          uMap.remove(id);
      }
      
      //remove from preserveRangesById of recover range list
      Map<String, List<Range<String>>> rangesById = recoverRangeList.getPreserveRangesById();
      // get preserve range id X part (nX-Y)
      String mainId = id.substring(0, id.lastIndexOf("-"));
//      int x = id | 0xF;
      List<Range<String>> preserveRanges = rangesById.get(mainId);
      if (preserveRanges != null)
        preserveRanges.remove(range);
    }
  }
}
