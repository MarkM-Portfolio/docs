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

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

/*only for set unnamerange msg*/
public class RangeMsg extends Message {
	private static final Logger LOG = Logger.getLogger(RangeMsg.class.getName());
	
	protected Map<TokenId, Object> rangeDataByID = null;

	protected Map<TokenId, Object> colsMeta = null;
	
	protected JSONObject tranformedRangeData = null;
	protected JSONObject colsMetaData = null; 
	protected String _type = null;
	protected JSONArray events = null;
	protected boolean _bColumn = false;
	private boolean _bRow = false;
	private boolean bSheet = false;
	
	private final static String ROW = "row";
    private final static String COLUMN = "col";
	
	public RangeMsg(JSONObject jsonEvent, IDManager idm) {
		super(jsonEvent, idm);
		
		JSONObject jsonData = (JSONObject) jsonEvent.get(ConversionConstant.DATA);
		if(jsonData != null)
		{
			if(jsonData.get(ConversionConstant.STYLE_A) != null)
			{
				boolean br = false;
				if(jsonData.get(ConversionConstant.IS_REPLACE) != null)
					br = (Boolean)jsonData.get(ConversionConstant.IS_REPLACE);
				if(!br)
					_type = "style";
			}
			if(_type == null && jsonData.get(ConversionConstant.RANGE_USAGE) != null)
			{
				_type = (String)jsonData.get(ConversionConstant.RANGE_USAGE); //for set image event
			}
			if(jsonData.get(ConversionConstant.IS_COLUMN) !=null)
			{
				_bColumn = (Boolean)jsonData.get(ConversionConstant.IS_COLUMN);
			}
			if(jsonData.get(ConversionConstant.IS_ROW) !=null)
			{
				_bRow = (Boolean)jsonData.get(ConversionConstant.IS_ROW);
			}
			JSONObject data = (JSONObject) jsonData.get(ConversionConstant.DATA);
			if(data != null && data.containsKey(ConversionConstant.FOR_SHEET)){
				bSheet = (Boolean)data.get(ConversionConstant.FOR_SHEET);
			}
		}
		events = new JSONArray();
	}
	
	public void transformData()
	{
	  JSONObject jsonData = (JSONObject) data.get(ConversionConstant.DATA);
	  if(jsonData != null)
      {
	    RangeDataUtil.transformData(jsonData, true);
      }
	}
	
	public JSONArray getEvents(IDManager idm)
	{
		//transform message from id to index with the latest version of temporary IDManager 
		splitedRangesToJSON(idm);
		return events;
	}
	
	/***
	 * Transform the range data from index to id using the given id manager
	 */
	public void transformDataByIndex(IDManager idm) {

		JSONObject o = (JSONObject) data.get(ConversionConstant.DATA);
	    if (_bColumn)
        {
           JSONObject obj = (JSONObject) o.get(ConversionConstant.COLUMNS);
           if (obj != null)
           {
             this.colsMeta = this.columnsMeta2Id(obj, idm);
           }
        }
	    
		JSONObject rangeData = (JSONObject) o.get(ConversionConstant.ROWS);
		
		if (rangeData == null || rangeData.size()==0)
			return;
		
		rangeDataByID = new HashMap<TokenId, Object>();
		Iterator rowItor = rangeData.entrySet().iterator();
		while (rowItor.hasNext()) {
			java.util.Map.Entry entry = (java.util.Map.Entry) rowItor.next();
			int rowIndex = Integer.valueOf((String) entry.getKey());
			JSONObject rowJson = (JSONObject) entry.getValue();
			
			//fillRowUseId(rangeDataUseID,entry,idm);
			String sheetName = refTokenId.getToken().getSheetName();
			RangeDataUtil.fillRowsUseId(rangeDataByID, sheetName, rowIndex, rowJson, idm);
		}
	}
	
  private Map<TokenId, Object> columnsMeta2Id(JSONObject obj, IDManager idm)
  {
    String sheetName = refTokenId.getToken().getSheetName();
    Map<TokenId, Object> ret = new HashMap<Message.TokenId, Object>();
    Set<Entry<String, Object>> entries = obj.entrySet();
    for (Iterator iterator = entries.iterator(); iterator.hasNext();)
    {
      Entry<String, Object> entry = (Entry<String, Object>) iterator.next();
      String colName = entry.getKey();
      JSONObject colJson = (JSONObject)entry.getValue();
      int repeateNum = 0;
      Object repNumObj = colJson.get(ConversionConstant.REPEATEDNUM_A);
      if(null != repNumObj)
        repeateNum = Integer.parseInt(repNumObj.toString());
      int sCol = ReferenceParser.translateCol(colName);
      int eCol =  sCol + repeateNum;
      String eColName = ReferenceParser.translateCol(eCol);
      String refValue = sheetName + "!" + colName + ":" + eColName;
      Token token = new Token(refValue, null, OPType.Column);
      TokenId tokenId = new TokenId(token, idm);
      ret.put(tokenId, colJson);
    }
    return ret;
  }
	

