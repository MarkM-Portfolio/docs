/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.services;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.draft.DraftStorageManager;
import com.ibm.concord.draft.exception.DraftDataAccessException;
import com.ibm.concord.draft.exception.DraftStorageAccessException;
import com.ibm.concord.draft.section.DraftSection;
import com.ibm.concord.draft.section.SectionDescriptor;
import com.ibm.concord.spi.beans.DraftDescriptor;
import com.ibm.concord.spi.beans.IDocumentEntry;
import com.ibm.docs.common.util.UnitUtil;
import com.ibm.docs.directory.beans.UserBean;
import com.ibm.json.java.JSONObject;

public class DocumentPageSettingsUtil
{
  private static final Logger LOG = Logger.getLogger(DocumentPageSettingsUtil.class.getName());
  
  public static final String DOC_SETTINGS_PAGE = "page";
  
  private static final String PDF_PARAMETERS_PAGE = "page";
  
  private static final String PDF_PARAMETERS_TOP = "top";
  
  private static final String PDF_PARAMETERS_BOTTOM = "bottom";
  
  private static final String PDF_PARAMETERS_LEFT = "left";
  
  private static final String PDF_PARAMETERS_RIGHT = "right";
  
  private static final String PDF_PARAMETERS_HEIGHT = "height";
  
  private static final String PDF_PARAMETERS_WIDTH = "width";
  
  private static final String PDF_PARAMETERS_HEADER = "header";
  
  private static final String PDF_PARAMETERS_FOOTER = "footer";
  
  private static final String PDF_PARAMETERS_GRIDLINE = "gridline";
  
  private static final String PDF_PARAMETERS_TAGGED_PDF = "UseTaggedPDF";
  
  private static final String JSON_PARAMETERS_WIDTH = "pageWidth";
  
  private static final String JSON_PARAMETERS_HEIGHT = "pageHeight";
  
  private static final String JSON_PARAMETERS_MARGIN_LEFT = "marginLeft";
  
  private static final String JSON_PARAMETERS_MARGIN_RIGHT = "marginRight";
  
  private static final String JSON_PARAMETERS_MARGIN_TOP = "marginTop";
  
  private static final String JSON_PARAMETERS_MARGIN_BOTTOM = "marginBottom";
  
  //private static final String JSON_PARAMETERS_ORIENTATION = "orientation"; // "landscape" or "portrait"
  
  private static final String JSON_PARAMETERS_PAGE_ORDER = "pageOrder";  // "ttb" or "ltr"

  private static final String PAGE_SETTINGS_FILE_PATH = "page-settings.js";

  public static JSONObject getPageSettingsAsJson(UserBean caller, IDocumentEntry docEntry) throws DraftDataAccessException,
      DraftStorageAccessException
  {
    DraftDescriptor draftDesp = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
    DraftStorageManager manager = DraftStorageManager.getDraftStorageManager(false);
    SectionDescriptor sd = manager.getSectionDescriptor(draftDesp, new DraftSection(PAGE_SETTINGS_FILE_PATH));
    JSONObject json = manager.getSectionAsJSONObject(sd);

    return json;
  }

  public static void setPageSettingsAsJson(UserBean caller, IDocumentEntry docEntry, JSONObject json) throws DraftDataAccessException,
      DraftStorageAccessException
  {
    DraftDescriptor draftDesp = DocumentServiceUtil.getDraftDescriptor(caller, docEntry);
    DraftStorageManager manager = DraftStorageManager.getDraftStorageManager(false);
    SectionDescriptor sd = manager.getSectionDescriptor(draftDesp, new DraftSection(PAGE_SETTINGS_FILE_PATH));
    manager.storeSectionAsJSONObject(sd, json);
  }
  
