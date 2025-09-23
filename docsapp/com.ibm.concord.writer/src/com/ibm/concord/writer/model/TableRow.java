package com.ibm.concord.writer.model;

import java.util.ArrayList;
import java.util.List;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class TableRow extends ModelObject {
	public Table parent;
	public List<TableCell> cells = new  ArrayList<TableCell>();
	TableRow(JSONObject jsonobj) {
		super(jsonobj);
		this.modelType = "tableRow";
	}

	public TableRow(JSONObject jsonobj, Table table) {
		super(jsonobj);
		this.modelType = "tableRow";
		parent = table;
		this.initCell();
	}
	private void initCell(){
		JSONArray children = (JSONArray) ((JSONObject) this.jsonobj).get("tcs");
		for(int i=0;i< children.size();i++){
			JSONObject cellJson = (JSONObject)children.get(i);
			TableCell cell = new TableCell(cellJson,this);
			this.cells.add(cell);
		}
	}
	public void checkCellColSpan()
	{
	  for(int i = 0; i< cells.size();i++){
        TableCell cell = cells.get(i);
        int colSpan = cell.getColSpan();
        if (colSpan < 1)
          cell.setColSpan(1);  
      }
	}
	public int getCols()
	{
	  int cnt = 0;
      for(int i = 0; i< cells.size();i++){
          TableCell cell = cells.get(i);
          cnt += cell.getColSpan();   
      }
      return cnt;
	}
	public TableCell getCell (int index ){
		int cnt = -1;
		for(int i = 0; i< cells.size();i++){
			TableCell cell = cells.get(i);
			cnt += cell.getColSpan();	
			if(cnt>=index){
				return cell;
			}					
		}
		return null;
	}
	public void hMergeCell(int start,int step){
		if(step<=1){
			return ;
		}
		TableCell cell = this.cells.get(start);
		int colSpan = cell.getColSpan();
		colSpan += step;
		cell.setColSpan(colSpan);
		while(step>0){
			this.removeCell(start+1);
			step--;
		}		
	}
	public JSONObject getRowProperty(){
		JSONObject json = (JSONObject)this.jsonobj.get("trPr");
		if(json==null){
			json = new JSONObject();
			this.jsonobj.put("trPr", json);
		}
		return json;
	}
	public void vMergeCell(int start){
		TableCell cell = this.cells.get(start);
		cell.toMerge();
	}
	public TableCell insertCell(int index, JSONObject cellJson){
		
		TableCell cell = new TableCell(cellJson,this);
		this.insertElement(index, cellJson);
		this.cells.add(index, cell);
		return cell;
	}
	public TableCell insertAfter(TableCell targetCell,JSONObject cellJson){
		int index = this.cells.indexOf(targetCell)+1;
		return this.insertCell(index, cellJson);
	}
	public void insertCells(TableCell targetCell,JSONArray jsons){
		int index = this.cells.indexOf(targetCell)+1;
		for(int i=0;i< jsons.size();i++){
			this.insertCell(index+i, (JSONObject)jsons.get(i));
		}
	}
	public TableCell insertBefore(TableCell targetCell,JSONObject cellJson){
		int index = this.cells.indexOf(targetCell);
		if(index<0){
			index=0;
		}
		return this.insertCell(index, cellJson);
	}
	public void removeCell(int index){
		this.cells.remove(index);
		this.deleteElement(index);
	}
	
	public void removeCell(TableCell cell){
		int index = this.cells.indexOf(cell);
		if(index>=0){
			this.removeCell(index);
		}
	}
	
	public void deleteCell(TableCell cell){
		int index = this.cells.indexOf(cell);
		if(index>=0){
			this.deleteCell(index);
		}
	}
	public void deleteCell(int index){
		this.cells.remove(index);
		this.deleteElement(index);
	}
	
	
	public TableCell nextCell(TableCell cell){
		
		int idx = this.cells.indexOf(cell);
		if(this.cells.size()-1==idx){
			return null;
		}
		return this.cells.get(idx+1);
	}
	public TableCell preCell(TableCell cell){
		int idx = this.cells.indexOf(cell);
		if(idx==0){
			return null;
		}
		return this.cells.get(idx-1);
	}
	public TableRow next(){
		return this.parent.nextRow(this);
	}
	public TableRow prev(){
		return this.parent.preRow(this);
	}
	public void insertElement(int index, JSONObject element) {
		JSONArray children = (JSONArray) ((JSONObject) this.jsonobj).get("tcs");
		children.add(index, element);
	}
	@Override
	public void setAttributes(JSONObject atts) {
		JSONObject trPrJson =  this.getRowProperty();
		if(atts.get("rowH")!=null){
		  trPrJson.put("trHeight", atts.get("rowH"));
		}
		
        if (atts.containsKey("ch"))
        {
            Object c = atts.get("ch");
            if (c == null || (c instanceof String))
                this.jsonobj.remove("ch");
            else
              this.jsonobj.put("ch", c);
        }

        if (atts.containsKey("trPrCh"))
        {
            Object c = atts.get("trPrCh");
            if (c == null || (c instanceof String))
              this.jsonobj.remove("trPrCh");
            else
              this.jsonobj.put("trPrCh", c);
        }	

        if(atts.get("tblHeader")!= null){
            String tblHeader = atts.get("tblHeader").toString().trim();
            if (tblHeader.equals("true"))
              trPrJson.put("tblHeader", "1");
            else
              trPrJson.remove("tblHeader");
        }        
	}

	@Override
	public void setStyle(JSONObject styles) {
		if (null == styles || styles.isEmpty()) {
			return;
		}
		String type = (String) styles.get("type");
		if (type.equals("cnSt")) {
			JSONObject cnfSt = (JSONObject) styles.get("v");
			JSONObject trPr = (JSONObject) this.jsonobj.get("trPr");
			if(trPr==null){
				trPr = new JSONObject();
				this.jsonobj.put("trPr", trPr);
			}
			if (cnfSt == null || cnfSt.isEmpty()) {
				trPr.remove("cnfStyle");
			} else {
				trPr.put("cnfStyle", cnfSt);
			}
		}

	}

	@Override
	public void deleteElement(int index) {
		JSONArray children = (JSONArray) ((JSONObject) this.jsonobj).get("tcs");
		children.remove(index);
	}
}
