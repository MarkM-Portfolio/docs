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
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfAttribute;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;

public class MarginPaddingAttributeConverter extends AbstractAttributeConvertor
{
  private static final String CLASS = MarginPaddingAttributeConverter.class.getName();

  private static final Logger log = Logger.getLogger(CLASS);

  @SuppressWarnings("restriction")
public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    String odfAttrName = attr.getNodeName();

    String cssAttrName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(odfAttrName);
    String cssAttrNameReal = "abs-" + cssAttrName;
    if (cssAttrName != null)
    {
      String attrValue = attr.getValue();
      if(attrValue.endsWith("in")){
    	  attrValue = UnitUtil.convertINToCM(attrValue);
    	  attr.setValue(attrValue);
      }
      // First convert the value (or values in the case of fo:margin or fo:padding) to percents
      String cssAttrValue = MeasurementUtil.convertCMToPercentage(attr, context);
      styleMap.put(cssAttrNameReal, attr.getValue());
      // Next, do a sanity check on the results. Ignore anything that contains a value >= 100%. This can happen for example in
      // the case where a graphic style is being imported and it is used in a very tiny graphic. Symphony apparently
      // does not validate this conversion.
      String[] valueList = cssAttrValue.split("\\s+"); // Split by whitespace
      for (String value : valueList)
      {
        double percent_d = Measure.extractNumber(value);

        if (percent_d >= 100)
        {
          if (log.isLoggable(Level.FINE))
          {
            log.fine(cssAttrName + "(" + value + ") exceeds 100% of the container.  Ignoring the attribute.");
          }
          return;
        }
      }

      // Now that we've determined that we have a sane margin or pad, make sure we don't overwrite a previous use of this
      // style that also had a sane value. Note: this won't cover the case where we previously created this style without
      // margin or pad values because they were detected to be invalid, nor the case where we now have bogus values.
      // Regardless, we should at least only have versions of this style which have reasonable (or no) margin and pad values.
      detectAndHandleStyleOverwrite(context, cssAttrName, cssAttrValue, styleMap);
    }
  }
}
