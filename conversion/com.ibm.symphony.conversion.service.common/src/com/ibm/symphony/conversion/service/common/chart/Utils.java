package com.ibm.symphony.conversion.service.common.chart;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleChartProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONArray;
import com.ibm.symphony.conversion.service.common.chart.ReferenceParser.ParsedRef;

public class Utils
{
	private final static Map<String,String> chartTypeMap;
	private final static Map<String,String> r_chartTypeMap;
	private static final Pattern PATTERN_NUMBER = Pattern.compile("^-?\\d+(\\.\\d*)?$");
	private static final Pattern PATTERN_ARRAY = Pattern.compile("^\\{[\\s\\S]*\\}$");
	public final static Random r = new Random();
	private static HashMap<String, VALUETYPE> valueTypes = new HashMap<String, VALUETYPE>();
	private static String[] valueTypeArray = { Constant.BOOLEAN_TYPE, Constant.STRING_TYPE,
		Constant.CURRENCY_TYPE, Constant.DATE_TYPE, Constant.TIME_TYPE, Constant.PERCENTS_TYPE,
		Constant.FLOAT_TYPE,Constant.NUMBERS_TYPE,Constant.FRACTION_TYPE, Constant.SCIENTIFIC_TYPE, Constant.TEXT_TYPE };

	static
	{
		chartTypeMap = new HashMap<String,String>();
		chartTypeMap.put("chart:area", "area");
		chartTypeMap.put("chart:bar", "bar");
		chartTypeMap.put("chart:bubble", "bubble");
		chartTypeMap.put("chart:circle", "pie");
		chartTypeMap.put("chart:line", "line");
		chartTypeMap.put("chart:scatter", "scatter");
		chartTypeMap.put("chart:radar", "radar");
		chartTypeMap.put("chart:filled-radar", "radar");
		chartTypeMap.put("chart:stock", "stock");
		chartTypeMap.put("chart:ring", "doughnut");
		
		r_chartTypeMap = new HashMap<String,String>();
		r_chartTypeMap.put("area","chart:area");
		r_chartTypeMap.put("bar","chart:bar");
		r_chartTypeMap.put("bubble","chart:bubble");
		r_chartTypeMap.put("pie","chart:circle");
		r_chartTypeMap.put("line","chart:line");
		r_chartTypeMap.put("scatter","chart:scatter");
		r_chartTypeMap.put("radar","chart:radar");
		r_chartTypeMap.put("stock","chart:stock");
		r_chartTypeMap.put("doughnut","chart:ring");
		
		int length = valueTypeArray.length;
	    for (int i = 0; i < length; i++)
	    {
	      VALUETYPE type = VALUETYPE.values()[i];
	      valueTypes.put(valueTypeArray[i], type);
	    }
	}
	
	public static String mapChartType2Json(String type)
	{
		String jsonType = chartTypeMap.get(type);
		if(jsonType!=null)
			return jsonType;
		return type;
	}
	
	public static String mapChartTypeFromJson(String type)
    {
        String jsonType = r_chartTypeMap.get(type);
        if(jsonType!=null)
            return jsonType;
        return type;
    }
	
	private final static Set<String> supportedCharts;
	static
	{
		supportedCharts = new HashSet<String>();
		supportedCharts.add("chart:area");
		supportedCharts.add("chart:bar");
		supportedCharts.add("chart:circle");
		supportedCharts.add("chart:line");
		supportedCharts.add("chart:scatter");
	}
	
	public static boolean isSupportedChart(String type)
	{
		return supportedCharts.contains(type);
	}
	
	public static boolean hasValue(String str)
	{
		return str!=null && str.length()>0;
	}
	
	public static Style.Text getTextProperties(OdfStyle odfStyle)
	{
		Style.Text pro = new Style.Text();
		if(odfStyle!=null)
		{
			pro.latin = odfStyle.getProperty(OdfStyleTextProperties.FontFamily);
			pro.asian = odfStyle.getProperty(OdfStyleTextProperties.FontFamilyAsian);
			pro.ctl = odfStyle.getProperty(OdfStyleTextProperties.FontFamilyComplex);

			pro.linethrough = odfStyle.getProperty(OdfStyleTextProperties.TextLineThroughStyle);
			pro.underline = odfStyle.getProperty(OdfStyleTextProperties.TextUnderlineStyle);
			
			String fontSize = odfStyle.getProperty(OdfStyleTextProperties.FontSize);
			if(fontSize != null)
			   pro.size = Length.parseDouble(fontSize, Unit.POINT);
			
			String bold = odfStyle.getProperty(OdfStyleTextProperties.FontWeight);
			pro.bold = "bold".equals(bold);
			
			String italic = odfStyle.getProperty(OdfStyleTextProperties.FontStyle);
			pro.italic = "italic".equals(italic);
			
			pro.color = odfStyle.getProperty(OdfStyleTextProperties.Color);
		}
		
		return pro;
	}
	
