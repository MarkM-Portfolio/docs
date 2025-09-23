/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.chart;

import java.util.ArrayList;
import java.util.List;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Plot 
{
	private List<String> seriesList;
	String chartType;
	String barDir;
	ChartDocument chart;
	JSONObject content;

	public Plot(ChartDocument chart)
	{
		this.chart = chart;
		seriesList = new ArrayList<String>();
	}
	
	public JSONObject toJson()
	{
		JSONArray seriesArray = new JSONArray();
		for(int i=0;i<seriesList.size();i++)
		{
			String id = seriesList.get(i);
			DataSeries ser = chart.getAllSeries().get(id);
			seriesArray.add(ser.toJson());
		}
		content.put(ChartConstant.SERIES_LIST, seriesArray);
		return content;
	}
	
	public String getChartType()
	{
		return this.chartType;
	}
	
	public void loadFromJson(JSONObject content)
	{
		this.content = content;
		
		chartType = (String)content.get("type");
		barDir = (String)content.get("barDir");
		JSONArray serListJson = (JSONArray)content.get(ChartConstant.SERIES_LIST);
		for(int i=0;i<serListJson.size();i++)
		{
			DataSeries series = new DataSeries(this, chart);
			series.loadFromJson((JSONObject)serListJson.get(i));
			this.seriesList.add(series.getId());
			this.chart.addSeries(series.getId(), series);
		}
	}
}
