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

import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.draw.OdfDrawFillImage;
import org.odftoolkit.odfdom.dom.element.draw.DrawGradientElement;
import org.odftoolkit.odfdom.dom.element.style.StyleDrawingPagePropertiesElement;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.presentation.ODPCommonUtil;
import com.ibm.symphony.conversion.presentation.StackableProperties;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.presentation.importodf.AutoColorUtil;
import com.ibm.symphony.conversion.presentation.importodf.css.CSSConvertUtil;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertMapUtil;
import com.ibm.symphony.conversion.service.common.shape2image.ODPConvertStyleMappingUtil;
import com.ibm.symphony.conversion.service.common.util.Measure;

public class DrawFillAttributeConvertor extends AbstractAttributeConvertor
{
  Logger log = Logger.getLogger(DrawFillAttributeConvertor.class.getName());

  public static String CLASS = DrawFillAttributeConvertor.class.toString();

  private static String WHITE_FILL_COLOR = "#ffffff";
  
  static enum DRAW_FILL_VALUE {
    BITMAP, GRADIENT, HATCH, NONE, SOLID;
    public static DRAW_FILL_VALUE toEnum(String str)
    {
      try
      {
        return valueOf(str);
      }
      catch (Exception ex)
      {
        return NONE;
      }
    }
  };