	public static void mergeTextProperties(Style.Text txPr, OdfStyle odfStyle)
	{
		if(txPr==null || odfStyle==null)
			return;
		
		if(hasValue(txPr.latin))
			odfStyle.setProperty(OdfStyleTextProperties.FontFamily, txPr.latin);
		
		if(hasValue(txPr.asian))
			odfStyle.setProperty(OdfStyleTextProperties.FontFamilyAsian, txPr.asian);
		
		if(hasValue(txPr.ctl))
		    odfStyle.setProperty(OdfStyleTextProperties.FontFamilyComplex, txPr.ctl);

		if(hasValue(txPr.linethrough))
		   odfStyle.setProperty(OdfStyleTextProperties.TextLineThroughStyle,txPr.linethrough);
		else
		   odfStyle.removeProperty(OdfStyleTextProperties.TextLineThroughStyle);
		
		if(txPr.size>0)
		{
			String sz = txPr.size + Unit.POINT.abbr();
			odfStyle.setProperty(OdfStyleTextProperties.FontSize,sz);
			odfStyle.setProperty(OdfStyleTextProperties.FontSizeAsian,sz);
			odfStyle.setProperty(OdfStyleTextProperties.FontSizeComplex,sz);
		}
		if(txPr.bold)
			odfStyle.setProperty(OdfStyleTextProperties.FontWeight, "bold");
		else
			odfStyle.removeProperty(OdfStyleTextProperties.FontWeight);
		
		if(txPr.italic)
		    odfStyle.setProperty(OdfStyleTextProperties.FontStyle, "italic");
		else
			odfStyle.removeProperty(OdfStyleTextProperties.FontStyle);
		if(hasValue(txPr.color))
		    odfStyle.setProperty(OdfStyleTextProperties.Color, txPr.color);
		else
			odfStyle.removeProperty(OdfStyleTextProperties.Color);
	}
	
	public static void exportTextProperties(OdfStylableElement odfElement, Style.Text txPr, OdfOfficeAutomaticStyles autoStyles)
	{
		String styleName = odfElement.getStyleName();    			
		OdfStyle oldStyle = autoStyles.getStyle(styleName, OdfStyleFamily.Chart);
		if(txPr == null && oldStyle == null)
			;
			//odfElement.removeAttribute("chart:style-name");
		else
		{
			OdfStyle newStyle = newOdfStyle4Merge(oldStyle, autoStyles);
			if(txPr == null)
		    {
		    	NodeList txPrs = newStyle.getElementsByTagName("style:text-properties");
		    	for(int i = txPrs.getLength() - 1; i >= 0; i--)
		    		newStyle.removeChild(txPrs.item(i));
		    }
		    else
		    {
		    	if((txPr.changes & 1) > 0)
		    	{
		    		if(hasValue(txPr.latin))
		    			newStyle.setProperty(OdfStyleTextProperties.FontFamily, txPr.latin);
		    		else
		    			newStyle.removeProperty(OdfStyleTextProperties.FontFamily);
		    		if(hasValue(txPr.asian))
		    			newStyle.setProperty(OdfStyleTextProperties.FontCharsetAsian, txPr.asian);
		    		else
		    			newStyle.removeProperty(OdfStyleTextProperties.FontCharsetAsian);
		    		if(hasValue(txPr.ctl))
		    			newStyle.setProperty(OdfStyleTextProperties.FontCharsetComplex, txPr.ctl);
		    		else
		    			newStyle.removeProperty(OdfStyleTextProperties.FontCharsetComplex);
		    	}
		    	if((txPr.changes & 2) > 0)
		    	{
		    		if(hasValue(txPr.color))
		    			newStyle.setProperty(OdfStyleTextProperties.Color, txPr.color);
		    		else
		    			newStyle.removeProperty(OdfStyleTextProperties.Color);
		    	}
		    	if((txPr.changes & 4) > 0)
		    	{
		    		if(txPr.size>0)
		    		{
		    			String sz = txPr.size + Unit.POINT.abbr();
		    			newStyle.setProperty(OdfStyleTextProperties.FontSize,sz);
		    			newStyle.setProperty(OdfStyleTextProperties.FontSizeAsian,sz);
		    			newStyle.setProperty(OdfStyleTextProperties.FontSizeComplex,sz);
		    		}
		    		else
		    		{
		    			newStyle.removeProperty(OdfStyleTextProperties.FontSize);
		    			newStyle.removeProperty(OdfStyleTextProperties.FontSizeAsian);
		    			newStyle.removeProperty(OdfStyleTextProperties.FontSizeComplex);
		    		}
		    	}
		    	if((txPr.changes & 8) > 0)
		    	{
		    		if(txPr.bold)
		    			newStyle.setProperty(OdfStyleTextProperties.FontWeight, "bold");
		    		else
		    			newStyle.removeProperty(OdfStyleTextProperties.FontWeight);
		    	}
		    	if((txPr.changes & 16) > 0)
		    	{
		    		if(txPr.italic)
		    			newStyle.setProperty(OdfStyleTextProperties.FontStyle, "italic");
		    		else
		    			newStyle.removeProperty(OdfStyleTextProperties.FontStyle);
		    	}
		    }
			odfElement.setStyleName(newStyle.getStyleNameAttribute());
		}
	}
	
