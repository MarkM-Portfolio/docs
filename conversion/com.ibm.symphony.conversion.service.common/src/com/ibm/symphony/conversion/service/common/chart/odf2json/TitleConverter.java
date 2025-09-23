package com.ibm.symphony.conversion.service.common.chart.odf2json;

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.chart.ChartTitleElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.Axis;
import com.ibm.symphony.conversion.service.common.chart.ChartDocument;
import com.ibm.symphony.conversion.service.common.chart.Title;
import com.ibm.symphony.conversion.service.common.chart.Utils;

public class TitleConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
		OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
		ChartDocument chartDoc = (ChartDocument)context.get("Target");
		
		ChartTitleElement odfTitle = (ChartTitleElement)element;
		Title title = new Title(null);
		String styleName = odfTitle.getStyleName();
		OdfStyle style = autoStyles.getStyle(styleName, OdfStyleFamily.Chart);
		title.textPro = Utils.getTextProperties(style);
		title.text = odfTitle.getTextContent();
		title.strRef = odfTitle.getTableCellRangeAttribute();
		
		Axis axis = (Axis)context.get("axis");
		if(axis!=null)
			axis.title = title;
		else
			chartDoc.setTitle(title);
	}
}
