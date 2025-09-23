package com.ibm.symphony.conversion.service.common.chart.json2odf;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfChartDocument;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.chart.ChartChartElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.ChartDocument;
import com.ibm.symphony.conversion.service.common.chart.Legend;
import com.ibm.symphony.conversion.service.common.chart.PlotArea;
import com.ibm.symphony.conversion.service.common.chart.Style;
import com.ibm.symphony.conversion.service.common.chart.Title;
import com.ibm.symphony.conversion.service.common.chart.Utils;
import com.ibm.symphony.conversion.service.formulalexer.IDMFormulaLexer;

public class ChartExport 
{
	private static final Logger LOG = Logger.getLogger(ChartExport.class.getName());
	public boolean convert(OdfDocument doc, String draftPath, String chartId, boolean isODFFormula)
	{
	  InputStream in = null;
	  InputStream blankin = null;
	  try
	  {
	    ChartDocument chartDoc = new ChartDocument();
        in = new FileInputStream(draftPath + File.separator + "Charts" + File.separator + chartId + ".js");
        JSONObject content = JSONObject.parse(in);
        if (!isODFFormula)
        {
          IDMFormulaLexer.transOOXMLFormulaToODF(content, "ref");
        }
        chartDoc.loadFromJson(content);
        
        ConversionContext context = new ConversionContext();
        
        context.put("Source", chartDoc);
        context.put("styleIndex", 10);
        context.put("isODFFormula", isODFFormula);
        
        OdfChartDocument chart = (OdfChartDocument)doc.getEmbeddedDocument(chartId);
        boolean isNewCreated = chart==null;
        OdfFileDom dom = null;
        if(isNewCreated)
        {
          blankin = ChartExport.class.getResourceAsStream("blank.ods");
          OdfDocument ods = OdfDocument.loadDocument(blankin);
          chart = (OdfChartDocument)ods.getEmbeddedDocument("Object 1");
        }
        
        context.put("newCreated", isNewCreated);
        dom = chart.getContentDom();
        OdfOfficeAutomaticStyles autoStyles = dom.getAutomaticStyles();
        context.put("styles", autoStyles);
        
        HashMap<String, String> formatStyleMap = new HashMap<String, String>();
        context.put("formatStyleMap", formatStyleMap);
        
        Style.Graphic chartShapePro = chartDoc.getGraphicPro();
        OdfStyle chartOdfStyle = autoStyles.getStyle("ch1", OdfStyleFamily.Chart);
        if(isNewCreated)
        {
        	Utils.mergeGraphicProperties(chartShapePro, chartOdfStyle, null);
        }
        
        Node body = dom.getElementsByTagName("office:body").item(0);
        Node chartNode = body.getFirstChild();
        
        ChartChartElement chartElement = (ChartChartElement)chartNode.getFirstChild();
        context.put("Target", chartElement);
        
        if(!isNewCreated && (chartDoc.getChanges() & 2) > 0)
        	Utils.exportGraphicProperties(chartElement, chartDoc.getGraphicPro(), autoStyles, null);
        
        NodeList nodes = chartElement.getChildNodes();
        for (int i = 0; i < nodes.getLength(); i++)
        {
          Node child = nodes.item(i);
          String nodeName = child.getNodeName();
          if("chart:title".equals(nodeName))
          {
            context.put("ChartTitle", child);
          }
          else if("chart:legend".equals(nodeName))
          {
            context.put("legend", child);
          }
          else if("chart:plot-area".equals(nodeName))
          {
            context.put("plotArea", child);
          }
          else if("table:table".equals(nodeName))
          {
        	 chartElement.removeChild(child);
          }
        }
        
        Legend legend = chartDoc.getLegend();
        new LegendExporter().convert(legend, context);
        
        Title title = chartDoc.getTitle();
        new TitleExporter().convert(title, context);
        
        PlotArea plotArea = chartDoc.getPlotArea();
        new PlotAreaExporter().convert(plotArea, context);
        
        doc.insertDocument(chart, chartId);
        formatStyleMap.clear();
        
	  }
	  catch(Exception e)
	  {
	    LOG.log(Level.SEVERE, "Export chart:" + chartId + " failed", e);
	  }
	  finally
	  {
	    try
	    {
	      if(in!=null)
	        in.close();
	    }
	    catch(Exception e)
	    {
	        LOG.log(Level.SEVERE, "close " + chartId + " failed", e);
	    }
	    try
        {
          if(blankin!=null)
            blankin.close();
        }
        catch(Exception e)
        {
          LOG.log(Level.SEVERE, "close blank odf for chart failed", e);
        }
	  }
	  return true;
	}
}
