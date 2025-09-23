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

public class SetSheetVisibilityMsg extends Message
{
  private String refValue = null; // keep original refValue
  // refValue is "sheet1|sheetcount"
  
  public SetSheetVisibilityMsg (JSONObject jsonEvent, IDManager idm) 
  {
    super (jsonEvent, idm);
    JSONObject reference = (JSONObject) data.get(ConversionConstant.REFERENCE);
    refValue = (String) reference.get(ConversionConstant.REF_VALUE);
  }
  
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
    
    return name + "|" + count;
  }
   
  public boolean updateIDManager (IDManager idm, boolean reverse) {   
    Token token = refTokenId.getToken();
    String sheetName = token.getSheetName();
    String sheetId = idm.getSheetIdBySheetName(sheetName);
    boolean sheet_vis = idm.isSheetVisible(sheetId);
    
    JSONObject o = (JSONObject)data.get(ConversionConstant.DATA);
    JSONObject sheet = (JSONObject)o.get("sheet");
    String visibility = (String)sheet.get("visibility");    
    
    if (reverse){
      if (visibility.equals("visible"))
        visibility = "hide";
      else
        visibility = "visible";
      idm.setSheetVisibility(sheetName, visibility);
    }else 
    {
      if (visibility.equals("hide") && idm.getVisibleSheetCount() == 1 && sheet_vis)
        return false;
      else
        idm.setSheetVisibility(sheetName, visibility);        
    }       
    
    return true;
  }
}