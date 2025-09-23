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

import java.util.ArrayList;
import java.util.Iterator;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.json.java.JSONObject;
import com.ibm.json.java.JSONArray;

public class IDManager {
  
    private static final Logger LOG = Logger.getLogger(IDManager.class.getName());

    private JSONObject _IDMap = new JSONObject ();
    private JSONObject _IDCache = new JSONObject ();
    private JSONArray _SheetIDArray = new JSONArray ();
    private JSONObject _SheetsMap = new JSONObject ();
    private int _maxRowIndex = 0;
    private int _maxColIndex = 0;
    private int _maxSheetIndex = 0;
    private String doc_id;
    
    public enum OPType { Sheet, Row, Column };
    
    private final static String ROWPrefix = "ro";
    private final static String COLUMNPrefix = "co";
    private final static String SHEETPrefix = "st";
    
    private final static String ROW = "row";
    private final static String COLUMN = "col";

    public IDManager (JSONObject state) {
      init (state, true);
    }

    /*
     * Make a copy of one IDManager
     * @param idm       IDManager that is to be copied
     */
    public IDManager (IDManager idm)
    {
        init2 (idm, null);
    }
    
    /*
     * Make a copy of one IDManager per sheet
     * @param idm             IDManager that is to be copied
     * @param sheetList       the sheets that will be copied
     */
    public IDManager (IDManager idm,ArrayList<String> sheetList) 
    {
        init2(idm, sheetList);
    }

    private void init2 (IDManager idm, ArrayList<String> list)
    {
        if(idm==null)
          return;
        
        try 
        {
          if (list == null) 
          {
            this._IDMap = JSONObject.parse(idm._IDMap.toString());
          } 
          else 
          {
            // per sheet instead
            this._IDMap = new JSONObject();
            for(int i=0;i<list.size();i++) 
            {
              String sheetName = list.get(i);
              String sheetId = idm.getSheetIdBySheetName(sheetName);
              JSONObject sheet = (JSONObject) idm._IDMap.get(sheetId);
              if (sheet != null) {
            	  JSONObject newSheet = new JSONObject();

            	  JSONArray rows = (JSONArray)sheet.get(ROW);
            	  JSONArray newRows = new JSONArray();
            	  if(rows!=null && rows.size()>0)
            		  newRows.addAll(rows);
            	  newSheet.put(ROW, newRows);
            	  
            	  JSONArray cols = (JSONArray)sheet.get(COLUMN);
            	  JSONArray newCols = new JSONArray();
            	  if(cols!=null && cols.size()>0)
            		  newCols.addAll(cols);
            	  newSheet.put(COLUMN, newCols);
            	  
                  this._IDMap.put(sheetId, newSheet);
              }
            }
          }
          this._SheetIDArray  = new JSONArray ();
          this._SheetIDArray.addAll(idm._SheetIDArray);
          this._SheetsMap = new JSONObject();
          this._SheetsMap.putAll(idm._SheetsMap);
       }
       catch (Exception e) 
       {
         LOG.log(Level.WARNING, "error when clone one IDManager", e);
       }
       this._maxRowIndex = idm._maxRowIndex;
       this._maxColIndex = idm._maxColIndex;
       this._maxSheetIndex = idm._maxSheetIndex;
    }
    /*
     * Construct IDManager with the spreadsheet JSON document
     * @param bOnlySheetMeta		true if only sheet info will be constructed
     */
    private void init (JSONObject state, boolean bOnlySheetMeta) 
    {
      if (state == null) return;
      
      JSONObject meta = (JSONObject) state.get("meta");
      JSONArray sheetsIdArray = (JSONArray) meta.get("sheetsIdArray");
      JSONObject sheetsArray = (JSONObject) meta.get("sheetsArray");
      JSONObject sheetsMap = (JSONObject) meta.get("sheets");
      doc_id = (String)state.get("doc_id");
            
      for (int i = 0; i < sheetsIdArray.size(); ++i) {
        String sheetId = (String) sheetsIdArray.get(i);
        adjustMaxIndexById (OPType.Sheet, sheetId);
        // init one sheet
        _SheetIDArray.add(i, sheetId);
        initSheetMap (sheetId);
      
        JSONObject sheet_info = (JSONObject) _SheetsMap.get(sheetId);
        JSONObject json_sheet_info = (JSONObject)sheetsMap.get(sheetId);
        sheet_info.put("sheetname", json_sheet_info.get("sheetname"));
        if (json_sheet_info.get("visibility") != null)
          sheet_info.put("visibility", json_sheet_info.get("visibility"));
        
        if (bOnlySheetMeta || sheetsArray == null) continue;
        JSONObject sheet = (JSONObject) sheetsArray.get(sheetId);
        if (sheet == null) continue;
        
        JSONArray rowsArray = (JSONArray) sheet.get("rowsIdArray");
        JSONArray colsArray = (JSONArray) sheet.get("columnsIdArray");

        JSONObject idmap = (JSONObject) _IDMap.get(sheetId);
        JSONObject idcache = (JSONObject) _IDCache.get(sheetId);
        
        if (rowsArray != null) {
          for (int j = 0; j < rowsArray.size(); ++j) {
            String rowId = (String) rowsArray.get(j);
            JSONArray r = (JSONArray) idmap.get(ROW);
            r.add(j, rowId);
            
            if (!rowId.equalsIgnoreCase("")) {
              JSONObject row = (JSONObject) idcache.get(ROW);
              row.put(rowId, j);
              
              adjustMaxIndexById (OPType.Row, rowId);
            }
          }
        }
        
        if (colsArray != null) {
          for (int j = 0; j < colsArray.size(); ++j) {
            String colId = (String) colsArray.get(j);
            JSONArray c = (JSONArray) idmap.get(COLUMN);
            c.add(j, colId);
            
            if (!colId.equalsIgnoreCase("")) {
              JSONObject col = (JSONObject) idcache.get(COLUMN);
              col.put (colId, j); 
              
              adjustMaxIndexById (OPType.Column, colId);
            }
          }
        }
      }
    }
    
