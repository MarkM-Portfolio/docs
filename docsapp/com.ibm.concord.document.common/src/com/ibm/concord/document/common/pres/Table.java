package com.ibm.concord.document.common.pres;

import java.util.ArrayList;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Table extends Model {
	
	private JSONArray colWidths; // in cm
	private ArrayList<Row> rows;
	
	public Table(JSONObject jsonTable) {
		this.id = jsonTable.get("id").toString();
		this.colWidths = (JSONArray)jsonTable.get("colWidths");
		if(jsonTable.containsKey("attrs"))
			this.attrs = (JSONObject)jsonTable.get("attrs");
		this.rows = initRows((JSONArray)jsonTable.get("rows"));
	}
	
	public JSONArray cmToPercent(JSONArray cols, float slideW) {
		JSONArray ret = new JSONArray();
		for(int i = 0; i < cols.size(); i++) {
			float colW = Float.parseFloat(cols.get(i).toString()) * 100 / slideW;
			ret.add(colW + "%");
		}
		return ret;
	}
	
	public ArrayList<Row> initRows(JSONArray jsonRows) {
		int len = jsonRows.size();
		ArrayList<Row> _rows = new ArrayList<Row>();
		for(int i = 0; i < len; i++) {
			Row _row = new Row((JSONObject)jsonRows.get(i));
			_rows.add(_row);
		}
		
		return _rows;
	}
	
	@Override
	public String getHTML() {
		// TODO Auto-generated method stub
		return null;
	}
	
	public String getHTML(Float tableH, Float tableW) {
		String table = this.gartherAttrs("table");
		table += this.getColgroupHTML(tableW);
		table += "<tbody>" + this.getRowsHTML(tableH) + "</tbody>";
		table += "</table>";
		return table;
	}
	
	public String getColgroupHTML(float w){
		String ret = "<colgroup>";
		for(int i = 0; i < this.colWidths.size(); i++){
			float cm = Float.parseFloat(this.colWidths.get(i).toString());
			ret += "<col style=\"width:" +  cm * 100 / w + "%" + "\"></col>";
		}
		ret += "</colgroup>";
		return ret;
	}
	
	public String getRowsHTML(Float tableH){
		String ret = "";
		for(int i = 0; i < this.rows.size(); i++){
			ret += this.rows.get(i).getHTML(tableH);
		}
		return ret;
	}
	
}
