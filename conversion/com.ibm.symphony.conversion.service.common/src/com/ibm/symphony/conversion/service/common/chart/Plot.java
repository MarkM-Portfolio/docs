package com.ibm.symphony.conversion.service.common.chart;

import java.util.ArrayList;
import java.util.List;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class Plot
{
	private String type;
	private String yAxisId;
	private String xAxisId;
	private List<DataSeries> serList;
	private PlotArea parent;
	private String style;
	private boolean marker;
	private ChartDocument chart;
	
	public Plot(ChartDocument chartDoc)
	{
		chart = chartDoc;
		serList = new ArrayList<DataSeries>();
	}

	public String getStyle()
	{
	     return style;
	}
	  
	public void setStyle(String style)
	{
	     this.style = style;
    }

	public PlotArea getParent()
	{
	     return parent;
	}

	public void setParent(PlotArea parent)
	{
	     this.parent = parent;
	}

	public String getyAxisId()
	{
		return yAxisId;
	}
	
	public  boolean getMarker()
	{
	  return this.marker;
	}

	public void setyAxisId(String yAxisId)
	{
		this.yAxisId = yAxisId;
	}
	
	public String getxAxisId()
	{
		return xAxisId;
	}

	public void setxAxisId(String xAxisId)
	{
		this.xAxisId = xAxisId;
	}

	public String getType()
	{
		return type;
	}

	public void setType(String type)
	{
		this.type = type;
	}
	
	public List<DataSeries> getSeriesList()
	{
		return serList;
	}
	
	public void addSeries(DataSeries series)
	{
		serList.add(series);
	}
	
	public ChartDocument getChart()
	{
		return chart;
	}
	
	public JSONObject toJson()
	{
		JSONObject json = new JSONObject();
		String jsonType = Utils.mapChartType2Json(type);
		json.put("type", jsonType);
		
		Boolean vertical = parent.getVertical();
		
		JSONArray axisIdsJson = new JSONArray();
		//defect 19880
		if(yAxisId==null)
			yAxisId = "primary-y";
		if(xAxisId==null)
		{
		  if(yAxisId.equals("primary-y"))
		    xAxisId = "primary-x";
		  else if(yAxisId.equals("secondary-y"))
		  {
		    List<Axis> axlist = parent.getAxisList();
		    for(int i=0;i<axlist.size();i++)
		    {
		      Axis ax = axlist.get(i);
		      if("secondary-x".equals(ax.id))
		      {
		        xAxisId = "secondary-x";
		        break;
		      }
		    }
		    if(xAxisId==null)
		      xAxisId = "primary-x";
		  }
		}
		axisIdsJson.add(xAxisId);
		axisIdsJson.add(yAxisId);
		
		json.put("axId", axisIdsJson);
		
		if("bar".equals(jsonType))
		{
			Boolean stacked = parent.getStacked();
			Boolean percent = parent.getPercent();
			if(stacked!=null && stacked)
				json.put("grouping", "stacked");
			else if(percent!=null && percent)
			    json.put("grouping", "percentStacked");
			else
				json.put("grouping", "clustered");
			Integer gap = parent.getGapWidth();
			if(gap!=null)
				json.put("gapWidth", gap);
			if(vertical!=null && vertical)
				json.put("barDir", "bar");
			else
				json.put("barDir", "col");
		}
		else if("pie".equals(jsonType))
		{
			Integer angle = parent.getFirstSliceAngle();
			if(angle!=null)
				json.put("firstSliceAng", angle);
		}
		else if("area".equals(jsonType))
		{
			Boolean stacked = parent.getStacked();
			Boolean percent = parent.getPercent();
			if(stacked!=null && stacked)
				json.put("grouping", "stacked");
			else if(percent!=null && percent)
                json.put("grouping", "percentStacked");
			else
				json.put("grouping", "standard");
		}
		else if("line".equals(jsonType))
		{
			Boolean stacked = parent.getStacked();
			Boolean percent = parent.getPercent();
			if(stacked!=null && stacked)
				json.put("grouping", "stacked");
			else if(percent!=null && percent)
                json.put("grouping", "percentStacked");
			else
				json.put("grouping", "standard");
			
			Boolean smooth = parent.getSmooth();
			if(smooth!=null && smooth)
				json.put("smooth", 1);
		}
		else if("scatter".equals(jsonType))
		{
			Boolean smooth = parent.getSmooth();
			if(smooth!=null && smooth)
				json.put("style", "smoothMarker");
			else
				json.put("style", "lineMarker");
		}
		
		String grouping = (String)json.get("grouping");
		JSONArray serJson = new JSONArray();
		if("area".equals(jsonType) && "standard".equals(grouping))
		{
		  for(int i=serList.size()-1;i>=0;i--)
            serJson.add(serList.get(i).toJson());
		}
		else
		{
		  for(int i=0;i<serList.size();i++)
	         serJson.add(serList.get(i).toJson());
		}
		
		json.put("series", serJson);
		
		return json;
	}
	
	public void loadFromJson(JSONObject content)
	{
	   String jsonType = (String)content.get("type");
	   type = Utils.mapChartTypeFromJson(jsonType);
	   
	   JSONArray axisJson = (JSONArray)content.get("axId");
	   if(axisJson!=null)
	   {
	     int len = axisJson.size();
	     if(len>=1)
	       xAxisId = (String)axisJson.get(0);
	     if(len>=2)
	       yAxisId = (String)axisJson.get(1);
	   }
	   
	   String grouping = (String)content.get("grouping");
       if("stacked".equals(grouping))
         this.parent.setStacked(true);
       else if("percentStacked".equals(grouping))
        this.parent.setPercent(true);
       
	   if("bar".equals(jsonType))
	   {
	     Number gapWidth = (Number)content.get("gapWidth");
	     if(gapWidth!=null)
	       this.parent.setGapWidth(gapWidth.intValue());
	     
	     String barDir = (String)content.get("barDir");
	     if("bar".equals(barDir))
	       this.parent.setVertical(true);
	   }
	   else if("pie".equals(jsonType))
	   {
	       Number angle = (Number)content.get("firstSliceAng");
	       if(angle!=null)
	         this.parent.setFirstSliceAngle(angle.intValue());
	   }
	   else if("area".equals(jsonType))
       {
	     
       }
	   else if("line".equals(jsonType))
       {
		 Number m = (Number)content.get("marker");
		 if(m!=null && m.intValue()==1)
		     marker = true;
		 
         Number smooth = (Number)content.get("smooth");
         if(smooth!=null && smooth.intValue()==1)
            this.parent.setSmooth(true);
       }
	   else if("scatter".equals(jsonType))
       {
		  marker = true;
	      style = (String)content.get("style");
	      if("smoothMarker".equals(style))
	         this.parent.setSmooth(true);
       }
	   
	   JSONArray serJson = (JSONArray)content.get("series");
	   if(serJson!=null)
	   {
	     if("area".equals(jsonType) && "standard".equals(grouping))
	     {
	         for(int i=serJson.size()-1;i>=0;i--)
	         {
	           DataSeries series = new DataSeries(this);
	           series.setChartClass(type);
	           series.setAttachedAxis(xAxisId,yAxisId);
	           series.loadFromJson((JSONObject)serJson.get(i));  
	           this.serList.add(series);
	         }
	     }
	     else
	     {
	         for(int i=0;i<serJson.size();i++)
	         {
	           DataSeries series = new DataSeries(this);
	           series.setChartClass(type);
	           series.setAttachedAxis(xAxisId,yAxisId);
	           series.loadFromJson((JSONObject)serJson.get(i));  
	           this.serList.add(series);
	         }
	     }
	   }
       
	}
}
