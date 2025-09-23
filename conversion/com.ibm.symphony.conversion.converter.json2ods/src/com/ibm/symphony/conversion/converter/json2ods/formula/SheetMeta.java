/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.formula;

import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

/**
 * Class take from document server side. Used to update formula in cells.
 */
public class SheetMeta
{
  private static final Logger LOG = Logger.getLogger(SheetMeta.class.getName());

  private JSONObject sheetsMetaInfo = null;

  public SheetMeta(JSONObject sheetsMetaInfo)
  {
    this.sheetsMetaInfo = sheetsMetaInfo;
  }

  public String getSheetNameById(String sheetId)
  {
    String sheetName = null;
    JSONObject sheetMeta = (JSONObject) sheetsMetaInfo.get(sheetId);
    if (null == sheetMeta)
    {
      return null;
    }
    sheetName = sheetMeta.get(ConversionConstant.SHEETNAME).toString();
    return sheetName;
  }
}
