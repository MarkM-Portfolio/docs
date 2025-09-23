package com.ibm.concord.spreadsheet.document.model.formula;

import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.Broadcaster;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;

public class NameArea extends Reference
{
  private int refMask;
  
  public NameArea(RangeInfo info, String id, Document doc)
  {
    super(info, RangeUsage.NAMES, doc, false);
    setId(id);
  }
  
  public void setRefMask(int mask)
  {
    refMask = mask;
  }
  
  public int getRefMask()
  {
    return refMask;
  }

}

/**
 * UndefinedNameArea is an area with no range info because it is just used for undefined name range 
 * and notify the listeners when event happens
 */
class UndefinedNameArea extends Broadcaster
{
  private String id;
  private RangeUsage usage;
  public UndefinedNameArea(String name){
    id = name;
    usage = RangeUsage.UNDEFINE_NAMES;
  }
  
  public String getId()
  {
    return id;
  }
  
  public RangeUsage getUsage()
  {
    return usage;
  }
}
