package com.ibm.symphony.conversion.service.common.chart.json2odf;

import java.util.HashMap;
import java.util.Map;

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.OdfName;
import org.odftoolkit.odfdom.doc.style.OdfStyleChartProperties;
import org.odftoolkit.odfdom.dom.OdfNamespaceNames;
import org.odftoolkit.odfdom.dom.element.chart.ChartAxisElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartCategoriesElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartGridElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartPlotAreaElement;
import org.odftoolkit.odfdom.dom.element.chart.ChartTitleElement;
import org.odftoolkit.odfdom.dom.element.text.TextPElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfStylePropertiesSet;
import org.odftoolkit.odfdom.dom.style.props.OdfStyleProperty;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.chart.Axis;
import com.ibm.symphony.conversion.service.common.chart.ChartDocument;
import com.ibm.symphony.conversion.service.common.chart.DataReference;
import com.ibm.symphony.conversion.service.common.chart.NumFormatHelper;
import com.ibm.symphony.conversion.service.common.chart.Style;
import com.ibm.symphony.conversion.service.common.chart.Title;
import com.ibm.symphony.conversion.service.common.chart.Utils;

public class AxisExporter
{
  public final static OdfStyleProperty AutoRatation =
		OdfStyleProperty.get(OdfStylePropertiesSet.ChartProperties, OdfName.newName(OdfNamespaceNames.STYLE, "auto-rotation"));
	
