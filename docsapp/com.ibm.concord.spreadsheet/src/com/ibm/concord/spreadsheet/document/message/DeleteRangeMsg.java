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

public class DeleteRangeMsg extends Message
{
  public DeleteRangeMsg (JSONObject jsonEvent, IDManager idm) {
    super (jsonEvent, idm);
  }
  
  /*
	 * translate refValue from id to index
	 * 
	 * @return true if success transformation for refValue otherwise false
	 */
  public boolean transformRefById(IDManager idm) {
		return true;
	}
}