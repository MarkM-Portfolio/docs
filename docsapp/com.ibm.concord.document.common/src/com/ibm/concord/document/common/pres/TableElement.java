package com.ibm.concord.document.common.pres;

public class TableElement extends Element {

	private Table table;
	
	public Table getTable() {
		return table;
	}

	public void setTable(Table table) {
		this.table = table;
	}

	public String getHTML() {
		String div = this.gartherAttrs("div");
		div += this.table.getHTML(this.getH(), this.getW());
		div += "</div>";
		return div;
	}
	
}
