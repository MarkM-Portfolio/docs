package com.ibm.symphony.conversion.service.common.chart;

import com.ibm.json.java.JSONObject;

public class Title
{
	public String text;
	public String strRef;
	
	public Style.Text textPro;
	public Style.Graphic graphicPro;
	
	public ChartDocument chart;
	
	public int changes = 0;
	
	public Title(ChartDocument chartDoc)
	{
		chart = chartDoc;
	}
	
	public JSONObject toJson()
	{
		JSONObject json = new JSONObject();
		
		json.put("text", text);
		json.put("txPr", textPro.toJson());
		return json;
	}
	
	public void loadFromJson(JSONObject content)
	{
	    text = (String)content.get("text");
	    JSONObject textProJson = (JSONObject)content.get("txPr");
	    JSONObject chartTxPr = chart.getTextPro();
	    if(textProJson!=null)
	    {
	      textPro = new Style.Text();
	      textPro.loadFromJson(textProJson, chartTxPr);
	      if(!textPro.bold && !textProJson.containsKey("b") && (chartTxPr==null || !chartTxPr.containsKey("b")))
	    	  textPro.bold = true;
	      Number sz = (Number)textProJson.get("sz");
		  if(sz==null)
			  textPro.size *= 1.2;
	    }
	    Number cha = (Number)content.get("changes");
	    if(cha != null)
	    	changes = cha.intValue();
	}
}
