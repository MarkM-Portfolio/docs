package com.ibm.concord.spreadsheet.document.model.formula;

import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.AreaRelation;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;

public class Reference extends Area
{
  private static String idPrefix = "rf";
  private static int count = 0;
  
  public Reference(RangeInfo info, Document doc)
  {
    this(info, RangeUsage.REFERENCE, doc, true);
  }
  
  Reference(RangeInfo info, RangeUsage usage, Document doc, boolean bGenerateId)
  {
    super(info, null, usage, doc);
    if(bGenerateId)
      generateId();
  }
  private String generateId() {
    String id = idPrefix + count++;
    this.setId(id);
    return id;
  }
  
  public AreaRelation compare(RangeInfo range) {
    AreaRelation relation = super.compare(range);
    if (relation == AreaRelation.EQUAL) {
        //make sure that A1:A1048576 is not equal to A:A
        ReferenceParser.ParsedRefType type = range.getType();
        if(this.getRange().getType() == type || type == ReferenceParser.ParsedRefType.CELL) {// cell compare to range is equal
            return AreaRelation.EQUAL;
        } else if(this.getRange().getType().getValue() > type.getValue()) {
            return AreaRelation.GREATER;
        } else {
            return AreaRelation.LESS;
        }
    }
    return relation;
  }

}
