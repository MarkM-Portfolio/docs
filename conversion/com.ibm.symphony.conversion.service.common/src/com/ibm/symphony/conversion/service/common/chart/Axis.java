package com.ibm.symphony.conversion.service.common.chart;

import com.ibm.json.java.JSONObject;

public class Axis
{
	public String id;
	public String position;  //left, right, top, bottom
	public float  crossesAt = 0; //axis cross value
	public String dimension; //x, y
	public int delete = 0;   //0: visible, 1: invisible
	public boolean displayLabel = true;
	
	//scaling
	public String orentation;  //minmax, maxmin
	public float logBase = -1;      //10 ....
	public Double max;
	public Double min;
	public float majorUnit = -1;
	public float minorUnit = -1;
	
	public Float rotationAngle;
	
	//grid properties
	public Style.Graphic majorGrid;
	public Style.Graphic minorGrid;
	
	//number format
	public ChartNumberFormat format;
	public Boolean sourceLinked = true;
	
	//axis title
	public Title title;
	
	public Style.Graphic graphicPro;
	public Style.Text textPro;
	
	public DataReference categoriesRef;
	
	public PlotArea parent;
	
	public int changes = 0;
	
	public ChartDocument chart;
	
	public Axis(ChartDocument chartDoc)
	{
		chart = chartDoc;
	}
	
	public JSONObject toJson()
	{
		JSONObject json = new JSONObject();
		//Some special odf file has no id
		if(id==null || id.length()==0)
			id = "x".equals(dimension) ? "primary-x" : "primary-y";
		json.put("axId", id);
		json.put("delete", delete );
		
		if(!displayLabel)
		  json.put("tickLblPos", "none" );
		
		Boolean vertical = parent.getVertical();
		if(vertical!=null && vertical)
		{
			if("x".equals(dimension))
				dimension = "y";
			else
				dimension = "x";
		}
		if("x".equals(dimension))
		{
			if("end".equals(position))
				json.put("axPos", "t");
			else if("start".equals(position))
				json.put("axPos", "b");
			else
			{
			  if("primary-x".equals(id) || "primary-y".equals(id))
			    json.put("axPos", "b");
			  else
			    json.put("axPos", "t");
			  if(position!=null)
			    crossesAt = Float.parseFloat(position);
			}
		}
		else
		{
			if("end".equals(position))
				json.put("axPos", "r");
			else if("start".equals(position))
				json.put("axPos", "l");
			else
			{
			  if("primary-y".equals(id) || "primary-x".equals(id))
                json.put("axPos", "l");
              else
                json.put("axPos", "r");
              if(position!=null)
                crossesAt = Float.parseFloat(position);
			}
		}
		json.put("crossesAt", crossesAt);
		if(rotationAngle!=null)
		  json.put("txRot", rotationAngle);
		
		JSONObject scaling = new JSONObject();
		if(orentation!=null)
			scaling.put("orientation", orentation);
		if(logBase>0)
			scaling.put("logBase", logBase);
		if(max!=null)
			scaling.put("max", max);
		if(min!=null)
			scaling.put("min", min);
		if(!scaling.isEmpty())
			json.put("scaling", scaling);
		
		if(majorUnit>0)
			json.put("majorUnit", majorUnit);
		if(minorUnit>0)
			json.put("minorUnit", minorUnit);
		
		if(majorGrid!=null)
			json.put("majorGridlines", majorGrid.toJson());
		if(minorGrid!=null)
			json.put("minorGridlines", minorGrid.toJson());
		
		JSONObject numFmt = new JSONObject();
		if(format != null)
		  numFmt.put("format", format.toJson());
		if(sourceLinked)
		  numFmt.put("sourceLinked", 1);  //use data source format
		else
		  numFmt.put("sourceLinked", 0);  //use axis format
		
		json.put("numFmt", numFmt);
		
		
		if(title!=null)
			json.put("title", title.toJson());
		if(graphicPro!=null)
			json.put("spPr", graphicPro.toJson());
		if(textPro!=null)
			json.put("txPr", textPro.toJson());
		
		if(categoriesRef!=null)
			json.put("cat", categoriesRef.toJson());
		
		return json;
	}
	