    protected JSONObject columnsMeta2Index(Map<TokenId, Object> colsMap, IDManager idm)
    {
      if(null == colsMap) return null;
      String sheetName = refTokenId.getToken().getSheetName();
      JSONObject ret = new JSONObject();
      Set<Entry<TokenId, Object>> entries = colsMap.entrySet();
      for (Iterator iterator = entries.iterator(); iterator.hasNext();)
      {
        Entry<TokenId, Object> entry = (Entry<TokenId, Object>) iterator.next();
        TokenId tokenId = entry.getKey();
        tokenId.updateToken(idm);
        Token token = tokenId.getToken();
        int colIndex = token.getStartColIndex();
        if(colIndex < 0) continue; 
        int eColIndex = token.getEndColIndex();
        int repNum = eColIndex - colIndex;
        JSONObject colJson = (JSONObject)entry.getValue();
        colJson.put(ConversionConstant.REPEATEDNUM_A, repNum);
        ret.put(ReferenceParser.translateCol(colIndex + 1),colJson);
      }
      return ret;
    }
    
  private JSONObject getColJsonByIndex(int index, JSONObject colsMap, IDManager idm)
  {
    if (null == colsMap)
      return null;
    JSONObject ret = null;
    JSONObject colJson = (JSONObject) colsMap.get(String.valueOf(index));
    try
    {
      if (colJson != null)
      {
        ret = JSONObject.parse(colJson.toString());
      }
      else
      {
        Set keys = colsMap.keySet();
        Iterator it = keys.iterator();
        for (; it.hasNext();)
        {
          String key = (String) it.next();
          int scIndex = ReferenceParser.translateCol(key);
          colJson = (JSONObject) colsMap.get(key);
          int repeatedNum = 0;
          Object colRepeat = colJson.get(ConversionConstant.REPEATEDNUM_A);
          if (colRepeat != null)
            repeatedNum = Integer.valueOf(colRepeat.toString());
          int ecIndex = scIndex + repeatedNum;
          if (index >= scIndex && index <= ecIndex)
          {
            ret = JSONObject.parse(colJson.toString());
            ret.put(ConversionConstant.REPEATEDNUM_A, (ecIndex - index));
            break;
          }
        }
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "error when set unnamerange to json", e);
    }
    return ret;
  }
    
    protected JSONArray getColsMetaArray(JSONArray colRanges, JSONObject colsJson,IDManager idm)
    {
      JSONArray ret = null;
      if(this._bColumn)
      {
        ret = new JSONArray();
        for(int i = 0; i < colRanges.size(); i++)
        {
          JSONObject colRange = (JSONObject)colRanges.get(i);
          int scIndex = (Integer)colRange.get("startCol");
          int ecIndex = (Integer)colRange.get("endCol");
          
          JSONObject colsMap = new JSONObject();
          int cIndex = scIndex;
          while(cIndex <= ecIndex)
          {
            JSONObject colJson = this.getColJsonByIndex(cIndex, colsJson, idm);
            if(null != colJson)
            {
              Object colRepeat = colJson.get(ConversionConstant.REPEATEDNUM_A);
              int repeatedNum = Integer.valueOf(colRepeat.toString());
              int curECol = (cIndex + repeatedNum) < ecIndex ? (cIndex + repeatedNum):ecIndex;
              repeatedNum = curECol - cIndex;
              colJson.put(ConversionConstant.REPEATEDNUM_A, repeatedNum);
              String strCol = ReferenceParser.translateCol(cIndex);
              colsMap.put(strCol, colJson);
              cIndex = curECol + 1;
            } 
            else
              cIndex++;
          }  
          ret.add(colsMap);
        }
      }  
      return ret;
    }
    