    public String getDocID()
    {
      return this.doc_id;
    }
    
    private void clearCache (OPType type, String sheetId) 
    {
      if (sheetId == null) {
        _IDCache = new JSONObject ();
        return;
      }
      
      JSONObject idcache = (JSONObject) _IDCache.get(sheetId);
      if (idcache == null) return;
      JSONObject empty = new JSONObject ();
      
      switch (type) {
        case Sheet:
          _IDCache.remove(sheetId);
          break;
        case Row:
          idcache.put(ROW, empty);
          break;
        case Column:
          idcache.put(COLUMN, empty);
          break;
      }
    }
    
    private void adjustMaxIndexById (OPType type, String id) 
    {
      int maxIndex = 0;
      String prefix = "";
      
      switch (type) {
        case Sheet:
          prefix = SHEETPrefix;
          maxIndex = _maxSheetIndex;
          break;
        case Row:
          prefix = ROWPrefix;
          maxIndex = _maxRowIndex;
          break;
        case Column:
          prefix = COLUMNPrefix;
          maxIndex = _maxColIndex;
          break;
      }
      
      try {
        int index = Integer.parseInt( id.substring(prefix.length()) );
        maxIndex = (maxIndex <= index) ? (index+1) : maxIndex;
        switch (type) {
          case Sheet:
            _maxSheetIndex = maxIndex;
            break;
          case Row:
            _maxRowIndex = maxIndex;
            break;
          case Column:
            _maxColIndex = maxIndex;
            break;
        }
      } catch (Exception e) 
      {}
    }
    
    private void updateCache (OPType type, String sheetId, String id, int index) 
    {
      if (id == null) return;
      
      JSONObject idcache = (JSONObject) _IDCache.get(sheetId);
      if (idcache == null)  {
        _IDCache.put(sheetId, new JSONObject());
        idcache = (JSONObject) _IDCache.get(sheetId);
      }
      
      String targetType = null;
      switch (type) {
        case Row:
          targetType = ROW;
          break;
        case Column:
          targetType = COLUMN;
          break;
      }
      
      JSONObject r = (JSONObject) idcache.get(targetType);
      if (r == null){ 
    	r = new JSONObject();
        idcache.put(targetType, r);
      }
      r.put(id, index);      
    }
    
