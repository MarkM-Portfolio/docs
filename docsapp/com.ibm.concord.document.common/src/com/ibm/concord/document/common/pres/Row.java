package com.ibm.concord.document.common.pres;

import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Row extends Model {

	private float h;

	private ArrayList<Cell> cells;

	public Row(JSONObject jsonRow) {
		this.id = jsonRow.get("id").toString();
		this.h = Float.parseFloat(jsonRow.get("h").toString());

		if (jsonRow.containsKey("attrs"))
			this.attrs = (JSONObject) jsonRow.get("attrs");

		this.cells = this.initCells((JSONArray) jsonRow.get("cells"));
	}

	public ArrayList<Cell> initCells(JSONArray jsonCells) {
		int len = jsonCells.size();
		ArrayList<Cell> _cells = new ArrayList<Cell>();
		for (int i = 0; i < len; i++) {
			Cell _cell = new Cell((JSONObject) jsonCells.get(i));
			_cells.add(_cell);
		}

		return _cells;
	}

	public String getHTML(Float tableH) {
		String ret = this.gartherAttrs("tr");
		ret = this.updateStyleHeight(ret, tableH);
		for (int i = 0; i < this.cells.size(); i++) {
			ret += this.cells.get(i).getHTML();
		}
		ret += "</tr>";
		return ret;
	}

	@Override
	public String getHTML() {
		// TODO Auto-generated method stub
		return null;
	}

	public String updateStyleHeight(String row, Float tableH) {
		String ret = row;
		String newH = (this.h * 100.0 / tableH) + "%";
		Pattern pattern = Pattern.compile("height(\\s*):(\\s*)(\\d+)%");
		Matcher matcher = pattern.matcher(row);
		ret = matcher.replaceAll("height: " + newH);
		
		return ret;
	}
}