	public boolean transformDataById(IDManager idm) {
	     if(this._bColumn )
	          colsMetaData = this.columnsMeta2Index(this.colsMeta, idm);
	     
		if (rangeDataByID == null || rangeDataByID.size()==0)
			return true;
		
		tranformedRangeData = new JSONObject();
		Iterator rowItor = rangeDataByID.entrySet().iterator();
		while (rowItor.hasNext()) {
			java.util.Map.Entry entry = (java.util.Map.Entry) rowItor.next();
			TokenId tokenid = (TokenId) entry.getKey();
			Map<String, Object> rowDataUseId = (Map<String, Object>) entry.getValue();
			
			//fillRowUseIndex(tranformedRangeData,  entry, idm);
			RangeDataUtil.fillRowsUseIndex(tranformedRangeData, tokenid, rowDataUseId, idm);
		}
		return true;
	}

  protected JSONArray _getRangesIndex(String[] idRange, String type, IDManager idm)
  {
    String sheetId = refTokenId.getSheetId();
    JSONArray newRange = new JSONArray();

    int i = 0;
    int length = idRange.length;
    int[] rangeIndex = new int[length];

    // for perfermance issue, when the idRange >= 100
    // first we prepare the id -> index cache
    if (length >= 100)
    {
      JSONObject idMap = idm.getIDCache(sheetId, type);
      if (idMap == null)
        return newRange;
      for (; i < length; i++)
      {
        String id = idRange[i];
        int index = -1;
        if (idMap.get(id) != null)
          index = (Integer) idMap.get(id);
        if (index != -1)
          index++;
        rangeIndex[i] = index;
      }
    }
    else
    {
      for (; i < length; i++)
      {
        String id = idRange[i];
        int index = -1;
        if (type.equals(COLUMN))
          index = idm.getColIndexById(sheetId, id);
        else
          index = idm.getRowIndexById(sheetId, id);
        if (index != -1)
          index++;
        rangeIndex[i] = index;
      }
    }

    // find the first valid index
    for (i = 0; i < length; i++)
    {
      if (rangeIndex[i] != -1)
        break;
    }
    if (i == length)
      return newRange;// there is not valid index
    int sIndex = rangeIndex[i];
    int eIndex = sIndex;
    for (i = i + 1; i < length; i++)
    {
      if (rangeIndex[i] != -1)
      {
        if (rangeIndex[i] == eIndex + 1)
        {
          eIndex = rangeIndex[i];
        }
        else
        {
          JSONObject item = new JSONObject();
          if (type.equals(COLUMN))
          {
            if (eIndex > ConversionConstant.MAX_COL_NUM)
              eIndex = ConversionConstant.MAX_COL_NUM;
            item.put("startCol", sIndex);
            item.put("endCol", eIndex);
          }
          else
          {
            item.put("startRow", sIndex);
            item.put("endRow", eIndex);
          }
          newRange.add(item);
          sIndex = rangeIndex[i];
          eIndex = sIndex;
        }
      }
    }
    JSONObject item = new JSONObject();
    if (type.equals(COLUMN))
    {
      if (eIndex > ConversionConstant.MAX_COL_NUM)
        eIndex = ConversionConstant.MAX_COL_NUM;
      item.put("startCol", sIndex);
      item.put("endCol", eIndex);
    }
    else
    {
      item.put("startRow", sIndex);
      item.put("endRow", eIndex);
    }

    newRange.add(item);

    return newRange;
  }
	//get the new range array in case there are insert row/column event happens
	protected JSONArray _getRangesIndex(String type, IDManager idm)
	{
		String[] idRange = refTokenId.getRowIdRange();		
		if(type.equals(COLUMN))
			idRange = refTokenId.getColIdRange();
		return this._getRangesIndex(idRange,type, idm);
	}
	
	/*
	 * return the rowjosn in jRowsMap, the index is between the srIndex and erIndex
	 */
	protected JSONObject getRowJsonByIndex(int index, JSONObject jRowsMap, IDManager idm)
	{
	    if(null == jRowsMap) return null;
		JSONObject ret = null;
		JSONObject jRow = (JSONObject)jRowsMap.get(String.valueOf(index));
		try
		{
			if(jRow != null)
			{
				ret = JSONObject.parse(jRow.toString());
			}
			else
			{
				Set keys = jRowsMap.keySet();
				Iterator it = keys.iterator();
				for(;it.hasNext();)
				{
					String key = (String)it.next();
					int srIndex = Integer.parseInt(key);				
					jRow = (JSONObject)jRowsMap.get(key);
					int repeatedNum = 0;
					Object rowrepeat = jRow.get(ConversionConstant.REPEATEDNUM_A);
					if(rowrepeat != null)
						repeatedNum = Integer.valueOf(rowrepeat.toString());
					int erIndex = srIndex + repeatedNum;
					if( index >= srIndex && index <= erIndex)
					{
						ret = JSONObject.parse(jRow.toString());
						ret.put(ConversionConstant.REPEATEDNUM_A, (erIndex-index));
						break;
					}
				}
			}
		} catch (Exception e) {
			LOG.log(Level.WARNING, "error when set unnamerange to json", e);
		}
		return ret;
	}
		