    private void initSheetMap (String sheetId) 
    {
      _IDMap.put(sheetId, new JSONObject());
      _IDCache.put(sheetId, new JSONObject());
      _SheetsMap.put(sheetId, new JSONObject());
      
      JSONObject sheet = (JSONObject) _IDMap.get(sheetId);
      sheet.put(ROW, new JSONArray());
      sheet.put(COLUMN, new JSONArray());
      
      JSONObject idcache = (JSONObject) _IDCache.get(sheetId);
      idcache.put(ROW, new JSONObject());
      idcache.put(COLUMN, new JSONObject());
    }
    
    /*
     * return IDMap for all sheets  
     */
    public JSONObject getIDMap ()
    {
      return _IDMap;
    }
    
    /*
     * return one array of sheetId
     */
    public JSONArray getSheetIDArray ()
    {
      return _SheetIDArray;
    }
    
    /*
     * return sheetsMap that associates sheetid with sheetName
     */
    public JSONObject getSheetsMap ()
    {
      return _SheetsMap;
    }
    
    /*
     * @param  bCreate  boolean indicating create new ID or not for this given 'rowIndex'
     * 
     * @return          new rowId
     *                  null if the sheet doesn't exist
     */
    public String getRowIdByIndex (String sheetId, int rowIndex, boolean bCreate) 
    {
      if (sheetId == null) return null;
      
      JSONObject sheet = (JSONObject) _IDMap.get(sheetId);
      if (sheet == null) return null;
      
      String rowId = null;
      JSONArray row = (JSONArray) sheet.get(ROW);
      int len = row.size();
      if (rowIndex >= 0 && rowIndex < row.size())
        rowId = (String) row.get(rowIndex);
      
      // create row Id when rowId == null or rowId == ""
      // update _IDMap
      if (bCreate && (rowId == null || rowId.equalsIgnoreCase(""))) {
        rowId = ROWPrefix + _maxRowIndex++;
        int fillCount = rowIndex - len + 1;
        for (int i = 0; i < fillCount; ++i)
          row.add(len+i, "");

        row.set(rowIndex, rowId);
      }
      
      updateCache(OPType.Row, sheetId, rowId, rowIndex);
      return rowId;
    }
    
    /*
     * @return      -1 if this row doesn't exist
     */
    public int getRowIndexById (String sheetId, String rowId) 
    {
      int rowIndex = -1;
      if (sheetId == null || rowId == null) return rowIndex;
      
      // find in cache first
      JSONObject sheet = (JSONObject) _IDCache.get(sheetId);
      if (sheet == null) 
        return rowIndex;
      
      JSONObject row = (JSONObject) sheet.get(ROW);
      Number oRowIndex = (Number)row.get(rowId);
      if (oRowIndex!=null) 
        rowIndex = oRowIndex.intValue();
      // found in cache
      if (rowIndex != -1) 
        return rowIndex;
      
      // find in map, and update cache
      sheet = (JSONObject) _IDMap.get(sheetId);
      if (sheet == null) 
        return rowIndex;
      
      JSONArray r = (JSONArray) sheet.get(ROW);
      if (r != null) {
        for (int i = 0; i < r.size(); ++i) {
          String id = (String) r.get(i);          
          if (rowId.equalsIgnoreCase(id)) {
            rowIndex = i;
            updateCache(OPType.Row, sheetId, rowId, rowIndex);
            break;
          }
        }
      }
      
      return rowIndex;
    }
    
