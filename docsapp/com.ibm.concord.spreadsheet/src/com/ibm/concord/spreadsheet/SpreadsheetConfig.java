/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.document.services.DocumentServiceComponentImpl;
import com.ibm.concord.platform.Platform;
import com.ibm.concord.spi.document.services.IDocumentService;
import com.ibm.concord.spi.document.services.IDocumentServiceProvider;
import com.ibm.json.java.JSONObject;

public class SpreadsheetConfig
{
  private static final Logger LOG = Logger.getLogger(SpreadsheetConfig.class.getName());
  private static final IDocumentService docService;
  private static final int DEFAULT_MAX_SHEET_ROWS = 5000;
  private static final int DEFAULT_MAX_IMAGE_SIZE = 8192;
  private static final int DEFAULT_MAX_TEXT_SIZE = 2048;
  private static final int DEFAULT_MOBILE_VIEW_MAX_SHEET_ROWS = 500;
  private static final int DEFAULT_MOBILE_VIEW_MAX_SHEET_COLS = 52;
  
  static
  {
    IDocumentServiceProvider docServiceProvider = (IDocumentServiceProvider) Platform.getComponent(
        DocumentServiceComponentImpl.COMPONENT_ID).getService(IDocumentServiceProvider.class);
    docService = docServiceProvider.getDocumentServiceByType("sheet");
  }
  
  public static int getMaxSheetRows()
  {
    JSONObject configs = docService.getConfig();
    JSONObject limits = (JSONObject) configs.get("limits");

    if (limits == null || (String) limits.get("max-sheet-rows") == null)
    {
      return DEFAULT_MAX_SHEET_ROWS;
    }

    int max = -1;
    try {
      String s = (String) limits.get("max-sheet-rows");
      max = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-sheet-rows", e);
    }

    return max;
  }
  
  public static int getPartialLevel()
  {
    JSONObject config = docService.getConfig();

    // in the previous we load all for default,
    // in client side DataConcentrator.setDocumentObj we have a bug
    // that if the document data is not sent via PartialDeserializer,
    // we are missing loadedSheet in document meta, thus setDocumentObj can't
    // render properly
    // change the default to PARTIAL_LEVEL_SHEET for now until we fix that
    // FIXME PARTIAL_LEVEL_ALL breaks document loading
    int level = ServiceConstants.PARTIAL_LEVEL_ROW;
    try {
      if(config.containsKey("partial-level")){
        String s = config.get("partial-level").toString();
        level = Integer.parseInt(s);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing partial-level", e);
    }

    return level;
  }
  
  public static int getPartialRowCnt()
  {
    JSONObject config = docService.getConfig();

    int cnt = -1;
    try {
      if(config.containsKey("partial-row-count")){
        String s = config.get("partial-row-count").toString();
        cnt = Integer.parseInt(s);
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing partial-row-count", e);
    }

    return cnt;
  }
  
  public static int getMaxImgSize()
  {
    JSONObject configs = docService.getConfig();
    JSONObject limits = (JSONObject) configs.get("limits");

    if (limits == null || (String) limits.get("max-image-size") == null)
    {
      return DEFAULT_MAX_IMAGE_SIZE;
    }

    int max = -1;
    try {
      String s = (String) limits.get("max-image-size");
      max = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-image-size", e);
    }

    return max;
  }
  
  public static int getMaxTextSize()
  {
    JSONObject configs = docService.getConfig();
    JSONObject limits = (JSONObject) configs.get("limits");

    if (limits == null || (String) limits.get("max-text-size") == null)
    {
      return DEFAULT_MAX_TEXT_SIZE;
    }

    int max = -1;
    try {
      String s = (String) limits.get("max-text-size");
      max = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-text-size", e);
    }

    return max;
  }
  
  public static boolean getDebugEnabled()
  {
    JSONObject config = docService.getConfig();

    Object o = config.get("DEBUG");
    
    return o == null ? false : ((Boolean) o).booleanValue();
  }
  
  public static int getMobileViewMaxRows(){
    JSONObject configs = docService.getConfig();
    JSONObject limits = (JSONObject) configs.get("mobile_limits");

    if (limits == null || (String) limits.get("max-view-rows") == null)
    {
      return DEFAULT_MOBILE_VIEW_MAX_SHEET_ROWS;
    }
    int max = -1;
    try {
      String s = (String) limits.get("max-view-rows");
      max = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-view-rows", e);
    }

    return max;
  }
  
  public static int getMobileViewMaxCols(){
    
    JSONObject configs = docService.getConfig();
    JSONObject limits = (JSONObject) configs.get("mobile_limits");

    if (limits == null || (String) limits.get("max-view-cols") == null)
    {
      return DEFAULT_MOBILE_VIEW_MAX_SHEET_COLS;
    }
    int max = -1;
    try {
      String s = (String) limits.get("max-view-cols");
      max = Integer.parseInt(s);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing max-view-cols", e);
    }

    return max;
  }
  
  public static boolean hasACLEnabled()
  {
	JSONObject config = docService.getConfig();
	boolean enabled = false;
	Object o = config.get("ACLEnabled");
	  
    try 
    {
      enabled = (o == null) ? false : Boolean.valueOf((String)o);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing ACLEnabled", e);
      enabled = false;
    }
	    
	return enabled;
  }
  
  
  public static boolean hasNodeJSEnabled()
  {
    JSONObject config = docService.getConfig();

    boolean enabled = false;
    Object o = config.get("NodeJSEnabled");
    
    try 
    {
      enabled = (o == null) ? false : Boolean.valueOf((String)o);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing hasNodeJSEnabled", e);
      enabled = false;
    }
    
    return enabled;
  }
  
  public static boolean useReferenceJS()
  {
    JSONObject config = docService.getConfig();

    boolean enabled = false;
    Object o = config.get("UseReferenceJS");
    
    try 
    {
      enabled = (o == null) ? false : Boolean.valueOf((String)o);
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error parsing UseReferenceJS", e);
      enabled = false;
    }
    
    return enabled;
  }
  
  public static JSONObject getCalculationService()
  {
    JSONObject config = docService.getConfig();

    JSONObject service = (JSONObject)config.get("calculationService");
    
    return service;
  }
}