     /*
	 * return the range json in rowsMap(contains the row json from start row to end row)
	 * the range column index is from start col to end col
	 */
	protected JSONObject getCellsJsonByIndex(int scIndex, int ecIndex, Map rowsMap)
	{
		if(null == rowsMap) return null;
		JSONObject rows = new JSONObject();
		Set keys = rowsMap.keySet();
		Iterator it = keys.iterator();
		for(;it.hasNext();)
		{
			Object key = it.next();
			JSONObject row =(JSONObject)rowsMap.get(key);
			JSONObject cells = null;
			JSONObject cellsJSON = new JSONObject();
			JSONObject rowJSON = new JSONObject();
			if(row.get(ConversionConstant.REPEATEDNUM_A) != null)
				rowJSON.put(ConversionConstant.REPEATEDNUM_A, row.get(ConversionConstant.REPEATEDNUM_A));
			if(row.get(ConversionConstant.CELLS) != null)
				cells = (JSONObject)row.get(ConversionConstant.CELLS);
			
			if(_bRow && row.get(ConversionConstant.VISIBILITY_A) != null)
				rowJSON.put(ConversionConstant.VISIBILITY_A,row.get(ConversionConstant.VISIBILITY_A)) ;
			
			//start - if the range contains whole row(s), set the row height
            if(row.get(ConversionConstant.HEIGHT_A) != null && scIndex==1 && ecIndex== ConversionConstant.MAX_COL_NUM){
                rowJSON.put(ConversionConstant.HEIGHT_A , row.get(ConversionConstant.HEIGHT_A));
            }            
          //end - set row height
            rows.put(String.valueOf(key), rowJSON);            
			rowJSON.put(ConversionConstant.CELLS, cellsJSON);
			int cIndex = scIndex;
			while(cIndex <= ecIndex)
			{
				String strCol = ReferenceParser.translateCol(cIndex);
				JSONObject cell = null;
				JSONObject tmpCell = (JSONObject)cells.get(strCol);
				try
				{
					if(tmpCell != null)
					{					
						cell = JSONObject.parse(tmpCell.toString());
					}
					else
					{
						Set cs = cells.keySet();
						Iterator csit = cs.iterator();
						for(;csit.hasNext();)
						{
							String c = (String)csit.next();
							int sc = ReferenceParser.translateCol(c);
							JSONObject ce = (JSONObject)cells.get(c);
							int repeatedNum = 0;
							Object cellrepeat = ce.get(ConversionConstant.REPEATEDNUM_A);
							if(cellrepeat != null)								
								repeatedNum = Integer.valueOf(cellrepeat.toString());
							int ec = sc + repeatedNum;
							if( cIndex >= sc && cIndex <= ec)
							{
								cell = JSONObject.parse(ce.toString());
								cell.put(ConversionConstant.REPEATEDNUM_A, (ec-cIndex));
								break;
							}
						}
					}
					if(cell != null)
					{
						int repeatedNum = 0;
						Object cellrepeat = cell.get(ConversionConstant.REPEATEDNUM_A);
						if(cellrepeat != null)
							repeatedNum = Integer.valueOf(cellrepeat.toString());
						int end = cIndex + repeatedNum;
						if(end > ecIndex)
						{
							repeatedNum = ecIndex - cIndex;
//							if(repeatedNum > 0)
							cell.put(ConversionConstant.REPEATEDNUM_A, repeatedNum);
						}
						cellsJSON.put(strCol, cell);
						cIndex += repeatedNum;
					}
					cIndex++;				
				}
				catch (Exception e) 
			    {
					LOG.log(Level.WARNING, "error when set unnamerange to json", e);
			    }
			}
		}		
		return rows;
	}
	