    /*
     * insert count number of rows at rowIndex
     * the new inserted row does not have new id
     * use getRowIdByIndex with bCreate == true to get new row id instead
     */
    public void insertRowAtIndex (String sheetId, int rowIndex, int count) 
    {
      if (sheetId == null) return;
      
      JSONObject sheet = (JSONObject) _IDMap.get(sheetId);
      if (sheet == null) return;
      
      JSONArray row = (JSONArray) sheet.get(ROW);
      if (rowIndex >=0 && rowIndex < row.size()) {
        // insert row id in _IDMap
        for (int i = 0; i < count; i++)
          row.add(rowIndex, "");
        
        // clear _IDCache of this sheet
        clearCache (OPType.Row, sheetId);
      }
    }
    
    /*
     * delete count number of row at rowIndex
     */
    public void deleteRowAtIndex (String sheetId, int rowIndex, int count) 
    {
      if (sheetId == null) return;
      
      JSONObject sheet = (JSONObject) _IDMap.get(sheetId);
      if (sheet == null) return;
      
      JSONArray row = (JSONArray) sheet.get(ROW);
      if (rowIndex >= 0 && rowIndex < row.size()) {
        // delete row id in _IDMap
        int left = row.size() - rowIndex;
        count = (count > left) ? left : count;
         for (int i = 0; i < count; ++i)
          row.remove(rowIndex);
        
        // optimize the row id array
        for (int i = row.size() -1; i >= 0; --i) {
          String id = (String)row.get(i);
          if (!id.equalsIgnoreCase("")) break;
          
          row.remove(i);
        }
        // clear _IDCache of this sheet
        clearCache(OPType.Row, sheetId);
      }
    }
    
    /*
     * get column id by its index
     */
    public String getColIdByIndex (String sheetId, int colIndex, boolean bCreate) 
    {
      String colId = null;
      if (sheetId == null) return null;
      
      if (colIndex > 1024) {
        LOG.log(Level.WARNING, "Invalid column index: " + colIndex);
        return null;
      } 
      
      JSONObject sheet = (JSONObject) _IDMap.get(sheetId);
      if (sheet == null) return null;
      
      JSONArray col = (JSONArray) sheet.get(COLUMN);
      int len = col.size();
      if (colIndex >= 0 && colIndex < len)
        colId = (String) col.get(colIndex);
      
      // create col Id when colId == null or colId == ""
      // update _IDMap
      if (bCreate && (colId == null || colId.equalsIgnoreCase(""))) {
        colId = COLUMNPrefix + _maxColIndex++;
        
        int fillCount = colIndex - len + 1;
        for (int i = 0; i < fillCount; ++i)
          col.add(len+i, "");
        
        col.set(colIndex, colId);
      }
      
      // update cache if colId != null and colId != ""
      updateCache (OPType.Column, sheetId, colId, colIndex);
      
      return colId;
    }
    
    /*
     * @return      -1 if the column doesn't exist
     */
    public int getColIndexById (String sheetId, String colId) 
    {
      int colIndex = -1;
      
      if (sheetId == null || colId == null) 
        return colIndex;
      
      // find in cache first
      JSONObject sheet = (JSONObject) _IDCache.get(sheetId);
      if (sheet == null) 
        return colIndex;
      
      JSONObject col = (JSONObject) sheet.get(COLUMN);
      Number oColIndex = (Number)col.get(colId);
      if (oColIndex!=null) 
        colIndex = oColIndex.intValue();
      // found in cache
      if (colIndex != -1) 
        return colIndex;

      sheet = (JSONObject) _IDMap.get(sheetId);
      if (sheet == null) 
        return colIndex;
      
      JSONArray c = (JSONArray) sheet.get(COLUMN);
      if (c != null) {
        for (int i = 0; i < c.size(); ++i) {
          String id = (String) c.get(i);
          if (colId.equalsIgnoreCase(id)) {
            colIndex = i;
            updateCache (OPType.Column, sheetId, colId, colIndex);
            break;
          }
        }
      }
      
      return colIndex;
    }

