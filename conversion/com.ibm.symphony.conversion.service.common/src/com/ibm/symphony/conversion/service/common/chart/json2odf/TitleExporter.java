package com.ibm.symphony.conversion.service.common.chart.json2odf;

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.element.chart.ChartChartElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartTitleElement;
import org.odftoolkit.odfdom.dom.element.text.TextPElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.Style;
import com.ibm.symphony.conversion.service.common.chart.Title;
import com.ibm.symphony.conversion.service.common.chart.Utils;

public class TitleExporter
{
  public void convert(Title title, ConversionContext context)
  {
	 boolean isNewCreated = (Boolean)context.get("newCreated");
	 ChartChartElement odfChart = (ChartChartElement)context.get("Target");
	 ChartTitleElement odfTitle = null;
	 OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
	 
	 if(!isNewCreated)
	 {
		NodeList nodes = odfChart.getChildNodes();
        for(int i = 0; i < nodes.getLength(); i++)
    	{
        	Node node = nodes.item(i);
        	if(node==null)
        		continue;
        	if("chart:title".equals(node.getNodeName()))
        	{
        		odfTitle = (ChartTitleElement)node;
        		break;
        	}
    	}
    	
    	if(title == null || !Utils.hasValue(title.text))
    	{
    		if(odfTitle != null)
    		{
   			 	odfChart.removeChild(odfTitle);
   			 	if(title != null)
   			 		title.chart.resetPloatArea(true); 
    		}
    	}
    	else if(odfTitle != null)//merge to set
    	{
    		if((title.changes & 1) > 0)
    		{
    			TextPElement textP = null;
    			NodeList textPs = odfTitle.getElementsByTagName("text:p");
    			if(textPs.getLength() > 0)
    				textP = (TextPElement)textPs.item(0);
    			else 
    				textP = odfTitle.newTextPElement();
    			textP.setTextContent(title.text);
    		}
    		if((title.changes & 2) > 0)
    		{
    			Utils.exportTextProperties(odfTitle, title.textPro, autoStyles);
    			if(title.textPro != null && (title.textPro.changes & 4) > 0)
    				title.chart.resetPloatArea(true); 
//    			Style.Text textPro = title.textPro;
//    			boolean isClear = textPro == null || (title.chart != null && (title.chart.getChanges() & 1) > 0);
//    			if(!isClear)
//    				Utils.exportTextProperties(odfTitle, title.textPro, autoStyles);//merge using change flag
//    			else
//    			{
//    				if(textPro == null && title.chart != null && title.chart.getTextPro() != null)
//    				{
//    					Style.Text chartTxPr = title.chart.getTextPro();
//    					textPro = new Style.Text(chartTxPr);
//    					textPro.size *= 1.2;
//    				}
//    				OdfStyle titleStyle = Utils.getOdfStyleWClearTxPr(odfTitle, autoStyles);
//    				Utils.mergeTextProperties(textPro, titleStyle);
//    			}
    		}
    	}
    	else//new created title
    		isNewCreated = true;
	 }		 
	 if(isNewCreated && title != null && Utils.hasValue(title.text))
     {
		title.chart.resetPloatArea(true); 
		
		OdfStyle titleStyle = autoStyles.newStyle(OdfStyleFamily.Chart);
		//Docs default font
		titleStyle.setProperty(OdfStyleTextProperties.FontFamily, "Arial");
		titleStyle.setProperty(OdfStyleTextProperties.FontSize,"18pt");
		titleStyle.setProperty(OdfStyleTextProperties.FontSizeAsian,"18pt");
		titleStyle.setProperty(OdfStyleTextProperties.FontSizeComplex,"18pt");
		titleStyle.setProperty(OdfStyleTextProperties.FontWeight,"bold");
		titleStyle.setProperty(OdfStyleTextProperties.FontWeightAsian,"bold");
		titleStyle.setProperty(OdfStyleTextProperties.FontWeightComplex,"bold");
		
		odfTitle = odfChart.newChartTitleElement();
		if (title.text != null)
			odfTitle.newTextPElement().setTextContent(title.text);
		
		Style.Text textPro = title.textPro;
		if(textPro == null && title.chart != null && title.chart.getTextPro() != null)
		{
			textPro = new Style.Text();
			JSONObject chartTxPr = title.chart.getTextPro();
			textPro.loadFromJson(chartTxPr, null);
			if(!textPro.bold && !chartTxPr.containsKey("b"))
		    	  textPro.bold = true;
			textPro.size *= 1.2;
		}
		Utils.mergeTextProperties(textPro, titleStyle);
		odfTitle.setStyleName(titleStyle.getStyleNameAttribute());
    }
  }
}