	public static OdfStyle exportGraphicProperties(OdfStylableElement odfElement, Style.Graphic spPr, OdfOfficeAutomaticStyles autoStyles, String themeColor)
	{
		String styleName = odfElement.getStyleName();    			
		OdfStyle oldStyle = autoStyles.getStyle(styleName, OdfStyleFamily.Chart);
		OdfStyle newStyle = null;
		if(spPr == null && oldStyle == null && themeColor == null)
			;
			//odfElement.removeAttribute("chart:style-name");
		else
		{
			newStyle = newOdfStyle4Merge(oldStyle, autoStyles);
			if(spPr == null)
		    {
		    	if(themeColor == null)
		    	{
					NodeList spPrs = newStyle.getElementsByTagName("style:graphic-properties");
			    	for(int i = spPrs.getLength() - 1; i >= 0; i--)
			    		newStyle.removeChild(spPrs.item(i));
		    	}
		    	else
		    		newStyle.setProperty(OdfStyleGraphicProperties.FillColor,themeColor);
		    }
			else
			{
				if((spPr.changes & 1) > 0)
		    	{
					if(hasValue(spPr.fill) && !spPr.fill.equals("gradient"))
						newStyle.setProperty(OdfStyleGraphicProperties.Fill, spPr.fill);
					else
						newStyle.removeProperty(OdfStyleGraphicProperties.Fill);
					
					if(!"none".equals(spPr.fill))
					{
						if(hasValue(spPr.fillColor))
							newStyle.setProperty(OdfStyleGraphicProperties.FillColor,spPr.fillColor);
						else if(themeColor!=null)
							newStyle.setProperty(OdfStyleGraphicProperties.FillColor,themeColor);
					}
					else
						newStyle.removeProperty(OdfStyleGraphicProperties.FillColor);				
		    	}
				if((spPr.changes & 2) > 0)
		    	{
					if(hasValue(spPr.stroke))
						newStyle.setProperty(OdfStyleGraphicProperties.Stroke, spPr.stroke);
					else
						newStyle.removeProperty(OdfStyleGraphicProperties.Stroke);
					
					if(!"none".equals(spPr.stroke))
					{
						if(hasValue(spPr.strokeColor))
							newStyle.setProperty(OdfStyleGraphicProperties.StrokeColor,spPr.strokeColor);
						else if(themeColor!=null)
							newStyle.setProperty(OdfStyleGraphicProperties.StrokeColor,themeColor);
					}
					else
						newStyle.removeProperty(OdfStyleGraphicProperties.StrokeColor);
		    	}
				if((spPr.changes & 4) > 0)
		    	{
					if(hasValue(spPr.stroke_width))
						newStyle.setProperty(OdfStyleGraphicProperties.StrokeWidth,spPr.stroke_width);
					else
						newStyle.removeProperty(OdfStyleGraphicProperties.StrokeWidth);
		    	}
			}
			odfElement.setStyleName(newStyle.getStyleNameAttribute());
		}
		return newStyle;
	}
	