    /*
     * insert count number of column at colIndex
     */
    public void insertColAtIndex (String sheetId, int colIndex, int count) 
    {
      if (sheetId == null) return;
     
      JSONObject sheet = (JSONObject) _IDMap.get(sheetId);
      if (sheet == null) return;
      
      JSONArray col = (JSONArray) sheet.get(COLUMN);
      if (colIndex >= 0 && colIndex < col.size()) {
        // insert column id in _IDMap
        for (int i = 0; i < count; ++i)
          col.add(colIndex, "");
        
        // clear _IDCache of this sheet
        clearCache (OPType.Column, sheetId);
      }
    }
    
    /*
     * delete count number of column at colIndex
     */
    public void deleteColAtIndex (String sheetId, int colIndex, int count) 
    {
      if (sheetId == null) return;
      
      JSONObject sheet = (JSONObject) _IDMap.get(sheetId);
      if (sheet == null) return;
      
      JSONArray col = (JSONArray) sheet.get(COLUMN);
      if (colIndex >= 0 && colIndex < col.size()) {
        // delete column id in _IDMap
        int left = col.size() - colIndex;
        count = (count > left) ? left : count;
        for (int i = 0; i < count; ++i)
          col.remove(colIndex);
        
        // optimize the col id array
        for (int i = col.size() - 1; i >= 0; --i) {
          String id = (String) col.get(i);
          if (!id.equalsIgnoreCase("")) break;
          
          col.remove(i);
        }
        
        // clear _IDCache of this sheet
        clearCache (OPType.Column, sheetId);
      }
    }
    
    /*
     * get the number of sheet in this document
     */
    public int getSheetCount ()
    {
      return _SheetsMap.size();
    }
    
    public int getVisibleSheetCount()
    {
      int count = 0;
      Iterator<Map.Entry<String, JSONObject>> iter = _SheetsMap.entrySet().iterator();
      while (iter.hasNext()) {
        Map.Entry<String, JSONObject> entry = (Map.Entry<String, JSONObject>) iter.next();
        JSONObject sheet_info = entry.getValue();
        
        if (sheet_info != null)
        { 
          String vis = (String)sheet_info.get("visibility");
          if (!ConversionConstant.SHEETHIDE.equals(vis) && !ConversionConstant.SHEETVERYHIDE.equals(vis))
            count++;
        }
      }
      
      return count;
    }
        
    /*
     * rename sheet
     */
    public void renameSheet (String oldName, String newName)
    {
      String sheetId = getSheetIdBySheetName (oldName);      
      if (sheetId == null) return;
      
//      String id = getSheetIdByName (newName);
//      if (id != null) return;

      JSONObject sheet_info = (JSONObject)_SheetsMap.get(sheetId);
      if (sheet_info != null)
    	  sheet_info.put("sheetname", newName);
    }
    
    /*
     * get sheet id by sheet name 
     */
    public String getSheetIdBySheetName (String sheetName)
    {
      String sheetId = null;
      if (sheetName == null) return sheetId;
     
      Iterator<Map.Entry<String, JSONObject>> iter = _SheetsMap.entrySet().iterator();
      while (iter.hasNext()) {
        Map.Entry<String, JSONObject> entry = (Map.Entry<String, JSONObject>) iter.next();
        JSONObject sheet_info = entry.getValue();
        if (sheet_info != null){
          String name = (String)sheet_info.get("sheetname");
          if (sheetName.equalsIgnoreCase(name)) {
            sheetId = entry.getKey();
            break;
          }
        }
      }
      
      return sheetId;
    }
    
    /*
     * get sheet name by sheet id
     */
    public String getSheetNameById (String sheetId)
    {
      if (sheetId == null) return null;
      
      JSONObject sheet_info =  (JSONObject)_SheetsMap.get(sheetId);
      if (sheet_info == null)
        return null;
      return (String)sheet_info.get("sheetname");
    }
    
    public boolean isSheetVisible (String sheetId)
    {
    	if (sheetId == null) return false;
    	
    	JSONObject sheet_info =  (JSONObject)_SheetsMap.get(sheetId);
        if (sheet_info == null)
          return false;
        
        String vis = (String)(sheet_info.get("visibility"));
        if (!ConversionConstant.SHEETHIDE.equals(vis) && !ConversionConstant.SHEETVERYHIDE.equals(vis))
        	return true;
        else
        	return false;        	
    }
    