  /**
   * 
   * @param json
   * @param options
   * @return merge json to options
   */
  public static Map<String, Object> mergeJsonToOptions(JSONObject json, Map<String, Object>options)
  {
    Map<String, Object> retOptions = new HashMap<String, Object>(options);

    // page order
    Object obj = null;
    if(options.get(PDF_PARAMETERS_PAGE) == null)
    {
      obj = json.get(JSON_PARAMETERS_PAGE_ORDER);
      updateOptionsBooleanItem(retOptions, PDF_PARAMETERS_PAGE, obj);
    }
    
    // header    
    if(options.get(PDF_PARAMETERS_HEADER) == null)
    {
      obj = json.get(PDF_PARAMETERS_HEADER);
      updateOptionsBooleanItem(retOptions, PDF_PARAMETERS_HEADER, obj);
    }
    
    // footer
    if(options.get(PDF_PARAMETERS_FOOTER) == null)
    {
      obj = json.get(PDF_PARAMETERS_FOOTER);
      updateOptionsBooleanItem(retOptions, PDF_PARAMETERS_FOOTER, obj);
    }
    
    // gridline
    if(options.get(PDF_PARAMETERS_GRIDLINE) == null)
    {
      obj = json.get(PDF_PARAMETERS_GRIDLINE);
      updateOptionsBooleanItem(retOptions, PDF_PARAMETERS_GRIDLINE, obj);
    }
    
    // tagPDF
    if(options.get(PDF_PARAMETERS_TAGGED_PDF) == null)
    {
      obj = json.get(PDF_PARAMETERS_TAGGED_PDF);
      updateOptionsBooleanItem(retOptions, PDF_PARAMETERS_TAGGED_PDF, obj);
    }
    
    // height
    String str = null;
    if(options.get(PDF_PARAMETERS_HEIGHT) == null)
    {
      str = (String)json.get(JSON_PARAMETERS_HEIGHT);
      updateOptionsIntItem(retOptions, PDF_PARAMETERS_HEIGHT, str);
    }    
    
    // width
    
    if(options.get(PDF_PARAMETERS_WIDTH) == null)
    {
      str = (String)json.get(JSON_PARAMETERS_WIDTH);
      updateOptionsIntItem(retOptions, PDF_PARAMETERS_WIDTH, str);
    }      
    
    // margin top    
    if(options.get(PDF_PARAMETERS_TOP) == null)
    {
      str = (String)json.get(JSON_PARAMETERS_MARGIN_TOP);
      updateOptionsIntItem(retOptions, PDF_PARAMETERS_TOP, str);
    }  
    
    // margin bottom   
    if(options.get(PDF_PARAMETERS_BOTTOM) == null)
    {
      str = (String)json.get(JSON_PARAMETERS_MARGIN_BOTTOM);
      updateOptionsIntItem(retOptions, PDF_PARAMETERS_BOTTOM, str);
    }      
    
    // margin left    
    if(options.get(PDF_PARAMETERS_LEFT) == null)
    {
      str = (String)json.get(JSON_PARAMETERS_MARGIN_LEFT);
      updateOptionsIntItem(retOptions, PDF_PARAMETERS_LEFT, str);
    }      
    
    // margin right
    if(options.get(PDF_PARAMETERS_RIGHT) == null)
    {
      str = (String)json.get(JSON_PARAMETERS_MARGIN_RIGHT);
      updateOptionsIntItem(retOptions, PDF_PARAMETERS_RIGHT, str);
    }  
    
    LOG.log(Level.INFO, "Options is -- " + makeOptionsToString(retOptions));
    
    return retOptions;
  }
  
  /**
   * 
   * @param options
   * @param json
   * @return merge options to json
   */
  public static JSONObject mergeOptionsToJson(Map<String, Object>options, JSONObject json)
  {
    JSONObject retJson = (JSONObject)json.clone();
    
    // page order
    Object obj = options.get(PDF_PARAMETERS_PAGE);
    if(obj != null)
    {
      boolean b = Boolean.valueOf(getStringValue(obj));
      if(b)
      {
        retJson.put(JSON_PARAMETERS_PAGE_ORDER, "ttb");
      }
      else
      {
        retJson.put(JSON_PARAMETERS_PAGE_ORDER, "ltr");
      }
    }
    
    // header
    obj = options.get(PDF_PARAMETERS_HEADER);
    updateJSONBooleanItem(retJson, PDF_PARAMETERS_HEADER, obj);
    
    // footer
    obj = options.get(PDF_PARAMETERS_FOOTER);
    updateJSONBooleanItem(retJson, PDF_PARAMETERS_FOOTER, obj);
    
    // gridline
    obj = options.get(PDF_PARAMETERS_GRIDLINE);
    updateJSONBooleanItem(retJson, PDF_PARAMETERS_GRIDLINE, obj);
    
    // tagPDF
    obj = options.get(PDF_PARAMETERS_TAGGED_PDF);
    updateJSONBooleanItem(retJson, PDF_PARAMETERS_TAGGED_PDF, obj);
    
    // height
    obj = options.get(PDF_PARAMETERS_HEIGHT);
    updateJSONCMItem(retJson, JSON_PARAMETERS_HEIGHT, obj);
    
    // width
    obj = options.get(PDF_PARAMETERS_WIDTH);
    updateJSONCMItem(retJson, JSON_PARAMETERS_WIDTH, obj);
    
    // margin top
    obj = options.get(PDF_PARAMETERS_TOP);
    updateJSONCMItem(retJson, JSON_PARAMETERS_MARGIN_TOP, obj);
    
    // margin bottom
    obj = options.get(PDF_PARAMETERS_BOTTOM);
    updateJSONCMItem(retJson, JSON_PARAMETERS_MARGIN_BOTTOM, obj);
    
    // margin left
    obj = options.get(PDF_PARAMETERS_LEFT);
    updateJSONCMItem(retJson, JSON_PARAMETERS_MARGIN_LEFT, obj);
    
    // margin right
    obj = options.get(PDF_PARAMETERS_RIGHT);
    updateJSONCMItem(retJson, JSON_PARAMETERS_MARGIN_RIGHT, obj);
    
    LOG.log(Level.INFO, "page-settings JSON: " + retJson.toString());    
    return retJson;
  }
  