  public void convert(Axis axis, ConversionContext context)
  {
    ChartPlotAreaElement odfPlotArea = (ChartPlotAreaElement)context.get("plotArea");
    OdfOfficeAutomaticStyles autoStyles = (OdfOfficeAutomaticStyles)context.get("styles");
    
    boolean isNewCreated = (Boolean)context.get("newCreated");
    ChartAxisElement odfAxis = null;

    if(!isNewCreated)
    {
      Map<String, Node> axisMap = (Map<String, Node>)context.get("odfAxis");
      odfAxis = (ChartAxisElement)axisMap.get(axis.getOdfId());
      
      if(odfAxis != null)
      {
    	 if((axis.changes & 1) > 0)
    	 {
    		 Style.Text textPro = axis.textPro;
    		 Utils.exportTextProperties(odfAxis, textPro, autoStyles);
    		 
// 			 boolean isClear = textPro == null || (axis.chart != null && (axis.chart.getChanges() & 1) > 0);
// 			 if(!isClear)
// 				Utils.exportTextProperties(odfAxis, textPro, autoStyles);//merge using change flag
// 			 else
// 			 {
// 				if(textPro == null && axis.chart != null && axis.chart.getTextPro() != null)
// 					textPro = axis.chart.getTextPro();
// 				OdfStyle axisStyle = Utils.getOdfStyleWClearTxPr(odfAxis, autoStyles);
// 				Utils.mergeTextProperties(textPro, axisStyle);
// 			 }
    	 }
    	 if((axis.changes & 2) > 0)
    		 Utils.exportGraphicProperties(odfAxis, axis.graphicPro, autoStyles, null);
    	 if((axis.changes & 4) > 0)
   		 {
    		 ChartTitleElement odfTitle = null;
    		 NodeList nodes = odfAxis.getElementsByTagName("chart:title");
    		 if(nodes.getLength() > 0)
	    		odfTitle = (ChartTitleElement) nodes.item(0);
    		 Title title = axis.title;
    		 if(title == null || !Utils.hasValue(title.text))
    		 {
    			 if(odfTitle != null)
    			 {
    				 odfAxis.removeChild(odfTitle);
    				 if(title != null)
    					 title.chart.resetPloatArea(true);
    			 }
    		 }
    		 else if(odfTitle != null)
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
//	    			Style.Text textPro = title.textPro;
//	    			boolean isClear = textPro == null || (title.chart != null && (title.chart.getChanges() & 2) > 0);
//	    			if(!isClear)
//	    				Utils.exportTextProperties(odfTitle, title.textPro, autoStyles);//merge using change flag
//	    			else
//	    			{
//	    				if(textPro == null && title.chart != null && title.chart.getTextPro() != null)
//	    				{
//	    					textPro = new Style.Text();
//	    					JSONObject chartTxPr = title.chart.getTextPro();
//	    					textPro.loadFromJson(chartTxPr, null);
//	    					if(!textPro.bold && !chartTxPr.containsKey("b"))
//	    				    	  textPro.bold = true;
//	    					textPro.size *= 1.2;
//	    				}
//	    				OdfStyle titleStyle = Utils.getOdfStyleWClearTxPr(odfTitle, autoStyles);
//	    				Utils.mergeTextProperties(textPro, titleStyle);
//	    			}
	    		}
    		 }
    		 else
    			 newTitle4Axis(odfAxis,title, autoStyles);
   		 }
    	 if((axis.changes & 8) > 0)
   		 {
    		 if(axis.max!=null)
    	    	  odfAxis.setProperty(OdfStyleChartProperties.Maximum, String.valueOf(axis.max));
    		 else
    			  odfAxis.removeProperty(OdfStyleChartProperties.Maximum);
    		 
    	      if(axis.min!=null)
    	    	  odfAxis.setProperty(OdfStyleChartProperties.Minimum, String.valueOf(axis.min));
    	      else
    	    	  odfAxis.removeProperty(OdfStyleChartProperties.Minimum);
    	    	  
    	      if(axis.majorUnit>0)
    	      {
    	    	  odfAxis.setProperty(OdfStyleChartProperties.IntervalMajor, String.valueOf(axis.majorUnit));
    	    	  if(axis.minorUnit>0)
    	    	  {
    	    		  int cnt = (int) (axis.majorUnit/axis.minorUnit);
    	    		  odfAxis.setProperty(OdfStyleChartProperties.IntervalMinorDivisor, String.valueOf(cnt));
    	    	  }
    	    	  else
    	    		  odfAxis.removeProperty(OdfStyleChartProperties.IntervalMinorDivisor);
    	      }
    	      else
    	      {
    	    	  odfAxis.removeProperty(OdfStyleChartProperties.IntervalMajor);
    	    	  odfAxis.removeProperty(OdfStyleChartProperties.IntervalMinorDivisor);
    	      }
   		 }
    	 if((axis.changes & 16) > 0)
    	 {
    		 HashMap<String, String> formatStyleMap = (HashMap<String, String>) context.get("formatStyleMap");
    		 Utils.exportNumFormatProperties(odfAxis, axis.format, autoStyles, formatStyleMap);
    	 }
      }
      else
    	  isNewCreated = true;
    }
    
    if(isNewCreated)
    {
      odfAxis = odfPlotArea.newChartAxisElement(axis.dimension);
      odfAxis.setChartNameAttribute(axis.getOdfId());
      
      if("y".equals(axis.dimension))
      {
    	//Grid style is not supported, so we only use the default grid style.
        ChartGridElement grid = odfAxis.newChartGridElement();
        grid.setChartClassAttribute("major");
        grid.setStyleName("ch6");
      }
      OdfStyle style = autoStyles.newStyle(OdfStyleFamily.Chart);
      Utils.mergeGraphicProperties(axis.graphicPro, style, null);
      Style.Text textPro = axis.textPro;
      if(textPro == null && axis.chart != null && axis.chart.getTextPro() != null){
    	  textPro = new Style.Text();
		  textPro.loadFromJson(axis.chart.getTextPro(), null);
      }
      Utils.mergeTextProperties(textPro, style);
      if(axis.format != null)
      {
    	  HashMap<String, String> formatStyleMap = (HashMap<String, String>) context.get("formatStyleMap");
    	  
    	  String formatStyleName = NumFormatHelper.getFormatStyleName(axis.format, style, autoStyles,formatStyleMap);
    	  if(Utils.hasValue(formatStyleName))
    		  style.setStyleDataStyleNameAttribute(formatStyleName);
      }
      odfAxis.setStyleName(style.getStyleNameAttribute());
      
      odfAxis.setProperty(OdfStyleChartProperties.AxisPosition, axis.position);
      if(axis.rotationAngle!=null)
    	  odfAxis.setProperty(OdfStyleChartProperties.RotationAngle, String.valueOf(axis.rotationAngle));
      else
    	  odfAxis.setProperty(AutoRatation,"true");
      
      if(!axis.sourceLinked)
    	  odfAxis.setProperty(OdfStyleChartProperties.LinkDataStyleToSource, "false");
      if(axis.delete==1)
    	  odfAxis.setProperty(OdfStyleChartProperties.Visible, "false");
      if("y".equals(axis.dimension))
      {
    	  ChartDocument chartDoc = (ChartDocument)context.get("Source");
    	  Integer gapWidth = chartDoc.getPlotArea().getGapWidth();
    	  if(gapWidth !=null )
    		  odfAxis.setProperty(OdfStyleChartProperties.GapWidth, String.valueOf(gapWidth));
      }
      
      odfAxis.setProperty(OdfStyleChartProperties.DisplayLabel, String.valueOf(axis.displayLabel));
      
      odfAxis.setProperty(OdfStyleChartProperties.ReverseDirection,"false");
      odfAxis.setProperty(OdfStyleChartProperties.Logarithmic,"false");
      if(axis.max!=null)
    	  odfAxis.setProperty(OdfStyleChartProperties.Maximum, String.valueOf(axis.max));
      if(axis.min!=null)
    	  odfAxis.setProperty(OdfStyleChartProperties.Minimum, String.valueOf(axis.min));
      if(axis.majorUnit>0)
      {
    	  odfAxis.setProperty(OdfStyleChartProperties.IntervalMajor, String.valueOf(axis.majorUnit));
    	  if(axis.minorUnit>0)
    	  {
    		  int cnt = (int) (axis.majorUnit/axis.minorUnit);
    		  odfAxis.setProperty(OdfStyleChartProperties.IntervalMinorDivisor, String.valueOf(cnt));
    	  }
      }
      
      if(axis.title!=null)
    	  newTitle4Axis(odfAxis,axis.title, autoStyles);
    }
    
    if(odfAxis==null)
      return;
    
    ChartCategoriesElement catElement = null;
    NodeList list = odfAxis.getChildNodes();
    {
      for (int i = 0; i < list.getLength(); i++)
      {
        Node child = list.item(i);
        String nodeName = child.getNodeName();
        if("chart:categories".equals(nodeName))
        {
          catElement = (ChartCategoriesElement)child;
        }
      }
    }
    DataReference catRef = axis.categoriesRef;
    if(catRef!=null)
    {
      if(catElement==null)
        catElement = odfAxis.newChartCategoriesElement();
      if(!Utils.hasValue(catRef.refValue))
      {
    	  if(catRef.pts != null)
    	  {
    		  StringBuffer value = new StringBuffer();
    		  value.append("{");
    		  int refLen = catRef.pts.size();  
    		  Object firstPt = (Object)catRef.pts.get(0);
    		  if(firstPt != null && firstPt instanceof JSONArray)//for multi dimensional array category, only get the last one, just a work around
			  {
				  JSONArray ptArray = (JSONArray)catRef.pts.get(refLen - 1);
				  if(ptArray != null)
				  {
					  refLen = ptArray.size();
					  for(int k = 0; k < refLen; k ++)
					  {
						  value.append("\"");
						  value.append(String.valueOf(ptArray.get(k)));
						  value.append("\";");					 
					  }
				  }
				  catRef.pts = Utils.switchPts(catRef.pts);//switch pts for composing local table
			  }
    		  else
    		  {    		  
	    		  for(int j = 0; j < refLen; j++)
	    		  {
	    			  value.append("\"");
					  value.append(String.valueOf(catRef.pts.get(j)));
					  value.append("\";");		    			
	    		  }
    		  }
    		  if(value.length() > 1)
    			  value.deleteCharAt(value.length() - 1);
    		  value.append("}");
    		  catElement.setOdfAttributeValue(OdfName.newName(OdfNamespaceNames.CHART, "label-explicit"), value.toString());
    		  
    	      StringBuffer localRef = new StringBuffer("local-table.$A$2:.$A$");
	    	  localRef.append(String.valueOf(refLen + 1));

    	      LocalTableExporter localTableExporter = (LocalTableExporter)context.get("localTableExporter");
    		  if(localTableExporter == null)
    			  localTableExporter = new LocalTableExporter(context);
    		
    		  String localRefS = localRef.toString();
    		  localTableExporter.converter(catRef.pts, localRefS, true);
    	      catElement.setTableCellRangeAddressAttribute(localRefS);
    	  }
      }
      else
      {
    	  String refStr = Utils.getRef(catRef.refValue);
          if(Utils.hasValue(refStr))
          {
        	  catElement.setTableCellRangeAddressAttribute(refStr);
        	  catElement.removeAttribute("chart:label-explicit");
          }
          else//name expression
        	  catElement.setOdfAttributeValue(OdfName.newName(OdfNamespaceNames.CHART, "label-explicit"), catRef.refValue);
      }      
    }
    else 
    {
      if(catElement!=null)
        odfAxis.removeChild(catElement);
    }
  }
  
  private void newTitle4Axis(ChartAxisElement odfAxis, Title title, OdfOfficeAutomaticStyles autoStyles)
  {
	  title.chart.resetPloatArea(true); 
	  ChartTitleElement odfTitle = odfAxis.newChartTitleElement();
	  OdfStyle titleStyle = autoStyles.newStyle(OdfStyleFamily.Chart);
	  titleStyle.setProperty(OdfStyleTextProperties.FontFamily, "Arial");
	  titleStyle.setProperty(OdfStyleTextProperties.FontSize,"10pt");
	  titleStyle.setProperty(OdfStyleTextProperties.FontSizeAsian,"10pt");
	  titleStyle.setProperty(OdfStyleTextProperties.FontSizeComplex,"10pt");
	  titleStyle.setProperty(OdfStyleTextProperties.FontWeight,"bold");
	  titleStyle.setProperty(OdfStyleTextProperties.FontWeightAsian,"bold");
	  titleStyle.setProperty(OdfStyleTextProperties.FontWeightComplex,"bold");	  
	  
	  if(title.text != null)
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
