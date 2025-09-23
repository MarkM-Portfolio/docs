package com.ibm.symphony.conversion.service.common.chart.odf2json;

import org.w3c.dom.Node;

public class ConverterFactory
{
	private static ConverterFactory instance = new ConverterFactory();

	public static ConverterFactory getInstance()
	{
		return instance;
	}

	public Converter getConverter(Node node)
	{
		String nodeName = node.getNodeName();
		
		if("chart:chart".equals(nodeName))
		{
			return new ChartConverter();
		}
		else if("chart:title".equals(nodeName))
		{
			return new TitleConverter();
		}
		else if("chart:legend".equals(nodeName))
		{
			return new LegendConverter();
		}
		else if("chart:plot-area".equals(nodeName))
		{
			return new PlotAreaConverter();
		}
		else if("chart:axis".equals(nodeName))
		{
			return new AxisConverter();
		}
		else if("chart:categories".equals(nodeName))
		{
			return new CategoryConverter();
		}
		else if("chart:grid".equals(nodeName))
		{
			return new GridConverter();
		}
		else if("chart:series".equals(nodeName))
		{
			return new DataSeriesConverter();
		}
		else if("chart:domain".equals(nodeName))
		{
			return new DomainConverter();
		}
		else if("chart:data-point".equals(nodeName))
		{
			return new DataPointsConverter();
		}
		else if("chart:wall".equals(nodeName))
        {
            return new WallConverter();
        }
		else if("table:table".equals(nodeName))
        {
        	return new LocalTableConverter();
        }
        else if("table:table-row".equals(nodeName))
        {
        	return new TableRowConverter();
        }
        else if("table:table-cell".equals(nodeName))
        {
        	return new TableCellConverter();
        }
		else
			return new Converter();
	}
}
