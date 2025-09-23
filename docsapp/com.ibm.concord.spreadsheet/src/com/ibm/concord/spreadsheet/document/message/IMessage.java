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

import com.ibm.concord.spreadsheet.document.message.IDManager;

public interface IMessage
{
  /*
   * Get normalized cell address from message's refValue
   * 
   * @return         normalized cell address: sheetname.[startcol][startrow]:[endcol][endrow]
   */
  public String getRefValue();
  
  /*
   * Use "idm" to transform cell address and append additional information to get "refValue" 
   * @param idm     IDManager that is used to transform normalized cell address
   * 
   * @return         refValue string
   * 
   */
  public String setRefValue(IDManager idm);
  
  /*
   * The message causes document structure change, update IDManager accordingly.
   * if reverse is true, apply "reverse" action to IDManager. For example, apply "delete row"
   * action to IDManager with "insert row" message
   * @param idm     IDManager that  updated with with message's reference
   * @param reverse boolean
   *  
   * @return         true if the action can be successfully applied
   *                false if the action isn't allowed  
   */
  public boolean updateIDManager(IDManager idm, boolean reverse);
  
  /*
   * Transform message's data with the given 'idm' to ID and keep those IDs in message
   * @param idm     IDManager that is used to transform message's data from index to corresponding ID 
   */
  public void transformDataByIndex(IDManager idm);
  
  /*
   * Transform message's data with the given 'idm' to index and update this message's data 
   * @param idm     IDManager that is used to transform message's data from ID to index
   * 
   * @return         true if successful transform
   *                false if one of IDs can't be found in IDManager
   */
  public boolean transformDataById(IDManager idm);
  
  /*
   * Change message's data.
   * Beside the transformation between index and id, there would have custom change for some types of messages
   */
  public void setData();
}