    /*
     * @return     null if the sheet doesn't exist
     */
    public String getSheetIdByIndex (int sheetIndex, boolean bCreate) 
    {
      String sheetId = null;
      
      if (sheetIndex >= 0 && sheetIndex < _SheetIDArray.size()) {
        sheetId = (String) _SheetIDArray.get(sheetIndex);
      } else if (bCreate && sheetIndex == _SheetIDArray.size()) {
        sheetId = SHEETPrefix + _maxSheetIndex++;
        _SheetIDArray.add(sheetIndex, sheetId);
        initSheetMap(sheetId);
        // TODO need to put sheetName to _SheetsMap here
      }
      
      return sheetId;
    }
    
    /*
     * @return      -1 if the sheet isn't found
     */
    public int getSheetIndexById (String sheetId) 
    {
      int index = -1;
      if (sheetId == null) return index;
      
      for (int i=0; i < _SheetIDArray.size(); i++) {
        if (sheetId.equalsIgnoreCase((String)_SheetIDArray.get(i))) {
          index = i;
          break;
        }
      }
      
      return index;
    }

    /*
     * insert sheet at sheetIndex
     * @return      new sheet id
     */
    public String insertSheetAtIndex (int sheetIndex, String sheetName) 
    {
      String sheetId = null;
      
      if (sheetIndex < 0)
      {
    	  sheetIndex = 0;
      }
      
      if (sheetIndex > _SheetIDArray.size())
      {
    	  sheetIndex = _SheetIDArray.size();
      }
    	  	
      if (sheetIndex >= 0 && sheetIndex <= _SheetIDArray.size()) 
      {
        sheetId = SHEETPrefix + _maxSheetIndex++;
        _SheetIDArray.add(sheetIndex, sheetId);
        initSheetMap(sheetId);
        JSONObject sheet_info = (JSONObject)_SheetsMap.get(sheetId);
        sheet_info.put("sheetname", sheetName);        
      }
      
      return sheetId;
    }
    
    public void setSheetVisibility(String sheetName, String visibility)
    {      
      String sheetId = getSheetIdBySheetName(sheetName);
      JSONObject sheet_info = (JSONObject) _SheetsMap.get(sheetId);
      if (sheet_info != null){
        sheet_info.put("visibility",visibility);        
      }
    }
    
    /*
     * delete sheet at sheetIndex
     */
    public void deleteSheetAtIndex (int sheetIndex) 
    {
      if (sheetIndex >= 0 && sheetIndex < _SheetIDArray.size()) {
        String sheetId = (String)_SheetIDArray.remove(sheetIndex);
        _IDMap.remove(sheetId);
        _SheetsMap.remove(sheetId);
        clearCache (OPType.Sheet, sheetId);
      }
    }
    
    /*
     * move sheet to targetIndex
     */
    public void moveSheet (String sheetId, int targetIndex) 
    {
      if (targetIndex >= 0 && targetIndex < _SheetIDArray.size()) {
        int curIndex = getSheetIndexById (sheetId);
        if (curIndex != -1) {
          if (curIndex != targetIndex) {
            _SheetIDArray.remove(curIndex);
            _SheetIDArray.add(targetIndex, sheetId);
          }
        }
      }
    }
    
