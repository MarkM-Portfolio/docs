package com.ibm.symphony.conversion.service.common.chart.json2odf;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleChartProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.dom.element.chart.ChartAxisElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartChartElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartLegendElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartPlotAreaElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartSeriesElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartWallElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.Axis;
import com.ibm.symphony.conversion.service.common.chart.DataSeries;
import com.ibm.symphony.conversion.service.common.chart.Plot;
import com.ibm.symphony.conversion.service.common.chart.PlotArea;
import com.ibm.symphony.conversion.service.common.chart.Style;
import com.ibm.symphony.conversion.service.common.chart.Utils;

public class PlotAreaExporter
{
  public void convert(PlotArea plotArea, ConversionContext context)
  {
    boolean isNewCreated = (Boolean)context.get("newCreated");
    ChartPlotAreaElement odfPlotArea = (ChartPlotAreaElement)context.get("plotArea");
    OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
    
    if(!isNewCreated)
    {
      NodeList nodes = odfPlotArea.getChildNodes();
      Map<String, Node> axisMap = new HashMap<String,Node>();
      Map<String, Node> seriesMap = new HashMap<String,Node>();
      context.put("odfAxis", axisMap);
      context.put("odfSeries", seriesMap);
      for (int i = 0; i < nodes.getLength(); i++)
      {
        Node child = nodes.item(i);
        String nodeName = child.getNodeName();
        if("chart:axis".equals(nodeName))
        {
          ChartAxisElement odfAxis = (ChartAxisElement)child;
          String name = odfAxis.getChartNameAttribute();
          axisMap.put(name, odfAxis);
        }
        else if("chart:series".equals(nodeName))
        {
          ChartSeriesElement odfSeries = (ChartSeriesElement)child;
          String id = odfSeries.getAttribute("id");
          if(id!=null)
            seriesMap.put(id, odfSeries);
        }
      }
      
      if((plotArea.getChanges() & 1) > 0){
    	  ChartWallElement odfWall = null;
    	  NodeList chartwalls = odfPlotArea.getElementsByTagName("chart:wall");
    	  if(chartwalls.getLength() > 0)
    		  odfWall = (ChartWallElement)chartwalls.item(0);
    	  else
    		  odfWall = odfPlotArea.newChartWallElement();
    	  Utils.exportGraphicProperties(odfWall, plotArea.getGraphicPro(), autoStyles, null);
      }
    }
    else
    {
      String dataSource = plotArea.getDataSource();
      odfPlotArea.setProperty(OdfStyleChartProperties.SeriesSource, dataSource);
      
      Boolean stacked = plotArea.getStacked();
      if(stacked!=null && stacked)
        odfPlotArea.setProperty(OdfStyleChartProperties.Stacked, "true");
      
      Boolean percent = plotArea.getPercent();
      if(percent!=null && percent)
        odfPlotArea.setProperty(OdfStyleChartProperties.Percentage, "true");
      
      Boolean vertical = plotArea.getVertical();
      if(vertical!=null && vertical)
        odfPlotArea.setProperty(OdfStyleChartProperties.Vertical, "true");
      
      Integer angle = plotArea.getFirstSliceAngle();
      if(angle!=null)
        odfPlotArea.setProperty(OdfStyleChartProperties.AngleOffset, angle.toString());
      
      Boolean smooth = plotArea.getSmooth();
      if(smooth!=null && smooth)
        odfPlotArea.setProperty(OdfStyleChartProperties.Interpolation, "cubic-spline");
      
      Style.Graphic shapePro = plotArea.getGraphicPro();
      OdfStyle odfStyle = autoStyles.getStyle("ch8", OdfStyleFamily.Chart);
      if(shapePro == null)
      {
    	  odfStyle.setProperty(OdfStyleGraphicProperties.Fill,"solid");
    	  odfStyle.setProperty(OdfStyleGraphicProperties.FillColor, "#ffffff");
      }
      else
    	  Utils.mergeGraphicProperties(shapePro, odfStyle, "#ffffff");
//      if(shapePro!=null && !Utils.hasValue(shapePro.fillColor))
//      {
//    	  odfStyle.setProperty(OdfStyleGraphicProperties.Fill,"none");
//      }
    }
    
    List<Axis> axislist = plotArea.getAxisList();
    for(int i=0;i<axislist.size();i++)
    {
      Axis axis = axislist.get(i);
      new AxisExporter().convert(axis, context);
    }
    
    List<Plot> plots = plotArea.getPlots();
    int index = 0;
    for(int i=0;i<plots.size();i++)
    {
      Plot plot = plots.get(i);
      List<DataSeries> seriesList = plot.getSeriesList();
      for(int j=0;j<seriesList.size();j++)
      {
        DataSeries series = seriesList.get(j);
        series.setIndex(index++);
        new DataSeriesExporter().convert(series, context);
      }
    }
    
    if(!isNewCreated && plotArea.needResetSize())
    {
    	odfPlotArea.removeAttribute("svg:width");
    	odfPlotArea.removeAttribute("svg:height");
    	
    	ChartChartElement chartElement = (ChartChartElement)context.get("Target");
    	NodeList nodes = chartElement.getElementsByTagName("chart:legend");
    	if(nodes.getLength() > 0){
    		ChartLegendElement odflegend = (ChartLegendElement) nodes.item(0);
    		odflegend.removeAttribute("chartooo:height");
			odflegend.removeAttribute("chartooo:width");
    	}
    }    	
  }
}
