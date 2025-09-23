package com.ibm.symphony.conversion.service.common.chart.odf2json;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.LocalTable;;

public class TableRowConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
		LocalTable localTable = (LocalTable)context.get("LocalTable");
		LocalTable.Row row = new LocalTable.Row();
		localTable.addRow(row);
		this.target = row;
	}
}