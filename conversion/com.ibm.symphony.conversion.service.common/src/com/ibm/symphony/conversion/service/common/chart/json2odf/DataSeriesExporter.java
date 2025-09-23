package com.ibm.symphony.conversion.service.common.chart.json2odf;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleChartProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.dom.OdfNamespaceNames;
import org.odftoolkit.odfdom.dom.element.chart.ChartChartElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartDataPointElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartDomainElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartPlotAreaElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartSeriesElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.ChartDocument;
import com.ibm.symphony.conversion.service.common.chart.DataReference;
import com.ibm.symphony.conversion.service.common.chart.DataSeries;
import com.ibm.symphony.conversion.service.common.chart.Plot;
import com.ibm.symphony.conversion.service.common.chart.PlotArea;
import com.ibm.symphony.conversion.service.common.chart.Style;
import com.ibm.symphony.conversion.service.common.chart.Theme;
import com.ibm.symphony.conversion.service.common.chart.Utils;

import com.ibm.symphony.conversion.service.common.chart.ReferenceParser;

public class DataSeriesExporter
{
  public void convert(DataSeries series, ConversionContext context)
  {
    OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
    ChartChartElement chartElement = (ChartChartElement)context.get("Target");
    
    ChartPlotAreaElement odfPlotArea = (ChartPlotAreaElement)context.get("plotArea");
    boolean isNewCreated = (Boolean)context.get("newCreated");
    ChartDocument chartDoc = (ChartDocument)context.get("Source");
    PlotArea plotArea = chartDoc.getPlotArea();
    
    ChartSeriesElement odfSeries = null;
    Plot plot = series.getParent();
    int idx = series.getIndex();
    int seriesNum = plotArea.getSeriesNum();
    //clustered column chart is different with others
    boolean isClusteredColumn = "chart:bar".equals(plot.getType()) && !plotArea.getVertical() && !plotArea.getStacked() && !plotArea.getPercent();
    boolean isArea = "chart:area".equals(plot.getType());
    boolean isCircle = "chart:circle".equals(plot.getType());
    
    if(!isClusteredColumn && !isArea)
      idx = seriesNum - idx - 1;
    boolean isLineOrScatter = "chart:line".equals(plot.getType()) || "chart:scatter".equals(plot.getType());
    if(!isNewCreated)
    {
       Map<String, Node> seriesMap = (Map<String, Node>)context.get("odfSeries");
       odfSeries = (ChartSeriesElement)seriesMap.remove(series.getId());
    	
       if(odfSeries != null)
       {
    	   if((series.getChanges() & 4) > 0)
    	   {
    		   String themeColor = null;
    		   if(!isCircle)
    			   themeColor = Theme.colors[idx % Theme.colors.length];
    		  
    		   OdfStyle newStyle = Utils.exportGraphicProperties(odfSeries, series.getGraphicPro(), autoStyles, themeColor);
    		   if(series.getGraphicPro() == null && isLineOrScatter)
    		   {
    			   if(newStyle == null)
    			   {
    				   newStyle = autoStyles.newStyle(OdfStyleFamily.Chart);
    				   odfSeries.setStyleName(newStyle.getStyleNameAttribute());
    			   }
    			   newStyle.setProperty(OdfStyleGraphicProperties.StrokeWidth,"0.05cm");
    		   }
    		   
    		   NodeList nodes = odfSeries.getElementsByTagName("chart:data-point");
    		   int len = nodes.getLength();
			   for(int i=len-1;i>=0;i--)
			   {
				    Node node = nodes.item(i);
				    odfSeries.removeChild(node);
			   }
			   
    		   if(isCircle)
    			   exportDpts4Pie(series, odfSeries, autoStyles);
    	   }
    	   //marker
           if(isLineOrScatter)
           {
        	   String styleName = odfSeries.getStyleName();
       		   OdfStyle style = autoStyles.getStyle(styleName, OdfStyleFamily.Chart);
	           Integer marker = series.getMarker();
	           boolean hasMarker = false;
	           if(marker != null)
	        	   hasMarker = marker.intValue()==1;
	           else
	        	   hasMarker = plot.getMarker();
	           	
	           	if(hasMarker)
	           	{
	           		if(style == null)
	    		    {
	    		    	style = autoStyles.newStyle(OdfStyleFamily.Chart);
	        		    odfSeries.setStyleName(style.getStyleNameAttribute());
	    		    }
	           		String oldSym = style.getProperty(OdfStyleChartProperties.SymbolType);
	           		if(!Utils.hasValue(oldSym) || "none".equals(oldSym))
	           		{
		           		style.setProperty(OdfStyleChartProperties.SymbolType,"automatic");
		           		style.setProperty(OdfStyleChartProperties.SymbolHeight,"0.25cm");
		           		style.setProperty(OdfStyleChartProperties.SymbolWidth,"0.25cm");
	           		}
	           	}
	           	else
	           	{
	           	 if(style != null)
	    		   {
	    			   if(Utils.hasValue(style.getProperty(OdfStyleChartProperties.SymbolType)))
	    				   style.setProperty(OdfStyleChartProperties.SymbolType, "none");
	    			   style.removeProperty(OdfStyleChartProperties.SymbolHeight);
	    			   style.removeProperty(OdfStyleChartProperties.SymbolWidth);
	    		   }
	           	}
           }
       }
       else
    	   isNewCreated = true;
    }
    if(isNewCreated)
    {
      odfSeries = odfPlotArea.newChartSeriesElement();
      odfSeries.setChartClassAttribute(series.getChartClass());
      odfSeries.setChartAttachedAxisAttribute(plotArea.getOdfAxisId(series.getAttachedYAxis()));
      
      OdfStyle style = autoStyles.newStyle(OdfStyleFamily.Chart);
      
      if(chartElement.getChartClassAttribute()==null)
        chartElement.setChartClassAttribute(plot.getType());
      
      if(isCircle)
      {
        //Pie chart need use inversed direction with dojo chart
        OdfStyle axisStyle = autoStyles.getStyle("ch5", OdfStyleFamily.Chart);
        axisStyle.setProperty(OdfStyleChartProperties.ReverseDirection,"true");
        
        odfSeries.setStyleName("ch7");
        exportDpts4Pie(series, odfSeries, autoStyles);
      }
      else
      {
        if(isLineOrScatter)
        {
        	Integer marker = series.getMarker();
        	boolean addMarker = false;
        	if(marker != null)
        		addMarker = marker.intValue()==1;
        	else
        		addMarker = plot.getMarker();
        	
        	if(addMarker)
        	{
        		style.setProperty(OdfStyleChartProperties.SymbolType,"automatic");
        		style.setProperty(OdfStyleChartProperties.SymbolHeight,"0.25cm");
        		style.setProperty(OdfStyleChartProperties.SymbolWidth,"0.25cm");
        	}
        }
        
        String themeColor = Theme.colors[idx % Theme.colors.length];
        Style.Graphic graPro = series.getGraphicPro();
        if(graPro==null)
        {
          style.setProperty(OdfStyleGraphicProperties.FillColor,themeColor);
          if(isLineOrScatter)
            style.setProperty(OdfStyleGraphicProperties.StrokeWidth,"0.05cm");
        }
        else
        {
        	Utils.mergeGraphicProperties(graPro, style, themeColor);
        }
        
        odfSeries.setStyleName(style.getStyleNameAttribute());
      }
    }
    
    if(odfSeries==null)
      return;
    
    int refCount = getRefCount(plot.getType());
    DataReference label = series.getLabelReference();
    odfSeries.removeAttribute("chart:label-cell-address");
    odfSeries.removeAttribute("chart:label-explicit");
    if(label!=null && Utils.hasValue(label.refValue))
    {
        odfSeries.setChartLabelCellAddressAttribute(label.refValue);
    }
    else
    {
		String name = series.getName();
		if (Utils.hasValue(name)) 
		{
			odfSeries.setOdfAttributeValue(OdfName.newName(OdfNamespaceNames.CHART, "label-explicit"), name);
			int sIdx = series.getIndex();
			StringBuffer ref = new StringBuffer("local-table.$");
			ref.append(ReferenceParser.translateCol(sIdx*refCount + 2));
			ref.append("$1");			
			LocalTableExporter localTableExporter = (LocalTableExporter) context.get("localTableExporter");
			if (localTableExporter == null)
				localTableExporter = new LocalTableExporter(context);
			List<Object> nameList = new ArrayList<Object>();
			nameList.add(name);
			String refString = ref.toString();
			localTableExporter.converter(nameList, refString, true);
			odfSeries.setChartLabelCellAddressAttribute(refString);
		}
    }
    
    NodeList nodes = odfSeries.getChildNodes();
    int len = nodes.getLength();
    for(int i=len-1;i>=0;i--)
    {
    	Node node = nodes.item(i);
    	if(node==null)
    		continue;
    	if("chart:domain".equals(node.getNodeName()))
    		odfSeries.removeChild(node);
    }
    List<DataReference> reflist = series.getDataReferences();
    for(int i=0;i<reflist.size();i++)
    {
      DataReference ref = reflist.get(i);
      if(ref == null)
    	  continue;
      if(ref.refValue==null || ref.refValue.length()==0)
      {
    	  int sIdx = series.getIndex();
		  sIdx = sIdx*refCount + i;
		  String col = ReferenceParser.translateCol(sIdx + 2);
		  StringBuffer localRef = new StringBuffer("local-table.$");
		  localRef.append(col);
		  localRef.append("$2");
		  
    	  if(ref.pts != null)
    	  {
    		  StringBuffer value = new StringBuffer();
    		  value.append("{");
    		  int refLen = ref.pts.size();
    		  for(int j = 0; j < refLen; j++)
    		  {
    			  value.append(String.valueOf(ref.pts.get(j)));
    			  value.append(";");
    		  }
    		  if(value.length() > 1)
    			  value.deleteCharAt(value.length() - 1);
    		  value.append("}");
    		  
    		  //compose local table
    		  localRef.append(":.$");
			  localRef.append(col);
			  localRef.append("$");
			  localRef.append(String.valueOf(refLen + 1));
			  String localRefS = localRef.toString();
			  
    		  LocalTableExporter localTableExporter = (LocalTableExporter)context.get("localTableExporter");
    		  if(localTableExporter == null)
    			  localTableExporter = new LocalTableExporter(context);
    		  localTableExporter.converter(ref.pts, localRefS, false);
    		 
    		  if(i == 0)
    		  {
    			  odfSeries.setChartValuesCellRangeAddressAttribute(localRefS);
    			  odfSeries.setOdfAttributeValue(OdfName.newName(OdfNamespaceNames.CHART, "values-explicit"), value.toString());
    			  if("chart:scatter".equals(plot.getType()) && reflist.size() == 1)//for scatter chart, add xval for rendering in open office
    			  {
    				  List<Object> tmpPts = new ArrayList<Object>();
    				  for(int k = 0; k< refLen; k++)
				    	tmpPts.add(k+1);
		    		
		    		  sIdx ++;
		    		  String col1 = ReferenceParser.translateCol(sIdx + 2);
					  StringBuffer localRef1 = new StringBuffer("local-table.$");
					  localRef1.append(col1);
					  localRef1.append("$2:.$");
					  localRef1.append(col1);
					  localRef1.append("$");
					  localRef1.append(String.valueOf(refLen + 1)); 
					  String localRefS1 = localRef1.toString();
					  localTableExporter.converter(tmpPts, localRefS1, false);
					  ChartDomainElement domain = odfSeries.newChartDomainElement();
	    			  domain.setTableCellRangeAddressAttribute(localRefS1);
    			  }
    		  }
    		  else
    		  {
    			  ChartDomainElement domain = odfSeries.newChartDomainElement();
    			  domain.setTableCellRangeAddressAttribute(localRefS);
    			  domain.setOdfAttributeValue(OdfName.newName(OdfNamespaceNames.TABLE, "values-explicit"), value.toString());
    		  }
    	  }
    	  else // there is not ref or cache data, add ref for rendering in open office
    	  {
    		  if(i == 0)
    		  {
    			  odfSeries.setChartValuesCellRangeAddressAttribute(localRef.toString());
    		  }
    		  else
    		  {
    			  ChartDomainElement domain = odfSeries.newChartDomainElement();
    			  domain.setTableCellRangeAddressAttribute(localRef.toString());
    		  }
    	  }
    	  continue;
      }
     
      String refStr = Utils.getRef(ref.refValue);
      
      if(Utils.hasValue(refStr))
      {
	      if(i==0)
	      {
	    	  odfSeries.setChartValuesCellRangeAddressAttribute(refStr);
	    	  odfSeries.removeAttribute("chart:values-explicit");  
	      }
	      else
	      {
	        ChartDomainElement domain = odfSeries.newChartDomainElement();
	        domain.setTableCellRangeAddressAttribute(refStr);
	      }
      }
      else//named expression
      {
    	  if(i == 0)
    		  odfSeries.setOdfAttributeValue(OdfName.newName(OdfNamespaceNames.CHART, "values-explicit"), ref.refValue);
		  else
		  {
			  ChartDomainElement domain = odfSeries.newChartDomainElement();
			  domain.setOdfAttributeValue(OdfName.newName(OdfNamespaceNames.TABLE, "values-explicit"), ref.refValue); 
		  }
      }
    }
  }
  