  @SuppressWarnings("restriction")
  @Override
  public void convertAttribute(ConversionContext context, OdfAttribute attr, Map<String, String> styleMap)
  {
    String odfAttrValue = attr.getNodeValue();
    OdfElement element = (OdfElement) context.get(ODPConvertConstants.CONTEXT_CURRENT_ELEMENT);

    String familyValue = CSSConvertUtil.getStyleFamily(element, false);

    boolean insideShape = (Boolean) context.get(ODPConvertConstants.CONTEXT_INSIDE_SHAPE);

    if (insideShape && ODPConvertConstants.HTML_VALUE_GRAPHIC.equals(familyValue))
    {
      return;
    }

    boolean drawingPage = ODPConvertConstants.ODF_STYLE_FAMILY_DRAWING_PAGE.equals(familyValue);

    switch (DRAW_FILL_VALUE.valueOf(odfAttrValue.toUpperCase()))
      {
        case BITMAP :
          convertBitMapAttribute(context, element, attr, (OdfDocument) context.getSource(), styleMap);
          break;
        case GRADIENT :
          setupGradient(context, element, attr, styleMap);
          break;
        case HATCH :
          String colorVal = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR);
          if (colorVal != null)
          {
            styleMap.put(
                (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR),
                colorVal);
            StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);
            if (sp != null)
            {
              sp.addProperty(ODPConvertConstants.HTML_ATTR_PSEUDO_BG_COLOR, colorVal, StackableProperties.Type.ELEMENT, "hatch");
            }
          }
          break;
        case SOLID :
          String colorValue = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR);
          if (colorValue != null)
          {
            styleMap.put((String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get("draw:fill-color"), colorValue);

            // For automatic colors, the drawing page style (top level style used by the master page) will get
            // the main automatic color setting. This works because this is where symphony puts the page color
            // based on the master style and/or page settings. Putting it here reduces the amount of color
            // settings that have to go into the lower level XML elements.
            if (drawingPage)
            {
              styleMap.put(ODPConvertConstants.CSS_FONT_COLOR, AutoColorUtil.getUseWindowFontColor(colorValue));
            }
          }
          break;
        case NONE :
        default:
          if (element instanceof StyleDrawingPagePropertiesElement)
          {
            styleMap.put(ODPConvertConstants.CSS_BACKGROUND_COLOR, WHITE_FILL_COLOR);
            styleMap.put(ODPConvertConstants.CSS_BACKGROUND_POSITION, "0 0");
            styleMap.put(ODPConvertConstants.CSS_BACKGROUND_ATTACHMENT, ODPConvertConstants.CSS_VALUE_SCROLL);
            styleMap.put(ODPConvertConstants.CSS_BACKGROUND_REPEAT, ODPConvertConstants.CSS_VALUE_REPEAT);
            styleMap.put(ODPConvertConstants.CSS_BACKGROUND_IMAGE, ODPConvertConstants.CSS_VALUE_NONE);
          }
          else
          {
            // Must add transparent as none doesn't affect the background color (which oddly may be set in the
            // ODF style). So to override the color, transparent must be set.
            styleMap.put(ODPConvertConstants.CSS_BACKGROUND_COLOR, ODPConvertConstants.CSS_VALUE_TRANSPARENT);
            styleMap.put(ODPConvertConstants.CSS_BACKGROUND_IMAGE, ODPConvertConstants.HTML_VALUE_NONE);
          }
          break;
      }
  }

  @SuppressWarnings("restriction")
  private void convertBitMapAttribute(ConversionContext context, OdfElement element, OdfAttribute attribute, OdfDocument doc,
      Map<String, String> styleMap)
  {
    String imageName = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL_IMAGE_NAME);
    if (imageName != null)
    {
      try
      {
        List<Node> refList = ODPConvertStyleMappingUtil.getDrawNameNodesByKey(context, imageName);
        // ODPConvertUtil.search("draw:name",imageName, doc, "style");
        if (refList != null)
        {
          Node drawNameNode = refList.get(0);
          if (drawNameNode instanceof OdfDrawFillImage)
          {
            OdfDrawFillImage fillImg = (OdfDrawFillImage) drawNameNode;
            if (fillImg != null && fillImg.getDrawNameAttribute().equalsIgnoreCase(imageName))
            {
              String value = "url(\"" + fillImg.getAttribute(ODPConvertConstants.ODF_ATTR_XLINK_HREF) + "\")";
              styleMap.put(ODPConvertConstants.CSS_BACKGROUND_IMAGE, value);
            }
          }
        }
      }
      catch (Exception e)
      {
        String message = ODPCommonUtil.createMessage(ODPCommonUtil.LOG_UNEXPECTED_EXCEPTION_IN, CLASS + ".convert");
        ODPCommonUtil.logException(context, Level.WARNING, message, e);
      }
    }
    String refX = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL_IMAGE_REFX);
    String refY = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL_IMAGE_REFY);

    refX = (refX == null || refX.length() == 0) ? "50%" : refX;
    refY = (refY == null || refY.length() == 0) ? "50%" : refY;

    styleMap.put(ODPConvertConstants.CSS_BACKGROUND_POSITION, refX + " " + refY);

    String repeat = element.getAttribute(ODPConvertConstants.ODF_STYLE_GRAPHIC_REPEAT);
    String repeatOffset = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_TILE_REPEAT_OFFSET);
    String fill_image_width = element.getAttribute("draw:fill-image-width");
    String fill_image_height = element.getAttribute("draw:fill-image-height");
    double width = -1, height = -1;
    if(fill_image_width != null && fill_image_height != null
    		&& fill_image_width.length() > 0
    		&& fill_image_height.length() > 0){
    	width = Measure.extractNumber(fill_image_width);
    	height = Measure.extractNumber(fill_image_height);
    }
    if ((repeatOffset != null && repeatOffset.length() > 0) && (repeat == null || repeat.length() == 0))
    {
      // The default for style:repeat (if not specified) for style:background-image is repeat. So
      // set that value since style:repeat was not already specified.
      styleMap.put(ODPConvertConstants.CSS_BACKGROUND_REPEAT, "repeat");
    }
    
    if ((repeat != null && repeat.equals("stretch")) ||
    		(width == 0 && height == 0))
    {
      // We need to stretch the bitmap to fill the page.  
      // Only supported in IE9+, Firefox 4+, Opera, Chrome, and Safari 5+
      styleMap.put(ODPConvertConstants.CSS_BACKGROUND_SIZE, "cover");
    }

    String colorVal = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR);
    if (colorVal != null)
    {
      styleMap.put((String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR),
          colorVal);
      StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);
      if (sp != null)
      {
        sp.addProperty(ODPConvertConstants.HTML_ATTR_PSEUDO_BG_COLOR, colorVal, StackableProperties.Type.ELEMENT, "bitmap");
      }
    }
  }

  @SuppressWarnings("restriction")
  public static void setupGradient(ConversionContext context, OdfElement element, OdfAttribute attr, Map<String, String> styleMap)
  {

    String gradientName = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL_GRADIENT_NAME);
    if (gradientName != null && gradientName.length() > 0)
    {
      List<Node> gradDef = ODPConvertStyleMappingUtil.getDrawNameNodesByKey(context, gradientName);
      for (int j = 0; gradDef != null && j < gradDef.size(); j++)
      {
        Node gradStyle = gradDef.get(j);
        if (gradStyle instanceof DrawGradientElement)
        {
          DrawGradientElement dge = (DrawGradientElement) gradStyle;

          String colorValue = dge.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_START_COLOR);
          if (colorValue != null && colorValue.length() > 0)
          {
            styleMap.put(
                (String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR),
                colorValue);

            StackableProperties sp = (StackableProperties) context.get(ODPConvertConstants.CONTEXT_STACKABLE_PROPERTIES);
            if (sp != null)
            {
              sp.addProperty(ODPConvertConstants.HTML_ATTR_PSEUDO_BG_COLOR, colorValue, StackableProperties.Type.ELEMENT, gradientName);
            }

            return;
          }
        }
      }
    }

    // no gradient color could be determined try to fall back to the fill color
    String colorValue = element.getAttribute(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR);
    if (colorValue != null && colorValue.length() > 0)
    {
      styleMap.put((String) ODPConvertMapUtil.getJSONMap(ODPConvertMapUtil.MAP_ODF).get(ODPConvertConstants.ODF_ATTR_DRAW_FILL_COLOR),
          colorValue);
    }
  }
}
