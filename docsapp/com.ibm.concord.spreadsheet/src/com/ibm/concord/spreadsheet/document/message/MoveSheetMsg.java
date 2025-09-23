/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.document.message;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.message.Message;
import com.ibm.json.java.JSONObject;

public class MoveSheetMsg extends Message
{
  private String refValue = null; // keep original refValue
  private int delta = -1;
  
  // refValue: "sheetName|sheetIndex"
  // {"data": {"delta", delta}}
  
  public MoveSheetMsg (JSONObject jsonEvent, IDManager idm) {
    super (jsonEvent, idm);
    
    JSONObject reference = (JSONObject) jsonEvent.get(ConversionConstant.REFERENCE);
    refValue = (String) reference.get(ConversionConstant.REF_VALUE);
    JSONObject o = (JSONObject) jsonEvent.get(ConversionConstant.DATA);
    delta = Integer.parseInt(o.get("delta").toString());
  }
 
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spreadsheet.document.message.Message#getRefValue()
   */
  public String getRefValue ()
  {
    String value = null;
    JSONObject reference = (JSONObject) data.get(ConversionConstant.REFERENCE);
    value = (String) reference.get(ConversionConstant.REF_VALUE);
    int idx = value.indexOf("|");
    if (idx != -1)
      value = value.substring(0, idx);
    
    return value;   
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spreadsheet.document.message.Message#setRefValue(com.ibm.concord.spreadsheet.document.message.IDManager)
   */
  public String setRefValue (IDManager idm)
  {
    String sheetId = refTokenId.getSheetId();
    if (sheetId == null) return refValue;
    
    int index = idm.getSheetIndexById(sheetId) + 1; // sheetindex is 1-based in client
    String name = idm.getSheetNameById(sheetId);
    
    return name + "|" + index;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spreadsheet.document.message.Message#transformDataById(com.ibm.concord.spreadsheet.document.message.IDManager)
   */
  public boolean transformDataById (IDManager idm) 
  { 
    JSONObject o = (JSONObject) data.get(ConversionConstant.DATA);
    String sheetId = refTokenId.getSheetId();
    int rIndex = idm.getSheetIndexById(sheetId);
    int sheetCount = idm.getSheetCount();
    int index = rIndex + delta;
    
    if (index < 0) index = 0;
    if (index >= sheetCount) index = sheetCount - 1;
    delta = index - rIndex;
    o.put("delta", delta);

    return true;
  }
  
  public boolean updateIDManager (IDManager idm, boolean reverse) {
    boolean success = true;
    int tempDelta = delta;
    if(reverse) tempDelta = 0 - tempDelta;
    String sheetId = refTokenId.getSheetId();
    int rIndex = idm.getSheetIndexById(sheetId);
    int index = rIndex + tempDelta;
    idm.moveSheet(sheetId, index);

    return success;
  }
}