	private void exportDpts4Pie(DataSeries series, ChartSeriesElement odfSeries, OdfOfficeAutomaticStyles autoStyles)
	{
		Map<Integer, Style.Graphic> pts = series.getDataPoints();
		List<DataReference> reflist = series.getDataReferences();
		int maxKey = 0;
		
		// for pie chart, the reflist.size() should be 1;
		if (reflist != null && reflist.size() == 1)
		{
			DataReference ref = reflist.get(0);
			maxKey = ref.getPtCount();
		}
		Set<Integer> keys = pts.keySet();
		Iterator<Integer> it = keys.iterator();
		while (it.hasNext()) 
		{
			int key = it.next().intValue() + 1;
			if (key > maxKey)
				maxKey = key;
		}
		
		for (int j = 0; j < maxKey; j++)
		{
			String fillColor = Theme.colors[j % Theme.colors.length];

			OdfStyle dpStyle = autoStyles.newStyle(OdfStyleFamily.Chart);
			Style.Graphic graPro = pts.get(j);
			if (graPro == null)
				dpStyle.setProperty(OdfStyleGraphicProperties.FillColor,fillColor);
			else
				Utils.mergeGraphicProperties(pts.get(j), dpStyle, fillColor);

			ChartDataPointElement odfPoint = odfSeries.newChartDataPointElement();
			odfPoint.setChartStyleNameAttribute(dpStyle.getStyleNameAttribute());
		}
  }
  
  private int getRefCount(String type)
  {
	  if("chart:bubble".equalsIgnoreCase(type))
		  return 3;
	  if("chart:scatter".equals(type))
		  return 2;
	  return 1;
  }
}
