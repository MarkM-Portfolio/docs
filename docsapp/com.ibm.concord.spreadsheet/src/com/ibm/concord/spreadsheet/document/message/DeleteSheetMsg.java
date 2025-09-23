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

public class DeleteSheetMsg extends Message
{
  private String refValue = null; // keep original refValue
  // refValue is "sheet1|sheetindex|sheetcount"

  public DeleteSheetMsg (JSONObject jsonEvent, IDManager idm) 
  {
    super (jsonEvent, idm);
    JSONObject reference = (JSONObject) data.get(ConversionConstant.REFERENCE);
    refValue = (String) reference.get(ConversionConstant.REF_VALUE);
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spreadsheet.document.message.Message#getRefValue()
   */
  public String getRefValue () 
  {
    String value = null;
    JSONObject reference = (JSONObject) data.get(ConversionConstant.REFERENCE);
    refValue = (String) reference.get(ConversionConstant.REF_VALUE);
    value = refValue;
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
    if (sheetId == null) {
      // use original refValue instead
      return refValue;
    }
    
    int index = idm.getSheetIndexById(sheetId) + 1; // sheetindex is 1-based
    String name = idm.getSheetNameById(sheetId);
    int count = idm.getVisibleSheetCount();
    
    return name + "|" + index + "|" + count;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spreadsheet.document.message.Message#updateIDManager(com.ibm.concord.spreadsheet.document.message.IDManager, boolean)
   */
  public boolean updateIDManager (IDManager idm, boolean reverse) 
  {
    boolean success = true;
    
    String sheetId = refTokenId.getSheetId();
    if (sheetId == null) return false;
    
    Token token = refTokenId.getToken();
    String sheetName = token.getSheetName();
    int index = idm.getSheetIndexById(sheetId);
    
    if (!reverse) {
      if ((idm.getVisibleSheetCount() == 1 && idm.isSheetVisible(sheetId)) || index == -1) {
        // not allow to delete sheet when there has only one sheet
        // return false when the sheet to be deleted doesn't exist
        success = false;  
      } else
        idm.deleteSheetAtIndex(index);
    } else
      idm.insertSheetAtIndex(index, sheetName);
    
    return success;
  }
}