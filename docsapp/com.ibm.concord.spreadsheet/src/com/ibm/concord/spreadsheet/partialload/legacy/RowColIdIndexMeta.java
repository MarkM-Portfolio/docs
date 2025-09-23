/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.partialload.legacy;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;


public class RowColIdIndexMeta 
{
	public JSONObject  sheetsArray = null;
	public HashMap<String, JSONArray> rowsIdArrayMap = null;
	public HashMap<String, JSONArray> colsIdArrayMap = null;
	
	public HashMap<String,Object>  colId2IndexMap = null;
	public HashMap<String,Object>  rowId2IndexMap = null;
	
	public HashMap<String,Object> rowsIdMap = null;
	public HashMap<String,Object> colsIdMap = null;
	
	public int rowCount = 0;
	public int colCount = 0;
	public static final String RID = "ro";
	public static final String CID = "co";
	public static final String ORIGINAL_RID = "or";
	public static final String ORIGINAL_CID = "oc";
	public static final int prefix_length = 2;
	
	public RowColIdIndexMeta(JSONObject  sheetsArray)
	{
	    this.sheetsArray = sheetsArray;
		rowsIdArrayMap = new HashMap<String, JSONArray>();
		colsIdArrayMap = new HashMap<String, JSONArray>();
		rowsIdMap = new HashMap<String,Object>();
		colsIdMap = new HashMap<String,Object>();
		constractIdIndexMap();
	}
	
	/*
	 * when partial load the document, the row count and column count maybe wrong
	 * use this method to correct them
	 */
	public void setRowColMaxCount(int rowCnt, int colCnt)
	{
	  this.rowCount = (rowCnt > this.rowCount) ? rowCnt : this.rowCount;
	  this.colCount = (colCnt > this.colCount) ? colCnt : this.colCount;
	}
	
	public void constractIdIndexMap()
	{
        colId2IndexMap = new HashMap<String,Object> ();
        rowId2IndexMap = new HashMap<String,Object> ();
		if(null == sheetsArray || sheetsArray.isEmpty()) return;
		Set<Entry<String, JSONObject>> entries = sheetsArray.entrySet();
		Iterator<Entry<String, JSONObject>> iter = entries.iterator();
		while(iter.hasNext())
		{
			Entry<String, JSONObject> entry = iter.next();
			String sheetId = entry.getKey();
			JSONObject sheetArray = entry.getValue();
			JSONArray rowsIdArray = (JSONArray)sheetArray.get(ConversionConstant.ROWSIDARRAY);
			JSONArray colsIdArray = (JSONArray)sheetArray.get(ConversionConstant.COLUMNSIDARRAY);
			if(null != colsIdArray && !colsIdArray.isEmpty())
			{
				for(int i = 0; i < colsIdArray.size(); i++)
				{
					String colId = (String)colsIdArray.get(i);
					if(colId.length() > 0)
					{
						colId2IndexMap.put(colId, i+1);
						String strCount = colId.substring(prefix_length,colId.length());
						int count = Integer.parseInt(strCount);
						if(count > this.colCount)
						{
							this.colCount = count;
						}
//						this.colCount++;
					}
				}
//				colCount += colsIdArray.size();
				colsIdArrayMap.put(sheetId, colsIdArray);
			}
			if(null != rowsIdArray && !rowsIdArray.isEmpty())
			{
				for(int i = 0; i < rowsIdArray.size(); i++)
				{
					String rowId = (String)rowsIdArray.get(i);
					if(rowId.length() > 0)
					{
						rowId2IndexMap.put(rowId, i+1);
						String strCount = rowId.substring(prefix_length,rowId.length());
						int count = Integer.parseInt(strCount);
						if(count > this.rowCount)
						{
							this.rowCount = count;
						}
//						this.rowCount++;
					}
				}
//				rowCount += rowsIdArray.size();
				rowsIdArrayMap.put(sheetId, rowsIdArray);
			}
		}
			
	}
	
