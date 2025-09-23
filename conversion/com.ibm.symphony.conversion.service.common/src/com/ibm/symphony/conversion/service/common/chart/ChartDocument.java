/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.service.common.chart;

import java.util.HashMap;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.w3c.dom.Node;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.odf2json.ConverterFactory;

public class ChartDocument
{
	private double width = -1;
	private double height = -1;

    private String chartClass;
	private JSONObject textPro;
	private Style.Graphic graphicPro;
	
	private String displayBlankAs;
	private boolean plotVisibleOnly;
	
	private Title title;
	private Legend legend;
	private PlotArea plotArea;
	
	private int changes = 0;
	
	public String getChartClass() 
	{
		return chartClass;
	}

	public int getChanges()
	{
		return changes;
	}
	
	public void setChartClass(String chartClass) 
	{
		this.chartClass = chartClass;
	}
	
	public PlotArea getPlotArea()
	{
		return plotArea;
	}

	public void setPlotArea(PlotArea plotArea)
	{
		this.plotArea = plotArea;
	}

	public JSONObject getTextPro()
	{
		return textPro;
	}
	
	public Style.Graphic getGraphicPro()
	{
		return graphicPro;
	}

	public void setGraphicPro(Style.Graphic graphicPro)
	{
		this.graphicPro = graphicPro;
	}

	public Title getTitle()
	{
		return title;
	}

	public void setTitle(Title title)
	{
		this.title = title;
	}

	public Legend getLegend()
	{
		return legend;
	}

	public void setLegend(Legend legend)
	{
		this.legend = legend;
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

	public void importFromOdfDom(OdfFileDom contentDom) throws Exception
	{
		ConversionContext context = new ConversionContext();
		context.put("Target", this);
		
		OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
		context.put("styles", autoStyles);
		
		HashMap<String, ChartNumberFormat> formatMap = NumFormatHelper.buildChartFormatMap(autoStyles);
		if(null != formatMap)
		  context.put("formats", formatMap);
		
		context.put("seriesIndex", 0);
		
		//convert local table firstly
		Node localTable = contentDom.getElementsByTagName("table:table").item(0);
		if(localTable != null)
			ConverterFactory.getInstance().getConverter(localTable).convert(context,localTable,null);
		
		Node body = contentDom.getElementsByTagName("office:body").item(0);
		Node chart = body.getFirstChild();
		ConverterFactory.getInstance().getConverter(chart).convert(context, chart, null);
	}
	
	public void loadFromJson(JSONObject content)
	{
		textPro = (JSONObject)content.get("txPr");
		
		JSONObject graphicPrJson = (JSONObject)content.get("spPr");
	    if(graphicPrJson!=null)
	    {
	      this.graphicPro = new Style.Graphic();
	      this.graphicPro.loadFromJson(graphicPrJson);
	    }
	    
	    Number cha = (Number)content.get("changes");
	    if(cha != null)
		   changes = cha.intValue();
		
		JSONObject titleJson = (JSONObject)content.get("title"); 
	    if(titleJson!=null)
	    {
	       title = new Title(this);
	       title.loadFromJson(titleJson);
	    }
	    JSONObject legendJson = (JSONObject)content.get("legend");
	    if(legendJson!=null)
	    {
	      legend = new Legend(this);
	      legend.loadFromJson(legendJson);
	    }
	    JSONObject plotAreaJson = (JSONObject)content.get("plotArea");
	    if(plotAreaJson!=null)
	    {
	      plotArea = new PlotArea(this);
	      plotArea.loadFromJson(plotAreaJson);
	    }
	}
	
	public String getDisplayBlankAs()
	{
		return displayBlankAs;
	}

	public void setDisplayBlankAs(String displayBlankAs)
	{
		this.displayBlankAs = displayBlankAs;
	}

	public boolean isPlotVisibleOnly()
	{
		return plotVisibleOnly;
	}

	public void setPlotVisibleOnly(boolean plotVisibleOnly)
	{
		this.plotVisibleOnly = plotVisibleOnly;
	}

	public void resetPloatArea(boolean reset)
	{
		if(!this.plotArea.resetSize)
			this.plotArea.resetSize = reset;
	}
	
	public JSONObject toJson()
	{
		JSONObject json = new JSONObject();
		if(width>0)
		  json.put("w", width);
		if(height>0)
		  json.put("h", height);
		
		if(title!=null)
			json.put("title", title.toJson());
		json.put("plotArea", plotArea.toJson());
		if(legend!=null)
		{
		  JSONObject legendJson = legend.toJson();
		  if(legendJson.get("legendPos")==null)
		  {
		    String pos = null;
		    if(legend.x >=plotArea.getX()+plotArea.getWidth())
              pos = "r";
		    else if(legend.y<=plotArea.getY())
		      pos = "t";
		    else if(legend.y>=plotArea.getY()+plotArea.getHeight())
		      pos = "b";
		    else if(legend.x <=plotArea.getX())
		      pos = "l";
		    else
		    {
		      double px = (legend.x - plotArea.getX())/plotArea.getWidth();
		      double py = (legend.y - plotArea.getY())/plotArea.getHeight();
		      if(px>=py)
		        pos = "r";
		      else
		        pos = "b";
		    }
		    legendJson.put("legendPos", pos);
		  }
		  json.put("legend", legendJson);
		}
		if(this.graphicPro!=null)
		  json.put("spPr", this.graphicPro.toJson());
			
		return json;
	}
}