  private static void updateOptionsBooleanItem(Map<String, Object>options, String key, Object value)
  {
    if(value != null)
    {
      options.put(key, value.toString());      
    }
  }
  
  private static void updateOptionsIntItem(Map<String, Object>options, String key, String value)
  {
    if(value != null)
    {
      double dd = UnitUtil.convertToCMValue(value.trim());
      int ii = (int) (dd*1000);
      options.put(key, Integer.toString(ii)); 
    }
  }
  
  private static void updateJSONBooleanItem(JSONObject json, String key, Object value)
  {
    if(value != null)
    {
      boolean b = Boolean.valueOf(getStringValue(value));
      if(b)
      {
        json.put(key, "true");
      }
      else
      {
        json.put(key, "false");
      }
    }    
  }
  
  private static void updateJSONCMItem(JSONObject json, String key, Object value)
  {
    if(value != null)
    {
      String str = getStringValue(value);
      if(str != null && str.length() > 0)
      {
        Double dd = Double.parseDouble(str);
        String ss = dd / 1000 + "cm";
        json.put(key, ss);
      }       
    }
  }
  
  private static String getStringValue(Object value)
  {
    String ret = new String();
    if(value instanceof String)
    {
      ret = (String) value;
    }
    else if (value instanceof String[])
    {
      String[] strs = (String[]) value;
      for(int i=0; i<strs.length; i++)
      {
        ret += strs[0];
      }
    }
    else
    {
      ret = value.toString();
    }
    
    return ret;
  }
  
  private static String makeOptionsToString(Map<String, Object>options)
  {
    String str = new String();
    Iterator<Map.Entry<String, Object>> iter = options.entrySet().iterator();
    while (iter.hasNext())
    {
      Map.Entry<String, Object> entry = (Map.Entry<String, Object>) iter.next();
      String key = entry.getKey();
      Object value = entry.getValue();
      str += key;
      str += ":";
      str += getStringValue(value);
      str += "; ";
    }
    return str;
  }  
  
  public static boolean getACLState(UserBean user, IDocumentEntry docEntry)
  {
    boolean hasACL = false;
    JSONObject json;
	try {
		json = DocumentPageSettingsUtil.getPageSettingsAsJson(user, docEntry);
	    if(json.containsKey("hasACL"))
	    {
	      hasACL = Boolean.parseBoolean(json.get("hasACL").toString()); 
	    }		
	} catch (DraftDataAccessException e) {
		LOG.warning("Failed to get ACL settings!!!");
	} catch (DraftStorageAccessException e) {
		LOG.warning("Failed to get ACL settings!!!");
	}
    return hasACL;
  }
  
  public static boolean hasChangeHistory(UserBean user, IDocumentEntry docEntry)
  {
    boolean hasTrack = false;
    JSONObject json;
    try {
        json = DocumentPageSettingsUtil.getPageSettingsAsJson(user, docEntry);
        if(json.containsKey("hasTrack"))
        {
          hasTrack = Boolean.parseBoolean(json.get("hasTrack").toString()); 
        }       
    } catch (DraftDataAccessException e) {
        LOG.warning("Failed to get Change History state!!!");
    } catch (DraftStorageAccessException e) {
        LOG.warning("Failed to get Change History state!!!");
    }
    return hasTrack;
  }
  
  public static boolean hasMacro(UserBean user, IDocumentEntry docEntry)
  {
	boolean hasMacro = false;
	JSONObject json;
	try {
		json = DocumentPageSettingsUtil.getPageSettingsAsJson(user, docEntry);
		if(json.containsKey("hasMacro"))
		{
			hasMacro = Boolean.parseBoolean(json.get("hasMacro").toString()); 
		}	
	} catch (DraftDataAccessException e) {
		LOG.warning("Failed to get macro settings!!!");
	} catch (DraftStorageAccessException e) {
		LOG.warning("Failed to get macro settings!!!");
	}
	return hasMacro;
  }
}