	public void save2sheetsArray()
	{
		JSONObject newSheetsArray = new JSONObject();
		Iterator<?> iter = rowsIdArrayMap.entrySet().iterator();
		while(iter.hasNext())
		{
			Map.Entry<?,?> entry = (Map.Entry<?,?>) iter.next();
			String sheetId = (String) entry.getKey();
			if(null == sheetId ) continue;
			JSONArray rowsIdArray = (JSONArray) entry.getValue();
			int i = rowsIdArray.size() - 1;
			while(i >= 0)
			{
			  String id = (String)rowsIdArray.get(i);
			  if(id.length() == 0)
			    rowsIdArray.remove(i);
			  else
			    break;
			  i--;
			}
			JSONObject sheetArray = new JSONObject();
			sheetArray.put(ConversionConstant.ROWSIDARRAY, rowsIdArray);	
			newSheetsArray.put(sheetId, sheetArray);
		}
		
		iter = colsIdArrayMap.entrySet().iterator();
		while(iter.hasNext())
		{
			Map.Entry<?,?> entry = (Map.Entry<?,?>) iter.next();
			String sheetId = (String) entry.getKey();
			if(null == sheetId ) continue;
			JSONArray colsIdArray = (JSONArray) entry.getValue();
	        int i = colsIdArray.size() - 1;
	        while(i >= 0)
	        {
	          String id = (String)colsIdArray.get(i);
	          if(id.length() == 0)
	            colsIdArray.remove(i);
	          else
	            break;
	          i--;
	        }
			JSONObject sheetArray = (JSONObject)newSheetsArray.get(sheetId);
			if(null == sheetArray)
			{
				sheetArray = new JSONObject();
				newSheetsArray.put(sheetId, sheetArray);
			}
			sheetArray.put(ConversionConstant.COLUMNSIDARRAY, colsIdArray);
		}
		sheetsArray = newSheetsArray;
//		this.cleanUnUsedIdInSheetsArray();
	}
	
	public void cleanUnUsedIdInSheetsArray()
	{
		Iterator<?> iter = this.sheetsArray.entrySet().iterator();
		while(iter.hasNext())
		{
			Map.Entry<?,?> entry = (Map.Entry<?,?>) iter.next();
			String sheetId = (String) entry.getKey();
			JSONObject sheet = (JSONObject)entry.getValue();
			JSONArray rowsIdArray = (JSONArray)sheet.get(ConversionConstant.ROWSIDARRAY);
			JSONArray colsIdArray = (JSONArray)sheet.get(ConversionConstant.COLUMNSIDARRAY);
			if(null != rowsIdArray)
			{
				for(int i = 0; i < rowsIdArray.size(); i++)
				{
					String rowId = (String)rowsIdArray.get(i);
					if(rowId.length()>0 && rowsIdMap.get(rowId)==null)
					{
						rowsIdArray.set(i, "");
					}
				}
			}
			if(null != colsIdArray)
			{
				for(int i = 0; i < colsIdArray.size(); i++)
				{
					String colId = (String)colsIdArray.get(i);
					if(colId.length()>0 && colsIdMap.get(colId)==null)
					{
						colsIdArray.set(i, "");
					}
				}
			}
		}
	}
	
	public void deleteSheetRowColIdArray(String sheetId)
	{
		rowsIdArrayMap.remove(sheetId);
		colsIdArrayMap.remove(sheetId);
	}
	
	public String createRowId()
	{
		this.rowCount++;
		String rowId = RID + this.rowCount;
		return rowId;
	}
	
	public String createColId()
	{
		this.colCount++;
		String colId = CID + this.colCount;
		return colId;
	}
	
	public String getRowIdbyIndex(String sheetId ,int index)
	{
		String rowId = null;
		JSONArray rowIdArray = rowsIdArrayMap.get(sheetId);
		
		if(null==rowIdArray || index > rowIdArray.size() || index < 1)
			return null;
		rowId = (String)rowIdArray.get(index-1);
		return rowId;
	}
	
	public String getOrCreateRowIdByIndex(String sheetId ,int index)
	{
		String rowId = null;
		if(index < 1) return null;
		JSONArray rowIdArray = rowsIdArrayMap.get(sheetId);
		if(null==rowIdArray || index > rowIdArray.size())
		{
			rowId = setRowId(sheetId, index);
		}
		else 
		{
			rowId = (String)rowIdArray.get(index-1);
			if(0 == rowId.length())
			{
				rowId = setRowId(sheetId, index);
			}
		}
		
		return rowId;
	}
	
	public String getOrCreateColIdByIndex(String sheetId ,int index)
	{
		String colId = null;
		if(index < 1) return null;
		JSONArray colIdArray = colsIdArrayMap.get(sheetId);
		
		if( null == colIdArray || index > colIdArray.size() )
		{
			colId = setColId(sheetId, index);
		}
		else 
		{
			colId = (String)colIdArray.get(index-1);
			if(0 == colId.length())
			{
				colId = setColId(sheetId, index);
			}
		}
		return colId;
	}
	
	public String getColIdbyIndex(String sheetId ,int index)
	{
		String colId = null;
		JSONArray colIdArray = colsIdArrayMap.get(sheetId);
		
		if( null == colIdArray || index > colIdArray.size() || index < 1)
			return null;
		colId = (String)colIdArray.get(index-1);
		return colId;
	}
	
