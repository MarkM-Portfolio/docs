package com.ibm.symphony.conversion.service.common.chart.odf2json;

import java.util.List;

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleChartProperties;
import org.odftoolkit.odfdom.dom.element.chart.ChartDataPointElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartDomainElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartSeriesElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;

import com.ibm.symphony.conversion.service.common.chart.Constant;
import com.ibm.symphony.conversion.service.common.chart.ReferenceParser;
import com.ibm.symphony.conversion.service.common.chart.ReferenceParser.ParsedRef;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.ChartDocument;
import com.ibm.symphony.conversion.service.common.chart.DataReference;
import com.ibm.symphony.conversion.service.common.chart.DataSeries;
import com.ibm.symphony.conversion.service.common.chart.LocalTable;
import com.ibm.symphony.conversion.service.common.chart.Plot;
import com.ibm.symphony.conversion.service.common.chart.PlotArea;
import com.ibm.symphony.conversion.service.common.chart.Style;
import com.ibm.symphony.conversion.service.common.chart.Utils;
import com.ibm.symphony.conversion.service.common.chart.Style.Graphic;

public class DataSeriesConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
		OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
		ChartDocument chartDoc = (ChartDocument)context.get("Target");
		
		int seriesIndex = ((Number)context.get("seriesIndex")).intValue()+1;
		context.put("seriesIndex",seriesIndex);
		
		PlotArea plotArea = chartDoc.getPlotArea();
		ChartSeriesElement odfSeries = (ChartSeriesElement)element;
		String chartClass = odfSeries.getChartClassAttribute();
		if(chartClass==null)
			chartClass = chartDoc.getChartClass();
		
		String attachedAxis = odfSeries.getChartAttachedAxisAttribute();
		
		String styleName = odfSeries.getStyleName();
		OdfStyle odfStyle = autoStyles.getStyle(styleName, OdfStyleFamily.Chart);
		
		Plot plot = plotArea.getOrCreatePlot(chartClass, attachedAxis);
		
		DataSeries series = new DataSeries(plot);
		Style.Graphic graPro = Utils.getGraphicProperties(odfStyle);
		series.setGraphicPro(graPro);
		series.setTextPro(Utils.getTextProperties(odfStyle));
		series.setMarkerPro(Utils.getMarkerProperties(odfStyle));
		series.setChartClass(chartClass);
		series.setId("ser"+seriesIndex);
		
		//Add id tag for xml node
		odfSeries.setAttribute("id", "ser"+seriesIndex);
		
		DataReference dataRef = new DataReference();
		String cellRangeAddr = odfSeries.getChartValuesCellRangeAddressAttribute();
		String valueExplicit = odfSeries.getAttribute("chart:values-explicit");
		if(Utils.isArray(valueExplicit))//If independent data is used, don't set ref
			dataRef.setPts(valueExplicit);
		else
		{
			if(cellRangeAddr == null)
			  cellRangeAddr = valueExplicit;//such as named expression			
			
			if(cellRangeAddr != null)
			{
				ParsedRef parseRef = ReferenceParser.parse(cellRangeAddr);
				if(parseRef != null && Constant.LOCAL_TABLE.equals(parseRef.sheetName) && (parseRef.patternMask & ReferenceParser.ABSOLUTE_SHEET) == 0)//local-table
				{
					if(Constant.CELL_REFERENCE.equals(parseRef.type) || Constant.RANGE_REFERENCE.equals(parseRef.type))
					{
						LocalTable table = (LocalTable)context.get("LocalTable");
						List<Object> pts = table.getRangeByRef(parseRef);
						dataRef.setPts(pts);
					}
				}
				else
					dataRef.refValue = cellRangeAddr;
			}
		}
		series.addDataReference(dataRef);			
			
		if(odfSeries.hasAttribute("chart:label-explicit"))
		{
			String seriesName = odfSeries.getAttribute("chart:label-explicit");//Using v and don't use pts for label
			if(Utils.hasValue(seriesName))
				series.setName(seriesName);
		}
		else
		{
			String labelAddr = odfSeries.getChartLabelCellAddressAttribute();			
			if(labelAddr != null)
			{
				ParsedRef parseRef = ReferenceParser.parse(labelAddr);
				if(parseRef != null && Constant.LOCAL_TABLE.equals(parseRef.sheetName) && (parseRef.patternMask & ReferenceParser.ABSOLUTE_SHEET) == 0)//local-table
				{
					if(Constant.CELL_REFERENCE.equals(parseRef.type))
					{
						LocalTable table = (LocalTable)context.get("LocalTable");
						String name = table.getCellByRef(parseRef);
						series.setName(name);
					}
				}
				else
				{
					DataReference labelRef = new DataReference();
					labelRef.refValue = labelAddr;
					series.setLabelReference(labelRef);
				}
			}			
		}
		
		plot.addSeries(series);
		
		context.put("series", series);
		context.put("dataPointIdx", 0);
	}
	
	public void endElement(ConversionContext context)
	{
		context.remove("dataPointIdx");
		context.remove("series");
	}
}

class DomainConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
		DataSeries series = (DataSeries)context.get("series");
		if(series==null)
			return;
		
		ChartDomainElement odfDomain = (ChartDomainElement)element;
		
		DataReference dataRef = new DataReference();
		String cellRangeAddr = odfDomain.getTableCellRangeAddressAttribute();
		String valueExplicit = odfDomain.getAttribute("table:values-explicit");
		if(Utils.isArray(valueExplicit))//If independent data is used, don't set ref
			dataRef.setPts(valueExplicit);
		else
		{
			if(cellRangeAddr == null)
			  cellRangeAddr = valueExplicit;//such as named expression			
			
			if(cellRangeAddr != null)
			{
				ParsedRef parseRef = ReferenceParser.parse(cellRangeAddr);
				if(parseRef != null && Constant.LOCAL_TABLE.equals(parseRef.sheetName) && (parseRef.patternMask & ReferenceParser.ABSOLUTE_SHEET) == 0)//local-table
				{
					if(Constant.CELL_REFERENCE.equals(parseRef.type) || Constant.RANGE_REFERENCE.equals(parseRef.type))
					{
						LocalTable table = (LocalTable)context.get("LocalTable");
						List<Object> pts = table.getRangeByRef(parseRef);
						dataRef.setPts(pts);
					}
				}
				else
					dataRef.refValue = cellRangeAddr;	
			}
		}
		series.addDataReference(dataRef);
	}
}

class DataPointsConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
		DataSeries series = (DataSeries)context.get("series");
		Integer ptIdx = (Integer)context.get("dataPointIdx");
		if(series==null || ptIdx==null)
			return;
		ChartDataPointElement odfPoint = (ChartDataPointElement)element;
		
		Integer repeat = odfPoint.getChartRepeatedAttribute();
		if(repeat==null)
			repeat = 1;
		
		String styleName = odfPoint.getStyleName();
		if(styleName!=null && styleName.length()>0)
		{
			OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
			OdfStyle odfStyle = autoStyles.getStyle(styleName, OdfStyleFamily.Chart);
			Style.Graphic pro = Utils.getGraphicProperties(odfStyle);
			if(pro!=null)
			{
			    series.addDataPoint(ptIdx, pro);
	            for(int i=1;i<repeat;i++)
	                series.addDataPoint(ptIdx+i, pro);
			}
		}
		context.put("dataPointIdx",ptIdx+repeat);
	}
}