	public static void exportNumFormatProperties(OdfStylableElement odfElement, ChartNumberFormat format, OdfOfficeAutomaticStyles autoStyles, HashMap<String, String> formatStyleMap)
	{
		String styleName = odfElement.getStyleName();    			
		OdfStyle oldStyle = autoStyles.getStyle(styleName, OdfStyleFamily.Chart);
		if(format == null && oldStyle == null)
			;
			//odfElement.removeAttribute("chart:style-name");
		else
		{
			OdfStyle newStyle = newOdfStyle4Merge(oldStyle, autoStyles);
			if(format == null)
				newStyle.removeAttribute("style:data-style-name");
			else
			{
				 String formatStyleName = NumFormatHelper.getFormatStyleName(format, newStyle, autoStyles,formatStyleMap);
				 if(hasValue(formatStyleName))
					newStyle.setStyleDataStyleNameAttribute(formatStyleName);
				 else
					newStyle.removeAttribute("style:data-style-name"); 
			}
			odfElement.setStyleName(newStyle.getStyleNameAttribute());
		}
	}
	
	private static OdfStyle newOdfStyle4Merge(OdfStyle odfStyle, OdfOfficeAutomaticStyles autoStyles)
	{
		OdfStyle newStyle = odfStyle;
		if(odfStyle == null || odfStyle.getStyleUserCount() > 1)
			newStyle = autoStyles.newStyle(OdfStyleFamily.Chart);
		if(newStyle != odfStyle && odfStyle != null)
		{
			NodeList styles = odfStyle.getChildNodes();
		    for(int i = 0; i < styles.getLength(); i++)
		    	newStyle.appendChild(styles.item(i).cloneNode(true));
		    
		    NamedNodeMap attributes = odfStyle.getAttributes();
		    if (attributes != null) 
		    {
				for (int i = 0; i < attributes.getLength(); i++) 
				{
					Node item = attributes.item(i);
					String value = item.getNodeValue();
					String name = item.getNodeName();
					if(!name.equals("style:name"))
						newStyle.setAttribute(name, value);
				}
		    }
		}
		return newStyle;
	}		
	
	public static OdfStyle getOdfStyleWClearTxPr(OdfStylableElement odfElement, OdfOfficeAutomaticStyles autoStyles)
	{
		String styleName = odfElement.getStyleName();    			
		OdfStyle oldStyle = autoStyles.getStyle(styleName, OdfStyleFamily.Chart);
		OdfStyle newStyle = newOdfStyle4Merge(oldStyle, autoStyles);
		
		NodeList txPrs = newStyle.getElementsByTagName("style:text-properties");
    	for(int i = txPrs.getLength() - 1; i >= 0; i--)
    		newStyle.removeChild(txPrs.item(i));
		
    	odfElement.setStyleName(newStyle.getStyleNameAttribute());
		return newStyle;
	}
	
	public static Style.Graphic getGraphicProperties(OdfStyle odfStyle)
	{
		Style.Graphic pro = new Style.Graphic();
		if(odfStyle!=null)
		{
			pro.stroke = odfStyle.getProperty(OdfStyleGraphicProperties.Stroke);
			pro.fill = odfStyle.getProperty(OdfStyleGraphicProperties.Fill);
			pro.fillColor = odfStyle.getProperty(OdfStyleGraphicProperties.FillColor);
			pro.strokeColor = odfStyle.getProperty(OdfStyleGraphicProperties.StrokeColor);
			pro.stroke_width = odfStyle.getProperty(OdfStyleGraphicProperties.StrokeWidth);
		}
		
		return pro;
	}
	
