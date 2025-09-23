package com.ibm.symphony.conversion.service.common.chart.odf2json;

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.chart.ChartChartElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.ChartDocument;
import com.ibm.symphony.conversion.service.common.chart.Utils;

public class ChartConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
		OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
		ChartDocument chartDoc = (ChartDocument)context.get("Target");
		
		ChartChartElement odfChart = (ChartChartElement)element;
		String chartClass = odfChart.getChartClassAttribute();
		chartDoc.setChartClass(chartClass);
		
		String w = odfChart.getSvgWidthAttribute();
		if(w!=null)
		  chartDoc.setWidth(Length.parseDouble(w,Unit.PIXEL));
		
		String h = odfChart.getSvgHeightAttribute();
		if(h!=null)
		  chartDoc.setHeight(Length.parseDouble(h,Unit.PIXEL));
		
		String styleName = odfChart.getStyleName();
		OdfStyle style = autoStyles.getStyle(styleName, OdfStyleFamily.Chart);
		
		chartDoc.setGraphicPro(Utils.getGraphicProperties(style));
	}
}
