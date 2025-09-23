package com.ibm.concord.writer.model;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Logger;

import com.ibm.concord.writer.TrackChangeCleaner;
import com.ibm.concord.writer.message.MessageUtil;
import com.ibm.concord.writer.message.impl.CheckModel.SelfCheckAble;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Table extends ModelObject implements SelfCheckAble{

	public final static String BIDI_VISUAL = "bidiVisual";

	public boolean checkTrackChange(long timeAgo)
	{
		JSONArray ch = (JSONArray) this.jsonobj.get("ch");
		boolean isTableDeleted = isTrackDeleted(ch, timeAgo, true);
		if (isTableDeleted)
			return true;
		Iterator<TableRow> rowIterator = rows.iterator();
		List<TableRow> toDelete = new ArrayList<TableRow>();
		while(rowIterator.hasNext())
		{
			TableRow row = rowIterator.next();
			JSONArray rowCh = (JSONArray) row.jsonobj.get("ch");
			boolean isRowDeleted = isTrackDeleted(rowCh, timeAgo, true);
			
			if (isRowDeleted)
				toDelete.add(row);
		}
		for(TableRow row : toDelete)
		{
			removeRow(row);
		}
		if (rows.isEmpty())
			return true;
		
		for(TableRow row : rows)
		{
			for(TableCell cell: row.cells)
			{
				JSONArray cellContent = (JSONArray) ((JSONObject) cell.jsonobj).get("ps");

				if (cellContent == null)
				{
				  cellContent = new JSONArray();
				  cell.jsonobj.put("ps", cellContent);
				}
				else
				  TrackChangeCleaner.clean(cellContent, timeAgo);

				if (cellContent.isEmpty())
				{
				  cellContent.add(createEmptyParagraph());
				}
				cell.setContent(cellContent);
			}
		}
		
		
		return false;
	}
	
	
	private List<TableRow> rows = new ArrayList<TableRow>();
	private static final Logger LOG = Logger.getLogger(Table.class.getName());

	Table(JSONObject jsonobj) {
		super(jsonobj);
		this.modelType = "table";
		this.initRow();
	}
	private void initRow(){
		JSONArray children = (JSONArray)((JSONObject)this.jsonobj).get("trs");
		for(int i=0;i< children.size();i++){
			TableRow row = new TableRow((JSONObject)children.get(i),this);
			this.rows.add(row);
		}
	}
	public TableRow getRow(int idx){
		return this.rows.get(idx);
	}
	public TableCell getCell(int rowIdx,int colIdx){
		TableRow row = this.getRow(rowIdx);
		if(row!=null){
			return row.getCell(colIdx);
		}
		return null;
	}
	
	
	public TableRow nextRow(TableRow row){
		int idx = this.rows.indexOf(row);
		if(this.rows.size()-1==idx){
			return null;
		}
		return this.rows.get(idx+1);
	}
	public TableRow preRow(TableRow row){
		int idx = this.rows.indexOf(row);
		if(idx==0){
			return null;
		}
		return this.rows.get(idx-1);
	}
	
	
	@Override
	public void insertElement(int index, JSONObject element){
		JSONArray children = (JSONArray)((JSONObject)this.jsonobj).get("trs");
		children.add(index, element);
	}

	@Override
	public void setAttributes(JSONObject atts) {
		JSONArray cols = (JSONArray)atts.get("cols");
		if ( cols != null){
			//set cols
			//this.jsonobj.remove("tblGrid");
			this.jsonobj.put("tblGrid", cols);
		}
        if (atts.containsKey("ch"))
        {
            Object c = atts.get("ch");
            if (c == null || (c instanceof String))
                this.jsonobj.remove("ch");
            else
              this.jsonobj.put("ch", c);
        }
	}
	public void setTaskId(String tid) {
		this.jsonobj.put("taskId", tid);
	}
	@Override
	public void setStyle(JSONObject styles) {
		String bidiVisual = (String)styles.get(BIDI_VISUAL);
		if(bidiVisual != null) {
			JSONObject tblPr = (JSONObject)this.jsonobj.get("tblPr");
			JSONObject value = new JSONObject();
			value.put("val", bidiVisual);				
			tblPr.put(BIDI_VISUAL, value);
		}
	}
	@Override
	public void deleteElement(int index) {
		JSONArray children = (JSONArray)((JSONObject)this.jsonobj).get("trs");
		children.remove(index);		
	}
	public void removeRow(int index){
		this.rows.remove(index);
		this.deleteElement(index);
	}
	public void removeRow(TableRow row){
		int index = this.rows.indexOf(row);
		if(index>=0){
			this.removeRow(index);
		}
	}
	
	public void insertRow(JSONObject newRow,int idx,JSONObject fixCells){
		TableRow row = new TableRow(newRow, this);
		TableRow nextRow = null;
		if(this.rows.size()>idx){
			nextRow = this.getRow(idx);
		}
		this.insertElement(idx, newRow);
		this.rows.add(idx,row);
		
		if(nextRow==null&&(fixCells!=null && !fixCells.isEmpty())){
			LOG.warning("Table::insertRow -> the message is not right");
			return;
		}
		if(nextRow!=null && fixCells!=null && !fixCells.isEmpty()){
			Iterator<String> iterator = fixCells.keySet().iterator();
			while(iterator.hasNext()){
				String key = iterator.next();
				int index = Integer.parseInt(key);
				TableCell cell = nextRow.getCell(index);
				cell.toMerge();
			}
		}		
		if(idx>0){
			TableRow prevRow = this.rows.get(idx-1);
			if(row.cells.size()!=prevRow.cells.size()){
				LOG.warning("Table::insertRow -> the table struct is not right");
				return;
			}
			for(int i=0;i< row.cells.size();i++){
				TableCell cell = prevRow.cells.get(i);
				if(row.cells.get(i).isMerged()&&( !cell.isMergedStart()&&!cell.isMerged())){
					cell.setMergedStart();
				}
			}
		}
		
	}
	public void deleteRow(int idx,JSONObject fixCells){
		TableRow nextRow = null;
		if(this.rows.size()>idx+1){
			nextRow = this.getRow(idx+1);
		}
		this.rows.remove(idx);
		this.deleteElement(idx);
		if(nextRow==null||fixCells==null||fixCells.isEmpty()){
			if(nextRow==null&&(fixCells!=null && !fixCells.isEmpty())){
				LOG.warning("Table::deleteRow -> the message is not right");
			}
			return;
		}
		Iterator<String> iterator = fixCells.keySet().iterator();
		while(iterator.hasNext()){
			String key = iterator.next();
			int index = Integer.parseInt(key);
			TableCell cell = nextRow.getCell(index);
			cell.setMergedStart();
		}
	}
	public void insertColumn(int idx,JSONArray cells,JSONObject fixCells){
		if(this.rows.size()!=cells.size()){
			LOG.warning("Table::insertColumn -> the message is not right");
			return;
		}
		TableCell preInsertedCell = null;
		for(int i=0;i< rows.size();i++){
			TableRow currentRow = this.rows.get(i);
			JSONObject cell = (JSONObject)cells.get(i);
			TableCell currentCell = currentRow.getCell(idx)	;
			int insertIdx = 0;
			if(currentCell==null){
				insertIdx = currentRow.cells.size();
				currentCell = currentRow.cells.get(insertIdx-1);
			}else{
				insertIdx = currentRow.cells.indexOf(currentCell);
			}
			String colId = String.valueOf(i);
			if(cell.get("hMerged")!=null){
				TableCell preCell = currentRow.getCell(idx-1);
				if(preCell!=null){
					int colSpan = preCell.getColSpan();
					preCell.setColSpan(colSpan+1);
				}else{
					LOG.warning("Table::insertColumn -> the column data is not right");
				}
			}else if(cell.get("vMerged")!=null){
				JSONObject mergedCell = createVMergedCell();
				TableCell newMergedCell = currentRow.insertCell(insertIdx, mergedCell);
				if(preInsertedCell!=null){
					preInsertedCell.setMergedStart();
					if(fixCells!=null&&fixCells.containsKey(colId)){
						newMergedCell.setColSpan(currentCell.getColSpan()+1);
						currentRow.deleteCell(currentCell);						
					}	
				}else{
					LOG.warning("Table::insertColumn -> the data format is not right");
				}
			}		
			else if(cell.get("cnt")!=null){
				
				preInsertedCell = currentRow.insertCell(insertIdx, (JSONObject)cell.get("cnt"));				
				if(fixCells!=null&&fixCells.containsKey(colId)){
					preInsertedCell.setColSpan(currentCell.getColSpan()+1);
					currentRow.deleteCell(currentCell);
				}				
			}
		}
	}
	public void deleteColum(int idx,JSONArray cells,JSONObject fixCells){
		if(this.rows.size()!=cells.size()){
			LOG.warning("Table::deleteColum -> the message is not right");
			return;
		}
		TableCell insertVMergedCell = null;
		for(int i=0;i< rows.size();i++){
			TableRow currentRow = this.rows.get(i);
			JSONObject cell = (JSONObject)cells.get(i);
			TableCell currentCell = currentRow.getCell(idx)	;
			String colId = String.valueOf(i);
			if(cell.get("hMerged")!=null){
				int colSpan = currentCell.getColSpan();
				currentCell.setColSpan(colSpan-1);
			}else if(cell.get("cnt")!=null){
				if(fixCells!=null&&fixCells.containsKey(colId)){
					insertVMergedCell = currentRow.insertCell(currentRow.cells.indexOf(currentCell), (JSONObject)fixCells.get(colId));					 
				}
				currentRow.deleteCell(currentCell);
			}else if(cell.get("vMerged")!=null){
				if(fixCells!=null&&fixCells.containsKey(colId)){
					currentRow.insertCell(currentRow.cells.indexOf(currentCell), (JSONObject)fixCells.get(colId));
					if(insertVMergedCell!=null){
						insertVMergedCell.setMergedStart();
					}else{
						LOG.warning("Table::deleteColum -> the data format is not right");
					}
				}
				currentRow.deleteCell(currentCell);
			}
		}
	}
	public void mergeCells(int startColIdx, int startRowIdx,int newRowSpan,int newColSpan){
		TableRow currentRow = this.getRow(startRowIdx);
		TableCell targetCell = this.getCell(startRowIdx, startColIdx);
		int endColIdx = startColIdx  + newColSpan;
		int endRowIdx = startRowIdx  + newRowSpan;
		if(newRowSpan>1){
			targetCell.setMergedStart();
		}
		int rowCnt = endRowIdx - startRowIdx;
		int rowSpan = rowCnt;
		for(int i=0;i<rowCnt;i++){
			TableCell beginCell = currentRow.getCell(startColIdx);
			TableCell endCell   = currentRow.getCell(endColIdx);
			beginCell.setColSpan(newColSpan);
			if(beginCell!=targetCell){
				beginCell.toMerge();
				beginCell.removeContents();
			}
			TableCell currentCell = beginCell;
			while(currentCell!=endCell){
				if(beginCell==null){
					LOG.warning("Table::mergeCells -> the data format is not right");
				}
				TableCell nextCell = currentCell.next();
				if(beginCell!=currentCell){
					currentRow.deleteCell(currentCell);
				}
				currentCell = nextCell;
			}
			TableRow nextRow = currentRow.next();
			currentRow = nextRow;
		}
		if(rowSpan<=1){
			targetCell.removeMergeStart();
		}
	}
	public void splitCells(int startColIndex, int startRowIndex,int newRowSpan, int newColSpan,JSONArray cnt){
		TableCell targetCell = this.getCell(startRowIndex, startColIndex);
		TableRow currentRow = targetCell.parent;
		for( int i =0;i< cnt.size() ;i++){
			TableCell insertPos = currentRow.getCell(startColIndex);
			TableCell nextPos = insertPos;
			JSONArray newCells = (JSONArray)cnt.get(i);
			for(int j=0;j< newCells.size();j++){
				if(i==0&&j==0){
					continue;
				}
				JSONObject cellJson = (JSONObject)newCells.get(j);
				currentRow.insertAfter(nextPos, cellJson);
				nextPos = nextPos.next();
			}
			if(insertPos!=null&&insertPos!=targetCell){
				currentRow.removeCell(insertPos);
			}
			currentRow = currentRow.next();
		}
		targetCell.setColSpan(newColSpan);
		if(newRowSpan>1){
			targetCell.setMergedStart();
		}
		
	}
	/**
	 * some unknown issue may make a illegal table and break out the document
	 * when client find a illegal table, it will send a message to server, server will check and fix it
	 * WARNNING: table may be not expected as custom want
	 * TODO: find all issues caused this and fixed 
	 */
	@Override
	public void checkSelf(){
		LOG.warning("Table::checkTable -> the table is illegal");
		TableRow currentRow = this.getRow(0);
		Object colsJson = this.jsonobj.get("cols");
		int colCnt = 0;
		if (colsJson != null){
			colCnt = ((JSONArray)colsJson).size();
		} else {
			while (currentRow != null) {
			    currentRow.checkCellColSpan();
				int currentCnt = currentRow.getCols();
				if (currentCnt > colCnt)
					colCnt = currentCnt;
				currentRow = currentRow.next();
			}
			currentRow = this.getRow(0);
		}
		while (currentRow != null) {
		    int currentCnt = currentRow.getCols();
			if (currentCnt != colCnt) {
				
				JSONObject cellJsonStr = this.createEmptyCell(colCnt - currentCnt);
				if (cellJsonStr != null) {
					int insertIndex = currentRow.cells.size();
					currentRow.insertCell(insertIndex, cellJsonStr);
				}
			}
			currentRow = currentRow.next();
		}
	}
	
	private JSONObject createEmptyCell(int colSpan){
		String str = "{\"id\":\"" +
				MessageUtil.generateId() +
				"\",\"tcPr\" : {\"gridSpan\" : {\"val\": \"" +
				colSpan + 
				"\"}}, " +
				"\"ps\": [{\"id\":\"" +
				MessageUtil.generateId() + 
				"\", \"c\":\"\", \"t\":\"p\",\"fmt\":[{\"rt\":\"rPr\", \"s\":\"0\", \"l\":\"0\"}]}]}"; 
		try {
			return JSONObject.parse(str);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
	private JSONObject createVMergedCell(){
		String str = "{\"tcPr\" : {\"vMerge\" : {}},\"ps\" : [ ],\"t\" : \"tc\"}";
		try {
			return JSONObject.parse(str);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

}