	public static void mergeGraphicProperties(Style.Graphic spPr, OdfStyle odfStyle, String themeColor)
	{
		if(spPr==null || odfStyle==null)
			return;
		if(hasValue(spPr.stroke))
			odfStyle.setProperty(OdfStyleGraphicProperties.Stroke, spPr.stroke);
		else
			odfStyle.removeProperty(OdfStyleGraphicProperties.Stroke);
		if(hasValue(spPr.fill) && !spPr.fill.equals("gradient"))
			odfStyle.setProperty(OdfStyleGraphicProperties.Fill, spPr.fill);
		else
			odfStyle.removeProperty(OdfStyleGraphicProperties.Fill);
		
		if(!"none".equals(spPr.fill))
		{
			if(hasValue(spPr.fillColor))
			    odfStyle.setProperty(OdfStyleGraphicProperties.FillColor,spPr.fillColor);
			else if(themeColor!=null)
				odfStyle.setProperty(OdfStyleGraphicProperties.FillColor,themeColor);
		}
		else
			odfStyle.removeProperty(OdfStyleGraphicProperties.FillColor);
		if(!"none".equals(spPr.stroke))
		{
			if(hasValue(spPr.strokeColor))
				odfStyle.setProperty(OdfStyleGraphicProperties.StrokeColor,spPr.strokeColor);
			else if(themeColor!=null)
				odfStyle.setProperty(OdfStyleGraphicProperties.StrokeColor,themeColor);
		}
		else
			odfStyle.removeProperty(OdfStyleGraphicProperties.StrokeColor);
		
		if(hasValue(spPr.stroke_width))
			odfStyle.setProperty(OdfStyleGraphicProperties.StrokeWidth,spPr.stroke_width);
		else
			odfStyle.removeProperty(OdfStyleGraphicProperties.StrokeWidth);
	}
	
	public static Style.Marker getMarkerProperties(OdfStyle odfStyle)
	{
	  if(odfStyle==null)
        return new Style.Marker();
	  
	  Style.Marker pro = new Style.Marker();
	  String symbolType = odfStyle.getProperty(OdfStyleChartProperties.SymbolType);
	  
	  pro.symbolType = symbolType;
	  
	  return pro;
	}
	
	public static String convertPXToINCH(double length)
    {
      String indent = length + Unit.PIXEL.abbr();
      return (Length.parseDouble(indent, Unit.INCH) + Unit.INCH.abbr());
    }
  
    public static String convertPXToCM(double length)
    {
      String indent = length + Unit.PIXEL.abbr();
      return (Length.parseDouble(indent, Unit.CENTIMETER) + Unit.CENTIMETER.abbr());
    } 
    
    public static boolean isNumberic(String v)
    {
      return PATTERN_NUMBER.matcher(v).matches();
    }
    
    public static boolean isArray(String value)
    {
    	return PATTERN_ARRAY.matcher(value).matches();
    }
    // the address might composed by several range address with space as separator
    public static ArrayList<String> getRanges(String address, String separator)
    {
      String sep = "'";
      ArrayList<String> newRanges = new ArrayList<String>();
      if(separator.equals(","))
      { 
    	  if(address.startsWith("(") && address.endsWith(")"))
    		  address = address.substring(1, address.length() - 1);//remove ()
    	  else
    	  {
    		  addRange(newRanges,address);
    		  return newRanges;
    	  }
      }
      String p = "(" + separator + ")+";
      Pattern pattern = Pattern.compile(p);     

      if (hasValue(address))
      {
        StringBuffer partRange = new StringBuffer();
        int count = 0;
        int index = 0;
        Matcher m = pattern.matcher(address);
        while (m.find())
        {
          int start = m.start();
          String range = address.subSequence(index, start).toString();
          index = m.end();
          int n = 0;
          while (true)
          {
            n = range.indexOf(sep, n);
            if (n != -1)
            {
              count++;
              n++;
            }
            else
              break;
          }
          partRange.append(range);
          if (count % 2 == 0)
          {
            addRange(newRanges,partRange.toString());
            partRange = new StringBuffer();
            count = 0;
          }
          else
          {
            partRange.append(address.subSequence(start, index).toString());
          }
        }
        partRange.append(address.subSequence(index, address.length()).toString());// last one
        addRange(newRanges,partRange.toString());
      }

      return newRanges;
    }
    
    private static void addRange(ArrayList<String> ranges, String address)
    {
    	ParsedRef parseRef = ReferenceParser.parse(address);
	   	if(parseRef != null && (Constant.CELL_REFERENCE.equals(parseRef.type) || Constant.RANGE_REFERENCE.equals(parseRef.type)))
	   	{
	   		ranges.add(parseRef.toString());
	   	}
	   	else
	   		ranges.add(address);
    }
    
