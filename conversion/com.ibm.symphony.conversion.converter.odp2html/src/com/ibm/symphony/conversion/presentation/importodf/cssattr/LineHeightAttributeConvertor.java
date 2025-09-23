/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.presentation.importodf.cssattr;

import java.util.Map;

import org.odftoolkit.odfdom.OdfAttribute;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;

/**
 * Convert the fo:line-height values based on whether they are specified in % or cm values.
 * 
 */
public class LineHeightAttributeConvertor extends AbstractAttributeConvertor
{

  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {

    @SuppressWarnings("restriction")
    String odfAttrValue = attr.getNodeValue();
    String value = odfAttrValue;
    double lineHeightpt = 0.0;
	try{
	    if (odfAttrValue.endsWith("%")) // If original attribute value was a % value
	    {
	      // Change the line-height value from % to nothing.
	      value = String.valueOf(Double.parseDouble(odfAttrValue.substring(0, odfAttrValue.length() - 1)) / 100);
	    }
	    else
	    {
	      Measure measure = Measure.parseNumber(odfAttrValue);
	      if (measure.isCMMeasure())
	      {
	        lineHeightpt = measure.getNumber() / 0.035;
	      } else if(measure.isINMeasure()){
	    	  if(measure.convertINToCM()){
	    		  lineHeightpt = measure.getNumber() / 0.035;
	    	  }
	      } else if(measure.isEMMeasure()){
	    	  lineHeightpt = measure.getNumber() / 2.37106301584;
	      } else if(measure.isPTMeasure()){
	    	  lineHeightpt = measure.getNumber();
	      }
	      
	      if(lineHeightpt >=0){
	    	  styleMap.put("pt-"+HtmlCSSConstants.LINE_HEIGHT, String.valueOf(lineHeightpt));
	    	  double parentSize = (Double) context.get(ODPConvertConstants.CONTEXT_PARENT_SIZE);
	          Double curSize = (Double) context.get(ODPConvertConstants.CONTEXT_CURRENT_FONT_SIZE);
	          if (curSize != null && curSize.doubleValue() > 0)
	          {
	            parentSize = curSize.doubleValue();
	          }
	          value = String.valueOf(MeasurementUtil.formatDecimal(lineHeightpt / parentSize));
	      }
	      // Other values (such as "normal") will just be copied as is
	    }
	    // Store the attribute
	    styleMap.put(HtmlCSSConstants.LINE_HEIGHT, String.valueOf(Double.parseDouble(value) * 1.2558));
	    styleMap.put("abs-"+HtmlCSSConstants.LINE_HEIGHT, value);
	} catch (Exception e){
	  e.printStackTrace();
	}
  }
}
