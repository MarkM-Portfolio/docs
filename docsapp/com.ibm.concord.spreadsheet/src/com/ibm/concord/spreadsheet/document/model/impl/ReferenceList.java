package com.ibm.concord.spreadsheet.document.model.impl;

/**
 * Store all the formula references and name ranges
 */
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.TYPE;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;

public class ReferenceList extends RangeList<Integer>
{
  private static final Logger LOG = Logger.getLogger(ReferenceList.class.getName());
  
  private int maxRefCount = 0;
  
  public ReferenceList(Document doc)
  {
    super(doc);
  }

  /**
   * add reference into referencelist only when there is no such reference
   * otherwise just add ref count for it
   * precondition: the given reference must contain rangeId
   */
  public Reference addRange(Range<Integer> ref)
  {
    if(ref == null)
      return null;
    if(ref.getId() == IDManager.INVALID)
    {
      LOG.log(Level.WARNING, "the given ref must has range id when addRange");
      return null;
    }
    Reference r = null;
    RangesStruct sheet = this.getRangesStruct(ref.getSheetId(), false);
    if(sheet != null)
    {
      r = (Reference)sheet.getRangeMap().get(ref.getId());
    }
    
    if(r == null)
      r = (Reference)super.addRange(ref);
    
    r.addCount();
    
    return r;
    
  }
  
  public void deleteRange(Range<Integer> ref)
  {
    this.deleteRange((Reference)ref, false);
  }
  
  /**
   * delete reference ref count from reference list
   * if ref count is less than 1, remove from reference list
   * except name range
   * @param ref will be deleted reference
   * @param bDeleteUsage  delete reference no matter the refcount
   */
  public void deleteRange(Reference ref, boolean bDeleteUsage)
  {
    if(ref != null)
    {
      ref.deleteCount();
      
      if((ref.getCount() <= 0 && (ref.getUsage() != RangeUsage.NAMES) ||  bDeleteUsage))
      {
        super.deleteRange(ref);
      }
    }
  }

  /**
   * return the reference with the given ref address and ref type
   * this method will not add reference into reference lsit
   * @param ref
   * @param sheetName
   * @param type
   * @param bCreateRefId
   * @return
   */
  public Reference getRefByAddress(ParsedRef ref, String sheetName, int type, boolean bCreateRefId)
  {
    Reference reference = find(ref, sheetName, type);
    if(reference != null)
    {
      if (bCreateRefId && (reference.id == IDManager.INVALID))
      {
        reference.setId(generateId());
        //if it does not contain id, it means it is a new reference,
        //and it want the id, it called by generateToken without push to cell's tokenList
        //TODO: more test
        super.addRange(reference);
      }
    }
    return reference;
  }

  private Reference find(ParsedRef ref, String sheetName, int type)
  {
    Reference reference = new Reference(doc, ref, sheetName, true);
    reference.setRefType(type, false);
    RangesStruct sheet = this.getRangesStruct(reference.sheetId, false);
    if(sheet != null)
    {
      //check if there are the same reference in the list
      Set<Reference> set;
      if(reference.startRowId != IDManager.INVALID && ref.type != ParsedRefType.COLUMN)
        set = (Set<Reference>)sheet.getRows().get(reference.startRowId);
      else
        set = (Set<Reference>)sheet.getCols().get(reference.startColId);
      if (set != null)
      {
        Iterator<Reference> iter = set.iterator();
        while(iter.hasNext())
        {
          Reference r = iter.next();
          if(r.equals(reference))
          {
            //TODO: when calculate enabled
            return r;
          }
        }
      }
    }
    return reference;
  }

  public int generateId()
  {
    return maxRefCount++;
  }

  //override
  protected void modifyRangesDataByUsage(int sheetId, int sIndex, int eIndex, TYPE type)
  {
    // NOTHING todo.. for reference list predelete, 
  }
  
  // TODO: recoversheetrefs?
  
  /**
   * Used for recover manager from the reference list in main document to backup all the reference and name range in sheet which has sheetId as key
   * @param sheetId the will be deleted sheet id
   * @param refList   the reference list of the main document
   */
  public void backup(int sheetId, RangeList<Integer> refList)
  {
    RangesStruct<Integer> struct = refList.map.get(sheetId);
    //only back up range list when main document has ranges in sheetId
    if(struct != null)
    {
      if(map.get(sheetId) != null)
      {
        LOG.log(Level.WARNING, "the map for sheet {0} should not exist in range list of recover manager", new ModelHelper.SerializableStringIdConvertor().toStringId(sheetId));
        return;
      }
      if(this.doc == refList.doc)
      {
        LOG.log(Level.WARNING, "when backup range list, doc of recover manager is the same with the main document");
        return;
      }
      map.put(sheetId, struct);
      //update usage map and nameRangeMap, because when serialize name range, it iterate the name range map
      RangeMap<Integer> ranges = struct.getRangeMap();
      Iterator<Integer> iter = ranges.keySet().iterator();
      while(iter.hasNext())
      {
        int id = iter.next();
        Reference r = (Reference)ranges.get(id);
        // should set parent document when serialize the recover document
        // when call range.getAddress(), the address should be #REF!,
        // but if set name range parent to recover doc, the address will not be #REF!
//        r.parent = doc;
      }
    }
  }
  
  /**
   * ReferenceList does not contain usageMap
   */
  public Map<RangeUsage, RangeMap<Integer>> getByUsageRangeMap()
  {
    return null;
  }
  /**
   * Used to recover all the reference and name range of specify sheet from recover manager to main document
   * @param sheetId the will be recovered sheet id
   * @param recoverRefList the reference list of recover document
   */
  public void recoverRanges4Sheet(int sheetId, ReferenceList recoverRefList)
  {
    Map<Integer, RangesStruct<Integer>> sheets = recoverRefList.getBySheetIdRangeMap();
    RangesStruct<Integer> struct = sheets.get(sheetId);
    if(struct == null)
      return;
    map.put(sheetId, struct);
    recoverRefList.map.remove(sheetId);
    RangeMap<Integer> ranges = struct.getRangeMap();
    Iterator<Integer> rangeIter = ranges.keySet().iterator();
    while(rangeIter.hasNext())
    {
      int id = rangeIter.next();
      Reference ref = (Reference)ranges.get(id);
      ref.parent = doc;
      RangeUsage usage = ref.getUsage();
      if(usage == RangeUsage.NAMES)
      {
        ParsedRef parsedRef = ref.getParsedRef();
        this.updateRangeByUsage(parsedRef, ref, usage);
      }else
        ref.recoverSheetName(); 
      
    }
  }
}
