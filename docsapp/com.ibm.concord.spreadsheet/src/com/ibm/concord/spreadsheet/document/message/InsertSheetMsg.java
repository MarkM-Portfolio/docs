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

public class InsertSheetMsg extends Message
{
  private int sheetIndex;
  // {"data": {"sheet": {"sheetname": sheetname; "sheetIndex": sheetindex})}  
  public InsertSheetMsg (JSONObject jsonEvent, IDManager idm) {
    super (jsonEvent, idm);
    JSONObject o = (JSONObject)data.get(ConversionConstant.DATA);
    JSONObject sheet = (JSONObject) o.get("sheet");
    this.sheetIndex = Integer.parseInt(sheet.get("sheetindex").toString());
  }
  
   /*
	* translate refValue from index to id
	*/
	public void transformRefByIndex(IDManager idm,boolean bCreat) 
	{
		refTokenId.updateId(idm);
		String sheetId = refTokenId.getSheetId();
	    Token token = refTokenId.getToken();
	    String sheetName = token.getSheetName();
		if(sheetId == null && bCreat)
		{
			idm.insertSheetAtIndex(this.sheetIndex-1, sheetName);
			refTokenId.updateId(idm);
		}
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
   * @see com.ibm.concord.spreadsheet.document.message.Message#transformRefById(com.ibm.concord.spreadsheet.document.message.IDManager)
   */
  public boolean transformRefById(IDManager idm)
  {
    // no need to transform here because the corresponding sheet id isn't available yet for new sheet name
    return true;
  }
  
  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spreadsheet.document.message.Message#transformDataById(com.ibm.concord.spreadsheet.document.message.IDManager)
   */
  public boolean transformDataById(IDManager idm)
  {
    boolean success = true;
    
    JSONObject o = (JSONObject)data.get(ConversionConstant.DATA);
    JSONObject sheet = (JSONObject) o.get("sheet");
    // new sheet isn't inserted into IDManager yet because transformDataById() is called prior to updateIDManager()
//    int index = idm.getSheetCount() + 1;
    String sheetId = refTokenId.getSheetId();
    if (sheetId == null){
    	return false;
    }
	
	this.sheetIndex = idm.getSheetIndexById(sheetId) + 1;
	sheet.put("sheetindex", this.sheetIndex);
    
    return success;
  }

  /*
   * (non-Javadoc)
   * @see com.ibm.concord.spreadsheet.document.message.Message#updateIDManager(com.ibm.concord.spreadsheet.document.message.IDManager, boolean)
   */
  public boolean updateIDManager (IDManager idm, boolean reverse) {
    boolean success = true;
        
    if (!reverse) {
      Token token = refTokenId.getToken();
      String sheetName = token.getSheetName();
      
      int index =  this.sheetIndex - 1;//idm.getSheetCount();

      String id = idm.getSheetIdBySheetName (sheetName);
      if (id != null) {
        // already exist
        success = false;
      }else 
        idm.insertSheetAtIndex(index, sheetName);
    } else {
      String sheetId = refTokenId.getSheetId();
      int rIndex = idm.getSheetIndexById(sheetId);
      idm.deleteSheetAtIndex(rIndex);
    }
    
    return success;
  }
}