	private void splitedRangesToJSON(IDManager idm) {
		if(ConversionConstant.USAGE_IMAGE.equals(_type) || ConversionConstant.USAGE_SHAPE.equals(_type) || ConversionConstant.USAGE_CHART.equals(_type) || ConversionConstant.USAGE_COMMENTS.equals(_type)){//don't split range for image,follow the original logic
			events = null;
			return;
		}
		String sheetId = refTokenId.getSheetId();
		String sheetName = idm.getSheetNameById(sheetId);
		
		JSONArray rowRanges = _getRangesIndex(ROW, idm);
		JSONArray colRanges = _getRangesIndex(COLUMN, idm);
		
		JSONArray colsMetaArray = this.getColsMetaArray(colRanges, colsMetaData, idm);
		
		JSONObject jRowsMap = tranformedRangeData;
		
		boolean useRows = _type == null || !(_type.equals("style"));
		for(int i = 0; i < rowRanges.size(); i++)
		{
			JSONObject rowRange = (JSONObject)rowRanges.get(i);
			int srIndex = (Integer)rowRange.get("startRow");
			int erIndex = (Integer)rowRange.get("endRow");
			
			//get row event
			Map rowsMap = new HashMap<Integer, JSONObject>();
			//if type is style, does not need to get row json
			if(useRows)
			{
				int rIndex = srIndex;
				while(rIndex <= erIndex)
				{
					JSONObject row = getRowJsonByIndex(rIndex,jRowsMap,idm);
					if(row != null)
					{
						int rowRepNum = 0;
						Object rowrepeat = row.get(ConversionConstant.REPEATEDNUM_A);
						if(rowrepeat != null)
							rowRepNum = Integer.valueOf(rowrepeat.toString());
						int rowERIndex = rIndex + rowRepNum;
						int curERIndex = (rowERIndex <= erIndex)?rowERIndex:erIndex;
						int curRpeNum = curERIndex - rIndex;
//						if(curRpeNum > 0)
						row.put(ConversionConstant.REPEATEDNUM_A, curRpeNum);
						rowsMap.put(rIndex, row);
						rIndex = curERIndex + 1;
					}else
						rIndex++;
				}
			}
			
			// we are going to parse the whole data string to clone a new json.
			// remove the rows data as we do not use it.
			JSONObject origData = (JSONObject) data.get(ConversionConstant.DATA);
			Object origCells = null;
			if (origData != null)
			{
    			origCells = origData.get(ConversionConstant.ROWS);
    			
    			if(useRows && origCells != null)
    			{
    			  origData.remove(ConversionConstant.ROWS);
    			}
			}
			for(int j = 0; j <  colRanges.size(); j++)
			{
				JSONObject colRange = (JSONObject)colRanges.get(j);
				int scIndex = (Integer)colRange.get("startCol");
				int ecIndex = (Integer)colRange.get("endCol");
				
				JSONObject event;
				try 
				{
					event = JSONObject.parse(data.toString());
					
					String sc = ReferenceParser.translateCol(scIndex);
					String ec = sc;
					if(ecIndex > scIndex)
						ec = ReferenceParser.translateCol(ecIndex);
					
					JSONObject reference = (JSONObject) event.get(ConversionConstant.REFERENCE);
					String value;
					if( (erIndex > srIndex) || (ecIndex > scIndex) ) 
						value = ReferenceParser.getAddressByIndex(sheetName, srIndex, sc,null,erIndex,ec,ConversionConstant.RANGE_REFERENCE);
					else
						value = ReferenceParser.getAddressByIndex(sheetName, srIndex, sc,null,srIndex,sc,ConversionConstant.CELL_REFERENCE);
	
					reference.put(ConversionConstant.REF_VALUE, value);
					
					//construct event that only contains the cell from start col to end col, start row to end row
					if(useRows)
					{
						JSONObject cells = getCellsJsonByIndex(scIndex, ecIndex, rowsMap);
						JSONObject o = (JSONObject) event.get(ConversionConstant.DATA);
						if (_bColumn)
						{
						  o.put(ConversionConstant.COLUMNS, (JSONObject)colsMetaArray.get(j));
						  if(i != 0)
						    o.put(ConversionConstant.IS_FOLLOW_PART, true);
						}
						o.put(ConversionConstant.ROWS, cells);					
					}
					//else if type == STYLE, set the style for split range
					events.add(event);
				} catch (Exception e) {
					LOG.log(Level.WARNING, "error when set unnamerange to json", e);
				}
			}
			
			// put it back
		    if(useRows && origCells != null)
	        {
	           origData.put(ConversionConstant.ROWS, origCells);
	        }
		}
	}
	
	public void setData() {
		JSONObject jsonEvent = data;
        JSONObject o = (JSONObject) jsonEvent.get(ConversionConstant.DATA);
		if (tranformedRangeData != null && tranformedRangeData.size() > 0) {
			o.put(ConversionConstant.ROWS, tranformedRangeData);
		}
		if(this._bColumn && colsMetaData != null)
		{
		  o.put(ConversionConstant.COLUMNS, colsMetaData);
		}
	}
	
	public String setRefValue(IDManager idm) {
		Token token = refTokenId.getToken();
		return token.toString(bSheet);
	}
}