package com.ibm.symphony.conversion.service.common.chart;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.ibm.json.java.JSONObject;

public class DataSeries
{
	//Key maybe: x-values, values, label, bubble-size....
	List<DataReference> dataReferences;
	DataReference labelReference;
	
	Map<Integer,Style.Graphic> dataPoints;
	
	Style.Graphic graphicPro;
	Style.Text textPro;
	Style.Marker markerPro;
	Integer marker;
	String smooth;
	
	String chartClass;
	String id;
	
	String name;
	
	String xAxisId;
	String yAxisId;
	
	int index;
	
	PlotArea plotArea;
	Plot parent;
	
	ChartDocument chart;
	int changes = 0;

	public DataSeries(Plot plot)
	{
	    this.parent = plot;
	    chart = plot.getChart();
		this.plotArea = plot.getParent();
		dataReferences = new ArrayList<DataReference>();
		dataPoints = new HashMap<Integer,Style.Graphic>();
	}
	
	public void addDataReference(DataReference ref)
	{
		dataReferences.add(ref);
	}
	
	public void setLabelReference(DataReference ref)
	{
		labelReference = ref;
	}
	
	public void setChartClass(String chartClass)
	{
		this.chartClass = chartClass;
	}
	
	public void setAttachedAxis(String xAxisId,String yAxisId)
	{
	  this.xAxisId = xAxisId;
	  this.yAxisId = yAxisId;
	}
	
	public String getAttachedXAxis()
	{
	  return xAxisId;
	}
	
	public String getAttachedYAxis()
    {
      return yAxisId;
    }
	
	public void setName(String name)
	{
		this.name = name;
	}
	
	public String getName()
	{
	  return this.name;
	}
	
	public void setIndex(int index)
	{
	  this.index = index;
	}
	
	public int getIndex()
	{
	  return this.index;
	}
	
	public String getChartClass()
	{
		return this.chartClass;
	}
	
	public Plot getParent()
	{
	  return this.parent;
	}
	
	public void addDataPoint(int idx, Style.Graphic pro)
	{
		if(dataPoints==null)
			dataPoints = new HashMap<Integer,Style.Graphic>();
		dataPoints.put(idx, pro);
	}

	public Style.Graphic getGraphicPro()
	{
		return graphicPro;
	}

	public void setGraphicPro(Style.Graphic graphicPro)
	{
		this.graphicPro = graphicPro;
	}

	public Style.Text getTextPro()
	{
		return textPro;
	}

	public void setTextPro(Style.Text textPro)
	{
		this.textPro = textPro;
	}
	
	public void setMarkerPro(Style.Marker markerPro)
	{
	    this.markerPro = markerPro;
	}
		
