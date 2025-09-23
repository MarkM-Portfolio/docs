package com.ibm.symphony.conversion.service.common.chart;

import java.util.HashMap;
import java.util.Map;

import com.ibm.json.java.JSONObject;

public class Legend
{
	public String position;  
	public Style.Graphic graphicPro;
	public Style.Text textPro;
	public double x = -1;
	public double y = -1;
	public int changes = 0;
	public ChartDocument chart;
	
	private final static Map<String,String> posMap;
	private final static Map<String,String> r_posMap;
	static
	{
		posMap = new HashMap<String,String>();
		posMap.put("bottom-end", "r");
		posMap.put("bottom-start", "l");
		posMap.put("top-end", "r");
		posMap.put("top-start", "l");
		posMap.put("bottom", "b");
		posMap.put("end", "r");
		posMap.put("start", "l");
		posMap.put("top", "t");
		
		r_posMap = new HashMap<String,String>();
		r_posMap.put("b","bottom");
		r_posMap.put("r","end");
		r_posMap.put("l","start");
		r_posMap.put("t","top");
	}
		
	public Legend(ChartDocument chartDoc)
	{
		chart = chartDoc;
	}
	
	public JSONObject toJson()
	{
		JSONObject json = new JSONObject();
		if(position!=null)
		{
		    String pos = posMap.get(position);
			json.put("legendPos", pos);
		}
		if(x>=0)
		  json.put("x", x);
		if(y>=0)
		  json.put("y", y);
		
		if(textPro!=null)
			json.put("txPr", textPro.toJson());
		return json;
	}
	
	public void loadFromJson(JSONObject content)
	{
	   Number x = (Number)content.get("x");
	   if(x!=null)
	     this.x = x.doubleValue();
	   Number y = (Number)content.get("y");
	   if(y!=null)
	     this.y = y.doubleValue();
	   
	   String pos = (String)content.get("legendPos");
	   if(pos!=null)
	     position = r_posMap.get(pos);
	   
	   JSONObject text = (JSONObject)content.get("txPr");
	   JSONObject chartTxPr = chart.getTextPro();
	   if(text!=null)
	   {
	     textPro = new Style.Text();
	     textPro.loadFromJson(text, chartTxPr);
	   }
	   
	   Number cha = (Number)content.get("changes");
	   if(cha != null)
		   changes = cha.intValue();
	}
	
}
