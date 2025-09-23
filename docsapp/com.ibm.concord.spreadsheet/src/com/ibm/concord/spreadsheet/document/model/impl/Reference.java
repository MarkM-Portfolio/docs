package com.ibm.concord.spreadsheet.document.model.impl;

/**
 * The Reference represent a cell or a range refered by formula cell
 */
import java.util.ArrayList;
import java.util.List;

import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;

public class Reference extends Range<Integer>
{
  private int refCount = 0;

  private int refType = REFTYPE_DEFAULT;
  
  //only available when it is name range
  //need generate the int id for name range
  private String strId = null;
  
  private List<FormulaCell> referredCells;
  /**
   * reference type for formula when data changes
   */
  public static int REFTYPE_DEFAULT = 0;//update reference for any data changes event
  public static int REFTYPE_IGNORESET = 1;//update reference except for set cell event
  public static int REFTYPE_CARESHOWHIDE = 2;//update reference when show/hide row/column
  public static int REFTYPE_CAREFILTER = 4;//update reference for filter impact
  
  /**
   * construct a reference with specified id and usage
   * 
   * @param p
   *          document instance
   * @param id
   *          reference id
   */
  public Reference(Document p, int id)
  {
    super(p, id);
    init();
  }

  private void init()
  {
    refCount = 0;
    this.setUsage(RangeUsage.REFERENCE);
    referredCells = new ArrayList<FormulaCell>();
  }

  public Reference(Document p, ParsedRef ref, String sheetName, boolean bEnableMaxRow)
  {
    super(p, ref, sheetName, bEnableMaxRow);
    id = IDManager.INVALID;
    init();
  }

  public Reference(Document p, String refValue, String sheetName, boolean bEnableMaxRow)
  {
    this(p, ReferenceParser.parse(refValue), sheetName, bEnableMaxRow);
  }

  public Reference(Document p, int rangeId, int sheetId, int endSheetId, int startRowId, int endRowId, int startColId, int endColId, boolean bEnableMaxRow)
  {
    super(p, rangeId, sheetId, startRowId, endSheetId, endRowId, startColId, endColId, bEnableMaxRow);
    id = IDManager.INVALID;
    init();
  }

  public boolean equals(Reference ref)
  {
    boolean bEqual = super.equals(ref);
    if(bEqual)
    {
      return (this.refType == ref.refType
//          && (this.patternRef != null && ref.patternRef != null 
//              && ((this.patternRef.sheetName == null && ref.patternRef.sheetName == null)
//                  || (this.patternRef.sheetName != null && ref.patternRef.sheetName != null))
//              && this.patternRef.absoluteAddressType == ref.patternRef.absoluteAddressType));
          && this.patternMask == ref.patternMask);
    }
    
    return false;
  }
  
  /************** Reference Management ***********************/
  public int getCount()
  {
    return refCount;
  }

  public void addCount()
  {
    this.refCount++;
  }

  public void deleteCount()
  {
    refCount--;
    if (refCount < 0)
      refCount = 0;
  }

  //only used for name range
  public void setStringId(String rangeIdStr)
  {
    this.strId = rangeIdStr;
  }
  
  public String getStringId()
  {
    return this.strId;
  }

  /**
   * ref type might be serveral mixed type
   * 
   * @param type REFTYPE_DEFAULT | REFTYPE_IGNORESET | REFTYPE_CARESHOWHIDE | REFTYPE_CAREFILTER
   * @param bAppend true to mix given type to ref type,
   *                otherwise override with the given type
   */
  public void setRefType(int type, boolean bAppend)
  {
    if(bAppend)
      this.refType |= type;
    else
      this.refType = type;
  }

  public void addReferredCell(FormulaCell cell)
  {
    referredCells.add(cell);
  }
  
  /**
   * delete the reffered cell from referredCells list of reference
   * @param cell
   * @return true if the cell is in referredCells list
   */
  public boolean deleteReferredCell(FormulaCell cell)
  {
    return referredCells.remove(cell);
  }
  
  public List<FormulaCell> getReferredCell()
  {
    return referredCells;
  }
}
