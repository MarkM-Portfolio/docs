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

public class PlotArea 
{
	private List<Plot> plots;
	private List<Axis> axisList;
	
	JSONObject content;
	
	ChartDocument chart;
	
    int changes = 0;
	
	public PlotArea(ChartDocument chart)
	{
		this.chart = chart;
		plots = new ArrayList<Plot>();
		axisList = new ArrayList<Axis>();
	}
	
	public List<Axis> getAxisList()
	{
		return this.axisList;
	}
	
	public void loadFromJson(JSONObject content)
	{
		this.content = content;
		
		Number cha = (Number)content.get(ChartConstant.CHANGES);
	    if(cha != null)
		   changes = cha.intValue();
		
		String dataSource = (String)content.get(ChartConstant.DATASOURCE);
		JSONArray axislist = (JSONArray)content.get(ChartConstant.AXIS);
		
		DataProvider dataProvider = this.chart.getDataProvider();
		if(dataProvider!=null)
		{
			dataProvider.setDataSource(dataSource);
		}
		
		if(axislist!=null)
		{
			for(int i=0;i<axislist.size();i++)
			{
				JSONObject axisJson = (JSONObject)axislist.get(i);
				Axis axis = new Axis(this.chart);
				axis.loadFromJson(axisJson);
				this.axisList.add(axis);
			}
		}
		
		JSONArray plotsJson = (JSONArray)content.get(ChartConstant.PLOTS);
		for(int i=0;i<plotsJson.size();i++)
		{
			Plot plot = new Plot(chart);
			plot.loadFromJson((JSONObject)plotsJson.get(i));
			
			this.plots.add(plot);
		}
	}
	
	public JSONObject toJson()
	{
		for(int i=0;i<axisList.size();i++)
		{
			Axis axis = axisList.get(i);
			axis.toJson();
		}
		for(int i=0;i<plots.size();i++)
		{
			Plot plot = plots.get(i);
			plot.toJson();
		}
		content.put(ChartConstant.CHANGES, changes);
		return null;
	}
	
	public void set(JSONObject settings)
	{
		if(settings.containsKey(ChartConstant.SPPR))
		{
			changes = changes | 1;
			JSONObject spPr = (JSONObject)settings.get(ChartConstant.SPPR);
			JSONObject dest = (JSONObject)this.content.get(ChartConstant.SPPR);
			if(spPr == null && dest != null)
				this.content.remove(ChartConstant.SPPR);
			else 
			{
				if(dest == null)
				{
					dest = new JSONObject();
					this.content.put(ChartConstant.SPPR, dest);
				}
				ChartUtils.mergeSpPr(dest, spPr);//merge and maintain change flag
			}
		}
	}
}
