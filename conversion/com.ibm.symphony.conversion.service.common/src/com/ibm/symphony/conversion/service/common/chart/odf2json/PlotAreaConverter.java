package com.ibm.symphony.conversion.service.common.chart.odf2json;

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleChartProperties;
import org.odftoolkit.odfdom.dom.element.chart.ChartPlotAreaElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartWallElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.ChartDocument;
import com.ibm.symphony.conversion.service.common.chart.PlotArea;
import com.ibm.symphony.conversion.service.common.chart.Utils;

public class PlotAreaConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
		OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
		ChartDocument chartDoc = (ChartDocument)context.get("Target");
		
		ChartPlotAreaElement odfPlotArea = (ChartPlotAreaElement)element;
		
		PlotArea plotArea = new PlotArea(null);
		
		OdfStyle odfStyle = autoStyles.getStyle(odfPlotArea.getStyleName(),  OdfStyleFamily.Chart);
		if(odfStyle==null)
		{
			chartDoc.setPlotArea(plotArea);
			return;
		}
		
		String x = odfPlotArea.getSvgXAttribute();
		if(x!=null)
		  plotArea.setX(Length.parseDouble(x,Unit.PIXEL));
		
		String y = odfPlotArea.getSvgYAttribute();
		if(y!=null)
		  plotArea.setY(Length.parseDouble(y,Unit.PIXEL));
		
		String w = odfPlotArea.getSvgWidthAttribute();
		if(w!=null)
		  plotArea.setWidth(Length.parseDouble(w,Unit.PIXEL));
		
		String h = odfPlotArea.getSvgHeightAttribute();
		if(h!=null)
		  plotArea.setHeight(Length.parseDouble(h,Unit.PIXEL));
		
		String treatEmptyCell = odfStyle.getProperty(OdfStyleChartProperties.TreatEmptyCells);
		chartDoc.setDisplayBlankAs(treatEmptyCell);
		
		String includeHidden = odfStyle.getProperty(OdfStyleChartProperties.IncludeHiddenCells);
		chartDoc.setPlotVisibleOnly(!(includeHidden!=null && includeHidden.equals("true")));
		
		String source = odfStyle.getProperty(OdfStyleChartProperties.SeriesSource);
		if(source!=null)
			plotArea.setDataSource(source);
		//grouping
		String stacked = odfStyle.getProperty(OdfStyleChartProperties.Stacked);
		if("true".equals(stacked))
			plotArea.setStacked(true);
		String percent = odfStyle.getProperty(OdfStyleChartProperties.Percentage);
		if("true".equals(percent))
			plotArea.setPercent(true);
		
		//bar chart
		String vertical = odfStyle.getProperty(OdfStyleChartProperties.Vertical);
		if("true".equals(vertical))
			plotArea.setVertical(true);
		
		//pie chart
		String angleOffset = odfStyle.getProperty(OdfStyleChartProperties.AngleOffset);
		if(angleOffset!=null)
			plotArea.setFirstSliceAngle(Integer.parseInt(angleOffset));
		
		//line chart or scatter chart
//		String symbolType = odfStyle.getProperty(OdfStyleChartProperties.SymbolType);
//		if(symbolType!=null && !symbolType.equals("none"))
//			plotArea.setMarker(true);
		//smooth
		String interpolation = odfStyle.getProperty(OdfStyleChartProperties.Interpolation);
		if(interpolation!=null)
			plotArea.setSmooth(true);
		
		chartDoc.setPlotArea(plotArea);
	}
}

class WallConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
		OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
		ChartDocument chartDoc = (ChartDocument)context.get("Target");
		
		ChartWallElement odfWall = (ChartWallElement)element;
		String styleName = odfWall.getStyleName();
		if(styleName!=null && styleName.length()>0)
		{
			OdfStyle odfStyle = autoStyles.getStyle(styleName,  OdfStyleFamily.Chart);
			PlotArea plotArea = chartDoc.getPlotArea();
			plotArea.setGraphicPro(Utils.getGraphicProperties(odfStyle));
		}
	}
}