    public static String getRef(String address)
    {
		List<String> addresses = getRanges(address, ",");
		boolean isRef = false;
		int len = addresses.size();
		for(int i = 0; i< len ; i++)
		{
		   	ParsedRef parseRef = ReferenceParser.parse(addresses.get(i));
		   	if(parseRef != null && (Constant.CELL_REFERENCE.equals(parseRef.type) || Constant.RANGE_REFERENCE.equals(parseRef.type)))
		   	{
		   		isRef = true;
		   		break;
		   	}
		}
		if(isRef)
		{
			if(len > 1)
			{
				StringBuffer refStr = new StringBuffer("");
				int i = 0;
				for( ; i < len - 1; i++)
				{
					refStr.append(addresses.get(i));
					refStr.append(" ");
				}
				refStr.append(addresses.get(i));
				return refStr.toString();
			}
			else
				return address;
		}
    	return null;
    }
    
    //If the axis is multi dimensions, should switch pts before add it to local table 
    public static List<Object> switchPts(List<Object> pts)
    {
    	List<Object> ret = new ArrayList<Object>();
    	int x = pts.size();
    	for(int i = 0; i< x; i ++)
    	{
    		 JSONArray ptArray = (JSONArray)pts.get(i);
    		 int y = ptArray.size();
    		 for(int j = 0; j < y; j++)
    		 {
    			 List<Object> newPtArray;
    			 if(ret.size() <= j)
    			 {
    				  newPtArray = new ArrayList<Object>();
    	  			  ret.add(newPtArray);
    			 }
    			 else
    				 newPtArray =(List<Object>) ret.get(j);
    			 newPtArray.add(ptArray.get(j));
    		 }
    	}
    	return ret;
    }
    
    public static String getStyleName(OdfStyleFamily odfStyleFamily, String prefix)
    {
      if (prefix == null || "".equals(prefix))
      {
        prefix = String.valueOf(odfStyleFamily.getName().charAt(0)).toUpperCase();
      }
      return prefix + "_" + r.nextInt(Integer.MAX_VALUE);
    }
    
    public static enum VALUETYPE {
        BOOLEAN, STRING, CURRENCY, DATE, TIME, PERCENT, FLOAT, NUMBERS, FRACTION, SCIENTIFIC,TEXT;
    }
    
    public static VALUETYPE getValueType(String valueType)
    {
      return valueTypes.get(valueType);
    }
    
    /*
     * Given Concord currency pattern code, get its currency string  
     * @param code	Concord currency pattern code
     * @return 		currency
     */
    public static String getCurrencySymbol (String code) {
      for (int i = 0; i < Constant.CURRENCY_SYMBOL.length; ++i) {
        String cs[] = Constant.CURRENCY_SYMBOL[i];
        if (code.equalsIgnoreCase(cs[0])) {
          return cs[1];
        }
      }
      return null;
    }
    
    public static String getDateTimePattern (String code, String type, boolean bDojoStyle) {
        String pattern = null;
    	if (type.equalsIgnoreCase(Constant.DATE_TYPE)) {
          for (int i = 0; i < DateTimeConstant.DATES.length; ++i) {
            String date[] = DateTimeConstant.DATES[i];
            if (bDojoStyle) {
              if (code.equalsIgnoreCase(date[1])) {
            	  pattern = date[0];
            	  break;
              }
            } else {
              if (code.equalsIgnoreCase(date[0])) { 
            	  pattern = date[1];
            	  break;
              }
            }
          }
//          if (pattern == null) {
//        	  String defaultDate[] = ConversionConstant.DATES[0];
//        	  if (bDojoStyle) pattern = defaultDate[0];
//        	  else pattern = defaultDate[1];
//          }
        }
    	else if (type.equalsIgnoreCase(Constant.TIME_TYPE)) {
          for (int i = 0; i < DateTimeConstant.TIMES.length; ++i) {
            String time[] = DateTimeConstant.TIMES[i];
            if (bDojoStyle) {
              if (code.equalsIgnoreCase(time[1])) {
            	  pattern = time[0];
            	  break;
              }
            } else {
              if (code.equalsIgnoreCase(time[0])) {
                pattern = time[1];
                break;
              }   
            }
          }
//          if (pattern == null) {
//        	  String defaultTime[] = ConversionConstant.TIMES[0];
//        	  if (bDojoStyle) pattern = defaultTime[0];
//        	  else pattern = defaultTime[1];
//          }
        }
    	
        return pattern;
      }
}
