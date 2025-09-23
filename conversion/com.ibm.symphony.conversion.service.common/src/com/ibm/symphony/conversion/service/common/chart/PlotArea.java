package com.ibm.symphony.conversion.service.common.chart;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class PlotArea
{
	List<Plot> plots;
	List<Axis> axisList;
	
	boolean resetSize = false;
	
	double x = -1;
	double y = -1;
	double width = -1;
	double height = -1;
	
	int changes = 0;

    Style.Graphic graphicPro;
	//grouping
	Boolean stacked = false;
	Boolean percent = false;
	
	//bar chart
	Integer gapWidth;
	Boolean vertical = false;
	
	//pie chart
	Integer firstSliceAngle;
	
	//Scatter chart
	String scatterType;
	
	//line chart
	Boolean marker = false;
	Boolean smooth = false;
	
	int seriesNum;
	
	String dataSource; //use columns or rows as data series data source
	
	Map<String, String> axisNameMap;

	ChartDocument chart;
	
	public PlotArea(ChartDocument chartDoc)
	{
		chart = chartDoc;
		plots = new ArrayList<Plot>();
		axisList = new ArrayList<Axis>();
		dataSource = "columns";
	}

	public boolean needResetSize()
	{
		return resetSize;
	}
	
	public Style.Graphic getGraphicPro()
	{
		return graphicPro;
	}

	public void setGraphicPro(Style.Graphic graphicPro)
	{
		this.graphicPro = graphicPro;
	}
	
	public String getDataSource() 
	{
		return dataSource;
	}

	public void setDataSource(String dataSource) 
	{
		this.dataSource = dataSource;
	}
	
	public Plot getOrCreatePlot(String type, String axisId)
	{
		for(int i=0;i<plots.size();i++)
		{
			Plot plot = plots.get(i);
			boolean a = plot.getType().equals(type);
			boolean	b = false;
			String axId = plot.getyAxisId();
			if(axisId==null)
				b = axisId==axId;
			else
				b = axId.equals(axisId);
			if(a && b)
				return plot;
		}
		Plot plot = new Plot(null);
		plot.setType(type);
		plot.setParent(this);
		plot.setyAxisId(axisId);
		plots.add(plot);
		return plot;
	}
	
	public void addPlot(Plot plot)
	{
		plots.add(plot);
	}
	
	public List<Plot> getPlots()
	{
		return plots;
	}
	
	public void addAxis(Axis axis)
	{
		axis.parent = this;
		axisList.add(axis);
	}
	
	public List<Axis> getAxisList()
	{
		return axisList;
	}
	
	public Boolean getStacked()
	{
		return stacked;
	}

	public void setStacked(Boolean stacked)
	{
		this.stacked = stacked;
	}

	public Boolean getPercent()
	{
		return percent;
	}

	public void setPercent(Boolean percent)
	{
		this.percent = percent;
	}

	public Integer getGapWidth()
	{
		return gapWidth;
	}

	public void setGapWidth(Integer gapWidth)
	{
		this.gapWidth = gapWidth;
	}

	public Boolean getVertical()
	{
		return vertical;
	}

	public void setVertical(Boolean vertical)
	{
		this.vertical = vertical;
	}

	public Integer getFirstSliceAngle()
	{
		return firstSliceAngle;
	}

	public void setFirstSliceAngle(Integer firstSliceAngle)
	{
		this.firstSliceAngle = firstSliceAngle;
	}

	public String getScatterType()
	{
		return scatterType;
	}

	public void setScatterType(String scatterType)
	{
		this.scatterType = scatterType;
	}

	public Boolean getMarker()
	{
		return marker;
	}

	public void setMarker(Boolean marker)
	{
		this.marker = marker;
	}

	public Boolean getSmooth()
	{
		return smooth;
	}

	public void setSmooth(Boolean smooth)
	{
		this.smooth = smooth;
	}
	
    public double getX()
    {
      return x;
    }
  
    public void setX(double x)
    {
      this.x = x;
    }
  
    public double getY()
    {
      return y;
    }
  
    public void setY(double y)
    {
      this.y = y;
    }
  
    public double getWidth()
    {
      return width;
    }
  
    public void setWidth(double width)
    {
      this.width = width;
    }
  
    public double getHeight()
    {
      return height;
    }
  
    public void setHeight(double height)
    {
      this.height = height;
    }
	
	public void putAxisIdPair(String jsonId, String odfId)
	{
	  if(this.axisNameMap==null)
	    axisNameMap = new HashMap<String,String>();
	  
	  axisNameMap.put(jsonId, odfId);
	}
	
	public String getOdfAxisId(String jsonId)
	{
	  if(this.axisNameMap==null)
        return null;
      
      return axisNameMap.get(jsonId);
	}
	
	public int getSeriesNum()
	{
	  return this.seriesNum;
	}
	
	public int getChanges()
	{
		return changes;
	}
	
	public JSONObject toJson()
	{
		JSONObject plotAreaJson = new JSONObject();
		plotAreaJson.put("dataSource", dataSource.substring(0,dataSource.length()-1));
		
		if(x>=0)
		  plotAreaJson.put("x", x);
		if(y>=0)
		  plotAreaJson.put("y", y);
		if(width>=0)
		  plotAreaJson.put("w", width);
		if(height>=0)
		  plotAreaJson.put("h", height);
		
		JSONArray axises = new JSONArray();
		for(int i=0;i<axisList.size();i++)
		{
			axises.add(axisList.get(i).toJson());
		}
		plotAreaJson.put("axis", axises);
		JSONArray plotsJson = new JSONArray();
		//ODF limitation, only the first plot will use stack or percent property
		Boolean backStacked = this.stacked;
		Boolean backPercent = this.percent;
		for(int i=0;i<plots.size();i++)
		{
		    Plot plot = plots.get(i);
			plotsJson.add(plot.toJson());
			this.stacked = false;
			this.percent = false;
			  
		}
		this.stacked = backStacked;
        this.percent = backPercent;
        
		plotAreaJson.put("plots", plotsJson);
		if(this.graphicPro!=null)
		{
		  plotAreaJson.put("spPr", graphicPro.toJson());
		}
		return plotAreaJson;
	}
	
	public void loadFromJson(JSONObject content)
	{
	   dataSource = (String)content.get("dataSource") + "s";
	   
	   JSONArray plotsJson = (JSONArray)content.get("plots");
       if(plotsJson!=null)
       {
         for(int i=0;i<plotsJson.size();i++)
         {
           JSONObject plotJson = (JSONObject)plotsJson.get(i);
           Plot plot = new Plot(chart);
           plot.setParent(this);
           plot.loadFromJson(plotJson);
           plots.add(plot);
           seriesNum += plot.getSeriesList().size();
         }
       }
       
	   JSONArray axises = (JSONArray)content.get("axis");
	   if(axises!=null)
	   {
	     for(int i=0;i<axises.size();i++)
	     {
	       JSONObject axisJson = (JSONObject)axises.get(i);
	       Axis axis = new Axis(chart);
	       axis.parent = this;
	       axis.loadFromJson(axisJson);
	       axisList.add(axis);
	     }
	   }
	   
	   JSONObject spPr = (JSONObject)content.get("spPr");
	   if(spPr!=null)
	   {
		   this.graphicPro = new Style.Graphic();
		   this.graphicPro.loadFromJson(spPr);
	   }
	   
	   Number cha = (Number)content.get("changes");
	   if(cha != null)
		   changes = cha.intValue();
	}
	
}
