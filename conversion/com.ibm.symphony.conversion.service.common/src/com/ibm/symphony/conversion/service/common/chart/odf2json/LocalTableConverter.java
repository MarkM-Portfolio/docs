package com.ibm.symphony.conversion.service.common.chart.odf2json;



import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.LocalTable;;

public class LocalTableConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
		LocalTable table = new LocalTable();
		context.put("LocalTable", table);
	}
}