package com.ibm.concord.document.common.pres;

import com.ibm.json.java.JSONObject;

public class Cell extends Model {

	private String content;
	private boolean isHeaderCell;
	
	public Cell(JSONObject jsonRow) {
		this.id = jsonRow.get("id").toString();
		if(jsonRow.containsKey("attrs"))
			this.attrs = (JSONObject)jsonRow.get("attrs");
		
		this.content = jsonRow.get("content").toString();
		this.isHeaderCell = Boolean.parseBoolean(jsonRow.get("isHeaderCell").toString());
	}
	
	@Override
	public String getHTML() {
		String cell = null;
		String tagName = isHeaderCell ? "th" : "td";
		cell = this.gartherAttrs(tagName);
		
		cell += this.content;
		cell += "</" + tagName + ">";
		return cell;
	}

}
