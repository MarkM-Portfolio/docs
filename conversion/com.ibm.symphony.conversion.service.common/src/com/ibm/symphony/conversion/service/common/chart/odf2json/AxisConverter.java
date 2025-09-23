/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
package com.ibm.symphony.conversion.service.common.chart.odf2json;

import java.util.HashMap;
import java.util.List;

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleChartProperties;
import org.odftoolkit.odfdom.dom.element.chart.ChartAxisElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartCategoriesElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartGridElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.Axis;
import com.ibm.symphony.conversion.service.common.chart.ChartDocument;
import com.ibm.symphony.conversion.service.common.chart.ChartNumberFormat;
import com.ibm.symphony.conversion.service.common.chart.Constant;
import com.ibm.symphony.conversion.service.common.chart.DataReference;
import com.ibm.symphony.conversion.service.common.chart.LocalTable;
import com.ibm.symphony.conversion.service.common.chart.ReferenceParser;
import com.ibm.symphony.conversion.service.common.chart.Utils;
import com.ibm.symphony.conversion.service.common.chart.ReferenceParser.ParsedRef;

public class AxisConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
		OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
		ChartDocument chartDoc = (ChartDocument)context.get("Target");
		
		ChartAxisElement odfAxis = (ChartAxisElement)element;
		
		String styleName = odfAxis.getStyleName();
		
		OdfStyle odfStyle = autoStyles.getStyle(styleName,  OdfStyleFamily.Chart);
		
		Axis axis = new Axis(null);
		context.put("axis", axis);
		
		axis.dimension = odfAxis.getChartDimensionAttribute();
        //ingnor z axis
        if("z".equals(axis.dimension))
          return;
        
		axis.graphicPro = Utils.getGraphicProperties(odfStyle);
		axis.textPro = Utils.getTextProperties(odfStyle);
		axis.id = odfAxis.getChartNameAttribute();
		axis.position = odfAxis.getProperty(OdfStyleChartProperties.AxisPosition);
		
		if(odfStyle!=null)
		{
			String autoRot = odfStyle.getAttribute("style:auto-rotation");
			if(!"true".equals(autoRot))
			{
				String rot = odfAxis.getProperty(OdfStyleChartProperties.RotationAngle);
				if(rot!=null)
				  axis.rotationAngle = Float.valueOf(rot);
			}
			
			String formatName = odfStyle.getAttribute("style:data-style-name");
			if(null != formatName)
			{
			  HashMap<String, ChartNumberFormat> map = (HashMap<String, ChartNumberFormat>)context.get("formats");
			  if(map != null)
			    axis.format = map.get(formatName);
			}
		}
		
		String sourceLinked = odfAxis.getProperty(OdfStyleChartProperties.LinkDataStyleToSource);
	    if("false".equalsIgnoreCase(sourceLinked))
	      axis.sourceLinked = false;
	    
		String visble = odfAxis.getProperty(OdfStyleChartProperties.Visible);
		if("false".equals(visble))
			axis.delete = 1;
		
		String displayLabel = odfAxis.getProperty(OdfStyleChartProperties.DisplayLabel);
		if("false".equals(displayLabel))
          axis.displayLabel = false;
		
		String reverse = odfAxis.getProperty(OdfStyleChartProperties.ReverseDirection);
		if("true".equals(reverse))
			axis.orentation = "maxMin";
		String logar =  odfAxis.getProperty(OdfStyleChartProperties.Logarithmic);
		if("true".equals(logar))
			axis.logBase = 10;
		String majorUnit = odfAxis.getProperty(OdfStyleChartProperties.IntervalMajor);
		if(majorUnit!=null)
			axis.majorUnit = Float.parseFloat(majorUnit);
		String minorCnt = odfAxis.getProperty(OdfStyleChartProperties.IntervalMinorDivisor);
		if(minorCnt!=null)
		{
			if(axis.majorUnit>0)
				axis.minorUnit = axis.majorUnit/Integer.parseInt(minorCnt);
		}
		String max = odfAxis.getProperty(OdfStyleChartProperties.Maximum);
		if(max!=null)
			axis.max = Double.parseDouble(max);
		String min = odfAxis.getProperty(OdfStyleChartProperties.Minimum);
		if(min!=null)
			axis.min = Double.parseDouble(min);
		
		String gapWidth = odfAxis.getProperty(OdfStyleChartProperties.GapWidth);
		if(gapWidth!=null)
			chartDoc.getPlotArea().setGapWidth(Integer.parseInt(gapWidth));
		
		chartDoc.getPlotArea().addAxis(axis);
	}
	
	public void endElement(ConversionContext context)
	{
		context.remove("axis");
	}
}

class CategoryConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
		Axis axis = (Axis)context.get("axis");
		//ingnor z axis
        if("z".equals(axis.dimension))
          return;
        
		ChartCategoriesElement odfCategory = (ChartCategoriesElement)element;
		
		DataReference dataRef = new DataReference();
		String cellRangeAddr = odfCategory.getTableCellRangeAddressAttribute();
		String valueExplicit = odfCategory.getAttribute("chart:label-explicit");
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
		axis.categoriesRef = dataRef;
	}
}

class GridConverter extends Converter
{
	public void startElement(ConversionContext context)
	{
	    Axis axis = (Axis)context.get("axis");
	    //ingnor z axis
        if("z".equals(axis.dimension))
           return;
      
		ChartGridElement odfGrid = (ChartGridElement)element;
		String chartClass = odfGrid.getChartClassAttribute();
		
		OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
		String styleName = odfGrid.getStyleName();
		OdfStyle odfStyle = autoStyles.getStyle(styleName,  OdfStyleFamily.Chart);
		
		if("major".equals(chartClass))
			axis.majorGrid = Utils.getGraphicProperties(odfStyle);
		else if("minor".equals(chartClass))
			axis.minorGrid = Utils.getGraphicProperties(odfStyle);
	}
}
