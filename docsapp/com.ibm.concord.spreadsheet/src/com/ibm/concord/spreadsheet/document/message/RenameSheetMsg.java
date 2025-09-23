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
import com.ibm.json.java.JSONObject;

public class RenameSheetMsg extends Message
{
  // {"data": {"sheet":  {"sheetname": sheetname}}}
  // FIXME need to change sheetname in transformDataById()???
  
  public RenameSheetMsg (JSONObject jsonEvent, IDManager idm) {
    super (jsonEvent, idm);
  }

  private String getNewSheetName ()
  {
    JSONObject o = (JSONObject)data.get(ConversionConstant.DATA);
    JSONObject sheet = (JSONObject)o.get("sheet");
    
    return (String) sheet.get("sheetname");
  }
  /**
   * if the sheet name contain  blank space, using setRefValue method in the super class Message, 
   * the obtained sheet name would be wrapped with single quotation, but here just need the original sheetName
   */
  public String setRefValue(IDManager idm) 
  {
	Token token = refTokenId.getToken();
	return token.getSheetName();
  }
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spreadsheet.document.message.Message#updateIDManager(com.ibm.concord.spreadsheet.document.message.IDManager, boolean)
   */
  public boolean updateIDManager (IDManager idm, boolean reverse) {
    boolean success = true;
    
    Token token = refTokenId.getToken();
    String oldName = token.getSheetName();
    String newName = getNewSheetName();
    
    if (!reverse) {
      String id = idm.getSheetIdBySheetName (oldName);
      String id2 = idm.getSheetIdBySheetName (newName);
      // old sheet name doesn't exist or new sheet name exists already
      if (id == null || id2 != null) 
        success = false;
      else 
        idm.renameSheet(oldName, newName);
    } else {
      String id = idm.getSheetIdBySheetName (oldName);
      if (id != null)
        success = false;
      else
        idm.renameSheet(newName, oldName);
    }
    
    return success;
  }
}
