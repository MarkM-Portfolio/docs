package com.ibm.concord.spreadsheet.document.model.impl.io.handlers;

import java.util.Map;
import java.util.Set;

import com.ibm.concord.spreadsheet.document.model.impl.preserve.PreserveValueCellSet;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;

/**
 * For preserve.js, <em>"value": { "(sheetId)": "(rowId)": { ...</em>
 */
public class PreserveValueHandler extends AbstractFieldHandler<Map<Integer, Integer>>
{
  private  Map<Integer, Integer> set;
  
  public void setContext( Map<Integer, Integer> o)
  {
    set = o;
  }

  //the old version format for preserve value change set
  //"os1":{"or1":{"oc1":true}}}
  //now change to "os1":{"or1":{"oc1":1}}}//the value should be integer, because it need express other meanings
  //not only the value change, but also if the cell is a formula cell and contains the whole row or column reference
  @Override
  public void onValue(String field, boolean value)
  {
    // field is columnId
    int id = ModelHelper.toNumberId(field);
    if (value)
    {
      set.put(id, PreserveValueCellSet.VALUE_CHANGE);
    }
  }
  
  @Override
  public void onValue(String field, int value)
  {
    // field is columnId
    int id = ModelHelper.toNumberId(field);
    set.put(id, value);
  }
}
