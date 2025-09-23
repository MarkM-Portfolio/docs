package com.ibm.symphony.conversion.service.common.chart.odf2json;

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.chart.ChartLegendElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.ChartDocument;
import com.ibm.symphony.conversion.service.common.chart.Legend;
import com.ibm.symphony.conversion.service.common.chart.Utils;

public class LegendConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
		OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
		ChartDocument chartDoc = (ChartDocument)context.get("Target");
		
		ChartLegendElement odfLegend = (ChartLegendElement)element;
		
		Legend legend = new Legend(null);
		
		String x = odfLegend.getSvgXAttribute();
		if(x!=null)
		  legend.x = Length.parseDouble(x,Unit.PIXEL);
		
		String y = odfLegend.getSvgYAttribute();
		if(y!=null)
          legend.y = Length.parseDouble(y,Unit.PIXEL);
        
		String position = odfLegend.getChartLegendPositionAttribute();
		legend.position = position;
        
		String styleName = odfLegend.getStyleName();
		OdfStyle odfStyle = autoStyles.getStyle(styleName, OdfStyleFamily.Chart);
		legend.textPro = Utils.getTextProperties(odfStyle);
		
		chartDoc.setLegend(legend);
		
	}
}
