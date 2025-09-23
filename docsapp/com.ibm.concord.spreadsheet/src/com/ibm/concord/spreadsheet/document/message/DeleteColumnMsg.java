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

import com.ibm.json.java.JSONObject;

public class DeleteColumnMsg extends Message
{
  public DeleteColumnMsg (JSONObject jsonEvent, IDManager idm) {
    super (jsonEvent, idm);
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spreadsheet.document.message.Message#updateIDManager(com.ibm.concord.spreadsheet.document.message.IDManager, boolean)
   */
  public boolean updateIDManager (IDManager idm, boolean reverse) {
    boolean success = true;
    
    String sheetId = refTokenId.getSheetId();
    Token token = refTokenId.getToken();
    int index = token.getIndex(this.type);
    int count = token.getCount(type);
    
    if (!reverse)
      idm.deleteColAtIndex(sheetId, index, count);
    else
      idm.insertColAtIndex(sheetId, index, count);
    
    return success;
  }
}