	public void loadFromJson(JSONObject content)
	{
	  id = (String)content.get("axId");
      delete = ((Number)content.get("delete")).intValue();

      String tickLblPos = (String)content.get("tickLblPos");
      displayLabel = !"none".equals(tickLblPos);
      
      String axPos = (String)content.get("axPos");
      Boolean vertical = parent.getVertical();
      boolean beVertical = vertical!=null && vertical;
	  if("t".equals(axPos))
	  {
		  dimension = beVertical ? "y":"x";
		  position = "end";
		  this.parent.putAxisIdPair(id, beVertical ? "secondary-y":"secondary-x");
	  }
	  else if("b".equals(axPos))
	  {
		  dimension = beVertical ? "y":"x";
		  position = "0";
		  this.parent.putAxisIdPair(id, beVertical ? "primary-y":"primary-x");    		  
	  }
	  else if("l".equals(axPos))
	  {
	      dimension = beVertical ? "x":"y";
	      position = "0";
	      this.parent.putAxisIdPair(id, beVertical ? "primary-x":"primary-y");
	  }
	  else
	  {
		  dimension = beVertical ? "x":"y";
	      position = "end";
	      this.parent.putAxisIdPair(id, beVertical ? "secondary-x":"secondary-y");
	  }
      
      Number oRot = (Number)content.get("txRot");
      if(oRot!=null)
    	  this.rotationAngle = oRot.floatValue();
      JSONObject scaling = (JSONObject)content.get("scaling");
      if(scaling!=null)
      {
        orentation = (String)scaling.get("orientation");
        Number fLogBase = (Number)scaling.get("logBase");
        if(fLogBase!=null)
          logBase = fLogBase.floatValue();
        Number dMax = (Number)scaling.get("max");
        if(dMax != null)
        	max = dMax.doubleValue();
        Number dMin = (Number)scaling.get("min");
        if(dMin != null)
        	min = dMin.doubleValue();
      }
      
      Number majoru = (Number)content.get("majorUnit");
      if(majoru!=null)
        majorUnit = majoru.floatValue();
      
      Number minoru = (Number)content.get("minorUnit");
      if(minoru!=null)
        minorUnit = minoru.floatValue();
    
      JSONObject majorGridJson = (JSONObject)content.get("majorGridlines");
      if(majorGridJson!=null)
      {
        majorGrid = new Style.Graphic();
        majorGrid.loadFromJson(majorGridJson);
      }
      
      JSONObject minorGridJson = (JSONObject)content.get("minorGridlines");
      if(minorGridJson!=null)
      {
        minorGrid = new Style.Graphic();
        minorGrid.loadFromJson(minorGridJson);
      }
      
      JSONObject titleJson = (JSONObject)content.get("title");
      if(titleJson!=null)
      {
        title = new Title(chart);
        title.loadFromJson(titleJson);
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
      
      JSONObject catJson = (JSONObject)content.get("cat");
      if(catJson!=null)
      {
        categoriesRef = new DataReference();
        categoriesRef.loadFromJson(catJson);
      }
      
      JSONObject numFmt = (JSONObject)content.get("numFmt");
      if(numFmt != null)
      {
    	  JSONObject formatJson = (JSONObject)numFmt.get("format");
    	  if(formatJson != null)
    		  format = new ChartNumberFormat(formatJson);
    	  
    	  Number sl = (Number)numFmt.get("sourceLinked");
    	  if(sl != null)
    		  sourceLinked = sl.intValue() == 1;
      }
      
      Number cha = (Number)content.get("changes");
	   if(cha != null)
		   changes = cha.intValue();
	}
	
	public String getOdfId()
	{
	  return this.parent.getOdfAxisId(id);
	}
}
