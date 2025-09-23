/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;


public class SheetMeta 
{
	private static final Logger LOG = Logger.getLogger(SheetMeta.class.getName());
	public JSONObject sheetsMetaInfo = null;
	public JSONArray sheetsIdArray = null;
	public static final String SID = "st";
	public static final String ORIGINAL_SID = "os";
	public int sheetCount = 0;
	
	public HashMap<String,Object> sheetId2IndexMap = null;
	
	public SheetMeta(JSONObject sheetsMetaInfo, JSONArray sheetsIdArray)
	{
		this.sheetsMetaInfo = sheetsMetaInfo;
		this.sheetsIdArray = sheetsIdArray;
		sheetId2IndexMap = new HashMap<String,Object>();
        this.getSheetId2IndexMap();
        this.getSheetCount();
	}
	
	public void getSheetCount()
	{
		if(null == sheetsIdArray)
		{
			return;
		}
		for(int i = 0 ; i < sheetsIdArray.size(); i++)
		{
			String sheetId = sheetsIdArray.get(i).toString();
			if(sheetId.length() >= 2)
			{
				String strCount = sheetId.substring(2,sheetId.length());
				int tmpCount = Integer.parseInt(strCount);
				if(tmpCount > this.sheetCount)
				{
					this.sheetCount = tmpCount;
				}
			}
			
		}
	}
	
	public String generateSheetId()
	{
		this.sheetCount++;
		String sheetId = SID + this.sheetCount;
		return sheetId;
	}
	
	public void removeMaxColIndexInfo()
	{
	  Iterator<?> iter = this.sheetsMetaInfo.entrySet().iterator();
	  while(iter.hasNext())
	  {
	    Map.Entry<String, JSONObject> entry = (Map.Entry<String, JSONObject>)iter.next();
	    String sheetId = entry.getKey();
	    JSONObject sheetMeta = entry.getValue();
	    sheetMeta.remove(ConversionConstant.MAXCOLINDEX);
	  }
	}
	
	public void save2sheetsMetaInfo()
	{
		for(int i = 0 ; i < sheetsIdArray.size(); i++)
		{
			String sheetId = (String)sheetsIdArray.get(i);
			if(sheetId.length() > 0)
			{
				JSONObject sheetMeta = (JSONObject)sheetsMetaInfo.get(sheetId);
				if( null == sheetMeta)
				{
					LOG.warning("sheet " + sheetId + "not exist!!");
					continue;
				}
				sheetMeta.put(ConversionConstant.SHEETINDEX, i+1);
			}			
		}
	}
	
	public void setSheetMeta(String sheetId, JSONObject data)
	{
		JSONObject sheet = (JSONObject) sheetsMetaInfo.get(sheetId);
		if(null == sheet)
		{
			sheet = new JSONObject();
			sheetsMetaInfo.put(sheetId, sheet);
		}
		sheet.putAll(data);
		if(null != data.get(ConversionConstant.SHEETINDEX))
		{
			int sheetIndex = Integer.parseInt(data.get(ConversionConstant.SHEETINDEX).toString());
			setSheetId2Array(sheetId,sheetIndex);	
		}	
	}
	
	public void getSheetId2IndexMap()
	{
		if( null == sheetsIdArray) return;
		sheetId2IndexMap = new HashMap<String,Object>();
		for(int i = 0 ; i < sheetsIdArray.size(); i++)
		{
			String sheetId = (String)sheetsIdArray.get(i);
			if(sheetId.length() > 0)
			{
				sheetId2IndexMap.put(sheetId, i+1);
			}			
		}
	}
	
