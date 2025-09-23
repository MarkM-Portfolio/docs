package com.ibm.symphony.conversion.service.common.chart.odf2json;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.service.common.ConversionContext;

public class Converter
{
	protected Object target;

	protected OdfElement element;

	public void convert(ConversionContext context, Object input, Object output)
	{
		if(input instanceof Text)
		      return;
		target = output;
	    element = (OdfElement) input;
	    startElement(context);
	    convertChildren(context);
	    endElement(context);
	}

	public void convertChildren(ConversionContext context)
	{
		NodeList list = element.getChildNodes();
	    for (int i = 0; i < list.getLength(); i++)
	    {
	      Node child = list.item(i);
	      Converter converter = ConverterFactory.getInstance().getConverter(child);
	      converter.convert(context, child, target);
	    }
	}

	protected void startElement(ConversionContext context)
	{
	}

	protected void endElement(ConversionContext context)
	{
	}
}