   public JSONObject getIDCache(String sheetId, String type)
	{
		_prepareCache(sheetId, type);
		JSONObject sheet = (JSONObject) _IDCache.get(sheetId);
		if(sheet == null) return null;
		JSONObject ret = null;
		if(type == ROW)
			ret = (JSONObject) sheet.get(ROW);
		else if(type == COLUMN)
			ret =(JSONObject) sheet.get(COLUMN);
		return ret;
	}
	/*
	 * build up the id -> index map
	 * if type is row, build up the rowid ->index map
	 * if type is col, build up the colid ->index map
	 * if type is sheet, build both rowid and colid map
	 */
	private void _prepareCache(String sheetId, String type)
	{
//		JSONObject sheet = (JSONObject) _IDCache.get(sheetId);
//		if(sheet == null)
//		{
//			sheet = new JSONObject();
//			
//			JSONArray newRows = new JSONArray();
//  		  	sheet.put(ROW, newRows);
//			
//  		  	JSONArray newCols = new JSONArray();
//		  	sheet.put(COLUMN, newCols);
//		  	
//		  	_IDCache.put(sheetId, sheet);
//		}
		JSONObject indexSheet = (JSONObject)_IDMap.get(sheetId);
		if (indexSheet == null) 
		    return;
		
		if(type == ROW)
		{
			JSONArray rowIdxArray = (JSONArray)indexSheet.get(ROW);
			if (rowIdxArray != null) {
		        for (int i = 0; i < rowIdxArray.size(); ++i) {
		           String id = (String) rowIdxArray.get(i); 
		           updateCache(OPType.Row, sheetId, id, i);
		        }
			}
		}
		if(type == COLUMN)
		{
			 JSONArray colIdxArray = (JSONArray) indexSheet.get(COLUMN);
		      if (colIdxArray != null) {
		        for (int i = 0; i < colIdxArray.size(); ++i) {
		           String id = (String) colIdxArray.get(i);
		           updateCache (OPType.Column, sheetId, id, i);
		        }
		      }
		}
	}
    /*
     * Construct one IDMananger object from one meta object in json 
     * @param state       json meta object (see meta.js for reference)
     * @return            IDManager instance       
     */
    public static IDManager fromJSON(JSONObject state)
    {
      return new IDManager (state);
    }
    
    /*
     * Construct json object from one IDManager object
     * @param idm         the IDManager object to be serialized
     * @return            json meta object
     *                    empty json object if idm is null
     */
    public static JSONObject toJSON(IDManager idm)
    {
       JSONObject state = new JSONObject();
       if (idm == null) return state;
       
       JSONObject meta = new JSONObject();
       state.put("meta", meta);
       
       JSONArray sheetsIdArray = new JSONArray ();
       meta.put("sheetsIdArray", sheetsIdArray);
       
       JSONArray idArray = idm.getSheetIDArray();
       for (int i = 0; i < idArray.size(); ++i)
         sheetsIdArray.add(i, sheetsIdArray.get(i));
       
       JSONObject sheetsArray = new JSONObject();
       meta.put("sheetsArray", sheetsArray);
       
       JSONObject idMap = idm.getIDMap();
       for (int i = 0; i < sheetsIdArray.size(); ++i) {
         String sheetId = (String) sheetsIdArray.get(i);
         JSONObject sheet = new JSONObject();
         sheetsArray.put(sheetId, sheet);
         
         JSONArray rowsIdArray = new JSONArray();
         sheet.put("rowsIdArray", rowsIdArray);
         JSONArray columnsIdArray = new JSONArray();
         sheet.put("columnsIdArray", columnsIdArray);
         
         JSONObject m = (JSONObject) idMap.get(sheetId);         
         JSONArray rows = (JSONArray) m.get("row");
         for (int j = 0; j < rows.size(); ++j)
           rowsIdArray.add(rows.get(j));
         
         JSONArray cols = (JSONArray) m.get("col");
         for (int j = 0; j < cols.size(); ++j)
           columnsIdArray.add(cols.get(j));
       }
       
       JSONObject sheetsMap = new JSONObject();
       meta.put("sheets", sheetsMap);
       
       JSONObject map = idm.getSheetsMap();
       for (int i = 0; i < sheetsIdArray.size(); ++i) {
         String sheetId = (String) sheetsIdArray.get(i);
         JSONObject obj = new JSONObject ();
         sheetsMap.put(sheetId, obj);
         
         JSONObject sheet_info = (JSONObject)map.get(sheetId);
         String sheetname = (String)sheet_info.get("sheetname");
         obj.put("sheetname", sheetname);
         if (sheet_info.get("visibility") != null)
           obj.put("visibility", sheet_info.get("visibility"));
       }
       
       return state;
    }
}