	public String getSheetIdByName(String sheetName)
	{
		String sheetId = null;
		if( null == sheetsMetaInfo) return null;
		Iterator<?> iter = sheetsMetaInfo.entrySet().iterator();
		while(iter.hasNext())
		{
			Map.Entry<String, JSONObject> entry = (Map.Entry<String, JSONObject>)iter.next();
			String tmpsheetId = entry.getKey();
			JSONObject sheetMeta = entry.getValue();
			if( null != sheetMeta.get(ConversionConstant.SHEETNAME))
			{
				String tmpName =  sheetMeta.get(ConversionConstant.SHEETNAME).toString();
				
				if(tmpName.equals(sheetName))
				{
					sheetId = tmpsheetId;
					return sheetId;
				}
			}
		}
		return sheetId;
	}
	
	public String getOrCreateSheetIdByName(String sheetName)
	{
		String sheetId = null;
		if( null == sheetsMetaInfo) 
		{
			sheetsMetaInfo = new JSONObject();
		}
		Iterator<?> iter = sheetsMetaInfo.entrySet().iterator();
		while(iter.hasNext())
		{
			Map.Entry<String, JSONObject> entry = (Map.Entry<String, JSONObject>)iter.next();
			String tmpsheetId = entry.getKey();
			JSONObject sheetMeta = entry.getValue();
			if( null != sheetMeta.get(ConversionConstant.SHEETNAME))
			{
				String tmpName =  sheetMeta.get(ConversionConstant.SHEETNAME).toString();
				
				if(tmpName.equals(sheetName))
				{
					sheetId = tmpsheetId;
					return sheetId;
				}
			}
		}
		if(null == sheetId)
		{
			sheetId = this.generateSheetId();
		}
		return sheetId;
	}
	public String getSheetNameById(String sheetId)
	{
		String sheetName = null;
		JSONObject sheetMeta =(JSONObject) sheetsMetaInfo.get(sheetId);
		if(null == sheetMeta)
		{
			return null;
		}
		sheetName = sheetMeta.get(ConversionConstant.SHEETNAME).toString();
		return sheetName;
	}
	
	public void setSheetId2Array(String sheetId, int index)
	{
		if(index > sheetsIdArray.size())
		{
			for(int i = sheetsIdArray.size(); i < index; i++ )
			{
				sheetsIdArray.add("");
			}	
		}
		sheetsIdArray.set(index-1, sheetId);
	}
	
	public int getSheetIndexById(String sheetId)
	{
	  if(null == sheetsIdArray || sheetsIdArray.size() == 0)
	    return -1;
	  return sheetsIdArray.indexOf(sheetId);
	}
	
	public void addSheetId2Array(String sheetId, int index)
	{
//		System.out.println("before add sheet: " + sheetsIdArray.toString());
		if(null == sheetsIdArray)
		{
			sheetsIdArray = new JSONArray();
		}
		if(index > sheetsIdArray.size())
		{
			for(int i = sheetsIdArray.size(); i <= index; i++ )
			{
				sheetsIdArray.add("");
			}	
			sheetsIdArray.set(index, sheetId);
		}
//		else if(index == sheetsIdArray.size())
//		{
//			sheetsIdArray.add("");
//			sheetsIdArray.set(index, sheetId);
//		}
		else
		{
			sheetsIdArray.add(index,sheetId);
		}
//		System.out.println("after add sheet: " + sheetsIdArray.toString());
	}
	
	public void addSheetMeta(String sheetId, JSONObject data)
	{	
		if( null == data || null == data.get(ConversionConstant.SHEETINDEX)) return;
		if(null == sheetsMetaInfo)
		{
			sheetsMetaInfo = new JSONObject();
		}
		JSONObject sheet = new JSONObject();
		sheet.put(ConversionConstant.SHEETINDEX, data.get(ConversionConstant.SHEETINDEX));
		sheet.put(ConversionConstant.SHEETNAME, data.get(ConversionConstant.SHEETNAME));
		sheetsMetaInfo.put(sheetId, sheet);
		int sheetIndex = Integer.parseInt(data.get(ConversionConstant.SHEETINDEX).toString());
		addSheetId2Array(sheetId,sheetIndex-1);
		this.getSheetId2IndexMap();
		sheetId2IndexMap.put(sheetId, sheetIndex);
	}
}
