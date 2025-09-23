package com.ibm.concord.spreadsheet.document.model.chart;

import com.ibm.json.java.JSONArray;

import com.ibm.concord.document.common.chart.DataSequence;
import com.ibm.concord.spreadsheet.document.model.impl.Document;

public class ScDataProvider extends com.ibm.concord.document.common.chart.DataProvider 
{
	Document doc;
	public ScDataProvider(Document doc)
	{
		this.doc = doc;
	}
	
	@Override
	public DataSequence createDataSequence(String addr) {
		ScDataSequence seq = new ScDataSequence(this, doc);
		if(addr != null)
			seq.setReference(addr);
		return seq;
	}
	
	public DataSequence createDataSequence(JSONArray pts) {
		ScDataSequence seq = new ScDataSequence(this, doc);
		if(pts != null)
			seq.setData(pts);
		return seq;
	}

}