	public Integer getMarker()
	{
	    return this.marker;
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public List<DataReference> getDataReferences()
	{
		return dataReferences;
	}

	public DataReference getLabelReference()
	{
		return labelReference;
	}

	public Map<Integer,Style.Graphic> getDataPoints()
	{
		return dataPoints;
	}
	
	public int getChanges()
	{
		return changes;
	}
	
	/**
	 * unsupported charts:
	 *   Stock
     *   Surface: will be transfered to bar chart, out of scope
     *   Doughnut
     *   Bubble
     *   Radar
	 * @return
	 */
	public JSONObject toJson()
	{
		JSONObject json = new JSONObject();
		json.put("id", this.id);
		if(labelReference!=null || name!=null)
		{
			JSONObject tx = new JSONObject();
			if(labelReference!=null)
				tx.putAll(labelReference.toJson());
			if(name!=null)
				tx.put("v", name);
			json.put("label", tx);
		}
		
		List<DataSeries> list = this.parent.getSeriesList();
		DataSeries first = list.get(0);
		
		DataSeries firstFirst = null;
		List<Plot> plots = this.parent.getParent().getPlots();
		if(plots.size() > 1 && plots.get(0) != this.parent)
			firstFirst = plots.get(0).getSeriesList().get(0);
		
		int dfSize = dataReferences.size();
		if("chart:bubble".equalsIgnoreCase(chartClass))
		{
		  json.put("bubbleSize", dataReferences.get(0).toJson());

		  if(dfSize >= 2)
		    json.put("yVal", dataReferences.get(1).toJson());
		  if(dfSize == 3)
		    json.put("xVal", dataReferences.get(2).toJson());
		  else
		  {
			  if(first!=this && first.dataReferences.size()==3)
				  json.put("xVal", first.dataReferences.get(2).toJson());
			  else if(firstFirst!= null && firstFirst.dataReferences.size()==3)
				  json.put("xVal", firstFirst.dataReferences.get(2).toJson());
		  }
		}
		else if("chart:stock".equalsIgnoreCase(chartClass) || "chart:ring".equalsIgnoreCase(chartClass) || "chart:radar".equalsIgnoreCase(chartClass) || "chart:filled-radar".equalsIgnoreCase(chartClass))
		{
		  json.put("val", dataReferences.get(0).toJson());
		}
		else if("chart:scatter".equals(chartClass))
		{
		  json.put("yVal", dataReferences.get(0).toJson());
			
		  if(dfSize == 2)
		    json.put("xVal", dataReferences.get(1).toJson());
		  else
		  {
			  if(first!=this && first.dataReferences.size()==2)
				 json.put("xVal", first.dataReferences.get(1).toJson());
			  else if(firstFirst != null && firstFirst.dataReferences.size() == 2)
				  json.put("xVal", firstFirst.dataReferences.get(1).toJson());				  
		  }
		}
		else
		{
		  json.put("yVal", dataReferences.get(0).toJson());
		}
		
		if(dataPoints!=null && !dataPoints.isEmpty())
		{
			JSONObject dpJson = new JSONObject();
			Iterator<Map.Entry<Integer,Style.Graphic>> itr = dataPoints.entrySet().iterator();
			while(itr.hasNext())
			{
				Map.Entry<Integer,Style.Graphic> entry = itr.next();
				Integer idx = entry.getKey();
				Style.Graphic pro = entry.getValue();
				JSONObject spJson = pro.toJson();
				if(!spJson.isEmpty())
				{
					JSONObject p = new JSONObject();
					p.put("spPr", spJson);
					dpJson.put(idx.toString(), p);
				}
			}
			if(!dpJson.isEmpty())
				json.put("dPt", dpJson);
		}
		if(graphicPro!=null)
		{
			JSONObject gpJson = graphicPro.toJson();
			if(!gpJson.isEmpty())
			{
				//For 3D line or scatter, no line properties, so use the fill color as line color
				if("chart:line".equals(parent.getType()) || "chart:scatter".equals(parent.getType()))
				{
					String solidFill = (String)gpJson.get("solidFill");
					if(solidFill!=null)
					{
						JSONObject ln = (JSONObject)gpJson.get("ln");
						if(ln==null)
						{
							ln = new JSONObject();
							ln.put("solidFill", solidFill);
							gpJson.put("ln", ln);
						}
						else
						{
							if(!ln.containsKey("solidFill"))
								ln.put("solidFill", solidFill);
						}
					}
				}
				json.put("spPr", gpJson);
			}
		}
		if(textPro!=null)
		{
			JSONObject tpJson = textPro.toJson();
			if(!tpJson.isEmpty())
				json.put("txPr", textPro.toJson());
		}
		
		if(markerPro!=null && ("chart:scatter".equals(chartClass) || "chart:line".equals(chartClass)))
		{
	       if(markerPro.symbolType!=null && !"none".equals(markerPro.symbolType))
	          json.put("marker", 1);
	       else
	          json.put("marker", 0);
		}
		return json;
	}
	
	public void loadFromJson(JSONObject content)
	{
	  id = (String)content.get("id");
	  JSONObject labelJson = (JSONObject)content.get("label");
	 
	  Number m = (Number)content.get("marker");
	  if(m!=null)
		  marker = m.intValue();
	  
	  if(labelJson!=null)
	  {
	    name = (String)labelJson.get("v");
	    if(Utils.hasValue((String)labelJson.get("ref")))
	    {
	      labelReference = new DataReference();
	      labelReference.loadFromJson(labelJson);
	    }
	  }
	  
	  if("chart:bubble".equalsIgnoreCase(chartClass))
      {
	    JSONObject bubbleSizeJson = (JSONObject)content.get("bubbleSize");
	    if(bubbleSizeJson!=null)
	    {
	      DataReference dataRef = new DataReference();
	      dataRef.loadFromJson(bubbleSizeJson);
	      dataReferences.add(dataRef);
	    }
	    JSONObject yValJson = (JSONObject)content.get("yVal");
        if(yValJson!=null)
        {
          DataReference dataRef = new DataReference();
          dataRef.loadFromJson(yValJson);
          dataReferences.add(dataRef);
        }
	    JSONObject xValJson = (JSONObject)content.get("xVal");
	    if(xValJson!=null)
	    {
	      DataReference dataRef = new DataReference();
	      dataRef.loadFromJson(xValJson);
	      dataReferences.add(dataRef);
	    }
      }
	  else if("chart:stock".equalsIgnoreCase(chartClass) || 
	      "chart:ring".equalsIgnoreCase(chartClass) || 
	      "chart:radar".equalsIgnoreCase(chartClass))
      {
	    JSONObject valJson = (JSONObject)content.get("val");
        if(valJson!=null)
        {
          DataReference dataRef = new DataReference();
          dataRef.loadFromJson(valJson);
          dataReferences.add(dataRef);
        }
      }
	  else if("chart:scatter".equals(chartClass))
      {
	    JSONObject yValJson = (JSONObject)content.get("yVal");
        if(yValJson!=null)
        {
          DataReference dataRef = new DataReference();
          dataRef.loadFromJson(yValJson);
          dataReferences.add(dataRef);
        }
        JSONObject xValJson = (JSONObject)content.get("xVal");
        if(xValJson!=null)
        {
          DataReference dataRef = new DataReference();
          dataRef.loadFromJson(xValJson);
          dataReferences.add(dataRef);
        }
      }
      else
      {
        JSONObject yValJson = (JSONObject)content.get("yVal");
        if(yValJson!=null)
        {
          DataReference dataRef = new DataReference();
          dataRef.loadFromJson(yValJson);
          dataReferences.add(dataRef);
        }
      }
	  
	  JSONObject dpt = (JSONObject)content.get("dPt");
	  if(dpt!=null)
	  {
		  Iterator<Map.Entry<String, JSONObject>> itor = dpt.entrySet().iterator();
		  while(itor.hasNext())
		  {
			  Map.Entry<String, JSONObject> entry = itor.next();
			  String key = entry.getKey();
			  JSONObject dp = entry.getValue();
			  JSONObject spPr = (JSONObject)dp.get("spPr");
			  Style.Graphic pro = new Style.Graphic();
			  pro.loadFromJson(spPr);
			  this.dataPoints.put(Integer.valueOf(key),pro);
		  }
	  }
	  
	  JSONObject graphicJson = (JSONObject)content.get("spPr");
	  if(graphicJson!=null)
	  {
	    graphicPro = new Style.Graphic();
	    graphicPro.loadFromJson(graphicJson);
	  }
	  
	  JSONObject textJson = (JSONObject)content.get("txPr");
	  JSONObject chartTxPr = chart.getTextPro();
      if(textJson!=null)
      {
        textPro = new Style.Text();
        textPro.loadFromJson(textJson, chartTxPr);
      }
      
      Number cha = (Number)content.get("changes");
	  if(cha != null)
		  changes = cha.intValue();
      
//      JSONObject markerJson = (JSONObject)content.get("marker");
//      if(markerJson!=null)
//      {
//        markerPro = new Style.Marker();
//        markerPro.loadFromJson(markerJson);
//      }
	}
}
