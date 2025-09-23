package com.ibm.symphony.conversion.service.common.chart.json2odf;

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.dom.element.chart.ChartChartElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartLegendElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.Legend;
import com.ibm.symphony.conversion.service.common.chart.Style;
import com.ibm.symphony.conversion.service.common.chart.Utils;

public class LegendExporter
{
  public void convert(Legend legend, ConversionContext context)
  {
    ChartChartElement chartElement = (ChartChartElement)context.get("Target");
    boolean isNewCreated = (Boolean)context.get("newCreated");
    ChartLegendElement odflegend = null;
    
    OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");    
    
    if(!isNewCreated)
    {
    	NodeList nodes = chartElement.getElementsByTagName("chart:legend");
    	if(nodes.getLength() > 0)
    		odflegend = (ChartLegendElement) nodes.item(0);
    	
    	if(legend == null)
    	{
    		if(odflegend != null)
    			chartElement.removeChild(odflegend);
    	}
    	else if(odflegend != null)
    	{
    		if((legend.changes & 4) > 0 )
    		{
    			chartElement.removeChild(odflegend);
    			isNewCreated = true;
    		}
    		else
    		{
	    		if((legend.changes & 1) > 0 )
	    		{
	    			legend.chart.resetPloatArea(true); 
	    			if(Utils.hasValue(legend.position)){
	    				odflegend.setChartLegendPositionAttribute(legend.position);
	    				odflegend.removeAttribute("svg:x");
		    			odflegend.removeAttribute("svg:y");
	    			}
	    			else
	    				chartElement.removeChild(odflegend);	    			
	    		}
	    		if((legend.changes & 2) > 0 )
	    		{
	    			Style.Text textPro = legend.textPro;
	    			Utils.exportTextProperties(odflegend, textPro, autoStyles);
	    			if(textPro != null && (textPro.changes & 4) > 0)
	    				legend.chart.resetPloatArea(true); 
	    			
//	    			boolean isClear = textPro == null || (legend.chart != null && (legend.chart.getChanges() & 1) > 0);
//	    			if(!isClear)
//	    				Utils.exportTextProperties(odflegend, textPro, autoStyles);//merge using change flag
//	    			else
//	    			{
//	    				if(textPro == null && legend.chart != null && legend.chart.getTextPro() != null)
//	    					textPro = legend.chart.getTextPro();
//	    				OdfStyle legendStyle = Utils.getOdfStyleWClearTxPr(odflegend, autoStyles);
//	    				Utils.mergeTextProperties(textPro, legendStyle);
//	    			}
	    		}
    		}
    	}
    	else
    		isNewCreated = true;
    }
    
    if(isNewCreated && legend != null && Utils.hasValue(legend.position))
    {
      legend.chart.resetPloatArea(true); 
      OdfStyle legendStyle = autoStyles.getStyle("ch2", OdfStyleFamily.Chart);
      odflegend = chartElement.newChartLegendElement(legend.position, null);
      
      Style.Text textPro = legend.textPro;
      if(textPro == null && legend.chart != null && legend.chart.getTextPro() != null){
    	  textPro = new Style.Text();
    	  textPro.loadFromJson(legend.chart.getTextPro(), null);
      }
      
      NodeList txPrs = legendStyle.getElementsByTagName("style:text-properties");
  	  for(int i = txPrs.getLength() - 1; i >= 0; i--)
  		legendStyle.removeChild(txPrs.item(i));
  	  
      Utils.mergeTextProperties(textPro, legendStyle);
      odflegend.setStyleName("ch2");
    }
    
  }
}
