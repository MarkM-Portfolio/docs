/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.impl.ConversionService;

public class SpreadsheetConfig
{
  private static final Logger LOG = Logger.getLogger(SpreadsheetConfig.class.getName());

  private static final String SpreadSheet = "spreadSheet";

  public static int getMaxSheetRows()
  {
    JSONObject config = getSpreadsheetConfig();

    int max = 30000;
    try
    {
      if(config.containsKey("max-sheet-rows"))
      {
        String s = config.get("max-sheet-rows").toString();
        max = Integer.parseInt(s);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-sheet-rows", e);
    }
    return max;
  }

  public static JSONObject getSpreadsheetConfig()
  {
    JSONObject config = (JSONObject) ConversionService.getInstance().getConfig(SpreadSheet);
    return config;
  }

  public static long getMaxCellCount()
  {
    JSONObject config = getSpreadsheetConfig();
    long maxCount = 800000;
    try
    {
      if(config.containsKey("cell-max-num"))
      {
        String s = config.get("cell-max-num").toString();
        maxCount = Long.parseLong(s);
      }
    }catch(Exception e)
    {
      LOG.log(Level.WARNING, "error parsing cell-max-num", e);
    }
    return maxCount;
  }
  
  public static long getMaxFormulaCellCount()
  {
    JSONObject config = getSpreadsheetConfig();
    long maxCount = 80000;
    try
    {
      if(config.containsKey("formula-cell-max-num"))
      {
        String s = config.get("formula-cell-max-num").toString();
        maxCount = Long.parseLong(s);
      }
    }catch(Exception e)
    {
      LOG.log(Level.WARNING, "error parsing formula-cell-max-num", e);
    }
    return maxCount;
  }
  
}