	public void setExistColId(String sheetId, int index, String colId)
	{
	  JSONArray colIdArray = colsIdArrayMap.get(sheetId);
	  if(null != colIdArray && index <colIdArray.size())
	  {
	    colId2IndexMap.put(colId, index);
	    colIdArray.set(index-1, colId);
	  }
	}
	
	public String setColId(String sheetId, int index)
	{
		String colId = createColId();
		JSONArray colIdArray = null;
		colIdArray = colsIdArrayMap.get(sheetId);
		
		if( null == colIdArray)
		{
			colIdArray = new JSONArray();
			colsIdArrayMap.put(sheetId, colIdArray);
		}
		
		if(index > colIdArray.size())
		{
			for( int i = colIdArray.size(); i < index ; i++)
			{
				colIdArray.add("");
			}
		}
		colId2IndexMap.put(colId, index);
		colIdArray.set(index-1, colId);
		return colId;
	}
	// set the rowid at row index
	public void setExistRowId(String sheetId, String rowId, int index)
	{
	  JSONArray rowsIdArray = rowsIdArrayMap.get(sheetId);
	  if(null != rowsIdArray && index < rowsIdArray.size())
	  {
	    rowId2IndexMap.put(rowId, index);
	    rowsIdArray.set(index-1, rowId);
	  }
	}
	
	// set rowid to sheetsIdArray
	public String setRowId(String sheetId, int index)
	{
		String rowId = createRowId();

		JSONArray rowsIdArray = null;
		rowsIdArray = rowsIdArrayMap.get(sheetId);
		
		if(null == rowsIdArray)
		{
			rowsIdArray = new JSONArray();
			rowsIdArrayMap.put(sheetId, rowsIdArray);
		}

		if(index > rowsIdArray.size())
		{
			for( int i = rowsIdArray.size(); i < index ; i++)
			{
				rowsIdArray.add("");
			}
		}
		rowId2IndexMap.put(rowId, index);
		rowsIdArray.set(index-1, rowId);
		return rowId;
	}
	
	public void addEmptyColId(String sheetId, int index)
	{
		JSONArray colsIdArray = null;
		colsIdArray = colsIdArrayMap.get(sheetId);
		if(index < 1) return;
		if( null == colsIdArray || index > colsIdArray.size() || index < 1) return;
		colsIdArray.add(index-1, "");
		
	}
	// only using for increase the exitsing rowId index
	public void addEmptyRowId(String sheetId, int index)
	{
		JSONArray rowsIdArray = null;
		rowsIdArray = rowsIdArrayMap.get(sheetId);
		
		if(null == rowsIdArray || index > rowsIdArray.size() ||index < 1) return;
		rowsIdArray.add(index-1,"");
	}
	
	/*
	 * rowIndex start from 1 
	 */
	public int getRowIndexById(String sheetId, String rowId)
	{
		int rowIndex = -1;
		if(null == sheetId || null == rowId || 0 == sheetId.length()|| 0 == rowId.length())
		{
			return -1;
		}
		JSONArray rowsIdArray = rowsIdArrayMap.get(sheetId);
		if(null == rowsIdArray)
		{
			return -1;
		}
		rowIndex = rowsIdArray.indexOf(rowId) ;
		if(-1 == rowIndex)
		{
			return -1;
		}
		return rowIndex+1;
	}
	/*
	 * colIndex start from 1 
	 */
	public int getColIndexById(String sheetId, String colId)
	{
		int colInex = -1;
		if(null == sheetId || null == colId || 0 == sheetId.length()|| 0 == colId.length())
		{
			return -1;
		}
		JSONArray colsIdArray = colsIdArrayMap.get(sheetId);
		if(null == colsIdArray)
		{
			return -1;
		}
		colInex = colsIdArray.indexOf(colId) ;
		if( -1 == colInex)
		{
			return -1;
		}
		return colInex+1;
	}
	
	public String addRowId(String sheetId, int index)
	{
		String rowId = createRowId();

		JSONArray rowsIdArray = null;
		rowsIdArray = rowsIdArrayMap.get(sheetId);
		
		if(null == rowsIdArray)
		{
			rowsIdArray = new JSONArray();
			rowsIdArrayMap.put(sheetId, rowsIdArray);
		}

		if(index > rowsIdArray.size())
		{
			for( int i = rowsIdArray.size(); i < index ; i++)
			{
				rowsIdArray.add("");
			}
		}
		if(index < 1) return null;
		rowsIdArray.add(index-1, rowId);
		rowId2IndexMap.put(rowId, index);
		return rowId;
	}
	
}
