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
import org.odftoolkit.odfdom.doc.style.OdfStyleGraphicProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyleTextProperties;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.StackableProperties;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.util.Measure;
import com.ibm.symphony.conversion.service.common.util.MeasurementUtil;
import com.ibm.symphony.conversion.service.common.util.UnitUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;

import com.ibm.json.java.JSONObject;

import org.w3c.dom.Node;

public class GeneralAttributeConvertor extends AbstractAttributeConvertor
{
  // private static final String CLASS = GeneralAttributeConvertor.class.getName();
  //
  // private static final Logger LOG = Logger.getLogger(CLASS);

  private final static String ZERO_POINT = "0pt";

  private final static String ONE_EM = "1.000em";

  private final static String FILL_COLOR_ATTRIBUTE = OdfStyleGraphicProperties.FillColor.toString();

  private final static String USE_WINDOW_FONT_COLOR_ATTRIBUTE = OdfStyleTextProperties.UseWindowFontColor.toString();

  @SuppressWarnings({ "restriction" })
  @Override
  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    String odfAttrName = attr.getNodeName();
    
    //D33916: [Regression]IE10] Redundant text frame show for imported ppt title placeholder.
    //min-width and min-height will make IE show a redundant text frame around text p.
    if(odfAttrName==OdfStyleGraphicProperties.MinHeight.toString()||odfAttrName==OdfStyleGraphicProperties.MinWidth.toString()){
    	return;	
    }
    if(odfAttrName==OdfStyleGraphicProperties.MaxHeight.toString()||odfAttrName==OdfStyleGraphicProperties.MaxWidth.toString()){
    	return;	
    }
    String value = attr.getNodeValue();

    // A Zero Point font causes problems for the corrective font-size logic in HTML, so negate its effects
    if (odfAttrName.equals(ODPConvertConstants.ODF_ATTR_FONT_SIZE) && value.equals(ZERO_POINT))
    {
      value = ONE_EM; // Set this to EMs to avoid the MeasurementUtil from undoing our change
    }

    StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);

    if (odfAttrName.equals(USE_WINDOW_FONT_COLOR_ATTRIBUTE))
    {
      Node elle = (Node) context.get(ODPConvertConstants.CONTEXT_CURRENT_ELEMENT);

      if (sp != null)
      {
        sp.addProperty(ODPConvertConstants.CSS_USE_WINDOW_FONT_COLOR, value, StackableProperties.Type.ELEMENT,
            CSSConvertUtil.getStyleName(elle, context));
      }
    }

    JSONObject attrMapping = null;
    String cssAttrName = (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(odfAttrName);
    JSONObject attrMap = ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF_ATTR);

    if (FILL_COLOR_ATTRIBUTE.equals(odfAttrName))
    {
      return;
    }

    if ((attrMapping = (JSONObject) attrMap.get(odfAttrName)) != null)
    {
      value = (String) attrMapping.get(value);// if need translate the odf value into html value.
    }
    else if (ODPConvertConstants.CSS_FONT_FAMILY.equals(cssAttrName))
    {
      // This is a fix to replace an unsupported font 'Helv' with a real font family.
      if (ODPConvertConstants.FONT_FAMILY_HELV.equals(value))
      {
        value = ODPConvertConstants.FONT_FAMILY_HELVETICA;
      }

      if (sp != null)
      {
        sp.addProperty(ODPConvertConstants.CSS_FONT_FAMILY, value, StackableProperties.Type.ELEMENT, null);
      }
    }
    else
    {
      Measure measure = Measure.parseNumber(value);
      if (measure != null && (measure.isPTMeasure() || measure.isCMMeasure() || measure.isINMeasure()))
      {

        value = MeasurementUtil.convertCMToPercentage(attr, context);

        if (ODPConvertConstants.CSS_FONT_SIZE.equals(cssAttrName) && sp != null)
        {
          String fontsize = Double.toString(measure.getNumber());
          if(measure.getUnit().equalsIgnoreCase("in")){
        	  fontsize = UnitUtil.convertINToPT(fontsize);
        	  fontsize = fontsize.replace("pt", "");
          }
          sp.addProperty(ODPConvertConstants.CSS_FONT_SIZE, fontsize, StackableProperties.Type.ELEMENT, null);
        }
      }
    }

    if (cssAttrName != null && value != null)
    {
    	
      if (ODPConvertConstants.CSS_FONT_SIZE.equals(cssAttrName)){
    	  String abs_font_size = "abs-" + cssAttrName;
    	  String fontSize = attr.getValue();
    	  if(fontSize.endsWith("in")){
    		  fontSize = UnitUtil.convertINToPT(fontSize);
    	  }
    	  styleMap.put(abs_font_size, fontSize);
      }
      
      if(ODPConvertConstants.CSS_TEXT_INDENT.equals(cssAttrName)){
      	String abs_text_indent = "abs-" + cssAttrName;
      	String indent = attr.getValue();
      	if(indent.endsWith("in")){
      		indent = UnitUtil.convertINToCM(indent);
      	}
    	styleMap.put(abs_text_indent, indent);
      }
      	
    	
      if (HtmlCSSConstants.LINE_HEIGHT.equals(cssAttrName) && value.endsWith("%"))
      {
        // change the line-height value from % to nothing.
        value = String.valueOf(Double.parseDouble(value.substring(0, value.length() - 1)) / 100);
      }

      // Handle Hidden Slides by changing visibility from hidden to visible (and elsewhere, by setting hideInSlideShow="true")
      else if (cssAttrName.equals(ODPConvertConstants.CSS_ATTR_VISIBILITY))
      {
        value = ODPConvertConstants.CSS_VALUE_VISIBLE;
      }
      // TODO - In a future release when background-size is fully supported by our supported browser list add this....
      // else if (odfAttrName.equals(ODPConvertConstants.ODF_STYLE_GRAPHIC_REPEAT) && odfAttrValue.equals("stretch"))
      // { // FF4+ and IE9+ support background-size. This is equivalent to stretch.
      // styleMap.put(HtmlCSSConstants.BACKGROUND_SIZE, "contain");
      // }
      if (!ODPConvertConstants.CSS_FONT_SIZE.equals(cssAttrName))
      detectAndHandleStyleOverwrite(context, cssAttrName, value, styleMap);
    }
  }

}
